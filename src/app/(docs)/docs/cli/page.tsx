import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CLI - Actant Docs",
  description:
    "Install and use the Actant CLI to pull your configurations directly into any project from the terminal.",
};

export default function CliPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">CLI</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        The Actant CLI lets you pull your configurations directly into any
        project from the terminal. Instead of downloading a zip from the web
        app, you authenticate once and then run a single command to write config
        files into your working directory.
      </p>

      {/* ── Installation ─────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Installation</h2>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        Install globally with npm:
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>npm install -g actant</code>
      </pre>
      <p className="text-muted-foreground mt-3 mb-3 leading-relaxed">
        Or run directly with npx (no install required):
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>npx actant init</code>
      </pre>

      {/* ── Authentication ────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Authentication</h2>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        The CLI authenticates via your browser. When you run{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
          actant login
        </code>
        , a browser tab opens to actant.io where you sign in with your existing
        account. Tokens are stored locally and refreshed automatically.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>actant login</code>
      </pre>
      <p className="text-muted-foreground mt-3 leading-relaxed">
        If you&apos;re already authenticated, the CLI will tell you. To sign
        out and clear stored credentials:
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto mt-3">
        <code>actant logout</code>
      </pre>

      {/* ── Commands ──────────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Commands</h2>

      <h3 className="text-base font-semibold mt-6 mb-2">
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
          actant init
        </code>
      </h3>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        The primary command. Fetches your configs from actant.io, lets you
        select one, choose a target agent, then writes the exported files into
        the current directory.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`$ actant init
? Select a configuration: My Next.js Config
? Target agent: Claude Code
Files to write:
  CLAUDE.md (1.2KB)
  .claude/settings.json (340B)
  .mcp.json (520B)

Wrote 3 file(s):
  CLAUDE.md
  .claude/settings.json
  .mcp.json`}</code>
      </pre>
      <p className="text-muted-foreground mt-3 leading-relaxed">
        If any files already exist, the CLI will list them and ask for
        confirmation before overwriting.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2">
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
          actant list
        </code>
      </h3>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        Lists all your saved configurations with name, target agent, and last
        updated date.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`$ actant list
Name                          Agent         Updated
------------------------------+--------------+------------
My Next.js Config             claude-code   2/10/2026
Django API Setup              cursor        1/28/2026
Rails Monolith                windsurf      1/15/2026`}</code>
      </pre>

      <h3 className="text-base font-semibold mt-6 mb-2">
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
          actant login
        </code>
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        Opens your browser to authenticate with actant.io. Starts a temporary
        local server to receive the OAuth callback. Times out after 2 minutes
        if not completed.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2">
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
          actant logout
        </code>
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        Signs out and clears stored credentials from your machine.
      </p>

      {/* ── Typical Workflow ──────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Typical Workflow</h2>
      <ol className="list-decimal list-inside space-y-3 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">
            Build your config
          </span>{" "}
          in the web app at{" "}
          <Link
            href="/builder"
            className="font-medium text-foreground hover:underline underline-offset-4"
          >
            actant.io/builder
          </Link>
          .
        </li>
        <li>
          <span className="text-foreground font-medium">
            Navigate to your project
          </span>{" "}
          in the terminal.
        </li>
        <li>
          <span className="text-foreground font-medium">
            Run{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
              npx actant init
            </code>
          </span>{" "}
          to select your config and target agent.
        </li>
        <li>
          <span className="text-foreground font-medium">
            Start your agent
          </span>{" "}
          and begin building.
        </li>
      </ol>
      <p className="text-muted-foreground mt-4 leading-relaxed">
        When you update your config in the web app, run{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
          actant init
        </code>{" "}
        again to pull the latest version.
      </p>

      {/* ── Next Steps ────────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Next Steps</h2>
      <ul className="space-y-2">
        <li>
          <Link
            href="/docs/getting-started"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Getting Started guide
          </Link>
        </li>
        <li>
          <Link
            href="/docs/agents/claude-code"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Claude Code configuration guide
          </Link>
        </li>
        <li>
          <Link
            href="/docs/community"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Community and marketplace guidelines
          </Link>
        </li>
      </ul>
    </article>
  );
}
