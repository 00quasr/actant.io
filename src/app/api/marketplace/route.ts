import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/types/marketplace";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q");
  const agent = searchParams.get("agent");
  const use_case = searchParams.get("use_case");
  const sort = searchParams.get("sort") ?? "newest";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select("*, author:profiles!author_id(*)", { count: "exact" });

  if (q) {
    query = query.textSearch("fts", q);
  }

  if (agent) {
    query = query.in("target_agent", agent.split(",").filter(Boolean));
  }

  if (use_case) {
    query = query.in("use_case", use_case.split(",").filter(Boolean));
  }

  switch (sort) {
    case "popular":
      query = query.order("download_count", { ascending: false });
      break;
    case "rated":
      query = query.order("avg_rating", { ascending: false });
      break;
    default:
      query = query.order("published_at", { ascending: false });
      break;
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data as Listing[],
    count: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    config_id: string;
    title: string;
    description: string;
    use_case: string;
    tags: string[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { data: config } = await supabase
    .from("configs")
    .select("target_agent")
    .eq("id", body.config_id)
    .eq("owner_id", user.id)
    .single();

  if (!config) {
    return NextResponse.json({ error: "Config not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("listings")
    .insert({
      config_id: body.config_id,
      author_id: user.id,
      title: body.title,
      description: body.description,
      target_agent: config.target_agent,
      use_case: body.use_case,
      tags: body.tags ?? [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
