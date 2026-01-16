"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface PremiumBackgroundProps {
  className?: string;
}

export function PremiumBackground({ className }: PremiumBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const drawGlowingWave = (
      yBase: number,
      amplitude: number,
      frequency: number,
      speed: number,
      color: string,
      glowColor: string,
      lineWidth: number,
      phaseOffset: number = 0
    ) => {
      ctx.beginPath();
      ctx.moveTo(0, height * yBase);

      for (let x = 0; x < width; x += 1) {
        // Complex wave with multiple harmonics for organic feel
        const wave1 = Math.sin(x * frequency + time * speed + phaseOffset) * amplitude;
        const wave2 = Math.sin(x * frequency * 0.5 + time * speed * 0.7) * (amplitude * 0.4);
        const wave3 = Math.cos(x * frequency * 0.3 + time * speed * 0.5) * (amplitude * 0.2);
        const pulse = Math.sin(time * 0.5) * 10; // Gentle pulsing

        const y = wave1 + wave2 + wave3 + pulse;
        ctx.lineTo(x, height * yBase + y);
      }

      // Draw glow effect (multiple strokes with decreasing opacity)
      ctx.shadowBlur = 30;
      ctx.shadowColor = glowColor;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // Second pass for brighter core
      ctx.shadowBlur = 15;
      ctx.shadowColor = glowColor;
      ctx.strokeStyle = color.replace(/[\d.]+\)$/, "0.8)");
      ctx.lineWidth = lineWidth * 0.6;
      ctx.stroke();

      ctx.shadowBlur = 0;
    };

    const draw = () => {
      time += 0.015;

      // Clear with solid background
      ctx.fillStyle = "#0a0a1a";
      ctx.fillRect(0, 0, width, height);

      // Add subtle gradient overlay
      const gradient = ctx.createRadialGradient(
        width * 0.5, height * 0.4, 0,
        width * 0.5, height * 0.4, width * 0.8
      );
      gradient.addColorStop(0, "rgba(139, 92, 246, 0.05)");
      gradient.addColorStop(0.5, "rgba(236, 72, 153, 0.03)");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Beautiful layered waves with glow
      // Back layer (subtle, wide)
      drawGlowingWave(0.25, 25, 0.002, 0.3, "rgba(59, 130, 246, 0.08)", "rgba(59, 130, 246, 0.3)", 1.5, 0);
      drawGlowingWave(0.3, 30, 0.0025, 0.35, "rgba(139, 92, 246, 0.1)", "rgba(139, 92, 246, 0.4)", 1.8, 0.5);

      // Mid layer (more prominent)
      drawGlowingWave(0.4, 40, 0.003, 0.4, "rgba(236, 72, 153, 0.15)", "rgba(236, 72, 153, 0.5)", 2, 1);
      drawGlowingWave(0.5, 45, 0.0035, 0.45, "rgba(139, 92, 246, 0.2)", "rgba(139, 92, 246, 0.6)", 2.5, 1.5);

      // Front layer (most visible, vibrant)
      drawGlowingWave(0.6, 50, 0.004, 0.5, "rgba(236, 72, 153, 0.25)", "rgba(236, 72, 153, 0.7)", 3, 2);
      drawGlowingWave(0.7, 35, 0.003, 0.55, "rgba(59, 130, 246, 0.18)", "rgba(59, 130, 246, 0.5)", 2, 2.5);

      // Accent waves (subtle, add depth)
      drawGlowingWave(0.35, 20, 0.005, 0.6, "rgba(251, 191, 36, 0.08)", "rgba(251, 191, 36, 0.3)", 1, 3);
      drawGlowingWave(0.75, 30, 0.004, 0.4, "rgba(16, 185, 129, 0.1)", "rgba(16, 185, 129, 0.4)", 1.5, 3.5);

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("fixed inset-0 w-full h-full pointer-events-none z-0", className)}
      style={{ background: "linear-gradient(180deg, #0a0a1a 0%, #15082e 40%, #0a0a1a 100%)" }}
    />
  );
}
