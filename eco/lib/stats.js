/* Generated from hub-kit/shell, edit there (then run: node ~/Projects/hub-kit/tools/build.js all). */
/* Study Hub Quantitative Statistics (lib/stats.js)
   Tracks active study time, question accuracy, response speed, mode breakdown, focus sprints, sessions,
   hourly/daily/weekly/monthly/semester/yearly usage bars, circadian profiles and per-lecture metrics
   across every subject in subjects.json. Plain JS + inline SVG, offline-ready, synced via Firestore. */
(function () {
  "use strict";

  var KEY = "studyHub.stats.v1";
  var IDLE_MS = 90000;
  var SESS_GAP_MS = 900000; // 15 min idle starts a new session

  /* HUB:BEGIN */
  var HUBS = [
    { id: "bio", name: "Bio Hub", short: "Bio", icon: "🧬", code: "ZEX108E", color: "var(--c1)", key: "bioHub.v1", examKey: "exam40" },
    { id: "eco", name: "Eco Hub", short: "Eco", icon: "🌿", code: "Ecology", color: "var(--ok)", key: "ecoHub.v1", examKey: "examfull" },
    { id: "geo", name: "Geology Hub", short: "Geo", icon: "🪨", code: "ZOX101E", color: "var(--c4)", key: "geoHub.v1", examKey: "exam40" }
  ];

  var CATALOG = {
    bio: [
      { id: "t1", num: 1, short: "Cell nucleus", steps: 7, q: 12, voc: 20, mas: true },
      { id: "t2", num: 2, short: "Genetic mechanisms", steps: 7, q: 12, voc: 22, mas: true },
      { id: "t3", num: 3, short: "Viruses", steps: 8, q: 12, voc: 17, mas: true },
      { id: "t4", num: 4, short: "Cells I", steps: 9, q: 12, voc: 16, mas: true },
      { id: "t5", num: 5, short: "Cells II", steps: 9, q: 12, voc: 19, mas: true },
      { id: "t6", num: 6, short: "Cell cycle", steps: 7, q: 12, voc: 22, mas: true },
      { id: "t7", num: 7, short: "Respiration", steps: 7, q: 12, voc: 16, mas: true },
      { id: "t8", num: 8, short: "Photosynthesis", steps: 7, q: 12, voc: 24, mas: true },
      { id: "t9", num: 9, short: "Plant physiology", steps: 14, q: 14, voc: 26, mas: true },
      { id: "t10", num: 10, short: "Animal physiology", steps: 8, q: 12, voc: 22, mas: true },
      { id: "t11", num: 11, short: "Taxonomy", steps: 8, q: 12, voc: 22, mas: true },
      { id: "t12", num: 12, short: "Evolution", steps: 8, q: 12, voc: 22, mas: true }
    ],
    eco: [
      { id: "t1", num: 1, short: "Basics & history", steps: 3, q: 15, voc: 16, mas: true },
      { id: "t2", num: 2, short: "Rules & islands", steps: 3, q: 14, voc: 11, mas: true },
      { id: "t3", num: 3, short: "Life histories", steps: 3, q: 12, voc: 10, mas: true },
      { id: "t4", num: 4, short: "Allee effects", steps: 4, q: 13, voc: 9, mas: true },
      { id: "t5", num: 5, short: "Top-down vs bottom-up", steps: 4, q: 13, voc: 11, mas: true },
      { id: "t6", num: 6, short: "Food webs", steps: 3, q: 12, voc: 10, mas: true },
      { id: "t7", num: 7, short: "Latitudinal gradient", steps: 4, q: 14, voc: 14, mas: true },
      { id: "t8", num: 8, short: "Counting species", steps: 3, q: 13, voc: 10, mas: true },
      { id: "t9", num: 9, short: "Sixth extinction", steps: 3, q: 13, voc: 9, mas: true },
      { id: "t10", num: 10, short: "Biodiversity drivers", steps: 3, q: 12, voc: 10, mas: true },
      { id: "t11", num: 11, short: "Value of nature", steps: 3, q: 12, voc: 10, mas: true },
      { id: "t12", num: 12, short: "Citizen science", steps: 3, q: 13, voc: 14, mas: true }
    ],
    geo: [
      { id: "t1", num: 1, short: "Intro & rules", steps: 4, q: 20, voc: 21, mas: true },
      { id: "t2", num: 2, short: "Minerals", steps: 9, q: 74, voc: 97, mas: true },
      { id: "t3", num: 3, short: "Igneous rocks", steps: 9, q: 70, voc: 78, mas: true },
      { id: "t4", num: 4, short: "Sedimentary rocks", steps: 9, q: 70, voc: 80, mas: true },
      { id: "t5", num: 5, short: "Metamorphic rocks", steps: 9, q: 58, voc: 85, mas: true },
      { id: "t6", num: 6, short: "Earth structure", steps: 9, q: 90, voc: 107, mas: true },
      { id: "t7", num: 7, short: "Structural & tectonics", steps: 12, q: 70, voc: 49, mas: true },
      { id: "t8", num: 8, short: "Historical geology I", steps: 12, q: 52, voc: 43, mas: true }
    ]
  };
  /* HUB:END */

  var HUB_IDS = HUBS.map(function (h) { return h.id; });
  function zeroVals() { var o = {}; HUB_IDS.forEach(function (h) { o[h] = 0; }); return o; }
  function sumVals(v) { var t = 0; HUB_IDS.forEach(function (h) { t += +v[h] || 0; }); return t; }
  function perHub(make) { var o = {}; HUB_IDS.forEach(function (h) { o[h] = make(); }); return o; }
  var HUB_BY_ID = {};
  HUBS.forEach(function (h) { HUB_BY_ID[h.id] = h; });
  var ECO_TICK_TOTAL = 24;
  var ECO_PATH_TOTAL = 72;

  var MODES = [
    { id: "learn", label: "📖 Lessons & steps" },
    { id: "quiz", label: "📝 Mock & exam quizzes" },
    { id: "mastery", label: "🏆 Mastery stars" },
    { id: "games", label: "🎮 Mini-games" },
    { id: "cards", label: "🃏 Flashcards" },
    { id: "tickall", label: "☑️ Tick-all drill" },
    { id: "path", label: "🧭 Study path" },
    { id: "review", label: "🔁 Wrong-answer review" },
    { id: "vocab", label: "📚 Vocab & dictionary" },
    { id: "browse", label: "🏠 Overview & browsing" }
  ];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function isObj(x) { return !!(x && typeof x === "object" && !Array.isArray(x)); }
  function pad2(n) { return n < 10 ? "0" + n : "" + n; }
  function dateKey(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  function shortDateKey(d) { return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function hourKey(d) { return dateKey(d) + "T" + pad2(d.getHours()); }

  function activeHubId() {
    var s = document.querySelector("script[data-hub]");
    if (s && s.getAttribute("data-hub")) return s.getAttribute("data-hub");
    if (!HUB_IDS.length) return "";
    var hubRe = new RegExp("\\/(" + HUB_IDS.join("|") + ")(?:\\/|$)");
    var m = hubRe.exec(location.pathname);
    return m ? m[1] : "";
  }

  /* ---------- Analytics Storage & Lossless Cloud Sync ---------- */
  function freshSess() { return { n: 0, sec: 0, max: 0, b: [0, 0, 0, 0, 0] }; }
  function freshData() {
    return {
      hrs: {},     // "YYYY-MM-DDTHH" -> { bio?: [sec, q, ok, xp, steps, ms], ... }
      modes: {},   // "<hub>:<mode>" -> [sec, q, ok, ms]
      topics: {},  // "<hub>:<tN>" -> [sec, q, ok, ms, revOk]
      seen: perHub(function () { return {}; }),
      sess: (function () { var o = perHub(freshSess); o.all = freshSess(); return o; })(),
      sprints: perHub(function () { return [0, 0, 0]; }) // [started, completed, secDone]
    };
  }

  function normArr(a, len) {
    var out = [];
    for (var i = 0; i < len; i++) out.push(Math.max(0, Math.round(+(a && a[i]) || 0)));
    return out;
  }
  function maxArr(a, b, len) {
    var out = [];
    for (var i = 0; i < len; i++) out.push(Math.max(+(a && a[i]) || 0, +(b && b[i]) || 0));
    return out;
  }

  function sanitizeData(raw) {
    var d = freshData();
    if (!isObj(raw)) return d;
    if (isObj(raw.hrs)) {
      var hkeys = Object.keys(raw.hrs).sort();
      if (hkeys.length > 4500) hkeys = hkeys.slice(hkeys.length - 4500);
      hkeys.forEach(function (hk) {
        var row = raw.hrs[hk];
        if (!isObj(row)) return;
        var clean = {}, has = false;
        HUB_IDS.forEach(function (hid) {
          if (Array.isArray(row[hid])) { clean[hid] = normArr(row[hid], 6); has = true; }
        });
        if (has) d.hrs[hk] = clean;
      });
    }
    if (isObj(raw.modes)) {
      Object.keys(raw.modes).slice(0, 90).forEach(function (mk) {
        if (Array.isArray(raw.modes[mk])) d.modes[mk] = normArr(raw.modes[mk], 4);
      });
    }
    if (isObj(raw.topics)) {
      Object.keys(raw.topics).slice(0, 180).forEach(function (tk) {
        if (Array.isArray(raw.topics[tk])) d.topics[tk] = normArr(raw.topics[tk], 5);
      });
    }
    if (isObj(raw.seen)) {
      HUB_IDS.forEach(function (hid) {
        if (isObj(raw.seen[hid])) {
          Object.keys(raw.seen[hid]).slice(0, 1000).forEach(function (qid) { d.seen[hid][qid] = 1; });
        }
      });
    }
    if (isObj(raw.sess)) {
      ["all"].concat(HUB_IDS).forEach(function (k) {
        var s = raw.sess[k];
        if (isObj(s)) {
          d.sess[k] = {
            n: Math.max(0, Math.round(+s.n || 0)),
            sec: Math.max(0, Math.round(+s.sec || 0)),
            max: Math.max(0, Math.round(+s.max || 0)),
            b: normArr(s.b, 5)
          };
        }
      });
    }
    if (isObj(raw.sprints)) {
      HUB_IDS.forEach(function (hid) {
        if (Array.isArray(raw.sprints[hid])) d.sprints[hid] = normArr(raw.sprints[hid], 3);
      });
    }
    return d;
  }

  function mergeData(a, b) {
    a = sanitizeData(a); b = sanitizeData(b);
    var out = freshData();
    var hkeys = Array.from(new Set(Object.keys(a.hrs).concat(Object.keys(b.hrs)))).sort();
    if (hkeys.length > 4500) hkeys = hkeys.slice(hkeys.length - 4500);
    hkeys.forEach(function (hk) {
      var ra = a.hrs[hk] || {}, rb = b.hrs[hk] || {}, rc = {}, has = false;
      HUB_IDS.forEach(function (hid) {
        if (ra[hid] || rb[hid]) { rc[hid] = maxArr(ra[hid], rb[hid], 6); has = true; }
      });
      if (has) out.hrs[hk] = rc;
    });
    Array.from(new Set(Object.keys(a.modes).concat(Object.keys(b.modes)))).slice(0, 90).forEach(function (mk) {
      out.modes[mk] = maxArr(a.modes[mk], b.modes[mk], 4);
    });
    Array.from(new Set(Object.keys(a.topics).concat(Object.keys(b.topics)))).slice(0, 180).forEach(function (tk) {
      out.topics[tk] = maxArr(a.topics[tk], b.topics[tk], 5);
    });
    HUB_IDS.forEach(function (hid) {
      out.seen[hid] = Object.assign({}, b.seen[hid] || {}, a.seen[hid] || {});
      out.sprints[hid] = maxArr(a.sprints[hid], b.sprints[hid], 3);
    });
    ["all"].concat(HUB_IDS).forEach(function (k) {
      var sa = a.sess[k] || freshSess(), sb = b.sess[k] || freshSess();
      out.sess[k] = {
        n: Math.max(sa.n, sb.n),
        sec: Math.max(sa.sec, sb.sec),
        max: Math.max(sa.max, sb.max),
        b: maxArr(sa.b, sb.b, 5)
      };
    });
    return out;
  }

  var D = freshData();
  try {
    var loaded = JSON.parse(localStorage.getItem(KEY) || "null");
    if (isObj(loaded)) D = sanitizeData(loaded);
  } catch (e) {}

  function saveLocal() {
    try { localStorage.setItem(KEY, JSON.stringify(D)); } catch (e) {}
  }

  /* Firestore sync at users/{uid}/hubs/analytics */
  var cloudDb = null, cloudUid = "", cloudUnsub = null, cloudTimer = null;

  function hasAnyTelemetry(d) {
    return !!(Object.keys(d.hrs).length || Object.keys(d.modes).length || Object.keys(d.topics).length);
  }

  function pushCloud() {
    if (!cloudDb || !cloudUid || !window.firebase) return;
    cloudDb.collection("users").doc(cloudUid).collection("hubs").doc("analytics").set({
      analytics: sanitizeData(D),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(function (e) {
      console.error("Analytics cloud save failed:", e);
    });
  }

  function scheduleCloudPush() {
    if (!cloudDb || !cloudUid) return;
    clearTimeout(cloudTimer);
    cloudTimer = setTimeout(pushCloud, 4000);
  }

  function persist(immediateCloud) {
    saveLocal();
    if (immediateCloud) pushCloud();
    else scheduleCloudPush();
  }

  function startAnalyticsCloud(info) {
    if (!info || !info.user || !info.db) {
      if (cloudUnsub) { cloudUnsub(); cloudUnsub = null; }
      cloudDb = null; cloudUid = "";
      return;
    }
    if (cloudUid === info.user.uid && cloudUnsub) return;
    if (cloudUnsub) { cloudUnsub(); cloudUnsub = null; }
    cloudDb = info.db;
    cloudUid = info.user.uid;
    var ref = cloudDb.collection("users").doc(cloudUid).collection("hubs").doc("analytics");
    var first = true;
    cloudUnsub = ref.onSnapshot(function (snap) {
      if (snap.metadata && snap.metadata.hasPendingWrites) return;
      var doc = (snap.exists && snap.data()) || null;
      var remote = doc && isObj(doc.analytics) ? doc.analytics : null;
      if (first) {
        first = false;
        if (remote) {
          var merged = mergeData(D, remote);
          D = merged;
          saveLocal();
          if (statsOpen) renderDashboard();
          if (JSON.stringify(merged) !== JSON.stringify(sanitizeData(remote))) pushCloud();
        } else if (hasAnyTelemetry(D)) {
          pushCloud();
        }
        return;
      }
      if (remote) {
        D = mergeData(D, remote);
        saveLocal();
        if (statsOpen) renderDashboard();
      }
    }, function (e) {
      console.error("Analytics listener error:", e);
    });
  }

  /* ---------- Live Telemetry Recording Inside Sub-Hubs ---------- */
  var curHub = activeHubId();
  var lastAct = Date.now();
  var qShownAt = Date.now();
  var statsOpen = false;
  var sessState = { active: false, lastTick: 0, sec: 0, bucket: -1, hubSec: 0, hubBucket: -1 };
  var activeSprintMin = 0;
  var dirtyTicks = 0;

  function sessBucketOf(sec) {
    if (sec < 300) return 0;      // < 5m
    if (sec < 900) return 1;      // 5–15m
    if (sec < 1800) return 2;     // 15–30m
    if (sec < 3600) return 3;     // 30–60m
    return 4;                     // 60m+
  }

  function hrSlot(d, hid) {
    var hk = hourKey(d);
    if (!D.hrs[hk]) D.hrs[hk] = {};
    if (!D.hrs[hk][hid]) D.hrs[hk][hid] = [0, 0, 0, 0, 0, 0];
    return D.hrs[hk][hid];
  }
  function modeSlot(hid, mode) {
    var mk = hid + ":" + mode;
    if (!D.modes[mk]) D.modes[mk] = [0, 0, 0, 0];
    return D.modes[mk];
  }
  function topicSlot(hid, tid) {
    var tk = hid + ":" + tid;
    if (!D.topics[tk]) D.topics[tk] = [0, 0, 0, 0, 0];
    return D.topics[tk];
  }

  function routeInfo() {
    var h = (location.hash || "#home").replace(/^#/, "") || "home";
    var m = /^(t\d+)(?:-([a-z]+))?$/.exec(h);
    if (m) {
      var sub = m[2] || "start";
      var map = { start: "browse", learn: "learn", mastery: "mastery", cards: "cards", games: "games", mock: "quiz", review: "review", sheet: "learn", names: "learn", vocab: "vocab", apply: "quiz" };
      return { topic: m[1], mode: map[sub] || "browse" };
    }
    if (h === "exam") return { topic: "", mode: "quiz" };
    if (h === "review") return { topic: "", mode: "review" };
    if (h === "dict") return { topic: "", mode: "vocab" };
    if (h === "tickall") return { topic: "", mode: "tickall" };
    if (h.indexOf("path-") === 0) return { topic: "", mode: "path" };
    return { topic: "", mode: "browse" };
  }

  /* Backfill today's XP into current hour once if user already earned XP today before stats.js existed */
  function backfillTodayOnce() {
    HUBS.forEach(function (h) {
      var s = readHubState(h.id);
      var tdShort = shortDateKey(new Date());
      var tdIso = dateKey(new Date());
      if (isObj(s.day) && s.day.d === tdShort && (+s.day.xp || 0) > 0) {
        var loggedTodayXP = 0;
        Object.keys(D.hrs).forEach(function (hk) {
          if (hk.slice(0, 10) === tdIso && D.hrs[hk][h.id]) loggedTodayXP += +D.hrs[hk][h.id][3] || 0;
        });
        if (loggedTodayXP === 0) {
          var slot = hrSlot(new Date(), h.id);
          slot[3] += Math.round(+s.day.xp || 0);
          saveLocal();
        }
      }
      if (Array.isArray(s.review)) {
        s.review.forEach(function (qid) { if (qid) D.seen[h.id][qid] = 1; });
      }
    });
  }

  function recordQuestion(ok, qid, topicOverride, modeOverride) {
    if (!curHub) return;
    var now = new Date();
    var r = routeInfo();
    var mode = modeOverride || r.mode || "quiz";
    var tid = topicOverride || r.topic || "";
    if (!tid && qid && window.GEO && GEO.ALL && GEO.ALL[qid]) tid = GEO.ALL[qid].t || "";
    var ms = Math.min(120000, Math.max(400, Date.now() - qShownAt));
    qShownAt = Date.now();

    var hs = hrSlot(now, curHub);
    hs[1] += 1;
    if (ok) hs[2] += 1;
    hs[5] += ms;

    var msSlot = modeSlot(curHub, mode);
    msSlot[1] += 1;
    if (ok) msSlot[2] += 1;
    msSlot[3] += ms;

    if (tid) {
      var ts = topicSlot(curHub, tid);
      ts[1] += 1;
      if (ok) ts[2] += 1;
      ts[3] += ms;
      if (ok && mode === "review") ts[4] += 1;
    }
    if (qid) D.seen[curHub][qid] = 1;
    persist(false);
  }

  function findQuestionByPrompt(promptText) {
    if (!promptText || !window.GEO || !GEO.ALL) return null;
    var t = promptText.trim();
    var ids = Object.keys(GEO.ALL);
    for (var i = 0; i < ids.length; i++) {
      var q = GEO.ALL[ids[i]];
      if (q && q.q === t) return q;
    }
    return null;
  }

  function wireSubHubTracking() {
    if (!curHub) return;

    ["pointerdown", "keydown", "touchstart", "scroll"].forEach(function (ev) {
      window.addEventListener(ev, function () { lastAct = Date.now(); }, { passive: true, capture: true });
    });
    var lastMove = 0;
    window.addEventListener("mousemove", function () {
      var n = Date.now();
      if (n - lastMove > 2000) { lastMove = n; lastAct = n; }
    }, { passive: true });

    /* Reset question timer whenever question prompt changes */
    var mainEl = document.querySelector("main");
    if (mainEl && window.MutationObserver) {
      var lastQText = "";
      var mo = new MutationObserver(function () {
        var qt = mainEl.querySelector(".view:not([hidden]) .qtext");
        var txt = qt ? qt.textContent : "";
        if (txt && txt !== lastQText) {
          lastQText = txt;
          qShownAt = Date.now();
        }
      });
      mo.observe(mainEl, { childList: true, subtree: true });
    }
    window.addEventListener("hashchange", function () { qShownAt = Date.now(); });

    /* Wrap CAT.onXP to capture every XP award, step completion and focus sprint completion */
    if (window.CAT && CAT.onXP && !CAT._statsWrapped) {
      var origOnXP = CAT.onXP;
      CAT.onXP = function (n, why) {
        if (n > 0 && curHub) {
          var hs = hrSlot(new Date(), curHub);
          hs[3] += Math.round(n);
          if (why === "step finished") hs[4] += 1;
          if (why === "focus sprint") {
            D.sprints[curHub][1] += 1;
            D.sprints[curHub][2] += (activeSprintMin || 10) * 60;
            activeSprintMin = 0;
          }
          persist(false);
        }
        return origOnXP.apply(this, arguments);
      };
      CAT._statsWrapped = true;
    }

    /* Track Focus sprint starts */
    var fp = document.getElementById("focuspanel");
    if (fp) {
      fp.addEventListener("click", function (e) {
        var b = e.target.closest("[data-min]");
        if (b && curHub) {
          activeSprintMin = +b.getAttribute("data-min") || 10;
          D.sprints[curHub][0] += 1;
          persist(false);
        }
      });
    }

    /* Passively detect question answers across quizzes, checks, Mastery, games, Tick-all and Study Path */
    document.addEventListener("click", function (e) {
      var opt = e.target.closest("button.opt");
      if (opt && !opt.disabled) {
        var chk = opt.closest(".chk[data-q]");
        var box = opt.closest("#quiz-mock, #quiz-exam, #review-body, .chk, #gamebox, #mbox, #whoami, #vquiz");
        if (box) {
          var qEl = box.querySelector(".qtext");
          var qObj = chk ? (window.GEO && GEO.ALL && GEO.ALL[chk.getAttribute("data-q")]) : findQuestionByPrompt(qEl ? qEl.textContent : "");
          setTimeout(function () {
            if (opt.classList.contains("ok") || opt.classList.contains("no")) {
              recordQuestion(opt.classList.contains("ok"), qObj ? qObj.id : "", qObj ? qObj.t : "");
            }
          }, 0);
        }
        return;
      }
      var tfBtn = e.target.closest("#gamebox .tf button");
      if (tfBtn && !tfBtn.disabled) {
        var prevScoreEl = document.querySelector("#gamebox [data-tfs]");
        var prevScore = prevScoreEl ? (+prevScoreEl.textContent || 0) : -1;
        setTimeout(function () {
          var nextScoreEl = document.querySelector("#gamebox [data-tfs]");
          var nextScore = nextScoreEl ? (+nextScoreEl.textContent || 0) : -1;
          if (prevScore >= 0 && nextScore >= 0) recordQuestion(nextScore > prevScore, "", "", "games");
        }, 0);
        return;
      }
      var tkBtn = e.target.closest('[data-tk="check"]');
      if (tkBtn) {
        var host = tkBtn.closest("#v-tickall");
        setTimeout(function () {
          var fb = host && host.querySelector(".fb:not([hidden])");
          if (fb) recordQuestion(fb.classList.contains("good"), "", "", "tickall");
        }, 0);
        return;
      }
      var ptOpt = e.target.closest("button.pt-opt");
      if (ptOpt && !ptOpt.disabled) {
        setTimeout(function () {
          if (ptOpt.classList.contains("good") || ptOpt.classList.contains("bad")) {
            recordQuestion(ptOpt.classList.contains("good"), "", "", "path");
          }
        }, 0);
      }
    }, true);

    /* Active 1-second study timer */
    setInterval(function () {
      if (document.visibilityState !== "visible") return;
      if (statsOpen || document.body.classList.contains("catopen")) return;
      var nowMs = Date.now();
      if (nowMs - lastAct > IDLE_MS) return;

      var now = new Date();
      var r = routeInfo();
      hrSlot(now, curHub)[0] += 1;
      modeSlot(curHub, r.mode)[0] += 1;
      if (r.topic) topicSlot(curHub, r.topic)[0] += 1;

      /* Session tracking */
      if (!sessState.active || (nowMs - sessState.lastTick > SESS_GAP_MS)) {
        sessState.active = true;
        sessState.sec = 1;
        sessState.bucket = 0;
        sessState.hubSec = 1;
        sessState.hubBucket = 0;
        D.sess.all.n += 1;
        D.sess.all.b[0] += 1;
        D.sess[curHub].n += 1;
        D.sess[curHub].b[0] += 1;
      } else {
        sessState.sec += 1;
        sessState.hubSec += 1;
        var nb = sessBucketOf(sessState.sec);
        if (nb !== sessState.bucket) {
          if (D.sess.all.b[sessState.bucket] > 0) D.sess.all.b[sessState.bucket] -= 1;
          D.sess.all.b[nb] += 1;
          sessState.bucket = nb;
        }
        var nhb = sessBucketOf(sessState.hubSec);
        if (nhb !== sessState.hubBucket) {
          if (D.sess[curHub].b[sessState.hubBucket] > 0) D.sess[curHub].b[sessState.hubBucket] -= 1;
          D.sess[curHub].b[nhb] += 1;
          sessState.hubBucket = nhb;
        }
      }
      sessState.lastTick = nowMs;
      D.sess.all.sec += 1;
      if (sessState.sec > D.sess.all.max) D.sess.all.max = sessState.sec;
      D.sess[curHub].sec += 1;
      if (sessState.hubSec > D.sess[curHub].max) D.sess[curHub].max = sessState.hubSec;

      dirtyTicks += 1;
      if (dirtyTicks >= 5) {
        dirtyTicks = 0;
        persist(false);
      }
    }, 1000);

    window.addEventListener("visibilitychange", function () {
      if (document.visibilityState !== "visible" && dirtyTicks > 0) { dirtyTicks = 0; persist(false); }
    });
    window.addEventListener("pagehide", function () {
      if (dirtyTicks > 0) { dirtyTicks = 0; saveLocal(); }
    });
  }

  /* ---------- Quantitative Readers & Aggregators ---------- */
  function readHubState(hid) {
    if (curHub === hid && window.GEO && GEO._getState) return GEO._getState() || {};
    var local = null, prev = null;
    try { local = JSON.parse(localStorage.getItem(HUB_BY_ID[hid].key) || "null"); } catch (e) {}
    try {
      var pm = JSON.parse(localStorage.getItem("studyHub.cloudPreview") || "null");
      if (pm && isObj(pm[hid])) prev = pm[hid];
    } catch (e) {}
    if (isObj(local) && (+local.xp > 0 || (isObj(local.tp) && Object.keys(local.tp).length))) return local;
    return isObj(prev) ? prev : (isObj(local) ? local : {});
  }

  function catalogFor(hid) {
    if (curHub === hid && window.GEO && Array.isArray(GEO.topics) && GEO.topics.length) {
      return GEO.topics.map(function (t) {
        return { id: t.id, num: t.num, short: t.short || t.title, steps: (t.steps || []).length, q: (t.Q || []).length, voc: (t.VOC || []).length, mas: !!t.mastery };
      });
    }
    return CATALOG[hid] || [];
  }

  function fmtDur(sec) {
    sec = Math.max(0, Math.round(+sec || 0));
    if (sec < 60) return sec + "s";
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
    if (h > 0) return h + "h " + pad2(m) + "m";
    var s = sec % 60;
    return m >= 10 ? m + "m" : m + "m " + pad2(s) + "s";
  }
  function fmtMin(sec) {
    var m = (+sec || 0) / 60;
    return m >= 10 ? Math.round(m) + "m" : m.toFixed(1) + "m";
  }
  function fmtPct(num, den) {
    if (!den) return "—";
    return (num / den * 100).toFixed(1) + "%";
  }

  function scopeHubs(scope) {
    return scope === "all" ? HUB_IDS : [scope];
  }

  /* Compute comprehensive snapshot for selected scope ("all" | "bio" | "eco" | "geo") */
  function computeSnapshot(scope) {
    var hids = scopeHubs(scope);
    var out = {
      sec: 0, q: 0, ok: 0, ms: 0, revCleared: 0,
      xp: 0, stepsDone: 0, stepsTot: 0, bitesDone: 0,
      starsDone: 0, starsTot: 0, starByTier: [0, 0, 0, 0],
      qBank: 0, vocBank: 0, qSeen: 0, revPending: 0,
      bestExamPct: null, sprintStart: 0, sprintDone: 0, sprintSec: 0,
      activeDaysSet: {}, byDaySec: {}, byHourOfDay: [], byDow: [],
      sec7: 0, secPrev7: 0, q7: 0, ok7: 0, xp7: 0,
      ecoTickDone: 0, ecoPathDone: 0,
      perHub: {}, lectures: []
    };
    for (var h = 0; h < 24; h++) out.byHourOfDay.push([0, 0, 0]); // [sec, q, ok]
    for (var w = 0; w < 7; w++) out.byDow.push([0, 0, 0]);        // Mon=0..Sun=6: [sec, q, ok]

    var now = new Date();
    var todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    hids.forEach(function (hid) {
      out.perHub[hid] = {
        sec: 0, q: 0, ok: 0, ms: 0, xp: 0,
        stepsDone: 0, stepsTot: 0, starsDone: 0, starsTot: 0,
        qBank: 0, qSeen: 0, revPending: 0, bestExamPct: null
      };
    });

    /* Aggregate hourly telemetry */
    Object.keys(D.hrs).forEach(function (hk) {
      var row = D.hrs[hk];
      var yr = +hk.slice(0, 4), mo = +hk.slice(5, 7) - 1, dy = +hk.slice(8, 10), hr = +hk.slice(11, 13);
      var dObj = new Date(yr, mo, dy);
      var dk = hk.slice(0, 10);
      var dow = (dObj.getDay() + 6) % 7; // Mon=0..Sun=6
      var diffDays = Math.round((todayMid - dObj.getTime()) / 864e5);

      hids.forEach(function (hid) {
        var v = row[hid];
        if (!v) return;
        var sec = +v[0] || 0, q = +v[1] || 0, ok = +v[2] || 0, xp = +v[3] || 0, ms = +v[5] || 0;
        out.sec += sec; out.q += q; out.ok += ok; out.ms += ms;
        out.perHub[hid].sec += sec; out.perHub[hid].q += q; out.perHub[hid].ok += ok; out.perHub[hid].ms += ms;
        if (sec > 0 || q > 0 || xp > 0) {
          out.activeDaysSet[dk] = 1;
          out.byDaySec[dk] = (out.byDaySec[dk] || 0) + sec;
        }
        if (hr >= 0 && hr < 24) {
          out.byHourOfDay[hr][0] += sec;
          out.byHourOfDay[hr][1] += q;
          out.byHourOfDay[hr][2] += ok;
        }
        out.byDow[dow][0] += sec;
        out.byDow[dow][1] += q;
        out.byDow[dow][2] += ok;
        if (diffDays >= 0 && diffDays < 7) {
          out.sec7 += sec; out.q7 += q; out.ok7 += ok; out.xp7 += xp;
        } else if (diffDays >= 7 && diffDays < 14) {
          out.secPrev7 += sec;
        }
      });
    });

    /* Per-hub state + lecture rows */
    hids.forEach(function (hid) {
      var st = readHubState(hid);
      var cat = catalogFor(hid);
      var ph = out.perHub[hid];

      ph.xp = +st.xp || 0;
      out.xp += ph.xp;

      var revArr = Array.isArray(st.review) ? st.review : [];
      ph.revPending = revArr.length;
      out.revPending += ph.revPending;

      var seenSet = Object.assign({}, D.seen[hid] || {});
      revArr.forEach(function (qid) { if (qid) seenSet[qid] = 1; });

      var sp = D.sprints[hid] || [0, 0, 0];
      out.sprintStart += +sp[0] || 0;
      out.sprintDone += +sp[1] || 0;
      out.sprintSec += +sp[2] || 0;

      if (isObj(st.best)) {
        var ex = st.best.examfull || st.best.exam40;
        if (ex && ex.n > 0) {
          ph.bestExamPct = Math.round(ex.s / ex.n * 1000) / 10;
          if (out.bestExamPct === null || ph.bestExamPct > out.bestExamPct) out.bestExamPct = ph.bestExamPct;
        }
      }

      cat.forEach(function (lec) {
        ph.stepsTot += lec.steps;
        out.stepsTot += lec.steps;
        ph.qBank += lec.q;
        out.qBank += lec.q;
        out.vocBank += lec.voc;

        var tp = (isObj(st.tp) && isObj(st.tp[lec.id])) ? st.tp[lec.id] : {};
        var doneObj = isObj(tp.done) ? tp.done : {};
        var sDone = Object.keys(doneObj).filter(function (k) { return doneObj[k]; }).length;
        if (sDone > lec.steps) sDone = lec.steps;
        ph.stepsDone += sDone;
        out.stepsDone += sDone;

        if (isObj(tp.bites)) {
          Object.keys(tp.bites).forEach(function (bk) { out.bitesDone += +tp.bites[bk] || 0; });
        }

        var lStars = 0;
        if (lec.mas) {
          ph.starsTot += 4;
          out.starsTot += 4;
          var m = (isObj(st.mas) && isObj(st.mas[lec.id])) ? st.mas[lec.id] : {};
          var mstars = isObj(m.stars) ? m.stars : {};
          for (var k = 1; k <= 4; k++) {
            if (mstars[k] && m.faded !== k) {
              lStars++;
              out.starByTier[k - 1]++;
            }
          }
          ph.starsDone += lStars;
          out.starsDone += lStars;
          /* Mastery got items also count toward unique bank items seen */
          if (isObj(m.got)) {
            Object.keys(m.got).forEach(function (gk) {
              if (gk.indexOf("q:") === 0) seenSet[gk.slice(2)] = 1;
            });
          }
        }

        var mockPct = null;
        if (isObj(tp.best)) {
          var mb = tp.best.mock7 || tp.best.all;
          if (mb && mb.n > 0) mockPct = Math.round(mb.s / mb.n * 1000) / 10;
        }

        var tStat = D.topics[hid + ":" + lec.id] || [0, 0, 0, 0, 0];
        out.revCleared += +tStat[4] || 0;

        out.lectures.push({
          hub: hid,
          id: lec.id,
          num: lec.num,
          short: lec.short,
          sec: +tStat[0] || 0,
          stepsDone: sDone,
          stepsTot: lec.steps,
          stepsPct: lec.steps ? (sDone / lec.steps * 100) : 0,
          stars: lStars,
          starsTot: lec.mas ? 4 : 0,
          qAns: +tStat[1] || 0,
          qOk: +tStat[2] || 0,
          accPct: (+tStat[1] > 0) ? (tStat[2] / tStat[1] * 100) : -1,
          avgSq: (+tStat[1] > 0) ? (tStat[3] / tStat[1] / 1000) : -1,
          mockPct: mockPct !== null ? mockPct : -1,
          qBank: lec.q
        });
      });

      ph.qSeen = Math.min(ph.qBank, Object.keys(seenSet).length);
      out.qSeen += ph.qSeen;
    });

    if (HUB_BY_ID.eco && (scope === "all" || scope === "eco")) { // Eco Hub only: tick-all and study path counters
      try {
        var tk = JSON.parse(localStorage.getItem("ecoHub.tick") || "null");
        if (tk && isObj(tk.best)) out.ecoTickDone = Object.keys(tk.best).filter(function (k) { return tk.best[k]; }).length;
      } catch (e) {}
      try {
        var pt = JSON.parse(localStorage.getItem("ecoHub.path") || "null");
        if (pt && isObj(pt.done)) out.ecoPathDone = Object.keys(pt.done).filter(function (k) { return pt.done[k]; }).length;
      } catch (e) {}
    }

    /* Streaks from active days + hub streaks */
    var maxHubStreak = 0;
    hids.forEach(function (hid) {
      var st = readHubState(hid);
      if (isObj(st.streak) && (+st.streak.n || 0) > maxHubStreak) maxHubStreak = +st.streak.n || 0;
    });
    var dayKeys = Object.keys(out.activeDaysSet).sort();
    var bestRun = 0, run = 0, prevMs = 0;
    dayKeys.forEach(function (dk) {
      var ms = new Date(+dk.slice(0, 4), +dk.slice(5, 7) - 1, +dk.slice(8, 10)).getTime();
      run = (prevMs && Math.round((ms - prevMs) / 864e5) === 1) ? run + 1 : 1;
      if (run > bestRun) bestRun = run;
      prevMs = ms;
    });
    var curRun = 0;
    for (var back = 0; back < 400; back++) {
      var ck = dateKey(new Date(todayMid - back * 864e5));
      if (out.activeDaysSet[ck]) curRun++;
      else if (back === 0) continue; // still today
      else break;
    }
    out.curStreak = Math.max(curRun, maxHubStreak);
    out.bestStreak = Math.max(bestRun, out.curStreak);
    out.activeDays = Math.max(dayKeys.length, out.curStreak > 0 ? out.curStreak : 0);

    return out;
  }

  /* ---------- Time-Bucket Builder for Usage Bar Chart ---------- */
  function startOfISOWeek(d) {
    var c = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var day = (c.getDay() + 6) % 7;
    c.setDate(c.getDate() - day);
    return c;
  }

  /* Academic semester bounds around a reference date + offset */
  function getSemesterInfo(offset) {
    var now = new Date();
    // Each academic year has 2 main semesters:
    // idx = year * 2 + (0 = Spring Feb 15..Aug 31, 1 = Winter Sep 21..Feb 14 next year)
    var y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();
    var curSemIdx = (m > 9 || (m === 9 && d >= 21)) ? (y * 2 + 1) : (m < 2 || (m === 2 && d <= 14)) ? ((y - 1) * 2 + 1) : (y * 2);
    var target = curSemIdx + offset;
    var isWinter = (target % 2 + 2) % 2 === 1;
    var baseYear = Math.floor((target - (isWinter ? 1 : 0)) / 2);
    var start = isWinter ? new Date(baseYear, 8, 28) : new Date(baseYear, 1, 15); // Sep 28 or Feb 15
    start = startOfISOWeek(start);
    var weeks = 20;
    var label = isWinter
      ? ("Winter " + baseYear + "/" + String(baseYear + 1).slice(2) + " (Sep–Feb)")
      : ("Summer " + baseYear + " (Feb–Jun)");
    return { start: start, weeks: weeks, label: label };
  }

  function metricValFromArr(arr, metric) {
    if (!arr) return 0;
    if (metric === "min") return (+arr[0] || 0) / 60;
    if (metric === "q") return +arr[1] || 0;
    if (metric === "xp") return +arr[3] || 0;
    if (metric === "steps") return +arr[4] || 0;
    return 0;
  }

  function sumDayMetric(dk, hid, metric) {
    var sum = 0;
    for (var h = 0; h < 24; h++) {
      var hk = dk + "T" + pad2(h);
      if (D.hrs[hk] && D.hrs[hk][hid]) sum += metricValFromArr(D.hrs[hk][hid], metric);
    }
    return sum;
  }

  function buildChartSeries(scope, range, offset, metric) {
    var hids = scopeHubs(scope);
    var now = new Date();
    var buckets = [];
    var periodLabel = "";
    var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var DOWS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    if (range === "day") {
      var day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      var dk = dateKey(day);
      periodLabel = DOWS[(day.getDay() + 6) % 7] + " " + day.getDate() + " " + MONTHS[day.getMonth()] + " " + day.getFullYear();
      for (var hr = 0; hr < 24; hr++) {
        var hk = dk + "T" + pad2(hr);
        var vals = zeroVals(), q = 0, ok = 0, sec = 0;
        hids.forEach(function (hid) {
          var a = D.hrs[hk] && D.hrs[hk][hid];
          vals[hid] = metricValFromArr(a, metric);
          if (a) { sec += +a[0] || 0; q += +a[1] || 0; ok += +a[2] || 0; }
        });
        buckets.push({
          short: hr % 3 === 0 ? pad2(hr) : "",
          full: pad2(hr) + ":00–" + pad2(hr) + ":59 (" + periodLabel + ")",
          vals: vals,
          total: sumVals(vals),
          sec: sec, q: q, ok: ok
        });
      }
    } else if (range === "week") {
      var wStart = startOfISOWeek(now);
      wStart.setDate(wStart.getDate() + offset * 7);
      var wEnd = new Date(wStart.getFullYear(), wStart.getMonth(), wStart.getDate() + 6);
      periodLabel = wStart.getDate() + " " + MONTHS[wStart.getMonth()] + " – " + wEnd.getDate() + " " + MONTHS[wEnd.getMonth()] + " " + wEnd.getFullYear();
      for (var i = 0; i < 7; i++) {
        var cd = new Date(wStart.getFullYear(), wStart.getMonth(), wStart.getDate() + i);
        var cdk = dateKey(cd);
        var wvals = zeroVals(), wq = 0, wok = 0, wsec = 0;
        hids.forEach(function (hid) {
          wvals[hid] = sumDayMetric(cdk, hid, metric);
          for (var h2 = 0; h2 < 24; h2++) {
            var a2 = D.hrs[cdk + "T" + pad2(h2)] && D.hrs[cdk + "T" + pad2(h2)][hid];
            if (a2) { wsec += +a2[0] || 0; wq += +a2[1] || 0; wok += +a2[2] || 0; }
          }
        });
        buckets.push({
          short: DOWS[i],
          full: DOWS[i] + " " + cd.getDate() + " " + MONTHS[cd.getMonth()] + " " + cd.getFullYear(),
          vals: wvals,
          total: sumVals(wvals),
          sec: wsec, q: wq, ok: wok
        });
      }
    } else if (range === "month") {
      var mDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      var daysInMonth = new Date(mDate.getFullYear(), mDate.getMonth() + 1, 0).getDate();
      periodLabel = MONTHS[mDate.getMonth()] + " " + mDate.getFullYear();
      for (var dNum = 1; dNum <= daysInMonth; dNum++) {
        var md = new Date(mDate.getFullYear(), mDate.getMonth(), dNum);
        var mdk = dateKey(md);
        var mvals = zeroVals(), mq = 0, mok = 0, msec = 0;
        hids.forEach(function (hid) {
          mvals[hid] = sumDayMetric(mdk, hid, metric);
          for (var h3 = 0; h3 < 24; h3++) {
            var a3 = D.hrs[mdk + "T" + pad2(h3)] && D.hrs[mdk + "T" + pad2(h3)][hid];
            if (a3) { msec += +a3[0] || 0; mq += +a3[1] || 0; mok += +a3[2] || 0; }
          }
        });
        buckets.push({
          short: (dNum === 1 || dNum % 5 === 0 || dNum === daysInMonth) ? String(dNum) : "",
          full: DOWS[(md.getDay() + 6) % 7] + " " + dNum + " " + MONTHS[mDate.getMonth()] + " " + mDate.getFullYear(),
          vals: mvals,
          total: sumVals(mvals),
          sec: msec, q: mq, ok: mok
        });
      }
    } else if (range === "semester") {
      var sem = getSemesterInfo(offset);
      periodLabel = sem.label;
      for (var wk = 0; wk < sem.weeks; wk++) {
        var sw0 = new Date(sem.start.getFullYear(), sem.start.getMonth(), sem.start.getDate() + wk * 7);
        var sw1 = new Date(sw0.getFullYear(), sw0.getMonth(), sw0.getDate() + 6);
        var svals = zeroVals(), sq = 0, sok = 0, ssec = 0;
        for (var sd = 0; sd < 7; sd++) {
          var curD = new Date(sw0.getFullYear(), sw0.getMonth(), sw0.getDate() + sd);
          var sdk = dateKey(curD);
          hids.forEach(function (hid) {
            svals[hid] += sumDayMetric(sdk, hid, metric);
            for (var h4 = 0; h4 < 24; h4++) {
              var a4 = D.hrs[sdk + "T" + pad2(h4)] && D.hrs[sdk + "T" + pad2(h4)][hid];
              if (a4) { ssec += +a4[0] || 0; sq += +a4[1] || 0; sok += +a4[2] || 0; }
            }
          });
        }
        buckets.push({
          short: (wk % 2 === 0 || wk === sem.weeks - 1) ? ("W" + (wk + 1)) : "",
          full: "Week " + (wk + 1) + " (" + sw0.getDate() + " " + MONTHS[sw0.getMonth()] + " – " + sw1.getDate() + " " + MONTHS[sw1.getMonth()] + ")",
          vals: svals,
          total: sumVals(svals),
          sec: ssec, q: sq, ok: sok
        });
      }
    } else {
      // year
      var yrNum = now.getFullYear() + offset;
      periodLabel = String(yrNum);
      for (var mn = 0; mn < 12; mn++) {
        var prefix = yrNum + "-" + pad2(mn + 1) + "-";
        var yvals = zeroVals(), yq = 0, yok = 0, ysec = 0;
        Object.keys(D.hrs).forEach(function (hk) {
          if (hk.indexOf(prefix) !== 0) return;
          hids.forEach(function (hid) {
            var ay = D.hrs[hk][hid];
            if (ay) {
              yvals[hid] += metricValFromArr(ay, metric);
              ysec += +ay[0] || 0; yq += +ay[1] || 0; yok += +ay[2] || 0;
            }
          });
        });
        buckets.push({
          short: MONTHS[mn],
          full: MONTHS[mn] + " " + yrNum,
          vals: yvals,
          total: sumVals(yvals),
          sec: ysec, q: yq, ok: yok
        });
      }
    }

    return { periodLabel: periodLabel, buckets: buckets };
  }

  /* ---------- Dashboard UI State & Renderer ---------- */
  var UI = {
    scope: "all",
    range: "week",
    offset: 0,
    metric: "min",
    selBar: -1,
    sortCol: "num",
    sortAsc: true
  };
  var lastFocusEl = null;

  function injectStyles() {
    if (document.getElementById("st-styles")) return;
    var s = document.createElement("style");
    s.id = "st-styles";
    s.textContent =
      ".stapp{position:fixed;inset:0;z-index:43;background:var(--bg);display:flex;flex-direction:column}" +
      ".stapp[hidden]{display:none}" +
      "body.stopen{overflow:hidden}" +
      ".st-top{background:var(--card);border-bottom:1px solid var(--line);padding:10px 16px}" +
      ".st-top-in{max-width:940px;margin:0 auto;display:flex;align-items:center;gap:10px;flex-wrap:wrap}" +
      ".st-top-in b{font-family:var(--font-d);font-size:1.2rem}" +
      ".st-scopes{display:flex;gap:5px;flex-wrap:wrap;margin-left:auto}" +
      ".st-pill{border:1.5px solid var(--line);background:var(--soft);color:var(--ink);border-radius:99px;padding:4px 11px;font-size:.83rem;font-weight:700;white-space:nowrap}" +
      ".st-pill:hover{border-color:var(--acc)}" +
      ".st-pill.on{background:var(--acc);color:var(--acc-ink);border-color:var(--acc)}" +
      ".st-x{border:1px solid var(--line);background:var(--soft);color:var(--ink);border-radius:10px;width:36px;height:36px;font-size:1.05rem;flex:none}" +
      ".st-body{flex:1;overflow-y:auto;padding:16px 16px 64px;-webkit-overflow-scrolling:touch}" +
      ".st-in{max-width:940px;margin:0 auto}" +
      ".st-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(195px,1fr));gap:10px;margin-bottom:14px}" +
      ".st-kpi{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:2px}" +
      ".st-kpi .kl{font-size:.73rem;letter-spacing:.06em;text-transform:uppercase;color:var(--mute);font-weight:700}" +
      ".st-kpi .kv{font-family:var(--font-m);font-size:1.45rem;font-weight:700;line-height:1.25;color:var(--ink)}" +
      ".st-kpi .ks{font-size:.8rem;color:var(--mute)}" +
      ".st-card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:15px 16px;margin:12px 0}" +
      ".st-card h2{font-size:1.15rem;margin:0 0 10px}" +
      ".st-barctl{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;margin-bottom:10px}" +
      ".st-seg{display:inline-flex;flex-wrap:wrap;gap:4px;background:var(--soft);padding:3px;border-radius:10px;border:1px solid var(--line)}" +
      ".st-seg button{border:0;background:none;color:var(--mute);font-weight:700;font-size:.8rem;padding:4px 9px;border-radius:7px;white-space:nowrap}" +
      ".st-seg button.on{background:var(--card);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.12)}" +
      ".st-nav{display:inline-flex;align-items:center;gap:6px;font-size:.86rem;font-weight:700}" +
      ".st-nav button{border:1px solid var(--line);background:var(--soft);border-radius:8px;padding:3px 9px;font-weight:700}" +
      ".st-svg{width:100%;height:auto;display:block;overflow:visible;user-select:none}" +
      ".st-svg text{font-family:var(--font-m);font-size:10px;fill:var(--mute)}" +
      ".st-gridln{stroke:var(--line);stroke-width:1;stroke-dasharray:3 3}" +
      ".st-axisln{stroke:var(--line);stroke-width:1.2}" +
      ".st-bcol{cursor:pointer}" +
      ".st-bcol:hover rect.st-hit{fill:var(--acc-soft);opacity:.45}" +
      ".st-bcol.sel rect.st-hit{fill:var(--acc-soft);opacity:.7}" +
      ".st-inspect{margin-top:8px;padding:8px 11px;border-radius:10px;background:var(--soft);font-size:.84rem;display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;justify-content:space-between}" +
      ".st-leg{display:flex;flex-wrap:wrap;gap:12px;font-size:.8rem;color:var(--mute);margin-top:8px;align-items:center}" +
      ".st-sw{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}" +
      ".st-2col{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:12px}" +
      ".st-mline{display:grid;grid-template-columns:minmax(120px,1.2fr) minmax(80px,1fr) auto;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--line);font-size:.85rem}" +
      ".st-mline:last-child{border-bottom:0}" +
      ".st-pbar{height:8px;background:var(--soft);border-radius:99px;overflow:hidden}" +
      ".st-pbar i{display:block;height:100%;background:var(--acc);border-radius:99px}" +
      ".st-num{font-family:var(--font-m);font-size:.82rem;text-align:right;white-space:nowrap}" +
      ".st-tw{overflow-x:auto;margin-top:6px}" +
      ".st-tbl{width:100%;border-collapse:collapse;font-size:.85rem}" +
      ".st-tbl th,.st-tbl td{padding:7px 8px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}" +
      ".st-tbl th:first-child,.st-tbl td:first-child{text-align:left;white-space:normal;min-width:140px}" +
      ".st-tbl th{font-size:.72rem;letter-spacing:.05em;text-transform:uppercase;color:var(--mute);cursor:pointer;user-select:none}" +
      ".st-tbl th:hover{color:var(--ink)}" +
      ".st-tbl td.m{font-family:var(--font-m)}" +
      ".st-heat{display:block;width:100%;max-width:680px;height:auto}";
    document.head.appendChild(s);
  }

  function renderBarChartSVG(series, scope, metric) {
    var B = series.buckets, n = B.length;
    var W = 680, H = 205, padL = 44, padR = 10, padT = 14, padB = 26;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var maxV = 0;
    B.forEach(function (b) { if (b.total > maxV) maxV = b.total; });
    var niceMax = maxV <= 0 ? (metric === "min" ? 30 : 10) : (maxV <= 5 ? 5 : Math.ceil(maxV * 1.15 / 5) * 5);
    var unit = metric === "min" ? "m" : "";

    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="st-svg" role="img" aria-label="Usage bar chart">';
    [0, 0.5, 1].forEach(function (f) {
      var y = Math.round(padT + plotH * (1 - f)) + 0.5;
      var lbl = Math.round(niceMax * f * 10) / 10 + unit;
      svg += '<line class="' + (f === 0 ? 'st-axisln' : 'st-gridln') + '" x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '"/>';
      svg += '<text x="' + (padL - 6) + '" y="' + (y + 3) + '" text-anchor="end">' + lbl + '</text>';
    });

    var slotW = plotW / n;
    var barW = Math.max(4, Math.min(34, slotW * 0.68));
    var order = scope === "all" ? HUB_IDS : [scope];

    B.forEach(function (b, idx) {
      var x0 = padL + idx * slotW + (slotW - barW) / 2;
      var selCls = UI.selBar === idx ? " sel" : "";
      svg += '<g class="st-bcol' + selCls + '" data-bar="' + idx + '">';
      svg += '<rect class="st-hit" x="' + (padL + idx * slotW) + '" y="' + padT + '" width="' + slotW + '" height="' + plotH + '" fill="transparent"/>';
      var yCur = padT + plotH;
      order.forEach(function (hid) {
        var v = b.vals[hid] || 0;
        if (v <= 0) return;
        var bh = Math.max(1.5, (v / niceMax) * plotH);
        yCur -= bh;
        svg += '<rect x="' + x0.toFixed(1) + '" y="' + yCur.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="2" style="fill:' + HUB_BY_ID[hid].color + '"/>';
      });
      if (b.short) {
        svg += '<text x="' + (padL + (idx + 0.5) * slotW).toFixed(1) + '" y="' + (H - 7) + '" text-anchor="middle">' + esc(b.short) + '</text>';
      }
      svg += '</g>';
    });
    svg += '</svg>';
    return svg;
  }

  function fmtMetricVal(v, metric) {
    if (metric === "min") return v.toFixed(1) + " min";
    if (metric === "q") return Math.round(v) + " questions";
    if (metric === "xp") return Math.round(v) + " XP";
    return Math.round(v) + " steps";
  }

  function renderCircadianSVG(byHour) {
    var W = 420, H = 125, padL = 28, padR = 8, padT = 10, padB = 22;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var maxMin = 1;
    byHour.forEach(function (x) { var m = x[0] / 60; if (m > maxMin) maxMin = m; });
    var slotW = plotW / 24, barW = Math.max(3, slotW * 0.7);
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="st-svg" role="img" aria-label="Study volume by hour of day">';
    svg += '<line class="st-axisln" x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (W - padR) + '" y2="' + (padT + plotH) + '"/>';
    svg += '<text x="' + (padL - 4) + '" y="' + (padT + 8) + '" text-anchor="end">' + Math.ceil(maxMin) + 'm</text>';
    for (var h = 0; h < 24; h++) {
      var min = byHour[h][0] / 60;
      var bh = min > 0 ? Math.max(2, (min / maxMin) * plotH) : 0;
      var x = padL + h * slotW + (slotW - barW) / 2;
      if (bh > 0) svg += '<rect x="' + x.toFixed(1) + '" y="' + (padT + plotH - bh).toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="2" style="fill:var(--acc)"/>';
      if (h % 4 === 0) svg += '<text x="' + (padL + (h + 0.5) * slotW).toFixed(1) + '" y="' + (H - 5) + '" text-anchor="middle">' + pad2(h) + '</text>';
    }
    svg += '</svg>';
    return svg;
  }

  function renderHeatmapSVG(byDaySec) {
    var weeks = 16, cell = 13, gap = 3, step = cell + gap;
    var padL = 28, padT = 16;
    var W = padL + weeks * step + 4, H = padT + 7 * step + 4;
    var thisMon = startOfISOWeek(new Date());
    var startMon = new Date(thisMon.getFullYear(), thisMon.getMonth(), thisMon.getDate() - (weeks - 1) * 7);
    var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="st-svg st-heat" role="img" aria-label="16-week daily consistency heatmap">';
    ["Mon", "", "Wed", "", "Fri", "", "Sun"].forEach(function (lb, r) {
      if (lb) svg += '<text x="0" y="' + (padT + r * step + 10) + '">' + lb + '</text>';
    });
    var lastMo = -1;
    for (var w = 0; w < weeks; w++) {
      var wkDate = new Date(startMon.getFullYear(), startMon.getMonth(), startMon.getDate() + w * 7);
      if (wkDate.getMonth() !== lastMo) {
        lastMo = wkDate.getMonth();
        svg += '<text x="' + (padL + w * step) + '" y="11">' + MONTHS[lastMo] + '</text>';
      }
      for (var r = 0; r < 7; r++) {
        var cd = new Date(wkDate.getFullYear(), wkDate.getMonth(), wkDate.getDate() + r);
        var dk = dateKey(cd);
        var min = (byDaySec[dk] || 0) / 60;
        var op = min <= 0 ? 0 : min < 15 ? 0.32 : min < 30 ? 0.55 : min < 60 ? 0.78 : 1;
        var fill = op === 0 ? "var(--soft)" : "var(--ok)";
        svg += '<rect x="' + (padL + w * step) + '" y="' + (padT + r * step) + '" width="' + cell + '" height="' + cell + '" rx="3" style="fill:' + fill + (op > 0 && op < 1 ? ';opacity:' + op : '') + '"><title>' + dk + ': ' + min.toFixed(1) + ' min</title></rect>';
      }
    }
    svg += '</svg>';
    return svg;
  }

  function renderDashboard() {
    var body = document.getElementById("stbody");
    if (!body) return;

    Array.prototype.forEach.call(document.querySelectorAll("[data-st-scope]"), function (b) {
      b.classList.toggle("on", b.getAttribute("data-st-scope") === UI.scope);
    });

    var S = computeSnapshot(UI.scope);
    var series = buildChartSeries(UI.scope, UI.range, UI.offset, UI.metric);
    var sess = D.sess[UI.scope] || D.sess.all || freshSess();

    var delta7 = S.secPrev7 > 0
      ? ((S.sec7 >= S.secPrev7 ? "+" : "") + Math.round((S.sec7 - S.secPrev7) / S.secPrev7 * 100) + "% vs prev 7d")
      : ((S.sec7 / 60 / 7).toFixed(1) + " min/d (last 7d)");
    var qPerMin = S.sec > 0 && S.q > 0 ? (S.q / (S.sec / 60)).toFixed(2) + " q/min" : "0.00 q/min";
    var avgSq = S.q > 0 ? (S.ms / S.q / 1000).toFixed(1) + "s" : "—";

    var h = '<div class="st-in">';

    /* 1. 8 Quantitative KPI Cards */
    h += '<div class="st-kpis">' +
      '<div class="st-kpi"><span class="kl">Active Study Time</span><span class="kv">' + fmtDur(S.sec) + '</span><span class="ks">' + esc(delta7) + ' · ' + S.activeDays + ' active d</span></div>' +
      '<div class="st-kpi"><span class="kl">Questions Answered</span><span class="kv">' + S.q + '</span><span class="ks">' + S.ok + ' right · ' + (S.q - S.ok) + ' wrong · ' + qPerMin + '</span></div>' +
      '<div class="st-kpi"><span class="kl">Accuracy Rate</span><span class="kv">' + fmtPct(S.ok, S.q) + '</span><span class="ks">7d rolling: ' + fmtPct(S.ok7, S.q7) + '</span></div>' +
      '<div class="st-kpi"><span class="kl">Response Speed</span><span class="kv">' + avgSq + '</span><span class="ks">Avg time per question</span></div>' +
      '<div class="st-kpi"><span class="kl">Total XP Earned</span><span class="kv">' + S.xp + ' XP</span><span class="ks">7d: +' + S.xp7 + ' XP · 🔥 ' + S.curStreak + 'd (best ' + S.bestStreak + 'd)</span></div>' +
      '<div class="st-kpi"><span class="kl">Lesson Steps</span><span class="kv">' + S.stepsDone + ' / ' + S.stepsTot + '</span><span class="ks">' + fmtPct(S.stepsDone, S.stepsTot) + ' · ' + S.bitesDone + ' bites read</span></div>' +
      '<div class="st-kpi"><span class="kl">Mastery Stars ★</span><span class="kv">' + S.starsDone + ' / ' + S.starsTot + '</span><span class="ks">' + fmtPct(S.starsDone, S.starsTot) + ' · ★1:' + S.starByTier[0] + ' ★2:' + S.starByTier[1] + ' ★3:' + S.starByTier[2] + ' ★4:' + S.starByTier[3] + '</span></div>' +
      '<div class="st-kpi"><span class="kl">Bank &amp; Review</span><span class="kv">' + S.qSeen + ' / ' + S.qBank + '</span><span class="ks">' + fmtPct(S.qSeen, S.qBank) + ' seen · ' + S.revPending + ' in review (' + S.revCleared + ' cleared)</span></div>' +
    '</div>';

    /* 2. Interactive Usage Bar Chart */
    var periodTot = 0, nonZero = 0, peakIdx = -1, peakVal = 0;
    series.buckets.forEach(function (b, idx) {
      periodTot += b.total;
      if (b.total > 0) nonZero++;
      if (b.total > peakVal) { peakVal = b.total; peakIdx = idx; }
    });
    var selIdx = (UI.selBar >= 0 && UI.selBar < series.buckets.length) ? UI.selBar : (peakIdx >= 0 ? peakIdx : series.buckets.length - 1);
    var selB = series.buckets[selIdx];

    h += '<div class="st-card"><h2>📊 Usage Over Time</h2>' +
      '<div class="st-barctl">' +
        '<div class="st-seg" role="group" aria-label="Time range">' +
          [["day", "Day"], ["week", "Week"], ["month", "Month"], ["semester", "Semester"], ["year", "Year"]].map(function (x) {
            return '<button type="button" data-st-range="' + x[0] + '" class="' + (UI.range === x[0] ? 'on' : '') + '">' + x[1] + '</button>';
          }).join("") +
        '</div>' +
        '<div class="st-seg" role="group" aria-label="Vertical axis metric">' +
          [["min", "Minutes"], ["q", "Questions"], ["xp", "XP"], ["steps", "Steps"]].map(function (x) {
            return '<button type="button" data-st-metric="' + x[0] + '" class="' + (UI.metric === x[0] ? 'on' : '') + '">' + x[1] + '</button>';
          }).join("") +
        '</div>' +
        '<div class="st-nav">' +
          '<button type="button" data-st-nav="-1" aria-label="Previous period">◂</button>' +
          '<span>' + esc(series.periodLabel) + '</span>' +
          '<button type="button" data-st-nav="1" aria-label="Next period">▸</button>' +
          (UI.offset !== 0 ? '<button type="button" data-st-nav="0">Now</button>' : '') +
        '</div>' +
      '</div>' +
      renderBarChartSVG(series, UI.scope, UI.metric) +
      '<div class="st-inspect">' +
        '<span><b>' + esc(selB ? selB.full : "") + ':</b> ' + (selB ? fmtMetricVal(selB.total, UI.metric) : "0") +
          (UI.scope === "all" && selB ? ' (' + HUBS.map(function (h) { var v = +selB.vals[h.id] || 0; return h.icon + ' ' + (UI.metric === "min" ? v.toFixed(1) + "m" : Math.round(v)); }).join(" · ") + ')' : '') +
        '</span>' +
        '<span style="color:var(--mute)">Period total: <b>' + fmtMetricVal(periodTot, UI.metric) + '</b> · Active slots: <b>' + nonZero + '/' + series.buckets.length + '</b></span>' +
      '</div>' +
      (UI.scope === "all" ? '<div class="st-leg">' + HUBS.map(function (hb) { return '<span><i class="st-sw" style="background:' + hb.color + '"></i>' + hb.icon + ' ' + esc(hb.name) + '</span>'; }).join("") + '<span style="margin-left:auto">Tap any bar to inspect</span></div>' : '') +
    '</div>';

    /* 3. Subject Comparison Matrix (when viewing All Subjects) */
    if (UI.scope === "all") {
      h += '<div class="st-card"><h2>⚖️ Subject Breakdown</h2><div class="st-tw"><table class="st-tbl"><thead><tr>' +
        '<th>Subject</th><th>Time</th><th>Share</th><th>XP</th><th>Steps</th><th>Stars ★</th><th>Answered</th><th>Acc %</th><th>Speed</th><th>Best Exam</th><th>Review</th>' +
      '</tr></thead><tbody>';
      HUBS.forEach(function (hb) {
        var p = S.perHub[hb.id];
        h += '<tr>' +
          '<td><b>' + hb.icon + ' ' + esc(hb.name) + '</b></td>' +
          '<td class="m">' + fmtDur(p.sec) + '</td>' +
          '<td class="m">' + fmtPct(p.sec, S.sec) + '</td>' +
          '<td class="m">' + p.xp + '</td>' +
          '<td class="m">' + p.stepsDone + '/' + p.stepsTot + ' (' + fmtPct(p.stepsDone, p.stepsTot) + ')</td>' +
          '<td class="m">' + p.starsDone + '/' + p.starsTot + '</td>' +
          '<td class="m">' + p.q + '</td>' +
          '<td class="m">' + fmtPct(p.ok, p.q) + '</td>' +
          '<td class="m">' + (p.q > 0 ? (p.ms / p.q / 1000).toFixed(1) + 's' : '—') + '</td>' +
          '<td class="m">' + (p.bestExamPct !== null ? p.bestExamPct + '%' : '—') + '</td>' +
          '<td class="m">' + p.revPending + '</td>' +
        '</tr>';
      });
      h += '</tbody></table></div></div>';
    }

    /* 4. Mode Breakdown + Session & Focus Sprint Analytics */
    h += '<div class="st-2col">';

    var modeRows = [];
    var totModeSec = 0;
    MODES.forEach(function (md) {
      var sec = 0, q = 0, ok = 0, ms = 0;
      scopeHubs(UI.scope).forEach(function (hid) {
        var v = D.modes[hid + ":" + md.id];
        if (v) { sec += +v[0] || 0; q += +v[1] || 0; ok += +v[2] || 0; ms += +v[3] || 0; }
      });
      totModeSec += sec;
      if (sec > 0 || q > 0) modeRows.push({ label: md.label, sec: sec, q: q, ok: ok, ms: ms });
    });
    modeRows.sort(function (a, b) { return b.sec - a.sec || b.q - a.q; });

    h += '<div class="st-card" style="margin:0"><h2>🧩 Activity by Mode</h2>';
    if (!modeRows.length) {
      h += '<p style="color:var(--mute);font-size:.9rem;margin:0">Study any lesson, quiz or game to populate mode timing and accuracy.</p>';
    } else {
      modeRows.forEach(function (r) {
        var pct = totModeSec > 0 ? Math.round(r.sec / totModeSec * 100) : 0;
        h += '<div class="st-mline">' +
          '<span>' + r.label + '</span>' +
          '<div class="st-pbar"><i style="width:' + pct + '%"></i></div>' +
          '<span class="st-num">' + fmtDur(r.sec) + ' (' + pct + '%)' + (r.q ? ' · ' + r.q + 'q · ' + fmtPct(r.ok, r.q) : '') + '</span>' +
        '</div>';
      });
    }
    h += '</div>';

    /* Sessions & Focus Sprints + Eco specials */
    var avgSess = sess.n > 0 ? Math.round(sess.sec / sess.n) : 0;
    var bLabels = ["<5m", "5–15m", "15–30m", "30–60m", "60m+"];
    var medBucket = "—";
    if (sess.n > 0) {
      var half = sess.n / 2, accN = 0;
      for (var bi = 0; bi < 5; bi++) { accN += sess.b[bi] || 0; if (accN >= half) { medBucket = bLabels[bi]; break; } }
    }
    h += '<div class="st-card" style="margin:0"><h2>⏱ Sessions &amp; Sprints</h2>' +
      '<div class="st-mline"><span>Total sessions</span><span></span><span class="st-num"><b>' + sess.n + '</b></span></div>' +
      '<div class="st-mline"><span>Avg / Median / Max session</span><span></span><span class="st-num">' + fmtDur(avgSess) + ' · ' + medBucket + ' · ' + fmtDur(sess.max) + '</span></div>' +
      '<div class="st-mline"><span>Session length buckets</span><span></span><span class="st-num">' + bLabels.map(function (lb, k) { return lb + ':' + (sess.b[k] || 0); }).join(' ') + '</span></div>' +
      '<div class="st-mline"><span>Focus sprints completed</span><span></span><span class="st-num">' + S.sprintDone + ' / ' + S.sprintStart + ' (' + fmtPct(S.sprintDone, S.sprintStart) + ') · ' + fmtMin(S.sprintSec) + '</span></div>' +
      (S.bestExamPct !== null ? '<div class="st-mline"><span>Best timed exam practice</span><span></span><span class="st-num"><b>' + S.bestExamPct + '%</b></span></div>' : '') +
      ((HUB_BY_ID.eco && (UI.scope === "all" || UI.scope === "eco")) ? '<div class="st-mline"><span>🌿 Eco Tick-all / Study path</span><span></span><span class="st-num">' + S.ecoTickDone + '/' + ECO_TICK_TOTAL + ' (' + fmtPct(S.ecoTickDone, ECO_TICK_TOTAL) + ') · ' + S.ecoPathDone + '/' + ECO_PATH_TOTAL + '</span></div>' : '') +
    '</div>';
    h += '</div>';

    /* 5. Circadian Hour-of-Day + Weekday Distribution + 16-Week Consistency Heatmap */
    var peakHr = -1, peakHrSec = 0, bestAccHr = -1, bestAccVal = -1;
    for (var hi = 0; hi < 24; hi++) {
      if (S.byHourOfDay[hi][0] > peakHrSec) { peakHrSec = S.byHourOfDay[hi][0]; peakHr = hi; }
      if (S.byHourOfDay[hi][1] >= 5) {
        var ha = S.byHourOfDay[hi][2] / S.byHourOfDay[hi][1];
        if (ha > bestAccVal) { bestAccVal = ha; bestAccHr = hi; }
      }
    }
    var DOW_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    var maxDowSec = 1;
    S.byDow.forEach(function (d) { if (d[0] > maxDowSec) maxDowSec = d[0]; });

    h += '<div class="st-2col" style="margin-top:12px">' +
      '<div class="st-card" style="margin:0"><h2>🕒 Time-of-Day Profile (00–23h)</h2>' +
        renderCircadianSVG(S.byHourOfDay) +
        '<div class="st-leg"><span>Peak volume: <b>' + (peakHr >= 0 ? pad2(peakHr) + ':00 (' + fmtDur(peakHrSec) + ')' : '—') + '</b></span>' +
        '<span>Highest accuracy (≥5q): <b>' + (bestAccHr >= 0 ? pad2(bestAccHr) + ':00 (' + (bestAccVal * 100).toFixed(1) + '%)' : '—') + '</b></span></div>' +
      '</div>' +
      '<div class="st-card" style="margin:0"><h2>📅 Day-of-Week Split</h2>' +
        DOW_NAMES.map(function (dn, idx) {
          var row = S.byDow[idx], pct = Math.round(row[0] / maxDowSec * 100);
          return '<div class="st-mline" style="padding:4px 0"><span>' + dn + '</span><div class="st-pbar"><i style="width:' + pct + '%"></i></div><span class="st-num">' + fmtMin(row[0]) + (row[1] ? ' · ' + row[1] + 'q · ' + fmtPct(row[2], row[1]) : '') + '</span></div>';
        }).join("") +
      '</div>' +
    '</div>';

    h += '<div class="st-card"><h2>🟩 16-Week Consistency Heatmap</h2>' +
      renderHeatmapSVG(S.byDaySec) +
      '<div class="st-leg"><span>0m</span><span class="st-sw" style="background:var(--soft)"></span><span class="st-sw" style="background:var(--ok);opacity:.32"></span><span class="st-sw" style="background:var(--ok);opacity:.55"></span><span class="st-sw" style="background:var(--ok);opacity:.78"></span><span class="st-sw" style="background:var(--ok)"></span><span>60m+</span>' +
      '<span style="margin-left:auto">Active days: <b>' + S.activeDays + '</b> · Current streak: <b>' + S.curStreak + 'd</b> · Longest: <b>' + S.bestStreak + 'd</b></span></div>' +
    '</div>';

    /* 6. Sortable Per-Lecture Quantitative Table */
    var rows = S.lectures.slice().sort(function (a, b) {
      var dir = UI.sortAsc ? 1 : -1;
      if (UI.sortCol === "num") return dir * ((a.hub.localeCompare(b.hub)) || (a.num - b.num));
      var va = a[UI.sortCol], vb = b[UI.sortCol];
      return dir * ((va === vb) ? (a.num - b.num) : (va - vb));
    });

    function th(col, label) {
      var arrow = UI.sortCol === col ? (UI.sortAsc ? " ▲" : " ▼") : "";
      return '<th data-st-sort="' + col + '">' + label + arrow + '</th>';
    }

    h += '<div class="st-card"><h2>📑 Per-Lecture Quantitative Matrix (' + rows.length + ' lectures)</h2>' +
      '<div class="st-tw"><table class="st-tbl"><thead><tr>' +
        th("num", "Lecture") +
        th("sec", "Time") +
        th("stepsPct", "Steps") +
        th("stars", "Stars ★") +
        th("qAns", "Answered") +
        th("accPct", "Acc %") +
        th("avgSq", "Avg s/q") +
        th("mockPct", "Best Mock") +
        th("qBank", "Bank") +
      '</tr></thead><tbody>';
    rows.forEach(function (r) {
      var hb = HUB_BY_ID[r.hub];
      h += '<tr>' +
        '<td>' + (UI.scope === "all" ? hb.icon + ' ' : '') + '<b>L' + r.num + '</b> · ' + esc(r.short) + '</td>' +
        '<td class="m">' + (r.sec ? fmtDur(r.sec) : "0s") + '</td>' +
        '<td class="m">' + r.stepsDone + '/' + r.stepsTot + ' (' + Math.round(r.stepsPct) + '%)</td>' +
        '<td class="m">' + "★".repeat(r.stars) + "☆".repeat(Math.max(0, r.starsTot - r.stars)) + '</td>' +
        '<td class="m">' + r.qAns + '</td>' +
        '<td class="m">' + (r.accPct >= 0 ? r.accPct.toFixed(1) + "%" : "—") + '</td>' +
        '<td class="m">' + (r.avgSq >= 0 ? r.avgSq.toFixed(1) + "s" : "—") + '</td>' +
        '<td class="m">' + (r.mockPct >= 0 ? r.mockPct + "%" : "—") + '</td>' +
        '<td class="m">' + r.qBank + '</td>' +
      '</tr>';
    });
    h += '</tbody></table></div></div>';

    h += '</div>';
    body.innerHTML = h;
  }

  /* ---------- Overlay Shell & Top-Bar Button ---------- */
  function ensureUI() {
    injectStyles();
    if (!document.getElementById("statsapp")) {
      var app = document.createElement("div");
      app.className = "stapp";
      app.id = "statsapp";
      app.hidden = true;
      app.setAttribute("role", "dialog");
      app.setAttribute("aria-modal", "true");
      app.setAttribute("aria-label", "Study Hub Statistics");
      app.innerHTML =
        '<div class="st-top"><div class="st-top-in">' +
          '<b>📊 Statistics</b>' +
          '<div class="st-scopes" role="group" aria-label="Subject filter">' +
            '<button type="button" class="st-pill on" data-st-scope="all">All (' + HUB_IDS.length + ')</button>' +
            HUB_IDS.map(function (hid) {
              var hb = HUB_BY_ID[hid];
              return '<button type="button" class="st-pill" data-st-scope="' + esc(hid) + '">' + hb.icon + ' ' + esc(hb.short) + '</button>';
            }).join("") +
          '</div>' +
          '<button type="button" class="st-x" id="stclose" aria-label="Close Statistics">✕</button>' +
        '</div></div>' +
        '<div class="st-body" id="stbody"></div>';
      document.body.appendChild(app);

      document.getElementById("stclose").onclick = closeStats;
      app.addEventListener("click", function (e) {
        var sc = e.target.closest("[data-st-scope]");
        if (sc) { UI.scope = sc.getAttribute("data-st-scope"); UI.selBar = -1; renderDashboard(); return; }
        var rg = e.target.closest("[data-st-range]");
        if (rg) { UI.range = rg.getAttribute("data-st-range"); UI.offset = 0; UI.selBar = -1; renderDashboard(); return; }
        var mt = e.target.closest("[data-st-metric]");
        if (mt) { UI.metric = mt.getAttribute("data-st-metric"); renderDashboard(); return; }
        var nv = e.target.closest("[data-st-nav]");
        if (nv) {
          var step = +nv.getAttribute("data-st-nav");
          UI.offset = step === 0 ? 0 : UI.offset + step;
          UI.selBar = -1;
          renderDashboard();
          return;
        }
        var br = e.target.closest("[data-bar]");
        if (br) { UI.selBar = +br.getAttribute("data-bar"); renderDashboard(); return; }
        var sr = e.target.closest("[data-st-sort]");
        if (sr) {
          var col = sr.getAttribute("data-st-sort");
          if (UI.sortCol === col) UI.sortAsc = !UI.sortAsc;
          else { UI.sortCol = col; UI.sortAsc = col === "num"; }
          renderDashboard();
        }
      });
      document.addEventListener("keydown", function (e) {
        if (statsOpen && e.key === "Escape") closeStats();
      });
    }

    var hud = document.querySelector(".top .hud");
    if (hud && !document.getElementById("statsbtn")) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hudchip";
      btn.id = "statsbtn";
      btn.title = "Quantitative usage & study statistics";
      btn.textContent = "📊 Stats";
      btn.onclick = function () { openStats(); };
      var catBtn = document.getElementById("catbtn");
      if (catBtn && catBtn.parentNode === hud) hud.insertBefore(btn, catBtn);
      else hud.insertBefore(btn, hud.firstChild);
    }
  }

  function openStats(initialScope) {
    ensureUI();
    if (initialScope) UI.scope = initialScope;
    statsOpen = true;
    lastFocusEl = document.activeElement;
    if (dirtyTicks > 0) { dirtyTicks = 0; saveLocal(); }
    document.getElementById("statsapp").hidden = false;
    document.body.classList.add("stopen");
    renderDashboard();
    document.getElementById("stclose").focus();
  }

  function closeStats() {
    statsOpen = false;
    var app = document.getElementById("statsapp");
    if (app) app.hidden = true;
    document.body.classList.remove("stopen");
    if (lastFocusEl && lastFocusEl.focus) try { lastFocusEl.focus(); } catch (e) {}
  }

  function boot() {
    backfillTodayOnce();
    ensureUI();
    wireSubHubTracking();
    if (window.GEOSync && GEOSync.subscribe) {
      GEOSync.subscribe(startAnalyticsCloud);
    }
  }

  window.STUDY_STATS = { open: openStats, close: closeStats, refresh: function () { if (statsOpen) renderDashboard(); } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
