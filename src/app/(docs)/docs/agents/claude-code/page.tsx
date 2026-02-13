import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claude Code - Actant Docs",
  description:
    "Learn how to configure Claude Code with Actant. Understand CLAUDE.md, settings.json, MCP config, and skills.",
};

export default function ClaudeCodePage() {
  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Claude Code</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Claude Code is Anthropic&apos;s CLI-based coding agent. It reads
        project-level configuration files to understand your codebase
        conventions, available tools, and behavioral rules.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-4">Generated Files</h2>
      <p className="text-muted-foreground mb-4">
        Actant exports the following files for Claude Code:
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2">CLAUDE.md</h3>
      <p className="text-muted-foreground mb-3">
        The primary instructions file. Claude Code reads this from your project
        root to understand project context, coding style, and conventions.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`# Project
My App - A web application built with Next.js

Stack: Next.js 14, TypeScript, Tailwind CSS

## Code Style
- TypeScript strict mode
- Named exports
- Functional components

## Commands
\`\`\`bash
npm run dev
npm run build
npm run test
\`\`\``}</code>
      </pre>

      <h3 className="text-base font-semibold mt-6 mb-2">
        .claude/settings.json
      </h3>
      <p className="text-muted-foreground mb-3">
        Controls Claude Code permissions and tool access.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Read",
      "Write",
      "Edit"
    ],
    "deny": [
      "Bash(rm -rf *)"
    ]
  }
}`}</code>
      </pre>

      <h3 className="text-base font-semibold mt-6 mb-2">.mcp.json</h3>
      <p className="text-muted-foreground mb-3">
        Configures Model Context Protocol servers that Claude Code can connect to
        for additional tools and context.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "your-token"
      }
    }
  }
}`}</code>
      </pre>

      <h3 className="text-base font-semibold mt-6 mb-2">
        .claude/skills/
      </h3>
      <p className="text-muted-foreground mb-3">
        Custom skills that extend Claude Code&apos;s capabilities. Each skill is
        a markdown file with instructions for a specific task.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-4">How to Use</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>Export your configuration from the Actant Builder.</li>
        <li>
          Extract the downloaded files into your project root directory.
        </li>
        <li>
          Run{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            claude
          </code>{" "}
          in your terminal to start Claude Code with your configuration.
        </li>
      </ol>
    </article>
  );
}
