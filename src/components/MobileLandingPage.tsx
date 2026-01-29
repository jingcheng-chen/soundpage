import { motion } from 'framer-motion'
import {
  FileText,
  Mic2,
  Monitor,
  Sparkles,
  Zap,
  Play,
  Lock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { fadeIn, scaleIn, staggerContainer, staggerItem, slideUp } from '@/lib/motion'
import logo from '/favicon.svg'
import video from '/soundpage.mp4'

const features = [
  {
    icon: FileText,
    title: 'Document Import',
    description: 'Effortlessly import .pdf, .docx, .md, and more.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  {
    icon: Mic2,
    title: 'Natural Voices',
    description: '10 human-like voices with word sync playback.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  },
  {
    icon: Zap,
    title: 'Pure Performance',
    description: 'WebGPU accelerated for lightning-fast inference.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10'
  },
  {
    icon: Lock,
    title: 'Private by Design',
    description: 'Everything runs locally. Your data never leaves.',
    color: 'text-green-500',
    bg: 'bg-green-500/10'
  }
]

export function MobileLandingPage() {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background text-text-primary selection:bg-accent/10 selection:text-accent overflow-x-hidden"
    >
      {/* Visual Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-lg mx-auto px-6 py-16 flex flex-col gap-16">
        {/* Hero Section */}
        <motion.header
          variants={staggerContainer}
          className="text-center space-y-6"
        >
          <motion.div variants={scaleIn} className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 blur-xl rounded-2xl scale-110" />
              <div className="relative w-20 h-20 bg-accent rounded-[22%] flex items-center justify-center shadow-2xl shadow-accent/40 ring-1 ring-white/20">
                <img src={logo} alt="SoundPage Logo" className="w-10 h-10" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={slideUp} className="space-y-2">
            <h1 className="text-display tracking-tightest">
              SoundPage
            </h1>
            <p className="text-xl text-text-secondary font-medium tracking-tight">
              Your words, <span className="text-accent">spoken</span> beautifully.
            </p>
          </motion.div>

          <motion.p
            variants={slideUp}
            className="text-base text-text-tertiary max-w-xs mx-auto leading-relaxed"
          >
            Professional-grade text-to-speech that runs entirely in your browser with on-device AI.
          </motion.p>
        </motion.header>

        {/* Feature Highlights Grid */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={staggerItem}
              className={cn(
                'group p-5 rounded-2xl bg-surface border border-border/50',
                'flex items-center gap-5 transition-all duration-300',
                'hover:bg-surface-high hover:scale-[1.02]'
              )}
            >
              <div className={cn('p-3 rounded-xl flex-shrink-0', feature.bg)}>
                <feature.icon className={cn('w-6 h-6', feature.color)} strokeWidth={2.5} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-h2 font-bold tracking-tight">{feature.title}</h3>
                <p className="text-body-sm text-text-secondary leading-snug">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* Video Demo Showcase */}
        <motion.section
          variants={slideUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between px-2">
            <h2 className="text-h2 font-bold flex items-center gap-2">
              <Play className="w-4 h-4 text-accent fill-accent" />
              See it in action
            </h2>
            <div className="px-3 py-1 bg-surface-high rounded-full border border-border">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Demo</span>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-b from-accent/10 to-transparent blur-md rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative aspect-video rounded-[20px] overflow-hidden border border-border shadow-2xl bg-black/5">
              <video
                src={video}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
          </div>
        </motion.section>

        {/* Desktop Experience Bridge */}
        <motion.section
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className={cn(
            'p-8 rounded-3xl bg-surface-high border-2 border-accent/20',
            'flex flex-col items-center text-center gap-6 relative overflow-hidden'
          )}>
            {/* Background Accent */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/5 blur-3xl rounded-full" />

            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center shadow-xl shadow-accent/20">
              <Monitor className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-3 relative z-10">
              <h3 className="text-h1 font-bold tracking-tight">
                Connect on Desktop
              </h3>
              <p className="text-body text-text-secondary leading-relaxed max-w-[280px]">
                To protect your privacy, SoundPage runs an AI model entirely on your device.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-accent">
                  <Sparkles className="w-4 h-4" />
                  <span>Full features available on Desktop</span>
                </div>
                <p className="text-[12px] text-text-tertiary">
                  Works best on Chrome, Edge, and Safari.
                </p>
              </div>
            </div>

            <div className="w-full h-px bg-border/50 my-2" />

            <div className="flex items-center gap-2 text-text-tertiary">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs font-medium">Ready for your next session</span>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="text-center space-y-4 pt-4 pb-12">
          <div className="flex items-center justify-center gap-4 opacity-40">
            <a
              href="https://github.com/supertone-inc/supertonic"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-bold text-accent hover:underline transition-all"
            >
              <a
                href="https://github.com/jingcheng-chen/soundpage"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface transition-colors"
                aria-label="GitHub"
              >
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 30 30">
                  <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
                </svg>
              </a>
            </a>
          </div>
          <p className="text-caption text-text-tertiary">
            Open Source & Privacy First
          </p>
        </footer>
      </div>
    </motion.div>
  )
}
