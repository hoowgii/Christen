// Bouwt alle inhoud op uit src/inhoud/*.yaml (één bestand per rubriek, volgorde via 'volgorde'),
// src/_data/tags.yaml en src/_data/i18n.yaml. Draait bij elke build opnieuw.
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const TALEN = ["nl", "en"];
const STANDAARD = "nl";
const MAP = "src/inhoud";
const voorvoegsel = (l) => (l === STANDAARD ? "" : `/${l}`);
const tagMap = { nl: "onderwerp", en: "topic" };
const lees = (p) => yaml.load(fs.readFileSync(p, "utf8"));

const slug = (s) =>
  String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "en").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const kies = (obj, veld, l) => (l !== STANDAARD && obj[`${veld}_${l}`]) || obj[veld];

function laadBron() {
  const bestanden = fs.readdirSync(MAP).filter((f) => /\.ya?ml$/.test(f)).sort();
  const rubrieken = [], items = [];
  for (const f of bestanden) {
    const { items: its = [], ...r } = lees(path.join(MAP, f)) || {};
    rubrieken.push(r);
    its.forEach((i) => items.push({ ...i, rubriek: r.slug }));
  }
  rubrieken.sort((a, b) => (a.volgorde ?? 99) - (b.volgorde ?? 99));
  return {
    rubrieken, items,
    tags: lees("src/_data/tags.yaml") || {},
    tekst: lees("src/_data/i18n.yaml"),
  };
}

function bouwTaal(l, { rubrieken, items, tags, tekst }) {
  const pre = voorvoegsel(l);
  // Optioneel veld 'talen: [nl]' of 'talen: [en]': item of subrubriek alleen in die taal tonen
  const inTaal = (x) => !x.talen || x.talen.includes(l);
  const rub = rubrieken.map((r) => {
    const url = `${pre}/${kies(r, "slug", l)}/`;
    const R = { key: r.slug, url, naam: kies(r, "naam", l), kort: kies(r, "kort", l), intro: kies(r, "intro", l), tekst: kies(r, "tekst", l) || "", verzamel: r.verzamel || null };
    R.sub = (r.sub || []).filter(inTaal).map((s) => ({
      key: s.slug, url: `${url}${kies(s, "slug", l)}/`,
      naam: kies(s, "naam", l), kort: kies(s, "kort", l), intro: kies(s, "intro", l), tekst: kies(s, "tekst", l) || "",
      rubriek: { key: R.key, naam: R.naam, url: R.url },
    }));
    return R;
  });
  const tagLabel = (t) => (l === STANDAARD ? t : tags[t] || t);
  const tagObj = (t) => ({ key: t, label: tagLabel(t), url: `${pre}/${tagMap[l]}/${slug(tagLabel(t))}/` });
  const its = items.filter(inTaal).map((i) => {
    const r = rub.find((x) => x.key === i.rubriek);
    const s = r && r.sub.find((x) => x.key === i.sub);
    return {
      titel: kies(i, "titel", l), auteur: i.auteur || "", omschrijving: kies(i, "omschrijving", l) || "",
      url: kies(i, "url", l) || "", type: i.type || "", kanalen: i.kanalen || [],
      links: (i.links || []).map((k) => ({ tekst: kies(k, "tekst", l), url: k.url, aanbieder: k.aanbieder || "", partner: !!k.partner })),
      alleenWinkel: !!i.alleen_winkel,
      rubriek: i.rubriek, sub: i.sub || null,
      tagKeys: i.tags || [], tags: (i.tags || []).map(tagObj),
      plek: r ? { naam: `& ${r.naam}${s ? ", " + s.naam : ""}`, url: s ? s.url : r.url } : null,
    };
  });
  const onderwerpen = [...new Set(items.filter(inTaal).flatMap((i) => i.tags || []))]
    .map(tagObj).sort((a, b) => a.label.localeCompare(b.label, l));
  return { lang: l, pre, t: tekst[l], rubrieken: rub, items: its, onderwerpen };
}

export default function () {
  const bron = laadBron();
  const talen = Object.fromEntries(TALEN.map((l) => [l, bouwTaal(l, bron)]));
  const alts = (zoek) => Object.fromEntries(TALEN.map((l) => [l, zoek(talen[l])]).filter(([, u]) => u));
  const rubriekUrl = (T, key) => (T.rubrieken.find((x) => x.key === key) || {}).url;
  const subUrl = (T, rk, sk) => ((T.rubrieken.find((x) => x.key === rk) || { sub: [] }).sub.find((x) => x.key === sk) || {}).url;
  const paginaRubrieken = [], paginaSubs = [], paginaOnderwerpen = [];
  for (const l of TALEN) {
    talen[l].rubrieken.forEach((r) => {
      paginaRubrieken.push({ ...r, lang: l, alts: alts((T) => rubriekUrl(T, r.key)) });
      r.sub.forEach((s) => paginaSubs.push({ ...s, lang: l, alts: alts((T) => subUrl(T, r.key, s.key)) }));
    });
    talen[l].onderwerpen.forEach((o) =>
      paginaOnderwerpen.push({ ...o, lang: l, alts: alts((T) => (T.onderwerpen.find((x) => x.key === o.key) || {}).url) }));
  }
  return { talen, paginaRubrieken, paginaSubs, paginaOnderwerpen };
}
