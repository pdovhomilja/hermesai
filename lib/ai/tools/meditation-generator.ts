export interface GuidedMeditation {
  id: string;
  title: string;
  description: string;
  focus: string;
  duration: number;
  technique: string;
  level: string;
  principle?: string;
  script: MeditationScript;
  preparation: MeditationPreparation;
  variations: MeditationVariation[];
  followUp: MeditationFollowUp;
}

export interface MeditationScript {
  opening: ScriptSection;
  bodySegments: ScriptSection[];
  closing: ScriptSection;
  totalWordCount: number;
  estimatedDuration: number;
}

export interface ScriptSection {
  title: string;
  content: string;
  duration: number;
  instructions: string[];
  pausePoints: number[];
  voiceGuidance: VoiceGuidance;
}

export interface VoiceGuidance {
  tone: string;
  pace: string;
  volume: string;
  emphasis: string[];
  breathingCues: string[];
}

export interface MeditationPreparation {
  environment: string[];
  posture: string[];
  props: MeditationProp[];
  mentalPreparation: string[];
  timing: string[];
}

export interface MeditationProp {
  item: string;
  purpose: string;
  optional: boolean;
  alternatives: string[];
}

export interface MeditationVariation {
  name: string;
  description: string;
  adaptations: string[];
  suitableFor: string;
  duration: number;
}

export interface MeditationFollowUp {
  integration: string[];
  journaling: string[];
  progressTracking: string[];
  nextSteps: string[];
  troubleshooting: MeditationTroubleshooting[];
}

export interface MeditationTroubleshooting {
  issue: string;
  solutions: string[];
  prevention: string[];
}

interface MeditationParams {
  focus: string;
  duration: number;
  technique: string;
  background?: string;
  level: string;
  principle?: string;
}

export async function generateGuidedMeditation(params: MeditationParams): Promise<GuidedMeditation> {
  const {
    focus,
    duration,
    technique,
    background,
    level = "beginner",
    principle
  } = params;

  const meditationId = `meditation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create meditation structure based on technique and duration
  const script = generateMeditationScript(focus, duration, technique, level, principle);
  
  // Create preparation guidance
  const preparation = generatePreparation(technique, background, level);
  
  // Generate variations for different needs
  const variations = generateVariations(focus, technique, duration, level);
  
  // Create follow-up guidance
  const followUp = generateFollowUpGuidance(focus, technique, level);

  return {
    id: meditationId,
    title: generateMeditationTitle(focus, technique, duration),
    description: generateMeditationDescription(focus, technique, duration, principle),
    focus,
    duration,
    technique,
    level,
    principle,
    script,
    preparation,
    variations,
    followUp,
  };
}

function generateMeditationScript(
  focus: string,
  duration: number,
  technique: string,
  level: string,
  principle?: string
): MeditationScript {
  // Calculate timing structure
  const timing = calculateMeditationTiming(duration, technique, level);
  
  // Generate opening
  const opening = generateOpening(focus, technique, timing.opening, level, principle);
  
  // Generate main body segments
  const bodySegments = generateBodySegments(focus, technique, timing.body, level, principle);
  
  // Generate closing
  const closing = generateClosing(focus, technique, timing.closing, level, principle);
  
  const totalWordCount = opening.content.split(' ').length + 
    bodySegments.reduce((sum, seg) => sum + seg.content.split(' ').length, 0) +
    closing.content.split(' ').length;

  return {
    opening,
    bodySegments,
    closing,
    totalWordCount,
    estimatedDuration: duration,
  };
}

function calculateMeditationTiming(duration: number, technique: string, level: string) {
  const baseStructure = {
    opening: 0.15,
    body: 0.70,
    closing: 0.15
  };
  
  // Adjust for level
  if (level === "beginner") {
    baseStructure.opening += 0.05;
    baseStructure.body -= 0.05;
  } else if (level === "advanced") {
    baseStructure.opening -= 0.05;
    baseStructure.body += 0.05;
  }
  
  return {
    opening: Math.round(duration * baseStructure.opening),
    body: Math.round(duration * baseStructure.body),
    closing: Math.round(duration * baseStructure.closing)
  };
}

function generateOpening(
  focus: string,
  technique: string,
  duration: number,
  level: string,
  principle?: string
): ScriptSection {
  const openings = {
    beginner: {
      visualization: `Welcome to this ${focus} meditation. Find a comfortable position where you can sit or lie down without being disturbed. Close your eyes gently, or soften your gaze downward. Begin by taking three slow, deep breaths. With each exhale, allow your body to relax more deeply. Feel yourself settling into this moment, into this space of peace and inner exploration.`,
      breathwork: `Welcome to this breathwork meditation focused on ${focus}. Come into your most comfortable seated position, with your spine naturally upright. Place one hand on your chest and one on your belly. Take a moment to notice your natural breath rhythm. There's nothing to change right now, just awareness of this life-giving breath that connects you to all of existence.`,
      mantra: `Welcome to this sacred time of mantra meditation for ${focus}. Sit comfortably with your spine straight but not rigid. Allow your hands to rest gently in your lap or on your knees. Close your eyes and take three centering breaths. Feel yourself arriving fully in this moment, creating sacred space within and around you.`,
      "body-scan": `Welcome to this body-scan meditation for ${focus}. Find your most comfortable position, whether sitting or lying down. Allow your body to be fully supported. Close your eyes and take a few natural breaths. Begin to turn your attention inward, preparing to journey through your physical body with loving awareness.`,
      contemplation: `Welcome to this contemplation on ${focus}. Sit in a comfortable, alert position. Allow your mind to become quiet and receptive. Take several deep breaths, releasing any urgency or agenda. Open your heart and mind to receive whatever wisdom wants to emerge during this time of deep reflection.`,
      "loving-kindness": `Welcome to this loving-kindness meditation focused on ${focus}. Sit comfortably with your heart open and hands resting gently. Close your eyes and breathe naturally. Begin to connect with the loving warmth that exists within your heart. Feel this natural capacity for love and compassion that is your birthright.`,
      mindfulness: `Welcome to this mindfulness meditation for ${focus}. Settle into your seat and find your natural breathing rhythm. There's nothing to fix or change, just gentle awareness of what is present right now. Allow yourself to arrive fully in this moment, this breath, this experience of being alive.`
    }
  };
  
  let content = openings.beginner[technique as keyof typeof openings.beginner] || openings.beginner.mindfulness;
  
  // Add principle integration if specified
  if (principle) {
    content += ` As we begin, call to mind the hermetic principle of ${principle}, allowing this ancient wisdom to guide and illuminate your practice.`;
  }
  
  return {
    title: "Opening and Centering",
    content,
    duration,
    instructions: [
      "Find comfortable position",
      "Close eyes or soften gaze", 
      "Take three deep breaths",
      "Set intention for practice"
    ],
    pausePoints: [30, 60, 90], // seconds into segment for natural pauses
    voiceGuidance: {
      tone: "warm and welcoming",
      pace: "slow and gentle",
      volume: "soft to medium",
      emphasis: ["comfortable", "breathe", "relax", "peaceful"],
      breathingCues: ["Take three deep breaths", "Allow each exhale to deepen your relaxation"]
    }
  };
}

function generateBodySegments(
  focus: string,
  technique: string,
  bodyDuration: number,
  level: string,
  principle?: string
): ScriptSection[] {
  const segments: ScriptSection[] = [];
  
  // Determine number of segments based on duration and technique
  const numSegments = technique === "body-scan" ? 4 : 3;
  const segmentDuration = Math.round(bodyDuration / numSegments);
  
  for (let i = 0; i < numSegments; i++) {
    const segment = generateBodySegment(
      focus,
      technique,
      segmentDuration,
      i + 1,
      numSegments,
      level,
      principle
    );
    segments.push(segment);
  }
  
  return segments;
}

function generateBodySegment(
  focus: string,
  technique: string,
  duration: number,
  segmentNumber: number,
  totalSegments: number,
  level: string,
  principle?: string
): ScriptSection {
  const segmentGenerators = {
    visualization: generateVisualizationSegment,
    breathwork: generateBreathworkSegment,
    mantra: generateMantraSegment,
    "body-scan": generateBodyScanSegment,
    contemplation: generateContemplationSegment,
    "loving-kindness": generateLovingKindnessSegment,
    mindfulness: generateMindfulnessSegment
  };
  
  const generator = segmentGenerators[technique as keyof typeof segmentGenerators] || segmentGenerators.mindfulness;
  return generator(focus, duration, segmentNumber, totalSegments, level, principle);
}

function generateVisualizationSegment(
  focus: string,
  duration: number,
  segmentNumber: number,
  totalSegments: number,
  level: string,
  principle?: string
): ScriptSection {
  const segments = {
    1: `Now, bring your attention to your breath and begin to relax even more deeply. Imagine yourself in a beautiful, peaceful place where ${focus} naturally flows. This might be a serene garden, a quiet beach, or a sacred temple. Allow this place to form in your mind's eye. Notice the colors, the light, the feeling of this space. Feel how naturally ${focus} exists here.`,
    2: `Deepen into this visualization. See yourself in this peaceful place, completely embodying ${focus}. Notice how your body feels here, how your mind is calm and clear. If ${focus} had a color, what would it be? Allow that color to surround you, filling every cell of your being. Feel this quality becoming part of your essential nature.`,
    3: `Now, imagine taking this feeling of ${focus} with you everywhere you go. See yourself moving through your daily life, carrying this peaceful, centered quality. Visualize specific situations where you naturally express ${focus}. Feel how this transforms your interactions and experiences. Know that this peaceful state is always available to you.`
  };
  
  let content = segments[segmentNumber as keyof typeof segments] || segments[1];
  
  if (principle && segmentNumber === 2) {
    content += ` Remember the hermetic principle of ${principle} as you visualize, allowing this ancient wisdom to deepen your understanding of ${focus}.`;
  }
  
  return {
    title: `Visualization Phase ${segmentNumber}`,
    content,
    duration,
    instructions: [
      "Create vivid mental imagery",
      "Engage multiple senses",
      "Feel the emotional qualities",
      "Allow the experience to feel real"
    ],
    pausePoints: [duration * 0.3, duration * 0.7],
    voiceGuidance: {
      tone: "gentle and descriptive",
      pace: "slow with natural pauses",
      volume: "soft and soothing",
      emphasis: ["imagine", "feel", "notice", "allow"],
      breathingCues: ["Breathe naturally as you visualize", "Let each breath deepen the imagery"]
    }
  };
}

function generateBreathworkSegment(
  focus: string,
  duration: number,
  segmentNumber: number,
  totalSegments: number,
  level: string,
  principle?: string
): ScriptSection {
  const patterns = {
    1: `Begin to deepen your natural breath. Inhale slowly through your nose for a count of 4, feeling your belly expand. Hold this breath gently for 2 counts. Then exhale slowly through your mouth for 6 counts, releasing any tension or distraction. With each cycle, feel ${focus} growing stronger within you.`,
    2: `Continue this rhythmic breathing, allowing it to become your anchor to the present moment. As you breathe in, imagine drawing in peace, clarity, and ${focus}. As you breathe out, release anything that doesn't serve this intention. Let your breath be a bridge between your inner and outer worlds.`,
    3: `Now allow your breath to return to its natural rhythm, but maintain this heightened awareness. Feel how your breath connects you to all of life, to the universal rhythm that pulses through everything. Each breath is a gift, each exhale a letting go. Rest in this natural flow.`
  };
  
  let content = patterns[segmentNumber as keyof typeof patterns] || patterns[1];
  
  return {
    title: `Breathwork Pattern ${segmentNumber}`,
    content,
    duration,
    instructions: [
      "Follow the breath counting",
      "Maintain gentle focus",
      "Don't force or strain",
      "Return to pattern if mind wanders"
    ],
    pausePoints: [duration * 0.25, duration * 0.5, duration * 0.75],
    voiceGuidance: {
      tone: "steady and rhythmic",
      pace: "matches breathing rhythm",
      volume: "clear and consistent",
      emphasis: ["breathe in", "hold", "breathe out", "release"],
      breathingCues: ["Inhale for 4", "Hold for 2", "Exhale for 6"]
    }
  };
}

function generateMantraSegment(
  focus: string,
  duration: number,
  segmentNumber: number,
  totalSegments: number,
  level: string,
  principle?: string
): ScriptSection {
  const mantras = {
    1: `Now we'll introduce your mantra for ${focus}. The phrase we'll work with is: "I am ${focus}, ${focus} flows through me." Begin to repeat this phrase silently or softly aloud. Let the words resonate in your heart and mind. There's no rush - allow each word to have its own space and meaning.`,
    2: `Continue with your mantra, allowing it to find its own rhythm with your breath. "I am ${focus}, ${focus} flows through me." Notice how the repetition creates a gentle vibration within you. If your mind wanders, simply return to the mantra. Let it become like a gentle wave, carrying you deeper into peace.`,
    3: `As you continue the mantra, begin to let the words dissolve, keeping only the feeling and energy they create. Feel yourself embodying the essence of ${focus}. You are not just saying the words - you are becoming the living expression of this quality. Rest in this embodied knowing.`
  };
  
  let content = mantras[segmentNumber as keyof typeof mantras] || mantras[1];
  
  return {
    title: `Mantra Practice ${segmentNumber}`,
    content,
    duration,
    instructions: [
      "Repeat the mantra steadily",
      "Match with breath rhythm",
      "Feel the words' vibration",
      "Return when mind wanders"
    ],
    pausePoints: [duration * 0.2, duration * 0.6],
    voiceGuidance: {
      tone: "steady and reverent",
      pace: "slow and measured",
      volume: "gentle and consistent",
      emphasis: ["I am", focus, "flows through me"],
      breathingCues: ["Let the mantra flow with your breath"]
    }
  };
}

function generateBodyScanSegment(
  focus: string,
  duration: number,
  segmentNumber: number,
  totalSegments: number,
  level: string,
  principle?: string
): ScriptSection {
  const bodyAreas = {
    1: "head, neck, and shoulders",
    2: "arms, chest, and heart area", 
    3: "abdomen, back, and hips",
    4: "legs, feet, and whole body"
  };
  
  const area = bodyAreas[segmentNumber as keyof typeof bodyAreas];
  
  const content = `Now bring your loving attention to your ${area}. Breathe into this area of your body, sending ${focus} to every muscle, every cell. Notice any sensations without trying to change them. Simply offer kind awareness. If you find tension or discomfort, breathe ${focus} into those areas. Feel your body relaxing and opening to this healing energy. Thank this part of your body for all it does for you.`;
  
  return {
    title: `Body Scan: ${area}`,
    content,
    duration,
    instructions: [
      "Focus attention on specific body area",
      "Notice sensations without judgment",
      "Breathe into any tension",
      "Send love and gratitude"
    ],
    pausePoints: [duration * 0.3, duration * 0.7],
    voiceGuidance: {
      tone: "gentle and caring",
      pace: "very slow and patient",
      volume: "soft and nurturing",
      emphasis: ["breathe into", "notice", "relax", "thank"],
      breathingCues: ["Breathe into this area", "Let your breath bring healing"]
    }
  };
}

function generateContemplationSegment(
  focus: string,
  duration: number,
  segmentNumber: number,
  totalSegments: number,
  level: string,
  principle?: string
): ScriptSection {
  const questions = {
    1: `Gently bring to mind this question: "What does ${focus} mean to me?" Don't search for an answer, but rather allow insights to arise naturally. Rest in curious, open awareness. Whatever comes - words, images, feelings - simply receive it without judgment.`,
    2: `Continue this gentle contemplation. Ask yourself: "How does ${focus} want to express through me?" Again, there's no need to figure anything out. Simply hold the question in your heart and allow wisdom to emerge in its own time and way.`,
    3: `For this final contemplation, hold this question: "How can I embody ${focus} in my daily life?" Rest in receptive awareness, allowing any guidance to arise. Trust whatever emerges, knowing that your inner wisdom is always available to you.`
  };
  
  let content = questions[segmentNumber as keyof typeof questions] || questions[1];
  
  if (principle && segmentNumber === 2) {
    content += ` Consider how the hermetic principle of ${principle} might illuminate your understanding of ${focus}.`;
  }
  
  return {
    title: `Contemplation ${segmentNumber}`,
    content,
    duration,
    instructions: [
      "Hold question lightly in awareness",
      "Don't search or force insights", 
      "Receive whatever arises",
      "Trust your inner wisdom"
    ],
    pausePoints: [duration * 0.2, duration * 0.8],
    voiceGuidance: {
      tone: "quiet and reflective",
      pace: "very slow with long pauses",
      volume: "soft and thoughtful",
      emphasis: ["gently", "allow", "receive", "trust"],
      breathingCues: ["Breathe naturally as you contemplate"]
    }
  };
}

function generateLovingKindnessSegment(
  focus: string,
  duration: number,
  segmentNumber: number,
  totalSegments: number,
  level: string,
  principle?: string
): ScriptSection {
  const targets = {
    1: "yourself",
    2: "someone you love easily",
    3: "all beings everywhere"
  };
  
  const target = targets[segmentNumber as keyof typeof targets];
  
  const content = `Now we'll send loving-kindness to ${target}. ${target === "yourself" ? "Place your hands on your heart and" : "Bring to mind"} ${target}. Feel the warmth of love in your heart. Send these intentions: "May ${target === "yourself" ? "I" : target === "someone you love easily" ? "you" : "all beings"} be filled with ${focus}. May ${target === "yourself" ? "I" : target === "someone you love easily" ? "you" : "all beings"} be peaceful and happy. May ${target === "yourself" ? "I" : target === "someone you love easily" ? "you" : "all beings"} be free from suffering." Feel this love radiating outward, connecting you to the universal web of compassion.`;
  
  return {
    title: `Loving-Kindness for ${target}`,
    content,
    duration,
    instructions: [
      "Connect with feeling of love",
      "Send specific intentions",
      "Feel the radiating quality",
      "Include yourself in the love"
    ],
    pausePoints: [duration * 0.25, duration * 0.5, duration * 0.75],
    voiceGuidance: {
      tone: "warm and loving",
      pace: "slow and heartful",
      volume: "gentle and caring",
      emphasis: ["may you be", "love", "peaceful", "happy"],
      breathingCues: ["Let your breath carry this love"]
    }
  };
}

function generateMindfulnessSegment(
  focus: string,
  duration: number,
  segmentNumber: number,
  totalSegments: number,
  level: string,
  principle?: string
): ScriptSection {
  const focuses = {
    1: "breath",
    2: "body sensations", 
    3: "thoughts and emotions"
  };
  
  const currentFocus = focuses[segmentNumber as keyof typeof focuses];
  
  const content = `Now we'll practice mindfulness of ${currentFocus}. Simply notice ${currentFocus} as it is right now, without trying to change anything. When you notice your attention has wandered, gently return to observing ${currentFocus}. This quality of gentle, non-judgmental awareness is ${focus} in action. There's nowhere else to be, nothing else to do, just this moment of aware presence.`;
  
  return {
    title: `Mindfulness of ${currentFocus}`,
    content,
    duration,
    instructions: [
      "Notice without changing",
      "Return gently when wandering",
      "Practice non-judgmental awareness",
      "Rest in present moment"
    ],
    pausePoints: [duration * 0.4, duration * 0.8],
    voiceGuidance: {
      tone: "calm and steady",
      pace: "natural and unhurried",
      volume: "clear and present",
      emphasis: ["simply notice", "gently return", "aware presence"],
      breathingCues: ["Let your breath anchor you in the present"]
    }
  };
}

function generateClosing(
  focus: string,
  technique: string,
  duration: number,
  level: string,
  principle?: string
): ScriptSection {
  let content = `As we prepare to complete this meditation, take a moment to appreciate yourself for this time of practice. Feel the quality of ${focus} that has been cultivated within you. Know that this peaceful, centered state is always available to you. 

Begin to deepen your breath slightly. Wiggle your fingers and toes. When you're ready, slowly open your eyes and take a moment to transition back to ordinary awareness, carrying this sense of ${focus} with you.`;

  if (principle) {
    content = content.replace(
      "Know that this peaceful, centered state is always available to you.",
      `Know that this peaceful, centered state is always available to you. Remember the hermetic principle of ${principle} - this wisdom can guide you in integrating what you've experienced today.`
    );
  }

  return {
    title: "Closing and Integration",
    content,
    duration,
    instructions: [
      "Appreciate your practice",
      "Feel the cultivated qualities",
      "Slowly return to ordinary awareness",
      "Take time to integrate"
    ],
    pausePoints: [duration * 0.3, duration * 0.7],
    voiceGuidance: {
      tone: "grateful and encouraging",
      pace: "gradually returning to normal",
      volume: "gentle but clear",
      emphasis: ["appreciate", "always available", "carry with you"],
      breathingCues: ["Deepen your breath", "Take your time returning"]
    }
  };
}

function generatePreparation(
  technique: string,
  background?: string,
  level: string = "beginner"
): MeditationPreparation {
  const baseEnvironment = [
    "Quiet space without interruptions",
    "Comfortable temperature",
    "Soft lighting or darkness", 
    "Turn off or silence electronic devices"
  ];

  if (background) {
    baseEnvironment.push(`${background} sounds can enhance the experience`);
  }

  const props: MeditationProp[] = [
    {
      item: "Meditation cushion or comfortable chair",
      purpose: "Maintain alert, comfortable posture",
      optional: false,
      alternatives: ["pillow", "folded blanket", "any supportive seating"]
    },
    {
      item: "Blanket or shawl",
      purpose: "Maintain warmth as body relaxes",
      optional: true,
      alternatives: ["sweater", "jacket", "additional layer"]
    }
  ];

  if (technique === "mantra") {
    props.push({
      item: "Mala beads",
      purpose: "Track mantra repetitions",
      optional: true,
      alternatives: ["worry beads", "small stones", "mental counting"]
    });
  }

  if (technique === "visualization") {
    props.push({
      item: "Journal and pen",
      purpose: "Record visual impressions after meditation",
      optional: true,
      alternatives: ["phone notes", "mental note-taking", "drawing pad"]
    });
  }

  return {
    environment: baseEnvironment,
    posture: [
      "Seated with spine naturally upright",
      "Shoulders relaxed and soft",
      "Hands resting comfortably",
      "Eyes closed or soft downward gaze"
    ],
    props,
    mentalPreparation: [
      "Set clear intention for practice",
      "Release agenda or expectations",
      "Commit to the full duration",
      "Open to whatever arises"
    ],
    timing: [
      "Choose consistent time if possible",
      "Avoid meditating right after large meals",
      "Allow buffer time before other activities",
      "Early morning often works best for many people"
    ]
  };
}

function generateVariations(
  focus: string,
  technique: string,
  duration: number,
  level: string
): MeditationVariation[] {
  const variations: MeditationVariation[] = [];

  // Quick version
  variations.push({
    name: "Quick Practice",
    description: "Shortened version for busy times",
    adaptations: [
      `Reduce duration to ${Math.max(5, Math.round(duration / 3))} minutes`,
      "Focus on core technique only",
      "Simplified preparation",
      "Brief closing"
    ],
    suitableFor: "Busy schedules, workplace breaks, quick centering",
    duration: Math.max(5, Math.round(duration / 3))
  });

  // Walking version
  if (technique !== "body-scan") {
    variations.push({
      name: "Walking Meditation",
      description: "Practice while walking slowly",
      adaptations: [
        "Walk very slowly and mindfully",
        "Coordinate technique with walking rhythm",
        "Keep eyes open and soft",
        "Use outdoor setting if possible"
      ],
      suitableFor: "Those who prefer movement, outdoor practice, energy release",
      duration: duration
    });
  }

  // Group version
  variations.push({
    name: "Group Practice",
    description: "Adapted for group meditation",
    adaptations: [
      "Leader guides the meditation aloud",
      "Shared intention setting",
      "Optional sharing circle afterward",
      "Synchronized breathing or movement"
    ],
    suitableFor: "Meditation groups, families, spiritual communities",
    duration: duration + 10 // Extra time for group elements
  });

  // Extended version
  if (duration < 45) {
    variations.push({
      name: "Deep Practice",
      description: "Extended version for deeper exploration",
      adaptations: [
        `Extend to ${duration + 15} minutes`,
        "Add additional body segments",
        "Include more silence and space",
        "Deeper exploration of ${focus}"
      ],
      suitableFor: "Experienced practitioners, retreat settings, deep work",
      duration: duration + 15
    });
  }

  return variations;
}

function generateFollowUpGuidance(
  focus: string,
  technique: string,
  level: string
): MeditationFollowUp {
  return {
    integration: [
      `Carry the feeling of ${focus} into your daily activities`,
      "Notice opportunities to apply what you cultivated",
      "Use brief moments throughout the day to reconnect",
      "Practice the core technique during challenging moments"
    ],
    journaling: [
      "What did you notice during the meditation?",
      `How did the quality of ${focus} feel in your body?`,
      "What insights or realizations emerged?",
      "How might you apply this in your daily life?",
      "What would you like to explore further?"
    ],
    progressTracking: [
      "Track frequency of practice",
      `Note changes in your relationship to ${focus}`,
      "Observe improvements in concentration",
      "Record any breakthrough moments or insights",
      "Notice effects on daily mood and reactions"
    ],
    nextSteps: [
      "Establish regular practice schedule",
      `Explore other meditations focused on ${focus}`,
      `Study the deeper aspects of ${technique}`,
      "Consider working with a meditation teacher",
      "Join a meditation group or community"
    ],
    troubleshooting: [
      {
        issue: "Mind keeps wandering",
        solutions: [
          "This is normal - gently return to the focus",
          "Use counting or anchoring techniques",
          "Try shorter sessions initially",
          "Practice self-compassion, not self-judgment"
        ],
        prevention: [
          "Consistent daily practice",
          "Proper preparation and environment",
          "Clear intention setting"
        ]
      },
      {
        issue: "Feeling restless or agitated",
        solutions: [
          "Try walking meditation instead",
          "Reduce session length",
          "Focus more on breath awareness",
          "Ensure proper posture and comfort"
        ],
        prevention: [
          "Avoid caffeine before meditation",
          "Choose appropriate time of day",
          "Address underlying stress first"
        ]
      },
      {
        issue: "Falling asleep during practice",
        solutions: [
          "Sit more upright",
          "Practice with eyes slightly open",
          "Choose more alert time of day",
          "Ensure adequate sleep at night"
        ],
        prevention: [
          "Good sleep hygiene",
          "Meditate when naturally alert",
          "Avoid heavy meals beforehand"
        ]
      }
    ]
  };
}

function generateMeditationTitle(focus: string, technique: string, duration: number): string {
  const titleTemplates = {
    visualization: `Guided Visualization for ${focus}`,
    breathwork: `Breath Awareness for ${focus}`,
    mantra: `Mantra Meditation: Cultivating ${focus}`,
    "body-scan": `Body Scan for ${focus}`,
    contemplation: `Contemplative Practice: ${focus}`,
    "loving-kindness": `Loving-Kindness for ${focus}`,
    mindfulness: `Mindfulness of ${focus}`
  };

  const baseTitle = titleTemplates[technique as keyof typeof titleTemplates] || `Meditation for ${focus}`;
  return `${baseTitle} (${duration} minutes)`;
}

function generateMeditationDescription(
  focus: string,
  technique: string,
  duration: number,
  principle?: string
): string {
  let description = `A ${duration}-minute guided ${technique} meditation designed to cultivate ${focus}. `;
  
  const techniqueDescriptions = {
    visualization: "Using the power of imagination and mental imagery, this practice helps you embody and integrate the quality of ",
    breathwork: "Through conscious breathing techniques, this meditation helps you develop deeper connection with ",
    mantra: "Using sacred sounds and repetition, this practice attunes you to the vibration of ",
    "body-scan": "Moving awareness through the body, this meditation helps you cultivate ",
    contemplation: "Through reflective inquiry and open awareness, this practice deepens your understanding of ",
    "loving-kindness": "Using heart-centered practices, this meditation helps you develop and radiate ",
    mindfulness: "Through present-moment awareness, this practice helps you embody "
  };
  
  description += (techniqueDescriptions[technique as keyof typeof techniqueDescriptions] || "This practice helps you cultivate ") + focus + ".";
  
  if (principle) {
    description += ` Integrates the hermetic principle of ${principle} for deeper spiritual understanding.`;
  }
  
  description += " Suitable for regular practice and spiritual development.";
  
  return description;
}