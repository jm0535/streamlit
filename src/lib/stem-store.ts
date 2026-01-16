import { get, set, del } from 'idb-keyval';

// Separate store for heavy blob data that shouldn't go through JSON serialization

export interface PersistedStemTrack {
  id: string;
  name: string;
  instrument: string;
  // Icon is UI only, re-attach on load
  color: string;
  muted: boolean;
  solo: boolean;
  volume: number;
  frequencyRange: [number, number];
  blob: Blob;
  isProcessing: boolean;
  confidence: number;
}

export interface PersistedSeparationResult {
  id: string;
  fileName: string;
  originalDuration: number;
  stems: PersistedStemTrack[];
  processingTime: number;
  overallConfidence: number;
  detectedInstruments: string[];
  timestamp: number;
}

const STEM_RESULTS_KEY = 'stem-separation-results';

// Helper to sanitize data (remove React components/symbols and non-persistable data)
const sanitizeStem = (stem: any): PersistedStemTrack => ({
  id: stem.id,
  name: stem.name,
  instrument: stem.instrument,
  color: stem.color,
  muted: stem.muted,
  solo: stem.solo,
  volume: stem.volume,
  frequencyRange: stem.frequencyRange,
  blob: stem.blob,
  isProcessing: stem.isProcessing,
  confidence: stem.confidence
});

const sanitizeResult = (result: any): PersistedSeparationResult => ({
  id: result.id,
  fileName: result.fileName,
  originalDuration: result.originalDuration,
  stems: result.stems.map(sanitizeStem),
  processingTime: result.processingTime,
  overallConfidence: result.overallConfidence,
  detectedInstruments: result.detectedInstruments,
  timestamp: result.timestamp || Date.now()
});

// Accept any[] since we sanitize internally - allows SeparationResult[] or PersistedSeparationResult[]
export const saveStemResults = async (results: any[]): Promise<void> => {
  try {
    // Sanitize to ensure no React components (icons) or AudioBuffers are passed to IDB
    const cleanData = results.map(sanitizeResult);
    await set(STEM_RESULTS_KEY, cleanData);
    console.log('Stem results saved to IDB', cleanData.length);
  } catch (err) {
    console.error('Failed to save stem results', err);
  }
};

export const loadStemResults = async (): Promise<PersistedSeparationResult[]> => {
  try {
    const data = await get(STEM_RESULTS_KEY);
    return data || [];
  } catch (err) {
    console.error('Failed to load stem results', err);
    return [];
  }
};

export const clearStemResults = async (): Promise<void> => {
  await del(STEM_RESULTS_KEY);
};
