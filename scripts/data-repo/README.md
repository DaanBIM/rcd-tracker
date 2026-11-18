# __REPO__ (privé)

Gegevens van de RCD-tracker voor __NAME__. De app staat in de openbare repository
[rcd-tracker](https://github.com/DaanBIM/rcd-tracker) en leest en schrijft deze bestanden via de
GitHub API met een sleutel die alleen op de server staat. **Deze repository moet privé blijven:** er staan
namen van kinderen in.

| Bestand | Inhoud | Wie schrijft |
| --- | --- | --- |
| `data/standings.json` | Elke opgehaalde stand (snapshot) | Ophaal-Action |
| `data/matches.json` | Alle wedstrijden met uitslagen | Ophaal-Action |
| `data/overrides.json` | Handmatige wijzigingen en eigen wedstrijden | App |
| `data/players.json` | Selectie, leenspelers, afgeschermde namen | App en Action (nieuwe spelers) |
| `data/entries.json` | Aanwezigheid en stats per wedstrijd | App |
| `data/feedback.json` | Meldingen van de feedbackknop | App |
| `data/sync.json` | Laatste ophaalrun | Ophaal-Action |

De Action **Ophalen clubsite** (`.github/workflows/sync.yml`) draait op zaterdag elk uur (10–23 uur)
en op zondag om 08/12/16/20 uur, en via de knop **Nu verversen** in de app.
