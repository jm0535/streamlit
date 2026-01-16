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
  Loader2,
  Grid3X3,
  BookOpen,
} from 'lucide-react';
import { playNotes as playNotesWithTone, playNote as playNoteWithTone, stopPlayback, initializeAudio } from '@/lib/audio-playback';
import { ScoreView } from '@/components/score-view';

// MIDI note number to note name
const MIDI_NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function midiToNoteName(midi: number): string {
  const noteName = MIDI_NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${noteName}${octave}`;
}

interface NotesEditorProps {
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

export function NotesEditor({
  notes: initialNotes,
  onNotesChange,
  duration = 30,
  tempo = 120,
  isReadOnly = false,
  onExportMIDI,
  onExportPDF,
}: NotesEditorProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [viewMode, setViewMode] = useState<'grid' | 'score'>('grid');

  const canvasRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const playStartTimeRef = useRef<number>(0);
  const stopFnRef = useRef<(() => void) | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [scoreWidth, setScoreWidth] = useState(1000);
  const scoreContainerRef = useRef<HTMLDivElement>(null);

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

    // Auto-scroll to notes
    if (initialNotes.length > 0 && canvasRef.current) {
      // Find range of pitches
      const midis = initialNotes.map(n => n.midi);
      const minMidi = Math.min(...midis);
      const maxMidi = Math.max(...midis);
      const avgMidi = (minMidi + maxMidi) / 2;

      // Calculate Scroll Y
      // y = (MAX_MIDI - midi) * NOTE_HEIGHT
      const centerY = (87 - avgMidi + 21) * 16; // Approximate calculation
      // Precise: (MAX_MIDI - avgMidi) * NOTE_HEIGHT
      const preciseCenterY = (108 - avgMidi) * 16;

      const containerHeight = 500; // Fixed height from style

      // Scroll to center
      setTimeout(() => {
        if (canvasRef.current) {
          canvasRef.current.scrollTop = Math.max(0, centerY - containerHeight / 2);
        }
      }, 100);
    }
  }, [initialNotes]);

  // Initialize audio on mount
  useEffect(() => {
    return () => {
      stopPlayback();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Update score width on resize
  useEffect(() => {
    if (!scoreContainerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
           setScoreWidth(entry.contentRect.width - 40); // Subtract padding
        }
      }
    });

    observer.observe(scoreContainerRef.current);
    return () => observer.disconnect();
  }, [viewMode]);

  // Play a single note (for click feedback) using Tone.js
  const playNote = useCallback(async (frequency: number, startDelay: number, noteDuration: number) => {
    // Convert frequency to MIDI
    const midi = Math.round(12 * Math.log2(frequency / 440) + 69);
    await playNoteWithTone(midi, noteDuration, volume);
  }, [volume]);

  // Playback animation using performance.now()
  const animate = useCallback(() => {
    if (!isPlaying) return;

    const elapsed = (performance.now() - playStartTimeRef.current) / 1000;
    setPlayheadPosition(elapsed);

    if (elapsed < duration) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
      setPlayheadPosition(0);
    }
  }, [isPlaying, duration]);

  // Handle playback using Tone.js for realistic sounds
  const handlePlay = useCallback(async () => {
    if (isPlaying) {
      // Stop playback
      if (stopFnRef.current) {
        stopFnRef.current();
        stopFnRef.current = null;
      }
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    if (notes.length === 0) return;

    setIsLoadingAudio(true);

    try {
      // Initialize Tone.js audio context (requires user interaction)
      await initializeAudio();

      setIsPlaying(true);
      playStartTimeRef.current = performance.now();

      // Filter notes to start from current playhead position
      const notesToPlay = notes
        .filter(note => note.startTime >= playheadPosition)
        .map(note => ({
          ...note,
          startTime: note.startTime - playheadPosition,
        }));

      // Play notes using Tone.js with piano samples
      const stopFn = await playNotesWithTone(
        notesToPlay,
        { volume, instrument: 'piano' },
        (time, playing) => {
          if (playing) {
            setPlayheadPosition(playheadPosition + time);
          } else {
            setIsPlaying(false);
            setPlayheadPosition(0);
          }
        }
      );

      stopFnRef.current = stopFn;
      animationRef.current = requestAnimationFrame(animate);
    } catch (error) {
      console.error('Playback error:', error);
      setIsPlaying(false);
    } finally {
      setIsLoadingAudio(false);
    }
  }, [isPlaying, playheadPosition, notes, volume, animate]);

  const handleStop = useCallback(() => {
    if (stopFnRef.current) {
      stopFnRef.current();
      stopFnRef.current = null;
    }
    stopPlayback();
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
    <div className="bg-[#1a1a1a] text-white rounded-lg overflow-hidden border border-[#333] h-[600px] flex flex-col shadow-xl">
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

          <div className="flex bg-secondary/20 rounded-lg p-0.5 gap-0.5">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
              title="Grid View"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'score' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('score')}
              className="h-8 w-8 p-0"
              title="Score View"
            >
              <BookOpen className="h-4 w-4" />
            </Button>
          </div>

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
      {/* Main View Area */}
      {viewMode === 'score' ? (
        <div ref={scoreContainerRef} className="flex-1 overflow-auto bg-white relative">
          <ScoreView notes={notes} tempo={tempo} width={scoreWidth} scale={zoom} />
        </div>
      ) : (
      <div className="flex flex-1 overflow-hidden relative">
        {/* Piano Keys */}
        <div
          ref={keysRef}
          className="flex-shrink-0 border-r border-gray-600 overflow-hidden bg-[#1a1a1a] z-10"
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
          className="flex-1 overflow-auto relative bg-[#0f0f0f]"
          onClick={!isReadOnly ? handleGridClick : undefined}
          onScroll={(e) => {
            setScrollX(e.currentTarget.scrollLeft);
            setScrollY(e.currentTarget.scrollTop);
            if (keysRef.current) {
              keysRef.current.scrollTop = e.currentTarget.scrollTop;
            }
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
                  className={`absolute w-full border-b z-0 ${
                    isBlack ? 'bg-[#1e1e1e] border-[#333]' : 'bg-transparent border-[#333]/50'
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
                  className={`absolute top-0 h-full z-0 ${
                    isMeasure ? 'border-l-2 border-[#555]' : 'border-l border-[#333]'
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
                  className={`absolute rounded cursor-pointer border-2 transition-all z-10 ${colorClass} ${
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
      )}

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

export default NotesEditor;
