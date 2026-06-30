"use client";

import Papa from "papaparse";
import { useRef, useState } from "react";
import type { Contact, ContactStatus } from "@/lib/database.types";
import { addContactsBulk, type ContactFormInput } from "@/lib/contacts";

type ContactImportProps = {
  onImported: (contacts: Contact[]) => void;
};

// Normalise un en-tete de colonne pour la detection (minuscules, sans accents).
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

const fieldCandidates: Record<keyof Omit<ContactFormInput, "status">, string[]> = {
  name: ["nom", "name", "nom complet", "contact", "prenom nom", "nom prenom"],
  company: ["entreprise", "societe", "company", "organisation", "boite", "client"],
  email: ["email", "e-mail", "mail", "courriel", "adresse email"],
  phone: ["telephone", "tel", "phone", "mobile", "portable", "numero"],
};

const statusCandidates = ["statut", "status", "temperature", "chaleur"];

function matchField(fields: string[], candidates: string[]) {
  return fields.find((field) => candidates.includes(normalize(field)));
}

function parseStatus(value: string | undefined): ContactStatus {
  const normalized = normalize(value ?? "");
  if (normalized === "chaud") return "chaud";
  if (normalized === "tiede") return "tiede";
  return "froid";
}

export function ContactImport({ onImported }: ContactImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ContactFormInput[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  function reset() {
    setRows([]);
    setFileName(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError(null);
    setSuccess(null);
    setRows([]);

    if (!file) {
      return;
    }

    setFileName(file.name);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const fields = results.meta.fields ?? [];

        if (fields.length === 0) {
          setError("Fichier vide ou illisible. Vérifie que la 1re ligne contient les titres de colonnes.");
          return;
        }

        const nameField = matchField(fields, fieldCandidates.name) ?? fields[0];
        const companyField = matchField(fields, fieldCandidates.company);
        const emailField = matchField(fields, fieldCandidates.email);
        const phoneField = matchField(fields, fieldCandidates.phone);
        const statusField = matchField(fields, statusCandidates);

        const parsed = results.data
          .map((row) => ({
            name: (row[nameField] ?? "").trim(),
            company: companyField ? (row[companyField] ?? "").trim() : "",
            email: emailField ? (row[emailField] ?? "").trim() : "",
            phone: phoneField ? (row[phoneField] ?? "").trim() : "",
            status: parseStatus(statusField ? row[statusField] : undefined),
          }))
          .filter((row) => row.name.length > 0);

        if (parsed.length === 0) {
          setError("Aucune ligne avec un nom n'a été trouvée dans le fichier.");
          return;
        }

        setRows(parsed);
      },
      error: () => {
        setError("Impossible de lire le fichier. Utilise un fichier .csv.");
      },
    });
  }

  async function handleImport() {
    setError(null);
    setSuccess(null);
    setIsImporting(true);

    const result = await addContactsBulk(rows);

    setIsImporting(false);

    if (result.error || !result.contacts) {
      setError(result.error ?? "Impossible d'importer les contacts.");
      return;
    }

    onImported(result.contacts);
    setSuccess(`${result.contacts.length} contact${result.contacts.length > 1 ? "s" : ""} importé${result.contacts.length > 1 ? "s" : ""}.`);
    reset();
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">Importer depuis Excel</h2>
      <p className="mt-1 text-sm leading-6 text-zinc-600">
        Récupère tes prospects existants en quelques secondes. Depuis Excel :
        <span className="font-medium text-zinc-800"> Fichier → Enregistrer sous → CSV</span>.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFile}
        className="mt-4 block w-full text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800"
      />

      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Colonnes reconnues automatiquement : <span className="font-medium">nom, entreprise, email, téléphone, statut</span>.
        La 1re ligne doit contenir les titres.
      </p>

      {fileName && rows.length > 0 ? (
        <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
          <p>
            <span className="font-medium text-zinc-950">{rows.length}</span> contact
            {rows.length > 1 ? "s" : ""} prêt{rows.length > 1 ? "s" : ""} à importer depuis{" "}
            <span className="font-medium">{fileName}</span>.
          </p>
          <p className="mt-1 truncate text-xs text-zinc-500">
            Aperçu : {rows.slice(0, 3).map((row) => row.name).join(", ")}
            {rows.length > 3 ? "…" : ""}
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {success ? (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>
      ) : null}

      {rows.length > 0 ? (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleImport}
            disabled={isImporting}
            className="h-11 flex-1 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {isImporting ? "Import en cours..." : `Importer ${rows.length} contact${rows.length > 1 ? "s" : ""}`}
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              setError(null);
              setSuccess(null);
            }}
            disabled={isImporting}
            className="h-11 rounded-md border border-zinc-300 px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      ) : null}
    </div>
  );
}
