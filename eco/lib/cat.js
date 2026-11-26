/* Generated from hub-kit/shell, edit there (then run: node ~/Projects/hub-kit/tools/build.js all). */
/* Unified Study Cat for Study Hub: one pixel-art cat shared across the landing page and every subject.
   Studying ANY subject feeds this same cat: total XP = the sum of every subject's XP (HUB_SOURCES, generated from subjects.json).
   Spending XP in the Shop never lowers your level: spendable XP = combined XP - XP spent.
   Saved locally in "studyHub.cat" (migrating any existing per-subject <id>Hub.cat on first run)
   and synced across devices in Firestore at users/{uid}/hubs/cat (seeding from users/{uid}.cat if needed). */
(function () {
  "use strict";
  var G = window.GEO || null;
  var KEY = "studyHub.cat";
  /* HUB:BEGIN */
  var HUB_SOURCES = [
    { id: "bio", key: "bioHub.v1", short: "Bio", hubDoc: "bio" },
    { id: "eco", key: "ecoHub.v1", short: "Eco", hubDoc: "eco" },
    { id: "geo", key: "geoHub.v1", short: "Geo", hubDoc: "" }
  ];
  /* HUB:END */
  var LEGACY_KEYS = HUB_SOURCES.map(function (h) { return h.key.replace(/\.v\d+$/, ".cat"); });
  var HUB_RE = HUB_SOURCES.length ? new RegExp("\\/(" + HUB_SOURCES.map(function (h) { return h.id; }).join("|") + ")(?:\\/|$)") : null;
  var XP_ACROSS = (function (n) { return n.length > 1 ? n.slice(0, -1).join(", ") + " &amp; " + n[n.length - 1] : (n[0] || "all subjects"); })(HUB_SOURCES.map(function (h) { return esc(h.short); }));
  var GOAL = (G && G.GOAL) || 150;

  var $ = function (id) { return document.getElementById(id); };
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function isObj(x) { return x && typeof x === "object" && !Array.isArray(x); }
  function reduced() { return !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }

  function lvOf(x) {
    if (G && G.lvOf) return G.lvOf(x);
    var n = 0, need = 100;
    while (x >= need) { x -= need; n++; need = 100 + n * 50; }
    return { n: n, into: x, need: need };
  }
  function dstr(d) { return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function todayStr() { return (G && G.today) ? G.today() : dstr(new Date()); }

  function activeHubId() {
    var s = document.querySelector("script[data-hub]");
    if (s && s.getAttribute("data-hub")) return s.getAttribute("data-hub");
    var m = HUB_RE && HUB_RE.exec(location.pathname);
    return m ? m[1] : "";
  }

  function parseDateKey(str) {
    var p = /^(\d+)-(\d+)-(\d+)$/.exec(String(str || ""));
    if (!p) return 0;
    return new Date(+p[1], +p[2] - 1, +p[3]).getTime();
  }

  function hubStateOf(h) {
    var cur = activeHubId(), local = null, prev = null;
    if (cur === h.id && G && G._getState) {
      local = G._getState();
    } else {
      try { local = JSON.parse(localStorage.getItem(h.key) || "null"); } catch (e) {}
    }
    try {
      var pm = JSON.parse(localStorage.getItem("studyHub.cloudPreview") || "null");
      if (pm && isObj(pm[h.id])) prev = pm[h.id];
    } catch (e) {}
    if (!isObj(local)) return isObj(prev) ? prev : {};
    if (!isObj(prev)) return local;
    var td = todayStr();
    var lDay = isObj(local.day) && local.day.d === td ? (+local.day.xp || 0) : 0;
    var pDay = isObj(prev.day) && prev.day.d === td ? (+prev.day.xp || 0) : 0;
    var lLast = isObj(local.streak) ? String(local.streak.last || "") : "";
    var pLast = isObj(prev.streak) ? String(prev.streak.last || "") : "";
    return {
      xp: Math.max(+local.xp || 0, +prev.xp || 0),
      day: { d: td, xp: Math.max(lDay, pDay) },
      streak: { last: parseDateKey(pLast) > parseDateKey(lLast) ? pLast : lLast }
    };
  }

  function xpNow() {
    var sum = 0;
    HUB_SOURCES.forEach(function (h) { sum += +hubStateOf(h).xp || 0; });
    return sum;
  }

  function dayXP() {
    var td = todayStr(), sum = 0;
    HUB_SOURCES.forEach(function (h) {
      var s = hubStateOf(h);
      if (isObj(s.day) && s.day.d === td) sum += +s.day.xp || 0;
    });
    return sum;
  }

  function latestStudyTime() {
    var best = 0;
    HUB_SOURCES.forEach(function (h) {
      var s = hubStateOf(h);
      var t1 = isObj(s.streak) ? parseDateKey(s.streak.last) : 0;
      var t2 = isObj(s.day) && (+s.day.xp || 0) > 0 ? parseDateKey(s.day.d) : 0;
      if (t1 > best) best = t1;
      if (t2 > best) best = t2;
    });
    return best;
  }

  function showToast(msg) {
    if (G && G.toast) { G.toast(msg); return; }
    var h = $("toasts");
    if (!h) {
      h = document.createElement("div");
      h.id = "toasts";
      h.style.cssText = "position:fixed;left:50%;transform:translateX(-50%);bottom:32px;z-index:60;display:flex;flex-direction:column;gap:6px;align-items:center;pointer-events:none";
      document.body.appendChild(h);
    }
    var d = document.createElement("div");
    d.style.cssText = "background:var(--ink);color:var(--bg);font-weight:700;border-radius:99px;padding:7px 16px;font-size:.95rem;box-shadow:0 6px 20px rgba(0,0,0,.2)";
    d.textContent = msg;
    h.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 1800);
  }

  function showConfetti() {
    if (G && G.confetti) { G.confetti(); return; }
    if (reduced()) return;
    var c = document.createElement("div");
    c.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:55;overflow:hidden";
    var cols = ["#F2C14E", "#5FD39A", "#8CC4DC", "#E39BDD", "#F59A73", "#9C93F2"];
    for (var i = 0; i < 36; i++) {
      var p = document.createElement("i");
      p.style.cssText = "position:absolute;top:-12px;width:9px;height:14px;border-radius:2px;left:" + (Math.random() * 100) + "%;background:" + cols[i % cols.length] + ";transition:transform 1.5s ease-in,opacity 1.5s ease-in";
      c.appendChild(p);
      (function (el) {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            el.style.transform = "translateY(105vh) rotate(520deg)";
            el.style.opacity = "0.6";
          });
        });
      })(p);
    }
    document.body.appendChild(c);
    setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 2000);
  }

  /* ---------- catalogue: everything is bought with XP ---------- */
  var COAT = {
    orange: { n: "Orange tabby", b: "--k-or", l: "--k-orl", d: "--k-ord", pat: "tabby", cost: 0 },
    grey: { n: "Grey tabby", b: "--k-gr", l: "--k-grl", d: "--k-grd", pat: "tabby", cost: 0 },
    black: { n: "Black cat", b: "--k-bk", l: "--k-bkl", d: "--k-bkd", pat: "none", cost: 0 },
    white: { n: "Snow white", b: "--k-wh", l: "--k-whl", d: "--k-whd", pat: "none", cost: 150 },
    tuxedo: { n: "Tuxedo", b: "--k-bk", l: "--k-whl", d: "--k-bkd", pat: "tuxedo", cost: 180 },
    cream: { n: "Ginger cream", b: "#F7D9B4", l: "#FFF4E4", d: "#C99F72", pat: "tabby", cost: 200 },
    siamese: { n: "Siamese", b: "#F3E5D0", l: "#FFF8EE", d: "#B89F82", pat: "siamese", cost: 220 },
    calico: { n: "Calico", b: "--k-wh", l: "--k-whl", d: "--k-whd", pat: "calico", cost: 250 },
    tortie: { n: "Tortoiseshell", b: "--k-bk", l: "--k-orl", d: "--k-bkd", pat: "tortie", cost: 280 },
    galaxy: { n: "Starry galaxy", b: "#262B54", l: "#4B528C", d: "#141733", pat: "galaxy", cost: 500 }
  };
  var ITEMS = [
    { id: "yarn", kind: "room", n: "Yarn ball", cost: 40, vb: "17 71 20 14" },
    { id: "bowls", kind: "room", n: "Food & water bowls", cost: 50, vb: "101 76 19 12" },
    { id: "dice", kind: "room", n: "Dice toy", cost: 60, vb: "81 73 12 12" },
    { id: "mouse", kind: "room", n: "Toy mouse", cost: 70, vb: "2 78 16 10" },
    { id: "plant", kind: "room", n: "Big plant", cost: 80, vb: "0 55 18 24" },
    { id: "clock", kind: "room", n: "Wall clock", cost: 90, vb: "51 7 18 18" },
    { id: "rug", kind: "room", n: "Cosy rug", cost: 100, vb: "16 73 88 16" },
    { id: "crystals", kind: "room", n: "Rock & crystal collection", cost: 110, vb: "10 36 28 10" },
    { id: "bed", kind: "room", n: "Cat bed", cost: 120, vb: "34 72 52 14" },
    { id: "books", kind: "room", n: "Stack of textbooks", cost: 130, vb: "30 76 18 12" },
    { id: "lights", kind: "room", n: "Fairy lights", cost: 150, vb: "0 0 46 12" },
    { id: "scratcher", kind: "room", n: "Scratching post", cost: 160, vb: "72 48 16 32" },
    { id: "pothos", kind: "room", n: "Hanging pothos", cost: 170, vb: "108 2 12 29" },
    { id: "poster", kind: "room", n: "Chart poster", cost: 180, vb: "82 6 30 24" },
    { id: "shelf", kind: "room", n: "Bookshelf", cost: 200, vb: "78 28 38 18" },
    { id: "corkboard", kind: "room", n: "Study corkboard", cost: 220, vb: "52 26 26 19" },
    { id: "terrarium", kind: "room", n: "Terrarium jar", cost: 240, vb: "1 47 14 15" },
    { id: "desk", kind: "room", n: "Study desk", cost: 250, vb: "13 44 36 37" },
    { id: "microscope", kind: "room", n: "Microscope", cost: 280, vb: "89 72 14 15" },
    { id: "tank", kind: "room", n: "Fish tank", cost: 300, vb: "85 45 36 37" },
    { id: "lava", kind: "room", n: "Lava lamp", cost: 320, vb: "43 53 11 24" },
    { id: "trophy", kind: "room", n: "Golden diploma", cost: 450, vb: "66 7 17 18" },
    { id: "collar", kind: "wear", slot: "neck", n: "Bell collar", cost: 50 },
    { id: "bow", kind: "wear", slot: "neck", n: "Bow tie", cost: 60 },
    { id: "bandana", kind: "wear", slot: "neck", n: "Bandana", cost: 80 },
    { id: "glasses", kind: "wear", slot: "face", n: "Nerd glasses", cost: 100 },
    { id: "scarf", kind: "wear", slot: "neck", n: "Cozy scarf", cost: 120 },
    { id: "shades", kind: "wear", slot: "face", n: "Cool sunglasses", cost: 120 },
    { id: "beanie", kind: "wear", slot: "head", n: "Cozy beanie", cost: 130 },
    { id: "monocle", kind: "wear", slot: "face", n: "Monocle", cost: 150 },
    { id: "headphones", kind: "wear", slot: "head", n: "Headphones", cost: 180 },
    { id: "cap", kind: "wear", slot: "head", n: "Graduation cap", cost: 200 },
    { id: "flower", kind: "wear", slot: "head", n: "Flower crown", cost: 220 },
    { id: "wizard", kind: "wear", slot: "head", n: "Wizard hat", cost: 300 },
    { id: "crown", kind: "wear", slot: "head", n: "Crown", cost: 400 }
  ];
  var IT = {}; ITEMS.forEach(function (x) { IT[x.id] = x; });

  /* ---------- the cat's saved state ---------- */
  function fresh() { return { name: "Biscuit", coat: "orange", worn: {}, spent: 0, items: {}, off: {}, lv: -1, stg: -1, goalD: "" }; }
  var C = fresh();
  function sanitize(m) {
    var f = fresh();
    if (!isObj(m)) return f;
    return {
      name: typeof m.name === "string" && m.name ? m.name.slice(0, 16) : f.name,
      coat: typeof m.coat === "string" && COAT[m.coat] ? m.coat : f.coat,
      worn: isObj(m.worn) ? Object.assign({}, m.worn) : {},
      spent: Math.max(0, +m.spent || 0),
      items: isObj(m.items) ? Object.assign({}, m.items) : {},
      off: isObj(m.off) ? Object.assign({}, m.off) : {},
      lv: m.lv == null ? -1 : +m.lv,
      stg: m.stg == null ? -1 : +m.stg,
      goalD: String(m.goalD || "").slice(0, 20)
    };
  }
  function adopt(m) {
    if (!isObj(m)) return;
    C = sanitize(m);
  }
  function merge(a, b) {
    a = sanitize(a); b = sanitize(b);
    var o = sanitize(a);
    if (o.name === "Biscuit" && b.name && b.name !== "Biscuit") o.name = b.name;
    if (o.coat === "orange" && b.coat && b.coat !== "orange") o.coat = b.coat;
    o.worn = Object.assign({}, b.worn || {}, a.worn || {});
    o.spent = Math.max(+a.spent || 0, +b.spent || 0);
    o.items = Object.assign({}, b.items || {}, a.items || {});
    o.off = Object.assign({}, b.off || {}, a.off || {});
    o.lv = Math.max(a.lv == null ? -1 : +a.lv, b.lv == null ? -1 : +b.lv);
    o.stg = Math.max(a.stg == null ? -1 : +a.stg, b.stg == null ? -1 : +b.stg);
    o.goalD = (a.goalD || "") >= (b.goalD || "") ? (a.goalD || "") : (b.goalD || "");
    return o;
  }
  function hasCatProgress(m) {
    return !!(isObj(m) && ((+m.spent || 0) > 0 || (isObj(m.items) && Object.keys(m.items).length) || (m.name && m.name !== "Biscuit") || (m.coat && m.coat !== "orange") || (+m.lv >= 0)));
  }

  function store() { try { localStorage.setItem(KEY, JSON.stringify(C)); } catch (e) {} }

  /* Load studyHub.cat, or migrate any existing per-hub cats on first run. */
  (function initLocal() {
    var existing = null;
    try { existing = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
    if (isObj(existing)) {
      adopt(existing);
      return;
    }
    var migrated = null;
    LEGACY_KEYS.forEach(function (k) {
      try {
        var old = JSON.parse(localStorage.getItem(k) || "null");
        if (isObj(old)) migrated = migrated ? merge(old, migrated) : sanitize(old);
      } catch (e) {}
    });
    if (migrated) {
      adopt(migrated);
      store();
    }
  })();

  /* ---------- dedicated Firestore sync (users/{uid}/hubs/cat) ---------- */
  var cloudDb = null, cloudUid = "", cloudUnsub = null, cloudTimer = null;

  function pushCloudNow() {
    if (!cloudDb || !cloudUid || !window.firebase) return;
    cloudDb.collection("users").doc(cloudUid).collection("hubs").doc("cat").set({
      cat: sanitize(C),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(function (e) {
      console.error("Study Cat cloud save failed:", e);
    });
  }

  function scheduleCloudSave() {
    if (!cloudDb || !cloudUid) return;
    clearTimeout(cloudTimer);
    cloudTimer = setTimeout(pushCloudNow, 800);
  }

  function save() {
    store();
    scheduleCloudSave();
  }

  function startCatCloud(info) {
    if (!info || !info.user || !info.db) {
      if (cloudUnsub) { cloudUnsub(); cloudUnsub = null; }
      cloudDb = null; cloudUid = "";
      return;
    }
    if (cloudUid === info.user.uid && cloudUnsub) return;
    if (cloudUnsub) { cloudUnsub(); cloudUnsub = null; }
    cloudDb = info.db;
    cloudUid = info.user.uid;
    var uref = cloudDb.collection("users").doc(cloudUid);
    var cref = uref.collection("hubs").doc("cat");
    var first = true;

    cloudUnsub = cref.onSnapshot(function (snap) {
      if (snap.metadata && snap.metadata.hasPendingWrites) return;
      var data = (snap.exists && snap.data()) || null;
      var remoteCat = data && isObj(data.cat) ? data.cat : null;

      if (first) {
        first = false;
        if (remoteCat) {
          var m = hasCatProgress(C) ? merge(C, remoteCat) : sanitize(remoteCat);
          adopt(m);
          store();
          chip();
          if (open) render();
          if (JSON.stringify(sanitize(m)) !== JSON.stringify(sanitize(remoteCat))) pushCloudNow();
          return;
        }
        /* First time using unified Study Cat in the cloud: check legacy users/{uid}.cat (e.g. Geo Hub) too. */
        var seedRefs = HUB_SOURCES.filter(function (h) { return h.hubDoc; }).map(function (h) { return uref.collection("hubs").doc(h.hubDoc); });
        seedRefs.push(uref); // users/{uid} last, so a legacy root-level cat (e.g. Geo Hub) wins
        Promise.all(seedRefs.map(function (r) { return r.get().catch(function () { return null; }); })).then(function (snaps) {
          var seed = hasCatProgress(C) ? sanitize(C) : null;
          snaps.forEach(function (s) {
            var d = s && s.exists && s.data();
            if (d && isObj(d.cat)) seed = seed ? merge(d.cat, seed) : sanitize(d.cat);
          });
          if (seed) {
            adopt(seed);
            store();
            chip();
            if (open) render();
            pushCloudNow();
          } else if (hasCatProgress(C)) {
            pushCloudNow();
          }
        });
        return;
      }

      if (remoteCat) {
        adopt(remoteCat);
        store();
        chip();
        if (open) render();
      }
    }, function (e) {
      console.error("Study Cat listener error:", e);
    });
  }

  /* ---------- XP to spend, growth stages, mood ---------- */
  function bal() { return Math.max(0, xpNow() - C.spent); }
  function cumXP(n) { return 100 * n + 25 * n * (n - 1); }
  var STAGES = [{ name: "Kitten", lv: 0 }, { name: "Young cat", lv: 2 }, { name: "House cat", lv: 4 }, { name: "Chonky legend", lv: 7 }];
  function stageIdx() { var n = lvOf(xpNow()).n, k = 0; STAGES.forEach(function (s, i) { if (n >= s.lv) k = i; }); return k; }
  function daysOff() {
    var last = latestStudyTime();
    if (!last) return -1;
    var b = new Date(); b = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((b.getTime() - last) / 864e5);
  }
  function mood() { var d = daysOff(); return d < 0 ? "hello" : d <= 0 ? "purr" : d < 3 ? "sleepy" : "grumpy"; }
  function moodLine() {
    var d = daysOff(), n = esc(C.name);
    if (d < 0) return n + " is new here and curious. Earn XP in any subject and watch them grow.";
    if (d <= 0) return n + " is purring. You studied today. 💛";
    if (d < 3) return n + " is sleepy. One quick quiz in any subject wakes them up.";
    return n + " is a bit grumpy after " + d + " days without you. One quiz fixes it.";
  }

  /* ---------- pixel drawing helpers ---------- */
  function v(x) { return x && x.charAt(0) === "-" ? "var(" + x + ")" : x; }
  var PAL = { o: "--k-eye", e: "--k-eye", a: "--k-frame", b: "--k-bed", B: "--k-bed2", c: "--k-cloud", d: "--k-wood2", w: "--k-wood", f: "--k-fish", g: "--k-gold", G: "--k-goldd",
    l: "--k-leaf", L: "--k-leaf2", p: "--k-pot", P: "--k-potd", r: "--k-rug", R: "--k-rug2", s: "--k-sun", t: "--k-water", y: "--k-yarn", k: "--k-pink", x: "#fff",
    z: "--k-base", h: "--k-wall1", H: "--k-wall2", K: "--k-wall3", u: "--k-curtain", U: "--k-curtain2", i: "--k-hill", I: "--k-hill2", v: "--k-star", V: "--k-dust", S: "--k-screen", q: "--k-sky1", Q: "--k-sky2", F: "--k-floor", j: "--k-floor2", m: "--k-cap", M: "--k-capd", n: "--k-bow", N: "--k-bowd",
    C: "#C99762", D: "#7A4B2A", A: "#9B6FD9", E: "#C9A4FF", W: "#6642A3", T: "#34427A", Z: "#212B52", X: "#E04F5F", Y: "#B23242", O: "#FF9A4D", J: "#D9E5EC", "1": "#8796A4", "2": "#515D6B" };
  function fillOf(c) { var p = PAL[c] || c; return p.charAt(0) === "-" ? v(p) : p; }
  function rect(x, y, w, h, c) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" style="fill:' + fillOf(c) + '"/>'; }
  function sprite(rows, x0, y0) {
    var h = "";
    rows.forEach(function (row, y) {
      var x = 0;
      while (x < row.length) {
        var c = row.charAt(x), s = x;
        while (x < row.length && row.charAt(x) === c) x++;
        if (c !== ".") h += rect(x0 + s, y0 + y, x - s, 1, c);
      }
    });
    return h;
  }
  function inEll(x, y, cx, cy, rx, ry) { var dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; return dx * dx + dy * dy <= 1; }
  function pxEll(cx, cy, rx, ry, c, border, dash) {
    var h = "";
    for (var y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      var run = null;
      for (var x = Math.floor(cx - rx) - 1; x <= Math.ceil(cx + rx) + 1; x++) {
        var col = null;
        if (inEll(x, y, cx, cy, rx, ry)) {
          col = c;
          if (border && !(inEll(x - 1, y, cx, cy, rx, ry) && inEll(x + 1, y, cx, cy, rx, ry) && inEll(x, y - 1, cx, cy, rx, ry) && inEll(x, y + 1, cx, cy, rx, ry)) && (!dash || (x + y) % 3 !== 0)) col = border;
        }
        if (run && run.c === col) { run.w++; continue; }
        if (run && run.c) h += rect(run.x, y, run.w, 1, run.c);
        run = { x: x, w: 1, c: col };
      }
      if (run && run.c) h += rect(run.x, y, run.w, 1, run.c);
    }
    return h;
  }
  function inTri(x, y, a, b, c) {
    var px = x + 0.5, py = y + 0.5;
    function s(p1, p2) { return (px - p2[0]) * (p1[1] - p2[1]) - (p1[0] - p2[0]) * (py - p2[1]); }
    var d1 = s(a, b), d2 = s(b, c), d3 = s(c, a);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  }

  /* ---------- the pixel cat ---------- */
  var CW = 48, CH = 44, CX = 24, GY = 42;
  var SP = [
    { hx: 8, hy: 6.6, bx: 6, by: 5, ear: 5, t: 0.8 },
    { hx: 9, hy: 7.2, bx: 7.5, by: 6.5, ear: 5, t: 1 },
    { hx: 10, hy: 8, bx: 9.5, by: 8.5, ear: 6, t: 1.2 },
    { hx: 10.5, hy: 8, bx: 13.5, by: 9.5, ear: 6, t: 1.4 }
  ];
  var TAIL = [
    [[0, 0], [1, 0], [2, 0], [3, -1], [4, -2], [4, -3], [4, -4], [4, -5], [3, -6]],
    [[0, 0], [1, 0], [2, 0], [3, -1], [4, -2], [5, -3], [5, -4], [6, -5], [6, -6]]
  ];
  var CACHE = {};
  function catPixels(o, frame) {
    var key = [o.stage, o.mood, o.coat, o.worn.head, o.worn.face, o.worn.neck, frame].join("|");
    if (CACHE[key]) return CACHE[key];
    var p = SP[o.stage], co = COAT[o.coat] || COAT.orange, m = o.mood, wr = o.worn || {};
    var B = v(co.b), L = v(co.l), D = v(co.d), E = v("--k-eye"), K = v("--k-pink"), WH = "#fff";
    var N = CW * CH, own = new Array(N), col = new Array(N), edge = new Array(N), i, x, y;
    for (i = 0; i < N; i++) { own[i] = 0; col[i] = ""; edge[i] = false; }
    var bcy = GY - p.by, hcy = (bcy - p.by) - p.hy * 0.45;
    function mir(pt) { return [2 * CX - pt[0], pt[1]]; }
    var eL = [[CX - p.hx * 0.95, hcy - p.hy * 0.15], [CX - p.hx * 0.15, hcy - p.hy * 0.9], [CX - p.hx * 0.72, hcy - p.hy - p.ear]], eR = eL.map(mir);
    function shrink(t) { var cx = (t[0][0] + t[1][0] + t[2][0]) / 3, cy = (t[0][1] + t[1][1] + t[2][1]) / 3; return t.map(function (q) { return [cx + (q[0] - cx) * 0.5, cy + (q[1] - cy) * 0.5]; }); }
    var iL = shrink(eL), iR = shrink(eR), tail = {};
    var tx = CX + Math.round(p.bx) - 2, ty = GY - 2;
    TAIL[frame].forEach(function (q) {
      var qx = tx + Math.round(q[0] * p.t), qy = ty + Math.round(q[1] * p.t);
      [[0, 0], [1, 0], [0, -1], [1, -1]].forEach(function (d) { tail[(qx + d[0]) + "," + (qy + d[1])] = 1; });
    });
    for (y = 0; y < CH; y++) for (x = 0; x < CW; x++) {
      i = y * CW + x;
      if (inEll(x, y, CX, hcy, p.hx, p.hy) || inTri(x, y, eL[0], eL[1], eL[2]) || inTri(x, y, eR[0], eR[1], eR[2])) own[i] = 3;
      else if (inEll(x, y, CX, bcy, p.bx, p.by)) own[i] = 2;
      else if (tail[x + "," + y]) own[i] = 1;
    }
    function O(x, y) { return x < 0 || y >= CH || y < 0 || x >= CW ? 0 : own[y * CW + x]; }
    for (y = 0; y < CH; y++) for (x = 0; x < CW; x++) {
      i = y * CW + x; if (!own[i]) continue;
      var me = own[i];
      edge[i] = O(x - 1, y) < me || O(x + 1, y) < me || O(x, y - 1) < me || O(x, y + 1) < me;
      col[i] = edge[i] ? D : B;
    }
    function inner(x, y, ow) { var k = y * CW + x; return x >= 0 && y >= 0 && x < CW && y < CH && own[k] === ow && !edge[k]; }
    function put(x, y, c) { if (x >= 0 && y >= 0 && x < CW && y < CH) col[y * CW + x] = c; }
    for (y = 0; y < CH; y++) for (x = 0; x < CW; x++) {
      if (inner(x, y, 2) && inEll(x, y, CX, bcy + p.by * 0.3, p.bx * 0.55, p.by * 0.7)) put(x, y, L);
      if (inner(x, y, 3)) {
        if (inEll(x, y, CX, hcy + 2.6, p.hx * 0.42, p.hy * 0.34)) put(x, y, L);
        if (!inEll(x, y, CX, hcy, p.hx, p.hy) && (inTri(x, y, iL[0], iL[1], iL[2]) || inTri(x, y, iR[0], iR[1], iR[2]))) put(x, y, K);
      }
      if (co.pat === "calico") {
        if (inner(x, y, 3) && inEll(x, y, CX - p.hx * 0.5, hcy - p.hy * 0.4, p.hx * 0.38, p.hy * 0.4)) put(x, y, v("--k-or"));
        if (inner(x, y, 2) && inEll(x, y, CX + p.bx * 0.45, bcy - p.by * 0.2, p.bx * 0.32, p.by * 0.38)) put(x, y, v("--k-bk"));
        if (inner(x, y, 1) && (x + y) % 4 === 0) put(x, y, v("--k-or"));
      }
      if (co.pat === "tuxedo") {
        if (inner(x, y, 2) && inEll(x, y, CX, bcy - p.by * 0.12, p.bx * 0.44, p.by * 0.62)) put(x, y, L);
        if (inner(x, y, 3) && inEll(x, y, CX, hcy + p.hy * 0.45, p.hx * 0.52, p.hy * 0.36)) put(x, y, L);
      }
      if (co.pat === "siamese") {
        if (inner(x, y, 3) && !inEll(x, y, CX, hcy, p.hx, p.hy) && !(inTri(x, y, iL[0], iL[1], iL[2]) || inTri(x, y, iR[0], iR[1], iR[2]))) put(x, y, "#4E3A2F");
        if (inner(x, y, 3) && inEll(x, y, CX, hcy + 1.4, p.hx * 0.56, p.hy * 0.44)) put(x, y, "#5C4538");
        if (inner(x, y, 1)) put(x, y, "#4E3A2F");
      }
      if (co.pat === "tortie") {
        if (inner(x, y, 3) && inEll(x, y, CX + p.hx * 0.42, hcy - p.hy * 0.35, p.hx * 0.4, p.hy * 0.38)) put(x, y, v("--k-or"));
        if (inner(x, y, 2) && inEll(x, y, CX - p.bx * 0.45, bcy - p.by * 0.15, p.bx * 0.38, p.by * 0.42)) put(x, y, v("--k-or"));
        if (inner(x, y, 2) && inEll(x, y, CX + p.bx * 0.35, bcy + p.by * 0.18, p.bx * 0.3, p.by * 0.32)) put(x, y, v("--k-gold"));
        if ((inner(x, y, 2) || inner(x, y, 3) || inner(x, y, 1)) && ((x * 7 + y * 13) % 11 === 0)) put(x, y, v("--k-or"));
        if ((inner(x, y, 2) || inner(x, y, 3)) && ((x * 11 + y * 5) % 17 === 0)) put(x, y, v("--k-gold"));
      }
      if (co.pat === "galaxy") {
        if (inner(x, y, 3) && inEll(x, y, CX - p.hx * 0.35, hcy - p.hy * 0.25, p.hx * 0.45, p.hy * 0.42)) put(x, y, "#4C3B88");
        if (inner(x, y, 2) && inEll(x, y, CX + p.bx * 0.25, bcy - p.by * 0.1, p.bx * 0.48, p.by * 0.48)) put(x, y, "#345995");
        if ((inner(x, y, 2) || inner(x, y, 3) || inner(x, y, 1)) && ((x * 13 + y * 29) % 23 === 0)) put(x, y, v("--k-gold"));
        if ((inner(x, y, 2) || inner(x, y, 3)) && ((x * 19 + y * 11) % 31 === 0)) put(x, y, WH);
      }
    }
    var hy = Math.round(hcy), top = Math.round(hcy - p.hy), ex = Math.max(3, Math.round(p.hx * 0.45));
    function mm(dx, dy, c) { put(CX + dx, hy + dy, c); put(CX - 1 - dx, hy + dy, c); }
    function mt(dx, row, c, ow) { if (inner(CX + dx, row, ow)) put(CX + dx, row, c); if (inner(CX - 1 - dx, row, ow)) put(CX - 1 - dx, row, c); }
    if (co.pat === "tabby") {
      [1, 2, 3].forEach(function (r) { mt(0, top + r, D, 3); });
      [2, 3].forEach(function (r) { mt(3, top + r, D, 3); });
      var bx = Math.round(p.bx) - 2, br = Math.round(bcy);
      [bx, bx - 1].forEach(function (dx) { mt(dx, br - 2, D, 2); mt(dx, br + 1, D, 2); });
      Object.keys(tail).forEach(function (k, n) { var q = k.split(","); if (n % 5 === 2 && inner(+q[0], +q[1], 1)) put(+q[0], +q[1], D); });
    }
    var pd = Math.round(p.bx * 0.45), pawC = co.pat === "siamese" ? "#4E3A2F" : L, pawD = co.pat === "siamese" ? "#36261E" : D;
    [pd - 1, pd, pd + 1].forEach(function (dx) { [GY - 3, GY - 2].forEach(function (r) { mt(dx, r, pawC, 2); }); });
    mt(pd, GY - 2, pawD, 2);
    if (m === "purr") { mm(ex - 2, 1, E); mm(ex - 1, 0, E); mm(ex, 0, E); mm(ex + 1, 1, E); }
    else if (m === "sleepy") { mm(ex - 2, 0, E); mm(ex - 1, 1, E); mm(ex, 1, E); mm(ex + 1, 0, E); }
    else if (m === "grumpy") {
      [ex - 1, ex].forEach(function (dx) { mm(dx, 0, E); mm(dx, 1, E); });
      put(CX + ex, hy, WH); put(CX - ex, hy, WH);
      mm(ex + 1, -3, E); mm(ex, -2, E); mm(ex - 1, -2, E); mm(ex - 2, -1, E);
    } else {
      [ex - 1, ex].forEach(function (dx) { mm(dx, -1, E); mm(dx, 0, E); mm(dx, 1, E); });
      put(CX + ex, hy - 1, WH); put(CX - ex, hy - 1, WH);
    }
    if (m !== "grumpy") { mm(ex + 1, 2, K); mm(ex + 2, 2, K); }
    mm(0, 2, K);
    if (m === "grumpy") { mm(0, 3, E); mm(1, 4, E); }
    else if (m === "sleepy") { mm(0, 4, E); }
    else { mm(1, 3, E); mm(0, 4, E); }
    var wx = Math.ceil(p.hx);
    [wx, wx + 1].forEach(function (dx) { mm(dx, 1, D); mm(dx, 3, D); });
    if (wr.face === "glasses") {
      [-2, 2].forEach(function (dy) { [ex - 2, ex - 1, ex, ex + 1].forEach(function (dx) { mm(dx, dy, E); }); });
      [-1, 0, 1].forEach(function (dy) { mm(ex - 2, dy, E); mm(ex + 1, dy, E); });
      mm(0, -1, E); mm(1, -1, E);
      put(CX + ex, hy - 1, WH); put(CX - ex, hy - 1, WH);
    }
    if (wr.face === "shades") {
      [-1, 0, 1].forEach(function (dy) { [ex - 2, ex - 1, ex, ex + 1].forEach(function (dx) { mm(dx, dy, E); }); });
      [ex - 1, ex].forEach(function (dx) { mm(dx, 2, E); });
      mm(0, -1, E); mm(1, -1, E); mm(ex + 2, -1, E);
      put(CX + ex - 1, hy - 1, WH); put(CX - 1 - (ex - 1), hy - 1, WH);
      put(CX + ex, hy, fillOf("J")); put(CX - 1 - ex, hy, fillOf("J"));
    }
    if (wr.face === "monocle") {
      var mx = CX + ex;
      [-2, 2].forEach(function (dy) { for (x = mx - 1; x <= mx + 1; x++) put(x, hy + dy, fillOf("g")); });
      [-1, 0, 1].forEach(function (dy) { put(mx - 2, hy + dy, fillOf("g")); put(mx + 2, hy + dy, fillOf("g")); });
      put(mx - 1, hy - 1, WH);
      for (y = hy + 2; y <= Math.round(hcy + p.hy) + 1; y++) put(mx + 2 + (y % 2), y, fillOf(y % 2 ? "G" : "g"));
    }
    var neck = Math.round(hcy + p.hy) - 1;
    if (wr.neck === "bow") {
      ["nn....nn", "nnnNNnnn", "nn....nn"].forEach(function (row, r) { for (var k = 0; k < 8; k++) if (row.charAt(k) !== ".") put(CX - 4 + k, neck - 1 + r, fillOf(row.charAt(k))); });
      put(CX - 4, neck - 2, fillOf("N")); put(CX + 3, neck - 2, fillOf("N"));
    }
    if (wr.neck === "collar") {
      for (x = CX - 5; x < CX + 5; x++) { put(x, neck - 1, fillOf(x === CX - 5 || x === CX + 4 ? "Y" : "X")); put(x, neck, fillOf("Y")); }
      put(CX - 1, neck + 1, fillOf("g")); put(CX, neck + 1, fillOf("g"));
      put(CX - 1, neck + 2, fillOf("G")); put(CX, neck + 2, fillOf("g"));
    }
    if (wr.neck === "bandana") {
      ["UUUUUUUUUU", ".uuuuuuuu.", "..uuuxuu..", "...uuuu...", "....UU...."].forEach(function (row, r) {
        for (var k = 0; k < row.length; k++) if (row.charAt(k) !== ".") put(CX - 5 + k, neck - 1 + r, fillOf(row.charAt(k)));
      });
    }
    if (wr.neck === "scarf") {
      for (x = CX - 6; x < CX + 6; x++) {
        var stp = (x + 6) % 3 === 0;
        put(x, neck - 1, fillOf(stp ? "a" : "X"));
        put(x, neck, fillOf(stp ? "a" : "Y"));
      }
      ["XXY", "aaY", "XXY", "aaY", "X.X"].forEach(function (row, r) {
        for (var k = 0; k < 3; k++) if (row.charAt(k) !== ".") put(CX + 2 + k, neck + 1 + r, fillOf(row.charAt(k)));
      });
    }
    var hw = Math.round(p.hx);
    if (wr.head === "cap") {
      for (x = CX - hw + 2; x < CX + hw - 2; x++) put(x, top - 2, fillOf("m"));
      for (x = CX - hw; x < CX + hw; x++) put(x, top - 1, fillOf(x === CX - hw || x === CX + hw - 1 ? "M" : "m"));
      for (x = CX - 4; x < CX + 4; x++) put(x, top, fillOf("M"));
      for (y = top - 1; y < top + 3; y++) put(CX + hw - 2, y, fillOf("g"));
      put(CX + hw - 3, top + 3, fillOf("g")); put(CX + hw - 2, top + 3, fillOf("g"));
    }
    if (wr.head === "beanie") {
      var bw = Math.max(5, hw - 2);
      for (x = CX - bw + 2; x < CX + bw - 2; x++) put(x, top - 4, fillOf("b"));
      for (x = CX - bw + 1; x < CX + bw - 1; x++) put(x, top - 3, fillOf((x % 2) ? "B" : "b"));
      for (x = CX - bw; x < CX + bw; x++) { put(x, top - 2, fillOf((x % 2) ? "b" : "B")); put(x, top - 1, fillOf((x % 2) ? "M" : "b")); put(x, top, fillOf("M")); }
      ["aaa", "aJa"].forEach(function (row, r) { for (var k = 0; k < 3; k++) put(CX - 1 + k, top - 6 + r, fillOf(row.charAt(k))); });
    }
    if (wr.head === "headphones") {
      for (x = CX - hw + 2; x < CX + hw - 2; x++) put(x, top - 3, fillOf("m"));
      put(CX - hw + 1, top - 2, fillOf("M")); put(CX + hw - 2, top - 2, fillOf("M"));
      for (y = top - 1; y <= hy + 1; y++) { put(CX - hw - 1, y, fillOf("M")); put(CX + hw, y, fillOf("M")); }
      for (y = hy - 2; y <= hy + 2; y++) {
        put(CX - hw - 2, y, fillOf("m")); put(CX - hw - 1, y, fillOf("y"));
        put(CX + hw + 1, y, fillOf("m")); put(CX + hw, y, fillOf("y"));
      }
      put(CX - hw - 2, hy - 2, fillOf("M")); put(CX + hw + 1, hy - 2, fillOf("M"));
      put(CX - hw - 2, hy + 2, fillOf("M")); put(CX + hw + 1, hy + 2, fillOf("M"));
    }
    if (wr.head === "flower") {
      var fw = Math.max(5, hw - 2);
      for (x = CX - fw; x < CX + fw; x++) { put(x, top, fillOf((x % 2) ? "l" : "L")); put(x, top + 1, fillOf((x % 2) ? "L" : "l")); }
      [[-4, "y", "g"], [0, "g", "x"], [4, "t", "g"]].forEach(function (fl) {
        var fx = CX + fl[0];
        put(fx, top - 2, fillOf(fl[1])); put(fx - 1, top - 1, fillOf(fl[1])); put(fx + 1, top - 1, fillOf(fl[1]));
        put(fx, top, fillOf(fl[1])); put(fx, top - 1, fillOf(fl[2]));
      });
    }
    if (wr.head === "wizard") {
      var ww = Math.max(7, hw);
      for (x = CX - ww; x < CX + ww; x++) put(x, top, fillOf(x === CX - ww || x === CX + ww - 1 ? "Z" : "T"));
      for (x = CX - 5; x < CX + 5; x++) put(x, top - 1, fillOf("g"));
      ["....TT...", "...TTT...", "...TTT...", "..TTTZ...", "..TTgTT..", ".TTTTZT..", ".TTTTTT..", "TTTTTTTT."].forEach(function (row, r) {
        for (var k = 0; k < row.length; k++) if (row.charAt(k) !== ".") put(CX - 4 + k, top - 9 + r, fillOf(row.charAt(k)));
      });
    }
    if (wr.head === "crown") {
      ["g..gg..g", "g..gg..g", "gGgggGgg", "gggyyggg", "GGGGGGGG"].forEach(function (row, r) { for (var k = 0; k < 8; k++) if (row.charAt(k) !== ".") put(CX - 4 + k, top - 4 + r, fillOf(row.charAt(k))); });
    }
    for (y = GY - 1; y < CH; y++) for (x = 0; x < CW; x++) if (!own[y * CW + x] && !col[y * CW + x] && inEll(x, y, CX, GY + 0.4, p.bx + 4, 1.7)) col[y * CW + x] = "rgba(0,0,0,.16)";
    var h = "";
    for (y = 0; y < CH; y++) {
      x = 0;
      while (x < CW) {
        var c = col[y * CW + x], s = x;
        while (x < CW && col[y * CW + x] === c) x++;
        if (c) h += '<rect x="' + s + '" y="' + y + '" width="' + (x - s) + '" height="1" style="fill:' + c + '"/>';
      }
    }
    var res = { svg: h, head: top };
    CACHE[key] = res;
    return res;
  }
  function catG(o) {
    o.worn = o.worn || {};
    var a = catPixels(o, 0), z = "";
    if (o.mood === "sleepy") z = '<g class="pxz">' + sprite(["zzz", "..z", ".z.", "z..", "zzz"].map(function (r) { return r.replace(/z/g, "e"); }), CX + 9, a.head - 8) + '</g><g class="pxz z2">' + sprite(["ee", ".e", "ee"], CX + 14, a.head - 13) + '</g>';
    if (o.mood === "sleepy") return '<g class="pxcat">' + a.svg + z + '</g>';
    return '<g class="pxcat pxm-' + o.mood + '"><g class="f1">' + a.svg + '</g><g class="f2">' + catPixels(o, 1).svg + '</g></g>';
  }
  function catNow(over) { var o = { stage: stageIdx(), mood: mood(), coat: C.coat, worn: C.worn }; if (over) for (var k in over) o[k] = over[k]; return o; }

  /* ---------- the pixel room (120 x 88 pixels) ---------- */
  function lights() {
    var h = "", cols = ["g", "y", "t", "l"];
    for (var x = 0; x < 120; x++) h += rect(x, 2 + Math.round(2.5 * Math.sin(Math.PI * (x % 30) / 30)), 1, 1, "e");
    for (var k = 0; k < 8; k++) { var bx = 7 + k * 15, by = 3 + Math.round(2.5 * Math.sin(Math.PI * (bx % 30) / 30)); h += '<g class="k-bulb">' + rect(bx - 1, by + 1, 3, 3, cols[k % 4]) + rect(bx, by + 4, 1, 1, cols[k % 4]) + '</g>'; }
    return h;
  }
  function poster() {
    var h = rect(84, 8, 26, 20, "w") + rect(85, 9, 24, 18, "a") + rect(87, 11, 1, 14, "e") + rect(87, 24, 20, 1, "e");
    for (var i = 0; i <= 18; i++) h += rect(88 + i, Math.round(23 - i * 11 / 18), 1, 1, "b");
    [[90, 20], [92, 22], [95, 17], [98, 18], [100, 14], [103, 15], [105, 12]].forEach(function (q) { h += rect(q[0], q[1], 1, 1, "y"); });
    return h;
  }
  function shelf() {
    return rect(82, 32, 3, 8, "b") + rect(85, 34, 3, 6, "y") + rect(88, 31, 3, 9, "l") + rect(91, 33, 2, 7, "g") + rect(94, 35, 3, 5, "t")
      + rect(83, 33, 1, 1, "B") + rect(89, 32, 1, 1, "L")
      + sprite(["..l..", ".lLl.", "..l..", "ppppp", ".ppp."], 105, 35)
      + rect(80, 40, 34, 2, "w") + rect(80, 42, 34, 1, "d") + rect(83, 43, 2, 2, "d") + rect(109, 43, 2, 2, "d");
  }
  function plant() {
    return sprite([
      ".....L......",
      "....LlL..L..",
      ".L..Lll.LlL.",
      "LlL.Lll.Lll.",
      "lllLLllLlll.",
      ".llLlllllLlL",
      "..lllLlllll.",
      "...llLllll..",
      "....lLlll...",
      ".PPPPPPPPPP.",
      ".pppppppppp.",
      "..pppppppp..",
      "..pPpppppp..",
      "..pppppppp..",
      "...pppppp...",
      "...pppppp...",
      "....pppp...."], 3, 61);
  }
  function tank() {
    return rect(87, 63, 32, 2, "d") + rect(88, 65, 30, 15, "w") + rect(90, 67, 12, 11, "d") + rect(104, 67, 12, 11, "d") + rect(91, 68, 10, 9, "w") + rect(105, 68, 10, 9, "w") + rect(99, 72, 1, 2, "g") + rect(106, 72, 1, 2, "g")
      + rect(89, 46, 28, 17, "a") + rect(90, 47, 26, 15, "t") + rect(90, 59, 26, 3, "g") + rect(91, 59, 2, 1, "G") + rect(101, 60, 2, 1, "G")
      + rect(93, 51, 1, 8, "l") + rect(94, 53, 1, 2, "l") + rect(92, 55, 1, 2, "l") + rect(112, 54, 1, 5, "L")
      + '<g class="k-fish">' + sprite([".fff.f", "fefffF", ".fff.f"].map(function (r) { return r.replace("F", "."); }), 102, 51) + '</g>'
      + rect(98, 49, 1, 1, "x") + rect(100, 48, 1, 1, "x") + rect(91, 48, 2, 6, "x").replace("fill:#fff", "fill:#fff;opacity:.25");
  }
  function yarn() {
    return rect(19, 82, 3, 1, "y") + rect(22, 81, 2, 1, "y") + rect(17, 83, 2, 1, "y")
      + sprite(["..oooo..", ".oyyyyo.", "oyxyyyyo", "oyyxyyyo", "oyyyxyyo", "oyyyyxyo", ".oyyyyo.", "..oooo.."], 24, 75);
  }
  function dice() { return sprite(["oooooo", "oeaaao", "oaaaao", "oaaaao", "oaaaeo", "oooooo"], 84, 76); }
  function clock() {
    return sprite(["...eeee...", ".eeaaaaee.", ".eaaaaaae.", "eaaaaaaaae", "eaaaaaaaae", "eaaaaaaaae", "eaaaaaaaae", ".eaaaaaae.", ".eeaaaaee.", "...eeee..."], 55, 9)
      + rect(59, 10, 2, 1, "K") + rect(59, 17, 2, 1, "K") + rect(56, 13, 1, 2, "K") + rect(63, 13, 1, 2, "K")
      + '<g class="k-tick"><g class="f1">' + rect(59, 11, 1, 3, "e") + rect(60, 13, 3, 1, "b") + rect(59, 19, 1, 3, "d") + rect(58, 22, 3, 2, "g") + '</g>'
      + '<g class="f2">' + rect(59, 11, 1, 3, "e") + rect(59, 14, 1, 3, "b") + rect(60, 19, 1, 3, "d") + rect(60, 22, 3, 2, "g") + '</g></g>';
  }
  function desk() {
    var h = rect(15, 60, 32, 3, "w") + rect(15, 63, 32, 1, "d") + rect(17, 64, 2, 16, "d") + rect(43, 64, 2, 16, "d")
      + rect(30, 64, 12, 6, "w") + rect(30, 69, 12, 1, "d") + rect(35, 66, 2, 1, "g");
    h += rect(20, 48, 15, 11, "e") + rect(21, 49, 13, 9, "S");
    [7, 7, 6, 5, 3, 2, 1, 2, 3, 5, 6, 7, 7].forEach(function (y, i) { h += rect(21 + i, 49 + y, 1, 1, "g"); });
    h += rect(27, 57, 1, 1, "y") + rect(18, 59, 19, 1, "e") + rect(18, 59, 19, 1, "rgba(255,255,255,.15)");
    h += rect(39, 55, 4, 5, "a") + rect(43, 56, 1, 2, "a") + rect(39, 55, 4, 1, "w");
    h += twinkle(40, 52, "x", 0) + twinkle(41, 50, "x", .6) + twinkle(40, 48, "x", 1.2);
    return h;
  }
  function bowls() {
    return sprite([
      "..DDD...........t.",
      ".DDDDD....ottttto.",
      "opppppoo..obbbbbb.",
      "oppppppo..obBbbbo.",
      ".oPPPPo....obbbbo."
    ], 103, 80) + rect(114, 81, 1, 1, "x");
  }
  function mouse() {
    return sprite([
      "....kk.....",
      "...k111....",
      "..111111k..",
      ".k1o1111.k.",
      "..22222...k"
    ], 4, 80);
  }
  function crystals() {
    return sprite([
      "..A....................u..",
      ".AEA..........ddd.....uLu.",
      ".AEAW...w....dwwwd...uLLu.",
      "AAEAWA.dwd..daaaaad..uLuu.",
      "WAAWW.dpppd.dwwwwwd.uuLLu.",
      "WWWWWWddddd.ddddddd.UUUUUU"
    ], 12, 38) + twinkle(14, 38, "x", 0) + twinkle(35, 39, "x", 1.1);
  }
  function books() {
    return sprite([
      "..bbbbbbbbbbb.",
      ".baaaaaaaaaab.",
      "..BBBBBBBBBBB.",
      ".llllllllllll.",
      "laaaaaaaaaaal.",
      ".LLLLLLLLLyLL.",
      "ppppppppppyp..",
      "paaaaaaaaap...",
      "PPPPPPPPPPP..."
    ], 32, 77);
  }
  function scratcher() {
    return rect(74, 75, 12, 3, "r") + rect(74, 77, 12, 1, "R")
      + rect(78, 55, 4, 20, "w")
      + rect(78, 57, 4, 1, "d") + rect(78, 60, 4, 1, "d") + rect(78, 63, 4, 1, "d") + rect(78, 66, 4, 1, "d") + rect(78, 69, 4, 1, "d") + rect(78, 72, 4, 1, "d")
      + rect(74, 52, 12, 3, "r") + rect(74, 54, 12, 1, "R")
      + rect(84, 55, 1, 5, "d") + sprite([".y.", "yyy", ".y."], 83, 60);
  }
  function pothos() {
    return rect(114, 3, 1, 6, "d")
      + sprite([
        ".PPPPPP.",
        ".pppppp.",
        "..pppp..",
        "..pPPp.."
      ], 111, 9)
      + sprite([
        ".lL..Ll.",
        "lLl..lLl",
        ".l.L..l.",
        "lL.l.Ll.",
        ".l.L..l.",
        "..Ll..L.",
        "..l..lL.",
        ".lL...l.",
        ".l......",
        "L......."
      ], 110, 12);
  }
  function corkboard() {
    return rect(53, 27, 24, 17, "d") + rect(54, 28, 22, 15, "w") + rect(55, 29, 20, 13, "C")
      + rect(57, 31, 6, 5, "g") + rect(59, 30, 2, 1, "X") + rect(58, 33, 4, 1, "d") + rect(58, 34, 3, 1, "d")
      + rect(65, 31, 8, 5, "a") + rect(68, 30, 2, 1, "b") + rect(66, 33, 6, 1, "e") + rect(66, 34, 4, 1, "1")
      + rect(57, 37, 5, 4, "y") + rect(59, 36, 1, 1, "x")
      + rect(64, 37, 5, 4, "t") + rect(66, 36, 1, 1, "X")
      + rect(70, 38, 4, 3, "l") + rect(71, 37, 1, 1, "g");
  }
  function terrarium() {
    return rect(2, 59, 12, 2, "w") + rect(2, 61, 12, 1, "d") + rect(4, 62, 1, 1, "d") + rect(11, 62, 1, 1, "d")
      + sprite([
        "...dddd...",
        "..oJJJJo..",
        ".oJttttJo.",
        ".oJttltJo.",
        ".oJtlLltJo",
        ".oJllLllJo",
        ".oJLLLLLJo",
        ".oJDDDDDJo",
        "..oooooo.."
      ], 3, 50)
      + rect(5, 52, 1, 3, "x").replace("fill:#fff", "fill:#fff;opacity:.45")
      + twinkle(7, 52, "g", 0) + twinkle(10, 54, "g", 1.1);
  }
  function microscope() {
    return sprite([
      "....22....",
      "....11....",
      "...2112...",
      "...1112...",
      "....11.2..",
      "...211..2.",
      "....tt..2.",
      "..22222.2.",
      "....J...2.",
      "......222.",
      ".22222222.",
      "2111111112"
    ], 91, 73);
  }
  function lava() {
    return rect(46, 72, 5, 3, "2") + rect(47, 71, 3, 1, "1") + rect(47, 55, 3, 2, "2")
      + rect(46, 57, 5, 14, "W") + rect(47, 57, 3, 14, "A")
      + '<g class="k-tick"><g class="f1">'
      + rect(47, 67, 3, 3, "X") + rect(48, 68, 1, 1, "O") + rect(47, 60, 2, 3, "O") + rect(48, 61, 1, 1, "g")
      + '</g><g class="f2">'
      + rect(47, 65, 3, 3, "X") + rect(48, 66, 1, 1, "O") + rect(48, 58, 2, 3, "O") + rect(48, 59, 1, 1, "g") + rect(47, 69, 2, 2, "X")
      + '</g></g>'
      + rect(46, 58, 1, 9, "x").replace("fill:#fff", "fill:#fff;opacity:.28");
  }
  function trophy() {
    return rect(68, 9, 14, 14, "G") + rect(69, 10, 12, 12, "g") + rect(70, 11, 10, 10, "a")
      + rect(72, 13, 6, 1, "d") + rect(72, 15, 6, 1, "1") + rect(73, 17, 4, 1, "1")
      + rect(76, 18, 2, 2, "X") + rect(76, 20, 1, 2, "Y") + rect(77, 20, 1, 2, "X")
      + twinkle(70, 10, "x", 0.3) + twinkle(80, 12, "x", 1.4);
  }
  var ART = {
    lights: lights, poster: poster, shelf: shelf, plant: plant, tank: tank, yarn: yarn, dice: dice, clock: clock, desk: desk,
    bowls: bowls, mouse: mouse, crystals: crystals, books: books, scratcher: scratcher, pothos: pothos, corkboard: corkboard, terrarium: terrarium, microscope: microscope, lava: lava, trophy: trophy,
    rug: function () { return pxEll(60, 81.5, 42, 6, "r", "R", true); },
    bed: function () { return pxEll(60, 79.5, 24, 4.6, "b", "d") + pxEll(60, 79, 19, 2.6, "B"); }
  };
  var BACK = ["lights", "pothos", "trophy", "poster", "corkboard", "shelf", "clock", "crystals", "terrarium", "desk", "lava", "plant", "scratcher", "tank", "rug", "bed"];
  var FRONT = ["mouse", "yarn", "books", "dice", "microscope", "bowls"];
  function shown(id) { return !!C.items[id] && !C.off[id]; }
  function twinkle(x, y, c, d) { return '<g class="k-tw" style="animation-delay:' + d + 's">' + rect(x, y, 1, 1, c) + '</g>'; }
  function roomBase() {
    var h = rect(0, 0, 120, 62, "h"), x, y, k;
    for (x = 3; x < 120; x += 6) h += rect(x, 3, 1, 47, "H");
    h += rect(0, 0, 120, 2, "K") + rect(0, 2, 120, 1, "H");
    h += rect(0, 50, 120, 12, "H") + rect(0, 50, 120, 1, "z") + rect(0, 51, 120, 1, "h");
    for (x = 3; x < 118; x += 19) h += rect(x, 54, 15, 1, "K") + rect(x, 54, 1, 6, "K") + rect(x, 59, 15, 1, "h") + rect(x + 14, 54, 1, 6, "h");
    h += rect(9, 11, 32, 34, "a") + rect(11, 13, 28, 14, "q") + rect(11, 27, 28, 15, "Q");
    [[13, 15, 0], [20, 22, .7], [31, 14, 1.3], [36, 24, .4], [16, 31, 1.7], [29, 27, 1]].forEach(function (s) { h += twinkle(s[0], s[1], "v", s[2]); });
    h += sprite([".sss.", "sssss", "sssss", "sssss", ".sss."], 14, 16);
    h += sprite(["..cc....", ".cccc.cc", "cccccccc"], 27, 18);
    for (x = 11; x < 39; x++) {
      var back = 5 + Math.round(1.8 * Math.sin((x - 4) / 3.5)), front = 3 + Math.round(1.6 * Math.sin((x - 11) / 4.5));
      h += rect(x, 42 - back, 1, back, "I") + rect(x, 42 - front, 1, front, "i");
    }
    h += sprite([".L.", "LLL", "LlL", ".d."], 32, 31) + rect(33, 35, 1, 2, "d");
    h += rect(24, 13, 2, 29, "a") + rect(11, 26, 28, 2, "a") + rect(7, 44, 36, 2, "a") + rect(7, 46, 36, 1, "d");
    var rows = [];
    for (y = 9; y <= 46; y++) {
      var w = y < 30 ? 7 - Math.round((y - 9) * 3 / 21) : 4 + Math.round((y - 30) * 2 / 16), s = [];
      for (k = 0; k < 42; k++) s.push(".");
      for (k = 0; k < w; k++) { s[1 + k] = k % 3 === 1 ? "U" : "u"; s[40 - k] = k % 3 === 1 ? "U" : "u"; }
      if (y === 30) { for (k = 1; k <= 5; k++) { s[k] = "g"; s[41 - k] = "g"; } }
      rows.push(s.join(""));
    }
    h += sprite(rows, 5, 9) + rect(4, 8, 42, 1, "d") + rect(2, 7, 3, 3, "g") + rect(45, 7, 3, 3, "g");
    h += rect(48, 36, 3, 5, "a") + rect(49, 37, 1, 2, "K");
    h += rect(0, 62, 120, 2, "z") + rect(0, 64, 120, 24, "F") + rect(0, 64, 120, 2, "rgba(0,0,0,.13)");
    [70, 76, 82].forEach(function (r) { h += rect(0, r, 120, 1, "j"); });
    [[18, 64], [58, 64], [97, 64], [6, 71], [40, 71], [78, 71], [112, 71], [26, 77], [66, 77], [104, 77], [12, 83], [50, 83], [88, 83]].forEach(function (q) { h += rect(q[0], q[1], 1, 6, "j"); });
    h += '<g style="opacity:.15">' + rect(12, 64, 30, 6, "s") + rect(16, 70, 30, 6, "s") + rect(20, 76, 30, 6, "s") + rect(24, 82, 30, 6, "s") + '</g>';
    [[20, 56, 0], [27, 49, .9], [33, 60, 1.6], [38, 53, .5], [30, 67, 1.2], [44, 72, 2]].forEach(function (s) { h += twinkle(s[0], s[1], "V", s[2]); });
    h += rect(0, 0, 2, 88, "rgba(0,0,0,.08)") + rect(118, 0, 2, 88, "rgba(0,0,0,.08)") + rect(0, 86, 120, 2, "rgba(0,0,0,.08)");
    return h;
  }
  function roomSVG() {
    var back = "", front = "";
    BACK.forEach(function (id) { if (shown(id)) back += ART[id](); });
    FRONT.forEach(function (id) { if (shown(id)) front += ART[id](); });
    return '<svg viewBox="0 0 120 88" class="cat-room" shape-rendering="crispEdges" role="img" aria-label="' + esc(C.name) + ' the cat in their room">'
      + roomBase() + back + '<g transform="translate(36 38)">' + catG(catNow()) + '</g>' + front + '</svg>';
  }
  function thumb(it) {
    if (it.kind === "room") return '<svg viewBox="' + it.vb + '" shape-rendering="crispEdges" aria-hidden="true">' + ART[it.id]() + '</svg>';
    var w = {}; w[it.slot] = it.id;
    return '<svg viewBox="8 2 32 32" shape-rendering="crispEdges" aria-hidden="true">' + catG(catNow({ stage: 2, mood: "hello", worn: w })) + '</svg>';
  }
  function coatThumb(k) { return '<svg viewBox="6 4 38 40" shape-rendering="crispEdges" aria-hidden="true">' + catG(catNow({ stage: 2, mood: "hello", coat: k, worn: {} })) + '</svg>'; }
  function smallCat() { var o = catNow(); if (o.mood !== "grumpy" && o.mood !== "sleepy") o.mood = "purr"; return '<svg viewBox="6 2 36 42" shape-rendering="crispEdges" aria-hidden="true">' + catG(o) + '</svg>'; }

  /* ---------- celebrations ---------- */
  var popQ = [], popBusy = false, popEl = null, open = false;
  function pop(msg) { popQ.push(msg); if (!popBusy) nextPop(); }
  function nextPop() {
    var m = popQ.shift();
    if (!m || open) { popQ = []; popBusy = false; if (popEl) popEl.hidden = true; return; }
    popBusy = true;
    if (!popEl) {
      popEl = document.createElement("button"); popEl.type = "button"; popEl.className = "catpop"; popEl.setAttribute("aria-live", "polite");
      popEl.onclick = function () { popEl.hidden = true; openApp("room"); };
      document.body.appendChild(popEl);
    }
    popEl.innerHTML = smallCat() + "<span>" + esc(m) + "</span>"; popEl.hidden = false; popEl.classList.remove("in"); void popEl.offsetWidth; popEl.classList.add("in");
    setTimeout(function () { if (popEl) popEl.hidden = true; setTimeout(nextPop, 250); }, 3600);
  }
  function level() { return lvOf(xpNow()).n; }
  function silentSync() { C.lv = level(); C.stg = stageIdx(); if (dayXP() >= GOAL) C.goalD = todayStr(); store(); }
  function cheapestNew() { var b = null; ITEMS.forEach(function (it) { if (!C.items[it.id] && (!b || it.cost < b.cost)) b = it; }); return b; }
  function onXP(n) {
    var msgs = [], before = bal() - n, L = level(), st = stageIdx(), td = todayStr();
    if (C.stg >= 0 && st > C.stg) msgs.push(C.name + " grew into a " + STAGES[st].name + "! 🎉");
    else if (C.lv >= 0 && L > C.lv) msgs.push("Study Cat Lv " + (L + 1) + "! Meow! 🎉");
    C.lv = L; C.stg = st;
    if (dayXP() >= GOAL && C.goalD !== td) { C.goalD = td; msgs.push("Daily goal done! 🎯"); }
    var nx = cheapestNew();
    if (nx && before < nx.cost && bal() >= nx.cost) msgs.push("You can buy the " + nx.n + " now 🛍️");
    save(); chip(); if (open) render();
    if (msgs.length) setTimeout(function () { pop(msgs.slice(0, 2).join(" · ")); }, 900);
  }

  /* ---------- Room and Shop ---------- */
  var tab = "room", lastFocus = null;
  function chip() {
    var b = $("catbtn");
    if (!b) return;
    b.hidden = false;
    b.textContent = "🐱 " + bal();
    b.title = C.name + " the Study Cat · " + bal() + " XP to spend across all subjects. Tap to visit.";
  }
  function bar(p) { return '<div class="pxbar"><i style="width:' + Math.max(0, Math.min(100, Math.round(p * 100))) + '%"></i></div>'; }
  function rRoom() {
    var si = stageIdx(), x = xpNow(), prog;
    if (si < STAGES.length - 1) { var nx = STAGES[si + 1], a = cumXP(STAGES[si].lv), b = cumXP(nx.lv); prog = bar((x - a) / (b - a)) + '<p class="cat-sub">' + Math.max(0, b - x) + ' XP until ' + esc(C.name) + ' grows into a <b>' + nx.name + '</b> (' + x + ' total XP across ' + XP_ACROSS + ').</p>'; }
    else prog = '<p class="cat-sub">Fully grown (' + x + ' total XP across ' + XP_ACROSS + '). A true chonky legend. ✨</p>';
    return '<div class="cat-scene" id="catscene" title="Pet ' + esc(C.name) + '">' + roomSVG() + '</div>'
      + '<div class="cat-namerow"><button class="cat-name" data-a="rename" aria-label="Rename your cat">' + esc(C.name) + ' <span aria-hidden="true">✎</span></button><span class="pxtag">' + STAGES[si].name + '</span></div>'
      + '<p class="cat-mood" id="catsay" aria-live="polite">' + moodLine() + '</p>' + prog
      + '<div class="row"><button class="btn" data-tab="shop">🛍️ Shop · ' + bal() + ' XP</button><button class="btn sec" data-a="pet">Pet 🐾</button></div>';
  }
  function card(th, name, btn, own) { return '<div class="card shopc' + (own ? ' own' : '') + '"><div class="kthumb">' + th + '</div><b>' + esc(name) + '</b>' + btn + '</div>'; }
  function buyBtn(id, cost) {
    var can = bal() >= cost;
    return '<button class="btn' + (can ? '' : ' sec') + '" data-buy="' + id + '"' + (can ? '' : ' disabled') + '>' + (can ? "Buy · " + cost + " XP" : "Need " + (cost - bal()) + " more XP") + '</button>';
  }
  function rShop() {
    var h = '<div class="card kbal"><b>⚡ ' + bal() + ' XP to spend</b><small>Earned across ' + XP_ACROSS + ' (' + xpNow() + ' total XP). Spending never lowers your level.</small></div><h3 class="cat-h3">For the room</h3><div class="shopgrid">';
    ITEMS.forEach(function (it) {
      if (it.kind !== "room") return;
      var own = !!C.items[it.id];
      h += card(thumb(it), it.n, own ? '<button class="btn' + (C.off[it.id] ? ' sec' : '') + '" data-place="' + it.id + '">' + (C.off[it.id] ? "Put in room" : "In room ✓") + '</button>' : buyBtn(it.id, it.cost), own);
    });
    h += '</div><h3 class="cat-h3">Outfits</h3><div class="shopgrid">';
    ITEMS.forEach(function (it) {
      if (it.kind !== "wear") return;
      var own = !!C.items[it.id], on = C.worn[it.slot] === it.id;
      h += card(thumb(it), it.n, own ? '<button class="btn' + (on ? '' : ' sec') + '" data-wear="' + it.id + '">' + (on ? "Wearing ✓" : "Wear") + '</button>' : buyBtn(it.id, it.cost), own);
    });
    h += '</div><h3 class="cat-h3">Coat</h3><div class="shopgrid">';
    Object.keys(COAT).forEach(function (k) {
      var c = COAT[k], own = !c.cost || !!C.items["coat-" + k], on = C.coat === k;
      h += card(coatThumb(k), c.n, own ? '<button class="btn' + (on ? '' : ' sec') + '" data-coat="' + k + '">' + (on ? "Selected ✓" : "Choose") + '</button>' : buyBtn("coat-" + k, c.cost), own);
    });
    return h + '</div>';
  }
  function render() {
    if (!open) return;
    $("catbody").innerHTML = tab === "shop" ? rShop() : rRoom();
    $("catbal").textContent = "⚡ " + bal();
    Array.prototype.forEach.call(document.querySelectorAll("#catnav [data-tab]"), function (b) { b.setAttribute("aria-current", b.getAttribute("data-tab") === tab ? "page" : "false"); });
    chip();
  }
  function hearts() {
    var s = $("catscene"); if (!s || reduced()) return;
    for (var i = 0; i < 3; i++) (function (i) {
      var h = document.createElement("i"); h.className = "cat-heart"; h.textContent = "♥"; h.style.left = (44 + Math.random() * 12) + "%"; h.style.animationDelay = (i * .14) + "s";
      s.appendChild(h); setTimeout(function () { if (h.parentNode) h.parentNode.removeChild(h); }, 1500);
    })(i);
  }
  function say(t) { var e = $("catsay"); if (e) e.textContent = t; }
  var PET = { purr: ["Purrrrr…", "Meow! Study buddy!", "*happy tail swish*"], hello: ["Mrrp?", "Hello there!", "*sniffs your hand*"], sleepy: ["*yawn*… mmm…", "Five more minutes…", "*one eye opens*"], grumpy: ["…hmph.", "*turns away, but stays close*", "Mrrow. A quiz would help."] };
  function pet() { hearts(); var a = PET[mood()]; say(a[Math.floor(Math.random() * a.length)]); }
  function buy(id) {
    var coat = id.indexOf("coat-") === 0, k = id.slice(5), it = coat ? { n: COAT[k] && COAT[k].n, cost: COAT[k] && COAT[k].cost } : IT[id];
    if (!it || !it.cost || C.items[id] || bal() < it.cost) return;
    C.spent += it.cost; C.items[id] = 1;
    if (coat) C.coat = k; else if (it.kind === "wear") C.worn[it.slot] = id;
    save(); render();
    showToast("New for " + C.name + ": " + it.n + " 🎁");
    showConfetti();
  }
  function openApp(t) {
    tab = t || "room"; open = true; lastFocus = document.activeElement;
    $("catapp").hidden = false; document.body.classList.add("catopen");
    if (popEl) popEl.hidden = true;
    render(); $("catclose").focus();
  }
  function closeApp() {
    open = false; $("catapp").hidden = true; document.body.classList.remove("catopen");
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
  }
  function wire() {
    var b = $("catbtn"), a = $("catapp"); if (!b || !a) return;
    b.onclick = function () { openApp("room"); };
    $("catclose").onclick = closeApp;
    document.addEventListener("keydown", function (e) { if (open && e.key === "Escape") closeApp(); });
    a.addEventListener("click", function (e) {
      var t = e.target.closest("[data-tab],[data-a],[data-buy],[data-place],[data-wear],[data-coat],#catscene");
      if (!t) return;
      if (t.hasAttribute("data-tab")) { tab = t.getAttribute("data-tab"); render(); $("catbody").scrollTop = 0; return; }
      if (t.id === "catscene") { pet(); return; }
      var act = t.getAttribute("data-a");
      if (act === "pet") pet();
      else if (act === "rename") { var n = window.prompt("What is your cat called?", C.name); if (n && n.trim()) { C.name = n.trim().slice(0, 16); save(); render(); } }
      else if (t.hasAttribute("data-buy")) buy(t.getAttribute("data-buy"));
      else if (t.hasAttribute("data-place")) { var p = t.getAttribute("data-place"); if (C.off[p]) delete C.off[p]; else C.off[p] = 1; save(); render(); }
      else if (t.hasAttribute("data-wear")) { var wi = IT[t.getAttribute("data-wear")]; if (C.worn[wi.slot] === wi.id) delete C.worn[wi.slot]; else C.worn[wi.slot] = wi.id; save(); render(); }
      else if (t.hasAttribute("data-coat")) { C.coat = t.getAttribute("data-coat"); save(); render(); }
    });
    silentSync(); chip();
    if (window.GEOSync && GEOSync.subscribe) {
      GEOSync.subscribe(startCatCloud);
    }
  }
  function refresh() { silentSync(); chip(); if (open) render(); }
  function reset() {
    /* Only wipe the shared cat if XP across ALL subjects is 0; resetting a single subject preserves your cat. */
    if (xpNow() === 0) { C = fresh(); save(); }
    silentSync(); chip(); if (open) render();
  }

  window.CAT = { onXP: onXP, refresh: refresh, reset: reset, open: openApp, close: closeApp, _state: function () { return C; } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire); else wire();
})();
