"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOutCurrentUser } from "@/lib/auth";

export function SignOutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignOut() {
    setIsSubmitting(true);
    await signOutCurrentUser();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSubmitting}
      className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSubmitting ? "Déconnexion..." : "Se déconnecter"}
    </button>
  );
}
