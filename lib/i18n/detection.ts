import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;
  scores?: Record<string, number>;
  reasoning?: string;
  fallbackReason?: string;
  culturalContext?: string;
}

export interface DetectionOptions {
  minConfidence?: number;
  includeScores?: boolean;
  contextualBoost?: boolean;
  userHistory?: string[];
  model?: 'fast' | 'accurate';
}

// Language detection schema for AI-based classification
const LanguageClassificationSchema = z.object({
  detectedLanguage: z.enum(['en', 'cs', 'es', 'fr', 'de', 'it', 'pt']).describe('The detected language code'),
  confidence: z.number().min(0).max(1).describe('Confidence score between 0 and 1'),
  reasoning: z.string().describe('Brief explanation of why this language was detected'),
  culturalContext: z.string().optional().describe('Cultural context clues that helped with detection'),
  alternativeLanguages: z.array(
    z.object({
      language: z.enum(['en', 'cs', 'es', 'fr', 'de', 'it', 'pt']),
      confidence: z.number().min(0).max(1)
    })
  ).optional().describe('Alternative possible languages with their confidence scores')
});

export class LanguageDetector {
  private static readonly SUPPORTED_LANGUAGES = ['en', 'cs', 'es', 'fr', 'de', 'it', 'pt'];
  private static readonly MIN_TEXT_LENGTH = 3;
  private static readonly DEFAULT_MIN_CONFIDENCE = 0.3;

  /**
   * AI-powered language detection using LLM classification
   */
  static async detectLanguage(
    text: string, 
    options: DetectionOptions = {}
  ): Promise<LanguageDetectionResult> {
    if (!text || text.trim().length < this.MIN_TEXT_LENGTH) {
      return {
        detectedLanguage: 'en',
        confidence: 0,
        fallbackReason: 'Text too short for reliable detection'
      };
    }

    const {
      minConfidence = this.DEFAULT_MIN_CONFIDENCE,
      contextualBoost = true,
      userHistory = [],
      model = 'fast'
    } = options;

    try {
      // Use appropriate model based on accuracy needs
      const selectedModel = model === 'accurate' ? openai('gpt-4o') : openai('gpt-4o-mini');

      const systemPrompt = `You are an expert language detection system specialized in identifying languages used in spiritual and hermetic contexts.

Supported languages:
- English (en): International/Western context
- Czech (cs): Central European, philosophical traditions  
- Spanish (es): Spanish/Latin cultural context
- French (fr): French intellectual and mystical traditions
- German (de): German systematic and mystical thinking
- Italian (it): Renaissance hermeticism and artistic spirituality
- Portuguese (pt): Portuguese/Brazilian spiritual traditions

Focus on:
1. Grammatical structures and word patterns
2. Cultural and spiritual terminology usage
3. Character sets and diacritical marks
4. Context clues from hermetic/spiritual content
${contextualBoost ? '5. Hermetic and spiritual vocabulary in the detected language' : ''}
${userHistory.length > 0 ? `6. Historical context: User has previously used: ${this.analyzeHistoryLanguages(userHistory)}` : ''}

Be confident in your detection but acknowledge uncertainty when text is ambiguous.`;

      const { object: classification } = await generateObject({
        model: selectedModel,
        schema: LanguageClassificationSchema,
        system: systemPrompt,
        prompt: `Detect the language of this text. Consider spiritual/hermetic terminology and cultural context:

"${text}"

Provide your classification with reasoning.`,
      });

      // Validate confidence threshold
      const isReliableDetection = classification.confidence >= minConfidence;

      // Build scores object if requested
      const scores: Record<string, number> = {};
      if (options.includeScores) {
        scores[classification.detectedLanguage] = classification.confidence;
        classification.alternativeLanguages?.forEach(alt => {
          scores[alt.language] = alt.confidence;
        });
      }

      return {
        detectedLanguage: isReliableDetection ? classification.detectedLanguage : 'en',
        confidence: classification.confidence,
        reasoning: classification.reasoning,
        culturalContext: classification.culturalContext,
        scores: options.includeScores ? scores : undefined,
        fallbackReason: !isReliableDetection 
          ? `AI confidence ${classification.confidence.toFixed(2)} below threshold ${minConfidence}`
          : undefined
      };

    } catch (error) {
      console.error('AI language detection failed:', error);
      
      // Fallback to simple heuristic detection
      return this.fallbackDetection(text, options);
    }
  }

  /**
   * Detect language with hermetic/spiritual context awareness
   */
  static async detectWithHermeticContext(
    text: string,
    options: DetectionOptions = {}
  ): Promise<LanguageDetectionResult> {
    const enhancedOptions = {
      ...options,
      contextualBoost: true,
      model: 'accurate' as const // Use more accurate model for specialized content
    };

    try {
      const { object: classification } = await generateObject({
        model: openai('gpt-4o'),
        schema: LanguageClassificationSchema,
        system: `You are a specialized language detection system for hermetic, spiritual, and esoteric content.

You excel at identifying languages in contexts involving:
- Hermetic principles and philosophy
- Spiritual and mystical terminology  
- Alchemical and esoteric concepts
- Ancient wisdom traditions
- Cultural spiritual practices

Supported languages with their hermetic contexts:
- English (en): Modern international hermeticism, New Age spirituality
- Czech (cs): Central European mysticism, Rudolf II alchemical tradition
- Spanish (es): Medieval Spanish mysticism, Sufi-influenced traditions  
- French (fr): French occultism, Enlightenment esotericism
- German (de): German mysticism, Rosicrucian traditions
- Italian (it): Renaissance hermeticism, Ficino and Bruno traditions
- Portuguese (pt): Portuguese mysticism, Brazilian spirituality

Pay special attention to:
1. Spiritual and hermetic vocabulary
2. Cultural references to wisdom traditions
3. Philosophical and mystical terminology
4. Regional variations in esoteric concepts`,

        prompt: `Analyze this hermetic/spiritual text for language detection:

"${text}"

Consider the cultural and spiritual context. What language is this, and what hermetic tradition does it reflect?`,
      });

      const scores: Record<string, number> = {};
      if (options.includeScores) {
        scores[classification.detectedLanguage] = classification.confidence;
        classification.alternativeLanguages?.forEach(alt => {
          scores[alt.language] = alt.confidence;
        });
      }

      return {
        detectedLanguage: classification.detectedLanguage,
        confidence: classification.confidence,
        reasoning: classification.reasoning,
        culturalContext: classification.culturalContext,
        scores: options.includeScores ? scores : undefined
      };

    } catch (error) {
      console.error('Hermetic context detection failed:', error);
      return this.detectLanguage(text, options);
    }
  }

  /**
   * Detect language from user's conversation history using AI analysis
   */
  static async detectFromUserHistory(
    userId: string, 
    prisma: any
  ): Promise<string> {
    try {
      // Get user's stored language preference
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          preferredLanguage: true,
          conversations: {
            select: {
              messages: {
                select: { content: true, role: true },
                where: { role: 'user' },
                orderBy: { createdAt: 'desc' },
                take: 15 // Get more messages for better AI analysis
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });

      // Return stored preference if available and supported
      if (user?.preferredLanguage && this.SUPPORTED_LANGUAGES.includes(user.preferredLanguage)) {
        return user.preferredLanguage;
      }

      // Analyze recent messages using AI if available
      if (user?.conversations?.length) {
        const recentMessages = user.conversations
          .flatMap((conv: any) => conv.messages)
          .slice(0, 25)
          .map((msg: any) => msg.content)
          .join(' ');

        if (recentMessages.length > 30) {
          const detection = await this.detectLanguage(recentMessages, {
            minConfidence: 0.4,
            contextualBoost: true,
            model: 'fast' // Use fast model for user history analysis
          });
          
          return detection.detectedLanguage;
        }
      }

      return 'en'; // Default fallback
    } catch (error) {
      console.error('Error detecting language from user history:', error);
      return 'en';
    }
  }

  /**
   * Batch detect languages from multiple texts using AI
   */
  static async batchDetect(
    texts: string[], 
    options: DetectionOptions = {}
  ): Promise<LanguageDetectionResult[]> {
    // For batch processing, use the fast model to reduce costs
    const batchOptions = { ...options, model: 'fast' as const };
    
    return Promise.all(
      texts.map(text => this.detectLanguage(text, batchOptions))
    );
  }

  /**
   * Smart detection with multiple fallback strategies
   */
  static async detectWithFallback(text: string): Promise<LanguageDetectionResult> {
    // Try AI detection first
    try {
      const result = await this.detectLanguage(text, { 
        minConfidence: 0.25, 
        model: 'accurate' 
      });
      
      if (result.confidence >= 0.25) {
        return result;
      }
    } catch (error) {
      console.warn('Primary AI detection failed, using fallback:', error);
    }

    // Fallback to fast AI detection
    try {
      const result = await this.detectLanguage(text, { 
        minConfidence: 0.1, 
        model: 'fast' 
      });
      
      if (result.confidence >= 0.1) {
        return result;
      }
    } catch (error) {
      console.warn('Fast AI detection failed, using heuristic fallback:', error);
    }

    // Final fallback to heuristic detection
    return this.fallbackDetection(text, { minConfidence: 0.05 });
  }

  /**
   * Route-based detection for chat API integration
   */
  static async routeBasedDetection(
    text: string, 
    userContext?: { 
      previousLanguage?: string;
      userAgent?: string;
      acceptLanguage?: string;
    }
  ): Promise<LanguageDetectionResult> {
    try {
      const { object: routing } = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: z.object({
          primaryLanguage: z.enum(['en', 'cs', 'es', 'fr', 'de', 'it', 'pt']),
          confidence: z.number().min(0).max(1),
          reasoning: z.string(),
          shouldSwitchLanguage: z.boolean().describe('Whether to switch from previous language'),
          culturalAdaptation: z.string().describe('How to culturally adapt the response')
        }),
        system: `You are a routing agent for a multilingual hermetic wisdom application. 

Analyze the user input to determine:
1. What language they are using
2. Whether to continue in their previous language or switch
3. How to culturally adapt the hermetic response

Context:
- Previous language: ${userContext?.previousLanguage || 'none'}
- Browser language: ${userContext?.acceptLanguage || 'unknown'}
- This is a hermetic/spiritual wisdom application

Consider:
- Code-switching (users mixing languages)
- Cultural appropriateness of hermetic concepts
- User's apparent linguistic comfort level`,

        prompt: `Analyze this user message for language routing:

"${text}"

Determine the appropriate language and cultural adaptation strategy.`,
      });

      return {
        detectedLanguage: routing.primaryLanguage,
        confidence: routing.confidence,
        reasoning: routing.reasoning,
        culturalContext: routing.culturalAdaptation
      };

    } catch (error) {
      console.error('Route-based detection failed:', error);
      return this.detectLanguage(text, { model: 'fast' });
    }
  }

  // Utility methods
  static isLanguageSupported(languageCode: string): boolean {
    return this.SUPPORTED_LANGUAGES.includes(languageCode.toLowerCase());
  }

  static getSupportedLanguages(): string[] {
    return [...this.SUPPORTED_LANGUAGES];
  }

  static normalizeLanguageCode(languageCode: string): string {
    const normalized = languageCode.toLowerCase().split('-')[0];
    return this.isLanguageSupported(normalized) ? normalized : 'en';
  }

  static getConfidenceDescription(confidence: number): string {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.7) return 'High';
    if (confidence >= 0.5) return 'Medium';
    if (confidence >= 0.3) return 'Low';
    return 'Very Low';
  }

  // Private helper methods
  private static analyzeHistoryLanguages(history: string[]): string {
    // Simple analysis of historical language usage
    const recentText = history.slice(0, 5).join(' ');
    return recentText.length > 0 ? `"${recentText.slice(0, 100)}..."` : 'no recent history';
  }

  private static fallbackDetection(
    text: string, 
    options: DetectionOptions = {}
  ): LanguageDetectionResult {
    // Simple heuristic detection based on character patterns
    const scores: Record<string, number> = {};
    
    // Czech characters
    if (/[ěščřžýáíéůú]/gi.test(text)) scores.cs = 0.6;
    
    // Spanish characters  
    if (/[ñáéíóúü]/gi.test(text)) scores.es = 0.6;
    
    // French characters
    if (/[àâçèéêëîïôùûü]/gi.test(text)) scores.fr = 0.6;
    
    // German characters
    if (/[äöüß]/gi.test(text)) scores.de = 0.6;
    
    // Italian characters
    if (/[àèéìíòóù]/gi.test(text)) scores.it = 0.5;
    
    // Portuguese characters
    if (/[ãáàâçéêíõóôú]/gi.test(text)) scores.pt = 0.5;
    
    // English (default low score)
    scores.en = 0.3;

    const bestMatch = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      detectedLanguage: bestMatch?.[0] || 'en',
      confidence: bestMatch?.[1] || 0.3,
      scores: options.includeScores ? scores : undefined,
      fallbackReason: 'Using heuristic pattern-based detection'
    };
  }
}

export default LanguageDetector;