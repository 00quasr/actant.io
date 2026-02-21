import { FadeIn } from "./fade-in";
import { AGENT_ICON_MAP, AGENT_BRAND_COLORS, type AgentName } from "@/components/icons/agent-icons";

const AGENT_NAMES: AgentName[] = ["Claude Code", "Cursor", "Windsurf", "Cline", "OpenCode"];

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Features
          </p>
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Everything you need to configure AI agents
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-muted-foreground">
            Build once, export everywhere. Actant handles the differences between agents.
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Visual Builder — large card */}
          <FadeIn delay={0} className="sm:col-span-2">
            <div className="group h-full rounded-lg border bg-background overflow-hidden transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
              <div className="grid sm:grid-cols-2 h-full">
                <div className="p-6">
                  <h3 className="text-base font-semibold mb-2">Visual Builder</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Configure instructions, skills, MCP servers, and permissions through an
                    intuitive visual interface. No YAML, no guesswork.
                  </p>
                </div>
                <div className="hidden sm:flex items-end justify-center bg-muted/30 p-4 pt-6">
                  <div className="w-full rounded-t-md border border-b-0 bg-background shadow-sm overflow-hidden">
                    <div className="border-b px-3 py-1.5 flex gap-1">
                      <span className="size-2 rounded-full bg-foreground/10" />
                      <span className="size-2 rounded-full bg-foreground/10" />
                      <span className="size-2 rounded-full bg-foreground/10" />
                    </div>
                    <div className="grid grid-cols-[80px_1fr] divide-x">
                      <div className="p-2 space-y-1">
                        {["Instructions", "Rules", "MCP", "Perms"].map((t, i) => (
                          <div
                            key={t}
                            className={`rounded px-1.5 py-0.5 text-[8px] ${i === 0 ? "bg-secondary font-medium text-foreground" : "text-muted-foreground"}`}
                          >
                            {t}
                          </div>
                        ))}
                      </div>
                      <div className="p-2 space-y-1">
                        <div className="h-1.5 w-16 rounded bg-foreground/10" />
                        <div className="h-1.5 w-24 rounded bg-foreground/10" />
                        <div className="h-1.5 w-20 rounded bg-foreground/10" />
                        <div className="h-1.5 w-12 rounded bg-foreground/10" />
                        <div className="h-1.5 w-28 rounded bg-foreground/10" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* AI Generation */}
          <FadeIn delay={60}>
            <div className="group h-full rounded-lg border bg-background p-6 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
              <h3 className="text-base font-semibold mb-2">AI Generation</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Describe your project and let AI generate a complete configuration with docs, rules,
                and MCP setup.
              </p>
            </div>
          </FadeIn>

          {/* Multi-Agent Export */}
          <FadeIn delay={120}>
            <div className="group h-full rounded-lg border bg-background p-6 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
              <h3 className="text-base font-semibold mb-2">Multi-Agent Export</h3>
              <p className="text-sm leading-relaxed text-muted-foreground mb-4">
                Export for every major AI coding agent from a single config.
              </p>
              <div className="flex items-center gap-2.5">
                {AGENT_NAMES.map((name) => {
                  const Icon = AGENT_ICON_MAP[name];
                  const brandColor = AGENT_BRAND_COLORS[name];
                  return (
                    <Icon
                      key={name}
                      className="size-3.5 opacity-40"
                      style={{ color: brandColor } as React.CSSProperties}
                    />
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Marketplace */}
          <FadeIn delay={180}>
            <div className="group h-full rounded-lg border bg-background p-6 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
              <h3 className="text-base font-semibold mb-2">Marketplace</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Publish your configs and discover community-curated setups for every stack.
              </p>
            </div>
          </FadeIn>

          {/* Templates */}
          <FadeIn delay={240}>
            <div className="group h-full rounded-lg border bg-background p-6 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
              <h3 className="text-base font-semibold mb-2">Templates</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Start from pre-built templates for popular stacks — React, Python, DevOps, and more.
              </p>
            </div>
          </FadeIn>

          {/* CLI Deploy — wide card */}
          <FadeIn delay={300} className="sm:col-span-2 lg:col-span-3">
            <div className="group rounded-lg border bg-background overflow-hidden transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
              <div className="grid sm:grid-cols-[1fr_auto] items-center">
                <div className="p-6">
                  <h3 className="text-base font-semibold mb-2">CLI Deploy</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Pull any config into your project with a single command. Works with any agent,
                    any project.
                  </p>
                </div>
                <div className="px-6 pb-6 sm:pb-0 sm:pr-8">
                  <div className="rounded-md bg-foreground px-4 py-3 min-w-[220px]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-background/40">$</span>
                      <code className="text-xs font-mono text-background/80">npx actant init</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
