"use client";

import React, { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Layers,
  Upload,
  Download,
  Play,
  Pause,
  Settings,
  FileAudio,
  Activity,
  Clock,
  TrendingUp,
  BarChart3,
  Zap,
  Music,
  Music2,
  Waves,
  Volume2,
  Mic,
  Piano,
  Guitar,
  Drum,
  Sliders,
  Loader2,
  CheckCircle,
  AlertCircle,
  Headphones,
  Save,
  VolumeX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AudioFileUpload } from "@/components/audio-file-upload";
import { AudioVisualizer } from "@/components/audio-visualizer";
import StemSeparationViewer from "@/components/StemSeparationViewer";

interface StemTrack {
  id: string;
  name: string;
  instrument: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  muted: boolean;
  solo: boolean;
  volume: number;
  frequencyRange: [number, number];
  audioBuffer?: AudioBuffer;
  isProcessing: boolean;
  confidence: number;
}

interface SeparationResult {
  id: string;
  fileName: string;
  originalDuration: number;
  stems: StemTrack[];
  processingTime: number;
  overallConfidence: number;
  detectedInstruments: string[];
}

export default function StemSeparationPage() {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<SeparationResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SeparationResult | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingStem, setCurrentPlayingStem] = useState<string | null>(
    null
  );

  const [separationSettings, setSeparationSettings] = useState({
    enableBass: true,
    enableDrums: true,
    enableGuitar: true,
    enableVocals: true,
    enablePiano: true,
    enableOther: true,
    quality: "high" as "low" | "medium" | "high",
    algorithm: "frequency" as "frequency" | "ml" | "hybrid",
    preserveStereo: true,
    noiseReduction: true,
  });

  const defaultStems: StemTrack[] = [
    {
      id: "bass",
      name: "Bass",
      instrument: "bass",
      icon: Music,
      color: "#ef4444",
      muted: false,
      solo: false,
      volume: 0.8,
      frequencyRange: [30, 250],
      isProcessing: false,
      confidence: 0,
    },
    {
      id: "drums",
      name: "Drums",
      instrument: "drums",
      icon: Drum,
      color: "#f97316",
      muted: false,
      solo: false,
      volume: 0.8,
      frequencyRange: [150, 400],
      isProcessing: false,
      confidence: 0,
    },
    {
      id: "guitar",
      name: "Guitar",
      instrument: "guitar",
      icon: Guitar,
      color: "#eab308",
      muted: false,
      solo: false,
      volume: 0.8,
      frequencyRange: [250, 3000],
      isProcessing: false,
      confidence: 0,
    },
    {
      id: "vocals",
      name: "Vocals",
      instrument: "vocals",
      icon: Mic,
      color: "#22c55e",
      muted: false,
      solo: false,
      volume: 0.8,
      frequencyRange: [200, 4000],
      isProcessing: false,
      confidence: 0,
    },
    {
      id: "piano",
      name: "Piano",
      instrument: "piano",
      icon: Piano,
      color: "#3b82f6",
      muted: false,
      solo: false,
      volume: 0.8,
      frequencyRange: [100, 8000],
      isProcessing: false,
      confidence: 0,
    },
    {
      id: "other",
      name: "Other",
      instrument: "other",
      icon: Waves,
      color: "#8b5cf6",
      muted: false,
      solo: false,
      volume: 0.8,
      frequencyRange: [50, 20000],
      isProcessing: false,
      confidence: 0,
    },
  ];

  const handleFileUpload = useCallback(
    (files: File[]) => {
      setUploadedFiles(files);
      setResults([]);
      setSelectedResult(null);
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) ready for stem separation`,
      });
    },
    [toast]
  );

  const startSeparation = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload audio files first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const newResults: SeparationResult[] = [];

      for (const file of uploadedFiles) {
        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const processedStems = defaultStems.map((stem) => ({
          ...stem,
          confidence: Math.random() * 0.3 + 0.7,
          isProcessing: false,
        }));

        const mockResult: SeparationResult = {
          id: Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          originalDuration: Math.random() * 300 + 60,
          stems: processedStems,
          processingTime: Math.random() * 10 + 5,
          overallConfidence: Math.random() * 0.1 + 0.9,
          detectedInstruments: processedStems
            .filter((stem) => stem.confidence > 0.7)
            .map((stem) => stem.name),
        };

        newResults.push(mockResult);
      }

      setResults(newResults);
      setSelectedResult(newResults[0]);

      toast({
        title: "Stem separation complete",
        description: `Successfully separated ${newResults.length} file(s) into stems`,
      });
    } catch (error) {
      toast({
        title: "Separation failed",
        description: "An error occurred during processing",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFiles, toast]);

  const toggleStemMute = useCallback(
    (stemId: string) => {
      if (!selectedResult) return;

      const updatedStems = selectedResult.stems.map((stem) =>
        stem.id === stemId ? { ...stem, muted: !stem.muted } : stem
      );

      setSelectedResult({ ...selectedResult, stems: updatedStems });
    },
    [selectedResult]
  );

  const toggleStemSolo = useCallback(
    (stemId: string) => {
      if (!selectedResult) return;

      const updatedStems = selectedResult.stems.map((stem) => {
        if (stem.id === stemId) {
          return { ...stem, solo: !stem.solo };
        }
        return { ...stem, solo: false };
      });

      setSelectedResult({ ...selectedResult, stems: updatedStems });
    },
    [selectedResult]
  );

  const updateStemVolume = useCallback(
    (stemId: string, volume: number) => {
      if (!selectedResult) return;

      const updatedStems = selectedResult.stems.map((stem) =>
        stem.id === stemId ? { ...stem, volume } : stem
      );

      setSelectedResult({ ...selectedResult, stems: updatedStems });
    },
    [selectedResult]
  );

  const exportStem = useCallback(
    (stem: StemTrack, fileName: string) => {
      // Simulate stem export
      const blob = new Blob(["mock-audio-data"], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName.replace(
        /\.[^/.]+$/,
        ""
      )}_${stem.name.toLowerCase()}.wav`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Stem exported",
        description: `Exported ${stem.name} stem as WAV file`,
      });
    },
    [toast]
  );

  const exportAllStems = useCallback(
    (result: SeparationResult) => {
      result.stems.forEach((stem) => {
        if (stem.confidence > 0.5) {
          setTimeout(() => exportStem(stem, result.fileName), 100);
        }
      });

      toast({
        title: "All stems exported",
        description: `Exported ${
          result.stems.filter((s) => s.confidence > 0.5).length
        } stems`,
      });
    },
    [toast, exportStem]
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Layers className="h-8 w-8 text-primary" />
            Stem Separation
          </h1>
          <p className="text-muted-foreground">
            Isolate individual instruments from audio files using advanced
            frequency analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Advanced Settings
          </Button>
          <Button
            onClick={startSeparation}
            disabled={isProcessing || uploadedFiles.length === 0}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Separating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Start Separation
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Column - Upload & Settings */}
        <div className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Audio Files
              </CardTitle>
              <CardDescription>
                Supported formats: MP3, WAV, FLAC, M4A
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AudioFileUpload
                files={uploadedFiles}
                onFilesChange={handleFileUpload}
                maxFiles={5}
              />
            </CardContent>
          </Card>

          {/* Separation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="h-5 w-5" />
                Separation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="algorithm-select">Algorithm</Label>
                <select
                  id="algorithm-select"
                  value={separationSettings.algorithm}
                  onChange={(e) =>
                    setSeparationSettings((prev) => ({
                      ...prev,
                      algorithm: e.target.value as
                        | "frequency"
                        | "hybrid"
                        | "ml",
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                  aria-label="Select stem separation algorithm"
                  title="Choose the algorithm for stem separation"
                >
                  <option value="spectral">Spectral Analysis</option>
                  <option value="frequency">Frequency-Based</option>
                  <option value="ml">Machine Learning</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <Label htmlFor="quality-select">Quality</Label>
                <select
                  id="quality-select"
                  value={separationSettings.quality}
                  onChange={(e) =>
                    setSeparationSettings((prev) => ({
                      ...prev,
                      quality: e.target.value as "low" | "medium" | "high",
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                  aria-label="Select processing quality"
                  title="Choose the quality level for processing"
                >
                  <option value="low">Low (Fast)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Slow)</option>
                </select>
              </div>

              <div className="space-y-3">
                {[
                  { key: "enableBass", label: "Bass", icon: Music },
                  { key: "enableDrums", label: "Drums", icon: Drum },
                  { key: "enableGuitar", label: "Guitar", icon: Guitar },
                  { key: "enableVocals", label: "Vocals", icon: Mic },
                  { key: "enablePiano", label: "Piano", icon: Piano },
                  { key: "enableOther", label: "Other", icon: Waves },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{label}</span>
                    </div>
                    <Switch
                      checked={
                        typeof separationSettings[
                          key as keyof typeof separationSettings
                        ] === "boolean"
                          ? (separationSettings[
                              key as keyof typeof separationSettings
                            ] as boolean)
                          : false
                      }
                      onCheckedChange={(checked) =>
                        setSeparationSettings((prev) => ({
                          ...prev,
                          [key]: checked,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Preserve Stereo</span>
                <Switch
                  checked={separationSettings.preserveStereo}
                  onCheckedChange={(checked) =>
                    setSeparationSettings((prev) => ({
                      ...prev,
                      preserveStereo: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Noise Reduction</span>
                <Switch
                  checked={separationSettings.noiseReduction}
                  onCheckedChange={(checked) =>
                    setSeparationSettings((prev) => ({
                      ...prev,
                      noiseReduction: checked,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Results & Visualizer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Results List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="h-5 w-5" />
                Separation Results
              </CardTitle>
              <CardDescription>
                {results.length} file(s) processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No separations yet</p>
                  <p className="text-sm">Upload files and start processing</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedResult?.id === result.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedResult(result)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {result.fileName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {Math.floor(result.originalDuration / 60)}:
                            {(result.originalDuration % 60)
                              .toFixed(0)
                              .padStart(2, "0")}
                            <TrendingUp className="h-3 w-3" />
                            {(result.overallConfidence * 100).toFixed(1)}%
                            confidence
                            <Activity className="h-3 w-3" />
                            {result.processingTime.toFixed(1)}s
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {result.detectedInstruments.map((instrument, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {instrument}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="h-5 w-5" />
                </CardTitle>
                <CardDescription>
                  Adjust individual stem levels and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedResult.stems.map((stem) => {
                    const Icon = stem.icon;
                    return (
                      <div key={stem.id} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center stem-color-indicator"
                            data-color={stem.color}
                          >
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{stem.name}</span>
                              <Badge
                                variant={
                                  stem.confidence > 0.8
                                    ? "default"
                                    : stem.confidence > 0.6
                                    ? "secondary"
                                    : "outline"
                                }
                                className="text-xs"
                              >
                                {(stem.confidence * 100).toFixed(0)}%
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {stem.frequencyRange[0]}-{stem.frequencyRange[1]}{" "}
                              Hz
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant={stem.muted ? "destructive" : "outline"}
                              size="sm"
                              onClick={() => toggleStemMute(stem.id)}
                            >
                              <Volume2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={stem.solo ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleStemSolo(stem.id)}
                            >
                              <VolumeX className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                exportStem(stem, selectedResult.fileName)
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-8">
                            Vol
                          </span>
                          <Slider
                            value={[stem.volume]}
                            onValueChange={([value]) =>
                              updateStemVolume(stem.id, value)
                            }
                            max={1}
                            min={0}
                            step={0.01}
                            className="flex-1"
                          />
                          <span className="text-xs text-muted-foreground w-10 text-right">
                            {Math.round(stem.volume * 100)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button
                    onClick={() => exportAllStems(selectedResult)}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export All Stems
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Visualization & Analysis */}
        <div className="space-y-6">
          {/* Audio Visualizer */}
          {selectedResult && uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Audio Visualization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AudioVisualizer
                  audioFile={uploadedFiles[0]}
                  showNotes={false}
                />
              </CardContent>
            </Card>
          )}

          {/* Analysis Details */}
          {selectedResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analysis Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Original Duration:</span>
                    <p>
                      {Math.floor(selectedResult.originalDuration / 60)}:
                      {(selectedResult.originalDuration % 60)
                        .toFixed(0)
                        .padStart(2, "0")}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Processing Time:</span>
                    <p>{selectedResult.processingTime.toFixed(1)}s</p>
                  </div>
                  <div>
                    <span className="font-medium">Overall Confidence:</span>
                    <p>
                      {(selectedResult.overallConfidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Stems Detected:</span>
                    <p>{selectedResult.detectedInstruments.join(", ")}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Stem Quality:</h4>
                  {selectedResult.stems.map((stem) => (
                    <div key={stem.id} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full stem-quality-indicator"
                        data-color={stem.color}
                      />
                      <span className="text-xs flex-1">{stem.name}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-16 bg-muted rounded-full h-1">
                          <div
                            className="h-1 rounded-full stem-progress-bar"
                            data-color={stem.color}
                            data-width={`${stem.confidence * 100}%`}
                          />
                        </div>
                        <span className="text-xs w-10 text-right">
                          {(stem.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Progress Bar for Processing */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">
                  Separating audio stems...
                </p>
                <Progress value={undefined} className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
