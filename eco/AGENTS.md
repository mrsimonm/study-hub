# Eco Hub: notes for the coding agent

A static, no-build study site for ČZU Fundamentals of Ecology (Martin Bulla & Peter Mikula). Keep it plain HTML, CSS and JS. Same engine as Micro Hub (`../micro-hub`), Statistics Hub (`../stats-hub`) and Geology Hub (`../geo-hub`). The shared guide for all hubs is `../hub-kit/GUIDE.md`.

## Structure
- `index.html`: markup and all CSS. Loads Firebase compat SDK, `lib/firebase-config.js`, `lib/firebase-sync.js`, `lib/lecture-lib.js`, `lib/path.js`, `app.js`, `lib/cat.js`, `lib/tickall.js`, then calls `GEO.start()`.
- `app.js`: shared engine (Home by test, lessons, quizzes, flashcards, games, Mastery, XP/streak, glossary, exam practice). Defines `window.GEO`. Reads `exam` (question count and minutes), `grades` and `tickall` from `course.json`.
- `lib/tickall.js`: "Tick all that apply" drill (6 options, 1–6 correct, any wrong tick = 0), data in `courses/eco/tickall.json`.
- `courses/eco/course.json`: course metadata, `lectures[]`, `tests[]`, `paths[]`.
- `courses/eco/lectures/tN/`: one folder per lesson (`lecture.json` + `steps.md`).
- `courses/eco/path/exam.json`: the "Start studying" walk-through.

## Rules
- No build step, no npm, no frameworks. Plain HTML, CSS and JS. Script paths stay relative.
- Must work on a phone (16px side gutters, no horizontal page scroll) and in light and dark mode. Use existing CSS variables, never hard-coded colours.
- Colour meanings: accent = idea, amber = teacher said, red = exam trap, green = correct, cyan = analogy, grey = don't memorise.
- Facts must match the course material (lecture slides, the 2026 glossary, the group presentations). If unsure, write `TODO: verify` instead of guessing.
- In `facts`, exactly one `{right|wrong1|wrong2|wrong3}` gap per sentence, and the right answer must be plain typable words or a number.
- In `tickall.json`, every question has exactly 6 options (`right` + `wrong`), at least one right.
- After any change run `node tools/validate.js courses/eco` and fix every ERROR. List the files you changed. Do not rename or delete files.
- Start with `HANDOFF.md`.
