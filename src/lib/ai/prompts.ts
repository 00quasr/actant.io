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

export function buildSystemPrompt(targetAgent: string): string {
  const agentKnowledge =
    AGENT_FILE_KNOWLEDGE[targetAgent] ?? AGENT_FILE_KNOWLEDGE["claude-code"];

  return `You are an expert developer configuration generator for AI coding agents. You create comprehensive, production-ready configurations that help AI agents understand and work effectively within a project.

${CONFIG_SCHEMA_DESCRIPTION}

Target agent specifics:
${agentKnowledge}

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
  return `Based on this project description and tech stack, generate 3-5 clarifying questions that would help create a better, more tailored agent configuration.

Project description: ${projectDescription}

Tech stack: ${techStack.join(", ")}

Generate questions that help understand:
- Project architecture and folder structure conventions
- Testing strategy and preferred tools
- Code style preferences and linting rules
- Deployment and CI/CD workflow
- Key patterns or anti-patterns to enforce

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

  const inclusions: string[] = [];
  if (input.includeRules) {
    inclusions.push(
      "rules (specific, actionable coding rules scoped to relevant file patterns)"
    );
  }
  if (input.includeMcp) {
    inclusions.push(
      "mcpServers (useful MCP servers for this stack, using npx where possible)"
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
