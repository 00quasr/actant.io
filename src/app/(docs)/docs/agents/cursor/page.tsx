import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cursor - Actant Docs",
  description:
    "Learn how to configure Cursor with Actant. Understand .cursorrules, MDC rule files, and MCP configuration.",
};

export default function CursorPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Cursor</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Cursor is an AI-powered code editor that uses project-level
        configuration to tailor its behavior. It supports both a global rules
        file and granular rule files in MDC format.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-4">Generated Files</h2>

      <h3 className="text-base font-semibold mt-6 mb-2">.cursorrules</h3>
      <p className="text-muted-foreground mb-3">
        The primary instructions file placed at your project root. Cursor reads
        this to understand project conventions.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`You are an expert in TypeScript and Next.js.

## Code Style
- Use functional components with TypeScript
- Prefer named exports
- Use Tailwind CSS for styling`}</code>
      </pre>

      <h3 className="text-base font-semibold mt-6 mb-2">
        .cursor/rules/*.mdc
      </h3>
      <p className="text-muted-foreground mb-3">
        Granular rule files in MDC (Markdown Components) format. Each file can
        target specific file patterns using frontmatter.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`---
description: React component guidelines
globs: ["src/components/**/*.tsx"]
alwaysApply: false
---

# Component Rules

- Use functional components
- Props interface must be exported
- Include display name`}</code>
      </pre>
      <p className="text-muted-foreground mt-3">
        The frontmatter supports the following fields:
      </p>
      <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
        <li>
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            description
          </code>{" "}
          &mdash; what the rule covers
        </li>
        <li>
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            globs
          </code>{" "}
          &mdash; file patterns the rule applies to
        </li>
        <li>
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            alwaysApply
          </code>{" "}
          &mdash; whether the rule is always active
        </li>
      </ul>

      <h3 className="text-base font-semibold mt-6 mb-2">.mcp.json</h3>
      <p className="text-muted-foreground mb-3">
        Configures MCP servers for Cursor, using the same format as Claude Code.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-4">How to Use</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>Export your configuration from the Actant Builder.</li>
        <li>Extract the files into your project root directory.</li>
        <li>Open the project in Cursor. Rules are detected automatically.</li>
      </ol>
    </article>
  );
}
