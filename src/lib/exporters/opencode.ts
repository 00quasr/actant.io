import type { AgentConfig } from "@/types/config";
import type { ExportFile } from "./index";
import { slugify } from "./utils";

export function exportOpenCode(config: AgentConfig): ExportFile[] {
  const instructions: string[] = [];
  if (config.instructions.content) {
    instructions.push(config.instructions.content);
  }
  for (const rule of config.rules) {
    if (rule.content) instructions.push(rule.content);
  }

  const mcp: Record<string, Record<string, unknown>> = {};
  for (const server of config.mcpServers.filter((s) => s.enabled)) {
    const entry: Record<string, unknown> = {};
    if (server.type) entry.type = server.type;
    if (server.command) entry.command = server.command;
    if (server.args?.length) entry.args = server.args;
    entry.enabled = true;
    mcp[server.name] = entry;
  }

  const permission: Record<string, string> = {};
  for (const [tool, perm] of Object.entries(config.permissions)) {
    permission[tool] = perm;
  }

  const agents = config.agentDefinitions?.length
    ? config.agentDefinitions.map((agent) => ({
        name: agent.name,
        description: agent.description,
        role: agent.role,
        instructions: agent.instructions,
        ...(agent.tools?.length ? { tools: agent.tools } : {}),
      }))
    : undefined;

  const output: Record<string, unknown> = { instructions };
  if (Object.keys(mcp).length > 0) output.mcp = mcp;
  if (Object.keys(permission).length > 0) output.permission = permission;
  if (agents) output.agents = agents;

  const files: ExportFile[] = [
    {
      path: "opencode.json",
      content: JSON.stringify(output, null, 2),
    },
  ];

  // Commands
  if (config.commands?.length > 0) {
    for (const cmd of config.commands) {
      files.push({
        path: `.opencode/commands/${slugify(cmd.name)}.md`,
        content: `# ${cmd.name}\n\n${cmd.description}\n\n${cmd.prompt}`,
      });
    }
  }

  // Docs
  if (config.docs) {
    for (const [filename, content] of Object.entries(config.docs)) {
      if (content) files.push({ path: filename, content });
    }
  }

  return files;
}
