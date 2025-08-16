import { stripe, SUBSCRIPTION_PLANS, getPlanByPriceId } from "./config";
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
      const existingSubscription = await prisma.subscription.findFirst({
        where: { userId },
      });

      if (existingSubscription) {
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            stripeCustomerId: customer.id,
          },
        });
      } else {
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
      }

      logger.info({
        userId,
        customerId: customer.id,
      }, "Stripe customer created");

      return customer;
    } catch (error) {
      logger.error(error, "Failed to create Stripe customer:");
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

      logger.info({
        userId,
        sessionId: session.id,
        priceId,
      }, "Checkout session created");

      return session;
    } catch (error) {
      logger.error(error, "Failed to create checkout session:");
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

      logger.info({
        userId,
        customerId: subscription.stripeCustomerId,
      }, "Billing portal session created");

      return session;
    } catch (error) {
      logger.error(error, "Failed to create billing portal session:");
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

      logger.info({
        userId,
        immediately,
        subscriptionId: subscription.stripeSubscriptionId,
      }, "Subscription cancelled");

      return stripeSubscription;
    } catch (error) {
      logger.error(error, "Failed to cancel subscription:");
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

      logger.info({
        userId,
        newPriceId,
        subscriptionId: subscription.stripeSubscriptionId,
      }, "Subscription updated");

      return updatedSubscription;
    } catch (error) {
      logger.error(error, "Failed to update subscription:");
      throw error;
    }
  }

  async getSubscriptionStatus(userId: string) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      if (!subscription) {
        return {
          status: "none",
          plan: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          trialEnd: null,
        };
      }

      let stripeSubscription = null;
      if (subscription.stripeSubscriptionId) {
        try {
          stripeSubscription = await stripe.subscriptions.retrieve(
            subscription.stripeSubscriptionId
          );
        } catch (error) {
          logger.warn({ error }, "Failed to retrieve Stripe subscription");
        }
      }

      return {
        status: subscription.status,
        plan: subscription.plan,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialEnd: stripeSubscription?.trial_end 
          ? new Date(stripeSubscription.trial_end * 1000) 
          : null,
        stripeStatus: stripeSubscription?.status || null,
      };
    } catch (error) {
      logger.error(error, "Failed to get subscription status:");
      throw error;
    }
  }

  async syncSubscriptionFromStripe(stripeSubscriptionId: string) {
    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        stripeSubscriptionId,
        {
          expand: ["customer"],
        }
      );

      const customer = stripeSubscription.customer as Stripe.Customer;
      const userId = customer.metadata?.userId;

      if (!userId) {
        throw new Error("No userId found in customer metadata");
      }

      const priceId = stripeSubscription.items.data[0].price.id;
      const planDetails = getPlanByPriceId(priceId);

      if (!planDetails) {
        throw new Error(`Unknown price ID: ${priceId}`);
      }

      const existingSubscription = await prisma.subscription.findFirst({
        where: { userId },
      });

      if (existingSubscription) {
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            stripeSubscriptionId: stripeSubscription.id,
            stripeCustomerId: customer.id,
            plan: planDetails.key as "SEEKER" | "ADEPT" | "MASTER",
            status: this.mapStripeStatusToPrisma(stripeSubscription.status),
            currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
            currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
            cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end,
          },
        });
      } else {
        await prisma.subscription.create({
          data: {
            userId,
            stripeSubscriptionId: stripeSubscription.id,
            stripeCustomerId: customer.id,
            plan: planDetails.key as "SEEKER" | "ADEPT" | "MASTER",
            status: this.mapStripeStatusToPrisma(stripeSubscription.status),
            currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
            currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
            cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end,
          },
        });
      }

      logger.info({
        userId,
        subscriptionId: stripeSubscription.id,
        plan: planDetails.key,
      }, "Subscription synced from Stripe");

      return stripeSubscription;
    } catch (error) {
      logger.error(error, "Failed to sync subscription from Stripe:");
      throw error;
    }
  }

  private mapStripeStatusToPrisma(stripeStatus: string): "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "PAUSED" {
    switch (stripeStatus) {
      case "trialing":
        return "TRIAL";
      case "active":
        return "ACTIVE";
      case "past_due":
        return "PAST_DUE";
      case "canceled":
      case "unpaid":
        return "CANCELED";
      case "paused":
        return "PAUSED";
      default:
        return "ACTIVE";
    }
  }
}