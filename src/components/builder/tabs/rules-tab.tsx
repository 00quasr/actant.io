"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RuleEditor } from "@/components/builder/tabs/rule-editor";
import { RULE_PRESETS } from "@/lib/presets";
import type { Rule } from "@/types/config";

interface RulesTabProps {
  rules: Rule[];
  addRule: (rule: Rule) => void;
  removeRule: (index: number) => void;
  updateRule: (index: number, rule: Rule) => void;
  onApplyPreset: (rules: Rule[]) => void;
}

export function RulesTab({ rules, addRule, removeRule, updateRule, onApplyPreset }: RulesTabProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSave = (rule: Rule) => {
    if (editingIndex !== null) {
      updateRule(editingIndex, rule);
    } else {
      addRule(rule);
    }
    setEditorOpen(false);
    setEditingIndex(null);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditorOpen(true);
  };

  const handleCancel = () => {
    setEditorOpen(false);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center mr-1">Presets:</span>
        {RULE_PRESETS.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            size="sm"
            onClick={() => onApplyPreset(preset.rules)}
            title={preset.description}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {rules.length > 0 && (
        <div className="space-y-2">
          {rules.map((rule, index) => (
            <div key={index} className="flex items-start justify-between rounded-lg border p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{rule.title}</span>
                  {rule.alwaysApply && (
                    <Badge variant="secondary" className="text-[10px]">
                      Always
                    </Badge>
                  )}
                  {rule.glob && (
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {rule.glob}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{rule.content}</p>
              </div>
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(index)}>
                  <Pencil1Icon />
                </Button>
                <Button variant="ghost" size="icon-xs" onClick={() => removeRule(index)}>
                  <TrashIcon />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editorOpen ? (
        <RuleEditor
          initial={editingIndex !== null ? rules[editingIndex] : undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <div>
          {rules.length === 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              No rules configured. Rules let you define file-specific or global behavior guidelines.
            </p>
          )}
          <Button variant="outline" size="sm" onClick={() => setEditorOpen(true)}>
            <PlusIcon />
            Add Rule
          </Button>
        </div>
      )}
    </div>
  );
}
