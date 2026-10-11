#!/usr/bin/env python3
"""Group the cards' free-text `tier` labels into a small set of source families.

Why this exists
---------------
`tier` is doing two jobs at once. It names the kind of source ("red text",
"Dead Sea Scrolls - excerpts") and it annotates that particular use of it
("red text - the strongest Synoptic text, and our criterion cuts against us").
Both are worth keeping: the first is a category, the second is an argument.

The cost of mixing them shows up the moment anything wants to group by source
type. Across the current cards there are over a hundred distinct tier strings
for a couple of hundred sources, and most occur exactly once. Any filter or
legend built on `tier` gets a hundred near-empty buckets.

This script derives a `family` from the tier string with a pure function and
prints what every existing tier maps to, so the grouping can be reviewed
before anything depends on it. Nothing is hand-assigned, so a new card files
itself.

Order matters: "red text - John" is red text, not John, so RED TEXT is tested
first. The sub-label is whatever follows the family name, and it is kept, not
discarded - that is the annotation, and it is often the most interesting part
of the card.

Usage
-----
    python site/tier-families.py              # read site/data/cards/*.json
    python site/tier-families.py path/to/data.json
    python site/tier-families.py --check      # exit 1 if anything is unfiled

If this grouping looks right, the single function `family_of` can move into
build.py and write a `family` field next to `tier` on every source. The
Reading Room could then colour and filter by it, and the desk (site/src/
canvas.js) already carries the same table in `FAMILIES`; the two must be kept
in step until one of them is the only copy.
"""

import collections
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# The tier strings are full of middle dots, so a default Windows console
# codepage turns the whole report into mojibake. Ask for UTF-8 and move on.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except (AttributeError, ValueError):
    pass

# (key, label, regex). The last entry has no regex and catches the rest.
FAMILIES = [
    ("red",    "RED TEXT",         r"^red text"),
    ("thomas", "THOMAS",           r"^thomas"),
    ("john",   "JOHN",             r"^john\b"),
    ("dss",    "DEAD SEA SCROLLS", r"^dead sea scrolls"),
    ("early",  "EARLY CHURCH",     r"^(early church|clementine|didache|patristic|jewish-christian tradition)"),
    ("jerus",  "JERUSALEM CHURCH", r"^(jerusalem|the succession|the successors|the family\b|the apostles\b|the forwarding address)"),
    ("ethio",  "ETHIOPIAN CANON",  r"^ethiopian"),
    ("heb",    "HEBREW BIBLE",     r"^(prophets|torah)"),
    ("paul",   "PAUL",             r"^(paul|what paul|disputed authorship)"),
    ("acts",   "ACTS",             r"^acts"),
    ("mss",    "THE MANUSCRIPTS",  r"^(the seams|kjv prints it|the manuscripts|the dating debate)"),
    ("schol",  "SCHOLARSHIP",      r"^scholarship"),
    ("arg",    "THE ARGUMENT",     None),
]


def family_of(tier):
    """Tier string -> (key, label). Pure, order-sensitive, total."""
    t = (tier or "").strip().lower()
    for key, label, pattern in FAMILIES:
        if pattern and re.search(pattern, t):
            return key, label
    return FAMILIES[-1][0], FAMILIES[-1][1]


def sub_label(tier, label):
    """Whatever the tier says beyond the family name: the annotation, kept."""
    rest = re.split(r"\s*[·|]\s*", (tier or "").strip(), maxsplit=1)
    return rest[1].strip() if len(rest) > 1 else ""


def load_sources(argv):
    explicit = [a for a in argv[1:] if not a.startswith("--")]
    if explicit:
        data = json.load(open(explicit[0], encoding="utf-8"))
        return [(c.get("call", "?"), s) for c in data["cards"] for s in c.get("sources", [])]
    rows = []
    for path in sorted(glob.glob(os.path.join(ROOT, "site", "data", "cards", "*.json"))):
        card = json.load(open(path, encoding="utf-8"))
        for s in card.get("sources", []):
            rows.append((card.get("call", "?"), s))
    return rows


def main():
    rows = load_sources(sys.argv)
    if not rows:
        print("No sources found. Run from the repo, or pass a built data.json.")
        return 1

    tiers = collections.Counter()
    fams = collections.OrderedDict((k, []) for k, _, _ in FAMILIES)
    labels = {k: lbl for k, lbl, _ in FAMILIES}

    for _, s in rows:
        tiers[s.get("tier", "")] += 1
    for tier, n in tiers.items():
        key, _ = family_of(tier)
        fams[key].append((tier, n))

    total = sum(tiers.values())
    print("%d sources, %d distinct tier strings, %d families\n" % (total, len(tiers), len(FAMILIES)))

    width = max(len(l) for l in labels.values())
    print("SUMMARY")
    for key in fams:
        n = sum(c for _, c in fams[key])
        kinds = len(fams[key])
        print("  %-*s  %4d sources  %3d distinct tiers" % (width, labels[key], n, kinds))

    print("\nEVERY TIER, AND WHERE IT LANDS")
    for key in fams:
        if not fams[key]:
            continue
        print("\n  %s" % labels[key])
        for tier, n in sorted(fams[key], key=lambda kv: (-kv[1], kv[0])):
            sub = sub_label(tier, labels[key])
            print("    %3d  %s%s" % (n, tier, ("   [sub: %s]" % sub) if sub else ""))

    catch = fams[FAMILIES[-1][0]]
    if catch:
        print("\nUNFILED (caught by %s) - review these first:" % labels[FAMILIES[-1][0]])
        for tier, n in sorted(catch, key=lambda kv: (-kv[1], kv[0])):
            print("    %3d  %s" % (n, tier))

    if "--check" in sys.argv and catch:
        print("\n--check: %d tier strings are unfiled." % len(catch))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
