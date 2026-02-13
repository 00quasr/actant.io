"use client";

import { useState } from "react";
import { DownloadIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExportDialog } from "@/components/builder/export-dialog";
import type { ConfigState } from "@/hooks/use-config";
import type { SaveStatus } from "@/hooks/use-auto-save";
import { AGENT_TYPES, AGENT_LABELS, type AgentType } from "@/types/config";

interface BuilderHeaderProps {
  state: ConfigState;
  saveStatus: SaveStatus;
  setName: (name: string) => void;
  setTargetAgent: (agent: AgentType) => void;
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  switch (status) {
    case "saving":
      return <span className="text-xs text-muted-foreground">Saving...</span>;
    case "saved":
      return <span className="text-xs text-muted-foreground">Saved</span>;
    case "error":
      return <span className="text-xs text-destructive">Save failed</span>;
    default:
      return null;
  }
}

export function BuilderHeader({
  state,
  saveStatus,
  setName,
  setTargetAgent,
}: BuilderHeaderProps) {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="border-b px-6 py-4">
      <div className="flex items-center gap-4">
        <Input
          value={state.name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Config name"
          className="max-w-xs font-medium"
        />

        <Select
          value={state.targetAgent}
          onValueChange={(v) => setTargetAgent(v as AgentType)}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AGENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {AGENT_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <SaveIndicator status={saveStatus} />

        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
          <DownloadIcon />
          Export
        </Button>
      </div>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        state={state}
      />
    </div>
  );
}
