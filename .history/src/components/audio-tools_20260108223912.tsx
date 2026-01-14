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
import "@/styles/audio-components.css";
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
  Waveform,
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
  Clock,
  TrendingUp,
  Database,
  HardDrive,
  Cloud,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Archive,
} from "lucide-react";

interface AudioRecorder {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  levels: number[];
  format: "wav" | "mp3" | "flac";
  quality: "low" | "medium" | "high";
  sampleRate: number;
  channels: number;
}

interface AudioFile {
  id: string;
  name: string;
  size: number;
  duration: number;
  format: string;
  sampleRate: number;
  bitDepth: number;
  channels: number;
  createdAt: Date;
  processed: boolean;
}

export function AudioRecorder() {
  const [recorder, setRecorder] = useState<AudioRecorder>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    levels: new Array(50).fill(0),
    format: "wav",
    quality: "high",
    sampleRate: 44100,
    channels: 2,
  });

  const [recordedFiles, setRecordedFiles] = useState<AudioFile[]>([
    {
      id: "1",
      name: "Vocal Take 01.wav",
      size: 15728640,
      duration: 180,
      format: "WAV",
      sampleRate: 44100,
      bitDepth: 24,
      channels: 2,
      createdAt: new Date("2024-01-20T10:30:00"),
      processed: true,
    },
    {
      id: "2",
      name: "Guitar Riff.mp3",
      size: 5242880,
      duration: 120,
      format: "MP3",
      sampleRate: 44100,
      bitDepth: 16,
      channels: 2,
      createdAt: new Date("2024-01-20T09:15:00"),
      processed: false,
    },
  ]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Simulate level meters
  useEffect(() => {
    const animateLevels = () => {
      if (recorder.isRecording && !recorder.isPaused) {
        setRecorder((prev) => ({
          ...prev,
          levels: prev.levels.map(() => Math.random() * 100),
        }));
        animationRef.current = requestAnimationFrame(animateLevels);
      }
    };

    if (recorder.isRecording && !recorder.isPaused) {
      animateLevels();
    }
  }, [recorder.isRecording, recorder.isPaused]);

  // Timer
  useEffect(() => {
    if (recorder.isRecording && !recorder.isPaused) {
      timerRef.current = setInterval(() => {
        setRecorder((prev) => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recorder.isRecording, recorder.isPaused]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: recorder.sampleRate,
          channelCount: recorder.channels,
        },
      });

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start();

      setRecorder((prev) => ({ ...prev, isRecording: true, duration: 0 }));
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  }, [recorder.sampleRate, recorder.channels]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recorder.isRecording) {
      if (recorder.isPaused) {
        mediaRecorderRef.current.resume();
        setRecorder((prev) => ({ ...prev, isPaused: false }));
      } else {
        mediaRecorderRef.current.pause();
        setRecorder((prev) => ({ ...prev, isPaused: true }));
      }
    }
  }, [recorder.isRecording, recorder.isPaused]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());

      setRecorder((prev) => ({
        ...prev,
        isRecording: false,
        isPaused: false,
        duration: 0,
        levels: new Array(50).fill(0),
      }));
    }
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="form-container form-container-lg">
      <div className="form-section">
        <div className="form-section-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              <h2 className="form-section-title">Audio Recorder</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={recorder.isRecording ? "destructive" : "secondary"}
              >
                {recorder.isRecording
                  ? recorder.isPaused
                    ? "PAUSED"
                    : "RECORDING"
                  : "READY"}
              </Badge>
              <Badge variant="outline">{recorder.format.toUpperCase()}</Badge>
            </div>
          </div>
          <p className="form-section-description">
            Record high-quality audio with customizable settings and real-time
            monitoring.
          </p>
        </div>

        {/* Recording Status */}
        <div className="form-grid form-grid-4">
          <div className="form-field">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">
                {recorder.isRecording ? (
                  <Radio className="h-8 w-8 mx-auto animate-pulse" />
                ) : (
                  <Mic className="h-8 w-8 mx-auto text-gray-400" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {recorder.isRecording
                  ? recorder.isPaused
                    ? "Paused"
                    : "Recording"
                  : "Ready"}
              </div>
            </div>
          </div>

          <div className="form-field">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {formatDuration(recorder.duration)}
              </div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>
          </div>

          <div className="form-field">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {recorder.sampleRate / 1000}k
              </div>
              <div className="text-sm text-muted-foreground">Sample Rate</div>
            </div>
          </div>

          <div className="form-field">
            <div className="text-center">
              <div className="text-3xl font-bold">{recorder.channels}</div>
              <div className="text-sm text-muted-foreground">Channels</div>
            </div>
          </div>
        </div>

        {/* Level Meters */}
        <div className="form-field form-field-lg">
          <label className="form-label">Input Levels</label>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="audio-label">Audio Levels</span>
            <span className="audio-value">
              {Math.round(Math.max(...recorder.levels))}% Peak
            </span>
          </div>
          <div className="flex items-end justify-between h-20 gap-1 audio-controls-grid">
            {recorder.levels.map((level, index) => (
              <div
                key={index}
                className={`w-full transition-all duration-100 level-bar ${
                  level > 80
                    ? "level-critical"
                    : level > 60
                    ? "level-warning"
                    : "level-normal"
                } level-bar-h-${Math.round(level)}`}
              />
            ))}
          </div>
          <p className="form-helper-text">
            Monitor audio input levels in real-time. Green is normal, yellow is
            warning, red is clipping.
          </p>
        </div>

        {/* Recording Controls */}
        <div className="form-field form-field-lg">
          <label className="form-label">Recording Controls</label>
          <div className="form-actions form-actions-center">
            {!recorder.isRecording ? (
              <Button onClick={startRecording} className="flex-1 btn-primary">
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <>
                <Button
                  onClick={pauseRecording}
                  variant="outline"
                  className="flex-1 btn-outline"
                >
                  {recorder.isPaused ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  className="btn-destructive"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="form-section">
        <div className="form-section-header">
          <h2 className="form-section-title">Recording Settings</h2>
          <p className="form-section-description">
            Configure audio format, quality, and sample rate for optimal
            recording quality.
          </p>
        </div>

        <div className="form-grid form-grid-3">
          <div className="form-field">
            <label className="form-label">Format</label>
            <div className="radio-group radio-group-horizontal">
              {(["wav", "mp3", "flac"] as const).map((format) => (
                <div
                  key={format}
                  className={`radio-compact ${
                    recorder.format === format ? "selected" : ""
                  } ${recorder.isRecording ? "disabled" : ""}`}
                >
                  <input
                    type="radio"
                    name="recorder-format"
                    value={format}
                    checked={recorder.format === format}
                    onChange={() =>
                      setRecorder((prev) => ({ ...prev, format }))
                    }
                    disabled={recorder.isRecording}
                    id={`recorder-format-${format}`}
                    aria-label={`Format: ${format}`}
                    className="radio-input"
                  />
                  <div className="radio-label">{format.toUpperCase()}</div>
                </div>
              ))}
            </div>
            <p className="form-helper-text">
              Choose audio format. WAV is uncompressed, MP3 is compressed, FLAC
              is lossless.
            </p>
          </div>

          <div className="form-field">
            <label className="form-label">Quality</label>
            <div className="radio-group radio-group-horizontal">
              {(["low", "medium", "high"] as const).map((quality) => (
                <div
                  key={quality}
                  className={`radio-compact ${
                    recorder.quality === quality ? "selected" : ""
                  } ${recorder.isRecording ? "disabled" : ""}`}
                >
                  <input
                    type="radio"
                    name="recorder-quality"
                    value={quality}
                    checked={recorder.quality === quality}
                    onChange={() =>
                      setRecorder((prev) => ({ ...prev, quality }))
                    }
                    disabled={recorder.isRecording}
                    id={`recorder-quality-${quality}`}
                    aria-label={`Quality: ${quality}`}
                    className="radio-input"
                  />
                  <div className="radio-label">
                    {quality.charAt(0).toUpperCase() + quality.slice(1)}
                  </div>
                </div>
              ))}
            </div>
            <p className="form-helper-text">
              Higher quality uses more storage space but provides better audio
              fidelity.
            </p>
          </div>

          <div className="form-field">
            <label className="form-label">Sample Rate</label>
            <div className="radio-group radio-group-horizontal">
              {[44100, 48000, 96000].map((rate) => (
                <div
                  key={rate}
                  className={`radio-compact ${
                    recorder.sampleRate === rate ? "selected" : ""
                  } ${recorder.isRecording ? "disabled" : ""}`}
                >
                  <input
                    type="radio"
                    name="recorder-sample-rate"
                    value={rate}
                    checked={recorder.sampleRate === rate}
                    onChange={() =>
                      setRecorder((prev) => ({ ...prev, sampleRate: rate }))
                    }
                    disabled={recorder.isRecording}
                    id={`recorder-sample-rate-${rate}`}
                    aria-label={`Sample rate: ${rate}`}
                    className="radio-input"
                  />
                  <div className="radio-label">{rate / 1000}k</div>
                </div>
              ))}
            </div>
            <p className="form-helper-text">
              Higher sample rates capture more audio detail but create larger
              files.
            </p>
          </div>
        </div>
      </div>

      {/* Recorded Files Section */}
      <div className="form-section">
        <div className="form-section-header">
          <h2 className="form-section-title">Recent Recordings</h2>
          <p className="form-section-description">
            Manage and access your previously recorded audio files.
          </p>
        </div>

        <div className="form-field">
          <div className="space-y-3">
            {recordedFiles.map((file) => (
              <div key={file.id} className="form-card">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {file.processed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <Music className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{file.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)} •{" "}
                      {formatDuration(file.duration)} • {file.format}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {file.sampleRate / 1000}kHz • {file.bitDepth}-bit •{" "}
                      {file.channels} channels
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="btn-outline">
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                    <Button size="sm" variant="outline" className="btn-outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Audio Converter Component
export function AudioConverter() {
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [inputFormat, setInputFormat] = useState("wav");
  const [outputFormat, setOutputFormat] = useState("mp3");
  const [quality, setQuality] = useState("medium");

  const formatOptions = [
    { value: "wav", label: "WAV", description: "Uncompressed audio" },
    { value: "mp3", label: "MP3", description: "Compressed audio" },
    { value: "flac", label: "FLAC", description: "Lossless compression" },
    { value: "aac", label: "AAC", description: "Advanced audio coding" },
    { value: "ogg", label: "OGG", description: "Open source format" },
  ];

  const qualityOptions = [
    { value: "low", label: "Low", bitrate: "128 kbps" },
    { value: "medium", label: "Medium", bitrate: "192 kbps" },
    { value: "high", label: "High", bitrate: "320 kbps" },
  ];

  const startConversion = () => {
    setIsConverting(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsConverting(false);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  return (
    <div className="form-container form-container-md">
      <div className="form-section">
        <div className="form-section-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCw className="h-5 w-5" />
              <h2 className="form-section-title">Audio Converter</h2>
            </div>
            <Badge variant={isConverting ? "default" : "secondary"}>
              {isConverting ? "Converting" : "Ready"}
            </Badge>
          </div>
          <p className="form-section-description">
            Convert audio files between different formats with customizable
            quality settings.
          </p>
        </div>

        {/* Format Selection */}
        <div className="form-grid form-grid-2">
          <div className="form-field">
            <label className="form-label">Input Format</label>
            <div className="radio-group">
              {formatOptions.map((format) => (
                <div
                  key={format.value}
                  className={`radio-item ${
                    inputFormat === format.value ? "selected" : ""
                  } ${isConverting ? "disabled" : ""}`}
                >
                  <input
                    type="radio"
                    name="input"
                    value={format.value}
                    checked={inputFormat === format.value}
                    onChange={(e) => setInputFormat(e.target.value)}
                    disabled={isConverting}
                    id={`input-format-${format.value}`}
                    aria-label={`Input format: ${format.label}`}
                    className="radio-input"
                  />
                  <div>
                    <div className="radio-label">{format.label}</div>
                    <div className="radio-description">
                      {format.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="form-helper-text">
              Select the format of your source audio file.
            </p>
          </div>

          <div className="form-field">
            <label className="form-label">Output Format</label>
            <div className="radio-group">
              {formatOptions.map((format) => (
                <div
                  key={format.value}
                  className={`radio-item ${
                    outputFormat === format.value ? "selected" : ""
                  } ${isConverting ? "disabled" : ""}`}
                >
                  <input
                    type="radio"
                    name="output"
                    value={format.value}
                    checked={outputFormat === format.value}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    disabled={isConverting}
                    id={`output-format-${format.value}`}
                    aria-label={`Output format: ${format.label}`}
                    className="radio-input"
                  />
                  <div>
                    <div className="radio-label">{format.label}</div>
                    <div className="radio-description">
                      {format.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="form-helper-text">
              Choose the desired output format for conversion.
            </p>
          </div>
        </div>

        {/* Quality Settings */}
        <div className="form-field form-field-lg">
          <label className="form-label">Quality Settings</label>
          <div className="radio-group radio-group-horizontal">
            {qualityOptions.map((q) => (
              <div
                key={q.value}
                className={`radio-compact ${
                  quality === q.value ? "selected" : ""
                } ${isConverting ? "disabled" : ""}`}
              >
                <input
                  type="radio"
                  name="quality"
                  value={q.value}
                  checked={quality === q.value}
                  onChange={(e) => setQuality(e.target.value)}
                  disabled={isConverting}
                  id={`quality-${q.value}`}
                  aria-label={`Quality: ${q.label}`}
                  className="radio-input"
                />
                <div className="radio-label">
                  <div className="font-medium">{q.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {q.bitrate}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="form-helper-text">
            Higher quality provides better audio fidelity but results in larger
            file sizes.
          </p>
        </div>

        {/* Conversion Controls */}
        <div className="form-field form-field-lg">
          <label className="form-label">Conversion</label>
          <div className="form-actions form-actions-center">
            <Button
              onClick={startConversion}
              disabled={isConverting}
              className="btn-primary"
            >
              {isConverting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  Converting...
                </>
              ) : (
                <>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Start Conversion
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress */}
        {isConverting && (
          <div className="form-field form-field-lg">
            <label className="form-label">Conversion Progress</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>
                  Converting {inputFormat.toUpperCase()} to{" "}
                  {outputFormat.toUpperCase()}...
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="form-helper-text">
                Please wait while your file is being converted. Do not close
                this window.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Audio Storage Manager
export function AudioStorageManager() {
  const [storageInfo, setStorageInfo] = useState({
    total: 10737418240, // 10GB
    used: 6442450944, // 6GB
    available: 4294967296, // 4GB
    files: 1247,
    projects: 23,
  });

  const usagePercentage = (storageInfo.used / storageInfo.total) * 100;

  const formatFileSize = (bytes: number) => {
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="form-container form-container-md">
      <div className="form-section">
        <div className="form-section-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              <h2 className="form-section-title">Audio Storage Manager</h2>
            </div>
            <Badge
              variant={
                usagePercentage > 80
                  ? "destructive"
                  : usagePercentage > 60
                  ? "secondary"
                  : "default"
              }
            >
              {Math.round(usagePercentage)}% Used
            </Badge>
          </div>
          <p className="form-section-description">
            Monitor and manage your audio storage usage and optimization.
          </p>
        </div>

        {/* Storage Overview */}
        <div className="form-grid form-grid-4">
          <div className="form-field">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatFileSize(storageInfo.total)}
              </div>
              <div className="text-sm text-muted-foreground">Total Storage</div>
            </div>
          </div>
          <div className="form-field">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {formatFileSize(storageInfo.used)}
              </div>
              <div className="text-sm text-muted-foreground">Used</div>
            </div>
          </div>
          <div className="form-field">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {formatFileSize(storageInfo.available)}
              </div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
          </div>
          <div className="form-field">
            <div className="text-center">
              <div className="text-2xl font-bold">{storageInfo.files}</div>
              <div className="text-sm text-muted-foreground">Files</div>
            </div>
          </div>
        </div>

        {/* Storage Bar */}
        <div className="form-field form-field-lg">
          <label className="form-label">Storage Usage</label>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Storage Usage</span>
              <span>{Math.round(usagePercentage)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ease-out ${
                  usagePercentage > 80
                    ? "bg-destructive"
                    : usagePercentage > 60
                    ? "bg-orange-500"
                    : "bg-primary"
                }`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 GB</span>
              <span>{formatFileSize(storageInfo.used)}</span>
              <span>{formatFileSize(storageInfo.total)}</span>
            </div>
          </div>
        </div>

        {/* File Categories */}
        <div className="form-grid form-grid-2">
          <div className="form-card">
            <div className="form-card-header">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <h3 className="form-card-title">Audio Files</h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Recordings</span>
                <span>2.1 GB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Imports</span>
                <span>1.8 GB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Exports</span>
                <span>1.2 GB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Backups</span>
                <span>1.3 GB</span>
              </div>
            </div>
          </div>

          <div className="form-card">
            <div className="form-card-header">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <h3 className="form-card-title">Project Data</h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Projects</span>
                <span>{storageInfo.projects}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Archived Projects</span>
                <span>47</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Collaboration Files</span>
                <span>856 MB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cache & Temp</span>
                <span>234 MB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Storage Actions */}
        <div className="form-field form-field-lg">
          <label className="form-label">Storage Management</label>
          <div className="form-actions form-actions-center form-actions-loose">
            <Button variant="outline" className="btn-outline">
              <Cloud className="h-4 w-4 mr-2" />
              Backup to Cloud
            </Button>
            <Button variant="outline" className="btn-outline">
              <RotateCw className="h-4 w-4 mr-2" />
              Clean Up Cache
            </Button>
            <Button variant="outline" className="btn-outline">
              <Archive className="h-4 w-4 mr-2" />
              Archive Old Files
            </Button>
            <Button variant="outline" className="btn-outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Storage Recommendations */}
        <div className="form-field form-field-lg">
          <label className="form-label">Recommendations</label>
          <div className="space-y-2">
            {usagePercentage > 80 ? (
              <div className="flex items-center gap-2 text-red-600 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Storage is critically low. Consider upgrading or archiving
                  files.
                </span>
              </div>
            ) : usagePercentage > 60 ? (
              <div className="flex items-center gap-2 text-yellow-600 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Storage is getting full. Clean up cache and archive old files.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Storage usage is optimal.
                </span>
              </div>
            )}
            <div className="space-y-1 text-sm text-muted-foreground">
              <div>• Consider enabling automatic cloud backup</div>
              <div>• Archive completed projects to free up space</div>
              <div>• Regular cleanup of temporary files recommended</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
