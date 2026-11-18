/**
 * Welk team deze build volgt. Eén codebase, één build per team: kies met NEXT_PUBLIC_TEAM
 * (bijv. `NEXT_PUBLIC_TEAM=o10-2 npm run build`). Zonder keuze: o13-1.
 *
 * Dit bestand mag geen Node- of browser-API's gebruiken: het wordt zowel in de app als in de
 * scripts (scraper) geladen.
 */

export interface TeamConfig {
  /** Sleutel voor NEXT_PUBLIC_TEAM, ook gebruikt in bestandsnamen */
  key: string;
  /** Teamnaam precies zoals de clubsite die in programma, uitslagen en stand schrijft */
  name: string;
  /** Korte clubnaam voor zinnen als "RCD wint" */
  club: string;
  /** Volledige clubnaam, voor titels en alt-teksten */
  clubFull: string;
  /** Wat in het zwarte blok in de kopbalk staat */
  tag: string;
  /** Voor deelposts */
  hashtag: string;
  /** Teampagina op rksvrcd.nl (Sportlink-widgets): hier komt alle data vandaan */
  pageUrl: string;
  /** Privé data-repository (JSON-bestanden in map data/) */
  dataRepo: { owner: string; repo: string; dir: string };
}

const OWNER = "DaanBIM";
const CLUB = { club: "RCD", clubFull: "R.K.S.V. R.C.D." } as const;

export const TEAMS: Record<string, TeamConfig> = {
  "o13-1": {
    key: "o13-1",
    name: "RCD O13-1",
    ...CLUB,
    tag: "JO13-1",
    hashtag: "#RCDO131",
    pageUrl: "https://www.rksvrcd.nl/rcd-jo13-1-ve-zaterdag-speeldag-man",
    dataRepo: { owner: OWNER, repo: "rcd-o13-1-data", dir: "data" },
  },
  "o10-2": {
    key: "o10-2",
    name: "RCD O10-2",
    ...CLUB,
    tag: "JO10-2",
    hashtag: "#RCDO102",
    pageUrl: "https://www.rksvrcd.nl/rcd-jo10-2-ve-zaterdag-speeldag-man",
    dataRepo: { owner: OWNER, repo: "rcd-o10-2-data", dir: "data" },
  },
};

export const TEAM_KEY = process.env.NEXT_PUBLIC_TEAM ?? "o13-1";

export const TEAM: TeamConfig =
  TEAMS[TEAM_KEY] ??
  (() => {
    throw new Error(`Onbekend team "${TEAM_KEY}". Kies uit: ${Object.keys(TEAMS).join(", ")}`);
  })();

/** De app-repository (openbaar). Hierin staat de code, geen gegevens. */
export const APP_REPO = { owner: OWNER, repo: "rcd-tracker" };

/** Is dit de naam van ons team, of van "RCD" zonder nummer (oefenduels)? Andere RCD-teams horen er niet bij. */
export const isOurTeamName = (team: string) => {
  const t = team.trim().toLowerCase();
  return t === TEAM.name.toLowerCase() || t === TEAM.club.toLowerCase();
};
