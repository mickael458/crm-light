import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServerSupabase } from "@/lib/supabase-server";

// Ouvre le portail de facturation Stripe pour que le client gère ou annule
// son abonnement lui-même (« annulation en 1 clic »).
export async function POST() {
  try {
    const appUrl = process.env.NEXT_PUBLIC_URL?.replace(/\/$/, "");

    if (!appUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_URL est manquante dans .env.local." },
        { status: 500 },
      );
    }

    const supabase = await createServerSupabase();

    if (!supabase) {
      return NextResponse.json(
        { error: "Configuration Supabase manquante." },
        { status: 500 },
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Connecte-toi pour gérer ton abonnement." },
        { status: 401 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("subscription_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile?.subscription_id) {
      return NextResponse.json(
        { error: "Aucun abonnement à gérer pour le moment." },
        { status: 404 },
      );
    }

    const stripe = getStripe();

    // Le portail attend l'ID client Stripe ; on le récupère depuis l'abonnement.
    const subscription = await stripe.subscriptions.retrieve(profile.subscription_id);
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur Stripe inconnue.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
