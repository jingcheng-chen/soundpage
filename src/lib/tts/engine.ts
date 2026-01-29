import * as ort from 'onnxruntime-web'
import type {
  TTSConfig,
  GenerationProgress,
  GenerationResult,
  ChunkResult,
  TTSModels,
  TTSConfigFile,
  VoiceStyle,
  Language,
} from './types'
import { DEFAULT_SILENCE_GAP } from './types'
import { UnicodeProcessor, chunkText } from './processor'
import { calculateDuration } from './audio'
import {
  detectBackend,
  loadTTSModels,
  loadTextProcessor,
  loadVoiceStyle,
  loadTTSConfig,
} from './models'
import { preCacheAllAssets, areAssetsCached } from '../db'

export class TTSEngine {
  private models: TTSModels | null = null
  private textProcessor: UnicodeProcessor | null = null
  private cfgs: TTSConfigFile | null = null
  private voiceStyles: Map<string, VoiceStyle> = new Map()
  private backend: 'webgpu' | 'wasm' = 'wasm'
  private _isReady: boolean = false
  private cancelRequested: boolean = false

  /**
   * Get sample rate from config
   */
  get sampleRate(): number {
    return this.cfgs?.ae.sample_rate ?? 24000
  }

  /**
   * Initialize the TTS engine
   */
  async initialize(
    onProgress?: (status: string, progress: number) => void
  ): Promise<void> {
    try {
      // Detect backend
      onProgress?.('Detecting hardware...', 0)
      this.backend = await detectBackend()
      onProgress?.(`Using ${this.backend.toUpperCase()}`, 10)

      // Load TTS config
      onProgress?.('Loading configuration...', 15)
      this.cfgs = await loadTTSConfig()

      // Load text processor
      onProgress?.('Loading text processor...', 20)
      this.textProcessor = await loadTextProcessor()

      // Load models
      this.models = await loadTTSModels(this.backend, (progress) => {
        const baseProgress = 30
        const modelProgress = 60
        const percent =
          baseProgress + (progress.progress / progress.total) * modelProgress
        onProgress?.(`Loading ${progress.model}...`, percent)
      })

      // Load default voice
      onProgress?.('Loading default voice...', 90)
      await this.loadVoice('M1')

      // Pre-cache all assets for offline support
      const alreadyCached = await areAssetsCached()
      if (!alreadyCached) {
        onProgress?.('Caching assets for offline use...', 95)
        await preCacheAllAssets()
      }

      onProgress?.('Ready', 100)
      this._isReady = true
    } catch (error) {
      console.error('Failed to initialize TTS engine:', error)
      throw error
    }
  }

  /**
   * Load a voice style into cache
   */
  async loadVoice(voiceId: string): Promise<void> {
    if (this.voiceStyles.has(voiceId)) return

    const style = await loadVoiceStyle(voiceId)
    this.voiceStyles.set(voiceId, style)
  }

  /**
   * Generate speech from text
   */
  async generate(
    text: string,
    config: TTSConfig,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<GenerationResult> {
    if (!this._isReady || !this.models || !this.textProcessor || !this.cfgs) {
      throw new Error('TTS engine not initialized')
    }

    this.cancelRequested = false
    const startTime = performance.now()

    // Ensure voice is loaded
    await this.loadVoice(config.voice)
    const voiceStyle = this.voiceStyles.get(config.voice)!

    // Validate style dimensions
    if (voiceStyle.ttl.dims[0] !== 1) {
      throw new Error('Single speaker text to speech only supports single style')
    }

    // Chunk text for long inputs (shorter for Korean)
    const maxLen = config.language === 'ko' ? 120 : 300
    const chunks = chunkText(text, maxLen)

    let wavCat: number[] = []
    let durCat = 0

    for (let i = 0; i < chunks.length; i++) {
      if (this.cancelRequested) {
        throw new Error('Generation cancelled')
      }

      const chunk = chunks[i]
      const { wav, duration } = await this.inferSingle(
        chunk,
        config.language,
        voiceStyle,
        config.totalSteps,
        config.speed,
        (step, totalSteps) => {
          onProgress?.({
            step,
            totalSteps,
            chunk: i + 1,
            totalChunks: chunks.length,
            percentage: Math.round(
              ((i + step / totalSteps) / chunks.length) * 100
            ),
          })
        }
      )

      if (wavCat.length === 0) {
        wavCat = wav
        durCat = duration[0]
      } else {
        // Add silence between chunks
        const silenceLen = Math.floor(DEFAULT_SILENCE_GAP * this.sampleRate)
        const silence = new Array(silenceLen).fill(0)
        wavCat = [...wavCat, ...silence, ...wav]
        durCat += duration[0] + DEFAULT_SILENCE_GAP
      }
    }

    // Trim to expected duration
    const wavLen = Math.floor(this.sampleRate * durCat)
    const wavOut = new Float32Array(wavCat.slice(0, wavLen))

    const generationTime = performance.now() - startTime

    return {
      audioBuffer: wavOut,
      duration: calculateDuration(wavOut.length, this.sampleRate),
      sampleRate: this.sampleRate,
      generationTime,
    }
  }

  /**
   * Single inference pass (matches reference _infer method)
   */
  private async inferSingle(
    text: string,
    lang: Language,
    style: VoiceStyle,
    totalStep: number,
    speed: number = 1.05,
    progressCallback?: (step: number, total: number) => void
  ): Promise<{ wav: number[]; duration: number[] }> {
    const { models, textProcessor, cfgs } = this
    if (!models || !textProcessor || !cfgs) {
      throw new Error('Engine not initialized')
    }

    const bsz = 1 // Batch size of 1 for single inference

    // Process text
    const { textIds, textMask } = textProcessor.call([text], [lang])

    // Create text_ids tensor (int64)
    const textIdsFlat = new BigInt64Array(textIds.flat().map((x) => BigInt(x)))
    const textIdsShape = [bsz, textIds[0].length]
    const textIdsTensor = new ort.Tensor('int64', textIdsFlat, textIdsShape)

    // Create text_mask tensor (float32, 3D shape)
    const textMaskFlat = new Float32Array(textMask.flat(2))
    const textMaskShape = [bsz, 1, textMask[0][0].length]
    const textMaskTensor = new ort.Tensor('float32', textMaskFlat, textMaskShape)

    // Duration prediction
    const dpOutputs = await models.durationPredictor.run({
      text_ids: textIdsTensor,
      style_dp: style.dp,
      text_mask: textMaskTensor,
    })
    const duration = Array.from(dpOutputs.duration.data as Float32Array)

    // Apply speed factor to duration
    for (let i = 0; i < duration.length; i++) {
      duration[i] /= speed
    }

    // Text encoding
    const textEncOutputs = await models.textEncoder.run({
      text_ids: textIdsTensor,
      style_ttl: style.ttl,
      text_mask: textMaskTensor,
    })
    const textEmb = textEncOutputs.text_emb

    // Sample noisy latent
    let { xt, latentMask } = this.sampleNoisyLatent(
      duration,
      cfgs.ae.sample_rate,
      cfgs.ae.base_chunk_size,
      cfgs.ttl.chunk_compress_factor,
      cfgs.ttl.latent_dim
    )

    // Create latent mask tensor
    const latentMaskFlat = new Float32Array(latentMask.flat(2))
    const latentMaskShape = [bsz, 1, latentMask[0][0].length]
    const latentMaskTensor = new ort.Tensor(
      'float32',
      latentMaskFlat,
      latentMaskShape
    )

    // Prepare step tensors
    const totalStepArray = new Float32Array(bsz).fill(totalStep)
    const totalStepTensor = new ort.Tensor('float32', totalStepArray, [bsz])

    // Denoising loop
    for (let step = 0; step < totalStep; step++) {
      if (this.cancelRequested) {
        throw new Error('Generation cancelled')
      }

      progressCallback?.(step + 1, totalStep)

      const currentStepArray = new Float32Array(bsz).fill(step)
      const currentStepTensor = new ort.Tensor('float32', currentStepArray, [
        bsz,
      ])

      const xtFlat = new Float32Array(xt.flat(2))
      const xtShape = [bsz, xt[0].length, xt[0][0].length]
      const xtTensor = new ort.Tensor('float32', xtFlat, xtShape)

      const vectorEstOutputs = await models.vectorEstimator.run({
        noisy_latent: xtTensor,
        text_emb: textEmb,
        style_ttl: style.ttl,
        latent_mask: latentMaskTensor,
        text_mask: textMaskTensor,
        current_step: currentStepTensor,
        total_step: totalStepTensor,
      })

      const denoised = Array.from(
        vectorEstOutputs.denoised_latent.data as Float32Array
      )

      // Reshape to 3D
      const latentDim = xt[0].length
      const latentLen = xt[0][0].length
      xt = []
      let idx = 0
      for (let b = 0; b < bsz; b++) {
        const batch: number[][] = []
        for (let d = 0; d < latentDim; d++) {
          const row: number[] = []
          for (let t = 0; t < latentLen; t++) {
            row.push(denoised[idx++])
          }
          batch.push(row)
        }
        xt.push(batch)
      }
    }

    // Generate waveform with vocoder
    const finalXtFlat = new Float32Array(xt.flat(2))
    const finalXtShape = [bsz, xt[0].length, xt[0][0].length]
    const finalXtTensor = new ort.Tensor('float32', finalXtFlat, finalXtShape)

    const vocoderOutputs = await models.vocoder.run({
      latent: finalXtTensor,
    })

    const wav = Array.from(vocoderOutputs.wav_tts.data as Float32Array)

    return { wav, duration }
  }

  /**
   * Sample noisy latent with Box-Muller transform
   * Matches reference implementation exactly
   */
  private sampleNoisyLatent(
    duration: number[],
    sampleRate: number,
    baseChunkSize: number,
    chunkCompress: number,
    latentDim: number
  ): { xt: number[][][]; latentMask: number[][][] } {
    const bsz = duration.length
    const maxDur = Math.max(...duration)

    const wavLenMax = Math.floor(maxDur * sampleRate)
    const wavLengths = duration.map((d) => Math.floor(d * sampleRate))

    const chunkSize = baseChunkSize * chunkCompress
    const latentLen = Math.floor((wavLenMax + chunkSize - 1) / chunkSize)
    const latentDimVal = latentDim * chunkCompress

    // Generate noisy latent using Box-Muller transform
    const xt: number[][][] = []
    for (let b = 0; b < bsz; b++) {
      const batch: number[][] = []
      for (let d = 0; d < latentDimVal; d++) {
        const row: number[] = []
        for (let t = 0; t < latentLen; t++) {
          // Box-Muller transform
          const u1 = Math.max(0.0001, Math.random())
          const u2 = Math.random()
          const val =
            Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
          row.push(val)
        }
        batch.push(row)
      }
      xt.push(batch)
    }

    // Create latent mask
    const latentLengths = wavLengths.map((len) =>
      Math.floor((len + chunkSize - 1) / chunkSize)
    )
    const latentMask = this.lengthToMask(latentLengths, latentLen)

    // Apply mask to latent
    for (let b = 0; b < bsz; b++) {
      for (let d = 0; d < latentDimVal; d++) {
        for (let t = 0; t < latentLen; t++) {
          xt[b][d][t] *= latentMask[b][0][t]
        }
      }
    }

    return { xt, latentMask }
  }

  /**
   * Create length-based mask with shape [bsz, 1, maxLen]
   */
  private lengthToMask(lengths: number[], maxLen?: number): number[][][] {
    const actualMaxLen = maxLen || Math.max(...lengths)
    return lengths.map((len) => {
      const row = new Array(actualMaxLen).fill(0.0)
      for (let j = 0; j < Math.min(len, actualMaxLen); j++) {
        row[j] = 1.0
      }
      return [row]
    })
  }

  /**
   * Generate speech from text with streaming support
   * Calls onChunkReady after each chunk is generated
   */
  async generateStreaming(
    text: string,
    config: TTSConfig,
    onChunkReady: (chunk: ChunkResult) => void,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<void> {
    if (!this._isReady || !this.models || !this.textProcessor || !this.cfgs) {
      throw new Error('TTS engine not initialized')
    }

    this.cancelRequested = false

    // Ensure voice is loaded
    await this.loadVoice(config.voice)
    const voiceStyle = this.voiceStyles.get(config.voice)!

    // Validate style dimensions
    if (voiceStyle.ttl.dims[0] !== 1) {
      throw new Error('Single speaker text to speech only supports single style')
    }

    // Chunk text for long inputs (shorter for Korean)
    const maxLen = config.language === 'ko' ? 120 : 300
    const chunks = chunkText(text, maxLen)

    for (let i = 0; i < chunks.length; i++) {
      if (this.cancelRequested) {
        throw new Error('Generation cancelled')
      }

      const chunk = chunks[i]
      const { wav, duration } = await this.inferSingle(
        chunk,
        config.language,
        voiceStyle,
        config.totalSteps,
        config.speed,
        (step, totalSteps) => {
          onProgress?.({
            step,
            totalSteps,
            chunk: i + 1,
            totalChunks: chunks.length,
            percentage: Math.round(
              ((i + step / totalSteps) / chunks.length) * 100
            ),
          })
        }
      )

      // Trim to expected duration
      const wavLen = Math.floor(this.sampleRate * duration[0])
      const wavOut = new Float32Array(wav.slice(0, wavLen))

      // Notify that chunk is ready
      onChunkReady({
        audioBuffer: wavOut,
        duration: duration[0],
        sampleRate: this.sampleRate,
        chunk: i + 1,
        totalChunks: chunks.length,
        isLast: i === chunks.length - 1,
        text: chunk, // Include the original text for this chunk
      })
    }
  }

  /**
   * Cancel ongoing generation
   */
  cancel(): void {
    this.cancelRequested = true
  }

  /**
   * Get current backend
   */
  getBackend(): 'webgpu' | 'wasm' {
    return this.backend
  }

  /**
   * Check if engine is ready
   */
  isInitialized(): boolean {
    return this._isReady
  }
}

// Singleton instance
let engineInstance: TTSEngine | null = null

export function getTTSEngine(): TTSEngine {
  if (!engineInstance) {
    engineInstance = new TTSEngine()
  }
  return engineInstance
}
