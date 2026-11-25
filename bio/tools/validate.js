#!/usr/bin/env node
/* Validate data lectures before they reach the app.
   Usage:
     node tools/validate.js                       checks every course in courses/ and the template
     node tools/validate.js courses/geology       checks one course folder (or a course.json)
     node tools/validate.js templates/lecture     checks one lecture folder
   Exit code 1 if any error is found. Warnings never fail the run. */
"use strict";
const fs = require("fs");
const path = require("path");
const lib = require("../lib/lecture-lib.js");
const root = path.resolve(__dirname, "..");

let errors = 0, warnings = 0;
const seenIds = {};

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); }
  catch (e) { return { __error: e.message }; }
}
function report(label, res) {
  const bad = res.errors.length, warn = res.warnings.length;
  errors += bad; warnings += warn;
  console.log((bad ? "✗ " : "✓ ") + label + (bad ? "  (" + bad + " error" + (bad > 1 ? "s" : "") + ")" : "") + (warn ? "  [" + warn + " warning" + (warn > 1 ? "s" : "") + "]" : ""));
  res.errors.forEach(m => console.log("    ERROR   " + m));
  res.warnings.forEach(m => console.log("    warning " + m));
}
function checkLecture(dir, courseKey) {
  const lp = path.join(dir, "lecture.json"), sp = path.join(dir, "steps.md");
  const label = path.relative(root, dir) || ".";
  if (!fs.existsSync(lp) || !fs.existsSync(sp)) {
    report(label, { errors: ["needs both lecture.json and steps.md in this folder."], warnings: [] }); return;
  }
  const L = readJSON(lp);
  if (L.__error) { report(label, { errors: ["lecture.json is not valid JSON: " + L.__error], warnings: [] }); return; }
  const res = lib.validate(L, fs.readFileSync(sp, "utf8"));
  /* ids must be unique across one course */
  if (courseKey) {
    const bag = seenIds[courseKey] = seenIds[courseKey] || { lectures: {}, questions: {} };
    const id = L.id || "t" + L.num;
    if (bag.lectures[id]) res.errors.push('lecture id "' + id + '" is already used by ' + bag.lectures[id]);
    bag.lectures[id] = label;
    (L.questions || []).forEach(q => {
      if (!q || !q.id) return;
      if (bag.questions[q.id]) res.errors.push('question id "' + q.id + '" is already used in ' + bag.questions[q.id]);
      else bag.questions[q.id] = label;
    });
  }
  report(label, res);
}
function checkCourse(file) {
  const C = readJSON(file), base = path.dirname(file);
  console.log("\nCourse: " + path.relative(root, file));
  if (C.__error) { errors++; console.log("✗ course.json is not valid JSON: " + C.__error); return; }
  if (!Array.isArray(C.lectures)) { errors++; console.log('✗ "lectures" must be a list of folder paths.'); return; }
  if (!C.lectures.length) console.log("  (no data lectures listed yet)");
  C.lectures.forEach(p => checkLecture(path.join(base, p), file));
}

const args = process.argv.slice(2);
if (!args.length) {
  const cdir = path.join(root, "courses");
  if (fs.existsSync(cdir)) fs.readdirSync(cdir).forEach(d => {
    const f = path.join(cdir, d, "course.json");
    if (fs.existsSync(f)) checkCourse(f);
  });
  console.log("\nTemplate");
  checkLecture(path.join(root, "templates", "lecture"));
} else {
  args.forEach(a => {
    const p = path.resolve(a);
    if (fs.existsSync(p) && fs.statSync(p).isFile() && /course\.json$/.test(p)) checkCourse(p);
    else if (fs.existsSync(path.join(p, "course.json"))) checkCourse(path.join(p, "course.json"));
    else checkLecture(p);
  });
}
console.log("\n" + (errors ? "FAILED: " + errors + " error(s)" : "OK: no errors") + (warnings ? ", " + warnings + " warning(s)" : ""));
process.exit(errors ? 1 : 0);
