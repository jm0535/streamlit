/**
 * Shared File Store
 *
 * Persists uploaded files across page navigation using Zustand.
 * Files uploaded on Dashboard are automatically available on Transcription page.
 */

import { create } from 'zustand';

interface FileStoreState {
  // Pending files for transcription
  pendingFiles: File[];
  setPendingFiles: (files: File[]) => void;
  clearPendingFiles: () => void;

  // Processing state
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;

  // Results (can be expanded later)
  lastProcessedFileName: string | null;
  setLastProcessedFileName: (name: string | null) => void;
}

export const useFileStore = create<FileStoreState>((set) => ({
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
}));

// Helper to check if there are pending files
export const hasPendingFiles = () => useFileStore.getState().pendingFiles.length > 0;

// Helper to get pending files count
export const getPendingFilesCount = () => useFileStore.getState().pendingFiles.length;
