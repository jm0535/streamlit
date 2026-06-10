'use client';

/**
 * Stem Store — persists separation results to IndexedDB
 * TODO: migrate into workflowStore during Phase 2 refactoring
 */

import { get, set, del } from 'idb-keyval';

export interface PersistedStem {
  name?: string;
  instrument: string;
  url: string;
  blob?: Blob;
  duration?: number;
  [key: string]: unknown;
}

export interface PersistedSeparationResult {
  id: string;
  fileName: string;
  fileSize?: number;
  timestamp?: number;
  stems: PersistedStem[];
  [key: string]: unknown;
}

const KEY = 'streamlit-stem-results';

export async function loadStemResults(): Promise<PersistedSeparationResult[]> {
  return (await get(KEY)) || [];
}

export async function saveStemResults(results: unknown[]): Promise<void> {
  await set(KEY, results);
}

export async function clearStemResults(): Promise<void> {
  await del(KEY);
}
