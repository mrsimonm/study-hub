/* Optional Firebase Auth + Firestore sync (shared by Eco Hub, Micro Hub, Statistics Hub and Geology Hub).
   Works alongside localStorage (instant offline cache) and only activates when FIREBASE_CONFIG.apiKey is set. */
(function () {
  "use strict";
  var auth = null, db = null, user = null, unsub = null, timer = null, status = "off";

  function configured() {
    var c = window.FIREBASE_CONFIG;
    return !!(c && typeof c.apiKey === "string" && c.apiKey.trim() && c.projectId && window.firebase);
  }

  /* Merge local and cloud state non-destructively so neither device loses progress. */
  function mergeState(a, b) {
    if (!a) return b;
    if (!b) return a;
    var out = {
      review: Array.from(new Set((a.review || []).concat(b.review || []))),
      tp: {},
      best: Object.assign({}, a.best || {}, b.best || {}),
      xp: Math.max(+a.xp || 0, +b.xp || 0),
      day: ((a.day && a.day.d) === (b.day && b.day.d))
        ? { d: (a.day && a.day.d) || "", xp: Math.max(+(a.day && a.day.xp) || 0, +(b.day && b.day.xp) || 0) }
        : (((a.day && a.day.d) || "") > ((b.day && b.day.d) || "") ? a.day : b.day) || { d: "", xp: 0 },
      streak: (((a.streak && a.streak.last) || "") >= ((b.streak && b.streak.last) || ""))
        ? (a.streak || { last: "", n: 0 })
        : (b.streak || { last: "", n: 0 }),
      games: {},
      full: !!(a.full || b.full),
      last: b.last || a.last || "",
      mas: {}
    };
    Object.keys(a.best || {}).concat(Object.keys(b.best || {})).forEach(function (k) {
      var x = a.best && a.best[k], y = b.best && b.best[k];
      if (!x) out.best[k] = y;
      else if (!y) out.best[k] = x;
      else out.best[k] = (x.s / Math.max(1, x.n)) >= (y.s / Math.max(1, y.n)) ? x : y;
    });
    Object.keys(a.games || {}).concat(Object.keys(b.games || {})).forEach(function (k) {
      var x = a.games && a.games[k], y = b.games && b.games[k];
      if (x == null) out.games[k] = y;
      else if (y == null) out.games[k] = x;
      else out.games[k] = /-match$/.test(k) ? Math.min(x, y) : Math.max(x, y);
    });
    Object.keys(a.tp || {}).concat(Object.keys(b.tp || {})).forEach(function (tid) {
      var x = (a.tp && a.tp[tid]) || {}, y = (b.tp && b.tp[tid]) || {};
      var done = Object.assign({}, x.done || {}, y.done || {});
      var bites = Object.assign({}, x.bites || {});
      Object.keys(y.bites || {}).forEach(function (k) { bites[k] = Math.max(+bites[k] || 0, +y.bites[k] || 0); });
      var best = Object.assign({}, x.best || {}, y.best || {});
      out.tp[tid] = { done: done, best: best, step: Math.max(+x.step || 0, +y.step || 0), bites: bites };
    });
    Object.keys(a.mas || {}).concat(Object.keys(b.mas || {})).forEach(function (tid) {
      var x = (a.mas && a.mas[tid]) || {}, y = (b.mas && b.mas[tid]) || {};
      var stars = Object.assign({}, x.stars || {}, y.stars || {});
      var cur = Math.max(+x.cur || 1, +y.cur || 1);
      var got = Object.assign({}, x.got || {});
      Object.keys(y.got || {}).forEach(function (k) { got[k] = Math.max(+got[k] || 0, +y.got[k] || 0); });
      out.mas[tid] = {
        cur: cur,
        stars: stars,
        got: (x.cur || 1) === (y.cur || 1) ? got : ((x.cur || 1) > (y.cur || 1) ? (x.got || {}) : (y.got || {})),
        chk: y.chk || x.chk || null,
        faded: y.faded || x.faded || 0,
        unlock4: y.unlock4 || x.unlock4 || ""
      };
    });
    return out;
  }

  function hasProgress(s) {
    return !!(s && (s.xp > 0 || (s.review && s.review.length) || Object.keys(s.tp || {}).length || Object.keys(s.mas || {}).length));
  }

  function setStatus(s) {
    status = s;
    renderUI();
  }

  /* Extra synced fields (Apply exercises "ap", study path "pt"), registered by lib/apply.js and lib/path.js:
     { key, get() -> object, set(object), merge(local, cloud) -> object }. Stored next to "state" in users/{uid}. */
  var EXTRAS = [];
  function register(x) { EXTRAS.push(x); }
  function extrasDoc() { var o = {}; EXTRAS.forEach(function (x) { o[x.key] = x.get(); }); return o; }

  function pushCloud(state) {
    if (!db || !user) return;
    setStatus("saving");
    var doc = extrasDoc();
    doc.state = state;
    doc.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    db.collection("users").doc(user.uid).set(doc).then(function () {
      setStatus("synced");
    }).catch(function (e) {
      console.error("Firestore save failed:", e);
      setStatus("error");
    });
  }

  function schedulePush(state) {
    if (!db || !user) return;
    clearTimeout(timer);
    setStatus("saving");
    timer = setTimeout(function () { pushCloud(state); }, 1200);
  }

  function startListener(u) {
    if (unsub) { unsub(); unsub = null; }
    var ref = db.collection("users").doc(u.uid);
    var first = true;
    setStatus("syncing");
    unsub = ref.onSnapshot(function (snap) {
      if (snap.metadata && snap.metadata.hasPendingWrites) return;
      var data = (snap.exists && snap.data()) || {};
      var cloud = data.state;
      var local = window.GEO && window.GEO._getState ? window.GEO._getState() : null;
      if (first) {
        first = false;
        var extrasChanged = false;
        EXTRAS.forEach(function (x) {
          var mine = x.get(), theirs = data[x.key];
          if (!theirs) { if (JSON.stringify(mine) !== "{}") extrasChanged = true; return; }
          var m = x.merge(mine, theirs);
          x.set(m);
          if (JSON.stringify(m) !== JSON.stringify(theirs)) extrasChanged = true;
        });
        if (cloud) {
          if (extrasChanged && !hasProgress(local)) { if (window.GEO && window.GEO._setState) window.GEO._setState(cloud); pushCloud(cloud); return; }
          var merged = hasProgress(local) ? mergeState(local, cloud) : cloud;
          if (window.GEO && window.GEO._setState) window.GEO._setState(merged);
          if ((hasProgress(local) && JSON.stringify(merged) !== JSON.stringify(cloud)) || extrasChanged) pushCloud(merged);
          else setStatus("synced");
        } else if (hasProgress(local) || extrasChanged) {
          pushCloud(local || {});
        } else {
          setStatus("synced");
        }
        return;
      }
      EXTRAS.forEach(function (x) { if (data[x.key]) x.set(x.merge(x.get(), data[x.key])); });
      if (cloud && window.GEO && window.GEO._setState) {
        window.GEO._setState(cloud);
        setStatus("synced");
      }
    }, function (e) {
      console.error("Firestore listener error:", e);
      setStatus("error");
    });
  }

  function signIn() {
    if (!auth) return;
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(function (e) {
      if (e && (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")) {
        auth.signInWithRedirect(provider);
      } else if (e && e.code !== "auth/popup-closed-by-user") {
        console.error("Sign-in error:", e);
        if (window.GEO && window.GEO.toast) window.GEO.toast("Sign-in failed: " + (e.message || e.code), true);
      }
    });
  }

  function signOut() {
    if (!auth) return;
    clearTimeout(timer);
    if (unsub) { unsub(); unsub = null; }
    auth.signOut();
  }

  function renderUI() {
    var box = document.getElementById("syncbox");
    if (!box) return;
    var esc = (window.GEO && window.GEO.esc) || function (s) { return String(s); };
    if (!configured()) {
      box.innerHTML = '<p style="font-size:.9rem;color:var(--mute);margin:0 0 8px">Cloud sync is not configured yet. Add your Firebase Web App config in <code>lib/firebase-config.js</code> to sync progress across devices.</p>';
      return;
    }
    if (!user) {
      box.innerHTML = '<p style="font-size:.92rem;margin:0 0 8px">Sign in with Google to sync your study path, solved exercises, notes, XP, Mastery stars and Review list between your phone and laptop.</p><button class="btn" id="syncin">Sign in with Google</button>';
      document.getElementById("syncin").onclick = signIn;
      return;
    }
    var badge = status === "synced" ? "Synced ✓" : status === "saving" || status === "syncing" ? "Syncing…" : "Sync paused (offline or error)";
    box.innerHTML = '<p style="font-size:.92rem;margin:0 0 8px">Signed in as <b>' + esc(user.email || user.displayName || "Account") + '</b> · <span style="color:var(--mute)">' + badge + '</span></p><button class="ghost" id="syncout">Sign out</button>';
    document.getElementById("syncout").onclick = signOut;
  }

  function init() {
    if (!configured()) { renderUI(); return; }
    try {
      if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
      auth = firebase.auth();
      db = firebase.firestore();
      db.enablePersistence({ synchronizeTabs: true }).catch(function () {});
      auth.onAuthStateChanged(function (u) {
        user = u;
        if (u) startListener(u);
        else {
          if (unsub) { unsub(); unsub = null; }
          setStatus("signedout");
        }
      });
    } catch (e) {
      console.error("Firebase init failed:", e);
      setStatus("error");
    }
  }

  window.GEOSync = {
    init: init,
    render: renderUI,
    onSave: schedulePush,
    register: register,
    touch: function () { if (user && window.GEO && window.GEO._getState) schedulePush(window.GEO._getState()); },
    onReset: function (freshState) {
      clearTimeout(timer);
      if (user) pushCloud(freshState);
    }
  };
})();
