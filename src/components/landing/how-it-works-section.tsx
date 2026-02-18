import { FadeIn } from "./fade-in";

const STEPS = [
  {
    number: "1",
    title: "Choose your agent",
    description:
      "Select from Claude Code, Cursor, Windsurf, Cline, or OpenCode. Each has its own config format — Actant knows them all.",
  },
  {
    number: "2",
    title: "Configure everything",
    description:
      "Use the visual builder or AI generation to set up instructions, rules, MCP servers, permissions, and skills.",
  },
  {
    number: "3",
    title: "Export and deploy",
    description:
      "Download your config files, publish to the marketplace, or pull into any project with npx actant init.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="px-6 py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            How It Works
          </p>
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Three simple steps
          </h2>
        </FadeIn>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <FadeIn key={step.number} delay={i * 100}>
              <div className="relative h-full rounded-lg border bg-background p-6 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
                <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold mb-4">
                  {step.number}
                </span>
                <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
