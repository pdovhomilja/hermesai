# Phase 1: Core Infrastructure & Database Setup

## Overview

This phase establishes the foundational infrastructure for IALchemist.app, including database schema design with PostgreSQL & PGVector, environment configuration, and core utilities.

## Prerequisites

- Next.js 15.4.6 project initialized ✅
- PostgreSQL database accessible (local or cloud)
- Node.js 20+ installed

## Phase Objectives

1. Set up PostgreSQL with PGVector extension
2. Design and implement comprehensive database schema
3. Configure Prisma ORM with all required models
4. Set up environment variables and configuration
5. Create database utilities and connection pooling
6. Implement base error handling and logging

## Implementation Steps

### Step 1: Install Required Dependencies

```bash
pnpm add @prisma/client@6.14.0 prisma@6.14.0
pnpm add pgvector
pnpm add @neondatabase/serverless
pnpm add winston pino pino-pretty
pnpm add dotenv zod
pnpm add -D @types/node
```

### Step 2: Environment Configuration

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ialchemist_dev"
DIRECT_DATABASE_URL="postgresql://user:password@localhost:5432/ialchemist_dev"

# App Configuration
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="IALchemist"

# Logging
LOG_LEVEL="debug"
```

Create `.env.production`:

```env
# Production environment variables (to be filled during deployment)
DATABASE_URL=""
DIRECT_DATABASE_URL=""
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://ialchemist.app"
```

### Step 3: Database Schema Design

Update `prisma/schema.prisma`:

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions", "fullTextSearch"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  directUrl  = env("DIRECT_DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

// User Management
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  emailVerified     DateTime?
  password          String?
  name              String?
  image             String?
  preferredLanguage String    @default("en")
  timezone          String    @default("UTC")
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  lastActiveAt      DateTime?

  // Relations
  accounts          Account[]
  sessions          Session[]
  conversations     Conversation[]
  insights          UserInsight[]
  subscriptions     Subscription[]
  spiritualProfile  SpiritualProfile?
  preferences       UserPreference?

  @@index([email])
  @@index([lastActiveAt])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expires])
}

// Conversation System
model Conversation {
  id            String   @id @default(cuid())
  userId        String
  title         String?
  summary       String?  @db.Text
  language      String   @default("en")
  status        ConversationStatus @default(ACTIVE)
  metadata      Json?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastMessageAt DateTime?

  // Relations
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages      Message[]
  topics        ConversationTopic[]
  insights      UserInsight[]

  @@index([userId, createdAt])
  @@index([userId, status])
  @@index([lastMessageAt])
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  role           MessageRole
  content        String   @db.Text
  metadata       Json?

  // Vector embedding for semantic search
  embedding      Unsupported("vector(1536)")?

  // Hermetic context
  hermeticPrinciples String[]
  emotionalState     String?

  createdAt      DateTime @default(now())

  // Relations
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId, createdAt])
  @@index([role])
}

// Knowledge & Topics
model Topic {
  id               String   @id @default(cuid())
  name             String   @unique
  nameTranslations Json     // {"en": "Transformation", "cs": "Transformace", ...}
  description      String?  @db.Text
  hermeticPrinciple String?
  category         TopicCategory

  // Relations
  conversations    ConversationTopic[]

  @@index([category])
  @@index([hermeticPrinciple])
}

model ConversationTopic {
  id             String   @id @default(cuid())
  conversationId String
  topicId        String
  relevanceScore Float    @default(1.0)
  createdAt      DateTime @default(now())

  // Relations
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  topic          Topic @relation(fields: [topicId], references: [id])

  @@unique([conversationId, topicId])
  @@index([topicId])
}

// Spiritual Journey & Insights
model UserInsight {
  id             String   @id @default(cuid())
  userId         String
  conversationId String?
  content        String   @db.Text
  type           InsightType
  significance   SignificanceLevel
  metadata       Json?
  createdAt      DateTime @default(now())

  // Relations
  user           User @relation(fields: [userId], references: [id], onDelete: Cascade)
  conversation   Conversation? @relation(fields: [conversationId], references: [id], onDelete: SetNull)

  @@index([userId, type])
  @@index([userId, createdAt])
  @@index([significance])
}

model SpiritualProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  journeyStartDate  DateTime @default(now())
  currentLevel      SpiritualLevel @default(SEEKER)
  principlesStudied String[]
  practicesCompleted Int     @default(0)
  transformationScore Float  @default(0)
  metadata          Json?
  updatedAt         DateTime @updatedAt

  // Relations
  user              User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Subscription & Billing
model Subscription {
  id                String   @id @default(cuid())
  userId            String
  stripeCustomerId  String?  @unique
  stripeSubscriptionId String? @unique
  plan              SubscriptionPlan
  status            SubscriptionStatus
  currentPeriodStart DateTime
  currentPeriodEnd  DateTime
  cancelAtPeriodEnd Boolean @default(false)
  metadata          Json?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  user              User @relation(fields: [userId], references: [id], onDelete: Cascade)
  usageRecords      UsageRecord[]

  @@index([userId])
  @@index([status])
  @@index([stripeCustomerId])
}

model UsageRecord {
  id             String   @id @default(cuid())
  subscriptionId String
  metric         UsageMetric
  count          Int
  date           DateTime @db.Date
  metadata       Json?
  createdAt      DateTime @default(now())

  // Relations
  subscription   Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)

  @@unique([subscriptionId, metric, date])
  @@index([date])
}

// User Preferences
model UserPreference {
  id                String   @id @default(cuid())
  userId            String   @unique
  theme             String   @default("ancient")
  fontSize          String   @default("medium")
  aiVerbosity       VerbosityLevel @default(BALANCED)
  notificationsEnabled Boolean @default(true)
  emailDigest       EmailDigestFrequency @default(WEEKLY)
  dataRetention     Int      @default(0) // 0 = unlimited, otherwise days
  exportFormat      String   @default("pdf")
  metadata          Json?
  updatedAt         DateTime @updatedAt

  // Relations
  user              User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Enums
enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

enum ConversationStatus {
  ACTIVE
  ARCHIVED
  DELETED
}

enum TopicCategory {
  HERMETIC_PRINCIPLE
  LIFE_CHALLENGE
  DAILY_PRACTICE
  TRANSFORMATION
  PHILOSOPHY
  RITUAL
  OTHER
}

enum InsightType {
  BREAKTHROUGH
  REALIZATION
  CHALLENGE
  PRACTICE
  TRANSFORMATION
  MILESTONE
}

enum SignificanceLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum SpiritualLevel {
  SEEKER
  STUDENT
  ADEPT
  MASTER
}

enum SubscriptionPlan {
  FREE_TRIAL
  SEEKER
  ADEPT
  MASTER
}

enum SubscriptionStatus {
  TRIAL
  ACTIVE
  PAST_DUE
  CANCELED
  PAUSED
}

enum UsageMetric {
  CONVERSATIONS
  MESSAGES
  TOKENS
  EXPORTS
  API_CALLS
}

enum VerbosityLevel {
  CONCISE
  BALANCED
  DETAILED
  EXTENSIVE
}

enum EmailDigestFrequency {
  NEVER
  DAILY
  WEEKLY
  MONTHLY
}
```

### Step 4: Database Utilities

Create `lib/db/client.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
```

Create `lib/db/vector.ts`:

```typescript
import { sql } from "@neondatabase/serverless";

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

  const query = sql`
    SELECT 
      m.id,
      m.content,
      m.conversation_id,
      m.created_at,
      1 - (m.embedding <=> $1::vector) as similarity
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE 
      c.user_id = $2
      AND m.embedding IS NOT NULL
      AND 1 - (m.embedding <=> $1::vector) > $3
    ORDER BY similarity DESC
    LIMIT $4
  `;

  return query(JSON.stringify(embedding), userId, threshold, limit);
}
```

Create `lib/logger.ts`:

```typescript
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  serializers: {
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});

export default logger;
```

Create `lib/config.ts`:

```typescript
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().url(),
  DIRECT_DATABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().default("IALchemist"),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
});

export const config = envSchema.parse(process.env);

export type Config = z.infer<typeof envSchema>;
```

### Step 5: Database Migrations

Create migration script `scripts/migrate.ts`:

```typescript
import { execSync } from "child_process";
import logger from "../lib/logger";

async function migrate() {
  try {
    logger.info("Running database migrations...");

    // Generate Prisma client
    execSync("pnpm prisma generate", { stdio: "inherit" });

    // Run migrations
    execSync("pnpm prisma migrate deploy", { stdio: "inherit" });

    // Enable pgvector extension
    execSync(
      `pnpm prisma db execute --sql "CREATE EXTENSION IF NOT EXISTS vector"`,
      {
        stdio: "inherit",
      }
    );

    logger.info("Database migrations completed successfully");
  } catch (error) {
    logger.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
```

Update `package.json` scripts:

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "tsx scripts/seed.ts",
    "db:reset": "prisma migrate reset",
    "db:studio": "prisma studio"
  }
}
```

### Step 6: Type Definitions

Create `types/database.ts`:

```typescript
import {
  Prisma,
  User,
  Conversation,
  Message,
  Subscription,
} from "@prisma/client";

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    spiritualProfile: true;
    preferences: true;
    subscriptions: true;
  };
}>;

export type ConversationWithMessages = Prisma.ConversationGetPayload<{
  include: {
    messages: true;
    topics: {
      include: {
        topic: true;
      };
    };
  };
}>;

export type SubscriptionWithUsage = Prisma.SubscriptionGetPayload<{
  include: {
    usageRecords: true;
  };
}>;

export interface DatabaseError extends Error {
  code?: string;
  meta?: Record<string, unknown>;
}
```

### Step 7: Error Handling

Create `lib/errors.ts`:

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 500, code || "DATABASE_ERROR");
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export function handlePrismaError(error: any): AppError {
  if (error.code === "P2002") {
    return new DatabaseError("Duplicate entry found", "DUPLICATE_ENTRY");
  }
  if (error.code === "P2025") {
    return new DatabaseError("Record not found", "NOT_FOUND");
  }
  return new DatabaseError(error.message, error.code);
}
```

## Verification Steps

1. Run Prisma generation:

```bash
pnpm prisma generate
```

2. Create and run initial migration:

```bash
pnpm prisma migrate dev --name initial_schema
```

3. Verify pgvector extension:

```bash
pnpm prisma db execute --sql "SELECT * FROM pg_extension WHERE extname = 'vector'"
```

4. Test database connection:

```bash
pnpm prisma db pull
```

5. Run linting and build:

```bash
pnpm lint
pnpm build
```

## Success Criteria

- [ ] PostgreSQL database connected successfully
- [ ] PGVector extension enabled
- [ ] All Prisma models generated without errors
- [ ] Database migrations executed successfully
- [ ] Environment variables properly configured
- [ ] Logger functioning in both dev and prod modes
- [ ] No linting errors
- [ ] Build completes successfully

## Next Phase

Phase 2 will enhance the authentication system using the database schema created in this phase, implementing secure user registration, email verification, and session management.
