# Citation check: "The Kernel Texts of the Clementine Literature" (Christian Florez)

**Contributed by:** Christian Florez, 2026-10-28 (sent to the group to be added; passed on by Matt). This report checks his research sheet.
**Sheet:** `extended-library/clementine-kernel-texts-florez.md` (contributed by Christian Florez, 2026-10-28; about 2,400 words; 124 lines)
**Checked:** 2026-10-28, against texts the repo holds only (no web). No repo file was edited except this report, its repo map, and `claims/`.
**Method:** each claim the sheet makes that a held text can confirm or contradict was grepped and read in the held file. Line numbers are as of today; the quoted phrase is the durable reference. Every primary-text claim has a `claims/` entry (C230-C258); `python3 scripts/claims.py check` confirms each quotation below **Text says:** is really in the held file.

**Held texts used**
- Clementine Homilies, with the Epistle of Peter to James and its adjuration (the "Contestatio"): `christianity/Incoming/clementine-homilies-full-text.md` (ANF 8: Thomas Smith for the letters and Homilies I-V, Peter Peterson VI-XII, James Donaldson XIII-XX)
- Clementine Recognitions: `christianity/Incoming/clementine-recognitions-full-text.md` (Thomas Smith, ANF 8, from Rufinus's Latin; includes Rufinus's preface and the ANF introduction)
- Epiphanius, *Panarion*: `christianity/Incoming/epiphanius-panarion-book-1-full-text.md` (Wescoe)
- Eusebius, *Church History*: `christianity/Incoming/eusebius-church-history-full-text.md` (McGiffert, NPNF 2.1)
- KJV `christianity/Incoming/kjv/` and Westcott-Hort `christianity/Incoming/greek-nt-westcott-hort/` (Galatians 2:11 only)

**What the sheet is.** A summary of modern scholarship on the sources inside the Clementines, built from web reference pages (NASSCAL, Early Christian Writings, Wikipedia, Encyclopedia of the Bible). It doesn't quote the primary texts at length; it points to them by section. So most of its *dating* claims are Not held (they are what scholars argue), and its *content* claims about what the Homilies, Recognitions, Epiphanius and Hegesippus say can be checked. Those mostly match.

**A note on translations.** We hold the Recognitions only in Smith's English of Rufinus's Latin. We hold neither the Latin nor the Syriac version, nor Jones's translation of Recognitions 1.27-71, which is what most modern discussions of the "Ascents" source quote. Where the sheet's wording comes from those, our text can confirm the sense but not the words.

---

## Summary

**Counts.** 29 new `claims/` entries (C230-C258): **17 Matches, 3 Matches (other translation), 2 Matches (other section number), 4 Reads differently, 3 Not held.** The existing entry C56 now also applies to this sheet (see the last section). About ten more checks (chapter headings, the Homilies' book count, the sects list) are in the tables and not repeated in `claims/`.

**The content claims hold up.** The Epistle of Peter's "the man who is my enemy" is word for word in ANF (C230). Recognitions 1.71 **does** name both Caiaphas and Damascus (C247). The seven days on the Temple steps, James thrown "headlong from the top of the steps" and left for dead, the sacrifice-as-concession passage (1.36), baptism replacing sacrifice (1.39, 1.54), the debates with Sadducees, Samaritans, scribes, Pharisees and John's disciples (1.54-60), the syzygies (Homilies 2.15-17), the false pericopes (2.38, 3.47-50), James's testimonial (Homilies 11.35, Recognitions 4.35), the Bardesanes chapters (Recognitions 9.17, 9.19-29), and Epiphanius on the Ascents of James and the Travels of Peter (Panarion 30.15.1, 30.16.7) all say what the sheet says.

**Points where our held texts read differently:**
1. **"A certain hostile man" / "the enemy man" (Recognitions 1.70, sheet line 65; table line 93).** Smith's translation has "some one of our enemies" and "that enemy". The words "hostile man" and "enemy man" are not in our text. The sense is the same, so this is Matches (other translation), but quote ANF's words. The text never names Saul: the heading "Tumult Raised by Saul" is the ANF editor's, and his note rests on a manuscript margin and on 1.71 (C246). Likewise "the hostile man" for the Epistle of Peter (line 42) is Strecker's rendering; ANF has "the man who is my enemy" (C230, C231).
2. **"Kept safe in a fortified place in the country" (Recognitions 1.37, 1.39; line 62).** Not in our text. 1.39 says believers "shall be kept unhurt from the destruction of war which impends over the unbelieving nation, and the place itself"; no refuge is named or described (C242). The Temple-falls-because-of-sacrifice point is clearest at 1.64, which the sheet doesn't cite.
3. **"Quench the fire of the altars" cited as Homilies 11.19 (line 48).** In ANF it is Homilies 3.26, in the same passage as "He hates sacrifices, bloodshed, and libations" (C235, C236). Homily 11.19 is "Not Peace, But a Sword".
4. **Homilies 17.19, the "full year" (line 51).** Peter asks why "our teacher" spent "a whole year" teaching people who were awake if visions are enough to teach; the sheet has him ask "whether Yeshua ever spent a full year teaching him" (Simon) (C240). The "condemned" / Galatians 2:11 point matches, with two cautions: the first "condemned" in the chapter is an editor's emendation (the manuscript reads "in good repute"), and the echo shows in the Greek of Galatians 2:11 (κατεγνωσμενος), not in the KJV ("to be blamed") (C239).
5. **"Its own narrator" (Recognitions 1.27-71; line 78).** In the held text the history is Peter's own discourse to Clement, interrupted by Clement at 1.44 ("Then I, Clement, answered") and referred back to by Peter in 1.73 (C248). The change of content and style is real; a change of narrator is not visible in this translation.
6. **Paul and "the high priest's daughter" (Panarion 30.16.9; line 67).** Wescoe has "the daughter of the priest" (C252). Small, but it is a quotation-sized detail.
7. Smaller: the sheet's "three prefatory letters" (line 32): ANF prints two letters (Peter's, Clement's) with the oath as chapters IV-V of Peter's letter, headed "An Adjuration Concerning the Receivers of the Book"; it doesn't use the name "Contestatio". "Epistula Petri 2.3" is ANF chapter II (C230). Hegesippus is dated "c. 180" here and "c. 170" on our cards; both fit Eusebius 4.22.3 (C255).

**Held text that cuts the other way (worth knowing before anyone quotes the sheet).** The ANF editor's note on the Epistle of Peter (note 889) calls it "the latest portion of the literature" (C231), and the ANF introduction (1886) reports the view that the Bardesanes passage "was not originally in the Recognitions, but was inserted" later (C249). Both are 1886 opinions, not evidence, but a reader holding ANF 8 will see them. In Hegesippus (Eusebius 2.23) James is thrown from the *pinnacle* and killed there; in Recognitions 1.70-73 he is thrown from the *steps* and survives "lame on one foot" (C254). The parallel the sheet draws is real, and so are the differences.

**Not held:** Origen's *Philocalia* (C256: ANF reports the quotation at secondhand, from the *Commentary on Genesis*, "Philocalia, cap. 22"); every modern dating (Strecker, Schoeps, Van Voorst, Jones, Bauckham, NASSCAL; C257); Rufinus's date and the Syriac manuscript of 411 (C258); Bardaisan's death in 222; Lightfoot on Hegesippus; M. R. James on the title "Ascents". Section 5.

**Held texts the sheet could use** (section 6): Homilies 3.20 for the True Prophet appearing "again and again" since the beginning (C234); Recognitions 1.64 for the Temple's fall as the penalty for sacrifice; 1.72 for Peter reporting to James every year; Rufinus's own preface on what he left out (C250); Eusebius 3.5.3 for Pella.

---

## 1. The Epistle of Peter and the Homilies (ANF 8)

| Sheet (line) | Sheet's wording | Held text (file:line) | Verdict |
|---|---|---|---|
| 32 | Homilies: 20 books, Greek, "with three prefatory letters" | homilies:617 onward, 20 `## Homily` headings; :47 "Epistle of Peter to James", :127 "An Adjuration Concerning the Receivers of the Book" (ch. IV-V of Peter's letter), :227 "Epistle of Clement to James" | 20 books **matches**. ANF prints two letters, with the oath inside Peter's |
| 40, 42 | Peter sends his preachings to "bishop" James with strict instructions on who may receive them | :51 "Peter to James, the lord and bishop of the holy Church"; :56-58 "not to communicate to any one of the Gentiles the books of my preachings"; :131-137 the receiver must be "circumcised, and faithful", proved "not less than six years" | **Matches** (C231) |
| 42 | "so they will not be falsified by followers of 'the hostile man'" | :86-89 "the man who is my enemy... to transform my words by certain various interpretations, in order to the dissolution of the law" | **Matches, other translation** (C231). "Hostile man" is not ANF's wording |
| 51, 94 | Ep. Petri 2.3: lawless teaching of "the man who is my enemy" | :85-87, word for word; note 890 "one of the strongest anti-Pauline insinuations" | **Matches, other section number** (C230): ANF chapter II |
| 46 | Teachers accepted only with credentials from James (Homilies 11.35) | :7059-7062 "compare his preaching with that of James"; :7071-7072 note 1139 "Unless he come to you with credentials, viz., from James" (conjectural) | **Matches** (C232). "Credentials" is the translator's conjecture; the text says "witnesses" |
| 47 | The True Prophet has appeared again and again since Adam (no locus given) | Homilies 3.20, :2416-2425 "who has changed his forms and his names from the beginning of the world, and so reappeared again and again in the world" | **Matches** (C234); locus ours |
| 47 | The Torah is still binding | :90-93 (Ep. Petri 2) the law "borne witness to by our Lord in respect of its eternal continuance"; "one jot or one tittle" | Matches |
| 48 | Quenches the fire of the altars (H 11.19) | Homilies 3.26, :2530 "He quenches the fire of altars"; 11.19 (:6769) is "Not Peace, But a Sword" | **Matches, other section number** (C235) |
| 48 | Hates sacrifices, bloodshed and libations (H 3.26) | :2527-2528, word for word | **Matches** (C236) |
| 49 | False pericopes (Homilies 2.38, 3.47-50) | :1850-1853 (2.38 "Corruption of the Law"); :2908-2990 (3.47-50) | **Matches** (C238). This is the CITATION-NOTES §1 passage |
| 50 | Syzygies; Simon before Peter as Cain before Abel (Homilies 2.15-18) | :1375-1378 "pairs and opposites"; :1407-1408 Cain then Abel; :1429-1432 Simon "came before me... as light upon darkness" | **Matches** (C237) |
| 51 | Homilies 17.13-19: visions can't make an apostle | 17.13-18 (:9997-10210) argue that visions come to enemies; 17.19 (:10211) "If, then, our Jesus appeared to you in a vision... it was as one who is enraged with an adversary" | Matches |
| 51 | "asks whether Yeshua ever spent a full year teaching him" | :10218-10219 "Why did our teacher abide and discourse a whole year to those who were awake?" | **Reads differently** (C240) |
| 51, 94 | Accuses him of standing against Peter and calling him "condemned"; a direct echo of Galatians 2:11 | :10225-10231 "in direct opposition to me... you now stand"; "if you say that I am condemned"; note 1367: "condemned" borrowed from Gal. ii. 11, and the first instance is Schwegler's emendation | **Matches** (C239). W-H Gal 2:11 κατεγνωσμενος ην; KJV "to be blamed" |

## 2. Recognitions Book 1 (Smith, ANF 8)

| Sheet (line) | Sheet's wording | Held text (file:line) | Verdict |
|---|---|---|---|
| 57, 103 | A sacred history from creation to the early Jerusalem assembly, in 1.27-71 | headings :1135 "Account of the Creation" (1.27) through :2201 "Flight to Jericho" (1.71) | Matches |
| 78 | It has "its own narrator" | :1119-1133 (1.26) Peter introduces it; :1579 (1.44) "Then I, Clement, answered"; :2262 (1.73) "all that I have now detailed to you" | **Reads differently** (C248) |
| 61 | Moses allowed sacrifice temporarily because of Egypt; the Prophet like Moses (Deut 18:15) would end it (1.36) | :1386-1398, word for word for the sense | **Matches** (C241). Note 559 misprints "Deut. xvii. 15" |
| 61 | Replaced with washing in water (1.39, 1.54) | :1452-1462 (1.39) "He instituted baptism by water"; :1813-1815 (1.54) "for the abolition of sacrifices, and for the bestowal of the grace of baptism" | **Matches** (C56 for 1.39; C243) |
| 62 | Temple's fall is the penalty for sacrificing (1.37, 1.39) | :1418-1421 (1.37) "a people who offer sacrifices are driven away and delivered up into the hands of the enemy"; :2041-2044 (1.64) "therefore the temple shall be destroyed" | Matches; 1.64 is the clearest locus |
| 62 | Believers "kept safe in a fortified place in the country" (1.37, 1.39) | :1463-1466 (1.39) "shall be kept unhurt from the destruction of war"; no place named; no relevant "fortified" in the file | **Reads differently** (C242) |
| 63 | Debate on the Temple steps with Sadducees, Samaritans, scribes, Pharisees, John's followers (1.53-65) | :1854-1856 (1.55) "standing on the steps"; headings 1.56-1.60 | **Matches** (C244) |
| 64 | James goes up the steps and argues for seven days until people and high priest are ready to be immersed (1.66-69) | :2083-2084 (1.66); :2167-2169 (1.69) "through seven successive days he persuaded all the people and the high priest"; :2263-2265 (1.73) "standing on the top of the steps" | **Matches** (C245) |
| 65 | "A certain hostile man" storms in, incites the crowd, throws James headlong from the top of the steps, leaving him for dead (1.70) | :2176-2196 "some one of our enemies"; "that enemy attacked James, and threw him headlong from the top of the steps; and supposing him to be dead"; note 596 | **Matches, other translation** (C246) |
| 65, 93 | Next chapter: commission from Caiaphas to arrest believers in Damascus (1.71) | :2208-2211 "a commission from Caiaphas, the chief priest... go to Damascus with his letters"; note 597 | **Matches** (C247). Caiaphas and Damascus both named |
| 92 | Epiphanius's Greek-proselyte story about Paul is not in Recognitions 1 | 1.70-71 have no such story | Matches |
| 99 | The source knows and rewrites the opening of Acts | 1.71 note 597 (Acts 22:5); 1.65-67 Gamaliel; 1.71 Damascus | Matches in substance (a reading; the parallels are visible) |

## 3. Other Recognitions passages and the ANF front matter

| Sheet (line) | Sheet's wording | Held text (file:line) | Verdict |
|---|---|---|---|
| 46 | Teachers need credentials from James (Recognitions 4.35) | :6505-6510 "the testimonial of James the Lord's brother" | **Matches** (C233) |
| 77 | The Circuits author used Bardaisan in Recognitions 9.19-29 | :10517-10518 note 842 "Ch. 17 and ch. 19-29 are taken in an altered form from the writing ascribed to Bardesanes, De Fato"; :278-284 the ANF intro's later-insertion view | **Matches** (C249), with the 1886 counter-view |
| 77 | Origen quotes the astrology section of Recognitions 10 as Clement's (Philocalia 23.22) | :274-275 "A passage from the Recognitions is quoted by Origen in his Commentary on Genesis, written in 231"; :328 "Philocalia, cap. 22" | **Not held** (C256); ANF supports the substance at secondhand |
| 79 | Rufinus softened further in Latin | :387-393 Rufinus's preface: dissertations "concerning the Unbegotten God and the Begotten... I have chosen to reserve for others"; note 531 | **Matches** (C250), narrower: doctrine, not Paul |
| 32 | Rufinus c. 406-407; Syriac manuscript dated 411 | :296 Rufinus "(d. 410 a.d.)" | **Not held** (C258) |

## 4. Epiphanius and Eusebius

| Sheet (line) | Sheet's wording | Held text (file:line) | Verdict |
|---|---|---|---|
| 67 | Panarion 30.16.6-9: the Ebionites used the *Ascents of James*, with James against the Temple, the sacrifices and the altar fire | book-1 :3443 (30.16.7) "against the temple and the sacrifices, and against the fire upon the altar" | **Matches** (C251). The Ascents are 30.16.7; 30.16.6 is their "Acts of the Apostles" |
| 67 | Paul a Greek, proselyte to marry "the high priest's daughter"; wrote against circumcision, Sabbath and Law | :3445-3449 (30.16.8-9) "the daughter of the priest"; "wrote against circumcision, the sabbath and the law" | **Reads differently** (C252), one word |
| 81, 110 | Epiphanius names the *Circuits of Peter* and the *Ascents of James* as separate Ebionite titles (30.15-16) | :3415 (30.15.1) "the so-called Travels of Peter, supposedly, written by Clement — falsifying their contents"; :3443 | **Matches, other translation** (C253). He treats the Travels as Clement's work falsified by the Ebionites (AUDIT-LIST A10) |
| 69 | Hegesippus's account of James thrown from the Temple, preserved in Eusebius | eusebius :1662-1676 (2.23.11-18) pinnacle, "threw down the just man", "not killed by the fall", stoned, fuller's club | **Matches** (C254), with real differences from Rec 1.70 |
| 80 | Hegesippus c. 180 | :4168 (4.22.3) Rome "until Anicetus... and he by Eleutherus"; :3602 (4.11.7); note 1083 Eleutherus 177-190 | **Matches** (C255) |
| 62 | "Widely read as a memory of the flight to Pella" | eusebius :2056 (3.5.3) Pella | A reading. Rec 1.39 names no place (C242); Eusebius 3.5.3 is the held Pella text |
| 69 | Lightfoot: Hegesippus's account was the finale of the "ascents"; Jones: shared older tradition | Not held | Reference level |

## 5. Not held: cited at reference level only

| Source as cited | Held? | Note |
|---|---|---|
| Strecker, Schoeps, Van Voorst, Jones (1995), Bauckham, Lapham, Olson; NASSCAL; Early Christian Writings; Wikipedia; Encyclopedia of the Bible; Catholic Encyclopedia; Frizzell's review | Not held | C257. The sheet's table already marks the Kerygmata as Contested and the identity with Epiphanius's book as Disputed |
| Origen, *Philocalia* 23.22 | Not held | C256. ANF 8's introduction gives "Philocalia, cap. 22" and the *Commentary on Genesis* (231) |
| Bardaisan's death (222), *Book of the Laws of Countries* | Not held | ANF calls the source "De Fato, ascribed to Bardesanes, but really written by a scholar of his" (C249) |
| Rufinus c. 406-407; Syriac manuscript of 411 | Not held | C258 |
| M. R. James, *The Apocryphal New Testament* (1924), on the title "Ascents" | Not held for this page | We hold M. R. James's translation of the Epistula Apostolorum only |
| Clement of Alexandria's *Preaching of Peter* (distinguished from the Kerygmata) | Partly | We hold the *Stromata* (Wilson, ANF 2), where the *Preaching of Peter* fragments are quoted; not checked here because the sheet only says the two works differ |

## 6. Held texts the sheet could use

- **Homilies 3.20** (C234): "who has changed his forms and his names from the beginning of the world, and so reappeared again and again in the world". The sheet's "True Prophet since Adam" point, with a locus.
- **Recognitions 1.64**: "because ye will not acknowledge that the time for offering victims is now past, therefore the temple shall be destroyed". Stronger than 1.37 for the sheet's line 62.
- **Recognitions 1.72**: James to Peter, "be sure that you send me in writing every year an account of your sayings and doings". Supports "Peter reports to James, not the reverse" (line 46) inside Recognitions 1 itself.
- **Recognitions 1.73**: James "was still lame on one foot", and the retelling of the seven days "standing on the top of the steps". Confirms the survival and the steps.
- **Rufinus's preface** (C250) and **ANF note 595** on 1.69 ("framed to accord with the Catholic doctrine"): the held evidence for editorial softening, though on Christology rather than on Paul.
- **Eusebius 4.22.6**: Hegesippus's list of seven Jewish sects ("Essenes, Galileans, Hemerobaptists, Masbothæans, Samaritans, Sadducees, Pharisees"), to set beside Recognitions 1.54's sects when arguing the shared-tradition point.

## 7. Internal consistency inside the sheet

1. **What the Kerygmata are.** Line 34 lists "the Letter of Peter to James, and the oath called the *Contestatio*" as part of the Kerygmata; line 42 says Strecker started from those two documents and pulled out passages sharing their outlook. Line 95 says Strecker admits "there is no evidence for it outside the base novel". All consistent; just worth keeping together, since the prefatory letters are the only fixed point.
2. **"Two documents" vs "three prefatory letters."** Line 32 says three prefatory letters, line 42 two documents (Epistula Petri and Contestatio). The third is the Epistle of Clement, which the sheet doesn't count as Kerygmata. Rufinus says he left that letter out "because it is of later date" (C250).
3. **"Hegesippus (c. 180)"** (line 80) vs our cards' "c. 170" (`questions/essene-nazarene-origins.md:49`, `questions/sacrifice-culture-vegetarian-jesus.md:92`). Both fit Eusebius; pick one form across the repo if the sheet's material goes on a card.

## 8. Existing claims entries to add "Raised by" to

- **C56** (Recognitions 1.39): add "Christian Florez's Clementine kernels sheet (line 61)". The sheet uses 1.39 for baptism replacing sacrifice, which C56 covers. The safe-place claim on line 62 is a new entry (C242).

---

*Checked against held texts only. Where something is "not held", the sheet's claim may well be right; we can't confirm it from the repo.*
