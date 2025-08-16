"use client";

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface ParticleFieldProps {
  particleCount?: number;
  particleSize?: [number, number]; // [min, max]
  particleColor?: string | string[];
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'random';
  opacity?: [number, number]; // [min, max]
  className?: string;
  interactive?: boolean;
  shapes?: ParticleShape[];
  glowEffect?: boolean;
  connectionLines?: boolean;
  connectionDistance?: number;
  fpsLimit?: number;
}

export type ParticleShape = 'circle' | 'star' | 'diamond' | 'triangle' | 'square' | 'symbol';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  shape: ParticleShape;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
}

/**
 * Immersive Particle Field Effect
 * Creates floating mystical particles with various shapes and behaviors
 */
export function ParticleField({
  particleCount = 50,
  particleSize = [2, 6],
  particleColor = '#d4af37',
  speed = 1,
  direction = 'up',
  opacity = [0.3, 0.8],
  className,
  interactive = false,
  shapes = ['circle', 'star'],
  glowEffect = true,
  connectionLines = false,
  connectionDistance = 100,
  fpsLimit = 60
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastFrameTimeRef = useRef(0);
  const fpsIntervalRef = useRef(1000 / fpsLimit);

  const colors = useMemo(() => 
    Array.isArray(particleColor) ? particleColor : [particleColor]
  , [particleColor]);

  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => {
    const size = particleSize[0] + Math.random() * (particleSize[1] - particleSize[0]);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    let x, y, vx, vy;
    
    switch (direction) {
      case 'up':
        x = Math.random() * canvas.width;
        y = canvas.height + size;
        vx = (Math.random() - 0.5) * speed * 0.5;
        vy = -Math.random() * speed - 0.5;
        break;
      case 'down':
        x = Math.random() * canvas.width;
        y = -size;
        vx = (Math.random() - 0.5) * speed * 0.5;
        vy = Math.random() * speed + 0.5;
        break;
      case 'left':
        x = canvas.width + size;
        y = Math.random() * canvas.height;
        vx = -Math.random() * speed - 0.5;
        vy = (Math.random() - 0.5) * speed * 0.5;
        break;
      case 'right':
        x = -size;
        y = Math.random() * canvas.height;
        vx = Math.random() * speed + 0.5;
        vy = (Math.random() - 0.5) * speed * 0.5;
        break;
      default: // random
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
        vx = (Math.random() - 0.5) * speed;
        vy = (Math.random() - 0.5) * speed;
    }

    return {
      x,
      y,
      vx,
      vy,
      size,
      color,
      opacity: opacity[0] + Math.random() * (opacity[1] - opacity[0]),
      shape,
      life: 0,
      maxLife: Math.random() * 5000 + 3000, // 3-8 seconds
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02
    };
  }, [particleSize, colors, shapes, direction, speed, opacity]);

  const drawParticle = useCallback((
    ctx: CanvasRenderingContext2D,
    particle: Particle
  ) => {
    ctx.save();
    
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    ctx.globalAlpha = particle.opacity;
    
    if (glowEffect) {
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = particle.size * 2;
    }
    
    ctx.fillStyle = particle.color;
    ctx.strokeStyle = particle.color;
    ctx.lineWidth = 1;

    switch (particle.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'star':
        drawStar(ctx, 0, 0, 5, particle.size / 2, particle.size / 4);
        break;
        
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(0, -particle.size / 2);
        ctx.lineTo(particle.size / 2, 0);
        ctx.lineTo(0, particle.size / 2);
        ctx.lineTo(-particle.size / 2, 0);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -particle.size / 2);
        ctx.lineTo(-particle.size / 2, particle.size / 2);
        ctx.lineTo(particle.size / 2, particle.size / 2);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'square':
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        break;
        
      case 'symbol':
        // Draw a simple mystical symbol (ankh-like)
        ctx.beginPath();
        ctx.arc(0, -particle.size / 4, particle.size / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-particle.size / 8, -particle.size / 4, particle.size / 4, particle.size / 2);
        ctx.fillRect(-particle.size / 4, particle.size / 8, particle.size / 2, particle.size / 8);
        break;
    }
    
    ctx.restore();
  }, [glowEffect]);

  const drawConnections = useCallback((
    ctx: CanvasRenderingContext2D,
    particles: Particle[]
  ) => {
    if (!connectionLines) return;

    ctx.save();
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 0.5;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          const opacity = (1 - distance / connectionDistance) * 0.5;
          ctx.globalAlpha = opacity;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }, [connectionLines, connectionDistance, colors]);

  const updateParticles = useCallback((
    canvas: HTMLCanvasElement,
    deltaTime: number
  ) => {
    const particles = particlesRef.current;
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      
      // Update position
      particle.x += particle.vx * deltaTime * 0.1;
      particle.y += particle.vy * deltaTime * 0.1;
      particle.rotation += particle.rotationSpeed * deltaTime * 0.1;
      particle.life += deltaTime;

      // Interactive behavior
      if (interactive) {
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100;
          particle.vx += (dx / distance) * force * 0.1;
          particle.vy += (dy / distance) * force * 0.1;
        }
      }

      // Fade out at end of life
      if (particle.life > particle.maxLife * 0.8) {
        const fadeProgress = (particle.life - particle.maxLife * 0.8) / (particle.maxLife * 0.2);
        particle.opacity = (opacity[0] + Math.random() * (opacity[1] - opacity[0])) * (1 - fadeProgress);
      }

      // Remove dead particles
      if (particle.life > particle.maxLife ||
          particle.x < -50 || particle.x > canvas.width + 50 ||
          particle.y < -50 || particle.y > canvas.height + 50) {
        particles.splice(i, 1);
      }
    }

    // Add new particles to maintain count
    while (particles.length < particleCount) {
      particles.push(createParticle(canvas));
    }
  }, [particleCount, createParticle, interactive, opacity]);

  const animate = useCallback((currentTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // FPS limiting
    if (currentTime - lastFrameTimeRef.current < fpsIntervalRef.current) {
      animationFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    const deltaTime = currentTime - lastFrameTimeRef.current;
    lastFrameTimeRef.current = currentTime;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    updateParticles(canvas, deltaTime);
    drawConnections(ctx, particlesRef.current);
    
    particlesRef.current.forEach(particle => {
      drawParticle(ctx, particle);
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [updateParticles, drawConnections, drawParticle]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!interactive) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouseRef.current.y = (e.clientY - rect.top) * (canvas.height / rect.height);
  }, [interactive]);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Setup canvas
    handleResize();

    // Initialize particles
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(createParticle(canvas));
    }

    // Start animation
    lastFrameTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    // Event listeners
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [particleCount, createParticle, animate, handleMouseMove, handleResize, interactive]);

  // Update FPS interval when limit changes
  useEffect(() => {
    fpsIntervalRef.current = 1000 / fpsLimit;
  }, [fpsLimit]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'absolute inset-0 pointer-events-none',
        { 'pointer-events-auto': interactive },
        className
      )}
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

/**
 * Helper function to draw a star shape
 */
function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  ctx.beginPath();
  
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const pointX = x + Math.cos(angle) * radius;
    const pointY = y + Math.sin(angle) * radius;
    
    if (i === 0) {
      ctx.moveTo(pointX, pointY);
    } else {
      ctx.lineTo(pointX, pointY);
    }
  }
  
  ctx.closePath();
  ctx.fill();
}

/**
 * Preset particle configurations
 */
export const PARTICLE_PRESETS = {
  'cosmic-dust': {
    particleCount: 100,
    particleSize: [1, 3] as [number, number],
    particleColor: ['#9147ff', '#a855f7', '#d8b4fe'] as string[],
    speed: 0.5,
    direction: 'up' as const,
    shapes: ['circle'] as ParticleShape[],
    glowEffect: true,
    connectionLines: false
  },
  'stellar-field': {
    particleCount: 75,
    particleSize: [2, 6] as [number, number],
    particleColor: ['#fbbf24', '#f59e0b', '#d97706'] as string[],
    speed: 0.3,
    direction: 'random' as const,
    shapes: ['star', 'circle'] as ParticleShape[],
    glowEffect: true,
    connectionLines: true,
    connectionDistance: 120
  },
  'mystical-energy': {
    particleCount: 50,
    particleSize: [3, 8] as [number, number],
    particleColor: ['#34d399', '#10b981', '#059669'] as string[],
    speed: 1,
    direction: 'up' as const,
    shapes: ['diamond', 'triangle', 'symbol'] as ParticleShape[],
    glowEffect: true,
    interactive: true
  },
  'ethereal-mist': {
    particleCount: 150,
    particleSize: [1, 4] as [number, number],
    particleColor: ['#64748b', '#94a3b8', '#cbd5e1'] as string[],
    speed: 0.2,
    direction: 'random' as const,
    shapes: ['circle'] as ParticleShape[],
    opacity: [0.1, 0.3] as [number, number],
    glowEffect: false,
    connectionLines: false
  },
  'alchemical-symbols': {
    particleCount: 25,
    particleSize: [4, 10] as [number, number],
    particleColor: '#d4af37',
    speed: 0.4,
    direction: 'up' as const,
    shapes: ['symbol', 'diamond', 'triangle'] as ParticleShape[],
    glowEffect: true,
    interactive: true
  }
} as const;

export type ParticlePreset = keyof typeof PARTICLE_PRESETS;