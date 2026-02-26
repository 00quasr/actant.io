import type { AgentConfig } from "@/types/config";
import type { ExportFile, ExportResult } from "./index";

const WINDSURF_CHAR_LIMIT = 6000;

export function exportWindsurf(config: AgentConfig): ExportResult {
  const files: ExportFile[] = [];
  const warnings: string[] = [];

  const parts: string[] = [];
  if (config.instructions.content) {
    parts.push(config.instructions.content);
  }
  for (const rule of config.rules) {
    if (rule.content) parts.push(rule.content);
  }
  const combined = parts.join("\n\n");

  // .windsurfrules
  if (combined) {
    files.push({ path: ".windsurfrules", content: combined });
    if (combined.length > WINDSURF_CHAR_LIMIT) {
      warnings.push(
        `.windsurfrules exceeds ${WINDSURF_CHAR_LIMIT} characters (${combined.length}). Windsurf may truncate it.`,
      );
    }
  }

  // .windsurf/rules/rules.md (full content, with workflow documentation appended)
  let rulesContent = combined;

  // Commands & Agent Definitions (appended as documentation)
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
      "Windsurf does not natively support custom commands. Commands have been documented in rules for reference.",
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
      "Windsurf does not natively support agent definitions. Agents have been documented in rules for reference.",
    );
  }
  if (workflowSections.length > 0) {
    const appendedContent = workflowSections.join("\n\n");
    rulesContent = rulesContent ? rulesContent + "\n\n" + appendedContent : appendedContent;
  }

  if (rulesContent) {
    files.push({ path: ".windsurf/rules/rules.md", content: rulesContent });
  }

  // Docs
  if (config.docs) {
    for (const [filename, content] of Object.entries(config.docs)) {
      if (content) files.push({ path: filename, content });
    }
  }

  return { files, warnings };
}
