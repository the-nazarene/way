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

import json
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


def build(cards, book_files, load_book, aliases, repo_url, root, resolve_pointer=None):
    """Returns (index, warnings). index is what dist/desk.json holds.
    resolve_pointer is build.py's own transcript-pointer check, so a moment on
    a desk is verified exactly as an objection's pointer is."""
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

    for key in _desk_verse_keys(root):
        if key in verses:
            continue
        refs = list(find_refs(key, names, head, more))
        got = _resolve(refs[0][1], refs[0][2], load_book) if len(refs) == 1 and refs[0][0] == key else None
        if not got:
            warnings.append(f"desks: {key} is not a verse the KJV file holds")
            continue
        path, lines, before, after, cut, keys = got
        spans[key] = (refs[0][1], keys)
        verses[key] = {"label": key, "book": refs[0][1], "file": str(path.relative_to(root)).replace("\\", "/"),
                       "verses": lines, "before": before, "after": after, "truncated": cut,
                       "mentioned": [], "cited": []}

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

    moments = {}
    desks = _prepared_desks(root, cards, verses, docs, warnings, moments, resolve_pointer)
    return {"names": names, "verses": verses, "docs": docs, "desks": desks, "moments": moments}, warnings


def _desk_verse_keys(root):
    folder = root / "site" / "data" / "desks"
    keys = []
    for path in sorted(folder.glob("*.json")) if folder.exists() else []:
        for it in json.loads(path.read_text(encoding="utf-8"))["desk"].get("it", []):
            if it[0] == "v" and it[1] not in keys:
                keys.append(it[1])
    return keys


SHOWS = {"the-jesus-way": "JESUS WAY", "kameron-waters": "KAM WATERS", "dr-tabor": "DR. TABOR"}


def _moment(root, key, phrase, resolve_pointer, warnings, name):
    """A transcript moment: the pointer build.py resolves, plus the paragraph
    it sits in and its neighbours, so the reader shows it in context."""
    if not resolve_pointer:
        return None
    problems = []
    ptr = resolve_pointer({"file": key, "phrase": phrase}, problems)
    if problems or not ptr.get("timestamp"):
        warnings.append(f"desks/{name}: moment {key} \"{phrase[:40]}\" is not in its transcript, left off")
        return None
    text = (root / ptr["path"]).read_text(encoding="utf-8")
    body = text.split("## Full Transcript", 1)[-1]
    paras = [x.strip() for x in body.split("\n\n") if x.strip().startswith("**[")]
    at = next((i for i, x in enumerate(paras) if phrase.lower().replace("\u2019", "'") in x.lower()), None)
    if at is None:
        warnings.append(f"desks/{name}: moment {key} \"{phrase[:40]}\" spans two paragraphs, left off")
        return None

    def para(i):
        if i < 0 or i >= len(paras):
            return None
        head, _, rest = paras[i].partition("** ")
        return {"n": head.strip("*[] "), "text": rest.strip()}

    folder = ptr["path"].replace("\\", "/").split("/")[-2]
    first = text.splitlines()[0].lstrip("# ").strip()
    return {"key": key, "phrase": phrase, "label": ptr["label"], "ts": ptr["timestamp"], "video": ptr.get("video"),
            "file": ptr["path"].replace("\\", "/"), "open": ptr.get("open"), "show": SHOWS.get(folder, folder.upper()),
            "episode": first, "before": para(at - 1), "para": para(at), "after": para(at + 1)}


def _prepared_desks(root, cards, verses, docs, warnings, moments=None, resolve_pointer=None):
    """site/data/desks/*.json: whole arguments laid out ahead of time.

    Each file is {slug, title, subtitle, by, formerly, desk} (formerly: old slugs that still open it), where desk is exactly what
    the desk's COPY JSON produces. Every card, verse, file and string in it is
    checked against this build; anything that no longer resolves is dropped
    with a warning, so a prepared desk can never show a card the build cannot
    stand behind."""
    folder = root / "site" / "data" / "desks"
    if not folder.exists():
        return []
    by_slug = {c["slug"]: c for c in cards}
    out = []
    for path in sorted(folder.glob("*.json")):
        d = json.loads(path.read_text(encoding="utf-8"))
        name = path.name
        kept, ids, seq = [], set(), 1
        for it in d["desk"].get("it", []):
            kind, ok = it[0], True
            if kind == "s":
                card = by_slug.get(it[1])
                ok = bool(card) and 0 <= it[2] < len(card["sources"])
                iid = f"s:{it[1]}:{it[2]}"
            elif kind == "q":
                ok, iid = it[1] in by_slug, f"q:{it[1]}"
            elif kind == "v":
                ok, iid = it[1] in verses, f"v:{it[1]}"
            elif kind == "d":
                ok, iid = it[1] in docs, f"d:{it[1]}"
            elif kind == "m":
                # ['m', transcript key, exact phrase, x, y, w, speaker?]
                iid = f"m:{it[1]}|{it[2]}"
                mk = f"{it[1]}|{it[2]}"
                if mk not in moments:
                    got = _moment(root, it[1], it[2], resolve_pointer, warnings, name)
                    if got:
                        moments[mk] = got
                ok = mk in moments
            elif kind == "w":
                # ['w', url, title, quote, x, y, w]: a page outside the repo. The build
                # cannot fetch it, so it is shown as checked by hand, never as HELD.
                ok = isinstance(it[1], str) and it[1].startswith("https://") and bool(it[2]) and bool(it[3])
                iid = f"w:{it[1]}|{it[3]}"
            elif kind in ("n", "f"):
                # Notes and frames are numbered in order, exactly as canvas.js decodes them.
                iid = f"{kind}:{seq}"
                seq += 1
            else:
                ok, iid = False, kind
            if ok:
                kept.append(it)
                ids.add(iid)
            else:
                warnings.append(f"desks/{name}: {iid} is not in this build, left off the desk")
        links = []
        for ln in d["desk"].get("ln", []):
            # [a, b] or [a, b, words]: the words a string carries, as canvas.js reads them.
            a, b = ln[0], ln[1]
            words = " ".join(ln[2].split())[:40] if len(ln) > 2 and isinstance(ln[2], str) else ""
            if a in ids and b in ids:
                links.append([a, b, words] if words else [a, b])
            else:
                warnings.append(f"desks/{name}: string {a} -> {b} has a missing end, left off")
        desk = dict(d["desk"], it=kept, ln=links)
        out.append({"slug": d["slug"], "title": d["title"], "subtitle": d.get("subtitle", ""),
                    "by": d.get("by", ""), "formerly": d.get("formerly", []), "desk": desk})
    return out
