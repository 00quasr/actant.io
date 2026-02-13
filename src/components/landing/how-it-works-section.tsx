import { FadeIn } from "./fade-in";

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
    <section className="bg-muted/30 px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            How It Works
          </p>
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Three simple steps
          </h2>
        </FadeIn>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <FadeIn key={step.number} delay={i * 100}>
              <div className="h-full rounded-lg border bg-background p-5 flex flex-col gap-3 transition-all duration-200 hover:border-foreground/20 hover:-translate-y-0.5">
                <span className="flex size-7 items-center justify-center rounded-full bg-foreground text-background text-xs font-medium">
                  {step.number}
                </span>
                <h3 className="text-sm font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
