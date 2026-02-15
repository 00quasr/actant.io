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
  "instructions": { "content": string } - The main instructions content as comprehensive markdown. This is the MOST IMPORTANT field. Write comprehensive, detailed instructions of **1500-3000 words**. Structure with markdown headings: ## Project Overview, ## Architecture, ## Code Style & Conventions, ## File Structure, ## Component Patterns, ## Data Fetching, ## State Management, ## Testing Strategy, ## Error Handling, ## Git Workflow, ## Deployment, ## Security. Each section should have specific, actionable guidelines with code examples where helpful. This should read like a complete developer onboarding handbook.
  "skills": [] - Leave as empty array (skills are added separately by the user).
  "mcpServers": [ { "name": string, "type": "stdio"|"sse"|"streamable-http", "command": string|null, "args": string[]|null, "url": string|null, "envKeys": [{key: string, value: string}]|null, "enabled": boolean } ] - Include **all relevant** servers from the known catalog for the given tech stack. Use "stdio" type with npx commands for npm-based servers. Use envKeys array for environment variables (e.g. [{"key": "SUPABASE_ACCESS_TOKEN", "value": ""}]).
  "permissionEntries": [ { "tool": string, "value": "allow"|"ask"|"deny" } ] - Generate **8-12 permission entries** covering all common tool categories. Common tools: "Bash(npm run *)", "Bash(npx *)", "Bash(git *)", "Bash(rm *)", "file_edit", "file_read", "file_write", "web_search", "mcp", "Bash(docker *)", "notebook_edit". Use "allow" for safe operations, "ask" for destructive ones, "deny" for dangerous ones.
  "rules": [ { "title": string, "content": string, "glob": string|null, "alwaysApply": boolean } ] - Generate **8-15 rules** minimum. Each rule content should be **3-5 sentences** with specific guidance, not one-liners. Include glob patterns to scope rules to relevant files. Use "glob" to scope rules to specific file patterns (e.g., "*.test.ts" for testing rules). Set "alwaysApply" to true for universal rules.
  "docs": [ { "filename": string, "content": string } ] - Generate documentation files. Generate at minimum 5 docs for any non-trivial project, each 500-2000 words with real file paths and commands. Doc types:
    - README.md (ALWAYS): project overview, features, tech stack, prerequisites, setup, dev workflow, structure, env vars, deployment.
    - DEVELOPMENT.md (ALWAYS): local dev setup, debugging tips, hot reload config, database seeding, dev tools, common issues.
    - CONTRIBUTING.md (team/open-source): code style, branching strategy, PR process, commit conventions, testing requirements.
    - ARCHITECTURE.md (complex projects): system overview, component diagram, data flow, key technical decisions, scaling.
    - TESTING.md (when tests relevant): testing strategy, frameworks, running tests, writing tests, coverage targets, CI integration.
    - DEPLOYMENT.md (when deployment relevant): pipeline, environments, rollback procedures, monitoring, health checks.
    - API_REFERENCE.md (when project has API): endpoints, request/response schemas, authentication, rate limits, error codes.
    - SECURITY.md (when security relevant): security policies, auth flows, input validation, secrets management, vulnerability reporting.
    Docs should cross-reference each other (e.g., README links to DEVELOPMENT.md for setup details).
  "recommendedSkillIds": string[] - IDs of skills from the provided catalog that would benefit this project. Leave empty if no catalog provided.
}

IMPORTANT: Do NOT generate short, vague, or generic content. Every field should be thorough and specific to the described project. A good config should feel like a comprehensive team onboarding document.`;

const QUALITY_GUIDELINES = `Quality guidelines for generated configs:
- Be specific and opinionated. Generic advice like "write clean code" is not useful.
- Include real commands, real file paths, real tool names.
- Reference specific versions and libraries from the tech stack.
- Instructions should read like a senior developer's project handbook.
- Instructions must be at minimum 1500 words. Anything shorter is insufficient.
- Each rule content must be 3-5 detailed sentences, not single-line platitudes.
- Include code snippet examples in instructions where they add clarity (e.g., import patterns, file naming, component structure).
- Rules should be actionable: each rule should change how the agent behaves.
- For MCP servers, only include servers that genuinely help the described project.
- Permissions should follow the principle of least privilege.
- Use concrete examples in instructions (e.g., "Use vitest, not jest" instead of "Use a testing framework").
- Structure instructions with clear markdown sections: ## Project Overview, ## Architecture, ## Code Style & Conventions, ## File Structure, ## Component Patterns, ## Data Fetching, ## State Management, ## Testing Strategy, ## Error Handling, ## Git Workflow, ## Deployment, ## Security.
- Include at least 8 specific rules with detailed multi-sentence content.
- Generate at least 8 permission entries covering all relevant tool categories.

Documentation quality:
- README.md (ALWAYS): project name as h1, one-paragraph description, features list, tech stack section, prerequisites, step-by-step setup, environment variables table, project structure tree, available scripts/commands, and deployment notes.
- DEVELOPMENT.md (ALWAYS): local environment setup, IDE/editor config, debugging techniques and tools, hot reload configuration, database seeding/migration commands, dev tools and their usage, common issues and troubleshooting.
- CONTRIBUTING.md (team/open-source): code style expectations, branching strategy, commit message format, PR template/checklist, testing requirements, review process, and getting help.
- ARCHITECTURE.md (complex projects): system overview diagram (text-based), component relationships, data flow description, key technical decisions with rationale, dependency graph, and scaling considerations.
- TESTING.md (when tests relevant): testing strategy and philosophy, testing frameworks and tools, how to run tests, how to write new tests, coverage targets and enforcement, CI test pipeline, mocking and fixtures approach.
- DEPLOYMENT.md (when deployment relevant): deployment pipeline overview, environment descriptions (dev/staging/prod), rollback procedures, monitoring and alerting setup, health check endpoints, infrastructure requirements.
- API_REFERENCE.md (when project has API): endpoint listing with methods/paths, request/response schemas with examples, authentication and authorization, rate limiting, error codes and handling, versioning strategy.
- SECURITY.md (when security relevant): security policies, authentication and authorization flows, input validation strategy, secrets management, dependency vulnerability scanning, vulnerability reporting process.
- Quality bar: each doc should be 500-2000 words, project-specific with real file paths and actual commands (not placeholders).
- Each doc should feel self-contained and useful to a developer seeing the project for the first time.
- Cross-reference: docs should reference each other (e.g., README links to DEVELOPMENT.md for setup, CONTRIBUTING.md references TESTING.md for test requirements). Instructions should also mention the generated docs.`;

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

  const stackLabel = techStack.length > 0 ? techStack[0] : "the project";
  const techStackDisplay = techStack.length > 0 ? techStack.join(", ") : "Not specified";

  return `Based on this project description and tech stack, generate 6-8 clarifying questions that would help create a better, more tailored agent configuration.

Project description: ${projectDescription}

Tech stack: ${techStackDisplay}${frameworkSection}

Generate targeted questions about:
- Project architecture and folder structure conventions specific to ${stackLabel}
- Testing strategy and preferred tools (e.g., vitest vs jest, playwright vs cypress)
- Deployment target and CI/CD workflow
- Code style preferences beyond defaults (e.g., tabs vs spaces, import ordering)
- Key patterns or anti-patterns to enforce for this specific stack
- Error handling and logging approach
- Authentication/authorization strategy (if applicable)
- Third-party integrations and APIs used
- Performance requirements or constraints
- Team size and collaboration patterns

For multiple_choice questions, provide 3-5 concise options. For freeform questions, add a short "context" field explaining what kind of answer is helpful.

Each question should have a unique "id" (e.g., "q1", "q2", etc.).`;
}

export interface QuestionAnswer {
  questionId: string;
  question: string;
  answer: string;
}

export interface SelectedSkill {
  id: string;
  name: string;
  description: string;
}

interface UserPromptInput {
  projectDescription: string;
  techStack: string[];
  framework?: string;
  includeRules: boolean;
  includeMcp: boolean;
  includePermissions: boolean;
  answers?: QuestionAnswer[];
  selectedSkills?: SelectedSkill[];
  skillsCatalog?: { id: string; name: string; description: string }[];
}

export function buildUserPrompt(input: UserPromptInput): string {
  const sections: string[] = [];

  sections.push(`Project description: ${input.projectDescription}`);

  const techStackDisplay = input.techStack.length > 0 ? input.techStack.join(", ") : "Not specified";
  sections.push(`Tech stack: ${techStackDisplay}`);

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
      "rules (at least 8 specific, actionable coding rules scoped to relevant file patterns, each with 3-5 sentences of content)"
    );
  }
  if (input.includeMcp) {
    inclusions.push(
      "mcpServers (all relevant MCP servers for this stack from the known catalog ONLY, using npx where possible)"
    );
  }
  if (input.includePermissions) {
    inclusions.push(
      "permissions (8-12 sensible tool permissions following least privilege)"
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
    sections.push("User's answers to clarifying questions (use these to inform every relevant section of the config):");
    for (const a of input.answers) {
      sections.push(`Q: ${a.question}\nA: ${a.answer}`);
    }
  }

  if (input.selectedSkills && input.selectedSkills.length > 0) {
    const skillsList = input.selectedSkills
      .map((s) => `- ${s.name}: ${s.description}`)
      .join("\n");
    sections.push(`The user has selected these skills to include:\n${skillsList}\n\nReference these skills in the instructions and mention how the agent should leverage them.`);
  }

  if (input.skillsCatalog && input.skillsCatalog.length > 0) {
    const catalogList = input.skillsCatalog
      .map((s) => `- ID: ${s.id} | ${s.name}: ${s.description}`)
      .join("\n");
    sections.push(`Available skills catalog (recommend relevant ones by adding their IDs to recommendedSkillIds):\n${catalogList}`);
  }

  sections.push(
    `Generate a comprehensive agent configuration for this project. The instructions should be a complete developer handbook of 1500-3000 words with multiple structured sections, code examples, and specific guidance. Include at least 8 detailed rules. The output should feel like a thorough team onboarding document, not a brief summary.

Also generate documentation files:
- README.md (ALWAYS): project overview, features, tech stack, prerequisites, setup, dev workflow, structure, env vars, deployment
- DEVELOPMENT.md (ALWAYS): local setup, debugging tips, hot reload config, database seeding, dev tools, common issues
- CONTRIBUTING.md (for team/open-source): code style, branching, PR process, commit conventions, testing requirements
- ARCHITECTURE.md (for complex projects): system overview, component diagram, data flow, key decisions, scaling
- TESTING.md (when tests relevant): testing strategy, frameworks, running tests, writing tests, coverage, CI
- DEPLOYMENT.md (when deployment relevant): pipeline, environments, rollback, monitoring, health checks
- API_REFERENCE.md (when project has API): endpoints, schemas, auth, rate limits, error codes
- SECURITY.md (when security relevant): policies, auth flows, validation, secrets, vulnerability reporting

Generate at minimum 5 documentation files for any non-trivial project. Each doc should be 500-2000 words, project-specific with real file paths and commands. Docs should cross-reference each other.`
  );

  return sections.join("\n\n");
}
