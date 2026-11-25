# Bio Hub (ZEX108E)

A static, no-build study web app for **CZU Prague ZEX108E, Fundamentals of Biology** (WS 2026/27): step-by-step lessons, flashcards, games, mock tests, four-star Mastery, a dictionary and 24-question exam practice. Same engine as Geology Hub, Statistics Hub and Micro Hub. Installs on a phone and works offline. Progress is saved in your browser.

- Run locally: `python3 -m http.server 8000`, then open http://localhost:8000 (opening `index.html` from disk can't load the data files)
- Validate data: `node tools/validate.js courses/bio`
- Rebuild the lectures from the extracted notes: `python3 tools/import_extracted.py "<path to extracted>"`

For anyone (or any AI) continuing the work, start with [HANDOFF.md](HANDOFF.md).
