/**
 * Music Export Utilities
 * Export transcription data in research-friendly formats:
 * - MusicXML (standard notation format for DAWs and notation software)
 * - JSON (with full metadata for programmatic analysis)
 */

import { Note } from './midi-utils';
import { Metadata } from '@/components/metadata-form';

// MIDI note names for conversion
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function midiToNoteName(midi: number): { step: string; alter: number; octave: number } {
  const noteIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  const noteName = NOTE_NAMES[noteIndex];

  // MusicXML uses step (C-G) and alter (-1, 0, 1) for accidentals
  const isSharp = noteName.includes('#');
  const step = isSharp ? noteName[0] : noteName;
  const alter = isSharp ? 1 : 0;

  return { step, alter, octave };
}

function durationToMusicXMLType(durationSeconds: number, tempo: number = 120): string {
  // Convert duration to beats
  const beatsPerSecond = tempo / 60;
  const beats = durationSeconds * beatsPerSecond;

  // Map to note types
  if (beats >= 4) return 'whole';
  if (beats >= 2) return 'half';
  if (beats >= 1) return 'quarter';
  if (beats >= 0.5) return 'eighth';
  if (beats >= 0.25) return '16th';
  if (beats >= 0.125) return '32nd';
  return '64th';
}

function durationToDivisions(durationSeconds: number, tempo: number = 120, divisionsPerQuarter: number = 24): number {
  const beatsPerSecond = tempo / 60;
  const beats = durationSeconds * beatsPerSecond;
  return Math.round(beats * divisionsPerQuarter);
}

export interface ExportOptions {
  title?: string;
  composer?: string;
  tempo?: number;
  metadata?: Metadata;
  includeAnalysis?: boolean;
}

export interface AnalysisData {
  pitchHistogram: Record<string, number>;
  detectedScale: string;
  tonalCenter: string;
  noteCount: number;
  durationTotal: number;
  pitchRange: { min: number; max: number };
}

/**
 * Analyze notes to extract research-relevant data
 */
export function analyzeNotes(notes: Note[]): AnalysisData {
  if (notes.length === 0) {
    return {
      pitchHistogram: {},
      detectedScale: 'Unknown',
      tonalCenter: 'Unknown',
      noteCount: 0,
      durationTotal: 0,
      pitchRange: { min: 0, max: 0 },
    };
  }

  // Build pitch histogram (count occurrences of each pitch class)
  const pitchHistogram: Record<string, number> = {};
  const pitchClassCounts: number[] = Array(12).fill(0);

  let totalDuration = 0;
  let minMidi = Infinity;
  let maxMidi = -Infinity;

  for (const note of notes) {
    const pitchClass = note.midi % 12;
    const noteName = NOTE_NAMES[pitchClass];

    pitchHistogram[noteName] = (pitchHistogram[noteName] || 0) + 1;
    pitchClassCounts[pitchClass]++;

    totalDuration += note.duration;
    minMidi = Math.min(minMidi, note.midi);
    maxMidi = Math.max(maxMidi, note.midi);
  }

  // Find tonal center (most common pitch class)
  let maxCount = 0;
  let tonalCenterIndex = 0;
  for (let i = 0; i < 12; i++) {
    if (pitchClassCounts[i] > maxCount) {
      maxCount = pitchClassCounts[i];
      tonalCenterIndex = i;
    }
  }
  const tonalCenter = NOTE_NAMES[tonalCenterIndex];

  // Detect scale based on pitch classes present
  const detectedScale = detectScale(pitchClassCounts, tonalCenterIndex);

  return {
    pitchHistogram,
    detectedScale,
    tonalCenter,
    noteCount: notes.length,
    durationTotal: totalDuration,
    pitchRange: { min: minMidi, max: maxMidi },
  };
}

/**
 * Detect musical scale from pitch class distribution
 */
function detectScale(pitchClassCounts: number[], root: number): string {
  // Normalize to root = 0
  const normalized: number[] = [];
  for (let i = 0; i < 12; i++) {
    normalized.push(pitchClassCounts[(i + root) % 12]);
  }

  // Check for common scales (intervals from root)
  const majorIntervals = [0, 2, 4, 5, 7, 9, 11]; // Major scale
  const minorIntervals = [0, 2, 3, 5, 7, 8, 10]; // Natural minor
  const pentatonicMajorIntervals = [0, 2, 4, 7, 9]; // Pentatonic major
  const pentatonicMinorIntervals = [0, 3, 5, 7, 10]; // Pentatonic minor
  const bluesIntervals = [0, 3, 5, 6, 7, 10]; // Blues scale
  const dorianIntervals = [0, 2, 3, 5, 7, 9, 10]; // Dorian mode
  const phrygianIntervals = [0, 1, 3, 5, 7, 8, 10]; // Phrygian mode

  const scales = [
    { name: 'Major', intervals: majorIntervals },
    { name: 'Minor (Natural)', intervals: minorIntervals },
    { name: 'Pentatonic Major', intervals: pentatonicMajorIntervals },
    { name: 'Pentatonic Minor', intervals: pentatonicMinorIntervals },
    { name: 'Blues', intervals: bluesIntervals },
    { name: 'Dorian', intervals: dorianIntervals },
    { name: 'Phrygian', intervals: phrygianIntervals },
  ];

  let bestMatch = 'Unknown';
  let bestScore = 0;

  for (const scale of scales) {
    let inScaleCount = 0;
    let outOfScaleCount = 0;

    for (let i = 0; i < 12; i++) {
      if (normalized[i] > 0) {
        if (scale.intervals.includes(i)) {
          inScaleCount += normalized[i];
        } else {
          outOfScaleCount += normalized[i];
        }
      }
    }

    const score = inScaleCount / (inScaleCount + outOfScaleCount + 0.001);
    if (score > bestScore && score > 0.7) { // At least 70% match
      bestScore = score;
      bestMatch = scale.name;
    }
  }

  return `${NOTE_NAMES[(pitchClassCounts.indexOf(Math.max(...pitchClassCounts)))]} ${bestMatch}`;
}

/**
 * Export notes to MusicXML format
 */
export function exportToMusicXML(notes: Note[], options: ExportOptions = {}): string {
  const {
    title = 'Untitled',
    composer = 'Unknown',
    tempo = 120,
    metadata,
  } = options;

  const divisionsPerQuarter = 24;
  const sortedNotes = [...notes].sort((a, b) => a.startTime - b.startTime);

  // Build measures
  const beatsPerMeasure = 4;
  const beatsPerSecond = tempo / 60;

  let measureNotes: { note: Note; measure: number; beat: number }[] = [];

  for (const note of sortedNotes) {
    const beat = note.startTime * beatsPerSecond;
    const measure = Math.floor(beat / beatsPerMeasure) + 1;
    const beatInMeasure = beat % beatsPerMeasure;
    measureNotes.push({ note, measure, beat: beatInMeasure });
  }

  const maxMeasure = Math.max(...measureNotes.map(n => n.measure), 1);

  // Build MusicXML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work>
    <work-title>${escapeXml(title)}</work-title>
  </work>
  <identification>
    <creator type="composer">${escapeXml(composer)}</creator>
    <encoding>
      <software>Streamlit Audio Research Platform</software>
      <encoding-date>${new Date().toISOString().split('T')[0]}</encoding-date>
    </encoding>
`;

  // Add research metadata as misc fields
  if (metadata) {
    xml += `    <miscellaneous>
`;
    if (metadata.songName) xml += `      <miscellaneous-field name="song-name">${escapeXml(metadata.songName)}</miscellaneous-field>\n`;
    if (metadata.province) xml += `      <miscellaneous-field name="region">${escapeXml(metadata.province)}</miscellaneous-field>\n`;
    if (metadata.decade) xml += `      <miscellaneous-field name="decade">${escapeXml(metadata.decade)}</miscellaneous-field>\n`;
    if (metadata.genre) xml += `      <miscellaneous-field name="genre">${escapeXml(metadata.genre)}</miscellaneous-field>\n`;
    if (metadata.cultureGroup) xml += `      <miscellaneous-field name="culture-group">${escapeXml(metadata.cultureGroup)}</miscellaneous-field>\n`;
    if (metadata.researcher) xml += `      <miscellaneous-field name="researcher">${escapeXml(metadata.researcher)}</miscellaneous-field>\n`;
    xml += `    </miscellaneous>
`;
  }

  xml += `  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Transcription</part-name>
    </score-part>
  </part-list>
  <part id="P1">
`;

  // Generate measures
  for (let m = 1; m <= maxMeasure; m++) {
    xml += `    <measure number="${m}">
`;

    // Add attributes to first measure
    if (m === 1) {
      xml += `      <attributes>
        <divisions>${divisionsPerQuarter}</divisions>
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>${beatsPerMeasure}</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <direction placement="above">
        <direction-type>
          <metronome>
            <beat-unit>quarter</beat-unit>
            <per-minute>${tempo}</per-minute>
          </metronome>
        </direction-type>
      </direction>
`;
    }

    // Add notes for this measure
    const measureContent = measureNotes.filter(n => n.measure === m);

    if (measureContent.length === 0) {
      // Add whole rest
      xml += `      <note>
        <rest/>
        <duration>${divisionsPerQuarter * beatsPerMeasure}</duration>
        <type>whole</type>
      </note>
`;
    } else {
      for (const { note } of measureContent) {
        const { step, alter, octave } = midiToNoteName(note.midi);
        const duration = durationToDivisions(note.duration, tempo, divisionsPerQuarter);
        const type = durationToMusicXMLType(note.duration, tempo);

        xml += `      <note>
        <pitch>
          <step>${step}</step>
${alter !== 0 ? `          <alter>${alter}</alter>\n` : ''}          <octave>${octave}</octave>
        </pitch>
        <duration>${duration}</duration>
        <type>${type}</type>
      </note>
`;
      }
    }

    xml += `    </measure>
`;
  }

  xml += `  </part>
</score-partwise>`;

  return xml;
}

/**
 * Export notes to JSON with full metadata
 */
export function exportToJSON(notes: Note[], options: ExportOptions = {}): string {
  const {
    title = 'Untitled',
    composer = 'Unknown',
    tempo = 120,
    metadata,
    includeAnalysis = true,
  } = options;

  const analysis = includeAnalysis ? analyzeNotes(notes) : null;

  const exportData = {
    exportInfo: {
      format: 'Streamlit Research Export',
      version: '1.0',
      exportDate: new Date().toISOString(),
      generator: 'Streamlit Audio Research Platform',
    },
    metadata: {
      title,
      composer,
      tempo,
      ...metadata,
    },
    analysis: analysis ? {
      noteCount: analysis.noteCount,
      totalDuration: analysis.durationTotal,
      pitchRange: {
        lowest: analysis.pitchRange.min,
        highest: analysis.pitchRange.max,
      },
      tonalCenter: analysis.tonalCenter,
      detectedScale: analysis.detectedScale,
      pitchHistogram: analysis.pitchHistogram,
    } : null,
    notes: notes.map(note => ({
      midi: note.midi,
      name: note.name,
      octave: note.octave,
      frequency: note.frequency,
      startTime: note.startTime,
      duration: note.duration,
      velocity: note.velocity,
      confidence: note.confidence,
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download MusicXML file
 */
export function downloadMusicXML(notes: Note[], filename: string = 'transcription.musicxml', options: ExportOptions = {}): void {
  const xml = exportToMusicXML(notes, options);
  const blob = new Blob([xml], { type: 'application/vnd.recordare.musicxml+xml' });
  downloadBlob(blob, filename);
}

/**
 * Download JSON file
 */
export function downloadJSON(notes: Note[], filename: string = 'transcription.json', options: ExportOptions = {}): void {
  const json = exportToJSON(notes, options);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default {
  exportToMusicXML,
  exportToJSON,
  downloadMusicXML,
  downloadJSON,
  analyzeNotes,
};
