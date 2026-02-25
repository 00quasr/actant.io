"use client";

import { useState, useMemo } from "react";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircledIcon,
  MagicWandIcon,
  FileTextIcon,
  LightningBoltIcon,
  MixerHorizontalIcon,
  LockClosedIcon,
  ListBulletIcon,
  CodeIcon,
  PersonIcon,
  ReaderIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AGENT_TYPES, AGENT_LABELS, type AgentType } from "@/types/config";
import type { McpServer } from "@/types/config";
import { getSuggestions } from "@/lib/smart-suggestions";
import { RULE_PRESETS, COMMAND_PRESETS } from "@/lib/presets";

const QUICK_STACK_OPTIONS = [
  "React",
  "Next.js",
  "Vue",
  "Node.js",
  "Python",
  "Rust",
  "Go",
  "Supabase",
  "TailwindCSS",
] as const;

const AGENT_DESCRIPTIONS: Record<AgentType, { tagline: string; features: string[] }> = {
  "claude-code": {
    tagline:
      "Anthropic's CLI coding agent. Supports instructions, rules, MCP servers, permissions, and skills.",
    features: ["Instructions", "Rules", "MCP", "Permissions", "Skills"],
  },
  cursor: {
    tagline:
      "AI code editor with rules and MCP support. Supports instructions, rules, and MCP servers.",
    features: ["Instructions", "Rules", "MCP"],
  },
  windsurf: {
    tagline: "AI IDE by Codeium. Supports instructions and rules.",
    features: ["Instructions", "Rules"],
  },
  cline: {
    tagline: "VS Code extension for AI coding. Supports instructions, rules, and MCP servers.",
    features: ["Instructions", "Rules", "MCP"],
  },
  opencode: {
    tagline: "Open-source CLI agent. Supports instructions, MCP servers, and permissions.",
    features: ["Instructions", "MCP", "Permissions"],
  },
};

/* ------------------------------------------------------------------ */
/*  Tree node definitions                                              */
/* ------------------------------------------------------------------ */

interface TreeNodeDef {
  id: string;
  label: string;
  top: string;
  left: string;
  size: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TREE_NODES: TreeNodeDef[] = [
  { id: "agent", label: "Agent", top: "2%", left: "50%", size: "size-12", icon: RocketIcon },
  {
    id: "instructions",
    label: "Instructions",
    top: "22%",
    left: "15%",
    size: "size-9",
    icon: FileTextIcon,
  },
  { id: "rules", label: "Rules", top: "22%", left: "50%", size: "size-9", icon: ListBulletIcon },
  {
    id: "permissions",
    label: "Permissions",
    top: "22%",
    left: "85%",
    size: "size-9",
    icon: LockClosedIcon,
  },
  {
    id: "skills",
    label: "Skills",
    top: "46%",
    left: "15%",
    size: "size-9",
    icon: LightningBoltIcon,
  },
  { id: "mcp", label: "MCP", top: "46%", left: "50%", size: "size-9", icon: MixerHorizontalIcon },
  { id: "docs", label: "Docs", top: "46%", left: "85%", size: "size-9", icon: ReaderIcon },
  { id: "commands", label: "Commands", top: "70%", left: "33%", size: "size-9", icon: CodeIcon },
  { id: "agents", label: "Agents", top: "70%", left: "67%", size: "size-9", icon: PersonIcon },
];

/* Connection lines between tree tiers */
const TREE_EDGES: [string, string][] = [
  ["agent", "instructions"],
  ["agent", "rules"],
  ["agent", "permissions"],
  ["instructions", "skills"],
  ["rules", "mcp"],
  ["permissions", "docs"],
  ["skills", "commands"],
  ["mcp", "commands"],
  ["mcp", "agents"],
  ["docs", "agents"],
];

/* ------------------------------------------------------------------ */
/*  TreePreview component                                              */
/* ------------------------------------------------------------------ */

function TreePreview({
  agentLabel,
  nodeCounts,
}: {
  agentLabel: string;
  nodeCounts: Record<string, number>;
}) {
  /* Build a lookup for quick access */
  const nodeMap = useMemo(() => {
    const map: Record<string, TreeNodeDef> = {};
    for (const n of TREE_NODES) {
      map[n.id] = n;
    }
    return map;
  }, []);

  return (
    <div className="relative w-full" style={{ height: 340 }}>
      {/* SVG layer for connection lines */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        {TREE_EDGES.map(([fromId, toId]) => {
          const from = nodeMap[fromId];
          const to = nodeMap[toId];
          if (!from || !to) return null;

          const fromHasContent = fromId === "agent" || (nodeCounts[fromId] ?? 0) > 0;
          const toHasContent = (nodeCounts[toId] ?? 0) > 0;
          const active = fromHasContent && toHasContent;

          return (
            <line
              key={`${fromId}-${toId}`}
              x1={from.left}
              y1={from.top}
              x2={to.left}
              y2={to.top}
              className={cn(
                "transition-all duration-500",
                active ? "stroke-foreground/15" : "stroke-border/40",
              )}
              strokeWidth={1}
              strokeDasharray={active ? undefined : "4 4"}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {TREE_NODES.map((node) => {
        const count = node.id === "agent" ? -1 : (nodeCounts[node.id] ?? 0);
        const hasContent = count > 0 || node.id === "agent";
        const Icon = node.icon;

        return (
          <div
            key={node.id}
            className="absolute flex flex-col items-center"
            style={{
              top: node.top,
              left: node.left,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Count badge */}
            {count > 0 && (
              <span className="mb-1 text-[9px] font-mono text-foreground tabular-nums">
                {count}
              </span>
            )}

            {/* Circle */}
            <div
              className={cn(
                node.size,
                "rounded-full border-2 flex items-center justify-center transition-all duration-500",
                hasContent
                  ? "border-foreground/40 bg-background shadow-[0_0_12px_rgba(0,0,0,0.04)]"
                  : "border-dashed border-border bg-muted/30",
              )}
            >
              <Icon
                className={cn(
                  "size-3.5",
                  hasContent ? "text-foreground" : "text-muted-foreground/30",
                )}
              />
            </div>

            {/* Label */}
            <span
              className={cn(
                "mt-1 text-[9px] font-medium whitespace-nowrap",
                hasContent ? "text-foreground" : "text-muted-foreground/40",
              )}
            >
              {node.id === "agent" ? agentLabel : node.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  OnboardingWizard                                                   */
/* ------------------------------------------------------------------ */

interface OnboardingWizardProps {
  onComplete: (config: {
    targetAgent: AgentType;
    description?: string;
    techStack?: string[];
    suggestedMcpServers?: McpServer[];
    suggestedRulePresetIds?: string[];
    suggestedCommandPresetIds?: string[];
    suggestedPermissionPresetId?: string;
  }) => void;
  onOpenTemplate: () => void;
  onOpenGenerate: () => void;
  onSkip: () => void;
}

export function OnboardingWizard({
  onComplete,
  onOpenTemplate,
  onOpenGenerate,
  onSkip,
}: OnboardingWizardProps) {
  const [step, setStep] = useState(0); // 0 = agent, 1 = configure
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);

  const totalSteps = 2;

  /* ----- Suggestions ----- */

  const suggestions = useMemo(() => {
    if (techStack.length === 0 || !selectedAgent) return null;
    return getSuggestions(techStack, selectedAgent);
  }, [techStack, selectedAgent]);

  /* ----- Node counts for tree preview ----- */

  const nodeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      instructions: 1, // always at least instructions
      skills: 0,
      mcp: 0,
      permissions: 1, // always set a permission preset
      rules: 0,
      commands: 0,
      agents: 0,
      docs: 0,
    };
    if (suggestions) {
      counts.mcp = suggestions.mcpServers.length;
      for (const presetId of suggestions.rulePresetIds) {
        const preset = RULE_PRESETS.find((p) => p.id === presetId);
        if (preset) counts.rules += preset.rules.length;
      }
      for (const presetId of suggestions.commandPresetIds) {
        const preset = COMMAND_PRESETS.find((p) => p.id === presetId);
        if (preset) counts.commands += preset.commands.length;
      }
    }
    return counts;
  }, [suggestions]);

  /* ----- Handlers ----- */

  const toggleStackItem = (item: string) => {
    setTechStack((prev) =>
      prev.includes(item) ? prev.filter((t) => t !== item) : [...prev, item],
    );
  };

  function handleStartBuilding() {
    onComplete({
      targetAgent: selectedAgent ?? "claude-code",
      description: description || undefined,
      techStack: techStack.length > 0 ? techStack : undefined,
      suggestedMcpServers: suggestions?.mcpServers,
      suggestedRulePresetIds: suggestions?.rulePresetIds,
      suggestedCommandPresetIds: suggestions?.commandPresetIds,
      suggestedPermissionPresetId: suggestions?.permissionPresetId,
    });
  }

  function handleUseGenerate() {
    handleStartBuilding();
    onOpenGenerate();
  }

  function handleUseTemplate() {
    handleStartBuilding();
    onOpenTemplate();
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="flex-1 flex items-start justify-center overflow-y-auto py-12 px-6">
      <div className="w-full max-w-3xl space-y-8">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                i === step
                  ? "bg-foreground"
                  : i < step
                    ? "bg-foreground/40"
                    : "bg-muted-foreground/20",
              )}
            />
          ))}
        </div>

        {/* -------------------------------------------------------- */}
        {/*  Step 0: Choose your agent                                */}
        {/* -------------------------------------------------------- */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-medium">Choose your agent</h2>
              <p className="text-sm text-muted-foreground">
                Select the AI coding agent you want to configure.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AGENT_TYPES.map((agent) => {
                const info = AGENT_DESCRIPTIONS[agent];
                const isSelected = selectedAgent === agent;

                return (
                  <button
                    key={agent}
                    onClick={() => setSelectedAgent(agent)}
                    className={cn(
                      "text-left rounded-xl border p-4 transition-colors",
                      isSelected ? "border-foreground" : "border-border hover:border-foreground/30",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">{AGENT_LABELS[agent]}</span>
                      {isSelected && <CheckCircledIcon className="size-4 text-foreground" />}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{info.tagline}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {info.features.map((f) => (
                        <Badge key={f} variant="secondary" className="text-[10px]">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Subtle links */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <button
                onClick={() => {
                  onOpenTemplate();
                }}
                className="hover:text-foreground transition-colors"
              >
                Use a Template
              </button>
              <span className="text-border">|</span>
              <button onClick={onSkip} className="hover:text-foreground transition-colors">
                Skip setup
              </button>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(1)} disabled={!selectedAgent}>
                Next
                <ArrowRightIcon />
              </Button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/*  Step 1: Configure your setup                             */}
        {/* -------------------------------------------------------- */}
        {step === 1 && selectedAgent && (
          <div className="space-y-8">
            {/* Two-column layout: form + tree */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left column: form */}
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-lg font-medium">Configure your setup</h2>
                  <p className="text-sm text-muted-foreground">
                    Describe your project and select your tech stack. The config tree updates in
                    real-time.
                  </p>
                </div>

                <div className="space-y-4">
                  <Textarea
                    placeholder="What are you building? Describe your project, its architecture, key conventions..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-24 resize-none"
                    maxLength={2000}
                  />

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Tech stack</p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_STACK_OPTIONS.map((tech) => (
                        <Badge
                          key={tech}
                          variant={techStack.includes(tech) ? "default" : "outline"}
                          className="cursor-pointer select-none"
                          onClick={() => toggleStackItem(tech)}
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column: live config tree preview (hidden below lg) */}
              <div className="hidden lg:flex flex-col items-center">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                  Config tree
                </p>
                <div className="w-[280px]">
                  <TreePreview agentLabel={AGENT_LABELS[selectedAgent]} nodeCounts={nodeCounts} />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-3">
                {/* Generate with AI — primary */}
                <Button
                  variant="outline"
                  className="h-auto py-3 px-4 border-foreground justify-start"
                  onClick={handleUseGenerate}
                >
                  <div className="flex flex-col items-start gap-1 text-left">
                    <div className="flex items-center gap-2">
                      <MagicWandIcon className="size-3.5 shrink-0" />
                      <span className="text-sm font-medium">Generate with AI</span>
                      <Badge variant="secondary" className="text-[9px] leading-none">
                        Recommended
                      </Badge>
                    </div>
                  </div>
                </Button>

                {/* Use Template */}
                <Button
                  variant="outline"
                  className="h-auto py-3 px-4 justify-start"
                  onClick={handleUseTemplate}
                >
                  <span className="text-sm font-medium">Use Template</span>
                </Button>

                {/* Start Building */}
                <Button
                  variant="outline"
                  className="h-auto py-3 px-4 justify-start"
                  onClick={handleStartBuilding}
                >
                  <span className="text-sm font-medium">Start Building</span>
                </Button>
              </div>

              {/* Back button */}
              <div className="flex justify-start">
                <Button variant="outline" onClick={() => setStep(0)}>
                  <ArrowLeftIcon />
                  Back
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
