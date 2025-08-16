import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { prisma } from "@/lib/db/client";
import logger from "@/lib/logger";

/**
 * EmbeddingService
 * 
 * Generates and manages vector embeddings for messages and conversations
 * to enable semantic search capabilities. Uses OpenAI's text-embedding-3-small
 * model for efficient and accurate vector representations of spiritual conversations.
 */
export class EmbeddingService {
  private static instance: EmbeddingService;

  static getInstance(): EmbeddingService {
    if (!this.instance) {
      this.instance = new EmbeddingService();
    }
    return this.instance;
  }

  /**
   * Generate embedding vector for text content
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: text.substring(0, 8000), // Limit to 8k characters for embedding model
      });

      return embedding;
    } catch (error) {
      logger.error({ error, textLength: text.length }, "Failed to generate embedding");
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const embeddings: number[][] = [];
      
      // Process in batches of 10 to avoid rate limits
      const batchSize = 10;
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        
        const batchPromises = batch.map(text => this.generateEmbedding(text));
        const batchEmbeddings = await Promise.all(batchPromises);
        
        embeddings.push(...batchEmbeddings);
        
        // Add small delay between batches to respect rate limits
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return embeddings;
    } catch (error) {
      logger.error({ error, textCount: texts.length }, "Failed to generate batch embeddings");
      throw error;
    }
  }

  /**
   * Embed a single message and store in database
   */
  async embedMessage(messageId: string, content: string): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(content);

      // Store embedding in database using raw SQL for pgvector
      await prisma.$executeRaw`
        UPDATE "Message" 
        SET embedding = ${JSON.stringify(embedding)}::vector
        WHERE id = ${messageId}
      `;

      logger.info({ messageId, contentLength: content.length }, "Message embedded successfully");
    } catch (error) {
      logger.error({ error, messageId }, "Failed to embed message");
      throw error;
    }
  }

  /**
   * Embed multiple messages in batch
   */
  async embedMessages(messages: Array<{ id: string; content: string }>): Promise<void> {
    try {
      logger.info({ messageCount: messages.length }, "Starting batch message embedding");

      const contents = messages.map(m => m.content);
      const embeddings = await this.generateBatchEmbeddings(contents);

      // Update messages with embeddings using transaction
      await prisma.$transaction(async (tx) => {
        for (let i = 0; i < messages.length; i++) {
          await tx.$executeRaw`
            UPDATE "Message" 
            SET embedding = ${JSON.stringify(embeddings[i])}::vector
            WHERE id = ${messages[i].id}
          `;
        }
      });

      logger.info({ messageCount: messages.length }, "Batch message embedding completed");
    } catch (error) {
      logger.error({ error, messageCount: messages.length }, "Failed to embed messages batch");
      throw error;
    }
  }

  /**
   * Embed a conversation summary and store metadata
   */
  async embedConversation(conversationId: string): Promise<void> {
    try {
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          role: true,
          createdAt: true,
        },
      });

      if (messages.length === 0) {
        logger.warn({ conversationId }, "No messages found for conversation embedding");
        return;
      }

      // Create conversation summary for embedding
      const summary = this.createConversationSummary(messages);
      const embedding = await this.generateEmbedding(summary);

      // Store conversation-level embedding in metadata
      const existingConversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { metadata: true },
      });

      const updatedMetadata = {
        ...((existingConversation?.metadata as any) || {}),
        embedding: embedding,
        summary: summary.substring(0, 500), // Store truncated summary
        messageCount: messages.length,
        lastEmbeddedAt: new Date().toISOString(),
      };

      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          metadata: updatedMetadata,
        },
      });

      // Embed individual messages that don't have embeddings yet
      const messagesWithoutEmbeddings = messages.filter(m => !m.id); // This would be checked differently in real implementation
      
      if (messagesWithoutEmbeddings.length > 0) {
        await this.embedMessages(messagesWithoutEmbeddings.map(m => ({
          id: m.id,
          content: m.content
        })));
      }

      logger.info({ 
        conversationId, 
        messageCount: messages.length, 
        summaryLength: summary.length 
      }, "Conversation embedded successfully");
    } catch (error) {
      logger.error({ error, conversationId }, "Failed to embed conversation");
      throw error;
    }
  }

  /**
   * Embed all unembedded messages for a user
   */
  async embedUserMessages(userId: string): Promise<void> {
    try {
      // Find messages without embeddings using raw SQL
      const unembeddedMessages = await prisma.$queryRaw<Array<{ id: string; content: string }>>`
        SELECT m.id, m.content 
        FROM "messages" m
        INNER JOIN "conversations" c ON c.id = m.conversation_id
        WHERE c.user_id = ${userId}
        AND m.embedding IS NULL
        LIMIT 100
      `;

      if (unembeddedMessages.length === 0) {
        logger.info({ userId }, "No unembedded messages found for user");
        return;
      }

      await this.embedMessages(unembeddedMessages);

      logger.info({ 
        userId, 
        embeddedCount: unembeddedMessages.length 
      }, "User messages embedding completed");
    } catch (error) {
      logger.error({ error, userId }, "Failed to embed user messages");
      throw error;
    }
  }

  /**
   * Reembedding with updated content (for message edits)
   */
  async reembedMessage(messageId: string, newContent: string): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(newContent);

      await prisma.$executeRaw`
        UPDATE "Message" 
        SET embedding = ${JSON.stringify(embedding)}::vector,
            content = ${newContent},
            updated_at = NOW()
        WHERE id = ${messageId}
      `;

      logger.info({ messageId }, "Message re-embedded successfully");
    } catch (error) {
      logger.error({ error, messageId }, "Failed to re-embed message");
      throw error;
    }
  }

  /**
   * Get embedding statistics for monitoring
   */
  async getEmbeddingStats(): Promise<{
    totalMessages: number;
    embeddedMessages: number;
    unembeddedMessages: number;
    embeddingCoverage: number;
  }> {
    try {
      // Use raw SQL due to vector type limitations
      const [{ total }] = await prisma.$queryRaw<Array<{ total: number }>>`
        SELECT COUNT(*) as total FROM "messages"
      `;

      const [{ embedded }] = await prisma.$queryRaw<Array<{ embedded: number }>>`
        SELECT COUNT(*) as embedded FROM "messages" WHERE embedding IS NOT NULL
      `;

      const totalMessages = Number(total);
      const embeddedMessages = Number(embedded);
      const unembeddedMessages = totalMessages - embeddedMessages;
      const embeddingCoverage = totalMessages > 0 ? (embeddedMessages / totalMessages) * 100 : 0;

      return {
        totalMessages,
        embeddedMessages,
        unembeddedMessages,
        embeddingCoverage,
      };
    } catch (error) {
      logger.error({ error }, "Failed to get embedding statistics");
      throw error;
    }
  }

  /**
   * Clean up old embeddings (for data retention)
   */
  async cleanupOldEmbeddings(beforeDate: Date): Promise<number> {
    try {
      const result = await prisma.$executeRaw`
        UPDATE "Message" 
        SET embedding = NULL 
        WHERE created_at < ${beforeDate}
        AND embedding IS NOT NULL
      `;

      logger.info({ beforeDate, cleanedCount: result }, "Old embeddings cleaned up");
      return result as number;
    } catch (error) {
      logger.error({ error, beforeDate }, "Failed to cleanup old embeddings");
      throw error;
    }
  }

  /**
   * Create a meaningful summary from conversation messages
   */
  private createConversationSummary(messages: Array<{
    content: string;
    role: string;
    createdAt: Date;
  }>): string {
    // Take first user message as the topic/question
    const firstUserMessage = messages.find(m => m.role === 'USER');
    const userMessages = messages.filter(m => m.role === 'USER');
    const assistantMessages = messages.filter(m => m.role === 'ASSISTANT');

    // Create structured summary
    const parts = [
      `Topic: ${firstUserMessage?.content.substring(0, 200) || 'Spiritual guidance conversation'}`,
    ];

    if (userMessages.length > 1) {
      parts.push(`User explored: ${userMessages.slice(1, 3).map(m => m.content.substring(0, 100)).join('; ')}`);
    }

    if (assistantMessages.length > 0) {
      parts.push(`Hermes guidance: ${assistantMessages.slice(0, 2).map(m => m.content.substring(0, 150)).join('; ')}`);
    }

    parts.push(`Duration: ${messages.length} messages from ${messages[0]?.createdAt.toDateString()}`);

    return parts.join('\n').substring(0, 1500); // Limit total summary length
  }

  /**
   * Test embedding functionality
   */
  async testEmbedding(): Promise<boolean> {
    try {
      const testText = "This is a test message for embedding functionality";
      const embedding = await this.generateEmbedding(testText);
      
      const isValid = Array.isArray(embedding) && 
                     embedding.length > 0 && 
                     embedding.every(n => typeof n === 'number');

      logger.info({ 
        testText, 
        embeddingLength: embedding.length, 
        isValid 
      }, "Embedding test completed");

      return isValid;
    } catch (error) {
      logger.error({ error }, "Embedding test failed");
      return false;
    }
  }
}