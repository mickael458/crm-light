"use client";

import { FormEvent, useState } from "react";
import type { Contact, ContactStatus } from "@/lib/database.types";
import { updateContact } from "@/lib/contacts";
import { getStatusLabel } from "@/lib/format";

const statusOptions: ContactStatus[] = ["chaud", "tiede", "froid"];

type EditContactModalProps = {
  contact: Contact;
  onClose: () => void;
  onUpdated: (contact: Contact) => void;
};

export function EditContactModal({ contact, onClose, onUpdated }: EditContactModalProps) {
  const [name, setName] = useState(contact.name);
  const [company, setCompany] = useState(contact.company ?? "");
  const [email, setEmail] = useState(contact.email ?? "");
  const [phone, setPhone] = useState(contact.phone ?? "");
  const [status, setStatus] = useState<ContactStatus>(contact.status ?? "froid");
  const [contextNote, setContextNote] = useState(contact.context_note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Renseigne le nom du contact.");
      return;
    }

    setIsSaving(true);
    const result = await updateContact(contact.id, { name, company, email, phone, status, contextNote });
    setIsSaving(false);

    if (result.error || !result.contact) {
      setError(result.error ?? "Impossible de modifier le contact.");
      return;
    }

    onUpdated(result.contact);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-4 py-6 sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-950">Modifier le contact</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Mets à jour les informations de ce contact.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            Fermer
          </button>
        </div>

        <div className="mt-6 grid gap-4">
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
            <span className="text-sm font-medium text-zinc-800">Contexte (optionnel)</span>
            <textarea
              value={contextNote}
              onChange={(event) => setContextNote(event.target.value.slice(0, 280))}
              rows={3}
              maxLength={280}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
              placeholder="Ex. : a dit attendre la validation budget avant fin mars"
            />
            <span className="block text-right text-xs text-zinc-400">{contextNote.length}/280</span>
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="h-11 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
