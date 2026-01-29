import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  showPercentage?: boolean
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, max = 100, className, showPercentage = false }, ref) => {
    const percentage = Math.round((value / max) * 100)

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-high">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        {showPercentage && (
          <div className="flex justify-end">
            <span className="text-xs font-mono text-text-secondary">
              {percentage}%
            </span>
          </div>
        )}
      </div>
    )
  }
)

Progress.displayName = 'Progress'
