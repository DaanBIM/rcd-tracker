import type { Position } from "./types";

/** "Achternaam18, Voornaam18" → "Voornaam18 Achternaam18". Namen zonder komma blijven ongewijzigd. */
export function displayName(sourceName: string): string {
  const [last, first] = sourceName.split(",").map((s) => s.trim());
  return first ? `${first} ${last}` : sourceName.trim();
}

/** Functie van de clubsite → positie in de app. Lege of onbekende functie wordt "onbekend". */
export function toPosition(fn: string): Position {
  const f = fn.trim().toLowerCase();
  if (f.includes("keeper")) return "keeper";
  if (f.includes("verdedig")) return "verdediger";
  if (f.includes("middenveld")) return "middenvelder";
  if (f.includes("aanval")) return "aanvaller";
  return "onbekend";
}

/** Witruimte normaliseren: de site gebruikt soms dubbele spaties ("RCD  - Old Star"). */
export function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
