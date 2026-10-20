> **Draft audit, 2026-10-20. Nothing here has been applied to the research files.** Findings are tracked in `AUDIT-LIST.md` until a person confirms them.

# Item 14 — Audit of every Panarion quotation in the public repo

**Date:** 2026-10-20
**Held text:** Craig Wescoe's machine translation, checked by him, of Holl (GCS 25/31) for Sects 1-64 and Dindorf (1861) for 65-80: `christianity/Incoming/epiphanius-panarion-book-{1,2,3}-full-text.md`. Citation format "Sect chapter,section" with letters for sentence splits (e.g. **30,16,5a**).
**Greek checked against:** Holl's text as digitized by First1KGreek (OpenGreekAndLatin, `tlg2021.tlg002.1st1K-grc1.xml`, CC BY-SA 4.0). That file holds **haereses 1-64 only** (Holl vols. 1-2). Sects 69, 78 and 80 (Dindorf / Holl vol. 3) are **not** in it, so the James passages (78.7, 78.13-14) could not be checked against the Greek. Caveat: in a few sections the digitization interleaves Holl's critical apparatus (German notes, sigla) with the text; I read around it.
**Scope:** every file outside `christianity/Incoming/` and `podcast-archive/` that quotes, paraphrases or cites Epiphanius. `site/dist/` is a build product of `site/data/` and is not listed separately.

Verdict key: **MATCHES** (same substance as Craig's text; wording from Craig or a fair reference-level paraphrase) · **WORDING DIFFERS** (another translation; says which, and whether meaning shifts) · **WRONG CITATION** · **NOT FOUND** · **CONTRADICTED** (the held text says the opposite).

---

## 1. Summary table

### A. Quotations in quotation marks (the ones that matter most)

| # | File : line | Cited as | Actually | Verdict |
|---|---|---|---|---|
| 1 | `christianity/hebrew-gospel-of-matthew.md:32` | 30.16.5 | 30,16,5a | WORDING DIFFERS — "the wrath **of God**": "of God" is not in the Greek (ἡ ὀργή alone). Meaning: minor. Labelled "Hebrew Matthew tradition" (known FIX-LIST item) |
| 2 | `christianity/blood-atonement-logical-incoherence.md:88` | 30.16.5 | 30,16,5a | same as #1; table row calls it "Hebrew Gospel of Matthew" |
| 3 | `christianity/blood-magic-origins-saturn-sacrifice.md:149` | 30.16.5 | 30,16,5a | same as #1 |
| 4 | `christianity/prophetic-tradition-against-sacrifice.md:88` | 30.16.5 | 30,16,5a | same as #1 |
| 5 | `christianity/hebrew-gospel-of-matthew.md:50` | 30.22.4 | 30,22,4 | WORDING DIFFERS — "flesh of this Passover **lamb**": Greek has κρέας ("meat"); no lamb. Meaning: slight overstatement |
| 6 | `christianity/biblical-case-for-vegetarian-jesus.md:69` | 30.22.4 | 30,22,4 | same as #5 |
| 7 | `christianity/biblical-case-for-vegetarian-jesus.md:154` | "Ch. 18" | 18,1,4a-b | WORDING DIFFERS (Frank Williams); meaning same. **Wrong group**: attributed to "Nazarenes and Ebionites"; these are the pre-Christian Nasaraeans |
| 8 | `christianity/good-shepherd-thuo-reversal.md:93` | 18 | 18,1,4a-b | same wording as #7; attributed to "the Nazarene sect Jesus emerged from" |
| 9 | `questions/sacrifice-culture-vegetarian-jesus.md:37` | "18, on the Nazarenes" | 18,1,4a-b | same wording; "on the Nazarenes" is wrong (Nasaraeans) |
| 10 | `christianity/nazarene-sect-predated-jesus.md:27-30` | 18 (four fragments) | 18,1,4a-b | WORDING DIFFERS (Williams); meaning same; group correctly Nasaraioi |
| 11 | `christianity/nazarene-sect-predated-jesus.md:21` | 18.1 | 18,1,1 | WORDING DIFFERS (Williams-like). "They **claimed** to be descendants of Israel himself" — Greek states it as fact (ἐξ αὐτοῦ τοῦ Ἰσραὴλ οὖσα), no "claimed" |
| 12 | `questions/essene-nazarene-origins.md:57` | 18 | 18,1,1 + 18,1,4a | WORDING DIFFERS (Williams); meaning same; group correctly Nasaraioi |
| 13 | `site/data/cards/sacrifice-culture-vegetarian-jesus.json:42` | 18 | 18,1,4a | WORDING DIFFERS (Williams); group correctly flagged |
| 14 | `christianity/flight-to-pella-golden-thread.md:19` | 29.7 | 29,7,7-8 | WORDING DIFFERS (Williams-style). The ellipsis "**Berea near Pella**" fuses two of three places: Beroea is in Coele Syria (Aleppo), Pella is in the Decapolis. Meaning: a geographic error |
| 15 | `questions/essene-nazarene-origins.md:53` | 29.7 | 29,7,7-8 | same as #14 |
| 16 | `christianity/biblical-case-for-vegetarian-jesus.md:186` | "Panarion" (no section) | 29,7,7-8 | same as #14; no section given |
| 17 | `christianity/nazarene-sect-predated-jesus.md:61` | 29 | 29,7,7-8 | same wording; **used to prove the sect pre-dated Jesus, but the passage says the sect "had its beginning" after the move to Pella** (CONTRADICTED on use, not on wording) |
| 18 | `christianity/moses-scroll-deuteronomy-without-sacrifice.md:183` | "Panarion" (no section) | 18,1,3-4a | WORDING DIFFERS (Williams); **wrong group** ("The Nazarenes" — it is the Nasaraeans) |
| 19 | `christianity/old-testament-through-jesus-lens.md:250` | none | 18,1,3 | WORDING DIFFERS (Williams); **wrong group** ("the Nazarenes") |
| 20 | `christianity/2026-02-25-essene-nazarene-ebionite-lineage.md:84` | none | 18,1,4a | paraphrase; **wrong group** ("Nazarenes/Ebionites"). The Ebionite statement is 30,15,3 |
| 21 | `christianity/the-essene-diet.md:46` (and Sources, line 393, "29.7.5") | 29.7.5 | — | **NOT FOUND.** "The disciples abstain from meat... it is unlawful to eat meat for it was not ordained by God" is in no section. 29,7,5 is about law, circumcision and sabbath. Looks like a mash-up of 18,1,4 and 30,15,3 |
| 22 | `christianity/hebrew-gospel-of-matthew.md:22, 65` | 29.9.4 | 29,9,4a-b | MATCHES in substance ("quite complete, in Hebrew" is Williams; Craig: "complete, in Hebrew"; Greek πληρέστατον, superlative) |
| 23 | `christianity/2026-02-25-essene-nazarene-ebionite-lineage.md:54-55` (struck-through lines) | "fabricated" | **29,6,1** and 29,1,3 | **Revise the verdict.** "The Nazarene sect was before Christ" is a real sentence: 29,6,1 "the sect of the **Nasaraeans** existed before Christ and did not know Christ" — said by Epiphanius to deny that the Christian Nazoraeans are that sect. "All Christians were called Nazarenes once" is 29,1,3. Both real, the first mis-applied |
| 24 | `extended-library/articles-batch-2026-10-20-notes.md:127` | 29,7,5 | 29,7,5 | MATCHES Craig verbatim |
| 25 | `christianity/the-nazarenes.md` (Craig's compilation, ~60 Panarion blocks) | various | see §3 | MATCHES (same translator, slightly earlier draft). Citations name only the first section of each run; the actual spans are listed in §3. One interpretive gloss at "30.10.3" ("with the sign of the cross") is not in the full text |

### B. Reference-level citations (no quotation marks)

| # | File : line | Claim | Verdict |
|---|---|---|---|
| 26 | `christianity/james-the-just-key-to-understanding-jesus.md:28` | "Wore the priestly miter — 29.4" | MATCHES; it is 29,4,4 ("the plate upon his head", πέταλον); also 78,14,1a. "Miter" is loose; say "plate" |
| 27 | `extended-library/jesus-words-only-notes.md:53, 137` | "James first bishop — 29.3.4" | **WRONG CITATION.** 29,3,4 is about Alexander and Salina. James "as first bishop" is 29,3,8-9 (also 78,7,8) |
| 28 | `extended-library/jesus-words-only-notes.md:56` | "30.16.6-9: Paul a Greek, priest's daughter" | MATCHES; the story is 30,16,8-9 (6-7 are the Ebionite Acts and Ascents of James) |
| 29 | `christianity/paul-false-prophet-deuteronomy-18-test.md:86` | Ebionites and Nazarenes called Paul "an apostate from the law" and "a false prophet", "recorded by Epiphanius" | **NOT FOUND in the Panarion.** "Apostate from the law" is Irenaeus, *Against Heresies* 1.26.2 (not held). Epiphanius's Ebionite charge is 30,16,8-9 (Greek parents, priest's daughter, wrote against the law). Sect 29 says nothing about the Nazoraeans rejecting Paul; 29,6,2-5 is about Paul accepting the name Nazoraean |
| 30 | `questions/pauls-legitimacy.md:43` | "Epiphanius (Panarion 30) records the Ebionites and Nazarenes rejecting Paul as an apostate from the law" | same as #29: Ebionites yes (30,16,8-9, different wording); Nazarenes no |
| 31 | `christianity/flight-to-pella-golden-thread.md:59` | "Jesus the Messiah but not God incarnate — 29-30" | Half right. Ebionites: 30,2,2; 30,16,3-4. Nazoraeans: 29,7,6 says Epiphanius **cannot tell** what they hold about Christ |
| 32 | `christianity/flight-to-pella-golden-thread.md:62` | "Vegetarianism and opposition to animal sacrifice — Panarion 18" | WRONG CITATION for Nazarenes/Ebionites. 18 is the Nasaraeans. Ebionite vegetarianism is 30,15,3 and Anaceph. II 30,3; **Sect 29 says nothing about Nazoraean diet** |
| 33 | `christianity/flight-to-pella-golden-thread.md:110` | Epiphanius 29.7 "quoting or relying on Hegesippus" for Pella | Unsupported: 29,7,7-8 names no source. Say "Epiphanius independently" |
| 34 | `christianity/clementine-literature-nazarene-writings.md:13, 76` | "Epiphanius treated the Clementine material as reliable testimony about apostolic beliefs" | **CONTRADICTED.** 30,15,1-3: he says the Ebionites' Travels of Peter are falsified, "leaving a few true things", and that Clement's own letters refute them |
| 35 | `christianity/biblical-case-for-vegetarian-jesus.md:262` | Epiphanius: "Nazarenes/Ebionites: vegetarian, anti-sacrifice, direct apostolic succession" | Ebionites vegetarian: 30,15,3 (MATCHES). Nazoraeans vegetarian: **not in the Panarion**. Anti-sacrifice: only via the Ebionite gospel saying (30,16,5) and the Ascents of James (30,16,7). "Apostolic succession": 29,7,8 (the disciples at Pella) |
| 36 | `christianity/nazarene-sect-predated-jesus.md:35`; `2026-02-25-...lineage.md:63` | "three incompatible etymologies: Nazareth; messianic prophecy; the flight to Pella" | Overstated. Pella (29,7,7-8) is where the **sect** began, not an etymology of the name; the "prophecy" (29,6,5, "He shall be called a Nazoraean") is cited in support of the Nazareth derivation, not against it. What Epiphanius does give inconsistently: Nazareth (29,5,6; 29,6,5-8; 29,7,1), "holy" (78,7,7), and he rejects "consecrated ones" (29,5,6); "rebels" for the Nasaraeans (Anaceph. I 19,1) |
| 37 | `christianity/nazarene-sect-predated-jesus.md:62` | "a pre-existing group that Jesus's disciples joined" | **CONTRADICTED** by 29,5,4 (they "went out" after the ascension) and 29,7,8c ("from that point the sect had its beginning") |
| 38 | `OPEN-RESEARCH.md:41-43` | Ebionite gospel reads *egkris* for *akris*, 30.13 | MATCHES; Greek 30,13,4-5 (ἐγκρίς … ἀντὶ ἀκρίδων). The note "Williams translation; not public domain" is outdated: 30,13,4-5 is held in Craig's text |
| 39 | `site/data/desks/naz-sect-debate-prep.json:933` | "No such interview exists in the Panarion" (film's "Jesus taught us to be vegetarians") | Sharpen. 30,15,4 **is** a question-and-answer: asked why they eat no animate creatures, the Ebionites answer that such things "come from intercourse and the mingling of bodies". Nothing about Jesus. The passage exists; the answer is different |
| 40 | `site/data/desks/jesus-way-063.json:1217`; `site/data/episodes/063.json:555` | 30.16.4-5; "he says they called it 'according to the Hebrews'" | MATCHES (30,3,7c; 30,13,2a) |
| 41 | `site/data/desks/jesus-way-064.json:290`; `episodes/064.json:119` | Nasaraeans 18 vs Nazoraeans 29 | MATCHES (18,1,1; 18,1,4; 29,6,1) |
| 42 | `site/data/desks/jesus-way-065.json:294`; `episodes/065.json:110` | Ossaeans and Nasaraeans east of the Jordan | MATCHES (18,1,1; 19,1,2; 19,1,10a) |
| 43 | `christianity/hebrew-gospel-of-matthew.md:96` | Pella, 29.7.8 | MATCHES |
| 44 | `christianity/2026-02-25-...lineage.md:61` | Christians once called Nazarenes, 29.1.3, 29.6.2 | MATCHES |
| 45 | `christianity/fasting-removed-from-bible.md:40` | Epiphanius "treated the fasting reading as apostolic; cursed those who opposed fasting" | No locus; "cursed" unverified. The relevant text is Sect 75 (Aerians): 75,3,6-8 reports Aerius rejecting appointed fasts, 75,6,2 answers with the Wednesday/Friday and Passover fasts. Nothing on the Mark 9:29 reading |
| 46 | `questions/essene-nazarene-origins.md:90, 95`; `site/data/cards/essene-nazarene-origins.json:40` | "Nazarenes at Berea near Pella" | Geographic conflation (see #14). Craig: "at Beroea in the region of Coele Syria, in the Decapolis in the district of Pella, and in Bashanitis, at … Kokabe" |
| 47 | `site/data/cards/essene-nazarene-origins.json:38` | Irenaeus and Epiphanius "place them at Pella, descended from the disciples, led by Jesus's relatives" | Epiphanius: Pella and disciples yes (29,7,8; 30,2,7); "led by Jesus's relatives" is Hegesippus/Eusebius, with Epiphanius only on James (78,7,8) |
| 48 | `questions/nazarene-sect-sacrifice-and-diet.md:11`; `questions/OBJECTIONS.md:21`; `questions/MINING-2026-10-debates.md:182`; `site/data/desks/naz-sect-debate-prep.json:1005`; `site/data/desks/sacrifice-and-flesh-the-case.json:818` | "no Epiphanius in the repo", "Tier 4 until we hold Epiphanius", "we hold no English edition", "Panarion 18/29/30 in usable excerpts — Not held" | Outdated since 2026-10-17. All of 18, 29 and 30 are held (Tier 1) |
| 49 | `christianity/james-the-just-...md:103`; `extended-library/essene-gospel-of-peace.md:101`; `questions/OBJECTIONS.md:83`; `site/data/objections.json` | Ebionites vegetarian per Epiphanius | MATCHES (30,15,3; Anaceph. II 30,3) |
| 50 | Source lists naming "Williams translation, Brill 1987" (`blood-atonement…:135`, `blood-magic…:224`, `old-testament…:325`, `prophetic-tradition…:174`) | — | The quotations those files print are not Williams's wording either (the "of God" is in none of the standard translations I know). Point them at the held Wescoe text |

**Count.** 25 quotation-level items (A) across 15 files, plus Craig's own compilation; 25 reference-level items (B). Of the quotation-level items: 3 match (#22, #24, #25, with #25 covering ~60 blocks), 1 is not found (#21), 1 needs its "fabricated" verdict reversed (#23), and the remaining 20 are the same **four Williams-derived sentences** reused across files — meaning intact in all four, but with one wrong word ("of God", "lamb"), one geographic conflation ("Berea near Pella"), and the Nasaraean/Nazarene group label wrong in 7 places.

---

## 2. Details, by passage

### 2.1 Panarion 30,16,5 — "I have come to do away with the sacrifices"

**Repo wording (4 files):** "I came to abolish the sacrifices. And until you cease from sacrificing, the wrath of God will not cease from you."

**Craig (30,16,5a):** "as the gospel so called among them contains: 'I have come to do away with the sacrifices, and unless you cease from sacrificing, the wrath will not cease from you.'" Then 30,16,5b: "These and certain things like them are the crafty devices among them."

**Greek (Holl):** ἦλθον καταλῦσαι τὰς θυσίας, καὶ ἐὰν μὴ παύσησθε τοῦ θύειν, οὐ παύσεται ἀφ' ὑμῶν ἡ ὀργή.

- **"of God" is not in the Greek.** It is ἡ ὀργή, "the wrath", absolute. Craig is right. Every one of the four files adds "of God". Divine wrath is the obvious sense, so the meaning barely moves, but it is a word the text does not have, and an opponent with the Greek open can say so.
- "abolish" / "do away with": καταλῦσαι. Worth knowing: it is the **same verb as Matthew 5:17** (μὴ νομίσητε ὅτι ἦλθον καταλῦσαι τὸν νόμον, "I am not come to destroy the law", KJV). The Ebionite saying is built as the mirror of that verse. That supports the repo's reading of it as a deliberate Jewish-Christian formulation; it also supports the CITATION-NOTES line that these sayings are evidence of the community, not of Jesus.
- "until you cease" / "unless you cease": ἐὰν μὴ παύσησθε is "unless/if you do not cease". Equivalent.
- Context the files drop: 30,16,4 says the saying is what Jesus "came and taught", introduced as "the gospel so called among them" and immediately labelled a "crafty device". Hostile frame, as the cards already say.

**Verdict:** WORDING DIFFERS; the "of God" has no basis in the Greek. Cite as 30,16,5a.

### 2.2 Panarion 30,22,4 — the altered Passover saying

**Repo wording (2 files):** "I have no desire to eat the flesh of this Passover lamb with you."

**Craig (30,22,4):** "…and him, supposedly, say, 'I have not longed with longing to eat meat this Passover with you.'" And 30,22,5b-c: "instead of saying 'With longing I have longed', they added the adverb 'not'. … they, by writing in 'meat', have led themselves astray".

**Greek:** μὴ ἐπιθυμίᾳ ἐπεθύμησα κρέας τοῦτο τὸ Πάσχα φαγεῖν μεθ' ὑμῶν. 30,22,5: τὸ μῦ καὶ τὸ ἠτά ἐστι πρόσθετα.

- **"lamb" is not in the Greek.** κρέας is "meat/flesh". The repo's "flesh of this Passover lamb" is a popular English rendering, not Williams and not Craig.
- The CITATION-NOTES claim that the Greek is a wordplay inversion of Luke 22:15 is **confirmed**: Epiphanius himself says the letters μή were added.
- The cards' framing (Epiphanius presents it as their alteration) is confirmed by ἄλλαξαν τὸ ῥητόν, "altered the passage".

**Verdict:** WORDING DIFFERS; drop "lamb". Cite as 30,22,4.

### 2.3 Panarion 18,1,1-4 — the Nasaraeans

**Repo wording (the Williams sentence, 7 files):** "Though they were Jews who kept all the Jewish observances, they would not offer sacrifice or eat meat. In their eyes it was unlawful to eat meat or make sacrifices with it. They claimed these books [mandating sacrifice] are forgeries."

**Craig (18,1,4a-b):** "hence, being Jews, they keep all the observances of the Jews, yet they would not offer sacrifice or partake of anything that has life; among them it was unlawful to eat meat or to offer sacrifice. For they used to say that these books are fabricated and that none of these things was done by the fathers."

**Greek (18,1,4):** ὅθεν τὰ μὲν πάντα φυλάττουσι τῶν Ἰουδαίων Ἰουδαῖοι ὄντες, θυσίαν δὲ οὐκ ἔθυον οὐδὲ ἐμψύχων μετεῖχον, ἀλλὰ ἀθέμιτον ἦν παρ' αὐτοῖς τὸ κρεῶν μεταλαμβάνειν ἢ θυσιάζειν αὐτοῖς. ἔφασκον γὰρ πεπλάσθαι ταῦτα τὰ βιβλία καὶ μηδὲν τούτων ὑπὸ τῶν πατέρων γεγενῆσθαι.

- Both translations are faithful. Williams's "make sacrifices with it" renders αὐτοῖς; Craig's "partake of anything that has life" renders ἐμψύχων (lit. "ensouled things"). The repo's "[mandating sacrifice]" gloss is an insertion; the Greek says "these books" (ταῦτα τὰ βιβλία), which in context (18,1,3) is the Pentateuch itself.
- **18,1,3 (Greek):** ὡμολόγει μὲν τὸν Μωυσέα καὶ ὅτι ἐδέξατο νομοθεσίαν ἐπίστευεν, οὐ ταύτην δέ, φησίν, ἀλλ' ἑτέραν — "it confessed Moses and believed he had been given a code of law, yet not this code but a different one" (Craig). Confirms the "Moses received some legislation, but not this legislation" paraphrase in `moses-scroll…` and `old-testament…`.
- **18,1,1 (Greek):** Ἰουδαῖοί εἰσι τὸ γένος, ἀπὸ τῆς Γαλααδίτιδος καὶ Βασανίτιδος καὶ τῶν ἐπέκεινα τοῦ Ἰορδάνου … ἐξ αὐτοῦ δὲ τοῦ Ἰσραὴλ οὖσα. Stated as fact. `nazarene-sect-predated-jesus.md:21` adds "They **claimed** to be descendants of Israel himself" — the hedge is not in the text.
- **The group.** Sect 18 is the Nasaraeans (Νασαραῖοι), one of the seven Jewish sects, which 19,5,6-7 and 29,6,1 place before Christ. Sect 29 is the Nazoraeans (Ναζωραῖοι), the Christian group. Epiphanius distinguishes them explicitly at 29,6,1 and lists both separately at 30,1,3. Files #7, #8, #9, #18, #19, #20 attach the Sect 18 sentence to the Nazarenes and/or Ebionites. The honest label is "the Nasaraeans, a pre-Christian Jewish sect of the Transjordan (Panarion 18)". For the **Ebionites** the diet sentence is 30,15,3; for the **Nazoraeans** the Panarion says nothing about diet at all.

**Verdict:** WORDING DIFFERS (Williams); meaning intact; the group label is wrong in six places. Cite as 18,1,4a-b (and 18,1,3 for the "different law").

### 2.4 Panarion 29,7,7-8 — Beroea, Pella, Kokabe

**Repo wording (4 files):** "This sect of Nazarenes is to be found in Berea near Pella... since all the disciples had settled in Pella after their removal from Jerusalem, Christ having told them to abandon Jerusalem... It was from this that the Nazarene sect had its origin."

**Craig (29,7,7-8):** "This sect of the Nazoraeans is found at Beroea in the region of Coele Syria, in the Decapolis in the district of Pella, and in Bashanitis, at a place named Kokabe, which in Hebrew is called Chochabe. For from there it took its beginning, after all the disciples had moved from Jerusalem and were living at Pella, since Christ had told them to leave Jerusalem and withdraw on account of the siege that was coming upon it. For this reason they settled in Peraea and, as I said, lived there. From that point the sect of the Nazoraeans had its beginning."

**Greek (29,7,7-8):** ἐν τῇ Βεροιαίων περὶ τὴν Κοίλην Συρίαν καὶ ἐν τῇ Δεκαπόλει περὶ τὰ τῆς Πέλλης μέρη καὶ ἐν τῇ Βασανίτιδι ἐν τῇ λεγομένῃ Κωκάβῃ … ἐκεῖθεν γὰρ ἡ ἀρχὴ γέγονε, μετὰ τὴν ἀπὸ τῶν Ἱεροσολύμων μετάστασιν πάντων τῶν μαθητῶν ἐν Πέλλῃ ᾠκηκότων, Χριστοῦ φήσαντος καταλεῖψαι τὰ Ἱεροσόλυμα … ἐντεῦθεν ἡ κατὰ τοὺς Ναζωραίους αἵρεσις ἔσχεν τὴν ἀρχήν.

- Three places, not one: Beroea (in Coele Syria), the Pella district (in the Decapolis), Kokabe (in Bashanitis). The repo's ellipsis "Berea near Pella" puts Aleppo next to Pella. Fix by quoting Craig's full sentence.
- The Greek confirms what FIX-LIST already says about `nazarene-sect-predated-jesus.md`: ἡ ἀρχὴ γέγονε μετά … "the beginning came after" the move to Pella. This passage dates the sect **after 70**. It cannot carry a pre-Christian claim; the only pre-Christian sentence is 29,6,1 and it is about the Nasaraeans.
- "Christ having told them": Χριστοῦ φήσαντος — Epiphanius cites no source (not Hegesippus; cf. #33).

**Verdict:** WORDING DIFFERS (Williams-style); the compression changes geography. Cite as 29,7,7-8.

### 2.5 Panarion 29,7,2-5 — the Nazoraeans keeping the law

**Repo (articles-batch notes):** "because they are still bound by the law, by circumcision, the sabbath and the rest" — matches Craig's 29,7,5 verbatim.

**Greek (29,7,5):** ἐν τούτῳ δὲ μόνον πρὸς Ἰουδαίους διαφέρονται καὶ Χριστιανούς, Ἰουδαίοις μὲν μὴ συμφωνοῦντες διὰ τὸ εἰς Χριστὸν πεπιστευκέναι, Χριστιανοῖς δὲ μὴ ὁμογνωμονοῦντες διὰ τὸ ἔτι νόμῳ πεπεδῆσθαι, περιτομῇ τε καὶ σαββάτῳ καὶ τοῖς ἄλλοις. "Fettered by the law" (πεπεδῆσθαι) — Craig's "bound" is right.

- 29,7,2-3 (Greek checked): they use Old and New Testament; confess the resurrection; "one God and his child Jesus Christ" (τὸν τούτου παῖδα Ἰησοῦν Χριστόν — παῖς, "child/servant", as Craig has it).
- 29,7,6: Epiphanius does not know whether they think Christ "merely a man" (ψιλὸν ἄνθρωπον). This is the sentence that undercuts `flight-to-pella…:59` (#31).
- 29,9,4 (Greek): ἔχουσι δὲ τὸ κατὰ Ματθαῖον εὐαγγέλιον πληρέστατον Ἑβραϊστί … οὐκ οἶδα δὲ εἰ καὶ τὰς γενεαλογίας … περιεῖλον. "Most complete, in Hebrew"; and he does not know whether they removed the genealogies. The repo's "quite complete, in Hebrew" is fine.
- Nothing in 29,7 or anywhere in Sect 29 concerns food, meat or sacrifice. The Nazoraeans' Jewishness in Epiphanius is law, circumcision, sabbath, Hebrew scripture.

**Verdict:** MATCHES.

### 2.6 Panarion 30,15,3-4 — Ebionite vegetarianism and Peter

**Craig (30,15,3):** "So in the Travels they have turned everything to suit themselves, telling lies against Peter in many ways — that he was baptized every day for the sake of purification, as these men are; and they say that he abstained from animate creatures and from meats, as they themselves do, and from every other food prepared from flesh, since Ebion himself and the Ebionites abstain from these things entirely."

**Greek (30,15,3):** καταψευσάμενοι Πέτρου κατὰ πολλοὺς τρόπους, ὡς αὐτοῦ καθ' ἡμέραν βαπτιζομένου ἁγνισμοῦ ἕνεκεν, καθάπερ καὶ οὗτοι· ἐμψύχων τε τὸν αὐτὸν ἀπέχεσθαι καὶ κρεῶν, ὡς καὶ αὐτοί, καὶ πάσης ἄλλης ἐδωδῆς τῆς ἀπὸ σαρκῶν πεποιημένης λέγουσιν, ἐπειδήπερ καὶ αὐτὸς Ἐβίων καὶ Ἐβιωνῖται παντελῶς τούτων ἀπέχονται.

- Two different kinds of statement sit in one sentence, and the repo should keep them apart. (a) **Peter's** vegetarianism is what the Ebionites' *Travels of Peter* say, and Epiphanius calls it a lie against Peter (καταψευσάμενοι Πέτρου). (b) **The Ebionites' own** vegetarianism is Epiphanius's own report: they "abstain from these things entirely" (παντελῶς … ἀπέχονται). (b) is the usable hostile-witness evidence. (a) is evidence only of what the Ebionite literature claimed.
- 30,15,4 (Greek checked): asked why they eat no ἔμψυχα, they answer "because they come from intercourse and the mingling of bodies". This is the only place in the Panarion where an Ebionite is quoted on the reason for the diet, and it is not "Jesus taught us". It corrects the film line flagged in `naz-sect-debate-prep.json:933` (#39): the exchange exists; the answer is different.
- Anaceph. II 30,3 (Craig): "Though they are Jews, they use gospels; they abhor the eating of meat; they hold water in place of God" — second attestation, same author.

**Verdict:** the repo's reference-level use (Ebionites vegetarian per Epiphanius) MATCHES. No file quotes 30,15 directly; the proposed fixes below add it where files currently reach for Sect 18.

### 2.7 Panarion 78 and 29,4 — James the Just, the Nazirite

**Craig (29,4,2-4):** "he became a Nazirite, for he was Joseph's firstborn and consecrated; and … he exercised the priesthood after the manner of the old priesthood. For this reason he was allowed to go into the Holy of Holies once each year … He was even permitted to wear the plate upon his head, as the trustworthy men already mentioned have testified in those same memoirs" (29,4,3 names Eusebius and Clement).

**Greek (29,4,2-4):** Ναζιραῖόν <τε> γενόμενον (Holl's supplement) … ἱερατεύσαντα αὐτὸν κατὰ τὴν παλαιὰν ἱερωσύνην … εἰς τὰ ἅγια τῶν ἁγίων εἰσιέναι … τὸ πέταλον ἐπὶ τῆς κεφαλῆς ἐξῆν αὐτῷ φορεῖν. Confirms "Nazirite", "Holy of Holies once a year", "plate" (πέταλον — the high priest's gold plate, Exodus 28:36; "miter" in `james-the-just…:28` is the wrong object).

**Craig (78,13,2b-3; 78,14,1-2):** James "died at ninety-six years of age, having remained a virgin; on whose head no iron came up, who did not use a bath-house, who partook of nothing that had life; who did not put on a second tunic; who used only a single worn cloak of linen"; "He never put on a woollen garment. His knees grew hard like those of camels … he partook of nothing that had life, as I have shown above; he never put on a sandal."

- **Not checked against the Greek:** Sect 78 is in Holl vol. 3 (1933) / Dindorf, and the First1KGreek file ends at haeresis 64.
- Note for the James card: Epiphanius's James material is Hegesippus-shaped (the camel knees, the fuller's club, "forgive them") with additions (the plate, the Holy of Holies, age 96, "twenty-four years after the ascension"). 78,13,5a ties the Holy of Holies to his being "a Nazoraean and connected with the priesthood". `the-nazarenes.md` already has these at the right loci.

**Verdict:** the-nazarenes.md MATCHES; `james-the-just…:28` MATCHES at reference level, cite 29,4,4 and say "plate".

### 2.8 Panarion 18-20 and 29,6,1 — Nasaraeans and Ossaeans, and "before Christ"

- **19,5,6-7** (Craig): the seven Jewish sects "lasted up to Christ's advent and, after his advent in the flesh, up to the capture of Jerusalem", then "were still heard of for a short time … the Ossaeans, the Nasaraeans and the Herodians, until … every one of them was scattered and dissolved."
- **20,3,2 and 20,3,4a** (Craig): "perhaps one or two Nasarenes somewhere beyond the upper Thebaid and on the far side of Arabia"; "among the Jews none survive but a few Ossaeans and Nasaraeans living apart."
- **29,6,1** (Greek): ἀλλὰ οὐδὲ Νασαραίους ἑαυτοὺς ἐκάλεσαν· ἦν γὰρ ἡ αἵρεσις τῶν Νασαραίων πρὸ Χριστοῦ καὶ Χριστὸν οὐκ ᾔδει. Craig: "Nor did they call themselves Nasaraeans; for the sect of the Nasaraeans existed before Christ and did not know Christ."
- **19,1,2** (Craig): the Ossaeans "from the Nabataean country and Ituraea, Moabitis and Arielitis … beyond the Salt valley"; 19,5,1: they reject "the books of Moses, as the Nasaraeans do".

**What this changes.** Four places in the repo (`2026-02-25-…lineage.md:52-58`, `questions/nazarene-sect-sacrifice-and-diet.md:228`, `questions/MINING-2026-10-debates.md:40`, `site/data/desks/naz-sect-debate-prep.json:820`) label "The Nazarene sect was before Christ — Epiphanius" as **fabricated**. It is not fabricated; it is 29,6,1, and in a published debate slide it is defensible as a quotation **of what Epiphanius says about the Nasaraeans**. What is wrong is the application: Epiphanius says it in order to deny that the Christian Nazoraeans are that sect. The right verdict is "real sentence (29,6,1), about the Nasaraeans, cited by Epiphanius to separate them from the Nazoraeans; it cannot show that Jesus's movement pre-dated Jesus." Likewise "All Christians were called Nazarenes once" is 29,1,3 verbatim in substance. The 2026-10-06 strike-through was right to remove them as sourced from a transcript; it should now be updated to say where they come from.

### 2.9 `christianity/the-nazarenes.md` (Craig Wescoe's compilation)

Every Panarion block was matched mechanically against the three full-text files (first and last seven words, then sentence-by-sentence). All ~60 blocks are the same translator's work and agree in substance with the full text; the compilation is a slightly earlier draft (e.g. "did not use a bath" / "bath-house"; "Forgive them" / "Pardon them"; "Men, what have I to do with you?" / "people"). Two things worth a note in the file:

1. **Citations name the first section of a run.** Actual spans: "29.1.2" = 29,1,2-4 · "29.6.2" = 29,6,2-4 · "29.6.5" = 29,6,5-6 · "29.6.7" = 29,6,7-8 · "29.7.2" = 29,7,2-3 · "29.7.4" = 29,7,4-6 · "29.7.7" = 29,7,7-8 · "29.8.1" = 29,8,1-3 · "29.9.1" = 29,9,1-3 · "29.4.1" = 29,4,1-4 · "29.5.4" = 29,5,4-5 · "18.1.1" = 18,1,1-2 · "18.1.3" = 18,1,3-5 · "19.5.1" = 19,5,1-3 · "19.5.4" = 19,5,4-5 · "19.5.6" = 19,5,6-7 · "20.3.1" = 20,3,1-3 · "30.1.2" = 30,1,2-3 · "30.2.1" = 30,2,1-5 · "30.2.7" = 30,2,7-9 · "30.10.3" = 30,10,3-4 · "53.1.2" = 53,1,2-3 · "64.67.17" = 64,67,17-19 · "Anaceph. I 19.1" = I 19,1-2 · "Anaceph. II 27.2" = II 27,2-29 · "78.7", "78.13", "78.14", "69.23", "80.7" = whole chapters. Fine for a reader; the cards' `phrase` anchors should grep the full text, not this file.
2. **One gloss not in the full text.** The "30.10.3" block has Josephus "seals the water **with the sign of the cross**"; the full text (30,10,4b) has "seals the water". Greek: σφραγίσας τὸ ὕδωρ, "having sealed the water". The gloss is a reasonable interpretation of σφραγίζω in a 4th-century Christian author but it is an interpretation; the full text is the stricter rendering.

Also: 30,1,3 (Craig) lists "the thinking of the Ossaeans, the Nazoraeans and the Nasaraeans" as three separate things in Ebion — a one-line proof that Epiphanius keeps the two N-groups apart.

### 2.10 Things the Panarion does not say (checked)

- That the **Nazoraeans** (29) were vegetarian or rejected sacrifice. Not in Sect 29. (Diet: Nasaraeans 18,1,4; Ebionites 30,15,3, Anaceph. II 30,3.)
- That the Nazoraeans rejected Paul. Not in Sect 29. (Ebionites: 30,16,8-9.)
- "Apostate from the law" / "false prophet" of Paul. Not in Sect 30 (Elchasai is the "false prophet", 19,1,4; 30,3,2). "Apostate from the law" is Irenaeus 1.26.2.
- Any Nazarene telling Epiphanius "Jesus taught us to be vegetarians". The only reported answer is 30,15,4 (Ebionites, "intercourse and the mingling of bodies").
- "The disciples abstain from meat … it was not ordained by God" (`the-essene-diet.md:46`). Not found.
- That Epiphanius relied on Hegesippus for Pella, or treated the Clementines as reliable (30,15,1-3 says the opposite).

---

## 3. Proposed fixes (replacement wording from Craig Wescoe's text; no repo file edited)

Translator line to use everywhere: **(Epiphanius, *Panarion* 30,16,5a, Wescoe-checked machine translation from Holl)** or, shorter on the cards, **(Panarion 30,16,5a, trans. Wescoe)**.

**F1. The sacrifice saying — 4 files** (`hebrew-gospel-of-matthew.md:32`, `blood-atonement-logical-incoherence.md:88`, `blood-magic-origins-saturn-sacrifice.md:149`, `prophetic-tradition-against-sacrifice.md:88`). Replace the quotation with:
> "I have come to do away with the sacrifices, and unless you cease from sacrificing, the wrath will not cease from you." — the Ebionites' gospel, quoted by Epiphanius, *Panarion* 30,16,5a (trans. Wescoe), who introduces it as one of their "crafty devices"

and label the source "Gospel of the Ebionites (via Epiphanius)", not "Hebrew Gospel of Matthew". Optional footnote: the verb is καταλῦσαι, the verb of Matthew 5:17.

**F2. The Passover saying — 2 files** (`hebrew-gospel-of-matthew.md:50`, `biblical-case-for-vegetarian-jesus.md:69`). Replace with:
> "I have not longed with longing to eat meat this Passover with you." — the Ebionites' alteration of Luke 22:15, quoted by Epiphanius, *Panarion* 30,22,4 (trans. Wescoe), who says they "added the adverb 'not'" and "wrote in 'meat'" (30,22,5)

**F3. The Sect 18 sentence — 7 places** (`biblical-case…:154`, `good-shepherd…:93`, `questions/sacrifice-culture…:37`, `nazarene-sect-predated…:27-30`, `questions/essene-nazarene-origins.md:57`, `site/data/cards/sacrifice-culture-vegetarian-jesus.json:42`, `2026-02-25-…lineage.md:84`). Replace with:
> "being Jews, they keep all the observances of the Jews, yet they would not offer sacrifice or partake of anything that has life; among them it was unlawful to eat meat or to offer sacrifice. For they used to say that these books are fabricated and that none of these things was done by the fathers." — Epiphanius, *Panarion* 18,1,4 (trans. Wescoe), **on the Nasaraeans**, a Jewish sect of the Transjordan he dates before Christ (29,6,1)

and, where the file is about the **Ebionites**, use instead:
> "Ebion himself and the Ebionites abstain from these things entirely" [animate creatures, meats, "every other food prepared from flesh"] — Epiphanius, *Panarion* 30,15,3 (trans. Wescoe)

Where the file is about the **Nazoraeans** (29), say plainly that Epiphanius reports their law-keeping (29,7,5) and Hebrew Matthew (29,9,4) and says nothing about their diet.

**F4. "Moses received a different law" — 2 files** (`moses-scroll…:183`, `old-testament-through-jesus-lens.md:250`). Replace with:
> "it confessed Moses and believed he had been given a code of law, yet not this code, it says, but a different one" — Epiphanius, *Panarion* 18,1,3 (trans. Wescoe), on the Nasaraeans

and change "The Nazarenes" to "The Nasaraeans (Epiphanius's pre-Christian Transjordan sect; not the Christian Nazoraeans of *Panarion* 29)".

**F5. Pella — 4 files** (`flight-to-pella…:19`, `questions/essene-nazarene-origins.md:53`, `biblical-case…:186`, `nazarene-sect-predated…:61`). Replace with:
> "This sect of the Nazoraeans is found at Beroea in the region of Coele Syria, in the Decapolis in the district of Pella, and in Bashanitis, at a place named Kokabe … For from there it took its beginning, after all the disciples had moved from Jerusalem and were living at Pella, since Christ had told them to leave Jerusalem and withdraw on account of the siege that was coming upon it. … From that point the sect of the Nazoraeans had its beginning." — Epiphanius, *Panarion* 29,7,7-8 (trans. Wescoe)

Change "Berea near Pella" to "Beroea, the Pella district and Kokabe" in `questions/essene-nazarene-origins.md:90, 95` and `site/data/cards/essene-nazarene-origins.json:40`. In `nazarene-sect-predated-jesus.md` §1, drop the passage as proof of pre-dating (it dates the sect after 70) and replace line 62 with: Epiphanius says the sect "took its beginning" from the disciples' move to Pella (29,7,8) and that its members "went out" after the ascension (29,5,4); the only sect he places before Christ is the Nasaraeans (29,6,1).

**F6. Hebrew Matthew** (`hebrew-gospel-of-matthew.md:22, 65`). Optional, to match the held text:
> "They have the Gospel according to Matthew complete, in Hebrew. For among them it is clearly still preserved, as it was originally written, in Hebrew letters. Whether they have also removed the genealogies from Abraham down to Christ, I do not know." — *Panarion* 29,9,4 (trans. Wescoe)

and, for the Ebionites' copy, 30,13,2a: "not whole and entirely complete, but falsified and mutilated (and they call it Hebrew)"; 30,3,7c: "they call it the Gospel according to the Hebrews".

**F7. `the-essene-diet.md:46` and Sources line 393.** Delete the unfound quotation. Replace the row with 30,15,3 (F3, Ebionite form) and cite 30,15,3, not 29,7,5.

**F8. The "fabricated" verdict — 4 places** (`2026-02-25-…lineage.md:52-58`, `questions/nazarene-sect-sacrifice-and-diet.md:228`, `questions/MINING-2026-10-debates.md:40`, `site/data/desks/naz-sect-debate-prep.json:820`). Replace "Fabricated" with:
> Real, but misapplied. "Nor did they call themselves Nasaraeans; for the sect of the Nasaraeans existed before Christ and did not know Christ" — *Panarion* 29,6,1 (trans. Wescoe). Epiphanius says this of the **Nasaraeans** (Sect 18), precisely to deny that the Christian Nazoraeans (Sect 29) are that sect. "At that time all Christians were likewise called Nazoraeans" is 29,1,3. Neither sentence shows that Jesus's movement existed before Jesus.

**F9. Paul** (`paul-false-prophet-deuteronomy-18-test.md:86`, `questions/pauls-legitimacy.md:43`). Replace "apostate from the law"/"false prophet … recorded by Epiphanius" with:
> The Ebionites "make him out to be of Greek birth … the son of a Greek mother and a Greek father, and that he went up to Jerusalem … and that he desired to take the daughter of the priest in marriage and for this reason became a proselyte and was circumcised. And when after all he did not get such a girl, he grew angry and wrote against circumcision, the sabbath and the law." — Epiphanius, *Panarion* 30,16,8-9 (trans. Wescoe), who calls the story "fabricated words"

"Apostate from the law" belongs to Irenaeus (*Against Heresies* 1.26.2, not held; reference level only). Drop "and Nazarenes".

**F10. James.** `james-the-just…:28`: "Wore the priestly plate (*petalon*) — *Panarion* 29,4,4; 78,14,1a". `extended-library/jesus-words-only-notes.md:53, 137`: change 29.3.4 to 29,3,8-9 (and 78,7,8). Line 56: 30,16,8-9.

**F11. Other reference-level corrections.**
- `flight-to-pella…:59`: "Ebionites: Jesus born of Joseph, chosen, not begotten (30,2,2; 30,16,3-4). Nazoraeans: Epiphanius says he cannot tell (29,7,6)."
- `flight-to-pella…:62`: cite 30,15,3 and Anaceph. II 30,3 for the Ebionites; delete the Nazarene claim or say Sect 29 is silent on diet.
- `flight-to-pella…:110`: delete "both quoting or relying on … Hegesippus" for Epiphanius.
- `clementine-literature-nazarene-writings.md:13, 76`: reverse the claim. Epiphanius says the Ebionites' *Travels of Peter* are "falsifying their contents, though leaving a few true things" and that Clement's letters refute them (30,15,1-2). What he preserves is their claim about Peter's diet (30,15,3), which he calls a lie against Peter.
- `biblical-case…:262`: "Ebionites: vegetarian (30,15,3). Nazoraeans: Torah-observant, Hebrew Matthew (29,7,5; 29,9,4); nothing on diet."
- `nazarene-sect-predated…:35`, `2026-02-25-…lineage.md:63`: replace "three incompatible etymologies" with "Epiphanius derives the name from Nazareth (29,5,6; 29,7,1) but elsewhere glosses it 'holy' (78,7,7) and glosses the Nasaraeans' name 'rebels' (Anaceph. I 19,1); the Pella passage (29,7,7-8) is about where the sect began, not the name."
- `site/data/desks/naz-sect-debate-prep.json:933`: "The exchange exists (30,15,4) but the reported answer is 'because they come from intercourse and the mingling of bodies', not 'because Jesus taught us'."
- `OPEN-RESEARCH.md:43`: 30,13,4-5 is held (trans. Wescoe): "his food, it says, was wild honey, which tasted of manna, like a cake made with oil … make it a cake in honey instead of locusts" (Greek ἐγκρίς / ἀκρίδες).
- `fasting-removed-from-bible.md:40`: give a locus or soften: Epiphanius refutes Aerius's rejection of appointed fasts (75,3,6-8; 75,6,2); nothing on the Mark 9:29 variant; "cursed" unsupported.
- Outdated "not held" lines (#48): update to "held, Tier 1, Wescoe".
- Source lists naming "Williams translation, Brill 1987" (#50): replace with the held text's citation; the quotations they print are not Williams's wording.

**F12. `the-nazarenes.md`.** Optional: expand run citations to ranges (list in §2.9) and change "seals the water with the sign of the cross" to "seals the water" (30,10,4b) or keep the gloss in brackets.

**F13. `VERIFIED-SOURCES.md` Panarion row.** "Held; not yet audited" → "Audited 2026-10-20 against Holl's Greek for Sects 18, 19, 29, 30 (First1KGreek); Sects 65-80 unchecked (Greek not in that corpus). Read this first: Sect 18 (Nasaraeans) and Sect 29 (Nazoraeans) are different groups (29,6,1; 30,1,3); the diet evidence for the Ebionites is 30,15,3, and Sect 29 says nothing about diet; 30,16,5 has 'the wrath', not 'the wrath of God'; 30,22,4 has 'meat', not 'lamb'."

---

## 4. Greek check, in one place

| Passage | Repo use | Greek supports? |
|---|---|---|
| 29,7,5 Nazoraeans still bound by law, circumcision, sabbath | yes | **Yes.** ἔτι νόμῳ πεπεδῆσθαι, περιτομῇ τε καὶ σαββάτῳ καὶ τοῖς ἄλλοις |
| 29,7,7-8 Beroea / Pella / Kokabe; sect began after the move to Pella | "Berea near Pella"; used for pre-dating | **Three places, not one; ἡ ἀρχὴ γέγονε μετά … (began after).** Does not support pre-dating |
| 29,6,1 Nasaraeans before Christ | labelled fabricated | **Real** (πρὸ Χριστοῦ), about the Nasaraeans |
| 29,9,4 Hebrew Matthew | "quite complete" | **Yes** (πληρέστατον); plus "I do not know whether they removed the genealogies" |
| 18,1,1 Nasaraeans from Gilead, Bashan, Transjordan, of Israel | "claimed to be descendants" | **Yes**, but stated as fact, no "claimed" |
| 18,1,3-4 different law; no sacrifice, no meat; books fabricated | attached to Nazarenes/Ebionites | **Yes** for the Nasaraeans; the group label is the repo's error |
| 30,15,3 Ebionites abstain entirely; Peter's vegetarianism from their *Travels* | Ebionites vegetarian | **Yes** (παντελῶς ἀπέχονται). Peter part is καταψευσάμενοι Πέτρου, "lying against Peter" |
| 30,15,4 the reported reason for the diet | "no such interview" | **Exists**; answer is "intercourse and the mingling of bodies" |
| 30,16,5 "do away with the sacrifices … the wrath" | "the wrath of God" | **"of God" is not there** (ἡ ὀργή). Verb καταλῦσαι = Matt 5:17's verb |
| 30,22,4-5 "not … meat this Passover"; μή added | "flesh of this Passover lamb" | **"lamb" is not there** (κρέας). Inversion of Luke 22:15 confirmed by Epiphanius himself |
| 29,4,2-4 James a Nazirite, Holy of Holies, the plate | "priestly miter" | **Yes**; πέταλον is the plate, not a mitre |
| 78,7 / 78,13-14 James (age 96, no animate food, no wool, no bath, fuller's club) | the-nazarenes.md | **Not checked** — Sect 78 not in the First1KGreek file |
