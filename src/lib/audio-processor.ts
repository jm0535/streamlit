/**
 * Audio Processing Library
 * Main interface for audio-to-MIDI transcription with enhanced options
 */

import { Note, AnalysisMetadata } from './midi-utils';
import {
  AudioAnalysisResult,
  loadAndAnalyzeAudio,
  AudioProcessingOptions,
} from './audio-analysis';
import { createMIDI, downloadMIDIFromNotes } from './midi-utils';
import { downloadCSVFromNotes } from './csv-utils';

export interface ProcessedAudioFile {
  id: string;
  file: File;
  notes: Note[];
  analysis: AudioAnalysisResult;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  processedAt: string;
}

export interface ProcessingProgress {
  current: number;
  total: number;
  currentFile: string;
}

export type ProgressCallback = (progress: ProcessingProgress) => void;

/**
 * Process a single audio file with enhanced options
 */
export async function processAudioFile(
  file: File,
  options?: AudioProcessingOptions
): Promise<ProcessedAudioFile> {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    const analysis = await loadAndAnalyzeAudio(file, options);

    return {
      id,
      file,
      notes: analysis.notes,
      analysis,
      status: 'completed',
      processedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      id,
      file,
      notes: [],
      analysis: {
        notes: [],
        duration: 0,
        sampleRate: 44100,
        confidence: 0,
      },
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      processedAt: new Date().toISOString(),
    };
  }
}

/**
 * Process multiple audio files (batch) with enhanced options
 */
export async function processBatchAudioFiles(
  files: File[],
  options?: AudioProcessingOptions,
  onProgress?: ProgressCallback
): Promise<ProcessedAudioFile[]> {
  const results: ProcessedAudioFile[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Update progress
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: files.length,
        currentFile: file.name,
      });
    }

    const result = await processAudioFile(file, options);
    results.push(result);
  }

  // Final progress update
  if (onProgress) {
    onProgress({
      current: files.length,
      total: files.length,
      currentFile: 'Complete',
    });
  }

  return results;
}

/**
 * Export processed audio file as MIDI with enhanced metadata
 */
export function exportAsMIDI(
  processed: ProcessedAudioFile,
  metadata?: Partial<AnalysisMetadata>
): void {
  const enhancedMetadata: AnalysisMetadata = {
    ...metadata,
    filename: processed.file.name,
    processedAt: processed.processedAt,
    detectedTempo: processed.analysis.detectedTempo,
    detectedTimeSignature: processed.analysis.detectedTimeSignature,
  };
  downloadMIDIFromNotes(processed.notes, processed.file.name.replace(/\.[^/.]+$/, '') + '_transcribed.mid');
}

/**
 * Export processed audio file as CSV with enhanced metadata
 */
export function exportAsCSV(
  processed: ProcessedAudioFile,
  metadata?: Partial<AnalysisMetadata>
): void {
  const enhancedMetadata: AnalysisMetadata = {
    ...metadata,
    filename: processed.file.name,
    processedAt: processed.processedAt,
    detectedTempo: processed.analysis.detectedTempo,
    detectedTimeSignature: processed.analysis.detectedTimeSignature,
  };
  downloadCSVFromNotes(processed.notes, processed.file.name.replace(/\.[^/.]+$/, '') + '_notes.csv', enhancedMetadata);
}

/**
 * Export multiple files as MIDI
 */
export function exportBatchAsMIDI(
  processedFiles: ProcessedAudioFile[],
  metadata?: Partial<AnalysisMetadata>
): void {
  processedFiles.forEach(processed => {
    if (processed.status === 'completed') {
      exportAsMIDI(processed, metadata);
    }
  });
}

/**
 * Export multiple files as CSV
 */
export function exportBatchAsCSV(
  processedFiles: ProcessedAudioFile[],
  metadata?: Partial<AnalysisMetadata>
): void {
  processedFiles.forEach(processed => {
    if (processed.status === 'completed') {
      exportAsCSV(processed, metadata);
    }
  });
}

/**
 * Get statistics from processed files with enhanced metrics
 */
export function getBatchStatistics(processedFiles: ProcessedAudioFile[]) {
  const completed = processedFiles.filter(p => p.status === 'completed');
  const errors = processedFiles.filter(p => p.status === 'error');

  return {
    total: processedFiles.length,
    completed: completed.length,
    errors: errors.length,
    totalNotes: completed.reduce((sum, p) => sum + p.notes.length, 0),
    avgConfidence: completed.length > 0
      ? completed.reduce((sum, p) => sum + p.analysis.confidence, 0) / completed.length
      : 0,
    totalDuration: completed.reduce((sum, p) => sum + p.analysis.duration, 0),
    avgDuration: completed.length > 0
      ? completed.reduce((sum, p) => sum + p.analysis.duration, 0) / completed.length
      : 0,
    detectedTempos: completed
      .filter(p => p.analysis.detectedTempo)
      .map(p => p.analysis.detectedTempo),
  };
}
