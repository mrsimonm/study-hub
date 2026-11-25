# Bio Hub: handoff for Claude, Claude Code or Antigravity

Read this first, then `AGENTS.md` (the hard rules), then `AUTHORING.md` (lecture data format).

## What this is

A study web app for **CZU Prague ZEX108E Fundamentals of Biology** (winter semester 2026/27, Faculty of Environmental Sciences, guarantor prof. Mgr. Bohumil Mandák, Ph.D.). Fourth hub next to Geology Hub, Statistics Hub and Micro Hub; same engine, same Study Cat.

- Project folder on this Mac: `/Users/simonmusel/Projects/bio-hub`
- Not on GitHub yet. If published like the others: public repo `mrsimonm/bio-hub`, GitHub Pages from `main` root.
- Progress is saved in the browser (`localStorage` keys `bioHub.*`). Google sign-in sync is in the code but **off** until a Firebase project is created and its config pasted into `lib/firebase-config.js`.
- Offline PWA: `sw.js`, cache `bio-hub-v1`. Bump it when you change the shell files.

## Course facts

- 12 lectures by 8 lecturers, lectures only (no practicals).
- **Exam: a written test of 24 questions based only on the lectures** (lecture 1, slide 3). 3 exam terms; if you first come on the last listed term you don't get two more. Pass mark, time limit and question type are **not published** (not in the slides, syllabus, UIS catalogue or Moodle). The hub's 24-question practice uses a 30-minute practice timer.
- Exam dates: UIS.

## Where the content comes from

The slides were downloaded from Moodle and turned into structured notes in
`~/Desktop/Biology Exam Prep/Biology Exam Prep/extracted/` (local only, not in this repo):

- `lectures/NN-*.md`: one note file per lecture in a fixed template, every point citing its slide
- `data/*.json`: quiz (146), flashcards (453), terms (248), built by `extracted/tools/build_json.py`
- `COVERAGE.md`: what was read, slide errors found, and the few places context was added
- `slides/`, `raw/`: page images and raw text of every slide

`tools/import_extracted.py` turns those notes into `courses/bio/lectures/t1..t12`:

| Notes section | Hub part |
|---|---|
| Key concepts (+ Processes, Comparisons) | `steps.md` lesson steps (small sections merged to ~5-minute steps), plus an "Exam focus" step |
| Quiz | `questions` (first 4 per lecture flagged `fol`); up to 2 placed as inline checks in the step whose slides they come from |
| Key terms | `vocab` (dictionary, glossary pop-ups, match, type-it, Mastery) |
| Flashcards | `cards` (Flashcards tab, "Which question does this answer?") |
| Comparisons (tables) | `sheet` (cheat sheet) |
| Facts & numbers | `names` (Key facts tab) |
| Likely exam points | `six` + the "Exam focus" step |

## To do

1. **Lectures 9–12 had not been held yet** when the slides were extracted (25 Nov 2026). Re-download from Moodle near the exam; if a lecturer changed slides, update the notes and re-import.
2. No `facts` (Mastery fill-the-gap sentences) yet; Mastery uses the questions and vocabulary.
3. Optional: lecture slide images in the app (they are in `extracted/slides/`, 103 MB; not added because they belong to the lecturers and the repo may be public).
4. Optional: Firebase project for Google sign-in.
5. GitHub repo and Pages, if wanted.

## How to run and check

```bash
python3 -m http.server 8000      # then open http://localhost:8000
node tools/validate.js courses/bio
```

Commit with the GitHub noreply identity, like the other hubs:

```bash
git -c user.name=mrsimonm -c user.email=322631765+mrsimonm@users.noreply.github.com commit
```
