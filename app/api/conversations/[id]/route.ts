import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import logger from "@/lib/logger";

// GET: Get conversation with messages
export async function GET(
  req: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const params = await context.params;
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        topics: {
          include: {
            topic: true,
          },
        },
      },
    });

    if (!conversation) {
      return new Response("Not found", { status: 404 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    logger.error(error, "Failed to fetch conversation:");
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

// DELETE: Delete conversation
export async function DELETE(
  req: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const params = await context.params;
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!conversation) {
      return new Response("Not found", { status: 404 });
    }

    // Soft delete by updating status
    await prisma.conversation.update({
      where: { id: params.id },
      data: { status: "DELETED" },
    });

    logger.info({
      conversationId: params.id,
      userId: session.user.id,
    }, "Deleted conversation");

    return NextResponse.json({ message: "Conversation deleted" });
  } catch (error) {
    logger.error(error, "Failed to delete conversation:");
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}