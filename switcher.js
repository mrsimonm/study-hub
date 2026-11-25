/* Study Hub subject switcher + unified Google sign-in indicator:
   adds "Subjects ▾" to the top bar of Bio Hub, Eco Hub and Geology Hub so you can switch subjects
   or sign in with Google once for the whole app without leaving where you are. */
(function () {
  "use strict";

  var HUBS = [
    {
      id: "bio",
      name: "Bio Hub",
      icon: "🧬",
      sub: "ČZU · ZEX108E Fundamentals of Biology",
      note: "12 lectures · 24-question exam",
      tint: "var(--c1)",
      key: "bioHub.v1",
      hubDoc: "bio"
    },
    {
      id: "eco",
      name: "Eco Hub",
      icon: "🌿",
      sub: "ČZU · Fundamentals of Ecology",
      note: "12 lessons · Tick-all & 19q / 10m exam",
      tint: "var(--ok)",
      key: "ecoHub.v1",
      hubDoc: "eco"
    },
    {
      id: "geo",
      name: "Geology Hub",
      icon: "🪨",
      sub: "ČZU · ZOX101E Geology",
      note: "Weekly tests · Lecture slides panel",
      tint: "var(--c4)",
      key: "geoHub.v1",
      hubDoc: ""
    }
  ];

  window.STUDY_HUBS = HUBS;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function dstr(d) { return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }

  function formatState(s, fallback) {
    if (!s || typeof s !== "object") return fallback;
    var xp = +s.xp || 0;
    var td = dstr(new Date()), yd = dstr(new Date(Date.now() - 864e5));
    var st = s.streak && (s.streak.last === td || s.streak.last === yd) ? (+s.streak.n || 0) : 0;
    var steps = 0;
    if (s.tp && typeof s.tp === "object") {
      Object.keys(s.tp).forEach(function (tid) {
        var done = s.tp[tid] && s.tp[tid].done;
        if (done && typeof done === "object") {
          Object.keys(done).forEach(function (k) { if (done[k]) steps++; });
        }
      });
    }
    if (!xp && !steps) return fallback;
    var parts = ["⚡ " + xp + " XP"];
    if (st > 0) parts.push("🔥 " + st + "d");
    if (steps > 0) parts.push(steps + " step" + (steps === 1 ? "" : "s") + " done");
    return parts.join(" · ");
  }

  function readPreviewMap() {
    try { return JSON.parse(localStorage.getItem("studyHub.cloudPreview") || "{}") || {}; }
    catch (e) { return {}; }
  }

  function readStats(h) {
    try {
      var raw = localStorage.getItem(h.key);
      if (raw) {
        var res = formatState(JSON.parse(raw), "");
        if (res) return res;
      }
      var prev = readPreviewMap();
      if (prev[h.id]) {
        var cres = formatState(prev[h.id], "");
        if (cres) return cres;
      }
    } catch (e) {}
    return h.note;
  }

  /* Pull lightweight cloud previews for subjects not yet opened on this device. */
  var fetchedUid = "";
  function syncCloudPreviews(info, onDone) {
    if (!info || !info.user || !info.db || fetchedUid === info.user.uid) return;
    fetchedUid = info.user.uid;
    var uref = info.db.collection("users").doc(info.user.uid);
    Promise.all(HUBS.map(function (h) {
      var r = h.hubDoc ? uref.collection("hubs").doc(h.hubDoc) : uref;
      return r.get().then(function (snap) {
        return { id: h.id, state: snap.exists && snap.data() ? snap.data().state : null };
      }).catch(function () { return { id: h.id, state: null }; });
    })).then(function (list) {
      var map = readPreviewMap(), changed = false;
      list.forEach(function (x) {
        if (x.state) { map[x.id] = x.state; changed = true; }
      });
      if (changed) {
        try { localStorage.setItem("studyHub.cloudPreview", JSON.stringify(map)); } catch (e) {}
        if (onDone) onDone();
      }
    });
  }

  window.STUDY_HUBS_STATS = readStats;
  window.STUDY_HUBS_PREVIEW = syncCloudPreviews;

  var scriptEl = document.currentScript || document.querySelector("script[data-hub]");
  var curId = (scriptEl && scriptEl.getAttribute("data-hub")) || "";
  if (!curId) {
    var m = /\/(bio|eco|geo)(?:\/|$)/.exec(location.pathname);
    if (m) curId = m[1];
  }

  function saveLast(id) {
    try { localStorage.setItem("studyHub.last", id); } catch (e) {}
  }

  if (!curId) return; // Loaded on root picker page for shared helpers.
  saveLast(curId);

  var curHub = HUBS.filter(function (h) { return h.id === curId; })[0] || HUBS[0];
  var brand = document.querySelector(".top .brand");
  if (!brand) return;

  var style = document.createElement("style");
  style.textContent =
    ".top .hud{flex-wrap:wrap}" +
    ".hubsw{position:relative;display:inline-flex;align-items:center}" +
    ".hubsw-btn{display:inline-flex;align-items:center;gap:5px;border:1.5px solid var(--line);background:var(--soft);border-radius:99px;padding:3px 11px;font-weight:700;font-size:.86rem;color:var(--ink);white-space:nowrap}" +
    ".hubsw-btn:hover{border-color:var(--acc)}" +
    ".hubsw-btn[aria-expanded=\"true\"]{background:var(--acc);color:var(--acc-ink);border-color:var(--acc)}" +
    ".hubsw-caret{font-size:.75em;opacity:.8}" +
    ".hubsw-dot{width:7px;height:7px;border-radius:50%;background:var(--ok);display:inline-block}" +
    ".hubsw-dot[hidden]{display:none}" +
    ".hubsw-menu{position:absolute;left:0;top:calc(100% + 8px);width:min(320px,calc(100vw - 32px));background:var(--card);border:1px solid var(--line);border-radius:14px;padding:8px;box-shadow:0 12px 32px rgba(0,0,0,.22);z-index:36;display:grid;gap:6px}" +
    ".hubsw-menu[hidden]{display:none}" +
    ".hubsw-hd{font-size:.72rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--mute);padding:2px 6px 0}" +
    ".hubsw-item{display:grid;gap:2px;padding:9px 11px;border-radius:10px;border:1px solid var(--line);border-left:4px solid var(--sw-c,var(--acc));background:var(--bg);color:var(--ink);text-decoration:none;text-align:left}" +
    ".hubsw-item:hover{border-color:var(--sw-c,var(--acc));background:var(--soft)}" +
    ".hubsw-item.on{background:var(--acc-soft);border-color:var(--acc)}" +
    ".hubsw-row{display:flex;align-items:center;gap:7px}" +
    ".hubsw-row b{font-family:var(--font-d);font-size:1rem;line-height:1.2}" +
    ".hubsw-cur{margin-left:auto;font-size:.72rem;font-weight:700;padding:1px 7px;border-radius:99px;background:var(--acc);color:var(--acc-ink)}" +
    ".hubsw-sub{font-size:.82rem;color:var(--mute);line-height:1.3}" +
    ".hubsw-meta{font-size:.78rem;color:var(--mute);line-height:1.3}" +
    ".hubsw-sync{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-radius:10px;background:var(--soft);border:1px solid var(--line);font-size:.8rem;color:var(--ink)}" +
    ".hubsw-sync small{display:block;color:var(--mute);font-size:.74rem}" +
    ".hubsw-sbtn{border:0;border-radius:8px;padding:6px 10px;font-weight:700;font-size:.8rem;background:var(--acc);color:var(--acc-ink);white-space:nowrap}" +
    ".hubsw-sbtn.out{background:var(--card);color:var(--mute);border:1px solid var(--line)}" +
    ".hubsw-sbtn.out:hover{color:var(--ink);border-color:var(--mute)}" +
    ".hubsw-all{display:flex;align-items:center;justify-content:center;gap:6px;padding:7px 10px;border-radius:9px;border:1px dashed var(--line);color:var(--mute);font-size:.83rem;font-weight:700;text-decoration:none}" +
    ".hubsw-all:hover{color:var(--ink);border-color:var(--mute);background:var(--soft)}";
  document.head.appendChild(style);

  var wrap = document.createElement("div");
  wrap.className = "hubsw";
  wrap.id = "hubsw";

  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "hubsw-btn";
  btn.id = "hubsw-btn";
  btn.setAttribute("aria-haspopup", "menu");
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", "hubsw-menu");
  btn.title = "Switch subject (currently " + curHub.name + ")";
  btn.innerHTML = '<span aria-hidden="true">' + curHub.icon + '</span><span>Subjects</span><span class="hubsw-dot" id="hubsw-dot" title="Signed in & synced" hidden></span><span class="hubsw-caret" aria-hidden="true">▾</span>';

  var menu = document.createElement("div");
  menu.className = "hubsw-menu";
  menu.id = "hubsw-menu";
  menu.setAttribute("role", "menu");
  menu.hidden = true;

  function authBlockHtml() {
    if (!window.GEOSync || !GEOSync.info) return "";
    var info = GEOSync.info();
    if (!info.configured) return "";
    if (!info.user) {
      return '<div class="hubsw-sync"><div><b>☁️ Cloud sync</b><small>One login for all 3 subjects</small></div><button type="button" class="hubsw-sbtn" data-hub-auth="in">Sign in</button></div>';
    }
    var st = info.status === "synced" ? "Synced ✓" : (info.status === "saving" || info.status === "syncing") ? "Syncing…" : "Signed in";
    var who = esc(info.user.email || info.user.displayName || "Google account");
    return '<div class="hubsw-sync"><div style="min-width:0"><b style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">☁️ ' + who + '</b><small>' + st + ' · all subjects</small></div><button type="button" class="hubsw-sbtn out" data-hub-auth="out">Sign out</button></div>';
  }

  function renderMenu() {
    var html = '<div class="hubsw-hd">Switch subject</div>';
    HUBS.forEach(function (h) {
      var active = h.id === curId;
      var href = "../" + h.id + "/";
      html += '<a class="hubsw-item' + (active ? " on" : "") + '" role="menuitem" data-hub-go="' + h.id + '" href="' + href + '" style="--sw-c:' + h.tint + '"' + (active ? ' aria-current="page"' : '') + '>' +
        '<span class="hubsw-row"><span aria-hidden="true">' + h.icon + '</span><b>' + h.name + '</b>' + (active ? '<span class="hubsw-cur">Current</span>' : '') + '</span>' +
        '<span class="hubsw-sub">' + h.sub + '</span>' +
        '<span class="hubsw-meta">' + esc(readStats(h)) + '</span>' +
        '</a>';
    });
    html += authBlockHtml();
    html += '<a class="hubsw-all" role="menuitem" data-hub-pick="1" href="../?pick=1">🏠 All subjects screen</a>';
    menu.innerHTML = html;
  }

  function setOpen(open) {
    if (open) {
      renderMenu();
      var fp = document.getElementById("focuspanel");
      if (fp && !fp.hidden) fp.hidden = true;
    }
    menu.hidden = !open;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    setOpen(menu.hidden);
  });

  menu.addEventListener("click", function (e) {
    var authBtn = e.target.closest("[data-hub-auth]");
    if (authBtn && window.GEOSync) {
      e.preventDefault();
      var act = authBtn.getAttribute("data-hub-auth");
      if (act === "in" && GEOSync.signIn) GEOSync.signIn();
      else if (act === "out" && GEOSync.signOut) GEOSync.signOut();
      return;
    }
    var item = e.target.closest("[data-hub-go]");
    if (item) {
      var targetId = item.getAttribute("data-hub-go");
      if (targetId === curId) {
        e.preventDefault();
        setOpen(false);
        return;
      }
      saveLast(targetId);
      if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
        e.preventDefault();
        setOpen(false);
        location.href = item.href;
      }
      return;
    }
    var pick = e.target.closest("[data-hub-pick]");
    if (pick && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
      e.preventDefault();
      setOpen(false);
      location.href = pick.href;
    }
  });

  document.addEventListener("click", function (e) {
    if (!menu.hidden && !wrap.contains(e.target)) setOpen(false);
  });

  document.addEventListener("keydown", function (e) {
    if (menu.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      btn.focus();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      var items = Array.prototype.slice.call(menu.querySelectorAll("[role=\"menuitem\"], [data-hub-auth]"));
      if (!items.length) return;
      e.preventDefault();
      var idx = items.indexOf(document.activeElement);
      var next = e.key === "ArrowDown"
        ? (idx < 0 || idx >= items.length - 1 ? 0 : idx + 1)
        : (idx <= 0 ? items.length - 1 : idx - 1);
      items[next].focus();
    }
  });

  window.addEventListener("hashchange", function () {
    if (!menu.hidden) setOpen(false);
  });

  wrap.appendChild(btn);
  wrap.appendChild(menu);
  brand.insertBefore(wrap, brand.firstChild);

  if (window.GEOSync && GEOSync.subscribe) {
    GEOSync.subscribe(function (info) {
      var dot = document.getElementById("hubsw-dot");
      if (dot) dot.hidden = !(info && info.user);
      if (info && info.user) {
        syncCloudPreviews(info, function () { if (!menu.hidden) renderMenu(); });
      }
      if (!menu.hidden) renderMenu();
    });
  }
})();
