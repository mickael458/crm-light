import type { Contact, ContactInsert, ContactStatus } from "@/lib/database.types";
import { createClientSupabase, getSupabaseConfigError, hasSupabaseConfig } from "@/lib/supabase";

export type ContactFormInput = {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: ContactStatus;
};

export type ContactResult = {
  contact?: Contact;
  error?: string;
};

export type ContactsBulkResult = {
  contacts?: Contact[];
  error?: string;
};

// Insere plusieurs contacts d'un coup (import CSV) pour l'utilisateur connecte.
export async function addContactsBulk(
  rows: ContactFormInput[],
): Promise<ContactsBulkResult> {
  if (!hasSupabaseConfig()) {
    return { error: getSupabaseConfigError() };
  }

  if (rows.length === 0) {
    return { error: "Aucun contact à importer." };
  }

  const supabase = createClientSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Connecte-toi avant d'importer des contacts." };
  }

  const payload: ContactInsert[] = rows.map((input) => ({
    user_id: user.id,
    name: input.name.trim(),
    company: input.company.trim() || null,
    email: input.email.trim() || null,
    phone: input.phone.trim() || null,
    status: input.status,
  }));

  const { data, error } = await supabase
    .from("contacts")
    .insert(payload)
    .select();

  if (error) {
    return { error: error.message };
  }

  return { contacts: data ?? [] };
}

// Ajoute un contact pour l'utilisateur connecte dans Supabase.
export async function addContact(input: ContactFormInput): Promise<ContactResult> {
  if (!hasSupabaseConfig()) {
    return { error: getSupabaseConfigError() };
  }

  const supabase = createClientSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Connecte-toi avant d'ajouter un contact." };
  }

  const payload: ContactInsert = {
    user_id: user.id,
    name: input.name.trim(),
    company: input.company.trim() || null,
    email: input.email.trim() || null,
    phone: input.phone.trim() || null,
    status: input.status,
  };

  const { data, error } = await supabase
    .from("contacts")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { contact: data };
}
