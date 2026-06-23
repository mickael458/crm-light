import { createServerSupabase } from "@/lib/supabase-server";

// Recupere l'utilisateur authentifie depuis les cookies Supabase.
export async function getCurrentUser() {
  const supabase = await createServerSupabase();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}
