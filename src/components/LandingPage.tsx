import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, Upload, FileText, Loader2, PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InputToggle } from './InputToggle'
import { scaleIn, easing, duration } from '@/lib/motion'
import {
  parseFile,
  isSupportedFile,
  ACCEPTED_FILE_TYPES,
  SUPPORTED_FORMATS_TEXT,
} from '@/lib/fileParser'
import logo from '/favicon.svg'

type InputMode = 'input' | 'files'

interface LandingPageProps {
  onSubmit: (text: string, file?: File) => void
  onToggleSidebar: () => void
}

export function LandingPage({ onSubmit, onToggleSidebar }: LandingPageProps) {
  const [mode, setMode] = useState<InputMode>('input')
  const [text, setText] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isParsingFile, setIsParsingFile] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [text])

  const handleSubmit = useCallback(() => {
    if (text.trim()) {
      onSubmit(text.trim())
      setText('')
    }
  }, [text, onSubmit])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      setParseError(null)

      const files = Array.from(e.dataTransfer.files)
      const supportedFile = files.find(isSupportedFile)

      if (supportedFile) {
        setIsParsingFile(true)
        try {
          const content = await parseFile(supportedFile)
          onSubmit(content, supportedFile)
        } catch (err) {
          setParseError(err instanceof Error ? err.message : 'Failed to parse file')
        } finally {
          setIsParsingFile(false)
        }
      } else {
        setParseError('Unsupported file type. ' + SUPPORTED_FORMATS_TEXT)
      }
    },
    [onSubmit]
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setParseError(null)
      setIsParsingFile(true)

      try {
        const content = await parseFile(file)
        onSubmit(content, file)
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'Failed to parse file')
      } finally {
        setIsParsingFile(false)
        // Reset input so the same file can be selected again
        e.target.value = ''
      }
    },
    [onSubmit]
  )

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-background overflow-y-auto relative"
    >
      {/* Sidebar Toggle Button */}
      <button
        onClick={onToggleSidebar}
        className="absolute top-6 left-6 p-2 text-text-secondary hover:text-text-primary transition-colors hover:bg-surface-high rounded-lg z-10"
        aria-label="Toggle sidebar"
      >
        <PanelLeft size={22} />
      </button>

      <div className="w-full max-w-2xl space-y-8 md:space-y-12 py-8 md:py-0">
        {/* Logo/Greeting */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-accent rounded-[22%] flex items-center justify-center text-white shadow-xl shadow-accent/20">
              <img src={logo} alt="Logo" className="w-6 h-6 md:w-8 md:h-8" />
            </div>
          </div>
          <h1 className="text-4xl md:text-display text-text-primary">SoundPage</h1>
          <p className="text-lg md:text-h2 text-text-secondary font-medium mt-1 md:mt-2">
            Transform your text into natural speech.
          </p>
          <p className="text-sm md:text-body text-text-tertiary mt-0.5 md:mt-1">
            Lightning fast, no cloud, no tracking, purely private. Even runs in Airplane Mode.

          </p>
        </div>

        {/* Input Area */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {mode === 'input' ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: duration.normal, ease: easing.easeOutExpo }}
                className="relative"
              >
                <div
                  className={cn(
                    'flex flex-col gap-2 p-6 md:p-8 pb-4 md:pb-6 rounded-3xl transition-all duration-300 min-h-[240px] md:h-[280px]',
                    'bg-surface border-2 border-border shadow-sm',
                    'focus-within:bg-background focus-within:ring-2 focus-within:ring-accent/10 focus-within:border-accent/40'
                  )}
                >
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type or paste text to generate speech..."
                    rows={1}
                    className={cn(
                      'flex-1 resize-none bg-transparent w-full',
                      'text-lg md:text-h2 text-text-primary placeholder:text-text-tertiary',
                      'focus:outline-none focus-visible:outline-none border-none ring-0 focus:ring-0',
                      'py-2 px-1'
                    )}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmit}
                      disabled={!text.trim()}
                      className={cn(
                        'btn-icon btn-accent',
                        !text.trim() && 'bg-surface-high text-text-tertiary opacity-50 cursor-not-allowed'
                      )}
                    >
                      <ArrowUp size={22} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="files"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: duration.normal, ease: easing.easeOutExpo }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div
                  className={cn(
                    'flex flex-col items-center justify-center gap-4 md:gap-6',
                    'p-6 md:p-8 rounded-3xl border-2 border-dashed transition-all duration-300 min-h-[240px] md:h-[280px]',
                    isDragging
                      ? 'border-accent bg-accent/5 ring-4 ring-accent/5'
                      : 'border-border bg-surface hover:bg-surface-high/50'
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-background shadow-sm',
                      isDragging && 'text-accent'
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {isDragging ? (
                        <motion.div
                          key="upload"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Upload className="w-8 h-8 md:w-10 md:h-10" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="file"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <FileText className="w-8 h-8 md:w-10 md:h-10 text-text-tertiary" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Text */}
                  <div className="text-center space-y-1 md:space-y-2">
                    <p className="text-xl md:text-h2 font-semibold text-text-primary">
                      {isDragging ? 'Drop it here' : 'Import Document'}
                    </p>
                    <p className="text-xs md:text-body-sm text-text-secondary max-w-[200px] md:max-w-[240px]">
                      Drag and drop your PDF, Word or Text files here to start.
                    </p>
                  </div>

                  {/* Browse Button */}
                  <label
                    className={cn(
                      'btn-primary px-6 md:px-8 py-2 md:py-3 text-sm md:text-base',
                      isParsingFile && 'opacity-50 pointer-events-none'
                    )}
                  >
                    {isParsingFile ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Parsing...
                      </span>
                    ) : (
                      'Browse Files'
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_FILE_TYPES}
                      className="sr-only"
                      onChange={handleFileSelect}
                      disabled={isParsingFile}
                    />
                  </label>

                  {parseError && (
                    <p className="text-[10px] md:text-caption text-error bg-error/10 px-3 py-1 rounded-full font-bold">
                      {parseError}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mode Toggle */}
          <div className="flex justify-center pt-2 md:pt-4">
            <InputToggle mode={mode} onChange={setMode} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
