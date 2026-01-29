import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useSettingsStore, LANGUAGES } from '@/stores/settingsStore'

interface LanguageSelectorProps {
  className?: string
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className,
}) => {
  const { language, setLanguage } = useSettingsStore()

  return (
    <div className={className}>
      <label className="block text-sm text-text-secondary mb-2">Language</label>
      <div className="flex rounded-[--radius-sm] bg-surface-high p-1">
        {LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={cn(
              'relative flex-1 py-2 px-3',
              'text-xs font-medium uppercase tracking-wide',
              'rounded-[calc(var(--radius-sm)-4px)]',
              'transition-colors duration-[--duration-fast]',
              language === lang
                ? 'text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary'
            )}
          >
            {language === lang && (
              <motion.div
                layoutId="language-indicator"
                className="absolute inset-0 bg-surface rounded-[calc(var(--radius-sm)-4px)]"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{lang}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
