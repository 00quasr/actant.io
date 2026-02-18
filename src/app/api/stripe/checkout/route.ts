import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { checkoutInputSchema } from "@/validations/billing";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const result = checkoutInputSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 },
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }

  let customerId = profile.stripe_customer_id;

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });

    customerId = customer.id;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update profile with customer ID" },
        { status: 500 },
      );
    }
  }

  const priceId = result.data.priceId || process.env.STRIPE_PRICE_ID_PRO_MONTHLY;

  if (!priceId) {
    return NextResponse.json({ error: "No price ID configured" }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/builder?checkout=success`,
    cancel_url: `${appUrl}/builder?checkout=cancelled`,
    metadata: { supabase_user_id: user.id },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
