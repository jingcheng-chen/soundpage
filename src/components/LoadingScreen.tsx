import { motion } from 'framer-motion'
import { Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { useEngine } from '@/hooks/useEngine'
import { scaleIn, fadeIn, pulse } from '@/lib/motion'
import logo from '/favicon.svg'

export const LoadingScreen: React.FC = () => {
  const { loadingStatus, loadingProgress, error, isFirstLoad, isMobileUnsupported, webgpuFailed, isReinitializing } = useEngine()

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        'fixed inset-0 z-50',
        'flex items-center justify-center',
        'bg-background'
      )}
    >
      <motion.div
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md mx-4 text-center"
      >
        {/* Logo */}
        <motion.div
          className="inline-flex items-center justify-center mb-10"
          variants={error || isMobileUnsupported ? undefined : pulse}
          animate={error || isMobileUnsupported ? undefined : 'animate'}
        >
          <img
            src={logo}
            alt="Logo"
            className={cn(
              "w-20 h-20",
              (error || isMobileUnsupported) && "grayscale opacity-50"
            )}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-2xl font-semibold mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          SoundPage
        </motion.h1>

        <motion.p
          className="text-text-secondary mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Your documents, spoken beautifully.
        </motion.p>

        {/* Progress, Error, or Mobile Unsupported */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {isMobileUnsupported ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border mx-8">
                <Monitor className="w-8 h-8 text-accent" />
                <div className="text-left">
                  <p className="text-sm font-medium text-text-primary">
                    Desktop Required
                  </p>
                  <p className="text-xs text-text-tertiary mt-2">
                    Mobile browsers have hard memory limits, SoundPage uses offline AI model that requires more memory.
                  </p>
                </div>
              </div>
            
          ) : error ? (
            <div className="p-4 rounded-[--radius-md] bg-error/10 border border-error/20 text-left">
              <p className="text-sm font-medium text-error mb-2">
                Failed to initialize
              </p>
              <pre className="text-xs text-text-secondary whitespace-pre-wrap font-mono">
                {error}
              </pre>
            </div>
          ) : (
            <>
              <Progress value={loadingProgress} />
              <p className="text-sm text-text-secondary">
                {loadingStatus || 'Initializing...'}
              </p>
              {isReinitializing && webgpuFailed && (
                <p className="text-xs text-warning mt-3 px-4">
                  WebGPU encountered an error. Switching to WASM backend for better compatibility...
                </p>
              )}
              {isFirstLoad && !isReinitializing && (
                <p className="text-xs text-text-secondary mt-3 px-4">
                  First time setup - downloading AI models for offline use. This may take a minute, but future loads will be much faster.
                </p>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
