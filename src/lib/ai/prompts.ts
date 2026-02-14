const AGENT_FILE_KNOWLEDGE: Record<string, string> = {
  "claude-code": `Claude Code uses these configuration files:
- CLAUDE.md: Main instructions file in project root (markdown). This is the primary config file.
- .claude/settings.json: Permissions and tool settings (JSON).
- .mcp.json: MCP server definitions (JSON).
- .claude/skills/*/SKILL.md: Individual skill files (markdown).
Rules in Claude Code are embedded in CLAUDE.md as sections or as separate CLAUDE.md files in subdirectories.`,

  cursor: `Cursor uses these configuration files:
- .cursorrules: Main instructions file in project root (plain text/markdown).
- .cursor/rules/*.mdc: Rule files with optional frontmatter (glob, alwaysApply fields).
- .mcp.json: MCP server definitions (JSON).
Rules use .mdc format with YAML frontmatter for metadata.`,

  windsurf: `Windsurf uses these configuration files:
- .windsurfrules: Main instructions file in project root (plain text/markdown).
- .windsurf/rules/rules.md: Additional rules file (markdown).
Windsurf does not natively support MCP servers or granular permissions.`,

  cline: `Cline uses these configuration files:
- .clinerules/*.md: Numbered rule files (e.g., 01-general.md, 02-testing.md).
Rules are organized as numbered markdown files for ordering. Cline supports MCP via its own settings.`,

  opencode: `OpenCode uses a single configuration file:
- opencode.json: All configuration in a single JSON file including instructions, MCP servers, and settings.`,
};

const CONFIG_SCHEMA_DESCRIPTION = `You generate AgentConfig JSON objects with this exact shape:
{
  "name": string - A short, descriptive name for this configuration (2-5 words).
  "description": string - A one-sentence description of what this configuration does.
  "instructions": { "content": string } - The main instructions content as comprehensive markdown. This is the most important field. Write detailed, opinionated instructions that cover project conventions, code style, testing approach, architecture decisions, and workflow guidelines. Use markdown headings, lists, and code blocks. Aim for 500-2000 words.
  "skills": [] - Leave as empty array (skills are added separately by the user).
  "mcpServers": [ { "name": string, "type": "stdio"|"sse"|"streamable-http", "command"?: string, "args"?: string[], "url"?: string, "env"?: Record<string, string>, "enabled": boolean } ] - Useful MCP servers for the tech stack. Only include well-known, widely-used MCP servers. Use "stdio" type with npx commands for npm-based servers.
  "permissions": Record<string, "allow"|"ask"|"deny"> - Tool permissions. Common keys: "bash", "file_edit", "file_read", "web_search", "mcp". Use "allow" for safe operations, "ask" for destructive ones, "deny" for dangerous ones.
  "rules": [ { "title": string, "content": string, "glob"?: string, "alwaysApply"?: boolean } ] - Specific, actionable rules. Each rule should have a clear title and detailed content. Use "glob" to scope rules to specific file patterns (e.g., "*.test.ts" for testing rules). Set "alwaysApply" to true for universal rules.
}`;

const QUALITY_GUIDELINES = `Quality guidelines for generated configs:
- Be specific and opinionated. Generic advice like "write clean code" is not useful.
- Include real commands, real file paths, real tool names.
- Reference specific versions and libraries from the tech stack.
- Instructions should read like a senior developer's project handbook.
- Rules should be actionable: each rule should change how the agent behaves.
- For MCP servers, only include servers that genuinely help the described project.
- Permissions should follow the principle of least privilege.
- Use concrete examples in instructions (e.g., "Use vitest, not jest" instead of "Use a testing framework").
- Structure instructions with clear markdown sections: ## Project Overview, ## Code Style, ## Architecture, ## Testing, ## Git Conventions, etc.`;

export const KNOWN_MCP_SERVERS: Record<string, { name: string; command: string; args: string[]; env?: Record<string, string>; description: string }> = {
  supabase: { name: "supabase", command: "npx", args: ["-y", "@supabase/mcp-server-supabase"], env: { SUPABASE_ACCESS_TOKEN: "" }, description: "Supabase database and auth management" },
  context7: { name: "context7", command: "npx", args: ["-y", "@upstash/context7-mcp@latest"], description: "Up-to-date library documentation" },
  github: { name: "github", command: "npx", args: ["-y", "@modelcontextprotocol/server-github"], env: { GITHUB_PERSONAL_ACCESS_TOKEN: "" }, description: "GitHub repo, issues, PRs" },
  filesystem: { name: "filesystem", command: "npx", args: ["-y", "@modelcontextprotocol/server-filesystem", "."], description: "Local filesystem access" },
  puppeteer: { name: "puppeteer", command: "npx", args: ["-y", "@modelcontextprotocol/server-puppeteer"], description: "Browser automation and testing" },
  sentry: { name: "sentry", command: "npx", args: ["-y", "@sentry/mcp-server"], env: { SENTRY_AUTH_TOKEN: "" }, description: "Error tracking and monitoring" },
  vercel: { name: "vercel", command: "npx", args: ["-y", "vercel-mcp-server"], description: "Vercel deployment management" },
  shadcn: { name: "shadcn", command: "npx", args: ["-y", "@anthropic-ai/shadcn-mcp-server"], description: "shadcn/ui component installation" },
  prisma: { name: "prisma", command: "npx", args: ["-y", "prisma-mcp-server"], description: "Prisma ORM management" },
  cloudflare: { name: "cloudflare", command: "npx", args: ["-y", "@cloudflare/mcp-server-cloudflare"], description: "Cloudflare Workers, KV, R2" },
  playwright: { name: "playwright", command: "npx", args: ["-y", "@anthropic-ai/mcp-server-playwright"], description: "Browser testing with Playwright" },
  neon: { name: "neon", command: "npx", args: ["-y", "@neondatabase/mcp-server-neon"], env: { NEON_API_KEY: "" }, description: "Neon serverless Postgres" },
  upstash: { name: "upstash", command: "npx", args: ["-y", "@upstash/mcp-server"], env: { UPSTASH_EMAIL: "", UPSTASH_API_KEY: "" }, description: "Upstash Redis and QStash" },
  resend: { name: "resend", command: "npx", args: ["-y", "mcp-server-resend"], env: { RESEND_API_KEY: "" }, description: "Email sending via Resend" },
  fetch: { name: "fetch", command: "npx", args: ["-y", "@modelcontextprotocol/server-fetch"], description: "Fetch and parse web content" },
  turso: { name: "turso", command: "npx", args: ["-y", "@tursodatabase/mcp-server-turso"], env: { TURSO_AUTH_TOKEN: "" }, description: "Turso edge SQLite" },
  tavily: { name: "tavily", command: "npx", args: ["-y", "tavily-mcp"], env: { TAVILY_API_KEY: "" }, description: "AI-powered web search" },
};

const FRAMEWORK_TEMPLATES: Record<string, string> = {
  "next.js": `For Next.js projects, focus on:
- App Router conventions (layout.tsx, page.tsx, loading.tsx, error.tsx)
- Server vs Client Components (default to server, use 'use client' sparingly)
- Server Actions for mutations
- Route handlers in app/api/
- Image optimization with next/image
- Font optimization with next/font`,

  react: `For React projects, focus on:
- Component composition patterns
- Custom hooks for shared logic
- State management approach (local state, context, or external)
- Code splitting with React.lazy
- Error boundaries for resilience`,

  python: `For Python projects, focus on:
- Type hints throughout
- Virtual environment management
- Testing with pytest
- Linting with ruff or flake8
- Package management with pip/poetry/uv`,

  "node.js": `For Node.js projects, focus on:
- ES modules vs CommonJS
- Error handling patterns
- Async/await best practices
- Environment variable management
- Package manager conventions`,

  vue: `For Vue projects, focus on:
- Composition API with <script setup>
- Component organization and naming
- Pinia for state management
- Vue Router conventions
- TypeScript integration`,
};

export function buildSystemPrompt(targetAgent: string): string {
  const agentKnowledge =
    AGENT_FILE_KNOWLEDGE[targetAgent] ?? AGENT_FILE_KNOWLEDGE["claude-code"];

  const knownServersList = Object.entries(KNOWN_MCP_SERVERS)
    .map(([key, s]) => `- ${key}: ${s.description} (${s.command} ${s.args.join(" ")})`)
    .join("\n");

  return `You are an expert developer configuration generator for AI coding agents. You create comprehensive, production-ready configurations that help AI agents understand and work effectively within a project.

${CONFIG_SCHEMA_DESCRIPTION}

Target agent specifics:
${agentKnowledge}

When recommending MCP servers, ONLY use servers from this known catalog:
${knownServersList}

Do NOT invent MCP server packages. Only recommend servers from the list above that are relevant to the project's tech stack.

${QUALITY_GUIDELINES}

Respond with a single valid JSON object matching the schema above. Do not include any explanation or commentary outside the JSON.`;
}

export interface RepoContext {
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  readme: string | null;
  fileTree: string[];
  packageDeps: Record<string, string> | null;
  devDeps: Record<string, string> | null;
  tsconfigOptions: Record<string, unknown> | null;
}

export function buildRepoPrompt(ctx: RepoContext): string {
  const sections: string[] = [];

  sections.push(`Repository: ${ctx.name}`);

  if (ctx.description) {
    sections.push(`Description: ${ctx.description}`);
  }

  if (ctx.language) {
    sections.push(`Primary language: ${ctx.language}`);
  }

  if (ctx.topics.length > 0) {
    sections.push(`Topics: ${ctx.topics.join(", ")}`);
  }

  if (ctx.readme) {
    const truncated = ctx.readme.slice(0, 4000);
    sections.push(
      `README:\n\`\`\`\n${truncated}${ctx.readme.length > 4000 ? "\n[truncated]" : ""}\n\`\`\``
    );
  }

  if (ctx.fileTree.length > 0) {
    const tree = ctx.fileTree.slice(0, 100).join("\n");
    sections.push(`Root file listing:\n${tree}`);
  }

  if (ctx.packageDeps) {
    const deps = Object.entries(ctx.packageDeps)
      .map(([k, v]) => `  ${k}: ${v}`)
      .join("\n");
    sections.push(`Dependencies:\n${deps}`);
  }

  if (ctx.devDeps) {
    const deps = Object.entries(ctx.devDeps)
      .map(([k, v]) => `  ${k}: ${v}`)
      .join("\n");
    sections.push(`Dev dependencies:\n${deps}`);
  }

  if (ctx.tsconfigOptions) {
    sections.push(
      `tsconfig.json compilerOptions:\n${JSON.stringify(ctx.tsconfigOptions, null, 2)}`
    );
  }

  sections.push(
    "Generate a comprehensive agent configuration for this repository. Include detailed instructions, rules, MCP servers, and permissions that match the project's stack and conventions."
  );

  return sections.join("\n\n");
}

export function buildQuestionsPrompt(
  projectDescription: string,
  techStack: string[]
): string {
  const frameworkHints = techStack
    .map((t) => FRAMEWORK_TEMPLATES[t.toLowerCase()])
    .filter(Boolean)
    .join("\n\n");

  const frameworkSection = frameworkHints
    ? `\n\nFramework-specific considerations:\n${frameworkHints}`
    : "";

  return `Based on this project description and tech stack, generate 3-5 clarifying questions that would help create a better, more tailored agent configuration.

Project description: ${projectDescription}

Tech stack: ${techStack.join(", ")}${frameworkSection}

Generate targeted questions about:
- Project architecture and folder structure conventions specific to ${techStack[0] || "the stack"}
- Testing strategy and preferred tools (e.g., vitest vs jest, playwright vs cypress)
- Deployment target and CI/CD workflow
- Code style preferences beyond defaults (e.g., tabs vs spaces, import ordering)
- Key patterns or anti-patterns to enforce for this specific stack

For multiple_choice questions, provide 3-5 concise options. For freeform questions, add a short "context" field explaining what kind of answer is helpful.

Each question should have a unique "id" (e.g., "q1", "q2", etc.).`;
}

export interface QuestionAnswer {
  questionId: string;
  question: string;
  answer: string;
}

interface UserPromptInput {
  projectDescription: string;
  techStack: string[];
  framework?: string;
  includeRules: boolean;
  includeMcp: boolean;
  includePermissions: boolean;
  answers?: QuestionAnswer[];
}

export function buildUserPrompt(input: UserPromptInput): string {
  const sections: string[] = [];

  sections.push(`Project description: ${input.projectDescription}`);
  sections.push(`Tech stack: ${input.techStack.join(", ")}`);

  if (input.framework) {
    sections.push(`Primary framework: ${input.framework}`);
  }

  // Add framework-specific context
  const frameworkHints = input.techStack
    .map((t) => FRAMEWORK_TEMPLATES[t.toLowerCase()])
    .filter(Boolean);

  if (frameworkHints.length > 0) {
    sections.push(`Framework context:\n${frameworkHints.join("\n\n")}`);
  }

  const inclusions: string[] = [];
  if (input.includeRules) {
    inclusions.push(
      "rules (specific, actionable coding rules scoped to relevant file patterns)"
    );
  }
  if (input.includeMcp) {
    inclusions.push(
      "mcpServers (useful MCP servers for this stack from the known catalog ONLY, using npx where possible)"
    );
  }
  if (input.includePermissions) {
    inclusions.push(
      "permissions (sensible tool permissions following least privilege)"
    );
  }

  if (inclusions.length > 0) {
    sections.push(`Include: ${inclusions.join("; ")}`);
  } else {
    sections.push(
      "Set rules, mcpServers, and permissions to empty arrays/objects."
    );
  }

  if (input.answers && input.answers.length > 0) {
    const qa = input.answers
      .map((a) => `Q: ${a.question}\nA: ${a.answer}`)
      .join("\n\n");
    sections.push(`Additional context from user:\n${qa}`);
  }

  sections.push(
    "Generate a comprehensive agent configuration for this project. The instructions content should be thorough and opinionated."
  );

  return sections.join("\n\n");
}
