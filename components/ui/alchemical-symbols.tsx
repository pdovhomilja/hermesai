"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface AlchemicalSymbolProps {
  symbol: AlchemicalSymbolType;
  size?: number;
  color?: string;
  className?: string;
  animated?: boolean;
  glowEffect?: boolean;
  title?: string;
}

export type AlchemicalSymbolType = 
  | 'mercury' 
  | 'sulfur' 
  | 'salt' 
  | 'philosophers-stone' 
  | 'quintessence' 
  | 'ouroboros' 
  | 'antimony'
  | 'arsenic'
  | 'bismuth'
  | 'copper'
  | 'gold'
  | 'iron'
  | 'lead'
  | 'silver'
  | 'tin'
  | 'zinc'
  | 'fire'
  | 'water'
  | 'air'
  | 'earth'
  | 'sol'
  | 'luna'
  | 'mars'
  | 'venus'
  | 'jupiter'
  | 'saturn'
  | 'caput-mortuum'
  | 'aqua-vitae';

/**
 * Alchemical Symbol Component
 * Renders authentic alchemical and hermetic symbols as optimized SVGs
 */
export function AlchemicalSymbol({
  symbol,
  size = 24,
  color = 'currentColor',
  className,
  animated = false,
  glowEffect = false,
  title
}: AlchemicalSymbolProps) {
  const symbolData = SYMBOL_DEFINITIONS[symbol];
  
  if (!symbolData) {
    console.warn(`Unknown alchemical symbol: ${symbol}`);
    return null;
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        {
          'animate-pulse-glow': animated && glowEffect,
          'animate-float': animated && !glowEffect,
        },
        className
      )}
      title={title || symbolData.name}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn({
          'sacred-glow': glowEffect,
          'drop-shadow-lg': !glowEffect
        })}
        aria-label={symbolData.name}
        role="img"
      >
        <g
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={symbolData.filled ? color : 'none'}
        >
          {symbolData.paths.map((path, index) => (
            <path
              key={index}
              d={path.d}
              fill={path.fill || (symbolData.filled ? color : 'none')}
              stroke={path.stroke || color}
              strokeWidth={path.strokeWidth || 2}
              opacity={path.opacity || 1}
            />
          ))}
          {symbolData.circles?.map((circle, index) => (
            <circle
              key={index}
              cx={circle.cx}
              cy={circle.cy}
              r={circle.r}
              fill={circle.fill || 'none'}
              stroke={circle.stroke || color}
              strokeWidth={circle.strokeWidth || 2}
            />
          ))}
          {symbolData.lines?.map((line, index) => (
            <line
              key={index}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={line.stroke || color}
              strokeWidth={line.strokeWidth || 2}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

/**
 * Symbol path definitions and metadata
 */
const SYMBOL_DEFINITIONS: Record<AlchemicalSymbolType, {
  name: string;
  meaning: string;
  filled?: boolean;
  paths: Array<{
    d: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
  }>;
  circles?: Array<{
    cx: number;
    cy: number;
    r: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  }>;
  lines?: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stroke?: string;
    strokeWidth?: number;
  }>;
}> = {
  mercury: {
    name: 'Mercury (Quicksilver)',
    meaning: 'The spirit, consciousness, communication',
    paths: [],
    circles: [
      { cx: 50, cy: 40, r: 15 }
    ],
    lines: [
      { x1: 50, y1: 25, x2: 50, y2: 15 },
      { x1: 45, y1: 20, x2: 55, y2: 20 },
      { x1: 50, y1: 55, x2: 50, y2: 85 },
      { x1: 40, y1: 75, x2: 60, y2: 75 }
    ]
  },

  sulfur: {
    name: 'Sulfur (Brimstone)',
    meaning: 'The soul, emotions, desires',
    paths: [
      {
        d: 'M50 20 L35 50 L65 50 Z'
      }
    ],
    circles: [],
    lines: [
      { x1: 50, y1: 50, x2: 50, y2: 80 },
      { x1: 40, y1: 70, x2: 60, y2: 70 }
    ]
  },

  salt: {
    name: 'Salt',
    meaning: 'The body, physical matter, crystallization',
    paths: [],
    circles: [
      { cx: 50, cy: 50, r: 20 }
    ],
    lines: [
      { x1: 30, y1: 50, x2: 70, y2: 50 },
      { x1: 50, y1: 30, x2: 50, y2: 70 }
    ]
  },

  'philosophers-stone': {
    name: "Philosopher's Stone",
    meaning: 'The goal of alchemy, perfect transmutation',
    paths: [
      {
        d: 'M50 15 L70 35 L70 65 L50 85 L30 65 L30 35 Z'
      }
    ],
    circles: [
      { cx: 50, cy: 50, r: 8 }
    ],
    lines: []
  },

  quintessence: {
    name: 'Quintessence',
    meaning: 'The fifth element, spiritual essence',
    paths: [
      {
        d: 'M50 20 L62 42 L85 42 L67 58 L73 80 L50 68 L27 80 L33 58 L15 42 L38 42 Z'
      }
    ],
    circles: [
      { cx: 50, cy: 50, r: 6 }
    ],
    lines: []
  },

  ouroboros: {
    name: 'Ouroboros',
    meaning: 'Eternal cycle, unity of opposites',
    paths: [
      {
        d: 'M50 10 C75 10 90 25 90 50 C90 75 75 90 50 90 C25 90 10 75 10 50 C10 25 25 10 50 10',
        fill: 'none'
      },
      {
        d: 'M85 45 L88 50 L85 55 L75 50 Z'
      }
    ],
    circles: [
      { cx: 78, cy: 47, r: 2 }
    ],
    lines: []
  },

  antimony: {
    name: 'Antimony',
    meaning: 'The wild wolf of metals',
    paths: [
      {
        d: 'M25 80 L50 20 L75 80 Z',
        fill: 'none'
      }
    ],
    circles: [
      { cx: 50, cy: 50, r: 8 }
    ],
    lines: [
      { x1: 35, y1: 65, x2: 65, y2: 65 }
    ]
  },

  gold: {
    name: 'Gold (Sol)',
    meaning: 'Perfection, the sun, masculine principle',
    paths: [],
    circles: [
      { cx: 50, cy: 50, r: 20 }
    ],
    lines: [
      { x1: 50, y1: 20, x2: 50, y2: 80 },
      { x1: 30, y1: 50, x2: 70, y2: 50 },
      { x1: 35, y1: 35, x2: 65, y2: 65 },
      { x1: 35, y1: 65, x2: 65, y2: 35 }
    ]
  },

  silver: {
    name: 'Silver (Luna)',
    meaning: 'Purity, the moon, feminine principle',
    paths: [
      {
        d: 'M50 20 C35 20 25 35 25 50 C25 65 35 80 50 80 C65 80 75 65 75 50 C75 35 65 20 50 20',
        fill: 'none'
      }
    ],
    circles: [],
    lines: [
      { x1: 50, y1: 15, x2: 50, y2: 25 },
      { x1: 40, y1: 20, x2: 60, y2: 20 }
    ]
  },

  fire: {
    name: 'Fire',
    meaning: 'Hot and dry, ascending energy',
    paths: [
      {
        d: 'M50 20 L70 70 L30 70 Z'
      }
    ],
    circles: [],
    lines: []
  },

  water: {
    name: 'Water',
    meaning: 'Cold and moist, descending energy',
    paths: [
      {
        d: 'M30 30 L70 30 L50 80 Z'
      }
    ],
    circles: [],
    lines: []
  },

  air: {
    name: 'Air',
    meaning: 'Hot and moist, ascending energy',
    paths: [
      {
        d: 'M50 20 L70 70 L30 70 Z',
        fill: 'none'
      }
    ],
    circles: [],
    lines: [
      { x1: 35, y1: 55, x2: 65, y2: 55 }
    ]
  },

  earth: {
    name: 'Earth',
    meaning: 'Cold and dry, descending energy',
    paths: [
      {
        d: 'M30 30 L70 30 L50 80 Z',
        fill: 'none'
      }
    ],
    circles: [],
    lines: [
      { x1: 35, y1: 45, x2: 65, y2: 45 }
    ]
  },

  copper: {
    name: 'Copper (Venus)',
    meaning: 'Beauty, love, artistic expression',
    paths: [],
    circles: [
      { cx: 50, cy: 40, r: 15 }
    ],
    lines: [
      { x1: 50, y1: 55, x2: 50, y2: 80 },
      { x1: 40, y1: 70, x2: 60, y2: 70 }
    ]
  },

  iron: {
    name: 'Iron (Mars)',
    meaning: 'Strength, war, masculine energy',
    paths: [],
    circles: [
      { cx: 50, cy: 50, r: 15 }
    ],
    lines: [
      { x1: 50, y1: 35, x2: 65, y2: 20 },
      { x1: 60, y1: 20, x2: 70, y2: 30 }
    ]
  },

  lead: {
    name: 'Lead (Saturn)',
    meaning: 'Time, limitation, transformation',
    paths: [
      {
        d: 'M35 30 C35 20 45 20 50 20 C55 20 65 20 65 30 C65 40 55 45 50 45 C45 45 35 40 35 30 Z',
        fill: 'none'
      }
    ],
    circles: [],
    lines: [
      { x1: 35, y1: 45, x2: 35, y2: 75 },
      { x1: 30, y1: 75, x2: 70, y2: 75 }
    ]
  },

  tin: {
    name: 'Tin (Jupiter)',
    meaning: 'Expansion, wisdom, spiritual growth',
    paths: [],
    circles: [],
    lines: [
      { x1: 25, y1: 40, x2: 75, y2: 40 },
      { x1: 50, y1: 25, x2: 50, y2: 75 },
      { x1: 40, y1: 60, x2: 50, y2: 40 },
      { x1: 60, y1: 60, x2: 50, y2: 40 }
    ]
  },

  zinc: {
    name: 'Zinc',
    meaning: 'Healing, protection, purification',
    paths: [
      {
        d: 'M25 30 L75 30 L60 50 L75 70 L25 70 L40 50 Z',
        fill: 'none'
      }
    ],
    circles: [],
    lines: []
  },

  sol: {
    name: 'Sol (Sun)',
    meaning: 'Consciousness, enlightenment, gold',
    paths: [],
    circles: [
      { cx: 50, cy: 50, r: 12 },
      { cx: 50, cy: 50, r: 3 }
    ],
    lines: [
      { x1: 50, y1: 20, x2: 50, y2: 30 },
      { x1: 50, y1: 70, x2: 50, y2: 80 },
      { x1: 20, y1: 50, x2: 30, y2: 50 },
      { x1: 70, y1: 50, x2: 80, y2: 50 },
      { x1: 29, y1: 29, x2: 35, y2: 35 },
      { x1: 71, y1: 71, x2: 65, y2: 65 },
      { x1: 71, y1: 29, x2: 65, y2: 35 },
      { x1: 29, y1: 71, x2: 35, y2: 65 }
    ]
  },

  luna: {
    name: 'Luna (Moon)',
    meaning: 'Intuition, subconscious, silver',
    paths: [
      {
        d: 'M35 25 C25 35 25 65 35 75 C45 65 45 35 35 25',
        fill: 'none'
      },
      {
        d: 'M35 25 C45 35 45 65 35 75 C50 70 55 50 50 30',
        opacity: 0.3
      }
    ],
    circles: [],
    lines: []
  },

  mars: {
    name: 'Mars',
    meaning: 'Energy, action, iron',
    paths: [],
    circles: [
      { cx: 50, cy: 50, r: 15 }
    ],
    lines: [
      { x1: 62, y1: 38, x2: 75, y2: 25 },
      { x1: 70, y1: 25, x2: 80, y2: 35 },
      { x1: 70, y1: 35, x2: 80, y2: 25 }
    ]
  },

  venus: {
    name: 'Venus',
    meaning: 'Love, beauty, copper',
    paths: [],
    circles: [
      { cx: 50, cy: 40, r: 15 }
    ],
    lines: [
      { x1: 50, y1: 55, x2: 50, y2: 75 },
      { x1: 40, y1: 70, x2: 60, y2: 70 }
    ]
  },

  jupiter: {
    name: 'Jupiter',
    meaning: 'Expansion, wisdom, tin',
    paths: [],
    circles: [],
    lines: [
      { x1: 30, y1: 40, x2: 70, y2: 40 },
      { x1: 30, y1: 25, x2: 30, y2: 75 },
      { x1: 20, y1: 60, x2: 40, y2: 40 }
    ]
  },

  saturn: {
    name: 'Saturn',
    meaning: 'Time, limitation, lead',
    paths: [
      {
        d: 'M30 30 C30 20 40 15 50 15 C60 15 70 20 70 30 C70 40 60 45 50 45 C40 45 30 40 30 30',
        fill: 'none'
      }
    ],
    circles: [],
    lines: [
      { x1: 30, y1: 45, x2: 30, y2: 70 },
      { x1: 25, y1: 70, x2: 75, y2: 70 }
    ]
  },

  'caput-mortuum': {
    name: 'Caput Mortuum',
    meaning: 'Death\'s head, worthless remains',
    paths: [],
    circles: [
      { cx: 50, cy: 45, r: 20 }
    ],
    lines: [
      { x1: 40, y1: 40, x2: 40, y2: 35 },
      { x1: 60, y1: 40, x2: 60, y2: 35 },
      { x1: 45, y1: 50, x2: 55, y2: 50 }
    ]
  },

  'aqua-vitae': {
    name: 'Aqua Vitae',
    meaning: 'Water of life, spiritual essence',
    paths: [
      {
        d: 'M50 20 C35 30 35 50 50 60 C65 50 65 30 50 20',
        fill: 'none'
      },
      {
        d: 'M45 75 C47 77 50 78 50 80 C50 78 53 77 55 75',
        fill: 'none'
      }
    ],
    circles: [],
    lines: [
      { x1: 50, y1: 60, x2: 50, y2: 75 }
    ]
  },

  arsenic: {
    name: 'Arsenic',
    meaning: 'The poison, hidden knowledge',
    paths: [
      {
        d: 'M25 75 L50 25 L75 75 L60 75 L50 55 L40 75 Z',
        fill: 'none'
      }
    ],
    circles: [],
    lines: []
  },

  bismuth: {
    name: 'Bismuth',
    meaning: 'Transformation, rainbow metal',
    paths: [
      {
        d: 'M35 25 L65 25 L65 55 L50 70 L35 55 Z',
        fill: 'none'
      }
    ],
    circles: [
      { cx: 50, cy: 80, r: 5 }
    ],
    lines: []
  }
};

/**
 * Predefined symbol collections for different contexts
 */
export const SYMBOL_COLLECTIONS = {
  essential: ['mercury', 'sulfur', 'salt'] as const,
  elements: ['fire', 'water', 'air', 'earth'] as const,
  planets: ['sol', 'luna', 'mars', 'venus', 'jupiter', 'saturn', 'mercury'] as const,
  metals: ['gold', 'silver', 'copper', 'iron', 'lead', 'tin'] as const,
  sacred: ['philosophers-stone', 'quintessence', 'ouroboros'] as const,
  transformation: ['antimony', 'arsenic', 'bismuth', 'zinc'] as const
} as const;

/**
 * Get symbol meaning and description
 */
export function getSymbolInfo(symbol: AlchemicalSymbolType) {
  return SYMBOL_DEFINITIONS[symbol] || null;
}

/**
 * Symbol Grid Component for displaying collections
 */
export interface SymbolGridProps {
  collection: keyof typeof SYMBOL_COLLECTIONS | AlchemicalSymbolType[];
  size?: number;
  animated?: boolean;
  className?: string;
  onSymbolClick?: (symbol: AlchemicalSymbolType) => void;
}

export function SymbolGrid({
  collection,
  size = 32,
  animated = false,
  className,
  onSymbolClick
}: SymbolGridProps) {
  const symbols = Array.isArray(collection) ? collection : SYMBOL_COLLECTIONS[collection];
  
  return (
    <div className={cn('grid grid-cols-4 gap-4', className)}>
      {symbols.map((symbol) => (
        <button
          key={symbol}
          onClick={() => onSymbolClick?.(symbol)}
          className="p-2 rounded-lg hover:bg-cosmos-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
          title={SYMBOL_DEFINITIONS[symbol]?.name}
        >
          <AlchemicalSymbol
            symbol={symbol}
            size={size}
            animated={animated}
            color="currentColor"
          />
        </button>
      ))}
    </div>
  );
}