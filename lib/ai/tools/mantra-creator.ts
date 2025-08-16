export interface PersonalizedMantra {
  id: string;
  mantra: string;
  intention: string;
  principle: string;
  language: string;
  style: string;
  length: string;
  pronunciation?: string;
  meaning: string;
  usage: MantraUsage;
  variations: MantraVariation[];
  culturalContext?: string;
  energetics: MantraEnergetics;
}

export interface MantraUsage {
  frequency: string;
  timing: string[];
  duration: string;
  preparation: string[];
  environment: string[];
  posture: string[];
  breathwork: string;
}

export interface MantraVariation {
  name: string;
  text: string;
  purpose: string;
  when: string;
}

export interface MantraEnergetics {
  vibration: string;
  chakras: string[];
  elements: string[];
  planetaryCorrespondence?: string;
}

interface MantraParams {
  intention: string;
  principle: string;
  language: string;
  style: string;
  length: string;
}

export async function createPersonalizedMantra(params: MantraParams): Promise<PersonalizedMantra> {
  const { intention, principle, language, style, length } = params;
  
  const mantraId = `mantra_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Get principle configuration
  const principleConfig = getPrincipleConfiguration(principle);
  
  // Generate mantra based on parameters
  const mantraText = generateMantraText(intention, principleConfig, language, style, length);
  
  // Create usage guidance
  const usage = generateMantraUsage(principleConfig, length);
  
  // Generate variations
  const variations = generateMantraVariations(mantraText, intention, principleConfig, language);
  
  // Determine energetics
  const energetics = determineMantraEnergetics(principle, intention, mantraText);
  
  return {
    id: mantraId,
    mantra: mantraText,
    intention,
    principle,
    language,
    style,
    length,
    pronunciation: generatePronunciationGuide(mantraText, language),
    meaning: explainMantraMeaning(mantraText, intention, principleConfig, language),
    usage,
    variations,
    culturalContext: getCulturalContext(language, style),
    energetics,
  };
}

function getPrincipleConfiguration(principle: string) {
  const configurations = {
    mentalism: {
      focus: "mind, thought, mental clarity, consciousness",
      keywords: ["mind", "thought", "clarity", "awareness", "consciousness", "illumination"],
      energy: "mental/ethereal",
      chakra: "crown",
      element: "ether",
      planet: "Mercury",
      seed: "OM",
    },
    correspondence: {
      focus: "connection, reflection, as above so below, unity",
      keywords: ["above", "below", "reflection", "connection", "unity", "harmony"],
      energy: "balancing/connecting",
      chakra: "heart",
      element: "air",
      planet: "Venus",
      seed: "YAM",
    },
    vibration: {
      focus: "energy, movement, transformation, frequency",
      keywords: ["vibration", "energy", "frequency", "movement", "transformation", "power"],
      energy: "dynamic/transformative",
      chakra: "solar plexus",
      element: "fire",
      planet: "Mars",
      seed: "RAM",
    },
    polarity: {
      focus: "balance, integration, wholeness, opposites",
      keywords: ["balance", "harmony", "whole", "integration", "unity", "completion"],
      energy: "balancing/integrative",
      chakra: "heart",
      element: "earth",
      planet: "Saturn",
      seed: "LAM",
    },
    rhythm: {
      focus: "flow, cycles, natural timing, harmony",
      keywords: ["flow", "rhythm", "cycles", "nature", "timing", "harmony"],
      energy: "flowing/cyclical",
      chakra: "sacral",
      element: "water",
      planet: "Moon",
      seed: "VAM",
    },
    causeEffect: {
      focus: "creation, manifestation, will, responsibility",
      keywords: ["create", "manifest", "will", "intention", "power", "responsibility"],
      energy: "creative/manifesting",
      chakra: "throat",
      element: "ether",
      planet: "Jupiter",
      seed: "HAM",
    },
    gender: {
      focus: "union, balance, creation, wholeness",
      keywords: ["union", "balance", "creation", "wholeness", "sacred", "divine"],
      energy: "unifying/creative",
      chakra: "sacral",
      element: "water",
      planet: "Venus",
      seed: "SVAHA",
    },
  };

  return configurations[principle as keyof typeof configurations] || configurations.mentalism;
}

function generateMantraText(
  intention: string,
  principleConfig: any,
  language: string,
  style: string,
  length: string
): string {
  const templates = getMantraTemplates(language, style, length);
  const keywords = principleConfig.keywords;
  
  // Select appropriate template based on intention and principle
  let template = selectBestTemplate(templates, intention, keywords);
  
  // Fill template with intention-specific words
  const mantra = populateTemplate(template, intention, principleConfig, language);
  
  return mantra;
}

function getMantraTemplates(language: string, style: string, length: string) {
  const templates: Record<string, Record<string, Record<string, string[]>>> = {
    en: {
      traditional: {
        short: [
          "I am {intention}",
          "I {verb} {intention}",
          "{principle_word} flows through me",
          "I embrace {intention}",
        ],
        medium: [
          "I am aligned with {intention} through divine {principle_word}",
          "I {verb} {intention} with perfect {principle_word}",
          "Through {principle_word}, I manifest {intention} in my life",
          "I embrace {intention} as {principle_word} guides my path",
        ],
        long: [
          "I am one with the divine source of {intention}, and {principle_word} flows through me with perfect harmony",
          "Through the sacred principle of {principle_word}, I manifest {intention} in all aspects of my life",
          "I align my being with {intention}, and {principle_word} becomes my guide to truth and wisdom",
        ],
      },
      modern: {
        short: [
          "I choose {intention}",
          "I create {intention}",
          "{intention} is mine",
          "I live {intention}",
        ],
        medium: [
          "I consciously create {intention} through {principle_word}",
          "My {intention} manifests through {principle_word}",
          "I align with {intention} and trust the process",
          "{principle_word} supports my {intention}",
        ],
        long: [
          "I am the conscious creator of {intention}, and I trust in the principle of {principle_word} to guide my manifestation",
          "Every breath I take aligns me with {intention}, and {principle_word} flows through me with divine perfection",
        ],
      },
      poetic: {
        short: [
          "In {intention}, I shine",
          "{intention} blooms within",
          "I dance with {intention}",
          "{intention} flows like light",
        ],
        medium: [
          "Like a river flowing to the sea, {intention} flows through me",
          "In the garden of my soul, {intention} blooms through {principle_word}",
          "{principle_word} carries my {intention} on wings of light",
        ],
        long: [
          "As the dawn breaks upon the mountain peaks, so {intention} awakens within me through the eternal {principle_word}",
          "I am the vessel through which {intention} pours like golden honey, sweetened by the wisdom of {principle_word}",
        ],
      },
    },
    cs: {
      traditional: {
        short: [
          "Jsem {intention}",
          "{intention} protéká mnou",
          "Přijímám {intention}",
          "Jsem sladěn s {intention}",
        ],
        medium: [
          "Jsem sladěn s {intention} skrze božské {principle_word}",
          "Prostřednictvím {principle_word} projevujem {intention} v mém životě",
          "Přijímám {intention} když {principle_word} vede mou cestu",
        ],
        long: [
          "Jsem jeden s božským zdrojem {intention}, a {principle_word} protéká mnou v dokonalé harmonii",
          "Prostřednictvím svatého principu {principle_word} projevujem {intention} ve všech aspektech mého života",
        ],
      },
    },
    // Add more languages...
  };

  return templates[language]?.[style]?.[length] || templates.en.traditional.medium;
}

function selectBestTemplate(templates: string[], intention: string, keywords: string[]): string {
  // Simple selection based on intention keywords
  for (const template of templates) {
    if (keywords.some(keyword => intention.toLowerCase().includes(keyword.toLowerCase()))) {
      return template;
    }
  }
  
  return templates[0] || "I am aligned with {intention} through divine {principle_word}";
}

function populateTemplate(
  template: string,
  intention: string,
  principleConfig: any,
  language: string
): string {
  const intentionWord = extractIntentionWord(intention);
  const verb = generateActionVerb(intention, language);
  const principleWord = getPrincipleWord(principleConfig, language);
  
  return template
    .replace(/\{intention\}/g, intentionWord)
    .replace(/\{verb\}/g, verb)
    .replace(/\{principle_word\}/g, principleWord);
}

function extractIntentionWord(intention: string): string {
  // Extract the key concept from intention
  const keyWords = intention.toLowerCase().split(' ');
  const meaningfulWords = keyWords.filter(word => 
    !['i', 'want', 'to', 'need', 'desire', 'wish', 'would', 'like', 'for', 'a', 'an', 'the'].includes(word)
  );
  
  return meaningfulWords[0] || intention;
}

function generateActionVerb(intention: string, language: string): string {
  const intentionLower = intention.toLowerCase();
  
  const verbMap: Record<string, Record<string, string>> = {
    en: {
      heal: "heal",
      healing: "heal", 
      love: "love",
      peace: "embody",
      strength: "strengthen",
      wisdom: "embody",
      prosperity: "attract",
      success: "achieve",
      happiness: "cultivate",
      protection: "protect",
      guidance: "receive",
      clarity: "clarify",
    },
    cs: {
      heal: "léčím",
      healing: "léčím",
      love: "miluji", 
      peace: "ztělesňuji",
      strength: "posiluji",
      wisdom: "ztělesňuji",
      prosperity: "přitahuji",
      success: "dosahuji",
      happiness: "pěstuji",
      protection: "chráním",
      guidance: "přijímám",
      clarity: "objasňuji",
    },
  };

  const langMap = verbMap[language] || verbMap.en;
  
  for (const [key, verb] of Object.entries(langMap)) {
    if (intentionLower.includes(key)) {
      return verb;
    }
  }
  
  return language === 'cs' ? 'projevuji' : 'manifest';
}

function getPrincipleWord(principleConfig: any, language: string): string {
  const principleWords: Record<string, Record<string, string>> = {
    en: {
      mentalism: "mental clarity",
      correspondence: "divine correspondence", 
      vibration: "sacred vibration",
      polarity: "perfect balance",
      rhythm: "natural rhythm",
      causeEffect: "conscious creation",
      gender: "divine union",
    },
    cs: {
      mentalism: "mentální jasnost",
      correspondence: "božská korespondence",
      vibration: "svatá vibrace", 
      polarity: "dokonalá rovnováha",
      rhythm: "přírodní rytmus",
      causeEffect: "vědomé tvoření",
      gender: "božské spojení",
    },
  };

  return principleWords[language]?.[principleConfig.focus.split(',')[0]] || principleConfig.focus;
}

function generatePronunciationGuide(mantraText: string, language: string): string {
  if (language === 'en') {
    // For English, provide emphasis guidance
    return `Emphasize stressed syllables and pause between phrases. Speak with reverence and intention.`;
  }
  
  if (language === 'cs') {
    return `Zdůrazněte přirozený přízvuk a mluvte s úctou a záměrem.`;
  }
  
  return `Speak slowly and with intention, allowing each word to resonate fully before moving to the next.`;
}

function explainMantraMeaning(
  mantraText: string,
  intention: string,
  principleConfig: any,
  language: string
): string {
  const baseExplanation = `This mantra aligns your consciousness with ${intention} through the hermetic principle of ${principleConfig.focus}. `;
  const powerExplanation = `Each repetition reinforces your connection to this energy and strengthens your ability to manifest ${intention} in your life. `;
  const principleExplanation = `The principle of ${principleConfig.focus} supports this manifestation by ${getPrincipleExplanation(principleConfig)}.`;
  
  return baseExplanation + powerExplanation + principleExplanation;
}

function getPrincipleExplanation(principleConfig: any): string {
  const explanations: Record<string, string> = {
    "mind, thought, mental clarity, consciousness": "clarifying your mental patterns and aligning your thoughts with your highest good",
    "connection, reflection, as above so below, unity": "connecting your inner intention with outer manifestation",
    "energy, movement, transformation, frequency": "raising your vibrational frequency to match your desired outcome",
    "balance, integration, wholeness, opposites": "bringing all aspects of yourself into harmony with your intention",
    "flow, cycles, natural timing, harmony": "aligning your intention with natural rhythms and divine timing",
    "creation, manifestation, will, responsibility": "empowering your conscious will to create desired outcomes",
    "union, balance, creation, wholeness": "uniting all aspects of yourself in service of your intention",
  };
  
  return explanations[principleConfig.focus] || "supporting your spiritual alignment and growth";
}

function generateMantraUsage(principleConfig: any, length: string): MantraUsage {
  const baseFrequency = length === 'short' ? '108 repetitions' : length === 'medium' ? '54 repetitions' : '27 repetitions';
  
  const timing = ['sunrise', 'before meditation', 'during ritual work'];
  if (principleConfig.planet === 'Moon') timing.push('full moon', 'new moon');
  if (principleConfig.planet === 'Sun') timing.push('solar noon', 'sunset');
  
  return {
    frequency: `${baseFrequency} daily for 40 days, then as needed`,
    timing,
    duration: length === 'short' ? '5-10 minutes' : length === 'medium' ? '10-15 minutes' : '15-20 minutes',
    preparation: [
      'Sit in comfortable meditation posture',
      'Light candle or incense if desired',
      'Take three deep breaths to center',
      'Set clear intention before beginning',
    ],
    environment: [
      'Quiet space without interruptions',
      'Face east if possible',
      'Use mala beads for counting if helpful',
      'Soft natural lighting preferred',
    ],
    posture: [
      'Seated with spine straight',
      'Hands in prayer position or on knees',
      'Eyes closed or soft gaze downward',
      'Relaxed but alert posture',
    ],
    breathwork: getBreaththWorkForPrinciple(principleConfig),
  };
}

function getBreaththWorkForPrinciple(principleConfig: any): string {
  const breathwork: Record<string, string> = {
    "mind, thought, mental clarity, consciousness": "Breathe naturally, coordinating mantra with breath rhythm",
    "connection, reflection, as above so below, unity": "Equal length inhale and exhale, balanced breathing",
    "energy, movement, transformation, frequency": "Powerful breath with slight retention after inhale",
    "balance, integration, wholeness, opposites": "Alternate nostril breathing before mantra practice",
    "flow, cycles, natural timing, harmony": "Natural breath rhythm, flowing like water",
    "creation, manifestation, will, responsibility": "Deep diaphragmatic breathing with intention",
    "union, balance, creation, wholeness": "Heart-centered breathing from the heart chakra",
  };
  
  return breathwork[principleConfig.focus] || "Natural breath rhythm coordinated with mantra repetition";
}

function generateMantraVariations(
  originalMantra: string,
  intention: string,
  principleConfig: any,
  language: string
): MantraVariation[] {
  const variations: MantraVariation[] = [];
  
  // Silent version
  variations.push({
    name: "Silent Meditation",
    text: `(${originalMantra}) - repeated silently`,
    purpose: "For deep inner work and subtle energy cultivation",
    when: "During formal meditation or in public spaces",
  });
  
  // Whispered version
  variations.push({
    name: "Whispered Practice", 
    text: originalMantra,
    purpose: "For gentle energy building and throat chakra activation",
    when: "Early morning or late evening practice",
  });
  
  // Sung version
  variations.push({
    name: "Melodic Chanting",
    text: `${originalMantra} (create your own melody)`,
    purpose: "For heart opening and joyful expression",
    when: "During group practice or celebration",
  });
  
  // Abbreviated version
  const shortVersion = extractKeyWords(originalMantra);
  variations.push({
    name: "Quick Affirmation",
    text: shortVersion,
    purpose: "For busy moments and instant alignment",
    when: "Throughout the day as needed",
  });
  
  return variations;
}

function extractKeyWords(mantra: string): string {
  const words = mantra.split(' ');
  const keyWords = words.filter(word => 
    !['i', 'am', 'the', 'a', 'an', 'with', 'through', 'in', 'of', 'to', 'and'].includes(word.toLowerCase())
  );
  
  return keyWords.slice(0, 3).join(' ') || mantra;
}

function determineMantraEnergetics(principle: string, intention: string, mantraText: string): MantraEnergetics {
  const principleEnergetics: Record<string, Partial<MantraEnergetics>> = {
    mentalism: {
      vibration: "high, ethereal, clarifying",
      chakras: ["crown", "third eye"],
      elements: ["ether", "air"],
      planetaryCorrespondence: "Mercury",
    },
    correspondence: {
      vibration: "balanced, harmonious, connecting",
      chakras: ["heart", "throat"],
      elements: ["air", "ether"],
      planetaryCorrespondence: "Venus",
    },
    vibration: {
      vibration: "dynamic, transformative, energizing", 
      chakras: ["solar plexus", "sacral"],
      elements: ["fire", "air"],
      planetaryCorrespondence: "Mars",
    },
    polarity: {
      vibration: "balancing, integrative, harmonizing",
      chakras: ["heart", "root"],
      elements: ["earth", "air"],
      planetaryCorrespondence: "Saturn",
    },
    rhythm: {
      vibration: "flowing, cyclical, natural",
      chakras: ["sacral", "heart"], 
      elements: ["water", "earth"],
      planetaryCorrespondence: "Moon",
    },
    causeEffect: {
      vibration: "creative, manifesting, powerful",
      chakras: ["throat", "solar plexus"],
      elements: ["ether", "fire"],
      planetaryCorrespondence: "Jupiter",
    },
    gender: {
      vibration: "unifying, creative, wholeness",
      chakras: ["sacral", "heart"],
      elements: ["water", "earth"], 
      planetaryCorrespondence: "Venus",
    },
  };
  
  return {
    vibration: "harmonious and aligned",
    chakras: ["heart"],
    elements: ["ether"],
    ...principleEnergetics[principle],
  } as MantraEnergetics;
}

function getCulturalContext(language: string, style: string): string {
  const contexts: Record<string, Record<string, string>> = {
    en: {
      traditional: "Draws from Western hermetic and New Thought traditions",
      modern: "Contemporary mindfulness and manifestation practices", 
      poetic: "Inspired by mystical poetry and spiritual literature",
    },
    cs: {
      traditional: "Honors Czech mystical and philosophical traditions",
      modern: "Contemporary Czech spiritual practice",
      poetic: "Inspired by Czech literary and mystical heritage",
    },
  };
  
  return contexts[language]?.[style] || "Universal spiritual wisdom adapted for personal practice";
}