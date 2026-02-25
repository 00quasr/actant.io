import { FadeIn } from "./fade-in";
import {
  AGENT_ICON_MAP,
  AGENT_BRAND_COLORS,
  type AgentName,
} from "@/components/icons/agent-icons";

const AGENT_NAMES: AgentName[] = [
  "Claude Code",
  "Cursor",
  "Windsurf",
  "Cline",
  "OpenCode",
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            Configs, workflows, and agent definitions — built visually, exported
            everywhere.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {/* Visual Builder — spans 2 cols */}
          <FadeIn delay={0} className="lg:col-span-2">
            <div className="group h-full rounded-xl border p-6 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
              <h3 className="text-base font-semibold">Visual Builder</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Eight-tab builder for instructions, skills, MCP servers,
                permissions, rules, commands, agents, and docs.
              </p>

              {/* Mini mockup */}
              <div className="mt-5 rounded-lg border bg-muted/30 overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b">
                  <span className="size-2 rounded-full bg-foreground/10" />
                  <span className="size-2 rounded-full bg-foreground/10" />
                  <span className="size-2 rounded-full bg-foreground/10" />
                </div>
                <div className="flex items-center gap-0 border-b px-3">
                  {[
                    "Instructions",
                    "Skills",
                    "MCP",
                    "Permissions",
                    "Rules",
                    "Cmds",
                    "Agents",
                    "Docs",
                  ].map((tab) => (
                    <span
                      key={tab}
                      className={`px-2 py-1.5 text-[10px] font-medium ${
                        tab === "Instructions"
                          ? "border-b border-foreground text-foreground"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {tab}
                    </span>
                  ))}
                </div>
                <div className="p-3 space-y-1.5">
                  <div className="h-1.5 w-24 rounded bg-foreground/10" />
                  <div className="h-1.5 w-40 rounded bg-foreground/8" />
                  <div className="h-1.5 w-32 rounded bg-foreground/8" />
                  <div className="h-1.5 w-20 rounded bg-foreground/6" />
                </div>
              </div>
            </div>
          </FadeIn>

          {/* AI Generation */}
          <FadeIn delay={60}>
            <div className="group h-full rounded-xl border p-6 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
              <h3 className="text-base font-semibold">AI Generation</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Describe your project and let AI generate a complete config with
                workflow commands and agent definitions.
              </p>
            </div>
          </FadeIn>

          {/* Multi-Agent Export */}
          <FadeIn delay={120}>
            <div className="group h-full rounded-xl border p-6 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
              <h3 className="text-base font-semibold">Multi-Agent Export</h3>
              <p className="text-sm text-muted-foreground mt-2">
                One config, five agents. Export native files for Claude Code,
                Cursor, Windsurf, Cline, and OpenCode.
              </p>
              <div className="mt-4 flex items-center gap-3">
                {AGENT_NAMES.map((name) => {
                  const Icon = AGENT_ICON_MAP[name];
                  const brandColor = AGENT_BRAND_COLORS[name];
                  return (
                    <Icon
                      key={name}
                      className="size-4 opacity-40"
                      style={{ color: brandColor } as React.CSSProperties}
                    />
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Workflow Builder */}
          <FadeIn delay={180}>
            <div className="group h-full rounded-xl border p-6 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
              <h3 className="text-base font-semibold">Workflow Builder</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Define slash commands and specialized agent roles — planners,
                executors, verifiers, researchers.
              </p>
            </div>
          </FadeIn>

          {/* Marketplace */}
          <FadeIn delay={240}>
            <div className="group h-full rounded-xl border p-6 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
              <h3 className="text-base font-semibold">Marketplace</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Browse and import community-curated configs and workflows.
                Publish your own for others to use.
              </p>
            </div>
          </FadeIn>

          {/* CLI Deploy — spans full width */}
          <FadeIn delay={300} className="lg:col-span-3">
            <div className="group rounded-xl border overflow-hidden transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
              <div className="grid sm:grid-cols-[1fr_auto] items-center">
                <div className="p-6">
                  <h3 className="text-base font-semibold">CLI Deploy</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Pull any config into your project with one command. Analyze
                    your existing setup and push configs back.
                  </p>
                </div>
                <div className="px-6 pb-6 sm:pb-0 sm:pr-8">
                  <div className="rounded-lg bg-foreground px-5 py-4 min-w-[280px]">
                    <div className="space-y-1.5 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-background/40">$</span>
                        <span className="text-background/90">
                          npx actant init
                        </span>
                      </div>
                      <p className="text-background/40">
                        Detecting project...
                      </p>
                      <p className="text-background/40">
                        Found: Next.js + TypeScript
                      </p>
                      <p className="text-background/50">
                        Writing CLAUDE.md
                      </p>
                      <p className="text-background/50">
                        Writing .cursorrules
                      </p>
                      <p className="text-background/60">
                        Done. 5 files written.
                      </p>
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
