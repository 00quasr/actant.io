import { FadeIn } from "./fade-in";
import { AGENT_ICON_MAP, AGENT_BRAND_COLORS, type AgentName } from "@/components/icons/agent-icons";

const AGENT_NAMES: AgentName[] = ["Claude Code", "Cursor", "Windsurf", "Cline", "OpenCode"];

const CONFIG_TABS = ["Instructions", "Rules", "MCP Servers", "Permissions", "Skills"];

export function HowItWorksSection() {
  return (
    <section className="px-6 py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            How It Works
          </p>
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Three simple steps
          </h2>
        </FadeIn>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {/* Step 1: Choose your agent */}
          <FadeIn delay={0}>
            <div className="relative h-full rounded-lg border bg-background overflow-hidden transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
              <div className="p-6">
                <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold mb-4">
                  1
                </span>
                <h3 className="text-base font-semibold mb-2">Choose your agent</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Select your AI coding agent. Each has its own config format — Actant knows them
                  all.
                </p>
              </div>
              <div className="mx-4 mb-4 rounded-md bg-muted/50 px-4 py-3">
                <div className="flex items-center justify-between">
                  {AGENT_NAMES.map((name) => {
                    const Icon = AGENT_ICON_MAP[name];
                    const brandColor = AGENT_BRAND_COLORS[name];
                    return (
                      <div key={name} className="flex flex-col items-center gap-1.5">
                        <Icon
                          className="size-4 opacity-60"
                          style={{ color: brandColor } as React.CSSProperties}
                        />
                        <span className="text-[9px] text-muted-foreground leading-none">
                          {name.split(" ").pop()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Step 2: Configure everything */}
          <FadeIn delay={100}>
            <div className="relative h-full rounded-lg border bg-background overflow-hidden transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
              <div className="p-6">
                <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold mb-4">
                  2
                </span>
                <h3 className="text-base font-semibold mb-2">Configure everything</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Use the visual builder or AI generation to set up your entire agent config.
                </p>
              </div>
              <div className="mx-4 mb-4 rounded-md bg-muted/50 px-3 py-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {CONFIG_TABS.map((tab) => (
                    <span
                      key={tab}
                      className="rounded bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground border"
                    >
                      {tab}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Step 3: Export and deploy */}
          <FadeIn delay={200}>
            <div className="relative h-full rounded-lg border bg-background overflow-hidden transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
              <div className="p-6">
                <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold mb-4">
                  3
                </span>
                <h3 className="text-base font-semibold mb-2">Export and deploy</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Download your config, publish to the marketplace, or pull into any project.
                </p>
              </div>
              <div className="mx-4 mb-4 rounded-md bg-foreground px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-background/50">$</span>
                  <code className="text-[11px] font-mono text-background/80">npx actant init</code>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
