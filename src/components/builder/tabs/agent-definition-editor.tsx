"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { AgentDefinition } from "@/types/config";

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

interface AgentDefinitionEditorProps {
  definition?: AgentDefinition;
  onSave: (definition: AgentDefinition) => void;
  onCancel: () => void;
  existingNames: string[];
}

export function AgentDefinitionEditor({
  definition,
  onSave,
  onCancel,
  existingNames,
}: AgentDefinitionEditorProps) {
  const [name, setName] = useState(definition?.name ?? "");
  const [description, setDescription] = useState(definition?.description ?? "");
  const [role, setRole] = useState(definition?.role ?? "");
  const [instructions, setInstructions] = useState(definition?.instructions ?? "");
  const [tools, setTools] = useState<string[]>(definition?.tools ?? []);

  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const isValidSlug = name.length === 0 || slugPattern.test(name);
  const isDuplicate =
    name.length > 0 &&
    existingNames.some((n) => n === name && n !== definition?.name);

  const canSubmit =
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    role.trim().length > 0 &&
    instructions.trim().length > 0 &&
    isValidSlug &&
    !isDuplicate;

  const handleToolToggle = (tool: string, checked: boolean) => {
    setTools((prev) => (checked ? [...prev, tool] : prev.filter((t) => t !== tool)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      role: role.trim(),
      instructions: instructions.trim(),
      tools: tools.length > 0 ? tools : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="agent-name">Name</Label>
          <Input
            id="agent-name"
            value={name}
            onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="planner"
            className="font-mono"
          />
          {!isValidSlug && (
            <p className="text-xs text-destructive">
              Use lowercase letters, numbers, and hyphens only
            </p>
          )}
          {isDuplicate && (
            <p className="text-xs text-destructive">An agent with this name already exists</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="agent-role">Role</Label>
          <Input
            id="agent-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="You are a project planner who decomposes work into atomic tasks"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="agent-description">Description</Label>
        <Input
          id="agent-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Creates executable plans with task breakdown"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="agent-instructions">Instructions</Label>
        <Textarea
          id="agent-instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Detailed instructions for this agent..."
          rows={8}
          className="min-h-[12rem]"
        />
      </div>

      <div className="space-y-2">
        <Label>Tools (optional)</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {AVAILABLE_TOOLS.map((tool) => (
            <div key={tool} className="flex items-center gap-2">
              <Checkbox
                id={`tool-${tool}`}
                checked={tools.includes(tool)}
                onCheckedChange={(checked) => handleToolToggle(tool, checked === true)}
              />
              <Label htmlFor={`tool-${tool}`} className="font-mono text-xs font-normal">
                {tool}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" size="sm" disabled={!canSubmit}>
          {definition ? "Update" : "Add"} Agent
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
