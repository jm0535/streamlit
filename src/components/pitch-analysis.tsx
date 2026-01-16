'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Music,
  BarChart3,
  Target,
  Layers,
  TrendingUp,
  Piano,
} from 'lucide-react';

// Simplified note interface for external use
interface SimpleNote {
  pitch: number;
  startTime: number;
  duration: number;
  velocity: number;
}

interface PitchAnalysisProps {
  notes: SimpleNote[];
}

// Simple analysis function that works with SimpleNote
function analyzeSimpleNotes(notes: SimpleNote[]) {
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Pitch histogram
  const pitchHistogram: Record<string, number> = {};
  NOTE_NAMES.forEach(name => pitchHistogram[name] = 0);

  let minPitch = Infinity;
  let maxPitch = -Infinity;
  let totalDuration = 0;

  notes.forEach(note => {
    const noteName = NOTE_NAMES[note.pitch % 12];
    pitchHistogram[noteName] = (pitchHistogram[noteName] || 0) + 1;
    minPitch = Math.min(minPitch, note.pitch);
    maxPitch = Math.max(maxPitch, note.pitch);
    totalDuration += note.duration;
  });

  // Find tonal center (most frequent note)
  let tonalCenter = 'C';
  let maxCount = 0;
  for (const [note, count] of Object.entries(pitchHistogram) as [string, number][]) {
    if (count > maxCount) {
      maxCount = count;
      tonalCenter = note;
    }
  }

  // Simple scale detection
  const presentNotes = new Set(
    Object.entries(pitchHistogram)
      .filter(([, count]) => count > 0)
      .map(([name]) => name)
  );

  const scales: Record<string, string[]> = {
    'Major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    'Minor': ['C', 'D', 'D#', 'F', 'G', 'G#', 'A#'],
    'Pentatonic': ['C', 'D', 'E', 'G', 'A'],
    'Blues': ['C', 'D#', 'F', 'F#', 'G', 'A#'],
  };

  let detectedScale = 'Unknown';
  let bestMatch = 0;

  for (const [scaleName, scaleNotes] of Object.entries(scales)) {
    const tonicIndex = NOTE_NAMES.indexOf(tonalCenter);
    const transposed = scaleNotes.map(note => {
      const idx = (NOTE_NAMES.indexOf(note) + tonicIndex) % 12;
      return NOTE_NAMES[idx];
    });

    const matches = [...presentNotes].filter(n => transposed.includes(n)).length;
    if (matches > bestMatch) {
      bestMatch = matches;
      detectedScale = `${tonalCenter} ${scaleName}`;
    }
  }

  return {
    noteCount: notes.length,
    pitchHistogram,
    pitchRange: { min: minPitch === Infinity ? 0 : minPitch, max: maxPitch === -Infinity ? 127 : maxPitch },
    durationTotal: totalDuration,
    tonalCenter,
    detectedScale,
  };
}

const NOTE_COLORS: Record<string, string> = {
  'C': 'bg-red-500',
  'C#': 'bg-red-400',
  'D': 'bg-orange-500',
  'D#': 'bg-orange-400',
  'E': 'bg-yellow-500',
  'F': 'bg-green-500',
  'F#': 'bg-green-400',
  'G': 'bg-blue-500',
  'G#': 'bg-blue-400',
  'A': 'bg-indigo-500',
  'A#': 'bg-indigo-400',
  'B': 'bg-purple-500',
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function PitchAnalysis({ notes }: PitchAnalysisProps) {
  const analysis = useMemo(() => analyzeSimpleNotes(notes), [notes]);

  // Calculate histogram percentages
  const histogramData = useMemo(() => {
    const maxCount = Math.max(...Object.values(analysis.pitchHistogram), 1);
    return NOTE_NAMES.map(note => ({
      note,
      count: analysis.pitchHistogram[note] || 0,
      percentage: ((analysis.pitchHistogram[note] || 0) / maxCount) * 100,
    }));
  }, [analysis.pitchHistogram]);

  if (notes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No notes to analyze</p>
          <p className="text-sm">Upload and transcribe audio to see pitch analysis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <Music className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Notes</p>
                <p className="text-2xl font-bold">{analysis.noteCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/10 p-2 rounded-lg">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tonal Center</p>
                <p className="text-2xl font-bold">{analysis.tonalCenter}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/10 p-2 rounded-lg">
                <Layers className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Detected Scale</p>
                <p className="text-lg font-bold truncate">{analysis.detectedScale}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500/10 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pitch Range</p>
                <p className="text-lg font-bold">
                  {analysis.pitchRange.max - analysis.pitchRange.min} semitones
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pitch Histogram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Pitch Class Distribution
          </CardTitle>
          <CardDescription>
            Frequency of each pitch class in the transcription (note names only, regardless of octave)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {histogramData.map(({ note, count, percentage }) => (
              <div key={note} className="flex items-center gap-3">
                <div className="w-8 text-right font-mono text-sm">{note}</div>
                <div className="flex-1">
                  <div className="h-6 bg-muted rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${NOTE_COLORS[note] || 'bg-primary'} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right text-sm text-muted-foreground">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scale Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Piano className="h-5 w-5" />
            Scale/Mode Analysis
          </CardTitle>
          <CardDescription>
            Detected musical scale based on pitch distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="text-lg px-4 py-2">
                {analysis.detectedScale}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Based on {analysis.noteCount} notes
              </span>
            </div>

            {/* Visual keyboard showing scale notes */}
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-3">Notes in transcription:</p>
              <div className="flex gap-1 flex-wrap">
                {NOTE_NAMES.map(note => {
                  const count = analysis.pitchHistogram[note] || 0;
                  const isPresent = count > 0;
                  const isTonic = note === analysis.tonalCenter;

                  return (
                    <div
                      key={note}
                      className={`
                        w-10 h-12 rounded flex flex-col items-center justify-center text-xs
                        ${isTonic
                          ? 'bg-primary text-primary-foreground font-bold ring-2 ring-primary ring-offset-2'
                          : isPresent
                            ? `${NOTE_COLORS[note]} text-white`
                            : 'bg-muted-foreground/20 text-muted-foreground'
                        }
                      `}
                    >
                      <span>{note}</span>
                      {isPresent && <span className="text-[10px] opacity-80">{count}</span>}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Tonal center highlighted with ring
              </p>
            </div>

            {/* Statistics */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Total Duration</p>
                <p className="text-lg font-medium">{analysis.durationTotal.toFixed(2)} seconds</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">MIDI Range</p>
                <p className="text-lg font-medium">
                  {analysis.pitchRange.min} - {analysis.pitchRange.max}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PitchAnalysis;
