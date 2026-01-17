'use client';

import React, { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AudioFileUpload } from '@/components/audio-file-upload';
import { analyzeSoundscape, SoundscapeAnalysisResult } from '@/lib/acoustic-indices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TreePine,
  Upload,
  FileAudio,
  Loader2,
  Activity,
  BarChart3,
  Info,
  Sparkles,
  Volume2,
  Bird,
  Factory,
  Layers,
} from 'lucide-react';

import { FileSelectorDialog } from '@/components/file-selector-dialog';

export default function SoundEcologyPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SoundscapeAnalysisResult | null>(null);

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setResult(null);

    if (newFiles.length > 0) {
      toast({
        title: 'File loaded',
        description: `${newFiles[0].name} ready for soundscape analysis`,
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
      const analysisResult = await analyzeSoundscape(audioBuffer, {
        onProgress: setProgress,
      });

      setResult(analysisResult);

      const ndsiInterpretation = analysisResult.indices.ndsi > 0.5
        ? 'predominantly natural'
        : analysisResult.indices.ndsi < -0.5
        ? 'predominantly anthropogenic'
        : 'mixed soundscape';

      toast({
        title: 'Analysis complete',
        description: `NDSI: ${analysisResult.indices.ndsi.toFixed(2)} (${ndsiInterpretation})`,
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

  // NDSI gauge visualization
  const renderNDSIGauge = (ndsi: number) => {
    const percentage = ((ndsi + 1) / 2) * 100; // Convert -1..1 to 0..100

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Factory className="h-3 w-3" /> Anthrophony
          </span>
          <span className="flex items-center gap-1">
            Biophony <Bird className="h-3 w-3" />
          </span>
        </div>
        <div className="relative h-6 bg-gradient-to-r from-orange-500 via-gray-500 to-green-500 rounded-full overflow-hidden">
          <div
            className="absolute top-0 h-full w-1 bg-white shadow-lg"
            style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
          />
        </div>
        <div className="text-center">
          <span className="text-2xl font-bold">
            {ndsi.toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground ml-2">NDSI</span>
        </div>
      </div>
    );
  };

  // Frequency band chart
  const renderFrequencyBands = () => {
    if (!result) return null;

    const maxEnergy = Math.max(...result.frequencyBands.map(b => b.percentage));

    return (
      <div className="space-y-2">
        {result.frequencyBands.map((band, index) => (
          <div key={band.band} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{band.band}</span>
              <span className="font-mono">{band.percentage.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  index === 0
                    ? 'bg-orange-500'
                    : index < 4
                    ? 'bg-green-500'
                    : 'bg-purple-500'
                }`}
                style={{ width: `${(band.percentage / maxEnergy) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Temporal variation chart
  const renderTemporalVariation = () => {
    if (!result || result.temporalVariation.length === 0) return null;

    const maxRMS = Math.max(...result.temporalVariation);
    const barWidth = 100 / result.temporalVariation.length;

    return (
      <div className="h-32 flex items-end gap-px">
        {result.temporalVariation.map((rms, index) => (
          <div
            key={index}
            className="bg-primary/60 hover:bg-primary transition-colors"
            style={{
              width: `${barWidth}%`,
              height: maxRMS > 0 ? `${(rms / maxRMS) * 100}%` : '0%',
              minHeight: rms > 0 ? '2px' : '0',
            }}
            title={`Second ${index + 1}: RMS ${rms.toFixed(4)}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
          <div className="relative bg-gradient-to-br from-green-600 to-green-500 p-3 rounded-xl">
            <TreePine className="h-6 w-6 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Sound Ecology</h1>
          <p className="text-muted-foreground">
            Acoustic indices & soundscape analysis
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto bg-green-500/10 text-green-500">
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
              Upload field recordings or environmental audio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AudioFileUpload
              files={files}
              onFilesChange={handleFilesChange}
              maxFiles={1}
              accept={['audio/*']}
            />

            <div className="flex items-center gap-2 my-2">
              <div className="h-px bg-border flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="h-px bg-border flex-1" />
            </div>

            <FileSelectorDialog
              onFilesSelected={handleFilesChange}
              trigger={
                <Button variant="outline" className="w-full">
                  <Layers className="h-4 w-4 mr-2" />
                  Select from Library
                </Button>
              }
            />

            {files.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileAudio className="h-5 w-5 text-green-500" />
                <span className="text-sm truncate flex-1">{files[0].name}</span>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={files.length === 0 || isAnalyzing}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze Soundscape
                </>
              )}
            </Button>

            {isAnalyzing && (
              <div className="space-y-2">
                <Progress value={progress} className="bg-green-100" />
                <p className="text-xs text-center text-muted-foreground">
                  {progress.toFixed(0)}% complete
                </p>
              </div>
            )}

            {/* Info Panel */}
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-green-500 mt-0.5" />
                <div className="text-xs text-green-600 dark:text-green-400">
                  <p className="font-medium">About Acoustic Indices</p>
                  <p className="mt-1 opacity-80">
                    Measures like ACI and NDSI quantify soundscape complexity
                    and the balance between biological and human-made sounds.
                    Essential for biodiversity monitoring in PNG.
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
              Soundscape Analysis
            </CardTitle>
            <CardDescription>
              Acoustic indices and frequency band distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Volume2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Upload and analyze audio to see soundscape metrics</p>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="indices" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="indices">Acoustic Indices</TabsTrigger>
                  <TabsTrigger value="frequency">Frequency Bands</TabsTrigger>
                  <TabsTrigger value="temporal">Temporal</TabsTrigger>
                </TabsList>

                <TabsContent value="indices" className="space-y-6">
                  {/* NDSI Gauge */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    {renderNDSIGauge(result.indices.ndsi)}
                  </div>

                  {/* Other indices */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-xs text-muted-foreground mb-1">ACI</p>
                      <p className="text-xl font-bold">{result.indices.aci.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Complexity</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-xs text-muted-foreground mb-1">Entropy</p>
                      <p className="text-xl font-bold">{result.indices.entropy.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Diversity</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-xs text-muted-foreground mb-1">Peak Frequency</p>
                      <p className="text-xl font-bold">{result.indices.peakFrequency.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Hz</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-xs text-muted-foreground mb-1">Centroid</p>
                      <p className="text-xl font-bold">{result.indices.spectralCentroid.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Hz</p>
                    </div>
                  </div>

                  {/* Bio/Anthro comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Bird className="h-5 w-5 text-green-500" />
                        <p className="font-medium text-green-500">Biophony</p>
                      </div>
                      <p className="text-2xl font-bold">{result.indices.biophony.toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground">2-8 kHz biological sounds</p>
                    </div>
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Factory className="h-5 w-5 text-orange-500" />
                        <p className="font-medium text-orange-500">Anthrophony</p>
                      </div>
                      <p className="text-2xl font-bold">{result.indices.anthrophony.toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground">1-2 kHz human-made sounds</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="frequency" className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    {renderFrequencyBands()}
                  </div>
                  <div className="flex items-center gap-4 text-xs flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-orange-500" />
                      <span>Anthrophony</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span>Biophony</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-purple-500" />
                      <span>Ultrasonic</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="temporal" className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                      Sound intensity over time (RMS per second)
                    </p>
                    {renderTemporalVariation()}
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>0s</span>
                      <span>{result.duration.toFixed(1)}s</span>
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
