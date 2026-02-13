import type { AgentConfig } from "@/types/config";
import type { ExportFile } from "./index";

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

  const output: Record<string, unknown> = { instructions };
  if (Object.keys(mcp).length > 0) output.mcp = mcp;
  if (Object.keys(permission).length > 0) output.permission = permission;

  return [
    {
      path: "opencode.json",
      content: JSON.stringify(output, null, 2),
    },
  ];
}
