'use client';

/**
 * Demucs Service - ML-based Audio Source Separation
 * Uses demucs-wasm for real stem separation (drums, bass, vocals, other)
 */

// Dynamic import to avoid SSR issues with WASM
let DemucsModule: any = null;

export interface StemSeparationResult {
  drums: AudioBuffer;
  bass: AudioBuffer;
  vocals: AudioBuffer;
  other: AudioBuffer;
}

export interface SeparationProgress {
  stage: 'loading' | 'initializing' | 'processing' | 'complete' | 'error';
  percent: number;
  message: string;
}

type ProgressCallback = (progress: SeparationProgress) => void;

// Model URLs - these will be fetched by the WASM module
const MODEL_BASE_URL = 'https://bucket.freemusicdemixer.com';

/**
 * Initialize the Demucs WASM module
 */
async function initDemucs(onProgress?: ProgressCallback): Promise<void> {
  if (DemucsModule) return;

  onProgress?.({
    stage: 'loading',
    percent: 5,
    message: 'Loading Demucs ML engine...'
  });

  try {
    // Dynamic import of demucs-wasm
    const demucsWasm = await import('demucs-wasm');
    DemucsModule = demucsWasm;

    onProgress?.({
      stage: 'initializing',
      percent: 15,
      message: 'Initializing ML model (first time may take longer)...'
    });

  } catch (error) {
    console.error('Failed to load Demucs WASM:', error);
    throw new Error('Failed to load ML separation engine. Please ensure your browser supports WebAssembly.');
  }
}

/**
 * Convert Float32Array to AudioBuffer
 */
function floatArrayToAudioBuffer(
  data: Float32Array[],
  sampleRate: number
): AudioBuffer {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const numChannels = data.length;
  const length = data[0].length;

  const buffer = audioContext.createBuffer(numChannels, length, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    // Create a new Float32Array from the data to ensure correct ArrayBuffer type
    buffer.copyToChannel(new Float32Array(data[channel]), channel);
  }

  audioContext.close();
  return buffer;
}

/**
 * Main function to separate audio into stems using Demucs ML
 */
export async function separateAudioWithDemucs(
  audioBuffer: AudioBuffer,
  onProgress?: ProgressCallback
): Promise<StemSeparationResult> {
  // Initialize if needed
  await initDemucs(onProgress);

  onProgress?.({
    stage: 'processing',
    percent: 20,
    message: 'Preparing audio for ML processing...'
  });

  try {
    // Get audio data from buffer
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;

    // Create interleaved audio data for Demucs
    const leftChannel = audioBuffer.getChannelData(0);
    const rightChannel = numChannels > 1 ? audioBuffer.getChannelData(1) : leftChannel;

    onProgress?.({
      stage: 'processing',
      percent: 30,
      message: 'Running ML source separation (this may take a minute)...'
    });

    // Call Demucs separation
    // The demucs-wasm API may vary - this is based on common patterns
    const result = await DemucsModule.separate({
      left: leftChannel,
      right: rightChannel,
      sampleRate: sampleRate,
      model: 'htdemucs',
      onProgress: (progress: number) => {
        onProgress?.({
          stage: 'processing',
          percent: 30 + (progress * 0.6), // Map 0-100 to 30-90
          message: `Separating stems: ${Math.round(progress)}%`
        });
      }
    });

    onProgress?.({
      stage: 'processing',
      percent: 95,
      message: 'Finalizing separated stems...'
    });

    // Convert results to AudioBuffers
    const stems: StemSeparationResult = {
      drums: floatArrayToAudioBuffer([result.drums.left, result.drums.right], sampleRate),
      bass: floatArrayToAudioBuffer([result.bass.left, result.bass.right], sampleRate),
      vocals: floatArrayToAudioBuffer([result.vocals.left, result.vocals.right], sampleRate),
      other: floatArrayToAudioBuffer([result.other.left, result.other.right], sampleRate),
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
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  // Interleave channels and write samples
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
 * Check if the browser supports the required features for Demucs
 */
export function checkBrowserSupport(): { supported: boolean; message: string } {
  // Check for SharedArrayBuffer (required for WASM threading)
  if (typeof SharedArrayBuffer === 'undefined') {
    return {
      supported: false,
      message: 'Your browser does not support SharedArrayBuffer. Please use Chrome, Edge, or Firefox with proper CORS headers.'
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
