import { PricingCheckoutButton } from "@/components/PricingCheckoutButton";

const includedFeatures = [
  "Contacts illimités",
  "Pipeline Kanban",
  "Relances",
  "Accès mobile",
  "Support français",
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-8">
        <div className="max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Tarifs
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-zinc-950 sm:text-5xl">
            Un plan simple pour piloter votre activité commerciale.
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-600">
            14 jours gratuits, sans carte bancaire
          </p>
        </div>

        <article className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="border-b border-zinc-200 pb-6">
            <h2 className="text-2xl font-semibold text-zinc-950">Plan Solo</h2>
            <p className="mt-3 flex items-end gap-2 text-zinc-950">
              <span className="text-4xl font-semibold">9&euro;</span>
              <span className="pb-1 text-sm text-zinc-500">/mois</span>
            </p>
          </div>

          <ul className="mt-6 space-y-3 text-sm text-zinc-700">
            {includedFeatures.map((feature) => (
              <li key={feature} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <PricingCheckoutButton />
          </div>
        </article>
      </section>
    </main>
  );
}
