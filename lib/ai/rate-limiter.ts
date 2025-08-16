import { RateLimiterMemory } from "rate-limiter-flexible";
import { aiConfig } from "./provider";

const rateLimiter = new RateLimiterMemory({
  points: aiConfig.rateLimit.requests,
  duration: aiConfig.rateLimit.window / 1000, // Convert to seconds
});

export async function checkRateLimit(userId: string): Promise<void> {
  try {
    await rateLimiter.consume(userId);
  } catch (error) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }
}

export async function getRateLimitInfo(userId: string) {
  try {
    const res = await rateLimiter.get(userId);
    return {
      remaining: res
        ? aiConfig.rateLimit.requests - res.consumedPoints
        : aiConfig.rateLimit.requests,
      reset: res ? new Date(Date.now() + res.msBeforeNext) : new Date(),
    };
  } catch {
    return {
      remaining: aiConfig.rateLimit.requests,
      reset: new Date(),
    };
  }
}