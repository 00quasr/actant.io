import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusIcon } from "@radix-ui/react-icons";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { UserConfigCard } from "@/components/config/user-config-card";
import type { Config } from "@/types/marketplace";

export const metadata = {
  title: "My Configs",
};

export default async function ConfigsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("configs")
    .select("*")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  const configs = (data as Config[]) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">My Configs</h1>
          <p className="text-sm text-muted-foreground">
            Manage your agent configurations
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/builder">
            <PlusIcon className="mr-2 size-4" />
            New Config
          </Link>
        </Button>
      </div>

      {configs.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            No configs yet. Create your first one.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/builder">Create Config</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {configs.map((config) => (
            <UserConfigCard key={config.id} config={config} />
          ))}
        </div>
      )}
    </div>
  );
}
