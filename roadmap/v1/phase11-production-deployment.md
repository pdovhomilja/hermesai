# Phase 11: Production Deployment & Launch

## Overview

This final phase covers production deployment to Vercel, domain configuration, security hardening, monitoring setup, and launch preparation for the IALchemist.app.

## Prerequisites

- Phases 1-10 completed
- All tests passing
- Domain registered (ialchemist.app)
- Production accounts created (Vercel, database, services)

## Phase Objectives

1. Configure production environment
2. Set up production database
3. Deploy to Vercel
4. Configure domain and SSL
5. Set up monitoring and alerts
6. Implement security best practices
7. Create launch checklist
8. Post-launch monitoring

## Implementation Steps

### Step 1: Production Environment Setup

Create `.env.production`:

```env
# Production Database
DATABASE_URL="postgresql://[user]:[password]@[host]/ialchemist_prod?sslmode=require"
DIRECT_DATABASE_URL="postgresql://[user]:[password]@[host]/ialchemist_prod?sslmode=require"

# Authentication
NEXTAUTH_URL="https://ialchemist.app"
NEXTAUTH_SECRET="[generate-strong-secret-min-32-chars]"

# OpenAI
OPENAI_API_KEY="sk-prod-..."
OPENAI_MODEL="gpt-5-latest"
OPENAI_MODEL_FALLBACK="gpt-4o"

# Stripe Production
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY="re_live_..."
EMAIL_FROM="noreply@ialchemist.app"

# Redis Cache
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Monitoring
SENTRY_DSN="https://...@sentry.io/..."
VERCEL_ANALYTICS_ID="..."

# Security
RATE_LIMIT_ENABLED="true"
CORS_ORIGIN="https://ialchemist.app"
CSP_ENABLED="true"

# App Configuration
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://ialchemist.app"
NEXT_PUBLIC_APP_NAME="IALchemist"
```

### Step 2: Database Migration Script

Create `scripts/migrate-production.ts`:

```typescript
import { execSync } from "child_process";
import { prisma } from "@/lib/db/client";
import logger from "@/lib/logger";

async function migrateProduction() {
  try {
    logger.info("Starting production database migration...");

    // Backup current database
    logger.info("Creating database backup...");
    execSync(`pg_dump ${process.env.DATABASE_URL} > backup-${Date.now()}.sql`, {
      stdio: "inherit",
    });

    // Run Prisma migrations
    logger.info("Running Prisma migrations...");
    execSync("prisma migrate deploy", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    });

    // Enable pgvector extension
    logger.info("Enabling pgvector extension...");
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector`;

    // Create indexes
    logger.info("Creating database indexes...");
    await createProductionIndexes();

    // Verify migration
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    logger.info("Migration completed successfully");
    logger.info("Tables:", tables);
  } catch (error) {
    logger.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function createProductionIndexes() {
  await prisma.$executeRawUnsafe(`
    -- Performance indexes
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_user_date 
    ON "Conversation" ("userId", "createdAt" DESC);
    
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_created 
    ON "Message" ("conversationId", "createdAt");
    
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_embedding 
    USING ivfflat ("embedding" vector_cosine_ops) 
    WITH (lists = 100);
    
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user_status 
    ON "Subscription" ("userId", "status");
    
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insights_user_date 
    ON "UserInsight" ("userId", "createdAt" DESC);
    
    -- Full text search indexes
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_content_search 
    ON "Message" USING gin(to_tsvector('english', content));
    
    -- Partial indexes for common queries
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_subscriptions 
    ON "Subscription" ("userId") 
    WHERE status IN ('ACTIVE', 'TRIAL');
  `);
}

migrateProduction();
```

### Step 3: Vercel Configuration

Create `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "prisma generate && pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "regions": ["iad1"],
  "functions": {
    "app/api/chat/route.ts": {
      "maxDuration": 30
    },
    "app/api/webhooks/stripe/route.ts": {
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-store, max-age=0"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/robots.txt",
      "destination": "/api/robots"
    },
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    }
  ],
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/backup",
      "schedule": "0 3 * * *"
    }
  ]
}
```

### Step 4: Security Headers & CSP

Create `lib/security/headers.ts`:

```typescript
export const securityHeaders = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.openai.com https://api.stripe.com wss://*.vercel.live",
    "frame-src 'self' https://checkout.stripe.com",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; "),
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(self)",
};
```

Update `middleware.ts` to include security headers:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { securityHeaders } from "@/lib/security/headers";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  response.headers.set("x-nonce", nonce);

  return response;
}
```

### Step 5: Deployment Script

Create `scripts/deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Starting IALchemist Production Deployment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check environment
if [ "$1" != "production" ]; then
  echo -e "${RED}❌ Please confirm production deployment: ./deploy.sh production${NC}"
  exit 1
fi

echo -e "${YELLOW}📋 Pre-deployment checklist...${NC}"

# Run tests
echo "🧪 Running tests..."
pnpm test || { echo -e "${RED}❌ Tests failed${NC}"; exit 1; }

# Run E2E tests
echo "🎭 Running E2E tests..."
pnpm test:e2e --reporter=list || { echo -e "${RED}❌ E2E tests failed${NC}"; exit 1; }

# Check lint
echo "🔍 Running lint..."
pnpm lint || { echo -e "${RED}❌ Linting failed${NC}"; exit 1; }

# Build locally to verify
echo "🔨 Test build..."
pnpm build || { echo -e "${RED}❌ Build failed${NC}"; exit 1; }

# Check bundle size
echo "📦 Checking bundle size..."
BUNDLE_SIZE=$(du -sh .next | cut -f1)
echo "Bundle size: $BUNDLE_SIZE"

echo -e "${GREEN}✅ All checks passed!${NC}"

# Deploy to Vercel
echo -e "${YELLOW}🚀 Deploying to Vercel...${NC}"
vercel --prod || { echo -e "${RED}❌ Deployment failed${NC}"; exit 1; }

echo -e "${GREEN}✅ Deployment successful!${NC}"

# Run post-deployment checks
echo -e "${YELLOW}🔍 Running post-deployment checks...${NC}"

# Check site is up
curl -f https://ialchemist.app || { echo -e "${RED}❌ Site not accessible${NC}"; exit 1; }

# Check API health
curl -f https://ialchemist.app/api/health || { echo -e "${RED}❌ API health check failed${NC}"; exit 1; }

echo -e "${GREEN}🎉 Deployment complete and verified!${NC}"

# Send notification
curl -X POST https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{"text":"✅ IALchemist deployed to production successfully!"}'
```

### Step 6: Monitoring Setup

Create `app/api/health/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { Redis } from "@upstash/redis";

export async function GET() {
  const checks = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    checks: {
      database: false,
      redis: false,
      openai: false,
      stripe: false,
    },
    version: process.env.npm_package_version || "unknown",
  };

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = true;
  } catch (error) {
    checks.status = "degraded";
  }

  try {
    // Check Redis
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    await redis.ping();
    checks.checks.redis = true;
  } catch (error) {
    checks.status = "degraded";
  }

  // Check critical services
  if (!process.env.OPENAI_API_KEY) {
    checks.checks.openai = false;
    checks.status = "unhealthy";
  } else {
    checks.checks.openai = true;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    checks.checks.stripe = false;
    checks.status = "degraded";
  } else {
    checks.checks.stripe = true;
  }

  const statusCode =
    checks.status === "healthy"
      ? 200
      : checks.status === "degraded"
      ? 503
      : 500;

  return NextResponse.json(checks, { status: statusCode });
}
```

### Step 7: Backup Strategy

Create `app/api/cron/backup/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import logger from "@/lib/logger";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const timestamp = new Date().toISOString();

    // Export critical data
    const [conversations, users, subscriptions] = await Promise.all([
      prisma.conversation.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        include: { messages: true },
      }),
      prisma.user.findMany({
        select: { id: true, email: true, createdAt: true },
      }),
      prisma.subscription.findMany({
        where: { status: "ACTIVE" },
      }),
    ]);

    const backup = {
      timestamp,
      data: {
        conversations: conversations.length,
        users: users.length,
        subscriptions: subscriptions.length,
      },
      export: {
        conversations,
        users,
        subscriptions,
      },
    };

    // Upload to S3
    await s3.send(
      new PutObjectCommand({
        Bucket: "ialchemist-backups",
        Key: `backup-${timestamp}.json`,
        Body: JSON.stringify(backup),
        ContentType: "application/json",
      })
    );

    logger.info("Backup completed", backup.data);

    return NextResponse.json({
      success: true,
      timestamp,
      stats: backup.data,
    });
  } catch (error) {
    logger.error("Backup failed:", error);
    return NextResponse.json({ error: "Backup failed" }, { status: 500 });
  }
}
```

### Step 8: Launch Checklist

Create `LAUNCH_CHECKLIST.md`:

```markdown
# IALchemist Launch Checklist

## Pre-Launch (1 Week Before)

### Infrastructure

- [ ] Production database provisioned and tested
- [ ] Redis cache configured
- [ ] CDN configured for static assets
- [ ] SSL certificates verified
- [ ] Domain DNS configured

### Security

- [ ] Security headers implemented
- [ ] CSP policy tested
- [ ] Rate limiting configured
- [ ] API keys rotated to production
- [ ] Secrets stored in Vercel environment
- [ ] CORS properly configured

### Testing

- [ ] All unit tests passing
- [ ] E2E tests passing on staging
- [ ] Load testing completed
- [ ] Lighthouse scores > 90
- [ ] Cross-browser testing done
- [ ] Mobile responsiveness verified

### Legal & Compliance

- [ ] Terms of Service finalized
- [ ] Privacy Policy updated
- [ ] Cookie consent implemented
- [ ] GDPR compliance verified
- [ ] Accessibility audit passed

### Monitoring

- [ ] Sentry error tracking configured
- [ ] Vercel Analytics enabled
- [ ] Uptime monitoring configured
- [ ] Alert rules defined
- [ ] Log aggregation setup

### Content

- [ ] All hermetic content reviewed
- [ ] Translations verified by native speakers
- [ ] Email templates tested
- [ ] Error messages user-friendly

## Launch Day

### Morning (6 Hours Before)

- [ ] Final backup of staging data
- [ ] Team briefing completed
- [ ] Support channels ready
- [ ] Social media posts scheduled

### Deployment (2 Hours Before)

- [ ] Deploy to production
- [ ] Run smoke tests
- [ ] Verify all integrations
- [ ] Check payment flow
- [ ] Test chat functionality

### Go Live

- [ ] Remove maintenance mode
- [ ] Announce on social media
- [ ] Send launch email
- [ ] Monitor error rates
- [ ] Watch performance metrics

## Post-Launch (First 24 Hours)

### Monitoring

- [ ] Check error logs every hour
- [ ] Monitor conversion rates
- [ ] Track user registrations
- [ ] Review chat conversations
- [ ] Check payment processing

### Response Plan

- [ ] Hotfix process ready
- [ ] Rollback plan prepared
- [ ] Support team on standby
- [ ] Communication channels open

### Metrics to Track

- [ ] User registrations
- [ ] Conversion rate
- [ ] Chat engagement
- [ ] Error rate
- [ ] Page load times
- [ ] API response times
```

### Step 9: Rollback Plan

Create `scripts/rollback.sh`:

```bash
#!/bin/bash

echo "⚠️  Starting rollback procedure..."

# Get the previous deployment
PREVIOUS_DEPLOYMENT=$(vercel ls --json | jq -r '.[1].uid')

if [ -z "$PREVIOUS_DEPLOYMENT" ]; then
  echo "❌ No previous deployment found"
  exit 1
fi

echo "Rolling back to deployment: $PREVIOUS_DEPLOYMENT"

# Promote previous deployment
vercel alias set $PREVIOUS_DEPLOYMENT ialchemist.app

echo "✅ Rollback complete"

# Notify team
curl -X POST https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{"text":"⚠️ Production rolled back to previous deployment"}'
```

### Step 10: Post-Launch Monitoring Dashboard

Create `app/admin/dashboard/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface Metrics {
  users: number;
  conversations: number;
  messages: number;
  activeSubscriptions: number;
  revenue: number;
  errorRate: number;
  avgResponseTime: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    fetchMetrics();
    fetchHealth();

    const interval = setInterval(() => {
      fetchMetrics();
      fetchHealth();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    const res = await fetch("/api/admin/metrics");
    const data = await res.json();
    setMetrics(data);
  };

  const fetchHealth = async () => {
    const res = await fetch("/api/health");
    const data = await res.json();
    setHealth(data);
  };

  if (!metrics || !health) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">IALchemist Launch Dashboard</h1>

      {/* Health Status */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">System Health</h2>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(health.checks).map(([service, status]) => (
            <div key={service} className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  status ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="capitalize">{service}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-sm text-gray-600">Total Users</h3>
          <p className="text-3xl font-bold">{metrics.users.toLocaleString()}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm text-gray-600">Active Subscriptions</h3>
          <p className="text-3xl font-bold">{metrics.activeSubscriptions}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm text-gray-600">Monthly Revenue</h3>
          <p className="text-3xl font-bold">
            ${metrics.revenue.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Performance</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Avg Response Time</p>
            <p className="text-2xl font-bold">{metrics.avgResponseTime}ms</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Error Rate</p>
            <p className="text-2xl font-bold">{metrics.errorRate}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Messages</p>
            <p className="text-2xl font-bold">
              {metrics.messages.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

## Verification Steps

1. Verify all environment variables are set in Vercel
2. Test deployment to staging environment
3. Run full test suite against staging
4. Verify database migrations completed
5. Check all third-party integrations
6. Test payment flow end-to-end
7. Verify email delivery
8. Check monitoring dashboards

9. Final production deployment:

```bash
./scripts/deploy.sh production
```

## Success Criteria

- [ ] Site accessible at ialchemist.app
- [ ] SSL certificate valid
- [ ] All health checks passing
- [ ] No console errors
- [ ] Payment processing working
- [ ] Chat functionality operational
- [ ] Emails being delivered
- [ ] Monitoring showing green
- [ ] Load times < 2 seconds
- [ ] Error rate < 0.1%

## Post-Launch Actions

- [ ] Monitor metrics for first 24 hours
- [ ] Respond to user feedback
- [ ] Fix any critical issues immediately
- [ ] Schedule retrospective meeting
- [ ] Plan first feature update
- [ ] Celebrate successful launch! 🎉

---

## Emergency Contacts

- **DevOps Lead**: [Contact]
- **Backend Lead**: [Contact]
- **Frontend Lead**: [Contact]
- **Database Admin**: [Contact]
- **On-Call Engineer**: [Contact]

## Congratulations!

The IALchemist.app is now live and ready to bring ancient wisdom to modern seekers worldwide. May Hermes Trismegistus guide all who seek knowledge through this digital temple of wisdom.

"As above, so below. As within, so without."
