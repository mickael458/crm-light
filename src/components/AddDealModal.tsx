"use client";

import { FormEvent, useState } from "react";
import type { Contact, DealStage, DealWithContact } from "@/lib/database.types";
import { addDeal, visiblePipelineStages } from "@/lib/deals";
import { getStageLabel } from "@/lib/format";

type AddDealModalProps = {
  contacts: Contact[];
  initialStage: DealStage;
  onClose: () => void;
  onDealCreated: (deal: DealWithContact) => void;
};

export function AddDealModal({
  contacts,
  initialStage,
  onClose,
  onDealCreated,
}: AddDealModalProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [contactId, setContactId] = useState("");
  const [stage, setStage] = useState<DealStage>(initialStage);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Renseigne un titre pour le deal.");
      return;
    }

    setIsSubmitting(true);
    const result = await addDeal({ title, amount, contactId, stage });
    setIsSubmitting(false);

    if (result.error || !result.deal) {
      setError(result.error ?? "Impossible de creer le deal.");
      return;
    }

    onDealCreated(result.deal);
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
            <h2 className="text-xl font-semibold text-zinc-950">Ajouter un deal</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Cree une opportunite dans ton pipeline commercial.
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
            <span className="text-sm font-medium text-zinc-800">Titre</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
              placeholder="Ex: Accompagnement strategie"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-800">Montant</span>
            <input
              type="number"
              min="0"
              step="100"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
              placeholder="2500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-800">Contact</span>
            <select
              value={contactId}
              onChange={(event) => setContactId(event.target.value)}
              className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
            >
              <option value="">Aucun contact</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-800">Colonne</span>
            <select
              value={stage}
              onChange={(event) => setStage(event.target.value as DealStage)}
              className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
            >
              {visiblePipelineStages.map((stageOption) => (
                <option key={stageOption} value={stageOption}>
                  {getStageLabel(stageOption)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
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
            disabled={isSubmitting}
            className="h-11 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {isSubmitting ? "Creation..." : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
}
