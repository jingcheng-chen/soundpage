import { create } from 'zustand'
import { parseFile } from '@/lib/fileParser'

interface DocumentState {
  text: string
  isFromFile: boolean
  fileName: string | null

  // Computed
  characterCount: number

  // Actions
  setText: (text: string) => void
  loadFile: (file: File) => Promise<void>
  clear: () => void
}

const MAX_CHARACTERS = 50000

export const useDocumentStore = create<DocumentState>((set) => ({
  text: '',
  isFromFile: false,
  fileName: null,
  characterCount: 0,

  setText: (text) => {
    const trimmed = text.slice(0, MAX_CHARACTERS)
    set({
      text: trimmed,
      characterCount: trimmed.length,
      isFromFile: false,
      fileName: null,
    })
  },

  loadFile: async (file) => {
    try {
      const text = await parseFile(file)
      const trimmed = text.slice(0, MAX_CHARACTERS)
      set({
        text: trimmed,
        characterCount: trimmed.length,
        isFromFile: true,
        fileName: file.name,
      })
    } catch (error) {
      console.error('Failed to load file:', error)
      throw error instanceof Error ? error : new Error('Failed to read file')
    }
  },

  clear: () => {
    set({
      text: '',
      characterCount: 0,
      isFromFile: false,
      fileName: null,
    })
  },
}))

export { MAX_CHARACTERS }
