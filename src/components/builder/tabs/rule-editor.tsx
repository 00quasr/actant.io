"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { Rule } from "@/types/config";

interface RuleEditorProps {
  initial?: Rule;
  onSave: (rule: Rule) => void;
  onCancel: () => void;
}

export function RuleEditor({ initial, onSave, onCancel }: RuleEditorProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [glob, setGlob] = useState(initial?.glob ?? "");
  const [alwaysApply, setAlwaysApply] = useState(initial?.alwaysApply ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSave({
      title: title.trim(),
      content: content.trim(),
      glob: glob.trim() || undefined,
      alwaysApply,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border p-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rule-title">Title</Label>
          <Input
            id="rule-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Rule title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rule-glob">Glob Pattern (optional)</Label>
          <Input
            id="rule-glob"
            value={glob}
            onChange={(e) => setGlob(e.target.value)}
            placeholder="**/*.tsx"
            className="font-mono"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rule-content">Content</Label>
        <Textarea
          id="rule-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe the rule..."
          className="min-h-32"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="rule-always"
          checked={alwaysApply}
          onCheckedChange={(checked) => setAlwaysApply(checked === true)}
        />
        <Label htmlFor="rule-always" className="font-normal">
          Always apply this rule
        </Label>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" size="sm" disabled={!title.trim() || !content.trim()}>
          {initial ? "Update" : "Add"} Rule
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
