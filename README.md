# Study Hub

Unified study app combining **Bio Hub** (`ZEX108E`), **Eco Hub** (*Fundamentals of Ecology*), and **Geology Hub** (`ZOX101E`) in one place, with a **Subjects ▾** dropdown in the top bar to switch subjects anytime without leaving the app.

- Live site: https://mrsimonm.github.io/study-hub/
- Repo: https://github.com/mrsimonm/study-hub
- Standalone hubs (`bio-hub`, `eco-hub`, `geo-hub`) remain separate and untouched.

## Run and check locally

```bash
python3 -m http.server 8000      # open http://localhost:8000
node tools/validate.js           # validate all three subjects
node tools/sync-from-hubs.js     # re-sync bio/, eco/, geo/ from ~/Projects/*-hub
```
