import { createAnthropic } from "@ai-sdk/anthropic";

export function getModel() {
  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  return anthropic("claude-sonnet-4-5-20250929");
}
