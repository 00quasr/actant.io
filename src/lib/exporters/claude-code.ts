import type { AgentConfig } from "@/types/config";
import type { ExportFile } from "./index";
import { slugify } from "./utils";

export function exportClaudeCode(config: AgentConfig): ExportFile[] {
  const files: ExportFile[] = [];

  // CLAUDE.md
  const sections: string[] = [];
  if (config.instructions.content) {
    sections.push(config.instructions.content);
  }
  for (const rule of config.rules) {
    const heading = rule.title ? `## ${rule.title}` : "";
    const body = rule.content || "";
    if (heading || body) {
      sections.push([heading, body].filter(Boolean).join("\n\n"));
    }
  }
  files.push({ path: "CLAUDE.md", content: sections.join("\n\n") });

  // .claude/settings.json
  const allow: string[] = [];
  const deny: string[] = [];
  for (const [tool, permission] of Object.entries(config.permissions)) {
    if (permission === "allow") allow.push(tool);
    if (permission === "deny") deny.push(tool);
  }
  if (allow.length > 0 || deny.length > 0) {
    files.push({
      path: ".claude/settings.json",
      content: JSON.stringify({ permissions: { allow, deny } }, null, 2),
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

  // Skills
  const enabledSkills = config.skills.filter((s) => s.enabled);
  for (const skill of enabledSkills) {
    const params = skill.params;
    const content =
      typeof params["content"] === "string" ? params["content"] : "";
    if (content) {
      files.push({
        path: `.claude/skills/${slugify(skill.skillId)}/SKILL.md`,
        content,
      });
    }
  }

  return files;
}
