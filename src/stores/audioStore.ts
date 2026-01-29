import { create } from 'zustand'
import { getStreamingPlayer } from '@/lib/audio/streamingPlayer'
import { getTTSEngine } from '@/lib/tts'
import { useTextSyncStore } from '@/stores/textSyncStore'

export interface GenerationProgress {
  step: number
  totalSteps: number
  chunk: number
  totalChunks: number
  percentage: number
}

interface AudioState {
  duration: number
  currentTime: number
  isPlaying: boolean

  generation: {
    isGenerating: boolean
    isStreamingComplete: boolean
    progress: GenerationProgress | null
    error: string | null
  }

  generationMeta: {
    voice: string
    language: string
    steps: number
    generationTime: number
  } | null

  // Actions
  setGenerationMeta: (meta: AudioState['generationMeta']) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setIsPlaying: (playing: boolean) => void
  startGeneration: () => void
  updateProgress: (progress: GenerationProgress) => void
  setGenerationError: (error: string) => void
  finishGeneration: () => void
  markStreamingComplete: () => void
  clearAudio: () => void
  reset: () => void
}

const initialState = {
  duration: 0,
  currentTime: 0,
  isPlaying: false,
  generation: {
    isGenerating: false,
    isStreamingComplete: true,
    progress: null as GenerationProgress | null,
    error: null as string | null,
  },
  generationMeta: null as AudioState['generationMeta'],
}

export const useAudioStore = create<AudioState>((set) => ({
  ...initialState,

  setGenerationMeta: (meta) => set({ generationMeta: meta }),

  setCurrentTime: (time) => set({ currentTime: time }),

  setDuration: (duration) => set({ duration }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  startGeneration: () =>
    set({
      generation: {
        isGenerating: true,
        isStreamingComplete: false,
        progress: null,
        error: null,
      },
    }),

  updateProgress: (progress) =>
    set((state) => ({
      generation: {
        ...state.generation,
        progress,
      },
    })),

  setGenerationError: (error) =>
    set({
      generation: {
        isGenerating: false,
        isStreamingComplete: true,
        progress: null,
        error,
      },
    }),

  finishGeneration: () =>
    set((state) => ({
      generation: {
        ...state.generation,
        isGenerating: false,
        isStreamingComplete: true,
      },
    })),

  markStreamingComplete: () =>
    set((state) => ({
      generation: {
        ...state.generation,
        isStreamingComplete: true,
      },
    })),

  clearAudio: () => {
    // Cancel any ongoing generation
    const engine = getTTSEngine()
    engine.cancel()

    // Stop and reset the streaming player
    const player = getStreamingPlayer()
    player.reset()

    // Reset text sync
    useTextSyncStore.getState().reset()

    set({
      duration: 0,
      currentTime: 0,
      isPlaying: false,
      generationMeta: null,
      generation: {
        isGenerating: false,
        isStreamingComplete: true,
        progress: null,
        error: null,
      },
    })
  },

  reset: () => {
    // Cancel any ongoing generation
    const engine = getTTSEngine()
    engine.cancel()

    // Stop and reset the streaming player
    const player = getStreamingPlayer()
    player.reset()

    // Reset text sync
    useTextSyncStore.getState().reset()

    set(initialState)
  },
}))
