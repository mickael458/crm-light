import type {
  Contact,
  Deal,
  DealInsert,
  DealStage,
  DealWithContact,
} from "@/lib/database.types";
import { createClientSupabase, getSupabaseConfigError, hasSupabaseConfig } from "@/lib/supabase";

export const visiblePipelineStages: DealStage[] = [
  "prospect",
  "discussion",
  "devis",
  "gagne",
];

export type DealFormInput = {
  title: string;
  amount: string;
  contactId: string;
  stage: DealStage;
};

export type DealResult = {
  deal?: DealWithContact;
  error?: string;
};

// Insere un nouveau deal en conservant l'utilisateur courant comme proprietaire.
export async function addDeal(input: DealFormInput): Promise<DealResult> {
  if (!hasSupabaseConfig()) {
    return { error: getSupabaseConfigError() };
  }

  const supabase = createClientSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Connecte-toi avant d'ajouter un deal." };
  }

  const amount = input.amount ? Number(input.amount) : null;

  if (amount !== null && Number.isNaN(amount)) {
    return { error: "Le montant doit etre un nombre valide." };
  }

  const payload: DealInsert = {
    user_id: user.id,
    title: input.title.trim(),
    amount,
    contact_id: input.contactId || null,
    stage: input.stage,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("deals")
    .insert(payload)
    .select("*, contacts(id, name, company, email)")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { deal: data as DealWithContact };
}

// Met a jour la colonne d'un deal apres un glisser-deposer.
export async function updateDealStage(dealId: string, stage: DealStage) {
  if (!hasSupabaseConfig()) {
    return { error: getSupabaseConfigError() };
  }

  const supabase = createClientSupabase();
  const { error } = await supabase
    .from("deals")
    .update({ stage, updated_at: new Date().toISOString() })
    .eq("id", dealId);

  return { error: error?.message };
}

export function getContactName(contact: Pick<Contact, "name"> | null) {
  return contact?.name ?? "Contact non renseigne";
}

export function sortDealsByCreatedAt(deals: Deal[]) {
  return [...deals].sort((first, second) => {
    return String(second.created_at ?? "").localeCompare(String(first.created_at ?? ""));
  });
}
