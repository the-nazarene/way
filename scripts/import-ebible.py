#!/usr/bin/env python3
"""Import a public-domain eBible.org translation into christianity/Incoming/.

eBible.org (https://ebible.org) publishes each translation as a "VPL" zip
(verse per line: `GEN 1:1 In the beginning ...`). This script turns that file
into one Markdown file per book, one verse per line, in the same form as
christianity/Incoming/kjv/:

    **6:6** For I desire mercy, and not sacrifice, ...

Two texts are configured (add another by adding a PROFILES entry):

    brenton  Brenton's English Septuagint   eng-Brenton_vpl.zip -> septuagint-brenton/
    jps      JPS 1917 Hebrew Bible           engjps_vpl.zip      -> jps-1917/

Versification. Brenton is printed with the Septuagint's own numbering (Psalm
39 here is Psalm 40 in Hebrew and English), and eBible keeps it. eBible's JPS
1917 is mapped to KJV numbering, with the numbers JPS actually printed (the
Hebrew ones) kept inline as "(51-3)". This script restores the printed JPS
numbering from those markers and labels each line whose English (KJV) number
differs, so both are greppable: `**51:3** _(KJV 51:1)_ Be gracious unto me`.

Usage (downloads are untrusted data: unzip them into their own folder and run
this with python -I):

    python -I scripts/import-ebible.py brenton path/to/eng-Brenton_vpl.txt
    python -I scripts/import-ebible.py jps     path/to/engjps_vpl.txt

Re-running overwrites the book files and the folder README. Idempotent.
"""

import re
import sys
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ADDED = "2026-10-26"
CONTRIBUTOR = "Rex (requested; imported by Claude)"


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


# --- Brenton -----------------------------------------------------------------
# (eBible VPL code, English name, Brenton's own title where it differs, group)
# File order: the English Old Testament order for the books of the Hebrew
# canon (Greek Esther and Greek Daniel in their usual places), then the other
# books in eBible's order.
BRENTON_BOOKS = [
    ("GEN", "Genesis", None, "canon"), ("EXO", "Exodus", None, "canon"),
    ("LEV", "Leviticus", None, "canon"), ("NUM", "Numbers", None, "canon"),
    ("DEU", "Deuteronomy", None, "canon"), ("JOS", "Joshua", None, "canon"),
    ("JDG", "Judges", None, "canon"), ("RUT", "Ruth", None, "canon"),
    ("1SA", "1 Samuel", "1 Kings (1 Reigns)", "canon"),
    ("2SA", "2 Samuel", "2 Kings (2 Reigns)", "canon"),
    ("1KI", "1 Kings", "3 Kings (3 Reigns)", "canon"),
    ("2KI", "2 Kings", "4 Kings (4 Reigns)", "canon"),
    ("1CH", "1 Chronicles", None, "canon"), ("2CH", "2 Chronicles", None, "canon"),
    ("EZR", "Ezra-Nehemiah", "Ezra and Nehemiah (2 Esdras)", "canon"),
    ("NEH", "Nehemiah", None, "canon"),
    ("ESG", "Esther", "Esther (Greek, with the additions)", "canon"),
    ("JOB", "Job", None, "canon"), ("PSA", "Psalms", None, "canon"),
    ("PRO", "Proverbs", None, "canon"), ("ECC", "Ecclesiastes", None, "canon"),
    ("SOL", "Song of Solomon", None, "canon"),
    ("ISA", "Isaiah", "Esaias", "canon"), ("JER", "Jeremiah", "Jeremias", "canon"),
    ("LAM", "Lamentations", None, "canon"), ("EZE", "Ezekiel", "Jezekiel", "canon"),
    ("DNG", "Daniel", "Daniel (Greek, with the Song of the Three Children)", "canon"),
    ("HOS", "Hosea", "Osee", "canon"), ("JOE", "Joel", None, "canon"),
    ("AMO", "Amos", None, "canon"), ("OBA", "Obadiah", "Obdias", "canon"),
    ("JON", "Jonah", "Jonas", "canon"), ("MIC", "Micah", "Michæas", "canon"),
    ("NAH", "Nahum", "Naum", "canon"), ("HAB", "Habakkuk", "Ambacum", "canon"),
    ("ZEP", "Zephaniah", "Sophonias", "canon"), ("HAG", "Haggai", "Aggæus", "canon"),
    ("ZEC", "Zechariah", "Zacharias", "canon"), ("MAL", "Malachi", "Malachias", "canon"),
    ("TOB", "Tobit", None, "other"), ("JDT", "Judith", None, "other"),
    ("WIS", "Wisdom of Solomon", None, "other"),
    ("SIR", "Sirach", "Wisdom of Jesus the Son of Sirach (Ecclesiasticus)", "other"),
    ("BAR", "Baruch", None, "other"), ("EPJ", "Epistle of Jeremy", None, "other"),
    ("SUS", "Susanna", None, "other"), ("BEL", "Bel and the Dragon", None, "other"),
    ("1MA", "1 Maccabees", None, "other"), ("2MA", "2 Maccabees", None, "other"),
    ("1ES", "1 Esdras", None, "other"), ("PRM", "Prayer of Manasses", None, "other"),
    ("3MA", "3 Maccabees", None, "other"), ("4MA", "4 Maccabees", None, "other"),
]

# --- JPS 1917 ----------------------------------------------------------------
# File order: the Tanakh order JPS 1917 is printed in (Law, Prophets, Writings).
JPS_BOOKS = [
    ("GEN", "Genesis", "law"), ("EXO", "Exodus", "law"), ("LEV", "Leviticus", "law"),
    ("NUM", "Numbers", "law"), ("DEU", "Deuteronomy", "law"),
    ("JOS", "Joshua", "prophets"), ("JDG", "Judges", "prophets"),
    ("1SA", "1 Samuel", "prophets"), ("2SA", "2 Samuel", "prophets"),
    ("1KI", "1 Kings", "prophets"), ("2KI", "2 Kings", "prophets"),
    ("ISA", "Isaiah", "prophets"), ("JER", "Jeremiah", "prophets"),
    ("EZE", "Ezekiel", "prophets"), ("HOS", "Hosea", "prophets"),
    ("JOE", "Joel", "prophets"), ("AMO", "Amos", "prophets"),
    ("OBA", "Obadiah", "prophets"), ("JON", "Jonah", "prophets"),
    ("MIC", "Micah", "prophets"), ("NAH", "Nahum", "prophets"),
    ("HAB", "Habakkuk", "prophets"), ("ZEP", "Zephaniah", "prophets"),
    ("HAG", "Haggai", "prophets"), ("ZEC", "Zechariah", "prophets"),
    ("MAL", "Malachi", "prophets"),
    ("PSA", "Psalms", "writings"), ("PRO", "Proverbs", "writings"),
    ("JOB", "Job", "writings"), ("SOL", "Song of Songs", "writings"),
    ("RUT", "Ruth", "writings"), ("LAM", "Lamentations", "writings"),
    ("ECC", "Ecclesiastes", "writings"), ("EST", "Esther", "writings"),
    ("DAN", "Daniel", "writings"), ("EZR", "Ezra", "writings"),
    ("NEH", "Nehemiah", "writings"), ("1CH", "1 Chronicles", "writings"),
    ("2CH", "2 Chronicles", "writings"),
]

PROFILES = {
    "brenton": {
        "out": "septuagint-brenton",
        "books": BRENTON_BOOKS,
        "title": "Brenton's English Septuagint",
        "short": "Brenton",
        "page": "https://ebible.org/Scriptures/details.php?id=eng-Brenton",
        "zip": "https://ebible.org/Scriptures/eng-Brenton_vpl.zip",
        "srcdate": "eBible source files dated 2026-10-07",
        "renumber": False,
    },
    "jps": {
        "out": "jps-1917",
        "books": JPS_BOOKS,
        "title": "JPS 1917 Hebrew Bible in English",
        "short": "JPS 1917",
        "page": "https://ebible.org/Scriptures/details.php?id=engjps",
        "zip": "https://ebible.org/Scriptures/engjps_vpl.zip",
        "srcdate": "eBible source files dated 2025-12-12",
        "renumber": True,
    },
}

SPOT = {
    "brenton": ("spot-checked 2026-10-26: Hosea 6:6, Isaiah 53:12, Psalm 39:7 (= Hebrew/English Psalm 40:6), "
                "Daniel 7:13, Jeremiah 38:31 (= English 31:31) read as expected; not yet compared with a scan of the printed edition"),
    "jps": ("spot-checked 2026-10-26: Hosea 6:6, Jeremiah 7:22, Isaiah 7:14, Psalm 2:7, Psalm 40:7 (= KJV 40:6), "
            "Psalm 51:3 (= KJV 51:1), Malachi 3:19 (= KJV 4:1) read as expected; not yet compared with a scan of the printed edition"),
}

# Extra per-book notes (Brenton).
BOOK_NOTES = {
    "EZR": ("This file is the Septuagint's 2 Esdras as eBible gives it: chapters 1-10 are Ezra, chapters 11-23 are "
            "Nehemiah 1-13. eBible also supplies Nehemiah as a separate book (next file); the two copies differ in places "
            "in spelling and verse division (e.g. Nehemiah 3:33-37 and 3:6a exist only here). "),
    "NEH": ("eBible supplies Nehemiah separately as well as inside 2 Esdras (previous file, chapters 11-23); the two copies "
            "differ in places in spelling and verse division, so check both before quoting. "),
    "PRO": ("Chapter 30 has no text here: the Septuagint arranges Proverbs 24-31 differently, and the material of Hebrew/English Proverbs 30 stands elsewhere in the book (much of it in chapter 24). "),
}

MARK = re.compile(r"\((\d+)-(\d+)\)\s*")
PSALM_BOOK = re.compile(r"^(BOOK [IV]+)\s+")


def read_vpl(path):
    """Return {code: [(chapter, verse, text), ...]} in file order."""
    books = OrderedDict()
    for line in Path(path).read_text(encoding="utf-8-sig").splitlines():
        if not line.strip():
            continue
        code, ref, *rest = line.split(" ", 2)
        cs, vs = ref.split(":")
        # Brenton has lettered verses (Joshua 9:2a-f, 3 Kings 2:35a ...) for
        # Septuagint text with no Hebrew counterpart; keep the letter.
        c, v = int(cs), (int(vs) if vs.isdigit() else vs)
        books.setdefault(code, []).append((c, v, rest[0].strip() if rest else ""))
    return books


def restore_printed_numbers(rows):
    """eBible JPS: KJV-numbered rows with "(c-v)" markers -> printed numbering.

    Returns [((c, v), kjv_label, text)], checked to run 1, 2, 3 ... with no
    gaps or repeats inside each chapter.
    """
    segs = []  # [orig, kjv, text]
    for c, v, text in rows:
        heading = None
        m = PSALM_BOOK.match(text)
        if m:  # "BOOK II" heading that eBible ran into the first verse
            heading, text = m.group(1), text[m.end():]
        parts = MARK.split(text)
        if len(parts) == 1:
            pieces = [((c, v), text)]
        else:
            pieces = [((c, v), parts[0].strip())] if parts[0].strip() else []
            pieces += [((int(parts[i]), int(parts[i + 1])), parts[i + 2].strip())
                       for i in range(1, len(parts), 3)]
        for j, (orig, t) in enumerate(pieces):
            if heading and j == 0:
                t = f"*Book {heading.split()[1]}* {t}"
            segs.append([orig, [(c, v)], t])
    # Merge consecutive pieces carrying the same printed number (e.g. JPS
    # prints Exodus 20:13 as one verse; KJV splits it into 20:13-16).
    merged = []
    for orig, kjv, t in segs:
        if merged and merged[-1][0] == orig:
            merged[-1][1] += kjv
            merged[-1][2] = (merged[-1][2] + " " + t).strip()
        else:
            merged.append([orig, kjv, t])
    # How many printed verses share each KJV verse?
    share = {}
    for _, kjv, _ in merged:
        for k in kjv:
            share[k] = share.get(k, 0) + 1
    out, prev = [], (0, 0)
    for orig, kjv, t in merged:
        if not ((orig[0] == prev[0] and orig[1] == prev[1] + 1) or (orig[0] == prev[0] + 1 and orig[1] == 1)):
            raise SystemExit(f"Numbering does not run in order: {prev} -> {orig}: {t[:60]}")
        prev = orig
        first, last = kjv[0], kjv[-1]
        if first == last:
            label = f"{first[0]}:{first[1]}"
        elif first[0] == last[0]:
            label = f"{first[0]}:{first[1]}-{last[1]}"
        else:
            label = f"{first[0]}:{first[1]}-{last[0]}:{last[1]}"
        same = (first == last == orig) and share[first] == 1
        out.append((orig, None if same else label, t))
    return out


def header(p, key, code, name, own_title, group):
    today = ADDED
    if key == "brenton":
        title = f"# {name} (Brenton's English Septuagint)" + (f": Brenton's title \"{own_title}\"" if own_title else "")
        note = ("Translated from the Greek Septuagint, not the Hebrew, so it often reads differently from the KJV and JPS; "
                "that difference is the point of holding it (the New Testament usually quotes the Septuagint). "
                "**Numbering is the Septuagint's as Brenton prints it:** Psalms 10-147 are mostly one lower than the Hebrew/English "
                "(Psalm 39:7 here is Psalm 40:6 in English, and Psalm 39 has the superscription as verse 1), and Jeremiah "
                "25-51 follow the Septuagint order (Jeremiah 38:31 here is the new-covenant passage, English 31:31). "
                "`[ ]` marks words Brenton supplied (printed in italics); his footnotes are not included. "
                "Cite as \"(Brenton)\", with the Septuagint number, and give the English number where it differs.")
        note = BOOK_NOTES.get(code, "") + note
        if group == "other":
            note = ("Not in the Hebrew canon; part of the Septuagint and of the Catholic and Orthodox Old Testaments. " + note)
        return f"""{title}

**Attribution:** {own_title or name}. Traditional attribution; see mainstream scholarship for authorship and dating of the book itself
**Translation:** Sir Lancelot Charles Lee Brenton, *The Septuagint Version of the Old Testament* (English, London: Samuel Bagster and Sons, 1844; with the Greek, 1851), "according to the Vatican text". eBible.org's text is the 1870 Bagster printing with corrections it documents in its errata
**Original Language:** Greek (the Septuagint), translated from Hebrew (and Aramaic) 3rd-1st century BCE; some of the additional books were composed in Greek
**Estimated Date:** Translation 1844 / 1851; the underlying book is dated by scholarship, not by this file
**Source:** {p['page']} (VPL download {p['zip']}, {p['srcdate']}), imported by `scripts/import-ebible.py` on {today}; one verse per line so that exact phrases grep on a single line
**Rights:** Public domain
**Status:** Unverified — held, not yet checked ({SPOT[key]})
**Contributed by:** {CONTRIBUTOR}, {today}. Added for PROCESSING-ROADMAP Next Up 18
**Date added:** {today}
**Note:** {note}

---

"""
    note = ("The 1917 Jewish Publication Society translation of the Hebrew (Masoretic) text, the standard Jewish English Bible "
            "before the NJPS of 1985. **Numbering is the Hebrew, as JPS prints it.** Where the KJV numbers a verse differently "
            "(most Psalms, whose superscriptions are verse 1 here; Malachi 3:19-24 = KJV 4:1-6; Joel 3-4 = KJV 2:28-3:21), "
            "the line carries the KJV number too: `**51:3** _(KJV 51:1)_`. The KJV number is eBible's mapping (a KJV verse that "
            "JPS splits, or a superscription the KJV leaves unnumbered, shows the KJV verse it falls in). "
            "Cite as \"(JPS 1917)\" with the JPS number, and give the KJV number where it differs.")
    return f"""# {name} (JPS 1917)

**Attribution:** {name}. Traditional attribution; see mainstream scholarship for authorship and dating of the book itself
**Translation:** *The Holy Scriptures According to the Masoretic Text: A New Translation* (Philadelphia: Jewish Publication Society of America, 1917); editor-in-chief Max L. Margolis
**Original Language:** Hebrew (with Aramaic portions in Ezra and Daniel)
**Estimated Date:** Translation 1917; the underlying book is dated by scholarship, not by this file
**Source:** {p['page']} (VPL download {p['zip']}, {p['srcdate']}), imported by `scripts/import-ebible.py` on {today}; JPS's printed verse numbers restored from eBible's inline markers; one verse per line so that exact phrases grep on a single line
**Rights:** Public domain
**Status:** Unverified — held, not yet checked ({SPOT[key]})
**Contributed by:** {CONTRIBUTOR}, {today}. Added for PROCESSING-ROADMAP Next Up 18
**Date added:** {today}
**Note:** {note}

---

"""


def main():
    if len(sys.argv) != 3 or sys.argv[1] not in PROFILES:
        raise SystemExit(__doc__)
    key, path = sys.argv[1], sys.argv[2]
    p = PROFILES[key]
    data = read_vpl(path)
    wanted = [b[0] for b in p["books"]]
    unused = [c for c in data if c not in wanted]
    missing = [c for c in wanted if c not in data]
    if unused or missing:
        raise SystemExit(f"Book codes not mapped: {unused}; not found: {missing}")
    out_dir = ROOT / "christianity" / "Incoming" / p["out"]
    out_dir.mkdir(parents=True, exist_ok=True)
    rows_index, total, empties = [], 0, []
    for num, book in enumerate(p["books"], start=1):
        if key == "brenton":
            code, name, own, group = book
        else:
            (code, name, group), own = book, None
        if p["renumber"]:
            verses = restore_printed_numbers(data[code])
        else:
            verses = [((c, v), None, t) for c, v, t in data[code]]
        fname = f"{num:02d}-{slug(name)}.md"
        out = [header(p, key, code, name, own, group)]
        last_ch, count = 0, 0
        for (c, v), kjv, t in verses:
            if c != last_ch:
                out.append(f"\n## {name} {c}\n\n")
                last_ch = c
            if not t:
                empties.append(f"{name} {c}:{v}")
                out.append(f"**{c}:{v}** — *(no text at this number in this edition)*\n")
                continue
            label = f"_(KJV {kjv})_ " if kjv else ""
            out.append(f"**{c}:{v}** {label}{t}\n")
            count += 1
        (out_dir / fname).write_text("".join(out), encoding="utf-8")
        rows_index.append((num, name, own, fname, last_ch, count))
        total += count
        print(f"  {fname:32s} {last_ch:3d} ch  {count:5d} vv")

    if key == "brenton":
        intro = [
            "# Brenton's English Septuagint (1844 / 1851), one verse per line\n\n",
            "**What this is.** Sir Lancelot C. L. Brenton's English translation of the Greek Old Testament (the Septuagint), "
            "first published in English in 1844 and with the Greek in 1851 (Bagster), from eBible.org's public-domain text "
            "(the 1870 printing, with eBible's documented corrections). Split into one file per book by `scripts/import-ebible.py`.\n\n",
            "**Why it's here.** The New Testament writers mostly quote the Greek Old Testament, not the Hebrew. Hebrews 10:5 "
            "(\"a body hast thou prepared me\") quotes Psalm 39:7 in this text, where the Hebrew (and the KJV and JPS at Psalm 40:6) "
            "has \"mine ears hast thou opened\". Questions like that need the Septuagint on the shelf.\n\n",
            "**Numbering is the Septuagint's.** Psalms 10-147 mostly run one lower than the Hebrew/English (LXX 9 = Hebrew 9-10; LXX 113 = 114-115; LXX 114-115 = 116; LXX 146-147 = 147); Jeremiah 25-51 are in the "
            "Septuagint order (Brenton's appendix tables the correspondence); a few books (Esther, Daniel, Proverbs 24-31) "
            "are arranged differently. Always give the Brenton number, and the English one where it differs.\n\n",
            "**Brackets.** `[ ]` marks words Brenton supplied, which the printed edition sets in italics. Brenton's footnotes "
            "are not included.\n\n",
            "**File order.** The books of the Hebrew canon in English Old Testament order (Greek Esther and Greek Daniel in "
            "their usual places), then the other books of Brenton's edition in eBible's order.\n\n",
        ]
    else:
        intro = [
            "# JPS 1917: the Hebrew Bible in English, one verse per line\n\n",
            "**What this is.** *The Holy Scriptures According to the Masoretic Text: A New Translation* (Jewish Publication "
            "Society, 1917), from eBible.org's public-domain text, split into one file per book by `scripts/import-ebible.py`.\n\n",
            "**Why it's here.** A public-domain Jewish translation of the Hebrew text, to set beside the KJV (Christian, 1611) "
            "and Brenton (from the Greek). Isaiah 7:14 \"the young woman shall conceive\" is the obvious case.\n\n",
            "**Numbering is the Hebrew, as JPS prints it.** eBible distributes this text renumbered to the KJV with the JPS "
            "numbers inline; the import restores JPS's own numbers and puts the KJV number on any line where it differs, "
            "e.g. `**40:7** _(KJV 40:6)_ Sacrifice and meal-offering Thou hast no delight in`. Grep either.\n\n",
            "**File order.** The order JPS prints: Law, Prophets, Writings (Chronicles last).\n\n",
        ]
    readme = intro + [
        f"**How to cite.** `Hosea 6:6 ({p['short']})`. Quote this file's wording.\n\n",
        f"**Source.** {p['page']} ({p['srcdate']}). **Rights:** public domain.\n\n",
        f"**Spot-check at import.** {SPOT[key][0].upper() + SPOT[key][1:]}. Not yet audited verse-by-verse.\n\n",
        f"**Contributed by:** {CONTRIBUTOR}, {ADDED}. Added for PROCESSING-ROADMAP Next Up 18\n\n",
        "---\n\n| # | Book | File | Chapters | Verses |\n|---|---|---|---|---|\n",
    ]
    for num, name, own, fname, chs, count in rows_index:
        label = f"{name} ({own})" if own else name
        readme.append(f"| {num} | {label} | `{fname}` | {chs} | {count} |\n")
    readme.append(f"\n**Total verses:** {total}\n")
    if empties:
        readme.append(f"\n**Verse numbers with no text in this edition:** {', '.join(empties)}\n")
    (out_dir / "00-README.md").write_text("".join(readme), encoding="utf-8")
    print(f"\nWrote {len(p['books'])} books, {total} verses, to {out_dir}"
          + (f" ({len(empties)} empty: {', '.join(empties)})" if empties else ""))


if __name__ == "__main__":
    main()
