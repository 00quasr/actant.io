import type { AgentConfig } from "@/types/config";
import type { ExportFile, ExportResult } from "./index";
import { slugify } from "./utils";

export function exportCursor(config: AgentConfig): ExportResult {
  const files: ExportFile[] = [];
  const warnings: string[] = [];

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

  // Commands & Agent Definitions (appended to .cursorrules as documentation)
  const workflowSections: string[] = [];
  if (config.commands?.length > 0) {
    const lines: string[] = ["## Workflow Commands", ""];
    for (const cmd of config.commands) {
      lines.push(`### /${cmd.name}`);
      lines.push("");
      lines.push(cmd.description);
      if (cmd.argumentHint) lines.push(`\nArgument: ${cmd.argumentHint}`);
      lines.push(`\n${cmd.prompt}`);
      lines.push("");
    }
    workflowSections.push(lines.join("\n"));
    warnings.push(
      "Cursor does not natively support custom commands. Commands have been documented in .cursorrules for reference.",
    );
  }
  if (config.agentDefinitions?.length > 0) {
    const lines: string[] = ["## Agent Definitions", ""];
    for (const agent of config.agentDefinitions) {
      lines.push(`### ${agent.name}`);
      lines.push("");
      lines.push(`**Role:** ${agent.role}`);
      lines.push("");
      lines.push(agent.description);
      lines.push(`\n${agent.instructions}`);
      if (agent.tools?.length) {
        lines.push(`\n**Tools:** ${agent.tools.join(", ")}`);
      }
      lines.push("");
    }
    workflowSections.push(lines.join("\n"));
    warnings.push(
      "Cursor does not natively support agent definitions. Agents have been documented in .cursorrules for reference.",
    );
  }
  if (workflowSections.length > 0) {
    const existing = files.find((f) => f.path === ".cursorrules");
    if (existing) {
      existing.content += "\n\n" + workflowSections.join("\n\n");
    } else {
      files.push({
        path: ".cursorrules",
        content: workflowSections.join("\n\n"),
      });
    }
  }

  // Docs
  if (config.docs) {
    for (const [filename, content] of Object.entries(config.docs)) {
      if (content) files.push({ path: filename, content });
    }
  }

  return { files, warnings };
}
