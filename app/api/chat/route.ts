import { streamText, generateText, CoreMessage } from "ai";
import { models, aiConfig } from "@/lib/ai/provider";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import logger from "@/lib/logger";
import { z } from "zod";
import { NextRequest } from "next/server";

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
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { messages, conversationId, model, stream } =
      requestSchema.parse(body);

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
          language: session.user.preferredLanguage || "en",
        },
      });
    }

    // Check user's subscription limits (TODO: Implement subscription limit checking)
    // const subscription = await prisma.subscription.findFirst({
    //   where: {
    //     userId: session.user.id,
    //     status: "ACTIVE",
    //   },
    //   include: {
    //     usageRecords: {
    //       where: {
    //         date: new Date().toISOString().split("T")[0],
    //         metric: "CONVERSATIONS",
    //       },
    //     },
    //   },
    // });

    // Prepare system message (will be enhanced in Phase 4)
    const systemMessage: CoreMessage = {
      role: "system",
      content: `You are Hermes Trismegistus, the legendary sage of ancient wisdom.
        Speak with authority yet compassion, offering practical wisdom for modern seekers.
        You embody the hermetic principles and guide souls on their spiritual journey.`,
    };

    const allMessages = [systemMessage, ...messages];

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
          // Save messages to database
          await saveMessages(conversation!.id, messages, text, session.user.id);

          // Log usage
          logger.info({
            conversationId: conversation!.id,
            usage: usage,
            model: model,
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

      // Save messages to database
      await saveMessages(
        conversation!.id,
        messages,
        result.text,
        session.user.id
      );

      logger.info({
        conversationId: conversation!.id,
        usage: result.usage,
        model: model,
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

async function saveMessages(
  conversationId: string,
  userMessages: CoreMessage[],
  assistantResponse: string,
  userId: string
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
        },
      });
    }

    // Save assistant response
    await prisma.message.create({
      data: {
        conversationId,
        role: "ASSISTANT",
        content: assistantResponse,
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

    // Get user's active subscription for usage tracking
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        status: "ACTIVE",
      },
    });

    if (activeSubscription) {
      // Update usage records
      await prisma.usageRecord.upsert({
        where: {
          subscriptionId_metric_date: {
            subscriptionId: activeSubscription.id,
            metric: "MESSAGES",
            date: new Date().toISOString().split("T")[0],
          },
        },
        update: {
          count: { increment: 2 }, // User message + assistant response
        },
        create: {
          subscriptionId: activeSubscription.id,
          metric: "MESSAGES",
          count: 2,
          date: new Date().toISOString().split("T")[0],
        },
      });
    }
  } catch (error) {
    logger.error(error, "Failed to save messages:");
    throw error;
  }
}