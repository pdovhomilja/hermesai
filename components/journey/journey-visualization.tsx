"use client";

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SacredGeometry } from '@/components/ui/sacred-geometry';
import { AlchemicalSymbol, type AlchemicalSymbolType } from '@/components/ui/alchemical-symbols';

export interface JourneyNode {
  id: string;
  title: string;
  description: string;
  symbol: AlchemicalSymbolType;
  geometry: 'flower-of-life' | 'metatrons-cube' | 'sri-yantra' | 'merkaba' | 'seed-of-life' | 'vesica-piscis';
  position: { x: number; y: number };
  completed: boolean;
  locked: boolean;
  completedAt?: Date;
  insights?: string[];
  nextNodes?: string[];
  previousNodes?: string[];
  category: 'foundation' | 'transformation' | 'mastery' | 'transcendence';
}

export interface JourneyPath {
  from: string;
  to: string;
  unlocked: boolean;
  energy: 'ascending' | 'descending' | 'balanced';
}

export interface JourneyVisualizationProps {
  nodes: JourneyNode[];
  paths: JourneyPath[];
  currentNodeId?: string;
  onNodeClick?: (node: JourneyNode) => void;
  onPathClick?: (path: JourneyPath) => void;
  className?: string;
  interactive?: boolean;
  showProgress?: boolean;
  animateProgress?: boolean;
}

/**
 * Spiritual Journey Visualization
 * Interactive map showing the seeker's progress through mystical stages
 */
export function JourneyVisualization({
  nodes,
  paths,
  currentNodeId,
  onNodeClick,
  onPathClick,
  className,
  interactive = true,
  showProgress = true,
  animateProgress = true
}: JourneyVisualizationProps) {
  const [selectedNode, setSelectedNode] = useState<JourneyNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const progressStats = useMemo(() => {
    const total = nodes.length;
    const completed = nodes.filter(n => n.completed).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { total, completed, percentage };
  }, [nodes]);

  const categoryStats = useMemo(() => {
    const stats = {
      foundation: { completed: 0, total: 0 },
      transformation: { completed: 0, total: 0 },
      mastery: { completed: 0, total: 0 },
      transcendence: { completed: 0, total: 0 }
    };

    nodes.forEach(node => {
      stats[node.category].total++;
      if (node.completed) {
        stats[node.category].completed++;
      }
    });

    return stats;
  }, [nodes]);

  const handleNodeClick = (node: JourneyNode) => {
    if (!interactive) return;
    
    setSelectedNode(selectedNode?.id === node.id ? null : node);
    onNodeClick?.(node);
  };

  return (
    <div className={cn('relative w-full h-full min-h-[600px] overflow-hidden', className)}>
      {/* Background Sacred Geometry */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10">
          <SacredGeometry
            type="flower-of-life"
            size={200}
            animated={true}
            color="#9147ff"
            rotationSpeed={0.1}
          />
        </div>
        <div className="absolute bottom-10 right-10">
          <SacredGeometry
            type="metatrons-cube"
            size={150}
            animated={true}
            color="#d4af37"
            rotationSpeed={-0.15}
          />
        </div>
      </div>

      {/* Journey Map SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 800"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Gradient definitions for paths */}
          <linearGradient id="ascendingPath" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0.8" />
          </linearGradient>
          
          <linearGradient id="descendingPath" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9147ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
          </linearGradient>
          
          <linearGradient id="balancedPath" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.6" />
          </linearGradient>

          {/* Filter for glowing effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Journey Paths */}
        {paths.map((path, index) => {
          const fromNode = nodes.find(n => n.id === path.from);
          const toNode = nodes.find(n => n.id === path.to);
          
          if (!fromNode || !toNode) return null;

          const pathColor = path.energy === 'ascending' ? '#fbbf24' : 
                           path.energy === 'descending' ? '#9147ff' : '#34d399';
          
          return (
            <motion.g
              key={`${path.from}-${path.to}`}
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ 
                opacity: path.unlocked ? 0.8 : 0.3, 
                pathLength: 1 
              }}
              transition={{ 
                duration: animateProgress ? 2 : 0, 
                delay: animateProgress ? index * 0.2 : 0 
              }}
            >
              {/* Main path line */}
              <motion.path
                d={`M ${fromNode.position.x} ${fromNode.position.y} 
                    Q ${(fromNode.position.x + toNode.position.x) / 2} ${(fromNode.position.y + toNode.position.y) / 2 - 30} 
                    ${toNode.position.x} ${toNode.position.y}`}
                stroke={path.unlocked ? pathColor : '#475569'}
                strokeWidth="3"
                fill="none"
                strokeDasharray={path.unlocked ? "0" : "8 4"}
                filter={path.unlocked ? "url(#glow)" : undefined}
                className={cn(
                  'transition-all duration-300',
                  interactive && 'cursor-pointer hover:stroke-width-4'
                )}
                onClick={() => interactive && onPathClick?.(path)}
              />

              {/* Energy flow animation */}
              {path.unlocked && (
                <motion.circle
                  r="3"
                  fill={pathColor}
                  filter="url(#glow)"
                >
                  <animateMotion
                    dur="3s"
                    repeatCount="indefinite"
                    path={`M ${fromNode.position.x} ${fromNode.position.y} 
                           Q ${(fromNode.position.x + toNode.position.x) / 2} ${(fromNode.position.y + toNode.position.y) / 2 - 30} 
                           ${toNode.position.x} ${toNode.position.y}`}
                  />
                </motion.circle>
              )}
            </motion.g>
          );
        })}

        {/* Journey Nodes */}
        {nodes.map((node, index) => (
          <motion.g
            key={node.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: animateProgress ? index * 0.15 : 0,
              type: "spring",
              stiffness: 100
            }}
            className={cn(
              'cursor-pointer',
              { 'pointer-events-none': !interactive || node.locked }
            )}
            onClick={() => handleNodeClick(node)}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <JourneyNodeVisualization
              node={node}
              isSelected={selectedNode?.id === node.id}
              isHovered={hoveredNode === node.id}
              isCurrent={currentNodeId === node.id}
            />
          </motion.g>
        ))}
      </svg>

      {/* Progress Overlay */}
      {showProgress && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 right-4"
        >
          <JourneyProgressOverlay
            stats={progressStats}
            categoryStats={categoryStats}
            animated={animateProgress}
          />
        </motion.div>
      )}

      {/* Node Details Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            className="absolute top-4 right-4 w-80 max-w-[90vw]"
          >
            <NodeDetailsPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Individual Journey Node Visualization
 */
interface JourneyNodeVisualizationProps {
  node: JourneyNode;
  isSelected: boolean;
  isHovered: boolean;
  isCurrent: boolean;
}

function JourneyNodeVisualization({
  node,
  isSelected,
  isHovered,
  isCurrent
}: JourneyNodeVisualizationProps) {
  const nodeColor = getCategoryColor(node.category);
  const nodeSize = isSelected ? 60 : isHovered ? 55 : 50;

  return (
    <g>
      {/* Node background glow */}
      {(node.completed || isCurrent || isSelected) && (
        <circle
          cx={node.position.x}
          cy={node.position.y}
          r={nodeSize + 8}
          fill={nodeColor}
          opacity="0.2"
          filter="url(#glow)"
        />
      )}

      {/* Sacred geometry background */}
      <g transform={`translate(${node.position.x - nodeSize/2}, ${node.position.y - nodeSize/2})`}>
        <foreignObject width={nodeSize} height={nodeSize}>
          <SacredGeometry
            type={node.geometry}
            size={nodeSize}
            animated={isHovered || isSelected || isCurrent}
            color={node.completed ? nodeColor : '#64748b'}
            glowEffect={node.completed}
            opacity={node.locked ? 0.3 : 0.8}
          />
        </foreignObject>
      </g>

      {/* Node symbol */}
      <g transform={`translate(${node.position.x}, ${node.position.y})`}>
        <foreignObject x="-12" y="-12" width="24" height="24">
          <AlchemicalSymbol
            symbol={node.symbol}
            size={24}
            color={node.completed ? '#ffffff' : node.locked ? '#64748b' : nodeColor}
            glowEffect={node.completed}
            animated={isCurrent}
          />
        </foreignObject>
      </g>

      {/* Completion indicator */}
      {node.completed && (
        <circle
          cx={node.position.x + 20}
          cy={node.position.y - 20}
          r="6"
          fill="#34d399"
          stroke="#ffffff"
          strokeWidth="2"
        >
          <animate
            attributeName="r"
            values="6;8;6"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Current indicator */}
      {isCurrent && (
        <circle
          cx={node.position.x}
          cy={node.position.y}
          r={nodeSize + 5}
          fill="none"
          stroke={nodeColor}
          strokeWidth="2"
          opacity="0.8"
        >
          <animate
            attributeName="r"
            values={`${nodeSize + 5};${nodeSize + 10};${nodeSize + 5}`}
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Lock indicator */}
      {node.locked && (
        <g transform={`translate(${node.position.x - 6}, ${node.position.y + 20})`}>
          <rect x="0" y="4" width="12" height="8" rx="1" fill="#64748b" />
          <path
            d="M3 4 Q3 1 6 1 Q9 1 9 4"
            stroke="#64748b"
            strokeWidth="1.5"
            fill="none"
          />
        </g>
      )}

      {/* Node label */}
      <text
        x={node.position.x}
        y={node.position.y + nodeSize + 15}
        textAnchor="middle"
        className="text-xs font-mystical fill-moonstone-300"
        opacity={isHovered || isSelected ? 1 : 0.7}
      >
        {node.title}
      </text>
    </g>
  );
}

/**
 * Progress Overlay Component
 */
interface JourneyProgressOverlayProps {
  stats: { total: number; completed: number; percentage: number };
  categoryStats: Record<string, { completed: number; total: number }>;
  animated: boolean;
}

function JourneyProgressOverlay({
  stats,
  categoryStats,
  animated
}: JourneyProgressOverlayProps) {
  return (
    <div className="bg-obsidian-800/90 backdrop-blur-sm border border-gold-400/20 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sacred text-sm font-semibold text-gold-300">
          Spiritual Progress
        </h3>
        <span className="text-xs text-moonstone-400">
          {stats.completed}/{stats.total} Nodes
        </span>
      </div>

      {/* Overall progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-moonstone-300">Overall Journey</span>
          <span className="text-xs text-gold-400 font-mystical">
            {Math.round(stats.percentage)}%
          </span>
        </div>
        <div className="h-2 bg-obsidian-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold-400 to-gold-600"
            initial={{ width: 0 }}
            animate={{ width: `${stats.percentage}%` }}
            transition={{ duration: animated ? 1.5 : 0, delay: animated ? 0.5 : 0 }}
          />
        </div>
      </div>

      {/* Category progress */}
      <div className="space-y-2">
        {Object.entries(categoryStats).map(([category, stat], index) => {
          const percentage = stat.total > 0 ? (stat.completed / stat.total) * 100 : 0;
          const color = getCategoryColor(category as JourneyNode['category']);
          
          return (
            <div key={category}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-moonstone-300 capitalize">
                  {category}
                </span>
                <span className="text-xs font-mystical" style={{ color }}>
                  {stat.completed}/{stat.total}
                </span>
              </div>
              <div className="h-1.5 bg-obsidian-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ 
                    duration: animated ? 1 : 0, 
                    delay: animated ? 0.8 + index * 0.2 : 0 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Node Details Panel
 */
interface NodeDetailsPanelProps {
  node: JourneyNode;
  onClose: () => void;
}

function NodeDetailsPanel({ node, onClose }: NodeDetailsPanelProps) {
  return (
    <div className="bg-obsidian-800/95 backdrop-blur-sm border border-gold-400/20 rounded-lg p-6 shadow-2xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <AlchemicalSymbol
            symbol={node.symbol}
            size={32}
            color={getCategoryColor(node.category)}
            glowEffect={node.completed}
          />
          <div>
            <h3 className="text-sacred text-lg font-semibold text-gold-300">
              {node.title}
            </h3>
            <span className={cn(
              'text-xs px-2 py-1 rounded-full font-mystical',
              'bg-cosmos-500/20 text-cosmos-300'
            )}>
              {node.category}
            </span>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="text-moonstone-400 hover:text-moonstone-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="text-sm text-moonstone-300 font-ancient leading-relaxed mb-4">
        {node.description}
      </p>

      {/* Status indicators */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-1">
          <div className={cn(
            'w-2 h-2 rounded-full',
            node.completed ? 'bg-emerald-400' : node.locked ? 'bg-red-400' : 'bg-gold-400'
          )} />
          <span className="text-xs text-moonstone-400">
            {node.completed ? 'Completed' : node.locked ? 'Locked' : 'Available'}
          </span>
        </div>
        
        {node.completedAt && (
          <span className="text-xs text-moonstone-500">
            Completed {node.completedAt.toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Sacred geometry visualization */}
      <div className="flex justify-center mb-4">
        <SacredGeometry
          type={node.geometry}
          size={80}
          animated={true}
          color={getCategoryColor(node.category)}
          glowEffect={node.completed}
          rotationSpeed={0.5}
        />
      </div>

      {/* Insights */}
      {node.insights && node.insights.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gold-300 mb-2 font-mystical">
            Mystical Insights
          </h4>
          <ul className="space-y-1">
            {node.insights.map((insight, index) => (
              <li key={index} className="text-xs text-moonstone-300 font-ancient">
                • {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Helper function to get category-specific colors
 */
function getCategoryColor(category: JourneyNode['category']): string {
  const colors = {
    foundation: '#d4af37', // Gold
    transformation: '#9147ff', // Purple
    mastery: '#34d399', // Emerald
    transcendence: '#fbbf24' // Amber
  };
  
  return colors[category as keyof typeof colors] || '#64748b';
}

/**
 * Example journey nodes for demonstration
 */
export const EXAMPLE_JOURNEY_NODES: JourneyNode[] = [
  {
    id: 'awareness',
    title: 'Awakening',
    description: 'The first spark of spiritual awareness ignites within the seeker.',
    symbol: 'mercury',
    geometry: 'seed-of-life',
    position: { x: 200, y: 600 },
    completed: true,
    locked: false,
    category: 'foundation',
    insights: ['Recognition of the spiritual path', 'Questioning material existence'],
    completedAt: new Date('2024-01-15')
  },
  {
    id: 'purification',
    title: 'Purification',
    description: 'Cleansing the mind and body to prepare for deeper wisdom.',
    symbol: 'salt',
    geometry: 'vesica-piscis',
    position: { x: 350, y: 500 },
    completed: true,
    locked: false,
    category: 'foundation',
    insights: ['Releasing attachments', 'Mental clarity through discipline'],
    completedAt: new Date('2024-02-10')
  },
  {
    id: 'elements',
    title: 'Elemental Balance',
    description: 'Understanding and harmonizing the four classical elements within.',
    symbol: 'quintessence',
    geometry: 'flower-of-life',
    position: { x: 500, y: 400 },
    completed: false,
    locked: false,
    category: 'transformation',
    insights: ['Earth grounds the spirit', 'Water flows with emotion', 'Air carries thought', 'Fire transforms']
  },
  {
    id: 'solve-coagula',
    title: 'Solve et Coagula',
    description: 'The great work of dissolution and coagulation - breaking down to rebuild.',
    symbol: 'sulfur',
    geometry: 'sri-yantra',
    position: { x: 650, y: 300 },
    completed: false,
    locked: true,
    category: 'transformation'
  },
  {
    id: 'philosophers-stone',
    title: "Philosopher's Stone",
    description: 'The ultimate achievement - transmutation of the base self into gold.',
    symbol: 'philosophers-stone',
    geometry: 'metatrons-cube',
    position: { x: 800, y: 200 },
    completed: false,
    locked: true,
    category: 'mastery'
  }
];