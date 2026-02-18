"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FadeIn } from "./fade-in";

const FAQ_ITEMS = [
  {
    question: "What is Actant?",
    answer:
      "Actant is a platform to build, share, and export configurations for AI coding agents. It provides a visual builder, community marketplace, and CLI to manage configs for Claude Code, Cursor, Windsurf, Cline, and OpenCode.",
  },
  {
    question: "Which agents are supported?",
    answer:
      "Actant supports Claude Code, Cursor, Windsurf, Cline, and OpenCode. Each agent has its own native config format, and Actant generates the correct files for each one.",
  },
  {
    question: "Is Actant free?",
    answer:
      "Yes. The free tier includes up to 3 configs and 5 AI generations per month. The Pro plan ($10/month) unlocks unlimited configs, unlimited AI generation, and priority support.",
  },
  {
    question: "How does export work?",
    answer:
      "When you export a config, Actant generates the native config files for your selected agent. For example, Claude Code gets a CLAUDE.md and settings.json, while Cursor gets .cursorrules and .mdc rule files.",
  },
  {
    question: "Can I share my configs?",
    answer:
      "Absolutely. You can publish configs to the marketplace for others to discover and use, or share them directly via the CLI with npx actant init.",
  },
  {
    question: "What is the CLI?",
    answer:
      "The Actant CLI lets you pull any config into your project with a single command: npx actant init. It fetches the config from the marketplace and generates the correct files for your agent.",
  },
];

export function FaqSection() {
  return (
    <section className="px-6 py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            FAQ
          </p>
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Frequently asked questions
          </h2>
        </FadeIn>
        <FadeIn delay={100}>
          <Accordion type="single" collapsible className="mx-auto mt-12 max-w-2xl">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-sm font-medium text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </section>
  );
}
