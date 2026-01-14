'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AudioVisualizerProps {
  audioFile: File;
  notes?: Array<{ startTime: number; duration: number; midi: number }>;
  showNotes?: boolean;
  className?: string;
}

export function AudioVisualizer({
  audioFile,
  notes = [],
  showNotes = false,
  className = '',
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [waveformData, setWaveformData] = useState<Float32Array | null>(null);

  // Load audio file
  useEffect(() => {
    if (!audioFile) return;

    const loadAudio = async () => {
      try {
        const ctx = new AudioContext();
        setAudioContext(ctx);

        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = await ctx.decodeAudioData(arrayBuffer);
        setAudioBuffer(buffer);
        setDuration(buffer.duration);

        // Generate waveform data
        const channelData = buffer.getChannelData(0);
        const samples = 1000;
        const blockSize = Math.floor(channelData.length / samples);
        const waveform = new Float32Array(samples);

        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[i * blockSize + j]);
          }
          waveform[i] = sum / blockSize;
        }

        setWaveformData(waveform);
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    };

    loadAudio();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioFile]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawWaveform = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw waveform
      ctx.beginPath();
      ctx.strokeStyle = 'rgb(99, 102, 241)';
      ctx.lineWidth = 1;

      const centerY = height / 2;
      const maxAmplitude = height / 2 - 20;

      for (let i = 0; i < waveformData.length; i++) {
        const x = (i / waveformData.length) * width;
        const amplitude = waveformData[i] * maxAmplitude * 5; // Scale up for visibility
        const y = centerY - amplitude;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Mirror for symmetric waveform
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';

      for (let i = 0; i < waveformData.length; i++) {
        const x = (i / waveformData.length) * width;
        const amplitude = waveformData[i] * maxAmplitude * 5;
        const y = centerY + amplitude;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Draw playhead
      const playheadX = (currentTime / duration) * width;
      ctx.beginPath();
      ctx.strokeStyle = 'rgb(239, 68, 68)';
      ctx.lineWidth = 2;
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();

      // Draw notes if enabled
      if (showNotes && notes.length > 0) {
        notes.forEach(note => {
          const x = (note.startTime / duration) * width;
          const widthPx = (note.duration / duration) * width;
          const y = height - ((note.midi - 21) / 87) * (height - 40) - 20;

          ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
          ctx.fillRect(x, y, widthPx, 4);
        });
      }

      animationRef.current = requestAnimationFrame(drawWaveform);
    };

    drawWaveform();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [waveformData, currentTime, duration, notes, showNotes]);

  const togglePlay = () => {
    if (!audioRef.current || !audioBuffer) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const source = audioContext?.createBufferSource();
      source?.connect(analyser || audioContext?.destination);

      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !audioRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;

    audioRef.current.currentTime = percentage * duration;
    setCurrentTime(percentage * duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`p-4 ${className}`}>
      <audio
        ref={audioRef}
        src={URL.createObjectURL(audioFile)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="space-y-4">
        {/* Canvas */}
        <div className="relative w-full">
          <canvas
            ref={canvasRef}
            width={800}
            height={120}
            className="w-full h-32 bg-background cursor-pointer rounded-lg border"
            onClick={handleSeek}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={togglePlay}
              disabled={!audioBuffer}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              disabled={!audioBuffer}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            <span className="text-sm text-muted-foreground ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="text-sm text-muted-foreground">
            {notes.length} notes detected
          </div>
        </div>
      </div>
    </Card>
  );
}
