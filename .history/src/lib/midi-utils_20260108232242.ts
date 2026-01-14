/**
 * MIDI Generation Utilities
 * Creates MIDI files from analyzed note data
 */

import MIDIWriter from 'midi-writer-js';

export interface Note {
  midi: number;
  startTime: number;
  duration: number;
  velocity: number;
  pitchName: string;
  frequency: number;
}

export interface AnalysisMetadata {
  filename?: string;
  songName?: string;
  province?: string;
  decade?: string;
  genre?: string;
  cultureGroup?: string;
  researcher?: string;
  processedAt: string;
  detectedTempo?: number;
  detectedTimeSignature?: string;
}

/**
 * Create MIDI file from notes
 */
export function createMIDI(notes: Note[], metadata?: Partial<AnalysisMetadata>): Uint8Array {
  const track = new MIDIWriter.Track();

  // Set tempo (default 120 BPM)
  track.addEvent(new MIDIWriter.ProgramChangeEvent({ instrument: 1 }));

  // Add notes to track
  notes.forEach(note => {
    track.addEvent(new MIDIWriter.NoteOnEvent({
      pitch: note.midi,
      velocity: note.velocity,
      tick: Math.floor(note.startTime * 128), // Convert seconds to ticks (approximate)
    }));

    track.addEvent(new MIDIWriter.NoteOffEvent({
      pitch: note.midi,
      velocity: note.velocity,
      tick: Math.floor((note.startTime + note.duration) * 128),
    }));
  });

  const writer = new MIDIWriter.Writer([track]);
  const midiBuffer = writer.buildFile();

  return midiBuffer;
}

/**
 * Download MIDI file
 */
export function downloadMIDI(midiData: Uint8Array, filename: string): void {
  const blob = new Blob([midiData], { type: 'audio/midi' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Create and download MIDI file directly
 */
export function downloadMIDIFromNotes(
  notes: Note[],
  filename: string,
  metadata?: Partial<AnalysisMetadata>
): void {
  const midiData = createMIDI(notes, metadata);
  downloadMIDI(midiData, filename);
}
