"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyIcon, CheckIcon } from "@radix-ui/react-icons";
import { FadeIn } from "./fade-in";

const INSTALL_CMD = "npm install actant";

export function HeroSection() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(INSTALL_CMD).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section className="relative flex flex-col items-center px-6 pt-24 pb-16 text-center sm:pt-32 sm:pb-20 overflow-hidden">
      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(0 0% 0% / 0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse 60% 60% at 50% 40%, black 20%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 40%, black 20%, transparent 100%)",
        }}
      />

      <FadeIn>
        <span className="mb-6 inline-flex items-center rounded-full border px-3 py-1 text-xs text-muted-foreground">
          5 Agents Supported
        </span>
      </FadeIn>

      <FadeIn delay={80}>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Configure your agent.
          <br />
          Start building.
        </h1>
      </FadeIn>

      <FadeIn delay={160}>
        <p className="mt-6 max-w-lg text-lg text-muted-foreground">
          The platform to build, share, and export configurations for AI coding
          agents.
        </p>
      </FadeIn>

      <FadeIn delay={240}>
        <div className="mt-10 flex items-center gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/docs">View Docs</Link>
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={320}>
        <div className="mt-8">
          <span className="relative inline-flex items-center rounded-md border bg-muted">
            <code className="py-1.5 pl-3 pr-9 text-sm text-muted-foreground">
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
    </section>
  );
}
