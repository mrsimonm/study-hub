#!/usr/bin/env python3
"""Turn the extracted Biology notes into Bio Hub data lectures.

Input : an `extracted/` folder made from the ZEX108E slides
        (lectures/NN-*.md written in a fixed template + data/quiz.json, data/flashcards.json)
Output: courses/bio/lectures/tN/lecture.json + steps.md for N = 1..12

Usage:  python3 tools/import_extracted.py "/path/to/extracted"
Then:   node tools/validate.js courses/bio

Everything comes from the notes; nothing is added here except layout. Re-run it after editing the notes.
"""
import html
import json
import re
import sys
from pathlib import Path

HUB = Path(__file__).resolve().parent.parent
OUT = HUB / "courses" / "bio" / "lectures"

SHORT = {
    1: "Cell nucleus", 2: "Genetic mechanisms", 3: "Viruses", 4: "Cells I", 5: "Cells II",
    6: "Cell cycle", 7: "Respiration", 8: "Photosynthesis", 9: "Plant physiology",
    10: "Animal physiology", 11: "Taxonomy", 12: "Evolution",
}

SRC = re.compile(r"\s*\[((?:p|s)\.[^\]]+)\]")


def strip_src(s):
    return SRC.sub("", s).strip()


def nice_src(s):
    """'p.23, p.25' -> 'p. 23, p. 25'"""
    return re.sub(r"\b([ps])\.(?=\d)", r"\1. ", s)


def src_to_text(s):
    """'[p.5]' -> ' (p. 5)' in lesson text, so readers can find the slide."""
    return SRC.sub(lambda m: " (" + nice_src(m.group(1)) + ")", s)


def md_html(s):
    """Markdown inline -> safe HTML for table cells (the app inserts them raw)."""
    s = html.escape(strip_src(s), quote=False)
    s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
    s = re.sub(r"(?<![*\w])\*([^*]+?)\*(?!\w)", r"<i>\1</i>", s)
    return s


def plain(s):
    return re.sub(r"\*\*?(.+?)\*\*?", r"\1", strip_src(s)).strip()


def parse_md(text):
    meta = {}
    if text.startswith("---"):
        end = text.index("---", 3)
        for line in text[3:end].strip().splitlines():
            k, _, v = line.partition(":")
            meta[k.strip()] = v.strip()
        text = text[end + 3:]
    secs, cur = {}, None
    for line in text.splitlines():
        if line.startswith("## "):
            cur = line[3:].strip()
            secs[cur] = []
        elif cur:
            secs[cur].append(line)
    return meta, secs


def subsections(lines):
    out, cur = [], None
    for l in lines:
        if l.startswith("### "):
            cur = [l[4:].strip(), []]
            out.append(cur)
        elif cur is not None:
            cur[1].append(l)
        elif l.strip():
            cur = ["", [l]]
            out.append(cur)
    return out


def pages(text):
    """Numbers of all slide pages cited in a block of text."""
    out = set()
    for m in SRC.finditer(text):
        for a, b in re.findall(r"(\d+)(?:[–-](\d+))?", m.group(1)):
            a = int(a)
            out.update(range(a, int(b) + 1) if b else [a])
    return out


def lesson_lines(lines):
    """Notes markdown -> the hub's tiny markdown: flatten nested lists, keep tables, cite slides."""
    out = []
    for l in lines:
        if not l.strip():
            out.append("")
            continue
        m = re.match(r"^(\s+)(?:[-*]|\d+\.)\s+(.*)$", l)
        if m:  # nested list item: flatten with a marker so the structure stays visible
            out.append("- ↳ " + src_to_text(m.group(2)))
            continue
        if l.lstrip().startswith("|"):
            out.append(SRC.sub("", l))
            continue
        if re.match(r"^\[(?:p|s)\.[^\]]+\]$", l.strip()):  # a lone source line under a table
            out.append("*Slides: " + nice_src(l.strip()[1:-1]) + "*")
            continue
        out.append(src_to_text(l))
    return out


def word_count(lines):
    return sum(len(l.split()) for l in lines)


def build_steps(secs):
    """Merge small 'Key concepts' subsections into ~5-minute steps; add processes and comparisons."""
    raw = [[strip_src(t), b] for t, b in subsections(secs.get("Key concepts", []))]
    steps, cur = [], None
    for title, body in raw:
        if cur and word_count(cur[1]) < 170:
            if title:
                cur[0] += " · " + title
                cur[1] += ["", "### " + title] + body
            else:
                cur[1] += body
        else:
            cur = [title or "Overview", list(body)]
            steps.append(cur)
    out = [[t, b] for t, b in steps]
    if any(l.strip() for l in secs.get("Processes", [])):
        out.append(["Processes step by step", secs["Processes"]])
    if any(l.strip() for l in secs.get("Comparisons", [])):
        out.append(["Compare and contrast", secs["Comparisons"]])
    return out


def table_blocks(lines):
    """Markdown tables in a section -> [(head, rows, srcline)]."""
    out, i = [], 0
    while i < len(lines):
        if lines[i].lstrip().startswith("|"):
            rows = []
            while i < len(lines) and lines[i].lstrip().startswith("|"):
                rows.append(lines[i]); i += 1
            cells = [[c.strip() for c in r.strip().strip("|").split("|")] for r in rows]
            cells = [r for r in cells if not all(re.fullmatch(r":?-{2,}:?", c) for c in r)]
            src = ""
            while i < len(lines) and not lines[i].strip():
                i += 1
            if i < len(lines) and re.match(r"^\[(?:p|s)\.", lines[i].strip()):
                src = lines[i].strip()[1:-1]; i += 1
            out.append((cells[0], cells[1:], src))
        else:
            i += 1
    return out


def main(src_dir):
    src = Path(src_dir)
    quiz = json.loads((src / "data" / "quiz.json").read_text(encoding="utf-8"))
    cards = json.loads((src / "data" / "flashcards.json").read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    made = []
    for f in sorted((src / "lectures").glob("[0-9][0-9]-*.md")):
        n = int(f.name[:2]); lid = f"L{n:02d}"; tid = f"t{n}"
        meta, secs = parse_md(f.read_text(encoding="utf-8"))
        summary = " ".join(l.strip() for l in secs.get("Summary", []) if l.strip())
        steps = build_steps(secs)

        # questions: the notes' quiz (stored with the right answer at a shuffled index)
        qs, by_page = [], []
        for k, q in enumerate([q for q in quiz if q["lecture"] == lid]):
            right = q["options"][q["answer"]]
            wrong = [o for i, o in enumerate(q["options"]) if i != q["answer"]]
            src_txt = nice_src(q["src"]) if q["src"] else ""
            qid = f"{tid}-q{k + 1:02d}"
            item = {"id": qid, "q": q["q"], "answer": right, "wrong": wrong,
                    "e": q["explanation"] + (f" (Slides: {src_txt})" if src_txt else "")}
            if k < 4:
                item["fol"] = True
            qs.append(item)
            pg = pages("[" + q["src"] + "]") if q["src"] else set()
            by_page.append((qid, min(pg) if pg else 0))

        # place up to 2 check questions at the end of the step whose slides they come from
        used = set()
        step_pages = [pages("\n".join(b)) for _, b in steps]
        md = []
        for si, (title, body) in enumerate(steps):
            mins = max(2, min(12, round(word_count(body) / 90)))  # dense science text reads slowly
            md.append(f"## {title} | {mins} min")
            md += lesson_lines(body)
            picks = [qid for qid, p in by_page if qid not in used and p in step_pages[si]][:2]
            if picks:
                md.append("")
                for qid in picks:
                    md.append("{{q:" + qid + "}}"); used.add(qid)
            md.append("")
        exam_pts = [l[2:] for l in secs.get("Likely exam points", []) if l.startswith("- ")]
        if exam_pts:
            md.append("## Exam focus | 2 min")
            md.append(":::teach What to be ready for")
            md += ["- " + p for p in exam_pts]
            md.append(":::")
            md.append("")
            md.append("The final exam is a written test of 24 questions based only on the lectures (lecture 1, slide 3). These are the points from this lecture most likely to come up.")
            md.append("")

        # vocabulary: the notes' key terms
        vocab, seen = [], set()
        for l in secs.get("Key terms", []):
            m = re.match(r"- \*\*(.+?)\*\*:\s*(.+)$", l)
            if m and plain(m.group(1)).lower() not in seen:
                seen.add(plain(m.group(1)).lower())
                vocab.append({"group": SHORT[n], "term": plain(m.group(1)), "meaning": plain(m.group(2))})

        # flashcards as flip cards (front = question, back = answer)
        items, names = [], set()
        for c in [c for c in cards if c["lecture"] == lid]:
            q = c["q"].strip()
            if q in names:
                continue
            names.add(q)
            items.append({"n": html.escape(q, quote=False), "grp": SHORT[n], "a": md_html(c["a"])})
        card_block = {"tab": "Flashcards", "h1": f"{SHORT[n]}: flashcards", "who": "Which question does this answer?",
                      "lede": "Read the question, answer it out loud, then flip the card.",
                      "labels": {"a": "Answer"}, "keys": ["a"], "items": items, "sheet": False}

        # cheat sheet: the comparison tables
        sheet = []
        for head, rows, srcline in table_blocks(secs.get("Comparisons", [])):
            width = len(head)
            rows = [r + [""] * (width - len(r)) if len(r) < width else r[:width] for r in rows]
            title = " vs ".join(plain(h) for h in head[1:] if plain(h)) or plain(head[0])
            sheet.append([html.escape(title, quote=False) + (f" <small>({nice_src(srcline)})</small>" if srcline else ""),
                          [md_html(h) for h in head], [[md_html(c) for c in r] for r in rows]])

        # key facts tab: facts & numbers
        fact_rows = []
        for fl in [l[2:] for l in secs.get("Facts & numbers", []) if l.startswith("- ")]:
            m = SRC.search(fl)
            fact_rows.append([md_html(fl), (nice_src(m.group(1)) if m else "")])

        lecturer = meta.get("lecturer", "").split(" (")[0]
        date = meta.get("date", "").split(" (")[0]
        lec = {
            "num": n, "id": tid,
            "title": meta.get("title", SHORT[n]),
            "short": SHORT[n],
            "sub": f"Lecture {n} · {lecturer}" + (f" · {date}" if date else ""),
            "blurb": plain(summary.split(". ")[0]).rstrip(".") + ".",
            "h1": meta.get("title", SHORT[n]),
            "lede": plain(summary),
            "six": [plain(p) for p in exam_pts[:6]],
            "must": SHORT[n],
            "questions": qs,
            "vocab": vocab,
            "cards": card_block,
            "sheet": sheet,
            "foot": f"From {meta.get('source', 'the lecture slides')}. Slide numbers are shown as (p. N) for PDF pages and (s. N) for PowerPoint slides. If anything here disagrees with the slides, the slides win.",
        }
        if fact_rows:
            lec["names"] = {"tab": "Key facts", "h1": f"{SHORT[n]}: facts and numbers",
                            "tables": [{"title": "Facts and numbers worth memorising", "head": ["Fact", "Slide"], "rows": fact_rows}]}
        d = OUT / tid
        d.mkdir(parents=True, exist_ok=True)
        (d / "lecture.json").write_text(json.dumps(lec, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        (d / "steps.md").write_text("\n".join(md).rstrip() + "\n", encoding="utf-8")
        made.append((tid, len(steps) + (1 if exam_pts else 0), len(qs), len(used), len(vocab), len(items), len(sheet), len(fact_rows)))
    print("lecture steps questions(inline) vocab cards sheets facts")
    for r in made:
        print(f"  {r[0]:>4}  {r[1]:>3}  {r[2]:>3} ({r[3]})  {r[4]:>3}  {r[5]:>3}  {r[6]:>2}  {r[7]:>3}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
