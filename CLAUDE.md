# The Way — AI Assistant Rules

> This file is read at the start of every session. It tells you what this repo is and how to be helpful within it.

---

## What This Repo Is

A curated Christianity research collection, now at `the-nazarene/way`. Began as a snapshot from [mr-pronoia](https://github.com/MrPronoia/mr-pronoia) (the larger esoteric-knowledge base), packaged for collaboration with the broader Jesus-research community (including Cameron Waters / The Way Skool community).

See `README.md` for orientation and `PROVENANCE.md` for the assembly story.

---

## Finding Things Fast (start here for any claim lookup)

Don't search the repo blind — there are three purpose-built entry points, in this order:

0. **`VERIFIED-SOURCES.md`** (repo root) — which files may be quoted as ground truth, by tier, with the edition behind each. If a quotation matters, it comes from a file on this list or it doesn't get said.
1. **`TOPIC-INDEX.md`** (repo root) — the routing table. A claim or question comes in, you find the row, you open one file at the named section. ~117 entries across nine topic clusters plus the primary texts. Every path and section anchor is verified.
2. **`questions/`** — fourteen cards on the hard questions (claim, strongest primary-source evidence, the questions people raise with honest responses, one-sentence versions, go-deeper paths). Start with `questions/00-INDEX.md`. **Read `questions/CITATION-NOTES.md` before quoting anything** — it records two citations that were found to be wrong, plus a do-not-use list.
3. **The Bible text itself:** `christianity/Incoming/kjv/` holds all 66 books of the KJV, one verse per line. `grep -rn "I will have mercy, and not sacrifice" christianity/Incoming/kjv/` finds the verse. Quote from the file and cite as (KJV).
4. **`python scripts/semantic-search.py "your question"`** — semantic (meaning-based, not keyword) search over the whole repo via Gemini embeddings. Use it when the question comes from an angle the index doesn't anticipate. Needs a one-time `--rebuild`; see `scripts/README.md`.

**For live use** (a conversation, recording, or Q&A), `questions/LIVE-SETUP.md` has the session-warmup prompt and the two-tab pattern (fast model for lookups, Fable/Opus for deep theology). **For an objection someone has actually raised**, check `questions/OBJECTIONS.md` first: it maps real critics' words to the card heading that answers them, and says honestly which ones are still open.

**The Desk (infinite canvas, in review).** If asked about the infinite canvas or "the desk", read `site/DESK.md`. It says how to check out the `desk-prototype` branch, build, and walk someone through it.

**Looking for something to work on?** `OPEN-RESEARCH.md` lists the gaps (sized, with what "done" looks like). `FIX-LIST.md` is for repairing existing claims; `OPEN-RESEARCH.md` is for new ground.

---

## Core Thesis (the gravitational center)

1. **Jesus's actual teaching** is recoverable from the red text + the Gospel of Thomas + cross-source historical reconstruction
2. **It was substantially distorted** by Paul, by Constantine, by Augustine, by Darby — at identifiable historical moments
3. **The original teaching** matches what mystical traditions across the world have always taught: the kingdom is within, divinity is shared, salvation is participatory, love is the law
4. **The Essene-Nazarene-Ebionite lineage** is the direct continuity from Jesus's actual community
5. **Modern evangelical theology** (rapture, blood atonement, faith-alone, Trinity-as-dogma) is largely a post-Constantine and post-1830 construction, not original

Hold this lightly — it's the working thesis, not a creed. Every claim is traceable to primary sources.

---

## Tone

Collaborative research between people who take this seriously. Direct, real, curious. **Not academic, not preachy, not adversarial.** We're not "debunking Christianity" — we're recovering it.

When users ask about Christian theology:
- Distinguish what *Jesus* said from what *Paul* said from what *the institutional church* later codified
- Quote primary sources with citations
- Acknowledge mainstream positions even when we diverge from them
- Welcome uncertainty where it's honest

---

## Source Hierarchy (for any claim about what Jesus taught)

1. **Red text** (canonical gospels, Jesus's direct words)
2. **Gospel of Thomas** (Coptic, Nag Hammadi)
3. **Other early non-canonical texts** (Gospel of Philip, Gospel of Mary, Q reconstruction)
4. **Essene primary sources** (Dead Sea Scrolls — Community Rule, Damascus Document, Thanksgiving Hymns)
5. **Early church writings preserving Jewish-Christian tradition** (Didache, Clementine Homilies, Shepherd of Hermas, Epistula Apostolorum)
6. **Ethiopian canonical preservation** (1 Enoch, Jubilees, Meqabyan)
7. **Recognized scholarship** (Tabor, Ehrman, Eisenman, Crossan, Pagels)

**Do not put Pauline epistles in the "what Jesus taught" stack.** They go in the "what Paul taught" stack — a separate question.

**Which files hold that evidence: `VERIFIED-SOURCES.md`.** Quote only from the files listed there (Tier 1 full texts, Tier 2 excerpts), and name the translator. Anything not on that list is our reading of a source, not a source — check it against a listed file before repeating it. Sources we cite but don't hold (the canonical gospels, Josephus, Eusebius, Epiphanius…) are cited at reference level, without quotation marks, until a text is added and registered there.

---

## Reading the Folder Structure

| Folder | Purpose |
|---|---|
| `christianity/` | The main research — overviews, deep dives, primary texts |
| `gnosticism/` | The Gnostic gospels — Gospel of Thomas, Gospel of Philip, Nag Hammadi (Christianity's mystical wing, suppressed but recovered) |
| `extended-library/` | Jesus-relevant secondary works — currently just `essene-gospel-of-peace.md` (with provenance caveats) |
| `jesus-site-reference/` | Source for jesusactuallysaid.com + architectural notes |
| `podcast-archive/` | Raw auto-caption transcripts — The Jesus Way (65 episodes), Dr. James Tabor's "Paul" playlist (77 videos, synthesized), Kam Waters' channel (7 videos). Working material: **pointers, not proof** — never quote as a source |
| `site/` | The Reading Room — the public static site over the question cards. `site/build.py` stamps every source HELD / NOT YET HELD by checking the repo, and refuses to build a citation it can't find. Content follows the cards; fix the card first |
| `questions/` | 14 cards on the hard questions (claim, evidence, questions people raise + responses, one-sentence versions) + `CITATION-NOTES.md`, which logs citations found to be fabricated or reversed. Read that file before quoting |
| `scripts/` | `semantic-search.py` — meaning-based search over the whole repo (Gemini embeddings). Setup in `scripts/README.md` |

**Scope:** This repo is tight by design — Jesus directly, early Christianity, the distortion, the recovery. Broader perennial-philosophy / comparative-mysticism / Christian-adjacent luminaries (Eckhart, Newton, etc.) live upstream in `mr-pronoia`, not here. Don't propose adding them back without checking with Matt — the 2026-05-18 scope refinement was deliberate.

---

## What Not to Promote Without Care

- **Essene Gospel of Peace (Szekely):** Scholarly consensus questions provenance. Include with caveats. Don't cite as if it's a verified ancient text.
- **Podcast archive episodes:** Raw transcripts — research material, not polished output. Don't quote as authoritative.
- **Anything marked DRAFT, WORKING, or _private:** Do not propagate without explicit review.

---

## Cross-Repo Reality

- This repo's content is **also present** in the source `mr-pronoia` repo. They will drift over time. The canonical source is wherever Matt + Rex declare it canonical — by default, treat `mr-pronoia` as upstream and `the-way` as a curated downstream.
- **Do not auto-sync.** If something is updated in one repo and matters in the other, propose the propagation explicitly.
- The jesusactuallysaid.com website is built from `mr-pronoia/jesus-site/`, not from this repo's snapshot. The snapshot here is for *reference and possible future independent deployment*.

---

## Two Users (and growing)

- **Matt Fracek** — Founder of Nature Backs, lifelong Jesus question, has been documenting this since 2018+
- **Rex** — Research partner, co-host of the Mr. Pronoia podcast (with Matt), founder of VJ Academy, digital art and projection mapping artist.
- **Kameron Waters (Kam)** — Christspiracy filmmaker, runs The Way Skool community. Potential collaborator (not yet invited to this repo).
- **Future collaborators** — As they're added, their `CLAUDE.md` context should be appended below.

---

## Skills

The mr-pronoia repo has `/think`, `/mine`, and `/highlights` skills. They may be portable here if useful — but this repo is currently optimized for collaboration and reading, not active research workflow. Active research happens in mr-pronoia; finalized work flows into the-way.

---

## When in Doubt

- Lead with primary sources
- Cite Jesus's actual words
- Distinguish original teaching from later construction
- Welcome the person, not the position
- "Don't take our word for it — read it yourself."
