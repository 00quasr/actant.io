import { createClient } from "@/lib/supabase/client";
import type { Skill } from "@/types/marketplace";

export async function listSkills(): Promise<Skill[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getSkill(id: string): Promise<Skill> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
