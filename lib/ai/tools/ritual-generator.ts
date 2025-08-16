export interface Ritual {
  id: string;
  name: string;
  purpose: string;
  principle: string;
  duration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  elements: RitualElement[];
  steps: RitualStep[];
  timing: RitualTiming;
  effects: string[];
  warnings?: string[];
  preparation: string[];
  closing: string[];
  variations?: RitualVariation[];
}

export interface RitualElement {
  item: string;
  purpose: string;
  optional: boolean;
  alternatives?: string[];
  placement?: string;
  symbolism?: string;
}

export interface RitualStep {
  order: number;
  phase: "preparation" | "opening" | "invocation" | "main" | "integration" | "closing";
  action: string;
  duration: string;
  visualization?: string;
  mantra?: string;
  breathwork?: string;
  movement?: string;
  notes?: string;
}

export interface RitualTiming {
  timeOfDay?: string;
  moonPhase?: string;
  season?: string;
  frequency: string;
  astrological?: string;
  energeticPeaks?: string[];
}

export interface RitualVariation {
  name: string;
  description: string;
  modifications: string[];
  suitableFor: string;
}

interface RitualParams {
  purpose: string;
  principle: string;
  duration: number;
  elements: string[];
  timeOfDay?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export async function generatePersonalizedRitual(params: RitualParams): Promise<Ritual> {
  const {
    purpose,
    principle,
    duration,
    elements,
    timeOfDay,
    difficulty = "beginner"
  } = params;

  const ritualId = `ritual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Get principle-specific data
  const principleData = getPrincipleConfiguration(principle);
  
  // Generate ritual structure based on duration and difficulty
  const ritualStructure = calculateRitualStructure(duration, difficulty);
  
  // Create ritual elements list
  const ritualElements = generateRitualElements(elements, principleData, difficulty);
  
  // Generate ritual steps
  const steps = generateRitualSteps(
    duration, 
    principleData, 
    purpose, 
    difficulty,
    ritualStructure
  );

  // Create timing recommendations
  const timing = generateRitualTiming(principle, purpose, timeOfDay);

  // Generate variations for different skill levels
  const variations = generateRitualVariations(principle, purpose, difficulty);

  return {
    id: ritualId,
    name: generateRitualName(principle, purpose, difficulty),
    purpose,
    principle,
    duration,
    difficulty,
    elements: ritualElements,
    steps,
    timing,
    effects: generateExpectedEffects(principle, purpose, difficulty),
    warnings: generateWarnings(principle, purpose, difficulty),
    preparation: generatePreparationInstructions(principleData, elements),
    closing: generateClosingInstructions(principleData, purpose),
    variations,
  };
}

function getPrincipleConfiguration(principle: string) {
  const configurations = {
    mentalism: {
      focus: "mental transformation and thought mastery",
      primaryElement: "candle or lamp (representing illumination of mind)",
      keyAction: "visualization and mental discipline",
      breathPattern: "4-7-8 calming breath for mental clarity",
      energy: "mental/ethereal",
      color: "white or silver",
      direction: "east",
      invocation: "Great Hermes, illuminate my mind with divine wisdom",
      tools: ["journal", "pen", "mirror"],
    },
    correspondence: {
      focus: "aligning inner and outer worlds",
      primaryElement: "mirror or reflective surface (as above, so below)",
      keyAction: "correspondence mapping and reflection",
      breathPattern: "balanced breathing (equal in and out)",
      energy: "balancing/harmonizing", 
      color: "gold or yellow",
      direction: "center",
      invocation: "As above, so below; as within, so without",
      tools: ["symbols", "images", "altar cloth"],
    },
    vibration: {
      focus: "raising personal vibration and frequency",
      primaryElement: "singing bowl, bell, or chime",
      keyAction: "toning, chanting, and vibrational alignment",
      breathPattern: "rapid breath of fire or rhythmic breathing",
      energy: "dynamic/transformative",
      color: "orange or red",
      direction: "south",
      invocation: "I attune to the highest vibration of divine love",
      tools: ["instruments", "crystals", "essential oils"],
    },
    polarity: {
      focus: "balancing and integrating opposites",
      primaryElement: "two candles (black and white) or contrasting objects",
      keyAction: "polarity meditation and shadow work",
      breathPattern: "alternating nostril breathing",
      energy: "balancing/integrative",
      color: "black and white",
      direction: "north-south axis",
      invocation: "In darkness and light, I find my wholeness",
      tools: ["dual objects", "balance symbols", "scales"],
    },
    rhythm: {
      focus: "harmonizing with natural cycles and flow",
      primaryElement: "pendulum, metronome, or drum",
      keyAction: "rhythmic movement and cyclical awareness",
      breathPattern: "rhythmic breathing with natural counts",
      energy: "flowing/cyclical",
      color: "blue or green",
      direction: "west",
      invocation: "I flow in harmony with nature's sacred rhythms",
      tools: ["timekeeping device", "water", "natural elements"],
    },
    causeEffect: {
      focus: "conscious creation and manifestation",
      primaryElement: "seeds, crystals, or manifestation objects",
      keyAction: "intention setting and conscious creation",
      breathPattern: "power breath with retention",
      energy: "creative/manifesting",
      color: "green or purple",
      direction: "all directions",
      invocation: "I am the conscious creator of my reality",
      tools: ["seeds", "crystals", "writing materials", "earth"],
    },
    gender: {
      focus: "balancing masculine and feminine energies",
      primaryElement: "yin-yang symbol or paired objects",
      keyAction: "gender energy balancing and integration",
      breathPattern: "heart-centered breathing",
      energy: "unifying/wholeness",
      color: "pink and blue",
      direction: "center with four directions",
      invocation: "In divine union, I embrace my wholeness",
      tools: ["paired symbols", "rose quartz", "clear quartz"],
    },
  };

  return configurations[principle as keyof typeof configurations] || configurations.mentalism;
}

function calculateRitualStructure(duration: number, difficulty: string) {
  const baseStructure = {
    preparation: 0.15,  // 15%
    opening: 0.10,      // 10% 
    invocation: 0.10,   // 10%
    main: 0.45,         // 45%
    integration: 0.15,  // 15%
    closing: 0.05,      // 5%
  };

  // Adjust for difficulty
  const adjustments = {
    beginner: { main: -0.05, preparation: +0.05 },
    intermediate: { main: 0, preparation: 0 },
    advanced: { main: +0.10, integration: -0.05, invocation: -0.05 },
  };

  const adjustment = adjustments[difficulty as keyof typeof adjustments];
  
  return Object.entries(baseStructure).reduce((acc, [phase, ratio]) => {
    const adjustedRatio = ratio + (adjustment[phase as keyof typeof adjustment] || 0);
    acc[phase] = Math.round(duration * adjustedRatio);
    return acc;
  }, {} as Record<string, number>);
}

function generateRitualElements(
  elements: string[], 
  principleData: any, 
  difficulty: string
): RitualElement[] {
  const ritualElements: RitualElement[] = [
    {
      item: principleData.primaryElement,
      purpose: "Primary focus and energy anchor",
      optional: false,
      placement: `Place in ${principleData.direction} direction`,
      symbolism: `Represents ${principleData.focus}`,
    },
  ];

  // Add user-specified elements
  elements.forEach((element, index) => {
    ritualElements.push({
      item: element,
      purpose: "Supporting element for energy enhancement",
      optional: true,
      alternatives: getElementAlternatives(element),
      placement: getElementPlacement(element, index, principleData.direction),
      symbolism: getElementSymbolism(element),
    });
  });

  // Add difficulty-appropriate elements
  if (difficulty === "intermediate" || difficulty === "advanced") {
    ritualElements.push({
      item: "Journal and pen",
      purpose: "Recording insights and experiences",
      optional: false,
      placement: "Keep nearby for writing",
    });
  }

  if (difficulty === "advanced") {
    ritualElements.push({
      item: "Sacred geometry or mandala",
      purpose: "Advanced focusing and energy direction",
      optional: true,
      placement: "Center of sacred space",
      symbolism: "Universal patterns and divine order",
    });
  }

  return ritualElements;
}

function generateRitualSteps(
  duration: number,
  principleData: any,
  purpose: string,
  difficulty: string,
  structure: Record<string, number>
): RitualStep[] {
  const steps: RitualStep[] = [];
  let order = 1;

  // Preparation phase
  steps.push({
    order: order++,
    phase: "preparation",
    action: "Create sacred space and gather all elements",
    duration: `${structure.preparation} minutes`,
    notes: "Take time to center yourself and set clear intention",
  });

  steps.push({
    order: order++,
    phase: "preparation", 
    action: "Cleanse space and elements energetically",
    duration: "Included in preparation time",
    visualization: "See purifying white light filling the space",
    breathwork: "Three deep cleansing breaths",
  });

  // Opening phase
  steps.push({
    order: order++,
    phase: "opening",
    action: "Light primary element and establish sacred boundary",
    duration: `${structure.opening} minutes`,
    visualization: "Visualize protective golden circle surrounding you",
    mantra: "I create sacred space for divine communion",
  });

  // Invocation phase
  steps.push({
    order: order++,
    phase: "invocation",
    action: "Invoke Hermes Trismegistus and state clear intention",
    duration: `${structure.invocation} minutes`,
    mantra: principleData.invocation,
    movement: difficulty === "advanced" ? "Sacred gestures or mudras" : undefined,
    notes: `Feel the presence of ancient wisdom surrounding you`,
  });

  // Main practice phase
  const mainSteps = generateMainPracticeSteps(
    structure.main,
    principleData,
    purpose,
    difficulty,
    order
  );
  
  steps.push(...mainSteps);
  order += mainSteps.length;

  // Integration phase
  steps.push({
    order: order++,
    phase: "integration",
    action: "Integrate the energy and ground insights",
    duration: `${structure.integration} minutes`,
    visualization: "Feel roots growing from your base deep into earth",
    breathwork: "Slow, grounding breaths",
    notes: "Journal any insights or experiences",
  });

  // Closing phase
  steps.push({
    order: order++,
    phase: "closing",
    action: "Thank Hermes and close sacred space",
    duration: `${structure.closing} minutes`,
    mantra: "The ritual is complete. So mote it be.",
    notes: "Extinguish flames and store elements respectfully",
  });

  return steps;
}

function generateMainPracticeSteps(
  mainDuration: number,
  principleData: any,
  purpose: string,
  difficulty: string,
  startingOrder: number
): RitualStep[] {
  const steps: RitualStep[] = [];
  let order = startingOrder;

  // Divide main practice into segments
  const segments = difficulty === "beginner" ? 2 : difficulty === "intermediate" ? 3 : 4;
  const segmentDuration = Math.round(mainDuration / segments);

  // Core practice step
  steps.push({
    order: order++,
    phase: "main",
    action: principleData.keyAction,
    duration: `${segmentDuration} minutes`,
    visualization: getVisualizationForPurpose(purpose, principleData),
    breathwork: principleData.breathPattern,
    mantra: generateMantraForPurpose(purpose, principleData),
  });

  // Advanced segments
  if (segments >= 3) {
    steps.push({
      order: order++,
      phase: "main",
      action: "Deepen the practice with personal application",
      duration: `${segmentDuration} minutes`,
      visualization: `See ${purpose} manifesting in your life`,
      notes: "Focus on specific ways this principle applies to your situation",
    });
  }

  if (segments >= 4) {
    steps.push({
      order: order++,
      phase: "main",
      action: "Shadow work and integration of opposites",
      duration: `${segmentDuration} minutes`,
      visualization: "Embrace both light and shadow aspects",
      notes: "What resistance or fear arises? Welcome it with compassion",
    });
  }

  // Final main segment - integration
  const finalDuration = mainDuration - (segmentDuration * (segments - 1));
  steps.push({
    order: order++,
    phase: "main",
    action: "Seal the practice with gratitude and commitment",
    duration: `${finalDuration} minutes`,
    mantra: `I am aligned with ${principleData.focus}. ${purpose} flows through me naturally.`,
    visualization: "Golden light sealing the transformation within you",
  });

  return steps;
}

function generateRitualTiming(principle: string, purpose: string, timeOfDay?: string): RitualTiming {
  const timingMaps = {
    mentalism: {
      timeOfDay: "Dawn - when the mind is clearest and most receptive",
      moonPhase: "New moon for new mental patterns, Full moon for illumination",
      astrological: "Mercury hour for mental work",
      energeticPeaks: ["sunrise", "3-6 AM", "meditation hours"],
    },
    correspondence: {
      timeOfDay: "Noon - the balance point of day and night",
      moonPhase: "Any phase - work with current lunar energy",
      astrological: "Sun hour for balance and harmony",
      energeticPeaks: ["solar noon", "equinox", "balance points"],
    },
    vibration: {
      timeOfDay: "Sunrise - rising energy and new vibrations",
      moonPhase: "Waxing moon for raising vibration",
      astrological: "Mars hour for dynamic energy",
      energeticPeaks: ["dawn chorus", "spring morning", "energy peaks"],
    },
    polarity: {
      timeOfDay: "Dusk - between day and night, light and shadow",
      moonPhase: "Quarter moons for balance work",
      astrological: "Saturn hour for integration",
      energeticPeaks: ["twilight", "seasonal transitions", "threshold times"],
    },
    rhythm: {
      timeOfDay: "Same time daily for consistency",
      moonPhase: "Follow lunar phases for natural rhythm",
      astrological: "Moon hour for rhythmic alignment",
      energeticPeaks: ["tidal changes", "seasonal shifts", "biorhythm peaks"],
    },
    causeEffect: {
      timeOfDay: "New moon - for planting seeds of manifestation",
      moonPhase: "New moon for beginnings, Full moon for completion",
      astrological: "Jupiter hour for manifestation",
      energeticPeaks: ["new beginnings", "action times", "manifestation windows"],
    },
    gender: {
      timeOfDay: "Full moon - for complete balance and wholeness",
      moonPhase: "Full moon for integration, Dark moon for inner work",
      astrological: "Venus hour for harmony and balance",
      energeticPeaks: ["lunar maximum", "balance points", "wholeness times"],
    },
  };

  const timing = timingMaps[principle as keyof typeof timingMaps] || timingMaps.mentalism;

  // Determine frequency based on purpose
  let frequency = "Daily for 7 days, then weekly for maintenance";
  
  if (purpose.includes("healing")) {
    frequency = "Daily for 21 days for healing cycle";
  } else if (purpose.includes("transform")) {
    frequency = "Daily for 40 days for deep transformation";
  } else if (purpose.includes("protection")) {
    frequency = "Weekly or as needed for protection";
  } else if (purpose.includes("manifest")) {
    frequency = "New moon cycle (monthly) for manifestation work";
  }

  return {
    timeOfDay: timeOfDay || timing.timeOfDay,
    moonPhase: timing.moonPhase,
    frequency,
    astrological: timing.astrological,
    energeticPeaks: timing.energeticPeaks,
  };
}

function generateExpectedEffects(principle: string, purpose: string, difficulty: string): string[] {
  const baseEffects = [
    `Aligns you with the hermetic principle of ${principle}`,
    `Facilitates ${purpose} through ancient wisdom`,
    "Deepens connection to hermetic understanding",
    "Raises spiritual consciousness and awareness",
  ];

  const principleEffects = {
    mentalism: [
      "Enhanced mental clarity and focus",
      "Improved thought control and discipline",
      "Greater awareness of mental patterns",
    ],
    correspondence: [
      "Better understanding of universal patterns",
      "Improved synchronicity recognition",
      "Enhanced pattern-seeing abilities",
    ],
    vibration: [
      "Raised personal vibration and energy",
      "Enhanced sensitivity to energy",
      "Improved energetic boundaries",
    ],
    polarity: [
      "Better balance in all life areas",
      "Integration of shadow aspects",
      "Reduced inner conflict",
    ],
    rhythm: [
      "Improved natural rhythm alignment",
      "Better timing in life decisions",
      "Enhanced flow states",
    ],
    causeEffect: [
      "Increased manifestation abilities",
      "Better understanding of consequences",
      "Enhanced personal responsibility",
    ],
    gender: [
      "Balanced masculine and feminine energies",
      "Enhanced creativity and receptivity",
      "Improved relationships and self-acceptance",
    ],
  };

  const effects = [...baseEffects, ...principleEffects[principle as keyof typeof principleEffects] || []];

  if (difficulty === "advanced") {
    effects.push("Potential for profound spiritual breakthrough");
    effects.push("Enhanced psychic and intuitive abilities");
  }

  return effects;
}

function generateWarnings(principle: string, purpose: string, difficulty: string): string[] | undefined {
  const warnings: string[] = [];

  if (principle === "polarity") {
    warnings.push("May bring up shadow aspects that require integration with compassion");
    warnings.push("Emotional intensity may increase temporarily during balance work");
  }

  if (principle === "vibration") {
    warnings.push("High-vibration work can be intense - ground thoroughly afterward");
    warnings.push("Sensitive individuals may experience energy overload");
  }

  if (difficulty === "advanced") {
    warnings.push("Advanced practices can create powerful shifts - ensure you're prepared for change");
    warnings.push("Consider having experienced guidance available during deep work");
  }

  if (purpose.includes("shadow") || purpose.includes("healing")) {
    warnings.push("Healing work may temporarily intensify symptoms before improvement");
    warnings.push("Have support systems in place for emotional processing");
  }

  return warnings.length > 0 ? warnings : undefined;
}

function generatePreparationInstructions(principleData: any, elements: string[]): string[] {
  return [
    "Cleanse yourself with a shower or bath if possible",
    "Wear comfortable, loose-fitting clothing",
    "Ensure you won't be disturbed for the duration",
    "Gather all elements and place them within reach",
    `Face ${principleData.direction} direction if possible`,
    "Have water nearby for grounding after the ritual",
    "Set clear intention before beginning",
  ];
}

function generateClosingInstructions(principleData: any, purpose: string): string[] {
  return [
    "Thank all energies and entities that assisted",
    "Ground any excess energy into the earth",
    "Extinguish candles and put away sacred objects respectfully",
    "Record insights, visions, or experiences in a journal",
    "Drink water and eat something light if feeling spacey",
    "Avoid intense activities for at least 30 minutes",
    "Return to ordinary consciousness gradually",
  ];
}

function generateRitualVariations(principle: string, purpose: string, difficulty: string): RitualVariation[] {
  const variations: RitualVariation[] = [];

  // Quick version
  variations.push({
    name: "Quick Daily Version",
    description: "Condensed 5-10 minute version for daily practice",
    modifications: [
      "Reduce each phase by 50%",
      "Focus only on core practice",
      "Simplify visualization",
      "Use single candle or none",
    ],
    suitableFor: "Daily maintenance and busy schedules",
  });

  // Group version
  if (difficulty !== "beginner") {
    variations.push({
      name: "Group Ceremony Version",
      description: "Adapted for group practice and shared energy",
      modifications: [
        "Assign roles (leader, elements, directions)",
        "Use call and response format",
        "Add group visualization",
        "Include sharing circle",
      ],
      suitableFor: "Study groups, spiritual communities, families",
    });
  }

  // Outdoor version
  variations.push({
    name: "Nature/Outdoor Version",
    description: "Adapted for outdoor practice with natural elements",
    modifications: [
      "Use natural elements instead of tools",
      "Work with sun/moon energy directly",
      "Include tree or stone meditation",
      "Allow wind/earth sounds as background",
    ],
    suitableFor: "Nature lovers, travel situations, seasonal celebrations",
  });

  return variations;
}

// Helper functions
function getElementAlternatives(element: string): string[] {
  const alternatives: Record<string, string[]> = {
    candle: ["LED candle", "flashlight", "visualization of flame", "lamp"],
    crystal: ["stone", "glass object", "salt", "coin"],
    incense: ["essential oil", "dried herbs", "visualization of smoke", "fan"],
    bell: ["singing bowl", "chime app on phone", "clapping", "humming"],
    mirror: ["bowl of water", "polished metal", "phone screen", "window"],
    altar: ["small table", "cloth on floor", "tray", "outdoor stone"],
  };

  return alternatives[element.toLowerCase()] || [];
}

function getElementPlacement(element: string, index: number, direction: string): string {
  const placements = [
    `Place to the right of ${direction} direction`,
    `Place to the left of ${direction} direction`, 
    `Place behind primary element`,
    `Place in front of primary element`,
  ];

  return placements[index % placements.length];
}

function getElementSymbolism(element: string): string {
  const symbolism: Record<string, string> = {
    candle: "Divine light, illumination, fire element",
    crystal: "Earth energy, amplification, clarity",
    incense: "Air element, prayers rising, purification",
    bell: "Sound vibration, calling spirits, clearing energy",
    mirror: "Reflection, truth, portal between worlds",
    water: "Emotions, intuition, cleansing, flow",
    flower: "Beauty, growth, natural cycles, offering",
    stone: "Grounding, permanence, earth wisdom",
  };

  return symbolism[element.toLowerCase()] || "Sacred tool for ritual work";
}

function getVisualizationForPurpose(purpose: string, principleData: any): string {
  const visualizations = [
    `Golden light flowing through you, facilitating ${purpose}`,
    `${principleData.color} energy surrounding and transforming you`,
    `Ancient symbols of power glowing around you`,
    `Hermes Trismegistus blessing your ${purpose}`,
  ];

  return visualizations[Math.floor(Math.random() * visualizations.length)];
}

function generateMantraForPurpose(purpose: string, principleData: any): string {
  return `I am aligned with divine wisdom. ${purpose} flows naturally through me with the power of ${principleData.focus}.`;
}

function generateRitualName(principle: string, purpose: string, difficulty: string): string {
  const principleNames = {
    mentalism: "Mental Mastery",
    correspondence: "Sacred Correspondence", 
    vibration: "Vibrational Alignment",
    polarity: "Balance Integration",
    rhythm: "Rhythmic Harmony",
    causeEffect: "Conscious Creation",
    gender: "Divine Union",
  };

  const difficultyPrefix = {
    beginner: "Foundation",
    intermediate: "Awakening", 
    advanced: "Mastery",
  };

  return `${difficultyPrefix[difficulty as keyof typeof difficultyPrefix]} ${principleNames[principle as keyof typeof principleNames]}: ${purpose}`;
}