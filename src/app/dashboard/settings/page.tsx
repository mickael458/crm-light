import Link from "next/link";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/SettingsForm";
import { fetchCurrentUserProfile } from "@/lib/profiles-server";
import { getCurrentUser } from "@/lib/session";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await fetchCurrentUserProfile(user.id);

  if (!profile?.onboarding_done) {
    redirect("/onboarding");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-2xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              Paramètres
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
              Tes préférences
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Ajuste ta configuration de relance. Ces réglages personnalisent ton dashboard.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
          >
            Retour
          </Link>
        </header>

        <SettingsForm
          userId={user.id}
          initialActivity={profile.onboarding_activity ?? "consultant"}
          initialCycle={profile.onboarding_cycle ?? "court"}
          initialDelay={profile.onboarding_delay ?? 7}
          initialGoal={profile.onboarding_goal ?? "relance"}
          initialChannels={profile.onboarding_channels ?? ["email"]}
          initialSummary={profile.onboarding_summary ?? "matin"}
        />
      </section>
    </main>
  );
}
