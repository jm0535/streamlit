'use client';

/**
 * Demucs Service - ML-based Audio Source Separation
 * Uses demucs-web (ONNX Runtime Web) for real stem separation
 * Model: htdemucs_embedded.onnx (~172MB) from HuggingFace
 */

export interface StemSeparationResult {
  drums: AudioBuffer;
  bass: AudioBuffer;
  vocals: AudioBuffer;
  other: AudioBuffer;
}

export interface SeparationProgress {
  stage: 'loading' | 'downloading' | 'initializing' | 'processing' | 'complete' | 'error';
  percent: number;
  message: string;
}

type ProgressCallback = (progress: SeparationProgress) => void;

// HuggingFace public model URL (free, no auth required)
const MODEL_URL = 'https://huggingface.co/timcsy/demucs-web-onnx/resolve/main/htdemucs_embedded.onnx';

// Cached processor instance
let processorInstance: any = null;
let isModelLoaded = false;
let currentProcessorQuality: QualityMode | null = null;

/**
 * Convert Float32Array stereo to AudioBuffer
 */
function floatArrayToAudioBuffer(
  left: Float32Array,
  right: Float32Array,
  sampleRate: number
): AudioBuffer {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const length = left.length;

  const buffer = audioContext.createBuffer(2, length, sampleRate);
  buffer.copyToChannel(new Float32Array(left), 0);
  buffer.copyToChannel(new Float32Array(right), 1);

  audioContext.close();
  return buffer;
}

// Quality modes for speed/quality trade-off
export type QualityMode = 'fast' | 'balanced' | 'quality';

// Quality presets affect overlap and processing
const QUALITY_PRESETS = {
  fast: { overlap: 0.05, description: 'Fast (~2x faster, lower quality)' },
  balanced: { overlap: 0.15, description: 'Balanced (default)' },
  quality: { overlap: 0.25, description: 'High Quality (slower, best results)' },
};

/**
 * Main function to separate audio into stems using Demucs ONNX
 */
export async function separateAudioWithDemucs(
  audioBuffer: AudioBuffer,
  onProgress?: ProgressCallback,
  qualityMode: QualityMode = 'balanced'
): Promise<StemSeparationResult> {

  const preset = QUALITY_PRESETS[qualityMode];
  console.log(`[Demucs] Using ${qualityMode} mode (overlap: ${preset.overlap})`);

  onProgress?.({
    stage: 'loading',
    percent: 5,
    message: 'Loading ONNX Runtime...'
  });

  try {
    // Dynamic imports to avoid SSR issues
    const ort = await import('onnxruntime-web');
    const { DemucsProcessor } = await import('demucs-web');

    // Get audio data
    const sampleRate = audioBuffer.sampleRate;
    const leftChannel = audioBuffer.getChannelData(0);
    const rightChannel = audioBuffer.numberOfChannels > 1
      ? audioBuffer.getChannelData(1)
      : audioBuffer.getChannelData(0);

    // Resample to 44100Hz if needed (Demucs requires 44100Hz)
    let processLeft = leftChannel;
    let processRight = rightChannel;

    if (sampleRate !== 44100) {
      onProgress?.({
        stage: 'initializing',
        percent: 10,
        message: `Resampling from ${sampleRate}Hz to 44100Hz...`
      });

      // Simple linear interpolation resampling
      const ratio = 44100 / sampleRate;
      const newLength = Math.floor(leftChannel.length * ratio);
      processLeft = new Float32Array(newLength);
      processRight = new Float32Array(newLength);

      for (let i = 0; i < newLength; i++) {
        const srcIndex = i / ratio;
        const srcIndexFloor = Math.floor(srcIndex);
        const srcIndexCeil = Math.min(srcIndexFloor + 1, leftChannel.length - 1);
        const t = srcIndex - srcIndexFloor;

        processLeft[i] = leftChannel[srcIndexFloor] * (1 - t) + leftChannel[srcIndexCeil] * t;
        processRight[i] = rightChannel[srcIndexFloor] * (1 - t) + rightChannel[srcIndexCeil] * t;
      }
    }

    // Reset processor if quality mode changed
    if (processorInstance && currentProcessorQuality !== qualityMode) {
      console.log(`[Demucs] Quality mode changed from ${currentProcessorQuality} to ${qualityMode}, resetting processor`);
      processorInstance = null;
      isModelLoaded = false;
    }

    // Create or reuse processor
    if (!processorInstance) {
      currentProcessorQuality = qualityMode;
      onProgress?.({
        stage: 'downloading',
        percent: 15,
        message: 'Downloading ML model (~172MB, first time only)...'
      });

      processorInstance = new DemucsProcessor({
        ort,
        overlap: preset.overlap, // Quality/speed trade-off
        onProgress: (info: any) => {
          const percent = 40 + (info.progress * 50); // Map 0-1 to 40-90
          onProgress?.({
            stage: 'processing',
            percent,
            message: `Separating stems: ${Math.round(info.progress * 100)}% (segment ${info.currentSegment}/${info.totalSegments})`
          });
        },
        onLog: (phase: string, message: string) => {
          console.log(`[Demucs][${phase}] ${message}`);
        },
        onDownloadProgress: (loaded: number, total: number) => {
          const percent = 15 + ((loaded / total) * 20); // Map to 15-35
          const loadedMB = (loaded / 1024 / 1024).toFixed(1);
          const totalMB = (total / 1024 / 1024).toFixed(1);
          onProgress?.({
            stage: 'downloading',
            percent,
            message: `Downloading model: ${loadedMB}MB / ${totalMB}MB`
          });
        },
        sessionOptions: {
          // Reduce memory usage
          enableCpuMemArena: false,
          enableMemPattern: false,
        }
      });
    }

    // Load model if not already loaded
    if (!isModelLoaded) {
      onProgress?.({
        stage: 'initializing',
        percent: 35,
        message: 'Initializing ML model (this may take a moment)...'
      });

      await processorInstance.loadModel(MODEL_URL);
      isModelLoaded = true;
    }

    onProgress?.({
      stage: 'processing',
      percent: 40,
      message: 'Starting stem separation...'
    });

    // Perform separation
    const result = await processorInstance.separate(processLeft, processRight);

    onProgress?.({
      stage: 'processing',
      percent: 95,
      message: 'Finalizing separated stems...'
    });

    // Convert results to AudioBuffers (at original sample rate for compatibility)
    const outputSampleRate = 44100;

    const stems: StemSeparationResult = {
      drums: floatArrayToAudioBuffer(result.drums.left, result.drums.right, outputSampleRate),
      bass: floatArrayToAudioBuffer(result.bass.left, result.bass.right, outputSampleRate),
      vocals: floatArrayToAudioBuffer(result.vocals.left, result.vocals.right, outputSampleRate),
      other: floatArrayToAudioBuffer(result.other.left, result.other.right, outputSampleRate),
    };

    onProgress?.({
      stage: 'complete',
      percent: 100,
      message: 'Separation complete!'
    });

    return stems;

  } catch (error) {
    console.error('Demucs separation failed:', error);
    onProgress?.({
      stage: 'error',
      percent: 0,
      message: `Separation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
    throw error;
  }
}

/**
 * Convert AudioBuffer to WAV Blob for download/storage
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const bytesPerSample = 2; // 16-bit

  const dataLength = length * numChannels * bytesPerSample;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  let offset = headerLength;
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, int16, true);
      offset += bytesPerSample;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Check if the browser supports the required features
 */
export function checkBrowserSupport(): { supported: boolean; message: string } {
  // Check for SharedArrayBuffer (required for WASM threading)
  if (typeof SharedArrayBuffer === 'undefined') {
    return {
      supported: false,
      message: 'Your browser does not support SharedArrayBuffer. Please use Chrome, Edge, or Firefox.'
    };
  }

  // Check for WebAssembly
  if (typeof WebAssembly === 'undefined') {
    return {
      supported: false,
      message: 'Your browser does not support WebAssembly.'
    };
  }

  return {
    supported: true,
    message: 'Browser supports ML-based stem separation.'
  };
}

/**
 * Pre-download the model to cache it
 */
export async function preloadModel(onProgress?: ProgressCallback): Promise<void> {
  try {
    const ort = await import('onnxruntime-web');
    const { DemucsProcessor } = await import('demucs-web');

    if (!processorInstance) {
      processorInstance = new DemucsProcessor({
        ort,
        onDownloadProgress: (loaded: number, total: number) => {
          const percent = (loaded / total) * 100;
          const loadedMB = (loaded / 1024 / 1024).toFixed(1);
          const totalMB = (total / 1024 / 1024).toFixed(1);
          onProgress?.({
            stage: 'downloading',
            percent,
            message: `Downloading model: ${loadedMB}MB / ${totalMB}MB`
          });
        },
        sessionOptions: {
          enableCpuMemArena: false,
          enableMemPattern: false,
        }
      });
    }

    if (!isModelLoaded) {
      await processorInstance.loadModel(MODEL_URL);
      isModelLoaded = true;
    }

    onProgress?.({
      stage: 'complete',
      percent: 100,
      message: 'Model ready!'
    });
  } catch (error) {
    console.error('Failed to preload model:', error);
    throw error;
  }
}
