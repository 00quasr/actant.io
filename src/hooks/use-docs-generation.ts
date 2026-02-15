"use client";

import { useState } from "react";

type DocsGenStatus = "idle" | "generating" | "done" | "error";

interface DocsGenInput {
  configName?: string;
  configDescription?: string;
  techStack?: string[];
  existingDocs?: Record<string, string>;
}

export function useDocsGeneration() {
  const [status, setStatus] = useState<DocsGenStatus>("idle");
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generateDocs(input: DocsGenInput) {
    setStatus("generating");
    setError(null);

    try {
      const res = await fetch("/api/docs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectDescription: input.configDescription || input.configName || "Unnamed project",
          techStack: input.techStack,
          existingDocs: input.existingDocs,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string; message?: string };
        throw new Error(data.message || data.error || "Generation failed");
      }

      const data = (await res.json()) as { docs: Record<string, string> };
      setResult(data.docs);
      setStatus("done");
      return data.docs;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setStatus("error");
      return null;
    }
  }

  function reset() {
    setStatus("idle");
    setResult(null);
    setError(null);
  }

  return { status, result, error, generateDocs, reset };
}
