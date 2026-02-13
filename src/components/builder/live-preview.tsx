"use client";

import { useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { exportConfig, type ExportResult } from "@/lib/exporters";
import { ExportPreview } from "@/components/builder/preview/export-preview";
import type { ConfigState } from "@/hooks/use-config";

interface LivePreviewProps {
  state: ConfigState;
}

export function LivePreview({ state }: LivePreviewProps) {
  const debouncedState = useDebounce(state, 500);

  const result: ExportResult | null = useMemo(() => {
    try {
      return exportConfig({
        name: debouncedState.name,
        description: debouncedState.description,
        targetAgent: debouncedState.targetAgent,
        instructions: debouncedState.instructions,
        skills: debouncedState.skills,
        mcpServers: debouncedState.mcpServers,
        permissions: debouncedState.permissions,
        rules: debouncedState.rules,
      });
    } catch {
      return null;
    }
  }, [debouncedState]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b">
        <p className="text-xs font-medium text-muted-foreground">Live Preview</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {result && result.files.length > 0 ? (
          <ExportPreview files={result.files} />
        ) : (
          <p className="text-xs text-muted-foreground">
            Configure your agent to see a preview of the exported files.
          </p>
        )}
        {result && result.warnings.length > 0 && (
          <div className="mt-3 space-y-1">
            {result.warnings.map((w, i) => (
              <p key={i} className="text-xs text-muted-foreground">
                {w}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
