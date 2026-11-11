/* Essential Words 1 — picture vocabulary (units 1–20)
   Plain HTML/CSS/JS, hash routing: #/ (home), #/unit/N, #/unit/N/w/M */
(() => {
  "use strict";

  const UNITS = window.WORDS || [];
  const main = document.getElementById("main");
  const nav = document.getElementById("unitnav");

  /* Lucide icons (MIT), inlined so the site has no runtime dependency */
  const ICON_PATHS = {
    speak: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    eyeOff: '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    shuffle: '<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"/><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>'
  };
  const icon = (name) =>
    `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`;

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, val) { try { localStorage.setItem(key, val); } catch { /* storage unavailable */ } }
  };

  /* ---------- speech ---------- */
  const canSpeak = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  let voices = [];
  if (canSpeak) {
    const load = () => { voices = speechSynthesis.getVoices(); };
    load();
    speechSynthesis.addEventListener?.("voiceschanged", load);
  } else {
    document.documentElement.classList.add("no-speech");
  }
  const pickVoice = () =>
    voices.find((v) => /^en[-_]US/i.test(v.lang) && /google|samantha|aria|jenny|natural/i.test(v.name)) ||
    voices.find((v) => /^en[-_](US|GB)/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang));

  function speak(text, button) {
    if (!canSpeak) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.9;
    const v = pickVoice();
    if (v) u.voice = v;
    document.querySelectorAll(".card__speak.is-speaking").forEach((b) => b.classList.remove("is-speaking"));
    button?.classList.add("is-speaking");
    u.onend = u.onerror = () => button?.classList.remove("is-speaking");
    speechSynthesis.speak(u);
  }

  /* ---------- quiz mode (hide translations) ---------- */
  let quiz = store.get("ew1-quiz") === "1";

  /* ---------- markup ---------- */
  function cardHTML(unit, w, { level = 2, priority = "lazy" } = {}) {
    const img = w.img;
    const imgAttrs = priority === "high" ? 'fetchpriority="high"' : priority === "eager" ? "" : 'loading="lazy"';
    const media = img
      ? `<img src="${esc(img.src)}" alt="${esc(w.en)}" width="${img.w}" height="${img.h}" ${imgAttrs} decoding="async"${img.fit === "contain" ? ' class="is-contain"' : ""}>
         <a class="card__credit" href="${esc(img.source)}" target="_blank" rel="noopener noreferrer"
            title="${esc(img.title)}&#10;${esc(img.artist || "Wikimedia Commons")} · ${esc(img.license)}"
            aria-label="Rasm manbasi: ${esc(img.license)}, ${esc(img.artist || "Wikimedia Commons")}">${icon("image")}</a>`
      : `<div class="card__ph" aria-hidden="true">${esc(w.en.charAt(0))}</div>`;
    const id = `w-${unit}-${w.n}`;
    return `
      <article class="card" id="${id}">
        <figure class="card__media">${media}</figure>
        <div class="card__body">
          <div class="card__head">
            <span class="card__n">${w.n}</span>
            <h${level} class="card__word" lang="en" tabindex="-1"><span>${esc(w.en)}</span></h${level}>
          </div>
          <div class="card__meta">
            <span class="card__pos">${esc(w.pos || "")}</span>
            ${canSpeak ? `<button class="card__speak" type="button" data-say="${esc(w.en)}" aria-label="Talaffuzni eshitish: ${esc(w.en)}">${icon("speak")}</button>` : ""}
          </div>
          <div class="card__uz-wrap">
            <p class="card__uz" lang="uz">${esc(w.uz)}</p>
          </div>
        </div>
      </article>`;
  }

  function navHTML() {
    return UNITS.map((u) => `<li><a href="#/unit/${u.unit}" aria-label="${u.unit}-unit">${u.unit}</a></li>`).join("");
  }

  const withImages = () => UNITS.flatMap((u) => u.words.filter((w) => w.img).map((w) => ({ unit: u.unit, w })));

  function featuredHTML() {
    const pool = withImages();
    if (!pool.length) return "";
    const { unit, w } = pool[Math.floor(Math.random() * pool.length)];
    return `${cardHTML(unit, w, { level: 2, priority: "high" })}
      <div class="hero__actions">
        <button class="btn btn--ghost" type="button" data-action="shuffle">${icon("shuffle")}Boshqa so‘z</button>
        <a class="btn btn--ghost" href="#/unit/${unit}/w/${w.n}">${icon("grid")}${unit}-unitda ko‘rish</a>
      </div>`;
  }

  function homeHTML() {
    const tiles = UNITS.map((u) => {
      const thumbs = u.words.filter((w) => w.img).slice(0, 4);
      const mosaic = thumbs.map((w) => `<img src="${esc(w.img.src)}" alt="" width="${w.img.w}" height="${w.img.h}" loading="lazy" decoding="async">`).join("")
        + '<span class="thumb-ph"></span>'.repeat(Math.max(0, 4 - thumbs.length));
      return `<li><a class="unit-tile" href="#/unit/${u.unit}">
          <span class="unit-tile__num">${u.unit}</span>
          <span class="unit-tile__mosaic" aria-hidden="true">${mosaic}</span>
          <span class="unit-tile__words">${u.words.map((w) => esc(w.en)).join(", ")}</span>
        </a></li>`;
    }).join("");
    return `
      <section class="hero">
        <div>
          <h1 class="hero__title view-heading" tabindex="-1">Rasmli lug‘at</h1>
          <p class="hero__lead"><i>4000 Essential English Words 1</i> kitobining 1–20-unitlari: 400 ta so‘z, har biri rasmi, talaffuzi va o‘zbekcha tarjimasi bilan.</p>
          <a class="btn" href="#/unit/1">1-unitdan boshlash ${icon("right")}</a>
        </div>
        <div class="hero__stage" id="featured">${featuredHTML()}</div>
      </section>
      <section class="toc" aria-labelledby="toc-title">
        <div class="toc__head">
          <h2 class="toc__title" id="toc-title">Unitlar</h2>
          <label class="search">${icon("search")}
            <input type="search" id="q" placeholder="So‘z qidirish: inglizcha yoki o‘zbekcha" aria-label="So‘z qidirish" autocomplete="off" spellcheck="false">
          </label>
        </div>
        <div id="results" aria-live="polite"></div>
        <ol class="toc__grid">${tiles}</ol>
      </section>`;
  }

  function unitHTML(n) {
    const u = UNITS[n - 1];
    const cards = u.words.map((w, i) => `<li>${cardHTML(n, w, { level: 2, priority: i === 0 ? "high" : i < 4 ? "eager" : "lazy" })}</li>`).join("");
    const prev = n > 1 ? `<a class="pager__prev" href="#/unit/${n - 1}">${icon("left")}${n - 1}-unit</a>` : `<a class="pager__prev" href="#/">${icon("left")}Barcha unitlar</a>`;
    const next = n < UNITS.length ? `<a class="pager__next" href="#/unit/${n + 1}">${n + 1}-unit${icon("right")}</a>` : `<a class="pager__next" href="#/">Barcha unitlar${icon("right")}</a>`;
    return `
      <section class="unit" aria-labelledby="unit-title">
        <header class="unit__head">
          <h1 class="unit__title view-heading" id="unit-title" tabindex="-1">Unit ${n}</h1>
          <p class="unit__meta">${u.words.length} ta so‘z</p>
          <div class="unit__tools">
            <button class="toggle" type="button" data-action="quiz" aria-pressed="${quiz}">${icon(quiz ? "eye" : "eyeOff")}<span>${quiz ? "Tarjimalarni ko‘rsatish" : "Tarjimalarni yashirish"}</span></button>
          </div>
        </header>
        <ol class="cards">${cards}</ol>
        <nav class="pager" aria-label="Boshqa unitlar">${prev}${next}</nav>
      </section>`;
  }

  /* ---------- quiz overlays ---------- */
  function applyQuiz() {
    main.querySelectorAll(".unit .card").forEach((card) => {
      const wrap = card.querySelector(".card__uz-wrap");
      const text = card.querySelector(".card__uz");
      const btn = wrap.querySelector(".card__reveal");
      if (quiz && !btn) {
        text.classList.add("is-hidden");
        wrap.insertAdjacentHTML("beforeend", `<button class="card__reveal" type="button" data-action="reveal">${icon("eye")}Tarjimani ko‘rish</button>`);
      } else if (!quiz) {
        text.classList.remove("is-hidden");
        btn?.remove();
      }
    });
    const t = main.querySelector('[data-action="quiz"]');
    if (t) {
      t.setAttribute("aria-pressed", String(quiz));
      t.innerHTML = `${icon(quiz ? "eye" : "eyeOff")}<span>${quiz ? "Tarjimalarni ko‘rsatish" : "Tarjimalarni yashirish"}</span>`;
    }
  }

  /* ---------- search ---------- */
  const fold = (s) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/['‘’ʻʼ`´]/g, "");
  const INDEX = UNITS.flatMap((u) => u.words.map((w) => ({ unit: u.unit, w, key: fold(`${w.en} ${w.uz}`) })));

  function runSearch(q) {
    const out = document.getElementById("results");
    if (!out) return;
    const term = fold(q.trim());
    if (!term) { out.innerHTML = ""; return; }
    const hits = INDEX.filter((x) => x.key.includes(term));
    hits.sort((a, b) => (fold(a.w.en).startsWith(term) ? 0 : 1) - (fold(b.w.en).startsWith(term) ? 0 : 1));
    if (!hits.length) {
      out.innerHTML = `<ul class="results"><li class="results__empty">“${esc(q.trim())}” topilmadi. Boshqacha yozib ko‘ring.</li></ul>`;
      return;
    }
    out.innerHTML = `<ul class="results">${hits.slice(0, 24).map(({ unit, w }) => `
      <li><a href="#/unit/${unit}/w/${w.n}">
        ${w.img ? `<img src="${esc(w.img.src)}" alt="" width="${w.img.w}" height="${w.img.h}" loading="lazy">` : '<span class="thumb-ph"></span>'}
        <span><span class="results__word">${esc(w.en)}</span><span class="results__uz">${esc(w.uz)}</span></span>
        <span class="results__unit">${unit}-unit</span>
      </a></li>`).join("")}</ul>`;
  }

  /* ---------- routing ---------- */
  function parseRoute() {
    const m = location.hash.match(/^#\/unit\/(\d{1,2})(?:\/w\/(\d{1,2}))?\/?$/);
    if (m) {
      const unit = Number(m[1]);
      if (unit >= 1 && unit <= UNITS.length) return { view: "unit", unit, word: m[2] ? Number(m[2]) : null };
    }
    return { view: "home" };
  }

  function markNav(route) {
    nav.querySelectorAll("a").forEach((a) => {
      const current = route.view === "unit" && a.getAttribute("href") === `#/unit/${route.unit}`;
      if (current) {
        a.setAttribute("aria-current", "page");
        a.scrollIntoView({ block: "nearest", inline: "nearest", container: "nearest" });
      } else {
        a.removeAttribute("aria-current");
      }
    });
  }

  function update(route) {
    main.innerHTML = route.view === "unit" ? unitHTML(route.unit) : homeHTML();
    document.title = route.view === "unit" ? `Unit ${route.unit} — Essential Words 1` : "Essential Words 1 — rasmli lug‘at";
    markNav(route);
    if (route.view === "unit") applyQuiz();
    if (route.view === "unit" && route.word) {
      const card = document.getElementById(`w-${route.unit}-${route.word}`);
      card?.classList.add("is-target");
      card?.scrollIntoView({ block: "center" });
    } else {
      window.scrollTo(0, 0);
    }
  }

  function focusAfter(route) {
    const target = route.view === "unit" && route.word
      ? document.querySelector(`#w-${route.unit}-${route.word} .card__word`)
      : main.querySelector(".view-heading");
    target?.focus({ preventScroll: true });
  }

  let first = true;
  function render() {
    const route = parseRoute();
    if (first) { first = false; update(route); if (route.word) focusAfter(route); return; }
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce) { update(route); focusAfter(route); return; }
    const t = document.startViewTransition(() => update(route));
    t.finished.finally(() => focusAfter(route));
  }

  /* ---------- events ---------- */
  document.addEventListener("click", (e) => {
    const say = e.target.closest("[data-say]");
    if (say) { speak(say.dataset.say, say); return; }
    const act = e.target.closest("[data-action]");
    if (!act) return;
    const action = act.dataset.action;
    if (action === "quiz") {
      quiz = !quiz;
      store.set("ew1-quiz", quiz ? "1" : "0");
      applyQuiz();
    } else if (action === "reveal") {
      const wrap = act.closest(".card__uz-wrap");
      wrap.querySelector(".card__uz").classList.remove("is-hidden");
      act.remove();
    } else if (action === "shuffle") {
      const box = document.getElementById("featured");
      if (box) box.innerHTML = featuredHTML();
    }
  });

  document.addEventListener("input", (e) => {
    if (e.target.id === "q") runSearch(e.target.value);
  });

  window.addEventListener("hashchange", render);

  /* Fallback for the faded edges of the unit strip when scroll-driven animations are missing */
  function edgeFades() {
    if (CSS.supports("animation-timeline: scroll()")) return;
    const first = nav.firstElementChild, last = nav.lastElementChild;
    if (!first || !last || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      for (const { target, intersectionRatio } of entries) {
        nav.classList.toggle(target === first ? "more-start" : "more-end", intersectionRatio < 1);
      }
    }, { root: nav, threshold: 1, rootMargin: "1px" });
    io.observe(first);
    io.observe(last);
  }

  nav.innerHTML = navHTML();
  edgeFades();
  render();
})();
