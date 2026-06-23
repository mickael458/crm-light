import { createServerSupabase } from "@/lib/supabase-server";

// Recupere le profil d'abonnement de l'utilisateur connecte.
export async function fetchCurrentUserProfile(userId: string) {
  const supabase = await createServerSupabase();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}
