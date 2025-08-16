import { LifeChallenge, TransformationGuidance, DailyPractice, SpiritualLevel } from '../types';
import { HermeticKnowledge } from '../knowledge/hermetic-principles';

/**
 * TransformationGuidanceSystem
 * 
 * Provides hermetic approaches to life transformation, helping users navigate
 * challenges through the application of ancient wisdom principles.
 * 
 * This system embodies the core hermetic teaching: "As above, so below" -
 * connecting universal principles to personal transformation.
 */
export class TransformationGuidanceSystem {
  private static instance: TransformationGuidanceSystem;
  private hermeticKnowledge: HermeticKnowledge;

  constructor() {
    this.hermeticKnowledge = HermeticKnowledge.getInstance();
  }

  static getInstance(): TransformationGuidanceSystem {
    if (!this.instance) {
      this.instance = new TransformationGuidanceSystem();
    }
    return this.instance;
  }

  /**
   * Generate comprehensive transformation guidance for a life challenge
   */
  generateGuidance(challenge: LifeChallenge, spiritualLevel: SpiritualLevel): TransformationGuidance {
    const hermeticApproach = this.buildHermeticApproach(challenge, spiritualLevel);
    const practices = this.selectPractices(challenge, spiritualLevel);
    const mantras = this.generateMantras(challenge);
    const affirmations = this.generateAffirmations(challenge);
    const timeline = this.estimateTimeline(challenge);
    const milestones = this.defineMilestones(challenge);

    return {
      challenge,
      hermeticApproach,
      practices,
      mantras,
      affirmations,
      timeline,
      milestones,
    };
  }

  /**
   * Build hermetic approach explanation
   */
  private buildHermeticApproach(challenge: LifeChallenge, spiritualLevel: SpiritualLevel): string {
    const relevantPrinciples = this.hermeticKnowledge.findRelevantPrinciples(
      challenge.type,
      challenge.description
    );

    const approaches = relevantPrinciples.map(principleName => {
      const principle = this.hermeticKnowledge.getPrinciple(principleName);
      if (!principle) return null;

      const level = this.getSpiritualLevelKey(spiritualLevel);
      const explanation = principle.levels[level];
      const applications = principle.applications.filter(app => 
        this.isApplicationRelevant(app, challenge.type)
      );

      return {
        principle: principle.name,
        explanation,
        applications,
      };
    }).filter(Boolean);

    let approachText = `Through the lens of hermetic wisdom, your ${challenge.type} challenge can be transformed using these universal principles:\n\n`;

    approaches.forEach((approach, index) => {
      if (!approach) return;
      
      approachText += `**${approach.principle}**\n`;
      approachText += `${approach.explanation}\n\n`;
      
      if (approach.applications.length > 0) {
        approachText += `*Practical Application:* ${approach.applications[0]}\n\n`;
      }
    });

    // Add overall transformation philosophy
    approachText += this.getTransformationPhilosophy(challenge);

    return approachText;
  }

  /**
   * Select appropriate practices for the challenge
   */
  private selectPractices(challenge: LifeChallenge, spiritualLevel: SpiritualLevel): DailyPractice[] {
    const challengeType = challenge.type;
    const difficulty = this.getPracticeDifficulty(spiritualLevel);
    
    // Get base practices for challenge type
    const basePractices = this.getChallengeBasePractices(challengeType, difficulty);
    
    // Add principle-specific practices
    const relevantPrinciples = this.hermeticKnowledge.findRelevantPrinciples(challengeType, challenge.description);
    const principlePractices = this.getPrinciplePractices(relevantPrinciples, difficulty);
    
    // Combine and select most appropriate practices
    const allPractices = [...basePractices, ...principlePractices];
    
    // Select 3-5 practices based on severity
    const practiceCount = challenge.severity === 'critical' ? 5 : 
                         challenge.severity === 'major' ? 4 : 3;
    
    return allPractices.slice(0, practiceCount);
  }

  /**
   * Get base practices for each challenge type
   */
  private getChallengeBasePractices(challengeType: LifeChallenge['type'], difficulty: DailyPractice['difficulty']): DailyPractice[] {
    const practiceLibrary: Record<string, DailyPractice[]> = {
      relationship: [
        {
          id: 'mirror-meditation',
          name: 'Mirror of Relationships',
          description: 'Meditate on how your inner state reflects in your relationships',
          difficulty,
          duration: '15-20 minutes',
          principle: 'correspondence',
          steps: [
            'Sit quietly and reflect on a challenging relationship',
            'Ask: "What aspect of myself does this person mirror?"',
            'Observe without judgment, simply noting patterns',
            'Send loving-kindness to both yourself and the other person',
            'Commit to one small change in your own behavior'
          ],
          benefits: [
            'Increased self-awareness',
            'Improved relationship dynamics',
            'Reduced conflict and reactivity',
            'Greater compassion for others'
          ]
        },
        {
          id: 'heart-center-balance',
          name: 'Heart Center Balancing',
          description: 'Balance giving and receiving energies in relationships',
          difficulty,
          duration: '10-15 minutes',
          principle: 'gender',
          steps: [
            'Place hands on heart center',
            'Breathe in receiving energy (feminine principle)',
            'Breathe out giving energy (masculine principle)',
            'Feel the balance between giving and receiving',
            'Set intention for balanced relationships'
          ],
          benefits: [
            'Balanced relationship dynamics',
            'Healthier boundaries',
            'Increased emotional harmony',
            'Better communication skills'
          ]
        }
      ],
      career: [
        {
          id: 'purpose-alignment',
          name: 'Purpose Alignment Practice',
          description: 'Connect your work with your higher purpose',
          difficulty,
          duration: '20-25 minutes',
          principle: 'mentalism',
          steps: [
            'Reflect on your core values and gifts',
            'Visualize your ideal contribution to the world',
            'Identify alignment between current work and purpose',
            'Create mental image of purposeful career path',
            'Take one concrete action toward alignment'
          ],
          benefits: [
            'Increased career satisfaction',
            'Clearer sense of direction',
            'Better work-life integration',
            'Enhanced motivation and focus'
          ]
        },
        {
          id: 'abundance-cultivation',
          name: 'Abundance Cultivation',
          description: 'Transform scarcity mindset into abundance consciousness',
          difficulty,
          duration: '15-20 minutes',
          principle: 'causation',
          steps: [
            'Identify limiting beliefs about money and success',
            'Recognize the causes behind current career situation',
            'Plant new mental seeds through visualization',
            'Express gratitude for current opportunities',
            'Take inspired action toward desired outcomes'
          ],
          benefits: [
            'Improved financial mindset',
            'Increased opportunities',
            'Greater confidence in abilities',
            'Enhanced prosperity consciousness'
          ]
        }
      ],
      health: [
        {
          id: 'body-mind-harmony',
          name: 'Body-Mind Harmony',
          description: 'Align physical and mental states for optimal health',
          difficulty,
          duration: '20-30 minutes',
          principle: 'correspondence',
          steps: [
            'Scan your body for areas of tension or discomfort',
            'Ask what emotional or mental pattern this represents',
            'Send healing light and love to these areas',
            'Visualize perfect health and vitality',
            'Make one healthy choice for your body today'
          ],
          benefits: [
            'Improved body awareness',
            'Better stress management',
            'Enhanced healing capacity',
            'Increased vitality and energy'
          ]
        },
        {
          id: 'vibrational-healing',
          name: 'Vibrational Healing Practice',
          description: 'Raise your body\'s healing vibration through conscious intent',
          difficulty,
          duration: '15-25 minutes',
          principle: 'vibration',
          steps: [
            'Sit comfortably and tune into your body\'s energy',
            'Identify areas that feel heavy or blocked',
            'Imagine golden healing light filling these areas',
            'Raise your vibration through joy, gratitude, or love',
            'Maintain this high vibration throughout the day'
          ],
          benefits: [
            'Accelerated healing processes',
            'Increased energy levels',
            'Better immune function',
            'Enhanced overall wellbeing'
          ]
        }
      ],
      spiritual: [
        {
          id: 'principle-integration',
          name: 'Daily Principle Integration',
          description: 'Integrate hermetic principles into daily awareness',
          difficulty,
          duration: '10-15 minutes',
          principle: 'mentalism',
          steps: [
            'Choose one hermetic principle to focus on today',
            'Read its description and contemplate its meaning',
            'Look for examples of this principle throughout your day',
            'Apply the principle to a current challenge',
            'Journal insights and observations'
          ],
          benefits: [
            'Deeper spiritual understanding',
            'Practical wisdom application',
            'Increased consciousness',
            'Enhanced spiritual growth'
          ]
        },
        {
          id: 'inner-temple',
          name: 'Inner Temple Meditation',
          description: 'Create and visit your sacred inner space',
          difficulty,
          duration: '20-30 minutes',
          principle: 'correspondence',
          steps: [
            'Close eyes and imagine entering a sacred temple within',
            'Design this space with symbols meaningful to you',
            'Meet your inner wisdom guide (perhaps Hermes himself)',
            'Ask for guidance on your spiritual path',
            'Receive and remember the wisdom shared'
          ],
          benefits: [
            'Direct spiritual guidance',
            'Enhanced intuition',
            'Deeper self-connection',
            'Access to inner wisdom'
          ]
        }
      ],
      financial: [
        {
          id: 'prosperity-consciousness',
          name: 'Prosperity Consciousness Building',
          description: 'Transform relationship with money and abundance',
          difficulty,
          duration: '15-20 minutes',
          principle: 'causation',
          steps: [
            'Examine your current beliefs about money',
            'Identify the causes of your financial situation',
            'Plant seeds of new prosperity thoughts',
            'Feel genuine gratitude for current resources',
            'Take one practical action toward financial goals'
          ],
          benefits: [
            'Improved money mindset',
            'Better financial decisions',
            'Increased abundance flow',
            'Enhanced financial wisdom'
          ]
        }
      ],
      family: [
        {
          id: 'ancestral-healing',
          name: 'Ancestral Pattern Healing',
          description: 'Transform inherited family patterns with love and wisdom',
          difficulty,
          duration: '25-30 minutes',
          principle: 'rhythm',
          steps: [
            'Reflect on family patterns you want to transform',
            'Send love and forgiveness to family members',
            'Visualize breaking negative cycles with compassion',
            'Plant seeds of new, healthy family dynamics',
            'Commit to being the change you wish to see'
          ],
          benefits: [
            'Healed family relationships',
            'Broken negative patterns',
            'Increased family harmony',
            'Enhanced emotional freedom'
          ]
        }
      ],
      purpose: [
        {
          id: 'soul-purpose-discovery',
          name: 'Soul Purpose Discovery',
          description: 'Connect with your deeper life purpose and meaning',
          difficulty,
          duration: '30-40 minutes',
          principle: 'mentalism',
          steps: [
            'Enter deep meditation or contemplative state',
            'Ask your soul: "Why did I choose this lifetime?"',
            'Listen without forcing, allowing answers to emerge',
            'Feel the resonance of your true purpose',
            'Commit to one action aligned with this purpose'
          ],
          benefits: [
            'Clear life direction',
            'Increased motivation',
            'Aligned life choices',
            'Enhanced sense of meaning'
          ]
        }
      ]
    };

    return practiceLibrary[challengeType] || practiceLibrary.spiritual;
  }

  /**
   * Get practices specific to hermetic principles
   */
  private getPrinciplePractices(principles: string[], difficulty: DailyPractice['difficulty']): DailyPractice[] {
    const practices: DailyPractice[] = [];

    principles.forEach(principleName => {
      const principleData = this.hermeticKnowledge.getPrinciple(principleName);
      if (!principleData) return;

      const practice: DailyPractice = {
        id: `${principleName}-practice`,
        name: `${principleData.name} Practice`,
        description: `Apply the ${principleData.name} to daily life`,
        difficulty,
        duration: '10-15 minutes',
        principle: principleName,
        steps: this.generatePrincipleSteps(principleData, difficulty),
        benefits: principleData.applications.slice(0, 3),
      };

      practices.push(practice);
    });

    return practices;
  }

  /**
   * Generate practice steps for a principle
   */
  private generatePrincipleSteps(principle: any, difficulty: DailyPractice['difficulty']): string[] {
    const baseSteps = [
      `Contemplate the meaning: "${principle.description}"`,
      'Identify how this principle manifests in your current situation',
      'Apply this principle to transform your challenge',
      'Take one concrete action based on this understanding',
    ];

    if (difficulty === 'advanced') {
      return [
        ...baseSteps,
        'Teach this principle to someone else or write about it',
        'Look for deeper, subtle applications throughout your day',
      ];
    }

    return baseSteps;
  }

  /**
   * Generate mantras for the challenge
   */
  private generateMantras(challenge: LifeChallenge): string[] {
    const mantras: Record<string, string[]> = {
      relationship: [
        'As I change within, my relationships transform without',
        'Love flows through me to heal all connections',
        'I see the divine in others as I honor the divine in myself',
        'Compassion dissolves all barriers between hearts'
      ],
      career: [
        'My work is an expression of my highest purpose',
        'Abundance flows to me through aligned action',
        'I create value and receive value in perfect balance',
        'My unique gifts serve the highest good of all'
      ],
      health: [
        'My body is a temple of divine healing energy',
        'Perfect health flows through every cell of my being',
        'I am vibrant, whole, and completely well',
        'Mind, body, and spirit unite in perfect harmony'
      ],
      spiritual: [
        'I am one with the infinite wisdom of the universe',
        'Divine guidance illuminates my path each moment',
        'I embody the sacred principles in all I think and do',
        'My soul awakens to its eternal nature'
      ],
      financial: [
        'Prosperity is my natural state of being',
        'Money flows to me easily and abundantly',
        'I am worthy of all good things life offers',
        'My relationship with money is healthy and balanced'
      ],
      family: [
        'Love heals all wounds across generations',
        'I break cycles of pain with compassion and wisdom',
        'My family bonds grow stronger through understanding',
        'Peace flows through our ancestral line'
      ],
      purpose: [
        'My life serves the highest good of all beings',
        'I trust the unfolding of my sacred purpose',
        'Every experience guides me toward my destiny',
        'I am exactly where I need to be in this moment'
      ]
    };

    return mantras[challenge.type] || mantras.spiritual;
  }

  /**
   * Generate affirmations for the challenge
   */
  private generateAffirmations(challenge: LifeChallenge): string[] {
    const intensity = challenge.severity === 'critical' ? 'powerful' : 
                     challenge.severity === 'major' ? 'strong' : 'gentle';

    const baseAffirmations: Record<string, string[]> = {
      relationship: [
        'I attract loving, harmonious relationships into my life',
        'I communicate with clarity, kindness, and wisdom',
        'All my relationships reflect my inner state of love and peace',
        'I give and receive love in perfect balance'
      ],
      career: [
        'I am successful in meaningful work that fulfills my soul',
        'My career path unfolds with divine timing and guidance',
        'I deserve abundance and prosperity in all forms',
        'My work contributes positively to the world'
      ],
      health: [
        'I am healthy, strong, and full of vital energy',
        'My body knows how to heal itself completely',
        'I make choices that support my optimal wellbeing',
        'Perfect health is my birthright and my reality'
      ],
      spiritual: [
        'I am a divine being having a human experience',
        'Wisdom and understanding flow through me effortlessly',
        'I trust in the perfect unfolding of my spiritual journey',
        'I am connected to infinite love and light'
      ],
      financial: [
        'Money comes to me easily and from multiple sources',
        'I manage my finances with wisdom and gratitude',
        'I deserve financial security and abundance',
        'My income increases steadily and sustainably'
      ],
      family: [
        'My family relationships are filled with love and understanding',
        'I contribute to healing and harmony in my family',
        'Love and forgiveness flow freely in all family interactions',
        'We support each other\'s highest growth and happiness'
      ],
      purpose: [
        'I know and live my life purpose with joy and confidence',
        'My unique mission serves humanity in beautiful ways',
        'I trust the divine plan for my life completely',
        'Every day I become more aligned with my true calling'
      ]
    };

    return baseAffirmations[challenge.type] || baseAffirmations.spiritual;
  }

  /**
   * Estimate transformation timeline
   */
  private estimateTimeline(challenge: LifeChallenge): string {
    const timeframes: Record<string, Record<string, string>> = {
      minor: {
        relationship: '2-4 weeks of consistent practice',
        career: '1-3 months of focused intention',
        health: '3-6 weeks of integrated healing approach',
        spiritual: '4-8 weeks of daily practice',
        financial: '2-6 months of mindset and action alignment',
        family: '1-3 months of conscious healing work',
        purpose: '6 weeks to 3 months of inner exploration'
      },
      moderate: {
        relationship: '1-3 months of dedicated transformation work',
        career: '3-6 months of strategic realignment',
        health: '2-4 months of comprehensive healing approach',
        spiritual: '3-6 months of deepening practice',
        financial: '6-12 months of systematic change',
        family: '3-6 months of healing and restructuring',
        purpose: '3-9 months of discovery and alignment'
      },
      major: {
        relationship: '3-9 months of intensive healing and growth',
        career: '6-18 months of major life restructuring',
        health: '6-12 months of deep healing transformation',
        spiritual: '6-12 months of significant spiritual evolution',
        financial: '1-2 years of foundational rebuilding',
        family: '6-18 months of generational healing work',
        purpose: '9 months to 2 years of life reorientation'
      },
      critical: {
        relationship: '6 months to 2 years of profound transformation',
        career: '1-3 years of complete life restructuring',
        health: '1-2 years of comprehensive healing journey',
        spiritual: '1-3 years of fundamental spiritual awakening',
        financial: '2-5 years of complete financial rebuild',
        family: '1-3 years of deep ancestral healing',
        purpose: '1-3 years of complete life realignment'
      }
    };

    const timeline = timeframes[challenge.severity]?.[challenge.type] || 
                    timeframes.moderate[challenge.type] || 
                    '3-6 months of consistent practice';

    return `${timeline}. Remember: transformation is a spiral journey - each cycle brings deeper understanding and integration.`;
  }

  /**
   * Define transformation milestones
   */
  private defineMilestones(challenge: LifeChallenge): string[] {
    const baseMilestones = [
      'Initial awareness and commitment to change',
      'First breakthrough insights about the root causes',
      'Consistent daily practice established',
      'Measurable improvements in challenge area',
      'Integration of new patterns into daily life',
      'Sustainable transformation achieved'
    ];

    const specificMilestones: Record<string, string[]> = {
      relationship: [
        'Reduced conflict and increased understanding',
        'Improved communication patterns',
        'Greater empathy and emotional intelligence',
        'Healthy boundaries established',
        'Deep healing and forgiveness completed'
      ],
      career: [
        'Clarity about true career desires',
        'Alignment of skills with purpose',
        'Increased opportunities and recognition',
        'Financial improvement from career changes',
        'Complete career transformation achieved'
      ],
      health: [
        'Increased energy and vitality',
        'Reduced symptoms and improved function',
        'Healthy habits fully integrated',
        'Strong body-mind connection established',
        'Optimal health and wellbeing maintained'
      ],
      spiritual: [
        'Regular spiritual practice established',
        'Direct experience of spiritual principles',
        'Increased intuition and inner guidance',
        'Service to others becomes natural',
        'Living in alignment with higher purpose'
      ],
      financial: [
        'Healthy money mindset established',
        'Improved financial management skills',
        'Increased income and reduced stress',
        'Financial goals achieved sustainably',
        'Abundant and secure financial foundation'
      ],
      family: [
        'Improved family communication',
        'Healing of old wounds and patterns',
        'Stronger family bonds and support',
        'Healthy family dynamics established',
        'Generational healing completed'
      ],
      purpose: [
        'Clear understanding of life purpose',
        'Alignment of daily actions with purpose',
        'Meaningful contribution to others',
        'Integration of purpose across all life areas',
        'Living as an expression of your highest self'
      ]
    };

    const challengeSpecific = specificMilestones[challenge.type] || [];
    return [...baseMilestones, ...challengeSpecific];
  }

  /**
   * Get overall transformation philosophy
   */
  private getTransformationPhilosophy(challenge: LifeChallenge): string {
    return `Remember, dear seeker: every challenge is an invitation to transcend your current limitations and step into greater wisdom. The same universal forces that created the challenge contain within them the seeds of its transformation. 

As Hermes taught: "That which is below is like that which is above, and that which is above is like that which is below." Your outer ${challenge.type} challenge reflects an inner opportunity for growth. By working with these timeless principles, you align yourself with the natural laws of transformation that govern all of existence.

The path may seem difficult at first, but trust in the process. Every step you take in alignment with these principles moves you closer to the harmonious resolution that already exists in the realm of potential. You are not just solving a problem - you are evolving into a wiser, more complete version of yourself.`;
  }

  /**
   * Helper methods
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

  private getPracticeDifficulty(spiritualLevel: SpiritualLevel): DailyPractice['difficulty'] {
    switch (spiritualLevel.level) {
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

  private isApplicationRelevant(application: string, challengeType: string): boolean {
    const keywords: Record<string, string[]> = {
      relationship: ['relationship', 'communication', 'connection', 'harmony'],
      career: ['work', 'career', 'purpose', 'success', 'abundance'],
      health: ['healing', 'health', 'vitality', 'wellness', 'body'],
      spiritual: ['spiritual', 'consciousness', 'wisdom', 'growth'],
      financial: ['abundance', 'prosperity', 'money', 'financial'],
      family: ['family', 'ancestral', 'generational', 'heritage'],
      purpose: ['purpose', 'meaning', 'calling', 'mission', 'destiny']
    };

    const relevantKeywords = keywords[challengeType] || [];
    return relevantKeywords.some(keyword => 
      application.toLowerCase().includes(keyword)
    );
  }
}