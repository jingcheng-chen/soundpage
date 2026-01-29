import { useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/utils'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { useGeneration } from '@/hooks/useGeneration'
import { useAudioStore } from '@/stores/audioStore'
import { fadeIn } from '@/lib/motion'

interface AudioPlayerBarProps {
  className?: string
}

export function AudioPlayerBar({ className }: AudioPlayerBarProps) {
  const progressRef = useRef<HTMLDivElement>(null)
  const {
    duration,
    currentTime,
    isPlaying,
    isGenerating,
    isStreamingComplete,
    togglePlayPause,
    seek,
    download,
  } = useAudioPlayer()
  const { cancel } = useGeneration()
  const { generation } = useAudioStore()

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const generationProgress = generation.progress?.percentage ?? 0

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || duration === 0) return

      const rect = progressRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = x / rect.width
      const newTime = percentage * duration
      seek(Math.max(0, Math.min(duration, newTime)))
    },
    [duration, seek]
  )

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        'audio-player-bar flex items-center h-full relative z-50 py-1 overflow-hidden',
        className
      )}
    >
      {/* Left: Metadata Placeholder or Title */}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        {/* Empty for balance, could add title here */}
      </div>

      {/* Center: Playback Controls */}
      <div className="flex flex-col items-center justify-center gap-0.5 flex-1 max-w-[600px] min-w-[120px] w-full h-full">
        <div className="flex items-center">
          <button
            onClick={togglePlayPause}
            disabled={duration === 0}
            className={cn(
              'flex items-center justify-center',
              'w-8 h-8 rounded-full',
              'text-text-primary hover:scale-110 active:scale-95',
              'transition-all duration-[--duration-fast]',
              'disabled:opacity-30 disabled:cursor-not-allowed'
            )}
          >
            {isPlaying ? (
              <Pause size={28} fill="currentColor" strokeWidth={0} />
            ) : (
              <Play size={28} fill="currentColor" strokeWidth={0} className="ml-1" />
            )}
          </button>
        </div>

        {/* Progress Section */}
        <div className="w-full flex items-center gap-2">
          <span className="text-mono text-[9px] text-text-tertiary w-8 text-right">
            {formatDuration(currentTime)}
          </span>
          
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="flex-1 h-1 relative group cursor-pointer"
          >
            <div className="absolute inset-0 bg-surface-high rounded-full" />
            <motion.div
              className="absolute inset-y-0 left-0 bg-text-primary rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            >
              <div
                className={cn(
                  'absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2',
                  'w-2 h-2 rounded-full bg-text-primary',
                  'shadow-lg opacity-0 group-hover:opacity-100',
                  'transition-opacity'
                )}
              />
            </motion.div>
          </div>

          <span className="text-mono text-[9px] text-text-tertiary w-8">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Right: Actions - Unified Morphing Button */}
      <div className="flex-1 flex justify-end items-center px-2">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="flex items-center gap-3"
            >
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest leading-none hidden md:block">Processing</span>
                <span className="text-[14px] font-bold text-text-primary tabular-nums leading-tight">
                  {Math.round(generationProgress)}%
                </span>
              </div>
              <button
                onClick={cancel}
                className="relative w-10 h-10 flex items-center justify-center group"
                title="Cancel generation"
              >
                {/* SVG Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-surface-high"
                  />
                  <motion.circle
                    cx="20"
                    cy="20"
                    r="18"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray="113.1"
                    initial={{ strokeDashoffset: 113.1 }}
                    animate={{ strokeDashoffset: 113.1 - (113.1 * generationProgress) / 100 }}
                    className="text-accent"
                    transition={{ duration: 0.3 }}
                  />
                </svg>
                <div className="relative z-10 w-3 h-3 bg-text-tertiary group-hover:bg-error transition-colors rounded-sm" />
              </button>
            </motion.div>
          ) : isStreamingComplete && duration > 0 ? (
            <motion.button
              key="download"
              layoutId="action-button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={download}
              className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full border border-border text-sm font-semibold text-white transition-colors overflow-hidden bg-accent hover:bg-accent-hover"
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="flex items-center gap-1.5"
              >
                <Download size={16} className="transition-transform" />
                <span className="whitespace-nowrap hidden md:inline">Save Audio</span>
              </motion.div>
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
