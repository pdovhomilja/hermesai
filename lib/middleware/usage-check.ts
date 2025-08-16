import { UsageTracker } from "@/lib/usage/tracker";
import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function checkUsageMiddleware(
  userId: string,
  metric: "CONVERSATIONS" | "MESSAGES" | "EXPORTS"
) {
  const tracker = new UsageTracker();
  const { allowed, remaining, limit } = await tracker.checkUsageLimit(
    userId,
    metric
  );

  if (!allowed) {
    logger.info({
      userId,
      metric,
      limit,
      remaining,
    }, "Usage limit exceeded");

    return NextResponse.json(
      {
        error: "Usage limit exceeded",
        message: `You have reached your ${metric.toLowerCase()} limit for this month.`,
        limit,
        remaining: 0,
        upgradeUrl: "/pricing",
        resetDate: getNextResetDate(),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": getNextResetDate(),
          "X-RateLimit-Type": metric,
          "Retry-After": getRetryAfterSeconds().toString(),
        },
      }
    );
  }

  return null;
}

export async function checkFeatureAccess(
  userId: string,
  feature: "export" | "advancedFeatures" | "thinkingMode" | "vipFeatures"
) {
  const tracker = new UsageTracker();
  const hasAccess = await tracker.canUseFeature(userId, feature);

  if (!hasAccess) {
    logger.info({
      userId,
      feature,
    }, "Feature access denied");

    return NextResponse.json(
      {
        error: "Feature not available",
        message: `The ${feature} feature is not available in your current plan.`,
        upgradeUrl: "/pricing",
        feature,
      },
      {
        status: 403,
        headers: {
          "X-Feature-Access": "denied",
          "X-Feature-Name": feature,
        },
      }
    );
  }

  return null;
}

export async function trackUsageAfterSuccess(
  userId: string,
  metric: "CONVERSATIONS" | "MESSAGES" | "EXPORTS",
  count: number = 1
) {
  try {
    const tracker = new UsageTracker();
    await tracker.trackUsage(userId, metric, count);

    logger.info({
      userId,
      metric,
      count,
    }, "Usage tracked");
  } catch (error) {
    logger.error({
      userId,
      metric,
      count,
      error,
    }, "Failed to track usage");
    // Don't throw error as this shouldn't fail the request
  }
}

export function withUsageCheck(
  metric: "CONVERSATIONS" | "MESSAGES" | "EXPORTS",
  trackAfterSuccess: boolean = true
) {
  return function usageCheckDecorator(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (req: Request, ...args: any[]) {
      try {
        // Extract userId from the request (this assumes auth middleware has run)
        const userId = (req as any).userId || (req as any).user?.id;

        if (!userId) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
          );
        }

        // Check usage limit before proceeding
        const usageCheckResult = await checkUsageMiddleware(userId, metric);
        if (usageCheckResult) {
          return usageCheckResult;
        }

        // Call the original method
        const result = await originalMethod.apply(this, [req, ...args]);

        // Track usage after successful completion if requested
        if (trackAfterSuccess && result && result.status !== 429 && result.status < 400) {
          await trackUsageAfterSuccess(userId, metric);
        }

        return result;
      } catch (error) {
        logger.error({ error }, "Usage check decorator error");
        throw error;
      }
    };

    return descriptor;
  };
}

export async function addUsageHeaders(
  response: NextResponse,
  userId: string,
  metric: "CONVERSATIONS" | "MESSAGES" | "EXPORTS"
): Promise<NextResponse> {
  try {
    const tracker = new UsageTracker();
    const { remaining, limit } = await tracker.checkUsageLimit(userId, metric);

    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", getNextResetDate());
    response.headers.set("X-RateLimit-Type", metric);

    return response;
  } catch (error) {
    logger.error({ error }, "Failed to add usage headers");
    return response;
  }
}

// Helper functions

function getNextResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

function getRetryAfterSeconds(): number {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return Math.floor((nextMonth.getTime() - now.getTime()) / 1000);
}

// Export a convenience function for manual usage checking in API routes
export async function validateUsageAndFeature(
  userId: string,
  metric: "CONVERSATIONS" | "MESSAGES" | "EXPORTS",
  feature?: "export" | "advancedFeatures" | "thinkingMode" | "vipFeatures"
): Promise<NextResponse | null> {
  // Check usage limit
  const usageResult = await checkUsageMiddleware(userId, metric);
  if (usageResult) return usageResult;

  // Check feature access if specified
  if (feature) {
    const featureResult = await checkFeatureAccess(userId, feature);
    if (featureResult) return featureResult;
  }

  return null; // All checks passed
}