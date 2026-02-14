export type AgentType = "claude-code" | "cursor" | "windsurf" | "cline" | "opencode";

export const AGENT_TYPES: AgentType[] = [
  "claude-code",
  "cursor",
  "windsurf",
  "cline",
  "opencode",
];

export const AGENT_LABELS: Record<AgentType, string> = {
  "claude-code": "Claude Code",
  cursor: "Cursor",
  windsurf: "Windsurf",
  cline: "Cline",
  opencode: "OpenCode",
};

export interface McpServer {
  name: string;
  type: "stdio" | "sse" | "streamable-http";
  command?: string;
  args?: string[];
  url?: string;
  env?: Record<string, string>;
  enabled: boolean;
}

export interface SkillEntry {
  skillId: string;
  enabled: boolean;
  params: Record<string, unknown>;
}

export interface Rule {
  title: string;
  content: string;
  glob?: string;
  alwaysApply?: boolean;
}

export interface AgentConfig {
  name: string;
  description: string;
  targetAgent: AgentType;
  instructions: {
    content: string;
    templateId?: string;
  };
  skills: SkillEntry[];
  mcpServers: McpServer[];
  permissions: Record<string, "allow" | "ask" | "deny">;
  rules: Rule[];
  techStack?: string[];
}

export type UseCase =
  | "frontend"
  | "backend"
  | "fullstack"
  | "mobile"
  | "devops"
  | "data"
  | "general";

export const USE_CASE_LABELS: Record<UseCase, string> = {
  frontend: "Frontend",
  backend: "Backend",
  fullstack: "Full Stack",
  mobile: "Mobile",
  devops: "DevOps",
  data: "Data",
  general: "General",
};

export type SkillCategory =
  | "development"
  | "testing"
  | "devops"
  | "documentation"
  | "code-quality"
  | "design"
  | "productivity"
  | "other";

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  development: "Development",
  testing: "Testing",
  devops: "DevOps",
  documentation: "Documentation",
  "code-quality": "Code Quality",
  design: "Design",
  productivity: "Productivity",
  other: "Other",
};
