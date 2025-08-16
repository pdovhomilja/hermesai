# Phase 6: Subscription & Payment System

## Overview

This phase implements a complete subscription and payment system using Stripe, including pricing tiers, usage tracking, billing management, and payment processing for the three subscription plans (Seeker, Adept, Master).

## Prerequisites

- Phases 1-5 completed
- Stripe account created
- Stripe API keys available

## Phase Objectives

1. Integrate Stripe SDK and configure webhooks
2. Implement subscription plans and pricing
3. Create payment flow and checkout
4. Build usage tracking and limits
5. Implement billing management portal
6. Add subscription upgrade/downgrade logic
7. Create trial period management

## Implementation Steps

### Step 1: Install Stripe Dependencies

```bash
pnpm add stripe@18.0.0
pnpm add @stripe/stripe-js@5.0.0
pnpm add @stripe/react-stripe-js@3.0.0
pnpm add stripe-event-types
```

### Step 2: Environment Configuration

Update `.env.local`:

```env
# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Subscription Products (create in Stripe Dashboard)
STRIPE_PRODUCT_SEEKER="prod_..."
STRIPE_PRODUCT_ADEPT="prod_..."
STRIPE_PRODUCT_MASTER="prod_..."

# Price IDs
STRIPE_PRICE_SEEKER_MONTHLY="price_..."
STRIPE_PRICE_SEEKER_ANNUAL="price_..."
STRIPE_PRICE_ADEPT_MONTHLY="price_..."
STRIPE_PRICE_ADEPT_ANNUAL="price_..."
STRIPE_PRICE_MASTER_MONTHLY="price_..."
STRIPE_PRICE_MASTER_ANNUAL="price_..."

# Trial Settings
TRIAL_DAYS=7
FREE_MESSAGES_LIMIT=10
```

### Step 3: Stripe Configuration

Create `lib/stripe/config.ts`:

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

export const SUBSCRIPTION_PLANS = {
  SEEKER: {
    name: "Seeker",
    description: "For curious spiritual beginners",
    features: [
      "100 AI conversations per month",
      "30-day conversation history",
      "Basic hermetic teachings",
      "Age-appropriate explanations",
      "Community access",
      "Email support",
    ],
    limits: {
      messagesPerMonth: 100,
      historyDays: 30,
      exportEnabled: false,
      advancedFeatures: false,
    },
    prices: {
      monthly: {
        amount: 999, // $9.99
        priceId: process.env.STRIPE_PRICE_SEEKER_MONTHLY!,
      },
      annual: {
        amount: 9999, // $99.99
        priceId: process.env.STRIPE_PRICE_SEEKER_ANNUAL!,
      },
    },
  },
  ADEPT: {
    name: "Adept",
    description: "For committed spiritual practitioners",
    features: [
      "Unlimited AI conversations",
      "Unlimited conversation history",
      "Spiritual journey timeline",
      "Advanced hermetic teachings",
      "Personalized guidance",
      "Daily mantras & practices",
      "Interactive storytelling",
      "Export to PDF/Markdown",
      "Priority support",
    ],
    limits: {
      messagesPerMonth: -1, // Unlimited
      historyDays: -1, // Unlimited
      exportEnabled: true,
      advancedFeatures: true,
    },
    prices: {
      monthly: {
        amount: 2499, // $24.99
        priceId: process.env.STRIPE_PRICE_ADEPT_MONTHLY!,
      },
      annual: {
        amount: 24999, // $249.99
        priceId: process.env.STRIPE_PRICE_ADEPT_ANNUAL!,
      },
    },
  },
  MASTER: {
    name: "Master",
    description: "For serious hermetic students",
    features: [
      "Everything in Adept",
      "Lifetime conversation archive",
      "Advanced analytics & insights",
      "GPT-5 Thinking Mode",
      "Exclusive hermetic texts",
      "Custom transformation rituals",
      "Dream interpretation",
      "VIP community access",
      "Phone support",
      "Custom meditation schedules",
    ],
    limits: {
      messagesPerMonth: -1, // Unlimited
      historyDays: -1, // Unlimited
      exportEnabled: true,
      advancedFeatures: true,
      thinkingMode: true,
      vipFeatures: true,
    },
    prices: {
      monthly: {
        amount: 4999, // $49.99
        priceId: process.env.STRIPE_PRICE_MASTER_MONTHLY!,
      },
      annual: {
        amount: 49999, // $499.99
        priceId: process.env.STRIPE_PRICE_MASTER_ANNUAL!,
      },
    },
  },
};

export function getPlanByPriceId(priceId: string) {
  for (const [key, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
    if (
      plan.prices.monthly.priceId === priceId ||
      plan.prices.annual.priceId === priceId
    ) {
      return { key, plan };
    }
  }
  return null;
}
```

### Step 4: Stripe Service Layer

Create `lib/stripe/service.ts`:

```typescript
import { stripe, SUBSCRIPTION_PLANS } from "./config";
import { prisma } from "@/lib/db/client";
import logger from "@/lib/logger";
import type Stripe from "stripe";

export class StripeService {
  async createCustomer(userId: string, email: string, name?: string) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      });

      // Update user with Stripe customer ID
      await prisma.subscription.create({
        data: {
          userId,
          stripeCustomerId: customer.id,
          plan: "FREE_TRIAL",
          status: "TRIAL",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
        },
      });

      logger.info("Stripe customer created", {
        userId,
        customerId: customer.id,
      });

      return customer;
    } catch (error) {
      logger.error("Failed to create Stripe customer:", error);
      throw error;
    }
  }

  async createCheckoutSession(
    userId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) {
    try {
      // Get or create customer
      const subscription = await prisma.subscription.findFirst({
        where: { userId },
      });

      let customerId = subscription?.stripeCustomerId;

      if (!customerId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) throw new Error("User not found");

        const customer = await this.createCustomer(
          userId,
          user.email,
          user.name || undefined
        );
        customerId = customer.id;
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        subscription_data: {
          trial_period_days: parseInt(process.env.TRIAL_DAYS || "7"),
          metadata: {
            userId,
          },
        },
        metadata: {
          userId,
        },
      });

      logger.info("Checkout session created", {
        userId,
        sessionId: session.id,
        priceId,
      });

      return session;
    } catch (error) {
      logger.error("Failed to create checkout session:", error);
      throw error;
    }
  }

  async createBillingPortalSession(userId: string, returnUrl: string) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { userId },
      });

      if (!subscription?.stripeCustomerId) {
        throw new Error("No Stripe customer found");
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: returnUrl,
      });

      logger.info("Billing portal session created", {
        userId,
        customerId: subscription.stripeCustomerId,
      });

      return session;
    } catch (error) {
      logger.error("Failed to create billing portal session:", error);
      throw error;
    }
  }

  async cancelSubscription(userId: string, immediately: boolean = false) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { userId },
      });

      if (!subscription?.stripeSubscriptionId) {
        throw new Error("No active subscription found");
      }

      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: !immediately,
        }
      );

      if (immediately) {
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      }

      // Update database
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          cancelAtPeriodEnd: !immediately,
          status: immediately ? "CANCELED" : "ACTIVE",
        },
      });

      logger.info("Subscription cancelled", {
        userId,
        immediately,
        subscriptionId: subscription.stripeSubscriptionId,
      });

      return stripeSubscription;
    } catch (error) {
      logger.error("Failed to cancel subscription:", error);
      throw error;
    }
  }

  async updateSubscription(userId: string, newPriceId: string) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { userId },
      });

      if (!subscription?.stripeSubscriptionId) {
        throw new Error("No active subscription found");
      }

      // Get current subscription
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      );

      // Update subscription with new price
      const updatedSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          items: [
            {
              id: stripeSubscription.items.data[0].id,
              price: newPriceId,
            },
          ],
          proration_behavior: "create_prorations",
        }
      );

      // Get new plan details
      const planDetails = getPlanByPriceId(newPriceId);

      if (planDetails) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            plan: planDetails.key as any,
          },
        });
      }

      logger.info("Subscription updated", {
        userId,
        newPriceId,
        subscriptionId: subscription.stripeSubscriptionId,
      });

      return updatedSubscription;
    } catch (error) {
      logger.error("Failed to update subscription:", error);
      throw error;
    }
  }
}
```

### Step 5: Webhook Handler

Create `app/api/webhooks/stripe/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { prisma } from "@/lib/db/client";
import logger from "@/lib/logger";
import { getPlanByPriceId } from "@/lib/stripe/config";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("stripe-signature")!;

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    logger.error("Webhook signature verification failed:", error);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      default:
        logger.info(`Unhandled webhook event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Webhook processing error:", error);
    return new Response("Webhook handler failed", { status: 500 });
  }
}

async function handleCheckoutCompleted(session: any) {
  const userId = session.metadata?.userId;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  if (!userId) {
    logger.error("No userId in checkout session metadata");
    return;
  }

  // Update subscription record
  await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      status: "ACTIVE",
    },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      plan: "SEEKER", // Will be updated by subscription.created event
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  logger.info("Checkout completed", { userId, customerId, subscriptionId });
}

async function handleSubscriptionCreated(subscription: any) {
  const userId = subscription.metadata?.userId;
  const customerId = subscription.customer;
  const priceId = subscription.items.data[0].price.id;

  if (!userId) {
    logger.error("No userId in subscription metadata");
    return;
  }

  const planDetails = getPlanByPriceId(priceId);

  if (!planDetails) {
    logger.error("Unknown price ID:", priceId);
    return;
  }

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: {
      plan: planDetails.key as any,
      status: subscription.status === "trialing" ? "TRIAL" : "ACTIVE",
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
    create: {
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      plan: planDetails.key as any,
      status: subscription.status === "trialing" ? "TRIAL" : "ACTIVE",
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  logger.info("Subscription created", {
    userId,
    plan: planDetails.key,
    subscriptionId: subscription.id,
  });
}

async function handleSubscriptionUpdated(subscription: any) {
  const priceId = subscription.items.data[0].price.id;
  const planDetails = getPlanByPriceId(priceId);

  if (!planDetails) {
    logger.error("Unknown price ID:", priceId);
    return;
  }

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      plan: planDetails.key as any,
      status:
        subscription.status === "active"
          ? "ACTIVE"
          : subscription.status === "past_due"
          ? "PAST_DUE"
          : subscription.status === "canceled"
          ? "CANCELED"
          : "ACTIVE",
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  logger.info("Subscription updated", {
    plan: planDetails.key,
    subscriptionId: subscription.id,
  });
}

async function handleSubscriptionDeleted(subscription: any) {
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: "CANCELED",
      cancelAtPeriodEnd: false,
    },
  });

  logger.info("Subscription deleted", {
    subscriptionId: subscription.id,
  });
}

async function handlePaymentSucceeded(invoice: any) {
  const subscriptionId = invoice.subscription;
  const amountPaid = invoice.amount_paid;

  if (!subscriptionId) return;

  // Log successful payment
  logger.info("Payment succeeded", {
    subscriptionId,
    amount: amountPaid / 100, // Convert from cents
  });

  // Could create payment record here if needed
}

async function handlePaymentFailed(invoice: any) {
  const subscriptionId = invoice.subscription;
  const customerId = invoice.customer;

  // Update subscription status
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status: "PAST_DUE",
    },
  });

  // TODO: Send payment failed email

  logger.warn("Payment failed", {
    subscriptionId,
    customerId,
  });
}
```

### Step 6: Usage Tracking Service

Create `lib/usage/tracker.ts`:

```typescript
import { prisma } from "@/lib/db/client";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe/config";
import logger from "@/lib/logger";

export class UsageTracker {
  async checkUsageLimit(
    userId: string,
    metric: "CONVERSATIONS" | "MESSAGES" | "EXPORTS"
  ): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    try {
      // Get user's subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: { in: ["ACTIVE", "TRIAL"] },
        },
      });

      if (!subscription) {
        // Free tier limits
        const freeLimit = parseInt(process.env.FREE_MESSAGES_LIMIT || "10");
        const usage = await this.getCurrentUsage(userId, metric);

        return {
          allowed: usage < freeLimit,
          remaining: Math.max(0, freeLimit - usage),
          limit: freeLimit,
        };
      }

      // Get plan limits
      const plan =
        SUBSCRIPTION_PLANS[
          subscription.plan as keyof typeof SUBSCRIPTION_PLANS
        ];

      if (!plan) {
        logger.error("Unknown subscription plan:", subscription.plan);
        return { allowed: false, remaining: 0, limit: 0 };
      }

      // Check if unlimited
      if (plan.limits.messagesPerMonth === -1) {
        return { allowed: true, remaining: -1, limit: -1 };
      }

      // Get current month usage
      const usage = await this.getCurrentMonthUsage(subscription.id, metric);
      const limit = plan.limits.messagesPerMonth;

      return {
        allowed: usage < limit,
        remaining: Math.max(0, limit - usage),
        limit,
      };
    } catch (error) {
      logger.error("Failed to check usage limit:", error);
      return { allowed: false, remaining: 0, limit: 0 };
    }
  }

  async trackUsage(
    userId: string,
    metric: "CONVERSATIONS" | "MESSAGES" | "EXPORTS",
    count: number = 1
  ) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { userId },
      });

      if (!subscription) {
        // Track for free users (could be in a different table)
        logger.info("Usage tracked for free user", { userId, metric, count });
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.usageRecord.upsert({
        where: {
          subscriptionId_metric_date: {
            subscriptionId: subscription.id,
            metric,
            date: today,
          },
        },
        update: {
          count: { increment: count },
        },
        create: {
          subscriptionId: subscription.id,
          metric,
          count,
          date: today,
        },
      });

      logger.info("Usage tracked", {
        userId,
        subscriptionId: subscription.id,
        metric,
        count,
      });
    } catch (error) {
      logger.error("Failed to track usage:", error);
    }
  }

  private async getCurrentUsage(
    userId: string,
    metric: string
  ): Promise<number> {
    // For free users, count total messages
    const count = await prisma.message.count({
      where: {
        conversation: {
          userId,
        },
      },
    });

    return count;
  }

  private async getCurrentMonthUsage(
    subscriptionId: string,
    metric: string
  ): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const records = await prisma.usageRecord.findMany({
      where: {
        subscriptionId,
        metric: metric as any,
        date: { gte: startOfMonth },
      },
    });

    return records.reduce((sum, record) => sum + record.count, 0);
  }

  async getUsageStats(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
    });

    if (!subscription) {
      return {
        plan: "FREE",
        usage: {},
        limits: {
          messages: parseInt(process.env.FREE_MESSAGES_LIMIT || "10"),
        },
      };
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const records = await prisma.usageRecord.findMany({
      where: {
        subscriptionId: subscription.id,
        date: { gte: startOfMonth },
      },
    });

    const usage = records.reduce((acc, record) => {
      acc[record.metric.toLowerCase()] =
        (acc[record.metric.toLowerCase()] || 0) + record.count;
      return acc;
    }, {} as Record<string, number>);

    const plan =
      SUBSCRIPTION_PLANS[subscription.plan as keyof typeof SUBSCRIPTION_PLANS];

    return {
      plan: subscription.plan,
      usage,
      limits: plan?.limits || {},
    };
  }
}
```

### Step 7: Checkout API

Create `app/api/subscription/checkout/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { StripeService } from "@/lib/stripe/service";
import { z } from "zod";
import logger from "@/lib/logger";

const checkoutSchema = z.object({
  priceId: z.string(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { priceId, successUrl, cancelUrl } = checkoutSchema.parse(body);

    const stripe = new StripeService();

    const checkoutSession = await stripe.createCheckoutSession(
      session.user.id,
      priceId,
      successUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`
    );

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    logger.error("Checkout API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
```

### Step 8: Billing Portal API

Create `app/api/subscription/billing-portal/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { StripeService } from "@/lib/stripe/service";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const stripe = new StripeService();

    const portalSession = await stripe.createBillingPortalSession(
      session.user.id,
      `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`
    );

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    logger.error("Billing portal API error:", error);

    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
```

### Step 9: Pricing Page Component

Create `components/pricing/pricing-cards.tsx`:

```typescript
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe/config";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function PricingCards() {
  const [annual, setAnnual] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planKey: string) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setLoading(planKey);

    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      key: "SEEKER",
      icon: <Sparkles className="w-8 h-8" />,
      popular: false,
      color: "border-purple-200",
    },
    {
      key: "ADEPT",
      icon: <Zap className="w-8 h-8" />,
      popular: true,
      color: "border-purple-400 shadow-lg scale-105",
    },
    {
      key: "MASTER",
      icon: <Crown className="w-8 h-8" />,
      popular: false,
      color: "border-purple-300",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Annual/Monthly Toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={!annual ? "font-semibold" : ""}>Monthly</span>
        <Switch checked={annual} onCheckedChange={setAnnual} />
        <span className={annual ? "font-semibold" : ""}>
          Annual
          <span className="ml-2 text-sm text-green-600">(Save 17%)</span>
        </span>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((planConfig) => {
          const plan =
            SUBSCRIPTION_PLANS[
              planConfig.key as keyof typeof SUBSCRIPTION_PLANS
            ];
          const price = annual ? plan.prices.annual : plan.prices.monthly;
          const displayPrice = price.amount / 100;

          return (
            <Card
              key={planConfig.key}
              className={`relative ${planConfig.color} ${
                planConfig.popular ? "md:-mt-4" : ""
              }`}
            >
              {planConfig.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="mx-auto mb-4 text-purple-600">
                  {planConfig.icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold">${displayPrice}</span>
                  <span className="text-muted-foreground">
                    /{annual ? "year" : "month"}
                  </span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={planConfig.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(price.priceId, planConfig.key)}
                  disabled={loading === planConfig.key}
                >
                  {loading === planConfig.key
                    ? "Processing..."
                    : "Start Free Trial"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Free Trial Notice */}
      <div className="text-center text-sm text-muted-foreground">
        <p>✨ All plans include a 7-day free trial. Cancel anytime.</p>
        <p>No credit card required to start.</p>
      </div>
    </div>
  );
}
```

### Step 10: Usage Middleware

Create `lib/middleware/usage-check.ts`:

```typescript
import { UsageTracker } from "@/lib/usage/tracker";
import { NextResponse } from "next/server";

export async function checkUsageMiddleware(
  userId: string,
  metric: "CONVERSATIONS" | "MESSAGES" | "EXPORTS"
) {
  const tracker = new UsageTracker();
  const { allowed, remaining, limit } = await tracker.checkUsageLimit(
    userId,
    metric
  );

  if (!allowed) {
    return NextResponse.json(
      {
        error: "Usage limit exceeded",
        limit,
        remaining: 0,
        upgradeUrl: "/pricing",
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(
            new Date().setMonth(new Date().getMonth() + 1, 1)
          ).toISOString(),
        },
      }
    );
  }

  return null;
}
```

## Verification Steps

1. Configure Stripe products and prices in dashboard
2. Test checkout flow with test cards
3. Verify webhook events are received
4. Test subscription creation and updates
5. Validate usage tracking and limits
6. Test billing portal access
7. Verify upgrade/downgrade flows

8. Run linting and build:

```bash
pnpm lint
pnpm build
```

## Success Criteria

- [ ] Stripe checkout flow working
- [ ] Subscriptions created and managed correctly
- [ ] Webhooks processed successfully
- [ ] Usage limits enforced per plan
- [ ] Billing portal accessible
- [ ] Plan upgrades/downgrades working
- [ ] Trial period management functional
- [ ] No linting errors
- [ ] Build completes successfully

## Next Phase

Phase 7 will implement comprehensive multilingual support for all supported languages.
