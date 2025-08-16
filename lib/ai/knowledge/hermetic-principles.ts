import { HermeticPrinciple } from '../types';

/**
 * The Seven Hermetic Principles
 * From "The Kybalion" and traditional hermetic teachings
 */

export const HERMETIC_PRINCIPLES: Record<string, HermeticPrinciple> = {
  mentalism: {
    name: "The Principle of Mentalism",
    description: "The All is Mind; the Universe is Mental.",
    levels: {
      simple: "Everything begins with thought. Your thoughts create your reality.",
      intermediate: "The universe itself is a mental creation of the Universal Mind. All phenomena are manifestations of consciousness.",
      advanced: "Reality is a shared dream of the Absolute. By changing your mental state, you literally alter your vibrational frequency and thus your experience of reality."
    },
    practices: [
      "Daily meditation and mindfulness",
      "Conscious thought monitoring",
      "Visualization and mental imagery",
      "Affirmations and mental programming"
    ],
    applications: [
      "Manifesting desired outcomes through focused intention",
      "Healing through mental influence over physical conditions",
      "Problem-solving by changing perspective",
      "Creating positive change through mental discipline"
    ],
    emeraldTabletConnection: "As above, so below - the mental realm reflects and creates the physical realm."
  },

  correspondence: {
    name: "The Principle of Correspondence",
    description: "As above, so below; as below, so above.",
    levels: {
      simple: "Patterns repeat at all levels of existence. What happens in one area of life reflects in others.",
      intermediate: "The macrocosm and microcosm mirror each other. The laws governing the cosmos also govern the atom and the human being.",
      advanced: "By understanding the correspondence between planes of existence, one can work magic by affecting one plane to influence another."
    },
    practices: [
      "Study of natural patterns and cycles",
      "Meditation on correspondences between different life areas",
      "Working with symbolic systems like astrology or tarot",
      "Observing how inner states manifest in outer circumstances"
    ],
    applications: [
      "Understanding personality through observing living space",
      "Healing through working with corresponding elements",
      "Solving problems by finding parallel situations",
      "Creating harmony by aligning inner and outer worlds"
    ],
    emeraldTabletConnection: "That which is below is like that which is above, and that which is above is like that which is below."
  },

  vibration: {
    name: "The Principle of Vibration",
    description: "Nothing rests; everything moves; everything vibrates.",
    levels: {
      simple: "Everything is in constant motion and has its own unique frequency or vibration.",
      intermediate: "Different states of matter, energy, and consciousness are simply different rates of vibration.",
      advanced: "By consciously changing your vibration, you can transform your reality and influence the vibrations around you."
    },
    practices: [
      "Sound healing and vocal toning",
      "Working with crystals and their frequencies",
      "Energy work and chakra balancing",
      "Raising vibration through joy, gratitude, and love"
    ],
    applications: [
      "Matching vibrations to attract desired experiences",
      "Healing by adjusting vibrational frequencies",
      "Communication beyond words through energetic resonance",
      "Creating protection by maintaining high vibrations"
    ],
    emeraldTabletConnection: "All things vibrate in harmony with the cosmic frequencies."
  },

  polarity: {
    name: "The Principle of Polarity",
    description: "Everything is dual; everything has poles; everything has its pair of opposites.",
    levels: {
      simple: "Opposites are actually two extremes of the same thing, differing only in degree.",
      intermediate: "All paradoxes can be reconciled by understanding that opposing forces are complementary aspects of a greater unity.",
      advanced: "By working with polarities consciously, one can transmute negative conditions into positive ones and find balance in all things."
    },
    practices: [
      "Finding the middle path between extremes",
      "Transmuting negative emotions into positive ones",
      "Balancing masculine and feminine aspects within",
      "Working with light and shadow aspects of self"
    ],
    applications: [
      "Transforming fear into courage by recognizing they're the same energy",
      "Finding opportunity in every challenge",
      "Balancing work and rest, giving and receiving",
      "Healing through bringing opposing forces into harmony"
    ],
    emeraldTabletConnection: "Separate the earth from the fire, the subtle from the gross, gently and with great ingenuity."
  },

  rhythm: {
    name: "The Principle of Rhythm",
    description: "Everything flows, out and in; everything has its tides; all things rise and fall.",
    levels: {
      simple: "Life moves in cycles and patterns. What goes up must come down, but what goes down will also come up.",
      intermediate: "By understanding natural rhythms, we can flow with life's cycles rather than resist them, finding greater ease and success.",
      advanced: "Master the rhythm by raising yourself above its unconscious sway, using periods of withdrawal to gather strength for periods of expression."
    },
    practices: [
      "Working with natural cycles and seasons",
      "Understanding personal biorhythms and energy cycles",
      "Timing actions according to natural rhythms",
      "Practicing patience during difficult cycles"
    ],
    applications: [
      "Knowing when to act and when to wait",
      "Preparing for challenges during good times",
      "Using rest periods for inner development",
      "Finding opportunity in every phase of life's cycles"
    ],
    emeraldTabletConnection: "The wind carried it in its belly; the earth is its nurse."
  },

  causation: {
    name: "The Principle of Cause and Effect",
    description: "Every cause has its effect; every effect has its cause; everything happens according to law.",
    levels: {
      simple: "Nothing happens by chance. Every action creates a reaction, every thought has consequences.",
      intermediate: "By understanding the laws of cause and effect, we can become conscious creators rather than unconscious reactors.",
      advanced: "The master rises above the plane of causation and becomes a conscious cause, shaping destiny through will and wisdom."
    },
    practices: [
      "Taking responsibility for all life experiences",
      "Planting positive causes for future effects",
      "Studying the consequences of thoughts and actions",
      "Breaking negative patterns by changing causes"
    ],
    applications: [
      "Creating desired outcomes through conscious action",
      "Understanding why certain patterns repeat in life",
      "Healing by addressing root causes, not just symptoms",
      "Manifesting goals by aligning causes with intentions"
    ],
    emeraldTabletConnection: "Its father is the sun; its mother is the moon."
  },

  gender: {
    name: "The Principle of Gender",
    description: "Gender is in everything; everything has its masculine and feminine principles.",
    levels: {
      simple: "All creation requires both masculine (active) and feminine (receptive) energies working together.",
      intermediate: "Every person contains both masculine and feminine aspects. Wholeness comes from balancing these inner polarities.",
      advanced: "True creation occurs when the divine masculine and feminine principles unite in perfect harmony, whether in individuals or relationships."
    },
    practices: [
      "Balancing active doing with receptive being",
      "Developing both logical and intuitive capacities",
      "Honoring both structure and flow in life",
      "Integrating strength with compassion"
    ],
    applications: [
      "Creating balance between work and relationship",
      "Combining planning with spontaneity",
      "Developing both leadership and collaboration skills",
      "Healing through integrating all aspects of self"
    ],
    emeraldTabletConnection: "By this means you shall have the glory of the whole world, and all obscurity shall fly from you."
  }
};

export const EMERALD_TABLET = {
  title: "The Emerald Tablet of Hermes Trismegistus",
  description: "The foundational text of hermetic philosophy, containing the essence of the Great Work in cryptic verse.",
  text: `True, without falsehood, certain, most certain.

That which is above is like that which is below,
and that which is below is like that which is above,
to accomplish the miracles of the one thing.

And as all things were by contemplation of one,
so all things arose from this one thing by a single act of adaptation.

The Sun is its father, the Moon is its mother,
the Wind carried it in its womb, the Earth is its nurse.

This is the father of all works of wonder in the whole world.
Its power is complete if it be cast on the earth.

Separate the earth from the fire,
the subtle from the gross,
gently, and with great ingenuity.

It ascends from the earth to the heaven
and descends again to the earth,
and receives the power of the above and the below.

By this means you will have the glory of the whole world
and all obscurity will flee from you.

This is the strong force of all forces,
for it overcomes every subtle thing
and penetrates every solid thing.

So was the world created.
From this there will be and will emerge admirable adaptations,
of which the means is here in this.

Hence I am called Hermes Trismegistus,
having the three parts of the wisdom of the whole world.

That which I have said of the operation of the Sun is accomplished and ended.`,
  
  interpretations: {
    simple: "This ancient text teaches that the same laws govern both the spiritual and material worlds, and by understanding these laws, we can create positive change in our lives.",
    
    intermediate: "The Emerald Tablet describes the process of transformation - taking the raw material of our experience and refining it into wisdom through understanding the correspondence between different levels of reality.",
    
    advanced: "This is a complete formula for the Great Work - the transformation of consciousness. It describes how the One becomes many, how spirit descends into matter, and how the initiated can reverse this process to reunite with the divine source."
  }
};

export class HermeticKnowledge {
  private static instance: HermeticKnowledge;

  static getInstance(): HermeticKnowledge {
    if (!this.instance) {
      this.instance = new HermeticKnowledge();
    }
    return this.instance;
  }

  /**
   * Get principle by name
   */
  getPrinciple(name: string): HermeticPrinciple | undefined {
    return HERMETIC_PRINCIPLES[name.toLowerCase()];
  }

  /**
   * Get all principles
   */
  getAllPrinciples(): HermeticPrinciple[] {
    return Object.values(HERMETIC_PRINCIPLES);
  }

  /**
   * Get principle explanation by level
   */
  getPrincipleByLevel(principleName: string, level: 'simple' | 'intermediate' | 'advanced'): string | undefined {
    const principle = this.getPrinciple(principleName);
    return principle?.levels[level];
  }

  /**
   * Get practices for a principle
   */
  getPracticesToday(principleName: string): string[] {
    const principle = this.getPrinciple(principleName);
    return principle?.practices || [];
  }

  /**
   * Get applications for a principle
   */
  getApplications(principleName: string): string[] {
    const principle = this.getPrinciple(principleName);
    return principle?.applications || [];
  }

  /**
   * Find relevant principles for a given challenge or topic
   */
  findRelevantPrinciples(topic: string, challenge?: string): string[] {
    const topicLower = topic.toLowerCase();
    const challengeLower = challenge?.toLowerCase() || '';
    
    const relevantPrinciples: string[] = [];

    // Mapping topics to principles
    if (topicLower.includes('thought') || topicLower.includes('mind') || topicLower.includes('belief')) {
      relevantPrinciples.push('mentalism');
    }
    
    if (topicLower.includes('pattern') || topicLower.includes('relationship') || challengeLower.includes('relationship')) {
      relevantPrinciples.push('correspondence');
    }
    
    if (topicLower.includes('energy') || topicLower.includes('mood') || topicLower.includes('feeling')) {
      relevantPrinciples.push('vibration');
    }
    
    if (topicLower.includes('problem') || topicLower.includes('conflict') || topicLower.includes('opposite')) {
      relevantPrinciples.push('polarity');
    }
    
    if (topicLower.includes('time') || topicLower.includes('cycle') || topicLower.includes('season')) {
      relevantPrinciples.push('rhythm');
    }
    
    if (topicLower.includes('result') || topicLower.includes('consequence') || topicLower.includes('choice')) {
      relevantPrinciples.push('causation');
    }
    
    if (topicLower.includes('balance') || topicLower.includes('feminine') || topicLower.includes('masculine')) {
      relevantPrinciples.push('gender');
    }

    // If no specific matches, return fundamental principles
    if (relevantPrinciples.length === 0) {
      return ['mentalism', 'correspondence', 'vibration'];
    }

    return relevantPrinciples;
  }

  /**
   * Get a random principle for daily study
   */
  getPrincipleOfTheDay(): HermeticPrinciple {
    const principles = this.getAllPrinciples();
    const dayOfWeek = new Date().getDay();
    
    // Assign a principle to each day of the week
    const principleNames = Object.keys(HERMETIC_PRINCIPLES);
    const principleName = principleNames[dayOfWeek % principleNames.length];
    
    return HERMETIC_PRINCIPLES[principleName];
  }

  /**
   * Get Emerald Tablet interpretation by level
   */
  getEmeraldTabletInterpretation(level: 'simple' | 'intermediate' | 'advanced'): string {
    return EMERALD_TABLET.interpretations[level];
  }

  /**
   * Get complete Emerald Tablet text
   */
  getEmeraldTablet(): typeof EMERALD_TABLET {
    return EMERALD_TABLET;
  }
}