import { VoiceConfig, VoicePersona, EmotionalVoiceContext } from "./voice-interface";

export interface UserVoicePreferences {
  userId: string;
  defaultProvider: "openai" | "elevenlabs" | "azure" | "google";
  preferredVoice: string;
  defaultSpeed: number;
  preferredPersona?: string;
  emotionalPreferences: EmotionalPreferences;
  accessibilitySettings: AccessibilitySettings;
  languageSettings: LanguageVoiceSettings;
  qualityPreferences: QualityPreferences;
  spiritualSettings: SpiritualVoiceSettings;
}

export interface EmotionalPreferences {
  defaultMood: "calm" | "energetic" | "mystical" | "compassionate" | "serious" | "playful";
  intensityPreference: number; // 0.0 to 1.0
  preferredTone: "ancient" | "modern" | "ceremonial" | "conversational" | "profound";
  enableBreathingPauses: boolean;
  emotionalAdaptation: boolean; // Auto-adjust based on content
}

export interface AccessibilitySettings {
  dyslexiaSupport: boolean;
  hearingImpaired: boolean;
  preferredSpeed: number;
  enhancedClarity: boolean;
  pauseBetweenSentences: number; // seconds
  emphasizeKeyTerms: boolean;
}

export interface LanguageVoiceSettings {
  primaryLanguage: string;
  accentPreference: string;
  pronunciationStyle: "native" | "international" | "academic";
  culturalAdaptation: boolean;
}

export interface QualityPreferences {
  preferHighQuality: boolean;
  acceptLongerProcessing: boolean;
  audioFormat: "mp3" | "wav" | "ogg" | "aac";
  compressionLevel: "high" | "medium" | "low";
}

export interface SpiritualVoiceSettings {
  enableHermeticEnhancements: boolean;
  principleAlignment: string[];
  sacredPauseIntensity: number;
  mysticalPronunciation: boolean;
  ceremorialMode: boolean;
  ancientWisdomTone: boolean;
}

export class VoiceConfigurationManager {
  static createDefaultConfig(language: string = "en"): VoiceConfig {
    return {
      provider: "openai",
      voice: "alloy",
      speed: 1.0,
      language,
      outputFormat: "mp3"
    };
  }

  static createConfigFromPreferences(
    preferences: UserVoicePreferences,
    overrides?: Partial<VoiceConfig>
  ): VoiceConfig {
    const baseConfig: VoiceConfig = {
      provider: preferences.defaultProvider,
      voice: preferences.preferredVoice,
      speed: preferences.defaultSpeed,
      language: preferences.languageSettings.primaryLanguage,
      outputFormat: preferences.qualityPreferences.audioFormat,
      ...overrides
    };

    // Apply quality preferences
    if (preferences.qualityPreferences.preferHighQuality) {
      // Use higher quality settings where available
      if (baseConfig.provider === "openai") {
        // OpenAI TTS-1-HD is used by default in the service
      }
    }

    // Apply accessibility settings
    if (preferences.accessibilitySettings.dyslexiaSupport) {
      baseConfig.speed = Math.min(baseConfig.speed, 1.2);
    }

    if (preferences.accessibilitySettings.hearingImpaired) {
      baseConfig.speed = Math.max(baseConfig.speed * 0.8, 0.6);
    }

    return baseConfig;
  }

  static createEmotionalContextFromPreferences(
    preferences: UserVoicePreferences,
    contentContext?: ContentContext,
    overrides?: Partial<EmotionalVoiceContext>
  ): EmotionalVoiceContext {
    const baseContext: EmotionalVoiceContext = {
      mood: preferences.emotionalPreferences.defaultMood,
      intensity: preferences.emotionalPreferences.intensityPreference,
      spiritualTone: preferences.emotionalPreferences.preferredTone,
      breathingPauses: preferences.emotionalPreferences.enableBreathingPauses,
      accentuation: [],
      ...overrides
    };

    // Apply spiritual settings
    if (preferences.spiritualSettings.enableHermeticEnhancements) {
      baseContext.breathingPauses = true;
      baseContext.spiritualTone = preferences.spiritualSettings.ceremorialMode ? "ceremonial" : baseContext.spiritualTone;
    }

    // Adapt based on content context
    if (contentContext && preferences.emotionalPreferences.emotionalAdaptation) {
      baseContext.mood = this.adaptMoodToContent(baseContext.mood, contentContext);
      baseContext.intensity = this.adaptIntensityToContent(baseContext.intensity, contentContext);
      baseContext.accentuation = this.extractKeyTermsForAccentuation(contentContext);
    }

    return baseContext;
  }

  static optimizeConfigForSpiritualLevel(
    config: VoiceConfig,
    spiritualLevel: "SEEKER" | "STUDENT" | "ADEPT" | "MASTER",
    principle?: string
  ): VoiceConfig {
    const optimized = { ...config };

    // Adjust speed based on spiritual level
    const speedAdjustments = {
      "SEEKER": 1.0,     // Normal speed for accessibility
      "STUDENT": 0.95,   // Slightly slower for contemplation
      "ADEPT": 0.9,      // More deliberate pacing
      "MASTER": 0.85     // Profound, measured delivery
    };

    optimized.speed *= speedAdjustments[spiritualLevel];

    // Voice selection based on spiritual level
    if (config.provider === "openai") {
      const levelVoiceMap = {
        "SEEKER": ["alloy", "nova"],      // Accessible, welcoming
        "STUDENT": ["echo", "shimmer"],   // Clear, supportive
        "ADEPT": ["fable", "onyx"],       // Rich, authoritative
        "MASTER": ["onyx", "fable"]       // Deep, profound
      };

      const recommendedVoices = levelVoiceMap[spiritualLevel];
      if (recommendedVoices.includes(config.voice)) {
        // Voice is already optimal
      } else {
        // Suggest better voice for level
        optimized.voice = recommendedVoices[0];
      }
    }

    return optimized;
  }

  static adaptConfigForPrinciple(
    config: VoiceConfig,
    principle: string,
    emotionalContext: EmotionalVoiceContext
  ): { config: VoiceConfig; emotionalContext: EmotionalVoiceContext } {
    const adaptedConfig = { ...config };
    const adaptedEmotional = { ...emotionalContext };

    const principleAdaptations = {
      mentalism: {
        voice: "echo",    // Clear, precise
        speed: 1.0,       // Normal for clarity
        mood: "serious" as const,
        tone: "conversational" as const
      },
      correspondence: {
        voice: "alloy",   // Balanced
        speed: 0.95,      // Slightly measured
        mood: "mystical" as const,
        tone: "profound" as const
      },
      vibration: {
        voice: "nova",    // Ethereal
        speed: 1.1,       // Energetic
        mood: "energetic" as const,
        tone: "ceremonial" as const
      },
      polarity: {
        voice: "onyx",    // Deep, contrasts
        speed: 0.9,       // Deliberate
        mood: "serious" as const,
        tone: "profound" as const
      },
      rhythm: {
        voice: "shimmer", // Flowing
        speed: 1.0,       // Natural rhythm
        mood: "calm" as const,
        tone: "modern" as const
      },
      causeEffect: {
        voice: "fable",   // Storytelling
        speed: 0.95,      // Measured
        mood: "serious" as const,
        tone: "ancient" as const
      },
      gender: {
        voice: "nova",    // Balanced gender expression
        speed: 1.0,       // Harmonious
        mood: "compassionate" as const,
        tone: "ceremonial" as const
      }
    };

    const adaptation = principleAdaptations[principle as keyof typeof principleAdaptations];
    if (adaptation) {
      adaptedConfig.voice = adaptation.voice;
      adaptedConfig.speed *= adaptation.speed;
      adaptedEmotional.mood = adaptation.mood;
      adaptedEmotional.spiritualTone = adaptation.tone;
    }

    return { config: adaptedConfig, emotionalContext: adaptedEmotional };
  }

  private static adaptMoodToContent(defaultMood: string, context: ContentContext): "calm" | "energetic" | "mystical" | "compassionate" | "serious" | "playful" {
    // Analyze content type and emotional weight
    if (context.type === "ritual" || context.type === "ceremony") {
      return "mystical";
    }
    if (context.type === "healing" || context.type === "comfort") {
      return "compassionate";
    }
    if (context.type === "teaching" || context.type === "explanation") {
      return "serious";
    }
    if (context.type === "meditation" || context.type === "reflection") {
      return "calm";
    }

    // Analyze emotional keywords
    const energeticKeywords = ["energy", "power", "dynamic", "action", "transformation"];
    const mysticalKeywords = ["sacred", "divine", "ancient", "mystery", "wisdom"];
    const compassionateKeywords = ["healing", "comfort", "support", "love", "kindness"];

    const content = context.text.toLowerCase();
    
    if (energeticKeywords.some(word => content.includes(word))) {
      return "energetic";
    }
    if (mysticalKeywords.some(word => content.includes(word))) {
      return "mystical";
    }
    if (compassionateKeywords.some(word => content.includes(word))) {
      return "compassionate";
    }

    return defaultMood as "calm" | "energetic" | "mystical" | "compassionate" | "serious" | "playful";
  }

  private static adaptIntensityToContent(defaultIntensity: number, context: ContentContext): number {
    // Adjust intensity based on content analysis
    const intensityModifiers = {
      ritual: 0.8,        // High intensity for sacred work
      healing: 0.6,       // Gentle intensity
      teaching: 0.5,      // Moderate intensity
      meditation: 0.3,    // Low intensity
      emergency: 0.9,     // High intensity
      celebration: 0.7    // Celebratory intensity
    };

    const modifier = intensityModifiers[context.type as keyof typeof intensityModifiers] || 1.0;
    return Math.max(0.1, Math.min(1.0, defaultIntensity * modifier));
  }

  private static extractKeyTermsForAccentuation(context: ContentContext): string[] {
    // Extract important terms that should be emphasized
    const hermeticTerms = [
      "hermetic", "principle", "wisdom", "consciousness", "transformation",
      "divine", "sacred", "ancient", "truth", "knowledge", "power",
      "balance", "harmony", "unity", "correspondence", "vibration",
      "polarity", "rhythm", "cause", "effect", "gender", "mentalism"
    ];

    const foundTerms = hermeticTerms.filter(term => 
      context.text.toLowerCase().includes(term.toLowerCase())
    );

    // Also extract emphasized words from context
    const emphasizedWords = context.emphasizedTerms || [];

    // Combine and deduplicate
    return Array.from(new Set([...foundTerms, ...emphasizedWords]));
  }

  static validatePreferences(preferences: UserVoicePreferences): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate provider
    const supportedProviders = ["openai"];
    if (!supportedProviders.includes(preferences.defaultProvider)) {
      errors.push(`Unsupported provider: ${preferences.defaultProvider}`);
    }

    // Validate speed range
    if (preferences.defaultSpeed < 0.25 || preferences.defaultSpeed > 4.0) {
      errors.push("Speed must be between 0.25 and 4.0");
    }

    // Validate intensity
    if (preferences.emotionalPreferences.intensityPreference < 0 || 
        preferences.emotionalPreferences.intensityPreference > 1) {
      errors.push("Intensity must be between 0.0 and 1.0");
    }

    // Warnings for potentially problematic settings
    if (preferences.defaultSpeed > 2.0) {
      warnings.push("High speed may affect comprehension of spiritual content");
    }

    if (preferences.defaultSpeed < 0.5) {
      warnings.push("Very slow speed may affect engagement");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      recommendations: []
    };
  }
}

export interface ContentContext {
  text: string;
  type: "ritual" | "healing" | "teaching" | "meditation" | "ceremony" | "explanation" | "reflection" | "emergency" | "celebration" | "comfort";
  emotionalWeight: number;
  spiritualLevel: string;
  principlesInvolved: string[];
  emphasizedTerms?: string[];
  culturalContext?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

// Default voice preferences for different user types
export const DEFAULT_VOICE_PREFERENCES: Record<string, Partial<UserVoicePreferences>> = {
  seeker: {
    defaultProvider: "openai",
    preferredVoice: "alloy",
    defaultSpeed: 1.0,
    preferredPersona: "mystical_guide",
    emotionalPreferences: {
      defaultMood: "calm",
      intensityPreference: 0.5,
      preferredTone: "modern",
      enableBreathingPauses: true,
      emotionalAdaptation: true
    },
    spiritualSettings: {
      enableHermeticEnhancements: true,
      principleAlignment: [],
      sacredPauseIntensity: 0.5,
      mysticalPronunciation: false,
      ceremorialMode: false,
      ancientWisdomTone: false
    }
  },
  adept: {
    defaultProvider: "openai",
    preferredVoice: "onyx",
    defaultSpeed: 0.9,
    preferredPersona: "ancient_sage",
    emotionalPreferences: {
      defaultMood: "mystical",
      intensityPreference: 0.7,
      preferredTone: "ceremonial",
      enableBreathingPauses: true,
      emotionalAdaptation: true
    },
    spiritualSettings: {
      enableHermeticEnhancements: true,
      principleAlignment: ["mentalism", "correspondence", "vibration"],
      sacredPauseIntensity: 0.8,
      mysticalPronunciation: true,
      ceremorialMode: true,
      ancientWisdomTone: true
    }
  },
  scholar: {
    defaultProvider: "openai",
    preferredVoice: "echo",
    defaultSpeed: 1.1,
    preferredPersona: "scholarly_hermit",
    emotionalPreferences: {
      defaultMood: "serious",
      intensityPreference: 0.4,
      preferredTone: "conversational",
      enableBreathingPauses: false,
      emotionalAdaptation: false
    },
    spiritualSettings: {
      enableHermeticEnhancements: false,
      principleAlignment: [],
      sacredPauseIntensity: 0.2,
      mysticalPronunciation: false,
      ceremorialMode: false,
      ancientWisdomTone: false
    }
  }
};