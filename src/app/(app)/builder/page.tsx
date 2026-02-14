import { createClient } from "@/lib/supabase/server";
import { BuilderShell } from "@/components/builder/builder-shell";
import type { Template } from "@/types/marketplace";

export const metadata = {
  title: "New Config - Actant",
};

interface BuilderPageProps {
  searchParams: Promise<{ template?: string }>;
}

export default async function BuilderPage({ searchParams }: BuilderPageProps) {
  const params = await searchParams;
  let initialTemplate: Template | undefined;

  if (params.template) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("templates")
      .select("*")
      .eq("id", params.template)
      .single();

    if (data) {
      initialTemplate = data as Template;
    }
  }

  return (
    <div className="h-full">
      <BuilderShell initialTemplate={initialTemplate} />
    </div>
  );
}
