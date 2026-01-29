import type { InferenceSession, Tensor } from 'onnxruntime-web'

export type Language = 'en' | 'ko' | 'es' | 'pt' | 'fr'

export interface TTSConfig {
  voice: string
  language: Language
  speed: number
  totalSteps: number
  temperature?: number
}

export interface GenerationProgress {
  step: number
  totalSteps: number
  chunk: number
  totalChunks: number
  percentage: number
}

export interface GenerationResult {
  audioBuffer: Float32Array
  duration: number
  sampleRate: number
  generationTime: number
}

export interface ChunkResult {
  audioBuffer: Float32Array
  duration: number
  sampleRate: number
  chunk: number
  totalChunks: number
  isLast: boolean
  text: string // The text content of this chunk
}

/**
 * Voice style with pre-created ONNX tensors
 */
export interface VoiceStyle {
  ttl: Tensor
  dp: Tensor
}

/**
 * Text processor config (unicode_indexer.json)
 */
export type TextProcessorConfig = number[]

/**
 * TTS configuration from tts.json
 */
export interface TTSConfigFile {
  ae: {
    sample_rate: number
    base_chunk_size: number
  }
  ttl: {
    chunk_compress_factor: number
    latent_dim: number
  }
}

export interface TTSModels {
  durationPredictor: InferenceSession
  textEncoder: InferenceSession
  vectorEstimator: InferenceSession
  vocoder: InferenceSession
}

export interface ModelLoadProgress {
  model: string
  progress: number
  total: number
}

export const AVAILABLE_LANGS: Language[] = ['en', 'ko', 'es', 'pt', 'fr']

export const DEFAULT_TEMPERATURE = 0.3
export const DEFAULT_SILENCE_GAP = 0.3 // seconds between chunks
