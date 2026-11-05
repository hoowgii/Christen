// Christen& – menu, filters en zoeken. Geen externe afhankelijkheden.
(() => {
  /* ---------- Menu (mobiel/tablet) ---------- */
  const knop = document.querySelector(".menuknop");
  const menu = document.getElementById("hoofdmenu");
  if (knop && menu) {
    const zet = (open) => {
      knop.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
    };
    knop.addEventListener("click", () => zet(knop.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) { zet(false); knop.focus(); }
    });
  }

  /* ---------- Filteren op soort, onderwerp en tekst ---------- */
  const normaal = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  document.querySelectorAll("[data-lijst]").forEach((blok) => {
    const filter = blok.querySelector("[data-filter]");
    if (!filter) return;
    filter.hidden = false;
    const items = [...blok.querySelectorAll(".item")];
    const leeg = blok.querySelector("[data-leeg]");
    const invoer = filter.querySelector("[data-filter-tekst]");
    const keuze = { type: "", tag: "" };
    let wacht;

    const pasToe = () => {
      const termen = normaal(invoer ? invoer.value : "").split(/\s+/).filter(Boolean);
      let zichtbaar = 0;
      items.forEach((it) => {
        const tags = it.dataset.tags ? it.dataset.tags.split("|") : [];
        const tekst = normaal(it.dataset.zoek + " " + tags.join(" "));
        const toon = (!keuze.type || it.dataset.type === keuze.type)
          && (!keuze.tag || tags.includes(keuze.tag))
          && termen.every((t) => tekst.includes(t));
        it.hidden = !toon;
        if (toon) zichtbaar++;
      });
      if (leeg) leeg.hidden = zichtbaar > 0;
    };

    filter.querySelectorAll("[data-groep]").forEach((groep) => {
      const knoppen = groep.querySelectorAll("button");
      knoppen.forEach((k) => k.addEventListener("click", () => {
        knoppen.forEach((b) => b.setAttribute("aria-pressed", String(b === k)));
        keuze[groep.dataset.groep] = k.dataset.waarde;
        pasToe();
      }));
    });
    if (invoer) invoer.addEventListener("input", () => { clearTimeout(wacht); wacht = setTimeout(pasToe, 150); });
  });

  /* ---------- Zoeken ---------- */
  const zoek = document.querySelector("[data-zoeken]");
  const indexLink = document.querySelector("link[data-zoekindex]");
  if (!zoek || !indexLink) return;

  const lang = document.documentElement.lang === "en" ? "en" : "nl";
  const TEKST = {
    nl: { in: "In", bekijkBij: "Bekijk bij", extern: " (externe website, opent in nieuw tabblad)", onderwerpen: "Onderwerpen",
          een: "resultaat", meer: "resultaten", voor: "voor", niets: (q) => `Niets gevonden voor “${q}”. Probeer een ander woord, of bekijk alle onderwerpen.`,
          fout: "Zoeken is nu niet beschikbaar. Vernieuw de pagina en probeer het opnieuw." },
    en: { in: "In", bekijkBij: "View at", extern: " (external website, opens in a new tab)", onderwerpen: "Topics",
          een: "result", meer: "results", voor: "for", niets: (q) => `Nothing found for “${q}”. Try another word, or browse all topics.`,
          fout: "Search is not available right now. Reload the page and try again." },
  }[lang];

  // Basis-URL van de site (werkt zowel op github.io/Christen/ als op eigen domein)
  const basisLink = document.querySelector("link[data-basis]");
  const basis = (basisLink ? basisLink.href : location.origin + "/").replace(/\/$/, "");
  const intern = (pad) => basis + pad;

  const invoer = zoek.querySelector("input");
  const uit = document.querySelector("[data-resultaten]");
  const status = document.querySelector("[data-status]");
  const norm = normaal;
  let data = [];
  let wacht;

  const el = (tag, cls, tekst) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (tekst) e.textContent = tekst;
    return e;
  };
  const sr = (tekst) => el("span", "sr", tekst);
  const EXTERN_ICOON = '<svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';

  function kaart(i) {
    const art = el("article", "item");
    const h = el("h3", "item__titel");
    if (i.url && !i.kanalen.length) {
      const a = el("a", "", i.titel);
      a.href = i.url; a.rel = "noopener";
      h.append(a);
    } else h.textContent = i.titel;
    art.append(h);
    if (i.auteur) art.append(el("p", "item__auteur", i.auteur));
    art.append(el("p", "item__tekst", i.omschrijving));
    if (i.plek) {
      const p = el("p", "item__plek", TEKST.in + " ");
      const a = el("a", "", i.plek.naam);
      a.href = intern(i.plek.url);
      p.append(a);
      art.append(p);
    }
    if (i.links && i.links.length) {
      const ul = el("ul", "item__extra");
      i.links.forEach((k) => {
        const li = el("li"); const a = el("a", "", k.tekst);
        a.href = k.url; a.rel = "noopener" + (k.partner ? " sponsored" : "");
        li.append(a);
        if (k.aanbieder) li.append(" ", el("span", "item__extra-bron", `(${k.aanbieder})`));
        li.append(sr(TEKST.extern)); ul.append(li);
      });
      art.append(ul);
    }
    const voet = el("div", "item__voet");
    if (i.kanalen.length) {
      const ul = el("ul", "item__kanalen");
      i.kanalen.forEach((k) => {
        const li = el("li");
        const a = el("a", "knop knop--rand", `${TEKST.bekijkBij} ${k.aanbieder}`);
        a.href = k.url; a.rel = "noopener" + (k.partner ? " sponsored" : "");
        a.append(sr(TEKST.extern));
        li.append(a); ul.append(li);
      });
      voet.append(ul);
    } else if (i.url) {
      let domein = i.url;
      try { domein = new URL(i.url).hostname.replace(/^www\./, ""); } catch {}
      const p = el("a", "item__domein");
      p.href = i.url; p.rel = "noopener"; p.tabIndex = -1; p.setAttribute("aria-hidden", "true");
      p.innerHTML = EXTERN_ICOON;
      p.append(domein);
      voet.append(p);
    }
    if (i.tags.length) {
      const ul = el("ul", "item__tags");
      ul.setAttribute("aria-label", TEKST.onderwerpen);
      i.tags.forEach((t) => {
        const li = el("li");
        const a = el("a", "", t.label);
        a.href = intern(t.url);
        li.append(a); ul.append(li);
      });
      voet.append(ul);
    }
    art.append(voet);
    art.querySelectorAll("a[href^='http']").forEach((a) => {
      if (new URL(a.href).hostname !== location.hostname) { a.target = "_blank"; a.rel = [...new Set((a.rel + " noopener noreferrer").split(" ").filter(Boolean))].join(" "); }
    });
    return art;
  }

  function toon(q) {
    const url = new URL(location.href);
    if (q.trim()) url.searchParams.set("q", q.trim()); else url.searchParams.delete("q");
    history.replaceState(null, "", url);

    const termen = norm(q).split(/\s+/).filter(Boolean);
    uit.replaceChildren();
    if (!termen.length) { status.textContent = ""; return; }
    const hits = data.filter((i) => termen.every((t) => i.hooi.includes(t)));
    status.textContent = hits.length
      ? `${hits.length} ${hits.length === 1 ? TEKST.een : TEKST.meer} ${TEKST.voor} “${q.trim()}”`
      : TEKST.niets(q.trim());
    hits.forEach((i) => uit.append(kaart(i)));
  }

  fetch(indexLink.href)
    .then((r) => r.json())
    .then((d) => {
      data = d.map((i) => ({
        ...i,
        hooi: norm([i.titel, i.auteur, i.omschrijving, i.tags.map((t) => t.label).join(" "), i.plek ? i.plek.naam : ""].join(" ")),
      }));
      const q = new URLSearchParams(location.search).get("q") || "";
      invoer.value = q;
      toon(q);
    })
    .catch(() => { status.textContent = TEKST.fout; });

  zoek.addEventListener("submit", (e) => { e.preventDefault(); clearTimeout(wacht); toon(invoer.value); });
  invoer.addEventListener("input", () => { clearTimeout(wacht); wacht = setTimeout(() => toon(invoer.value), 250); });
})();
