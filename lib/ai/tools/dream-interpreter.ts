export interface DreamInterpretation {
  id: string;
  summary: string;
  hermeticSymbols: DreamSymbol[];
  principles: string[];
  messages: DreamMessage[];
  recommendations: string[];
  archetypes: DreamArchetype[];
  emotionalLandscape: EmotionalAnalysis;
  spiritualGuidance: SpiritualGuidance;
  practicalActions: string[];
  followUpQuestions: string[];
}

export interface DreamSymbol {
  symbol: string;
  context: string;
  hermeticMeaning: string;
  personalMessage: string;
  principle: string;
  elementalCorrespondence?: string;
  psychologicalAspect: string;
  actionGuidance: string;
}

export interface DreamMessage {
  theme: string;
  message: string;
  urgency: "low" | "medium" | "high";
  timeFrame: string;
  principle: string;
}

export interface DreamArchetype {
  archetype: string;
  description: string;
  role: string;
  guidance: string;
  integration: string;
}

export interface EmotionalAnalysis {
  primaryEmotion: string;
  secondaryEmotions: string[];
  emotionalMessage: string;
  healingGuidance: string;
}

export interface SpiritualGuidance {
  currentPhase: string;
  challenges: string[];
  opportunities: string[];
  nextSteps: string[];
  meditation: string;
}

interface DreamParams {
  dreamContent: string;
  emotions: string[];
  recurringElements?: string[];
  dreamType: string;
  personalSymbols?: string[];
}

export async function interpretDreamHermetically(params: DreamParams): Promise<DreamInterpretation> {
  const {
    dreamContent,
    emotions,
    recurringElements = [],
    dreamType,
    personalSymbols = []
  } = params;

  const interpretationId = `dream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Extract and analyze symbols
  const extractedSymbols = extractDreamSymbols(dreamContent, personalSymbols);
  const hermeticSymbols = analyzeSymbolsHermetically(extractedSymbols, dreamContent, emotions);

  // Identify archetypes
  const archetypes = identifyDreamArchetypes(dreamContent, hermeticSymbols);

  // Analyze emotional landscape
  const emotionalLandscape = analyzeEmotionalLandscape(emotions, dreamContent);

  // Extract principles
  const principles = [...new Set(hermeticSymbols.map(s => s.principle))];

  // Generate messages
  const messages = generateDreamMessages(hermeticSymbols, emotions, dreamType, archetypes);

  // Create spiritual guidance
  const spiritualGuidance = generateSpiritualGuidance(
    principles, 
    archetypes, 
    emotionalLandscape,
    dreamType
  );

  // Generate recommendations
  const recommendations = generateRecommendations(
    hermeticSymbols,
    recurringElements,
    dreamType,
    principles
  );

  return {
    id: interpretationId,
    summary: generateDreamSummary(dreamContent, hermeticSymbols, principles, dreamType),
    hermeticSymbols,
    principles,
    messages,
    recommendations,
    archetypes,
    emotionalLandscape,
    spiritualGuidance,
    practicalActions: generatePracticalActions(hermeticSymbols, spiritualGuidance, dreamType),
    followUpQuestions: generateFollowUpQuestions(hermeticSymbols, dreamType, emotions),
  };
}

function extractDreamSymbols(content: string, personalSymbols: string[] = []): string[] {
  const symbolPatterns = [
    // Elements
    /\b(water|ocean|river|lake|sea|rain|flood|waves|ice|snow)\b/gi,
    /\b(fire|flame|burning|light|sun|candle|torch|lightning|spark)\b/gi,
    /\b(earth|ground|mountain|stone|rock|cave|soil|sand|valley)\b/gi,
    /\b(air|wind|sky|cloud|flying|breath|storm|breeze)\b/gi,
    
    // Animals (power animals)
    /\b(snake|serpent|dragon|eagle|bird|owl|cat|dog|wolf|bear|lion|deer|horse|butterfly|bee)\b/gi,
    
    // Structures and objects
    /\b(door|gate|threshold|portal|bridge|stairs|ladder|tower|house|temple|church)\b/gi,
    /\b(mirror|reflection|shadow|glass|window|book|key|chest|treasure|sword|crown)\b/gi,
    
    // Natural phenomena
    /\b(moon|stars|darkness|light|eclipse|rainbow|crystal|gem|gold|silver)\b/gi,
    
    // Transformation symbols
    /\b(death|birth|rebirth|transformation|metamorphosis|healing|journey|path|crossroads)\b/gi,
    
    // Sacred symbols
    /\b(circle|triangle|square|spiral|cross|star|tree|flower|seed|garden)\b/gi,
    
    // People and beings
    /\b(child|baby|elder|wise|teacher|guide|angel|spirit|ghost|stranger)\b/gi,
  ];

  const symbols: string[] = [];

  for (const pattern of symbolPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      symbols.push(...matches.map(m => m.toLowerCase()));
    }
  }

  // Add personal symbols if they appear in the dream
  for (const personalSymbol of personalSymbols) {
    if (content.toLowerCase().includes(personalSymbol.toLowerCase())) {
      symbols.push(personalSymbol.toLowerCase());
    }
  }

  return [...new Set(symbols)];
}

function analyzeSymbolsHermetically(
  symbols: string[], 
  dreamContent: string, 
  emotions: string[]
): DreamSymbol[] {
  return symbols.map(symbol => {
    const hermeticMeaning = getHermeticMeaning(symbol);
    const principle = getRelatedPrinciple(symbol);
    const context = extractSymbolContext(symbol, dreamContent);
    const personalMessage = generatePersonalMessage(symbol, emotions, context);
    
    return {
      symbol,
      context,
      hermeticMeaning,
      personalMessage,
      principle,
      elementalCorrespondence: getElementalCorrespondence(symbol),
      psychologicalAspect: getPsychologicalAspect(symbol),
      actionGuidance: getActionGuidance(symbol, personalMessage),
    };
  });
}

function getHermeticMeaning(symbol: string): string {
  const meanings: Record<string, string> = {
    // Elements
    water: 'Emotions, intuition, the unconscious, purification, the fluid nature of reality',
    fire: 'Transformation, will, spiritual energy, passion, divine spark, purification through trials',
    earth: 'Material reality, grounding, manifestation, stability, the body, practical wisdom',
    air: 'Thoughts, communication, intellect, new perspectives, breath of life, mental clarity',
    
    // Animals
    snake: 'Kundalini energy, transformation, healing wisdom, rebirth, hidden knowledge, medicine power',
    dragon: 'Primordial power, guardian of treasure, transformation through ordeal, ancient wisdom',
    eagle: 'Higher perspective, spiritual vision, connection to divine, freedom, solar energy',
    bird: 'Messenger from spirit, freedom, soul\'s journey, transcendence, connection to heavens',
    owl: 'Wisdom, night vision, hidden knowledge, death/rebirth, feminine wisdom, intuition',
    wolf: 'Teacher, loyalty, instinct, wild nature, pathfinder, lunar energy',
    cat: 'Independence, mystery, psychic abilities, feminine power, guardian of secrets',
    
    // Structures
    door: 'Opportunity, transition between worlds, choice point, new phase of life, initiation',
    bridge: 'Transition, connecting opposites, crossing from one state to another, mediation',
    stairs: 'Spiritual ascension, levels of consciousness, step-by-step progress, hierarchy',
    tower: 'Spiritual aspiration, isolation for growth, higher perspective, connection to divine',
    house: 'The psyche, different rooms as aspects of self, foundation of being, security',
    temple: 'Sacred space within, connection to divine, place of worship, holy presence',
    
    // Objects
    mirror: 'Self-reflection, truth, illusion, correspondence (as above, so below), inner sight',
    key: 'Solution, access to hidden knowledge, unlocking potential, mystery schools initiation',
    book: 'Wisdom, learning, akashic records, hidden knowledge, need to study, revelation',
    sword: 'Discrimination, cutting through illusion, will, spiritual warrior, truth',
    crown: 'Spiritual authority, mastery, divine right, responsibility, achievement',
    
    // Natural phenomena
    moon: 'Feminine principle, cycles, intuition, reflection, hidden aspects, emotional tides',
    sun: 'Masculine principle, consciousness, enlightenment, vitality, divine light, clarity',
    stars: 'Divine guidance, destiny, higher self, connection to cosmic consciousness',
    darkness: 'The unknown, unconscious, mystery, fear to be faced, fertile void, potential',
    light: 'Consciousness, awareness, divine presence, understanding, spiritual illumination',
    rainbow: 'Promise, bridge between worlds, spectrum of possibilities, after the storm',
    
    // Transformation symbols
    death: 'End of cycle, transformation, letting go, rebirth, initiation, spiritual death',
    birth: 'New beginning, potential actualized, innocence, fresh start, creation',
    journey: 'Life path, spiritual quest, inner development, adventure, pilgrimage',
    crossroads: 'Choice point, decision time, multiple possibilities, life direction',
    
    // Sacred geometry
    circle: 'Wholeness, unity, cycles, eternal return, protection, completion, divine feminine',
    triangle: 'Trinity, balance, manifestation, direction, masculine principle, aspiration',
    spiral: 'Evolution, growth, cosmic consciousness, DNA, life force, eternal return',
    tree: 'World axis, growth, connection heaven-earth, family lineage, knowledge, life force',
  };

  return meanings[symbol] || 'Symbol of personal significance requiring individual interpretation';
}

function getRelatedPrinciple(symbol: string): string {
  const principleMap: Record<string, string> = {
    // Mentalism
    mirror: 'Mentalism',
    book: 'Mentalism', 
    light: 'Mentalism',
    thought: 'Mentalism',
    
    // Correspondence
    stairs: 'Correspondence',
    bridge: 'Correspondence',
    rainbow: 'Correspondence',
    reflection: 'Correspondence',
    
    // Vibration
    fire: 'Vibration',
    sound: 'Vibration',
    music: 'Vibration',
    energy: 'Vibration',
    
    // Polarity
    shadow: 'Polarity',
    darkness: 'Polarity',
    balance: 'Polarity',
    opposite: 'Polarity',
    
    // Rhythm
    water: 'Rhythm',
    moon: 'Rhythm',
    seasons: 'Rhythm',
    cycle: 'Rhythm',
    
    // Cause and Effect
    seed: 'Cause and Effect',
    key: 'Cause and Effect',
    door: 'Cause and Effect',
    path: 'Cause and Effect',
    
    // Gender
    union: 'Gender',
    marriage: 'Gender',
    child: 'Gender',
    creation: 'Gender',
  };

  return principleMap[symbol] || 'Mentalism';
}

function extractSymbolContext(symbol: string, dreamContent: string): string {
  const sentences = dreamContent.split(/[.!?]+/);
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(symbol)) {
      return sentence.trim();
    }
  }
  return `Symbol appeared in the dream: ${symbol}`;
}

function generatePersonalMessage(symbol: string, emotions: string[], context: string): string {
  const hasPositiveEmotions = emotions.some(e =>
    ['joy', 'peace', 'love', 'excitement', 'wonder', 'hope', 'gratitude', 'bliss'].includes(e.toLowerCase())
  );

  const hasNegativeEmotions = emotions.some(e =>
    ['fear', 'anxiety', 'anger', 'sadness', 'confusion', 'despair', 'worry', 'panic'].includes(e.toLowerCase())
  );

  const hasNeutralEmotions = !hasPositiveEmotions && !hasNegativeEmotions;

  if (hasPositiveEmotions) {
    return `The ${symbol} represents positive transformation and spiritual growth in your life. It appears as a blessing and confirmation of your path.`;
  }

  if (hasNegativeEmotions) {
    return `The ${symbol} indicates areas requiring healing, attention, or transformation. It calls you to face these aspects with courage and compassion.`;
  }

  return `The ${symbol} carries neutral energy, inviting you to observe its deeper message and apply its wisdom to your current situation.`;
}

function getElementalCorrespondence(symbol: string): string | undefined {
  const elementals: Record<string, string> = {
    water: 'Water',
    ocean: 'Water',
    river: 'Water', 
    rain: 'Water',
    fire: 'Fire',
    flame: 'Fire',
    sun: 'Fire',
    light: 'Fire',
    earth: 'Earth',
    mountain: 'Earth',
    stone: 'Earth',
    tree: 'Earth',
    air: 'Air',
    wind: 'Air',
    sky: 'Air',
    bird: 'Air',
  };

  return elementals[symbol];
}

function getPsychologicalAspect(symbol: string): string {
  const aspects: Record<string, string> = {
    shadow: 'Repressed or denied aspects of self requiring integration',
    mirror: 'Self-reflection and conscious awareness of inner truth', 
    child: 'Innocent, creative, or wounded inner child seeking attention',
    death: 'Ego death, transformation, or fear of change and loss',
    water: 'Emotional depths, unconscious content, or need for emotional flow',
    fire: 'Passionate nature, anger, or transformational energy seeking expression',
    snake: 'Instinctual wisdom, sexual energy, or fear of power and change',
    house: 'Psyche structure, different aspects of self, or security needs',
    door: 'Opportunity for growth, threshold anxiety, or readiness for change',
    key: 'Solution-seeking, access to inner wisdom, or unlocking potential',
  };

  return aspects[symbol] || 'Aspect of psyche seeking conscious integration';
}

function getActionGuidance(symbol: string, personalMessage: string): string {
  const guidances: Record<string, string> = {
    water: 'Allow emotions to flow, practice emotional regulation, engage in cleansing rituals',
    fire: 'Channel passion constructively, practice energy work, embrace transformation courageously',
    mirror: 'Practice honest self-reflection, engage in shadow work, seek truth in all situations',
    door: 'Take action on opportunities, move through fears, embrace new beginnings',
    key: 'Seek knowledge or guidance, unlock hidden talents, apply wisdom to current challenges',
    snake: 'Embrace healing process, work with kundalini energy, integrate wisdom teachings',
    death: 'Release what no longer serves, embrace transformation, practice ego dissolution',
    light: 'Seek illumination through study/meditation, share your light with others, follow guidance',
    shadow: 'Do shadow work, integrate rejected aspects, practice self-acceptance',
    bridge: 'Create connections, mediate conflicts, facilitate transitions for self or others',
  };

  return guidances[symbol] || 'Meditate on this symbol and allow its wisdom to guide your actions';
}

function identifyDreamArchetypes(dreamContent: string, symbols: DreamSymbol[]): DreamArchetype[] {
  const archetypes: DreamArchetype[] = [];

  // Analyze content for archetypal figures
  const archetypePatterns = [
    {
      pattern: /wise|teacher|guide|mentor|guru|sage|elder|master/gi,
      archetype: 'The Sage/Hermes',
      description: 'The wise teacher and guide, embodying ancient wisdom',
      role: 'Bringing guidance, knowledge, and spiritual direction',
      guidance: 'Listen to inner wisdom, seek teachings, become a guide for others',
      integration: 'Develop your own wisdom and share it responsibly with others',
    },
    {
      pattern: /hero|warrior|champion|fighter|brave|courage/gi,
      archetype: 'The Hero',
      description: 'The courageous one who faces challenges and transforms',
      role: 'Overcoming obstacles, fighting for truth, personal transformation',
      guidance: 'Face your fears with courage, take on challenges, fight for what\'s right',
      integration: 'Channel heroic energy into personal growth and helping others',
    },
    {
      pattern: /shadow|dark|hidden|mysterious|secret|forbidden/gi,
      archetype: 'The Shadow',
      description: 'Hidden or repressed aspects seeking integration',
      role: 'Revealing what needs healing, showing rejected parts of self',
      guidance: 'Acknowledge shadow aspects with compassion, integrate rather than reject',
      integration: 'Shadow work, therapy, honest self-examination with self-love',
    },
    {
      pattern: /child|innocent|pure|playful|wonder|young/gi,
      archetype: 'The Inner Child',
      description: 'Innocent, creative, or wounded child aspect',
      role: 'Bringing joy, creativity, healing childhood wounds',
      guidance: 'Reconnect with joy and wonder, heal childhood wounds, be creative',
      integration: 'Inner child work, creative expression, playfulness in daily life',
    },
    {
      pattern: /transform|change|magic|alchemy|evolution|metamorphosis/gi,
      archetype: 'The Alchemist',
      description: 'The transformer who works with energy and change',
      role: 'Facilitating transformation, working with spiritual energy',
      guidance: 'Embrace change processes, work with energy, study transformation',
      integration: 'Learn energy work, facilitate transformation in others, master change',
    },
    {
      pattern: /mother|nurture|care|protect|birth|fertile/gi,
      archetype: 'The Great Mother',
      description: 'Nurturing, protective, life-giving feminine principle',
      role: 'Providing care, protection, unconditional love, birthing new life',
      guidance: 'Practice self-nurturing, care for others, create safe spaces',
      integration: 'Develop nurturing abilities, create supportive environments',
    },
    {
      pattern: /father|authority|structure|discipline|law|order/gi,
      archetype: 'The Father',
      description: 'Protective, structuring masculine principle',
      role: 'Providing structure, protection, guidance, and discipline',
      guidance: 'Develop healthy authority, create structure, take responsibility',
      integration: 'Balance authority with compassion, create healthy boundaries',
    },
    {
      pattern: /lover|beloved|romance|passion|union|marriage/gi,
      archetype: 'The Lover',
      description: 'The one who seeks union and deep connection',
      role: 'Bringing passion, connection, intimacy, and union',
      guidance: 'Open to love, heal relationship wounds, seek genuine connection',
      integration: 'Develop capacity for intimate relationships and self-love',
    },
    {
      pattern: /trickster|fool|joke|chaos|unexpected|surprise/gi,
      archetype: 'The Trickster',
      description: 'The one who brings chaos to create new order',
      role: 'Breaking down old structures, bringing unexpected wisdom',
      guidance: 'Embrace uncertainty, find humor in difficulties, be flexible',
      integration: 'Learn to flow with change, use humor for healing and growth',
    },
    {
      pattern: /death|dying|end|destruction|reaper|grave/gi,
      archetype: 'The Death/Rebirth Figure',
      description: 'The one who facilitates endings and new beginnings',
      role: 'Ending old cycles, facilitating rebirth and transformation',
      guidance: 'Let go of what no longer serves, embrace new beginnings',
      integration: 'Master transitions, help others through changes, release gracefully',
    },
  ];

  for (const { pattern, ...archetypeData } of archetypePatterns) {
    if (pattern.test(dreamContent)) {
      archetypes.push(archetypeData);
    }
  }

  // Also check symbols for archetypal energy
  for (const symbol of symbols) {
    if (['crown', 'throne', 'scepter'].includes(symbol.symbol)) {
      archetypes.push({
        archetype: 'The Ruler/King',
        description: 'The sovereign who takes responsibility for their realm',
        role: 'Leadership, responsibility, creating order from chaos',
        guidance: 'Step into your power responsibly, lead by example, serve others',
        integration: 'Develop leadership skills, take responsibility for your life domain',
      });
    }
  }

  return archetypes.length > 0 ? archetypes : [{
    archetype: 'The Seeker',
    description: 'One who is on a quest for truth and understanding',
    role: 'Searching for meaning, asking questions, exploring possibilities',
    guidance: 'Continue your spiritual quest, ask deeper questions, remain open to mystery',
    integration: 'Embrace the journey of discovery, share your seekings with others',
  }];
}

function analyzeEmotionalLandscape(emotions: string[], dreamContent: string): EmotionalAnalysis {
  if (emotions.length === 0) {
    return {
      primaryEmotion: 'neutral',
      secondaryEmotions: [],
      emotionalMessage: 'The dream carries neutral emotional energy, focusing on information or symbolic teaching.',
      healingGuidance: 'Pay attention to the symbolic messages rather than emotional content.',
    };
  }

  const primaryEmotion = emotions[0];
  const secondaryEmotions = emotions.slice(1, 3);

  const emotionalMappings: Record<string, { message: string; healing: string }> = {
    fear: {
      message: 'Fear in dreams often represents areas ready for growth and transformation. It shows you what needs courage to face.',
      healing: 'Practice courage-building exercises, face fears gradually, seek support for overwhelming fears.',
    },
    joy: {
      message: 'Joy indicates alignment with your true path and spiritual growth. It confirms positive directions in life.',
      healing: 'Cultivate more joy in daily life, notice what brings genuine happiness, share joy with others.',
    },
    sadness: {
      message: 'Sadness points to areas needing healing, grief to be processed, or losses to be acknowledged.',
      healing: 'Allow grief to flow naturally, practice emotional release work, seek healing for old wounds.',
    },
    anger: {
      message: 'Anger reveals boundaries that need setting, injustices to address, or power that needs healthy expression.',
      healing: 'Practice healthy anger expression, set clear boundaries, address situations requiring action.',
    },
    confusion: {
      message: 'Confusion indicates transition times, areas needing clarity, or complex situations requiring patience.',
      healing: 'Seek clarity through meditation, ask for guidance, break complex issues into smaller parts.',
    },
    peace: {
      message: 'Peace indicates spiritual harmony, successful integration, or divine presence in your life.',
      healing: 'Cultivate more peaceful moments, practice meditation, create harmony in your environment.',
    },
  };

  const mapping = emotionalMappings[primaryEmotion.toLowerCase()] || {
    message: 'This emotional state carries important information about your inner landscape and current life situation.',
    healing: 'Practice emotional awareness, journal about these feelings, consider their deeper message.',
  };

  return {
    primaryEmotion,
    secondaryEmotions,
    emotionalMessage: mapping.message,
    healingGuidance: mapping.healing,
  };
}

function generateDreamMessages(
  symbols: DreamSymbol[],
  emotions: string[],
  dreamType: string,
  archetypes: DreamArchetype[]
): DreamMessage[] {
  const messages: DreamMessage[] = [];

  // Primary message based on dominant symbols and principles
  const principleCount = symbols.reduce((acc, symbol) => {
    acc[symbol.principle] = (acc[symbol.principle] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantPrinciple = Object.entries(principleCount)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Mentalism';

  messages.push({
    theme: 'Primary Spiritual Lesson',
    message: `Your dream emphasizes the hermetic principle of ${dominantPrinciple}, indicating this area requires attention in your spiritual development.`,
    urgency: 'medium',
    timeFrame: 'Current life phase',
    principle: dominantPrinciple,
  });

  // Archetypal message
  if (archetypes.length > 0) {
    const primaryArchetype = archetypes[0];
    messages.push({
      theme: 'Archetypal Guidance',
      message: `${primaryArchetype.archetype} appears to offer guidance: ${primaryArchetype.guidance}`,
      urgency: 'high',
      timeFrame: 'Immediate attention needed',
      principle: 'Correspondence',
    });
  }

  // Emotional message
  if (emotions.includes('fear')) {
    messages.push({
      theme: 'Fear Transformation',
      message: 'Fear in dreams often represents growth opportunities. What appears frightening may be your greatest teacher.',
      urgency: 'high',
      timeFrame: 'Current challenges',
      principle: 'Polarity',
    });
  }

  // Dream type specific messages
  if (dreamType === 'prophetic') {
    messages.push({
      theme: 'Future Guidance',
      message: 'This prophetic dream offers glimpses of potential futures and guidance for current decisions.',
      urgency: 'high',
      timeFrame: 'Future possibilities',
      principle: 'Cause and Effect',
    });
  } else if (dreamType === 'healing') {
    messages.push({
      theme: 'Healing Process',
      message: 'Your psyche is actively working on healing. Trust the process and support it with conscious action.',
      urgency: 'medium',
      timeFrame: 'Ongoing healing cycle',
      principle: 'Rhythm',
    });
  } else if (dreamType === 'shadow') {
    messages.push({
      theme: 'Shadow Integration',
      message: 'Hidden or rejected aspects seek integration. Embrace these parts with compassion for wholeness.',
      urgency: 'high',
      timeFrame: 'Personal development priority',
      principle: 'Polarity',
    });
  }

  return messages;
}

function generateSpiritualGuidance(
  principles: string[],
  archetypes: DreamArchetype[],
  emotionalLandscape: EmotionalAnalysis,
  dreamType: string
): SpiritualGuidance {
  const currentPhase = determineSpiritualPhase(principles, archetypes, dreamType);
  
  const challenges = [
    `Integration of ${principles.join(' and ')} principles`,
    `Working with ${emotionalLandscape.primaryEmotion} energy constructively`,
  ];

  if (archetypes.length > 0) {
    challenges.push(`Embodying the ${archetypes[0].archetype} energy in daily life`);
  }

  const opportunities = [
    'Deepen spiritual practice through dream work',
    'Use hermetic principles for personal transformation',
    'Integrate unconscious wisdom into conscious life',
  ];

  const nextSteps = [
    'Begin a dream journal for pattern tracking',
    `Work specifically with the principle of ${principles[0]} through study and practice`,
    'Consider meditation on the dream symbols for deeper insights',
  ];

  if (archetypes.length > 0) {
    nextSteps.push(archetypes[0].integration);
  }

  const meditation = generateMeditationGuidance(principles[0], archetypes[0]?.archetype);

  return {
    currentPhase,
    challenges,
    opportunities,
    nextSteps,
    meditation,
  };
}

function determineSpiritualPhase(
  principles: string[],
  archetypes: DreamArchetype[],
  dreamType: string
): string {
  if (dreamType === 'prophetic') return 'Oracle Phase - Receiving divine guidance and future insight';
  if (dreamType === 'healing') return 'Healing Phase - Active transformation and restoration';
  if (dreamType === 'shadow') return 'Integration Phase - Working with hidden aspects for wholeness';
  
  if (archetypes.some(a => a.archetype.includes('Sage'))) {
    return 'Wisdom Phase - Developing and sharing spiritual knowledge';
  }
  
  if (archetypes.some(a => a.archetype.includes('Hero'))) {
    return 'Initiation Phase - Facing challenges for spiritual growth';
  }

  if (principles.includes('Mentalism')) {
    return 'Mind Mastery Phase - Developing mental discipline and clarity';
  }

  return 'Discovery Phase - Exploring spiritual potential and receiving guidance';
}

function generateMeditationGuidance(principle: string, archetype?: string): string {
  const principlemeditations: Record<string, string> = {
    'Mentalism': 'Meditate on the phrase "The All is Mind." Observe your thoughts without attachment, recognizing the mental nature of all experience.',
    'Correspondence': 'Contemplate "As above, so below." Look for patterns between your inner state and outer circumstances.',
    'Vibration': 'Practice vibrational meditation by humming or chanting, feeling how sound creates vibration in your body and space.',
    'Polarity': 'Meditate on opposites within yourself - light/shadow, masculine/feminine, strength/vulnerability - seeking integration.',
    'Rhythm': 'Align with natural rhythms through breathing meditation, honoring the cyclical nature of all existence.',
    'Cause and Effect': 'Reflect on the chain of causation in your life. Meditate on conscious creation and personal responsibility.',
    'Gender': 'Balance meditation focusing on integrating masculine (active) and feminine (receptive) energies within yourself.',
  };

  let guidance = principlemeditations[principle] || principlemeditations['Mentalism'];

  if (archetype) {
    guidance += ` Additionally, meditate on embodying the wisdom of ${archetype}, asking how this energy can serve your spiritual development.`;
  }

  return guidance;
}

function generateRecommendations(
  symbols: DreamSymbol[],
  recurringElements: string[],
  dreamType: string,
  principles: string[]
): string[] {
  const recommendations: string[] = [];

  // Core recommendations
  recommendations.push('Keep a dream journal to track patterns and receive ongoing guidance');
  recommendations.push('Meditate on the dream symbols during morning practice for deeper insights');

  // Principle-based recommendations
  for (const principle of principles) {
    recommendations.push(`Study and apply the Principle of ${principle} in your daily life`);
  }

  // Recurring elements attention
  if (recurringElements.length > 0) {
    recommendations.push(`Pay special attention to recurring elements: ${recurringElements.join(', ')} - they carry urgent messages`);
    recommendations.push('Create artwork or write poetry about recurring symbols to deepen your connection');
  }

  // Symbol-specific recommendations
  for (const symbol of symbols.slice(0, 3)) { // Top 3 symbols
    recommendations.push(symbol.actionGuidance);
  }

  // Dream type specific
  if (dreamType === 'healing') {
    recommendations.push('Support the healing process with energy work, therapy, or body practices');
    recommendations.push('Create ritual or ceremony to honor the healing energy');
  } else if (dreamType === 'prophetic') {
    recommendations.push('Document predictions or insights for future verification');
    recommendations.push('Use the guidance for current decision-making');
  } else if (dreamType === 'shadow') {
    recommendations.push('Engage in shadow work through therapy, journaling, or self-reflection');
    recommendations.push('Practice self-compassion when working with difficult aspects');
  }

  return recommendations;
}

function generatePracticalActions(
  symbols: DreamSymbol[],
  spiritualGuidance: SpiritualGuidance,
  dreamType: string
): string[] {
  const actions: string[] = [];

  // Based on spiritual guidance next steps
  actions.push(...spiritualGuidance.nextSteps);

  // Symbol-based actions (top 3)
  symbols.slice(0, 3).forEach(symbol => {
    actions.push(`Work with ${symbol.symbol} energy: ${symbol.actionGuidance}`);
  });

  // Dream type actions
  if (dreamType === 'healing') {
    actions.push('Schedule healing session (therapy, energy work, bodywork)');
    actions.push('Create supportive environment for healing process');
  }

  if (dreamType === 'guidance') {
    actions.push('Apply the guidance to current life decisions');
    actions.push('Share insights with trusted spiritual advisor or friend');
  }

  return [...new Set(actions)]; // Remove duplicates
}

function generateFollowUpQuestions(
  symbols: DreamSymbol[],
  dreamType: string,
  emotions: string[]
): string[] {
  const questions: string[] = [];

  // Symbol exploration
  if (symbols.length > 0) {
    questions.push(`What personal associations do you have with ${symbols[0].symbol}?`);
    questions.push(`How does the energy of ${symbols[0].symbol} show up in your waking life?`);
  }

  // Emotional exploration
  if (emotions.length > 0) {
    questions.push(`Where in your waking life do you experience ${emotions[0]}?`);
    questions.push(`What might ${emotions[0]} be trying to teach you?`);
  }

  // Pattern recognition
  questions.push('Have you had similar dreams before? What patterns do you notice?');
  questions.push('What in your current life might have triggered this dream?');

  // Integration questions
  questions.push('How can you honor the wisdom of this dream in your daily life?');
  questions.push('What would change if you fully integrated this dream\'s message?');

  // Future exploration
  questions.push('What other dreams would you like guidance on interpreting?');
  questions.push('How can you increase your dream recall and symbolic understanding?');

  return questions;
}

function generateDreamSummary(
  dreamContent: string,
  symbols: DreamSymbol[],
  principles: string[],
  dreamType: string
): string {
  const principlesText = principles.length > 1 
    ? `the principles of ${principles.slice(0, -1).join(', ')} and ${principles[principles.length - 1]}`
    : `the principle of ${principles[0]}`;

  const symbolCount = symbols.length;
  const symbolText = symbolCount > 3 
    ? `${symbolCount} significant symbols` 
    : symbols.map(s => s.symbol).join(', ');

  return `This ${dreamType} dream speaks to you through ${principlesText}, presenting ${symbolText} as teachers and guides. ` +
         `The universe is communicating important messages about your spiritual journey, offering wisdom for both immediate guidance and long-term transformation. ` +
         `The dream invites you to integrate unconscious wisdom into your conscious life, supporting your evolution as a spiritual being.`;
}