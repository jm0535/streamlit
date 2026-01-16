/**
 * Real Audio Processing Library
 * Uses Web Audio API for actual audio analysis and pitch detection
 */

export interface AudioAnalysisResult {
  fundamentalFrequency: number | null;
  pitchConfidence: number;
  rmsAmplitude: number;
  spectralCentroid: number;
  spectralFlatness: number;
  zeroCrossingRate: number;
}

export interface DetectedNote {
  pitch: number;        // MIDI note number
  frequency: number;    // Hz
  velocity: number;     // 0-127
  startTime: number;    // seconds
  endTime: number;      // seconds
  duration: number;     // seconds
  confidence: number;   // 0-1
}

export interface OnsetResult {
  time: number;         // seconds
  strength: number;     // onset strength
  spectralFlux: number;
}

export interface SpectralFeatures {
  centroid: number;
  bandwidth: number;
  rolloff: number;
  flatness: number;
  flux: number;
  magnitudes: Float32Array;
  frequencies: Float32Array;
}

// Audio context singleton
let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

/**
 * Load audio file into AudioBuffer
 */
export async function loadAudioFile(file: File): Promise<AudioBuffer> {
  const ctx = getAudioContext();
  const arrayBuffer = await file.arrayBuffer();
  return await ctx.decodeAudioData(arrayBuffer);
}

/**
 * Autocorrelation-based pitch detection (YIN algorithm simplified)
 */
export function detectPitch(
  buffer: Float32Array,
  sampleRate: number,
  minFreq: number = 50,
  maxFreq: number = 2000
): { frequency: number | null; confidence: number } {
  const SIZE = buffer.length;
  const maxLag = Math.floor(sampleRate / minFreq);
  const minLag = Math.floor(sampleRate / maxFreq);

  // Calculate autocorrelation
  const correlations = new Float32Array(maxLag);

  for (let lag = minLag; lag < maxLag; lag++) {
    let sum = 0;
    let sumSquares = 0;

    for (let i = 0; i < SIZE - lag; i++) {
      sum += buffer[i] * buffer[i + lag];
      sumSquares += buffer[i] * buffer[i] + buffer[i + lag] * buffer[i + lag];
    }

    correlations[lag] = sumSquares > 0 ? (2 * sum) / sumSquares : 0;
  }

  // Find the best lag (highest correlation)
  let bestLag = minLag;
  let bestCorrelation = correlations[minLag];

  for (let lag = minLag + 1; lag < maxLag; lag++) {
    if (correlations[lag] > bestCorrelation) {
      bestCorrelation = correlations[lag];
      bestLag = lag;
    }
  }

  // Parabolic interpolation for sub-sample accuracy
  if (bestLag > minLag && bestLag < maxLag - 1) {
    const y1 = correlations[bestLag - 1];
    const y2 = correlations[bestLag];
    const y3 = correlations[bestLag + 1];

    const a = (y1 + y3 - 2 * y2) / 2;
    const b = (y3 - y1) / 2;

    if (a !== 0) {
      const shift = -b / (2 * a);
      bestLag = bestLag + shift;
    }
  }

  const frequency = bestCorrelation > 0.5 ? sampleRate / bestLag : null;

  return {
    frequency,
    confidence: Math.max(0, Math.min(1, bestCorrelation)),
  };
}

/**
 * Convert frequency to MIDI note number
 */
export function frequencyToMidi(frequency: number): number {
  return Math.round(12 * Math.log2(frequency / 440) + 69);
}

/**
 * Convert MIDI note number to frequency
 */
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Calculate RMS amplitude
 */
export function calculateRMS(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}

/**
 * Calculate zero crossing rate
 */
export function calculateZeroCrossingRate(buffer: Float32Array): number {
  let crossings = 0;
  for (let i = 1; i < buffer.length; i++) {
    if ((buffer[i] >= 0 && buffer[i - 1] < 0) ||
        (buffer[i] < 0 && buffer[i - 1] >= 0)) {
      crossings++;
    }
  }
  return crossings / buffer.length;
}

/**
 * Compute FFT and get magnitude spectrum
 */
export function computeSpectrum(
  buffer: Float32Array,
  fftSize: number = 2048
): { magnitudes: Float32Array; frequencies: Float32Array } {
  const ctx = getAudioContext();

  const magnitudes = new Float32Array(fftSize / 2);
  const frequencies = new Float32Array(fftSize / 2);

  // Simple DFT for offline analysis
  const real = new Float32Array(fftSize);

  // Copy buffer to real part
  for (let i = 0; i < Math.min(buffer.length, fftSize); i++) {
    real[i] = buffer[i];
  }

  // Apply Hanning window
  for (let i = 0; i < fftSize; i++) {
    real[i] *= 0.5 * (1 - Math.cos(2 * Math.PI * i / (fftSize - 1)));
  }

  // DFT (simplified, for production use a proper FFT library)
  for (let k = 0; k < fftSize / 2; k++) {
    let sumReal = 0;
    let sumImag = 0;

    for (let n = 0; n < fftSize; n++) {
      const angle = -2 * Math.PI * k * n / fftSize;
      sumReal += real[n] * Math.cos(angle);
      sumImag += real[n] * Math.sin(angle);
    }

    magnitudes[k] = Math.sqrt(sumReal * sumReal + sumImag * sumImag) / fftSize;
    frequencies[k] = k * ctx.sampleRate / fftSize;
  }

  return { magnitudes, frequencies };
}

/**
 * Calculate spectral centroid (brightness)
 */
export function calculateSpectralCentroid(
  magnitudes: Float32Array,
  frequencies: Float32Array
): number {
  let weightedSum = 0;
  let sum = 0;

  for (let i = 0; i < magnitudes.length; i++) {
    weightedSum += magnitudes[i] * frequencies[i];
    sum += magnitudes[i];
  }

  return sum > 0 ? weightedSum / sum : 0;
}

/**
 * Calculate spectral flatness (noisiness vs tonality)
 */
export function calculateSpectralFlatness(magnitudes: Float32Array): number {
  let logSum = 0;
  let sum = 0;
  let count = 0;

  for (let i = 0; i < magnitudes.length; i++) {
    if (magnitudes[i] > 0) {
      logSum += Math.log(magnitudes[i]);
      sum += magnitudes[i];
      count++;
    }
  }

  if (count === 0 || sum === 0) return 0;

  const geometricMean = Math.exp(logSum / count);
  const arithmeticMean = sum / count;

  return geometricMean / arithmeticMean;
}

/**
 * Detect note onsets using spectral flux
 */
export function detectOnsets(
  audioBuffer: AudioBuffer,
  hopSize: number = 512,
  threshold: number = 0.1
): OnsetResult[] {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const fftSize = 2048;

  const onsets: OnsetResult[] = [];
  let previousMagnitudes: Float32Array | null = null;

  for (let i = 0; i < channelData.length - fftSize; i += hopSize) {
    const frame = channelData.slice(i, i + fftSize);
    const { magnitudes } = computeSpectrum(frame, fftSize);

    if (previousMagnitudes) {
      // Calculate spectral flux (sum of positive differences)
      let flux = 0;
      for (let j = 0; j < magnitudes.length; j++) {
        const diff = magnitudes[j] - previousMagnitudes[j];
        if (diff > 0) {
          flux += diff;
        }
      }

      // Check if onset detected
      if (flux > threshold) {
        onsets.push({
          time: i / sampleRate,
          strength: flux,
          spectralFlux: flux,
        });
      }
    }

    previousMagnitudes = new Float32Array(magnitudes);
  }

  return onsets;
}

/**
 * Transcribe audio to notes using pitch detection
 */
export async function transcribeAudio(
  audioBuffer: AudioBuffer,
  options: {
    minFrequency?: number;
    maxFrequency?: number;
    minNoteDuration?: number;
    hopSize?: number;
    minConfidence?: number;
  } = {}
): Promise<DetectedNote[]> {
  const {
    minFrequency = 50,
    maxFrequency = 2000,
    minNoteDuration = 0.05,
    hopSize = 512,
    minConfidence = 0.5,
  } = options;

  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const frameSize = 2048;

  const notes: DetectedNote[] = [];
  let currentNote: Partial<DetectedNote> | null = null;

  for (let i = 0; i < channelData.length - frameSize; i += hopSize) {
    const frame = channelData.slice(i, i + frameSize);
    const time = i / sampleRate;

    // Skip silent frames
    const rms = calculateRMS(frame);
    if (rms < 0.01) {
      if (currentNote && currentNote.startTime !== undefined) {
        // End current note
        currentNote.endTime = time;
        currentNote.duration = time - currentNote.startTime;

        if (currentNote.duration >= minNoteDuration) {
          notes.push(currentNote as DetectedNote);
        }
        currentNote = null;
      }
      continue;
    }

    // Detect pitch
    const { frequency, confidence } = detectPitch(frame, sampleRate, minFrequency, maxFrequency);

    if (frequency && confidence >= minConfidence) {
      const midi = frequencyToMidi(frequency);
      const velocity = Math.round(Math.min(127, rms * 1000));

      if (!currentNote) {
        // Start new note
        currentNote = {
          pitch: midi,
          frequency,
          velocity,
          startTime: time,
          confidence,
        };
      } else if (Math.abs(currentNote.pitch! - midi) > 1) {
        // Pitch changed significantly - end current note and start new
        currentNote.endTime = time;
        currentNote.duration = time - currentNote.startTime!;

        if (currentNote.duration >= minNoteDuration) {
          notes.push(currentNote as DetectedNote);
        }

        currentNote = {
          pitch: midi,
          frequency,
          velocity,
          startTime: time,
          confidence,
        };
      }
    } else if (currentNote && currentNote.startTime !== undefined) {
      // No pitch detected - end current note
      currentNote.endTime = time;
      currentNote.duration = time - currentNote.startTime;

      if (currentNote.duration >= minNoteDuration) {
        notes.push(currentNote as DetectedNote);
      }
      currentNote = null;
    }
  }

  // End any remaining note
  if (currentNote && currentNote.startTime !== undefined) {
    currentNote.endTime = channelData.length / sampleRate;
    currentNote.duration = currentNote.endTime - currentNote.startTime;

    if (currentNote.duration >= minNoteDuration) {
      notes.push(currentNote as DetectedNote);
    }
  }

  return notes;
}

/**
 * Full audio analysis
 */
export async function analyzeAudio(audioBuffer: AudioBuffer): Promise<{
  duration: number;
  sampleRate: number;
  channels: number;
  rms: number;
  peakAmplitude: number;
  zeroCrossingRate: number;
  spectralFeatures: SpectralFeatures;
  onsets: OnsetResult[];
  estimatedTempo: number | null;
}> {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;

  // Basic metrics
  const rms = calculateRMS(channelData);
  const zeroCrossingRate = calculateZeroCrossingRate(channelData);

  // Peak amplitude
  let peakAmplitude = 0;
  for (let i = 0; i < channelData.length; i++) {
    peakAmplitude = Math.max(peakAmplitude, Math.abs(channelData[i]));
  }

  // Spectral analysis (middle section of audio)
  const midPoint = Math.floor(channelData.length / 2);
  const analysisFrame = channelData.slice(midPoint, midPoint + 4096);
  const { magnitudes, frequencies } = computeSpectrum(analysisFrame, 4096);

  const spectralFeatures: SpectralFeatures = {
    centroid: calculateSpectralCentroid(magnitudes, frequencies),
    bandwidth: 0,
    rolloff: 0,
    flatness: calculateSpectralFlatness(magnitudes),
    flux: 0,
    magnitudes,
    frequencies,
  };

  // Onset detection
  const onsets = detectOnsets(audioBuffer);

  // Tempo estimation from onset intervals
  let estimatedTempo: number | null = null;
  if (onsets.length > 2) {
    const intervals: number[] = [];
    for (let i = 1; i < onsets.length; i++) {
      intervals.push(onsets[i].time - onsets[i - 1].time);
    }
    const meanInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    if (meanInterval > 0) {
      estimatedTempo = 60 / meanInterval;
      // Adjust to reasonable tempo range
      while (estimatedTempo < 60) estimatedTempo *= 2;
      while (estimatedTempo > 180) estimatedTempo /= 2;
    }
  }

  return {
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
    channels: audioBuffer.numberOfChannels,
    rms,
    peakAmplitude,
    zeroCrossingRate,
    spectralFeatures,
    onsets,
    estimatedTempo,
  };
}

const audioProcessor = {
  loadAudioFile,
  detectPitch,
  frequencyToMidi,
  midiToFrequency,
  calculateRMS,
  calculateZeroCrossingRate,
  computeSpectrum,
  calculateSpectralCentroid,
  calculateSpectralFlatness,
  detectOnsets,
  transcribeAudio,
  analyzeAudio,
};

export default audioProcessor;
