import { createServerSupabase } from "@/lib/supabase-server";

// Charge les contacts de l'utilisateur connecte depuis le serveur.
export async function fetchCurrentUserContacts() {
  const supabase = await createServerSupabase();

  if (!supabase) {
    return [];
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data;
}
