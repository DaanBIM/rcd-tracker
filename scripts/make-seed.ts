// Maakt docs/seed/<team>.json: de beginstand van een team, rechtstreeks van de clubsite.
//   npm run seed                      (o13-1)
//   NEXT_PUBLIC_TEAM=o10-2 npm run seed
// De seed bevat bewust GEEN spelersnamen: het is een openbaar bestand en het gaat om
// kinderen. Spelers komen via de ophaal-Action in de privé data-repository terecht.
import { mkdirSync, writeFileSync } from "node:fs";
import { isOurTeamName, TEAM } from "../src/lib/club";
import type { SeedData } from "../src/lib/domain/seed";
import { parseTeamPage } from "../src/lib/parser";

async function main() {
  const res = await fetch(TEAM.pageUrl, { headers: { "User-Agent": "RCDTracker (persoonlijk gebruik)" } });
  if (!res.ok) throw new Error(`Teampagina gaf ${res.status}`);
  const now = new Date();
  const page = parseTeamPage(await res.text(), now);

  const ours = [...page.program, ...page.results].filter((m) => isOurTeamName(m.homeTeam) || isOurTeamName(m.awayTeam));
  const seen = new Set<string>();
  const wedstrijden: SeedData["wedstrijden"] = ours
    .filter((m) => {
      const k = m.matchCode ?? `${m.date}|${m.homeTeam}|${m.awayTeam}`;
      return seen.has(k) ? false : (seen.add(k), true);
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({
      ronde: null,
      inhaal: false,
      datum: m.date,
      tijd: m.time,
      thuis: m.homeTeam,
      uit: m.awayTeam,
      uitslag_thuis: m.homeGoals,
      uitslag_uit: m.awayGoals,
      sportpark: null,
      ons: true,
      status: m.homeGoals !== null ? "gespeeld" : "gepland",
    }));

  const seed: SeedData = {
    bron: `${TEAM.pageUrl} (stand, programma, uitslagen), peildatum ${now.toISOString().slice(0, 10)}`,
    peildatum: now.toISOString(),
    team: { naam: TEAM.name, teampagina: TEAM.pageUrl },
    stand: page.standings.map((s) => ({
      positie: s.position,
      team: s.team,
      gespeeld: s.played,
      winst: s.won,
      gelijk: s.drawn,
      verlies: s.lost,
      punten: s.points,
      voor: s.goalsFor,
      tegen: s.goalsAgainst,
    })),
    wedstrijden,
    spelers: [],
    sportparken: {},
  };

  mkdirSync(`${__dirname}/../docs/seed`, { recursive: true });
  writeFileSync(`${__dirname}/../docs/seed/${TEAM.key}.json`, JSON.stringify(seed, null, 2) + "\n");
  console.log(`${TEAM.name}: ${seed.stand.length} teams in de stand (${page.poolName ?? "geen poule"}), ${wedstrijden.length} wedstrijden`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
