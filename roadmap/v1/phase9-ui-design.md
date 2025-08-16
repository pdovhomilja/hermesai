# Phase 9: UI/UX & Mystical Design System

## Overview

This phase implements a comprehensive mystical design system with ancient aesthetics, sacred geometry, alchemical symbols, and immersive visual elements that enhance the spiritual experience while maintaining modern usability.

## Prerequisites

- Phases 1-8 completed
- Tailwind CSS v4 configured ✅
- Radix UI components installed ✅

## Phase Objectives

1. Create mystical design tokens and theme
2. Implement sacred geometry backgrounds
3. Build alchemical symbol library
4. Design immersive chat interface
5. Create animated spiritual journey visualization
6. Implement particle effects and animations
7. Build responsive mystical components

## Implementation Steps

### Step 1: Design System Foundation

Create `styles/mystical-theme.css`:

```css
@layer base {
  :root {
    /* Sacred Colors - Light Mode */
    --color-cosmos: 25 24 63; /* Deep purple night */
    --color-celestial: 88 86 214; /* Celestial blue */
    --color-amethyst: 139 92 246; /* Mystical purple */
    --color-gold: 251 191 36; /* Alchemical gold */
    --color-emerald: 16 185 129; /* Emerald tablet green */
    --color-moonstone: 241 245 249; /* Ethereal white */
    --color-obsidian: 15 23 42; /* Deep black */

    /* Gradients */
    --gradient-mystical: linear-gradient(
      135deg,
      rgb(var(--color-cosmos)) 0%,
      rgb(var(--color-amethyst)) 50%,
      rgb(var(--color-celestial)) 100%
    );
    --gradient-aurora: linear-gradient(
      45deg,
      #667eea 0%,
      #764ba2 25%,
      #f093fb 50%,
      #fecfef 75%,
      #fecfef 100%
    );
    --gradient-golden: linear-gradient(135deg, #f6d365 0%, #fda085 100%);

    /* Sacred Geometry */
    --golden-ratio: 1.618;
    --sacred-angle: 51.83deg; /* Pyramid angle */

    /* Typography */
    --font-ancient: "Cinzel", serif;
    --font-mystical: "Philosopher", sans-serif;
    --font-body: "Crimson Text", serif;

    /* Animations */
    --animation-ethereal: ethereal 3s ease-in-out infinite;
    --animation-pulse: pulse-glow 2s ease-in-out infinite;
    --animation-float: float 6s ease-in-out infinite;
  }

  .dark {
    --color-cosmos: 25 24 63;
    --color-celestial: 99 102 241;
    --color-amethyst: 168 85 247;
    --color-gold: 252 211 77;
    --color-emerald: 52 211 153;
    --color-moonstone: 30 41 59;
    --color-obsidian: 2 6 23;
  }
}

@keyframes ethereal {
  0%,
  100% {
    opacity: 0.6;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-5px);
  }
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(var(--color-amethyst), 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(var(--color-amethyst), 0.8);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-10px) rotate(1deg);
  }
  66% {
    transform: translateY(5px) rotate(-1deg);
  }
}
```

### Step 2: Sacred Geometry Components

Create `components/ui/sacred-geometry.tsx`:

```typescript
"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SacredGeometryProps {
  type: "metatron" | "flower-of-life" | "sri-yantra" | "merkaba";
  className?: string;
  animated?: boolean;
  color?: string;
  size?: number;
}

export function SacredGeometry({
  type,
  className,
  animated = false,
  color = "currentColor",
  size = 200,
}: SacredGeometryProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Set style
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;

    switch (type) {
      case "flower-of-life":
        drawFlowerOfLife(ctx, size);
        break;
      case "metatron":
        drawMetatronsCube(ctx, size);
        break;
      case "sri-yantra":
        drawSriYantra(ctx, size);
        break;
      case "merkaba":
        drawMerkaba(ctx, size);
        break;
    }
  }, [type, color, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={cn(
        "sacred-geometry",
        animated && "animate-spin-slow",
        className
      )}
    />
  );
}

function drawFlowerOfLife(ctx: CanvasRenderingContext2D, size: number) {
  const center = size / 2;
  const radius = size / 6;

  // Central circle
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Six surrounding circles
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6;
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Second layer
    for (let j = 0; j < 6; j++) {
      const angle2 = angle + (Math.PI * 2 * j) / 6;
      const x2 = center + Math.cos(angle2) * radius * 2;
      const y2 = center + Math.sin(angle2) * radius * 2;

      ctx.beginPath();
      ctx.arc(x2, y2, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawMetatronsCube(ctx: CanvasRenderingContext2D, size: number) {
  const center = size / 2;
  const radius = size / 3;

  // Draw 13 circles of Metatron's Cube
  const positions = [
    { x: center, y: center }, // Center
    // Inner hexagon
    ...Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 6;
      return {
        x: center + Math.cos(angle) * radius * 0.5,
        y: center + Math.sin(angle) * radius * 0.5,
      };
    }),
    // Outer hexagon
    ...Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 6;
      return {
        x: center + Math.cos(angle) * radius,
        y: center + Math.sin(angle) * radius,
      };
    }),
  ];

  // Draw circles
  positions.forEach((pos) => {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius / 4, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Connect all points
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      ctx.beginPath();
      ctx.moveTo(positions[i].x, positions[i].y);
      ctx.lineTo(positions[j].x, positions[j].y);
      ctx.globalAlpha = 0.1;
      ctx.stroke();
      ctx.globalAlpha = 0.6;
    }
  }
}

function drawSriYantra(ctx: CanvasRenderingContext2D, size: number) {
  const center = size / 2;

  // Draw interlocking triangles
  for (let i = 0; i < 9; i++) {
    const scale = 1 - i * 0.1;
    drawTriangle(ctx, center, center, size * 0.3 * scale, i % 2 === 0);
  }

  // Draw lotus petals
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const x = center + Math.cos(angle) * size * 0.35;
    const y = center + Math.sin(angle) * size * 0.35;

    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.08, size * 0.03, angle, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Outer square
  ctx.strokeRect(size * 0.1, size * 0.1, size * 0.8, size * 0.8);
}

function drawMerkaba(ctx: CanvasRenderingContext2D, size: number) {
  const center = size / 2;
  const radius = size * 0.4;

  // Draw two interlocking tetrahedrons
  // Upward pointing
  drawTriangle(ctx, center, center, radius, true);
  // Downward pointing
  drawTriangle(ctx, center, center, radius, false);

  // Draw containing circle
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.globalAlpha = 0.3;
  ctx.stroke();
  ctx.globalAlpha = 0.6;
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  pointUp: boolean
) {
  ctx.beginPath();
  if (pointUp) {
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size * 0.866, y + size * 0.5);
    ctx.lineTo(x + size * 0.866, y + size * 0.5);
  } else {
    ctx.moveTo(x, y + size);
    ctx.lineTo(x - size * 0.866, y - size * 0.5);
    ctx.lineTo(x + size * 0.866, y - size * 0.5);
  }
  ctx.closePath();
  ctx.stroke();
}
```

### Step 3: Alchemical Symbol Library

Create `components/ui/alchemical-symbols.tsx`:

```typescript
export const AlchemicalSymbols = {
  mercury: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle
        cx="50"
        cy="30"
        r="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="50"
        y1="45"
        x2="50"
        y2="70"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="35"
        y1="70"
        x2="65"
        y2="70"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M 35 10 Q 50 0, 65 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  ),

  sulfur: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M 30 30 L 70 30 L 50 60 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="50"
        y1="60"
        x2="50"
        y2="80"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="35"
        y1="80"
        x2="65"
        y2="80"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  ),

  salt: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle
        cx="50"
        cy="50"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="30"
        y1="50"
        x2="70"
        y2="50"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  ),

  philosophersStone: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle
        cx="50"
        cy="50"
        r="25"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="37.5"
        y="37.5"
        width="25"
        height="25"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M 50 25 L 62.5 37.5 L 62.5 62.5 L 50 75 L 37.5 62.5 L 37.5 37.5 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  ),

  quintessence: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M 50 20 L 65 40 L 60 65 L 40 65 L 35 40 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="50" cy="50" r="5" fill="currentColor" />
    </svg>
  ),

  ouroboros: (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M 50 25 A 20 20 0 1 1 30 45"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="30" cy="45" r="3" fill="currentColor" />
      <path
        d="M 27 43 Q 25 45, 27 47"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  ),
};

interface AlchemicalSymbolProps {
  symbol: keyof typeof AlchemicalSymbols;
  size?: number;
  className?: string;
  animated?: boolean;
}

export function AlchemicalSymbol({
  symbol,
  size = 40,
  className,
  animated = false,
}: AlchemicalSymbolProps) {
  return (
    <div
      className={cn(
        "inline-block text-amethyst",
        animated && "animate-pulse-glow",
        className
      )}
      style={{ width: size, height: size }}
    >
      {AlchemicalSymbols[symbol]}
    </div>
  );
}
```

### Step 4: Mystical Chat Interface

Create `components/chat/mystical-chat.tsx`:

```typescript
"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SacredGeometry } from "@/components/ui/sacred-geometry";
import { AlchemicalSymbol } from "@/components/ui/alchemical-symbols";
import { ParticleField } from "@/components/effects/particle-field";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Moon, Sun, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function MysticalChatInterface() {
  const [isNightMode, setIsNightMode] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
    });

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cosmos via-amethyst/20 to-obsidian" />
        <ParticleField count={50} />
        <SacredGeometry
          type="flower-of-life"
          size={800}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5"
          animated
        />
      </div>

      {/* Header with Mystical Elements */}
      <header className="relative z-10 border-b border-amethyst/20 backdrop-blur-md bg-cosmos/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AlchemicalSymbol symbol="philosophersStone" size={50} animated />
              <div>
                <h1 className="text-2xl font-ancient text-gold">
                  Hermes Trismegistus
                </h1>
                <p className="text-sm text-moonstone/70 font-mystical">
                  The Thrice-Great Guide
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNightMode(!isNightMode)}
              className="text-gold hover:bg-amethyst/20"
            >
              {isNightMode ? <Moon /> : <Sun />}
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-cosmos/30 backdrop-blur-lg border-amethyst/30 shadow-2xl">
          {/* Sacred Geometry Decoration */}
          <div className="absolute -top-10 -right-10 opacity-20">
            <SacredGeometry type="metatron" size={150} color="#fbbf24" />
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="h-[500px] overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-amethyst/30"
          >
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn(
                    "flex gap-4",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-emerald p-0.5">
                        <div className="w-full h-full rounded-full bg-cosmos flex items-center justify-center">
                          <AlchemicalSymbol symbol="mercury" size={24} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-6 py-4",
                      message.role === "user"
                        ? "bg-amethyst/30 text-moonstone border border-amethyst/50"
                        : "bg-gradient-to-br from-cosmos/50 to-celestial/20 text-moonstone border border-gold/30"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2 text-gold">
                        <Star className="w-4 h-4" />
                        <span className="text-sm font-mystical">
                          Hermes speaks:
                        </span>
                      </div>
                    )}

                    <div className="prose prose-invert prose-sm max-w-none">
                      {message.content}
                    </div>

                    {message.role === "assistant" &&
                      index === messages.length - 1 && (
                        <div className="mt-4 pt-4 border-t border-gold/20">
                          <div className="flex items-center gap-2 text-xs text-gold/70">
                            <AlchemicalSymbol symbol="ouroboros" size={16} />
                            <span className="font-mystical italic">
                              "As above, so below"
                            </span>
                          </div>
                        </div>
                      )}
                  </div>

                  {message.role === "user" && (
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amethyst to-celestial p-0.5">
                        <div className="w-full h-full rounded-full bg-cosmos flex items-center justify-center text-moonstone">
                          <Sparkles className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start gap-4"
              >
                <div className="w-12 h-12" />
                <div className="bg-gradient-to-br from-cosmos/50 to-celestial/20 rounded-2xl px-6 py-4 border border-gold/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-gold rounded-full animate-pulse delay-100" />
                    <div className="w-2 h-2 bg-gold rounded-full animate-pulse delay-200" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            className="p-6 border-t border-amethyst/30"
          >
            <div className="flex gap-4">
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Seek wisdom from the eternal sage..."
                className="flex-1 bg-cosmos/50 border-amethyst/30 text-moonstone placeholder:text-moonstone/50 resize-none font-mystical"
                rows={3}
              />

              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-gold to-emerald text-cosmos hover:opacity-90"
                >
                  <Sparkles className="w-5 h-5" />
                </Button>

                <div className="flex justify-center">
                  <AlchemicalSymbol
                    symbol="quintessence"
                    size={30}
                    className={cn(isLoading && "animate-spin")}
                  />
                </div>
              </div>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
```

### Step 5: Particle Effects

Create `components/effects/particle-field.tsx`:

```typescript
"use client";

import { useEffect, useRef } from "react";

interface ParticleFieldProps {
  count?: number;
  speed?: number;
  color?: string;
  connectDistance?: number;
}

export function ParticleField({
  count = 100,
  speed = 0.5,
  color = "#fbbf24",
  connectDistance = 100,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
      }

      draw() {
        if (!ctx) return;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = color + "33";
        ctx.fill();

        // Glow effect
        const gradient = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.radius * 3
        );
        gradient.addColorStop(0, color + "66");
        gradient.addColorStop(1, color + "00");

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    // Create particles
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    function connectParticles() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectDistance) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle =
              color +
              Math.floor((1 - distance / connectDistance) * 20).toString(16);
            ctx!.stroke();
          }
        }
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      connectParticles();

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [count, speed, color, connectDistance]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
```

### Step 6: Spiritual Journey Visualization

Create `components/journey/journey-visualization.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { SacredGeometry } from "@/components/ui/sacred-geometry";
import { AlchemicalSymbol } from "@/components/ui/alchemical-symbols";
import { format } from "date-fns";

interface JourneyNode {
  id: string;
  date: Date;
  type: "conversation" | "insight" | "milestone" | "transformation";
  title: string;
  description: string;
  principle?: string;
  significance: "low" | "medium" | "high" | "critical";
}

export function JourneyVisualization({ nodes }: { nodes: JourneyNode[] }) {
  const [selectedNode, setSelectedNode] = useState<JourneyNode | null>(null);

  const getNodeColor = (type: string) => {
    switch (type) {
      case "conversation":
        return "#8b5cf6"; // amethyst
      case "insight":
        return "#fbbf24"; // gold
      case "milestone":
        return "#10b981"; // emerald
      case "transformation":
        return "#f87171"; // rose
      default:
        return "#64748b";
    }
  };

  const getNodeSize = (significance: string) => {
    switch (significance) {
      case "critical":
        return 40;
      case "high":
        return 32;
      case "medium":
        return 24;
      case "low":
        return 16;
      default:
        return 20;
    }
  };

  return (
    <div className="relative min-h-[600px] bg-gradient-to-br from-cosmos to-obsidian rounded-lg p-8">
      {/* Background Sacred Geometry */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <SacredGeometry type="sri-yantra" size={400} color="#fbbf24" />
      </div>

      {/* Journey Path */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {nodes.length > 1 && (
          <path
            d={`M ${100} ${100} ${nodes
              .map(
                (_, i) =>
                  `Q ${150 + i * 100} ${150 + Math.sin(i) * 50} ${
                    200 + i * 100
                  } ${200}`
              )
              .join(" ")}`}
            stroke="url(#pathGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Journey Nodes */}
      {nodes.map((node, index) => (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="absolute cursor-pointer"
          style={{
            left: `${10 + index * 15}%`,
            top: `${30 + Math.sin(index * 0.5) * 20}%`,
          }}
          onClick={() => setSelectedNode(node)}
        >
          <div className="relative">
            {/* Node Glow */}
            <div
              className="absolute inset-0 rounded-full blur-xl animate-pulse"
              style={{
                backgroundColor: getNodeColor(node.type),
                width: getNodeSize(node.significance) * 1.5,
                height: getNodeSize(node.significance) * 1.5,
                transform: "translate(-25%, -25%)",
              }}
            />

            {/* Node */}
            <div
              className="relative rounded-full border-2 flex items-center justify-center"
              style={{
                backgroundColor: getNodeColor(node.type) + "33",
                borderColor: getNodeColor(node.type),
                width: getNodeSize(node.significance),
                height: getNodeSize(node.significance),
              }}
            >
              {node.type === "transformation" && (
                <AlchemicalSymbol symbol="philosophersStone" size={16} />
              )}
            </div>

            {/* Date Label */}
            <div className="absolute top-full mt-2 whitespace-nowrap text-xs text-moonstone/70">
              {format(node.date, "MMM d")}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Selected Node Details */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-8 right-8"
        >
          <Card className="bg-cosmos/80 backdrop-blur-lg border-gold/30 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-ancient text-gold mb-2">
                  {selectedNode.title}
                </h3>
                <p className="text-moonstone/80 text-sm mb-4">
                  {selectedNode.description}
                </p>
                {selectedNode.principle && (
                  <div className="flex items-center gap-2 text-emerald">
                    <AlchemicalSymbol symbol="mercury" size={20} />
                    <span className="text-sm">
                      Principle of {selectedNode.principle}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-moonstone/50 hover:text-moonstone"
              >
                ✕
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
```

### Step 7: Custom Tailwind Utilities

Update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmos: "rgb(var(--color-cosmos) / <alpha-value>)",
        celestial: "rgb(var(--color-celestial) / <alpha-value>)",
        amethyst: "rgb(var(--color-amethyst) / <alpha-value>)",
        gold: "rgb(var(--color-gold) / <alpha-value>)",
        emerald: "rgb(var(--color-emerald) / <alpha-value>)",
        moonstone: "rgb(var(--color-moonstone) / <alpha-value>)",
        obsidian: "rgb(var(--color-obsidian) / <alpha-value>)",
      },
      fontFamily: {
        ancient: ["Cinzel", "serif"],
        mystical: ["Philosopher", "sans-serif"],
        body: ["Crimson Text", "serif"],
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        ethereal: "ethereal 3s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-mystical": "var(--gradient-mystical)",
        "gradient-aurora": "var(--gradient-aurora)",
        "gradient-golden": "var(--gradient-golden)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("tailwind-scrollbar")],
};

export default config;
```

### Step 8: Loading States and Transitions

Create `components/ui/mystical-loading.tsx`:

```typescript
export function MysticalLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        {/* Rotating circles */}
        <div className="absolute inset-0 animate-spin-slow">
          <SacredGeometry type="flower-of-life" size={120} color="#fbbf24" />
        </div>

        {/* Central pulsing symbol */}
        <div className="relative z-10 animate-pulse">
          <AlchemicalSymbol symbol="philosophersStone" size={60} />
        </div>
      </div>

      <p className="mt-8 text-gold font-mystical animate-pulse">
        Consulting the eternal wisdom...
      </p>
    </div>
  );
}
```

## Verification Steps

1. Test all sacred geometry components render correctly
2. Verify particle effects performance
3. Test animations and transitions smoothness
4. Validate responsive design on all devices
5. Test dark/light mode switching
6. Verify accessibility (ARIA labels, keyboard navigation)
7. Test loading states and error displays

8. Run linting and build:

```bash
pnpm lint
pnpm build
```

## Success Criteria

- [ ] Mystical theme consistently applied
- [ ] Sacred geometry components working
- [ ] Alchemical symbols displaying correctly
- [ ] Particle effects smooth and performant
- [ ] Animations enhance not distract
- [ ] Responsive on all devices
- [ ] Accessible to screen readers
- [ ] No linting errors
- [ ] Build completes successfully

## Next Phase

Phase 10 will implement comprehensive testing and performance optimization.
