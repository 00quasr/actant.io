"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyIcon, CheckIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { FadeIn } from "./fade-in";
import {
  AGENT_ICON_MAP,
  AGENT_BRAND_COLORS,
  type AgentName,
} from "@/components/icons/agent-icons";

const INSTALL_CMD = "npx actant init";

const AGENT_FILES: { name: AgentName; file: string }[] = [
  { name: "Claude Code", file: "CLAUDE.md" },
  { name: "Cursor", file: ".cursorrules" },
  { name: "Windsurf", file: ".windsurfrules" },
  { name: "Cline", file: ".clinerules/" },
  { name: "OpenCode", file: "opencode.json" },
];

export function HeroSection() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(INSTALL_CMD).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section className="relative px-6 pt-20 pb-0 sm:pt-28 overflow-hidden">
      {/* Subtle gradient glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px]"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 50% 0%, var(--muted) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-6xl">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          {/* Left column: text content */}
          <div className="text-center lg:text-left">
            <FadeIn>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="size-1.5 rounded-full bg-foreground" />5 Agents Supported
              </span>
            </FadeIn>

            <FadeIn delay={80}>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Configure your agent.
                <br />
                <span className="text-muted-foreground">Start building.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={160}>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0 mx-auto">
                The platform to build, share, and export configurations for Claude Code, Cursor,
                Windsurf, Cline, and OpenCode.
              </p>
            </FadeIn>

            <FadeIn delay={240}>
              <div className="mt-8 flex items-center gap-3 justify-center lg:justify-start">
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
              <div className="mt-6 flex justify-center lg:justify-start">
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
                    {copied ? (
                      <CheckIcon className="size-3.5" />
                    ) : (
                      <CopyIcon className="size-3.5" />
                    )}
                  </button>
                </span>
              </div>
            </FadeIn>
          </div>

          {/* Right column: cascading agent file cards */}
          <FadeIn delay={400} className="mt-16 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none min-h-[420px]">
              {AGENT_FILES.map((agent, i) => {
                const Icon = AGENT_ICON_MAP[agent.name];
                const brandColor = AGENT_BRAND_COLORS[agent.name];

                return (
                  <div
                    key={agent.name}
                    className="absolute rounded-lg border bg-background shadow-sm px-5 py-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                    style={{
                      top: `${i * 68}px`,
                      left: `${i * 24}px`,
                      zIndex: AGENT_FILES.length - i,
                      width: "260px",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon
                          className="size-4 shrink-0"
                          style={{ color: brandColor }}
                        />
                        <span className="text-sm font-semibold">{agent.name}</span>
                      </div>
                      <code className="text-xs font-mono text-muted-foreground">{agent.file}</code>
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
