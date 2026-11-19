/* Offline support. Pages, code and word data come from the network first, so words pushed
   to GitHub show up on the next open; pictures and audio are served from cache and refreshed
   in the background. */
const VERSION = "ew1-v1";
const CORE = ["./", "index.html", "styles.css", "app.js", "data/words.js", "data/verbs.js", "favicon.svg", "manifest.webmanifest", "icons/icon-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const isMedia = (url) => /\/(images|audio|icons)\//.test(url.pathname);

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;           // fonts etc. go straight to the network
  if (req.headers.has("range")) return;                 // let the browser stream audio ranges itself

  if (isMedia(url)) {
    // cache first, refresh in the background
    e.respondWith(caches.open(VERSION).then(async (c) => {
      const hit = await c.match(req);
      const fresh = fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || fresh;
    }));
    return;
  }
  // network first for pages, code and data
  e.respondWith(fetch(req, { cache: "no-cache" })
    .then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    })
    .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("index.html"))));
});
