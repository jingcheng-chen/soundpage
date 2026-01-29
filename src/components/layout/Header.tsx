import { motion } from 'framer-motion'
import { AudioWaveform } from 'lucide-react'
import { Badge, StatusDot } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { fadeIn, easing, duration } from '@/lib/motion'

interface HeaderProps {
  engineStatus: 'loading' | 'ready' | 'error'
  backend: 'webgpu' | 'wasm' | null
  className?: string
}

export const Header: React.FC<HeaderProps> = ({
  engineStatus,
  backend,
  className,
}) => {
  const statusText = {
    loading: 'Loading...',
    ready: backend === 'webgpu' ? 'WebGPU Ready' : 'WASM Ready',
    error: 'Error',
  }

  const statusVariant = {
    loading: 'warning' as const,
    ready: 'success' as const,
    error: 'error' as const,
  }

  return (
    <motion.header
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex items-center justify-between',
        'px-6 py-4',
        'border-b border-border',
        className
      )}
    >
      {/* Logo */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: duration.slow, ease: easing.easeOutExpo }}
      >
        <motion.div
          className="flex items-center justify-center w-10 h-10 rounded-[--radius-md] bg-gradient-to-br from-accent to-pink-500"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AudioWaveform className="w-5 h-5 text-white" />
        </motion.div>
        <span className="text-xl font-semibold tracking-tight">SoundPage</span>
      </motion.div>

      {/* Status */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: duration.slow,
          ease: easing.easeOutExpo,
          delay: 0.1,
        }}
      >
        <Badge variant={statusVariant[engineStatus]}>
          <StatusDot status={engineStatus} />
          {statusText[engineStatus]}
        </Badge>
      </motion.div>
    </motion.header>
  )
}
