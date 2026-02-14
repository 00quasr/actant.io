import { createClient } from "@/lib/supabase/server";
import type { Skill } from "@/types/marketplace";

export async function listSkillsByIds(ids: string[]): Promise<Skill[]> {
  if (ids.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .in("id", ids);

  if (error) throw error;
  return data ?? [];
}
