import { streamText, generateText, CoreMessage } from "ai";
import { models, aiConfig } from "@/lib/ai/provider";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import logger from "@/lib/logger";
import { z } from "zod";
import { NextRequest } from "next/server";
import { LocalizedHermesResponseBuilder } from "@/lib/ai/i18n/localized-response";
import { EmotionDetectionService } from "@/lib/ai/analysis/detection";
import { StorytellingElementsService } from "@/lib/ai/narrative/storytelling";
import { UserContext, EmotionalState, SpiritualLevel, LifeChallenge } from "@/lib/ai/types";
import { validateUsageAndFeature, trackUsageAfterSuccess } from "@/lib/middleware/usage-check";
import LanguageDetector from "@/lib/i18n/detection";
import LanguageSwitcher from "@/lib/i18n/switcher";
import { HermeticContentLocalizer } from "@/lib/i18n/hermetic-content";

const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
  conversationId: z.string().optional(),
  model: z.enum(["primary", "fallback", "thinking"]).default("primary"),
  stream: z.boolean().default(true),
  forceLocale: z.string().optional(),
  detectLanguage: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { messages, conversationId, model, stream, forceLocale, detectLanguage } =
      requestSchema.parse(body);

    // Check usage limits and feature access
    const usageCheck = await validateUsageAndFeature(
      session.user.id,
      "MESSAGES",
      model === "thinking" ? "thinkingMode" : undefined
    );
    if (usageCheck) {
      return usageCheck;
    }

    // Language detection and switching
    const currentLocale = await LanguageSwitcher.getLocale(session.user.id, prisma);
    let detectedLocale = currentLocale;

    if (detectLanguage && !forceLocale) {
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage?.role === 'user') {
        try {
          const detection = await LanguageDetector.detectWithHermeticContext(
            lastUserMessage.content,
            { model: 'fast', contextualBoost: true }
          );

          // Only switch if detection is confident and different from current
          if (detection.confidence > 0.7 && detection.detectedLanguage !== currentLocale) {
            const switchResult = await LanguageSwitcher.setLocale(
              detection.detectedLanguage,
              session.user.id,
              prisma,
              { updateUserPreference: true }
            );

            if (switchResult.success) {
              detectedLocale = detection.detectedLanguage;
              logger.info({
                userId: session.user.id,
                fromLocale: currentLocale,
                toLocale: detectedLocale,
                confidence: detection.confidence,
                reasoning: detection.reasoning
              }, "Language switched based on AI detection");
            }
          }
        } catch (error) {
          logger.warn({ error }, "Language detection failed, continuing with current locale");
        }
      }
    }

    const finalLocale = forceLocale || detectedLocale;

    // Get or create conversation
    let conversation = conversationId
      ? await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            userId: session.user.id,
          },
        })
      : null;

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
          title: messages[0]?.content.substring(0, 100) || "New Conversation",
          language: finalLocale,
        },
      });
    }


    // Build localized Hermes persona context
    const userContext = await buildUserContext(session.user.id, conversation.id, messages);
    
    // Use localized response builder for multilingual support
    const localizedBuilder = new LocalizedHermesResponseBuilder({
      locale: finalLocale,
      culturalContext: `${finalLocale.toUpperCase()} cultural context`,
      emotionalState: userContext.emotionalState?.primary,
      spiritualLevel: userContext.spiritualLevel?.level.toLowerCase() || 'seeker',
      currentChallenges: userContext.currentChallenges?.map(c => c.description) || [],
      conversationDepth: messages.length,
      isFirstTime: !userContext.conversationHistory || userContext.conversationHistory.length === 0,
      userPreferences: {
        formality: userContext.preferences?.formality === 'casual' ? 'informal' : 'formal',
        depth: userContext.preferences?.practiceLevel === 'beginner' ? 'simple' :
              userContext.preferences?.practiceLevel === 'advanced' ? 'advanced' : 'intermediate',
        includeLocalWisdom: true,
        includeCulturalReferences: true
      }
    });

    const localizedSystemPrompt = localizedBuilder.buildSystemPrompt();
    
    // Note: systemMessage created but enhanced version used instead

    // Add storytelling elements to the conversation context
    const storytelling = StorytellingElementsService.getInstance();
    const storyElements = storytelling.generateStoryElements({
      emotionalState: userContext.emotionalState,
      spiritualLevel: userContext.spiritualLevel,
      challenges: userContext.currentChallenges,
      conversationTone: userContext.emotionalState?.intensity && userContext.emotionalState.intensity > 0.6 ? 'supportive' : 'direct'
    });

    // Get localized hermetic content for cultural enrichment
    const hermeticContent = HermeticContentLocalizer.getContent(finalLocale);
    const randomWisdom = HermeticContentLocalizer.getRandomWisdomQuote(finalLocale);

    // Enhance the system message with localized storytelling context
    const enhancedSystemMessage: CoreMessage = {
      role: "system",
      content: `${localizedSystemPrompt}

## Current Sacred Space (${finalLocale.toUpperCase()} Context):
${storyElements.narrative}

## Available Cultural Elements:
- Props: ${storyElements.props.slice(0, 3).join(', ')}
- Atmosphere: ${storyElements.atmosphere}
- Symbolism: ${storyElements.symbolism.slice(0, 2).join(' and ')}
${randomWisdom ? `- Cultural Wisdom: "${randomWisdom}"` : ''}

## Localized Greeting Context:
Use culturally appropriate greetings and expressions in ${LanguageSwitcher.getLanguageName(finalLocale)}. 
${userContext.conversationHistory?.length === 0 ? 
  `Start with: "${hermeticContent.culturalGreetings.first}"` :
  `Continue with: "${hermeticContent.culturalGreetings.returning}"`
}

Use these elements naturally in your response to create an immersive, culturally adapted mystical experience while maintaining the focus on practical wisdom and philosophical accuracy.`,
    };

    const allMessages = [enhancedSystemMessage, ...messages];

    // Select model based on request
    const selectedModel = models[model];

    if (stream && aiConfig.streamingEnabled) {
      // Streaming response
      const result = await streamText({
        model: selectedModel,
        messages: allMessages,
        maxOutputTokens: aiConfig.maxTokens,
        temperature: aiConfig.temperature,
        onFinish: async ({ text, usage }) => {
          // Save messages to database with hermetic context
          await saveMessages(conversation!.id, messages, text, session.user.id, {
            emotionalState: userContext.emotionalState,
            relevantPrinciples: [], // TODO: Extract from localized builder
            spiritualLevel: userContext.spiritualLevel,
            challenges: userContext.currentChallenges,
            storyElements
          });

          // Track usage after successful message creation
          await trackUsageAfterSuccess(session.user.id, "MESSAGES", 2); // User message + assistant response

          // Log usage
          logger.info({
            conversationId: conversation!.id,
            usage: usage,
            model: model,
            hermesContext: {
              emotionalState: userContext.emotionalState?.primary,
              spiritualLevel: userContext.spiritualLevel.level,
              challengeCount: userContext.currentChallenges.length
            }
          }, "AI streaming completed");
        },
      });

      return result.toTextStreamResponse({
        headers: {
          "X-Conversation-Id": conversation.id,
        },
      });
    } else {
      // Non-streaming response
      const result = await generateText({
        model: selectedModel,
        messages: allMessages,
        maxOutputTokens: aiConfig.maxTokens,
        temperature: aiConfig.temperature,
      });

      // Save messages to database with hermetic context
      await saveMessages(
        conversation!.id,
        messages,
        result.text,
        session.user.id,
        {
          emotionalState: userContext.emotionalState,
          relevantPrinciples: [], // TODO: Extract from localized builder
          spiritualLevel: userContext.spiritualLevel,
          challenges: userContext.currentChallenges,
          storyElements
        }
      );

      // Track usage after successful message creation
      await trackUsageAfterSuccess(session.user.id, "MESSAGES", 2); // User message + assistant response

      logger.info({
        conversationId: conversation!.id,
        usage: result.usage,
        model: model,
        hermesContext: {
          emotionalState: userContext.emotionalState?.primary,
          spiritualLevel: userContext.spiritualLevel.level,
          challengeCount: userContext.currentChallenges.length
        }
      }, "AI generation completed");

      return Response.json({
        content: result.text,
        conversationId: conversation!.id,
      });
    }
  } catch (error) {
    logger.error(error, "Chat API error:");

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}

async function buildUserContext(
  userId: string,
  conversationId: string,
  messages: CoreMessage[]
): Promise<UserContext> {
  const emotionDetection = EmotionDetectionService.getInstance();
  
  // Get conversation history
  const conversationHistory = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 20, // Last 20 messages for context
  });

  const formattedHistory = conversationHistory.map(msg => ({
    role: msg.role.toLowerCase() as 'user' | 'assistant',
    content: msg.content,
    timestamp: msg.createdAt,
    hermeticContext: msg.hermeticPrinciples ? {
      principles: msg.hermeticPrinciples,
      insights: [] // TODO: Extract insights from metadata
    } : undefined
  }));

  // Get user preferences
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      preferredLanguage: true,
    }
  });

  // Analyze current message
  const currentMessage = messages[messages.length - 1];
  const currentMessageText = typeof currentMessage?.content === 'string' 
    ? currentMessage.content 
    : JSON.stringify(currentMessage?.content || '');

  const emotionalState = emotionDetection.analyzeEmotionalState(
    currentMessageText,
    formattedHistory.map(h => h.content)
  );

  const spiritualLevel = emotionDetection.assessSpiritualLevel(
    currentMessageText,
    formattedHistory.map(h => h.content)
  );

  const challenges = emotionDetection.detectLifeChallenges(currentMessageText);

  return {
    userId,
    emotionalState,
    spiritualLevel,
    currentChallenges: challenges,
    conversationHistory: formattedHistory,
    preferences: {
      language: user?.preferredLanguage || 'en',
      teachingStyle: 'mixed', // TODO: Get from user preferences
      formality: 'formal', // TODO: Get from user preferences
      practiceLevel: spiritualLevel.level === 'SEEKER' ? 'beginner' :
                     spiritualLevel.level === 'STUDENT' ? 'intermediate' : 'advanced'
    }
  };
}

async function saveMessages(
  conversationId: string,
  userMessages: CoreMessage[],
  assistantResponse: string,
  userId: string,
  hermesContext?: {
    emotionalState?: EmotionalState;
    relevantPrinciples: string[];
    spiritualLevel: SpiritualLevel;
    challenges: LifeChallenge[];
    storyElements: {
      setting: string;
      props: string[];
      atmosphere: string;
      symbolism: string[];
      narrative: string;
    };
  }
) {
  try {
    // Save user message
    const lastUserMessage = userMessages[userMessages.length - 1];
    if (lastUserMessage && lastUserMessage.role === "user") {
      await prisma.message.create({
        data: {
          conversationId,
          role: "USER",
          content: typeof lastUserMessage.content === 'string' 
            ? lastUserMessage.content 
            : JSON.stringify(lastUserMessage.content),
          emotionalState: hermesContext?.emotionalState?.primary || null,
          hermeticPrinciples: hermesContext?.relevantPrinciples || [],
          metadata: hermesContext ? {
            spiritualLevel: {
              level: hermesContext.spiritualLevel.level,
              score: hermesContext.spiritualLevel.score,
              progression: hermesContext.spiritualLevel.progression
            },
            challenges: hermesContext.challenges.map(c => ({
              type: c.type,
              description: c.description,
              severity: c.severity,
              hermeticApproach: c.hermeticApproach
            })),
            emotionalContext: hermesContext.emotionalState ? {
              primary: hermesContext.emotionalState.primary,
              secondary: hermesContext.emotionalState.secondary,
              intensity: hermesContext.emotionalState.intensity,
              context: hermesContext.emotionalState.context
            } : null
          } : undefined
        },
      });
    }

    // Save assistant response with hermetic context
    await prisma.message.create({
      data: {
        conversationId,
        role: "ASSISTANT",
        content: assistantResponse,
        hermeticPrinciples: hermesContext?.relevantPrinciples || [],
        metadata: hermesContext ? {
          storyElements: {
            setting: hermesContext.storyElements.setting,
            props: hermesContext.storyElements.props,
            atmosphere: hermesContext.storyElements.atmosphere,
            symbolism: hermesContext.storyElements.symbolism,
            narrative: hermesContext.storyElements.narrative
          },
          personaResponse: {
            spiritualLevelAdaptation: hermesContext.spiritualLevel.level,
            emotionalGuidance: hermesContext.emotionalState?.primary || null,
            challengesAddressed: hermesContext.challenges.map(c => c.type)
          }
        } : undefined
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Usage tracking is now handled by the middleware after successful message creation
  } catch (error) {
    logger.error(error, "Failed to save messages:");
    throw error;
  }
}