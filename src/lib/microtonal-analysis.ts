'use client';

/**
 * Microtonal Analysis Service
 *
 * Provides tools for analyzing non-Western scales, microtonal intervals,
 * and pitch distributions for ethnomusicology research.
 *
 * Features:
 * - Pitch histogram generation
 * - Cents deviation from 12-TET
 * - Scale pattern detection
 * - Microtonal interval identification
 */

export interface PitchHistogramData {
  frequency: number;
  midiNote: number;
  noteName: string;
  cents: number; // Deviation from nearest 12-TET note
  count: number;
  percentage: number;
}

export interface ScaleAnalysisResult {
  detectedScale: string;
  confidence: number;
  intervalPattern: number[];
  culturalContext?: string;
}

export interface MicrotonalAnalysisResult {
  pitchHistogram: PitchHistogramData[];
  dominantPitches: PitchHistogramData[];
  averageCentsDeviation: number;
  scaleAnalysis: ScaleAnalysisResult | null;
  totalNotes: number;
  microtonalContent: number; // Percentage of notes deviating > 10 cents
}

// Standard 12-TET frequencies (A4 = 440Hz)
const A4_FREQ = 440;
const SEMITONE_RATIO = Math.pow(2, 1/12);

// Known scale patterns (intervals in cents)
const SCALE_PATTERNS: Record<string, { intervals: number[]; context: string }> = {
  'Western Major': { intervals: [0, 200, 400, 500, 700, 900, 1100], context: 'Western classical and popular music' },
  'Western Minor': { intervals: [0, 200, 300, 500, 700, 800, 1000], context: 'Western classical and popular music' },
  'Pelog (Javanese)': { intervals: [0, 120, 270, 540, 670, 785, 920], context: 'Javanese gamelan music' },
  'Slendro (Javanese)': { intervals: [0, 240, 480, 720, 960], context: 'Javanese gamelan music' },
  'Arabic Maqam Rast': { intervals: [0, 200, 350, 500, 700, 900, 1050], context: 'Middle Eastern classical music' },
  'Hirajoshi (Japanese)': { intervals: [0, 200, 300, 700, 800], context: 'Japanese traditional music' },
  'PNG Highlands': { intervals: [0, 150, 350, 550, 700, 900], context: 'Papua New Guinea Highlands singing' },
  'Melanesian Pentatonic': { intervals: [0, 200, 450, 700, 950], context: 'Melanesian traditional music' },
};

// Note names
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Convert frequency to MIDI note number (with fractional part for microtones)
 */
export function frequencyToMidi(freq: number): number {
  return 69 + 12 * Math.log2(freq / A4_FREQ);
}

/**
 * Convert MIDI note number to frequency
 */
export function midiToFrequency(midi: number): number {
  return A4_FREQ * Math.pow(2, (midi - 69) / 12);
}

/**
 * Calculate cents deviation from nearest 12-TET note
 */
export function calculateCentsDeviation(frequency: number): { nearestMidi: number; cents: number; noteName: string } {
  const exactMidi = frequencyToMidi(frequency);
  const nearestMidi = Math.round(exactMidi);
  const cents = (exactMidi - nearestMidi) * 100;
  const noteName = NOTE_NAMES[nearestMidi % 12] + Math.floor(nearestMidi / 12 - 1);

  return { nearestMidi, cents, noteName };
}

/**
 * Analyze audio buffer for microtonal content
 */
export async function analyzeMicrotonal(
  audioBuffer: AudioBuffer,
  options: {
    minFreq?: number;
    maxFreq?: number;
    frameSize?: number;
    hopSize?: number;
    onProgress?: (percent: number) => void;
  } = {}
): Promise<MicrotonalAnalysisResult> {
  const {
    minFreq = 80,   // Below E2
    maxFreq = 2000, // Above B6
    frameSize = 4096,
    hopSize = 2048,
    onProgress,
  } = options;

  const sampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0);
  const numFrames = Math.floor((channelData.length - frameSize) / hopSize);

  // Pitch detection using autocorrelation
  const pitchCounts: Map<number, number> = new Map(); // frequency (rounded to 1Hz) -> count
  let processedFrames = 0;

  for (let frame = 0; frame < numFrames; frame++) {
    const startSample = frame * hopSize;
    const frameData = new Float32Array(frameSize);
    for (let i = 0; i < frameSize; i++) {
      frameData[i] = channelData[startSample + i];
    }

    const pitch = detectPitchAutocorrelation(frameData, sampleRate, minFreq, maxFreq);

    if (pitch !== null) {
      const roundedPitch = Math.round(pitch);
      pitchCounts.set(roundedPitch, (pitchCounts.get(roundedPitch) || 0) + 1);
    }

    processedFrames++;
    if (onProgress && frame % 100 === 0) {
      onProgress((frame / numFrames) * 100);
    }
  }

  // Convert to histogram data
  const totalPitches = Array.from(pitchCounts.values()).reduce((a, b) => a + b, 0);
  const histogram: PitchHistogramData[] = [];

  for (const [freq, count] of pitchCounts.entries()) {
    const { nearestMidi, cents, noteName } = calculateCentsDeviation(freq);

    histogram.push({
      frequency: freq,
      midiNote: nearestMidi,
      noteName,
      cents,
      count,
      percentage: (count / totalPitches) * 100,
    });
  }

  // Sort by frequency
  histogram.sort((a, b) => a.frequency - b.frequency);

  // Find dominant pitches (top 10%)
  const sortedByCount = [...histogram].sort((a, b) => b.count - a.count);
  const dominantPitches = sortedByCount.slice(0, Math.max(5, Math.floor(histogram.length * 0.1)));

  // Calculate average cents deviation
  let totalCents = 0;
  let microtonalCount = 0;

  for (const pitch of histogram) {
    totalCents += Math.abs(pitch.cents) * pitch.count;
    if (Math.abs(pitch.cents) > 10) {
      microtonalCount += pitch.count;
    }
  }

  const averageCentsDeviation = totalPitches > 0 ? totalCents / totalPitches : 0;
  const microtonalContent = totalPitches > 0 ? (microtonalCount / totalPitches) * 100 : 0;

  // Scale analysis
  const scaleAnalysis = detectScale(dominantPitches);

  onProgress?.(100);

  return {
    pitchHistogram: histogram,
    dominantPitches,
    averageCentsDeviation,
    scaleAnalysis,
    totalNotes: totalPitches,
    microtonalContent,
  };
}

/**
 * Pitch detection using autocorrelation
 */
function detectPitchAutocorrelation(
  buffer: Float32Array,
  sampleRate: number,
  minFreq: number,
  maxFreq: number
): number | null {
  const minPeriod = Math.floor(sampleRate / maxFreq);
  const maxPeriod = Math.floor(sampleRate / minFreq);

  // Check if there's enough signal
  let rms = 0;
  for (let i = 0; i < buffer.length; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.01) return null; // Too quiet

  // Autocorrelation
  let bestPeriod = 0;
  let bestCorrelation = 0;

  for (let period = minPeriod; period <= maxPeriod; period++) {
    let correlation = 0;
    for (let i = 0; i < buffer.length - period; i++) {
      correlation += buffer[i] * buffer[i + period];
    }
    correlation /= (buffer.length - period);

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestPeriod = period;
    }
  }

  if (bestCorrelation < 0.5 * rms * rms) return null; // Not periodic enough

  return sampleRate / bestPeriod;
}

/**
 * Detect scale pattern from dominant pitches
 */
function detectScale(dominantPitches: PitchHistogramData[]): ScaleAnalysisResult | null {
  if (dominantPitches.length < 3) return null;

  // Get intervals from lowest pitch
  const sorted = [...dominantPitches].sort((a, b) => a.frequency - b.frequency);
  const baseFreq = sorted[0].frequency;

  const intervals = sorted.map(p => {
    const centsFromBase = 1200 * Math.log2(p.frequency / baseFreq);
    return centsFromBase % 1200; // Normalize to one octave
  }).sort((a, b) => a - b);

  // Compare with known scales
  let bestMatch: { name: string; score: number; context: string } | null = null;

  for (const [scaleName, scaleData] of Object.entries(SCALE_PATTERNS)) {
    const score = matchScalePattern(intervals, scaleData.intervals);
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { name: scaleName, score, context: scaleData.context };
    }
  }

  if (bestMatch && bestMatch.score > 0.5) {
    return {
      detectedScale: bestMatch.name,
      confidence: bestMatch.score,
      intervalPattern: intervals,
      culturalContext: bestMatch.context,
    };
  }

  return null;
}

/**
 * Match interval pattern to known scale (returns 0-1 score)
 */
function matchScalePattern(detected: number[], known: number[]): number {
  if (detected.length === 0 || known.length === 0) return 0;

  let matchCount = 0;
  const tolerance = 30; // cents tolerance

  for (const detectedInterval of detected) {
    for (const knownInterval of known) {
      if (Math.abs(detectedInterval - knownInterval) < tolerance) {
        matchCount++;
        break;
      }
    }
  }

  return matchCount / Math.max(detected.length, known.length);
}

export default {
  analyzeMicrotonal,
  calculateCentsDeviation,
  frequencyToMidi,
  midiToFrequency,
};
