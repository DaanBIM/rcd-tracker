import { seedMatches, seedPlayers, seedStandings, type SeedData } from "@/lib/domain/seed";
import { EMPTY, matchId, type DataFiles } from "./schema";

/**
 * Beginstand van de data-repository, uit docs/seed/<team>.json (gemaakt door `npm run seed`).
 * `snapshotAt` is het peilmoment van de seed.
 */
export function initialData(seed: SeedData): DataFiles {
  const at = seed.peildatum ?? "2026-11-18T12:00:00+01:00";
  return {
    ...structuredClone(EMPTY),
    "standings.json": {
      snapshots: seed.stand.length ? [{ fetchedAt: at, source: "seed", rows: seedStandings(seed) }] : [],
    },
    "matches.json": {
      matches: seedMatches(seed).map((m) => {
        const { edited, ...rest } = m;
        void edited;
        return { ...rest, id: matchId(m), code: null };
      }),
    },
    "players.json": {
      players: seedPlayers(seed).map((p) => ({ ...p, clubName: null })),
    },
    "logos.json": { logos: {} },
    "sync.json": {
      lastRun: null,
      lastChange: at,
      message: `Beginstand uit de clubsite (${at.slice(0, 10)})`,
      unsure: [],
    },
  };
}
