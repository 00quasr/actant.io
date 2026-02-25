"use client";

import { useState } from "react";
import type { AgentConfig, AgentType } from "@/types/config";
import type { ProjectProfile } from "@/lib/analysis/types";

type ImportStatus = "idle" | "analyzing" | "importing" | "done" | "error";

interface ImportInput {
  repoUrl: string;
  targetAgent: AgentType;
  accessToken?: string;
  useDeepAnalysis?: boolean;
}

export function useRepoImport() {
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [result, setResult] = useState<AgentConfig | null>(null);
  const [profile, setProfile] = useState<ProjectProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyzeRepo(input: Omit<ImportInput, "targetAgent" | "useDeepAnalysis">) {
    setStatus("analyzing");
    setError(null);
    setProfile(null);

    try {
      const res = await fetch("/api/analysis/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: input.repoUrl,
          accessToken: input.accessToken,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string; message?: string };
        throw new Error(data.message || data.error || "Analysis failed");
      }

      const data = (await res.json()) as { profile: ProjectProfile };
      setProfile(data.profile);
      setStatus("idle");
      return data.profile;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
      setStatus("error");
      return null;
    }
  }

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

      const data = (await res.json()) as {
        config: AgentConfig;
        profile?: ProjectProfile;
      };
      setResult(data.config);
      if (data.profile) {
        setProfile(data.profile);
      }
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setResult(null);
    setProfile(null);
    setError(null);
  }

  return { status, result, profile, error, importRepo, analyzeRepo, reset };
}
