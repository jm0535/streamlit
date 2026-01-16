"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SoundWaveProps {
  className?: string;
}

export function SoundWaveBackground({ className }: SoundWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Wave configuration
    const waves = [
      { color: "rgba(236, 72, 153, 0.5)", speed: 0.02, amplitude: 100, frequency: 0.005, yOffset: 0 },   // Pink
      { color: "rgba(168, 85, 247, 0.5)", speed: 0.03, amplitude: 80, frequency: 0.008, yOffset: 50 },    // Purple
      { color: "rgba(59, 130, 246, 0.5)", speed: 0.015, amplitude: 120, frequency: 0.004, yOffset: -50 }, // Blue
      { color: "rgba(14, 165, 233, 0.3)", speed: 0.04, amplitude: 60, frequency: 0.01, yOffset: 100 },    // Sky
    ];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Tech grid background
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 40;

      // Draw grid
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw waves
      const centerY = height / 2;

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, centerY);

        for (let x = 0; x < width; x++) {
          const y = Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude * Math.sin(time * 0.05) + (Math.cos(x * 0.002) * 50);
          ctx.lineTo(x, centerY + y + wave.yOffset);
        }

        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Add a glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = wave.color;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(() => draw(time + 1));
    };

    window.addEventListener("resize", resize);
    resize();
    draw(0);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("fixed inset-0 w-full h-full pointer-events-none z-0", className)}
    />
  );
}
