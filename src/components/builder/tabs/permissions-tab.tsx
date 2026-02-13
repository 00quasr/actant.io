"use client";

import { useState } from "react";
import { PlusIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PermissionRow } from "@/components/builder/tabs/permission-row";
import { PERMISSION_PRESETS } from "@/lib/presets";

interface PermissionsTabProps {
  permissions: Record<string, "allow" | "ask" | "deny">;
  setPermission: (tool: string, value: "allow" | "ask" | "deny") => void;
  removePermission: (tool: string) => void;
  onApplyPreset: (permissions: Record<string, "allow" | "ask" | "deny">) => void;
}

export function PermissionsTab({
  permissions,
  setPermission,
  removePermission,
  onApplyPreset,
}: PermissionsTabProps) {
  const [newTool, setNewTool] = useState("");

  const entries = Object.entries(permissions);

  const handleAdd = () => {
    const tool = newTool.trim();
    if (!tool) return;
    setPermission(tool, "ask");
    setNewTool("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center mr-1">Presets:</span>
        {PERMISSION_PRESETS.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            size="sm"
            onClick={() => onApplyPreset(preset.permissions)}
            title={preset.description}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {entries.length > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-2 text-xs text-muted-foreground font-medium">
            <span>Tool</span>
            <span className="w-48 text-center">Permission</span>
            <span className="w-8" />
          </div>
          {entries.map(([tool, value]) => (
            <PermissionRow
              key={tool}
              tool={tool}
              value={value}
              onChange={(v) => setPermission(tool, v)}
              onRemove={() => removePermission(tool)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No permissions configured. Add tool permissions to control what your agent can access.
        </p>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={newTool}
          onChange={(e) => setNewTool(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tool name (e.g., Bash, Read, Write)"
          className="max-w-xs"
        />
        <Button variant="outline" size="sm" onClick={handleAdd} disabled={!newTool.trim()}>
          <PlusIcon />
          Add
        </Button>
      </div>
    </div>
  );
}
