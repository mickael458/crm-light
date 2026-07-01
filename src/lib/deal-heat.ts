import type { Deal, DealStage } from "@/lib/database.types";

export const DEFAULT_ONBOARDING_DELAY_DAYS = 7;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type DealHeat = "urgent" | "watch" | "recent";

type DealWithDates = Pick<Deal, "created_at" | "updated_at" | "last_contacted_at">;
type DealWithStageAndDates = DealWithDates & Pick<Deal, "stage">;

// Un deal gagné ou perdu est clôturé : il n'y a plus aucune relance à faire dessus.
const TERMINAL_STAGES: DealStage[] = ["gagne", "perdu"];

export function isTerminalStage(stage: DealStage | null | undefined) {
  return stage != null && TERMINAL_STAGES.includes(stage);
}

export function normalizeDelayDays(delayDays: number | null | undefined) {
  return delayDays && delayDays > 0 ? delayDays : DEFAULT_ONBOARDING_DELAY_DAYS;
}

export function getDaysSinceLastContact(deal: DealWithDates, now = new Date()) {
  // Ancienneté depuis la dernière relance EXPLICITE (last_contacted_at), pas depuis
  // une simple édition (updated_at) : éditer un titre ou déplacer une carte ne doit
  // pas remettre le compteur "jours sans contact" à zéro.
  const referenceDate = deal.last_contacted_at ?? deal.updated_at ?? deal.created_at;

  if (!referenceDate) {
    return 0;
  }

  const timestamp = new Date(referenceDate).getTime();

  if (Number.isNaN(timestamp)) {
    return 0;
  }

  return Math.max(0, Math.floor((now.getTime() - timestamp) / MS_PER_DAY));
}

export function getDealHeat(
  deal: DealWithStageAndDates,
  delayDays: number | null | undefined,
  now = new Date(),
): DealHeat {
  // Deal clôturé (gagné/perdu) : jamais urgent, rien à relancer.
  if (isTerminalStage(deal.stage)) {
    return "recent";
  }

  const normalizedDelay = normalizeDelayDays(delayDays);
  const daysSinceLastContact = getDaysSinceLastContact(deal, now);

  if (daysSinceLastContact > normalizedDelay) {
    return "urgent";
  }

  if (daysSinceLastContact > normalizedDelay / 2) {
    return "watch";
  }

  return "recent";
}

export function isDealOverdueForFollowUp(
  deal: DealWithStageAndDates,
  delayDays: number | null | undefined,
  now = new Date(),
) {
  return getDealHeat(deal, delayDays, now) === "urgent";
}

export function getOverdueQuoteDeals<T extends DealWithStageAndDates>(
  deals: T[],
  delayDays: number | null | undefined,
  now = new Date(),
) {
  return deals.filter((deal) => {
    return (deal.stage ?? "prospect") === "devis" && isDealOverdueForFollowUp(deal, delayDays, now);
  });
}
