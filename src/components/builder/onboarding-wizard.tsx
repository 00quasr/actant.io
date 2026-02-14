"use client";

import { useState, useMemo } from "react";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircledIcon,
  CheckIcon,
  MagicWandIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AGENT_TYPES, AGENT_LABELS, type AgentType } from "@/types/config";
import type { McpServer } from "@/types/config";
import { getSuggestions } from "@/lib/smart-suggestions";
import { RULE_PRESETS, PERMISSION_PRESETS } from "@/lib/presets";

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
    tagline: "Anthropic's CLI coding agent. Supports instructions, rules, MCP servers, permissions, and skills.",
    features: ["Instructions", "Rules", "MCP", "Permissions", "Skills"],
  },
  cursor: {
    tagline: "AI code editor with rules and MCP support. Supports instructions, rules, and MCP servers.",
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

interface OnboardingWizardProps {
  onComplete: (config: {
    targetAgent: AgentType;
    description?: string;
    techStack?: string[];
    suggestedMcpServers?: McpServer[];
    suggestedRulePresetIds?: string[];
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
  const [step, setStep] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);

  // Suggestions state
  const [selectedMcpSlugs, setSelectedMcpSlugs] = useState<Set<string>>(new Set());
  const [selectedRulePresetIds, setSelectedRulePresetIds] = useState<Set<string>>(new Set());
  const [selectedPermissionPresetId, setSelectedPermissionPresetId] = useState("standard");
  const [suggestionsInitialized, setSuggestionsInitialized] = useState(false);

  const suggestions = useMemo(() => {
    if (techStack.length === 0 || !selectedAgent) return null;
    return getSuggestions(techStack, selectedAgent);
  }, [techStack, selectedAgent]);

  const hasSuggestions = suggestions && (
    suggestions.mcpServers.length > 0 ||
    suggestions.rulePresetIds.length > 0
  );

  // Steps: 0=agent, 1=describe, 2=suggestions (conditional), 3=start
  const describeStep = 1;
  const suggestionsStep = hasSuggestions ? 2 : -1;
  const startStep = hasSuggestions ? 3 : 2;
  const totalSteps = startStep + 1;

  const toggleStackItem = (item: string) => {
    setTechStack((prev) =>
      prev.includes(item) ? prev.filter((t) => t !== item) : [...prev, item]
    );
    setSuggestionsInitialized(false);
  };

  const handleNext = () => {
    if (step === describeStep && hasSuggestions && !suggestionsInitialized) {
      if (suggestions) {
        setSelectedMcpSlugs(new Set(suggestions.mcpServers.map((s) => s.name)));
        setSelectedRulePresetIds(new Set(suggestions.rulePresetIds));
        setSelectedPermissionPresetId(suggestions.permissionPresetId);
        setSuggestionsInitialized(true);
      }
    }
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  function toggleMcpSlug(slug: string) {
    setSelectedMcpSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function toggleRulePreset(id: string) {
    setSelectedRulePresetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function buildCompleteConfig() {
    const config: Parameters<typeof onComplete>[0] = {
      targetAgent: selectedAgent ?? "claude-code",
      description: description || undefined,
      techStack: techStack.length > 0 ? techStack : undefined,
    };

    if (hasSuggestions && suggestions && suggestionsInitialized) {
      config.suggestedMcpServers = suggestions.mcpServers.filter(
        (s) => selectedMcpSlugs.has(s.name)
      );
      config.suggestedRulePresetIds = Array.from(selectedRulePresetIds);
      config.suggestedPermissionPresetId = selectedPermissionPresetId;
    }

    return config;
  }

  const handleStartBlank = () => {
    onComplete(buildCompleteConfig());
  };

  const handleUseTemplate = () => {
    onComplete(buildCompleteConfig());
    onOpenTemplate();
  };

  const handleUseGenerate = () => {
    onComplete(buildCompleteConfig());
    onOpenGenerate();
  };

  return (
    <div className="flex-1 flex items-start justify-center overflow-y-auto py-12 px-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === step
                  ? "bg-foreground"
                  : i < step
                    ? "bg-foreground/40"
                    : "bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>

        {/* Skip link */}
        <div className="text-center">
          <button
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip setup
          </button>
        </div>

        {/* Step 0: Pick your agent */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-medium">Pick your agent</h2>
              <p className="text-sm text-muted-foreground">
                Choose the AI coding agent you want to configure.
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
                    className={`text-left rounded-lg border p-4 transition-colors ${
                      isSelected
                        ? "border-foreground"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">
                        {AGENT_LABELS[agent]}
                      </span>
                      {isSelected && (
                        <CheckCircledIcon className="size-4 text-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {info.tagline}
                    </p>
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

            <div className="flex justify-end">
              <Button
                onClick={handleNext}
                disabled={!selectedAgent}
              >
                Next
                <ArrowRightIcon />
              </Button>
            </div>
          </div>
        )}

        {/* Describe your project */}
        {step === describeStep && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-medium">Describe your project</h2>
              <p className="text-sm text-muted-foreground">
                Optional. This helps tailor your configuration.
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

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeftIcon />
                Back
              </Button>
              <Button onClick={handleNext}>
                {description || techStack.length > 0 ? "Next" : "Skip"}
                <ArrowRightIcon />
              </Button>
            </div>
          </div>
        )}

        {/* Recommended for your stack */}
        {step === suggestionsStep && suggestions && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-medium">Recommended for your stack</h2>
              <p className="text-sm text-muted-foreground">
                Based on your tech stack, we suggest these configurations. Uncheck anything you don&apos;t need.
              </p>
            </div>

            {suggestions.mcpServers.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">MCP Servers</p>
                <div className="grid gap-2">
                  {suggestions.mcpServers.map((server) => {
                    const isChecked = selectedMcpSlugs.has(server.name);
                    return (
                      <button
                        key={server.name}
                        onClick={() => toggleMcpSlug(server.name)}
                        className={`text-left rounded-lg border p-3 flex items-center gap-3 transition-colors ${
                          isChecked
                            ? "border-foreground/30 bg-foreground/[0.02]"
                            : "border-border opacity-60"
                        }`}
                      >
                        <div className={`size-4 rounded border flex items-center justify-center shrink-0 ${
                          isChecked ? "border-foreground bg-foreground" : "border-muted-foreground/30"
                        }`}>
                          {isChecked && <CheckIcon className="size-3 text-background" />}
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-medium">{server.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {server.command} {(server.args ?? []).slice(1, 2).join(" ")}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {suggestions.rulePresetIds.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Rule Presets</p>
                <div className="grid gap-2">
                  {suggestions.rulePresetIds.map((presetId) => {
                    const preset = RULE_PRESETS.find((p) => p.id === presetId);
                    if (!preset) return null;
                    const isChecked = selectedRulePresetIds.has(presetId);
                    return (
                      <button
                        key={presetId}
                        onClick={() => toggleRulePreset(presetId)}
                        className={`text-left rounded-lg border p-3 flex items-center gap-3 transition-colors ${
                          isChecked
                            ? "border-foreground/30 bg-foreground/[0.02]"
                            : "border-border opacity-60"
                        }`}
                      >
                        <div className={`size-4 rounded border flex items-center justify-center shrink-0 ${
                          isChecked ? "border-foreground bg-foreground" : "border-muted-foreground/30"
                        }`}>
                          {isChecked && <CheckIcon className="size-3 text-background" />}
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-medium">{preset.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {preset.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Permission Preset</p>
              <div className="flex gap-2">
                {PERMISSION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPermissionPresetId(preset.id)}
                    className={`rounded-lg border px-3 py-2 text-left flex-1 transition-colors ${
                      selectedPermissionPresetId === preset.id
                        ? "border-foreground"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <span className="text-xs font-medium block">{preset.label}</span>
                    <span className="text-[11px] text-muted-foreground">{preset.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeftIcon />
                Back
              </Button>
              <Button onClick={handleNext}>
                Apply &amp; Continue
                <ArrowRightIcon />
              </Button>
            </div>
          </div>
        )}

        {/* How to start — AI Generate is primary */}
        {step === startStep && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-medium">How do you want to start?</h2>
              <p className="text-sm text-muted-foreground">
                Choose a starting point for your configuration.
              </p>
            </div>

            <div className="grid gap-3">
              <button
                onClick={handleUseGenerate}
                className="text-left rounded-lg border-2 border-foreground p-4 transition-colors hover:bg-foreground/[0.02]"
              >
                <div className="flex items-center gap-2">
                  <MagicWandIcon className="size-4" />
                  <span className="text-sm font-medium">Generate with AI</span>
                  <Badge variant="secondary" className="text-[10px]">Recommended</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  AI generates a complete config with instructions, rules, MCP servers, permissions, and documentation — all in one shot.
                </p>
              </button>

              <button
                onClick={handleUseTemplate}
                className="text-left rounded-lg border p-4 hover:border-foreground/30 transition-colors"
              >
                <span className="text-sm font-medium">Use a Template</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Start from a pre-built configuration and customize it for your needs.
                </p>
              </button>

              <button
                onClick={handleStartBlank}
                className="text-left rounded-lg border p-4 hover:border-foreground/30 transition-colors"
              >
                <span className="text-sm font-medium">Start Blank</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Begin with an empty configuration and build it from scratch.
                </p>
              </button>
            </div>

            <div className="flex justify-start">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeftIcon />
                Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
