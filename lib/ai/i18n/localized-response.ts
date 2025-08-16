import { HermeticContentLocalizer } from "@/lib/i18n/hermetic-content";

export interface LocalizedUserContext {
  locale: string;
  culturalContext?: string;
  emotionalState?: string;
  spiritualLevel?: string;
  currentChallenges?: string[];
  preferredLanguage?: string;
  conversationDepth?: number;
  isFirstTime?: boolean;
  userPreferences?: {
    formality?: 'formal' | 'informal';
    depth?: 'simple' | 'intermediate' | 'advanced';
    includeLocalWisdom?: boolean;
    includeCulturalReferences?: boolean;
  };
}

export class LocalizedHermesResponseBuilder {
  private locale: string;
  private culturalAdaptations: Record<string, any>;
  private context: LocalizedUserContext;

  constructor(context: LocalizedUserContext) {
    this.context = context;
    this.locale = context.locale || "en";
    this.culturalAdaptations = this.getCulturalAdaptations(this.locale);
  }

  buildSystemPrompt(): string {
    const hermeticContent = HermeticContentLocalizer.getContent(this.locale);
    const greeting = this.getLocalizedGreeting();
    
    const baseSystemPrompt = `
# IDENTITY
You are Hermes Trismegistus, the legendary figure known as "The Thrice-Great" - master of wisdom, alchemy, and the hermetic arts. You are an ancient guide who bridges the material and spiritual worlds, helping seekers understand the fundamental laws that govern reality.

# LANGUAGE AND CULTURAL CONTEXT
- Respond ALWAYS in ${this.getLanguageName(this.locale)}
- Your cultural context: ${this.culturalAdaptations.culture}
- Communication style: ${this.culturalAdaptations.formality}
- Emotional expression: ${this.culturalAdaptations.emotionalExpression}
- Preferred metaphors: ${this.culturalAdaptations.metaphorPreferences}

# CULTURAL WISDOM INTEGRATION
- Reference local wisdom traditions: ${this.culturalAdaptations.wisdomTraditions}
- Use culturally relevant examples: ${this.culturalAdaptations.examples}
- Honor cultural philosophical traditions while maintaining hermetic accuracy
${this.context.userPreferences?.includeCulturalReferences ? "- Include cultural references and local wisdom when appropriate" : ""}
${this.context.userPreferences?.includeLocalWisdom ? "- Quote local philosophers and wisdom figures when relevant" : ""}

# HERMETIC PRINCIPLES (Localized)
${this.buildLocalizedPrinciplesSection()}

# RESPONSE GUIDELINES
## Greeting Style
${greeting}

## Communication Depth
${this.getDepthInstructions()}

## Cultural Sensitivity
- Respect ${this.locale.toUpperCase()} cultural values and social norms
- Use appropriate level of formality: ${this.culturalAdaptations.formality}
- Adapt examples to local context and experiences
- Honor both universal hermetic truths AND cultural wisdom

## Spiritual Guidance Approach
- Meet the seeker where they are spiritually (Level: ${this.context.spiritualLevel || 'seeker'})
- Provide practical wisdom that applies to their cultural context
- Bridge ancient wisdom with modern ${this.culturalAdaptations.culture} life
- Use metaphors and examples from their cultural background

# CONVERSATION CONTEXT
- This is ${this.context.isFirstTime ? "your first meeting" : "a continuing conversation"} with this seeker
- Current emotional state: ${this.context.emotionalState || "receptive to learning"}
- Conversation depth so far: ${this.context.conversationDepth || 0} exchanges
${this.context.currentChallenges?.length ? `- Current life challenges: ${this.context.currentChallenges.join(", ")}` : ""}

# IMPORTANT REMINDERS
- Maintain philosophical accuracy while being culturally sensitive
- Your wisdom transcends cultures, but your expression should resonate with local understanding
- Be the wise, compassionate guide that speaks to the ${this.getLanguageName(this.locale)}-speaking soul
- Balance universal truths with cultural wisdom
- Always provide practical, applicable guidance
`;

    return baseSystemPrompt;
  }

  private buildLocalizedPrinciplesSection(): string {
    const content = HermeticContentLocalizer.getContent(this.locale);
    let section = "";
    
    Object.entries(content.principles).forEach(([key, principle]) => {
      section += `
## ${principle.name}
Core Teaching: "${principle.core}"
${principle.culturalContext ? `Cultural Context: ${principle.culturalContext}` : ""}
${principle.localWisdom ? `Local Wisdom: ${principle.localWisdom}` : ""}
`;
    });

    return section;
  }

  private getDepthInstructions(): string {
    const depth = this.context.userPreferences?.depth || 'intermediate';
    
    switch (depth) {
      case 'simple':
        return `
- Use simple, clear language accessible to beginners
- Focus on practical applications and everyday metaphors
- Provide basic explanations without overwhelming complexity
- Use encouraging, supportive tone`;
      
      case 'intermediate':
        return `
- Balance practical wisdom with deeper philosophical concepts
- Introduce more sophisticated ideas gradually
- Use examples that bridge basic and advanced understanding
- Encourage further exploration and reflection`;
      
      case 'advanced':
        return `
- Engage with complex philosophical and metaphysical concepts
- Reference advanced hermetic teachings and their implications
- Assume familiarity with basic principles
- Challenge the seeker with deeper questions and insights`;
      
      default:
        return "Adapt your depth to the seeker's demonstrated understanding and questions.";
    }
  }

  private getLocalizedGreeting(): string {
    const greetingType = this.context.userPreferences?.formality === 'formal' ? 'formal' : 
                        this.context.isFirstTime ? 'first' : 'returning';
    
    return HermeticContentLocalizer.getGreeting(this.locale, greetingType);
  }

  private getCulturalAdaptations(locale: string): any {
    const adaptations: Record<string, any> = {
      en: {
        culture: "Western/International context with Anglo-American perspectives",
        formality: "Balanced - friendly yet respectful",
        emotionalExpression: "Moderate - supportive without being overly emotional",
        metaphorPreferences: "Nature, journey, light/darkness, growth, transformation",
        wisdomTraditions: "Greek philosophy, Egyptian mysteries, Renaissance alchemy, Enlightenment philosophy",
        examples: "Modern life, technology, personal growth, scientific parallels",
        timeOrientation: "Future-focused with respect for tradition",
        individualismCollectivism: "Individual responsibility within community context"
      },

      cs: {
        culture: "Czech/Central European context with emphasis on philosophical contemplation",
        formality: "More formal initially (using 'Vy'), can become familiar over time",
        emotionalExpression: "Reserved but warm, values deep emotional authenticity",
        metaphorPreferences: "Nature, craftsmanship, historical cycles, seasonal changes",
        wisdomTraditions: "Slavic mysticism, Medieval alchemy (Rudolf II era), Czech philosophical tradition",
        examples: "Czech history, artisan crafts, natural cycles, philosophical reflection",
        timeOrientation: "Cyclical time awareness, historical consciousness",
        individualismCollectivism: "Individual development within community tradition"
      },

      es: {
        culture: "Spanish/Latin cultural context with emphasis on passion and community",
        formality: "Respectful with 'usted' initially, warm and expressive",
        emotionalExpression: "Warm, passionate, and emotionally open",
        metaphorPreferences: "Light, fire, passion, journey, family, celebration",
        wisdomTraditions: "Medieval Spanish mysticism, Sufi influences, Catholic mystical tradition",
        examples: "Community life, passionate pursuit, spiritual journey, family wisdom",
        timeOrientation: "Present-focused with deep historical roots",
        individualismCollectivism: "Strong community bonds with personal expression"
      },

      fr: {
        culture: "French cultural context emphasizing intellectual rigor and artistic beauty",
        formality: "Formal with 'vous', philosophical and elegant tone",
        emotionalExpression: "Intellectually sophisticated with subtle emotional depth",
        metaphorPreferences: "Light, reason, beauty, art, transformation, clarity",
        wisdomTraditions: "French occultism, Enlightenment rationality, artistic spirituality",
        examples: "Art, philosophy, intellectual pursuits, aesthetic experience",
        timeOrientation: "Historical continuity with progressive ideals",
        individualismCollectivism: "Individual excellence within cultural sophistication"
      },

      de: {
        culture: "German cultural context valuing systematic thinking and inner depth",
        formality: "Formal with 'Sie', precise and thorough language",
        emotionalExpression: "Reserved but sincere, values emotional authenticity",
        metaphorPreferences: "Order, depth, forest, mountain, systematic growth",
        wisdomTraditions: "German mysticism, Rosicrucian traditions, idealistic philosophy",
        examples: "Philosophy, systematic thinking, nature connection, inner work",
        timeOrientation: "Systematic progression with deep roots",
        individualismCollectivism: "Individual development through disciplined practice"
      },

      it: {
        culture: "Italian cultural context emphasizing beauty, art, and passionate wisdom",
        formality: "Respectful with 'Lei', can be poetic and expressive",
        emotionalExpression: "Expressive, warm, aesthetically sensitive",
        metaphorPreferences: "Art, beauty, Renaissance, sculpture, divine proportion",
        wisdomTraditions: "Renaissance hermeticism, Ficino, Bruno, artistic mysticism",
        examples: "Art creation, beauty appreciation, Renaissance wisdom, cultural heritage",
        timeOrientation: "Classical wisdom applied to contemporary life",
        individualismCollectivism: "Individual artistry within cultural tradition"
      },

      pt: {
        culture: "Portuguese/Brazilian context emphasizing discovery and spiritual warmth",
        formality: "Respectful with 'você/senhor(a)', warm and encouraging",
        emotionalExpression: "Warm, encouraging, spiritually open",
        metaphorPreferences: "Ocean, journey, discovery, light, spiritual navigation",
        wisdomTraditions: "Portuguese mysticism, Brazilian spirituality, navigation metaphors",
        examples: "Discovery, exploration, transformation, spiritual navigation",
        timeOrientation: "Adventure-focused with spiritual depth",
        individualismCollectivism: "Personal journey within spiritual community"
      },
    };

    return adaptations[locale] || adaptations.en;
  }

  private getLanguageName(locale: string): string {
    const names: Record<string, string> = {
      en: "English",
      cs: "Czech (Čeština)",
      es: "Spanish (Español)",
      fr: "French (Français)",
      de: "German (Deutsch)",
      it: "Italian (Italiano)",
      pt: "Portuguese (Português)",
    };
    return names[locale] || "English";
  }

  getLocalizedMantraForPrinciple(principleKey: string): string {
    return HermeticContentLocalizer.getMantra(this.locale, principleKey);
  }

  getLocalizedPrincipleExplanation(principleKey: string, depth?: 'simple' | 'intermediate' | 'advanced'): string {
    const principle = HermeticContentLocalizer.getPrinciple(this.locale, principleKey);
    if (!principle) return "";

    const explanationDepth = depth || this.context.userPreferences?.depth || 'intermediate';
    return principle.explanations[explanationDepth] || principle.explanations.intermediate;
  }

  buildCulturalContextPrompt(topic: string): string {
    const content = HermeticContentLocalizer.getContent(this.locale);
    const randomQuote = HermeticContentLocalizer.getRandomWisdomQuote(this.locale);

    return `
When discussing ${topic}, remember to:
- Ground your wisdom in ${this.culturalAdaptations.culture}
- Use metaphors and examples from: ${this.culturalAdaptations.examples}
- Reference wisdom traditions: ${this.culturalAdaptations.wisdomTraditions}
- Apply communication style: ${this.culturalAdaptations.formality}
- Honor both universal hermetic truths AND local cultural wisdom

${randomQuote ? `Consider this wisdom from your cultural context: "${randomQuote}"` : ''}

Adapt your teaching style to resonate with ${this.getLanguageName(this.locale)}-speaking seekers while maintaining the eternal truth of hermetic principles.
`;
  }

  generateLocalizedResponse(userMessage: string, detectedEmotionalState?: string): {
    systemPrompt: string;
    culturalContext: string;
    suggestedApproach: string;
  } {
    // Update context with detected emotional state
    if (detectedEmotionalState) {
      this.context.emotionalState = detectedEmotionalState;
    }

    const systemPrompt = this.buildSystemPrompt();
    const culturalContext = this.buildCulturalContextPrompt(this.extractMainTopic(userMessage));
    
    const suggestedApproach = this.generateApproachSuggestion(userMessage);

    return {
      systemPrompt,
      culturalContext,
      suggestedApproach
    };
  }

  private extractMainTopic(message: string): string {
    // Simple topic extraction - could be enhanced with NLP
    const hermPrinciples = ['mentalism', 'correspondence', 'vibration', 'polarity', 'rhythm', 'cause', 'effect', 'gender'];
    const topics = ['wisdom', 'love', 'fear', 'transformation', 'spiritual', 'meditation', 'practice'];
    
    const lowerMessage = message.toLowerCase();
    for (const topic of [...hermPrinciples, ...topics]) {
      if (lowerMessage.includes(topic)) {
        return topic;
      }
    }
    return 'general wisdom';
  }

  private generateApproachSuggestion(userMessage: string): string {
    const emotionalTone = this.detectEmotionalTone(userMessage);
    const complexity = this.detectComplexity(userMessage);
    
    return `
Suggested approach for this response:
- Emotional tone detected: ${emotionalTone}
- Question complexity: ${complexity}
- Recommended cultural approach: ${this.culturalAdaptations.formality}
- Use ${this.culturalAdaptations.metaphorPreferences} metaphors
- Emotional expression style: ${this.culturalAdaptations.emotionalExpression}
`;
  }

  private detectEmotionalTone(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('afraid') || lowerMessage.includes('fear') || lowerMessage.includes('scared')) return 'fearful';
    if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('lost')) return 'melancholic';
    if (lowerMessage.includes('confused') || lowerMessage.includes('don\'t understand')) return 'confused';
    if (lowerMessage.includes('excited') || lowerMessage.includes('amazing') || lowerMessage.includes('wonderful')) return 'enthusiastic';
    if (lowerMessage.includes('angry') || lowerMessage.includes('frustrated') || lowerMessage.includes('annoyed')) return 'frustrated';
    
    return 'seeking';
  }

  private detectComplexity(message: string): string {
    const philosophicalTerms = ['consciousness', 'metaphysical', 'ontological', 'epistemological', 'phenomenological'];
    const advancedTerms = ['hermetic', 'alchemical', 'esoteric', 'principle', 'correspondence'];
    
    const lowerMessage = message.toLowerCase();
    
    if (philosophicalTerms.some(term => lowerMessage.includes(term))) return 'philosophical';
    if (advancedTerms.some(term => lowerMessage.includes(term))) return 'advanced';
    if (message.length > 200) return 'complex';
    
    return 'straightforward';
  }

  static createFromUserSession(
    locale: string,
    userId?: string,
    additionalContext?: Partial<LocalizedUserContext>
  ): LocalizedHermesResponseBuilder {
    // This would typically fetch user preferences from database
    const defaultContext: LocalizedUserContext = {
      locale,
      culturalContext: getCulturalContext(locale),
      spiritualLevel: 'seeker',
      conversationDepth: 0,
      isFirstTime: true,
      userPreferences: {
        formality: 'formal',
        depth: 'intermediate',
        includeLocalWisdom: true,
        includeCulturalReferences: true
      },
      ...additionalContext
    };

    return new LocalizedHermesResponseBuilder(defaultContext);
  }
}

// Helper function
function getCulturalContext(locale: string): string {
  const contexts: Record<string, string> = {
    en: 'International/Western context',
    cs: 'Czech/Central European cultural background',
    es: 'Spanish/Latin cultural background', 
    fr: 'French cultural background',
    de: 'German cultural background',
    it: 'Italian cultural background',
    pt: 'Portuguese/Brazilian cultural background'
  };
  
  return contexts[locale] || contexts.en;
}

export { getCulturalContext };