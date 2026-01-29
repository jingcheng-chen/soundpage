// Default sample rate (used as fallback)
const DEFAULT_SAMPLE_RATE = 24000

/**
 * Write audio data to WAV file buffer
 * 16-bit PCM format
 */
export function writeWavFile(
  audioData: Float32Array,
  sampleRate: number = DEFAULT_SAMPLE_RATE
): ArrayBuffer {
  const numChannels = 1
  const bitsPerSample = 16
  const bytesPerSample = bitsPerSample / 8
  const blockAlign = numChannels * bytesPerSample

  const dataSize = audioData.length * bytesPerSample
  const headerSize = 44
  const fileSize = headerSize + dataSize

  const buffer = new ArrayBuffer(fileSize)
  const view = new DataView(buffer)

  // RIFF header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, fileSize - 8, true)
  writeString(view, 8, 'WAVE')

  // fmt chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // chunk size
  view.setUint16(20, 1, true) // audio format (PCM)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true) // byte rate
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)

  // data chunk
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  // Write audio samples
  let offset = 44
  for (let i = 0; i < audioData.length; i++) {
    // Clamp to [-1, 1] and convert to 16-bit signed integer
    const sample = Math.max(-1, Math.min(1, audioData[i]))
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff
    view.setInt16(offset, intSample, true)
    offset += 2
  }

  return buffer
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

/**
 * Create a Blob from audio data
 */
export function createAudioBlob(
  audioData: Float32Array,
  sampleRate: number = DEFAULT_SAMPLE_RATE
): Blob {
  const wavBuffer = writeWavFile(audioData, sampleRate)
  return new Blob([wavBuffer], { type: 'audio/wav' })
}

/**
 * Calculate audio duration in seconds
 */
export function calculateDuration(
  samples: number,
  sampleRate: number = DEFAULT_SAMPLE_RATE
): number {
  return samples / sampleRate
}

/**
 * Concatenate multiple audio buffers with silence gaps
 */
export function concatenateAudio(
  buffers: Float32Array[],
  silenceGap: number = 0.3,
  sampleRate: number = DEFAULT_SAMPLE_RATE
): Float32Array {
  if (buffers.length === 0) return new Float32Array(0)
  if (buffers.length === 1) return buffers[0]

  const silenceSamples = Math.floor(silenceGap * sampleRate)
  const totalLength =
    buffers.reduce((sum, buf) => sum + buf.length, 0) +
    silenceSamples * (buffers.length - 1)

  const result = new Float32Array(totalLength)
  let offset = 0

  for (let i = 0; i < buffers.length; i++) {
    result.set(buffers[i], offset)
    offset += buffers[i].length

    // Add silence between chunks (not after the last one)
    if (i < buffers.length - 1) {
      offset += silenceSamples
    }
  }

  return result
}

/**
 * Trim audio to specified duration
 */
export function trimAudio(
  audio: Float32Array,
  durationSeconds: number,
  sampleRate: number = DEFAULT_SAMPLE_RATE
): Float32Array {
  const targetSamples = Math.floor(durationSeconds * sampleRate)
  if (audio.length <= targetSamples) return audio
  return audio.slice(0, targetSamples)
}
