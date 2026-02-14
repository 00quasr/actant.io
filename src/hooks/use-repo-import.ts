"use client";

import { useState } from "react";
import type { AgentConfig, AgentType } from "@/types/config";

type ImportStatus = "idle" | "importing" | "done" | "error";

interface ImportInput {
  repoUrl: string;
  targetAgent: AgentType;
  accessToken?: string;
}

export function useRepoImport() {
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [result, setResult] = useState<AgentConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function importRepo(input: ImportInput) {
    setStatus("importing");
    setError(null);

    try {
      const res = await fetch("/api/configs/import-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const data = (await res.json()) as {
          error?: string;
          message?: string;
        };
        throw new Error(data.message || data.error || "Import failed");
      }

      const data = (await res.json()) as { config: AgentConfig };
      setResult(data.config);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setResult(null);
    setError(null);
  }

  return { status, result, error, importRepo, reset };
}
