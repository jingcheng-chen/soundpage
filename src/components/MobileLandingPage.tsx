import { motion } from 'framer-motion'
import {
  FileText,
  Mic2,
  Monitor,
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
          variants={slideUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative pt-8 pb-4"
        >
          <div className="text-center space-y-10">
            <div className="flex flex-col items-center gap-6">
              <div className="relative group/monitor">
                <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-150 group-hover/monitor:scale-175 transition-transform duration-700 opacity-50" />
                <div className="relative w-20 h-20 bg-surface border border-border/80 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-sm transform group-hover/monitor:-translate-y-1 transition-all duration-300">
                  <Monitor className="w-10 h-10 text-accent" strokeWidth={1.5} />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-h1 font-bold tracking-tight">Desktop Only</h3>
                <p className="text-body text-text-secondary max-w-[300px] mx-auto leading-relaxed">
                  SoundPage runs heavy AI models entirely on your device for maximum privacy.
                  <span className="block mt-2 text-text-tertiary text-sm">
                    Mobile browsers currently lack the memory support required to run these models.
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              <div className="p-4 rounded-[20px] bg-surface border border-border/40 text-center space-y-1 transition-colors hover:bg-surface-high">
                <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Platform</div>
                <div className="text-sm font-bold text-text-primary">Desktop Only</div>
              </div>
              <div className="p-4 rounded-[20px] bg-surface border border-border/40 text-center space-y-1 transition-colors hover:bg-surface-high">
                <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Privacy</div>
                <div className="text-sm font-bold text-text-secondary">Local AI</div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] text-text-tertiary font-semibold tracking-wide uppercase px-6">
                Please visit us on Chrome, Edge, or Safari for Desktop
              </p>
              <div className="w-12 h-1 bg-accent/10 mx-auto rounded-full" />
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="text-center space-y-4 pb-16 border-t border-border/40">
          <div className="flex flex-col items-center gap-6">
            <a
              href="https://github.com/jingcheng-chen/soundpage"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-high border border-border text-text-secondary hover:text-text-primary hover:bg-surface transition-all duration-300 transform active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
              <span className="text-xs font-bold tracking-tight">View Project Source</span>
            </a>
          </div>

          <div className="pt-4">
            <p className="text-caption text-text-tertiary opacity-60">
              hosted on <a href="https://ywt.ch" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline decoration-2 underline-offset-4 transition-all">ywt.ch</a>
            </p>
          </div>
        </footer>
      </div>
    </motion.div>
  )
}
