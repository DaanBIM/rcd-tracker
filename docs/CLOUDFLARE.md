# Cloudflare: online zetten per team

> Er is één site **per team** (JO13-1 en JO10-2 krijgen elk een eigen Cloudflare Pages-project, data-repository en Access-groep).
> Zet in Pages bij *Variables* ook `NEXT_PUBLIC_TEAM` (`o13-1` of `o10-2`) en `DATA_REPO` (`DaanBIM/rcd-o13-1-data`). Ouders en kinderen komen in de Access-groep van hun eigen team.

Doel: de app achter een login, beide GitHub-repositories privé, en de GitHub-sleutel alleen op de server.

```
Bezoeker ──► Cloudflare Pages (de app)
               ├─ /open/teaser, /open/aanvraag   openbaar: uitnodiging en toegang aanvragen
               └─ /api/*                          achter Cloudflare Access (inloggen met e-mailcode)
                     └─► GitHub API ──► rcd-<team>-data (privé)
```

- **Leden** (ingelogd) zien alles, ook afgeschermde namen en blessures, maar geen feedback en geen inschattingen.
- **Beheerder** (adres in `OWNER_EMAILS`) mag ook bewerken, verversen en aanvragen goedkeuren.
- **Zonder login** zie je alleen de uitnodiging: stand, vorm, laatste en volgende wedstrijd, zonder namen.

De oude site op GitHub Pages blijft werken tot stap 7.

## 1. Cloudflare Pages

1. Maak een gratis account op cloudflare.com.
2. Ga naar **Workers & Pages → Create → Pages → Connect to Git** en kies `rcd-tracker`.
3. Vul de build-instellingen in:
   - Build command: `npm run build`
   - Output directory: `out`
   - Environment variable: `NODE_VERSION` = `24`
4. Het adres wordt bijvoorbeeld `rcd-<team>.pages.dev`. Een eigen domein kan later.

## 2. GitHub-sleutel voor de server

GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate:

- **Repository access:** alleen `rcd-<team>-data`.
- **Permissions:**
  - Contents: Read and write
  - Actions: Read and write (voor "Nu verversen")
- **Expiration:** bijvoorbeeld 1 jaar.

Zet de sleutel in Cloudflare: Pages-project → Settings → **Variables and Secrets** → *Production* → Secret `GITHUB_TOKEN`.
Vul alles alleen bij **Production** in. Voorbeeldversies hebben dan geen toegang tot de data.

## 3. Inloggen (Cloudflare Zero Trust → Access)

1. Open **Zero Trust**, kies een teamnaam (bijv. `rcd-<team>`) en het gratis abonnement (tot 50 personen).
   Je teamdomein wordt `rcd-<team>.cloudflareaccess.com`.
2. Ga naar **Settings → Authentication**. *One-time PIN* staat standaard aan: inloggen met een code per e-mail.
3. Ga naar **Access → Groups → Add a group** `RCD <team> ouders`. Kies bij Include *Emails* en zet daar je eigen adres plus de teamgenoten in.
4. Ga naar **Access → Applications → Add → Self-hosted**:
   - Domain: `rcd-<team>.pages.dev`, met als path `api`.
   - Policy: *Allow*, Include → Group `RCD <team> ouders`.
   - Kopieer na het opslaan de **Application Audience (AUD) Tag**.

## 4. Instellingen van de site

Vul dit in bij Pages → Settings → Variables and Secrets → *Production*:

| Naam | Waarde |
|---|---|
| `ACCESS_TEAM_DOMAIN` | `rcd-<team>.cloudflareaccess.com` |
| `ACCESS_AUD` | de AUD-tag uit stap 3 |
| `OWNER_EMAILS` | jouw e-mailadres (meerdere met komma's) |

Zet daarna een nieuwe versie live: Deployments → *Retry deployment*.

**Optioneel: goedkeuren in de app zet iemand direct in de groep.**
Maak bij My Profile → API Tokens een token met *Access: Organizations, Identity Providers, and Groups → Edit*.
Vul daarna in:
- `CF_API_TOKEN` (secret)
- `CF_ACCOUNT_ID`
- `ACCESS_GROUP_ID` (staat in de adresbalk bij de groep)

## 5. Testen

1. Open de site in een privévenster. Je ziet de uitnodiging.
2. Tik op **Inloggen**, vul je e-mailadres in en daarna de code. Je ziet de hele app, met Bewerken.
3. Log in met een ander adres uit de groep. Je ziet alles, maar zonder bewerkknoppen.
4. Vraag toegang aan met een derde adres. De aanvraag staat bovenaan op Spelers.

## 6. Ophaal-Action laten werken met een privé app

Maak nog een fine-grained token met alleen `rcd-tracker` → Contents: Read.
Zet die in `rcd-<team>-data` → Settings → Secrets and variables → Actions als `APP_READ_TOKEN`.

## 7. Afronden

1. Zet beide repositories op **Private** (Settings → Danger Zone).
2. Zet GitHub Pages uit in `rcd-tracker` (Settings → Pages).
3. Trek de oude sleutel in die in de app stond (Developer settings → Tokens).
4. Laat het weten. Dan haal ik de oude login, de kluis (`public/toegang.json`) en de branch `kijk` weg.
5. Iedereen zet de nieuwe site op zijn beginscherm.
