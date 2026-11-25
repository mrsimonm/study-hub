# Adding a lecture (the repeatable way)

A lecture is a **folder with two plain files**. No JavaScript, no HTML needed. Anyone can write them: you by hand, Claude, Claude Code, Antigravity.

```
courses/geology/
  course.json              ← lists the lectures
  lectures/t7/
    lecture.json           ← questions, vocabulary, cards, facts, tables
    steps.md               ← the lesson text (simple Markdown)
```

Lectures 1 to 6 are still the old JS files in `topics/`. They keep working. Everything new goes in the data format.

## 5-step workflow

1. Copy `templates/lecture/` to `courses/geology/lectures/t7/` (use the next free number).
2. Fill in `lecture.json` and `steps.md` (or paste [PROMPT.md](PROMPT.md) plus your slides into any AI and save its two files).
3. Add `"lectures/t7"` to the `lectures` list in `courses/geology/course.json`.
4. Check it: `node tools/validate.js` (plain Node, nothing to install). Fix every `ERROR`.
5. See it: `python3 -m http.server 8000` then open `http://localhost:8000`. (Opening `index.html` straight from disk can't load the data files.)

A broken lecture never breaks the app. It is skipped and a red notice at the top says why.

## lecture.json

| Field | Required | Meaning |
|---|---|---|
| `num` | yes | Lecture number (whole number). Also decides the order and colour. |
| `id` | no | `t` + `num` (e.g. `t7`). Must be unique. |
| `title`, `short`, `blurb` | yes | Full title, short name (tabs, buttons), one-line description for the home tile. |
| `sub`, `h1`, `lede` | recommended | Subtitle in the header, overview heading, intro paragraph. |
| `six` | recommended | 3 to 6 key takeaways ("If you remember only 6 things"). `**bold**` works. |
| `must` | recommended | Name of the key topic; the mock test always includes questions flagged `fol` about it. |
| `questions` | yes | See below. Aim for 15+. |
| `vocab` | yes | `{ "group", "term", "meaning" }`. Powers the dictionary, flashcards, match, type-it and mastery. Aim for 10+. |
| `confusable` | no | Groups of terms that are easily mixed up, so wrong choices in vocab quizzes are tricky: `[["Cleavage","Fracture"]]`. |
| `facts` | no | Fill-the-gap sentences for Mastery: `[step number, "text {right\|wrong1\|wrong2\|wrong3}"]`. |
| `cards` | no | Flip cards with several fields. If left out, cards are made from `vocab`. |
| `names` | no | A "key facts" tab with tables. In cells, `must` / `nice` / `skip` become coloured "Need it?" badges. |
| `sheet` | no | Cheat sheet tables: `[title, [header...], [[row...]]]`. |
| `status`, `next`, `mockNote`, `foot`, `mastery` | no | Extras: a status box, "next test" label, mock-test note, source line, `false` to hide Mastery. |

### A question

```json
{ "id": "t7-hardest", "q": "Which mineral is the hardest on the Mohs scale?", "h": "Number 10.",
  "answer": "Diamond", "wrong": ["Quartz", "Corundum", "Topaz"],
  "e": "Diamond is 10, the top of the Mohs scale.", "fol": true }
```

- Exactly **1 correct + 3 wrong**. (You can also write `"o": [correct, wrong, wrong, wrong]`; the first is correct and the app shuffles.)
- `id` should be **stable and unique across the whole course** (prefix it with the lecture id). Review and progress are saved by id.
- `h` hint, `e` explanation shown after answering, `fol` = key-topic question, `x` = extra/not tested (left out of timed tests).

### Cards (optional)

```json
"cards": { "tab": "Mohs cards", "h1": "The ten Mohs minerals", "who": "Which mineral am I?",
  "labels": { "h": "Hardness", "t": "Handy test" }, "keys": ["h", "t"],
  "items": [ { "n": "Talc", "grp": "Mohs 1", "h": "1", "t": "Scratched by a fingernail" } ] }
```

`n` is the name, `keys` are the fields shown on the back, `labels` name them.

## steps.md

Each step starts with `## Title | 5 min`. Then simple Markdown:

```
:::idea The idea            ← callout boxes: idea, ana (analogy), teach, trap, skip
Text inside the box.
:::

A paragraph with **bold**, *italic*, `code`.      ← bold words become tap-for-definition glossary links
- bullets, or 1. numbered lists
### Small heading
| Table | With | Header |
|---|---|---|
| a | b | c |

{{q:t7-hardest}}            ← an inline check question (use an id from lecture.json)
```

Colour meaning (keep it): accent = idea, amber = teacher said, red = exam trap, green = correct, cyan = analogy, grey = don't memorise. A line that starts with `<` is passed through as raw HTML if you ever need a custom widget. Write a plain `&`, not `&amp;`.

## How each part feeds the activities

| You write | The app builds |
|---|---|
| `questions` | inline checks, mock test, final-exam practice, Review, Quick 5, True/False round, Mastery |
| `vocab` (+ `confusable`) | dictionary, glossary pop-ups, flashcards, flip-all, vocab quiz, Match pairs, Type it, Mastery |
| `facts` | Mastery fill-the-gap (true/false, choose, then type) |
| `cards` | flip cards and "Which one am I?" |
| `names`, `sheet` | key-facts tables and cheat sheet with blur-to-test |
| `steps.md` | the Learn tab, split automatically into small "bites" |

## Other subjects

Make a new folder such as `courses/stats/` with its own `course.json` (`title`, `code`, `subtitle`, `intro`, `footer`, `lectures`), then open `index.html?course=courses/stats/course.json`. Note: the six old geology lectures still load on every page until they are migrated to data files. Set `"testsCard": false` to hide the geology-only grading card.

## Not covered yet

- Custom interactive widgets (the SVG diagrams and sorters in the old topic files) can't be written as data. Use raw HTML in `steps.md`, or keep such a lecture as a JS topic file.
- Progress is saved per browser (localStorage).
