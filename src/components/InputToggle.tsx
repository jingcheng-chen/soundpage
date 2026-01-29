import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type InputMode = 'input' | 'files'

interface InputToggleProps {
  mode: InputMode
  onChange: (mode: InputMode) => void
}

export function InputToggle({ mode, onChange }: InputToggleProps) {
  return (
    <div className="inline-flex items-center bg-surface rounded-[--radius-full] p-1 gap-1">
      <ToggleButton
        label="Input"
        isActive={mode === 'input'}
        onClick={() => onChange('input')}
      />
      <ToggleButton
        label="Files"
        isActive={mode === 'files'}
        onClick={() => onChange('files')}
      />
    </div>
  )
}

function ToggleButton({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative px-4 py-1.5 text-body-sm font-medium rounded-[--radius-full]',
        'transition-colors duration-[--duration-fast]',
        isActive ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
      )}
    >
      {isActive && (
        <motion.div
          layoutId="toggle-active"
          className="absolute inset-0 bg-surface-high rounded-[--radius-full]"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  )
}
