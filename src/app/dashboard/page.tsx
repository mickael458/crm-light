import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";
import type { DealWithContact, OnboardingGoal } from "@/lib/database.types";
import { visiblePipelineStages } from "@/lib/deals";
import { calculatePipelineStats, fetchCurrentUserDeals } from "@/lib/deals-server";
import {
  getDaysSinceLastUpdate,
  getDealHeat,
  getOverdueQuoteDeals,
  normalizeDelayDays,
} from "@/lib/deal-heat";
import { formatCurrency, getStageLabel } from "@/lib/format";

const activityLabels: Record<string, string> = {
  consultant: "consultant",
  coach: "coach",
  freelance: "freelance",
  artisan: "artisan",
  autre: "indépendant",
};
import { fetchCurrentUserProfile } from "@/lib/profiles-server";
import { getCurrentUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [deals, profile] = await Promise.all([
    fetchCurrentUserDeals(),
    fetchCurrentUserProfile(user.id),
  ]);
  if (!profile?.onboarding_done) {
    redirect("/onboarding");
  }

  const isSubscribed = Boolean(profile?.subscribed);

  if (!isSubscribed) {
    redirect("/pricing");
  }

  const followUpDelayDays = normalizeDelayDays(profile?.onboarding_delay);
  const stats = calculatePipelineStats(deals);
  const overdueQuoteDeals = getOverdueQuoteDeals(deals, followUpDelayDays);
  const overdueQuoteCount = overdueQuoteDeals.length;
  const urgentDeals = deals.filter(
    (deal) => getDealHeat(deal, followUpDelayDays) === "urgent",
  );
  const goal: OnboardingGoal = profile?.onboarding_goal ?? "relance";
  const activityLabel = activityLabels[profile?.onboarding_activity ?? "autre"];

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              CRM Light
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-zinc-950">
              Tableau de bord
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Bienvenue {user.email}. Ton espace de relance, configuré pour ton
              activité de {activityLabel}.
            </p>
          </div>
          <SignOutButton />
        </header>

        <DashboardFocus
          goal={goal}
          urgentDeals={urgentDeals}
          overdueQuoteDeals={overdueQuoteDeals}
          delayDays={followUpDelayDays}
          totalValue={stats.totalValue}
          dealCount={deals.length}
        />

        {goal !== "devis" && overdueQuoteCount > 0 ? (
          <Link
            href="/dashboard/pipeline"
            className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900 transition hover:bg-amber-100 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>
              {overdueQuoteCount} devis sans réponse depuis plus de {followUpDelayDays} jours
            </span>
            <span className="text-amber-800 underline underline-offset-4">Voir le pipeline</span>
          </Link>
        ) : null}

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
              <Link
                href="/dashboard/settings"
                className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
              >
                Paramètres
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

function DashboardFocus({
  goal,
  urgentDeals,
  overdueQuoteDeals,
  delayDays,
  totalValue,
  dealCount,
}: {
  goal: OnboardingGoal;
  urgentDeals: DealWithContact[];
  overdueQuoteDeals: DealWithContact[];
  delayDays: number;
  totalValue: number;
  dealCount: number;
}) {
  if (goal === "devis") {
    return (
      <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">Tes devis en attente</h2>
        {overdueQuoteDeals.length > 0 ? (
          <>
            <p className="mt-1 text-sm text-zinc-600">
              {overdueQuoteDeals.length} devis sans réponse depuis plus de {delayDays} jours.
            </p>
            <FocusList deals={overdueQuoteDeals} />
          </>
        ) : (
          <p className="mt-2 text-sm text-zinc-600">
            Aucun devis en attente de réponse pour l&apos;instant.
          </p>
        )}
        <FocusLink />
      </article>
    );
  }

  if (goal === "pipeline") {
    return (
      <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">
          Ton pipeline en un coup d&apos;œil
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          {dealCount} opportunité{dealCount > 1 ? "s" : ""} en cours · {formatCurrency(totalValue)} de valeur totale.
        </p>
        <FocusLink />
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">À relancer aujourd&apos;hui</h2>
      {urgentDeals.length > 0 ? (
        <>
          <p className="mt-1 text-sm text-zinc-600">
            {urgentDeals.length} deal{urgentDeals.length > 1 ? "s" : ""} sans contact depuis plus de {delayDays} jours.
          </p>
          <FocusList deals={urgentDeals} />
        </>
      ) : (
        <p className="mt-2 text-sm text-zinc-600">
          Aucune relance urgente. Tout est à jour.
        </p>
      )}
      <FocusLink />
    </article>
  );
}

function FocusList({ deals }: { deals: DealWithContact[] }) {
  return (
    <ul className="mt-4 space-y-2">
      {deals.slice(0, 5).map((deal) => (
        <li
          key={deal.id}
          className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate">
              <span className="font-medium text-zinc-950">{deal.title}</span>
              <span className="text-zinc-500">
                {" "}
                — {deal.contacts?.name ?? "Contact non renseigné"}
              </span>
            </span>
            <span className="shrink-0 text-zinc-500">{getDaysSinceLastUpdate(deal)} j</span>
          </div>
          {deal.context_note ? (
            <p className="mt-1 line-clamp-2 text-xs italic text-zinc-500">
              {deal.context_note}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function FocusLink() {
  return (
    <Link
      href="/dashboard/pipeline"
      className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
    >
      Ouvrir le pipeline
    </Link>
  );
}
