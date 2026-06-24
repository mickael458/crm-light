import { headers } from "next/headers";
import { type NextRequest } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Webhook Stripe : STRIPE_WEBHOOK_SECRET manquante.");
      return Response.json(
        { error: "STRIPE_WEBHOOK_SECRET est manquante." },
        { status: 500 },
      );
    }

    const rawBody = await request.text();
    const signature = (await headers()).get("stripe-signature");

    if (!signature) {
      console.error("Webhook Stripe : signature manquante.");
      return Response.json(
        { error: "Signature Stripe manquante." },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      console.error("Webhook Stripe : signature invalide", error);
      return Response.json(
        { error: "Signature Stripe invalide." },
        { status: 400 },
      );
    }


    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null;

      if (!userId) {
        console.error("Webhook Stripe : user_id manquant dans session.metadata.");
        return new Response("OK", { status: 200 });
      }


      const supabaseAdmin = createSupabaseAdmin();
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          subscribed: true,
          subscription_id: subscriptionId,
        })
        .eq("id", userId);

      if (error) {
        console.error("Webhook Stripe : erreur Supabase profiles", error);
        return Response.json({ error: error.message }, { status: 500 });
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook Stripe : erreur complète", error);
    const message = error instanceof Error ? error.message : "Erreur webhook Stripe.";
    return Response.json({ error: message }, { status: 500 });
  }
}
