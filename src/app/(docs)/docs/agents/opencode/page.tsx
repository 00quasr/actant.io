import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "OpenCode - Actant Docs",
  description:
    "Complete guide to configuring OpenCode with Actant. opencode.json schema, instructions array, MCP server definitions, and best practices.",
};

export default function OpenCodePage() {
  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">OpenCode</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        OpenCode is an open-source terminal-based AI coding assistant. It uses
        a single JSON configuration file to define project context, behavioral
        instructions, and MCP server connections. The JSON-first approach makes
        OpenCode configurations easy to validate, version control, and share
        programmatically.
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
              <td className="p-3 font-mono text-xs">opencode.json</td>
              <td className="p-3">Single configuration file (instructions + MCP servers)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-muted-foreground leading-relaxed">
        OpenCode uses a single file for all configuration. This is the
        simplest configuration model of any supported agent. Everything &mdash;
        instructions, MCP server definitions, and options &mdash; lives in one
        JSON document at your project root.
      </p>

      {/* ── opencode.json ────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">opencode.json</h2>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        The configuration file is a JSON object with a{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
          $schema
        </code>{" "}
        reference for editor autocompletion, an{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
          instructions
        </code>{" "}
        array, and an optional{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
          mcpServers
        </code>{" "}
        object.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`{
  "$schema": "https://opencode.ai/schema.json",
  "instructions": [
    "You are an expert in TypeScript, Next.js 14, and Tailwind CSS.",
    "This is a B2B SaaS dashboard using the Next.js App Router with Supabase.",
    "Use TypeScript strict mode. Never use \`any\`.",
    "Use named exports for all components and functions.",
    "Use functional components with arrow function syntax.",
    "Use Tailwind CSS for all styling. No CSS modules or inline styles.",
    "Validate all external data with Zod schemas.",
    "Use Server Components by default. Use Client Components only for interactivity.",
    "Structure: pages in src/app/, components in src/components/, utilities in src/lib/.",
    "Commands: npm run dev, npm run build, npm run lint, npm run test.",
    "Git: branch naming feature/[name] or fix/[name], commit format type(scope): message."
  ],
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_your_token_here",
        "SUPABASE_PROJECT_ID": "your_project_id"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here"
      }
    }
  }
}`}</code>
      </pre>

      {/* ── Schema Reference ─────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Schema Reference</h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        The opencode.json file supports the following top-level fields:
      </p>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Field</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Required</th>
              <th className="text-left p-3 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b">
              <td className="p-3 font-mono text-xs">$schema</td>
              <td className="p-3">string</td>
              <td className="p-3">No</td>
              <td className="p-3">JSON Schema URL for editor autocompletion and validation</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 font-mono text-xs">instructions</td>
              <td className="p-3">string[]</td>
              <td className="p-3">Yes</td>
              <td className="p-3">Array of instruction strings. Each string is a separate rule or guideline.</td>
            </tr>
            <tr>
              <td className="p-3 font-mono text-xs">mcpServers</td>
              <td className="p-3">object</td>
              <td className="p-3">No</td>
              <td className="p-3">MCP server definitions keyed by server name</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Instructions Array ───────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">The Instructions Array</h2>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        Unlike other agents that use Markdown files, OpenCode takes an array of
        strings. Each string is an individual instruction or rule. OpenCode
        concatenates these strings into context for the AI model.
      </p>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        Writing guidelines for the instructions array:
      </p>
      <ul className="list-disc list-inside space-y-3 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">One concept per string.</span>{" "}
          Each instruction should cover a single rule or piece of context. This
          makes it easy to add, remove, and reorder instructions.
        </li>
        <li>
          <span className="text-foreground font-medium">Keep instructions self-contained.</span>{" "}
          Each string should be understandable on its own without requiring
          context from other strings. Avoid references like &ldquo;as mentioned
          above.&rdquo;
        </li>
        <li>
          <span className="text-foreground font-medium">Use imperative language.</span>{" "}
          Write &ldquo;Use TypeScript strict mode&rdquo; not &ldquo;We use
          TypeScript strict mode&rdquo; or &ldquo;TypeScript strict mode should
          be used.&rdquo;
        </li>
        <li>
          <span className="text-foreground font-medium">Include Markdown formatting within strings.</span>{" "}
          You can use backticks for inline code and basic Markdown within each
          string for emphasis.
        </li>
        <li>
          <span className="text-foreground font-medium">Order matters.</span>{" "}
          Place project context and stack information first, followed by
          conventions, then specific rules and commands.
        </li>
      </ul>

      <h3 className="text-base font-semibold mt-6 mb-2">Grouping Instructions</h3>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        For longer configurations, use header strings to create logical groups:
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`{
  "instructions": [
    "## Project Context",
    "This is an e-commerce platform built with Next.js 14 and Supabase.",
    "The app uses the App Router with Server Components by default.",

    "## Code Style",
    "Use TypeScript strict mode. Never use \`any\`.",
    "Named exports for all components and functions.",
    "Tailwind CSS for all styling. No CSS modules.",

    "## File Structure",
    "Pages: src/app/ (App Router convention).",
    "Components: src/components/ui/ for primitives, src/components/features/ for feature components.",
    "Services: src/services/ for data access functions.",
    "Types: src/types/ for shared TypeScript definitions.",

    "## Commands",
    "Development: npm run dev",
    "Build: npm run build",
    "Lint: npm run lint",
    "Test: npm run test",

    "## Patterns",
    "Validate all request bodies with Zod.",
    "Use Server Actions for mutations.",
    "Handle all errors with try/catch blocks.",
    "Never commit console.log statements."
  ]
}`}</code>
      </pre>

      {/* ── MCP Servers ──────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">MCP Servers</h2>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        The{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
          mcpServers
        </code>{" "}
        object uses the same format as Claude Code and Cursor. Each key is a
        server name, and the value is an object with{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
          command
        </code>,{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
          args
        </code>, and optional{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
          env
        </code>{" "}
        fields.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_your_token"
      }
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-context7"]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@anthropic/mcp-server-filesystem",
        "/path/to/allowed/directory"
      ]
    }
  }
}`}</code>
      </pre>
      <div className="bg-muted rounded-lg p-4 text-sm mt-4">
        <p className="text-amber-600 dark:text-amber-400 font-medium mb-2">
          JSON format requirements
        </p>
        <p className="text-muted-foreground">
          opencode.json must be valid JSON. Unlike Markdown-based configs, even
          small syntax errors (trailing commas, unescaped quotes) will prevent
          the file from loading. Use the Actant builder or a JSON validator to
          check your file before deploying.
        </p>
      </div>

      {/* ── Comparison with Other Agents ──────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        Comparison with Other Agents
      </h2>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>
          Unlike Claude Code and Cursor, OpenCode uses JSON instead of
          Markdown for instructions. This makes it more structured but less
          expressive.
        </li>
        <li>
          Unlike Cline, OpenCode uses a single file instead of multiple files.
          All rules must fit into one instructions array.
        </li>
        <li>
          Unlike Windsurf, OpenCode has no character limit. The instructions
          array can contain as many strings as needed.
        </li>
        <li>
          OpenCode supports MCP servers, making it one of three agents (with
          Claude Code and Cursor) that can connect to external tools.
        </li>
        <li>
          OpenCode does not support permissions or skills. All behavioral rules
          must go in the instructions array.
        </li>
      </ul>

      {/* ── Best Practices ───────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Best Practices</h2>
      <ul className="list-disc list-inside space-y-3 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">Include the $schema field.</span>{" "}
          It enables autocompletion and validation in VS Code and other editors
          that support JSON Schema.
        </li>
        <li>
          <span className="text-foreground font-medium">Use header strings to organize sections.</span>{" "}
          Strings like &ldquo;## Code Style&rdquo; act as section dividers
          within the flat array, making the configuration more readable.
        </li>
        <li>
          <span className="text-foreground font-medium">Keep individual instructions short.</span>{" "}
          One sentence per instruction is ideal. Long multi-paragraph strings
          are harder to maintain and reorder.
        </li>
        <li>
          <span className="text-foreground font-medium">Validate your JSON before deploying.</span>{" "}
          A single syntax error will prevent the entire file from loading. Run
          your file through{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            json_pp
          </code>{" "}
          or a similar tool to check for errors.
        </li>
        <li>
          <span className="text-foreground font-medium">Add MCP servers for your data layer.</span>{" "}
          OpenCode supports MCP, so take advantage of it. Connect to Supabase,
          GitHub, or other services your project depends on.
        </li>
        <li>
          <span className="text-foreground font-medium">Add .mcp credentials to .gitignore.</span>{" "}
          Since MCP configurations are embedded in opencode.json, consider
          using environment variable references or keeping a separate
          opencode.local.json with real tokens that is gitignored.
        </li>
      </ul>

      {/* ── Installation ─────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Installation</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>Export your configuration from the Actant Builder with OpenCode selected.</li>
        <li>
          Place{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            opencode.json
          </code>{" "}
          in your project root directory.
        </li>
        <li>
          Run{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            opencode
          </code>{" "}
          in your terminal to start with the configuration loaded.
        </li>
      </ol>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto mt-4">
        <code>{`# Verify the file is valid JSON
cat opencode.json | json_pp > /dev/null && echo "Valid JSON" || echo "Invalid JSON"

# Start OpenCode
opencode`}</code>
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
