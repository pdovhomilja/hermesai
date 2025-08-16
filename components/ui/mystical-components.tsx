"use client";

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SacredGeometry } from '@/components/ui/sacred-geometry';
import { AlchemicalSymbol, type AlchemicalSymbolType } from '@/components/ui/alchemical-symbols';
import { GlowingElement, useGestureAnimations } from '@/components/effects/mystical-animations';

/**
 * Mystical Card Component
 * Enhanced card with sacred borders and mystical styling
 */
export interface MysticalCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  variant?: 'default' | 'sacred' | 'ethereal' | 'cosmic';
  glowEffect?: boolean;
  bordered?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  sacred?: boolean;
}

export const MysticalCard = forwardRef<HTMLDivElement, MysticalCardProps>(({
  className,
  variant = 'default',
  glowEffect = false,
  bordered = true,
  animated = true,
  size = 'md',
  sacred = false,
  children,
  ...props
}, ref) => {
  const gestureAnimations = useGestureAnimations();
  
  const variantStyles = {
    default: 'bg-obsidian-800/80 border-gold-400/30',
    sacred: 'bg-gradient-to-br from-obsidian-800/90 to-cosmos-900/80 border-gold-400/50',
    ethereal: 'bg-gradient-to-br from-moonstone-900/70 to-celestial-900/80 border-amethyst-400/40',
    cosmic: 'bg-gradient-to-br from-cosmos-900/90 to-amethyst-900/80 border-cosmos-400/50'
  };

  const sizeStyles = {
    sm: 'p-4 rounded-lg',
    md: 'p-6 rounded-xl',
    lg: 'p-8 rounded-2xl'
  };

  const CardComponent = animated ? motion.div : 'div';
  const cardProps = animated ? { ...gestureAnimations } : {};

  const card = (
    <CardComponent
      ref={ref}
      className={cn(
        'relative backdrop-blur-sm transition-all duration-300',
        sizeStyles[size],
        variantStyles[variant],
        {
          'border': bordered,
          'shadow-2xl': glowEffect,
          'mystical-shadow': glowEffect
        },
        className
      )}
      {...cardProps}
      {...props}
    >
      {/* Sacred geometry corner decorations */}
      {sacred && (
        <>
          <div className="absolute top-2 left-2 opacity-20">
            <SacredGeometry
              type="vesica-piscis"
              size={24}
              color="currentColor"
              animated={animated}
              opacity={0.6}
            />
          </div>
          <div className="absolute bottom-2 right-2 opacity-20">
            <SacredGeometry
              type="seed-of-life"
              size={20}
              color="currentColor"
              animated={animated}
              rotationSpeed={-0.5}
              opacity={0.6}
            />
          </div>
        </>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </CardComponent>
  );

  return glowEffect ? (
    <GlowingElement intensity="soft" glowColor="#d4af37">
      {card}
    </GlowingElement>
  ) : card;
});

MysticalCard.displayName = "MysticalCard";

/**
 * Hermetic Button Component
 * Buttons with alchemical styling and mystical effects
 */
export interface HermeticButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'sacred';
  size?: 'sm' | 'md' | 'lg';
  symbol?: AlchemicalSymbolType;
  glowEffect?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export const HermeticButton = forwardRef<HTMLButtonElement, HermeticButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  symbol,
  glowEffect = false,
  loading = false,
  fullWidth = false,
  children,
  disabled,
  ...props
}, ref) => {
  const variantStyles = {
    primary: 'bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-obsidian-900 border-gold-400/50',
    secondary: 'bg-gradient-to-r from-cosmos-600 to-amethyst-600 hover:from-cosmos-500 hover:to-amethyst-500 text-moonstone-100 border-cosmos-400/50',
    ghost: 'bg-transparent hover:bg-obsidian-700/50 text-moonstone-300 hover:text-moonstone-100 border-moonstone-500/30',
    sacred: 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-obsidian-900 border-emerald-400/50'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl'
  };

  return (
    <motion.button
      ref={ref}
      className={cn(
        'relative inline-flex items-center justify-center font-mystical font-medium',
        'border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeStyles[size],
        variantStyles[variant],
        {
          'w-full': fullWidth,
          'sacred-glow': glowEffect && !disabled
        },
        className
      )}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <AlchemicalSymbol
              symbol="mercury"
              size={size === 'sm' ? 14 : size === 'md' ? 16 : 20}
              color="currentColor"
            />
          </motion.div>
        </motion.div>
      )}

      {/* Symbol */}
      {symbol && !loading && (
        <AlchemicalSymbol
          symbol={symbol}
          size={size === 'sm' ? 14 : size === 'md' ? 16 : 20}
          color="currentColor"
          className="mr-2"
        />
      )}

      {/* Content */}
      <span className={cn('relative', { 'opacity-0': loading })}>
        {children}
      </span>
    </motion.button>
  );
});

HermeticButton.displayName = "HermeticButton";

/**
 * Sacred Input Component
 * Form inputs with mystical design
 */
export interface SacredInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  label?: string;
  error?: string;
  symbol?: AlchemicalSymbolType;
  variant?: 'default' | 'ethereal' | 'cosmic';
}

export const SacredInput = forwardRef<HTMLInputElement, SacredInputProps>(({
  className,
  label,
  error,
  symbol,
  variant = 'default',
  id,
  ...props
}, ref) => {
  const inputId = id || `sacred-input-${Math.random().toString(36).substr(2, 9)}`;

  const variantStyles = {
    default: 'bg-obsidian-800/50 border-gold-400/30 focus:border-gold-400/60',
    ethereal: 'bg-moonstone-900/30 border-amethyst-400/30 focus:border-amethyst-400/60',
    cosmic: 'bg-cosmos-900/30 border-cosmos-400/30 focus:border-cosmos-400/60'
  };

  return (
    <div className="space-y-2">
      {label && (
        <motion.label
          htmlFor={inputId}
          className="block text-sm font-mystical text-moonstone-300"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        {symbol && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60">
            <AlchemicalSymbol
              symbol={symbol}
              size={16}
              color="currentColor"
            />
          </div>
        )}
        
        <motion.input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-200',
            'text-moonstone-100 placeholder-moonstone-500 font-ancient',
            'focus:outline-none focus:ring-2 focus:ring-gold-400/20',
            {
              'pl-10': symbol,
              'border-red-400/50 focus:border-red-400/60': error
            },
            variantStyles[variant],
            className
          )}
          whileFocus={{ scale: 1.01 }}
          {...props}
        />
        
        {/* Sacred geometry decoration */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20">
          <SacredGeometry
            type="vesica-piscis"
            size={16}
            color="currentColor"
            animated={false}
          />
        </div>
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400 font-mystical"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

SacredInput.displayName = "SacredInput";

/**
 * Ancient Modal Component
 * Modal dialogs with sacred geometry
 */
export interface AncientModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  sacred?: boolean;
}

export function AncientModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  sacred = true
}: AncientModalProps) {
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-obsidian-900/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={cn(
            'relative w-full bg-gradient-to-br from-obsidian-800/95 to-cosmos-900/90',
            'border border-gold-400/30 rounded-2xl backdrop-blur-sm shadow-2xl',
            'mystical-shadow',
            sizeStyles[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sacred geometry decorations */}
          {sacred && (
            <>
              <div className="absolute -top-6 -right-6 opacity-30">
                <SacredGeometry
                  type="flower-of-life"
                  size={60}
                  animated={true}
                  color="#d4af37"
                  rotationSpeed={0.3}
                />
              </div>
              <div className="absolute -bottom-4 -left-4 opacity-20">
                <SacredGeometry
                  type="seed-of-life"
                  size={40}
                  animated={true}
                  color="#9147ff"
                  rotationSpeed={-0.5}
                />
              </div>
            </>
          )}
          
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-gold-400/20">
              <div className="flex items-center space-x-3">
                <AlchemicalSymbol
                  symbol="quintessence"
                  size={24}
                  color="#d4af37"
                  glowEffect={true}
                />
                <h2 className="text-xl font-sacred text-gold-300">
                  {title}
                </h2>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-moonstone-400 hover:text-moonstone-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          )}
          
          {/* Content */}
          <div className="relative p-6">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Mystical Badge Component
 * Status indicators with hermetic symbols
 */
export interface MysticalBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'cosmic';
  symbol?: AlchemicalSymbolType;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function MysticalBadge({
  children,
  variant = 'default',
  symbol,
  size = 'md',
  animated = false,
  className
}: MysticalBadgeProps) {
  const variantStyles = {
    default: 'bg-obsidian-700/50 text-moonstone-300 border-moonstone-500/30',
    success: 'bg-emerald-600/20 text-emerald-300 border-emerald-400/30',
    warning: 'bg-gold-600/20 text-gold-300 border-gold-400/30',
    error: 'bg-red-600/20 text-red-300 border-red-400/30',
    cosmic: 'bg-cosmos-600/20 text-cosmos-300 border-cosmos-400/30'
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs rounded-lg',
    md: 'px-3 py-1.5 text-sm rounded-xl',
    lg: 'px-4 py-2 text-sm rounded-xl'
  };

  const symbolMap = {
    default: 'mercury' as const,
    success: 'gold' as const,
    warning: 'sulfur' as const,
    error: 'fire' as const,
    cosmic: 'quintessence' as const
  };

  return (
    <motion.div
      className={cn(
        'inline-flex items-center space-x-2 border backdrop-blur-sm font-mystical font-medium',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      whileHover={animated ? { scale: 1.05 } : {}}
    >
      {(symbol || symbolMap[variant]) && (
        <AlchemicalSymbol
          symbol={symbol || symbolMap[variant]}
          size={size === 'sm' ? 12 : size === 'md' ? 14 : 16}
          color="currentColor"
        />
      )}
      <span>{children}</span>
    </motion.div>
  );
}

/**
 * Sacred Progress Bar
 */
export interface SacredProgressProps {
  value: number;
  max?: number;
  className?: string;
  variant?: 'default' | 'cosmic' | 'ethereal';
  animated?: boolean;
  showValue?: boolean;
}

export function SacredProgress({
  value,
  max = 100,
  className,
  variant = 'default',
  animated = true,
  showValue = false
}: SacredProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variantStyles = {
    default: 'from-gold-400 to-gold-600',
    cosmic: 'from-cosmos-400 to-amethyst-600',
    ethereal: 'from-emerald-400 to-celestial-600'
  };

  return (
    <div className={cn('space-y-2', className)}>
      {showValue && (
        <div className="flex justify-between text-sm text-moonstone-400">
          <span className="font-mystical">Progress</span>
          <span className="font-sacred">{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div className="relative h-2 bg-obsidian-700/50 rounded-full overflow-hidden border border-gold-400/20">
        <motion.div
          className={cn(
            'h-full bg-gradient-to-r rounded-full shadow-lg',
            variantStyles[variant]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 1.5 : 0,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          style={{
            boxShadow: '0 0 10px currentColor'
          }}
        />
        
        {/* Sacred geometry overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <SacredGeometry
            type="vesica-piscis"
            size={12}
            color="currentColor"
            animated={false}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Mystical Separator
 */
export interface MysticalSeparatorProps {
  className?: string;
  symbol?: AlchemicalSymbolType;
  animated?: boolean;
}

export function MysticalSeparator({
  className,
  symbol = 'mercury',
  animated = true
}: MysticalSeparatorProps) {
  return (
    <div className={cn('flex items-center space-x-4 my-8', className)}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-gold-400/50" />
      
      <motion.div
        animate={animated ? { rotate: 360 } : {}}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <AlchemicalSymbol
          symbol={symbol}
          size={24}
          color="#d4af37"
          glowEffect={true}
        />
      </motion.div>
      
      <div className="flex-1 h-px bg-gradient-to-r from-gold-400/50 to-transparent" />
    </div>
  );
}

/**
 * Tooltip with mystical styling
 */
export interface MysticalTooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function MysticalTooltip({
  children,
  content,
  position = 'top',
  className
}: MysticalTooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionStyles = {
    top: '-top-2 left-1/2 -translate-x-1/2 -translate-y-full',
    bottom: '-bottom-2 left-1/2 -translate-x-1/2 translate-y-full',
    left: 'top-1/2 -left-2 -translate-y-1/2 -translate-x-full',
    right: 'top-1/2 -right-2 -translate-y-1/2 translate-x-full'
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={cn(
            'absolute z-50 px-3 py-2 text-xs font-ancient text-moonstone-100',
            'bg-obsidian-800/95 border border-gold-400/30 rounded-lg backdrop-blur-sm',
            'shadow-xl whitespace-nowrap pointer-events-none',
            positionStyles[position],
            className
          )}
        >
          {content}
        </motion.div>
      )}
    </div>
  );
}