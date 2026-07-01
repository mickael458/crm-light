"use client";

import { FormEvent, useState } from "react";
import type { Contact, DealStage, DealWithContact } from "@/lib/database.types";
import { addDeal, selectablePipelineStages } from "@/lib/deals";
import { getStageLabel } from "@/lib/format";
import { Modal } from "@/components/Modal";

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
  const [contextNote, setContextNote] = useState("");
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
    const result = await addDeal({ title, amount, contactId, stage, contextNote });
    setIsSubmitting(false);

    if (result.error || !result.deal) {
      setError(result.error ?? "Impossible de créer le deal.");
      return;
    }

    onDealCreated(result.deal);
    onClose();
  }

  return (
    <Modal
      title="Ajouter un deal"
      description="Crée une opportunité dans ton pipeline commercial."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="mt-6 grid gap-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-800">Titre</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
              placeholder="Ex : Accompagnement stratégie"
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
            <span className="text-sm font-medium text-zinc-800">Statut</span>
            <select
              value={stage}
              onChange={(event) => setStage(event.target.value as DealStage)}
              className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200"
            >
              {selectablePipelineStages.map((stageOption) => (
                <option key={stageOption} value={stageOption}>
                  {getStageLabel(stageOption)}
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
              placeholder="Ex : attend son budget Q3, relancer après le salon…"
            />
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
            {isSubmitting ? "Création..." : "Ajouter"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

