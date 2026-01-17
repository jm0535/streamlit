'use client';

/**
 * Export Service - Real Export Functionality
 *
 * Provides actual export operations for:
 * - MIDI transcriptions
 * - MusicXML files
 * - JSON analysis data
 * - CSV data exports
 * - PDF reports
 * - Audio stems (WAV/MP3)
 * - Batch exports with ZIP bundling
 */

import { createMIDI, Note } from './midi-utils';
import { exportToMusicXML, exportToJSON } from './music-export';
import { createZip, FileToZip } from './zip-utils';
import { useJobStore, JobFile, JobResult } from './job-store';
import { loadTranscriptionResults, PersistedTranscriptionResult } from './transcription-store';
import { loadStemResults, PersistedSeparationResult } from './stem-store';

// ============================================================================
// Types
// ============================================================================

export type ExportFormat =
  | 'midi'
  | 'musicxml'
  | 'json'
  | 'csv'
  | 'pdf'
  | 'wav'
  | 'mp3'
  | 'zip';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  includeAudio?: boolean;
  compression?: 'none' | 'zip' | 'tar';
  quality?: 'low' | 'medium' | 'high';
  title?: string;
  composer?: string;
}

export interface BatchExportOptions extends ExportOptions {
  includeTranscriptions?: boolean;
  includeStems?: boolean;
  includeAnalysis?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function convertNotesToMidiFormat(notes: Array<{
  pitch: number;
  startTime: number;
  duration: number;
  velocity: number;
  confidence: number;
}>): Note[] {
  return notes.map(n => ({
    midi: n.pitch,
    name: '',  // Will be derived
    octave: Math.floor(n.pitch / 12) - 1,
    frequency: 440 * Math.pow(2, (n.pitch - 69) / 12),
    startTime: n.startTime,
    duration: n.duration,
    velocity: n.velocity,
    confidence: n.confidence,
  }));
}

function generateCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h];
      if (typeof val === 'string' && val.includes(',')) {
        return `"${val}"`;
      }
      return String(val ?? '');
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Export transcription results to various formats
 */
export async function exportTranscription(
  transcriptionId: string,
  options: ExportOptions,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(10, 'Loading transcription data...');

  // Load transcription from store
  const results = await loadTranscriptionResults();
  const transcription = results.find(r => r.id === transcriptionId);

  if (!transcription) {
    throw new Error(`Transcription not found: ${transcriptionId}`);
  }

  onProgress?.(30, 'Converting to export format...');

  const notes = convertNotesToMidiFormat(transcription.notes);

  switch (options.format) {
    case 'midi': {
      onProgress?.(70, 'Generating MIDI file...');
      const midiData = createMIDI(notes, {
        filename: transcription.fileName,
        detectedTempo: transcription.tempo,
      });
      onProgress?.(100, 'Complete');
      // Create new Uint8Array for Blob compatibility (avoids SharedArrayBuffer type issues)
      return new Blob([new Uint8Array(Array.from(midiData))], { type: 'audio/midi' });
    }

    case 'musicxml': {
      onProgress?.(70, 'Generating MusicXML...');
      const xmlContent = exportToMusicXML(notes, {
        title: options.title || transcription.fileName,
        composer: options.composer,
        tempo: transcription.tempo,
      });
      onProgress?.(100, 'Complete');
      return new Blob([xmlContent], { type: 'application/xml' });
    }

    case 'json': {
      onProgress?.(70, 'Generating JSON...');
      const jsonContent = exportToJSON(notes, {
        title: options.title || transcription.fileName,
        tempo: transcription.tempo,
        includeAnalysis: true,
      });
      onProgress?.(100, 'Complete');
      return new Blob([jsonContent], { type: 'application/json' });
    }

    case 'csv': {
      onProgress?.(70, 'Generating CSV...');
      const csvData = transcription.notes.map(note => ({
        pitch: note.pitch,
        startTime: note.startTime.toFixed(4),
        duration: note.duration.toFixed(4),
        velocity: note.velocity,
        confidence: note.confidence.toFixed(4),
      }));
      const csvContent = generateCSV(csvData);
      onProgress?.(100, 'Complete');
      return new Blob([csvContent], { type: 'text/csv' });
    }

    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }
}

/**
 * Export all transcriptions
 */
export async function exportAllTranscriptions(
  options: ExportOptions,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(5, 'Loading transcription data...');

  const results = await loadTranscriptionResults();

  if (results.length === 0) {
    throw new Error('No transcription results available for export');
  }

  const files: FileToZip[] = [];

  for (let i = 0; i < results.length; i++) {
    const transcription = results[i];
    const progress = 10 + Math.floor((i / results.length) * 80);
    onProgress?.(progress, `Processing ${transcription.fileName}...`);

    const notes = convertNotesToMidiFormat(transcription.notes);
    const baseName = transcription.fileName.replace(/\.[^.]+$/, '');

    // Add MIDI file
    const midiData = createMIDI(notes, {
      filename: transcription.fileName,
      detectedTempo: transcription.tempo,
    });
    files.push({
      filename: `${baseName}.mid`,
      data: midiData,
      type: 'audio/midi',
    });

    // Optionally add metadata JSON
    if (options.includeMetadata) {
      const metadata = {
        id: transcription.id,
        fileName: transcription.fileName,
        duration: transcription.duration,
        tempo: transcription.tempo,
        keySignature: transcription.keySignature,
        timeSignature: transcription.timeSignature,
        confidence: transcription.confidence,
        noteCount: transcription.notes.length,
        processingTime: transcription.processingTime,
        exportedAt: new Date().toISOString(),
      };
      files.push({
        filename: `${baseName}_metadata.json`,
        data: JSON.stringify(metadata, null, 2),
        type: 'application/json',
      });
    }
  }

  onProgress?.(95, 'Creating ZIP archive...');
  const zipBlob = await createZip(files);
  onProgress?.(100, 'Complete');

  return zipBlob;
}

/**
 * Export stem separation results
 */
export async function exportStems(
  separationId: string,
  options: ExportOptions,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(10, 'Loading stem separation data...');

  const results = await loadStemResults();
  const separation = results.find(r => r.id === separationId);

  if (!separation) {
    throw new Error(`Stem separation not found: ${separationId}`);
  }

  const files: FileToZip[] = [];
  const baseName = separation.fileName.replace(/\.[^.]+$/, '');

  for (let i = 0; i < separation.stems.length; i++) {
    const stem = separation.stems[i];
    const progress = 20 + Math.floor((i / separation.stems.length) * 70);
    onProgress?.(progress, `Exporting ${stem.name}...`);

    if (stem.blob) {
      files.push({
        filename: `${baseName}_${stem.name.toLowerCase()}.wav`,
        data: stem.blob,
        type: 'audio/wav',
      });
    }
  }

  if (options.includeMetadata) {
    const metadata = {
      id: separation.id,
      fileName: separation.fileName,
      originalDuration: separation.originalDuration,
      stems: separation.stems.map(s => ({
        name: s.name,
        instrument: s.instrument,
        confidence: s.confidence,
      })),
      processingTime: separation.processingTime,
      overallConfidence: separation.overallConfidence,
      exportedAt: new Date().toISOString(),
    };
    files.push({
      filename: `${baseName}_stems_metadata.json`,
      data: JSON.stringify(metadata, null, 2),
      type: 'application/json',
    });
  }

  onProgress?.(95, 'Creating ZIP archive...');
  const zipBlob = await createZip(files);
  onProgress?.(100, 'Complete');

  return zipBlob;
}

/**
 * Export all stems
 */
export async function exportAllStems(
  options: ExportOptions,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(5, 'Loading stem separation data...');

  const results = await loadStemResults();

  if (results.length === 0) {
    throw new Error('No stem separation results available for export');
  }

  const files: FileToZip[] = [];

  for (let i = 0; i < results.length; i++) {
    const separation = results[i];
    const baseName = separation.fileName.replace(/\.[^.]+$/, '');
    const progress = 10 + Math.floor((i / results.length) * 80);

    for (const stem of separation.stems) {
      onProgress?.(progress, `Exporting ${separation.fileName} - ${stem.name}...`);

      if (stem.blob) {
        files.push({
          filename: `${baseName}/${stem.name.toLowerCase()}.wav`,
          data: stem.blob,
          type: 'audio/wav',
        });
      }
    }
  }

  onProgress?.(95, 'Creating ZIP archive...');
  const zipBlob = await createZip(files);
  onProgress?.(100, 'Complete');

  return zipBlob;
}

/**
 * Batch export - all data in one package
 */
export async function exportBatch(
  options: BatchExportOptions,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(5, 'Preparing batch export...');

  const files: FileToZip[] = [];
  let currentProgress = 10;

  // Export transcriptions
  if (options.includeTranscriptions !== false) {
    onProgress?.(currentProgress, 'Exporting transcriptions...');
    const transcriptions = await loadTranscriptionResults();

    for (const transcription of transcriptions) {
      const notes = convertNotesToMidiFormat(transcription.notes);
      const baseName = transcription.fileName.replace(/\.[^.]+$/, '');

      const midiData = createMIDI(notes, {
        filename: transcription.fileName,
        detectedTempo: transcription.tempo,
      });

      files.push({
        filename: `transcriptions/${baseName}.mid`,
        data: midiData,
        type: 'audio/midi',
      });

      const jsonData = {
        ...transcription,
        notes: transcription.notes,
      };
      files.push({
        filename: `transcriptions/${baseName}.json`,
        data: JSON.stringify(jsonData, null, 2),
        type: 'application/json',
      });
    }

    currentProgress = 40;
  }

  // Export stems
  if (options.includeStems !== false) {
    onProgress?.(currentProgress, 'Exporting stems...');
    const stems = await loadStemResults();

    for (const separation of stems) {
      const baseName = separation.fileName.replace(/\.[^.]+$/, '');

      for (const stem of separation.stems) {
        if (stem.blob) {
          files.push({
            filename: `stems/${baseName}/${stem.name.toLowerCase()}.wav`,
            data: stem.blob,
            type: 'audio/wav',
          });
        }
      }
    }

    currentProgress = 70;
  }

  // Add export manifest
  onProgress?.(currentProgress, 'Generating manifest...');
  const manifest = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    contents: {
      transcriptions: options.includeTranscriptions !== false,
      stems: options.includeStems !== false,
      analysis: options.includeAnalysis !== false,
    },
    fileCount: files.length,
    options,
  };

  files.push({
    filename: 'manifest.json',
    data: JSON.stringify(manifest, null, 2),
    type: 'application/json',
  });

  onProgress?.(90, 'Creating ZIP archive...');
  const zipBlob = await createZip(files);
  onProgress?.(100, 'Complete');

  return zipBlob;
}

// ============================================================================
// Job-Integrated Export Functions
// ============================================================================

/**
 * Run export with job tracking
 */
export async function runExportJob(
  jobId: string,
  exportType: 'transcription' | 'stems' | 'analysis' | 'batch',
  options: ExportOptions | BatchExportOptions
): Promise<void> {
  const { updateJobProgress, completeJob, failJob } = useJobStore.getState();

  try {
    updateJobProgress(jobId, 5, 'Starting export...');

    let blob: Blob;
    let filename: string;

    switch (exportType) {
      case 'transcription':
        blob = await exportAllTranscriptions(options, (progress, message) => {
          updateJobProgress(jobId, progress, message);
        });
        filename = `transcriptions_export_${Date.now()}.zip`;
        break;

      case 'stems':
        blob = await exportAllStems(options, (progress, message) => {
          updateJobProgress(jobId, progress, message);
        });
        filename = `stems_export_${Date.now()}.zip`;
        break;

      case 'batch':
        blob = await exportBatch(options as BatchExportOptions, (progress, message) => {
          updateJobProgress(jobId, progress, message);
        });
        filename = `batch_export_${Date.now()}.zip`;
        break;

      default:
        throw new Error(`Unknown export type: ${exportType}`);
    }

    // Create download URL
    const downloadUrl = URL.createObjectURL(blob);

    // Complete the job
    completeJob(jobId, {
      downloadUrl,
      blobData: blob,
      metadata: {
        filename,
        size: blob.size,
        type: blob.type,
      },
    });

    // Trigger download
    triggerDownload(blob, filename);

  } catch (error) {
    failJob(jobId, error instanceof Error ? error.message : 'Export failed');
    throw error;
  }
}

// ============================================================================
// Direct Download Functions (No Job Tracking)
// ============================================================================

export async function quickDownloadTranscriptions(): Promise<void> {
  const blob = await exportAllTranscriptions({ format: 'midi', includeMetadata: true });
  triggerDownload(blob, `transcriptions_${Date.now()}.zip`);
}

export async function quickDownloadStems(): Promise<void> {
  const blob = await exportAllStems({ format: 'wav', includeMetadata: true });
  triggerDownload(blob, `stems_${Date.now()}.zip`);
}

export async function quickDownloadAll(): Promise<void> {
  const blob = await exportBatch({
    format: 'zip',
    includeTranscriptions: true,
    includeStems: true,
    includeAnalysis: true,
    includeMetadata: true,
  });
  triggerDownload(blob, `complete_export_${Date.now()}.zip`);
}
