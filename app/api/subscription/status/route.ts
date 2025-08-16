import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { StripeService } from "@/lib/stripe/service";
import { UsageTracker } from "@/lib/usage/tracker";
import logger from "@/lib/logger";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const stripeService = new StripeService();
    const usageTracker = new UsageTracker();

    // Get subscription status and usage stats in parallel
    const [subscriptionStatus, usageStats] = await Promise.all([
      stripeService.getSubscriptionStatus(session.user.id),
      usageTracker.getUsageStats(session.user.id),
    ]);

    return NextResponse.json({
      subscription: {
        status: subscriptionStatus.status,
        plan: subscriptionStatus.plan,
        currentPeriodEnd: subscriptionStatus.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptionStatus.cancelAtPeriodEnd,
        trialEnd: subscriptionStatus.trialEnd,
        stripeStatus: subscriptionStatus.stripeStatus,
      },
      usage: {
        current: usageStats.usage,
        limits: usageStats.limits,
        remaining: usageStats.remaining,
        features: usageStats.features,
      },
      billingInfo: {
        canAccessBillingPortal: subscriptionStatus.status !== "none" && 
                               !["FREE_TRIAL", "FREE"].includes(subscriptionStatus.plan || ""),
        needsUpgrade: subscriptionStatus.status === "none" || subscriptionStatus.plan === "FREE_TRIAL",
      },
    });

  } catch (error) {
    logger.error(error, "Subscription status API error:");
    return NextResponse.json(
      { error: "Failed to retrieve subscription status" },
      { status: 500 }
    );
  }
}