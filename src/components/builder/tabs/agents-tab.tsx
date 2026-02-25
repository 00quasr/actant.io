"use client";

import { useState } from "react";
import { PlusIcon, TrashIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AgentDefinitionEditor } from "@/components/builder/tabs/agent-definition-editor";
import { AGENT_DEFINITION_PRESETS } from "@/lib/presets";
import type { AgentDefinition } from "@/types/config";

interface AgentsTabProps {
  agentDefinitions: AgentDefinition[];
  onAdd: (definition: AgentDefinition) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, definition: AgentDefinition) => void;
}

export function AgentsTab({ agentDefinitions, onAdd, onRemove, onUpdate }: AgentsTabProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSave = (definition: AgentDefinition) => {
    if (editingIndex !== null) {
      onUpdate(editingIndex, definition);
    } else {
      onAdd(definition);
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

  const existingNames = agentDefinitions.map((d) => d.name);

  return (
    <div className="space-y-4">
      {AGENT_DEFINITION_PRESETS.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center mr-1">Presets:</span>
          {AGENT_DEFINITION_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              onClick={() => {
                for (const def of preset.agentDefinitions) {
                  if (!agentDefinitions.some((d) => d.name === def.name)) {
                    onAdd(def);
                  }
                }
              }}
              title={preset.description}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      )}

      {agentDefinitions.length > 0 && (
        <div className="space-y-2">
          {agentDefinitions.map((definition, index) => (
            <div key={index} className="flex items-start justify-between rounded-lg border p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">{definition.name}</span>
                  {definition.tools && definition.tools.length > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      {definition.tools.length} tool{definition.tools.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{definition.role}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">
                  {definition.description}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <Button variant="ghost" size="icon-xs" onClick={() => handleEdit(index)}>
                  <Pencil1Icon />
                </Button>
                <Button variant="ghost" size="icon-xs" onClick={() => onRemove(index)}>
                  <TrashIcon />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editorOpen ? (
        <AgentDefinitionEditor
          definition={editingIndex !== null ? agentDefinitions[editingIndex] : undefined}
          onSave={handleSave}
          onCancel={handleCancel}
          existingNames={existingNames}
        />
      ) : (
        <div>
          {agentDefinitions.length === 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              No agents defined. Add agent definitions to create specialized roles for your
              workflow.
            </p>
          )}
          <Button variant="outline" size="sm" onClick={() => setEditorOpen(true)}>
            <PlusIcon />
            Add Agent
          </Button>
        </div>
      )}
    </div>
  );
}
