import { getStoredAuth, refreshTokens } from "./auth.js";
import type { ConfigListItem, ExportResult, AgentType, PushConfigInput, PushConfigResult, DocsGenerateResult } from "../types.js";

const BASE_URL = process.env.ACTANT_API_URL ?? "https://actant.io";

async function fetchWithAuth(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const auth = getStoredAuth();
  if (!auth) {
    throw new Error("Not authenticated. Run `actant login` first.");
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${auth.access_token}`);
  headers.set("Content-Type", "application/json");

  let response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const refreshed = await refreshTokens();
    if (!refreshed) {
      throw new Error("Session expired. Run `actant login` to re-authenticate.");
    }

    headers.set("Authorization", `Bearer ${refreshed.access_token}`);
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  }

  return response;
}

export async function getConfigs(): Promise<ConfigListItem[]> {
  const response = await fetchWithAuth("/api/configs");

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(body.error ?? `Failed to fetch configs (${response.status})`);
  }

  return (await response.json()) as ConfigListItem[];
}

export async function exportConfig(
  id: string,
  targetAgent: AgentType
): Promise<ExportResult> {
  const response = await fetchWithAuth(`/api/configs/${id}/export-json`, {
    method: "POST",
    body: JSON.stringify({ targetAgent }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(body.error ?? `Failed to export config (${response.status})`);
  }

  return (await response.json()) as ExportResult;
}

export interface DocsGenerateInput {
  repoContext?: Record<string, unknown>;
  projectDescription?: string;
  techStack?: string[];
  existingDocs?: Record<string, string>;
}

export async function generateDocs(input: DocsGenerateInput): Promise<DocsGenerateResult> {
  const response = await fetchWithAuth("/api/docs/generate", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
    throw new Error(body.message || body.error || `Failed to generate docs (${response.status})`);
  }

  return (await response.json()) as DocsGenerateResult;
}

export async function pushConfig(data: PushConfigInput, configId?: string): Promise<PushConfigResult> {
  const apiPath = configId ? `/api/configs/${configId}` : "/api/configs/push";
  const method = configId ? "PUT" : "POST";

  const response = await fetchWithAuth(apiPath, {
    method,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Failed to push config (${response.status})`);
  }

  return (await response.json()) as PushConfigResult;
}
