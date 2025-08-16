import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: SubscriptionPlan;
  currentUsage?: number;
  limit?: number;
  resetsAt?: Date;
}

export interface SubscriptionUsageStats {
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

export interface AvailableTools {
  available: string[];
  restricted: Array<{
    toolName: string;
    reason: string;
    upgradeRequired?: SubscriptionPlan;
  }>;
}

export type SubscriptionPlan = "FREE_TRIAL" | "SEEKER" | "ADEPT" | "MASTER";

export interface UseSubscriptionToolsReturn {
  // Data
  subscriptionInfo: SubscriptionUsageStats | null;
  availableTools: AvailableTools | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  checkToolAccess: (toolName: string, parameters?: Record<string, unknown>) => Promise<AccessCheckResult>;
  checkMultipleTools: (tools: Array<{ toolName: string; parameters?: Record<string, unknown> }>) => Promise<Array<AccessCheckResult & { toolName: string }>>;
  refreshSubscriptionInfo: () => Promise<void>;
  refreshAvailableTools: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Utilities
  canUseTool: (toolName: string) => boolean;
  getToolRestriction: (toolName: string) => string | null;
  getUpgradeRequirement: (toolName: string) => SubscriptionPlan | null;
  isNearLimit: (type: "daily" | "monthly", threshold?: number) => boolean;
  getUsagePercentage: (type: "dailyTools" | "monthlyTools" | "dailyVoice" | "monthlyVoice") => number;
  getTierDisplayName: (tier: SubscriptionPlan) => string;
  getTierColor: (tier: SubscriptionPlan) => string;
}

export function useSubscriptionTools(): UseSubscriptionToolsReturn {
  // State
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionUsageStats | null>(null);
  const [availableTools, setAvailableTools] = useState<AvailableTools | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const makeRequest = useCallback(async (url: string, options?: RequestInit): Promise<any> => {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      },
      ...options
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Request failed");
    }

    const result = await response.json();
    return result.data;
  }, []);

  const checkToolAccess = useCallback(async (
    toolName: string,
    parameters?: Record<string, unknown>
  ): Promise<AccessCheckResult> => {
    setError(null);

    try {
      const result = await makeRequest("/api/subscription/tools", {
        method: "POST",
        body: JSON.stringify({
          action: "check",
          toolName,
          parameters
        })
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Access check failed";
      setError(errorMessage);
      return {
        allowed: false,
        reason: errorMessage
      };
    }
  }, [makeRequest]);

  const checkMultipleTools = useCallback(async (
    tools: Array<{ toolName: string; parameters?: Record<string, unknown> }>
  ): Promise<Array<AccessCheckResult & { toolName: string }>> => {
    setError(null);

    try {
      const result = await makeRequest("/api/subscription/tools", {
        method: "POST",
        body: JSON.stringify({
          action: "batch_check",
          tools
        })
      });

      return result.results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Batch access check failed";
      setError(errorMessage);
      return tools.map(tool => ({
        toolName: tool.toolName,
        allowed: false,
        reason: errorMessage
      }));
    }
  }, [makeRequest]);

  const refreshSubscriptionInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await makeRequest("/api/subscription/tools?action=info");
      setSubscriptionInfo(data);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch subscription info";
      setError(errorMessage);
      toast.error("Subscription Error", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [makeRequest]);

  const refreshAvailableTools = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await makeRequest("/api/subscription/tools?action=available");
      setAvailableTools(data);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch available tools";
      setError(errorMessage);
      toast.error("Tools Error", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [makeRequest]);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await makeRequest("/api/subscription/tools", {
        method: "POST",
        body: JSON.stringify({
          action: "subscription_info",
          includeUsage: true,
          includeAvailableTools: true
        })
      });

      if (data.usage) {
        setSubscriptionInfo(data.usage);
      }
      if (data.tools) {
        setAvailableTools(data.tools);
      }

      setLastUpdated(new Date());
      toast.success("Subscription data updated!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh data";
      setError(errorMessage);
      toast.error("Refresh Error", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [makeRequest]);

  // Utility functions
  const canUseTool = useCallback((toolName: string): boolean => {
    if (!availableTools) return false;
    return availableTools.available.includes(toolName);
  }, [availableTools]);

  const getToolRestriction = useCallback((toolName: string): string | null => {
    if (!availableTools) return null;
    const restriction = availableTools.restricted.find(r => r.toolName === toolName);
    return restriction?.reason || null;
  }, [availableTools]);

  const getUpgradeRequirement = useCallback((toolName: string): SubscriptionPlan | null => {
    if (!availableTools) return null;
    const restriction = availableTools.restricted.find(r => r.toolName === toolName);
    return restriction?.upgradeRequired || null;
  }, [availableTools]);

  const isNearLimit = useCallback((type: "daily" | "monthly", threshold: number = 80): boolean => {
    if (!subscriptionInfo) return false;
    
    const percentage = type === "daily" 
      ? subscriptionInfo.percentagesUsed.dailyTools
      : subscriptionInfo.percentagesUsed.monthlyTools;
    
    return percentage >= threshold;
  }, [subscriptionInfo]);

  const getUsagePercentage = useCallback((
    type: "dailyTools" | "monthlyTools" | "dailyVoice" | "monthlyVoice"
  ): number => {
    if (!subscriptionInfo) return 0;
    return subscriptionInfo.percentagesUsed[type];
  }, [subscriptionInfo]);

  const getTierDisplayName = useCallback((tier: SubscriptionPlan): string => {
    const displayNames = {
      "FREE_TRIAL": "Free Trial",
      "SEEKER": "Seeker",
      "ADEPT": "Adept",
      "MASTER": "Master"
    };
    return displayNames[tier];
  }, []);

  const getTierColor = useCallback((tier: SubscriptionPlan): string => {
    const colors = {
      "FREE_TRIAL": "text-gray-600",
      "SEEKER": "text-blue-600",
      "ADEPT": "text-purple-600",
      "MASTER": "text-gold-600"
    };
    return colors[tier];
  }, []);

  // Auto-fetch subscription info on mount
  useEffect(() => {
    refreshSubscriptionInfo();
  }, [refreshSubscriptionInfo]);

  return {
    // Data
    subscriptionInfo,
    availableTools,
    
    // State
    isLoading,
    error,
    lastUpdated,
    
    // Actions
    checkToolAccess,
    checkMultipleTools,
    refreshSubscriptionInfo,
    refreshAvailableTools,
    refreshAll,
    
    // Utilities
    canUseTool,
    getToolRestriction,
    getUpgradeRequirement,
    isNearLimit,
    getUsagePercentage,
    getTierDisplayName,
    getTierColor
  };
}

// Hook for protecting tool usage
export function useToolAccessGuard() {
  const { checkToolAccess, subscriptionInfo } = useSubscriptionTools();

  const guardedExecution = useCallback(async <T>(
    toolName: string,
    execution: () => Promise<T>,
    parameters?: Record<string, unknown>,
    options?: {
      showAccessDeniedToast?: boolean;
      onAccessDenied?: (result: AccessCheckResult) => void;
    }
  ): Promise<T | null> => {
    // Check access before execution
    const accessResult = await checkToolAccess(toolName, parameters);

    if (!accessResult.allowed) {
      // Handle access denied
      if (options?.showAccessDeniedToast !== false) {
        toast.error("Access Denied", {
          description: accessResult.reason || "This feature is not available on your current plan",
          action: accessResult.upgradeRequired ? {
            label: `Upgrade to ${accessResult.upgradeRequired}`,
            onClick: () => {
              // Navigate to upgrade page
              window.location.href = "/subscription/upgrade";
            }
          } : undefined
        });
      }

      options?.onAccessDenied?.(accessResult);
      return null;
    }

    // Execute the function if access is allowed
    try {
      return await execution();
    } catch (error) {
      toast.error("Execution Error", {
        description: error instanceof Error ? error.message : "An error occurred"
      });
      throw error;
    }
  }, [checkToolAccess]);

  const createGuardedFunction = useCallback(<TArgs extends unknown[], TReturn>(
    toolName: string,
    originalFunction: (...args: TArgs) => Promise<TReturn>,
    getParameters?: (...args: TArgs) => Record<string, unknown>
  ) => {
    return async (...args: TArgs): Promise<TReturn | null> => {
      const parameters = getParameters?.(...args);
      return guardedExecution(toolName, () => originalFunction(...args), parameters);
    };
  }, [guardedExecution]);

  return {
    guardedExecution,
    createGuardedFunction,
    currentTier: subscriptionInfo?.currentTier || "FREE_TRIAL",
    hasAdvancedFeatures: subscriptionInfo?.limits.advancedFeaturesEnabled || false
  };
}

// Hook for subscription upgrade prompts
export function useSubscriptionUpgrade() {
  const { subscriptionInfo, getUpgradeRequirement, getTierDisplayName } = useSubscriptionTools();

  const promptUpgrade = useCallback((
    toolName?: string,
    requiredTier?: SubscriptionPlan,
    customMessage?: string
  ) => {
    const targetTier = requiredTier || (toolName ? getUpgradeRequirement(toolName) : null) || "SEEKER";
    const currentTier = subscriptionInfo?.currentTier || "FREE_TRIAL";

    if (currentTier === targetTier) return;

    const message = customMessage || 
      `Upgrade to ${getTierDisplayName(targetTier)} to unlock ${toolName ? `${toolName}` : "advanced features"}`;

    toast.info("Upgrade Available", {
      description: message,
      action: {
        label: `Upgrade to ${getTierDisplayName(targetTier)}`,
        onClick: () => {
          // Navigate to upgrade page with target tier
          window.location.href = `/subscription/upgrade?tier=${targetTier.toLowerCase()}`;
        }
      },
      duration: 10000 // Show for 10 seconds
    });
  }, [subscriptionInfo, getUpgradeRequirement, getTierDisplayName]);

  const showUsageLimitWarning = useCallback((
    type: "dailyTools" | "monthlyTools" | "dailyVoice" | "monthlyVoice",
    threshold: number = 90
  ) => {
    if (!subscriptionInfo) return;

    const percentage = subscriptionInfo.percentagesUsed[type];
    if (percentage < threshold) return;

    const typeLabels = {
      "dailyTools": "daily tool usage",
      "monthlyTools": "monthly tool usage", 
      "dailyVoice": "daily voice generation",
      "monthlyVoice": "monthly voice generation"
    };

    toast.warning("Usage Limit Warning", {
      description: `You've used ${Math.round(percentage)}% of your ${typeLabels[type]} limit`,
      action: subscriptionInfo.currentTier !== "MASTER" ? {
        label: "Upgrade for More",
        onClick: () => promptUpgrade()
      } : undefined
    });
  }, [subscriptionInfo, promptUpgrade]);

  return {
    promptUpgrade,
    showUsageLimitWarning,
    currentTier: subscriptionInfo?.currentTier || "FREE_TRIAL",
    canUpgrade: subscriptionInfo?.currentTier !== "MASTER"
  };
}