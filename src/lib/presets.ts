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
