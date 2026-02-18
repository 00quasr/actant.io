import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "@/components/profile/profile-header";
import { PublishedConfigsList } from "@/components/profile/published-configs-list";
import { FavoritesList } from "@/components/profile/favorites-list";
import type { Profile, Listing } from "@/types/marketplace";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (!profile) redirect("/login");

  const typedProfile = profile as Profile;

  const { data: publishedListings } = await supabase
    .from("listings")
    .select("*, author:profiles!author_id(*)")
    .eq("author_id", user.id)
    .order("published_at", { ascending: false });

  const { data: favoriteData } = await supabase
    .from("favorites")
    .select("listing:listings!listing_id(*, author:profiles!author_id(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const published = (publishedListings as Listing[]) ?? [];
  const favorites =
    (favoriteData?.map((f: Record<string, unknown>) => f.listing).filter(Boolean) as Listing[]) ??
    [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex items-start justify-between">
        <ProfileHeader profile={typedProfile} />
        <Button variant="outline" size="sm" asChild>
          <Link href="/profile/settings">Edit Profile</Link>
        </Button>
      </div>

      <Tabs defaultValue="published" className="mt-8">
        <TabsList>
          <TabsTrigger value="published">Published ({published.length})</TabsTrigger>
          <TabsTrigger value="favorites">Favorites ({favorites.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="published" className="pt-4">
          <PublishedConfigsList listings={published} />
        </TabsContent>
        <TabsContent value="favorites" className="pt-4">
          <FavoritesList listings={favorites} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
