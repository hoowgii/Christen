# Inhoud van Christen&

Elk bestand in deze map is één rubriek, met al zijn teksten en bronnen.

## Velden van een rubriek

- `volgorde`: positie in menu en op de startpagina (1 = eerst)
- `slug` / `slug_en`: het adres, bijv. christen-en.nl/woord/ en /en/word/
- `naam`, `kort` (één regel op de tegels), `intro` (eerste alinea, met grote beginletter)
- `tekst`: langere uitleg onder de intro. Hierin mag je opmaak gebruiken:
  - een lege regel = nieuwe alinea
  - `### Kopje` = tussenkopje
  - `[linktekst](https://...)` = link
  - `**vet**` = vet
- `sub`: subrubrieken met dezelfde velden (optioneel)
- `items`: de bronnen, boeken en producten

## Velden van een item (bron)

- `titel`, `url`, `omschrijving`, `auteur` (optioneel)
- `url_en`: ander adres voor de Engelse site (optioneel)
- `talen: [nl]` of `talen: [en]`: item alleen in die taal tonen (optioneel; zonder dit veld verschijnt het in beide talen). Werkt ook voor een subrubriek.
- `sub`: in welke subrubriek het item hoort (alleen als de rubriek subrubrieken heeft)
- `type`: bijbel, boek, product, app, website, video, radio, organisatie, opleiding, cursus, evenement (op lijsten met meerdere soorten kun je hierop filteren)
- `tags`: onderwerpen; verbinden items over rubrieken heen
- `links`: extra verwijzing(en) op de kaart, bijv. een boek bij een organisatie of de app-winkels (Google Play, App Store) bij een app (`tekst`, `tekst_en`, `url`, `aanbieder`, `partner`)
- `alleen_winkel: true`: item niet als losse tegel op de rubriekpagina, wel in & Winkel, zoeken en onderwerpen
- `kanalen`: winkellinks. `partner: true` = affiliate-link (dan staat er een vermelding in & Winkel)
- `schap`: categorie in & Winkel, verplicht bij elk item met `kanalen`: `bijbel`, `verdieping`, `kerkgeschiedenis`, `christelijk-leven` of `kerkelijk-leven`. De lijst met namen staat bovenin `winkel.yaml`. Ontbreekt het schap, dan meldt de build dat in de log.

## & Winkel

& Winkel toont automatisch alle items met `kanalen`, gesorteerd per schap, met filters op categorie en soort en een zoekveld.
Een product dat nergens anders op de site past (bijvoorbeeld gesprekskaarten), zet je in `winkel.yaml` onder `items`. Het verschijnt dan in & Winkel, bij zijn onderwerpen en in de zoekfunctie.

Alles met `_en` erachter is de Engelse versie. Ontbreekt die, dan toont de Engelse site de Nederlandse tekst.
Een item zonder `url` krijgt geen websitelink; vul daarom altijd een `url` in.

## Evenementen

Zet bij terugkerende evenementen geen jaartal in de titel en verwijs naar de vaste hoofdpagina van de organisator, niet naar een pagina van één editie.

## Kerkgeschiedenis

De tekening en tekst op /kerkgeschiedenis/ komen uit `src/_data/kerkgeschiedenis.yaml`. Uitleg van de velden staat bovenin dat bestand.
