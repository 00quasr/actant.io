"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyIcon, CheckIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { FadeIn } from "./fade-in";

const INSTALL_CMD = "npx actant init";

export function HeroSection() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(INSTALL_CMD).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section className="relative flex flex-col items-center px-6 pt-20 pb-0 text-center sm:pt-28 overflow-hidden">
      {/* Subtle gradient glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px]"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 50% 0%, var(--muted) 0%, transparent 70%)",
        }}
      />

      <FadeIn>
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-foreground" />5 Agents Supported
        </span>
      </FadeIn>

      <FadeIn delay={80}>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Configure your agent. <span className="text-muted-foreground">Start building.</span>
        </h1>
      </FadeIn>

      <FadeIn delay={160}>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
          The platform to build, share, and export configurations for Claude Code, Cursor, Windsurf,
          Cline, and OpenCode.
        </p>
      </FadeIn>

      <FadeIn delay={240}>
        <div className="mt-8 flex items-center gap-3">
          <Button size="lg" asChild>
            <Link href="/signup">
              Get Started Free
              <ArrowRightIcon className="ml-1 size-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/docs">View Docs</Link>
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={320}>
        <div className="mt-6">
          <span className="relative inline-flex items-center rounded-md border bg-muted/50">
            <code className="py-1.5 pl-3 pr-9 text-sm text-muted-foreground font-mono">
              {INSTALL_CMD}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="absolute right-2 text-muted-foreground/60 transition-colors hover:text-foreground"
              aria-label="Copy install command"
            >
              {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
            </button>
          </span>
        </div>
      </FadeIn>

      {/* Product preview */}
      <FadeIn delay={400} className="w-full mt-12 sm:mt-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border bg-background shadow-xl overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="size-3 rounded-full bg-foreground/10" />
                <span className="size-3 rounded-full bg-foreground/10" />
                <span className="size-3 rounded-full bg-foreground/10" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="rounded-md bg-muted px-3 py-0.5 text-xs text-muted-foreground">
                  actant.io/builder
                </span>
              </div>
            </div>

            {/* Mock builder UI */}
            <div className="grid sm:grid-cols-[200px_1fr_240px]" style={{ minHeight: 320 }}>
              {/* Sidebar */}
              <div className="hidden border-r sm:block">
                <div className="p-3 space-y-1">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-2 pt-2 pb-1">
                    Build
                  </div>
                  {["Instructions", "Rules", "MCP Servers", "Permissions", "Skills", "Docs"].map(
                    (tab, i) => (
                      <div
                        key={tab}
                        className={`rounded-md px-2.5 py-1.5 text-xs ${
                          i === 0
                            ? "bg-secondary text-foreground font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {tab}
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Editor */}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">CLAUDE.md</span>
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    claude-code
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-xs leading-relaxed text-muted-foreground">
                  <p>
                    <span className="text-foreground font-medium">## Project</span>
                  </p>
                  <p>My App — Next.js 14, TypeScript, Tailwind</p>
                  <p className="pt-1">
                    <span className="text-foreground font-medium">## Code Style</span>
                  </p>
                  <p>- TypeScript strict, no any</p>
                  <p>- Functional components</p>
                  <p>- Tailwind for styling (shadcn/ui base)</p>
                  <p className="pt-1">
                    <span className="text-foreground font-medium">## Commands</span>
                  </p>
                  <p className="text-muted-foreground/50">```bash</p>
                  <p>npm run dev</p>
                  <p>npm run build</p>
                  <p>npm run lint</p>
                  <p className="text-muted-foreground/50">
                    ```
                    <span className="inline-block w-px h-3.5 bg-foreground ml-0.5 animate-pulse" />
                  </p>
                </div>
              </div>

              {/* Live preview panel */}
              <div className="hidden border-l sm:block bg-muted/20">
                <div className="p-3 border-b">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Live Preview
                  </span>
                </div>
                <div className="p-3 space-y-2">
                  <div className="rounded bg-muted/50 p-2">
                    <div className="text-[10px] text-muted-foreground mb-1">Output files</div>
                    <div className="space-y-1 text-[10px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-foreground/40" />
                        CLAUDE.md
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-foreground/40" />
                        .claude/settings.json
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-foreground/40" />
                        .mcp.json
                      </div>
                    </div>
                  </div>
                  <div className="rounded bg-muted/50 p-2">
                    <div className="text-[10px] text-muted-foreground mb-1">Agent</div>
                    <div className="text-[10px] font-medium">Claude Code</div>
                  </div>
                  <div className="rounded bg-muted/50 p-2">
                    <div className="text-[10px] text-muted-foreground mb-1">MCP Servers</div>
                    <div className="flex gap-1">
                      <span className="rounded bg-secondary px-1 py-0.5 text-[9px] text-muted-foreground">
                        Supabase
                      </span>
                      <span className="rounded bg-secondary px-1 py-0.5 text-[9px] text-muted-foreground">
                        GitHub
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
