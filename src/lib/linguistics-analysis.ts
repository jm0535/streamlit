'use client';

/**
 * Linguistics Analysis Service
 *
 * Provides tools for analyzing speech and language features in audio:
 * - Phonetic analysis (vowel formants, consonant classification)
 * - Prosodic analysis (pitch contour, rhythm, stress patterns)
 * - Voice activity detection (VAD)
 * - Speech rate and pause analysis
 * - Fundamental frequency (F0) tracking
 *
 * Useful for:
 * - Language documentation (endangered languages in PNG)
 * - Dialect analysis
 * - Speech therapy research
 * - Linguistic fieldwork
 */

export interface ProsodyResult {
  pitchContour: { time: number; frequency: number }[];
  averagePitch: number;
  pitchRange: { min: number; max: number };
  pitchVariability: number; // Standard deviation
}

export interface RhythmResult {
  speechRate: number; // syllables per second (estimated)
  pauseCount: number;
  averagePauseDuration: number;
  totalSpeechDuration: number;
  totalPauseDuration: number;
  rhythmRatio: number; // Speech time / Total time
}

export interface FormantResult {
  time: number;
  f1: number; // First formant (vowel height)
  f2: number; // Second formant (vowel backness)
  f3: number; // Third formant (lip rounding)
}

export interface VowelSpaceAnalysis {
  formants: FormantResult[];
  vowelSpaceArea: number;
  averageF1: number;
  averageF2: number;
}

export interface VoiceActivitySegment {
  startTime: number;
  endTime: number;
  duration: number;
  isSpeech: boolean;
}

export interface LinguisticsAnalysisResult {
  prosody: ProsodyResult;
  rhythm: RhythmResult;
  voiceActivity: VoiceActivitySegment[];
  vowelSpace: VowelSpaceAnalysis;
  duration: number;
  sampleRate: number;
}

// Constants for speech analysis
const PITCH_MIN = 75;   // Hz - typical adult male minimum
const PITCH_MAX = 500;  // Hz - typical child/female maximum
const VAD_THRESHOLD = 0.02; // RMS threshold for voice activity
const FRAME_SIZE = 2048;
const HOP_SIZE = 512;

/**
 * Detect voice activity in audio
 */
function detectVoiceActivity(
  audioData: Float32Array,
  sampleRate: number
): VoiceActivitySegment[] {
  const frameSize = Math.floor(sampleRate * 0.025); // 25ms frames
  const hopSize = Math.floor(sampleRate * 0.010);   // 10ms hop
  const numFrames = Math.floor((audioData.length - frameSize) / hopSize);

  const segments: VoiceActivitySegment[] = [];
  let currentSegment: VoiceActivitySegment | null = null;

  for (let i = 0; i < numFrames; i++) {
    const startSample = i * hopSize;
    let rms = 0;

    for (let j = 0; j < frameSize; j++) {
      const sample = audioData[startSample + j] || 0;
      rms += sample * sample;
    }
    rms = Math.sqrt(rms / frameSize);

    const isSpeech = rms > VAD_THRESHOLD;
    const currentTime = startSample / sampleRate;

    if (isSpeech && !currentSegment) {
      // Start new speech segment
      currentSegment = {
        startTime: currentTime,
        endTime: currentTime,
        duration: 0,
        isSpeech: true,
      };
    } else if (!isSpeech && currentSegment && currentSegment.isSpeech) {
      // End speech segment, start pause
      currentSegment.endTime = currentTime;
      currentSegment.duration = currentSegment.endTime - currentSegment.startTime;
      if (currentSegment.duration > 0.05) { // Minimum 50ms
        segments.push(currentSegment);
      }
      currentSegment = {
        startTime: currentTime,
        endTime: currentTime,
        duration: 0,
        isSpeech: false,
      };
    } else if (isSpeech && currentSegment && !currentSegment.isSpeech) {
      // End pause, start speech
      currentSegment.endTime = currentTime;
      currentSegment.duration = currentSegment.endTime - currentSegment.startTime;
      if (currentSegment.duration > 0.1) { // Minimum 100ms pause
        segments.push(currentSegment);
      }
      currentSegment = {
        startTime: currentTime,
        endTime: currentTime,
        duration: 0,
        isSpeech: true,
      };
    }
  }

  // Close final segment
  if (currentSegment) {
    currentSegment.endTime = audioData.length / sampleRate;
    currentSegment.duration = currentSegment.endTime - currentSegment.startTime;
    if (currentSegment.duration > 0.05) {
      segments.push(currentSegment);
    }
  }

  return segments;
}

/**
 * Analyze prosody (pitch contour)
 */
function analyzeProsody(
  audioData: Float32Array,
  sampleRate: number
): ProsodyResult {
  const pitchContour: { time: number; frequency: number }[] = [];
  const numFrames = Math.floor((audioData.length - FRAME_SIZE) / HOP_SIZE);

  for (let frame = 0; frame < numFrames; frame++) {
    const startSample = frame * HOP_SIZE;
    const frameData = new Float32Array(FRAME_SIZE);

    for (let i = 0; i < FRAME_SIZE; i++) {
      frameData[i] = audioData[startSample + i] || 0;
    }

    const pitch = detectPitch(frameData, sampleRate);
    if (pitch !== null && pitch >= PITCH_MIN && pitch <= PITCH_MAX) {
      pitchContour.push({
        time: startSample / sampleRate,
        frequency: pitch,
      });
    }
  }

  // Calculate statistics
  if (pitchContour.length === 0) {
    return {
      pitchContour: [],
      averagePitch: 0,
      pitchRange: { min: 0, max: 0 },
      pitchVariability: 0,
    };
  }

  const pitches = pitchContour.map(p => p.frequency);
  const averagePitch = pitches.reduce((a, b) => a + b, 0) / pitches.length;
  const minPitch = Math.min(...pitches);
  const maxPitch = Math.max(...pitches);

  // Calculate standard deviation
  const variance = pitches.reduce((sum, p) => sum + Math.pow(p - averagePitch, 2), 0) / pitches.length;
  const pitchVariability = Math.sqrt(variance);

  return {
    pitchContour,
    averagePitch,
    pitchRange: { min: minPitch, max: maxPitch },
    pitchVariability,
  };
}

/**
 * Simple autocorrelation-based pitch detection
 */
function detectPitch(buffer: Float32Array, sampleRate: number): number | null {
  const minPeriod = Math.floor(sampleRate / PITCH_MAX);
  const maxPeriod = Math.floor(sampleRate / PITCH_MIN);

  // Check signal level
  let rms = 0;
  for (let i = 0; i < buffer.length; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.01) return null;

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

  if (bestCorrelation < 0.3 * rms * rms) return null;
  return sampleRate / bestPeriod;
}

/**
 * Analyze rhythm and speech rate
 */
function analyzeRhythm(segments: VoiceActivitySegment[]): RhythmResult {
  const speechSegments = segments.filter(s => s.isSpeech);
  const pauseSegments = segments.filter(s => !s.isSpeech);

  const totalSpeechDuration = speechSegments.reduce((sum, s) => sum + s.duration, 0);
  const totalPauseDuration = pauseSegments.reduce((sum, s) => sum + s.duration, 0);
  const totalDuration = totalSpeechDuration + totalPauseDuration;

  // Estimate syllables (rough: ~4 syllables per second of speech)
  const estimatedSyllables = totalSpeechDuration * 4;
  const speechRate = totalDuration > 0 ? estimatedSyllables / totalDuration : 0;

  return {
    speechRate,
    pauseCount: pauseSegments.length,
    averagePauseDuration: pauseSegments.length > 0
      ? totalPauseDuration / pauseSegments.length
      : 0,
    totalSpeechDuration,
    totalPauseDuration,
    rhythmRatio: totalDuration > 0 ? totalSpeechDuration / totalDuration : 0,
  };
}

/**
 * Estimate formants using LPC (simplified approach)
 */
function analyzeVowelSpace(
  audioData: Float32Array,
  sampleRate: number,
  voiceActivity: VoiceActivitySegment[]
): VowelSpaceAnalysis {
  const formants: FormantResult[] = [];
  const speechSegments = voiceActivity.filter(s => s.isSpeech);

  // Sample formants from speech segments
  for (const segment of speechSegments.slice(0, 20)) { // Limit analysis
    const startSample = Math.floor(segment.startTime * sampleRate);
    const midSample = startSample + Math.floor((segment.duration * sampleRate) / 2);

    if (midSample + FRAME_SIZE < audioData.length) {
      const frameData = new Float32Array(FRAME_SIZE);
      for (let i = 0; i < FRAME_SIZE; i++) {
        frameData[i] = audioData[midSample + i] || 0;
      }

      // Simplified formant estimation using spectral peaks
      const spectrum = computeSpectrum(frameData, sampleRate);
      const peaks = findSpectralPeaks(spectrum, sampleRate);

      if (peaks.length >= 3) {
        formants.push({
          time: segment.startTime + segment.duration / 2,
          f1: peaks[0],
          f2: peaks[1],
          f3: peaks[2],
        });
      }
    }
  }

  // Calculate averages
  const averageF1 = formants.length > 0
    ? formants.reduce((sum, f) => sum + f.f1, 0) / formants.length
    : 0;
  const averageF2 = formants.length > 0
    ? formants.reduce((sum, f) => sum + f.f2, 0) / formants.length
    : 0;

  // Estimate vowel space area (simplified triangular approximation)
  const vowelSpaceArea = formants.length >= 3 ? calculateVowelSpaceArea(formants) : 0;

  return {
    formants,
    vowelSpaceArea,
    averageF1,
    averageF2,
  };
}

/**
 * Compute power spectrum
 */
function computeSpectrum(buffer: Float32Array, sampleRate: number): Float32Array {
  const spectrum = new Float32Array(buffer.length / 2);

  for (let bin = 0; bin < spectrum.length; bin++) {
    let real = 0;
    let imag = 0;

    for (let n = 0; n < buffer.length; n++) {
      const angle = (2 * Math.PI * bin * n) / buffer.length;
      const window = 0.5 * (1 - Math.cos((2 * Math.PI * n) / (buffer.length - 1)));
      real += buffer[n] * window * Math.cos(angle);
      imag -= buffer[n] * window * Math.sin(angle);
    }

    spectrum[bin] = Math.sqrt(real * real + imag * imag);
  }

  return spectrum;
}

/**
 * Find spectral peaks (formant candidates)
 */
function findSpectralPeaks(spectrum: Float32Array, sampleRate: number): number[] {
  const peaks: { bin: number; magnitude: number }[] = [];
  const minBin = Math.floor((200 * spectrum.length * 2) / sampleRate);  // > 200 Hz
  const maxBin = Math.floor((4000 * spectrum.length * 2) / sampleRate); // < 4000 Hz

  for (let i = minBin + 1; i < Math.min(maxBin, spectrum.length - 1); i++) {
    if (spectrum[i] > spectrum[i - 1] && spectrum[i] > spectrum[i + 1]) {
      peaks.push({ bin: i, magnitude: spectrum[i] });
    }
  }

  // Sort by magnitude and take top 3
  peaks.sort((a, b) => b.magnitude - a.magnitude);
  const topPeaks = peaks.slice(0, 3);

  // Sort by frequency
  topPeaks.sort((a, b) => a.bin - b.bin);

  return topPeaks.map(p => (p.bin * sampleRate) / (spectrum.length * 2));
}

/**
 * Calculate vowel space area using convex hull approximation
 */
function calculateVowelSpaceArea(formants: FormantResult[]): number {
  if (formants.length < 3) return 0;

  // Use F1/F2 coordinates, calculate approximate triangle area
  const points = formants.map(f => ({ x: f.f2, y: f.f1 }));

  // Find extremes
  const minF1 = Math.min(...points.map(p => p.y));
  const maxF1 = Math.max(...points.map(p => p.y));
  const minF2 = Math.min(...points.map(p => p.x));
  const maxF2 = Math.max(...points.map(p => p.x));

  // Approximate area as rectangle covering vowel space
  return (maxF1 - minF1) * (maxF2 - minF2);
}

/**
 * Main linguistics analysis function
 */
export async function analyzeLinguistics(
  audioBuffer: AudioBuffer,
  options: {
    onProgress?: (percent: number) => void;
  } = {}
): Promise<LinguisticsAnalysisResult> {
  const { onProgress } = options;
  const sampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0);

  onProgress?.(10);

  // Voice activity detection
  const voiceActivity = detectVoiceActivity(channelData, sampleRate);
  onProgress?.(30);

  // Prosody analysis
  const prosody = analyzeProsody(channelData, sampleRate);
  onProgress?.(50);

  // Rhythm analysis
  const rhythm = analyzeRhythm(voiceActivity);
  onProgress?.(70);

  // Vowel space analysis
  const vowelSpace = analyzeVowelSpace(channelData, sampleRate, voiceActivity);
  onProgress?.(90);

  onProgress?.(100);

  return {
    prosody,
    rhythm,
    voiceActivity,
    vowelSpace,
    duration: audioBuffer.duration,
    sampleRate,
  };
}

const linguisticsAnalysis = {
  analyzeLinguistics,
};

export default linguisticsAnalysis;
