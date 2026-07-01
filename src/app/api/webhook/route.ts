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

    // Révoque (ou rétablit) l'accès quand l'abonnement change d'état ou prend fin :
    // annulation, fin d'essai sans paiement, impayé... Sans ça, `subscribed` resterait
    // à true indéfiniment et l'accès ne serait jamais coupé.
    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object;
      const userId = subscription.metadata?.user_id;

      if (!userId) {
        console.error(
          "Webhook Stripe : user_id manquant dans subscription.metadata.",
        );
        return new Response("OK", { status: 200 });
      }

      // L'accès est maintenu tant que l'abonnement est actif, en essai, ou en
      // période de grâce (past_due). Tout autre état (canceled, unpaid, etc.) coupe l'accès.
      // Une suppression d'abonnement (deleted) révoque toujours l'accès.
      const accessStatuses = ["active", "trialing", "past_due"];
      const hasAccess =
        event.type === "customer.subscription.updated" &&
        accessStatuses.includes(subscription.status);

      const supabaseAdmin = createSupabaseAdmin();
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ subscribed: hasAccess })
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
