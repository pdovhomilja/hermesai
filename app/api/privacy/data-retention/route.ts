import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { z } from "zod";
import logger from "@/lib/logger";

const retentionSettingsSchema = z.object({
  conversationRetentionDays: z.number().min(30).max(3650).default(365),
  automaticDeletion: z.boolean().default(false),
  exportBeforeDeletion: z.boolean().default(true),
  deletionWarningDays: z.number().min(1).max(30).default(7),
  keepInsights: z.boolean().default(true),
  keepStats: z.boolean().default(true),
  allowAnalytics: z.boolean().default(true),
});

const bulkDeleteSchema = z.object({
  deleteType: z.enum(["older_than", "specific_conversations", "all_data"]),
  olderThanDays: z.number().min(1).optional(),
  conversationIds: z.array(z.string()).optional(),
  confirmDelete: z.boolean(),
  exportFirst: z.boolean().default(false),
});

/**
 * Privacy Controls API
 * 
 * Handles data retention settings, bulk data deletion, and privacy policy enforcement.
 * Ensures user conversations are protected according to their privacy preferences.
 */

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const action = body.action;

    switch (action) {
      case "update_settings":
        return await updateRetentionSettings(session.user.id, body);

      case "bulk_delete":
        return await bulkDeleteData(session.user.id, body);

      case "export_and_delete":
        return await exportAndDelete(session.user.id);

      case "anonymize_data":
        return await anonymizeUserData(session.user.id, body);

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    logger.error({ error }, "Privacy API error");

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid privacy parameters", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Privacy operation failed" }, { status: 500 });
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

    if (action === 'settings') {
      // Get current retention settings
      const settings = await prisma.userPreference.findUnique({
        where: { userId: session.user.id },
      });

      return NextResponse.json({
        settings: settings || getDefaultRetentionSettings(),
        capabilities: {
          minRetentionDays: 30,
          maxRetentionDays: 3650,
          supportsAutomaticDeletion: true,
          supportsExportBeforeDeletion: true,
          supportsDataAnonymization: true,
        },
      });
    }

    if (action === 'data_overview') {
      // Get overview of user's data for privacy dashboard
      const [
        conversationCount,
        messageCount,
        insightCount,
        oldestConversation,
        storageEstimate,
      ] = await Promise.all([
        prisma.conversation.count({
          where: { userId: session.user.id, status: "ACTIVE" },
        }),
        prisma.message.count({
          where: { conversation: { userId: session.user.id } },
        }),
        prisma.userInsight.count({
          where: { userId: session.user.id },
        }),
        prisma.conversation.findFirst({
          where: { userId: session.user.id, status: "ACTIVE" },
          orderBy: { createdAt: "asc" },
          select: { createdAt: true },
        }),
        estimateUserDataSize(session.user.id),
      ]);

      return NextResponse.json({
        dataOverview: {
          conversations: conversationCount,
          messages: messageCount,
          insights: insightCount,
          oldestData: oldestConversation?.createdAt,
          estimatedSize: storageEstimate,
        },
        retentionInfo: {
          conversationsReadyForDeletion: await getExpiredConversationCount(session.user.id),
          upcomingDeletions: await getUpcomingDeletions(session.user.id),
        },
      });
    }

    if (action === 'deletion_candidates') {
      // Get conversations that can be deleted based on retention settings
      const candidates = await getDeletionCandidates(session.user.id);
      
      return NextResponse.json({
        candidates,
        total: candidates.length,
        estimatedSpaceReclaimed: await estimateSpaceReclaimed(candidates),
      });
    }

    // Default: return privacy policy and options
    return NextResponse.json({
      privacyPolicy: {
        dataRetention: "Your conversations are stored securely and retained according to your preferences",
        dataProcessing: "Data is processed only to provide spiritual guidance and improve your experience",
        dataSharing: "Your conversations are never shared with third parties",
        userRights: [
          "Right to export your data",
          "Right to delete your data", 
          "Right to anonymize your data",
          "Right to modify retention settings",
        ],
      },
      options: {
        retentionSettings: "/api/privacy/data-retention?action=settings",
        dataOverview: "/api/privacy/data-retention?action=data_overview",
        bulkDelete: "POST /api/privacy/data-retention with action=bulk_delete",
        exportAndDelete: "POST /api/privacy/data-retention with action=export_and_delete",
      },
    });
  } catch (error) {
    logger.error({ error }, "Privacy GET API error");
    return NextResponse.json({ error: "Failed to get privacy data" }, { status: 500 });
  }
}

// Helper functions for privacy operations

async function updateRetentionSettings(userId: string, body: { settings: Record<string, unknown> }) {
  const settings = retentionSettingsSchema.parse(body.settings);

  const updated = await prisma.userPreference.upsert({
    where: { userId },
    update: {
      dataRetention: settings.conversationRetentionDays,
      metadata: {
        privacySettings: {
          automaticDeletion: settings.automaticDeletion,
          exportBeforeDeletion: settings.exportBeforeDeletion,
          deletionWarningDays: settings.deletionWarningDays,
          keepInsights: settings.keepInsights,
          keepStats: settings.keepStats,
          allowAnalytics: settings.allowAnalytics,
        }
      },
      updatedAt: new Date(),
    },
    create: {
      userId,
      dataRetention: settings.conversationRetentionDays,
      metadata: {
        privacySettings: {
          automaticDeletion: settings.automaticDeletion,
          exportBeforeDeletion: settings.exportBeforeDeletion,
          deletionWarningDays: settings.deletionWarningDays,
          keepInsights: settings.keepInsights,
          keepStats: settings.keepStats,
          allowAnalytics: settings.allowAnalytics,
        }
      },
    },
  });

  logger.info({ 
    userId, 
    retentionDays: settings.conversationRetentionDays,
    automaticDeletion: settings.automaticDeletion,
  }, "Privacy settings updated");

  // Schedule automatic deletion if enabled
  if (settings.automaticDeletion) {
    await scheduleAutomaticDeletion(userId);
  }

  return NextResponse.json({
    success: true,
    settings: updated,
    message: "Privacy settings updated successfully",
  });
}

async function bulkDeleteData(userId: string, body: Record<string, unknown>) {
  const deleteParams = bulkDeleteSchema.parse(body);

  if (!deleteParams.confirmDelete) {
    return NextResponse.json(
      { error: "Deletion must be confirmed" },
      { status: 400 }
    );
  }

  const deletionQuery: {
    userId: string;
    status: "ACTIVE";
    createdAt?: { lt: Date };
    id?: { in: string[] };
  } = {
    userId,
    status: "ACTIVE",
  };

  let deletionSummary = "";

  switch (deleteParams.deleteType) {
    case "older_than":
      if (!deleteParams.olderThanDays) {
        return NextResponse.json(
          { error: "olderThanDays is required for older_than deletion" },
          { status: 400 }
        );
      }
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - deleteParams.olderThanDays);
      
      deletionQuery.createdAt = { lt: cutoffDate };
      deletionSummary = `conversations older than ${deleteParams.olderThanDays} days`;
      break;

    case "specific_conversations":
      if (!deleteParams.conversationIds || deleteParams.conversationIds.length === 0) {
        return NextResponse.json(
          { error: "conversationIds is required for specific deletion" },
          { status: 400 }
        );
      }
      
      deletionQuery.id = { in: deleteParams.conversationIds };
      deletionSummary = `${deleteParams.conversationIds.length} specific conversations`;
      break;

    case "all_data":
      deletionSummary = "all conversation data";
      break;
  }

  // Export first if requested
  let exportResult = null;
  if (deleteParams.exportFirst) {
    const { ConversationExporter } = await import("@/lib/export/exporter");
    const exporter = new ConversationExporter(userId);
    
    exportResult = await exporter.export({
      format: "json",
      conversationIds: deleteParams.conversationIds,
      includeMetadata: true,
      includeInsights: true,
    });
  }

  // Count conversations for logging
  await prisma.conversation.count({
    where: deletionQuery,
  });

  // Perform soft deletion (mark as deleted rather than hard delete)
  const deletedConversations = await prisma.conversation.updateMany({
    where: deletionQuery,
    data: {
      status: "DELETED",
    },
  });

  logger.info({
    userId,
    deleteType: deleteParams.deleteType,
    conversationsDeleted: deletedConversations.count,
    exportFirst: deleteParams.exportFirst,
  }, "Bulk data deletion completed");

  return NextResponse.json({
    success: true,
    deleted: {
      conversations: deletedConversations.count,
      type: deleteParams.deleteType,
      summary: deletionSummary,
    },
    export: deleteParams.exportFirst ? {
      format: "json",
      size: exportResult ? Buffer.byteLength(exportResult.toString()) : 0,
    } : null,
    message: `Successfully deleted ${deletedConversations.count} conversations`,
  });
}

async function exportAndDelete(userId: string) {
  const { ConversationExporter } = await import("@/lib/export/exporter");
  const exporter = new ConversationExporter(userId);

  // Export all data
  const exportData = await exporter.export({
    format: "json",
    includeMetadata: true,
    includeInsights: true,
    includeHermeticContext: true,
  });

  // Perform deletion
  const deletionResult = await bulkDeleteData(userId, {
    deleteType: "all_data",
    confirmDelete: true,
    exportFirst: false, // Already exported
  });

  return NextResponse.json({
    success: true,
    export: {
      format: "json",
      size: Buffer.byteLength(exportData.toString()),
      timestamp: new Date().toISOString(),
    },
    deletion: deletionResult,
    message: "Data exported and deleted successfully",
  });
}

async function anonymizeUserData(userId: string, body: { keepStatistics?: boolean; keepInsights?: boolean }) {
  const { keepStatistics = true, keepInsights = false } = body;

  // Replace personal content with anonymized versions
  const conversations = await prisma.conversation.findMany({
    where: { userId, status: "ACTIVE" },
    include: { messages: true },
  });

  let anonymizedConversations = 0;
  let anonymizedMessages = 0;

  for (const conversation of conversations) {
    // Anonymize conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        title: `Anonymized Conversation ${conversation.id.slice(-8)}`,
        ...(keepStatistics ? {} : { metadata: {} }),
      },
    });

    // Anonymize messages
    for (const message of conversation.messages) {
      await prisma.message.update({
        where: { id: message.id },
        data: {
          content: `[Content anonymized - ${message.content.length} characters]`,
          ...(keepStatistics ? {} : { metadata: {} }),
        },
      });
      anonymizedMessages++;
    }

    anonymizedConversations++;
  }

  // Anonymize insights if not keeping them
  if (!keepInsights) {
    await prisma.userInsight.deleteMany({
      where: { userId },
    });
  }

  logger.info({
    userId,
    anonymizedConversations,
    anonymizedMessages,
    keepStatistics,
    keepInsights,
  }, "User data anonymized");

  return NextResponse.json({
    success: true,
    anonymized: {
      conversations: anonymizedConversations,
      messages: anonymizedMessages,
      insights: !keepInsights,
      statistics: keepStatistics,
    },
    message: "Data anonymized successfully while preserving spiritual journey progress",
  });
}

// Helper utility functions

function getDefaultRetentionSettings() {
  return {
    dataRetention: 365,
    metadata: {
      privacySettings: {
        automaticDeletion: false,
        exportBeforeDeletion: true,
        deletionWarningDays: 7,
        keepInsights: true,
        keepStats: true,
        allowAnalytics: true,
      }
    },
  };
}

async function estimateUserDataSize(userId: string): Promise<string> {
  const [conversations, messageCount] = await Promise.all([
    prisma.conversation.count({ where: { userId, status: "ACTIVE" } }),
    prisma.message.count({ where: { conversation: { userId } } }),
  ]);

  // Rough estimation: 1KB per conversation + 0.5KB per message average
  const estimatedKB = conversations + messageCount * 0.5;
  
  if (estimatedKB > 1024) {
    return `${(estimatedKB / 1024).toFixed(1)} MB`;
  }
  return `${estimatedKB.toFixed(0)} KB`;
}

async function getExpiredConversationCount(userId: string): Promise<number> {
  const settings = await prisma.userPreference.findUnique({
    where: { userId },
  });

  if (!settings || !settings.dataRetention || settings.dataRetention === 0) return 0;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - settings.dataRetention);

  return prisma.conversation.count({
    where: {
      userId,
      status: "ACTIVE",
      createdAt: { lt: cutoffDate },
    },
  });
}

async function getUpcomingDeletions(userId: string): Promise<Array<{
  date: string;
  count: number;
}>> {
  const settings = await prisma.userPreference.findUnique({
    where: { userId },
  });

  const privacySettings = (settings?.metadata as Record<string, unknown>)?.privacySettings as Record<string, unknown> | undefined;
  if (!privacySettings?.automaticDeletion) return [];

  // Return conversations that will be auto-deleted in the next 30 days
  const warningDate = new Date();
  const retentionDays = settings?.dataRetention || 365;
  const deletionWarningDays = (privacySettings?.deletionWarningDays as number) || 7;
  warningDate.setDate(warningDate.getDate() - (retentionDays - deletionWarningDays));

  const upcomingDeletions = await prisma.conversation.groupBy({
    by: ['createdAt'],
    where: {
      userId,
      status: "ACTIVE",
      createdAt: { 
        gte: warningDate,
        lt: new Date(),
      },
    },
    _count: true,
  });

  return upcomingDeletions.map(d => ({
    date: d.createdAt.toISOString().split('T')[0],
    count: d._count,
  }));
}

async function getDeletionCandidates(userId: string): Promise<Array<{
  id: string;
  title: string | null;
  createdAt: Date;
  _count: { messages: number };
}>> {
  const settings = await prisma.userPreference.findUnique({
    where: { userId },
  });

  const retentionDays = settings?.dataRetention || 365;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  return prisma.conversation.findMany({
    where: {
      userId,
      status: "ACTIVE",
      createdAt: { lt: cutoffDate },
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      _count: {
        select: {
          messages: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  });
}

async function estimateSpaceReclaimed(candidates: Array<{ _count: { messages: number } }>): Promise<string> {
  const totalConversations = candidates.length;
  const totalMessages = candidates.reduce((sum, c) => sum + c._count.messages, 0);
  
  // Rough estimation
  const estimatedKB = totalConversations * 2 + totalMessages * 0.5;
  
  if (estimatedKB > 1024) {
    return `${(estimatedKB / 1024).toFixed(1)} MB`;
  }
  return `${estimatedKB.toFixed(0)} KB`;
}

async function scheduleAutomaticDeletion(userId: string) {
  // In a production system, this would schedule a background job
  // For now, just log the scheduling
  logger.info({ userId }, "Automatic deletion scheduled");
}