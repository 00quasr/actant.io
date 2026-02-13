import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface ImportPageProps {
  params: Promise<{ listingId: string }>;
}

export default async function ImportPage({ params }: ImportPageProps) {
  const { listingId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: listing } = await supabase
    .from("listings")
    .select("config_id")
    .eq("id", listingId)
    .single();

  if (!listing) notFound();

  const { data: sourceConfig } = await supabase
    .from("configs")
    .select("*")
    .eq("id", listing.config_id)
    .single();

  if (!sourceConfig) notFound();

  const { data: newConfig, error } = await supabase
    .from("configs")
    .insert({
      owner_id: user.id,
      name: sourceConfig.name,
      description: sourceConfig.description,
      target_agent: sourceConfig.target_agent,
      instructions: sourceConfig.instructions,
      skills: sourceConfig.skills,
      mcp_servers: sourceConfig.mcp_servers,
      permissions: sourceConfig.permissions,
      rules: sourceConfig.rules,
      is_draft: true,
    })
    .select("id")
    .single();

  if (error || !newConfig) {
    redirect("/marketplace");
  }

  await supabase.rpc("increment_download_count", { listing_id: listingId });

  redirect(`/builder/${newConfig.id}`);
}
