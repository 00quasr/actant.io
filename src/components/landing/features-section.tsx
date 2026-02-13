import {
  Pencil2Icon,
  RocketIcon,
  Share2Icon,
  StackIcon,
} from "@radix-ui/react-icons";

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
    <section id="features" className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Everything you need
        </h2>
        <div className="mt-16 grid gap-12 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-3">
              <feature.icon className="size-5 text-foreground" />
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
