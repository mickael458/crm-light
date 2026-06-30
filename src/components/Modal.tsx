"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ModalProps = {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

// Modale accessible et fermable : touche Échap, clic sur le fond, role="dialog"
// et focus initial sur le panneau (lecteur d'écran + clavier).
export function Modal({ title, description, onClose, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus initial sur le panneau, au montage uniquement (pas a chaque render,
  // sinon on volerait le focus du champ en cours de saisie).
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-4 py-6 sm:items-center"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl outline-none"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-950">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-zinc-600">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="rounded-md px-2 py-1 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            Fermer
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
