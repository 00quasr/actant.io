import { FadeIn } from "./fade-in";
import { AGENT_ICON_MAP, AGENT_BRAND_COLORS, type AgentName } from "@/components/icons/agent-icons";

const AGENTS: { name: AgentName; label: string }[] = [
  { name: "Claude Code", label: "Claude Code" },
  { name: "Cursor", label: "Cursor" },
  { name: "Windsurf", label: "Windsurf" },
  { name: "Cline", label: "Cline" },
  { name: "OpenCode", label: "OpenCode" },
];

export function SocialProof() {
  return (
    <section className="px-6 pt-16 pb-8 sm:pt-20 sm:pb-12">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-center text-sm text-muted-foreground mb-8">
            One platform for all your AI coding agents
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {AGENTS.map((agent) => {
              const Icon = AGENT_ICON_MAP[agent.name];
              const brandColor = AGENT_BRAND_COLORS[agent.name];
              return (
                <span
                  key={agent.name}
                  className="group inline-flex items-center gap-2.5 transition-opacity duration-200 opacity-40 hover:opacity-100"
                >
                  <Icon
                    className="size-5 shrink-0 transition-colors duration-200"
                    style={{ color: brandColor } as React.CSSProperties}
                  />
                  <span className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                    {agent.label}
                  </span>
                </span>
              );
            })}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
