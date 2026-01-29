import { useMemo, useCallback, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTextSyncStore } from '@/stores/textSyncStore'
import { useAudioStore } from '@/stores/audioStore'
import { getStreamingPlayer } from '@/lib/audio/streamingPlayer'

interface HighlightedTextProps {
  text: string
  className?: string
  followMode?: boolean
}

export interface HighlightedTextRef {
  scrollToCurrentPosition: () => void
}

interface WordData {
  word: string
  chunkIndex: number
  wordIndex: number
  isSpace: boolean
}

interface ChunkData {
  chunkIndex: number
  words: WordData[]
  prefix?: string
}


export const HighlightedText = forwardRef<HighlightedTextRef, HighlightedTextProps>(
  function HighlightedText({ text, className, followMode = false }, ref) {
  const { chunks } = useTextSyncStore()
  const { currentTime, isPlaying, duration } = useAudioStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const activeWordRef = useRef<HTMLSpanElement>(null)

  // Expose scroll method to parent
  useImperativeHandle(ref, () => ({
    scrollToCurrentPosition: () => {
      if (activeWordRef.current) {
        activeWordRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    },
  }))

  // Find which chunk is currently active based on playback time
  const activeChunkIndex = useMemo(() => {
    if (chunks.length === 0) return -1

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      if (currentTime >= chunk.startTime && currentTime < chunk.endTime) {
        return i
      }
    }

    // If we're past all chunks, highlight the last one
    if (currentTime >= chunks[chunks.length - 1]?.endTime) {
      return chunks.length - 1
    }

    return -1
  }, [chunks, currentTime])

  // Estimate word position within the active chunk
  const activeWordIndex = useMemo(() => {
    if (activeChunkIndex < 0 || activeChunkIndex >= chunks.length) return -1

    const chunk = chunks[activeChunkIndex]
    const words = chunk.text.split(/\s+/)
    if (words.length === 0) return -1

    const chunkDuration = chunk.endTime - chunk.startTime
    const timeIntoChunk = currentTime - chunk.startTime
    const progress = Math.max(0, Math.min(1, timeIntoChunk / chunkDuration))

    // Estimate word based on character position
    const totalChars = chunk.text.length
    const charPosition = Math.floor(progress * totalChars)

    let charCount = 0
    for (let i = 0; i < words.length; i++) {
      charCount += words[i].length + 1
      if (charCount > charPosition) {
        return i
      }
    }

    return words.length - 1
  }, [activeChunkIndex, chunks, currentTime])

  // Auto-scroll to keep active word visible (only when followMode is enabled)
  useEffect(() => {
    if (followMode && isPlaying && activeWordRef.current) {
      const wordRect = activeWordRef.current.getBoundingClientRect()
      const margin = 100 // pixels from edge before triggering scroll

      // Check if the word is outside the visible viewport (with margin)
      if (wordRect.top < margin || wordRect.bottom > window.innerHeight - margin) {
        activeWordRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
    }
  }, [activeChunkIndex, activeWordIndex, isPlaying, followMode])

  // Calculate time position for a word click - memoized once
  const handleWordClick = useCallback(
    (chunkIndex: number, wordIndex: number) => {
      if (chunks.length === 0 || duration === 0) return

      const chunk = chunks[chunkIndex]
      if (!chunk) return

      const words = chunk.text.split(/\s+/)
      if (words.length === 0) return

      // Calculate character position for this word
      let charsBefore = 0
      for (let i = 0; i < wordIndex; i++) {
        charsBefore += words[i].length + 1
      }

      const totalChars = chunk.text.length
      const progress = totalChars > 0 ? charsBefore / totalChars : 0
      const chunkDuration = chunk.endTime - chunk.startTime
      const timeInChunk = progress * chunkDuration
      const seekTime = chunk.startTime + timeInChunk

      const player = getStreamingPlayer()
      player.seek(Math.max(0, Math.min(seekTime, duration)))
    },
    [chunks, duration]
  )

  // Build text structure ONCE - only depends on text and chunks, NOT on active state
  const textStructure = useMemo((): ChunkData[] => {
    if (chunks.length === 0) {
      return []
    }

    const structure: ChunkData[] = []
    let lastEndIndex = 0

    chunks.forEach((chunk, chunkIndex) => {
      const chunkStartIndex = text.indexOf(chunk.text, lastEndIndex)

      const words = chunk.text.split(/(\s+)/)
      let wordCounter = 0
      const wordData: WordData[] = []

      words.forEach((word) => {
        if (/^\s+$/.test(word)) {
          wordData.push({ word, chunkIndex, wordIndex: -1, isSpace: true })
        } else {
          wordData.push({ word, chunkIndex, wordIndex: wordCounter, isSpace: false })
          wordCounter++
        }
      })

      structure.push({
        chunkIndex,
        words: wordData,
        prefix: chunkStartIndex > lastEndIndex ? text.slice(lastEndIndex, chunkStartIndex) : undefined
      })

      if (chunkStartIndex !== -1) {
        lastEndIndex = chunkStartIndex + chunk.text.length
      }
    })

    return structure
  }, [text, chunks])

  // Check if we have no chunks - show plain text
  if (chunks.length === 0) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'whitespace-pre-wrap text-[24px] font-semibold leading-[1.5] tracking-tight',
          'select-text overflow-x-hidden',
          className
        )}
      >
        <span className="text-text-primary">{text}</span>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'whitespace-pre-wrap text-[24px] font-semibold leading-[1.5] tracking-tight',
        'select-text overflow-x-hidden',
        className
      )}
    >
      <div className="space-y-4">
        {textStructure.map((chunkData) => (
          <motion.div
            key={`chunk-wrapper-${chunkData.chunkIndex}`}
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{
              duration: 0.5,
              delay: chunkData.chunkIndex * 0.06,
              ease: 'easeOut',
            }}
          >
            {chunkData.prefix && (
              <span className='text-text-tertiary opacity-40'>
                {chunkData.prefix}
              </span>
            )}
            <span
              className={cn(
                'block origin-left transition-all duration-300 ease-out',
                activeChunkIndex === chunkData.chunkIndex
                  ? 'text-text-primary opacity-100 scale-[1.01]'
                  : 'text-text-tertiary opacity-30 scale-100'
              )}
            >
              {chunkData.words.map((wordData, idx) => {
                if (wordData.isSpace) {
                  return <span key={`space-${chunkData.chunkIndex}-${idx}`}>{wordData.word}</span>
                }

                const isActiveWord = activeChunkIndex === chunkData.chunkIndex && activeWordIndex === wordData.wordIndex

                return (
                  <span
                    key={`word-${chunkData.chunkIndex}-${idx}`}
                    ref={isActiveWord ? activeWordRef : undefined}
                    onClick={() => handleWordClick(chunkData.chunkIndex, wordData.wordIndex)}
                    className={cn(
                      'cursor-pointer inline-block px-0.5 rounded transition-all duration-150 ease-out',
                      isActiveWord
                        ? 'text-accent scale-105 shadow-[0_0_15px_rgba(250,36,60,0.15)]'
                        : 'hover:bg-surface-high'
                    )}
                  >
                    {wordData.word}
                  </span>
                )
              })}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
})
