"use client";

import { useState } from "react";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AGENT_TYPES, AGENT_LABELS, type AgentType } from "@/types/config";

const QUICK_STACK_OPTIONS = [
  "React",
  "Next.js",
  "Vue",
  "Node.js",
  "Python",
  "Rust",
  "Go",
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
  onComplete: (config: { targetAgent: AgentType; description?: string; techStack?: string[] }) => void;
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

  const toggleStackItem = (item: string) => {
    setTechStack((prev) =>
      prev.includes(item) ? prev.filter((t) => t !== item) : [...prev, item]
    );
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleStartBlank = () => {
    if (!selectedAgent) return;
    onComplete({
      targetAgent: selectedAgent,
      description: description || undefined,
      techStack: techStack.length > 0 ? techStack : undefined,
    });
  };

  const handleUseTemplate = () => {
    if (!selectedAgent) return;
    onComplete({
      targetAgent: selectedAgent,
      description: description || undefined,
      techStack: techStack.length > 0 ? techStack : undefined,
    });
    onOpenTemplate();
  };

  const handleUseGenerate = () => {
    if (!selectedAgent) return;
    onComplete({
      targetAgent: selectedAgent,
      description: description || undefined,
      techStack: techStack.length > 0 ? techStack : undefined,
    });
    onOpenGenerate();
  };

  return (
    <div className="flex-1 flex items-start justify-center overflow-y-auto py-12 px-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
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

        {/* Step 1: Pick your agent */}
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

        {/* Step 2: Describe your project */}
        {step === 1 && (
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

        {/* Step 3: How to start */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-medium">How do you want to start?</h2>
              <p className="text-sm text-muted-foreground">
                Choose a starting point for your configuration.
              </p>
            </div>

            <div className="grid gap-3">
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
                onClick={handleUseGenerate}
                className="text-left rounded-lg border p-4 hover:border-foreground/30 transition-colors"
              >
                <span className="text-sm font-medium">AI Generate</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Let AI generate a configuration based on your project description.
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
