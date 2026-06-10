/**
 * AudioEngine — Unified AudioContext lifecycle, decode, and resample
 *
 * Replaces the 6+ ad-hoc AudioContext patterns scattered across pages.
 * All audio decoding, resampling, and offline processing goes through here.
 */

let sharedContext: AudioContext | null = null;

export function getSharedAudioContext(): AudioContext {
  if (!sharedContext) {
    sharedContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return sharedContext;
}

/**
 * Safely decode an audio file to AudioBuffer.
 * Uses a temporary context that is immediately closed to avoid memory leaks.
 */
export async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioContextClass();
  try {
    return await ctx.decodeAudioData(arrayBuffer);
  } finally {
    await ctx.close();
  }
}

/**
 * Decode from an ArrayBuffer directly.
 */
export async function decodeArrayBuffer(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioContextClass();
  try {
    return await ctx.decodeAudioData(arrayBuffer);
  } finally {
    await ctx.close();
  }
}

/**
 * Decode from a Blob.
 */
export async function decodeBlob(blob: Blob): Promise<AudioBuffer> {
  const arrayBuffer = await blob.arrayBuffer();
  return decodeArrayBuffer(arrayBuffer);
}

/**
 * Resample an AudioBuffer to a target sample rate using OfflineAudioContext.
 */
export async function resampleAudioBuffer(
  buffer: AudioBuffer,
  targetSampleRate: number
): Promise<AudioBuffer> {
  const numChannels = buffer.numberOfChannels;
  const duration = buffer.duration;
  const newLength = Math.ceil(duration * targetSampleRate);

  const offlineCtx = new OfflineAudioContext(numChannels, newLength, targetSampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(offlineCtx.destination);
  source.start();

  return await offlineCtx.startRendering();
}

/**
 * Create a stereo AudioBuffer from left/right Float32Arrays.
 */
export function createStereoBuffer(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number
): AudioBuffer {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioContextClass();
  const length = left.length;
  const buffer = ctx.createBuffer(2, length, sampleRate);
  buffer.copyToChannel(new Float32Array(left), 0);
  buffer.copyToChannel(new Float32Array(right), 1);
  ctx.close();
  return buffer;
}

/**
 * Close the shared context and release resources.
 * Call this when the app is unmounting or on explicit user action.
 */
export async function disposeAudioEngine(): Promise<void> {
  if (sharedContext) {
    await sharedContext.close();
    sharedContext = null;
  }
}

/**
 * Check whether the browser supports the Web Audio API.
 */
export function isAudioApiSupported(): boolean {
  return !!(window.AudioContext || (window as any).webkitAudioContext);
}

/**
 * Resume the shared AudioContext (required after a user gesture).
 */
export async function resumeAudioContext(): Promise<void> {
  const ctx = getSharedAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}
