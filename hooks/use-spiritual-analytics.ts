import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

export interface SpiritualMetrics {
  transformationScore: number;
  principlesStudied: string[];
  practicesCompleted: number;
  conversationCount: number;
  insightCount: number;
  streakDays: number;
  averageSessionDuration: number;
  personalityGrowthRate: number;
  deepThinkingScore: number;
  emotionalBalanceScore: number;
}

export interface ProgressAnalysis {
  currentLevel: string;
  nextLevel: string | null;
  progressToNext: number;
  strengths: string[];
  growthAreas: string[];
  recommendations: string[];
  milestones: Milestone[];
  weeklyGrowth: number;
  monthlyGrowth: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  achievedAt: Date | null;
  requiredScore: number;
  category: "principle" | "practice" | "transformation" | "wisdom";
  principles: string[];
  badge?: string;
}

export interface InsightPattern {
  type: string;
  frequency: number;
  significance: string;
  themes: string[];
  correlations: string[];
  growthImpact: number;
}

export interface JourneyTimeline {
  startDate: Date;
  currentStreak: number;
  longestStreak: number;
  majorMilestones: TimelineEvent[];
  principleProgress: PrincipleProgress[];
  transformationPhases: TransformationPhase[];
  insights: InsightEvolution[];
}

export interface TimelineEvent {
  date: Date;
  type: "level_advancement" | "milestone" | "breakthrough" | "practice";
  title: string;
  description: string;
  impact: number;
}

export interface PrincipleProgress {
  principle: string;
  understanding: number;
  application: number;
  mastery: number;
  firstEncounter: Date;
  lastPracticed: Date;
  practiceCount: number;
}

export interface TransformationPhase {
  phase: string;
  startDate: Date;
  endDate: Date | null;
  dominantTheme: string;
  challengesFaced: string[];
  breakthroughsAchieved: string[];
  evolutionScore: number;
}

export interface InsightEvolution {
  date: Date;
  depth: number;
  category: string;
  impact: number;
  connections: number;
}

export interface AnalyticsSummary {
  overallScore: number;
  keyInsights: string[];
  majorAccomplishments: string[];
  nextSteps: string[];
  strengths: string[];
  challengeAreas: string[];
  journeyHighlights: string[];
}

export type AnalyticsType = "metrics" | "progress" | "insights" | "timeline" | "patterns" | "recommendations";
export type AnalyticsPeriod = "week" | "month" | "quarter" | "year" | "all";

export interface UseSpiritualAnalyticsReturn {
  // Data
  metrics: SpiritualMetrics | null;
  progress: ProgressAnalysis | null;
  insightPatterns: InsightPattern[] | null;
  timeline: JourneyTimeline | null;
  summary: AnalyticsSummary | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  fetchMetrics: () => Promise<void>;
  fetchProgress: () => Promise<void>;
  fetchInsightPatterns: () => Promise<void>;
  fetchTimeline: () => Promise<void>;
  fetchComprehensiveAnalytics: (includeDetails?: boolean) => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Utilities
  getScoreColor: (score: number) => string;
  getScoreLabel: (score: number) => string;
  getLevelProgress: () => { current: string; next: string | null; progress: number };
  getTopRecommendations: (count?: number) => string[];
  getMilestoneProgress: () => { completed: number; total: number; percentage: number };
}

export function useSpiritualAnalytics(): UseSpiritualAnalyticsReturn {
  // State
  const [metrics, setMetrics] = useState<SpiritualMetrics | null>(null);
  const [progress, setProgress] = useState<ProgressAnalysis | null>(null);
  const [insightPatterns, setInsightPatterns] = useState<InsightPattern[] | null>(null);
  const [timeline, setTimeline] = useState<JourneyTimeline | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = useCallback(async (
    type: AnalyticsType,
    period: AnalyticsPeriod = "month"
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/spiritual?type=${type}&period=${period}`);
      
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
      toast.error(`Analytics Error`, {
        description: errorMessage,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await fetchAnalytics("metrics");
      setMetrics(data);
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
    }
  }, [fetchAnalytics]);

  const fetchProgress = useCallback(async () => {
    try {
      const data = await fetchAnalytics("progress");
      setProgress(data);
    } catch (err) {
      console.error("Failed to fetch progress:", err);
    }
  }, [fetchAnalytics]);

  const fetchInsightPatterns = useCallback(async () => {
    try {
      const data = await fetchAnalytics("insights");
      setInsightPatterns(data);
    } catch (err) {
      console.error("Failed to fetch insight patterns:", err);
    }
  }, [fetchAnalytics]);

  const fetchTimeline = useCallback(async () => {
    try {
      const data = await fetchAnalytics("timeline");
      setTimeline(data);
    } catch (err) {
      console.error("Failed to fetch timeline:", err);
    }
  }, [fetchAnalytics]);

  const fetchComprehensiveAnalytics = useCallback(async (includeDetails: boolean = true) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analytics/spiritual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "metrics",
          period: "month",
          includeDetails
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch comprehensive analytics");
      }

      const result = await response.json();
      setLastUpdated(new Date(result.timestamp));

      // Update all states with the comprehensive data
      if (result.results.metrics) {
        setMetrics(result.results.metrics);
      }
      if (result.results.progress) {
        setProgress(result.results.progress);
      }
      if (result.results.insightPatterns) {
        setInsightPatterns(result.results.insightPatterns);
      }
      if (result.results.timeline) {
        setTimeline(result.results.timeline);
      }
      if (result.results.summary) {
        setSummary(result.results.summary);
      }

      toast.success("Analytics updated successfully!");

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch comprehensive analytics";
      setError(errorMessage);
      toast.error("Analytics Error", {
        description: errorMessage,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      await fetchComprehensiveAnalytics(true);
    } catch (err) {
      console.error("Failed to refresh all analytics:", err);
    }
  }, [fetchComprehensiveAnalytics]);

  // Utility functions
  const getScoreColor = useCallback((score: number): string => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-blue-600";
    if (score >= 0.4) return "text-yellow-600";
    if (score >= 0.2) return "text-orange-600";
    return "text-red-600";
  }, []);

  const getScoreLabel = useCallback((score: number): string => {
    if (score >= 0.9) return "Exceptional";
    if (score >= 0.8) return "Advanced";
    if (score >= 0.7) return "Proficient";
    if (score >= 0.6) return "Developing";
    if (score >= 0.4) return "Emerging";
    if (score >= 0.2) return "Beginning";
    return "Foundational";
  }, []);

  const getLevelProgress = useCallback(() => {
    if (!progress) {
      return { current: "Unknown", next: null, progress: 0 };
    }
    
    return {
      current: progress.currentLevel,
      next: progress.nextLevel,
      progress: progress.progressToNext
    };
  }, [progress]);

  const getTopRecommendations = useCallback((count: number = 3): string[] => {
    if (!progress?.recommendations) return [];
    return progress.recommendations.slice(0, count);
  }, [progress]);

  const getMilestoneProgress = useCallback(() => {
    if (!progress?.milestones) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const total = progress.milestones.length;
    const completed = progress.milestones.filter(m => m.achievedAt).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, percentage };
  }, [progress]);

  // Auto-fetch metrics on mount
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    // Data
    metrics,
    progress,
    insightPatterns,
    timeline,
    summary,
    
    // State
    isLoading,
    error,
    lastUpdated,
    
    // Actions
    fetchMetrics,
    fetchProgress,
    fetchInsightPatterns,
    fetchTimeline,
    fetchComprehensiveAnalytics,
    refreshAll,
    
    // Utilities
    getScoreColor,
    getScoreLabel,
    getLevelProgress,
    getTopRecommendations,
    getMilestoneProgress
  };
}

// Additional hook for analytics dashboard
export function useAnalyticsDashboard() {
  const analytics = useSpiritualAnalytics();
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>("month");
  const [activeView, setActiveView] = useState<AnalyticsType>("metrics");

  const switchView = useCallback(async (view: AnalyticsType) => {
    setActiveView(view);
    
    switch (view) {
      case "metrics":
        await analytics.fetchMetrics();
        break;
      case "progress":
        await analytics.fetchProgress();
        break;
      case "insights":
      case "patterns":
        await analytics.fetchInsightPatterns();
        break;
      case "timeline":
        await analytics.fetchTimeline();
        break;
    }
  }, [analytics]);

  const changePeriod = useCallback(async (period: AnalyticsPeriod) => {
    setSelectedPeriod(period);
    // Refetch current view with new period
    await switchView(activeView);
  }, [activeView, switchView]);

  return {
    ...analytics,
    selectedPeriod,
    activeView,
    switchView,
    changePeriod,
    
    // Dashboard-specific computed values
    dashboardStats: {
      totalScore: analytics.summary?.overallScore || 0,
      streakDays: analytics.metrics?.streakDays || 0,
      completedMilestones: analytics.getMilestoneProgress().completed,
      growthRate: analytics.progress?.monthlyGrowth || 0
    }
  };
}

// Hook for specific analytics components
export function useMetricsCard() {
  const { metrics, isLoading, error, fetchMetrics } = useSpiritualAnalytics();

  const keyMetrics = [
    {
      label: "Transformation Score",
      value: metrics?.transformationScore || 0,
      format: (val: number) => `${Math.round(val * 100)}%`,
      color: "blue"
    },
    {
      label: "Practice Streak",
      value: metrics?.streakDays || 0,
      format: (val: number) => `${val} days`,
      color: "green"
    },
    {
      label: "Deep Thinking",
      value: metrics?.deepThinkingScore || 0,
      format: (val: number) => `${Math.round(val * 100)}%`,
      color: "purple"
    },
    {
      label: "Emotional Balance",
      value: metrics?.emotionalBalanceScore || 0,
      format: (val: number) => `${Math.round(val * 100)}%`,
      color: "orange"
    }
  ];

  return {
    metrics: keyMetrics,
    isLoading,
    error,
    refresh: fetchMetrics
  };
}