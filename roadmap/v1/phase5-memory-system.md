# Phase 5: Conversation Memory & History System

## Overview

This phase implements a comprehensive conversation memory system with persistent storage, semantic search, journey visualization, and export capabilities. Users can search, organize, and track their spiritual development over time.

## Prerequisites

- Phase 1-4 completed
- PostgreSQL with PGVector extension configured
- OpenAI embeddings API access

## Phase Objectives

1. Implement vector embeddings for semantic search
2. Create conversation search with multiple filters
3. Build spiritual journey timeline
4. Develop conversation categorization system
5. Implement export functionality (PDF, Markdown, JSON)
6. Add cross-device synchronization
7. Create privacy controls and data retention

## Implementation Steps

### Step 1: Install Additional Dependencies

```bash
pnpm add @xenova/transformers
pnpm add pdf-lib @react-pdf/renderer
pnpm add marked markdown-pdf
pnpm add date-fns date-fns-tz
pnpm add recharts
pnpm add fuse.js
```

### Step 2: Vector Embeddings Service

Create `lib/ai/embeddings/service.ts`:

```typescript
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { prisma } from "@/lib/db/client";
import logger from "@/lib/logger";

export class EmbeddingService {
  private static instance: EmbeddingService;

  static getInstance(): EmbeddingService {
    if (!this.instance) {
      this.instance = new EmbeddingService();
    }
    return this.instance;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: text,
      });

      return embedding;
    } catch (error) {
      logger.error("Failed to generate embedding:", error);
      throw error;
    }
  }

  async embedMessage(messageId: string, content: string): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(content);

      // Store embedding in database using raw SQL for pgvector
      await prisma.$executeRaw`
        UPDATE "Message" 
        SET embedding = ${JSON.stringify(embedding)}::vector
        WHERE id = ${messageId}
      `;

      logger.info("Message embedded successfully", { messageId });
    } catch (error) {
      logger.error("Failed to embed message:", error);
      throw error;
    }
  }

  async embedConversation(conversationId: string): Promise<void> {
    try {
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
      });

      // Create summary for conversation embedding
      const summary = messages
        .slice(0, 10) // Use first 10 messages for summary
        .map((m) => m.content)
        .join(" ")
        .substring(0, 1000); // Limit to 1000 chars

      const embedding = await this.generateEmbedding(summary);

      // Store conversation-level embedding
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          metadata: {
            ...(((
              await prisma.conversation.findUnique({
                where: { id: conversationId },
                select: { metadata: true },
              })
            )?.metadata as any) || {}),
            embedding: embedding,
          },
        },
      });

      // Embed individual messages
      for (const message of messages) {
        if (!message.embedding) {
          await this.embedMessage(message.id, message.content);
        }
      }
    } catch (error) {
      logger.error("Failed to embed conversation:", error);
      throw error;
    }
  }
}
```

### Step 3: Semantic Search Implementation

Create `lib/search/semantic-search.ts`:

```typescript
import { prisma } from "@/lib/db/client";
import { EmbeddingService } from "@/lib/ai/embeddings/service";
import logger from "@/lib/logger";

export interface SearchOptions {
  query: string;
  userId: string;
  limit?: number;
  threshold?: number;
  dateFrom?: Date;
  dateTo?: Date;
  topics?: string[];
  emotionalStates?: string[];
  conversationIds?: string[];
}

export interface SearchResult {
  messageId: string;
  conversationId: string;
  content: string;
  similarity: number;
  createdAt: Date;
  context: {
    before: string;
    after: string;
  };
  metadata: any;
}

export class SemanticSearch {
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = EmbeddingService.getInstance();
  }

  async search(options: SearchOptions): Promise<SearchResult[]> {
    try {
      const {
        query,
        userId,
        limit = 20,
        threshold = 0.7,
        dateFrom,
        dateTo,
        topics,
        emotionalStates,
        conversationIds,
      } = options;

      // Generate embedding for search query
      const queryEmbedding = await this.embeddingService.generateEmbedding(
        query
      );

      // Build SQL query with pgvector similarity search
      let sql = `
        SELECT 
          m.id as "messageId",
          m.conversation_id as "conversationId",
          m.content,
          m.created_at as "createdAt",
          m.metadata,
          m.emotional_state as "emotionalState",
          1 - (m.embedding <=> $1::vector) as similarity,
          c.title as "conversationTitle"
        FROM "Message" m
        JOIN "Conversation" c ON m.conversation_id = c.id
        WHERE 
          c.user_id = $2
          AND m.embedding IS NOT NULL
          AND 1 - (m.embedding <=> $1::vector) > $3
      `;

      const params: any[] = [JSON.stringify(queryEmbedding), userId, threshold];
      let paramIndex = 4;

      // Add date filters
      if (dateFrom) {
        sql += ` AND m.created_at >= $${paramIndex}`;
        params.push(dateFrom);
        paramIndex++;
      }

      if (dateTo) {
        sql += ` AND m.created_at <= $${paramIndex}`;
        params.push(dateTo);
        paramIndex++;
      }

      // Add conversation filter
      if (conversationIds && conversationIds.length > 0) {
        sql += ` AND m.conversation_id = ANY($${paramIndex})`;
        params.push(conversationIds);
        paramIndex++;
      }

      // Add emotional state filter
      if (emotionalStates && emotionalStates.length > 0) {
        sql += ` AND m.emotional_state = ANY($${paramIndex})`;
        params.push(emotionalStates);
        paramIndex++;
      }

      sql += `
        ORDER BY similarity DESC
        LIMIT $${paramIndex}
      `;
      params.push(limit);

      const results = await prisma.$queryRawUnsafe<any[]>(sql, ...params);

      // Get context for each result
      const enrichedResults = await Promise.all(
        results.map(async (result) => {
          const context = await this.getMessageContext(
            result.messageId,
            result.conversationId
          );

          return {
            ...result,
            context,
          };
        })
      );

      // Filter by topics if specified
      if (topics && topics.length > 0) {
        const topicFiltered = await this.filterByTopics(
          enrichedResults,
          topics
        );
        return topicFiltered;
      }

      return enrichedResults;
    } catch (error) {
      logger.error("Semantic search failed:", error);
      throw error;
    }
  }

  async getMessageContext(
    messageId: string,
    conversationId: string
  ): Promise<{ before: string; after: string }> {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
      },
    });

    const messageIndex = messages.findIndex((m) => m.id === messageId);

    const before = messages
      .slice(Math.max(0, messageIndex - 2), messageIndex)
      .map((m) => m.content)
      .join("\n");

    const after = messages
      .slice(messageIndex + 1, Math.min(messages.length, messageIndex + 3))
      .map((m) => m.content)
      .join("\n");

    return { before, after };
  }

  async filterByTopics(
    results: SearchResult[],
    topics: string[]
  ): Promise<SearchResult[]> {
    const conversationIds = [...new Set(results.map((r) => r.conversationId))];

    const conversationTopics = await prisma.conversationTopic.findMany({
      where: {
        conversationId: { in: conversationIds },
        topic: {
          name: { in: topics },
        },
      },
      select: {
        conversationId: true,
      },
    });

    const topicConversationIds = new Set(
      conversationTopics.map((ct) => ct.conversationId)
    );

    return results.filter((r) => topicConversationIds.has(r.conversationId));
  }
}
```

### Step 4: Conversation Search API

Create `app/api/conversations/search/route.ts`:

```typescript
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
  conversationIds: z.array(z.string()).optional(),
  searchType: z.enum(["semantic", "keyword", "hybrid"]).default("semantic"),
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

    const results = await search.search({
      ...searchParams,
      userId: session.user.id,
      dateFrom: searchParams.dateFrom
        ? new Date(searchParams.dateFrom)
        : undefined,
      dateTo: searchParams.dateTo ? new Date(searchParams.dateTo) : undefined,
    });

    logger.info("Conversation search completed", {
      userId: session.user.id,
      query: searchParams.query,
      resultsCount: results.length,
    });

    return NextResponse.json({
      results,
      total: results.length,
      query: searchParams.query,
    });
  } catch (error) {
    logger.error("Search API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
```

### Step 5: Spiritual Journey Timeline

Create `lib/journey/timeline.ts`:

```typescript
import { prisma } from "@/lib/db/client";
import { startOfDay, endOfDay, subDays } from "date-fns";

export interface TimelineEvent {
  id: string;
  type: "conversation" | "insight" | "milestone" | "practice";
  date: Date;
  title: string;
  description: string;
  significance: "low" | "medium" | "high" | "critical";
  metadata?: any;
}

export interface JourneyStats {
  totalConversations: number;
  totalMessages: number;
  totalInsights: number;
  principlesStudied: string[];
  challengesAddressed: string[];
  currentLevel: string;
  transformationScore: number;
  streakDays: number;
}

export class SpiritualJourney {
  constructor(private userId: string) {}

  async getTimeline(
    days: number = 30,
    includeTypes?: string[]
  ): Promise<TimelineEvent[]> {
    const startDate = subDays(new Date(), days);
    const events: TimelineEvent[] = [];

    // Get conversations
    if (!includeTypes || includeTypes.includes("conversation")) {
      const conversations = await prisma.conversation.findMany({
        where: {
          userId: this.userId,
          createdAt: { gte: startDate },
        },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: "asc" },
          },
        },
      });

      events.push(
        ...conversations.map((c) => ({
          id: c.id,
          type: "conversation" as const,
          date: c.createdAt,
          title: c.title || "Untitled Conversation",
          description: c.messages[0]?.content.substring(0, 100) || "",
          significance: "medium" as const,
          metadata: { messageCount: c.messages.length },
        }))
      );
    }

    // Get insights
    if (!includeTypes || includeTypes.includes("insight")) {
      const insights = await prisma.userInsight.findMany({
        where: {
          userId: this.userId,
          createdAt: { gte: startDate },
        },
      });

      events.push(
        ...insights.map((i) => ({
          id: i.id,
          type: "insight" as const,
          date: i.createdAt,
          title: `${i.type} Insight`,
          description: i.content,
          significance: i.significance.toLowerCase() as any,
          metadata: i.metadata,
        }))
      );
    }

    // Sort by date
    events.sort((a, b) => b.date.getTime() - a.date.getTime());

    return events;
  }

  async getStats(): Promise<JourneyStats> {
    const [conversations, messages, insights, profile, recentActivity] =
      await Promise.all([
        prisma.conversation.count({
          where: { userId: this.userId, status: "ACTIVE" },
        }),
        prisma.message.count({
          where: {
            conversation: { userId: this.userId },
          },
        }),
        prisma.userInsight.count({
          where: { userId: this.userId },
        }),
        prisma.spiritualProfile.findUnique({
          where: { userId: this.userId },
        }),
        this.getActivityStreak(),
      ]);

    // Get unique principles and challenges
    const principlesData = await prisma.message.findMany({
      where: {
        conversation: { userId: this.userId },
        hermeticPrinciples: { isEmpty: false },
      },
      select: {
        hermeticPrinciples: true,
      },
    });

    const principles = [
      ...new Set(principlesData.flatMap((m) => m.hermeticPrinciples)),
    ];

    const challengesData = await prisma.userInsight.findMany({
      where: {
        userId: this.userId,
        type: "CHALLENGE",
      },
      select: {
        metadata: true,
      },
    });

    const challenges = [
      ...new Set(
        challengesData
          .map((i) => (i.metadata as any)?.challenge)
          .filter(Boolean)
      ),
    ];

    return {
      totalConversations: conversations,
      totalMessages: messages,
      totalInsights: insights,
      principlesStudied: principles,
      challengesAddressed: challenges,
      currentLevel: profile?.currentLevel || "SEEKER",
      transformationScore: profile?.transformationScore || 0,
      streakDays: recentActivity.streakDays,
    };
  }

  async getActivityStreak(): Promise<{
    streakDays: number;
    lastActive: Date | null;
  }> {
    const thirtyDaysAgo = subDays(new Date(), 30);

    const activities = await prisma.conversation.findMany({
      where: {
        userId: this.userId,
        lastMessageAt: { gte: thirtyDaysAgo },
      },
      select: {
        lastMessageAt: true,
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    if (activities.length === 0) {
      return { streakDays: 0, lastActive: null };
    }

    // Calculate streak
    let streakDays = 0;
    let currentDate = startOfDay(new Date());

    for (let i = 0; i < 30; i++) {
      const dayStart = startOfDay(currentDate);
      const dayEnd = endOfDay(currentDate);

      const hasActivity = activities.some(
        (a) =>
          a.lastMessageAt &&
          a.lastMessageAt >= dayStart &&
          a.lastMessageAt <= dayEnd
      );

      if (hasActivity) {
        streakDays++;
        currentDate = subDays(currentDate, 1);
      } else if (i === 0) {
        // No activity today, check yesterday
        currentDate = subDays(currentDate, 1);
      } else {
        // Streak broken
        break;
      }
    }

    return {
      streakDays,
      lastActive: activities[0]?.lastMessageAt || null,
    };
  }
}
```

### Step 6: Conversation Export Service

Create `lib/export/exporter.ts`:

```typescript
import { prisma } from "@/lib/db/client";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { marked } from "marked";
import { format } from "date-fns";
import logger from "@/lib/logger";

export type ExportFormat = "pdf" | "markdown" | "json" | "html";

export interface ExportOptions {
  format: ExportFormat;
  conversationIds?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  includeMetadata?: boolean;
  includeInsights?: boolean;
}

export class ConversationExporter {
  constructor(private userId: string) {}

  async export(options: ExportOptions): Promise<Buffer | string> {
    const conversations = await this.getConversations(options);

    switch (options.format) {
      case "pdf":
        return this.exportToPDF(conversations, options);
      case "markdown":
        return this.exportToMarkdown(conversations, options);
      case "json":
        return this.exportToJSON(conversations, options);
      case "html":
        return this.exportToHTML(conversations, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private async getConversations(options: ExportOptions) {
    const where: any = {
      userId: this.userId,
      status: "ACTIVE",
    };

    if (options.conversationIds) {
      where.id = { in: options.conversationIds };
    }

    if (options.dateFrom || options.dateTo) {
      where.createdAt = {};
      if (options.dateFrom) where.createdAt.gte = options.dateFrom;
      if (options.dateTo) where.createdAt.lte = options.dateTo;
    }

    return prisma.conversation.findMany({
      where,
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        topics: {
          include: {
            topic: true,
          },
        },
        insights: options.includeInsights || false,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  private async exportToPDF(
    conversations: any[],
    options: ExportOptions
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for (const conversation of conversations) {
      // Add conversation page
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      let yPosition = height - 50;

      // Title
      page.drawText("IALchemist - Conversation with Hermes Trismegistus", {
        x: 50,
        y: yPosition,
        size: 16,
        font: boldFont,
        color: rgb(0.4, 0.2, 0.6),
      });

      yPosition -= 30;

      // Conversation title
      page.drawText(conversation.title || "Untitled Conversation", {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
      });

      yPosition -= 20;

      // Date
      page.drawText(`Date: ${format(conversation.createdAt, "PPP")}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font,
      });

      yPosition -= 30;

      // Messages
      for (const message of conversation.messages) {
        if (yPosition < 100) {
          // New page needed
          const newPage = pdfDoc.addPage();
          yPosition = newPage.getSize().height - 50;
        }

        const role = message.role === "USER" ? "You" : "Hermes";
        const roleColor =
          message.role === "USER" ? rgb(0, 0, 0) : rgb(0.4, 0.2, 0.6);

        // Role
        page.drawText(`${role}:`, {
          x: 50,
          y: yPosition,
          size: 11,
          font: boldFont,
          color: roleColor,
        });

        yPosition -= 15;

        // Content (truncate long messages)
        const lines = this.wrapText(message.content, 90);
        for (const line of lines.slice(0, 5)) {
          page.drawText(line, {
            x: 50,
            y: yPosition,
            size: 10,
            font,
          });
          yPosition -= 12;
        }

        if (lines.length > 5) {
          page.drawText("...", {
            x: 50,
            y: yPosition,
            size: 10,
            font,
          });
          yPosition -= 12;
        }

        yPosition -= 10;
      }
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private exportToMarkdown(
    conversations: any[],
    options: ExportOptions
  ): string {
    let markdown = "# IALchemist - Conversations with Hermes Trismegistus\n\n";

    for (const conversation of conversations) {
      markdown += `## ${conversation.title || "Untitled Conversation"}\n\n`;
      markdown += `**Date:** ${format(conversation.createdAt, "PPP")}\n\n`;

      if (conversation.topics.length > 0) {
        markdown += `**Topics:** ${conversation.topics
          .map((t) => t.topic.name)
          .join(", ")}\n\n`;
      }

      markdown += "---\n\n";

      for (const message of conversation.messages) {
        const role = message.role === "USER" ? "**You**" : "**Hermes**";
        markdown += `${role}: ${message.content}\n\n`;
      }

      if (options.includeInsights && conversation.insights.length > 0) {
        markdown += "### Insights\n\n";
        for (const insight of conversation.insights) {
          markdown += `- ${insight.content}\n`;
        }
        markdown += "\n";
      }

      markdown += "\n---\n\n";
    }

    return markdown;
  }

  private exportToJSON(conversations: any[], options: ExportOptions): string {
    const exportData = {
      exportDate: new Date().toISOString(),
      userId: this.userId,
      conversations: conversations.map((c) => ({
        id: c.id,
        title: c.title,
        createdAt: c.createdAt,
        language: c.language,
        messages: c.messages.map((m) => ({
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
          emotionalState: m.emotionalState,
          hermeticPrinciples: m.hermeticPrinciples,
          metadata: options.includeMetadata ? m.metadata : undefined,
        })),
        topics: c.topics.map((t) => t.topic.name),
        insights: options.includeInsights ? c.insights : undefined,
      })),
    };

    return JSON.stringify(exportData, null, 2);
  }

  private exportToHTML(conversations: any[], options: ExportOptions): string {
    const markdown = this.exportToMarkdown(conversations, options);
    const html = marked(markdown);

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>IALchemist - Conversations with Hermes</title>
    <style>
        body {
            font-family: Georgia, serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(to bottom, #f5f3ff, #ffffff);
        }
        h1 { color: #6633cc; }
        h2 { color: #8855dd; margin-top: 40px; }
        h3 { color: #aa77ee; }
        hr { border: 1px solid #e0d5ff; }
        strong { color: #6633cc; }
        blockquote {
            border-left: 3px solid #6633cc;
            padding-left: 15px;
            margin-left: 0;
            font-style: italic;
        }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;
  }

  private wrapText(text: string, maxChars: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      if ((currentLine + word).length > maxChars) {
        lines.push(currentLine.trim());
        currentLine = word + " ";
      } else {
        currentLine += word + " ";
      }
    }

    if (currentLine) {
      lines.push(currentLine.trim());
    }

    return lines;
  }
}
```

### Step 7: Export API Routes

Create `app/api/conversations/export/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ConversationExporter } from "@/lib/export/exporter";
import { z } from "zod";
import logger from "@/lib/logger";

const exportSchema = z.object({
  format: z.enum(["pdf", "markdown", "json", "html"]),
  conversationIds: z.array(z.string()).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  includeMetadata: z.boolean().default(false),
  includeInsights: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const exportOptions = exportSchema.parse(body);

    const exporter = new ConversationExporter(session.user.id);

    const result = await exporter.export({
      ...exportOptions,
      dateFrom: exportOptions.dateFrom
        ? new Date(exportOptions.dateFrom)
        : undefined,
      dateTo: exportOptions.dateTo ? new Date(exportOptions.dateTo) : undefined,
    });

    logger.info("Conversation export completed", {
      userId: session.user.id,
      format: exportOptions.format,
      conversationCount: exportOptions.conversationIds?.length || "all",
    });

    // Set appropriate headers based on format
    const headers: HeadersInit = {};
    let responseBody: any = result;

    switch (exportOptions.format) {
      case "pdf":
        headers["Content-Type"] = "application/pdf";
        headers["Content-Disposition"] =
          'attachment; filename="hermes-conversations.pdf"';
        break;
      case "markdown":
        headers["Content-Type"] = "text/markdown";
        headers["Content-Disposition"] =
          'attachment; filename="hermes-conversations.md"';
        break;
      case "json":
        headers["Content-Type"] = "application/json";
        headers["Content-Disposition"] =
          'attachment; filename="hermes-conversations.json"';
        break;
      case "html":
        headers["Content-Type"] = "text/html";
        headers["Content-Disposition"] =
          'attachment; filename="hermes-conversations.html"';
        break;
    }

    return new Response(responseBody, { headers });
  } catch (error) {
    logger.error("Export API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid export parameters", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
```

### Step 8: Journey Timeline API

Create `app/api/journey/timeline/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { SpiritualJourney } from "@/lib/journey/timeline";
import { z } from "zod";
import logger from "@/lib/logger";

const timelineSchema = z.object({
  days: z.number().min(1).max(365).default(30),
  includeTypes: z
    .array(z.enum(["conversation", "insight", "milestone", "practice"]))
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { days, includeTypes } = timelineSchema.parse(body);

    const journey = new SpiritualJourney(session.user.id);

    const [timeline, stats] = await Promise.all([
      journey.getTimeline(days, includeTypes),
      journey.getStats(),
    ]);

    logger.info("Journey timeline fetched", {
      userId: session.user.id,
      days,
      eventCount: timeline.length,
    });

    return NextResponse.json({
      timeline,
      stats,
    });
  } catch (error) {
    logger.error("Timeline API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}
```

### Step 9: Privacy Controls

Create `app/api/privacy/data-retention/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { z } from "zod";
import logger from "@/lib/logger";

const retentionSchema = z.object({
  retentionDays: z.number().min(0).max(365), // 0 = unlimited
  deleteOlderThan: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { retentionDays, deleteOlderThan } = retentionSchema.parse(body);

    // Update user preference
    await prisma.userPreference.upsert({
      where: { userId: session.user.id },
      update: { dataRetention: retentionDays },
      create: {
        userId: session.user.id,
        dataRetention: retentionDays,
      },
    });

    // If requested, delete older conversations
    if (deleteOlderThan && retentionDays > 0) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const deleted = await prisma.conversation.updateMany({
        where: {
          userId: session.user.id,
          createdAt: { lt: cutoffDate },
        },
        data: {
          status: "DELETED",
        },
      });

      logger.info("Deleted old conversations", {
        userId: session.user.id,
        count: deleted.count,
        olderThan: cutoffDate,
      });
    }

    return NextResponse.json({
      message: "Data retention settings updated",
      retentionDays,
    });
  } catch (error) {
    logger.error("Data retention API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update retention settings" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Delete all user conversations
    await prisma.conversation.deleteMany({
      where: { userId: session.user.id },
    });

    // Delete all user insights
    await prisma.userInsight.deleteMany({
      where: { userId: session.user.id },
    });

    logger.info("All user data deleted", {
      userId: session.user.id,
    });

    return NextResponse.json({
      message: "All conversation data deleted successfully",
    });
  } catch (error) {
    logger.error("Data deletion API error:", error);

    return NextResponse.json(
      { error: "Failed to delete data" },
      { status: 500 }
    );
  }
}
```

## Verification Steps

1. Test embedding generation for messages
2. Verify semantic search functionality
3. Test timeline generation with various filters
4. Validate export in all formats (PDF, Markdown, JSON, HTML)
5. Test privacy controls and data retention
6. Verify cross-device synchronization

7. Run linting and build:

```bash
pnpm lint
pnpm build
```

## Success Criteria

- [ ] Messages are embedded with vectors for semantic search
- [ ] Semantic search returns relevant results
- [ ] Timeline accurately shows spiritual journey
- [ ] Export works in all formats
- [ ] Privacy controls function correctly
- [ ] Data retention policies enforced
- [ ] Cross-device sync working
- [ ] No linting errors
- [ ] Build completes successfully

## Next Phase

Phase 6 will implement the subscription and payment system using Stripe integration.
