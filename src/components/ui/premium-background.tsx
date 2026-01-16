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
    let mouseX = 0;
    let mouseY = 0;
    let time = 0;

    // Particle system
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
      maxLife: number;
    }

    const particles: Particle[] = [];
    const maxParticles = 150;

    // Premium color palette
    const colors = [
      "rgba(139, 92, 246, 0.8)",  // Violet
      "rgba(236, 72, 153, 0.8)",  // Pink
      "rgba(59, 130, 246, 0.8)",  // Blue
      "rgba(16, 185, 129, 0.6)",  // Emerald
      "rgba(251, 191, 36, 0.5)", // Amber
    ];

    const createParticle = (x?: number, y?: number): Particle => ({
      x: x ?? Math.random() * width,
      y: y ?? Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: Math.random() * 300 + 200,
    });

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // Initialize particles
      particles.length = 0;
      for (let i = 0; i < maxParticles; i++) {
        particles.push(createParticle());
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const drawGradientOrb = (x: number, y: number, radius: number, color1: string, color2: string) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = () => {
      time += 0.01;

      // Clear with fade effect for trails
      ctx.fillStyle = "rgba(0, 0, 0, 0.03)";
      ctx.fillRect(0, 0, width, height);

      // Draw large floating orbs
      const orb1X = width * 0.3 + Math.sin(time * 0.5) * 100;
      const orb1Y = height * 0.4 + Math.cos(time * 0.3) * 80;
      drawGradientOrb(orb1X, orb1Y, 300, "rgba(139, 92, 246, 0.15)", "rgba(139, 92, 246, 0)");

      const orb2X = width * 0.7 + Math.cos(time * 0.4) * 120;
      const orb2Y = height * 0.6 + Math.sin(time * 0.6) * 60;
      drawGradientOrb(orb2X, orb2Y, 250, "rgba(236, 72, 153, 0.12)", "rgba(236, 72, 153, 0)");

      const orb3X = width * 0.5 + Math.sin(time * 0.7) * 80;
      const orb3Y = height * 0.3 + Math.cos(time * 0.5) * 100;
      drawGradientOrb(orb3X, orb3Y, 200, "rgba(59, 130, 246, 0.1)", "rgba(59, 130, 246, 0)");

      // Mouse follow orb
      drawGradientOrb(mouseX, mouseY, 150, "rgba(251, 191, 36, 0.08)", "rgba(251, 191, 36, 0)");

      // Update and draw particles
      particles.forEach((p, i) => {
        p.life++;

        // Respawn if dead
        if (p.life > p.maxLife) {
          particles[i] = createParticle();
          return;
        }

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw with fade based on life
        const alpha = 1 - (p.life / p.maxLife);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${alpha * 0.8})`);
        ctx.fill();
      });

      // Draw connections between nearby particles
      ctx.lineWidth = 0.5;
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.3;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.stroke();
          }
        });
      });

      // Animated wave lines
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, height * 0.5);

        for (let x = 0; x < width; x += 2) {
          const y = Math.sin(x * 0.003 + time * (i + 1) * 0.5) * (50 + i * 20) +
                   Math.cos(x * 0.005 + time * 0.3) * 30;
          ctx.lineTo(x, height * (0.4 + i * 0.15) + y);
        }

        ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 - i * 0.02})`;
        ctx.lineWidth = 2 - i * 0.5;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("fixed inset-0 w-full h-full pointer-events-none z-0", className)}
      style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)" }}
    />
  );
}
