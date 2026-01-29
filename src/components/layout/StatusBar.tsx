import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fadeIn } from '@/lib/motion'

interface StatusBarProps {
  leftContent?: React.ReactNode
  rightContent?: React.ReactNode
  className?: string
}

export const StatusBar: React.FC<StatusBarProps> = ({
  leftContent,
  rightContent,
  className,
}) => {
  return (
    <motion.footer
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex items-center justify-between',
        'px-6 py-3',
        'border-t border-border',
        'text-sm text-text-secondary',
        className
      )}
    >
      <div>{leftContent}</div>
      <div className="font-mono text-xs">{rightContent}</div>
    </motion.footer>
  )
}
