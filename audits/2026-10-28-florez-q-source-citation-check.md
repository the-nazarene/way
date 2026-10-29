# Citation check: "Polemic Answers, The Q Source, Why We Use It and Why Scholarship Finds It Credible" (Christian Florez)

**Contributed by:** Christian Florez, 2026-10-28 (sent to the group to be added; passed on by Matt). This report checks his research sheet.
**Sheet:** `extended-library/polemic-answers-q-source-florez.md` (contributed by Christian Florez, 2026-10-28; about 7,500 words; 242 lines)
**Checked:** 2026-10-28, against texts the repo holds only (no web). No repo file was edited except this report, its repo map, and `claims/`.
**Method:** every claim about the wording of Matthew, Mark, Luke, James, Paul, Papias or Thomas was checked in the held text. Greek agreement counts were made from Westcott-Hort by aligning the two passages word by word (bracketed words kept, brackets dropped) and counting the words of the shorter-or-Matthean side that are identical and in the same order. Line numbers are as of today; the quoted phrase is the durable reference. Each checked claim has a `claims/` entry (C259-C284); `python3 scripts/claims.py check` confirms each quotation below **Text says:** is really in the held file.

**Held texts used**
- Greek NT: `christianity/Incoming/greek-nt-westcott-hort/` (Westcott-Hort 1881), cited "(W-H)"
- KJV: `christianity/Incoming/kjv/`, cited "(KJV)"
- Eusebius, *Church History*: `christianity/Incoming/eusebius-church-history-full-text.md` (McGiffert, NPNF 2.1), for Papias
- Gospel of Thomas: `christianity/Incoming/gospel-of-thomas-full-text.md` (Lambdin)
- The repo's Q reconstruction: `christianity/Incoming/q-source-reconstruction.md` (Tier 3: KJV parallels, IQP passage list, Harnack 1908, Lambdin for Thomas)
- Irenaeus, Epiphanius, Jerome: through existing claims C2, C20, C41, C42

**A note on translations.** The sheet quotes the ASV (1901), which we don't hold. The ASV follows the critical Greek, close to W-H; the KJV follows the Textus Receptus. That matters once in this sheet, and badly: **the KJV prints the long, harmonized Lord's Prayer at Luke 11:2-4**, so a KJV reader will not see the "much shorter" Luke the sheet describes (C264). Everywhere else the KJV shows the same agreements and differences the sheet points to.

**What the sheet is.** A careful defense of Q that keeps the document (a hypothesis) apart from the sayings (in the canon). Most of its argument is scholarship we don't hold (Streeter, Kloppenborg, Goodacre, Fitzmyer). What we can check is the text it argues from: the verbatim agreements, the doublets, the differences, Matthew's additions to Mark, the minor agreement, Papias, and the Torah and Israel sayings. Those check out, with four exceptions.

---

## Summary

**Counts.** 26 new `claims/` entries (C259-C284): **17 Matches, 2 Matches (other translation), 4 Reads differently, 3 Not held.** One entry (C263) is a held example the sheet doesn't use. The existing entries C2, C7, C13, C17, C20, C41 and C42 now also apply to this sheet (last section). About twenty more verse checks are in the tables and not repeated in `claims/`.

**The headline Greek claim is exact.** John the Baptist's sermon: from γεννηματα to the end, Matthew 3:7b-10 has 63 words, Luke 3:7b-9 has 64, and 60 are identical and in the same order (C259). That is the sheet's "about sixty of roughly sixty three", which its own verification note left as approximate. The thanksgiving (Luke 10:21-22 // Matthew 11:25-27) and the lament over Jerusalem (Luke 13:34-35 // Matthew 23:37-39, both with ορνις, "hen") also match as described (C260, C261). Matthew 6:24 // Luke 16:13, which the sheet doesn't use, is closer still: 27 words identical, Luke adding one (C263).

**Points where our held texts read differently:**
1. **Ask, seek, knock (B1, line 85).** "Near verbatim through the whole run" holds for the first two verses only (Matthew 7:7-8 // Luke 11:9-10). Then Matthew has bread/stone and fish/serpent, Luke fish/serpent and egg/scorpion, and the ending is "good things" against "the Holy Spirit". Across the run, 52 of Matthew's 73 words are identical and in order (C262). The sheet itself uses the "good things" / "Holy Spirit" difference two sections later (B6, C266).
2. **"To Israelite towns" / "to Israel only" (C4 line 151; short versions lines 198, 204).** Luke's mission instructions (10:1-12) send the seventy "into every city and place, whither he himself would come" with no restriction. The Israel-only command is Matthew 10:5-6 ("Go not into the way of the Gentiles"), which has no Luke parallel, so it is Matthew's own material, not double tradition (C270). The rest of the Israel case holds: Chorazin, Bethsaida and Capernaum, "not in Israel", the twelve tribes (C280).
3. **The "ashamed" doublet (B5, line 109).** Mark 8:38 is "copied at Luke 9.26 and Matthew 16.27", but Matthew 16:27 drops the "ashamed of me" saying and keeps only the coming in glory (C271). The doublet is clean in Luke (9:26 and 12:8-9); Matthew's form is at 10:32-33 only. The other doublets match (C272).
4. **"Q 6.24" (C5, line 155).** The woe on the rich (Luke 6:24) has no Matthew parallel, so it is Luke's own material, and our Q reconstruction's unit stops at 6:23 (C273). The James 5:1 parallel is fine; cite it as Luke 6:24.

**Not a misreading, but a reader holding a KJV will see something else:** the Lord's Prayer (C264, above). The sheet is right about the critical text (44 words in Luke, 61 in Matthew, in W-H). Our own Q reconstruction prints the long KJV Luke while calling it shorter, which is already AUDIT-LIST A19.

**Not held, and worth knowing before use:** the verse count ("between 230 and 240", "235"), the IQP *Critical Edition*, and Q's date (C282); all the modern scholarship, including the variable-agreement measurements and the "ninety percent of Mark" figure (C283); whether "the manuscripts of Luke 22.64 are not uniform" (C284; W-H prints the words without brackets). Section 5.

**Our own files** (section 7): the Q reconstruction's "~37% of the passages" have a Thomas parallel, but by its own entries 28 of its 52 units do (54%). The figure probably comes from Thomas's side ("roughly 37 of the 114" Thomas sayings have Q parallels, which is what `questions/the-gospel-of-thomas.md:34` says, and what the reconstruction's own list supports: 39 different Thomas sayings).

---

## 1. Greek agreement in the double tradition (Westcott-Hort)

| Sheet (line) | Claim | W-H (file:line) | Verdict |
|---|---|---|---|
| B1 (83) | Luke 3:7-9 // Matthew 3:7-10: of roughly 63 words about 60 identical and in order; the only real difference is "think not" / "begin not" | 01-matthew.md:79-82; 03-luke.md:163-165. 63 / 64 words, 60 identical in order. Differences: δοξητε / αρξησθε; καρπον αξιον / καρπους αξιους; Luke adds και before "the axe" | **Matches** (C259). Two small differences besides the one named |
| B1 (85) | Luke 10:21-22 // Matthew 11:25-27 "nearly as tight" | 03-luke.md (10:21-22); 01-matthew.md (11:25-27). 69 / 74 words, 55 identical in order | **Matches** (C260) |
| B1 (85) | Luke 13:34-35 // Matthew 23:37-39, rare word for "hen", "how often would I have gathered thy children... her own brood under her wings" in both | 03-luke.md:13:34 ορνις την εαυτης νοσσιαν; 01-matthew.md:23:37 ορνις επισυναγει τα νοσσια [αυτης]. 45 of 55 identical in order | **Matches** (C261). "Her own brood" is Luke's wording |
| B1 (85) | Luke 11:9-13 // Matthew 7:7-11 near verbatim through the whole run | 7:7-8 // 11:9-10: 24 of 24; 7:9-11 // 11:11-13: 28 of 49 | **Reads differently** (C262) |
| (not in sheet) | Held example for B1 | 03-luke.md 16:13 ουδεις οικετης δυναται δυσιν κυριοις...; 01-matthew.md 6:24 the same 27 words without οικετης | **Matches** (C263) |
| B2, B6 (91, 113) | Luke 11:2-4 much shorter than Matthew 6:9-13 | W-H Luke 44 words, Matthew 61; Luke lacks "our... in the heavens", "thy will be done", "deliver us from the evil" | **Matches** (C264). KJV Luke has the long form |
| B2, B6 (91, 113) | Beatitudes: Luke four, second person, "ye poor"; Matthew eight, third person, "poor in spirit" | 03-luke.md 6:20-22 (four μακαριοι); 01-matthew.md 5:3-10 (eight) plus 5:11 μακαριοι εστε | **Matches** (C265). Matthew's ninth (5:11) is second person |
| B6 (113) | Matthew 7:11 "good things", Luke 11:13 "Holy Spirit" | 01-matthew.md 7:11 δωσει αγαθα; 03-luke.md 11:13 δωσει πνευμα αγιον | **Matches** (C266) |
| D (169) | Minor agreement: Mark 14:65 "Prophesy"; Matthew 26:68 and Luke 22:64 add "who is he that struck thee?" | 02-mark.md 14:65 προφητευσον; 01-matthew.md 26:68 and 03-luke.md 22:64 τις εστιν ο παισας σε | **Matches** (C267) |
| C3 (147) | Q 16:17 // Matthew 5:18; the tittle is *keraia* | 03-luke.md 16:17 μιαν κεραιαν πεσειν; 01-matthew.md 5:18 ιωτα εν η μια κεραια | **Matches** (C268). Shared image and word; Luke is a comparison, Matthew an oath |
| A8 (67) | The double tradition "never uses the word 'church'" | No εκκλησια anywhere in W-H Luke; Matthew has it twice, at 16:18 and 18:17, both Matthew's own material | Matches |

## 2. Wording in the KJV (the canon side of every claim)

| Sheet (line) | Claim | KJV (file:line or verse) | Verdict |
|---|---|---|---|
| C3 (147) | Q 11:42: "but these ought ye to have done, and not to leave the other undone" | 42-luke.md 11:42; 40-matthew.md 23:23 has the same clause | **Matches** (C269). "The love of God" is Luke's; Matthew has "judgment, mercy, and faith" |
| C3 (147) | Q 16:17 "easier for heaven and earth to pass away, than for one tittle of the law to fall" | 42-luke.md 16:17 "than one tittle of the law to fail" | Matches (KJV "fail", ASV "fall") |
| C4 (151); F (198, 204) | Mission instructions send the students "to Israelite towns"; "to Israel only" | 42-luke.md 10:1 "into every city and place"; 10:8 "into whatsoever city ye enter"; Israel-only is 40-matthew.md 10:5-6 | **Reads differently** (C270) |
| C4 (151) | Chorazin, Bethsaida, Capernaum; "in Israel"; thrones over the twelve tribes | 42-luke.md 10:13, 10:15, 7:9, 22:30 | **Matches** (C280). "Twelve thrones" is Matthew 19:28 only |
| A8 (67) | The one cross saying is Q 14:27, about the follower | 42-luke.md 14:27; 40-matthew.md 10:38 | **Matches** (C281). Thomas 55 has it too |
| B3 (97) | Luke lacks Matthew's additions: Peter on the water, the rock, Pilate's wife, Pilate's hands, the saints rising, the guard | 40-matthew.md 14:29, 16:18, 27:19, 27:24, 27:52, 27:65; none in KJV Luke | **Matches** (C278) |
| B3 (99) | Judas's death: Matthew 27:3-10 against Acts 1:18-19 | 40-matthew.md 27:5, 27:7; 44-acts.md 1:18 | **Matches** (C279) |
| B5 (109) | "Whosoever hath" doublet: Luke 8:18 / 19:26; Matthew 13:12 / 25:29; Mark 4:25 | all five verses as stated | **Matches** (C272) |
| B5 (109) | "Ashamed" doublet: Mark 8:38 copied at Luke 9:26 and Matthew 16:27; again at Luke 12:8-9, Matthew 10:32-33 | 41-mark.md 8:38; 42-luke.md 9:26 "ashamed"; 40-matthew.md 16:27 no "ashamed" | **Reads differently** (C271) |
| B5 (109) | Mustard seed (Mark 4:30-32) paired with leaven in Matthew 13:31-33 and Luke 13:18-21 | 40-matthew.md 13:33; 42-luke.md 13:20-21; no leaven in Mark 4 | Matches |
| B5 (109) | Beelzebul: Matthew 12:22-30 and Luke 11:14-23 share sayings Mark 3:22-27 lacks | 40-matthew.md 12:30 and 42-luke.md 11:23 "He that is not with me is against me"; not in Mark 3 | Matches |
| C5 (155) | James 1:5, 1:22-25, 2:5, 4:11-12, 5:1, 5:12 echo the sayings | 59-james.md, all six | **Matches** (C274) |
| C5 (155) | James 5:1 with "Q 6.24" | 42-luke.md 6:24, no Matthew parallel | **Reads differently** (C273) |
| C1 (139) | Galatians 1:11-12, "not from man", by revelation | 48-galatians.md 1:11-12 "not after man... neither received it of man" | **Matches, other translation** (C275) |
| C3 (147) | Romans 10:4, "Christ is the end of the law" | 45-romans.md 10:4 "...for righteousness to every one that believeth" | **Matches** (C276); quote the whole verse |
| C3 (147) | Galatians 3:24-25, "our tutor"; "now set aside" | 48-galatians.md "schoolmaster"; 3:25 "no longer under a schoolmaster" | **Matches, other translation** (C277); "set aside" is a gloss |
| B6 (113) | Luke 6:20 "Blessed are ye poor"; Matthew 5:3 "poor in spirit" | 42-luke.md 6:20 "Blessed be ye poor"; 40-matthew.md 5:3 | Matches |

## 3. Papias, the Hebrew Matthew, and Thomas

| Sheet (line) | Claim | Held text | Verdict |
|---|---|---|---|
| B8 (121), D (177) | Papias (Eusebius 3.39.16): "Matthew composed the oracles [*logia*] in the Hebrew dialect, and each one interpreted them as he was able" | McGiffert 3.39.16: "Matthew wrote the oracles in the Hebrew language, and every one interpreted them as he was able." | **Matches, other translation** (existing C13). The sheet quotes New Advent and says so |
| B8 (121) | Papias wrote "around 100 to 130" | Not stated in Eusebius 3.39 | Not held (a modern date) |
| D (165) | The Hebrew Matthew "that Papias, Irenaeus, Origen, Eusebius, Epiphanius and Jerome all describe" | Irenaeus 3.1.1 (C2); Eusebius 3.24.6 (C7); Origen in Eusebius 6.25.4 (C17); Panarion 29.9.4, 30.3.7 (C41, C42); Jerome, *Lives* 3 (C20) | **Matches** for all six. Jerome adds that a copy was "preserved until the present day in the library at Caesarea" and that he copied it (C20); "no surviving manuscript" is true today, not in Jerome's account |
| B7 (117) | Thomas: 114 sayings with no narrative frame, no birth, miracles, passion or resurrection | `gospel-of-thomas-full-text.md` header: "114 sayings attributed to Jesus, with no narrative framework"; saying (114) is the last | Matches |
| B7 (117) | "About a third of its sayings have parallels in the double tradition" | `q-source-reconstruction.md` cites 39 different Thomas sayings as Q parallels (about a third of 114); `questions/the-gospel-of-thomas.md:34` "Roughly 37 of the 114" | Matches (count from our own files, not an independent source) |
| B7 (117) | Greek fragments found at Oxyrhynchus in 1897 and 1903 | Not held (`questions/the-gospel-of-thomas.md` lists P.Oxy. 1, 654, 655 as not held) | Not held |
| A8, C2 (67, 143) | The double tradition has no birth, baptism event, supper, arrest, trial, crucifixion, burial, empty tomb, appearance, or Gentile commission | `q-source-reconstruction.md`, all 52 units (Q 3:7 to Q 22:28-30): none of these is among them | Matches against our reconstruction's list. Expect Matthew 12:40 (Jonah's "three days and three nights") to be raised; it is Matthew's own addition, and Luke 11:30 has only "so shall also the Son of man be to this generation" (KJV) |

## 4. The repo's own Q reconstruction, against the sheet

| Sheet (line) | Sheet says | `q-source-reconstruction.md` says (line) | Note |
|---|---|---|---|
| A5 (55) | Q cited by Luke's numbers | header (5) "IQP convention (Luke chapter:verse)" | Same |
| A7 (63) | The Critical Edition's contents, Q 3:7-9 to Q 22:28-30 | 52 units, 3:7-9 (34) to 22:28-30 (942) | Same frame. Our file also has 12:49-53, 12:54-56, 12:57-59, 14:11, 14:26-27 and 14:34-35, which the sheet's list doesn't name (it cites 14:27 in A8) |
| A3 (47) | "between 230 and 240 verses" | 52 units spanning 252 Luke verses | Same order of size; not a verse count of Q (C282) |
| A9 (71) | "somewhere between the 40s and the 60s, before Mark", "not a single year" | header (7) "c. 40-60 CE — pre-dates the canonical gospels per scholarly consensus" | Agree on the range; the sheet's "not a consensus" (B10) is more careful than our header's "consensus" |
| A4, B3, D (51, 95, 167) | Q is the majority view; Farrer is a real minority view | note (13) "Since Matthew and Luke did not copy from each other directly, they must share a common written source" | The sheet is more careful (repo map C1) |
| B7 (117) | Thomas: "its date is disputed" | (26) "Many scholars... date its earliest layer to c. 50-70 CE" | AUDIT-LIST A19 already flags line 26 |
| B2 (91) | Luke's prayer much shorter | (364, 372) prints the long KJV Luke and calls it shorter | AUDIT-LIST A19 |
| B1 (83) | Baptist's sermon near verbatim | (48) "Matthew and Luke agree almost verbatim" | Same (C259) |

## 5. Not held: cited at reference level only

| Source as cited | Held? | Note |
|---|---|---|
| Robinson, Hoffmann and Kloppenborg, *The Critical Edition of Q* (2000); Robinson, *The Sayings Gospel Q in English* (2002); Fleddermann (2005); the IQP | Not held | C282 |
| Weisse (1838), Holtzmann (1863), Harnack (1907/1908), Streeter (1924) | Not held (Harnack is a source of our reconstruction, but his book isn't in the repo) | C283. The sheet's own verification note asks for Streeter's chapter numbers to be confirmed |
| Kloppenborg, *Formation of Q* (1987), *Excavating Q* (2000); Tuckett (1996); Fitzmyer, Anchor Bible Luke (1981); Hartin (1991); Carson, Moo and Morris; Stein; Blomberg | Not held | C283 |
| Farrer (1955), Goulder, Goodacre (2002), Goodacre and Perrin (2004), Vinson, Garrow | Not held | C283 |
| Variable agreement "from near one hundred percent down to around ten percent"; "about ninety percent of Mark reappears in Matthew and about half in Luke" | Not held | C283. Both could be counted from held W-H with a synopsis; not done here. Our own samples run from 100% (Matthew 6:24) to about 43% (Lord's Prayer, 26 of 61) |
| Luke 22:64 "the manuscripts... are not uniform" | Not held | C284. W-H prints the clause without brackets |
| Pontifical Biblical Institute and Dallas Theological Seminary teaching it | Not held | Institutional claim; reference level |
| Oxyrhynchus 1897, 1903 | Not held | P.Oxy. 1, 654, 655 |

## 6. Internal consistency inside the sheet

1. **"Near verbatim through the whole run" (B1) and the B6 example.** B1 counts ask-seek-knock as near verbatim; B6 uses its last verse as a case where Matthew and Luke differ. Both can't be the whole run (C262).
2. **"Luke never has the addition" (B3) and the minor agreements (Part D).** B3's "never" is absolute; Part D concedes the minor agreements as "the strongest single argument against the Two Source Hypothesis". The five examples in B3 are right (C278); the word "never" is what Part D qualifies.
3. **"Earliest layer" in C3 and Kloppenborg.** C3 says "In the earliest layer, Yeshua is a Torah teacher", using "earliest layer" for Q as a whole. AUDIT-LIST A21 records the report (from Christian's first sheet) that Kloppenborg puts Q 16:17 and Q 11:42c in Q's *latest* layer. The sheet says it doesn't use the strata (Part D), which is consistent, but "earliest layer" next to those two verses will draw the strata objection. "The earliest body of sayings that can be isolated" (C6's own phrase) avoids it.
4. **Israel-only in the short versions.** Part F's "sending his students to Israel" and "still send the students to Israel only" go further than C4's Q evidence supports (C270).

## 7. Possible errors in our own repo files (found during this check)

Candidates for `AUDIT-LIST.md`. Nothing has been changed.

1. **`christianity/Incoming/q-source-reconstruction.md:23, 26` and :960.** "~37% of Q passages have a Thomas parallel" / "Gospel of Thomas parallels triangulating ~37% of the passages". By the file's own entries, 28 of its 52 units list at least one numbered Thomas saying (54%), and the file cites 39 different Thomas sayings. The 37 is most likely the Thomas-side figure ("roughly 37 of the 114", `questions/the-gospel-of-thomas.md:34`) carried over as a percentage of Q. To confirm: decide which figure the file means and whether the loose parallels (e.g. Thomas 24 for the lamp, 10 and 16 for the fire) count.
2. **`christianity/Incoming/q-source-reconstruction.md:13`.** "Since Matthew and Luke did not copy from each other directly, they must share a common written source." That states the Two Source Hypothesis as fact; the sheet (and current scholarship it cites) treats the Farrer theory as a live minority view. A one-clause fix ("On the majority view, Matthew and Luke did not copy from each other...") matches the sheet.
3. **`christianity/Incoming/q-source-reconstruction.md:7`.** "per scholarly consensus" for the 40-60 date; the sheet's "majority, not a consensus" (B10) is the safer wording. Low priority.
4. Already logged: the Lord's Prayer and the Thomas date in the same file (AUDIT-LIST A19).

## 8. Existing claims entries to add "Raised by" to

- **C13** (Eusebius 3.39.16, Papias): add "Christian Florez's Q sheet (lines 121, 177)".
- **C2** (Irenaeus 3.1.1), **C7** (Eusebius 3.24.6), **C17** (Eusebius 6.25.4, Origen), **C20** (Jerome, *Lives* 3), **C41** (Panarion 29.9.4), **C42** (Panarion 30.3.7): add "Christian Florez's Q sheet (line 165)" (the six fathers who describe a Hebrew Matthew).

---

*Checked against held texts only. Where something is "not held", the sheet's claim may well be right; we can't confirm it from the repo.*
