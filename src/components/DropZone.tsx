import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Upload, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useDocumentStore } from '@/stores/documentStore'
import { scaleIn, float, easing, duration } from '@/lib/motion'
import {
  isSupportedFile,
  ACCEPTED_FILE_TYPES,
  SUPPORTED_FORMATS_TEXT,
} from '@/lib/fileParser'

export const DropZone: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setText, loadFile } = useDocumentStore()

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
      setError(null)

      const files = Array.from(e.dataTransfer.files)
      const supportedFile = files.find(isSupportedFile)

      if (supportedFile) {
        setIsLoading(true)
        try {
          await loadFile(supportedFile)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to parse file')
        } finally {
          setIsLoading(false)
        }
      } else {
        // Try to get text from clipboard
        const text = e.dataTransfer.getData('text/plain')
        if (text) {
          setText(text)
        } else {
          setError('Unsupported file type. ' + SUPPORTED_FORMATS_TEXT)
        }
      }
    },
    [loadFile, setText]
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setError(null)
      setIsLoading(true)
      try {
        await loadFile(file)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse file')
      } finally {
        setIsLoading(false)
        e.target.value = ''
      }
    },
    [loadFile]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const text = e.clipboardData.getData('text/plain')
      if (text) {
        setText(text)
      }
    },
    [setText]
  )

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex-1 flex items-center justify-center p-8"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}
    >
      <motion.div
        className={cn(
          'relative w-full max-w-lg aspect-[4/3]',
          'flex flex-col items-center justify-center gap-6',
          'rounded-[--radius-xl] border-2 border-dashed',
          'transition-all duration-[--duration-normal]',
          isDragging
            ? 'border-accent bg-accent/5 scale-[1.02] glow'
            : 'border-border hover:border-text-tertiary'
        )}
        animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
        transition={{ duration: duration.fast, ease: easing.easeOutExpo }}
      >
        {/* Icon */}
        <motion.div
          className={cn(
            'flex items-center justify-center w-20 h-20',
            'rounded-[--radius-lg]',
            'bg-surface-high',
            isDragging && 'bg-accent/10'
          )}
          variants={float}
          animate="animate"
        >
          <AnimatePresence mode="wait">
            {isDragging ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: duration.fast }}
              >
                <Upload className="w-10 h-10 text-accent" />
              </motion.div>
            ) : (
              <motion.div
                key="file"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: duration.fast }}
              >
                <FileText className="w-10 h-10 text-text-tertiary" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Text */}
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-text-primary">
            {isDragging ? 'Drop to import' : 'Drop your document here'}
          </p>
          <p className="text-sm text-text-secondary">
            or paste text to begin
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 w-48">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-tertiary">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Browse button */}
        <label>
          <Button
            variant="secondary"
            size="md"
            className={cn('cursor-pointer', isLoading && 'opacity-50 pointer-events-none')}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Parsing...
              </span>
            ) : (
              'Browse Files'
            )}
          </Button>
          <input
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            className="sr-only"
            onChange={handleFileSelect}
            disabled={isLoading}
          />
        </label>

        {/* Supported formats hint */}
        {error ? (
          <p className="text-xs text-error">{error}</p>
        ) : (
          <p className="text-xs text-text-tertiary">{SUPPORTED_FORMATS_TEXT}</p>
        )}
      </motion.div>
    </motion.div>
  )
}
