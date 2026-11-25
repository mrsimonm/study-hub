#!/usr/bin/env node
/* Syncs Bio Hub, Eco Hub and Geology Hub from their standalone ~/Projects/<name>-hub folders
   into study-hub/{bio,eco,geo}, wiring each sub-hub to the shared manifest, service worker, switcher.js,
   unified Google sign-in and shared Study Cat without touching the standalone repositories. */
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const PROJECTS = path.resolve(ROOT, "..");

const HUBS = [
  { id: "bio", src: path.join(PROJECTS, "bio-hub"), hubDoc: "bio" },
  { id: "eco", src: path.join(PROJECTS, "eco-hub"), hubDoc: "eco" },
  { id: "geo", src: path.join(PROJECTS, "geo-hub"), hubDoc: "" }
];

const SKIP = new Set([
  ".gitignore",
  ".nojekyll",
  "firestore.rules",
  "manifest.webmanifest",
  "sw.js"
]);

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

["icon-192.png", "icon-512.png", "icon-maskable-512.png"].forEach((icon) => {
  const srcIcon = path.join(PROJECTS, "bio-hub", icon);
  if (fs.existsSync(srcIcon)) {
    fs.copyFileSync(srcIcon, path.join(ROOT, icon));
  }
});

const sharedConfig = fs.readFileSync(path.join(ROOT, "lib", "firebase-config.js"), "utf8");
const sharedSync = fs.readFileSync(path.join(ROOT, "lib", "firebase-sync.js"), "utf8");
const sharedCat = fs.readFileSync(path.join(ROOT, "lib", "cat.js"), "utf8");
const sharedStats = fs.readFileSync(path.join(ROOT, "lib", "stats.js"), "utf8");

HUBS.forEach(({ id, src, hubDoc }) => {
  if (!fs.existsSync(src)) {
    console.error("Missing source hub: " + src);
    process.exit(1);
  }
  const destRoot = path.join(ROOT, id);
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
      fs.writeFileSync(to, patchIndexHtml(fs.readFileSync(from, "utf8"), id), "utf8");
    } else if (rel === "lib/firebase-config.js") {
      fs.writeFileSync(to, buildFirebaseConfig(sharedConfig, hubDoc), "utf8");
    } else if (rel === "lib/firebase-sync.js") {
      fs.writeFileSync(to, sharedSync, "utf8");
    } else if (rel === "lib/cat.js") {
      fs.writeFileSync(to, sharedCat, "utf8");
    } else {
      fs.copyFileSync(from, to);
    }
    count++;
  });
  fs.writeFileSync(path.join(destRoot, "lib", "stats.js"), sharedStats, "utf8");
  count++;
  console.log("✓ Synced " + id + " (" + count + " files) from " + src);
});
