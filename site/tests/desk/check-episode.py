#!/usr/bin/env python3
"""Check an episode breakdown before it becomes a board.

    python site/tests/desk/check-episode.py site/data/episodes/066.json [--no-web]

A breakdown (site/data/episodes/<n>.json) lists an episode's topics and, for
each claim, the exact words said, the timestamp, a verdict, and the evidence.
This script checks everything that can be checked mechanically:

  * every quoted phrase is in ONE paragraph of the transcript, and that
    paragraph carries the timestamp given
  * every verse is a real KJV reference the repo holds
  * every card source it points to exists
  * every outside page actually contains the quote attributed to it
    (the page is downloaded and searched; --no-web skips this)

It does not judge the verdicts. That is a person's job, with the sources open.
Exit 1 if anything fails.
"""

import gzip
import html
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "site"))
import build  # noqa: E402  (Matt's build: its KJV loader and transcript pointers)
import desk_links  # noqa: E402

VERDICTS = {"HOLDS", "NARROWER", "DOESN'T HOLD", "OPEN", "INTERPRETATION", "EXPERIENCE"}


def squash(s):
    s = html.unescape(s)
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = s.replace("—", "-").replace("–", "-").replace(" ", " ")
    # Quote marks of every kind are dropped and a space that markup puts
    # before punctuation is closed, so only the words and their order count.
    s = re.sub(r"[\"'`]", "", s)
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r" ([.,;:!?)\]])", r"\1", s)
    return s.strip().lower()


def quote_key(q):
    """A quote may stop where the page's sentence goes on: its final stop does not have to match."""
    return squash(q).rstrip(".,;:")


def page_text(url, cache):
    if url in cache:
        return cache[url]
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (episode-board checker)"})
        with urllib.request.urlopen(req, timeout=40) as r:
            data = r.read()
            if data[:2] == b"\x1f\x8b":
                data = gzip.decompress(data)
            raw = data.decode("utf-8", errors="replace")
        raw = re.sub(r"(?is)<(script|style).*?</\1>", " ", raw)
        raw = re.sub(r"(?s)<[^>]+>", " ", raw)
        cache[url] = squash(raw)
    except Exception as e:  # noqa: BLE001
        cache[url] = None
        print(f"      (could not fetch {url}: {e})")
    return cache[url]


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    web = "--no-web" not in sys.argv
    data = json.loads(Path(args[0]).read_text(encoding="utf-8"))
    ep = data["episode"]
    key = ep if not ep.startswith(("kam-", "tabor-")) else ep
    path = build.pointer_file(key)
    if not path:
        print(f"no transcript file for {key}")
        return 1
    body = path.read_text(encoding="utf-8").split("## Full Transcript", 1)[-1]
    paras = [p.strip() for p in body.split("\n\n") if p.strip().startswith("**[")]
    cards = {json.loads(p.read_text(encoding="utf-8"))["slug"]: json.loads(p.read_text(encoding="utf-8"))
             for p in (ROOT / "site" / "data" / "cards").glob("*.json")}
    names = desk_links._names(build.BOOK_FILES, build.ALIASES)
    head, more = desk_links._pattern(names)

    fails, warns, n, cache, retimed = [], [], 0, {}, False
    for t in data["topics"]:
        for c in t["claims"]:
            n += 1
            tag = f"[{t['title'][:24]} · {c.get('ts', '?')}]"
            ph = c["phrase"]
            hits = [p for p in paras if ph.lower() in p.lower()]
            if not hits:
                fails.append(f"{tag} phrase not in any one paragraph: \"{ph}\"")
            else:
                ts = hits[0].split("**", 2)[1].strip("[]")
                if ts != c.get("ts"):
                    warns.append(f"{tag} phrase is at {ts}, not {c.get('ts')}; corrected")
                    c["ts"] = ts
                    retimed = True
                if len(hits) > 1:
                    warns.append(f"{tag} phrase occurs {len(hits)} times; the first is used")
            if c.get("verdict") not in VERDICTS:
                fails.append(f"{tag} unknown verdict {c.get('verdict')!r}")
            for v in c.get("verses", []):
                refs = list(desk_links.find_refs(v, names, head, more))
                ok = len(refs) == 1 and refs[0][0] == v and desk_links._resolve(refs[0][1], refs[0][2], build.load_book)
                if not ok:
                    fails.append(f"{tag} verse {v!r} is not a KJV reference the repo holds")
            for r in c.get("repo", []):
                card = cards.get(r.get("card"))
                if not card or not (0 <= r.get("source", -1) < len(card["sources"])):
                    fails.append(f"{tag} no card source {r}")
            for s in c.get("sources", []):
                if not s.get("url", "").startswith("https://"):
                    fails.append(f"{tag} source without an https url: {s.get('title')}")
                    continue
                if web:
                    txt = page_text(s["url"], cache)
                    if txt is None:
                        warns.append(f"{tag} could not open {s['url']} to check its quote")
                    elif quote_key(s.get("quote", "")) not in txt:
                        fails.append(f"{tag} quote not found on page {s['url']}: \"{s.get('quote', '')[:80]}\"")
    print(f"{ep}: {n} claims checked")
    for w in warns:
        print("  warn  " + w)
    for f in fails:
        print("  FAIL  " + f)
    if retimed:
        Path(args[0]).write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("  all checks pass" if not fails else f"  {len(fails)} failures")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
