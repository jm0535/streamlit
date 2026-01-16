import { get, set, del } from 'idb-keyval';

// Separate store for persisting transcription results

export interface PersistedTranscriptionNote {
  pitch: number; // Changed from midi to pitch to match Page
  startTime: number;
  duration: number;
  velocity: number;
  confidence: number;
}

export interface PersistedTranscriptionResult {
  id: string;
  fileName: string;
  duration: number;
  notes: PersistedTranscriptionNote[];
  midiData: string;
  confidence: number;
  detectedInstruments: string[];
  tempo: number;
  keySignature: string;
  timeSignature: string;
  processingTime: number;
  timestamp?: number;
}

const TRANSCRIPTION_RESULTS_KEY = 'transcription-results';

export const saveTranscriptionResults = async (results: PersistedTranscriptionResult[]): Promise<void> => {
  try {
    const dataToSave = results.map(r => ({ ...r, timestamp: r.timestamp || Date.now() }));
    await set(TRANSCRIPTION_RESULTS_KEY, dataToSave);
    console.log('Transcription results saved to IDB', results.length);
  } catch (err) {
    console.error('Failed to save transcription results', err);
  }
};

export const loadTranscriptionResults = async (): Promise<PersistedTranscriptionResult[]> => {
  try {
    const data = await get(TRANSCRIPTION_RESULTS_KEY);
    return data || [];
  } catch (err) {
    console.error('Failed to load transcription results', err);
    return [];
  }
};

export const clearTranscriptionResults = async (): Promise<void> => {
  await del(TRANSCRIPTION_RESULTS_KEY);
};
