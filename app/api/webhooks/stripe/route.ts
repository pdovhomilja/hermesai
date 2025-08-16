import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { prisma } from "@/lib/db/client";
import logger from "@/lib/logger";
import { getPlanByPriceId } from "@/lib/stripe/config";
import { headers } from "next/headers";
import type Stripe from "stripe";

// Extend Stripe types to include missing properties
type StripeSubscriptionWithPeriod = Stripe.Subscription & {
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
};

type StripeInvoiceWithSubscription = Stripe.Invoice & {
  subscription?: string | null;
  amount_paid: number;
  amount_due: number;
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: unknown) {
    logger.error(error, "Webhook signature verification failed:");
    return new Response(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as StripeSubscriptionWithPeriod);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as StripeSubscriptionWithPeriod);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as StripeInvoiceWithSubscription);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as StripeInvoiceWithSubscription);
        break;

      case "customer.subscription.trial_will_end":
        await handleTrialWillEnd(event.data.object as StripeSubscriptionWithPeriod);
        break;

      default:
        logger.info({ eventType: event.type }, "Unhandled webhook event:");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error(error, "Webhook processing error:");
    return new Response("Webhook handler failed", { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId) {
    logger.error("No userId in checkout session metadata");
    return;
  }

  logger.info({ userId, customerId, subscriptionId }, "Processing checkout completion");

  // Find and update existing subscription or create new one
  const existingSubscription = await prisma.subscription.findFirst({
    where: { userId },
  });

  if (existingSubscription) {
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        status: "ACTIVE",
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        plan: "SEEKER", // Will be updated by subscription.created event
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  logger.info({ userId, customerId, subscriptionId }, "Checkout completed");
}

async function handleSubscriptionCreated(subscription: StripeSubscriptionWithPeriod) {
  const userId = subscription.metadata?.userId;
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0].price.id;

  if (!userId) {
    // Try to get userId from customer metadata
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted || !customer.metadata?.userId) {
      logger.error("No userId found in subscription or customer metadata");
      return;
    }
  }

  const finalUserId = userId || (await stripe.customers.retrieve(customerId) as Stripe.Customer).metadata?.userId;

  if (!finalUserId) {
    logger.error("Could not determine userId for subscription");
    return;
  }

  const planDetails = getPlanByPriceId(priceId);

  if (!planDetails) {
    logger.error({ priceId }, "Unknown price ID:");
    return;
  }

  const status = subscription.status === "trialing" ? "TRIAL" : 
                 subscription.status === "active" ? "ACTIVE" :
                 subscription.status === "past_due" ? "PAST_DUE" :
                 subscription.status === "canceled" ? "CANCELED" : "ACTIVE";

  const existingSubscription = await prisma.subscription.findFirst({
    where: { userId: finalUserId },
  });

  if (existingSubscription) {
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        plan: planDetails.key as "SEEKER" | "ADEPT" | "MASTER",
        status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        userId: finalUserId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        plan: planDetails.key as "SEEKER" | "ADEPT" | "MASTER",
        status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  }

  logger.info({
    userId: finalUserId,
    plan: planDetails.key,
    subscriptionId: subscription.id,
    status: subscription.status,
  }, "Subscription created");
}

async function handleSubscriptionUpdated(subscription: StripeSubscriptionWithPeriod) {
  const priceId = subscription.items.data[0].price.id;
  const planDetails = getPlanByPriceId(priceId);

  if (!planDetails) {
    logger.error({ priceId }, "Unknown price ID:");
    return;
  }

  const status = subscription.status === "trialing" ? "TRIAL" : 
                 subscription.status === "active" ? "ACTIVE" :
                 subscription.status === "past_due" ? "PAST_DUE" :
                 subscription.status === "canceled" ? "CANCELED" : "ACTIVE";

  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!existingSubscription) {
    logger.warn({ subscriptionId: subscription.id }, "Subscription update for unknown subscription:");
    return;
  }

  await prisma.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      plan: planDetails.key as "SEEKER" | "ADEPT" | "MASTER",
      status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  logger.info({
    userId: existingSubscription.userId,
    plan: planDetails.key,
    subscriptionId: subscription.id,
    status: subscription.status,
  }, "Subscription updated");
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!existingSubscription) {
    logger.warn({ subscriptionId: subscription.id }, "Subscription deletion for unknown subscription:");
    return;
  }

  await prisma.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      status: "CANCELED",
      cancelAtPeriodEnd: false,
    },
  });

  logger.info({
    userId: existingSubscription.userId,
    subscriptionId: subscription.id,
  }, "Subscription deleted");
}

async function handlePaymentSucceeded(invoice: StripeInvoiceWithSubscription) {
  const subscriptionId = invoice.subscription as string;
  const amountPaid = invoice.amount_paid;
  const customerId = invoice.customer as string;

  if (!subscriptionId) return;

  // Log successful payment
  logger.info({
    subscriptionId,
    customerId,
    amount: amountPaid / 100, // Convert from cents
    invoiceId: invoice.id,
  }, "Payment succeeded");

  // Update subscription status to active if it was past due
  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (existingSubscription && existingSubscription.status === "PAST_DUE") {
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        status: "ACTIVE",
      },
    });

    logger.info({
      userId: existingSubscription.userId,
      subscriptionId,
    }, "Subscription reactivated after successful payment");
  }

  // Could create payment record here if needed for detailed billing history
}

async function handlePaymentFailed(invoice: StripeInvoiceWithSubscription) {
  const subscriptionId = invoice.subscription as string;
  const customerId = invoice.customer as string;
  const amountDue = invoice.amount_due;

  if (!subscriptionId) return;

  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (existingSubscription) {
    // Update subscription status
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        status: "PAST_DUE",
      },
    });

    logger.warn({
      userId: existingSubscription.userId,
      subscriptionId,
      customerId,
      amountDue: amountDue / 100,
      invoiceId: invoice.id,
    }, "Payment failed");

    // TODO: Send payment failed email notification
    // This would be a good place to trigger an email notification
    // to inform the user about the failed payment
  }
}

async function handleTrialWillEnd(subscription: StripeSubscriptionWithPeriod) {
  const customerId = subscription.customer as string;
  
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted || !customer.metadata?.userId) {
      logger.warn({}, "Cannot find userId for trial ending notification");
      return;
    }

    const userId = customer.metadata.userId;
    
    logger.info({
      userId,
      subscriptionId: subscription.id,
      trialEnd: new Date(subscription.trial_end! * 1000),
    }, "Trial will end soon");

    // TODO: Send trial ending email notification
    // This would be a good place to send a reminder email
    // about the upcoming trial expiration
  } catch (error) {
    logger.error(error, "Failed to process trial ending notification:");
  }
}