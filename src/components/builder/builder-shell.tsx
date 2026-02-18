"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import type { AgentConfig, AgentType, McpServer, Rule } from "@/types/config";
import type { Template } from "@/types/marketplace";
import { useConfig } from "@/hooks/use-config";
import { useAutoSave } from "@/hooks/use-auto-save";
import { createConfig } from "@/services/configs";
import { BuilderHeader } from "@/components/builder/builder-header";
import { BuilderTabs } from "@/components/builder/builder-tabs";
import { LivePreview } from "@/components/builder/live-preview";
import { OnboardingWizard } from "@/components/builder/onboarding-wizard";
import { AiGenerateDialog } from "@/components/builder/ai-generate-dialog";
import { RULE_PRESETS, PERMISSION_PRESETS } from "@/lib/presets";

interface BuilderShellProps {
  initialConfig?: AgentConfig & {
    id?: string;
    content?: Record<string, unknown>;
    docs?: Record<string, string>;
  };
  initialTemplate?: Template;
}

export function BuilderShell({ initialConfig, initialTemplate }: BuilderShellProps) {
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
    setTechStack,
    setDoc,
    removeDoc,
    loadGeneratedConfig,
    loadTemplate,
  } = useConfig(initialConfig);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  const handleCreate = useCallback(async () => {
    const current = stateRef.current;
    try {
      const dbConfig = await createConfig({
        name: current.name,
        description: current.description,
        targetAgent: current.targetAgent,
        instructions: current.instructions,
        skills: current.skills,
        mcpServers: current.mcpServers,
        permissions: current.permissions,
        rules: current.rules,
        docs: current.docs,
      });
      dispatch({ type: "SET_ID", payload: dbConfig.id });
      dispatch({ type: "SET_SAVED" });
      window.history.replaceState(null, "", `/builder/${dbConfig.id}`);
      return dbConfig.id;
    } catch {
      toast.error("Failed to create config");
      return undefined;
    }
  }, [dispatch]);

  const { saveStatus, saveNow } = useAutoSave(state, state.id, dispatch, handleCreate);
  const [showWizard, setShowWizard] = useState(!initialConfig && !initialTemplate);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);

  const handleLoadTemplate = (template: Template) => {
    const instructions = template.instructions as { content: string; templateId?: string };
    const rules =
      (template.rules as Array<{
        title: string;
        content: string;
        glob?: string;
        alwaysApply?: boolean;
      }>) ?? [];
    const mcpServers =
      (template.mcp_servers as Array<{
        name: string;
        type: "stdio" | "sse" | "streamable-http";
        command?: string;
        args?: string[];
        url?: string;
        env?: Record<string, string>;
        enabled: boolean;
      }>) ?? [];
    const permissions = (template.permissions ?? {}) as Record<string, "allow" | "ask" | "deny">;

    loadTemplate({
      instructions: { content: instructions.content ?? "", templateId: template.id },
      rules,
      mcpServers,
      permissions,
    });
  };

  useEffect(() => {
    if (initialConfig) {
      dispatch({ type: "LOAD_CONFIG", payload: initialConfig });
    }
  }, [initialConfig, dispatch]);

  useEffect(() => {
    if (initialTemplate) {
      handleLoadTemplate(initialTemplate);
      setTargetAgent(initialTemplate.target_agent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTemplate]);

  const handleWizardComplete = async (config: {
    targetAgent: AgentType;
    description?: string;
    techStack?: string[];
    suggestedMcpServers?: McpServer[];
    suggestedRulePresetIds?: string[];
    suggestedPermissionPresetId?: string;
  }) => {
    // Apply state changes locally
    setTargetAgent(config.targetAgent);
    if (config.description) {
      setDescription(config.description);
    }
    if (config.techStack && config.techStack.length > 0) {
      setTechStack(config.techStack);
    }

    // Build data from suggestions for both local state and DB
    const mcpServers: McpServer[] = [];
    if (config.suggestedMcpServers) {
      const existingNames = new Set(state.mcpServers.map((s) => s.name));
      for (const server of config.suggestedMcpServers) {
        if (!existingNames.has(server.name)) {
          addMcpServer(server);
          mcpServers.push(server);
        }
      }
    }

    const rules: Rule[] = [];
    if (config.suggestedRulePresetIds) {
      for (const presetId of config.suggestedRulePresetIds) {
        const preset = RULE_PRESETS.find((p) => p.id === presetId);
        if (preset) {
          rules.push(...preset.rules);
        }
      }
      if (rules.length > 0) {
        addRulesBatch(rules);
      }
    }

    let permissions: Record<string, "allow" | "ask" | "deny"> = {};
    if (config.suggestedPermissionPresetId) {
      const preset = PERMISSION_PRESETS.find((p) => p.id === config.suggestedPermissionPresetId);
      if (preset) {
        permissions = preset.permissions;
        setAllPermissions(preset.permissions);
      }
    }

    setShowWizard(false);

    // Auto-create config in DB if no ID exists yet
    if (!state.id) {
      try {
        const dbConfig = await createConfig({
          name: "",
          description: config.description || "",
          targetAgent: config.targetAgent,
          instructions: { content: "" },
          skills: [],
          mcpServers,
          permissions,
          rules,
        });

        dispatch({ type: "SET_SAVED" });
        dispatch({ type: "SET_ID", payload: dbConfig.id });
        window.history.replaceState(null, "", `/builder/${dbConfig.id}`);
      } catch {
        toast.error("Failed to save. Your work won't be auto-saved.");
      }
    }
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
        onGenerateClick={() => setGenerateOpen(true)}
        onSave={saveNow}
      />
      <div className="flex flex-1 min-h-0">
        <div
          className={`flex-1 min-w-0 min-h-0 overflow-y-auto ${previewVisible ? "lg:w-3/5" : "w-full"}`}
        >
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
            setDoc={setDoc}
            removeDoc={removeDoc}
          />
        </div>
        {previewVisible && (
          <div className="hidden lg:block lg:w-2/5 min-w-0 border-l min-h-0 overflow-hidden">
            <LivePreview state={state} />
          </div>
        )}
      </div>

      {/* AI Generate — full-page overlay, rendered at root level */}
      <AiGenerateDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        targetAgent={state.targetAgent}
        onAccept={loadGeneratedConfig}
      />
    </div>
  );
}
