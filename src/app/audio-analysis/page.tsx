"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useFileStore, sharedAudioFileToFile } from "@/lib/file-store";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';
import {
  calculateFrequencySpectrum,
  calculateAmplitudeEnvelope,
  detectFrequencyPeaks,
  binToHz,
  detectMusicalKey,
  calculatePitchContour
} from "@/lib/audio-analysis";
import {
  BarChart3,
  Upload,
  Play,
  Pause,
  Download,
  Settings,
  FileAudio,
  Activity,
  Clock,
  TrendingUp,
  Zap,
  Headphones,
  Sliders,
  Save,
  Mic,
  Piano,
  Guitar,
  Drum,
  Music,
  Waves,
  Volume2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  FileText,
  Database,

  Radio,
  Layers,
} from "lucide-react";

import { FileSelectorDialog } from "@/components/file-selector-dialog";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AudioFileUpload } from "@/components/audio-file-upload";
import { AudioVisualizer } from "@/components/audio-visualizer";

interface AnalysisResult {
  id: string;
  fileName: string;
  duration: number;
  sampleRate: number;
  bitDepth: number;
  channels: number;
  fileSize: string;

  // Frequency Analysis
  frequencySpectrum: number[];
  dominantFrequency: number;
  frequencyPeaks: Array<{ frequency: number; amplitude: number }>;

  // Temporal Analysis
  amplitudeEnvelope: number[];
  rmsLevel: number;
  peakLevel: number;
  dynamicRange: number;

  // Musical Analysis
  tempo: number;
  keySignature: string;
  mode: string;
  timeSignature: string;
  pitchContour?: Array<{ time: number; frequency: number; confidence: number }>;

  // Harmonic Analysis
  harmonicContent: number[];
  fundamentalFrequency: number;
  overtones: number[];

  // Spectral Analysis
  spectralCentroid: number;
  spectralRolloff: number;
  spectralFlux: number;
  zeroCrossingRate: number;

  // Instrument Detection
  detectedInstruments: Array<{
    instrument: string;
    confidence: number;
    characteristics: string[];
  }>;

  // Quality Metrics
  signalToNoiseRatio: number;
  totalHarmonicDistortion: number;
  dynamicRangeDb: number;

  // Metadata
  format: string;
  codec: string;
  bitrate: number;
  metadata: {
    title?: string;
    artist?: string;
    album?: string;
    genre?: string;
    year?: number;
  };
}

interface AnalysisSettings {
  enableFrequencyAnalysis: boolean;
  enableTemporalAnalysis: boolean;
  enableMusicalAnalysis: boolean;
  enableHarmonicAnalysis: boolean;
  enableSpectralAnalysis: boolean;
  enableInstrumentDetection: boolean;
  enableQualityMetrics: boolean;
  fftSize: number;
  windowSize: number;
  overlapRatio: number;
}

export default function AudioAnalysisPage() {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(
    null
  );
  const [currentTab, setCurrentTab] = useState("overview");

  const { sharedAudioFiles, activeFiles } = useFileStore();

  useEffect(() => {
    const loadFiles = async () => {
      // 1. Try active in-memory files first
      if (activeFiles.length > 0 && uploadedFiles.length === 0) {
        setUploadedFiles(activeFiles);
        toast({
          title: "Files active",
          description: `${activeFiles.length} file(s) ready for analysis`,
        });
        return;
      }

      // 2. Fallback to shared persisted files
      if (sharedAudioFiles.length > 0 && uploadedFiles.length === 0) {
        const files: File[] = [];
        for (const sharedFile of sharedAudioFiles) {
          const file = await sharedAudioFileToFile(sharedFile);
          if (file) files.push(file);
        }
        if (files.length > 0) {
          setUploadedFiles(files);
          toast({
            title: "Files loaded",
            description: `${files.length} file(s) loaded from storage`,
          });
        }
      }
    };
    loadFiles();
  }, [sharedAudioFiles, activeFiles, uploadedFiles.length, toast]);

  const [analysisSettings, setAnalysisSettings] = useState<AnalysisSettings>({
    enableFrequencyAnalysis: true,
    enableTemporalAnalysis: true,
    enableMusicalAnalysis: true,
    enableHarmonicAnalysis: true,
    enableSpectralAnalysis: true,
    enableInstrumentDetection: true,
    enableQualityMetrics: true,
    fftSize: 2048,
    windowSize: 1024,
    overlapRatio: 0.5,
  });

  const handleFileUpload = useCallback(
    (files: File[]) => {
      setUploadedFiles(files);
      setResults([]);
      setSelectedResult(null);
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) ready for analysis`,
      });
    },
    [toast]
  );

  const startAnalysis = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload audio files first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const newResults: AnalysisResult[] = [];
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();

      for (const file of uploadedFiles) {
        // Decode audio data for real analysis
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Perform Real Analysis
        const frequencySpectrum = calculateFrequencySpectrum(audioBuffer, analysisSettings.fftSize);
        const amplitudeEnvelope = calculateAmplitudeEnvelope(audioBuffer, 200); // 200 points for visualization
        const frequencyPeaks = detectFrequencyPeaks(frequencySpectrum, analysisSettings.fftSize, audioBuffer.sampleRate);
        const musicalKey = detectMusicalKey(frequencyPeaks);
        const pitchContour = calculatePitchContour(audioBuffer, 100); // 100 points for melody curve

        // Calculate some basic metrics
        const rmsLevel = amplitudeEnvelope.reduce((a, b) => a + b, 0) / amplitudeEnvelope.length;
        const peakLevel = Math.max(...amplitudeEnvelope);

        // Convert frequency spectrum to data points for simple harmonic content
        const harmonicContent = frequencySpectrum.slice(0, 50);

        const result: AnalysisResult = {
          id: Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          duration: audioBuffer.duration,
          sampleRate: audioBuffer.sampleRate,
          bitDepth: 16, // Web Audio API decodes to float32
          channels: audioBuffer.numberOfChannels,
          fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,

          frequencySpectrum,
          dominantFrequency: frequencyPeaks[0]?.frequency || 0,
          frequencyPeaks,

          amplitudeEnvelope,
          rmsLevel,
          peakLevel,
          dynamicRange: 20 * Math.log10(peakLevel / (Math.min(...amplitudeEnvelope.filter(v => v > 0.001)) || 0.001)),

          tempo: 120, // Tempo detection placeholder
          keySignature: musicalKey.key,
          mode: musicalKey.mode,
          timeSignature: "4/4",
          pitchContour,

          harmonicContent,
          fundamentalFrequency: frequencyPeaks[0]?.frequency || 0,
          overtones: frequencyPeaks.slice(1, 6).map(p => p.frequency),

          spectralCentroid: 0,
          spectralRolloff: 0,
          spectralFlux: 0,
          zeroCrossingRate: 0,

          detectedInstruments: [
            {
              instrument: "Analyzing...",
              confidence: 0.8,
              characteristics: ["Polyphonic"],
            }
          ],

          signalToNoiseRatio: 0,
          totalHarmonicDistortion: 0,
          dynamicRangeDb: 0,

          format: file.name.split(".").pop()?.toUpperCase() || "UNKNOWN",
          codec: "PCM",
          bitrate: 0,
          metadata: {
            title: file.name,
          },
        };

        newResults.push(result);
      }

      setResults(newResults);
      setSelectedResult(newResults[0]);
      await audioContext.close();

      toast({
        title: "Analysis complete",
        description: "Audio visualization data generated",
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis error",
        description: "Failed to process audio file",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [uploadedFiles, analysisSettings, toast]);

  const exportAnalysis = useCallback(
    (result: AnalysisResult) => {
      const blob = new Blob([JSON.stringify(result, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.fileName.replace(/\.[^/.]+$/, "")}_analysis.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Analysis exported",
        description: `Exported analysis for ${result.fileName}`,
      });
    },
    [toast]
  );

  const exportCSV = useCallback(
    (result: AnalysisResult) => {
      const csv = [
        "Metric,Value,Unit",
        `Duration,${result.duration},seconds`,
        `Sample Rate,${result.sampleRate},Hz`,
        `Bit Depth,${result.bitDepth},bits`,
        `Channels,${result.channels},`,
        `Tempo,${result.tempo},BPM`,
        `Dominant Frequency,${result.dominantFrequency},Hz`,
        `Fundamental Frequency,${result.fundamentalFrequency},Hz`,
        `Spectral Centroid,${result.spectralCentroid},Hz`,
        `Signal to Noise Ratio,${result.signalToNoiseRatio},dB`,
        `Total Harmonic Distortion,${result.totalHarmonicDistortion},%`,
        `Dynamic Range,${result.dynamicRangeDb},dB`,
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.fileName.replace(/\.[^/.]+$/, "")}_analysis.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "CSV exported",
        description: `Exported analysis summary as CSV`,
      });
    },
    [toast]
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Audio Analysis
          </h1>
          <p className="text-muted-foreground">
            Comprehensive audio analysis including frequency, temporal, and
            spectral characteristics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Analysis Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Analysis Settings</DialogTitle>
                <DialogDescription>
                  Configure advanced analysis parameters for frequency, temporal, and spectral analysis.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>FFT Size</Label>
                    <select
                      value={analysisSettings.fftSize}
                      onChange={(e) =>
                        setAnalysisSettings((prev) => ({
                          ...prev,
                          fftSize: parseInt(e.target.value),
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                    >
                      <option value={256}>256 (Faster)</option>
                      <option value={512}>512</option>
                      <option value={1024}>1024</option>
                      <option value={2048}>2048 (Recommended)</option>
                      <option value={4096}>4096</option>
                      <option value={8192}>8192 (High precision)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Window Size: {analysisSettings.windowSize}</Label>
                    <Slider
                      value={[analysisSettings.windowSize]}
                      onValueChange={([value]) =>
                        setAnalysisSettings((prev) => ({ ...prev, windowSize: value }))
                      }
                      min={256}
                      max={2048}
                      step={256}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Overlap Ratio: {(analysisSettings.overlapRatio * 100).toFixed(0)}%</Label>
                    <Slider
                      value={[analysisSettings.overlapRatio]}
                      onValueChange={([value]) =>
                        setAnalysisSettings((prev) => ({ ...prev, overlapRatio: value }))
                      }
                      min={0}
                      max={0.9}
                      step={0.1}
                    />
                  </div>
                </div>
                <div className="border-t pt-4 space-y-3">
                  <Label className="font-semibold">Analysis Modules</Label>
                  {[
                    { key: "enableFrequencyAnalysis", label: "Frequency Analysis" },
                    { key: "enableTemporalAnalysis", label: "Temporal Analysis" },
                    { key: "enableMusicalAnalysis", label: "Musical Analysis" },
                    { key: "enableHarmonicAnalysis", label: "Harmonic Analysis" },
                    { key: "enableSpectralAnalysis", label: "Spectral Analysis" },
                    { key: "enableInstrumentDetection", label: "Instrument Detection" },
                    { key: "enableQualityMetrics", label: "Quality Metrics" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="font-normal">{label}</Label>
                      <Switch
                        checked={
                          typeof analysisSettings[key as keyof AnalysisSettings] === "boolean"
                            ? (analysisSettings[key as keyof AnalysisSettings] as boolean)
                            : false
                        }
                        onCheckedChange={(checked) =>
                          setAnalysisSettings((prev) => ({ ...prev, [key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={startAnalysis}
            disabled={isAnalyzing || uploadedFiles.length === 0}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Start Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Column - Upload & Settings */}
        <div className="space-y-6">
          {/* File Status - redirect to Dashboard if no files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {uploadedFiles.length > 0 ? `Selected Files (${uploadedFiles.length})` : 'No Audio Files'}
              </CardTitle>
              <CardDescription>
                {uploadedFiles.length > 0
                  ? 'Ready for analysis'
                  : 'Upload audio files from the Dashboard'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedFiles.length === 0 ? (
                <div className="p-6 text-center space-y-4">
                  <div className="text-center text-muted-foreground mb-2">
                    <p>No audio loaded for analysis.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <FileSelectorDialog
                      onFilesSelected={(files) => handleFileUpload(files)}
                      trigger={
                        <Button variant="default">
                          <Layers className="h-4 w-4 mr-2" />
                          Select from Library
                        </Button>
                      }
                    />
                    <Button
                      onClick={() => window.location.href = '/dashboard'}
                      variant="outline"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <FileAudio className="h-4 w-4" />
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Results List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="h-5 w-5" />
                Analysis Results
              </CardTitle>
              <CardDescription>
                {results.length} file(s) analyzed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No analysis results yet</p>
                  <p className="text-sm">Upload files and start analysis</p>
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
                            {Math.floor(result.duration / 60)}:
                            {(result.duration % 60).toFixed(0).padStart(2, "0")}
                            <Activity className="h-3 w-3" />
                            {result.sampleRate} Hz
                            <Volume2 className="h-3 w-3" />
                            {result.bitDepth} bit
                            <TrendingUp className="h-3 w-3" />
                            {result.tempo} BPM
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {result.detectedInstruments.map((instrument, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {instrument.instrument}
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

          {/* Detailed Analysis */}
          {selectedResult && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Detailed Analysis
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportCSV(selectedResult)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportAnalysis(selectedResult)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      JSON
                    </Button>
                  </div>
                </div>
                <CardDescription>{selectedResult.fileName}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="frequency">Frequency</TabsTrigger>
                    <TabsTrigger value="temporal">Temporal</TabsTrigger>
                    <TabsTrigger value="musical">Musical</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">Duration</p>
                              <p className="text-lg font-bold">
                                {Math.floor(selectedResult.duration / 60)}:
                                {(selectedResult.duration % 60)
                                  .toFixed(0)
                                  .padStart(2, "0")}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-sm font-medium">Sample Rate</p>
                              <p className="text-lg font-bold">
                                {selectedResult.sampleRate} Hz
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4 text-orange-500" />
                            <div>
                              <p className="text-sm font-medium">Bit Depth</p>
                              <p className="text-lg font-bold">
                                {selectedResult.bitDepth} bit
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Headphones className="h-4 w-4 text-purple-500" />
                            <div>
                              <p className="text-sm font-medium">Channels</p>
                              <p className="text-lg font-bold">
                                {selectedResult.channels}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            File Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Format:</span>
                            <span>{selectedResult.format}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Codec:</span>
                            <span>{selectedResult.codec}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Bitrate:</span>
                            <span>{selectedResult.bitrate} kbps</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>File Size:</span>
                            <span>{selectedResult.fileSize}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Quality Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>SNR:</span>
                            <span>
                              {selectedResult.signalToNoiseRatio.toFixed(1)} dB
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>THD:</span>
                            <span>
                              {selectedResult.totalHarmonicDistortion.toFixed(
                                2
                              )}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Dynamic Range:</span>
                            <span>
                              {selectedResult.dynamicRangeDb.toFixed(1)} dB
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>RMS Level:</span>
                            <span>
                              {(selectedResult.rmsLevel * 100).toFixed(1)}%
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="frequency" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Frequency Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Dominant Frequency:</span>
                            <span>
                              {selectedResult.dominantFrequency.toFixed(1)} Hz
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Fundamental:</span>
                            <span>
                              {selectedResult.fundamentalFrequency.toFixed(1)}{" "}
                              Hz
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Spectral Centroid:</span>
                            <span>
                              {selectedResult.spectralCentroid.toFixed(1)} Hz
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Spectral Rolloff:</span>
                            <span>
                              {selectedResult.spectralRolloff.toFixed(1)} Hz
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Harmonic Content
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Overtones:</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedResult.overtones
                                .slice(0, 6)
                                .map((freq, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {freq.toFixed(0)} Hz
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Frequency Spectrum</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={selectedResult.frequencySpectrum.map((v, i) => ({ freq: i * (selectedResult.sampleRate / 2 / selectedResult.frequencySpectrum.length), val: v }))}>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                              <XAxis
                                dataKey="freq"
                                tickFormatter={(v) => `${v.toFixed(0)}`}
                                type="number"
                                domain={[0, 'auto']}
                                label={{ value: 'Hz', position: 'insideBottomRight', offset: -5 }}
                              />
                              <YAxis hide domain={[0, 1]} />
                              <Tooltip
                                formatter={(value: number) => [value.toFixed(4), 'Magnitude']}
                                labelFormatter={(label: number) => `${label.toFixed(0)} Hz`}
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                              />
                              <Area type="monotone" dataKey="val" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="temporal" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Amplitude Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>RMS Level:</span>
                            <span>
                              {(selectedResult.rmsLevel * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Peak Level:</span>
                            <span>
                              {(selectedResult.peakLevel * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Dynamic Range:</span>
                            <span>
                              {selectedResult.dynamicRange.toFixed(1)} dB
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Zero Crossing Rate:</span>
                            <span>
                              {selectedResult.zeroCrossingRate.toFixed(4)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Spectral Features
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Spectral Flux:</span>
                            <span>
                              {selectedResult.spectralFlux.toFixed(4)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Spectral Centroid:</span>
                            <span>
                              {selectedResult.spectralCentroid.toFixed(1)} Hz
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Spectral Rolloff:</span>
                            <span>
                              {selectedResult.spectralRolloff.toFixed(1)} Hz
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Amplitude Envelope</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={selectedResult.amplitudeEnvelope.map((v, i) => ({ time: (i / selectedResult.amplitudeEnvelope.length) * selectedResult.duration, val: v }))}>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                              <XAxis
                                dataKey="time"
                                tickFormatter={(v) => `${v.toFixed(1)}s`}
                                label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5 }}
                              />
                              <YAxis hide domain={[0, 1]} />
                              <Tooltip
                                formatter={(value: number) => [value.toFixed(4), 'Amplitude']}
                                labelFormatter={(label: number) => `${label.toFixed(2)}s`}
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                              />
                              <Area type="monotone" dataKey="val" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="musical" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Musical Properties
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Tempo:</span>
                            <span>{selectedResult.tempo} BPM</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Key Signature:</span>
                            <span>
                              {selectedResult.keySignature}{" "}
                              {selectedResult.mode}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Time Signature:</span>
                            <span>{selectedResult.timeSignature}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Detected Instruments
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedResult.detectedInstruments.map(
                              (instrument, idx) => (
                                <div key={idx} className="p-2 border rounded">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">
                                      {instrument.instrument}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {(instrument.confidence * 100).toFixed(0)}
                                      %
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {instrument.characteristics.map(
                                      (char, charIdx) => (
                                        <Badge
                                          key={charIdx}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {char}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {selectedResult.pitchContour && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Pitch Contour (Melody)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={selectedResult.pitchContour}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis
                                  dataKey="time"
                                  tickFormatter={(v) => `${v.toFixed(1)}s`}
                                  label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5 }}
                                />
                                <YAxis
                                  dataKey="frequency"
                                  label={{ value: 'Hz', angle: -90, position: 'insideLeft' }}
                                  domain={['auto', 'auto']}
                                />
                                <Tooltip
                                  formatter={(value: number) => [value.toFixed(1) + ' Hz', 'Frequency']}
                                  labelFormatter={(label: number) => `${label.toFixed(2)}s`}
                                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="frequency"
                                  stroke="#f59e0b"
                                  dot={false}
                                  strokeWidth={2}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">
                  Analyzing audio files...
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
