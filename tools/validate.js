#!/usr/bin/env node
/* Runs each sub-hub's lecture validator across Bio Hub, Eco Hub and Geology Hub. */
"use strict";

const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const RUNS = [
  { label: "Bio Hub", cwd: path.join(ROOT, "bio"), args: ["tools/validate.js", "courses/bio"] },
  { label: "Eco Hub", cwd: path.join(ROOT, "eco"), args: ["tools/validate.js", "courses/eco"] },
  { label: "Geology Hub", cwd: path.join(ROOT, "geo"), args: ["tools/validate.js"] }
];

let failed = false;
RUNS.forEach((r) => {
  console.log("=== " + r.label + " ===");
  const res = spawnSync(process.execPath, r.args, { cwd: r.cwd, stdio: "inherit" });
  if (res.status !== 0) failed = true;
});

process.exit(failed ? 1 : 0);
