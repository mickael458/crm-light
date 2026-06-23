import Stripe from "stripe";

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY est manquante dans .env.local.");
  }

  // Client Stripe serveur uniquement. Ne jamais importer ce fichier cote client.
  return new Stripe(secretKey);
}
