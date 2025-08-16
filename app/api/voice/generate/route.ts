import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import logger from "@/lib/logger";
import { validateUsageAndFeature, trackUsageAfterSuccess } from "@/lib/middleware/usage-check";
import { VoiceServiceFactory } from "@/lib/ai/voice/voice-generator";
import { VoiceConfig, EmotionalVoiceContext } from "@/lib/ai/voice/voice-interface";
import { prisma } from "@/lib/db/client";

const voiceRequestSchema = z.object({
  text: z.string().min(1).max(4000), // OpenAI limit
  config: z.object({
    provider: z.enum(["openai"]).default("openai"),
    voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]).default("alloy"),
    speed: z.number().min(0.25).max(4.0).default(1.0),
    pitch: z.number().optional(),
    stability: z.number().optional(),
    clarity: z.number().optional(),
    language: z.string().default("en"),
    outputFormat: z.enum(["mp3", "wav", "ogg", "aac"]).default("mp3")
  }),
  conversationId: z.string().optional(),
  emotionalContext: z.object({
    mood: z.enum(["calm", "energetic", "mystical", "compassionate", "serious", "playful"]).default("calm"),
    intensity: z.number().min(0.0).max(1.0).default(0.5),
    spiritualTone: z.enum(["ancient", "modern", "ceremonial", "conversational", "profound"]).default("conversational"),
    breathingPauses: z.boolean().default(true),
    accentuation: z.array(z.string()).default([])
  }).optional(),
  persona: z.enum(["ancient_sage", "mystical_guide", "scholarly_hermit"]).optional(),
  saveAudio: z.boolean().default(true)
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" }, 
      { status: 401 }
    );
  }

  try {

    // Parse request body
    const body = await request.json();
    const {
      text,
      config,
      conversationId,
      emotionalContext,
      persona,
      saveAudio
    } = voiceRequestSchema.parse(body);

    // Check usage limits and feature access
    const usageCheck = await validateUsageAndFeature(
      session.user.id,
      "MESSAGES"
    );
    if (usageCheck) {
      return usageCheck;
    }

    // Get user's spiritual context for voice enhancement
    const userContext = await getUserSpiritualContext(session.user.id);

    // Create voice service
    const voiceService = VoiceServiceFactory.createService(config.provider);

    // Apply persona-specific voice configuration
    const enhancedConfig = applyPersonaToConfig(config, persona, userContext);

    // Prepare voice request
    const voiceRequest = {
      text,
      config: enhancedConfig,
      userId: session.user.id,
      conversationId,
      emotionalContext: enhancedEmotionalContext(emotionalContext, userContext)
    };

    // Generate speech
    const voiceResponse = await voiceService.generateSpeech(voiceRequest);

    // Save voice generation record if requested
    if (saveAudio) {
      await saveVoiceGeneration({
        userId: session.user.id,
        conversationId,
        text,
        config: enhancedConfig,
        emotionalContext: voiceRequest.emotionalContext,
        metadata: voiceResponse.metadata,
        audioUrl: voiceResponse.audioUrl,
        duration: voiceResponse.duration
      });
    }

    // Track usage
    await trackUsageAfterSuccess(
      session.user.id,
      "MESSAGES",
      1 // Track as 1 message
    );

    // Log successful generation
    logger.info({
      userId: session.user.id,
      conversationId,
      textLength: text.length,
      voice: config.voice,
      provider: config.provider,
      duration: voiceResponse.duration,
      processingTime: voiceResponse.metadata.processingTime
    }, "Voice generation completed");

    // Return response (without audio buffer for size optimization)
    return NextResponse.json({
      success: true,
      audioUrl: voiceResponse.audioUrl,
      duration: voiceResponse.duration,
      format: voiceResponse.format,
      metadata: {
        ...voiceResponse.metadata,
        // Remove potentially large arrays for API response
        emotionalAdjustments: voiceResponse.metadata.emotionalAdjustments.length,
        hermeticEnhancements: voiceResponse.metadata.hermeticEnhancements.length
      },
      characterCount: voiceResponse.metadata.characterCount,
      processingTime: voiceResponse.metadata.processingTime
    });

  } catch (error) {
    logger.error({ error, userId: session.user.id }, "Voice generation failed");

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid request parameters",
          details: error.issues 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Voice generation failed" },
      { status: 500 }
    );
  }
}

// Get available voices for a provider
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" }, 
      { status: 401 }
    );
  }

  try {

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider") || "openai";
    const language = searchParams.get("language") || "en";

    const voiceService = VoiceServiceFactory.createService(provider);
    const voices = await voiceService.getAvailableVoices(provider, language);

    // Add persona recommendations
    const voicesWithPersonas = voices.map(voice => ({
      ...voice,
      recommendedPersonas: getRecommendedPersonas(voice),
      spiritualAlignment: getSpiritualAlignment(voice)
    }));

    // Get provider capabilities
    const capabilities = VoiceServiceFactory.getProviderCapabilities(provider);

    return NextResponse.json({
      provider,
      language,
      voices: voicesWithPersonas,
      capabilities,
      supportedProviders: VoiceServiceFactory.getSupportedProviders()
    });

  } catch (error) {
    logger.error({ error }, "Failed to get available voices");
    return NextResponse.json(
      { error: "Failed to get available voices" },
      { status: 500 }
    );
  }
}

// Helper functions
async function getUserSpiritualContext(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        spiritualProfile: true,
        preferences: true
      }
    });

    return {
      spiritualLevel: user?.spiritualProfile?.currentLevel || "SEEKER",
      principlesStudied: user?.spiritualProfile?.principlesStudied || [],
      transformationScore: user?.spiritualProfile?.transformationScore || 0,
      preferredLanguage: user?.preferredLanguage || "en",
      aiVerbosity: user?.preferences?.aiVerbosity || "BALANCED"
    };
  } catch (error) {
    logger.error({ error, userId }, "Failed to get user spiritual context");
    return {
      spiritualLevel: "SEEKER",
      principlesStudied: [],
      transformationScore: 0,
      preferredLanguage: "en",
      aiVerbosity: "BALANCED"
    };
  }
}

function applyPersonaToConfig(
  baseConfig: VoiceConfig,
  persona?: string,
  userContext?: {
    spiritualLevel?: string;
    principlesStudied?: string[];
    transformationScore?: number;
    preferredLanguage?: string;
    aiVerbosity?: string;
  }
): VoiceConfig {
  if (!persona) {
    return baseConfig;
  }

  // Persona-specific voice mappings
  const personaVoiceMap: Record<string, string> = {
    "ancient_sage": "onyx",      // Deep, authoritative
    "mystical_guide": "nova",    // Ethereal, feminine
    "scholarly_hermit": "echo"   // Clear, precise
  };

  // Persona-specific speed adjustments
  const personaSpeedMap: Record<string, number> = {
    "ancient_sage": 0.9,         // Slower, more deliberate
    "mystical_guide": 1.0,       // Natural pace
    "scholarly_hermit": 1.1      // Slightly faster, more precise
  };

  const enhancedConfig = { ...baseConfig };

  // Apply persona voice if not explicitly set
  if (persona in personaVoiceMap) {
    enhancedConfig.voice = personaVoiceMap[persona];
    enhancedConfig.speed = personaSpeedMap[persona] * baseConfig.speed;
  }

  // Adjust for user spiritual level
  if (userContext?.spiritualLevel === "MASTER") {
    enhancedConfig.speed *= 0.95; // Slightly slower for masters
  } else if (userContext?.spiritualLevel === "SEEKER") {
    enhancedConfig.speed *= 1.05; // Slightly faster for seekers
  }

  return enhancedConfig;
}

function enhancedEmotionalContext(
  baseContext?: EmotionalVoiceContext,
  userContext?: {
    spiritualLevel?: string;
    principlesStudied?: string[];
    transformationScore?: number;
    preferredLanguage?: string;
    aiVerbosity?: string;
  }
): EmotionalVoiceContext {
  const defaultContext: EmotionalVoiceContext = {
    mood: "calm",
    intensity: 0.5,
    spiritualTone: "conversational",
    breathingPauses: true,
    accentuation: []
  };

  const context = { ...defaultContext, ...baseContext };

  // Adjust based on user's spiritual level
  if (userContext?.spiritualLevel === "MASTER") {
    context.spiritualTone = "profound";
    context.intensity = Math.min(1.0, context.intensity + 0.1);
  } else if (userContext?.spiritualLevel === "ADEPT") {
    context.spiritualTone = "ceremonial";
  } else if (userContext?.spiritualLevel === "SEEKER") {
    context.spiritualTone = "modern";
  }

  // Adjust for transformation score
  if (userContext?.transformationScore && userContext.transformationScore > 0.7) {
    context.mood = "mystical";
    context.breathingPauses = true;
  }

  return context;
}

async function saveVoiceGeneration(data: {
  userId: string;
  conversationId?: string;
  text: string;
  config: VoiceConfig;
  emotionalContext?: EmotionalVoiceContext;
  metadata: {
    provider: string;
    voice: string;
    language: string;
    characterCount: number;
    processingTime: number;
    emotionalAdjustments: unknown[];
    hermeticEnhancements: unknown[];
  };
  audioUrl: string;
  duration: number;
}) {
  try {
    // In production, you would save this to a proper database table
    // For now, we'll use the existing message/conversation system
    
    if (data.conversationId) {
      // Add a voice generation record to the conversation
      await prisma.message.create({
        data: {
          conversationId: data.conversationId,
          role: "ASSISTANT",
          content: `[Voice Generated: ${data.text.substring(0, 100)}...]`,
          metadata: {
            voiceGeneration: {
              originalText: data.text,
              audioUrl: data.audioUrl,
              duration: data.duration,
              characterCount: data.text.length,
              provider: data.config.provider,
              voice: data.config.voice,
              processingTime: data.metadata.processingTime,
              speed: data.config.speed,
              language: data.config.language,
              outputFormat: data.config.outputFormat
            }
          }
        }
      });
    }

    logger.info({
      userId: data.userId,
      conversationId: data.conversationId,
      textLength: data.text.length,
      duration: data.duration
    }, "Voice generation saved");

  } catch (error) {
    logger.error({ error, userId: data.userId }, "Failed to save voice generation");
  }
}

function getRecommendedPersonas(voice: { id: string }): string[] {
  const voicePersonaMap: Record<string, string[]> = {
    "onyx": ["ancient_sage"],
    "nova": ["mystical_guide"],
    "echo": ["scholarly_hermit"],
    "alloy": ["ancient_sage", "scholarly_hermit"],
    "shimmer": ["mystical_guide"],
    "fable": ["mystical_guide", "scholarly_hermit"]
  };

  return voicePersonaMap[voice.id] || [];
}

function getSpiritualAlignment(voice: { id: string }): string[] {
  const voiceAlignmentMap: Record<string, string[]> = {
    "onyx": ["mentalism", "correspondence", "polarity"],
    "nova": ["vibration", "rhythm", "gender"],
    "echo": ["mentalism", "correspondence", "causeEffect"],
    "alloy": ["mentalism", "correspondence"],
    "shimmer": ["rhythm", "gender", "vibration"],
    "fable": ["vibration", "rhythm", "causeEffect"]
  };

  return voiceAlignmentMap[voice.id] || [];
}