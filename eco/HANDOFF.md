# Eco Hub: handoff for Claude, Claude Code or Antigravity

Read this first, then `AGENTS.md` (the hard rules), then `AUTHORING.md` (lecture data format) and `PROMPT.md`.

## What this is

A study web app for **ČZU Fundamentals of Ecology** (winter 2026/27, Martin Bulla and Peter Mikula). Fourth hub next to Geology Hub, Statistics Hub and Micro Hub, same engine (copied from Micro Hub on 24 Nov 2026), same Study Cat.

- Project folder on this Mac: `/Users/simonmusel/Projects/eco-hub`
- GitHub: `mrsimonm/eco-hub`, Pages from `main` root → https://mrsimonm.github.io/eco-hub/
- Progress is saved in the browser (`localStorage` keys `ecoHub.*`). Google sign-in sync is ready in code but **off** until a Firebase project is created and its config pasted into `lib/firebase-config.js`.
- Offline PWA: `sw.js`, cache `eco-hub-v1`. Bump it when you change the shell files.

## Course facts (Moodle + GitHub repo github.com/MartinBulla/Ecology_Fund_Gen)

- **Exam**: Moodle quiz "Exam TEST (2026/27)", on campus only, password given on site. **19 questions, 10 minutes, max 20 points.** 3 attempts, highest counts. Date not published as of 24 Nov 2026.
- Single-answer questions = 1 point. Multiple-answer questions = up to 2 points: 6 options, 1 to 6 correct, full points only if every correct option is ticked; **any wrong tick = 0**.
- Grades: Excellent 18–20 (90 %), Very good 16–17.9 (80 %), Good 14–15.9 (70 %), Failed ≤ 13.9. Final course grade = presentation score + exam score.
- Admission: full attendance at the zoo excursion, the hands-on seminar and both symposium days, presentation score > 50 %.
- Exam material (teacher's last slide): **lectures, the glossary (`_Lectures/2026_glossary.pdf`) and all symposium materials**.

## What is built (24 Nov 2026)

| Lesson | Source | Topic |
|---|---|---|
| `t1` | Lecture 2 + glossary 1 | ecology, evolution, Darwin vs Wallace, niche vs habitat |
| `t2` | Lectures 2–3 + glossary 6 i–l | Bergmann, Allen, Gloger, island rule, meta-analysis, reading a paper |
| `t3`–`t12` | Symposium groups 1–10 + glossary 2–10 | life histories, Allee effects, top-down vs bottom-up, food webs, latitudinal gradient (the student's own group 5), counting species, sixth mass extinction, biodiversity drivers, value of nature, citizen science |

Plus:
- `courses/eco/tickall.json`: 24 "tick all that apply" questions (6 options each), run by `lib/tickall.js` (new in this hub; scores exactly like the exam).
- `courses/eco/path/exam.json`: the "Start studying" walk-through (generated from each lesson's takeaways and key questions).
- Exam practice runs the real format (19 questions, 10 minutes) with the ecology grade scale (`grades` and `exam` in `course.json`, read by `app.js`).

Removed from the Micro Hub copy: formula panel, graphs and seminar exercises (`lib/formulas.js`, `lib/graphs.js`, `lib/apply.js`). Ecology has no maths.

## To do

1. When the exam date is published, put it in `course.json` → `tests[0].badge`.
2. More tick-all questions (aim for 4 per lesson).
3. Firebase project for Google sign-in (optional).
4. Group 8's driver percentages are only in infographic images; they were left out rather than guessed.

## How to run and check

```bash
python3 -m http.server 8000      # then open http://localhost:8000
node tools/validate.js courses/eco
```

Commit with the GitHub noreply identity, like the other hubs:

```bash
git -c user.name=mrsimonm -c user.email=322631765+mrsimonm@users.noreply.github.com commit
```
