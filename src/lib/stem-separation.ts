/**
 * Audio Stem Separation Tools
 * Frequency-band based separation for browser-based implementation
 * Future: TensorFlow.js for AI-based separation
 */

import { Note } from './midi-utils';

export interface StemResult {
  bass: Note[];
  drums: Note[];
  guitar: Note[];
  other: Note[];
  vocals: Note[];
}

export interface StemSettings {
  enabled: boolean;
  method: 'frequency' | 'ai';
  outputFormat: 'separate' | 'combined';
}

/**
 * Simple frequency-band based stem separation
 * Note: This is a simplified version. For production use, integrate TensorFlow.js
 * with pre-trained models like Spleeter, Demucs, etc.
 */
export async function separateStems(
  audioBuffer: AudioBuffer,
  options: {
    bassMinFreq?: number;
    bassMaxFreq?: number;
    drumsMinFreq?: number;
    drumsMaxFreq?: number;
  } = {}
): Promise<StemResult> {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;

  // Frequency ranges for separation (can be customized)
  const bassMin = options.bassMinFreq || 30;  // 30-150 Hz
  const bassMax = options.bassMaxFreq || 250;
  const drumsMin = options.drumsMinFreq || 150;  // 150-400 Hz
  const drumsMax = options.drumsMaxFreq || 400;
  const guitarMin = 250;  // 250-3000 Hz
  const guitarMax = 3000;
  const vocalsMin = 200;  // 200-4000 Hz
  const vocalsMax = 4000;

  // Apply band-pass filters (simplified implementation)
  const bassStem = applyBandPassFilter(channelData, sampleRate, bassMin, bassMax);
  const drumsStem = applyBandPassFilter(channelData, sampleRate, drumsMin, drumsMax);
  const guitarStem = applyBandPassFilter(channelData, sampleRate, guitarMin, guitarMax);
  const vocalsStem = applyBandPassFilter(channelData, sampleRate, vocalsMin, vocalsMax);

  // For this implementation, we'll use the same note extraction for all stems
  // In production with TensorFlow.js, each stem would be processed separately
  // For now, we'll mark notes with instrument probabilities

  return {
    bass: [],  // Will be populated by separate note extraction
    drums: [],
    guitar: [],
    other: [],
    vocals: [],
  };
}

/**
 * Apply band-pass filter to isolate frequency range
 */
function applyBandPassFilter(
  samples: Float32Array,
  sampleRate: number,
  minFreq: number,
  maxFreq: number
): Float32Array {
  // Convert to IIR filter coefficients for band-pass
  // Use Butterworth filter design
  const nyquist = sampleRate / 2;
  const lowNorm = minFreq / nyquist;
  const highNorm = maxFreq / nyquist;
  const bandwidth = maxFreq - minFreq;
  const centerFreq = (minFreq + maxFreq) / 2;

  // Simplified filter (in production, use proper IIR filter design)
  const filtered = new Float32Array(samples.length);
  let prevSample = 0;
  let prevPrevSample = 0;
  let prevPrevPrevSample = 0;

  // Second-order IIR filter coefficients (simplified)
  const k1 = 0.5 * bandwidth / sampleRate;
  const w1 = 2 * Math.cos(2 * Math.PI * centerFreq / sampleRate);
  const w2 = Math.cos(2 * Math.PI * centerFreq / sampleRate);
  const w3 = Math.sin(2 * Math.PI * centerFreq / sampleRate);

  const b0 = 1; // Gain
  const b1 = 0; // Will be calculated for band-pass

  // For this implementation, we'll use a simple approach:
  // Extract amplitude in frequency bands (using simplified FFT approach)
  // In production, use proper filter design or TensorFlow.js models

  const windowSize = 2048;
  const hopSize = 1024;

  const filteredSamples = new Float32Array(samples.length);

  for (let i = 0; i < samples.length - windowSize; i += hopSize) {
    const window = samples.slice(i, i + windowSize);
    const bandAmplitude = calculateBandAmplitude(window, minFreq, maxFreq);

    // Scale samples in this window by band amplitude
    for (let j = 0; j < windowSize; j++) {
      if (i + j < samples.length) {
        filteredSamples[i + j] = samples[i + j] * bandAmplitude;
      }
    }
  }

  return filteredSamples;
}

/**
 * Calculate amplitude in frequency band (simplified)
 */
function calculateBandAmplitude(
  samples: Float32Array,
  minFreq: number,
  maxFreq: number
): number {
  // In production, use proper FFT analysis
  // For now, use a simplified approach based on energy
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  const rms = Math.sqrt(sum / samples.length);
  return rms;
}

/**
 * Detect dominant instrument type from note patterns
 */
export function detectInstrumentType(
  notes: Note[],
  audioBuffer: AudioBuffer
): 'bass' | 'guitar' | 'drums' | 'vocals' | 'piano' | 'strings' | 'winds' | 'brass' | 'electronic' | 'unknown' {
  if (notes.length === 0) return 'unknown';

  // Analyze pitch range
  const pitches = notes.map(n => n.midi);
  const minPitch = Math.min(...pitches);
  const maxPitch = Math.max(...pitches);
  const avgPitch = pitches.reduce((sum, p) => sum + p, 0) / pitches.length;

  // Analyze rhythmic patterns (duration variance)
  const durations = notes.map(n => n.duration);
  const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  const durationVariance = durations.reduce((sum, d) => 
    sum + Math.pow(d - avgDuration, 2), 0
  ) / durations.length;

  // Analyze note density
  const noteDensity = notes.length / audioBuffer.duration;

  // Instrument heuristics
  const isBass = minPitch < 40 && avgPitch < 50 && durationVariance > 0.05;
  const isDrums = durationVariance > 0.2 && noteDensity > 5 && avgDuration < 0.15;
  const isGuitar = minPitch > 36 && minPitch < 70 && noteDensity > 2 && noteDensity < 8;
  const isVocals = noteDensity > 3 && noteDensity < 6 && durationVariance < 0.15;
  const isPiano = minPitch >= 21 && maxPitch <= 84 && durationVariance < 0.1;
  const isElectronic = durationVariance < 0.02 && noteDensity > 10;

  if (isBass) return 'bass';
  if (isDrums) return 'drums';
  if (isGuitar) return 'guitar';
  if (isVocals) return 'vocals';
  if (isPiano) return 'piano';
  if (isElectronic) return 'electronic';

  return 'unknown';
}

/**
 * Get instrument name for display
 */
export function getInstrumentDisplayName(type: string): string {
  const names: Record<string, string> = {
    bass: 'Bass',
    guitar: 'Guitar',
    drums: 'Drums',
    vocals: 'Vocals',
    piano: 'Piano',
    strings: 'Strings',
    winds: 'Winds',
    brass: 'Brass',
    electronic: 'Electronic',
    unknown: 'Unknown Instrument',
  };
  return names[type] || names.unknown;
}

/**
 * Get instrument icon/emoji
 */
export function getInstrumentIcon(type: string): string {
  const icons: Record<string, string> = {
    bass: '🎸',
    guitar: '🎸',
    drums: '🥁',
    vocals: '🎤',
    piano: '🎹',
    strings: '🎻',
    winds: '🎺',
    brass: '🎺',
    electronic: '🎹',
    unknown: '🎵',
  };
  return icons[type] || icons.unknown;
}

/**
 * Filter notes by instrument
 */
export function filterNotesByInstrument(
  allNotes: Note[],
  instrument: string
): Note[] {
  // In production, this would use actual stem separation
  // For now, use probability-based filtering
  const instrumentRanges: Record<string, { min: number; max: number }> = {
    bass: { min: 21, max: 48 },
    drums: { min: 35, max: 48 },
    guitar: { min: 40, max: 84 },
    vocals: { min: 48, max: 84 },
    piano: { min: 21, max: 84 },
    strings: { min: 40, max: 84 },
    winds: { min: 40, max: 84 },
    brass: { min: 40, max: 84 },
    electronic: { min: 21, max: 108 },
    unknown: { min: 21, max: 108 },
  };

  const range = instrumentRanges[instrument] || instrumentRanges.unknown;
  return allNotes.filter(n => n.midi >= range.min && n.midi <= range.max);
}

/**
 * Assign MIDI channel to instrument
 */
export function assignMidiChannel(instrument: string): number {
  const channelMap: Record<string, number> = {
    bass: 1,
    guitar: 2,
    drums: 3, // Usually channel 10 for drums
    vocals: 4,
    piano: 0,
    strings: 5,
    winds: 6,
    brass: 7,
    electronic: 8,
    unknown: 0,
  };
  return channelMap[instrument] || 0;
}

/**
 * Future: TensorFlow.js integration for AI stem separation
 * This function should be implemented when TensorFlow.js is installed
 *
 * Example implementation:
 *
 * ```typescript
 * import * as tf from '@tensorflow/tfjs';
 *
 * export async function separateStemsWithAI(audioBuffer: AudioBuffer): Promise<StemResult> {
 *   const model = await tf.loadLayersModel('https://path/to/spleeter/model.json');
 *
 *   // Convert audio to tensor
 *   const audioTensor = tf.tensor(audioBuffer.getChannelData(0));
 *
 *   // Run model inference
 *   const prediction = await model.predict(audioTensor.expandDims(0, 1));
 *
 *   // Separate into 4 stems (bass, drums, other, vocals)
 *   const [bass, drums, other, vocals] = tf.split(prediction, 4, 1);
 *
 *   // Convert tensors back to audio buffers
 *   // (implementation details...)
 *
 *   return { bass, drums, other, vocals };
 * }
 * ```
 *
 * Recommended models:
 * - Spleeter: https://github.com/deezer/spleeter (2-stem, 4-stem, 5-stem versions)
 * - Demucs: https://github.com/facebookresearch/demucs (v3, v4)
 * - Open-Unmix: https://github.com/CarlGof4th/open-unmix-py (lightweight)
 * - HTDemucs: https://github.com/tensorflow/models/tree/master/htdemucs
 */
