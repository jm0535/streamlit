/**
 * CSV Export Utilities
 * Handles exporting note data to CSV format
 */

import { Note, AnalysisMetadata } from './midi-utils';

export interface NoteWithMetadata extends Note {
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
 * Add metadata to notes for CSV export
 */
export function addMetadataToNotes(
  notes: Note[],
  metadata: Partial<AnalysisMetadata>
): NoteWithMetadata[] {
  return notes.map(note => ({
    ...note,
    filename: metadata.filename,
    songName: metadata.songName,
    province: metadata.province,
    decade: metadata.decade,
    genre: metadata.genre,
    cultureGroup: metadata.cultureGroup,
    researcher: metadata.researcher,
    processedAt: metadata.processedAt || new Date().toISOString(),
    detectedTempo: metadata.detectedTempo,
    detectedTimeSignature: metadata.detectedTimeSignature,
  }));
}

/**
 * Convert notes to CSV string
 */
export function notesToCSV(notes: NoteWithMetadata[]): string {
  if (notes.length === 0) return '';

  // Define column headers
  const headers = [
    'filename',
    'songName',
    'pitchName',
    'midiPitch',
    'frequency',
    'duration',
    'startTime',
    'velocity',
    'octave',
    'pitchClass',
    'province',
    'decade',
    'genre',
    'cultureGroup',
    'researcher',
    'processedAt',
    'detectedTempo',
    'detectedTimeSignature',
  ];

  // Convert notes to rows
  const rows = notes.map(note => {
    const octave = Math.floor(note.midi / 12) - 1;
    const pitchClass = note.midi % 12; // 0-11 for C-B

    return [
      note.filename || '',
      note.songName || '',
      note.pitchName,
      note.midi.toString(),
      note.frequency.toFixed(2),
      note.duration.toFixed(3),
      note.startTime.toFixed(3),
      note.velocity.toString(),
      octave.toString(),
      pitchClass.toString(),
      note.province || '',
      note.decade || '',
      note.genre || '',
      note.cultureGroup || '',
      note.researcher || '',
      note.processedAt,
      (note.detectedTempo || '').toString(),
      note.detectedTimeSignature || '',
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Download notes as CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
 * Create and download CSV file from notes
 */
export function downloadCSVFromNotes(
  notes: Note[],
  filename: string,
  metadata?: Partial<AnalysisMetadata>
): void {
  const notesWithMetadata = addMetadataToNotes(notes, metadata || {});
  const csvContent = notesToCSV(notesWithMetadata);
  downloadCSV(csvContent, filename);
}
