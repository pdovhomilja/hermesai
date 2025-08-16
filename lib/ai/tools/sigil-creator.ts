export interface MagicalSigil {
  id: string;
  intention: string;
  method: string;
  complexity: string;
  design: SigilDesign;
  activation: SigilActivation;
  usage: SigilUsage;
  correspondences: SigilCorrespondences;
  variations: SigilVariation[];
  maintenance: SigilMaintenance;
}

export interface SigilDesign {
  structure: SigilStructure;
  visualization: SigilVisualization;
  construction: SigilConstruction;
  symbolElements: SymbolElement[];
  geometricFoundation: GeometricFoundation;
  energeticPatterns: string[];
}

export interface SigilStructure {
  primaryShape: string;
  secondaryShapes: string[];
  connectionPatterns: string[];
  symmetryType: string;
  centralFocus: string;
  energyFlow: string;
}

export interface SigilVisualization {
  description: string;
  colors: string[];
  texture: string;
  luminosity: string;
  movement: string;
  atmosphere: string;
}

export interface SigilConstruction {
  baseLetters?: string[];
  eliminatedLetters?: string[];
  combinedElements: string[];
  simplificationSteps: string[];
  finalForm: string;
  alternativeVersions: string[];
}

export interface SymbolElement {
  symbol: string;
  meaning: string;
  placement: string;
  significance: string;
  energeticFunction: string;
}

export interface GeometricFoundation {
  primaryGeometry: string;
  sacredProportions: string[];
  mathematicalRatios: string[];
  energeticSignificance: string;
}

export interface SigilActivation {
  preparationRitual: ActivationStep[];
  activationMethods: ActivationMethod[];
  timing: ActivationTiming;
  materials: ActivationMaterial[];
  safetyConsiderations: string[];
}

export interface ActivationStep {
  step: number;
  action: string;
  purpose: string;
  duration: string;
  visualization: string;
  incantation?: string;
}

export interface ActivationMethod {
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  effectiveness: number;
  requirements: string[];
  process: string[];
}

export interface ActivationTiming {
  optimalTimes: string[];
  lunarPhases: string[];
  planetaryHours: string[];
  seasonalConsiderations: string[];
  personalTiming: string[];
}

export interface ActivationMaterial {
  item: string;
  purpose: string;
  optional: boolean;
  alternatives: string[];
  preparation: string;
}

export interface SigilUsage {
  applications: SigilApplication[];
  placement: PlacementGuidance[];
  duration: UsageDuration;
  maintenance: string[];
  signs: EffectivenessSign[];
}

export interface SigilApplication {
  context: string;
  method: string;
  frequency: string;
  expectedResults: string;
  considerations: string[];
}

export interface PlacementGuidance {
  location: string;
  purpose: string;
  energeticReason: string;
  visibility: "hidden" | "visible" | "semi-visible";
  protection: string[];
}

export interface UsageDuration {
  activePhase: string;
  maintenancePhase: string;
  completionSigns: string[];
  renewalConditions: string[];
}

export interface EffectivenessSign {
  sign: string;
  meaning: string;
  timeframe: string;
  response: string;
}

export interface SigilCorrespondences {
  elements: string[];
  planets: string[];
  colors: string[];
  crystals: string[];
  herbs: string[];
  numbers: number[];
  hebrewLetters?: string[];
  runicCorrespondences?: string[];
}

export interface SigilVariation {
  name: string;
  purpose: string;
  modifications: string[];
  suitableFor: string;
  activationChanges: string[];
}

export interface SigilMaintenance {
  rechargingMethods: string[];
  cleansing: string[];
  storage: string[];
  disposal: string[];
  troubleshooting: TroubleshootingGuide[];
}

export interface TroubleshootingGuide {
  issue: string;
  causes: string[];
  solutions: string[];
  prevention: string[];
}

interface SigilParams {
  intention: string;
  method: string;
  includeActivation: boolean;
  complexity: string;
  elements?: string[];
  timeframe?: string;
}

export async function createMagicalSigil(params: SigilParams): Promise<MagicalSigil> {
  const {
    intention,
    method = "letter",
    includeActivation = true,
    complexity = "moderate",
    elements = [],
    timeframe
  } = params;

  const sigilId = `sigil_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create the sigil design based on method
  const design = createSigilDesign(intention, method, complexity, elements);
  
  // Generate activation instructions if requested
  const activation = includeActivation ? 
    createSigilActivation(intention, method, complexity, elements, timeframe) : 
    createBasicActivation();
  
  // Create usage guidelines
  const usage = createSigilUsage(intention, method, timeframe);
  
  // Generate correspondences
  const correspondences = generateSigilCorrespondences(intention, elements, method);
  
  // Create variations
  const variations = generateSigilVariations(intention, method, complexity);
  
  // Generate maintenance guidelines
  const maintenance = createSigilMaintenance(method, complexity);

  return {
    id: sigilId,
    intention,
    method,
    complexity,
    design,
    activation,
    usage,
    correspondences,
    variations,
    maintenance,
  };
}

function createSigilDesign(
  intention: string,
  method: string,
  complexity: string,
  elements: string[]
): SigilDesign {
  const structure = createSigilStructure(intention, complexity);
  const visualization = createSigilVisualization(intention, elements, complexity);
  const construction = createSigilConstruction(intention, method, complexity);
  const symbolElements = generateSymbolElements(intention, method, elements);
  const geometricFoundation = createGeometricFoundation(method, complexity);
  const energeticPatterns = generateEnergeticPatterns(intention, elements);
  
  return {
    structure,
    visualization,
    construction,
    symbolElements,
    geometricFoundation,
    energeticPatterns
  };
}

function createSigilStructure(intention: string, complexity: string): SigilStructure {
  const structures = {
    simple: {
      primaryShape: "circle",
      secondaryShapes: ["triangle"],
      connectionPatterns: ["flowing lines", "organic curves"],
      symmetryType: "radial",
      centralFocus: "single point of power",
      energyFlow: "outward radiating"
    },
    moderate: {
      primaryShape: "triangle within circle",
      secondaryShapes: ["square", "hexagon", "smaller circles"],
      connectionPatterns: ["intersecting lines", "spiral patterns", "connecting nodes"],
      symmetryType: "bilateral with radial elements", 
      centralFocus: "power symbol or letter combination",
      energyFlow: "circular with directional focus"
    },
    complex: {
      primaryShape: "mandala-style geometric pattern",
      secondaryShapes: ["pentagrams", "hexagrams", "octagon", "multiple interlocking circles"],
      connectionPatterns: ["intricate weaving", "layered geometries", "recursive patterns"],
      symmetryType: "multiple symmetries with intentional asymmetric elements",
      centralFocus: "elaborate central motif with surrounding satellite elements",
      energyFlow: "multi-directional vortex with specific directional channels"
    }
  };
  
  return structures[complexity as keyof typeof structures] || structures.moderate;
}

function createSigilVisualization(
  intention: string,
  elements: string[],
  complexity: string
): SigilVisualization {
  // Determine colors based on intention keywords
  const intentionLower = intention.toLowerCase();
  let colors = ["silver", "gold"];
  
  if (intentionLower.includes("love") || intentionLower.includes("heart")) {
    colors = ["pink", "rose", "green"];
  } else if (intentionLower.includes("money") || intentionLower.includes("prosperity")) {
    colors = ["green", "gold", "silver"];
  } else if (intentionLower.includes("protection")) {
    colors = ["black", "silver", "blue"];
  } else if (intentionLower.includes("healing")) {
    colors = ["green", "blue", "white"];
  } else if (intentionLower.includes("wisdom") || intentionLower.includes("knowledge")) {
    colors = ["purple", "indigo", "silver"];
  }
  
  // Add elemental colors
  elements.forEach(element => {
    switch (element.toLowerCase()) {
      case "fire":
        colors.push("red", "orange");
        break;
      case "water":
        colors.push("blue", "sea-green");
        break;
      case "air":
        colors.push("yellow", "light blue");
        break;
      case "earth":
        colors.push("brown", "green");
        break;
    }
  });
  
  const textures = {
    simple: "smooth and clean",
    moderate: "slightly textured with energy ripples",
    complex: "rich with layered depth and dimensional quality"
  };
  
  const movements = {
    simple: "gentle pulsing",
    moderate: "slow rotation with pulsing intensity",
    complex: "complex multi-directional flow with synchronized pulsing"
  };
  
  return {
    description: `A ${complexity} sigil design that embodies the essence of "${intention}" through geometric and symbolic elements`,
    colors: [...new Set(colors)],
    texture: textures[complexity as keyof typeof textures],
    luminosity: "soft inner glow that intensifies during activation",
    movement: movements[complexity as keyof typeof movements],
    atmosphere: "sacred and charged with purposeful energy"
  };
}

function createSigilConstruction(
  intention: string,
  method: string,
  complexity: string
): SigilConstruction {
  if (method === "letter") {
    return createLetterMethodConstruction(intention, complexity);
  } else if (method === "planetary") {
    return createPlanetaryConstruction(intention, complexity);
  } else if (method === "geometric") {
    return createGeometricConstruction(intention, complexity);
  } else if (method === "intuitive") {
    return createIntuitiveConstruction(intention, complexity);
  } else {
    return createChaosConstruction(intention, complexity);
  }
}

function createLetterMethodConstruction(intention: string, complexity: string): SigilConstruction {
  // Classic Austin Osman Spare method
  const cleanIntention = intention.toLowerCase().replace(/[^a-z]/g, '');
  const uniqueLetters = [...new Set(cleanIntention)];
  const vowels = uniqueLetters.filter(l => 'aeiou'.includes(l));
  const consonants = uniqueLetters.filter(l => !'aeiou'.includes(l));
  
  // Remove vowels for traditional method, but keep them for reference
  const workingLetters = complexity === "simple" ? consonants : uniqueLetters;
  
  const steps = [
    "Write out the statement of intent",
    "Remove all repeating letters",
    complexity === "simple" ? "Remove vowels" : "Keep all unique letters",
    "Combine remaining letters into abstract design",
    "Simplify and stylize until unrecognizable",
    "Add geometric elements if desired"
  ];
  
  return {
    baseLetters: uniqueLetters,
    eliminatedLetters: complexity === "simple" ? vowels : [],
    combinedElements: workingLetters,
    simplificationSteps: steps,
    finalForm: `Abstract combination of ${workingLetters.length} letter forms`,
    alternativeVersions: [
      "Circular arrangement of letters",
      "Vertical stack with interlocking elements",
      "Mandala-style radial distribution"
    ]
  };
}

function createPlanetaryConstruction(intention: string, complexity: string): SigilConstruction {
  const planetarySquares = {
    sun: "Solar square for success and vitality",
    moon: "Lunar square for intuition and emotions",
    mars: "Mars square for strength and courage",
    mercury: "Mercury square for communication and wisdom",
    jupiter: "Jupiter square for abundance and expansion",
    venus: "Venus square for love and beauty",
    saturn: "Saturn square for discipline and manifestation"
  };
  
  // Determine planetary correspondence
  const intentionLower = intention.toLowerCase();
  let planet = "sun"; // default
  
  if (intentionLower.includes("love") || intentionLower.includes("beauty")) planet = "venus";
  else if (intentionLower.includes("money") || intentionLower.includes("growth")) planet = "jupiter";
  else if (intentionLower.includes("courage") || intentionLower.includes("strength")) planet = "mars";
  else if (intentionLower.includes("wisdom") || intentionLower.includes("communication")) planet = "mercury";
  else if (intentionLower.includes("intuition") || intentionLower.includes("emotion")) planet = "moon";
  else if (intentionLower.includes("discipline") || intentionLower.includes("structure")) planet = "saturn";
  
  return {
    combinedElements: [`Planetary square of ${planet}`, "Intention converted to numbers", "Path through square"],
    simplificationSteps: [
      `Select ${planet} planetary square`,
      "Convert intention to numerical values",
      "Trace path through square following numbers", 
      "Extract linear pattern from path",
      "Stylize path into sigil form"
    ],
    finalForm: `Planetary sigil based on ${planet} square`,
    alternativeVersions: [
      "Direct square overlay method",
      "Extracted pathway method",
      "Combined with traditional letter method"
    ]
  };
}

function createGeometricConstruction(intention: string, complexity: string): SigilConstruction {
  const geometricElements = [
    "Sacred geometry foundation",
    "Golden ratio proportions",
    "Symbolic shape correspondences",
    "Fractal-like recursive patterns",
    "Platonic solid influences"
  ];
  
  return {
    combinedElements: geometricElements,
    simplificationSteps: [
      "Choose primary geometric foundation",
      "Map intention to geometric relationships",
      "Apply sacred proportions",
      "Add symbolic geometric elements",
      "Balance complexity with clarity"
    ],
    finalForm: "Pure geometric sigil based on sacred mathematics",
    alternativeVersions: [
      "Mandala-style arrangement",
      "Linear geometric sequence", 
      "Three-dimensional projection"
    ]
  };
}

function createIntuitiveConstruction(intention: string, complexity: string): SigilConstruction {
  return {
    combinedElements: [
      "Meditative intention holding",
      "Automatic drawing techniques",
      "Symbolic imagery that arises",
      "Energy-guided mark making",
      "Intuitive refinement process"
    ],
    simplificationSteps: [
      "Enter meditative state with clear intention",
      "Allow hand to move freely creating marks",
      "Identify strongest symbolic elements",
      "Refine and combine key symbols",
      "Simplify while maintaining energetic integrity"
    ],
    finalForm: "Intuitive sigil channeled through meditative practice",
    alternativeVersions: [
      "Multiple meditation sessions combined",
      "Dream-inspired variations",
      "Nature-influenced organic forms"
    ]
  };
}

function createChaosConstruction(intention: string, complexity: string): SigilConstruction {
  return {
    combinedElements: [
      "Non-linear approach",
      "Random selection methods",
      "Synchronicity-based choices",
      "Chaos magick principles",
      "Personal symbol vocabulary"
    ],
    simplificationSteps: [
      "Write intention multiple times in different ways",
      "Select elements through random methods",
      "Combine using chance operations",
      "Apply chaos principles to design",
      "Trust synchronicity in final form"
    ],
    finalForm: "Chaos sigil created through non-linear methodology",
    alternativeVersions: [
      "I-Ching divination guided",
      "Tarot card inspired elements",
      "Pure randomization method"
    ]
  };
}

function generateSymbolElements(
  intention: string,
  method: string,
  elements: string[]
): SymbolElement[] {
  const symbols: SymbolElement[] = [];
  
  // Add elemental symbols if specified
  elements.forEach(element => {
    const elementData = {
      fire: { symbol: "△", meaning: "Active, creative force", placement: "upper right" },
      water: { symbol: "▽", meaning: "Receptive, emotional flow", placement: "lower left" },
      air: { symbol: "△", meaning: "Mental, communicative energy", placement: "upper left" },
      earth: { symbol: "▽", meaning: "Grounding, manifestation", placement: "lower right" }
    };
    
    const data = elementData[element.toLowerCase() as keyof typeof elementData];
    if (data) {
      symbols.push({
        symbol: data.symbol,
        meaning: data.meaning,
        placement: data.placement,
        significance: `${element} elemental correspondence`,
        energeticFunction: `Channel ${element} energy into manifestation`
      });
    }
  });
  
  // Add intention-specific symbols
  const intentionLower = intention.toLowerCase();
  if (intentionLower.includes("protection")) {
    symbols.push({
      symbol: "☉ (circle with center dot)",
      meaning: "Perfect protection and wholeness", 
      placement: "center",
      significance: "Solar protective energy",
      energeticFunction: "Create energetic boundary and shield"
    });
  }
  
  if (intentionLower.includes("love")) {
    symbols.push({
      symbol: "♀ (Venus symbol)",
      meaning: "Love, beauty, harmony",
      placement: "heart position",
      significance: "Venusian love energy",
      energeticFunction: "Attract and amplify love vibrations"
    });
  }
  
  // Add universal symbols
  symbols.push({
    symbol: "⊕ (circled plus)",
    meaning: "Integration and balance",
    placement: "central axis",
    significance: "Unification of opposing forces",
    energeticFunction: "Balance and integrate all energies"
  });
  
  return symbols;
}

function createGeometricFoundation(method: string, complexity: string): GeometricFoundation {
  const foundations = {
    letter: {
      primaryGeometry: "Organic flowing forms based on letterforms",
      sacredProportions: ["Golden ratio in letter spacing", "Fibonacci curves"],
      mathematicalRatios: ["1.618 (golden ratio)", "Natural letter proportions"]
    },
    planetary: {
      primaryGeometry: "Square grid foundation with connecting pathways",
      sacredProportions: ["Planetary square dimensions", "Traditional magical squares"],
      mathematicalRatios: ["Square number relationships", "Planetary numerical ratios"]
    },
    geometric: {
      primaryGeometry: "Sacred geometric forms - circles, triangles, polygons",
      sacredProportions: ["Golden ratio", "Vesica piscis", "Flower of life"],
      mathematicalRatios: ["φ (1.618)", "√2 (1.414)", "√3 (1.732)", "π (3.14159)"]
    },
    intuitive: {
      primaryGeometry: "Natural, organic geometric relationships",
      sacredProportions: ["Naturally arising proportions", "Body-based measurements"],
      mathematicalRatios: ["Personally significant numbers", "Intuitive proportions"]
    },
    chaos: {
      primaryGeometry: "Non-linear, asymmetric foundation",
      sacredProportions: ["Random proportions", "Synchronicity-based ratios"],
      mathematicalRatios: ["Chaos mathematics", "Strange attractor patterns"]
    }
  };
  
  const foundation = foundations[method as keyof typeof foundations] || foundations.letter;
  
  return {
    ...foundation,
    energeticSignificance: "The geometric foundation creates the energetic framework that will hold and direct the intention"
  };
}

function generateEnergeticPatterns(intention: string, elements: string[]): string[] {
  const patterns = [
    "Spiraling energy movement from center outward",
    "Pulsing rhythmic energy waves",
    "Concentrated focal point with radiating streams"
  ];
  
  // Add element-specific patterns
  if (elements.includes("fire")) {
    patterns.push("Upward rising flame-like energy");
  }
  if (elements.includes("water")) {
    patterns.push("Flowing, circular water-like currents");
  }
  if (elements.includes("air")) {
    patterns.push("Quick, darting wind-like movements");
  }
  if (elements.includes("earth")) {
    patterns.push("Slow, grounding, root-like energy");
  }
  
  return patterns;
}

function createSigilActivation(
  intention: string,
  method: string,
  complexity: string,
  elements: string[],
  timeframe?: string
): SigilActivation {
  const preparationRitual = createPreparationRitual(method, complexity);
  const activationMethods = createActivationMethods(method, complexity);
  const timing = createActivationTiming(intention, elements, timeframe);
  const materials = createActivationMaterials(method, elements);
  const safetyConsiderations = createSafetyConsiderations(complexity, elements);
  
  return {
    preparationRitual,
    activationMethods,
    timing,
    materials,
    safetyConsiderations
  };
}

function createPreparationRitual(method: string, complexity: string): ActivationStep[] {
  const baseSteps: ActivationStep[] = [
    {
      step: 1,
      action: "Cleanse and consecrate the space",
      purpose: "Remove unwanted energies and create sacred space",
      duration: "5-10 minutes",
      visualization: "White light filling and purifying the space",
      incantation: "I cleanse this space of all unwanted energies"
    },
    {
      step: 2,
      action: "Center and ground yourself",
      purpose: "Establish energetic stability and focus",
      duration: "5 minutes",
      visualization: "Roots growing from your base deep into the earth",
    },
    {
      step: 3,
      action: "State your intention clearly three times",
      purpose: "Program your consciousness with clear purpose",
      duration: "3 minutes",
      visualization: "Your words creating ripples in the energy field",
    }
  ];
  
  if (complexity === "complex") {
    baseSteps.push({
      step: 4,
      action: "Invoke protective spirits or deities",
      purpose: "Ensure divine guidance and protection during activation",
      duration: "10 minutes",
      visualization: "Divine beings surrounding and blessing your work",
      incantation: "I call upon divine protection and guidance"
    });
  }
  
  return baseSteps;
}

function createActivationMethods(method: string, complexity: string): ActivationMethod[] {
  const methods: ActivationMethod[] = [
    {
      name: "Visualization Activation",
      description: "Activate through intense mental focus and visualization",
      difficulty: "beginner",
      effectiveness: 70,
      requirements: ["Quiet space", "Uninterrupted time", "Clear mental focus"],
      process: [
        "Hold the sigil and gaze at it softly",
        "Begin deep, rhythmic breathing",
        "Visualize the sigil glowing with energy",
        "See your intention manifesting in reality",
        "Release attachment to outcome"
      ]
    },
    {
      name: "Elemental Activation",
      description: "Use elemental energies to charge and activate the sigil",
      difficulty: "intermediate",
      effectiveness: 85,
      requirements: ["Elemental materials", "Basic elemental knowledge", "Ritual space"],
      process: [
        "Place sigil in center of elemental cross",
        "Call upon each element in turn",
        "Feel elemental energies charging the sigil",
        "Visualize elements awakening the sigil's power",
        "Thank elements and release energy"
      ]
    },
    {
      name: "Orgasmic Activation",
      description: "Use peak energy state for powerful activation",
      difficulty: "advanced",
      effectiveness: 95,
      requirements: ["Complete privacy", "Comfortable environment", "Advanced energy work"],
      process: [
        "Begin with deep meditation on intention",
        "Build energy through chosen method",
        "Hold sigil at moment of peak energy",
        "Release all energy into sigil",
        "Immediately forget/destroy sigil if using chaos method"
      ]
    }
  ];
  
  if (complexity === "simple") {
    return methods.slice(0, 1);
  } else if (complexity === "moderate") {
    return methods.slice(0, 2);
  }
  
  return methods;
}

function createActivationTiming(intention: string, elements: string[], timeframe?: string): ActivationTiming {
  const optimalTimes = ["New moon for new beginnings", "Full moon for maximum power"];
  const lunarPhases = ["New moon", "Waxing moon", "Full moon"];
  const planetaryHours = ["Hour of the Sun for general power", "Hour of Venus for love magic"];
  
  // Add elemental timing
  if (elements.includes("fire")) {
    optimalTimes.push("Dawn or noon for fire energy");
    planetaryHours.push("Hour of Mars for fire magic");
  }
  if (elements.includes("water")) {
    optimalTimes.push("Dusk or midnight for water energy");
    planetaryHours.push("Hour of the Moon for water magic");
  }
  
  const seasonalConsiderations = [
    "Spring for new beginnings and growth",
    "Summer for maximum power and success",
    "Autumn for transformation and change", 
    "Winter for banishing and protection"
  ];
  
  const personalTiming = [
    "When you feel most energetically strong",
    "During natural cycles of high motivation",
    "Avoid times of illness or emotional distress",
    "Choose times when you won't be disturbed"
  ];
  
  return {
    optimalTimes,
    lunarPhases,
    planetaryHours,
    seasonalConsiderations,
    personalTiming
  };
}

function createActivationMaterials(method: string, elements: string[]): ActivationMaterial[] {
  const baseMaterials: ActivationMaterial[] = [
    {
      item: "The completed sigil",
      purpose: "Focus point for activation energy",
      optional: false,
      alternatives: [],
      preparation: "Should be clearly drawn on appropriate material"
    },
    {
      item: "Candle (white or color-appropriate)",
      purpose: "Provide sacred fire and focus",
      optional: true,
      alternatives: ["Oil lamp", "LED candle", "Natural sunlight"],
      preparation: "Cleanse and consecrate before use"
    }
  ];
  
  // Add elemental materials
  elements.forEach(element => {
    switch (element.toLowerCase()) {
      case "fire":
        baseMaterials.push({
          item: "Red candle or flame source",
          purpose: "Channel fire element energy",
          optional: false,
          alternatives: ["Fireplace", "Torch", "Brazier"],
          preparation: "Light with intention and respect"
        });
        break;
      case "water":
        baseMaterials.push({
          item: "Bowl of clean water",
          purpose: "Channel water element energy",
          optional: false,
          alternatives: ["Natural spring water", "Moon water", "Blessed water"],
          preparation: "Bless water with intention"
        });
        break;
      case "air":
        baseMaterials.push({
          item: "Incense or feather",
          purpose: "Channel air element energy",
          optional: false,
          alternatives: ["Essential oils", "Bell", "Singing bowl"],
          preparation: "Consecrate for ritual use"
        });
        break;
      case "earth":
        baseMaterials.push({
          item: "Salt, stone, or earth",
          purpose: "Channel earth element energy",
          optional: false,
          alternatives: ["Crystal", "Plant", "Sand"],
          preparation: "Cleanse and charge with earth energy"
        });
        break;
    }
  });
  
  return baseMaterials;
}

function createSafetyConsiderations(complexity: string, elements: string[]): string[] {
  const baseSafety = [
    "Only work magic for positive purposes and the highest good",
    "Never attempt to manipulate others' free will",
    "Ground yourself thoroughly after activation",
    "Protect your energy with shielding techniques"
  ];
  
  if (complexity === "complex") {
    baseSafety.push(
      "Work with experienced practitioner if unfamiliar with advanced techniques",
      "Have someone nearby if working with intense energies",
      "Prepare banishing rituals in case of unwanted energies"
    );
  }
  
  if (elements.includes("fire")) {
    baseSafety.push("Use fire safety precautions with all flame sources");
  }
  
  return baseSafety;
}

function createBasicActivation(): SigilActivation {
  return {
    preparationRitual: [
      {
        step: 1,
        action: "Hold the sigil and focus on your intention",
        purpose: "Connect your energy with the sigil",
        duration: "5-10 minutes",
        visualization: "Energy flowing from you into the sigil"
      }
    ],
    activationMethods: [
      {
        name: "Simple Meditation Activation",
        description: "Basic activation through meditation and intention",
        difficulty: "beginner",
        effectiveness: 60,
        requirements: ["Quiet space", "The sigil"],
        process: [
          "Sit quietly holding the sigil",
          "Focus on your intention",
          "Visualize the sigil glowing",
          "Release and trust"
        ]
      }
    ],
    timing: {
      optimalTimes: ["When you feel focused and clear"],
      lunarPhases: ["Any phase"],
      planetaryHours: ["Any hour"],
      seasonalConsiderations: ["Any season"],
      personalTiming: ["When you have privacy and focus"]
    },
    materials: [
      {
        item: "The completed sigil",
        purpose: "Focus for activation",
        optional: false,
        alternatives: [],
        preparation: "Draw clearly with intention"
      }
    ],
    safetyConsiderations: [
      "Work only for positive purposes",
      "Ground yourself afterward"
    ]
  };
}

function createSigilUsage(intention: string, method: string, timeframe?: string): SigilUsage {
  const applications: SigilApplication[] = [
    {
      context: "Daily meditation practice",
      method: "Gaze at sigil during meditation",
      frequency: "Daily for 10-15 minutes",
      expectedResults: "Gradual alignment with intention",
      considerations: ["Maintain regular practice", "Track subtle changes"]
    },
    {
      context: "Ritual work",
      method: "Include sigil in ritual practices",
      frequency: "Weekly or as needed",
      expectedResults: "Enhanced ritual effectiveness",
      considerations: ["Coordinate with lunar cycles", "Combine with other practices"]
    }
  ];
  
  const placement: PlacementGuidance[] = [
    {
      location: "Personal altar or sacred space",
      purpose: "Daily focus and energy building",
      energeticReason: "Accumulates energy in sacred environment",
      visibility: "visible",
      protection: ["Energetic shielding", "Physical protection from damage"]
    },
    {
      location: "Hidden in personal space",
      purpose: "Subtle continuous influence",
      energeticReason: "Works on subconscious level",
      visibility: "hidden",
      protection: ["Keep private", "Protect from accidental discovery"]
    }
  ];
  
  const duration: UsageDuration = {
    activePhase: timeframe || "3-6 months",
    maintenancePhase: "As needed for reinforcement",
    completionSigns: [
      "Intention has manifested",
      "Strong sense of completion",
      "Sigil feels energetically neutral"
    ],
    renewalConditions: [
      "Intention needs reinforcement",
      "New phase of same goal",
      "Significant life changes affecting goal"
    ]
  };
  
  const signs: EffectivenessSign[] = [
    {
      sign: "Increased synchronicities related to intention",
      meaning: "Universe is responding to your will",
      timeframe: "Within 2-4 weeks",
      response: "Continue current practice"
    },
    {
      sign: "Unusual dreams or visions",
      meaning: "Subconscious processing and integration",
      timeframe: "Within 1-2 weeks",
      response: "Record dreams for insights"
    },
    {
      sign: "External opportunities arising",
      meaning: "Manifestation pathway opening",
      timeframe: "Within 1-3 months",
      response: "Take inspired action on opportunities"
    }
  ];
  
  return {
    applications,
    placement,
    duration,
    maintenance: [
      "Recharge during full moons",
      "Cleanse if energy feels muddy",
      "Refresh intention regularly",
      "Protect from skeptical energy"
    ],
    signs
  };
}

function generateSigilCorrespondences(
  intention: string,
  elements: string[],
  method: string
): SigilCorrespondences {
  const correspondences: SigilCorrespondences = {
    elements: elements.length > 0 ? elements : ["ether"],
    planets: [],
    colors: [],
    crystals: [],
    herbs: [],
    numbers: []
  };
  
  // Determine correspondences based on intention
  const intentionLower = intention.toLowerCase();
  
  if (intentionLower.includes("love")) {
    correspondences.planets.push("Venus");
    correspondences.colors.push("pink", "green", "rose");
    correspondences.crystals.push("rose quartz", "emerald", "malachite");
    correspondences.herbs.push("rose", "jasmine", "lavender");
    correspondences.numbers.push(6, 15, 24);
  }
  
  if (intentionLower.includes("money") || intentionLower.includes("prosperity")) {
    correspondences.planets.push("Jupiter");
    correspondences.colors.push("green", "gold", "purple");
    correspondences.crystals.push("citrine", "pyrite", "aventurine");
    correspondences.herbs.push("basil", "mint", "cinnamon");
    correspondences.numbers.push(3, 8, 21);
  }
  
  if (intentionLower.includes("protection")) {
    correspondences.planets.push("Mars", "Saturn");
    correspondences.colors.push("black", "red", "silver");
    correspondences.crystals.push("obsidian", "hematite", "black tourmaline");
    correspondences.herbs.push("sage", "rosemary", "cedar");
    correspondences.numbers.push(5, 9, 13);
  }
  
  // Default correspondences
  if (correspondences.planets.length === 0) {
    correspondences.planets.push("Sun");
  }
  if (correspondences.colors.length === 0) {
    correspondences.colors.push("gold", "silver", "white");
  }
  if (correspondences.crystals.length === 0) {
    correspondences.crystals.push("clear quartz", "amethyst");
  }
  if (correspondences.herbs.length === 0) {
    correspondences.herbs.push("frankincense", "sandalwood");
  }
  if (correspondences.numbers.length === 0) {
    correspondences.numbers.push(1, 7, 11);
  }
  
  return correspondences;
}

function generateSigilVariations(intention: string, method: string, complexity: string): SigilVariation[] {
  return [
    {
      name: "Simplified Version",
      purpose: "Daily practice and subtle influence",
      modifications: [
        "Reduce to essential elements only",
        "Simplify geometric complexity",
        "Focus on core symbol"
      ],
      suitableFor: "Beginners or discrete use",
      activationChanges: ["Simple visualization activation", "Shorter activation ritual"]
    },
    {
      name: "Enhanced Complexity",
      purpose: "Maximum power for important goals",
      modifications: [
        "Add additional symbolic elements",
        "Include color correspondences",
        "Layer multiple geometric patterns"
      ],
      suitableFor: "Advanced practitioners and crucial intentions",
      activationChanges: ["Full elemental activation", "Extended preparation ritual"]
    },
    {
      name: "Portable Version",
      purpose: "Carry with you for continuous influence",
      modifications: [
        "Scale to small, portable size",
        "Emphasize durability",
        "Hide within normal objects"
      ],
      suitableFor: "Daily carry and travel situations",
      activationChanges: ["Quick reactivation methods", "Discrete usage techniques"]
    }
  ];
}

function createSigilMaintenance(method: string, complexity: string): SigilMaintenance {
  return {
    rechargingMethods: [
      "Expose to full moonlight monthly",
      "Meditation and energy charging sessions",
      "Place with amplifying crystals",
      "Restate intention with focus and emotion"
    ],
    cleansing: [
      "Sage or palo santo smoke cleansing",
      "Moonlight cleansing overnight",
      "Sound cleansing with singing bowls or bells",
      "Intention-based energy cleansing"
    ],
    storage: [
      "Keep in sacred space or altar area",
      "Wrap in natural cloth when not in use",
      "Store away from skeptical or negative energy",
      "Protect from physical damage"
    ],
    disposal: [
      "Burn with gratitude when goal is achieved",
      "Bury in earth with thanksgiving",
      "Dissolve in flowing water if appropriate",
      "Return energy to universe with blessing"
    ],
    troubleshooting: [
      {
        issue: "Sigil seems to have lost power",
        causes: ["Energy depletion", "Intention unclear", "External interference"],
        solutions: ["Recharge through activation ritual", "Clarify and restate intention", "Cleanse and shield"],
        prevention: ["Regular maintenance", "Clear intention setting", "Energetic protection"]
      },
      {
        issue: "Unexpected or negative results",
        causes: ["Unclear intention", "Ego-based desires", "Interference"],
        solutions: ["Examine true motives", "Rework with clearer intention", "Banish and start over"],
        prevention: ["Work for highest good", "Check ego involvement", "Proper preparation"]
      }
    ]
  };
}