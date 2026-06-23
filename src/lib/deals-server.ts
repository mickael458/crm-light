import type { DealStage, DealWithContact } from "@/lib/database.types";
import { createServerSupabase } from "@/lib/supabase-server";

export type PipelineStats = {
  countsByStage: Record<DealStage, number>;
  totalValue: number;
};

const emptyCounts: Record<DealStage, number> = {
  prospect: 0,
  discussion: 0,
  devis: 0,
  gagne: 0,
  perdu: 0,
};

// Charge les deals de l'utilisateur avec le contact lie.
export async function fetchCurrentUserDeals() {
  const supabase = await createServerSupabase();

  if (!supabase) {
    return [];
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("deals")
    .select("*, contacts(id, name, company, email)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data as DealWithContact[];
}

// Calcule les indicateurs du dashboard a partir des deals visibles.
export async function fetchPipelineStats(): Promise<PipelineStats> {
  const deals = await fetchCurrentUserDeals();

  return deals.reduce<PipelineStats>(
    (stats, deal) => {
      const stage = deal.stage ?? "prospect";
      stats.countsByStage[stage] += 1;
      stats.totalValue += Number(deal.amount ?? 0);
      return stats;
    },
    {
      countsByStage: { ...emptyCounts },
      totalValue: 0,
    },
  );
}
