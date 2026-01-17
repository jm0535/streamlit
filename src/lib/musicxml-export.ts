'use client';

/**
 * MusicXML Export Service
 *
 * Exports notes to MusicXML format for compatibility with:
 * - MuseScore
 * - Sibelius
 * - Finale
 * - Other music notation software
 */

import type { Note } from './midi-utils';

export interface MusicXMLExportOptions {
  title?: string;
  composer?: string;
  tempo?: number;
  timeSignature?: { beats: number; beatType: number };
  divisions?: number; // Divisions per quarter note (default: 4)
}

const DEFAULT_OPTIONS: MusicXMLExportOptions = {
  title: 'Untitled',
  composer: 'Streamlit Audio Research',
  tempo: 120,
  timeSignature: { beats: 4, beatType: 4 },
  divisions: 4,
};

// Note names for MusicXML
const PITCH_STEPS = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B'];
const PITCH_ALTERS = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]; // 0 = natural, 1 = sharp

/**
 * Convert MIDI note number to MusicXML pitch representation
 */
function midiToPitch(midiNote: number): { step: string; octave: number; alter: number } {
  const noteIndex = midiNote % 12;
  const octave = Math.floor(midiNote / 12) - 1;

  return {
    step: PITCH_STEPS[noteIndex],
    octave,
    alter: PITCH_ALTERS[noteIndex],
  };
}

/**
 * Convert duration in seconds to MusicXML duration units
 */
function secondsToDuration(
  seconds: number,
  tempo: number,
  divisions: number
): { duration: number; type: string; dots: number } {
  // Convert seconds to quarter notes
  const quarterNotes = (seconds * tempo) / 60;

  // Duration in divisions
  const duration = Math.round(quarterNotes * divisions);

  // Determine note type
  let type: string;
  let dots = 0;

  if (quarterNotes >= 4) {
    type = 'whole';
  } else if (quarterNotes >= 2) {
    type = 'half';
  } else if (quarterNotes >= 1) {
    type = 'quarter';
  } else if (quarterNotes >= 0.5) {
    type = 'eighth';
  } else if (quarterNotes >= 0.25) {
    type = '16th';
  } else {
    type = '32nd';
  }

  return { duration: Math.max(1, duration), type, dots };
}

/**
 * Generate MusicXML from notes array
 */
export function exportToMusicXML(
  notes: Note[],
  options: MusicXMLExportOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { title, composer, tempo, timeSignature, divisions } = opts;

  if (!notes || notes.length === 0) {
    throw new Error('No notes to export');
  }

  // Sort notes by start time
  const sortedNotes = [...notes].sort((a, b) => a.startTime - b.startTime);

  // Group notes into measures
  const beatsPerMeasure = timeSignature!.beats;
  const measureDuration = (beatsPerMeasure * 60) / tempo!; // Duration of one measure in seconds

  // Build XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work>
    <work-title>${escapeXml(title!)}</work-title>
  </work>
  <identification>
    <creator type="composer">${escapeXml(composer!)}</creator>
    <encoding>
      <software>Streamlit Audio Research Platform</software>
      <encoding-date>${new Date().toISOString().split('T')[0]}</encoding-date>
    </encoding>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Piano</part-name>
    </score-part>
  </part-list>
  <part id="P1">
`;

  // Generate measures
  let currentTime = 0;
  let measureNumber = 1;
  let noteIndex = 0;

  while (noteIndex < sortedNotes.length || measureNumber === 1) {
    const measureStart = (measureNumber - 1) * measureDuration;
    const measureEnd = measureNumber * measureDuration;

    xml += `    <measure number="${measureNumber}">
`;

    // Add attributes (tempo, time signature) on first measure
    if (measureNumber === 1) {
      xml += `      <attributes>
        <divisions>${divisions}</divisions>
        <time>
          <beats>${timeSignature!.beats}</beats>
          <beat-type>${timeSignature!.beatType}</beat-type>
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

    // Get notes in this measure
    const measureNotes: Note[] = [];
    while (noteIndex < sortedNotes.length && sortedNotes[noteIndex].startTime < measureEnd) {
      measureNotes.push(sortedNotes[noteIndex]);
      noteIndex++;
    }

    // Handle empty measure with rest
    if (measureNotes.length === 0) {
      const restDuration = divisions! * beatsPerMeasure;
      xml += `      <note>
        <rest/>
        <duration>${restDuration}</duration>
        <type>whole</type>
      </note>
`;
    } else {
      // Add notes
      let lastEndTime = measureStart;

      for (let i = 0; i < measureNotes.length; i++) {
        const note = measureNotes[i];
        const pitch = midiToPitch(note.midi);

        // Add rest if there's a gap
        if (note.startTime > lastEndTime + 0.01) {
          const gapDuration = secondsToDuration(note.startTime - lastEndTime, tempo!, divisions!);
          xml += `      <note>
        <rest/>
        <duration>${gapDuration.duration}</duration>
        <type>${gapDuration.type}</type>
      </note>
`;
        }

        // Calculate note duration (clip to measure boundary)
        const noteEnd = Math.min(note.startTime + note.duration, measureEnd);
        const noteDuration = secondsToDuration(noteEnd - note.startTime, tempo!, divisions!);

        // Check if this is a chord (simultaneous with previous note)
        const isChord = i > 0 && Math.abs(measureNotes[i].startTime - measureNotes[i - 1].startTime) < 0.01;

        xml += `      <note>
`;
        if (isChord) {
          xml += `        <chord/>
`;
        }
        xml += `        <pitch>
          <step>${pitch.step}</step>
`;
        if (pitch.alter !== 0) {
          xml += `          <alter>${pitch.alter}</alter>
`;
        }
        xml += `          <octave>${pitch.octave}</octave>
        </pitch>
        <duration>${noteDuration.duration}</duration>
        <type>${noteDuration.type}</type>
`;
        if (note.velocity !== undefined) {
          xml += `        <dynamics><f/></dynamics>
`;
        }
        xml += `      </note>
`;

        if (!isChord) {
          lastEndTime = noteEnd;
        }
      }
    }

    xml += `    </measure>
`;

    measureNumber++;

    // Safety limit
    if (measureNumber > 1000) break;
  }

  xml += `  </part>
</score-partwise>`;

  return xml;
}

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Download MusicXML file
 */
export function downloadMusicXML(
  notes: Note[],
  filename: string = 'transcription.musicxml',
  options: MusicXMLExportOptions = {}
): void {
  const xml = exportToMusicXML(notes, options);
  const blob = new Blob([xml], { type: 'application/vnd.recordare.musicxml+xml' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.musicxml') ? filename : `${filename}.musicxml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default {
  exportToMusicXML,
  downloadMusicXML,
};
