import type { McpServer, Rule } from "@/types/config";

export interface PermissionPreset {
  id: string;
  label: string;
  description: string;
  permissions: Record<string, "allow" | "ask" | "deny">;
}

export interface RulePreset {
  id: string;
  label: string;
  description: string;
  rules: Rule[];
}

export interface McpBundle {
  id: string;
  label: string;
  description: string;
  servers: McpServer[];
}

export const PERMISSION_PRESETS: PermissionPreset[] = [
  {
    id: "standard",
    label: "Standard",
    description: "Read freely, ask before writing",
    permissions: {
      Read: "allow",
      Glob: "allow",
      Grep: "allow",
      Bash: "ask",
      Edit: "ask",
      Write: "ask",
    },
  },
  {
    id: "permissive",
    label: "Permissive",
    description: "Allow all operations",
    permissions: {
      Read: "allow",
      Glob: "allow",
      Grep: "allow",
      Bash: "allow",
      Edit: "allow",
      Write: "allow",
      WebFetch: "allow",
    },
  },
  {
    id: "restrictive",
    label: "Restrictive",
    description: "Ask before every operation",
    permissions: {
      Read: "ask",
      Glob: "ask",
      Grep: "ask",
      Bash: "deny",
      Edit: "ask",
      Write: "ask",
      WebFetch: "deny",
    },
  },
];

export const RULE_PRESETS: RulePreset[] = [
  {
    id: "code-style",
    label: "Code Style",
    description: "TypeScript and formatting conventions",
    rules: [
      {
        title: "TypeScript strict mode",
        content:
          "Use TypeScript strict mode. Never use `any` type. Use proper type annotations for all function parameters and return types.",
        alwaysApply: true,
      },
      {
        title: "Naming conventions",
        content:
          "Use camelCase for variables and functions. Use PascalCase for types, interfaces, and components. Use UPPER_SNAKE_CASE for constants.",
        alwaysApply: true,
      },
    ],
  },
  {
    id: "git-conventions",
    label: "Git Conventions",
    description: "Commit messages and branch naming",
    rules: [
      {
        title: "Commit message format",
        content:
          "Use conventional commits: type(scope): message. Types: feat, fix, refactor, docs, test, chore. Keep subject under 72 chars.",
        alwaysApply: true,
      },
      {
        title: "Branch naming",
        content:
          "Use feature/[name] or fix/[name] branch naming. Keep names short and descriptive with kebab-case.",
        alwaysApply: true,
      },
    ],
  },
  {
    id: "testing",
    label: "Testing",
    description: "Test writing guidelines",
    rules: [
      {
        title: "Test file naming",
        content:
          "Place tests next to source files with .test.ts or .test.tsx extension. Use describe/it blocks.",
        alwaysApply: true,
      },
      {
        title: "Test coverage",
        content:
          "Write tests for all new functions and components. Cover happy path, edge cases, and error cases.",
        alwaysApply: true,
      },
    ],
  },
];

export const MCP_BUNDLES: McpBundle[] = [
  {
    id: "fullstack",
    label: "Full Stack",
    description: "Supabase + filesystem tools",
    servers: [
      {
        name: "supabase",
        type: "stdio",
        command: "npx",
        args: ["-y", "@supabase/mcp-server"],
        enabled: true,
      },
      {
        name: "filesystem",
        type: "stdio",
        command: "npx",
        args: ["-y", "@anthropic/mcp-filesystem"],
        enabled: true,
      },
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    description: "Browser and UI tools",
    servers: [
      {
        name: "puppeteer",
        type: "stdio",
        command: "npx",
        args: ["-y", "@anthropic/mcp-puppeteer"],
        enabled: true,
      },
    ],
  },
  {
    id: "devtools",
    label: "Dev Tools",
    description: "Git and GitHub integration",
    servers: [
      {
        name: "github",
        type: "stdio",
        command: "npx",
        args: ["-y", "@anthropic/mcp-github"],
        env: { GITHUB_TOKEN: "" },
        enabled: true,
      },
    ],
  },
];
