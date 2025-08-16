import { prisma } from "@/lib/db/client";
import { Prisma } from "@/lib/generated/prisma";
import logger from "@/lib/logger";

export interface ToolUsageEvent {
  userId: string;
  toolName: string;
  toolType: "ai_tool" | "voice_generation" | "analytics" | "conversation";
  sessionId?: string;
  conversationId?: string;
  parameters?: Record<string, unknown>;
  executionTime?: number;
  success: boolean;
  errorMessage?: string;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
  userTier: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ToolUsageStats {
  toolName: string;
  totalUsage: number;
  successRate: number;
  averageExecutionTime: number;
  totalCost: number;
  uniqueUsers: number;
  usageByTier: Record<string, number>;
  commonParameters: Record<string, number>;
  errorTypes: Record<string, number>;
  usageTrends: UsageTrend[];
}

export interface UsageTrend {
  date: string;
  usage: number;
  uniqueUsers: number;
  successRate: number;
  averageExecutionTime: number;
}

export interface UserToolMetrics {
  userId: string;
  totalToolUsage: number;
  favoriteTools: ToolPreference[];
  usagePatterns: UsagePattern[];
  efficiencyScore: number;
  explorationScore: number;
  consistencyScore: number;
  advancedFeatureUsage: number;
  monthlyUsage: MonthlyUsage[];
}

export interface ToolPreference {
  toolName: string;
  usageCount: number;
  successRate: number;
  averageExecutionTime: number;
  lastUsed: Date;
  proficiencyLevel: "novice" | "intermediate" | "advanced" | "expert";
}

export interface UsagePattern {
  pattern: string;
  frequency: number;
  description: string;
  timeOfDay: string;
  dayOfWeek: string;
}

export interface MonthlyUsage {
  month: string;
  toolUsage: number;
  voiceGeneration: number;
  analytics: number;
  conversations: number;
  totalCost: number;
}

export interface ToolPerformanceMetrics {
  toolName: string;
  averageResponseTime: number;
  p95ResponseTime: number;
  errorRate: number;
  throughput: number;
  resourceUtilization: number;
  userSatisfactionScore: number;
  retryRate: number;
  abandonmentRate: number;
}

export interface SystemWideAnalytics {
  totalTools: number;
  totalUsage: number;
  activeUsers: number;
  mostPopularTools: string[];
  leastUsedTools: string[];
  performanceBottlenecks: string[];
  costOptimizationOpportunities: string[];
  featureAdoptionRates: Record<string, number>;
}

export class ToolUsageTracker {
  
  async trackToolUsage(event: ToolUsageEvent): Promise<void> {
    try {
      // Store in conversation message metadata if applicable
      if (event.conversationId) {
        await this.addToolUsageToConversation(event);
      }

      // Store in usage records for billing/analytics
      await this.recordUsageMetric(event);

      // Log for monitoring
      logger.info({
        userId: event.userId,
        toolName: event.toolName,
        toolType: event.toolType,
        success: event.success,
        executionTime: event.executionTime,
        cost: event.cost,
        userTier: event.userTier
      }, "Tool usage tracked");

    } catch (error) {
      logger.error({ 
        error, 
        event: { ...event, parameters: undefined } // Don't log parameters for privacy
      }, "Failed to track tool usage");
    }
  }

  async getToolUsageStats(
    toolName?: string,
    startDate?: Date,
    endDate?: Date,
    userTier?: string
  ): Promise<ToolUsageStats[]> {
    try {
      const whereClause: any = {};
      
      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: startDate,
          lte: endDate
        };
      }

      const messages = await prisma.message.findMany({
        where: {
          metadata: {
            path: ["toolUsage"],
            not: Prisma.JsonNull
          },
          ...whereClause
        },
        include: {
          conversation: {
            include: {
              user: {
                include: {
                  subscriptions: {
                    where: { status: "ACTIVE" },
                    take: 1
                  }
                }
              }
            }
          }
        }
      });

      // Group by tool and calculate stats
      const toolStats = new Map<string, {
        usage: number;
        successCount: number;
        totalExecutionTime: number;
        totalCost: number;
        users: Set<string>;
        tiers: Map<string, number>;
        parameters: Map<string, number>;
        errors: Map<string, number>;
        dailyUsage: Map<string, { usage: number; users: Set<string>; successCount: number; totalTime: number }>;
      }>();

      messages.forEach(message => {
        const toolUsage = message.metadata as any;
        if (!toolUsage?.toolUsage) return;

        const tool = toolUsage.toolUsage.toolName;
        if (toolName && tool !== toolName) return;

        const userTierValue = message.conversation.user.subscriptions[0]?.plan || "FREE_TRIAL";
        if (userTier && userTierValue !== userTier) return;

        if (!toolStats.has(tool)) {
          toolStats.set(tool, {
            usage: 0,
            successCount: 0,
            totalExecutionTime: 0,
            totalCost: 0,
            users: new Set(),
            tiers: new Map(),
            parameters: new Map(),
            errors: new Map(),
            dailyUsage: new Map()
          });
        }

        const stats = toolStats.get(tool)!;
        stats.usage++;
        
        if (toolUsage.toolUsage.success) {
          stats.successCount++;
        } else if (toolUsage.toolUsage.errorMessage) {
          const errorKey = this.categorizeError(toolUsage.toolUsage.errorMessage);
          stats.errors.set(errorKey, (stats.errors.get(errorKey) || 0) + 1);
        }

        stats.totalExecutionTime += toolUsage.toolUsage.executionTime || 0;
        stats.totalCost += toolUsage.toolUsage.cost || 0;
        stats.users.add(message.conversation.userId);
        stats.tiers.set(userTierValue, (stats.tiers.get(userTierValue) || 0) + 1);

        // Track parameters
        if (toolUsage.toolUsage.parameters) {
          Object.keys(toolUsage.toolUsage.parameters).forEach(param => {
            stats.parameters.set(param, (stats.parameters.get(param) || 0) + 1);
          });
        }

        // Track daily usage
        const dateKey = message.createdAt.toISOString().split('T')[0];
        if (!stats.dailyUsage.has(dateKey)) {
          stats.dailyUsage.set(dateKey, { usage: 0, users: new Set(), successCount: 0, totalTime: 0 });
        }
        const dailyStats = stats.dailyUsage.get(dateKey)!;
        dailyStats.usage++;
        dailyStats.users.add(message.conversation.userId);
        if (toolUsage.toolUsage.success) {
          dailyStats.successCount++;
        }
        dailyStats.totalTime += toolUsage.toolUsage.executionTime || 0;
      });

      // Convert to ToolUsageStats array
      return Array.from(toolStats.entries()).map(([toolName, stats]) => ({
        toolName,
        totalUsage: stats.usage,
        successRate: stats.usage > 0 ? stats.successCount / stats.usage : 0,
        averageExecutionTime: stats.usage > 0 ? stats.totalExecutionTime / stats.usage : 0,
        totalCost: stats.totalCost,
        uniqueUsers: stats.users.size,
        usageByTier: Object.fromEntries(stats.tiers),
        commonParameters: Object.fromEntries(
          Array.from(stats.parameters.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
        ),
        errorTypes: Object.fromEntries(stats.errors),
        usageTrends: Array.from(stats.dailyUsage.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([date, dailyStats]) => ({
            date,
            usage: dailyStats.usage,
            uniqueUsers: dailyStats.users.size,
            successRate: dailyStats.usage > 0 ? dailyStats.successCount / dailyStats.usage : 0,
            averageExecutionTime: dailyStats.usage > 0 ? dailyStats.totalTime / dailyStats.usage : 0
          }))
      }));

    } catch (error) {
      logger.error({ error, toolName, startDate, endDate, userTier }, "Failed to get tool usage stats");
      throw error;
    }
  }

  async getUserToolMetrics(userId: string, days: number = 30): Promise<UserToolMetrics> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      const messages = await prisma.message.findMany({
        where: {
          conversation: { userId },
          createdAt: { gte: startDate, lte: endDate },
          metadata: {
            path: ["toolUsage"],
            not: Prisma.JsonNull
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      const toolUsage = new Map<string, {
        count: number;
        successCount: number;
        totalTime: number;
        lastUsed: Date;
        sessions: Set<string>;
      }>();

      const patterns = new Map<string, number>();
      const hourlyUsage = new Array(24).fill(0);
      const dailyUsage = new Array(7).fill(0);
      const monthlyStats: Record<string, MonthlyUsage> = {};

      let totalUsage = 0;
      let totalExecutionTime = 0;
      let successfulUsages = 0;

      messages.forEach(message => {
        const toolData = message.metadata as any;
        if (!toolData?.toolUsage) return;

        const tool = toolData.toolUsage.toolName;
        const conversationId = message.conversationId;
        
        totalUsage++;
        if (toolData.toolUsage.success) {
          successfulUsages++;
        }
        totalExecutionTime += toolData.toolUsage.executionTime || 0;

        // Track tool-specific metrics
        if (!toolUsage.has(tool)) {
          toolUsage.set(tool, {
            count: 0,
            successCount: 0,
            totalTime: 0,
            lastUsed: message.createdAt,
            sessions: new Set()
          });
        }

        const stats = toolUsage.get(tool)!;
        stats.count++;
        if (toolData.toolUsage.success) {
          stats.successCount++;
        }
        stats.totalTime += toolData.toolUsage.executionTime || 0;
        stats.lastUsed = message.createdAt;
        stats.sessions.add(conversationId);

        // Track usage patterns
        const hour = message.createdAt.getHours();
        const dayOfWeek = message.createdAt.getDay();
        hourlyUsage[hour]++;
        dailyUsage[dayOfWeek]++;

        // Pattern detection
        this.detectUsagePatterns(toolData.toolUsage, patterns);

        // Monthly usage
        const monthKey = message.createdAt.toISOString().slice(0, 7); // YYYY-MM
        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = {
            month: monthKey,
            toolUsage: 0,
            voiceGeneration: 0,
            analytics: 0,
            conversations: 0,
            totalCost: 0
          };
        }

        const monthStats = monthlyStats[monthKey];
        switch (toolData.toolUsage.toolType) {
          case "ai_tool":
            monthStats.toolUsage++;
            break;
          case "voice_generation":
            monthStats.voiceGeneration++;
            break;
          case "analytics":
            monthStats.analytics++;
            break;
          case "conversation":
            monthStats.conversations++;
            break;
        }
        monthStats.totalCost += toolData.toolUsage.cost || 0;
      });

      // Calculate favorite tools
      const favoriteTools: ToolPreference[] = Array.from(toolUsage.entries())
        .map(([toolName, stats]) => ({
          toolName,
          usageCount: stats.count,
          successRate: stats.count > 0 ? stats.successCount / stats.count : 0,
          averageExecutionTime: stats.count > 0 ? stats.totalTime / stats.count : 0,
          lastUsed: stats.lastUsed,
          proficiencyLevel: this.calculateProficiencyLevel(stats.count, stats.successCount / stats.count)
        }))
        .sort((a, b) => b.usageCount - a.usageCount);

      // Calculate scores
      const efficiencyScore = this.calculateEfficiencyScore(totalUsage, totalExecutionTime, successfulUsages);
      const explorationScore = this.calculateExplorationScore(toolUsage.size, totalUsage);
      const consistencyScore = this.calculateConsistencyScore(dailyUsage);
      const advancedFeatureUsage = this.calculateAdvancedFeatureUsage(favoriteTools);

      // Extract usage patterns
      const usagePatterns: UsagePattern[] = this.extractUsagePatterns(patterns, hourlyUsage, dailyUsage);

      return {
        userId,
        totalToolUsage: totalUsage,
        favoriteTools,
        usagePatterns,
        efficiencyScore,
        explorationScore,
        consistencyScore,
        advancedFeatureUsage,
        monthlyUsage: Object.values(monthlyStats).sort((a, b) => a.month.localeCompare(b.month))
      };

    } catch (error) {
      logger.error({ error, userId, days }, "Failed to get user tool metrics");
      throw error;
    }
  }

  async getToolPerformanceMetrics(toolName: string, days: number = 7): Promise<ToolPerformanceMetrics> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      const messages = await prisma.message.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          metadata: {
            path: ["toolUsage", "toolName"],
            equals: toolName
          }
        }
      });

      if (messages.length === 0) {
        return {
          toolName,
          averageResponseTime: 0,
          p95ResponseTime: 0,
          errorRate: 0,
          throughput: 0,
          resourceUtilization: 0,
          userSatisfactionScore: 0,
          retryRate: 0,
          abandonmentRate: 0
        };
      }

      const executionTimes: number[] = [];
      let successCount = 0;
      let retryCount = 0;
      let abandonmentCount = 0;

      messages.forEach(message => {
        const toolData = message.metadata as any;
        if (!toolData?.toolUsage) return;

        const execTime = toolData.toolUsage.executionTime || 0;
        executionTimes.push(execTime);

        if (toolData.toolUsage.success) {
          successCount++;
        }

        // Simple heuristics for retry/abandonment detection
        if (execTime > 30000) { // > 30 seconds might indicate retry
          retryCount++;
        }
        if (!toolData.toolUsage.success && execTime < 1000) { // Fast failure might indicate abandonment
          abandonmentCount++;
        }
      });

      executionTimes.sort((a, b) => a - b);
      const p95Index = Math.floor(executionTimes.length * 0.95);
      const averageResponseTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
      const p95ResponseTime = executionTimes[p95Index] || 0;
      const errorRate = 1 - (successCount / messages.length);
      const throughput = messages.length / days; // uses per day
      
      // Simple satisfaction heuristic based on success rate and response time
      const userSatisfactionScore = Math.max(0, 1 - errorRate - (averageResponseTime / 60000)); // Penalize long response times

      return {
        toolName,
        averageResponseTime,
        p95ResponseTime,
        errorRate,
        throughput,
        resourceUtilization: 0, // Would need system metrics for this
        userSatisfactionScore,
        retryRate: retryCount / messages.length,
        abandonmentRate: abandonmentCount / messages.length
      };

    } catch (error) {
      logger.error({ error, toolName, days }, "Failed to get tool performance metrics");
      throw error;
    }
  }

  async getSystemWideAnalytics(): Promise<SystemWideAnalytics> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Get all tool usage from the last 30 days
      const messages = await prisma.message.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          metadata: {
            path: ["toolUsage"],
            not: Prisma.JsonNull
          }
        },
        include: {
          conversation: {
            select: { userId: true }
          }
        }
      });

      const toolStats = new Map<string, { usage: number; users: Set<string>; cost: number }>();
      const activeUsers = new Set<string>();
      let totalUsage = 0;
      let totalCost = 0;

      messages.forEach(message => {
        const toolData = message.metadata as any;
        if (!toolData?.toolUsage) return;

        const toolName = toolData.toolUsage.toolName;
        const userId = message.conversation.userId;
        const cost = toolData.toolUsage.cost || 0;

        totalUsage++;
        totalCost += cost;
        activeUsers.add(userId);

        if (!toolStats.has(toolName)) {
          toolStats.set(toolName, { usage: 0, users: new Set(), cost: 0 });
        }

        const stats = toolStats.get(toolName)!;
        stats.usage++;
        stats.users.add(userId);
        stats.cost += cost;
      });

      // Sort tools by usage
      const sortedTools = Array.from(toolStats.entries())
        .sort((a, b) => b[1].usage - a[1].usage);

      const mostPopularTools = sortedTools.slice(0, 5).map(([name]) => name);
      const leastUsedTools = sortedTools.slice(-5).map(([name]) => name);

      // Identify performance bottlenecks (tools with high usage but low adoption)
      const performanceBottlenecks = sortedTools
        .filter(([_, stats]) => stats.usage > 100 && stats.users.size < 10)
        .slice(0, 3)
        .map(([name]) => name);

      // Cost optimization opportunities (high cost, low value tools)
      const costOptimizationOpportunities = sortedTools
        .filter(([_, stats]) => stats.cost > totalCost * 0.1 && stats.users.size < activeUsers.size * 0.05)
        .slice(0, 3)
        .map(([name]) => name);

      // Feature adoption rates
      const featureAdoptionRates: Record<string, number> = {};
      toolStats.forEach((stats, toolName) => {
        featureAdoptionRates[toolName] = stats.users.size / activeUsers.size;
      });

      return {
        totalTools: toolStats.size,
        totalUsage,
        activeUsers: activeUsers.size,
        mostPopularTools,
        leastUsedTools,
        performanceBottlenecks,
        costOptimizationOpportunities,
        featureAdoptionRates
      };

    } catch (error) {
      logger.error({ error }, "Failed to get system-wide analytics");
      throw error;
    }
  }

  // Private helper methods

  private async addToolUsageToConversation(event: ToolUsageEvent): Promise<void> {
    try {
      await prisma.message.create({
        data: {
          conversationId: event.conversationId!,
          role: "SYSTEM",
          content: `Tool: ${event.toolName}`,
          metadata: {
            toolUsage: {
              toolName: event.toolName,
              toolType: event.toolType,
              success: event.success,
              executionTime: event.executionTime,
              cost: event.cost,
              userTier: event.userTier,
              errorMessage: event.errorMessage,
              parameters: event.parameters ? JSON.parse(JSON.stringify(event.parameters)) : null,
              timestamp: event.timestamp.toISOString()
            }
          } as Prisma.InputJsonValue
        }
      });
    } catch (error) {
      logger.error({ error, conversationId: event.conversationId }, "Failed to add tool usage to conversation");
    }
  }

  private async recordUsageMetric(event: ToolUsageEvent): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: event.userId },
        include: { subscriptions: { where: { status: "ACTIVE" }, take: 1 } }
      });

      if (!user?.subscriptions[0]) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.usageRecord.upsert({
        where: {
          subscriptionId_metric_date: {
            subscriptionId: user.subscriptions[0].id,
            metric: "API_CALLS",
            date: today
          }
        },
        create: {
          subscriptionId: user.subscriptions[0].id,
          metric: "API_CALLS",
          count: 1,
          date: today,
          metadata: {
            toolName: event.toolName,
            toolType: event.toolType,
            cost: event.cost
          } as Prisma.InputJsonValue
        },
        update: {
          count: { increment: 1 },
          metadata: {
            lastTool: event.toolName,
            totalCost: (event.cost || 0)
          } as Prisma.InputJsonValue
        }
      });
    } catch (error) {
      logger.error({ error, userId: event.userId }, "Failed to record usage metric");
    }
  }

  private categorizeError(errorMessage: string): string {
    const errorKeywords = {
      "timeout": ["timeout", "timed out", "deadline"],
      "rate_limit": ["rate limit", "quota", "throttle"],
      "auth": ["unauthorized", "forbidden", "auth"],
      "invalid_input": ["invalid", "validation", "parameter"],
      "server_error": ["internal", "server error", "500"],
      "network": ["network", "connection", "dns"]
    };

    const message = errorMessage.toLowerCase();
    for (const [category, keywords] of Object.entries(errorKeywords)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        return category;
      }
    }
    return "other";
  }

  private detectUsagePatterns(toolUsage: any, patterns: Map<string, number>): void {
    const toolName = toolUsage.toolName;
    const parameters = toolUsage.parameters || {};

    // Pattern: Tool + Parameter combinations
    Object.keys(parameters).forEach(param => {
      const pattern = `${toolName}:${param}`;
      patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
    });

    // Pattern: Success/failure patterns
    const outcome = toolUsage.success ? "success" : "failure";
    const outcomePattern = `${toolName}:${outcome}`;
    patterns.set(outcomePattern, (patterns.get(outcomePattern) || 0) + 1);
  }

  private calculateProficiencyLevel(usageCount: number, successRate: number): "novice" | "intermediate" | "advanced" | "expert" {
    if (usageCount < 5) return "novice";
    if (usageCount < 20 || successRate < 0.8) return "intermediate";
    if (usageCount < 50 || successRate < 0.9) return "advanced";
    return "expert";
  }

  private calculateEfficiencyScore(totalUsage: number, totalTime: number, successfulUsages: number): number {
    if (totalUsage === 0) return 0;
    
    const successRate = successfulUsages / totalUsage;
    const avgTime = totalTime / totalUsage;
    const timeScore = Math.max(0, 1 - (avgTime / 30000)); // Penalize if avg > 30s
    
    return (successRate * 0.7 + timeScore * 0.3);
  }

  private calculateExplorationScore(uniqueTools: number, totalUsage: number): number {
    if (totalUsage === 0) return 0;
    
    // Higher score for using diverse tools
    const diversity = uniqueTools / Math.min(totalUsage, 20); // Cap at 20 for normalization
    return Math.min(diversity, 1);
  }

  private calculateConsistencyScore(dailyUsage: number[]): number {
    const totalDays = dailyUsage.filter(usage => usage > 0).length;
    const maxConsistency = 7; // All days of week
    return totalDays / maxConsistency;
  }

  private calculateAdvancedFeatureUsage(favoriteTools: ToolPreference[]): number {
    const advancedTools = [
      "gpt5_thinking_mode", "transformation_program", "sigil_creator", 
      "dream_interpreter", "tarot_reader", "numerology_calculator"
    ];
    
    const advancedUsage = favoriteTools
      .filter(tool => advancedTools.includes(tool.toolName))
      .reduce((sum, tool) => sum + tool.usageCount, 0);
    
    const totalUsage = favoriteTools.reduce((sum, tool) => sum + tool.usageCount, 0);
    
    return totalUsage > 0 ? advancedUsage / totalUsage : 0;
  }

  private extractUsagePatterns(
    patterns: Map<string, number>, 
    hourlyUsage: number[], 
    dailyUsage: number[]
  ): UsagePattern[] {
    const result: UsagePattern[] = [];

    // Time of day patterns
    const peakHour = hourlyUsage.indexOf(Math.max(...hourlyUsage));
    if (hourlyUsage[peakHour] > 0) {
      result.push({
        pattern: "peak_usage_time",
        frequency: hourlyUsage[peakHour],
        description: `Most active during ${peakHour}:00-${peakHour + 1}:00`,
        timeOfDay: `${peakHour}:00`,
        dayOfWeek: "all"
      });
    }

    // Day of week patterns
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const peakDay = dailyUsage.indexOf(Math.max(...dailyUsage));
    if (dailyUsage[peakDay] > 0) {
      result.push({
        pattern: "peak_usage_day",
        frequency: dailyUsage[peakDay],
        description: `Most active on ${dayNames[peakDay]}`,
        timeOfDay: "all",
        dayOfWeek: dayNames[peakDay]
      });
    }

    // Tool patterns
    const topPatterns = Array.from(patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    topPatterns.forEach(([pattern, frequency]) => {
      result.push({
        pattern: pattern.replace(":", "_"),
        frequency,
        description: `Frequently uses ${pattern.replace(":", " with ")}`,
        timeOfDay: "all",
        dayOfWeek: "all"
      });
    });

    return result;
  }
}

// Export singleton instance
export const toolUsageTracker = new ToolUsageTracker();