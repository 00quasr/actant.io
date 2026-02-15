import { FadeIn } from "./fade-in";

const AGENTS = [
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
          <p className="text-center text-sm text-muted-foreground mb-6">
            One platform for all your AI coding agents
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {AGENTS.map((agent) => (
              <span
                key={agent.name}
                className="text-lg font-semibold tracking-tight text-foreground/40 transition-colors hover:text-foreground/70 sm:text-xl"
              >
                {agent.label}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
