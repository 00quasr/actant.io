import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cline - Actant Docs",
  description:
    "Complete guide to configuring Cline with Actant. .clinerules directory structure, numbered files, ordering strategies, and multi-file organization.",
};

export default function ClinePage() {
  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Cline</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Cline is an AI coding assistant that runs as a VS Code extension. It
        reads project rules from a dedicated directory of numbered Markdown
        files. This multi-file approach encourages separation of concerns and
        makes it easy to organize rules by topic.
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
            <tr>
              <td className="p-3 font-mono text-xs">.clinerules/*.md</td>
              <td className="p-3">Numbered Markdown files loaded in order</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-muted-foreground leading-relaxed">
        Cline uses a single configuration mechanism: a{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
          .clinerules/
        </code>{" "}
        directory at your project root containing numbered Markdown files. There
        are no separate permission, MCP, or skill files. Everything goes into
        these Markdown documents.
      </p>

      {/* ── Directory Structure ──────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Directory Structure</h2>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        Files are prefixed with a two-digit number to control the order in
        which Cline loads them. Use descriptive names after the number to keep
        the directory self-documenting.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`.clinerules/
  01-project-overview.md
  02-code-style.md
  03-architecture.md
  04-database.md
  05-testing.md
  06-git-workflow.md
  07-api-conventions.md
  08-component-patterns.md`}</code>
      </pre>

      {/* ── Ordering and Numbering ───────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        Ordering and Numbering
      </h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        Cline loads all Markdown files in the directory in alphabetical order.
        The two-digit prefix gives you explicit control over this ordering.
        The ordering matters because context loaded earlier establishes the
        foundation for later rules.
      </p>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        A recommended ordering strategy:
      </p>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Range</th>
              <th className="text-left p-3 font-medium">Purpose</th>
              <th className="text-left p-3 font-medium">Examples</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b">
              <td className="p-3 font-mono text-xs">01-09</td>
              <td className="p-3">Project context and fundamentals</td>
              <td className="p-3">overview, stack, structure</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 font-mono text-xs">10-29</td>
              <td className="p-3">Core conventions</td>
              <td className="p-3">code style, naming, imports</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 font-mono text-xs">30-49</td>
              <td className="p-3">Architecture patterns</td>
              <td className="p-3">components, data layer, API</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 font-mono text-xs">50-69</td>
              <td className="p-3">Tooling and workflows</td>
              <td className="p-3">testing, git, CI/CD</td>
            </tr>
            <tr>
              <td className="p-3 font-mono text-xs">70-99</td>
              <td className="p-3">Domain-specific rules</td>
              <td className="p-3">auth, payments, emails</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-muted-foreground mt-4 leading-relaxed">
        Leave gaps between numbers so you can insert new files later without
        renumbering everything. For example, use 01, 05, 10, 15 instead of
        01, 02, 03, 04.
      </p>

      {/* ── File Format ──────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">File Format</h2>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        Each file is a plain Markdown document. There is no special frontmatter
        or metadata format. Use standard Markdown headings, lists, and code
        blocks. Start each file with a level-1 heading that matches the
        file&apos;s topic.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2">
        Example: 01-project-overview.md
      </h3>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`# Project Overview

Acme Dashboard - Internal analytics platform for tracking user engagement.

## Stack
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Supabase (auth, database, storage)
- Tailwind CSS with shadcn/ui components
- Zod for validation
- Vitest for testing

## Directory Structure
\`\`\`
src/
├── app/           # Pages and layouts (App Router)
├── components/
│   ├── ui/        # shadcn/ui primitives (auto-generated)
│   └── features/  # Feature-specific components
├── lib/           # Utilities and Supabase clients
├── hooks/         # Custom React hooks
├── types/         # TypeScript type definitions
└── services/      # Data access functions
\`\`\`

## Commands
\`\`\`bash
npm run dev        # Development server
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript check
npm run test       # Run tests
\`\`\``}</code>
      </pre>

      <h3 className="text-base font-semibold mt-6 mb-2">
        Example: 02-code-style.md
      </h3>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`# Code Style

## TypeScript
- Strict mode enabled. Never use \`any\`.
- Use \`unknown\` with type narrowing instead of \`any\`.
- Prefer type inference; add explicit annotations only when required.
- Use \`satisfies\` operator for type checking without widening.

## Components
- Named exports only (except Next.js pages and layouts)
- Functional components with arrow function syntax
- Define Props interface and export it alongside the component
- Keep components under 150 lines; extract helpers if longer

## Styling
- Tailwind CSS exclusively. No CSS modules, styled-components, or inline styles.
- Use \`cn()\` from \`lib/utils\` for conditional classes.
- Follow mobile-first responsive design with Tailwind breakpoints.

## Imports
- Use path aliases: \`@/components\`, \`@/lib\`, \`@/hooks\`
- Group imports: React/Next.js, external packages, internal modules
- No barrel files (index.ts re-exports)`}</code>
      </pre>

      <h3 className="text-base font-semibold mt-6 mb-2">
        Example: 05-testing.md
      </h3>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`# Testing

## Framework
- Vitest for unit and integration tests
- React Testing Library for component tests
- MSW (Mock Service Worker) for API mocking

## Conventions
- Test files: \`[module].test.ts\` or \`[module].test.tsx\`
- Colocate test files with the module they test
- Use descriptive test names: \`it("should return 404 when user not found")\`
- One assertion per test when possible

## What to Test
- Service functions: all public methods, edge cases, error paths
- Components: user interactions, conditional rendering, error states
- API routes: valid requests, validation failures, auth failures
- Do NOT test implementation details (internal state, private methods)

## Mocking
- Mock Supabase client in tests, never make real database calls
- Use MSW for external API calls
- Reset mocks in \`afterEach\` to prevent test pollution`}</code>
      </pre>

      {/* ── Multi-File Strategies ─────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        Multi-File Organization Strategies
      </h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        The multi-file approach is Cline&apos;s biggest strength. Here are
        strategies for organizing your rules effectively:
      </p>
      <ul className="list-disc list-inside space-y-3 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">One concern per file.</span>{" "}
          Do not mix code style rules with database conventions. Each file
          should cover a single, well-defined topic. This makes rules easy to
          find, update, and reuse.
        </li>
        <li>
          <span className="text-foreground font-medium">Keep files under 200 lines.</span>{" "}
          If a file grows too long, split it into two files with more specific
          topics. For example, split &ldquo;03-architecture.md&rdquo; into
          &ldquo;03-server-components.md&rdquo; and
          &ldquo;04-client-components.md&rdquo;.
        </li>
        <li>
          <span className="text-foreground font-medium">Use cross-references.</span>{" "}
          If one file depends on context from another, add a note like
          &ldquo;See 01-project-overview.md for the directory structure.&rdquo;
          This helps the AI connect related rules.
        </li>
        <li>
          <span className="text-foreground font-medium">Create domain-specific files for large projects.</span>{" "}
          For a project with auth, payments, and email features, create
          separate files: 70-auth.md, 71-payments.md, 72-emails.md. Each
          contains domain-specific patterns and conventions.
        </li>
        <li>
          <span className="text-foreground font-medium">Include examples in each file.</span>{" "}
          Unlike Windsurf, Cline has no character limit. Take advantage of
          this to include code examples directly in each rule file.
        </li>
      </ul>

      {/* ── Comparison with Other Agents ──────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        Comparison with Other Agents
      </h2>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>
          Unlike Cursor, Cline does not support glob-scoped rules. All files
          are loaded as global context.
        </li>
        <li>
          Unlike Claude Code, Cline does not support MCP servers, permissions,
          or skills.
        </li>
        <li>
          Unlike Windsurf, Cline has no character limit on any individual file.
        </li>
        <li>
          The multi-file approach is unique to Cline and encourages better
          separation of concerns than a single monolithic file.
        </li>
      </ul>

      {/* ── Best Practices ───────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Best Practices</h2>
      <ul className="list-disc list-inside space-y-3 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">Start with a project overview file.</span>{" "}
          File 01 should always be the project overview. It establishes context
          that all subsequent rules build on.
        </li>
        <li>
          <span className="text-foreground font-medium">Use consistent formatting across files.</span>{" "}
          Start each file with a level-1 heading. Use level-2 headings for
          sub-sections. Use bullet lists for rules and fenced code blocks for
          examples.
        </li>
        <li>
          <span className="text-foreground font-medium">Include a commands section early.</span>{" "}
          Put build, lint, test, and dev commands in the project overview or a
          dedicated 02-commands.md file. The AI needs these to verify its work.
        </li>
        <li>
          <span className="text-foreground font-medium">Review file count periodically.</span>{" "}
          Too many small files (20+) can be as confusing as one giant file.
          Aim for 5-10 well-organized files for most projects.
        </li>
        <li>
          <span className="text-foreground font-medium">Commit the .clinerules directory to git.</span>{" "}
          These files contain no secrets and should be version controlled so
          your whole team benefits from the same configuration.
        </li>
      </ul>

      {/* ── Installation ─────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Installation</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>Export your configuration from the Actant Builder with Cline selected.</li>
        <li>
          Extract the{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            .clinerules/
          </code>{" "}
          directory into your project root.
        </li>
        <li>Open the project in VS Code with the Cline extension installed.</li>
        <li>Cline detects and loads the rule files automatically.</li>
      </ol>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto mt-4">
        <code>{`# Verify the directory
ls -la .clinerules/

# Expected output
01-project-overview.md
02-code-style.md
03-architecture.md
04-database.md
05-testing.md
06-git-workflow.md`}</code>
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
          href="/docs/agents/cursor"
          className="font-medium text-foreground hover:underline underline-offset-4"
        >
          Cursor
        </Link>
      </p>
    </article>
  );
}
