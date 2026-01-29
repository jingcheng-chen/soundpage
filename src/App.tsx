import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from '@/components/Sidebar'
import { LandingPage } from '@/components/LandingPage'
import { ContentPage } from '@/components/ContentPage'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useEngine } from '@/hooks/useEngine'
import { useSessionStore } from '@/stores/sessionStore'
import { useDocumentStore } from '@/stores/documentStore'
import { useAudioStore } from '@/stores/audioStore'
import { fadeIn } from '@/lib/motion'

type ViewState = 'loading' | 'landing' | 'content'

export default function App() {
  const { isReady, isMobileUnsupported, initialize } = useEngine()
  const {
    currentSessionId,
    loadSessions,
    createSession,
    loadSession,
    clearCurrentSession,
  } = useSessionStore()
  const { setText } = useDocumentStore()
  const { clearAudio } = useAudioStore()

  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Initialize engine and load sessions on mount
  useEffect(() => {
    initialize()
    loadSessions()
  }, [initialize, loadSessions])

  // Determine current view
  const getViewState = (): ViewState => {
    // Show loading screen for mobile unsupported (it will display the message)
    if (isMobileUnsupported) return 'loading'
    if (!isReady) return 'loading'
    if (currentSessionId) return 'content'
    return 'landing'
  }

  const viewState = getViewState()

  // Automatic sidebar behavior based on view changes
  useEffect(() => {
    // Keep it closed when transitioning between views on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [viewState])

  // Handle new session creation from landing page
  const handleSubmit = useCallback(
    async (text: string, file?: File) => {
      // Also update document store for generation hook compatibility
      setText(text)
      await createSession(text, file)
    },
    [createSession, setText]
  )

  // Handle session selection from sidebar
  const handleSelectSession = useCallback(
    async (id: string) => {
      clearAudio()
      await loadSession(id)
      const session = useSessionStore.getState().currentSession
      if (session) {
        setText(session.text)
      }
    },
    [loadSession, setText, clearAudio]
  )

  // Handle new session button
  const handleNewSession = useCallback(() => {
    clearCurrentSession()
    clearAudio()
    setText('')
  }, [clearCurrentSession, clearAudio, setText])

  // Handle back from content page
  const handleBack = useCallback(() => {
    clearCurrentSession()
    clearAudio()
    setText('')
  }, [clearCurrentSession, clearAudio, setText])

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Loading screen overlay */}
      <AnimatePresence>
        {viewState === 'loading' && <LoadingScreen key="loading" />}
      </AnimatePresence>

      {/* Main app */}
      {viewState !== 'loading' && (
        <>
          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={toggleSidebar}
            onNewSession={handleNewSession}
            onSelectSession={handleSelectSession}
          />

          {/* Main content */}
          <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              {viewState === 'landing' && (
                <motion.div
                  key="landing"
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex-1 flex"
                >
                  <LandingPage onSubmit={handleSubmit} onToggleSidebar={toggleSidebar} />
                </motion.div>
              )}

              {viewState === 'content' && (
                <motion.div
                  key="content"
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex-1 min-h-0 flex flex-col overflow-hidden"
                >
                  <ContentPage
                    onToggleSidebar={toggleSidebar}
                    onBack={handleBack}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </>
      )}
    </div>
  )
}
