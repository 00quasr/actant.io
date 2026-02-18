import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getSupabaseAdmin() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = getSupabaseAdmin();
  const userId = session.metadata?.supabase_user_id;

  if (!userId) {
    console.error("No supabase_user_id in checkout session metadata");
    return;
  }

  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

  const { error } = await supabase
    .from("profiles")
    .update({
      plan: "pro",
      stripe_subscription_id: subscriptionId ?? null,
    })
    .eq("id", userId);

  if (error) {
    console.error("Failed to update profile after checkout:", error.message);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = getSupabaseAdmin();
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  const plan =
    subscription.status === "active" || subscription.status === "trialing" ? "pro" : "free";

  const { error } = await supabase
    .from("profiles")
    .update({ plan })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Failed to update profile on subscription update:", error.message);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = getSupabaseAdmin();
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  const { error } = await supabase
    .from("profiles")
    .update({
      plan: "free",
      stripe_subscription_id: null,
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Failed to update profile on subscription deletion:", error.message);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown verification error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
