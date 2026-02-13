"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { updateConfig } from "@/services/configs";
import type { ConfigState } from "@/hooks/use-config";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSave(
  state: ConfigState,
  configId: string | undefined,
  dispatch: (action: { type: "SET_SAVING"; payload: boolean } | { type: "SET_SAVED" }) => void
) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  });

  const save = useCallback(async () => {
    if (!configId) return;

    const current = stateRef.current;
    if (!current.isDirty) return;

    dispatch({ type: "SET_SAVING", payload: true });
    setSaveStatus("saving");

    try {
      await updateConfig(configId, {
        name: current.name,
        description: current.description,
        targetAgent: current.targetAgent,
        instructions: current.instructions,
        skills: current.skills,
        mcpServers: current.mcpServers,
        permissions: current.permissions,
        rules: current.rules,
      });

      dispatch({ type: "SET_SAVED" });
      setSaveStatus("saved");
    } catch {
      dispatch({ type: "SET_SAVING", payload: false });
      setSaveStatus("error");
      toast.error("Failed to save changes");
    }
  }, [configId, dispatch]);

  useEffect(() => {
    if (!state.isDirty || !configId) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      save();
    }, 2000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state.isDirty, state.name, state.description, state.targetAgent, state.instructions, state.skills, state.mcpServers, state.permissions, state.rules, configId, save]);

  return { saveStatus, saveNow: save };
}
