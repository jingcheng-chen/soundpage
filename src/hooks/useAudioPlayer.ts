import { useCallback } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useSessionStore } from '@/stores/sessionStore'
import { getStreamingPlayer } from '@/lib/audio/streamingPlayer'
import { createAudioBlob } from '@/lib/tts'

export function useAudioPlayer() {
  const {
    duration,
    currentTime,
    isPlaying,
    generation,
  } = useAudioStore()
  const { currentSession } = useSessionStore()

  const player = getStreamingPlayer()

  const play = useCallback(() => {
    player.play()
  }, [player])

  const pause = useCallback(() => {
    player.pause()
  }, [player])

  const togglePlayPause = useCallback(() => {
    player.togglePlayPause()
  }, [player])

  const seek = useCallback((time: number) => {
    player.seek(time)
  }, [player])

  const seekRelative = useCallback(
    (delta: number) => {
      const newTime = Math.max(0, Math.min(duration, currentTime + delta))
      player.seek(newTime)
    },
    [duration, currentTime, player]
  )

  const download = useCallback(() => {
    const fullBuffer = player.getFullBuffer()
    if (!fullBuffer) return

    // Create WAV blob from the full buffer using the actual sample rate
    const sampleRate = player.getSampleRate()
    const blob = createAudioBlob(fullBuffer, sampleRate)

    // Generate meaningful filename
    let baseName = 'soundpage-audio'
    if (currentSession?.fileName) {
      // Use original filename without extension
      baseName = currentSession.fileName.replace(/\.[^/.]+$/, '')
    } else if (currentSession?.name) {
      // Use session name (first 50 chars of text), sanitize for filename
      baseName = currentSession.name
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 50)
        .toLowerCase()
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${baseName}.wav`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [player, currentSession])

  return {
    duration,
    currentTime,
    isPlaying,
    isGenerating: generation.isGenerating,
    isStreamingComplete: generation.isStreamingComplete,
    play,
    pause,
    togglePlayPause,
    seek,
    seekRelative,
    download,
  }
}
