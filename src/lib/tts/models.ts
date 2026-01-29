import * as ort from 'onnxruntime-web'
import type {
  TTSModels,
  VoiceStyle,
  TextProcessorConfig,
  TTSConfigFile,
  ModelLoadProgress,
} from './types'
import { UnicodeProcessor } from './processor'
import { fetchJsonWithCache } from '../db'

// Configure ONNX Runtime paths for WASM files
// In production, use local files from /assets/wasm/ for offline support
// In development, use the CDN (Vite doesn't allow importing from public/)
const isDev = import.meta.env.DEV
ort.env.wasm.wasmPaths = isDev
  ? 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/'
  : '/assets/wasm/'

const ASSETS_BASE = '/assets'
const ONNX_PATH = `${ASSETS_BASE}/onnx`
const VOICE_PATH = `${ASSETS_BASE}/voice_styles`

/**
 * Check if a model file exists.
 * Returns true on network errors to allow offline mode (ONNX Runtime may have cached models).
 */
async function checkFileExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    // Network error - return true to allow load attempt (ONNX Runtime caches models)
    return true
  }
}

/**
 * Detect best available execution provider
 */
export async function detectBackend(): Promise<'webgpu' | 'wasm'> {
  // Check for WebGPU support
  if ('gpu' in navigator) {
    try {
      const adapter = await (navigator as any).gpu?.requestAdapter()
      if (adapter) {
        return 'webgpu'
      }
    } catch {
      // WebGPU not available
    }
  }
  return 'wasm'
}

/**
 * Create an ONNX inference session
 */
export async function loadOnnxSession(
  modelPath: string,
  backend: 'webgpu' | 'wasm'
): Promise<ort.InferenceSession> {
  // First check if the model file exists
  const exists = await checkFileExists(modelPath)
  if (!exists) {
    throw new Error(
      `Model file not found: ${modelPath}\n\nPlease download the Supertonic models from HuggingFace and place them in public/assets/onnx/`
    )
  }

  const options: ort.InferenceSession.SessionOptions = {
    executionProviders: backend === 'webgpu' ? ['webgpu'] : ['wasm'],
    graphOptimizationLevel: 'all',
  }

  try {
    const session = await ort.InferenceSession.create(modelPath, options)
    return session
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    // Check for memory-related errors
    if (errorMessage.includes('memory') ||
        errorMessage.includes('OOM') ||
        errorMessage.includes('allocation')) {
      throw new Error(
        `Out of memory loading model.\n\nMobile devices may not have enough memory for this application. Please try on a desktop browser or close other tabs/apps.`
      )
    }

    // If WebGPU fails, fallback to WASM
    if (backend === 'webgpu') {
      console.warn('WebGPU failed, falling back to WASM:', errorMessage)
      options.executionProviders = ['wasm']
      try {
        return await ort.InferenceSession.create(modelPath, options)
      } catch (wasmError) {
        const wasmMessage = wasmError instanceof Error ? wasmError.message : String(wasmError)

        // Check for memory-related errors in WASM fallback
        if (wasmMessage.includes('memory') ||
            wasmMessage.includes('OOM') ||
            wasmMessage.includes('allocation')) {
          throw new Error(
            `Out of memory loading model.\n\nMobile devices may not have enough memory for this application. Please try on a desktop browser or close other tabs/apps.`
          )
        }

        throw new Error(
          `Failed to load model with both WebGPU and WASM:\n${wasmMessage}`
        )
      }
    }
    throw error
  }
}

/**
 * Load TTS configuration from tts.json (cached for offline support)
 */
export async function loadTTSConfig(): Promise<TTSConfigFile> {
  const configPath = `${ONNX_PATH}/tts.json`
  return fetchJsonWithCache<TTSConfigFile>(configPath)
}

/**
 * Load all TTS models
 */
export async function loadTTSModels(
  backend: 'webgpu' | 'wasm',
  onProgress?: (progress: ModelLoadProgress) => void
): Promise<TTSModels> {
  const modelFiles = [
    { name: 'duration_predictor', key: 'durationPredictor' },
    { name: 'text_encoder', key: 'textEncoder' },
    { name: 'vector_estimator', key: 'vectorEstimator' },
    { name: 'vocoder', key: 'vocoder' },
  ]

  // Check if at least one model exists before starting
  const firstModelPath = `${ONNX_PATH}/${modelFiles[0].name}.onnx`
  const firstExists = await checkFileExists(firstModelPath)
  if (!firstExists) {
    throw new Error(
      'Model files not found. Please download the Supertonic models:\n\n' +
        '1. git clone https://huggingface.co/Supertone/supertonic-2 supertonic-models\n' +
        '2. Copy ONNX files to public/assets/onnx/\n' +
        '3. Copy voice style JSONs to public/assets/voice_styles/'
    )
  }

  const models: Partial<TTSModels> = {}

  for (let i = 0; i < modelFiles.length; i++) {
    const { name, key } = modelFiles[i]
    onProgress?.({
      model: name,
      progress: i,
      total: modelFiles.length,
    })

    const path = `${ONNX_PATH}/${name}.onnx`
    const session = await loadOnnxSession(path, backend)
    ;(models as any)[key] = session
  }

  onProgress?.({
    model: 'complete',
    progress: modelFiles.length,
    total: modelFiles.length,
  })

  return models as TTSModels
}

/**
 * Load text processor configuration (unicode_indexer.json) (cached for offline support)
 */
export async function loadTextProcessor(): Promise<UnicodeProcessor> {
  const configPath = `${ONNX_PATH}/unicode_indexer.json`
  const indexer = await fetchJsonWithCache<TextProcessorConfig>(configPath)
  return new UnicodeProcessor(indexer)
}

/**
 * Load a voice style and create ONNX tensors (cached for offline support)
 * Matches reference implementation - returns Style with pre-created tensors
 */
export async function loadVoiceStyle(voiceId: string): Promise<VoiceStyle> {
  const stylePath = `${VOICE_PATH}/${voiceId}.json`

  let voiceStyle: any
  try {
    voiceStyle = await fetchJsonWithCache(stylePath)
  } catch {
    throw new Error(
      `Voice style not found: ${voiceId}.json\n\nPlease download voice styles from HuggingFace and place them in public/assets/voice_styles/`
    )
  }

  // Get dimensions from the style data
  const ttlDims = voiceStyle.style_ttl.dims
  const dpDims = voiceStyle.style_dp.dims

  // Flatten nested arrays
  const ttlData = flattenArray(voiceStyle.style_ttl.data)
  const dpData = flattenArray(voiceStyle.style_dp.data)

  // Create ONNX tensors directly (like reference implementation)
  const ttlTensor = new ort.Tensor('float32', new Float32Array(ttlData), ttlDims)
  const dpTensor = new ort.Tensor('float32', new Float32Array(dpData), dpDims)

  return {
    ttl: ttlTensor,
    dp: dpTensor,
  }
}

/**
 * Flatten nested arrays into a single array
 */
function flattenArray(arr: any): number[] {
  const result: number[] = []
  function flatten(item: any) {
    if (Array.isArray(item)) {
      for (const subItem of item) {
        flatten(subItem)
      }
    } else {
      result.push(item)
    }
  }
  flatten(arr)
  return result
}

/**
 * Create float32 ONNX tensor
 */
export function createTensor(data: Float32Array, dims: number[]): ort.Tensor {
  return new ort.Tensor('float32', data, dims)
}

/**
 * Create int64 tensor from number array
 */
export function createInt64Tensor(data: number[], dims: number[]): ort.Tensor {
  const bigIntData = BigInt64Array.from(data.map(BigInt))
  return new ort.Tensor('int64', bigIntData, dims)
}
