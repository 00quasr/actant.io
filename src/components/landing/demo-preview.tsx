import { FadeIn } from "./fade-in";

export function DemoPreview() {
  return (
    <section className="px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Builder
          </p>
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Build your config visually
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-muted-foreground">
            A single builder interface for instructions, skills, MCP servers, and export settings.
          </p>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="mt-8 overflow-hidden rounded-lg border">
            {/* Mock builder header */}
            <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-muted-foreground/20" />
                <span className="size-2.5 rounded-full bg-muted-foreground/20" />
                <span className="size-2.5 rounded-full bg-muted-foreground/20" />
              </div>
              <span className="ml-2 text-xs text-muted-foreground">actant.io/builder</span>
            </div>

            <div className="grid sm:grid-cols-[180px_1fr]">
              {/* Mock sidebar */}
              <div className="hidden border-r sm:block">
                <div className="space-y-0.5 p-2">
                  {["Instructions", "Rules", "MCP Servers", "Permissions", "Skills"].map(
                    (tab, i) => (
                      <div
                        key={tab}
                        className={`rounded-md px-3 py-1.5 text-xs ${
                          i === 0 ? "bg-muted font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {tab}
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Mock content area */}
              <div className="p-4 sm:p-5">
                <div className="space-y-2">
                  <div className="text-xs font-medium">CLAUDE.md</div>
                  <div className="space-y-1.5 font-mono text-xs leading-relaxed text-muted-foreground">
                    <p>## Project</p>
                    <p>My App — Next.js 14, TypeScript, Tailwind</p>
                    <p className="mt-2">## Code Style</p>
                    <p>- TypeScript strict, no any</p>
                    <p>- Functional components</p>
                    <p>- Tailwind for styling</p>
                    <p className="mt-2">## Commands</p>
                    <p>
                      <span className="text-muted-foreground/60">```bash</span>
                    </p>
                    <p>npm run dev</p>
                    <p>npm run build</p>
                    <p>
                      <span className="text-muted-foreground/60">```</span>
                      <span className="inline-block w-px h-3.5 bg-foreground/70 ml-0.5 animate-pulse" />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
