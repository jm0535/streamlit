/**
 * Academic Music Export Formats
 * Research-grade export formats for musicology and digital humanities
 * - MEI (Music Encoding Initiative) - XML-based scholarly music encoding
 * - Humdrum - Token-based format for computational musicology
 * - ABC Notation - Simple text-based music notation
 */

import { Note } from './midi-utils';

// ============================================
// MEI (Music Encoding Initiative) Export
// ============================================

export interface MEIExportOptions {
  title?: string;
  composer?: string;
  tempo?: number;
  timeSignature?: { beats: number; beatType: number };
  keySignature?: string;
  encoder?: string;
  encodingDate?: string;
  repository?: string;
  identifier?: string;
}

const NOTE_NAMES = ['c', 'c', 'd', 'd', 'e', 'f', 'f', 'g', 'g', 'a', 'a', 'b'];
const ACCIDENTALS = ['', 's', '', 's', '', '', 's', '', 's', '', 's', ''];

function midiToPitch(midi: number): { pname: string; accid: string; oct: number } {
  const octave = Math.floor(midi / 12) - 1;
  const pitchClass = midi % 12;
  return {
    pname: NOTE_NAMES[pitchClass],
    accid: ACCIDENTALS[pitchClass] ? 's' : '',
    oct: octave,
  };
}

function durationToMEI(durationSeconds: number, tempo: number = 120): { dur: string; dots: number } {
  const quarterNoteDuration = 60 / tempo;
  const ratio = durationSeconds / quarterNoteDuration;

  // Map to standard note durations
  if (ratio >= 3.5) return { dur: 'long', dots: 0 };
  if (ratio >= 2.8) return { dur: 'breve', dots: 0 };
  if (ratio >= 1.75) return { dur: '1', dots: 1 };
  if (ratio >= 1.4) return { dur: '1', dots: 0 };
  if (ratio >= 0.875) return { dur: '2', dots: 1 };
  if (ratio >= 0.7) return { dur: '2', dots: 0 };
  if (ratio >= 0.4375) return { dur: '4', dots: 1 };
  if (ratio >= 0.35) return { dur: '4', dots: 0 };
  if (ratio >= 0.21875) return { dur: '8', dots: 1 };
  if (ratio >= 0.175) return { dur: '8', dots: 0 };
  if (ratio >= 0.109375) return { dur: '16', dots: 1 };
  if (ratio >= 0.0875) return { dur: '16', dots: 0 };
  return { dur: '32', dots: 0 };
}

export function exportToMEI(notes: Note[], options: MEIExportOptions = {}): string {
  const {
    title = 'Untitled Transcription',
    composer = 'Unknown',
    tempo = 120,
    timeSignature = { beats: 4, beatType: 4 },
    keySignature = 'C',
    encoder = 'Streamlit Audio Research Platform',
    encodingDate = new Date().toISOString().split('T')[0],
    repository = '',
    identifier = `transcription-${Date.now()}`,
  } = options;

  const escapeXml = (str: string) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-model href="https://music-encoding.org/schema/5.0/mei-all.rng" type="application/xml" schematypens="http://relaxng.org/ns/structure/1.0"?>
<mei xmlns="http://www.music-encoding.org/ns/mei">
  <meiHead>
    <fileDesc>
      <titleStmt>
        <title>${escapeXml(title)}</title>
        <composer>${escapeXml(composer)}</composer>
      </titleStmt>
      <pubStmt>
        <date isodate="${encodingDate}">${encodingDate}</date>
        ${repository ? `<repository><name>${escapeXml(repository)}</name></repository>` : ''}
        <identifier>${escapeXml(identifier)}</identifier>
      </pubStmt>
    </fileDesc>
    <encodingDesc>
      <appInfo>
        <application>
          <name>${escapeXml(encoder)}</name>
          <p>Automatic transcription from audio</p>
        </application>
      </appInfo>
    </encodingDesc>
    <workList>
      <work>
        <title>${escapeXml(title)}</title>
        <tempo>${tempo} BPM</tempo>
      </work>
    </workList>
  </meiHead>
  <music>
    <body>
      <mdiv>
        <score>
          <scoreDef>
            <staffGrp>
              <staffDef n="1" lines="5" clef.shape="G" clef.line="2"
                       meter.count="${timeSignature.beats}" meter.unit="${timeSignature.beatType}"
                       key.sig="${keySignature === 'C' ? '0' : keySignature}"/>
            </staffGrp>
          </scoreDef>
          <section>
            <measure n="1">
              <staff n="1">
                <layer n="1">
`;

  // Generate notes
  let measureNotes = 0;
  let measureDuration = 0;
  const measureLength = (timeSignature.beats / timeSignature.beatType) * 4 * (60 / tempo);
  let currentMeasure = 1;

  for (const note of notes) {
    const pitch = midiToPitch(note.midi);
    const { dur, dots } = durationToMEI(note.duration, tempo);

    // Check if we need a new measure
    if (measureDuration + note.duration > measureLength && measureNotes > 0) {
      currentMeasure++;
      xml += `                </layer>
              </staff>
            </measure>
            <measure n="${currentMeasure}">
              <staff n="1">
                <layer n="1">
`;
      measureDuration = 0;
      measureNotes = 0;
    }

    xml += `                  <note xml:id="n${measureNotes + 1}_m${currentMeasure}" pname="${pitch.pname}" oct="${pitch.oct}" dur="${dur}"`;

    if (pitch.accid) {
      xml += ` accid="${pitch.accid}"`;
    }
    if (dots > 0) {
      xml += ` dots="${dots}"`;
    }
    if (note.velocity) {
      // Convert velocity to dynamics
      const dynamics = note.velocity > 100 ? 'f' : note.velocity > 70 ? 'mf' : note.velocity > 40 ? 'mp' : 'p';
      xml += ` artic.ges="${dynamics}"`;
    }
    xml += `/>\n`;

    measureDuration += note.duration;
    measureNotes++;
  }

  // Close remaining tags
  xml += `                </layer>
              </staff>
            </measure>
          </section>
        </score>
      </mdiv>
    </body>
  </music>
</mei>`;

  return xml;
}

// ============================================
// Humdrum **kern Export
// ============================================

export interface HumdrumExportOptions {
  title?: string;
  composer?: string;
  tempo?: number;
  spine?: string;
}

const KERN_PITCHES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];

function midiToKern(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const pitchClass = midi % 12;
  let pitch = KERN_PITCHES[pitchClass];

  // Kern uses lowercase for octave 4+, uppercase for octave 3-
  // Repeated letters indicate higher/lower octaves
  if (octave >= 4) {
    pitch = pitch.toLowerCase();
    const repeats = octave - 4;
    return pitch + pitch.repeat(repeats);
  } else {
    pitch = pitch.toUpperCase();
    const repeats = 3 - octave;
    return pitch + pitch.toUpperCase().charAt(0).repeat(repeats);
  }
}

function durationToKern(durationSeconds: number, tempo: number = 120): string {
  const quarterNoteDuration = 60 / tempo;
  const ratio = durationSeconds / quarterNoteDuration;

  // Kern duration: 1=whole, 2=half, 4=quarter, 8=eighth, etc.
  // Dots are represented by adding '.' after
  if (ratio >= 3) return '0';      // breve
  if (ratio >= 1.5) return '1.';   // dotted whole
  if (ratio >= 1) return '1';      // whole
  if (ratio >= 0.75) return '2.';  // dotted half
  if (ratio >= 0.5) return '2';    // half
  if (ratio >= 0.375) return '4.'; // dotted quarter
  if (ratio >= 0.25) return '4';   // quarter
  if (ratio >= 0.1875) return '8.'; // dotted eighth
  if (ratio >= 0.125) return '8';  // eighth
  if (ratio >= 0.09375) return '16.'; // dotted sixteenth
  if (ratio >= 0.0625) return '16'; // sixteenth
  return '32';
}

export function exportToHumdrum(notes: Note[], options: HumdrumExportOptions = {}): string {
  const {
    title = 'Untitled',
    composer = 'Unknown',
    tempo = 120,
    spine = 'kern',
  } = options;

  let humdrum = '';

  // Reference records (metadata)
  humdrum += `!!!COM: ${composer}\n`;
  humdrum += `!!!OTL: ${title}\n`;
  humdrum += `!!!MM: ${tempo}\n`;
  humdrum += `!!!ENC: Streamlit Audio Research Platform\n`;
  humdrum += `!!!END: ${new Date().toISOString().split('T')[0]}\n`;
  humdrum += '\n';

  // Spine definition
  humdrum += `**${spine}\n`;
  humdrum += `*clefG2\n`;
  humdrum += `*k[]\n`;  // Key signature (no accidentals = C major)
  humdrum += `*M4/4\n`; // Time signature
  humdrum += `*MM${tempo}\n`; // Tempo

  // Notes
  for (const note of notes) {
    const duration = durationToKern(note.duration, tempo);
    const pitch = midiToKern(note.midi);
    humdrum += `${duration}${pitch}\n`;
  }

  // Spine terminator
  humdrum += '*-\n';

  return humdrum;
}

// ============================================
// ABC Notation Export
// ============================================

export interface ABCExportOptions {
  title?: string;
  composer?: string;
  tempo?: number;
  timeSignature?: string;
  keySignature?: string;
  referenceNumber?: number;
}

const ABC_PITCHES = ['C', '^C', 'D', '^D', 'E', 'F', '^F', 'G', '^G', 'A', '^A', 'B'];

function midiToABC(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const pitchClass = midi % 12;
  let pitch = ABC_PITCHES[pitchClass];

  // ABC: uppercase = octave 4, lowercase = octave 5
  // Apostrophes (') raise octave, commas (,) lower octave
  if (octave === 5) {
    pitch = pitch.toLowerCase();
  } else if (octave === 6) {
    pitch = pitch.toLowerCase() + "'";
  } else if (octave === 7) {
    pitch = pitch.toLowerCase() + "''";
  } else if (octave === 4) {
    // Already uppercase
  } else if (octave === 3) {
    pitch = pitch + ',';
  } else if (octave === 2) {
    pitch = pitch + ',,';
  } else if (octave === 1) {
    pitch = pitch + ',,,';
  }

  return pitch;
}

function durationToABC(durationSeconds: number, tempo: number = 120, defaultNoteLength: number = 8): string {
  const quarterNoteDuration = 60 / tempo;
  const defaultDuration = quarterNoteDuration * (4 / defaultNoteLength);
  const ratio = durationSeconds / defaultDuration;

  // ABC duration modifiers
  if (Math.abs(ratio - 1) < 0.1) return '';        // default length
  if (Math.abs(ratio - 2) < 0.1) return '2';       // double
  if (Math.abs(ratio - 4) < 0.1) return '4';       // quadruple
  if (Math.abs(ratio - 0.5) < 0.05) return '/2';   // half
  if (Math.abs(ratio - 0.25) < 0.025) return '/4'; // quarter
  if (Math.abs(ratio - 1.5) < 0.1) return '3/2';   // dotted
  if (Math.abs(ratio - 3) < 0.1) return '3';       // triple

  // For non-standard durations, approximate
  if (ratio > 1) return Math.round(ratio).toString();
  return '/' + Math.round(1 / ratio).toString();
}

export function exportToABC(notes: Note[], options: ABCExportOptions = {}): string {
  const {
    title = 'Untitled',
    composer = 'Unknown',
    tempo = 120,
    timeSignature = '4/4',
    keySignature = 'C',
    referenceNumber = 1,
  } = options;

  let abc = '';

  // Header fields
  abc += `X:${referenceNumber}\n`;
  abc += `T:${title}\n`;
  abc += `C:${composer}\n`;
  abc += `M:${timeSignature}\n`;
  abc += `L:1/8\n`;  // Default note length = eighth note
  abc += `Q:1/4=${tempo}\n`;
  abc += `K:${keySignature}\n`;

  // Notes
  const notesPerLine = 8;
  let noteCount = 0;
  let measureNotes = 0;
  const beatsPerMeasure = parseInt(timeSignature.split('/')[0]) || 4;

  for (const note of notes) {
    const pitch = midiToABC(note.midi);
    const duration = durationToABC(note.duration, tempo, 8);

    abc += `${pitch}${duration}`;
    noteCount++;
    measureNotes++;

    // Add bar line approximately
    if (measureNotes >= beatsPerMeasure) {
      abc += ' | ';
      measureNotes = 0;
    }

    // Line break for readability
    if (noteCount % notesPerLine === 0) {
      abc += '\n';
    }
  }

  // Final bar line
  if (!abc.endsWith('|]')) {
    abc += ' |]\n';
  }

  return abc;
}

// ============================================
// Download helpers
// ============================================

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadMEI(notes: Note[], filename: string = 'transcription.mei', options?: MEIExportOptions): void {
  const mei = exportToMEI(notes, options);
  downloadFile(mei, filename, 'application/xml');
}

export function downloadHumdrum(notes: Note[], filename: string = 'transcription.krn', options?: HumdrumExportOptions): void {
  const kern = exportToHumdrum(notes, options);
  downloadFile(kern, filename, 'text/plain');
}

export function downloadABC(notes: Note[], filename: string = 'transcription.abc', options?: ABCExportOptions): void {
  const abc = exportToABC(notes, options);
  downloadFile(abc, filename, 'text/plain');
}

const academicExport = {
  exportToMEI,
  exportToHumdrum,
  exportToABC,
  downloadMEI,
  downloadHumdrum,
  downloadABC,
};

export default academicExport;
