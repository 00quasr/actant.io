"use client";

import { useReducer, useCallback } from "react";
import type {
  AgentConfig,
  AgentDefinition,
  AgentType,
  McpServer,
  Rule,
  SkillEntry,
  WorkflowCommand,
} from "@/types/config";
export interface ConfigState extends AgentConfig {
  id?: string;
  techStack: string[];
  documentType: string;
  content: Record<string, unknown>;
  docs: Record<string, string>;
  commands: WorkflowCommand[];
  agentDefinitions: AgentDefinition[];
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
  | { type: "LOAD_GENERATED_CONFIG"; payload: AgentConfig }
  | {
      type: "LOAD_TEMPLATE";
      payload: {
        instructions: AgentConfig["instructions"];
        rules: Rule[];
        mcpServers: McpServer[];
        permissions: Record<string, "allow" | "ask" | "deny">;
      };
    }
  | { type: "SET_ALL_PERMISSIONS"; payload: Record<string, "allow" | "ask" | "deny"> }
  | { type: "ADD_RULES_BATCH"; payload: Rule[] }
  | { type: "SET_TECH_STACK"; payload: string[] }
  | { type: "SET_DOCUMENT_TYPE"; payload: string }
  | { type: "SET_CONTENT"; payload: Record<string, unknown> }
  | { type: "SET_CONTENT_FIELD"; payload: { key: string; value: unknown } }
  | { type: "SET_ID"; payload: string }
  | { type: "SET_DOCS"; payload: Record<string, string> }
  | { type: "SET_DOC"; payload: { filename: string; content: string } }
  | { type: "REMOVE_DOC"; payload: string }
  | { type: "ADD_COMMAND"; payload: WorkflowCommand }
  | { type: "REMOVE_COMMAND"; payload: number }
  | { type: "UPDATE_COMMAND"; payload: { index: number; command: WorkflowCommand } }
  | { type: "ADD_AGENT_DEFINITION"; payload: AgentDefinition }
  | { type: "REMOVE_AGENT_DEFINITION"; payload: number }
  | { type: "UPDATE_AGENT_DEFINITION"; payload: { index: number; definition: AgentDefinition } }
  | { type: "RESET" }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_SAVED" };

function createInitialState(
  initial?: Partial<AgentConfig> & {
    id?: string;
    documentType?: string;
    content?: Record<string, unknown>;
    docs?: Record<string, string>;
  },
): ConfigState {
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
    commands: initial?.commands ?? [],
    agentDefinitions: initial?.agentDefinitions ?? [],
    techStack: initial?.techStack ?? [],
    documentType: initial?.documentType ?? "agent-config",
    content: initial?.content ?? {},
    docs: initial?.docs ?? {},
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
          s.skillId === action.payload.skillId ? { ...s, params: action.payload.params } : s,
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
          s.name === action.payload.name ? action.payload.server : s,
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
      const rest = { ...state.permissions };
      delete rest[action.payload];
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
        rules: state.rules.map((r, i) => (i === action.payload.index ? action.payload.rule : r)),
        isDirty: true,
      };
    case "SET_ALL_PERMISSIONS":
      return { ...state, permissions: action.payload, isDirty: true };
    case "ADD_RULES_BATCH":
      return { ...state, rules: [...state.rules, ...action.payload], isDirty: true };
    case "SET_TECH_STACK":
      return { ...state, techStack: action.payload, isDirty: true };
    case "SET_DOCUMENT_TYPE":
      return { ...state, documentType: action.payload, isDirty: true };
    case "SET_CONTENT":
      return { ...state, content: action.payload, isDirty: true };
    case "SET_CONTENT_FIELD":
      return {
        ...state,
        content: { ...state.content, [action.payload.key]: action.payload.value },
        isDirty: true,
      };
    case "SET_ID":
      return { ...state, id: action.payload };
    case "SET_DOCS":
      return { ...state, docs: action.payload, isDirty: true };
    case "SET_DOC":
      return {
        ...state,
        docs: { ...state.docs, [action.payload.filename]: action.payload.content },
        isDirty: true,
      };
    case "REMOVE_DOC": {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.payload]: _removed, ...rest } = state.docs;
      return { ...state, docs: rest, isDirty: true };
    }
    case "ADD_COMMAND":
      return { ...state, commands: [...state.commands, action.payload], isDirty: true };
    case "REMOVE_COMMAND":
      return {
        ...state,
        commands: state.commands.filter((_, i) => i !== action.payload),
        isDirty: true,
      };
    case "UPDATE_COMMAND":
      return {
        ...state,
        commands: state.commands.map((c, i) =>
          i === action.payload.index ? action.payload.command : c,
        ),
        isDirty: true,
      };
    case "ADD_AGENT_DEFINITION":
      return {
        ...state,
        agentDefinitions: [...state.agentDefinitions, action.payload],
        isDirty: true,
      };
    case "REMOVE_AGENT_DEFINITION":
      return {
        ...state,
        agentDefinitions: state.agentDefinitions.filter((_, i) => i !== action.payload),
        isDirty: true,
      };
    case "UPDATE_AGENT_DEFINITION":
      return {
        ...state,
        agentDefinitions: state.agentDefinitions.map((d, i) =>
          i === action.payload.index ? action.payload.definition : d,
        ),
        isDirty: true,
      };
    case "LOAD_CONFIG":
      return createInitialState(action.payload);
    case "LOAD_GENERATED_CONFIG":
      return {
        ...state,
        name: action.payload.name || state.name,
        description: action.payload.description || state.description,
        instructions: action.payload.instructions,
        skills: action.payload.skills,
        mcpServers: action.payload.mcpServers,
        permissions: action.payload.permissions,
        rules: action.payload.rules,
        commands: action.payload.commands ?? state.commands,
        agentDefinitions: action.payload.agentDefinitions ?? state.agentDefinitions,
        docs: action.payload.docs ?? state.docs,
        isDirty: true,
      };
    case "LOAD_TEMPLATE":
      return {
        ...state,
        instructions: action.payload.instructions,
        rules: action.payload.rules,
        mcpServers: action.payload.mcpServers,
        permissions: action.payload.permissions,
        isDirty: true,
      };
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

export function useConfig(
  initial?: Partial<AgentConfig> & {
    id?: string;
    documentType?: string;
    content?: Record<string, unknown>;
  },
) {
  const [state, dispatch] = useReducer(configReducer, initial, (init) => createInitialState(init));

  const setName = useCallback((name: string) => dispatch({ type: "SET_NAME", payload: name }), []);
  const setDescription = useCallback(
    (description: string) => dispatch({ type: "SET_DESCRIPTION", payload: description }),
    [],
  );
  const setTargetAgent = useCallback(
    (agent: AgentType) => dispatch({ type: "SET_TARGET_AGENT", payload: agent }),
    [],
  );
  const setInstructions = useCallback(
    (content: string) => dispatch({ type: "SET_INSTRUCTIONS", payload: content }),
    [],
  );
  const setTemplateId = useCallback(
    (id: string | undefined) => dispatch({ type: "SET_TEMPLATE_ID", payload: id }),
    [],
  );
  const addSkill = useCallback(
    (skill: SkillEntry) => dispatch({ type: "ADD_SKILL", payload: skill }),
    [],
  );
  const removeSkill = useCallback(
    (skillId: string) => dispatch({ type: "REMOVE_SKILL", payload: skillId }),
    [],
  );
  const addMcpServer = useCallback(
    (server: McpServer) => dispatch({ type: "ADD_MCP_SERVER", payload: server }),
    [],
  );
  const removeMcpServer = useCallback(
    (name: string) => dispatch({ type: "REMOVE_MCP_SERVER", payload: name }),
    [],
  );
  const updateMcpServer = useCallback(
    (name: string, server: McpServer) =>
      dispatch({ type: "UPDATE_MCP_SERVER", payload: { name, server } }),
    [],
  );
  const setPermission = useCallback(
    (tool: string, value: "allow" | "ask" | "deny") =>
      dispatch({ type: "SET_PERMISSION", payload: { tool, value } }),
    [],
  );
  const removePermission = useCallback(
    (tool: string) => dispatch({ type: "REMOVE_PERMISSION", payload: tool }),
    [],
  );
  const addRule = useCallback((rule: Rule) => dispatch({ type: "ADD_RULE", payload: rule }), []);
  const removeRule = useCallback(
    (index: number) => dispatch({ type: "REMOVE_RULE", payload: index }),
    [],
  );
  const updateRule = useCallback(
    (index: number, rule: Rule) => dispatch({ type: "UPDATE_RULE", payload: { index, rule } }),
    [],
  );
  const loadConfig = useCallback(
    (config: AgentConfig & { id?: string }) => dispatch({ type: "LOAD_CONFIG", payload: config }),
    [],
  );
  const loadGeneratedConfig = useCallback(
    (config: AgentConfig) => dispatch({ type: "LOAD_GENERATED_CONFIG", payload: config }),
    [],
  );
  const loadTemplate = useCallback(
    (template: {
      instructions: AgentConfig["instructions"];
      rules: Rule[];
      mcpServers: McpServer[];
      permissions: Record<string, "allow" | "ask" | "deny">;
    }) => dispatch({ type: "LOAD_TEMPLATE", payload: template }),
    [],
  );
  const setAllPermissions = useCallback(
    (permissions: Record<string, "allow" | "ask" | "deny">) =>
      dispatch({ type: "SET_ALL_PERMISSIONS", payload: permissions }),
    [],
  );
  const addRulesBatch = useCallback(
    (rules: Rule[]) => dispatch({ type: "ADD_RULES_BATCH", payload: rules }),
    [],
  );
  const setTechStack = useCallback(
    (techStack: string[]) => dispatch({ type: "SET_TECH_STACK", payload: techStack }),
    [],
  );
  const setstring = useCallback(
    (documentType: string) => dispatch({ type: "SET_DOCUMENT_TYPE", payload: documentType }),
    [],
  );
  const setContent = useCallback(
    (content: Record<string, unknown>) => dispatch({ type: "SET_CONTENT", payload: content }),
    [],
  );
  const setContentField = useCallback(
    (key: string, value: unknown) =>
      dispatch({ type: "SET_CONTENT_FIELD", payload: { key, value } }),
    [],
  );
  const setDocs = useCallback(
    (docs: Record<string, string>) => dispatch({ type: "SET_DOCS", payload: docs }),
    [],
  );
  const setDoc = useCallback(
    (filename: string, content: string) =>
      dispatch({ type: "SET_DOC", payload: { filename, content } }),
    [],
  );
  const removeDoc = useCallback(
    (filename: string) => dispatch({ type: "REMOVE_DOC", payload: filename }),
    [],
  );
  const addCommand = useCallback(
    (command: WorkflowCommand) => dispatch({ type: "ADD_COMMAND", payload: command }),
    [],
  );
  const removeCommand = useCallback(
    (index: number) => dispatch({ type: "REMOVE_COMMAND", payload: index }),
    [],
  );
  const updateCommand = useCallback(
    (index: number, command: WorkflowCommand) =>
      dispatch({ type: "UPDATE_COMMAND", payload: { index, command } }),
    [],
  );
  const addAgentDefinition = useCallback(
    (definition: AgentDefinition) =>
      dispatch({ type: "ADD_AGENT_DEFINITION", payload: definition }),
    [],
  );
  const removeAgentDefinition = useCallback(
    (index: number) => dispatch({ type: "REMOVE_AGENT_DEFINITION", payload: index }),
    [],
  );
  const updateAgentDefinition = useCallback(
    (index: number, definition: AgentDefinition) =>
      dispatch({ type: "UPDATE_AGENT_DEFINITION", payload: { index, definition } }),
    [],
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
    loadGeneratedConfig,
    loadTemplate,
    setAllPermissions,
    addRulesBatch,
    setTechStack,
    setstring,
    setContent,
    setContentField,
    setDocs,
    setDoc,
    removeDoc,
    addCommand,
    removeCommand,
    updateCommand,
    addAgentDefinition,
    removeAgentDefinition,
    updateAgentDefinition,
    reset,
  };
}

export type UseConfigReturn = ReturnType<typeof useConfig>;
