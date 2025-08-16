import { prisma } from "./client";

export interface VectorSearchOptions {
  embedding: number[];
  limit?: number;
  threshold?: number;
}

export async function searchSimilarMessages(
  userId: string,
  options: VectorSearchOptions
) {
  const { embedding, limit = 10, threshold = 0.7 } = options;

  // Using Prisma's raw query for PostgreSQL vector similarity search
  const results = await prisma.$queryRaw<
    Array<{
      id: string;
      content: string;
      conversation_id: string;
      created_at: Date;
      similarity: number;
    }>
  >`
    SELECT 
      m.id,
      m.content,
      m.conversation_id,
      m.created_at,
      1 - (m.embedding <=> ${JSON.stringify(embedding)}::vector) as similarity
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE 
      c.user_id = ${userId}
      AND m.embedding IS NOT NULL
      AND 1 - (m.embedding <=> ${JSON.stringify(embedding)}::vector) > ${threshold}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;

  return results;
}

export async function storeMessageEmbedding(
  messageId: string,
  embedding: number[]
) {
  // Use raw query for updating vector embeddings
  return await prisma.$executeRaw`
    UPDATE messages 
    SET embedding = ${JSON.stringify(embedding)}::vector 
    WHERE id = ${messageId}
  `;
}

export async function searchSimilarInsights(
  userId: string,
  options: VectorSearchOptions
) {
  const { embedding, limit = 5, threshold = 0.8 } = options;

  // For now, return basic insights without embeddings
  // This can be enhanced when insight embeddings are implemented
  return await prisma.userInsight.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function initializeVectorExtension() {
  // Ensure pgvector extension is enabled
  await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector`;
}