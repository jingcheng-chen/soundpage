import { create } from 'zustand'

export interface TextChunk {
  text: string
  startTime: number
  endTime: number
  index: number
}

interface TextSyncState {
  chunks: TextChunk[]
  originalText: string

  // Actions
  setChunks: (chunks: TextChunk[], originalText: string) => void
  addChunk: (text: string, duration: number) => void
  reset: () => void
  getChunkAtTime: (time: number) => TextChunk | null
  getWordAtTime: (time: number) => { chunkIndex: number; wordIndex: number; word: string } | null
}

const SILENCE_GAP = 0.3 // seconds between chunks

export const useTextSyncStore = create<TextSyncState>((set, get) => ({
  chunks: [],
  originalText: '',

  setChunks: (chunks, originalText) => set({ chunks, originalText }),

  addChunk: (text, duration) => {
    const { chunks } = get()
    const lastChunk = chunks[chunks.length - 1]
    const startTime = lastChunk ? lastChunk.endTime + SILENCE_GAP : 0
    const endTime = startTime + duration

    set({
      chunks: [
        ...chunks,
        {
          text,
          startTime,
          endTime,
          index: chunks.length,
        },
      ],
    })
  },

  reset: () => set({ chunks: [], originalText: '' }),

  getChunkAtTime: (time) => {
    const { chunks } = get()
    for (const chunk of chunks) {
      if (time >= chunk.startTime && time < chunk.endTime) {
        return chunk
      }
    }
    // If past all chunks, return the last one
    if (chunks.length > 0 && time >= chunks[chunks.length - 1].endTime) {
      return chunks[chunks.length - 1]
    }
    return chunks[0] || null
  },

  getWordAtTime: (time) => {
    const { chunks } = get()

    // Find active chunk
    let activeChunk: TextChunk | null = null
    for (const chunk of chunks) {
      if (time >= chunk.startTime && time < chunk.endTime) {
        activeChunk = chunk
        break
      }
    }

    if (!activeChunk) return null

    // Estimate word position based on character ratio
    const words = activeChunk.text.split(/\s+/)
    if (words.length === 0) return null

    const chunkDuration = activeChunk.endTime - activeChunk.startTime
    const timeIntoChunk = time - activeChunk.startTime
    const progress = timeIntoChunk / chunkDuration

    // Calculate word position based on character count
    const totalChars = activeChunk.text.length
    const charPosition = Math.floor(progress * totalChars)

    let charCount = 0
    for (let i = 0; i < words.length; i++) {
      charCount += words[i].length + 1 // +1 for space
      if (charCount > charPosition) {
        return {
          chunkIndex: activeChunk.index,
          wordIndex: i,
          word: words[i],
        }
      }
    }

    return {
      chunkIndex: activeChunk.index,
      wordIndex: words.length - 1,
      word: words[words.length - 1],
    }
  },
}))
