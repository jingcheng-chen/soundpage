import { motion } from 'framer-motion'
import {
  FileText,
  Mic2,
  Globe,
  PlayCircle,
  BookmarkCheck,
  Wifi,
  Download,
  Zap,
  Monitor
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { fadeIn, scaleIn } from '@/lib/motion'
import logo from '/favicon.svg'
import video from '/soundpage.mp4'

const features = [
  {
    icon: FileText,
    title: 'Document Import',
    description: 'Supports .txt, .md, .docx, .pdf, and .epub files',
  },
  {
    icon: Mic2,
    title: '10 Voice Presets',
    description: '5 male and 5 female natural voices',
  },
  {
    icon: Globe,
    title: '5 Languages',
    description: 'English, Korean, Spanish, Portuguese, French',
  },
  {
    icon: PlayCircle,
    title: 'Real-time Streaming',
    description: 'Audio plays as it generates, chunk by chunk',
  },
  {
    icon: BookmarkCheck,
    title: 'Word Sync',
    description: 'Highlighted text follows along with playback',
  },
  {
    icon: Wifi,
    title: 'Offline Support',
    description: 'Works offline after initial model download',
  },
  {
    icon: Download,
    title: 'WAV Export',
    description: 'Download generated audio anytime',
  },
  {
    icon: Zap,
    title: 'WebGPU Accelerated',
    description: 'Fast inference with automatic fallback',
  },
]

export function MobileLandingPage() {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background overflow-y-auto"
    >
      <div className="max-w-lg mx-auto px-6 py-12 space-y-10">
        {/* Header */}
        <motion.header
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="text-center space-y-4"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-accent rounded-[22%] flex items-center justify-center shadow-xl shadow-accent/20">
              <img src={logo} alt="SoundPage Logo" className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-text-primary">SoundPage</h1>
          <p className="text-lg text-text-secondary font-medium">
            Your documents, spoken beautifully.
          </p>
          <p className="text-sm text-text-tertiary">
            Privacy-focused text-to-speech that runs entirely in your browser.
          </p>
        </motion.header>

        {/* Video Demo */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <video
            src={video}
            controls
            autoPlay
            muted
            playsInline
            preload="metadata"
            poster=""
            className="w-full rounded-2xl border border-border shadow-lg"
          >
            Your browser does not support the video tag.
          </video>
        </motion.section>

        {/* Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-text-primary text-center">
            Features
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.05 }}
                className={cn(
                  'p-4 rounded-xl bg-surface border border-border',
                  'flex flex-col gap-2'
                )}
              >
                <feature.icon className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {feature.title}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Desktop Required Notice */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className={cn(
            'p-5 rounded-2xl bg-accent/5 border border-accent/20',
            'flex flex-col items-center text-center gap-4'
          )}>
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Monitor className="w-6 h-6 text-accent" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-text-primary">
                Desktop Required
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                SoundPage uses an AI model that runs entirely on your device for privacy.
                Mobile browsers have strict memory limits that prevent loading the model.
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">
                Please visit on a desktop browser (Chrome, Edge, or Safari) to use the app.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center pt-4 pb-8"
        >
          <p className="text-xs text-text-tertiary">
            Powered by{' '}
            <a
              href="https://github.com/supertone-inc/supertonic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Supertonic
            </a>
            {' '}open-source TTS
          </p>
        </motion.footer>
      </div>
    </motion.div>
  )
}
