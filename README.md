# Christen&

Wegwijs in het christelijk leven. Statische website gebouwd met [Eleventy](https://www.11ty.dev/), gepubliceerd via GitHub Pages.

## Live zetten (eenmalig)

1. Zet alle bestanden in de root van de repo `hoowgii/Christen` en push naar `main`.
2. Ga in GitHub naar **Settings → Pages** en kies bij *Source* voor **GitHub Actions**.
3. De workflow *Publiceren* bouwt en publiceert de site bij elke push. Eerste adres: `https://hoowgii.github.io/Christen/`.

## Eigen domein (christen-en.nl)

1. **Settings → Pages → Custom domain**: vul `christen-en.nl` in.
2. Stel bij Hostnet de DNS in volgens de GitHub-documentatie over custom domains (A-records voor het hoofddomein, CNAME voor `www`).
3. Zet *Enforce HTTPS* aan zodra het certificaat klaar is.

De links passen zich automatisch aan: op github.io staat alles onder `/Christen/`, op christen-en.nl in de root.

## Talen (NL/EN)

Nederlands staat in de root, Engels onder `/en/`. Elke pagina heeft een taalwissel naar zijn vertaalde tegenhanger.

- Interfaceteksten: `src/_data/i18n.yaml`
- Rubrieken: velden met `_en` in `rubrieken.yaml` (naam_en, kort_en, intro_en, slug_en)
- Bronnen: `omschrijving_en` en optioneel `titel_en` in `items.yaml`
- Onderwerpen: vertalingen in `src/_data/tags.yaml`
- Losse tekstpagina's: Engelse versies staan in `src/en/`

Ontbreekt een Engelse tekst, dan valt de site terug op het Nederlands.

## SEO en AI

Automatisch gegenereerd bij elke build:

- `sitemap.xml` met alle pagina's en hun taalvarianten (hreflang)
- `robots.txt` (alles toegestaan, met verwijzing naar de sitemap)
- `llms.txt`: samenvatting van de site en alle bronnen in platte tekst voor AI-assistenten
- Per pagina: title, description, canonical, hreflang, Open Graph (incl. `og.png`), Twitter card
- Structured data (JSON-LD): WebSite op de startpagina's, BreadcrumbList op alle onderliggende pagina's
- Zoekpagina's en 404 staan op `noindex`

`robots.txt`, `sitemap.xml` en `llms.txt` werken pas echt zodra de site op christen-en.nl draait: crawlers zoeken ze in de root van het domein. Meld daarna de sitemap aan in Google Search Console en Bing Webmaster Tools.

## Licentie

De broncode valt onder de MIT-licentie (`LICENSE`). Teksten, bronselectie en vormgeving vallen daar niet onder; zie de disclaimer op de site.

## Inhoud beheren

Elke rubriek heeft één eigen bestand in `src/inhoud/`, met de teksten (NL en EN), de subrubrieken en alle bronnen van die rubriek:

```
src/inhoud/woord.yaml      & Woord
src/inhoud/lezen.yaml      & Lezen
...
src/inhoud/winkel.yaml     & Winkel
```

Wil je alleen & Woord aanpassen, dan open je alleen `woord.yaml`. De volgorde in menu en startpagina bepaal je met het veld `volgorde`. Een nieuwe rubriek = een nieuw bestand. Uitleg van alle velden staat in `src/inhoud/_LEESMIJ.md`.

Een bron verschijnt automatisch op zijn (sub)rubriekpagina, bij elk onderwerp (tag), in de zoekfunctie en, als hij `kanalen` heeft, in & Winkel. Affiliate-links krijgen `partner: true`; dan verschijnt de vermelding in & Winkel vanzelf.

Overige teksten:

- Startpagina, menu, knoppen en footer: `src/_data/i18n.yaml`
- Vertaling van onderwerpen: `src/_data/tags.yaml`
- Losse pagina's: `src/begin-hier.njk`, `src/over.njk`, `src/disclaimer.njk` (Engels in `src/en/`)
- Sitenaam en domein: `src/_data/site.yaml`
- Kerkgeschiedenis (tekening en tekst): `src/_data/kerkgeschiedenis.yaml`

Kleine wijzigingen kun je direct in GitHub doen: open het bestand, klik op het potlood, pas aan en kies *Commit changes*. De site wordt dan automatisch opnieuw gepubliceerd.

## Lokaal werken

```bash
npm install
npm start        # http://localhost:8080
```

## Structuur

```
src/
  inhoud/           één bestand per rubriek (teksten, subrubrieken, bronnen)
  _data/            inhoud.js (bouwt alles op), i18n.yaml, tags.yaml, site.yaml
  _includes/        layouts en onderdelen (kop, voet, kaart, tegels)
  css/style.css     huisstijl volgens het stijlvoorstel
  js/site.js        menu, filters en zoeken
  index.njk         startpagina
  rubriek.njk       maakt alle rubriekpagina's
  subrubriek.njk    maakt alle subrubriekpagina's
  onderwerp.njk     maakt een pagina per onderwerp
  en/               Engelse versies van startpagina, zoeken, onderwerpen en tekstpagina's
  sitemap.njk, robots.njk, llms.njk, zoekindex.njk
  begin-hier.njk, over.njk, disclaimer.njk, zoeken.njk, onderwerpen.njk, 404.njk
```
