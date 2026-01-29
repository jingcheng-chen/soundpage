import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { VoiceSelector } from './VoiceSelector';
import { LanguageSelector } from './LanguageSelector';
import { useSettingsStore } from '@/stores/settingsStore';
import { staggerContainer, staggerItem } from '@/lib/motion';

interface ControlsPanelProps {
  className?: string;
}

export const getQualityLabel = (steps: number) => {
  if (steps <= 4) return `Fast: ${steps} steps`;
  if (steps <= 10) return `Balanced: ${steps} steps`;
  return `Best: ${steps} steps`;
};

export const ControlsPanel: React.FC<ControlsPanelProps> = ({ className }) => {
  const { speed, totalSteps, setSpeed, setTotalSteps } = useSettingsStore();

  return (
    <motion.div variants={staggerContainer} initial='hidden' animate='visible' className={cn('p-6 space-y-6', 'bg-surface rounded-[--radius-lg]', 'border border-border', className)}>
      {/* Voice */}
      <motion.div variants={staggerItem}>
        <VoiceSelector />
      </motion.div>

      {/* Language */}
      <motion.div variants={staggerItem}>
        <LanguageSelector />
      </motion.div>

      {/* Divider */}
      <motion.div variants={staggerItem} className='h-px bg-border' />

      {/* Speed */}
      <motion.div variants={staggerItem}>
        <Slider label='Speed' valueDisplay={`${speed.toFixed(1)}x`} value={[speed]} onValueChange={([v]) => setSpeed(v)} min={0.6} max={1.5} step={0.1} />
        <div className='flex justify-between mt-1.5 text-xs text-text-tertiary'>
          <span>Slower</span>
          <span>Faster</span>
        </div>
      </motion.div>

      {/* Quality */}
      <motion.div variants={staggerItem}>
        <Slider label='Quality' valueDisplay={`${totalSteps} steps (${getQualityLabel(totalSteps)})`} value={[totalSteps]} onValueChange={([v]) => setTotalSteps(v)} min={2} max={16} step={1} />
        <div className='flex justify-between mt-1.5 text-xs text-text-tertiary'>
          <span>Fast</span>
          <span>Best</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
