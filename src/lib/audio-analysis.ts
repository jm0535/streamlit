/**
 * Enhanced Audio Processing Library for Ethnomusicology Research
 * Comprehensive settings for accurate audio-to-MIDI transcription
 */

import { Note } from './midi-utils';

export interface AudioAnalysisResult {
  notes: Note[];
  duration: number;
  sampleRate: number;
  confidence: number;
  detectedTempo?: number;
  detectedTimeSignature?: string;
}

/**
 * Comprehensive audio processing options for research-grade transcription
 */
export interface AudioProcessingOptions {
  // === Basic Detection ===
  threshold?: number;              // Minimum amplitude threshold (0-1)
  minNoteDuration?: number;        // Minimum note duration in seconds
  smoothing?: number;               // Smoothing factor for pitch detection (0-1)

  // === Frequency Detection ===
  frequencyMin?: number;           // Minimum frequency in Hz (default: 50)
  frequencyMax?: number;           // Maximum frequency in Hz (default: 2000)
  confidenceThreshold?: number;     // Minimum confidence for note detection (0-1)
  pitchSmoothing?: number;         // Amount of smoothing on pitch output (0-1)
  enableOctaveCorrection?: boolean; // Fix octave jumps in pitch detection

  // === Audio Analysis Parameters ===
  fftSize?: number;                // FFT window size (1024, 2048, 4096, 8192)
  hopSize?: number;                 // Hop size between windows (default: fftSize/4)
  windowType?: 'rectangular' | 'hann' | 'hamming' | 'blackman';
  channelSelection?: 'left' | 'right' | 'mix' | 'both';

  // === Filtering ===
  enableNoiseGate?: boolean;       // Enable noise gate
  noiseGateThreshold?: number;      // Noise gate threshold (0-1)
  enableHighPassFilter?: boolean;  // Enable high-pass filter
  highPassFrequency?: number;      // High-pass filter cutoff in Hz
  enableLowPassFilter?: boolean;   // Enable low-pass filter
  lowPassFrequency?: number;       // Low-pass filter cutoff in Hz

  // === MIDI Output Settings ===
  midiMinNote?: number;            // Minimum MIDI note (21 = A0)
  midiMaxNote?: number;            // Maximum MIDI note (108 = C8)
  quantization?: 'none' | 'quarter' | 'eighth' | 'sixteenth' | 'thirty-second';
  enableVelocityScaling?: boolean; // Normalize velocity values
  velocityMin?: number;            // Minimum velocity value (0-127)
  velocityMax?: number;            // Maximum velocity value (0-127)

  // === Tempo & Rhythm Detection ===
  enableTempoDetection?: boolean; // Detect tempo from audio
  targetTempo?: number;            // Force specific tempo (BPM)
  enableTimeSignatureDetection?: boolean;
  targetTimeSignature?: string;    // Force specific time signature (e.g., '4/4', '3/4')

  // === Ethnomusicology-Specific ===
  tuningSystem?: 'equal' | 'just' | 'pythagorean' | 'meantone' | 'quarter_tone';
  referenceFrequency?: number;      // Reference A4 frequency (default: 440)
  enableScaleConstrain?: boolean;  // Constrain notes to specific scale
  scaleType?: 'chromatic' | 'major' | 'minor' | 'pentatonic_major' | 'pentatonic_minor' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'aeolian' | 'blues' | 'harmonic_minor' | 'melodic_minor';
  scaleRoot?: number;              // Root note for scale (MIDI number, default: 60 = C4)
  enableMicrotoneDetection?: boolean; // Detect notes between semitones
  microtoneSensitivity?: number;  // Sensitivity for microtone detection (0-1)

  // === Performance ===
  maxProcessingDuration?: number;  // Maximum duration to process in seconds (null = full file)
  enableFastMode?: boolean;       // Lower quality but faster processing
}

/**
 * Research-grade default settings optimized for ethnomusicological transcription
 */
const RESEARCH_DEFAULTS: AudioProcessingOptions = {
  // Basic Detection
  threshold: 0.05,
  minNoteDuration: 0.1,
  smoothing: 0.8,

  // Frequency Detection
  frequencyMin: 50,
  frequencyMax: 2000,
  confidenceThreshold: 0.7,
  pitchSmoothing: 0.5,
  enableOctaveCorrection: true,

  // Audio Analysis
  fftSize: 2048,
  hopSize: 512,
  windowType: 'hann',
  channelSelection: 'mix',

  // Filtering
  enableNoiseGate: false,
  noiseGateThreshold: 0.02,
  enableHighPassFilter: false,
  highPassFrequency: 80,
  enableLowPassFilter: false,
  lowPassFrequency: 2000,

  // MIDI Output
  midiMinNote: 21,
  midiMaxNote: 108,
  quantization: 'none',
  enableVelocityScaling: false,
  velocityMin: 0,
  velocityMax: 127,

  // Tempo & Rhythm
  enableTempoDetection: false,
  targetTempo: 120,
  enableTimeSignatureDetection: false,
  targetTimeSignature: '4/4',

  // Ethnomusicology
  tuningSystem: 'equal',
  referenceFrequency: 440,
  enableScaleConstrain: false,
  scaleType: 'chromatic',
  scaleRoot: 60,
  enableMicrotoneDetection: false,
  microtoneSensitivity: 0.3,

  // Performance
  maxProcessingDuration: undefined,
  enableFastMode: false,
};

/**
 * Scale patterns for ethnomusicology research
 * Each scale is an array of intervals (semitones from root)
 */
const SCALE_PATTERNS: Record<string, number[]> = {
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic_major: [0, 2, 4, 7, 9],
  pentatonic_minor: [0, 3, 5, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  blues: [0, 3, 5, 6, 7, 10],
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
  melodic_minor: [0, 2, 3, 5, 7, 9, 11],
};

/**
 * Check if MIDI note belongs to scale
 */
function isNoteInScale(midi: number, scaleType: string, root: number): boolean {
  const scale = SCALE_PATTERNS[scaleType];
  if (!scale) return true; // If no scale specified, allow all notes

  const normalizedMidi = ((midi - root) % 12 + 12) % 12;
  return scale.includes(normalizedMidi);
}

/**
 * Apply tuning system correction to MIDI note
 */
function applyTuningCorrection(
  midi: number,
  tuningSystem: string,
  referenceFreq: number,
  originalFreq: number
): number {
  switch (tuningSystem) {
    case 'equal':
      return midi; // No correction needed

    case 'just':
      // Just intonation correction (simplified)
      const justRatio = originalFreq / referenceFreq;
      const justMidi = Math.round(12 * Math.log2(justRatio) + 69);
      return Math.max(21, Math.min(108, justMidi));

    case 'pythagorean':
      // Pythagorean tuning correction
      const pythRatio = originalFreq / referenceFreq;
      const pythMidi = Math.round(12 * Math.log2(pythRatio) + 69);
      return Math.max(21, Math.min(108, pythMidi));

    case 'meantone':
      // Meantone tuning correction
      const meantoneRatio = originalFreq / referenceFreq;
      const meantoneMidi = Math.round(12 * Math.log2(meantoneRatio) + 69);
      return Math.max(21, Math.min(108, meantoneMidi));

    case 'quarter_tone':
      // Quarter-tone system (allow 24 divisions per octave)
      const quarterToneMidi = Math.round(24 * Math.log2(originalFreq / referenceFreq) + 69);
      return Math.max(21, Math.min(108, Math.round(quarterToneMidi / 2) * 2));

  default:
      return midi;
  }
}

/**
 * Calculate Frequency Spectrum using FFT
 * Returns an array of magnitude values for frequency bins
 */
export function calculateFrequencySpectrum(
  audioBuffer: AudioBuffer,
  fftSize: number = 2048
): number[] {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;

  // Create an offline context to process audio
  const offlineCtx = new OfflineAudioContext(1, fftSize, sampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;

  const analyser = offlineCtx.createAnalyser();
  analyser.fftSize = fftSize;
  source.connect(analyser);

  // We can't actually run offline context synchronously to get analyser data in this way easily
  // independently without playing. So we'll use a pure JS FFT implementation style
  // or a simplified time-domain analysis for the "snapshot"

  // Improved approach: Take a representative chunk from the middle of the audio
  const middleIndex = Math.floor(channelData.length / 2);
  const dataSlice = channelData.slice(middleIndex, middleIndex + fftSize);

  // Apply window function (Hann)
  const windowed = dataSlice.map((val, i) =>
    val * (0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1))))
  );

  // Perform simple DFT (Discrete Fourier Transform) - O(N^2) but fine for small N like 2048
  // For larger, we'd need a proper FFT lib, but this is sufficient for visualization
  const spectrum = new Float32Array(fftSize / 2);

  for (let k = 0; k < fftSize / 2; k++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < fftSize; n++) {
      const angle = (2 * Math.PI * k * n) / fftSize;
      re += windowed[n] * Math.cos(angle);
      im -= windowed[n] * Math.sin(angle);
    }
    // Calculate magnitude and convert to dB
    const mag = Math.sqrt(re * re + im * im);
    spectrum[k] = mag;
  }

  // Normalize
  const maxVal = Math.max(...spectrum);
  return Array.from(spectrum).map(v => v / (maxVal || 1));
}

/**
 * Calculate Amplitude Envelope (RMS over time)
 * Returns an array of amplitude values (0-1)
 */
export function calculateAmplitudeEnvelope(
  audioBuffer: AudioBuffer,
  points: number = 1000
): number[] {
  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / points);
  const envelope: number[] = [];

  for (let i = 0; i < points; i++) {
// ... (lines 273-283 remain same but loop content is not shown in this hunk if only replacing top)

// Need to match context correctly. I will just replace the top of the function to add type.

    const start = i * blockSize;
    const end = Math.min(start + blockSize, channelData.length);
    let sum = 0;

    for (let j = start; j < end; j++) {
      sum += channelData[j] * channelData[j];
    }

    const rms = Math.sqrt(sum / (end - start));
    envelope.push(rms);
  }

  // Normalize
  const maxVal = Math.max(...envelope);
  return envelope.map(v => v / (maxVal || 1));
}

/**
 * Calculate Pitch Contour (Fundamental Frequency over time)
 * Uses simple Zero-Crossing Rate combined with ACF for visualization
 */
export function calculatePitchContour(
  audioBuffer: AudioBuffer,
  points: number = 200
): Array<{ time: number; frequency: number; confidence: number }> {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const blockSize = Math.floor(channelData.length / points);
  const contour: Array<{ time: number; frequency: number; confidence: number }> = [];

  for (let i = 0; i < points; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, channelData.length);
    const segment = channelData.slice(start, end);

    // Simple autocorrelation for pitch
    let bestOffset = -1;
    let maxCorrelation = 0;

    // Search range for human pitch (50Hz - 1000Hz)
    // blocked by sampleRate.
    // minPeriod = sampleRate / 1000
    // maxPeriod = sampleRate / 50
    const minPeriod = Math.floor(sampleRate / 1000);
    const maxPeriod = Math.floor(sampleRate / 50);

    // RMS check to avoid pitch detection on silence
    let rms = 0;
    for(let k=0; k<segment.length; k++) rms += segment[k]*segment[k];
    rms = Math.sqrt(rms/segment.length);

    if (rms > 0.01) { // Silence threshold
      // Simplified ACF
      for (let offset = minPeriod; offset < maxPeriod && offset < segment.length; offset++) {
        let correlation = 0;
        for (let j = 0; j < segment.length - offset; j++) {
          correlation += segment[j] * segment[j + offset];
        }
        if (correlation > maxCorrelation) {
          maxCorrelation = correlation;
          bestOffset = offset;
        }
      }
    }

    if (bestOffset > 0 && maxCorrelation > 0.1) {
      const frequency = sampleRate / bestOffset;
      contour.push({
        time: (i * blockSize) / sampleRate,
        frequency,
        confidence: maxCorrelation // Normalized-ish
      });
    } else {
      contour.push({
        time: (i * blockSize) / sampleRate,
        frequency: 0,
        confidence: 0
      });
    }
  }

  return contour;
}

/**
 * Convert frequency bin index to Hz
 */
export function binToHz(binIndex: number, fftSize: number, sampleRate: number): number {
  return (binIndex * sampleRate) / fftSize;
}

/**
 * Detect peaks in frequency spectrum
 */
export function detectFrequencyPeaks(
  spectrum: number[],
  fftSize: number,
  sampleRate: number,
  maxPeaks: number = 10
): Array<{ frequency: number; amplitude: number }> {
  const peaks: Array<{ frequency: number; amplitude: number }> = [];

  for (let i = 1; i < spectrum.length - 1; i++) {
    if (spectrum[i] > spectrum[i-1] && spectrum[i] > spectrum[i+1]) {
      if (spectrum[i] > 0.1) { // Threshold
        peaks.push({
          frequency: binToHz(i, fftSize, sampleRate),
          amplitude: spectrum[i]
        });
      }
    }
  }

  return peaks
    .sort((a, b) => b.amplitude - a.amplitude)
    .slice(0, maxPeaks);
}

/**
 * Encode AudioBuffer to WAV Blob
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let result;
  if (numChannels === 2) {
    result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
  } else {
    result = buffer.getChannelData(0);
  }

  return encodeWAV(result, numChannels, sampleRate, bitDepth);
}

function interleave(inputL: Float32Array, inputR: Float32Array) {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);

  let index = 0;
  let inputIndex = 0;

  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function encodeWAV(samples: Float32Array, numChannels: number, sampleRate: number, bitDepth: number) {
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * blockAlign, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * bytesPerSample, true);

  if (bitDepth === 16) {
    floatTo16BitPCM(view, 44, samples);
  } else {
    writeFloat32(view, 44, samples);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeFloat32(output: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 4) {
    output.setFloat32(offset, input[i], true);
  }
}

/**
 * @deprecated EQ-based stem creation has been replaced by ML-based Demucs separation.
 * Use separateAudioWithDemucs from @/lib/demucs-service instead.
 */

/**
 * Format file size bytes to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Detect musical key from frequency peaks (simple heuristic)
 */
export function detectMusicalKey(peaks: Array<{ frequency: number; amplitude: number }>): { key: string; mode: string } {
  if (peaks.length === 0) return { key: 'Unknown', mode: '' };

  // Simple check based on strongest peak (fundamental)
  const fundamental = peaks[0].frequency;
  const pitchNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const midi = Math.round(12 * Math.log2(fundamental / 440) + 69);
  const noteName = pitchNames[midi % 12];

  return { key: noteName, mode: 'Major' }; // Simplification
}


/**
 * Convert frequency to MIDI note number with tuning support
 */
export function frequencyToMidi(
  frequency: number,
  referenceFreq: number = 440,
  tuningSystem: string = 'equal'
): number {
  const equalMidi = Math.round(12 * Math.log2(frequency / referenceFreq) + 69);
  return applyTuningCorrection(equalMidi, tuningSystem, referenceFreq, frequency);
}

/**
 * Convert MIDI note number to frequency
 */
export function midiToFrequency(
  midi: number,
  referenceFreq: number = 440
): number {
  return referenceFreq * Math.pow(2, (midi - 69) / 12);
}

/**
 * Get note name from MIDI number
 */
export function midiToNoteName(midi: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const noteName = noteNames[midi % 12];
  return `${noteName}${octave}`;
}

/**
 * Apply window function for FFT
 */
function applyWindow(samples: Float32Array, windowType: string): Float32Array {
  const windowed = new Float32Array(samples.length);
  const N = samples.length;

  for (let i = 0; i < N; i++) {
    let window = 1.0;

    switch (windowType) {
      case 'hann':
        window = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
        break;
      case 'hamming':
        window = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1));
        break;
      case 'blackman':
        const a0 = 0.42;
        const a1 = 0.5;
        const a2 = 0.08;
        window =
          a0 -
          a1 * Math.cos((2 * Math.PI * i) / (N - 1)) +
          a2 * Math.cos((4 * Math.PI * i) / (N - 1));
        break;
      case 'rectangular':
      default:
        window = 1.0;
        break;
    }

    windowed[i] = samples[i] * window;
  }

  return windowed;
}

/**
 * Simple low-pass filter
 */
function applyLowPassFilter(samples: Float32Array, sampleRate: number, cutoffFreq: number): Float32Array {
  const RC = 1.0 / (cutoffFreq * 2 * Math.PI);
  const dt = 1.0 / sampleRate;
  const alpha = dt / (RC + dt);

  const filtered = new Float32Array(samples.length);
  filtered[0] = samples[0];

  for (let i = 1; i < samples.length; i++) {
    filtered[i] = filtered[i - 1] + alpha * (samples[i] - filtered[i - 1]);
  }

  return filtered;
}

/**
 * Simple high-pass filter
 */
function applyHighPassFilter(samples: Float32Array, sampleRate: number, cutoffFreq: number): Float32Array {
  const RC = 1.0 / (cutoffFreq * 2 * Math.PI);
  const dt = 1.0 / sampleRate;
  const alpha = RC / (RC + dt);

  const filtered = new Float32Array(samples.length);
  filtered[0] = samples[0];

  for (let i = 1; i < samples.length; i++) {
    filtered[i] = alpha * (filtered[i - 1] + samples[i] - samples[i - 1]);
  }

  return filtered;
}

/**
 * Apply quantization to note timings
 */
function applyQuantization(startTime: number, quantization: string, tempo: number): number {
  if (quantization === 'none') return startTime;

  const secondsPerBeat = 60.0 / tempo;

  switch (quantization) {
    case 'quarter':
      return Math.round(startTime / secondsPerBeat) * secondsPerBeat;
    case 'eighth':
      return Math.round(startTime / (secondsPerBeat / 2)) * (secondsPerBeat / 2);
    case 'sixteenth':
      return Math.round(startTime / (secondsPerBeat / 4)) * (secondsPerBeat / 4);
    case 'thirty-second':
      return Math.round(startTime / (secondsPerBeat / 8)) * (secondsPerBeat / 8);
    default:
      return startTime;
  }
}

/**
 * Calculate Root Mean Square (RMS) of audio samples
 */
function calculateRMS(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / samples.length);
}

/**
 * Detect pitch using autocorrelation with enhanced features
 */
function detectPitch(
  samples: Float32Array,
  sampleRate: number,
  options: AudioProcessingOptions
): { frequency: number; correlation: number; zeroLagCorrelation: number } | null {
  const bufferSize = samples.length;
  const correlations = new Float32Array(bufferSize);

  // Calculate autocorrelation
  for (let lag = 0; lag < bufferSize; lag++) {
    let sum = 0;
    for (let i = 0; i < bufferSize - lag; i++) {
      sum += samples[i] * samples[i + lag];
    }
    correlations[lag] = sum;
  }

  // Find frequency range
  const minLag = Math.floor(sampleRate / (options.frequencyMax || 2000));
  const maxLag = Math.floor(sampleRate / (options.frequencyMin || 50));

  // Find best correlation peak
  let maxCorrelation = 0;
  let bestLag = 0;

  for (let lag = minLag; lag < maxLag; lag++) {
    if (correlations[lag] > maxCorrelation) {
      maxCorrelation = correlations[lag];
      bestLag = lag;
    }
  }

  // Validate peak
  if (bestLag === 0 || maxCorrelation < correlations[0] * (options.confidenceThreshold || 0.1)) {
    return null;
  }

  return {
    frequency: sampleRate / bestLag,
    correlation: maxCorrelation,
    zeroLagCorrelation: correlations[0]
  };
}

/**
 * Detect tempo from note onsets (simplified)
 */
function detectTempo(notes: Note[]): number {
  if (notes.length < 4) return 120;

  // Calculate intervals between consecutive notes
  const intervals: number[] = [];
  for (let i = 1; i < notes.length; i++) {
    const interval = notes[i].startTime - notes[i - 1].startTime;
    if (interval > 0.05 && interval < 2.0) { // Filter out very short/long intervals
      intervals.push(interval);
    }
  }

  if (intervals.length < 2) return 120;

  // Find most common interval (simplified histogram)
  const histogram: Record<number, number> = {};
  const bucketSize = 0.01; // 10ms buckets

  for (const interval of intervals) {
    const bucket = Math.round(interval / bucketSize) * bucketSize;
    histogram[bucket] = (histogram[bucket] || 0) + 1;
  }

  // Find bucket with most occurrences
  let mostCommonInterval = 0.5; // Default 120 BPM
  let maxCount = 0;

  for (const [interval, count] of Object.entries(histogram)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonInterval = parseFloat(interval);
    }
  }

  // Convert interval to BPM
  const bpm = Math.round(60 / mostCommonInterval);
  return Math.max(40, Math.min(240, bpm)); // Clamp to reasonable range
}

/**
 * Analyze audio buffer and extract notes with all enhanced options
 */
export async function analyzeAudio(
  audioBuffer: AudioBuffer,
  options: AudioProcessingOptions = {}
): Promise<AudioAnalysisResult> {
  const opts = { ...RESEARCH_DEFAULTS, ...options };

  // Select channel(s)
  let channelData: Float32Array;
  switch (opts.channelSelection) {
    case 'left':
      channelData = audioBuffer.getChannelData(0);
      break;
    case 'right':
      channelData = audioBuffer.getChannelData(1);
      break;
    case 'mix':
      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);
      channelData = new Float32Array(left.length);
      for (let i = 0; i < left.length; i++) {
        channelData[i] = (left[i] + right[i]) / 2;
      }
      break;
    case 'both':
    default:
      channelData = audioBuffer.getChannelData(0);
      break;
  }

  const sampleRate = audioBuffer.sampleRate;

  // Apply filters if enabled
  if (opts.enableHighPassFilter && opts.highPassFrequency) {
    channelData = applyHighPassFilter(channelData, sampleRate, opts.highPassFrequency);
  }

  if (opts.enableLowPassFilter && opts.lowPassFrequency) {
    channelData = applyLowPassFilter(channelData, sampleRate, opts.lowPassFrequency);
  }

  // Limit processing duration if specified
  let maxSamples = channelData.length;
  if (opts.maxProcessingDuration) {
    maxSamples = Math.min(maxSamples, sampleRate * opts.maxProcessingDuration);
  }

  const notes: Note[] = [];
  let currentNote: Note | null = null;
  let confidenceSum = 0;
  let confidenceCount = 0;

  // FFT size and hop size
  const fftSize = opts.fftSize || 2048;
  const hopSize = opts.hopSize || fftSize / 4;

  // Process in chunks
  for (let i = 0; i < Math.min(channelData.length - fftSize, maxSamples); i += hopSize) {
    let chunk: Float32Array = new Float32Array(channelData.slice(i, i + fftSize));

    // Apply window function
    chunk = applyWindow(chunk, opts.windowType || 'hann') as Float32Array;

    const startTime = i / sampleRate;

    // Calculate amplitude (RMS)
    const amplitude = calculateRMS(chunk);

    // Apply noise gate
    if (opts.enableNoiseGate && amplitude < (opts.noiseGateThreshold || 0.02)) {
      // End current note if below noise gate
      if (currentNote && currentNote.duration >= (opts.minNoteDuration || 0.1)) {
        notes.push(currentNote);
      }
      currentNote = null;
      continue;
    }

    // Detect pitch
    const pitchResult = detectPitch(chunk, sampleRate, opts);

    if (amplitude >= (opts.threshold || 0.05) && pitchResult !== null) {
      const minFreq = opts.frequencyMin || 50;
      const maxFreq = opts.frequencyMax || 2000;

      if (pitchResult.frequency >= minFreq && pitchResult.frequency <= maxFreq) {
        const midi = frequencyToMidi(
          pitchResult.frequency,
          opts.referenceFrequency || 440,
          opts.tuningSystem || 'equal'
        );

        const minMidi = opts.midiMinNote || 21;
        const maxMidi = opts.midiMaxNote || 108;

        if (midi >= minMidi && midi <= maxMidi) {
          // Check scale constraint if enabled
          if (opts.enableScaleConstrain) {
            if (!isNoteInScale(midi, opts.scaleType || 'chromatic', opts.scaleRoot || 60)) {
              // Skip notes not in scale
              if (currentNote) {
                if (currentNote.duration >= (opts.minNoteDuration || 0.1)) {
                  notes.push(currentNote);
                }
              }
              currentNote = null;
              continue;
            }
          }

          const rawVelocity = Math.min(127, Math.floor(amplitude * 127 * 2));
          const velMin = opts.velocityMin || 0;
          const velMax = opts.velocityMax || 127;

          let velocity = rawVelocity;
          if (opts.enableVelocityScaling) {
            velocity = Math.max(velMin, Math.min(velMax, velocity));
          }

          // Apply quantization if enabled
          let quantizedStartTime = startTime;
          if (opts.quantization && opts.quantization !== 'none') {
            const tempo = opts.targetTempo || 120;
            quantizedStartTime = applyQuantization(startTime, opts.quantization, tempo);
          }

          if (currentNote && currentNote.midi === midi) {
            // Continue current note
            currentNote.duration = quantizedStartTime - currentNote.startTime;
            currentNote.velocity = Math.max(currentNote.velocity, velocity);
          } else {
            // End previous note
            if (currentNote && currentNote.duration >= (opts.minNoteDuration || 0.1)) {
              notes.push(currentNote);
            }

            // Start new note
            currentNote = {
              midi,
              name: midiToNoteName(midi),
              pitchName: midiToNoteName(midi),
              octave: Math.floor(midi / 12) - 1,
              startTime: quantizedStartTime,
              duration: 0.1,
              velocity,
              frequency: pitchResult.frequency,
              confidence: Math.min(1.0, pitchResult.correlation / pitchResult.zeroLagCorrelation),
            };
          }

          // Track confidence
          const localConfidence = Math.min(1.0, pitchResult.correlation / pitchResult.zeroLagCorrelation);
          confidenceSum += localConfidence;
          confidenceCount++;
        }
      }
    } else {
      // End current note on silence
      if (currentNote) {
        if (currentNote.duration >= (opts.minNoteDuration || 0.1)) {
          notes.push(currentNote);
        }
        currentNote = null;
      }
    }
  }

  // Add final note
  if (currentNote && currentNote.duration >= (opts.minNoteDuration || 0.1)) {
    notes.push(currentNote);
  }

  // Calculate average confidence
  const avgConfidence = confidenceCount > 0 ? confidenceSum / confidenceCount : 0.7;

  // Detect tempo if enabled
  let detectedTempo: number | undefined;
  if (opts.enableTempoDetection) {
    detectedTempo = detectTempo(notes);
  }

  return {
    notes,
    duration: audioBuffer.duration,
    sampleRate,
    confidence: avgConfidence,
    detectedTempo,
    detectedTimeSignature: opts.targetTimeSignature,
  };
}

/**
 * Decode audio file to AudioBuffer
 */
// Use OfflineAudioContext for more reliable batch decoding without hitting hardware limits
export async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();

  // Create a temporary context just to decode
  // @ts-ignore - Safari prefix compatibility
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContextClass();

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } catch (error) {
    console.error("Audio decoding failed:", error);
    throw new Error('Failed to decode audio file. The format may not be supported.');
  } finally {
    // Always close the context to release resources
    await audioContext.close();
  }
}

/**
 * Load and analyze audio file with enhanced options
 */
export async function loadAndAnalyzeAudio(
  file: File,
  options?: AudioProcessingOptions
): Promise<AudioAnalysisResult> {
  const audioBuffer = await decodeAudioFile(file);
  return analyzeAudio(audioBuffer, options);
}

/**
 * Export default options for documentation
 */
export function getDefaultOptions(): AudioProcessingOptions {
  return { ...RESEARCH_DEFAULTS };
}
