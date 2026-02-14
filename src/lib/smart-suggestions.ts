import type { AgentType, McpServer } from "@/types/config";

export interface SmartSuggestions {
  mcpServers: McpServer[];
  rulePresetIds: string[];
  permissionPresetId: string;
}

interface StackMapping {
  mcpSlugs: string[];
  rulePresetIds: string[];
  permissionPresetId: string;
}

const STACK_MAPPINGS: Record<string, StackMapping> = {
  "next.js": {
    mcpSlugs: ["context7", "vercel"],
    rulePresetIds: ["code-style", "nextjs-conventions"],
    permissionPresetId: "standard",
  },
  react: {
    mcpSlugs: ["context7"],
    rulePresetIds: ["code-style", "react-patterns"],
    permissionPresetId: "standard",
  },
  vue: {
    mcpSlugs: ["context7"],
    rulePresetIds: ["code-style"],
    permissionPresetId: "standard",
  },
  supabase: {
    mcpSlugs: ["supabase"],
    rulePresetIds: [],
    permissionPresetId: "standard",
  },
  python: {
    mcpSlugs: ["filesystem"],
    rulePresetIds: ["code-style", "testing"],
    permissionPresetId: "standard",
  },
  "node.js": {
    mcpSlugs: ["filesystem"],
    rulePresetIds: ["code-style", "testing"],
    permissionPresetId: "standard",
  },
  rust: {
    mcpSlugs: ["filesystem"],
    rulePresetIds: ["code-style", "testing"],
    permissionPresetId: "restrictive",
  },
  go: {
    mcpSlugs: ["filesystem"],
    rulePresetIds: ["code-style", "testing"],
    permissionPresetId: "standard",
  },
  tailwindcss: {
    mcpSlugs: ["context7"],
    rulePresetIds: [],
    permissionPresetId: "standard",
  },
  shadcn: {
    mcpSlugs: ["shadcn"],
    rulePresetIds: [],
    permissionPresetId: "standard",
  },
  prisma: {
    mcpSlugs: ["prisma"],
    rulePresetIds: [],
    permissionPresetId: "standard",
  },
  stripe: {
    mcpSlugs: [],
    rulePresetIds: ["security"],
    permissionPresetId: "standard",
  },
  vercel: {
    mcpSlugs: ["vercel"],
    rulePresetIds: [],
    permissionPresetId: "standard",
  },
};

const COMBO_MAPPINGS: { stacks: string[]; mcpSlugs: string[]; rulePresetIds: string[] }[] = [
  {
    stacks: ["next.js", "supabase"],
    mcpSlugs: ["supabase", "context7", "vercel"],
    rulePresetIds: ["code-style", "nextjs-conventions", "security"],
  },
  {
    stacks: ["next.js", "shadcn"],
    mcpSlugs: ["context7", "shadcn", "vercel"],
    rulePresetIds: ["code-style", "nextjs-conventions"],
  },
];

const MCP_SERVER_CATALOG: Record<string, McpServer> = {
  supabase: {
    name: "supabase",
    type: "stdio",
    command: "npx",
    args: ["-y", "@supabase/mcp-server-supabase"],
    env: { SUPABASE_ACCESS_TOKEN: "" },
    enabled: true,
  },
  context7: {
    name: "context7",
    type: "stdio",
    command: "npx",
    args: ["-y", "@upstash/context7-mcp@latest"],
    enabled: true,
  },
  vercel: {
    name: "vercel",
    type: "stdio",
    command: "npx",
    args: ["-y", "vercel-mcp-server"],
    enabled: true,
  },
  shadcn: {
    name: "shadcn",
    type: "stdio",
    command: "npx",
    args: ["-y", "@anthropic-ai/shadcn-mcp-server"],
    enabled: true,
  },
  filesystem: {
    name: "filesystem",
    type: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "."],
    enabled: true,
  },
  github: {
    name: "github",
    type: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    env: { GITHUB_PERSONAL_ACCESS_TOKEN: "" },
    enabled: true,
  },
  prisma: {
    name: "prisma",
    type: "stdio",
    command: "npx",
    args: ["-y", "prisma-mcp-server"],
    enabled: true,
  },
  puppeteer: {
    name: "puppeteer",
    type: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-puppeteer"],
    enabled: true,
  },
  sentry: {
    name: "sentry",
    type: "stdio",
    command: "npx",
    args: ["-y", "@sentry/mcp-server"],
    env: { SENTRY_AUTH_TOKEN: "" },
    enabled: true,
  },
};

export function getSuggestions(techStack: string[], targetAgent: AgentType): SmartSuggestions {
  void targetAgent; // Reserved for future agent-specific filtering
  const normalizedStack = techStack.map((s) => s.toLowerCase());

  const mcpSlugs = new Set<string>();
  const rulePresetIds = new Set<string>();
  let permissionPresetId = "standard";

  // Check combo mappings first (more specific)
  for (const combo of COMBO_MAPPINGS) {
    const allMatch = combo.stacks.every((s) => normalizedStack.includes(s));
    if (allMatch) {
      combo.mcpSlugs.forEach((slug) => mcpSlugs.add(slug));
      combo.rulePresetIds.forEach((id) => rulePresetIds.add(id));
    }
  }

  // Then individual mappings
  for (const tech of normalizedStack) {
    const mapping = STACK_MAPPINGS[tech];
    if (mapping) {
      mapping.mcpSlugs.forEach((slug) => mcpSlugs.add(slug));
      mapping.rulePresetIds.forEach((id) => rulePresetIds.add(id));
      if (mapping.permissionPresetId === "restrictive") {
        permissionPresetId = "restrictive";
      }
    }
  }

  const mcpServers = Array.from(mcpSlugs)
    .map((slug) => MCP_SERVER_CATALOG[slug])
    .filter((s): s is McpServer => s !== undefined);

  return {
    mcpServers,
    rulePresetIds: Array.from(rulePresetIds),
    permissionPresetId,
  };
}

export function getRecommendedMcpSlugs(techStack: string[]): string[] {
  const suggestions = getSuggestions(techStack, "claude-code");
  return suggestions.mcpServers.map((s) => s.name);
}
