#!/usr/bin/env node
/* Generated from hub-kit/shell, edit there (then run: node ~/Projects/hub-kit/tools/build.js all). */
/* Single CLI for Study Hub (tools/hub.js):
   - node tools/hub.js sync          Syncs all subjects in subjects.json, regenerates markers, validates
   - node tools/hub.js add <id>      Adds <id> to subjects.json (auto-detecting or restoring metadata) & syncs
   - node tools/hub.js remove <id>   Removes <id> from subjects.json, deletes <id>/ & syncs
   - node tools/hub.js check         Warns if <id>/ in this hub differs from committed <src> or <src> is dirty */
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync, spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const PROJECTS = path.resolve(ROOT, "..");
const SUBJECTS_PATH = path.join(ROOT, "subjects.json");
const STASH_PATH = path.join(ROOT, ".git", "hub-stash.json");

const SKIP = new Set([
  ".gitignore",
  ".nojekyll",
  "firestore.rules",
  "manifest.webmanifest",
  "sw.js"
]);

/* Optional subjects.json fields (defaults in brackets):
   hubDoc   Firestore doc under users/{uid}/hubs/ [id]; "" = legacy users/{uid} (Geology Hub)
   examKey  best-score key the stats page reads ["exam40"]
   catalogStatic  lecture entries for old JS-only lectures the course.json does not list [[]]
   extraShell     extra paths (relative to the subject folder) for the offline cache [[]] */
function hubDocOf(h) { return h.hubDoc === undefined ? h.id : h.hubDoc; }

function readSubjects() {
  return JSON.parse(fs.readFileSync(SUBJECTS_PATH, "utf8"));
}

function writeSubjects(list) {
  fs.writeFileSync(SUBJECTS_PATH, JSON.stringify(list, null, 2) + "\n", "utf8");
}

function escHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]
  ));
}

function patchIndexHtml(html, hubId) {
  let out = html
    .replace('<link rel="manifest" href="manifest.webmanifest">', '<link rel="manifest" href="../manifest.webmanifest">')
    .replace('<link rel="apple-touch-icon" href="icon-192.png">', '<link rel="icon" href="../icon-192.png">\n<link rel="apple-touch-icon" href="../icon-192.png">')
    .replace(/<meta name="apple-mobile-web-app-title" content="[^"]*">/, '<meta name="apple-mobile-web-app-title" content="Study Hub">')
    .replace(/data-key="[a-zA-Z0-9._-]+\.cat"/, 'data-key="studyHub.cat"')
    .replace('navigator.serviceWorker.register("sw.js")', 'navigator.serviceWorker.register("../sw.js")');

  const tag = '<script src="../switcher.js" data-hub="' + hubId + '"></script>';
  if (!out.includes(tag)) {
    out = out.replace('<script src="app.js"></script>', '<script src="app.js"></script>\n' + tag);
  }
  if (!out.includes('<script src="lib/stats.js"></script>')) {
    out = out.replace('<script src="lib/cat.js"></script>', '<script src="lib/cat.js"></script>\n<script src="lib/stats.js"></script>');
  }
  return out;
}

function buildFirebaseConfig(baseCfg, hubDoc) {
  if (!hubDoc) return baseCfg;
  return baseCfg.replace(/};\s*$/, ',\n  hubDoc: "' + hubDoc + '"\n};\n');
}

function replaceBlockNth(text, beginMarker, endMarker, innerLines, nth) {
  let idx = -1;
  let searchFrom = 0;
  for (let i = 0; i <= nth; i++) {
    idx = text.indexOf(beginMarker, searchFrom);
    if (idx === -1) throw new Error("Missing marker " + beginMarker + " (#" + (nth + 1) + ")");
    searchFrom = idx + beginMarker.length;
  }
  const endIdx = text.indexOf(endMarker, searchFrom);
  if (endIdx === -1) throw new Error("Missing end marker " + endMarker);

  const lineStart = text.lastIndexOf("\n", idx) + 1;
  const indent = text.slice(lineStart, idx);
  const endLineStart = text.lastIndexOf("\n", endIdx) + 1;
  const body = innerLines.length ? "\n" + innerLines.join("\n") + "\n" + indent : "\n" + indent;
  return text.slice(0, idx + beginMarker.length) + body + text.slice(endLineStart + indent.length);
}

function replaceJsBlock(text, innerLines, nth = 0) {
  return replaceBlockNth(text, "/* HUB:BEGIN */", "/* HUB:END */", innerLines, nth);
}

function replaceHtmlBlock(text, innerLines, nth = 0) {
  return replaceBlockNth(text, "<!-- HUB:BEGIN -->", "<!-- HUB:END -->", innerLines, nth);
}

function countLecturesForSubject(h) {
  const courseDir = path.join(ROOT, h.id, h.course);
  const courseJson = JSON.parse(fs.readFileSync(path.join(courseDir, "course.json"), "utf8"));
  const lectures = Array.isArray(courseJson.lectures) ? courseJson.lectures : [];
  return lectures.map((rel) => {
    const lecDir = path.join(courseDir, rel);
    const lec = JSON.parse(fs.readFileSync(path.join(lecDir, "lecture.json"), "utf8"));
    const md = fs.readFileSync(path.join(lecDir, "steps.md"), "utf8");
    const steps = md.split(/\r?\n/).filter((line) => line.startsWith("## ")).length;
    const q = (lec.questions || lec.Q || []).length;
    const voc = (lec.vocab || lec.VOC || []).length;
    const mas = lec.mastery !== false;
    return {
      id: lec.id,
      num: lec.num,
      short: lec.short || lec.title,
      steps,
      q,
      voc,
      mas
    };
  });
}

function generateStatsJs(subjects) {
  const statsPath = path.join(ROOT, "lib", "stats.js");
  const lines = [];
  lines.push("  var HUBS = [");
  subjects.forEach((h, idx) => {
    const comma = idx < subjects.length - 1 ? "," : "";
    lines.push(
      `    { id: ${JSON.stringify(h.id)}, name: ${JSON.stringify(h.name)}, short: ${JSON.stringify(h.short)}, icon: ${JSON.stringify(h.icon)}, code: ${JSON.stringify(h.code)}, color: ${JSON.stringify(h.color)}, key: ${JSON.stringify(h.key)}, examKey: ${JSON.stringify(h.examKey || "exam40")} }${comma}`
    );
  });
  lines.push("  ];");
  lines.push("");
  lines.push("  var CATALOG = {");
  subjects.forEach((h, sIdx) => {
    const sComma = sIdx < subjects.length - 1 ? "," : "";
    const lecs = (h.catalogStatic || []).concat(countLecturesForSubject(h));
    lines.push(`    ${h.id}: [`);
    lecs.forEach((l, lIdx) => {
      const lComma = lIdx < lecs.length - 1 ? "," : "";
      lines.push(
        `      { id: ${JSON.stringify(l.id)}, num: ${l.num}, short: ${JSON.stringify(l.short)}, steps: ${l.steps}, q: ${l.q}, voc: ${l.voc}, mas: ${l.mas} }${lComma}`
      );
    });
    lines.push(`    ]${sComma}`);
  });
  lines.push("  };");

  const updated = replaceJsBlock(fs.readFileSync(statsPath, "utf8"), lines, 0);
  fs.writeFileSync(statsPath, updated, "utf8");
  return updated;
}

function generateCatJs(subjects) {
  const p = path.join(ROOT, "lib", "cat.js");
  const lines = ["  var HUB_SOURCES = ["];
  subjects.forEach((h, idx) => {
    const comma = idx < subjects.length - 1 ? "," : "";
    lines.push(`    { id: ${JSON.stringify(h.id)}, key: ${JSON.stringify(h.key)}, short: ${JSON.stringify(h.short)}, hubDoc: ${JSON.stringify(hubDocOf(h))} }${comma}`);
  });
  lines.push("  ];");
  fs.writeFileSync(p, replaceJsBlock(fs.readFileSync(p, "utf8"), lines, 0), "utf8");
}

function generateSwitcherJs(subjects) {
  const p = path.join(ROOT, "switcher.js");
  const lines = ["  var HUBS = ["];
  subjects.forEach((h, idx) => {
    const comma = idx < subjects.length - 1 ? "," : "";
    lines.push("    {");
    lines.push(`      id: ${JSON.stringify(h.id)},`);
    lines.push(`      name: ${JSON.stringify(h.name)},`);
    lines.push(`      icon: ${JSON.stringify(h.icon)},`);
    lines.push(`      sub: ${JSON.stringify(h.sub)},`);
    lines.push(`      note: ${JSON.stringify(h.note)},`);
    lines.push(`      tint: ${JSON.stringify(h.color)},`);
    lines.push(`      key: ${JSON.stringify(h.key)},`);
    lines.push(`      hubDoc: ${JSON.stringify(hubDocOf(h))}`);
    lines.push(`    }${comma}`);
  });
  lines.push("  ];");
  fs.writeFileSync(p, replaceJsBlock(fs.readFileSync(p, "utf8"), lines, 0), "utf8");
}

function tileEyebrow(h) {
  if (h.sub && h.code && h.sub.includes(h.code)) {
    const rest = h.sub.slice(h.sub.indexOf(h.code) + h.code.length).trim();
    if (rest) return `${h.code} · ${rest}`;
  }
  return h.sub || h.code || h.name;
}

function generateIndexHtml(subjects) {
  const p = path.join(ROOT, "index.html");
  let html = fs.readFileSync(p, "utf8");

  const validLine = [`      var valid = [${subjects.map((h) => JSON.stringify(h.id)).join(", ")}];`];
  html = replaceJsBlock(html, validLine, 0);

  const tileLines = [];
  subjects.forEach((h) => {
    const desc = h.desc || h.note || "";
    tileLines.push(`    <a class="tile" data-hub-card="${escHtml(h.id)}" href="./${escHtml(h.id)}/" style="--tc:${escHtml(h.color)}">`);
    tileLines.push(`      <span class="tn">${escHtml(tileEyebrow(h))}</span>`);
    tileLines.push(`      <span class="tt"><span aria-hidden="true">${h.icon}</span>${escHtml(h.name)}</span>`);
    tileLines.push(`      <span class="ts">${escHtml(desc)}</span>`);
    tileLines.push(`      <span class="st"><span class="meta">${escHtml(h.note)}</span></span>`);
    tileLines.push(`    </a>`);
  });
  html = replaceHtmlBlock(html, tileLines, 0);
  fs.writeFileSync(p, html, "utf8");
}

function generateValidateJs(subjects) {
  const p = path.join(ROOT, "tools", "validate.js");
  const lines = subjects.map((h, idx) => {
    const comma = idx < subjects.length - 1 ? "," : "";
    return `  { label: ${JSON.stringify(h.name)}, cwd: path.join(ROOT, ${JSON.stringify(h.id)}), args: ["tools/validate.js", ${JSON.stringify(h.course)}] }${comma}`;
  });
  fs.writeFileSync(p, replaceJsBlock(fs.readFileSync(p, "utf8"), lines, 0), "utf8");
}

function subjectShellEntries(h) {
  const libDir = path.join(ROOT, h.id, "lib");
  const libFiles = fs.existsSync(libDir)
    ? fs.readdirSync(libDir).filter((f) => f.endsWith(".js")).sort()
    : [];
  const entries = [
    `./${h.id}/`,
    `./${h.id}/index.html`,
    `./${h.id}/app.js`,
    ...libFiles.map((f) => `./${h.id}/lib/${f}`),
    `./${h.id}/${h.course}/course.json`,
    ...(h.extraShell || []).map((rel) => `./${h.id}/${rel}`)
  ];
  return entries;
}

function computeShellVersionHash(allShellPaths) {
  const hash = crypto.createHash("sha1");
  allShellPaths.forEach((rel) => {
    const clean = rel === "./" ? "index.html" : rel.replace(/^\.\//, "").replace(/\/$/, "/index.html");
    const fp = path.join(ROOT, clean);
    hash.update(rel + "\0");
    if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
      hash.update(fs.readFileSync(fp));
    }
    hash.update("\0");
  });
  return "study-hub-" + hash.digest("hex").slice(0, 8);
}

function generateSwJs(subjects) {
  const p = path.join(ROOT, "sw.js");
  const rootShell = [
    "./", "./index.html", "./switcher.js", "./manifest.webmanifest",
    "./lib/firebase-config.js", "./lib/firebase-sync.js", "./lib/cat.js", "./lib/stats.js",
    "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"
  ];
  const subjShellLines = [];
  const allShell = rootShell.slice();

  subjects.forEach((h, sIdx) => {
    const entries = subjectShellEntries(h);
    allShell.push(...entries);
    const isLastSubj = sIdx === subjects.length - 1;
    // Wrap neatly at ~4 entries per line
    for (let i = 0; i < entries.length; i += 4) {
      const slice = entries.slice(i, i + 4);
      const isLastChunk = isLastSubj && i + 4 >= entries.length;
      subjShellLines.push(
        "  " + slice.map((e) => JSON.stringify(e)).join(", ") + (isLastChunk ? "" : ",")
      );
    }
  });

  const navLines = subjects.map(
    (h) => `  if (/\\/${h.id}(\\/|$)/.test(pathname)) return caches.match("./${h.id}/index.html");`
  );

  let sw = fs.readFileSync(p, "utf8");
  sw = replaceJsBlock(sw, subjShellLines, 0);
  sw = replaceJsBlock(sw, navLines, 1);
  const ver = computeShellVersionHash(allShell);
  sw = sw.replace(/^const V = "[^"]*";/m, `const V = ${JSON.stringify(ver)};`);
  fs.writeFileSync(p, sw, "utf8");
}

function sync() {
  const subjects = readSubjects();

  generateCatJs(subjects); // before sharedCat is read, so every subject gets the fresh list

  const sharedConfig = fs.readFileSync(path.join(ROOT, "lib", "firebase-config.js"), "utf8");
  const sharedSync = fs.readFileSync(path.join(ROOT, "lib", "firebase-sync.js"), "utf8");
  const sharedCat = fs.readFileSync(path.join(ROOT, "lib", "cat.js"), "utf8");

  subjects.forEach((h) => {
    const src = path.resolve(ROOT, h.src);
    if (!fs.existsSync(src)) {
      console.error("Missing source hub: " + src);
      process.exit(1);
    }
    const destRoot = path.join(ROOT, h.id);
    if (fs.existsSync(destRoot)) {
      fs.rmSync(destRoot, { recursive: true, force: true });
    }
    const tracked = execFileSync("git", ["-C", src, "ls-files", "-z"], { encoding: "utf8" })
      .split("\0")
      .filter(Boolean);

    let count = 0;
    tracked.forEach((rel) => {
      if (SKIP.has(rel)) return;
      const from = path.join(src, rel);
      const to = path.join(destRoot, rel);
      if (!fs.existsSync(from)) return;
      fs.mkdirSync(path.dirname(to), { recursive: true });
      if (rel === "index.html") {
        fs.writeFileSync(to, patchIndexHtml(fs.readFileSync(from, "utf8"), h.id), "utf8");
      } else if (rel === "lib/firebase-config.js") {
        fs.writeFileSync(to, buildFirebaseConfig(sharedConfig, hubDocOf(h)), "utf8");
      } else if (rel === "lib/firebase-sync.js") {
        fs.writeFileSync(to, sharedSync, "utf8");
      } else if (rel === "lib/cat.js") {
        fs.writeFileSync(to, sharedCat, "utf8");
      } else {
        fs.copyFileSync(from, to);
      }
      count++;
    });
    h._syncedCount = count + 1; // +1 for lib/stats.js written right after generation
    h._resolvedSrc = src;
  });

  const freshStats = generateStatsJs(subjects);
  subjects.forEach((h) => {
    const destStats = path.join(ROOT, h.id, "lib", "stats.js");
    fs.mkdirSync(path.dirname(destStats), { recursive: true });
    fs.writeFileSync(destStats, freshStats, "utf8");
    console.log("✓ Synced " + h.id + " (" + h._syncedCount + " files) from " + h._resolvedSrc);
  });

  generateSwitcherJs(subjects);
  generateIndexHtml(subjects);
  generateValidateJs(subjects);
  generateSwJs(subjects);
  console.log("✓ Generated switcher.js, index.html, lib/cat.js, lib/stats.js, sw.js, tools/validate.js");

  const vRes = spawnSync(process.execPath, [path.join(ROOT, "tools", "validate.js")], { stdio: "inherit" });
  if (vRes.status !== 0) process.exit(vRes.status || 1);
}

function readStash() {
  try { return JSON.parse(fs.readFileSync(STASH_PATH, "utf8")) || {}; }
  catch (e) { return {}; }
}

function writeStash(obj) {
  try {
    fs.mkdirSync(path.dirname(STASH_PATH), { recursive: true });
    fs.writeFileSync(STASH_PATH, JSON.stringify(obj, null, 2) + "\n", "utf8");
  } catch (e) {}
}

function headSubjects() {
  try {
    const raw = execFileSync("git", ["-C", ROOT, "show", "HEAD:subjects.json"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function discoverSubjectFromRepo(id) {
  const srcRel = "../" + id + "-hub";
  const src = path.resolve(ROOT, srcRel);
  if (!fs.existsSync(src)) {
    console.error("Cannot add '" + id + "': missing folder " + src);
    process.exit(1);
  }
  let courseRel = "courses/" + id;
  if (!fs.existsSync(path.join(src, courseRel, "course.json"))) {
    const coursesDir = path.join(src, "courses");
    const dirs = fs.existsSync(coursesDir)
      ? fs.readdirSync(coursesDir).filter((d) => d !== "demo" && fs.existsSync(path.join(coursesDir, d, "course.json")))
      : [];
    if (!dirs.length) {
      console.error("Cannot find course.json under " + path.join(src, "courses"));
      process.exit(1);
    }
    courseRel = "courses/" + dirs[0];
  }
  const cJson = JSON.parse(fs.readFileSync(path.join(src, courseRel, "course.json"), "utf8"));
  const appJs = fs.existsSync(path.join(src, "app.js")) ? fs.readFileSync(path.join(src, "app.js"), "utf8") : "";
  const idxHtml = fs.existsSync(path.join(src, "index.html")) ? fs.readFileSync(path.join(src, "index.html"), "utf8") : "";

  const keyMatch = /var\s+KEY\s*=\s*"([^"]+)"/.exec(appJs);
  const brandSMatch = /id="brandS">([^<]+)</.exec(idxHtml);
  const name = cJson.title || (id.charAt(0).toUpperCase() + id.slice(1) + " Hub");
  const short = name.replace(/\s+Hub$/i, "").trim() || id;
  const code = cJson.code || id.toUpperCase();
  const brandRest = brandSMatch ? brandSMatch[1].replace(new RegExp("^" + code + "\\s*·\\s*"), "").trim() : short;
  const sub = "ČZU · " + code + " " + brandRest;

  return {
    id,
    name,
    short,
    icon: "📘",
    code,
    sub,
    desc: cJson.intro || "Lessons, drills, flashcards, Mastery stars and mock tests.",
    note: "Lessons · Drills · Mock tests",
    color: "var(--acc)",
    key: keyMatch ? keyMatch[1] : (id + "Hub.v1"),
    src: srcRel,
    course: courseRel
  };
}

function addSubject(id) {
  if (!id || !/^[a-z]{2,12}$/.test(id)) {
    console.error("Usage: node tools/hub.js add <id>  (id must match ^[a-z]{2,12}$)");
    process.exit(1);
  }
  const subjects = readSubjects();
  if (subjects.some((s) => s.id === id)) {
    console.log("Subject '" + id + "' is already in subjects.json; syncing…");
    sync();
    return;
  }

  let entry = null;
  let insertAt = subjects.length;

  const fromHead = headSubjects();
  if (Array.isArray(fromHead)) {
    const hIdx = fromHead.findIndex((s) => s.id === id);
    if (hIdx !== -1) {
      entry = fromHead[hIdx];
      // Place right before the next subject from HEAD that is currently present
      for (let i = hIdx + 1; i < fromHead.length; i++) {
        const curPos = subjects.findIndex((s) => s.id === fromHead[i].id);
        if (curPos !== -1) { insertAt = curPos; break; }
      }
    }
  }

  if (!entry) {
    const stash = readStash();
    if (stash[id] && stash[id].entry) {
      entry = stash[id].entry;
      if (typeof stash[id].index === "number") {
        insertAt = Math.min(subjects.length, Math.max(0, stash[id].index));
      }
    }
  }

  if (!entry) {
    entry = discoverSubjectFromRepo(id);
  }

  subjects.splice(insertAt, 0, entry);
  writeSubjects(subjects);
  console.log("✓ Added '" + id + "' to subjects.json");
  sync();
}

function removeSubject(id) {
  if (!id) {
    console.error("Usage: node tools/hub.js remove <id>");
    process.exit(1);
  }
  const subjects = readSubjects();
  const idx = subjects.findIndex((s) => s.id === id);
  if (idx === -1) {
    console.error("Subject '" + id + "' not found in subjects.json");
    process.exit(1);
  }
  const stash = readStash();
  stash[id] = { entry: subjects[idx], index: idx };
  writeStash(stash);

  subjects.splice(idx, 1);
  writeSubjects(subjects);

  const destRoot = path.join(ROOT, id);
  if (fs.existsSync(destRoot)) {
    fs.rmSync(destRoot, { recursive: true, force: true });
  }
  console.log("✓ Removed '" + id + "' from subjects.json and deleted " + id + "/");
  sync();
}

function walkFiles(dir, base = dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  fs.readdirSync(dir, { withFileTypes: true }).forEach((ent) => {
    if (ent.name === ".DS_Store") return;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkFiles(full, base, out);
    else if (ent.isFile()) out.push(path.relative(base, full).split(path.sep).join("/"));
  });
  return out;
}

function check() {
  const subjects = readSubjects();
  const sharedConfig = fs.readFileSync(path.join(ROOT, "lib", "firebase-config.js"), "utf8");
  const sharedSync = fs.readFileSync(path.join(ROOT, "lib", "firebase-sync.js"), "utf8");
  const sharedCat = fs.readFileSync(path.join(ROOT, "lib", "cat.js"), "utf8");
  const sharedStats = fs.readFileSync(path.join(ROOT, "lib", "stats.js"), "utf8");

  let warnings = 0;

  subjects.forEach((h) => {
    const src = path.resolve(ROOT, h.src);
    if (!fs.existsSync(src)) {
      console.warn("⚠ [" + h.id + "] missing source repo: " + src);
      warnings++;
      return;
    }

    // (b) Check uncommitted changes in source repo
    const statusOut = execFileSync("git", ["-C", src, "status", "--porcelain"], { encoding: "utf8" })
      .split(/\r?\n/)
      .filter((line) => {
        if (!line.trim()) return false;
        const p = line.slice(3).trim();
        if (p === ".DS_Store" || p.endsWith("/.DS_Store")) return false;
        if (p === ".claude" || p === ".claude/" || p.startsWith(".claude/")) return false;
        return true;
      });
    if (statusOut.length) {
      console.warn("⚠ [" + h.id + "] source repo has uncommitted changes (" + src + "):");
      statusOut.forEach((l) => console.warn("    " + l));
      warnings++;
    }

    // (a) Compare this hub's <id>/ against committed HEAD of source repo
    const committedFiles = execFileSync("git", ["-C", src, "ls-tree", "-r", "--name-only", "-z", "HEAD"], { encoding: "utf8" })
      .split("\0")
      .filter(Boolean);

    const expected = new Map();
    committedFiles.forEach((rel) => {
      if (SKIP.has(rel)) return;
      if (rel === "index.html") {
        const raw = execFileSync("git", ["-C", src, "show", "HEAD:" + rel], { encoding: "utf8" });
        expected.set(rel, Buffer.from(patchIndexHtml(raw, h.id), "utf8"));
      } else if (rel === "lib/firebase-config.js") {
        expected.set(rel, Buffer.from(buildFirebaseConfig(sharedConfig, hubDocOf(h)), "utf8"));
      } else if (rel === "lib/firebase-sync.js") {
        expected.set(rel, Buffer.from(sharedSync, "utf8"));
      } else if (rel === "lib/cat.js") {
        expected.set(rel, Buffer.from(sharedCat, "utf8"));
      } else {
        const buf = execFileSync("git", ["-C", src, "show", "HEAD:" + rel], { maxBuffer: 64 * 1024 * 1024 });
        expected.set(rel, buf);
      }
    });
    expected.set("lib/stats.js", Buffer.from(sharedStats, "utf8"));

    const destRoot = path.join(ROOT, h.id);
    const actualFiles = new Set(walkFiles(destRoot));

    expected.forEach((expBuf, rel) => {
      if (!actualFiles.has(rel)) {
        console.warn("⚠ [" + h.id + "] missing synced file: " + h.id + "/" + rel);
        warnings++;
        return;
      }
      const actBuf = fs.readFileSync(path.join(destRoot, rel));
      if (!expBuf.equals(actBuf)) {
        console.warn("⚠ [" + h.id + "] differs from committed source (sync would overwrite): " + h.id + "/" + rel);
        warnings++;
      }
    });

    actualFiles.forEach((rel) => {
      if (!expected.has(rel)) {
        console.warn("⚠ [" + h.id + "] extra local file not in committed source (sync would delete): " + h.id + "/" + rel);
        warnings++;
      }
    });
  });

  if (warnings === 0) {
    console.log("✓ Check clean across " + subjects.map((s) => s.id).join(", ") + " (0 warnings)");
  } else {
    console.warn("⚠ Check finished with " + warnings + " warning(s)");
    process.exit(1);
  }
}

if (require.main === module) {
  const cmd = process.argv[2];
  const arg = process.argv[3];
  if (cmd === "sync") sync();
  else if (cmd === "add") addSubject(arg);
  else if (cmd === "remove") removeSubject(arg);
  else if (cmd === "check") check();
  else {
    console.error("Usage: node tools/hub.js <sync|add <id>|remove <id>|check>");
    process.exit(1);
  }
}

module.exports = { sync, addSubject, removeSubject, check };
