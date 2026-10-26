# Processing Roadmap

Every source people hand us goes here: YouTube links, Google Drive links, PDFs, Word documents, transcripts. It's the full inventory, with the name of the person who gave it to us, and the order we're working through it. Nothing gets dropped. A backlog is fine as long as it's listed.

## Goals

We refine these over time. Change them here when Rex and Matt agree on something new.

1. **A full, thorough inventory.** Every item anyone sends us is listed, with who contributed it, when, and where it lives now. Nothing falls through the cracks, even if processing waits.
2. **Everything in Markdown.** PDFs, Word documents, transcripts, web pages: all of it gets converted to Markdown files, so it's saved in one format we can search and read efficiently.
3. **Process into research.** Once it's in Markdown, we read it, write notes, and feed what holds up into the research files.
4. **Publish only what we're allowed to.** The repo is public. Public-domain texts and contributors' own work go in the repo as full text. Copyrighted books are converted too, but kept out of the public repo; the repo gets notes and short quotes instead (see `CONTRIBUTING.md`).

## How Rex and Matt use this

The full method (stages, which model does what, quality checks, rights, git habits, lessons learned) is in `ROADMAP-PROCESSING-WORKFLOW-REX.md`. Matt is writing his own; the two will be merged into one shared workflow.

1. **Drop the links into a Claude session** and say who they came from. Claude checks for duplicates, logs every item in the inventory below with the contributor's name, downloads it, and converts it to Markdown.
2. **Ask "what's next on the processing roadmap?"** Claude answers from the Next Up list.
3. **Claim an item** by putting your name in its Who column, so the two of you don't double up.
4. **After any processing,** run `python scripts/processing-status.py` to refresh the status table.

---

## Where We Are

*Checkpoint 2026-10-20. Update this section at every checkpoint; the details live in Next Up, Decisions Waiting and the inventory below.*

**Done**
- **Craig Wescoe:** Epiphanius, *Panarion*, merged and registered as a source (audit of quoted passages still open).
- **Chris Crutchfield, YouTube:** every video from all three links listed (414) with Chris credited on each; Shabbat Studies fully transcribed (Ch 2 via local Whisper), notes on all 10 chapters, and a series overview with one combined claims-to-check list; David The Nazarene confirmed as David H. Notsari (Jesus Way ep. 23); 22 of David's most relevant videos have notes.
- **Chris Crutchfield, Google Drive:** all 65 PDFs downloaded and converted to Markdown (11 works); public-domain texts added and registered (1 Maccabees, Book of Jasher, plus R. H. Charles's 1917 Enoch); notes written for all six 🔴 copyrighted works; copyright check done (no permission to republish found).
- **Matt Fracek:** Scott's Nazarene Way channel (84 videos) and the rest of Dr. Tabor's channel (398) with transcripts and notes.
- **Fixes to the repo found along the way:** Clementine Homilies translator credits corrected (Smith, Peterson, Donaldson), including five public site citations.

**Running**
- David The Nazarene transcripts (download in progress; SixSeven Podcast is queued after it).

**Next, Claude can do**
- More David The Nazarene notes, most relevant videos first (Next Up 13).
- Whisper transcripts for the five videos with no captions (Next Up 2c).
- Audit the Panarion passages the repo quotes (Next Up 14).
- Sabbath-to-Sunday research from Veith's public-domain sources (Next Up 6c).
- The four Tabor guest appearances on other channels (Next Up 2d).

**In progress 2026-10-21** (all on Opus 5.5)
1. Audit worksheet A2-A15 (Next Up 17): done; ready to share.
2. Opus-versus-Fable test (Next Up 16): done; Opus matched Fable, so it stays the default.
3. Sabbath-to-Sunday research draft (Next Up 6c): drafted, waiting on review (D7).
4. Downloads retried for the 85 missing transcripts (82 David The Nazarene, 3 SixSeven).

**Done 2026-10-26**
- **Sources:** 12 church-father texts and 3 Bibles (Westcott-Hort Greek NT, Brenton's Septuagint, JPS 1917) added and registered (Next Up 18).
- **David The Nazarene:** 22 more videos with notes, 68 of 370 (Next Up 13). **SixSeven:** notes on all 31 transcribed episodes and a series overview (Next Up 15).
- **Transcripts:** every David The Nazarene and SixSeven video now has one. The last 58 had no captions and were transcribed locally with Whisper (Next Up 10, 12).
- **Audit list:** A23-A30 added from the new notes; A8's two sources are now held.
- **Christian Florez:** research sheet "The Red Letters That Were Added" converted, read, checked against held texts and mapped against the repo (Next Up 19). Seven possible problems in our own files are on the audit list (A16-A22).
- **Claims list (new):** `claims/` holds one entry per checked claim about what a source says, so each claim is checked once. Started with 98 entries from the Florez checks and the church-father checks; `python scripts/claims.py check` confirms every quotation in it against the held text, on every push (Next Up 21).
- **Search site:** syncs now start from the last one that succeeded, so a failed sync is caught up by the next push. The failures on 2026-10-26 were the script sending 1,000 ids per delete when Cloudflare takes 100 (fixed).

**Waiting on people**
- Rex: which item 9 research-file changes to apply (D1); create the private library repo (D5); send Chris the source questions (Next Up 8).
- Group: ask the authors for permission, or sideline (D4).
- Matt: ask Scott and Dr. Tabor about their talks being public (Next Up 2b).
- Rex: send Christian Florez the points to check (Next Up 19b); pick the card additions (D9).

---

## Next Up

In order. Put your name in **Who** when you take one.

| # | Item | Contributed by | Who | Done |
|---|---|---|---|---|
| 1 | Scott's videos done 2026-10-20: `podcast-archive/scott-nazarene-way/`, 84 videos (63 on the videos tab plus 21 found only in his playlists, mostly his Matthew 12-13 sermons). 83 transcripts, 79 with notes; the four Nazarene Music songs have no notes, #74 has no captions | Matt Fracek (Scott's own channel) | Matt | [x] |
| 2 | Tabor's channel done 2026-10-20: `podcast-archive/dr-tabor-channel/`, 321 new talks with transcripts and notes (275 main, 46 in `background/`); the 77 Paul-playlist videos already in `dr-tabor/` are linked from the queue. 85 not added (Waco, promos and personal clips, astrology, the Turin Shroud, general archaeology, no captions); reasons in the queue | Matt Fracek | Matt | [x] |
| 2a | Notes for Scott's and Tabor's talks are machine-written (Claude Haiku 5.5 via `scripts/summarize-transcripts.py`): Summary, Key Teachings, Scripture, Sources, Quotable Moments, Misconceptions, Connections, Books. Every quote was checked word-for-word against the captions near its timestamp (about 1.4% failed and were dropped). Each file has **Speakers**, **Published** and **Topics** lines; the topic list and its mapping to the question cards are in `podcast-archive/TOPICS.md`. Spot-read before relying on any one file | Matt Fracek | Matt | [x] |
| 2b | Ask Scott whether he's happy for his talks to be public in the repo (he's in the group). Ask Dr. Tabor too, ideally before the site links to these | Matt Fracek | Matt | [ ] |
| 2c | Whisper transcripts done 2026-10-20 (local, free) with notes in Matt's format (Claude Haiku, every quote checked against the transcript): Scott #74 "The Sign of Jonah"; Tabor #237 (origins of preterism, in `background/`) and #416 (lead isotopes, Talpiot tomb, 5-minute clip, partly Hebrew). Tabor #46 (Mandaean baptism): the content is on-screen text over ritual footage, so Whisper caught only greetings; reading the on-screen text would need someone to watch it. Tabor #22 (Essene Gate slides): no speech at all | Matt Fracek | Claude | [x] |
| 2d | Four videos from other channels found in Tabor's playlists, now in `podcast-archive/dr-tabor-channel/other-channels/`: MythVision's "A NEW Covenant 200 Years BEFORE Jesus", "Saved By FAITH 150 Years BEFORE Jesus" and "Top 4 Reasons Jesus WOULDN'T EXIST without THEM" (Tabor as guest), and C. J. Cornthwaite's Steve Mason interview on Josephus and Luke. These are the only other-channel videos in his 22 playlists. Done 2026-10-20: transcripts (three from captions, "Saved By FAITH" via local Whisper) and notes in the house format (Claude Haiku, all 29 quotes checked). Listed at the end of the Tabor queue | Matt Fracek | Claude | [x] |
| 3 | Name the contributor of the 2026-10-20 Google Drive batch (6 links, 11 works): Chris Crutchfield | Chris Crutchfield | Rex | [x] |
| 4 | Private library for the 🔴 copyrighted books: create a private repo (suggested `the-nazarene/way-library`) that only invited members can see, and Claude moves the PDFs and Markdown there. Until then they sit only on Rex's laptop and nobody else can reach them | Chris Crutchfield | Rex + Matt | [ ] |
| 4a | Ask the authors for permission to host their books in full: Douglas Del Tondo (*Jesus' Words Only*) and Yada Yah (*Questioning Paul*) first, since both share their work freely; then Jackson Snyder (*Nazarene Acts*), Manfred Davidmann, Walter Veith. Group to decide: ask, or sideline for now | Chris Crutchfield | Rex + group | [ ] |
| 5 | Public-domain Drive texts added and registered in `VERIFIED-SOURCES.md` (2026-10-20): 1 Maccabees (KJV Apocrypha, `christianity/Incoming/kjv-apocrypha/1-maccabees.md`, Tier 1) and the Book of Jasher (1840 translation, `christianity/Incoming/jasher-1840-full-text.md`, Tier 4 because it's medieval). Enoch and Jubilees were already held in full; Charles's 1917 Enoch added | Chris Crutchfield | Claude | [x] |
| 6 | Notes files done 2026-10-20: `extended-library/jesus-words-only-notes.md` (all 18 chapters and 4 appendices, 13 key arguments, 44 claims to check) and `extended-library/questioning-paul-notes.md` (all 13 chapters, read in three parts and merged). Both 🔴 flagged; our summaries with short attributed quotes only | Chris Crutchfield | Claude | [x] |
| 6a | Notes done 2026-10-20 for the other 🔴 copyrighted works: `extended-library/nazarene-acts-snyder-notes.md` (Snyder's edition is Smith's 1886 text with Hebrew-name substitutions; a few changes alter meaning, e.g. 1.39 adds "which is Y'shua"; David The Nazarene's NazActs readings follow this edition) and `extended-library/articles-batch-2026-10-20-notes.md` (Davidmann, Veith, the "Christian" article) | Chris Crutchfield | Claude | [x] |
| 6c | Sabbath-to-Sunday research: **drafted 2026-10-21** as `christianity/DRAFT-sabbath-to-sunday.md` (DRAFT: not to be cited until reviewed, D7). Narrow thesis: Christians met on the first day early (Acts 20:7, Didache 14), so Sunday worship isn't a Constantine invention; what's late is Sunday *rest* replacing the seventh day (Constantine 321, Laodicea canon 29, both not held). Held evidence includes Jesus on the Sabbath, Epiphanius on Nazoraean and Ebionite Sabbath-keeping, De Fide 22, and the Ethiopic Didascalia ch. 38 | Chris Crutchfield | Claude | [x] |
| 6d | Sources to add so the Sabbath draft can quote instead of cite: Ignatius, Barnabas and Justin (ANF vol. 1), Eusebius *Church History* 3.27 (Ebionites keeping both days), the Laodicea canons (NPNF 2nd series vol. 14), Constantine's 321 law; check the Didascalia prayer against the Harden scan (the OCR drops every "t"); locate Neander (1848) and Dale (1884) from Veith's list. All public domain **2026-10-26:** Ignatius, Barnabas, Justin, Eusebius and the Laodicea canons are now held (Next Up 18); the passages the draft cites are quoted exactly in `audits/2026-10-26-fathers-added-checks.md` §(c), and the draft's descriptions agree with all of them. Note: the Sabbath line in Magnesians 9 is from Ignatius's *longer* (fourth-century) recension. Still open: Constantine's 321 law, the Didascalia scan check, Neander and Dale, and the Greek for the "Lord's life" variant | Chris Crutchfield | | [ ] |
| 6b | Clementine Homilies translator credit corrected 2026-10-20: ANF vol. 8 splits the Homilies among Thomas Smith (Books I-V), Peter Peterson (VI-XII) and James Donaldson (XIII-XX); the repo had credited Peterson alone. Fixed in the file header, `VERIFIED-SOURCES.md`, and five Reading Room citations (Homilies 2.38, 3.45, 3.48-51 and 3.51 are Smith's; Peter's letter to James has no named translator). Site build passes | Chris Crutchfield | Claude | [x] |
| 7 | Shabbat Studies overview done 2026-10-20: `podcast-archive/shabbat-studies/00-overview.md` (chapter guide, main arguments, combined sources, where it meets the repo, 173 combined claims to check with 74 duplicates merged, 17 questions for the hosts) | Chris Crutchfield | Claude | [x] |
| 8 | Ask Chris for his sources. The top three: Joseph of Arimathea as Jesus's father; the Petrine text calling it "a religion of blood"; the Edomite priesthood since 160 BC. The full list of 17 is in the overview's "Questions for the Hosts" | Chris Crutchfield | Rex | [ ] |
| 9 | Feed Shabbat Studies material into research files: Ch 3 additions on sacrifice (1 Samuel 15:22, Hosea 4, Ahaz in 2 Kings 16, altar logistics); "cease from sacrificing" is Panarion 30.16.5, not the Clementines; Ch 4D's Galatians 3 material matches `OPEN-RESEARCH.md` item 2 | Chris Crutchfield | Claude drafting proposals; Rex approves before any research file changes | [ ] |
| 10 | Finish David The Nazarene transcripts: download running, 251 of 370 as of 2026-10-20 (YouTube rate-limits it; an Apify token would finish it in minutes). SixSeven Podcast (item 12) is queued right after it in the same job **Done 2026-10-26: all 370 have transcripts.** The last 55 had no captions at the source and were transcribed locally with Whisper (large-v3-turbo) on Rex's GPU; each says so above its text | Chris Crutchfield; Brad Brink | Claude | [x] |
| 11 | Confirmed 2026-10-20: David The Nazarene is David H. Notsari, guest on The Jesus Way episode 23. That episode's description links "David Notsari YT" to a David The Nazarene video, and his own video descriptions link to his Odysee account @DavidHNotsari | Chris Crutchfield | Claude | [x] |
| 12 | Pull SixSeven Podcast transcripts (34) **2026-10-26:** 31 of 34 from captions; the last 3 (episodes 11, 17, 28) have no captions and are being transcribed locally with Whisper **Done 2026-10-26: all 34.** Episodes 11 and 17 by Whisper; episode 28 is a song with no talk, recorded in its file | Chris Crutchfield | | [x] |
| 13 | Notes on David The Nazarene: the most relevant videos first, not all 370. Batch 1 of 22 done 2026-10-20 (sacrifice, diet, Essenes, Ebionite 101-202, Gospel of the Hebrews, James and Paul in the Dead Sea Scrolls, "Paul vs the True Church", law). Batch 2a of 13 done (Galatians 1-7, Paul's use of scripture, Simon Magus, Quotes About Paul); 2b of 11 done (Kingdom of Heaven, Community Rule 1-4 covering 1QS 1:1-9:26, Stephen and James, 2 Peter, baptism). 46 videos have notes. More leads from 2b: Homilies 17.19 (a vision does not make one fit to teach) and 7.7 (two paths) are held but unused on the Paul and Two Ways cards; Panarion 78,14,6 is the source for Simeon son of Clopas at James's death. Research leads from 2a: video 170 is a citation-by-citation context check of the scripture in Galatians 3-5, ready for OPEN-RESEARCH item 2; Panarion 21,4,5 (Simon's law from "a left-hand power") is held and used nowhere in the repo. **Skipped on purpose:** the ~70 "RSF" videos where he reads aloud from texts the repo already holds (Didache, Clementine Homilies and Recognitions, letters of James and Peter); their transcripts are kept, notes only if one has substantial commentary **Batch 3 of 22 done 2026-10-26** (68 of 370 now have notes): the Nazarenes' two doctrines (365, 352), James on teachers (347), sacrifice (343-345), the diet objections (085 leper, 082 Noah, 070 and 182 the loaves, 087 Passover), saved by works (334-336, 346), the Standing One (033), the Gospel of the Holy Twelve (092), *The Rock of a Sure Foundation* (179), Paul and the collection (088-089), and Scripture's corrupted passages (066, 063). Next most relevant: 176 (his review of Ehrman), 159, 096, 174, 357. Leads from batch 3, all in texts we hold and unused on the cards: Recognitions 4.35 and Homilies 11.35 (no teacher without James's testimonial), Recognitions 2.33 and 4.36 (the Acts 15 list as "the first step of three"), Homilies 7.7 (the two paths), 8.15-16 and 8.19 (flesh-eating begins with the giants), 2.43-44 and 16.10 (scripture's false sayings); video 082 answers the open "Genesis 9:3" objection in `questions/MINING-2026-10-debates.md` | Chris Crutchfield; Brad Brink | Claude | [ ] |
| 14 | Panarion audit done 2026-10-20 (report: `Incoming/proposals/item-14-panarion-audit.md`, local). 25 quotations in 15 files checked against Craig Wescoe's translation, and the key passages against Holl's Greek (Craig's English is accurate at every passage checked). Problems found in our own research files, with fixes proposed: "the wrath of God" and "Passover lamb" (neither word is in the Greek); a Sect 18 sentence about the pre-Christian Nasaraeans used for the Nazarenes in 7 places; "Berea near Pella"; one quotation not found (`the-essene-diet.md`); a statement about Epiphanius and the Clementines that 30,15 contradicts. Also a card verdict to reverse: "the Nazarene sect was before Christ" is labelled Fabricated, but it's a real sentence (29,6,1) about the Nasaraeans, used to deny they were the Nazarenes, so the claim is a misreading, not an invention. Fixes wait on D6 | Craig Wescoe | Claude | [x] |
| 15 | Read SixSeven Podcast transcripts and decide what, if anything, goes deeper **Notes done 2026-10-26** for all 31 transcribed episodes, plus `podcast-archive/sixseven-podcast/00-overview.md` (episode guide, themes, sources, where it meets the repo, 118 combined claims to check, 16 questions for Chris). Next steps from it are Next Up 15a | Chris Crutchfield | | [x] |
| 16 | Model comparison test done 2026-10-21: Opus 5.5 redid Shabbat Ch 3A blind and matched Fable (30 claims to check against 26, heavy overlap; Opus alone caught Leviticus 5:11-13's bloodless flour offering, Fable alone linked more repo files). Opus stays the default; details in `ROADMAP-PROCESSING-WORKFLOW-REX.md` section 4 | Rex + Matt | Claude | [x] |
| 17 | Audit worksheet done 2026-10-21: `audits/AUDIT-WORKSHEET.md`, all 15 items worked (current wording, held text, Greek or KJV, proposed wording, what's open, Input). The second check refined the audit: A8's phrase is also in Eusebius (so that file is half right), A3 has 4 wrong places not 7, A2 and A5 have more places than reported, A6 traces to a Jesus Way slide. Next: share with Matt and the group for input | Rex + Matt + group | Claude | [x] |
| 18 | Add the public-domain sources the audit worksheet and the Sabbath draft need, so they can be quoted instead of cited: Irenaeus *Against Heresies* (ANF 1), Eusebius *Church History* (NPNF 2nd series vol. 1), Jerome's letters and commentary on Isaiah (NPNF 2nd series vol. 6), Ignatius, Barnabas and Justin (ANF 1), the Laodicea canons (NPNF 2nd series vol. 14), a public-domain Greek New Testament (e.g. Westcott-Hort 1881), Brenton's Septuagint (1851), the JPS 1917 Hebrew Bible in English. Each with a provenance header and a row in `VERIFIED-SOURCES.md`. Overlaps 6d **Done 2026-10-26.** Church fathers (12 files): Irenaeus, Eusebius *Church History*, Ignatius, Barnabas, Justin's *First Apology* and *Dialogue*, Jerome's *Letters*, *Against the Pelagians* and *Lives of Illustrious Men*, the Laodicea canons, Clement's *Stromata*, Origen's *Commentary on John*, all from CCEL. Bibles: Westcott-Hort Greek NT (27 books, unaccented), Brenton's Septuagint (53 books), JPS 1917 (39 books), with import scripts in `scripts/`. All registered in `VERIFIED-SOURCES.md`; checks in `audits/2026-10-26-fathers-added-checks.md`. Not in NPNF, so not held: Jerome's commentaries on Matthew and Isaiah; about 50 of Jerome's letters are printed only as summaries (including 20 and 120) | | Claude | [x] |
| 15a | From the SixSeven notes, the threads that meet the repo's research: episode 29 (Revelation's date against the repo's reading of the Olivet discourse; the Sinaitic Syriac of Matthew 1:16; the portents before 70 in Tacitus *Histories* 5.13 and Josephus *War* 6, which Eusebius's *Church History* 3.6 and 3.8, now held, quotes; episode 11 shows Chris has held the fulfilled reading since January 2024); episode 04 (the 364-day calendar from 1 Enoch 72-82, Jubilees 6 and 4QMMT, which we hold, beside Shabbat claims 157-159 and the Sabbath draft; Ezekiel 44:15 on the Zadokite priests); the rapture threads in 20, 22, 24 and 29 for the rapture card; episode 15's wording of the blood-sacrifice objection for `OBJECTIONS.md`; episode 20 on Revelation 13:15-17 | Chris Crutchfield | | [ ] |
| 19 | Christian Florez's research sheet "The Red Letters That Were Added" done 2026-10-26. It is converted (`extended-library/polemic-answers-red-letters-added-florez.md`, all 473 Notion blocks) and has notes (`-notes.md`: the argument, an index of all 53 entries with tiers, what we checked, where it meets the repo). Two helper passes checked every claim a held text can test (about 45 KJV verses, the Panarion, Didache, Thomas, Recognitions) and mapped the sheet against our cards. Reports in `audits/2026-10-26-florez-red-letters-*.md`. Possible problems in our own files are on `AUDIT-LIST.md` as A16-A22 | Christian Florez | Claude | [x] |
| 19a | Feed the sheet into the cards: the repo map ranks ten additions (Matthew 28:19 tiers and the Acts baptisms on the Trinity card; five more christological variants; more seam-table rows and Matthew 27:49 on the method card; the Mark 7:19 grammar and Meier on the Torah card; the Matthew 5:17-19 consistency answer; and five more). Waits on D9 | Christian Florez | Claude drafting proposals; Rex approves before any card changes | [ ] |
| 19b | Send Christian the points where our held texts read differently from the sheet (notes file, "Where the held texts read differently"; ten points, e.g. the baptisms in Acts, Caiaphas in Matthew 26, Panarion 30,13,7 and 30,22,4-5, Recognitions 1.39), and the two of his open items our texts settle (Panarion 46,1,9; the Didache's two baptismal formulas). | Christian Florez | Rex | [ ] |
| 19c | The sources the sheet leans on that we don't hold, and that would let us check the rest: Metzger's *Textual Commentary* (UBS grades, A7, A26), Edwards's *The Hebrew Gospel* (2009) and Gregory (*NTS* 2005), Jerome's commentaries and *Against the Pelagians*, Clement's *Stromata*, Origen's *Commentary on John*. The public-domain ones join Next Up 18 **2026-10-26:** Jerome's *Letters*, *Against the Pelagians* and *Lives*, Clement's *Stromata* and Origen's *Commentary on John* are now held (Next Up 18), and the sheet's quotations from them are checked. Metzger and Edwards are in copyright and stay unheld | Christian Florez | | [ ] |
| 20 | More public-domain sources the new notes point to: Josephus, *Jewish War* and *Antiquities* (Whiston, 1737), Tacitus, *Histories* (Church and Brodribb), the Sinaitic Syriac gospels in English (Lewis 1894, Burkitt 1904), the Scofield Reference Bible's 1909 notes, and Tertullian (ANF 3-4). Josephus is also `OPEN-RESEARCH.md` item 7 | | Claude | [ ] |
| 21 | Claims list, next steps: (a) add the claims already checked in older audits (`audits/2026-10-20-panarion-quotations.md`, AUDIT-LIST A1-A30, `questions/CITATION-NOTES.md`); (b) when processing anything new, add its checkable claims here instead of re-checking them in each notes file (Intake Rules, step 8); (c) show each claim's result on the site next to the card citation that uses it; (d) a person reads the passages and changes "person check: not yet" to their name. Format and rules: `claims/README.md` | | | [ ] |

---

## Decisions Waiting

**Possible problems in our own research go to `AUDIT-LIST.md`, not here.** They need checking against sources, not a keep-or-delete call.

Judgment calls collected as they come up, for Rex and Matt to go through together. Nothing on this list blocks other work unless it says so.

| # | Decision | Where | Status |
|---|---|---|---|
| D1 | Item 9: which of the Shabbat Studies proposals that **add** material to apply (P3-P5 new sacrifice texts, P8 wilderness arithmetic, P9 Galatians 3 for OPEN-RESEARCH, P10, P11, and P12: cite Recognitions 2.71 and 4.36 in `christianity/acts-15-james-four-decrees.md`). Drafts in `audits/2026-10-20-shabbat-integration-proposals.md`. The proposals that claim a problem (P1, P2, P6, P7) moved to `AUDIT-LIST.md` (A1, A13-A15) | Research files | Waiting |
| D6 | Item 14's findings are now audit items A1-A12 in `AUDIT-LIST.md`: each needs a person to check the sources before anything changes | `AUDIT-LIST.md` | Moved to the audit list (2026-10-20, Rex) |
| D7 | Review the Sabbath-to-Sunday draft (`christianity/DRAFT-sabbath-to-sunday.md`): keep, change, or drop; when approved, remove DRAFT and add it to `TOPIC-INDEX.md` | `christianity/` | Waiting |
| D2 | Combined claim 150, background on a book the hosts showed on air (also in the Ch 4D notes): keep, soften or remove | `podcast-archive/shabbat-studies/00-overview.md`, `09-ch4d-...` | Decided 2026-10-20 (Rex): keep |
| D3 | Claims-to-check items recording David's remarks on "Edomite Jews" and "most Jews today are not Hebrews" | `podcast-archive/david-the-nazarene/187-...`, `189-...` | Decided 2026-10-20 (Rex): leave in |
| D4 | Ask the authors for permission to host the 🔴 books in full, or sideline (also Next Up 4a) | Copyrighted Works We Hold | Waiting |
| D5 | Private library repo for the 🔴 books (also Next Up 4) | GitHub | Waiting on Rex to create it |
| D8 | Christian Florez's research sheet: publish the full text in the public repo? It sits in his own Notion workspace, and he sent it to us for the repo | `extended-library/polemic-answers-red-letters-added-florez.md` | Decided 2026-10-26 (Rex): publish in full, since Christian sent it for the repo |
| D9 | Next Up 19a: which of the ten card additions from Christian's sheet to draft, and the label question underneath them. The sheet follows Edwards in calling the Panarion 30 sayings "the Hebrew Gospel"; our cards call them the Gospel of the Ebionites (audit A20). The repo map has the full list with file:line references | `audits/2026-10-26-florez-red-letters-repo-map.md` §2 | Waiting |
| D10 | What the public search shows. Right now it returns everything in the repo: primary texts, cards, our notes, podcast transcripts and contributors' full texts, without saying which kind a result is. Options: (1) label every result by kind and show all of it; (2) search primary texts, cards and the claims list by default, with working material (talks, notes, contributed works) behind a clearly labelled switch; (3) leave working material out of the public search entirely and keep it in the repo only. Whichever is chosen, the full texts stay in the repo as the record of what we were sent | `site/search/`, `scripts/vectorize-sync.py` | Waiting (Rex, Matt) |

---

## Status

<!-- STATUS:START -->
*Generated by `python scripts/processing-status.py` on 2026-10-26. Don't edit by hand.*

| Source | Contributed by | Items | Transcripts | Notes | Queue |
|---|---|---|---|---|---|
| David The Nazarene | Chris Crutchfield, 2026-10-19; Brad Brink, 2026-10-20 | 370 | 370 of 370 | 68 of 370 | [queue](podcast-archive/david-the-nazarene/00-queue.md) |
| Dr. James Tabor, YouTube channel | Matt Fracek, 2026-10-20 | 405 | 405 of 405 | 405 of 405 | [queue](podcast-archive/dr-tabor-channel/00-queue.md) |
| Scott, Nazarene Way | Matt Fracek, 2026-10-20 | 84 | 84 of 84 | 80 of 84 | [queue](podcast-archive/scott-nazarene-way/00-queue.md) |
| Shabbat Studies with Jen & Chris | Chris Crutchfield, 2026-10-19 | 10 | 10 of 10 | 10 of 10 | [queue](podcast-archive/shabbat-studies/00-queue.md) |
| SixSeven Podcast | Chris Crutchfield, 2026-10-19 | 34 | 34 of 34 | 34 of 34 | [queue](podcast-archive/sixseven-podcast/00-queue.md) |
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
| 🔴 | "Where did the term 'Christian' come from?" | Not named (sabbathcovenant.com) | Web article | Yes: 1 PDF + 1 Markdown file | Rex's local `/Incoming/drive-2026-10-20/` | Chris Crutchfield |
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
| 2026-10-26 | Christian Florez | "Polemic Answers, The Red Letters That Were Added, Every Saying of Yeshua That Scholarship Says He Never Said": research sheet on red-letter passages that later scribes added (Part A, 35 entries) or the Gospel writers composed (Part B, 18 entries), with what this does to doctrines, objections and answers, and a long part on the Hebrew Gospel fragments, Thomas and Q (Part F). Each entry is marked ESTABLISHED, CONTESTED or QUARANTINED | Notion page, about 27,000 words | [Notion](https://app.notion.com/p/Polemic-Answers-The-Red-Letters-That-Were-Added-Every-Saying-of-Yeshua-That-Scholarship-Says-He-Ne-3ff92732ec0681e7bcf1dd44c4d9fd9a) | `extended-library/polemic-answers-red-letters-added-florez.md` (full text) + `-notes.md` | Converted to Markdown; checked against held texts; see Next Up 19 |
| 2026-10-20 | Matt Fracek (Scott's own channel) | Scott, Nazarene Way | YouTube channel, 84 videos | https://www.youtube.com/@NazareneWay | `podcast-archive/scott-nazarene-way/` | Transcripts and notes done; see Next Up 1 |
| 2026-10-20 | Matt Fracek | Dr. James Tabor's channel | YouTube channel, 483 videos | https://www.youtube.com/@JamesTaborVideos | `podcast-archive/dr-tabor-channel/` (+ `dr-tabor/` for the Paul playlist) | 398 with transcripts and notes; 85 not added; see Next Up 2 |
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
| Christian Florez | Research sheet "Polemic Answers, The Red Letters That Were Added" (Notion) | 2026-10-26 |
| Matt Fracek | Scott's Nazarene Way channel (84 videos), Dr. James Tabor's channel (483 videos) | 2026-10-20 |

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
8. **Put every checkable citation in the claims list.** For each claim about what a source says, run `python scripts/claims.py find <passage>` first. If there's an entry, add the new source to its **Raised by:** line. If not, check it against the held text and add one (`claims/README.md`). Readings and opinions stay in the notes; only claims a source can settle go in the list.

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

### 2026-10-26 — Research sheet from Christian Florez

**Sent by:** Christian Florez, passed on by Rex, as a source for this repo.
**What it is:** "Polemic Answers, The Red Letters That Were Added, Every Saying of Yeshua That Scholarship Says He Never Said." It's a public Notion page in Christian's own workspace, created 2026-10-20 and last edited 2026-10-21, about 27,000 words. It sorts red-letter passages into those later scribes added (Part A, 35 entries) and those the Gospel writers composed (Part B, 18). It goes on to doctrines, objections and answers, comment-length versions, and a long Part F on the Hebrew Gospel fragments, Thomas and Q. Every entry is marked ESTABLISHED, CONTESTED or QUARANTINED, and the sheet ends with its own list of items still to verify.

- [x] Duplicate check: new
- [x] Downloaded through Notion's public page data (the page itself is a script shell): all 473 blocks, none missing. The raw data and the plain conversion are in local `/Incoming/notion-2026-10-26/`
- [x] Converted to Markdown with a source header and Contributed by line: `extended-library/polemic-answers-red-letters-added-florez.md`. Wording unchanged
- [x] Read in full; notes written: `extended-library/polemic-answers-red-letters-added-florez-notes.md`
- [x] Citation check against held texts (helper pass, spot-checked): `audits/2026-10-26-florez-red-letters-citation-check.md`
- [x] Mapped against the repo's cards and research files (helper pass): `audits/2026-10-26-florez-red-letters-repo-map.md`
- [x] Possible problems in our own files logged: `AUDIT-LIST.md` A16-A22
- [x] Rights: published in full by Rex's decision (D8), since Christian sent it for the repo
- [ ] Card additions (Next Up 19a, D9); points to send Christian (19b); sources to add (19c)


### 2026-10-20 — Google Drive batch from Chris Crutchfield

Sent by Chris Crutchfield, passed on by Rex: 3 folders and 3 single files. All six links were public and all 65 PDFs downloaded. All have real text (no scans). Converted to 11 Markdown files, one per work, about 1.16 million words in total. Everything sits in Rex's local `/Incoming/drive-2026-10-20/` (PDFs, plus `markdown/`) until each item's rights are settled.

| Work | Author / translator | Words | Rights | Already in repo? | Needs attention |
|---|---|---|---|---|---|
| Clementine Homilies (21 PDFs, New Advent printouts) | Thomas Smith et al., Ante-Nicene Fathers vol. 8 (1886) | 114,000 | Public domain translation | Yes, `christianity/Incoming/clementine-homilies-full-text.md` (same ANF translation) | Duplicate in content; keep as a cross-check only. It also exposed a credit error, now fixed: ANF vol. 8 splits the Homilies among Smith (I-V), Peterson (VI-XII) and Donaldson (XIII-XX) |
| 🔴 *The Nazarene Acts of the Apostles* (Recognitions of Clement, "True Names Translation") | Jackson H. Snyder, Theodore A. Dornan, Chris Plourde, on Thomas Smith's translation | 135,000 | © 2007-2010 Jackson H. Snyder, all rights reserved | Smith's public-domain Recognitions is, as `clementine-recognitions-full-text.md` | Can't publish in full. Notes done: `extended-library/nazarene-acts-snyder-notes.md`. Confirmed as the text David The Nazarene reads on his channel |
| Book of Jasher | J.H. Parry edition (1887) of the 1840 translation | 175,000 | Public domain | Added 2026-10-20: `christianity/Incoming/jasher-1840-full-text.md` (Tier 4, medieval) | Done. The modern web introduction was left out |
| Book of Jubilees, chapters 1-9 only | R.H. Charles translation, via theforbiddenknowledge.com | 13,000 | Translation public domain | Yes, in full: Charles 1913, all 50 chapters, in `ethiopian-bible/unique-ethiopian-texts.md` | Nothing to add; the Drive copy is a partial duplicate |
| 1 Maccabees ("version 2") | KJV Apocrypha | 25,000 | Public domain | Added 2026-10-20 from Gutenberg #124: `christianity/Incoming/kjv-apocrypha/1-maccabees.md` | Done |
| ⚠️ Book of Enoch, "Simplified Version" | Charles-based text edited by sherryshriner.com | 39,000 | Base text public domain; the edits are unclear | Yes, in full: Charles 1913 (all 108 chapters) in `ethiopian-bible/unique-ethiopian-texts.md`, and Charles 1917 added 2026-10-20 as `christianity/Incoming/book-of-enoch-charles-1917-full-text.md` | Kept locally by Rex's decision; use Charles for anything public |
| 🔴 *Jesus' Words Only* (2007), 23 chapters and appendices | Douglas Del Tondo | 188,000 | Copyrighted (appears to be distributed free online by the author) | No | Notes file done: `extended-library/jesus-words-only-notes.md`. Full text only with the author's permission |
| 🔴 *Questioning Paul* (13 chapters) | Yada Yah (pen name) | 452,000 | Copyrighted (appears to be distributed free online) | No | Notes file done: `extended-library/questioning-paul-notes.md`. Full text only with permission |
| 🔴 "Origin of Christianity and Judaism" | Manfred Davidmann | 14,000 | © 1994, all rights reserved | No | Notes only |
| 🔴 "Denominational Testimony" | Walter J. Veith (amazingdiscoveries.org) | 1,000 | Copyrighted web article | No | Notes only; it's mostly quotations from denominational sources, which can be cited directly |
| 🔴 "Where did the term 'Christian' come from?" | Not named (sabbathcovenant.com; links to fossilizedcustoms.com) | 3,500 | Copyrighted web article | No | Notes only. Several of its claims overlap the Shabbat Studies "claims to check" (Christos and Mithras) |

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
