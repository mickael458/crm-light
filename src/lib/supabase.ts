import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

export const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
export const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
).trim();

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseConfigError() {
  return "La configuration Supabase est manquante. Renseigne NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local.";
}

function assertSupabaseConfig() {
  if (!hasSupabaseConfig()) {
    throw new Error(getSupabaseConfigError());
  }
}

// Cree le client utilise par les formulaires cote navigateur.
export function createClientSupabase() {
  assertSupabaseConfig();

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
