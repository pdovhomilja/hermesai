import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { StripeService } from "@/lib/stripe/service";
import logger from "@/lib/logger";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const stripeService = new StripeService();

    // Check if user has a subscription with Stripe customer ID
    const subscriptionStatus = await stripeService.getSubscriptionStatus(session.user.id);
    
    if (!subscriptionStatus || subscriptionStatus.status === "none") {
      return NextResponse.json(
        { 
          error: "No subscription found",
          message: "You need an active subscription to access the billing portal",
          redirectUrl: "/pricing"
        },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000";

    const returnUrl = `${baseUrl}/settings/billing`;

    const portalSession = await stripeService.createBillingPortalSession(
      session.user.id,
      returnUrl
    );

    logger.info({
      userId: session.user.id,
      sessionUrl: portalSession.url,
      returnUrl,
    }, "Billing portal session created");

    return NextResponse.json({
      url: portalSession.url,
    });

  } catch (error) {
    logger.error(error, "Billing portal API error:");

    if (error instanceof Error) {
      if (error.message.includes("No Stripe customer found")) {
        return NextResponse.json(
          { 
            error: "No billing account found",
            message: "Please subscribe to a plan first to access billing management",
            redirectUrl: "/pricing"
          },
          { status: 404 }
        );
      }

      if (error.message.includes("No active subscription found")) {
        return NextResponse.json(
          { 
            error: "No active subscription",
            message: "You need an active subscription to manage billing",
            redirectUrl: "/pricing"
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}

// Get current subscription and billing information
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const stripeService = new StripeService();
    const subscriptionStatus = await stripeService.getSubscriptionStatus(session.user.id);

    if (!subscriptionStatus || subscriptionStatus.status === "none") {
      return NextResponse.json({
        hasSubscription: false,
        status: "none",
        plan: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEnd: null,
        canAccessBillingPortal: false,
      });
    }

    const canAccessBillingPortal = subscriptionStatus.status !== "none" && 
                                   !["FREE_TRIAL", "FREE"].includes(subscriptionStatus.plan || "");

    return NextResponse.json({
      hasSubscription: true,
      status: subscriptionStatus.status,
      plan: subscriptionStatus.plan,
      currentPeriodEnd: subscriptionStatus.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptionStatus.cancelAtPeriodEnd,
      trialEnd: subscriptionStatus.trialEnd,
      stripeStatus: subscriptionStatus.stripeStatus,
      canAccessBillingPortal,
    });

  } catch (error) {
    logger.error(error, "Billing info retrieval error:");
    return NextResponse.json(
      { error: "Failed to retrieve billing information" },
      { status: 500 }
    );
  }
}