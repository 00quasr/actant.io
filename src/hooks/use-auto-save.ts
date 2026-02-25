"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { updateConfig } from "@/services/configs";
import type { ConfigState } from "@/hooks/use-config";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSave(
  state: ConfigState,
  configId: string | undefined,
  dispatch: (
    action:
      | { type: "SET_SAVING"; payload: boolean }
      | { type: "SET_SAVED" }
      | { type: "SET_ID"; payload: string },
  ) => void,
  onCreate?: () => Promise<string | undefined>,
) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  });

  const save = useCallback(async () => {
    const current = stateRef.current;
    if (!current.isDirty) return;

    // Cancel any pending auto-save to avoid duplicate saves
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // No config exists yet — create one first
    if (!configId) {
      if (!onCreate) return;
      setSaveStatus("saving");
      try {
        await onCreate();
        setSaveStatus("saved");
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 3000);
      } catch {
        setSaveStatus("error");
        toast.error("Failed to create config");
      }
      return;
    }

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
        commands: current.commands,
        agentDefinitions: current.agentDefinitions,
        documentType: current.documentType,
        content: {
          ...current.content,
          ...(Object.keys(current.docs).length > 0 ? { docs: current.docs } : {}),
        },
      });

      dispatch({ type: "SET_SAVED" });
      setSaveStatus("saved");

      // Reset saved status after 3 seconds
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    } catch {
      dispatch({ type: "SET_SAVING", payload: false });
      setSaveStatus("error");
      toast.error("Failed to save changes");
    }
  }, [configId, dispatch, onCreate]);

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
  }, [
    state.isDirty,
    state.name,
    state.description,
    state.targetAgent,
    state.instructions,
    state.skills,
    state.mcpServers,
    state.permissions,
    state.rules,
    state.commands,
    state.agentDefinitions,
    state.documentType,
    state.content,
    state.docs,
    configId,
    save,
  ]);

  // Clean up saved timer on unmount
  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  return { saveStatus, saveNow: save };
}
