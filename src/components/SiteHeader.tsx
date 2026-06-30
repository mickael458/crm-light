"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// La landing page ("/") a sa propre navigation : on masque la nav globale dessus.
const hiddenOn = ["/"];

export function SiteHeader({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const pathname = usePathname();

  if (hiddenOn.includes(pathname)) {
    return null;
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-zinc-950">
            crm<span className="text-brand">·</span>light
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-600">
          {isAuthenticated ? (
            [
              { href: "/dashboard", label: "Dashboard" },
              { href: "/dashboard/pipeline", label: "Pipeline" },
              { href: "/dashboard/contacts", label: "Contacts" },
              { href: "/pricing", label: "Tarifs" },
            ].map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`transition hover:text-brand ${active ? "font-semibold text-brand" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })
          ) : (
            <>
              <Link href="/pricing" className="transition hover:text-brand">
                Tarifs
              </Link>
              <Link href="/login" className="transition hover:text-brand">
                Connexion
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center rounded-md bg-zinc-950 px-3 font-semibold text-white transition hover:bg-zinc-800"
              >
                S’inscrire
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
