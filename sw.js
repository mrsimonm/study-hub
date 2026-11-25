// Study Hub offline support: caches the unified shell and Bio Hub, Eco Hub and Geology Hub.
// Bump V when you change root shell files or switcher.js. Content files (json, md, js, html)
// are fetched fresh when online and served from cache when offline.
const V = "study-hub-v2";
const SHELL = [
  "./", "./index.html", "./switcher.js", "./manifest.webmanifest",
  "./lib/firebase-config.js", "./lib/firebase-sync.js",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png",
  "./bio/", "./bio/index.html", "./bio/app.js", "./bio/lib/lecture-lib.js", "./bio/lib/cat.js",
  "./bio/lib/firebase-config.js", "./bio/lib/firebase-sync.js", "./bio/courses/bio/course.json",
  "./eco/", "./eco/index.html", "./eco/app.js", "./eco/lib/lecture-lib.js", "./eco/lib/path.js",
  "./eco/lib/cat.js", "./eco/lib/tickall.js", "./eco/lib/firebase-config.js", "./eco/lib/firebase-sync.js",
  "./eco/courses/eco/course.json",
  "./geo/", "./geo/index.html", "./geo/app.js", "./geo/lib/lecture-lib.js", "./geo/lib/cat.js",
  "./geo/lib/slides.js", "./geo/lib/firebase-config.js", "./geo/lib/firebase-sync.js",
  "./geo/topics/t1.js", "./geo/topics/t2.js", "./geo/topics/t3.js",
  "./geo/topics/t4.js", "./geo/topics/t5.js", "./geo/topics/t6.js",
  "./geo/courses/geology/course.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith("study-hub-") && k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function navFallback(pathname) {
  if (/\/bio(\/|$)/.test(pathname)) return caches.match("./bio/index.html");
  if (/\/eco(\/|$)/.test(pathname)) return caches.match("./eco/index.html");
  if (/\/geo(\/|$)/.test(pathname)) return caches.match("./geo/index.html");
  return caches.match("./index.html");
}

self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  const same = u.origin === location.origin;
  const fonts = u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com";
  const fbSdk = u.hostname === "www.gstatic.com" && u.pathname.startsWith("/firebasejs/10.14.1/");
  const cdn = u.hostname === "cdnjs.cloudflare.com" && (
    u.pathname.startsWith("/ajax/libs/pdf.js/3.11.174/") ||
    u.pathname.startsWith("/ajax/libs/KaTeX/0.16.9/")
  );
  if (!same && !fonts && !fbSdk && !cdn) return;
  const put = (res) => {
    if (res.ok || res.type === "opaque") {
      const cp = res.clone();
      caches.open(V).then((c) => c.put(r, cp));
    }
    return res;
  };
  if (fonts || fbSdk || cdn || /\.(png|jpg|woff2?)$/.test(u.pathname)) {
    e.respondWith(caches.match(r).then((m) => m || fetch(r).then(put)));
    return;
  }
  e.respondWith(
    fetch(r, { cache: "no-cache" })
      .then(put)
      .catch(() => caches.match(r, { ignoreSearch: r.mode === "navigate" }).then((m) => m || (r.mode === "navigate" ? navFallback(u.pathname) : Response.error())))
  );
});
