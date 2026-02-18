import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/constants";

interface PushFile {
  path: string;
  content: string;
}

interface PushBody {
  targetAgent: string;
  name: string;
  description: string;
  files: PushFile[];
}

const VALID_AGENTS = new Set(["claude-code", "cursor", "windsurf", "cline", "opencode"]);

interface McpJsonEntry {
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  type?: string;
}

function findFile(files: PushFile[], name: string): PushFile | undefined {
  return files.find((f) => f.path === name || f.path.endsWith(`/${name}`));
}

function safeJsonParse(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function extractMcpServers(files: PushFile[]): Array<{
  name: string;
  type: "stdio" | "sse" | "streamable-http";
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  enabled: boolean;
}> {
  const mcpFile = findFile(files, ".mcp.json");
  if (!mcpFile) return [];

  const parsed = safeJsonParse(mcpFile.content);
  if (!parsed || typeof parsed !== "object") return [];

  const root = parsed as Record<string, unknown>;
  const serversObj = (root.mcpServers ?? root) as Record<string, unknown>;
  const servers: Array<{
    name: string;
    type: "stdio" | "sse" | "streamable-http";
    command?: string;
    args?: string[];
    url?: string;
    env?: Record<string, string>;
    enabled: boolean;
  }> = [];

  for (const [name, value] of Object.entries(serversObj)) {
    if (!value || typeof value !== "object") continue;
    const entry = value as McpJsonEntry;

    let type: "stdio" | "sse" | "streamable-http" = "stdio";
    if (entry.url) {
      type = entry.type === "streamable-http" ? "streamable-http" : "sse";
    }

    servers.push({
      name,
      type,
      command: entry.command,
      args: Array.isArray(entry.args) ? entry.args.map(String) : undefined,
      url: typeof entry.url === "string" ? entry.url : undefined,
      env:
        entry.env && typeof entry.env === "object"
          ? Object.fromEntries(Object.entries(entry.env).map(([k, v]) => [k, String(v)]))
          : undefined,
      enabled: true,
    });
  }

  return servers;
}

interface PermissionEntry {
  permissions?: Record<string, unknown>;
}

function extractPermissions(
  files: PushFile[],
  targetAgent: string,
): Record<string, "allow" | "ask" | "deny"> {
  if (targetAgent === "claude-code") {
    const settings = findFile(files, "settings.json");
    if (!settings) return {};

    const parsed = safeJsonParse(settings.content) as PermissionEntry | null;
    if (!parsed?.permissions) return {};

    const result: Record<string, "allow" | "ask" | "deny"> = {};
    for (const [key, value] of Object.entries(parsed.permissions)) {
      if (value === "allow" || value === "ask" || value === "deny") {
        result[key] = value;
      } else if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === "string") {
            result[item] = key as "allow" | "ask" | "deny";
          }
        }
      }
    }
    return result;
  }

  return {};
}

function extractInstructions(files: PushFile[], targetAgent: string): string {
  const mainFiles: Record<string, string[]> = {
    "claude-code": ["CLAUDE.md"],
    cursor: [".cursorrules"],
    windsurf: [".windsurfrules"],
    cline: [],
    opencode: [],
  };

  const candidates = mainFiles[targetAgent] ?? [];
  for (const name of candidates) {
    const file = findFile(files, name);
    if (file) return file.content;
  }

  if (targetAgent === "cline") {
    const mdFiles = files.filter((f) => f.path.endsWith(".md"));
    if (mdFiles[0]) return mdFiles[0].content;
  }

  if (targetAgent === "opencode") {
    const file = findFile(files, "opencode.json");
    if (file) {
      interface OcJson {
        instructions?: string | { content?: string };
      }
      const parsed = safeJsonParse(file.content) as OcJson | null;
      if (parsed) {
        if (typeof parsed.instructions === "string") return parsed.instructions;
        if (parsed.instructions?.content) return parsed.instructions.content;
      }
    }
  }

  return "";
}

function extractRules(
  files: PushFile[],
  targetAgent: string,
): Array<{ title: string; content: string; glob?: string; alwaysApply?: boolean }> {
  const rules: Array<{ title: string; content: string; glob?: string; alwaysApply?: boolean }> = [];

  if (targetAgent === "cursor") {
    const mdcFiles = files.filter((f) => f.path.endsWith(".mdc"));
    for (const file of mdcFiles) {
      const lines = file.content.split("\n");
      let title = "Untitled Rule";
      let glob: string | undefined;
      let alwaysApply: boolean | undefined;
      let bodyStart = 0;

      if (lines[0]?.trim() === "---") {
        for (let i = 1; i < lines.length; i++) {
          if (lines[i]?.trim() === "---") {
            bodyStart = i + 1;
            break;
          }
          const line = lines[i]?.trim() ?? "";
          if (line.startsWith("description:")) title = line.slice("description:".length).trim();
          if (line.startsWith("globs:")) glob = line.slice("globs:".length).trim();
          if (line.startsWith("alwaysApply:"))
            alwaysApply = line.slice("alwaysApply:".length).trim() === "true";
        }
      }

      rules.push({ title, content: lines.slice(bodyStart).join("\n").trim(), glob, alwaysApply });
    }
  }

  if (targetAgent === "windsurf") {
    const rulesFile = findFile(files, "rules.md");
    if (rulesFile) {
      rules.push({ title: "Windsurf Rules", content: rulesFile.content });
    }
  }

  if (targetAgent === "cline") {
    const mdFiles = files.filter((f) => f.path.endsWith(".md"));
    for (let i = 1; i < mdFiles.length; i++) {
      const file = mdFiles[i];
      if (file) {
        const name = file.path.split("/").pop() ?? "rule";
        rules.push({ title: name.replace(/\.md$/, ""), content: file.content });
      }
    }
  }

  return rules;
}

function extractSkills(
  files: PushFile[],
): Array<{ skillId: string; enabled: boolean; params: Record<string, unknown> }> {
  return files
    .filter((f) => f.path.includes(".claude/skills/") && f.path.endsWith("SKILL.md"))
    .map((f) => {
      const parts = f.path.split("/");
      const idx = parts.indexOf("skills");
      const name = idx >= 0 && idx + 1 < parts.length ? (parts[idx + 1] ?? "unknown") : "unknown";
      return { skillId: name, enabled: true, params: { content: f.content } };
    });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { targetAgent, name, description, files } = body as PushBody;

  if (!targetAgent || !VALID_AGENTS.has(targetAgent)) {
    return NextResponse.json({ error: "Invalid or missing targetAgent" }, { status: 400 });
  }

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const instructions = extractInstructions(files, targetAgent);
  const mcpServers = extractMcpServers(files);
  const permissions = extractPermissions(files, targetAgent);
  const rules = extractRules(files, targetAgent);
  const skills = extractSkills(files);

  const { data, error } = await supabase
    .from("configs")
    .insert({
      owner_id: user.id,
      name,
      description: description || null,
      target_agent: targetAgent,
      instructions: { content: instructions },
      skills,
      mcp_servers: mcpServers,
      permissions,
      rules,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      id: data.id,
      url: `${SITE_URL}/builder?id=${data.id}`,
    },
    { status: 201 },
  );
}
