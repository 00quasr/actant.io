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
      "Actant is a configuration platform for AI coding agents. It helps you build, share, and deploy configs for Claude Code, Cursor, Windsurf, Cline, and OpenCode through a visual builder, community marketplace, and CLI.",
  },
  {
    question: "What agents are supported?",
    answer:
      "Claude Code, Cursor, Windsurf, Cline, and OpenCode. Each gets native configuration files \u2014 CLAUDE.md for Claude Code, .cursorrules for Cursor, and so on.",
  },
  {
    question: "What are workflow commands and agent definitions?",
    answer:
      "Workflow commands are reusable slash commands that automate development tasks like planning, code review, or documentation. Agent definitions create specialized roles \u2014 planners, executors, verifiers \u2014 that work together on complex tasks.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes. The free plan includes up to 3 configs, 5 AI generations per month, and access to the community marketplace. The Pro plan adds unlimited configs, unlimited AI generation, and priority support.",
  },
  {
    question: "How does the CLI work?",
    answer:
      "Run npx actant init to pull any config into your project. The CLI detects your agent, downloads the config, and writes native files to your project directory. You can also push existing configs with npx actant push.",
  },
  {
    question: "Can I share my configs?",
    answer:
      "Yes. Publish your configs to the Actant marketplace for the community to discover, import, and build on. You can also export configs as downloadable ZIP files.",
  },
];

export function FaqSection() {
  return (
    <section className="px-6 py-24 sm:py-32">
      <FadeIn>
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>

          <Accordion
            type="single"
            collapsible
            className="mx-auto mt-14 max-w-2xl"
          >
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </FadeIn>
    </section>
  );
}
