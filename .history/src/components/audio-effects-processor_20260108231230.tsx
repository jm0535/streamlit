"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  Square,
  RotateCw,
  Download,
  Upload,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Activity,
  Zap,
  Settings,
  Headphones,
  Radio,
  BarChart3,
  LineChart,
  Sliders,
  Music,
  Piano,
  Guitar,
  Drum,
  Filter,
  Layers,
  Sparkles,
} from "lucide-react";

interface AudioEffect {
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  parameters: Record<string, number>;
  description: string;
}

interface AudioProcessorState {
  isProcessing: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  progress: number;
  inputLevel: number;
  outputLevel: number;
  quality: "low" | "medium" | "high";
  currentEffect: string;
}

export function AudioEffectsProcessor() {
  const [state, setState] = useState<AudioProcessorState>({
    isProcessing: false,
    isRecording: false,
    isPlaying: false,
    progress: 0,
    inputLevel: 0,
    outputLevel: 0,
    quality: "high",
    currentEffect: "reverb",
  });

  const [effects, setEffects] = useState<AudioEffect[]>([
    {
      name: "reverb",
      icon: <Radio className="h-4 w-4" />,
      enabled: true,
      parameters: {
        wetLevel: 30,
        roomSize: 50,
        damping: 20,
        preDelay: 10,
      },
      description: "Add spatial ambience and depth",
    },
    {
      name: "delay",
      icon: <Activity className="h-4 w-4" />,
      enabled: false,
      parameters: {
        time: 250,
        feedback: 30,
        wetLevel: 25,
        crossFeedback: 0,
      },
      description: "Create echo and rhythmic patterns",
    },
    {
      name: "distortion",
      icon: <Zap className="h-4 w-4" />,
      enabled: false,
      parameters: {
        amount: 50,
        tone: 50,
        level: 50,
        drive: 20,
      },
      description: "Add harmonic saturation and grit",
    },
    {
      name: "compressor",
      icon: <Sliders className="h-4 w-4" />,
      enabled: true,
      parameters: {
        threshold: -20,
        ratio: 4,
        attack: 5,
        release: 50,
        makeupGain: 0,
      },
      description: "Control dynamics and even out levels",
    },
    {
      name: "eq",
      icon: <Music className="h-4 w-4" />,
      enabled: true,
      parameters: {
        low: 50,
        midLow: 50,
        midHigh: 50,
        high: 50,
        presence: 50,
      },
      description: "Shape frequency response",
    },
    {
      name: "filter",
      icon: <Filter className="h-4 w-4" />,
      enabled: false,
      parameters: {
        frequency: 1000,
        resonance: 10,
        type: 0, // 0=lowpass, 1=highpass, 2=bandpass
        slope: 12,
      },
      description: "Frequency-based filtering",
    },
    {
      name: "chorus",
      icon: <Layers className="h-4 w-4" />,
      enabled: false,
      parameters: {
        rate: 1.5,
        depth: 20,
        mix: 50,
        feedback: 10,
      },
      description: "Add movement and width",
    },
    {
      name: "phaser",
      icon: <Sparkles className="h-4 w-4" />,
      enabled: false,
      parameters: {
        rate: 0.5,
        depth: 40,
        feedback: 50,
        stages: 4,
      },
      description: "Create sweeping phase effects",
    },
  ]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Simulate level meters
  useEffect(() => {
    const animateLevels = () => {
      if (state.isRecording || state.isPlaying) {
        setState((prev) => ({
          ...prev,
          inputLevel: Math.random() * 100,
          outputLevel: Math.random() * 100,
        }));
        animationRef.current = requestAnimationFrame(animateLevels);
      }
    };

    if (state.isRecording || state.isPlaying) {
      animateLevels();
    }
  }, [state.isRecording, state.isPlaying]);

  const toggleEffect = useCallback((effectName: string) => {
    setEffects((prev) =>
      prev.map((effect) =>
        effect.name === effectName
          ? { ...effect, enabled: !effect.enabled }
          : effect
      )
    );
  }, []);

  const updateEffectParameter = useCallback(
    (effectName: string, parameter: string, value: number) => {
      setEffects((prev) =>
        prev.map((effect) =>
          effect.name === effectName
            ? {
                ...effect,
                parameters: { ...effect.parameters, [parameter]: value },
              }
            : effect
        )
      );
    },
    []
  );

  const startProcessing = useCallback(() => {
    setState((prev) => ({ ...prev, isProcessing: true, progress: 0 }));

    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.progress >= 100) {
          clearInterval(interval);
          return { ...prev, isProcessing: false, progress: 100 };
        }
        return { ...prev, progress: prev.progress + 2 };
      });
    }, 100);
  }, []);

  const startRecording = useCallback(() => {
    setState((prev) => ({ ...prev, isRecording: true }));
  }, []);

  const stopRecording = useCallback(() => {
    setState((prev) => ({ ...prev, isRecording: false }));
  }, []);

  const playAudio = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: true }));
  }, []);

  const stopAudio = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const resetProcessor = useCallback(() => {
    setState({
      isProcessing: false,
      isRecording: false,
      isPlaying: false,
      progress: 0,
      inputLevel: 0,
      outputLevel: 0,
      quality: "high",
      currentEffect: "reverb",
    });
  }, []);

  const exportSettings = useCallback(() => {
    const settings = {
      effects,
      state,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audio-effects-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [effects, state]);

  const getEffectIcon = (effectName: string) => {
    const effect = effects.find((e) => e.name === effectName);
    return effect?.icon || <Settings className="h-4 w-4" />;
  };

  const getEffectDescription = (effectName: string) => {
    const effect = effects.find((e) => e.name === effectName);
    return effect?.description || "";
  };

  return (
    <div className="space-y-6">
      {/* Main Processor Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <CardTitle className="text-lg">Audio Effects Processor</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={state.isProcessing ? "default" : "secondary"}>
                {state.isProcessing ? "Processing" : "Idle"}
              </Badge>
              <Badge
                variant={
                  state.quality === "high"
                    ? "default"
                    : state.quality === "medium"
                    ? "secondary"
                    : "outline"
                }
              >
                {state.quality.toUpperCase()} QUALITY
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {state.isProcessing ? (
                  <Zap className="h-8 w-8 mx-auto text-yellow-500 animate-pulse" />
                ) : state.isRecording ? (
                  <Radio className="h-8 w-8 mx-auto text-red-500 animate-pulse" />
                ) : state.isPlaying ? (
                  <Volume2 className="h-8 w-8 mx-auto text-green-500" />
                ) : (
                  <Activity className="h-8 w-8 mx-auto text-gray-400" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {state.isProcessing
                  ? "Processing"
                  : state.isRecording
                  ? "Recording"
                  : state.isPlaying
                  ? "Playing"
                  : "Idle"}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold">{state.progress}%</div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(state.inputLevel)}%
              </div>
              <div className="text-sm text-muted-foreground">Input Level</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(state.outputLevel)}%
              </div>
              <div className="text-sm text-muted-foreground">Output Level</div>
            </div>
          </div>

          {/* Progress Bar */}
          {state.isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing audio with effects...</span>
                <span>{state.progress}%</span>
              </div>
              <Progress value={state.progress} className="w-full" />
            </div>
          )}

          {/* Level Meters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Input</span>
                <span>{Math.round(state.inputLevel)}%</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-100"
                  style={{ width: `${state.inputLevel}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Output</span>
                <span>{Math.round(state.outputLevel)}%</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-100"
                  style={{ width: `${state.outputLevel}%` }}
                />
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {!state.isProcessing && !state.isRecording && !state.isPlaying && (
              <>
                <Button onClick={startProcessing} className="flex-1">
                  <Zap className="h-4 w-4 mr-2" />
                  Process
                </Button>
                <Button
                  onClick={startRecording}
                  variant="outline"
                  className="flex-1"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Record
                </Button>
                <Button
                  onClick={playAudio}
                  variant="outline"
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Play
                </Button>
              </>
            )}

            {state.isProcessing && (
              <Button
                onClick={resetProcessor}
                variant="destructive"
                className="flex-1"
              >
                <Square className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}

            {state.isRecording && (
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="flex-1"
              >
                <MicOff className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            )}

            {state.isPlaying && (
              <Button
                onClick={stopAudio}
                variant="destructive"
                className="flex-1"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}

            <Button onClick={resetProcessor} variant="outline" size="sm">
              <RotateCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={exportSettings} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Quality Settings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  state.quality === "high"
                    ? "default"
                    : state.quality === "medium"
                    ? "secondary"
                    : "outline"
                }
              >
                {state.quality.toUpperCase()} QUALITY
              </Badge>
              <span className="text-sm text-muted-foreground">
                {state.quality === "high"
                  ? "Best results, slower processing"
                  : state.quality === "medium"
                  ? "Balanced speed and quality"
                  : "Fast processing, lower quality"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={state.quality === "low" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setState((prev) => ({ ...prev, quality: "low" }))
                }
              >
                Low
              </Button>
              <Button
                variant={state.quality === "medium" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setState((prev) => ({ ...prev, quality: "medium" }))
                }
              >
                Medium
              </Button>
              <Button
                variant={state.quality === "high" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setState((prev) => ({ ...prev, quality: "high" }))
                }
              >
                High
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Effects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {effects.map((effect) => (
          <Card
            key={effect.name}
            className={`transition-all duration-200 ${
              effect.enabled ? "ring-2 ring-primary" : "opacity-75"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {effect.icon}
                  <CardTitle className="text-lg capitalize">
                    {effect.name}
                  </CardTitle>
                </div>
                <Button
                  variant={effect.enabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleEffect(effect.name)}
                >
                  {effect.enabled ? "On" : "Off"}
                </Button>
              </div>
              <CardDescription>{effect.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(effect.parameters).map(([param, value]) => (
                <div key={param} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">
                      {param.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span>
                      {param.includes("time")
                        ? `${value}ms`
                        : param.includes("threshold")
                        ? `${value}dB`
                        : param.includes("ratio")
                        ? `${value}:1`
                        : param.includes("frequency")
                        ? `${value}Hz`
                        : `${value}%`}
                    </span>
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={([newValue]) =>
                      updateEffectParameter(effect.name, param, newValue)
                    }
                    max={
                      param.includes("threshold")
                        ? 0
                        : param.includes("ratio")
                        ? 20
                        : param.includes("frequency")
                        ? 20000
                        : 100
                    }
                    min={
                      param.includes("threshold")
                        ? -60
                        : param.includes("frequency")
                        ? 20
                        : 0
                    }
                    step={param.includes("frequency") ? 10 : 1}
                    className="w-full"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Effect Presets</CardTitle>
          <CardDescription>
            Quickly apply common effect combinations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Guitar className="h-6 w-6 mb-2" />
              <span>Guitar Tone</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Mic className="h-6 w-6 mb-2" />
              <span>Vocals</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Drum className="h-6 w-6 mb-2" />
              <span>Drums</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Piano className="h-6 w-6 mb-2" />
              <span>Piano</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Advanced Audio Analyzer Component
export function AdvancedAudioAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState<
    "spectrum" | "spectrogram" | "waveform" | "phase"
  >("spectrum");
  const [fftSize, setFftSize] = useState(2048);
  const [smoothing, setSmoothing] = useState(0.8);
  const [frequencyData, setFrequencyData] = useState<number[]>(
    new Array(64).fill(0)
  );
  const [peakFrequency, setPeakFrequency] = useState(0);
  const [rmsLevel, setRmsLevel] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        // Simulate frequency analysis
        const newData = new Array(64).fill(0).map(() => Math.random() * 100);
        setFrequencyData(newData);

        // Calculate peak frequency
        const maxIndex = newData.indexOf(Math.max(...newData));
        setPeakFrequency((maxIndex * 20000) / 64);

        // Calculate RMS level
        const rms = Math.sqrt(
          newData.reduce((sum, val) => sum + val * val, 0) / newData.length
        );
        setRmsLevel(rms);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const getFrequencyColor = (value: number) => {
    if (value > 80) return "bg-red-500";
    if (value > 60) return "bg-orange-500";
    if (value > 40) return "bg-yellow-500";
    if (value > 20) return "bg-green-500";
    return "bg-blue-500";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle className="text-lg">Advanced Audio Analyzer</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{analysisType}</Badge>
            <Button
              variant={isAnalyzing ? "destructive" : "default"}
              size="sm"
              onClick={() => setIsAnalyzing(!isAnalyzing)}
            >
              {isAnalyzing ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isAnalyzing ? "Stop" : "Start"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analysis Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Analysis Type</label>
            <div className="flex gap-2">
              {(["spectrum", "spectrogram", "waveform", "phase"] as const).map(
                (type) => (
                  <Button
                    key={type}
                    variant={analysisType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAnalysisType(type)}
                  >
                    {type}
                  </Button>
                )
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label>FFT Size</label>
              <span>{fftSize}</span>
            </div>
            <Slider
              value={[fftSize]}
              onValueChange={([value]) => setFftSize(value)}
              min={256}
              max={8192}
              step={256}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label>Smoothing</label>
              <span>{smoothing.toFixed(1)}</span>
            </div>
            <Slider
              value={[smoothing]}
              onValueChange={([value]) => setSmoothing(value)}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>

        {/* Frequency Display */}
        <div className="space-y-4">
          <div className="flex items-end justify-between h-64 gap-1">
            {frequencyData.map((freq, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {Math.round(freq)}%
                </div>
                <div
                  className={`w-full transition-all duration-100 ${getFrequencyColor(
                    freq
                  )}`}
                  style={{ height: `${freq}%` }}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {index < 10
                    ? `${index * 100}Hz`
                    : index < 20
                    ? `${(index - 10) * 500}Hz`
                    : index < 30
                    ? `${(index - 20) * 1000}Hz`
                    : `${(index - 30) * 2000}Hz`}
                </div>
              </div>
            ))}
          </div>

          {/* Frequency Bands */}
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-red-500">Sub Bass</div>
              <div className="text-muted-foreground">20-60 Hz</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-orange-500">Bass</div>
              <div className="text-muted-foreground">60-250 Hz</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-yellow-500">Midrange</div>
              <div className="text-muted-foreground">250-2000 Hz</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-500">Highs</div>
              <div className="text-muted-foreground">2000-20000 Hz</div>
            </div>
          </div>

          {/* Analysis Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(peakFrequency)} Hz
              </div>
              <div className="text-sm text-muted-foreground">
                Peak Frequency
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(rmsLevel)}%</div>
              <div className="text-sm text-muted-foreground">RMS Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(
                  frequencyData.reduce((a, b) => a + b, 0) /
                    frequencyData.length
                )}
                %
              </div>
              <div className="text-sm text-muted-foreground">Average Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(Math.max(...frequencyData))}%
              </div>
              <div className="text-sm text-muted-foreground">Peak Level</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
