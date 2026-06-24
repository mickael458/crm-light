import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { fetchCurrentUserProfile } from "@/lib/profiles-server";
import { getCurrentUser } from "@/lib/session";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await fetchCurrentUserProfile(user.id);

  if (profile?.onboarding_done) {
    redirect("/dashboard");
  }

  return <OnboardingWizard userId={user.id} />;
}
