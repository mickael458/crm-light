import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServerSupabase } from "@/lib/supabase-server";

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
        { error: "Connecte-toi avant de choisir un abonnement." },
        { status: 401 },
      );
    }

    const stripe = getStripe();

    // Crée une session Checkout avec un prix mensuel inline pour le MVP.
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: 2900,
            recurring: {
              interval: "month",
            },
            product_data: {
              name: "CRM Light - Plan Solo",
            },
          },
        },
      ],
      metadata: {
        user_id: user.id,
      },
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          user_id: user.id,
        },
      },
      payment_method_collection: "if_required",
      success_url: `${appUrl}/dashboard?success=true`,
      cancel_url: `${appUrl}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur Stripe inconnue.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
