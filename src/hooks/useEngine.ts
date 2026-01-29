import { useCallback, useRef } from 'react'
import { useEngineStore } from '@/stores/engineStore'
import { getTTSEngine } from '@/lib/tts'

const MODELS_LOADED_KEY = 'soundpage-models-loaded'

/**
 * Check if we're on a mobile device
 */
function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

/**
 * Check if device has enough memory (rough estimate)
 * Mobile Safari typically has 1-2GB limit for web content
 * Our models need ~500MB+ when loaded
 */
function hasEnoughMemory(): boolean {
  // Check deviceMemory API (Chrome/Edge only, not Safari)
  if ('deviceMemory' in navigator) {
    const memory = (navigator as any).deviceMemory as number
    // Need at least 4GB for comfortable operation
    if (memory < 4) return false
  }

  // On mobile, assume not enough memory
  if (isMobileDevice()) {
    return false
  }

  return true
}

export function useEngine() {
  const {
    isInitializing,
    isReady,
    isFirstLoad,
    isMobileUnsupported,
    backend,
    loadingStatus,
    loadingProgress,
    error,
    setInitializing,
    setReady,
    setFirstLoad,
    setMobileUnsupported,
    setBackend,
    setLoadingStatus,
    setLoadingProgress,
    setError,
  } = useEngineStore()

  // Use a ref to prevent multiple initialization calls
  const initializingRef = useRef(false)
  const initializedRef = useRef(false)

  const initialize = useCallback(async () => {
    // Prevent multiple initialization attempts
    if (initializingRef.current || initializedRef.current) return

    initializingRef.current = true
    setInitializing(true)
    setError(null)

    // Check for mobile device BEFORE loading models
    if (isMobileDevice() || !hasEnoughMemory()) {
      setMobileUnsupported(true)
      setInitializing(false)
      initializingRef.current = false
      return
    }

    // Check if this is the first time loading models
    const hasLoadedBefore = localStorage.getItem(MODELS_LOADED_KEY) === 'true'
    setFirstLoad(!hasLoadedBefore)

    try {
      const engine = getTTSEngine()
      await engine.initialize((status, progress) => {
        setLoadingStatus(status)
        setLoadingProgress(progress)
      })

      setBackend(engine.getBackend())
      setReady(true)
      initializedRef.current = true

      // Mark models as loaded for future visits
      if (!hasLoadedBefore) {
        localStorage.setItem(MODELS_LOADED_KEY, 'true')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize'
      setError(message)
      console.error('Engine initialization failed:', err)
      // Don't set initializedRef to true on error so user can retry
    } finally {
      setInitializing(false)
      initializingRef.current = false
    }
  }, [setInitializing, setReady, setFirstLoad, setMobileUnsupported, setBackend, setLoadingStatus, setLoadingProgress, setError])

  return {
    isInitializing,
    isReady,
    isFirstLoad,
    isMobileUnsupported,
    backend,
    loadingStatus,
    loadingProgress,
    error,
    initialize,
  }
}
