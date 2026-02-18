import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BuilderShell } from "@/components/builder/builder-shell";
import { fromDbConfig } from "@/services/configs";
import type { Config } from "@/types/marketplace";

export const metadata = {
  title: "Edit Config - Actant",
};

export default async function EditBuilderPage({
  params,
}: {
  params: Promise<{ configId: string }>;
}) {
  const { configId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.from("configs").select("*").eq("id", configId).single();

  if (error || !data) {
    notFound();
  }

  const config = fromDbConfig(data as Config);

  return (
    <div className="h-full">
      <BuilderShell initialConfig={config} />
    </div>
  );
}
