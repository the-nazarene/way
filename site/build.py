#!/usr/bin/env python3
"""Build the Reading Room: the public front door to this repo.

Reads site/data/cards/*.json, checks every source against the repo, and
writes a static site to site/dist/ (index.html, app.js, styles.css,
data.json). No server, no AI, no secrets.

What "checks every source against the repo" means, concretely:

  * A scripture reference ("Matthew 9:13; 12:7", "Luke 18:13-14") is
    resolved against christianity/Incoming/kjv/. If the verses are there the
    source is stamped HELD and the verse text is embedded so the reader pane
    can show the passage itself, with the cited phrase highlighted. If the
    phrase is NOT in the verse, the build fails loudly: a card may not claim
    wording the text doesn't contain.
  * A repo file + phrase ("christianity/Incoming/didache-full-text.md",
    "holy vine of David") is grepped. Found: HELD, with the matching line as
    the snippet. Not found: the build fails.
  * A link with no repo path is NOT YET HELD: public domain but not in the
    collection. The reader pane links out and says so.

So the stamps on the site are never hand-written. They are a build result,
and the build refuses to publish a citation it can't find.

Usage:
    python site/build.py            # writes site/dist/
    python site/build.py --check    # verify only, write nothing
"""

import json
import re
import shutil
import sys
from pathlib import Path

import desk_links  # The Desk's verse and go-deeper index; see site/DESK.md

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
CARDS = SITE / "data" / "cards"
KJV = ROOT / "christianity" / "Incoming" / "kjv"
DIST = SITE / "dist"
REPO_URL = "https://github.com/the-nazarene/way/blob/main/"

BOOK_FILES = {}
for p in sorted(KJV.glob("[0-9][0-9]-*.md")) if KJV.exists() else []:
    first = p.read_text(encoding="utf-8").splitlines()[0]
    m = re.match(r"# (.+?) \(King James Version\)", first)
    if m:
        BOOK_FILES[m.group(1).lower()] = p

ALIASES = {
    "mt": "matthew", "mk": "mark", "lk": "luke", "jn": "john", "rom": "romans",
    "1 cor": "1 corinthians", "2 cor": "2 corinthians", "gal": "galatians",
    "heb": "hebrews", "jas": "james", "1 pet": "1 peter", "2 pet": "2 peter",
    "hos": "hosea", "jer": "jeremiah", "isa": "isaiah", "ps": "psalms", "psalm": "psalms",
}

REF_RE = re.compile(r"^\s*([1-3]?\s?[A-Za-z ]+?)\s+(\d+):(\d+)(?:-(\d+))?\s*$")


def norm(s):
    return re.sub(r"[^a-z0-9 ]", "", s.lower().replace("’", "'"))


def load_book(name):
    key = ALIASES.get(name.lower(), name.lower())
    path = BOOK_FILES.get(key)
    if not path:
        return None, None
    verses = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        m = re.match(r"\*\*(\d+):(\d+)\*\* (.*)", line)
        if m:
            verses[(int(m.group(1)), int(m.group(2)))] = m.group(3)
    return path, verses


def parse_refs(ref):
    """'Matthew 9:13; 12:7' -> [('Matthew', 9, 13, 13), ('Matthew', 12, 7, 7)]"""
    out = []
    book = None
    for part in ref.split(";"):
        part = part.strip()
        m = REF_RE.match(part)
        if m:
            book = m.group(1).strip()
            ch, v1 = int(m.group(2)), int(m.group(3))
            v2 = int(m.group(4)) if m.group(4) else v1
        else:
            m2 = re.match(r"^\s*(\d+):(\d+)(?:-(\d+))?\s*$", part)
            if not (m2 and book):
                raise SystemExit(f"Cannot parse reference: {ref!r}")
            ch, v1 = int(m2.group(1)), int(m2.group(2))
            v2 = int(m2.group(3)) if m2.group(3) else v1
        out.append((book, ch, v1, v2))
    return out


def resolve_scripture(src, problems):
    passages = []
    phrase_hit = False
    for book, ch, v1, v2 in parse_refs(src["ref"]):
        path, verses = load_book(book)
        if not verses:
            problems.append(f"{src['ref']}: no KJV file for {book}")
            return {"status": "not-held", "statusText": "NOT YET HELD", "passages": []}
        lines = []
        for v in range(v1, v2 + 1):
            txt = verses.get((ch, v))
            if txt is None:
                problems.append(f"{src['ref']}: {book} {ch}:{v} not in file")
                continue
            if "phrase" in src and norm(src["phrase"]) in norm(txt):
                phrase_hit = True
            lines.append({"n": f"{ch}:{v}", "text": txt})
        # Three verses either side, so the reader pane shows the line in its paragraph.
        before = [{"n": f"{ch}:{v}", "text": verses[(ch, v)]} for v in range(max(1, v1 - 3), v1) if (ch, v) in verses]
        after = [{"n": f"{ch}:{v}", "text": verses[(ch, v)]} for v in range(v2 + 1, v2 + 4) if (ch, v) in verses]
        passages.append({"book": book, "label": f"{book} {ch}:{v1}" + (f"-{v2}" if v2 != v1 else ""),
                         "file": str(path.relative_to(ROOT)), "verses": lines, "before": before, "after": after})
    if "phrase" in src and not phrase_hit:
        problems.append(f"{src['ref']}: phrase {src['phrase']!r} not found in the cited verses")
    return {"status": "held", "statusText": "HELD · KJV", "passages": passages,
            "open": REPO_URL + passages[0]["file"] if passages else None}


def resolve_repo(src, problems):
    path = ROOT / src["path"]
    if not path.exists():
        problems.append(f"{src.get('title')}: missing file {src['path']}")
        return {"status": "not-held", "statusText": "FILE MISSING", "passages": []}
    text = path.read_text(encoding="utf-8")
    snippet = None
    if "phrase" in src:
        flat = re.sub(r"\s+", " ", text)
        i = norm(flat).find(norm(src["phrase"]))
        if i < 0:
            problems.append(f"{src.get('title')}: phrase {src['phrase']!r} not found in {src['path']}")
        else:
            # map back approximately: take a window around the phrase in the flattened text
            lo = max(0, i - 600)
            hi = min(len(flat), i + len(src["phrase"]) + 600)
            snippet = ("…" if lo > 0 else "") + flat[lo:hi].strip() + ("…" if hi < len(flat) else "")
    return {"status": "held", "statusText": "HELD", "snippet": snippet,
            "open": REPO_URL + src["path"]}


def build_card(card, problems):
    out = dict(card)
    out["sources"] = []
    for src in card["sources"]:
        s = dict(src)
        if "ref" in src:
            s.update(resolve_scripture(src, problems))
            s["title"] = s.get("title") or src["ref"]
        elif "path" in src:
            s.update(resolve_repo(src, problems))
        else:
            s.update({"status": "not-held", "statusText": "NOT YET HELD · public domain", "passages": []})
        out["sources"].append(s)
    out["cardUrl"] = REPO_URL + card["card"]
    for g in out.get("goDeeper", []):
        if not (ROOT / g["path"]).exists():
            problems.append(f"{card['slug']}: go-deeper path missing {g['path']}")
        g["url"] = REPO_URL + g["path"]
    return out


ARCHIVE = ROOT / "podcast-archive"
TS_RE = re.compile(r"\*\*\[(\d{1,2}:)?(\d{1,2}):(\d{2})\]\*\*")
YT_RE = re.compile(r"https://www\.youtube\.com/watch\?v=[A-Za-z0-9_-]+")


def pointer_file(key):
    if key.startswith("kam-"):
        pat = ARCHIVE / "kameron-waters"; n = key[4:]
    elif key.startswith("tabor-"):
        pat = ARCHIVE / "dr-tabor"; n = key[6:]
    else:
        pat = ARCHIVE / "the-jesus-way"; n = key
    hits = sorted(pat.glob(f"{n}-*.md"))
    return hits[0] if hits else None


def resolve_pointer(ptr, problems):
    path = pointer_file(ptr["file"])
    out = {"key": ptr["file"], "phrase": ptr["phrase"]}
    if not path:
        problems.append(f"objection pointer {ptr['file']}: no transcript file")
        return out
    text = path.read_text(encoding="utf-8")
    out["path"] = str(path.relative_to(ROOT))
    out["open"] = REPO_URL + out["path"]
    yt = YT_RE.search(text)
    i = norm(text).find(norm(ptr["phrase"]))
    if i < 0:
        problems.append(f"objection pointer {ptr['file']}: phrase {ptr['phrase']!r} not found")
        return out
    # norm() keeps length only roughly; locate via a case-insensitive raw search instead
    j = text.lower().find(ptr["phrase"].lower().replace("\u2019", "'"))
    if j < 0:
        j = i
    last = None
    for m in TS_RE.finditer(text[:j]):
        last = m
    if last:
        h = int(last.group(1)[:-1]) if last.group(1) else 0
        mm, ss = int(last.group(2)), int(last.group(3))
        secs = h * 3600 + mm * 60 + ss
        out["timestamp"] = (f"{h}:{mm:02d}:{ss:02d}" if h else f"{mm}:{ss:02d}")
        out["label"] = f"{ptr['file']} @ {out['timestamp']}"
        if yt:
            out["video"] = yt.group(0) + f"&t={secs}s"
    return out


def build_objections(cards, problems):
    data = json.loads((SITE / "data" / "objections.json").read_text(encoding="utf-8"))
    rows = []
    for o in data["objections"]:
        r = dict(o)
        r["id"] = f"b{o['id']}"
        r["kind"] = "raised"
        r["pointers"] = [resolve_pointer(pt, problems) for pt in o.get("pointers", [])]
        if o.get("brief"):
            r["briefText"] = data["briefs"][o["brief"]]
        rows.append(r)
    # The prepared objections: every AGAINST pin on every card, in the words the card uses.
    for c in cards:
        for i, src in enumerate(c["sources"]):
            if src.get("side") != "against":
                continue
            note = src.get("note", "")
            m = re.match(r"\s*[\u201c\"](.+?)[\u201d\"]", note)
            if m:
                text = m.group(1)
            else:
                first = re.split(r"(?<=[.!?])\s", note.strip(), maxsplit=1)[0] if note.strip() else ""
                text = f"{src.get('title') or src.get('ref')}: {first}" if first else (src.get("title") or src.get("ref"))
            rows.append({"id": f"p-{c['slug']}-{i}", "kind": "prepared", "cluster": c["drawer"],
                         "objection": text, "who": "prepared on the card", "card": c["slug"], "sourceIndex": i,
                         "answer": note[m.end():].strip() if m else note, "status": "PREPARED",
                         "source": src.get("title") or src.get("ref")})
    return {"objections": rows, "briefs": data["briefs"]}


def main():
    check_only = "--check" in sys.argv
    problems = []
    cards = []
    for p in sorted(CARDS.glob("*.json")):
        card = json.loads(p.read_text(encoding="utf-8"))
        cards.append(build_card(card, problems))
    obj = build_objections(cards, problems)
    raised = sum(1 for o in obj["objections"] if o["kind"] == "raised")
    prepared = len(obj["objections"]) - raised
    print(f"{raised} objections raised by critics, {prepared} prepared on the cards")
    held = sum(1 for c in cards for s in c["sources"] if s["status"] == "held")
    total = sum(len(c["sources"]) for c in cards)
    print(f"{len(cards)} cards, {total} sources, {held} held in repo, {total - held} not yet held")
    if problems:
        print("\nPROBLEMS (the build will not publish a citation it can't find):")
        for pr in problems:
            print("  -", pr)
        sys.exit(1)
    if check_only:
        return
    DIST.mkdir(parents=True, exist_ok=True)
    for name in ("index.html", "app.js", "styles.css", "favicon.svg", "apple-touch-icon.png",
                 "canvas.html", "canvas.css", "canvas.js", "desk-door.js"):
        shutil.copy(SITE / "src" / name, DIST / name)
    (DIST / "data.json").write_text(json.dumps({"cards": cards, "repo": REPO_URL, "kjvHeld": bool(BOOK_FILES),
                                                "objections": obj["objections"], "briefs": obj["briefs"]}, ensure_ascii=False, indent=1),
                                    encoding="utf-8")
    desk, desk_warnings = desk_links.build(cards, BOOK_FILES, load_book, ALIASES, REPO_URL, ROOT)
    (DIST / "desk.json").write_text(json.dumps(desk, ensure_ascii=False), encoding="utf-8")
    print(f"desk: {len(desk['verses'])} verse references held, {len(desk['docs'])} go-deeper files"
          + (f", {len(desk_warnings)} references not in the KJV file (no desk card made):" if desk_warnings else ""))
    for w in desk_warnings:
        print("  -", w)
    (DIST / ".nojekyll").write_text("")
    print(f"wrote {DIST}")


if __name__ == "__main__":
    main()
