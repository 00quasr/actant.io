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
        `.windsurfrules exceeds ${WINDSURF_CHAR_LIMIT} characters (${combined.length}). Windsurf may truncate it.`
      );
    }
  }

  // .windsurf/rules/rules.md (full content)
  if (combined) {
    files.push({ path: ".windsurf/rules/rules.md", content: combined });
  }

  // Docs
  if (config.docs) {
    for (const [filename, content] of Object.entries(config.docs)) {
      if (content) files.push({ path: filename, content });
    }
  }

  return { files, warnings };
}
