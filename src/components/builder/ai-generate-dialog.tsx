"use client";

import { useState, useCallback, useEffect } from "react";
import {
  MagicWandIcon,
  Cross2Icon,
  CheckIcon,
  ReloadIcon,
  PlusIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  FileTextIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useConfigGeneration } from "@/hooks/use-config-generation";
import { UpgradeDialog } from "@/components/billing/upgrade-dialog";
import { listSkills } from "@/services/skills";
import type { AgentConfig, AgentType } from "@/types/config";
import type { Skill } from "@/types/marketplace";
import type { ClarifyingQuestion } from "@/lib/ai/questions-schema";
import type { QuestionAnswer } from "@/lib/ai/prompts";

const QUICK_STACK_OPTIONS = ["React", "Next.js", "Vue", "Node.js", "Python", "Rust", "Go"] as const;

const LOADING_STAGES = [
  "Analyzing project context...",
  "Generating instructions...",
  "Configuring MCP servers...",
  "Setting permissions...",
  "Creating rules...",
  "Generating documentation...",
];

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
    autoAnswering,
    limitReached,
    generate,
    generateQuestions,
    autoAnswer,
    reset,
  } = useConfigGeneration();

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [projectDescription, setProjectDescription] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [customTech, setCustomTech] = useState("");
  const [includeRules, setIncludeRules] = useState(true);
  const [includeMcp, setIncludeMcp] = useState(true);
  const [includePermissions, setIncludePermissions] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [, setSelectedSkillIds] = useState<string[]>([]);
  const [showSkillPicker, setShowSkillPicker] = useState(false);

  const resetForm = useCallback(() => {
    setProjectDescription("");
    setTechStack([]);
    setCustomTech("");
    setIncludeRules(true);
    setIncludeMcp(true);
    setIncludePermissions(true);
    setAnswers({});
    setSelectedSkillIds([]);
    setShowSkillPicker(false);
    setShowUpgrade(false);
    reset();
  }, [reset]);

  useEffect(() => {
    if (limitReached) {
      setShowUpgrade(true); // eslint-disable-line react-hooks/set-state-in-effect -- syncing derived state from hook
    }
  }, [limitReached]);

  function handleClose() {
    resetForm();
    onOpenChange(false);
  }

  function toggleStackItem(item: string) {
    setTechStack((prev) =>
      prev.includes(item) ? prev.filter((t) => t !== item) : [...prev, item],
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

  function handleAnswersDone(withAnswers: boolean) {
    if (withAnswers) {
      setShowSkillPicker(true);
    } else {
      doGenerate(false, []);
    }
  }

  async function handleSkillsDone(skillIds: string[]) {
    setSelectedSkillIds(skillIds);
    setShowSkillPicker(false);
    await doGenerate(true, skillIds);
  }

  function handleSkipSkills() {
    setShowSkillPicker(false);
    doGenerate(true, []);
  }

  async function doGenerate(withAnswers: boolean, skillIds: string[]) {
    await generate({
      projectDescription,
      techStack,
      targetAgent,
      includeRules,
      includeMcp,
      includePermissions,
      answers: withAnswers ? buildAnswersPayload() : undefined,
      selectedSkillIds: skillIds.length > 0 ? skillIds : undefined,
    });
  }

  async function handleAutoAnswer() {
    const result = await autoAnswer(projectDescription, techStack, questions);
    if (result) {
      setAnswers((prev) => ({ ...prev, ...result }));
    }
  }

  function handleAccept() {
    if (result) {
      onAccept(result);
      handleClose();
    }
  }

  function handleRegenerate() {
    reset();
    setAnswers({});
    setSelectedSkillIds([]);
    setShowSkillPicker(false);
  }

  const isFormValid = projectDescription.length >= 10;

  let currentStep = 0;
  if (status === "asking") currentStep = 1;
  else if (status === "answering") currentStep = 1;
  else if (showSkillPicker) currentStep = 2;
  else if (status === "generating") currentStep = 3;
  else if (status === "done") currentStep = 4;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 backdrop-blur px-6 py-3">
        <div className="flex items-center gap-3">
          <MagicWandIcon className="size-4" />
          <span className="text-sm font-medium">Generate with AI</span>
        </div>
        <div className="flex items-center gap-4">
          <StepIndicator current={currentStep} total={5} />
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <Cross2Icon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-16 px-8">
        {(status === "idle" || (status === "error" && questions.length === 0)) && (
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
        )}

        {status === "asking" && <StagedLoading contextLabel="Generating questions..." />}

        {(status === "answering" || (status === "error" && questions.length > 0)) &&
          !showSkillPicker && (
            <AnswerForm
              questions={questions}
              answers={answers}
              setAnswers={setAnswers}
              error={error}
              autoAnswering={autoAnswering}
              onAutoAnswer={handleAutoAnswer}
              onSkip={() => handleAnswersDone(false)}
              onGenerate={() => handleAnswersDone(true)}
            />
          )}

        {showSkillPicker && status !== "generating" && (
          <SkillPicker onDone={handleSkillsDone} onSkip={handleSkipSkills} />
        )}

        {status === "generating" && <StagedLoading contextLabel="Generating configuration..." />}

        {status === "done" && result && (
          <PreviewState result={result} onAccept={handleAccept} onRegenerate={handleRegenerate} />
        )}
      </div>

      <UpgradeDialog open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step Indicator                                                      */
/* ------------------------------------------------------------------ */

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i === current
              ? "w-6 bg-foreground"
              : i < current
                ? "w-1.5 bg-foreground/40"
                : "w-1.5 bg-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero Input (Step 1)                                                 */
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
    (t) => !QUICK_STACK_OPTIONS.includes(t as (typeof QUICK_STACK_OPTIONS)[number]),
  );

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold tracking-tight">What are you building?</h2>
        <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Describe your project and we&apos;ll generate a tailored agent config with instructions,
          rules, MCP servers, permissions, and documentation.
        </p>
      </div>

      <div className="w-full">
        <div className="relative rounded-2xl border bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring/50">
          <Textarea
            placeholder="I'm building a Next.js SaaS app with Supabase auth, Stripe billing, and a dashboard..."
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="min-h-48 resize-none border-0 shadow-none focus-visible:ring-0 text-sm leading-relaxed p-5"
            maxLength={2000}
          />
          <div className="flex items-center justify-between px-5 pb-4">
            <span className="text-xs text-muted-foreground">
              {projectDescription.length > 0 && `${projectDescription.length}/2000`}
            </span>
          </div>
        </div>

        <Button
          onClick={onNext}
          disabled={!isFormValid}
          size="lg"
          className="w-full mt-4 rounded-xl"
        >
          Generate Configuration
          <ArrowRightIcon className="ml-1.5 size-4" />
        </Button>

        <div className="mt-8">
          <p className="text-xs text-muted-foreground mb-3">Select your stack (optional)</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_STACK_OPTIONS.map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => toggleStackItem(tech)}
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
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
                className="inline-flex items-center gap-1 rounded-full border border-foreground bg-foreground text-background px-3 py-1.5 text-xs font-medium"
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
                className="h-8 w-24 text-xs rounded-full border-dashed"
              />
              {customTech.trim() && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full"
                  onClick={addCustomTech}
                >
                  <PlusIcon className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-xs text-muted-foreground mb-3">Include in generation</p>
          <div className="grid grid-cols-3 gap-2">
            <ToggleCard
              label="Rules"
              description="Coding conventions"
              active={includeRules}
              onToggle={() => setIncludeRules(!includeRules)}
            />
            <ToggleCard
              label="MCP Servers"
              description="External tools"
              active={includeMcp}
              onToggle={() => setIncludeMcp(!includeMcp)}
            />
            <ToggleCard
              label="Permissions"
              description="Tool access"
              active={includePermissions}
              onToggle={() => setIncludePermissions(!includePermissions)}
            />
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-md border border-destructive/20 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toggle Card                                                         */
/* ------------------------------------------------------------------ */

function ToggleCard({
  label,
  description,
  active,
  onToggle,
}: {
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-lg border p-3 text-left transition-colors ${
        active
          ? "border-foreground bg-foreground/[0.03]"
          : "border-border text-muted-foreground hover:border-foreground/20"
      }`}
    >
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs font-medium">{label}</span>
        {active && <CheckIcon className="size-3" />}
      </div>
      <span className="text-[11px] text-muted-foreground">{description}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Answer Form (Step 2)                                                */
/* ------------------------------------------------------------------ */

interface AnswerFormProps {
  questions: ClarifyingQuestion[];
  answers: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  error: string | null;
  autoAnswering: boolean;
  onAutoAnswer: () => void;
  onSkip: () => void;
  onGenerate: () => void;
}

function AnswerForm({
  questions,
  answers,
  setAnswers,
  error,
  autoAnswering,
  onAutoAnswer,
  onSkip,
  onGenerate,
}: AnswerFormProps) {
  function setAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold tracking-tight">A few quick questions</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Help us understand your project better for a more accurate config.
        </p>
      </div>

      <div className="w-full space-y-6">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onAutoAnswer} disabled={autoAnswering}>
            {autoAnswering ? (
              <>
                <span className="size-3 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin mr-2" />
                Auto-filling...
              </>
            ) : (
              <>
                <MagicWandIcon className="size-3.5 mr-1.5" />
                Auto-answer with AI
              </>
            )}
          </Button>
        </div>

        {questions.map((q, i) => (
          <div key={q.id} className="rounded-lg border p-5 space-y-3">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium leading-relaxed">{q.question}</p>
              <span className="text-xs text-muted-foreground shrink-0 ml-3">
                {i + 1} of {questions.length}
              </span>
            </div>
            {q.context && <p className="text-xs text-muted-foreground">{q.context}</p>}

            {q.type === "multiple_choice" && q.options ? (
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAnswer(q.id, option)}
                    className={`rounded-md border px-3 py-2 text-xs text-left transition-colors ${
                      answers[q.id] === option
                        ? "border-foreground bg-foreground/[0.03] font-medium"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
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
            Skip Questions
          </Button>
          <Button onClick={onGenerate} className="flex-1">
            <ArrowRightIcon className="size-4" />
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skill Picker (Step 3)                                               */
/* ------------------------------------------------------------------ */

interface SkillPickerProps {
  onDone: (skillIds: string[]) => void;
  onSkip: () => void;
}

function SkillPicker({ onDone, onSkip }: SkillPickerProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await listSkills();
        if (!cancelled) setSkills(data);
      } catch {
        // Non-fatal
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleSkill(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const filtered = skills.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q)) ||
      s.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold tracking-tight">Add skills</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Optionally include skills to enhance your agent&apos;s capabilities.
        </p>
      </div>

      <div className="w-full space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="max-h-80 overflow-y-auto space-y-2">
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading skills...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {searchQuery ? "No skills match your search." : "No skills available."}
            </div>
          ) : (
            filtered.map((skill) => {
              const isSelected = selected.has(skill.id);
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleSkill(skill.id)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    isSelected
                      ? "border-foreground bg-foreground/[0.03]"
                      : "border-border hover:border-foreground/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium truncate">{skill.name}</span>
                      <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">
                        {skill.category}
                      </span>
                      {skill.is_official && (
                        <span className="shrink-0 rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-medium">
                          Official
                        </span>
                      )}
                    </div>
                    {isSelected && <CheckIcon className="size-4 shrink-0 ml-2" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {skill.description}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {selected.size > 0 && (
          <p className="text-xs text-muted-foreground">
            {selected.size} skill{selected.size !== 1 ? "s" : ""} selected
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onSkip} className="flex-1">
            Skip
          </Button>
          <Button onClick={() => onDone(Array.from(selected))} className="flex-1">
            <MagicWandIcon className="size-4" />
            Generate Config
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Staged Loading                                                      */
/* ------------------------------------------------------------------ */

function StagedLoading({ contextLabel }: { contextLabel: string }) {
  const [visibleStage, setVisibleStage] = useState(0);

  useEffect(() => {
    setVisibleStage(0);
    const timers: NodeJS.Timeout[] = [];
    for (let i = 1; i < LOADING_STAGES.length; i++) {
      timers.push(setTimeout(() => setVisibleStage(i), i * 1500));
    }
    return () => timers.forEach(clearTimeout);
  }, [contextLabel]);

  return (
    <div className="flex flex-col items-center py-16">
      <p className="text-sm font-medium animate-pulse mb-10">{contextLabel}</p>

      <div className="w-full max-w-sm space-y-3">
        {LOADING_STAGES.map((label, i) => {
          const isDone = i < visibleStage;
          const isActive = i === visibleStage;
          const isPending = i > visibleStage;

          return (
            <div
              key={i}
              className={`flex items-center gap-3 transition-opacity duration-500 ${
                isPending ? "opacity-0" : "opacity-100"
              }`}
            >
              {isDone ? (
                <div className="size-5 rounded-full bg-foreground/10 flex items-center justify-center">
                  <CheckIcon className="size-3 text-foreground" />
                </div>
              ) : isActive ? (
                <div className="size-5 rounded-full bg-foreground/5 flex items-center justify-center">
                  <div className="size-2 rounded-full bg-foreground animate-pulse" />
                </div>
              ) : (
                <div className="size-5 rounded-full border border-muted-foreground/20" />
              )}
              <span
                className={`text-sm ${
                  isDone
                    ? "text-muted-foreground"
                    : isActive
                      ? "text-foreground font-medium"
                      : "text-muted-foreground/50"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
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
  const [expandedSection, setExpandedSection] = useState<string | null>("instructions");
  const docsCount = result.docs ? Object.keys(result.docs).length : 0;

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold tracking-tight">Your config is ready</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Review the generated configuration before applying it.
        </p>
      </div>

      <div className="w-full space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">{result.name}</p>
          {result.description && (
            <p className="text-xs text-muted-foreground">{result.description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <StatBadge label="Instructions" value={`${result.instructions.content.length} chars`} />
          <StatBadge label="Rules" value={String(result.rules.length)} />
          <StatBadge label="MCP Servers" value={String(result.mcpServers.length)} />
          <StatBadge label="Permissions" value={String(Object.keys(result.permissions).length)} />
          {result.skills.length > 0 && (
            <StatBadge label="Skills" value={String(result.skills.length)} />
          )}
          {docsCount > 0 && <StatBadge label="Docs" value={String(docsCount)} />}
        </div>

        {/* Instructions */}
        {result.instructions.content && (
          <PreviewSection
            title="Instructions"
            sectionId="instructions"
            expanded={expandedSection}
            onToggle={setExpandedSection}
          >
            <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed">
              {result.instructions.content.slice(0, 2000)}
              {result.instructions.content.length > 2000 && "..."}
            </pre>
          </PreviewSection>
        )}

        {/* Rules */}
        {result.rules.length > 0 && (
          <PreviewSection
            title={`Rules (${result.rules.length})`}
            sectionId="rules"
            expanded={expandedSection}
            onToggle={setExpandedSection}
          >
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
          </PreviewSection>
        )}

        {/* MCP Servers */}
        {result.mcpServers.length > 0 && (
          <PreviewSection
            title={`MCP Servers (${result.mcpServers.length})`}
            sectionId="mcp"
            expanded={expandedSection}
            onToggle={setExpandedSection}
          >
            <div className="space-y-1">
              {result.mcpServers.map((server, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-foreground/80">
                  <span className="size-1 rounded-full bg-foreground/30 shrink-0" />
                  <span className="font-medium">{server.name}</span>
                  <span className="text-muted-foreground">({server.type})</span>
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {/* Permissions */}
        {Object.keys(result.permissions).length > 0 && (
          <PreviewSection
            title={`Permissions (${Object.keys(result.permissions).length})`}
            sectionId="permissions"
            expanded={expandedSection}
            onToggle={setExpandedSection}
          >
            <div className="space-y-1">
              {Object.entries(result.permissions).map(([tool, value]) => (
                <div key={tool} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-foreground/80">{tool}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      value === "allow"
                        ? "bg-green-500/10 text-green-700"
                        : value === "deny"
                          ? "bg-red-500/10 text-red-700"
                          : "bg-amber-500/10 text-amber-700"
                    }`}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {/* Skills */}
        {result.skills.length > 0 && (
          <PreviewSection
            title={`Skills (${result.skills.length})`}
            sectionId="skills"
            expanded={expandedSection}
            onToggle={setExpandedSection}
          >
            <div className="space-y-1">
              {result.skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-foreground/80">
                  <span className="size-1 rounded-full bg-foreground/30 shrink-0" />
                  <span className="font-medium">{skill.skillId}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      skill.enabled
                        ? "bg-green-500/10 text-green-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {skill.enabled ? "enabled" : "disabled"}
                  </span>
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {/* Docs */}
        {docsCount > 0 && result.docs && (
          <PreviewSection
            title={`Documentation (${docsCount})`}
            sectionId="docs"
            expanded={expandedSection}
            onToggle={setExpandedSection}
          >
            <div className="space-y-2">
              {Object.entries(result.docs).map(([filename, content]) => (
                <div key={filename} className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-foreground/80">
                    <FileTextIcon className="size-3 shrink-0" />
                    <span className="font-medium">{filename}</span>
                    <span className="text-muted-foreground">{content.length} chars</span>
                  </div>
                  <pre className="text-[11px] text-muted-foreground whitespace-pre-wrap font-mono pl-5 line-clamp-3">
                    {content.slice(0, 200)}
                    {content.length > 200 && "..."}
                  </pre>
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {/* Actions */}
        <div className="pt-4 space-y-2">
          <Button onClick={onAccept} size="lg" className="w-full rounded-xl">
            <CheckIcon className="size-4" />
            Accept &amp; Configure
          </Button>
          <Button variant="outline" onClick={onRegenerate} className="w-full">
            <ReloadIcon className="size-4" />
            Regenerate
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Preview Section                                                     */
/* ------------------------------------------------------------------ */

function PreviewSection({
  title,
  sectionId,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  sectionId: string;
  expanded: string | null;
  onToggle: (id: string | null) => void;
  children: React.ReactNode;
}) {
  const isOpen = expanded === sectionId;

  return (
    <div className="rounded-lg border">
      <button
        onClick={() => onToggle(isOpen ? null : sectionId)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors"
      >
        {title}
        <span className="text-xs text-muted-foreground">{isOpen ? "Collapse" : "Expand"}</span>
      </button>
      {isOpen && <div className="border-t px-4 py-3 max-h-64 overflow-y-auto">{children}</div>}
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
