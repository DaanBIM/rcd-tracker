import * as cheerio from "cheerio";
import type { Cheerio, CheerioAPI } from "cheerio";
import type { AnyNode } from "domhandler";
import { parseDutchDate } from "./dates";
import { clean, displayName, toPosition } from "./names";
import type {
  ScrapedMatch,
  ScrapedNextMatch,
  ScrapedPlayer,
  ScrapedStaff,
  ScrapedStanding,
  TeamPage,
} from "./types";

/**
 * Parser voor de teampagina op rksvrcd.nl (Sportlink-clubsite, widgets van Nexus).
 *
 * Elke sectie op de pagina is een widget met een kop (<h4 class="nxs-title">) en
 * meestal een tabel. De parser zoekt een sectie op de tekst van die kop, niet op
 * id's (die veranderen per pagina). Breekt er iets na een wijziging van de site,
 * kijk dan eerst of de koppen of de class-namen van de cellen zijn veranderd.
 */

export class ParseError extends Error {
  constructor(section: string, message: string) {
    super(`[${section}] ${message}`);
    this.name = "ParseError";
  }
}

/** De widget waarvan de kop begint met `title`. */
function section($: CheerioAPI, title: string): Cheerio<AnyNode> | null {
  const heading = $("h4.nxs-title")
    .filter((_, el) => clean($(el).text()).startsWith(title))
    .first();
  if (!heading.length) return null;
  return heading.closest(".nxs-widget");
}

function rows($: CheerioAPI, title: string): Cheerio<AnyNode>[] {
  const widget = section($, title);
  if (!widget) throw new ParseError(title, `sectie "${title}" niet gevonden`);
  return widget
    .find("table tbody tr")
    .toArray()
    .map((tr) => $(tr));
}

const cell = (row: Cheerio<AnyNode>, cls: string) =>
  clean(row.find(`td.${cls}`).first().text());

const num = (row: Cheerio<AnyNode>, cls: string, sectionName: string) => {
  const raw = cell(row, cls);
  const n = Number(raw);
  if (raw === "" || Number.isNaN(n)) {
    throw new ParseError(sectionName, `kolom ${cls} is geen getal: "${raw}"`);
  }
  return n;
};

function parsePeople($: CheerioAPI, title: string) {
  return rows($, title).map((row) => ({
    name: cell(row, "Naam"),
    role: cell(row, "Rol"),
    function: cell(row, "Functie"),
  }));
}

export function parsePlayers($: CheerioAPI): {
  players: ScrapedPlayer[];
  hiddenPlayerCount: number;
} {
  const players = parsePeople($, "Team indeling")
    .filter((p) => p.name && p.role === "Teamspeler")
    .map((p) => ({
      sourceName: p.name,
      name: displayName(p.name),
      position: toPosition(p.function),
    }));

  const message = clean(section($, "Team indeling")?.find(".message-filtered-members").text() ?? "");
  const hidden = message.match(/Er (?:zijn|is) (\d+) teamle/);

  return { players, hiddenPlayerCount: hidden ? Number(hidden[1]) : 0 };
}

export function parseStaff($: CheerioAPI): ScrapedStaff[] {
  if (!section($, "Staf")) return [];
  return parsePeople($, "Staf").map((p) => ({
    ...p,
    name: displayName(p.name),
  }));
}

function parseMatchRow(
  row: Cheerio<AnyNode>,
  sectionName: string,
  today: Date,
): ScrapedMatch {
  const tds = row.find("td");
  const dateText = clean(tds.first().text());
  const { date, time } = parseDutchDate(dateText, today);

  const fixture = cell(row, "Wedstrijd");
  const parts = fixture.split(" - ");
  if (parts.length !== 2) {
    throw new ParseError(sectionName, `wedstrijd niet te splitsen: "${fixture}"`);
  }

  const logos = row.find("img.nxs-clublogo").toArray();
  const logo = (i: number) => (logos[i] ? (logos[i].attribs.src ?? null) : null);

  const href = row.find("a[href*='wedstrijdcode=']").attr("href") ?? "";
  const code = href.match(/wedstrijdcode=(\d+)/)?.[1] ?? null;

  const score = cell(row, "Uitslag").match(/^(\d+)\s*-\s*(\d+)$/);

  return {
    matchCode: code,
    date,
    time,
    homeTeam: parts[0].trim(),
    awayTeam: parts[1].trim(),
    homeLogoUrl: logo(0),
    awayLogoUrl: logo(1),
    homeGoals: score ? Number(score[1]) : null,
    awayGoals: score ? Number(score[2]) : null,
  };
}

export function parseProgram($: CheerioAPI, today: Date): ScrapedMatch[] {
  return rows($, "Programma").map((r) => parseMatchRow(r, "Programma", today));
}

export function parseResults($: CheerioAPI, today: Date): ScrapedMatch[] {
  return rows($, "Uitslagen").map((r) => parseMatchRow(r, "Uitslagen", today));
}

/**
 * Alle poulestanden op de pagina, in paginavolgorde. Jeugdteams hebben er een per fase, en die
 * staan in één widget: elke tabel hoort bij de kop (<h4>) die er in documentvolgorde vóór staat.
 */
function standingTables($: CheerioAPI): { heading: string; rows: Cheerio<AnyNode>[] }[] {
  const out: { heading: string; rows: Cheerio<AnyNode>[] }[] = [];
  let current: { heading: string; rows: Cheerio<AnyNode>[] } | null = null;
  $("h4.nxs-title, table").each((_, el) => {
    const node = $(el);
    if (el.tagName === "h4") {
      const text = clean(node.text());
      current = text.startsWith("Poulestanden") ? { heading: text, rows: [] } : null;
      if (current) out.push(current);
    } else if (current) {
      current.rows.push(...node.find("tbody tr").toArray().map((tr) => $(tr)));
    }
  });
  return out;
}

export function parseStandings($: CheerioAPI): {
  poolName: string | null;
  standings: ScrapedStanding[];
} {
  const title = "Poulestanden";
  const all = standingTables($);
  if (!all.length) throw new ParseError(title, `sectie "${title}" niet gevonden`);

  // Seniorenteams hebben één stand, jeugdteams een per fase (1e fase, 2e fase). We volgen de
  // laatste fase die gegevens heeft; een fase zonder tabel ("Geen informatie") telt niet mee.
  const latest = [...all].reverse().find((t) => t.rows.length > 0) ?? all[all.length - 1];

  // "Poulestanden RCD O13-1 ( Hoofdklasse (2e fase) 3 )": de poule staat tussen het eerste ( en het laatste )
  const poolName = latest.heading.match(/\(\s*(.+)\s*\)/)?.[1]?.trim() ?? null;

  const standings = latest.rows.map((row) => ({
    position: num(row, "Positie", title),
    team: cell(row, "Team"),
    logoUrl: row.find("img.nxs-clublogo").attr("src") ?? null,
    played: num(row, "GS", title),
    won: num(row, "GW", title),
    drawn: num(row, "GL", title),
    lost: num(row, "VL", title),
    goalsFor: num(row, "V", title),
    goalsAgainst: num(row, "T", title),
    goalDifference: num(row, "Doelsaldo", title),
    points: num(row, "PT", title),
  }));

  return { poolName, standings };
}

export function parseNextMatch($: CheerioAPI): ScrapedNextMatch | null {
  const box = $(".club-stats-countdown").first();
  if (!box.length) return null;

  // data-date='03-10-2026' data-time='15:00:00'
  const d = (box.attr("data-date") ?? "").match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!d) return null;
  const time = (box.attr("data-time") ?? "").slice(0, 5);

  const venue = box
    .find(".address span")
    .toArray()
    .map((s) => clean($(s).text()))
    .filter(Boolean)
    .join(" ");

  return {
    label: clean(box.find(".subheader").text()),
    date: `${d[3]}-${d[2]}-${d[1]}`,
    time,
    homeTeam: clean(box.find(".row-match .home .team").text()),
    awayTeam: clean(box.find(".row-match .away .team").text()),
    venue,
  };
}

/** Leest de hele teampagina. `today` bepaalt het seizoen voor datums zonder jaartal. */
export function parseTeamPage(html: string, today: Date = new Date()): TeamPage {
  const $ = cheerio.load(html);
  const { players, hiddenPlayerCount } = parsePlayers($);
  const { poolName, standings } = parseStandings($);

  return {
    players,
    hiddenPlayerCount,
    staff: parseStaff($),
    program: parseProgram($, today),
    results: parseResults($, today),
    poolName,
    standings,
    nextMatch: parseNextMatch($),
  };
}
