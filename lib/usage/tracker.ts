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
        orderBy: { createdAt: "desc" },
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
        logger.error({ plan: subscription.plan }, "Unknown subscription plan:");
        return { allowed: false, remaining: 0, limit: 0 };
      }

      // Check if unlimited
      if (plan.limits.messagesPerMonth === -1) {
        return { allowed: true, remaining: -1, limit: -1 };
      }

      // Get current month usage
      const usage = await this.getCurrentMonthUsage(subscription.id, metric);
      const limit = this.getMetricLimit(plan, metric);

      return {
        allowed: usage < limit,
        remaining: Math.max(0, limit - usage),
        limit,
      };
    } catch (error) {
      logger.error(error, "Failed to check usage limit:");
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
        orderBy: { createdAt: "desc" },
      });

      if (!subscription) {
        // Track for free users (could be in a different table)
        logger.info({ userId, metric, count }, "Usage tracked for free user");
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

      logger.info({
        userId,
        subscriptionId: subscription.id,
        metric,
        count,
      }, "Usage tracked");
    } catch (error) {
      logger.error(error, "Failed to track usage:");
    }
  }

  async canUseFeature(
    userId: string,
    feature: "export" | "advancedFeatures" | "thinkingMode" | "vipFeatures"
  ): Promise<boolean> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: { in: ["ACTIVE", "TRIAL"] },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!subscription) {
        // Free users don't have access to premium features
        return false;
      }

      const plan =
        SUBSCRIPTION_PLANS[
          subscription.plan as keyof typeof SUBSCRIPTION_PLANS
        ];

      if (!plan) {
        logger.error({ plan: subscription.plan }, "Unknown subscription plan:");
        return false;
      }

      switch (feature) {
        case "export":
          return plan.limits.exportEnabled || false;
        case "advancedFeatures":
          return plan.limits.advancedFeatures || false;
        case "thinkingMode":
          return (plan.limits as any).thinkingMode || false;
        case "vipFeatures":
          return (plan.limits as any).vipFeatures || false;
        default:
          return false;
      }
    } catch (error) {
      logger.error(error, "Failed to check feature access:");
      return false;
    }
  }

  private async getCurrentUsage(
    userId: string,
    metric: "CONVERSATIONS" | "MESSAGES" | "EXPORTS"
  ): Promise<number> {
    // For free users, count total messages
    if (metric === "MESSAGES") {
      const count = await prisma.message.count({
        where: {
          conversation: {
            userId,
          },
        },
      });
      return count;
    }

    if (metric === "CONVERSATIONS") {
      const count = await prisma.conversation.count({
        where: {
          userId,
          status: "ACTIVE",
        },
      });
      return count;
    }

    // For exports, we don't track for free users
    return 0;
  }

  private async getCurrentMonthUsage(
    subscriptionId: string,
    metric: "CONVERSATIONS" | "MESSAGES" | "EXPORTS"
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

  private getMetricLimit(
    plan: typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS],
    metric: "CONVERSATIONS" | "MESSAGES" | "EXPORTS"
  ): number {
    switch (metric) {
      case "MESSAGES":
        return plan.limits.messagesPerMonth;
      case "CONVERSATIONS":
        // Approximate conversations from messages (assume ~5 messages per conversation)
        return plan.limits.messagesPerMonth === -1 ? -1 : Math.floor(plan.limits.messagesPerMonth / 5);
      case "EXPORTS":
        // Export limits based on plan tier
        if (plan.name === "Seeker") return 0; // No exports for Seeker
        if (plan.name === "Adept") return 10; // 10 exports per month for Adept
        return -1; // Unlimited for Master
      default:
        return 0;
    }
  }

  async getUsageStats(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      const freeLimit = parseInt(process.env.FREE_MESSAGES_LIMIT || "10");
      const currentUsage = await this.getCurrentUsage(userId, "MESSAGES");

      return {
        plan: "FREE",
        status: "FREE",
        usage: {
          messages: currentUsage,
          conversations: await this.getCurrentUsage(userId, "CONVERSATIONS"),
          exports: 0,
        },
        limits: {
          messages: freeLimit,
          conversations: Math.floor(freeLimit / 5),
          exports: 0,
        },
        remaining: {
          messages: Math.max(0, freeLimit - currentUsage),
          conversations: Math.max(0, Math.floor(freeLimit / 5) - await this.getCurrentUsage(userId, "CONVERSATIONS")),
          exports: 0,
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
      const key = record.metric.toLowerCase();
      acc[key] = (acc[key] || 0) + record.count;
      return acc;
    }, {} as Record<string, number>);

    const plan =
      SUBSCRIPTION_PLANS[subscription.plan as keyof typeof SUBSCRIPTION_PLANS];

    if (!plan) {
      logger.error({ plan: subscription.plan }, "Unknown subscription plan:");
      return {
        plan: subscription.plan,
        status: subscription.status,
        usage: {},
        limits: {},
        remaining: {},
      };
    }

    const limits = {
      messages: plan.limits.messagesPerMonth,
      conversations: this.getMetricLimit(plan, "CONVERSATIONS"),
      exports: this.getMetricLimit(plan, "EXPORTS"),
    };

    const remaining = {
      messages: limits.messages === -1 ? -1 : Math.max(0, limits.messages - (usage.messages || 0)),
      conversations: limits.conversations === -1 ? -1 : Math.max(0, limits.conversations - (usage.conversations || 0)),
      exports: limits.exports === -1 ? -1 : Math.max(0, limits.exports - (usage.exports || 0)),
    };

    return {
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      usage: {
        messages: usage.messages || 0,
        conversations: usage.conversations || 0,
        exports: usage.exports || 0,
      },
      limits,
      remaining,
      features: plan.limits,
    };
  }

  async resetMonthlyUsage(): Promise<void> {
    try {
      // This would typically be run by a cron job on the 1st of each month
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      lastMonth.setDate(1);
      lastMonth.setHours(0, 0, 0, 0);

      const endOfLastMonth = new Date(lastMonth);
      endOfLastMonth.setMonth(endOfLastMonth.getMonth() + 1);
      endOfLastMonth.setDate(0);
      endOfLastMonth.setHours(23, 59, 59, 999);

      // Archive old usage records (optional - for analytics)
      const recordsToArchive = await prisma.usageRecord.findMany({
        where: {
          date: {
            gte: lastMonth,
            lte: endOfLastMonth,
          },
        },
      });

      logger.info({
        recordsArchived: recordsToArchive.length,
        period: `${lastMonth.toISOString()} to ${endOfLastMonth.toISOString()}`,
      }, "Monthly usage reset completed");

      // Note: Current month's usage naturally starts fresh with new dates
    } catch (error) {
      logger.error(error, "Failed to reset monthly usage:");
      throw error;
    }
  }
}