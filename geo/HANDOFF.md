# Geology Hub: handoff for Antigravity (or any coding agent)

Read this first, then `AGENTS.md` (the hard rules), then `AUTHORING.md` (the lecture data format).

## What this is

A study site for the geology course **CZU ZOX101E** (Czech University of Life Sciences, Prague; lecturer Mgr. Václav Santolík, Ph.D.). One student uses it to learn from the lecture slides: step-by-step lessons, flashcards, games, mock tests, a four-star Mastery mode, a dictionary and a final-exam practice.

- Live site: https://mrsimonm.github.io/geo-hub/ (GitHub Pages, served from the `main` branch root)
- Repo: https://github.com/mrsimonm/geo-hub (public)
- It installs on a phone like an app and works offline (PWA).
- Progress is saved in the browser (`localStorage`, key `geoHub.v1`). There is no server and no account.

## Hard rules (summary; the full list is in AGENTS.md)

- Plain HTML, CSS and JS. **No build step, no npm, no frameworks, no modules, no bundling.**
- Script paths stay relative (`app.js`, `topics/t1.js`).
- External libraries only from cdnjs.cloudflare.com with a pinned version.
- Must work on a phone (16px side gutters, no sideways scrolling) and in light and dark mode. Use the existing CSS variables, never hard-coded colours.
- Colour meanings: accent = idea, amber = teacher said, red = exam trap, green = correct, cyan = analogy, grey = don't memorise.
- **Geology facts must be accurate.** If unsure, leave a `TODO: verify` comment instead of guessing. Check facts against the slides in `slides/` (see below).
- Do not rename or delete files. When done, list the files you changed.
- Do not commit with a personal email address. Use the GitHub noreply address (see "Git" below).

## How to run and check

```bash
python3 -m http.server 8000      # then open http://localhost:8000
node tools/validate.js           # must print "OK: no errors" before every commit
```

Opening `index.html` straight from disk does not work, because the app fetches the data files.

## File map

| Path | What it is |
|---|---|
| `index.html` | The page. All CSS lives here. Loads `lib/lecture-lib.js`, `app.js`, `topics/t1.js` to `t6.js`, then `GEO.start()`. |
| `app.js` | The engine: home, lessons, quizzes, flashcards, games, Mastery, XP/streak, glossary, exam. Defines `window.GEO`. |
| `lib/lecture-lib.js` | Turns a data lecture (`lecture.json` + `steps.md`) into the engine's topic object. Shared by the app and the validator. |
| `topics/t1.js` to `t6.js` | Lectures 1 to 6, the **old format**: hand-written JS, each calls `GEO.register({...})`. |
| `courses/geology/course.json` | The real course. Its `lectures` list is empty for now (lectures 1 to 6 are still JS files). New lectures go here. |
| `courses/demo/` | An example course with one example lecture (Mohs hardness). Not real course material. Open it with `?course=courses/demo/course.json`. |
| `templates/lecture/` | The starting template for a new lecture. |
| `AUTHORING.md` | The data format, in full. |
| `PROMPT.md` | A prompt for any AI that turns slides into a lecture. |
| `tools/validate.js` | The validator. Run it after every change. |
| `tools/pdf-to-text.swift` | macOS-only helper that extracts text from a slide PDF: `swift tools/pdf-to-text.swift in.pdf out.txt`. |
| `sw.js`, `manifest.webmanifest`, `icon-*.png`, `.nojekyll` | The PWA / offline / GitHub Pages setup. |
| `slides/` | The lecturer's slides, one PDF per lecture, plus extracted text (see "Slides"). |
| `geology-hub/` | An old duplicate of the project from before the repo existed. **Ignore it.** It is not tracked. |

## How a lecture is built

Every lecture, old or new, becomes one **topic object**: `id` (`t1`..), `num`, `title`, `short`, `sub`, `blurb`, `start`, `steps[]` (the lesson), `Q[]` (multiple-choice questions), `VOC[]` (vocabulary), `VCON`, `sheet` (cheat sheet), `cards` (flip cards), `names` (key-facts tab), `foot`, and optionally `mastery` and `next`.

The same data feeds everything: the mock test, final-exam practice, Review, the games (Quick 5, Lightning true/false, Match pairs, Type it), flashcards, the dictionary and the glossary pop-ups.

**Mastery** (4 stars) turns each item into true/false, then multiple choice, then type-it as the stars rise. A lecture gets the Mastery tab only if it has a `mastery` block. Its items are every question, every vocabulary term, **plus** the hand-written facts in `mastery.facts`.

Mastery fact format: `[stepNumber, "Sentence with {right|wrong|wrong|wrong}."]`. The first option is the correct one; use 3 wrong options that are plausible but definitely wrong; exactly one `{...}` per sentence. Look at the end of `topics/t6.js` for the original example.

## Current state

**Done**
- Data-file lecture format, validator, authoring guide and AI prompt.
- Installable offline app, live on GitHub Pages.
- Lectures 1 to 6 all work and all have Mastery (facts for lectures 1 to 5 were written from the slides on 19 Nov 2026).

**Not done / ideas, roughly in order of value**
1. **Lecture 7: Structural geology and tectonics.** Slides are in `slides/7-structural-geology-tectonics.pdf` (text in `slides/text/`). Make it as a data lecture: copy `templates/lecture/` to `courses/geology/lectures/t7/`, fill it in, add it to `courses/geology/course.json`, run the validator. The home page currently shows a grey "Lecture 7 / Added after it happens" placeholder tile that should go away once the lecture exists (look for it in `app.js`, search "Later in the semester").
2. **Lecture 8 (Historical and regional geology I) is done** as a data lecture in `courses/geology/lectures/t8/`, built from the slides only (no recording existed on 25 Nov). If a recording turns up, add "Teacher said" lines marked `{rec}`. **Lectures 9+** (historical and regional geology II, economic geology I and II, environmental geology) when the slides arrive. Only the newest lecture should have a `next` field: it drives the "Next test" banner.
3. **Make the special widgets data-driven.** Lectures 1 to 6 contain custom code attached to steps: drills (all six), sorters (2 to 6), order games (4 and 6), SVG diagrams (3, 5, 6) and a grade calculator (lecture 1). These cannot be expressed as data yet, which is why lectures 1 to 6 are not migrated. Sorters, drills and order games are the common ones; making them data types would let all six migrate.
4. Check that the Claude artifact copy ("Geology Hub 2") can fetch the `.json` and `.md` files when hosted on claude.ai. Untested.
5. Try the install on a real phone. Untested.
6. Optional: Firebase sync of progress across devices. Not wanted yet.

## Slides

The lecture PDFs are in `slides/`, with the text of each in `slides/text/`. Duplicate downloads were removed: there is exactly one file per lecture.

| File | Lecture |
|---|---|
| `1-introduction.pdf` | 1 Introduction and course rules |
| `2-minerals.pdf` | 2 Minerals |
| `3-igneous-rocks.pdf` | 3 Igneous rocks and processes |
| `4-sedimentary-rocks.pdf` | 4 Sedimentary rocks and processes |
| `5-metamorphic-rocks.pdf` | 5 Metamorphic rocks and processes |
| `6-earth-structure.pdf` | 6 Earth structure |
| `7-structural-geology-tectonics.pdf` | 7 Structural geology and tectonics |
| `8-historical-regional-geology-1.pdf` | 8 Historical and regional geology I |

The slides are in the repo (the owner chose to publish them), so a fresh clone has them. They belong to the lecturer, so do not copy or reuse them anywhere else, and do not add new slide files without asking the owner. The app itself does not load anything from `slides/`.

Tips for reading the slides:
- Most slides are pictures. The extracted text in `slides/text/` is only the typed words, so a slide that shows a diagram may have almost no text. Open the PDF to see the diagram.
- Some slides are deliberately scrambled "match the items" activities (for example lecture 4 slides 31 and 43). The next slide holds the correct answer.
- In lecture 2 the teacher said only 22 minerals are tested; the existing `topics/t2.js` has the list.
- The student also has audio recordings (transcribed with Wispr) of the lectures. Lines marked "recording" in the lessons came from those. Do not invent such lines.

## Git

- Work on `main`; pushing to `main` updates the live site within a minute or two.
- Commit with the GitHub noreply identity, not a personal email:
  ```bash
  git config user.name "mrsimonm"
  git config user.email "322631765+mrsimonm@users.noreply.github.com"
  ```
- After changing `sw.js`, bump its cache name (`geo-hub-v1` to `geo-hub-v2`). Content files (`.json`, `.md`, `.js`, `.html`) are fetched fresh when online, so new lectures do not need a bump.
- If the live site looks old after a push, reload twice or reopen the installed app; the browser keeps a saved copy.

## Definition of done for any change

1. `node tools/validate.js` prints `OK: no errors`.
2. Opened locally in a browser: no red notices on the home page, no errors in the console, and it still works on a phone-width screen in light and dark mode.
3. Every geology statement is checked against the slides.
4. You listed the files you changed.
