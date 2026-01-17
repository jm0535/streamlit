import { DemucsProcessor } from 'demucs-web';
import * as ort from 'onnxruntime-web';

// Define message types
export type WorkerMessage =
  | { type: 'separate'; left: Float32Array; right: Float32Array; sampleRate: number; qualityMode: 'fast' | 'balanced' | 'quality' }
  | { type: 'preload' };

export type WorkerResponse =
  | { type: 'progress'; stage: string; percent: number; message: string }
  | { type: 'complete'; result: any } // Result has un-serialized buffers
  | { type: 'error'; message: string };

// Internal state
const MODEL_URL = 'https://huggingface.co/timcsy/demucs-web-onnx/resolve/main/htdemucs_embedded.onnx';
let processorInstance: DemucsProcessor | null = null;
let isModelLoaded = false;
let currentProcessorQuality: string | null = null;

const QUALITY_PRESETS = {
  fast: { overlap: 0.05 },
  balanced: { overlap: 0.15 },
  quality: { overlap: 0.25 },
};

// Helper: Post progress message
const postProgress = (stage: string, percent: number, message: string) => {
  self.postMessage({ type: 'progress', stage, percent, message });
};

// Helper: Initialize processor
const initProcessor = async (qualityMode: 'fast' | 'balanced' | 'quality') => {
  // Reset if quality changed
  if (processorInstance && currentProcessorQuality !== qualityMode) {
    console.log(`[Worker] Quality changed to ${qualityMode}, resetting processor`);
    processorInstance = null;
    isModelLoaded = false;
  }

  if (!processorInstance) {
    currentProcessorQuality = qualityMode;
    const preset = QUALITY_PRESETS[qualityMode];

    processorInstance = new DemucsProcessor({
      ort,
      overlap: preset.overlap,
      onProgress: (info: any) => {
        const percent = 40 + (info.progress * 50); // Map 0-1 to 40-90
        postProgress(
          'processing',
          percent,
          `Separating stems: ${Math.round(info.progress * 100)}% (segment ${info.currentSegment}/${info.totalSegments})`
        );
      },
      onLog: (phase: string, message: string) => {
        console.log(`[Worker][${phase}] ${message}`);
      },
      onDownloadProgress: (loaded: number, total: number) => {
        const percent = 15 + ((loaded / total) * 20); // Map to 15-35
        const loadedMB = (loaded / 1024 / 1024).toFixed(1);
        const totalMB = (total / 1024 / 1024).toFixed(1);
        postProgress('downloading', percent, `Downloading model: ${loadedMB}MB / ${totalMB}MB`);
      },
      sessionOptions: {
        enableCpuMemArena: false,
        enableMemPattern: false,
      }
    });
  }

  if (!isModelLoaded) {
    postProgress('initializing', 35, 'Initializing ML model (this may take a moment)...');
    await processorInstance.loadModel(MODEL_URL);
    isModelLoaded = true;
  }
};

// Message Handler
self.onmessage = async (e: MessageEvent) => {
  const msg = e.data as WorkerMessage;

  try {
    if (msg.type === 'preload') {
      await initProcessor('balanced'); // Default to balanced for preload
      postProgress('complete', 100, 'Model ready!');
    }

    else if (msg.type === 'separate') {
      const { left, right, sampleRate, qualityMode } = msg;

      postProgress('loading', 5, 'Initializing worker...');

      // 1. Resample if needed
      let processLeft = left;
      let processRight = right;

      if (sampleRate !== 44100) {
        postProgress('initializing', 10, `Resampling from ${sampleRate}Hz to 44100Hz...`);
        const ratio = 44100 / sampleRate;
        const newLength = Math.floor(left.length * ratio);
        processLeft = new Float32Array(newLength);
        processRight = new Float32Array(newLength);

        for (let i = 0; i < newLength; i++) {
          const srcIndex = i / ratio;
          const srcIndexFloor = Math.floor(srcIndex);
          const srcIndexCeil = Math.min(srcIndexFloor + 1, left.length - 1);
          const t = srcIndex - srcIndexFloor;

          processLeft[i] = left[srcIndexFloor] * (1 - t) + left[srcIndexCeil] * t;
          processRight[i] = right[srcIndexFloor] * (1 - t) + right[srcIndexCeil] * t;
        }
      }

      // 2. Init Processor
      await initProcessor(qualityMode);

      // 3. Separate
      postProgress('processing', 40, 'Starting stem separation...');
      const result = await processorInstance!.separate(processLeft, processRight);

      postProgress('processing', 95, 'Finalizing separated stems...');

      // 4. Transfer results
      // We send back raw Float32Arrays for the main thread to convert to AudioBuffers
      self.postMessage({
        type: 'complete',
        result: {
          drums: result.drums,
          bass: result.bass,
          vocals: result.vocals,
          other: result.other
        }
      }, {
        transfer: [
          result.drums.left.buffer, result.drums.right.buffer,
          result.bass.left.buffer, result.bass.right.buffer,
          result.vocals.left.buffer, result.vocals.right.buffer,
          result.other.left.buffer, result.other.right.buffer
        ]
      } as any);
    }
  } catch (err) {
    console.error('[Worker] Error:', err);
    self.postMessage({
      type: 'error',
      message: err instanceof Error ? err.message : 'Unknown worker error'
    });
  }
};
