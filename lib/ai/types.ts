// Core persona and AI types for IALchemist.app

export interface EmotionalState {
  primary: string;
  secondary?: string[];
  intensity: number; // 0-1
  context: string;
}

export interface SpiritualLevel {
  level: 'SEEKER' | 'STUDENT' | 'ADEPT' | 'MASTER';
  score: number; // 0-100
  progression: {
    principlesStudied: string[];
    practicesCompleted: number;
    transformationScore: number;
  };
}

export interface LifeChallenge {
  type: 'relationship' | 'career' | 'health' | 'spiritual' | 'financial' | 'family' | 'purpose';
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  hermeticApproach: string[];
}

export interface HermeticPrinciple {
  name: string;
  description: string;
  levels: {
    simple: string;
    intermediate: string;
    advanced: string;
  };
  practices: string[];
  applications: string[];
  emeraldTabletConnection?: string;
}

export interface DailyPractice {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  principle: string;
  steps: string[];
  benefits: string[];
  variations?: string[];
}

export interface TransformationGuidance {
  challenge: LifeChallenge;
  hermeticApproach: string;
  practices: DailyPractice[];
  mantras: string[];
  affirmations: string[];
  timeline: string;
  milestones: string[];
}

export interface PersonaResponse {
  systemPrompt: string;
  context: {
    emotionalState?: EmotionalState;
    spiritualLevel: SpiritualLevel;
    challenges?: LifeChallenge[];
    relevantPrinciples: string[];
    previousInteractions?: string;
  };
  tone: {
    formality: 'casual' | 'respectful' | 'formal' | 'mystical';
    warmth: 'supportive' | 'compassionate' | 'wise' | 'authoritative';
    teaching: 'storytelling' | 'direct' | 'socratic' | 'experiential';
  };
  storytellingElements?: {
    setting?: string;
    props?: string[];
    atmosphere?: string;
    symbolism?: string[];
  };
}

export interface UserContext {
  userId: string;
  emotionalState?: EmotionalState;
  spiritualLevel: SpiritualLevel;
  currentChallenges: LifeChallenge[];
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    hermeticContext?: {
      principles: string[];
      insights: string[];
    };
  }>;
  preferences: {
    language: string;
    teachingStyle: 'storytelling' | 'direct' | 'mixed';
    formality: 'casual' | 'formal';
    practiceLevel: 'beginner' | 'intermediate' | 'advanced';
  };
}