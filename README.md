# RCD-tracker

Web-app voor een jeugdteam van R.K.S.V. R.C.D. (Dordrecht): stand, programma, uitslagen, een winkans
voor de volgende wedstrijd en zelf ingevoerde spelersstatistieken (goals, assists, keeper, kaarten).
Zwart-groen, in het Nederlands, op de telefoon te zetten als app (PWA).

De app is afgeleid van de **Peursum 4 Tracker** (van een collega bij Slim Engineering). De functies en
rekenregels zijn hetzelfde (zie [docs/PLAN-peursum.md](docs/PLAN-peursum.md)); gewijzigd zijn het team, de
bron (rksvrcd.nl), de huisstijl en de omgang met jeugdteams.

## Teams

Eén codebase, één build en één site **per team**. Het team kies je met `NEXT_PUBLIC_TEAM`
(zie [src/lib/club.ts](src/lib/club.ts); nieuw team = één blok erbij).

| Sleutel | Team | Teampagina | Stand |
| --- | --- | --- | --- |
| `o13-1` (standaard) | RCD JO13-1 | [rksvrcd.nl](https://www.rksvrcd.nl/rcd-jo13-1-ve-zaterdag-speeldag-man) | ja, per fase |
| `o10-2` | RCD JO10-2 | [rksvrcd.nl](https://www.rksvrcd.nl/rcd-jo10-2-ve-zaterdag-speeldag-man) | **nee**: pupillen spelen zonder standen |

Zonder poulestand (JO10-2) toont de app wel programma, uitslagen, selectie en statistieken, maar geen
stand, kampioenskans, scenario's of winkans: daar is niets om op te baseren.

Een team kan alleen gevolgd worden als de clubsite er gegevens voor heeft. RCD 1, RCD 4 en RCD O23-1
stonden op 18 nov 2026 bijvoorbeeld leeg ("Geen informatie").

## Lokaal starten

```bash
npm install
npm run dev:o13-1     # http://localhost:3100
npm run dev:o10-2     # http://localhost:3101  (één dev-server tegelijk per map)
```

Lokaal werkt de app met de seed van het team in je browser (`.env.development`: `NEXT_PUBLIC_DATA=local`);
er gaat niets naar GitHub. Wijzigingen blijven in je eigen browser.

## Scripts

| Commando | Wat het doet |
| --- | --- |
| `npm run dev:o13-1` / `dev:o10-2` | Ontwikkelserver voor één team |
| `NEXT_PUBLIC_TEAM=o10-2 npm run build` | Productie-build (statische export in `out/`) voor één team |
| `npm test` | Tests (testdata is anoniem, zie hieronder) |
| `npm run lint` · `npm run typecheck` | Controles |
| `npm run seed` | Beginstand van het team opnieuw ophalen naar `docs/seed/<team>.json` |
| `npm run sync -- --data <map> [--force]` | Scraper draaien op een lokale kopie van de data |
| `npm run data:init -- <map>` | Inhoud van een nieuwe privé data-repository klaarzetten |
| `npm run icons` · `npm run art` | Iconen en groene vonk-textuur opnieuw maken |

## Hoe het werkt

| Onderdeel | Waar |
| --- | --- |
| App | Deze repository (**openbaar**, bevat geen gegevens van spelers) |
| Gegevens | Privé repository per team, bijv. `DaanBIM/rcd-o13-1-data` (map `data/`) |
| Clubsite ophalen | GitHub Action *Ophalen clubsite* in de data-repository: zaterdag elk uur 10–23, zondag 4×, plus "Nu verversen" |
| Inloggen en online zetten | Cloudflare Pages + Access (e-mailcode): [docs/CLOUDFLARE.md](docs/CLOUDFLARE.md) |

De bron is de teampagina op rksvrcd.nl (Sportlink-widgets). De parser staat in `src/lib/parser/`.
Wat anders is dan bij senioren:

- **Fases.** Jeugdteams hebben een poulestand per fase (1e fase, 2e fase). De parser volgt de laatste fase die gegevens heeft.
- **Verdwaalde wedstrijden.** De uitslagenlijst bevat soms een wedstrijd van een ander RCD-team (bijv. JO19-1).
  Alleen wedstrijden van het eigen team (of "RCD" zonder nummer) tellen mee (`isOurTeamName`).
- **Geen volledig poule-programma.** Er is geen bron voor wat andere teams onderling spelen; de Competitie-pagina
  toont dus alleen de wedstrijden van het eigen team. Uitslagen van andere teams worden uit de wekelijkse stand
  afgeleid waar dat eenduidig kan.
- **Geen logo's van tegenstanders.** De clubsite geeft verlopende signed-links; die slaan we niet op.

## Privacy: het gaat om kinderen

- Deze repository is openbaar en bevat **geen spelersnamen**. De seed (`docs/seed/`) heeft alleen stand, programma en uitslagen.
- Namen komen pas in de **privé** data-repository, via de ophaal-Action (van de clubsite) en via invoer in de app.
- De kijkversie voor gasten (`kijk-<team>.json` op de branch `kijk` van deze repository) is **openbaar**. Zet
  die uit of laat hem zonder namen als het team niet wil dat namen openbaar staan (`toPublic` in `src/lib/store/public.ts`).
- Testdata (`src/**/__fixtures__/`) is afkomstig van een ander team en volledig geanonimiseerd (voornaam + verzonnen achternaam).

## Repairen als de clubsite verandert

1. `npm run seed` haalt de echte pagina op en laat zien wat er gelezen wordt; een fout noemt de sectie
   (bijv. `[Poulestanden] kolom PT is geen getal`).
2. De parser zoekt secties op hun kop (`<h4 class="nxs-title">Programma</h4>`) en cellen op hun class (`td.Naam`).
3. Pas `src/lib/parser/teamPage.ts` aan en werk de tests bij (`npm test`).

## Open punten

- Online zetten: Cloudflare-project, Access-groep, GitHub-sleutel en de privé data-repository per team zijn nog niet aangemaakt.
- Teamnamen op de kaarten en deelposts gebruiken `JO13-1`/`JO10-2` in de kopbalk, maar de clubsite schrijft `O13-1`/`O10-2`.
