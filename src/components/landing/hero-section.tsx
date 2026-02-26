"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CopyIcon,
  CheckIcon,
  ArrowRightIcon,
  RocketIcon,
  FileTextIcon,
  ListBulletIcon,
  LockClosedIcon,
  LightningBoltIcon,
  MixerHorizontalIcon,
  ReaderIcon,
  CodeIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { FadeIn } from "./fade-in";

const INSTALL_CMD = "npx actant init";

/* ------------------------------------------------------------------ */
/*  Skill tree data                                                    */
/* ------------------------------------------------------------------ */

interface TreeNode {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tier: number;
  /** Percentage-based position within the tree container */
  x: number;
  y: number;
}

const TREE_NODES: TreeNode[] = [
  // Tier 0
  {
    id: "agent",
    label: "Agent",
    description: "Choose your AI coding agent",
    icon: RocketIcon,
    tier: 0,
    x: 50,
    y: 5,
  },
  // Tier 1
  {
    id: "instructions",
    label: "Instructions",
    description: "System prompt & guidelines",
    icon: FileTextIcon,
    tier: 1,
    x: 15,
    y: 28,
  },
  {
    id: "rules",
    label: "Rules",
    description: "Project-specific rules",
    icon: ListBulletIcon,
    tier: 1,
    x: 50,
    y: 28,
  },
  {
    id: "permissions",
    label: "Permissions",
    description: "Tool access control",
    icon: LockClosedIcon,
    tier: 1,
    x: 85,
    y: 28,
  },
  // Tier 2
  {
    id: "skills",
    label: "Skills",
    description: "Reusable capabilities",
    icon: LightningBoltIcon,
    tier: 2,
    x: 15,
    y: 52,
  },
  {
    id: "mcp",
    label: "MCP",
    description: "Connect external tools",
    icon: MixerHorizontalIcon,
    tier: 2,
    x: 50,
    y: 52,
  },
  {
    id: "docs",
    label: "Docs",
    description: "Reference documentation",
    icon: ReaderIcon,
    tier: 2,
    x: 85,
    y: 52,
  },
  // Tier 3
  {
    id: "commands",
    label: "Commands",
    description: "Workflow slash commands",
    icon: CodeIcon,
    tier: 3,
    x: 33,
    y: 76,
  },
  {
    id: "agents",
    label: "Agents",
    description: "Specialized agent roles",
    icon: PersonIcon,
    tier: 3,
    x: 67,
    y: 76,
  },
];

interface Connection {
  from: string;
  to: string;
}

const CONNECTIONS: Connection[] = [
  { from: "agent", to: "instructions" },
  { from: "agent", to: "rules" },
  { from: "agent", to: "permissions" },
  { from: "instructions", to: "skills" },
  { from: "rules", to: "mcp" },
  { from: "permissions", to: "docs" },
  { from: "skills", to: "commands" },
  { from: "mcp", to: "commands" },
  { from: "mcp", to: "agents" },
  { from: "docs", to: "agents" },
];

/** Subset of nodes to show in the compact mobile strip */
const MOBILE_NODES: TreeNode[] = TREE_NODES.filter((n) =>
  ["agent", "instructions", "rules", "skills", "mcp", "commands"].includes(n.id),
);

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getNode(id: string): TreeNode {
  const node = TREE_NODES.find((n) => n.id === id);
  if (!node) throw new Error(`Unknown node: ${id}`);
  return node;
}

/** Tier of a connection = the higher tier of its two endpoints */
function connectionTier(c: Connection): number {
  return Math.max(getNode(c.from).tier, getNode(c.to).tier);
}

/* ------------------------------------------------------------------ */
/*  SVG connection lines                                               */
/* ------------------------------------------------------------------ */

function ConnectionLines({ activeTier, pulseDone }: { activeTier: number; pulseDone: boolean }) {
  const W = 380;
  const H = 480;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="absolute inset-0 size-full pointer-events-none"
      fill="none"
    >
      {CONNECTIONS.map((c) => {
        const from = getNode(c.from);
        const to = getNode(c.to);
        const tier = connectionTier(c);
        const isActive = tier <= activeTier;

        const x1 = (from.x / 100) * W;
        const y1 = (from.y / 100) * H;
        const x2 = (to.x / 100) * W;
        const y2 = (to.y / 100) * H;

        // Control point for a gentle curve
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2 - 8;

        const d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
        const pathLength = 300; // approximate

        return (
          <path
            key={`${c.from}-${c.to}`}
            d={d}
            strokeWidth={1.5}
            className={
              isActive
                ? "stroke-foreground/20 transition-colors duration-500"
                : "stroke-border transition-colors duration-500"
            }
            strokeDasharray={pathLength}
            strokeDashoffset={isActive ? 0 : pathLength}
            style={{
              transition: `stroke-dashoffset 0.6s ease, stroke 0.5s ease${pulseDone ? "" : ""}`,
            }}
          />
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Skill tree node                                                    */
/* ------------------------------------------------------------------ */

function SkillTreeNode({
  node,
  isActive,
  pulseDone,
}: {
  node: TreeNode;
  isActive: boolean;
  pulseDone: boolean;
}) {
  const Icon = node.icon;
  const isRoot = node.tier === 0;
  const sizeClass = isRoot ? "size-14" : "size-11";
  const iconSize = isRoot ? "size-5" : "size-4";

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        transform: "translate(-50%, -50%)",
      }}
      title={node.description}
    >
      <div
        className={`
          ${sizeClass} rounded-full flex items-center justify-center transition-all duration-500
          ${
            isActive
              ? `border-2 ${isRoot ? "border-foreground/60" : "border-foreground/40"} bg-background shadow-[0_0_20px_rgba(0,0,0,0.06)] hover:scale-110`
              : "border-2 border-dashed border-border bg-muted/30"
          }
          ${pulseDone ? "animate-[skillPulse_0.4s_ease-in-out]" : ""}
        `}
      >
        <Icon
          className={`${iconSize} transition-colors duration-500 ${
            isActive ? "text-foreground" : "text-muted-foreground/25"
          }`}
        />
      </div>
      <span
        className={`mt-1.5 text-[10px] font-medium transition-colors duration-500 ${
          isActive ? "text-foreground" : "text-muted-foreground/30"
        }`}
      >
        {node.label}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Full desktop skill tree                                            */
/* ------------------------------------------------------------------ */

function SkillTree() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const [activeTier, setActiveTier] = useState(-1);
  const [pulseDone, setPulseDone] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          // Tier 0 immediately
          setActiveTier(0);

          // Tier 1 after 600ms
          setTimeout(() => setActiveTier(1), 600);

          // Tier 2 after 1200ms
          setTimeout(() => setActiveTier(2), 1200);

          // Tier 3 after 1800ms
          setTimeout(() => setActiveTier(3), 1800);

          // Pulse after 2400ms
          setTimeout(() => setPulseDone(true), 2400);
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative mx-auto" style={{ width: 380, height: 480 }}>
      <ConnectionLines activeTier={activeTier} pulseDone={pulseDone} />
      {TREE_NODES.map((node) => (
        <SkillTreeNode
          key={node.id}
          node={node}
          isActive={node.tier <= activeTier}
          pulseDone={pulseDone}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Compact mobile strip                                               */
/* ------------------------------------------------------------------ */

function MobileNodeStrip() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          setTimeout(() => setIsActive(true), 400);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="mt-10 flex items-center justify-center gap-3 lg:hidden overflow-x-auto px-2"
    >
      {MOBILE_NODES.map((node, i) => {
        const Icon = node.icon;
        return (
          <div key={node.id} className="flex items-center gap-3">
            <div className="flex flex-col items-center" title={node.description}>
              <div
                className={`size-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isActive
                    ? "border-2 border-foreground/40 bg-background shadow-[0_0_12px_rgba(0,0,0,0.04)]"
                    : "border-2 border-dashed border-border bg-muted/30"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span
                  className={`transition-colors duration-500 ${
                    isActive ? "text-foreground" : "text-muted-foreground/25"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <Icon className="size-3" />
                </span>
              </div>
              <span
                className={`mt-1 text-[9px] font-medium transition-colors duration-500 ${
                  isActive ? "text-foreground" : "text-muted-foreground/30"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {node.label}
              </span>
            </div>
            {i < MOBILE_NODES.length - 1 && (
              <div
                className={`w-4 h-px transition-colors duration-500 ${
                  isActive ? "bg-foreground/20" : "bg-border"
                }`}
                style={{ transitionDelay: `${i * 100 + 50}ms` }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero section                                                       */
/* ------------------------------------------------------------------ */

export function HeroSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(INSTALL_CMD).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <section className="relative px-6 pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
      {/* Pulse keyframe for skill tree nodes */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes skillPulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
          `,
        }}
      />

      <div className="mx-auto max-w-6xl">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          {/* Left column: text content */}
          <div className="text-center lg:text-left">
            {/* Eyebrow badge */}
            <FadeIn>
              <div className="flex justify-center lg:justify-start">
                <span className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-foreground" />
                  Now with workflow commands &amp; agents
                </span>
              </div>
            </FadeIn>

            {/* Headline */}
            <FadeIn delay={80}>
              <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                The configuration platform for AI coding agents
              </h1>
            </FadeIn>

            {/* Subtitle */}
            <FadeIn delay={160}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground mx-auto lg:mx-0">
                Build, share, and deploy configs and workflows for Claude Code, Cursor, Windsurf,
                Cline, and OpenCode.
              </p>
            </FadeIn>

            {/* CTAs */}
            <FadeIn delay={240}>
              <div className="mt-10 flex items-center justify-center lg:justify-start gap-3">
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

              {/* Install command */}
              <div className="mt-5 flex justify-center lg:justify-start">
                <span className="relative inline-flex items-center rounded-full border bg-muted/50">
                  <code className="py-1.5 pl-4 pr-10 text-sm text-muted-foreground font-mono">
                    {INSTALL_CMD}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="absolute right-2.5 text-muted-foreground/60 transition-colors hover:text-foreground"
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

            {/* Mobile-only compact node strip */}
            <FadeIn delay={320}>
              <MobileNodeStrip />
            </FadeIn>
          </div>

          {/* Right column: animated skill tree (desktop only) */}
          <FadeIn delay={300} className="hidden lg:block">
            <SkillTree />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
