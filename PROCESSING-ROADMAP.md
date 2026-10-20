# Processing Roadmap

Every source people hand us goes here: YouTube links, Google Drive links, PDFs, Word documents, transcripts. It's the full inventory, with the name of the person who gave it to us, and the order we're working through it. Nothing gets dropped. A backlog is fine as long as it's listed.

## Goals

We refine these over time. Change them here when Rex and Matt agree on something new.

1. **A full, thorough inventory.** Every item anyone sends us is listed, with who contributed it, when, and where it lives now. Nothing falls through the cracks, even if processing waits.
2. **Everything in Markdown.** PDFs, Word documents, transcripts, web pages: all of it gets converted to Markdown files, so it's saved in one format we can search and read efficiently.
3. **Process into research.** Once it's in Markdown, we read it, write notes, and feed what holds up into the research files.
4. **Publish only what we're allowed to.** The repo is public. Public-domain texts and contributors' own work go in the repo as full text. Copyrighted books are converted too, but kept out of the public repo; the repo gets notes and short quotes instead (see `CONTRIBUTING.md`).

## How Rex and Matt use this

1. **Drop the links into a Claude session** and say who they came from. Claude checks for duplicates, logs every item in the inventory below with the contributor's name, downloads it, and converts it to Markdown.
2. **Ask "what's next on the processing roadmap?"** Claude answers from the Next Up list.
3. **Claim an item** by putting your name in its Who column, so the two of you don't double up.
4. **After any processing,** run `python scripts/processing-status.py` to refresh the status table.

---

## Next Up

In order. Put your name in **Who** when you take one.

| # | Item | Contributed by | Who | Done |
|---|---|---|---|---|
| 1 | Scott's videos: Matt has processed these; push them and add them to the inventory | (Matt to fill in) | Matt | [ ] |
| 2 | Tabor material | (Matt to fill in) | Matt | [ ] |
| 3 | Name the contributor of the 2026-10-20 Google Drive batch (6 links, 11 works): Chris Crutchfield | Chris Crutchfield | Rex | [x] |
| 4 | Private library for the 🔴 copyrighted books: create a private repo (suggested `the-nazarene/way-library`) that only invited members can see, and Claude moves the PDFs and Markdown there. Until then they sit only on Rex's laptop and nobody else can reach them | Chris Crutchfield | Rex + Matt | [ ] |
| 4a | Ask the authors for permission to host their books in full: Douglas Del Tondo (*Jesus' Words Only*) and Yada Yah (*Questioning Paul*) first, since both share their work freely; then Jackson Snyder (*Nazarene Acts*), Manfred Davidmann, Walter Veith. Group to decide: ask, or sideline for now | Chris Crutchfield | Rex + group | [ ] |
| 5 | Public-domain Drive texts added and registered in `VERIFIED-SOURCES.md` (2026-10-20): 1 Maccabees (KJV Apocrypha, `christianity/Incoming/kjv-apocrypha/1-maccabees.md`, Tier 1) and the Book of Jasher (1840 translation, `christianity/Incoming/jasher-1840-full-text.md`, Tier 4 because it's medieval). Enoch and Jubilees were already held in full; Charles's 1917 Enoch added | Chris Crutchfield | Claude | [x] |
| 6 | Notes files for the two big Paul books, *Jesus' Words Only* (Del Tondo) and *Questioning Paul* (Yada Yah): summary, main arguments, claims to check. Both are already cited in Shabbat Studies Ch 4 and on David The Nazarene's channel | Chris Crutchfield | | [ ] |
| 7 | Shabbat Studies overview: one page on the series plus a single combined "claims to check" list (the chapter notes repeat several items) | Chris Crutchfield | | [ ] |
| 8 | Ask Chris for his sources: Joseph of Arimathea as Jesus's father; the Petrine text calling it "a religion of blood"; the Edomite priesthood since 160 BC | Chris Crutchfield | | [ ] |
| 9 | Feed Shabbat Studies material into research files: Ch 3 additions on sacrifice (1 Samuel 15:22, Hosea 4, Ahaz in 2 Kings 16, altar logistics); "cease from sacrificing" is Panarion 30.16.5, not the Clementines; Ch 4D's Galatians 3 material matches `OPEN-RESEARCH.md` item 2 | Chris Crutchfield | | [ ] |
| 10 | Finish David The Nazarene transcripts (download stopped at 99 of 370; YouTube rate-limits it; an Apify token would finish it in minutes) | Chris Crutchfield | | [ ] |
| 11 | Confirmed 2026-10-20: David The Nazarene is David H. Notsari, guest on The Jesus Way episode 23. That episode's description links "David Notsari YT" to a David The Nazarene video, and his own video descriptions link to his Odysee account @DavidHNotsari | Chris Crutchfield | Claude | [x] |
| 12 | Pull SixSeven Podcast transcripts (34) | Chris Crutchfield | | [ ] |
| 13 | Notes on David The Nazarene, starting with the Paul, sacrifice and Ebionite series | Chris Crutchfield | | [ ] |
| 14 | Audit the Panarion passages we quote (Nazarenes, Ebionites) against the Greek | Craig Wescoe | | [ ] |
| 15 | Read SixSeven Podcast transcripts and decide what, if anything, goes deeper | Chris Crutchfield | | [ ] |

---

## Status

<!-- STATUS:START -->
*Generated by `python scripts/processing-status.py` on 2026-10-20. Don't edit by hand.*

| Source | Contributed by | Items | Transcripts | Notes | Queue |
|---|---|---|---|---|---|
| David The Nazarene | Chris Crutchfield, 2026-10-19; Brad Brink, 2026-10-20 | 370 | 115 of 370 | 0 of 370 | [queue](podcast-archive/david-the-nazarene/00-queue.md) |
| Shabbat Studies with Jen & Chris | Chris Crutchfield, 2026-10-19 | 10 | 10 of 10 | 10 of 10 | [queue](podcast-archive/shabbat-studies/00-queue.md) |
| SixSeven Podcast | Chris Crutchfield, 2026-10-19 | 34 | 0 of 34 | 0 of 34 | [queue](podcast-archive/sixseven-podcast/00-queue.md) |
<!-- STATUS:END -->

---

## Copyrighted Works We Hold

🔴 **Copyrighted.** We have a full copy, but it can't go in the public repo. The repo gets notes and short attributed quotes only, unless the author gives permission.
⚠️ **Rights unclear.** Check before publishing or relying on the full text.

| | Work | Author | Format | Full copy held | Where | Contributed by |
|---|---|---|---|---|---|---|
| 🔴 | *Jesus' Words Only* (2007 edition) | Douglas Del Tondo | Book, 23 chapters and appendices | Yes: 23 PDFs + 1 Markdown file | Rex's local `/Incoming/drive-2026-10-20/` | Chris Crutchfield |
| 🔴 | *Questioning Paul: Apostle or False Prophet* | Yada Yah | Book, 13 chapters | Yes: 13 PDFs + 1 Markdown file | Rex's local `/Incoming/drive-2026-10-20/` | Chris Crutchfield |
| 🔴 | *The Nazarene Acts of the Apostles* ("True Names Translation" of the Recognitions of Clement) | Jackson H. Snyder, Theodore A. Dornan, Chris Plourde (© 2007-2010) | Book | Yes: 1 PDF + 1 Markdown file | Rex's local `/Incoming/drive-2026-10-20/` | Chris Crutchfield |
| 🔴 | "Origin of Christianity and Judaism" | Manfred Davidmann (© 1994) | Web article | Yes: 1 PDF + 1 Markdown file | Rex's local `/Incoming/drive-2026-10-20/` | Chris Crutchfield |
| 🔴 | "Denominational Testimony" | Walter J. Veith (2009, amazingdiscoveries.org) | Web article | Yes: 1 PDF + 1 Markdown file | Rex's local `/Incoming/drive-2026-10-20/` | Chris Crutchfield |
| 🔴 | "Where did the term 'Christian' come from?" | Not named | Web article | Yes: 1 PDF + 1 Markdown file | Rex's local `/Incoming/drive-2026-10-20/` | Chris Crutchfield |
| ⚠️ | *Essene Gospel of Peace*, Book 1 | Edmond Bordeaux Szekely (1937) | Book | Yes, as full text **in the public repo**. Rex, 2026-10-20: keep it in the repo | `christianity/Incoming/essene-gospel-of-peace-book-1-full-text.md` | (predates this log) |
| ⚠️ | Book of Enoch, "Simplified Version" | Charles's public-domain translation, edited by sherryshriner.com | Book | Yes: 1 PDF + 1 Markdown file. Rex, 2026-10-20: keep it | Rex's local `/Incoming/drive-2026-10-20/` | Chris Crutchfield |

**These books have never been in the public repo.** They were downloaded straight from Chris's Google Drive links into the git-ignored `/Incoming/` folder inside Rex's local copy of the repo. Git's history on every branch confirms none of them was ever committed. Only the inventory (titles, authors, rights notes) is public.

**Where these can live.** A public repo is public all the way through: every file, every branch, and the full history. Deleting a file later doesn't remove it from the history. So copyrighted books go in a separate **private** repo (invite-only), not in a hidden folder here. A private copy keeps them out of public view but isn't a license; asking the authors is still the clean answer.

**Rights check (2026-10-20).** Nothing found gives permission to republish any of the 🔴 works:

- *The Nazarene Acts* and Davidmann's article print "All Rights Reserved" in the files themselves.
- yadayah.com, the home of *Questioning Paul*, carries "Copyright 2001-2026".
- *Jesus' Words Only*: its old site jesuswordsonly.com now belongs to someone else, and no license was found.
- Veith's article and the unnamed "Christian" article: no license found, so normal copyright applies.

Being free to download is not the same as permission to republish. To host any of them in full, we need the author's written permission. Del Tondo and Yada Yah look like the likeliest yeses.

**Public-domain counterparts in the repo:** Thomas Smith's Recognitions (`clementine-recognitions-full-text.md`) for the Nazarene Acts; R. H. Charles's Enoch, both the 1913 text in `ethiopian-bible/unique-ethiopian-texts.md` and the 1917 text in `christianity/Incoming/book-of-enoch-charles-1917-full-text.md`, for the simplified Enoch. The Essene Gospel of Peace's 1937 copyright depends on renewal records; it stays in the repo by Rex's decision.

---

## Inventory

Every item, newest first. One row per link or file as it was given to us.

| Received | Contributed by | Item | Type | Link | Where it lives | Status |
|---|---|---|---|---|---|---|
| 2026-10-20 | Matt (source: Scott) | Scott's videos | Videos | (Matt to fill in) | Not yet pushed | Matt has processed; push pending |
| 2026-10-20 | Matt | Tabor material | (Matt to fill in) | (Matt to fill in) | Not yet pushed | In progress with Matt |
| 2026-10-20 | Chris Crutchfield | "6_Books and PDFs": Clementine Homilies (21 PDFs), 🔴 Nazarene Acts / Recognitions (copyrighted), Book of Jasher, Jubilees ch 1-9, 1 Maccabees, ⚠️ Book of Enoch "simplified" (rights unclear) | Drive folder, 26 PDFs | [folder](https://drive.google.com/drive/folders/1ZV-BJkxRrj1EaC60aYkZ2IFeYxCA012k) | Local `/Incoming/drive-2026-10-20/` | Downloaded, converted to Markdown |
| 2026-10-20 | Chris Crutchfield | 🔴 Copyrighted: *Questioning Paul: Apostle or False Prophet*, Yada Yah | Drive folder, 13 PDFs | [folder](https://drive.google.com/drive/folders/1Xt5QPXDzA_blh-zufAt1BySAgPWazCNZ) | Local `/Incoming/drive-2026-10-20/` | Downloaded, converted to Markdown |
| 2026-10-20 | Chris Crutchfield | 🔴 Copyrighted: *Jesus' Words Only*, 2007 edition, Douglas Del Tondo | Drive folder, 23 PDFs | [folder](https://drive.google.com/drive/folders/1DDHS1TRt8TzfllAVI54iw7JqOAoGxZzP) | Local `/Incoming/drive-2026-10-20/` | Downloaded, converted to Markdown |
| 2026-10-20 | Chris Crutchfield | 🔴 Copyrighted: "Denominational Testimony", Walter J. Veith (amazingdiscoveries.org, 2009) | Drive file, PDF of a web article | [file](https://drive.google.com/file/d/1NM8ZcNYcKq4WofJwDLZLjylzplsrT67r/view) | Local `/Incoming/drive-2026-10-20/` | Downloaded, converted to Markdown |
| 2026-10-20 | Chris Crutchfield | 🔴 Copyrighted: "Origin of Christianity and Judaism", Manfred Davidmann (1994) | Drive file, PDF of a web article | [file](https://drive.google.com/file/d/1Fhq9e0xjtiB5PIg0vx41a4E_REl5diHD/view) | Local `/Incoming/drive-2026-10-20/` | Downloaded, converted to Markdown |
| 2026-10-20 | Chris Crutchfield | 🔴 Copyrighted: "Where did the term 'Christian' come from?" (web article, author not named) | Drive file, PDF of a web article | [file](https://drive.google.com/file/d/1RSMPF_pbLh4KighuyxeHOup_JSKz0i7B/view) | Local `/Incoming/drive-2026-10-20/` | Downloaded, converted to Markdown |
| 2026-10-19 | Chris Crutchfield | Shabbat Studies with Jen & Chris: who Jesus was, how the Bible was assembled, priests vs. prophets on sacrifice, Paul, recap | YouTube playlist, 10 videos, about 27 hours | [playlist](https://www.youtube.com/playlist?list=PLDRRnEIEvT3ITdxgosym8jwlvigIT4vrx) | `podcast-archive/shabbat-studies/` | Transcripts and notes done |
| 2026-10-19 | Chris Crutchfield; also sent by Brad Brink on 2026-10-20 | David The Nazarene (David H. Notsari, guest on The Jesus Way ep. 23): Nazarene/Ebionite teaching on Jesus and Paul, sacrifice, diet, James, Dead Sea Scrolls, Revelation, readings from *The Rock of a Sure Foundation* | YouTube channel, 369 videos + 1 short | [@DavidTheNazarene](https://www.youtube.com/@DavidTheNazarene) | `podcast-archive/david-the-nazarene/` | Transcripts in progress |
| 2026-10-19 | Chris Crutchfield | SixSeven Podcast: current events, end times, conversations with guests. Claude flagged as mostly outside this repo's core topics; read before deciding | YouTube channel, 34 videos | [@SixSevenPodcast](https://www.youtube.com/@SixSevenPodcast) | `podcast-archive/sixseven-podcast/` | Listed, transcripts not started |
| 2026-10-17 | Craig Wescoe | Epiphanius, *Panarion*: complete translation from the Greek (Holl and Dindorf editions), public domain | Text, 3 files | PR #14 | `christianity/Incoming/epiphanius-panarion-book-{1,2,3}-full-text.md` | Merged, registered in `VERIFIED-SOURCES.md`; audit not started |

## Contributors

| Name | What they've sent | First contribution |
|---|---|---|
| Craig Wescoe | Epiphanius, *Panarion* | 2026-10-17 |
| Chris Crutchfield | Shabbat Studies with Jen & Chris, David The Nazarene, SixSeven Podcast (YouTube); Google Drive batch of 11 works (3 folders, 3 files) | 2026-10-19 |
| Brad Brink | David The Nazarene (YouTube channel; also sent by Chris) | 2026-10-20 |
| Matt Fracek | Scott's videos, Tabor material (in progress) | 2026-10-20 |

Every file made from a contribution carries a `**Contributed by:**` line with the person's name and the date.

---

## Intake Rules

For Claude and for anyone adding sources by hand.

**Every time**

1. **Check for duplicates first.** Run `python scripts/processing-status.py --check <link> [<link> ...]`. It reports anything already in the repo and where.
2. **Log it in the inventory before processing it,** even if processing is weeks away. Date received, who gave it to us, what it is, the link.
3. **Credit the contributor** in the inventory, the contributors table, and a `**Contributed by:** Name, date` line in every file made from it. If the name isn't known yet, use a placeholder like "from 1234" (last four digits only, never a full phone number) or "not yet named", and replace it when we learn the name.
4. **Convert to Markdown.** Every file ends up as Markdown, one file per work (join multi-part PDFs in order).
5. **Check the rights before anything goes public, and never push a copyrighted file even briefly** (git history keeps it forever). Public domain or the contributor's own work: full text in the repo. Copyrighted: Markdown stays out of the public repo; the repo gets notes. Mark it 🔴 (or ⚠️ if unclear) everywhere it's listed, and add it to Copyrighted Works We Hold.
6. **Describe, don't judge.** Contributors share this repo and read this file. Say what a source covers. Order of work goes in Next Up, not in labels on the source.
7. **Add the next steps to Next Up** with the contributor's name.

**By type**

| What we get | What to do |
|---|---|
| A YouTube video, playlist or channel | List every video with `yt-dlp --flat-playlist`, including the channel's playlists (they can hold videos missing from the videos tab). Make a folder in `podcast-archive/<creator>/` with one file per video (header: title, creator, source link, length, Contributed by) and a `00-queue.md` checklist. Pull captions with `python scripts/pull-transcripts.py`. |
| A video with no captions | Download the audio and transcribe locally with Whisper (large-v3-turbo), as done for Jesus Way 045 and Shabbat Studies Ch 2. Say so in the transcript note. |
| A transcript someone already made | Put it in the matching `podcast-archive/` file under `## Full Transcript`, and note who made it and how. |
| A Google Drive file or folder | Download into the root `/Incoming/` folder (local only, never pushed). Public links download directly; if it's private, ask the contributor to set "anyone with the link." List subfolders too. |
| A PDF with real text | Convert with `pdftotext` (installed) or `markitdown`. Check the result reads in order. |
| A scanned PDF (images, no text) | Needs OCR. Flag it in the batch details before converting. |
| A Word document or Google Doc | Convert with `markitdown` (`uvx --from "markitdown[docx]" markitdown file.docx`), or export a Google Doc as Markdown. |
| A book or primary text | Public domain or the contributor's own work: `christianity/Incoming/` with a full source header, then register in `VERIFIED-SOURCES.md`. Copyrighted: keep the Markdown private and write a notes file for the repo. |
| A website or article | Save the link and a short description in the inventory. Quote only short attributed excerpts. |

**Notes are pointers, not proof.** Notes record what a source argues and list "claims to check." Nothing from a transcript or secondary book is quoted as a primary source. See `questions/CITATION-NOTES.md`.

---

## Batch Details

### 2026-10-20 — Google Drive batch from Chris Crutchfield

Sent by Chris Crutchfield, passed on by Rex: 3 folders and 3 single files. All six links were public and all 65 PDFs downloaded. All have real text (no scans). Converted to 11 Markdown files, one per work, about 1.16 million words in total. Everything sits in Rex's local `/Incoming/drive-2026-10-20/` (PDFs, plus `markdown/`) until each item's rights are settled.

| Work | Author / translator | Words | Rights | Already in repo? | Needs attention |
|---|---|---|---|---|---|
| Clementine Homilies (21 PDFs, New Advent printouts) | Thomas Smith et al., Ante-Nicene Fathers vol. 8 (1886) | 114,000 | Public domain translation | Yes, `christianity/Incoming/clementine-homilies-full-text.md` (same ANF translation) | Duplicate in content; keep as a cross-check only. The repo file's header names Peter Peterson and New Advent names Thomas Smith; the ANF volume credits its Clementine translations to more than one translator, so the repo header is worth checking |
| 🔴 *The Nazarene Acts of the Apostles* (Recognitions of Clement, "True Names Translation") | Jackson H. Snyder, Theodore A. Dornan, Chris Plourde, on Thomas Smith's translation | 135,000 | © 2007-2010 Jackson H. Snyder, all rights reserved | Smith's public-domain Recognitions is, as `clementine-recognitions-full-text.md` | Can't publish in full. Likely the "Nazarene Acts" text David The Nazarene reads on his channel |
| Book of Jasher | J.H. Parry edition (1887) of the 1840 translation | 175,000 | Public domain | Added 2026-10-20: `christianity/Incoming/jasher-1840-full-text.md` (Tier 4, medieval) | Done. The modern web introduction was left out |
| Book of Jubilees, chapters 1-9 only | R.H. Charles translation, via theforbiddenknowledge.com | 13,000 | Translation public domain | Yes, in full: Charles 1913, all 50 chapters, in `ethiopian-bible/unique-ethiopian-texts.md` | Nothing to add; the Drive copy is a partial duplicate |
| 1 Maccabees ("version 2") | KJV Apocrypha | 25,000 | Public domain | Added 2026-10-20 from Gutenberg #124: `christianity/Incoming/kjv-apocrypha/1-maccabees.md` | Done |
| ⚠️ Book of Enoch, "Simplified Version" | Charles-based text edited by sherryshriner.com | 39,000 | Base text public domain; the edits are unclear | Yes, in full: Charles 1913 (all 108 chapters) in `ethiopian-bible/unique-ethiopian-texts.md`, and Charles 1917 added 2026-10-20 as `christianity/Incoming/book-of-enoch-charles-1917-full-text.md` | Kept locally by Rex's decision; use Charles for anything public |
| 🔴 *Jesus' Words Only* (2007), 23 chapters and appendices | Douglas Del Tondo | 188,000 | Copyrighted (appears to be distributed free online by the author) | No | Notes file for the repo; full text only with the author's permission |
| 🔴 *Questioning Paul* (13 chapters) | Yada Yah (pen name) | 452,000 | Copyrighted (appears to be distributed free online) | No | Notes file for the repo; full text only with permission. Very large |
| 🔴 "Origin of Christianity and Judaism" | Manfred Davidmann | 14,000 | © 1994, all rights reserved | No | Notes only |
| 🔴 "Denominational Testimony" | Walter J. Veith (amazingdiscoveries.org) | 1,000 | Copyrighted web article | No | Notes only; it's mostly quotations from denominational sources, which can be cited directly |
| 🔴 "Where did the term 'Christian' come from?" | Not named (cites fossilizedcustoms.com) | 3,500 | Copyrighted web article | No | Notes only. Several of its claims overlap the Shabbat Studies "claims to check" (Christos and Mithras) |

**Audit of this batch (re-checked 2026-10-20 against a fresh listing of all six links):** 67 items on Drive: 65 PDFs and 2 `.DS_Store` files (hidden Mac settings files, not documents, skipped on purpose). All 65 PDFs downloaded, and every PDF's text is in the Markdown (1,159,352 words in the PDFs; the Markdown adds only headings). The folder name "6_Books and PDFs" suggests it may be one of a numbered set. Worth asking the contributor whether folders 1 to 5 exist.

### 2026-10-19 — Three YouTube links from Chris Crutchfield

**Sent by:** Chris Crutchfield, texted to Rex in the group chat.
**Whose content:** Chris's own work plus one teacher he follows. Per the Shabbat Studies descriptions, the series is hosted by Jen and her husband Chris, and "Chris is @SixSevenPodcast."
**Plan:** pull every transcript from all three links, then read and decide what goes deeper.

**Completeness audit (2026-10-20):** every video on both channels' videos, shorts and live tabs, every Shabbat Studies video, and every video in both channels' playlists was checked against the archive. Everything David, Chris and Jen made is listed. Not listed, because other creators made them: one video by another channel inside David's "Seek First God's Justice" playlist ("Righteousness or Justice?", https://www.youtube.com/watch?v=jdcIkbAMWKA), and four videos in David's Favorites list (plus one private or deleted).

**Shabbat Studies processing (six chunks, done)**

- [x] Chunk 0: Ch 5, The Great Recap. The hosts call it the short version of the series, so it served as the map.
- [x] Chunk 1: Ch 1, Who is Jesus and What Was His Purpose?
- [x] Chunk 2: Ch 2, How We Got the Bible(s) We Have Today (transcribed locally with Whisper; no captions on YouTube)
- [x] Chunk 3: Ch 3A to 3C, Priests vs. Prophets and the Sacrifice System
- [x] Chunk 4: Ch 4A and 4B, The One about Paul, part one
- [x] Chunk 5: Ch 4C and 4D, The One about Paul, part two

Each chapter file has Summary, Key Teachings with timestamps, Scripture Citations, Books and Sources, Where This Overlaps the Repo, and Claims to Check.

### 2026-10-17 — Epiphanius, Panarion, from Craig Wescoe

**Sent by:** Craig Wescoe, via pull request #14.
**Content:** Craig's translation. Machine translation from the Greek of the Holl and Dindorf editions, checked by Craig, released to the public domain.

- [x] Contributor named and credited in file headers
- [x] Editions and rights stated in file headers
- [x] Registered in `VERIFIED-SOURCES.md` (Tier 1, held, not yet audited)
- [ ] Audited against the Greek for the passages we actually quote (Nazarenes, Ebionites)
