import type {
  OnboardingActivity,
  OnboardingCycle,
  OnboardingGoal,
  OnboardingSummary,
} from "@/lib/database.types";
import { createClientSupabase, getSupabaseConfigError, hasSupabaseConfig } from "@/lib/supabase";

export type ProfileSettingsInput = {
  activity: OnboardingActivity;
  cycle: OnboardingCycle;
  delay: number;
  goal: OnboardingGoal;
  channels: string[];
  summary: OnboardingSummary;
};

// Met a jour les preferences (onboarding) du profil de l'utilisateur connecte.
export async function updateProfileSettings(
  userId: string,
  input: ProfileSettingsInput,
): Promise<{ error?: string }> {
  if (!hasSupabaseConfig()) {
    return { error: getSupabaseConfigError() };
  }

  const supabase = createClientSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      onboarding_activity: input.activity,
      onboarding_cycle: input.cycle,
      onboarding_delay: input.delay,
      onboarding_goal: input.goal,
      onboarding_channels: input.channels,
      onboarding_summary: input.summary,
    })
    .eq("id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  if (!data) {
    return { error: "Profil introuvable. Reconnecte-toi puis réessaie." };
  }

  return {};
}
