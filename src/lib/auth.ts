import {
  createClientSupabase,
  getSupabaseConfigError,
  hasSupabaseConfig,
} from "@/lib/supabase";

type AuthResult = {
  error?: string;
  // Inscription : true quand Supabase exige une confirmation par email
  // (aucune session n'est ouverte tant que le lien n'est pas cliqué).
  needsConfirmation?: boolean;
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
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: formatAuthError(error) };
  }

  // Supabase renvoie un user "obfusque" (identities vide, sans erreur) quand
  // l'email est deja inscrit : on evite que l'utilisateur attende un mail fantome.
  const alreadyRegistered =
    Array.isArray(data.user?.identities) && data.user.identities.length === 0;
  if (alreadyRegistered) {
    return {
      error: "Un compte existe deja avec cet email. Connecte-toi a la place.",
    };
  }

  // Pas de session => la confirmation par email est activee cote Supabase.
  // On ne pousse pas vers /onboarding (le proxy renverrait sur /login).
  if (!data.session) {
    return { needsConfirmation: true };
  }

  return {};
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
