# Roadmap Processing Workflow by Rex

How Rex's sessions turn what people send us (YouTube links, Google Drive folders, PDFs, books, transcripts) into an inventoried, credited, searchable, checked part of this repo. Written 2026-10-20 from the first full run: Craig Wescoe's *Panarion*, Chris Crutchfield's three YouTube links and Drive batch, Brad Brink's link, and the Whisper and guest-video work on Matt's channels.

Matt is writing his own version from the processing he does on his computer. The plan is to put the two side by side and build one shared workflow from what works in each. Section 13 lists the points to compare.

The live state of the work is in `PROCESSING-ROADMAP.md`. This file is the *method*.

---

## 1. The Goals

These are the goals at the top of `PROCESSING-ROADMAP.md`, refined over time:

1. **A full, thorough inventory.** Every item anyone sends is listed, with who contributed it, when, and where it lives. Nothing falls through the cracks, even if processing waits.
2. **Everything in Markdown.** PDFs, Word documents, transcripts and web pages all become Markdown, so the whole collection can be searched and read the same way.
3. **Process into research.** Read it, write notes, and feed what holds up into the research files.
4. **Publish only what we're allowed to.** The repo is public. Copyrighted books are converted too, but kept out of it.

## 2. Where This Comes From: the Gold Standard

`mr-pronoia/docs/gold-standard.md` set the sourcing rule for the whole knowledge base: **go to the source.** Every tradition gets a primary text, an overview, and cliff notes, and nothing enters without a traceable source.

This workflow is the same idea applied to incoming material:

| Gold Standard (mr-pronoia) | Here |
|---|---|
| Primary text in `Incoming/` | The source itself, converted to Markdown: a transcript, a book, a PDF. Public-domain and contributors' own work go in the repo; copyrighted works stay local |
| Overview | A series or channel overview (e.g. `podcast-archive/shabbat-studies/00-overview.md`) |
| Cliff notes | Per-item notes: summary, key points with timestamps, sources used, where it meets the repo, claims to check |
| Every claim traces to a text | Every note's quotations are checked against the transcript or a held text; nothing from a transcript is ever quoted as a source |

One addition the Gold Standard didn't need: **credit.** Material here comes from people in the community, so every item carries the name of whoever gave it to us.

---

## 3. The Pipeline at a Glance

| Stage | What happens | Done by | Cost |
|---|---|---|---|
| 1. Receive | Rex or Matt drops links into a session and says who they came from | Person | — |
| 2. Duplicate check | `python scripts/processing-status.py --check <links>` | Script | Free |
| 3. Log and credit | A row per item in the inventory, the contributor's name, a batch entry with a checklist | Claude (the session) | Small |
| 4. List everything | For channels and folders, list every item, including playlists and subfolders | Script (`yt-dlp`, a Drive lister); Haiku for a quick human-readable summary | Free or tiny |
| 5. Fetch | Captions, audio, PDFs | Scripts (`pull-transcripts.py`, `yt-dlp`, a Python Drive downloader) | Free |
| 6. Transcribe what has no captions | Local Whisper on the GPU | Script | Free |
| 7. Convert to Markdown | One file per work; multi-part PDFs joined in order | Script (`pdftotext`, `markitdown`) | Free |
| 8. Rights check | Public domain, contributor's own, or copyrighted (🔴) / unclear (⚠️) | Claude, with web checks | Small |
| 9. Notes | Per-item notes in the house format | Haiku for routine talks; Fable for dense or contested material | Main cost |
| 10. Overview | One page per series or channel, combined claims-to-check list | Fable | Moderate |
| 11. Verify | Quote checks, completeness counts, held-text checks, site build | Scripts plus the session | Small |
| 12. Integrate | Proposed changes to research files, approved before applying | Fable drafts; Rex or Matt approves | Moderate |
| 13. Save | Commit, push to `main`, refresh the status table | Session | Free |

---

## 4. Who Does What: Three Tiers

The rule of thumb Rex was given holds up: **don't spend a big model on mechanical work.** In practice there are three tiers, not two.

**Tier 0: scripts, no AI at all.** Listing channels, downloading captions and audio, Whisper transcription, PDF-to-Markdown conversion, ticking checklists, duplicate checks. These are free and exact. Most of the volume lives here. In this run, every one of the roughly 750 transcripts and all 65 PDFs went through Tier 0.

**Tier 1: Haiku, for structured, repeatable jobs.** A quick readable summary of what a channel contains. Notes in a fixed template on ordinary talks, where the job is summarizing what was said. Matt's notes on Scott's and Tabor's channels came from Haiku in batch, via `scripts/summarize-transcripts.py`, as did the notes on the Whisper and guest videos in this run. Every quoted line is checked against the transcript, and lines that fail are dropped.

**Tier 2: Fable (or Opus), for judgment.** This is what "high-level processing" means in practice:
- **Reading dense or contested material** and stating the argument fairly: a 27-hour study series, a 450,000-word book.
- **Checking claims against the texts we hold.** For example, finding that a book's Clementine quotations match our ANF texts word for word, while its dating of Irenaeus is wrong.
- **Catching what a summary would miss.** For example, that Snyder's *Nazarene Acts* adds "which is Y'shua" to Recognitions 1.39, and that David The Nazarene reads from that edition.
- **Synthesis:** merging ten chapters' claims-to-check into one list without duplicates.
- **Drafting changes to research files** that follow the repo's citation rules, and dropping the ones that don't hold.
- **Audits:** for example, checking every Panarion quotation in the repo against the held translation and the Greek.

Rule of thumb: if the output is a summary of one talk in a fixed shape, use Tier 1. If the output depends on comparing it with other sources, deciding what holds, or writing in the repo's own voice, use Tier 2.

---

## 5. Each Stage in Detail

### Receive, check, log

1. **Get the contributor's name.** If it isn't known yet, use a placeholder like "from 1234": the last four digits only, never a full phone number. Replace it when the name arrives.
2. **Check for duplicates first:** `python scripts/processing-status.py --check <url> ...`. It matches YouTube video, playlist and @handle IDs and Google Drive IDs anywhere in the repo. If the item is already here, credit the new sender too, as with Brad Brink and David The Nazarene, instead of adding it twice.
3. **Log before processing.** Add an inventory row: received date, contributor, item, type, link, where it lives, status. Then a batch entry in Batch Details with a checklist, and next steps in Next Up.

### List everything (the fine-tooth comb)

A link is rarely one thing. Before saying a link is "done," list everything it contains:
- **YouTube channel:** the videos, shorts and streams tabs, *and every playlist*. Playlists can hold videos missing from the videos tab (Scott had 21) and other creators' videos (Tabor's playlists held 4).
- **Playlist:** every item.
- **Drive folder:** every file, recursing into subfolders, such as "Homilies of Peter" inside "6_Books and PDFs." Note hints of a larger set; a folder called "6_..." suggests folders 1 to 5 may exist.

Then **re-audit against a fresh live listing** and count: on the source, downloaded, converted. This run's audits matched 65 of 65 PDFs and every channel video. The only gaps were other creators' uploads and system files.

### Fetch and transcribe

- **Captions:** make stub files, one per video, with header, source link, length and Contributed by. Then run `python scripts/pull-transcripts.py --source yt-dlp` on them. It writes timestamped paragraphs under `## Full Transcript`.
- **No captions:** download the audio with `yt-dlp -x` and transcribe locally with faster-whisper (large-v3-turbo) on the GPU. A 4.5-hour video took about 5 minutes. Say "Whisper transcript" in the file.
- **Drive:** list folders through Google's embedded folder view, and download through `drive.usercontent.google.com/download?id=...&confirm=t`. Everything goes into the git-ignored root `/Incoming/` first.

### Convert to Markdown

- `pdftotext -enc UTF-8` for PDFs with real text. Use `markitdown` for Word, PowerPoint and Excel. Scans need OCR, so flag them first.
- One Markdown file per *work*: join chapter PDFs in order, each under a `##` heading.
- **Verify the conversion.** Total words in the PDFs should match the Markdown. Sample the middle and end of every PDF and find them in the output. Count chapters or verses against the known structure: Enoch has 108 chapters, 1 Maccabees 924 verses, Jasher 91 chapters.
- **Primary texts** get the repo's provenance header, plus one verse or paragraph per line so exact-phrase search works. They're registered in `VERIFIED-SOURCES.md` in the right tier, with a Status line.

### Rights

- **🔴 Copyrighted:** we hold a full copy, but it never goes in the public repo. Notes and short quotes only. The flag goes on every listing, and on the top of the local copy.
- **⚠️ Rights unclear:** check before publishing or relying on it. Example: the Essene Gospel of Peace, which Rex decided to keep in the repo.
- **Free to download is not permission to republish.** Look for the author's actual terms. Two of the six copyrighted works said "All Rights Reserved" in the file itself.
- **Never push a copyrighted file, even briefly.** Git history keeps it forever. A public repo is public in every file, branch and commit. Copyrighted books go in a separate, private, invite-only repo, or stay local.
- **Prefer a public-domain counterpart** where one exists: Smith's Recognitions instead of Snyder's edition, and Charles's Enoch instead of the edited "simplified" one.

### Notes: the house format

For talks and series chapters:
- **Summary.**
- **Key Teachings,** with `[h:mm:ss]` timestamps.
- **Scripture Citations.**
- **Books, Scholars & Sources,** marking which are held in the repo.
- **Where This Overlaps the Repo,** with file pointers.
- **Claims to Check,** numbered, each saying why.

Matt's machine-written format adds Quotable Moments, Misconceptions, Connections and a Topics line from `podcast-archive/TOPICS.md`.

For books, use the same pattern by chapter, plus Key Arguments.

Rules for every note:
- **Pointers, not proof.** Nothing from a transcript is quoted as a source.
- **Attribute a view to a speaker only when the transcript makes the speaker clear.** Otherwise write "the hosts."
- **Quotation marks only for verbatim text,** checked against the transcript at its timestamp.
- **When a speaker quotes an early text, check it against the held text** and say whether it matches.
- **Describe, don't judge.** Contributors share this repo and read these notes. Corrections go in Claims to Check with the reason; verdicts on people go nowhere.
- **For copyrighted works:** our own summary, with one or two short attributed sentences at most.

### Overviews

One per series or channel, covering:
- The series in brief.
- A chapter guide.
- The main arguments, by theme.
- The combined sources.
- Where it meets the repo.
- **One de-duplicated claims-to-check list,** with each item listing every file it appears in.
- Questions for the hosts.

### Integrate: from notes to research

This is where the value is realized. Fable drafts proposals in `Incoming/proposals/`, which is local. Each proposal gives:
- The exact file and section.
- The proposed text.
- Why.
- **Verified:** the line in the held source.
- **Risk.**

Weak proposals are dropped with reasons. **Nothing changes in a research file until Rex or Matt approves.** Notes files don't need approval; research files, question cards and the site do.

---

## 6. Quality Checks We Run

| Check | How |
|---|---|
| Nothing missed | Re-list every link live and compare counts: on source, downloaded, converted |
| Conversion complete | Word totals match; middle and end of every source found in the output |
| Structure intact | Chapter and verse counts against the known structure; verse numbers parsed in sequence so a stray number can't split a verse |
| Quotes are real | Every quoted line found word for word near its timestamp, or in the held text |
| Copyright | Longest quotation from a copyrighted work per file (target: a sentence or two) |
| Tone | Search shared files for judgment words before pushing |
| Headers survive | After background jobs touch files, confirm credit and creator lines are still there |
| Site still builds | `python site/build.py` after any change to `site/data/cards/` |
| Claims about the repo | Before saying "the repo lacks X," search for it. This run once wrongly said we held only Enoch excerpts; we held all 108 chapters |

---

## 7. Decisions and Approvals

- **Judgment calls go in "Decisions Waiting"** in `PROCESSING-ROADMAP.md`, numbered D1, D2 and so on, and work continues. Rex and Matt review them in batches. Stop and ask only when the work is actually blocked.
- **Always needs approval:** edits to research files, cards and the site; publishing anything with unclear rights; anything outward-facing, like messages to authors or contributors.
- **Doesn't need approval:** inventory and credit, downloads into `/Incoming/`, conversions, notes files, roadmap updates.
- **Record decisions** with the date and who decided, e.g. "Decided 2026-10-20 (Rex): keep."

---

## 8. Git Hygiene

- **Save, push, merge** means commit to `main` and push. Branches and pull requests are for bigger or experimental work.
- **Stage specific files** while background jobs are writing into the same folder. Don't `git add` a whole folder another job is still changing.
- **If GitHub rejects a push,** someone else pushed. Pull with rebase. If the only conflict is the generated status table, keep theirs and re-run `python scripts/processing-status.py`.
- **Run the status script before every commit** that touches the archive, so the roadmap's numbers are true.
- **Check before pushing:** no copyrighted text, no phone numbers, and the `/Incoming/` folder still ignored (`git check-ignore`).

---

## 9. Costs and Efficiency (from this run)

Rough sizes, so future runs can be planned:

| Job | Tier | Approximate cost |
|---|---|---|
| Captions for ~750 videos, Whisper for 7, 65 PDFs to Markdown | 0 | Free; limited only by YouTube's rate limits, roughly 6-minute pauses after bursts |
| Listing a channel's contents | 0 (plus Haiku for a summary) | Tiny |
| Notes on four talks in the house format | 1 (Haiku) | About 120,000-150,000 tokens per batch of four |
| Notes on one long chapter or 5-11 videos, checked against held texts | 2 (Fable) | About 200,000-430,000 tokens per run |
| Notes on a large book | 2 (Fable) | Up to about 750,000 tokens; split books over 250,000 words across readers |
| Proposals or audits | 2 (Fable) | About 300,000 tokens |

Lessons:
- **The YouTube rate limit is the slowest step.** An Apify token, which `pull-transcripts.py` already supports, would turn hours into minutes for a few dollars.
- **Don't write notes on everything.** Raw transcripts are cheap to keep but crowd search results. Write notes on the most relevant items first; for David The Nazarene, 22 of 370.
- **Integration beats ingestion.** Once a batch has notes, turning findings into approved research changes adds more than processing the next batch.

---

## 10. Things That Went Wrong, and the Fix

| Problem | Fix |
|---|---|
| A command with 400+ file paths failed ("argument list too long") on Windows | Feed files in batches: `ls ... \| xargs -n 50 python scripts/pull-transcripts.py ...` |
| Windows security blocked the `gdown` downloader | A small Python downloader using Google's direct-download address |
| Whisper failed: an audio-library version mismatch, then a missing CUDA library | Decode audio with ffmpeg into memory; register the NVIDIA library folders in the script (`os.add_dll_directory`) |
| Claude Code reported a background download "stopped for low memory," but it kept running | Check running processes before restarting anything (`ps -ef \| grep pull-transcripts`) |
| An unrequested caution about a channel's titles went into a shared file | Removed. Rule: describe, don't judge; raise concerns in chat or Decisions Waiting |
| Labels like "low" and "sidelined" on a contributor's sources | Removed. Order of work goes in Next Up; descriptions stay neutral |
| A scripted find-and-replace double-flagged rows (🔴 \| 🔴) | Check for doubles after scripted edits; replace on exact rows |
| Rewriting JSON reformatted whole files | Edit only the changed strings in place; check the diff is a few lines |
| Said the repo held only Enoch excerpts (it held all 108 chapters) | Search the repo before claiming a gap |
| A rebase got stuck while a background job kept writing files | Finish manually: commit, `git rebase --quit`, point `main` at the commit, `git stash pop` |

---

## 11. Files and Tools

| What | Where |
|---|---|
| Live state: goals, Next Up, decisions, status, inventory, rights, intake rules | `PROCESSING-ROADMAP.md` |
| Status table, queue ticks, duplicate check | `scripts/processing-status.py` |
| Captions with timestamps | `scripts/pull-transcripts.py` |
| Machine-written notes in batch (Haiku, Batch API, needs an API key) | `scripts/summarize-transcripts.py` (Matt's) |
| Topic tags | `podcast-archive/TOPICS.md` |
| Which files can be quoted | `VERIFIED-SOURCES.md` |
| Citation errors already found | `questions/CITATION-NOTES.md` |
| Local-only staging (never pushed): Drive downloads, copyrighted Markdown, proposals, audio | `/Incoming/` |
| Notes on secondary and copyrighted works | `extended-library/` |
| Per-channel checklists | `podcast-archive/<channel>/00-queue.md` |

---

## 12. Working With Claude: the Session Habits That Worked

- **Start with a one-line plan, and give short updates.** End each turn with a recap of what's done, what's running, and what's next.
- **Ask "what's next on the processing roadmap?"** Claude answers from Next Up and the "Where We Are" checkpoint.
- **Background work for anything long:** downloads, Whisper, model runs. Then update the roadmap as each finishes.
- **One brief per subagent,** saying exactly which files it may edit ("replace only the *Notes pending* block; edit no other file"). Then verify its work before pushing: quote lengths, section counts, headers intact.
- **Checkpoint often:** save, push, merge, and update "Where We Are."

---

## 13. To Compare With Matt's Workflow

Points to line up when the two documents are merged:

1. **Notes model:** Matt ran Haiku in batch over whole channels (Scott, 84; Tabor, 398). Rex's sessions used Fable selectively on the most relevant items. When is each right? Possibly Haiku for every talk, then Fable for the top 10-20% and for anything feeding research files.
2. **Note template:** Matt's eight sections with Topics tags, against the Shabbat-style six with "Where This Overlaps the Repo" and "Claims to Check." These could become one template: Haiku sections plus a Fable "Claims to Check" pass on selected files.
3. **Quote checking:** Matt's script drops quotes not found near their timestamp, about 1.4% failed. Rex's subagents check by search. Make the script's check the standard for both.
4. **Fetching:** both use `pull-transcripts.py`. Agree on an Apify token for speed, and on where Whisper runs.
5. **Inventory:** one `PROCESSING-ROADMAP.md`, one `00-queue.md` per source, one status script. Agree that every queue row carries the video ID; the Tabor queue doesn't yet, which made the four guest videos harder to find.
6. **Approval line:** what each of us can change without the other: notes and inventory freely, research files after review.
7. **Copyright and private library:** the shared rules in section 5, and whether to create the private repo.
8. **Contributor consent:** Matt's item 2b, asking Scott and Dr. Tabor before their talks are public. Should that be a standard step for every creator's channel?
