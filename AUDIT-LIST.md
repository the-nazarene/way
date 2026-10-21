# Audit List

**Claims, found during processing, that something in our own research may be wrong.** Nothing here has been changed in the research files. Each item needs someone to check the sources and record them before anything is fixed.

This sits one step before `FIX-LIST.md`:

1. **A processing run reports a possible problem.** For example, a note-writer or an audit finds a quotation that doesn't match the text we hold. It goes on this list as **Needs audit**.
2. **A person checks it** against the sources, and writes down exactly which sources and passages they looked at.
3. **It holds up:** the item moves to `FIX-LIST.md` as a FIX or NARROW, with the sources attached, and this entry is marked **Confirmed**.
4. **It doesn't hold up:** it's marked **Closed: not a problem**, with the reason, so nobody re-raises it.

**Status key**

| Status | Meaning |
|---|---|
| **Needs audit** | Reported, not yet checked by a person |
| **Evidence in hand** | The report quotes held texts that seem to settle it; a person still needs to read them and agree |
| **Needs a source we don't hold** | Can't be settled from inside the repo |
| **Confirmed** | Checked by a person; moved to `FIX-LIST.md` |
| **Closed: not a problem** | Checked; the research file was right |

**Each item is worked out in full, side by side, in `audits/AUDIT-WORKSHEET.md`** (all 15 as of 2026-10-21), with an Input section for comments.

Where each finding came from: **Panarion audit** = `audits/2026-10-20-panarion-quotations.md` (every Panarion quotation in the repo checked against Craig Wescoe's translation and Holl's Greek). **Shabbat proposals** = `audits/2026-10-20-shabbat-integration-proposals.md`. Both are drafts; nothing in them has been applied.

---

## Open items

| # | Claim to check | Where in the repo | Evidence so far | To confirm | Status | Raised |
|---|---|---|---|---|---|---|
| A1 | The Ebionite sacrifice saying is quoted as "the wrath **of God** will not cease from you" and labelled the Hebrew Gospel of Matthew. The held text (Panarion 30,16,5, trans. Wescoe) reads "the wrath will not cease from you," and Holl's Greek has ἡ ὀργή with no "of God." The saying belongs to the Ebionites' gospel, which Epiphanius calls "falsified and mutilated" (30,13,2) | `christianity/hebrew-gospel-of-matthew.md` (lines 5, 32), `blood-atonement-logical-incoherence.md:88`, `blood-magic-origins-saturn-sacrifice.md:149`, `prophetic-tradition-against-sacrifice.md:88` | Held text and Greek, quoted in the Panarion audit §2.1. Line 5 of the Hebrew Matthew file also credits "the Clementine writings," which don't contain the saying | Read 30,16,5 in Craig's text and the Greek; find where "of God" came from (likely M. R. James 1924 or Frank Williams); decide which wording and translator to cite | Evidence in hand | Panarion audit F1; Shabbat proposals P1 |
| A2 | The altered Passover saying is quoted with "Passover **lamb**." The Greek has κρέας ("meat"), and Epiphanius says the Ebionites added "not" and wrote in "meat" (30,22,4-5) | 6 places in 5 files (the worksheet found 4 more than the audit, including `vegetarian-connection-across-traditions.md:48-49` and `questions/OBJECTIONS.md:21`); see the worksheet | Panarion audit §2.2; worksheet A2 | Read 30,22,4-5 in Craig's text and the Greek | Evidence in hand | Panarion audit F2 |
| A3 | A sentence about the **Nasaraeans** (Panarion 18, a pre-Christian sect) is used as evidence about the **Nazarenes** (Sect 29), including on diet. Sect 29 says nothing about Nazarene diet | 7 places: `biblical-case-for-vegetarian-jesus.md:154`, `good-shepherd-thuo-reversal.md:93`, `questions/sacrifice-culture-vegetarian-jesus.md:37`, `nazarene-sect-predated-jesus.md:27-30`, `questions/essene-nazarene-origins.md:57`, `site/data/cards/sacrifice-culture-vegetarian-jesus.json:42`, `2026-02-25-essene-nazarene-ebionite-lineage.md:84` | Panarion audit §2.3. Worksheet second check: only 4 of the 7 places name the wrong group; the other 3 name the Nasaraeans correctly and only need the held wording | Read Sects 18 and 29 in full; check whether any other ancient source ties Nazarenes to vegetarianism; rewrite with the right group named | Evidence in hand | Panarion audit F3 |
| A4 | "Moses received a different law" is attributed to the Nazarenes; the held text says it of the Nasaraeans (18,1,3) | `moses-scroll-deuteronomy-without-sacrifice.md:183`, `old-testament-through-jesus-lens.md:250` | Panarion audit §2.3 | Read 18,1,3 | Evidence in hand | Panarion audit F4 |
| A5 | "Berea near Pella" merges two places. Epiphanius names Beroea in Coele Syria, the Pella district in the Decapolis, and Kokabe in Bashanitis (29,7,7). The Greek of that passage dates the sect's beginning to *after* the move to Pella, which cuts against `nazarene-sect-predated-jesus.md` using it as proof of pre-dating | `flight-to-pella-golden-thread.md:19`, `questions/essene-nazarene-origins.md:53, 90, 95`, `biblical-case-for-vegetarian-jesus.md:186`, `nazarene-sect-predated-jesus.md:61-62`, `site/data/cards/essene-nazarene-origins.json:40` | Panarion audit §2.4, with the Greek (ἡ ἀρχὴ γέγονε μετά…) | Read 29,7,7-8 in Craig's text and Holl; check a map source for Beroea; decide how the pre-dating argument changes | Evidence in hand | Panarion audit F5 |
| A6 | A quotation in the Essene diet file ("The disciples abstain from meat… unlawful to eat meat for it was not ordained by God") can't be found in the Panarion. It's cited as 29.7.5, which is about law and sabbath | `christianity/the-essene-diet.md:46` and its Sources line (393) | Panarion audit §2.10. Worksheet traced it to a slide read aloud in The Jesus Way episode 019 [44:56] | Search the full held text and Williams if available; trace where the line came from | Needs audit | Panarion audit F7 |
| A7 | "The Nazarene sect was before Christ" is labelled **Fabricated**. The sentence is real: "the sect of the Nasaraeans existed before Christ and did not know Christ" (29,6,1). But it's about the Nasaraeans, said to deny they were the Nazarenes, so the claim is a misreading, not an invention. "All Christians were once called Nazarenes" is 29,1,3 | `questions/nazarene-sect-sacrifice-and-diet.md:228`, `2026-02-25-essene-nazarene-ebionite-lineage.md:52-58`, `questions/MINING-2026-10-debates.md:40`, `site/data/desks/naz-sect-debate-prep.json:820` | Held text 29,6,1 and 29,1,3 (checked by Claude 2026-10-20) | Read 29,1,3 and 29,6,1 in context; agree on new verdict wording ("real sentence, misapplied") | Evidence in hand | Panarion audit F8 |
| A8 | Paul as "apostate from the law" and "false prophet" is credited to Epiphanius, and to the Nazarenes. The phrase is Irenaeus (*Against Heresies* 1.26.2). Epiphanius's Ebionite charge is the priest's-daughter story (30,16,8-9), and no Nazarene rejection of Paul appears in Sect 29 | `christianity/paul-false-prophet-deuteronomy-18-test.md:86`, `questions/pauls-legitimacy.md:43` | Panarion audit §2.10 | Worksheet second check: "apostate from the law" is also in Eusebius, *Church History* 3.27.4, so the file is right to name Eusebius and wrong only to name Epiphanius. Check Irenaeus 1.26.2 and Eusebius 3.27 (neither held) | Needs a source we don't hold (Irenaeus, Eusebius) | Panarion audit F9 |
| A9 | Panarion citations for James: the priestly plate is 29,4,4 and 78,14,1. James as first bishop is 29,3,8-9 (already corrected in our *Jesus' Words Only* notes) | `christianity/james-the-just-key-to-understanding-jesus.md:28` | Panarion audit §2.7; Sect 78 couldn't be checked against Greek (not in the First1KGreek corpus) | Read 29,4,4 and 78,14,1 in Craig's text; find a Greek source for Sect 78 | Evidence in hand (Greek for Sect 78 still needed) | Panarion audit F10 |
| A10 | `clementine-literature-nazarene-writings.md` says Epiphanius treated the Clementines as reliable. He says the Ebionites' *Travels of Peter* falsify their contents (30,15,1-2) and calls their claim about Peter's diet a lie | `christianity/clementine-literature-nazarene-writings.md:13, 76` | Panarion audit F11 | Read 30,15,1-3 | Evidence in hand | Panarion audit F11 |
| A11 | Other reference-level fixes: Ebionite and Nazarene views on Jesus's birth (30,2,2; 30,16,3-4; 29,7,6); diet sources in `flight-to-pella`; "three incompatible etymologies"; the 30,15,4 exchange (the reported answer differs); John the Baptist's food (30,13,4-5 is held); `fasting-removed-from-bible.md:40`; outdated "Epiphanius not held" lines; source lists citing the Williams translation for wording that isn't his | Several files; see Panarion audit F11 for the full list | Panarion audit F11 | Work through F11 line by line | Needs audit | Panarion audit F11 |
| A12 | `VERIFIED-SOURCES.md` lists the Panarion as "Held; not yet audited." After this audit it could say "Audited 2026-10-20 against Holl's Greek for Sects 18, 19, 29, 30," with the warning that Sects 18 and 29 are different groups | `VERIFIED-SOURCES.md` | Panarion audit F13 | Agree once A1-A11 are settled | Needs audit | Panarion audit F13 |
| A13 | Isaiah 56:7 is quoted cut short in five files. The omitted first half says burnt offerings "shall be accepted upon mine altar," the opposite of how we use the verse | Five files (listed in Shabbat proposals P6; also `ROADMAP.md` item 6) | Full verse in the held KJV (`christianity/Incoming/kjv/23-isaiah.md`) | Read the full verse; agree on the honest wording; shift weight to Jeremiah 7:11 and 7:22 | Evidence in hand | Shabbat proposals P6; ROADMAP 6 |
| A14 | Overstatements in our sacrifice file that the Shabbat Studies claims-to-check exposed: Psalm 51:18-19 and Hebrews 10:5-6 run the other way; Isaiah 66:3 has an alternative rendering; Matthew 12:7's "guiltless" refers to the disciples; "direct, unequivocal condemnations" is too strong | `christianity/prophetic-tradition-against-sacrifice.md` | Held KJV verses (Shabbat proposals P7) | Read each verse in the KJV; agree on narrowed wording | Evidence in hand | Shabbat proposals P7 |
| A15 | Snyder's *Nazarene Acts* (and readings from it, e.g. David The Nazarene's NazActs videos) alters Recognitions 1.39 (adds "which is Y'shua"), 1.69 ("in the name of Yeshua" where Smith has "the threefold blessedness"; found 2026-10-20 in David's baptism video), 10.71 (Shechinah for Holy Spirit) and 10.72 ("Shabbat" for "Lord's day"). The repo should warn against quoting it | Proposed new entry in `questions/CITATION-NOTES.md` | Side-by-side comparison with Smith's held text, in `extended-library/nazarene-acts-snyder-notes.md` | Read Smith's 1.39, 1.69 and 10.71-72 against Snyder's local copy | Evidence in hand | Shabbat proposals P2 |

---

## Closed

*None yet.*

---

## Adding to this list

When a processing run, a note-writer or an audit says our research is wrong somewhere:
1. **Add a row:** the claim, the exact files and lines, the evidence so far with its source, what would confirm it, and where the finding came from.
2. **Don't change the research file yet.**
3. **When someone checks it,** write which sources and passages they read, then move it to `FIX-LIST.md` or close it here.
