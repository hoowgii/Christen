# Inhoud van Christen&

Elk bestand in deze map is één rubriek, met al zijn teksten en bronnen.

## Velden van een rubriek

- `volgorde`: positie in menu en op de startpagina (1 = eerst)
- `slug` / `slug_en`: het adres, bijv. christen.nl/woord/ en /en/word/
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
- `sub`: in welke subrubriek het item hoort (alleen als de rubriek subrubrieken heeft)
- `type`: website, video, radio, organisatie, boek, product, app
- `tags`: onderwerpen; verbinden items over rubrieken heen
- `kanalen`: winkellinks. `partner: true` = affiliate-link (dan staat er een vermelding in & Winkel)

Alles met `_en` erachter is de Engelse versie. Ontbreekt die, dan toont de Engelse site de Nederlandse tekst.
Een item zonder `url` toont "Link volgt".
Regels met `# VOORSTEL` zijn bronnen die Claude heeft voorgesteld: houden of verwijderen.
