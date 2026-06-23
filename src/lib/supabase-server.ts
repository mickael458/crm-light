import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { supabaseAnonKey, supabaseUrl, hasSupabaseConfig } from "@/lib/supabase";

export async function createServerSupabase() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const cookieStore = await cookies();

  // Cree un client serveur par requete pour lire la session stockee en cookies.
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Les Server Components ne peuvent pas toujours ecrire les cookies.
        }
      },
    },
  });
}
