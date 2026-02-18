import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/components/layout/sidebar-nav";

export const metadata: Metadata = {
  title: {
    template: "%s | Actant",
    default: "Dashboard | Actant",
  },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <main className="flex-1 min-w-0 overflow-hidden pt-14 md:pt-0">{children}</main>
    </div>
  );
}
