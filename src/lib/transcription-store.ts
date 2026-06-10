'use client';

/**
 * Transcription Store — persists transcription results to IndexedDB
 * TODO: migrate into workflowStore during Phase 2 refactoring
 */

import { get, set, del } from 'idb-keyval';

export interface PersistedNote {
  midi: number;
  pitch: number; // alias for midi, required by export-service
  name: string;
  octave: number;
  frequency: number;
  startTime: number;
  duration: number;
  velocity: number;
  confidence: number;
}

export interface PersistedTranscriptionResult {
  id: string;
  fileName: string;
  fileSize: number;
  duration: number;
  sampleRate: number;
  notes: PersistedNote[];
  timestamp: number;
  tempo?: number;
  [key: string]: unknown;
}

const KEY = 'streamlit-transcription-results';

export async function loadTranscriptionResults(): Promise<PersistedTranscriptionResult[]> {
  return (await get(KEY)) || [];
}

export async function saveTranscriptionResults(results: unknown[]): Promise<void> {
  await set(KEY, results);
}

export async function clearTranscriptionResults(): Promise<void> {
  await del(KEY);
}
