# Phase 3: Vercel AI SDK v5 Integration & Basic Chat

## Overview

This phase implements the core AI chat functionality using Vercel AI SDK v5, establishing the foundation for Hermes Trismegistus conversations. We'll create a robust streaming chat interface with message persistence and basic AI integration.

## Prerequisites

- Phase 1 completed (Database infrastructure)
- Phase 2 completed (Authentication system)
- OpenAI API key available

## Phase Objectives

1. Install and configure Vercel AI SDK v5
2. Set up OpenAI provider with GPT-5 model
3. Create streaming chat interface with React hooks
4. Implement message persistence in database
5. Add conversation management (create, list, delete)
6. Set up AI response streaming
7. Implement basic error handling and retry logic

## Implementation Steps

### Step 1: Install AI SDK Dependencies

```bash
pnpm add ai@5.0.0
pnpm add @ai-sdk/react@2.0.0
pnpm add @ai-sdk/openai@2.0.0
pnpm add @ai-sdk/ui-utils@1.0.0
pnpm add openai-edge
pnpm add eventsource-parser
```

### Step 2: Environment Configuration

Update `.env.local`:

```env
# AI Configuration
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-5-latest"
OPENAI_MODEL_FALLBACK="gpt-4o"
AI_MAX_TOKENS=4000
AI_TEMPERATURE=0.7
AI_STREAMING_ENABLED="true"
AI_RATE_LIMIT_REQUESTS=100
AI_RATE_LIMIT_WINDOW=60000
```

### Step 3: AI Provider Configuration

Create `lib/ai/provider.ts`:

```typescript
import { openai } from "@ai-sdk/openai";
import { experimental_createProviderRegistry as createProviderRegistry } from "ai";

// Create provider registry for model management
export const registry = createProviderRegistry({
  openai,
});

// Model configurations
export const models = {
  primary: openai("gpt-5-latest"),
  fallback: openai("gpt-4o"),
  thinking: openai("gpt-5-thinking"), // For deep philosophical analysis
};

export const defaultModel = models.primary;

// AI configuration
export const aiConfig = {
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || "4000"),
  temperature: parseFloat(process.env.AI_TEMPERATURE || "0.7"),
  streamingEnabled: process.env.AI_STREAMING_ENABLED === "true",
  models: {
    primary: process.env.OPENAI_MODEL || "gpt-5-latest",
    fallback: process.env.OPENAI_MODEL_FALLBACK || "gpt-4o",
  },
  rateLimit: {
    requests: parseInt(process.env.AI_RATE_LIMIT_REQUESTS || "100"),
    window: parseInt(process.env.AI_RATE_LIMIT_WINDOW || "60000"),
  },
};
```

### Step 4: Chat API Route

Create `app/api/chat/route.ts`:

```typescript
import { streamText, generateText, Message as AIMessage } from "ai";
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

    // Check user's subscription limits
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
      include: {
        usageRecords: {
          where: {
            date: new Date().toISOString().split("T")[0],
            metric: "CONVERSATIONS",
          },
        },
      },
    });

    // TODO: Implement subscription limit checking

    // Prepare system message (will be enhanced in Phase 4)
    const systemMessage: AIMessage = {
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
        maxTokens: aiConfig.maxTokens,
        temperature: aiConfig.temperature,
        onFinish: async ({ text, usage }) => {
          // Save messages to database
          await saveMessages(conversation!.id, messages, text, session.user.id);

          // Log usage
          logger.info("AI streaming completed", {
            conversationId: conversation!.id,
            usage,
            model: model,
          });
        },
      });

      return result.toDataStreamResponse();
    } else {
      // Non-streaming response
      const result = await generateText({
        model: selectedModel,
        messages: allMessages,
        maxTokens: aiConfig.maxTokens,
        temperature: aiConfig.temperature,
      });

      // Save messages to database
      await saveMessages(
        conversation!.id,
        messages,
        result.text,
        session.user.id
      );

      logger.info("AI generation completed", {
        conversationId: conversation!.id,
        usage: result.usage,
        model: model,
      });

      return Response.json({
        content: result.text,
        conversationId: conversation!.id,
      });
    }
  } catch (error) {
    logger.error("Chat API error:", error);

    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid request", details: error.errors },
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
  userMessages: AIMessage[],
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
          content: lastUserMessage.content,
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

    // Update usage records
    await prisma.usageRecord.upsert({
      where: {
        subscriptionId_metric_date: {
          subscriptionId: userId, // This should be subscription ID
          metric: "MESSAGES",
          date: new Date().toISOString().split("T")[0],
        },
      },
      update: {
        count: { increment: 2 }, // User message + assistant response
      },
      create: {
        subscriptionId: userId, // This should be subscription ID
        metric: "MESSAGES",
        count: 2,
        date: new Date().toISOString().split("T")[0],
      },
    });
  } catch (error) {
    logger.error("Failed to save messages:", error);
    throw error;
  }
}
```

### Step 5: Chat Interface Component

Create `components/chat/chat-interface.tsx`:

```typescript
"use client";

import { useChat } from "@ai-sdk/react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  conversationId?: string;
  className?: string;
}

export function ChatInterface({
  conversationId: initialConversationId,
  className,
}: ChatInterfaceProps) {
  const { data: session } = useSession();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [conversationId, setConversationId] = useState(initialConversationId);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
  } = useChat({
    api: "/api/chat",
    body: {
      conversationId,
    },
    onResponse: (response) => {
      // Extract conversation ID from response headers if new conversation
      const newConversationId = response.headers.get("X-Conversation-Id");
      if (newConversationId && !conversationId) {
        setConversationId(newConversationId);
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSubmit(e);
  };

  return (
    <Card className={cn("flex flex-col h-[600px]", className)}>
      {/* Header */}
      <div className="border-b p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="font-semibold">Hermes Trismegistus</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Ancient wisdom for modern seekers
        </p>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Begin your journey with a question...</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.role === "assistant" && (
                  <div className="font-semibold text-sm mb-1 opacity-70">
                    Hermes
                  </div>
                )}
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}

          {error && (
            <div className="text-center">
              <p className="text-sm text-destructive">
                {error.message || "Something went wrong"}
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={() => reload()}
                className="mt-2"
              >
                Try again
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleFormSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask your question..."
            disabled={isLoading || !session}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim() || !session}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        {!session && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Please sign in to start chatting
          </p>
        )}
      </form>
    </Card>
  );
}
```

### Step 6: Conversation Management API

Create `app/api/conversations/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { z } from "zod";
import logger from "@/lib/logger";

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
        status: status as any,
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
        status: status as any,
      },
    });

    return NextResponse.json({
      conversations,
      total,
      limit,
      offset,
    });
  } catch (error) {
    logger.error("Failed to fetch conversations:", error);
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

    logger.info("Created new conversation", {
      conversationId: conversation.id,
      userId: session.user.id,
    });

    return NextResponse.json(conversation);
  } catch (error) {
    logger.error("Failed to create conversation:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
```

Create `app/api/conversations/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import logger from "@/lib/logger";

interface Params {
  params: { id: string };
}

// GET: Get conversation with messages
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

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
    logger.error("Failed to fetch conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

// DELETE: Delete conversation
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

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

    logger.info("Deleted conversation", {
      conversationId: params.id,
      userId: session.user.id,
    });

    return NextResponse.json({ message: "Conversation deleted" });
  } catch (error) {
    logger.error("Failed to delete conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
```

### Step 7: Chat Page

Create `app/[locale]/chat/page.tsx`:

```typescript
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ConversationList } from "@/components/chat/conversation-list";

export default async function ChatPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with conversation list */}
        <div className="lg:col-span-1">
          <ConversationList />
        </div>

        {/* Main chat interface */}
        <div className="lg:col-span-3">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
```

### Step 8: Conversation List Component

Create `components/chat/conversation-list.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface Conversation {
  id: string;
  title: string;
  lastMessageAt: Date | null;
  _count: {
    messages: number;
  };
}

export function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const newConversation = await res.json();
        router.push(`/chat/${newConversation.id}`);
        fetchConversations();
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchConversations();
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <div className="p-4 border-b">
        <Button onClick={createNewConversation} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          New Conversation
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="group relative p-3 rounded-lg hover:bg-muted cursor-pointer"
                onClick={() => router.push(`/chat/${conversation.id}`)}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {conversation._count.messages} messages
                      {conversation.lastMessageAt && (
                        <>
                          {" "}
                          • {formatDistanceToNow(
                            new Date(conversation.lastMessageAt),
                            { addSuffix: true }
                          )}
                        </>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
```

### Step 9: Error Handling and Retry Logic

Create `lib/ai/error-handler.ts`:

```typescript
import logger from "@/lib/logger";

export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "AIError";
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (error instanceof AIError && !error.retryable) {
        throw error;
      }

      // Rate limit error - wait longer
      if ((error as any)?.status === 429) {
        const retryAfter = (error as any)?.headers?.["retry-after"];
        const waitTime = retryAfter
          ? parseInt(retryAfter) * 1000
          : delay * Math.pow(2, i);

        logger.warn(`Rate limited, retrying after ${waitTime}ms`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      // Other errors - exponential backoff
      if (i < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, i);
        logger.warn(`AI request failed, retrying in ${waitTime}ms`, {
          attempt: i + 1,
          error: error?.message,
        });
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new AIError("Max retries exceeded", "MAX_RETRIES", false);
}
```

### Step 10: Rate Limiting

Create `lib/ai/rate-limiter.ts`:

```typescript
import { RateLimiterMemory } from "rate-limiter-flexible";
import { aiConfig } from "./provider";

const rateLimiter = new RateLimiterMemory({
  points: aiConfig.rateLimit.requests,
  duration: aiConfig.rateLimit.window / 1000, // Convert to seconds
});

export async function checkRateLimit(userId: string): Promise<void> {
  try {
    await rateLimiter.consume(userId);
  } catch (error) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }
}

export async function getRateLimitInfo(userId: string) {
  try {
    const res = await rateLimiter.get(userId);
    return {
      remaining: res
        ? aiConfig.rateLimit.requests - res.consumedPoints
        : aiConfig.rateLimit.requests,
      reset: res ? new Date(Date.now() + res.msBeforeNext) : new Date(),
    };
  } catch {
    return {
      remaining: aiConfig.rateLimit.requests,
      reset: new Date(),
    };
  }
}
```

## Verification Steps

1. Test AI provider connection:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: <session-cookie>" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

2. Test streaming chat interface
3. Verify message persistence in database
4. Test conversation management (create, list, delete)
5. Test error handling and retry logic

6. Run linting and build:

```bash
pnpm lint
pnpm build
```

## Success Criteria

- [ ] Vercel AI SDK v5 properly configured
- [ ] Chat API endpoint working with streaming
- [ ] Messages persist to database
- [ ] Chat interface displays streaming responses
- [ ] Conversation management working
- [ ] Error handling and retry logic functional
- [ ] Rate limiting in place
- [ ] No linting errors
- [ ] Build completes successfully

## Next Phase

Phase 4 will develop the Hermes Trismegistus persona with comprehensive hermetic knowledge base and personality system.
