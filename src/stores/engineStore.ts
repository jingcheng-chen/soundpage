import { create } from 'zustand'

interface EngineState {
  isInitializing: boolean
  isReady: boolean
  isFirstLoad: boolean
  isMobileUnsupported: boolean
  backend: 'webgpu' | 'wasm' | null
  loadingStatus: string
  loadingProgress: number
  error: string | null

  // Actions
  setInitializing: (initializing: boolean) => void
  setReady: (ready: boolean) => void
  setFirstLoad: (firstLoad: boolean) => void
  setMobileUnsupported: (unsupported: boolean) => void
  setBackend: (backend: 'webgpu' | 'wasm') => void
  setLoadingStatus: (status: string) => void
  setLoadingProgress: (progress: number) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  isInitializing: false,
  isReady: false,
  isFirstLoad: false,
  isMobileUnsupported: false,
  backend: null as 'webgpu' | 'wasm' | null,
  loadingStatus: '',
  loadingProgress: 0,
  error: null as string | null,
}

export const useEngineStore = create<EngineState>((set) => ({
  ...initialState,

  setInitializing: (initializing) => set({ isInitializing: initializing }),
  setReady: (ready) => set({ isReady: ready }),
  setFirstLoad: (firstLoad) => set({ isFirstLoad: firstLoad }),
  setMobileUnsupported: (unsupported) => set({ isMobileUnsupported: unsupported }),
  setBackend: (backend) => set({ backend }),
  setLoadingStatus: (status) => set({ loadingStatus: status }),
  setLoadingProgress: (progress) => set({ loadingProgress: progress }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}))
