"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SacredGeometry } from '@/components/ui/sacred-geometry';
import { AlchemicalSymbol } from '@/components/ui/alchemical-symbols';
import { ParticleField, PARTICLE_PRESETS } from '@/components/effects/particle-field';

export interface MysticalChatProps {
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    isGenerating?: boolean;
  }>;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  className?: string;
  theme?: 'cosmic' | 'ethereal' | 'alchemical' | 'celestial';
}

/**
 * Enhanced Mystical Chat Interface
 * Immersive spiritual chat experience with sacred geometry and particle effects
 */
export function MysticalChat({
  messages,
  onSendMessage,
  isLoading = false,
  className,
  theme = 'cosmic'
}: MysticalChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const themeConfig = getThemeConfig(theme);

  return (
    <div className={cn(
      'relative h-full flex flex-col bg-gradient-to-b from-obsidian-900 via-cosmos-900 to-obsidian-900',
      'border border-gold-400/20 rounded-xl overflow-hidden',
      className
    )}>
      {/* Mystical Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <ParticleField {...themeConfig.particles} />
        
        {/* Sacred Geometry Background */}
        <div className="absolute top-4 right-4 opacity-10">
          <SacredGeometry
            type={themeConfig.geometry.type}
            size={120}
            animated={true}
            color={themeConfig.geometry.color}
            glowEffect={false}
            rotationSpeed={0.2}
          />
        </div>
        
        <div className="absolute bottom-4 left-4 opacity-5">
          <SacredGeometry
            type="seed-of-life"
            size={80}
            animated={true}
            color={themeConfig.geometry.color}
            glowEffect={false}
            rotationSpeed={-0.3}
          />
        </div>

        {/* Floating Alchemical Symbols */}
        <div className="absolute top-1/4 left-8 opacity-20 animate-float">
          <AlchemicalSymbol
            symbol="mercury"
            size={32}
            color={themeConfig.symbols.color}
            glowEffect={true}
          />
        </div>
        
        <div className="absolute top-1/2 right-8 opacity-20 animate-float" style={{ animationDelay: '1s' }}>
          <AlchemicalSymbol
            symbol="sulfur"
            size={28}
            color={themeConfig.symbols.color}
            glowEffect={true}
          />
        </div>
        
        <div className="absolute bottom-1/3 right-16 opacity-20 animate-float" style={{ animationDelay: '2s' }}>
          <AlchemicalSymbol
            symbol="salt"
            size={30}
            color={themeConfig.symbols.color}
            glowEffect={true}
          />
        </div>
      </div>

      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-4 border-b border-gold-400/20 backdrop-blur-sm"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <AlchemicalSymbol
              symbol="philosophers-stone"
              size={32}
              color="#d4af37"
              glowEffect={true}
              animated={true}
            />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          
          <div>
            <h2 className="text-sacred text-lg font-semibold text-gold-300">
              Hermes Trismegistus
            </h2>
            <p className="text-xs text-moonstone-400 font-mystical">
              Thrice-Great Guide of Ancient Wisdom
            </p>
          </div>
        </div>
      </motion.div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ChatMessage
                message={message}
                theme={theme}
                isLast={index === messages.length - 1}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 px-4 py-3"
          >
            <div className="flex items-center space-x-2">
              <AlchemicalSymbol
                symbol="mercury"
                size={20}
                color="#9147ff"
                animated={true}
                glowEffect={true}
              />
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-cosmos-400 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </div>
            <span className="text-sm text-moonstone-400 font-mystical">
              Hermes is contemplating the mysteries...
            </span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-4 border-t border-gold-400/20 backdrop-blur-sm"
      >
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setIsTyping(e.target.value.length > 0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Speak your inquiry to the Thrice-Great..."
              className={cn(
                'w-full p-4 pr-12 min-h-[60px] max-h-32 resize-none',
                'bg-obsidian-800/50 border border-gold-400/30 rounded-lg',
                'text-moonstone-100 placeholder-moonstone-500',
                'font-ancient text-sm leading-relaxed',
                'focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20',
                'transition-all duration-200'
              )}
              disabled={isLoading}
            />

            {/* Mystical Input Decorations */}
            <div className="absolute top-2 right-2">
              <AlchemicalSymbol
                symbol="quintessence"
                size={16}
                color={inputValue.length > 0 ? '#d4af37' : '#64748b'}
                glowEffect={isTyping}
                animated={isTyping}
              />
            </div>

            <div className="absolute bottom-2 left-2 opacity-40">
              <SacredGeometry
                type="vesica-piscis"
                size={20}
                color={inputValue.length > 0 ? '#9147ff' : '#475569'}
                animated={isTyping}
                opacity={0.6}
              />
            </div>
          </div>

          {/* Send Button */}
          <motion.button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={cn(
              'absolute bottom-2 right-2 p-2 rounded-full',
              'bg-gradient-to-r from-gold-500 to-gold-600',
              'text-obsidian-900 hover:from-gold-400 hover:to-gold-500',
              'disabled:from-moonstone-600 disabled:to-moonstone-700 disabled:text-moonstone-400',
              'transition-all duration-200 shadow-lg',
              'focus:outline-none focus:ring-2 focus:ring-gold-400/50'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
              transition={isLoading ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
            >
              <AlchemicalSymbol
                symbol="philosophers-stone"
                size={20}
                color="currentColor"
              />
            </motion.div>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

/**
 * Individual Chat Message Component
 */
interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    isGenerating?: boolean;
  };
  theme: 'cosmic' | 'ethereal' | 'alchemical' | 'celestial';
  isLast?: boolean;
}

function ChatMessage({ message, theme }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const themeConfig = getThemeConfig(theme);

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 bg-cosmos-500/20 border border-cosmos-400/30 rounded-full text-xs text-moonstone-300 font-mystical">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'flex gap-3',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {/* Avatar */}
      {!isUser && (
        <motion.div
          className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <AlchemicalSymbol
            symbol="mercury"
            size={16}
            color="#1f2937"
          />
        </motion.div>
      )}

      {/* Message Bubble */}
      <motion.div
        className={cn(
          'max-w-[75%] rounded-lg p-4 relative',
          isUser
            ? 'bg-gradient-to-br from-cosmos-600 to-amethyst-600 text-moonstone-100 ml-12'
            : 'bg-gradient-to-br from-obsidian-800/80 to-obsidian-700/80 text-moonstone-100 mr-12 border border-gold-400/20'
        )}
        whileHover={{
          scale: 1.02,
          boxShadow: isUser 
            ? '0 10px 30px -10px rgba(168, 85, 247, 0.3)'
            : '0 10px 30px -10px rgba(212, 175, 55, 0.3)'
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Message Content */}
        <div className="relative z-10">
          <p className={cn(
            'text-sm leading-relaxed',
            isUser ? 'font-mystical' : 'font-ancient'
          )}>
            {message.content}
          </p>
          
          {/* Timestamp */}
          <div className="mt-2 text-xs opacity-60 font-mystical">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>

        {/* Decorative Elements */}
        {!isUser && (
          <>
            <div className="absolute top-1 right-1 opacity-30">
              <AlchemicalSymbol
                symbol={themeConfig.message.symbol}
                size={12}
                color={themeConfig.message.color}
              />
            </div>
            
            <div className="absolute bottom-1 left-1 opacity-20">
              <SacredGeometry
                type="seed-of-life"
                size={16}
                color={themeConfig.message.color}
                opacity={0.5}
              />
            </div>
          </>
        )}

        {isUser && (
          <div className="absolute bottom-1 right-1 opacity-30">
            <AlchemicalSymbol
              symbol="quintessence"
              size={10}
              color="#f1f5f9"
            />
          </div>
        )}
      </motion.div>

      {/* User Avatar */}
      {isUser && (
        <motion.div
          className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amethyst-500 to-cosmos-600 flex items-center justify-center"
          whileHover={{ scale: 1.1, rotate: -5 }}
          transition={{ duration: 0.2 }}
        >
          <AlchemicalSymbol
            symbol="quintessence"
            size={16}
            color="#f1f5f9"
          />
        </motion.div>
      )}
    </div>
  );
}

/**
 * Theme configurations for different mystical styles
 */
function getThemeConfig(theme: 'cosmic' | 'ethereal' | 'alchemical' | 'celestial') {
  const configs = {
    cosmic: {
      particles: {
        ...PARTICLE_PRESETS['cosmic-dust'],
        particleCount: 75
      },
      geometry: {
        type: 'flower-of-life' as const,
        color: '#9147ff'
      },
      symbols: {
        color: '#a855f7'
      },
      message: {
        symbol: 'mercury' as const,
        color: '#d4af37'
      }
    },
    ethereal: {
      particles: {
        ...PARTICLE_PRESETS['ethereal-mist'],
        particleCount: 100
      },
      geometry: {
        type: 'sri-yantra' as const,
        color: '#64748b'
      },
      symbols: {
        color: '#94a3b8'
      },
      message: {
        symbol: 'air' as const,
        color: '#cbd5e1'
      }
    },
    alchemical: {
      particles: {
        ...PARTICLE_PRESETS['alchemical-symbols'],
        particleCount: 40
      },
      geometry: {
        type: 'metatrons-cube' as const,
        color: '#d4af37'
      },
      symbols: {
        color: '#fbbf24'
      },
      message: {
        symbol: 'philosophers-stone' as const,
        color: '#f59e0b'
      }
    },
    celestial: {
      particles: {
        ...PARTICLE_PRESETS['stellar-field'],
        particleCount: 60
      },
      geometry: {
        type: 'merkaba' as const,
        color: '#34d399'
      },
      symbols: {
        color: '#10b981'
      },
      message: {
        symbol: 'sol' as const,
        color: '#059669'
      }
    }
  };

  return configs[theme];
}