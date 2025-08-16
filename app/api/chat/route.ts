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
// TODO: Uncomment when tool integration is implemented
// import { hermeticTools, toolMetadata, canAccessTool } from "@/lib/ai/tools/definitions";
// import { analyzeWithGPT5ThinkingMode } from "@/lib/ai/gpt5-thinking-mode";
// import { generateTransformationProgram } from "@/lib/ai/transformation-program";

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
  enableTools: z.boolean().default(true),
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

    // Get user subscription tier for tool access
    // const userTier = await getUserSubscriptionTier(session.user.id);

    // Create AI SDK tools from hermetic tools
    // TODO: Fix tool integration in next iteration - currently disabled for build stability
    const availableTools = {}; // enableTools ? await createAvailableTools(userTier, session.user.id) : {};

    // Select model based on request
    const selectedModel = models[model];

    if (stream && aiConfig.streamingEnabled) {
      // Streaming response
      const result = await streamText({
        model: selectedModel,
        messages: allMessages,
        tools: availableTools,
        maxOutputTokens: aiConfig.maxTokens,
        temperature: aiConfig.temperature,
        onFinish: async ({ text, usage, toolCalls, toolResults }) => {
          // Save messages to database with hermetic context and tool usage
          await saveMessages(conversation!.id, messages, text, session.user.id, {
            emotionalState: userContext.emotionalState,
            relevantPrinciples: [], // TODO: Extract from localized builder
            spiritualLevel: userContext.spiritualLevel,
            challenges: userContext.currentChallenges,
            storyElements,
            toolCalls: toolCalls?.map(tc => ({
              toolName: tc.toolName,
              args: ((tc as Record<string, unknown>).args || (tc as Record<string, unknown>).parameters || {}) as Record<string, unknown>,
              result: (toolResults?.find(tr => tr.toolCallId === tc.toolCallId) as Record<string, unknown>)?.result
            }))
          });

          // Track tool usage if any tools were called
          // TODO: Uncomment when tool integration is fixed
          // if (toolCalls && toolCalls.length > 0) {
          //   await trackToolUsage(session.user.id, toolCalls);
          // }

          // Track message usage after successful message creation
          await trackUsageAfterSuccess(session.user.id, "MESSAGES", 2); // User message + assistant response

          // Log usage
          logger.info({
            conversationId: conversation!.id,
            usage: usage,
            model: model,
            toolCalls: toolCalls?.length || 0,
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
        tools: availableTools,
        maxOutputTokens: aiConfig.maxTokens,
        temperature: aiConfig.temperature,
      });

      // Save messages to database with hermetic context and tool usage
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
          storyElements,
          toolCalls: result.toolCalls?.map(tc => ({
            toolName: tc.toolName,
            args: ((tc as Record<string, unknown>).args || (tc as Record<string, unknown>).parameters || {}) as Record<string, unknown>,
            result: (result.toolResults?.find(tr => tr.toolCallId === tc.toolCallId) as Record<string, unknown>)?.result
          }))
        }
      );

      // Track tool usage if any tools were called
      // TODO: Uncomment when tool integration is fixed
      // if (result.toolCalls && result.toolCalls.length > 0) {
      //   await trackToolUsage(session.user.id, result.toolCalls);
      // }

      // Track message usage after successful message creation
      await trackUsageAfterSuccess(session.user.id, "MESSAGES", 2); // User message + assistant response

      logger.info({
        conversationId: conversation!.id,
        usage: result.usage,
        model: model,
        toolCalls: result.toolCalls?.length || 0,
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
    toolCalls?: {
      toolName: string;
      args: Record<string, unknown>;
      result: unknown;
    }[];
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
          },
          toolCalls: hermesContext.toolCalls ? {
            count: hermesContext.toolCalls.length,
            tools: hermesContext.toolCalls.map(tc => tc.toolName),
            executionTime: Date.now()
          } : null
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

/* TODO: Uncomment when needed
async function getUserSubscriptionTier(userId: string): Promise<"FREE" | "BASIC" | "PREMIUM" | "MASTER"> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: {
            status: {
              in: ["ACTIVE", "TRIAL"]
            }
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        }
      }
    });
    
    const activeSubscription = user?.subscriptions[0];
    if (!activeSubscription) {
      return "FREE";
    }
    
    // Map subscription plans to tier names
    switch (activeSubscription.plan) {
      case "FREE_TRIAL":
        return "BASIC";
      case "SEEKER":
        return "BASIC";  
      case "ADEPT":
        return "PREMIUM";
      case "MASTER":
        return "MASTER";
      default:
        return "FREE";
    }
  } catch (error) {
    logger.error({ error, userId }, "Failed to get user subscription tier");
    return "FREE";
  }
} */

// TODO: Uncomment and fix when implementing tool integration
/* async function createAvailableTools(userTier: "FREE" | "BASIC" | "PREMIUM" | "MASTER", userId: string) {
  const tools: Record<string, unknown> = {};

  // Create tools based on user access level
  for (const [toolName, toolFunction] of Object.entries(hermeticTools)) {
    if (canAccessTool(toolName, userTier)) {
      try {
        // Create tool definition based on tool name
        tools[toolName] = await createToolDefinition(toolName, toolFunction, userId);
      } catch (error) {
        logger.error({ error, toolName }, "Failed to create tool definition");
      }
    }
  }

  // Add advanced tools for higher tiers
  if (userTier === "MASTER" || userTier === "PREMIUM") {
    tools.thinkingModeAnalysis = tool({
      description: "Perform deep thinking mode analysis on complex questions",
      parameters: z.object({
        query: z.string().min(10).describe("The complex question or scenario to analyze"),
        analysisType: z.enum(["problem-solving", "decision-making", "philosophical", "spiritual", "strategic"]).describe("Type of analysis to perform"),
        depth: z.enum(["surface", "moderate", "deep", "profound"]).describe("Analysis depth level")
      }),
      execute: async ({ query, analysisType, depth }) => {
        try {
          const analysis = await analyzeWithGPT5ThinkingMode({
            query,
            analysisType,
            depth,
            includeVerification: true,
            culturalContext: "hermetic"
          });
          
          // Track tool usage
          await logToolUsage(userId, "thinkingModeAnalysis", { query, analysisType, depth });
          
          return analysis;
        } catch (error) {
          logger.error({ error, query }, "Thinking mode analysis failed");
          throw new Error("Failed to perform thinking analysis");
        }
      }
    });
  }

  if (userTier === "MASTER") {
    tools.transformationProgram = tool({
      description: "Generate personalized spiritual transformation program",
      parameters: z.object({
        goals: z.array(z.string()).min(1).describe("Transformation goals"),
        currentLevel: z.enum(["beginner", "intermediate", "advanced", "master"]).describe("Current spiritual level"),
        focusAreas: z.array(z.string()).describe("Areas to focus on (e.g., meditation, shadow work, energy healing)"),
        timeframe: z.string().describe("Desired program duration"),
        intensity: z.enum(["gentle", "moderate", "intensive", "profound"]).describe("Program intensity level")
      }),
      execute: async ({ goals, currentLevel, focusAreas, timeframe, intensity }) => {
        try {
          const program = await generateTransformationProgram({
            goals,
            currentLevel,
            focusAreas,
            timeframe,
            intensity,
            includeSupport: true,
            personalized: true
          });
          
          // Track tool usage
          await logToolUsage(userId, "transformationProgram", { goals, currentLevel, focusAreas, timeframe, intensity });
          
          return program;
        } catch (error) {
          logger.error({ error, goals }, "Transformation program generation failed");
          throw new Error("Failed to generate transformation program");
        }
      }
    });
  }

  return tools;
} */

/* TODO: Fix and uncomment for tool integration
async function createToolDefinition(toolName: string, toolFunction: (...args: unknown[]) => Promise<unknown>, userId: string) {
  const toolInfo = toolMetadata[toolName as keyof typeof toolMetadata];
  
  // Get schema for this tool from definitions
  const toolSchema = getToolSchema(toolName);
  
  return tool({
    description: toolInfo.description,
    parameters: toolSchema,
    execute: async (params) => {
      try {
        const startTime = Date.now();
        const result = await toolFunction(params);
        const executionTime = Date.now() - startTime;
        
        // Log tool usage
        await logToolUsage(userId, toolName, params, executionTime);
        
        return result;
      } catch (error) {
        logger.error({ error, toolName, params }, "Tool execution failed");
        throw new Error(`Failed to execute ${toolName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  });
}

function getToolSchema(toolName: string): z.ZodSchema<Record<string, unknown>> {
  // Convert tool schema definitions to Zod schemas
  switch (toolName) {
    case 'generateRitual':
      return z.object({
        purpose: z.string().min(5).describe("The purpose or intention for the ritual"),
        principle: z.enum(["mentalism", "correspondence", "vibration", "polarity", "rhythm", "causeEffect", "gender"]).describe("Hermetic principle to focus on"),
        duration: z.number().min(5).max(120).describe("Ritual duration in minutes"),
        elements: z.array(z.string()).describe("Physical elements to include"),
        timeOfDay: z.enum(["dawn", "morning", "noon", "afternoon", "evening", "night", "midnight"]).optional().describe("Preferred time of day"),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).describe("Ritual complexity level")
      });
    
    case 'interpretDream':
      return z.object({
        dreamContent: z.string().min(20).describe("Description of the dream"),
        emotions: z.array(z.string()).describe("Emotions felt during the dream"),
        recurringElements: z.array(z.string()).optional().describe("Recurring symbols or themes"),
        dreamType: z.enum(["prophetic", "healing", "guidance", "shadow", "lucid", "nightmare", "ordinary"]).describe("Type of dream"),
        personalSymbols: z.array(z.string()).optional().describe("Personal symbols or meanings")
      });
    
    case 'createMantra':
      return z.object({
        intention: z.string().min(3).describe("The intention for the mantra"),
        principle: z.enum(["mentalism", "correspondence", "vibration", "polarity", "rhythm", "causeEffect", "gender"]).describe("Hermetic principle to focus on"),
        language: z.enum(["en", "cs", "es", "fr", "de", "it", "pt"]).describe("Language for the mantra"),
        style: z.enum(["traditional", "modern", "poetic", "simple", "mystical"]).describe("Mantra style"),
        length: z.enum(["short", "medium", "long"]).describe("Mantra length")
      });
    
    case 'analyzeChallenge':
      return z.object({
        challenge: z.string().min(10).describe("Description of the life challenge"),
        context: z.string().describe("Surrounding context and circumstances"),
        desiredOutcome: z.string().describe("What you hope to achieve"),
        principlesApplied: z.array(z.string()).optional().describe("Hermetic principles to consider"),
        timeframe: z.string().optional().describe("Timeframe for resolution"),
        previousAttempts: z.string().optional().describe("Previous attempts at solving this")
      });
    
    case 'generateMeditation':
      return z.object({
        focus: z.string().min(3).describe("Focus or theme for meditation"),
        duration: z.number().min(5).max(60).describe("Meditation duration in minutes"),
        technique: z.enum(["visualization", "breathwork", "mantra", "body-scan", "contemplation", "loving-kindness", "mindfulness"]).describe("Meditation technique"),
        background: z.enum(["silence", "nature", "music", "bells", "chanting"]).optional().describe("Background sounds"),
        level: z.enum(["beginner", "intermediate", "advanced"]).describe("Experience level"),
        principle: z.string().optional().describe("Hermetic principle to incorporate")
      });
    
    case 'calculateNumerology':
      return z.object({
        input: z.string().min(1).describe("Text or numbers to analyze"),
        type: z.enum(["name", "birthdate", "event", "phrase", "question"]).describe("Type of numerology analysis"),
        system: z.enum(["pythagorean", "chaldean", "hermetic", "kabbalistic"]).describe("Numerology system to use"),
        includeReduction: z.boolean().describe("Include number reduction steps"),
        culturalContext: z.string().optional().describe("Cultural context to consider")
      });
    
    case 'drawTarot':
      return z.object({
        spread: z.enum(["single", "three-card", "celtic-cross", "hermetic-seven", "life-path", "relationship"]).describe("Tarot spread type"),
        question: z.string().min(5).describe("Question or area of inquiry"),
        deck: z.enum(["rider-waite", "thoth", "hermetic", "marseille"]).describe("Tarot deck to use"),
        focusArea: z.enum(["love", "career", "spiritual", "health", "general", "shadow-work"]).optional().describe("Area of focus"),
        timeframe: z.enum(["past", "present", "future", "all"]).describe("Time period to explore")
      });
    
    case 'createSigil':
      return z.object({
        intention: z.string().min(5).describe("Clear intention for the sigil"),
        method: z.enum(["letter", "planetary", "geometric", "intuitive", "chaos"]).describe("Sigil creation method"),
        includeActivation: z.boolean().describe("Include activation instructions"),
        complexity: z.enum(["simple", "moderate", "complex"]).describe("Sigil complexity level"),
        elements: z.array(z.enum(["fire", "water", "air", "earth"])).optional().describe("Elemental correspondences"),
        timeframe: z.string().optional().describe("When to activate and use")
      });
    
    default:
      return z.object({});
  }
}

async function logToolUsage(userId: string, toolName: string, params: Record<string, unknown>, executionTime?: number) {
  try {
    // Find user's active subscription to track usage
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: {
            status: {
              in: ["ACTIVE", "TRIAL"]
            }
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        }
      }
    });

    const activeSubscription = user?.subscriptions[0];
    if (activeSubscription) {
      // Track as API_CALLS usage metric
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.usageRecord.upsert({
        where: {
          subscriptionId_metric_date: {
            subscriptionId: activeSubscription.id,
            metric: "API_CALLS",
            date: today
          }
        },
        update: {
          count: {
            increment: 1
          },
          metadata: {
            tools: {
              [toolName]: ((activeSubscription.metadata as Record<string, unknown>)?.tools as Record<string, number>)?.[toolName] || 0 + 1
            }
          }
        },
        create: {
          subscriptionId: activeSubscription.id,
          metric: "API_CALLS", 
          count: 1,
          date: today,
          metadata: {
            toolName,
            executionTime: executionTime || 0,
            params: Object.keys(params || {}).length // Store param count, not actual data for privacy
          }
        }
      });
    }

    // Log for analytics
    logger.info({
      userId,
      toolName, 
      executionTime: executionTime || 0,
      paramsCount: Object.keys(params || {}).length
    }, "Tool usage tracked");

  } catch (error) {
    logger.error({ error, userId, toolName }, "Failed to log tool usage");
  }
}

async function trackToolUsage(userId: string, toolCalls: Array<{ toolName: string; [key: string]: unknown }>) {
  try {
    const usagePromises = toolCalls.map(tc => 
      logToolUsage(userId, tc.toolName, ((tc as Record<string, unknown>).args || (tc as Record<string, unknown>).parameters || ({} as Record<string, unknown>)) as Record<string, unknown>)
    );
    
    await Promise.all(usagePromises);
    
    // Track usage quotas for paid features
    const premiumTools = toolCalls.filter(tc => {
      const metadata = toolMetadata[tc.toolName as keyof typeof toolMetadata];
      return metadata?.tier === "premium" || metadata?.tier === "master";
    });
    
    if (premiumTools.length > 0) {
      await trackUsageAfterSuccess(userId, "TOOL_CALLS", premiumTools.length);
    }
  } catch (error) {
    logger.error({ error, userId, toolCalls: toolCalls.length }, "Failed to track tool usage");
  }
} */