import yaml from "js-yaml";
import markdownIt from "markdown-it";
import { HtmlBasePlugin } from "@11ty/eleventy";

const TALEN = ["nl", "en"];

export default function (eleventyConfig) {
  eleventyConfig.addDataExtension("yaml,yml", (inhoud) => yaml.load(inhoud));
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/css": "css", "src/js": "js", "src/favicon.svg": "favicon.svg", "src/og.png": "og.png" });
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
    lijst.filter((i) => i.rubriek === rubriek && (sub === undefined || i.sub === sub)));
  eleventyConfig.addFilter("metTag", (lijst, key) => lijst.filter((i) => i.tagKeys.includes(key)));
  eleventyConfig.addFilter("teKoop", (lijst) => lijst.filter((i) => i.kanalen.length));
  eleventyConfig.addFilter("heeftPartner", (lijst) => lijst.some((i) => i.kanalen.some((k) => k.partner)));
  eleventyConfig.addFilter("lijstTags", (lijst) => {
    const m = new Map();
    lijst.forEach((i) => i.tags.forEach((t) => m.set(t.key, t)));
    return [...m.values()].sort((a, b) => a.label.localeCompare(b.label));
  });
  eleventyConfig.addFilter("domein", (url) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } });
  eleventyConfig.addFilter("hoofdletter", (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s));
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));
  eleventyConfig.addFilter("xml", (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
  eleventyConfig.addFilter("zoekindex", (lijst) =>
    JSON.stringify(lijst.map(({ titel, auteur, omschrijving, url, kanalen, tags, plek }) =>
      ({ titel, auteur, omschrijving, url, kanalen, tags: tags.map(({ label, url }) => ({ label, url })), plek }))));

  return {
    dir: { input: "src", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
