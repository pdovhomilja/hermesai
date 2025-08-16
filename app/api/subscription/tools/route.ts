import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { toolAccessController } from "@/lib/subscription/tool-access-control";
import logger from "@/lib/logger";

const toolAccessRequestSchema = z.object({
  toolName: z.string(),
  parameters: z.record(z.string(), z.unknown()).optional()
});

const subscriptionInfoRequestSchema = z.object({
  includeUsage: z.boolean().default(true),
  includeAvailableTools: z.boolean().default(true)
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
    const action = searchParams.get("action") || "info";

    let data;

    switch (action) {
      case "info":
        data = await toolAccessController.getSubscriptionUsageStats(session.user.id);
        break;

      case "available":
        data = await toolAccessController.getAvailableTools(session.user.id);
        break;

      case "check":
        const toolName = searchParams.get("toolName");
        if (!toolName) {
          return NextResponse.json(
            { error: "toolName parameter is required for access check" },
            { status: 400 }
          );
        }

        const parametersStr = searchParams.get("parameters");
        let parameters: Record<string, unknown> | undefined;
        if (parametersStr) {
          try {
            parameters = JSON.parse(parametersStr);
          } catch {
            return NextResponse.json(
              { error: "Invalid parameters format" },
              { status: 400 }
            );
          }
        }

        data = await toolAccessController.checkToolAccess(
          session.user.id,
          toolName,
          parameters
        );
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        );
    }

    logger.info({
      userId: session.user.id,
      action,
      timestamp: new Date().toISOString()
    }, "Subscription tool access requested");

    return NextResponse.json({
      success: true,
      action,
      data
    });

  } catch (error) {
    logger.error({ 
      error, 
      userId: session.user.id,
      endpoint: "/api/subscription/tools"
    }, "Subscription tool access request failed");

    return NextResponse.json(
      { 
        error: "Request failed",
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
    const action = body.action || "check";

    let data;

    switch (action) {
      case "check":
        const { toolName, parameters } = toolAccessRequestSchema.parse(body);
        data = await toolAccessController.checkToolAccess(
          session.user.id,
          toolName,
          parameters
        );
        break;

      case "batch_check":
        if (!Array.isArray(body.tools)) {
          return NextResponse.json(
            { error: "tools array is required for batch check" },
            { status: 400 }
          );
        }

        const batchResults = await Promise.all(
          body.tools.map(async (tool: { toolName: string; parameters?: Record<string, unknown> }) => {
            const { toolName, parameters } = toolAccessRequestSchema.parse(tool);
            const result = await toolAccessController.checkToolAccess(
              session.user.id,
              toolName,
              parameters
            );
            return { toolName, ...result };
          })
        );

        data = { results: batchResults };
        break;

      case "subscription_info":
        const { includeUsage, includeAvailableTools } = subscriptionInfoRequestSchema.parse(body);
        
        const results: Record<string, unknown> = {};
        
        if (includeUsage) {
          results.usage = await toolAccessController.getSubscriptionUsageStats(session.user.id);
        }
        
        if (includeAvailableTools) {
          results.tools = await toolAccessController.getAvailableTools(session.user.id);
        }

        data = results;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    logger.info({
      userId: session.user.id,
      action,
      timestamp: new Date().toISOString()
    }, "Subscription tool access operation completed");

    return NextResponse.json({
      success: true,
      action,
      data
    });

  } catch (error) {
    logger.error({ 
      error, 
      userId: session.user.id
    }, "Subscription tool access operation failed");

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
        error: "Operation failed",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}