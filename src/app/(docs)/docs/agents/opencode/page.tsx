import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenCode - Actant Docs",
  description:
    "Learn how to configure OpenCode with Actant. Understand the opencode.json configuration schema.",
};

export default function OpenCodePage() {
  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">OpenCode</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        OpenCode is a terminal-based AI coding assistant. It uses a single JSON
        configuration file to define project context and tool access.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-4">Generated Files</h2>

      <h3 className="text-base font-semibold mt-6 mb-2">opencode.json</h3>
      <p className="text-muted-foreground mb-3">
        The single configuration file placed at your project root. It defines
        your project context, model preferences, and MCP server connections.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`{
  "$schema": "https://opencode.ai/schema.json",
  "instructions": [
    "Use TypeScript strict mode",
    "Prefer functional components",
    "Use Tailwind CSS for styling"
  ],
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"]
    }
  }
}`}</code>
      </pre>

      <h2 className="text-xl font-semibold mt-10 mb-4">Schema</h2>
      <p className="text-muted-foreground mb-4">
        The JSON file supports the following top-level fields:
      </p>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
        <li>
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            instructions
          </code>{" "}
          &mdash; array of strings with project rules and conventions
        </li>
        <li>
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            mcpServers
          </code>{" "}
          &mdash; MCP server definitions for additional tool access
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-10 mb-4">How to Use</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>Export your configuration from the Actant Builder.</li>
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
    </article>
  );
}
