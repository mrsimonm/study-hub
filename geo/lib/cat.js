/* Study Cat: a pixel-art cat you look after by studying. One file, no images, no dependencies. Drops into any hub.
   Simple loop: earn XP by studying -> the cat grows with your level -> spend XP in the shop on things for the cat.
   Spending XP never lowers your level: spendable XP = total XP earned - XP spent.
   Everything is drawn on a pixel grid in code (SVG rects + shape-rendering: crispEdges), so it stays sharp at any size.
   Hooks (all optional for the host app):
     - GEO.xp() calls CAT.onXP(n, why) after every XP award.   (app.js)
     - GEO._setState() calls CAT.refresh().                      (app.js)
     - "Reset all my progress" calls CAT.reset().                (app.js)
   The host page needs: #catbtn (top-bar chip), #catapp (overlay) and the "Study Cat" CSS in index.html.
   Cloud sync (SYNC = true): saved as "cat" next to "state" in users/{uid}. The hub's firestore.rules must allow the 'cat'
   field (isValidCat) and its lib/firebase-sync.js must have register()/touch(), otherwise set SYNC = false. */
(function () {
  "use strict";
  var G = window.GEO;
  if (!G || !G._getState || !G.lvOf) return;

  /* each hub saves its own cat: the key comes from <div id="catapp" data-key="..."> in index.html */
  var KEY = (document.getElementById("catapp") && document.getElementById("catapp").getAttribute("data-key")) || "studyCat";
  var SYNC = true;
  var $ = function (id) { return document.getElementById(id); };
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function isObj(x) { return x && typeof x === "object" && !Array.isArray(x); }
  function reduced() { return !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function S() { return G._getState(); }
  function xpNow() { return +S().xp || 0; }

  /* ---------- catalogue: everything is bought with XP ---------- */
  var COAT = {
    orange: { n: "Orange tabby", b: "--k-or", l: "--k-orl", d: "--k-ord", pat: "tabby", cost: 0 },
    grey: { n: "Grey tabby", b: "--k-gr", l: "--k-grl", d: "--k-grd", pat: "tabby", cost: 0 },
    black: { n: "Black cat", b: "--k-bk", l: "--k-bkl", d: "--k-bkd", pat: "none", cost: 0 },
    white: { n: "Snow white", b: "--k-wh", l: "--k-whl", d: "--k-whd", pat: "none", cost: 150 },
    calico: { n: "Calico", b: "--k-wh", l: "--k-whl", d: "--k-whd", pat: "calico", cost: 250 }
  };
  var ITEMS = [
    { id: "yarn", kind: "room", n: "Yarn ball", cost: 40, vb: "17 71 20 14" },
    { id: "dice", kind: "room", n: "Dice toy", cost: 60, vb: "81 73 12 12" },
    { id: "plant", kind: "room", n: "Big plant", cost: 80, vb: "0 55 18 24" },
    { id: "clock", kind: "room", n: "Wall clock", cost: 90, vb: "51 7 18 18" },
    { id: "rug", kind: "room", n: "Cosy rug", cost: 100, vb: "16 73 88 16" },
    { id: "bed", kind: "room", n: "Cat bed", cost: 120, vb: "34 72 52 14" },
    { id: "lights", kind: "room", n: "Fairy lights", cost: 150, vb: "0 0 46 12" },
    { id: "poster", kind: "room", n: "Chart poster", cost: 180, vb: "82 6 30 24" },
    { id: "desk", kind: "room", n: "Study desk", cost: 250, vb: "13 44 36 37" },
    { id: "shelf", kind: "room", n: "Bookshelf", cost: 200, vb: "78 28 38 18" },
    { id: "tank", kind: "room", n: "Fish tank", cost: 300, vb: "85 45 36 37" },
    { id: "bow", kind: "wear", slot: "neck", n: "Bow tie", cost: 60 },
    { id: "glasses", kind: "wear", slot: "face", n: "Nerd glasses", cost: 100 },
    { id: "cap", kind: "wear", slot: "head", n: "Graduation cap", cost: 200 },
    { id: "crown", kind: "wear", slot: "head", n: "Crown", cost: 400 }
  ];
  var IT = {}; ITEMS.forEach(function (x) { IT[x.id] = x; });

  /* ---------- the cat's saved state ---------- */
  function fresh() { return { name: "Biscuit", coat: "orange", worn: {}, spent: 0, items: {}, off: {}, lv: -1, stg: -1, goalD: "" }; }
  var C = fresh();
  function adopt(m) {
    if (!isObj(m)) return;
    var f = fresh();
    C.name = typeof m.name === "string" && m.name ? m.name.slice(0, 16) : f.name;
    C.coat = typeof m.coat === "string" && COAT[m.coat] ? m.coat : f.coat;
    C.worn = isObj(m.worn) ? m.worn : {};
    C.spent = Math.max(0, +m.spent || 0);
    C.items = isObj(m.items) ? m.items : {}; C.off = isObj(m.off) ? m.off : {};
    C.lv = m.lv == null ? -1 : +m.lv; C.stg = m.stg == null ? -1 : +m.stg; C.goalD = String(m.goalD || "");
  }
  try { adopt(JSON.parse(localStorage.getItem(KEY) || "null")); } catch (e) {}
  function store() { try { localStorage.setItem(KEY, JSON.stringify(C)); } catch (e) {} }
  function save() { store(); if (SYNC && window.GEOSync && GEOSync.touch) GEOSync.touch(); }
  function merge(a, b) {
    a = a || {}; b = b || {};
    var o = JSON.parse(JSON.stringify(a));
    o.spent = Math.max(+a.spent || 0, +b.spent || 0);
    o.items = Object.assign({}, b.items || {}, a.items || {});
    o.lv = Math.max(a.lv == null ? -1 : +a.lv, b.lv == null ? -1 : +b.lv);
    o.stg = Math.max(a.stg == null ? -1 : +a.stg, b.stg == null ? -1 : +b.stg);
    return o;
  }

  /* ---------- XP to spend, growth stages, mood ---------- */
  function bal() { return Math.max(0, xpNow() - C.spent); }
  function cumXP(n) { return 100 * n + 25 * n * (n - 1); }          /* total XP to reach level index n (engine: 100, then +50 per level) */
  var STAGES = [{ name: "Kitten", lv: 0 }, { name: "Young cat", lv: 2 }, { name: "House cat", lv: 4 }, { name: "Chonky legend", lv: 7 }];
  function stageIdx() { var n = G.lvOf(xpNow()).n, k = 0; STAGES.forEach(function (s, i) { if (n >= s.lv) k = i; }); return k; }
  function daysOff() {
    var p = /^(\d+)-(\d+)-(\d+)$/.exec((S().streak && S().streak.last) || "");
    if (!p) return -1;
    var a = new Date(+p[1], +p[2] - 1, +p[3]), b = new Date(); b = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((b - a) / 864e5);
  }
  function mood() { var d = daysOff(); return d < 0 ? "hello" : d <= 0 ? "purr" : d < 3 ? "sleepy" : "grumpy"; }
  function moodLine() {
    var d = daysOff(), n = esc(C.name);
    if (d < 0) return n + " is new here and curious. Earn some XP and watch them grow.";
    if (d <= 0) return n + " is purring. You studied today. 💛";
    if (d < 3) return n + " is sleepy. One quick quiz will wake them up.";
    return n + " is a bit grumpy after " + d + " days without you. One quiz fixes it.";
  }

  /* ---------- pixel drawing helpers ---------- */
  function v(x) { return "var(" + x + ")"; }
  /* sprite palette: one letter = one colour (CSS variables from index.html, so light and dark mode both work) */
  var PAL = { o: "--k-eye", e: "--k-eye", a: "--k-frame", b: "--k-bed", B: "--k-bed2", c: "--k-cloud", d: "--k-wood2", w: "--k-wood", f: "--k-fish", g: "--k-gold", G: "--k-goldd",
    l: "--k-leaf", L: "--k-leaf2", p: "--k-pot", P: "--k-potd", r: "--k-rug", R: "--k-rug2", s: "--k-sun", t: "--k-water", y: "--k-yarn", k: "--k-pink", x: "#fff",
    z: "--k-base", h: "--k-wall1", H: "--k-wall2", K: "--k-wall3", u: "--k-curtain", U: "--k-curtain2", i: "--k-hill", I: "--k-hill2", v: "--k-star", V: "--k-dust", S: "--k-screen", q: "--k-sky1", Q: "--k-sky2", F: "--k-floor", j: "--k-floor2", m: "--k-cap", M: "--k-capd", n: "--k-bow", N: "--k-bowd" };
  function fillOf(c) { var p = PAL[c] || c; return p.charAt(0) === "-" ? v(p) : p; }
  function rect(x, y, w, h, c) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" style="fill:' + fillOf(c) + '"/>'; }
  /* a sprite is an array of strings; "." is transparent. Same-colour runs in a row become one rect. */
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
  /* a filled pixel ellipse; border: colour for the ring, dash: only every other ring pixel */
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

  /* ---------- the pixel cat ----------
     Drawn on a 48 x 44 grid, centred between columns 23 and 24, feet on row 42.
     Shapes (head, ears, body, tail) are rasterised, then every edge pixel becomes the dark outline colour. */
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
    function O(x, y) { return x < 0 || y < 0 || x >= CW || y >= CH ? 0 : own[y * CW + x]; }
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
    /* paws */
    var pd = Math.round(p.bx * 0.45);
    [pd - 1, pd, pd + 1].forEach(function (dx) { [GY - 3, GY - 2].forEach(function (r) { mt(dx, r, L, 2); }); });
    mt(pd, GY - 2, D, 2);
    /* face */
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
    /* things the cat wears */
    if (wr.face === "glasses") {
      [-2, 2].forEach(function (dy) { [ex - 2, ex - 1, ex, ex + 1].forEach(function (dx) { mm(dx, dy, E); }); });
      [-1, 0, 1].forEach(function (dy) { mm(ex - 2, dy, E); mm(ex + 1, dy, E); });
      mm(0, -1, E); mm(1, -1, E);
      put(CX + ex, hy - 1, WH); put(CX - ex, hy - 1, WH);
    }
    var neck = Math.round(hcy + p.hy) - 1;
    if (wr.neck === "bow") {
      ["nn....nn", "nnnNNnnn", "nn....nn"].forEach(function (row, r) { for (var k = 0; k < 8; k++) if (row.charAt(k) !== ".") put(CX - 4 + k, neck - 1 + r, fillOf(row.charAt(k))); });
      put(CX - 4, neck - 2, fillOf("N")); put(CX + 3, neck - 2, fillOf("N"));
    }
    if (wr.head === "cap") {
      var hw = Math.round(p.hx);
      for (x = CX - hw + 2; x < CX + hw - 2; x++) put(x, top - 2, fillOf("m"));
      for (x = CX - hw; x < CX + hw; x++) put(x, top - 1, fillOf(x === CX - hw || x === CX + hw - 1 ? "M" : "m"));
      for (x = CX - 4; x < CX + 4; x++) put(x, top, fillOf("M"));
      for (y = top - 1; y < top + 3; y++) put(CX + hw - 2, y, fillOf("g"));
      put(CX + hw - 3, top + 3, fillOf("g")); put(CX + hw - 2, top + 3, fillOf("g"));
    }
    if (wr.head === "crown") {
      ["g..gg..g", "g..gg..g", "gGgggGgg", "gggyyggg", "GGGGGGGG"].forEach(function (row, r) { for (var k = 0; k < 8; k++) if (row.charAt(k) !== ".") put(CX - 4 + k, top - 4 + r, fillOf(row.charAt(k))); });
    }
    /* soft shadow on the floor */
    for (y = GY - 1; y < CH; y++) for (x = 0; x < CW; x++) if (!own[y * CW + x] && !col[y * CW + x] && inEll(x, y, CX, GY + 0.4, p.bx + 4, 1.7)) col[y * CW + x] = "rgba(0,0,0,.16)";
    /* rows of same colour -> rects */
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
  /* two frames that swap (tail swish); sleepy cats keep still and snore little pixel z's */
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
    /* laptop with a bell curve on screen */
    h += rect(20, 48, 15, 11, "e") + rect(21, 49, 13, 9, "S");
    [7, 7, 6, 5, 3, 2, 1, 2, 3, 5, 6, 7, 7].forEach(function (y, i) { h += rect(21 + i, 49 + y, 1, 1, "g"); });
    h += rect(27, 57, 1, 1, "y") + rect(18, 59, 19, 1, "e") + rect(18, 59, 19, 1, "rgba(255,255,255,.15)");
    /* mug with steam */
    h += rect(39, 55, 4, 5, "a") + rect(43, 56, 1, 2, "a") + rect(39, 55, 4, 1, "w");
    h += twinkle(40, 52, "x", 0) + twinkle(41, 50, "x", .6) + twinkle(40, 48, "x", 1.2);
    return h;
  }
  var ART = {
    lights: lights, poster: poster, shelf: shelf, plant: plant, tank: tank, yarn: yarn, dice: dice, clock: clock, desk: desk,
    rug: function () { return pxEll(60, 81.5, 42, 6, "r", "R", true); },
    bed: function () { return pxEll(60, 79.5, 24, 4.6, "b", "d") + pxEll(60, 79, 19, 2.6, "B"); }
  };
  var BACK = ["lights", "poster", "shelf", "clock", "desk", "plant", "tank", "rug", "bed"], FRONT = ["yarn", "dice"];
  function shown(id) { return !!C.items[id] && !C.off[id]; }
  function twinkle(x, y, c, d) { return '<g class="k-tw" style="animation-delay:' + d + 's">' + rect(x, y, 1, 1, c) + '</g>'; }
  function roomBase() {
    var h = rect(0, 0, 120, 62, "h"), x, y, k;
    /* wallpaper: soft stripes, crown moulding, panelled lower wall */
    for (x = 3; x < 120; x += 6) h += rect(x, 3, 1, 47, "H");
    h += rect(0, 0, 120, 2, "K") + rect(0, 2, 120, 1, "H");
    h += rect(0, 50, 120, 12, "H") + rect(0, 50, 120, 1, "z") + rect(0, 51, 120, 1, "h");
    for (x = 3; x < 118; x += 19) h += rect(x, 54, 15, 1, "K") + rect(x, 54, 1, 6, "K") + rect(x, 59, 15, 1, "h") + rect(x + 14, 54, 1, 6, "h");
    /* window: sky, sun or moon, stars at night, hills and a tree outside */
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
    /* curtains on a rod, tied back in the middle */
    var rows = [];
    for (y = 9; y <= 46; y++) {
      var w = y < 30 ? 7 - Math.round((y - 9) * 3 / 21) : 4 + Math.round((y - 30) * 2 / 16), s = [];
      for (k = 0; k < 42; k++) s.push(".");
      for (k = 0; k < w; k++) { s[1 + k] = k % 3 === 1 ? "U" : "u"; s[40 - k] = k % 3 === 1 ? "U" : "u"; }
      if (y === 30) { for (k = 1; k <= 5; k++) { s[k] = "g"; s[41 - k] = "g"; } }
      rows.push(s.join(""));
    }
    h += sprite(rows, 5, 9) + rect(4, 8, 42, 1, "d") + rect(2, 7, 3, 3, "g") + rect(45, 7, 3, 3, "g");
    /* light switch */
    h += rect(48, 36, 3, 5, "a") + rect(49, 37, 1, 2, "K");
    /* floor: planks, shadow along the wall */
    h += rect(0, 62, 120, 2, "z") + rect(0, 64, 120, 24, "F") + rect(0, 64, 120, 2, "rgba(0,0,0,.13)");
    [70, 76, 82].forEach(function (r) { h += rect(0, r, 120, 1, "j"); });
    [[18, 64], [58, 64], [97, 64], [6, 71], [40, 71], [78, 71], [112, 71], [26, 77], [66, 77], [104, 77], [12, 83], [50, 83], [88, 83]].forEach(function (q) { h += rect(q[0], q[1], 1, 6, "j"); });
    /* sunbeam (moonbeam at night) with floating dust */
    h += '<g style="opacity:.15">' + rect(12, 64, 30, 6, "s") + rect(16, 70, 30, 6, "s") + rect(20, 76, 30, 6, "s") + rect(24, 82, 30, 6, "s") + '</g>';
    [[20, 56, 0], [27, 49, .9], [33, 60, 1.6], [38, 53, .5], [30, 67, 1.2], [44, 72, 2]].forEach(function (s) { h += twinkle(s[0], s[1], "V", s[2]); });
    /* soft corners for depth */
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

  /* ---------- celebrations: the cat pops up on level-up, growing and the daily goal ---------- */
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
  function level() { return G.lvOf(xpNow()).n; }
  function dayXP() { var s = S(); return s.day && s.day.d === G.today() ? +s.day.xp || 0 : 0; }
  function silentSync() { C.lv = level(); C.stg = stageIdx(); if (dayXP() >= G.GOAL) C.goalD = G.today(); store(); }
  function cheapestNew() { var b = null; ITEMS.forEach(function (it) { if (!C.items[it.id] && (!b || it.cost < b.cost)) b = it; }); return b; }
  function onXP(n) {
    var msgs = [], before = bal() - n, L = level(), st = stageIdx();
    if (C.stg >= 0 && st > C.stg) msgs.push(C.name + " grew into a " + STAGES[st].name + "! 🎉");
    else if (C.lv >= 0 && L > C.lv) msgs.push("Level " + (L + 1) + "! Meow! 🎉");
    C.lv = L; C.stg = st;
    if (dayXP() >= G.GOAL && C.goalD !== G.today()) { C.goalD = G.today(); msgs.push("Daily goal done! 🎯"); }
    var nx = cheapestNew();
    if (nx && before < nx.cost && bal() >= nx.cost) msgs.push("You can buy the " + nx.n + " now 🛍️");
    save(); chip(); if (open) render();
    if (msgs.length) setTimeout(function () { pop(msgs.slice(0, 2).join(" · ")); }, 900);
  }

  /* ---------- the app: Room and Shop ---------- */
  var tab = "room", lastFocus = null;
  function chip() { var b = $("catbtn"); if (!b) return; b.hidden = false; b.textContent = "🐱 " + bal(); b.title = C.name + " the cat. " + bal() + " XP to spend. Tap to visit."; }
  function bar(p) { return '<div class="pxbar"><i style="width:' + Math.max(0, Math.min(100, Math.round(p * 100))) + '%"></i></div>'; }
  function rRoom() {
    var si = stageIdx(), x = xpNow(), prog;
    if (si < STAGES.length - 1) { var nx = STAGES[si + 1], a = cumXP(STAGES[si].lv), b = cumXP(nx.lv); prog = bar((x - a) / (b - a)) + '<p class="cat-sub">' + Math.max(0, b - x) + ' XP until ' + esc(C.name) + ' grows into a <b>' + nx.name + '</b>.</p>'; }
    else prog = '<p class="cat-sub">Fully grown. A true chonky legend. ✨</p>';
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
    var h = '<div class="card kbal"><b>⚡ ' + bal() + ' XP to spend</b><small>Spending never lowers your level. Study to earn more.</small></div><h3 class="cat-h3">For the room</h3><div class="shopgrid">';
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
    if (G.toast) G.toast("New for " + C.name + ": " + it.n + " 🎁");
    if (G.confetti) G.confetti();
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
  }
  function refresh() { silentSync(); chip(); if (open) render(); }
  function reset() { C = fresh(); store(); silentSync(); chip(); if (open) render(); }

  if (SYNC && window.GEOSync && GEOSync.register) GEOSync.register({ key: "cat", get: function () { return C; }, set: function (m) { adopt(m); store(); chip(); if (open) render(); }, merge: merge });

  window.CAT = { onXP: onXP, refresh: refresh, reset: reset, open: openApp, close: closeApp, _state: function () { return C; } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire); else wire();
})();
