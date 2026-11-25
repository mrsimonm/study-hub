# Study Hub: handoff for Claude, Claude Code or Antigravity

Read this first, then `AGENTS.md`.

## What this is

A single unified study app and PWA for Simon's three ČZU Prague hubs:
1. **Bio Hub** (`./bio/`): ZEX108E Fundamentals of Biology
2. **Eco Hub** (`./eco/`): Fundamentals of Ecology
3. **Geology Hub** (`./geo/`): ZOX101E Geology

- Project folder on this Mac: `/Users/simonmusel/Projects/study-hub`
- Live site: https://mrsimonm.github.io/study-hub/
- Repo: `mrsimonm/study-hub` (GitHub Pages from `main` root)
- Standalone hubs (`bio-hub`, `eco-hub`, `geo-hub`) remain intact in `/Users/simonmusel/Projects/` and on GitHub Pages. Because all GitHub Pages sites share the `https://mrsimonm.github.io` origin, `localStorage` keys (`bioHub.v1`, `ecoHub.v1`, `geoHub.v1`, Study Cats, etc.) are preserved automatically on the same device.

## How subject switching works

- Every sub-hub loads `../switcher.js`, which prepends a **Subjects ▾** button and dropdown menu into `.top .brand`.
- Selecting a subject stores `studyHub.last` (`bio`, `eco`, or `geo`) in `localStorage` and switches directly inside the same tab / installed PWA window.
- Opening the root URL (`./`) automatically redirects to `./<last>/` once a subject has been chosen; `./?pick=1` (linked as "🏠 All subjects screen" at the bottom of the dropdown) always shows the overview picker.

## Updating after editing a standalone hub

If you update lectures or code in `~/Projects/bio-hub`, `~/Projects/eco-hub`, or `~/Projects/geo-hub`, sync them into Study Hub with:

```bash
cd ~/Projects/study-hub
node tools/sync-from-hubs.js
node tools/validate.js
```

Commit with the GitHub noreply identity:

```bash
git -c user.name=mrsimonm -c user.email=322631765+mrsimonm@users.noreply.github.com commit
```
