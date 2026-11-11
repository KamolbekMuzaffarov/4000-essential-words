/* Essential Words 1 — picture vocabulary (units 1–20) and irregular verbs
   Plain HTML/CSS/JS, hash routing: #/ (home), #/unit/N, #/unit/N/w/M, #/verbs, #/verbs/<group> */
(() => {
  "use strict";

  const UNITS = window.WORDS || [];
  const VERBS = window.VERBS || { stages: [], plan: [] };
  const main = document.getElementById("main");
  const nav = document.getElementById("unitnav");
  const dlg = document.getElementById("practice");
  /* Practice cards need <dialog>; on the few old browsers without it the buttons are hidden
     and the table's test mode still works */
  const canPractice = !!dlg && typeof dlg.showModal === "function";
  if (!canPractice) document.documentElement.classList.add("no-dialog");

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
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    again: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>'
  };
  const icon = (name) =>
    `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`;

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, val) { try { localStorage.setItem(key, val); } catch { /* storage unavailable */ } }
  };

  /* ---------- pronunciation ----------
     Every word and verb has a pre-recorded clip, so the button works in any browser,
     including in-app browsers (Telegram, Instagram) that have no speech engine.
     The browser's own speech engine is only used if a clip cannot be played. */
  const hasTTS = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  let voices = [];
  if (hasTTS) {
    const load = () => { try { voices = speechSynthesis.getVoices(); } catch { voices = []; } };
    load();
    speechSynthesis.addEventListener?.("voiceschanged", load);
  }
  const pickVoice = () =>
    voices.find((v) => /^en[-_]US/i.test(v.lang) && /google|samantha|aria|jenny|natural/i.test(v.name)) ||
    voices.find((v) => /^en[-_](US|GB)/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang));

  const player = typeof Audio === "function" ? new Audio() : null;
  if (player) player.preload = "auto";
  let playToken = 0;

  function markPlaying(btn) {
    document.querySelectorAll(".is-speaking").forEach((b) => b.classList.remove("is-speaking"));
    btn?.classList.add("is-speaking");
  }
  const finished = (t) => { if (t === playToken) markPlaying(null); };

  function speakTTS(text, t) {
    if (!hasTTS || !text) { finished(t); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.9;
      const v = pickVoice();
      if (v) u.voice = v;
      u.onend = u.onerror = () => finished(t);
      speechSynthesis.speak(u);
    } catch { finished(t); }
  }

  function pronounce(btn) {
    const t = ++playToken;
    const src = btn.dataset.audio;
    const text = btn.dataset.say;
    if (hasTTS) { try { speechSynthesis.cancel(); } catch { /* ignore */ } }
    markPlaying(btn);
    if (!player || !src) { speakTTS(text, t); return; }
    let fellBack = false;
    const fallback = () => {
      if (fellBack || t !== playToken) return;
      fellBack = true;
      speakTTS(text, t);
    };
    player.onended = () => finished(t);
    player.onerror = fallback;
    player.src = src;
    try {
      const p = player.play();
      if (p && typeof p.catch === "function") p.catch(fallback);
    } catch { fallback(); }
  }

  function stopAudio() {
    playToken++;
    markPlaying(null);
    if (player) { try { player.pause(); } catch { /* ignore */ } }
    if (hasTTS) { try { speechSynthesis.cancel(); } catch { /* ignore */ } }
  }

  const sayButton = (cls, audio, say, label) =>
    `<button class="${cls}" type="button" data-say="${esc(say)}" data-audio="${esc(audio || "")}" aria-label="${esc(label)}">${icon("speak")}</button>`;

  /* ---------- quiz mode (hide translations) ---------- */
  let quiz = store.get("ew1-quiz") === "1";

  /* ---------- markup: words ---------- */
  function cardHTML(unit, w, { level = 2, priority = "lazy" } = {}) {
    const img = w.img;
    const imgAttrs = priority === "high" ? 'fetchpriority="high"' : priority === "eager" ? "" : 'loading="lazy"';
    const media = img
      ? `<img src="${esc(img.src)}" alt="${esc(w.en)}" width="${img.w}" height="${img.h}" ${imgAttrs} decoding="async"${img.fit === "contain" ? ' class="is-contain"' : ""}>
         <a class="card__credit" href="${esc(img.source)}" target="_blank" rel="noopener noreferrer"
            title="${esc(img.title)}&#10;${esc(img.artist || "Wikimedia Commons")}, ${esc(img.license)}"
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
            ${sayButton("card__speak", w.au, w.en, `Talaffuzni eshitish: ${w.en}`)}
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
      <a class="promo" href="#/verbs">
        <span class="promo__sample" lang="en" aria-hidden="true">s<mark>i</mark>ng s<mark>a</mark>ng s<mark>u</mark>ng</span>
        <span class="promo__body">
          <span class="promo__title">Noto‘g‘ri fe’llar</span>
          <span class="promo__text">${VERBS_TOTAL} ta fe’l o‘zgarish naqshiga qarab ${GROUPS.length} ta kichik guruhga bo‘lingan: talaffuz, test rejimi va 7 kunlik takrorlash rejasi bilan.</span>
          <span class="promo__go">Yodlashni boshlash ${icon("right")}</span>
        </span>
      </a>
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
    const next = n < UNITS.length ? `<a class="pager__next" href="#/unit/${n + 1}">${n + 1}-unit${icon("right")}</a>` : `<a class="pager__next" href="#/verbs">Noto‘g‘ri fe’llar${icon("right")}</a>`;
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

  /* ---------- irregular verbs ---------- */
  const GROUPS = VERBS.stages.flatMap((s, si) => s.groups.map((g) => ({ ...g, stage: s, stageNo: si + 1 })));
  const GROUP = Object.fromEntries(GROUPS.map((g) => [g.id, g]));
  const VERB = Object.fromEntries(GROUPS.flatMap((g) => g.verbs.map((v) => [v.v1, v])));
  const VERBS_TOTAL = Object.keys(VERB).length;

  const marked = (s) => esc(s).replace(/\[([^\]]+)\]/g, "<mark>$1</mark>");
  const plainForm = (s) => String(s).replace(/[[\]]/g, "");
  const verbSay = (v) => `${v.v1}, ${plainForm(v.v2)}, ${plainForm(v.v3)}`;

  let doneGroups;
  try { doneGroups = new Set(JSON.parse(store.get("ew1-verbs-done") || "[]")); } catch { doneGroups = new Set(); }
  const saveDone = () => store.set("ew1-verbs-done", JSON.stringify([...doneGroups]));
  let vtest = store.get("ew1-verbs-test") === "1";

  const formCells = (v) =>
    `<td class="vt__f" lang="en" tabindex="-1">${marked(v.v2)}</td><td class="vt__f" lang="en">${marked(v.v3)}</td>`;
  const hiddenCells = (v) =>
    `<td class="vt__hidden" colspan="2"><button class="vt__reveal" type="button" data-action="vreveal" data-verb="${esc(v.v1)}">${icon("eye")}<span>Eslang, keyin bosing</span></button></td>`;

  function verbRow(v) {
    return `<tr>
        <th class="vt__v1" scope="row"><span lang="en">${esc(v.v1)}</span><span class="vt__uz" lang="uz">${esc(v.uz)}</span>${v.note ? `<span class="vt__note">${esc(v.note)}</span>` : ""}</th>
        ${vtest ? hiddenCells(v) : formCells(v)}
        <td class="vt__say">${sayButton("say", v.au, v.tts || verbSay(v), `Tinglash: ${verbSay(v)}`)}</td>
      </tr>`;
  }

  function groupHTML(g) {
    const done = doneGroups.has(g.id);
    return `
      <article class="vgroup${done ? " is-done" : ""}" id="g-${g.id}" aria-labelledby="g-${g.id}-title">
        <header class="vgroup__head">
          <h3 class="vgroup__name" id="g-${g.id}-title" tabindex="-1">${esc(g.name)}</h3>
          <p class="vgroup__rule">${marked(g.rule)}</p>
        </header>
        <table class="vt" aria-labelledby="g-${g.id}-title">
          <thead><tr><th scope="col">1-shakl</th><th scope="col">2-shakl</th><th scope="col">3-shakl</th><th scope="col"><span class="sr-only">Tinglash</span></th></tr></thead>
          <tbody>${g.verbs.map(verbRow).join("")}</tbody>
        </table>
        <footer class="vgroup__foot">
          <button class="btn btn--ghost btn--sm" type="button" data-action="practice" data-group="${g.id}">${icon("play")}Mashq</button>
          <button class="done-toggle" type="button" data-action="done" data-group="${g.id}" aria-pressed="${done}">${icon("check")}Yodladim</button>
        </footer>
      </article>`;
  }

  const chip = (id) => {
    const g = GROUP[id];
    return g ? `<a class="chip${doneGroups.has(id) ? " is-done" : ""}" href="#/verbs/${id}" data-chip="${id}">${esc(g.name)}</a>` : "";
  };

  function planHTML() {
    const byDay = Object.fromEntries(VERBS.plan.map((p) => [p.day, p.new]));
    const rows = VERBS.plan.map((p) => {
      const count = p.new.reduce((n, id) => n + (GROUP[id]?.verbs.length || 0), 0);
      const reviews = [p.day - 1, p.day - 3, p.day - 6].filter((d) => d >= 1).flatMap((d) => byDay[d] || []);
      const fresh = p.new.length
        ? `<span class="plan__chips">${p.new.map(chip).join("")}</span><span class="plan__count">${count} ta fe’l</span>`
        : `<button class="btn btn--sm" type="button" data-action="practice" data-group="mix">${icon("shuffle")}Aralash mashq: hammasi</button>`;
      return `<tr role="row">
          <th scope="row" role="rowheader">${p.day}-kun</th>
          <td role="cell" data-label="Yangi guruhlar">${fresh}</td>
          <td role="cell" data-label="Takrorlash">${reviews.length ? `<span class="plan__chips">${reviews.map(chip).join("")}</span>` : '<span class="plan__none">—</span>'}</td>
        </tr>`;
    }).join("");
    return `
      <section class="plan" aria-labelledby="plan-title">
        <h2 class="vsec__title" id="plan-title">7 kunlik reja</h2>
        <p class="vsec__lead">Har kuni yangi guruhlarni o‘rganing va oldingilarini takrorlang: ertasiga va 3 kundan keyin. 7-kuni hammasini aralash mashq qiling, keyin 14- va 30-kuni yana bir bor.</p>
        <div class="plan__wrap">
          <table class="plan__table" role="table" aria-labelledby="plan-title">
            <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Kun</th><th scope="col" role="columnheader">Yangi guruhlar</th><th scope="col" role="columnheader">Takrorlash</th></tr></thead>
            <tbody role="rowgroup">${rows}</tbody>
          </table>
        </div>
      </section>`;
  }

  const METHOD = [
    ["Guruh bilan o‘rganing", "Xotira bir vaqtda 4–7 ta bo‘lakni ushlab tura oladi. Shuning uchun fe’llar bir xil o‘zgaradigan kichik guruhlarga bo‘lingan: guruh qoidasini tushunsangiz, undagi hamma fe’l yodda qoladi. O‘zgaradigan harflar sariq bilan belgilangan."],
    ["Eshiting va ovoz chiqarib ayting", "Tinglash tugmasini bosing va uchala shaklni ritm bilan 3 marta baland ovozda takrorlang: sing – sang – sung. Ovoz chiqarib aytilgan so‘z ichda o‘qilganidan yaxshiroq eslanadi."],
    ["Yopib, eslab ko‘ring", "Test rejimini yoqing: 2- va 3-shakl yashiriladi. Avval o‘zingiz eslang, keyin oching. Eslashga urinishning o‘zi xotirani qayta o‘qishdan ko‘ra kuchliroq mustahkamlaydi."],
    ["Oraliq bilan takrorlang", "Yangi guruhni ertasiga, 3 kundan keyin va bir haftadan keyin qayta tekshiring. Eng ko‘p unutish birinchi kunlarda bo‘ladi, shu kunlardagi takrorlash bilimni uzoq muddatli xotiraga o‘tkazadi."],
    ["Aralashtirib mashq qiling", "Bir nechta guruhni yodlagach, aralash mashqni bosing: fe’llar tasodifiy tartibda chiqadi va miya qaysi qoidani qo‘llashni farqlashga o‘rganadi."]
  ];

  function progressHTML() {
    const n = GROUPS.filter((g) => doneGroups.has(g.id)).length;
    return `<div class="vprogress" id="vprogress">
        <div class="vprogress__bar" aria-hidden="true"><span style="width:${Math.round((n / GROUPS.length) * 100)}%"></span></div>
        <p class="vprogress__text">Yodlandi: <b>${n}</b> / ${GROUPS.length} guruh</p>
      </div>`;
  }

  function verbsHTML() {
    const stages = VERBS.stages.map((s, i) => `
      <section class="stage" aria-labelledby="stage-${s.id}">
        <header class="stage__head">
          <span class="stage__n" aria-hidden="true">${i + 1}</span>
          <div>
            <h2 class="stage__title" id="stage-${s.id}"><span class="sr-only">${i + 1}-bosqich: </span>${esc(s.title)}</h2>
            <p class="stage__lead">${esc(s.lead)}</p>
          </div>
        </header>
        <div class="stage__groups">${s.groups.map(groupHTML).join("")}</div>
      </section>`).join("");
    return `
      <div class="verbs">
        <header class="verbs__head">
          <div class="verbs__intro">
            <h1 class="verbs__title view-heading" tabindex="-1">Noto‘g‘ri fe’llar</h1>
            <p class="verbs__lead">Jadvaldagi ${VERBS_TOTAL - 4} ta fe’l va ‑ed yoki ‑t bilan ishlatiladigan yana 4 tasi qanday o‘zgarishiga qarab ${GROUPS.length} ta kichik guruhga ajratildi. Osondan qiyinga qarab, kuniga 2–4 guruhdan o‘rgansangiz, 7 kunda hammasi yodda bo‘ladi.</p>
          </div>
          <div class="verbs__panel">
            ${progressHTML()}
            <div class="verbs__actions">
              <button class="btn" type="button" data-action="practice" data-group="mix">${icon("shuffle")}Aralash mashq</button>
              <button class="toggle" type="button" data-action="vtest" aria-pressed="${vtest}">${icon(vtest ? "eye" : "eyeOff")}<span>${vtest ? "Hammasini ko‘rsatish" : "Test rejimi"}</span></button>
            </div>
          </div>
        </header>

        <section class="method" aria-labelledby="method-title">
          <h2 class="vsec__title" id="method-title">Qanday yodlash kerak</h2>
          <ol class="method__steps">
            ${METHOD.map(([t, d]) => `<li><h3 class="method__step">${t}</h3><p>${d}</p></li>`).join("")}
          </ol>
          <p class="method__src">Ilmiy asos: Miller (1956) va Cowan (2001), xotira hajmi; MacLeod va boshq. (2010), ovoz chiqarib aytish samarasi; Roediger va Karpicke (2006), eslash orqali o‘rganish; Cepeda va boshq. (2006), oraliqli takrorlash; Rohrer va Taylor (2007), aralash mashq.</p>
        </section>

        ${planHTML()}
        ${stages}
      </div>`;
  }

  function refreshVerbProgress() {
    const box = document.getElementById("vprogress");
    if (box) box.outerHTML = progressHTML();
    main.querySelectorAll(".vgroup").forEach((el) => {
      const id = el.id.slice(2);
      const done = doneGroups.has(id);
      el.classList.toggle("is-done", done);
      el.querySelector('[data-action="done"]')?.setAttribute("aria-pressed", String(done));
    });
    main.querySelectorAll("[data-chip]").forEach((c) => c.classList.toggle("is-done", doneGroups.has(c.dataset.chip)));
  }

  function applyVerbTest() {
    main.querySelectorAll(".vt tbody tr").forEach((tr) => {
      const v = VERB[tr.querySelector(".vt__v1 [lang=en]")?.textContent];
      if (!v) return;
      const hidden = tr.querySelector(".vt__hidden");
      if (vtest && !hidden) {
        tr.querySelectorAll(".vt__f").forEach((td, i) => { if (i === 0) td.outerHTML = hiddenCells(v); else td.remove(); });
      } else if (!vtest && hidden) {
        hidden.outerHTML = formCells(v);
      }
    });
    const t = main.querySelector('[data-action="vtest"]');
    if (t) {
      t.setAttribute("aria-pressed", String(vtest));
      t.innerHTML = `${icon(vtest ? "eye" : "eyeOff")}<span>${vtest ? "Hammasini ko‘rsatish" : "Test rejimi"}</span>`;
    }
  }

  /* ---------- practice (flashcards with "again" re-queue) ---------- */
  let pr = null;
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function startPractice(groupId) {
    if (!canPractice) return;
    let pool, title;
    if (groupId === "mix") {
      const learned = GROUPS.filter((g) => doneGroups.has(g.id));
      const src = learned.length >= 2 ? learned : GROUPS;
      pool = shuffle(src.flatMap((g) => g.verbs.slice())).slice(0, 15);
      title = learned.length >= 2 ? "Aralash mashq: yodlangan guruhlar" : "Aralash mashq";
    } else {
      const g = GROUP[groupId];
      if (!g) return;
      pool = shuffle(g.verbs.slice());
      title = `Mashq: ${g.name}`;
    }
    pr = { groupId, title, queue: pool, total: pool.length, known: 0, again: 0, revealed: false };
    renderPractice();
    if (!dlg.open) dlg.showModal();
    focusPractice();
  }

  function renderPractice() {
    const { title, queue, total, known, again, revealed, groupId } = pr;
    const top = `
      <form method="dialog" class="practice__top">
        <h2 class="practice__title" id="practice-title">${esc(title)}</h2>
        <button class="practice__close" value="close" aria-label="Yopish">${icon("x")}</button>
      </form>
      <div class="practice__meter" aria-hidden="true"><span style="width:${Math.round((known / total) * 100)}%"></span></div>
      <p class="practice__count"><span class="sr-only">Topilgan: </span>${known} / ${total}</p>`;
    if (!queue.length) {
      const g = GROUP[groupId];
      dlg.innerHTML = `${top}
        <div class="practice__done" role="status">
          <p class="practice__big">Tayyor!</p>
          <p>${total} ta fe’lning hammasini esladingiz. ${again ? `Bilmaganlaringiz ${again} marta qayta so‘raldi: ularni ertaga yana takrorlang.` : "Hammasini birinchi urinishdayoq topdingiz."}</p>
        </div>
        <div class="practice__actions">
          ${g && !doneGroups.has(g.id) ? `<button class="btn" type="button" data-action="pr-mark" data-autofocus>${icon("check")}Guruhni yodladim</button>` : ""}
          <button class="btn btn--ghost" type="button" data-action="pr-restart"${g && !doneGroups.has(g.id) ? "" : " data-autofocus"}>${icon("again")}Qaytadan</button>
        </div>`;
      return;
    }
    const v = queue[0];
    const slot = (label, sub, form) => `
      <div class="practice__slot">
        <span class="practice__label">${label} <span lang="en">${sub}</span></span>
        <span class="practice__form${revealed ? "" : " is-blank"}" lang="en">${revealed ? marked(form) : "?"}</span>
      </div>`;
    dlg.innerHTML = `${top}
      <div class="practice__card">
        <p class="practice__v1" lang="en"><span>${esc(v.v1)}</span></p>
        <p class="practice__uz" lang="uz">${esc(v.uz)}</p>
        <div class="practice__forms" aria-live="polite">
          ${slot("2-shakl", "past simple", v.v2)}
          ${slot("3-shakl", "past participle", v.v3)}
        </div>
        ${revealed ? "" : '<p class="practice__hint">Ikkala shaklni ovoz chiqarib ayting, keyin javobni oching.</p>'}
      </div>
      <div class="practice__actions">
        ${revealed
          ? `${sayButton("say say--lg", v.au, v.tts || verbSay(v), `Tinglash: ${verbSay(v)}`)}
             <button class="btn btn--ghost" type="button" data-action="pr-again">${icon("again")}Bilmadim</button>
             <button class="btn" type="button" data-action="pr-know" data-autofocus>${icon("check")}Bildim</button>`
          : `<button class="btn" type="button" data-action="pr-reveal" data-autofocus>${icon("eye")}Javobni ko‘rish</button>`}
      </div>`;
  }

  const focusPractice = () => dlg?.querySelector("[data-autofocus]")?.focus();

  function practiceAction(action) {
    if (!pr) return;
    if (action === "pr-reveal") {
      pr.revealed = true;
    } else if (action === "pr-know") {
      pr.queue.shift(); pr.known++; pr.revealed = false;
    } else if (action === "pr-again") {
      const v = pr.queue.shift();
      pr.queue.splice(Math.min(3, pr.queue.length), 0, v);
      pr.again++; pr.revealed = false;
    } else if (action === "pr-restart") {
      startPractice(pr.groupId); return;
    } else if (action === "pr-mark") {
      doneGroups.add(pr.groupId); saveDone(); refreshVerbProgress();
      renderPractice();
      focusPractice();
      return;
    }
    stopAudio();
    renderPractice();
    focusPractice();
  }

  dlg?.addEventListener("close", () => { pr = null; stopAudio(); dlg.returnValue = ""; });

  /* ---------- quiz overlays (word cards) ---------- */
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
    const h = location.hash;
    const m = h.match(/^#\/unit\/(\d{1,2})(?:\/w\/(\d{1,2}))?\/?$/);
    if (m) {
      const unit = Number(m[1]);
      if (unit >= 1 && unit <= UNITS.length) return { view: "unit", unit, word: m[2] ? Number(m[2]) : null };
    }
    const v = h.match(/^#\/verbs(?:\/([a-z0-9]+))?\/?$/);
    if (v && GROUPS.length) return { view: "verbs", group: v[1] && GROUP[v[1]] ? v[1] : null };
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
    const vl = document.querySelector(".masthead__link");
    if (vl) {
      if (route.view === "verbs") vl.setAttribute("aria-current", "page");
      else vl.removeAttribute("aria-current");
    }
  }

  let lastView = "";
  function update(route) {
    const sameVerbs = route.view === "verbs" && lastView === "verbs" && main.querySelector(".verbs");
    if (!sameVerbs) {
      main.innerHTML = route.view === "unit" ? unitHTML(route.unit) : route.view === "verbs" ? verbsHTML() : homeHTML();
    }
    lastView = route.view;
    document.title = route.view === "unit" ? `Unit ${route.unit} — Essential Words 1`
      : route.view === "verbs" ? "Noto‘g‘ri fe’llar — Essential Words 1"
      : "Essential Words 1 — rasmli lug‘at";
    markNav(route);
    if (route.view === "unit") applyQuiz();
    if (route.view === "unit" && route.word) {
      const card = document.getElementById(`w-${route.unit}-${route.word}`);
      card?.classList.add("is-target");
      card?.scrollIntoView({ block: "center" });
    } else if (route.view === "verbs" && route.group) {
      main.querySelectorAll(".vgroup.is-target").forEach((el) => el.classList.remove("is-target"));
      const g = document.getElementById(`g-${route.group}`);
      g?.classList.add("is-target");
      g?.scrollIntoView({ block: "start" });
    } else if (!sameVerbs) {
      window.scrollTo(0, 0);
    }
  }

  function focusAfter(route) {
    const target = route.view === "unit" && route.word
      ? document.querySelector(`#w-${route.unit}-${route.word} .card__word`)
      : route.view === "verbs" && route.group
        ? document.getElementById(`g-${route.group}-title`)
        : main.querySelector(".view-heading");
    target?.focus({ preventScroll: true });
  }

  let first = true;
  function render() {
    const route = parseRoute();
    stopAudio();
    if (first) { first = false; update(route); if (route.word || route.group) focusAfter(route); return; }
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const inPage = route.view === "verbs" && lastView === "verbs";
    if (!document.startViewTransition || reduce || inPage) { update(route); focusAfter(route); return; }
    const t = document.startViewTransition(() => update(route));
    t.finished.finally(() => focusAfter(route));
  }

  /* ---------- events ---------- */
  document.addEventListener("click", (e) => {
    const say = e.target.closest("[data-say]");
    if (say) { pronounce(say); return; }
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
    } else if (action === "vtest") {
      vtest = !vtest;
      store.set("ew1-verbs-test", vtest ? "1" : "0");
      applyVerbTest();
    } else if (action === "vreveal") {
      const v = VERB[act.dataset.verb];
      const td = act.closest("td");
      if (v && td) {
        const tr = td.parentElement;
        td.outerHTML = formCells(v);
        tr.querySelector(".vt__f")?.focus({ preventScroll: true });
      }
    } else if (action === "done") {
      const id = act.dataset.group;
      if (doneGroups.has(id)) doneGroups.delete(id); else doneGroups.add(id);
      saveDone();
      refreshVerbProgress();
    } else if (action === "practice") {
      startPractice(act.dataset.group);
    } else if (action.startsWith("pr-")) {
      practiceAction(action);
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
