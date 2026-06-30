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


    const supabaseAdmin = createSupabaseAdmin();

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

      // upsert et non update : si la ligne profiles n'existe pas (trigger absent,
      // compte anterieur), un update ne toucherait 0 ligne, renverrait 200, et le
      // client aurait paye sans etre active.
      const { error } = await supabaseAdmin
        .from("profiles")
        .upsert(
          { id: userId, subscribed: true, subscription_id: subscriptionId },
          { onConflict: "id" },
        );

      if (error) {
        console.error("Webhook Stripe : erreur Supabase profiles", error);
        return Response.json({ error: error.message }, { status: 500 });
      }
    }

    // Cycle de vie : annulation, impaye (past_due), fin d'essai non payee, etc.
    // Sans ca, subscribed reste true a vie et l'etat diverge de la verite Stripe.
    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.user_id ?? null;
      const isActive =
        event.type !== "customer.subscription.deleted" &&
        (subscription.status === "active" || subscription.status === "trialing");

      const fields = {
        subscribed: isActive,
        subscription_id: isActive ? subscription.id : null,
      };

      const { error } = userId
        ? await supabaseAdmin
            .from("profiles")
            .upsert({ id: userId, ...fields }, { onConflict: "id" })
        : await supabaseAdmin
            .from("profiles")
            .update(fields)
            .eq("subscription_id", subscription.id);

      if (error) {
        console.error("Webhook Stripe : erreur maj abonnement", error);
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
