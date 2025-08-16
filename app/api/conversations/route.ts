import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { z } from "zod";
import logger from "@/lib/logger";
import { ConversationStatus } from "@/lib/generated/prisma";

// GET: List user's conversations
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status") || "ACTIVE";

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: session.user.id,
        status: status as ConversationStatus,
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { lastMessageAt: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.conversation.count({
      where: {
        userId: session.user.id,
        status: status as ConversationStatus,
      },
    });

    return NextResponse.json({
      conversations,
      total,
      limit,
      offset,
    });
  } catch (error) {
    logger.error(error, "Failed to fetch conversations:");
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST: Create new conversation
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const createSchema = z.object({
      title: z.string().optional(),
      language: z.string().default("en"),
    });

    const body = await req.json();
    const { title, language } = createSchema.parse(body);

    const conversation = await prisma.conversation.create({
      data: {
        userId: session.user.id,
        title: title || "New Conversation",
        language,
      },
    });

    logger.info({
      conversationId: conversation.id,
      userId: session.user.id,
    }, "Created new conversation");

    return NextResponse.json(conversation);
  } catch (error) {
    logger.error(error, "Failed to create conversation:");

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}