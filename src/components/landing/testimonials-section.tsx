import { FadeIn } from "./fade-in";

const TESTIMONIALS = [
  {
    quote:
      "Setting up CLAUDE.md for every project was tedious. Actant lets me build once and reuse everywhere.",
    name: "Alex Chen",
    role: "Senior Developer",
  },
  {
    quote:
      "The marketplace saved us hours. We found a config for our exact stack and had it running in minutes.",
    name: "Sarah Kim",
    role: "Engineering Lead",
  },
  {
    quote:
      "Being able to export the same config to Cursor and Claude Code is a game-changer for our team.",
    name: "Marcus Rivera",
    role: "DevOps Engineer",
  },
];

export function TestimonialsSection() {
  return (
    <section className="px-6 py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Testimonials
          </p>
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            What developers say
          </h2>
        </FadeIn>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((testimonial, i) => (
            <FadeIn key={testimonial.name} delay={i * 80}>
              <div className="h-full rounded-lg border bg-background p-6 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
                <p className="text-sm italic leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-4">
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
