# Prompt: turn lecture material into a Hub lecture

Copy everything below the line into Claude, Claude Code, Antigravity or any other AI, then attach or paste your slides, notes or transcript. Save the two files it returns, and run `node tools/validate.js`.

---

You are building one lecture for a study hub. Read `AUTHORING.md` and look at `templates/lecture/` and `courses/demo/lectures/t7/` for the exact format. Produce exactly two files for lecture number **{N}**, saved in `courses/{course}/lectures/t{N}/`:

1. `lecture.json`
2. `steps.md`

Rules:
- Use **only** what is in the material I give you. Do not add facts from memory. If something is unclear, leave it out and mention it in your reply (never in the files).
- `steps.md`: 3 to 6 steps, each starting `## Title | N min`, each about 5 minutes of reading. Short paragraphs, bullets and tables. Use the callout boxes `:::idea`, `:::ana`, `:::teach`, `:::trap`, `:::skip` sparingly. Put 1 to 3 `{{q:id}}` check questions at the end of each step, using ids from `lecture.json`.
- `questions`: at least 15, each with exactly 1 correct and 3 plausible wrong answers, a one-line hint (`h`), and a short explanation (`e`). Stable ids prefixed `t{N}-`. Mark the 3 to 5 most important ones with `"fol": true`. Wrong answers must be believable but clearly wrong.
- `vocab`: every important term with a plain-language meaning (one sentence), grouped sensibly. Add `confusable` groups for terms students mix up.
- `facts`: 8 to 15 fill-the-gap sentences `[step number, "... {right|wrong1|wrong2|wrong3} ..."]`.
- `six`: 3 to 6 takeaways. `must`: the key topic name.
- Add `cards`, `names` and `sheet` only if the material has a natural list or table (e.g. a set of rock types); otherwise leave them out.
- Plain `&`, no HTML. JSON must be valid (double quotes, no trailing commas).
- Finish by listing anything you were unsure about.

Then add `"lectures/t{N}"` to the course's `course.json` and run `node tools/validate.js`. Fix every ERROR it reports.
