import type { Deal } from "@/lib/database.types";

export const DEFAULT_ONBOARDING_DELAY_DAYS = 7;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type DealHeat = "urgent" | "watch" | "recent";

type DealWithDates = Pick<Deal, "created_at" | "updated_at">;
type DealWithStageAndDates = DealWithDates & Pick<Deal, "stage">;

export function normalizeDelayDays(delayDays: number | null | undefined) {
  return delayDays && delayDays > 0 ? delayDays : DEFAULT_ONBOARDING_DELAY_DAYS;
}

export function getDaysSinceLastUpdate(deal: DealWithDates, now = new Date()) {
  const referenceDate = deal.updated_at ?? deal.created_at;

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
  deal: DealWithDates,
  delayDays: number | null | undefined,
  now = new Date(),
): DealHeat {
  const normalizedDelay = normalizeDelayDays(delayDays);
  const daysSinceLastUpdate = getDaysSinceLastUpdate(deal, now);

  if (daysSinceLastUpdate > normalizedDelay) {
    return "urgent";
  }

  if (daysSinceLastUpdate > normalizedDelay / 2) {
    return "watch";
  }

  return "recent";
}

export function isDealOverdueForFollowUp(
  deal: DealWithDates,
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
