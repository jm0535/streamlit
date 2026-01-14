"use client";

import React, { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Guitar,
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
  Mic,
  Headphones,
  Sliders,
  Save,
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

interface GuitarNote {
  midi: number;
  name: string;
  string: number;
  fret: number;
  velocity: number;
  startTime: number;
  duration: number;
  confidence: number;
}

interface GuitarAnalysisResult {
  id: string;
  fileName: string;
  duration: number;
  notes: GuitarNote[];
  tuning: string[];
  keySignature: string;
  tempo: number;
  timeSignature: string;
  technique: {
    strummingPatterns: string[];
    pickingStyle: string[];
    chords: Array<{
      startTime: number;
      name: string;
      fingering: number[];
      type: string;
    }>;
    scales: Array<{
      startTime: number;
      endTime: number;
      name: string;
      type: string;
    }>;
  };
  playingStyle: {
    genre: string;
    complexity: number;
    speed: number;
    articulation: string[];
  };
  equipment: {
    estimatedGuitarType: string;
    effects: string[];
    amplification: string;
  };
}

interface GuitarSettings {
  enableChordDetection: boolean;
  enableScaleDetection: boolean;
  enableTechniqueAnalysis: boolean;
  enableTuningDetection: boolean;
  enableGenreClassification: boolean;
  sensitivity: number;
  minNoteDuration: number;
  stringCount: 4 | 6 | 7 | 12;
}

export default function GuitarPage() {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<GuitarAnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] =
    useState<GuitarAnalysisResult | null>(null);
  const [currentTab, setCurrentTab] = useState("overview");

  const [guitarSettings, setGuitarSettings] = useState<GuitarSettings>({
    enableChordDetection: true,
    enableScaleDetection: true,
    enableTechniqueAnalysis: true,
    enableTuningDetection: true,
    enableGenreClassification: true,
    sensitivity: 0.7,
    minNoteDuration: 0.1,
    stringCount: 6,
  });

  const handleFileUpload = useCallback(
    (files: File[]) => {
      setUploadedFiles(files);
      setResults([]);
      setSelectedResult(null);
      toast({
        title: "Files uploaded",
        description: `${files.length} guitar file(s) ready for analysis`,
      });
    },
    [toast]
  );

  const startGuitarAnalysis = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload guitar audio files first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const newResults: GuitarAnalysisResult[] = [];

      for (const file of uploadedFiles) {
        // Simulate analysis time
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Generate mock guitar notes
        const generateGuitarNotes = (): GuitarNote[] => {
          const notes: GuitarNote[] = [];
          const noteNames = [
            "E",
            "F",
            "F#",
            "G",
            "G#",
            "A",
            "A#",
            "B",
            "C",
            "C#",
            "D",
            "D#",
          ];
          const standardTuning = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63]; // E-A-D-G-B-E

          for (let i = 0; i < 150; i++) {
            const stringNum = Math.floor(Math.random() * 6);
            const fret = Math.floor(Math.random() * 20);
            const openStringFreq = standardTuning[stringNum];
            const frequency = openStringFreq * Math.pow(2, fret / 12);
            const midi = Math.round(69 + 12 * Math.log2(frequency / 440));

            notes.push({
              midi,
              name: `${noteNames[midi % 12]}${Math.floor(midi / 12) - 1}`,
              string: stringNum + 1,
              fret,
              velocity: Math.floor(Math.random() * 80) + 20,
              startTime: i * 0.15 + Math.random() * 0.1,
              duration: Math.random() * 0.8 + 0.2,
              confidence: Math.random() * 0.3 + 0.7,
            });
          }

          return notes.sort((a, b) => a.startTime - b.startTime);
        };

        const mockResult: GuitarAnalysisResult = {
          id: Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          duration: Math.random() * 240 + 60,
          notes: generateGuitarNotes(),
          tuning: ["E", "A", "D", "G", "B", "E"],
          keySignature: ["E Major", "A Major", "D Major", "G Major", "C Major"][
            Math.floor(Math.random() * 5)
          ],
          tempo: Math.floor(Math.random() * 60) + 80,
          timeSignature: ["4/4", "3/4", "6/8"][Math.floor(Math.random() * 3)],
          technique: {
            strummingPatterns: [
              "Down-strum",
              "Up-strum",
              "Fingerstyle",
              "Hybrid picking",
            ].slice(0, Math.floor(Math.random() * 3) + 1),
            pickingStyle: [
              "Alternate picking",
              "Economy picking",
              "Sweep picking",
              "Tremolo",
            ].slice(0, Math.floor(Math.random() * 2) + 1),
            chords: [
              {
                startTime: 0,
                name: "E Major",
                fingering: [0, 2, 2, 1, 0, 0],
                type: "Major",
              },
              {
                startTime: 4,
                name: "A Major",
                fingering: [0, 0, 2, 2, 2, 0],
                type: "Major",
              },
              {
                startTime: 8,
                name: "D Major",
                fingering: [0, 0, 0, 2, 3, 2],
                type: "Major",
              },
            ],
            scales: [
              { startTime: 0, endTime: 16, name: "E Major", type: "Diatonic" },
              { startTime: 16, endTime: 32, name: "A Minor", type: "Natural" },
            ],
          },
          playingStyle: {
            genre: ["Rock", "Blues", "Jazz", "Folk", "Classical", "Metal"][
              Math.floor(Math.random() * 6)
            ],
            complexity: Math.random() * 5 + 3,
            speed: Math.random() * 100 + 60,
            articulation: [
              "Staccato",
              "Legato",
              "Vibrato",
              "Bend",
              "Slide",
            ].slice(0, Math.floor(Math.random() * 3) + 1),
          },
          equipment: {
            estimatedGuitarType: [
              "Electric",
              "Acoustic",
              "Classical",
              "12-String",
            ][Math.floor(Math.random() * 4)],
            effects: ["Distortion", "Reverb", "Delay", "Chorus", "Clean"].slice(
              0,
              Math.floor(Math.random() * 3) + 1
            ),
            amplification: [
              "Tube Amp",
              "Solid State",
              "Modeling Amp",
              "Acoustic Pickup",
            ][Math.floor(Math.random() * 4)],
          },
        };

        newResults.push(mockResult);
      }

      setResults(newResults);
      setSelectedResult(newResults[0]);

      toast({
        title: "Guitar analysis complete",
        description: `Successfully analyzed ${newResults.length} guitar recording(s)`,
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

  const exportGuitarTab = useCallback(
    (result: GuitarAnalysisResult) => {
      const tabData = {
        title: result.fileName,
        tuning: result.tuning,
        keySignature: result.keySignature,
        tempo: result.tempo,
        timeSignature: result.timeSignature,
        notes: result.notes.map((note) => ({
          string: note.string,
          fret: note.fret,
          duration: note.duration,
          startTime: note.startTime,
        })),
        chords: result.technique.chords,
      };

      const blob = new Blob([JSON.stringify(tabData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.fileName.replace(
        /\.[^/.]+$/,
        ""
      )}_guitar_tab.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Guitar tab exported",
        description: `Exported guitar tablature data`,
      });
    },
    [toast]
  );

  const exportMIDI = useCallback(
    (result: GuitarAnalysisResult) => {
      const midiData = JSON.stringify(result.notes, null, 2);
      const blob = new Blob([midiData], { type: "audio/midi" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.fileName.replace(/\.[^/.]+$/, "")}_guitar.mid`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "MIDI exported",
        description: `Exported guitar transcription as MIDI`,
      });
    },
    [toast]
  );

  const getComplexityLabel = (score: number): string => {
    if (score < 3) return "Beginner";
    if (score < 5) return "Intermediate";
    if (score < 7) return "Advanced";
    return "Professional";
  };

  const getSpeedLabel = (bpm: number): string => {
    if (bpm < 80) return "Slow";
    if (bpm < 120) return "Moderate";
    if (bpm < 160) return "Fast";
    return "Very Fast";
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Guitar className="h-8 w-8 text-primary" />
            Guitar Analysis
          </h1>
          <p className="text-muted-foreground">
            Specialized analysis for guitar recordings including chord
            detection, tablature generation, and technique analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Analysis Settings
          </Button>
          <Button
            onClick={startGuitarAnalysis}
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
                Analyze Guitar
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
                Upload Guitar Recordings
              </CardTitle>
              <CardDescription>
                Upload guitar audio files for specialized analysis
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

          {/* Guitar Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Analysis Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Analysis Features
                </label>
                <div className="space-y-2">
                  {[
                    { key: "enableChordDetection", label: "Chord Detection" },
                    { key: "enableScaleDetection", label: "Scale Detection" },
                    {
                      key: "enableTechniqueAnalysis",
                      label: "Technique Analysis",
                    },
                    { key: "enableTuningDetection", label: "Tuning Detection" },
                    {
                      key: "enableGenreClassification",
                      label: "Genre Classification",
                    },
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{label}</span>
                      <Switch
                        checked={
                          typeof guitarSettings[key as keyof GuitarSettings] ===
                          "boolean"
                            ? (guitarSettings[
                                key as keyof GuitarSettings
                              ] as boolean)
                            : false
                        }
                        onCheckedChange={(checked) =>
                          setGuitarSettings((prev) => ({
                            ...prev,
                            [key]: checked,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="string-count">String Count</Label>
                <select
                  id="string-count"
                  value={guitarSettings.stringCount}
                  onChange={(e) =>
                    setGuitarSettings((prev) => ({
                      ...prev,
                      stringCount: parseInt(e.target.value) as 6 | 7 | 8 | 12,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                  aria-label="Select guitar string count"
                  title="Choose the number of strings for analysis"
                >
                  <option value={4}>4 String (Bass)</option>
                  <option value={6}>6 String</option>
                  <option value={7}>7 String</option>
                  <option value={12}>12 String</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Sensitivity</label>
                <Slider
                  value={[guitarSettings.sensitivity]}
                  onValueChange={([value]) =>
                    setGuitarSettings((prev) => ({
                      ...prev,
                      sensitivity: value,
                    }))
                  }
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full mt-2"
                />
                <span className="text-xs text-muted-foreground">
                  {(guitarSettings.sensitivity * 100).toFixed(0)}%
                </span>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Minimum Note Duration
                </label>
                <Slider
                  value={[guitarSettings.minNoteDuration]}
                  onValueChange={([value]) =>
                    setGuitarSettings((prev) => ({
                      ...prev,
                      minNoteDuration: value,
                    }))
                  }
                  max={1}
                  min={0.05}
                  step={0.05}
                  className="w-full mt-2"
                />
                <span className="text-xs text-muted-foreground">
                  {guitarSettings.minNoteDuration}s
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
                {results.length} guitar recording(s) analyzed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Guitar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No analysis results yet</p>
                  <p className="text-sm">
                    Upload guitar recordings and start analysis
                  </p>
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
                            <Music className="h-3 w-3" />
                            {result.keySignature}
                            <TrendingUp className="h-3 w-3" />
                            {result.tempo} BPM
                            <Guitar className="h-3 w-3" />
                            {result.notes.length} notes
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {result.playingStyle.genre}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {result.equipment.estimatedGuitarType}
                          </Badge>
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
                    Guitar Analysis Details
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportGuitarTab(selectedResult)}
                    >
                      <Music className="h-4 w-4 mr-2" />
                      Guitar Tab
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
                <CardDescription>{selectedResult.fileName}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="technique">Technique</TabsTrigger>
                    <TabsTrigger value="chords">Chords & Scales</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Music className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">Total Notes</p>
                              <p className="text-lg font-bold">
                                {selectedResult.notes.length}
                              </p>
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
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                            <div>
                              <p className="text-sm font-medium">Tempo</p>
                              <p className="text-lg font-bold">
                                {selectedResult.tempo} BPM
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Guitar className="h-4 w-4 text-purple-500" />
                            <div>
                              <p className="text-sm font-medium">Tuning</p>
                              <p className="text-lg font-bold">
                                {selectedResult.tuning.join("-")}
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
                            Playing Style
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Genre:</span>
                            <span>{selectedResult.playingStyle.genre}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Complexity:</span>
                            <span>
                              {getComplexityLabel(
                                selectedResult.playingStyle.complexity
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Speed:</span>
                            <span>
                              {getSpeedLabel(selectedResult.playingStyle.speed)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Technical Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Key Signature:</span>
                            <span>{selectedResult.keySignature}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Time Signature:</span>
                            <span>{selectedResult.timeSignature}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>String Usage:</span>
                            <span>
                              {
                                [
                                  ...new Set(
                                    selectedResult.notes.map((n) => n.string)
                                  ),
                                ].length
                              }
                              /6 strings
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="technique" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Strumming Patterns
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1">
                            {selectedResult.technique.strummingPatterns.map(
                              (pattern, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {pattern}
                                </Badge>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Picking Style
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1">
                            {selectedResult.technique.pickingStyle.map(
                              (style, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {style}
                                </Badge>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Articulation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {selectedResult.playingStyle.articulation.map(
                            (articulation, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                {articulation}
                              </Badge>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="chords" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Detected Chords
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedResult.technique.chords.map(
                              (chord, idx) => (
                                <div key={idx} className="p-2 border rounded">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">
                                      {chord.name}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {chord.type}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Fingering: {chord.fingering.join("-")}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {chord.startTime.toFixed(1)}s
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Detected Scales
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedResult.technique.scales.map(
                              (scale, idx) => (
                                <div key={idx} className="p-2 border rounded">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">
                                      {scale.name}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {scale.type}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {scale.startTime.toFixed(1)}s -{" "}
                                    {scale.endTime.toFixed(1)}s
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="equipment" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Guitar Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center">
                            <Guitar className="h-8 w-8 mx-auto mb-2 text-primary" />
                            <p className="font-medium">
                              {selectedResult.equipment.estimatedGuitarType}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Effects</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {selectedResult.equipment.effects.map(
                              (effect, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {effect}
                                </Badge>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Amplification
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center">
                            <Volume2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                            <p className="font-medium">
                              {selectedResult.equipment.amplification}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
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
                  Analyzing guitar recordings...
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
