import { useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useDocumentStore, MAX_CHARACTERS } from '@/stores/documentStore'
import { fadeIn } from '@/lib/motion'

interface TextEditorProps {
  className?: string
}

export const TextEditor: React.FC<TextEditorProps> = ({ className }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { text, characterCount, fileName, isFromFile, setText, clear } =
    useDocumentStore()

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 400)}px`
    }
  }, [text])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value)
    },
    [setText]
  )

  const isNearLimit = characterCount > MAX_CHARACTERS * 0.9
  const isAtLimit = characterCount >= MAX_CHARACTERS

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn('flex flex-col h-full', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          {fileName && (
            <span className="text-sm text-text-secondary truncate max-w-[200px]">
              {fileName}
            </span>
          )}
          {isFromFile && (
            <span className="text-xs text-text-tertiary">(imported)</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clear}
          className="text-text-tertiary hover:text-text-primary"
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>

      {/* Textarea */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          placeholder="Type or paste your text here..."
          className={cn(
            'w-full h-full min-h-[200px] p-4',
            'bg-transparent resize-none',
            'text-text-primary placeholder:text-text-tertiary',
            'focus:outline-none',
            'text-[15px] leading-relaxed'
          )}
        />

        {/* Character count */}
        <div
          className={cn(
            'absolute bottom-3 right-3',
            'px-2 py-1 rounded-[--radius-sm]',
            'text-xs font-mono',
            'transition-colors duration-[--duration-fast]',
            isAtLimit
              ? 'bg-error/10 text-error'
              : isNearLimit
              ? 'bg-warning/10 text-warning'
              : 'bg-surface-high text-text-tertiary'
          )}
        >
          {characterCount.toLocaleString()}
          {isNearLimit && ` / ${MAX_CHARACTERS.toLocaleString()}`}
        </div>
      </div>
    </motion.div>
  )
}
