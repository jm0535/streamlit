/**
 * Basic Pitch Transcription Service
 *
 * Uses Spotify's Basic Pitch ML model for publication-quality
 * polyphonic audio-to-MIDI transcription.
 *
 * Features:
 * - Polyphonic transcription (multiple simultaneous notes)
 * - Pitch bend detection for microtonal music
 * - High accuracy for ethnomusicology research
 *
 * Reference: https://github.com/spotify/basic-pitch-ts
 */

import { BasicPitch, outputToNotesPoly, addPitchBendsToNoteEvents, noteFramesToTime } from '@spotify/basic-pitch';
import type { Note } from './midi-utils';

// Model URL from unpkg CDN
const MODEL_URL = 'https://unpkg.com/@spotify/basic-pitch@1.0.1/model/model.json';

export interface BasicPitchOptions {
  onsetThreshold?: number;  // Sensitivity for note onset detection (0-1)
  frameThreshold?: number;  // Sensitivity for frame detection (0-1)
  minNoteLength?: number;   // Minimum note length in frames (default: 11)
  minFreq?: number | null;  // Minimum frequency in Hz (null = no limit)
  maxFreq?: number | null;  // Maximum frequency in Hz (null = no limit)
  includePitchBends?: boolean; // Include pitch bend data for microtonal accuracy
  inferOnsets?: boolean;    // Infer note onsets from frames
  melodiaTrick?: boolean;   // Use MELODIA algorithm trick for better results
}

export interface TranscriptionProgress {
  percentComplete: number;
  status: string;
}

export interface BasicPitchResult {
  notes: Note[];
  duration: number;
  tempo: number;
  confidence: number;
}

// Default options optimized for research
const DEFAULT_OPTIONS: BasicPitchOptions = {
  onsetThreshold: 0.5,
  frameThreshold: 0.3,
  minNoteLength: 11,  // ~127ms at 22050Hz
  minFreq: null,
  maxFreq: null,
  includePitchBends: true,
  inferOnsets: true,
  melodiaTrick: true,
};

// Singleton instance of BasicPitch model
let basicPitchInstance: BasicPitch | null = null;
let modelLoading = false;

/**
 * Initialize the Basic Pitch model
 * This loads the TensorFlow.js model from unpkg CDN
 */
export async function initializeBasicPitch(
  onProgress?: (status: string) => void
): Promise<BasicPitch> {
  if (basicPitchInstance !== null) return basicPitchInstance;

  if (modelLoading) {
    // Wait for ongoing loading
    while (modelLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (basicPitchInstance) return basicPitchInstance;
  }

  modelLoading = true;
  onProgress?.('Loading Basic Pitch ML model...');

  try {
    console.log('🎵 Loading Basic Pitch model from:', MODEL_URL);
    basicPitchInstance = new BasicPitch(MODEL_URL);

    // Pre-load the model
    await basicPitchInstance.model;

    console.log('✅ Basic Pitch model initialized');
    onProgress?.('Model loaded successfully');
    return basicPitchInstance;
  } catch (error) {
    console.error('Failed to load Basic Pitch model:', error);
    throw new Error('Failed to load transcription model. Please check your internet connection.');
  } finally {
    modelLoading = false;
  }
}

/**
 * Transcribe audio using Basic Pitch ML model
 *
 * This is the recommended method for publication-quality transcription:
 * - Handles polyphonic audio
 * - Detects pitch bends
 * - High accuracy across instruments
 *
 * @param audioBuffer - Web Audio API AudioBuffer
 * @param options - Transcription options
 * @param onProgress - Progress callback
 * @returns Transcription results with notes array
 */
export async function transcribeWithBasicPitch(
  audioBuffer: AudioBuffer,
  options: BasicPitchOptions = {},
  onProgress?: (progress: TranscriptionProgress) => void
): Promise<BasicPitchResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Initialize model
  onProgress?.({ percentComplete: 0, status: 'Loading ML model...' });
  const basicPitch = await initializeBasicPitch((status) => {
    onProgress?.({ percentComplete: 5, status });
  });

  onProgress?.({ percentComplete: 10, status: 'Preparing audio...' });

  // Convert to mono Float32Array if needed
  let audioData: Float32Array;
  if (audioBuffer.numberOfChannels > 1) {
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    audioData = new Float32Array(left.length);
    for (let i = 0; i < left.length; i++) {
      audioData[i] = (left[i] + right[i]) / 2;
    }
  } else {
    audioData = audioBuffer.getChannelData(0);
  }

  // Store frames, onsets, and contours from the model
  let frames: number[][] = [];
  let onsets: number[][] = [];
  let contours: number[][] = [];

  onProgress?.({ percentComplete: 15, status: 'Running ML transcription...' });

  // Run the model - evaluateModel uses callbacks
  await basicPitch.evaluateModel(
    audioData,
    // onComplete callback - receives frames, onsets, contours
    (f, o, c) => {
      frames = f;
      onsets = o;
      contours = c;
    },
    // percentCallback
    (percent) => {
      onProgress?.({
        percentComplete: 15 + Math.floor(percent * 70),
        status: `Processing audio: ${Math.round(percent * 100)}%`
      });
    }
  );

  onProgress?.({ percentComplete: 88, status: 'Extracting notes...' });

  // Convert model output to note events
  let noteEvents = outputToNotesPoly(
    frames,
    onsets,
    opts.onsetThreshold,
    opts.frameThreshold,
    opts.minNoteLength,
    opts.inferOnsets,
    opts.maxFreq,
    opts.minFreq,
    opts.melodiaTrick,
    0.2  // energyTolerance
  );

  onProgress?.({ percentComplete: 92, status: 'Adding pitch bends...' });

  // Optionally add pitch bends for microtonal accuracy
  if (opts.includePitchBends && contours.length > 0) {
    noteEvents = addPitchBendsToNoteEvents(contours, noteEvents);
  }

  // Convert frame-based notes to time-based notes
  const timeNotes = noteFramesToTime(noteEvents);

  onProgress?.({ percentComplete: 96, status: 'Formatting results...' });

  // Convert to our Note format
  const notes: Note[] = timeNotes.map((event) => {
    const midi = event.pitchMidi;
    const frequency = 440 * Math.pow(2, (midi - 69) / 12);
    const octave = Math.floor(midi / 12) - 1;
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const name = noteNames[midi % 12] + octave;

    return {
      midi,
      name,
      pitchName: noteNames[midi % 12],
      octave,
      frequency,
      startTime: event.startTimeSeconds,
      duration: event.durationSeconds,
      velocity: Math.round((event.amplitude || 0.8) * 127),
      confidence: event.amplitude || 0.8,
      pitchBend: event.pitchBends ? event.pitchBends[0] : undefined,
    };
  });

  // Estimate tempo from notes
  const tempo = estimateTempo(notes);

  onProgress?.({ percentComplete: 100, status: 'Complete!' });

  console.log(`✅ Transcription complete: ${notes.length} notes extracted`);

  return {
    notes,
    duration: audioBuffer.duration,
    tempo,
    confidence: notes.length > 0 ? notes.reduce((sum, n) => sum + n.confidence, 0) / notes.length : 0,
  };
}

/**
 * Estimate tempo from note onsets using IOI (Inter-Onset Interval) analysis
 */
function estimateTempo(notes: Note[]): number {
  if (notes.length < 4) return 120;

  // Get sorted onset times
  const onsets = notes.map(n => n.startTime).sort((a, b) => a - b);

  // Calculate IOIs
  const iois: number[] = [];
  for (let i = 1; i < onsets.length; i++) {
    const ioi = onsets[i] - onsets[i - 1];
    if (ioi > 0.1 && ioi < 2.0) {
      iois.push(ioi);
    }
  }

  if (iois.length < 2) return 120;

  // Find most common IOI using histogram
  const bucketSize = 0.05;
  const histogram: Record<number, number> = {};

  for (const ioi of iois) {
    const bucket = Math.round(ioi / bucketSize) * bucketSize;
    histogram[bucket] = (histogram[bucket] || 0) + 1;
  }

  let mostCommonIOI = 0.5;
  let maxCount = 0;

  for (const [ioi, count] of Object.entries(histogram)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonIOI = parseFloat(ioi);
    }
  }

  // Convert to BPM
  const bpm = Math.round(60 / mostCommonIOI);
  return Math.max(40, Math.min(240, bpm));
}

/**
 * Check if Basic Pitch model is loaded
 */
export function isBasicPitchAvailable(): boolean {
  return basicPitchInstance !== null;
}

/**
 * Check if Basic Pitch is currently loading
 */
export function isBasicPitchLoading(): boolean {
  return modelLoading;
}
