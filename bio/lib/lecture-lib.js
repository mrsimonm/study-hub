/* GeoLecture: turns plain data files (lecture.json + steps.md) into the topic object the Hub engine (app.js) expects.
   Works in the browser (window.GeoLecture) and in Node (require) so the validator and the app share one code path. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.GeoLecture = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function isObj(x) { return x && typeof x === "object" && !Array.isArray(x); }
  function str(x) { return typeof x === "string" && x.trim().length > 0; }

  /* ---------- tiny Markdown for steps.md ---------- */
  function inline(s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
    s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, "$1<i>$2</i>");
    s = s.replace(/\{chip:([^}]+)\}/g, '<span class="chip">$1</span>');
    s = s.replace(/\{rec\}/g, '<span class="chip">recording</span>');
    return s;
  }
  var BOX_LABEL = { idea: "The idea", ana: "Analogy", teach: "Teacher said", trap: "Exam trap", skip: "Not tested" };
  var NEED = { must: '<span class="need must">Must know</span>', nice: '<span class="need nice">Good to know</span>', skip: '<span class="need skip">Not tested</span>' };

  function cell(c) {
    if (typeof c === "string" && NEED[c.trim()]) return NEED[c.trim()];
    return c;
  }
  function splitRow(line) {
    return line.trim().replace(/^\|/, "").replace(/\|$/, "").replace(/\\\|/g, "\u0000").split("|").map(function (c) { return c.replace(/\u0000/g, "|").trim(); });
  }

  function blocks(lines) {
    var out = [], i = 0, m;
    while (i < lines.length) {
      var l = lines[i];
      if (!l.trim()) { i++; continue; }
      /* callout box */
      if ((m = /^:::(\w+)\s*(.*)$/.exec(l)) && BOX_LABEL[m[1]]) {
        var body = []; i++;
        while (i < lines.length && !/^:::\s*$/.test(lines[i])) { body.push(lines[i]); i++; }
        i++;
        out.push('<div class="box ' + m[1] + '"><b>' + inline(m[2] || BOX_LABEL[m[1]]) + "</b>" + blocks(body) + "</div>");
        continue;
      }
      /* inline check question */
      if ((m = /^\{\{q:([\w-]+)\}\}\s*$/.exec(l))) { out.push('<div class="chk" data-q="' + m[1] + '"></div>'); i++; continue; }
      /* sub heading */
      if ((m = /^###\s+(.*)$/.exec(l))) { out.push("<h3>" + inline(m[1]) + "</h3>"); i++; continue; }
      /* raw HTML passthrough (until blank line) */
      if (/^\s*</.test(l)) { var raw = []; while (i < lines.length && lines[i].trim()) { raw.push(lines[i]); i++; } out.push(raw.join("\n")); continue; }
      /* table */
      if (/^\s*\|/.test(l)) {
        var rows = []; while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(lines[i]); i++; }
        var head = splitRow(rows[0]), data = rows.slice(1).filter(function (r) { return !/^\s*\|?\s*:?-{2,}/.test(r); }).map(splitRow);
        out.push('<div class="tw"><table><thead><tr>' + head.map(function (h) { return "<th>" + inline(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
          data.map(function (r) { return "<tr>" + r.map(function (c, k) { var n = NEED[c.trim()]; return "<td>" + (n || (k === 0 ? "<b>" + inline(c) + "</b>" : inline(c))) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>");
        continue;
      }
      /* list */
      if (/^\s*(?:[-*]|\d+\.)\s+/.test(l)) {
        var ordered = /^\s*\d+\./.test(l), items = [];
        while (i < lines.length && /^\s*(?:[-*]|\d+\.)\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, "")); i++; }
        var tag = ordered ? "ol" : "ul";
        out.push("<" + tag + ">" + items.map(function (x) { return "<li>" + inline(x) + "</li>"; }).join("") + "</" + tag + ">");
        continue;
      }
      /* paragraph */
      var p = [];
      while (i < lines.length && lines[i].trim() && !/^(:::|###|\|\s|\s*<|\{\{q:|\s*(?:[-*]|\d+\.)\s+)/.test(lines[i])) { p.push(lines[i].trim()); i++; }
      if (!p.length) { p.push(lines[i].trim()); i++; }
      out.push("<p>" + inline(p.join(" ")) + "</p>");
    }
    return out.join("\n");
  }

  /* "## Title | 5 min" starts a step */
  function parseSteps(md) {
    var lines = String(md || "").replace(/\r/g, "").split("\n"), steps = [], cur = null;
    lines.forEach(function (l) {
      var m = /^##\s+(?!#)(.+?)\s*$/.exec(l);
      if (m) {
        var t = m[1], time = "5 min", tm = /^(.*?)\s+\|\s+(\d+\s*min)\s*$/.exec(t);
        if (tm) { t = tm[1]; time = tm[2].replace(/\s+/, " "); }
        cur = { title: t, t: time, lines: [] }; steps.push(cur);
      } else if (cur) cur.lines.push(l);
    });
    return steps.map(function (s) { return { title: s.title, t: s.t, html: blocks(s.lines) }; });
  }

  /* ---------- normalising helpers ---------- */
  function normQuestions(list, lectureId) {
    return (list || []).map(function (q, i) {
      var o = Array.isArray(q.o) ? q.o.slice() : (str(q.answer) && Array.isArray(q.wrong) ? [q.answer].concat(q.wrong) : []);
      var out = { id: q.id || (lectureId + "q" + (i + 1)), q: q.q, h: q.h || "", o: o, e: q.e || "" };
      if (q.fol) out.fol = 1;
      if (q.x) out.x = 1;
      if (q.y) out.y = 1;
      return out;
    });
  }
  function normVocab(list) {
    return (list || []).map(function (v) {
      return Array.isArray(v) ? v : [v.group || v.g || "Terms", v.term || v.t, v.meaning || v.m];
    });
  }
  function mapCells(rows) { return (rows || []).map(function (r) { return r.map(cell); }); }

  /* ---------- validation: returns {errors, warnings} ---------- */
  function validate(L, stepsMd) {
    var E = [], W = [];
    function err(m) { E.push(m); } function warn(m) { W.push(m); }
    if (!isObj(L)) { err("lecture.json must be a JSON object."); return { errors: E, warnings: W }; }
    if (!Number.isInteger(L.num) || L.num < 1) err('"num" must be a whole number, 1 or higher (the lecture number).');
    var id = L.id || (Number.isInteger(L.num) ? "t" + L.num : "");
    if (!/^t\d+$/.test(id)) err('"id" must look like t7, t12 ... (letter t + number). Got: ' + JSON.stringify(L.id));
    else if (Number.isInteger(L.num) && id !== "t" + L.num) warn('"id" (' + id + ') does not match "num" (' + L.num + "). Usually id is t + num.");
    ["title", "short", "blurb"].forEach(function (k) { if (!str(L[k])) err('"' + k + '" is required (text).'); });
    if (!str(L.sub)) warn('"sub" is empty: shown under the title, e.g. "Lecture 7 · short description".');
    if (!str(L.lede)) warn('"lede" is empty: one-paragraph intro on the overview page.');
    if (!Array.isArray(L.six) || L.six.length < 3) warn('"six" should list 3 to 6 key takeaways (shown as "If you remember only 6 things").');
    if (!str(L.must)) warn('"must" is empty: short name of the most important topic (used in the mock test text).');

    var steps = parseSteps(stepsMd);
    if (!steps.length) err('steps.md has no steps. Start each step with a line like "## Title | 5 min".');
    var qs = Array.isArray(L.questions) ? L.questions : [];
    if (!Array.isArray(L.questions)) err('"questions" must be a list.');
    var seen = {};
    qs.forEach(function (q, i) {
      var w = "Question " + (i + 1) + (q && q.id ? " (" + q.id + ")" : "");
      if (!isObj(q)) { err(w + ": must be an object."); return; }
      if (!str(q.q)) err(w + ': "q" (the question text) is missing.');
      var o = Array.isArray(q.o) ? q.o : (str(q.answer) && Array.isArray(q.wrong) ? [q.answer].concat(q.wrong) : null);
      if (!o) err(w + ': give either "o" (4 options, the FIRST one is the correct one) or "answer" + "wrong" (3 wrong answers).');
      else {
        if (o.length !== 4) err(w + ": needs exactly 4 options (1 correct + 3 wrong), has " + o.length + ".");
        if (o.some(function (x) { return !str(x); })) err(w + ": an option is empty or not text.");
        if (new Set(o.map(function (x) { return String(x).trim().toLowerCase(); })).size !== o.length) err(w + ": two options are identical.");
      }
      if (!str(q.e)) warn(w + ': no "e" (explanation shown after answering).');
      if (q.id !== undefined) {
        if (!/^[\w-]+$/.test(q.id)) err(w + ': "id" may only contain letters, digits, _ and -.');
        if (seen[q.id]) err(w + ': duplicate id "' + q.id + '".');
        seen[q.id] = 1;
      } else warn(w + ': no "id". Add a stable id (e.g. "' + id + '-hardness-1") so review/progress survives re-ordering.');
    });
    if (qs.length < 7) warn("Only " + qs.length + " questions. The mock test uses 7; aim for 15+.");

    var vs = Array.isArray(L.vocab) ? L.vocab : [];
    if (!Array.isArray(L.vocab)) err('"vocab" must be a list.');
    var terms = {};
    vs.forEach(function (v, i) {
      var a = normVocab([v])[0], w = "Vocab " + (i + 1);
      if (!str(a[0]) || !str(a[1]) || !str(a[2])) { err(w + ": needs group, term and meaning (all text)."); return; }
      if (terms[a[1].toLowerCase()]) warn(w + ': term "' + a[1] + '" appears twice.');
      terms[a[1].toLowerCase()] = 1;
    });
    if (vs.length < 6) warn("Only " + vs.length + " vocab terms. Match-pairs needs at least 6; the vocab quiz needs at least 4.");

    steps.forEach(function (s, i) {
      var re = /data-q="([\w-]+)"/g, m;
      while ((m = re.exec(s.html))) if (!seen[m[1]]) err("Step " + (i + 1) + ' ("' + s.title + '"): {{q:' + m[1] + "}} refers to a question id that does not exist.");
      if (/\{\{(?!q:)/.test(s.html)) warn("Step " + (i + 1) + ': unknown {{...}} directive (only {{q:id}} exists).');
    });
    if (/:::(?!idea|ana|teach|trap|skip|\s*$)\w+/.test(String(stepsMd))) warn('Unknown ":::box" type. Use idea, ana, teach, trap or skip.');
    if (str(stepsMd) && (stepsMd.match(/^:::\w+/gm) || []).length !== (stepsMd.match(/^:::\s*$/gm) || []).length) err('A ":::box" is not closed with a line containing only ":::".');

    (L.facts || []).forEach(function (f, i) {
      var w = "Fact " + (i + 1);
      if (!Array.isArray(f) || f.length !== 2 || !Number.isInteger(f[0]) || !str(f[1])) { err(w + ': must be [step number, "text with a {right|wrong1|wrong2|wrong3} gap"].'); return; }
      if (f[0] < 1 || f[0] > steps.length) err(w + ": step number " + f[0] + " does not exist (1 to " + steps.length + ").");
      var m = /\{([^}]*)\}/.exec(f[1]);
      if (!m) err(w + ": no {gap|options} in the text.");
      else if ((f[1].match(/\{[^}]*\}/g) || []).length > 1) err(w + ": only one {gap|options} is allowed per fact.");
      else if (m[1].split("|").length < 3) err(w + ": the gap needs the right answer plus at least 2 wrong ones, separated by |.");
    });

    if (L.cards) {
      var C = L.cards;
      if (!Array.isArray(C.items) || !Array.isArray(C.keys) || !isObj(C.labels)) err('"cards" needs "keys" (list), "labels" (object) and "items" (list).');
      else {
        C.keys.forEach(function (k) { if (!str(C.labels[k])) err('cards.labels is missing a label for key "' + k + '".'); });
        var cn = {};
        C.items.forEach(function (it, i) {
          if (!str(it.n)) err("Card " + (i + 1) + ': "n" (the name) is required.');
          else if (cn[it.n]) err('Card name "' + it.n + '" is used twice.'); else cn[it.n] = 1;
          C.keys.forEach(function (k) { if (!str(it[k])) err("Card " + (i + 1) + " (" + it.n + '): missing "' + k + '".'); });
        });
        if (C.items.length < 4) warn('"Which one am I?" needs at least 4 cards.');
      }
    }
    function checkTable(t, w) {
      if (!Array.isArray(t.head) || !Array.isArray(t.rows)) { err(w + ': needs "head" and "rows".'); return; }
      t.rows.forEach(function (r, i) { if (!Array.isArray(r) || r.length !== t.head.length) err(w + ", row " + (i + 1) + ": has " + (Array.isArray(r) ? r.length : "?") + " cells but the header has " + t.head.length + "."); });
    }
    ((L.names && L.names.tables) || []).forEach(function (t, i) { checkTable(t, "names.tables[" + i + "]"); });
    (L.sheet || []).forEach(function (s, i) {
      if (!Array.isArray(s) || s.length !== 3) { err("sheet[" + i + "]: must be [title, head, rows]."); return; }
      checkTable({ head: s[1], rows: s[2] }, "sheet[" + i + '] "' + s[0] + '"');
    });
    return { errors: E, warnings: W, stepCount: steps.length };
  }

  /* ---------- build the engine's topic object ---------- */
  function build(L, stepsMd) {
    var res = validate(L, stepsMd);
    if (res.errors.length) return { errors: res.errors, warnings: res.warnings };
    var id = L.id || "t" + L.num, steps = parseSteps(stepsMd);
    var VOC = normVocab(L.vocab), Q = normQuestions(L.questions, id);
    var cards = L.cards ? JSON.parse(JSON.stringify(L.cards)) : {
      tab: "Term cards", h1: "Term cards", who: "Which term am I?", lede: "Tap a card to flip it. Say the answer before you flip.",
      labels: { d: "Meaning" }, keys: ["d"], items: VOC.map(function (v) { return { n: v[1], grp: v[0], d: v[2], clue: ["d"] }; })
    };
    cards.items.forEach(function (it) { if (!it.clue) it.clue = cards.keys.slice(0, 2); });
    var names = L.names || {};
    var T = {
      id: id, num: L.num, title: L.title, short: L.short, sub: L.sub || ("Lecture " + L.num), blurb: L.blurb,
      h1: esc(L.h1 || L.title),
      start: { lede: inline(L.lede || L.blurb), six: (L.six || []).map(inline) },
      must: L.must || L.short,
      steps: steps, Q: Q, VOC: VOC, VCON: L.confusable || [],
      sheet: (L.sheet || []).map(function (s) { return [s[0], s[1], mapCells(s[2])]; }),
      mockNote: L.mockNote,
      cards: cards,
      names: {
        tab: names.tab || "Key facts", h1: names.h1 || (names.tab || "Key facts"), small: names.small || "",
        html: names.intro ? blocks(String(names.intro).split("\n")) : "",
        tables: (names.tables || []).map(function (t) { return { title: t.title, intro: t.intro, head: t.head, rows: mapCells(t.rows), from: t.from }; })
      },
      foot: L.foot ? inline(L.foot) : ""
    };
    if (L.status) T.start.status = inline(L.status);
    if (L.next) T.next = L.next;
    if (L.mastery !== false) T.mastery = { facts: L.facts || [] };
    return { topic: T, errors: [], warnings: res.warnings };
  }

  return { build: build, validate: validate, parseSteps: parseSteps, blocks: blocks, inline: inline };
});
