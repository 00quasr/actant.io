import type { AgentConfig } from "@/types/config";
import type { ExportFile } from "./index";
import { slugify } from "./utils";

export function exportCline(config: AgentConfig): ExportFile[] {
  const files: ExportFile[] = [];

  // .clinerules/01-instructions.md
  if (config.instructions.content) {
    files.push({
      path: ".clinerules/01-instructions.md",
      content: config.instructions.content,
    });
  }

  // .clinerules/0N-{slug}.md for each rule
  for (let i = 0; i < config.rules.length; i++) {
    const rule = config.rules[i];
    const num = String(i + 2).padStart(2, "0");
    const slug = slugify(rule.title || "rule");
    files.push({
      path: `.clinerules/${num}-${slug}.md`,
      content: rule.content || "",
    });
  }

  // Docs
  if (config.docs) {
    for (const [filename, content] of Object.entries(config.docs)) {
      if (content) files.push({ path: filename, content });
    }
  }

  return files;
}
