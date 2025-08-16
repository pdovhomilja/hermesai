"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Predefined animation variants for mystical effects
 */
export const mysticalVariants = {
  // Page transitions
  pageEnter: {
    initial: { opacity: 0, scale: 0.9, rotateX: -10 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0, 
      scale: 1.1, 
      rotateX: 10,
      transition: {
        duration: 0.4,
        ease: [0.55, 0.06, 0.55, 0.06]
      }
    }
  },

  // Ethereal floating
  etherealFloat: {
    animate: {
      y: [-10, 10, -10] as number[],
      x: [-5, 5, -5] as number[],
      rotateZ: [-2, 2, -2] as number[],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Sacred geometry emergence
  sacredEmerge: {
    initial: { 
      scale: 0, 
      opacity: 0, 
      rotate: -180,
      filter: "blur(10px)"
    },
    animate: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94],
        filter: { duration: 0.8 }
      }
    }
  },

  // Mystical reveal
  mysticalReveal: {
    initial: { 
      opacity: 0, 
      y: 30, 
      scale: 0.8,
      filter: "brightness(0.5)"
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: "brightness(1)",
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },

  // Cosmic pulse
  cosmicPulse: {
    animate: {
      scale: [1, 1.05, 1] as number[],
      opacity: [0.8, 1, 0.8] as number[],
      boxShadow: [
        "0 0 20px rgba(145, 71, 255, 0.3)",
        "0 0 40px rgba(145, 71, 255, 0.6)",
        "0 0 20px rgba(145, 71, 255, 0.3)"
      ] as string[],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Alchemical transmutation
  alchemicalTransmute: {
    initial: { 
      rotateY: 0, 
      hue: 0,
      brightness: 1
    },
    animate: {
      rotateY: [0, 180, 360] as number[],
      hue: [0, 60, 120, 180, 240, 300, 360] as number[],
      brightness: [1, 1.2, 1] as number[],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Golden spiral
  goldenSpiral: {
    animate: {
      rotate: 360,
      scale: [1, 1.1, 1] as number[],
      transition: {
        rotate: {
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        },
        scale: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    }
  },

  // Element manifestation
  elementManifest: {
    initial: { 
      opacity: 0,
      scale: 0.5,
      y: 20,
      filter: "blur(5px)"
    },
    animate: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }
    })
  },

  // Wisdom scroll
  wisdomScroll: {
    initial: { 
      opacity: 0,
      y: 50,
      scaleY: 0.3
    },
    animate: {
      opacity: 1,
      y: 0,
      scaleY: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
        scaleY: { duration: 0.6 }
      }
    }
  }
} as const;

/**
 * Mystical transition configurations
 */
export const mysticalTransitions = {
  gentle: {
    duration: 0.6,
    ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
  },
  
  ethereal: {
    duration: 1.2,
    ease: [0.23, 1, 0.32, 1] as [number, number, number, number]
  },
  
  cosmic: {
    duration: 0.8,
    ease: [0.55, 0.06, 0.55, 0.06] as [number, number, number, number]
  },
  
  sacred: {
    duration: 1.5,
    ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    type: "spring" as const,
    stiffness: 50,
    damping: 20
  },
  
  alchemical: {
    duration: 2,
    ease: [0.65, 0, 0.35, 1] as [number, number, number, number]
  }
} as const;

/**
 * Enhanced Motion Components with Mystical Presets
 */

// Mystical Container
interface MysticalContainerProps extends HTMLMotionProps<"div"> {
  variant?: keyof typeof mysticalVariants;
  delay?: number;
  stagger?: number;
  className?: string;
}

export function MysticalContainer({
  variant = 'mysticalReveal',
  delay = 0,
  stagger = 0.1,
  className,
  children,
  ...props
}: MysticalContainerProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={mysticalVariants[variant]}
      transition={{ 
        ...mysticalTransitions.gentle, 
        delay,
        staggerChildren: stagger
      }}
      className={cn('mystical-container', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Sacred Motion Element
interface SacredMotionProps extends Omit<HTMLMotionProps<"div">, 'transition'> {
  variant?: keyof typeof mysticalVariants;
  transitionPreset?: keyof typeof mysticalTransitions;
  className?: string;
  custom?: number;
}

export function SacredMotion({
  variant = 'sacredEmerge',
  transitionPreset = 'sacred',
  className,
  custom,
  children,
  ...props
}: SacredMotionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={mysticalVariants[variant]}
      transition={mysticalTransitions[transitionPreset]}
      custom={custom}
      className={cn('sacred-motion', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Floating Element
interface FloatingElementProps extends HTMLMotionProps<"div"> {
  intensity?: 'subtle' | 'medium' | 'strong';
  duration?: number;
  className?: string;
}

export function FloatingElement({
  intensity = 'medium',
  duration = 6,
  className,
  children,
  ...props
}: FloatingElementProps) {
  const intensityMap = {
    subtle: { y: [-5, 5], x: [-2, 2], rotate: [-1, 1] },
    medium: { y: [-10, 10], x: [-5, 5], rotate: [-2, 2] },
    strong: { y: [-15, 15], x: [-8, 8], rotate: [-3, 3] }
  };

  const movement = intensityMap[intensity];

  return (
    <motion.div
      animate={{
        y: movement.y,
        x: movement.x,
        rotate: movement.rotate
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
      className={cn('floating-element', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Glowing Element
interface GlowingElementProps extends HTMLMotionProps<"div"> {
  glowColor?: string;
  intensity?: 'soft' | 'medium' | 'intense';
  pulse?: boolean;
  className?: string;
}

export function GlowingElement({
  glowColor = '#d4af37',
  intensity = 'medium',
  pulse = true,
  className,
  children,
  ...props
}: GlowingElementProps) {
  const intensityMap = {
    soft: { blur: 10, spread: 5 },
    medium: { blur: 20, spread: 10 },
    intense: { blur: 30, spread: 15 }
  };

  const { blur, spread } = intensityMap[intensity];

  const glowVariants = {
    animate: pulse ? {
      filter: [
        `drop-shadow(0 0 ${blur}px ${glowColor}) drop-shadow(0 0 ${spread}px ${glowColor})`,
        `drop-shadow(0 0 ${blur * 1.5}px ${glowColor}) drop-shadow(0 0 ${spread * 1.5}px ${glowColor})`,
        `drop-shadow(0 0 ${blur}px ${glowColor}) drop-shadow(0 0 ${spread}px ${glowColor})`
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    } : {
      filter: `drop-shadow(0 0 ${blur}px ${glowColor}) drop-shadow(0 0 ${spread}px ${glowColor})`
    }
  };

  return (
    <motion.div
      variants={glowVariants}
      animate="animate"
      className={cn('glowing-element', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Spiral Motion
interface SpiralMotionProps extends HTMLMotionProps<"div"> {
  radius?: number;
  speed?: number;
  clockwise?: boolean;
  className?: string;
}

export function SpiralMotion({
  radius = 20,
  speed = 8,
  clockwise = true,
  className,
  children,
  ...props
}: SpiralMotionProps) {
  const direction = clockwise ? 1 : -1;

  return (
    <motion.div
      animate={{
        x: [0, radius, 0, -radius, 0],
        y: [0, -radius, 0, radius, 0],
        rotate: [0, 90 * direction, 180 * direction, 270 * direction, 360 * direction]
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "linear"
      }}
      className={cn('spiral-motion', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Breathing Element
interface BreathingElementProps extends HTMLMotionProps<"div"> {
  scale?: [number, number];
  duration?: number;
  className?: string;
}

export function BreathingElement({
  scale = [1, 1.1],
  duration = 4,
  className,
  children,
  ...props
}: BreathingElementProps) {
  return (
    <motion.div
      animate={{
        scale: [scale[0], scale[1], scale[0]],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={cn('breathing-element', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Particle Trail
interface ParticleTrailProps extends Omit<HTMLMotionProps<"div">, 'children'> {
  particleCount?: number;
  trailLength?: number;
  className?: string;
  children: React.ReactNode;
}

export function ParticleTrail({
  particleCount = 5,
  trailLength = 100,
  className,
  children,
  ...props
}: ParticleTrailProps) {
  return (
    <motion.div
      className={cn('relative', className)}
      whileHover="hover"
      {...props}
    >
      {children}
      
      {/* Trail particles */}
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gold-400 rounded-full pointer-events-none"
          variants={{
            hover: {
              x: [0, -trailLength * Math.cos(i * 0.5), 0],
              y: [0, -trailLength * Math.sin(i * 0.5), 0],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0]
            }
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.1,
            repeat: Infinity,
            repeatDelay: 2
          }}
          initial={{ x: 0, y: 0, opacity: 0 }}
        />
      ))}
    </motion.div>
  );
}

// Mystical Text Reveal
interface MysticalTextRevealProps {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
}

export function MysticalTextReveal({
  text,
  delay = 0,
  duration = 0.05,
  className
}: MysticalTextRevealProps) {
  const letters = Array.from(text);

  return (
    <motion.div
      className={cn('mystical-text-reveal', className)}
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: duration,
            delayChildren: delay
          }
        }
      }}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          className="inline-block"
          variants={{
            initial: { 
              opacity: 0, 
              y: 20,
              filter: "blur(5px)"
            },
            animate: { 
              opacity: 1, 
              y: 0,
              filter: "blur(0px)",
              transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            }
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  );
}

// Page Transition Wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={cn('page-transition', className)}
    >
      {children}
    </motion.div>
  );
}

// Stagger Container
interface StaggerContainerProps {
  children: React.ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  stagger = 0.1,
  delay = 0,
  className
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay
          }
        }
      }}
      className={cn('stagger-container', className)}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
          }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Scroll-triggered Animation Hook
export function useScrollReveal(threshold = 0.1) {
  return {
    initial: { opacity: 0, y: 60 },
    whileInView: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    viewport: { once: true, amount: threshold }
  };
}

// Gesture Animation Hook
export function useGestureAnimations() {
  return {
    whileHover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    whileTap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    },
    whileFocus: {
      boxShadow: "0 0 20px rgba(212, 175, 55, 0.5)",
      transition: { duration: 0.2 }
    }
  };
}