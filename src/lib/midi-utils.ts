/**
 * MIDI utilities - Full implementation using midi-writer-js
 */

import MidiWriter from 'midi-writer-js';

export interface Note {
  midi: number;
  name: string;
  pitchName?: string;
  octave: number;
  frequency: number;
  startTime: number;
  duration: number;
  velocity: number;
  confidence: number;
}

export interface AnalysisMetadata {
  filename?: string;
  songName?: string;
  province?: string;
  decade?: string;
  genre?: string;
  cultureGroup?: string;
  researcher?: string;
  notes?: string;
  processedAt?: string;
  detectedTempo?: number;
  detectedTimeSignature?: string;
}

// MIDI note names
const MIDI_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Convert MIDI note number to note name
 */
export function midiToNoteName(midi: number): string {
  const noteName = MIDI_NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${noteName}${octave}`;
}

/**
 * Convert note name to MIDI number
 */
export function noteNameToMidi(name: string): number {
  const match = name.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 60; // Default to middle C

  const [, noteName, octaveStr] = match;
  const octave = parseInt(octaveStr) + 1;
  const noteIndex = MIDI_NOTE_NAMES.indexOf(noteName);

  if (noteIndex === -1) return 60;
  return octave * 12 + noteIndex;
}

/**
 * Convert frequency to MIDI note number
 */
export function frequencyToMidi(frequency: number, referenceFrequency: number = 440): number {
  return Math.round(12 * Math.log2(frequency / referenceFrequency) + 69);
}

/**
 * Convert MIDI note number to frequency
 */
export function midiToFrequency(midi: number, referenceFrequency: number = 440): number {
  return referenceFrequency * Math.pow(2, (midi - 69) / 12);
}

/**
 * Convert seconds to MIDI ticks based on tempo
 */
function secondsToTicks(seconds: number, tempo: number = 120, ticksPerBeat: number = 128): number {
  const beatsPerSecond = tempo / 60;
  const beats = seconds * beatsPerSecond;
  return Math.round(beats * ticksPerBeat);
}

/**
 * Create a MIDI file from notes
 */
export function createMIDI(notes: Note[], metadata?: Partial<AnalysisMetadata>): Uint8Array {
  const tempo = metadata?.detectedTempo || 120;

  // Create a new track
  const track = new MidiWriter.Track();

  // Set tempo
  track.setTempo(tempo);

  // Add track name if provided
  if (metadata?.songName || metadata?.filename) {
    track.addTrackName(metadata.songName || metadata.filename || 'Untitled');
  }

  // Sort notes by start time
  const sortedNotes = [...notes].sort((a, b) => a.startTime - b.startTime);

  // Convert notes to MIDI events
  let lastEndTime = 0;

  for (const note of sortedNotes) {
    // Calculate wait time (rest before this note)
    const waitTime = Math.max(0, note.startTime - lastEndTime);
    const waitTicks = secondsToTicks(waitTime, tempo);

    // Calculate duration in ticks
    const durationTicks = secondsToTicks(note.duration, tempo);

    // Create note event
    const noteEvent = new MidiWriter.NoteEvent({
      pitch: note.midi,
      duration: `T${Math.max(1, durationTicks)}`,
      velocity: Math.min(127, Math.max(1, Math.round(note.velocity))),
      wait: waitTicks > 0 ? `T${waitTicks}` : undefined,
    });

    track.addEvent(noteEvent);
    lastEndTime = note.startTime + note.duration;
  }

  // Build the MIDI file
  const writer = new MidiWriter.Writer([track]);

  // Get data as base64 and convert to Uint8Array
  const dataUri = writer.dataUri();
  const base64 = dataUri.split(',')[1];
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

/**
 * Download MIDI file from notes
 */
export function downloadMIDIFromNotes(notes: Note[], filename: string = 'output.mid'): void {
  if (notes.length === 0) {
    console.warn('No notes to export');
    return;
  }

  const midiData = createMIDI(notes);
  // Convert to regular array for Blob compatibility with strict TypeScript
  const blob = new Blob([new Uint8Array(Array.from(midiData))], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse a MIDI file and extract notes (basic implementation)
 * Note: Full MIDI parsing is complex; this handles simple single-track files
 */
export async function parseMIDI(file: File): Promise<Note[]> {
  // For now, return placeholder - full MIDI parsing requires a separate library
  // like midi-parser-js or tone.js
  console.log('MIDI parsing for file:', file.name);
  console.warn('Full MIDI import is not yet implemented. Please use audio file analysis instead.');
  return [];
}

/**
 * Create a simple note from MIDI number
 */
export function createNote(
  midi: number,
  startTime: number,
  duration: number,
  velocity: number = 100
): Note {
  return {
    midi,
    name: midiToNoteName(midi),
    pitchName: midiToNoteName(midi),
    octave: Math.floor(midi / 12) - 1,
    frequency: midiToFrequency(midi),
    startTime,
    duration,
    velocity,
    confidence: 1,
  };
}

/**
 * Quantize notes to a grid
 */
export function quantizeNotes(
  notes: Note[],
  quantization: '1/4' | '1/8' | '1/16' | '1/32' = '1/8',
  tempo: number = 120
): Note[] {
  const beatsPerSecond = tempo / 60;

  let gridDivision: number;
  switch (quantization) {
    case '1/4': gridDivision = 1; break;
    case '1/8': gridDivision = 2; break;
    case '1/16': gridDivision = 4; break;
    case '1/32': gridDivision = 8; break;
    default: gridDivision = 2;
  }

  const gridSize = 1 / (beatsPerSecond * gridDivision);

  return notes.map(note => ({
    ...note,
    startTime: Math.round(note.startTime / gridSize) * gridSize,
    duration: Math.max(gridSize, Math.round(note.duration / gridSize) * gridSize),
  }));
}

const midiUtils = {
  midiToNoteName,
  noteNameToMidi,
  frequencyToMidi,
  midiToFrequency,
  createMIDI,
  downloadMIDIFromNotes,
  parseMIDI,
  createNote,
  quantizeNotes,
};

export default midiUtils;
