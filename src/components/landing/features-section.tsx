import {
  Pencil2Icon,
  RocketIcon,
  Share2Icon,
  StackIcon,
} from "@radix-ui/react-icons";
import { FadeIn } from "./fade-in";

const FEATURES = [
  {
    icon: Pencil2Icon,
    title: "Visual Builder",
    description:
      "Configure instructions, skills, MCP servers, and permissions in one place.",
  },
  {
    icon: RocketIcon,
    title: "Multi-Agent Export",
    description:
      "Export for Claude Code, Cursor, Windsurf, Cline, and OpenCode.",
  },
  {
    icon: Share2Icon,
    title: "Skill Marketplace",
    description:
      "Browse and share community-built skills and configurations.",
  },
  {
    icon: StackIcon,
    title: "Templates",
    description:
      "Start with pre-built templates for your stack and use case.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-muted/30 px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Features
          </p>
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Everything you need
          </h2>
        </FadeIn>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 80}>
              <div className="h-full rounded-lg border bg-background p-5 flex gap-4 transition-all duration-200 hover:border-foreground/20 hover:-translate-y-0.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                  <feature.icon className="size-4 text-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
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
