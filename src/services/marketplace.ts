import { createClient } from "@/lib/supabase/client";
import type { Listing } from "@/types/marketplace";

export interface SearchParams {
  q?: string;
  agent?: string;
  use_case?: string;
  document_type?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function searchListings(params: SearchParams): Promise<{ data: Listing[]; count: number }> {
  const supabase = createClient();
  const { q, agent, use_case, document_type, sort, page = 1, limit = 12 } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("listings")
    .select("*, author:profiles!author_id(*)", { count: "exact" });

  if (q) {
    query = query.textSearch("fts", q);
  }

  if (agent) {
    const agents = agent.split(",");
    query = query.in("target_agent", agents);
  }

  if (use_case) {
    const useCases = use_case.split(",");
    query = query.in("use_case", useCases);
  }

  if (document_type) {
    const docTypes = document_type.split(",");
    query = query.in("document_type", docTypes);
  }

  switch (sort) {
    case "popular":
      query = query.order("download_count", { ascending: false });
      break;
    case "rated":
      query = query.order("avg_rating", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("published_at", { ascending: false });
      break;
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;
  return { data: (data as Listing[]) ?? [], count: count ?? 0 };
}

export async function getListing(id: string): Promise<Listing | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("*, author:profiles!author_id(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Listing;
}

export async function publishConfig(
  configId: string,
  metadata: { title: string; description: string; use_case: string; tags: string[] }
): Promise<Listing> {
  const supabase = createClient();

  const { data: config, error: configError } = await supabase
    .from("configs")
    .select("*")
    .eq("id", configId)
    .single();

  if (configError || !config) throw new Error("Config not found");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("listings")
    .insert({
      config_id: configId,
      author_id: user.id,
      title: metadata.title,
      description: metadata.description,
      target_agent: config.target_agent,
      use_case: metadata.use_case,
      tags: metadata.tags,
      document_type: config.document_type ?? "agent-config",
    })
    .select()
    .single();

  if (error) throw error;
  return data as Listing;
}

export async function incrementDownload(listingId: string): Promise<void> {
  const supabase = createClient();

  await supabase.rpc("increment_download_count", { listing_id: listingId });
}
