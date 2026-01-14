"use client";

import { useEffect, useRef } from "react";

interface AnimatedWaveBackgroundProps {
  className?: string;
}

export function AnimatedWaveBackground({
  className = "",
}: AnimatedWaveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>();
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // Wave parameters
    const waves = [
      {
        amplitude: 50,
        frequency: 0.01,
        speed: 0.002,
        phase: 0,
        color: "rgba(99, 102, 241, 0.1)",
      },
      {
        amplitude: 40,
        frequency: 0.015,
        speed: 0.003,
        phase: Math.PI / 4,
        color: "rgba(139, 92, 246, 0.1)",
      },
      {
        amplitude: 30,
        frequency: 0.02,
        speed: 0.004,
        phase: Math.PI / 2,
        color: "rgba(236, 72, 153, 0.08)",
      },
      {
        amplitude: 25,
        frequency: 0.025,
        speed: 0.005,
        phase: (Math.PI * 3) / 4,
        color: "rgba(59, 130, 246, 0.06)",
      },
      {
        amplitude: 20,
        frequency: 0.03,
        speed: 0.006,
        phase: Math.PI,
        color: "rgba(34, 211, 238, 0.04)",
      },
    ];

    // Animation loop
    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw gradient background
      const isDark = document.documentElement.classList.contains("dark");
      const gradient = ctx.createLinearGradient(0, 0, 0, height);

      if (isDark) {
        gradient.addColorStop(0, "rgba(15, 23, 42, 0.8)");
        gradient.addColorStop(1, "rgba(30, 41, 59, 0.9)");
      } else {
        gradient.addColorStop(0, "rgba(248, 250, 252, 0.95)");
        gradient.addColorStop(1, "rgba(241, 245, 249, 0.98)");
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw waves
      waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 2;

        for (let x = 0; x <= width; x += 5) {
          const y =
            centerY +
            Math.sin(
              x * wave.frequency + timeRef.current * wave.speed + wave.phase
            ) *
              wave.amplitude *
              Math.sin(timeRef.current * 0.001 + index);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();

        // Add glow effect
        ctx.shadowColor = wave.color;
        ctx.shadowBlur = 10;
      });

      // Reset shadow
      ctx.shadowBlur = 0;

      // Update time
      timeRef.current += 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 -z-10 ${className}`}
      style={{ background: "transparent" }}
    />
  );
}
