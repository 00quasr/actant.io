"use client";

import { useEffect, useState } from "react";
import type { AgentConfig, AgentType } from "@/types/config";
import type { Template } from "@/types/marketplace";
import { useConfig } from "@/hooks/use-config";
import { useAutoSave } from "@/hooks/use-auto-save";
import { BuilderHeader } from "@/components/builder/builder-header";
import { BuilderTabs } from "@/components/builder/builder-tabs";
import { LivePreview } from "@/components/builder/live-preview";
import { OnboardingWizard } from "@/components/builder/onboarding-wizard";

interface BuilderShellProps {
  initialConfig?: AgentConfig & { id?: string };
}

export function BuilderShell({ initialConfig }: BuilderShellProps) {
  const {
    state,
    dispatch,
    setName,
    setDescription,
    setTargetAgent,
    setInstructions,
    addSkill,
    removeSkill,
    addMcpServer,
    removeMcpServer,
    updateMcpServer,
    setPermission,
    removePermission,
    setAllPermissions,
    addRule,
    removeRule,
    updateRule,
    addRulesBatch,
    loadGeneratedConfig,
    loadTemplate,
  } = useConfig(initialConfig);

  const { saveStatus } = useAutoSave(state, state.id, dispatch);
  const [showWizard, setShowWizard] = useState(!initialConfig);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      dispatch({ type: "LOAD_CONFIG", payload: initialConfig });
    }
  }, [initialConfig, dispatch]);

  const handleLoadTemplate = (template: Template) => {
    const instructions = template.instructions as { content: string; templateId?: string };
    const rules = (template.rules as Array<{ title: string; content: string; glob?: string; alwaysApply?: boolean }>) ?? [];
    const mcpServers = (template.mcp_servers as Array<{ name: string; type: "stdio" | "sse" | "streamable-http"; command?: string; args?: string[]; url?: string; env?: Record<string, string>; enabled: boolean }>) ?? [];
    const permissions = (template.permissions ?? {}) as Record<string, "allow" | "ask" | "deny">;

    loadTemplate({
      instructions: { content: instructions.content ?? "", templateId: template.id },
      rules,
      mcpServers,
      permissions,
    });
  };

  const handleWizardComplete = (config: {
    targetAgent: AgentType;
    description?: string;
    techStack?: string[];
  }) => {
    setTargetAgent(config.targetAgent);
    if (config.description) {
      setDescription(config.description);
    }
    setShowWizard(false);
  };

  if (showWizard) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <OnboardingWizard
          onComplete={handleWizardComplete}
          onOpenTemplate={() => {
            setShowWizard(false);
            setTemplatePickerOpen(true);
          }}
          onOpenGenerate={() => {
            setShowWizard(false);
            setGenerateOpen(true);
          }}
          onSkip={() => setShowWizard(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <BuilderHeader
        state={state}
        saveStatus={saveStatus}
        configId={state.id ?? null}
        setName={setName}
        setTargetAgent={setTargetAgent}
        onAcceptGenerated={loadGeneratedConfig}
        previewVisible={previewVisible}
        onTogglePreview={() => setPreviewVisible((v) => !v)}
        templatePickerOpen={templatePickerOpen}
        onTemplatePickerOpenChange={setTemplatePickerOpen}
        onLoadTemplate={handleLoadTemplate}
        generateOpen={generateOpen}
        onGenerateOpenChange={setGenerateOpen}
      />
      <div className="flex flex-1 min-h-0">
        <div className={`flex-1 min-h-0 overflow-y-auto ${previewVisible ? "lg:w-3/5" : "w-full"}`}>
          <BuilderTabs
            state={state}
            setInstructions={setInstructions}
            addSkill={addSkill}
            removeSkill={removeSkill}
            addMcpServer={addMcpServer}
            removeMcpServer={removeMcpServer}
            updateMcpServer={updateMcpServer}
            setPermission={setPermission}
            removePermission={removePermission}
            setAllPermissions={setAllPermissions}
            addRule={addRule}
            removeRule={removeRule}
            updateRule={updateRule}
            addRulesBatch={addRulesBatch}
            onLoadTemplate={handleLoadTemplate}
          />
        </div>
        {previewVisible && (
          <div className="hidden lg:block lg:w-2/5 border-l min-h-0">
            <LivePreview state={state} />
          </div>
        )}
      </div>
    </div>
  );
}
