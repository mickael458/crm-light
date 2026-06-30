"use client";

import Papa from "papaparse";
import { useRef, useState } from "react";
import type { Contact, ContactStatus } from "@/lib/database.types";
import { addContactsBulk, type ContactFormInput } from "@/lib/contacts";

type ContactImportProps = {
  onImported: (contacts: Contact[]) => void;
};

type FieldKey = "name" | "company" | "email" | "phone" | "status";
type Mapping = Record<FieldKey, number>; // index de colonne, ou -1 = ignorer

const targets: { key: FieldKey; label: string; required?: boolean }[] = [
  { key: "name", label: "Nom", required: true },
  { key: "company", label: "Entreprise" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Téléphone" },
  { key: "status", label: "Statut" },
];

// Normalise un en-tete de colonne pour la detection (minuscules, sans accents).
function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

const fieldCandidates: Record<Exclude<FieldKey, "status">, string[]> = {
  name: ["nom", "name", "nom complet", "contact", "prenom nom", "nom prenom", "nom du prospect"],
  company: ["entreprise", "societe", "company", "organisation", "boite", "client"],
  email: ["email", "e-mail", "mail", "courriel", "adresse email", "boite mail"],
  phone: ["telephone", "tel", "phone", "mobile", "portable", "numero", "coordonnees"],
};

const statusCandidates = ["statut", "status", "temperature", "chaleur"];

function detectMapping(rows: string[][], hasHeader: boolean): Mapping {
  const columnCount = rows[0]?.length ?? 0;
  const mapping: Mapping = {
    name: columnCount > 0 ? 0 : -1,
    company: -1,
    email: -1,
    phone: -1,
    status: -1,
  };

  if (!hasHeader) {
    return mapping;
  }

  const labels = (rows[0] ?? []).map(normalize);
  const find = (candidates: string[]) => labels.findIndex((label) => candidates.includes(label));

  const nameIdx = find(fieldCandidates.name);
  if (nameIdx >= 0) mapping.name = nameIdx;
  const companyIdx = find(fieldCandidates.company);
  if (companyIdx >= 0) mapping.company = companyIdx;
  const emailIdx = find(fieldCandidates.email);
  if (emailIdx >= 0) mapping.email = emailIdx;
  const phoneIdx = find(fieldCandidates.phone);
  if (phoneIdx >= 0) mapping.phone = phoneIdx;
  const statusIdx = find(statusCandidates);
  if (statusIdx >= 0) mapping.status = statusIdx;

  return mapping;
}

function parseStatus(value: string | undefined): ContactStatus {
  const normalized = normalize(value ?? "");
  if (normalized === "chaud") return "chaud";
  if (normalized === "tiede") return "tiede";
  return "froid";
}

function cell(row: string[], index: number) {
  return index >= 0 ? (row[index] ?? "").trim() : "";
}

function rowToContact(row: string[], mapping: Mapping): ContactFormInput {
  return {
    name: cell(row, mapping.name),
    company: cell(row, mapping.company),
    email: cell(row, mapping.email),
    phone: cell(row, mapping.phone),
    status: parseStatus(mapping.status >= 0 ? row[mapping.status] : undefined),
  };
}

// Excel FR exporte souvent en Windows-1252 : decode en UTF-8 par defaut donnerait du
// mojibake sur les accents. On sniffe le BOM, on tente UTF-8 strict, et on retombe sur
// Windows-1252 en cas d'echec (sans casser les vrais fichiers UTF-8).
async function readCsvText(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder("utf-8").decode(bytes.subarray(3));
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

export function ContactImport({ onImported }: ContactImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [hasHeader, setHasHeader] = useState(true);
  const [mapping, setMapping] = useState<Mapping>({ name: 0, company: -1, email: -1, phone: -1, status: -1 });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  function reset() {
    setRawRows([]);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError(null);
    setSuccess(null);
    setRawRows([]);

    if (!file) {
      return;
    }

    readCsvText(file)
      .then((text) => {
        Papa.parse<string[]>(text, {
          skipEmptyLines: true,
          complete: (results) => {
            const data = (results.data as string[][]).filter(
              (row) => row.length > 0 && row.some((value) => (value ?? "").trim() !== ""),
            );

            if (data.length === 0) {
              setError("Fichier vide ou illisible. Utilise un fichier .csv.");
              return;
            }

            setRawRows(data);
            setHasHeader(true);
            setMapping(detectMapping(data, true));
          },
          error: () => {
            setError("Impossible de lire le fichier. Utilise un fichier .csv (Excel : Enregistrer sous → CSV).");
          },
        });
      })
      .catch(() => {
        setError("Impossible de lire le fichier. Utilise un fichier .csv (Excel : Enregistrer sous → CSV).");
      });
  }

  function changeHasHeader(next: boolean) {
    setHasHeader(next);
    setMapping(detectMapping(rawRows, next));
  }

  function changeMapping(key: FieldKey, index: number) {
    setMapping((current) => ({ ...current, [key]: index }));
  }

  const columnCount = rawRows[0]?.length ?? 0;
  const headerLabels = rawRows[0] ?? [];
  const dataRows = hasHeader ? rawRows.slice(1) : rawRows;
  const sampleRow = dataRows[0] ?? [];

  function columnLabel(index: number) {
    const base = hasHeader && (headerLabels[index] ?? "").trim() ? headerLabels[index] : `Colonne ${index + 1}`;
    const sample = (sampleRow[index] ?? "").trim();
    return sample ? `${base} — ex : ${sample.slice(0, 22)}` : base;
  }

  const previewRows = dataRows.slice(0, 5).map((row) => rowToContact(row, mapping));
  const importableCount = dataRows.filter((row) => cell(row, mapping.name).length > 0).length;
  const canImport = mapping.name >= 0 && importableCount > 0;
  const hasFile = rawRows.length > 0;

  async function handleImport() {
    setError(null);
    setSuccess(null);

    const parsed = dataRows
      .map((row) => rowToContact(row, mapping))
      .filter((row) => row.name.length > 0);

    if (parsed.length === 0) {
      setError("Aucune ligne avec un nom à importer. Vérifie la colonne « Nom ».");
      return;
    }

    // Dedoublonnage du lot : par email si present, sinon par nom + entreprise.
    const seen = new Set<string>();
    const rows = parsed.filter((row) => {
      const key = row.email.trim()
        ? `e:${row.email.trim().toLowerCase()}`
        : `n:${row.name.toLowerCase()}|${row.company.trim().toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
    const duplicates = parsed.length - rows.length;

    setIsImporting(true);
    const result = await addContactsBulk(rows);
    setIsImporting(false);

    if (result.error || !result.contacts) {
      setError(result.error ?? "Impossible d'importer les contacts.");
      return;
    }

    onImported(result.contacts);
    const count = result.contacts.length;
    setSuccess(
      `${count} contact${count > 1 ? "s" : ""} importé${count > 1 ? "s" : ""}` +
        (duplicates > 0
          ? ` (${duplicates} doublon${duplicates > 1 ? "s" : ""} ignoré${duplicates > 1 ? "s" : ""})`
          : "") +
        ".",
    );
    reset();
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-950">Importer depuis Excel</h2>
      <p className="mt-1 text-sm leading-6 text-zinc-600">
        Récupère tes prospects existants. Depuis Excel :
        <span className="font-medium text-zinc-800"> Fichier → Enregistrer sous → CSV</span>.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFile}
        className="mt-4 block w-full text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800"
      />

      {error ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {success ? (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>
      ) : null}

      {hasFile ? (
        <div className="mt-5 space-y-5">
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(event) => changeHasHeader(event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300"
            />
            La première ligne contient les titres de colonnes
          </label>

          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-900">
              Vérifie la correspondance des colonnes
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {targets.map((target) => (
                <label key={target.key} className="space-y-1.5">
                  <span className="text-sm font-medium text-zinc-800">
                    {target.label}
                    {target.required ? <span className="text-red-600"> *</span> : null}
                  </span>
                  <select
                    value={mapping[target.key]}
                    onChange={(event) => changeMapping(target.key, Number(event.target.value))}
                    className="h-10 w-full rounded-md border border-zinc-300 px-2 text-sm text-zinc-950 outline-none focus:border-zinc-900"
                  >
                    <option value={-1}>— Ignorer —</option>
                    {Array.from({ length: columnCount }, (_, index) => (
                      <option key={index} value={index}>
                        {columnLabel(index)}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            {mapping.name < 0 ? (
              <p className="mt-2 text-xs text-red-600">
                Choisis quelle colonne contient le nom — c&apos;est obligatoire.
              </p>
            ) : null}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-900">
              Aperçu ({importableCount} contact{importableCount > 1 ? "s" : ""} seront importés)
            </p>
            <div className="overflow-x-auto rounded-md border border-zinc-200">
              <table className="min-w-full divide-y divide-zinc-200 text-xs">
                <thead className="bg-zinc-50 text-left font-semibold uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-3 py-2">Nom</th>
                    <th className="px-3 py-2">Entreprise</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Téléphone</th>
                    <th className="px-3 py-2">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {previewRows.map((row, index) => (
                    <tr key={index} className={row.name ? "text-zinc-700" : "text-zinc-400"}>
                      <td className="px-3 py-2 font-medium">{row.name || "(ligne ignorée)"}</td>
                      <td className="px-3 py-2">{row.company || "-"}</td>
                      <td className="px-3 py-2">{row.email || "-"}</td>
                      <td className="px-3 py-2">{row.phone || "-"}</td>
                      <td className="px-3 py-2">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {dataRows.length > previewRows.length ? (
              <p className="mt-2 text-xs text-zinc-500">
                Aperçu des 5 premières lignes sur {dataRows.length}.
              </p>
            ) : null}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleImport}
              disabled={isImporting || !canImport}
              className="h-11 flex-1 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {isImporting ? "Import en cours..." : `Importer ${importableCount} contact${importableCount > 1 ? "s" : ""}`}
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
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-zinc-500">
          Après le chargement, tu pourras vérifier quelle colonne va où avant de valider — aucun import à l&apos;aveugle.
        </p>
      )}
    </div>
  );
}
