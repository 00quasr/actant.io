"use client";

import { useState, useCallback } from "react";
import {
  MagicWandIcon,
  Cross2Icon,
  CheckIcon,
  ReloadIcon,
  PlusIcon,
  ArrowRightIcon,
} from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useConfigGeneration } from "@/hooks/use-config-generation";
import type { AgentConfig, AgentType } from "@/types/config";
import type { ClarifyingQuestion } from "@/lib/ai/questions-schema";
import type { QuestionAnswer } from "@/lib/ai/prompts";

const QUICK_STACK_OPTIONS = [
  "React",
  "Next.js",
  "Vue",
  "Node.js",
  "Python",
  "Rust",
  "Go",
] as const;

interface AiGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetAgent: AgentType;
  onAccept: (config: AgentConfig) => void;
}

export function AiGenerateDialog({
  open,
  onOpenChange,
  targetAgent,
  onAccept,
}: AiGenerateDialogProps) {
  const {
    status,
    result,
    error,
    questions,
    generate,
    generateQuestions,
    reset,
  } = useConfigGeneration();

  const [projectDescription, setProjectDescription] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [customTech, setCustomTech] = useState("");
  const [includeRules, setIncludeRules] = useState(true);
  const [includeMcp, setIncludeMcp] = useState(true);
  const [includePermissions, setIncludePermissions] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const resetForm = useCallback(() => {
    setProjectDescription("");
    setTechStack([]);
    setCustomTech("");
    setIncludeRules(true);
    setIncludeMcp(true);
    setIncludePermissions(true);
    setAnswers({});
    reset();
  }, [reset]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  }

  function toggleStackItem(item: string) {
    setTechStack((prev) =>
      prev.includes(item) ? prev.filter((t) => t !== item) : [...prev, item]
    );
  }

  function addCustomTech() {
    const trimmed = customTech.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack((prev) => [...prev, trimmed]);
      setCustomTech("");
    }
  }

  function handleCustomKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTech();
    }
  }

  async function handleNext() {
    await generateQuestions(projectDescription, techStack);
  }

  function buildAnswersPayload(): QuestionAnswer[] {
    return questions
      .filter((q) => answers[q.id]?.trim())
      .map((q) => ({
        questionId: q.id,
        question: q.question,
        answer: answers[q.id],
      }));
  }

  async function handleGenerate(withAnswers: boolean) {
    await generate({
      projectDescription,
      techStack,
      targetAgent,
      includeRules,
      includeMcp,
      includePermissions,
      answers: withAnswers ? buildAnswersPayload() : undefined,
    });
  }

  function handleAccept() {
    if (result) {
      onAccept(result);
      handleOpenChange(false);
    }
  }

  function handleRegenerate() {
    reset();
    setAnswers({});
  }

  const isFormValid = projectDescription.length >= 10;

  function renderStep() {
    if (status === "idle" || (status === "error" && questions.length === 0)) {
      return (
        <HeroInput
          projectDescription={projectDescription}
          setProjectDescription={setProjectDescription}
          techStack={techStack}
          toggleStackItem={toggleStackItem}
          customTech={customTech}
          setCustomTech={setCustomTech}
          addCustomTech={addCustomTech}
          handleCustomKeyDown={handleCustomKeyDown}
          includeRules={includeRules}
          setIncludeRules={setIncludeRules}
          includeMcp={includeMcp}
          setIncludeMcp={setIncludeMcp}
          includePermissions={includePermissions}
          setIncludePermissions={setIncludePermissions}
          error={error}
          isFormValid={isFormValid}
          onNext={handleNext}
        />
      );
    }

    if (status === "asking") {
      return (
        <LoadingState
          message="Analyzing your project..."
          subtitle="Generating clarifying questions to build a better config."
        />
      );
    }

    if (status === "answering" || (status === "error" && questions.length > 0)) {
      return (
        <AnswerForm
          questions={questions}
          answers={answers}
          setAnswers={setAnswers}
          error={error}
          onSkip={() => handleGenerate(false)}
          onGenerate={() => handleGenerate(true)}
        />
      );
    }

    if (status === "generating") {
      return (
        <LoadingState
          message="Generating your configuration..."
          subtitle="This may take a few seconds."
        />
      );
    }

    if (status === "done" && result) {
      return (
        <PreviewState
          result={result}
          onAccept={handleAccept}
          onRegenerate={handleRegenerate}
        />
      );
    }

    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogTitle className="sr-only">Generate with AI</DialogTitle>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Hero Input (Step 1) — Chat-style, spacious                         */
/* ------------------------------------------------------------------ */

interface HeroInputProps {
  projectDescription: string;
  setProjectDescription: (v: string) => void;
  techStack: string[];
  toggleStackItem: (item: string) => void;
  customTech: string;
  setCustomTech: (v: string) => void;
  addCustomTech: () => void;
  handleCustomKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  includeRules: boolean;
  setIncludeRules: (v: boolean) => void;
  includeMcp: boolean;
  setIncludeMcp: (v: boolean) => void;
  includePermissions: boolean;
  setIncludePermissions: (v: boolean) => void;
  error: string | null;
  isFormValid: boolean;
  onNext: () => void;
}

function HeroInput({
  projectDescription,
  setProjectDescription,
  techStack,
  toggleStackItem,
  customTech,
  setCustomTech,
  addCustomTech,
  handleCustomKeyDown,
  includeRules,
  setIncludeRules,
  includeMcp,
  setIncludeMcp,
  includePermissions,
  setIncludePermissions,
  error,
  isFormValid,
  onNext,
}: HeroInputProps) {
  const customItems = techStack.filter(
    (t) =>
      !QUICK_STACK_OPTIONS.includes(t as (typeof QUICK_STACK_OPTIONS)[number])
  );

  return (
    <div className="flex flex-col items-center px-10 py-16">
      {/* Hero heading */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight">
          What are you building?
        </h2>
        <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
          Describe your project and we&apos;ll generate a tailored agent config.
        </p>
      </div>

      {/* Main textarea */}
      <div className="w-full max-w-2xl">
        <div className="relative rounded-xl border bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring/50">
          <Textarea
            placeholder="I'm building a Next.js SaaS app with Supabase auth, Stripe billing, and a dashboard..."
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="min-h-36 resize-none border-0 shadow-none focus-visible:ring-0 text-sm leading-relaxed p-4"
            maxLength={2000}
          />
          <div className="flex items-center justify-between px-4 pb-4">
            <span className="text-xs text-muted-foreground">
              {projectDescription.length > 0 && `${projectDescription.length}/2000`}
            </span>
            <Button
              onClick={onNext}
              disabled={!isFormValid}
              size="default"
              className="rounded-full px-6"
            >
              Generate
              <ArrowRightIcon className="ml-1.5 size-4" />
            </Button>
          </div>
        </div>

        {/* Tech stack pills */}
        <div className="mt-6">
          <p className="text-xs text-muted-foreground mb-2">Tech stack (optional)</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_STACK_OPTIONS.map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => toggleStackItem(tech)}
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  techStack.includes(tech)
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {tech}
              </button>
            ))}
            {customItems.map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => toggleStackItem(tech)}
                className="inline-flex items-center gap-1 rounded-full border border-foreground bg-foreground text-background px-3 py-1 text-xs font-medium"
              >
                {tech}
                <Cross2Icon className="size-3" />
              </button>
            ))}
            <div className="inline-flex items-center gap-1">
              <Input
                placeholder="Other..."
                value={customTech}
                onChange={(e) => setCustomTech(e.target.value)}
                onKeyDown={handleCustomKeyDown}
                className="h-7 w-24 text-xs rounded-full border-dashed"
              />
              {customTech.trim() && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-full"
                  onClick={addCustomTech}
                >
                  <PlusIcon className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Inline options — always visible, compact */}
        <div className="mt-5 flex items-center gap-5">
          <span className="text-xs text-muted-foreground">Include:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <Checkbox
              checked={includeRules}
              onCheckedChange={(v) => setIncludeRules(v === true)}
            />
            <span className="text-xs text-muted-foreground">Rules</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <Checkbox
              checked={includeMcp}
              onCheckedChange={(v) => setIncludeMcp(v === true)}
            />
            <span className="text-xs text-muted-foreground">MCP</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <Checkbox
              checked={includePermissions}
              onCheckedChange={(v) => setIncludePermissions(v === true)}
            />
            <span className="text-xs text-muted-foreground">Permissions</span>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-md border border-destructive/20 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Answer Form (Step 3)                                                */
/* ------------------------------------------------------------------ */

interface AnswerFormProps {
  questions: ClarifyingQuestion[];
  answers: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  error: string | null;
  onSkip: () => void;
  onGenerate: () => void;
}

function AnswerForm({
  questions,
  answers,
  setAnswers,
  error,
  onSkip,
  onGenerate,
}: AnswerFormProps) {
  function setAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <div className="flex flex-col px-8 py-10">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold tracking-tight">
          A few quick questions
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Help us understand your project better for a more accurate config.
        </p>
      </div>

      <div className="mx-auto w-full max-w-xl space-y-6 flex-1 min-h-0 overflow-y-auto">
        {questions.map((q, i) => (
          <div key={q.id} className="space-y-2">
            <Label className="text-sm">
              {i + 1}. {q.question}
            </Label>
            {q.context && (
              <p className="text-xs text-muted-foreground">{q.context}</p>
            )}

            {q.type === "multiple_choice" && q.options ? (
              <RadioGroup
                value={answers[q.id] ?? ""}
                onValueChange={(v) => setAnswer(q.id, v)}
              >
                {q.options.map((option) => (
                  <div key={option} className="flex items-center gap-2">
                    <RadioGroupItem value={option} id={`${q.id}-${option}`} />
                    <Label
                      htmlFor={`${q.id}-${option}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <Textarea
                placeholder="Your answer..."
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                className="min-h-16 resize-none"
              />
            )}
          </div>
        ))}

        {error && (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onSkip} className="flex-1">
            Skip
          </Button>
          <Button onClick={onGenerate} className="flex-1">
            <MagicWandIcon className="size-4" />
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Loading State                                                       */
/* ------------------------------------------------------------------ */

function LoadingState({
  message,
  subtitle,
}: {
  message: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="size-8 rounded-full border-2 border-muted-foreground/20 border-t-foreground animate-spin" />
      <div className="text-center space-y-1">
        <p className="text-sm font-medium">{message}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Preview State                                                       */
/* ------------------------------------------------------------------ */

interface PreviewStateProps {
  result: AgentConfig;
  onAccept: () => void;
  onRegenerate: () => void;
}

function PreviewState({ result, onAccept, onRegenerate }: PreviewStateProps) {
  return (
    <div className="flex flex-col px-8 py-10">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold tracking-tight">
          Your config is ready
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review the generated configuration before applying it.
        </p>
      </div>

      <div className="mx-auto w-full max-w-xl space-y-4 flex-1 min-h-0 overflow-y-auto">
        {/* Name & description */}
        <div className="space-y-1">
          <p className="text-sm font-medium">{result.name}</p>
          {result.description && (
            <p className="text-xs text-muted-foreground">{result.description}</p>
          )}
        </div>

        {/* Summary stats */}
        <div className="flex flex-wrap gap-2">
          <StatBadge label="Instructions" value={`${result.instructions.content.length} chars`} />
          <StatBadge label="Rules" value={String(result.rules.length)} />
          <StatBadge label="MCP Servers" value={String(result.mcpServers.length)} />
          <StatBadge label="Permissions" value={String(Object.keys(result.permissions).length)} />
        </div>

        {/* Instructions preview */}
        {result.instructions.content && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Instructions
            </p>
            <div className="rounded-md border bg-muted/30 p-3 max-h-48 overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed">
                {result.instructions.content.slice(0, 1000)}
                {result.instructions.content.length > 1000 && "..."}
              </pre>
            </div>
          </div>
        )}

        {/* Rules list */}
        {result.rules.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Rules</p>
            <div className="space-y-1">
              {result.rules.map((rule, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-foreground/80">
                  <span className="size-1 rounded-full bg-foreground/30 shrink-0" />
                  <span>{rule.title}</span>
                  {rule.glob && (
                    <span className="text-muted-foreground font-mono">{rule.glob}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MCP Servers list */}
        {result.mcpServers.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">MCP Servers</p>
            <div className="space-y-1">
              {result.mcpServers.map((server, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-foreground/80">
                  <span className="size-1 rounded-full bg-foreground/30 shrink-0" />
                  <span className="font-medium">{server.name}</span>
                  <span className="text-muted-foreground">({server.type})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onRegenerate} className="flex-1">
            <ReloadIcon className="size-4" />
            Regenerate
          </Button>
          <Button onClick={onAccept} className="flex-1">
            <CheckIcon className="size-4" />
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stat Badge                                                          */
/* ------------------------------------------------------------------ */

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}
