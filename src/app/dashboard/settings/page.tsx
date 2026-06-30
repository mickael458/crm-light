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
        <header className="border-b border-zinc-200 pb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Paramètres
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-zinc-950">
            Tes préférences
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Ajuste ta configuration de relance. Ces réglages personnalisent ton dashboard.
          </p>
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
