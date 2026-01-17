'use client';

/**
 * Audio Preprocessing Service
 *
 * Provides preprocessing tools for field recordings:
 * - Denoising (spectral gating)
 * - Normalization (peak/RMS)
 * - High-pass filtering (remove rumble)
 * - Resampling
 *
 * Designed for ecology/ethnomusicology field recordings
 * that often have environmental noise (wind, rain, insects)
 */

export interface PreprocessingOptions {
  normalize?: boolean;
  normalizeMethod?: 'peak' | 'rms';
  normalizeTarget?: number; // dB, default -3
  denoise?: boolean;
  denoiseStrength?: number; // 0-1, default 0.5
  highPassFreq?: number; // Hz, 0 to disable
  lowPassFreq?: number; // Hz, 0 to disable
  resampleRate?: number; // Hz, 0 to keep original
}

export interface PreprocessingResult {
  buffer: AudioBuffer;
  appliedSteps: string[];
  stats: {
    originalPeak: number;
    processedPeak: number;
    originalRMS: number;
    processedRMS: number;
    duration: number;
    sampleRate: number;
  };
}

/**
 * Calculate RMS level of audio data
 */
function calculateRMS(data: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i];
  }
  return Math.sqrt(sum / data.length);
}

/**
 * Calculate peak level of audio data
 */
function calculatePeak(data: Float32Array): number {
  let peak = 0;
  for (let i = 0; i < data.length; i++) {
    const abs = Math.abs(data[i]);
    if (abs > peak) peak = abs;
  }
  return peak;
}

/**
 * DB to linear conversion
 */
function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * Linear to dB conversion
 */
function linearToDb(linear: number): number {
  return 20 * Math.log10(Math.max(linear, 1e-10));
}

/**
 * Apply peak normalization
 */
function normalizePeak(data: Float32Array, targetDb: number = -3): void {
  const peak = calculatePeak(data);
  if (peak === 0) return;

  const targetLinear = dbToLinear(targetDb);
  const gain = targetLinear / peak;

  for (let i = 0; i < data.length; i++) {
    data[i] *= gain;
  }
}

/**
 * Apply RMS normalization
 */
function normalizeRMS(data: Float32Array, targetDb: number = -18): void {
  const rms = calculateRMS(data);
  if (rms === 0) return;

  const targetLinear = dbToLinear(targetDb);
  const gain = targetLinear / rms;

  // Apply with soft limiting to prevent clipping
  for (let i = 0; i < data.length; i++) {
    let sample = data[i] * gain;
    // Soft clip at 0.95
    if (sample > 0.95) sample = 0.95 + (sample - 0.95) * 0.1;
    if (sample < -0.95) sample = -0.95 + (sample + 0.95) * 0.1;
    data[i] = sample;
  }
}

/**
 * Simple spectral gating for noise reduction
 * Uses FFT to identify and attenuate noise floor
 */
function spectralGate(
  data: Float32Array,
  sampleRate: number,
  strength: number = 0.5
): void {
  const frameSize = 2048;
  const hopSize = 512;
  const numFrames = Math.floor((data.length - frameSize) / hopSize);

  // Estimate noise floor from quietest frames
  const frameEnergies: number[] = [];
  for (let frame = 0; frame < numFrames; frame++) {
    const start = frame * hopSize;
    let energy = 0;
    for (let i = 0; i < frameSize; i++) {
      energy += data[start + i] * data[start + i];
    }
    frameEnergies.push(energy);
  }

  // Sort to find noise floor (bottom 10% of frames)
  const sorted = [...frameEnergies].sort((a, b) => a - b);
  const noiseFloorIdx = Math.floor(sorted.length * 0.1);
  const noiseFloor = sorted[noiseFloorIdx] || 0;

  // Threshold above noise floor
  const threshold = noiseFloor * (2 + strength * 8); // Higher strength = more gating

  // Apply simple amplitude gating
  for (let frame = 0; frame < numFrames; frame++) {
    const start = frame * hopSize;
    let energy = 0;
    for (let i = 0; i < frameSize; i++) {
      energy += data[start + i] * data[start + i];
    }

    if (energy < threshold) {
      // Attenuate this frame
      const attenuation = Math.sqrt(energy / threshold) * (1 - strength * 0.8);
      for (let i = 0; i < hopSize && start + i < data.length; i++) {
        data[start + i] *= attenuation;
      }
    }
  }
}

/**
 * Apply high-pass filter (remove low frequency rumble)
 */
function highPassFilter(
  data: Float32Array,
  sampleRate: number,
  cutoffHz: number
): void {
  // Simple first-order IIR high-pass filter
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / sampleRate;
  const alpha = rc / (rc + dt);

  let prevInput = data[0];
  let prevOutput = data[0];

  for (let i = 1; i < data.length; i++) {
    const input = data[i];
    const output = alpha * (prevOutput + input - prevInput);
    data[i] = output;
    prevInput = input;
    prevOutput = output;
  }
}

/**
 * Apply low-pass filter
 */
function lowPassFilter(
  data: Float32Array,
  sampleRate: number,
  cutoffHz: number
): void {
  // Simple first-order IIR low-pass filter
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / sampleRate;
  const alpha = dt / (rc + dt);

  let prevOutput = data[0];

  for (let i = 1; i < data.length; i++) {
    const output = prevOutput + alpha * (data[i] - prevOutput);
    data[i] = output;
    prevOutput = output;
  }
}

/**
 * Resample audio to target sample rate using OfflineAudioContext
 */
async function resampleAudio(
  buffer: AudioBuffer,
  targetRate: number
): Promise<AudioBuffer> {
  const duration = buffer.duration;
  const numChannels = buffer.numberOfChannels;
  const newLength = Math.ceil(duration * targetRate);

  const offlineCtx = new OfflineAudioContext(numChannels, newLength, targetRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(offlineCtx.destination);
  source.start();

  return await offlineCtx.startRendering();
}

/**
 * Main preprocessing function
 */
export async function preprocessAudio(
  audioBuffer: AudioBuffer,
  options: PreprocessingOptions = {}
): Promise<PreprocessingResult> {
  const {
    normalize = true,
    normalizeMethod = 'peak',
    normalizeTarget = -3,
    denoise = false,
    denoiseStrength = 0.5,
    highPassFreq = 0,
    lowPassFreq = 0,
    resampleRate = 0,
  } = options;

  const appliedSteps: string[] = [];
  let workingBuffer = audioBuffer;
  const sampleRate = audioBuffer.sampleRate;

  // Calculate original stats
  const originalData = audioBuffer.getChannelData(0);
  const originalPeak = calculatePeak(originalData);
  const originalRMS = calculateRMS(originalData);

  // Resampling (if needed)
  if (resampleRate > 0 && resampleRate !== sampleRate) {
    workingBuffer = await resampleAudio(workingBuffer, resampleRate);
    appliedSteps.push(`Resampled to ${resampleRate} Hz`);
  }

  // Process each channel
  const ctx = new AudioContext();
  const outputBuffer = ctx.createBuffer(
    workingBuffer.numberOfChannels,
    workingBuffer.length,
    workingBuffer.sampleRate
  );

  for (let channel = 0; channel < workingBuffer.numberOfChannels; channel++) {
    const data = new Float32Array(workingBuffer.getChannelData(channel));

    // High-pass filter
    if (highPassFreq > 0) {
      highPassFilter(data, workingBuffer.sampleRate, highPassFreq);
      if (channel === 0) appliedSteps.push(`High-pass filter at ${highPassFreq} Hz`);
    }

    // Low-pass filter
    if (lowPassFreq > 0) {
      lowPassFilter(data, workingBuffer.sampleRate, lowPassFreq);
      if (channel === 0) appliedSteps.push(`Low-pass filter at ${lowPassFreq} Hz`);
    }

    // Denoising
    if (denoise) {
      spectralGate(data, workingBuffer.sampleRate, denoiseStrength);
      if (channel === 0) appliedSteps.push(`Noise reduction (${Math.round(denoiseStrength * 100)}%)`);
    }

    // Normalization
    if (normalize) {
      if (normalizeMethod === 'peak') {
        normalizePeak(data, normalizeTarget);
        if (channel === 0) appliedSteps.push(`Peak normalized to ${normalizeTarget} dB`);
      } else {
        normalizeRMS(data, normalizeTarget - 15); // RMS target is usually lower
        if (channel === 0) appliedSteps.push(`RMS normalized to ${normalizeTarget - 15} dB`);
      }
    }

    outputBuffer.copyToChannel(data, channel);
  }

  // Calculate processed stats
  const processedData = outputBuffer.getChannelData(0);
  const processedPeak = calculatePeak(processedData);
  const processedRMS = calculateRMS(processedData);

  await ctx.close();

  return {
    buffer: outputBuffer,
    appliedSteps,
    stats: {
      originalPeak,
      processedPeak,
      originalRMS,
      processedRMS,
      duration: outputBuffer.duration,
      sampleRate: outputBuffer.sampleRate,
    },
  };
}

/**
 * Quick presets for common use cases
 */
export const PRESETS = {
  fieldRecording: {
    normalize: true,
    normalizeMethod: 'peak' as const,
    normalizeTarget: -3,
    denoise: true,
    denoiseStrength: 0.3,
    highPassFreq: 80,
    lowPassFreq: 0,
  },
  speech: {
    normalize: true,
    normalizeMethod: 'rms' as const,
    normalizeTarget: -18,
    denoise: true,
    denoiseStrength: 0.5,
    highPassFreq: 100,
    lowPassFreq: 8000,
  },
  music: {
    normalize: true,
    normalizeMethod: 'peak' as const,
    normalizeTarget: -1,
    denoise: false,
    denoiseStrength: 0,
    highPassFreq: 20,
    lowPassFreq: 0,
  },
  ecology: {
    normalize: true,
    normalizeMethod: 'peak' as const,
    normalizeTarget: -6,
    denoise: true,
    denoiseStrength: 0.2,
    highPassFreq: 0, // Keep low frequencies for some species
    lowPassFreq: 0,
  },
};

const audioPreprocessing = {
  preprocessAudio,
  PRESETS,
  calculateRMS,
  calculatePeak,
  linearToDb,
  dbToLinear,
};

export default audioPreprocessing;
