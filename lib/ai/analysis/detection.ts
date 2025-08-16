import { EmotionalState, SpiritualLevel, LifeChallenge, UserContext } from '../types';

/**
 * EmotionDetectionService
 * 
 * Analyzes user messages to detect emotional states, spiritual needs, and life challenges.
 * Uses pattern recognition and keyword analysis to provide contextual understanding
 * for the Hermes persona to respond appropriately.
 * 
 * This service embodies the hermetic principle of correspondence - recognizing that
 * outer expressions mirror inner states.
 */
export class EmotionDetectionService {
  private static instance: EmotionDetectionService;

  private emotionKeywords: Record<string, { positive: string[], negative: string[], intensity: string[] }> = {
    anxious: {
      positive: ['concerned', 'careful', 'attentive', 'vigilant'],
      negative: ['worried', 'stressed', 'nervous', 'panic', 'fear', 'overwhelmed', 'tense'],
      intensity: ['terrified', 'paralyzed', 'panic attack', 'can\'t breathe', 'heart racing']
    },
    sad: {
      positive: ['reflective', 'contemplative', 'processing'],
      negative: ['sad', 'depressed', 'down', 'melancholy', 'grief', 'sorrow', 'crying'],
      intensity: ['devastated', 'heartbroken', 'suicidal', 'hopeless', 'empty']
    },
    angry: {
      positive: ['passionate', 'motivated', 'determined', 'decisive'],
      negative: ['angry', 'frustrated', 'irritated', 'mad', 'furious', 'annoyed', 'rage'],
      intensity: ['enraged', 'livid', 'seething', 'explosive', 'violent']
    },
    confused: {
      positive: ['curious', 'exploring', 'questioning', 'learning'],
      negative: ['confused', 'lost', 'uncertain', 'unclear', 'puzzled', 'bewildered'],
      intensity: ['completely lost', 'no idea', 'totally confused', 'mind blank']
    },
    excited: {
      positive: ['excited', 'thrilled', 'enthusiastic', 'energized', 'motivated', 'inspired'],
      negative: ['manic', 'hyper', 'overstimulated', 'scattered'],
      intensity: ['ecstatic', 'over the moon', 'can\'t contain', 'bursting']
    },
    peaceful: {
      positive: ['peaceful', 'calm', 'serene', 'centered', 'balanced', 'content', 'tranquil'],
      negative: ['numb', 'detached', 'withdrawn'],
      intensity: ['blissful', 'enlightened', 'divine peace', 'transcendent']
    },
    hopeful: {
      positive: ['hopeful', 'optimistic', 'positive', 'confident', 'faith', 'trust'],
      negative: ['desperately hoping', 'grasping', 'forcing positivity'],
      intensity: ['absolutely certain', 'unshakeable faith', 'divine knowing']
    },
    lonely: {
      positive: ['independent', 'self-reliant', 'introspective'],
      negative: ['lonely', 'isolated', 'alone', 'disconnected', 'abandoned'],
      intensity: ['utterly alone', 'completely isolated', 'nobody cares']
    }
  };

  private challengeIndicators: Record<LifeChallenge['type'], string[]> = {
    relationship: [
      'relationship', 'partner', 'spouse', 'girlfriend', 'boyfriend', 'marriage',
      'divorce', 'breakup', 'fighting', 'communication', 'love', 'dating',
      'family conflict', 'friend', 'social', 'connection'
    ],
    career: [
      'job', 'work', 'career', 'boss', 'colleague', 'salary', 'promotion',
      'unemployed', 'fired', 'quit', 'business', 'professional', 'office',
      'interview', 'resume', 'success'
    ],
    health: [
      'health', 'sick', 'illness', 'doctor', 'medicine', 'pain', 'tired',
      'energy', 'sleep', 'diet', 'exercise', 'body', 'mental health',
      'anxiety', 'depression', 'therapy'
    ],
    spiritual: [
      'spiritual', 'soul', 'purpose', 'meaning', 'God', 'universe',
      'meditation', 'prayer', 'awakening', 'consciousness', 'enlightenment',
      'wisdom', 'truth', 'faith', 'belief'
    ],
    financial: [
      'money', 'financial', 'debt', 'bills', 'salary', 'income', 'budget',
      'expenses', 'rent', 'mortgage', 'savings', 'investment', 'poverty',
      'wealth', 'abundance'
    ],
    family: [
      'family', 'parents', 'mother', 'father', 'children', 'kids', 'siblings',
      'relatives', 'home', 'childhood', 'upbringing', 'generational',
      'inheritance', 'tradition'
    ],
    purpose: [
      'purpose', 'meaning', 'direction', 'calling', 'mission', 'destiny',
      'passion', 'fulfillment', 'contribution', 'legacy', 'impact',
      'worthwhile', 'significant'
    ]
  };

  private spiritualLevelIndicators = {
    seeker: [
      'new to', 'beginning', 'just started', 'curious about', 'interested in',
      'heard about', 'don\'t understand', 'confused about', 'help me understand'
    ],
    student: [
      'been practicing', 'learning about', 'studying', 'trying to apply',
      'working with', 'practicing', 'developing', 'improving', 'deepening'
    ],
    adept: [
      'experienced with', 'advanced practice', 'teaching others', 'mastering',
      'integrated', 'embodying', 'living these principles', 'profound understanding'
    ],
    master: [
      'decades of practice', 'teaching for years', 'guiding others', 'serving',
      'wisdom tradition', 'lineage', 'transmission', 'enlightenment'
    ]
  };

  static getInstance(): EmotionDetectionService {
    if (!this.instance) {
      this.instance = new EmotionDetectionService();
    }
    return this.instance;
  }

  /**
   * Analyze user message for emotional state
   */
  analyzeEmotionalState(text: string, conversationHistory?: string[]): EmotionalState | undefined {
    const textLower = text.toLowerCase();
    const detectedEmotions: { emotion: string; intensity: number; confidence: number }[] = [];

    // Check for each emotion type
    Object.entries(this.emotionKeywords).forEach(([emotion, keywords]) => {
      let intensity = 0;
      let matches = 0;

      // Check positive indicators (lower intensity)
      keywords.positive.forEach(keyword => {
        if (textLower.includes(keyword)) {
          intensity += 0.3;
          matches++;
        }
      });

      // Check negative indicators (medium intensity)
      keywords.negative.forEach(keyword => {
        if (textLower.includes(keyword)) {
          intensity += 0.6;
          matches++;
        }
      });

      // Check high intensity indicators
      keywords.intensity.forEach(keyword => {
        if (textLower.includes(keyword)) {
          intensity += 1.0;
          matches++;
        }
      });

      if (matches > 0) {
        // Calculate confidence based on number of matches and text length
        const confidence = Math.min(matches / 3, 1.0);
        intensity = Math.min(intensity, 1.0);

        detectedEmotions.push({ emotion, intensity, confidence });
      }
    });

    if (detectedEmotions.length === 0) return undefined;

    // Sort by confidence and intensity
    detectedEmotions.sort((a, b) => (b.confidence * b.intensity) - (a.confidence * a.intensity));

    const primary = detectedEmotions[0];
    const secondary = detectedEmotions.slice(1, 3).map(e => e.emotion);

    // Extract context from the surrounding text
    const context = this.extractEmotionalContext(text, primary.emotion);

    return {
      primary: primary.emotion,
      secondary: secondary.length > 0 ? secondary : undefined,
      intensity: primary.intensity,
      context
    };
  }

  /**
   * Detect life challenges from user text
   */
  detectLifeChallenges(text: string, severity: 'minor' | 'moderate' | 'major' | 'critical' = 'moderate'): LifeChallenge[] {
    const textLower = text.toLowerCase();
    const detectedChallenges: LifeChallenge[] = [];

    Object.entries(this.challengeIndicators).forEach(([challengeType, indicators]) => {
      const matches = indicators.filter(indicator => textLower.includes(indicator));
      
      if (matches.length > 0) {
        const description = this.extractChallengeDescription(text, challengeType as LifeChallenge['type']);
        const hermeticApproach = this.getHermeticApproachForChallenge(challengeType as LifeChallenge['type']);

        detectedChallenges.push({
          type: challengeType as LifeChallenge['type'],
          description,
          severity,
          hermeticApproach
        });
      }
    });

    return detectedChallenges;
  }

  /**
   * Assess spiritual level based on language and concepts used
   */
  assessSpiritualLevel(text: string, conversationHistory?: string[]): SpiritualLevel {
    const textLower = text.toLowerCase();
    const allText = conversationHistory ? [...conversationHistory, text].join(' ').toLowerCase() : textLower;

    let score = 20; // Base score for SEEKER
    const progression = {
      principlesStudied: [] as string[],
      practicesCompleted: 0,
      transformationScore: 0
    };

    // Check for spiritual level indicators
    Object.entries(this.spiritualLevelIndicators).forEach(([level, indicators]) => {
      const matches = indicators.filter(indicator => allText.includes(indicator));
      if (matches.length > 0) {
        switch (level) {
          case 'seeker':
            score = Math.max(score, 20);
            break;
          case 'student':
            score = Math.max(score, 40);
            break;
          case 'adept':
            score = Math.max(score, 70);
            break;
          case 'master':
            score = Math.max(score, 90);
            break;
        }
      }
    });

    // Check for hermetic principle knowledge
    const hermeticTerms = [
      'mentalism', 'correspondence', 'vibration', 'polarity', 'rhythm', 
      'causation', 'gender', 'as above so below', 'emerald tablet', 
      'hermes trismegistus', 'kybalion'
    ];

    hermeticTerms.forEach(term => {
      if (allText.includes(term)) {
        score += 5;
        progression.principlesStudied.push(term);
      }
    });

    // Check for practice indicators
    const practiceTerms = [
      'meditation', 'contemplation', 'visualization', 'affirmation',
      'practice', 'exercise', 'ritual', 'ceremony'
    ];

    practiceTerms.forEach(term => {
      if (allText.includes(term)) {
        score += 3;
        progression.practicesCompleted++;
      }
    });

    // Check for transformation language
    const transformationTerms = [
      'transformed', 'evolved', 'awakened', 'realized', 'embodied',
      'integrated', 'transcended', 'mastered'
    ];

    transformationTerms.forEach(term => {
      if (allText.includes(term)) {
        score += 2;
        progression.transformationScore++;
      }
    });

    // Cap score at 100
    score = Math.min(score, 100);

    // Determine level based on score
    let level: SpiritualLevel['level'];
    if (score >= 80) level = 'MASTER';
    else if (score >= 60) level = 'ADEPT';
    else if (score >= 35) level = 'STUDENT';
    else level = 'SEEKER';

    return {
      level,
      score,
      progression
    };
  }

  /**
   * Analyze conversation patterns for insights
   */
  analyzeConversationPatterns(history: UserContext['conversationHistory']): {
    recurringThemes: string[];
    emotionalProgression: string[];
    spiritualGrowthIndicators: string[];
    challengePatterns: string[];
  } {
    if (history.length === 0) {
      return {
        recurringThemes: [],
        emotionalProgression: [],
        spiritualGrowthIndicators: [],
        challengePatterns: []
      };
    }

    const userMessages = history.filter(msg => msg.role === 'user');
    const allText = userMessages.map(msg => msg.content).join(' ').toLowerCase();

    // Find recurring themes by analyzing word frequency
    const recurringThemes = this.extractRecurringThemes(userMessages);

    // Analyze emotional progression over time
    const emotionalProgression = this.analyzeEmotionalProgression(userMessages);

    // Look for spiritual growth indicators
    const spiritualGrowthIndicators = this.findSpiritualGrowthIndicators(userMessages);

    // Identify challenge patterns
    const challengePatterns = this.identifyChallengePatterns(userMessages);

    return {
      recurringThemes,
      emotionalProgression,
      spiritualGrowthIndicators,
      challengePatterns
    };
  }

  /**
   * Get contextual insights for response building
   */
  getContextualInsights(text: string, history?: UserContext['conversationHistory']): {
    needsCompassion: boolean;
    needsGuidance: boolean;
    needsEncouragement: boolean;
    needsGrounding: boolean;
    readinessForAdvancedTeaching: boolean;
    suggestedApproach: 'gentle' | 'direct' | 'challenging' | 'supportive';
  } {
    const emotionalState = this.analyzeEmotionalState(text, history?.map(h => h.content));
    const challenges = this.detectLifeChallenges(text);
    const spiritualLevel = this.assessSpiritualLevel(text, history?.map(h => h.content));

    const needsCompassion = !!(emotionalState && ['sad', 'anxious', 'lonely'].includes(emotionalState.primary));
    const needsGuidance = challenges.length > 0 || text.toLowerCase().includes('help') || text.toLowerCase().includes('guidance');
    const needsEncouragement = !!(emotionalState && emotionalState.intensity > 0.6 && ['sad', 'confused', 'anxious'].includes(emotionalState.primary));
    const needsGrounding = !!(emotionalState && ['excited', 'anxious', 'confused'].includes(emotionalState.primary));
    const readinessForAdvancedTeaching = spiritualLevel.level === 'ADEPT' || spiritualLevel.level === 'MASTER';

    let suggestedApproach: 'gentle' | 'direct' | 'challenging' | 'supportive';

    if (needsCompassion || needsEncouragement) {
      suggestedApproach = 'gentle';
    } else if (readinessForAdvancedTeaching && !needsGuidance) {
      suggestedApproach = 'challenging';
    } else if (needsGuidance || challenges.length > 0) {
      suggestedApproach = 'supportive';
    } else {
      suggestedApproach = 'direct';
    }

    return {
      needsCompassion,
      needsGuidance,
      needsEncouragement,
      needsGrounding,
      readinessForAdvancedTeaching,
      suggestedApproach
    };
  }

  // Private helper methods

  private extractEmotionalContext(text: string, emotion: string): string {
    // Extract a relevant snippet that provides context for the emotion
    const sentences = text.split(/[.!?]+/);
    const emotionKeywords = this.emotionKeywords[emotion];
    
    if (!emotionKeywords) return text.substring(0, 100);

    const allKeywords = [
      ...emotionKeywords.positive,
      ...emotionKeywords.negative,
      ...emotionKeywords.intensity
    ];

    // Find sentence containing emotional keywords
    for (const sentence of sentences) {
      for (const keyword of allKeywords) {
        if (sentence.toLowerCase().includes(keyword)) {
          return sentence.trim() || text.substring(0, 100);
        }
      }
    }

    return text.substring(0, 100);
  }

  private extractChallengeDescription(text: string, challengeType: LifeChallenge['type']): string {
    const indicators = this.challengeIndicators[challengeType];
    const sentences = text.split(/[.!?]+/);

    // Find sentence containing challenge indicators
    for (const sentence of sentences) {
      for (const indicator of indicators) {
        if (sentence.toLowerCase().includes(indicator)) {
          return sentence.trim() || `Challenge related to ${challengeType}`;
        }
      }
    }

    return `Challenge related to ${challengeType}`;
  }

  private getHermeticApproachForChallenge(challengeType: LifeChallenge['type']): string[] {
    const approaches: Record<LifeChallenge['type'], string[]> = {
      relationship: ['Apply the Principle of Correspondence to understand how outer relationships mirror inner state', 'Use the Principle of Polarity to transmute conflict into harmony'],
      career: ['Apply the Principle of Mentalism to visualize desired career outcomes', 'Use the Principle of Causation to plant seeds for future success'],
      health: ['Apply the Principle of Correspondence between mind and body', 'Use the Principle of Vibration to raise healing frequencies'],
      spiritual: ['Study the Seven Hermetic Principles systematically', 'Practice daily contemplation and meditation'],
      financial: ['Apply the Principle of Causation to understand money patterns', 'Use the Principle of Mentalism to transform scarcity consciousness'],
      family: ['Apply the Principle of Rhythm to understand generational patterns', 'Use the Principle of Polarity to transform inherited wounds'],
      purpose: ['Apply the Principle of Mentalism to connect with higher purpose', 'Use the Principle of Correspondence to align inner calling with outer expression']
    };

    return approaches[challengeType] || ['Apply universal hermetic principles to transform this challenge'];
  }

  private extractRecurringThemes(messages: Array<{ content: string }>): string[] {
    // Simple word frequency analysis to find recurring themes
    const wordFreq: Record<string, number> = {};
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'i', 'you', 'it', 'is', 'am', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);

    messages.forEach(msg => {
      const words = msg.content.toLowerCase().match(/\b\w+\b/g) || [];
      words.forEach(word => {
        if (word.length > 3 && !stopWords.has(word)) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });
    });

    return Object.entries(wordFreq)
      .filter(([_, count]) => count >= 2)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([word, _]) => word);
  }

  private analyzeEmotionalProgression(messages: Array<{ content: string; timestamp: Date }>): string[] {
    const progression: string[] = [];
    
    messages.forEach(msg => {
      const emotion = this.analyzeEmotionalState(msg.content);
      if (emotion) {
        progression.push(emotion.primary);
      }
    });

    return progression;
  }

  private findSpiritualGrowthIndicators(messages: Array<{ content: string }>): string[] {
    const growthIndicators = [
      'understanding', 'clarity', 'insight', 'realization', 'breakthrough',
      'healing', 'transformation', 'growth', 'evolution', 'awakening',
      'integration', 'embodiment', 'practice', 'discipline', 'wisdom'
    ];

    const found = new Set<string>();

    messages.forEach(msg => {
      const textLower = msg.content.toLowerCase();
      growthIndicators.forEach(indicator => {
        if (textLower.includes(indicator)) {
          found.add(indicator);
        }
      });
    });

    return Array.from(found);
  }

  private identifyChallengePatterns(messages: Array<{ content: string }>): string[] {
    const patterns: Record<string, number> = {};

    messages.forEach(msg => {
      const challenges = this.detectLifeChallenges(msg.content);
      challenges.forEach(challenge => {
        patterns[challenge.type] = (patterns[challenge.type] || 0) + 1;
      });
    });

    return Object.entries(patterns)
      .filter(([_, count]) => count >= 2)
      .sort(([_, a], [__, b]) => b - a)
      .map(([type, _]) => type);
  }
}