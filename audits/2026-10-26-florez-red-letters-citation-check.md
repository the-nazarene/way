# Citation check: "Polemic Answers, The Red Letters That Were Added" (Christian Florez)

**Contributed by:** Christian Florez, 2026-10-26 (passed on by Rex). This report checks his research sheet.
**Sheet:** `extended-library/polemic-answers-red-letters-added-florez.md` (contributed by Christian Florez, 2026-10-26)
**Checked:** 2026-10-26, against texts the repo holds only (no web). No repo file was edited.
**Method:** each claim the sheet makes that a held text can confirm or contradict was grepped in the held file. Line numbers are as of today; the quoted phrase is the durable reference (they shift when headers change).

**Held texts used**
- KJV: `christianity/Incoming/kjv/NN-book.md` (1769 Oxford text, Gutenberg #10), cited "(KJV)"
- Epiphanius, *Panarion*: `christianity/Incoming/epiphanius-panarion-book-1-full-text.md` (machine translation from Holl's Greek, checked by Craig Wescoe), cited "(Wescoe)"
- Didache: `christianity/Incoming/didache-full-text.md` (Cyril C. Richardson, 1953)
- Gospel of Thomas: `christianity/Incoming/gospel-of-thomas-full-text.md` (Thomas O. Lambdin)
- Clementine Recognitions / Homilies: `christianity/Incoming/clementine-recognitions-full-text.md` (Thomas Smith, ANF 8), `clementine-homilies-full-text.md` (ANF 8)
- Witnesses excerpts (Tier 2): `christianity/Incoming/witnesses-on-flesh-and-sacrifice-selected-texts.md`
- DSS excerpts (Tier 2): `christianity/dead-sea-scrolls/Incoming/dead-sea-scrolls-selected-texts.md`
- Q (Tier 3, reconstruction): `christianity/Incoming/q-source-reconstruction.md`

**A note on translations.** The sheet quotes the ASV (1901), which follows the critical Greek text. The KJV follows the Textus Receptus. So where the sheet says "the KJV has X" we can check it directly; where it quotes the ASV we can only say whether the KJV agrees or differs, and why it would differ.

---

## Summary

- **KJV wording: matches everywhere the sheet says what the KJV reads.** That covers about 45 verses: every Part A addition is in our KJV file in the wording the sheet gives, and Matthew 24:36 does lack "neither the Son" as the sheet says.
- **Points where our held texts read differently, or support a narrower wording:**
  1. **"Every baptism recorded in Acts is in the name of Yeshua"** (B1, Part C, Part D, E3). Four baptism scenes in Acts state a formula, and all four name Jesus or "the Lord". About five more state no formula. None uses the triadic formula. So "every baptism *that states a formula*" holds up, and "every baptism" does not. In the KJV, Acts 10:48 reads "in the name of the Lord", not "Jesus".
  2. **F3.1, Caiaphas.** The sheet says "Matthew and Mark have none of these names" and that the four details "appear in no other Greek gospel". Caiaphas is named in Matthew 26:3 and 26:57, and in John 11:49 and 18:13.
  3. **A27 / F3.6 / F7, "this day have I begotten thee" in Panarion 30.13.** In our held Panarion the Ebionites' gospel has *both* voices: "You are my beloved Son, in you I am well pleased; and again: 'Today I have begotten you'", and then a third, "This is my beloved Son, on whom I am well pleased". The sheet's F3.6 quotation drops the "well pleased" clause that sits between the two parts. A27 lists this text among witnesses that "all give the Psalm 2.7 form".
  4. **F3.3 / Panarion 30.22.4.** The sheet's form is a question ("Have I desired with desire to eat flesh…?"). Wescoe's is a negative statement: "I have not longed with longing to eat meat this Passover with you." In 30.22.5 Epiphanius himself says the group *altered* Luke's sentence by adding "not" (the letters mu and eta, μή) and "meat". The sheet presents this as the Hebrew Gospel's earlier form, with Luke dependent on it. `questions/CITATION-NOTES.md` already records the opposite reading: secondary, and an inversion of Luke 22:15.
  5. **F3.22, Recognitions 1.39 "instead of sacrifices".** That phrase is not in the body of 1.39. The chapter heading (ANF) reads "Baptism Instituted in Place of Sacrifices". The sheet's link label reads "Homilies 3", not Recognitions 1.
  6. **F4, Thomas 2** in our Lambdin text is seek, find, troubled, astonished, "rule over the All". It has no "rest", so it is not "the same chain… seek, find, marvel, reign, rest" as Clement's quotation. ("Rest" is in the Greek P.Oxy 654, which we don't hold.)
  7. **John 1:18 (internal consistency).** A30, Part C and Part E(4) do not agree on which reading is earlier, and E(4) contradicts its own conclusion (details in section 9).
  8. **A24, "the only places Yeshua is reported saying 'new'".** He says "new" elsewhere in the KJV: "drink it new" (Mark 14:25; Matthew 26:29), "A new commandment" (John 13:34), "new tongues" (Mark 16:17). The narrow version holds: these are the only places he speaks of a *new covenant/testament*.
  9. Smaller points that hold only in the critical text: Mark 1:2 "in Isaiah the prophet" (F6; the KJV reads "in the prophets") and "son of John" at John 1:42 / 21:15 (F3.21; the KJV reads "Jona"/"Jonas"). Also F3.12 quotes Luke 11:3 in Matthew's wording.
- **Confirmed from held texts:** Panarion 29.9.4, 30.3.7, 30.13.2-8, 30.14.3, 30.14.5, 30.16.5 (with no "of God", which agrees with our own audit A1), and **46.1.9** (verify-list item 8 is confirmed: "which some call the Gospel according to the Hebrews"). Also Didache 7, 8, 9-10, and most of the Thomas wording.
- **Possible problems in our own repo files that this check turned up** are in section 10. The main ones: the Q reconstruction's Lord's Prayer note, the Q file's "Didache 8:2" text not matching our held Didache, VERIFIED-SOURCES still listing Epiphanius and the Gospel of the Ebionites as "not held", and the sheet's header pointing to a notes file that does not exist.

---

## 1. KJV wording (Part A, Part B, Part F)

All in `christianity/Incoming/kjv/`. "Matches" means the KJV file says what the sheet says the KJV says, or (for ASV quotations) that the KJV agrees in substance.

| Sheet | Sheet's claim | Held KJV text (file:line) | Verdict |
|---|---|---|---|
| A6 | KJV doxology: "For thine is the kingdom, and the power, and the glory, for ever. Amen." | 40-matthew.md:183 "…but deliver us from evil: For thine is the kingdom, and the power, and the glory, for ever. Amen." | Matches |
| A7 | Matt 17:21 KJV "by prayer and fasting" | 40-matthew.md:642 "Howbeit this kind goeth not out but by prayer and fasting." | Matches |
| A7 | Mark 9:29 has "and fasting" in the KJV | 41-mark.md:393 "…by nothing, but by prayer and fasting." | Matches |
| A8 | Matt 18:11 "the Son of man is come to save that which was lost"; borrowed from Luke 19:10 | 40-matthew.md:662 "For the Son of man is come to save that which was lost." / 42-luke.md:919 "…to seek and to save that which was lost." | Matches |
| A9 | Matt 23:14 "ye devour widows' houses"; from Mark 12:40 | 40-matthew.md:871 "…for ye devour widows' houses, and for a pretence make long prayer…" / 41-mark.md:548 | Matches |
| A10 | Mark 7:16 "If any man have ears to hear, let him hear." | 41-mark.md:299, the same words | Matches |
| A11 | Mark 9:44, 46 identical to 9:48, which quotes Isa 66:24 | 41-mark.md:408, 410, 412, all "Where their worm dieth not, and the fire is not quenched." / 23-isaiah.md:1504 "their worm shall not die, neither shall their fire be quenched" | Matches |
| A12 | Mark 11:26 "if ye do not forgive, neither will your Father" | 41-mark.md:498 "But if ye do not forgive, neither will your Father which is in heaven forgive your trespasses." | Matches |
| A13 | Luke 9:54 "as Elijah did"; 9:55b-56a rebuke and "not come to destroy men's lives, but to save them" | 42-luke.md:503 "…even as **Elias** did?"; :504 "…Ye know not what manner of spirit ye are of."; :505 "For the Son of man is not come to destroy men's lives, but to save them." | Matches (the KJV spells the name "Elias") |
| A14 | Luke 17:36 "Two men shall be in the field" | 42-luke.md:859 "Two men shall be in the field; the one shall be taken, and the other left." | Matches |
| A15 | Luke 23:17 "of necessity he must release one unto them at the feast" | 42-luke.md:1142 "(For of necessity he must release one unto them at the feast.)" | Matches (the KJV prints it in parentheses) |
| A16 | John 5:3b-4, the angel troubling the water | 43-john.md:198 "…waiting for the moving of the water."; :199 "For an angel went down at a certain season into the pool, and troubled the water…" | Matches |
| A16 | v. 7 mentions the stirring | 43-john.md:202 "…when the water is troubled…" | Matches |
| A17 | Luke 4:4b "but by every word of God"; Matt 4:4 has the full quotation | 42-luke.md:200 "…by bread alone, but by every word of God." / 40-matthew.md:95 "…but by every word that proceedeth out of the mouth of God." | Matches |
| A18 | Matt 5:44 KJV adds "bless them that curse you, do good to them that hate you"; Luke 6:27-28 | 40-matthew.md:163 "Love your enemies, bless them that curse you, do good to them that hate you, and pray for them which despitefully use you, and persecute you;" / 42-luke.md:312-313 | Matches |
| A19 | Matt 20:16b "for many be called, but few chosen"; Matt 22:14 | 40-matthew.md:738 "…for many be called, but few chosen." / :822 "For many are called, but few are chosen." | Matches |
| A20 | Matt 21:44 "whosoever shall fall on this stone shall be broken"; Luke 20:18 | 40-matthew.md:803 / 42-luke.md:978 | Matches |
| A21 | Mark 15:28 cites Isa 53:12; Luke 22:37 | 41-mark.md:698 "And the scripture was fulfilled, which saith, And he was numbered with the transgressors." / 42-luke.md:1088 / 23-isaiah.md:1242 | Matches |
| A22 | Matt 16:2b-3 "signs of the times" | 40-matthew.md:592-593 "…can ye not discern the signs of the times?" | Matches |
| A23 | KJV Luke 11:2-4 has the Matthean additions | 42-luke.md:561 "Our Father which art in heaven… Thy will be done, as in heaven, so in earth."; :563 "…but deliver us from evil." | Matches |
| A24 | KJV "my blood of the new testament" in Matt 26:28 and Mark 14:24 | 40-matthew.md:1030 "For this is my blood of the new testament, which is shed for many for the remission of sins." / 41-mark.md:619 "This is my blood of the new testament, which is shed for many." | Matches |
| A24 | "new" comes from Luke 22:20 / 1 Cor 11:25, "the only places Yeshua is reported saying 'new'" | 42-luke.md:1071 "This cup is the new testament in my blood"; 46-1-corinthians.md:309. But also 41-mark.md:620 "until that day that I drink it new"; 40-matthew.md:1031 "drink it new with you"; 43-john.md:673 "A new commandment I give unto you"; 41-mark.md:737 "new tongues" | **Differs:** the held texts support the narrower wording. The narrow version (the only places he speaks of a *new covenant*) holds |
| A24 | Exodus 24:8 "blood of the covenant" | 02-exodus.md:739 "Behold the blood of the covenant…" | Matches |
| A26 | The Byzantine expansions listed are in the KJV | All present: Matt 5:22 "without a cause" (40:141); Matt 9:13 / Mark 2:17 "to repentance" (40:289 / 41:82); Matt 19:9b (40:698); Matt 20:22-23 baptism clause (40:744-745); Matt 25:13 "wherein the Son of man cometh" (40:966); Mark 6:11b Sodom (41:235); Mark 7:8b "pots and cups" (41:291); Mark 10:21 "take up the cross" (41:438); Mark 10:24 "them that trust in riches" (41:441); Mark 13:14 "spoken of by Daniel the prophet" (41:569); Luke 4:8 "Get thee behind me, Satan" (42:204); Luke 4:18 "to heal the brokenhearted" (42:214); Luke 11:44 "scribes and Pharisees, hypocrites" (42:603); John 3:13 "which is in heaven" (43:112); John 6:47 "on me" (43:292); John 6:69 "that Christ, the Son of the living God" (43:314); John 7:8 "not yet" (43:327); John 9:35 "Son of God" (43:472) | Matches (the KJV carries every one) |
| A26 | Mark 6:3 "carpenter"; Luke 9:35 "my Beloved"; Matt 27:16-17 no "Jesus Barabbas"; Luke 2:14 "goodwill toward men" | 41-mark.md:227 "Is not this the carpenter"; 42-luke.md:484 "This is my beloved Son"; 40-matthew.md:1096-1097 "Barabbas" only; 42-luke.md:114 "good will toward men" | Matches (the KJV has the readings the sheet calls later) |
| A27 | Luke 3:22 majority "Thou art my beloved Son; in thee I am well pleased"; Psalm 2:7; Acts 13:33 uses Ps 2:7 for the resurrection; Acts 10:38, 4:27 anointing | 42-luke.md:177 "Thou art my beloved Son; in thee I am well pleased." / 19-psalms.md:33 "Thou art my Son; this day have I begotten thee." / 44-acts.md:525 "…in that he hath raised up Jesus again; as it is also written in the second psalm, Thou art my Son, this day have I begotten thee." / 44-acts.md:418 "How God anointed Jesus of Nazareth with the Holy Ghost"; :152 "whom thou hast anointed" | Matches |
| A28 | **KJV lacks "neither the Son"** at Matt 24:36; Mark 13:32 has it | 40-matthew.md:935 "But of that day and hour knoweth no man, no, not the angels of heaven, but my Father only." / 41-mark.md:587 "…no, not the angels which are in heaven, neither the Son, but the Father." | Matches |
| A29 | Mark 1:1 "the Son of God" (in the KJV) | 41-mark.md:18 "The beginning of the gospel of Jesus Christ, the Son of God;" | Matches |
| A30 | John 1:18 "only begotten Son" (the KJV/Byzantine reading) | 43-john.md:35 "…the only begotten Son, which is in the bosom of the Father…" | Matches |
| A31 | Byzantine/KJV "Joseph and his mother" at 2:33 and 2:43; 2:41 "his parents" and 2:48 "thy father and I" left alone | 42-luke.md:133 "And Joseph and his mother marvelled…"; :143 "…and Joseph and his mother knew not of it."; :141 "Now his parents went…"; :148 "…thy father and I have sought thee sorrowing." | Matches (the KJV shows exactly the not-systematic pattern the sheet describes) |
| A31 | Matt 1:16 Greek "Joseph the husband of Mary, of whom was born Jesus" | 40-matthew.md:33 "And Jacob begat Joseph the husband of Mary, of whom was born Jesus, who is called Christ." | Matches |
| A32 | Matt 1:25 "her firstborn son"; Luke 2:7 | 40-matthew.md:42 "…till she had brought forth her firstborn son…" / 42-luke.md:107 | Matches |
| A33 | Mark 1:41 "moved with compassion" | 41-mark.md:58 | Matches |
| A34 | Matt 27:49 has no spear in the KJV; John 19:34 | 40-matthew.md:1129 "…let us see whether Elias will come to save him." (no spear) / 43-john.md:886 | Matches |
| A35 | 1 John 5:7 KJV "the Father, the Word, and the Holy Ghost: and these three are one" | 62-1-john.md:120 "For there are three that bear record in heaven, the Father, the Word, and the Holy Ghost: and these three are one." | Matches |
| A1 | Mark 16:16, 16:18 (quoted in ASV) | 41-mark.md:736 "He that believeth and is baptized shall be saved…"; :738 "They shall take up serpents; and if they drink any deadly thing, it shall not hurt them…" | Matches in substance (ASV "shall in no wise hurt them", KJV "it shall not hurt them") |
| A2 | John 7:53-8:11 | 43-john.md:372 "And every man went unto his own house."; :386 "Neither do I condemn thee: go, and sin no more." | Matches (the KJV prints it with no brackets) |
| A3, A4, A5 | Luke 22:43-44; 23:34; 22:19b-20 | 42-luke.md:1094-1095; :1159; :1070-1071 | Matches (all present in the KJV) |
| A25 | Luke 24:51 "carried up into heaven"; 24:12; Acts 1:3 forty days | 42-luke.md:1235; :1196; 44-acts.md:20 "being seen of them forty days" | Matches |
| B4 | KJV "into the draught, purging all meats" | 41-mark.md:302 "Because it entereth not into his heart, but into the belly, and goeth out into the draught, purging all meats?" | Matches |
| B4 | Matt 15:17 drops the clause; 15:18 "defile the man" | 40-matthew.md:565 "…is cast out into the draught?" (no "purging"); :566 "…and they defile the man." | Matches |
| B3 | *ekklēsia* only Matt 16:18 and 18:17 (twice) in the Gospels | grep "church" in the four gospels finds only 40-matthew.md:608 and :668 (twice in 18:17) | Matches (in the English KJV; we hold no Greek) |
| B3 | Luke 17:3 "rebuke and forgive" | 42-luke.md:826 "…rebuke him; and if he repent, forgive him." | Matches |
| B5 | Mark 10:11-12, Luke 16:18, 1 Cor 7:10-11 absolute; Matt 5:32, 19:9 have the exception | 42-luke.md:807 (no exception); 46-1-corinthians.md:169 "yet not I, but the Lord"; 40-matthew.md:151 "saving for the cause of fornication"; :698 "except it be for fornication" | Matches |
| B6 | "kingdom of God" in John only at 3:3 and 3:5 | 43-john.md:102, :104 are the only hits | Matches |
| B6 | Seams: 14:31 "Arise, let us go hence"; 16:5 "none of you asketh me"; 13:36 Peter asks; 18:1 | 43-john.md:711; :749; :675 "Lord, whither goest thou?"; :810 | Matches |
| B8 | Luke 22:27 "as he that serveth"; Mark 10:45 ransom | 42-luke.md:1078 "but I am among you as he that serveth."; 41-mark.md:462 | Matches |
| B12 | Luke 22:37 is the explicit Isa 53:12 citation | 42-luke.md:1088 | Matches |
| B13 | Matt 10:5-6, 15:24 restriction | 40-matthew.md:322-323; :572 | Matches (sheet quotes the ASV "any way"; the KJV has "the way") |
| B14 | Mark 1:4 "baptism of repentance for/unto remission of sins"; Matt 3:2 drops it; Matt 26:28 adds it | 41-mark.md:21; 40-matthew.md:73 "Repent ye: for the kingdom of heaven is at hand." (no remission); :1030 | Matches |
| B14 | Leviticus 17:10-14 on blood | 03-leviticus.md:565 "…that eateth any manner of blood…" | Matches |
| B15 | John 6:53; 6:63 | 43-john.md:298; :308 "the flesh profiteth nothing" | Matches |
| B17 | Matt 12:40 quotes Jonah 1:17; Matt 16:4 short form; Luke 11:30 | 40-matthew.md:435; 32-jonah.md:34 "three days and three nights"; 40-matthew.md:594 (no explanation); 42-luke.md:589 | Matches |
| B18 | Matt 5:17-18; Luke 16:17 | 40-matthew.md:136-137; 42-luke.md:806 | Matches |
| F3.1 | Luke 1:5 "in the days of Herod, king of Judaea"; Zacharias; Elisabeth "of the daughters of Aaron"; Caiaphas Luke 3:2. **"Matthew and Mark have none of these names"**; the four details "appear in no other Greek gospel" | 42-luke.md:22; :157. **But 40-matthew.md:1005 "the high priest, who was called Caiaphas"; :1059 "led him away to Caiaphas the high priest"; 43-john.md:575, :822** | **Differs:** Caiaphas is in Matthew (26:3, 57) and John (11:49; 18:13 and more). Accurate narrower claim: only Luke dates John the Baptist's appearance by Caiaphas (3:2) |
| F3.2 | Luke 3:23 "about thirty years of age"; Luke 6:13 "chose… apostles"; Matt 9:9 | 42-luke.md:178; :298; 40-matthew.md:285 "sitting at the receipt of custom" | Matches (note: Matt 10:2 also has "the twelve apostles", 40-matthew.md:319) |
| F3.4 | Luke 17:4 "seven times in a day"; Matt 18:22 "seventy times seven" | 42-luke.md:827; 40-matthew.md:673 | Matches |
| F3.5 | Luke 24:39 "handle me, and see" | 42-luke.md:1223 | Matches |
| F3.6 | Matt 3:14 John asks to be baptized by Jesus | 40-matthew.md:85 "I have need to be baptized of thee" | Matches |
| F3.8 | Matt 4:5 "holy city"; Luke 4:9 "to Jerusalem" | 40-matthew.md:96; 42-luke.md:205 | Matches |
| F3.11 | Luke 15:30 "devoured thy living with harlots" | 42-luke.md:784 | Matches |
| F3.12 | Matt 6:11 **and Luke 11:3**: "Give us this day our daily bread" | 40-matthew.md:181 matches; 42-luke.md:562 "Give us **day by day** our daily bread." | Differs slightly: Luke's wording is not the same as Matthew's (the KJV and ASV agree on "day by day") |
| F3.14 | Matt 23:35 "son of Barachiah"; Luke 11:51 no father; 2 Chr 24:20 son of Jehoiada; Zech 1:1 son of Berechiah | 40-matthew.md:892 "Zacharias son of Barachias"; 42-luke.md:610; 14-2-chronicles.md:589 "Zechariah the son of Jehoiada the priest"; 38-zechariah.md:18 "Zechariah, the son of Berechiah" | Matches |
| F3.18 | Matt 12:50 "will of my Father"; Mark 3:35 "will of God" | 40-matthew.md:445; 41-mark.md:131 | Matches |
| F3.19 | John 1:32 "abode upon him"; Isa 11:2 "shall rest upon him" | 43-john.md:49; 23-isaiah.md:279 (KJV "the spirit of the LORD", ASV "Jehovah") | Matches |
| F3.21 | "son of John" agrees with John 1:42 and 21:15 | 43-john.md:59 "Thou art Simon the son of **Jona**"; :946 "Simon, son of **Jonas**" | **Differs in the KJV:** the agreement shows only in the critical text/ASV ("son of John"); a KJV reader will see "Jona/Jonas" |
| F3.24 | Mark 1:6, Matt 3:4 locusts and wild honey | 41-mark.md:23; 40-matthew.md:75 | Matches |
| F3.26 | 1 Cor 15:7 appearance to James; Luke 24:30 bread | 46-1-corinthians.md:421 "After that, he was seen of James"; 42-luke.md:1214 | Matches |
| F3.27 | Matt 27:51 veil | 40-matthew.md:1131 | Matches |
| F4 | Luke 13:19 "became a tree"; Mark 4:32 "great branches"; Luke 6:20 vs Matt 5:3; Matt 22:7 "burned their city"; Mark 12:1, 9; Matt 13:45; Luke 12:33; Luke 10:8; Mark 7:15; Mark 9:34 | 42-luke.md:697; 41-mark.md:166; 42-luke.md:305 "Blessed be ye poor"; 40-matthew.md:122 "poor in spirit"; 40-matthew.md:815 "burned up their city"; 41-mark.md:509, :517 "destroy the husbandmen"; 40-matthew.md:493; 42-luke.md:649 "neither moth corrupteth"; 42-luke.md:522 "eat such things as are set before you"; 41-mark.md:298; 41-mark.md:398 | Matches |
| F5 | Luke 4:3 "If thou art the Son of God"; Luke 10:22; Luke 7:35; Luke 11:49 | 42-luke.md:199 ("If thou be"); :536; :372 "wisdom is justified of all her children"; :608 "said the wisdom of God" | Matches |
| F5 | Q's Lord's Prayer is Luke's short form, "Father, Hallowed be thy name" | 42-luke.md:561, the KJV long form | Consistent with A23 (the short form is the critical text; the KJV has the harmonized long form) |
| F6 | Mark 1:2 introduces the quotation as "written in Isaiah the prophet" though line 1 is Malachi 3:1 | 41-mark.md:19 "As it is written **in the prophets**…"; 39-malachi.md:55 | **Differs in the KJV:** the point works only in the critical text/ASV. The KJV (Byzantine) reads "in the prophets", which is itself the kind of scribal smoothing the sheet describes elsewhere |
| F6 | John 2:11 "beginning of his signs", 4:54 "second sign", 2:23 | 43-john.md:82, :192, :94 (the KJV has "miracles") | Matches in substance |

---

## 2. Baptism in Acts (B1, Part C, Part D, Part E3)

**The sheet's claims.** B1: "every baptism in Acts is in the name of Yeshua (Acts 2.38; 8.16; 10.48; 19.5)". Part C: "every baptism recorded in Acts is in the name of Yeshua alone". Part D: "the apostles baptize in the name of Yeshua every time". E3: "Every single baptism recorded there is in the name of Yeshua… Not one is in the three names."

**Every "baptiz-" passage in KJV Acts** (`44-acts.md`):

| Ref (line) | Scene | KJV text | Formula stated? |
|---|---|---|---|
| 2:38 (:84) | Pentecost, command | "Repent, and be baptized every one of you **in the name of Jesus Christ** for the remission of sins" | **Yes: "in the name of Jesus Christ"** |
| 2:41 (:87) | Pentecost, the act | "Then they that gladly received his word were baptized" | No |
| 8:12 (:303) | Samaria | "when they believed Philip preaching… the name of Jesus Christ, they were baptized" | No (the name is in the preaching, not stated as the formula) |
| 8:13 (:304) | Simon Magus | "when he was baptized" | No |
| 8:16 (:307) | Samaria, explained | "only they were baptized **in the name of the Lord Jesus**" | **Yes: "in the name of the Lord Jesus"** |
| 8:36-38 (:327, :329) | Ethiopian eunuch | "and he baptized him" (8:37, a confession "I believe that Jesus Christ is the Son of God", is in the KJV but is itself a verse modern texts omit) | No |
| 9:18 (:352) | Saul | "and arose, and was baptized" | No |
| 10:47-48 (:427-428) | Cornelius | "he commanded them to be baptized **in the name of the Lord**" | **Yes, but in the KJV it reads "the Lord", not "Jesus".** The sheet's "Yeshua" here depends on the critical Greek ("Jesus Christ"), which we do not hold |
| 16:15 (:637) | Lydia | "when she was baptized, and her household" | No |
| 16:33 (:655) | Philippian jailer | "and was baptized, he and all his, straightway" | No |
| 18:8 (:710) | Crispus and Corinthians | "believed, and were baptized" | No |
| 19:3-5 (:736-738) | Ephesian disciples | 19:3 "Unto what then were ye baptized? And they said, Unto John's baptism." 19:5 "they were baptized **in the name of the Lord Jesus**" | **Yes: "in the name of the Lord Jesus"** |
| 22:16 (:877) | Saul's baptism, retold | "arise, and be baptized, and wash away thy sins, calling on the name of the Lord" | An invocation of "the name of the Lord" goes with it; it is not a stated "baptized in the name of" formula |

(John's baptism: 1:5, 1:22, 10:37, 11:16, 13:24, 18:25, 19:4. These are references, not Christian baptisms.)

**Verdict: Differs: the held texts support a narrower wording.** Of roughly nine baptism scenes, four state a formula (2:38, 8:16, 10:48, 19:5). All four name Jesus or "the Lord", and none is triadic, so "Not one is in the three names" **matches**. Five scenes state no formula at all (the eunuch, Saul, Lydia, the jailer, Corinthians), so "every baptism… is in the name of Yeshua" goes past what the text says. A version that holds up: *every baptism in Acts whose formula is given is in the name of Jesus (or "the Lord"); none uses the Father-Son-Spirit formula.*

**Paul (B1, E3):** "Paul speaks the same way (Romans 6.3; Galatians 3.27; 1 Corinthians 1.13)".
- 45-romans.md:173 "so many of us as were baptized **into** Jesus Christ were baptized into his death"
- 48-galatians.md:95 "as many of you as have been baptized **into** Christ have put on Christ"
- 46-1-corinthians.md:30 "were ye baptized in the name of Paul?" (rhetorical; it implies baptism in Christ's name)

Verdict: Matches in substance (Christ alone, nothing triadic). Paul's wording is "into Christ", not "in the name of Yeshua".

**Context the sheet doesn't mention (held, could matter for B1):**
- *Clementine Recognitions* 1.39 (`clementine-recognitions-full-text.md`:1454-1465) speaks of baptism "on the invocation of His name" and of one who "is baptized in His name" (the Prophet's).
- *Clementine Homilies* 11.26 (`clementine-homilies-full-text.md`:6893-6897), another Jewish-Christian text, uses the triadic formula: "Unless ye be regenerated by living water into the name of Father, Son, and Holy Spirit, you shall not enter the kingdom of heaven", and refers to "the thrice blessed invocation". Someone answering the B1 argument could raise it.

**Acts 10, 11, 15; Galatians 2 (quick check).**
- B1: the Jerusalem church "is stunned that Gentiles are included". Acts 10:45 (:425): "they of the circumcision which believed were **astonished**… because that on the Gentiles also was poured out the gift of the Holy Ghost". 11:2-3 (:433-434): "they that were of the circumcision contended with him, Saying, Thou wentest in to men uncircumcised, and didst eat with them". 11:18 (:449): they then "glorified God". 15:1, 15:5 (:579, :583): the circumcision dispute. **Matches.**
- B4: "still fighting over food purity decades later". Acts 10:14 (:394) "I have never eaten any thing that is common or unclean"; 15:20, 29 (:598, :607) abstain "from things strangled, and from blood"; Gal 2:12 (48-galatians.md:56) "he did eat with the Gentiles: but when they were come, he withdrew". **Matches in substance.** A reader may point out that Acts 10:15 (:395) "What God hath cleansed, that call not thou common" is read the other way (10:28 at :408 applies it to people, "I should not call any man common or unclean").

---

## 3. Epiphanius, *Panarion* (Wescoe), `epiphanius-panarion-book-1-full-text.md`

| Sheet | Sheet's wording | Held (Wescoe), line | Verdict |
|---|---|---|---|
| F2 | Nazoraeans have Matthew "most complete, in Hebrew" (29.9.4) | :3053 "**29,9,4a** They have the Gospel according to Matthew complete, in Hebrew." :3055 "…preserved, as it was originally written, in Hebrew letters." :3057 "Whether they have also removed the genealogies… I do not know." | Matches in substance; Wescoe has "complete", not "most complete" |
| F2 | Ebionites accept Matthew and "call it 'according to the Hebrews'" (30.3.7) | :3119-3123 "**30,3,7a** And they too receive the Gospel according to Matthew… **7c** And they call it the Gospel according to the Hebrews, as it is true to say, since Matthew alone… proclaimed the gospel in Hebrew and in Hebrew letters." | Matches |
| F2 | "falsified and mutilated" (30.13.2) | :3365 "…not whole and entirely complete, but falsified and mutilated (and they call it Hebrew)…" | Matches |
| F2 / F3.1 | Lacks the genealogies (30.14.3) | :3405 "For they cut away the genealogies in Matthew and make their beginning… 'It happened… in the days when Herod was king over Judaea, while Caiaphas was high priest…'" | Matches |
| F3.1 | "It came to pass in the days of Herod the king of Judaea", Caiaphas, line of Aaron, Zacharias and Elisabeth (30.13.6, 30.14.3) | :3381 "**30,13,6** …'It happened in the days when Herod was king over Judaea, [while Caiaphas was high priest,] that there came [a certain man,] John [by name,] baptizing… of the family of Aaron the priest, a child of Zacharias and Elizabeth…'" | Matches in substance (different translation). In 30.13.6 the Caiaphas clause is in square brackets; 30.14.3 has it without brackets |
| F3.2 | "There appeared a certain man named Jesus, of about thirty years of age," who "chose us"… Matthew "at the receipt of custom"… "twelve apostles for a testimony unto Israel" (30.13.2-3) | :3365 "There appeared a certain man, Jesus by name, himself some thirty years old, who **selected** us."; :3369 "you, Matthew, as you sat at the **tax office**, I called"; :3371 "I wish you, then, to be twelve apostles for a testimony to Israel" | Matches in substance. Note: the sheet's argument that "chose… apostles" is Luke's wording depends on the English. Wescoe has "selected", and "receipt of custom" is the KJV's Matthew 9:9 phrase, not this text's |
| F3.24 | Wild honey "tasting of manna, 'as a cake dipped in oil'; no locusts" (30.13.4-5) | :3377 "And his food, it says, was wild honey, which tasted of manna, like a cake made with oil"; :3379 "**30,13,5** so that, no doubt, they may turn the word of truth into a lie and make it a cake in honey instead of locusts." | Matches in substance ("made with oil", not "dipped in oil"). Epiphanius presents it as a deliberate change. The *enkris/akris* wordplay can't be checked: the held file is English only |
| A27 / F3.6 | The Ebionite gospel (30.13) gives "the Psalm 2.7 form". F3.6: the Spirit "enters into him"; "Thou art my beloved Son," and "This day have I begotten thee"; "a great light"; John asks to be baptized (30.13.7-8) | :3385 "…coming down and entering into him."; :3387 "**30,13,7c** And a voice from heaven, saying: 'You are my beloved Son, **in you I am well pleased**'; and again: 'Today I have begotten you.'"; :3389 "And at once a great light shone round the place."; :3393 "**7f** And again a voice from heaven to him: 'This is my beloved Son, on whom I am well pleased.'"; :3395 "I beg you, Lord, baptize me yourself." | **Differs.** The details (entering, light, John's request) match. But this text has the "well pleased" form **twice** and the Psalm 2.7 line once, so it is a combined text, not a witness to the Psalm 2.7 form *instead of* the majority form. F3.6's quotation drops the "in you I am well pleased" clause that sits between "beloved Son" and "Today I have begotten you". This affects A27 ("all give the Psalm 2.7 form") and F7 ("The reading the scribes removed from Luke is the Hebrew Gospel's reading") |
| F3.18 | "These are my brethren and mother and sisters," those "who do the will of my Father" (30.14.5) | :3411 "**30,14,5b** …'These are my brothers and mother and sisters, who do the will of my Father.'" | Matches. (Epiphanius cites it as the Ebionites' grounds for denying he is a man, :3409) |
| F3.22 | "I came to abolish sacrifices," and "if ye cease not from sacrificing, **the wrath will not cease from you**" (30.16.4-5) | :3437 "**30,16,5a** as the gospel so called among them contains: 'I have come to do away with the sacrifices, and unless you cease from sacrificing, the wrath will not cease from you.'"; :3439 "**5b** These and certain things like them are the crafty devices among them." | **Matches.** The sheet does **not** add "of God", which agrees with our audit A1 (`AUDIT-LIST.md`; `audits/2026-10-20-panarion-quotations.md`: Holl's Greek has ἡ ὀργή alone). The precise locus is 30.16.5a (30.16.4 is the lead-in). The sheet labels it the Hebrew Gospel; our audit and VERIFIED-SOURCES call it the Ebionites' gospel |
| F3.3 | "Have I desired with desire to eat flesh with you this Passover?" (30.22.4). F3.3: "a question expecting the answer no"; "the Hebrew Gospel's form carries the Semitic grammar" (F7) | :3589 (30.22.3a) Epiphanius quotes Luke: "With longing I have longed to eat this Passover with you"; :3593 "**30,22,4** But they… **altered the passage**… and him, supposedly, say, '**I have not longed with longing to eat meat this Passover with you.**'"; :3597 "**30,22,5b** …instead of saying 'With longing I have longed', they added the adverb 'not'."; :3599 "…by writing in 'meat', have led themselves astray…" | **Differs.** (1) Wescoe renders a negative statement, not a question. The Greek μή (from our audit: μὴ ἐπιθυμίᾳ ἐπεθύμησα κρέας…) can be read either way, so both renderings are possible translations. Say which translation is being quoted. (2) The held text presents this as the group's *alteration of Luke* ("the mu and the eta are additions", 30.22.5a :3595). The doubled idiom is Luke's own Greek, quoted by Epiphanius. `questions/CITATION-NOTES.md` (stress-test table) records this saying as secondary, a wordplay inversion of Luke 22:15. The sheet's F3.3, F6 and F7 use it as evidence that Luke drew on the Hebrew Gospel. The sheet does not mention Epiphanius's statement that it was altered |
| Verify list item 8 | Panarion 46.1.9: some called Tatian's Diatessaron "according to the Hebrews" ("locus from memory") | :9461 "**46,1,9** And the gospel through Four is said to have been made by him, which some call the Gospel according to the Hebrews." | **Matches: locus confirmed** |
| A29 | Epiphanius omits "Son of God" at Mark 1:1 | Not found by grep for "beginning of the gospel" in the three Panarion files | Not located (it may be in another work, or worded differently) |

---

## 4. Clementine Recognitions 1.39 (F3.22)

**The sheet:** "The Clementine *Recognitions* 1.39 says baptism was given so sins would be remitted 'instead of sacrifices' ([Homilies 3](https://www.newadvent.org/fathers/080803.htm)), a thematic parallel, not a quotation."

**Held** (`clementine-recognitions-full-text.md`:1452-1465, Smith, ANF 8):
> ### Chapter XXXIX — Baptism Instituted in Place of Sacrifices
> "But when the time began to draw near… that the Prophet should appear, of whom he had foretold that He should warn them by the mercy of God to cease from sacrificing; lest haply they might suppose that on the cessation of sacrifice there was no remission of sins for them, He instituted baptism by water amongst them, in which they might be absolved from all their sins on the invocation of His name… being purified not by the blood of beasts, but by the purification of the Wisdom of God…"

**Verdict: Matches in substance, differs in detail.** The idea is right and the sheet itself calls it a thematic parallel. But the phrase in quotation marks, "instead of sacrifices", is not in the text of 1.39. The nearest is the chapter heading "Baptism Instituted in Place of Sacrifices", which is most likely the ANF editor's heading. The safe quotation is VERIFIED-SOURCES' "purified not by the blood of beasts" (1.39). The link's own label reads "Homilies 3", which does not match the citation (Recognitions Book 1). We can't open the URL here (no web), so this rests on the label alone.

---

## 5. Didache (Richardson), `didache-full-text.md`

| Sheet | Claim | Held | Verdict |
|---|---|---|---|
| B1, E3 | Didache 7.1 has the triadic formula | :97 "…'baptize' in running water, 'in the name of the Father and of the Son and of the Holy Spirit.'"; and again :101 (7.3) "pour water on the head three times 'in the name of the Father, Son, and Holy Spirit.'" | Matches (the formula is there twice, 7.1 and 7.3) |
| A6 | 8.2 has a two-part doxology, "for thine is the power and the glory for ever" | :111 "…but save us from the evil one, for yours is the power and the glory forever." | Matches (different translation; two-part, as the sheet says) |
| B1 | Didache "has both formulas, triadic in 7.1 and 'in the name of the Lord' in 9.5" | :127 "You must not let anyone eat or drink of your Eucharist except those baptized in the Lord's name." | Matches the wording ("in the Lord's name"). Note: 9.5 is a rule about who may share the Eucharist, which *refers to* baptism "in the Lord's name"; the baptism instructions themselves (ch. 7) give only the triadic form, twice. Whether the triad was "one liturgical option" is the sheet's reading of 9.5 |
| B14, Part C | Didache 9-10 "describes a eucharist with no body or blood words at all" | :115-151: cup "for the holy vine of David", the broken bread "scattered over the hills", thanks "for the life and knowledge"; no body, blood, or death language | Matches. (Ch. 14, :201-205, uses "sacrifice" three times for the gathering's own offering. The sheet makes no "no sacrifice" claim, so there is no conflict with `CITATION-NOTES.md`) |

---

## 6. Gospel of Thomas: held translation is **Lambdin** (`gospel-of-thomas-full-text.md`)

The sheet says to check Thomas against Lambdin and against Patterson-Meyer (Scholars Version). We hold Lambdin only.

| Logion | Sheet | Held Lambdin (line) | Verdict |
|---|---|---|---|
| 2 | F3.13 / F4: Thomas 2 "has the full chain", "the same chain, seek, find, marvel, reign, rest, as Clement's quotation" | :17 "Let him who seeks continue seeking until he finds. When he finds, he will become troubled. When he becomes troubled, he will be astonished, and he will rule over the All." | **Differs.** The Coptic in Lambdin runs seek, find, **troubled**, astonished, rule. It has **no "rest"**. "Rest" is in the Greek P.Oxy 654 (not held), as the sheet's own link suggests. Say "Thomas 2 in its Greek form (P.Oxy 654)" if the five-step chain with "rest" is meant |
| 9 | Sower with no explanation | :31 the parable only, ending "sixty per measure and a hundred and twenty per measure." | Matches |
| 12 | "James the Just, 'for whose sake heaven and earth came into being'" (link: ECW Lambdin) | :37 "…you are to go to James **the righteous**, for whose sake heaven and earth came into being." | Differs in one word. Lambdin has "righteous"; this is already logged in `CITATION-NOTES.md` (translation variants) |
| 14 | Fasting, prayer, alms bring harm; "eat what they will set before you"; heal the sick; "what goes into your mouth will not defile you" | :41 "If you fast, you will give rise to sin… eat what they will set before you, and heal the sick among them. For what goes into your mouth will not defile you, but that which issues from your mouth - it is that which will defile you." | Matches |
| 20 | The seed "puts out a great branch that shelters the birds" | :53 "…it produces a great **plant** and becomes a shelter for birds of the sky." | Differs in wording ("plant", not "branch"). The comparison with Luke's "tree" and Mark's "great branches" reads differently in Lambdin |
| 25 | Love of the brother | :63 "Love your brother like your soul, guard him like the pupil of your eye." | Matches (as a theme) |
| 27 | "Unless you fast from the world" is Thomas 27 | :67 "If you do not fast as regards the world, you will not find the kingdom…" | Matches in substance (paraphrase) |
| 53 | Physical circumcision called useless | :119 "If it were beneficial, their father would beget them already circumcised… Rather, the true circumcision in spirit has become completely profitable." | Matches in substance |
| 54 | "Blessed are the poor, for yours is the kingdom of heaven" (ECW Lambdin) | :121, the same words | Matches exactly |
| 64 | Ends "Businessmen and merchants will not enter the places of my Father" | :141 "…Businessmen and merchants will not enter the places of my father." | Matches (lower-case "father" in the file) |
| 65 / 66 | Tenants kill the son and the story ends; 66 follows with the rejected stone | :143 ends "…they seized him and killed him. Let him who has ears hear."; :145 "Show me the stone which the builders have rejected…" | Matches |
| 76 | A merchant with a consignment "sells everything" for the pearl; a treasure no moth devours | :165 "…a merchant who had a consignment of merchandise and who discovered a pearl… He sold the merchandise and bought the pearl alone… where no moth comes near to devour and no worm destroys." | Matches in substance ("sold the merchandise", not "everything") |
| 79 | Joins Luke 11:27-28 and 23:29 | :171 "Blessed are the womb which bore you…" / "Blessed are the womb which has not conceived…" | Matches |
| 99 | "Those here who do the will of my father" | :211 "Those here who do the will of my father are my brothers and my mother." | Matches exactly. (Thomas 99 has no "sisters", unlike Panarion 30.14.5) |
| 100 | Gold coin, no Pharisee plot; "give me what is mine" | :213 "They showed Jesus a gold coin and said to him, 'Caesar's men demand taxes from us.'… give me what is mine." | Matches |
| 101 | "true mother" | :215 "For my mother [...], but my true mother gave me life." | Matches (there is a gap in the text) |
| 104 | Call to pray and fast; "What is the sin that I have committed" | :221 "Come, let us pray today and let us fast." Jesus said, "What is the sin that I have committed, or wherein have I been defeated?…" | Matches |
| 107 | "I love you more than the ninety-nine" (credited to Patterson-Meyer) | :227 "One of them, the largest, went astray… 'I **care for** you more than the ninety-nine.'" | Differs from Lambdin ("care for"), but the sheet correctly names Patterson-Meyer as its source. "The largest" matches |
| F4 general | "A list of sayings, each opening 'Jesus said'" | Several do not: (1) "And he said", (27) opens straight with the quotation, (101) the same, and many open with the disciples' question (12, 99, 104) | Differs slightly (a general description, not a quotation) |

---

## 7. Other sources the sheet quotes: held or not

| Source as cited in the sheet | Held? | Result |
|---|---|---|
| Ignatius, *Smyrnaeans* 3.2 ("bodiless demon") | Not held | Cited at reference level only |
| Eusebius, *HE* 3.39.15-17 (Papias), 3.24.6, 3.25.5, 3.27.4, 3.36.11, 4.22.8, 5.10.3, 6.25.4; *DE* 3.6, 3.7, 9.11; *Theophania* 4.12, 4.16 etc.; *Ad Marinum* | **Not held.** We hold only *HE* 2.23.4-7, 2.17.22-24 and *DE* 3.5 (witnesses file, Tier 2) | Cited at reference level only |
| Hegesippus: James's dying prayer echoes "Father, forgive them" (A4; that is HE 2.23.16) | Not held. Our excerpt stops at 2.23.6, which has James "begging forgiveness for the people" (witnesses file :21), not the dying prayer | Not held |
| Jerome (*Comm. Matt.* 12.13, 6.11, 23.35, 27.16, 27.51; *Against the Pelagians* 3.2; *De viris illustribus* 2, 3, 16; *Comm. Isa.* 11.2; *Letters* 20.5, 120) | Not held. We hold only *Against Jovinianus* 2.14 (witnesses file) | Cited at reference level only |
| Irenaeus, *AH* 1.26.2, 3.1.1, 3.10.5, 3.11.7, 3.17.1, 3.18.5 | Not held | Cited at reference level only |
| Clement of Alexandria, *Stromata* 2.9.45, 5.14.96; *Paedagogus* 1.25 | Not held. We hold only *Paed.* 2.1 (witnesses file) | Cited at reference level only |
| Origen (*Comm. John* 2.12; *Hom. Jer.* 15.4; *Comm. Matt.* 15.14 Latin; *Contra Celsum* 6.36; *De principiis* pref. 8; *Hom. Luke* 1) | Not held | Cited at reference level only |
| Justin, *Dialogue* 88, 103; *1 Apology* 45, 61 | Not held | Cited at reference level only |
| Tertullian, Cyprian, Hippolytus, Didymus, Haimo, Sedulius, Augustine | Not held | Cited at reference level only |
| Josephus, *War* 6.293-296 (F3.27) | Not held. We hold only *Ant.* 18.1.5 and *War* 2.8.5 | Cited at reference level only |
| DSS: 1QS 5.25-6.1 and CD 9.2-8 (B3, reproof procedure) | **Not held.** The DSS file has 1QS 3:4-9, 3:13-4:26, 5:1-2, 5:10-14, 6:4-5, 6:17-22, 8:1, 8:12-14 and CD 1, 4, 6, 8, 19; there is no 1QS 5:25-6:1 and no CD 9 (grep "reprov/rebuk/reproo" finds nothing) | Cited at reference level only |
| 4QTestimonia (4Q175) | Not held | Cited at reference level only |
| Mishnah *Avot* 3.2, 3.6; *Gittin* 9.10; b. *Yoma* 39b | Not held | Cited at reference level only |
| Shem-Tob Hebrew Matthew (Howard) | Not held | Cited at reference level only |
| Gospel of Thomas, Greek (P.Oxy 1, 654, 655) | Not held (Coptic in Lambdin only) | Not held |
| Q (F5) | Held as Tier 3 reconstruction only | See section 10 for a problem in our file |

---

## 8. Small descriptive points (no verdict needed, but worth knowing)

- **Didache date.** The sheet gives "about 90 to 120" (B1) and "about 100" (A6). Our file's header says "c. 50-120". Not a conflict.
- **Panarion F2 quotations** are credited to ECW / nazarenejudaism.com pages. Their wording is a different translation from Wescoe's. The substance matches, but anyone quoting from our repo should use Wescoe's wording (VERIFIED-SOURCES rule 1).
- **F3.3 "Hebrew Gospel" vs "Gospel of the Ebionites."** Following Edwards, the sheet treats the Ebionites' gospel quoted in Panarion 30 as the Hebrew Gospel. Our repo files (VERIFIED-SOURCES "Not held" row; AUDIT-LIST A1; CITATION-NOTES) treat it as the Ebionites' gospel, separate from Hebrew Matthew. Panarion 30.13.2 itself says it is "named 'according to Matthew'… (and they call it Hebrew)". 29.9.4 separately says the *Nazoraeans* have Matthew "complete, in Hebrew". Epiphanius treats the two groups' books differently.

---

## 9. Internal consistency: John 1:18 in A30, Part C and Part E(4)

The sheet's thesis (Terms; the A "Christologically loaded" intro; Part C; E4) is that scribal changes about Christ ran one way, lower to higher.

- **A-section intro (sheet line 227):** a scribe "had every motive to… turn 'only begotten Son' into 'only begotten God'". *Son is earlier, God later.*
- **A30 (line 235):** reports that **P66, P75, original Sinaiticus, Vaticanus** (the earliest witnesses) read **"God"**, and Alexandrinus, the Byzantine majority, the Old Latin and the Vulgate read "Son". NA28 reads "God". Metzger: "Son" is the *easier* reading. Ehrman argues "Son" is original and "God" an anti-adoptionist change. Wallace and most text critics: P66/P75 are too early and too widely spread for a doctrinal coordination. Tier: **CONTESTED**. *A30 does not decide; by the manuscripts it reports, the earliest copies have "God".*
- **Part C (line 473):** lists "'only begotten Son' made into 'only begotten God'" among changes where "in each case the earlier text is the lower one". *Son earlier (Ehrman's view), stated as fact, with no mention that A30 calls it contested.*
- **Part E(4) (line 505):** "At John 1.18 **the later copies read only begotten Son where the early Egyptian copies read only begotten God**." Then: "Every change goes the same way, from a lower view of him to a higher one, never the reverse." *God earlier, Son later.*

**Verdict: the three passages do not agree.** The A intro and Part C follow Ehrman: Son was earlier and was raised to God. E(4) states the manuscript order A30 reports: the early copies have God and the later copies have Son. Read as written, that is a change from higher ("God") to lower ("Son"), which contradicts the "never the reverse" sentence in the same paragraph. As written, E(4)'s John 1:18 example works against its own conclusion. To fit the thesis, E(4) would need Ehrman's argument (the early Egyptian "God" is itself the corruption, and the "Son" carried by the later and Western copies preserves the earlier reading), labelled CONTESTED as in A30.

**The same pattern in E(4), less sharply:**
- **Mark 1:1.** E(4) says the original hand of Sinaiticus and Origen lack "Son of God" and "later copies add it". A29 reports Vaticanus (4th c., as early as Sinaiticus) and Irenaeus (c. 180, earlier than Origen) *with* the phrase, and tiers it CONTESTED. E(4) states it as settled.
- **Luke 3:22.** E(4) and F7 state that the scribes replaced "today I have begotten thee". A27 tiers it CONTESTED and notes most scholars (Fitzmyer, Bovon, Marshall) keep the majority reading. Also, per section 3 above, the Ebionite gospel E(4) and F7 rely on has both readings.
- Luke 2:33 and Matt 24:36 in E(4) are consistent with A31 and A28, and with our KJV.

---

## 10. Possible errors in our own repo files (found during this check)

These are candidates for `AUDIT-LIST.md`. Nothing has been changed.

1. **`christianity/Incoming/q-source-reconstruction.md`, Q 11:2-4 note (around line 372).**
   - It says "Matthew expanded with the doxology ('For thine is the kingdom…')". The sheet (A6, citing Metzger / UBS {A}) treats the doxology as a later scribal addition absent from Sinaiticus and Vaticanus, not something Matthew wrote. So the file attributes a scribal addition to the evangelist.
   - It says "Luke's version is shorter", but the Luke text it prints (KJV, line 364) is the harmonized long form ("Our Father which art in heaven… Thy will be done…"), so the quotation on the page doesn't show the shortness the note describes.
   - The "Didache 8:2 parallel" it quotes ("give us today our needful bread; and forgive us our debt… do not bring us to the test, but rescue us from the evil one") is **not** the wording of our held Didache (Richardson, `didache-full-text.md`:111: "give us today our bread for the morrow; and forgive us our debts as we forgive our debtors. And do not lead us into temptation, but save us from the evil one, for yours is the power and the glory forever"). The Q file's version also leaves out the doxology, while its own note says the Didache "preserves a short form of" it.
   - "*epiousion*… appears nowhere else in surviving Greek literature": the Didache 8.2 prayer uses the same word, so "nowhere outside the Lord's Prayer" is the accurate form (the sheet's F3.12 says "found nowhere before the gospels").
2. **`VERIFIED-SOURCES.md` is out of step with the Panarion row it now contains.**
   - Rule 5 (line 15) still lists "Epiphanius" among sources we don't hold ("Josephus, Eusebius, Epiphanius and the rest").
   - The "Not held" table (line 81) still lists "Gospel of the Ebionites (fragments)… Only via Epiphanius", though the Panarion is now a Tier 1 row (line 39).
   - The Panarion row still says "Held; not yet audited". `audits/2026-10-20-panarion-quotations.md` item F13 proposed changing it to "Audited 2026-10-20 against Holl's Greek for Sects 18, 19, 29, 30…", and that change hasn't been made.
   - `CLAUDE.md` (Source Hierarchy paragraph) also lists Epiphanius among "Sources we cite but don't hold".
3. **The sheet's intake header** (line 12) says "Our notes, and what we checked against the texts we hold, are in `extended-library/polemic-answers-red-letters-added-florez-notes.md`." That file does not exist in `extended-library/` yet. (This report could become its basis.)
4. **`questions/CITATION-NOTES.md` and the sheet disagree** on the Passover saying (30.22.4): the notes call it secondary and an Ebionite alteration, while the sheet uses it as an early Hebrew Gospel form behind Luke. The held text (30.22.4-5) supports the notes' description of what Epiphanius says. This is a difference in interpretation to resolve before either file is quoted on it, not an error in our file.

---

*Checked against held texts only. Where something is "not held", the sheet's claim may well be right; we can't confirm it from the repo.*
