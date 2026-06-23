import {
  createClientSupabase,
  getSupabaseConfigError,
  hasSupabaseConfig,
} from "@/lib/supabase";

type AuthResult = {
  error?: string;
};

function formatAuthError(error: { message: string; status?: number; code?: string }) {
  const details = [error.status ? `status ${error.status}` : null, error.code]
    .filter(Boolean)
    .join(" - ");

  return details ? `${error.message} (${details})` : error.message;
}

// Connecte un utilisateur avec email et mot de passe via Supabase Auth.
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthResult> {
  if (!hasSupabaseConfig()) {
    return { error: getSupabaseConfigError() };
  }

  const supabase = createClientSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  return { error: error ? formatAuthError(error) : undefined };
}

// Cree un compte Supabase Auth avec email et mot de passe.
export async function signUpWithPassword(
  email: string,
  password: string,
): Promise<AuthResult> {
  if (!hasSupabaseConfig()) {
    return { error: getSupabaseConfigError() };
  }

  const supabase = createClientSupabase();
  const { error } = await supabase.auth.signUp({ email, password });

  return { error: error ? formatAuthError(error) : undefined };
}

// Ferme la session locale et Supabase de l'utilisateur courant.
export async function signOutCurrentUser(): Promise<AuthResult> {
  if (!hasSupabaseConfig()) {
    return { error: getSupabaseConfigError() };
  }

  const supabase = createClientSupabase();
  const { error } = await supabase.auth.signOut();

  return { error: error ? formatAuthError(error) : undefined };
}
