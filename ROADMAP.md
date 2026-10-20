# Roadmap

Working to-do list for The Way. Current as of 2026-10-19.

**The governing fact:** this repo is **public**. Anyone can read it, clone it, quote it, and check it. That changes the priority order — a wrong claim here is not a private note we'll tidy up later, it's something a stranger can screenshot. Accuracy work outranks new content.

---

## P0 — Do before inviting more people in

| # | Item | Why it's P0 | Status |
|---|---|---|---|
| 1 | **Source audit** | **Done — diagnosis in `SOURCE-AUDIT.md`, work list in `FIX-LIST.md`.** Four passes, ~2,900 claims. Found **19 fabricated citations**, ~50 absolutes that break on one counterexample, 15 quotations lifted from podcast captions, 5 famous misattributions, and one footnote error that caused sitewide Thomas quotation drift. **106 actionable items**, sorted into fix / narrow / homework. | ✅ |
| 1a | **Fix the public pages** | Highest cost of being wrong — strangers read these and owe us no benefit of the doubt. The absolutes and the Thomas-translation problem are the two biggest. Several already fixed 2026-10-07. | Partly done |
| 1b | **Fix the Meyer-2007 error at its root, then reconcile every Thomas quotation** | `gnosticism/gospel-of-thomas/00-overview.md` claims Lambdin's translation is in Meyer 2007. It isn't — Meyer 2007 prints Meyer's own. That one footnote licensed eight-plus files to credit Lambdin while quoting Meyer, including a public page whose argument rests on a word Lambdin doesn't use. Thomas 113 now exists in six wordings. | Not started |
| 1c | **Retire or properly source the 13 podcast-origin quotations** | Where a real book exists, get the page number. Where the subject is identified only by role ("The Baptist Preacher"), don't quote it at all. | Partly done |
| 1d | **Downgrade every absolute to its narrow true version** | ~34 of them. In every case examined, the narrow version made the same point and would have survived. | Not started |
| 1e | **Add loci to the ~53 vague citations, or drop the quotation marks** | Author-only attributions with no work or page. This is the category fabrications hide in. | Not started |
| 2 | **Run the semantic search for the first time** | It has never been run. One of the three lookup tools in `ONBOARDING.md` doesn't actually work yet, which is a poor first impression for new contributors. Needs a `GOOGLE_API_KEY` and one `--rebuild`. | Blocked on Rex (API key) |
| 3a | **Register every primary text in `VERIFIED-SOURCES.md`, then add the red text** | The source hierarchy's tier 1 (the canonical gospels) has no file in the repo; Josephus, Eusebius, Hegesippus and Epiphanius are each cited on five cards with no text behind them. The manifest now says so. First add: a public-domain gospels text (WEB and/or KJV). | Manifest done 2026-10-07; texts not started |
| 3 | **Add provenance headers to the 14 files that lack them** | `scripts/semantic-search.py` now carries each file's source block into every search result, so a file with no header returns "(no source header — unverified provenance)". Mostly `cliff-notes-quick-reference.md` files. **Only from what each file already documents** — never infer a source. | Not started |

---

## P1 — Content gaps worth closing

| # | Item | Notes |
|---|---|---|
| 4 | **Hell / afterlife has no research file** | The only one of the nine topic clusters with no `christianity/` home. `questions/hell-afterlife.md` is all there is behind it. If the subject comes up publicly, that's the thinnest ground in the collection. |
| 5 | **Acts 21:23-26 — James funds Temple sacrifices** | Appears nowhere outside podcast transcripts. It is the strongest counter-evidence to the sacrifice claim and currently has no prepared treatment. See `questions/nazarene-sect-sacrifice-and-diet.md`. |
| 6 | **Isaiah 56:7 is quoted truncated in five files** | The omitted first half reads "their burnt offerings and their sacrifices will be accepted on my altar" — the opposite of how we use the verse. Needs fixing at the source, not just noting on a card. |
| 7 | **Episode 045 transcript** | **Done 2026-10-08** — transcribed locally with Whisper (large-v3-turbo) from the audio, since captions are disabled at the source. Labeled as such in the file. |
| 8 | **Matthew 2:23 has zero coverage** | "He shall be called a Nazarene" — no such OT prophecy exists verbatim. It's the first thing a prepared critic raises about the Nazarene claim and the repo says nothing about it. |
| 8a | **Open research jobs for contributors** | `OPEN-RESEARCH.md` — eight sized jobs from a read of the podcast archive against the research files (Romans 14, Paul's four texts, the Baptist's diet, Mark and Paul, the five open objections in `questions/OBJECTIONS.md`, the critics' originals, Josephus/Philo/Eusebius as held texts, episode 045). New ground, not repairs. |
| 8b | **Processing roadmap: sources from contributors** | Everything people send us (YouTube, Google Drive, documents) is inventoried, credited and queued in `PROCESSING-ROADMAP.md`. Ask Claude "what's next on the processing roadmap?" Current: Craig Wescoe's *Panarion* (audit pending); Chris Crutchfield's three YouTube links, 414 videos (Shabbat Studies fully transcribed and noted; David The Nazarene and SixSeven Podcast transcripts in progress). |

---

## P2 — Infrastructure and polish

| # | Item | Notes |
|---|---|---|
| 9 | **Ray Pritz, *Nazarene Jewish Christianity*** | The standard monograph on exactly our central claim, and it's absent from the bibliography. Cite it rather than copying it (see the copyright rule in `CONTRIBUTING.md`). |
| 9a | **The Reading Room — public front door** | `site/` is live from `main` via GitHub Pages. **All 14 cards structured** (218 sources, 204 held in the repo, 14 public-domain-not-held), drawers grouped by topic, permalinks and copy-a-citation on every source, KJV passages shown in context. Open: Rex on JSON records vs card front-matter; the objections bank (PR #5) as a second cabinet once merged; a smarter drawer (embeddings) needs an API key as an Actions secret; analytics needs an account; Phase 3 (grounded answers for no-card questions, stamped UNCHECKED) waits on P0. |
| 10 | **Jamie — push-to-check lookup tool** | Spec'd and ready to build in `ideas/jamie-mvp.md`. Milestone M2 (console output from real retrieval) is the gate: everything before it is plumbing, everything after is polish. |
| 11 | **Delete the merged `questions-not-debate` branch** | Fully merged into `main`; it'll read as work-in-progress to new contributors. Matt's branch, Matt's call. |
| 12 | **Spanish mirrors drift** | 17 `*.es.md` files translate the English pages. When an English page is corrected, the Spanish needs the same fix — there's no automation, so it has to be deliberate. |

---

## Standing practices (not tasks — how we work)

- **Primary text beats our notes. Our notes beat memory.** Verify in `christianity/Incoming/` before quoting. It takes ten seconds.
- **Cite the distinctive phrase, not the line number.** Line numbers shift the moment anyone edits a file above them. A grep for `"neither be purified by atonement"` works forever.
- **Podcast transcripts are pointers, not proof.** Two of the five fabricated citations entered the repo by being lifted from an auto-caption with quotation marks added.
- **Prefer the narrow claim.** Every overclaim caught so far had a true, narrower version that made the same point and would have survived scrutiny — "no sacrifice," "nowhere else," "not a comparison."
- **No copyrighted books.** Short attributed excerpts, public-domain texts, and our own notes. `christianity/dead-sea-scrolls/Incoming/dead-sea-scrolls-selected-texts.md` is the house model.
- **Put your name on what you contribute.** `**Contributed by:**` rides along into search results — credit, and a person to ask when a citation needs checking.

---

## Done recently (2026-10-06 / 10-09)

- **2026-10-09: the KJV is held.** All 66 books in `christianity/Incoming/kjv/`, one verse per line, public domain, imported by `scripts/import-kjv.py`. The repo's number-one source tier finally has a file; every gospel quotation can now be checked in ten seconds. `VERIFIED-SOURCES.md` (PR #3) should move "the canonical gospels" from *Not held* to Tier 1 when it merges.
- **2026-10-09: the Reading Room (`site/`).** A static front door over the cards; see P2 item 9a.

- Jesus Way archive brought current: 55 → 65 episodes. Kam Waters' channel archived (7 videos). Episode 045 diagnosed as captions-disabled-at-source rather than merely missing.
- `questions/` built out to 18 files, including four cards that exist specifically to stop us being ambushed on method (how we read John, the Gospel of Thomas, criteria, and what we actually offer).
- `TOPIC-INDEX.md` — ~117 claim→file routing entries, every path and anchor verified.
- `scripts/semantic-search.py` ported, with three fixes to the upstream version: a chunker that was silently dropping 35% of the text, provenance carried into every search result, and `.gitignore` honoured so a local-only book can never reach the embedding API.
- Five fabricated or reversed citations found and corrected, propagated across 24 files including the published site source in both languages. Logged in `questions/CITATION-NOTES.md`.
- `ONBOARDING.md` and `CONTRIBUTING.md` written for the incoming contributor crew.
