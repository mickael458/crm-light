import type { DealWithContact } from "@/lib/database.types";
import { formatCurrency, formatDate, getStageLabel } from "@/lib/format";
import { getContactName } from "@/lib/deals";

const stageBadgeClass = {
  prospect: "bg-sky-50 text-sky-700 ring-sky-200",
  discussion: "bg-amber-50 text-amber-700 ring-amber-200",
  devis: "bg-violet-50 text-violet-700 ring-violet-200",
  gagne: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  perdu: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

type DealCardProps = {
  deal: DealWithContact;
};

export function DealCard({ deal }: DealCardProps) {
  const stage = deal.stage ?? "prospect";

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-zinc-950">
            {deal.title}
          </h3>
          <p className="mt-1 truncate text-sm text-zinc-600">
            {getContactName(deal.contacts)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ring-1 ${stageBadgeClass[stage]}`}
        >
          {getStageLabel(stage)}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-zinc-950">
          {formatCurrency(Number(deal.amount ?? 0))}
        </span>
        <span className="text-zinc-500">{formatDate(deal.created_at)}</span>
      </div>
    </article>
  );
}
