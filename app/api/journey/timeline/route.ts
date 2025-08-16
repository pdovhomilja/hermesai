import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { SpiritualJourney } from "@/lib/journey/timeline";
import { z } from "zod";
import logger from "@/lib/logger";

const timelineSchema = z.object({
  days: z.number().min(1).max(365).default(30),
  includeTypes: z
    .array(z.enum(["conversation", "insight", "milestone", "practice", "transformation"]))
    .optional(),
  includeStats: z.boolean().default(true),
  includeInsights: z.boolean().default(false),
  includeMilestones: z.boolean().default(false),
});

const statsSchema = z.object({
  includeGrowthTrend: z.boolean().default(true),
  trendPeriodMonths: z.number().min(1).max(12).default(6),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { days, includeTypes, includeStats, includeInsights, includeMilestones } = 
      timelineSchema.parse(body);

    const journey = new SpiritualJourney(session.user.id);

    const [timeline, stats, insights, milestones] = await Promise.all([
      journey.getTimeline(days, includeTypes),
      includeStats ? journey.getStats() : null,
      includeInsights ? journey.getJourneyInsights() : null,
      includeMilestones ? journey.checkForMilestones() : null,
    ]);

    const response = {
      timeline,
      stats,
      insights,
      milestones,
      metadata: {
        requestedDays: days,
        generatedAt: new Date().toISOString(),
        userId: session.user.id,
        eventCount: timeline.length,
        eventTypes: [...new Set(timeline.map(e => e.type))],
      },
    };

    logger.info({
      userId: session.user.id,
      days,
      eventCount: timeline.length,
      includeStats,
      includeInsights,
      includeMilestones,
    }, "Journey timeline fetched");

    return NextResponse.json(response);
  } catch (error) {
    logger.error({ error }, "Timeline API error");

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action');

    const journey = new SpiritualJourney(session.user.id);

    if (action === 'stats') {
      // Get comprehensive journey statistics
      statsSchema.parse({
        includeGrowthTrend: searchParams.get('includeGrowthTrend') === 'true',
        trendPeriodMonths: parseInt(searchParams.get('trendPeriodMonths') || '6'),
      });

      const stats = await journey.getStats();
      
      return NextResponse.json({
        stats,
        metadata: {
          generatedAt: new Date().toISOString(),
          userId: session.user.id,
        },
      });
    }

    if (action === 'insights') {
      // Get journey insights and recommendations
      const insights = await journey.getJourneyInsights();
      
      return NextResponse.json({
        insights,
        metadata: {
          generatedAt: new Date().toISOString(),
          userId: session.user.id,
        },
      });
    }

    if (action === 'milestones') {
      // Check for new milestones
      const milestones = await journey.checkForMilestones();
      
      return NextResponse.json({
        milestones,
        newMilestones: milestones.length,
        metadata: {
          generatedAt: new Date().toISOString(),
          userId: session.user.id,
        },
      });
    }

    if (action === 'summary') {
      // Get quick summary of spiritual journey
      const [timeline, stats] = await Promise.all([
        journey.getTimeline(7), // Last week
        journey.getStats(),
      ]);

      const recentActivity = timeline.slice(0, 5);
      const progressScore = stats.transformationScore;
      const level = stats.currentLevel;

      return NextResponse.json({
        summary: {
          currentLevel: level,
          transformationScore: progressScore,
          totalConversations: stats.totalConversations,
          totalMessages: stats.totalMessages,
          streakDays: stats.streakDays,
          principlesStudied: stats.principlesStudied.length,
          recentActivity,
          nextMilestone: getNextMilestone(stats),
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          userId: session.user.id,
        },
      });
    }

    // Default: return timeline options and capabilities
    return NextResponse.json({
      capabilities: {
        maxTimelineDays: 365,
        supportedEventTypes: [
          "conversation",
          "insight", 
          "milestone",
          "practice",
          "transformation"
        ],
        features: [
          "Spiritual growth tracking",
          "Milestone achievements",
          "Journey insights and recommendations",
          "Progress analytics",
          "Activity streak monitoring",
          "Hermetic principle mastery tracking",
        ],
      },
      defaultOptions: {
        days: 30,
        includeStats: true,
        includeInsights: false,
        includeMilestones: false,
      },
      examples: {
        recentTimeline: "/api/journey/timeline?action=summary",
        fullStats: "/api/journey/timeline?action=stats&includeGrowthTrend=true",
        insights: "/api/journey/timeline?action=insights",
        milestones: "/api/journey/timeline?action=milestones",
      },
    });
  } catch (error) {
    logger.error({ error }, "Timeline GET API error");
    return NextResponse.json(
      { error: "Failed to get timeline data" },
      { status: 500 }
    );
  }
}

function getNextMilestone(stats: {
  totalConversations: number;
  streakDays: number;
  transformationScore: number;
  principlesStudied: string[];
}): string {
  const conversationMilestones = [10, 25, 50, 100, 250, 500];
  const nextConversation = conversationMilestones.find(n => n > stats.totalConversations);
  
  const streakMilestones = [7, 14, 30, 60, 100];
  const nextStreak = streakMilestones.find(n => n > stats.streakDays);
  
  const transformationMilestones = [25, 50, 75, 90];
  const nextTransformation = transformationMilestones.find(n => n > stats.transformationScore);

  // Return the closest milestone
  const options = [
    nextConversation ? `${nextConversation} conversations` : null,
    nextStreak ? `${nextStreak}-day streak` : null,
    nextTransformation ? `${nextTransformation}% transformation` : null,
    stats.principlesStudied.length < 7 ? `Study all 7 hermetic principles` : null,
  ].filter(Boolean);

  return options[0] || "Continue your spiritual journey";
}