"""The Desk's link index: every scripture reference written in the cards'
prose, resolved against the held KJV, plus the go-deeper files they point at.

build.py calls build() and writes the result to dist/desk.json. The Desk
(canvas.js) reads it to turn "Hosea 6:6" in a note into something a reader can
pull onto the desk as its own card. The Reading Room never reads it.

Same rule as every other source on the site: a verse card exists only if the
build found its text in christianity/Incoming/kjv/. A reference the KJV file
does not contain gets no card, and is printed as a warning so the prose can be
checked. Non-canonical references ("Didache 1:3", "1 Enoch 48:3") never match,
because only the 66 KJV book names (and build.py's own abbreviations) do.

The reference grammar here and in canvas.js (refPattern / refKey) must match:
the desk links a reference only when the key it computes is in this index.
"""

import re

MAX_VERSES = 20     # a longer range is shown truncated, and says so
CONTEXT = 3         # verses either side, the same as build.py's reader


def _proper_names(book_files):
    """Lowercase key -> the book's own name, read from the file header."""
    out = {}
    for key, path in book_files.items():
        first = path.read_text(encoding="utf-8").splitlines()[0]
        m = re.match(r"# (.+?) \(King James Version\)", first)
        out[key] = m.group(1) if m else key.title()
    return out


def _names(book_files, aliases):
    """Every spelling a card may use for a book -> its proper name."""
    proper = _proper_names(book_files)
    names = {name: name for name in proper.values()}
    for short, full in aliases.items():
        if full in proper:
            # "1 cor" -> "1 Cor", "psalm" -> "Psalm": as it is written in prose.
            names[" ".join(w[:1].upper() + w[1:] for w in short.split(" "))] = proper[full]
    return names


def _pattern(names):
    alts = "|".join(re.escape(n) for n in sorted(names, key=len, reverse=True))
    span = r"(\d+):(\d+)[a-c]?(?:\s*[-–]\s*(?:(\d+):)?(\d+)[a-c]?)?"
    head = re.compile(r"(?<![A-Za-z0-9])(" + alts + r")\.?\s+" + span)
    more = re.compile(r"\s*;\s*" + span)
    return head, more


def _key(book, c1, v1, c2, v2):
    c2 = c2 or c1
    v2 = v2 or v1
    if c2 == c1 and v2 == v1:
        return f"{book} {c1}:{v1}", (c1, v1, c1, v1)
    if c2 == c1:
        return f"{book} {c1}:{v1}-{v2}", (c1, v1, c1, v2)
    return f"{book} {c1}:{v1}-{c2}:{v2}", (c1, v1, c2, v2)


def find_refs(text, names, head, more):
    """Yield (key, book, (c1, v1, c2, v2)) for every reference in text."""
    pos = 0
    while True:
        m = head.search(text or "", pos)
        if not m:
            return
        book = names[m.group(1)]
        c1, v1 = int(m.group(2)), int(m.group(3))
        c2 = int(m.group(4)) if m.group(4) else None
        v2 = int(m.group(5)) if m.group(5) else None
        key, span = _key(book, c1, v1, c2, v2)
        if v2 is None or span[2:] >= span[:2]:
            yield key, book, span
        end = m.end()
        while True:
            n = more.match(text, end)
            if not n:
                break
            c1, v1 = int(n.group(1)), int(n.group(2))
            c2 = int(n.group(3)) if n.group(3) else None
            v2 = int(n.group(4)) if n.group(4) else None
            key, span = _key(book, c1, v1, c2, v2)
            if v2 is None or span[2:] >= span[:2]:
                yield key, book, span
            end = n.end()
        pos = end


def _card_texts(card):
    """The prose the desk links, and nothing else."""
    yield card.get("finding", "")
    yield card.get("subtitle", "")
    yield from card.get("oneLiners", [])
    yield from card.get("doNotSay", [])
    for s in card["sources"]:
        yield s.get("note", "")


def _resolve(book, span, load_book):
    path, verses = load_book(book)
    if not verses:
        return None
    c1, v1, c2, v2 = span
    keys = sorted(k for k in verses if (c1, v1) <= k <= (c2, v2))
    if not keys or (c1, v1) not in verses or (c2, v2) not in verses:
        return None
    lines = [{"n": f"{c}:{v}", "text": verses[(c, v)]} for c, v in keys[:MAX_VERSES]]
    before = [{"n": f"{c1}:{v}", "text": verses[(c1, v)]} for v in range(max(1, v1 - CONTEXT), v1) if (c1, v) in verses]
    after = [{"n": f"{c2}:{v}", "text": verses[(c2, v)]} for v in range(v2 + 1, v2 + 1 + CONTEXT) if (c2, v) in verses]
    if len(keys) > MAX_VERSES:
        after = []
    return path, lines, before, after, len(keys) > MAX_VERSES, set(keys)


def build(cards, book_files, load_book, aliases, repo_url, root):
    """Returns (index, warnings). index is what dist/desk.json holds."""
    names = _names(book_files, aliases)
    head, more = _pattern(names)
    verses, warnings, spans = {}, [], {}

    for card in cards:
        for text in _card_texts(card):
            for key, book, span in find_refs(text, names, head, more):
                if key in verses:
                    if card["slug"] not in verses[key]["mentioned"]:
                        verses[key]["mentioned"].append(card["slug"])
                    continue
                got = _resolve(book, span, load_book)
                if not got:
                    w = f"{card['slug']}: {key} is not in the KJV file"
                    if w not in warnings:
                        warnings.append(w)
                    continue
                path, lines, before, after, cut, keys = got
                spans[key] = (book, keys)
                verses[key] = {"label": key, "book": book, "file": str(path.relative_to(root)).replace("\\", "/"),
                               "verses": lines, "before": before, "after": after, "truncated": cut,
                               "mentioned": [card["slug"]], "cited": []}

    # Backlinks: which pinned sources quote any of the same verses. A source
    # may name its book by an abbreviation, so it is normalised the same way.
    canon = {k.lower(): v for k, v in names.items()}
    for card in cards:
        for i, s in enumerate(card["sources"]):
            held = set()
            for p in s.get("passages") or []:
                pbook = canon.get(p["book"].lower(), p["book"]).lower()
                for v in p.get("verses", []):
                    c, n = v["n"].split(":")
                    held.add((pbook, int(c), int(n)))
            if not held:
                continue
            for key, (book, keys) in spans.items():
                if any((book.lower(), c, n) in held for c, n in keys):
                    verses[key]["cited"].append([card["slug"], i])

    docs = {}
    for card in cards:
        for g in card.get("goDeeper", []):
            d = docs.setdefault(g["path"], {"path": g["path"], "title": g["title"], "url": repo_url + g["path"], "cards": []})
            if card["slug"] not in d["cards"]:
                d["cards"].append(card["slug"])

    return {"names": names, "verses": verses, "docs": docs}, warnings
