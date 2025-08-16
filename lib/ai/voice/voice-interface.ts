export interface VoiceConfig {
  provider: "openai" | "elevenlabs" | "azure" | "google";
  voice: string;
  speed: number;
  pitch?: number;
  stability?: number;
  clarity?: number;
  language: string;
  outputFormat: "mp3" | "wav" | "ogg" | "aac";
}

export interface VoiceRequest {
  text: string;
  config: VoiceConfig;
  userId: string;
  conversationId?: string;
  emotionalContext?: EmotionalVoiceContext;
}

export interface EmotionalVoiceContext {
  mood: "calm" | "energetic" | "mystical" | "compassionate" | "serious" | "playful";
  intensity: number; // 0.0 to 1.0
  spiritualTone: "ancient" | "modern" | "ceremonial" | "conversational" | "profound";
  breathingPauses: boolean;
  accentuation: string[]; // words to emphasize
}

export interface VoiceResponse {
  audioUrl: string;
  audioBuffer?: ArrayBuffer;
  duration: number;
  format: string;
  metadata: VoiceMetadata;
}

export interface VoiceMetadata {
  provider: string;
  voice: string;
  language: string;
  characterCount: number;
  processingTime: number;
  emotionalAdjustments: EmotionalAdjustment[];
  hermeticEnhancements: HermeticVoiceEnhancement[];
}

export interface EmotionalAdjustment {
  type: "speed" | "pitch" | "pause" | "emphasis" | "tone";
  location: number; // character position
  value: number;
  reason: string;
}

export interface HermeticVoiceEnhancement {
  type: "sacred_pause" | "mystical_tone" | "ancient_pronunciation" | "ceremonial_cadence";
  startPosition: number;
  endPosition: number;
  parameters: Record<string, unknown>;
  description: string;
}

export interface VoicePersona {
  id: string;
  name: string;
  description: string;
  baseVoice: string;
  provider: string;
  characteristics: VoiceCharacteristics;
  hermeticAlignment: HermeticAlignment;
  culturalAdaptations: Record<string, CulturalVoiceAdaptation>;
}

export interface VoiceCharacteristics {
  age: "young" | "middle" | "elder" | "timeless";
  gender: "masculine" | "feminine" | "neutral" | "divine";
  authority: number; // 0.0 to 1.0
  warmth: number; // 0.0 to 1.0
  wisdom: number; // 0.0 to 1.0
  mysticism: number; // 0.0 to 1.0
  clarity: number; // 0.0 to 1.0
  resonance: "deep" | "medium" | "light" | "ethereal";
}

export interface HermeticAlignment {
  principles: ("mentalism" | "correspondence" | "vibration" | "polarity" | "rhythm" | "causeEffect" | "gender")[];
  sacredTones: SacredTone[];
  breathingPattern: BreathingPattern;
  energeticSignature: string;
}

export interface SacredTone {
  frequency: number;
  harmonics: number[];
  duration: number;
  purpose: string;
}

export interface BreathingPattern {
  inhaleRatio: number;
  holdRatio: number;
  exhaleRatio: number;
  pauseRatio: number;
  cycleCount: number;
}

export interface CulturalVoiceAdaptation {
  language: string;
  accent: string;
  cadence: string;
  pronunciationGuide: Record<string, string>;
  culturalPhrases: string[];
  respectForms: string[];
}

// Voice generation service interface
export abstract class VoiceService {
  abstract generateSpeech(request: VoiceRequest): Promise<VoiceResponse>;
  abstract getAvailableVoices(provider: string, language?: string): Promise<VoiceInfo[]>;
  abstract validateConfig(config: VoiceConfig): Promise<ValidationResult>;
  abstract estimateCost(text: string, config: VoiceConfig): Promise<CostEstimate>;
}

export interface VoiceInfo {
  id: string;
  name: string;
  provider: string;
  language: string;
  gender: string;
  description: string;
  sampleUrl?: string;
  characteristics: VoiceCharacteristics;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface CostEstimate {
  characterCount: number;
  estimatedCost: number;
  currency: string;
  provider: string;
  tier: string;
}

// Hermetic voice enhancement functions
export class HermeticVoiceProcessor {
  static enhanceTextForVoice(
    text: string,
    spiritualLevel: string,
    principle: string,
    emotionalContext: EmotionalVoiceContext
  ): EnhancedVoiceText {
    const enhancements: TextEnhancement[] = [];
    let enhancedText = text;

    // Add sacred pauses for reflection
    enhancedText = this.addSacredPauses(enhancedText, spiritualLevel);
    enhancements.push({
      type: "sacred_pauses",
      description: "Added contemplative pauses for deeper reflection"
    });

    // Adjust pronunciation for ancient terms
    enhancedText = this.enhanceAncientPronunciation(enhancedText);
    enhancements.push({
      type: "ancient_pronunciation",
      description: "Enhanced pronunciation of hermetic terms"
    });

    // Add breathing cues if requested
    if (emotionalContext.breathingPauses) {
      enhancedText = this.addBreathingCues(enhancedText);
      enhancements.push({
        type: "breathing_cues",
        description: "Added natural breathing pauses"
      });
    }

    // Enhance mystical terminology
    enhancedText = this.enhanceMysticalTerminology(enhancedText, principle);
    enhancements.push({
      type: "mystical_enhancement",
      description: "Enhanced mystical and hermetic terminology"
    });

    return {
      originalText: text,
      enhancedText,
      enhancements,
      metadata: {
        spiritualLevel,
        principle,
        emotionalContext,
        processingTime: Date.now()
      }
    };
  }

  private static addSacredPauses(text: string, spiritualLevel: string): string {
    const pauseMarkers = {
      "SEEKER": "<break time=\"0.5s\"/>",
      "STUDENT": "<break time=\"0.7s\"/>",
      "ADEPT": "<break time=\"1.0s\"/>",
      "MASTER": "<break time=\"1.2s\"/>"
    };

    const pauseMarker = pauseMarkers[spiritualLevel as keyof typeof pauseMarkers] || pauseMarkers.SEEKER;

    // Add pauses after important concepts
    const importantConcepts = [
      /\b(hermetic|principle|wisdom|transformation|consciousness|divine|sacred|ancient)\b/gi,
      /[.!?]/g
    ];

    let enhanced = text;
    importantConcepts.forEach(pattern => {
      enhanced = enhanced.replace(pattern, match => `${match}${pauseMarker}`);
    });

    return enhanced;
  }

  private static enhanceAncientPronunciation(text: string): string {
    const pronunciationMap = {
      "Hermes": "<phoneme alphabet=\"ipa\" ph=\"ˈhɜːrmiːz\">Hermes</phoneme>",
      "Trismegistus": "<phoneme alphabet=\"ipa\" ph=\"trɪsməˈdʒɪstəs\">Trismegistus</phoneme>",
      "Thoth": "<phoneme alphabet=\"ipa\" ph=\"θoʊθ\">Thoth</phoneme>",
      "Kybalion": "<phoneme alphabet=\"ipa\" ph=\"kaɪˈbæliən\">Kybalion</phoneme>",
      "chakra": "<phoneme alphabet=\"ipa\" ph=\"ˈtʃʌkrə\">chakra</phoneme>",
      "mandala": "<phoneme alphabet=\"ipa\" ph=\"ˈmʌndələ\">mandala</phoneme>"
    };

    let enhanced = text;
    Object.entries(pronunciationMap).forEach(([term, pronunciation]) => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      enhanced = enhanced.replace(regex, pronunciation);
    });

    return enhanced;
  }

  private static addBreathingCues(text: string): string {
    // Add natural breathing pauses at sentence boundaries and before important concepts
    return text
      .replace(/\. /g, '. <break time="0.8s"/>')
      .replace(/\, /g, ', <break time="0.3s"/>')
      .replace(/\; /g, '; <break time="0.5s"/>');
  }

  private static enhanceMysticalTerminology(text: string, principle: string): string {
    const mysticalEnhancements = {
      mentalism: {
        "mind": "<emphasis level=\"moderate\">mind</emphasis>",
        "thought": "<emphasis level=\"moderate\">thought</emphasis>",
        "consciousness": "<emphasis level=\"strong\">consciousness</emphasis>"
      },
      correspondence: {
        "above": "<emphasis level=\"moderate\">above</emphasis>",
        "below": "<emphasis level=\"moderate\">below</emphasis>",
        "pattern": "<emphasis level=\"moderate\">pattern</emphasis>"
      },
      vibration: {
        "frequency": "<emphasis level=\"moderate\">frequency</emphasis>",
        "energy": "<emphasis level=\"strong\">energy</emphasis>",
        "vibration": "<emphasis level=\"strong\">vibration</emphasis>"
      },
      polarity: {
        "balance": "<emphasis level=\"strong\">balance</emphasis>",
        "opposite": "<emphasis level=\"moderate\">opposite</emphasis>",
        "harmony": "<emphasis level=\"moderate\">harmony</emphasis>"
      },
      rhythm: {
        "flow": "<emphasis level=\"moderate\">flow</emphasis>",
        "cycle": "<emphasis level=\"moderate\">cycle</emphasis>",
        "rhythm": "<emphasis level=\"strong\">rhythm</emphasis>"
      },
      causeEffect: {
        "cause": "<emphasis level=\"moderate\">cause</emphasis>",
        "effect": "<emphasis level=\"moderate\">effect</emphasis>",
        "manifestation": "<emphasis level=\"strong\">manifestation</emphasis>"
      },
      gender: {
        "masculine": "<emphasis level=\"moderate\">masculine</emphasis>",
        "feminine": "<emphasis level=\"moderate\">feminine</emphasis>",
        "unity": "<emphasis level=\"strong\">unity</emphasis>"
      }
    };

    const enhancements = mysticalEnhancements[principle as keyof typeof mysticalEnhancements] || {};
    let enhanced = text;

    Object.entries(enhancements).forEach(([term, enhancement]) => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      enhanced = enhanced.replace(regex, enhancement);
    });

    return enhanced;
  }
}

export interface EnhancedVoiceText {
  originalText: string;
  enhancedText: string;
  enhancements: TextEnhancement[];
  metadata: {
    spiritualLevel: string;
    principle: string;
    emotionalContext: EmotionalVoiceContext;
    processingTime: number;
  };
}

export interface TextEnhancement {
  type: "sacred_pauses" | "ancient_pronunciation" | "breathing_cues" | "mystical_enhancement";
  description: string;
}

// Voice personas for different spiritual contexts
export const HERMETIC_VOICE_PERSONAS: Record<string, VoicePersona> = {
  "ancient_sage": {
    id: "ancient_sage",
    name: "Ancient Sage",
    description: "Deep, wise voice embodying ancient hermetic wisdom",
    baseVoice: "alloy", // OpenAI voice
    provider: "openai",
    characteristics: {
      age: "elder",
      gender: "neutral",
      authority: 0.9,
      warmth: 0.7,
      wisdom: 1.0,
      mysticism: 0.9,
      clarity: 0.8,
      resonance: "deep"
    },
    hermeticAlignment: {
      principles: ["mentalism", "correspondence", "vibration"],
      sacredTones: [{
        frequency: 432,
        harmonics: [864, 1296],
        duration: 1000,
        purpose: "Grounding and wisdom"
      }],
      breathingPattern: {
        inhaleRatio: 4,
        holdRatio: 7,
        exhaleRatio: 8,
        pauseRatio: 2,
        cycleCount: 3
      },
      energeticSignature: "grounding_wisdom"
    },
    culturalAdaptations: {
      "en": {
        language: "en-US",
        accent: "neutral_american",
        cadence: "measured_wisdom",
        pronunciationGuide: {},
        culturalPhrases: ["Indeed", "Consider this", "As above, so below"],
        respectForms: ["Seeker", "Student of wisdom"]
      }
    }
  },
  "mystical_guide": {
    id: "mystical_guide",
    name: "Mystical Guide",
    description: "Ethereal, guiding voice for spiritual exploration",
    baseVoice: "nova", // OpenAI voice
    provider: "openai",
    characteristics: {
      age: "timeless",
      gender: "feminine",
      authority: 0.7,
      warmth: 0.9,
      wisdom: 0.8,
      mysticism: 1.0,
      clarity: 0.9,
      resonance: "ethereal"
    },
    hermeticAlignment: {
      principles: ["vibration", "rhythm", "gender"],
      sacredTones: [{
        frequency: 528,
        harmonics: [1056, 1584],
        duration: 1200,
        purpose: "Transformation and love"
      }],
      breathingPattern: {
        inhaleRatio: 3,
        holdRatio: 3,
        exhaleRatio: 6,
        pauseRatio: 1,
        cycleCount: 4
      },
      energeticSignature: "compassionate_guidance"
    },
    culturalAdaptations: {
      "en": {
        language: "en-US",
        accent: "soft_neutral",
        cadence: "flowing_guidance",
        pronunciationGuide: {},
        culturalPhrases: ["Let us explore", "Feel into this", "Trust the process"],
        respectForms: ["Dear soul", "Beloved seeker"]
      }
    }
  },
  "scholarly_hermit": {
    id: "scholarly_hermit",
    name: "Scholarly Hermit",
    description: "Clear, precise voice for detailed explanations",
    baseVoice: "echo", // OpenAI voice
    provider: "openai",
    characteristics: {
      age: "middle",
      gender: "masculine",
      authority: 0.8,
      warmth: 0.6,
      wisdom: 0.9,
      mysticism: 0.6,
      clarity: 1.0,
      resonance: "medium"
    },
    hermeticAlignment: {
      principles: ["mentalism", "correspondence", "causeEffect"],
      sacredTones: [{
        frequency: 396,
        harmonics: [792, 1188],
        duration: 800,
        purpose: "Mental clarity and liberation"
      }],
      breathingPattern: {
        inhaleRatio: 4,
        holdRatio: 4,
        exhaleRatio: 4,
        pauseRatio: 4,
        cycleCount: 2
      },
      energeticSignature: "intellectual_precision"
    },
    culturalAdaptations: {
      "en": {
        language: "en-US",
        accent: "educated_neutral",
        cadence: "precise_explanation",
        pronunciationGuide: {},
        culturalPhrases: ["Observe that", "Note carefully", "This reveals"],
        respectForms: ["Student", "Fellow scholar"]
      }
    }
  }
};