import type {
  Contact,
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

// Stages proposables dans les selecteurs : inclut "perdu", qui n'a pas sa propre
// colonne Kanban mais doit pouvoir etre choisi pour sortir un prospect mort du pipeline.
export const selectablePipelineStages: DealStage[] = [
  ...visiblePipelineStages,
  "perdu",
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

// Borne de la colonne DECIMAL(10,2) en base.
const MAX_DEAL_AMOUNT = 9_999_999.99;

// Normalise une saisie de montant (virgule FR, espaces de milliers) et la borne,
// pour eviter un overflow Postgres cryptique ou un arrondi silencieux a >2 decimales.
function parseAmount(raw: string): { amount: number | null; error?: string } {
  const trimmed = raw.trim();

  if (!trimmed) {
    return { amount: null };
  }

  const normalized = trimmed.replace(/\s/g, "").replace(",", ".");
  const value = Number(normalized);

  if (!Number.isFinite(value)) {
    return { amount: null, error: "Le montant doit être un nombre valide." };
  }

  if (value < 0) {
    return { amount: null, error: "Le montant ne peut pas être négatif." };
  }

  if (value > MAX_DEAL_AMOUNT) {
    return { amount: null, error: "Le montant est trop élevé (max 9 999 999 €)." };
  }

  return { amount: Math.round(value * 100) / 100 };
}

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

  const parsedAmount = parseAmount(input.amount);
  if (parsedAmount.error) {
    return { error: parsedAmount.error };
  }
  const amount = parsedAmount.amount;

  const payload: DealInsert = {
    user_id: user.id,
    title: input.title.trim(),
    amount,
    contact_id: input.contactId || null,
    stage: input.stage,
    updated_at: new Date().toISOString(),
    // last_contacted_at : laisse le DEFAULT NOW() de la base le renseigner,
    // pour ne pas dependre de l'ordre code/migration.
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

// Met a jour les details d'un deal (titre, montant, contact, colonne).
export async function updateDeal(dealId: string, input: DealFormInput): Promise<DealResult> {
  if (!hasSupabaseConfig()) {
    return { error: getSupabaseConfigError() };
  }

  const supabase = createClientSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Connecte-toi avant de modifier un deal." };
  }

  const parsedAmount = parseAmount(input.amount);
  if (parsedAmount.error) {
    return { error: parsedAmount.error };
  }
  const amount = parsedAmount.amount;

  const { data, error } = await supabase
    .from("deals")
    .update({
      title: input.title.trim(),
      amount,
      contact_id: input.contactId || null,
      stage: input.stage,
    })
    .eq("id", dealId)
    .eq("user_id", user.id)
    .select("*, contacts(id, name, company, email)")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { deal: data as DealWithContact };
}

// Supprime un deal de l'utilisateur connecte.
export async function deleteDeal(dealId: string): Promise<{ error?: string }> {
  if (!hasSupabaseConfig()) {
    return { error: getSupabaseConfigError() };
  }

  const supabase = createClientSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Connecte-toi avant de supprimer un deal." };
  }

  const { error } = await supabase
    .from("deals")
    .delete()
    .eq("id", dealId)
    .eq("user_id", user.id);

  return { error: error?.message };
}

// Met a jour la colonne d'un deal apres un glisser-deposer.
// Garde .eq(user_id) (defense en profondeur + RLS) et .select() pour qu'un update
// a 0 ligne (RLS/session degradee) remonte une erreur au lieu d'un faux succes.
// Ne touche PAS last_contacted_at : deplacer une carte n'est pas une relance.
export async function updateDealStage(dealId: string, stage: DealStage) {
  if (!hasSupabaseConfig()) {
    return { error: getSupabaseConfigError() };
  }

  const supabase = createClientSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Connecte-toi avant de deplacer un deal." };
  }

  const { error } = await supabase
    .from("deals")
    .update({ stage })
    .eq("id", dealId)
    .eq("user_id", user.id)
    .select("id")
    .single();

  return { error: error?.message };
}

// Enregistre une relance explicite : avance last_contacted_at (et rien d'autre),
// ce qui remet l'horloge "jours sans contact" a zero pour ce deal.
export async function markDealContacted(dealId: string): Promise<DealResult> {
  if (!hasSupabaseConfig()) {
    return { error: getSupabaseConfigError() };
  }

  const supabase = createClientSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Connecte-toi avant d'enregistrer une relance." };
  }

  const { data, error } = await supabase
    .from("deals")
    .update({ last_contacted_at: new Date().toISOString() })
    .eq("id", dealId)
    .eq("user_id", user.id)
    .select("*, contacts(id, name, company, email)")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { deal: data as DealWithContact };
}

// Compte les deals rattaches a un contact, pour avertir avant suppression
// (la FK est ON DELETE SET NULL : les deals survivent mais perdent leur contact).
export async function countDealsForContact(contactId: string): Promise<number> {
  if (!hasSupabaseConfig()) {
    return 0;
  }

  const supabase = createClientSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return 0;
  }

  const { count } = await supabase
    .from("deals")
    .select("id", { count: "exact", head: true })
    .eq("contact_id", contactId)
    .eq("user_id", user.id);

  return count ?? 0;
}

export function getContactName(contact: Pick<Contact, "name"> | null) {
  return contact?.name ?? "Contact non renseigne";
}
