"use client";

import { useState } from "react";
import type { AgentConfig } from "@/types/config";
import type { GenerationInput } from "@/validations/generation";
import type { ClarifyingQuestion } from "@/lib/ai/questions-schema";
import type { QuestionAnswer } from "@/lib/ai/prompts";

type GenerationStatus =
  | "idle"
  | "asking"
  | "answering"
  | "generating"
  | "done"
  | "error";

export function useConfigGeneration() {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [result, setResult] = useState<AgentConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>([]);

  async function generateQuestions(
    projectDescription: string,
    techStack: string[]
  ) {
    setStatus("asking");
    setError(null);

    try {
      const res = await fetch("/api/configs/generate/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectDescription, techStack }),
      });

      if (!res.ok) {
        const data = (await res.json()) as {
          error?: string;
          message?: string;
        };
        throw new Error(data.message || data.error || "Failed to generate questions");
      }

      const data = (await res.json()) as { questions: ClarifyingQuestion[] };
      setQuestions(data.questions);
      setStatus("answering");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate questions");
      setStatus("error");
    }
  }

  async function generate(input: GenerationInput & { answers?: QuestionAnswer[] }) {
    setStatus("generating");
    setError(null);

    try {
      const res = await fetch("/api/configs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const data = (await res.json()) as {
          error?: string;
          message?: string;
        };
        throw new Error(data.message || data.error || "Generation failed");
      }

      const data = (await res.json()) as { config: AgentConfig };
      setResult(data.config);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setResult(null);
    setError(null);
    setQuestions([]);
  }

  return {
    status,
    result,
    error,
    questions,
    generate,
    generateQuestions,
    reset,
  };
}
