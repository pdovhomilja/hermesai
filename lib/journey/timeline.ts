import { prisma } from "@/lib/db/client";
import { startOfDay, endOfDay, subDays, format, startOfMonth, endOfMonth } from "date-fns";

export interface TimelineEvent {
  id: string;
  type: "conversation" | "insight" | "milestone" | "practice" | "transformation";
  date: Date;
  title: string;
  description: string;
  significance: "low" | "medium" | "high" | "critical";
  metadata?: {
    conversationId?: string;
    messageCount?: number;
    principlesDiscussed?: string[];
    emotionalState?: string;
    spiritualLevel?: string;
    challengesAddressed?: string[];
    practiceType?: string;
    transformationType?: string;
  };
}

export interface JourneyStats {
  totalConversations: number;
  totalMessages: number;
  totalInsights: number;
  principlesStudied: string[];
  challengesAddressed: string[];
  currentLevel: string;
  transformationScore: number;
  streakDays: number;
  lastActiveDate: Date | null;
  monthlyProgress: {
    conversations: number;
    messages: number;
    newPrinciples: number;
  };
  spiritualGrowthTrend: Array<{
    month: string;
    score: number;
    conversations: number;
    insights: number;
  }>;
}

export interface MilestoneAchievement {
  id: string;
  type: "conversation_count" | "principle_mastery" | "streak_achievement" | "spiritual_level" | "transformation_complete";
  title: string;
  description: string;
  achievedAt: Date;
  criteria: any;
  reward?: string;
}

/**
 * SpiritualJourney
 * 
 * Tracks and visualizes a seeker's spiritual development over time,
 * creating a meaningful timeline of their journey with Hermes Trismegistus.
 * Identifies milestones, patterns, and growth opportunities.
 */
export class SpiritualJourney {
  constructor(private userId: string) {}

  /**
   * Get comprehensive timeline of spiritual journey
   */
  async getTimeline(
    days: number = 30,
    includeTypes?: string[]
  ): Promise<TimelineEvent[]> {
    const startDate = subDays(new Date(), days);
    const events: TimelineEvent[] = [];

    // Get conversations with their significance
    if (!includeTypes || includeTypes.includes("conversation")) {
      const conversations = await this.getConversationEvents(startDate);
      events.push(...conversations);
    }

    // Get spiritual insights
    if (!includeTypes || includeTypes.includes("insight")) {
      const insights = await this.getInsightEvents(startDate);
      events.push(...insights);
    }

    // Get milestone achievements
    if (!includeTypes || includeTypes.includes("milestone")) {
      const milestones = await this.getMilestoneEvents(startDate);
      events.push(...milestones);
    }

    // Get transformation events
    if (!includeTypes || includeTypes.includes("transformation")) {
      const transformations = await this.getTransformationEvents(startDate);
      events.push(...transformations);
    }

    // Get practice events
    if (!includeTypes || includeTypes.includes("practice")) {
      const practices = await this.getPracticeEvents(startDate);
      events.push(...practices);
    }

    // Sort by date and significance
    events.sort((a, b) => {
      const dateCompare = b.date.getTime() - a.date.getTime();
      if (dateCompare !== 0) return dateCompare;
      
      const significanceWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      return significanceWeight[b.significance] - significanceWeight[a.significance];
    });

    return events;
  }

  /**
   * Get comprehensive journey statistics
   */
  async getStats(): Promise<JourneyStats> {
    const [
      conversations,
      messages,
      insights,
      profile,
      recentActivity,
      monthlyProgress,
      spiritualTrend,
    ] = await Promise.all([
      this.getConversationCount(),
      this.getMessageCount(),
      this.getInsightCount(),
      this.getSpiritualProfile(),
      this.getActivityStreak(),
      this.getMonthlyProgress(),
      this.getSpiritualGrowthTrend(),
    ]);

    // Get unique principles and challenges
    const [principlesData, challengesData] = await Promise.all([
      this.getStudiedPrinciples(),
      this.getAddressedChallenges(),
    ]);

    return {
      totalConversations: conversations,
      totalMessages: messages,
      totalInsights: insights,
      principlesStudied: principlesData,
      challengesAddressed: challengesData,
      currentLevel: profile?.currentLevel || "SEEKER",
      transformationScore: profile?.transformationScore || 0,
      streakDays: recentActivity.streakDays,
      lastActiveDate: recentActivity.lastActive,
      monthlyProgress,
      spiritualGrowthTrend: spiritualTrend,
    };
  }

  /**
   * Check for new milestones and achievements
   */
  async checkForMilestones(): Promise<MilestoneAchievement[]> {
    const newMilestones: MilestoneAchievement[] = [];
    const stats = await this.getStats();

    // Check conversation count milestones
    const conversationMilestones = [10, 25, 50, 100, 250, 500];
    for (const milestone of conversationMilestones) {
      if (stats.totalConversations >= milestone) {
        const exists = await this.checkMilestoneExists(`conversations_${milestone}`);
        if (!exists) {
          const achievement = await this.createMilestone({
            type: "conversation_count",
            title: `${milestone} Conversations`,
            description: `You've had ${milestone} meaningful conversations with Hermes Trismegistus. Your dedication to spiritual growth is admirable.`,
            criteria: { conversationCount: milestone },
            reward: this.getConversationReward(milestone),
          });
          newMilestones.push(achievement);
        }
      }
    }

    // Check principle mastery milestones
    const principleCount = stats.principlesStudied.length;
    if (principleCount === 7) {
      const exists = await this.checkMilestoneExists("all_principles_studied");
      if (!exists) {
        const achievement = await this.createMilestone({
          type: "principle_mastery",
          title: "Hermetic Initiate",
          description: "You have explored all seven hermetic principles. You now understand the fundamental laws governing both the physical and spiritual realms.",
          criteria: { principlesStudied: 7 },
          reward: "Unlocked advanced hermetic teachings",
        });
        newMilestones.push(achievement);
      }
    }

    // Check streak achievements
    const streakMilestones = [7, 14, 30, 60, 100];
    for (const milestone of streakMilestones) {
      if (stats.streakDays >= milestone) {
        const exists = await this.checkMilestoneExists(`streak_${milestone}`);
        if (!exists) {
          const achievement = await this.createMilestone({
            type: "streak_achievement",
            title: `${milestone}-Day Journey`,
            description: `You've maintained consistent spiritual practice for ${milestone} days. Your commitment to growth is unwavering.`,
            criteria: { streakDays: milestone },
            reward: this.getStreakReward(milestone),
          });
          newMilestones.push(achievement);
        }
      }
    }

    // Check transformation score milestones
    const transformationMilestones = [25, 50, 75, 90];
    for (const milestone of transformationMilestones) {
      if (stats.transformationScore >= milestone) {
        const exists = await this.checkMilestoneExists(`transformation_${milestone}`);
        if (!exists) {
          const achievement = await this.createMilestone({
            type: "transformation_complete",
            title: this.getTransformationTitle(milestone),
            description: this.getTransformationDescription(milestone),
            criteria: { transformationScore: milestone },
            reward: "Enhanced spiritual guidance capabilities",
          });
          newMilestones.push(achievement);
        }
      }
    }

    return newMilestones;
  }

  /**
   * Get journey insights and recommendations
   */
  async getJourneyInsights(): Promise<{
    insights: string[];
    recommendations: string[];
    nextMilestones: string[];
    patterns: string[];
  }> {
    const stats = await this.getStats();
    const timeline = await this.getTimeline(90); // Last 3 months

    const insights: string[] = [];
    const recommendations: string[] = [];
    const nextMilestones: string[] = [];
    const patterns: string[] = [];

    // Analyze conversation patterns
    if (stats.totalConversations > 10) {
      const avgMessagesPerConversation = stats.totalMessages / stats.totalConversations;
      if (avgMessagesPerConversation > 15) {
        insights.push("You engage in deep, meaningful conversations with Hermes. This indicates serious commitment to spiritual growth.");
      }
      
      patterns.push(`Average ${Math.round(avgMessagesPerConversation)} messages per conversation`);
    }

    // Analyze spiritual growth
    if (stats.spiritualGrowthTrend.length > 1) {
      const recentGrowth = stats.spiritualGrowthTrend.slice(-2);
      const growthRate = recentGrowth[1].score - recentGrowth[0].score;
      
      if (growthRate > 5) {
        insights.push("Your spiritual development has accelerated recently. The wisdom is integrating beautifully.");
      } else if (growthRate < -2) {
        recommendations.push("Consider returning to fundamental practices. Sometimes we need to consolidate before advancing further.");
      }
    }

    // Analyze principles studied
    const unstudiedPrinciples = [
      "mentalism", "correspondence", "vibration", "polarity", 
      "rhythm", "causation", "gender"
    ].filter(p => !stats.principlesStudied.includes(p));

    if (unstudiedPrinciples.length > 0) {
      recommendations.push(`Explore the principle of ${unstudiedPrinciples[0]} to deepen your understanding.`);
      nextMilestones.push(`Study the remaining ${unstudiedPrinciples.length} hermetic principles`);
    }

    // Analyze activity patterns
    if (stats.streakDays < 7) {
      recommendations.push("Establish a daily practice routine. Even 5 minutes of reflection can maintain your spiritual momentum.");
    }

    // Suggest next milestones
    const nextConversationMilestone = [10, 25, 50, 100, 250, 500].find(n => n > stats.totalConversations);
    if (nextConversationMilestone) {
      nextMilestones.push(`Reach ${nextConversationMilestone} total conversations`);
    }

    return { insights, recommendations, nextMilestones, patterns };
  }

  // Private helper methods

  private async getConversationEvents(startDate: Date): Promise<TimelineEvent[]> {
    const conversations = await prisma.conversation.findMany({
      where: {
        userId: this.userId,
        createdAt: { gte: startDate },
      },
      include: {
        messages: {
          select: {
            id: true,
            hermeticPrinciples: true,
            emotionalState: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return conversations.map((c): TimelineEvent => {
      const principlesDiscussed = [
        ...new Set(c.messages.flatMap(m => m.hermeticPrinciples))
      ];

      const messageCount = c._count.messages;
      let significance: TimelineEvent['significance'] = 'low';

      if (messageCount > 20 || principlesDiscussed.length > 2) significance = 'high';
      else if (messageCount > 10 || principlesDiscussed.length > 1) significance = 'medium';

      return {
        id: c.id,
        type: 'conversation',
        date: c.createdAt,
        title: c.title || 'Spiritual Guidance Session',
        description: `Engaged in ${messageCount} messages discussing ${principlesDiscussed.join(', ') || 'spiritual matters'}`,
        significance,
        metadata: {
          conversationId: c.id,
          messageCount,
          principlesDiscussed,
          emotionalState: c.messages[0]?.emotionalState || undefined,
        },
      };
    });
  }

  private async getInsightEvents(startDate: Date): Promise<TimelineEvent[]> {
    const insights = await prisma.userInsight.findMany({
      where: {
        userId: this.userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
    });

    return insights.map((i): TimelineEvent => ({
      id: i.id,
      type: 'insight',
      date: i.createdAt,
      title: `${i.type} Insight`,
      description: i.content,
      significance: i.significance.toLowerCase() as any,
      metadata: i.metadata as any,
    }));
  }

  private async getMilestoneEvents(startDate: Date): Promise<TimelineEvent[]> {
    // This would query a milestones table in a real implementation
    return [];
  }

  private async getTransformationEvents(startDate: Date): Promise<TimelineEvent[]> {
    // Detect significant changes in spiritual level or transformation score
    const spiritualUpdates = await prisma.spiritualProfile.findMany({
      where: {
        userId: this.userId,
        updatedAt: { gte: startDate },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return spiritualUpdates
      .filter((_, index) => index < spiritualUpdates.length - 1) // Skip the latest as it's current
      .map((update): TimelineEvent => ({
        id: `transformation_${update.id}`,
        type: 'transformation',
        date: update.updatedAt,
        title: `Spiritual Level: ${update.currentLevel}`,
        description: `Achieved ${update.currentLevel} level with transformation score of ${update.transformationScore}`,
        significance: 'high',
        metadata: {
          spiritualLevel: update.currentLevel,
        },
      }));
  }

  private async getPracticeEvents(startDate: Date): Promise<TimelineEvent[]> {
    // This would track daily practices in a real implementation
    return [];
  }

  private async getConversationCount(): Promise<number> {
    return prisma.conversation.count({
      where: { userId: this.userId, status: "ACTIVE" },
    });
  }

  private async getMessageCount(): Promise<number> {
    return prisma.message.count({
      where: { conversation: { userId: this.userId } },
    });
  }

  private async getInsightCount(): Promise<number> {
    return prisma.userInsight.count({
      where: { userId: this.userId },
    });
  }

  private async getSpiritualProfile() {
    return prisma.spiritualProfile.findUnique({
      where: { userId: this.userId },
    });
  }

  private async getActivityStreak(): Promise<{
    streakDays: number;
    lastActive: Date | null;
  }> {
    const thirtyDaysAgo = subDays(new Date(), 30);

    const activities = await prisma.conversation.findMany({
      where: {
        userId: this.userId,
        lastMessageAt: { gte: thirtyDaysAgo },
      },
      select: {
        lastMessageAt: true,
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    if (activities.length === 0) {
      return { streakDays: 0, lastActive: null };
    }

    // Calculate consecutive days with activity
    let streakDays = 0;
    let currentDate = startOfDay(new Date());

    for (let i = 0; i < 30; i++) {
      const dayStart = startOfDay(currentDate);
      const dayEnd = endOfDay(currentDate);

      const hasActivity = activities.some(
        (a) =>
          a.lastMessageAt &&
          a.lastMessageAt >= dayStart &&
          a.lastMessageAt <= dayEnd
      );

      if (hasActivity) {
        streakDays++;
        currentDate = subDays(currentDate, 1);
      } else if (i === 0) {
        // No activity today, check yesterday
        currentDate = subDays(currentDate, 1);
      } else {
        // Streak broken
        break;
      }
    }

    return {
      streakDays,
      lastActive: activities[0]?.lastMessageAt || null,
    };
  }

  private async getMonthlyProgress(): Promise<{
    conversations: number;
    messages: number;
    newPrinciples: number;
  }> {
    const thisMonth = startOfMonth(new Date());

    const [conversations, messages, principles] = await Promise.all([
      prisma.conversation.count({
        where: {
          userId: this.userId,
          createdAt: { gte: thisMonth },
        },
      }),
      prisma.message.count({
        where: {
          conversation: { userId: this.userId },
          createdAt: { gte: thisMonth },
        },
      }),
      prisma.message.findMany({
        where: {
          conversation: { userId: this.userId },
          createdAt: { gte: thisMonth },
          hermeticPrinciples: { isEmpty: false },
        },
        select: { hermeticPrinciples: true },
      }),
    ]);

    const newPrinciples = new Set(principles.flatMap(p => p.hermeticPrinciples)).size;

    return {
      conversations,
      messages,
      newPrinciples,
    };
  }

  private async getSpiritualGrowthTrend(): Promise<Array<{
    month: string;
    score: number;
    conversations: number;
    insights: number;
  }>> {
    // This would track monthly spiritual growth metrics
    // For now, return empty array
    return [];
  }

  private async getStudiedPrinciples(): Promise<string[]> {
    const principlesData = await prisma.message.findMany({
      where: {
        conversation: { userId: this.userId },
        hermeticPrinciples: { isEmpty: false },
      },
      select: {
        hermeticPrinciples: true,
      },
    });

    return [...new Set(principlesData.flatMap((m) => m.hermeticPrinciples))];
  }

  private async getAddressedChallenges(): Promise<string[]> {
    const challengesData = await prisma.userInsight.findMany({
      where: {
        userId: this.userId,
        type: "CHALLENGE",
      },
      select: {
        metadata: true,
      },
    });

    return [
      ...new Set(
        challengesData
          .map((i) => (i.metadata as any)?.challenge)
          .filter(Boolean)
      ),
    ];
  }

  // Milestone helper methods

  private async checkMilestoneExists(milestoneId: string): Promise<boolean> {
    // This would check a milestones table in a real implementation
    return false;
  }

  private async createMilestone(data: {
    type: MilestoneAchievement['type'];
    title: string;
    description: string;
    criteria: any;
    reward?: string;
  }): Promise<MilestoneAchievement> {
    // This would create a milestone record in a real implementation
    return {
      id: `milestone_${Date.now()}`,
      ...data,
      achievedAt: new Date(),
    };
  }

  private getConversationReward(count: number): string {
    const rewards = {
      10: "Seeker's Badge - First steps on the path",
      25: "Student's Scroll - Deeper understanding unlocked",
      50: "Adept's Ring - Wisdom begins to integrate",
      100: "Master's Cloak - True spiritual seeker",
      250: "Sage's Staff - Teacher of others",
      500: "Mystic's Crown - Hermetic wisdom embodied",
    };
    return rewards[count as keyof typeof rewards] || "Spiritual recognition";
  }

  private getStreakReward(days: number): string {
    const rewards = {
      7: "Week Warrior - Consistency is key",
      14: "Fortnight Faithful - Dedication recognized",
      30: "Monthly Master - A lunar cycle of growth",
      60: "Seasonal Sage - Through all seasons",
      100: "Century Seeker - Unwavering commitment",
    };
    return rewards[days as keyof typeof rewards] || "Persistence prize";
  }

  private getTransformationTitle(score: number): string {
    if (score >= 90) return "Hermetic Master";
    if (score >= 75) return "Advanced Adept";
    if (score >= 50) return "Dedicated Student";
    return "Committed Seeker";
  }

  private getTransformationDescription(score: number): string {
    if (score >= 90) return "You have achieved mastery of the hermetic arts. Your wisdom now serves to guide others on their spiritual journey.";
    if (score >= 75) return "You demonstrate advanced understanding of spiritual principles. Your transformation is becoming a beacon for others.";
    if (score >= 50) return "You have made significant progress in your spiritual development. The ancient wisdom is taking root.";
    return "Your commitment to spiritual growth is evident. The foundations of wisdom are being established.";
  }
}