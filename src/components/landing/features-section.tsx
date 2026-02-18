import {
  Pencil2Icon,
  RocketIcon,
  Share2Icon,
  StackIcon,
  MagicWandIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";
import { FadeIn } from "./fade-in";

const FEATURES = [
  {
    icon: Pencil2Icon,
    title: "Visual Builder",
    description:
      "Configure instructions, skills, MCP servers, and permissions through an intuitive visual interface.",
  },
  {
    icon: RocketIcon,
    title: "Multi-Agent Export",
    description:
      "Export for Claude Code, Cursor, Windsurf, Cline, and OpenCode — all from a single config.",
  },
  {
    icon: MagicWandIcon,
    title: "AI Generation",
    description:
      "Describe your project and let AI generate a complete configuration with docs, rules, and MCP setup.",
  },
  {
    icon: Share2Icon,
    title: "Marketplace",
    description: "Publish your configs and discover community-curated setups for every stack.",
  },
  {
    icon: StackIcon,
    title: "Templates",
    description:
      "Start from pre-built templates for popular stacks — React, Python, DevOps, and more.",
  },
  {
    icon: DownloadIcon,
    title: "CLI Deploy",
    description: "Pull any config into your project with a single command: npx actant init.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Features
          </p>
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Everything you need to configure AI agents
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-muted-foreground">
            Build once, export everywhere. Actant handles the differences between agents.
          </p>
        </FadeIn>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 60}>
              <div className="group h-full rounded-lg border bg-background p-5 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
                <div className="flex size-9 items-center justify-center rounded-md bg-secondary mb-3">
                  <feature.icon className="size-4 text-foreground" />
                </div>
                <h3 className="text-sm font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
