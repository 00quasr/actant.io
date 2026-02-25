import { FadeIn } from "./fade-in";
import {
  AGENT_ICON_MAP,
  AGENT_BRAND_COLORS,
  type AgentName,
} from "@/components/icons/agent-icons";

const AGENTS: AgentName[] = [
  "Claude Code",
  "Cursor",
  "Windsurf",
  "Cline",
  "OpenCode",
];

export function SocialProof() {
  return (
    <section className="bg-muted/30 px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-center text-sm text-muted-foreground mb-8">
            Works with
          </p>
          <div className="flex items-center justify-center gap-8 sm:gap-12">
            {AGENTS.map((name) => {
              const Icon = AGENT_ICON_MAP[name];
              const brandColor = AGENT_BRAND_COLORS[name];
              return (
                <div
                  key={name}
                  className="flex flex-col items-center gap-2"
                >
                  <Icon
                    className="size-6 shrink-0"
                    style={{ color: brandColor } as React.CSSProperties}
                  />
                  <span className="text-xs text-muted-foreground">
                    {name}
                  </span>
                </div>
              );
            })}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
