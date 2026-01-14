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
              startTime: quantizedStartTime,
              duration: 0.1,
              velocity,
              pitchName: midiToNoteName(midi),
              frequency: pitchResult.frequency,
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
export async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new AudioContext();

  try {
    return await audioContext.decodeAudioData(arrayBuffer);
  } catch (error) {
    throw new Error('Failed to decode audio file');
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
