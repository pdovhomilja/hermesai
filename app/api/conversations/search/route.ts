import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { SemanticSearch } from "@/lib/search/semantic-search";
import { z } from "zod";
import logger from "@/lib/logger";

const searchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(100).default(20),
  threshold: z.number().min(0).max(1).default(0.7),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  topics: z.array(z.string()).optional(),
  emotionalStates: z.array(z.string()).optional(),
  spiritualLevels: z.array(z.string()).optional(),
  conversationIds: z.array(z.string()).optional(),
  searchType: z.enum(["messages", "conversations", "hybrid"]).default("hybrid"),
  includeContext: z.boolean().default(true),
  includeHighlights: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const searchParams = searchSchema.parse(body);

    const search = new SemanticSearch();

    let results: Record<string, unknown> = {};

    switch (searchParams.searchType) {
      case "messages":
        results.messages = await search.searchMessages({
          ...searchParams,
          userId: session.user.id,
          dateFrom: searchParams.dateFrom ? new Date(searchParams.dateFrom) : undefined,
          dateTo: searchParams.dateTo ? new Date(searchParams.dateTo) : undefined,
        });
        results.total = (results.messages as unknown[]).length;
        break;

      case "conversations":
        results.conversations = await search.searchConversations({
          ...searchParams,
          userId: session.user.id,
          dateFrom: searchParams.dateFrom ? new Date(searchParams.dateFrom) : undefined,
          dateTo: searchParams.dateTo ? new Date(searchParams.dateTo) : undefined,
        });
        results.total = (results.conversations as unknown[]).length;
        break;

      case "hybrid":
        results = await search.hybridSearch({
          ...searchParams,
          userId: session.user.id,
          dateFrom: searchParams.dateFrom ? new Date(searchParams.dateFrom) : undefined,
          dateTo: searchParams.dateTo ? new Date(searchParams.dateTo) : undefined,
        });
        results.total = ((results.messages as unknown[])?.length || 0) + ((results.conversations as unknown[])?.length || 0);
        break;
    }

    // Add search metadata
    const responseData = {
      ...results,
      query: searchParams.query,
      searchType: searchParams.searchType,
      parameters: {
        threshold: searchParams.threshold,
        limit: searchParams.limit,
        dateRange: {
          from: searchParams.dateFrom,
          to: searchParams.dateTo,
        },
        filters: {
          topics: searchParams.topics,
          emotionalStates: searchParams.emotionalStates,
          spiritualLevels: searchParams.spiritualLevels,
        },
      },
      metadata: {
        searchedAt: new Date().toISOString(),
        userId: session.user.id,
      },
    };

    logger.info({
      userId: session.user.id,
      query: searchParams.query.substring(0, 100),
      searchType: searchParams.searchType,
      resultsCount: results.total,
      threshold: searchParams.threshold,
    }, "Conversation search completed");

    return NextResponse.json(responseData);
  } catch (error) {
    logger.error({ error }, "Search API error");

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const conversationId = searchParams.get('similar_to');

    if (conversationId) {
      // Find similar conversations
      const search = new SemanticSearch();
      const similarConversations = await search.findSimilarConversations(
        conversationId,
        session.user.id,
        parseInt(searchParams.get('limit') || '5')
      );

      logger.info({
        userId: session.user.id,
        conversationId,
        similarCount: similarConversations.length,
      }, "Similar conversations found");

      return NextResponse.json({
        similar: similarConversations,
        total: similarConversations.length,
        conversationId,
      });
    }

    // Get search suggestions or analytics
    const search = new SemanticSearch();
    const analytics = await search.getSearchAnalytics(session.user.id);

    return NextResponse.json({
      analytics,
      suggestions: [
        "hermetic principles",
        "spiritual transformation",
        "daily practices",
        "meditation guidance",
        "emotional healing",
      ],
    });
  } catch (error) {
    logger.error({ error }, "Search GET API error");
    return NextResponse.json({ error: "Failed to get search data" }, { status: 500 });
  }
}