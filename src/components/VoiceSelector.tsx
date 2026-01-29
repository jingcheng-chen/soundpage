import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ChevronDown,  AudioWaveformIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore, type Voice } from '@/stores/settingsStore';
import { fetchBinaryWithCache } from '@/lib/db';

const VoiceAttributes: Record<Voice, { name: string; description: string }> = {
  M1: {
    name: 'Alex',
    description: 'Lively, upbeat with confident energy',
  },
  M2: {
    name: 'James',
    description: 'Deep, robust; calm and composed',
  },
  M3: {
    name: 'Robert',
    description: 'Polished, authoritative and trustworthy',
  },
  M4: {
    name: 'Sam',
    description: 'Soft, gentle with youthful quality',
  },
  M5: {
    name: 'Daniel',
    description: 'Warm, soft-spoken storyteller',
  },
  F1: {
    name: 'Sarah',
    description: 'Calm with a slightly low tone',
  },
  F2: {
    name: 'Lily',
    description: 'Bright, cheerful and playful',
  },
  F3: {
    name: 'Jessica',
    description: 'Clear, professional announcer-style',
  },
  F4: {
    name: 'Olivia',
    description: 'Crisp, confident with strong delivery',
  },
  F5: {
    name: 'Emily',
    description: 'Kind, gentle and naturally soothing',
  },
};

const maleVoices: Voice[] = ['M1', 'M2', 'M3', 'M4', 'M5'];
const femaleVoices: Voice[] = ['F1', 'F2', 'F3', 'F4', 'F5'];

interface VoiceCardProps {
  voiceId: Voice;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onTogglePlay: () => void;
}

interface VoiceSelectorProps {
  className?: string;
}

function VoiceCard({ voiceId, isSelected, isPlaying, onSelect, onTogglePlay }: VoiceCardProps) {
  const attr = VoiceAttributes[voiceId];
  const isMale = voiceId.startsWith('M');

  return (
    <motion.button
      onClick={onSelect}
      className={cn(
        'w-full px-4 py-2.5 rounded-xl text-left transition-all duration-200',
        isSelected
          ? 'bg-accent/5 ring-1 ring-accent/20'
          : 'hover:bg-surface-high'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Play button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlay();
          }}
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all',
            isPlaying
              ? 'bg-accent text-white'
              : 'bg-surface-high text-text-primary hover:scale-105'
          )}
        >
          {isPlaying ? <Pause size={14} fill="white" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
        </button>

        {/* Voice info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              'font-semibold text-sm',
              isSelected ? 'text-accent' : 'text-text-primary'
            )}>{attr.name}</span>
            <span className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter',
              isMale ? 'bg-blue-500/10 text-blue-500' : 'bg-pink-500/10 text-pink-500'
            )}>
              {isMale ? 'Male' : 'Female'}
            </span>
          </div>
          <p className="text-[11px] text-text-secondary truncate font-medium">
            {attr.description}
          </p>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(250,36,60,0.5)]" />
        )}
      </div>
    </motion.button>
  );
}

export function VoiceSelector({ className }: VoiceSelectorProps) {
  const { voice, setVoice } = useSettingsStore();
  const [open, setOpen] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<Voice | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentAttr = VoiceAttributes[voice];
  const isMale = voice.startsWith('M');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
          setPlayingVoice(null);
        }
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleTogglePlay = async (voiceId: Voice) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      return;
    }

    setPlayingVoice(voiceId);

    try {
      // Fetch from cache (falls back to network if not cached)
      const audioData = await fetchBinaryWithCache(`/assets/voice_styles/${voiceId}.wav`);
      const blob = new Blob([audioData], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play().catch(() => {});
      audio.onended = () => {
        setPlayingVoice(null);
        audioRef.current = null;
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.warn('Failed to play voice sample:', e);
      setPlayingVoice(null);
    }
  };

  const handleSelect = (voiceId: Voice) => {
    setVoice(voiceId);
    setOpen(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingVoice(null);
    }
  };

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full h-11 px-4 rounded-xl transition-all duration-300',
          'bg-surface border border-border shadow-sm',
          'flex items-center justify-between gap-3',
          'hover:bg-background hover:shadow-md',
          open && 'ring-2 ring-accent/20 border-accent/40 bg-background'
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <AudioWaveformIcon size={14} />
          </div>
          <span className="font-bold text-sm text-text-primary">{currentAttr.name}</span>
          <span className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter',
            isMale ? 'bg-blue-500/10 text-blue-500' : 'bg-pink-500/10 text-pink-500'
          )}>
            {isMale ? 'Male' : 'Female'}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={cn(
            'text-text-tertiary transition-transform duration-300',
            open && 'rotate-180 text-accent'
          )}
        />
      </button>

      {/* Drop-up menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'absolute z-[100] bottom-full mb-3 w-80 max-h-[480px] overflow-hidden',
              'bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-black/10',
              'left-0'
            )}
          >
            <div className="p-3 overflow-y-auto max-h-[480px]">
              <div className="mb-4">
                <div className="px-4 py-2 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                  Male Voices
                </div>
                <div className="space-y-1">
                  {maleVoices.map((v) => (
                    <VoiceCard
                      key={v}
                      voiceId={v}
                      isSelected={voice === v}
                      isPlaying={playingVoice === v}
                      onSelect={() => handleSelect(v)}
                      onTogglePlay={() => handleTogglePlay(v)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="px-4 py-2 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                  Female Voices
                </div>
                <div className="space-y-1">
                  {femaleVoices.map((v) => (
                    <VoiceCard
                      key={v}
                      voiceId={v}
                      isSelected={voice === v}
                      isPlaying={playingVoice === v}
                      onSelect={() => handleSelect(v)}
                      onTogglePlay={() => handleTogglePlay(v)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
