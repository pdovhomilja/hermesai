import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_fallback", {
  apiVersion: "2025-03-31.basil",
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
} as const;

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

export function getPlanLimits(planName: keyof typeof SUBSCRIPTION_PLANS) {
  return SUBSCRIPTION_PLANS[planName]?.limits || null;
}

export function isUnlimitedPlan(planName: string): boolean {
  const plan = SUBSCRIPTION_PLANS[planName as keyof typeof SUBSCRIPTION_PLANS];
  return plan?.limits.messagesPerMonth === -1;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);
}

export function calculateAnnualSavings(plan: keyof typeof SUBSCRIPTION_PLANS): number {
  const planData = SUBSCRIPTION_PLANS[plan];
  const monthlyTotal = planData.prices.monthly.amount * 12;
  const annualPrice = planData.prices.annual.amount;
  return Math.round(((monthlyTotal - annualPrice) / monthlyTotal) * 100);
}