# Study Hub: notes for the coding agent

Unified static study site combining **Bio Hub**, **Eco Hub** and **Geology Hub** into a single PWA with a top-bar subject switcher dropdown (`switcher.js`).

## Structure
- `index.html`: reopens the last subject studied (`localStorage` key `studyHub.last`), or shows the subject picker screen on first visit / `?pick=1`.
- `switcher.js`: adds the `Subjects ▾` button and dropdown menu to `.top .brand` inside every sub-hub without altering hub logic or layout.
- `bio/`, `eco/`, `geo/`: exact copies of `~/Projects/bio-hub`, `~/Projects/eco-hub`, and `~/Projects/geo-hub`, wired to `../manifest.webmanifest`, `../sw.js`, and `../switcher.js`.
- `sw.js`, `manifest.webmanifest`, `icon-*.png`: unified offline PWA shell covering all three subjects.
- `tools/sync-from-hubs.js`: re-syncs `bio/`, `eco/`, and `geo/` cleanly from the standalone project folders.
- `tools/validate.js`: runs lecture validation across all three subjects.

## Rules
- Plain HTML, CSS and JS only. No npm, no frameworks, no build step.
- Mobile-first (16px side gutters, no horizontal page scroll) and light/dark mode using existing CSS variables only.
- Keep standalone `~/Projects/bio-hub`, `~/Projects/eco-hub`, and `~/Projects/geo-hub` untouched unless explicitly asked.
- After any change run `node tools/validate.js` and bump `V` in `sw.js` if shell files changed.
- Commit with the GitHub noreply identity (`mrsimonm` / `322631765+mrsimonm@users.noreply.github.com`).
