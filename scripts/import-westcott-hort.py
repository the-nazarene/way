#!/usr/bin/env python3
"""Import the Westcott-Hort Greek New Testament (1881) into
christianity/Incoming/greek-nt-westcott-hort/.

Source: Dr. Maurice A. Robinson's electronic text of Westcott and Hort,
maintained by Ulrik Sandborg-Petersen at
https://github.com/byztxt/greektext-westcott-hort (folder `textonly/`,
one `.WH` file per book). The repo's README says: "License? Public Domain.
Copy freely." The 1881 printed edition is itself public domain.

The files are in the Online Bible ASCII transliteration (a=alpha, y=theta,
c=chi, q=psi, w=omega, v=final sigma ...), lower case, with no accents or
breathings. This script maps them letter-for-letter to Greek characters, so
the output is unaccented lower-case Greek: grep for `καθαριζων`, not
`καθαρίζων`. Westcott and Hort's single [brackets] and double [[brackets]]
are kept exactly as they are in the digital text.

Output: one Markdown file per book, one verse per line,

    **7:19** οτι ουκ εισπορευεται αυτου εις την καρδιαν ...

matching christianity/Incoming/kjv/. A verse number that Westcott and Hort
print no text for (e.g. Matthew 17:21) gets a line saying so, so the gap is
visible rather than silent.

Usage (downloads are untrusted data: fetch them into their own folder first
and run this with python -I):

    python -I scripts/import-westcott-hort.py <folder containing the *.WH files>

Re-running overwrites the 27 files and the folder README. Idempotent.
"""

import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "christianity" / "Incoming" / "greek-nt-westcott-hort"
SOURCE_URL = "https://github.com/byztxt/greektext-westcott-hort"
SOURCE_COMMIT = "91473892d7f36f1227e5c24f8d994d1da40311ad (2017-05-23)"
ADDED = "2026-10-26"
CONTRIBUTOR = "Rex (requested; imported by Claude)"

# (file stem, English name); the Greek titles come from TITLES.W-H, in this order
BOOKS = [
    ("MT", "Matthew"),
    ("MR", "Mark"),
    ("LU", "Luke"),
    ("JOH", "John"),
    ("AC", "Acts"),
    ("RO", "Romans"),
    ("1CO", "1 Corinthians"),
    ("2CO", "2 Corinthians"),
    ("GA", "Galatians"),
    ("EPH", "Ephesians"),
    ("PHP", "Philippians"),
    ("COL", "Colossians"),
    ("1TH", "1 Thessalonians"),
    ("2TH", "2 Thessalonians"),
    ("1TI", "1 Timothy"),
    ("2TI", "2 Timothy"),
    ("TIT", "Titus"),
    ("PHM", "Philemon"),
    ("HEB", "Hebrews"),
    ("JAS", "James"),
    ("1PE", "1 Peter"),
    ("2PE", "2 Peter"),
    ("1JO", "1 John"),
    ("2JO", "2 John"),
    ("3JO", "3 John"),
    ("JUDE", "Jude"),
    ("RE", "Revelation"),
]

SPOT_CHECK = ("spot-checked 2026-10-26: Matthew 28:19, Mark 1:1 (no 'son of God'), 7:19 (καθαριζων), "
              "16:8-9 (longer ending opens with [[ at 16:9; the shorter ending follows 16:20, also in [[ ]]), "
              "John 1:18 (μονογενης θεος), 7:53-8:11 in [[ ]], Luke 23:34a in [[ ]], 1 John 5:7 (no Comma Johanneum) "
              "agree with Westcott-Hort's known readings and brackets; not yet compared line by line with a scan of the 1881 printing")

GOSPELS = {"Matthew", "Mark", "Luke", "John"}

# Online Bible ASCII Greek -> Greek letters.
TRANSLIT = str.maketrans({
    "a": "α", "b": "β", "g": "γ", "d": "δ", "e": "ε", "z": "ζ", "h": "η",
    "y": "θ", "i": "ι", "k": "κ", "l": "λ", "m": "μ", "n": "ν", "x": "ξ",
    "o": "ο", "p": "π", "r": "ρ", "s": "σ", "v": "ς", "t": "τ", "u": "υ",
    "f": "φ", "c": "χ", "q": "ψ", "w": "ω",
})

REF_RE = re.compile(r"^[ \t]*(\d+):(\d+)(?:[ \t]+|$)", re.M)


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def to_greek(text):
    out = text.translate(TRANSLIT)
    leftover = re.findall(r"[A-Za-z]", out)
    if leftover:
        raise SystemExit(f"Untransliterated letters {set(leftover)} in: {text[:80]}")
    return unicodedata.normalize("NFC", out)


def verses(raw):
    """Yield (chapter, verse, text) from one .WH file; text may be ''."""
    raw = raw.replace("\r", "")
    parts = REF_RE.split(raw)
    for i in range(1, len(parts) - 2, 3):
        ch, v = int(parts[i]), int(parts[i + 1])
        txt = re.sub(r"\s+", " ", parts[i + 2]).strip()
        yield ch, v, txt


def header(name, greek_title):
    kind = ("The gospels: Jesus's own words (the red text) are Tier 1 in this repo's source hierarchy."
            if name in GOSPELS else
            "Paul's letters belong in the what-Paul-taught stack, not the what-Jesus-taught stack (see CLAUDE.md)."
            if name in {"Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians",
                        "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy",
                        "Titus", "Philemon"} else
            "New Testament.")
    return f"""# {name} (Westcott-Hort Greek New Testament, 1881)

**Attribution:** {greek_title} ({name}). Traditional attribution; see mainstream scholarship for authorship and dating of the book itself
**Edition:** Brooke Foss Westcott and Fenton John Anthony Hort, *The New Testament in the Original Greek* (Cambridge and London: Macmillan, 1881). Editors' critical text, not a translation
**Original Language:** Koine Greek
**Estimated Date:** Edition 1881; the underlying book is dated by scholarship, not by this file
**Source:** Maurice A. Robinson's electronic text of Westcott-Hort, {SOURCE_URL} (`textonly/`, commit {SOURCE_COMMIT}); converted from Online Bible ASCII Greek to Greek letters by `scripts/import-westcott-hort.py` on {ADDED}; one verse per line so that exact phrases grep on a single line
**Rights:** Public domain (the 1881 edition; the digital text's README: "License? Public Domain. Copy freely.")
**Status:** Unverified — held, not yet checked ({SPOT_CHECK})
**Contributed by:** {CONTRIBUTOR}, {ADDED}. Added for PROCESSING-ROADMAP Next Up 18
**Date added:** {ADDED}
**Note:** {kind} **Unaccented, lower-case Greek** (no accents, breathings or capitals: the digital text has none), so grep without accents, e.g. `καθαριζων`. `[ ]` = words Westcott and Hort print in single brackets (doubtful); `[[ ]]` = passages they print in double brackets as not part of the original text but kept (e.g. Mark 16:9-20, John 7:53-8:11, Luke 23:34a). Both are kept as printed. A verse number with no text is one Westcott and Hort leave out. Cite as "(Westcott-Hort 1881)".

---

"""


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    titles = re.findall(r"^\[ (.+?) \]", (src / "TITLES.W-H").read_text(encoding="ascii"), re.M)
    if len(titles) != len(BOOKS):
        raise SystemExit(f"Expected {len(BOOKS)} titles in TITLES.W-H, found {len(titles)}")
    rows, total, total_empty = [], 0, 0
    for num, ((stem, name), title) in enumerate(zip(BOOKS, titles), start=1):
        gtitle = to_greek(title.lower()).upper()
        raw = (src / f"{stem}.WH").read_text(encoding="ascii")
        fname = f"{num:02d}-{slug(name)}.md"
        out = [header(name, gtitle)]
        count = empty = 0
        last_ch = 0
        for ch, v, txt in verses(raw):
            if ch != last_ch:
                out.append(f"\n## {name} {ch}\n\n")
                last_ch = ch
            if txt:
                out.append(f"**{ch}:{v}** {to_greek(txt)}\n")
                count += 1
            else:
                out.append(f"**{ch}:{v}** — *(no text: Westcott and Hort do not print this verse)*\n")
                empty += 1
        (OUT / fname).write_text("".join(out), encoding="utf-8")
        rows.append((num, name, fname, last_ch, count, empty))
        total += count
        total_empty += empty
        print(f"  {fname:28s} {last_ch:3d} ch  {count:5d} vv  {empty} without text")

    readme = [
        "# Westcott-Hort Greek New Testament (1881): the 27 books, one verse per line\n\n",
        "**What this is.** B. F. Westcott and F. J. A. Hort, *The New Testament in the Original Greek* (Macmillan, 1881), "
        "the critical Greek text behind the 1881 Revised Version and the ancestor of today's critical editions. "
        f"Digital text: Maurice A. Robinson's electronic edition, {SOURCE_URL} (commit {SOURCE_COMMIT}), "
        "converted from Online Bible ASCII Greek to Greek letters by `scripts/import-westcott-hort.py`. "
        "Every verse is on its own line as `**chapter:verse** text`.\n\n",
        "**Why it's here.** So that a claim about what the Greek says (Mark 7:19 *katharizōn*, the longer ending of Mark, "
        "John 1:18 *monogenēs theos*, the missing Comma Johanneum at 1 John 5:7) can be checked against a public-domain "
        "Greek text instead of from memory. The SBL Greek New Testament and NA28 are not public domain.\n\n",
        "**Read this before grepping.** The Greek is **unaccented and lower-case** (the digital text carries no accents, "
        "breathings or capitals). Search `καθαριζων`, not `καθαρίζων`. Final sigma is `ς`.\n\n",
        "**Brackets are Westcott and Hort's, kept as printed.** `[ ]` single brackets: words of doubtful genuineness. "
        "`[[ ]]` double brackets: passages they judged not part of the original text but printed anyway, notably "
        "Mark 16:9-20, John 7:53-8:11 and Luke 23:34a (\"Father, forgive them\"). A verse number with no text "
        "(Matthew 17:21, 18:11, 23:14, Acts 8:37 and others) is one they leave out; the line says so. "
        "Mark 1:45 carries a `| αλλα | αλλ |` spelling note from the digital text. The shorter ending of Mark is on the 16:20 line, after the longer ending, each in its own `[[ ]]`.\n\n",
        "**How to cite.** `Mark 7:19 (Westcott-Hort 1881)`. If you add accents in a quotation, say that you did.\n\n",
        "**Rights.** Public domain: the 1881 edition is long out of copyright, and the digital text's README says "
        "\"License? Public Domain. Copy freely.\"\n\n",
        f"**Spot-check at import.** {SPOT_CHECK[0].upper() + SPOT_CHECK[1:]}. Not yet audited verse-by-verse.\n\n",
        f"**Contributed by:** {CONTRIBUTOR}, {ADDED}. Added for PROCESSING-ROADMAP Next Up 18\n\n",
        "---\n\n| # | Book | File | Chapters | Verses with text | Numbers without text |\n|---|---|---|---|---|---|\n",
    ]
    for num, name, fname, chs, count, empty in rows:
        readme.append(f"| {num} | {name} | `{fname}` | {chs} | {count} | {empty} |\n")
    readme.append(f"\n**Total verses with text:** {total}. **Verse numbers without text:** {total_empty}.\n")
    (OUT / "00-README.md").write_text("".join(readme), encoding="utf-8")
    print(f"\nWrote {len(BOOKS)} books, {total} verses (+{total_empty} numbers without text), to {OUT}")


if __name__ == "__main__":
    main()
