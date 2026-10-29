# Citation check: "Polemic Answers, The Hebrew Gospel of Matthew" (Christian Florez)

**Contributed by:** Christian Florez, 2026-10-28 (sent to the group to be added; passed on by Matt). This report checks his research sheet.
**Sheet:** `extended-library/polemic-answers-hebrew-gospel-of-matthew-florez.md` (contributed by Christian Florez, 2026-10-28; 387 lines, about 9,900 words; untracked on branch `process-florez-four-sheets` when this was made)
**Checked:** 2026-10-28, against texts the repo holds only (no web). No repo file was edited except this report, its companion repo map, and `claims/`.
**Method:** every ancient-witness quotation and every recorded saying the sheet gives was grepped in the held file. Line numbers are as of today; the quoted phrase is the durable reference. Every church-father quotation and source claim has a `claims/` entry: 37 new ones (C167-C203), and 53 existing ones (C1-C109) that already cover a passage this sheet cites. `python3 scripts/claims.py check` confirms each quotation below **Text says:** is really in the held file.

**Held texts used**
- Eusebius, *Church History*: `christianity/Incoming/eusebius-church-history-full-text.md` (McGiffert, NPNF 2.1). McGiffert's notes (`>` lines) are his 1890 commentary, not Eusebius
- Irenaeus, *Against Heresies*: `christianity/Incoming/irenaeus-against-heresies-full-text.md` (Roberts and Rambaut, ANF 1)
- Epiphanius, *Panarion*: `christianity/Incoming/epiphanius-panarion-book-1-full-text.md` (Wescoe; Sects 29, 30 and 46 are all in book 1)
- Jerome, *Lives of Illustrious Men*: `christianity/Incoming/jerome-lives-of-illustrious-men-full-text.md` (Richardson, NPNF 2.3)
- Jerome, *Against the Pelagians*: `christianity/Incoming/jerome-against-the-pelagians-full-text.md` (Fremantle, NPNF 2.6)
- Jerome, *Letters*: `christianity/Incoming/jerome-letters-full-text.md` (NPNF 2.6; Letters 20 and 120 are summaries only)
- Origen, *Commentary on John*: `christianity/Incoming/origen-commentary-on-john-full-text.md` (Menzies, ANF 9; Books I, II, VI, X)
- Clement of Alexandria, *Stromata*: `christianity/Incoming/clement-of-alexandria-stromata-full-text.md` (Wilson, ANF 2); *Paedagogus* 2.1 in `christianity/Incoming/witnesses-on-flesh-and-sacrifice-selected-texts.md` (Tier 2 excerpt)
- Justin, *Dialogue with Trypho*: `christianity/Incoming/justin-martyr-dialogue-with-trypho-full-text.md` (Dods and Reith, ANF 1)
- Ignatius: `christianity/Incoming/ignatius-epistles-full-text.md` (Roberts and Donaldson, ANF 1)
- Gospel of Thomas: `christianity/Incoming/gospel-of-thomas-full-text.md` (Lambdin)
- KJV `christianity/Incoming/kjv/`, cited "(KJV)"; Westcott-Hort `christianity/Incoming/greek-nt-westcott-hort/`, cited "(W-H)"; JPS 1917 `christianity/Incoming/jps-1917/`; Brenton `christianity/Incoming/septuagint-brenton/`

**A note on translations.** The sheet's Epiphanius fragments follow M. R. James (1924), "lightly modernized", and it names Frank Williams's Brill translation for the rest. We hold Wescoe's translation, so most Panarion verdicts are "other translation". Its other fragments come from the earlychristianwritings.com pages (James, Throckmorton, Cameron), which we don't hold; where the father is held, the father's own text was checked.

---

## Summary

**Counts.** 37 new `claims/` entries (C167-C203): **18 Matches, 3 Matches (other translation), 0 Matches (other section number), 4 Reads differently, 12 Not held.** 53 existing entries cover passages this sheet also cites; they are listed at the end and now carry this sheet under "Raised by". Counting new and existing together (90 entries), the sheet's citations come out: **34 Matches, 12 Matches (other translation), 2 Matches (other section number), 13 Reads differently, 2 Can't check** (Jerome's Letters 20 and 120 are summaries in NPNF), **27 Not held**. About 30 more verse checks (W-H and KJV readings in Parts F and H) are in the tables and not repeated in `claims/`.

**The witness quotations are accurate.** Irenaeus 3.1.1 and 1.26.2, Eusebius 3.24.6, 3.25.5, 3.27.4 and 6.25.4, Jerome *Lives* 2 and 3 and *Against the Pelagians* 3.2, Clement *Stromata* 2.9 and *Paedagogus* 2.1, Origen *Commentary on John* (the "my mother" saying), Justin's fire in the Jordan, and every Panarion fragment in Part D say what the sheet says, in different English. Part D's baptism quotation gives all three heavenly voices in order, which is what the held text has (the earlier sheet's version left one out; C46).

**Points where our held texts read differently:**
1. **The Passover saying (D7, line 183; Part H, 297).** Epiphanius doesn't say the Ebionites "turned the sentence into a question". He says they "added the adverb 'not'" (the *mē*) and wrote in "meat", and Wescoe renders the result as a statement: "I have not longed with longing to eat meat this Passover with you" (30.22.4-5; C49). In the same passage he says Jesus "both kept the Passover and ate meat". On Luke: the *ou mē* in 22:16 is in W-H ("ου μη φαγω αυτο", C185), but the KJV reads "I will not any more eat thereof", which implies he is eating it (C177). "The two versions agree that Yeshua did not eat the Passover lamb" is a reading of Luke 22:15-16, not something either held text says.
2. **The Travels of Peter (D8, line 187).** 30.15.1-3 has the Clement attribution and Peter abstaining "from animate creatures and from meats", but nothing about condemning the sacrifices. The book Epiphanius says declares "against the temple and the sacrifices" is the *Ascents of James* (30.16.7), and the speaker is James (C173).
3. **The Tiberias treasury (A6, line 73).** 30.3.8 names only John (30.3.9 adds Acts). In 30.6.9 John and Acts are "translated from Greek into the Hebrew tongue", but Matthew is "Hebrew by origin", not a translation. Wescoe calls the man Josephus, and he is not yet a convert when he reads them (C170). This favours the sheet's point; the wording is just different.
4. **Papias's *logia* for Mark (Part J, line 346).** McGiffert prints "the Lord's discourses" at 3.39.15, and his note 962 says the manuscripts are "about equally" split between *logōn* and *logiōn* (C169). The argument works on the editors' majority text but rests on a variant.
5. **Papias and the Gospel according to the Hebrews (A1, line 43; timeline, 311).** The woman story is in McGiffert 3.39.16, the same section as the Matthew sentence, with one sentence (on 1 John and 1 Peter) in between, so not "the very next sentence". McGiffert's note 967: Eusebius "does not say that Papias took the story from the Gospel according to the Hebrews, but only that it was contained in that Gospel". The timeline's "Papias... uses the Gospel according to the Hebrews" goes past the text (C14).
6. **Pantaenus (A3, line 53).** McGiffert 5.10.3 has "the writing of Matthew in the Hebrew language". "Hebrew letters" is Jerome's wording (*Lives* 36, "written in Hebrew characters") (C16, C22).
7. **Hegesippus (A5, line 61).** McGiffert numbers it 4.22.7 and prints one book, "the Syriac Gospel according to the Hebrews", where the sheet reads three sources. His note 1242 says the Greek is "very difficult" and can support the three-source reading (C15).
8. **Jerome at Beroea (A7, line 79; Part C4, 125; timeline, 321).** Richardson has the Nazarenes of Beroea *describe* the volume to Jerome ("having the volume described to me"), not Jerome copying it. Other translations render the Latin "to copy"; this is a question for the Latin, not an error found (C20). Part C4's "the only father who says he copied the Nazarenes' book" depends on it.
9. **"One name, one book" (Part C2, line 117; Part B table).** Epiphanius 46.1.9, which we hold, says Tatian's Diatessaron "some call the Gospel according to the Hebrews" (C50). So at least one ancient writer applies the name to a different book. This doesn't touch the Matthew identification, but "every ancient witness" needs that exception.
10. **The prophets sentence (E6, line 207; Part F, 261).** In the held NPNF *Against the Pelagians* 3.2, "Even the prophets, after they were anointed with the Holy Spirit, were guilty of sinful words" stands outside the quotation marks, after the Lord's answer (C25). Whether it is gospel text or Jerome's comment depends on punctuation; the Zion margin at Matthew 18:22 (not held) is the evidence that it is gospel text. "Appears word for word in Jerome's quotation" is too strong for the held translation.
11. **Clement's longer form and Thomas 2 (E3, line 201).** Only the 2.9 form is credited to "the Gospel to the Hebrews" ("as it is written"); the 5.14 form names no source in the held text (C36, C37). Lambdin's Coptic Thomas 2 runs seek, find, troubled, astonished, rule over the All, with no "rest" (C57); "nearly word for word" holds for the Greek P.Oxy 654 (not held, C98).
12. Smaller: Jerome places the "handle me" saying in Ignatius's letter "to Polycarp" ("In this last"); his translator's note 2406 says Eusebius has Smyrnaeans, which is where the held Ignatius has it (C21, C29). Origen's "2.12.87" is Menzies Book II §6 (C38). Wescoe marks a gap between Andrew and Thaddaeus in D5's list of names (C44). The sacrifice saying is 30.16.5a; 30.16.4 is the lead-in (C48). 3.27.4's Ebionites are the second group of 3.27.3 (C9).

**Not held, and worth checking before use:** Jerome's commentaries (Matthew, Isaiah, Ezekiel, Micah, Ephesians) and his translated Letter 20 and Letter 120, which carry ten of the sayings (C83-C90, C193, C27, C28); Origen's Matthew commentary (Latin) and Homilies on Jeremiah and Luke (C92, C93, C192); Eusebius's *Theophany* (C94, C95); the Zion-edition margins (C196); Codex Vercellensis and Bezae (C197, C198); Edwards (C202). Detail in section 7.

**Held commentary that takes the other side.** McGiffert's note 831 (Eusebius 3.27) argues that Epiphanius "meant to distinguish the Gospel of the Ebionites from that of the Nazarenes", and that Eusebius treated the Gospel according to the Hebrews and the Hebrew Matthew as two books, while allowing that they may have been one originally. His note 920 (3.36) argues the "handle me" saying was not originally in the Gospel according to the Hebrews. These are an 1890 editor's readings, not sources, but they are in a held file and someone will quote them. Part J's objections don't mention either.

---

## 1. Part A: the witnesses that Matthew wrote in Hebrew

### 1a. Eusebius, *Church History* (McGiffert)

| Sheet | Sheet's wording | Held text (line) | Verdict |
|---|---|---|---|
| A1 (41) | 3.39.16: "Matthew put together the oracles in the Hebrew language, and each one interpreted them as best he could" | :3216 "So then Matthew wrote the oracles in the Hebrew language, and every one interpreted them as he was able" | **Matches, other translation** (C13) |
| A1 (43) | 3.39.17, "in the very next sentence", the woman "accused of many sins before the Lord", in the Gospel according to the Hebrews | :3216 (McGiffert §16), after a sentence on 1 John and 1 Peter; note 967 | **Matches, other section number** (C14). See point 5 |
| A5 (61) | 3.24.6: Matthew "committed his Gospel to writing in his native tongue" | :2618, word for word | **Matches** (C7) |
| A5 (61) | 3.25.5: "in which those of the Hebrews who have accepted Christ take special delight"; among the disputed books | :2696 "with which those of the Hebrews that have accepted Christ are especially delighted. And all these may be reckoned among the disputed books" | **Matches, other translation** (C8) |
| A5 (61) | 3.27.4: the Ebionites "use only the so-called Gospel according to the Hebrews and make small account of the rest" | :2814 "they used only the so-called Gospel according to the Hebrews and made small account of the rest" | **Matches** (C9). "These men" are the second group of 3.27.3 |
| A5 (61), B (95), timeline (313) | 4.22.8: Hegesippus quoted "from the Gospel according to the Hebrews and from the Syriac, and particularly from the Hebrew language" | :4178 (§7) "from the Syriac Gospel according to the Hebrews he quotes some passages in the Hebrew tongue"; :4212 note 1242 | **Reads differently** (C15). See point 7 |
| A3 (53) | 5.10.3: Bartholomew "left with them the writing of Matthew in the Hebrew letters" | :5140 "left with them the writing of Matthew in the Hebrew language" | **Reads differently** (C16): "letters" is Jerome's word |
| A4 (57) | 6.25.4: "The first was written by Matthew... prepared for the converts from Judaism and published in the Hebrew language" | :6742, word for word except "publican" for "tax collector" | **Matches** (C17) |
| D2 (155) | 2.23.5: James "ate no flesh" | :1650 "nor did he eat flesh" | **Matches, other translation** (C168). "Ate no flesh" is Jerome's wording of the same passage (*Lives* 2) |
| Part J (346) | Papias uses *logia* for Mark ("the Lord's logia") | :3214 (3.39.15) "the Lord's discourses"; :3264 note 962 | **Reads differently** (C169). See point 4 |

### 1b. Irenaeus, *Against Heresies* (ANF 1)

| Sheet | Sheet's wording | Held text (line) | Verdict |
|---|---|---|---|
| A2 (47) | 3.1.1: "Matthew also issued a written Gospel among the Hebrews in their own dialect, while Peter and Paul were preaching at Rome and laying the foundations of the Church" | :2210, word for word | **Matches** (C2) |
| A2 (49) | 1.26.2: "use the Gospel according to Matthew only, and repudiate the Apostle Paul, maintaining that he was an apostate from the law" | :986, word for word | **Matches** (C1) |
| A2 (49) | 1.26.2: circumcised, keep the law, "adore Jerusalem as if it were the house of God" | :986 "they practise circumcision, persevere in the observance of those customs which are enjoined by the law... adore Jerusalem as if it were the house of God" | **Matches** (C167) |
| A2 (49) | 3.11.7: the Ebionites use only Matthew | :2548 "the Ebionites, who use Matthew's Gospel only" | **Matches** (C3) |

### 1c. Epiphanius, *Panarion* (Wescoe), witness statements

| Sheet | Sheet's wording | Held text (book-1 line) | Verdict |
|---|---|---|---|
| A6 (69), B (97) | 29.9.4: the Nazarenes have Matthew complete, in Hebrew, in Hebrew letters; he doesn't know whether they removed the genealogies | :3053-3057 "They have the Gospel according to Matthew complete, in Hebrew... as it was originally written, in Hebrew letters. Whether they have also removed the genealogies... I do not know" | **Matches** (C41) |
| A6 (71) | 30.3.7: they accept Matthew, use it alone, call it "according to the Hebrews", because Matthew alone wrote in Hebrew and Hebrew script | :3119-3123 | **Matches** (C42) |
| A6 (71), B (96), C3 (121) | 30.13.1-2: "according to Matthew"... "not complete but corrupted and mutilated, and they call it Hebrew" | :3365 "named 'according to Matthew' — not whole and entirely complete, but falsified and mutilated (and they call it Hebrew)" | **Matches, other translation** (C43) |
| A6 (73) | 30.3.8 and 30.6.9: Joseph of Tiberias found Hebrew translations of John, Acts and Matthew in a sealed treasury | :3125, :3127, :3195 | **Reads differently** (C170). See point 3 |

### 1d. Jerome (Richardson; Fremantle)

| Sheet | Sheet's wording | Held text (line) | Verdict |
|---|---|---|---|
| A7 (79) | *Lives* 3: composed in Hebrew; translated into Greek "by what author is uncertain"; preserved at Caesarea; "I also was allowed by the Nazarenes... to copy it" | `jerome-lives`:366, word for word to "Pamphilus so diligently gathered"; then "I have also had the opportunity of having the volume described to me by the Nazarenes of Beroea" | **Reads differently** (C20) on the last sentence only. See point 8 |
| A7 (79), E17 (231) | *Lives* 3: Old Testament quotations follow the Hebrew, not the Septuagint: "Out of Egypt have I called my son", "he shall be called a Nazarene" | :366 "he does not follow the authority of the translators of the Septuagint but the Hebrew" | **Matches** (C174). Brenton Hosea 11:1 has "his children", JPS "My son" (C188) |
| A3 (53) | *Lives* 36: Pantaenus brought the book back to Alexandria | :684 "on his return to Alexandria he brought this with him written in Hebrew characters" | **Matches** (C22) |
| A7 (83), B (98) | *Against the Pelagians* 3.2: "written in the Chaldean and Syrian language but in Hebrew letters... the Gospel according to the Apostles, or, as most people maintain, the Gospel according to Matthew, a copy of which is in the library at Caesarea" | `jerome-against-the-pelagians`:1160 "Chaldee and Syrian language, but in Hebrew characters... (I mean the Gospel according to the Apostles, or, as is generally maintained, the Gospel according to Matthew, a copy of which is in the library at Cæsarea)" | **Matches, other translation** (C23) |
| A7 (81), C4 (125), B (100) | *Commentary on Matthew* 12.13: "the Gospel which the Nazarenes and the Ebionites use... the authentic Gospel of Matthew" | Not held | **Not held** (C84). The sheet calls it "the single most important sentence"; it is the one central witness we can't check. McGiffert's note 831 cites the same passage |

---

## 2. Part D: the fragments in *Panarion* 30 (Wescoe, book 1)

| Sheet | Sheet's wording | Held text (line) | Verdict |
|---|---|---|---|
| D1 (147) | 30.13.6 and 30.14.3: Herod, Caiaphas, John baptizing in the Jordan, "of the lineage of Aaron the priest, a son of Zacharias and Elisabeth" | :3381 "he was reputed to come of the family of Aaron the priest, a child of Zacharias and Elizabeth"; :3405 (30.14.3) | **Matches, other translation** (C171, C43). Wescoe brackets the Caiaphas clause in 30.13.6, not in 30.14.3 |
| D2 (153) | 30.13.4-5: Pharisees baptized, camel's hair, wild honey "whose taste was the taste of manna, as a cake dipped in oil" | :3373-3377 "which tasted of manna, like a cake made with oil"; :3379 "make it a cake in honey instead of locusts" | **Matches, other translation** (C45). "Made", not "dipped" (the sheet's own D2 comment and Part J say "made") |
| D2 (155) | Epiphanius accuses them of "changing one letter" (*akris*/*enkris*) | :3379 (English only) | Can't be seen in the held English; the charge of a change is there (C45) |
| D3 (159) | 30.13.7-8: Spirit "entering into him"; "You are my beloved Son, in you I am well pleased. And again, This day have I begotten you"; great light; "Who are you, Lord?"; second voice; "I pray you, Lord, baptize me"; "Let it be" | :3383-3397, every element in the same order | **Matches, other translation** (C46). The full sequence is given here, so C46's caveat (about a quotation that dropped the first voice) doesn't apply |
| D4 (165) | 30.14.5: "These are my brothers and mother and sisters, who do the will of my Father" | :3411 | **Matches** (C47). Epiphanius cites it as the Ebionites' grounds for saying "he is not a man" |
| D5 (169) | 30.13.2-3: "a certain man named Yeshua... about thirty years old, who chose us... and you, Matthew... twelve apostles for a testimony to Israel" | :3365-3371 "who selected us"; "Simon and Andrew and [...] Thaddaeus" | **Matches, other translation** (C44). Wescoe marks a gap after Andrew, which may be where the missing names stood |
| D6 (175) | 30.16.4-5: "I came to abolish the sacrifices, and if you do not cease from sacrificing, the wrath will not cease from you" | :3437 (30.16.5a) "I have come to do away with the sacrifices, and unless you cease from sacrificing, the wrath will not cease from you" | **Matches, other translation** (C48). No "of God", as the sheet has it (see AUDIT-LIST A1 for our files) |
| D7 (181-183) | 30.22.4: "Have I desired with desire to eat this flesh, the Passover, with you?"; Epiphanius says they "added the word 'flesh' and turned the sentence into a question" | :3593 "I have not longed with longing to eat meat this Passover with you"; :3597 "they added the adverb 'not'"; :3599 "he both kept the Passover and ate meat" | **Reads differently** (C49). See point 1 |
| D8 (187) | 30.14.3: no genealogies; 30.14.2-4: they use it because they deny the virgin birth | :3405; :3407 "since they wish Jesus to be really a man" | **Matches** (C172). The reason given is for cutting the genealogies |
| D8 (187) | 30.15.1-3: the *Circuits of Peter*, claimed to be Clement's, in which Peter abstains from flesh "and condemns the sacrifices" | :3415 "the so-called Travels of Peter, supposedly, written by Clement"; :3421 "abstained from animate creatures and from meats"; :3443 (30.16.7, *Ascents of James*) "declaring against the temple and the sacrifices" | **Reads differently** (C173). See point 2 |
| C6 (133), Part J (340) | The Ebionites taught Yeshua was born of Joseph and Mary and became Son when the Spirit came into him at the baptism | :3401 (30.14.2a), :3407 (30.14.4); 30.16.3 "born from a man's seed and was chosen, and so by election was called Son of God" | Matches (C172, C124) |

---

## 3. Part E: the fragments in Clement, Origen, Eusebius and Jerome

| Sheet | Saying | Held text (line) | Verdict |
|---|---|---|---|
| E1 (197) | The whole fount of the Spirit; "my firstborn Son" (Jerome, *Comm. Isaiah* 11.2) | Not held | **Not held** (C88). Sirach 24:7 (Brenton) matches the comparison (C190); KJV Isaiah 11:2 "the spirit of the LORD shall rest upon him" |
| E2 (199) | "My mother, the Holy Spirit, took me by one of my hairs and carried me away to the great mountain Tabor" (Origen, *Comm. John* 2.12.87); Origen prefaces "if anyone accepts the Gospel according to the Hebrews" | `origen-commentary-on-john`:664 (Menzies Book II §6) "If any one should lend credence to the Gospel according to the Hebrews, where the Saviour Himself says, 'My mother, the Holy Spirit took me just now by one of my hairs and carried me off to the great mount Tabor'" | **Matches, other section number** (C38). Origen then calls the passage not "hard to explain", which fits "respectfully" |
| E2 (199) | Same saying in Origen, *Hom. Jer.* 15.4; Jerome on Micah 7.6, Isaiah 40.9, Ezekiel 16.13; Jerome's *ruach* explanation at Isaiah 40.9 | Not held | **Not held** (C93, C89, C193). KJV Ezekiel 8:3 "took me by a lock of mine head" matches the comparison (C183) |
| E3 (201) | Clement, *Strom.* 2.9.45: "as it is written in the Gospel according to the Hebrews, He who marvels shall reign, and he who has reigned shall rest" | `clement-stromata`:1750 "So also in the Gospel to the Hebrews it is written, 'He that wonders shall reign, and he that has reigned shall rest'" | **Matches, other translation** (C36). Part J's "introduced it with 'it is written'" matches |
| E3 (201) | *Strom.* 5.14.96, the fuller form; same as Thomas 2, Greek on P.Oxy 654 | 5.14 names no source; Lambdin Thomas 2 (`gospel-of-thomas`:17) has no "rest" | **Reads differently** (C37, C57). P.Oxy 654 not held (C98). See point 11 |
| E4 (203) | Jerome, *Lives* 2: the linen cloth to the servant of the priest; James's vow; "Bring a table and bread"; "My brother, eat your bread, for the Son of Man is risen from among those that sleep"; "which I have recently translated into Greek and Latin, which Origen also often uses" | `jerome-lives`:350 "after he had given his grave clothes to the servant of the priest, appeared to James... 'Bring a table and bread,' said the Lord... my brother eat thy bread, for the son of man is risen from among those that sleep" | **Matches, other translation** (C18, C19). "Grave clothes", not "linen cloth"; "He brought bread", not "He took the bread" |
| E4 (203) | 1 Cor 15:7; Luke 24:30-35 | KJV 46-1-corinthians.md:421; 42-luke.md:1214, :1219 | **Matches** (C180) |
| E5 (205) | *Against the Pelagians* 3.2: the mother and brothers propose going to John; "In what have I sinned...? Unless perhaps this very thing that I have said is ignorance" | `jerome-against-the-pelagians`:1160 "what sin have I committed that I should go and be baptized by him? Unless, haply, the very words which I have said are only ignorance" | **Matches, other translation** (C24) |
| E6 (207) | *Against the Pelagians* 3.2: seven times in a day; "until seventy times seven. For even among the prophets... a word of sin was found" | :1160 "I say unto thee until seventy times seven." Even the prophets... were guilty of sinful words. | **Matches, other translation** (C26) for the dialogue; the prophets sentence is outside the quotation in NPNF (C25). See point 10 |
| E7 (209) | Origen, *Comm. Matt.* 15.14 (Latin): the second rich man; "fulfil the law and the prophets"; "sons of Abraham, covered in filth" | Not held | **Not held** (C92). ANF 9 prints books 1, 2 and 10-14 only, and we hold none of it |
| E8 (211) | Jerome, *Comm. Matt.* 12.13: the mason | Not held | **Not held** (C84) |
| E9 (213) | Eusebius, *Theophany* 4.22 (Syriac): the three servants | Not held | **Not held** (C95). C95 records the same parable from the Greek fragment (Mai, PG 24.685-688); the sheet gives the Syriac locus. Confirm which |
| E10 (215) | *Theophany* 4.12: "I choose for myself the most worthy" | Not held | **Not held** (C94) |
| E11, E12 (217, 219) | Jerome on Ephesians 5.4, Ezekiel 18.7 | Not held | **Not held** (C90) |
| E13 (221) | Papias's woman story; the identification with John 7:53-8:11 | Eusebius :3216 (C14); W-H 04-john.md:373 `[[` | Report **matches** (C14); W-H double-brackets the pericope (C191). McGiffert's note 967 makes the same identification, "very likely" |
| E14 (223) | Jerome, *Lives* 16: Ignatius quoted the Gospel Jerome translated; "Take hold, handle me, and see that I am not a bodiless demon" (*Smyrnaeans* 3.2); Origen gives the *Teaching of Peter* | `jerome-lives`:530 "he bore witness to the Gospel which I have recently translated... 'Behold! touch me and see me how that I am not an incorporeal spirit'"; `ignatius`:1538 "Lay hold, handle Me, and see that I am not an incorporeal spirit" | **Matches, other translation** (C21, C29). Jerome says "In this last", meaning the letter to Polycarp (note 2406). Origen, *First Principles* not held (C91). Eusebius 3.36.11 (held) quotes it without knowing the source (C11) |
| E15 (225) | Didymus, *Comm. Pss.* 184.9-10: Levi and Matthias one man | Not held | **Not held** (C97) |
| E16 (227) | Pseudo-Cyril, Coptic: Michael, Mary, seven months | Not held | **Not held** (C194). The sheet says not to rely on it |
| E17 (231) | *Lives* 3, Hosea 11:1 and "a Nazarene" | See 1d | **Matches** (C174, C188). The *netser* reading is the sheet's: KJV Isaiah 11:1 "a Branch", JPS 1917 "a twig"; Hebrew not held |
| E18 (233) | Jerome, *Comm. Matt.* 6.11, *mahar* | Not held | **Not held** (C83) |
| E19 (235) | Jerome, Letter 20.5, *osanna barrama* | `jerome-letters` summary only | **Can't check** (C27) |
| E20 (237) | Jerome, *Comm. Matt.* 23.35, "son of Jehoiada"; Matthew 23:35, Zechariah 1:1, 2 Chronicles 24:20-22 | Jerome not held; KJV 40-matthew.md:892, 38-zechariah.md:18, 14-2-chronicles.md:589-590 | Jerome **not held** (C85); the Bible verses **match** (C181) |
| E21 (239) | Jerome, *Comm. Matt.* 27.16, *bar rabban* | Not held | **Not held** (C86) |
| E22 (241) | Jerome, *Comm. Matt.* 27.51 and Letter 120.8: the lintel; Josephus *War* 6.5.3; Yoma 39b | Not held; Letter 120 is a summary | **Not held** (C87, C199, C200); Letter 120 **can't check** (C28). KJV Matthew 27:51 "the veil of the temple was rent" |

---

## 4. Part C7 and the timeline: Justin and the light

| Sheet | Claim | Held text (line) | Verdict |
|---|---|---|---|
| C7 (137), timeline (312) | Justin, *Dial.* 88: a fire was kindled in the Jordan when Yeshua went down into the water | `justin-dialogue`:1424 "when He had stepped into the water, a fire was kindled in the Jordan" | **Matches** (C176). Fire, not light; ANF note 2297 links it to the Ebionite gospel |
| C7 (137), D3 (161), timeline (312) | Justin quotes "this day have I begotten you" twice | ch. 88 (:1424), 103 | **Matches** for the wording (C109); Justin names no gospel |
| C7 (137) | Codex Vercellensis and Sangermanensis, Matthew 3:15, the light | Not held | **Not held** (C197) |
| C7 (137), D3 (161), Part H (296) | Codex Bezae, Luke 3:22 | W-H 03-luke.md:178 "εν σοι ευδοκησα" | **Not held** (C198). W-H prints the majority reading |

---

## 5. Part F (the "Jewish" margin readings) and Part G (late witnesses)

| Sheet | Claim | Held text | Verdict |
|---|---|---|---|
| F (249-263) | Thirteen "Jewish" readings in the Zion-edition margins (Cameron's list) | None | **Not held** (C196) |
| F (252) | Matthew 5:22 without "without a cause" | W-H 01-matthew.md:142 no εικη; KJV 40-matthew.md:141 "without a cause" | The canonical side **matches** (C186): the "Jewish" reading is also the critical text |
| F (259) | Matthew 16:2-3 absent, "as in Sinaiticus and Vaticanus" | W-H 01-matthew.md:593-594 in `[[ ]]` | **Matches** (C187); the codices not held |
| F (260) | Matthew 16:17 "son of John"; John 1:42 and 21:15 | W-H 01-matthew.md:608 βαριωνα; W-H 04-john.md:60 ο υιος ιωαννου; KJV "Jona" | Consistent (C80): "son of John" in John is the critical text |
| F (251, 257) | Matthew 4:5 "holy city"; 12:40 "three days and three nights" | W-H 01-matthew.md:97, :436 | The canonical readings are as the sheet says |
| F (261) | Matthew 18:22 margin = Jerome E6 word for word | See point 10 | Margin **not held**; Jerome C25 |
| G1 (273) | *Historia Passionis Domini*: thousands believed at the cross | None | **Not held** (C195; cf. C96, the Haimo citation of the same fragment) |
| G2 (277) | Shem Tov's Matthew 28:19 without the formula | KJV 40-matthew.md:1168 and W-H :1169 have the formula | **Not held** (C201) |
| G2 (277) | Matthew 23:2-3 (Nichols on Shem Tov) | KJV 40-matthew.md:859-860 | Canonical text as usually read; Shem Tov not held |

---

## 6. Part H (Luke) and the other Bible verses

| Sheet | Claim | Held text (file:line) | Verdict |
|---|---|---|---|
| D1 (149), H (295) | Luke 1:5 same priestly descent; 1:36 adds the tie to Mary | KJV 42-luke.md:22, :53 | **Matches** (C179). In Luke the Aaronic line is Elisabeth's |
| D7 (183), H (297) | Luke 22:15 "With desire I have desired"; 22:16 *ou mē* "I will not eat it" | KJV 42-luke.md:1066-1067 "I will not any more eat thereof"; W-H 03-luke.md:1067-1068 "επιθυμια επεθυμησα... ου μη φαγω αυτο" | W-H **matches** (C185); the KJV **reads differently** (C177). See point 1 |
| H (299), E6 | Luke 17:4 "seven times in a day" against Matthew's form | KJV 42-luke.md:827; 40-matthew.md:672-673 | **Matches** (C178) |
| H (298, 300) | Luke 24:30-35 breaking of bread; 24:39 "handle me, and see" | KJV 42-luke.md:1214, :1219, :1223 | **Matches** (C180) |
| D2 (155) | Matthew 3:4 locusts and wild honey | KJV 40-matthew.md:75 | **Matches** (C184) |
| D2 (155), J (336) | Numbers 11:8 "a cake made with oil"; Exodus 16:31 *enkris* | Brenton 04-numbers.md:476 "as the taste [of] wafer made with oil"; 02-exodus.md:509 "as a wafer with honey" | **Matches, other translation** (C189). The Greek word can't be checked |
| D6 (177) | Jeremiah 7:22; Hosea 6:6; Matthew 9:13, 12:7; Isaiah 1:11-15 | KJV 24-jeremiah.md:230; 28-hosea.md:111; 40-matthew.md:289, :402; 23-isaiah.md:28, :32 | **Matches** (C182) |
| E1 (197) | Sirach 24:7 | Brenton 43-sirach.md:709 | **Matches** (C190) |
| E2 (199) | Ezekiel 8:3 | KJV 26-ezekiel.md:181 | **Matches** (C183) |
| E17 (231) | Hosea 11:1 follows the Hebrew | Brenton 28-hosea.md:195 "his children"; JPS 28-hosea.md:195 "My son"; KJV Matthew 2:15 "my son" | **Matches** (C188) |
| E20 (237) | 2 Chronicles 24:20-22; Zechariah 1:1; Matthew 23:35 | KJV, W-H 01-matthew.md:893 υιου βαραχιου | **Matches** (C181) |
| E13 (221) | John 7:53-8:11 missing from the oldest manuscripts | W-H 04-john.md:373 `[[` | **Matches** (C191) |

---

## 7. Not held: cited at reference level only, and what to check

| Source as cited | Held? | Note |
|---|---|---|
| Jerome, *Commentary on Matthew* 12.13, 6.11, 23.35, 27.16, 27.51; *on Isaiah* 11.2, 40.9; *on Ezekiel* 16.13, 18.7; *on Micah* 7.6; *on Ephesians* 5.4 | Not held | C83-C90, C193. NPNF has none of Jerome's commentaries. 12.13 carries Part C4's whole argument; it is the one to add first |
| Jerome, Letters 20.5 and 120.8 | Held as summaries | **Can't check** (C27, C28) |
| Origen, *Comm. Matt.* 15.14 (Latin); *Hom. Jer.* 15.4; *Hom. Luke* 1; *First Principles* pref. 8 | Not held | C92, C93, C192, C91. The Latin *Commentary on Matthew* passage is usually treated as the Latin translator's, not certainly Origen's; C92 already marks it "attributed". So the sheet's "Origen also quotes the Gospel according to the Hebrews at least twice by name" has one held instance (*Comm. John*) |
| Eusebius, *Theophany* 4.12, 4.22 | Not held | C94, C95. Check whether the talents fragment is Syriac 4.22 or the Greek Mai fragment |
| Didymus, *Comm. Pss.* 184.9-10 | Not held | C97 |
| Pseudo-Cyril, Coptic discourse on Mary | Not held | C194 |
| *Historia Passionis Domini* | Not held | C195 |
| Zion-edition "Jewish" margins (1424 and others); Cameron, *The Other Gospels* | Not held | C196 |
| Codex Vercellensis, Sangermanensis, Bezae | Not held | C197, C198 |
| Josephus, *War* 6.5.3; Talmud, Yoma 39b | Not held | C199, C200. The witnesses file has only *War* 2.8.5 |
| Shem Tov / Howard; Du Tillet; Münster; Nichols | Not held | C201. The sheet itself makes nothing rest on them |
| Edwards (2009) | Not held | C202. The source behind Parts C and H, and behind the six figures in `questions/MINING-2026-10-debates.md` (Edwards row). The sheet repeats one of those figures ("about seventy-five" references) and the Semitism argument without a number. Still unverified until the book is held |
| Richard Simon (1689); Vielhauer and Strecker in Schneemelcher; Nicholson (1879); Gregory (2017); Kloppenborg's and Thate's reviews; Kok (e-Clavis) | Not held | C203 for Simon. The rest are modern scholarship, reference level. Gregory's two-Gospel view is the sheet's own "the standard current edition" (383) and is the view AUDIT-LIST A20 says to read |
| P.Oxy 654 (Thomas 2 in Greek) | Not held | C98 |
| M. R. James (1924) and Frank Williams (Brill) for Epiphanius | Other translations | Wescoe is held; verdicts above compare against Wescoe |

---

## 8. Internal consistency inside the sheet

1. **"Dipped" and "made" (D2, 153 and 155).** The fragment is quoted "as a cake dipped in oil"; the comment and Part J (336) say "made with oil". Wescoe and Brenton both have "made with oil".
2. **"Refuses the flesh of the Passover" (Shape 5, 32; Part J, 350) and "they differ on whether he wanted to" (D7, 183).** Part D's careful version is that the two forms agree he did not eat it; the Shape and Part J state the refusal as the book's teaching. Both go past the held Epiphanius, who presents the "not" as an addition (point 1).
3. **"Every father who mentions the book speaks of it in the singular" (C2, 117; Part J, 332)** and Epiphanius 46.1.9, where "according to the Hebrews" names Tatian's harmony (point 9).
4. **Origen "quotes the Gospel according to the Hebrews at least twice by name" (A4, 57)** rests on one held passage and one Latin passage of uncertain authorship (section 7).
5. **Thirties to sixties (timeline, 310).** Irenaeus's "while Peter and Paul were preaching at Rome" puts the Hebrew Matthew in the sixties, as A2 says (47); the timeline's "thirties" has no witness cited.
6. **Tiers.** Jerome's commentary fragments (E1, E8, E11, E12, E18, E20-E22) are marked Tier 1 though none is linked or held; Part A's Jerome *Lives* passages are linked and held. For a reader, the difference is that one set can be opened today and the other can't.

## 9. Overlap with Christian's earlier sheets

- **The Red Letters sheet (`polemic-answers-red-letters-added-florez.md`, checked 2026-10-26)** already carried most of these fragments (its F2-F3) and was the source of C1-C98. This sheet adds Part B's names table, Part C's argument, Part F's margin list, Part H's Luke thesis, D8, the Tiberias story and Justin's fire. Its quotations are, if anything, more careful: D3 gives all three voices, D6 has no "of God", and D7 says "flesh", not "lamb".
- **The Was Yeshua God sheet** used the same Ebionite material for Christology (C116, C123, C124). Consistent.
- **One change of position:** the Red Letters sheet's F3.3 already argued the question form of the Passover saying (repo map 2026-10-26 C2). This sheet adds the *lectio difficilior* argument and the Luke 22:16 *ou mē* point. The held texts bear on both (point 1).

## 10. Possible errors in our own repo files (found during this check)

Candidates for `AUDIT-LIST.md`. Nothing has been changed. Detail and both sides are in the companion repo map, section 3.

1. **`christianity/hebrew-gospel-of-matthew.md:82`.** "Jerome (*De Viris Illustribus* 2) reports it was used by 'the Nazarenes' and that he translated it." *Lives* 2 (held, Richardson :350) says he translated it and that Origen used it; it doesn't mention the Nazarenes. The Nazarenes are in *Lives* 3 and *Against the Pelagians* 3.2.
2. **`christianity/hebrew-gospel-of-matthew.md:21`.** The Jerome row quotes "first of all the evangelists composed a Gospel of Christ in Judea in the Hebrew language and characters" as *Lives* 3, and says he "personally saw a copy 'in the library at Caesarea which the martyr Pamphilus so diligently collected.'" Richardson's *Lives* 3 reads "composed a gospel of Christ at first published in Judea in Hebrew" and "preserved until the present day in the library at Cæsarea which Pamphilus so diligently gathered"; no "first of all the evangelists", no "characters", no "martyr", and no statement that he saw it there. The first phrase may be from the *Commentary on Matthew* preface, which is not held.
3. **`questions/essene-nazarene-origins.md:87`.** "Irenaeus and Epiphanius... place the Ebionites and Nazarenes at Pella." Irenaeus (held) never mentions Pella; Epiphanius does (29.7.7-8). Not from the sheet.
4. **`questions/OBJECTIONS.md:21`.** "(Panarion 30.22.4, Tier 4 until we hold Epiphanius)". The Panarion is now held (Tier 1). The quoted wording, "I have no desire to eat the flesh of this Passover lamb", is AUDIT-LIST A2.
5. **`questions/sacrifice-culture-vegetarian-jesus.md:71`** gives the altered saying as a question ("have I desired to eat flesh with you this Passover?"). Wescoe prints a statement (C49). The card's framing (Epiphanius presents it as an alteration) matches the held text.
6. **The sheet's intake header** (line 12) points to `extended-library/polemic-answers-hebrew-gospel-of-matthew-florez-notes.md`, which does not exist yet. This report could be its basis.

---

## Existing claims entries: add this sheet under "Raised by"

These entries already cover a passage this sheet cites. They were not edited. Suggested line: "Christian Florez's Hebrew Gospel sheet (line N)".

| ID | Passage | Sheet lines | Result (unchanged) |
|---|---|---|---|
| C1 | Irenaeus 1.26.2 | 49 | Matches |
| C2 | Irenaeus 3.1.1 | 47, 310 | Matches |
| C3 | Irenaeus 3.11.7 | 49, 314 | Matches |
| C7 | Eusebius 3.24.6 | 61, 310 | Matches |
| C8 | Eusebius 3.25.5 | 61, 95, 350 | Matches, other translation |
| C9 | Eusebius 3.27.4 | 61, 63, 95, 319 | Matches |
| C13 | Eusebius 3.39.16 | 41, 311, 360 | Matches, other translation |
| C14 | Eusebius 3.39.17 (McGiffert 16) | 43, 95, 221, 311 | Matches, other section number |
| C15 | Eusebius 4.22.8 (McGiffert 7) | 61, 95, 313, 361 | Reads differently |
| C16 | Eusebius 5.10.3 | 53, 315 | Reads differently |
| C17 | Eusebius 6.25.4 | 57, 317 | Matches |
| C18 | Jerome, *Lives* 2 (translated) | 203, 129, 336 | Matches |
| C19 | Jerome, *Lives* 2 (James) | 203 | Matches, other translation |
| C20 | Jerome, *Lives* 3 | 79, 125, 321 | Reads differently |
| C21 | Jerome, *Lives* 16 | 223 | Matches |
| C22 | Jerome, *Lives* 36 | 53 | Matches |
| C23 | *Against the Pelagians* 3.2 (the book) | 83, 98 | Matches |
| C24 | *Against the Pelagians* 3.2 (baptism) | 205, 334 | Matches |
| C25 | *Against the Pelagians* 3.2 (the prophets) | 207, 261 | Matches |
| C26 | *Against the Pelagians* 3.2 (seven times) | 207, 299 | Matches, other translation |
| C27 | Jerome, Letter 20.5 | 235 | Can't check |
| C28 | Jerome, Letter 120.8 | 241 | Can't check |
| C29 | Ignatius, *Smyrnaeans* 3 | 223 | Matches, other translation |
| C36 | Clement, *Stromata* 2.9.45 | 201, 316, 350 | Matches, other translation |
| C37 | Clement, *Stromata* 5.14.96 | 201 | Reads differently |
| C38 | Origen, *Comm. John* (Menzies II §6) | 199, 317 | Matches, other section number |
| C41 | Panarion 29.9.4 | 69, 97, 342 | Matches, other translation |
| C42 | Panarion 30.3.7 | 71, 94 | Matches |
| C43 | Panarion 30.13.2 and 30.14.3 | 71, 96, 121, 147, 187 | Matches |
| C44 | Panarion 30.13.2-3 | 105, 169 | Matches, other translation |
| C45 | Panarion 30.13.4-5 | 153, 155, 336 | Matches, other translation |
| C46 | Panarion 30.13.7 | 133, 159, 161 | Reads differently (this sheet's D3 gives the full sequence; the caveat was about another quotation) |
| C47 | Panarion 30.14.5 | 165 | Matches |
| C48 | Panarion 30.16.5 | 175, 320 | Matches |
| C49 | Panarion 30.22.4 | 181, 183, 297, 350 | Reads differently |
| C57 | Gospel of Thomas 2 | 201 | Reads differently |
| C80 | John 1:42 and 21:15-17 | 260 | Reads differently |
| C83 | Jerome, *Comm. Matt.* 6.11 | 233 | Not held |
| C84 | Jerome, *Comm. Matt.* 12.13 | 81, 100, 125, 211 | Not held |
| C85 | Jerome, *Comm. Matt.* 23.35 | 237 | Not held |
| C86 | Jerome, *Comm. Matt.* 27.16 | 239 | Not held |
| C87 | Jerome, *Comm. Matt.* 27.51 | 241 | Not held |
| C88 | Jerome, *Comm. Isa.* 11.2 | 197, 334 | Not held |
| C89 | Jerome, *Comm. Isa.* 40.9 | 199 | Not held |
| C90 | Jerome on Ephesians 5.4, Ezekiel 18.7 | 217, 219 | Not held |
| C91 | Origen, *First Principles* pref. 8 | 223 | Not held |
| C92 | Origen (attributed), *Comm. Matt.* 15.14 | 209, 317 | Not held |
| C93 | Origen, *Hom. Jer.* 15.4 | 199 | Not held |
| C94 | Eusebius, *Theophany* 4.12 | 215 | Not held |
| C95 | Eusebius, *Theophany* (talents) | 213 | Not held (sheet gives 4.22, Syriac) |
| C97 | Didymus, *Comm. Pss.* 184.9-10 | 225 | Not held |
| C98 | Thomas 2, P.Oxy 654 | 201 | Not held |
| C109 | Justin, *Dial.* 88 and 103 | 137, 161, 312 | Reads differently |

---

*Checked against held texts only. Where something is "not held", the sheet's claim may well be right; we can't confirm it from the repo.*
