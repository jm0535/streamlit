'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useFileStore, convertToSharedNotes, fileToSharedAudioFile } from '@/lib/file-store';
import {
  Mic,
  Play,
  Pause,
  Download,
  Upload,
  Settings,
  FileAudio,
  BarChart3,
  Music2,
  Piano,
  Guitar,
  Drum,
  Volume2,
  Activity,
  Clock,
  TrendingUp,
  Zap,
  Headphones,
  Sliders,
  Save,
  FileText,
  Database,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AudioFileUpload } from '@/components/audio-file-upload';
import { AudioVisualizer } from '@/components/audio-visualizer';
import { MetadataForm, Metadata } from '@/components/metadata-form';
import { PitchAnalysis } from '@/components/pitch-analysis';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { transcribeWithBasicPitch, isBasicPitchAvailable } from "@/lib/basic-pitch-service";
import { loadTranscriptionResults, saveTranscriptionResults, clearTranscriptionResults } from "@/lib/transcription-store";

interface TranscriptionResult {
  id: string;
  fileName: string;
  duration: number;
  notes: Array<{
    pitch: number;
    startTime: number;
    duration: number;
    velocity: number;
    confidence: number;
  }>;
  midiData: string;
  confidence: number;
  detectedInstruments: string[];
  tempo: number;
  keySignature: string;
  timeSignature: string;
  processingTime: number;
}

interface ProcessingSettings {
  sensitivity: number;
  minNoteDuration: number;
  tempoDetection: boolean;
  keyDetection: boolean;
  instrumentDetection: boolean;
  noiseReduction: boolean;
  pitchBend: boolean;
  velocitySensitivity: number;
}

export default function TranscriptionPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ percent: 0, status: '' });
  const [results, setResults] = useState<TranscriptionResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<TranscriptionResult | null>(null);
  const [currentMetadata, setCurrentMetadata] = useState<Metadata>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Get pending files and piano roll functions from file store
  const {
    pendingFiles,
    clearPendingFiles,
    setPianoRollNotes,
    setActiveFiles,
    setHasTranscriptionResults,
    addSharedAudioFile,
  } = useFileStore();

  const [processingSettings, setProcessingSettings] = useState<ProcessingSettings>({
    sensitivity: 0.7,
    minNoteDuration: 0.1,
    tempoDetection: true,
    keyDetection: true,
    instrumentDetection: true,
    noiseReduction: true,
    pitchBend: true,
    velocitySensitivity: 0.8
  });

  // Load files from store on mount (when navigating from Dashboard)
  useEffect(() => {
    if (pendingFiles.length > 0) {
      setUploadedFiles(pendingFiles);
      clearPendingFiles();
      toast({
        title: 'Files loaded',
        description: `${pendingFiles.length} file(s) ready for transcription`,
      });
    }
  }, [pendingFiles, clearPendingFiles, toast]);

  // Load transcription results from IDB on mount
  useEffect(() => {
    const load = async () => {
      try {
        const storedResults = await loadTranscriptionResults();
        if (storedResults && storedResults.length > 0) {
          setResults(storedResults as any);
          if (storedResults.length > 0) setSelectedResult(storedResults[0] as any);
          console.log('📂 Loaded transcription results from IDB:', storedResults.length);
        }
      } catch (err) {
        console.error('Failed to load transcription results:', err);
      }
    };
    load();
  }, []);

  // Save transcription results to IDB whenever they change
  useEffect(() => {
    if (results.length > 0) {
        saveTranscriptionResults(results as any);
        console.log('💾 Saved transcription results to IDB:', results.length);
    }
  }, [results]);

  const handleFileUpload = useCallback((files: File[]) => {
    setUploadedFiles(files);
    // Don't clear previous results to persist
    // setResults([]);
    setSelectedResult(null);
    toast({
      title: "Files uploaded",
      description: `${files.length} file(s) ready for transcription`,
    });
  }, [toast]);

  const startTranscription = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload audio files first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress({ percent: 0, status: 'Initializing...' });

    try {
      const newResults: TranscriptionResult[] = [];

      for (let fileIndex = 0; fileIndex < uploadedFiles.length; fileIndex++) {
        const file = uploadedFiles[fileIndex];
        const fileProgress = (fileIndex / uploadedFiles.length) * 100;

        setProcessingProgress({
          percent: fileProgress,
          status: `Processing ${file.name} (${fileIndex + 1}/${uploadedFiles.length})...`
        });

        // Decode audio file to AudioBuffer
        const arrayBuffer = await file.arrayBuffer();
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const startTime = performance.now();

        // Use Basic Pitch ML for transcription
        const transcriptionResult = await transcribeWithBasicPitch(
          audioBuffer,
          {
            onsetThreshold: processingSettings.sensitivity,
            frameThreshold: processingSettings.sensitivity * 0.6,
            minNoteLength: Math.round(processingSettings.minNoteDuration * 86), // Convert seconds to frames
            includePitchBends: processingSettings.pitchBend,
            inferOnsets: true,
            melodiaTrick: true,
          },
          (progress) => {
            const totalProgress = fileProgress + (progress.percentComplete / uploadedFiles.length);
            setProcessingProgress({
              percent: totalProgress,
              status: `${file.name}: ${progress.status}`
            });
          }
        );

        const processingTime = (performance.now() - startTime) / 1000;

        // Convert to TranscriptionResult format
        const result: TranscriptionResult = {
          id: Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          duration: transcriptionResult.duration,
          notes: transcriptionResult.notes.map(note => ({
            pitch: note.midi,
            startTime: note.startTime,
            duration: note.duration,
            velocity: note.velocity,
            confidence: note.confidence,
          })),
          midiData: 'basic-pitch-transcription',
          confidence: transcriptionResult.confidence,
          detectedInstruments: ['Detected via ML'],
          tempo: transcriptionResult.tempo,
          keySignature: detectKeySignature(transcriptionResult.notes),
          timeSignature: '4/4', // Tempo-based detection could be added
          processingTime,
        };

        newResults.push(result);
        await audioContext.close();

        // Share this audio file with other processing pages
        const sharedFile = await fileToSharedAudioFile(file);
        addSharedAudioFile(sharedFile);
      }

      setResults(prev => [...prev, ...newResults]);
      setSelectedResult(newResults[0]);
      setProcessingProgress({ percent: 100, status: 'Complete!' });

      // Mark that we have transcription results for other pages to use
      setHasTranscriptionResults(true);
      setActiveFiles(uploadedFiles);

      toast({
        title: "Transcription complete",
        description: `Successfully processed ${newResults.length} file(s) using Basic Pitch ML`,
      });
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Transcription failed",
        description: error instanceof Error ? error.message : "An error occurred during processing",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFiles, processingSettings, toast, addSharedAudioFile, setHasTranscriptionResults, setActiveFiles]);

  // Helper function to detect key signature from notes
  function detectKeySignature(notes: any[]): string {
    if (notes.length === 0) return 'Unknown';

    // Count pitch classes
    const pitchCounts = new Array(12).fill(0);
    notes.forEach(note => {
      pitchCounts[note.midi % 12]++;
    });

    // Simple heuristic: find most common pitch class
    const maxIndex = pitchCounts.indexOf(Math.max(...pitchCounts));
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    // Check for major/minor based on third
    const majorThird = (maxIndex + 4) % 12;
    const minorThird = (maxIndex + 3) % 12;

    if (pitchCounts[majorThird] > pitchCounts[minorThird]) {
      return `${noteNames[maxIndex]} Major`;
    } else {
      return `${noteNames[maxIndex]} Minor`;
    }
  }

  const exportMIDI = useCallback((result: TranscriptionResult) => {
    // Simulate MIDI export
    const blob = new Blob([result.midiData], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.fileName.replace(/\.[^/.]+$/, '')}.mid`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "MIDI exported",
      description: `Exported ${result.fileName} as MIDI file`,
    });
  }, [toast]);

  const exportCSV = useCallback((result: TranscriptionResult) => {
    const csv = [
      'Pitch,Start Time,Duration,Velocity,Confidence',
      ...result.notes.map(note =>
        `${note.pitch},${note.startTime},${note.duration},${note.velocity},${note.confidence}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.fileName.replace(/\.[^/.]+$/, '')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV exported",
      description: `Exported ${result.fileName} as CSV file`,
    });
  }, [toast]);

  const updateSetting = useCallback((key: string, value: any) => {
    setProcessingSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mic className="h-8 w-8 text-primary" />
            Audio Transcription
          </h1>
          <p className="text-muted-foreground">
            Convert audio files to MIDI with advanced pitch detection and analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Settings Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Advanced Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Processing Settings</DialogTitle>
                <DialogDescription>
                  Configure how audio files are transcribed
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Sensitivity: {Math.round(processingSettings.sensitivity * 100)}%</Label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={processingSettings.sensitivity * 100}
                    onChange={(e) => updateSetting('sensitivity', parseInt(e.target.value) / 100)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Note Duration: {processingSettings.minNoteDuration * 1000}ms</Label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="50"
                    value={processingSettings.minNoteDuration * 1000}
                    onChange={(e) => updateSetting('minNoteDuration', parseInt(e.target.value) / 1000)}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Tempo Detection</Label>
                  <Switch
                    checked={processingSettings.tempoDetection}
                    onCheckedChange={(checked) => updateSetting('tempoDetection', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Key Detection</Label>
                  <Switch
                    checked={processingSettings.keyDetection}
                    onCheckedChange={(checked) => updateSetting('keyDetection', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Instrument Detection</Label>
                  <Switch
                    checked={processingSettings.instrumentDetection}
                    onCheckedChange={(checked) => updateSetting('instrumentDetection', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Noise Reduction</Label>
                  <Switch
                    checked={processingSettings.noiseReduction}
                    onCheckedChange={(checked) => updateSetting('noiseReduction', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Pitch Bend Detection</Label>
                  <Switch
                    checked={processingSettings.pitchBend}
                    onCheckedChange={(checked) => updateSetting('pitchBend', checked)}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={startTranscription}
            disabled={isProcessing || uploadedFiles.length === 0}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Start Transcription
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Files & Settings */}
        <div className="space-y-6">
          {/* Selected Files or Go to Dashboard prompt */}
          {uploadedFiles.length === 0 && results.length === 0 ? (
            <div className="form-container form-container-md">
              <div className="form-section">
                <div className="form-section-header">
                  <h2 className="form-section-title flex items-center gap-2">
                    <FileAudio className="h-5 w-5" />
                    No Audio Files
                  </h2>
                  <p className="form-section-description">Upload audio files from the Dashboard to start transcription</p>
                </div>
                <div className="p-6 text-center">
                  <Button
                    onClick={() => router.push('/dashboard')}
                    variant="default"
                    size="lg"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Go to Dashboard to Upload Files
                  </Button>
                </div>
              </div>
            </div>
          ) : uploadedFiles.length > 0 ? (
            <div className="form-container form-container-md">
              <div className="form-section">
                <div className="form-section-header">
                  <h2 className="form-section-title flex items-center gap-2">
                    <FileAudio className="h-5 w-5" />
                    Selected Files ({uploadedFiles.length})
                  </h2>
                  <p className="form-section-description">Ready for transcription</p>
                </div>
                <div className="space-y-2 p-4">
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <FileAudio className="h-4 w-4" />
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Middle Column - Results */}
        <div className="space-y-6">
          <div className="form-container form-container-md">
            <div className="form-section">
              <div className="form-section-header">
                <h2 className="form-section-title flex items-center gap-2">
                  <FileAudio className="h-5 w-5" />
                  Transcription Results
                </h2>
                <p className="form-section-description">{results.length} file(s) processed</p>
              </div>
              <div className="form-field form-field-lg">
                {results.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileAudio className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No transcriptions yet</p>
                    <p className="text-sm">Upload files and start processing</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {results.map((result) => (
                      <div
                        key={result.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedResult?.id === result.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedResult(result)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{result.fileName}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {Math.floor(result.duration / 60)}:{(result.duration % 60).toFixed(0).padStart(2, '0')}
                              <TrendingUp className="h-3 w-3" />
                              {(result.confidence * 100).toFixed(1)}% confidence
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {result.detectedInstruments.map((instrument, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {instrument}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {selectedResult && (
            <div className="form-container form-container-md">
              <div className="form-section">
                <div className="form-section-header">
                  <h2 className="form-section-title flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analysis Details
                  </h2>
                  <p className="form-section-description">{selectedResult.fileName}</p>
                </div>
                <div className="space-y-4">
                  <div className="form-grid form-grid-2">
                    <div className="form-field">
                      <div className="text-sm">
                        <div className="font-medium">Tempo:</div>
                        <div>{selectedResult.tempo} BPM</div>
                      </div>
                    </div>
                    <div className="form-field">
                      <div className="text-sm">
                        <div className="font-medium">Key:</div>
                        <div>{selectedResult.keySignature}</div>
                      </div>
                    </div>
                    <div className="form-field">
                      <div className="text-sm">
                        <div className="font-medium">Time Signature:</div>
                        <div>{selectedResult.timeSignature}</div>
                      </div>
                    </div>
                    <div className="form-field">
                      <div className="text-sm">
                        <div className="font-medium">Notes Detected:</div>
                        <div>{selectedResult.notes.length}</div>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <Button
                      onClick={() => exportMIDI(selectedResult)}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      MIDI
                    </Button>
                    <Button
                      onClick={() => exportCSV(selectedResult)}
                      variant="outline"
                      className="flex-1"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                  <Button
                    onClick={() => {
                      // Convert notes to shared format and navigate to piano roll
                      const sharedNotes = convertToSharedNotes(selectedResult.notes);
                      console.log('🎵 Sending notes to Piano Roll:', {
                        originalCount: selectedResult.notes.length,
                        sharedCount: sharedNotes.length,
                        sharedNotes
                      });

                      // Save to Zustand store
                      setPianoRollNotes(sharedNotes);

                      // ALSO save to sessionStorage as backup
                      try {
                        sessionStorage.setItem('pianoRollNotes', JSON.stringify(sharedNotes));
                        console.log('✅ Notes saved to sessionStorage');
                      } catch (err) {
                        console.error('Failed to save to sessionStorage:', err);
                      }

                      toast({
                        title: 'Opening Piano Roll...',
                        description: `Sending ${selectedResult.notes.length} notes to editor`,
                      });
                      router.push('/notes');
                    }}
                    variant="default"
                    className="w-full mt-2"
                  >
                    <Piano className="h-4 w-4 mr-2" />
                    View in Piano Roll
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pitch Analysis Visualization */}
      {selectedResult && selectedResult.notes.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Pitch Analysis</h2>
          <PitchAnalysis
            notes={selectedResult.notes.map(note => ({
              pitch: note.pitch,
              startTime: note.startTime,
              duration: note.duration,
              velocity: note.velocity,
            }))}
          />
        </div>
      )}

      {/* Progress Bar */}
      {isProcessing && (
        <div className="form-container form-container-md">
          <div className="form-section">
            <div className="form-field">
              <div className="flex items-center gap-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">
                      {processingProgress.status || 'Processing audio files...'}
                    </p>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(processingProgress.percent)}%
                    </span>
                  </div>
                  <Progress value={processingProgress.percent} className="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
