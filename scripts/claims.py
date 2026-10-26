#!/usr/bin/env python3
"""The claims list: one entry per claim about what a source says, checked once.

  python scripts/claims.py check            # every entry well formed, every quotation really in its held text
  python scripts/claims.py find TEXT        # look for an entry before checking a claim again
  python scripts/claims.py stats            # how many entries have each result
  python scripts/claims.py next             # the next free claim ID

The entries live in claims/*.md (see claims/README.md for the format). `check`
is what makes the list trustworthy: each line under **Text says:** must be
found word for word in the file named on **Held text:**, so a quotation can't
drift from its source without the check failing.
"""
from __future__ import annotations
import argparse, re, sys, unicodedata
from collections import Counter
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CLAIMS = REPO / "claims"

RESULTS = [
    "Matches",
    "Matches, other translation",
    "Matches, other section number",
    "Reads differently",
    "Can't check",
    "Not held",
]
NEEDS_TEXT = {r for r in RESULTS if r not in ("Can't check", "Not held")}
REQUIRED = ["Claim", "Result", "Raised by", "Checked"]

HEAD = re.compile(r"^### (C\d+) · (.+?)\s*$", re.M)
FIELD = re.compile(r"^\*\*(.+?):\*\*\s*(.*?)\s*$")
PATH = re.compile(r"`([^`]+)`")
FOOTNOTE = re.compile(r"\[\d+\]")
ELLIPSIS = re.compile(r"\s*(?:…|\.\.\.)\s*")


def norm(s: str) -> str:
    """Compare text the way a reader would: same letters, ignoring curly vs straight
    quotes, dash style, footnote markers, emphasis marks and spacing."""
    s = unicodedata.normalize("NFKC", s)
    s = FOOTNOTE.sub(" ", s)
    for a, b in (("‘", "'"), ("’", "'"), ("“", '"'), ("”", '"'), ("—", "-"), ("–", "-"), ("--", "-")):
        s = s.replace(a, b)
    s = s.replace("**", "").replace("*", "")
    return re.sub(r"\s+", " ", s).strip().lower()


def parse() -> list[dict]:
    entries = []
    for f in sorted(CLAIMS.glob("*.md")):
        if f.name.lower() == "readme.md":
            continue
        text = f.read_text(encoding="utf-8")
        heads = list(HEAD.finditer(text))
        for i, h in enumerate(heads):
            body = text[h.end(): heads[i + 1].start() if i + 1 < len(heads) else len(text)]
            body = re.split(r"^#{1,3} ", body, flags=re.M)[0]
            e = {"id": h.group(1), "locus": h.group(2), "file": f, "line": text[:h.start()].count("\n") + 1,
                 "fields": {}, "quotes": []}
            current = None
            for line in body.splitlines():
                m = FIELD.match(line)
                if m:
                    current = m.group(1)
                    e["fields"][current] = m.group(2)
                elif line.startswith(">") and current == "Text says":
                    e["quotes"].append(line[1:].strip())
                elif line.strip() and current and current != "Text says":
                    e["fields"][current] += " " + line.strip()
            entries.append(e)
    return entries


def held_path(e: dict) -> Path | None:
    m = PATH.search(e["fields"].get("Held text", ""))
    return REPO / m.group(1) if m else None


def find_quote(quote: str, held: str) -> int | None:
    """Line where the quotation starts in the held text, or None. An ellipsis in the
    quotation stands for words left out: the pieces must appear in order, close together."""
    pieces = [norm(p) for p in ELLIPSIS.split(quote) if norm(p)]
    flat, starts, size = [], [], 0   # normalised held text, and where each source line starts in it
    for n, line in enumerate(held.splitlines(), 1):
        t = norm(line)
        if t:
            starts.append((size, n))
            flat.append(t)
            size += len(t) + 1
    joined = " ".join(flat)
    pos = joined.find(pieces[0]) if pieces else -1
    while pos != -1:
        at, ok = pos + len(pieces[0]), True
        for p in pieces[1:]:
            nxt = joined.find(p, at)
            if nxt == -1 or nxt - at > 4000:
                ok = False
                break
            at = nxt + len(p)
        if ok:
            return max(n for s, n in starts if s <= pos)
        pos = joined.find(pieces[0], pos + 1)
    return None


def check(entries: list[dict]) -> int:
    problems, seen = [], {}
    cache: dict[Path, str] = {}
    for e in entries:
        where = f"{e['file'].relative_to(REPO).as_posix()}:{e['line']} {e['id']}"
        if e["id"] in seen:
            problems.append(f"{where}: ID also used at {seen[e['id']]}")
        seen[e["id"]] = where
        for name in REQUIRED:
            if not e["fields"].get(name):
                problems.append(f"{where}: no **{name}:** line")
        result = e["fields"].get("Result", "")
        if result and result not in RESULTS:
            problems.append(f"{where}: result '{result}' is not one of: {', '.join(RESULTS)}")
        p = held_path(e)
        if result in NEEDS_TEXT:
            if not p:
                problems.append(f"{where}: '{result}' needs a **Held text:** with the file in backticks")
                continue
            if not e["quotes"]:
                problems.append(f"{where}: '{result}' needs the held words under **Text says:** (lines starting >)")
        if p and e["quotes"]:
            if not p.exists():
                problems.append(f"{where}: held text {p.relative_to(REPO).as_posix()} does not exist")
                continue
            held = cache.setdefault(p, p.read_text(encoding="utf-8", errors="replace"))
            for q in e["quotes"]:
                if find_quote(q, held) is None:
                    problems.append(f"{where}: not found in {p.name}: {q[:90]}")
    for p in problems:
        print(p)
    print(f"{len(entries)} claims, {sum(len(e['quotes']) for e in entries)} quotations checked; "
          f"{len(problems)} problem(s).")
    return 1 if problems else 0


def find(entries: list[dict], words: list[str]) -> None:
    terms = [norm(w) for w in words]
    hits = [e for e in entries
            if all(t in norm(e["locus"] + " " + " ".join(e["fields"].values())) for t in terms)]
    for e in hits:
        print(f"{e['id']} · {e['locus']}  [{e['fields'].get('Result', '?')}]  "
              f"{e['file'].relative_to(REPO).as_posix()}:{e['line']}")
        print(f"    {e['fields'].get('Claim', '')[:160]}")
    if not hits:
        print("No entry yet. Check it, then add one (python scripts/claims.py next gives the ID).")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("check")
    f = sub.add_parser("find")
    f.add_argument("words", nargs="+")
    sub.add_parser("stats")
    sub.add_parser("next")
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    entries = parse()
    if a.cmd == "check":
        sys.exit(check(entries))
    if a.cmd == "find":
        find(entries, a.words)
    elif a.cmd == "stats":
        c = Counter(e["fields"].get("Result", "?") for e in entries)
        for r in RESULTS:
            print(f"{c.get(r, 0):5}  {r}")
        people = sum(1 for e in entries if "person check: not yet" not in norm(e["fields"].get("Checked", "")))
        print(f"{len(entries):5}  total ({people} checked by a person)")
    elif a.cmd == "next":
        nums = [int(e["id"][1:]) for e in entries]
        print(f"C{max(nums, default=0) + 1}")


if __name__ == "__main__":
    main()
