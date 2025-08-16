import { openai } from "@ai-sdk/openai";
import { experimental_createProviderRegistry as createProviderRegistry } from "ai";

// Create provider registry for model management
export const registry = createProviderRegistry({
  openai,
});

// Model configurations
export const models = {
  primary: openai("gpt-4o"),
  fallback: openai("gpt-4o-mini"),
  thinking: openai("gpt-4o"), // For deep philosophical analysis
};

export const defaultModel = models.primary;

// AI configuration
export const aiConfig = {
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || "4000"),
  temperature: parseFloat(process.env.AI_TEMPERATURE || "0.7"),
  streamingEnabled: process.env.AI_STREAMING_ENABLED === "true",
  models: {
    primary: process.env.OPENAI_MODEL || "gpt-4o",
    fallback: process.env.OPENAI_MODEL_FALLBACK || "gpt-4o-mini",
  },
  rateLimit: {
    requests: parseInt(process.env.AI_RATE_LIMIT_REQUESTS || "100"),
    window: parseInt(process.env.AI_RATE_LIMIT_WINDOW || "60000"),
  },
};