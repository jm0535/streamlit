'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Note } from '@/lib/midi-utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  Square,
  ZoomIn,
  ZoomOut,
  Download,
  FileText,
  Music,
  Trash2,
  Plus,
  RotateCcw,
  Volume2,
  Save,
} from 'lucide-react';

// MIDI note number to note name
const MIDI_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function midiToNoteName(midi: number): string {
  const noteName = MIDI_NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${noteName}${octave}`;
}

interface PianoRollProps {
  notes: Note[];
  onNotesChange?: (notes: Note[]) => void;
  duration?: number;
  tempo?: number;
  isReadOnly?: boolean;
  onExportMIDI?: () => void;
  onExportPDF?: () => void;
}

// Note colors based on pitch class
const NOTE_COLORS: Record<number, string> = {
  0: 'bg-red-500',     // C
  1: 'bg-red-400',     // C#
  2: 'bg-orange-500',  // D
  3: 'bg-orange-400',  // D#
  4: 'bg-yellow-500',  // E
  5: 'bg-green-500',   // F
  6: 'bg-green-400',   // F#
  7: 'bg-blue-500',    // G
  8: 'bg-blue-400',    // G#
  9: 'bg-indigo-500',  // A
  10: 'bg-indigo-400', // A#
  11: 'bg-purple-500', // B
};

export function PianoRoll({
  notes: initialNotes,
  onNotesChange,
  duration = 30,
  tempo = 120,
  isReadOnly = false,
  onExportMIDI,
  onExportPDF,
}: PianoRollProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.7);

  const canvasRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number | null>(null);
  const playStartTimeRef = useRef<number>(0);

  // Piano roll dimensions
  const PIANO_KEY_WIDTH = 60;
  const NOTE_HEIGHT = 16;
  const PIXELS_PER_SECOND = 100 * zoom;
  const MIN_MIDI = 21;  // A0
  const MAX_MIDI = 108; // C8
  const TOTAL_NOTES = MAX_MIDI - MIN_MIDI + 1;
  const GRID_HEIGHT = TOTAL_NOTES * NOTE_HEIGHT;
  const GRID_WIDTH = duration * PIXELS_PER_SECOND;

  // Update notes when prop changes
  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Play a note
  const playNote = useCallback((frequency: number, startDelay: number, noteDuration: number) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;

    gainNode.gain.value = 0;
    gainNode.gain.setValueAtTime(0, ctx.currentTime + startDelay);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + startDelay + 0.01);
    gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime + startDelay + noteDuration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + startDelay + noteDuration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime + startDelay);
    oscillator.stop(ctx.currentTime + startDelay + noteDuration);
  }, [volume]);

  // Playback animation
  const animate = useCallback(() => {
    if (!audioContextRef.current || !isPlaying) return;

    const elapsed = audioContextRef.current.currentTime - playStartTimeRef.current;
    setPlayheadPosition(elapsed);

    if (elapsed < duration) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
      setPlayheadPosition(0);
    }
  }, [isPlaying, duration]);

  // Handle playback
  const handlePlay = useCallback(() => {
    if (!audioContextRef.current) return;

    if (isPlaying) {
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    setIsPlaying(true);
    playStartTimeRef.current = audioContextRef.current.currentTime - playheadPosition;

    // Schedule all notes
    notes.forEach(note => {
      if (note.startTime >= playheadPosition) {
        const startDelay = note.startTime - playheadPosition;
        playNote(note.frequency, startDelay, note.duration);
      }
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying, playheadPosition, notes, playNote, animate]);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setPlayheadPosition(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  // Add a note
  const handleAddNote = useCallback((midi: number, startTime: number) => {
    if (isReadOnly) return;

    const frequency = 440 * Math.pow(2, (midi - 69) / 12);
    const newNote: Note = {
      midi,
      name: midiToNoteName(midi),
      pitchName: midiToNoteName(midi),
      octave: Math.floor(midi / 12) - 1,
      frequency,
      startTime,
      duration: 0.25, // Default quarter note at 120 BPM
      velocity: 100,
      confidence: 1,
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    onNotesChange?.(updatedNotes);

    // Play the note for feedback
    playNote(frequency, 0, 0.2);
  }, [notes, isReadOnly, onNotesChange, playNote]);

  // Delete selected note
  const handleDeleteNote = useCallback(() => {
    if (!selectedNote || isReadOnly) return;

    const updatedNotes = notes.filter((n, i) => `${n.midi}-${n.startTime}-${i}` !== selectedNote);
    setNotes(updatedNotes);
    onNotesChange?.(updatedNotes);
    setSelectedNote(null);
  }, [notes, selectedNote, isReadOnly, onNotesChange]);

  // Clear all notes
  const handleClear = useCallback(() => {
    if (isReadOnly) return;
    setNotes([]);
    onNotesChange?.([]);
    setSelectedNote(null);
  }, [isReadOnly, onNotesChange]);

  // Handle grid click
  const handleGridClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollX;
    const y = e.clientY - rect.top + scrollY;

    const midi = MAX_MIDI - Math.floor(y / NOTE_HEIGHT);
    const startTime = x / PIXELS_PER_SECOND;

    if (midi >= MIN_MIDI && midi <= MAX_MIDI && startTime >= 0 && startTime < duration) {
      handleAddNote(midi, startTime);
    }
  }, [scrollX, scrollY, PIXELS_PER_SECOND, duration, handleAddNote]);

  // Check if this is a black key
  const isBlackKey = (midi: number): boolean => {
    const note = midi % 12;
    return [1, 3, 6, 8, 10].includes(note);
  };

  return (
    <div className="bg-gray-900 text-white rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePlay}
            variant={isPlaying ? "destructive" : "default"}
            size="sm"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button onClick={handleStop} variant="outline" size="sm">
            <Square className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-gray-600 mx-2" />

          <Button
            onClick={() => setZoom(Math.min(zoom * 1.2, 4))}
            variant="outline"
            size="sm"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setZoom(Math.max(zoom / 1.2, 0.25))}
            variant="outline"
            size="sm"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          {!isReadOnly && (
            <>
              <div className="h-6 w-px bg-gray-600 mx-2" />
              <Button
                onClick={handleDeleteNote}
                variant="outline"
                size="sm"
                disabled={!selectedNote}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button onClick={handleClear} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-gray-400" />
            <Slider
              value={[volume * 100]}
              onValueChange={(v) => setVolume(v[0] / 100)}
              max={100}
              step={1}
              className="w-24"
            />
          </div>

          <Badge variant="outline" className="text-xs">
            {notes.length} notes
          </Badge>
          <Badge variant="outline" className="text-xs">
            {tempo} BPM
          </Badge>

          {onExportMIDI && (
            <Button onClick={onExportMIDI} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> MIDI
            </Button>
          )}
          {onExportPDF && (
            <Button onClick={onExportPDF} variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-1" /> PDF
            </Button>
          )}
        </div>
      </div>

      {/* Piano Roll Grid */}
      <div className="flex">
        {/* Piano Keys */}
        <div
          className="flex-shrink-0 border-r border-gray-600"
          style={{ width: PIANO_KEY_WIDTH }}
        >
          <div className="relative" style={{ height: GRID_HEIGHT }}>
            {Array.from({ length: TOTAL_NOTES }).map((_, i) => {
              const midi = MAX_MIDI - i;
              const isBlack = isBlackKey(midi);
              return (
                <div
                  key={midi}
                  className={`absolute w-full flex items-center justify-end pr-2 text-xs border-b border-gray-700 ${
                    isBlack ? 'bg-gray-800 text-gray-400' : 'bg-gray-700 text-gray-200'
                  }`}
                  style={{
                    top: i * NOTE_HEIGHT,
                    height: NOTE_HEIGHT,
                  }}
                >
                  {midi % 12 === 0 && <span className="font-semibold">{midiToNoteName(midi)}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Note Grid */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-auto relative bg-gray-850"
          style={{ maxHeight: 500 }}
          onClick={!isReadOnly ? handleGridClick : undefined}
          onScroll={(e) => {
            setScrollX(e.currentTarget.scrollLeft);
            setScrollY(e.currentTarget.scrollTop);
          }}
        >
          <div
            className="relative"
            style={{
              width: GRID_WIDTH,
              height: GRID_HEIGHT,
            }}
          >
            {/* Grid lines */}
            {Array.from({ length: TOTAL_NOTES }).map((_, i) => {
              const midi = MAX_MIDI - i;
              const isBlack = isBlackKey(midi);
              return (
                <div
                  key={`row-${midi}`}
                  className={`absolute w-full border-b ${
                    isBlack ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-750/30 border-gray-700'
                  }`}
                  style={{
                    top: i * NOTE_HEIGHT,
                    height: NOTE_HEIGHT,
                  }}
                />
              );
            })}

            {/* Beat lines */}
            {Array.from({ length: Math.ceil(duration * (tempo / 60)) }).map((_, i) => {
              const time = (i * 60) / tempo;
              const isMeasure = i % 4 === 0;
              return (
                <div
                  key={`beat-${i}`}
                  className={`absolute top-0 h-full ${
                    isMeasure ? 'border-l-2 border-gray-500' : 'border-l border-gray-700'
                  }`}
                  style={{ left: time * PIXELS_PER_SECOND }}
                />
              );
            })}

            {/* Notes */}
            {notes.map((note, index) => {
              const noteId = `${note.midi}-${note.startTime}-${index}`;
              const y = (MAX_MIDI - note.midi) * NOTE_HEIGHT;
              const x = note.startTime * PIXELS_PER_SECOND;
              const width = Math.max(note.duration * PIXELS_PER_SECOND, 4);
              const colorClass = NOTE_COLORS[note.midi % 12] || 'bg-blue-500';

              return (
                <div
                  key={noteId}
                  className={`absolute rounded cursor-pointer border-2 transition-all ${colorClass} ${
                    selectedNote === noteId ? 'border-white ring-2 ring-white/50' : 'border-transparent'
                  } hover:brightness-110`}
                  style={{
                    top: y + 1,
                    left: x,
                    width,
                    height: NOTE_HEIGHT - 2,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNote(selectedNote === noteId ? null : noteId);
                  }}
                >
                  <div className="text-[8px] text-white/80 px-1 truncate">
                    {note.name}
                  </div>
                </div>
              );
            })}

            {/* Playhead */}
            <div
              className="absolute top-0 h-full w-px bg-red-500 z-10 pointer-events-none"
              style={{ left: playheadPosition * PIXELS_PER_SECOND }}
            >
              <div className="absolute -top-1 -left-2 w-4 h-4 bg-red-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-700 p-2">
        <div className="flex items-center gap-4">
          <span>Time: {playheadPosition.toFixed(2)}s / {duration}s</span>
          <span>Zoom: {(zoom * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Music className="h-3 w-3" />
          <span>Click grid to add notes • Click note to select • Press Delete to remove</span>
        </div>
      </div>
    </div>
  );
}

export default PianoRoll;
