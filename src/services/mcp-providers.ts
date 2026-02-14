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
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,tagline.ilike.%${query}%`)
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getRecommendedProviders(techStack: string[]): Promise<McpProvider[]> {
  if (techStack.length === 0) return [];

  const supabase = createClient();
  const lowered = techStack.map((s) => s.toLowerCase());
  const { data, error } = await supabase
    .from("mcp_providers")
    .select("*")
    .overlaps("recommended_for", lowered)
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
