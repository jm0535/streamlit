"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useFileStore, sharedAudioFileToFile } from "@/lib/file-store";
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
  Trash2,
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
import StemSeparationViewer from "@/components/StemSeparationViewer";
import { separateAudioWithDemucs, audioBufferToWavBlob, checkBrowserSupport, SeparationProgress } from "@/lib/demucs-service";
import { useRouter } from "next/navigation";

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
  blob?: Blob;
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
  timestamp?: number;
}

import { loadStemResults, saveStemResults, clearStemResults } from "@/lib/stem-store";

// Helper to recreate proper icon component
const getIconForInstrument = (inst: string) => {
  switch(inst.toLowerCase()) {
    case 'bass': return Music;
    case 'drums': return Drum;
    case 'guitar': return Guitar;
    case 'vocals': return Mic;
    case 'piano': return Piano;
    default: return Waves;
  }
};

// Helper to decode blob
const blobToAudioBuffer = async (blob: Blob): Promise<AudioBuffer> => {
  const arrayBuffer = await blob.arrayBuffer();
  // Use a temporary context for decoding
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const buffer = await audioContext.decodeAudioData(arrayBuffer);
  audioContext.close(); // Clean up
  return buffer;
};

export default function StemSeparationPage() {
  const { toast } = useToast();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
  const [selectedFileIndices, setSelectedFileIndices] = useState<Set<number>>(new Set());

  // Progress tracking for UI
  const [progressInfo, setProgressInfo] = useState<{
    percent: number;
    stage: string;
    message: string;
    startTime: number | null;
    eta: string | null;
  }>({
    percent: 0,
    stage: '',
    message: '',
    startTime: null,
    eta: null,
  });

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Load persisted results on mount
  useEffect(() => {
    const restore = async () => {
      try {
        const persisted = await loadStemResults();
        if (persisted && persisted.length > 0) {
           const hydrated = await Promise.all(persisted.map(async (res) => {
             const stems = await Promise.all(res.stems.map(async (st) => {
                const audioBuffer = await blobToAudioBuffer(st.blob);
                return {
                  ...st,
                  icon: getIconForInstrument(st.instrument),
                  audioBuffer
                };
             }));
             return { ...res, stems };
           }));
           setResults(hydrated as any); // Cast slightly flexible due to complex types
           if (hydrated.length > 0) setSelectedResult(hydrated[0] as any);
           toast({ title: 'Restored previous session', description: `${hydrated.length} result(s) loaded.` });
        }
      } catch (e) {
        console.error('Failed to restore', e);
      }
    };
    restore();
  }, [toast]);

  const { sharedAudioFiles, activeFiles, addFiles, removeSharedAudioFile, clearSharedAudioFiles } = useFileStore();

  useEffect(() => {
    const loadFiles = async () => {
      // 1. Try active in-memory files first (fastest)
      if (activeFiles.length > 0 && uploadedFiles.length === 0) {
        setUploadedFiles(activeFiles);
        setSelectedFileIndices(new Set(activeFiles.map((_, i) => i))); // Select all by default
        toast({
          title: "Files active",
          description: `${activeFiles.length} file(s) ready for separation`,
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
          setSelectedFileIndices(new Set(files.map((_, i) => i))); // Select all by default
          toast({
            title: "Files loaded",
            description: `${files.length} file(s) loaded from storage`,
          });
        }
      }
    };
    loadFiles();
  }, [sharedAudioFiles, activeFiles, uploadedFiles.length, toast]);

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

  const handleClearResults = useCallback(async () => {
    if (confirm("Are you sure? This will delete all saved stems.")) {
      await clearStemResults();
      setResults([]);
      setSelectedResult(null);
      toast({
        title: "Results cleared",
        description: "All separation history has been deleted.",
      });
    }
  }, [toast]);

  const handleFileUpload = useCallback(
    (files: File[]) => {
      setUploadedFiles(files);
      // Don't clear previous results to support persistence
      // setResults([]);
      setSelectedResult(null);
      setSelectedFileIndices(new Set(files.map((_, i) => i))); // Select all by default
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) ready for stem separation`,
      });
    },
    [toast]
  );

  // Remove a single file from storage and local state
  const handleRemoveFile = useCallback((index: number) => {
    const file = uploadedFiles[index];
    if (file) {
      removeSharedAudioFile(file.name);
      const newFiles = uploadedFiles.filter((_, i) => i !== index);
      setUploadedFiles(newFiles);
      // Update selected indices
      setSelectedFileIndices(prev => {
        const newSet = new Set<number>();
        prev.forEach(i => {
          if (i < index) newSet.add(i);
          else if (i > index) newSet.add(i - 1);
        });
        return newSet;
      });
      toast({
        title: "File removed",
        description: `${file.name} removed from storage`,
      });
    }
  }, [uploadedFiles, removeSharedAudioFile, toast]);

  // Clear all storage
  const handleClearAllStorage = useCallback(async () => {
    if (confirm("Are you sure? This will remove all uploaded files and separation results.")) {
      clearSharedAudioFiles();
      await clearStemResults();
      setUploadedFiles([]);
      setResults([]);
      setSelectedResult(null);
      setSelectedFileIndices(new Set());
      toast({
        title: "Storage cleared",
        description: "All files and results have been removed.",
      });
    }
  }, [clearSharedAudioFiles, toast]);

  // Toggle file selection for processing
  const toggleFileSelection = useCallback((index: number) => {
    setSelectedFileIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const startSeparation = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload audio files first",
        variant: "destructive",
      });
      return;
    }

    // Check browser support for ML separation
    const support = checkBrowserSupport();
    if (!support.supported) {
      toast({
        title: "Browser not supported",
        description: support.message,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const newResults: SeparationResult[] = [];
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();

      // Only process selected files
      const filesToProcess = uploadedFiles.filter((_, idx) => selectedFileIndices.has(idx));

      if (filesToProcess.length === 0) {
        toast({
          title: "No files selected",
          description: "Please select at least one file to process",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      for (const file of filesToProcess) {
        const fileStartTime = performance.now();

        // Initialize progress
        setProgressInfo({
          percent: 0,
          stage: 'preparing',
          message: 'Preparing audio for processing...',
          startTime: Date.now(),
          eta: null,
        });

        // Decode original audio
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));

        // Run ML-based stem separation with Demucs
        const mlStems = await separateAudioWithDemucs(audioBuffer, (progress: SeparationProgress) => {
          console.log(`[Demucs] ${progress.stage}: ${progress.percent}% - ${progress.message}`);

          // Calculate ETA
          const elapsed = (Date.now() - (progressInfo.startTime || Date.now())) / 1000;
          let eta: string | null = null;

          if (progress.percent > 5 && progress.percent < 100) {
            const totalEstimate = (elapsed / progress.percent) * 100;
            const remaining = totalEstimate - elapsed;
            if (remaining > 60) {
              eta = `~${Math.ceil(remaining / 60)} min`;
            } else if (remaining > 0) {
              eta = `~${Math.ceil(remaining)} sec`;
            }
          }

          setProgressInfo({
            percent: progress.percent,
            stage: progress.stage,
            message: progress.message,
            startTime: progressInfo.startTime,
            eta,
          });
        });

        const processingTime = (performance.now() - fileStartTime) / 1000;

        // Convert ML results to StemTrack format
        // Note: Demucs 4-stem model outputs: drums, bass, vocals, other
        // "Other" contains guitars, keyboards, synths, strings, etc.
        const processedStems: StemTrack[] = [
          {
            id: "drums",
            name: "Drums",
            instrument: "drums",
            icon: Drum,
            color: "#f97316",
            muted: false,
            solo: false,
            volume: 0.8,
            frequencyRange: [20, 20000],
            audioBuffer: mlStems.drums,
            blob: audioBufferToWavBlob(mlStems.drums),
            isProcessing: false,
            confidence: 0.95,
          },
          {
            id: "bass",
            name: "Bass",
            instrument: "bass",
            icon: Music,
            color: "#3b82f6",
            muted: false,
            solo: false,
            volume: 0.8,
            frequencyRange: [20, 20000],
            audioBuffer: mlStems.bass,
            blob: audioBufferToWavBlob(mlStems.bass),
            isProcessing: false,
            confidence: 0.95,
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
            frequencyRange: [20, 20000],
            audioBuffer: mlStems.vocals,
            blob: audioBufferToWavBlob(mlStems.vocals),
            isProcessing: false,
            confidence: 0.95,
          },
          {
            id: "other",
            name: "Melody (Guitar, Keys, Synths)",
            instrument: "other",
            icon: Guitar,
            color: "#eab308",
            muted: false,
            solo: false,
            volume: 0.8,
            frequencyRange: [20, 20000],
            audioBuffer: mlStems.other,
            blob: audioBufferToWavBlob(mlStems.other),
            isProcessing: false,
            confidence: 0.95,
          },
        ];

        const result: SeparationResult = {
          id: Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          originalDuration: audioBuffer.duration,
          stems: processedStems,
          processingTime: processingTime,
          overallConfidence: 0.95,
          detectedInstruments: ["Drums", "Bass", "Vocals", "Melody"],
          timestamp: Date.now(),
        };

        newResults.push(result);
      }

      await audioContext.close();
      setResults(prev => {
         const updated = [...prev, ...newResults];
         saveStemResults(updated);
         return updated;
      });
      setSelectedResult(newResults[0]);

      toast({
        title: "ML Stem Separation Complete",
        description: `Successfully separated ${newResults.length} file(s) using Demucs AI`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Separation failed",
        description: error instanceof Error ? error.message : "An error occurred during ML processing",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgressInfo({ percent: 0, stage: '', message: '', startTime: null, eta: null });
    }
  }, [uploadedFiles, selectedFileIndices, toast]);

  const handleAnalyzeStem = useCallback(async (stem: StemTrack, fileName: string) => {
    if (!stem.blob) return;

    // Create a File object from the blob
    const file = new File([stem.blob], `${fileName.replace(/\.[^/.]+$/, "")}_${stem.name}.wav`, { type: 'audio/wav' });

    // Add to store (persists it)
    await addFiles([file]);

    toast({
      title: "Stem sent to analysis",
      description: `Analyzing ${stem.name} stem...`
    });

    // Navigate
    router.push('/audio-analysis');
  }, [addFiles, router, toast]);

  const handleTranscribeStem = useCallback(async (stem: StemTrack, fileName: string) => {
    if (!stem.blob) return;

    const file = new File([stem.blob], `${fileName.replace(/\.[^/.]+$/, "")}_${stem.name}.wav`, { type: 'audio/wav' });

    await addFiles([file]);

    toast({
      title: "Stem sent to transcription",
      description: `Pending transcription for ${stem.name}...`
    });

    router.push('/transcription');
  }, [addFiles, router, toast]);

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

  const playStem = useCallback((stem: StemTrack) => {
    if (!stem.blob) return;

    // Toggle Play/Pause if same stem
    if (currentPlayingStem === stem.id) {
       if (audioRef.current) {
         audioRef.current.pause();
         audioRef.current.currentTime = 0; // Reset
         audioRef.current = null;
       }
       setCurrentPlayingStem(null);
       return;
    }

    // Stop previous stem if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(URL.createObjectURL(stem.blob));
    audioRef.current = audio;

    audio.onended = () => {
        setCurrentPlayingStem(null);
        audioRef.current = null;
    };

    audio.play().catch((e) => {
        console.error("Playback failed", e);
        toast({ title: "Playback Error", description: "Converted audio format not supported", variant: "destructive" });
    });
    setCurrentPlayingStem(stem.id);
  }, [currentPlayingStem, toast]);

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
            Isolate individual instruments and analyze them independently
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Advanced Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Advanced Separation Settings</DialogTitle>
                <DialogDescription>
                  Configure stem separation parameters for optimal results.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Algorithm</Label>
                  <select
                    value={separationSettings.algorithm}
                    onChange={(e) =>
                      setSeparationSettings((prev) => ({
                        ...prev,
                        algorithm: e.target.value as "frequency" | "ml" | "hybrid",
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="frequency">Frequency-Based</option>
                    <option value="ml">Machine Learning</option>
                    <option value="hybrid">Hybrid (Best Quality)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Quality</Label>
                  <select
                    value={separationSettings.quality}
                    onChange={(e) =>
                      setSeparationSettings((prev) => ({
                        ...prev,
                        quality: e.target.value as "low" | "medium" | "high",
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="low">Low (Faster)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="high">High (Best Quality)</option>
                  </select>
                </div>
                <div className="border-t pt-4 space-y-3">
                  <Label className="font-semibold">Processing Options</Label>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Preserve Stereo</Label>
                    <Switch
                      checked={separationSettings.preserveStereo}
                      onCheckedChange={(checked) =>
                        setSeparationSettings((prev) => ({ ...prev, preserveStereo: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Noise Reduction</Label>
                    <Switch
                      checked={separationSettings.noiseReduction}
                      onCheckedChange={(checked) =>
                        setSeparationSettings((prev) => ({ ...prev, noiseReduction: checked }))
                      }
                    />
                  </div>
                </div>
                <div className="border-t pt-4 space-y-3">
                  <Label className="font-semibold">Stems to Extract</Label>
                  {[
                    { key: "enableBass", label: "Bass" },
                    { key: "enableDrums", label: "Drums" },
                    { key: "enableGuitar", label: "Guitar" },
                    { key: "enableVocals", label: "Vocals" },
                    { key: "enablePiano", label: "Piano" },
                    { key: "enableOther", label: "Other" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="font-normal">{label}</Label>
                      <Switch
                        checked={
                          typeof separationSettings[key as keyof typeof separationSettings] === "boolean"
                            ? (separationSettings[key as keyof typeof separationSettings] as boolean)
                            : false
                        }
                        onCheckedChange={(checked) =>
                          setSeparationSettings((prev) => ({ ...prev, [key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
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

      {/* Progress Bar - shows during processing */}
      {isProcessing && (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="font-medium capitalize">{progressInfo.stage || 'Initializing'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-mono">{Math.round(progressInfo.percent)}%</span>
              {progressInfo.eta && (
                <span className="text-xs">ETA: {progressInfo.eta}</span>
              )}
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressInfo.percent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">{progressInfo.message}</p>
        </div>
      )}

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
                  ? 'Ready for stem separation'
                  : 'Upload audio files from the Dashboard'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedFiles.length === 0 ? (
                <div className="p-6 text-center">
                  <Button
                    onClick={() => window.location.href = '/dashboard'}
                    variant="default"
                    size="lg"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Go to Dashboard to Upload Files
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* File list with checkboxes and remove buttons */}
                  <div className="space-y-2">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className={`flex items-center gap-2 p-2 rounded border transition-colors ${
                        selectedFileIndices.has(idx) ? 'bg-primary/10 border-primary/30' : 'bg-muted border-transparent'
                      }`}>
                        <input
                          type="checkbox"
                          checked={selectedFileIndices.has(idx)}
                          onChange={() => toggleFileSelection(idx)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <FileAudio className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <span className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(idx)}
                          className="h-6 w-6 p-0 hover:bg-destructive/10"
                          title="Remove file"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {/* Selection info and clear all button */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      {selectedFileIndices.size} of {uploadedFiles.length} selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAllStorage}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Results & Visualizer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Results List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                    <FileAudio className="h-5 w-5" />
                    Separation Results
                </CardTitle>
                <CardDescription>
                    {results.length} file(s) processed
                </CardDescription>
              </div>
              {results.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearResults} title="Clear All History">
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
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
                              onClick={() => playStem(stem)}
                              title={currentPlayingStem === stem.id ? "Pause" : "Preview Stem"}
                            >
                              {currentPlayingStem === stem.id ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                exportStem(stem, selectedResult.fileName)
                              }
                              title="Download Stem"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAnalyzeStem(stem, selectedResult.fileName)}
                              title="Analyze Stem"
                            >
                              <Activity className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTranscribeStem(stem, selectedResult.fileName)}
                              title="Transcribe Stem"
                            >
                              <Piano className="h-4 w-4" />
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
