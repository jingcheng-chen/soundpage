import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

export interface Session {
  id: string
  name: string // first 50 chars of text or filename
  text: string
  fileName?: string
  fileType?: string // e.g., "txt", "pdf"
  originalFile?: Blob // store the uploaded file blob
  createdAt: number
  updatedAt: number
  audioBlob?: Blob // generated audio (can be large)
}

interface SoundPageDB extends DBSchema {
  sessions: {
    key: string
    value: Session
    indexes: { 'by-updated': number }
  }
}

const DB_NAME = 'soundpage-db'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<SoundPageDB> | null = null

export async function getDB(): Promise<IDBPDatabase<SoundPageDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<SoundPageDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore('sessions', { keyPath: 'id' })
      store.createIndex('by-updated', 'updatedAt')
    },
  })

  return dbInstance
}

export async function getAllSessions(): Promise<Session[]> {
  const db = await getDB()
  const sessions = await db.getAllFromIndex('sessions', 'by-updated')
  // Return in reverse order (most recent first)
  return sessions.reverse()
}

export async function getSession(id: string): Promise<Session | undefined> {
  const db = await getDB()
  return db.get('sessions', id)
}

export async function createSession(session: Session): Promise<void> {
  const db = await getDB()
  await db.add('sessions', session)
}

export async function updateSession(id: string, updates: Partial<Session>): Promise<void> {
  const db = await getDB()
  const session = await db.get('sessions', id)
  if (!session) throw new Error(`Session ${id} not found`)

  const updated = {
    ...session,
    ...updates,
    updatedAt: Date.now(),
  }
  await db.put('sessions', updated)
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('sessions', id)
}

export async function clearAllSessions(): Promise<void> {
  const db = await getDB()
  await db.clear('sessions')
}

export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function generateSessionName(text: string, fileName?: string): string {
  if (fileName) {
    return fileName.slice(0, 50)
  }
  // Use first 50 chars of text, trimmed and cleaned
  const cleaned = text.trim().replace(/\s+/g, ' ').slice(0, 50)
  return cleaned || 'Untitled'
}

export function getFileExtension(fileName: string): string | undefined {
  const parts = fileName.split('.')
  if (parts.length > 1) {
    return parts.pop()?.toLowerCase()
  }
  return undefined
}

// Asset cache for offline support
interface AssetCacheDB extends DBSchema {
  assets: {
    key: string
    value: {
      url: string
      data: string // JSON stringified data
      cachedAt: number
    }
  }
  binaryAssets: {
    key: string
    value: {
      url: string
      data: ArrayBuffer
      contentType: string
      cachedAt: number
    }
  }
}

const ASSET_CACHE_DB_NAME = 'soundpage-asset-cache'
const ASSET_CACHE_DB_VERSION = 2

let assetCacheInstance: IDBPDatabase<AssetCacheDB> | null = null

async function getAssetCacheDB(): Promise<IDBPDatabase<AssetCacheDB>> {
  if (assetCacheInstance) return assetCacheInstance

  assetCacheInstance = await openDB<AssetCacheDB>(ASSET_CACHE_DB_NAME, ASSET_CACHE_DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('assets', { keyPath: 'url' })
      }
      if (oldVersion < 2) {
        db.createObjectStore('binaryAssets', { keyPath: 'url' })
      }
    },
  })

  return assetCacheInstance
}

/**
 * Fetch JSON with IndexedDB caching for offline support.
 * Tries cache first, falls back to network, and caches successful fetches.
 */
export async function fetchJsonWithCache<T>(url: string): Promise<T> {
  const db = await getAssetCacheDB()

  // Try cache first
  const cached = await db.get('assets', url)
  if (cached) {
    try {
      return JSON.parse(cached.data) as T
    } catch {
      // Invalid cache data, will fetch from network
    }
  }

  // Fetch from network
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }

  const data = await response.json()

  // Cache the result
  try {
    await db.put('assets', {
      url,
      data: JSON.stringify(data),
      cachedAt: Date.now(),
    })
  } catch (e) {
    // Caching failed, but we have the data - continue
    console.warn('Failed to cache asset:', url, e)
  }

  return data as T
}

/**
 * Fetch binary file with IndexedDB caching for offline support.
 * Tries cache first, falls back to network, and caches successful fetches.
 */
export async function fetchBinaryWithCache(url: string): Promise<ArrayBuffer> {
  const db = await getAssetCacheDB()

  // Try cache first
  const cached = await db.get('binaryAssets', url)
  if (cached) {
    return cached.data
  }

  // Fetch from network
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }

  const data = await response.arrayBuffer()
  const contentType = response.headers.get('content-type') || 'application/octet-stream'

  // Cache the result
  try {
    await db.put('binaryAssets', {
      url,
      data,
      contentType,
      cachedAt: Date.now(),
    })
  } catch (e) {
    console.warn('Failed to cache binary asset:', url, e)
  }

  return data
}

/**
 * Check if all assets are already cached
 */
export async function areAssetsCached(): Promise<boolean> {
  const db = await getAssetCacheDB()
  const jsonCount = await db.count('assets')
  const binaryCount = await db.count('binaryAssets')
  // We have 10 voice styles + 3 config files = 13 JSON files
  // Plus 10 voice .wav files = 10 binary files
  return jsonCount >= 13 && binaryCount >= 10
}

/**
 * Pre-cache all assets for offline support.
 * This includes all voice styles (JSON + WAV) and ONNX config files.
 */
export async function preCacheAllAssets(
  onProgress?: (current: number, total: number, file: string) => void
): Promise<void> {
  const db = await getAssetCacheDB()

  // All JSON files that need to be cached
  const jsonAssets = [
    // ONNX config files
    '/assets/onnx/tts.json',
    '/assets/onnx/unicode_indexer.json',
    '/assets/onnx/config.json',
    // Voice styles (F1-F5, M1-M5)
    '/assets/voice_styles/F1.json',
    '/assets/voice_styles/F2.json',
    '/assets/voice_styles/F3.json',
    '/assets/voice_styles/F4.json',
    '/assets/voice_styles/F5.json',
    '/assets/voice_styles/M1.json',
    '/assets/voice_styles/M2.json',
    '/assets/voice_styles/M3.json',
    '/assets/voice_styles/M4.json',
    '/assets/voice_styles/M5.json',
  ]

  // All binary files (WAV) that need to be cached
  const binaryAssets = [
    '/assets/voice_styles/F1.wav',
    '/assets/voice_styles/F2.wav',
    '/assets/voice_styles/F3.wav',
    '/assets/voice_styles/F4.wav',
    '/assets/voice_styles/F5.wav',
    '/assets/voice_styles/M1.wav',
    '/assets/voice_styles/M2.wav',
    '/assets/voice_styles/M3.wav',
    '/assets/voice_styles/M4.wav',
    '/assets/voice_styles/M5.wav',
  ]

  const total = jsonAssets.length + binaryAssets.length
  let cached = 0

  // Cache JSON assets
  for (const url of jsonAssets) {
    const existing = await db.get('assets', url)
    if (existing) {
      cached++
      onProgress?.(cached, total, url)
      continue
    }

    try {
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        await db.put('assets', {
          url,
          data: JSON.stringify(data),
          cachedAt: Date.now(),
        })
      }
    } catch (e) {
      console.warn('Failed to pre-cache JSON asset:', url, e)
    }

    cached++
    onProgress?.(cached, total, url)
  }

  // Cache binary assets (WAV files)
  for (const url of binaryAssets) {
    const existing = await db.get('binaryAssets', url)
    if (existing) {
      cached++
      onProgress?.(cached, total, url)
      continue
    }

    try {
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.arrayBuffer()
        const contentType = response.headers.get('content-type') || 'audio/wav'
        await db.put('binaryAssets', {
          url,
          data,
          contentType,
          cachedAt: Date.now(),
        })
      }
    } catch (e) {
      console.warn('Failed to pre-cache binary asset:', url, e)
    }

    cached++
    onProgress?.(cached, total, url)
  }
}
