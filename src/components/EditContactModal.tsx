"use client";

import { FormEvent, useState } from "react";
import type { Contact, ContactStatus } from "@/lib/database.types";
import { updateContact } from "@/lib/contacts";
import { getStatusLabel } from "@/lib/format";
import { Modal } from "@/components/Modal";

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
    const result = await updateContact(contact.id, { name, company, email, phone, status });
    setIsSaving(false);

    if (result.error || !result.contact) {
      setError(result.error ?? "Impossible de modifier le contact.");
      return;
    }

    onUpdated(result.contact);
    onClose();
  }

  return (
    <Modal
      title="Modifier le contact"
      description="Mets à jour les informations de ce contact."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
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
    </Modal>
  );
}
