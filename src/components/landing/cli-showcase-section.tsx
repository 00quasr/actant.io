"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FadeIn } from "./fade-in";

const ASCII_LOGO = `    _   ___ _____ _   _  _ _____
   /_\\ / __|_   _/_\\ | \\| |_   _|
  / _ \\ (__  | |/ _ \\| .\`| | |
 /_/ \\_\\___| |_/_/ \\_\\_|\\_| |_|`;

const MENU_ITEMS = [
  { label: "Analyze Project", description: "Scan project structure and tools" },
  { label: "Generate Docs", description: "Generate documentation with AI" },
  { label: "Pull Config", description: "Pull a config from Actant" },
  { label: "Push Config", description: "Push local config to Actant" },
  { label: "My Configs", description: "List saved configurations" },
];

const ANALYZE_OUTPUT = [
  "Scanning project structure...",
  "",
  "  Framework:    Next.js 14 (App Router)",
  "  Language:     TypeScript (strict)",
  "  Styling:      Tailwind CSS + shadcn/ui",
  "  Database:     Supabase (Postgres)",
  "  Package Mgr:  npm",
  "",
  "  Found: 47 components, 12 routes, 6 API endpoints",
  "  Config files: CLAUDE.md, .cursorrules",
  "",
  "✓ Analysis complete",
];

const TYPE_SPEED = 60;
const LINE_DELAY = 80;
const MENU_CYCLE_SPEED = 600;
const PAUSE_BEFORE_SELECT = 800;
const PAUSE_AFTER_OUTPUT = 3000;

type Phase = "typing" | "logo" | "menu-cycle" | "menu-pause" | "output" | "output-done";

export function CliShowcaseSection() {
  const [phase, setPhase] = useState<Phase>("typing");
  const [typedChars, setTypedChars] = useState(0);
  const [activeItem, setActiveItem] = useState(0);
  const [outputLines, setOutputLines] = useState(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const command = "npx actant";

  // Start animation when section is in view
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
    setActiveItem(0);
    setOutputLines(0);
  }, []);

  // Phase: typing "npx actant"
  useEffect(() => {
    if (!visible || phase !== "typing") return;
    if (typedChars >= command.length) {
      const timeout = setTimeout(() => setPhase("logo"), 400);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setTypedChars((c) => c + 1), TYPE_SPEED + Math.random() * 40);
    return () => clearTimeout(timeout);
  }, [visible, phase, typedChars, command.length]);

  // Phase: show logo then go to menu
  useEffect(() => {
    if (phase !== "logo") return;
    const timeout = setTimeout(() => setPhase("menu-cycle"), 600);
    return () => clearTimeout(timeout);
  }, [phase]);

  // Phase: cycle through menu items
  useEffect(() => {
    if (phase !== "menu-cycle") return;
    if (activeItem >= MENU_ITEMS.length - 1) {
      // Cycle back to first item (Analyze Project)
      const timeout = setTimeout(() => {
        setActiveItem(0);
        setPhase("menu-pause");
      }, MENU_CYCLE_SPEED);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setActiveItem((i) => i + 1), MENU_CYCLE_SPEED);
    return () => clearTimeout(timeout);
  }, [phase, activeItem]);

  // Phase: pause on Analyze Project before selecting
  useEffect(() => {
    if (phase !== "menu-pause") return;
    const timeout = setTimeout(() => setPhase("output"), PAUSE_BEFORE_SELECT);
    return () => clearTimeout(timeout);
  }, [phase]);

  // Phase: output lines appearing one by one
  useEffect(() => {
    if (phase !== "output") return;
    if (outputLines >= ANALYZE_OUTPUT.length) {
      const timeout = setTimeout(() => setPhase("output-done"), PAUSE_AFTER_OUTPUT);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setOutputLines((l) => l + 1), LINE_DELAY);
    return () => clearTimeout(timeout);
  }, [phase, outputLines]);

  // Phase: done — restart loop
  useEffect(() => {
    if (phase !== "output-done") return;
    const timeout = setTimeout(restart, 500);
    return () => clearTimeout(timeout);
  }, [phase, restart]);

  const showPrompt = phase === "typing";
  const showLogo = phase !== "typing";
  const showMenu = phase !== "typing" && phase !== "logo";
  const showOutput = phase === "output" || phase === "output-done";

  return (
    <section ref={sectionRef} className="px-6 py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            CLI
          </p>
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            One command to get started
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-muted-foreground">
            Analyze your project, generate docs, and manage configs — all from the terminal.
          </p>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-xl border border-foreground/10 bg-foreground shadow-2xl">
            {/* Title bar */}
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-white/20" />
                <div className="h-3 w-3 rounded-full bg-white/20" />
                <div className="h-3 w-3 rounded-full bg-white/20" />
              </div>
              <span className="ml-2 text-xs text-white/40 font-mono">terminal</span>
              <span className="ml-auto text-xs text-white/30 font-mono">
                {showLogo ? "authenticated" : ""}
              </span>
            </div>

            {/* Terminal body */}
            <div className="p-6 font-mono text-sm min-h-[320px]">
              {/* Typing phase: $ npx actant */}
              {showPrompt && (
                <div className="flex items-center text-white/80">
                  <span className="text-white/40 mr-2">$</span>
                  <span>{command.slice(0, typedChars)}</span>
                  <span className="inline-block w-2 h-4 bg-white/70 ml-0.5 animate-pulse" />
                </div>
              )}

              {/* Logo + tagline */}
              {showLogo && (
                <div
                  className="transition-opacity duration-300"
                  style={{ opacity: showLogo ? 1 : 0 }}
                >
                  <pre className="text-white/60 text-xs leading-tight mb-1">{ASCII_LOGO}</pre>
                  <p className="text-white/40 text-xs mb-5">Configure AI coding agents</p>
                </div>
              )}

              {/* Menu */}
              {showMenu && !showOutput && (
                <div className="space-y-0.5">
                  {MENU_ITEMS.map((item, i) => {
                    const isActive = i === activeItem;
                    return (
                      <div
                        key={item.label}
                        className={`flex items-center rounded px-2 py-1 transition-colors duration-150 ${
                          isActive ? "bg-white/10" : ""
                        }`}
                      >
                        <span className={`mr-2 ${isActive ? "text-white/90" : "text-transparent"}`}>
                          &gt;
                        </span>
                        <span
                          className={`w-40 ${isActive ? "text-white font-medium" : "text-white/50"}`}
                        >
                          {item.label}
                        </span>
                        <span className={isActive ? "text-white/40" : "text-white/25"}>
                          {item.description}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Output */}
              {showOutput && (
                <div className="space-y-0">
                  <div className="flex items-center text-white/40 text-xs mb-3">
                    <span className="mr-2">$</span>
                    <span>actant analyze</span>
                  </div>
                  {ANALYZE_OUTPUT.slice(0, outputLines).map((line, i) => (
                    <div
                      key={i}
                      className={`text-xs leading-relaxed ${
                        line.startsWith("✓")
                          ? "text-white/80 font-medium"
                          : line.startsWith("  Found") || line.startsWith("  Config")
                            ? "text-white/70"
                            : "text-white/50"
                      }`}
                    >
                      {line || "\u00A0"}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="mt-8 flex justify-center">
            <code className="rounded-md border bg-background px-4 py-2 text-sm font-mono text-muted-foreground">
              npx actant
            </code>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
