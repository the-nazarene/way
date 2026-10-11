# Contributing to The Way

Welcome. If you're reading this, someone trusted you with the keys — this is a shared, living research repository, and you're invited to help it grow.

New here? Read **`ONBOARDING.md`** first — the short brief on what this is, how to browse it, how to hand us material, and what's already in the collection. Then **`README.md`** (navigation) and **`00-OVERVIEW.md`** (reading paths). This file is about *how to contribute* once you're oriented.

---

## The Spirit of This Place

We're not debunking Christianity — we're **recovering** it. The work is collaborative research between people who take the question of *what Jesus actually taught* seriously.

A few ground rules that keep the repo trustworthy:

- **Lead with primary sources.** Quote Jesus's actual words, cite the text, link the source. "Don't take our word for it — read it yourself."
- **Distinguish the layers.** What *Jesus* said ≠ what *Paul* said ≠ what the *institutional church* later codified. Keep them separate.
- **Welcome the person, not just the position.** Acknowledge mainstream views even where we diverge. Honest uncertainty beats false confidence.
- **Cite as you go.** Every claim should be traceable. (See the Source Hierarchy in `CLAUDE.md`.)

---

## Sending Us Material (the no-effort path)

**You don't need GitHub, Markdown, or any AI tool to contribute.** If you have research, send it in whatever form it already exists and we'll convert it. Converting documents to Markdown is fast on our end — it is not worth your time to reformat anything.

**Send as-is:** PDFs (books, papers, scans) · Word documents · Google Docs (link or export) · plain text and Notes exports · photos of book pages · YouTube and web links · a pile of mixed files in one email.

**Flag these before sending:**

| Format | Why |
|---|---|
| Audio or video | Needs transcribing first. We have a pipeline (see `podcast-archive/the-jesus-way/TRANSCRIPT-STATUS.md`) — just tell us it's coming. |
| Scans with no text layer | Readable, but we verify by eye, so turnaround is slower. |
| Handwriting | Works if the photo is legible — send one test page first. |
| Old `.doc` files | Save as `.docx` or PDF first. |
| Anything not yours to share | In-copyright books, paywalled papers, private material. Tell us and we'll cite it rather than copy it. |

### Always include the provenance

The one thing we cannot reconstruct later is **where it came from**: author, title, date, *which translation or edition*, and the chapter or page. Thirty seconds from you saves an hour on our end, and sometimes the trail is genuinely unrecoverable.

This is not bureaucratic. In October 2026 a verification pass found three quotes circulating in this repo's own research that pointed at sources where the text was not present — one attributed to a specific chapter of a document that doesn't contain it, another reversing what the source actually said. See `questions/CITATION-NOTES.md`. **A citation we can't defend is worse than no citation**, because someone eventually opens the book.

### The source header — and why it's load-bearing

Every research or primary-text file opens with a provenance block. Not decoration: **`scripts/semantic-search.py` reads this block at index time and attaches it to every chunk from that file**, so when anyone — or any AI assistant — pulls a passage out of this repo, the citation arrives attached to it. The source can't get separated from the claim.

A file with no header gets flagged `(no source header — unverified provenance)` in every search result it produces. That's deliberate. Missing provenance should be loud.

The format (`christianity/Incoming/clementine-homilies-full-text.md` is the reference example):

```markdown
# Title of the Work

**Attribution:** Who wrote it, and what modern scholarship thinks of that claim
**Translation:** Translator, book title, publisher, year
**Original Language:** Greek / Hebrew / Aramaic / Coptic
**Estimated Date:** Composition date, with the scholarly range if contested
**Source:** Where this specific text came from — URL, edition, or "excerpt compilation"
**Contributed by:** Your name, and the date
**Note:** What it is and why it matters here
```

### Primary texts also get registered

If what you're adding is a *source* — an ancient text, a translation, an excerpt collection — it also gets a row in **`VERIFIED-SOURCES.md`**, in the right tier, with its edition and rights. That page is the list every AI assistant and every contributor uses to decide what may be quoted. A text that isn't on it can't be quoted, however good it is. The steps are at the bottom of that page.

### Put your name on what you bring

**`Contributed by:` is part of the header, and the indexer reads it** — so when someone pulls a passage out of this collection months from now, your name comes with it, right next to the source.

That is deliberate, and it cuts two ways on purpose. It's **credit**: you found the thing, and anyone who builds on it can see that. It's also **accountability**: if a citation turns out to be shaky, we know who to ask rather than guessing. Both matter, and the second one is why we're asking.

```markdown
**Contributed by:** Matt Fracek, 2026-10-06
**Contributed by:** Kam Waters, 2026-10-12 — from his own research notes on the Christspiracy sources
```

Add a line rather than replacing one when material gets built on:

```markdown
**Contributed by:** Kam Waters, 2026-10-12 (original material)
**Added by:** Rex, 2026-10-14 (cross-referenced against the Clementines, added the citation table)
```

**If you send us files rather than committing them yourself, we put your name in the header for you.** You don't have to do anything — just tell us who you are and, where it matters, where you got it.

One thing to be careful about: **don't add someone else's name to material they didn't vouch for.** If you're transcribing a conversation, summarizing a book, or passing along something a friend sent, the contributor is *you* — note the origin in `Source:` or `Note:` instead. Attribution is a claim about who stands behind the material, and it should only ever be made by the person standing behind it.

Research and analysis files can instead close with a bibliography line, which the indexer also reads:

```markdown
*Sources: Hebrew Bible (NRSV); Josephus, Antiquities (Whiston trans.); Hummel, The Rise and Fall of Dispensationalism (Eerdmans, 2023)*
```

**For in-copyright material, `christianity/dead-sea-scrolls/Incoming/dead-sea-scrolls-selected-texts.md` is the house model** — our own summaries plus short attributed excerpts, every quote carrying its translator inline (`"1QS 1:1-3, Vermes"`), and an explicit statement that it is *not* a full translation. Follow that pattern and we get the substance without the legal exposure.

### Keeping a full book in your own clone — the local-only pattern

You may want a whole book sitting in your copy so you can search it and work against it with an AI assistant, even though it can never be published here. **That works, and it's supported.**

Put it in a gitignored folder. The repo root already has one reserved: **`/Incoming/`** — gitignored, never pushed. Or make your own and add it to `.gitignore`:

```gitignore
# Local-only copies of in-copyright books. Never pushed, never indexed.
/my-books/
```

What you get: Obsidian reads it, Claude Code reads it, and `grep` finds it — because all of those read your disk. What you don't get: it is never committed, never pushed, and **never sent to the embedding API.**

That last part is the piece worth understanding, because it isn't automatic in most setups. **`scripts/semantic-search.py` consults `.gitignore` before indexing.** A rebuild uploads the text of every indexed file to Google, so "don't publish this" and "don't upload this" are deliberately the *same switch*:

> **If git won't push it, the indexer won't send it.**

The practical consequence: **gitignore is the one control you need.** One line in `.gitignore` and that book is yours alone — readable locally, invisible to GitHub and to any third-party API.

Two cautions. First, a gitignored file is only private on *your* machine; if you want the material in the shared collection, it has to go through the excerpt-and-cite pattern above. Second, **anything pushed to a public repo is in the history permanently**, even if you delete it in a later commit — so get the ignore rule in place *before* the first commit, not after. If something sensitive does land in history, stop and ask Matt or Rex rather than just deleting the file; removing it properly means rewriting history.

Current coverage, if you're looking for something useful to do: 93% of the transcript archive and 74% of `christianity/` carry provenance. Fourteen research files still don't — mostly `cliff-notes-quick-reference.md` files, which derive from already-sourced material. Adding headers there is genuinely valuable work, but **only from what the file already documents.** Never infer a source you can't confirm; that is how the three bad citations got in.

---

## What's Already In Here

281 markdown files, ~16 MB. Current as of 2026-10-06.

| Collection | Contents |
|---|---|
| **Primary texts** (`christianity/Incoming/`, `gnosticism/Incoming/`) | Gospel of Thomas, Didache, Clementine Homilies *and* Recognitions (both complete), Q-source reconstruction, Gospel of Philip, Apocryphon of John |
| **Dead Sea Scrolls** (`christianity/dead-sea-scrolls/`) | Curated selections (1QS, CD, 1QM, 1QHa, 4QMMT) with translator attributions, plus overview and cliff notes |
| **Ethiopian canon** (`christianity/ethiopian-bible/`) | 1 Enoch, Jubilees, Meqabyan, Shepherd of Hermas, Didascalia, Epistula Apostolorum |
| **Research & analysis** (`christianity/`, `gnosticism/`) | ~60 files: blood atonement, Trinity construction, the rapture's 1830s origin, Essene–Nazarene–Ebionite lineage, the Moses Scroll, James the Just, textual-criticism deep dives |
| **The questions** (`questions/`) | 14 cards on the hard questions (evidence, the pushback people raise, honest responses, one-sentence versions), a live-session playbook, and the citation-corrections log |
| **Lookup tools** | `TOPIC-INDEX.md` (claim → file + section) and `scripts/semantic-search.py` (meaning-based search across the whole repo) |

### The transcript archive (`podcast-archive/`)

| Source | Scope | Notes |
|---|---|---|
| **The Jesus Way** — Aaron Abke & James Benefico | 65 episodes | Complete. One gap: ep. 045 has captions disabled at the source and needs manual transcription. |
| **Dr. James Tabor** — his "Paul" playlist | 77 videos | The most processed set here: each file has a synthesized summary, key teachings, scripture citations and scholars cited, *plus* the raw transcript. See `podcast-archive/dr-tabor/00-overview.md`. |
| **Kam Waters** — Christspiracy / The Way Skool | 7 videos | Complete channel. One video is in Spanish and kept in the original. |

**These are auto-generated captions.** They contain typos, mangled names, and garbled Hebrew/Greek. Treat them as **pointers, not proof** — excellent for finding which thread to pull, never quoted as a source. Anything we stand behind gets traced to a primary text first. `CLAUDE.md` instructs every AI assistant working in this repo to follow that rule.

---

## How to Contribute

### First time: get access + tools
1. **Make a free GitHub account** at [github.com](https://github.com) if you don't have one — takes about two minutes. Then post your **GitHub username** in the group. (Username, not email — email invites only work if it's the exact address on your GitHub account, and otherwise they quietly go nowhere.) **Any maintainer can add you**; you don't need a specific person.
2. **Install [GitHub Desktop](https://desktop.github.com/)** — the free app that lets you clone, edit, and push **without the command line**. Easiest path for everyone.
3. In GitHub Desktop: **File → Clone repository → `the-nazarene/way`** → pick a local folder. Now you have your own copy on your machine.

### Making changes — two ways

**Quick edit (no app needed):** On [github.com](https://github.com/the-nazarene/way), open any file → click the **pencil ✏️** → edit → "Commit changes." Great for fixing a typo or adding a paragraph.

**Real work (GitHub Desktop):**
1. **Pull first** (top bar → "Pull origin") so you have everyone's latest changes.
2. Edit files in your text editor of choice (we use Markdown — plain text with light formatting).
3. Back in GitHub Desktop, write a short **summary** of what you changed → **Commit to main**.
4. Click **Push origin** to share it.

> **Golden rule:** *Pull before you push.* It avoids 95% of conflicts. With a handful of people on a text repo, conflicts are rare and easy to resolve.

### Bigger or experimental changes — use a branch
If you're reworking something substantial, create a **branch** (GitHub Desktop → "Current Branch" → New Branch), do your work there, then open a **Pull Request** on github.com. This keeps `main` clean and gives a natural checkpoint.

### Who reviews and merges — nobody in particular

**Any contributor with write access can review and merge any other contributor's work.** You do not need Matt or Rex. An earlier version of this file said "Matt/Rex review and merge" — that was wrong, and it made people wait on two specific humans for no good reason.

What a reviewer is actually checking is short and mostly mechanical:

- **Can every quote be traced to a real source?** If the source is a text we hold in `christianity/Incoming/` or `gnosticism/Incoming/`, grep it and confirm the wording. If it isn't, the citation needs enough detail that someone could look it up.
- **No absolutes** unless they're genuinely true — "never," "no manuscript," "every scholar," "nowhere else." These are what break most often. The narrower version almost always makes the same point.
- **Nothing quoted from `podcast-archive/`.** Those are auto-generated captions. Great for finding a thread, never a source.
- **Does the file have a provenance header?** See the source-header section above.

That's it. It isn't a taste judgment and it isn't a gate — it's a second pair of eyes on whether a claim can be checked. We found a run of citations that couldn't be, which is exactly why one more person glancing helps (`questions/CITATION-NOTES.md` has that story).

**Two places everyone slows down**, because the cost of being wrong is higher: `jesus-site-reference/` (published to the open web, read by strangers) and the primary texts in any `Incoming/` folder (the ground truth everything else gets checked against). Changes there want a careful look.

### Contributing without write access

You don't need to be added to anything. **Fork** the repo — your own complete copy under your own account, no permission required — make your changes there, and open a pull request. Any maintainer can review and merge it. That's the normal path for anyone outside the core group, and it's also a perfectly good path if you'd just rather work that way.

### What you're agreeing to

Whatever you contribute is given away on the same terms as everything else here: writing under **CC BY 4.0**, code under **MIT** (see `LICENSE-CONTENT.md` and `LICENSE`). Only contribute what's yours to give: your own words, public-domain texts, and short cited quotations.

---

## Folder & Naming Conventions

Match what's already here so the repo stays navigable:

- **Files & folders:** lowercase, hyphen-separated — `gospel-of-thomas-full-text.md`
- **Primary source texts:** live in an `Incoming/` subfolder or are labeled `*-full-text.md`
- **Section overviews:** `00-overview.md` at the top of a folder
- **Cliff notes:** `cliff-notes-quick-reference.md`
- **Dated research sessions:** `YYYY-MM-DD-topic.md`

Scope stays tight: Jesus directly, early Christianity, the distortion (Paul/Constantine/Augustine/Darby), and the recovery. Broader cross-tradition material lives upstream in `mr-pronoia`, not here — check before adding it.

---

## Using Claude (or any AI assistant) with this repo

This repo ships with a **`CLAUDE.md`** at the root. If you use **[Claude Code](https://claude.com/claude-code)** (or a similar agent) inside the repo folder, it reads that file automatically and gets fully oriented — the thesis, the tone, the source hierarchy, and what *not* to over-promote. That means everyone's AI assistant works from the *same* playbook, so contributions stay consistent instead of drifting.

If you bring an AI assistant into your work here:
- Let it read `CLAUDE.md`, `README.md`, and `00-OVERVIEW.md` first.
- Keep it honest to the source hierarchy — it should cite primary texts, not invent citations.
- Treat its output as a draft you verify, not gospel. Same standard we hold ourselves to.

### Which model, and when

The tradeoff is speed against depth, so pick deliberately:

| Model | Speed | Use it for |
|---|---|---|
| **Sonnet** or **Haiku** | Seconds | Citation lookups, finding a verse, checking a date, "where in the repo is…". Anything you need while a conversation is still on the topic. |
| **Opus** or **Fable** | A minute or two | Building an argument, weighing competing readings, synthesizing across sources. Noticeably better answers — worth the wait when you have it. |

For anything live — a conversation, a recording, a public Q&A — open **two sessions**: a fast model for lookups and a deep model for the hard questions. You never wait on the slow one for a quick answer, and the deep one keeps its train of thought instead of being interrupted by lookups.

And **load the key files before you start.** A cold session has to go searching; a warmed one has the material in context and answers immediately. `questions/LIVE-SETUP.md` has the exact warm-up prompt to paste.

---

## Handle With Care (don't propagate without review)

- **Essene Gospel of Peace (Szekely):** Scholarly consensus questions its provenance. Use with caveats; don't cite it as a verified ancient text.
- **Podcast transcripts** (`podcast-archive/`): Raw working material — research, not authoritative. Verify before quoting.
- **Anything marked `DRAFT`, `WORKING`, or `_private`:** Don't spread it without explicit review.
- **`mr-pronoia` is upstream.** Don't auto-sync between repos. If something here should flow back to mr-pronoia (or vice versa), flag it explicitly to Matt/Rex.

---

## Reading vs. Writing: Who Actually Needs Access

**This repo is public.** Anyone can read, clone, and use every file in it without an invitation — no account, no permission, nothing. That's worth saying plainly to new people, because it means most of them don't need access at all.

Three lanes. Two require nothing from us:

| Lane | What they do | Access needed |
|---|---|---|
| **Send it in** | Hand us files; we convert and file them with their provenance notes. | None |
| **Read and use** | Clone it, browse in Obsidian, point an AI assistant at it, pull updates whenever. | None — it's public |
| **Write directly** | Edit and push themselves. | Collaborator invite |

**Default to the first two.** Don't hand out write access pre-emptively at an onboarding meeting — not as gatekeeping, but because lane 2 already delivers the full value of the collection. Grant Write when someone is contributing often enough that routing through Matt or Rex has become the bottleneck, and they've said so.

Nothing here can be permanently broken — git keeps every version of every file, so any mistake is one `git revert` away. The reason to be deliberate isn't fear of data loss; it's that untangling a messy history costs someone an afternoon.

**If the contributor crew grows past a handful of writers,** turn on branch protection for `main` (Settings → Branches) requiring changes to arrive via Pull Request. That lets you be generous with access and still have every change reviewed before it lands. Anyone can also contribute via **fork + pull request** with no collaborator access at all — the standard open-source path.

### Permission levels

Reserve **Admin** for the core stewards (Rex, Matt, Kam). Admin includes destructive powers — deleting the repo, changing visibility, managing access — so keeping it to the inner circle protects the project while the contributor crew grows freely at Read or Write level.

---

## Reading the Files: Use Obsidian

The files are plain text, so any editor opens them. But [Obsidian](https://obsidian.md) is free and makes the collection genuinely pleasant to browse: choose **"Open folder as vault"** and point it at this repo folder.

You get the folder tree in a sidebar, rendered text instead of raw `#` symbols, instant full-text search across all 281 files, and the `[[links]]` between files become clickable. What's in that sidebar is literally the folder structure on disk — the same thing File Explorer shows. Nothing is hidden in a database.

Two notes: Obsidian edits the real files, so changes are local until you push them (it's a reader/editor, not a sync tool). And it creates a `.obsidian/` settings folder — already in `.gitignore`, so personal setups never get committed.

---

## Questions?

Open an **Issue** on the repo, or reach out to Matt or Rex directly. Welcome aboard — let's recover this thing together.
