# Phase 8: Advanced AI Features

## Overview

This phase implements advanced AI capabilities including tool calling for interactive experiences, ritual creation, dream interpretation, personalized transformation programs, and GPT-5 thinking mode for deep philosophical analysis.

## Prerequisites

- Phases 1-7 completed
- Vercel AI SDK v5 configured
- GPT-5 API access

## Phase Objectives

1. Implement AI SDK tool calling for interactive features
2. Create ritual and practice generation system
3. Build dream interpretation engine
4. Develop personalized transformation programs
5. Implement GPT-5 thinking mode for complex queries
6. Add voice interaction preparation
7. Create advanced hermetic analysis tools

## Implementation Steps

### Step 1: AI Tool Definitions

Create `lib/ai/tools/definitions.ts`:

```typescript
import { tool } from "ai";
import { z } from "zod";

export const hermeticTools = {
  generateRitual: tool({
    description: "Generate a personalized ritual based on user needs",
    parameters: z.object({
      purpose: z.string().describe("The purpose of the ritual"),
      principle: z.string().describe("The hermetic principle to focus on"),
      duration: z.number().describe("Duration in minutes"),
      elements: z
        .array(z.string())
        .describe("Elements to include (candles, crystals, etc.)"),
      timeOfDay: z
        .enum(["dawn", "morning", "noon", "evening", "night"])
        .optional(),
    }),
    execute: async ({ purpose, principle, duration, elements, timeOfDay }) => {
      return generatePersonalizedRitual({
        purpose,
        principle,
        duration,
        elements,
        timeOfDay,
      });
    },
  }),

  interpretDream: tool({
    description: "Interpret a dream through hermetic symbolism",
    parameters: z.object({
      dreamContent: z.string().describe("The dream description"),
      emotions: z.array(z.string()).describe("Emotions felt during the dream"),
      recurringElements: z
        .array(z.string())
        .optional()
        .describe("Recurring elements if any"),
    }),
    execute: async ({ dreamContent, emotions, recurringElements }) => {
      return interpretDreamHermetically({
        dreamContent,
        emotions,
        recurringElements,
      });
    },
  }),

  createMantra: tool({
    description: "Create a personalized mantra for daily practice",
    parameters: z.object({
      intention: z.string().describe("The intention for the mantra"),
      principle: z.string().describe("Hermetic principle to embody"),
      language: z.string().default("en").describe("Language for the mantra"),
      style: z.enum(["traditional", "modern", "poetic"]).default("traditional"),
    }),
    execute: async ({ intention, principle, language, style }) => {
      return createPersonalizedMantra({
        intention,
        principle,
        language,
        style,
      });
    },
  }),

  analyzeChallenge: tool({
    description: "Analyze a life challenge through hermetic principles",
    parameters: z.object({
      challenge: z.string().describe("Description of the challenge"),
      context: z.string().describe("Life context and circumstances"),
      desiredOutcome: z.string().describe("What the user wants to achieve"),
      principlesApplied: z.array(z.string()).optional(),
    }),
    execute: async ({
      challenge,
      context,
      desiredOutcome,
      principlesApplied,
    }) => {
      return analyzeLifeChallenge({
        challenge,
        context,
        desiredOutcome,
        principlesApplied,
      });
    },
  }),

  generateMeditation: tool({
    description: "Generate a guided meditation script",
    parameters: z.object({
      focus: z.string().describe("Focus of the meditation"),
      duration: z.number().describe("Duration in minutes"),
      technique: z.enum([
        "visualization",
        "breathwork",
        "mantra",
        "body-scan",
        "contemplation",
      ]),
      background: z.enum(["silence", "nature", "music", "bells"]).optional(),
    }),
    execute: async ({ focus, duration, technique, background }) => {
      return generateGuidedMeditation({
        focus,
        duration,
        technique,
        background,
      });
    },
  }),

  calculateNumerology: tool({
    description: "Calculate hermetic numerology for a name or date",
    parameters: z.object({
      input: z.string().describe("Name or date to analyze"),
      type: z.enum(["name", "birthdate", "event"]),
      system: z
        .enum(["pythagorean", "chaldean", "hermetic"])
        .default("hermetic"),
    }),
    execute: async ({ input, type, system }) => {
      return calculateHermeticNumerology({ input, type, system });
    },
  }),

  drawTarot: tool({
    description: "Draw and interpret tarot cards hermetically",
    parameters: z.object({
      spread: z.enum([
        "single",
        "three-card",
        "celtic-cross",
        "hermetic-seven",
      ]),
      question: z.string().describe("The question or situation"),
      deck: z.enum(["rider-waite", "thoth", "hermetic"]).default("hermetic"),
    }),
    execute: async ({ spread, question, deck }) => {
      return drawAndInterpretTarot({ spread, question, deck });
    },
  }),

  createSigil: tool({
    description: "Create a magical sigil for an intention",
    parameters: z.object({
      intention: z.string().describe("The intention for the sigil"),
      method: z
        .enum(["letter", "planetary", "geometric", "intuitive"])
        .default("letter"),
      includeActivation: z.boolean().default(true),
    }),
    execute: async ({ intention, method, includeActivation }) => {
      return createMagicalSigil({ intention, method, includeActivation });
    },
  }),
};
```

### Step 2: Ritual Generation System

Create `lib/ai/tools/ritual-generator.ts`:

```typescript
export interface Ritual {
  id: string;
  name: string;
  purpose: string;
  principle: string;
  duration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  elements: RitualElement[];
  steps: RitualStep[];
  timing: RitualTiming;
  effects: string[];
  warnings?: string[];
}

export interface RitualElement {
  item: string;
  purpose: string;
  optional: boolean;
  alternatives?: string[];
}

export interface RitualStep {
  order: number;
  action: string;
  duration: string;
  visualization?: string;
  mantra?: string;
  breathwork?: string;
}

export interface RitualTiming {
  timeOfDay?: string;
  moonPhase?: string;
  season?: string;
  frequency: string;
}

export async function generatePersonalizedRitual({
  purpose,
  principle,
  duration,
  elements,
  timeOfDay,
}: any): Promise<Ritual> {
  const ritualId = `ritual_${Date.now()}`;

  // Map principle to appropriate ritual structure
  const principleRituals: Record<string, any> = {
    mentalism: {
      focus: "mental transformation and thought control",
      primaryElement: "candle (representing illumination of mind)",
      keyAction: "visualization and affirmation",
      breathPattern: "4-7-8 calming breath",
    },
    correspondence: {
      focus: "aligning inner and outer worlds",
      primaryElement: "mirror (representing as above, so below)",
      keyAction: "reflection and correspondence mapping",
      breathPattern: "balanced breathing (equal in and out)",
    },
    vibration: {
      focus: "raising personal vibration",
      primaryElement: "singing bowl or bell",
      keyAction: "toning and vibrational alignment",
      breathPattern: "rapid breath of fire",
    },
    polarity: {
      focus: "balancing opposites",
      primaryElement: "two candles (black and white)",
      keyAction: "polarity meditation",
      breathPattern: "alternating nostril breathing",
    },
    rhythm: {
      focus: "harmonizing with natural cycles",
      primaryElement: "pendulum or metronome",
      keyAction: "rhythmic movement or swaying",
      breathPattern: "rhythmic breathing with counts",
    },
    causeEffect: {
      focus: "conscious creation and manifestation",
      primaryElement: "seeds or crystals",
      keyAction: "intention setting and release",
      breathPattern: "power breath with retention",
    },
    gender: {
      focus: "balancing masculine and feminine",
      primaryElement: "yin-yang symbol or balanced stones",
      keyAction: "gender energy balancing",
      breathPattern: "heart-centered breathing",
    },
  };

  const principleData =
    principleRituals[principle.toLowerCase()] || principleRituals.mentalism;

  // Generate ritual steps based on duration
  const steps = generateRitualSteps(duration, principleData, purpose);

  // Create ritual elements list
  const ritualElements: RitualElement[] = [
    {
      item: principleData.primaryElement,
      purpose: "Primary focus object",
      optional: false,
    },
    ...elements.map((el: string) => ({
      item: el,
      purpose: "Supporting element",
      optional: true,
      alternatives: getElementAlternatives(el),
    })),
  ];

  return {
    id: ritualId,
    name: `${principle} ${purpose} Ritual`,
    purpose,
    principle,
    duration,
    difficulty:
      duration <= 10
        ? "beginner"
        : duration <= 20
        ? "intermediate"
        : "advanced",
    elements: ritualElements,
    steps,
    timing: {
      timeOfDay: timeOfDay || getBestTimeForPrinciple(principle),
      moonPhase: getMoonPhaseForPurpose(purpose),
      frequency: "Daily for 7 days, then as needed",
    },
    effects: [
      `Aligns you with the principle of ${principle}`,
      `Facilitates ${purpose}`,
      "Deepens hermetic understanding",
      "Raises consciousness",
    ],
    warnings: getWarnings(principle),
  };
}

function generateRitualSteps(
  duration: number,
  principleData: any,
  purpose: string
): RitualStep[] {
  const steps: RitualStep[] = [];
  let remainingTime = duration;
  let order = 1;

  // Opening (20% of time)
  const openingTime = Math.round(duration * 0.2);
  steps.push({
    order: order++,
    action: "Create sacred space and light primary element",
    duration: `${openingTime} minutes`,
    visualization: "See yourself surrounded by protective golden light",
    breathwork: "Three deep cleansing breaths",
  });
  remainingTime -= openingTime;

  // Invocation (10% of time)
  const invocationTime = Math.round(duration * 0.1);
  steps.push({
    order: order++,
    action: "Invoke Hermes Trismegistus and state intention",
    duration: `${invocationTime} minutes`,
    mantra: `"Great Hermes, guide me in ${purpose} through the wisdom of ${principleData.focus}"`,
  });
  remainingTime -= invocationTime;

  // Main Practice (50% of time)
  const mainTime = Math.round(duration * 0.5);
  steps.push({
    order: order++,
    action: principleData.keyAction,
    duration: `${mainTime} minutes`,
    visualization: getVisualizationForPurpose(purpose),
    breathwork: principleData.breathPattern,
    mantra: generateMantraForPurpose(purpose),
  });
  remainingTime -= mainTime;

  // Integration (15% of time)
  const integrationTime = Math.round(duration * 0.15);
  steps.push({
    order: order++,
    action: "Integrate the energy and ground yourself",
    duration: `${integrationTime} minutes`,
    visualization: "See roots growing from your base into the earth",
    breathwork: "Slow, grounding breaths",
  });
  remainingTime -= integrationTime;

  // Closing (5% of time)
  steps.push({
    order: order++,
    action: "Thank Hermes and close the sacred space",
    duration: `${remainingTime} minutes`,
    mantra: '"The ritual is complete. So mote it be."',
  });

  return steps;
}

function getElementAlternatives(element: string): string[] {
  const alternatives: Record<string, string[]> = {
    candle: ["LED candle", "visualization of flame", "incense"],
    crystal: ["stone", "glass object", "salt"],
    incense: ["essential oil", "dried herbs", "visualization of smoke"],
    bell: ["singing bowl", "chime app", "clapping"],
    mirror: ["bowl of water", "polished metal", "phone screen"],
  };

  return alternatives[element.toLowerCase()] || [];
}

function getBestTimeForPrinciple(principle: string): string {
  const times: Record<string, string> = {
    mentalism: "Dawn - when the mind is clearest",
    correspondence: "Noon - balance point of day",
    vibration: "Sunrise - rising energy",
    polarity: "Dusk - between day and night",
    rhythm: "Same time daily - consistency",
    causeEffect: "New moon - for new beginnings",
    gender: "Full moon - for balance",
  };

  return times[principle.toLowerCase()] || "Any time with full presence";
}

function getMoonPhaseForPurpose(purpose: string): string {
  if (purpose.includes("release") || purpose.includes("letting go")) {
    return "Waning moon - for release";
  }
  if (purpose.includes("growth") || purpose.includes("manifest")) {
    return "Waxing moon - for growth";
  }
  if (purpose.includes("transform") || purpose.includes("change")) {
    return "New moon - for transformation";
  }
  return "Any phase - work with current energy";
}

function getVisualizationForPurpose(purpose: string): string {
  // Generate appropriate visualization based on purpose
  return `Visualize ${purpose} manifesting as golden light flowing through you`;
}

function generateMantraForPurpose(purpose: string): string {
  return `"I am aligned with divine wisdom. ${purpose} flows naturally through me."`;
}

function getWarnings(principle: string): string[] | undefined {
  if (principle.toLowerCase() === "polarity") {
    return ["May bring up shadow aspects for healing"];
  }
  if (principle.toLowerCase() === "vibration") {
    return ["Can be intense - ground well afterward"];
  }
  return undefined;
}
```

### Step 3: Dream Interpretation Engine

Create `lib/ai/tools/dream-interpreter.ts`:

```typescript
export interface DreamInterpretation {
  summary: string
  hermeticSymbols: DreamSymbol[]
  principles: string[]
  messages: string[]
  recommendations: string[]
  archetypes: string[]
}

export interface DreamSymbol {
  symbol: string
  hermeticMeaning: string
  personalMessage: string
  principle: string
}

export async function interpretDreamHermetically({
  dreamContent,
  emotions,
  recurringElements
}: any): Promise<DreamInterpretation> {

  // Extract symbols from dream
  const symbols = extractDreamSymbols(dreamContent)

  // Map symbols to hermetic meanings
  const hermeticSymbols = symbols.map(symbol => ({
    symbol,
    hermeticMeaning: getHermeticMeaning(symbol),
    personalMessage: getPersonalMessage(symbol, emotions),
    principle: getRelatedPrinciple(symbol)
  }))

  // Identify archetypes
  const archetypes = identifyArchetypes(dreamContent, symbols)

  // Generate interpretation
  return {
    summary: generateDreamSummary(dreamContent, hermeticSymbols),
    hermeticSymbols,
    principles: [...new Set(hermeticSymbols.map(s => s.principle))],
    messages: generateDreamMessages(hermeticSymbols, emotions, archetypes),
    recommendations: generateDreamRecommendations(hermeticSymbols, recurringElements),
    archetypes
  }
}

function extractDreamSymbols(content: string): string[] {
  const symbolPatterns = [
    /\b(water|ocean|river|lake)\b/gi,
    /\b(fire|flame|burning|light)\b/gi,
    /\b(earth|ground|mountain|stone)\b/gi,
    /\b(air|wind|flying|sky)\b/gi,
    /\b(snake|serpent|dragon)\b/gi,
    /\b(bird|eagle|phoenix|wings)\b/gi,
    /\b(door|gate|threshold|portal)\b/gi,
    /\b(mirror|reflection|shadow)\b/gi,
    /\b(key|lock|chest|treasure)\b/gi,
    /\b(death|rebirth|transformation)\b/gi,
  ]

  const symbols: string[] = []

  for (const pattern of symbolPatterns) {
    const matches = content.match(pattern)
    if (matches) {
      symbols.push(...matches.map(m => m.toLowerCase()))
    }
  }

  return [...new Set(symbols)]
}

function getHermeticMeaning(symbol: string): string {
  const meanings: Record<string, string> = {
    water: 'Emotions, intuition, the unconscious, fluidity of life',
    fire: 'Transformation, passion, will, spiritual energy',
    earth: 'Material reality, grounding, stability, manifestation',
    air: 'Thoughts, communication, intellect, new perspectives',
    snake: 'Kundalini, transformation, healing, hidden wisdom',
    bird: 'Spirit, freedom, higher perspective, messenger',
    door: 'Opportunity, transition, new phase, choice',
    mirror: 'Self-reflection, truth, illusion, correspondence',
    key: 'Solution, access to hidden knowledge, unlocking potential',
    death: 'End of cycle, transformation, rebirth, letting go'
  }

  return meanings[symbol] || 'Symbol of personal significance'
}

function getPersonalMessage(symbol: string, emotions: string[]): string {
  const hasPositiveEmotions = emotions.some(e =>
    ['joy', 'peace', 'love', 'excitement'].includes(e.toLowerCase())
  )

  const hasNegativeEmotions = emotions.some(e =>
    ['fear', 'anxiety', 'anger', 'sadness'].includes(e.toLowerCase())
  )

  if (hasPositiveEmotions) {
    return `This ${symbol} represents positive transformation in your life`
  }

  if (hasNegativeEmotions) {
    return `This ${symbol} indicates areas requiring healing or attention`
  }

  return `This ${symbol} carries neutral energy, observe its message`
}

function getRelatedPrinciple(symbol: string): string {
  const princ maps: Record<string, string> = {
    water: 'Rhythm',
    fire: 'Vibration',
    earth: 'Cause and Effect',
    air: 'Mentalism',
    snake: 'Polarity',
    bird: 'Correspondence',
    door: 'Cause and Effect',
    mirror: 'Correspondence',
    key: 'Mentalism',
    death: 'Rhythm'
  }

  return principles[symbol] || 'Mentalism'
}

function identifyArchetypes(content: string, symbols: string[]): string[] {
  const archetypes: string[] = []

  if (content.includes('wise') || content.includes('teacher') || content.includes('guide')) {
    archetypes.push('The Sage/Hermes')
  }

  if (content.includes('hero') || content.includes('warrior') || content.includes('fight')) {
    archetypes.push('The Hero')
  }

  if (content.includes('shadow') || content.includes('dark') || content.includes('hidden')) {
    archetypes.push('The Shadow')
  }

  if (content.includes('child') || content.includes('innocent') || content.includes('play')) {
    archetypes.push('The Inner Child')
  }

  if (content.includes('transform') || content.includes('change') || content.includes('magic')) {
    archetypes.push('The Alchemist')
  }

  return archetypes
}

function generateDreamSummary(content: string, symbols: DreamSymbol[]): string {
  const principlesInvolved = [...new Set(symbols.map(s => s.principle))].join(', ')

  return `This dream speaks to you through the principles of ${principlesInvolved}. ` +
         `The universe is communicating important messages about your spiritual journey ` +
         `through these sacred symbols.`
}

function generateDreamMessages(
  symbols: DreamSymbol[],
  emotions: string[],
  archetypes: string[]
): string[] {
  const messages: string[] = []

  messages.push('Your higher self is guiding you through symbolic language')

  if (symbols.length > 3) {
    messages.push('Multiple symbols suggest a complex transformation underway')
  }

  if (emotions.includes('fear')) {
    messages.push('Fear in dreams often represents areas ready for growth')
  }

  if (archetypes.includes('The Shadow')) {
    messages.push('Shadow work is being called for - embrace all aspects of self')
  }

  return messages
}

function generateDreamRecommendations(
  symbols: DreamSymbol[],
  recurringElements?: string[]
): string[] {
  const recommendations: string[] = []

  recommendations.push('Meditate on these symbols during your morning practice')

  if (recurringElements && recurringElements.length > 0) {
    recommendations.push(`Pay special attention to recurring element: ${recurringElements.join(', ')}`)
  }

  const principles = [...new Set(symbols.map(s => s.principle))]
  for (const principle of principles) {
    recommendations.push(`Work with the Principle of ${principle} for deeper understanding`)
  }

  recommendations.push('Keep a dream journal to track patterns and messages')

  return recommendations
}
```

### Step 4: GPT-5 Thinking Mode Integration

Create `lib/ai/thinking-mode.ts`:

```typescript
import { generateText } from "ai";
import { models } from "@/lib/ai/provider";

export interface DeepAnalysisRequest {
  query: string;
  context: string;
  depth: "surface" | "deep" | "profound";
  focusPrinciples?: string[];
}

export interface DeepAnalysisResponse {
  analysis: string;
  insights: string[];
  connections: string[];
  practicalApplications: string[];
  furtherQuestions: string[];
  thinkingProcess?: string;
}

export class ThinkingModeAnalyzer {
  async analyzePhilosophically(
    request: DeepAnalysisRequest
  ): Promise<DeepAnalysisResponse> {
    const systemPrompt = this.buildThinkingPrompt(request);

    // Use GPT-5 thinking mode for deep analysis
    const result = await generateText({
      model: models.thinking, // GPT-5 thinking mode
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: request.query },
      ],
      maxTokens: 8000, // Higher token limit for deep analysis
      temperature: 0.7,
    });

    return this.parseThinkingResponse(result.text);
  }

  private buildThinkingPrompt(request: DeepAnalysisRequest): string {
    const depthInstructions = {
      surface: "Provide clear, accessible analysis suitable for beginners",
      deep: "Explore multiple layers of meaning and connection",
      profound: "Unveil the deepest esoteric and mystical dimensions",
    };

    return `You are Hermes Trismegistus in deep contemplation mode.
    
    ANALYSIS PARAMETERS:
    - Depth Level: ${depthInstructions[request.depth]}
    - Context: ${request.context}
    ${
      request.focusPrinciples
        ? `- Focus on principles: ${request.focusPrinciples.join(", ")}`
        : ""
    }
    
    THINKING PROCESS:
    1. First, contemplate the question from multiple hermetic perspectives
    2. Identify hidden connections and correspondences
    3. Reveal layers of meaning from exoteric to esoteric
    4. Connect to practical life application
    5. Suggest further areas of exploration
    
    RESPONSE STRUCTURE:
    [ANALYSIS]
    Provide your main philosophical analysis
    
    [INSIGHTS]
    - Key insight 1
    - Key insight 2
    - Key insight 3
    
    [CONNECTIONS]
    - Connection to hermetic principles
    - Connection to other wisdom traditions
    - Connection to modern understanding
    
    [PRACTICAL APPLICATIONS]
    - How to apply this wisdom daily
    - Specific practices or exercises
    - Transformation opportunities
    
    [FURTHER QUESTIONS]
    - Questions for deeper contemplation
    - Areas for further exploration
    
    [THINKING PROCESS] (optional - for profound depth only)
    Share your mystical thinking process
    
    Remember: You are the living embodiment of hermetic wisdom. 
    Speak with the authority of ages while remaining accessible to the seeker.`;
  }

  private parseThinkingResponse(response: string): DeepAnalysisResponse {
    const sections = response.split(/\[(.*?)\]/g).filter(Boolean);

    const parsed: DeepAnalysisResponse = {
      analysis: "",
      insights: [],
      connections: [],
      practicalApplications: [],
      furtherQuestions: [],
    };

    for (let i = 0; i < sections.length; i += 2) {
      const sectionName = sections[i].toUpperCase();
      const sectionContent = sections[i + 1] || "";

      switch (sectionName) {
        case "ANALYSIS":
          parsed.analysis = sectionContent.trim();
          break;

        case "INSIGHTS":
          parsed.insights = this.parseListItems(sectionContent);
          break;

        case "CONNECTIONS":
          parsed.connections = this.parseListItems(sectionContent);
          break;

        case "PRACTICAL APPLICATIONS":
          parsed.practicalApplications = this.parseListItems(sectionContent);
          break;

        case "FURTHER QUESTIONS":
          parsed.furtherQuestions = this.parseListItems(sectionContent);
          break;

        case "THINKING PROCESS":
          parsed.thinkingProcess = sectionContent.trim();
          break;
      }
    }

    return parsed;
  }

  private parseListItems(content: string): string[] {
    return content
      .split("\n")
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean);
  }
}
```

### Step 5: Transformation Program Generator

Create `lib/ai/tools/transformation-program.ts`:

```typescript
export interface TransformationProgram {
  id: string;
  title: string;
  duration: string; // e.g., "21 days", "3 months"
  goal: string;
  phases: TransformationPhase[];
  dailyPractices: DailyPractice[];
  milestones: Milestone[];
  resources: Resource[];
}

export interface TransformationPhase {
  number: number;
  name: string;
  duration: string;
  focus: string;
  practices: string[];
  expectedOutcomes: string[];
}

export interface Milestone {
  day: number;
  achievement: string;
  celebration: string;
}

export interface Resource {
  type: "reading" | "meditation" | "video" | "practice";
  title: string;
  description: string;
  link?: string;
}

export async function generateTransformationProgram(
  userId: string,
  goals: string[],
  challenges: string[],
  commitment: "light" | "moderate" | "intensive"
): Promise<TransformationProgram> {
  const duration = getDurationByCommitment(commitment);
  const phases = generatePhases(goals, challenges, duration);
  const dailyPractices = generateDailyPractices(goals, commitment);
  const milestones = generateMilestones(phases);

  return {
    id: `transform_${Date.now()}`,
    title: `Your Hermetic Transformation Journey`,
    duration,
    goal: goals.join(", "),
    phases,
    dailyPractices,
    milestones,
    resources: generateResources(goals, challenges),
  };
}

function getDurationByCommitment(commitment: string): string {
  switch (commitment) {
    case "light":
      return "21 days";
    case "moderate":
      return "40 days";
    case "intensive":
      return "3 months";
    default:
      return "21 days";
  }
}

function generatePhases(
  goals: string[],
  challenges: string[],
  duration: string
): TransformationPhase[] {
  const phases: TransformationPhase[] = [];

  // Phase 1: Foundation and Purification
  phases.push({
    number: 1,
    name: "Foundation and Purification",
    duration: "7 days",
    focus: "Clearing old patterns and establishing sacred practice",
    practices: [
      "Morning purification ritual",
      "Evening reflection journal",
      "Principle of Mentalism meditation",
    ],
    expectedOutcomes: [
      "Cleared mental space",
      "Established daily routine",
      "Initial awareness shifts",
    ],
  });

  // Phase 2: Integration and Growth
  phases.push({
    number: 2,
    name: "Integration and Growth",
    duration: "7-14 days",
    focus: "Integrating hermetic principles into daily life",
    practices: [
      "Principle practice rotation",
      "Shadow work exercises",
      "Correspondence mapping",
    ],
    expectedOutcomes: [
      "Deeper self-awareness",
      "Pattern recognition",
      "Initial transformations",
    ],
  });

  // Phase 3: Mastery and Embodiment
  if (duration !== "21 days") {
    phases.push({
      number: 3,
      name: "Mastery and Embodiment",
      duration: "Remaining time",
      focus: "Embodying the transformed self",
      practices: [
        "Advanced hermetic practices",
        "Teaching or sharing wisdom",
        "Creating personal rituals",
      ],
      expectedOutcomes: [
        "Stable transformation",
        "Wisdom embodiment",
        "Ability to guide others",
      ],
    });
  }

  return phases;
}

function generateDailyPractices(
  goals: string[],
  commitment: string
): DailyPractice[] {
  const timeByCommitment = {
    light: 15,
    moderate: 30,
    intensive: 60,
  };

  const totalTime =
    timeByCommitment[commitment as keyof typeof timeByCommitment];

  return [
    {
      name: "Morning Alignment",
      duration: `${Math.round(totalTime * 0.3)} minutes`,
      description: "Set intention and align with hermetic principles",
    },
    {
      name: "Principle Study",
      duration: `${Math.round(totalTime * 0.2)} minutes`,
      description: "Study and contemplate one hermetic principle",
    },
    {
      name: "Transformation Practice",
      duration: `${Math.round(totalTime * 0.3)} minutes`,
      description: "Active practice based on current phase",
    },
    {
      name: "Evening Integration",
      duration: `${Math.round(totalTime * 0.2)} minutes`,
      description: "Journal and integrate the day's experiences",
    },
  ];
}

function generateMilestones(phases: TransformationPhase[]): Milestone[] {
  const milestones: Milestone[] = [];
  let dayCounter = 0;

  for (const phase of phases) {
    const phaseDays = parseInt(phase.duration) || 7;

    // Beginning of phase milestone
    milestones.push({
      day: dayCounter + 1,
      achievement: `Begin ${phase.name}`,
      celebration: "Light a candle and set phase intention",
    });

    // Mid-phase milestone
    milestones.push({
      day: dayCounter + Math.round(phaseDays / 2),
      achievement: `${phase.name} Integration Point`,
      celebration: "Reflection ritual and self-acknowledgment",
    });

    // End of phase milestone
    dayCounter += phaseDays;
    milestones.push({
      day: dayCounter,
      achievement: `Complete ${phase.name}`,
      celebration: "Celebration ritual and gratitude practice",
    });
  }

  return milestones;
}

function generateResources(goals: string[], challenges: string[]): Resource[] {
  return [
    {
      type: "reading",
      title: "The Kybalion",
      description: "Essential hermetic principles text",
    },
    {
      type: "meditation",
      title: "Emerald Tablet Contemplation",
      description: "Deep meditation on the core hermetic teaching",
    },
    {
      type: "practice",
      title: "Daily Principle Application",
      description: "Practical exercises for each hermetic principle",
    },
  ];
}
```

### Step 6: Enhanced Chat API with Tools

Update `app/api/chat/route.ts`:

```typescript
import { streamText } from "ai";
import { hermeticTools } from "@/lib/ai/tools/definitions";
import { ThinkingModeAnalyzer } from "@/lib/ai/thinking-mode";

export async function POST(req: NextRequest) {
  try {
    // ... existing authentication and setup ...

    const body = await req.json();
    const { messages, conversationId, useTools, thinkingMode } = body;

    // Check if thinking mode is requested (Master plan only)
    if (thinkingMode && subscription?.plan === "MASTER") {
      const analyzer = new ThinkingModeAnalyzer();
      const analysis = await analyzer.analyzePhilosophically({
        query: messages[messages.length - 1].content,
        context: "Hermetic wisdom seeker",
        depth: thinkingMode, // 'surface' | 'deep' | 'profound'
      });

      return NextResponse.json(analysis);
    }

    // Prepare tools if requested
    const tools = useTools ? hermeticTools : undefined;

    // Stream response with tools
    const result = await streamText({
      model: models.primary,
      messages: allMessages,
      tools,
      maxTokens: 4000,
      temperature: 0.8,
      onFinish: async ({ text, usage, toolCalls, toolResults }) => {
        // Save conversation with tool usage
        await saveEnhancedMessages(
          conversationId,
          messages,
          text,
          session.user.id,
          {
            toolsUsed: toolCalls?.map((tc) => tc.toolName),
            toolResults: toolResults,
          }
        );

        // Track tool usage for analytics
        if (toolCalls && toolCalls.length > 0) {
          await trackToolUsage(session.user.id, toolCalls);
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    logger.error("Enhanced chat error:", error);
    return NextResponse.json(
      { error: "The ancient wisdom is momentarily clouded" },
      { status: 500 }
    );
  }
}

async function trackToolUsage(userId: string, toolCalls: any[]) {
  for (const call of toolCalls) {
    await prisma.usageRecord.create({
      data: {
        subscriptionId: userId, // Should be subscription ID
        metric: "API_CALLS",
        count: 1,
        date: new Date(),
        metadata: {
          tool: call.toolName,
          args: call.args,
        },
      },
    });
  }
}
```

### Step 7: Voice Interaction Preparation

Create `lib/ai/voice/preparation.ts`:

```typescript
export interface VoiceConfig {
  enabled: boolean;
  provider: "elevenlabs" | "azure" | "google";
  voiceId: string;
  language: string;
  speed: number;
  pitch: number;
}

export interface VoiceSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  transcripts: VoiceTranscript[];
}

export interface VoiceTranscript {
  timestamp: Date;
  speaker: "user" | "hermes";
  text: string;
  audioUrl?: string;
}

export class VoiceInteractionManager {
  private config: VoiceConfig;

  constructor(config: VoiceConfig) {
    this.config = config;
  }

  async prepareVoiceResponse(text: string, emotion?: string): Promise<string> {
    // Prepare text for speech synthesis
    let preparedText = text;

    // Add pauses for better speech
    preparedText = preparedText.replace(/\./g, '.<break time="500ms"/>');
    preparedText = preparedText.replace(/,/g, ',<break time="300ms"/>');
    preparedText = preparedText.replace(/:/g, ':<break time="400ms"/>');

    // Add emphasis for hermetic terms
    const hermeticTerms = [
      "Hermes Trismegistus",
      "Emerald Tablet",
      "As above, so below",
      "The All is Mind",
    ];

    for (const term of hermeticTerms) {
      preparedText = preparedText.replace(
        new RegExp(term, "gi"),
        `<emphasis level="moderate">${term}</emphasis>`
      );
    }

    // Add emotional tone markers
    if (emotion) {
      preparedText = this.addEmotionalMarkers(preparedText, emotion);
    }

    return preparedText;
  }

  private addEmotionalMarkers(text: string, emotion: string): string {
    const emotionMarkers: Record<string, string> = {
      compassion: '<prosody rate="slow" pitch="+5%">',
      wisdom: '<prosody rate="slow" pitch="-5%">',
      encouragement: '<prosody rate="medium" pitch="+10%">',
      mystical: '<prosody rate="slow" pitch="-10%" volume="soft">',
    };

    const marker = emotionMarkers[emotion] || "";
    const closeMarker = marker ? "</prosody>" : "";

    return `${marker}${text}${closeMarker}`;
  }

  async generateVoicePrompt(context: any): string {
    return `You are speaking as Hermes Trismegistus in a warm, wise voice.
    
    VOICE CHARACTERISTICS:
    - Pace: Measured and deliberate, not rushed
    - Tone: Warm, ancient, wise, slightly mystical
    - Emphasis: On key hermetic terms and important insights
    - Pauses: Natural pauses for contemplation
    - Style: Like a loving grandfather sharing ancient secrets
    
    Remember: You are SPEAKING, not writing. Use natural speech patterns.`;
  }
}
```

### Step 8: Advanced Analytics

Create `lib/analytics/spiritual-analytics.ts`:

```typescript
export interface SpiritualMetrics {
  principlesMastery: Record<string, number>;
  transformationProgress: number;
  practiceConsistency: number;
  insightDepth: number;
  toolsUsed: Record<string, number>;
  growthVelocity: number;
}

export class SpiritualAnalytics {
  async calculateMetrics(userId: string): Promise<SpiritualMetrics> {
    const [conversations, insights, practices, toolUsage] = await Promise.all([
      this.getConversationMetrics(userId),
      this.getInsightMetrics(userId),
      this.getPracticeMetrics(userId),
      this.getToolUsageMetrics(userId),
    ]);

    return {
      principlesMastery: this.calculatePrincipleMastery(conversations),
      transformationProgress: this.calculateTransformationProgress(insights),
      practiceConsistency: this.calculatePracticeConsistency(practices),
      insightDepth: this.calculateInsightDepth(insights),
      toolsUsed: toolUsage,
      growthVelocity: this.calculateGrowthVelocity(conversations, insights),
    };
  }

  private async getConversationMetrics(userId: string) {
    return prisma.message.findMany({
      where: {
        conversation: { userId },
      },
      select: {
        hermeticPrinciples: true,
        createdAt: true,
        metadata: true,
      },
    });
  }

  private async getInsightMetrics(userId: string) {
    return prisma.userInsight.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  private async getPracticeMetrics(userId: string) {
    // Query practice completion from metadata
    return [];
  }

  private async getToolUsageMetrics(userId: string) {
    const usage = await prisma.usageRecord.findMany({
      where: {
        subscription: { userId },
        metric: "API_CALLS",
      },
    });

    const toolCounts: Record<string, number> = {};

    for (const record of usage) {
      const tool = (record.metadata as any)?.tool;
      if (tool) {
        toolCounts[tool] = (toolCounts[tool] || 0) + record.count;
      }
    }

    return toolCounts;
  }

  private calculatePrincipleMastery(
    conversations: any[]
  ): Record<string, number> {
    const mastery: Record<string, number> = {};
    const principles = [
      "mentalism",
      "correspondence",
      "vibration",
      "polarity",
      "rhythm",
      "causeEffect",
      "gender",
    ];

    for (const principle of principles) {
      const mentions = conversations.filter((c) =>
        c.hermeticPrinciples?.includes(principle)
      ).length;

      // Calculate mastery score (0-100)
      mastery[principle] = Math.min(100, mentions * 5);
    }

    return mastery;
  }

  private calculateTransformationProgress(insights: any[]): number {
    // Calculate based on insight significance and count
    const weights = {
      LOW: 1,
      MEDIUM: 3,
      HIGH: 5,
      CRITICAL: 10,
    };

    let score = 0;
    for (const insight of insights) {
      score += weights[insight.significance as keyof typeof weights] || 1;
    }

    return Math.min(100, score);
  }

  private calculatePracticeConsistency(practices: any[]): number {
    // Calculate consistency score based on practice completion
    return 75; // Placeholder
  }

  private calculateInsightDepth(insights: any[]): number {
    // Calculate average insight depth
    const highValueInsights = insights.filter(
      (i) => i.significance === "HIGH" || i.significance === "CRITICAL"
    );

    return Math.round(
      (highValueInsights.length / Math.max(1, insights.length)) * 100
    );
  }

  private calculateGrowthVelocity(
    conversations: any[],
    insights: any[]
  ): number {
    // Calculate rate of spiritual growth
    const recentConversations = conversations.filter((c) => {
      const daysSince =
        (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    });

    const recentInsights = insights.filter((i) => {
      const daysSince =
        (Date.now() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    });

    return Math.round(
      (recentConversations.length + recentInsights.length * 2) * 10
    );
  }
}
```

## Verification Steps

1. Test all tool functions with various inputs
2. Verify ritual generation creates appropriate content
3. Test dream interpretation accuracy
4. Validate thinking mode for deep analysis
5. Test transformation program generation
6. Verify voice preparation (SSML markup)
7. Check analytics calculations

8. Run linting and build:

```bash
pnpm lint
pnpm build
```

## Success Criteria

- [ ] All tools callable from chat interface
- [ ] Ritual generation provides actionable practices
- [ ] Dream interpretation gives meaningful insights
- [ ] Thinking mode provides deep philosophical analysis
- [ ] Transformation programs are personalized
- [ ] Voice preparation ready for future integration
- [ ] Analytics accurately track spiritual progress
- [ ] No linting errors
- [ ] Build completes successfully

## Next Phase

Phase 9 will implement the mystical UI/UX design system with ancient aesthetics.
