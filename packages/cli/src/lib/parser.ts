import type { AgentType } from "../types.js";
import type { ScannedFile } from "./scanner.js";

export interface ParsedConfig {
  targetAgent: AgentType;
  name: string;
  description: string;
  instructions: { content: string };
  skills: Array<{ skillId: string; enabled: boolean; params: Record<string, unknown> }>;
  mcpServers: Array<{
    name: string;
    type: "stdio" | "sse" | "streamable-http";
    command?: string;
    args?: string[];
    url?: string;
    env?: Record<string, string>;
    enabled: boolean;
  }>;
  permissions: Record<string, "allow" | "ask" | "deny">;
  rules: Array<{ title: string; content: string; glob?: string; alwaysApply?: boolean }>;
}

function findFile(files: ScannedFile[], name: string): ScannedFile | undefined {
  return files.find((f) => f.path === name || f.path.endsWith(`/${name}`));
}

function findFilesByExt(files: ScannedFile[], ext: string): ScannedFile[] {
  return files.filter((f) => f.path.endsWith(ext));
}

function safeJsonParse(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

interface McpJsonEntry {
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  type?: string;
}

function parseMcpJson(content: string): ParsedConfig["mcpServers"] {
  const parsed = safeJsonParse(content);
  if (!parsed || typeof parsed !== "object") return [];

  const root = parsed as Record<string, unknown>;
  const serversObj = (root.mcpServers ?? root) as Record<string, unknown>;
  const servers: ParsedConfig["mcpServers"] = [];

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
      env: entry.env && typeof entry.env === "object"
        ? Object.fromEntries(
            Object.entries(entry.env).map(([k, v]) => [k, String(v)])
          )
        : undefined,
      enabled: true,
    });
  }

  return servers;
}

interface PermissionEntry {
  permissions?: Record<string, unknown>;
}

function parseClaudePermissions(content: string): ParsedConfig["permissions"] {
  const parsed = safeJsonParse(content) as PermissionEntry | null;
  if (!parsed || typeof parsed !== "object") return {};

  const permsSection = parsed.permissions;
  if (!permsSection || typeof permsSection !== "object") return {};

  const result: ParsedConfig["permissions"] = {};
  for (const [key, value] of Object.entries(permsSection)) {
    if (value === "allow" || value === "ask" || value === "deny") {
      result[key] = value;
    } else if (Array.isArray(value)) {
      // Claude Code uses { "allow": [...], "deny": [...] } format
      for (const item of value) {
        if (typeof item === "string") {
          result[item] = key as "allow" | "ask" | "deny";
        }
      }
    }
  }

  return result;
}

function parseCursorMdcFrontmatter(content: string): { title: string; content: string; glob?: string; alwaysApply?: boolean } {
  const lines = content.split("\n");
  let title = "";
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
      if (line.startsWith("description:")) {
        title = line.slice("description:".length).trim();
      } else if (line.startsWith("globs:")) {
        glob = line.slice("globs:".length).trim();
      } else if (line.startsWith("alwaysApply:")) {
        alwaysApply = line.slice("alwaysApply:".length).trim() === "true";
      }
    }
  }

  const body = lines.slice(bodyStart).join("\n").trim();
  return { title: title || "Untitled Rule", content: body, glob, alwaysApply };
}

function parseClaudeCode(files: ScannedFile[], name: string): ParsedConfig {
  const config: ParsedConfig = {
    targetAgent: "claude-code",
    name,
    description: "",
    instructions: { content: "" },
    skills: [],
    mcpServers: [],
    permissions: {},
    rules: [],
  };

  const claudeMd = findFile(files, "CLAUDE.md");
  if (claudeMd) {
    config.instructions.content = claudeMd.content;
  }

  const settingsFile = findFile(files, "settings.json");
  if (settingsFile) {
    config.permissions = parseClaudePermissions(settingsFile.content);
  }

  const mcpFile = findFile(files, ".mcp.json");
  if (mcpFile) {
    config.mcpServers = parseMcpJson(mcpFile.content);
  }

  const skillFiles = files.filter((f) => f.path.includes(".claude/skills/") && f.path.endsWith("SKILL.md"));
  for (const skill of skillFiles) {
    const parts = skill.path.split("/");
    const skillDirIdx = parts.indexOf("skills");
    const skillName = skillDirIdx >= 0 && skillDirIdx + 1 < parts.length
      ? parts[skillDirIdx + 1] ?? "unknown"
      : "unknown";

    config.skills.push({
      skillId: skillName,
      enabled: true,
      params: { content: skill.content },
    });
  }

  return config;
}

function parseCursor(files: ScannedFile[], name: string): ParsedConfig {
  const config: ParsedConfig = {
    targetAgent: "cursor",
    name,
    description: "",
    instructions: { content: "" },
    skills: [],
    mcpServers: [],
    permissions: {},
    rules: [],
  };

  const cursorrules = findFile(files, ".cursorrules");
  if (cursorrules) {
    config.instructions.content = cursorrules.content;
  }

  const mdcFiles = findFilesByExt(files, ".mdc");
  for (const mdc of mdcFiles) {
    config.rules.push(parseCursorMdcFrontmatter(mdc.content));
  }

  const mcpFile = findFile(files, ".mcp.json");
  if (mcpFile) {
    config.mcpServers = parseMcpJson(mcpFile.content);
  }

  return config;
}

function parseWindsurf(files: ScannedFile[], name: string): ParsedConfig {
  const config: ParsedConfig = {
    targetAgent: "windsurf",
    name,
    description: "",
    instructions: { content: "" },
    skills: [],
    mcpServers: [],
    permissions: {},
    rules: [],
  };

  const windsurfrules = findFile(files, ".windsurfrules");
  if (windsurfrules) {
    config.instructions.content = windsurfrules.content;
  }

  const rulesFile = findFile(files, "rules.md");
  if (rulesFile) {
    config.rules.push({
      title: "Windsurf Rules",
      content: rulesFile.content,
    });
  }

  return config;
}

function parseCline(files: ScannedFile[], name: string): ParsedConfig {
  const config: ParsedConfig = {
    targetAgent: "cline",
    name,
    description: "",
    instructions: { content: "" },
    skills: [],
    mcpServers: [],
    permissions: {},
    rules: [],
  };

  const mdFiles = findFilesByExt(files, ".md");
  if (mdFiles.length > 0) {
    const first = mdFiles[0];
    if (first) {
      config.instructions.content = first.content;
    }

    for (let i = 1; i < mdFiles.length; i++) {
      const file = mdFiles[i];
      if (file) {
        const fileName = file.path.split("/").pop() ?? "rule";
        config.rules.push({
          title: fileName.replace(/\.md$/, ""),
          content: file.content,
        });
      }
    }
  }

  return config;
}

interface OpenCodeJson {
  name?: string;
  description?: string;
  instructions?: string | { content?: string };
  mcpServers?: Record<string, McpJsonEntry>;
  permissions?: Record<string, string>;
  rules?: Array<{ title?: string; content?: string }>;
}

function parseOpenCode(files: ScannedFile[], name: string): ParsedConfig {
  const config: ParsedConfig = {
    targetAgent: "opencode",
    name,
    description: "",
    instructions: { content: "" },
    skills: [],
    mcpServers: [],
    permissions: {},
    rules: [],
  };

  const file = findFile(files, "opencode.json");
  if (!file) return config;

  const parsed = safeJsonParse(file.content) as OpenCodeJson | null;
  if (!parsed || typeof parsed !== "object") return config;

  if (parsed.name) config.name = parsed.name;
  if (parsed.description) config.description = parsed.description;

  if (typeof parsed.instructions === "string") {
    config.instructions.content = parsed.instructions;
  } else if (parsed.instructions && typeof parsed.instructions.content === "string") {
    config.instructions.content = parsed.instructions.content;
  }

  if (parsed.mcpServers && typeof parsed.mcpServers === "object") {
    config.mcpServers = parseMcpJson(JSON.stringify({ mcpServers: parsed.mcpServers }));
  }

  if (parsed.permissions && typeof parsed.permissions === "object") {
    for (const [key, value] of Object.entries(parsed.permissions)) {
      if (value === "allow" || value === "ask" || value === "deny") {
        config.permissions[key] = value;
      }
    }
  }

  if (Array.isArray(parsed.rules)) {
    for (const rule of parsed.rules) {
      if (rule && typeof rule === "object" && typeof rule.content === "string") {
        config.rules.push({
          title: rule.title ?? "Rule",
          content: rule.content,
        });
      }
    }
  }

  return config;
}

const PARSERS: Record<AgentType, (files: ScannedFile[], name: string) => ParsedConfig> = {
  "claude-code": parseClaudeCode,
  cursor: parseCursor,
  windsurf: parseWindsurf,
  cline: parseCline,
  opencode: parseOpenCode,
};

export function parseFiles(agentType: AgentType, files: ScannedFile[], name: string): ParsedConfig {
  const parser = PARSERS[agentType];
  return parser(files, name);
}
