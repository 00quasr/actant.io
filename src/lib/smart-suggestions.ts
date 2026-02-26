import type { AgentType, McpServer } from "@/types/config";
import type { ProjectProfile } from "@/lib/analysis/types";

export interface SmartSuggestions {
  mcpServers: McpServer[];
  rulePresetIds: string[];
  commandPresetIds: string[];
  permissionPresetId: string;
}

interface StackMapping {
  mcpSlugs: string[];
  rulePresetIds: string[];
  commandPresetIds?: string[];
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

const COMBO_MAPPINGS: {
  stacks: string[];
  mcpSlugs: string[];
  rulePresetIds: string[];
  commandPresetIds?: string[];
}[] = [
  {
    stacks: ["next.js", "supabase"],
    mcpSlugs: ["supabase", "context7", "vercel"],
    rulePresetIds: ["code-style", "nextjs-conventions", "security"],
    commandPresetIds: ["gsd-workflow", "code-review"],
  },
  {
    stacks: ["next.js", "shadcn"],
    mcpSlugs: ["context7", "shadcn", "vercel"],
    rulePresetIds: ["code-style", "nextjs-conventions"],
    commandPresetIds: ["gsd-workflow"],
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
  const commandPresetIds = new Set<string>();
  let permissionPresetId = "standard";

  // Check combo mappings first (more specific)
  for (const combo of COMBO_MAPPINGS) {
    const allMatch = combo.stacks.every((s) => normalizedStack.includes(s));
    if (allMatch) {
      combo.mcpSlugs.forEach((slug) => mcpSlugs.add(slug));
      combo.rulePresetIds.forEach((id) => rulePresetIds.add(id));
      combo.commandPresetIds?.forEach((id) => commandPresetIds.add(id));
    }
  }

  // Then individual mappings
  for (const tech of normalizedStack) {
    const mapping = STACK_MAPPINGS[tech];
    if (mapping) {
      mapping.mcpSlugs.forEach((slug) => mcpSlugs.add(slug));
      mapping.rulePresetIds.forEach((id) => rulePresetIds.add(id));
      mapping.commandPresetIds?.forEach((id) => commandPresetIds.add(id));
      if (mapping.permissionPresetId === "restrictive") {
        permissionPresetId = "restrictive";
      }
    }
  }

  // Suggest GSD workflow for complex multi-tech stacks (3+ technologies)
  if (normalizedStack.length >= 3 && commandPresetIds.size === 0) {
    commandPresetIds.add("gsd-workflow");
  }

  const mcpServers = Array.from(mcpSlugs)
    .map((slug) => MCP_SERVER_CATALOG[slug])
    .filter((s): s is McpServer => s !== undefined);

  return {
    mcpServers,
    rulePresetIds: Array.from(rulePresetIds),
    commandPresetIds: Array.from(commandPresetIds),
    permissionPresetId,
  };
}

export function getRecommendedMcpSlugs(techStack: string[]): string[] {
  const suggestions = getSuggestions(techStack, "claude-code");
  return suggestions.mcpServers.map((s) => s.name);
}

/**
 * Generate suggestions from a full ProjectProfile with richer detection data.
 * Uses integration detections (databases, auth, monitoring, deployment)
 * plus dependency analysis (ORM, state, UI lib, framework) to produce
 * more targeted recommendations than the simple techStack-based approach.
 */
export function getSuggestionsFromProfile(
  profile: ProjectProfile,
  targetAgent: AgentType,
): SmartSuggestions {
  // Build a synthetic tech stack from profile detections for base suggestions
  const techStack: string[] = [];
  if (profile.dependencies.framework) techStack.push(profile.dependencies.framework.value);
  if (
    profile.dependencies.componentLibrary &&
    profile.dependencies.componentLibrary.value !== "none"
  ) {
    techStack.push(profile.dependencies.componentLibrary.value);
  }
  if (profile.dependencies.orm && profile.dependencies.orm.value !== "none") {
    techStack.push(profile.dependencies.orm.value);
  }

  // Add integration-detected services
  for (const db of profile.integrations.databases) {
    techStack.push(db.name);
  }
  for (const deploy of profile.integrations.deployment) {
    techStack.push(deploy.name);
  }
  for (const mon of profile.integrations.monitoring) {
    techStack.push(mon.name);
  }

  // Start with base suggestions
  const base = getSuggestions(techStack, targetAgent);

  // Enrich with profile-specific MCP servers
  const mcpSlugs = new Set(base.mcpServers.map((s) => s.name));
  const rulePresetIds = new Set(base.rulePresetIds);

  // Database → MCP server mapping
  const dbMcpMap: Record<string, string> = {
    supabase: "supabase",
    neon: "neon",
    postgresql: "filesystem",
    turso: "turso",
  };
  for (const db of profile.integrations.databases) {
    const slug = dbMcpMap[db.name];
    if (slug && !mcpSlugs.has(slug)) mcpSlugs.add(slug);
  }

  // Deployment → MCP server mapping
  const deployMcpMap: Record<string, string> = {
    vercel: "vercel",
    cloudflare: "cloudflare",
  };
  for (const deploy of profile.integrations.deployment) {
    const slug = deployMcpMap[deploy.name];
    if (slug && !mcpSlugs.has(slug)) mcpSlugs.add(slug);
  }

  // Monitoring → MCP server mapping
  if (profile.integrations.monitoring.some((m) => m.name === "sentry")) {
    mcpSlugs.add("sentry");
  }

  // Convention-based rule presets
  if (profile.conventions.testPattern && profile.conventions.testPattern.value !== "none") {
    rulePresetIds.add("testing");
  }
  if (profile.integrations.payments.length > 0) {
    rulePresetIds.add("security");
  }
  if (profile.dependencies.framework?.value === "next.js") {
    rulePresetIds.add("nextjs-conventions");
  }
  if (profile.dependencies.apiStyle) {
    rulePresetIds.add("api-design");
  }

  // Permission strictness from language
  let permissionPresetId = base.permissionPresetId;
  if (
    profile.dependencies.language?.value === "rust" ||
    profile.dependencies.language?.value === "go"
  ) {
    permissionPresetId = "restrictive";
  }

  const mcpServers = Array.from(mcpSlugs)
    .map((slug) => MCP_SERVER_CATALOG[slug])
    .filter((s): s is McpServer => s !== undefined);

  return {
    mcpServers,
    rulePresetIds: Array.from(rulePresetIds),
    commandPresetIds: [],
    permissionPresetId,
  };
}
