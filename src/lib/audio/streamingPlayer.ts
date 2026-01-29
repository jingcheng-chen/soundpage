/**
 * Streaming Audio Player using Web Audio API
 * Allows playback to start as soon as the first chunk is ready
 * and seamlessly continues as more chunks arrive
 */

export interface AudioChunk {
  buffer: Float32Array
  duration: number
  sampleRate: number
}

export interface StreamingPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  isComplete: boolean
}

export type StateChangeCallback = (state: StreamingPlayerState) => void

export class StreamingAudioPlayer {
  private audioContext: AudioContext | null = null
  private chunks: AudioChunk[] = []
  private audioBuffers: AudioBuffer[] = []
  private currentSource: AudioBufferSourceNode | null = null
  private startTime: number = 0
  private pauseTime: number = 0
  private isPlaying: boolean = false
  private isComplete: boolean = false
  private currentChunkIndex: number = 0
  private onStateChange: StateChangeCallback | null = null
  private timeUpdateInterval: number | null = null
  private sampleRate: number = 24000
  private silenceTimeout: number | null = null
  // Version counter to invalidate stale callbacks after seek
  private playbackVersion: number = 0

  constructor() {
    this.initContext()
  }

  private initContext(): void {
    if (typeof window !== 'undefined' && !this.audioContext) {
      this.audioContext = new AudioContext()
    }
  }

  /**
   * Reset the player for a new streaming session
   */
  reset(): void {
    this.stop()
    this.chunks = []
    this.audioBuffers = []
    this.currentChunkIndex = 0
    this.pauseTime = 0
    this.isComplete = false
    this.notifyStateChange()
  }

  /**
   * Add a new audio chunk to the player
   */
  async addChunk(chunk: AudioChunk): Promise<void> {
    this.initContext()
    if (!this.audioContext) return

    this.chunks.push(chunk)
    this.sampleRate = chunk.sampleRate

    // Resume context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }

    // Create AudioBuffer from the chunk
    const audioBuffer = this.audioContext.createBuffer(
      1, // mono
      chunk.buffer.length,
      chunk.sampleRate
    )
    audioBuffer.getChannelData(0).set(chunk.buffer)
    this.audioBuffers.push(audioBuffer)

    this.notifyStateChange()
  }

  /**
   * Mark streaming as complete
   */
  markComplete(): void {
    this.isComplete = true
    this.notifyStateChange()
  }

  /**
   * Start or resume playback
   */
  async play(): Promise<void> {
    this.initContext()
    if (!this.audioContext || this.audioBuffers.length === 0) return

    // Resume context if suspended
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }

    if (this.isPlaying) return

    this.isPlaying = true
    this.startTime = this.audioContext.currentTime - this.pauseTime
    this.playFromTime(this.pauseTime)
    this.startTimeUpdate()
    this.notifyStateChange()
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (!this.isPlaying) return

    this.pauseTime = this.getCurrentTime()
    this.stopCurrentSource()
    this.stopTimeUpdate()
    this.notifyStateChange()
  }

  /**
   * Toggle play/pause
   */
  togglePlayPause(): void {
    if (this.isPlaying) {
      this.pause()
    } else {
      this.play()
    }
  }

  /**
   * Stop playback completely
   */
  stop(): void {
    this.stopCurrentSource()
    this.pauseTime = 0
    this.currentChunkIndex = 0
    this.stopTimeUpdate()
    this.notifyStateChange()
  }

  /**
   * Seek to a specific time
   */
  seek(time: number): void {
    const wasPlaying = this.isPlaying

    // Stop current playback first
    this.stopCurrentSource()

    this.pauseTime = Math.max(0, Math.min(time, this.getDuration()))

    // Immediately notify state change so UI updates instantly
    this.notifyStateChange()

    if (wasPlaying) {
      // Restart playback from new position
      this.isPlaying = true
      if (this.audioContext) {
        this.startTime = this.audioContext.currentTime - this.pauseTime
      }
      this.playFromTime(this.pauseTime)
      this.startTimeUpdate()
      this.notifyStateChange()
    }
  }

  /**
   * Get total duration of all chunks
   */
  getDuration(): number {
    return this.chunks.reduce((total, chunk) => total + chunk.duration, 0)
  }

  /**
   * Get current playback time
   */
  getCurrentTime(): number {
    if (!this.audioContext || !this.isPlaying) {
      return this.pauseTime
    }
    const time = this.audioContext.currentTime - this.startTime
    return Math.min(time, this.getDuration())
  }

  /**
   * Get the full audio buffer (for download)
   */
  getFullBuffer(): Float32Array | null {
    if (this.chunks.length === 0) return null

    const silenceGap = 0.3 // seconds between chunks
    const silenceSamples = Math.floor(silenceGap * this.sampleRate)

    // Calculate total length
    let totalLength = this.chunks.reduce((sum, chunk) => sum + chunk.buffer.length, 0)
    totalLength += silenceSamples * (this.chunks.length - 1)

    const result = new Float32Array(totalLength)
    let offset = 0

    for (let i = 0; i < this.chunks.length; i++) {
      result.set(this.chunks[i].buffer, offset)
      offset += this.chunks[i].buffer.length

      // Add silence between chunks (not after the last one)
      if (i < this.chunks.length - 1) {
        offset += silenceSamples
      }
    }

    return result
  }

  /**
   * Set callback for state changes
   */
  setOnStateChange(callback: StateChangeCallback | null): void {
    this.onStateChange = callback
  }

  /**
   * Get current state
   */
  getState(): StreamingPlayerState {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.getCurrentTime(),
      duration: this.getDuration(),
      isComplete: this.isComplete,
    }
  }

  /**
   * Get the sample rate of the audio
   */
  getSampleRate(): number {
    return this.sampleRate
  }

  private playFromTime(time: number): void {
    if (!this.audioContext) return

    // Find which chunk and offset to start from
    let accumulatedTime = 0
    let chunkIndex = 0
    let offsetInChunk = 0
    const silenceGap = 0.3

    for (let i = 0; i < this.chunks.length; i++) {
      const chunkDuration = this.chunks[i].duration
      const chunkEndTime = accumulatedTime + chunkDuration
      const chunkEndWithSilence = accumulatedTime + chunkDuration + (i < this.chunks.length - 1 ? silenceGap : 0)

      // Check if time falls within this chunk's audio (not the silence gap)
      if (time >= accumulatedTime && time < chunkEndTime) {
        chunkIndex = i
        offsetInChunk = time - accumulatedTime
        break
      }

      // Check if time falls in the silence gap after this chunk - snap to next chunk
      if (time >= chunkEndTime && time < chunkEndWithSilence && i < this.chunks.length - 1) {
        chunkIndex = i + 1
        offsetInChunk = 0
        break
      }

      accumulatedTime = chunkEndWithSilence
      chunkIndex = i + 1
    }

    if (chunkIndex >= this.audioBuffers.length) {
      // Reached the end
      this.isPlaying = false
      this.pauseTime = 0
      this.stopTimeUpdate()
      this.notifyStateChange()
      return
    }

    // Safety check: ensure offset doesn't exceed chunk duration
    const maxOffset = this.chunks[chunkIndex]?.duration || 0
    if (offsetInChunk >= maxOffset) {
      // Snap to next chunk
      chunkIndex++
      offsetInChunk = 0
      if (chunkIndex >= this.audioBuffers.length) {
        this.isPlaying = false
        this.pauseTime = 0
        this.stopTimeUpdate()
        this.notifyStateChange()
        return
      }
    }

    this.currentChunkIndex = chunkIndex
    this.scheduleChunk(chunkIndex, offsetInChunk)
  }

  private scheduleChunk(index: number, offset: number = 0): void {
    if (!this.audioContext || index >= this.audioBuffers.length) {
      // No more chunks to play
      if (this.isComplete && index >= this.audioBuffers.length) {
        this.isPlaying = false
        this.pauseTime = 0
        this.stopTimeUpdate()
        this.notifyStateChange()
      }
      return
    }

    // Capture the current playback version to check in callbacks
    const version = this.playbackVersion

    const buffer = this.audioBuffers[index]
    const source = this.audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(this.audioContext.destination)

    source.onended = () => {
      // Only proceed if this callback is still valid (not from a stale seek)
      if (version !== this.playbackVersion) return
      if (!this.isPlaying) return
      if (this.currentChunkIndex !== index) return

      this.currentChunkIndex++

      // Add silence gap between chunks
      this.silenceTimeout = window.setTimeout(() => {
        // Check again after the timeout
        if (version !== this.playbackVersion) return
        if (this.isPlaying) {
          this.scheduleChunk(this.currentChunkIndex)
        }
      }, 300) // 0.3s silence gap
    }

    this.currentSource = source
    source.start(0, offset)
  }

  private stopCurrentSource(): void {
    // Increment version to invalidate any pending callbacks
    this.playbackVersion++

    // Clear any pending silence timeout
    if (this.silenceTimeout !== null) {
      clearTimeout(this.silenceTimeout)
      this.silenceTimeout = null
    }

    // Set isPlaying false BEFORE stopping to prevent onended from scheduling
    this.isPlaying = false

    if (this.currentSource) {
      // Remove the onended handler before stopping
      this.currentSource.onended = null
      try {
        this.currentSource.stop()
        this.currentSource.disconnect()
      } catch {
        // Ignore errors if already stopped
      }
      this.currentSource = null
    }
  }

  private startTimeUpdate(): void {
    this.stopTimeUpdate()
    this.timeUpdateInterval = window.setInterval(() => {
      this.notifyStateChange()

      // Check if we've reached the end
      const currentTime = this.getCurrentTime()
      const duration = this.getDuration()
      if (this.isComplete && currentTime >= duration && this.isPlaying) {
        this.isPlaying = false
        this.pauseTime = 0
        this.stopTimeUpdate()
        this.notifyStateChange()
      }
    }, 100)
  }

  private stopTimeUpdate(): void {
    if (this.timeUpdateInterval !== null) {
      clearInterval(this.timeUpdateInterval)
      this.timeUpdateInterval = null
    }
  }

  private notifyStateChange(): void {
    this.onStateChange?.(this.getState())
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stop()
    this.audioContext?.close()
    this.audioContext = null
    this.chunks = []
    this.audioBuffers = []
  }
}

// Singleton instance
let playerInstance: StreamingAudioPlayer | null = null

export function getStreamingPlayer(): StreamingAudioPlayer {
  if (!playerInstance) {
    playerInstance = new StreamingAudioPlayer()
  }
  return playerInstance
}
