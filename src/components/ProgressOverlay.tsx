import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useGeneration } from '@/hooks/useGeneration'
import { scaleIn, fadeIn } from '@/lib/motion'

export const ProgressOverlay: React.FC = () => {
  const { isGenerating, progress, cancel } = useGeneration()

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            'fixed inset-0 z-50',
            'flex items-center justify-center',
            'bg-background/80 backdrop-blur-sm'
          )}
        >
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'w-full max-w-md mx-4 p-8',
              'bg-surface rounded-[--radius-lg]',
              'border border-border',
              'shadow-2xl shadow-black/20'
            )}
          >
            {/* Title */}
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-accent/10"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <motion.div
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-pink-500"
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </motion.div>
              <h3 className="text-xl font-semibold text-text-primary">
                Generating audio...
              </h3>
            </div>

            {/* Progress */}
            <div className="space-y-4 mb-8">
              <Progress value={progress?.percentage ?? 0} />

              <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                {progress && (
                  <>
                    <span>
                      Step {progress.step} of {progress.totalSteps}
                    </span>
                    {progress.totalChunks > 1 && (
                      <>
                        <span className="text-text-tertiary">·</span>
                        <span>
                          Chunk {progress.chunk} of {progress.totalChunks}
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Cancel button */}
            <div className="flex justify-center">
              <Button variant="ghost" onClick={cancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
