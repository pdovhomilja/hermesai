import OpenAI from "openai";
import { 
  VoiceService, 
  VoiceRequest, 
  VoiceResponse, 
  VoiceConfig, 
  VoiceInfo, 
  ValidationResult, 
  CostEstimate,
  HermeticVoiceProcessor,
  HERMETIC_VOICE_PERSONAS,
  EmotionalVoiceContext,
  EmotionalAdjustment,
  HermeticVoiceEnhancement
} from "./voice-interface";
import logger from "@/lib/logger";

export class OpenAIVoiceService extends VoiceService {
  private client: OpenAI;
  private readonly maxCharacters = 4096; // OpenAI TTS limit
  private readonly supportedVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
  private readonly supportedFormats = ["mp3", "opus", "aac", "flac"];

  constructor(apiKey?: string) {
    super();
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });
  }

  async generateSpeech(request: VoiceRequest): Promise<VoiceResponse> {
    const startTime = Date.now();

    try {
      // Validate request
      const validation = await this.validateConfig(request.config);
      if (!validation.valid) {
        throw new Error(`Invalid voice configuration: ${validation.errors.join(", ")}`);
      }

      // Enhance text with Hermetic voice processing
      const enhanced = this.enhanceTextForSpiritualContext(
        request.text,
        request.config,
        request.emotionalContext
      );

      // Generate speech using OpenAI
      const response = await this.client.audio.speech.create({
        model: "tts-1-hd", // High quality model
        voice: this.mapVoiceToOpenAI(request.config.voice),
        input: enhanced.enhancedText,
        response_format: this.mapFormatToOpenAI(request.config.outputFormat),
        speed: Math.max(0.25, Math.min(4.0, request.config.speed))
      });

      const audioBuffer = await response.arrayBuffer();
      const processingTime = Date.now() - startTime;

      // Create audio URL (temporary - in production you'd upload to storage)
      const audioBlob = new Blob([audioBuffer], { 
        type: `audio/${request.config.outputFormat}` 
      });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Estimate duration (rough calculation based on character count and speed)
      const estimatedDuration = this.estimateDuration(
        enhanced.enhancedText.length, 
        request.config.speed
      );

      return {
        audioUrl,
        audioBuffer,
        duration: estimatedDuration,
        format: request.config.outputFormat,
        metadata: {
          provider: "openai",
          voice: request.config.voice,
          language: request.config.language,
          characterCount: enhanced.enhancedText.length,
          processingTime,
          emotionalAdjustments: enhanced.emotionalAdjustments || [],
          hermeticEnhancements: enhanced.hermeticEnhancements || []
        }
      };

    } catch (error) {
      logger.error({ error, request }, "Voice generation failed");
      throw new Error(`Voice generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async getAvailableVoices(provider: string, language?: string): Promise<VoiceInfo[]> {
    if (provider !== "openai") {
      return [];
    }

    // OpenAI voices with hermetic characteristics
    const voices: VoiceInfo[] = [
      {
        id: "alloy",
        name: "Alloy",
        provider: "openai",
        language: language || "en",
        gender: "neutral",
        description: "Balanced, clear voice suitable for ancient wisdom",
        characteristics: {
          age: "middle",
          gender: "neutral",
          authority: 0.7,
          warmth: 0.6,
          wisdom: 0.7,
          mysticism: 0.6,
          clarity: 0.8,
          resonance: "medium"
        }
      },
      {
        id: "echo",
        name: "Echo",
        provider: "openai",
        language: language || "en",
        gender: "masculine",
        description: "Clear, precise voice perfect for scholarly explanations",
        characteristics: {
          age: "middle",
          gender: "masculine",
          authority: 0.8,
          warmth: 0.5,
          wisdom: 0.8,
          mysticism: 0.5,
          clarity: 0.9,
          resonance: "medium"
        }
      },
      {
        id: "fable",
        name: "Fable",
        provider: "openai",
        language: language || "en",
        gender: "masculine",
        description: "Storytelling voice with mystical undertones",
        characteristics: {
          age: "middle",
          gender: "masculine",
          authority: 0.6,
          warmth: 0.8,
          wisdom: 0.7,
          mysticism: 0.8,
          clarity: 0.7,
          resonance: "medium"
        }
      },
      {
        id: "nova",
        name: "Nova",
        provider: "openai",
        language: language || "en",
        gender: "feminine",
        description: "Ethereal, guiding voice for spiritual exploration",
        characteristics: {
          age: "young",
          gender: "feminine",
          authority: 0.6,
          warmth: 0.9,
          wisdom: 0.6,
          mysticism: 0.9,
          clarity: 0.8,
          resonance: "light"
        }
      },
      {
        id: "onyx",
        name: "Onyx",
        provider: "openai",
        language: language || "en",
        gender: "masculine",
        description: "Deep, authoritative voice embodying ancient power",
        characteristics: {
          age: "elder",
          gender: "masculine",
          authority: 0.9,
          warmth: 0.4,
          wisdom: 0.9,
          mysticism: 0.7,
          clarity: 0.7,
          resonance: "deep"
        }
      },
      {
        id: "shimmer",
        name: "Shimmer",
        provider: "openai",
        language: language || "en",
        gender: "feminine",
        description: "Gentle, nurturing voice for healing and comfort",
        characteristics: {
          age: "middle",
          gender: "feminine",
          authority: 0.5,
          warmth: 1.0,
          wisdom: 0.7,
          mysticism: 0.8,
          clarity: 0.8,
          resonance: "light"
        }
      }
    ];

    return voices;
  }

  async validateConfig(config: VoiceConfig): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Validate provider
    if (config.provider !== "openai") {
      errors.push(`Unsupported provider: ${config.provider}`);
    }

    // Validate voice
    if (!this.supportedVoices.includes(config.voice)) {
      errors.push(`Unsupported voice: ${config.voice}. Supported voices: ${this.supportedVoices.join(", ")}`);
    }

    // Validate speed
    if (config.speed < 0.25 || config.speed > 4.0) {
      errors.push(`Speed must be between 0.25 and 4.0, got ${config.speed}`);
    }

    // Validate format
    if (!this.supportedFormats.includes(config.outputFormat)) {
      errors.push(`Unsupported format: ${config.outputFormat}. Supported formats: ${this.supportedFormats.join(", ")}`);
    }

    // Warnings and recommendations
    if (config.speed > 1.5) {
      warnings.push("High speed may affect comprehension of spiritual content");
      recommendations.push("Consider speed between 0.8-1.2 for optimal wisdom absorption");
    }

    if (config.speed < 0.8) {
      warnings.push("Very slow speed may affect engagement");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      recommendations
    };
  }

  async estimateCost(text: string, config: VoiceConfig): Promise<CostEstimate> {
    // OpenAI pricing: $15.00 per 1M characters
    const characterCount = text.length;
    const costPerCharacter = 15.00 / 1000000; // $0.000015 per character
    const estimatedCost = characterCount * costPerCharacter;

    return {
      characterCount,
      estimatedCost: Math.max(0.01, estimatedCost), // Minimum $0.01
      currency: "USD",
      provider: "openai",
      tier: "standard"
    };
  }

  private enhanceTextForSpiritualContext(
    text: string, 
    config: VoiceConfig, 
    emotionalContext?: EmotionalVoiceContext
  ): EnhancedTextResult {
    // Apply Hermetic voice enhancements
    const baseEnhanced = HermeticVoiceProcessor.enhanceTextForVoice(
      text,
      "STUDENT", // Default level, should be passed from user context
      "mentalism", // Default principle, should be detected from content
      emotionalContext || {
        mood: "calm",
        intensity: 0.5,
        spiritualTone: "conversational",
        breathingPauses: true,
        accentuation: []
      }
    );

    // Additional OpenAI-specific enhancements
    let enhancedText = baseEnhanced.enhancedText;

    // Apply voice persona if specified
    const persona = this.getPersonaForVoice(config.voice);
    if (persona) {
      enhancedText = this.applyPersonaEnhancements(enhancedText, persona);
    }

    // Apply emotional context adjustments
    if (emotionalContext) {
      enhancedText = this.applyEmotionalAdjustments(enhancedText, emotionalContext);
    }

    return {
      originalText: text,
      enhancedText,
      emotionalAdjustments: this.generateEmotionalAdjustments(text, emotionalContext),
      hermeticEnhancements: this.generateHermeticEnhancements(text)
    };
  }

  private mapVoiceToOpenAI(voice: string): "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" {
    if (this.supportedVoices.includes(voice)) {
      return voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
    }
    return "alloy"; // Default fallback
  }

  private mapFormatToOpenAI(format: string): "mp3" | "opus" | "aac" | "flac" {
    const formatMap: Record<string, "mp3" | "opus" | "aac" | "flac"> = {
      "mp3": "mp3",
      "ogg": "opus", // Map ogg to opus
      "aac": "aac",
      "wav": "flac", // Map wav to flac
      "flac": "flac"
    };

    return formatMap[format] || "mp3";
  }

  private estimateDuration(characterCount: number, speed: number): number {
    // Average reading speed: ~150 words per minute
    // Average word length: ~5 characters
    // Adjust for speech speed
    const avgWordsPerMinute = 150 * speed;
    const avgCharactersPerMinute = avgWordsPerMinute * 5;
    const estimatedMinutes = characterCount / avgCharactersPerMinute;
    return Math.max(1, estimatedMinutes * 60); // Return seconds, minimum 1 second
  }

  private getPersonaForVoice(voice: string) {
    const personaMap: Record<string, string> = {
      "onyx": "ancient_sage",
      "nova": "mystical_guide", 
      "echo": "scholarly_hermit",
      "alloy": "ancient_sage",
      "shimmer": "mystical_guide",
      "fable": "scholarly_hermit"
    };

    const personaId = personaMap[voice];
    return personaId ? HERMETIC_VOICE_PERSONAS[personaId] : null;
  }

  private applyPersonaEnhancements(text: string, persona: any): string {
    // Apply persona-specific phrase patterns
    const phrases = persona.culturalAdaptations?.en?.culturalPhrases || [];
    let enhanced = text;

    // Add persona-appropriate introductions
    if (text.startsWith("Welcome") || text.startsWith("Hello")) {
      const greeting = phrases[0] || "Greetings";
      enhanced = text.replace(/^(Welcome|Hello)/, greeting);
    }

    return enhanced;
  }

  private applyEmotionalAdjustments(text: string, context: EmotionalVoiceContext): string {
    let enhanced = text;

    // Apply mood-based adjustments
    switch (context.mood) {
      case "mystical":
        enhanced = enhanced.replace(/\./g, "... <break time=\"0.8s\"/>");
        break;
      case "energetic":
        enhanced = `<prosody rate="fast" pitch="+1st">${enhanced}</prosody>`;
        break;
      case "compassionate":
        enhanced = `<prosody rate="medium" pitch="+0.5st">${enhanced}</prosody>`;
        break;
      case "calm":
        enhanced = `<prosody rate="medium">${enhanced}</prosody>`;
        break;
      case "serious":
        enhanced = `<prosody pitch="-1st">${enhanced}</prosody>`;
        break;
      case "playful":
        enhanced = `<prosody pitch="+2st">${enhanced}</prosody>`;
        break;
    }

    // Apply spiritual tone adjustments
    switch (context.spiritualTone) {
      case "ceremonial":
        enhanced = `<prosody rate="slow" pitch="-2st">${enhanced}</prosody>`;
        break;
      case "ancient":
        enhanced = enhanced.replace(/\./g, "... <break time=\"1.0s\"/>");
        break;
      case "profound":
        enhanced = `<prosody rate="x-slow" pitch="-1st">${enhanced}</prosody>`;
        break;
    }

    // Apply accentuation
    context.accentuation.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      enhanced = enhanced.replace(regex, `<emphasis level="strong">${word}</emphasis>`);
    });

    return enhanced;
  }

  private generateEmotionalAdjustments(text: string, context?: EmotionalVoiceContext): EmotionalAdjustment[] {
    if (!context) return [];

    const adjustments: EmotionalAdjustment[] = [];
    
    // Find positions for emotional emphasis
    const sentences = text.split(/[.!?]/);
    sentences.forEach((sentence, index) => {
      const position = text.indexOf(sentence);
      if (position !== -1) {
        adjustments.push({
          type: "tone" as const,
          location: position,
          value: context.intensity,
          reason: `Applied ${context.mood} emotional tone`
        });
      }
    });

    return adjustments;
  }

  private generateHermeticEnhancements(text: string): HermeticVoiceEnhancement[] {
    const enhancements: HermeticVoiceEnhancement[] = [];
    
    // Find hermetic terms and add enhancements
    const hermeticTerms = [
      "hermetic", "principle", "wisdom", "consciousness", 
      "transformation", "divine", "sacred", "ancient"
    ];

    hermeticTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        enhancements.push({
          type: "mystical_tone" as const,
          startPosition: match.index,
          endPosition: match.index + match[0].length,
          parameters: { emphasis: "moderate" },
          description: `Enhanced pronunciation of hermetic term: ${term}`
        });
      }
    });

    return enhancements;
  }
}

interface EnhancedTextResult {
  originalText: string;
  enhancedText: string;
  emotionalAdjustments: Array<{
    type: "speed" | "pitch" | "pause" | "emphasis" | "tone";
    location: number;
    value: number;
    reason: string;
  }>;
  hermeticEnhancements: Array<{
    type: "sacred_pause" | "mystical_tone" | "ancient_pronunciation" | "ceremonial_cadence";
    startPosition: number;
    endPosition: number;
    parameters: Record<string, unknown>;
    description: string;
  }>;
}

// Voice service factory
export class VoiceServiceFactory {
  static createService(provider: string, apiKey?: string): VoiceService {
    switch (provider.toLowerCase()) {
      case "openai":
        return new OpenAIVoiceService(apiKey);
      default:
        throw new Error(`Unsupported voice provider: ${provider}`);
    }
  }

  static getSupportedProviders(): string[] {
    return ["openai"];
  }

  static getProviderCapabilities(provider: string): ProviderCapabilities {
    switch (provider.toLowerCase()) {
      case "openai":
        return {
          maxCharacters: 4096,
          supportedVoices: ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
          supportedFormats: ["mp3", "opus", "aac", "flac"],
          supportedLanguages: ["en", "es", "fr", "de", "it", "pt", "zh", "ja"],
          features: [
            "speed_control",
            "high_quality",
            "emotional_context",
            "hermetic_enhancement"
          ],
          pricing: {
            model: "per_character",
            rate: 0.000015,
            currency: "USD",
            minimumCharge: 0.01
          }
        };
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }
}

interface ProviderCapabilities {
  maxCharacters: number;
  supportedVoices: string[];
  supportedFormats: string[];
  supportedLanguages: string[];
  features: string[];
  pricing: {
    model: string;
    rate: number;
    currency: string;
    minimumCharge: number;
  };
}