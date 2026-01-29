import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'ko' | 'es' | 'pt' | 'fr';
export type Voice = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'F1' | 'F2' | 'F3' | 'F4' | 'F5';

interface SettingsState {
  voice: Voice;
  language: Language;
  speed: number;
  totalSteps: number;

  // Actions
  setVoice: (voice: Voice) => void;
  setLanguage: (language: Language) => void;
  setSpeed: (speed: number) => void;
  setTotalSteps: (steps: number) => void;
  reset: () => void;
}

const initialState = {
  voice: 'M3' as Voice,
  language: 'en' as Language,
  speed: 1.0,
  totalSteps: 5,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,

      setVoice: (voice) => set({ voice }),
      setLanguage: (language) => set({ language }),
      setSpeed: (speed) => set({ speed }),
      setTotalSteps: (steps) => set({ totalSteps: steps }),
      reset: () => set(initialState),
    }),
    {
      name: 'soundpage-settings',
    },
  ),
);

// Language display names
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  ko: '한국어',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
};

// Voice display names
export const VOICE_NAMES: Record<Voice, { name: string; gender: 'male' | 'female' }> = {
  M1: { name: 'M1', gender: 'male' },
  M2: { name: 'M2', gender: 'male' },
  M3: { name: 'M3', gender: 'male' },
  M4: { name: 'M4', gender: 'male' },
  M5: { name: 'M5', gender: 'male' },
  F1: { name: 'F1', gender: 'female' },
  F2: { name: 'F2', gender: 'female' },
  F3: { name: 'F3', gender: 'female' },
  F4: { name: 'F4', gender: 'female' },
  F5: { name: 'F5', gender: 'female' },
};

export const VOICES = Object.keys(VOICE_NAMES) as Voice[];
export const LANGUAGES = Object.keys(LANGUAGE_NAMES) as Language[];
