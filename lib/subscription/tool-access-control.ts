import { prisma } from "@/lib/db/client";
import { SubscriptionPlan } from "@/lib/generated/prisma";
import logger from "@/lib/logger";

export interface ToolAccessLevel {
  tier: SubscriptionPlan;
  allowedTools: string[];
  restrictions: ToolRestriction[];
  limits: UsageLimits;
}

export interface ToolRestriction {
  type: "usage_per_day" | "usage_per_month" | "feature_disabled" | "parameter_limited";
  value: number | string | boolean;
  description: string;
}

export interface UsageLimits {
  dailyToolCalls: number;
  monthlyToolCalls: number;
  voiceGenerationsPerDay: number;
  voiceGenerationsPerMonth: number;
  analyticsAccessLevel: "basic" | "advanced" | "premium" | "full";
  conversationsPerDay: number;
  maxConversationLength: number;
  advancedFeaturesEnabled: boolean;
}

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: SubscriptionPlan;
  currentUsage?: number;
  limit?: number;
  resetsAt?: Date;
}

export interface ToolAccessConfig {
  toolName: string;
  requiredTier: SubscriptionPlan;
  freeTierLimit?: number;
  basicTierLimit?: number;
  premiumFeatures?: string[];
  restrictions?: Record<SubscriptionPlan, ToolRestriction[]>;
}

// Define tool access configurations
export const TOOL_ACCESS_CONFIGS: Record<string, ToolAccessConfig> = {
  // Basic AI Tools - Available to all tiers
  "ritual_generator": {
    toolName: "ritual_generator",
    requiredTier: "FREE_TRIAL",
    freeTierLimit: 3,
    basicTierLimit: 15,
    restrictions: {
      "FREE_TRIAL": [{ type: "usage_per_day", value: 3, description: "Limited to 3 rituals per day" }],
      "SEEKER": [{ type: "usage_per_day", value: 15, description: "Up to 15 rituals per day" }],
      "ADEPT": [],
      "MASTER": []
    }
  },

  "mantra_creator": {
    toolName: "mantra_creator",
    requiredTier: "FREE_TRIAL",
    freeTierLimit: 5,
    basicTierLimit: 25,
    restrictions: {
      "FREE_TRIAL": [{ type: "usage_per_day", value: 5, description: "Limited to 5 mantras per day" }],
      "SEEKER": [{ type: "usage_per_day", value: 25, description: "Up to 25 mantras per day" }],
      "ADEPT": [],
      "MASTER": []
    }
  },

  "meditation_generator": {
    toolName: "meditation_generator",
    requiredTier: "FREE_TRIAL",
    freeTierLimit: 2,
    basicTierLimit: 10,
    restrictions: {
      "FREE_TRIAL": [{ type: "usage_per_day", value: 2, description: "Limited to 2 meditations per day" }],
      "SEEKER": [{ type: "usage_per_day", value: 10, description: "Up to 10 meditations per day" }],
      "ADEPT": [],
      "MASTER": []
    }
  },

  // Intermediate AI Tools - Require at least SEEKER tier
  "dream_interpreter": {
    toolName: "dream_interpreter",
    requiredTier: "SEEKER",
    freeTierLimit: 0,
    basicTierLimit: 10,
    restrictions: {
      "FREE_TRIAL": [{ type: "feature_disabled", value: true, description: "Upgrade to SEEKER for dream interpretation" }],
      "SEEKER": [{ type: "usage_per_day", value: 10, description: "Up to 10 dream interpretations per day" }],
      "ADEPT": [{ type: "usage_per_day", value: 25, description: "Up to 25 dream interpretations per day" }],
      "MASTER": []
    }
  },

  "challenge_analyzer": {
    toolName: "challenge_analyzer",
    requiredTier: "SEEKER",
    freeTierLimit: 0,
    basicTierLimit: 8,
    restrictions: {
      "FREE_TRIAL": [{ type: "feature_disabled", value: true, description: "Upgrade to SEEKER for challenge analysis" }],
      "SEEKER": [{ type: "usage_per_day", value: 8, description: "Up to 8 challenge analyses per day" }],
      "ADEPT": [{ type: "usage_per_day", value: 20, description: "Up to 20 challenge analyses per day" }],
      "MASTER": []
    }
  },

  "numerology_calculator": {
    toolName: "numerology_calculator",
    requiredTier: "SEEKER",
    freeTierLimit: 0,
    basicTierLimit: 5,
    restrictions: {
      "FREE_TRIAL": [{ type: "feature_disabled", value: true, description: "Upgrade to SEEKER for numerology readings" }],
      "SEEKER": [{ type: "usage_per_day", value: 5, description: "Up to 5 numerology readings per day" }],
      "ADEPT": [{ type: "usage_per_day", value: 15, description: "Up to 15 numerology readings per day" }],
      "MASTER": []
    }
  },

  // Advanced AI Tools - Require at least ADEPT tier
  "tarot_reader": {
    toolName: "tarot_reader",
    requiredTier: "ADEPT",
    freeTierLimit: 0,
    basicTierLimit: 0,
    premiumFeatures: ["celtic_cross", "custom_spreads", "advanced_interpretations"],
    restrictions: {
      "FREE_TRIAL": [{ type: "feature_disabled", value: true, description: "Upgrade to ADEPT for tarot readings" }],
      "SEEKER": [{ type: "feature_disabled", value: true, description: "Upgrade to ADEPT for tarot readings" }],
      "ADEPT": [
        { type: "usage_per_day", value: 5, description: "Up to 5 tarot readings per day" },
        { type: "parameter_limited", value: "basic_spreads", description: "Limited to basic spreads" }
      ],
      "MASTER": []
    }
  },

  "sigil_creator": {
    toolName: "sigil_creator",
    requiredTier: "ADEPT",
    freeTierLimit: 0,
    basicTierLimit: 0,
    premiumFeatures: ["advanced_methods", "custom_alphabets", "batch_creation"],
    restrictions: {
      "FREE_TRIAL": [{ type: "feature_disabled", value: true, description: "Upgrade to ADEPT for sigil creation" }],
      "SEEKER": [{ type: "feature_disabled", value: true, description: "Upgrade to ADEPT for sigil creation" }],
      "ADEPT": [
        { type: "usage_per_day", value: 3, description: "Up to 3 sigils per day" },
        { type: "parameter_limited", value: "basic_methods", description: "Limited to basic creation methods" }
      ],
      "MASTER": []
    }
  },

  // Premium AI Tools - Require MASTER tier
  "gpt5_thinking_mode": {
    toolName: "gpt5_thinking_mode",
    requiredTier: "MASTER",
    freeTierLimit: 0,
    basicTierLimit: 0,
    premiumFeatures: ["deep_analysis", "multi_step_reasoning", "philosophical_inquiry"],
    restrictions: {
      "FREE_TRIAL": [{ type: "feature_disabled", value: true, description: "Upgrade to MASTER for advanced thinking mode" }],
      "SEEKER": [{ type: "feature_disabled", value: true, description: "Upgrade to MASTER for advanced thinking mode" }],
      "ADEPT": [
        { type: "usage_per_day", value: 2, description: "Up to 2 thinking sessions per day" },
        { type: "parameter_limited", value: "basic_analysis", description: "Limited to basic analysis" }
      ],
      "MASTER": []
    }
  },

  "transformation_program": {
    toolName: "transformation_program",
    requiredTier: "MASTER",
    freeTierLimit: 0,
    basicTierLimit: 0,
    premiumFeatures: ["personalized_programs", "advanced_guidance", "progress_tracking"],
    restrictions: {
      "FREE_TRIAL": [{ type: "feature_disabled", value: true, description: "Upgrade to MASTER for transformation programs" }],
      "SEEKER": [{ type: "feature_disabled", value: true, description: "Upgrade to MASTER for transformation programs" }],
      "ADEPT": [
        { type: "usage_per_month", value: 2, description: "Up to 2 programs per month" },
        { type: "parameter_limited", value: "basic_guidance", description: "Limited guidance features" }
      ],
      "MASTER": []
    }
  },

  // Voice Generation
  "voice_generation": {
    toolName: "voice_generation",
    requiredTier: "SEEKER",
    freeTierLimit: 0,
    basicTierLimit: 50,
    restrictions: {
      "FREE_TRIAL": [{ type: "feature_disabled", value: true, description: "Upgrade to SEEKER for voice generation" }],
      "SEEKER": [
        { type: "usage_per_day", value: 50, description: "Up to 50 voice generations per day" },
        { type: "parameter_limited", value: "basic_voices", description: "Limited to 3 voice options" }
      ],
      "ADEPT": [
        { type: "usage_per_day", value: 200, description: "Up to 200 voice generations per day" },
        { type: "parameter_limited", value: "premium_voices", description: "Access to all voice options" }
      ],
      "MASTER": []
    }
  },

  // Analytics
  "analytics_spiritual": {
    toolName: "analytics_spiritual",
    requiredTier: "FREE_TRIAL",
    restrictions: {
      "FREE_TRIAL": [{ type: "parameter_limited", value: "basic", description: "Basic analytics only" }],
      "SEEKER": [{ type: "parameter_limited", value: "advanced", description: "Advanced analytics included" }],
      "ADEPT": [{ type: "parameter_limited", value: "premium", description: "Premium analytics with insights" }],
      "MASTER": [{ type: "parameter_limited", value: "full", description: "Complete analytics suite" }]
    }
  },

  "analytics_tools": {
    toolName: "analytics_tools",
    requiredTier: "ADEPT",
    restrictions: {
      "FREE_TRIAL": [{ type: "feature_disabled", value: true, description: "Upgrade to ADEPT for tool analytics" }],
      "SEEKER": [{ type: "feature_disabled", value: true, description: "Upgrade to ADEPT for tool analytics" }],
      "ADEPT": [{ type: "parameter_limited", value: "basic", description: "Basic tool analytics" }],
      "MASTER": [{ type: "parameter_limited", value: "full", description: "Complete tool analytics suite" }]
    }
  }
};

// Usage limits by subscription tier
export const SUBSCRIPTION_LIMITS: Record<SubscriptionPlan, UsageLimits> = {
  "FREE_TRIAL": {
    dailyToolCalls: 15,
    monthlyToolCalls: 200,
    voiceGenerationsPerDay: 0,
    voiceGenerationsPerMonth: 0,
    analyticsAccessLevel: "basic",
    conversationsPerDay: 10,
    maxConversationLength: 20,
    advancedFeaturesEnabled: false
  },
  "SEEKER": {
    dailyToolCalls: 100,
    monthlyToolCalls: 2000,
    voiceGenerationsPerDay: 50,
    voiceGenerationsPerMonth: 1000,
    analyticsAccessLevel: "advanced",
    conversationsPerDay: 50,
    maxConversationLength: 100,
    advancedFeaturesEnabled: true
  },
  "ADEPT": {
    dailyToolCalls: 300,
    monthlyToolCalls: 7000,
    voiceGenerationsPerDay: 200,
    voiceGenerationsPerMonth: 4000,
    analyticsAccessLevel: "premium",
    conversationsPerDay: 150,
    maxConversationLength: 500,
    advancedFeaturesEnabled: true
  },
  "MASTER": {
    dailyToolCalls: -1, // Unlimited
    monthlyToolCalls: -1, // Unlimited
    voiceGenerationsPerDay: -1, // Unlimited
    voiceGenerationsPerMonth: -1, // Unlimited
    analyticsAccessLevel: "full",
    conversationsPerDay: -1, // Unlimited
    maxConversationLength: -1, // Unlimited
    advancedFeaturesEnabled: true
  }
};

export class ToolAccessController {
  
  async checkToolAccess(
    userId: string,
    toolName: string,
    parameters?: Record<string, unknown>
  ): Promise<AccessCheckResult> {
    try {
      // Get user's subscription
      const userSubscription = await this.getUserSubscription(userId);
      const userTier = userSubscription?.plan || "FREE_TRIAL";

      // Get tool configuration
      const toolConfig = TOOL_ACCESS_CONFIGS[toolName];
      if (!toolConfig) {
        return { allowed: true }; // Allow access to unconfigured tools
      }

      // Check if user tier meets minimum requirement
      if (!this.isTierSufficient(userTier, toolConfig.requiredTier)) {
        return {
          allowed: false,
          reason: `${toolName} requires ${toolConfig.requiredTier} subscription or higher`,
          upgradeRequired: toolConfig.requiredTier
        };
      }

      // Check usage limits
      const usageCheck = await this.checkUsageLimits(userId, toolName, userTier);
      if (!usageCheck.allowed) {
        return usageCheck;
      }

      // Check parameter restrictions
      const paramCheck = this.checkParameterRestrictions(toolConfig, userTier, parameters);
      if (!paramCheck.allowed) {
        return paramCheck;
      }

      return { allowed: true };

    } catch (error) {
      logger.error({ error, userId, toolName }, "Failed to check tool access");
      return {
        allowed: false,
        reason: "Access check failed - please try again"
      };
    }
  }

  async checkUsageLimits(
    userId: string,
    toolName: string,
    userTier: SubscriptionPlan
  ): Promise<AccessCheckResult> {
    try {
      const toolConfig = TOOL_ACCESS_CONFIGS[toolName];
      if (!toolConfig || !toolConfig.restrictions) {
        return { allowed: true };
      }

      const restrictions = toolConfig.restrictions[userTier];
      if (!restrictions) {
        return { allowed: true };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Get current usage
      const [dailyUsage, monthlyUsage] = await Promise.all([
        this.getToolUsage(userId, toolName, today),
        this.getToolUsage(userId, toolName, currentMonth)
      ]);

      // Check each restriction
      for (const restriction of restrictions) {
        switch (restriction.type) {
          case "usage_per_day":
            if (dailyUsage >= (restriction.value as number)) {
              const resetTime = new Date(today);
              resetTime.setDate(resetTime.getDate() + 1);
              return {
                allowed: false,
                reason: restriction.description,
                currentUsage: dailyUsage,
                limit: restriction.value as number,
                resetsAt: resetTime
              };
            }
            break;

          case "usage_per_month":
            if (monthlyUsage >= (restriction.value as number)) {
              const resetTime = new Date(currentMonth);
              resetTime.setMonth(resetTime.getMonth() + 1);
              return {
                allowed: false,
                reason: restriction.description,
                currentUsage: monthlyUsage,
                limit: restriction.value as number,
                resetsAt: resetTime
              };
            }
            break;

          case "feature_disabled":
            if (restriction.value === true) {
              return {
                allowed: false,
                reason: restriction.description,
                upgradeRequired: this.getNextTier(userTier)
              };
            }
            break;
        }
      }

      return { allowed: true };

    } catch (error) {
      logger.error({ error, userId, toolName, userTier }, "Failed to check usage limits");
      return {
        allowed: false,
        reason: "Usage check failed - please try again"
      };
    }
  }

  checkParameterRestrictions(
    toolConfig: ToolAccessConfig,
    userTier: SubscriptionPlan,
    parameters?: Record<string, unknown>
  ): AccessCheckResult {
    if (!toolConfig.restrictions || !parameters) {
      return { allowed: true };
    }

    const restrictions = toolConfig.restrictions[userTier];
    if (!restrictions) {
      return { allowed: true };
    }

    // Check parameter-based restrictions
    for (const restriction of restrictions) {
      if (restriction.type === "parameter_limited") {
        const limitedTo = restriction.value as string;
        
        // Tool-specific parameter checks
        switch (toolConfig.toolName) {
          case "tarot_reader":
            if (limitedTo === "basic_spreads" && parameters.spread && !["three_card", "simple_cross"].includes(parameters.spread as string)) {
              return {
                allowed: false,
                reason: "Advanced spreads require MASTER subscription",
                upgradeRequired: "MASTER"
              };
            }
            break;

          case "voice_generation":
            if (limitedTo === "basic_voices" && parameters.voice && !["alloy", "echo", "fable"].includes(parameters.voice as string)) {
              return {
                allowed: false,
                reason: "Premium voices require ADEPT subscription",
                upgradeRequired: "ADEPT"
              };
            }
            break;

          case "sigil_creator":
            if (limitedTo === "basic_methods" && parameters.method && parameters.method !== "simple") {
              return {
                allowed: false,
                reason: "Advanced methods require MASTER subscription",
                upgradeRequired: "MASTER"
              };
            }
            break;
        }
      }
    }

    return { allowed: true };
  }

  async getUserSubscription(userId: string) {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: "ACTIVE"
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      return subscription;
    } catch (error) {
      logger.error({ error, userId }, "Failed to get user subscription");
      return null;
    }
  }

  async getToolUsage(userId: string, toolName: string, fromDate: Date): Promise<number> {
    try {
      const count = await prisma.message.count({
        where: {
          conversation: { userId },
          createdAt: { gte: fromDate },
          metadata: {
            path: ["toolUsage", "toolName"],
            equals: toolName
          }
        }
      });

      return count;
    } catch (error) {
      logger.error({ error, userId, toolName, fromDate }, "Failed to get tool usage");
      return 0;
    }
  }

  private isTierSufficient(userTier: SubscriptionPlan, requiredTier: SubscriptionPlan): boolean {
    const tierHierarchy: Record<SubscriptionPlan, number> = {
      "FREE_TRIAL": 0,
      "SEEKER": 1,
      "ADEPT": 2,
      "MASTER": 3
    };

    return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
  }

  private getNextTier(currentTier: SubscriptionPlan): SubscriptionPlan | undefined {
    const nextTierMap: Record<SubscriptionPlan, SubscriptionPlan | undefined> = {
      "FREE_TRIAL": "SEEKER",
      "SEEKER": "ADEPT",
      "ADEPT": "MASTER",
      "MASTER": undefined
    };

    return nextTierMap[currentTier];
  }

  async getAvailableTools(userId: string): Promise<{
    available: string[];
    restricted: { toolName: string; reason: string; upgradeRequired?: SubscriptionPlan }[];
  }> {
    try {
      const userSubscription = await this.getUserSubscription(userId);
      const userTier = userSubscription?.plan || "FREE_TRIAL";

      const available: string[] = [];
      const restricted: { toolName: string; reason: string; upgradeRequired?: SubscriptionPlan }[] = [];

      for (const [toolName, config] of Object.entries(TOOL_ACCESS_CONFIGS)) {
        const accessCheck = await this.checkToolAccess(userId, toolName);
        
        if (accessCheck.allowed) {
          available.push(toolName);
        } else {
          restricted.push({
            toolName,
            reason: accessCheck.reason || "Access restricted",
            upgradeRequired: accessCheck.upgradeRequired
          });
        }
      }

      return { available, restricted };
    } catch (error) {
      logger.error({ error, userId }, "Failed to get available tools");
      return { available: [], restricted: [] };
    }
  }

  async getSubscriptionUsageStats(userId: string): Promise<{
    currentTier: SubscriptionPlan;
    limits: UsageLimits;
    usage: {
      dailyToolCalls: number;
      monthlyToolCalls: number;
      dailyVoiceGenerations: number;
      monthlyVoiceGenerations: number;
      dailyConversations: number;
    };
    percentagesUsed: {
      dailyTools: number;
      monthlyTools: number;
      dailyVoice: number;
      monthlyVoice: number;
    };
  }> {
    try {
      const userSubscription = await this.getUserSubscription(userId);
      const currentTier = userSubscription?.plan || "FREE_TRIAL";
      const limits = SUBSCRIPTION_LIMITS[currentTier];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Get usage counts
      const [dailyTools, monthlyTools, dailyVoice, monthlyVoice, dailyConversations] = await Promise.all([
        this.getDailyToolUsage(userId, today),
        this.getMonthlyToolUsage(userId, currentMonth),
        this.getDailyVoiceUsage(userId, today),
        this.getMonthlyVoiceUsage(userId, currentMonth),
        this.getDailyConversationUsage(userId, today)
      ]);

      // Calculate percentages used
      const percentagesUsed = {
        dailyTools: limits.dailyToolCalls > 0 ? (dailyTools / limits.dailyToolCalls) * 100 : 0,
        monthlyTools: limits.monthlyToolCalls > 0 ? (monthlyTools / limits.monthlyToolCalls) * 100 : 0,
        dailyVoice: limits.voiceGenerationsPerDay > 0 ? (dailyVoice / limits.voiceGenerationsPerDay) * 100 : 0,
        monthlyVoice: limits.voiceGenerationsPerMonth > 0 ? (monthlyVoice / limits.voiceGenerationsPerMonth) * 100 : 0
      };

      return {
        currentTier,
        limits,
        usage: {
          dailyToolCalls: dailyTools,
          monthlyToolCalls: monthlyTools,
          dailyVoiceGenerations: dailyVoice,
          monthlyVoiceGenerations: monthlyVoice,
          dailyConversations: dailyConversations
        },
        percentagesUsed
      };

    } catch (error) {
      logger.error({ error, userId }, "Failed to get subscription usage stats");
      throw error;
    }
  }

  private async getDailyToolUsage(userId: string, date: Date): Promise<number> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    return prisma.message.count({
      where: {
        conversation: { userId },
        createdAt: { gte: date, lt: nextDay },
        metadata: {
          path: ["toolUsage", "toolType"],
          equals: "ai_tool"
        }
      }
    });
  }

  private async getMonthlyToolUsage(userId: string, monthStart: Date): Promise<number> {
    const nextMonth = new Date(monthStart);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return prisma.message.count({
      where: {
        conversation: { userId },
        createdAt: { gte: monthStart, lt: nextMonth },
        metadata: {
          path: ["toolUsage", "toolType"],
          equals: "ai_tool"
        }
      }
    });
  }

  private async getDailyVoiceUsage(userId: string, date: Date): Promise<number> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    return prisma.message.count({
      where: {
        conversation: { userId },
        createdAt: { gte: date, lt: nextDay },
        metadata: {
          path: ["toolUsage", "toolType"],
          equals: "voice_generation"
        }
      }
    });
  }

  private async getMonthlyVoiceUsage(userId: string, monthStart: Date): Promise<number> {
    const nextMonth = new Date(monthStart);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return prisma.message.count({
      where: {
        conversation: { userId },
        createdAt: { gte: monthStart, lt: nextMonth },
        metadata: {
          path: ["toolUsage", "toolType"],
          equals: "voice_generation"
        }
      }
    });
  }

  private async getDailyConversationUsage(userId: string, date: Date): Promise<number> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    return prisma.conversation.count({
      where: {
        userId,
        createdAt: { gte: date, lt: nextDay }
      }
    });
  }
}

// Export singleton instance
export const toolAccessController = new ToolAccessController();