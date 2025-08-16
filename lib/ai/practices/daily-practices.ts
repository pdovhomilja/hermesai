import { DailyPractice, SpiritualLevel } from '../types';

/**
 * DailyPracticesLibrary
 * 
 * A comprehensive library of spiritual practices rooted in hermetic tradition,
 * organized by principle, difficulty level, and spiritual focus areas.
 * 
 * These practices help seekers embody hermetic wisdom in daily life,
 * progressing from simple awareness exercises to advanced transformative work.
 */
export class DailyPracticesLibrary {
  private static instance: DailyPracticesLibrary;
  private practices: DailyPractice[];

  constructor() {
    this.practices = this.initializePractices();
  }

  static getInstance(): DailyPracticesLibrary {
    if (!this.instance) {
      this.instance = new DailyPracticesLibrary();
    }
    return this.instance;
  }

  /**
   * Get practices filtered by criteria
   */
  getPractices(filters?: {
    principle?: string;
    difficulty?: DailyPractice['difficulty'];
    maxDuration?: number;
    focus?: string;
  }): DailyPractice[] {
    let filteredPractices = [...this.practices];

    if (filters?.principle) {
      filteredPractices = filteredPractices.filter(p => 
        p.principle === filters.principle
      );
    }

    if (filters?.difficulty) {
      filteredPractices = filteredPractices.filter(p => 
        p.difficulty === filters.difficulty
      );
    }

    if (filters?.maxDuration) {
      filteredPractices = filteredPractices.filter(p => 
        this.parseDuration(p.duration) <= filters.maxDuration!
      );
    }

    if (filters?.focus) {
      const focusLower = filters.focus.toLowerCase();
      filteredPractices = filteredPractices.filter(p => 
        p.name.toLowerCase().includes(focusLower) ||
        p.description.toLowerCase().includes(focusLower) ||
        p.benefits.some(b => b.toLowerCase().includes(focusLower))
      );
    }

    return filteredPractices;
  }

  /**
   * Get personalized practice recommendations
   */
  getPersonalizedPractices(
    spiritualLevel: SpiritualLevel,
    availableTime: number,
    focus?: string[]
  ): DailyPractice[] {
    const difficulty = this.mapSpiritualLevelToDifficulty(spiritualLevel);
    
    let candidates = this.getPractices({
      difficulty,
      maxDuration: availableTime,
    });

    // If focus areas specified, prioritize those
    if (focus && focus.length > 0) {
      const focusedPractices = candidates.filter(p =>
        focus.some(f => 
          p.name.toLowerCase().includes(f.toLowerCase()) ||
          p.description.toLowerCase().includes(f.toLowerCase()) ||
          p.principle.toLowerCase().includes(f.toLowerCase())
        )
      );
      
      if (focusedPractices.length > 0) {
        candidates = focusedPractices;
      }
    }

    // Ensure variety in principles
    const selectedPractices: DailyPractice[] = [];
    const usedPrinciples = new Set<string>();

    // First pass: one practice per principle
    for (const practice of candidates) {
      if (!usedPrinciples.has(practice.principle) && selectedPractices.length < 5) {
        selectedPractices.push(practice);
        usedPrinciples.add(practice.principle);
      }
    }

    // Second pass: fill remaining slots
    for (const practice of candidates) {
      if (selectedPractices.length >= 5) break;
      if (!selectedPractices.includes(practice)) {
        selectedPractices.push(practice);
      }
    }

    return selectedPractices.slice(0, 5);
  }

  /**
   * Get practice by ID
   */
  getPracticeById(id: string): DailyPractice | undefined {
    return this.practices.find(p => p.id === id);
  }

  /**
   * Get practices by principle
   */
  getPracticesByPrinciple(principle: string): DailyPractice[] {
    return this.practices.filter(p => p.principle === principle);
  }

  /**
   * Get random practice for daily inspiration
   */
  getRandomPractice(difficulty?: DailyPractice['difficulty']): DailyPractice {
    const candidates = difficulty 
      ? this.practices.filter(p => p.difficulty === difficulty)
      : this.practices;
    
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }

  /**
   * Initialize all practices
   */
  private initializePractices(): DailyPractice[] {
    return [
      // MENTALISM PRACTICES
      {
        id: 'thought-watching',
        name: 'Thought Watching Meditation',
        description: 'Observe the flow of thoughts without attachment or judgment',
        difficulty: 'beginner',
        duration: '10-15 minutes',
        principle: 'mentalism',
        steps: [
          'Sit comfortably with eyes closed',
          'Simply watch thoughts arise and pass away',
          'Don\'t judge or engage with thoughts',
          'When you notice you\'re thinking, gently return to watching',
          'End by appreciating the awareness that watches thoughts'
        ],
        benefits: [
          'Increased mental clarity',
          'Reduced mental chatter',
          'Greater emotional stability',
          'Enhanced self-awareness'
        ],
        variations: [
          'Count breaths while watching thoughts',
          'Label thoughts as "thinking" and return to breath',
          'Use a meditation timer with gentle bells'
        ]
      },
      {
        id: 'reality-creation',
        name: 'Conscious Reality Creation',
        description: 'Practice deliberate creation through focused intention',
        difficulty: 'intermediate',
        duration: '20-25 minutes',
        principle: 'mentalism',
        steps: [
          'Set clear intention for what you want to create',
          'Visualize desired outcome in vivid detail',
          'Feel the emotions of already having achieved it',
          'Release attachment to how it will manifest',
          'Take one inspired action toward the goal',
          'Express gratitude as if it has already happened'
        ],
        benefits: [
          'Enhanced manifestation abilities',
          'Clearer life direction',
          'Increased personal power',
          'Better goal achievement'
        ]
      },
      {
        id: 'mind-mastery',
        name: 'Advanced Mind Mastery',
        description: 'Train the mind to create and dissolve reality constructs at will',
        difficulty: 'advanced',
        duration: '30-45 minutes',
        principle: 'mentalism',
        steps: [
          'Enter deep meditative state',
          'Create a detailed mental object (like a flower)',
          'Sustain it clearly for several minutes',
          'Gradually dissolve it back into emptiness',
          'Create multiple objects and arrange them',
          'Practice switching between different reality constructs',
          'Rest in the awareness that creates all mental forms'
        ],
        benefits: [
          'Complete mental mastery',
          'Ability to reshape reality',
          'Freedom from limiting beliefs',
          'Direct experience of mind\'s creative power'
        ]
      },

      // CORRESPONDENCE PRACTICES
      {
        id: 'mirror-practice',
        name: 'Daily Mirror Practice',
        description: 'Recognize correspondences between inner and outer worlds',
        difficulty: 'beginner',
        duration: '5-10 minutes',
        principle: 'correspondence',
        steps: [
          'Choose one external situation that bothers you',
          'Ask: "How does this mirror something inside me?"',
          'Look for the inner correspondence without judgment',
          'Send love to both the outer situation and inner pattern',
          'Commit to changing the inner pattern'
        ],
        benefits: [
          'Increased self-awareness',
          'Reduced blame and reactivity',
          'Greater personal responsibility',
          'Improved relationships'
        ]
      },
      {
        id: 'pattern-recognition',
        name: 'Pattern Recognition Meditation',
        description: 'Identify and work with recurring life patterns',
        difficulty: 'intermediate',
        duration: '20-30 minutes',
        principle: 'correspondence',
        steps: [
          'Review recent challenges and conflicts',
          'Look for similar patterns across different life areas',
          'Identify the core theme or lesson',
          'Find the corresponding inner belief or wound',
          'Visualize healing and transforming this pattern',
          'Set intention to respond differently next time'
        ],
        benefits: [
          'Breaking negative cycles',
          'Accelerated personal growth',
          'Deeper self-understanding',
          'Improved life outcomes'
        ]
      },
      {
        id: 'cosmic-correspondence',
        name: 'Cosmic Correspondence Work',
        description: 'Work directly with macro-micro correspondences',
        difficulty: 'advanced',
        duration: '45-60 minutes',
        principle: 'correspondence',
        steps: [
          'Study the current astrological transits',
          'Identify how these cosmic patterns reflect in your life',
          'Find the corresponding patterns in your body and psyche',
          'Work with meditation to align with beneficial influences',
          'Use sacred geometry to understand universal patterns',
          'Apply cosmic wisdom to transform personal challenges'
        ],
        benefits: [
          'Cosmic consciousness',
          'Perfect timing in life decisions',
          'Harmony with natural cycles',
          'Deep universal understanding'
        ]
      },

      // VIBRATION PRACTICES
      {
        id: 'vibrational-tuning',
        name: 'Daily Vibrational Tuning',
        description: 'Consciously raise and maintain your energetic vibration',
        difficulty: 'beginner',
        duration: '10-15 minutes',
        principle: 'vibration',
        steps: [
          'Sit quietly and tune into your current energy state',
          'Rate your vibration from 1-10',
          'Choose an activity that raises your vibration (gratitude, joy, love)',
          'Focus on this positive emotion for several minutes',
          'Notice the shift in your energy field',
          'Set intention to maintain this higher vibration'
        ],
        benefits: [
          'Higher daily energy levels',
          'Increased emotional resilience',
          'Better circumstances and opportunities',
          'Enhanced overall wellbeing'
        ]
      },
      {
        id: 'sound-healing',
        name: 'Sound Healing Practice',
        description: 'Use vocal toning and mantras to heal and transform',
        difficulty: 'intermediate',
        duration: '20-30 minutes',
        principle: 'vibration',
        steps: [
          'Begin with deep breathing to center yourself',
          'Start with the sound "AH" from your heart center',
          'Allow the sound to resonate through your entire body',
          'Move through other healing sounds (OM, HUM, etc.)',
          'Direct sound to areas needing healing',
          'End in silence, feeling the vibrational harmony'
        ],
        benefits: [
          'Physical and emotional healing',
          'Increased energetic sensitivity',
          'Chakra balancing and alignment',
          'Deep inner peace and harmony'
        ]
      },
      {
        id: 'frequency-mastery',
        name: 'Frequency Mastery Training',
        description: 'Master the ability to shift vibration consciously',
        difficulty: 'advanced',
        duration: '30-45 minutes',
        principle: 'vibration',
        steps: [
          'Attune to the vibration of different emotions',
          'Practice rapidly shifting between high and low frequencies',
          'Learn to hold multiple frequencies simultaneously',
          'Practice transmuting others\' energies through resonance',
          'Work with planetary and cosmic frequencies',
          'Master the art of vibrational healing'
        ],
        benefits: [
          'Complete energetic mastery',
          'Ability to heal others through resonance',
          'Immunity to negative energies',
          'Access to higher dimensional frequencies'
        ]
      },

      // POLARITY PRACTICES
      {
        id: 'shadow-integration',
        name: 'Shadow Integration Work',
        description: 'Embrace and integrate rejected aspects of self',
        difficulty: 'beginner',
        duration: '15-20 minutes',
        principle: 'polarity',
        steps: [
          'Think of someone who really irritates you',
          'Identify the specific trait that bothers you',
          'Look for this same trait within yourself',
          'Find the positive aspect of this trait',
          'Send love to both the outer person and inner aspect',
          'Thank this aspect for its gifts and teachings'
        ],
        benefits: [
          'Increased wholeness and self-acceptance',
          'Reduced judgment of others',
          'Access to rejected strengths',
          'Greater emotional balance'
        ]
      },
      {
        id: 'polarity-balancing',
        name: 'Advanced Polarity Balancing',
        description: 'Balance opposing forces within consciousness',
        difficulty: 'intermediate',
        duration: '25-35 minutes',
        principle: 'polarity',
        steps: [
          'Identify a current internal conflict or tension',
          'Clearly define both sides of the polarity',
          'Fully experience and express each side',
          'Look for the underlying unity behind the opposition',
          'Find the higher perspective that includes both',
          'Rest in the balanced center point'
        ],
        benefits: [
          'Resolution of inner conflicts',
          'Increased mental flexibility',
          'Access to paradoxical thinking',
          'Enhanced problem-solving abilities'
        ]
      },
      {
        id: 'polarity-transcendence',
        name: 'Polarity Transcendence Meditation',
        description: 'Transcend duality and rest in non-dual awareness',
        difficulty: 'advanced',
        duration: '40-60 minutes',
        principle: 'polarity',
        steps: [
          'Contemplate pairs of opposites (hot/cold, good/evil, etc.)',
          'See how each defines and creates the other',
          'Find the consciousness that observes both',
          'Rest in the awareness prior to all polarities',
          'Recognize the absolute that includes all relatives',
          'Live from this unified perspective'
        ],
        benefits: [
          'Non-dual realization',
          'Freedom from mental suffering',
          'Unified perspective on all life',
          'Compassionate response to all beings'
        ]
      },

      // RHYTHM PRACTICES
      {
        id: 'natural-rhythm-alignment',
        name: 'Natural Rhythm Alignment',
        description: 'Align your daily rhythms with natural cycles',
        difficulty: 'beginner',
        duration: '5-10 minutes',
        principle: 'rhythm',
        steps: [
          'Notice the current phase of the moon',
          'Reflect on your energy levels today',
          'Identify if you\'re in an expansion or contraction phase',
          'Plan activities that match your current rhythm',
          'Honor both active and receptive periods',
          'Express gratitude for natural timing'
        ],
        benefits: [
          'Increased energy efficiency',
          'Better work-life balance',
          'Reduced resistance to life changes',
          'Enhanced intuitive timing'
        ]
      },
      {
        id: 'cycle-mastery',
        name: 'Life Cycle Mastery',
        description: 'Consciously work with major life rhythms and transitions',
        difficulty: 'intermediate',
        duration: '20-30 minutes',
        principle: 'rhythm',
        steps: [
          'Identify which life cycle you\'re currently in',
          'Understand the gifts and challenges of this phase',
          'Release resistance to your current rhythm',
          'Prepare consciously for the next phase',
          'Find the lesson and growth opportunity in this cycle',
          'Align your actions with natural timing'
        ],
        benefits: [
          'Smoother life transitions',
          'Reduced suffering during difficult phases',
          'Optimal timing for major decisions',
          'Greater life satisfaction'
        ]
      },
      {
        id: 'rhythm-mastery',
        name: 'Advanced Rhythm Mastery',
        description: 'Master the ability to ride life\'s rhythms consciously',
        difficulty: 'advanced',
        duration: '45-60 minutes',
        principle: 'rhythm',
        steps: [
          'Attune to multiple rhythmic cycles simultaneously',
          'Practice rising above the swing of the pendulum',
          'Learn to generate your own rhythmic stability',
          'Master the art of perfect timing',
          'Use rhythm to create desired outcomes',
          'Teach others to work with natural rhythms'
        ],
        benefits: [
          'Freedom from rhythmic unconsciousness',
          'Ability to help others with timing',
          'Mastery over life circumstances',
          'Perfect synchronicity with universal rhythms'
        ]
      },

      // CAUSATION PRACTICES
      {
        id: 'cause-effect-awareness',
        name: 'Cause and Effect Awareness',
        description: 'Develop awareness of the causal chains in your life',
        difficulty: 'beginner',
        duration: '10-15 minutes',
        principle: 'causation',
        steps: [
          'Choose one current situation in your life',
          'Trace backwards to identify the causes',
          'Look at your thoughts, choices, and actions that led here',
          'Take responsibility without self-judgment',
          'Plant new causes for desired effects',
          'Take one conscious action aligned with your desired outcome'
        ],
        benefits: [
          'Increased personal responsibility',
          'Better decision-making abilities',
          'Reduced victimhood mentality',
          'Greater sense of personal power'
        ]
      },
      {
        id: 'karmic-clearing',
        name: 'Karmic Pattern Clearing',
        description: 'Clear negative karmic patterns and create positive ones',
        difficulty: 'intermediate',
        duration: '25-35 minutes',
        principle: 'causation',
        steps: [
          'Identify a repeating negative pattern in your life',
          'Trace it back to its original causal moment if possible',
          'Take full responsibility and feel genuine remorse if needed',
          'Send forgiveness to all involved, including yourself',
          'Commit to different choices and actions going forward',
          'Plant seeds of positive karma through loving action'
        ],
        benefits: [
          'Freedom from repetitive negative patterns',
          'Accelerated spiritual evolution',
          'Improved relationships and circumstances',
          'Clear conscience and inner peace'
        ]
      },
      {
        id: 'causation-mastery',
        name: 'Causation Mastery Practice',
        description: 'Become a conscious cause rather than unconscious effect',
        difficulty: 'advanced',
        duration: '40-60 minutes',
        principle: 'causation',
        steps: [
          'Rise above the plane of effects through meditation',
          'Identify where you are still unconscious effect',
          'Claim your power as conscious cause in all life areas',
          'Practice creating effects through mental causation',
          'Work with karmic patterns across multiple lifetimes',
          'Serve as agent of higher causes in the world'
        ],
        benefits: [
          'Complete personal sovereignty',
          'Ability to manifest desired realities',
          'Freedom from karmic bondage',
          'Service to universal evolution'
        ]
      },

      // GENDER PRACTICES
      {
        id: 'inner-balance',
        name: 'Inner Masculine-Feminine Balance',
        description: 'Balance the masculine and feminine principles within',
        difficulty: 'beginner',
        duration: '15-20 minutes',
        principle: 'gender',
        steps: [
          'Sit quietly and connect with your inner masculine energy (active, focused, structured)',
          'Feel its strength, clarity, and purposeful action',
          'Now connect with your inner feminine energy (receptive, intuitive, flowing)',
          'Feel its wisdom, compassion, and creative power',
          'Bring both energies into balance within your heart',
          'Set intention to honor both aspects in daily life'
        ],
        benefits: [
          'Greater wholeness and completeness',
          'Improved relationships with all genders',
          'Enhanced creativity and problem-solving',
          'Reduced internal conflict'
        ]
      },
      {
        id: 'creative-union',
        name: 'Sacred Creative Union',
        description: 'Unite inner masculine and feminine for creative manifestation',
        difficulty: 'intermediate',
        duration: '30-40 minutes',
        principle: 'gender',
        steps: [
          'Identify something you want to create or manifest',
          'Connect with masculine planning and action energy',
          'Create clear structure and take concrete steps',
          'Now connect with feminine receptivity and intuition',
          'Allow inspiration and creativity to flow',
          'Unite both energies in the act of creation',
          'Birth your creation through balanced action and receptivity'
        ],
        benefits: [
          'Enhanced creative abilities',
          'More successful manifestation',
          'Balanced approach to achievement',
          'Deeper satisfaction in accomplishments'
        ]
      },
      {
        id: 'hieros-gamos',
        name: 'Hieros Gamos (Sacred Marriage)',
        description: 'Achieve the sacred marriage of opposites within',
        difficulty: 'advanced',
        duration: '60-90 minutes',
        principle: 'gender',
        steps: [
          'Enter deep meditative state',
          'Invoke your inner divine masculine (solar, active principle)',
          'Invoke your inner divine feminine (lunar, receptive principle)',
          'Allow them to dance together in perfect harmony',
          'Experience their sacred union as divine love',
          'Rest in the unified consciousness that emerges',
          'Embody this divine union in all life activities'
        ],
        benefits: [
          'Divine union consciousness',
          'Complete inner wholeness',
          'Transcendence of gender limitations',
          'Embodiment of divine love'
        ]
      },

      // INTEGRATION PRACTICES
      {
        id: 'seven-principles-review',
        name: 'Seven Principles Integration',
        description: 'Daily review and application of all hermetic principles',
        difficulty: 'intermediate',
        duration: '20-25 minutes',
        principle: 'integration',
        steps: [
          'Review each of the seven principles briefly',
          'Identify how each appeared in your day',
          'Choose one principle to focus on tomorrow',
          'Set specific intention for applying this principle',
          'Appreciate the interconnectedness of all principles',
          'Rest in the unity underlying all diversity'
        ],
        benefits: [
          'Integrated spiritual understanding',
          'Consistent spiritual growth',
          'Practical wisdom application',
          'Holistic life transformation'
        ]
      },
      {
        id: 'emerald-tablet-contemplation',
        name: 'Emerald Tablet Contemplation',
        description: 'Deep contemplation of the Emerald Tablet teachings',
        difficulty: 'advanced',
        duration: '45-60 minutes',
        principle: 'integration',
        steps: [
          'Read one section of the Emerald Tablet slowly',
          'Contemplate its meaning on multiple levels',
          'Look for personal applications and insights',
          'Feel the resonance of truth in your being',
          'Allow deeper understanding to emerge naturally',
          'Integrate the wisdom into your daily life'
        ],
        benefits: [
          'Direct transmission of ancient wisdom',
          'Profound spiritual insights',
          'Connection to hermetic lineage',
          'Transformation through truth'
        ]
      }
    ];
  }

  /**
   * Parse duration string to minutes
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 15;
  }

  /**
   * Map spiritual level to practice difficulty
   */
  private mapSpiritualLevelToDifficulty(level: SpiritualLevel): DailyPractice['difficulty'] {
    switch (level.level) {
      case 'SEEKER':
        return 'beginner';
      case 'STUDENT':
        return 'intermediate';
      case 'ADEPT':
      case 'MASTER':
        return 'advanced';
      default:
        return 'beginner';
    }
  }

  /**
   * Get all available principles
   */
  getAvailablePrinciples(): string[] {
    const principles = new Set(this.practices.map(p => p.principle));
    return Array.from(principles);
  }

  /**
   * Get practices statistics
   */
  getStatistics(): {
    totalPractices: number;
    byDifficulty: Record<string, number>;
    byPrinciple: Record<string, number>;
    averageDuration: number;
  } {
    const byDifficulty: Record<string, number> = {};
    const byPrinciple: Record<string, number> = {};
    let totalDuration = 0;

    this.practices.forEach(practice => {
      byDifficulty[practice.difficulty] = (byDifficulty[practice.difficulty] || 0) + 1;
      byPrinciple[practice.principle] = (byPrinciple[practice.principle] || 0) + 1;
      totalDuration += this.parseDuration(practice.duration);
    });

    return {
      totalPractices: this.practices.length,
      byDifficulty,
      byPrinciple,
      averageDuration: Math.round(totalDuration / this.practices.length),
    };
  }
}