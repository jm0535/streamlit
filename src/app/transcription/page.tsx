'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
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
// import { MusicologyMetadataForm } from '@/components/musicology-metadata-form';
// import { DEFAULT_HISTORICAL, DisciplineConfig } from '@/lib/musicology-metadata';

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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<TranscriptionResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<TranscriptionResult | null>(null);
  const [currentMetadata, setCurrentMetadata] = useState<Metadata>({});
  // const [musicologyConfig, setMusicologyConfig] = useState({
  //   discipline: 'historical' as const,
  //   historical: DEFAULT_HISTORICAL,
  // });
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
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

  const handleFileUpload = useCallback((files: File[]) => {
    setUploadedFiles(files);
    setResults([]);
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
    
    try {
      // Simulate processing for each file
      const newResults: TranscriptionResult[] = [];
      
      for (const file of uploadedFiles) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockResult: TranscriptionResult = {
          id: Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          duration: Math.random() * 300 + 60, // 1-6 minutes
          notes: Array.from({ length: Math.floor(Math.random() * 200) + 50 }, (_, i) => ({
            pitch: Math.floor(Math.random() * 88) + 21, // Piano keys
            startTime: i * 0.1,
            duration: Math.random() * 0.5 + 0.1,
            velocity: Math.floor(Math.random() * 127),
            confidence: Math.random() * 0.3 + 0.7
          })),
          midiData: 'mock-midi-data',
          confidence: Math.random() * 0.1 + 0.9,
          detectedInstruments: ['Piano', 'Violin', 'Cello'].slice(0, Math.floor(Math.random() * 3) + 1),
          tempo: Math.floor(Math.random() * 60) + 80,
          keySignature: ['C Major', 'G Major', 'D Minor', 'A Minor'][Math.floor(Math.random() * 4)],
          timeSignature: ['4/4', '3/4', '6/8'][Math.floor(Math.random() * 3)],
          processingTime: Math.random() * 5 + 2
        };
        
        newResults.push(mockResult);
      }
      
      setResults(newResults);
      setSelectedResult(newResults[0]);
      
      toast({
        title: "Transcription complete",
        description: `Successfully processed ${newResults.length} file(s)`,
      });
    } catch (error) {
      toast({
        title: "Transcription failed",
        description: "An error occurred during processing",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFiles, toast]);

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
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Advanced Settings
          </Button>
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
        {/* Left Column - Upload & Settings */}
        <div className="space-y-6">
          {/* File Upload */}
          <div className="form-container form-container-md">
            <div className="form-section">
              <div className="form-section-header">
                <h2 className="form-section-title flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Audio Files
                </h2>
                <p className="form-section-description">Supported formats: MP3, WAV, FLAC, M4A, OGG</p>
              </div>
              <div className="form-field form-field-lg">
                <AudioFileUpload 
                  files={uploadedFiles}
                  onFilesChange={handleFileUpload}
                  maxFiles={10}
                />
              </div>
            </div>
          </div>

          {/* Processing Settings */}
          <div className="form-container form-container-md">
            <div className="form-section">
              <div className="form-section-header">
                <h2 className="form-section-title flex items-center gap-2">
                  <Sliders className="h-5 w-5" />
                  Processing Settings
                </h2>
              </div>
              <div className="space-y-4">
                <div className="form-field">
                  <label htmlFor="sensitivity-slider" className="form-label">Sensitivity</label>
                  <input
                    id="sensitivity-slider"
                    type="range"
                    min="0"
                    max="100"
                    value={processingSettings.sensitivity * 100}
                    onChange={(e) => updateSetting('sensitivity', parseInt(e.target.value) / 100)}
                    className="w-full"
                    aria-label="Sensitivity control for transcription accuracy"
                    title="Adjust sensitivity for note detection"
                  />
                  <p className="form-helper-text">{Math.round(processingSettings.sensitivity * 100)}%</p>
                </div>
                
                <div className="form-field">
                  <label htmlFor="duration-slider" className="form-label">Minimum Note Duration</label>
                  <input
                    id="duration-slider"
                    type="range"
                    min="50"
                    max="500"
                    step="50"
                    value={processingSettings.minNoteDuration * 1000}
                    onChange={(e) => updateSetting('minNoteDuration', parseInt(e.target.value) / 1000)}
                    className="w-full"
                    aria-label="Minimum note duration in milliseconds"
                    title="Set the minimum duration for detected notes"
                  />
                  <p className="form-helper-text">{processingSettings.minNoteDuration * 1000}ms</p>
                </div>
              </div>
            </div>
          </div>
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
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="form-container form-container-md">
          <div className="form-section">
            <div className="form-field">
              <div className="flex items-center gap-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">Processing audio files...</p>
                  <Progress value={undefined} className="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
