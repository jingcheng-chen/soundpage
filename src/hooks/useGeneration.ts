import { useCallback } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useDocumentStore } from '@/stores/documentStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useTextSyncStore } from '@/stores/textSyncStore'
import { getTTSEngine, type TTSConfig } from '@/lib/tts'
import { getStreamingPlayer } from '@/lib/audio/streamingPlayer'

export function useGeneration() {
  const { text: documentText } = useDocumentStore()
  const { currentSession } = useSessionStore()
  // Prefer session text over document text
  const text = currentSession?.text || documentText
  const { voice, language, speed, totalSteps } = useSettingsStore()
  const {
    generation,
    startGeneration,
    updateProgress,
    finishGeneration,
    setGenerationError,
    setGenerationMeta,
    setDuration,
    setCurrentTime,
    setIsPlaying,
  } = useAudioStore()
  const { addChunk: addTextChunk, reset: resetTextSync } = useTextSyncStore()

  const generate = useCallback(async () => {
    if (!text.trim()) {
      setGenerationError('No text to generate')
      return
    }

    const engine = getTTSEngine()
    if (!engine.isInitialized()) {
      setGenerationError('Engine not ready')
      return
    }

    // Reset the streaming player and text sync
    const player = getStreamingPlayer()
    player.reset()
    resetTextSync()

    // Set up state change listener
    player.setOnStateChange((state) => {
      setCurrentTime(state.currentTime)
      setDuration(state.duration)
      setIsPlaying(state.isPlaying)
    })

    startGeneration()
    const startTime = performance.now()

    try {
      const config: TTSConfig = {
        voice,
        language,
        speed,
        totalSteps,
      }

      let isFirstChunk = true

      await engine.generateStreaming(
        text,
        config,
        async (chunk) => {
          // Add chunk to the streaming player
          await player.addChunk({
            buffer: chunk.audioBuffer,
            duration: chunk.duration,
            sampleRate: chunk.sampleRate,
          })

          // Add chunk text for sync/highlighting
          addTextChunk(chunk.text, chunk.duration)

          // Auto-play when first chunk is ready
          if (isFirstChunk) {
            isFirstChunk = false
            player.play()
          }

          // Mark complete if last chunk
          if (chunk.isLast) {
            player.markComplete()
          }
        },
        (progress) => {
          updateProgress(progress)
        }
      )

      setGenerationMeta({
        voice,
        language,
        steps: totalSteps,
        generationTime: performance.now() - startTime,
      })
      finishGeneration()
    } catch (err) {
      if (err instanceof Error && err.message === 'Generation cancelled') {
        player.markComplete()
        finishGeneration()
      } else {
        const message = err instanceof Error ? err.message : 'Generation failed'
        setGenerationError(message)

        // Check if this was a WebGPU failure - trigger automatic reinitialization
        if (engine.hasWebGPUFailure()) {
          console.warn('WebGPU failure detected, triggering WASM reinitialization...')
          // The reinitialization will be handled by useEngine hook
          // The error message already tells the user to try again
        }
      }
    }
  }, [
    text,
    voice,
    language,
    speed,
    totalSteps,
    startGeneration,
    updateProgress,
    finishGeneration,
    setGenerationError,
    setGenerationMeta,
    setDuration,
    setCurrentTime,
    setIsPlaying,
    addTextChunk,
    resetTextSync,
  ])

  const cancel = useCallback(() => {
    const engine = getTTSEngine()
    engine.cancel()
  }, [])

  return {
    isGenerating: generation.isGenerating,
    progress: generation.progress,
    error: generation.error,
    generate,
    cancel,
  }
}
