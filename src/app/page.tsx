import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center bg-zinc-50 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
        <div className="space-y-6">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            CRM Light
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-zinc-950 sm:text-5xl">
            Le CRM simple pour suivre tes prospects sans complexite.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-600">
            Un espace leger pour consultants et coachs independants: contacts,
            pipeline commercial et suivi des opportunites.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Creer un compte
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 px-5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
            >
              Se connecter
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium text-zinc-500">Apercu</p>
              <h2 className="mt-2 text-xl font-semibold text-zinc-950">
                Phase 1 terminee
              </h2>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-zinc-600">
              <li>Authentification Supabase</li>
              <li>Connexion et inscription</li>
              <li>Tableau de bord protege</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
