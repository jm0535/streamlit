'use client';

import React, { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PianoRoll } from '@/components/piano-roll';
import { AudioFileUpload } from '@/components/audio-file-upload';
import { Note, createMIDI, downloadMIDIFromNotes } from '@/lib/midi-utils';
import { exportPianoRollToPDF } from '@/lib/pdf-export';
import { loadAndAnalyzeAudio } from '@/lib/audio-analysis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Music,
  Upload,
  FileAudio,
  Download,
  FileText,
  Loader2,
  Piano,
  Sparkles,
  Wand2,
  Save,
  FolderOpen,
  Plus,
} from 'lucide-react';

export default function PianoRollPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [duration, setDuration] = useState(30);
  const [tempo, setTempo] = useState(120);
  const [fileName, setFileName] = useState<string>('');

  // Demo notes for empty state
  const demoNotes: Note[] = [
    { midi: 60, name: 'C4', octave: 4, frequency: 261.63, startTime: 0, duration: 0.5, velocity: 100, confidence: 1 },
    { midi: 64, name: 'E4', octave: 4, frequency: 329.63, startTime: 0.5, duration: 0.5, velocity: 90, confidence: 1 },
    { midi: 67, name: 'G4', octave: 4, frequency: 392.00, startTime: 1.0, duration: 0.5, velocity: 85, confidence: 1 },
    { midi: 72, name: 'C5', octave: 5, frequency: 523.25, startTime: 1.5, duration: 1.0, velocity: 100, confidence: 1 },
  ];

  // Process audio file
  const handleProcessFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setFileName(file.name);

    try {
      toast({
        title: 'Processing audio...',
        description: 'Analyzing audio and extracting notes',
      });

      setProcessingProgress(20);

      const result = await loadAndAnalyzeAudio(file, {
        threshold: 0.05,
        minNoteDuration: 0.1,
        enableTempoDetection: true,
      });

      setProcessingProgress(80);

      setNotes(result.notes);
      setDuration(Math.ceil(result.duration) + 5);
      if (result.detectedTempo) {
        setTempo(result.detectedTempo);
      }

      setProcessingProgress(100);

      toast({
        title: 'Analysis complete!',
        description: `Detected ${result.notes.length} notes in ${result.duration.toFixed(1)}s`,
      });
    } catch (error) {
      toast({
        title: 'Processing failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  // Handle file upload
  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      handleProcessFile(newFiles[0]);
    }
  }, [handleProcessFile]);

  // Export MIDI
  const handleExportMIDI = useCallback(() => {
    if (notes.length === 0) {
      toast({
        title: 'No notes to export',
        description: 'Add some notes or upload an audio file first',
        variant: 'destructive',
      });
      return;
    }

    try {
      downloadMIDIFromNotes(notes, fileName ? fileName.replace(/\.[^/.]+$/, '.mid') : 'composition.mid');
      toast({
        title: 'MIDI exported!',
        description: 'Your MIDI file has been downloaded',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  }, [notes, fileName, toast]);

  // Export PDF
  const handleExportPDF = useCallback(() => {
    if (notes.length === 0) {
      toast({
        title: 'No notes to export',
        description: 'Add some notes or upload an audio file first',
        variant: 'destructive',
      });
      return;
    }

    try {
      exportPianoRollToPDF(notes, {
        title: fileName || 'Composition',
        tempo,
        duration,
      });
      toast({
        title: 'PDF exported!',
        description: 'Your PDF has been downloaded',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  }, [notes, fileName, tempo, duration, toast]);

  // Handle notes change from piano roll
  const handleNotesChange = useCallback((newNotes: Note[]) => {
    setNotes(newNotes);
  }, []);

  // Load demo
  const handleLoadDemo = useCallback(() => {
    setNotes(demoNotes);
    setDuration(10);
    setTempo(120);
    setFileName('Demo Composition');
    toast({
      title: 'Demo loaded',
      description: 'Try editing the notes or playing the composition',
    });
  }, [toast]);

  // Clear all
  const handleClear = useCallback(() => {
    setNotes([]);
    setFiles([]);
    setFileName('');
    toast({
      title: 'Cleared',
      description: 'All notes have been removed',
    });
  }, [toast]);

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Piano className="h-8 w-8" />
            Piano Roll Editor
          </h1>
          <p className="text-muted-foreground mt-1">
            DAW-style visual note editor with playback and export
          </p>
        </div>
        <div className="flex items-center gap-2">
          {fileName && (
            <Badge variant="outline" className="text-sm">
              <FileAudio className="h-3 w-3 mr-1" />
              {fileName}
            </Badge>
          )}
          <Badge variant="secondary">
            {notes.length} notes
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="editor" className="space-y-6">
        <TabsList>
          <TabsTrigger value="editor">
            <Music className="h-4 w-4 mr-2" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Button onClick={handleLoadDemo} variant="outline">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Load Demo
                </Button>
                <Button onClick={() => setNotes([])} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New Composition
                </Button>
                <div className="flex-1" />
                <Button onClick={handleExportMIDI} variant="outline" disabled={notes.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export MIDI
                </Button>
                <Button onClick={handleExportPDF} variant="outline" disabled={notes.length === 0}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Piano Roll */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Visual Note Editor
              </CardTitle>
              <CardDescription>
                Click on the grid to add notes • Click a note to select • Use toolbar to control playback
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <PianoRoll
                notes={notes}
                onNotesChange={handleNotesChange}
                duration={duration}
                tempo={tempo}
                isReadOnly={false}
                onExportMIDI={handleExportMIDI}
                onExportPDF={handleExportPDF}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Audio File
              </CardTitle>
              <CardDescription>
                Upload an audio file to automatically extract notes and display in the piano roll
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AudioFileUpload
                files={files}
                onFilesChange={handleFilesChange}
                maxFiles={1}
              />

              {isProcessing && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Processing audio...</span>
                  </div>
                  <Progress value={processingProgress} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Formats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['MP3', 'WAV', 'FLAC', 'M4A', 'OGG', 'WEBM', 'AAC', 'WMA'].map((format) => (
                  <Badge key={format} variant="outline" className="justify-center py-2">
                    {format}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Use the <strong>zoom controls</strong> to see more detail or fit more notes on screen</li>
            <li>• Press <strong>Play</strong> to hear your composition with the built-in synthesizer</li>
            <li>• <strong>Click on the grid</strong> to add new notes at that position</li>
            <li>• Export to <strong>MIDI</strong> for use in other DAWs or music software</li>
            <li>• Export to <strong>PDF</strong> for printing or sharing as sheet music</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
