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

    // Wave configuration - original pattern spread across page
    const waves = [
      { color: "rgba(236, 72, 153, 0.5)", speed: 0.02, amplitude: 100, frequency: 0.005, yOffset: -200 },   // Pink
      { color: "rgba(168, 85, 247, 0.5)", speed: 0.03, amplitude: 80, frequency: 0.008, yOffset: -100 },    // Purple
      { color: "rgba(59, 130, 246, 0.5)", speed: 0.015, amplitude: 120, frequency: 0.004, yOffset: 0 },     // Blue
      { color: "rgba(14, 165, 233, 0.3)", speed: 0.04, amplitude: 60, frequency: 0.01, yOffset: 100 },      // Sky
      { color: "rgba(139, 92, 246, 0.4)", speed: 0.025, amplitude: 90, frequency: 0.006, yOffset: 200 },    // Violet
    ];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Fading tech grid background - fades from center
      ctx.lineWidth = 1;
      const gridSize = 40;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          const distX = Math.abs(x - centerX);
          const distY = Math.abs(y - centerY);
          const dist = Math.sqrt(distX * distX + distY * distY);
          const alpha = Math.max(0, 0.03 * (1 - dist / maxDist));

          if (alpha > 0.003) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, Math.min(y + gridSize, height));
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(Math.min(x + gridSize, width), y);
            ctx.stroke();
          }
        }
      }

      // Draw waves
      const centerWaveY = height / 2;

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, centerWaveY + wave.yOffset);

        for (let x = 0; x < width; x++) {
          const y = Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude * Math.sin(time * 0.05) + (Math.cos(x * 0.002) * 50);
          ctx.lineTo(x, centerWaveY + y + wave.yOffset);
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
