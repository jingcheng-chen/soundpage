import * as React from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-surface-high text-text-secondary border-border',
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  error: 'bg-error/10 text-error border-error/30',
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5',
          'rounded-full px-2.5 py-0.5',
          'text-xs font-medium',
          'border',
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

// Status indicator dot
interface StatusDotProps {
  status: 'loading' | 'ready' | 'error'
  className?: string
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, className }) => {
  const colors = {
    loading: 'bg-warning animate-pulse',
    ready: 'bg-success',
    error: 'bg-error',
  }

  return (
    <span
      className={cn(
        'inline-block w-2 h-2 rounded-full',
        colors[status],
        className
      )}
    />
  )
}
