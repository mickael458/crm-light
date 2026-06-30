import type { ContactStatus, DealStage } from "@/lib/database.types";

const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number | null) {
  return euroFormatter.format(amount ?? 0);
}

export function formatDate(value: string | null) {
  if (!value) {
    return "Date inconnue";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function getStageLabel(stage: DealStage) {
  const labels: Record<DealStage, string> = {
    prospect: "Prospect",
    discussion: "En discussion",
    devis: "Devis envoyé",
    gagne: "Gagné",
    perdu: "Perdu",
  };

  return labels[stage];
}

export function getStatusLabel(status: ContactStatus | null) {
  const labels: Record<ContactStatus, string> = {
    chaud: "Chaud",
    tiede: "Tiède",
    froid: "Froid",
  };

  return labels[status ?? "froid"];
}
