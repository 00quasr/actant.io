const AGENTS = [
  "Claude Code",
  "Cursor",
  "Windsurf",
  "Cline",
  "OpenCode",
];

export function AgentsShowcase() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Works with your favorite agents
        </h2>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          {AGENTS.map((agent) => (
            <span
              key={agent}
              className="rounded-md border px-4 py-2 text-sm text-muted-foreground"
            >
              {agent}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
