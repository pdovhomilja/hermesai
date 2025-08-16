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
  includeConversations?: boolean;
  spiritualLevels?: string[];
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
  metadata: {
    role: string;
    emotionalState?: string;
    hermeticPrinciples?: string[];
    conversationTitle?: string;
    spiritualContext?: any;
  };
  highlights?: string[];
}

export interface ConversationSearchResult {
  conversationId: string;
  title: string;
  similarity: number;
  createdAt: Date;
  messageCount: number;
  summary: string;
  metadata: {
    topics?: string[];
    emotionalStates?: string[];
    principlesDiscussed?: string[];
    userSpiritualLevel?: string;
  };
}

/**
 * SemanticSearch
 * 
 * Provides semantic search capabilities over spiritual conversations using
 * vector embeddings and PGVector similarity search. Enables seekers to
 * rediscover wisdom from their journey with Hermes Trismegistus.
 */
export class SemanticSearch {
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = EmbeddingService.getInstance();
  }

  /**
   * Search messages using semantic similarity
   */
  async searchMessages(options: SearchOptions): Promise<SearchResult[]> {
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
        spiritualLevels,
      } = options;

      // Generate embedding for search query
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);

      // Build base SQL query with pgvector similarity search
      let sql = `
        SELECT 
          m.id as "messageId",
          m.conversation_id as "conversationId",
          m.content,
          m.created_at as "createdAt",
          m.metadata,
          m.emotional_state as "emotionalState",
          m.hermetic_principles as "hermeticPrinciples",
          m.role,
          c.title as "conversationTitle",
          c.metadata as "conversationMetadata",
          1 - (m.embedding <=> $1::vector) as similarity
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

      // Add spiritual level filter (from conversation metadata)
      if (spiritualLevels && spiritualLevels.length > 0) {
        sql += ` AND c.metadata->>'spiritualLevel' = ANY($${paramIndex})`;
        params.push(spiritualLevels);
        paramIndex++;
      }

      sql += `
        ORDER BY similarity DESC
        LIMIT $${paramIndex}
      `;
      params.push(limit);

      const rawResults = await prisma.$queryRawUnsafe<any[]>(sql, ...params);

      // Enhance results with context and highlights
      const enrichedResults = await Promise.all(
        rawResults.map(async (result) => {
          const context = await this.getMessageContext(
            result.messageId,
            result.conversationId
          );

          const highlights = this.extractHighlights(result.content, query);

          return {
            messageId: result.messageId,
            conversationId: result.conversationId,
            content: result.content,
            similarity: parseFloat(result.similarity),
            createdAt: result.createdAt,
            context,
            metadata: {
              role: result.role,
              emotionalState: result.emotionalState,
              hermeticPrinciples: result.hermeticPrinciples || [],
              conversationTitle: result.conversationTitle,
              spiritualContext: result.conversationMetadata,
            },
            highlights,
          };
        })
      );

      // Filter by topics if specified (check conversation topics)
      if (topics && topics.length > 0) {
        const topicFiltered = await this.filterByTopics(enrichedResults, topics);
        return topicFiltered;
      }

      logger.info({
        userId,
        query: query.substring(0, 100),
        resultsCount: enrichedResults.length,
        threshold,
      }, "Message search completed");

      return enrichedResults;
    } catch (error) {
      logger.error({ error, userId: options.userId, query: options.query }, "Message semantic search failed");
      throw error;
    }
  }

  /**
   * Search conversations using semantic similarity
   */
  async searchConversations(options: SearchOptions): Promise<ConversationSearchResult[]> {
    try {
      const {
        query,
        userId,
        limit = 10,
        threshold = 0.7,
        dateFrom,
        dateTo,
        topics,
        emotionalStates,
      } = options;

      // Generate embedding for search query
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);

      // Search conversations by their summary embeddings
      let sql = `
        SELECT 
          c.id as "conversationId",
          c.title,
          c.created_at as "createdAt",
          c.metadata,
          1 - ((c.metadata->>'embedding')::vector <=> $1::vector) as similarity,
          (SELECT COUNT(*) FROM "Message" WHERE conversation_id = c.id) as "messageCount"
        FROM "Conversation" c
        WHERE 
          c.user_id = $2
          AND c.metadata->>'embedding' IS NOT NULL
          AND 1 - ((c.metadata->>'embedding')::vector <=> $1::vector) > $3
      `;

      const params: any[] = [JSON.stringify(queryEmbedding), userId, threshold];
      let paramIndex = 4;

      // Add date filters
      if (dateFrom) {
        sql += ` AND c.created_at >= $${paramIndex}`;
        params.push(dateFrom);
        paramIndex++;
      }

      if (dateTo) {
        sql += ` AND c.created_at <= $${paramIndex}`;
        params.push(dateTo);
        paramIndex++;
      }

      sql += `
        ORDER BY similarity DESC
        LIMIT $${paramIndex}
      `;
      params.push(limit);

      const rawResults = await prisma.$queryRawUnsafe<any[]>(sql, ...params);

      const enrichedResults: ConversationSearchResult[] = rawResults.map((result) => ({
        conversationId: result.conversationId,
        title: result.title || 'Untitled Conversation',
        similarity: parseFloat(result.similarity),
        createdAt: result.createdAt,
        messageCount: parseInt(result.messageCount),
        summary: result.metadata?.summary || 'No summary available',
        metadata: {
          topics: result.metadata?.topics || [],
          emotionalStates: result.metadata?.emotionalStates || [],
          principlesDiscussed: result.metadata?.principlesDiscussed || [],
          userSpiritualLevel: result.metadata?.userSpiritualLevel,
        },
      }));

      logger.info({
        userId,
        query: query.substring(0, 100),
        resultsCount: enrichedResults.length,
        threshold,
      }, "Conversation search completed");

      return enrichedResults;
    } catch (error) {
      logger.error({ error, userId: options.userId, query: options.query }, "Conversation semantic search failed");
      throw error;
    }
  }

  /**
   * Hybrid search combining semantic and keyword search
   */
  async hybridSearch(options: SearchOptions): Promise<{
    messages: SearchResult[];
    conversations: ConversationSearchResult[];
    suggestions: string[];
  }> {
    try {
      const [messageResults, conversationResults] = await Promise.all([
        this.searchMessages({ ...options, limit: Math.floor((options.limit || 20) * 0.7) }),
        this.searchConversations({ ...options, limit: Math.floor((options.limit || 10) * 0.5) }),
      ]);

      // Generate search suggestions based on user's conversation history
      const suggestions = await this.generateSearchSuggestions(options.userId, options.query);

      return {
        messages: messageResults,
        conversations: conversationResults,
        suggestions,
      };
    } catch (error) {
      logger.error({ error, userId: options.userId, query: options.query }, "Hybrid search failed");
      throw error;
    }
  }

  /**
   * Find similar conversations to a given conversation
   */
  async findSimilarConversations(
    conversationId: string,
    userId: string,
    limit: number = 5
  ): Promise<ConversationSearchResult[]> {
    try {
      // Get the target conversation's summary embedding
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { metadata: true, title: true },
      });

      if (!conversation?.metadata || !(conversation.metadata as any).embedding) {
        return [];
      }

      const embedding = (conversation.metadata as any).embedding;

      const sql = `
        SELECT 
          c.id as "conversationId",
          c.title,
          c.created_at as "createdAt",
          c.metadata,
          1 - ((c.metadata->>'embedding')::vector <=> $1::vector) as similarity,
          (SELECT COUNT(*) FROM "Message" WHERE conversation_id = c.id) as "messageCount"
        FROM "Conversation" c
        WHERE 
          c.user_id = $2
          AND c.id != $3
          AND c.metadata->>'embedding' IS NOT NULL
        ORDER BY similarity DESC
        LIMIT $4
      `;

      const rawResults = await prisma.$queryRawUnsafe<any[]>(
        sql,
        JSON.stringify(embedding),
        userId,
        conversationId,
        limit
      );

      return rawResults.map((result) => ({
        conversationId: result.conversationId,
        title: result.title || 'Untitled Conversation',
        similarity: parseFloat(result.similarity),
        createdAt: result.createdAt,
        messageCount: parseInt(result.messageCount),
        summary: result.metadata?.summary || 'No summary available',
        metadata: {
          topics: result.metadata?.topics || [],
          emotionalStates: result.metadata?.emotionalStates || [],
          principlesDiscussed: result.metadata?.principlesDiscussed || [],
          userSpiritualLevel: result.metadata?.userSpiritualLevel,
        },
      }));
    } catch (error) {
      logger.error({ error, conversationId, userId }, "Find similar conversations failed");
      throw error;
    }
  }

  /**
   * Get search analytics and insights
   */
  async getSearchAnalytics(userId: string, days: number = 30): Promise<{
    totalSearches: number;
    topQueries: string[];
    avgResultsPerSearch: number;
    searchTrends: Array<{ date: string; searches: number }>;
    topTopics: string[];
  }> {
    try {
      // This would require a search log table in a real implementation
      // For now, we'll return mock analytics
      
      return {
        totalSearches: 0,
        topQueries: [],
        avgResultsPerSearch: 0,
        searchTrends: [],
        topTopics: [],
      };
    } catch (error) {
      logger.error({ error, userId }, "Failed to get search analytics");
      throw error;
    }
  }

  // Private helper methods

  /**
   * Get context messages around a search result
   */
  private async getMessageContext(
    messageId: string,
    conversationId: string
  ): Promise<{ before: string; after: string }> {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        role: true,
      },
    });

    const messageIndex = messages.findIndex((m) => m.id === messageId);

    const before = messages
      .slice(Math.max(0, messageIndex - 2), messageIndex)
      .map((m) => `${m.role}: ${m.content.substring(0, 100)}...`)
      .join("\n");

    const after = messages
      .slice(messageIndex + 1, Math.min(messages.length, messageIndex + 3))
      .map((m) => `${m.role}: ${m.content.substring(0, 100)}...`)
      .join("\n");

    return { before, after };
  }

  /**
   * Extract highlighted text snippets
   */
  private extractHighlights(content: string, query: string): string[] {
    const queryWords = query.toLowerCase().split(/\s+/);
    const sentences = content.split(/[.!?]+/);
    
    const highlights: string[] = [];
    
    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      const matchCount = queryWords.reduce((count, word) => {
        return count + (sentenceLower.includes(word) ? 1 : 0);
      }, 0);
      
      if (matchCount > 0) {
        highlights.push(sentence.trim());
      }
    }
    
    return highlights.slice(0, 3); // Return top 3 highlights
  }

  /**
   * Filter results by topics
   */
  private async filterByTopics(
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

  /**
   * Generate search suggestions based on user's history
   */
  private async generateSearchSuggestions(userId: string, query: string): Promise<string[]> {
    try {
      // Get recent hermetic principles discussed
      const recentPrinciples = await prisma.message.findMany({
        where: {
          conversation: { userId },
          hermeticPrinciples: { isEmpty: false },
        },
        select: { hermeticPrinciples: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      const principleNames = [
        ...new Set(recentPrinciples.flatMap(m => m.hermeticPrinciples))
      ];

      const suggestions = [
        ...principleNames.map(p => `${p} principles`),
        'spiritual transformation',
        'daily practices',
        'meditation guidance',
        'emotional healing',
        'life challenges',
      ].slice(0, 5);

      return suggestions;
    } catch (error) {
      logger.error({ error, userId }, "Failed to generate search suggestions");
      return [];
    }
  }
}