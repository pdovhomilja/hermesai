"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SacredGeometry } from '@/components/ui/sacred-geometry';
import { AlchemicalSymbol, type AlchemicalSymbolType } from '@/components/ui/alchemical-symbols';

export interface MysticalLoadingProps {
  variant?: 'spinner' | 'pulse' | 'orbit' | 'transmutation' | 'breath' | 'flow';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  message?: string;
  color?: 'gold' | 'cosmos' | 'emerald' | 'amethyst';
  duration?: number;
}

/**
 * Mystical Loading Component
 * Themed loading indicators with sacred geometry and alchemical symbols
 */
export function MysticalLoading({
  variant = 'spinner',
  size = 'md',
  className,
  message,
  color = 'gold',
  duration = 2
}: MysticalLoadingProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32'
  };

  const colorClasses = {
    gold: 'text-gold-400',
    cosmos: 'text-cosmos-400',
    emerald: 'text-emerald-400',
    amethyst: 'text-amethyst-400'
  };

  const sizeValues = {
    sm: 24,
    md: 48,
    lg: 80,
    xl: 128
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4',
      className
    )}>
      <div className={cn('relative', sizeClasses[size], colorClasses[color])}>
        {variant === 'spinner' && <SpinnerLoader size={sizeValues[size]} color={color} duration={duration} />}
        {variant === 'pulse' && <PulseLoader size={sizeValues[size]} color={color} duration={duration} />}
        {variant === 'orbit' && <OrbitLoader size={sizeValues[size]} color={color} duration={duration} />}
        {variant === 'transmutation' && <TransmutationLoader size={sizeValues[size]} color={color} duration={duration} />}
        {variant === 'breath' && <BreathLoader size={sizeValues[size]} color={color} duration={duration} />}
        {variant === 'flow' && <FlowLoader size={sizeValues[size]} color={color} duration={duration} />}
      </div>
      
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-moonstone-400 font-mystical text-center max-w-xs"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

/**
 * Sacred Geometry Spinner
 */
function SpinnerLoader({ size, duration }: { size: number; color: string; duration: number }) {
  return (
    <motion.div
      className="relative w-full h-full"
      animate={{ rotate: 360 }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <SacredGeometry
        type="flower-of-life"
        size={size}
        animated={false}
        color="currentColor"
        glowEffect={true}
        opacity={0.8}
      />
      
      {/* Inner rotating element */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: -360 }}
        transition={{
          duration: duration * 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <AlchemicalSymbol
          symbol="philosophers-stone"
          size={size * 0.3}
          color="currentColor"
          glowEffect={true}
        />
      </motion.div>
    </motion.div>
  );
}

/**
 * Pulsing Sacred Symbol
 */
function PulseLoader({ size, duration }: { size: number; color: string; duration: number }) {
  return (
    <motion.div
      className="relative w-full h-full flex items-center justify-center"
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.6, 1, 0.6]
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <SacredGeometry
        type="sri-yantra"
        size={size}
        animated={false}
        color="currentColor"
        glowEffect={true}
      />
      
      {/* Central symbol */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: [1.2, 0.8, 1.2],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{
          duration: duration * 0.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: duration * 0.2
        }}
      >
        <AlchemicalSymbol
          symbol="quintessence"
          size={size * 0.25}
          color="currentColor"
          glowEffect={true}
        />
      </motion.div>
    </motion.div>
  );
}

/**
 * Orbital Loading Animation
 */
function OrbitLoader({ size, duration }: { size: number; color: string; duration: number }) {
  const symbols: AlchemicalSymbolType[] = ['mercury', 'sulfur', 'salt'];
  
  return (
    <div className="relative w-full h-full">
      {/* Central element */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: duration * 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <SacredGeometry
            type="vesica-piscis"
            size={size * 0.4}
            animated={false}
            color="currentColor"
            glowEffect={true}
          />
        </motion.div>
      </div>
      
      {/* Orbiting symbols */}
      {symbols.map((symbol, index) => (
        <motion.div
          key={symbol}
          className="absolute inset-0"
          style={{
            transformOrigin: 'center'
          }}
          animate={{
            rotate: 360
          }}
          transition={{
            duration: duration * (2 + index * 0.5),
            repeat: Infinity,
            ease: "linear",
            delay: index * (duration / 3)
          }}
        >
          <div
            className="absolute flex items-center justify-center"
            style={{
              top: '10%',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            <motion.div
              animate={{
                rotate: -360
              }}
              transition={{
                duration: duration * (2 + index * 0.5),
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <AlchemicalSymbol
                symbol={symbol}
                size={size * 0.2}
                color="currentColor"
                glowEffect={true}
              />
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Alchemical Transmutation Loader
 */
function TransmutationLoader({ size, duration }: { size: number; color: string; duration: number }) {
  const stages: AlchemicalSymbolType[] = ['lead', 'mercury', 'sulfur', 'gold'];
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        animate={{
          rotateY: [0, 180, 360]
        }}
        transition={{
          duration: duration * 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {stages.map((symbol, index) => (
          <motion.div
            key={symbol}
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.8, 1, 1, 0.8]
            }}
            transition={{
              duration: duration * 4,
              repeat: Infinity,
              delay: index * (duration * 4 / stages.length),
              ease: "easeInOut"
            }}
          >
            <AlchemicalSymbol
              symbol={symbol}
              size={size * 0.6}
              color="currentColor"
              glowEffect={true}
            />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Background sacred geometry */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{ rotate: 360 }}
        transition={{
          duration: duration * 8,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <SacredGeometry
          type="metatrons-cube"
          size={size}
          animated={false}
          color="currentColor"
        />
      </motion.div>
    </div>
  );
}

/**
 * Breathing Sacred Pattern
 */
function BreathLoader({ size, duration }: { size: number; color: string; duration: number }) {
  return (
    <div className="relative w-full h-full">
      {/* Outer breath */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center opacity-40"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.2, 0.6, 0.2]
        }}
        transition={{
          duration: duration * 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <SacredGeometry
          type="flower-of-life"
          size={size}
          animated={false}
          color="currentColor"
        />
      </motion.div>
      
      {/* Inner breath */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: [0.6, 1, 0.6],
          opacity: [1, 0.7, 1]
        }}
        transition={{
          duration: duration * 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: duration * 0.5
        }}
      >
        <SacredGeometry
          type="seed-of-life"
          size={size * 0.7}
          animated={false}
          color="currentColor"
          glowEffect={true}
        />
      </motion.div>
      
      {/* Central symbol */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          scale: [1, 0.8, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{
          duration: duration * 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: duration
        }}
      >
        <AlchemicalSymbol
          symbol="air"
          size={size * 0.3}
          color="currentColor"
          glowEffect={true}
        />
      </motion.div>
    </div>
  );
}

/**
 * Energy Flow Loader
 */
function FlowLoader({ size, duration }: { size: number; color: string; duration: number }) {
  return (
    <div className="relative w-full h-full">
      {/* Background pattern */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <SacredGeometry
          type="merkaba"
          size={size}
          animated={true}
          color="currentColor"
          rotationSpeed={0.3}
        />
      </div>
      
      {/* Flowing particles */}
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <motion.div
          key={index}
          className="absolute w-2 h-2 bg-current rounded-full opacity-80"
          style={{
            filter: 'blur(0.5px) drop-shadow(0 0 4px currentColor)'
          }}
          animate={{
            x: [
              Math.cos((index * Math.PI) / 3) * size * 0.4,
              Math.cos(((index + 2) * Math.PI) / 3) * size * 0.4,
              Math.cos(((index + 4) * Math.PI) / 3) * size * 0.4,
              Math.cos((index * Math.PI) / 3) * size * 0.4
            ],
            y: [
              Math.sin((index * Math.PI) / 3) * size * 0.4,
              Math.sin(((index + 2) * Math.PI) / 3) * size * 0.4,
              Math.sin(((index + 4) * Math.PI) / 3) * size * 0.4,
              Math.sin((index * Math.PI) / 3) * size * 0.4
            ],
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.8, 1, 0.6, 0.8]
          }}
          transition={{
            duration: duration * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * (duration / 6)
          }}
          initial={{
            x: Math.cos((index * Math.PI) / 3) * size * 0.4,
            y: Math.sin((index * Math.PI) / 3) * size * 0.4
          }}
        />
      ))}
    </div>
  );
}

/**
 * Full Page Loading Overlay
 */
export interface MysticalLoadingOverlayProps {
  isVisible: boolean;
  variant?: MysticalLoadingProps['variant'];
  message?: string;
  progress?: number;
  stages?: string[];
  currentStage?: number;
}

export function MysticalLoadingOverlay({
  isVisible,
  variant = 'transmutation',
  message = "Channeling ancient wisdom...",
  progress,
  stages,
  currentStage
}: MysticalLoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-obsidian-900/95 backdrop-blur-sm flex items-center justify-center"
    >
      <div className="text-center space-y-8 max-w-md mx-4">
        <MysticalLoading
          variant={variant}
          size="xl"
          message={message}
          color="gold"
        />
        
        {/* Progress indicator */}
        {progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-moonstone-400">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 bg-obsidian-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gold-400 to-gold-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
        
        {/* Stage indicator */}
        {stages && currentStage !== undefined && (
          <div className="space-y-2">
            <p className="text-sm text-gold-300 font-mystical">
              {stages[currentStage] || 'Processing...'}
            </p>
            <div className="flex justify-center space-x-2">
              {stages.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    index === currentStage
                      ? 'bg-gold-400'
                      : index < currentStage
                      ? 'bg-emerald-400'
                      : 'bg-obsidian-600'
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Inline Loading State Component
 */
export interface InlineLoadingProps {
  text: string;
  variant?: 'dots' | 'pulse' | 'symbol';
  className?: string;
}

export function InlineLoading({ 
  text, 
  variant = 'dots',
  className 
}: InlineLoadingProps) {
  return (
    <span className={cn('inline-flex items-center space-x-2', className)}>
      <span className="font-mystical">{text}</span>
      
      {variant === 'dots' && (
        <span className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1 h-1 bg-current rounded-full"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            >
              •
            </motion.span>
          ))}
        </span>
      )}
      
      {variant === 'pulse' && (
        <motion.span
          className="w-2 h-2 bg-current rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {variant === 'symbol' && (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <AlchemicalSymbol
            symbol="mercury"
            size={16}
            color="currentColor"
          />
        </motion.span>
      )}
    </span>
  );
}