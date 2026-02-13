import { createClient } from "@/lib/supabase/client";
import type { Template } from "@/types/marketplace";

export async function listTemplates(): Promise<Template[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
