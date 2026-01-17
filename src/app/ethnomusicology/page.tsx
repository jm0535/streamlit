'use client';

import React, { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AudioFileUpload } from '@/components/audio-file-upload';
import { analyzeMicrotonal, MicrotonalAnalysisResult, PitchHistogramData } from '@/lib/microtonal-analysis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Globe,
  Upload,
  FileAudio,
  Loader2,
  Music,
  BarChart3,
  Info,
  Sparkles,
} from 'lucide-react';

export default function EthnomusicologyPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<MicrotonalAnalysisResult | null>(null);

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setResult(null);

    if (newFiles.length > 0) {
      toast({
        title: 'File loaded',
        description: `${newFiles[0].name} ready for analysis`,
      });
    }
  }, [toast]);

  const handleAnalyze = useCallback(async () => {
    if (files.length === 0) return;

    setIsAnalyzing(true);
    setProgress(0);

    try {
      const file = files[0];
      // Decode audio file
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Run analysis
      const analysisResult = await analyzeMicrotonal(audioBuffer, {
        onProgress: setProgress,
      });

      setResult(analysisResult);

      toast({
        title: 'Analysis complete',
        description: `Found ${analysisResult.totalNotes} pitch events with ${analysisResult.microtonalContent.toFixed(1)}% microtonal content`,
      });

      audioContext.close();
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [files, toast]);

  // Simple bar chart for histogram
  const renderHistogram = (histogram: PitchHistogramData[]) => {
    const maxCount = Math.max(...histogram.map(p => p.count));
    const buckets: Map<string, { total: number; avgCents: number }> = new Map();

    // Group by note name (octave-agnostic)
    for (const pitch of histogram) {
      const baseNote = pitch.noteName.replace(/\d+/, '');
      const existing = buckets.get(baseNote);
      if (existing) {
        existing.total += pitch.count;
        existing.avgCents = (existing.avgCents + pitch.cents) / 2;
      } else {
        buckets.set(baseNote, { total: pitch.count, avgCents: pitch.cents });
      }
    }

    const sortedBuckets = Array.from(buckets.entries()).sort((a, b) => {
      const order = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    });

    const maxBucket = Math.max(...sortedBuckets.map(([, v]) => v.total));

    return (
      <div className="flex items-end gap-1 h-48">
        {sortedBuckets.map(([note, data]) => {
          const height = maxBucket > 0 ? (data.total / maxBucket) * 100 : 0;
          const isMicrotonal = Math.abs(data.avgCents) > 10;

          return (
            <div key={note} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-t transition-all ${
                  isMicrotonal
                    ? 'bg-gradient-to-t from-amber-500 to-amber-400'
                    : 'bg-gradient-to-t from-primary to-primary/60'
                }`}
                style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                title={`${note}: ${data.total} occurrences, ${data.avgCents.toFixed(1)} cents deviation`}
              />
              <span className="text-xs text-muted-foreground">{note}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <div className="relative bg-gradient-to-br from-primary to-primary/60 p-3 rounded-xl">
            <Globe className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Ethnomusicology</h1>
          <p className="text-muted-foreground">
            Microtonal analysis & cultural scale detection
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          Research Tool
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Audio Upload
            </CardTitle>
            <CardDescription>
              Upload audio for microtonal analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AudioFileUpload
              files={files}
              onFilesChange={handleFilesChange}
              maxFiles={1}
              accept={['audio/*']}
            />

            {files.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileAudio className="h-5 w-5 text-primary" />
                <span className="text-sm truncate flex-1">{files[0].name}</span>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={files.length === 0 || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze Microtones
                </>
              )}
            </Button>

            {isAnalyzing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-center text-muted-foreground">
                  {progress.toFixed(0)}% complete
                </p>
              </div>
            )}

            {/* Info Panel */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-xs text-blue-500">
                  <p className="font-medium">About Microtonal Analysis</p>
                  <p className="mt-1 opacity-80">
                    Detects pitches that deviate from Western 12-TET tuning.
                    Useful for analyzing non-Western music, field recordings,
                    and traditional scales from PNG and beyond.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analysis Results
            </CardTitle>
            <CardDescription>
              Pitch histogram and scale detection
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Upload and analyze audio to see results</p>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="histogram" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="histogram">Pitch Histogram</TabsTrigger>
                  <TabsTrigger value="scale">Scale Detection</TabsTrigger>
                  <TabsTrigger value="stats">Statistics</TabsTrigger>
                </TabsList>

                <TabsContent value="histogram" className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    {renderHistogram(result.pitchHistogram)}
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-primary" />
                      <span>Standard tuning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-amber-500" />
                      <span>Microtonal (&gt;10 cents deviation)</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="scale" className="space-y-4">
                  {result.scaleAnalysis ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <h4 className="font-medium text-green-500">
                          Detected: {result.scaleAnalysis.detectedScale}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Confidence: {(result.scaleAnalysis.confidence * 100).toFixed(0)}%
                        </p>
                        {result.scaleAnalysis.culturalContext && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Context: {result.scaleAnalysis.culturalContext}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-muted-foreground">
                        No matching scale pattern detected.
                        This may indicate a unique tuning system.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="stats" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Pitches</p>
                      <p className="text-2xl font-bold">{result.totalNotes}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Microtonal Content</p>
                      <p className="text-2xl font-bold">{result.microtonalContent.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Avg. Cents Deviation</p>
                      <p className="text-2xl font-bold">{result.averageCentsDeviation.toFixed(1)}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Unique Pitches</p>
                      <p className="text-2xl font-bold">{result.pitchHistogram.length}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
