import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { toolUsageTracker } from "@/lib/analytics/tool-usage-tracker";
import { prisma } from "@/lib/db/client";
import logger from "@/lib/logger";

const toolAnalyticsRequestSchema = z.object({
  type: z.enum([
    "usage_stats",
    "user_metrics", 
    "performance",
    "system_analytics",
    "trends"
  ]).default("usage_stats"),
  toolName: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userTier: z.string().optional(),
  days: z.number().min(1).max(365).default(30)
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
    const type = searchParams.get("type") || "usage_stats";
    const toolName = searchParams.get("toolName") || undefined;
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;
    const userTier = searchParams.get("userTier") || undefined;
    const days = parseInt(searchParams.get("days") || "30");

    const params = {
      type: type as "usage_stats" | "user_metrics" | "performance" | "system_analytics" | "trends",
      toolName,
      startDate,
      endDate,
      userTier,
      days
    };

    let data;
    
    switch (params.type) {
      case "usage_stats":
        data = await toolUsageTracker.getToolUsageStats(
          params.toolName,
          params.startDate,
          params.endDate,
          params.userTier
        );
        break;
        
      case "user_metrics":
        data = await toolUsageTracker.getUserToolMetrics(session.user.id, params.days);
        break;
        
      case "performance":
        if (!params.toolName) {
          throw new Error("toolName is required for performance analytics");
        }
        data = await toolUsageTracker.getToolPerformanceMetrics(params.toolName, params.days);
        break;
        
      case "system_analytics":
        // Only allow admin users to access system-wide analytics
        const userForSystemAnalytics = await prisma.user.findUnique({
          where: { id: session.user.id }
        });
        if (userForSystemAnalytics?.role !== "ADMIN") {
          return NextResponse.json(
            { error: "Insufficient permissions" },
            { status: 403 }
          );
        }
        data = await toolUsageTracker.getSystemWideAnalytics();
        break;
        
      case "trends":
        data = await toolUsageTracker.getToolUsageStats(
          params.toolName,
          params.startDate || new Date(Date.now() - params.days * 24 * 60 * 60 * 1000),
          params.endDate || new Date(),
          params.userTier
        );
        break;
        
      default:
        data = await toolUsageTracker.getToolUsageStats();
    }

    // Log analytics request
    logger.info({
      userId: session.user.id,
      analyticsType: params.type,
      toolName: params.toolName,
      days: params.days,
      timestamp: new Date().toISOString()
    }, "Tool analytics requested");

    return NextResponse.json({
      success: true,
      type: params.type,
      filters: {
        toolName: params.toolName,
        startDate: params.startDate?.toISOString(),
        endDate: params.endDate?.toISOString(),
        userTier: params.userTier,
        days: params.days
      },
      timestamp: new Date().toISOString(),
      data
    });

  } catch (error) {
    logger.error({ 
      error, 
      userId: session.user.id,
      endpoint: "/api/analytics/tools"
    }, "Tool analytics request failed");

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
    const { type, toolName, startDate, endDate, userTier, days } = toolAnalyticsRequestSchema.parse(body);

    // Handle batch analytics requests
    const results: Record<string, unknown> = {};

    if (type === "usage_stats" || type === "trends") {
      results.usageStats = await toolUsageTracker.getToolUsageStats(
        toolName,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
        userTier
      );
    }

    if (type === "user_metrics") {
      results.userMetrics = await toolUsageTracker.getUserToolMetrics(session.user.id, days);
    }

    if (type === "performance" && toolName) {
      results.performance = await toolUsageTracker.getToolPerformanceMetrics(toolName, days);
    }

    // Generate comprehensive report
    if (type === "system_analytics") {
      const userForSystemAnalytics = await prisma.user.findUnique({
        where: { id: session.user.id }
      });
      if (userForSystemAnalytics?.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }

      results.systemAnalytics = await toolUsageTracker.getSystemWideAnalytics();
      results.userMetrics = await toolUsageTracker.getUserToolMetrics(session.user.id, days);
      results.usageStats = await toolUsageTracker.getToolUsageStats();
    }

    logger.info({
      userId: session.user.id,
      analyticsType: type,
      resultKeys: Object.keys(results)
    }, "Comprehensive tool analytics generated");

    return NextResponse.json({
      success: true,
      type,
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error) {
    logger.error({ 
      error, 
      userId: session.user.id
    }, "Comprehensive tool analytics generation failed");

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

// Track tool usage endpoint - called by AI tools to record usage
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" }, 
      { status: 401 }
    );
  }

  const trackingSchema = z.object({
    toolName: z.string(),
    toolType: z.enum(["ai_tool", "voice_generation", "analytics", "conversation"]),
    sessionId: z.string().optional(),
    conversationId: z.string().optional(),
    parameters: z.record(z.string(), z.unknown()).optional(),
    executionTime: z.number().optional(),
    success: z.boolean(),
    errorMessage: z.string().optional(),
    inputTokens: z.number().optional(),
    outputTokens: z.number().optional(),
    cost: z.number().optional(),
    metadata: z.record(z.string(), z.unknown()).optional()
  });

  try {
    const body = await request.json();
    const trackingData = trackingSchema.parse(body);

    // Get user tier for tracking
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscriptions: {
          where: { status: "ACTIVE" },
          take: 1
        }
      }
    });

    const userTier = user?.subscriptions[0]?.plan || "FREE_TRIAL";

    await toolUsageTracker.trackToolUsage({
      userId: session.user.id,
      userTier,
      timestamp: new Date(),
      ...trackingData
    });

    return NextResponse.json({
      success: true,
      message: "Tool usage tracked successfully"
    });

  } catch (error) {
    logger.error({ 
      error, 
      userId: session.user.id
    }, "Failed to track tool usage");

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid tracking parameters",
          details: error.issues 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to track tool usage",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}