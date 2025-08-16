import { toolUsageTracker } from "@/lib/analytics/tool-usage-tracker";
import logger from "@/lib/logger";

export interface ToolExecutionContext {
  userId: string;
  conversationId?: string;
  sessionId?: string;
  userTier: string;
}

export interface ToolExecutionOptions {
  trackUsage?: boolean;
  trackCost?: boolean;
  trackTokens?: boolean;
}

export class AIToolTracker {
  
  static async trackToolExecution<T>(
    toolName: string,
    context: ToolExecutionContext,
    execution: () => Promise<T>,
    parameters?: Record<string, unknown>,
    options: ToolExecutionOptions = { trackUsage: true, trackCost: true, trackTokens: true }
  ): Promise<T> {
    const startTime = Date.now();
    let success = false;
    let errorMessage: string | undefined;
    let result: T;
    let inputTokens: number | undefined;
    let outputTokens: number | undefined;
    let cost: number | undefined;

    try {
      result = await execution();
      success = true;
      
      // Extract token and cost information if result has these properties
      if (options.trackTokens && result && typeof result === 'object') {
        const resultObj = result as any;
        if ('inputTokens' in resultObj) inputTokens = resultObj.inputTokens;
        if ('outputTokens' in resultObj) outputTokens = resultObj.outputTokens;
      }

      if (options.trackCost && result && typeof result === 'object') {
        const resultObj = result as any;
        if ('cost' in resultObj) {
          cost = resultObj.cost;
        } else {
          // Estimate cost based on tokens if available
          cost = AIToolTracker.estimateCost(toolName, inputTokens, outputTokens);
        }
      }

      return result;
    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw error;
    } finally {
      if (options.trackUsage) {
        try {
          await toolUsageTracker.trackToolUsage({
            userId: context.userId,
            toolName,
            toolType: "ai_tool",
            sessionId: context.sessionId,
            conversationId: context.conversationId,
            parameters,
            executionTime: Date.now() - startTime,
            success,
            errorMessage,
            inputTokens,
            outputTokens,
            cost,
            userTier: context.userTier,
            timestamp: new Date(),
            metadata: {
              startTime: new Date(startTime).toISOString(),
              endTime: new Date().toISOString()
            }
          });
        } catch (trackingError) {
          logger.error({ 
            trackingError, 
            toolName, 
            userId: context.userId 
          }, "Failed to track tool usage");
        }
      }
    }
  }

  static estimateCost(toolName: string, inputTokens?: number, outputTokens?: number): number {
    // Simple cost estimation based on tool type and token usage
    // These are rough estimates - actual costs should come from the tool response when possible
    
    const baseCosts = {
      // AI Tools - per execution
      "ritual_generator": 0.002,
      "dream_interpreter": 0.003,
      "mantra_creator": 0.001,
      "challenge_analyzer": 0.002,
      "meditation_generator": 0.002,
      "numerology_calculator": 0.001,
      "tarot_reader": 0.003,
      "sigil_creator": 0.002,
      "gpt5_thinking_mode": 0.005,
      "transformation_program": 0.008,
      
      // Voice generation - per character (converted from OpenAI pricing)
      "voice_generation": 0.000015,
      
      // Default
      "default": 0.001
    };

    let baseCost = baseCosts[toolName as keyof typeof baseCosts] || baseCosts.default;

    // Adjust cost based on token usage if available
    if (inputTokens || outputTokens) {
      const totalTokens = (inputTokens || 0) + (outputTokens || 0);
      // GPT-4 pricing: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
      const tokenCost = (inputTokens || 0) * 0.00003 + (outputTokens || 0) * 0.00006;
      baseCost = Math.max(baseCost, tokenCost);
    }

    return baseCost;
  }

  // Helper method to wrap existing AI tool functions with tracking
  static wrapToolFunction<TArgs extends any[], TReturn>(
    toolName: string,
    originalFunction: (...args: TArgs) => Promise<TReturn>,
    getContext: (...args: TArgs) => ToolExecutionContext,
    getParameters?: (...args: TArgs) => Record<string, unknown>,
    options?: ToolExecutionOptions
  ) {
    return async (...args: TArgs): Promise<TReturn> => {
      const context = getContext(...args);
      const parameters = getParameters?.(...args);

      return AIToolTracker.trackToolExecution(
        toolName,
        context,
        () => originalFunction(...args),
        parameters,
        options
      );
    };
  }

  // Batch tracking for multiple tool executions
  static async trackBatchExecution(
    executions: Array<{
      toolName: string;
      context: ToolExecutionContext;
      execution: () => Promise<any>;
      parameters?: Record<string, unknown>;
      options?: ToolExecutionOptions;
    }>
  ): Promise<any[]> {
    const results = await Promise.allSettled(
      executions.map(({ toolName, context, execution, parameters, options }) =>
        AIToolTracker.trackToolExecution(toolName, context, execution, parameters, options)
      )
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        logger.error({
          error: result.reason,
          toolName: executions[index].toolName,
          userId: executions[index].context.userId
        }, "Batch tool execution failed");
        throw result.reason;
      }
    });
  }

  // Track voice generation usage
  static async trackVoiceGeneration(
    context: ToolExecutionContext,
    execution: () => Promise<any>,
    textLength: number,
    voice?: string,
    options: ToolExecutionOptions = { trackUsage: true, trackCost: true }
  ): Promise<any> {
    return AIToolTracker.trackToolExecution(
      "voice_generation",
      context,
      execution,
      {
        textLength,
        voice,
        provider: "openai"
      },
      {
        ...options,
        trackTokens: false // Voice generation doesn't use tokens
      }
    );
  }

  // Track analytics usage
  static async trackAnalyticsUsage(
    analyticsType: string,
    context: ToolExecutionContext,
    execution: () => Promise<any>,
    parameters?: Record<string, unknown>,
    options: ToolExecutionOptions = { trackUsage: true, trackCost: false }
  ): Promise<any> {
    return AIToolTracker.trackToolExecution(
      `analytics_${analyticsType}`,
      context,
      execution,
      parameters,
      {
        ...options,
        trackTokens: false // Analytics doesn't use tokens
      }
    );
  }

  // Track conversation usage
  static async trackConversation(
    context: ToolExecutionContext,
    execution: () => Promise<any>,
    messageCount: number,
    hasTools: boolean = false,
    options: ToolExecutionOptions = { trackUsage: true, trackCost: true, trackTokens: true }
  ): Promise<any> {
    return AIToolTracker.trackToolExecution(
      "conversation",
      context,
      execution,
      {
        messageCount,
        hasTools,
        model: "gpt-4"
      },
      options
    );
  }
}

// Utility functions for getting context from common parameters
export function getUserContextFromSession(session: any, conversationId?: string): ToolExecutionContext {
  return {
    userId: session.user.id,
    conversationId,
    userTier: session.user.tier || "FREE_TRIAL"
  };
}

export function getUserContextFromMessage(message: any): ToolExecutionContext {
  return {
    userId: message.conversation.userId,
    conversationId: message.conversationId,
    userTier: message.conversation.user?.subscriptions?.[0]?.plan || "FREE_TRIAL"
  };
}

// Decorator for automatic tool tracking
export function trackTool(
  toolName: string,
  options?: ToolExecutionOptions
) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value!;

    descriptor.value = (async function (this: any, ...args: any[]) {
      // Extract context from first argument (assuming it contains context)
      const context = args[0] as ToolExecutionContext;
      const parameters = args.slice(1).reduce((acc, arg, index) => {
        acc[`param${index}`] = arg;
        return acc;
      }, {} as Record<string, unknown>);

      return AIToolTracker.trackToolExecution(
        toolName,
        context,
        () => method.apply(this, args),
        parameters,
        options
      );
    }) as T;

    return descriptor;
  };
}

export { AIToolTracker as default };