import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServerSupabase } from "@/lib/supabase-server";

type CheckoutRequestBody = {
  user_id?: string;
};

export async function POST(request: NextRequest) {
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

    const body = (await request.json().catch(() => ({}))) as CheckoutRequestBody;
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

    if (body.user_id !== user.id) {
      return NextResponse.json(
        { error: "Utilisateur invalide pour cette session de paiement." },
        { status: 403 },
      );
    }

    const stripe = getStripe();
    const stripePriceId = process.env.STRIPE_PRICE_ID?.trim();

    // Crée une session Checkout avec un prix mensuel inline pour le MVP.
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email ?? undefined,
      line_items: [
        stripePriceId
          ? {
              price: stripePriceId,
              quantity: 1,
            }
          : {
              quantity: 1,
              price_data: {
                currency: "eur",
                unit_amount: 900,
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
