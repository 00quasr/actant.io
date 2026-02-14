import { createOpenAI } from "@ai-sdk/openai";

export function getModel() {
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  return openai("gpt-4o");
}
