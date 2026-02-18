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
        Actant is a platform for building, sharing, and exporting configuration files for AI coding
        agents. Instead of manually writing rules files, permission configs, and MCP server
        definitions, you use a visual builder to assemble everything, then export a ready-to-use set
        of files for your agent of choice.
      </p>

      {/* ── Core Concepts ───────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Core Concepts</h2>
      <p className="text-muted-foreground mb-6 leading-relaxed">
        Every configuration you build in Actant is composed of the following pieces. Not every agent
        supports all of them, but the builder handles the mapping for you.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2">Instructions</h3>
      <p className="text-muted-foreground leading-relaxed mb-3">
        Instructions are the primary way you communicate project context to an agent. They describe
        your tech stack, coding conventions, project structure, preferred patterns, and anything
        else the agent should know before touching your code. Instructions are written in Markdown
        and exported as the main configuration file for each agent (e.g.{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">CLAUDE.md</code>{" "}
        for Claude Code,{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">.cursorrules</code>{" "}
        for Cursor).
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`## Project
My App - A SaaS dashboard built with Next.js 14

Stack: Next.js 14 (App Router), TypeScript strict, Supabase, Tailwind CSS

## Code Style
- TypeScript strict mode, no \`any\`
- Named exports for all components and utilities
- Functional components with arrow functions
- Tailwind CSS for styling, no inline styles or CSS modules

## Commands
\`\`\`bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Lint with ESLint
npm run test     # Run Vitest
\`\`\``}</code>
      </pre>

      <h3 className="text-base font-semibold mt-6 mb-2">Rules</h3>
      <p className="text-muted-foreground leading-relaxed mb-3">
        Rules are scoped instructions that apply only to specific files or directories. They are
        useful when different parts of your codebase have different conventions. For example, you
        might want stricter type rules in your API layer and more relaxed rules for test files.
        Rules are supported by agents that allow file-glob scoping (Cursor with MDC files, Cline
        with numbered files).
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`---
description: API route conventions
globs: ["src/app/api/**/*.ts"]
alwaysApply: false
---

# API Routes

- Always validate request body with Zod
- Return typed JSON responses using NextResponse.json()
- Handle errors with try/catch and return appropriate status codes
- Use route segment config for runtime and dynamic options`}</code>
      </pre>

      <h3 className="text-base font-semibold mt-6 mb-2">Skills</h3>
      <p className="text-muted-foreground leading-relaxed mb-3">
        Skills are reusable instruction sets that teach an agent how to perform a specific task.
        Unlike general instructions, skills are invoked on demand. Currently, skills are only
        supported by Claude Code, where they live in{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
          .claude/skills/
        </code>{" "}
        as Markdown files. A skill might describe how to create a new API endpoint, generate a
        database migration, or scaffold a new component.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2">MCP Servers</h3>
      <p className="text-muted-foreground leading-relaxed mb-3">
        MCP (Model Context Protocol) servers give agents access to external tools and data sources.
        By configuring MCP servers, you can connect your agent to databases (Supabase, PostgreSQL),
        APIs (GitHub, Vercel), documentation sources (Context7), and more. MCP configuration is
        exported as{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">.mcp.json</code>{" "}
        and is shared across agents that support it (Claude Code, Cursor, OpenCode).
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2">Permissions</h3>
      <p className="text-muted-foreground leading-relaxed mb-3">
        Permissions control what an agent is allowed to do in your project. You define allow and
        deny lists using glob patterns for tool access. This prevents agents from running
        destructive commands, modifying sensitive files, or accessing resources outside your
        intended scope. Currently, permissions are only supported by Claude Code via{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
          .claude/settings.json
        </code>
        .
      </p>

      {/* ── Quick Start ─────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Quick Start</h2>
      <ol className="list-decimal list-inside space-y-4 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">Sign up for an account</span> using email or
          GitHub OAuth. An account lets you save configs, publish to the marketplace, and sync
          across devices.
        </li>
        <li>
          <span className="text-foreground font-medium">Open the Builder</span> from the sidebar and
          select your target agent. You can switch agents at any time and your content will be
          preserved.
        </li>
        <li>
          <span className="text-foreground font-medium">Write your instructions</span> in the
          Instructions tab. Describe your project, stack, conventions, and commands. Use Markdown
          formatting with headings to organize sections.
        </li>
        <li>
          <span className="text-foreground font-medium">Add rules</span> (optional) in the Rules
          tab. Create scoped rules for specific file patterns. Each rule gets its own file on
          export.
        </li>
        <li>
          <span className="text-foreground font-medium">Configure skills</span> (optional, Claude
          Code only) in the Skills tab. Write step-by-step instructions for repeatable tasks.
        </li>
        <li>
          <span className="text-foreground font-medium">Add MCP servers</span> (optional) in the MCP
          tab. Configure server command, arguments, and environment variables.
        </li>
        <li>
          <span className="text-foreground font-medium">Set permissions</span> (optional, Claude
          Code only) in the Permissions tab. Define allow and deny patterns.
        </li>
        <li>
          <span className="text-foreground font-medium">Export and install</span> by clicking the
          Export button. Download the zip, extract it into your project root, and start your agent.
          Alternatively, use the CLI:{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            npx actant init
          </code>
        </li>
      </ol>

      {/* ── Builder Walkthrough ─────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Builder Walkthrough</h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        The builder is organized into tabs. Each tab maps to a different part of the exported
        configuration.
      </p>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <p className="font-medium text-sm mb-1">Instructions tab</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            A Markdown editor for your primary instructions. This is the content that goes into
            CLAUDE.md, .cursorrules, .windsurfrules, or the instructions array in opencode.json. Use
            headings, lists, and code blocks to keep it organized. The editor provides a live
            preview.
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="font-medium text-sm mb-1">Rules tab</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Create multiple scoped rules. Each rule has a name, optional glob pattern, and Markdown
            content. For Cursor, these become .mdc files. For Cline, these become numbered .md
            files. For other agents, rules are appended to the main instructions.
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="font-medium text-sm mb-1">Skills tab</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Define reusable skill files (Claude Code only). Each skill has a name and Markdown
            instructions. On export, each skill becomes a SKILL.md file inside
            .claude/skills/[skill-name]/.
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="font-medium text-sm mb-1">MCP tab</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Add MCP server configurations. Each server has a name, command, arguments array, and
            optional environment variables. The builder validates JSON syntax and provides templates
            for popular servers like Supabase, GitHub, and Context7.
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="font-medium text-sm mb-1">Permissions tab</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Configure allow and deny patterns for Claude Code. Define which tools and commands the
            agent can use, using glob patterns for fine-grained control.
          </p>
        </div>
      </div>

      {/* ── Export & Install ─────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Export and Install</h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        When you export, Actant generates a zip file containing all the configuration files for your
        chosen agent. The export process:
      </p>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>
          Validates all fields and warns about any issues (character limits, missing required
          fields).
        </li>
        <li>Generates agent-specific files in the correct format and directory structure.</li>
        <li>Bundles everything into a downloadable zip file.</li>
      </ol>
      <p className="text-muted-foreground mt-4 mb-3 leading-relaxed">
        To install, extract the zip into your project root:
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`# Extract into your project root
unzip actant-config.zip -d /path/to/your/project

# Verify the files are in place
ls -la .claude/ .mcp.json CLAUDE.md   # Claude Code
ls -la .cursorrules .cursor/ .mcp.json # Cursor
ls -la .windsurfrules .windsurf/       # Windsurf
ls -la .clinerules/                    # Cline
ls -la opencode.json                   # OpenCode`}</code>
      </pre>

      {/* ── Templates ────────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Using Templates</h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        Instead of starting from scratch, you can begin with a template. Templates are pre-built
        configurations for common stacks and workflows. You can find templates in the marketplace or
        import them directly in the builder.
      </p>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">Stack templates</span> cover a specific tech
          stack (Next.js + Supabase, Django + PostgreSQL, Rails + Redis).
        </li>
        <li>
          <span className="text-foreground font-medium">Workflow templates</span> define processes
          like PR review, migration generation, or test-driven development.
        </li>
        <li>
          <span className="text-foreground font-medium">Minimal templates</span> provide a starting
          structure with headings and placeholders that you fill in with your own details.
        </li>
      </ul>
      <p className="text-muted-foreground mt-3 leading-relaxed">
        After importing a template, customize it freely. Templates are a starting point, not a
        constraint.
      </p>

      {/* ── Writing Good Instructions ────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Tips for Writing Good Instructions</h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        The quality of your agent&apos;s output depends heavily on the quality of your instructions.
        Here are practical guidelines:
      </p>
      <ul className="list-disc list-inside space-y-3 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">Be specific about your stack.</span> Instead
          of &ldquo;Use React,&rdquo; write &ldquo;Use React 19 with Server Components. Use the App
          Router in Next.js 14. Do not use the Pages Router.&rdquo;
        </li>
        <li>
          <span className="text-foreground font-medium">Use imperative language.</span> Write
          &ldquo;Use TypeScript strict mode&rdquo; instead of &ldquo;We prefer TypeScript strict
          mode.&rdquo; Agents respond better to direct instructions.
        </li>
        <li>
          <span className="text-foreground font-medium">Include examples.</span> Show a short code
          snippet of the pattern you want. An example of a correctly structured component or API
          route is worth more than a paragraph of description.
        </li>
        <li>
          <span className="text-foreground font-medium">Document your commands.</span> List the
          actual dev, build, test, and lint commands. Agents use these to verify their work.
        </li>
        <li>
          <span className="text-foreground font-medium">Describe your file structure.</span> A brief
          tree of your project directories with descriptions helps the agent know where to put new
          files.
        </li>
        <li>
          <span className="text-foreground font-medium">State what NOT to do.</span> Explicit
          prohibitions are as valuable as positive instructions. &ldquo;Never use CSS modules&rdquo;
          or &ldquo;Do not add console.log statements&rdquo; prevents common mistakes.
        </li>
        <li>
          <span className="text-foreground font-medium">Keep it under 4000 words.</span> Longer
          instructions dilute signal. Focus on the conventions that matter most. Use rules for
          file-specific details.
        </li>
      </ul>

      {/* ── Supported Agents ─────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Supported Agents</h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        Actant generates configuration files for the following AI coding agents. Click an agent name
        for a detailed guide on its configuration format.
      </p>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Agent</th>
              <th className="text-left p-3 font-medium">Config Files</th>
              <th className="text-left p-3 font-medium">MCP Support</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b">
              <td className="p-3">
                <Link
                  href="/docs/agents/claude-code"
                  className="font-medium text-foreground hover:underline underline-offset-4"
                >
                  Claude Code
                </Link>
              </td>
              <td className="p-3">CLAUDE.md, .claude/settings.json, .mcp.json, .claude/skills/</td>
              <td className="p-3">Yes</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">
                <Link
                  href="/docs/agents/cursor"
                  className="font-medium text-foreground hover:underline underline-offset-4"
                >
                  Cursor
                </Link>
              </td>
              <td className="p-3">.cursorrules, .cursor/rules/*.mdc, .mcp.json</td>
              <td className="p-3">Yes</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">
                <Link
                  href="/docs/agents/windsurf"
                  className="font-medium text-foreground hover:underline underline-offset-4"
                >
                  Windsurf
                </Link>
              </td>
              <td className="p-3">.windsurfrules, .windsurf/rules/rules.md</td>
              <td className="p-3">No</td>
            </tr>
            <tr className="border-b">
              <td className="p-3">
                <Link
                  href="/docs/agents/cline"
                  className="font-medium text-foreground hover:underline underline-offset-4"
                >
                  Cline
                </Link>
              </td>
              <td className="p-3">.clinerules/*.md</td>
              <td className="p-3">No</td>
            </tr>
            <tr>
              <td className="p-3">
                <Link
                  href="/docs/agents/opencode"
                  className="font-medium text-foreground hover:underline underline-offset-4"
                >
                  OpenCode
                </Link>
              </td>
              <td className="p-3">opencode.json</td>
              <td className="p-3">Yes</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Next Steps ───────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Next Steps</h2>
      <ul className="space-y-2">
        <li>
          <Link href="/docs/cli" className="text-sm font-medium hover:underline underline-offset-4">
            CLI installation and usage
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
            href="/docs/agents/cursor"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Cursor configuration guide
          </Link>
        </li>
        <li>
          <Link
            href="/docs/agents/windsurf"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Windsurf configuration guide
          </Link>
        </li>
        <li>
          <Link
            href="/docs/agents/cline"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Cline configuration guide
          </Link>
        </li>
        <li>
          <Link
            href="/docs/agents/opencode"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            OpenCode configuration guide
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
