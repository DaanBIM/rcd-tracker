import { BASE } from "./base";
import { TEAM } from "./club";

/**
 * Clublogo's. Het eigen wapen staat in de app (public/club-logo.png), ook voor de deelpost: een
 * canvas mag geen afbeeldingen van andere domeinen tekenen. Logo's van tegenstanders komen alleen
 * mee als de clubsite een vast adres geeft (logoapi.voetbal.nl); de signed-links van Sportlink
 * verlopen en slaan we niet op. Tegenstanders zonder logo krijgen gewoon geen logo.
 */

/** Logo-adres voor een team: elk RCD-team = het eigen wapen, anders het opgeslagen adres */
export function logoSrc(team: string, logos: Record<string, string>): string | null {
  if (team.toLowerCase().startsWith(TEAM.club.toLowerCase())) return `${BASE}/club-logo.png`;
  return logos[team] ?? null;
}

/** Alleen logo's die we in een canvas mogen tekenen (eigen domein) */
export function canvasLogoSrc(team: string, logos: Record<string, string>): string | null {
  const src = logoSrc(team, logos);
  return src && !src.startsWith("http") ? src : null;
}
