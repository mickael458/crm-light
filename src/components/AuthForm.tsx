"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signInWithPassword, signUpWithPassword } from "@/lib/auth";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";

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

    router.push("/pricing");
    router.refresh();
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


