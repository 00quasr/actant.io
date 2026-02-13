export interface ExportFile {
  path: string;
  content: string;
}

export interface ExportResult {
  files: ExportFile[];
  warnings: string[];
}

export type AgentType =
  | "claude-code"
  | "cursor"
  | "windsurf"
  | "cline"
  | "opencode";

export interface ConfigListItem {
  id: string;
  name: string;
  description: string | null;
  target_agent: AgentType;
  updated_at: string;
  created_at: string;
}

export interface StoredAuth {
  access_token: string;
  refresh_token: string;
}
