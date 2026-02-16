import { FadeIn } from "./fade-in";

const AGENTS = [
  {
    name: "Claude Code",
    files: ["CLAUDE.md", "settings.json", ".mcp.json"],
  },
  {
    name: "Cursor",
    files: [".cursorrules", "rules/*.mdc", ".mcp.json"],
  },
  {
    name: "Windsurf",
    files: [".windsurfrules", "rules/rules.md"],
  },
  {
    name: "Cline",
    files: [".clinerules/*.md"],
  },
  {
    name: "OpenCode",
    files: ["opencode.json"],
  },
];

export function IntegrationsShowcase() {
  return (
    <section className="px-6 py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Integrations
          </p>
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            One config, five agents
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-muted-foreground">
            Build your configuration once and export native files for every
            major AI coding agent.
          </p>
        </FadeIn>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {AGENTS.map((agent, i) => (
            <FadeIn key={agent.name} delay={i * 60}>
              <div className="h-full rounded-lg border bg-background p-5 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
                <h3 className="text-sm font-semibold mb-3">{agent.name}</h3>
                <ul className="space-y-1">
                  {agent.files.map((file) => (
                    <li
                      key={file}
                      className="text-xs font-mono text-muted-foreground"
                    >
                      {file}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
