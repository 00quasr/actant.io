"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ConfigNodeNav } from "@/components/builder/config-node-nav";
import { InstructionsTab } from "@/components/builder/tabs/instructions-tab";
import { SkillsTab } from "@/components/builder/tabs/skills-tab";
import { McpTab } from "@/components/builder/tabs/mcp-tab";
import { PermissionsTab } from "@/components/builder/tabs/permissions-tab";
import { RulesTab } from "@/components/builder/tabs/rules-tab";
import { CommandsTab } from "@/components/builder/tabs/commands-tab";
import { AgentsTab } from "@/components/builder/tabs/agents-tab";
import { DocsTab } from "@/components/builder/tabs/docs-tab";
import type { ConfigState } from "@/hooks/use-config";
import type { AgentDefinition, McpServer, Rule, SkillEntry, WorkflowCommand } from "@/types/config";
import type { Template } from "@/types/marketplace";

interface BuilderTabsProps {
  state: ConfigState;
  setInstructions: (content: string) => void;
  addSkill: (skill: SkillEntry) => void;
  removeSkill: (skillId: string) => void;
  addMcpServer: (server: McpServer) => void;
  removeMcpServer: (name: string) => void;
  updateMcpServer: (name: string, server: McpServer) => void;
  setPermission: (tool: string, value: "allow" | "ask" | "deny") => void;
  removePermission: (tool: string) => void;
  setAllPermissions: (permissions: Record<string, "allow" | "ask" | "deny">) => void;
  addRule: (rule: Rule) => void;
  removeRule: (index: number) => void;
  updateRule: (index: number, rule: Rule) => void;
  addRulesBatch: (rules: Rule[]) => void;
  addCommand: (command: WorkflowCommand) => void;
  removeCommand: (index: number) => void;
  updateCommand: (index: number, command: WorkflowCommand) => void;
  addAgentDefinition: (definition: AgentDefinition) => void;
  removeAgentDefinition: (index: number) => void;
  updateAgentDefinition: (index: number, definition: AgentDefinition) => void;
  onLoadTemplate: (template: Template) => void;
  setDoc: (filename: string, content: string) => void;
  removeDoc: (filename: string) => void;
}

export function BuilderTabs({
  state,
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
  addCommand,
  removeCommand,
  updateCommand,
  addAgentDefinition,
  removeAgentDefinition,
  updateAgentDefinition,
  onLoadTemplate,
  setDoc,
  removeDoc,
}: BuilderTabsProps) {
  const [activeTab, setActiveTab] = useState("instructions");
  const docsCount = Object.keys(state.docs).length;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6 py-6">
      <ConfigNodeNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        instructionsLength={state.instructions.content.length}
        skillsCount={state.skills.length}
        mcpCount={state.mcpServers.length}
        permissionsCount={Object.keys(state.permissions).length}
        rulesCount={state.rules.length}
        commandsCount={state.commands.length}
        agentsCount={state.agentDefinitions.length}
        docsCount={docsCount}
      />

      <TabsContent value="instructions" className="pt-6">
        <InstructionsTab
          content={state.instructions.content}
          templateId={state.instructions.templateId}
          targetAgent={state.targetAgent}
          setInstructions={setInstructions}
          onLoadTemplate={onLoadTemplate}
        />
      </TabsContent>

      <TabsContent value="skills" className="pt-6">
        <SkillsTab
          skills={state.skills}
          targetAgent={state.targetAgent}
          addSkill={addSkill}
          removeSkill={removeSkill}
        />
      </TabsContent>

      <TabsContent value="mcp" className="pt-6">
        <McpTab
          servers={state.mcpServers}
          addServer={addMcpServer}
          removeServer={removeMcpServer}
          updateServer={updateMcpServer}
          techStack={state.techStack}
        />
      </TabsContent>

      <TabsContent value="permissions" className="pt-6">
        <PermissionsTab
          permissions={state.permissions}
          setPermission={setPermission}
          removePermission={removePermission}
          onApplyPreset={setAllPermissions}
        />
      </TabsContent>

      <TabsContent value="rules" className="pt-6">
        <RulesTab
          rules={state.rules}
          addRule={addRule}
          removeRule={removeRule}
          updateRule={updateRule}
          onApplyPreset={addRulesBatch}
        />
      </TabsContent>

      <TabsContent value="commands" className="pt-6">
        <CommandsTab
          commands={state.commands}
          onAdd={addCommand}
          onRemove={removeCommand}
          onUpdate={updateCommand}
        />
      </TabsContent>

      <TabsContent value="agents" className="pt-6">
        <AgentsTab
          agentDefinitions={state.agentDefinitions}
          onAdd={addAgentDefinition}
          onRemove={removeAgentDefinition}
          onUpdate={updateAgentDefinition}
        />
      </TabsContent>

      <TabsContent value="docs" className="pt-6">
        <DocsTab
          docs={state.docs}
          setDoc={setDoc}
          removeDoc={removeDoc}
          configName={state.name}
          configDescription={state.description}
          techStack={state.techStack}
        />
      </TabsContent>
    </Tabs>
  );
}
