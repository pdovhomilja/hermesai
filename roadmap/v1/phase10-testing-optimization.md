# Phase 10: Testing & Performance Optimization

## Overview

This phase implements comprehensive testing strategies, performance optimizations, and monitoring to ensure the application runs smoothly, efficiently, and reliably at scale.

## Prerequisites

- Phases 1-9 completed
- Application functionally complete

## Phase Objectives

1. Implement unit and integration testing
2. Create E2E testing suite
3. Optimize database queries and indexes
4. Implement caching strategies
5. Optimize bundle size and loading performance
6. Add monitoring and error tracking
7. Performance testing and benchmarking

## Implementation Steps

### Step 1: Install Testing Dependencies

```bash
# Testing libraries
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm add -D jest jest-environment-jsdom @types/jest
pnpm add -D playwright @playwright/test
pnpm add -D vitest @vitejs/plugin-react

# Performance monitoring
pnpm add @vercel/analytics @vercel/speed-insights
pnpm add @sentry/nextjs

# Development tools
pnpm add -D @next/bundle-analyzer
pnpm add -D lighthouse
```

### Step 2: Jest Configuration

Create `jest.config.mjs`:

```javascript
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

export default createJestConfig(config);
```

Create `jest.setup.js`:

```javascript
import "@testing-library/jest-dom";

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/test",
  useSearchParams: () => new URLSearchParams(),
}));
```

### Step 3: Unit Tests for Core Components

Create `__tests__/components/chat/chat-interface.test.tsx`:

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInterface } from "@/components/chat/chat-interface";
import { SessionProvider } from "next-auth/react";

// Mock useChat hook
jest.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages: [
      { id: "1", role: "assistant", content: "Greetings, seeker" },
      { id: "2", role: "user", content: "Hello Hermes" },
    ],
    input: "",
    handleInputChange: jest.fn(),
    handleSubmit: jest.fn(),
    isLoading: false,
    error: null,
  }),
}));

describe("ChatInterface", () => {
  const mockSession = {
    user: {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
    },
    expires: "2024-12-31",
  };

  it("renders chat interface correctly", () => {
    render(
      <SessionProvider session={mockSession}>
        <ChatInterface />
      </SessionProvider>
    );

    expect(screen.getByText("Hermes Trismegistus")).toBeInTheDocument();
    expect(
      screen.getByText("Ancient wisdom for modern seekers")
    ).toBeInTheDocument();
  });

  it("displays messages correctly", () => {
    render(
      <SessionProvider session={mockSession}>
        <ChatInterface />
      </SessionProvider>
    );

    expect(screen.getByText("Greetings, seeker")).toBeInTheDocument();
    expect(screen.getByText("Hello Hermes")).toBeInTheDocument();
  });

  it("handles message submission", async () => {
    const user = userEvent.setup();

    render(
      <SessionProvider session={mockSession}>
        <ChatInterface />
      </SessionProvider>
    );

    const input = screen.getByPlaceholderText("Ask your question...");
    const submitButton = screen.getByRole("button", { name: /send/i });

    await user.type(input, "What is the meaning of life?");
    await user.click(submitButton);

    // Verify form submission logic
    await waitFor(() => {
      // Add assertions based on expected behavior
    });
  });
});
```

Create `__tests__/lib/ai/hermetic-principles.test.ts`:

```typescript
import { HERMETIC_PRINCIPLES } from "@/lib/ai/knowledge/hermetic-principles";
import { HermesResponseBuilder } from "@/lib/ai/context/response-builder";

describe("Hermetic Principles", () => {
  it("contains all seven principles", () => {
    const principles = Object.keys(HERMETIC_PRINCIPLES);

    expect(principles).toContain("mentalism");
    expect(principles).toContain("correspondence");
    expect(principles).toContain("vibration");
    expect(principles).toContain("polarity");
    expect(principles).toContain("rhythm");
    expect(principles).toContain("cause_effect");
    expect(principles).toContain("gender");
    expect(principles).toHaveLength(7);
  });

  it("each principle has required properties", () => {
    Object.values(HERMETIC_PRINCIPLES).forEach((principle) => {
      expect(principle).toHaveProperty("name");
      expect(principle).toHaveProperty("core");
      expect(principle).toHaveProperty("explanation");
      expect(principle).toHaveProperty("practices");
      expect(principle).toHaveProperty("applications");
    });
  });
});

describe("HermesResponseBuilder", () => {
  it("builds appropriate system prompt", () => {
    const builder = new HermesResponseBuilder({
      emotionalState: "anxious",
      spiritualLevel: "seeker",
      preferredLanguage: "en",
    });

    const prompt = builder.buildSystemPrompt();

    expect(prompt).toContain("Hermes Trismegistus");
    expect(prompt).toContain("seeker");
    expect(prompt).toContain("anxious");
  });

  it("generates appropriate greeting", () => {
    const builder = new HermesResponseBuilder({});

    const firstTime = builder.buildGreeting(true);
    const returning = builder.buildGreeting(false);

    expect(firstTime).toContain("Greetings");
    expect(returning).toContain("Welcome back");
  });
});
```

### Step 4: E2E Tests with Playwright

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

Create `e2e/auth-flow.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("user can sign up, verify email, and sign in", async ({ page }) => {
    // Go to sign up page
    await page.goto("/auth/signup");

    // Fill registration form
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "Test123!@#");
    await page.fill('input[name="name"]', "Test User");

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to verification page
    await expect(page).toHaveURL(/.*verify/);
    await expect(page.locator("text=check your email")).toBeVisible();

    // Simulate email verification (in real test, would check email)
    // ...

    // Sign in
    await page.goto("/auth/signin");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "Test123!@#");
    await page.click('button[type="submit"]');

    // Should be logged in and redirected
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("text=Welcome back")).toBeVisible();
  });
});
```

Create `e2e/chat-flow.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Chat with Hermes", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/auth/signin");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "Test123!@#");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard");
  });

  test("user can have a conversation with Hermes", async ({ page }) => {
    await page.goto("/chat");

    // Type a message
    const input = page.locator('textarea[placeholder*="Seek wisdom"]');
    await input.fill("What is the principle of mentalism?");

    // Send message
    await page.click('button[aria-label="Send message"]');

    // Wait for response
    await expect(page.locator("text=The All is Mind")).toBeVisible({
      timeout: 10000,
    });

    // Verify response contains hermetic wisdom
    const response = page.locator('[data-testid="assistant-message"]').last();
    await expect(response).toContainText("principle");
  });

  test("conversation is saved and searchable", async ({ page }) => {
    // Have a conversation
    await page.goto("/chat");
    await page.fill("textarea", "Tell me about transformation");
    await page.click('button[aria-label="Send message"]');

    // Wait for response
    await page.waitForSelector('[data-testid="assistant-message"]');

    // Go to conversation history
    await page.goto("/conversations");

    // Search for the conversation
    await page.fill(
      'input[placeholder="Search conversations"]',
      "transformation"
    );

    // Verify conversation appears in results
    await expect(
      page.locator("text=Tell me about transformation")
    ).toBeVisible();
  });
});
```

### Step 5: Database Query Optimization

Create `lib/db/optimizations.ts`:

```typescript
import { prisma } from "./client";

// Add database indexes
export async function createIndexes() {
  await prisma.$executeRaw`
    -- Optimize conversation queries
    CREATE INDEX IF NOT EXISTS idx_conversations_user_date 
    ON "Conversation" ("userId", "createdAt" DESC);
    
    -- Optimize message search
    CREATE INDEX IF NOT EXISTS idx_messages_conversation 
    ON "Message" ("conversationId", "createdAt");
    
    -- Optimize vector search
    CREATE INDEX IF NOT EXISTS idx_messages_embedding 
    USING ivfflat ("embedding" vector_cosine_ops)
    WITH (lists = 100);
    
    -- Optimize subscription lookups
    CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status 
    ON "Subscription" ("userId", "status");
    
    -- Optimize insight queries
    CREATE INDEX IF NOT EXISTS idx_insights_user_significance 
    ON "UserInsight" ("userId", "significance", "createdAt" DESC);
  `;
}

// Query optimization helpers
export const optimizedQueries = {
  // Use select to only fetch needed fields
  getConversationList: (userId: string) =>
    prisma.conversation.findMany({
      where: { userId, status: "ACTIVE" },
      select: {
        id: true,
        title: true,
        lastMessageAt: true,
        _count: { select: { messages: true } },
      },
      orderBy: { lastMessageAt: "desc" },
      take: 20,
    }),

  // Use pagination for large datasets
  getMessagesPaginated: (conversationId: string, cursor?: string) =>
    prisma.message.findMany({
      where: { conversationId },
      take: 50,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "asc" },
    }),

  // Use aggregation efficiently
  getUserStats: (userId: string) =>
    prisma.$transaction([
      prisma.conversation.count({ where: { userId } }),
      prisma.message.count({
        where: { conversation: { userId } },
      }),
      prisma.userInsight.count({ where: { userId } }),
    ]),
};
```

### Step 6: Caching Strategy

Create `lib/cache/redis-cache.ts`:

```typescript
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class CacheService {
  private static instance: CacheService;
  private defaultTTL = 3600; // 1 hour

  static getInstance(): CacheService {
    if (!this.instance) {
      this.instance = new CacheService();
    }
    return this.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data as T;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await redis.set(key, value, {
        ex: ttl || this.defaultTTL,
      });
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error("Cache delete error:", error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Cache invalidate error:", error);
    }
  }

  // Cache helpers for specific data types
  async getCachedOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const fresh = await fetcher();
    await this.set(key, fresh, ttl);
    return fresh;
  }
}

// Usage example in API route
export async function getCachedUserProfile(userId: string) {
  const cache = CacheService.getInstance();

  return cache.getCachedOrFetch(
    `user:${userId}:profile`,
    async () => {
      return prisma.user.findUnique({
        where: { id: userId },
        include: {
          spiritualProfile: true,
          preferences: true,
        },
      });
    },
    600 // 10 minutes
  );
}
```

### Step 7: Bundle Optimization

Update `next.config.ts`:

```typescript
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  // Enable SWC minification
  swcMinify: true,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },

  // Optimize fonts
  optimizeFonts: true,

  // Bundle analyzer
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE === "true") {
      const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          reportFilename: isServer
            ? "../analyze/server.html"
            : "./analyze/client.html",
        })
      );
    }

    // Tree shaking optimization
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
    };

    return config;
  },

  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
};

// Wrap with Sentry
export default withSentryConfig(nextConfig, {
  silent: true,
  org: "ialchemist",
  project: "hermes-app",
});
```

### Step 8: Performance Monitoring

Create `lib/monitoring/performance.ts`:

```typescript
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import * as Sentry from "@sentry/nextjs";

// Initialize Sentry
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

// Custom performance metrics
export class PerformanceMonitor {
  private static markers: Map<string, number> = new Map();

  static mark(name: string) {
    this.markers.set(name, performance.now());
  }

  static measure(name: string, startMark: string) {
    const start = this.markers.get(startMark);
    if (!start) return;

    const duration = performance.now() - start;

    // Log to console in dev
    if (process.env.NODE_ENV === "development") {
      console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    }

    // Send to monitoring in production
    if (process.env.NODE_ENV === "production") {
      Sentry.addBreadcrumb({
        category: "performance",
        message: name,
        level: "info",
        data: { duration },
      });
    }

    return duration;
  }

  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - start;

      this.logMetric(name, duration);

      return result;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { operation: name },
      });
      throw error;
    }
  }

  private static logMetric(name: string, duration: number) {
    if (duration > 1000) {
      Sentry.captureMessage(`Slow operation: ${name}`, {
        level: "warning",
        extra: { duration },
      });
    }
  }
}
```

### Step 9: Load Testing

Create `load-tests/chat-load.js`:

```javascript
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 }, // Ramp up to 10 users
    { duration: "1m", target: 10 }, // Stay at 10 users
    { duration: "30s", target: 50 }, // Ramp up to 50 users
    { duration: "2m", target: 50 }, // Stay at 50 users
    { duration: "30s", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests under 500ms
    http_req_failed: ["rate<0.1"], // Error rate under 10%
  },
};

export default function () {
  // Login
  const loginRes = http.post("http://localhost:3000/api/auth/signin", {
    email: "test@example.com",
    password: "Test123!@#",
  });

  check(loginRes, {
    "login successful": (r) => r.status === 200,
  });

  const authToken = loginRes.json("token");

  // Send chat message
  const chatRes = http.post(
    "http://localhost:3000/api/chat",
    JSON.stringify({
      messages: [{ role: "user", content: "What is wisdom?" }],
    }),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  check(chatRes, {
    "chat response received": (r) => r.status === 200,
    "response time OK": (r) => r.timings.duration < 1000,
  });

  sleep(1);
}
```

### Step 10: Lighthouse CI Configuration

Create `.lighthouserc.js`:

```javascript
module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm build && pnpm start",
      url: [
        "http://localhost:3000",
        "http://localhost:3000/chat",
        "http://localhost:3000/pricing",
      ],
      numberOfRuns: 3,
    },
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "first-contentful-paint": ["error", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
```

### Step 11: Update Package Scripts

Update `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:load": "k6 run load-tests/chat-load.js",
    "analyze": "ANALYZE=true pnpm build",
    "lighthouse": "lhci autorun",
    "db:optimize": "tsx scripts/optimize-db.ts",
    "cache:clear": "tsx scripts/clear-cache.ts",
    "monitor": "tsx scripts/monitor-performance.ts"
  }
}
```

## Verification Steps

1. Run unit tests:

```bash
pnpm test
```

2. Run E2E tests:

```bash
pnpm test:e2e
```

3. Check test coverage:

```bash
pnpm test:coverage
```

4. Run load tests:

```bash
pnpm test:load
```

5. Analyze bundle:

```bash
pnpm analyze
```

6. Run Lighthouse audit:

```bash
pnpm lighthouse
```

7. Check database query performance
8. Verify caching is working

9. Run linting and build:

```bash
pnpm lint
pnpm build
```

## Success Criteria

- [ ] Unit test coverage > 70%
- [ ] All E2E tests passing
- [ ] Load tests meet performance thresholds
- [ ] Bundle size < 500KB (initial)
- [ ] Lighthouse scores > 90
- [ ] Database queries < 100ms
- [ ] Cache hit rate > 80%
- [ ] No memory leaks detected
- [ ] Error rate < 1%
- [ ] No linting errors
- [ ] Build completes successfully

## Next Phase

Phase 11 will implement production deployment and monitoring setup.
