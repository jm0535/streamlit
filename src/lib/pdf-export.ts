/**
 * PDF Export utilities for Note Editor
 * Creates visual note grid and basic sheet music notation
 */

import { Note } from './midi-utils';

interface PDFExportOptions {
  title?: string;
  tempo?: number;
  duration?: number;
  pageWidth?: number;
  pageHeight?: number;
}

// MIDI note names
const MIDI_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function midiToNoteName(midi: number): string {
  const noteName = MIDI_NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${noteName}${octave}`;
}

// Note colors for visual output
const NOTE_COLORS: Record<number, string> = {
  0: '#ef4444',   // C - red
  1: '#f87171',   // C#
  2: '#f97316',   // D - orange
  3: '#fb923c',   // D#
  4: '#eab308',   // E - yellow
  5: '#22c55e',   // F - green
  6: '#4ade80',   // F#
  7: '#3b82f6',   // G - blue
  8: '#60a5fa',   // G#
  9: '#6366f1',   // A - indigo
  10: '#818cf8',  // A#
  11: '#a855f7',  // B - purple
};

/**
 * Export note editor visualization to PDF
 * Uses canvas-based rendering and downloads as PDF via print dialog
 */
export function exportNotesToPDF(notes: Note[], options: PDFExportOptions = {}): void {
  const {
    title = 'Notes Export',
    tempo = 120,
    duration = 30,
  } = options;

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Could not open print window. Please allow popups.');
  }

  // Find note range
  const midiNotes = notes.map(n => n.midi);
  const minMidi = midiNotes.length > 0 ? Math.min(...midiNotes) - 2 : 60;
  const maxMidi = midiNotes.length > 0 ? Math.max(...midiNotes) + 2 : 72;
  const noteRange = maxMidi - minMidi + 1;

  // Dimensions
  const keyWidth = 50;
  const noteHeight = 15;
  const pixelsPerSecond = 80;
  const gridWidth = duration * pixelsPerSecond;
  const gridHeight = noteRange * noteHeight;

  // Generate HTML content
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        @media print {
          @page {
            size: landscape;
            margin: 0.5in;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
        }
        .header {
          margin-bottom: 20px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin: 0 0 5px 0;
        }
        .meta {
          font-size: 12px;
          color: #666;
        }
        .piano-roll {
          display: flex;
          border: 1px solid #333;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .keys {
          flex-shrink: 0;
          width: ${keyWidth}px;
          border-right: 2px solid #333;
        }
        .key {
          height: ${noteHeight}px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 5px;
          font-size: 9px;
          border-bottom: 1px solid #ddd;
          box-sizing: border-box;
        }
        .key.black {
          background: #e5e5e5;
        }
        .key.white {
          background: #f5f5f5;
        }
        .grid {
          position: relative;
          width: ${gridWidth}px;
          height: ${gridHeight}px;
          background: #fafafa;
          overflow: hidden;
        }
        .grid-row {
          position: absolute;
          width: 100%;
          height: ${noteHeight}px;
          border-bottom: 1px solid #eee;
          box-sizing: border-box;
        }
        .grid-row.black {
          background: #f0f0f0;
        }
        .beat-line {
          position: absolute;
          top: 0;
          height: 100%;
          border-left: 1px solid #ddd;
        }
        .beat-line.measure {
          border-left: 2px solid #999;
        }
        .note {
          position: absolute;
          border-radius: 3px;
          font-size: 7px;
          color: white;
          padding: 1px 3px;
          box-sizing: border-box;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .legend {
          margin-top: 20px;
          font-size: 11px;
        }
        .legend-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .note-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .note-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .note-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">${title}</h1>
        <div class="meta">
          Tempo: ${tempo} BPM | Duration: ${duration}s | Notes: ${notes.length} | Generated: ${new Date().toLocaleDateString()}
        </div>
      </div>

      <div class="piano-roll">
        <div class="keys">
          ${Array.from({ length: noteRange }).map((_, i) => {
            const midi = maxMidi - i;
            const isBlack = [1, 3, 6, 8, 10].includes(midi % 12);
            const showLabel = midi % 12 === 0;
            return `<div class="key ${isBlack ? 'black' : 'white'}">${showLabel ? midiToNoteName(midi) : ''}</div>`;
          }).join('')}
        </div>

        <div class="grid">
          ${Array.from({ length: noteRange }).map((_, i) => {
            const midi = maxMidi - i;
            const isBlack = [1, 3, 6, 8, 10].includes(midi % 12);
            return `<div class="grid-row ${isBlack ? 'black' : ''}" style="top: ${i * noteHeight}px"></div>`;
          }).join('')}

          ${Array.from({ length: Math.ceil(duration * (tempo / 60)) }).map((_, i) => {
            const time = (i * 60) / tempo;
            const isMeasure = i % 4 === 0;
            return `<div class="beat-line ${isMeasure ? 'measure' : ''}" style="left: ${time * pixelsPerSecond}px"></div>`;
          }).join('')}

          ${notes.map(note => {
            const y = (maxMidi - note.midi) * noteHeight + 2;
            const x = note.startTime * pixelsPerSecond;
            const width = Math.max(note.duration * pixelsPerSecond, 10);
            const color = NOTE_COLORS[note.midi % 12] || '#3b82f6';
            return `<div class="note" style="top: ${y}px; left: ${x}px; width: ${width}px; height: ${noteHeight - 4}px; background: ${color}">${note.name || midiToNoteName(note.midi)}</div>`;
          }).join('')}
        </div>
      </div>

      <div class="legend">
        <div class="legend-title">Note Legend:</div>
        <div class="note-list">
          ${notes.slice(0, 20).map(note => `
            <div class="note-item">
              <div class="note-color" style="background: ${NOTE_COLORS[note.midi % 12] || '#3b82f6'}"></div>
              <span>${midiToNoteName(note.midi)} @ ${note.startTime.toFixed(2)}s (${note.duration.toFixed(2)}s)</span>
            </div>
          `).join('')}
          ${notes.length > 20 ? `<div class="note-item">...and ${notes.length - 20} more notes</div>` : ''}
        </div>
      </div>

      <div class="footer">
        Generated by Streamlit Note Editor
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Export notes as simple text notation
 */
export function exportNotesAsText(notes: Note[]): string {
  const sortedNotes = [...notes].sort((a, b) => a.startTime - b.startTime);

  let output = '# Musical Notes\n\n';
  output += '| Time | Note | Duration | Velocity |\n';
  output += '|------|------|----------|----------|\n';

  for (const note of sortedNotes) {
    output += `| ${note.startTime.toFixed(2)}s | ${midiToNoteName(note.midi)} | ${note.duration.toFixed(2)}s | ${note.velocity} |\n`;
  }

  return output;
}

const pdfExport = {
  exportNotesToPDF,
  exportNotesAsText,
};

export default pdfExport;
