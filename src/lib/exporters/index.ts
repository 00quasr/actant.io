import type { AgentConfig, AgentType } from "@/types/config";
import { exportClaudeCode } from "./claude-code";
import { exportCursor } from "./cursor";
import { exportWindsurf } from "./windsurf";
import { exportCline } from "./cline";
import { exportOpenCode } from "./opencode";

export interface ExportFile {
  path: string;
  content: string;
}

export interface ExportResult {
  files: ExportFile[];
  warnings: string[];
}

const exporters: Record<AgentType, (config: AgentConfig) => ExportResult> = {
  "claude-code": (config) => ({ files: exportClaudeCode(config), warnings: [] }),
  cursor: (config) => ({ files: exportCursor(config), warnings: [] }),
  windsurf: exportWindsurf,
  cline: (config) => ({ files: exportCline(config), warnings: [] }),
  opencode: (config) => ({ files: exportOpenCode(config), warnings: [] }),
};

export function exportConfig(config: AgentConfig): ExportResult {
  const exporter = exporters[config.targetAgent];
  if (!exporter) {
    return { files: [], warnings: [`Unsupported agent type: ${config.targetAgent}`] };
  }
  try {
    return exporter(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    return { files: [], warnings: [message] };
  }
}
