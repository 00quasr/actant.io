"use client";

import {
  Settings,
  Layers,
  Sparkles,
  Share2,
  Terminal,
} from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { FadeIn } from "./fade-in";

const workflowData = [
  {
    id: 1,
    title: "Choose Agent",
    date: "Step 1",
    content:
      "Pick your AI coding agent — Claude Code, Cursor, Windsurf, Cline, or OpenCode.",
    category: "Setup",
    icon: Settings,
    relatedIds: [2],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "Build Config",
    date: "Step 2",
    content:
      "Use the visual builder or AI generation to configure instructions, skills, MCP servers, and permissions.",
    category: "Build",
    icon: Layers,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 85,
  },
  {
    id: 3,
    title: "AI Enhance",
    date: "Step 3",
    content:
      "Let AI refine your config with smart suggestions, best practices, and optimized rules.",
    category: "Enhance",
    icon: Sparkles,
    relatedIds: [2, 4],
    status: "in-progress" as const,
    energy: 65,
  },
  {
    id: 4,
    title: "Share & Publish",
    date: "Step 4",
    content:
      "Publish to the marketplace for others to discover, or share directly with your team.",
    category: "Share",
    icon: Share2,
    relatedIds: [3, 5],
    status: "pending" as const,
    energy: 40,
  },
  {
    id: 5,
    title: "Deploy via CLI",
    date: "Step 5",
    content:
      "Pull any config into your project instantly with npx actant init.",
    category: "Deploy",
    icon: Terminal,
    relatedIds: [4],
    status: "pending" as const,
    energy: 20,
  },
];

export function WorkflowTimelineSection() {
  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Workflow
          </p>
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            From config to deploy
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-muted-foreground">
            Click any node to explore how Actant takes you from setup to
            production.
          </p>
        </FadeIn>
      </div>
      <FadeIn delay={100}>
        <div className="relative mx-auto mt-8 h-[550px] max-w-4xl overflow-hidden rounded-xl border bg-muted/30">
          <RadialOrbitalTimeline timelineData={workflowData} />
        </div>
      </FadeIn>
    </section>
  );
}
