import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Windsurf - Actant Docs",
  description:
    "Complete guide to configuring Windsurf with Actant. .windsurfrules format, character limits, overflow strategies, and best practices.",
};

export default function WindsurfPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Windsurf</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Windsurf (by Codeium) is an AI-powered code editor that reads project configuration from a
        rules file at the project root and an optional rules directory for extended content.
        Windsurf has a simpler configuration model than Claude Code or Cursor, with fewer files and
        no MCP server support.
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
              <td className="p-3 font-mono text-xs">.windsurfrules</td>
              <td className="p-3">Primary instructions (6,000 character limit)</td>
            </tr>
            <tr>
              <td className="p-3 font-mono text-xs">.windsurf/rules/rules.md</td>
              <td className="p-3">Extended rules with no character limit</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── .windsurfrules ───────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">.windsurfrules</h2>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        The primary instructions file, placed at your project root. Windsurf reads this file
        automatically when you open the project. It accepts plain text or Markdown formatting.
      </p>
      <div className="bg-muted rounded-lg p-4 text-sm">
        <p className="text-amber-600 dark:text-amber-400 font-medium mb-2">6,000 character limit</p>
        <p className="text-muted-foreground">
          The .windsurfrules file has a hard limit of 6,000 characters. Content beyond this limit is
          silently truncated. Actant validates this during export and warns you if your instructions
          exceed the limit. Plan your content carefully and use the rules directory for overflow.
        </p>
      </div>

      <p className="text-muted-foreground mt-4 mb-3 leading-relaxed">
        Given the character constraint, focus on the most critical information: your stack, core
        conventions, and essential patterns. Move detailed guidelines to the rules directory.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`You are an expert in TypeScript, Next.js 14, and Tailwind CSS.

# Stack
- Next.js 14 (App Router), TypeScript strict, Supabase, Tailwind CSS
- shadcn/ui components, Radix Icons, Zod validation

# Code Style
- TypeScript strict. No \`any\`.
- Named exports. Functional components.
- Tailwind CSS only. No CSS modules or inline styles.
- Zod for all external data validation.

# Structure
- Pages: src/app/
- Components: src/components/ (ui/ for shadcn, features/ for custom)
- Lib: src/lib/ (supabase clients, utilities)
- Hooks: src/hooks/
- Types: src/types/

# Commands
- dev: npm run dev
- build: npm run build
- lint: npm run lint
- test: npm run test

# Rules
- Never use default exports except for pages/layouts
- Always handle errors with try/catch
- Use Server Components by default
- Use Client Components only for interactivity`}</code>
      </pre>

      {/* ── Character Limit Strategies ────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Working Within the Character Limit</h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        6,000 characters is roughly 1,000-1,200 words. Here are strategies for making the most of
        the space:
      </p>
      <ul className="list-disc list-inside space-y-3 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">Use terse, imperative statements.</span>{" "}
          Write &ldquo;No CSS modules&rdquo; instead of &ldquo;Please avoid using CSS modules in
          this project because we prefer Tailwind.&rdquo;
        </li>
        <li>
          <span className="text-foreground font-medium">Use bullet lists, not paragraphs.</span>{" "}
          Bullet points are more character-efficient and easier for the AI to parse than flowing
          prose.
        </li>
        <li>
          <span className="text-foreground font-medium">Abbreviate paths.</span> Use shorthand like{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">src/app/</code>{" "}
          instead of writing out the full directory description every time.
        </li>
        <li>
          <span className="text-foreground font-medium">Omit obvious information.</span> Do not
          explain what TypeScript or React are. Focus on your project-specific conventions.
        </li>
        <li>
          <span className="text-foreground font-medium">Move examples to the rules directory.</span>{" "}
          Code examples take a lot of characters. Keep the main file for rules and move examples to{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            .windsurf/rules/rules.md
          </code>
          .
        </li>
        <li>
          <span className="text-foreground font-medium">Count characters, not words.</span> Actant
          shows a character counter during editing to help you stay within the limit.
        </li>
      </ul>

      {/* ── Rules Directory ──────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        Rules Directory: .windsurf/rules/rules.md
      </h2>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        The rules directory provides space for extended guidelines that do not fit in the main
        .windsurfrules file. The{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
          .windsurf/rules/rules.md
        </code>{" "}
        file has no character limit and is loaded alongside the main rules file.
      </p>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        Use this file for detailed examples, elaborate explanations, and less-critical guidelines
        that support but are not essential to the main rules.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`# Extended Guidelines

## Component Patterns

### Example: Data Table Component
\`\`\`tsx
import { cn } from "@/lib/utils";

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
}

export const DataTable = <T,>({
  data,
  columns,
  className,
}: DataTableProps<T>) => {
  return (
    <div className={cn("rounded-lg border", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th key={col.key} className="p-3 text-left text-sm font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b">
              {columns.map((col) => (
                <td key={col.key} className="p-3 text-sm">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
\`\`\`

## Error Handling Patterns

- API routes: wrap handler in try/catch, return typed error responses
- Server Components: use error.tsx boundary files
- Client Components: use ErrorBoundary from react-error-boundary
- Always log errors server-side before returning sanitized messages

## Database Access

- Use \`createServerClient\` from \`@supabase/ssr\` in Server Components
- Use \`createBrowserClient\` from \`@supabase/ssr\` in Client Components
- Always check the \`error\` field before using \`data\`
- Select explicit columns: \`.select("id, name, email")\` not \`.select("*")\``}</code>
      </pre>

      {/* ── Content Splitting ────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Splitting Content Between Files</h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        A good strategy is to divide content by priority:
      </p>
      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <p className="font-medium text-sm mb-1">.windsurfrules (high priority)</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Stack declaration, core code style rules, naming conventions, critical prohibitions,
            project structure summary, essential commands. Everything the AI needs on every
            interaction.
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="font-medium text-sm mb-1">.windsurf/rules/rules.md (supplementary)</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Code examples, detailed patterns for specific areas (database access, testing, error
            handling), elaborate architecture decisions, and context that is useful but not critical
            for every interaction.
          </p>
        </div>
      </div>

      {/* ── Comparison with Other Agents ──────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Comparison with Other Agents</h2>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>
          Unlike Cursor, Windsurf does not support glob-scoped rules. All rules apply globally.
        </li>
        <li>Unlike Claude Code, Windsurf does not support MCP servers, skills, or permissions.</li>
        <li>
          The 6,000 character limit on .windsurfrules is unique to Windsurf. Other agents have no
          such constraint on their primary instructions file.
        </li>
        <li>
          The .windsurf/rules/rules.md overflow mechanism is the closest equivalent to Cursor&apos;s
          MDC files, but without scoping.
        </li>
      </ul>

      {/* ── Best Practices ───────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Best Practices</h2>
      <ul className="list-disc list-inside space-y-3 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">
            Draft in a text editor with character counting.
          </span>{" "}
          The Actant builder shows your character count in real time. Keep a buffer of at least 200
          characters for future additions.
        </li>
        <li>
          <span className="text-foreground font-medium">Front-load the most important rules.</span>{" "}
          If the file is somehow truncated, the most critical information should be at the top.
        </li>
        <li>
          <span className="text-foreground font-medium">Use markdown headers for structure.</span>{" "}
          Even in a short file, headers help the AI parse sections quickly.
        </li>
        <li>
          <span className="text-foreground font-medium">Test with Windsurf before publishing.</span>{" "}
          Open your project in Windsurf, ask the AI about your conventions, and verify it follows
          your rules correctly.
        </li>
        <li>
          <span className="text-foreground font-medium">
            Reference the rules directory in .windsurfrules.
          </span>{" "}
          Add a note like &ldquo;See .windsurf/rules/rules.md for detailed examples&rdquo; to ensure
          the AI knows extended content is available.
        </li>
      </ul>

      {/* ── Installation ─────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Installation</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>Export your configuration from the Actant Builder with Windsurf selected.</li>
        <li>Extract the downloaded zip into your project root directory.</li>
        <li>Open the project in Windsurf. Rules are loaded automatically.</li>
      </ol>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto mt-4">
        <code>{`# Verify your configuration files
ls -la .windsurfrules
ls -la .windsurf/rules/rules.md

# Check character count of main rules file
wc -c .windsurfrules
# Should be under 6000`}</code>
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
