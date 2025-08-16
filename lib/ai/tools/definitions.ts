import { generatePersonalizedRitual } from "./ritual-generator";
import { interpretDreamHermetically } from "./dream-interpreter";
import { createPersonalizedMantra } from "./mantra-creator";
import { analyzeLifeChallenge } from "./challenge-analyzer";
import { generateGuidedMeditation } from "./meditation-generator";
import { calculateHermeticNumerology } from "./numerology-calculator";
import { drawAndInterpretTarot } from "./tarot-reader";
import { createMagicalSigil } from "./sigil-creator";

// Export all hermetic AI tools
export const hermeticTools = {
  generateRitual: generatePersonalizedRitual,
  interpretDream: interpretDreamHermetically,
  createMantra: createPersonalizedMantra,
  analyzeChallenge: analyzeLifeChallenge,
  generateMeditation: generateGuidedMeditation,
  calculateNumerology: calculateHermeticNumerology,
  drawTarot: drawAndInterpretTarot,
  createSigil: createMagicalSigil,
};

// Tool metadata for analytics and UI
export const toolMetadata = {
  generateRitual: {
    category: "practice",
    tier: "premium",
    avgExecutionTime: 3000,
    description: "Create personalized hermetic rituals",
  },
  interpretDream: {
    category: "divination",
    tier: "premium", 
    avgExecutionTime: 4000,
    description: "Interpret dreams through ancient wisdom",
  },
  createMantra: {
    category: "practice",
    tier: "basic",
    avgExecutionTime: 2000,
    description: "Generate personalized mantras",
  },
  analyzeChallenge: {
    category: "guidance",
    tier: "basic",
    avgExecutionTime: 3500,
    description: "Spiritual analysis of life challenges",
  },
  generateMeditation: {
    category: "practice",
    tier: "basic",
    avgExecutionTime: 2500,
    description: "Create guided meditation scripts",
  },
  calculateNumerology: {
    category: "divination",
    tier: "premium",
    avgExecutionTime: 1500,
    description: "Hermetic numerological analysis",
  },
  drawTarot: {
    category: "divination",
    tier: "master",
    avgExecutionTime: 5000,
    description: "Tarot card reading and interpretation",
  },
  createSigil: {
    category: "practice",
    tier: "master",
    avgExecutionTime: 3000,
    description: "Create magical sigils for manifestation",
  },
};

// Helper function to check tool access based on subscription
export function canAccessTool(toolName: string, userTier: "FREE" | "BASIC" | "PREMIUM" | "MASTER"): boolean {
  const tool = toolMetadata[toolName as keyof typeof toolMetadata];
  if (!tool) return false;

  const tierHierarchy = {
    FREE: 0,
    BASIC: 1,
    PREMIUM: 2,
    MASTER: 3,
  };

  const toolTierHierarchy = {
    basic: 1,
    premium: 2,
    master: 3,
  };

  return tierHierarchy[userTier] >= toolTierHierarchy[tool.tier as keyof typeof toolTierHierarchy];
}

// Function parameter schemas for validation
export const toolSchemas = {
  generateRitual: {
    purpose: "string", 
    principle: "mentalism | correspondence | vibration | polarity | rhythm | causeEffect | gender",
    duration: "number (5-120)",
    elements: "string[]",
    timeOfDay: "dawn | morning | noon | afternoon | evening | night | midnight (optional)",
    difficulty: "beginner | intermediate | advanced"
  },
  interpretDream: {
    dreamContent: "string (min 20 chars)",
    emotions: "string[]",
    recurringElements: "string[] (optional)",
    dreamType: "prophetic | healing | guidance | shadow | lucid | nightmare | ordinary",
    personalSymbols: "string[] (optional)"
  },
  createMantra: {
    intention: "string",
    principle: "mentalism | correspondence | vibration | polarity | rhythm | causeEffect | gender",
    language: "en | cs | es | fr | de | it | pt",
    style: "traditional | modern | poetic | simple | mystical",
    length: "short | medium | long"
  },
  analyzeChallenge: {
    challenge: "string (min 10 chars)",
    context: "string",
    desiredOutcome: "string",
    principlesApplied: "string[] (optional)",
    timeframe: "string (optional)",
    previousAttempts: "string (optional)"
  },
  generateMeditation: {
    focus: "string",
    duration: "number (5-60)",
    technique: "visualization | breathwork | mantra | body-scan | contemplation | loving-kindness | mindfulness",
    background: "silence | nature | music | bells | chanting (optional)",
    level: "beginner | intermediate | advanced",
    principle: "hermetic principle (optional)"
  },
  calculateNumerology: {
    input: "string",
    type: "name | birthdate | event | phrase | question",
    system: "pythagorean | chaldean | hermetic | kabbalistic",
    includeReduction: "boolean",
    culturalContext: "string (optional)"
  },
  drawTarot: {
    spread: "single | three-card | celtic-cross | hermetic-seven | life-path | relationship",
    question: "string",
    deck: "rider-waite | thoth | hermetic | marseille",
    focusArea: "love | career | spiritual | health | general | shadow-work (optional)",
    timeframe: "past | present | future | all"
  },
  createSigil: {
    intention: "string (min 5 chars)",
    method: "letter | planetary | geometric | intuitive | chaos",
    includeActivation: "boolean",
    complexity: "simple | moderate | complex",
    elements: "fire | water | air | earth[] (optional)",
    timeframe: "string (optional)"
  }
};