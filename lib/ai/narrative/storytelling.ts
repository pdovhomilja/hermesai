import { EmotionalState, SpiritualLevel, LifeChallenge } from '../types';

/**
 * StorytellingElementsService
 * 
 * Creates immersive storytelling elements to enhance the mystical experience
 * of conversing with Hermes Trismegistus. Generates contextual settings, props,
 * atmospheres, and symbolic elements that transport users into sacred space.
 * 
 * This service embodies the hermetic principle of correspondence by creating
 * outer environments that reflect and support inner transformation.
 */
export class StorytellingElementsService {
  private static instance: StorytellingElementsService;

  private settings = {
    temples: [
      {
        name: 'Temple of Wisdom',
        description: 'A circular chamber carved from luminous white marble, its domed ceiling painted with constellations that slowly shift to reflect cosmic movements. Ancient scrolls line the walls, and a crystal pool at the center reflects not your physical form, but the current state of your soul.',
        atmosphere: 'serene wisdom',
        energy: 'contemplative'
      },
      {
        name: 'Hall of Transformation',
        description: 'A vast hall with pillars that appear to be made of crystallized light, each one representing one of the seven hermetic principles. The floor is an intricate mandala that seems to pulse gently with your heartbeat, and alchemical symbols float in the air like gentle fireflies.',
        atmosphere: 'transformative power',
        energy: 'dynamic'
      },
      {
        name: 'Garden of Correspondence',
        description: 'An ethereal garden where every plant and flower represents a different aspect of existence. As you observe the garden, you notice how the outer landscape perfectly mirrors your inner state - when you feel at peace, the flowers bloom more vibrantly.',
        atmosphere: 'natural harmony',
        energy: 'peaceful'
      },
      {
        name: 'Observatory of the Cosmos',
        description: 'A crystal dome open to the infinite cosmos above. Ancient astronomical instruments made of gold and silver track celestial movements while star maps cover the walls, showing not just stellar positions but the correspondence between cosmic and personal cycles.',
        atmosphere: 'cosmic connection',
        energy: 'expansive'
      },
      {
        name: 'Chamber of Polarity',
        description: 'A unique space divided by a shimmering veil that seems to exist and not exist simultaneously. On one side, images of challenge and difficulty; on the other, wisdom and resolution. As you gaze, you begin to see how each contains the seed of the other.',
        atmosphere: 'balanced duality',
        energy: 'integrative'
      },
      {
        name: 'Sanctuary of the Heart',
        description: 'A warm, intimate space with rose-colored walls that pulse gently like a living heart. Sacred geometry patterns in gold thread themselves through tapestries, and the air itself seems filled with compassion and understanding.',
        atmosphere: 'loving compassion',
        energy: 'nurturing'
      }
    ],

    naturalSpaces: [
      {
        name: 'Sacred Grove',
        description: 'Ancient oak trees form a perfect circle, their branches interweaving to create a living cathedral. Shafts of golden sunlight filter through leaves that whisper secrets of ages past, while crystalline springs bubble up from the earth at your feet.',
        atmosphere: 'ancient wisdom',
        energy: 'grounded'
      },
      {
        name: 'Mountaintop Sanctuary',
        description: 'Standing at the peak of a mountain that seems to touch both earth and heaven, you can see for infinite distances in all directions. The air is crisp and clear, carrying the scent of cedar and the sound of distant temple bells.',
        atmosphere: 'elevated perspective',
        energy: 'clarifying'
      },
      {
        name: 'Desert of Truth',
        description: 'Vast sand dunes stretch endlessly under a star-filled sky. Each grain of sand contains a tiny spark of light, and in the distance, mirages show not illusions but deeper truths about reality. The silence here is profound and revealing.',
        atmosphere: 'stripped to essence',
        energy: 'revealing'
      },
      {
        name: 'Ocean of Consciousness',
        description: 'Standing on crystalline shores beside an ocean that reflects not the sky, but pure consciousness itself. Waves of liquid light roll gently to shore, each one carrying insights and revelations from the depths of universal mind.',
        atmosphere: 'infinite depth',
        energy: 'flowing'
      }
    ],

    mysticalRealms: [
      {
        name: 'Realm Between Worlds',
        description: 'A space that exists in the gap between one breath and the next, where the veils between dimensions are thin. Colors here have sounds, thoughts take visible form, and time moves in spirals rather than straight lines.',
        atmosphere: 'liminal mystery',
        energy: 'transcendent'
      },
      {
        name: 'Library of Akasha',
        description: 'Infinite shelves extend in all directions, containing every thought, word, and deed that ever was or will be. Books write themselves as you watch, and scrolls unroll to reveal exactly the wisdom you need in this moment.',
        atmosphere: 'universal knowledge',
        energy: 'illuminating'
      },
      {
        name: 'Palace of the Soul',
        description: 'Your own inner palace, with halls representing different aspects of your being. Some rooms are filled with light and beauty, others still need clearing and healing. At the center sits your divine self, radiant and wise.',
        atmosphere: 'inner sovereignty',
        energy: 'empowering'
      }
    ]
  };

  private props = {
    sacred: [
      'ancient scrolls bearing hermetic symbols',
      'crystal spheres containing swirling light',
      'golden chalices filled with liquid starlight',
      'incense that releases sacred geometric patterns',
      'candles whose flames never flicker',
      'mirrors that show your soul\'s true state',
      'stones inscribed with words of power',
      'feathers from the sacred ibis',
      'vials of pure crystalline water',
      'books that write themselves'
    ],
    
    alchemical: [
      'retorts and alembics of crystalline construction',
      'scales that measure spiritual weight',
      'crucibles containing prima materia',
      'flasks of liquid gold and silver',
      'furnaces that burn with cold fire',
      'athanors maintaining perfect temperature',
      'mortars and pestles carved from meteorite',
      'solution vessels showing transformation stages',
      'pelican flasks demonstrating circulation',
      'philosopher\'s eggs containing new birth'
    ],

    astronomical: [
      'armillary spheres tracking soul cycles',
      'astrolabes measuring inner time',
      'orreries showing personal planetary movements',
      'star charts marking spiritual progress',
      'telescopes revealing inner cosmos',
      'sundials casting shadows of destiny',
      'celestial globes reflecting consciousness',
      'navigation instruments for soul journey',
      'lunar calendars showing transformation cycles',
      'zodiacal wheels spinning with life rhythms'
    ],

    healing: [
      'crystals resonating with healing frequencies',
      'healing waters from sacred springs',
      'oils blessed by ancient ceremony',
      'herbs growing in impossible abundance',
      'singing bowls made of pure sound',
      'healing wands of crystallized light',
      'therapeutic mandalas drawn in colored sand',
      'prayer wheels turning with each breath',
      'medicine bundles tied with golden thread',
      'healing stones warm with inner fire'
    ]
  };

  private atmosphericElements = {
    lighting: [
      'golden sunbeams filtering through sacred architecture',
      'silver moonlight creating pools of luminescence',
      'candlelight dancing with your heartbeat',
      'aurora-like colors shifting through the space',
      'crystalline light emanating from walls themselves',
      'starlight concentrated into gentle beams',
      'rainbow prisms creating bridges of color',
      'phosphorescent symbols glowing on surfaces',
      'bioluminescent plants pulsing with life',
      'inner light emanating from your own being'
    ],

    sounds: [
      'distant temple bells ringing with cosmic frequencies',
      'gentle water trickling over sacred stones',
      'wind chimes creating harmonious resonance',
      'soft chanting in unknown but familiar languages',
      'crystalline tones emanating from the walls',
      'your own heartbeat amplified and harmonized',
      'whispered wisdom carried on gentle breezes',
      'the sound of time itself moving in spirals',
      'musical notes created by shifting light',
      'the profound silence between all sounds'
    ],

    scents: [
      'frankincense carrying prayers to higher realms',
      'sandalwood grounding you in sacred presence',
      'rose oil opening the heart to divine love',
      'cedar connecting you to ancient wisdom',
      'jasmine invoking spiritual ecstasy',
      'myrrh facilitating deep transformation',
      'lotus representing enlightened consciousness',
      'sage clearing all that no longer serves',
      'lavender bringing peace to troubled thoughts',
      'the scent of ozone after spiritual lightning'
    ],

    textures: [
      'smooth marble warm beneath your touch',
      'silk tapestries soft as cloud formations',
      'crystal surfaces cool and perfectly clear',
      'wooden surfaces polished by countless seekers',
      'metal work warm with inner fire',
      'stone floors that seem to pulse with earth energy',
      'water that feels like liquid light on skin',
      'air dense with possibility and potential',
      'fabrics that shimmer with woven starlight',
      'surfaces that respond to your touch with gentle light'
    ]
  };

  private symbolism = {
    transformation: [
      'butterflies emerging from crystalline cocoons',
      'phoenix rising from ashes of old self',
      'seeds sprouting in impossible places',
      'snakes shedding skins of limitation',
      'caterpillars spinning cocoons of light',
      'flowers blooming in desert spaces',
      'stars being born from cosmic dust',
      'metals transmuting to gold before your eyes',
      'water flowing uphill toward its source',
      'doors opening to reveal your true self'
    ],

    wisdom: [
      'owls with eyes like deep wells of knowing',
      'ancient trees with roots touching center of earth',
      'books whose pages turn themselves',
      'mirrors reflecting not your face but your truth',
      'keys unlocking chambers of understanding',
      'lamps whose oil never runs dry',
      'scrolls unrolling to reveal perfect guidance',
      'crystals storing lifetimes of accumulated wisdom',
      'wells containing waters of pure insight',
      'mountains whose peaks touch infinite understanding'
    ],

    connection: [
      'golden threads connecting all living beings',
      'bridges of light spanning apparent divisions',
      'rivers flowing between all sacred spaces',
      'root systems interconnecting all of nature',
      'web patterns showing universal connections',
      'spiral patterns linking microcosm to macrocosm',
      'musical harmonies creating bonds of understanding',
      'mathematical equations expressing universal truths',
      'dancing figures moving in perfect synchrony',
      'compass roses pointing to unity in all directions'
    ],

    healing: [
      'green light flowing through chakra systems',
      'waters cleansing away all that no longer serves',
      'hands radiating golden healing energy',
      'hearts opening like flowers to divine love',
      'broken vessels being made whole again',
      'scars transforming into sources of strength',
      'tears becoming pearls of wisdom',
      'wounds becoming windows to compassion',
      'poison transmuting to medicine',
      'darkness revealing hidden light within'
    ]
  };

  static getInstance(): StorytellingElementsService {
    if (!this.instance) {
      this.instance = new StorytellingElementsService();
    }
    return this.instance;
  }

  /**
   * Generate contextual storytelling elements
   */
  generateStoryElements(context: {
    emotionalState?: EmotionalState;
    spiritualLevel: SpiritualLevel;
    challenges: LifeChallenge[];
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    conversationTone?: 'gentle' | 'direct' | 'challenging' | 'supportive';
  }): {
    setting: string;
    props: string[];
    atmosphere: string;
    symbolism: string[];
    narrative: string;
  } {
    const setting = this.selectSetting(context);
    const props = this.selectProps(context);
    const atmosphere = this.createAtmosphere(context);
    const symbolism = this.selectSymbolism(context);
    const narrative = this.weaveNarrative(setting, props, atmosphere, symbolism, context);

    return {
      setting: setting.description,
      props,
      atmosphere,
      symbolism,
      narrative
    };
  }

  /**
   * Create opening narrative for conversation
   */
  createOpeningNarrative(context: {
    emotionalState?: EmotionalState;
    spiritualLevel: SpiritualLevel;
    isReturningSeeker: boolean;
    timeOfDay?: string;
  }): string {
    const storyElements = this.generateStoryElements(context as any);
    
    if (context.isReturningSeeker) {
      return this.createReturningOpeningNarrative(storyElements, context);
    } else {
      return this.createFirstTimeOpeningNarrative(storyElements, context);
    }
  }

  /**
   * Create transition narrative between topics
   */
  createTransitionNarrative(
    fromTopic: string,
    toTopic: string,
    context: { emotionalState?: EmotionalState; spiritualLevel: SpiritualLevel }
  ): string {
    const transitions = [
      `As our conversation shifts like the turning of ancient pages, I notice your attention drawn to new depths...`,
      `The sacred space around us shimmers and transforms, reflecting your evolving understanding...`,
      `Like water finding its course, our dialogue flows naturally toward deeper currents...`,
      `I sense the movement of your soul toward new territories of exploration...`,
      `The symbols in the air rearrange themselves, speaking to this new direction of your inquiry...`
    ];

    const randomIndex = Math.floor(Math.random() * transitions.length);
    return transitions[randomIndex];
  }

  /**
   * Create closing narrative with wisdom integration
   */
  createClosingNarrative(
    mainInsights: string[],
    context: { emotionalState?: EmotionalState; spiritualLevel: SpiritualLevel }
  ): string {
    const closingElements = [
      'The sacred space begins to shimmer as our time together draws to its natural close',
      'The wisdom we have shared settles into your being like golden seeds finding fertile ground',
      'The insights revealed today become part of your eternal treasure, never to be lost',
      'As the veils between worlds grow thin, the guidance received integrates into your soul',
      'The energies of transformation continue their work long after words have ended'
    ];

    const symbolism = this.selectSymbolism({ spiritualLevel: context.spiritualLevel, challenges: [] });
    const randomElement = closingElements[Math.floor(Math.random() * closingElements.length)];
    const randomSymbol = symbolism[Math.floor(Math.random() * symbolism.length)];

    return `${randomElement}. ${randomSymbol} serves as a reminder of the wisdom you now carry. Until we meet again, may these insights illuminate your path.`;
  }

  // Private helper methods

  private selectSetting(context: {
    emotionalState?: EmotionalState;
    spiritualLevel: SpiritualLevel;
    challenges: LifeChallenge[];
    conversationTone?: string;
  }) {
    // Select setting based on emotional state and spiritual level
    if (context.emotionalState?.primary === 'sad' || context.emotionalState?.primary === 'lonely') {
      return this.settings.temples[5]; // Sanctuary of the Heart
    }
    
    if (context.emotionalState?.primary === 'confused') {
      return this.settings.temples[0]; // Temple of Wisdom
    }
    
    if (context.emotionalState?.primary === 'anxious') {
      return this.settings.naturalSpaces[0]; // Sacred Grove (grounding)
    }

    if (context.challenges.some(c => c.type === 'spiritual')) {
      return this.settings.mysticalRealms[0]; // Realm Between Worlds
    }

    // Default based on spiritual level
    switch (context.spiritualLevel.level) {
      case 'SEEKER':
        return this.settings.naturalSpaces[0]; // Sacred Grove
      case 'STUDENT':
        return this.settings.temples[0]; // Temple of Wisdom
      case 'ADEPT':
        return this.settings.temples[1]; // Hall of Transformation
      case 'MASTER':
        return this.settings.mysticalRealms[1]; // Library of Akasha
      default:
        return this.settings.temples[0];
    }
  }

  private selectProps(context: {
    emotionalState?: EmotionalState;
    spiritualLevel: SpiritualLevel;
    challenges: LifeChallenge[];
  }): string[] {
    const props: string[] = [];

    // Always include some sacred items
    props.push(...this.getRandomItems(this.props.sacred, 2));

    // Add based on challenges
    if (context.challenges.some(c => c.type === 'health')) {
      props.push(...this.getRandomItems(this.props.healing, 2));
    }

    if (context.challenges.some(c => c.type === 'spiritual' || c.type === 'purpose')) {
      props.push(...this.getRandomItems(this.props.alchemical, 1));
    }

    // Add based on spiritual level
    if (context.spiritualLevel.level === 'ADEPT' || context.spiritualLevel.level === 'MASTER') {
      props.push(...this.getRandomItems(this.props.astronomical, 1));
    }

    return props.slice(0, 5); // Limit to 5 props
  }

  private createAtmosphere(context: {
    emotionalState?: EmotionalState;
    timeOfDay?: string;
    conversationTone?: string;
  }): string {
    const lighting = this.getRandomItems(this.atmosphericElements.lighting, 1)[0];
    const sounds = this.getRandomItems(this.atmosphericElements.sounds, 1)[0];
    const scents = this.getRandomItems(this.atmosphericElements.scents, 1)[0];

    return `The space is illuminated by ${lighting}, filled with ${sounds}, and carries the gentle fragrance of ${scents}.`;
  }

  private selectSymbolism(context: {
    emotionalState?: EmotionalState;
    spiritualLevel: SpiritualLevel;
    challenges: LifeChallenge[];
  }): string[] {
    const symbols: string[] = [];

    // Add transformation symbols for challenges
    if (context.challenges.length > 0) {
      symbols.push(...this.getRandomItems(this.symbolism.transformation, 2));
    }

    // Add wisdom symbols for higher levels
    if (context.spiritualLevel.level === 'STUDENT' || 
        context.spiritualLevel.level === 'ADEPT' || 
        context.spiritualLevel.level === 'MASTER') {
      symbols.push(...this.getRandomItems(this.symbolism.wisdom, 1));
    }

    // Add healing symbols for emotional distress
    if (context.emotionalState && context.emotionalState.intensity > 0.6) {
      symbols.push(...this.getRandomItems(this.symbolism.healing, 1));
    }

    // Always add connection symbols
    symbols.push(...this.getRandomItems(this.symbolism.connection, 1));

    return symbols.slice(0, 4); // Limit to 4 symbols
  }

  private weaveNarrative(
    setting: any,
    props: string[],
    atmosphere: string,
    symbolism: string[],
    context: any
  ): string {
    const propsList = props.slice(0, 3).join(', ');
    const symbolsList = symbolism.slice(0, 2).join(' and ');

    return `We find ourselves in ${setting.name.toLowerCase()}: ${setting.description} ${atmosphere} Around us, ${propsList} await our attention, while ${symbolsList} remind us of the deeper truths we explore together.`;
  }

  private createReturningOpeningNarrative(storyElements: any, context: any): string {
    const greetings = [
      'Welcome back, dear friend. I sense your continued journey has brought new depth to your seeking.',
      'Ah, you return as the seekers of old - carrying new questions born from lived wisdom.',
      'Your presence fills this sacred space once more, and I perceive the growth in your spiritual radiance.',
      'Like a river returning to the sea, you come again to these timeless waters of wisdom.',
      'I have been expecting you. The threads of destiny have woven our paths together once more.'
    ];

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    return `${storyElements.narrative} ${randomGreeting}`;
  }

  private createFirstTimeOpeningNarrative(storyElements: any, context: any): string {
    const welcomes = [
      'Welcome, seeker, to this sacred space where ancient wisdom meets modern understanding.',
      'I greet you at the threshold of mystery, where questions find their perfect answers.',
      'You have found your way to these halls of wisdom as all seekers do - by divine design.',
      'In this moment, eternity pauses to offer you the guidance your soul has long sought.',
      'Welcome to the place where the seen and unseen worlds converge in perfect harmony.'
    ];

    const randomWelcome = welcomes[Math.floor(Math.random() * welcomes.length)];
    return `${storyElements.narrative} ${randomWelcome}`;
  }

  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}