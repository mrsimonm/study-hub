#!/usr/bin/env node
/* Generated from hub-kit/shell, edit there (then run: node ~/Projects/hub-kit/tools/build.js all). */
/* Runs each sub-hub's lecture validator across every subject in subjects.json. */
"use strict";

const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const RUNS = [
  /* HUB:BEGIN */
  { label: "Bio Hub", cwd: path.join(ROOT, "bio"), args: ["tools/validate.js", "courses/bio"] },
  { label: "Eco Hub", cwd: path.join(ROOT, "eco"), args: ["tools/validate.js", "courses/eco"] },
  { label: "Geology Hub", cwd: path.join(ROOT, "geo"), args: ["tools/validate.js", "courses/geology"] }
  /* HUB:END */
];

let failed = false;
RUNS.forEach((r) => {
  console.log("=== " + r.label + " ===");
  const res = spawnSync(process.execPath, r.args, { cwd: r.cwd, stdio: "inherit" });
  if (res.status !== 0) failed = true;
});

process.exit(failed ? 1 : 0);
