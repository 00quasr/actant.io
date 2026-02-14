"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstructionsTab } from "@/components/builder/tabs/instructions-tab";
import { SkillsTab } from "@/components/builder/tabs/skills-tab";
import { McpTab } from "@/components/builder/tabs/mcp-tab";
import { PermissionsTab } from "@/components/builder/tabs/permissions-tab";
import { RulesTab } from "@/components/builder/tabs/rules-tab";
import type { ConfigState } from "@/hooks/use-config";
import type { McpServer, Rule, SkillEntry } from "@/types/config";
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
  onLoadTemplate: (template: Template) => void;
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
  onLoadTemplate,
}: BuilderTabsProps) {
  return (
    <Tabs defaultValue="instructions" className="px-6 py-6">
      <TabsList variant="line">
        <TabsTrigger value="instructions">Instructions</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="mcp">MCP Servers</TabsTrigger>
        <TabsTrigger value="permissions">Permissions</TabsTrigger>
        <TabsTrigger value="rules">Rules</TabsTrigger>
      </TabsList>

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
    </Tabs>
  );
}
