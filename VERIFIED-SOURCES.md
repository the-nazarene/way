# Verified Sources — what may be quoted as ground truth

**The one list that answers "can I quote this?"** Every file here has been opened, its edition named, and its contents checked against the 2026-10-07 source audit (`SOURCE-AUDIT.md`). An AI assistant or a person working in this repo may quote a Tier 1 or Tier 2 file directly, with the translator named, and treat it as settled. **Anything not on this list is not a source** — it is our reading of a source, and it has to be checked against one of these before it is said out loud.

This is the companion to the Source Hierarchy in `CLAUDE.md`. The hierarchy says what *kind* of evidence outranks what. This page says which *files* actually hold that evidence, and which we only talk about.

---

## The rules

1. **Quote only from Tier 1 and Tier 2 files, and name the translator.** "Gospel of Thomas 113 (Lambdin)." The translation is part of the citation, because the wording differs between translations and someone will be holding a different one.
2. **Tier 2 is excerpts.** Quote only what is already in the file. If the passage you want isn't there, it isn't ours to quote yet — see *Adding a text* below.
3. **Tier 3 is a reconstruction.** Say so every time. Q has no manuscript.
4. **Tier 4 is disputed.** Never cite it as an ancient text. It can be discussed; it cannot be evidence.
5. **Not held means no quotation marks.** Josephus, Eusebius, Epiphanius and the rest are real and citable at reference level ("Hegesippus, via Eusebius, *Church History* 2.23, records that James ate no meat"). The words themselves stay out of quotation marks until the text is in the repo.
6. **Research files, cliff notes, cards, the site, and transcripts are not sources.** They are ours. When one of them quotes a primary text, the quotation is only as good as the Tier 1/2 file behind it — go to that file.
7. **Cite the distinctive phrase, not the line number.** Line numbers shift the day someone edits a header. A phrase greps forever.
8. **A zero-hit grep is evidence, not a verdict.** Two files on this list defeat exact-phrase search (noted below). Confirm with two fragments before calling anything fabricated.

---

## Tier 1 — Verified full texts (quote directly)

| Text | File | Translation / edition | Rights | Audit status | Read this first |
|---|---|---|---|---|---|
| **The Bible, all 66 books (the red text, the prophets, Acts, Paul, Hebrews)** | `christianity/Incoming/kjv/` — one file per book, one verse per line | King James Version (1611; 1769 Oxford text), Project Gutenberg #10, imported by `scripts/import-kjv.py` 2026-10-09 | Public domain | Held; spot-checked at import (Matthew 9:13, Luke 17:21, Hosea 6:6, Hebrews 9:22, Jeremiah 33:18, Luke 22:37, Psalm 119:176); not yet audited verse-by-verse | Cite as "(KJV)" and quote the file's wording. Where a modern translation differs in a way that matters (Hosea 6:6 "mercy" / "steadfast love"), say so where you cite it. The KJV prints the Comma Johanneum (1 John 5:7) and Mark 16:9-20; both are in the file and both are flagged on the cards |
| **Gospel of Thomas** | `christianity/Incoming/gospel-of-thomas-full-text.md` | Thomas O. Lambdin, *The Nag Hammadi Library in English* (Robinson, ed.), via gnosis.org | In copyright; reproduced widely. Short quotation only | Verified; the repo's most-quoted text | **Lambdin is not Meyer 2007.** Meyer prints his own translation ("children" vs. Lambdin's "sons," Thomas 3). Eight-plus files credited Lambdin while quoting Meyer — see `FIX-LIST.md` "the one systemic fix." Quote this file's wording and no other |
| **The Didache** | `christianity/Incoming/didache-full-text.md` | Cyril C. Richardson, *Early Christian Fathers* (1953) | In copyright; the Roberts-Donaldson 1886 (ANF 7) text is public domain and equivalent for citation | Verified | Chapter 14 uses *thusia* ("sacrifice") three times. "The Didache has no sacrifice" is false; the Eucharistic *prayers* (ch. 9-10) have no body/blood/death language is true |
| **Clementine Homilies** | `christianity/Incoming/clementine-homilies-full-text.md` | Rev. Peter Peterson, Ante-Nicene Fathers vol. 8 (1886), from the Greek | Public domain (CCEL) | Verified | The "many falsehoods added to scripture" passage is **Homilies 2.38**, not Recognitions 1.69. The "false pericopes" doctrine runs 3.42-50. "Lying pen of the scribes" is Jeremiah 8:8, not Clementine |
| **Clementine Recognitions** | `christianity/Incoming/clementine-recognitions-full-text.md` | Rev. Thomas Smith, ANF vol. 8 (1886), from Rufinus's Latin (Greek lost) | Public domain (CCEL) | Verified | The demon-thoughts quote is **Recognitions 4.18**, not the Epistle of Clement to James. "Purified not by the blood of beasts" is 1.39 |
| **1 Enoch** | `christianity/ethiopian-bible/unique-ethiopian-texts.md` (first section) | R. H. Charles, *Apocrypha and Pseudepigrapha of the OT* (1917), via CCEL | Public domain | Verified clean on first check (1:1, 1:3-9, 46:4-5, 48:2-5, 99:2) | **The file wraps lines mid-phrase**, so exact-phrase grep can miss real text. 1 Enoch 45:3 and 61:8 are separate verses; 102:11 is the sinners speaking, not Enoch's verdict. 56:8 is usable |
| **Jubilees** | same file, "Book of Jubilees" section | R. H. Charles (1913), via pseudepigrapha.com | Public domain | Verified (6:22, 6:32, 15:25, 23:13-29) | "Gradually realized on earth…" (cited as Jubilees 23) is Charles's editorial introduction, not the text |
| **1 and 2 Meqabyan** | same file, Meqabyan sections | Wikisource volunteer translation from Ge'ez; plus D. P. Curtin (2018) from Amharic for 1 Meqabyan | Open (Wikisource) | Held; not yet audited | Amateur translation. Quote with "Wikisource translation" named. 3 Meqabyan is **not** held (summary only) |
| **Shepherd of Hermas** | `christianity/ethiopian-bible/shepherd-of-hermas.md` | Roberts-Donaldson, ANF vol. 2 (1885), via New Advent | Public domain | Verified (Mandates) | — |
| **Epistula Apostolorum** | `christianity/ethiopian-bible/epistula-apostolorum.md` | M. R. James, *The Apocryphal New Testament* (1924) | Public domain in the US | Verified (16, 17, 26, 31, 33, 36) | **Read the whole chapter before using it on Paul.** The "root up the church" and "last of the last" fragments are verbatim, and the surrounding text is strongly *pro*-Paul ("a chosen vessel… preacher unto the Gentiles"). See `SOURCE-AUDIT.md` §7 |
| **Ethiopic Didascalia** | `christianity/ethiopian-bible/didascalia-raw.md` | J. M. Harden (SPCK, 1920), OCR from the Internet Archive scan | Public domain | Held; OCR | **The OCR drops the letter "t" systematically** ("wih us our good and holy broher Paul"). Exact-phrase grep returns zero on genuine quotations. Verify by reading, and quote from the scan if the wording matters |

## Tier 2 — Verified excerpts (quote only what is here, translator inline)

| Text | File | Translations | Rights | What is actually in the file |
|---|---|---|---|---|
| **Dead Sea Scrolls** (1QS, CD, 1QM, 1QHa, 4QMMT) | `christianity/dead-sea-scrolls/Incoming/dead-sea-scrolls-selected-texts.md` | Vermes (Penguin, 7th ed. 2011); Wise/Abegg/Cook (HarperOne, 2005); García Martínez (Brill/Eerdmans, 1996), attributed per quote | In copyright; short attributed excerpts (this file is the house model for copyrighted material) | Verified verbatim: 1QS 3:4-7, 3:17-19, 6:4-6, 8:1, 8:12-14; CD 1:10-11, 19:33-35; 1QM 1:1-3. **1QS 9:4-5 exists only as paraphrase** here; cite at reference level. **4Q473 is not in this repo** |
| **Gospel of Philip** | `gnosticism/Incoming/gospel-of-philip-full-text.md` | Wesley Isenberg in Meyer, *The Nag Hammadi Scriptures* (2007); cross-checked with Layton (1987) | In copyright; selected passages | Selected key passages, not the full text despite the filename. All 10 quotations in the gnosticism cliff notes verified against it |
| **Witnesses on flesh and sacrifice** (Hegesippus via Eusebius, Eusebius *HE* 2.17 and *DE* 3.5, Clement *Paed.* 2.1, Ancyra c. 14, Apostolic Canons 51/53, Philo *Prob.* 75 and *Contempl.* 73, Josephus *Ant.* 18.1.5 and *War* 2.8.5, Porphyry *Abst.* 4.11-12, Jerome *Jov.* 2.14, Schweitzer on Bahrdt) | `christianity/Incoming/witnesses-on-flesh-and-sacrifice-selected-texts.md` | NPNF 2.1, 2.6, 2.14; ANF 2; Ferrar (1920); Yonge (1854-55); Whiston (1737); Taylor (1823); Montgomery (1910), named per excerpt | Public domain (Ferrar: PD in the US) | Thirteen excerpts, each sliced from the downloaded page text between anchor phrases, not retyped (2026-10-10). Each carries **Our note** on what it does *not* say: Porphyry never states Essene vegetarianism; Jerome does, but credits Josephus, who doesn't |
| **Apocryphon of John** | `gnosticism/Incoming/apocryphon-of-john-full-text.md` | Marvin Meyer (2007); cross-checked with Wisse in Robinson | In copyright; extended excerpts of the Codex II long version | Key passages with commentary. Quote only the blockquoted text |

## Tier 3 — Reconstruction (say "reconstructed" every time)

| Text | File | Built from | Caveat |
|---|---|---|---|
| **Q (the sayings source)** | `christianity/Incoming/q-source-reconstruction.md` | KJV (1611) for the Matthew/Luke parallels; Lambdin for Thomas parallels; IQP numbering (Luke chapter:verse); passage list per Kloppenborg / *Critical Edition of Q*; Harnack (1908) | There is no manuscript. This file is a triangulation, and its strength is the agreement of Matthew, Luke and Thomas on a saying, not any one witness. Quote the gospel verse (KJV) and name it as such |

## Tier 4 — Disputed provenance (discuss, never cite as ancient)

| Text | File | Why |
|---|---|---|
| **Essene Gospel of Peace, Book 1** | `christianity/Incoming/essene-gospel-of-peace-book-1-full-text.md` | Edmond Bordeaux Szekely (1937). The manuscripts he claimed to translate have never been produced; the Vatican denies holding them. Scholarly consensus: a 20th-century composition. `extended-library/essene-gospel-of-peace.md` has the full provenance discussion. Quotations from the file are checkable (40 of 40 verified in the cliff notes) — but they prove what Szekely wrote, not what Jesus said |

---

## Not held — cited in our research, absent from the repo

These are real sources we lean on without owning. Until a text is added, cite them at reference level and keep the words out of quotation marks. The audit's Bucket B (~185 specific citations, ~73 vague) lives here.

| Source | Cited on | Public-domain edition that could be added | Notes |
|---|---|---|---|
| Josephus (*Antiquities*, *Jewish War*, *Life*) | 5 cards | Whiston translation (1737), PD, on CCEL / Gutenberg | Essenes, James's death (Ant. 20.9.1), John the Baptist. **Excerpts now held:** *Ant.* 18.1.5 and *War* 2.8.5, in the witnesses file (Tier 2) |
| Eusebius, *Church History* | 4 cards | NPNF series 2 vol. 1 (McGiffert, 1890), PD | Hegesippus on James (2.23); the flight to Pella (3.5). **Excerpts now held:** 2.23.4-7 and 2.17.22-24, in the witnesses file (Tier 2) |
| Eusebius, *Demonstratio Evangelica* | 3 files | Ferrar (1920), PD in the US | **Now held (3.5)** in the witnesses file. It says *the disciples of Jesus* "embraced... abstinence from wine and meat" within a longer sentence; "the twelve apostles embraced abstinence" is a paraphrase |
| Hegesippus | 5 cards | Survives only in Eusebius (above) | He says James **was** admitted to the holy place; "never entered the Temple" reverses him |
| Epiphanius, *Panarion* | 5 cards | No PD English. Williams (Brill, 1987/2009) is in copyright | Excerpts only. The Ebionite Passover saying (30.22.4) is his quotation of *their alteration* |
| Irenaeus, Justin Martyr, Tertullian, Origen | 1-2 cards each | ANF volumes, PD | The subordinationism quotations are in our secondary notes only; the argument stands without the quotation marks |
| Philo (*Every Good Man Is Free*, *Hypothetica*) | 2 cards | Yonge (1854), PD | Essene sources. **Excerpts now held:** *Prob.* 75 (Essenes, "not sacrificing living animals") and *Contempl.* 73 (the Therapeutae's table, not the Essenes'), in the witnesses file |
| Pliny the Elder, *Natural History* 5.15 | 2 cards | Bostock & Riley (1855), PD | Essenes. Pliny says nothing about Essene diet |
| Porphyry, *De abstinentia* | 3 files | Thomas Taylor (1823), PD | **Corrected 2026-10-10: Porphyry never says the Essenes abstained from animal food.** He includes them in a book arguing for abstinence, following Josephus (4.11-13; excerpt held). The line "the Essenes, who are a sect of the Jews, abstain from all animal food" is not in Book 4. The only ancient text that says it outright is Jerome, *Against Jovinianus* 2.14, crediting Josephus, who doesn't say it |
| Testaments of the Twelve Patriarchs | 1 card | Charles (1913), PD | "Spirit of truth / spirit of deceit" (T. Judah 20); needed to keep the DSS vocabulary claim honest |
| Gospel of Mary | source hierarchy, tier 3 | Modern translations in copyright; short excerpts | Named in `CLAUDE.md` as a source; no file |
| Gospel of the Ebionites (fragments) | sacrifice card | Only via Epiphanius; Ehrman, *Lost Scriptures* (in copyright) | Evidence of what the Ebionites believed, not of what Jesus said |
| 4Q473 (Two Ways fragment) | one research file | Scholarly editions in copyright | Heavily bracketed reconstruction; never quote as continuous prose |
| Standard lexica (BDAG, LSJ) for *aiōnios*, *kolasis*, *thuō* | hell and sacrifice cards | LSJ (1940) is PD; Perseus hosts it | No lexicon in the repo. Keep the Greek arguments short and footnote-level |

---

## Not sources (ours, not theirs)

- `christianity/*.md` research and analysis files, `*-cliff-notes*`, `00-overview.md` files
- `questions/` — the cards. They quote Tier 1/2 files; check the quotation there
- `jesus-site-reference/` — the published site text, in both languages
- `podcast-archive/` — auto-captions. Pointers to where a topic was discussed, never proof. Two of the first five fabricated citations entered the repo as podcast captions with quotation marks added
- `extended-library/essene-gospel-of-peace.md` — an essay about a Tier 4 text
- Anything marked DRAFT, WORKING, or `_private`

---

## The header that makes a file a source

Every Tier 1-4 file opens with the provenance block from `CONTRIBUTING.md`. `scripts/semantic-search.py` reads it and attaches it to every passage it returns, so a file with no header is flagged in every search result. Add a **Status** line, which the indexer also reads:

```markdown
**Status:** Verified full text — 2026-10-07 audit
**Status:** Verified excerpts — quote only what is here
**Status:** Reconstruction — no manuscript
**Status:** Disputed provenance — never cite as ancient
**Status:** Unverified — held, not yet checked
```

## Adding a text

1. **Rights first.** Public domain (published before 1929 in the US, or an open license like Wikisource), or short attributed excerpts of an in-copyright translation. Never a whole copyrighted book. `dead-sea-scrolls-selected-texts.md` is the model for excerpts.
2. **Name the edition.** Translator, title, publisher, year, and where the text was fetched from. "Which translation" is the one fact that cannot be reconstructed later.
3. **Put the header on it**, including `Contributed by:` with your name and the date.
4. **Spot-check it.** Open the scan or the published page and confirm three passages verbatim. Note anything that will defeat grep (OCR damage, line wrapping).
5. **Add the row here**, in the right tier, with the audit status "Held; not yet audited" until someone verifies more than the spot-check.
6. **Then** research files may quote it.

---

*Built 2026-10-07 from the source audit. Keep this page current: a text that isn't on it can't be quoted, and a text that's on it wrongly will be.*
