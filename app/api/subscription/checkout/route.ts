import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { StripeService } from "@/lib/stripe/service";
import { getPlanByPriceId } from "@/lib/stripe/config";
import { z } from "zod";
import logger from "@/lib/logger";

const checkoutSchema = z.object({
  priceId: z.string().min(1, "Price ID is required"),
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

    // Validate that the price ID exists in our plan configuration
    const planDetails = getPlanByPriceId(priceId);
    if (!planDetails) {
      return NextResponse.json(
        { error: "Invalid price ID" },
        { status: 400 }
      );
    }

    const stripeService = new StripeService();

    // Check if user already has an active subscription
    const existingStatus = await stripeService.getSubscriptionStatus(session.user.id);
    if (existingStatus.status === "ACTIVE" && !existingStatus.cancelAtPeriodEnd) {
      return NextResponse.json(
        { 
          error: "User already has an active subscription",
          currentPlan: existingStatus.plan,
          upgradeUrl: "/settings/billing"
        },
        { status: 409 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000";

    const checkoutSession = await stripeService.createCheckoutSession(
      session.user.id,
      priceId,
      successUrl || `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancelUrl || `${baseUrl}/pricing?canceled=true`
    );

    logger.info({
      userId: session.user.id,
      priceId,
      planName: planDetails.plan.name,
      sessionId: checkoutSession.id,
    }, "Checkout session created");

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
      planName: planDetails.plan.name,
    });

  } catch (error) {
    logger.error(error, "Checkout API error:");

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes("User not found")) {
        return NextResponse.json(
          { error: "User account not found" },
          { status: 404 }
        );
      }

      if (error.message.includes("Customer")) {
        return NextResponse.json(
          { error: "Failed to create or retrieve customer" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve checkout session details
    const { stripe } = await import("@/lib/stripe/config");
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.metadata?.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Session does not belong to current user" },
        { status: 403 }
      );
    }

    const planDetails = checkoutSession.line_items?.data[0]?.price?.id
      ? getPlanByPriceId(checkoutSession.line_items.data[0].price.id)
      : null;

    return NextResponse.json({
      sessionId: checkoutSession.id,
      paymentStatus: checkoutSession.payment_status,
      subscriptionId: checkoutSession.subscription,
      customerEmail: checkoutSession.customer_details?.email,
      planName: planDetails?.plan.name || "Unknown",
      amountTotal: checkoutSession.amount_total ? checkoutSession.amount_total / 100 : null,
    });

  } catch (error) {
    logger.error(error, "Checkout session retrieval error:");

    if (error instanceof Error && error.message.includes("No such checkout.session")) {
      return NextResponse.json(
        { error: "Checkout session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to retrieve checkout session" },
      { status: 500 }
    );
  }
}