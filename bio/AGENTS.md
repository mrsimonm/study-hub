# Bio Hub: notes for the coding agent

A static, no-build study site for CZU Prague Fundamentals of Biology (**ZEX108E**, guarantor prof. Bohumil Mandák). Keep it plain HTML, CSS and JS.

## Structure
- `index.html`: markup and all CSS. Loads `lib/lecture-lib.js`, `app.js`, `lib/cat.js`, then `GEO.start()`.
- `app.js`: shared engine (home, lessons, quizzes, flashcards, games, mastery, XP/streak, glossary, exam). Defines `window.GEO`.
- `lib/lecture-lib.js`: turns a data lecture (`lecture.json` + `steps.md`) into the engine's topic object (shared by the app and the validator).
- `courses/bio/course.json`: course metadata, `lectures[]`, `tests[]` (one: the final exam).
- `courses/bio/lectures/tN/`: one folder per lecture (`lecture.json` + `steps.md`), N = lecture number 1–12.
- `tools/import_extracted.py`: **generates** every `courses/bio/lectures/tN/` from the extracted slide notes. Hand edits to generated files are lost on the next import; edit the notes and re-import instead.

## Rules
- No build step, no npm, no frameworks. Plain HTML, CSS and JS. Script paths stay relative.
- External libraries only from cdnjs.cloudflare.com with a pinned version.
- Must work on a phone (16px side gutters, no horizontal page scroll) and in light and dark mode. Use the existing CSS variables.
- Keep the colour meanings: accent = idea, amber = teacher said, red = exam trap, green = correct, cyan = analogy, grey = don't memorise.
- Biology facts must match the lecture slides. Every point in the notes cites a slide as (p. N) or (s. N). If unsure, leave a `TODO: verify` comment instead of guessing.
- After any change run `node tools/validate.js courses/bio` and fix every ERROR. List the files you changed. Do not rename or delete files.

## Handoff
Start with `HANDOFF.md`.
