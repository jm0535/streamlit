"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";

interface AudioProcessorProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ProcessingState {
  isProcessing: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  progress: number;
  inputLevel: number;
  outputLevel: number;
  quality: "low" | "medium" | "high";
}

export function AudioProcessor({
  title,
  description,
  icon,
}: AudioProcessorProps) {
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    isRecording: false,
    isPlaying: false,
    progress: 0,
    inputLevel: 0,
    outputLevel: 0,
    quality: "high",
  });

  const [settings, setSettings] = useState({
    noiseReduction: true,
    echoCancellation: true,
    autoGain: true,
    compression: false,
    reverb: 20,
    delay: 0,
    eq: { low: 50, mid: 50, high: 50 },
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
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

  const startProcessing = useCallback(() => {
    setState((prev) => ({ ...prev, isProcessing: true, progress: 0 }));

    // Simulate processing
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
    });
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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
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
              <span>Processing...</span>
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
              <Button onClick={playAudio} variant="outline" className="flex-1">
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
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Audio Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Noise Reduction</span>
                <Button
                  variant={settings.noiseReduction ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      noiseReduction: !prev.noiseReduction,
                    }))
                  }
                >
                  {settings.noiseReduction ? "On" : "Off"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Echo Cancellation</span>
                <Button
                  variant={settings.echoCancellation ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      echoCancellation: !prev.echoCancellation,
                    }))
                  }
                >
                  {settings.echoCancellation ? "On" : "Off"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto Gain</span>
                <Button
                  variant={settings.autoGain ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      autoGain: !prev.autoGain,
                    }))
                  }
                >
                  {settings.autoGain ? "On" : "Off"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Reverb</span>
                  <span>{settings.reverb}%</span>
                </div>
                <Slider
                  value={[settings.reverb]}
                  onValueChange={([value]) =>
                    setSettings((prev) => ({ ...prev, reverb: value }))
                  }
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Delay</span>
                  <span>{settings.delay}%</span>
                </div>
                <Slider
                  value={[settings.delay]}
                  onValueChange={([value]) =>
                    setSettings((prev) => ({ ...prev, delay: value }))
                  }
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
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
              onClick={() => setState((prev) => ({ ...prev, quality: "low" }))}
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
              onClick={() => setState((prev) => ({ ...prev, quality: "high" }))}
            >
              High
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Audio Visualizer Component
export function AudioVisualizer({
  type = "waveform",
  height = 200,
  color = "#3b82f6",
}: {
  type?: "waveform" | "bars" | "circular";
  height?: number;
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const animationRef = useRef<number | null>(null);

  const visualize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (type === "waveform") {
      // Draw waveform
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const amplitude =
          Math.sin(x * 0.05 + Date.now() * 0.002) *
          Math.sin(x * 0.02 + Date.now() * 0.001) *
          (height / 3);
        const y = height / 2 + amplitude;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    } else if (type === "bars") {
      // Draw frequency bars
      const barWidth = width / 32;
      const barGap = 2;

      for (let i = 0; i < 32; i++) {
        const barHeight = Math.random() * height * 0.8;
        const x = i * (barWidth + barGap);
        const y = height - barHeight;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    } else if (type === "circular") {
      // Draw circular visualizer
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 4;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      for (let i = 0; i < 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        const amplitude = Math.random() * radius;

        ctx.beginPath();
        ctx.moveTo(
          centerX + Math.cos(angle) * radius,
          centerY + Math.sin(angle) * radius
        );
        ctx.lineTo(
          centerX + Math.cos(angle) * (radius + amplitude),
          centerY + Math.sin(angle) * (radius + amplitude)
        );
        ctx.stroke();
      }
    }

    if (isActive) {
      animationRef.current = requestAnimationFrame(visualize);
    }
  }, [type, color, isActive]);

  useEffect(() => {
    if (isActive) {
      visualize();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, visualize]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waveform className="h-5 w-5" />
            <CardTitle className="text-lg">Audio Visualizer</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{type}</Badge>
            <Button
              variant={isActive ? "destructive" : "default"}
              size="sm"
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isActive ? "Stop" : "Start"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <canvas
          ref={canvasRef}
          width={800}
          height={height}
          className="w-full border rounded-lg bg-gray-50"
        />
        <div className="flex items-center gap-2 mt-4">
          <Button
            variant={type === "waveform" ? "default" : "outline"}
            size="sm"
            onClick={() => setIsActive(false)}
          >
            <LineChart className="h-4 w-4 mr-2" />
            Waveform
          </Button>
          <Button
            variant={type === "bars" ? "default" : "outline"}
            size="sm"
            onClick={() => setIsActive(false)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Bars
          </Button>
          <Button
            variant={type === "circular" ? "default" : "outline"}
            size="sm"
            onClick={() => setIsActive(false)}
          >
            <Radio className="h-4 w-4 mr-2" />
            Circular
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Spectrum Analyzer Component
export function SpectrumAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [frequencies, setFrequencies] = useState<number[]>(
    new Array(32).fill(0)
  );

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setFrequencies((prev) => prev.map(() => Math.random() * 100));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const getFrequencyColor = (value: number) => {
    if (value > 80) return "bg-red-500";
    if (value > 60) return "bg-yellow-500";
    if (value > 40) return "bg-green-500";
    if (value > 20) return "bg-blue-500";
    return "bg-gray-400";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle className="text-lg">Spectrum Analyzer</CardTitle>
          </div>
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
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Frequency Display */}
          <div className="flex items-end justify-between h-48 gap-1">
            {frequencies.map((freq, index) => (
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
              <div className="font-bold text-yellow-500">Bass</div>
              <div className="text-muted-foreground">60-250 Hz</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-500">Midrange</div>
              <div className="text-muted-foreground">250-2000 Hz</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-500">Highs</div>
              <div className="text-muted-foreground">2000-20000 Hz</div>
            </div>
          </div>

          {/* Peak Detection */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="font-medium">Peak Frequency:</span>
              <span className="ml-2 text-muted-foreground">
                {Math.round(Math.max(...frequencies) * 20)} Hz
              </span>
            </div>
            <div>
              <span className="font-medium">Average Level:</span>
              <span className="ml-2 text-muted-foreground">
                {Math.round(
                  frequencies.reduce((a, b) => a + b, 0) / frequencies.length
                )}
                %
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
