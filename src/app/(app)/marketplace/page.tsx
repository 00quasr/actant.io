import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { SearchBar } from "@/components/marketplace/search-bar";
import { FilterSidebar } from "@/components/marketplace/filter-sidebar";
import { ListingGrid } from "@/components/marketplace/listing-grid";
import type { Listing } from "@/types/marketplace";

interface MarketplacePageProps {
  searchParams: Promise<{
    q?: string;
    agent?: string;
    use_case?: string;
    document_type?: string;
    sort?: string;
    page?: string;
  }>;
}

async function MarketplaceContent({ searchParams }: MarketplacePageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const page = parseInt(params.page ?? "1", 10);
  const limit = 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("listings")
    .select("*, author:profiles!author_id(*)", { count: "exact" });

  if (params.q) {
    query = query.textSearch("fts", params.q);
  }

  if (params.agent) {
    const agents = params.agent.split(",").filter(Boolean);
    query = query.in("target_agent", agents);
  }

  if (params.use_case) {
    const useCases = params.use_case.split(",").filter(Boolean);
    query = query.in("use_case", useCases);
  }

  if (params.document_type) {
    const docTypes = params.document_type.split(",").filter(Boolean);
    query = query.in("document_type", docTypes);
  }

  switch (params.sort) {
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

  const { data, count } = await query;
  const listings = (data as Listing[]) ?? [];
  const totalPages = Math.ceil((count ?? 0) / limit);

  return (
    <>
      <ListingGrid listings={listings} />
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
        </div>
      )}
    </>
  );
}

export default async function MarketplacePage(props: MarketplacePageProps) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Marketplace</h1>
        <p className="text-muted-foreground">
          Browse and discover agent configurations shared by the community
        </p>
      </div>

      <div className="mb-6">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
        <Suspense>
          <FilterSidebar />
        </Suspense>
        <Suspense fallback={<ListingGrid listings={[]} loading />}>
          <MarketplaceContent searchParams={props.searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
