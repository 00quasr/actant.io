import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Claude Code - Actant Docs",
  description:
    "Complete guide to configuring Claude Code with Actant. CLAUDE.md format, permissions, MCP servers, skills authoring, and best practices.",
};

export default function ClaudeCodePage() {
  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Claude Code</h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Claude Code is Anthropic&apos;s CLI-based coding agent. It runs in your terminal, reads your
        project files, and uses a set of configuration files to understand your codebase
        conventions, available tools, and behavioral constraints. Claude Code has the richest
        configuration surface of any supported agent, with dedicated files for instructions,
        permissions, MCP servers, and skills.
      </p>

      {/* ── File Overview ────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Generated Files</h2>
      <p className="text-muted-foreground mb-4 leading-relaxed">
        Actant exports the following files for Claude Code. All paths are relative to your project
        root.
      </p>
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
              <td className="p-3 font-mono text-xs">CLAUDE.md</td>
              <td className="p-3">Primary instructions (project context, conventions, commands)</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 font-mono text-xs">.claude/settings.json</td>
              <td className="p-3">Permissions (allow/deny lists for tools and commands)</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 font-mono text-xs">.mcp.json</td>
              <td className="p-3">MCP server definitions for external tools</td>
            </tr>
            <tr>
              <td className="p-3 font-mono text-xs">.claude/skills/*/SKILL.md</td>
              <td className="p-3">Reusable task-specific instruction sets</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── CLAUDE.md ────────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">CLAUDE.md</h2>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        This is the primary instructions file. Claude Code reads it from your project root on every
        invocation. It should describe your project, tech stack, coding conventions, directory
        structure, and available commands. Use Markdown headings and lists for structure.
      </p>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        Claude Code also supports{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">CLAUDE.md</code>{" "}
        files in subdirectories. When Claude Code operates on files within a subdirectory that has
        its own CLAUDE.md, those instructions are loaded in addition to the root file. This is
        useful for monorepos or projects with distinct subsections.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`## Project
Acme Dashboard - Internal analytics platform

Stack: Next.js 14 (App Router), TypeScript strict, Supabase, Tailwind CSS, shadcn/ui

## Commands
\`\`\`bash
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run lint         # ESLint check
npm run typecheck    # TypeScript type checking
npm run test         # Run Vitest test suite
npm run db:migrate   # Apply pending Supabase migrations
\`\`\`

## Structure
\`\`\`
src/
├── app/           # Next.js App Router pages and layouts
├── components/
│   ├── ui/        # shadcn/ui primitives (do not edit directly)
│   └── features/  # Feature-specific components
├── lib/           # Utilities, Supabase clients, helpers
├── hooks/         # Custom React hooks
├── types/         # TypeScript type definitions
└── services/      # Data access layer (Supabase queries)
\`\`\`

## Code Style
- TypeScript strict mode. Never use \`any\`.
- Named exports for all components and functions
- Functional components with arrow function syntax
- Tailwind CSS for styling. No CSS modules or inline styles.
- Zod for runtime validation of external data
- Radix Icons only (\`@radix-ui/react-icons\`)

## Database
- Supabase project ID: \`abc123\`
- All tables use Row Level Security (RLS)
- Use the server client (\`lib/supabase/server.ts\`) in Server Components
- Use the browser client (\`lib/supabase/client.ts\`) in Client Components
- Never expose service role keys in client code

## Git
- Branch naming: \`feature/[name]\` or \`fix/[name]\`
- Commits: \`type(scope): message\` (e.g. \`feat(auth): add GitHub OAuth\`)
- Run lint + typecheck before committing`}</code>
      </pre>

      {/* ── Permissions ──────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Permissions: .claude/settings.json</h2>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        The settings file controls which tools Claude Code can use and which commands it can
        execute. It uses two arrays:{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">allow</code> for
        permitted operations and{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">deny</code> for
        blocked operations. Deny rules always take precedence over allow rules.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npx *)",
      "Bash(git add *)",
      "Bash(git commit *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(ls *)",
      "Read",
      "Write",
      "Edit",
      "Glob",
      "Grep",
      "mcp__supabase__*",
      "mcp__context7__*"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force *)",
      "Bash(git reset --hard *)",
      "Bash(git checkout .)",
      "Bash(npm publish *)",
      "Bash(curl *)",
      "Bash(wget *)"
    ]
  }
}`}</code>
      </pre>
      <h3 className="text-base font-semibold mt-6 mb-2">Permission Patterns</h3>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        Permissions use a tool-name plus glob pattern format. The tool name comes first, followed by
        optional arguments in parentheses.
      </p>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            Bash(npm run *)
          </code>{" "}
          &mdash; allows any npm run command
        </li>
        <li>
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">Read</code>{" "}
          &mdash; allows reading any file (no arguments needed)
        </li>
        <li>
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            mcp__supabase__*
          </code>{" "}
          &mdash; allows all tools from the Supabase MCP server
        </li>
        <li>
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
            Bash(git push --force *)
          </code>{" "}
          &mdash; in the deny list, blocks force-pushing to any remote
        </li>
      </ul>
      <div className="bg-muted rounded-lg p-4 text-sm mt-4">
        <p className="text-amber-600 dark:text-amber-400 font-medium mb-2">Security note</p>
        <p className="text-muted-foreground">
          Always deny destructive commands like{" "}
          <code className="bg-background px-1.5 py-0.5 rounded text-sm">rm -rf</code>,{" "}
          <code className="bg-background px-1.5 py-0.5 rounded text-sm">git push --force</code>, and{" "}
          <code className="bg-background px-1.5 py-0.5 rounded text-sm">git reset --hard</code>.
          Deny network commands like curl and wget if your agent should not make external HTTP
          requests.
        </p>
      </div>

      {/* ── MCP Servers ──────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">MCP Servers: .mcp.json</h2>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        MCP servers extend Claude Code with external tools. Each server is a process that Claude
        Code spawns and communicates with via the Model Context Protocol. The{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">.mcp.json</code>{" "}
        file defines one or more servers with their commands, arguments, and environment variables.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`{
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
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-context7"]
    },
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@anthropic/mcp-server-postgres",
        "postgresql://user:pass@localhost:5432/mydb"
      ]
    }
  }
}`}</code>
      </pre>
      <h3 className="text-base font-semibold mt-6 mb-2">Server Configuration Fields</h3>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">command</code>{" "}
          &mdash; the executable to run (typically{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">npx</code>,{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">node</code>, or a
          path to a binary)
        </li>
        <li>
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">args</code>{" "}
          &mdash; array of command-line arguments passed to the server process
        </li>
        <li>
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">env</code>{" "}
          &mdash; object of environment variables available to the server process
        </li>
      </ul>
      <div className="bg-muted rounded-lg p-4 text-sm mt-4">
        <p className="text-amber-600 dark:text-amber-400 font-medium mb-2">Security note</p>
        <p className="text-muted-foreground">
          The .mcp.json file may contain sensitive tokens. Add it to your{" "}
          <code className="bg-background px-1.5 py-0.5 rounded text-sm">.gitignore</code> if it
          includes real credentials, or use environment variable references that resolve at runtime.
        </p>
      </div>

      {/* ── Skills ───────────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Skills</h2>
      <p className="text-muted-foreground mb-3 leading-relaxed">
        Skills are reusable, on-demand instruction sets that teach Claude Code how to perform
        specific tasks. Each skill lives in its own directory under{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">
          .claude/skills/
        </code>{" "}
        and contains a{" "}
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">SKILL.md</code>{" "}
        file. Claude Code discovers skills automatically and can invoke them when relevant to the
        task at hand.
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`.claude/
  skills/
    create-api-route/
      SKILL.md
    generate-migration/
      SKILL.md
    scaffold-component/
      SKILL.md`}</code>
      </pre>
      <p className="text-muted-foreground mt-4 mb-3 leading-relaxed">
        A skill file is plain Markdown with step-by-step instructions:
      </p>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto">
        <code>{`# Create API Route

Create a new Next.js API route with proper validation and error handling.

## Steps

1. Create the route file at \`src/app/api/[resource]/route.ts\`
2. Define a Zod schema for the request body in \`src/validations/[resource].ts\`
3. Implement the handler with try/catch error handling
4. Return typed responses using NextResponse.json()
5. Add the route to the API documentation in CLAUDE.md

## Template

\`\`\`typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  // define fields
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    // implementation
    return NextResponse.json({ data: validated }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
\`\`\`

## Conventions

- Always validate with Zod before processing
- Use descriptive error messages
- Return consistent response shapes: \`{ data }\` or \`{ error }\`
- Log errors server-side but do not expose internal details to clients`}</code>
      </pre>

      {/* ── Best Practices ───────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Best Practices</h2>
      <ul className="list-disc list-inside space-y-3 text-muted-foreground leading-relaxed">
        <li>
          <span className="text-foreground font-medium">
            Structure your CLAUDE.md with clear headings.
          </span>{" "}
          Use ## for major sections (Project, Commands, Structure, Code Style, Database, Git).
          Claude Code parses Markdown structure to find relevant context.
        </li>
        <li>
          <span className="text-foreground font-medium">
            List every command the agent might need.
          </span>{" "}
          Include dev, build, lint, test, typecheck, migration, and deployment commands. Without
          these, the agent will guess or ask.
        </li>
        <li>
          <span className="text-foreground font-medium">Be explicit about file placement.</span> A
          directory tree with short descriptions prevents the agent from creating files in the wrong
          location.
        </li>
        <li>
          <span className="text-foreground font-medium">Use deny permissions liberally.</span> Block
          destructive git operations, file deletion commands, and network requests by default. Add
          exceptions to the allow list as needed.
        </li>
        <li>
          <span className="text-foreground font-medium">Keep skills focused.</span> Each skill
          should cover one task. A skill for &ldquo;create API route&rdquo; should not also cover
          database migrations.
        </li>
        <li>
          <span className="text-foreground font-medium">Add MCP servers for your data layer.</span>{" "}
          If you use Supabase, add the Supabase MCP server. If you work with GitHub issues and PRs,
          add the GitHub MCP server. This gives the agent direct access instead of requiring manual
          copy-paste.
        </li>
      </ul>

      {/* ── Troubleshooting ──────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Troubleshooting</h2>
      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <p className="font-medium text-sm mb-1">Claude Code does not pick up my CLAUDE.md</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Ensure the file is named exactly{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">CLAUDE.md</code> (uppercase)
            and is in the project root. Claude Code reads it from the directory where you run the{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">claude</code> command.
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="font-medium text-sm mb-1">MCP server fails to start</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Check that the command is available in your PATH. For npx-based servers, ensure you have
            Node.js installed and a working internet connection for the first run. Verify
            environment variables are set correctly in the env object.
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="font-medium text-sm mb-1">Permission denied for a tool I allowed</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Deny rules take precedence over allow rules. Check if a broader deny pattern is matching
            the tool. For example, if you deny{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">Bash(git *)</code> but allow{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">Bash(git status)</code>, the
            deny pattern wins.
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="font-medium text-sm mb-1">Skills are not being discovered</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Ensure the directory structure is exactly{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
              .claude/skills/[name]/SKILL.md
            </code>
            . The SKILL.md file name must be uppercase. Each skill must be in its own subdirectory.
          </p>
        </div>
      </div>

      {/* ── How to Use ───────────────────────────────────────── */}
      <h2 className="text-xl font-semibold mt-10 mb-4">Installation</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed">
        <li>Export your configuration from the Actant Builder with Claude Code selected.</li>
        <li>Extract the downloaded zip into your project root directory.</li>
        <li>
          Add{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">.mcp.json</code>{" "}
          to your{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">.gitignore</code>{" "}
          if it contains real credentials.
        </li>
        <li>
          Run <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">claude</code>{" "}
          in your terminal to start Claude Code with your configuration loaded.
        </li>
      </ol>
      <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto mt-4">
        <code>{`# Verify your configuration files
ls -la CLAUDE.md .claude/settings.json .mcp.json .claude/skills/

# Start Claude Code
claude`}</code>
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
