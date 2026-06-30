import { redirect } from "next/navigation";
import { PipelineBoard } from "@/components/PipelineBoard";
import { fetchCurrentUserContacts } from "@/lib/contacts-server";
import { fetchCurrentUserDeals } from "@/lib/deals-server";
import { normalizeDelayDays } from "@/lib/deal-heat";
import { fetchCurrentUserProfile } from "@/lib/profiles-server";
import { getCurrentUser } from "@/lib/session";

export default async function PipelinePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [deals, contacts, profile] = await Promise.all([
    fetchCurrentUserDeals(),
    fetchCurrentUserContacts(),
    fetchCurrentUserProfile(user.id),
  ]);
  const followUpDelayDays = normalizeDelayDays(profile?.onboarding_delay);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="border-b border-zinc-200 pb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Pipeline
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-zinc-950">
            Opportunités commerciales
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Déplace les deals entre les colonnes pour garder ton suivi à jour.
          </p>
        </header>

        <PipelineBoard initialDeals={deals} contacts={contacts} followUpDelayDays={followUpDelayDays} />
      </section>
    </main>
  );
}
