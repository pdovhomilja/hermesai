import logger from "@/lib/logger";

export class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "AIError";
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (error instanceof AIError && !error.retryable) {
        throw error;
      }

      // Rate limit error - wait longer
      if ((error as any)?.status === 429) {
        const retryAfter = (error as any)?.headers?.["retry-after"];
        const waitTime = retryAfter
          ? parseInt(retryAfter) * 1000
          : delay * Math.pow(2, i);

        logger.warn(`Rate limited, retrying after ${waitTime}ms`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      // Other errors - exponential backoff
      if (i < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, i);
        logger.warn({
          attempt: i + 1,
          error: (error as Error)?.message,
        }, `AI request failed, retrying in ${waitTime}ms`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new AIError("Max retries exceeded", "MAX_RETRIES", false);
}