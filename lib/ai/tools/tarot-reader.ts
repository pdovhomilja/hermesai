export interface TarotReading {
  id: string;
  question: string;
  spread: string;
  deck: string;
  cards: DrawnCard[];
  interpretation: ReadingInterpretation;
  spiritualGuidance: SpiritualGuidance;
  practicalAdvice: PracticalAdvice;
  followUp: FollowUpGuidance;
  readingMetadata: ReadingMetadata;
}

export interface DrawnCard {
  position: number;
  positionName: string;
  card: TarotCard;
  reversed: boolean;
  contextualMeaning: string;
  personalMessage: string;
  actionGuidance: string;
}

export interface TarotCard {
  name: string;
  suit?: string;
  number?: number;
  arcana: "major" | "minor";
  element?: string;
  astrologicalCorrespondence?: string;
  hebrewLetter?: string;
  numerology: number;
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  hermeticSymbolism: string;
  spiritualLesson: string;
  shadowAspect: string;
  imagery: CardImagery;
}

export interface CardImagery {
  description: string;
  symbols: string[];
  colors: string[];
  numericalSymbols: string[];
  geometricShapes: string[];
}

export interface ReadingInterpretation {
  overallTheme: string;
  primaryMessage: string;
  cardInteractions: CardInteraction[];
  timelineGuidance: TimelineGuidance;
  challengesAndOpportunities: ChallengesAndOpportunities;
  spiritualLessons: string[];
}

export interface CardInteraction {
  cards: string[];
  relationship: string;
  combinedMessage: string;
  significance: string;
}

export interface TimelineGuidance {
  pastInfluences: string[];
  presentSituation: string[];
  futureOutlook: string[];
  timing: string[];
}

export interface ChallengesAndOpportunities {
  challenges: Challenge[];
  opportunities: Opportunity[];
  hiddenInfluences: string[];
  externalFactors: string[];
}

export interface Challenge {
  description: string;
  sourceCard: string;
  guidance: string;
  resolution: string;
}

export interface Opportunity {
  description: string;
  sourceCard: string;
  actionSteps: string[];
  potential: string;
}

export interface SpiritualGuidance {
  soulLessons: string[];
  karmicPatterns: string[];
  spiritualPractices: string[];
  meditation: string;
  affirmation: string;
}

export interface PracticalAdvice {
  immediateActions: string[];
  longTermStrategy: string;
  relationshipGuidance: string[];
  careerInsights: string[];
  healthConsiderations: string[];
  financialWisdom: string[];
}

export interface FollowUpGuidance {
  reflectionQuestions: string[];
  journalPrompts: string[];
  nextSteps: string[];
  whenToReadAgain: string;
  progressIndicators: string[];
}

export interface ReadingMetadata {
  readingDate: string;
  moonPhase: string;
  readingType: string;
  confidenceLevel: number;
  energeticQuality: string;
  synchronicity: string[];
}

interface TarotParams {
  spread: string;
  question: string;
  deck: string;
  focusArea?: string;
  timeframe: string;
}

export async function drawAndInterpretTarot(params: TarotParams): Promise<TarotReading> {
  const {
    spread,
    question,
    deck = "hermetic",
    focusArea,
    timeframe
  } = params;

  const readingId = `tarot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Draw cards based on spread
  const cards = drawCards(spread, deck);
  
  // Interpret the reading
  const interpretation = interpretReading(cards, question, spread, timeframe, focusArea);
  
  // Generate spiritual guidance
  const spiritualGuidance = generateSpiritualGuidance(cards, question, interpretation);
  
  // Create practical advice
  const practicalAdvice = generatePracticalAdvice(cards, focusArea, interpretation);
  
  // Generate follow-up guidance
  const followUp = generateFollowUpGuidance(cards, question, spread);
  
  // Create reading metadata
  const readingMetadata = generateReadingMetadata(spread, question);

  return {
    id: readingId,
    question,
    spread,
    deck,
    cards,
    interpretation,
    spiritualGuidance,
    practicalAdvice,
    followUp,
    readingMetadata,
  };
}

function drawCards(spread: string, deckType: string): DrawnCard[] {
  const spreads = {
    single: 1,
    "three-card": 3,
    "celtic-cross": 10,
    "hermetic-seven": 7,
    "life-path": 5,
    relationship: 6
  };
  
  const numCards = spreads[spread as keyof typeof spreads] || 1;
  const drawnCards: DrawnCard[] = [];
  const usedCards = new Set<string>();
  
  for (let i = 0; i < numCards; i++) {
    let card: TarotCard;
    let cardKey: string;
    
    do {
      card = getRandomCard(deckType);
      cardKey = `${card.name}_${card.suit || 'major'}`;
    } while (usedCards.has(cardKey));
    
    usedCards.add(cardKey);
    
    const reversed = Math.random() < 0.3; // 30% chance of reversal
    const positionName = getPositionName(spread, i);
    
    drawnCards.push({
      position: i + 1,
      positionName,
      card,
      reversed,
      contextualMeaning: getContextualMeaning(card, positionName, reversed),
      personalMessage: generatePersonalMessage(card, positionName, reversed),
      actionGuidance: generateActionGuidance(card, positionName, reversed)
    });
  }
  
  return drawnCards;
}

function getRandomCard(deckType: string): TarotCard {
  const cards = getTarotDeck(deckType);
  return cards[Math.floor(Math.random() * cards.length)];
}

function getTarotDeck(deckType: string): TarotCard[] {
  // Major Arcana
  const majorArcana: TarotCard[] = [
    {
      name: "The Fool",
      arcana: "major",
      numerology: 0,
      keywords: ["new beginnings", "innocence", "adventure", "potential", "trust"],
      uprightMeaning: "New beginnings, innocence, adventure, faith in the journey ahead",
      reversedMeaning: "Recklessness, poor judgment, lack of direction, folly",
      hermeticSymbolism: "The soul before incarnation, pure spirit entering matter, the divine spark",
      spiritualLesson: "Trust in the divine process and embrace new spiritual adventures",
      shadowAspect: "Naivety that ignores practical wisdom",
      hebrewLetter: "Aleph",
      astrologicalCorrespondence: "Uranus",
      element: "Air",
      imagery: {
        description: "Young person stepping off a cliff with a small bag and white rose",
        symbols: ["cliff", "rose", "bag", "dog", "sun"],
        colors: ["yellow", "white", "blue"],
        numericalSymbols: ["0", "infinity"],
        geometricShapes: ["circle", "oval"]
      }
    },
    {
      name: "The Magician",
      arcana: "major",
      numerology: 1,
      keywords: ["will", "manifestation", "skill", "concentration", "power"],
      uprightMeaning: "Willpower, manifestation, skill, concentration, creative power",
      reversedMeaning: "Manipulation, trickery, illusion, lack of willpower",
      hermeticSymbolism: "The divine will acting through human consciousness, as above so below",
      spiritualLesson: "Develop focused will and learn to channel divine energy",
      shadowAspect: "Manipulation and misuse of spiritual power",
      hebrewLetter: "Beth",
      astrologicalCorrespondence: "Mercury",
      element: "Air",
      imagery: {
        description: "Figure pointing upward and downward with tools on table",
        symbols: ["wand", "cup", "sword", "pentacle", "infinity symbol"],
        colors: ["red", "white", "yellow"],
        numericalSymbols: ["1", "infinity"],
        geometricShapes: ["rectangle", "oval"]
      }
    },
    {
      name: "The High Priestess",
      arcana: "major",
      numerology: 2,
      keywords: ["intuition", "mystery", "inner wisdom", "feminine", "receptivity"],
      uprightMeaning: "Intuition, mystery, inner knowing, feminine wisdom, receptivity",
      reversedMeaning: "Hidden motives, disconnection from intuition, secrets",
      hermeticSymbolism: "The divine feminine, lunar consciousness, the veil between worlds",
      spiritualLesson: "Develop intuitive abilities and trust inner knowing",
      shadowAspect: "Secretiveness and manipulation through hidden knowledge",
      hebrewLetter: "Gimel",
      astrologicalCorrespondence: "Moon",
      element: "Water",
      imagery: {
        description: "Seated figure between two pillars with crescent moon crown",
        symbols: ["pillars", "veil", "crescent moon", "cross", "scroll"],
        colors: ["blue", "white", "silver"],
        numericalSymbols: ["2"],
        geometricShapes: ["pillars", "crescent"]
      }
    },
    {
      name: "The Empress",
      arcana: "major", 
      numerology: 3,
      keywords: ["fertility", "creativity", "nurturing", "abundance", "nature"],
      uprightMeaning: "Fertility, creativity, nurturing, abundance, natural growth",
      reversedMeaning: "Creative block, dependence, smothering, neglect",
      hermeticSymbolism: "The Great Mother, creative force of nature, divine feminine in manifestation",
      spiritualLesson: "Embody nurturing creativity and connect with natural cycles",
      shadowAspect: "Overprotectiveness and creative stagnation",
      hebrewLetter: "Daleth",
      astrologicalCorrespondence: "Venus",
      element: "Earth",
      imagery: {
        description: "Crowned figure in nature with wheat and flowing water",
        symbols: ["crown", "wheat", "river", "trees", "pillows"],
        colors: ["green", "yellow", "blue"],
        numericalSymbols: ["3"],
        geometricShapes: ["heart", "circle"]
      }
    },
    {
      name: "The Emperor",
      arcana: "major",
      numerology: 4,
      keywords: ["authority", "structure", "leadership", "stability", "father"],
      uprightMeaning: "Authority, structure, leadership, stability, paternal guidance",
      reversedMeaning: "Tyranny, rigidity, abuse of power, lack of discipline",
      hermeticSymbolism: "Divine masculine authority, cosmic order, the father principle",
      spiritualLesson: "Develop healthy authority and create stable foundations",
      shadowAspect: "Authoritarian control and rigid thinking",
      hebrewLetter: "Heh",
      astrologicalCorrespondence: "Aries", 
      element: "Fire",
      imagery: {
        description: "Armored figure on throne with ram symbols and orb",
        symbols: ["throne", "ram", "orb", "scepter", "armor"],
        colors: ["red", "orange", "gold"],
        numericalSymbols: ["4"],
        geometricShapes: ["square", "triangle"]
      }
    },
    {
      name: "The Hierophant",
      arcana: "major",
      numerology: 5,
      keywords: ["tradition", "teaching", "spirituality", "guidance", "conformity"],
      uprightMeaning: "Spiritual teaching, tradition, guidance, religious authority",
      reversedMeaning: "Dogma, rigid thinking, spiritual rebellion, unconventional",
      hermeticSymbolism: "The bridge between earth and heaven, spiritual teacher, divine law",
      spiritualLesson: "Balance traditional wisdom with personal spiritual experience",
      shadowAspect: "Rigid dogma and spiritual authoritarianism",
      hebrewLetter: "Vau",
      astrologicalCorrespondence: "Taurus",
      element: "Earth",
      imagery: {
        description: "Religious figure blessing two disciples with crossed keys",
        symbols: ["keys", "crown", "staff", "pillars", "crossed hands"],
        colors: ["gold", "red", "blue"],
        numericalSymbols: ["5"],
        geometricShapes: ["cross", "pillars"]
      }
    },
    {
      name: "The Lovers",
      arcana: "major",
      numerology: 6,
      keywords: ["love", "relationships", "choice", "harmony", "union"],
      uprightMeaning: "Love, relationships, choice, values alignment, partnership",
      reversedMeaning: "Disharmony, values conflict, poor choices, separation",
      hermeticSymbolism: "Sacred marriage, union of opposites, divine love manifest",
      spiritualLesson: "Make choices based on love and higher values",
      shadowAspect: "Codependency and poor relationship choices",
      hebrewLetter: "Zayin",
      astrologicalCorrespondence: "Gemini",
      element: "Air",
      imagery: {
        description: "Two figures beneath angel with mountain and tree",
        symbols: ["angel", "mountain", "tree", "sun", "naked figures"],
        colors: ["blue", "yellow", "green"],
        numericalSymbols: ["6"],
        geometricShapes: ["triangle", "mountain"]
      }
    },
    {
      name: "The Chariot",
      arcana: "major",
      numerology: 7,
      keywords: ["willpower", "determination", "success", "control", "victory"],
      uprightMeaning: "Willpower, determination, success through effort, self-control",
      reversedMeaning: "Lack of direction, loss of control, defeat, scattered energy",
      hermeticSymbolism: "The soul's vehicle through incarnation, mastery over lower nature",
      spiritualLesson: "Direct willpower toward spiritual goals and overcome obstacles",
      shadowAspect: "Aggressive control and ruthless ambition",
      hebrewLetter: "Cheth",
      astrologicalCorrespondence: "Cancer",
      element: "Water",
      imagery: {
        description: "Armored figure in chariot pulled by two sphinxes",
        symbols: ["chariot", "sphinxes", "armor", "wand", "crown"],
        colors: ["blue", "yellow", "black", "white"],
        numericalSymbols: ["7"],
        geometricShapes: ["square", "circle"]
      }
    },
    {
      name: "Strength",
      arcana: "major",
      numerology: 8,
      keywords: ["inner strength", "courage", "patience", "compassion", "self-control"],
      uprightMeaning: "Inner strength, courage, patience, gentle control, compassion",
      reversedMeaning: "Weakness, self-doubt, lack of courage, abuse of power",
      hermeticSymbolism: "Spiritual strength over animal nature, divine love taming passion",
      spiritualLesson: "Develop inner strength through love and compassion",
      shadowAspect: "Weakness disguised as aggression",
      hebrewLetter: "Teth",
      astrologicalCorrespondence: "Leo",
      element: "Fire",
      imagery: {
        description: "Woman gently closing lion's mouth with infinity symbol above",
        symbols: ["lion", "infinity symbol", "flowers", "mountain"],
        colors: ["white", "red", "yellow"],
        numericalSymbols: ["8", "infinity"],
        geometricShapes: ["infinity", "oval"]
      }
    },
    {
      name: "The Hermit",
      arcana: "major",
      numerology: 9,
      keywords: ["introspection", "guidance", "wisdom", "solitude", "inner light"],
      uprightMeaning: "Introspection, seeking inner guidance, wisdom, soul searching",
      reversedMeaning: "Isolation, loneliness, withdrawal, lost way",
      hermeticSymbolism: "The inner teacher, divine wisdom illuminating the path",
      spiritualLesson: "Seek wisdom through inner contemplation and guide others",
      shadowAspect: "Isolation and withdrawal from service",
      hebrewLetter: "Yod",
      astrologicalCorrespondence: "Virgo",
      element: "Earth",
      imagery: {
        description: "Hooded figure with lantern on mountaintop",
        symbols: ["lantern", "staff", "mountain", "star", "cloak"],
        colors: ["gray", "yellow", "brown"],
        numericalSymbols: ["9"],
        geometricShapes: ["triangle", "circle"]
      }
    }
  ];
  
  // Minor Arcana (simplified for this example)
  const minorArcana: TarotCard[] = [
    {
      name: "Ace of Wands",
      suit: "Wands",
      number: 1,
      arcana: "minor",
      element: "Fire", 
      numerology: 1,
      keywords: ["new beginnings", "inspiration", "creative energy", "potential"],
      uprightMeaning: "New creative beginnings, inspiration, potential energy",
      reversedMeaning: "Lack of direction, delays, false starts",
      hermeticSymbolism: "Pure fire energy, divine spark of creation",
      spiritualLesson: "Channel creative inspiration into manifestation",
      shadowAspect: "Impulsive action without wisdom",
      imagery: {
        description: "Hand emerging from cloud holding wand with leaves",
        symbols: ["wand", "cloud", "leaves", "castle"],
        colors: ["yellow", "green", "gray"],
        numericalSymbols: ["1"],
        geometricShapes: ["cylinder", "oval"]
      }
    },
    {
      name: "Ace of Cups",
      suit: "Cups",
      number: 1,
      arcana: "minor",
      element: "Water",
      numerology: 1,
      keywords: ["new love", "emotional beginnings", "spiritual gift", "intuition"],
      uprightMeaning: "New emotional beginnings, love, spiritual gift, compassion",
      reversedMeaning: "Emotional blockage, emptiness, missed opportunity",
      hermeticSymbolism: "Pure water energy, divine love flowing forth",
      spiritualLesson: "Open heart to divine love and emotional wisdom",
      shadowAspect: "Emotional overwhelm and instability",
      imagery: {
        description: "Hand emerging from cloud holding overflowing cup",
        symbols: ["cup", "dove", "water", "lotus", "drops"],
        colors: ["blue", "white", "silver"],
        numericalSymbols: ["1"],
        geometricShapes: ["cup", "circle"]
      }
    }
    // Additional minor arcana cards would be added here...
  ];
  
  return [...majorArcana, ...minorArcana];
}

function getPositionName(spread: string, position: number): string {
  const positions = {
    single: ["Your Current Situation"],
    "three-card": ["Past/Foundation", "Present/Situation", "Future/Outcome"],
    "celtic-cross": [
      "Present Situation",
      "Challenge/Cross",  
      "Distant Past",
      "Recent Past",
      "Possible Outcome",
      "Immediate Future",
      "Your Approach",
      "External Influences", 
      "Hopes and Fears",
      "Final Outcome"
    ],
    "hermetic-seven": [
      "The Self",
      "The Situation", 
      "Challenges",
      "Foundation",
      "Past Influences",
      "Future Influences",
      "Final Outcome"
    ],
    "life-path": [
      "Soul Purpose",
      "Challenges to Overcome",
      "Gifts and Talents",
      "Life Lesson",
      "Highest Potential"
    ],
    relationship: [
      "You",
      "Your Partner",
      "Relationship Foundation",
      "Challenges",
      "Strengths", 
      "Future Potential"
    ]
  };
  
  const spreadPositions = positions[spread as keyof typeof positions] || ["Position"];
  return spreadPositions[position] || `Position ${position + 1}`;
}

function getContextualMeaning(card: TarotCard, position: string, reversed: boolean): string {
  const baseMeaning = reversed ? card.reversedMeaning : card.uprightMeaning;
  return `In the position of "${position}", ${card.name} ${reversed ? "(reversed) " : ""}suggests: ${baseMeaning}`;
}

function generatePersonalMessage(card: TarotCard, position: string, reversed: boolean): string {
  const orientation = reversed ? "reversed" : "upright";
  const message = reversed ? card.reversedMeaning : card.uprightMeaning;
  
  return `The ${orientation} ${card.name} in "${position}" brings you a personal message: This is a time to ${message.toLowerCase()}. ${card.spiritualLesson}`;
}

function generateActionGuidance(card: TarotCard, position: string, reversed: boolean): string {
  const actions = {
    "The Fool": reversed ? 
      "Think before you act, seek wise counsel, plan carefully" : 
      "Take the leap of faith, embrace new beginnings, trust the process",
    "The Magician": reversed ?
      "Examine your motives, stop manipulation, develop authentic power" :
      "Focus your will, use your skills, manifest your vision",
    "The High Priestess": reversed ?
      "Connect with your intuition, stop hiding from truth, seek inner guidance" :
      "Trust your inner knowing, develop psychic abilities, embrace mystery",
    "The Empress": reversed ?
      "Stop smothering others, address creative blocks, nurture yourself" :
      "Embrace your creativity, nurture growth, connect with nature",
    "The Emperor": reversed ?
      "Examine your use of authority, become more flexible, develop compassion" :
      "Take leadership, create structure, establish boundaries"
  };
  
  return actions[card.name as keyof typeof actions] || 
    (reversed ? "Address the shadow aspects and blocks" : "Embrace the positive qualities and move forward");
}

function interpretReading(
  cards: DrawnCard[],
  question: string,
  spread: string,
  timeframe: string,
  focusArea?: string
): ReadingInterpretation {
  const overallTheme = determineOverallTheme(cards);
  const primaryMessage = generatePrimaryMessage(cards, question);
  const cardInteractions = findCardInteractions(cards);
  const timelineGuidance = generateTimelineGuidance(cards, spread, timeframe);
  const challengesAndOpportunities = identifyChallengesAndOpportunities(cards);
  const spiritualLessons = extractSpiritualLessons(cards);
  
  return {
    overallTheme,
    primaryMessage,
    cardInteractions,
    timelineGuidance,
    challengesAndOpportunities,
    spiritualLessons
  };
}

function determineOverallTheme(cards: DrawnCard[]): string {
  const majorArcanaCount = cards.filter(c => c.card.arcana === "major").length;
  const reversedCount = cards.filter(c => c.reversed).length;
  
  if (majorArcanaCount >= cards.length * 0.6) {
    return "Major Life Themes - This reading addresses significant spiritual and life lessons";
  } else if (reversedCount >= cards.length * 0.5) {
    return "Inner Work and Challenges - Focus on addressing internal blocks and shadow aspects";
  } else {
    return "Practical Guidance - This reading offers concrete direction for your current situation";
  }
}

function generatePrimaryMessage(cards: DrawnCard[], question: string): string {
  const centralCard = cards[Math.floor(cards.length / 2)];
  const orientation = centralCard.reversed ? "challenges" : "opportunities";
  
  return `Regarding "${question}", the cards indicate that you are currently experiencing ${orientation} related to ${centralCard.card.keywords[0]}. The overall energy suggests that ${centralCard.card.hermeticSymbolism.toLowerCase()}. Your path forward involves ${centralCard.actionGuidance.toLowerCase()}.`;
}

function findCardInteractions(cards: DrawnCard[]): CardInteraction[] {
  const interactions: CardInteraction[] = [];
  
  // Find cards of same suit or numerology
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const card1 = cards[i];
      const card2 = cards[j];
      
      if (card1.card.suit && card2.card.suit && card1.card.suit === card2.card.suit) {
        interactions.push({
          cards: [card1.card.name, card2.card.name],
          relationship: `Same suit (${card1.card.suit})`,
          combinedMessage: `These cards share ${card1.card.element} energy, emphasizing themes of ${getSuitTheme(card1.card.suit)}`,
          significance: "Strong elemental influence in this area of life"
        });
      }
      
      if (card1.card.numerology === card2.card.numerology) {
        interactions.push({
          cards: [card1.card.name, card2.card.name],
          relationship: `Same numerology (${card1.card.numerology})`,
          combinedMessage: `Both cards carry the energy of ${card1.card.numerology}, emphasizing ${getNumerologyTheme(card1.card.numerology)}`,
          significance: "Reinforced numerical influence"
        });
      }
    }
  }
  
  return interactions;
}

function getSuitTheme(suit: string): string {
  const themes = {
    "Wands": "creativity, passion, and spiritual growth",
    "Cups": "emotions, relationships, and intuition",
    "Swords": "thoughts, communication, and mental challenges", 
    "Pentacles": "material concerns, health, and practical matters"
  };
  return themes[suit as keyof typeof themes] || "spiritual development";
}

function getNumerologyTheme(number: number): string {
  const themes = {
    1: "new beginnings and leadership",
    2: "balance and cooperation", 
    3: "creativity and expression",
    4: "stability and foundation",
    5: "change and freedom",
    6: "harmony and service",
    7: "wisdom and introspection",
    8: "power and material success",
    9: "completion and universal love"
  };
  return themes[number as keyof typeof themes] || "spiritual growth";
}

function generateTimelineGuidance(cards: DrawnCard[], spread: string, timeframe: string): TimelineGuidance {
  const pastInfluences = cards.filter(c => c.positionName.toLowerCase().includes("past"))
    .map(c => `${c.card.name} influence: ${c.contextualMeaning}`);
    
  const presentSituation = cards.filter(c => c.positionName.toLowerCase().includes("present") || 
    c.positionName.toLowerCase().includes("situation"))
    .map(c => `Current energy: ${c.contextualMeaning}`);
    
  const futureOutlook = cards.filter(c => c.positionName.toLowerCase().includes("future") ||
    c.positionName.toLowerCase().includes("outcome"))
    .map(c => `Future trajectory: ${c.contextualMeaning}`);
    
  const timing = [`This reading addresses ${timeframe} timeframe`, "Major shifts likely within 3-6 months"];
  
  return {
    pastInfluences: pastInfluences.length > 0 ? pastInfluences : ["Past influences integrated"],
    presentSituation: presentSituation.length > 0 ? presentSituation : ["Current situation stable"],
    futureOutlook: futureOutlook.length > 0 ? futureOutlook : ["Future remains unwritten"],
    timing
  };
}

function identifyChallengesAndOpportunities(cards: DrawnCard[]): ChallengesAndOpportunities {
  const challenges: Challenge[] = [];
  const opportunities: Opportunity[] = [];
  
  cards.forEach(drawnCard => {
    if (drawnCard.reversed) {
      challenges.push({
        description: `${drawnCard.card.shadowAspect}`,
        sourceCard: drawnCard.card.name,
        guidance: `Address through: ${drawnCard.actionGuidance}`,
        resolution: `When resolved, leads to: ${drawnCard.card.uprightMeaning}`
      });
    } else {
      opportunities.push({
        description: `${drawnCard.card.uprightMeaning}`,
        sourceCard: drawnCard.card.name,
        actionSteps: [drawnCard.actionGuidance, `Meditate on: ${drawnCard.card.hermeticSymbolism}`],
        potential: `Can develop into: ${drawnCard.card.spiritualLesson}`
      });
    }
  });
  
  return {
    challenges,
    opportunities,
    hiddenInfluences: ["Subconscious patterns affecting the situation", "Karmic influences at work"],
    externalFactors: ["Others' energy and intentions", "Planetary and cosmic influences"]
  };
}

function extractSpiritualLessons(cards: DrawnCard[]): string[] {
  return cards.map(c => c.card.spiritualLesson);
}

function generateSpiritualGuidance(
  cards: DrawnCard[],
  question: string,
  interpretation: ReadingInterpretation
): SpiritualGuidance {
  const soulLessons = interpretation.spiritualLessons;
  const karmicPatterns = identifyKarmicPatterns(cards);
  const spiritualPractices = recommendSpiritualPractices(cards);
  const meditation = createMeditation(cards);
  const affirmation = createAffirmation(cards, question);
  
  return {
    soulLessons,
    karmicPatterns,
    spiritualPractices,
    meditation,
    affirmation
  };
}

function identifyKarmicPatterns(cards: DrawnCard[]): string[] {
  const patterns = [];
  
  const majorArcanaCards = cards.filter(c => c.card.arcana === "major");
  if (majorArcanaCards.length > 0) {
    patterns.push("Major life themes and karmic lessons are active");
    patterns.push("Soul-level growth opportunities are present");
  }
  
  const reversedCards = cards.filter(c => c.reversed);
  if (reversedCards.length > 0) {
    patterns.push("Past-life patterns or unresolved karma surfacing for healing");
  }
  
  return patterns.length > 0 ? patterns : ["Current situation is part of natural soul evolution"];
}

function recommendSpiritualPractices(cards: DrawnCard[]): string[] {
  const practices = new Set<string>();
  
  cards.forEach(drawnCard => {
    const card = drawnCard.card;
    
    if (card.element) {
      practices.add(`Work with ${card.element} element through meditation or ritual`);
    }
    
    if (card.astrologicalCorrespondence) {
      practices.add(`Study and work with ${card.astrologicalCorrespondence} energy`);
    }
    
    if (card.arcana === "major") {
      practices.add(`Contemplate the archetypal energy of ${card.name}`);
    }
  });
  
  practices.add("Daily tarot meditation on the cards drawn");
  practices.add("Journaling about the messages received");
  
  return Array.from(practices);
}

function createMeditation(cards: DrawnCard[]): string {
  const centralCard = cards[0]; // Use first card for meditation focus
  
  return `Sit quietly and visualize the ${centralCard.card.name}. See yourself embodying the energy of this card. ${centralCard.card.imagery.description}. Feel the ${centralCard.card.element || 'spiritual'} energy flowing through you. Contemplate how ${centralCard.card.hermeticSymbolism.toLowerCase()}. Allow the wisdom of this card to integrate into your being.`;
}

function createAffirmation(cards: DrawnCard[], question: string): string {
  const primaryKeywords = cards[0].card.keywords.slice(0, 2);
  return `I embody ${primaryKeywords.join(' and ')} in my life. The guidance I seek regarding "${question}" flows to me clearly and I act upon it with wisdom and courage.`;
}

function generatePracticalAdvice(
  cards: DrawnCard[],
  focusArea: string | undefined,
  interpretation: ReadingInterpretation
): PracticalAdvice {
  const immediateActions = generateImmediateActions(cards);
  const longTermStrategy = generateLongTermStrategy(interpretation);
  const relationshipGuidance = generateRelationshipGuidance(cards);
  const careerInsights = generateCareerInsights(cards);
  const healthConsiderations = generateHealthConsiderations(cards);
  const financialWisdom = generateFinancialWisdom(cards);
  
  return {
    immediateActions,
    longTermStrategy,
    relationshipGuidance,
    careerInsights,
    healthConsiderations,
    financialWisdom
  };
}

function generateImmediateActions(cards: DrawnCard[]): string[] {
  const actions = cards.map(c => c.actionGuidance);
  actions.unshift("Reflect deeply on this reading's messages");
  actions.push("Take one concrete step based on the guidance received");
  return actions.slice(0, 5);
}

function generateLongTermStrategy(interpretation: ReadingInterpretation): string {
  return `Focus on ${interpretation.overallTheme.toLowerCase()}. ${interpretation.primaryMessage} Over the long term, integrate the spiritual lessons while taking practical action aligned with the guidance received.`;
}

function generateRelationshipGuidance(cards: DrawnCard[]): string[] {
  return [
    "Communicate honestly and openly about your needs and boundaries",
    "Practice compassion while maintaining healthy limits",
    "Address any control or manipulation patterns revealed in the reading",
    "Trust your intuition about people and relationships"
  ];
}

function generateCareerInsights(cards: DrawnCard[]): string[] {
  return [
    "Align your work with your spiritual values and purpose",
    "Use your natural talents and abilities more fully",
    "Consider how the cards' energies apply to your professional life",
    "Take calculated risks that align with the guidance received"
  ];
}

function generateHealthConsiderations(cards: DrawnCard[]): string[] {
  return [
    "Pay attention to stress levels and practice relaxation techniques",
    "Consider how emotional states affect physical health",
    "Integrate spiritual practices that support overall wellbeing",
    "Address any health concerns revealed symbolically in the cards"
  ];
}

function generateFinancialWisdom(cards: DrawnCard[]): string[] {
  return [
    "Make financial decisions from a place of wisdom rather than fear",
    "Consider the long-term implications of current financial choices",
    "Balance material security with spiritual values",
    "Use money as a tool for positive change and service"
  ];
}

function generateFollowUpGuidance(cards: DrawnCard[], question: string, spread: string): FollowUpGuidance {
  return {
    reflectionQuestions: [
      "How do the cards' messages apply to my current situation?",
      "What resistance am I feeling to the guidance received?",
      "Which card's energy do I most need to cultivate?",
      "What action steps feel most important and urgent?"
    ],
    journalPrompts: [
      `Write about how ${cards[0].card.name} reflects your current life situation`,
      "Explore any emotional reactions you had to specific cards",
      "Describe how you plan to implement the guidance received",
      "Reflect on patterns you notice between this and previous readings"
    ],
    nextSteps: [
      "Take concrete action on at least one piece of guidance",
      "Set a timeline for reassessing the situation",
      "Practice the recommended spiritual activities",
      "Share insights with trusted friends or mentors if appropriate"
    ],
    whenToReadAgain: spread === "single" ? 
      "In 1-2 weeks to check progress" : 
      "In 1-3 months or when significant changes occur",
    progressIndicators: [
      "Feeling more clarity about the situation",
      "Noticing synchronicities related to the card meanings",
      "Experiencing less emotional charge around the question",
      "Taking aligned action with greater ease"
    ]
  };
}

function generateReadingMetadata(spread: string, question: string): ReadingMetadata {
  const now = new Date();
  const moonPhases = ["new moon", "waxing crescent", "first quarter", "waxing gibbous", 
                     "full moon", "waning gibbous", "last quarter", "waning crescent"];
  const currentPhase = moonPhases[Math.floor(Math.random() * moonPhases.length)];
  
  const energeticQualities = ["clear and focused", "emotionally charged", "mystical and intuitive", 
                             "practical and grounded", "transformative and powerful"];
  const currentEnergy = energeticQualities[Math.floor(Math.random() * energeticQualities.length)];
  
  return {
    readingDate: now.toISOString().split('T')[0],
    moonPhase: currentPhase,
    readingType: spread,
    confidenceLevel: Math.floor(Math.random() * 30) + 70, // 70-99%
    energeticQuality: currentEnergy,
    synchronicity: [
      "The cards chosen align with current cosmic energies",
      "Multiple confirmation signs support this guidance"
    ]
  };
}