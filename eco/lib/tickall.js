/* Tick all that apply: the multiple-answer format of the real ecology exam.
   Each question has 6 options and 1 to 6 of them are correct. Scoring follows the exam rules:
   every correct option ticked and nothing wrong = 2 points; any wrong tick = 0; correct but incomplete = 0.
   Data: courses/<course>/tickall.json = [{ id, t (lecture id), q, right: [...], wrong: [...], why }]
   (right + wrong = 6 options). Progress: localStorage "ecoHub.tick" = { best: { id: 1 } }. */
(function () {
  "use strict";
  var KEY = "ecoHub.tick", P = { best: {} }, DATA = null, run = null;
  try { P = JSON.parse(localStorage.getItem(KEY) || "null") || P; } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} if (window.GEOSync && GEOSync.touch) GEOSync.touch(); }
  if (window.GEOSync && GEOSync.register) GEOSync.register({ key: "tick", get: function () { return P; }, set: function (v) { P.best = (v && v.best) || {}; store(); }, merge: function (a, b) { return { best: Object.assign({}, (b && b.best) || {}, (a && a.best) || {}) }; } });
  function store() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function file() { return (GEO.course.base || "") + (GEO.course.tickall || "tickall.json"); }
  function load() { return DATA ? Promise.resolve(DATA) : fetch(file(), { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (d) { DATA = d; return d; }); }
  function topicName(id) { var t = GEO.byId && GEO.byId[id]; return t ? "L" + t.num + " " + t.short : ""; }

  function menu(host) {
    var n = DATA.length, mastered = DATA.filter(function (q) { return P.best[q.id]; }).length;
    var byT = {}; DATA.forEach(function (q) { (byT[q.t] = byT[q.t] || []).push(q); });
    var h = '<h1>☑️ Tick all that apply</h1><p class="lede">The real exam has questions with <b>6 options where 1 to 6 are correct</b>. You get 2 points only if you tick every correct option and nothing else. One wrong tick and the question is worth 0.</p>';
    h += '<div class="card"><p><b>' + mastered + ' of ' + n + '</b> questions answered perfectly at least once.</p><div class="row" style="margin-top:8px"><button class="btn" data-tk="mix10">10 random questions</button><button class="btn sec" data-tk="weak">Only the ones I haven\'t got yet</button><button class="btn sec" data-tk="all">All ' + n + '</button></div>';
    h += '<p class="tk-key">Tip for the real exam: if you are not sure about an option, leave it unticked. A missing tick and a wrong tick both give 0, but guessing more options rarely saves a question.</p></div>';
    h += '<div class="card"><h2>By lecture</h2><div class="row" style="margin-top:8px;flex-wrap:wrap">' + Object.keys(byT).sort(function (a, b) { return (GEO.byId[a] ? GEO.byId[a].num : 99) - (GEO.byId[b] ? GEO.byId[b].num : 99); }).map(function (t) {
      var qs = byT[t], ok = qs.filter(function (q) { return P.best[q.id]; }).length;
      return '<button class="btn sec" data-tk="t:' + esc(t) + '">' + esc(topicName(t) || t) + ' · ' + ok + '/' + qs.length + '</button>';
    }).join("") + '</div></div>';
    host.innerHTML = h;
  }

  function start(host, qs) {
    if (!qs.length) { host.insertAdjacentHTML("afterbegin", '<div class="card"><b>Nothing left here.</b> Every question in this set is already perfect. Pick another set.</div>'); return; }
    run = { qs: qs.map(function (q) { var o = shuffle(q.right.map(function (x) { return { t: x, ok: true }; }).concat(q.wrong.map(function (x) { return { t: x, ok: false }; }))); return { q: q, o: o }; }), i: 0, pts: 0, done: false };
    show(host);
  }

  function show(host) {
    var it = run.qs[run.i], n = run.qs.length;
    var h = '<div class="card"><div class="tk-head"><span>Question ' + (run.i + 1) + ' of ' + n + (it.q.t ? ' · ' + esc(topicName(it.q.t)) : '') + '</span><span class="tk-score">' + run.pts + ' / ' + (run.i * 2) + ' pts</span></div>';
    h += '<p class="qtext">' + esc(it.q.q) + '</p><p class="tk-key">Tick every statement that is true.</p><div class="tk-opts">' + it.o.map(function (o, k) {
      return '<label class="tk-opt" data-k="' + k + '"><input type="checkbox" id="tk-' + esc(it.q.id) + '-' + k + '"><span>' + esc(o.t) + '</span></label>';
    }).join("") + '</div><div class="row" style="margin-top:10px"><button class="btn" data-tk="check">Check</button><button class="ghost" data-tk="menu">✕ Stop</button></div><div class="fb" hidden></div></div>';
    host.innerHTML = h; window.scrollTo(0, 0);
  }

  function check(host) {
    var it = run.qs[run.i], boxes = host.querySelectorAll(".tk-opt"), wrongTick = 0, missed = 0;
    boxes.forEach(function (b, k) {
      var on = b.querySelector("input").checked, ok = it.o[k].ok; b.querySelector("input").disabled = true;
      if (on && ok) b.classList.add("ok"); else if (on && !ok) { b.classList.add("no"); wrongTick++; } else if (!on && ok) { b.classList.add("miss"); missed++; }
    });
    var full = !wrongTick && !missed, pts = full ? 2 : 0;
    run.pts += pts;
    var sc = host.querySelector(".tk-score"); if (sc) sc.textContent = run.pts + " / " + ((run.i + 1) * 2) + " pts";
    if (full && !P.best[it.q.id]) { P.best[it.q.id] = 1; save(); }
    if (window.GEO && GEO.xp) GEO.xp(full ? 6 : 1, "tick");
    var fb = host.querySelector(".fb");
    fb.hidden = false; fb.className = "fb " + (full ? "good" : "bad");
    fb.innerHTML = (full ? '<b>Perfect: 2 points.</b> ' : wrongTick ? '<b>0 points:</b> ' + wrongTick + ' wrong tick' + (wrongTick > 1 ? 's' : '') + (missed ? ' and ' + missed + ' missed' : '') + '. ' : '<b>0 points:</b> you missed ' + missed + ' correct option' + (missed > 1 ? 's' : '') + ' (dashed). ') + esc(it.q.why || "");
    var last = run.i === run.qs.length - 1;
    host.querySelector('[data-tk="check"]').outerHTML = '<button class="btn" data-tk="next">' + (last ? "See my score" : "Next question →") + '</button>';
  }

  function finish(host) {
    var n = run.qs.length, max = n * 2, pct = Math.round(run.pts / max * 100);
    if (window.GEO && GEO.confetti && pct >= 90) GEO.confetti();
    host.innerHTML = '<div class="card"><h2>' + run.pts + ' / ' + max + ' points (' + pct + ' %)</h2><p>' + (pct >= 90 ? "Exam-ready on this format." : pct >= 70 ? "Above the pass line. Retry the ones you missed." : "Below the 70 % pass line. Re-read those lessons, then try again.") + '</p><div class="row" style="margin-top:8px"><button class="btn" data-tk="weak">Retry what I missed</button><button class="btn sec" data-tk="menu">Back to sets</button></div></div>';
  }

  function act(host, a) {
    if (a === "menu") { run = null; menu(host); return; }
    if (a === "check") { check(host); return; }
    if (a === "next") { if (run.i < run.qs.length - 1) { run.i++; show(host); } else finish(host); return; }
    var qs = a === "all" ? shuffle(DATA) : a === "mix10" ? shuffle(DATA).slice(0, 10) : a === "weak" ? shuffle(DATA.filter(function (q) { return !P.best[q.id]; })) : a.indexOf("t:") === 0 ? shuffle(DATA.filter(function (q) { return q.t === a.slice(2); })) : [];
    menu(host); start(host, qs);
  }

  function open(host) {
    if (!host._tk) { host._tk = 1; host.addEventListener("click", function (e) { var b = e.target.closest("[data-tk]"); if (b) act(host, b.getAttribute("data-tk")); }); }
    if (run && !run.done) { show(host); return; }
    host.innerHTML = '<p class="lede">Loading…</p>';
    load().then(function () { menu(host); }).catch(function () { host.innerHTML = '<div class="card"><b>The tick-all questions could not load.</b> Check that ' + esc(file()) + ' exists and is valid JSON.</div>'; });
  }
  window.GEOTick = { open: open };
})();
