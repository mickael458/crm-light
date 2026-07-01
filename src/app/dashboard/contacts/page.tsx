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
        <header className="border-b border-zinc-200 pb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Contacts
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-zinc-950">
            Carnet commercial
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Centralise les prospects et clients utiles pour ton pipeline.
          </p>
        </header>

        <ContactsManager initialContacts={contacts} />
      </section>
    </main>
  );
}
