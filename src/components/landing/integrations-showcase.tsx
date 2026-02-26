import { FadeIn } from "./fade-in";
import { AGENT_ICON_MAP, AGENT_BRAND_COLORS, type AgentName } from "@/components/icons/agent-icons";

const AGENTS: {
  name: AgentName;
  files: string[];
}[] = [
  {
    name: "Claude Code",
    files: ["CLAUDE.md", ".claude/settings.json", ".mcp.json", "commands/*.md", "agents/*.md"],
  },
  {
    name: "Cursor",
    files: [".cursorrules", ".cursor/rules/*.mdc", ".mcp.json"],
  },
  {
    name: "Windsurf",
    files: [".windsurfrules", ".windsurf/rules/rules.md"],
  },
  {
    name: "Cline",
    files: [".clinerules/*.md"],
  },
  {
    name: "OpenCode",
    files: ["opencode.json", "commands/*.md"],
  },
];

export function IntegrationsShowcase() {
  return (
    <section className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Native file output
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-muted-foreground">
            Every agent gets its own format. No wrappers, no adapters — just the files your agent
            expects.
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {AGENTS.map((agent, i) => {
            const Icon = AGENT_ICON_MAP[agent.name];
            const brandColor = AGENT_BRAND_COLORS[agent.name];
            return (
              <FadeIn key={agent.name} delay={i * 60}>
                <div className="rounded-xl border p-5 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
                  <div className="flex items-center gap-2">
                    <Icon
                      className="size-5 shrink-0"
                      style={{ color: brandColor } as React.CSSProperties}
                    />
                    <span className="text-sm font-semibold">{agent.name}</span>
                  </div>
                  <ul className="mt-4 space-y-1.5">
                    {agent.files.map((file) => (
                      <li
                        key={file}
                        className="flex items-center gap-2 text-xs font-mono text-muted-foreground"
                      >
                        <span className="size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                        {file}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
