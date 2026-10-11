# The Way

A focused research repository on the historical Jesus, his actual teachings, and the lineage that preserved them.

Primary sources, deep historical research, practice-oriented framings — all in one place. Built for collaborators who want to take the question of *what Jesus actually taught* seriously, from the source texts up.

---

## Who This Is For

People who suspect the modern packaging of Christianity isn't quite the original — and want to do the work to find out for themselves.

If you're here, you probably already feel the gap between:
- The Jesus of the Sermon on the Mount and the Jesus of substitutionary atonement
- "The kingdom of God is within you" and "wait for the rapture"
- "Love your enemies" and "Christian just war doctrine"
- "Whatever you do for the least of these" and "salvation by faith alone"

This repository documents the gap. Not to tear down anyone's faith — to recover what may have been lost.

---

## Origin

This repo began in May 2026 as a curated snapshot from a larger research base ([mr-pronoia](https://github.com/MrPronoia/mr-pronoia), private). The Christianity-focused content from that base was collected here, and the collection has grown well beyond it since. See `PROVENANCE.md` for the full assembly story and the May 18 scope refinement.

As of October 2026 the repo lives in its own organization, [`the-nazarene`](https://github.com/the-nazarene), stewarded by a group of contributors who take the question of what Jesus actually taught seriously. The old `MrPronoia/the-way` address redirects here permanently.

---

## How to Navigate

| Start here if you want… | Go to |
|---|---|
| **To get oriented as a new contributor** | `ONBOARDING.md` — what a repo is, how to send us material, what's already here, which AI model to use |
| **To see what needs doing** | `ROADMAP.md` — the working to-do list, prioritized |
| **To know how reliable a claim is** | `SOURCE-AUDIT.md` — what's verified, what can't be checked here, and what we found wrong in our own work |
| **To help fix something** | `FIX-LIST.md` — 106 checkboxed items sorted into: known-wrong, overstated, and needs-a-book |
| **To look up a specific claim fast** | `TOPIC-INDEX.md` — the routing table: claim → exact file and section |
| **The hard questions, answered from the sources** | `questions/00-INDEX.md` — fourteen cards: the claim, the evidence, the questions people raise, and honest responses |
| **What critics have actually said, and where we answer it** | `questions/OBJECTIONS.md` — real objections from named critics, each pointed to its moment in the archive and to the card heading that answers it, or marked open |
| **To pick up a research job** | `OPEN-RESEARCH.md` — new ground nobody has covered yet, sized, with what "done" looks like; put your name on one |
| The thesis in one sitting | `christianity/what-jesus-actually-said.md` (~8K words, printable) |
| The 1000-word version | `christianity/cliff-notes-quick-reference.md` |
| A daily practice grounded in Jesus's own words | `christianity/the-practice.md` |
| The Christ-consciousness vision (4-min read) | `christianity/christconsciousnessvision.md` |
| Public-facing intro pages (English & Spanish) | `jesus-site-reference/source/docs/start-here.md` |
| **What counts as a source** — which files may be quoted as ground truth, and what we cite but don't hold | `VERIFIED-SOURCES.md` |
| **The Bible itself (KJV, all 66 books, one verse per line)** | `christianity/Incoming/kjv/` — the red text, the prophets, Paul and Hebrews, grep-able and public domain |
| Primary texts (Gospel of Thomas, Essene Gospel of Peace, Dead Sea Scrolls, Ethiopian Bible) | `christianity/Incoming/`, `christianity/dead-sea-scrolls/`, `christianity/ethiopian-bible/`, `extended-library/essene-gospel-of-peace.md` |
| The Paul problem | `christianity/paul-false-prophet-deuteronomy-18-test.md`, plus the jesus-site `the-paul-problem.md` |
| Rapture deconstruction | `christianity/2026-03-08-darby-dispensationalism-deep-dive.md` |
| The Gnostic gospels (Thomas, Philip, Nag Hammadi) | `gnosticism/` |
| The published website source | `jesus-site-reference/` |
| **The Reading Room — the public front door to the cards** | `site/` — static site built from `questions/`, every source stamped HELD / NOT YET HELD by the build. See `site/README.md` |
| The Jesus Way podcast raw transcripts | `podcast-archive/the-jesus-way/` (65 episodes) |
| Dr. James Tabor's "Paul" playlist, synthesized (77 videos) | `podcast-archive/dr-tabor/` |
| Kameron Waters' channel transcripts (7 videos) | `podcast-archive/kameron-waters/` |

A more detailed reading guide is in `00-OVERVIEW.md`.

**Semantic search:** `python scripts/semantic-search.py "your question"` searches by meaning rather than keyword across the whole repo. One-time setup in `scripts/README.md`.

---

## Top-Level Structure

```
the-way/
├── README.md               ← (this file)
├── CLAUDE.md               ← AI assistant rules
├── 00-OVERVIEW.md          ← Detailed orientation + reading paths
├── PROVENANCE.md           ← How this repo was assembled
│
├── christianity/           ← The main research folder
│   ├── (39 root files: thesis, deep dives, deliverables)
│   ├── Incoming/           ← Primary texts (Gospel of Thomas, Didache, Clementines, Essene Gospel of Peace)
│   │   └── kjv/            ← The King James Bible, 66 files, one verse per line (public domain)
│   ├── dead-sea-scrolls/   ← Essene primary sources
│   ├── ethiopian-bible/    ← Pre-Pauline canonical preservation (1 Enoch, Jubilees, Shepherd of Hermas, etc.)
│   └── vegetarian-pythagorean-jesus/
│
├── gnosticism/             ← The Gnostic gospels (Christian Jesus texts)
│   ├── 00-overview.md
│   ├── 2026-02-22-gnosticism-deep-dive.md
│   ├── cliff-notes-quick-reference.md
│   ├── gospel-of-thomas/
│   ├── Incoming/
│   └── nag-hammadi-key-texts-cliff-notes.md
│
├── extended-library/       ← Jesus-relevant secondary works
│   └── essene-gospel-of-peace.md   ← Szekely (1928), Essene-Jesus connection (provenance caveats noted)
│
├── site/                   ← The Reading Room: public front door to the question cards (GitHub Pages)
│
├── jesus-site-reference/   ← Snapshot of jesusactuallysaid.com source
│   ├── README.md
│   ├── HOW-ITS-BUILT.md    ← Architecture explainer
│   ├── source/             ← The MkDocs site source (17 EN + 17 ES pages)
│   └── cloudflare-worker/  ← The proxy that serves jesusactuallysaid.com
│
└── podcast-archive/        ← Raw transcripts + synthesized research notes (working material)
    ├── README.md
    ├── the-jesus-way/      ← The Jesus Way podcast (Aaron Abke & James Benefico) — 65 episodes, raw transcripts
    ├── dr-tabor/           ← Dr. James Tabor's "Paul" YouTube playlist — 77 videos, synthesized
    └── kameron-waters/     ← Kam Waters' channel (Christspiracy, The Way Skool) — 7 videos
```

---

## Conventions

- **Folder + file names:** lowercase, hyphen-separated (e.g., `gospel-of-thomas-full-text.md`)
- **Primary source texts:** live in `Incoming/` subfolders or labeled `*-full-text.md`
- **Overviews:** named `00-overview.md` at the top of a folder
- **Cliff notes:** `cliff-notes-quick-reference.md`
- **Datable research sessions:** `YYYY-MM-DD-topic.md`

---

## Scope

This repo is intentionally tight. Content here is either:
1. **About Jesus directly** — his words, his community, his teaching
2. **About early Christianity** — Essenes, Nazarenes, Ebionites, the first 300 years
3. **About the distortion** — Paul, Constantine, Augustine, Darby
4. **About the recovery** — Gospel of Thomas, Nag Hammadi, Essene Gospel of Peace, Ethiopian Bible

Broader cross-tradition perennial philosophy, comparative mysticism, and tangentially-related luminaries live upstream in [`mr-pronoia`](https://github.com/MrPronoia/mr-pronoia). The Way stays Jesus-focused.

---

## Status

**Public, October 2026.** Anyone can read, clone, and use everything here — no account or invitation needed. Because it's public, accuracy work takes priority over new content: see `ROADMAP.md` for what's open and `questions/CITATION-NOTES.md` for citations we've found wrong in our own research and corrected. Contributors are being onboarded; see `ONBOARDING.md` for how to send material and `CONTRIBUTING.md` for the mechanics. Because the repo is public, **don't add copyrighted books** — short quotations with citations, public-domain texts, and your own notes only.

---

## License

Give it away. Our research and writing are **CC BY 4.0**: use, share and adapt them freely, and credit The Way so your readers can trace each claim to its sources. The code is **MIT**. Texts that belong to other people (copyrighted translations, podcast transcripts, quotations) are not ours to license; [`LICENSE-CONTENT.md`](LICENSE-CONTENT.md) lists them.

---

*A labor of love. Take what's useful. Verify everything. Read the primary sources for yourself.*
