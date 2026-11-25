# Geology Hub

A study app for geology (CZU ZOX101E): step-by-step lessons, flashcards, games, mock tests, mastery stars and a dictionary. It installs on your phone like an app and works offline.

Open it at https://mrsimonm.github.io/geo-hub/

Progress is saved in your own browser.

## Adding lectures

New lectures are plain data files, not code. See [AUTHORING.md](AUTHORING.md), and use [PROMPT.md](PROMPT.md) to have any AI turn slides into a lecture. Check your work with:

```bash
node tools/validate.js
```

To try it locally (opening `index.html` straight from disk can't load the data files):

```bash
python3 -m http.server 8000
```

For anyone (or any AI) continuing the work, start with [HANDOFF.md](HANDOFF.md).
