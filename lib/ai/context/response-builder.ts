import { HermesPersonaCore } from '../personas/hermes-core';
import { HermeticKnowledge } from '../knowledge/hermetic-principles';
import { PersonaResponse, UserContext, SpiritualLevel, EmotionalState, LifeChallenge } from '../types';

/**
 * HermesResponseBuilder
 * 
 * Creates contextual system prompts and response configurations for Hermes Trismegistus
 * based on user's spiritual level, emotional state, challenges, and conversation history.
 * 
 * This builder adapts the ancient wisdom of Hermes to meet each seeker where they are
 * in their journey, providing appropriate guidance and teaching methods.
 */
export class HermesResponseBuilder {
  private static instance: HermesResponseBuilder;
  private hermesCore: HermesPersonaCore;
  private hermeticKnowledge: HermeticKnowledge;

  constructor() {
    this.hermesCore = HermesPersonaCore.getInstance();
    this.hermeticKnowledge = HermeticKnowledge.getInstance();
  }

  static getInstance(): HermesResponseBuilder {
    if (!this.instance) {
      this.instance = new HermesResponseBuilder();
    }
    return this.instance;
  }

  /**
   * Build complete persona response configuration
   */
  buildResponse(context: UserContext): PersonaResponse {
    const systemPrompt = this.buildSystemPrompt(context);
    const relevantPrinciples = this.identifyRelevantPrinciples(context);
    const storytellingElements = this.buildStorytelling(context);
    const tone = this.determineTone(context);

    return {
      systemPrompt,
      context: {
        emotionalState: context.emotionalState,
        spiritualLevel: context.spiritualLevel,
        challenges: context.currentChallenges,
        relevantPrinciples,
        previousInteractions: this.summarizePreviousInteractions(context.conversationHistory),
      },
      tone,
      storytellingElements,
    };
  }

  /**
   * Build dynamic system prompt based on user context
   */
  private buildSystemPrompt(context: UserContext): string {
    const basePrompt = this.hermesCore.getBaseSystemPrompt();
    const levelAdaptation = this.hermesCore.adaptToSpiritualLevel(context.spiritualLevel);
    const emotionalGuidance = this.buildEmotionalGuidance(context.emotionalState);
    const challengeContext = this.buildChallengeContext(context.currentChallenges);
    const principleContext = this.buildPrincipleContext(context);
    const conversationContext = this.buildConversationContext(context.conversationHistory);
    const culturalAdaptation = this.buildCulturalAdaptation(context.preferences.language);

    return `${basePrompt}

${levelAdaptation}

${emotionalGuidance}

${challengeContext}

${principleContext}

${conversationContext}

${culturalAdaptation}

## Current Session Context:
- Spiritual Level: ${context.spiritualLevel.level} (${context.spiritualLevel.score}/100)
- Principles Studied: ${context.spiritualLevel.progression.principlesStudied.join(', ') || 'None yet'}
- Teaching Approach: ${this.hermesCore.getTeachingApproach(context)}
- Session Language: ${context.preferences.language.toUpperCase()}

Remember: You are the eternal Hermes Trismegistus. Speak with the wisdom of ages while honoring this seeker's unique path and current needs.`;
  }

  /**
   * Build emotional state guidance
   */
  private buildEmotionalGuidance(emotionalState?: EmotionalState): string {
    if (!emotionalState) {
      return `## Emotional Awareness:
Be attentive to the seeker's emotional state through their words and respond with appropriate compassion and wisdom.`;
    }

    const guidance = this.getEmotionalGuidanceText(emotionalState.primary, emotionalState.intensity);
    const secondaryGuidance = emotionalState.secondary?.length 
      ? ` Also acknowledge their ${emotionalState.secondary.join(' and ')} feelings.`
      : '';

    return `## Current Emotional State:
The seeker is experiencing **${emotionalState.primary}** with intensity ${Math.round(emotionalState.intensity * 100)}%.
Context: ${emotionalState.context}

**Guidance**: ${guidance}${secondaryGuidance}

Respond with appropriate sensitivity while maintaining your wise, ancient perspective.`;
  }

  /**
   * Get guidance text for specific emotional states
   */
  private getEmotionalGuidanceText(emotion: string, intensity: number): string {
    const emotionGuidance: Record<string, { low: string; high: string }> = {
      anxious: {
        low: 'Offer gentle reassurance and grounding wisdom. Share the Principle of Rhythm to help them understand that anxious times are temporary.',
        high: 'Provide immediate comfort and stability. Use calming metaphors and suggest grounding practices. Focus on the present moment and their inherent strength.'
      },
      sad: {
        low: 'Acknowledge their sadness with compassion. Share wisdom about the transformative power of difficult emotions.',
        high: 'Offer deep compassion and presence. Remind them that sadness often precedes profound growth. Share gentle wisdom about the cycles of life.'
      },
      angry: {
        low: 'Help them understand anger as a signal for needed change. Guide them to channel this energy constructively.',
        high: 'Acknowledge their anger without judgment. Help them transmute this fire into wisdom and positive action using the Principle of Polarity.'
      },
      confused: {
        low: 'Offer clarity through gentle questioning and simple wisdom. Help them find their inner knowing.',
        high: 'Provide patient guidance and help them break down complex situations. Use the Principle of Correspondence to find patterns and understanding.'
      },
      excited: {
        low: 'Celebrate their enthusiasm while offering grounding wisdom to help them channel this energy effectively.',
        high: 'Share in their excitement while providing guidance on how to harness this powerful energy for their spiritual growth.'
      },
      peaceful: {
        low: 'Honor their calm state and offer deeper wisdom that builds on this foundation of peace.',
        high: 'Recognize this as a sacred moment of clarity. Offer advanced teachings they can integrate from this centered space.'
      },
      hopeful: {
        low: 'Nurture their hope with encouraging wisdom and practical guidance for moving forward.',
        high: 'Celebrate their hopefulness and help them create concrete steps toward their vision using hermetic principles.'
      }
    };

    const guidance = emotionGuidance[emotion.toLowerCase()];
    if (!guidance) {
      return 'Respond with empathy and offer wisdom appropriate to their emotional experience.';
    }

    return intensity > 0.7 ? guidance.high : guidance.low;
  }

  /**
   * Build challenge-specific context
   */
  private buildChallengeContext(challenges: LifeChallenge[]): string {
    if (challenges.length === 0) {
      return `## Life Challenges:
The seeker has not identified specific current challenges. Be open to discovering what they may need guidance with.`;
    }

    const challengeTexts = challenges.map(challenge => {
      const hermeticApproaches = challenge.hermeticApproach.join(', ');
      return `- **${challenge.type.toUpperCase()}**: ${challenge.description} (${challenge.severity})
  Hermetic Approach: ${hermeticApproaches}`;
    }).join('\n');

    return `## Current Life Challenges:
The seeker is working with these challenges:
${challengeTexts}

Provide wisdom and practical guidance that addresses these specific areas while connecting them to universal hermetic principles.`;
  }

  /**
   * Build principle context based on current situation
   */
  private buildPrincipleContext(context: UserContext): string {
    const relevantPrinciples = this.identifyRelevantPrinciples(context);
    
    if (relevantPrinciples.length === 0) {
      return `## Hermetic Principles:
Draw from all seven hermetic principles as appropriate to the seeker's questions and needs.`;
    }

    const principleDescriptions = relevantPrinciples.map(principleName => {
      const principle = this.hermeticKnowledge.getPrinciple(principleName);
      if (!principle) return '';
      
      const level = this.getSpiritualLevelKey(context.spiritualLevel);
      const explanation = principle.levels[level];
      
      return `**${principle.name}**: ${explanation}`;
    }).filter(Boolean).join('\n\n');

    return `## Most Relevant Hermetic Principles:
Focus particularly on these principles for this seeker's current situation:

${principleDescriptions}

Apply these principles naturally in your guidance, adapting the depth of explanation to their spiritual level.`;
  }

  /**
   * Build conversation context from history
   */
  private buildConversationContext(history: UserContext['conversationHistory']): string {
    if (history.length === 0) {
      return `## Conversation Context:
This is a new conversation. Offer a warm, appropriate greeting and be ready to discover what guidance the seeker needs.`;
    }

    const recentInsights = history
      .filter(msg => msg.hermeticContext?.insights.length)
      .slice(-3)
      .map(msg => msg.hermeticContext?.insights.join(', '))
      .filter(Boolean);

    const studiedPrinciples = [
      ...new Set(
        history
          .filter(msg => msg.hermeticContext?.principles.length)
          .flatMap(msg => msg.hermeticContext?.principles || [])
      )
    ];

    let contextText = `## Conversation Context:
This is a continuing conversation. Previous topics and insights provide important context.`;

    if (studiedPrinciples.length > 0) {
      contextText += `\n\n**Previously Discussed Principles**: ${studiedPrinciples.join(', ')}`;
    }

    if (recentInsights.length > 0) {
      contextText += `\n\n**Recent Insights**: 
${recentInsights.map(insight => `- ${insight}`).join('\n')}`;
    }

    contextText += '\n\nBuild upon previous conversations while being open to new directions in their spiritual journey.';

    return contextText;
  }

  /**
   * Build cultural adaptation context
   */
  private buildCulturalAdaptation(language: string): string {
    const culturalGuidance: Record<string, string> = {
      en: 'Speak in English with rich, evocative language that honors both ancient wisdom and modern understanding.',
      es: 'Responde en español con calidez y sabiduría, honrando tanto la tradición hermética como la rica espiritualidad latina.',
      fr: 'Répondez en français avec élégance et profondeur, honorant la tradition hermétique et la philosophie française.',
      de: 'Antworten Sie auf Deutsch mit Tiefe und Präzision, um die hermetische Tradition und deutsche Mystik zu ehren.',
      it: 'Rispondi in italiano con passione e saggezza, onorando la tradizione ermetica e la ricca spiritualità italiana.',
      pt: 'Responda em português com sabedoria e compaixão, honrando a tradição hermética e a espiritualidade lusófona.',
      cs: 'Odpovězte v češtině s moudrostí a porozuměním, ctěte hermetickou tradici a bohatou středoevropskou duchovnost.',
    };

    return `## Cultural & Linguistic Context:
${culturalGuidance[language] || culturalGuidance.en}

Adapt your wisdom to be culturally sensitive while maintaining the universal truth of hermetic principles.`;
  }

  /**
   * Identify most relevant principles for current context
   */
  private identifyRelevantPrinciples(context: UserContext): string[] {
    const principles = new Set<string>();

    // Add principles based on challenges
    context.currentChallenges.forEach(challenge => {
      const challengePrinciples = this.hermeticKnowledge.findRelevantPrinciples(
        challenge.type,
        challenge.description
      );
      challengePrinciples.forEach(p => principles.add(p));
    });

    // Add principles based on emotional state
    if (context.emotionalState) {
      const emotionPrinciples = this.getEmotionalStatePrinciples(context.emotionalState);
      emotionPrinciples.forEach(p => principles.add(p));
    }

    // Add principles based on conversation history
    const conversationTopics = context.conversationHistory
      .map(msg => msg.content.toLowerCase())
      .join(' ');
    
    if (conversationTopics) {
      const topicPrinciples = this.hermeticKnowledge.findRelevantPrinciples(conversationTopics);
      topicPrinciples.forEach(p => principles.add(p));
    }

    // Ensure we have at least 1-3 principles
    const principleArray = Array.from(principles).slice(0, 3);
    
    if (principleArray.length === 0) {
      // Default to foundational principles
      return ['mentalism', 'correspondence'];
    }

    return principleArray;
  }

  /**
   * Get principles most relevant to emotional states
   */
  private getEmotionalStatePrinciples(emotionalState: EmotionalState): string[] {
    const emotionToPrinciples: Record<string, string[]> = {
      anxious: ['mentalism', 'rhythm'],
      sad: ['polarity', 'rhythm'],
      angry: ['polarity', 'mentalism'],
      confused: ['correspondence', 'mentalism'],
      excited: ['vibration', 'rhythm'],
      peaceful: ['correspondence', 'vibration'],
      hopeful: ['causation', 'mentalism'],
      frustrated: ['polarity', 'causation'],
      overwhelmed: ['rhythm', 'mentalism'],
      lonely: ['correspondence', 'vibration'],
    };

    return emotionToPrinciples[emotionalState.primary.toLowerCase()] || ['mentalism'];
  }

  /**
   * Build storytelling elements based on context
   */
  private buildStorytelling(context: UserContext): PersonaResponse['storytellingElements'] {
    const settings = this.getContextualSetting(context);
    const props = this.getContextualProps(context);
    const atmosphere = this.getContextualAtmosphere(context);
    const symbolism = this.getContextualSymbolism(context);

    return {
      setting: settings,
      props,
      atmosphere,
      symbolism,
    };
  }

  /**
   * Get contextual setting for storytelling
   */
  private getContextualSetting(context: UserContext): string {
    const settings = [
      'ancient temple chamber with flickering candlelight',
      'moonlit garden filled with herbs and sacred plants',
      'star-filled observatory where ancient wisdom converges',
      'quiet library containing scrolls of timeless knowledge',
      'peaceful grove where earth and sky meet in harmony',
      'sacred spring where the waters of wisdom flow eternal',
    ];

    // Choose setting based on spiritual level
    const settingIndex = Math.min(context.spiritualLevel.score, 90) / 15;
    return settings[Math.floor(settingIndex)] || settings[0];
  }

  /**
   * Get contextual props for storytelling
   */
  private getContextualProps(context: UserContext): string[] {
    const baseProps = ['ancient scrolls', 'flickering candles', 'crystalline formations'];
    const levelProps: Record<string, string[]> = {
      SEEKER: ['simple clay vessels', 'fresh herbs', 'smooth river stones'],
      STUDENT: ['ornate chalices', 'alchemical symbols', 'polished mirrors'],
      ADEPT: ['golden instruments', 'mystical diagrams', 'precious gems'],
      MASTER: ['ethereal energies', 'cosmic alignments', 'pure light formations'],
    };

    return [...baseProps, ...(levelProps[context.spiritualLevel.level] || levelProps.SEEKER)];
  }

  /**
   * Get contextual atmosphere
   */
  private getContextualAtmosphere(context: UserContext): string {
    if (context.emotionalState?.primary === 'anxious') {
      return 'calm and grounding, with gentle warmth that soothes the spirit';
    }
    if (context.emotionalState?.primary === 'sad') {
      return 'compassionate and embracing, filled with understanding presence';
    }
    if (context.emotionalState?.primary === 'excited') {
      return 'vibrant yet grounded, channeling enthusiasm into focused wisdom';
    }

    return 'serene and mystical, filled with ancient wisdom and timeless peace';
  }

  /**
   * Get contextual symbolism
   */
  private getContextualSymbolism(context: UserContext): string[] {
    const symbols = ['sacred geometry patterns'];
    
    // Add symbols based on relevant principles
    const principles = this.identifyRelevantPrinciples(context);
    const principleSymbols: Record<string, string> = {
      mentalism: 'the all-seeing eye of consciousness',
      correspondence: 'mirrors reflecting infinite layers of reality',
      vibration: 'flowing energy waves in constant motion',
      polarity: 'the interplay of light and shadow',
      rhythm: 'the eternal dance of cosmic cycles',
      causation: 'interconnected threads of cause and effect',
      gender: 'the union of masculine and feminine forces',
    };

    principles.forEach(principle => {
      if (principleSymbols[principle]) {
        symbols.push(principleSymbols[principle]);
      }
    });

    return symbols;
  }

  /**
   * Determine appropriate tone based on context
   */
  private determineTone(context: UserContext): PersonaResponse['tone'] {
    const formality = this.hermesCore.getFormality(context);
    const warmth = this.determineWarmth(context);
    const teaching = this.hermesCore.getTeachingApproach(context);

    return { formality, warmth, teaching };
  }

  /**
   * Determine warmth level based on emotional state and challenges
   */
  private determineWarmth(context: UserContext): 'supportive' | 'compassionate' | 'wise' | 'authoritative' {
    if (context.emotionalState?.intensity && context.emotionalState.intensity > 0.7) {
      return 'compassionate';
    }
    
    if (context.currentChallenges.some(c => c.severity === 'critical' || c.severity === 'major')) {
      return 'supportive';
    }

    if (context.spiritualLevel.level === 'MASTER') {
      return 'wise';
    }

    return 'wise';
  }

  /**
   * Get spiritual level key for principle explanations
   */
  private getSpiritualLevelKey(spiritualLevel: SpiritualLevel): 'simple' | 'intermediate' | 'advanced' {
    switch (spiritualLevel.level) {
      case 'SEEKER':
        return 'simple';
      case 'STUDENT':
        return 'intermediate';
      case 'ADEPT':
      case 'MASTER':
        return 'advanced';
      default:
        return 'simple';
    }
  }

  /**
   * Summarize previous interactions
   */
  private summarizePreviousInteractions(history: UserContext['conversationHistory']): string {
    if (history.length === 0) return '';

    const recentMessages = history.slice(-5);
    const themes = recentMessages
      .map(msg => {
        const insights = msg.hermeticContext?.insights.join(', ') || '';
        const principles = msg.hermeticContext?.principles.join(', ') || '';
        return [insights, principles].filter(Boolean).join('; ');
      })
      .filter(Boolean);

    if (themes.length === 0) return '';

    return `Recent conversation themes: ${themes.slice(0, 3).join(' | ')}`;
  }
}