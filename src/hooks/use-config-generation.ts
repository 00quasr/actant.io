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
  const [autoAnswering, setAutoAnswering] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  async function generateQuestions(
    projectDescription: string,
    techStack: string[],
    documentType?: string
  ) {
    setStatus("asking");
    setError(null);

    try {
      const res = await fetch("/api/configs/generate/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectDescription, techStack, documentType }),
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

  async function autoAnswer(
    projectDescription: string,
    techStack: string[],
    currentQuestions: ClarifyingQuestion[]
  ): Promise<Record<string, string> | null> {
    setAutoAnswering(true);
    try {
      const res = await fetch("/api/configs/generate/auto-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectDescription,
          techStack,
          questions: currentQuestions.map((q) => ({
            id: q.id,
            question: q.question,
            type: q.type,
            options: q.options,
          })),
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as {
          error?: string;
          message?: string;
        };
        throw new Error(data.message || data.error || "Auto-answer failed");
      }

      const data = (await res.json()) as { answers: Record<string, string> };
      return data.answers;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Auto-answer failed");
      return null;
    } finally {
      setAutoAnswering(false);
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
        if (res.status === 403 && data.error?.toLowerCase().includes("limit")) {
          setLimitReached(true);
          setError(data.message || "Generation limit reached");
          setStatus("error");
          return;
        }
        throw new Error(data.message || data.error || "Generation failed");
      }

      const data = (await res.json()) as { config: AgentConfig & { documentType?: string; content?: Record<string, unknown>; docs?: Record<string, string>; recommendedSkillIds?: string[] } };
      // Normalize nulls to undefined for compatibility with AgentConfig types
      const config: AgentConfig = {
        ...data.config,
        mcpServers: (data.config.mcpServers ?? []).map((s) => ({
          ...s,
          command: s.command ?? undefined,
          args: s.args ?? undefined,
          url: s.url ?? undefined,
          env: s.env ?? undefined,
        })),
        rules: (data.config.rules ?? []).map((r) => ({
          ...r,
          glob: r.glob ?? undefined,
          alwaysApply: r.alwaysApply ?? undefined,
        })),
        docs: data.config.docs ?? {},
      };
      setResult(config);
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
    setLimitReached(false);
  }

  return {
    status,
    result,
    error,
    questions,
    autoAnswering,
    limitReached,
    generate,
    generateQuestions,
    autoAnswer,
    reset,
  };
}
