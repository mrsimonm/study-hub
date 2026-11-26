# Study Hub (`study-hub`): Instructions for AI Agents

Unified static study app (plain HTML/CSS/JS, no npm, no build step, served on GitHub Pages from `main` at https://mrsimonm.github.io/study-hub/).

Three layers, each edited in exactly one place:

| What | Where to edit | Then run |
|---|---|---|
| **Shell** (picker, `Subjects ▾` switcher, offline cache, Study Cat, 📊 Stats, Google sign-in, `tools/hub.js`) | `~/Projects/hub-kit/shell/` (shared with every family hub) | `node ~/Projects/hub-kit/tools/build.js all` |
| **Subjects list** (which subjects, names, icons, colours) | `subjects.json` in this repo | `node tools/hub.js sync` |
| **Subject content** (lessons, questions) | `~/Projects/<id>-hub` | `node tools/hub.js sync` |

Subjects here: `bio`, `eco`, `geo`. Each lives in its own repo at `~/Projects/<id>-hub` and is copied into `study-hub/<id>/`.

## Key Files
- `hub.json` — this hub's own values for the shell: `id`, `name`, `short`, `prefix` (`studyHub`), `description`, `tagline`, `school`, `colors`, `firebaseProject`. **Never change `prefix`**: every saved progress, Study Cat and stats key (`studyHub.*`) depends on it.
- `subjects.json` — every subject (`id`, `name`, `short`, `icon`, `code`, `sub`, `desc`, `note`, `color`, `key`, `src`, `course`; optional `hubDoc`, `examKey`, `catalogStatic`, `extraShell`, see hub-kit `GUIDE.md` section 7).
- Files starting with *"Generated from hub-kit/shell, edit there"* (`index.html`, `switcher.js`, `sw.js`, `lib/*.js`, `tools/hub.js`, `tools/validate.js`, `firestore.rules`, …) — **don't edit them here**; the next build overwrites them. Edit `~/Projects/hub-kit/shell/` instead.
- `tools/hub.js` — `sync`, `add <id>`, `remove <id>`, `check`. Fills the `HUB:BEGIN` … `HUB:END` lists (picker tiles, switcher, Study Cat, stats catalogue, offline cache + version, validator list) from `subjects.json`, then validates.
- `~/Projects/<id>-hub/slides/text/*.txt` — plain text of every slide deck / PDF. Read these instead of raw PDFs.

## Recipes

### Shell change (looks or behaviour shared by all family hubs)
```bash
# edit ~/Projects/hub-kit/shell/...
node ~/Projects/hub-kit/tools/build.js all --check --diff   # preview, writes nothing
node ~/Projects/hub-kit/tools/build.js all                 # writes into study-hub and margo-hub, syncs, validates
```
Check both hubs locally, then commit hub-kit and each hub, and push all of them.

### Edit or add a lecture
1. Work in `~/Projects/<id>-hub/courses/<course>/lectures/tN/` (read that repo's `AGENTS.md`, `AUTHORING.md`, `slides/text/*.txt`). **Never edit `study-hub/<id>/` directly** — `sync` overwrites it.
2. Validate and commit there: `node tools/validate.js courses/<course>`, then `git -c user.name=mrsimonm -c user.email=322631765+mrsimonm@users.noreply.github.com commit -am "..."`.
3. Here: `node tools/hub.js sync`, `node tools/hub.js check`, commit and push.

### Add or remove a subject
```bash
node tools/hub.js add <id>      # id matches ^[a-z]{2,12}$, not "cat" or "analytics"
node tools/hub.js remove <id>
```
Refine `icon`, `color`, `short`, `desc`, `note` in `subjects.json` and re-run `node tools/hub.js sync`. Firestore rules already allow any such id.

### New family hub
New folder with `hub.json` + `subjects.json`, add it to `~/Projects/hub-kit/hubs.json`, run `node ~/Projects/hub-kit/tools/build.js all`.

## Hard Rules
- **Sources rule:** facts, formulas, definitions and spelling come strictly from slides, seminar PDFs and official answer keys (`slides/text/*.txt`). Lecture transcripts are context only; anything only in a transcript must be marked *"From the lecture (no slide)"*.
- **No build step for the site / no npm:** plain HTML, CSS and JS. The Node tools only copy and generate files. Keep phone layout (16px gutters, no horizontal scroll) and light/dark CSS variables working.
- **Keep user data safe:** don't change `prefix`, subject `key`s or `hubDoc`s, or Firestore paths (`users/{uid}/hubs/{id}`).
- **Geology Hub** keeps its old cloud location `users/{uid}` (`"hubDoc": ""` in `subjects.json`), and its lectures 1–6 are old JS files in `geo/topics/` (listed in `catalogStatic` and `extraShell`). Don't change these.
- **Local preview:** `python3 -m http.server 8000`; check the picker (`/?pick=1`), `Subjects ▾`, `📊 Stats`, the Study Cat and each subject, at phone width and in dark mode.
- **Commit identity:** always `git -c user.name=mrsimonm -c user.email=322631765+mrsimonm@users.noreply.github.com commit`.
