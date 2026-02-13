import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Getting Started - Actant Docs",
  description:
    "Learn how to configure AI coding agents with Actant. Build configurations visually, share them, and export for any supported agent.",
};

export default function GettingStartedPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Getting Started</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Actant is a platform for configuring AI coding agents. Build
        configurations visually, share them with your team, and export for any
        supported agent.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-4">Quick Start</h2>
      <ol className="list-decimal list-inside space-y-3 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">
            Sign up for an account
          </span>{" "}
          to save and share your configurations.
        </li>
        <li>
          <span className="text-foreground font-medium">
            Open the Builder
          </span>{" "}
          and choose your target agent.
        </li>
        <li>
          <span className="text-foreground font-medium">
            Configure instructions, skills, MCP servers, and rules
          </span>{" "}
          using the visual editor.
        </li>
        <li>
          <span className="text-foreground font-medium">
            Export your configuration
          </span>{" "}
          and drop it into your project.
        </li>
      </ol>

      <h2 className="text-xl font-semibold mt-10 mb-4">Supported Agents</h2>
      <p className="text-muted-foreground mb-4">
        Actant generates configuration files for the following AI coding agents:
      </p>
      <ul className="space-y-2">
        {[
          { label: "Claude Code", href: "/docs/agents/claude-code" },
          { label: "Cursor", href: "/docs/agents/cursor" },
          { label: "Windsurf", href: "/docs/agents/windsurf" },
          { label: "Cline", href: "/docs/agents/cline" },
          { label: "OpenCode", href: "/docs/agents/opencode" },
        ].map((agent) => (
          <li key={agent.href}>
            <Link
              href={agent.href}
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              {agent.label}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
