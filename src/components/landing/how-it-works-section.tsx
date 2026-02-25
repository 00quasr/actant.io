import { FadeIn } from "./fade-in";

const STEPS = [
  {
    number: 1,
    title: "Choose your agent",
    description:
      "Pick from Claude Code, Cursor, Windsurf, Cline, or OpenCode. Each gets native config files.",
  },
  {
    number: 2,
    title: "Build your config",
    description:
      "Use the visual builder, import a template, or generate with AI. Add MCP servers, rules, commands, and agents.",
  },
  {
    number: 3,
    title: "Export and deploy",
    description:
      "Download files, publish to the marketplace, or pull directly into your project with the CLI.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="px-6 py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-sm text-muted-foreground">
            From zero to deployed config in three steps.
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <FadeIn key={step.number} delay={i * 100}>
              <div className="rounded-xl border p-6 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
                <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background text-sm font-bold">
                  {step.number}
                </span>
                <h3 className="text-base font-semibold mt-4">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">
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
