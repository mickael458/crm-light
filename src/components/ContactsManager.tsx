"use client";

import { FormEvent, useRef, useState } from "react";
import type { Contact, ContactStatus } from "@/lib/database.types";
import { addContact, deleteContact } from "@/lib/contacts";
import { countDealsForContact } from "@/lib/deals";
import { ContactImport } from "@/components/ContactImport";
import { EditContactModal } from "@/components/EditContactModal";
import { formatDate, getStatusLabel } from "@/lib/format";

const statusBadgeClass: Record<ContactStatus, string> = {
  chaud: "bg-red-50 text-red-700 ring-red-200",
  tiede: "bg-amber-50 text-amber-700 ring-amber-200",
  froid: "bg-sky-50 text-sky-700 ring-sky-200",
};

const statusOptions: ContactStatus[] = ["chaud", "tiede", "froid"];

type ContactsManagerProps = {
  initialContacts: Contact[];
};

export function ContactsManager({ initialContacts }: ContactsManagerProps) {
  const [contacts, setContacts] = useState(initialContacts);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<ContactStatus>("froid");
  const [contextNote, setContextNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [search, setSearch] = useState("");
  const [linkedDealCount, setLinkedDealCount] = useState<number | null>(null);
  const confirmingRef = useRef<string | null>(null);

  async function startDeleteConfirm(contact: Contact) {
    setError(null);
    setLinkedDealCount(null);
    setConfirmingDeleteId(contact.id);
    confirmingRef.current = contact.id;
    const count = await countDealsForContact(contact.id);
    // Ne pose le compte que s'il concerne toujours le contact en cours de confirmation.
    if (confirmingRef.current === contact.id) {
      setLinkedDealCount(count);
    }
  }

  function cancelDeleteConfirm() {
    confirmingRef.current = null;
    setConfirmingDeleteId(null);
    setLinkedDealCount(null);
  }

  const normalizedSearch = search.trim().toLowerCase();
  const filteredContacts = normalizedSearch
    ? contacts.filter((contact) =>
        [contact.name, contact.company, contact.email, contact.phone, contact.context_note].some((field) =>
          (field ?? "").toLowerCase().includes(normalizedSearch),
        ),
      )
    : contacts;

  async function handleDelete(id: string) {
    setError(null);
    setDeletingId(id);
    const result = await deleteContact(id);
    setDeletingId(null);
    setConfirmingDeleteId(null);
    confirmingRef.current = null;
    setLinkedDealCount(null);

    if (result.error) {
      setError(result.error);
      return;
    }

    setContacts((currentContacts) => currentContacts.filter((contact) => contact.id !== id));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Renseigne le nom du contact.");
      return;
    }

    setIsSubmitting(true);
    const result = await addContact({ name, company, email, phone, status, contextNote });
    setIsSubmitting(false);

    if (result.error || !result.contact) {
      setError(result.error ?? "Impossible d’ajouter le contact.");
      return;
    }

    setContacts((currentContacts) => [result.contact as Contact, ...currentContacts]);
    setName("");
    setCompany("");
    setEmail("");
    setPhone("");
    setStatus("froid");
    setContextNote("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="flex flex-col gap-6">
      <ContactImport
        onImported={(imported) =>
          setContacts((currentContacts) => [...imported, ...currentContacts])
        }
      />
      <form
        onSubmit={handleSubmit}
        className="h-fit rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-zinc-950">Ajouter un contact</h2>
        <p className="mt-1 text-sm leading-6 text-zinc-600">
          Garde les informations utiles pour qualifier tes opportunités.
        </p>

        <div className="mt-5 grid gap-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-800">Nom</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
              placeholder="Marie Dupont"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-800">Entreprise</span>
            <input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
              placeholder="Studio Exemple"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-800">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
              placeholder="contact@exemple.fr"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-800">Téléphone</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
              placeholder="06 00 00 00 00"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-800">Statut</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ContactStatus)}
              className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {getStatusLabel(option)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-800">Note de contexte</span>
            <textarea
              value={contextNote}
              onChange={(event) => setContextNote(event.target.value)}
              rows={3}
              className="w-full resize-y rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
              placeholder="Ex : rencontré au salon, rappeler après ses congés, budget serré…"
            />
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 h-11 w-full rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isSubmitting ? "Ajout..." : "Ajouter le contact"}
        </button>
      </form>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">Contacts</h2>
            <p className="mt-1 text-sm text-zinc-600">
              {filteredContacts.length} {filteredContacts.length > 1 ? "contacts" : "contact"}
              {normalizedSearch ? ` sur ${contacts.length}` : ""}
            </p>
          </div>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher (nom, société, email...)"
            className="h-10 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200 sm:w-72"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-5 py-3">Nom</th>
                <th className="px-5 py-3">Entreprise</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Téléphone</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Cree le</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredContacts.map((contact) => {
                const contactStatus = contact.status ?? "froid";

                return (
                  <tr key={contact.id} className="text-zinc-700">
                    <td className="px-5 py-4 align-top font-medium text-zinc-950">
                      <div className="whitespace-nowrap">{contact.name}</div>
                      {contact.context_note ? (
                        <p
                          className="mt-1 max-w-[240px] truncate text-xs font-normal text-zinc-500"
                          title={contact.context_note}
                        >
                          {contact.context_note}
                        </p>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {contact.company ?? "-"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {contact.email ?? "-"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {contact.phone ?? "-"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ring-1 ${statusBadgeClass[contactStatus]}`}
                      >
                        {getStatusLabel(contactStatus)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-zinc-500">
                      {formatDate(contact.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingContact(contact)}
                          className="text-sm font-medium text-zinc-700 transition hover:text-zinc-950"
                        >
                          Modifier
                        </button>
                        {confirmingDeleteId === contact.id ? (
                          <>
                            <span className="text-xs text-zinc-500">
                              {linkedDealCount === null
                                ? "Vérification..."
                                : linkedDealCount > 0
                                  ? `${linkedDealCount} deal${linkedDealCount > 1 ? "s" : ""} détaché${linkedDealCount > 1 ? "s" : ""}`
                                  : "Aucun deal lié"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDelete(contact.id)}
                              disabled={deletingId === contact.id}
                              className="text-sm font-medium text-red-600 transition hover:text-red-700 disabled:opacity-50"
                            >
                              {deletingId === contact.id ? "Suppression..." : "Confirmer"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelDeleteConfirm}
                              disabled={deletingId === contact.id}
                              className="text-sm font-medium text-zinc-500 transition hover:text-zinc-800 disabled:opacity-50"
                            >
                              Annuler
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startDeleteConfirm(contact)}
                            className="text-sm font-medium text-red-600 transition hover:text-red-700"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-zinc-500">
                    {normalizedSearch
                      ? "Aucun contact ne correspond à ta recherche."
                      : "Aucun contact pour le moment."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {editingContact ? (
        <EditContactModal
          contact={editingContact}
          onClose={() => setEditingContact(null)}
          onUpdated={(updated) =>
            setContacts((currentContacts) =>
              currentContacts.map((item) => (item.id === updated.id ? updated : item)),
            )
          }
        />
      ) : null}
    </div>
  );
}

