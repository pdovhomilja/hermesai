export interface NumerologyAnalysis {
  id: string;
  input: string;
  inputType: string;
  system: string;
  calculations: NumerologyCalculation[];
  primaryNumber: NumberInterpretation;
  secondaryNumbers: NumberInterpretation[];
  synthesis: NumerologySynthesis;
  spiritualGuidance: SpiritualGuidance;
  practicalApplication: PracticalApplication;
  culturalContext?: string;
}

export interface NumerologyCalculation {
  step: number;
  description: string;
  calculation: string;
  result: number;
  significance: string;
}

export interface NumberInterpretation {
  number: number;
  name: string;
  hermeticMeaning: string;
  spiritualQualities: string[];
  challenges: string[];
  lifeLesson: string;
  archangelConnection?: string;
  planetaryCorrespondence?: string;
  elementalAssociation?: string;
  symbolicMeaning: string;
  karmicImplication: string;
}

export interface NumerologySynthesis {
  overallMessage: string;
  dominantThemes: string[];
  evolutionaryPurpose: string;
  currentLifePhase: string;
  opportunities: string[];
  warnings: string[];
}

export interface SpiritualGuidance {
  meditation: string;
  affirmation: string;
  practices: string[];
  crystalRecommendations: string[];
  colorTherapy: string[];
}

export interface PracticalApplication {
  careerGuidance: string[];
  relationshipInsights: string[];
  healthConsiderations: string[];
  financialWisdom: string[];
  personalDevelopment: string[];
  timing: TimingGuidance;
}

export interface TimingGuidance {
  favorablePeriods: string[];
  challengingPeriods: string[];
  personalYearCycle?: string;
  universalYearInfluence?: string;
}

interface NumerologyParams {
  input: string;
  type: string;
  system: string;
  includeReduction: boolean;
  culturalContext?: string;
}

export async function calculateHermeticNumerology(params: NumerologyParams): Promise<NumerologyAnalysis> {
  const {
    input,
    type,
    system = "hermetic",
    includeReduction = true,
    culturalContext
  } = params;

  const analysisId = `numerology_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Perform calculations based on input type and system
  const calculations = performNumerologyCalculations(input, type, system, includeReduction);
  
  // Get primary number interpretation
  const primaryNumber = calculations[calculations.length - 1].result;
  const primaryInterpretation = interpretNumber(primaryNumber, system, true);
  
  // Get secondary numbers if relevant
  const secondaryNumbers = getSecondaryNumbers(input, type, system, calculations);
  
  // Create synthesis
  const synthesis = createNumerologySynthesis(
    primaryInterpretation,
    secondaryNumbers,
    input,
    type
  );
  
  // Generate spiritual guidance
  const spiritualGuidance = generateSpiritualGuidance(primaryInterpretation, secondaryNumbers);
  
  // Create practical application
  const practicalApplication = generatePracticalApplication(
    primaryInterpretation,
    secondaryNumbers,
    type
  );

  return {
    id: analysisId,
    input,
    inputType: type,
    system,
    calculations,
    primaryNumber: primaryInterpretation,
    secondaryNumbers,
    synthesis,
    spiritualGuidance,
    practicalApplication,
    culturalContext,
  };
}

function performNumerologyCalculations(
  input: string,
  type: string,
  system: string,
  includeReduction: boolean
): NumerologyCalculation[] {
  const calculations: NumerologyCalculation[] = [];
  
  if (type === "name") {
    return calculateNameNumerology(input, system, includeReduction, calculations);
  } else if (type === "birthdate") {
    return calculateBirthdateNumerology(input, system, includeReduction, calculations);
  } else if (type === "event") {
    return calculateEventNumerology(input, system, includeReduction, calculations);
  } else if (type === "phrase" || type === "question") {
    return calculatePhraseNumerology(input, system, includeReduction, calculations);
  }
  
  return calculations;
}

function calculateNameNumerology(
  name: string,
  system: string,
  includeReduction: boolean,
  calculations: NumerologyCalculation[]
): NumerologyCalculation[] {
  const letterValues = getLetterValues(system);
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  
  // Step 1: Convert letters to numbers
  let letterSum = 0;
  let letterCalculation = "";
  
  for (const letter of cleanName) {
    const value = letterValues[letter] || 0;
    letterSum += value;
    letterCalculation += `${letter}(${value}) + `;
  }
  
  letterCalculation = letterCalculation.slice(0, -3) + ` = ${letterSum}`;
  
  calculations.push({
    step: 1,
    description: "Convert each letter to its numerical value and sum",
    calculation: letterCalculation,
    result: letterSum,
    significance: "Raw vibrational energy of the name"
  });

  if (includeReduction && letterSum > 9) {
    return reduceToSingleDigit(letterSum, calculations, 2);
  }
  
  return calculations;
}

function calculateBirthdateNumerology(
  birthdate: string,
  system: string,
  includeReduction: boolean,
  calculations: NumerologyCalculation[]
): NumerologyCalculation[] {
  // Parse date (assuming format: MM/DD/YYYY or similar)
  const dateMatch = birthdate.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (!dateMatch) {
    // Try alternative format
    const altMatch = birthdate.match(/(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
    if (altMatch) {
      const [, year, month, day] = altMatch;
      return calculateBirthPath(parseInt(month), parseInt(day), parseInt(year), includeReduction, calculations);
    }
    throw new Error("Invalid date format. Please use MM/DD/YYYY or YYYY/MM/DD");
  }
  
  const [, month, day, year] = dateMatch;
  return calculateBirthPath(parseInt(month), parseInt(day), parseInt(year), includeReduction, calculations);
}

function calculateBirthPath(
  month: number,
  day: number,
  year: number,
  includeReduction: boolean,
  calculations: NumerologyCalculation[]
): NumerologyCalculation[] {
  // Step 1: Add all digits
  const allDigits = [month, day, year].join('').split('').map(d => parseInt(d));
  const sum = allDigits.reduce((acc, digit) => acc + digit, 0);
  
  calculations.push({
    step: 1,
    description: "Add all digits in the birthdate",
    calculation: `${month}/${day}/${year} → ${allDigits.join(' + ')} = ${sum}`,
    result: sum,
    significance: "Life path foundation number"
  });

  if (includeReduction && sum > 9 && ![11, 22, 33].includes(sum)) {
    return reduceToSingleDigit(sum, calculations, 2);
  }
  
  return calculations;
}

function calculateEventNumerology(
  event: string,
  system: string,
  includeReduction: boolean,
  calculations: NumerologyCalculation[]
): NumerologyCalculation[] {
  // Extract date if present, otherwise treat as phrase
  const dateMatch = event.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (dateMatch) {
    return calculateBirthdateNumerology(event, system, includeReduction, calculations);
  }
  
  return calculatePhraseNumerology(event, system, includeReduction, calculations);
}

function calculatePhraseNumerology(
  phrase: string,
  system: string,
  includeReduction: boolean,
  calculations: NumerologyCalculation[]
): NumerologyCalculation[] {
  const letterValues = getLetterValues(system);
  const cleanPhrase = phrase.toLowerCase().replace(/[^a-z\s]/g, '');
  const words = cleanPhrase.split(' ').filter(w => w.length > 0);
  
  let totalSum = 0;
  let wordCalculations = [];
  
  // Calculate each word
  for (const word of words) {
    let wordSum = 0;
    let wordCalc = "";
    
    for (const letter of word) {
      const value = letterValues[letter] || 0;
      wordSum += value;
      wordCalc += `${letter}(${value}) + `;
    }
    
    wordCalc = wordCalc.slice(0, -3) + ` = ${wordSum}`;
    wordCalculations.push(`${word}: ${wordCalc}`);
    totalSum += wordSum;
  }
  
  calculations.push({
    step: 1,
    description: "Calculate numerical value for each word",
    calculation: wordCalculations.join('\n'),
    result: totalSum,
    significance: "Combined vibrational essence of the phrase"
  });

  if (includeReduction && totalSum > 9) {
    return reduceToSingleDigit(totalSum, calculations, 2);
  }
  
  return calculations;
}

function reduceToSingleDigit(
  number: number,
  calculations: NumerologyCalculation[],
  startStep: number
): NumerologyCalculation[] {
  let currentNumber = number;
  let step = startStep;
  
  while (currentNumber > 9 && ![11, 22, 33].includes(currentNumber)) {
    const digits = currentNumber.toString().split('').map(d => parseInt(d));
    const newSum = digits.reduce((acc, digit) => acc + digit, 0);
    
    calculations.push({
      step,
      description: "Reduce to single digit by adding individual digits",
      calculation: `${currentNumber} → ${digits.join(' + ')} = ${newSum}`,
      result: newSum,
      significance: step === startStep ? "Primary reduction" : "Further reduction"
    });
    
    currentNumber = newSum;
    step++;
  }
  
  return calculations;
}

function getLetterValues(system: string): Record<string, number> {
  const systems = {
    pythagorean: {
      a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
      j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
      s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8
    },
    chaldean: {
      a: 1, b: 2, c: 3, d: 4, e: 5, f: 8, g: 3, h: 5, i: 1,
      j: 1, k: 2, l: 3, m: 4, n: 5, o: 7, p: 8, q: 1, r: 2,
      s: 3, t: 4, u: 6, v: 6, w: 6, x: 5, y: 1, z: 7
    },
    hermetic: {
      a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
      j: 1, k: 11, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
      s: 1, t: 2, u: 21, v: 22, w: 5, x: 6, y: 7, z: 8
    },
    kabbalistic: {
      a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
      j: 10, k: 20, l: 30, m: 40, n: 50, o: 60, p: 70, q: 80, r: 90,
      s: 100, t: 200, u: 300, v: 400, w: 500, x: 600, y: 700, z: 800
    }
  };
  
  return systems[system as keyof typeof systems] || systems.hermetic;
}

function interpretNumber(number: number, system: string, isPrimary: boolean): NumberInterpretation {
  const interpretations = {
    1: {
      name: "The Monad - Unity and Leadership",
      hermeticMeaning: "The source of all numbers, representing divine unity and the creative principle. In hermetic tradition, 1 is the primordial cause from which all manifestation emerges.",
      spiritualQualities: ["Leadership", "Independence", "Initiative", "Originality", "Divine spark"],
      challenges: ["Egoism", "Impatience", "Isolation", "Domination", "Stubbornness"],
      lifeLesson: "To develop balanced leadership while maintaining connection to divine source",
      archangelConnection: "Michael - Divine strength and protection",
      planetaryCorrespondence: "Sun - Life force and vitality",
      elementalAssociation: "Fire - Active, creative energy",
      symbolicMeaning: "The point, the seed, the beginning of all creation",
      karmicImplication: "Learning to lead others while staying connected to divine will"
    },
    2: {
      name: "The Dyad - Duality and Cooperation",
      hermeticMeaning: "The principle of duality and reflection, representing the feminine receptive principle that receives and shapes the creative force of the monad.",
      spiritualQualities: ["Cooperation", "Diplomacy", "Intuition", "Sensitivity", "Partnership"],
      challenges: ["Indecision", "Over-dependency", "Passivity", "Emotional volatility", "Self-doubt"],
      lifeLesson: "To develop inner balance and peaceful collaboration with others",
      archangelConnection: "Gabriel - Divine messenger and emotional healing",
      planetaryCorrespondence: "Moon - Intuition and receptivity",
      elementalAssociation: "Water - Flowing, adaptive energy",
      symbolicMeaning: "The line, the mirror, the bridge between opposites",
      karmicImplication: "Learning to balance independence with healthy interdependence"
    },
    3: {
      name: "The Triad - Creation and Expression",
      hermeticMeaning: "The synthesis of unity and duality, representing creative expression and the manifestation of divine ideas in the material world.",
      spiritualQualities: ["Creativity", "Communication", "Joy", "Optimism", "Artistic expression"],
      challenges: ["Scattered energy", "Superficiality", "Mood swings", "Procrastination", "Criticism sensitivity"],
      lifeLesson: "To channel creative energy constructively and communicate divine inspiration",
      archangelConnection: "Uriel - Divine wisdom and illumination",
      planetaryCorrespondence: "Jupiter - Expansion and wisdom",
      elementalAssociation: "Air - Communication and mental activity",
      symbolicMeaning: "The triangle, the pyramid, the perfect balance of forces",
      karmicImplication: "Learning to use creative gifts in service of higher purpose"
    },
    4: {
      name: "The Tetrad - Foundation and Order",
      hermeticMeaning: "The principle of manifestation and material form, representing the four elements and the stable foundation upon which all creation rests.",
      spiritualQualities: ["Stability", "Organization", "Reliability", "Practicality", "Endurance"],
      challenges: ["Rigidity", "Limitation", "Materialism", "Resistance to change", "Over-seriousness"],
      lifeLesson: "To build lasting foundations while remaining open to spiritual growth",
      archangelConnection: "Raphael - Divine healing and protection",
      planetaryCorrespondence: "Saturn - Structure and discipline",
      elementalAssociation: "Earth - Grounding and manifestation",
      symbolicMeaning: "The square, the cross, the four directions of space",
      karmicImplication: "Learning to balance material security with spiritual development"
    },
    5: {
      name: "The Pentad - Freedom and Experience",
      hermeticMeaning: "The number of human experience and the five senses, representing freedom, curiosity, and the dynamic interaction between spirit and matter.",
      spiritualQualities: ["Freedom", "Adventure", "Curiosity", "Versatility", "Progressive thinking"],
      challenges: ["Restlessness", "Impulsiveness", "Inconsistency", "Addiction", "Irresponsibility"],
      lifeLesson: "To explore life freely while developing wisdom and self-discipline",
      archangelConnection: "Camael - Divine strength and courage",
      planetaryCorrespondence: "Mercury - Communication and travel",
      elementalAssociation: "Ether - The fifth element binding all others",
      symbolicMeaning: "The pentagram, the five-pointed star, human microcosm",
      karmicImplication: "Learning to use freedom constructively for soul evolution"
    },
    6: {
      name: "The Hexad - Harmony and Service",
      hermeticMeaning: "The number of cosmic harmony and service, representing the balance between divine and earthly love, the heart center of creation.",
      spiritualQualities: ["Nurturing", "Responsibility", "Healing", "Compassion", "Service to others"],
      challenges: ["Over-responsibility", "Martyrdom", "Perfectionism", "Interference", "Emotional burden"],
      lifeLesson: "To serve others while maintaining healthy boundaries and self-care",
      archangelConnection: "Haniel - Divine love and harmony",
      planetaryCorrespondence: "Venus - Love and beauty",
      elementalAssociation: "Earth/Water - Nurturing and sustaining",
      symbolicMeaning: "The hexagram, the Star of David, perfect balance",
      karmicImplication: "Learning to love unconditionally while honoring personal needs"
    },
    7: {
      name: "The Heptad - Wisdom and Mysticism",
      hermeticMeaning: "The sacred number of spiritual completion and mystical wisdom, representing the seven planes of existence and the path of inner development.",
      spiritualQualities: ["Spiritual insight", "Mysticism", "Analysis", "Research", "Inner wisdom"],
      challenges: ["Isolation", "Skepticism", "Aloofness", "Perfectionism", "Mental obsession"],
      lifeLesson: "To develop inner wisdom while staying connected to practical reality",
      archangelConnection: "Zadkiel - Divine wisdom and transformation",
      planetaryCorrespondence: "Neptune - Spirituality and intuition",
      elementalAssociation: "Water/Spirit - Deep emotional and spiritual currents",
      symbolicMeaning: "The septagram, the seven chakras, the seven heavens",
      karmicImplication: "Learning to bridge mystical insights with earthly service"
    },
    8: {
      name: "The Ogdoad - Power and Material Mastery",
      hermeticMeaning: "The number of material mastery and cosmic justice, representing the balance of spiritual and material power, karma and achievement.",
      spiritualQualities: ["Material success", "Leadership", "Efficiency", "Ambition", "Justice"],
      challenges: ["Materialism", "Power abuse", "Workaholism", "Ruthlessness", "Imbalance"],
      lifeLesson: "To achieve material success while serving the greater good",
      archangelConnection: "Raguel - Divine justice and harmony",
      planetaryCorrespondence: "Mars - Action and achievement",
      elementalAssociation: "Fire/Earth - Dynamic manifestation",
      symbolicMeaning: "The octagon, infinity symbol, the eightfold path",
      karmicImplication: "Learning to use power and resources for collective benefit"
    },
    9: {
      name: "The Ennead - Completion and Universal Love",
      hermeticMeaning: "The number of completion and universal consciousness, representing the end of one cycle and preparation for higher octaves of being.",
      spiritualQualities: ["Universal love", "Compassion", "Wisdom", "Completion", "Service to humanity"],
      challenges: ["Emotional extremes", "Impracticality", "Disappointment", "Idealism", "Letting go"],
      lifeLesson: "To embody universal love and wisdom while releasing attachment to outcomes",
      archangelConnection: "Metatron - Divine presence and transformation",
      planetaryCorrespondence: "Pluto - Transformation and regeneration",
      elementalAssociation: "All elements - Universal synthesis",
      symbolicMeaning: "The enneagram, the triple trinity, completion before new beginning",
      karmicImplication: "Learning to serve humanity while completing personal evolution"
    },
    11: {
      name: "The Master Teacher - Illumination",
      hermeticMeaning: "The first master number, representing spiritual illumination and the ability to channel higher wisdom for humanity's benefit.",
      spiritualQualities: ["Spiritual insight", "Intuition", "Inspiration", "Teaching", "Psychic abilities"],
      challenges: ["Nervousness", "Impracticality", "Extremism", "Illusion", "Hypersensitivity"],
      lifeLesson: "To channel spiritual gifts for the enlightenment of others",
      archangelConnection: "Michael - Divine illumination and protection",
      planetaryCorrespondence: "Uranus - Higher consciousness and revelation",
      elementalAssociation: "Spirit - Pure spiritual energy",
      symbolicMeaning: "The pillars of the temple, gateway to higher consciousness",
      karmicImplication: "Teaching spiritual wisdom gained through personal transformation"
    },
    22: {
      name: "The Master Builder - Manifestation",
      hermeticMeaning: "The master number of material manifestation guided by spiritual vision, building lasting structures for humanity's evolution.",
      spiritualQualities: ["Visionary leadership", "Practical idealism", "Building", "Manifestation", "Global service"],
      challenges: ["Overwhelming pressure", "Impatience", "Burnout", "Materialism", "Perfectionism"],
      lifeLesson: "To manifest spiritual visions in practical, lasting ways",
      archangelConnection: "Gabriel - Divine planning and manifestation",
      planetaryCorrespondence: "Saturn - Structure and responsibility",
      elementalAssociation: "Earth/Spirit - Grounded spiritual manifestation",
      symbolicMeaning: "The master mason's square, building the spiritual temple",
      karmicImplication: "Creating lasting foundations for humanity's spiritual evolution"
    },
    33: {
      name: "The Master Healer - Compassionate Service",
      hermeticMeaning: "The master number of compassionate service and healing, representing the Christ consciousness in action.",
      spiritualQualities: ["Universal compassion", "Healing", "Teaching", "Sacrifice", "Divine love"],
      challenges: ["Martyrdom", "Emotional burden", "Overwhelm", "Unrealistic expectations", "Self-neglect"],
      lifeLesson: "To embody divine love and healing while maintaining personal wholeness",
      archangelConnection: "Raphael - Divine healing and compassion",
      planetaryCorrespondence: "Neptune - Universal love and compassion",
      elementalAssociation: "Water/Spirit - Emotional and spiritual healing",
      symbolicMeaning: "The age of Christ, the master teacher and healer",
      karmicImplication: "Healing humanity through embodiment of divine love"
    }
  };
  
  const interpretation = interpretations[number as keyof typeof interpretations];
  if (!interpretation) {
    // For numbers not specifically defined, create a basic interpretation
    return {
      number,
      name: `Number ${number}`,
      hermeticMeaning: `This number carries unique vibrational qualities that require individual interpretation within the context of your specific situation.`,
      spiritualQualities: ["Unique expression", "Individual path", "Special purpose"],
      challenges: ["Finding meaning", "Understanding purpose", "Integration"],
      lifeLesson: `To understand and express the unique qualities of the number ${number}`,
      symbolicMeaning: `The essence of ${number} in your personal spiritual journey`,
      karmicImplication: `Learning the specific lessons associated with the vibration of ${number}`
    };
  }
  
  return {
    number,
    ...interpretation
  };
}

function getSecondaryNumbers(
  input: string,
  type: string,
  system: string,
  calculations: NumerologyCalculation[]
): NumberInterpretation[] {
  const secondaryNumbers: NumberInterpretation[] = [];
  
  // For names, calculate vowels and consonants separately
  if (type === "name") {
    const vowels = input.toLowerCase().match(/[aeiou]/g) || [];
    const consonants = input.toLowerCase().match(/[bcdfghjklmnpqrstvwxyz]/g) || [];
    
    if (vowels.length > 0) {
      const vowelSum = calculateLetterSum(vowels.join(''), system);
      const vowelNumber = reduceNumber(vowelSum);
      secondaryNumbers.push(interpretNumber(vowelNumber, system, false));
    }
    
    if (consonants.length > 0) {
      const consonantSum = calculateLetterSum(consonants.join(''), system);
      const consonantNumber = reduceNumber(consonantSum);
      secondaryNumbers.push(interpretNumber(consonantNumber, system, false));
    }
  }
  
  // For birthdates, calculate additional significant numbers
  if (type === "birthdate") {
    // Add birth day and month as secondary influences
    const dateMatch = input.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
    if (dateMatch) {
      const [, month, day] = dateMatch;
      const dayNumber = reduceNumber(parseInt(day));
      const monthNumber = reduceNumber(parseInt(month));
      
      if (dayNumber !== calculations[calculations.length - 1].result) {
        secondaryNumbers.push(interpretNumber(dayNumber, system, false));
      }
      if (monthNumber !== calculations[calculations.length - 1].result && monthNumber !== dayNumber) {
        secondaryNumbers.push(interpretNumber(monthNumber, system, false));
      }
    }
  }
  
  return secondaryNumbers;
}

function calculateLetterSum(letters: string, system: string): number {
  const letterValues = getLetterValues(system);
  return letters.split('').reduce((sum, letter) => sum + (letterValues[letter] || 0), 0);
}

function reduceNumber(number: number): number {
  while (number > 9 && ![11, 22, 33].includes(number)) {
    number = number.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return number;
}

function createNumerologySynthesis(
  primaryNumber: NumberInterpretation,
  secondaryNumbers: NumberInterpretation[],
  input: string,
  type: string
): NumerologySynthesis {
  const allNumbers = [primaryNumber, ...secondaryNumbers];
  const dominantThemes = extractDominantThemes(allNumbers);
  
  return {
    overallMessage: `The numerological analysis of "${input}" reveals a ${primaryNumber.name.toLowerCase()} vibration, indicating ${primaryNumber.hermeticMeaning.split('.')[0].toLowerCase()}. This suggests a soul purpose centered around ${primaryNumber.spiritualQualities[0].toLowerCase()} and ${primaryNumber.spiritualQualities[1].toLowerCase()}.`,
    dominantThemes,
    evolutionaryPurpose: determineEvolutionaryPurpose(primaryNumber, secondaryNumbers),
    currentLifePhase: determineLifePhase(primaryNumber, type),
    opportunities: extractOpportunities(allNumbers),
    warnings: extractWarnings(allNumbers)
  };
}

function extractDominantThemes(numbers: NumberInterpretation[]): string[] {
  const themes = new Set<string>();
  
  numbers.forEach(num => {
    num.spiritualQualities.forEach(quality => {
      themes.add(quality.toLowerCase());
    });
  });
  
  return Array.from(themes).slice(0, 5);
}

function determineEvolutionaryPurpose(
  primaryNumber: NumberInterpretation,
  secondaryNumbers: NumberInterpretation[]
): string {
  const purposes = {
    1: "To develop authentic leadership and pioneering spirit in service of collective evolution",
    2: "To master cooperation and bring harmony to conflicted situations",
    3: "To express divine creativity and inspire others through artistic and communicative gifts",
    4: "To build stable foundations and practical structures for spiritual community",
    5: "To explore and experience life fully while teaching freedom and adaptability",
    6: "To nurture and heal others while maintaining healthy boundaries and self-love",
    7: "To develop spiritual wisdom and share mystical insights with those ready to receive them",
    8: "To achieve material mastery while using power and resources ethically for collective benefit",
    9: "To embody universal love and complete karmic cycles through compassionate service",
    11: "To channel higher spiritual teachings and illuminate the path for others",
    22: "To manifest visionary projects that serve humanity's spiritual evolution",
    33: "To heal and teach through embodiment of divine love and compassion"
  };
  
  return purposes[primaryNumber.number as keyof typeof purposes] || 
    "To fulfill a unique evolutionary purpose through the integration of your numerical influences";
}

function determineLifePhase(primaryNumber: NumberInterpretation, type: string): string {
  if (type === "birthdate") {
    const phases = {
      1: "Initiation Phase - Beginning new cycles and developing independence",
      2: "Cooperation Phase - Learning partnership and emotional balance",
      3: "Expression Phase - Developing creative and communication abilities",
      4: "Foundation Phase - Building security and establishing systems",
      5: "Freedom Phase - Exploring possibilities and expanding horizons",
      6: "Service Phase - Accepting responsibility and nurturing others",
      7: "Wisdom Phase - Developing inner knowledge and spiritual understanding",
      8: "Mastery Phase - Achieving material success and learning ethical power use",
      9: "Completion Phase - Letting go and preparing for new cycles",
      11: "Illumination Phase - Channeling higher wisdom and teaching others",
      22: "Manifestation Phase - Building lasting structures for collective benefit",
      33: "Healing Phase - Serving others through compassionate action"
    };
    
    return phases[primaryNumber.number as keyof typeof phases] || "Personal Development Phase";
  }
  
  return "Discovery Phase - Understanding the deeper meaning of this influence";
}

function extractOpportunities(numbers: NumberInterpretation[]): string[] {
  const opportunities = new Set<string>();
  
  numbers.forEach(num => {
    opportunities.add(`Develop ${num.spiritualQualities[0].toLowerCase()} abilities`);
    opportunities.add(`Overcome tendency toward ${num.challenges[0].toLowerCase()}`);
    opportunities.add(`Apply ${num.name.split('-')[0].trim()} energy constructively`);
  });
  
  return Array.from(opportunities).slice(0, 6);
}

function extractWarnings(numbers: NumberInterpretation[]): string[] {
  const warnings = new Set<string>();
  
  numbers.forEach(num => {
    num.challenges.forEach(challenge => {
      warnings.add(`Beware of falling into patterns of ${challenge.toLowerCase()}`);
    });
  });
  
  return Array.from(warnings).slice(0, 4);
}

function generateSpiritualGuidance(
  primaryNumber: NumberInterpretation,
  secondaryNumbers: NumberInterpretation[]
): SpiritualGuidance {
  const meditation = `Meditate on the symbol and energy of the number ${primaryNumber.number}. ${primaryNumber.symbolicMeaning}. Visualize this number glowing with golden light, integrating its wisdom into your being.`;
  
  const affirmation = `I embody the highest expression of ${primaryNumber.name}. ${primaryNumber.spiritualQualities.slice(0, 2).join(' and ')} flow through me naturally and gracefully.`;
  
  const practices = [
    `Daily contemplation of the number ${primaryNumber.number} and its symbolic meaning`,
    `Work with ${primaryNumber.elementalAssociation} energy through meditation or ritual`,
    `Study the hermetic principles related to your numbers`,
    `Practice balancing the challenges associated with your numbers`
  ];
  
  const crystalRecommendations = getCrystalRecommendations(primaryNumber.number);
  const colorTherapy = getColorTherapy(primaryNumber.number);
  
  return {
    meditation,
    affirmation,
    practices,
    crystalRecommendations,
    colorTherapy
  };
}

function getCrystalRecommendations(number: number): string[] {
  const crystalMappings = {
    1: ["Ruby", "Garnet", "Red Jasper", "Hematite"],
    2: ["Moonstone", "Rose Quartz", "Pearl", "Orange Calcite"],
    3: ["Citrine", "Yellow Topaz", "Amber", "Tiger's Eye"],
    4: ["Emerald", "Green Aventurine", "Malachite", "Moss Agate"],
    5: ["Sapphire", "Lapis Lazuli", "Sodalite", "Turquoise"],
    6: ["Indigo", "Amethyst", "Charoite", "Iolite"],
    7: ["Amethyst", "Clear Quartz", "Selenite", "Fluorite"],
    8: ["Pink Tourmaline", "Rhodochrosite", "Kunzite", "Pink Sapphire"],
    9: ["Gold", "Pyrite", "Yellow Diamond", "Sunstone"],
    11: ["Clear Quartz", "Moldavite", "Phenakite", "Danburite"],
    22: ["Moldavite", "Meteorite", "Tektite", "Clear Quartz"],
    33: ["Seraphinite", "Angel Phantom Quartz", "Celestite", "Angelite"]
  };
  
  return crystalMappings[number as keyof typeof crystalMappings] || ["Clear Quartz", "Amethyst", "Rose Quartz"];
}

function getColorTherapy(number: number): string[] {
  const colorMappings = {
    1: ["Red", "Orange", "Bright colors for energy and leadership"],
    2: ["Orange", "Peach", "Soft colors for cooperation and balance"],
    3: ["Yellow", "Gold", "Bright colors for creativity and expression"],
    4: ["Green", "Brown", "Earth tones for grounding and stability"],
    5: ["Blue", "Turquoise", "Dynamic colors for freedom and adventure"],
    6: ["Indigo", "Deep blue", "Nurturing colors for service and healing"],
    7: ["Violet", "Purple", "Mystical colors for wisdom and spirituality"],
    8: ["Pink", "Rose", "Balancing colors for power and compassion"],
    9: ["Gold", "All colors", "Universal colors for completion and service"],
    11: ["Silver", "White", "High vibration colors for illumination"],
    22: ["Platinum", "Crystal", "Master colors for manifestation"],
    33: ["Iridescent", "Rainbow", "Healing colors for service and love"]
  };
  
  return colorMappings[number as keyof typeof colorMappings] || ["White", "Gold", "Purple"];
}

function generatePracticalApplication(
  primaryNumber: NumberInterpretation,
  secondaryNumbers: NumberInterpretation[],
  type: string
): PracticalApplication {
  const careerGuidance = getCareerGuidance(primaryNumber.number);
  const relationshipInsights = getRelationshipInsights(primaryNumber.number);
  const healthConsiderations = getHealthConsiderations(primaryNumber.number);
  const financialWisdom = getFinancialWisdom(primaryNumber.number);
  const personalDevelopment = getPersonalDevelopment(primaryNumber);
  const timing = getTimingGuidance(primaryNumber.number);
  
  return {
    careerGuidance,
    relationshipInsights,
    healthConsiderations,
    financialWisdom,
    personalDevelopment,
    timing
  };
}

function getCareerGuidance(number: number): string[] {
  const careerMappings = {
    1: ["Leadership roles", "Entrepreneurship", "Pioneer industries", "Independent ventures"],
    2: ["Counseling", "Diplomacy", "Partnership roles", "Supportive services"],
    3: ["Creative arts", "Communication", "Entertainment", "Teaching"],
    4: ["Building/construction", "Organization", "Systematic work", "Foundation roles"],
    5: ["Travel", "Sales", "Marketing", "Adventure industries", "Communications"],
    6: ["Healthcare", "Education", "Family services", "Hospitality", "Counseling"],
    7: ["Research", "Analysis", "Spiritual work", "Academia", "Investigation"],
    8: ["Business", "Finance", "Management", "Real estate", "Executive roles"],
    9: ["Humanitarian work", "Non-profit", "Global service", "Arts", "Healing"],
    11: ["Teaching", "Spiritual guidance", "Counseling", "Inspirational work"],
    22: ["Architecture", "Engineering", "Large-scale projects", "Visionary leadership"],
    33: ["Healing professions", "Teaching", "Ministry", "Social work"]
  };
  
  return careerMappings[number as keyof typeof careerMappings] || ["Unique path requiring individual exploration"];
}

function getRelationshipInsights(number: number): string[] {
  const relationshipMappings = {
    1: ["Need for independence in relationships", "Natural leader in partnerships", "Attract followers or supporters"],
    2: ["Excellent at cooperation and compromise", "Sensitive to partner's needs", "May struggle with decision-making"],
    3: ["Bring joy and creativity to relationships", "Need intellectual and creative stimulation", "May scatter emotional energy"],
    4: ["Loyal and dependable partner", "Build stable, lasting relationships", "May be rigid or overly serious"],
    5: ["Need freedom within committed relationships", "Bring adventure and spontaneity", "May struggle with routine"],
    6: ["Natural nurturer and caregiver", "Take responsibility for others' happiness", "May become overprotective"],
    7: ["Need solitude even within relationships", "Deep, spiritual connections preferred", "May seem aloof or distant"],
    8: ["Attracted to successful, ambitious partners", "May prioritize work over relationships", "Power dynamics important"],
    9: ["Love unconditionally and universally", "May idealize partners", "Need to learn healthy boundaries"],
    11: ["Intense, spiritual connections", "Highly intuitive about partners", "May be overly sensitive"],
    22: ["Attract partners who share vision", "Build lasting relationship foundations", "May be demanding perfectionist"],
    33: ["Heal others through love", "May sacrifice self for others", "Attracted to those needing healing"]
  };
  
  return relationshipMappings[number as keyof typeof relationshipMappings] || ["Unique relationship patterns requiring individual understanding"];
}

function getHealthConsiderations(number: number): string[] {
  const healthMappings = {
    1: ["Head and brain health", "Stress management important", "Exercise leadership through physical activity"],
    2: ["Emotional balance affects physical health", "Digestive system sensitivity", "Need harmonious environment"],
    3: ["Throat and respiratory system", "Creative expression vital for health", "Mood affects physical wellbeing"],
    4: ["Bones, joints, and structural health", "Need regular, systematic health routines", "May hold tension in body"],
    5: ["Nervous system sensitivity", "Need variety in diet and exercise", "Freedom of movement important"],
    6: ["Heart and circulatory system", "May absorb others' health issues", "Service to others energizes health"],
    7: ["Mental health and spiritual practices", "Need quiet time for restoration", "May be sensitive to environments"],
    8: ["Stress-related health issues", "Need balance between work and rest", "Strong constitution when balanced"],
    9: ["Universal health consciousness", "May experience emotional health swings", "Completion of health cycles important"],
    11: ["Highly sensitive nervous system", "Need spiritual practices for health", "Energy healing beneficial"],
    22: ["Strong physical constitution", "May push body too hard", "Need grounding physical practices"],
    33: ["Tendency to heal others' ailments", "May neglect own health needs", "Compassion fatigue possible"]
  };
  
  return healthMappings[number as keyof typeof healthMappings] || ["Maintain balance between all aspects of health"];
}

function getFinancialWisdom(number: number): string[] {
  const financialMappings = {
    1: ["Natural entrepreneur", "Independent financial ventures", "Leadership in financial matters"],
    2: ["Partnership investments work well", "Cooperative financial ventures", "May need security focus"],
    3: ["Creative financial expression", "Income through communication/arts", "May be scattered with money"],
    4: ["Systematic approach to wealth building", "Conservative investments", "Long-term financial stability"],
    5: ["Diverse income streams", "International financial opportunities", "May take financial risks"],
    6: ["Service-oriented income", "May give too much financially", "Family financial responsibility"],
    7: ["Research investments carefully", "May be detached from money", "Spiritual approach to finances"],
    8: ["Natural business and financial acumen", "Potential for significant wealth", "Ethical money management important"],
    9: ["Money flows in cycles", "Generous with resources", "Completion of financial karmic patterns"],
    11: ["Intuitive financial insights", "Money comes through spiritual work", "May be impractical with finances"],
    22: ["Large-scale financial projects", "Master builder of wealth", "Responsible for significant resources"],
    33: ["Money as tool for healing/service", "May sacrifice financial gain for service", "Abundant when aligned with purpose"]
  };
  
  return financialMappings[number as keyof typeof financialMappings] || ["Develop unique relationship with money and resources"];
}

function getPersonalDevelopment(primaryNumber: NumberInterpretation): string[] {
  return [
    `Focus on developing ${primaryNumber.spiritualQualities[0].toLowerCase()}`,
    `Work to overcome tendency toward ${primaryNumber.challenges[0].toLowerCase()}`,
    `Study and embody the deeper meaning of ${primaryNumber.name}`,
    primaryNumber.lifeLesson,
    `Integrate the wisdom of your ${primaryNumber.planetaryCorrespondence || 'planetary'} influence`
  ];
}

function getTimingGuidance(number: number): TimingGuidance {
  const currentYear = new Date().getFullYear();
  const universalYear = reduceNumber(currentYear);
  
  const favorablePeriods = [
    `Personal year ${number} (every 9 years)`,
    `Days of the month containing ${number}`,
    `Months that reduce to ${number}`
  ];
  
  const challengingPeriods = [
    `Periods of major ${number}-related lessons`,
    `When avoiding ${number} energy`,
    `During resistance to personal growth`
  ];
  
  return {
    favorablePeriods,
    challengingPeriods,
    personalYearCycle: `Consider calculating your personal year by adding birth month + birth day + current year`,
    universalYearInfluence: `Current universal year ${universalYear} affects global and personal themes`
  };
}