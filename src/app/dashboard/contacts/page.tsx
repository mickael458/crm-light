import Link from "next/link";
import { redirect } from "next/navigation";
import { ContactsManager } from "@/components/ContactsManager";
import { fetchCurrentUserContacts } from "@/lib/contacts-server";
import { getCurrentUser } from "@/lib/session";

export default async function ContactsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const contacts = await fetchCurrentUserContacts();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              Contacts
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
              Carnet commercial
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Centralise les prospects et clients utiles pour ton pipeline.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/dashboard/pipeline"
              className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
            >
              Pipeline
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Dashboard
            </Link>
          </div>
        </header>

        <ContactsManager initialContacts={contacts} />
      </section>
    </main>
  );
}
