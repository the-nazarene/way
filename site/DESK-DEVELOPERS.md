# The Desk: developer guide

For anyone joining the work on the Desk, the infinite-canvas mode of the Reading Room, and for their AI assistant. Read this first and you can be useful within the hour without asking anyone where things are.

- **What it does, and the open questions for Matt:** [`DESK.md`](DESK.md)
- **Where the work happens:** branch `desk-prototype` on `the-nazarene/way`, reviewed in [pull request #9](https://github.com/the-nazarene/way/pull/9). `main` is the live site, nazareneway.com, and nothing reaches it without Matt's merge.

---

## Start here (five minutes)

You need Git, Python 3 and a browser. Node is only needed for the tests.

```
git clone https://github.com/the-nazarene/way.git
cd way
git checkout desk-prototype
python site/build.py
python -m http.server 8000 --directory site/dist
```

Then open:

| Address | What you'll see |
|---|---|
| <http://localhost:8000/> | The Reading Room, Matt's front door. Open any case: there's an OPEN ON THE DESK tab beside its folder tab. |
| <http://localhost:8000/canvas.html> | The Desk, empty. |
| <http://localhost:8000/canvas.html#desk=essenes-sacrifice-meat> | A prepared desk: the counter-argument board for "Jesus, the Essenes, sacrifice and meat". |
| <http://localhost:8000/canvas.html#desk=essenes-sacrifice-meat&present> | The same desk as a presentation. → to move, Esc to end. |

`python site/build.py` is Matt's build. It checks every citation on every card against the texts held in the repo and **refuses to publish one it can't find**. If it fails, a card is wrong, not the build.

---

## Hand this to your Claude

Paste this into Claude Code (or any assistant) opened in your copy of the repo:

> Read `site/DESK-DEVELOPERS.md` and `site/DESK.md`, then `CLAUDE.md` at the repo root. We're working on the Desk on the `desk-prototype` branch of the-nazarene/way. Check out that branch, run `python site/build.py`, serve `site/dist`, and show me the Desk at `canvas.html#desk=essenes-sacrifice-meat`. Follow the rules in the developer guide: nothing on the desk is generated, `app.js` and `styles.css` stay untouched, build and test before proposing anything, and never push to `main`. Then tell me what you'd suggest improving.

Everything an assistant needs is in this file and the two it links. The rules below aren't style preferences. They're what keeps the site trustworthy.

---

## How to give input (no code needed)

- **Comment on [pull request #9](https://github.com/the-nazarene/way/pull/9).** Anything goes: a feature idea, something confusing, a bug. Comment on a specific line of a specific file if it's about that.
- **Open an issue** on the-nazarene/way for anything bigger, titled "Desk: …".
- **Propose a prepared desk.** Lay out an argument on the Desk, press COPY JSON, and paste it into an issue with a title and a one-line description. See *Add a prepared desk* below for how it becomes one.
- **Found a wrong citation?** The link in the Desk's footer files it. Those are fixed on the cards, never on the desk.

---

## The rules

1. **Nothing on the desk is generated.** Every card is a source `build.py` verified, a verse the build found in the held KJV, a file that exists in the repo, or a note visibly marked *NOTE · NOT A SOURCE*. Search retrieves; it never writes. If an AI-answer feature is ever added, its output must be drawn as obviously not a source, with no stamp, and it waits on Matt (his `site/README.md`, phase 3).
2. **Families are derived, never hand-assigned.** `familyOf()` maps a source's tier string to one of thirteen families. New cards file themselves.
3. **Matt's files stay Matt's.** `app.js` and `styles.css` are untouched. The changes to his files are additive and listed in `DESK.md` under *What changed in files you wrote*. Keep it that way, or ask first.
4. **Quote only what the repo holds.** A new quotation goes into a held text first (see *Add a primary text*). Transcripts are pointers, not proof.

---

## How it fits together

```
site/data/cards/*.json ─┐
questions/, christianity/ (held texts) ─┤
                        ├─ site/build.py ──► dist/data.json   cards + sources, every citation verified
site/data/objections.json ─┘     │
                                 └─ site/desk_links.py ──► dist/desk.json
                                      verse references in the card prose, resolved against the KJV;
                                      go-deeper files; prepared desks from site/data/desks/, validated

dist/index.html + app.js       the Reading Room (Matt's), reads data.json
dist/desk-door.js              adds OPEN ON THE DESK to each case file
dist/canvas.html + .css + .js  the Desk, reads data.json and desk.json
```

No server, no database, no accounts. The site is static files, and a desk lives in the reader's browser or inside a link.

---

## File map

| File | What it is |
|---|---|
| `site/src/canvas.html` | The Desk's page: search, toolbar, trays, surface, reader, present-mode caption and bar. |
| `site/src/canvas.css` | The Desk's styles. **Only Matt's tokens** from `styles.css` (`--pad`, `--ink`, `--string`, `--type`, ...). Loaded after it. |
| `site/src/canvas.js` | The engine: one ES5 IIFE, no framework. Mapped below. |
| `site/src/desk-door.js` | The Reading Room's OPEN ON THE DESK tab, built from outside `app.js`. |
| `site/desk_links.py` | Called by `build.py`; writes `dist/desk.json`. |
| `site/data/desks/*.json` | Prepared desks. |
| `site/tier-families.py` | Report of how every tier string maps to a family. |
| `site/tests/desk/` | Browser tests and the Essene-desk generator. |
| `site/DESK.md` | Features, review notes, open questions for Matt. |
| `site/PROPOSAL-SECRET-LINKS.md` | The proposal for saving desks under private links (no accounts), awaiting Matt. |
| `christianity/Incoming/witnesses-on-flesh-and-sacrifice-selected-texts.md` | Held excerpts behind the sacrifice and diet cards; the model for adding patristic texts. |

---

## Inside `canvas.js`

The file is organized under banner comments. Search for the banner, not a line number, because line numbers drift.

| Banner | What lives there |
|---|---|
| `source families` | `FAMILIES`, `familyOf()`, `tierClass()` |
| `the viewport` | `tf` (pan and zoom), `toWorld()`, `zoomAt()` |
| `the model` / `adding things` | `items`, `links`, `pushUndo` / `cancelUndo` / `undo` / `redo`, `addSource`, `addQuestion`, `addVerse`, `addDoc`, `addNote`, `addFrame`, `freeSpot` |
| `pulling a whole case` | `pullCase()`, `caseRoomAt()` (never lays a case on top of other cards), `flowAndSettle()` |
| `the thread` | `spawn()`: a link becomes a card beside its origin, tied by string |
| `rendering` | one builder per card kind; `renderAll()` redraws everything |
| `string`, `snapping`, `frames` | `drawLinks()`, `selectLink()` / `cutLink()` (select a string, then Delete or its x), `snapDelta()` (22px stack gap), `membersOf()` (spatial, never stored), `startRename()` |
| `words on string` | `stringWords()` draws them, `editWords()` writes them, `cleanWords()` tidies them; they live in their own layer, `#linkWords`, above the cards |
| `phones: the desk as a list` | `applyPhone()`, `renderPhone()`, `phoneCard()` (TIED TO), `wirePhone()` |
| `interaction` | pointer and keyboard handling; `openItem()` opens a card's reader |
| `fit and tidy` | `fitTarget()`, `fitBox()`, `tidy()` |
| `the trays` / `a case file, open in the tray` | tray rendering, `openTrayCase()` |
| `searching the trays and the desk` | `filterTray()`, `renderHere()` (ON THIS DESK), `focusOn()` |
| `present mode` | `startPresent()`, `goSlide()`, `animateTo()`, `presentKey()` |
| `search: retrieve, never generate` | Fuse over held sources; typed verse references |
| `persistence` | `encode()` / `decode()`, shared links, prepared desks, the shared-view bar |
| `references in prose` / `chips` / `carrying` | the reference grammar (mirrors `desk_links.py`), chips, drag-from-tray |
| `the reader` | `openReader`, `openCaseReader`, `openVerseReader`, `openDocReader` |
| `wiring` / `boot` | buttons; `boot()` loads, renders, honours `#pull=`, `#desk=`, `#b=`, `&present` |

---

## The desk model

Everything on a desk is an item in `items`, in paint order. Strings are pairs of ids in `links`, with optional `words`.

| Kind | `t` | Id | Saved as |
|---|---|---|---|
| Source on a card | `src` | `s:<card slug>:<source index>` | `['s', slug, index, x, y, w]` |
| Question card | `q` | `q:<slug>` | `['q', slug, x, y, w]` |
| Verse | `v` | `v:<Book c:v>` | `['v', key, x, y, w]` |
| Go-deeper file | `d` | `d:<repo path>` | `['d', path, x, y, w]` |
| Note | `note` | `n:<n>` | `['n', text, x, y, w]` |
| Frame (a section) | `frame` | `f:<n>` | `['f', title, x, y, w, h, colour]` |

A saved desk is `{ v: 1, vp: [x, y, zoom], it: [...], ln: [[id, id], [id, id, words], ...] }`. A string's words are an optional third entry, so older desks and links still open. COPY JSON copies exactly that, the share link carries it URL-encoded after `#b=`, and a prepared desk wraps it. Notes and frames are numbered in the order they appear, so `n:` and `f:` ids depend on that order.

**Sources are referenced by index**, so a card's `sources` list is **append-only**. Inserting a source in the middle would silently re-point every desk that uses that card.

---

## Common tasks

### Add a source to a card
Edit `site/data/cards/<slug>.json`. The file keeps one source per line, so add yours **at the end** of `sources`, in the same compact style. A verse source needs `ref` and `phrase`; a held text needs `path` and `phrase`. Run `python site/build.py`. It fails if the phrase isn't in the text, and that's the point.

### Add a primary text
Excerpts go in `christianity/Incoming/`, each with its translator, edition, URL and retrieval date, plus a provenance block at the top of the file. Public-domain editions only, or short attributed excerpts. Never retype a quotation: copy it from the source. Register the file in `VERIFIED-SOURCES.md`. The witnesses file listed above is the model.

### Add a prepared desk
1. Lay it out on the Desk. Use frames for sections: each frame becomes a slide in present mode.
2. COPY JSON.
3. Create `site/data/desks/<slug>.json`:
   ```json
   { "slug": "<slug>", "title": "...", "subtitle": "one line, shown in the bar and on the overview slide", "by": "...", "desk": <paste> }
   ```
4. `python site/build.py`. Anything on the desk the build can't resolve is dropped and listed as a warning.
5. Open `canvas.html#desk=<slug>`, and `&present` to check the walkthrough.

For a layout generated in code, see `site/tests/desk/make-essene-desk.js`. It lays the board out, measures every card in a real browser, then lays it out again with the real heights, so the gaps are exact.

### Make an episode board

An episode board breaks one podcast episode into its topics and claims: each claim is a **moment** (the exact words, with a ▶ link to that second of the video), a **check** (a coloured note: ✓ holds, ~ narrower, ✗ doesn't hold, ? open, ◇ interpretation, • experience), and the **evidence** (KJV verses, card sources, and outside pages), tied by string. The five most recent Jesus Way episodes are done: `#desk=jesus-way-062` to `#desk=jesus-way-066`.

1. **The transcript** must be in `podcast-archive/` with timestamps (`python scripts/pull-transcripts.py <file>`).
2. **The breakdown**, `site/data/episodes/<n>.json`. Give your Claude the prompt in `site/data/episodes/README.md`. It reads the whole transcript, picks 12 to 20 claims, and checks each against the texts and the web, opening every page it cites.
3. **Check it mechanically:** `python site/tests/desk/check-episode.py site/data/episodes/<n>.json`. Every phrase must sit in one transcript paragraph (a wrong timestamp is corrected for you), every verse must be in the KJV, every card source must exist, and every outside quote must actually be on its page (it downloads them; `--no-web` skips that). Fix every FAIL.
4. **Check it by hand.** The script can't judge a verdict. Read every ✗ and ~ with the sources open, and a sample of the ✓. Things the first five boards needed: a quote from a sentence the repo itself flags as unreliable, a number taken from a page nobody opened, a verdict that was fair to one side but not the other.
5. **Build it:** `node site/tests/desk/make-episode-desks.js <n>` writes `site/data/desks/jesus-way-<n>.json`, lays it out, measures it in Chrome and lays it out again. The build checks it a third time: a moment whose words aren't in the transcript, or a verse the KJV doesn't have, is left off with a warning.
6. `npm test -- episodes`.

Moments are pointers, never proof: they are stamped POINTER · NOT PROOF, and outside pages OUTSIDE · CHECKED BY HAND, never HELD.

### Add a feature to the Desk
- **New card kind:** an `add…()` function, a builder called from `renderAll()`, a case in `encode()` and `decode()`, and a case in `openItem()`.
- **New key:** the keyboard handler under `interaction`. While presenting, `presentKey()` runs first.
- **New tray section:** markup in `canvas.html`, rendering beside `renderTray()`. Give clickable rows a `data-search` attribute so tray search filters them.
- **Styles:** `canvas.css`, using Matt's tokens. A new colour that looks like a status colour reads as a stamp. Don't.
- Then **test it** (below), and add a test for the new behaviour.

---

## Testing

The tests drive the real page in real Chrome.

```
cd site/tests/desk
npm install          # once; installs puppeteer-core only (it uses your installed Chrome)
npm test             # builds the site, serves it, runs every suite
npm test -- present  # one suite
```

About five minutes for all of it, 409 checks. Chrome is found automatically. Set `CHROME_PATH` if it isn't, or `DESK_URL` to test a site that's already being served. Screenshots go to your temp folder (`desk-test-shots`).

| Suite | Covers |
|---|---|
| `regress` | Layout, snapping and the 22px gap, frames, string, search, share link, reader, phone width |
| `features` | The Reading Room door, the tray, dragging out, the thread (verse, case and go-deeper cards) |
| `sharing` | A shared link never overwrites your own desk; keep, back, reload, Back button |
| `search` | Prepared desks, short links, tray search, jumping to sections and cards |
| `present` | Present mode end to end, including that the caption and bar never cover the board |
| `edit` | Editing a laid-out desk: moving and renaming sections, tying, selecting and deleting string, undo and redo, group moves |
| `file` | Desk files: save, clear the browser, open it back; refusing non-desk files; dropping a file on the desk |
| `help` | The ? panel: opening, closing, focus, small screens, out of the way while presenting |
| `episodes` | Every episode board: each card the build kept is shown, no overlaps, moments stamped pointer, readers, search, keeping a board, invented moments dropped |
| `words` | Words on string: writing them by double-click and Aa, Enter, Esc, clearing, the 40-letter limit, undo, saving, reloading, desk links, presenting, phones, bad data |
| `phone` | Phones: the desk as a list (every card once, sections in order, TIED TO, no sideways scroll), tapping to read, the thread opening without pinning, OPEN AS A DESK and back, present, an empty desk, a window narrowed and widened |

Two things that bite when writing tests: Chrome doesn't paint background tabs, so call `bringToFront()` on a page before measuring or screenshotting it after opening another. And scroll a tray item into view before dragging it.

---

## Branches and pull requests

- Work on `desk-prototype`, or a branch off it for anything sizeable. Never push to `main`; that's the live site.
- Before pushing: `python site/build.py` passes and `npm test` is green.
- Say what you changed and why in the commit message. Matt reviews in PR #9.
- New files in Matt's areas (cards, research files, `questions/`) follow the repo's `CONTRIBUTING.md`.

---

## What's next

Ideas with a rough priority. Pick one up, or argue for a different one on the PR.

0. **Secret links for saving desks.** No logins: each saved desk gets a private link, encrypted in the browser. Proposal in `site/PROPOSAL-SECRET-LINKS.md`, waiting on Matt. SAVE FILE covers it until then.
1. ~~**A preview site.**~~ Done: <https://nazarene-desk.pages.dev> serves this branch, on Rex's free Cloudflare account, separate from nazareneway.com and hidden from search engines. Rex or his Claude redeploys it after a push (`python site/build.py`, add a `_headers` file with `X-Robots-Tag: noindex`, then `npx wrangler pages deploy <folder> --project-name nazarene-desk --branch main`), and `DESK_URL=https://nazarene-desk.pages.dev/ npm test` checks it live.
2. ~~**Phones get a read-only desk.**~~ Done: phones read a desk as a list (`phone` suite).
3. **Objections as cards.** `data.json` already carries 19 objections raised by named critics and 73 prepared on the cards. An OBJECTIONS tray, filterable by who raises them, drags an objection onto the desk with its answer tied by string, and can show the two side by side.
4. ~~**Labels on string.**~~ Done: words on string (`words` suite).
5. **A simpler toolbar.** Fold COPY JSON and CLEAR into a menu, rename COPY DESK LINK to SHARE, and give the empty desk a one-click start.
6. **Print a section** as a one-page handout.
7. **Debt:** share the reader pane between `app.js` and `canvas.js`; move `familyOf` into `build.py` as a `family` field (both need Matt's say).
