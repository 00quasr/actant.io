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

export interface PushConfigInput {
  targetAgent: AgentType;
  name: string;
  description: string;
  files: Array<{ path: string; content: string }>;
}

export interface PushConfigResult {
  id: string;
  url: string;
}

export interface ProjectAnalysis {
  name: string;
  fileTree: string[];
  keyFiles: Array<{ path: string; content: string }>;
  packageScripts: Record<string, string> | null;
  dependencies: Record<string, string> | null;
  devDependencies: Record<string, string> | null;
  framework: string | null;
  language: string | null;
  testFramework: string | null;
  ciPlatform: string | null;
  hasDocker: boolean;
  envVars: string[];
}

export interface DocsGenerateResult {
  docs: Record<string, string>;
}
