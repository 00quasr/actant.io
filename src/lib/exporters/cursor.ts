import type { AgentConfig } from "@/types/config";
import type { ExportFile } from "./index";
import { slugify } from "./utils";

export function exportCursor(config: AgentConfig): ExportFile[] {
  const files: ExportFile[] = [];

  // .cursorrules (legacy)
  const parts: string[] = [];
  if (config.instructions.content) {
    parts.push(config.instructions.content);
  }
  for (const rule of config.rules) {
    if (rule.content) parts.push(rule.content);
  }
  if (parts.length > 0) {
    files.push({ path: ".cursorrules", content: parts.join("\n\n") });
  }

  // .cursor/rules/{slug}.mdc
  for (const rule of config.rules) {
    const slug = slugify(rule.title || "rule");
    const frontmatter = [
      "---",
      `description: ${rule.title || ""}`,
      `globs: ${rule.glob || ""}`,
      `alwaysApply: ${rule.alwaysApply ?? false}`,
      "---",
    ].join("\n");
    files.push({
      path: `.cursor/rules/${slug}.mdc`,
      content: `${frontmatter}\n${rule.content || ""}`,
    });
  }

  // .mcp.json
  const enabledServers = config.mcpServers.filter((s) => s.enabled);
  if (enabledServers.length > 0) {
    const mcpServers: Record<string, Record<string, unknown>> = {};
    for (const server of enabledServers) {
      const entry: Record<string, unknown> = {};
      if (server.type) entry.type = server.type;
      if (server.command) entry.command = server.command;
      if (server.args?.length) entry.args = server.args;
      if (server.url) entry.url = server.url;
      if (server.env && Object.keys(server.env).length > 0) entry.env = server.env;
      mcpServers[server.name] = entry;
    }
    files.push({
      path: ".mcp.json",
      content: JSON.stringify({ mcpServers }, null, 2),
    });
  }

  return files;
}
