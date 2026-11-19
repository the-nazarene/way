# The Reading Room — the public front door

A static site that lets a stranger pull one of the `questions/` cards from a drawer, read the answer, and open every source behind it. No server, no AI, no account. Built from the repo on every merge to `main` and served at the project's GitHub Pages address.

**The design** came out of a round of mockups (Oct 2026): a night reading room, a card-catalog drawer that holds the *questions*, and a manila case file on the desk that holds the *evidence* for the pulled card, pinned FOR and AGAINST with red string. The catalog navigates; the case file argues. Charcoal and cream, with the string and one yellow legal pad as the only color.

## How it works

```
site/
├── data/cards/*.json   ← one structured record per questions/ card (all 14; hand-written from the card, build-checked)
├── src/                ← index.html, styles.css, app.js (the room)
├── build.py            ← checks every source against the repo, writes dist/
└── dist/               ← build output (git-ignored; the Action builds it)
```

`build.py` is the honest part. For each source on a card:

| Source record | What the build does | Stamp |
|---|---|---|
| `"ref": "Matthew 9:13; 12:7"` + `"phrase"` | Resolves the verses in `christianity/Incoming/kjv/`, embeds the verse text, **fails if the phrase isn't in those verses** | HELD · KJV |
| `"path": "christianity/Incoming/didache-full-text.md"` + `"phrase"` | Greps the file, embeds a snippet around the hit, **fails if the phrase isn't there** | HELD |
| `"link": "https://…"` only | Nothing to check; links out | NOT YET HELD · public domain |

So a stamp on the site is a build result, never a hand-written claim, and the site cannot publish a citation the repo doesn't contain. When a public-domain text is added to the collection, change the source from `link` to `path` and the stamp turns green on the next build.

## Build locally

```
python site/build.py --check     # verify every citation, write nothing
python site/build.py             # write site/dist/
cd site/dist && python -m http.server 8000
```

## Adding a card

1. Copy an existing `site/data/cards/*.json`. Fill `question`, `aliases` (the ways people actually phrase it; this is what the drawer search matches), `finding` (the card's position, in the card's words), `oneLiners`, `doNotSay`, `sources`, `goDeeper`, `next`.
2. Every source has a `side` (`for`, `against`, `other`), a `tier` (the repo's source hierarchy, in words), a `note` (what the card says about it, including the response to an objection), and **one** of `ref` (scripture), `path` (a held repo file), or `link` (not held yet). Give `ref` and `path` sources a `phrase`: the distinctive words to grep.
3. **Source links** (optional, but every card has them): `findingLinks` lists words in the `finding` that open the sources behind them, e.g. `{"words": "quoting Hosea", "sources": ["Hosea 6:6"]}`. Name each source by its `ref` or `title`, exactly as on the card. Link only where the finding says a text says or does something, and only to a source that actually says it (read the note and the passage, not just the title); 3 to 8 per card. The build refuses words that don't appear exactly once in the finding, and sources that aren't on the card or aren't held. Readers can switch the underlines off in the top bar; `site/data/settings.json` switches them off for everyone.
4. Run `python site/build.py --check`. Fix anything it refuses. `npm test -- links` (in `site/tests/desk`) then clicks every link on every card and checks the reader opens the right source with its phrase highlighted.
5. The content must follow the card in `questions/`, not improve on it. The card is the reviewed artifact; the site is a view of it. If the card is wrong, fix the card first.

**Links and copying.** Every card is `#/<slug>`; every source is `#/<slug>/<n>` and opens the reader pane directly. The reader has "copy citation" (the distinctive phrase, the reference, the translation, and the permalink) and "copy link"; each one-liner on the legal pad has a copy button. That is the push-one-line tool for live use: paste it into a comment reply and the reader lands on the verse.

**Open decision (Matt + Rex):** whether these records should move into front-matter on the `questions/*.md` files themselves, so a contributor fixing a citation fixes the site in the same edit. The JSON folder is easy to migrate when that's settled.

## What's deliberately not here

- **No generated answers.** A question with no card gets the nearest cards and an "ask for a card" link that opens a GitHub issue. That issue stream is the gap log for `OPEN-RESEARCH.md`.
- **No podcast quotations.** Transcripts are pointers, not proof.
- **No copyrighted text.** The KJV and the held public-domain files only.

## Deploy

`.github/workflows/site.yml` builds on every push to `main` that touches `site/`, `questions/`, or `christianity/`, and deploys `site/dist/` to GitHub Pages. Pages must be set to "GitHub Actions" as the source (Settings → Pages). A custom domain is a CNAME away when there is one.

Phase 2 (a smarter drawer: embeddings over the cards and the whole repo, still returning cards only) and phase 3 (grounded answers for questions with no card, stamped UNCHECKED) are described in `projects/the-nazarene-way/STATUS.md` on Matt's side and are gated on `FIX-LIST.md` P0.
