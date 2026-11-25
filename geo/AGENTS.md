# Geology Hub: notes for the coding agent

A static, no-build study site for geology (CZU ZOX101E). It is published as a Claude artifact, so keep it plain.

## Structure
- `index.html`: markup and all CSS. Loads `app.js`, then `topics/t1.js` to `t6.js`, then calls `GEO.boot()`.
- `app.js`: shared engine (home, lessons, quizzes, flashcards, games, mastery, XP/streak, glossary, exam). Defines `window.GEO`.
- `topics/tN.js`: one file per lecture. Each calls `GEO.register({...})` with its content (fields like `id`, `num`, `short`, `Q` for questions, `VOC` for vocabulary).

## Adding or changing lectures
New lectures are DATA, not code: a folder `courses/<course>/lectures/tN/` with `lecture.json` + `steps.md`, listed in that course's `course.json`. Read `AUTHORING.md` for the format and `PROMPT.md` for the generation prompt. After any change run `node tools/validate.js` and fix every ERROR. Do not hand-write new `topics/tN.js` files. `lib/lecture-lib.js` turns the data into the engine's topic object (shared by the app and the validator).

## Rules
- No build step, no npm, no frameworks. Plain HTML, CSS and JS.
- Script paths stay relative (`app.js`, `topics/t1.js`). Do not turn them into modules or bundle them.
- External libraries only from cdnjs.cloudflare.com with a pinned version. Google Fonts is already used.
- Must work on a phone (16px side gutters, no horizontal page scroll) and in light and dark mode. Use the existing CSS variables, never hard-coded colours.
- Keep the colour meanings: accent = idea, amber = teacher said, red = exam trap, green = correct, cyan = analogy, grey = don't memorise.
- Before editing a topic file, read an existing one (e.g. `topics/t1.js`) and copy its data format exactly. Do not change the format.
- Geology facts must be accurate. If unsure, leave a `TODO: verify` comment instead of guessing.
- When done, list the files you changed. Do not rename or delete files.

## Handoff
Start with `HANDOFF.md`: project state, file map, to-do list and where the lecture slides are (`slides/`, local only).
