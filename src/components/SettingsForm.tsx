"use client";

import { FormEvent, useState } from "react";
import type {
  OnboardingActivity,
  OnboardingCycle,
  OnboardingGoal,
  OnboardingSummary,
} from "@/lib/database.types";
import { updateProfileSettings } from "@/lib/profiles";

const activityOptions: { value: OnboardingActivity; label: string }[] = [
  { value: "consultant", label: "Consultant" },
  { value: "coach", label: "Coach" },
  { value: "freelance", label: "Freelance" },
  { value: "artisan", label: "Artisan" },
  { value: "autre", label: "Autre" },
];

const cycleOptions: { value: OnboardingCycle; label: string }[] = [
  { value: "court", label: "Cycle court (1-2 semaines)" },
  { value: "long", label: "Cycle long (1-3 mois)" },
  { value: "devis", label: "Devis d'abord" },
  { value: "appel", label: "Appel découverte" },
];

const goalOptions: { value: OnboardingGoal; label: string }[] = [
  { value: "relance", label: "Ne rater aucune relance" },
  { value: "devis", label: "Suivre mes devis" },
  { value: "pipeline", label: "Voir mon pipeline" },
];

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

type SettingsFormProps = {
  userId: string;
  initialActivity: OnboardingActivity;
  initialCycle: OnboardingCycle;
  initialDelay: number;
  initialGoal: OnboardingGoal;
  initialChannels: string[];
  initialSummary: OnboardingSummary;
};

export function SettingsForm({
  userId,
  initialActivity,
  initialCycle,
  initialDelay,
  initialGoal,
  initialChannels,
  initialSummary,
}: SettingsFormProps) {
  const [activity, setActivity] = useState<OnboardingActivity>(initialActivity);
  const [cycle, setCycle] = useState<OnboardingCycle>(initialCycle);
  const [delay, setDelay] = useState<number>(initialDelay);
  const [goal, setGoal] = useState<OnboardingGoal>(initialGoal);
  const [channels, setChannels] = useState<string[]>(initialChannels);
  const [summary, setSummary] = useState<OnboardingSummary>(initialSummary);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function toggleChannel(value: string) {
    setChannels((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSaving(true);

    const result = await updateProfileSettings(userId, {
      activity,
      cycle,
      delay,
      goal,
      channels,
      summary,
    });

    setIsSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-5">
        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-800">Ton activité</span>
          <select
            value={activity}
            onChange={(event) => setActivity(event.target.value as OnboardingActivity)}
            className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-900"
          >
            {activityOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-800">Ta façon de vendre</span>
          <select
            value={cycle}
            onChange={(event) => setCycle(event.target.value as OnboardingCycle)}
            className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-900"
          >
            {cycleOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-800">Délai avant relance (jours)</span>
          <input
            type="number"
            min={1}
            value={delay}
            onChange={(event) => {
              const next = Math.floor(Number(event.target.value));
              if (Number.isFinite(next) && next >= 1) setDelay(next);
            }}
            className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-900"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-800">Ton objectif principal</span>
          <select
            value={goal}
            onChange={(event) => setGoal(event.target.value as OnboardingGoal)}
            className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-900"
          >
            {goalOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <div className="space-y-2">
          <span className="text-sm font-medium text-zinc-800">Canaux préférés</span>
          <div className="flex flex-wrap gap-2">
            {channelOptions.map((option) => {
              const active = channels.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleChannel(option.value)}
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-medium transition",
                    active
                      ? "border-zinc-950 bg-zinc-950 text-white"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-zinc-800">Résumé de relance</span>
          <select
            value={summary}
            onChange={(event) => setSummary(event.target.value as OnboardingSummary)}
            className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm text-zinc-950 outline-none focus:border-zinc-900"
          >
            {summaryOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {success ? (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Préférences enregistrées.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSaving}
        className="mt-6 h-11 w-full rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 sm:w-auto sm:px-8"
      >
        {isSaving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
