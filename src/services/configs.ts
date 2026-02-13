import { createClient } from "@/lib/supabase/client";
import type { Config } from "@/types/marketplace";
import type { AgentConfig } from "@/types/config";

function toDbConfig(config: AgentConfig & { id?: string }) {
  return {
    name: config.name,
    description: config.description || null,
    target_agent: config.targetAgent,
    instructions: config.instructions,
    skills: config.skills,
    mcp_servers: config.mcpServers,
    permissions: config.permissions,
    rules: config.rules,
  };
}

export function fromDbConfig(row: Config): AgentConfig & { id: string } {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    targetAgent: row.target_agent,
    instructions: row.instructions as AgentConfig["instructions"],
    skills: row.skills as unknown as AgentConfig["skills"],
    mcpServers: row.mcp_servers as unknown as AgentConfig["mcpServers"],
    permissions: row.permissions as AgentConfig["permissions"],
    rules: row.rules as unknown as AgentConfig["rules"],
  };
}

export async function createConfig(config: AgentConfig): Promise<Config> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("configs")
    .insert(toDbConfig(config))
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getConfig(id: string): Promise<Config> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("configs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateConfig(
  id: string,
  config: Partial<AgentConfig>
): Promise<Config> {
  const supabase = createClient();

  const updates: Record<string, unknown> = {};
  if (config.name !== undefined) updates.name = config.name;
  if (config.description !== undefined) updates.description = config.description || null;
  if (config.targetAgent !== undefined) updates.target_agent = config.targetAgent;
  if (config.instructions !== undefined) updates.instructions = config.instructions;
  if (config.skills !== undefined) updates.skills = config.skills;
  if (config.mcpServers !== undefined) updates.mcp_servers = config.mcpServers;
  if (config.permissions !== undefined) updates.permissions = config.permissions;
  if (config.rules !== undefined) updates.rules = config.rules;

  const { data, error } = await supabase
    .from("configs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteConfig(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("configs").delete().eq("id", id);
  if (error) throw error;
}

export async function listUserConfigs(): Promise<Config[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("configs")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
