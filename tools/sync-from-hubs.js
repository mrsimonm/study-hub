#!/usr/bin/env node
/* Syncs Bio Hub, Eco Hub and Geology Hub from their standalone ~/Projects/<name>-hub folders
   into study-hub/{bio,eco,geo}, wiring each sub-hub to the shared manifest, service worker and switcher.js
   without touching the standalone repositories or changing any hub logic/content. */
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const PROJECTS = path.resolve(ROOT, "..");

const HUBS = [
  { id: "bio", src: path.join(PROJECTS, "bio-hub") },
  { id: "eco", src: path.join(PROJECTS, "eco-hub") },
  { id: "geo", src: path.join(PROJECTS, "geo-hub") }
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
    .replace('navigator.serviceWorker.register("sw.js")', 'navigator.serviceWorker.register("../sw.js")');

  const tag = '<script src="../switcher.js" data-hub="' + hubId + '"></script>';
  if (!out.includes(tag)) {
    out = out.replace('<script src="app.js"></script>', '<script src="app.js"></script>\n' + tag);
  }
  return out;
}

// Copy shared PWA icons from bio-hub to root if needed
["icon-192.png", "icon-512.png", "icon-maskable-512.png"].forEach((icon) => {
  const srcIcon = path.join(PROJECTS, "bio-hub", icon);
  if (fs.existsSync(srcIcon)) {
    fs.copyFileSync(srcIcon, path.join(ROOT, icon));
  }
});

HUBS.forEach(({ id, src }) => {
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
      const patched = patchIndexHtml(fs.readFileSync(from, "utf8"), id);
      fs.writeFileSync(to, patched, "utf8");
    } else {
      fs.copyFileSync(from, to);
    }
    count++;
  });
  console.log("✓ Synced " + id + " (" + count + " files) from " + src);
});
