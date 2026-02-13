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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

  function removeStackItem(item: string) {
    setTechStack((prev) => prev.filter((t) => t !== item));
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

  const isFormValid =
    projectDescription.length >= 10 && techStack.length >= 1;

  function renderStep() {
    if (status === "idle" || (status === "error" && questions.length === 0)) {
      return (
        <InputForm
          projectDescription={projectDescription}
          setProjectDescription={setProjectDescription}
          techStack={techStack}
          toggleStackItem={toggleStackItem}
          removeStackItem={removeStackItem}
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
        <LoadingState message="Generating questions..." subtitle="Analyzing your project to ask the right questions." />
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
        <LoadingState message="Generating configuration..." subtitle="This may take a few seconds." />
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
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MagicWandIcon className="size-4" />
            Generate with AI
          </DialogTitle>
          <DialogDescription>
            {status === "answering"
              ? "Answer a few questions to improve the generated configuration."
              : "Describe your project and we will generate a configuration for you."}
          </DialogDescription>
        </DialogHeader>

        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Input Form (Step 1)                                                 */
/* ------------------------------------------------------------------ */

interface InputFormProps {
  projectDescription: string;
  setProjectDescription: (v: string) => void;
  techStack: string[];
  toggleStackItem: (item: string) => void;
  removeStackItem: (item: string) => void;
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

function InputForm({
  projectDescription,
  setProjectDescription,
  techStack,
  toggleStackItem,
  removeStackItem,
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
}: InputFormProps) {
  return (
    <div className="space-y-5 flex-1 min-h-0 overflow-y-auto">
      {/* Project description */}
      <div className="space-y-2">
        <Label htmlFor="project-description">Project description</Label>
        <Textarea
          id="project-description"
          placeholder="Describe your project: what it does, its architecture, key conventions..."
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          className="min-h-24 resize-none"
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground">
          {projectDescription.length}/2000 characters (minimum 10)
        </p>
      </div>

      {/* Tech stack */}
      <div className="space-y-2">
        <Label>Tech stack</Label>
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

        {/* Selected custom items */}
        {techStack.filter(
          (t) =>
            !QUICK_STACK_OPTIONS.includes(
              t as (typeof QUICK_STACK_OPTIONS)[number]
            )
        ).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {techStack
              .filter(
                (t) =>
                  !QUICK_STACK_OPTIONS.includes(
                    t as (typeof QUICK_STACK_OPTIONS)[number]
                  )
              )
              .map((tech) => (
                <Badge key={tech} variant="default" className="gap-1">
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeStackItem(tech)}
                    className="ml-0.5 hover:opacity-70"
                  >
                    <Cross2Icon className="size-3" />
                  </button>
                </Badge>
              ))}
          </div>
        )}

        {/* Custom input */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom tech..."
            value={customTech}
            onChange={(e) => setCustomTech(e.target.value)}
            onKeyDown={handleCustomKeyDown}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addCustomTech}
            disabled={!customTech.trim()}
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>
      </div>

      {/* Include options */}
      <div className="space-y-3">
        <Label>Include in generation</Label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={includeRules}
              onCheckedChange={(v) => setIncludeRules(v === true)}
            />
            <span className="text-sm">Rules</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={includeMcp}
              onCheckedChange={(v) => setIncludeMcp(v === true)}
            />
            <span className="text-sm">MCP Servers</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={includePermissions}
              onCheckedChange={(v) => setIncludePermissions(v === true)}
            />
            <span className="text-sm">Permissions</span>
          </label>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Next button */}
      <Button onClick={onNext} disabled={!isFormValid} className="w-full">
        <ArrowRightIcon className="size-4" />
        Next
      </Button>
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
    <div className="space-y-5 flex-1 min-h-0 overflow-y-auto">
      <div className="space-y-4">
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
                  <div
                    key={option}
                    className="flex items-center gap-2"
                  >
                    <RadioGroupItem
                      value={option}
                      id={`${q.id}-${option}`}
                    />
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
      </div>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={onSkip} className="flex-1">
          Skip
        </Button>
        <Button onClick={onGenerate} className="flex-1">
          <MagicWandIcon className="size-4" />
          Generate
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Loading State (Steps 2 & 4)                                         */
/* ------------------------------------------------------------------ */

function LoadingState({
  message,
  subtitle,
}: {
  message: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <ReloadIcon className="size-6 animate-spin text-muted-foreground" />
      <div className="text-center space-y-1">
        <p className="text-sm font-medium">{message}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Preview State (Step 5)                                              */
/* ------------------------------------------------------------------ */

interface PreviewStateProps {
  result: AgentConfig;
  onAccept: () => void;
  onRegenerate: () => void;
}

function PreviewState({ result, onAccept, onRegenerate }: PreviewStateProps) {
  return (
    <div className="space-y-4 flex-1 min-h-0 overflow-y-auto">
      <div className="space-y-3">
        {/* Name & description */}
        <div className="space-y-1">
          <p className="text-sm font-medium">{result.name}</p>
          <p className="text-xs text-muted-foreground">
            {result.description}
          </p>
        </div>

        {/* Summary stats */}
        <div className="flex flex-wrap gap-2">
          <SummaryBadge
            label="Instructions"
            value={`${result.instructions.content.length} chars`}
          />
          <SummaryBadge
            label="Rules"
            value={String(result.rules.length)}
          />
          <SummaryBadge
            label="MCP Servers"
            value={String(result.mcpServers.length)}
          />
          <SummaryBadge
            label="Permissions"
            value={String(Object.keys(result.permissions).length)}
          />
        </div>

        {/* Instructions preview */}
        {result.instructions.content && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Instructions preview
            </p>
            <div className="rounded-md border bg-muted/30 p-3 max-h-40 overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed">
                {result.instructions.content.slice(0, 800)}
                {result.instructions.content.length > 800 && "..."}
              </pre>
            </div>
          </div>
        )}

        {/* Rules list */}
        {result.rules.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Rules</p>
            <div className="space-y-1">
              {result.rules.map((rule, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-foreground/80"
                >
                  <span className="size-1 rounded-full bg-foreground/30 shrink-0" />
                  <span>{rule.title}</span>
                  {rule.glob && (
                    <span className="text-muted-foreground font-mono">
                      {rule.glob}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MCP Servers list */}
        {result.mcpServers.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              MCP Servers
            </p>
            <div className="space-y-1">
              {result.mcpServers.map((server, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-foreground/80"
                >
                  <span className="size-1 rounded-full bg-foreground/30 shrink-0" />
                  <span className="font-medium">{server.name}</span>
                  <span className="text-muted-foreground">
                    ({server.type})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
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
  );
}

/* ------------------------------------------------------------------ */
/* Summary Badge                                                       */
/* ------------------------------------------------------------------ */

function SummaryBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}
