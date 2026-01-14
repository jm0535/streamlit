"use client";

import React, { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Drum,
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
  Radio,
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
import { AudioFileUpload } from "@/components/audio-file-upload";

interface DrumHit {
  id: string;
  instrument: string;
  velocity: number;
  startTime: number;
  duration: number;
  confidence: number;
  frequency: number;
}

interface DrumPattern {
  id: string;
  name: string;
  timeSignature: string;
  tempo: number;
  duration: number;
  hits: DrumHit[];
  style: string;
  complexity: number;
}

interface DrumAnalysisResult {
  id: string;
  fileName: string;
  duration: number;
  tempo: number;
  tempoVariations: Array<{ startTime: number; tempo: number }>;
  timeSignature: string;
  timeSignatureChanges: Array<{ startTime: number; signature: string }>;

  // Drum components
  components: {
    kick: DrumHit[];
    snare: DrumHit[];
    hiHat: DrumHit[];
    tom1: DrumHit[];
    tom2: DrumHit[];
    crash: DrumHit[];
    ride: DrumHit[];
  };

  // Patterns and grooves
  patterns: DrumPattern[];
  fills: Array<{
    startTime: number;
    endTime: number;
    complexity: number;
    instruments: string[];
  }>;

  // Playing characteristics
  technique: {
    handTechnique: string[];
    footTechnique: string[];
    dynamics: string[];
    timing: number;
    consistency: number;
  };

  // Style analysis
  style: {
    primaryGenre: string;
    influences: string[];
    era: string;
    complexity: number;
  };
}

interface DrumSettings {
  enablePatternDetection: boolean;
  enableFillDetection: boolean;
  enableTechniqueAnalysis: boolean;
  enableStyleClassification: boolean;
  enableTempoTracking: boolean;
  sensitivity: number;
  minHitDuration: number;
  tempoTolerance: number;
}

export default function DrumsPage() {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<DrumAnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] =
    useState<DrumAnalysisResult | null>(null);
  const [currentTab, setCurrentTab] = useState("overview");

  const [drumSettings, setDrumSettings] = useState<DrumSettings>({
    enablePatternDetection: true,
    enableFillDetection: true,
    enableTechniqueAnalysis: true,
    enableStyleClassification: true,
    enableTempoTracking: true,
    sensitivity: 0.7,
    minHitDuration: 0.05,
    tempoTolerance: 5,
  });

  const handleFileUpload = useCallback(
    (files: File[]) => {
      setUploadedFiles(files);
      setResults([]);
      setSelectedResult(null);
      toast({
        title: "Files uploaded",
        description: `${files.length} drum file(s) ready for analysis`,
      });
    },
    [toast]
  );

  const startDrumAnalysis = useCallback(async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload drum audio files first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const newResults: DrumAnalysisResult[] = [];

      for (const file of uploadedFiles) {
        // Simulate analysis time
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Generate mock drum hits
        const generateDrumHits = (
          instrument: string,
          count: number
        ): DrumHit[] => {
          const frequencies: { [key: string]: number } = {
            kick: 60,
            snare: 200,
            hiHat: 800,
            tom1: 150,
            tom2: 100,
            crash: 2000,
            ride: 1500,
          };

          return Array.from({ length: count }, (_, i) => ({
            id: Math.random().toString(36).substr(2, 9),
            instrument,
            velocity: Math.floor(Math.random() * 80) + 20,
            startTime: i * 0.5 + Math.random() * 0.2,
            duration: Math.random() * 0.2 + 0.05,
            confidence: Math.random() * 0.3 + 0.7,
            frequency: frequencies[instrument] || 500,
          }));
        };

        const mockResult: DrumAnalysisResult = {
          id: Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          duration: Math.random() * 180 + 60,
          tempo: Math.floor(Math.random() * 60) + 80,
          tempoVariations: [
            { startTime: 0, tempo: 120 },
            { startTime: 30, tempo: 125 },
            { startTime: 60, tempo: 118 },
          ],
          timeSignature: ["4/4", "3/4", "6/8", "5/4"][
            Math.floor(Math.random() * 4)
          ],
          timeSignatureChanges: [],

          components: {
            kick: generateDrumHits("kick", 80),
            snare: generateDrumHits("snare", 60),
            hiHat: generateDrumHits("hiHat", 120),
            tom1: generateDrumHits("tom1", 20),
            tom2: generateDrumHits("tom2", 15),
            crash: generateDrumHits("crash", 10),
            ride: generateDrumHits("ride", 25),
          },

          patterns: [
            {
              id: "pattern1",
              name: "Basic Rock Beat",
              timeSignature: "4/4",
              tempo: 120,
              duration: 8,
              hits: generateDrumHits("kick", 16).concat(
                generateDrumHits("snare", 8)
              ),
              style: "Rock",
              complexity: 3,
            },
            {
              id: "pattern2",
              name: "Funk Groove",
              timeSignature: "4/4",
              tempo: 95,
              duration: 4,
              hits: generateDrumHits("hiHat", 32).concat(
                generateDrumHits("snare", 8)
              ),
              style: "Funk",
              complexity: 6,
            },
          ],

          fills: [
            {
              startTime: 16,
              endTime: 18,
              complexity: 7,
              instruments: ["snare", "tom1", "tom2", "crash"],
            },
            {
              startTime: 32,
              endTime: 33.5,
              complexity: 5,
              instruments: ["hiHat", "snare", "kick"],
            },
          ],

          technique: {
            handTechnique: [
              "Matched grip",
              "Traditional grip",
              "Moles technique",
            ].slice(0, Math.floor(Math.random() * 2) + 1),
            footTechnique: ["Heel-down", "Heel-up", "Slide technique"].slice(
              0,
              Math.floor(Math.random() * 2) + 1
            ),
            dynamics: [
              "Ghost notes",
              "Accents",
              "Crescendo",
              "Diminuendo",
            ].slice(0, Math.floor(Math.random() * 3) + 1),
            timing: Math.random() * 0.1 + 0.9,
            consistency: Math.random() * 0.2 + 0.8,
          },

          style: {
            primaryGenre: ["Rock", "Jazz", "Funk", "Blues", "Metal", "Latin"][
              Math.floor(Math.random() * 6)
            ],
            influences: [
              "Rock",
              "Jazz",
              "Funk",
              "Blues",
              "Latin",
              "Afro-Cuban",
            ].slice(0, Math.floor(Math.random() * 3) + 1),
            era: [
              "1950s",
              "1960s",
              "1970s",
              "1980s",
              "1990s",
              "2000s",
              "Modern",
            ][Math.floor(Math.random() * 7)],
            complexity: Math.random() * 5 + 3,
          },
        };

        newResults.push(mockResult);
      }

      setResults(newResults);
      setSelectedResult(newResults[0]);

      toast({
        title: "Drum analysis complete",
        description: `Successfully analyzed ${newResults.length} drum recording(s)`,
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

  const exportDrumTab = useCallback(
    (result: DrumAnalysisResult) => {
      const drumTabData = {
        title: result.fileName,
        tempo: result.tempo,
        timeSignature: result.timeSignature,
        duration: result.duration,
        components: Object.entries(result.components).map(
          ([instrument, hits]) => ({
            instrument,
            hits: hits.map((hit) => ({
              time: hit.startTime,
              velocity: hit.velocity,
              duration: hit.duration,
            })),
          })
        ),
        patterns: result.patterns,
        fills: result.fills,
      };

      const blob = new Blob([JSON.stringify(drumTabData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.fileName.replace(/\.[^/.]+$/, "")}_drum_tab.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Drum tab exported",
        description: `Exported drum notation data`,
      });
    },
    [toast]
  );

  const exportMIDI = useCallback(
    (result: DrumAnalysisResult) => {
      const midiData = JSON.stringify(
        {
          tempo: result.tempo,
          timeSignature: result.timeSignature,
          hits: Object.values(result.components)
            .flat()
            .map((hit) => ({
              instrument: hit.instrument,
              startTime: hit.startTime,
              duration: hit.duration,
              velocity: hit.velocity,
            })),
        },
        null,
        2
      );

      const blob = new Blob([midiData], { type: "audio/midi" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.fileName.replace(/\.[^/.]+$/, "")}_drums.mid`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "MIDI exported",
        description: `Exported drum transcription as MIDI`,
      });
    },
    [toast]
  );

  const getComplexityLabel = (score: number): string => {
    if (score < 3) return "Simple";
    if (score < 5) return "Moderate";
    if (score < 7) return "Complex";
    return "Very Complex";
  };

  const getTimingLabel = (score: number): string => {
    if (score > 0.95) return "Excellent";
    if (score > 0.85) return "Good";
    if (score > 0.7) return "Fair";
    return "Poor";
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Drum className="h-8 w-8 text-primary" />
            Drum Analysis
          </h1>
          <p className="text-muted-foreground">
            Specialized analysis for drum recordings including pattern
            detection, technique analysis, and rhythm transcription
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Analysis Settings
          </Button>
          <Button
            onClick={startDrumAnalysis}
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
                Analyze Drums
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
                Upload Drum Recordings
              </CardTitle>
              <CardDescription>
                Upload drum audio files for specialized analysis
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

          {/* Drum Settings */}
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
                    {
                      key: "enablePatternDetection",
                      label: "Pattern Detection",
                    },
                    { key: "enableFillDetection", label: "Fill Detection" },
                    {
                      key: "enableTechniqueAnalysis",
                      label: "Technique Analysis",
                    },
                    {
                      key: "enableStyleClassification",
                      label: "Style Classification",
                    },
                    { key: "enableTempoTracking", label: "Tempo Tracking" },
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{label}</span>
                      <Switch
                        checked={
                          typeof drumSettings[key as keyof DrumSettings] ===
                          "boolean"
                            ? (drumSettings[
                                key as keyof DrumSettings
                              ] as boolean)
                            : false
                        }
                        onCheckedChange={(checked) =>
                          setDrumSettings((prev) => ({
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
                <label className="text-sm font-medium">Sensitivity</label>
                <Slider
                  value={[drumSettings.sensitivity]}
                  onValueChange={([value]) =>
                    setDrumSettings((prev) => ({
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
                  {(drumSettings.sensitivity * 100).toFixed(0)}%
                </span>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Minimum Hit Duration
                </label>
                <Slider
                  value={[drumSettings.minHitDuration]}
                  onValueChange={([value]) =>
                    setDrumSettings((prev) => ({
                      ...prev,
                      minHitDuration: value,
                    }))
                  }
                  max={0.5}
                  min={0.01}
                  step={0.01}
                  className="w-full mt-2"
                />
                <span className="text-xs text-muted-foreground">
                  {drumSettings.minHitDuration}s
                </span>
              </div>

              <div>
                <label className="text-sm font-medium">Tempo Tolerance</label>
                <Slider
                  value={[drumSettings.tempoTolerance]}
                  onValueChange={([value]) =>
                    setDrumSettings((prev) => ({
                      ...prev,
                      tempoTolerance: value,
                    }))
                  }
                  max={20}
                  min={1}
                  step={1}
                  className="w-full mt-2"
                />
                <span className="text-xs text-muted-foreground">
                  ±{drumSettings.tempoTolerance} BPM
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
                {results.length} drum recording(s) analyzed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Drum className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No analysis results yet</p>
                  <p className="text-sm">
                    Upload drum recordings and start analysis
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
                            <Radio className="h-3 w-3" />
                            {result.timeSignature}
                            <TrendingUp className="h-3 w-3" />
                            {result.tempo} BPM
                            <Drum className="h-3 w-3" />
                            {
                              Object.values(result.components).flat().length
                            }{" "}
                            hits
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {result.style.primaryGenre}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {getComplexityLabel(result.style.complexity)}
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
                    Drum Analysis Details
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportDrumTab(selectedResult)}
                    >
                      <Music className="h-4 w-4 mr-2" />
                      Drum Tab
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
                    <TabsTrigger value="components">Components</TabsTrigger>
                    <TabsTrigger value="patterns">Patterns</TabsTrigger>
                    <TabsTrigger value="technique">Technique</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Drum className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">Total Hits</p>
                              <p className="text-lg font-bold">
                                {
                                  Object.values(
                                    selectedResult.components
                                  ).flat().length
                                }
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
                            <Radio className="h-4 w-4 text-purple-500" />
                            <div>
                              <p className="text-sm font-medium">
                                Time Signature
                              </p>
                              <p className="text-lg font-bold">
                                {selectedResult.timeSignature}
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
                            Style Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Primary Genre:</span>
                            <span>{selectedResult.style.primaryGenre}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Era:</span>
                            <span>{selectedResult.style.era}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Complexity:</span>
                            <span>
                              {getComplexityLabel(
                                selectedResult.style.complexity
                              )}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Performance Quality
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Timing:</span>
                            <span>
                              {getTimingLabel(selectedResult.technique.timing)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Consistency:</span>
                            <span>
                              {(
                                selectedResult.technique.consistency * 100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Patterns:</span>
                            <span>
                              {selectedResult.patterns.length} detected
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="components" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedResult.components).map(
                        ([instrument, hits]) => (
                          <Card key={instrument}>
                            <CardHeader>
                              <CardTitle className="text-sm capitalize">
                                {instrument}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Hits:</span>
                                  <span>{hits.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Avg Velocity:</span>
                                  <span>
                                    {hits.length > 0
                                      ? (
                                          hits.reduce(
                                            (sum, hit) => sum + hit.velocity,
                                            0
                                          ) / hits.length
                                        ).toFixed(1)
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Frequency:</span>
                                  <span>
                                    {hits.length > 0
                                      ? hits[0].frequency.toFixed(0) + " Hz"
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="mt-2">
                                  <Progress
                                    value={
                                      (hits.length /
                                        Math.max(
                                          ...Object.values(
                                            selectedResult.components
                                          ).map((h) => h.length)
                                        )) *
                                      100
                                    }
                                    className="w-full h-2"
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      )}
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Component Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Object.entries(selectedResult.components).map(
                            ([instrument, hits]) => {
                              const totalHits = Object.values(
                                selectedResult.components
                              ).flat().length;
                              const percentage =
                                (hits.length / totalHits) * 100;
                              return (
                                <div
                                  key={instrument}
                                  className="flex items-center gap-2"
                                >
                                  <span className="text-sm w-16 capitalize">
                                    {instrument}:
                                  </span>
                                  <div className="flex-1 bg-muted rounded-full h-4">
                                    <div
                                      className="bg-primary h-4 rounded-full drum-component-bar"
                                      data-width={`${percentage}%`}
                                    />
                                  </div>
                                  <span className="text-sm w-12 text-right">
                                    {percentage.toFixed(0)}%
                                  </span>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="patterns" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Detected Patterns
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedResult.patterns.map((pattern, idx) => (
                              <div key={idx} className="p-2 border rounded">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">
                                    {pattern.name}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {getComplexityLabel(pattern.complexity)}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {pattern.timeSignature} • {pattern.tempo} BPM
                                  • {pattern.duration}s
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {pattern.hits.length} hits
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Drum Fills</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedResult.fills.map((fill, idx) => (
                              <div key={idx} className="p-2 border rounded">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">
                                    Fill {idx + 1}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {getComplexityLabel(fill.complexity)}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {fill.startTime.toFixed(1)}s -{" "}
                                  {fill.endTime.toFixed(1)}s
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {fill.instruments.map(
                                    (instrument, instrumentIdx) => (
                                      <Badge
                                        key={instrumentIdx}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {instrument}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            ))}
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
                            Hand Technique
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1">
                            {selectedResult.technique.handTechnique.map(
                              (technique, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {technique}
                                </Badge>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Foot Technique
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1">
                            {selectedResult.technique.footTechnique.map(
                              (technique, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {technique}
                                </Badge>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Dynamics & Articulation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {selectedResult.technique.dynamics.map(
                            (dynamic, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                {dynamic}
                              </Badge>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Style Influences
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1">
                            {selectedResult.style.influences.map(
                              (influence, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {influence}
                                </Badge>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Performance Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Timing Accuracy:</span>
                            <span>
                              {(selectedResult.technique.timing * 100).toFixed(
                                1
                              )}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Consistency:</span>
                            <span>
                              {(
                                selectedResult.technique.consistency * 100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Tempo Changes:</span>
                            <span>{selectedResult.tempoVariations.length}</span>
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
                  Analyzing drum recordings...
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
