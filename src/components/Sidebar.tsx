import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, FileText, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSessionStore, type Session } from '@/stores/sessionStore'
import { easing, duration } from '@/lib/motion'
import logo from '/favicon.svg'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onNewSession: () => void
  onSelectSession: (id: string) => void
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

function SessionItem({
  session,
  isActive,
  onSelect,
  onDelete,
}: {
  session: Session
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const hasFile = !!session.fileName

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={cn(
        'sidebar-item group',
        isActive && 'active'
      )}
      onClick={onSelect}
    >
      <div className="flex-shrink-0">
        {hasFile ? (
          <FileText size={18} strokeWidth={2} />
        ) : (
          <MessageSquare size={18} strokeWidth={2} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-semibold truncate leading-tight">{session.name}</p>
        <p className="text-[11px] opacity-60 font-medium">{formatDate(session.updatedAt)}</p>
      </div>
      <button
        className={cn(
          'flex-shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100',
          'text-text-tertiary hover:text-error hover:bg-error/10',
          'transition-all duration-[--duration-fast]'
        )}
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        aria-label="Delete session"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  )
}

export function Sidebar({ isOpen, onClose, onNewSession, onSelectSession }: SidebarProps) {
  const { sessions, currentSessionId, deleteSession } = useSessionStore()

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/5 backdrop-blur-sm z-[100] md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        variants={{
          open: {
            width: 260,
            x: 0,
            opacity: 1,
            display: 'block',
            transition: { duration: duration.normal, ease: easing.easeOutExpo },
          },
          closed: {
            width: 0,
            x: -260,
            opacity: 0,
            transitionEnd: { display: 'none' },
            transition: { duration: duration.fast, ease: easing.easeIn },
          },
        }}
        className={cn(
          "flex-shrink-0 h-full overflow-hidden z-[101]",
          "fixed md:relative inset-y-0 left-0",
          "bg-white/70 backdrop-blur-xl border-r border-border"
        )}
      >
        <div className="flex flex-col h-full w-[260px]">
          {/* Header - Brand/Logo Area */}
          <div className="flex-shrink-0 px-6 pt-8 pb-4">
            <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={onNewSession}>
              <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center text-white hover:shadow-lg">
                <img src={logo} alt="Logo" />
              </div>
              <h1 className="text-h1 font-bold tracking-tight">SoundPage</h1>
            </div>

            <button
              onClick={() => {
                onNewSession()
                // Auto-close on mobile when starting something new
                if (window.innerWidth < 768) onClose()
              }}
              className={cn(
                'w-full btn-secondary btn-accent-subtle font-bold py-2.5',
                'active:scale-[0.98]'
              )}
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>New Session</span>
            </button>
          </div>

          {/* Navigation Label */}
          <div className="px-6 py-2">
            <span className="text-caption text-text-tertiary">Recent Sessions</span>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto pt-2">
            <AnimatePresence mode="popLayout">
              {sessions.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-body-sm text-text-tertiary px-8 py-4 italic"
                >
                  No sessions yet.
                </motion.p>
              ) : (
                sessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === currentSessionId}
                    onSelect={() => {
                      onSelectSession(session.id)
                      // Auto-close on mobile when selecting
                      if (window.innerWidth < 768) onClose()
                    }}
                    onDelete={() => deleteSession(session.id)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-6 py-6 mt-auto border-t border-border/40">
            <div className="flex flex-col gap-0.5 opacity-40">
              <p className="text-[10px] font-bold tracking-widest uppercase">Version 0.1.2</p>
              <p className="text-[11px] font-medium tracking-tight">
                hosted on{' '}
                <a
                  className="text-accent hover:underline"
                  href="https://ywt.ch"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ywt.ch
                </a>
              </p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
