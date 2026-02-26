import type { AgentConfig } from "@/types/config";
import type { ExportFile, ExportResult } from "./index";
import { slugify } from "./utils";

export function exportCline(config: AgentConfig): ExportResult {
  const files: ExportFile[] = [];
  const warnings: string[] = [];

  // .clinerules/01-instructions.md
  if (config.instructions.content) {
    files.push({
      path: ".clinerules/01-instructions.md",
      content: config.instructions.content,
    });
  }

  // .clinerules/0N-{slug}.md for each rule
  let nextNum = 2;
  for (let i = 0; i < config.rules.length; i++) {
    const rule = config.rules[i];
    const num = String(nextNum++).padStart(2, "0");
    const slug = slugify(rule.title || "rule");
    files.push({
      path: `.clinerules/${num}-${slug}.md`,
      content: rule.content || "",
    });
  }

  // Commands & Agent Definitions (as additional numbered rule files)
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
    const num = String(nextNum++).padStart(2, "0");
    files.push({
      path: `.clinerules/${num}-workflow-commands.md`,
      content: lines.join("\n"),
    });
    warnings.push(
      "Cline does not natively support custom commands. Commands have been documented in .clinerules for reference.",
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
    const num = String(nextNum++).padStart(2, "0");
    files.push({
      path: `.clinerules/${num}-agent-definitions.md`,
      content: lines.join("\n"),
    });
    warnings.push(
      "Cline does not natively support agent definitions. Agents have been documented in .clinerules for reference.",
    );
  }

  // Docs
  if (config.docs) {
    for (const [filename, content] of Object.entries(config.docs)) {
      if (content) files.push({ path: filename, content });
    }
  }

  return { files, warnings };
}
