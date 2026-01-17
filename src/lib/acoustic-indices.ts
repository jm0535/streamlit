'use client';

/**
 * Acoustic Indices Service
 *
 * Provides tools for calculating acoustic indices commonly used in
 * soundscape ecology and bioacoustics research.
 *
 * Indices:
 * - ACI (Acoustic Complexity Index)
 * - NDSI (Normalized Difference Soundscape Index)
 * - H (Acoustic Entropy)
 * - Biophony/Anthrophony analysis
 */

export interface AcousticIndexResult {
  aci: number;           // Acoustic Complexity Index (0-∞, higher = more complex)
  ndsi: number;          // Normalized Difference Soundscape Index (-1 to 1)
  biophony: number;      // Biophony level (0-1)
  anthrophony: number;   // Anthrophony level (0-1)
  entropy: number;       // Acoustic entropy (0-1)
  peakFrequency: number; // Dominant frequency in Hz
  spectralCentroid: number;
}

export interface FrequencyBandAnalysis {
  band: string;
  minFreq: number;
  maxFreq: number;
  energy: number;
  percentage: number;
}

export interface SoundscapeAnalysisResult {
  indices: AcousticIndexResult;
  frequencyBands: FrequencyBandAnalysis[];
  temporalVariation: number[];
  spectrogramData: Float32Array[];
  duration: number;
  sampleRate: number;
}

// Frequency band definitions for bioacoustics
const FREQUENCY_BANDS = {
  anthrophony: { min: 0, max: 2000, label: 'Anthrophony (Human/Machine)' },
  lowBiophony: { min: 2000, max: 4000, label: 'Low Biophony (Large animals)' },
  midBiophony: { min: 4000, max: 8000, label: 'Mid Biophony (Birds, insects)' },
  highBiophony: { min: 8000, max: 16000, label: 'High Biophony (Insects, bats)' },
  ultrasonic: { min: 16000, max: 22050, label: 'Ultrasonic' },
};

/**
 * Calculate Acoustic Complexity Index (ACI)
 * Based on Pieretti et al. 2011
 * Measures intensity variation in each frequency bin across time
 */
function calculateACI(spectrogram: Float32Array[], numFreqBins: number): number {
  if (spectrogram.length < 2) return 0;

  let totalDiff = 0;
  let totalIntensity = 0;

  for (let freq = 0; freq < numFreqBins; freq++) {
    for (let time = 1; time < spectrogram.length; time++) {
      const diff = Math.abs(spectrogram[time][freq] - spectrogram[time - 1][freq]);
      totalDiff += diff;
      totalIntensity += spectrogram[time][freq];
    }
  }

  return totalIntensity > 0 ? totalDiff / totalIntensity : 0;
}

/**
 * Calculate Normalized Difference Soundscape Index (NDSI)
 * Based on Kasten et al. 2012
 * Compares biophony to anthrophony: (bio - anthro) / (bio + anthro)
 */
function calculateNDSI(
  spectrogram: Float32Array[],
  sampleRate: number,
  fftSize: number
): { ndsi: number; biophony: number; anthrophony: number } {
  const freqResolution = sampleRate / fftSize;

  // Anthrophony: 1-2 kHz
  const anthroMinBin = Math.floor(1000 / freqResolution);
  const anthroMaxBin = Math.floor(2000 / freqResolution);

  // Biophony: 2-8 kHz
  const bioMinBin = Math.floor(2000 / freqResolution);
  const bioMaxBin = Math.floor(8000 / freqResolution);

  let anthroEnergy = 0;
  let bioEnergy = 0;

  for (const frame of spectrogram) {
    for (let bin = anthroMinBin; bin < anthroMaxBin && bin < frame.length; bin++) {
      anthroEnergy += frame[bin];
    }
    for (let bin = bioMinBin; bin < bioMaxBin && bin < frame.length; bin++) {
      bioEnergy += frame[bin];
    }
  }

  // Normalize
  const numAnthBins = anthroMaxBin - anthroMinBin;
  const numBioBins = bioMaxBin - bioMinBin;

  const normAnthro = numAnthBins > 0 ? anthroEnergy / (numAnthBins * spectrogram.length) : 0;
  const normBio = numBioBins > 0 ? bioEnergy / (numBioBins * spectrogram.length) : 0;

  const sum = normBio + normAnthro;
  const ndsi = sum > 0 ? (normBio - normAnthro) / sum : 0;

  return {
    ndsi,
    biophony: normBio,
    anthrophony: normAnthro,
  };
}

/**
 * Calculate acoustic entropy
 * Based on Sueur et al. 2008
 */
function calculateEntropy(spectrum: Float32Array): number {
  const total = spectrum.reduce((sum, val) => sum + val, 0);
  if (total === 0) return 0;

  let entropy = 0;
  for (const val of spectrum) {
    if (val > 0) {
      const p = val / total;
      entropy -= p * Math.log2(p);
    }
  }

  // Normalize to 0-1
  const maxEntropy = Math.log2(spectrum.length);
  return maxEntropy > 0 ? entropy / maxEntropy : 0;
}

/**
 * Compute spectrogram from audio buffer
 */
function computeSpectrogram(
  audioData: Float32Array,
  sampleRate: number,
  fftSize: number = 2048,
  hopSize: number = 1024
): Float32Array[] {
  const numFrames = Math.floor((audioData.length - fftSize) / hopSize);
  const spectrogram: Float32Array[] = [];

  // Simple magnitude spectrum using real FFT approximation
  // (In production, use Web Audio API AnalyserNode or proper FFT library)
  for (let frame = 0; frame < numFrames; frame++) {
    const startSample = frame * hopSize;
    const spectrum = new Float32Array(fftSize / 2);

    // Apply Hann window and compute simple power spectrum
    for (let bin = 0; bin < fftSize / 2; bin++) {
      const freq = (bin * sampleRate) / fftSize;
      let real = 0;
      let imag = 0;

      for (let n = 0; n < fftSize; n++) {
        const sample = audioData[startSample + n] || 0;
        const window = 0.5 * (1 - Math.cos((2 * Math.PI * n) / (fftSize - 1))); // Hann
        const angle = (2 * Math.PI * bin * n) / fftSize;
        real += sample * window * Math.cos(angle);
        imag -= sample * window * Math.sin(angle);
      }

      spectrum[bin] = Math.sqrt(real * real + imag * imag) / fftSize;
    }

    spectrogram.push(spectrum);
  }

  return spectrogram;
}

/**
 * Analyze frequency bands
 */
function analyzeFrequencyBands(
  spectrogram: Float32Array[],
  sampleRate: number,
  fftSize: number
): FrequencyBandAnalysis[] {
  const freqResolution = sampleRate / fftSize;
  const results: FrequencyBandAnalysis[] = [];
  let totalEnergy = 0;

  // Calculate total energy first
  for (const frame of spectrogram) {
    for (const val of frame) {
      totalEnergy += val;
    }
  }

  for (const [bandName, bandDef] of Object.entries(FREQUENCY_BANDS)) {
    const minBin = Math.floor(bandDef.min / freqResolution);
    const maxBin = Math.min(Math.floor(bandDef.max / freqResolution), fftSize / 2);

    let bandEnergy = 0;
    for (const frame of spectrogram) {
      for (let bin = minBin; bin < maxBin && bin < frame.length; bin++) {
        bandEnergy += frame[bin];
      }
    }

    results.push({
      band: bandDef.label,
      minFreq: bandDef.min,
      maxFreq: bandDef.max,
      energy: bandEnergy,
      percentage: totalEnergy > 0 ? (bandEnergy / totalEnergy) * 100 : 0,
    });
  }

  return results;
}

/**
 * Main soundscape analysis function
 */
export async function analyzeSoundscape(
  audioBuffer: AudioBuffer,
  options: {
    fftSize?: number;
    hopSize?: number;
    onProgress?: (percent: number) => void;
  } = {}
): Promise<SoundscapeAnalysisResult> {
  const { fftSize = 2048, hopSize = 1024, onProgress } = options;

  const sampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0);

  onProgress?.(10);

  // Compute spectrogram
  const spectrogram = computeSpectrogram(channelData, sampleRate, fftSize, hopSize);

  onProgress?.(40);

  // Calculate ACI
  const aci = calculateACI(spectrogram, fftSize / 2);

  onProgress?.(50);

  // Calculate NDSI
  const { ndsi, biophony, anthrophony } = calculateNDSI(spectrogram, sampleRate, fftSize);

  onProgress?.(60);

  // Calculate average entropy
  let totalEntropy = 0;
  for (const frame of spectrogram) {
    totalEntropy += calculateEntropy(frame);
  }
  const entropy = spectrogram.length > 0 ? totalEntropy / spectrogram.length : 0;

  onProgress?.(70);

  // Calculate spectral centroid and peak frequency
  let peakFrequency = 0;
  let spectralCentroid = 0;
  const avgSpectrum = new Float32Array(fftSize / 2);

  for (const frame of spectrogram) {
    for (let i = 0; i < frame.length; i++) {
      avgSpectrum[i] += frame[i];
    }
  }

  let totalMagnitude = 0;
  let peakMagnitude = 0;

  for (let bin = 0; bin < avgSpectrum.length; bin++) {
    avgSpectrum[bin] /= spectrogram.length;
    const freq = (bin * sampleRate) / fftSize;
    totalMagnitude += avgSpectrum[bin];
    spectralCentroid += freq * avgSpectrum[bin];

    if (avgSpectrum[bin] > peakMagnitude) {
      peakMagnitude = avgSpectrum[bin];
      peakFrequency = freq;
    }
  }

  spectralCentroid = totalMagnitude > 0 ? spectralCentroid / totalMagnitude : 0;

  onProgress?.(80);

  // Analyze frequency bands
  const frequencyBands = analyzeFrequencyBands(spectrogram, sampleRate, fftSize);

  onProgress?.(90);

  // Calculate temporal variation (RMS per second)
  const samplesPerSecond = sampleRate;
  const numSeconds = Math.ceil(channelData.length / samplesPerSecond);
  const temporalVariation: number[] = [];

  for (let sec = 0; sec < numSeconds; sec++) {
    const start = sec * samplesPerSecond;
    const end = Math.min(start + samplesPerSecond, channelData.length);
    let rms = 0;
    for (let i = start; i < end; i++) {
      rms += channelData[i] * channelData[i];
    }
    rms = Math.sqrt(rms / (end - start));
    temporalVariation.push(rms);
  }

  onProgress?.(100);

  return {
    indices: {
      aci,
      ndsi,
      biophony,
      anthrophony,
      entropy,
      peakFrequency,
      spectralCentroid,
    },
    frequencyBands,
    temporalVariation,
    spectrogramData: spectrogram,
    duration: audioBuffer.duration,
    sampleRate,
  };
}

const acousticIndicesService = {
  analyzeSoundscape,
};

export default acousticIndicesService;
