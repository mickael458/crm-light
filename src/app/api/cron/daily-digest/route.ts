import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import type { DealWithContact } from "@/lib/database.types";
import { getDaysSinceLastUpdate, isDealOverdueForFollowUp, normalizeDelayDays } from "@/lib/deal-heat";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const pipelineUrl = "https://crm-light.com/dashboard/pipeline";
const emailFrom = "CRM Light <relances@crm-light.com>";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function shouldSendDigest(summary: string | null, now: Date) {
  if (summary === "jamais") {
    return false;
  }

  if (summary === "hebdo") {
    // Résumé hebdomadaire : on n'envoie que le lundi.
    return now.getDay() === 1;
  }

  // "matin" ou préférence non renseignée : envoi quotidien.
  return true;
}

function formatDigestDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildDigestHtml(deals: DealWithContact[], now: Date) {
  const items = deals
    .map((deal) => {
      const contactName = deal.contacts?.name ?? "Contact non renseigné";
      const days = getDaysSinceLastUpdate(deal, now);
      const contextLine = deal.context_note
        ? "<br/><em style=\"color:#52525b;font-size:13px;\">" + escapeHtml(deal.context_note) + "</em>"
        : "";

      return "<li><strong>" + escapeHtml(deal.title) + "</strong> — " + escapeHtml(contactName) + " · " + days + " jour" + (days > 1 ? "s" : "") + " sans contact" + contextLine + "</li>";
    })
    .join("");

  return "<!doctype html>" +
    "<html lang=\"fr\">" +
    "<body style=\"font-family: Arial, sans-serif; color: #18181b; line-height: 1.5;\">" +
    "<h1>Vos relances du jour</h1>" +
    "<p>Voici les deals à relancer aujourd'hui.</p>" +
    "<ul>" + items + "</ul>" +
    "<p><a href=\"" + pipelineUrl + "\" style=\"display:inline-block;background:#18181b;color:#fff;padding:12px 16px;border-radius:8px;text-decoration:none;\">Voir mon pipeline</a></p>" +
    "</body></html>";
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const resendApiKey = process.env.RESEND_API_KEY;
  const authorization = request.headers.get("authorization");

  if (!cronSecret || authorization !== "Bearer " + cronSecret) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  if (!resendApiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY est manquante." }, { status: 500 });
  }

  const supabase = createSupabaseAdmin();
  const resend = new Resend(resendApiKey);
  const now = new Date();
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id,onboarding_delay,onboarding_summary")
    .eq("subscribed", true)
    .eq("onboarding_done", true);

  if (profilesError) {
    console.error("Daily digest : erreur lecture profiles", profilesError);
    return NextResponse.json({ error: "Impossible de charger les profils." }, { status: 500 });
  }

  for (const profile of profiles ?? []) {
    if (!shouldSendDigest(profile.onboarding_summary, now)) {
      skipped += 1;
      continue;
    }

    const delayDays = normalizeDelayDays(profile.onboarding_delay);
    const { data: deals, error: dealsError } = await supabase
      .from("deals")
      .select("*, contacts(id, name, company, email)")
      .eq("user_id", profile.id);

    if (dealsError) {
      failed += 1;
      console.error("Daily digest : erreur lecture deals", dealsError);
      continue;
    }

    const overdueDeals = ((deals ?? []) as DealWithContact[]).filter((deal) => {
      return isDealOverdueForFollowUp(deal, delayDays, now);
    });

    if (overdueDeals.length === 0) {
      skipped += 1;
      continue;
    }

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.id);
    const email = userData.user?.email;

    if (userError || !email) {
      failed += 1;
      console.error("Daily digest : utilisateur introuvable", userError);
      continue;
    }

    const { error: emailError } = await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: "Vos relances du jour — " + formatDigestDate(now),
      html: buildDigestHtml(overdueDeals, now),
    });

    if (emailError) {
      failed += 1;
      console.error("Daily digest : erreur envoi email", emailError);
      continue;
    }

    sent += 1;
  }

  return NextResponse.json({ sent, skipped, failed });
}
