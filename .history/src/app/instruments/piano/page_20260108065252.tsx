'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Piano,
  Upload,
  Play,
  Pause,
  Download,
  Settings,
  FileAudio,
  Volume2,
  Activity,
  Clock,
  TrendingUp,
  Zap,
  Music,
  Music2,
  Waves,
  BarChart3,
  Loader2,
  CheckCircle,
  AlertCircle,
  Keyboard,
  Ear,
  Mic,
  Headphones,
  Sliders,
  Save
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AudioFileUpload } from '@/components/audio-file-upload';
import { AudioVisualizer } from '@/components/audio-visualizer';

interface PianoNote {
  midi: number;
  name: string;
  frequency: number;
  velocity: number;
  startTime: number;
  duration: number;
  confidence: number;
}

interface PianoAnalysisResult {
  id: string;
  fileName: string;
  duration: number;
  notes: PianoNote[];
  keySignature: string;
  tempo: number;
  timeSignature: string;
  handSeparation: {
    leftHand: PianoNote[];
    rightHand: PianoNote[];
  };
  dynamics: {
    averageVelocity: number;
    velocityRange: number;
    dynamicSegments: Array<{
      startTime: number;
      endTime: number;
      dynamic: 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff';
    }>;
  };
  technique: {
    pedalUsage: boolean;
    articulation: string[];
    ornamentation: string[];
    chords: Array<{
      startTime: number;
      notes: number[];
      type: string;
    }>;
  };
  difficulty: {
    technicalDifficulty: number;
    rhythmicComplexity: number;
    harmonicComplexity: number;
  };
}

interface PianoSettings {
  enableHandSeparation: boolean;
  enablePedalDetection: boolean;
  enableChordDetection: boolean;
  enableTechniqueAnalysis: boolean;
  enableDifficultyAssessment: boolean;
  sensitivity: number;
  minNoteDuration: number;
  velocityThreshold: number;
}

export default function PianoPage() {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<PianoAnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<PianoAnalysisResult | null>(null);
  const [currentTab, setCurrentTab] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [pianoSettings, setPianoSettings] = useState<PianoSettings>({
    enableHandSeparation: true,
    enablePedalDetection: true,
    enableChordDetection: true,
    enableTechniqueAnalysis: true,
    enableDifficultyAssessment: true,
    sensitivity: 0.7,
    minNoteDuration: 0.1,
    velocityThreshold: 20
  });

  const handleFileUpload = useCallback((files: File[]) => {
    setUploadedFiles(files);
    setResults([]);
    setSelectedResult(null);
    toast({
      title: "Files uploaded",
      description: `${files.length} piano file(s) ready for analysis`,
    });
  }, [toast]);

  const startPianoAnalysis = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload piano audio files first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const newResults: PianoAnalysisResult[] = [];
      
      for (const file of uploadedFiles) {
        // Simulate analysis time
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Generate mock piano notes
        const generatePianoNotes = (): PianoNote[] => {
          const notes: PianoNote[] = [];
          const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
          const currentTime = 0;
          
          for (let i = 0; i < 200; i++) {
            const octave = Math.floor(Math.random() * 4) + 3;
            const noteIndex = Math.floor(Math.random() * 12);
            const midi = (octave * 12) + noteIndex + 12;
            
            notes.push({
              midi,
              name: `${noteNames[noteIndex]}${octave}`,
              frequency: 440 * Math.pow(2, (midi - 69) / 12),
              velocity: Math.floor(Math.random() * 80) + 20,
              startTime: i * 0.2 + Math.random() * 0.1,
              duration: Math.random() * 0.5 + 0.1,
              confidence: Math.random() * 0.3 + 0.7
            });
          }
          
          return notes.sort((a, b) => a.startTime - b.startTime);
        };

        const allNotes = generatePianoNotes();
        const middleCMidi = 60;
        
        const mockResult: PianoAnalysisResult = {
          id: Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          duration: Math.random() * 300 + 60,
          notes: allNotes,
          keySignature: ['C Major', 'G Major', 'D Major', 'F Major', 'A Minor'][Math.floor(Math.random() * 5)],
          tempo: Math.floor(Math.random() * 40) + 80,
          timeSignature: ['4/4', '3/4', '2/4'][Math.floor(Math.random() * 3)],
          handSeparation: {
            leftHand: allNotes.filter(note => note.midi <= middleCMidi),
            rightHand: allNotes.filter(note => note.midi > middleCMidi)
          },
          dynamics: {
            averageVelocity: Math.random() * 40 + 40,
            velocityRange: Math.random() * 60 + 20,
            dynamicSegments: [
              { startTime: 0, endTime: 30, dynamic: 'mf' },
              { startTime: 30, endTime: 60, dynamic: 'f' },
              { startTime: 60, endTime: 90, dynamic: 'mp' }
            ]
          },
          technique: {
            pedalUsage: Math.random() > 0.5,
            articulation: ['Legato', 'Staccato', 'Slur'].slice(0, Math.floor(Math.random() * 3) + 1),
            ornamentation: ['Trill', 'Mordent', 'Turn'].slice(0, Math.floor(Math.random() * 2)),
            chords: Array.from({ length: 10 }, (_, i) => ({
              startTime: i * 5,
              notes: Array.from({ length: Math.floor(Math.random() * 3) + 2 }, () => 
                Math.floor(Math.random() * 12) + 48
              ),
              type: ['Major', 'Minor', 'Diminished'][Math.floor(Math.random() * 3)]
            }))
          },
          difficulty: {
            technicalDifficulty: Math.random() * 5 + 3,
            rhythmicComplexity: Math.random() * 5 + 2,
            harmonicComplexity: Math.random() * 5 + 2
          }
        };
        
        newResults.push(mockResult);
      }
      
      setResults(newResults);
      setSelectedResult(newResults[0]);
      
      toast({
        title: "Piano analysis complete",
        description: `Successfully analyzed ${newResults.length} piano recording(s)`,
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "An error occurred during analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [uploadedFiles, toast]);

  const exportMIDI = useCallback((result: PianoAnalysisResult) => {
    const midiData = JSON.stringify(result.notes, null, 2);
    const blob = new Blob([midiData], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.fileName.replace(/\.[^/.]+$/, '')}_piano.mid`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "MIDI exported",
      description: `Exported piano transcription as MIDI file`,
    });
  }, [toast]);

  const exportSheetMusic = useCallback((result: PianoAnalysisResult) => {
    // Simulate sheet music export
    const sheetMusicData = {
      title: result.fileName,
      keySignature: result.keySignature,
      timeSignature: result.timeSignature,
      tempo: result.tempo,
      notes: result.notes.map(note => ({
        pitch: note.name,
        duration: note.duration,
        velocity: note.velocity
      }))
    };
    
    const blob = new Blob([JSON.stringify(sheetMusicData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.fileName.replace(/\.[^/.]+$/, '')}_sheet_music.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Sheet music exported",
      description: `Exported piano sheet music data`,
    });
  }, [toast]);

  const getDynamicLabel = (velocity: number): string => {
    if (velocity < 20) return 'pp';
    if (velocity < 40) return 'p';
    if (velocity < 60) return 'mp';
    if (velocity < 80) return 'mf';
    if (velocity < 100) return 'f';
    return 'ff';
  };

  const getDifficultyLabel = (score: number): string => {
    if (score < 3) return 'Beginner';
    if (score < 5) return 'Intermediate';
    if (score < 7) return 'Advanced';
    return 'Professional';
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Piano className="h-8 w-8 text-primary" />
            Piano Analysis
          </h1>
          <p className="text-muted-foreground">
            Specialized analysis for piano recordings including hand separation, technique detection, and difficulty assessment
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Analysis Settings
          </Button>
          <Button 
            onClick={startPianoAnalysis}
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
                Analyze Piano
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
                Upload Piano Recordings
              </CardTitle>
              <CardDescription>
                Upload piano audio files for specialized analysis
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

          {/* Piano Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Analysis Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Analysis Features</label>
                <div className="space-y-2">
                  {[
                    { key: 'enableHandSeparation', label: 'Hand Separation' },
                    { key: 'enablePedalDetection', label: 'Pedal Detection' },
                    { key: 'enableChordDetection', label: 'Chord Detection' },
                    { key: 'enableTechniqueAnalysis', label: 'Technique Analysis' },
                    { key: 'enableDifficultyAssessment', label: 'Difficulty Assessment' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm">{label}</span>
                      <Switch
                        checked={pianoSettings[key as keyof PianoSettings]}
                        onCheckedChange={(checked) => setPianoSettings(prev => ({
                          ...prev,
                          [key]: checked
                        }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="sensitivity">Sensitivity</Label>
                <Slider
                  value={[pianoSettings.sensitivity]}
                  onValueChange={([value]) => setPianoSettings(prev => ({
                    ...prev,
                    sensitivity: value
                  }))}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full mt-2"
                />
                <span className="text-xs text-muted-foreground">
                  {(pianoSettings.sensitivity * 100).toFixed(0)}%
                </span>
              </div>

              <div>
                <Label htmlFor="minNoteDuration">Minimum Note Duration</Label>
                <Slider
                  value={[pianoSettings.minNoteDuration]}
                  onValueChange={([value]) => setPianoSettings(prev => ({
                    ...prev,
                    minNoteDuration: value
                  }))}
                  max={1}
                  min={0.05}
                  step={0.05}
                  className="w-full mt-2"
                />
                <span className="text-xs text-muted-foreground">
                  {pianoSettings.minNoteDuration}s
                </span>
              </div>

              <div>
                <Label htmlFor="velocityThreshold">Velocity Threshold</Label>
                <Slider
                  value={[pianoSettings.velocityThreshold]}
                  onValueChange={([value]) => setPianoSettings(prev => ({
                    ...prev,
                    velocityThreshold: value
                  }))}
                  max={127}
                  min={0}
                  step={1}
                  className="w-full mt-2"
                />
                <span className="text-xs text-muted-foreground">
                  {pianoSettings.velocityThreshold}
                </span>
              </div>
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
                {results.length} piano recording(s) analyzed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Piano className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No analysis results yet</p>
                  <p className="text-sm">Upload piano recordings and start analysis</p>
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
                            <Music className="h-3 w-3" />
                            {result.keySignature}
                            <TrendingUp className="h-3 w-3" />
                            {result.tempo} BPM
                            <Keyboard className="h-3 w-3" />
                            {result.notes.length} notes
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {getDifficultyLabel((result.difficulty.technicalDifficulty + result.difficulty.rhythmicComplexity + result.difficulty.harmonicComplexity) / 3)}
                          </Badge>
                          {result.technique.pedalUsage && (
                            <Badge variant="secondary" className="text-xs">
                              Pedal
                            </Badge>
                          )}
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
                    <Music2 className="h-5 w-5" />
                    Piano Analysis Details
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportSheetMusic(selectedResult)}
                    >
                      <Music className="h-4 w-4 mr-2" />
                      Sheet Music
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => exportMIDI(selectedResult)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      MIDI
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {selectedResult.fileName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="hands">Hand Separation</TabsTrigger>
                    <TabsTrigger value="technique">Technique</TabsTrigger>
                    <TabsTrigger value="difficulty">Difficulty</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Music className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">Total Notes</p>
                              <p className="text-lg font-bold">{selectedResult.notes.length}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-sm font-medium">Duration</p>
                              <p className="text-lg font-bold">
                                {Math.floor(selectedResult.duration / 60)}:{(selectedResult.duration % 60).toFixed(0).padStart(2, '0')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                            <div>
                              <p className="text-sm font-medium">Tempo</p>
                              <p className="text-lg font-bold">{selectedResult.tempo} BPM</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Music2 className="h-4 w-4 text-purple-500" />
                            <div>
                              <p className="text-sm font-medium">Key</p>
                              <p className="text-lg font-bold">{selectedResult.keySignature}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Dynamics Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Average Velocity:</span>
                            <span>{selectedResult.dynamics.averageVelocity.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Velocity Range:</span>
                            <span>{selectedResult.dynamics.velocityRange.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Primary Dynamic:</span>
                            <span>{getDynamicLabel(selectedResult.dynamics.averageVelocity)}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Technical Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Time Signature:</span>
                            <span>{selectedResult.timeSignature}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Hand Separation:</span>
                            <span>LH: {selectedResult.handSeparation.leftHand.length} | RH: {selectedResult.handSeparation.rightHand.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Pedal Usage:</span>
                            <span>{selectedResult.technique.pedalUsage ? 'Detected' : 'Not detected'}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="hands" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Volume2 className="h-4 w-4" />
                            Left Hand Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Notes:</span>
                            <span>{selectedResult.handSeparation.leftHand.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Average Pitch:</span>
                            <span>
                              {selectedResult.handSeparation.leftHand.length > 0 
                                ? (selectedResult.handSeparation.leftHand.reduce((sum, note) => sum + note.midi, 0) / selectedResult.handSeparation.leftHand.length).toFixed(1)
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Pitch Range:</span>
                            <span>
                              {selectedResult.handSeparation.leftHand.length > 0
                                ? `${Math.min(...selectedResult.handSeparation.leftHand.map(n => n.midi))}-${Math.max(...selectedResult.handSeparation.leftHand.map(n => n.midi))}`
                                : 'N/A'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Volume2 className="h-4 w-4" />
                            Right Hand Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Notes:</span>
                            <span>{selectedResult.handSeparation.rightHand.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Average Pitch:</span>
                            <span>
                              {selectedResult.handSeparation.rightHand.length > 0 
                                ? (selectedResult.handSeparation.rightHand.reduce((sum, note) => sum + note.midi, 0) / selectedResult.handSeparation.rightHand.length).toFixed(1)
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Pitch Range:</span>
                            <span>
                              {selectedResult.handSeparation.rightHand.length > 0
                                ? `${Math.min(...selectedResult.handSeparation.rightHand.map(n => n.midi))}-${Math.max(...selectedResult.handSeparation.rightHand.map(n => n.midi))}`
                                : 'N/A'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Hand Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm w-16">Left:</span>
                            <div className="flex-1 bg-muted rounded-full h-4">
                              <div 
                                className="bg-blue-500 h-4 rounded-full"
                                style={{ 
                                  width: `${(selectedResult.handSeparation.leftHand.length / selectedResult.notes.length) * 100}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm w-12 text-right">
                              {((selectedResult.handSeparation.leftHand.length / selectedResult.notes.length) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm w-16">Right:</span>
                            <div className="flex-1 bg-muted rounded-full h-4">
                              <div 
                                className="bg-green-500 h-4 rounded-full"
                                style={{ 
                                  width: `${(selectedResult.handSeparation.rightHand.length / selectedResult.notes.length) * 100}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm w-12 text-right">
                              {((selectedResult.handSeparation.rightHand.length / selectedResult.notes.length) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="technique" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Articulation & Style</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Detected Articulation:</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedResult.technique.articulation.map((articulation, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {articulation}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {selectedResult.technique.ornamentation.length > 0 && (
                            <div className="space-y-2 mt-4">
                              <p className="text-sm font-medium">Ornamentation:</p>
                              <div className="flex flex-wrap gap-1">
                                {selectedResult.technique.ornamentation.map((ornament, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {ornament}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Chord Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Chords Detected:</span>
                              <span>{selectedResult.technique.chords.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Average Chord Size:</span>
                              <span>
                                {selectedResult.technique.chords.length > 0
                                  ? (selectedResult.technique.chords.reduce((sum, chord) => sum + chord.notes.length, 0) / selectedResult.technique.chords.length).toFixed(1)
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Dynamics Segments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedResult.dynamics.dynamicSegments.map((segment, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-2 border rounded">
                              <Badge variant="outline" className="w-12 justify-center">
                                {segment.dynamic}
                              </Badge>
                              <div className="flex-1">
                                <div className="text-sm">
                                  {segment.startTime.toFixed(1)}s - {segment.endTime.toFixed(1)}s
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="difficulty" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Technical Difficulty</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-500">
                              {selectedResult.difficulty.technicalDifficulty.toFixed(1)}/10
                            </div>
                            <Progress 
                              value={(selectedResult.difficulty.technicalDifficulty / 10) * 100} 
                              className="w-full mt-2" 
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Rhythmic Complexity</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-500">
                              {selectedResult.difficulty.rhythmicComplexity.toFixed(1)}/10
                            </div>
                            <Progress 
                              value={(selectedResult.difficulty.rhythmicComplexity / 10) * 100} 
                              className="w-full mt-2" 
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Harmonic Complexity</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-500">
                              {selectedResult.difficulty.harmonicComplexity.toFixed(1)}/10
                            </div>
                            <Progress 
                              value={(selectedResult.difficulty.harmonicComplexity / 10) * 100} 
                              className="w-full mt-2" 
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Overall Assessment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-lg font-bold mb-2">
                            {getDifficultyLabel((selectedResult.difficulty.technicalDifficulty + selectedResult.difficulty.rhythmicComplexity + selectedResult.difficulty.harmonicComplexity) / 3)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Overall difficulty score: {((selectedResult.difficulty.technicalDifficulty + selectedResult.difficulty.rhythmicComplexity + selectedResult.difficulty.harmonicComplexity) / 3).toFixed(1)}/10
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
                <p className="text-sm font-medium mb-2">Analyzing piano recordings...</p>
                <Progress value={undefined} className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
