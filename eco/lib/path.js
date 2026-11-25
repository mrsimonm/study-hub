/* Study path: "Start studying" walks through a whole test in small steps, one at a time.
   Data: courses/<course>/path/<test>.json = { id, title, units: [{ id, title, sub, bites: [...] }] }
   Bite types:
     read      { id, title, html }                     short idea, 30–60 seconds
     formulas  { id, title, ids: [formula ids], html } the 2–3 formulas for this topic, with when to use them
     example   { id, title, intro, steps: [{ html }] } a worked example, revealed one step at a time
     quiz      { id, q, options, right, why }          quick check, retry until right
     exercise  { set, ex }                             a real seminar exercise (lib/apply.js), one question at a time
   Progress: localStorage "ecoHub.path" = { done: { biteId: 1 }, cur: { pathId: index } }. */
(function () {
  "use strict";
  var KEY = "ecoHub.path";
  var P = { done: {}, cur: {} };
  try { var raw = JSON.parse(localStorage.getItem(KEY) || "null"); if (raw && typeof raw === "object") { if (raw.done && typeof raw.done === "object") P.done = raw.done; if (raw.cur && typeof raw.cur === "object") P.cur = raw.cur; } } catch (e) {}
  function store() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }
  function save() { store(); if (window.GEOSync && GEOSync.touch) GEOSync.touch(); }
  /* Cloud sync (lib/firebase-sync.js): steps done on either device count, the furthest position wins. */
  if (window.GEOSync && GEOSync.register) GEOSync.register({
    key: "pt",
    get: function () { return P; },
    set: function (m) { P.done = m.done || {}; P.cur = m.cur || {}; store(); },
    merge: function (a, b) {
      a = a || {}; b = b || {};
      var cur = Object.assign({}, b.cur || {});
      Object.keys(a.cur || {}).forEach(function (k) { var x = a.cur[k], y = cur[k]; cur[k] = (typeof x === "number" && typeof y === "number") ? Math.max(x, y) : (x != null ? x : y); });
      return { done: Object.assign({}, b.done || {}, a.done || {}), cur: cur };
    }
  });
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function xp(n, why) { if (window.GEO && GEO.xp) GEO.xp(n, why); }
  function toast(m, big) { if (window.GEO && GEO.toast) GEO.toast(m, big); }

  var CACHE = {}, PATH = null, FLAT = [], box = null, stepDone = false;
  function file(id) { return (GEO.course.base || "") + "path/" + id + ".json"; }
  function load(id) {
    if (CACHE[id]) return Promise.resolve(CACHE[id]);
    return fetch(file(id), { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status + " " + r.statusText); return r.json(); })
      .then(function (d) { CACHE[id] = d; return d; });
  }
  function bid(b) { return b.type === "exercise" ? "ex:" + b.set + ":" + b.ex : b.id; }
  function flatten(d) {
    var out = [];
    d.units.forEach(function (u, ui) {
      u.bites.forEach(function (b, bi) { out.push({ b: b, u: u, ui: ui, bi: bi, id: bid(b) }); });
      out.push({ b: { type: "unitdone" }, u: u, ui: ui, bi: u.bites.length, id: "unitdone:" + u.id });
    });
    return out;
  }
  function isDone(item) {
    if (item.b.type === "exercise") return !!P.done[item.id] || (window.GEOApply && GEOApply.isDone(item.b.set, item.b.ex));
    return !!P.done[item.id];
  }
  function pct() { var n = 0, k = 0; FLAT.forEach(function (it) { if (it.b.type === "unitdone") return; n++; if (isDone(it)) k++; }); return n ? Math.round(k / n * 100) : 0; }
  /* Position is saved as the step id (stable when steps are added); older saves used an index number. */
  function cur() {
    var v = P.cur[PATH.id];
    if (typeof v === "string") { for (var j = 0; j < FLAT.length; j++) if (FLAT[j].id === v) return j; }
    else if (typeof v === "number" && v >= 0 && v < FLAT.length) return v;
    return firstOpen(0);
  }
  function firstOpen(from) { for (var i = from; i < FLAT.length; i++) if (FLAT[i].b.type !== "unitdone" && !isDone(FLAT[i])) return i; for (i = 0; i < from; i++) if (FLAT[i].b.type !== "unitdone" && !isDone(FLAT[i])) return i; return Math.max(0, FLAT.length - 1); }
  function preload() { return window.GEOApply ? Promise.all(GEOApply.sets().map(function (s) { return GEOApply.load(s).catch(function () {}); })) : Promise.resolve(); }

  /* ---------- screen ---------- */
  function open(id, unitId) {
    box = document.getElementById("v-path");
    box.innerHTML = '<p class="lede">Getting your study session ready…</p>';
    Promise.all([load(id), preload()]).then(function (r) {
      PATH = r[0]; FLAT = flatten(PATH);
      if (unitId) { for (var i = 0; i < FLAT.length; i++) if (FLAT[i].u.id === unitId) { P.cur[PATH.id] = FLAT[i].id; break; } save(); }
      show(cur());
    }).catch(function (e) { box.innerHTML = '<p class="lede">The study path could not be loaded (' + esc(e.message || e) + "). Check your connection and try again.</p>"; });
  }

  function head(i) {
    var it = FLAT[i], u = it.u, n = u.bites.length, k = Math.min(it.bi + 1, n), p = pct();
    var set = window.GEOApply && GEOApply.setById(u.id), topic = set && set.topic && GEO.byId && GEO.byId[set.topic] ? set.topic : null;
    return '<div class="pt-head"><div class="pt-top"><button type="button" class="ghost pt-map-btn" data-pmap>☰ All steps</button>' + (topic ? '<button type="button" class="ghost" data-go="' + esc(topic) + '">📖 Full lesson</button>' : "") + '<span class="pt-unit">' + esc(u.title) + '</span></div>' +
      '<div class="pt-bars"><div class="pt-bar" title="This seminar"><i style="width:' + Math.round((it.bi) / n * 100) + '%"></i></div><span class="pt-cnt">' + (it.b.type === "unitdone" ? "Done" : "Step " + k + " of " + n) + "</span></div>" +
      '<p class="pt-all">Whole ' + esc(PATH.short || PATH.title) + ": " + p + " % done</p></div>";
  }

  function show(i) {
    P.cur[PATH.id] = FLAT[i].id; save();
    var it = FLAT[i], b = it.b, h = head(i), body = "", done = isDone(it);
    stepDone = done || b.type === "read" || b.type === "formulas" || b.type === "unitdone";
    if (b.type === "read") body = '<div class="pt-card"><p class="pt-kind">💡 Idea</p><h2>' + esc(b.title) + "</h2>" + b.html + "</div>";
    else if (b.type === "formulas") body = '<div class="pt-card"><p class="pt-kind">∑ Formulas you will use</p><h2>' + esc(b.title) + "</h2>" + (b.html || "") + '<div class="pt-fx"></div><p class="pt-note">There is no formula sheet in the test, so learn these by heart. Tap ∑ Formulas at the top any time.</p></div>';
    else if (b.type === "example") {
      body = '<div class="pt-card"><p class="pt-kind">👀 Worked example</p><h2>' + esc(b.title) + "</h2>" + (b.intro ? b.intro : "") + '<ol class="pt-steps">';
      b.steps.forEach(function (s, j) { body += '<li class="pt-st"' + (done || j === 0 ? "" : " hidden") + ">" + s.html + "</li>"; });
      body += "</ol>" + (done ? "" : '<button type="button" class="btn sec" data-pnext-step>Show the next step ↓</button>') + "</div>";
      stepDone = done || b.steps.length <= 1;
    }
    else if (b.type === "quiz") {
      body = '<div class="pt-card"><p class="pt-kind">⚡ Quick check</p><h2>' + esc(b.q) + '</h2><div class="pt-opts">' + b.options.map(function (o, j) { return '<button type="button" class="pt-opt' + (done && j === b.right ? " good" : "") + '" data-popt="' + j + '"' + (done ? " disabled" : "") + ">" + esc(o) + "</button>"; }).join("") + '</div><p class="pt-why" role="status">' + (done ? esc(b.why || "") : "") + "</p></div>";
    }
    else if (b.type === "exercise") body = '<p class="pt-kind" style="margin:14px 0 6px">✏️ Your turn: a real exercise</p><div class="pt-ex"></div>';
    else if (b.type === "unitdone") {
      var nu = PATH.units[it.ui + 1];
      body = '<div class="pt-card pt-win"><p class="pt-big">🎉</p><h2>' + esc(it.u.title) + " done!</h2><p>" + (nu ? "Next up: <b>" + esc(nu.title) + "</b>. Take a short break if you need one, then carry on." : "You have been through the whole " + esc(PATH.short || PATH.title) + ". Go back to anything you skipped, or practise random exercises on the test page.") + "</p></div>";
    }
    var last = i >= FLAT.length - 1;
    var foot = '<div class="pt-foot">' + (i > 0 ? '<button type="button" class="btn sec" data-pgo="' + (i - 1) + '">←</button>' : "<span></span>") +
      (b.type === "exercise" && !done ? '<button type="button" class="ghost" data-pskip>Skip for now</button>' : "") +
      (last ? '<button type="button" class="btn" data-go="test-' + esc(PATH.id) + '">Finish →</button>' : '<button type="button" class="btn pt-cont" data-pcont' + (stepDone ? "" : " disabled") + ">Continue →</button>") + "</div>";
    box.innerHTML = h + body + foot;
    window.scrollTo(0, 0);
    if (b.type === "formulas" && window.GEOFormulas) GEOFormulas.renderIds(box.querySelector(".pt-fx"), b.ids);
    if (b.type === "exercise" && window.GEOApply) GEOApply.mount(box.querySelector(".pt-ex"), b.set, b.ex, { onDone: function (already) { complete(it, already ? 0 : 0); } });
    if (b.type === "unitdone" && !P.done[it.id]) { P.done[it.id] = 1; save(); xp(15, "seminar"); if (GEO.confetti) GEO.confetti(); }
  }

  function complete(it, gain) {
    if (!P.done[it.id]) { P.done[it.id] = 1; save(); if (gain) xp(gain, "step"); }
    stepDone = true;
    var c = box.querySelector("[data-pcont]"); if (c) { c.disabled = false; c.classList.add("pt-ready"); }
    var s = box.querySelector("[data-pskip]"); if (s) s.remove();
  }
  function next() {
    var i = cur(), it = FLAT[i];
    if (it.b.type === "read" || it.b.type === "formulas") complete(it, 2);
    show(Math.min(i + 1, FLAT.length - 1));
  }

  function map() {
    var h = '<div class="pt-head"><div class="pt-top"><button type="button" class="ghost" data-pback>← Back to studying</button><span class="pt-unit">' + esc(PATH.title) + '</span></div><p class="pt-all">' + pct() + " % done · tap any step to jump there</p></div>";
    PATH.units.forEach(function (u) {
      var items = FLAT.filter(function (x) { return x.u === u && x.b.type !== "unitdone"; }), k = items.filter(isDone).length;
      h += '<details class="pt-mu"' + (FLAT[cur()].u === u ? " open" : "") + "><summary><b>" + esc(u.title) + "</b> <span>" + k + " / " + items.length + "</span></summary><ol>";
      items.forEach(function (x) {
        var b = x.b, t = b.type === "exercise" ? "✏️ Exercise " + b.ex : b.type === "quiz" ? "⚡ " + b.q : b.type === "example" ? "👀 " + b.title : b.type === "formulas" ? "∑ " + b.title : "💡 " + b.title;
        h += '<li><button type="button" class="pt-mi' + (isDone(x) ? " done" : "") + '" data-pgo="' + FLAT.indexOf(x) + '">' + (isDone(x) ? "✓ " : "") + esc(t) + "</button></li>";
      });
      h += "</ol></details>";
    });
    box.innerHTML = h; window.scrollTo(0, 0);
  }

  function onClick(e) {
    var g = e.target.closest("[data-go]"); if (g && box.contains(g) && !g.closest(".pt-ex")) { GEO.go(g.getAttribute("data-go")); return; }
    if (!PATH) return;
    if (e.target.closest("[data-pmap]")) { map(); return; }
    if (e.target.closest("[data-pback]")) { show(cur()); return; }
    var j = e.target.closest("[data-pgo]"); if (j) { show(+j.getAttribute("data-pgo")); return; }
    if (e.target.closest("[data-pcont]")) { if (stepDone) next(); return; }
    if (e.target.closest("[data-pskip]")) { show(Math.min(cur() + 1, FLAT.length - 1)); return; }
    var it = FLAT[cur()], b = it.b;
    if (e.target.closest("[data-pnext-step]")) {
      var hidden = box.querySelector(".pt-st[hidden]");
      if (hidden) { hidden.hidden = false; hidden.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
      if (!box.querySelector(".pt-st[hidden]")) { e.target.closest("[data-pnext-step]").remove(); complete(it, 5); }
      return;
    }
    var o = e.target.closest("[data-popt]");
    if (o && b.type === "quiz") {
      var k = +o.getAttribute("data-popt"), why = box.querySelector(".pt-why");
      if (k === b.right) {
        o.classList.add("good"); box.querySelectorAll("[data-popt]").forEach(function (x) { x.disabled = true; });
        why.className = "pt-why ok"; why.textContent = "✓ " + (b.why || "Correct.");
        complete(it, 5);
      } else { o.classList.add("bad"); o.disabled = true; why.className = "pt-why bad"; why.textContent = "Not this one. Try again."; }
    }
  }

  /* Big "Start studying" card for Home and the test page. */
  function cta(testId) {
    var tests = (GEO.course && GEO.course.paths) || [];
    if (tests.indexOf(testId) < 0) return "";
    var id = "pt-cta-" + testId;
    setTimeout(function () {
      Promise.all([load(testId), preload()]).then(function (r) {
        var el = document.getElementById(id); if (!el) return;
        var d = r[0], fl = flatten(d), save0 = [PATH, FLAT]; PATH = d; FLAT = fl;
        var p = pct(), i = cur(), it = FLAT[i], started = Object.keys(P.done).length > 0 || p > 0;
        el.querySelector(".pt-cta-sub").textContent = started ? "Continue: " + it.u.title + " · " + p + " % of " + (d.short || d.title) + " done" : d.units.length + " topics in small steps: " + (d.steps || "read the idea, then check yourself");
        el.querySelector(".pt-cta-go").textContent = (started ? "▶ Continue studying for " : "▶ Start studying for ") + (d.short || d.title);
        el.querySelector(".pt-cta-bar i").style.width = p + "%";
        if (save0[0] && save0[0].id !== d.id) { PATH = save0[0]; FLAT = save0[1]; }
      }).catch(function () {});
    }, 0);
    return '<button type="button" class="pt-cta" id="' + id + '" data-go="study-' + esc(testId) + '"><span class="pt-cta-go">▶ Start studying</span><span class="pt-cta-sub">One step at a time. The app tells you what is next.</span><span class="pt-cta-bar"><i></i></span></button>';
  }

  function init() { var v = document.getElementById("v-path"); if (v) v.addEventListener("click", onClick); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  window.GEOPath = { open: open, cta: cta };
})();
