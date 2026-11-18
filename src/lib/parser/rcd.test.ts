import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isOurTeamName } from "@/lib/club";
import { applyTeamPage } from "@/lib/sync/apply";
import { EMPTY } from "@/lib/store/schema";
import { guessMatchType } from "./matchType";
import { parseTeamPage } from "./teamPage";

/**
 * Pagina's van rksvrcd.nl van 18 nov 2026, met verwijderde scripts en anonieme namen.
 * O13-1: seniorenachtige pagina met twee poulestanden (fases). O10-2: pupillen, geen stand.
 */
const load = (f: string) => readFileSync(new URL(`./__fixtures__/${f}`, import.meta.url), "utf-8");
const today = new Date("2026-11-18T12:00:00+01:00");

describe("RCD O13-1 (twee fases in één widget)", () => {
  const page = parseTeamPage(load("rcd-o13-1-2026-11-18.html"), today);

  it("volgt de laatste fase met gegevens, niet de afgeronde 1e fase", () => {
    expect(page.poolName).toBe("Hoofdklasse (2e fase) 3");
    expect(page.standings).toHaveLength(8);
    expect(page.standings[0]).toMatchObject({ position: 1, team: "Unitas O13-1", played: 4, points: 9 });
    expect(page.standings.find((s) => s.team === "RCD O13-1")).toMatchObject({ played: 4, won: 1, drawn: 1, lost: 2 });
  });

  it("leest het programma met datum en tijd", () => {
    expect(page.program.map((m) => [m.date, m.time, m.homeTeam, m.awayTeam])).toEqual([
      ["2026-11-21", "10:00", "RCD O13-1", "Unitas O13-1"],
      ["2026-11-28", "10:45", "RCD O13-1", "VVGZ O13-1"],
      ["2026-12-05", "08:30", "Drechtstreek O13-1", "RCD O13-1"],
    ]);
  });

  it("leest de uitslagen, inclusief de verdwaalde wedstrijd van een ander RCD-team", () => {
    expect(page.results.map((m) => [m.homeTeam, m.awayTeam, m.homeGoals, m.awayGoals])).toContainEqual([
      "Madese Boys O13-1", "RCD O13-1", 2, 1,
    ]);
    expect(page.results.some((m) => m.homeTeam === "RCD Jo19-1")).toBe(true);
  });

  it("neemt een wedstrijd van een ander RCD-team niet op in de data", () => {
    const r = applyTeamPage(structuredClone(EMPTY), page, today);
    const teams = r.files["matches.json"].matches.flatMap((m) => [m.home, m.away]);
    expect(teams).not.toContain("RCD Jo19-1");
    expect(r.files["matches.json"].matches).toHaveLength(5);
  });

  it("telt alleen het eigen team (of 'RCD' zonder nummer) als eigen wedstrijd", () => {
    expect(isOurTeamName("RCD O13-1")).toBe(true);
    expect(isOurTeamName(" rcd ")).toBe(true);
    expect(isOurTeamName("RCD Jo19-1")).toBe(false);
    expect(isOurTeamName("RCD O13-2")).toBe(false);
  });

  it("geeft een verborgen-spelersaantal en staf", () => {
    expect(page.hiddenPlayerCount).toBe(6);
    expect(page.players.length).toBeGreaterThan(0);
    expect(page.staff.length).toBeGreaterThan(0);
  });
});

describe("RCD O10-2 (pupillen, geen stand)", () => {
  const page = parseTeamPage(load("rcd-o10-2-2026-11-18.html"), today);

  it("heeft programma maar geen stand en geen fout", () => {
    expect(page.standings).toEqual([]);
    expect(page.program).toHaveLength(4);
    expect(page.poolName).toBe("3e klasse (2e fase) 15");
  });

  it("telt wedstrijden zonder poulestand als competitie", () => {
    const m = { homeTeam: "ASWH O10-7", awayTeam: "RCD O10-2" };
    expect(guessMatchType(m, "RCD O10-2", [])).toBe("competitie");
    expect(guessMatchType(m, "RCD O10-2", ["Andere club"])).toBe("oefen");
  });
});
