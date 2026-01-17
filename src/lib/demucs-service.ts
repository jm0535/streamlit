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


// Quality modes for speed/quality trade-off
export type QualityMode = 'fast' | 'balanced' | 'quality';

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

// Worker instance
let demucsWorker: Worker | null = null;
let currentWorkerQuality: QualityMode | null = null;

/**
 * Initialize Web Worker
 */
function getWorker(): Worker {
  if (!demucsWorker) {
    // Initialize worker
    demucsWorker = new Worker(new URL('./demucs.worker.ts', import.meta.url));
    console.log('[DemucsService] Worker initialized');
  }
  return demucsWorker;
}

/**
 * Main function to separate audio into stems using Demucs ONNX via Web Worker
 */
export async function separateAudioWithDemucs(
  audioBuffer: AudioBuffer,
  onProgress?: ProgressCallback,
  qualityMode: QualityMode = 'balanced'
): Promise<StemSeparationResult> {

  console.log(`[DemucsService] Starting separation in ${qualityMode} mode`);
  const worker = getWorker();

  // Reset worker if quality changed (though worker handles this internally too,
  // we might want to terminate/recreate if we wanted a hard reset, but
  // sending the mode is enough for now)

  return new Promise((resolve, reject) => {
    // Handle messages from worker
    worker.onmessage = (e) => {
      const msg = e.data;

      if (msg.type === 'progress') {
        onProgress?.({
          stage: msg.stage,
          percent: msg.percent,
          message: msg.message
        });
      } else if (msg.type === 'complete') {
        onProgress?.({
          stage: 'complete',
          percent: 100,
          message: 'Separation complete!'
        });

        // Convert raw Float32Arrays back to AudioBuffers
        const { drums, bass, vocals, other } = msg.result;
        const outputSampleRate = 44100;

        const result: StemSeparationResult = {
          drums: floatArrayToAudioBuffer(drums.left, drums.right, outputSampleRate),
          bass: floatArrayToAudioBuffer(bass.left, bass.right, outputSampleRate),
          vocals: floatArrayToAudioBuffer(vocals.left, vocals.right, outputSampleRate),
          other: floatArrayToAudioBuffer(other.left, other.right, outputSampleRate),
        };

        resolve(result);
      } else if (msg.type === 'error') {
        reject(new Error(msg.message));
      }
    };

    worker.onerror = (err) => {
      console.error('[DemucsService] Worker error:', err);
      reject(new Error('Web Worker error occurred'));
    };

    // Prepare data for transfer
    const leftChannel = audioBuffer.getChannelData(0);
    const rightChannel = audioBuffer.numberOfChannels > 1
      ? audioBuffer.getChannelData(1)
      : audioBuffer.getChannelData(0);

    // We must copy the data because we can't transfer the AudioBuffer's internal buffers directly consistently
    // across all browsers without detachment issues if we want to reuse the original buffer?
    // Actually, getChannelData returns a Float32Array view of the buffer.
    // To be safe and adhere to "Transferable" zero-copy where possible but preserve original:
    // We'll make a copy to send to the worker.
    const leftCopy = new Float32Array(leftChannel);
    const rightCopy = new Float32Array(rightChannel);

    // Send start message
    worker.postMessage({
      type: 'separate',
      left: leftCopy,
      right: rightCopy,
      sampleRate: audioBuffer.sampleRate,
      qualityMode
    }, [leftCopy.buffer, rightCopy.buffer]); // Transfer the copies
  });
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
/**
 * Pre-download the model to cache it via Web Worker
 */
export async function preloadModel(onProgress?: ProgressCallback): Promise<void> {
  const worker = getWorker();

  return new Promise((resolve, reject) => {
    // We need a temporary message handler for this preload operation
    // Note: In a real app with multiple concurrent operations, we'd need meaningful IDs
    // to route messages. For now, we assume sequential usage or simple overlapping.

    const handler = (e: MessageEvent) => {
      const msg = e.data;

      if (msg.type === 'progress') {
        onProgress?.({
          stage: msg.stage,
          percent: msg.percent,
          message: msg.message
        });
      } else if (msg.type === 'complete') {
        worker.removeEventListener('message', handler);
        onProgress?.({
          stage: 'complete',
          percent: 100,
          message: 'Model ready!'
        });
        resolve();
      } else if (msg.type === 'error') {
        worker.removeEventListener('message', handler);
        reject(new Error(msg.message));
      }
    };

    worker.addEventListener('message', handler);
    worker.postMessage({ type: 'preload' });
  });
}
