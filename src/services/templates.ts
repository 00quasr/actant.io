import { createClient } from "@/lib/supabase/client";
import type { Template } from "@/types/marketplace";

export async function listTemplates(targetAgent?: string): Promise<Template[]> {
  const supabase = createClient();
  let query = supabase.from("templates").select("*");

  if (targetAgent) {
    query = query.eq("target_agent", targetAgent);
  }

  const { data, error } = await query
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
