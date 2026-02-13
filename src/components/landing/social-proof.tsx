import { FadeIn } from "./fade-in";

const STATS = [
  { value: "5", label: "Agents Supported" },
  { value: "20+", label: "Templates" },
  { value: "15+", label: "MCP Providers" },
  { value: "12+", label: "Config Files" },
];

const TESTIMONIALS = [
  {
    quote:
      "Finally, a single place to manage all my agent configs. Switching between Claude Code and Cursor is seamless now.",
    name: "Sarah Chen",
    role: "Senior Engineer at Vercel",
  },
  {
    quote:
      "The template library saved me hours of setup. I had my team's Windsurf config ready in minutes.",
    name: "Marcus Rodriguez",
    role: "Tech Lead at Linear",
  },
  {
    quote:
      "Being able to export the same config to multiple agents is a game changer for our team.",
    name: "Anja Petrova",
    role: "Staff Engineer at Stripe",
  },
];

export function SocialProof() {
  return (
    <section className="px-6 py-14 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <div className="rounded-lg border bg-card p-6 sm:p-8">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((testimonial, i) => (
            <FadeIn key={testimonial.name} delay={i * 100}>
              <div className="h-full rounded-lg border p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:border-foreground/20 hover:-translate-y-0.5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-medium">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
