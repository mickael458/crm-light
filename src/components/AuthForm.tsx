"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signInWithPassword, signUpWithPassword } from "@/lib/auth";
import { createClientSupabase } from "@/lib/supabase";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOauthLoading, setIsOauthLoading] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  const isLogin = mode === "login";

  async function handleGoogle() {
    setError(null);
    setIsOauthLoading(true);

    const supabase = createClientSupabase();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setIsOauthLoading(false);
    }
    // En cas de succes, le navigateur est redirige vers Google : pas de reset.
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Renseigne ton email et ton mot de passe.");
      return;
    }

    setIsSubmitting(true);

    const result = isLogin
      ? await signInWithPassword(email, password)
      : await signUpWithPassword(email, password);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (isLogin) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    // Confirmation email requise : pas de session encore, on reste sur place
    // et on explique quoi faire plutot que de rebondir sur /login via le proxy.
    if (result.needsConfirmation) {
      setConfirmationEmail(email);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  }

  if (confirmationEmail) {
    return (
      <div className="w-full max-w-md space-y-5 rounded-lg border border-zinc-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-zinc-950">Vérifie ta boîte mail</h1>
          <p className="text-sm leading-6 text-zinc-600">
            On vient d’envoyer un lien de confirmation à{" "}
            <span className="font-medium text-zinc-900">{confirmationEmail}</span>.
            Clique dessus pour activer ton compte et démarrer la configuration.
          </p>
        </div>
        <p className="text-sm text-zinc-500">
          Pas reçu ? Vérifie tes spams, ou{" "}
          <button
            type="button"
            onClick={() => {
              setConfirmationEmail(null);
              setError(null);
            }}
            className="font-medium text-zinc-950 underline underline-offset-4"
          >
            réessaie
          </button>
          .
        </p>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-zinc-600 underline-offset-4 hover:underline"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-5 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-zinc-950">
          {isLogin ? "Connexion" : "Inscription"}
        </h1>
        <p className="text-sm leading-6 text-zinc-600">
          {isLogin
            ? "Accède à ton espace CRM Light."
            : "Crée ton compte pour commencer à suivre tes prospects."}
        </p>
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={isOauthLoading || isSubmitting}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon />
        {isOauthLoading ? "Redirection..." : "Continuer avec Google"}
      </button>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-zinc-200" />
        <span className="text-xs uppercase tracking-wide text-zinc-400">ou</span>
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-800">Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
          placeholder="toi@exemple.fr"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-zinc-800">Mot de passe</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isLogin ? "current-password" : "new-password"}
          className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
          placeholder="Minimum 6 caractères"
        />
      </label>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}


      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {isSubmitting
          ? "Traitement..."
          : isLogin
            ? "Se connecter"
            : "Créer mon compte"}
      </button>

      <p className="text-center text-sm text-zinc-600">
        {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"} {" "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-medium text-zinc-950 underline-offset-4 hover:underline"
        >
          {isLogin ? "S’inscrire" : "Se connecter"}
        </Link>
      </p>
    </form>
  );
}


