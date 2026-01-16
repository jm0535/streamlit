/**
 * Shared File Store
 *
 * Persists uploaded files and transcription results across page navigation.
 * Files uploaded on Dashboard are automatically available on Transcription/Batch Processing pages.
 * Notes from transcription can be sent to Piano Roll.
 */

import { create } from 'zustand';

// Simple note type for sharing between pages
export interface SharedNote {
  midi: number;
  name: string;
  octave: number;
  frequency: number;
  startTime: number;
  duration: number;
  velocity: number;
  confidence: number;
}

interface FileStoreState {
  // Pending files for transcription
  pendingFiles: File[];
  setPendingFiles: (files: File[]) => void;
  clearPendingFiles: () => void;

  // Processing state
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;

  // Last processed file name
  lastProcessedFileName: string | null;
  setLastProcessedFileName: (name: string | null) => void;

  // Notes to send to Piano Roll
  pianoRollNotes: SharedNote[];
  setPianoRollNotes: (notes: SharedNote[]) => void;
  clearPianoRollNotes: () => void;
  hasPendingPianoRollNotes: boolean;
}

export const useFileStore = create<FileStoreState>((set, get) => ({
  // Files
  pendingFiles: [],
  setPendingFiles: (files) => set({ pendingFiles: files }),
  clearPendingFiles: () => set({ pendingFiles: [] }),

  // Processing
  isProcessing: false,
  setIsProcessing: (processing) => set({ isProcessing: processing }),

  // Results
  lastProcessedFileName: null,
  setLastProcessedFileName: (name) => set({ lastProcessedFileName: name }),

  // Piano Roll notes
  pianoRollNotes: [],
  setPianoRollNotes: (notes) => set({ pianoRollNotes: notes, hasPendingPianoRollNotes: notes.length > 0 }),
  clearPianoRollNotes: () => set({ pianoRollNotes: [], hasPendingPianoRollNotes: false }),
  hasPendingPianoRollNotes: false,
}));

// Helper to check if there are pending files
export const hasPendingFiles = () => useFileStore.getState().pendingFiles.length > 0;

// Helper to get pending files count
export const getPendingFilesCount = () => useFileStore.getState().pendingFiles.length;

// Helper to convert simple transcription notes to SharedNote format
export function convertToSharedNotes(notes: Array<{ pitch: number; startTime: number; duration: number; velocity: number; confidence?: number }>): SharedNote[] {
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  return notes.map(note => {
    const midi = note.pitch;
    const octave = Math.floor(midi / 12) - 1;
    const noteName = NOTE_NAMES[midi % 12];
    const frequency = 440 * Math.pow(2, (midi - 69) / 12);

    return {
      midi,
      name: `${noteName}${octave}`,
      octave,
      frequency,
      startTime: note.startTime,
      duration: note.duration,
      velocity: note.velocity,
      confidence: note.confidence ?? 1,
    };
  });
}
