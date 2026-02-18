import { FadeIn } from "./fade-in";

const AGENTS = ["Claude Code", "Cursor", "Windsurf", "Cline", "OpenCode"];

export function AgentsShowcase() {
  return (
    <section className="px-6 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {AGENTS.map((agent) => (
              <span
                key={agent}
                className="rounded-md border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
              >
                {agent}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
