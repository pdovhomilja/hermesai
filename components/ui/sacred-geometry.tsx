"use client";

import React, { useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface SacredGeometryProps {
  type: 'flower-of-life' | 'metatrons-cube' | 'sri-yantra' | 'merkaba' | 'seed-of-life' | 'vesica-piscis';
  size?: number;
  animated?: boolean;
  color?: string;
  strokeWidth?: number;
  className?: string;
  glowEffect?: boolean;
  rotationSpeed?: number;
  opacity?: number;
}

/**
 * Sacred Geometry Canvas Component
 * Renders ancient mystical patterns using Canvas API for optimal performance
 */
export function SacredGeometry({
  type,
  size = 200,
  animated = false,
  color = '#d4af37', // Gold
  strokeWidth = 1.618, // Golden ratio
  className,
  glowEffect = false,
  rotationSpeed = 1,
  opacity = 0.8
}: SacredGeometryProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const rotationRef = useRef(0);

  const drawingFunction = useMemo(() => {
    switch (type) {
      case 'flower-of-life':
        return drawFlowerOfLife;
      case 'metatrons-cube':
        return drawMetatronsCube;
      case 'sri-yantra':
        return drawSriYantra;
      case 'merkaba':
        return drawMerkaba;
      case 'seed-of-life':
        return drawSeedOfLife;
      case 'vesica-piscis':
        return drawVesicaPiscis;
      default:
        return drawFlowerOfLife;
    }
  }, [type]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      if (animated) {
        rotationRef.current += rotationSpeed * 0.01;
      }

      // Setup drawing context
      ctx.save();
      ctx.translate(centerX, centerY);
      
      if (animated) {
        ctx.rotate(rotationRef.current);
      }

      ctx.globalAlpha = opacity;
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;

      if (glowEffect) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      // Draw the selected geometry
      drawingFunction(ctx, size / 2);

      ctx.restore();

      if (animated) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawingFunction, size, animated, color, strokeWidth, glowEffect, rotationSpeed, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('sacred-geometry-canvas', className)}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Draw Flower of Life - Sacred pattern of creation
 */
function drawFlowerOfLife(ctx: CanvasRenderingContext2D, radius: number) {
  const petalRadius = radius * 0.6;
  const centers = [];
  
  // Center circle
  centers.push({ x: 0, y: 0 });
  
  // Six surrounding circles
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    centers.push({
      x: Math.cos(angle) * petalRadius,
      y: Math.sin(angle) * petalRadius
    });
  }
  
  // Outer ring of 12 circles
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const distance = petalRadius * Math.sqrt(3);
    centers.push({
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance
    });
  }

  // Draw all circles
  centers.forEach(center => {
    ctx.beginPath();
    ctx.arc(center.x, center.y, petalRadius, 0, 2 * Math.PI);
    ctx.stroke();
  });
}

/**
 * Draw Metatron's Cube - Complex sacred geometry containing all Platonic solids
 */
function drawMetatronsCube(ctx: CanvasRenderingContext2D, radius: number) {
  const points = [];
  const centerRadius = radius * 0.8;
  
  // Generate 13 points (center + 12 around)
  points.push({ x: 0, y: 0 });
  
  // Inner hexagon
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    points.push({
      x: Math.cos(angle) * centerRadius * 0.5,
      y: Math.sin(angle) * centerRadius * 0.5
    });
  }
  
  // Outer hexagon
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    points.push({
      x: Math.cos(angle) * centerRadius,
      y: Math.sin(angle) * centerRadius
    });
  }

  // Draw circles at each point
  points.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius * 0.15, 0, 2 * Math.PI);
    ctx.stroke();
  });

  // Connect all points to create the cube structure
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      ctx.beginPath();
      ctx.moveTo(points[i].x, points[i].y);
      ctx.lineTo(points[j].x, points[j].y);
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}

/**
 * Draw Sri Yantra - Hindu mystical diagram
 */
function drawSriYantra(ctx: CanvasRenderingContext2D, radius: number) {
  const triangleSize = radius * 0.6;
  
  // Draw upward triangles (masculine/Shiva)
  for (let i = 0; i < 5; i++) {
    const size = triangleSize * (1 - i * 0.15);
    const rotation = (i * Math.PI) / 12;
    
    ctx.save();
    ctx.rotate(rotation);
    drawTriangle(ctx, 0, 0, size, true);
    ctx.restore();
  }
  
  // Draw downward triangles (feminine/Shakti)
  for (let i = 0; i < 4; i++) {
    const size = triangleSize * (0.9 - i * 0.15);
    const rotation = (i * Math.PI) / 10;
    
    ctx.save();
    ctx.rotate(rotation);
    drawTriangle(ctx, 0, 0, size, false);
    ctx.restore();
  }
  
  // Draw outer geometric shapes
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.9, 0, 2 * Math.PI);
  ctx.stroke();
  
  drawLotus(ctx, radius * 0.95, 8);
  drawLotus(ctx, radius * 1.1, 16);
}

/**
 * Draw Merkaba - 3D star tetrahedron (simplified 2D representation)
 */
function drawMerkaba(ctx: CanvasRenderingContext2D, radius: number) {
  const size = radius * 0.8;
  
  // Upper tetrahedron
  ctx.save();
  drawTriangle(ctx, 0, -size * 0.2, size, true);
  ctx.restore();
  
  // Lower tetrahedron (inverted)
  ctx.save();
  ctx.rotate(Math.PI);
  drawTriangle(ctx, 0, -size * 0.2, size, true);
  ctx.restore();
  
  // Central hexagon
  drawHexagon(ctx, 0, 0, size * 0.4);
}

/**
 * Draw Seed of Life - Seven overlapping circles
 */
function drawSeedOfLife(ctx: CanvasRenderingContext2D, radius: number) {
  const circleRadius = radius * 0.5;
  
  // Center circle
  ctx.beginPath();
  ctx.arc(0, 0, circleRadius, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Six surrounding circles
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = Math.cos(angle) * circleRadius;
    const y = Math.sin(angle) * circleRadius;
    
    ctx.beginPath();
    ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

/**
 * Draw Vesica Piscis - Intersection of two circles
 */
function drawVesicaPiscis(ctx: CanvasRenderingContext2D, radius: number) {
  const circleRadius = radius * 0.6;
  const offset = circleRadius * 0.5;
  
  // Left circle
  ctx.beginPath();
  ctx.arc(-offset, 0, circleRadius, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Right circle
  ctx.beginPath();
  ctx.arc(offset, 0, circleRadius, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Highlight the intersection
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = ctx.strokeStyle;
  ctx.globalAlpha = 0.2;
  
  ctx.beginPath();
  ctx.arc(-offset, 0, circleRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(offset, 0, circleRadius, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.restore();
}

/**
 * Helper function to draw a triangle
 */
function drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, pointUp: boolean) {
  const height = (size * Math.sqrt(3)) / 2;
  const yOffset = pointUp ? -height / 3 : height / 3;
  
  ctx.beginPath();
  if (pointUp) {
    ctx.moveTo(x, y - height / 2 + yOffset);
    ctx.lineTo(x - size / 2, y + height / 2 + yOffset);
    ctx.lineTo(x + size / 2, y + height / 2 + yOffset);
  } else {
    ctx.moveTo(x, y + height / 2 + yOffset);
    ctx.lineTo(x - size / 2, y - height / 2 + yOffset);
    ctx.lineTo(x + size / 2, y - height / 2 + yOffset);
  }
  ctx.closePath();
  ctx.stroke();
}

/**
 * Helper function to draw a hexagon
 */
function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const pointX = x + Math.cos(angle) * size;
    const pointY = y + Math.sin(angle) * size;
    
    if (i === 0) {
      ctx.moveTo(pointX, pointY);
    } else {
      ctx.lineTo(pointX, pointY);
    }
  }
  ctx.closePath();
  ctx.stroke();
}

/**
 * Helper function to draw lotus petals
 */
function drawLotus(ctx: CanvasRenderingContext2D, radius: number, petals: number) {
  for (let i = 0; i < petals; i++) {
    const angle = (i * 2 * Math.PI) / petals;
    const petalLength = radius * 0.2;
    
    ctx.save();
    ctx.rotate(angle);
    
    // Draw petal shape
    ctx.beginPath();
    ctx.moveTo(radius - petalLength, 0);
    ctx.quadraticCurveTo(radius - petalLength / 2, -petalLength / 3, radius, 0);
    ctx.quadraticCurveTo(radius - petalLength / 2, petalLength / 3, radius - petalLength, 0);
    ctx.stroke();
    
    ctx.restore();
  }
}

/**
 * Preset configurations for common sacred geometry patterns
 */
export const SACRED_GEOMETRY_PRESETS = {
  'cosmic-flower': {
    type: 'flower-of-life' as const,
    animated: true,
    color: '#9147ff',
    glowEffect: true,
    rotationSpeed: 0.5
  },
  'divine-cube': {
    type: 'metatrons-cube' as const,
    animated: true,
    color: '#d4af37',
    glowEffect: true,
    rotationSpeed: 0.3
  },
  'sacred-yantra': {
    type: 'sri-yantra' as const,
    animated: false,
    color: '#34d399',
    glowEffect: true
  },
  'stellar-merkaba': {
    type: 'merkaba' as const,
    animated: true,
    color: '#fbbf24',
    glowEffect: true,
    rotationSpeed: 0.8
  },
  'life-seed': {
    type: 'seed-of-life' as const,
    animated: false,
    color: '#a855f7',
    glowEffect: false
  },
  'cosmic-vesica': {
    type: 'vesica-piscis' as const,
    animated: false,
    color: '#64748b',
    glowEffect: true
  }
} as const;

export type SacredGeometryPreset = keyof typeof SACRED_GEOMETRY_PRESETS;