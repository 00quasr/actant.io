"use client";

import { useReducer, useCallback } from "react";
import type {
  AgentConfig,
  AgentType,
  McpServer,
  Rule,
  SkillEntry,
} from "@/types/config";

export interface ConfigState extends AgentConfig {
  id?: string;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved?: Date;
}

type ConfigAction =
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_DESCRIPTION"; payload: string }
  | { type: "SET_TARGET_AGENT"; payload: AgentType }
  | { type: "SET_INSTRUCTIONS"; payload: string }
  | { type: "SET_TEMPLATE_ID"; payload: string | undefined }
  | { type: "ADD_SKILL"; payload: SkillEntry }
  | { type: "REMOVE_SKILL"; payload: string }
  | { type: "UPDATE_SKILL_PARAMS"; payload: { skillId: string; params: Record<string, unknown> } }
  | { type: "ADD_MCP_SERVER"; payload: McpServer }
  | { type: "REMOVE_MCP_SERVER"; payload: string }
  | { type: "UPDATE_MCP_SERVER"; payload: { name: string; server: McpServer } }
  | { type: "SET_PERMISSION"; payload: { tool: string; value: "allow" | "ask" | "deny" } }
  | { type: "REMOVE_PERMISSION"; payload: string }
  | { type: "ADD_RULE"; payload: Rule }
  | { type: "REMOVE_RULE"; payload: number }
  | { type: "UPDATE_RULE"; payload: { index: number; rule: Rule } }
  | { type: "LOAD_CONFIG"; payload: AgentConfig & { id?: string } }
  | { type: "RESET" }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_SAVED" };

function createInitialState(initial?: Partial<AgentConfig> & { id?: string }): ConfigState {
  return {
    id: initial?.id,
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    targetAgent: initial?.targetAgent ?? "claude-code",
    instructions: initial?.instructions ?? { content: "" },
    skills: initial?.skills ?? [],
    mcpServers: initial?.mcpServers ?? [],
    permissions: initial?.permissions ?? {},
    rules: initial?.rules ?? [],
    isDirty: false,
    isSaving: false,
    lastSaved: undefined,
  };
}

function configReducer(state: ConfigState, action: ConfigAction): ConfigState {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.payload, isDirty: true };
    case "SET_DESCRIPTION":
      return { ...state, description: action.payload, isDirty: true };
    case "SET_TARGET_AGENT":
      return { ...state, targetAgent: action.payload, isDirty: true };
    case "SET_INSTRUCTIONS":
      return {
        ...state,
        instructions: { ...state.instructions, content: action.payload },
        isDirty: true,
      };
    case "SET_TEMPLATE_ID":
      return {
        ...state,
        instructions: { ...state.instructions, templateId: action.payload },
        isDirty: true,
      };
    case "ADD_SKILL": {
      const exists = state.skills.some((s) => s.skillId === action.payload.skillId);
      if (exists) return state;
      return { ...state, skills: [...state.skills, action.payload], isDirty: true };
    }
    case "REMOVE_SKILL":
      return {
        ...state,
        skills: state.skills.filter((s) => s.skillId !== action.payload),
        isDirty: true,
      };
    case "UPDATE_SKILL_PARAMS":
      return {
        ...state,
        skills: state.skills.map((s) =>
          s.skillId === action.payload.skillId
            ? { ...s, params: action.payload.params }
            : s
        ),
        isDirty: true,
      };
    case "ADD_MCP_SERVER":
      return {
        ...state,
        mcpServers: [...state.mcpServers, action.payload],
        isDirty: true,
      };
    case "REMOVE_MCP_SERVER":
      return {
        ...state,
        mcpServers: state.mcpServers.filter((s) => s.name !== action.payload),
        isDirty: true,
      };
    case "UPDATE_MCP_SERVER":
      return {
        ...state,
        mcpServers: state.mcpServers.map((s) =>
          s.name === action.payload.name ? action.payload.server : s
        ),
        isDirty: true,
      };
    case "SET_PERMISSION":
      return {
        ...state,
        permissions: {
          ...state.permissions,
          [action.payload.tool]: action.payload.value,
        },
        isDirty: true,
      };
    case "REMOVE_PERMISSION": {
      const { [action.payload]: _, ...rest } = state.permissions;
      return { ...state, permissions: rest, isDirty: true };
    }
    case "ADD_RULE":
      return { ...state, rules: [...state.rules, action.payload], isDirty: true };
    case "REMOVE_RULE":
      return {
        ...state,
        rules: state.rules.filter((_, i) => i !== action.payload),
        isDirty: true,
      };
    case "UPDATE_RULE":
      return {
        ...state,
        rules: state.rules.map((r, i) =>
          i === action.payload.index ? action.payload.rule : r
        ),
        isDirty: true,
      };
    case "LOAD_CONFIG":
      return createInitialState(action.payload);
    case "RESET":
      return createInitialState();
    case "SET_SAVING":
      return { ...state, isSaving: action.payload };
    case "SET_SAVED":
      return { ...state, isDirty: false, isSaving: false, lastSaved: new Date() };
    default:
      return state;
  }
}

export function useConfig(initial?: Partial<AgentConfig> & { id?: string }) {
  const [state, dispatch] = useReducer(
    configReducer,
    initial,
    (init) => createInitialState(init)
  );

  const setName = useCallback(
    (name: string) => dispatch({ type: "SET_NAME", payload: name }),
    []
  );
  const setDescription = useCallback(
    (description: string) => dispatch({ type: "SET_DESCRIPTION", payload: description }),
    []
  );
  const setTargetAgent = useCallback(
    (agent: AgentType) => dispatch({ type: "SET_TARGET_AGENT", payload: agent }),
    []
  );
  const setInstructions = useCallback(
    (content: string) => dispatch({ type: "SET_INSTRUCTIONS", payload: content }),
    []
  );
  const setTemplateId = useCallback(
    (id: string | undefined) => dispatch({ type: "SET_TEMPLATE_ID", payload: id }),
    []
  );
  const addSkill = useCallback(
    (skill: SkillEntry) => dispatch({ type: "ADD_SKILL", payload: skill }),
    []
  );
  const removeSkill = useCallback(
    (skillId: string) => dispatch({ type: "REMOVE_SKILL", payload: skillId }),
    []
  );
  const addMcpServer = useCallback(
    (server: McpServer) => dispatch({ type: "ADD_MCP_SERVER", payload: server }),
    []
  );
  const removeMcpServer = useCallback(
    (name: string) => dispatch({ type: "REMOVE_MCP_SERVER", payload: name }),
    []
  );
  const updateMcpServer = useCallback(
    (name: string, server: McpServer) =>
      dispatch({ type: "UPDATE_MCP_SERVER", payload: { name, server } }),
    []
  );
  const setPermission = useCallback(
    (tool: string, value: "allow" | "ask" | "deny") =>
      dispatch({ type: "SET_PERMISSION", payload: { tool, value } }),
    []
  );
  const removePermission = useCallback(
    (tool: string) => dispatch({ type: "REMOVE_PERMISSION", payload: tool }),
    []
  );
  const addRule = useCallback(
    (rule: Rule) => dispatch({ type: "ADD_RULE", payload: rule }),
    []
  );
  const removeRule = useCallback(
    (index: number) => dispatch({ type: "REMOVE_RULE", payload: index }),
    []
  );
  const updateRule = useCallback(
    (index: number, rule: Rule) =>
      dispatch({ type: "UPDATE_RULE", payload: { index, rule } }),
    []
  );
  const loadConfig = useCallback(
    (config: AgentConfig & { id?: string }) =>
      dispatch({ type: "LOAD_CONFIG", payload: config }),
    []
  );
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return {
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
    loadConfig,
    reset,
  };
}

export type UseConfigReturn = ReturnType<typeof useConfig>;
