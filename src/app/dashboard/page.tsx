import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";
import { visiblePipelineStages } from "@/lib/deals";
import { fetchPipelineStats } from "@/lib/deals-server";
import { formatCurrency, getStageLabel } from "@/lib/format";
import { fetchCurrentUserProfile } from "@/lib/profiles-server";
import { getCurrentUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [stats, profile] = await Promise.all([
    fetchPipelineStats(),
    fetchCurrentUserProfile(user.id),
  ]);
  const isSubscribed = Boolean(profile?.subscribed);

  if (!isSubscribed) {
    redirect("/pricing");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              CRM Light
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
              Tableau de bord
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Bienvenue {user.email}. Suis tes contacts, tes opportunités et la
              valeur de ton pipeline.
            </p>
          </div>
          <SignOutButton />
        </header>

        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
          Plan Solo actif
        </div>

        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">Valeur totale</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-950">
              {formatCurrency(stats.totalValue)}
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Somme des montants renseignés dans le pipeline.
            </p>
          </article>

          <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">Accès rapide</p>
            <div className="mt-4 grid gap-3">
              <Link
                href="/dashboard/pipeline"
                className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Ouvrir le pipeline
              </Link>
              <Link
                href="/dashboard/contacts"
                className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
              >
                Gérer les contacts
              </Link>
            </div>
          </article>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visiblePipelineStages.map((stage) => (
            <article
              key={stage}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-zinc-500">
                {getStageLabel(stage)}
              </p>
              <p className="mt-3 text-3xl font-semibold text-zinc-950">
                {stats.countsByStage[stage]}
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                {stats.countsByStage[stage] > 1 ? "deals" : "deal"}
              </p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
