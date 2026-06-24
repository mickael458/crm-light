"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { createClientSupabase } from "@/lib/supabase";
import type { OnboardingActivity, OnboardingCycle, OnboardingGoal, OnboardingSummary } from "@/lib/database.types";

type OnboardingWizardProps = { userId: string };
type Choice<T extends string> = { value: T; label: string; description: string; icon: string };

const activities: Choice<OnboardingActivity>[] = [
  { value: "consultant", label: "Consultant", description: "Missions, avant-ventes", icon: "briefcase" },
  { value: "coach", label: "Coach", description: "Séances, accompagnement", icon: "heart" },
  { value: "freelance", label: "Freelance", description: "Projets, devis clients", icon: "code" },
  { value: "artisan", label: "Artisan", description: "Chantiers, devis terrain", icon: "tools" },
];

const cycles: Choice<OnboardingCycle>[] = [
  { value: "court", label: "Cycle court", description: "Décision en 1-2 semaines", icon: "bolt" },
  { value: "long", label: "Cycle long", description: "Décision en 1-3 mois", icon: "clock" },
  { value: "devis", label: "Devis d'abord", description: "Je soumets un devis", icon: "file" },
  { value: "appel", label: "Appel découverte", description: "RDV avant de proposer", icon: "phone" },
];

const goals: Choice<OnboardingGoal>[] = [
  { value: "relance", label: "Ne rater aucune relance", description: "Je veux voir chaque matin qui je dois relancer aujourd'hui", icon: "bell" },
  { value: "devis", label: "Suivre mes devis", description: "Je veux savoir quels devis attendent une réponse", icon: "file" },
  { value: "pipeline", label: "Voir mon pipeline", description: "Je veux une vue globale de mes opportunités en cours", icon: "chart" },
];

const delayOptions = [3, 5, 7, 14] as const;
const channelOptions: { value: string; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "telephone", label: "Téléphone" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "whatsapp", label: "WhatsApp" },
];
const summaryOptions: { value: OnboardingSummary; label: string }[] = [
  { value: "matin", label: "Chaque matin" },
  { value: "hebdo", label: "Hebdomadaire" },
  { value: "jamais", label: "Jamais" },
];

function Icon({ name }: { name: string }) {
  const common = "h-5 w-5";
  if (name === "briefcase") return <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1"/><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 12h18"/></svg>;
  if (name === "heart") return <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>;
  if (name === "code") return <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="m8 9-4 3 4 3"/><path d="m16 9 4 3-4 3"/><path d="m14 5-4 14"/></svg>;
  if (name === "tools") return <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="m14.7 6.3 3 3"/><path d="M3 21l7.5-7.5"/><path d="M14 3a5 5 0 0 0 7 7L10 21H3v-7Z"/></svg>;
  if (name === "bolt") return <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 10-13h-7Z"/></svg>;
  if (name === "clock") return <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
  if (name === "phone") return <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 1.9Z"/></svg>;
  if (name === "bell") return <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>;
  if (name === "chart") return <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-5"/><path d="M12 16V8"/><path d="M16 16v-3"/></svg>;
  return <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>;
}

export function OnboardingWizard({ userId }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [activity, setActivity] = useState<OnboardingActivity>("consultant");
  const [cycle, setCycle] = useState<OnboardingCycle>("court");
  const [delay, setDelay] = useState<number>(7);
  const [channels, setChannels] = useState<string[]>(["email"]);
  const [summary, setSummary] = useState<OnboardingSummary>("matin");
  const [goal, setGoal] = useState<OnboardingGoal>("relance");
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = Math.min(((step + 1) / 4) * 100, 100);
  const selectedActivity = useMemo(() => activities.find((item) => item.value === activity), [activity]);
  const selectedCycle = useMemo(() => cycles.find((item) => item.value === cycle), [cycle]);
  const selectedGoal = useMemo(() => goals.find((item) => item.value === goal), [goal]);
  const channelLabels = channels
    .map((value) => channelOptions.find((option) => option.value === value)?.label ?? value)
    .join(", ");
  const summaryLabel = summaryOptions.find((option) => option.value === summary)?.label ?? "";

  function toggleChannel(channel: string) {
    setChannels((current) => current.includes(channel) ? current.filter((item) => item !== channel) : [...current, channel]);
  }

  async function completeOnboarding() {
    setIsSaving(true);
    setError(null);
    const supabase = createClientSupabase();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ onboarding_activity: activity, onboarding_cycle: cycle, onboarding_delay: delay, onboarding_goal: goal, onboarding_channels: channels, onboarding_summary: summary, onboarding_done: true })
      .eq("id", userId);
    setIsSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setIsComplete(true);
  }

  if (isComplete) {
    return (
      <OnboardingShell progress={100} title="Ton CRM est prêt" subtitle="Ta configuration de départ est enregistrée.">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>
        </div>
        <div className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
          <p><strong>Activité :</strong> {selectedActivity?.label}</p>
          <p><strong>Vente :</strong> {selectedCycle?.label}</p>
          <p><strong>Relance :</strong> après {delay} jours, via {channelLabels}, résumé {summaryLabel.toLowerCase()}</p>
          <p><strong>Objectif :</strong> {selectedGoal?.label}</p>
        </div>
        <div className="space-y-2 rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
          {["Ajoute ton premier contact", "Crée ton premier deal", "Planifie ta première relance"].map((item) => <div key={item} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />{item}</div>)}
        </div>
        <button type="button" onClick={() => router.push("/dashboard")} className="h-11 w-full rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800">Accéder à mon dashboard</button>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell progress={progress} title={getStepTitle(step)} subtitle="Configure les relances en moins de 2 minutes.">
      {step === 0 ? <ChoiceGrid items={activities} value={activity} onChange={setActivity} /> : null}
      {step === 1 ? <ChoiceGrid items={cycles} value={cycle} onChange={setCycle} /> : null}
      {step === 2 ? (
        <div className="space-y-6">
          <OptionGroup title="Délai avant relance">
            {delayOptions.map((option) => <Pill key={option} active={delay === option} onClick={() => setDelay(option)}>{option}j</Pill>)}
            <label className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700">
              <span>Autre</span>
              <input
                type="number"
                min={1}
                value={delay}
                onChange={(event) => {
                  const next = Math.floor(Number(event.target.value));
                  if (Number.isFinite(next) && next >= 1) setDelay(next);
                }}
                className="w-16 rounded-md border border-zinc-200 px-2 py-1 text-sm text-zinc-950 outline-none focus:border-zinc-900"
                aria-label="Délai personnalisé en jours"
              />
              <span>jours</span>
            </label>
          </OptionGroup>
          <OptionGroup title="Canal préféré">{channelOptions.map((option) => <Pill key={option.value} active={channels.includes(option.value)} onClick={() => toggleChannel(option.value)}>{option.label}</Pill>)}</OptionGroup>
          <OptionGroup title="Résumé">{summaryOptions.map((option) => <Pill key={option.value} active={summary === option.value} onClick={() => setSummary(option.value)}>{option.label}</Pill>)}</OptionGroup>
        </div>
      ) : null}
      {step === 3 ? <div className="grid gap-3">{goals.map((item) => <ChoiceCard key={item.value} item={item} active={goal === item.value} onClick={() => setGoal(item.value)} />)}</div> : null}
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0 || isSaving} className="h-11 flex-1 rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50">Retour</button>
        <button type="button" onClick={() => (step === 3 ? completeOnboarding() : setStep((current) => current + 1))} disabled={isSaving} className="h-11 flex-1 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400">{isSaving ? "Enregistrement..." : step === 3 ? "Terminer" : "Continuer"}</button>
      </div>
    </OnboardingShell>
  );
}

function OnboardingShell({ progress, title, subtitle, children }: { progress: number; title: string; subtitle: string; children: ReactNode }) {
  return <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8"><section className="mx-auto flex max-w-2xl flex-col gap-6"><div className="space-y-3"><div className="h-2 overflow-hidden rounded-full bg-zinc-200"><div className="h-full rounded-full bg-zinc-950 transition-all" style={{ width: progress + "%" }} /></div><p className="text-sm font-medium text-zinc-500">CRM Light</p></div><div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"><div className="mb-6 space-y-2"><h1 className="text-2xl font-semibold text-zinc-950 sm:text-3xl">{title}</h1><p className="text-sm leading-6 text-zinc-600">{subtitle}</p></div><div className="space-y-6">{children}</div></div></section></main>;
}

function ChoiceGrid<T extends string>({ items, value, onChange }: { items: Choice<T>[]; value: T; onChange: (value: T) => void }) {
  return <div className="grid gap-3 sm:grid-cols-2">{items.map((item) => <ChoiceCard key={item.value} item={item} active={value === item.value} onClick={() => onChange(item.value)} />)}</div>;
}

function ChoiceCard<T extends string>({ item, active, onClick }: { item: Choice<T>; active: boolean; onClick: () => void }) {
  const buttonClass = ["flex min-h-28 items-start gap-3 rounded-lg border p-4 text-left transition", active ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-950 hover:border-zinc-400"].join(" ");
  const iconClass = ["flex h-10 w-10 shrink-0 items-center justify-center rounded-md", active ? "bg-white/10" : "bg-zinc-100"].join(" ");
  const descClass = ["mt-1 block text-sm leading-5", active ? "text-zinc-200" : "text-zinc-500"].join(" ");
  return <button type="button" onClick={onClick} className={buttonClass}><span className={iconClass}><Icon name={item.icon} /></span><span><span className="block text-sm font-semibold">{item.label}</span><span className={descClass}>{item.description}</span></span></button>;
}

function OptionGroup({ title, children }: { title: string; children: ReactNode }) {
  return <div><p className="mb-3 text-sm font-semibold text-zinc-900">{title}</p><div className="flex flex-wrap gap-2">{children}</div></div>;
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  const className = ["rounded-full border px-4 py-2 text-sm font-medium transition", active ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"].join(" ");
  return <button type="button" onClick={onClick} className={className}>{children}</button>;
}

function getStepTitle(step: number) {
  if (step === 0) return "Quelle est ton activité ?";
  if (step === 1) return "Comment tu vends ?";
  if (step === 2) return "Tes préférences de relance";
  return "Ton premier objectif";
}
