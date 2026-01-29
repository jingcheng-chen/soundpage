import { create } from 'zustand'
import {
  type Session,
  getAllSessions,
  getSession,
  createSession as dbCreateSession,
  updateSession as dbUpdateSession,
  deleteSession as dbDeleteSession,
  generateSessionId,
  generateSessionName,
  getFileExtension,
} from '../lib/db'

interface SessionState {
  sessions: Session[]
  currentSessionId: string | null
  currentSession: Session | null
  isLoading: boolean

  // Actions
  loadSessions: () => Promise<void>
  createSession: (text: string, file?: File) => Promise<string>
  loadSession: (id: string) => Promise<void>
  updateCurrentSession: (updates: Partial<Session>) => Promise<void>
  deleteSession: (id: string) => Promise<void>
  clearCurrentSession: () => void
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  currentSession: null,
  isLoading: false,

  loadSessions: async () => {
    set({ isLoading: true })
    try {
      const sessions = await getAllSessions()
      set({ sessions, isLoading: false })
    } catch (error) {
      console.error('Failed to load sessions:', error)
      set({ isLoading: false })
    }
  },

  createSession: async (text, file) => {
    const id = generateSessionId()
    const now = Date.now()

    let fileName: string | undefined
    let fileType: string | undefined
    let originalFile: Blob | undefined

    if (file) {
      fileName = file.name
      fileType = getFileExtension(file.name)
      originalFile = file
    }

    const session: Session = {
      id,
      name: generateSessionName(text, fileName),
      text,
      fileName,
      fileType,
      originalFile,
      createdAt: now,
      updatedAt: now,
    }

    await dbCreateSession(session)

    set((state) => ({
      sessions: [session, ...state.sessions],
      currentSessionId: id,
      currentSession: session,
    }))

    return id
  },

  loadSession: async (id) => {
    set({ isLoading: true })
    try {
      const session = await getSession(id)
      if (session) {
        set({
          currentSessionId: id,
          currentSession: session,
          isLoading: false,
        })
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      console.error('Failed to load session:', error)
      set({ isLoading: false })
    }
  },

  updateCurrentSession: async (updates) => {
    const { currentSessionId, currentSession } = get()
    if (!currentSessionId || !currentSession) return

    try {
      await dbUpdateSession(currentSessionId, updates)

      const updatedSession = {
        ...currentSession,
        ...updates,
        updatedAt: Date.now(),
      }

      set((state) => ({
        currentSession: updatedSession,
        sessions: state.sessions.map((s) =>
          s.id === currentSessionId ? updatedSession : s
        ),
      }))
    } catch (error) {
      console.error('Failed to update session:', error)
    }
  },

  deleteSession: async (id) => {
    try {
      await dbDeleteSession(id)

      const { currentSessionId } = get()
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== id),
        currentSessionId: currentSessionId === id ? null : currentSessionId,
        currentSession: currentSessionId === id ? null : state.currentSession,
      }))
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  },

  clearCurrentSession: () => {
    set({
      currentSessionId: null,
      currentSession: null,
    })
  },
}))

export type { Session }
