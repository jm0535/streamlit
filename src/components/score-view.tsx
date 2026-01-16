'use client';

import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, Beam } from 'vexflow';
import { Note } from '@/lib/midi-utils';

interface ScoreViewProps {
  notes: Note[];
  tempo?: number;
  width?: number;
  scale?: number;
}

export function ScoreView({ notes, tempo = 120, width = 800, scale = 1.0 }: ScoreViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || notes.length === 0) return;

    // Clear previous rendering
    containerRef.current.innerHTML = '';

    // Initialize Renderer
    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);

    // Calculate layout
    const context = renderer.getContext();
    const openMeasureWidth = 300; // Width of first measure with clef/time sig
    const standardMeasureWidth = 250;

    // Quantize and Group Notes into Measures
    const measures = processNotesIntoMeasures(notes, tempo);

    // Calculate total height needed
    const measuresPerRow = Math.floor(width / standardMeasureWidth);
    const rows = Math.ceil(measures.length / measuresPerRow);
    const rowHeight = 120 * scale;
    const totalHeight = rows * rowHeight + 50;

    renderer.resize(width, totalHeight);
    context.scale(scale, scale);
    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

    let x = 10;
    let y = 40;
    let measureIndex = 0;

    for (let r = 0; r < rows; r++) {
      x = 10; // Reset X for new row

      for (let m = 0; m < measuresPerRow; m++) {
        if (measureIndex >= measures.length) break;

        const isFirstOfRow = (m === 0);
        const currentMeasureWidth = isFirstOfRow ? openMeasureWidth : standardMeasureWidth;

        // Draw Stave
        const stave = new Stave(x, y, currentMeasureWidth);

        // Add Clef and Time Signature to first measure of first row
        if (isFirstOfRow) {
          stave.addClef("treble");
          if (measureIndex === 0) {
            stave.addTimeSignature("4/4");
          }
        }

        stave.setContext(context).draw();

        // Get Voice for this measure
        const notesInMeasure = measures[measureIndex];

        if (notesInMeasure.length > 0) {
          // Create Voice
          const voice = new Voice({ numBeats: 4, beatValue: 4 });
          voice.setStrict(false); // Relax strict timing checks
          voice.addTickables(notesInMeasure);

          // Format and Draw
          new Formatter().joinVoices([voice]).format([voice], currentMeasureWidth - (isFirstOfRow ? 50 : 0));
          voice.draw(context, stave);

          // Beaming
          const beams = Beam.generateBeams(notesInMeasure);
          beams.forEach(b => b.setContext(context).draw());
        }

        x += currentMeasureWidth;
        measureIndex++;
      }

      y += rowHeight; // Move to next row
    }

  }, [notes, tempo, width, scale]);

  return <div ref={containerRef} className="bg-white text-black p-4 rounded-lg overflow-x-auto overflow-y-hidden" />;
}

// --- Helper Logic for Quantization ---

/**
 * Process raw MIDI notes into VexFlow StaveNotes separated by measures
 * Assumes 4/4 time signature
 */
function processNotesIntoMeasures(rawNotes: Note[], tempo: number): StaveNote[][] {
  // 1. Sort notes
  const sortedNotes = [...rawNotes].sort((a, b) => a.startTime - b.startTime);
  if (sortedNotes.length === 0) return [];

  // 2. Constants
  const BEATS_PER_MEASURE = 4;
  const SECONDS_PER_BEAT = 60 / tempo;
  const SECONDS_PER_MEASURE = SECONDS_PER_BEAT * BEATS_PER_MEASURE;

  // 3. Group into Measure buckets
  const notesByMeasure: Note[][] = [];
  const maxTime = sortedNotes[sortedNotes.length - 1].startTime + sortedNotes[sortedNotes.length - 1].duration;
  const totalMeasures = Math.ceil(maxTime / SECONDS_PER_MEASURE);

  for (let i = 0; i < totalMeasures; i++) {
    notesByMeasure[i] = [];
  }

  for (const note of sortedNotes) {
    const measureIndex = Math.floor(note.startTime / SECONDS_PER_MEASURE);
    if (notesByMeasure[measureIndex]) {
      notesByMeasure[measureIndex].push(note);
    }
  }

  const vfMeasures: StaveNote[][] = [];

  // 4. Convert each bucket to VF Notes
  for (let i = 0; i < totalMeasures; i++) {
    const measureNotes = notesByMeasure[i] || [];
    const measureStartTime = i * SECONDS_PER_MEASURE;
    const vfNotes = quantizeMeasure(measureNotes, measureStartTime, SECONDS_PER_BEAT);
    vfMeasures.push(vfNotes);
  }

  return vfMeasures;
}

function quantizeMeasure(notes: Note[], measureStartTime: number, secondsPerBeat: number): StaveNote[] {
  const vfNotes: StaveNote[] = [];
  // For simplicity measure in 16th notes (4 per beat * 4 beats = 16)
  const TOTAL_SLOTS = 16;
  const slotDuration = secondsPerBeat / 4;

  // Fill grid
  const grid: (Note | null)[] = new Array(TOTAL_SLOTS).fill(null);

  notes.forEach(note => {
    const relativeTime = note.startTime - measureStartTime;
    const slotIndex = Math.round(relativeTime / slotDuration);
    if (slotIndex >= 0 && slotIndex < TOTAL_SLOTS) {
      grid[slotIndex] = note;
    }
  });

  let currentSlot = 0;

  while (currentSlot < TOTAL_SLOTS) {
    const note = grid[currentSlot];

    if (note) {
      // Note found
      const durationSlots = Math.max(1, Math.round(note.duration / slotDuration));
      const actualSlots = Math.min(durationSlots, TOTAL_SLOTS - currentSlot);
      const durationCode = getDurationCode(actualSlots);

      const noteName = midiToNoteName(note.midi);
      const vfNote = new StaveNote({
        keys: [noteName],
        duration: durationCode,
        autoStem: true,
      });

      if (noteName.includes('#')) {
        vfNote.addModifier(new Accidental('#'));
      }

      vfNotes.push(vfNote);

      currentSlot += actualSlots;
    } else {
      // Rest handling
      let restLength = 1;
      while (currentSlot + restLength < TOTAL_SLOTS && grid[currentSlot + restLength] === null) {
        restLength++;
      }

      const restDuration = getDurationCode(restLength);

      vfNotes.push(new StaveNote({
        keys: ["b/4"], // Standard rest position
        duration: restDuration + "r",
      }));

      currentSlot += restLength;
    }
  }

  return vfNotes;
}

function getDurationCode(slots: number): string {
  if (slots >= 16) return "w";
  if (slots >= 8) return "h";
  if (slots >= 4) return "q";
  if (slots >= 2) return "8";
  return "16";
}

const MIDI_NOTE_NAMES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];

function midiToNoteName(midi: number): string {
  const noteName = MIDI_NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${noteName}/${octave}`;
}
