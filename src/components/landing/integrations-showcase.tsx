import { FadeIn } from "./fade-in";
import {
  AGENT_ICON_MAP,
  AGENT_BRAND_COLORS,
  type AgentName,
} from "@/components/icons/agent-icons";

const AGENTS: {
  name: AgentName;
  files: string[];
}[] = [
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
            Build your configuration once and export native files for every major AI coding agent.
          </p>
        </FadeIn>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {AGENTS.map((agent, i) => {
            const Icon = AGENT_ICON_MAP[agent.name];
            const brandColor = AGENT_BRAND_COLORS[agent.name];
            return (
              <FadeIn key={agent.name} delay={i * 60}>
                <div className="group h-full rounded-lg border bg-background transition-all duration-200 hover:border-foreground/20 hover:shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
                    <Icon
                      className="size-5 shrink-0 opacity-40 transition-opacity duration-200 group-hover:opacity-100"
                      style={{ color: brandColor } as React.CSSProperties}
                    />
                    <h3 className="text-sm font-semibold">{agent.name}</h3>
                  </div>
                  <div className="mx-3 mb-3 rounded-md bg-muted/50 px-3 py-2.5">
                    <div className="space-y-1">
                      {agent.files.map((file) => (
                        <div key={file} className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                          <span className="size-1 shrink-0 rounded-full bg-muted-foreground/30" />
                          {file}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
