import yaml from "js-yaml";
import markdownIt from "markdown-it";
import { HtmlBasePlugin } from "@11ty/eleventy";

const TALEN = ["nl", "en"];

export default function (eleventyConfig) {
  eleventyConfig.addDataExtension("yaml,yml", (inhoud) => yaml.load(inhoud));
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/css": "css", "src/js": "js", "src/img": "img", "src/favicon.svg": "favicon.svg", "src/og.png": "og.png" });
  const f = "node_modules/@fontsource";
  eleventyConfig.addPassthroughCopy({
    [`${f}/eb-garamond/files/eb-garamond-latin-400-normal.woff2`]: "fonts/eb-garamond-400.woff2",
    [`${f}/eb-garamond/files/eb-garamond-latin-600-normal.woff2`]: "fonts/eb-garamond-600.woff2",
    [`${f}/eb-garamond/files/eb-garamond-latin-400-italic.woff2`]: "fonts/eb-garamond-400-italic.woff2",
    [`${f}/source-sans-3/files/source-sans-3-latin-400-normal.woff2`]: "fonts/source-sans-3-400.woff2",
    [`${f}/source-sans-3/files/source-sans-3-latin-600-normal.woff2`]: "fonts/source-sans-3-600.woff2",
  });

  eleventyConfig.addGlobalData("taalcodes", TALEN);
  eleventyConfig.addWatchTarget("./src/inhoud/");
  eleventyConfig.ignores.add("src/inhoud/**");

  // Opmaak in 'tekst'-velden: alinea's, ### kopjes, [links](...) en **vet**
  const md = markdownIt({ html: false, linkify: false, typographer: false });
  eleventyConfig.addFilter("md", (s) => (s ? md.render(String(s)) : ""));
  eleventyConfig.addGlobalData("lang", "nl");
  eleventyConfig.addGlobalData("jaar", new Date().getFullYear());
  eleventyConfig.addGlobalData("bouwdatum", new Date().toISOString().slice(0, 10));

  // ---------- Filters ----------
  eleventyConfig.addFilter("itemsIn", (lijst, rubriek, sub) =>
    lijst.filter((i) => !i.alleenWinkel && i.rubriek === rubriek && (sub === undefined || i.sub === sub)));
  eleventyConfig.addFilter("metTag", (lijst, key) => lijst.filter((i) => i.tagKeys.includes(key)));
  eleventyConfig.addFilter("teKoop", (lijst) => lijst.filter((i) => i.kanalen.length));
  eleventyConfig.addFilter("heeftPartner", (lijst) => lijst.some((i) => [...i.kanalen, ...i.links].some((k) => k.partner)));
  eleventyConfig.addFilter("lijstTags", (lijst) => {
    const m = new Map();
    lijst.forEach((i) => i.tags.forEach((t) => m.set(t.key, t)));
    return [...m.values()].sort((a, b) => a.label.localeCompare(b.label));
  });
  const TYPEVOLGORDE = ["bijbel", "boek", "product", "app", "website", "video", "radio", "organisatie", "opleiding", "cursus", "evenement"];
  eleventyConfig.addFilter("lijstTypen", (lijst) => {
    const aanwezig = new Set(lijst.map((i) => i.type).filter(Boolean));
    return [...TYPEVOLGORDE.filter((t) => aanwezig.has(t)), ...[...aanwezig].filter((t) => !TYPEVOLGORDE.includes(t))];
  });
  // ---------- Kerkgeschiedenis: posities, lijnen en relaties voor de tekening ----------
  eleventyConfig.addFilter("kgTekening", (K, lang) => {
    const t = K.tekening, w = t.knoopBreedte, h = t.knoopHoogte, boven = 60;
    const kies = (o, v) => (lang !== "nl" && o[`${v}_${lang}`]) || o[v];
    const knopen = K.knopen.map((k) => {
      const cx = t.marge + k.kolom * t.kolomBreedte, cy = boven + k.rij * t.rijHoogte;
      const extern = !!k.url;
      const href = k.url || kies(k, "link") || `#kg-${k.id}`;
      return { id: k.id, cx, cy, x: cx - w / 2, y: cy - h / 2, w, h, extern, href, intern: !k.url && !!kies(k, "link"),
        label: kies(k, "label"), sub: kies(k, "sub") || "", naam: kies(k, "naam"), jaar: kies(k, "jaar") || "",
        omschrijving: kies(k, "omschrijving") };
    });
    const vind = (id) => knopen.find((k) => k.id === id);
    const lijnen = K.lijnen.map((l) => {
      const a = vind(l.van), b = vind(l.naar);
      let d;
      if (l.route === "onder") d = `M${a.cx} ${a.cy + h / 2} V${b.cy} H${b.x}`;
      else if (a.cx === b.cx) d = `M${a.cx} ${a.cy + h / 2} V${b.cy - h / 2}`;
      else if (a.cy === b.cy) d = `M${a.x + w} ${a.cy} H${b.x}`;
      else { const knik = l.knik ?? b.x - 16; d = `M${a.x + w} ${a.cy} H${knik} V${b.cy} H${b.x}`; }
      return { d, soort: l.soort };
    });
    const westers = vind("westerse-kerk");
    const rk = westers ? { d: `M${westers.x + w} ${westers.cy} H${t.breedte - 16}`, tx: (westers.x + w + t.breedte) / 2, ty: westers.cy - 12 } : null;
    // Relaties in tekst (zodat de tekening niet de enige drager is)
    knopen.forEach((k) => {
      const binnen = K.lijnen.filter((l) => l.naar === k.id);
      k.direct = binnen.filter((l) => l.soort === "direct").map((l) => vind(l.van));
      k.invloed = binnen.filter((l) => l.soort === "invloed").map((l) => vind(l.van));
    });
    return { knopen, lijnen, rk, breedte: t.breedte, hoogte: t.hoogte };
  });
  eleventyConfig.addFilter("domein", (url) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } });
  eleventyConfig.addFilter("hoofdletter", (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s));
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));
  eleventyConfig.addFilter("xml", (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
  eleventyConfig.addFilter("zoekindex", (lijst) =>
    JSON.stringify(lijst.map(({ titel, auteur, omschrijving, url, kanalen, links, tags, plek }) =>
      ({ titel, auteur, omschrijving, url, kanalen, links, tags: tags.map(({ label, url }) => ({ label, url })), plek }))));

  return {
    dir: { input: "src", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
