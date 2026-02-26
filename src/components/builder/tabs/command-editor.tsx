"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { WorkflowCommand } from "@/types/config";

const AVAILABLE_TOOLS = [
  "Read",
  "Write",
  "Edit",
  "Bash",
  "Glob",
  "Grep",
  "Task",
  "WebFetch",
  "WebSearch",
  "AskUserQuestion",
] as const;

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface CommandEditorProps {
  command?: WorkflowCommand;
  onSave: (command: WorkflowCommand) => void;
  onCancel: () => void;
  existingNames: string[];
}

export function CommandEditor({ command, onSave, onCancel, existingNames }: CommandEditorProps) {
  const [name, setName] = useState(command?.name ?? "");
  const [description, setDescription] = useState(command?.description ?? "");
  const [argumentHint, setArgumentHint] = useState(command?.argumentHint ?? "");
  const [allowedTools, setAllowedTools] = useState<string[]>(command?.allowedTools ?? []);
  const [prompt, setPrompt] = useState(command?.prompt ?? "");

  const nameError = (() => {
    const trimmed = name.trim();
    if (!trimmed) return undefined;
    if (!SLUG_REGEX.test(trimmed)) {
      return "Use lowercase letters, numbers, and hyphens only";
    }
    const isDuplicate = existingNames.some(
      (existing) => existing === trimmed && existing !== command?.name,
    );
    if (isDuplicate) {
      return "A command with this name already exists";
    }
    return undefined;
  })();

  const canSubmit = name.trim() && !nameError && description.trim() && prompt.trim();

  const handleToolToggle = (tool: string, checked: boolean) => {
    setAllowedTools((prev) => (checked ? [...prev, tool] : prev.filter((t) => t !== tool)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      argumentHint: argumentHint.trim() || undefined,
      allowedTools: allowedTools.length > 0 ? allowedTools : undefined,
      prompt: prompt.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cmd-name">Name</Label>
          <Input
            id="cmd-name"
            value={name}
            onChange={(e) => setName(e.target.value.toLowerCase())}
            placeholder="plan-phase"
            className="font-mono"
          />
          {nameError && <p className="text-xs text-destructive">{nameError}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cmd-description">Description</Label>
          <Input
            id="cmd-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Create a detailed plan for the current phase"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cmd-argument-hint">Argument Hint (optional)</Label>
        <Input
          id="cmd-argument-hint"
          value={argumentHint}
          onChange={(e) => setArgumentHint(e.target.value)}
          placeholder="[phase-number] [--auto]"
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label>Allowed Tools (optional)</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {AVAILABLE_TOOLS.map((tool) => (
            <div key={tool} className="flex items-center gap-2">
              <Checkbox
                id={`tool-${tool}`}
                checked={allowedTools.includes(tool)}
                onCheckedChange={(checked) => handleToolToggle(tool, checked === true)}
              />
              <Label htmlFor={`tool-${tool}`} className="font-mono text-xs font-normal">
                {tool}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cmd-prompt">Prompt</Label>
        <Textarea
          id="cmd-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what this command should do..."
          className="min-h-36"
          rows={6}
        />
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" size="sm" disabled={!canSubmit}>
          {command ? "Update" : "Add"} Command
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
