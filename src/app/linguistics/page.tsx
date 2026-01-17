'use client';

import React, { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AudioFileUpload } from '@/components/audio-file-upload';
import { analyzeLinguistics, LinguisticsAnalysisResult } from '@/lib/linguistics-analysis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Languages,
  Upload,
  FileAudio,
  Loader2,
  Activity,
  Info,
  Sparkles,
  Mic,
  Clock,
  Waves,
} from 'lucide-react';

export default function LinguisticsPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<LinguisticsAnalysisResult | null>(null);

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setResult(null);

    if (newFiles.length > 0) {
      toast({
        title: 'File loaded',
        description: `${newFiles[0].name} ready for linguistic analysis`,
      });
    }
  }, [toast]);

  const handleAnalyze = useCallback(async () => {
    if (files.length === 0) return;

    setIsAnalyzing(true);
    setProgress(0);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const analysisResult = await analyzeLinguistics(audioBuffer, {
        onProgress: setProgress,
      });

      setResult(analysisResult);

      toast({
        title: 'Analysis complete',
        description: `Speech rate: ${analysisResult.rhythm.speechRate.toFixed(1)} syl/sec`,
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

  // Render pitch contour visualization
  const renderPitchContour = () => {
    if (!result || result.prosody.pitchContour.length === 0) return null;

    const contour = result.prosody.pitchContour;
    const maxPitch = result.prosody.pitchRange.max;
    const minPitch = result.prosody.pitchRange.min;
    const pitchRange = maxPitch - minPitch || 1;

    // Create SVG path
    const width = 100;
    const height = 60;
    const points = contour.map((p, i) => {
      const x = (i / (contour.length - 1)) * width;
      const y = height - ((p.frequency - minPitch) / pitchRange) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">Pitch Contour (F0)</p>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32">
          <polyline
            points={points}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="0.5"
          />
        </svg>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0s</span>
          <span>{result.duration.toFixed(1)}s</span>
        </div>
      </div>
    );
  };

  // Render voice activity timeline
  const renderVoiceActivity = () => {
    if (!result || result.voiceActivity.length === 0) return null;

    const totalDuration = result.duration;

    return (
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">Voice Activity</p>
        <div className="h-8 flex rounded overflow-hidden">
          {result.voiceActivity.map((segment, i) => {
            const width = (segment.duration / totalDuration) * 100;
            return (
              <div
                key={i}
                className={`${
                  segment.isSpeech
                    ? 'bg-blue-500'
                    : 'bg-muted-foreground/30'
                }`}
                style={{ width: `${width}%` }}
                title={`${segment.isSpeech ? 'Speech' : 'Pause'}: ${segment.duration.toFixed(2)}s`}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Speech</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted-foreground/30" />
            <span>Pause</span>
          </div>
        </div>
      </div>
    );
  };

  // Render vowel space plot
  const renderVowelSpace = () => {
    if (!result || result.vowelSpace.formants.length === 0) return null;

    const formants = result.vowelSpace.formants;
    const width = 200;
    const height = 150;

    // F2 on X (reversed - high to low), F1 on Y (reversed - low to high)
    const f1Min = 200, f1Max = 1000;
    const f2Min = 800, f2Max = 2500;

    return (
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">Vowel Space (F1 × F2)</p>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
          {/* Axes labels */}
          <text x="5" y="10" className="fill-muted-foreground text-[8px]">F1 ↓</text>
          <text x={width - 25} y={height - 5} className="fill-muted-foreground text-[8px]">← F2</text>

          {/* Plot points */}
          {formants.map((f, i) => {
            const x = width - ((f.f2 - f2Min) / (f2Max - f2Min)) * width;
            const y = ((f.f1 - f1Min) / (f1Max - f1Min)) * height;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                className="fill-primary"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
          <div className="relative bg-gradient-to-br from-blue-600 to-blue-500 p-3 rounded-xl">
            <Languages className="h-6 w-6 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Linguistics</h1>
          <p className="text-muted-foreground">
            Phonetic & prosodic analysis
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto bg-blue-500/10 text-blue-500">
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
              Upload speech recordings for analysis
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
                <FileAudio className="h-5 w-5 text-blue-500" />
                <span className="text-sm truncate flex-1">{files[0].name}</span>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={files.length === 0 || isAnalyzing}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze Speech
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
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  <p className="font-medium">About Linguistic Analysis</p>
                  <p className="mt-1 opacity-80">
                    Analyzes prosody (pitch contour), speech rhythm,
                    voice activity, and vowel formants. Useful for
                    language documentation in PNG and beyond.
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
              <Activity className="h-5 w-5" />
              Speech Analysis
            </CardTitle>
            <CardDescription>
              Prosody, rhythm, and phonetic features
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Upload speech audio to analyze linguistic features</p>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="prosody" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="prosody">Prosody</TabsTrigger>
                  <TabsTrigger value="rhythm">Rhythm</TabsTrigger>
                  <TabsTrigger value="vowels">Vowels</TabsTrigger>
                </TabsList>

                <TabsContent value="prosody" className="space-y-4">
                  {renderPitchContour()}

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-xs text-muted-foreground mb-1">Average Pitch</p>
                      <p className="text-xl font-bold">{result.prosody.averagePitch.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">Hz</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-xs text-muted-foreground mb-1">Pitch Range</p>
                      <p className="text-xl font-bold">
                        {(result.prosody.pitchRange.max - result.prosody.pitchRange.min).toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Hz</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-xs text-muted-foreground mb-1">Variability</p>
                      <p className="text-xl font-bold">{result.prosody.pitchVariability.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Hz (SD)</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-xs text-muted-foreground mb-1">Duration</p>
                      <p className="text-xl font-bold">{result.duration.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">seconds</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="rhythm" className="space-y-4">
                  {renderVoiceActivity()}

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Waves className="h-5 w-5 text-blue-500" />
                        <p className="font-medium text-blue-500">Speech Rate</p>
                      </div>
                      <p className="text-2xl font-bold">{result.rhythm.speechRate.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">syllables/sec (est.)</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <p className="font-medium">Pause Count</p>
                      </div>
                      <p className="text-2xl font-bold">{result.rhythm.pauseCount}</p>
                      <p className="text-xs text-muted-foreground">pauses detected</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Avg. Pause Duration</p>
                      <p className="text-xl font-bold">{(result.rhythm.averagePauseDuration * 1000).toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">milliseconds</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Speech Time</p>
                      <p className="text-lg font-bold">{result.rhythm.totalSpeechDuration.toFixed(1)}s</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Rhythm Ratio</p>
                      <p className="text-lg font-bold">{(result.rhythm.rhythmRatio * 100).toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">speech / total</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="vowels" className="space-y-4">
                  {renderVowelSpace()}

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-xs text-muted-foreground mb-1">Average F1</p>
                      <p className="text-xl font-bold">{result.vowelSpace.averageF1.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">Hz (height)</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-xs text-muted-foreground mb-1">Average F2</p>
                      <p className="text-xl font-bold">{result.vowelSpace.averageF2.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">Hz (backness)</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-xs text-muted-foreground mb-1">Vowel Space</p>
                      <p className="text-xl font-bold">{(result.vowelSpace.vowelSpaceArea / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-muted-foreground">Hz² area</p>
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
