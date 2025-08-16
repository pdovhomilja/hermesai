import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { spiritualAnalytics } from "@/lib/ai/spiritual-analytics";
import logger from "@/lib/logger";

const analyticsRequestSchema = z.object({
  type: z.enum([
    "metrics",
    "progress", 
    "insights",
    "timeline",
    "patterns",
    "recommendations"
  ]).default("metrics"),
  period: z.enum(["week", "month", "quarter", "year", "all"]).default("month"),
  includeDetails: z.boolean().default(false)
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" }, 
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const requestType = searchParams.get("type") || "metrics";
    const period = searchParams.get("period") || "month";
    const includeDetails = searchParams.get("includeDetails") === "true";

    const params = {
      type: requestType as "metrics" | "progress" | "insights" | "timeline" | "patterns" | "recommendations",
      period: period as "week" | "month" | "quarter" | "year" | "all",
      includeDetails
    };

    let data;
    
    switch (params.type) {
      case "metrics":
        data = await spiritualAnalytics.calculateSpiritualMetrics(session.user.id);
        break;
        
      case "progress":
        data = await spiritualAnalytics.analyzeProgress(session.user.id);
        break;
        
      case "insights":
        data = await spiritualAnalytics.analyzeInsightPatterns(session.user.id);
        break;
        
      case "timeline":
        data = await spiritualAnalytics.getJourneyTimeline(session.user.id);
        break;
        
      case "patterns":
        data = await spiritualAnalytics.analyzeInsightPatterns(session.user.id);
        break;
        
      case "recommendations":
        const progress = await spiritualAnalytics.analyzeProgress(session.user.id);
        data = {
          recommendations: progress.recommendations,
          growthAreas: progress.growthAreas,
          strengths: progress.strengths
        };
        break;
        
      default:
        data = await spiritualAnalytics.calculateSpiritualMetrics(session.user.id);
    }

    // Log analytics request
    logger.info({
      userId: session.user.id,
      analyticsType: params.type,
      period: params.period,
      timestamp: new Date().toISOString()
    }, "Spiritual analytics requested");

    return NextResponse.json({
      success: true,
      type: params.type,
      period: params.period,
      timestamp: new Date().toISOString(),
      data
    });

  } catch (error) {
    logger.error({ 
      error, 
      userId: session.user.id,
      endpoint: "/api/analytics/spiritual"
    }, "Spiritual analytics request failed");

    return NextResponse.json(
      { 
        error: "Analytics request failed",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" }, 
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { type, period, includeDetails } = analyticsRequestSchema.parse(body);

    // Handle batch analytics requests
    const results: Record<string, unknown> = {};

    if (type === "metrics" || includeDetails) {
      results.metrics = await spiritualAnalytics.calculateSpiritualMetrics(session.user.id);
    }

    if (type === "progress" || includeDetails) {
      results.progress = await spiritualAnalytics.analyzeProgress(session.user.id);
    }

    if (type === "insights" || type === "patterns" || includeDetails) {
      results.insightPatterns = await spiritualAnalytics.analyzeInsightPatterns(session.user.id);
    }

    if (type === "timeline" || includeDetails) {
      results.timeline = await spiritualAnalytics.getJourneyTimeline(session.user.id);
    }

    // Generate comprehensive report if requested
    if (includeDetails) {
      results.summary = await generateAnalyticsSummary(session.user.id, results);
    }

    logger.info({
      userId: session.user.id,
      analyticsType: type,
      period,
      includeDetails,
      resultKeys: Object.keys(results)
    }, "Comprehensive analytics generated");

    return NextResponse.json({
      success: true,
      type,
      period,
      includeDetails,
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error) {
    logger.error({ 
      error, 
      userId: session.user.id
    }, "Comprehensive analytics generation failed");

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid request parameters",
          details: error.issues 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Analytics generation failed",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Helper function to generate analytics summary
async function generateAnalyticsSummary(userId: string, data: Record<string, unknown>) {
  const { metrics, progress, insightPatterns, timeline } = data;

  const summary = {
    overallScore: 0,
    keyInsights: [] as string[],
    majorAccomplishments: [] as string[],
    nextSteps: [] as string[],
    strengths: [] as string[],
    challengeAreas: [] as string[],
    journeyHighlights: [] as string[]
  };

  // Extract progress data if available
  if (progress && typeof progress === 'object') {
    const progressData = progress as { strengths?: string[]; growthAreas?: string[] };
    if (progressData.strengths) {
      summary.strengths = progressData.strengths;
    }
    if (progressData.growthAreas) {
      summary.challengeAreas = progressData.growthAreas;
    }
  }

  // Calculate overall score
  if (metrics && typeof metrics === 'object') {
    const metricsData = metrics as {
      transformationScore: number;
      streakDays: number;
      practicesCompleted: number;
      principlesStudied: string[];
      deepThinkingScore: number;
      emotionalBalanceScore: number;
    };
    
    const scores = [
      metricsData.transformationScore || 0,
      Math.min((metricsData.streakDays || 0) / 30, 1), // Normalize streak to max 30 days
      Math.min((metricsData.practicesCompleted || 0) / 50, 1), // Normalize practices to max 50
      Math.min((metricsData.principlesStudied?.length || 0) / 7, 1), // Normalize principles to all 7
      metricsData.deepThinkingScore || 0,
      metricsData.emotionalBalanceScore || 0
    ];
    
    summary.overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  // Extract key insights
  if (Array.isArray(insightPatterns)) {
    insightPatterns
      .filter((pattern: { frequency: number; type: string }) => pattern.frequency >= 3)
      .slice(0, 3)
      .forEach((pattern: { frequency: number; type: string }) => {
        summary.keyInsights.push(
          `Strong pattern in ${pattern.type.toLowerCase()} with ${pattern.frequency} occurrences`
        );
      });
  }

  // Identify major accomplishments
  if (timeline && typeof timeline === 'object' && 'majorMilestones' in timeline) {
    const majorMilestones = (timeline as { majorMilestones: { title: string }[] }).majorMilestones;
    if (Array.isArray(majorMilestones)) {
      majorMilestones
        .slice(0, 3)
        .forEach((milestone: { title: string }) => {
          summary.majorAccomplishments.push(milestone.title);
        });
    }
  }

  // Generate next steps
  if (progress && typeof progress === 'object' && 'recommendations' in progress) {
    const recommendations = (progress as { recommendations: string[] }).recommendations;
    if (Array.isArray(recommendations)) {
      summary.nextSteps = recommendations.slice(0, 3);
    }
  }

  // Highlight journey moments
  if (timeline && typeof timeline === 'object') {
    const timelineData = timeline as { 
      startDate: string | Date; 
      currentStreak: number; 
      longestStreak: number; 
    };
    
    if (timelineData.startDate) {
      const startDate = typeof timelineData.startDate === 'string' 
        ? new Date(timelineData.startDate) 
        : timelineData.startDate;
      summary.journeyHighlights.push(`Journey started ${formatDateFromNow(startDate)}`);
    }
    
    if (timelineData.currentStreak > 0) {
      summary.journeyHighlights.push(`Current practice streak: ${timelineData.currentStreak} days`);
    }
    
    if (timelineData.longestStreak > 7) {
      summary.journeyHighlights.push(`Longest streak achieved: ${timelineData.longestStreak} days`);
    }
  }

  return summary;
}

function formatDateFromNow(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} weeks ago`;
  } else if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)} months ago`;
  } else {
    return `${Math.floor(diffDays / 365)} years ago`;
  }
}