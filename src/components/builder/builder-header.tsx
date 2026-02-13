"use client";

import { useState } from "react";
import {
  DownloadIcon,
  MagicWandIcon,
  Share2Icon,
  GitHubLogoIcon,
  EyeOpenIcon,
  EyeClosedIcon,
} from "@radix-ui/react-icons";
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
import { AiGenerateDialog } from "@/components/builder/ai-generate-dialog";
import { RepoImportDialog } from "@/components/builder/repo-import-dialog";
import { PublishDialog } from "@/components/builder/publish-dialog";
import { TemplatePicker } from "@/components/builder/tabs/template-picker";
import type { ConfigState } from "@/hooks/use-config";
import type { SaveStatus } from "@/hooks/use-auto-save";
import type { AgentConfig } from "@/types/config";
import type { Template } from "@/types/marketplace";
import { AGENT_TYPES, AGENT_LABELS, type AgentType } from "@/types/config";

interface BuilderHeaderProps {
  state: ConfigState;
  saveStatus: SaveStatus;
  configId: string | null;
  setName: (name: string) => void;
  setTargetAgent: (agent: AgentType) => void;
  onAcceptGenerated: (config: AgentConfig) => void;
  previewVisible: boolean;
  onTogglePreview: () => void;
  templatePickerOpen: boolean;
  onTemplatePickerOpenChange: (open: boolean) => void;
  onLoadTemplate: (template: Template) => void;
  generateOpen: boolean;
  onGenerateOpenChange: (open: boolean) => void;
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
  configId,
  setName,
  setTargetAgent,
  onAcceptGenerated,
  previewVisible,
  onTogglePreview,
  templatePickerOpen,
  onTemplatePickerOpenChange,
  onLoadTemplate,
  generateOpen,
  onGenerateOpenChange,
}: BuilderHeaderProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  const handleTemplateSelect = (template: Template) => {
    onLoadTemplate(template);
    onTemplatePickerOpenChange(false);
  };

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

        <Button
          variant="ghost"
          size="icon"
          onClick={onTogglePreview}
          title={previewVisible ? "Hide preview" : "Show preview"}
          className="hidden lg:flex"
        >
          {previewVisible ? <EyeOpenIcon /> : <EyeClosedIcon />}
        </Button>

        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
          <GitHubLogoIcon />
          Import from GitHub
        </Button>

        <Button variant="outline" size="sm" onClick={() => onGenerateOpenChange(true)}>
          <MagicWandIcon />
          Generate with AI
        </Button>

        <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
          <DownloadIcon />
          Export
        </Button>

        {configId && (
          <Button variant="outline" size="sm" onClick={() => setPublishOpen(true)}>
            <Share2Icon />
            Publish
          </Button>
        )}
      </div>

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        state={state}
      />

      <RepoImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        targetAgent={state.targetAgent}
        onAccept={onAcceptGenerated}
      />

      <AiGenerateDialog
        open={generateOpen}
        onOpenChange={onGenerateOpenChange}
        targetAgent={state.targetAgent}
        onAccept={onAcceptGenerated}
      />

      <TemplatePicker
        open={templatePickerOpen}
        onOpenChange={onTemplatePickerOpenChange}
        targetAgent={state.targetAgent}
        onSelect={handleTemplateSelect}
      />

      <PublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        configId={configId}
        configName={state.name}
        configDescription={state.description}
      />
    </div>
  );
}
