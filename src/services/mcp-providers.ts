import { createClient } from "@/lib/supabase/client";
import type { McpProvider } from "@/types/marketplace";

export async function listMcpProviders(): Promise<McpProvider[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("mcp_providers")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function searchMcpProviders(query: string): Promise<McpProvider[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("mcp_providers")
    .select("*")
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
