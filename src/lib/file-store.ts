/**
 * Shared File Store
 *
 * Persists uploaded files and transcription results across page navigation.
 * Files uploaded on Dashboard are automatically available on ALL processing pages:
 * - Transcription
 * - Stem Separation
 * - Audio Analysis
 * - Batch Processing
 *
 * Notes from transcription can be sent to Note Editor.
 */

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

// IndexedDB storage adapter for Zustand
const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // console.log(name, 'has been retrieved');
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    // console.log(name, 'with value', value, 'has been saved');
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    // console.log(name, 'has been deleted');
    await del(name);
  },
};

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

// Audio file metadata for sharing (File objects can't be persisted)
export interface SharedAudioFile {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  // Audio data stored as base64 for persistence
  audioDataUrl?: string;
}

interface FileStoreState {
  // ===== Pending files for processing =====
  pendingFiles: File[];
  setPendingFiles: (files: File[]) => void;
  clearPendingFiles: () => void;

  // ===== Shared audio files across pages =====
  // These persist across page navigation
  sharedAudioFiles: SharedAudioFile[];
  setSharedAudioFiles: (files: SharedAudioFile[]) => void;
  addSharedAudioFile: (file: SharedAudioFile) => void;
  removeSharedAudioFile: (fileName: string) => void;
  clearSharedAudioFiles: () => void;

  // ===== Unified add action =====
  // Call this to upload files - handles both session state and persistence
  addFiles: (files: File[]) => Promise<void>;

  // ===== Actual File objects (session only, not persisted) =====
  activeFiles: File[];
  setActiveFiles: (files: File[]) => void;
  clearActiveFiles: () => void;

  // ===== Processing state =====
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;

  // ===== Last processed file name =====
  lastProcessedFileName: string | null;
  setLastProcessedFileName: (name: string | null) => void;

  // ===== Notes to send to Note Editor =====
  pianoRollNotes: SharedNote[];
  setPianoRollNotes: (notes: SharedNote[]) => void;
  clearPianoRollNotes: () => void;
  hasPendingPianoRollNotes: boolean;

  // ===== Transcription results for other pages =====
  hasTranscriptionResults: boolean;
  setHasTranscriptionResults: (has: boolean) => void;
}

export const useFileStore = create<FileStoreState>()(
  persist(
    (set, get) => ({
      // ===== Pending files (temporary, cleared after loading) =====
      pendingFiles: [],
      setPendingFiles: (files) => {
        set({ pendingFiles: files });
        // Also set as active files so they persist during navigation
        set({ activeFiles: files });
      },
      clearPendingFiles: () => set({ pendingFiles: [] }),

      // ===== Shared audio files (persisted metadata) =====
      sharedAudioFiles: [],
      setSharedAudioFiles: (files) => set({ sharedAudioFiles: files }),
      addSharedAudioFile: (file) => set((state) => ({
        sharedAudioFiles: [...state.sharedAudioFiles.filter(f => f.name !== file.name), file]
      })),
      removeSharedAudioFile: (fileName) => set((state) => ({
        sharedAudioFiles: state.sharedAudioFiles.filter(f => f.name !== fileName)
      })),
      clearSharedAudioFiles: () => set({ sharedAudioFiles: [] }),

      // ===== Unified add action implementation =====
      addFiles: async (files: File[]) => {
        // 1. Set immediate session state
        set({ pendingFiles: files, activeFiles: files });

        // 2. Process for persistence (async)
        // console.log('🔄 Persisting', files.length, 'files to storage...');
        try {
          const sharedFilesPromises = files.map(file => fileToSharedAudioFile(file));
          const sharedFiles = await Promise.all(sharedFilesPromises);

          set((state) => {
            // Merge with existing shared files, avoiding duplicates by name
            const newSharedFiles = [...state.sharedAudioFiles];
            sharedFiles.forEach(file => {
              const infoIndex = newSharedFiles.findIndex(f => f.name === file.name);
              if (infoIndex >= 0) {
                newSharedFiles[infoIndex] = file;
              } else {
                newSharedFiles.push(file);
              }
            });
            return { sharedAudioFiles: newSharedFiles };
          });
          // console.log('✅ Files persisted successfully');
        } catch (err) {
          console.error('❌ Failed to persist files:', err);
        }
      },

      // ===== Active File objects (session memory, not persisted) =====
      activeFiles: [],
      setActiveFiles: (files) => set({ activeFiles: files }),
      clearActiveFiles: () => set({ activeFiles: [] }),

      // ===== Processing state =====
      isProcessing: false,
      setIsProcessing: (processing) => set({ isProcessing: processing }),

      // ===== Results =====
      lastProcessedFileName: null,
      setLastProcessedFileName: (name) => set({ lastProcessedFileName: name }),

      // ===== Note Editor notes =====
      pianoRollNotes: [],
      setPianoRollNotes: (notes) => {
        // console.log('💾 SAVING notes to store:', notes.length);
        set({ pianoRollNotes: notes, hasPendingPianoRollNotes: notes.length > 0 });
      },
      clearPianoRollNotes: () => {
        set({ pianoRollNotes: [], hasPendingPianoRollNotes: false });
      },
      hasPendingPianoRollNotes: false,

      // ===== Transcription results tracking =====
      hasTranscriptionResults: false,
      setHasTranscriptionResults: (has) => set({ hasTranscriptionResults: has }),
    }),
    {
      name: 'file-store',
      storage: createJSONStorage(() => storage), // Use IndexedDB storage
      // Only persist these fields
      partialize: (state) => ({
        pianoRollNotes: state.pianoRollNotes,
        lastProcessedFileName: state.lastProcessedFileName,
        hasPendingPianoRollNotes: state.hasPendingPianoRollNotes,
        sharedAudioFiles: state.sharedAudioFiles, // Persist large audio files safely in IDB
        hasTranscriptionResults: state.hasTranscriptionResults,
      }),
    }
  )
);

/**
 * Convert File to SharedAudioFile with base64 data URL
 * This allows persisting audio data across page navigation
 */
export async function fileToSharedAudioFile(file: File): Promise<SharedAudioFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        audioDataUrl: reader.result as string,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert SharedAudioFile back to File object
 */
export async function sharedAudioFileToFile(sharedFile: SharedAudioFile): Promise<File | null> {
  if (!sharedFile.audioDataUrl) return null;

  try {
    const response = await fetch(sharedFile.audioDataUrl);
    const blob = await response.blob();
    return new File([blob], sharedFile.name, {
      type: sharedFile.type,
      lastModified: sharedFile.lastModified,
    });
  } catch (error) {
    console.error('Failed to convert shared audio file:', error);
    return null;
  }
}

// Helper function to convert notes to the format expected by Note Editor
export function convertToSharedNotes(notes: any[]): SharedNote[] {
  return notes.map(note => ({
    midi: note.midi || note.pitch || 60,
    name: note.name || note.pitchName || 'C4',
    octave: note.octave || Math.floor((note.midi || 60) / 12) - 1,
    frequency: note.frequency || 440 * Math.pow(2, ((note.midi || 60) - 69) / 12),
    startTime: note.startTime || 0,
    duration: note.duration || 0.25,
    velocity: note.velocity || 100,
    confidence: note.confidence || 1,
  }));
}
