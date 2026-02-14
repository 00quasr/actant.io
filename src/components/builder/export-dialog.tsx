"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DownloadIcon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ExportPreview } from "@/components/builder/preview/export-preview";
import { exportConfig, type ExportResult } from "@/lib/exporters";
import { createZipBlob } from "@/lib/exporters/zip";
import { AGENT_TYPES, AGENT_LABELS, type AgentType } from "@/types/config";
import type { ConfigState } from "@/hooks/use-config";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: ConfigState;
}

export function ExportDialog({ open, onOpenChange, state }: ExportDialogProps) {
  const [targetAgent, setTargetAgent] = useState<AgentType>(state.targetAgent);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTargetAgent(state.targetAgent);
  }, [open, state.targetAgent]);

  useEffect(() => {
    if (!open) return;
    try {
      const exportResult = exportConfig({
        name: state.name,
        description: state.description,
        targetAgent,
        instructions: state.instructions,
        skills: state.skills,
        mcpServers: state.mcpServers,
        permissions: state.permissions,
        rules: state.rules,
        docs: state.docs,
      });
      setResult(exportResult);
    } catch {
      setResult(null);
    }
  }, [open, state, targetAgent]);

  const handleDownload = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      if (result.files.length === 1) {
        const file = result.files[0];
        const blob = new Blob([file.content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.path;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = await createZipBlob(result);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${state.name || "config"}-${targetAgent}.zip`;
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.success("Configuration exported successfully");
    } catch {
      toast.error("Failed to export");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Export Configuration</DialogTitle>
          <DialogDescription>
            Preview and download the generated files for your agent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-2">
            <Label>Target Agent</Label>
            <Select
              value={targetAgent}
              onValueChange={(v) => setTargetAgent(v as AgentType)}
            >
              <SelectTrigger className="w-48">
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
          </div>

          {result && result.warnings.length > 0 && (
            <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-xs font-medium text-destructive mb-1">Warnings</p>
              {result.warnings.map((w, i) => (
                <p key={i} className="text-xs text-destructive/80">{w}</p>
              ))}
            </div>
          )}

          {result && <ExportPreview files={result.files} />}
        </div>

        <DialogFooter>
          <Button
            onClick={handleDownload}
            disabled={!result || downloading}
          >
            <DownloadIcon />
            {downloading ? "Downloading..." : result && result.files.length === 1 ? "Download" : "Download ZIP"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
