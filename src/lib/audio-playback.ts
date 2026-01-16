/**
 * Audio Playback Service using Tone.js
 *
 * Provides realistic instrument playback for transcribed notes
 * using high-quality samples and proper ADSR envelopes.
 *
 * Features:
 * - Salamander Grand Piano samples
 * - Proper attack/decay/sustain/release envelopes
 * - Velocity-sensitive playback
 * - Global transport for synchronized playback
 */

import * as Tone from 'tone';
import type { Note } from './midi-utils';

export type InstrumentType = 'piano' | 'synth' | 'strings' | 'brass' | 'woodwind';

export interface PlaybackOptions {
  instrument?: InstrumentType;
  volume?: number; // 0-1
  tempo?: number; // BPM for tempo scaling
}

// Sampler for piano (loaded on demand)
let pianoSampler: Tone.Sampler | null = null;
let synthInstance: Tone.PolySynth | null = null;
let isLoading = false;

// Currently scheduled notes for stopping playback
let scheduledEvents: number[] = [];

/**
 * Salamander Grand Piano sample URLs
 * Using publicly available samples from Tone.js examples
 */
const PIANO_SAMPLES: Record<string, string> = {
  A0: 'A0.mp3',
  C1: 'C1.mp3',
  'D#1': 'Ds1.mp3',
  'F#1': 'Fs1.mp3',
  A1: 'A1.mp3',
  C2: 'C2.mp3',
  'D#2': 'Ds2.mp3',
  'F#2': 'Fs2.mp3',
  A2: 'A2.mp3',
  C3: 'C3.mp3',
  'D#3': 'Ds3.mp3',
  'F#3': 'Fs3.mp3',
  A3: 'A3.mp3',
  C4: 'C4.mp3',
  'D#4': 'Ds4.mp3',
  'F#4': 'Fs4.mp3',
  A4: 'A4.mp3',
  C5: 'C5.mp3',
  'D#5': 'Ds5.mp3',
  'F#5': 'Fs5.mp3',
  A5: 'A5.mp3',
  C6: 'C6.mp3',
  'D#6': 'Ds6.mp3',
  'F#6': 'Fs6.mp3',
  A6: 'A6.mp3',
  C7: 'C7.mp3',
  'D#7': 'Ds7.mp3',
  'F#7': 'Fs7.mp3',
  A7: 'A7.mp3',
  C8: 'C8.mp3',
};

const PIANO_BASE_URL = 'https://tonejs.github.io/audio/salamander/';

/**
 * Initialize the audio engine
 * Must be called from a user interaction event (click/keydown)
 */
export async function initializeAudio(): Promise<void> {
  if (Tone.context.state !== 'running') {
    await Tone.start();
    console.log('✅ Audio context started');
  }
}

/**
 * Load the piano sampler
 */
export async function loadPianoSampler(): Promise<Tone.Sampler> {
  if (pianoSampler) return pianoSampler;
  if (isLoading) {
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (pianoSampler) return pianoSampler;
  }

  isLoading = true;
  console.log('🎹 Loading piano samples...');

  return new Promise((resolve, reject) => {
    pianoSampler = new Tone.Sampler({
      urls: PIANO_SAMPLES,
      baseUrl: PIANO_BASE_URL,
      onload: () => {
        console.log('✅ Piano samples loaded');
        isLoading = false;
        resolve(pianoSampler!);
      },
      onerror: (error) => {
        console.error('Failed to load piano samples:', error);
        isLoading = false;
        reject(error);
      },
    }).toDestination();
  });
}

/**
 * Get or create synth for fallback playback
 */
function getSynth(): Tone.PolySynth {
  if (!synthInstance) {
    synthInstance = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'triangle',
      },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 0.5,
      },
    }).toDestination();
  }
  return synthInstance;
}

/**
 * Play a sequence of notes with realistic instrument sounds
 *
 * @param notes - Array of notes to play
 * @param options - Playback options
 * @param onProgress - Progress callback for playhead position
 * @returns Stop function
 */
export async function playNotes(
  notes: Note[],
  options: PlaybackOptions = {},
  onProgress?: (time: number, isPlaying: boolean) => void
): Promise<() => void> {
  await initializeAudio();

  const { instrument = 'piano', volume = 0.8, tempo = 120 } = options;

  // Clear any previously scheduled events
  stopPlayback();

  // Try to use piano sampler, fall back to synth
  let player: Tone.Sampler | Tone.PolySynth;

  if (instrument === 'piano') {
    // Optimistic playback: Use piano if ready, else use synth immediately
    if (pianoSampler) {
      player = pianoSampler;
    } else {
      console.log('Piano not ready, utilizing Synth for instant playback');
      player = getSynth();
      // Trigger background load
      loadPianoSampler().catch(console.error);
    }
  } else {
    player = getSynth();
  }

  // Set volume
  player.volume.value = Tone.gainToDb(volume);

  const now = Tone.now();

  // Schedule all notes
  notes.forEach(note => {
    const frequency = Tone.Frequency(note.midi, 'midi').toFrequency();
    const startTime = now + note.startTime;
    const duration = Math.max(0.1, note.duration);
    const velocity = note.velocity / 127;

    // Use triggerAttackRelease for proper note handling
    if (player instanceof Tone.Sampler) {
      player.triggerAttackRelease(
        frequency,
        duration,
        startTime,
        velocity
      );
    } else {
      (player as Tone.PolySynth).triggerAttackRelease(
        frequency,
        duration,
        startTime,
        velocity
      );
    }
  });

  // Calculate total duration
  const maxEndTime = Math.max(...notes.map(n => n.startTime + n.duration));

  // Set up progress tracking
  let progressInterval: ReturnType<typeof setInterval> | null = null;
  const startTimestamp = performance.now();

  if (onProgress) {
    progressInterval = setInterval(() => {
      const elapsed = (performance.now() - startTimestamp) / 1000;
      if (elapsed >= maxEndTime) {
        onProgress(maxEndTime, false);
        if (progressInterval) clearInterval(progressInterval);
      } else {
        onProgress(elapsed, true);
      }
    }, 50);
  }

  // Stop function
  const stop = () => {
    if (progressInterval) clearInterval(progressInterval);
    Tone.Transport.stop();
    Tone.Transport.cancel();

    if (player instanceof Tone.Sampler) {
      player.releaseAll();
    } else {
      (player as Tone.PolySynth).releaseAll();
    }

    onProgress?.(0, false);
  };

  // Auto-stop when done
  setTimeout(() => {
    if (progressInterval) clearInterval(progressInterval);
    onProgress?.(maxEndTime, false);
  }, maxEndTime * 1000);

  return stop;
}

/**
 * Play a single note (for click feedback)
 */
export async function playNote(
  midi: number,
  duration: number = 0.5,
  velocity: number = 0.8
): Promise<void> {
  await initializeAudio();

  const synth = getSynth();
  const frequency = Tone.Frequency(midi, 'midi').toFrequency();

  synth.triggerAttackRelease(frequency, duration, Tone.now(), velocity);
}

/**
 * Stop all playback
 */
export function stopPlayback(): void {
  Tone.Transport.stop();
  Tone.Transport.cancel();

  if (pianoSampler) {
    pianoSampler.releaseAll();
  }

  if (synthInstance) {
    synthInstance.releaseAll();
  }

  scheduledEvents = [];
}

/**
 * Check if audio is ready
 */
export function isAudioReady(): boolean {
  return Tone.context.state === 'running';
}

/**
 * Get current audio context time
 */
export function getCurrentTime(): number {
  return Tone.now();
}

/**
 * Dispose all audio resources
 */
export function disposeAudio(): void {
  stopPlayback();

  if (pianoSampler) {
    pianoSampler.dispose();
    pianoSampler = null;
  }

  if (synthInstance) {
    synthInstance.dispose();
    synthInstance = null;
  }
}

/**
 * Preload high-quality assets in the background
 */
export function preloadAudioAssets(): void {
  // Start loading piano samples if not already loaded
  if (!pianoSampler && !isLoading) {
    console.log('Preloading audio assets...');
    loadPianoSampler().catch(err => console.warn('Background loading failed:', err));
  }
}
