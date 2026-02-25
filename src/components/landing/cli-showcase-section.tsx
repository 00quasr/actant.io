"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FadeIn } from "./fade-in";

const COMMAND = "npx actant init";
const TYPE_SPEED = 60;
const PAUSE_AFTER_TYPING = 800;
const LINE_DELAY = 100;
const PAUSE_BEFORE_RESTART = 3000;

const OUTPUT_LINES = [
  "\u2713 Detected Claude Code project",
  "\u2713 Found CLAUDE.md, .mcp.json, 3 commands, 2 agents",
  '\u2713 Pulling config: "fullstack-nextjs"',
  "\u2713 Writing CLAUDE.md",
  "\u2713 Writing .claude/settings.json",
  "\u2713 Writing .claude/commands/plan.md",
  "\u2713 Writing .claude/commands/execute.md",
  "\u2713 Writing .claude/agents/researcher.md",
  "",
  "Done. Config applied successfully.",
];

type Phase = "typing" | "pause" | "output" | "done";

export function CliShowcaseSection() {
  const [phase, setPhase] = useState<Phase>("typing");
  const [typedChars, setTypedChars] = useState(0);
  const [outputLines, setOutputLines] = useState(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Start animation when section scrolls into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const restart = useCallback(() => {
    setPhase("typing");
    setTypedChars(0);
    setOutputLines(0);
  }, []);

  // Phase: typing command one char at a time
  useEffect(() => {
    if (!visible || phase !== "typing") return;
    if (typedChars >= COMMAND.length) {
      const timeout = setTimeout(() => setPhase("pause"), 200);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(
      () => setTypedChars((c) => c + 1),
      TYPE_SPEED + Math.random() * 30,
    );
    return () => clearTimeout(timeout);
  }, [visible, phase, typedChars]);

  // Phase: pause after typing before showing output
  useEffect(() => {
    if (phase !== "pause") return;
    const timeout = setTimeout(() => setPhase("output"), PAUSE_AFTER_TYPING);
    return () => clearTimeout(timeout);
  }, [phase]);

  // Phase: show output lines one by one
  useEffect(() => {
    if (phase !== "output") return;
    if (outputLines >= OUTPUT_LINES.length) {
      const timeout = setTimeout(() => setPhase("done"), PAUSE_BEFORE_RESTART);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(
      () => setOutputLines((l) => l + 1),
      LINE_DELAY,
    );
    return () => clearTimeout(timeout);
  }, [phase, outputLines]);

  // Phase: done, restart the loop
  useEffect(() => {
    if (phase !== "done") return;
    const timeout = setTimeout(restart, 500);
    return () => clearTimeout(timeout);
  }, [phase, restart]);

  const showOutput = phase === "output" || phase === "done";

  return (
    <section ref={sectionRef} className="bg-muted/30 px-6 py-24 sm:py-32">
      <FadeIn>
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            One command to ship
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            Pull any config into your project. Analyze your setup. Push configs
            to the cloud.
          </p>

          {/* Terminal mockup */}
          <div className="mx-auto mt-14 max-w-2xl overflow-hidden rounded-xl border">
            {/* Title bar */}
            <div className="flex h-8 items-center gap-1.5 bg-muted/50 px-4">
              <div className="size-2.5 rounded-full bg-foreground/20" />
              <div className="size-2.5 rounded-full bg-foreground/20" />
              <div className="size-2.5 rounded-full bg-foreground/20" />
            </div>

            {/* Terminal body */}
            <div className="min-h-[280px] bg-foreground p-6 font-mono text-sm text-background">
              {/* Command line */}
              <div className="flex items-center">
                <span className="mr-2 text-background/40">$</span>
                <span>{COMMAND.slice(0, typedChars)}</span>
                {!showOutput && (
                  <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-background/70" />
                )}
              </div>

              {/* Output lines */}
              {showOutput && (
                <div className="mt-4 space-y-0.5">
                  {OUTPUT_LINES.slice(0, outputLines).map((line, i) => (
                    <div
                      key={i}
                      className={
                        line.startsWith("Done")
                          ? "mt-2 font-medium text-background/90"
                          : line === ""
                            ? "h-4"
                            : "text-background/60"
                      }
                    >
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Push snippet */}
          <div className="mx-auto mt-10 max-w-2xl">
            <p className="text-center text-sm text-muted-foreground">
              Already have a config?{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
                npx actant push
              </code>{" "}
              uploads your local config files to the cloud for backup and
              sharing.
            </p>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
