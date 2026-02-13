const STEPS = [
  {
    number: "1",
    title: "Choose your agent",
    description:
      "Select from Claude Code, Cursor, Windsurf, Cline, or OpenCode.",
  },
  {
    number: "2",
    title: "Configure everything",
    description:
      "Set instructions, skills, MCP servers, permissions, and more.",
  },
  {
    number: "3",
    title: "Export and build",
    description:
      "Export your configuration file and start building with your agent.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          How it works
        </h2>
        <div className="mt-16 grid gap-12 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="flex flex-col gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                {step.number}
              </span>
              <h3 className="text-base font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
