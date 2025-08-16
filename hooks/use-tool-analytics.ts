import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

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

export interface ToolUsageEvent {
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
  metadata?: Record<string, unknown>;
}

export type AnalyticsType = "usage_stats" | "user_metrics" | "performance" | "system_analytics" | "trends";

export interface UseToolAnalyticsReturn {
  // Data
  usageStats: ToolUsageStats[] | null;
  userMetrics: UserToolMetrics | null;
  performanceMetrics: ToolPerformanceMetrics | null;
  systemAnalytics: SystemWideAnalytics | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  fetchUsageStats: (toolName?: string, filters?: AnalyticsFilters) => Promise<void>;
  fetchUserMetrics: (days?: number) => Promise<void>;
  fetchPerformanceMetrics: (toolName: string, days?: number) => Promise<void>;
  fetchSystemAnalytics: () => Promise<void>;
  trackToolUsage: (event: ToolUsageEvent) => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Utilities
  getTopTools: (count?: number) => ToolUsageStats[];
  getUserEfficiencyTrend: () => number[];
  getToolPopularityRank: (toolName: string) => number;
  getCostBreakdown: () => { toolName: string; cost: number; percentage: number }[];
}

export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  userTier?: string;
  days?: number;
}

export function useToolAnalytics(): UseToolAnalyticsReturn {
  // State
  const [usageStats, setUsageStats] = useState<ToolUsageStats[] | null>(null);
  const [userMetrics, setUserMetrics] = useState<UserToolMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<ToolPerformanceMetrics | null>(null);
  const [systemAnalytics, setSystemAnalytics] = useState<SystemWideAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = useCallback(async (
    type: AnalyticsType,
    params: Record<string, string | number | undefined> = {}
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      searchParams.set("type", type);
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      });

      const response = await fetch(`/api/analytics/tools?${searchParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch ${type} analytics`);
      }

      const result = await response.json();
      setLastUpdated(new Date(result.timestamp));
      
      return result.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch ${type} analytics`;
      setError(errorMessage);
      toast.error("Analytics Error", {
        description: errorMessage,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUsageStats = useCallback(async (toolName?: string, filters?: AnalyticsFilters) => {
    try {
      const params: Record<string, string | number | undefined> = {};
      if (toolName) params.toolName = toolName;
      if (filters?.startDate) params.startDate = filters.startDate.toISOString();
      if (filters?.endDate) params.endDate = filters.endDate.toISOString();
      if (filters?.userTier) params.userTier = filters.userTier;
      if (filters?.days) params.days = filters.days;

      const data = await fetchAnalytics("usage_stats", params);
      setUsageStats(data);
    } catch (err) {
      console.error("Failed to fetch usage stats:", err);
    }
  }, [fetchAnalytics]);

  const fetchUserMetrics = useCallback(async (days: number = 30) => {
    try {
      const data = await fetchAnalytics("user_metrics", { days });
      setUserMetrics(data);
    } catch (err) {
      console.error("Failed to fetch user metrics:", err);
    }
  }, [fetchAnalytics]);

  const fetchPerformanceMetrics = useCallback(async (toolName: string, days: number = 7) => {
    try {
      const data = await fetchAnalytics("performance", { toolName, days });
      setPerformanceMetrics(data);
    } catch (err) {
      console.error("Failed to fetch performance metrics:", err);
    }
  }, [fetchAnalytics]);

  const fetchSystemAnalytics = useCallback(async () => {
    try {
      const data = await fetchAnalytics("system_analytics");
      setSystemAnalytics(data);
    } catch (err) {
      console.error("Failed to fetch system analytics:", err);
    }
  }, [fetchAnalytics]);

  const trackToolUsage = useCallback(async (event: ToolUsageEvent): Promise<void> => {
    try {
      const response = await fetch("/api/analytics/tools", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to track tool usage");
      }

      // Silently track usage - don't show success toast for every tracking event

    } catch (err) {
      // Log error but don't show toast to avoid spam
      console.error("Failed to track tool usage:", err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.allSettled([
        fetchUsageStats(),
        fetchUserMetrics(),
        // Don't fetch system analytics by default as it requires admin
      ]);
      toast.success("Analytics updated successfully!");
    } catch (err) {
      console.error("Failed to refresh analytics:", err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsageStats, fetchUserMetrics]);

  // Utility functions
  const getTopTools = useCallback((count: number = 5): ToolUsageStats[] => {
    if (!usageStats) return [];
    return usageStats
      .sort((a, b) => b.totalUsage - a.totalUsage)
      .slice(0, count);
  }, [usageStats]);

  const getUserEfficiencyTrend = useCallback((): number[] => {
    if (!userMetrics) return [];
    
    return userMetrics.monthlyUsage.map(month => {
      const totalUsage = month.toolUsage + month.voiceGeneration + month.analytics + month.conversations;
      return totalUsage > 0 ? userMetrics.efficiencyScore : 0;
    });
  }, [userMetrics]);

  const getToolPopularityRank = useCallback((toolName: string): number => {
    if (!usageStats) return -1;
    
    const sortedTools = usageStats
      .sort((a, b) => b.totalUsage - a.totalUsage);
    
    return sortedTools.findIndex(tool => tool.toolName === toolName) + 1;
  }, [usageStats]);

  const getCostBreakdown = useCallback((): { toolName: string; cost: number; percentage: number }[] => {
    if (!usageStats) return [];
    
    const totalCost = usageStats.reduce((sum, tool) => sum + tool.totalCost, 0);
    
    return usageStats
      .filter(tool => tool.totalCost > 0)
      .map(tool => ({
        toolName: tool.toolName,
        cost: tool.totalCost,
        percentage: totalCost > 0 ? (tool.totalCost / totalCost) * 100 : 0
      }))
      .sort((a, b) => b.cost - a.cost);
  }, [usageStats]);

  // Auto-fetch user metrics on mount
  useEffect(() => {
    fetchUserMetrics();
  }, [fetchUserMetrics]);

  return {
    // Data
    usageStats,
    userMetrics,
    performanceMetrics,
    systemAnalytics,
    
    // State
    isLoading,
    error,
    lastUpdated,
    
    // Actions
    fetchUsageStats,
    fetchUserMetrics,
    fetchPerformanceMetrics,
    fetchSystemAnalytics,
    trackToolUsage,
    refreshAll,
    
    // Utilities
    getTopTools,
    getUserEfficiencyTrend,
    getToolPopularityRank,
    getCostBreakdown
  };
}

// Hook for automatically tracking tool usage
export function useToolUsageTracker() {
  const { trackToolUsage } = useToolAnalytics();

  const trackUsage = useCallback(async (
    toolName: string,
    toolType: ToolUsageEvent["toolType"],
    options: {
      startTime?: number;
      success: boolean;
      errorMessage?: string;
      parameters?: Record<string, unknown>;
      conversationId?: string;
      cost?: number;
      metadata?: Record<string, unknown>;
    }
  ) => {
    const executionTime = options.startTime ? Date.now() - options.startTime : undefined;

    await trackToolUsage({
      toolName,
      toolType,
      success: options.success,
      executionTime,
      errorMessage: options.errorMessage,
      parameters: options.parameters,
      conversationId: options.conversationId,
      cost: options.cost,
      metadata: options.metadata
    });
  }, [trackToolUsage]);

  const withTracking = useCallback(<T extends unknown[], R>(
    toolName: string,
    toolType: ToolUsageEvent["toolType"],
    fn: (...args: T) => Promise<R>,
    options?: {
      getParameters?: (...args: T) => Record<string, unknown>;
      getCost?: (result: R) => number;
      conversationId?: string;
    }
  ) => {
    return async (...args: T): Promise<R> => {
      const startTime = Date.now();
      let success = false;
      let errorMessage: string | undefined;
      let result: R;
      let cost: number | undefined;

      try {
        result = await fn(...args);
        success = true;
        cost = options?.getCost?.(result);
        return result;
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : "Unknown error";
        throw error;
      } finally {
        await trackUsage(toolName, toolType, {
          startTime,
          success,
          errorMessage,
          parameters: options?.getParameters?.(...args),
          conversationId: options?.conversationId,
          cost,
        });
      }
    };
  }, [trackUsage]);

  return {
    trackUsage,
    withTracking
  };
}

// Hook for tool performance monitoring
export function useToolPerformance(toolName: string) {
  const { fetchPerformanceMetrics, performanceMetrics, isLoading, error } = useToolAnalytics();
  const [selectedDays, setSelectedDays] = useState(7);

  const refreshMetrics = useCallback(async () => {
    await fetchPerformanceMetrics(toolName, selectedDays);
  }, [fetchPerformanceMetrics, toolName, selectedDays]);

  useEffect(() => {
    if (toolName) {
      refreshMetrics();
    }
  }, [toolName, selectedDays, refreshMetrics]);

  const getPerformanceScore = useCallback((): number => {
    if (!performanceMetrics) return 0;
    
    const responseTimeScore = Math.max(0, 1 - performanceMetrics.averageResponseTime / 30000); // 30s max
    const reliabilityScore = 1 - performanceMetrics.errorRate;
    const satisfactionScore = performanceMetrics.userSatisfactionScore;
    
    return (responseTimeScore + reliabilityScore + satisfactionScore) / 3;
  }, [performanceMetrics]);

  const getPerformanceStatus = useCallback((): "excellent" | "good" | "fair" | "poor" => {
    const score = getPerformanceScore();
    if (score >= 0.8) return "excellent";
    if (score >= 0.6) return "good";
    if (score >= 0.4) return "fair";
    return "poor";
  }, [getPerformanceScore]);

  return {
    performanceMetrics,
    isLoading,
    error,
    selectedDays,
    setSelectedDays,
    refreshMetrics,
    getPerformanceScore,
    getPerformanceStatus
  };
}