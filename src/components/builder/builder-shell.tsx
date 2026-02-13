"use client";

import { useEffect } from "react";
import type { AgentConfig } from "@/types/config";
import { useConfig } from "@/hooks/use-config";
import { useAutoSave } from "@/hooks/use-auto-save";
import { BuilderHeader } from "@/components/builder/builder-header";
import { BuilderTabs } from "@/components/builder/builder-tabs";

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
    setTemplateId,
    addSkill,
    removeSkill,
    addMcpServer,
    removeMcpServer,
    updateMcpServer,
    setPermission,
    removePermission,
    addRule,
    removeRule,
    updateRule,
  } = useConfig(initialConfig);

  const { saveStatus } = useAutoSave(state, state.id, dispatch);

  useEffect(() => {
    if (initialConfig) {
      dispatch({ type: "LOAD_CONFIG", payload: initialConfig });
    }
  }, [initialConfig, dispatch]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <BuilderHeader
        state={state}
        saveStatus={saveStatus}
        setName={setName}
        setTargetAgent={setTargetAgent}
      />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <BuilderTabs
          state={state}
          setInstructions={setInstructions}
          setTemplateId={setTemplateId}
          addSkill={addSkill}
          removeSkill={removeSkill}
          addMcpServer={addMcpServer}
          removeMcpServer={removeMcpServer}
          updateMcpServer={updateMcpServer}
          setPermission={setPermission}
          removePermission={removePermission}
          addRule={addRule}
          removeRule={removeRule}
          updateRule={updateRule}
        />
      </div>
    </div>
  );
}
