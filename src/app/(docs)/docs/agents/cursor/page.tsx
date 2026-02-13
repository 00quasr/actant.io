import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cursor - Actant Docs",
  description:
    "Complete guide to configuring Cursor with Actant. .cursorrules format, MDC rule files, glob scoping, MCP configuration, and best practices.",
};

export default function CursorPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Cursor</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Cursor is an AI-powered code editor built on VS Code. It reads
        project-level configuration files to tailor its behavior to your
        codebase. Cursor supports a global rules file for broad instructions
        and granular rule files in MDC format for scoped, file-pattern-specific
        guidelines.
      </p>

      {/* ── File Overview ────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Generated Files</h2>
      <div className="border rounded-lg overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">File</th>
              <th className="text-left p-3 font-medium">Purpose</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b">
              <td className="p-3 font-mono text-xs">.cursorrules</td>
              <td className="p-3">Global instructions applied to all files</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 font-mono text-xs">.cursor/rules/*.mdc</td>
              <td className="p-3">Scoped rules targeting specific file patterns</td>
            </tr>
            <tr>
              <td className="p-3 font-mono text-xs">.mcp.json</td>
              <td className="p-3">MCP server definitions (same format as Claude Code)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── .cursorrules ─────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">.cursorrules</h2>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        The{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
          .cursorrules
        </code>{" "}
        file is placed at your project root and contains your primary
        instructions. Cursor loads this file automatically when you open the
        project. The content is plain text or Markdown. It is always active
        and applies to every interaction with the AI.
      </p>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        Write this file as if you are briefing a new developer joining your
        team. Cover the technology stack, project conventions, directory layout,
        and any patterns the agent should follow or avoid.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`You are an expert in TypeScript, React, Next.js 14, and Tailwind CSS.

## Project Context
This is a B2B SaaS dashboard. The frontend uses Next.js App Router with
Server Components by default. Client Components are used only when
interactivity is required (forms, modals, state).

## Code Style
- TypeScript strict mode. Never use \`any\` or \`as unknown as\`.
- Named exports for all components, hooks, and utilities
- Functional components with arrow function syntax
- Tailwind CSS for all styling. No CSS modules, styled-components, or inline styles.
- Use \`cn()\` from \`lib/utils\` to merge Tailwind classes conditionally

## Naming Conventions
- Components: PascalCase (UserProfile.tsx)
- Hooks: camelCase with use prefix (useAuth.ts)
- Utilities: camelCase (formatDate.ts)
- Types: PascalCase with no suffix (User, not UserType or IUser)
- API routes: kebab-case directories (api/auth/sign-in/route.ts)

## Patterns to Follow
- Validate all external data with Zod schemas
- Use Server Actions for mutations, not API routes
- Colocate types with the module that uses them
- Keep components under 150 lines; extract sub-components if larger

## Patterns to Avoid
- Do not use \`useEffect\` for data fetching; use Server Components
- Do not create barrel files (index.ts re-exports)
- Do not use default exports (except for Next.js pages/layouts)
- Do not use \`React.FC\` type annotation`}</code>
      </pre>

      {/* ── MDC Rules ────────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        MDC Rule Files: .cursor/rules/*.mdc
      </h2>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        MDC (Markdown Components) files provide scoped rules that target
        specific file patterns. They live in the{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
          .cursor/rules/
        </code>{" "}
        directory and are loaded automatically based on their configuration.
        Each MDC file has a YAML frontmatter block followed by Markdown content.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2">Frontmatter Fields</h3>
      <div className="border rounded-lg overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Field</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b">
              <td className="p-3 font-mono text-xs">description</td>
              <td className="p-3">string</td>
              <td className="p-3">Short summary of what this rule covers. Used by the AI to decide relevance.</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 font-mono text-xs">globs</td>
              <td className="p-3">string[]</td>
              <td className="p-3">File patterns this rule applies to. Uses glob syntax.</td>
            </tr>
            <tr>
              <td className="p-3 font-mono text-xs">alwaysApply</td>
              <td className="p-3">boolean</td>
              <td className="p-3">If true, the rule is always active regardless of which file is open.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-base font-semibold mt-6 mb-2">How Rule Loading Works</h3>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        Cursor decides which rules to load based on the combination of{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
          alwaysApply
        </code>{" "}
        and{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
          globs
        </code>:
      </p>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">alwaysApply: true</span>{" "}
          &mdash; Rule is loaded on every request. Use for universal guidelines. Globs are ignored.
        </li>
        <li>
          <span className="text-foreground font-medium">alwaysApply: false + globs set</span>{" "}
          &mdash; Rule is loaded only when the user is working on files matching the glob patterns.
        </li>
        <li>
          <span className="text-foreground font-medium">alwaysApply: false + no globs</span>{" "}
          &mdash; Rule is available but only loaded if the AI determines it is relevant based on the description.
        </li>
      </ul>

      <h3 className="text-base font-semibold mt-6 mb-2">Example: Component Rules</h3>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`---
description: React component conventions and patterns
globs: ["src/components/**/*.tsx", "src/app/**/*.tsx"]
alwaysApply: false
---

# Component Guidelines

- Every component must have a named export
- Define a Props interface and export it alongside the component
- Use \`cn()\` for conditional class merging
- Keep render logic minimal; extract complex logic into hooks
- If a component exceeds 150 lines, split it into sub-components

## Example Structure

\`\`\`tsx
import { cn } from "@/lib/utils";

export interface UserCardProps {
  name: string;
  email: string;
  className?: string;
}

export const UserCard = ({ name, email, className }: UserCardProps) => {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <p className="font-medium">{name}</p>
      <p className="text-sm text-muted-foreground">{email}</p>
    </div>
  );
};
\`\`\``}</code>
      </pre>

      <h3 className="text-base font-semibold mt-6 mb-2">Example: Testing Rules</h3>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`---
description: Testing conventions with Vitest
globs: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts"]
alwaysApply: false
---

# Testing

- Use Vitest for all tests
- Name test files \`[module].test.ts\` colocated with the module
- Use descriptive test names: \`it("should return 404 when user not found")\`
- Prefer \`userEvent\` over \`fireEvent\` for component tests
- Mock external dependencies; never make real API calls in tests
- Aim for behavior-based tests, not implementation-based`}</code>
      </pre>

      <h3 className="text-base font-semibold mt-6 mb-2">Example: Database Rules</h3>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`---
description: Supabase database access patterns
globs: ["src/services/**/*.ts", "src/lib/supabase/**/*.ts"]
alwaysApply: false
---

# Database Access

- Use the server client for Server Components and API routes
- Use the browser client only in Client Components
- Always handle Supabase errors: check \`error\` before using \`data\`
- Use RLS policies instead of manual auth checks in queries
- Never expose the service role key in client-side code
- Prefer \`.select()\` with explicit columns over \`select("*")\``}</code>
      </pre>

      {/* ── MCP Configuration ────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">MCP Configuration</h2>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        Cursor supports MCP servers using the same{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
          .mcp.json
        </code>{" "}
        format as Claude Code. The file is placed at your project root. See
        the{" "}
        <Link
          href="/docs/agents/claude-code"
          className="font-medium text-foreground hover:underline underline-offset-4"
        >
          Claude Code docs
        </Link>{" "}
        for detailed examples of MCP server configurations.
      </p>

      {/* ── Differences from Claude Code ─────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        Differences from Claude Code
      </h2>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Feature</th>
              <th className="text-left p-3 font-medium">Cursor</th>
              <th className="text-left p-3 font-medium">Claude Code</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b">
              <td className="p-3">Primary instructions</td>
              <td className="p-3">.cursorrules (plain text)</td>
              <td className="p-3">CLAUDE.md (Markdown)</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">Scoped rules</td>
              <td className="p-3">.cursor/rules/*.mdc with glob targeting</td>
              <td className="p-3">Subdirectory CLAUDE.md files</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">Permissions</td>
              <td className="p-3">Not supported</td>
              <td className="p-3">.claude/settings.json</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">Skills</td>
              <td className="p-3">Not supported</td>
              <td className="p-3">.claude/skills/*/SKILL.md</td>
            </tr>
            <tr>
              <td className="p-3">MCP servers</td>
              <td className="p-3">Supported (.mcp.json)</td>
              <td className="p-3">Supported (.mcp.json)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Best Practices ───────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Best Practices</h2>
      <ul className="list-disc list-inside space-y-3 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">Keep .cursorrules focused on universal conventions.</span>{" "}
          Put broad guidelines (naming, imports, TypeScript rules) in the global
          file. Use MDC files for area-specific rules.
        </li>
        <li>
          <span className="text-foreground font-medium">Use precise glob patterns.</span>{" "}
          A rule scoped to{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            src/components/**/*.tsx
          </code>{" "}
          is more effective than one that applies to all .tsx files. Specific
          scoping reduces noise and improves rule relevance.
        </li>
        <li>
          <span className="text-foreground font-medium">Write descriptive frontmatter descriptions.</span>{" "}
          When alwaysApply is false and no globs are set, Cursor uses the
          description field to decide if the rule is relevant. A vague
          description like &ldquo;code rules&rdquo; will rarely be loaded.
        </li>
        <li>
          <span className="text-foreground font-medium">Include code examples in rules.</span>{" "}
          Cursor&apos;s AI benefits from seeing the pattern you want. A short
          example component, test case, or function signature communicates more
          than a paragraph of text.
        </li>
        <li>
          <span className="text-foreground font-medium">Avoid duplication between .cursorrules and MDC files.</span>{" "}
          If a rule appears in both places, the AI sees it twice, which wastes
          context. Put it in one place only.
        </li>
        <li>
          <span className="text-foreground font-medium">Use alwaysApply sparingly.</span>{" "}
          Rules that always load consume context window space. Reserve
          alwaysApply for critical universal guidelines. Use glob-scoped
          rules for everything else.
        </li>
      </ul>

      {/* ── Installation ─────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Installation</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>Export your configuration from the Actant Builder with Cursor selected.</li>
        <li>Extract the downloaded zip into your project root directory.</li>
        <li>Open the project in Cursor. Rules are detected and loaded automatically.</li>
        <li>
          Verify by opening Cursor Settings and checking the Rules section to
          see your loaded rules.
        </li>
      </ol>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto mt-4">
        <code>{`# Verify your configuration files
ls -la .cursorrules .cursor/rules/ .mcp.json

# Expected .cursor/rules/ contents
ls .cursor/rules/
# components.mdc  testing.mdc  database.mdc  api-routes.mdc`}</code>
      </pre>

      <p className="mt-8 text-sm text-muted-foreground">
        See also:{" "}
        <Link
          href="/docs/getting-started"
          className="font-medium text-foreground hover:underline underline-offset-4"
        >
          Getting Started
        </Link>
        {" | "}
        <Link
          href="/docs/agents/claude-code"
          className="font-medium text-foreground hover:underline underline-offset-4"
        >
          Claude Code
        </Link>
      </p>
    </article>
  );
}
