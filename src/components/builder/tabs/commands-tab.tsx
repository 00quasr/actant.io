"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommandEditor } from "@/components/builder/tabs/command-editor";
import * as presets from "@/lib/presets";
import type { WorkflowCommand } from "@/types/config";

interface CommandPreset {
  id: string;
  label: string;
  description: string;
  commands: WorkflowCommand[];
}

const COMMAND_PRESETS: CommandPreset[] =
  "COMMAND_PRESETS" in presets
    ? (presets as Record<string, unknown>).COMMAND_PRESETS as CommandPreset[]
    : [];

interface CommandsTabProps {
  commands: WorkflowCommand[];
  onAdd: (command: WorkflowCommand) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, command: WorkflowCommand) => void;
}

export function CommandsTab({
  commands,
  onAdd,
  onRemove,
  onUpdate,
}: CommandsTabProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSave = (command: WorkflowCommand) => {
    if (editingIndex !== null) {
      onUpdate(editingIndex, command);
    } else {
      onAdd(command);
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

  const handleApplyPreset = (preset: CommandPreset) => {
    for (const cmd of preset.commands) {
      const exists = commands.some((c) => c.name === cmd.name);
      if (!exists) {
        onAdd(cmd);
      }
    }
  };

  const existingNames = commands.map((c) => c.name);

  return (
    <div className="space-y-4">
      {COMMAND_PRESETS.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center mr-1">
            Presets:
          </span>
          {COMMAND_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              onClick={() => handleApplyPreset(preset)}
              title={preset.description}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      )}

      {commands.length > 0 && (
        <div className="space-y-2">
          {commands.map((command, index) => (
            <div
              key={index}
              className="flex items-start justify-between rounded-lg border p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">
                    /{command.name}
                  </span>
                  {command.allowedTools && command.allowedTools.length > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      {command.allowedTools.length} tool
                      {command.allowedTools.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {command.description}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleEdit(index)}
                >
                  <Pencil1Icon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onRemove(index)}
                >
                  <TrashIcon />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editorOpen ? (
        <CommandEditor
          command={editingIndex !== null ? commands[editingIndex] : undefined}
          onSave={handleSave}
          onCancel={handleCancel}
          existingNames={existingNames}
        />
      ) : (
        <div>
          {commands.length === 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              No commands yet. Add workflow commands to automate development
              processes.
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditorOpen(true)}
          >
            <PlusIcon />
            Add Command
          </Button>
        </div>
      )}
    </div>
  );
}
