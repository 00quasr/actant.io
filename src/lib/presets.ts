import type {
  AgentDefinition,
  McpServer,
  Rule,
  WorkflowCommand,
} from "@/types/config";

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
  {
    id: "nextjs-conventions",
    label: "Next.js Conventions",
    description: "App Router patterns and best practices",
    rules: [
      {
        title: "Server vs Client Components",
        content:
          "Default to Server Components. Only add 'use client' when you need interactivity, browser APIs, or React hooks. Keep client components small and push them to the leaves of the component tree.",
        alwaysApply: true,
      },
      {
        title: "Data fetching",
        content:
          "Fetch data in Server Components using async/await. Use server actions for mutations. Never use useEffect for initial data loading in pages.",
        glob: "src/app/**/*.{ts,tsx}",
        alwaysApply: false,
      },
      {
        title: "Route organization",
        content:
          "Use route groups with (parentheses) for layout organization. Use loading.tsx, error.tsx, and not-found.tsx for route-level UI states.",
        glob: "src/app/**/*",
        alwaysApply: false,
      },
    ],
  },
  {
    id: "react-patterns",
    label: "React Patterns",
    description: "Component structure and hooks best practices",
    rules: [
      {
        title: "Component structure",
        content:
          "Use functional components with named exports. Keep components focused and under 150 lines. Extract reusable logic into custom hooks.",
        glob: "**/*.tsx",
        alwaysApply: false,
      },
      {
        title: "State management",
        content:
          "Prefer local state (useState) over global state. Use useReducer for complex state logic. Lift state only when necessary. Avoid prop drilling with composition patterns.",
        alwaysApply: true,
      },
    ],
  },
  {
    id: "api-design",
    label: "API Design",
    description: "REST conventions and error handling",
    rules: [
      {
        title: "API route structure",
        content:
          "Use RESTful naming: GET for reads, POST for creates, PATCH for updates, DELETE for deletes. Return appropriate HTTP status codes. Always validate request bodies with Zod.",
        glob: "**/api/**/*.ts",
        alwaysApply: false,
      },
      {
        title: "Error responses",
        content:
          "Return consistent error objects: { error: string, details?: unknown }. Use try/catch in all API handlers. Log errors server-side, return safe messages to clients.",
        glob: "**/api/**/*.ts",
        alwaysApply: false,
      },
    ],
  },
  {
    id: "security",
    label: "Security",
    description: "Input validation and auth patterns",
    rules: [
      {
        title: "Input validation",
        content:
          "Validate all user input at the API boundary with Zod schemas. Never trust client-side validation alone. Sanitize HTML output to prevent XSS.",
        alwaysApply: true,
      },
      {
        title: "Environment variables",
        content:
          "Never hardcode secrets. Use environment variables for all API keys, database URLs, and sensitive configuration. Never expose server-side env vars to the client.",
        alwaysApply: true,
      },
    ],
  },
  {
    id: "documentation",
    label: "Documentation",
    description: "JSDoc and README conventions",
    rules: [
      {
        title: "Code documentation",
        content:
          "Add JSDoc comments to exported functions and complex logic. Include @param and @returns tags. Document non-obvious behavior and edge cases.",
        alwaysApply: true,
      },
    ],
  },
  {
    id: "accessibility",
    label: "Accessibility",
    description: "ARIA, semantic HTML, keyboard nav",
    rules: [
      {
        title: "Semantic HTML",
        content:
          "Use semantic HTML elements (nav, main, article, section, button) instead of generic divs. Use headings in logical order (h1 > h2 > h3).",
        glob: "**/*.tsx",
        alwaysApply: false,
      },
      {
        title: "Keyboard navigation",
        content:
          "Ensure all interactive elements are keyboard accessible. Use proper focus management. Add aria-label to icon-only buttons. Support Escape to close modals/popovers.",
        glob: "**/*.tsx",
        alwaysApply: false,
      },
    ],
  },
  {
    id: "performance",
    label: "Performance",
    description: "Lazy loading and optimization patterns",
    rules: [
      {
        title: "Bundle optimization",
        content:
          "Use dynamic imports for heavy components and routes. Avoid importing entire libraries when you only need a few functions. Use next/dynamic for client component code splitting.",
        alwaysApply: true,
      },
      {
        title: "Memoization",
        content:
          "Use useMemo and useCallback only when there is a measurable performance benefit. Do not prematurely optimize. Profile before memoizing.",
        alwaysApply: true,
      },
    ],
  },
];

export interface CommandPreset {
  id: string;
  label: string;
  description: string;
  commands: WorkflowCommand[];
}

export interface AgentDefinitionPreset {
  id: string;
  label: string;
  description: string;
  agentDefinitions: AgentDefinition[];
}

export const COMMAND_PRESETS: CommandPreset[] = [
  {
    id: "gsd-workflow",
    label: "GSD Workflow",
    description:
      "Spec-driven development workflow inspired by Get Shit Done methodology",
    commands: [
      {
        name: "new-project",
        description: "Initialize project with deep context gathering",
        prompt:
          "You are starting a brand-new project. Begin by asking the user a series of focused questions to understand the project's purpose, target users, key requirements, and technical constraints. After gathering context, research relevant technologies and architecture patterns. Synthesize everything into a structured requirements document and a phased roadmap. Each phase should have clear deliverables, acceptance criteria, and estimated complexity. Save the roadmap to a project spec file and confirm the plan with the user before proceeding.",
      },
      {
        name: "plan-phase",
        description:
          "Create detailed phase plan with research and verification",
        prompt:
          "You are planning the next phase of work from the project roadmap. First, research any technical decisions or unknowns that need resolving — look up library APIs, check documentation, and evaluate trade-offs. Then create a detailed execution plan that breaks the phase into discrete, parallelizable tasks. Each task should specify the files to create or modify, the expected behavior, and how to verify it. After drafting the plan, review it against the phase goals to ensure nothing is missed. Present the plan for approval before execution begins.",
      },
      {
        name: "execute-phase",
        description: "Execute all plans in parallel waves",
        prompt:
          "You are executing an approved phase plan. Work through the tasks in parallel waves — group independent tasks together and execute them simultaneously where possible. For each task, make atomic commits with clear conventional commit messages. After completing each wave, run the project's test suite and linter to catch regressions early. If a task fails or reveals an issue, address it before moving to the next wave. Track progress and report which tasks are complete, in progress, or blocked.",
      },
      {
        name: "verify-work",
        description: "Manual acceptance testing of phase deliverables",
        prompt:
          "You are performing user acceptance testing on the completed phase. Review each deliverable against the acceptance criteria defined in the phase plan. Run the full test suite and verify all tests pass. Check for edge cases, error handling, and UI/UX issues. If you find issues, document them with clear reproduction steps and severity. Summarize what passed, what failed, and what needs attention before the phase can be considered complete.",
      },
      {
        name: "quick",
        description: "Execute ad-hoc task with atomic commits",
        argumentHint: "<task description>",
        prompt:
          "You are executing a quick, standalone task. Read the task description provided as an argument. Analyze what needs to change, make the minimal set of edits required, and commit the changes atomically with a clear conventional commit message. Run the linter and any relevant tests to verify correctness. Keep the scope tight — do not refactor surrounding code or add unrelated improvements.",
      },
      {
        name: "progress",
        description: "Show current project status and next steps",
        prompt:
          "Review the current state of the project. Check the project spec and roadmap files for the overall plan. Examine recent git history to see what has been completed. Identify the current phase, which tasks are done, which are in progress, and what remains. Present a clear status summary including completed phases, the current phase's progress percentage, any blockers or issues, and the recommended next steps.",
      },
    ],
  },
  {
    id: "code-review",
    label: "Code Review",
    description: "Commands for structured code review and security auditing",
    commands: [
      {
        name: "review-pr",
        description: "Review pull request with structured feedback",
        argumentHint: "<PR number or branch>",
        prompt:
          "You are reviewing a pull request. Examine every changed file in the diff. For each file, evaluate: correctness of logic, adherence to project coding standards, potential edge cases or bugs, test coverage, and readability. Organize your feedback into categories: critical issues that must be fixed, suggestions for improvement, and positive observations. Be specific — reference line numbers and provide concrete suggestions. If the PR is large, summarize the overall architecture change before diving into file-level details.",
      },
      {
        name: "security-audit",
        description: "Audit code for security vulnerabilities",
        prompt:
          "Perform a thorough security audit of the codebase. Check for OWASP Top 10 vulnerabilities including injection attacks (SQL, XSS, command injection), broken authentication patterns, sensitive data exposure (hardcoded secrets, unencrypted storage), insecure API endpoints (missing auth checks, no rate limiting), and misconfigured security headers. Review dependency versions for known CVEs. Report each finding with severity level (critical, high, medium, low), the affected file and line, a description of the risk, and a recommended fix.",
      },
      {
        name: "suggest-fixes",
        description: "Suggest improvements for current code",
        prompt:
          "Analyze the current file or recently changed files for opportunities to improve code quality. Look for: duplicated logic that could be extracted, overly complex functions that should be split, missing error handling, inconsistent naming or patterns, type safety issues, and performance concerns. For each suggestion, explain why the current approach is problematic and provide a concrete code example of the improved version. Prioritize suggestions by impact — focus on changes that reduce bug risk or improve maintainability.",
      },
    ],
  },
  {
    id: "documentation",
    label: "Documentation",
    description: "Commands for generating and maintaining project documentation",
    commands: [
      {
        name: "generate-docs",
        description: "Generate project documentation from codebase",
        prompt:
          "Analyze the project structure, exported APIs, and component interfaces to generate comprehensive documentation. Start with a high-level architecture overview, then document each major module with its purpose, public API, usage examples, and configuration options. For React components, document props with types and defaults. For API routes, document request/response schemas. For utility functions, document parameters and return values. Output the documentation in markdown format suitable for a docs site or README.",
      },
      {
        name: "update-changelog",
        description: "Update changelog from recent commits",
        prompt:
          "Examine the git log since the last changelog entry or version tag. Group commits by type: features (feat), bug fixes (fix), breaking changes, performance improvements, and other notable changes. Write a changelog entry in Keep a Changelog format with a summary of what changed and why it matters to users. Exclude chore commits and internal refactors unless they affect the public API. If there are breaking changes, clearly document the migration path.",
      },
    ],
  },
];

export const AGENT_DEFINITION_PRESETS: AgentDefinitionPreset[] = [
  {
    id: "gsd-agents",
    label: "GSD Agents",
    description:
      "Multi-agent orchestration for spec-driven development workflows",
    agentDefinitions: [
      {
        name: "planner",
        description: "Creates executable plans from project goals",
        role: "Creates executable plans",
        instructions:
          "You are the planning agent. Your job is to decompose high-level phase goals into concrete, actionable tasks. Each task should specify which files need to be created or modified, what the expected behavior is, and how to verify correctness. Group tasks into parallel waves where independent work can happen simultaneously. Always validate your plan against the project spec to ensure alignment with overall goals. Output plans in a structured format that the executor agent can follow step by step.",
      },
      {
        name: "executor",
        description: "Executes plans with atomic commits",
        role: "Executes plans with atomic commits",
        instructions:
          "You are the execution agent. You receive a structured plan and implement it task by task. For each task, write clean, well-tested code following the project's coding standards. Make atomic commits with conventional commit messages after each logical unit of work. Run the linter and test suite after each commit to catch issues early. If you encounter a blocker or ambiguity in the plan, flag it immediately rather than making assumptions. Keep your scope tight — implement exactly what the plan specifies.",
      },
      {
        name: "verifier",
        description: "Verifies deliverables against goals",
        role: "Verifies deliverables against goals",
        instructions:
          "You are the verification agent. After the executor completes a set of tasks, you review the deliverables against the acceptance criteria defined in the plan. Run the full test suite, check for edge cases, verify error handling, and validate that the implementation matches the specification. Report your findings as a structured assessment: what passed, what failed, and what needs rework. Be thorough but fair — flag real issues, not style preferences.",
      },
      {
        name: "researcher",
        description: "Researches domain and technical decisions",
        role: "Researches domain and technical decisions",
        instructions:
          "You are the research agent. When the team encounters technical unknowns, evaluate options by looking up documentation, comparing library APIs, analyzing trade-offs, and checking for known issues or limitations. Produce concise research summaries that include the options considered, pros and cons of each, your recommendation, and supporting evidence. Focus on practical, actionable insights rather than exhaustive surveys. Prioritize information that directly impacts the current decision.",
      },
    ],
  },
  {
    id: "team-review",
    label: "Review Team",
    description: "Agents for code review and security analysis",
    agentDefinitions: [
      {
        name: "reviewer",
        description: "Reviews code for quality and correctness",
        role: "Reviews code for quality and correctness",
        instructions:
          "You are the code review agent. Examine code changes for correctness, readability, adherence to project standards, test coverage, and potential bugs. Provide structured feedback organized by severity: critical issues, suggestions, and positive observations. Reference specific lines and provide concrete alternatives when suggesting changes. Focus on substance over style — catch logic errors, missing edge cases, and architectural concerns rather than formatting nitpicks.",
      },
      {
        name: "security-auditor",
        description: "Audits for security vulnerabilities",
        role: "Audits for security vulnerabilities",
        instructions:
          "You are the security audit agent. Review code changes and the broader codebase for security vulnerabilities. Check for injection attacks, broken authentication, sensitive data exposure, insecure dependencies, and missing access controls. Classify each finding by severity and provide a clear remediation path. Stay current on OWASP Top 10 and common vulnerability patterns for the project's tech stack. When in doubt about a potential issue, flag it for human review rather than dismissing it.",
      },
    ],
  },
];

export const MCP_BUNDLES: McpBundle[] = [
  {
    id: "nextjs-supabase",
    label: "Next.js + Supabase",
    description: "Supabase, Context7, shadcn, Vercel",
    servers: [
      {
        name: "supabase",
        type: "stdio",
        command: "npx",
        args: ["-y", "@supabase/mcp-server-supabase"],
        env: { SUPABASE_ACCESS_TOKEN: "" },
        enabled: true,
      },
      {
        name: "context7",
        type: "stdio",
        command: "npx",
        args: ["-y", "@upstash/context7-mcp@latest"],
        enabled: true,
      },
      {
        name: "shadcn",
        type: "stdio",
        command: "npx",
        args: ["-y", "@anthropic-ai/shadcn-mcp-server"],
        enabled: true,
      },
      {
        name: "vercel",
        type: "stdio",
        command: "npx",
        args: ["-y", "vercel-mcp-server"],
        enabled: true,
      },
    ],
  },
  {
    id: "fullstack",
    label: "Full Stack",
    description: "Supabase + filesystem tools",
    servers: [
      {
        name: "supabase",
        type: "stdio",
        command: "npx",
        args: ["-y", "@supabase/mcp-server-supabase"],
        env: { SUPABASE_ACCESS_TOKEN: "" },
        enabled: true,
      },
      {
        name: "filesystem",
        type: "stdio",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-filesystem", "."],
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
        args: ["-y", "@modelcontextprotocol/server-puppeteer"],
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
        args: ["-y", "@modelcontextprotocol/server-github"],
        env: { GITHUB_PERSONAL_ACCESS_TOKEN: "" },
        enabled: true,
      },
    ],
  },
  {
    id: "monitoring",
    label: "Monitoring",
    description: "Error tracking with Sentry",
    servers: [
      {
        name: "sentry",
        type: "stdio",
        command: "npx",
        args: ["-y", "@sentry/mcp-server"],
        env: { SENTRY_AUTH_TOKEN: "" },
        enabled: true,
      },
    ],
  },
  {
    id: "documentation",
    label: "Documentation",
    description: "Context7 for library docs",
    servers: [
      {
        name: "context7",
        type: "stdio",
        command: "npx",
        args: ["-y", "@upstash/context7-mcp@latest"],
        enabled: true,
      },
    ],
  },
];
