# The Desk — a second mode for the Reading Room

**Working on it?** Start with [`DESK-DEVELOPERS.md`](DESK-DEVELOPERS.md): how to run it, the code map, the rules, the tests, and a prompt to hand your AI assistant.

**Status: prototype, for review.** Built by Rex, October 2026. Nothing here is merged or deployed; it is a working page you can open and judge, rather than a proposal you have to imagine.

The Reading Room hands a reader one case at a time, laid out the way the card lays it out. The Desk is the same evidence on an open surface: pull sources from any case file, put them where you want, group them, tie your own string, keep the result. The case file argues. The desk lets someone else argue.

It reads the same `data.json`, reuses `styles.css`, and borrows the `.pincard`, `.stamp`, `.qcard` and reader-pane components whole, so a card looks identical on both pages by construction rather than by imitation.

---

## Open it

```
python site/build.py
cd site/dist && python -m http.server 8000
```

Then <http://localhost:8000/canvas.html>, or follow "the desk" in the Reading Room's nav.

---

## For an AI assistant asked to show this

If someone asks you to "show me the infinite canvas" or "the desk", this is it. It lives on the `desk-prototype` branch, not `main`.

1. `git fetch origin` then `git checkout desk-prototype`. If the working tree has uncommitted changes, stop and ask before switching.
2. `python site/build.py`. It should end with `wrote ...site/dist`. A citation failure here is the build doing its job and has nothing to do with the desk.
3. Serve it in the background: `python -m http.server 8000 --directory site/dist`.
4. Walk them through it one step at a time, waiting for each:
   - Open <http://localhost:8000/#/sacrifice-culture-vegetarian-jesus> (the Reading Room) and click **OPEN ON THE DESK →** beside the case's folder tab. The case lays itself out on the desk and opens in the left tray.
   - In the tray, drag a source or the case's question card onto the desk. Click **‹ ALL CASE FILES** and drag a whole case file out.
   - Click the question card on the desk: it opens the case hub. Click a verse, a NEXT IN THE DRAWER case, or a GO DEEPER file. Each lands beside the card it came from, tied by string. Click the new card and keep following the thread.
   - Drag a card under another and watch it lock. `+ FRAME`, then drag a card into it. Type `hosea 6:6` in the search box and press Enter.
   - Open <http://localhost:8000/canvas.html#desk=essenes-sacrifice-meat>, the prepared Essene desk. Walk its sections from ON THIS DESK at the top of the tray, then type `hosea` in the tray's search box and click the match.
   - Press **▶ PRESENT** (or P). Walk the sections with → and ←, click a card mid-show to read it, Esc to end. Then try <http://localhost:8000/canvas.html#desk=essenes-sacrifice-meat&present=3>, which opens straight into section 3.
   - `COPY DESK LINK` and open it in a new tab.
5. Then ask the open questions at the bottom of this file, and write their answers into this file so the next session starts from them.
6. When they are done, `git checkout main` to put the repo back where it was.

Keep the two rules below in any change you make, and do not merge this branch into `main` without its owner's say-so.

---

## What changed in files you wrote

Additive only, and each one comes out cleanly.

| File | Change |
|---|---|
| `site/build.py` | four filenames added to the list copied into `dist/`; one import; six lines at the end of `main()` that write `dist/desk.json` and print a summary; the `desk_links.build` call also passes your `resolve_pointer`, so a transcript moment on a desk is checked by your own pointer code, not a copy |
| `site/src/index.html` | one `<a href="canvas.html">the desk</a>` in the existing nav; one `<script src="desk-door.js">` after `app.js` |
| `CLAUDE.md` | one paragraph pointing assistants at the Desk's docs |
| `podcast-archive/the-jesus-way/` | episode 066 added (Kyle Cease, 2026-10-08); `TRANSCRIPT-STATUS.md` and `00-overview.md` updated to 66, with the three short unnumbered uploads noted |

**Research content (brief D, 2026-10-10)** is a separate kind of change, and it's yours to review on its merits: six sources appended to the sacrifice card and two to the Essene card, three upgraded to held with their wording corrected; a new heading on `questions/sacrifice-culture-vegetarian-jesus.md`; objection 8 and brief D in `questions/OBJECTIONS.md` and `site/data/objections.json`; corrected quotations in `christianity/the-essene-diet.md`, `christianity/nazarene-sect-predated-jesus.md` and `christianity/2026-02-25-essene-nazarene-ebionite-lineage.md`; rows in `VERIFIED-SOURCES.md`, `FIX-LIST.md` and `OPEN-RESEARCH.md`. Every quotation behind them is in `christianity/Incoming/witnesses-on-flesh-and-sacrifice-selected-texts.md`.

Nothing else of yours is touched. `app.js` and `styles.css` are unmodified, and none of your citation checks change: the build still fails on exactly what it failed on before. `desk.json` never fails the build. A verse reference in a card's prose that the KJV file does not contain just gets no desk card, and is listed in the build output so the prose can be checked. Today there are none.

**New files:** `site/src/canvas.html`, `site/src/canvas.css`, `site/src/canvas.js`, `site/src/desk-door.js`, `site/desk_links.py`, `site/data/desks/essenes-sacrifice-meat.json` and the five `jesus-way-06x.json` episode boards, `site/data/episodes/` (the checked breakdowns they're made from), `site/tier-families.py`, `site/tests/desk/` (browser tests, not part of the build), `site/DESK-DEVELOPERS.md`, the witnesses file, and this file.

---

## What it does

- **Open on the desk, from the Reading Room.** Every case file in the Reading Room gets an **OPEN ON THE DESK →** tab beside its folder tab. It lays that case out on the desk, below anything already there, and if a source was open in the reader, the desk opens it too. `desk-door.js` does this from outside `app.js`: it follows the hash, so it always points at the case being read. Phones don't get it, because the desk sends phones back to the Reading Room.
- **Browse a case in the tray, drag anything out.** Clicking a case file in the tray opens it there in miniature: the question, the finding (clamped, with a "read the whole finding" toggle), every source by side with its stamp, the verses it cites, the next cases in the drawer and its go-deeper files. Every piece of it can be dragged onto the desk and lands where it is dropped, snapping to its neighbours. Clicking still works. Dragging the question card, or a case row in the list, lays out the whole case under the pointer. A source pinned from an open case ties itself to that case's question if the question is on the desk. Pieces already on the desk show dimmed.
- **Follow the thread.** This is the Reading Room's link structure made physical. A card's links can come onto the desk as cards of their own:
  - **Verses.** Every scripture reference written in a card's prose ("Then read Matthew 5:24") is live in the reader. The build resolves each one against the held KJV (`site/desk_links.py`, 125 today), and only a resolved reference becomes a link. A verse card wears the pincard face and the HELD · KJV stamp, because the build found its text. Its own reader shows the passage in context, then **which sources quote it** and **which case files cite it**, so you can go both ways.
  - **Cases.** A question card on the desk now opens the case as a hub: the finding and the one-liners, with their verses live, then VERSES THIS CASE CITES, NEXT IN THE DRAWER and GO DEEPER. LAY OUT ITS SOURCES pulls the case under its question. If that space is taken, the question moves to clear space first and its strings follow, so a case never lands on top of cards already down.
  - **Go-deeper files.** These come onto the desk as manila index cards marked GO DEEPER · OUR NOTES IN THE REPO, with **no stamp**. They are the collection's own research, not sources, and should never look like one.
  - **Click** any link and it lands beside the card it came from, **tied by string**. **Drag** it and it lands where you drop it, still tied. Either way, one Ctrl-Z takes the card and its string off together. The path a reader took through the material stays on the board and travels with the desk link.
- **Pin one source.** The trays also group all 218 sources by family (below). Click one, or drag it out.
- **Search.** Type a subject and the matching held sources get pinned. Type a verse the cards cite (`hosea 6:6`) and its verse card comes. It retrieves; it never writes a source.
- **Move things.** Drag a card, box-select several and move them together, nudge with the arrow keys.
- **Snap.** Edges line up with their neighbours, and a card dropped above or below another locks to the same 22px gap the case board uses, so a column reads clean. Guides show while dragging. The SNAP button turns it off.
- **Frames (sections).** A titled box. Anything inside belongs to it; membership is spatial and never stored, so there is nothing to keep in sync. **Drag anywhere on the title bar** to move the section with everything in it, as one undo step. **Double-click the name** to rename it (Enter keeps it, Esc puts the old one back). A new frame opens its name for typing straight away. The corner handle resizes it.
- **String.** A card's pin is its connector, and it glows when you hover the card. **Drag from a pin** to another card: the card under the pointer lights up and the string snaps to its pin before you let go. Letting go on empty desk, or on two cards already tied, ties nothing and says so. **Click a string to select it** (it turns yellow, with an x at its middle); **Delete** or the x takes it off, Esc lets go, and nothing is cut by a stray click. String runs under the cards, so it never covers their text.
- **Notes.** Your own words, on the legal pad, visibly not a source and never stamped.
- **Tidy.** Puts everything loose back into the case-file arrangement. Framed cards stay where they are.
- **Keep it.** The desk saves to this browser and COPY DESK LINK gives a URL that rebuilds it exactly, for anyone. No account, no server, nothing stored anywhere but the link. Opening someone's link never touches your own desk: it opens as a separate view with a bar offering KEEP THIS AS MY DESK (it asks first if yours isn't empty) or BACK TO MY DESK. COPY JSON copies the same layout as raw data, which is the format a prepared desk is kept in.
- **Save to a file, open a file.** SAVE FILE (Ctrl-S) downloads the desk as a small `.json` named after the desk and the date; OPEN FILE (Ctrl-O), or dropping the file onto the desk, brings it back on any computer. Clearing the browser can't touch a file, so this is the dependable way to keep work. Opening a file uses the shared view, so it never overwrites your own desk. A bare COPY JSON layout opens too, and anything that isn't a desk is refused with a message. The longer-term answer, secret links on Cloudflare, is a proposal waiting on you: `site/PROPOSAL-SECRET-LINKS.md`.
- **The ? panel.** The **?** beside the zoom controls (or the ? key) opens a short reference: panning, zooming, cards, sections, string and keys. Esc, ? again, the ×, or a click elsewhere closes it, and it shows ⌘ on a Mac.
- **Prepared desks.** A whole argument laid out ahead of time and kept in the repo at `site/data/desks/<slug>.json`, listed at the top of the tray, and opened by a short link: `canvas.html#desk=<slug>`. The build checks every card, verse, file and string in it against the current build, and drops anything that no longer resolves with a warning. A prepared desk can never show a card the build cannot stand behind. COPY DESK LINK on an unchanged prepared desk gives the short link; once someone has moved things, it gives their whole layout.
  - **`essenes-sacrifice-meat`** is the first one: *Jesus, the Essenes, sacrifice and meat*: the strongest honest case, the counter-arguments it has to answer, and where our own side overreaches. Its old link, `#desk=essene-debate`, still opens it (a prepared desk can list old slugs under `formerly`). It covers the resolution, how to hold it (the three claims and their real strength, from `questions/nazarene-sect-sacrifice-and-diet.md`), then: where he came from, he opposed the sacrifices, the prophets he stood in, the movement after him, what they will say and the answer, DO NOT SAY, and GO DEEPER. That's 58 cards and notes in seven sections, with 27 strings, including the witnesses added for brief D (Romans 14:2, the Clementines, Clement on Matthew, Ancyra Canon 14, Philo, and Jerome as the one to handle with care). Every source on it is a verified card source; the notes are the repo's own analysis, marked NOTE · NOT A SOURCE.
- **Episode boards.** A podcast episode, broken into its topics and checked claim by claim. The five most recent Jesus Way episodes are done, 104 claims in all: `#desk=jesus-way-062` (kundalini and the Spirit), `063` (nine problems with Paul), `064` (spiritual warfare), `065` (salvation without blood) and `066` (outgrowing religion). Each claim is a row tied by string:
  - a **moment**, the speaker's exact words at their timestamp, stamped **POINTER · NOT PROOF**. Its reader shows the paragraph in context with the words marked, and a link to watch that second of the video. The build finds the words in the transcript itself; a moment it can't find is left off.
  - a **check**, a note whose colour and first line give the verdict: ✓ holds, ~ true in a narrower form, ✗ the sources say otherwise, ? scholars are divided, ◇ a reading of the text, • a story (labeled, not checked).
  - the **evidence**: KJV verses (any verse a board cites is resolved by the build), the repo's own card sources, and **outside sources**, a page's exact words and link, stamped **OUTSIDE · CHECKED BY HAND** and never HELD.
  - Each board closes with SAY IT CAREFULLY (things said on air that shouldn't be repeated as stated), QUESTIONS TO EXPLORE, and the case files it touches. The checks are fair both ways: they say where the hosts are right, where a reading is defensible, and where a critic's standard answer exists. How a board is made, and the prompt that makes one, are in `site/DESK-DEVELOPERS.md` and `site/data/episodes/README.md`.
- **Search the trays.** A box at the top of the tray filters prepared desks, case files (by question, call number and every alias), sources by family (opening the families that match), and the case file open in the tray. Above them, ON THIS DESK lists the desk's sections (frames) in reading order when nothing is typed, and every matching card when something is. Clicking one takes the view there: a section fills the view, and a card comes to the centre at a readable size with a brief highlight. Enter goes to the first match and Escape clears.
- **Present mode.** **▶ PRESENT** on the toolbar (or P) turns any desk into a walkthrough. Slide one is an overview of the whole board; then each frame is a slide, in reading order. The camera glides between sections instead of cutting. The section on screen stays lit, and the rest of the board and its string dims. → ← Space and Page Up/Down move, Home and End jump to either end, number keys jump to a section, F toggles full screen, and Esc ends the show and puts the view back where it was. A bottom bar has ‹ ›, a dot per slide, OVERVIEW, COPY LINK, FULL SCREEN and EXIT, and it fades when the pointer rests. Clicking a card opens its reader over the show, and clicking a section title on the overview goes to it. Nothing can be moved, deleted or edited by accident while presenting. A link ending `&present=n` opens straight into slide n, and COPY LINK makes one. Prepared desks get **▶ PRESENT IT** in the tray, and every section in ON THIS DESK has a ▶ to present from there. A desk with no frames presents its overview and explains that frames become slides.
- **Phones read a desk as a list.** On a screen 820px wide or less, a desk opens as a scrolling list instead of the surface: the sections in reading order with a jump list at the top, every card and note in its section (down each column, then the next), notes as plain text, and every string shown under its card as TIED TO, which scrolls to the other end. Tap a card to read it; links in the reader open the next thing instead of pinning it. ▶ PRESENT works, and **OPEN AS A DESK** gives the real surface with only FIT and PRESENT on the toolbar, a touch hint and **BACK TO THE LIST**. An empty desk offers the prepared desks. Wide screens never see the list, and a window narrowed past 820px switches to it and back.
- **Click a card** to open the same reader pane, with the same verse text, the same highlighted phrase, the same stamp, and a link back to its case file. On the desk, the reader also carries the card's thread.
- **Undo and redo:** Ctrl-Z, and Ctrl-Y or Ctrl-Shift-Z, 60 steps deep. Clicking a card to read it doesn't cost the redo history. Delete removes the selection, Ctrl-A selects everything, arrow keys nudge, and box-select then drag moves a group together.

---

## The two rules it keeps

**1. Nothing on the desk is generated.** The search box is retrieval over the sources `build.py` already verified. The thread obeys the same rule: a verse card exists only because the build found that verse in the held KJV, a go-deeper card only because the file is in the repo, and the links between them are read off the cards' own text, never inferred. A card arrives carrying the stamp it was built with and the note the card wrote. There is no model in this page, no API key, and nothing to leak. The seam for a future grounded answer is where you already planned it in `site/README.md` phase 3 — and if that ever lands, a generated card should be drawn as something that obviously is not a pinned source, or the stamp stops meaning anything.

**2. Families are derived, never hand-assigned.** `familyOf()` in `canvas.js` is a pure function from the tier string to one of thirteen families. Add a card and it files itself. There is no list to maintain and nothing to forget.

---

## The finding worth having either way

`tier` is doing two jobs. It names the kind of source, and it annotates that particular use of it. Both are worth keeping, but mixing them has a cost:

```
218 sources   120 distinct tier strings   13 families
```

Most tier strings occur exactly once. Anything that groups or filters by `tier` gets a hundred near-empty buckets, which is why the trays group by family instead.

`site/tier-families.py` prints what every existing tier maps to, so the grouping can be argued with before anything depends on it:

```
python site/tier-families.py            # the full report
python site/tier-families.py --check    # exit 1 if anything is unfiled
```

Current shape:

| Family | Sources | Distinct tiers |
|---|---|---|
| RED TEXT | 92 | 32 |
| THOMAS | 21 | 14 |
| EARLY CHURCH | 21 | 15 |
| PAUL | 16 | 5 |
| THE ARGUMENT | 14 | 14 |
| JOHN | 12 | 10 |
| DEAD SEA SCROLLS | 8 | 3 |
| JERUSALEM CHURCH | 8 | 6 |
| HEBREW BIBLE | 8 | 4 |
| THE MANUSCRIPTS | 7 | 7 |
| ACTS | 4 | 4 |
| SCHOLARSHIP | 4 | 3 |
| ETHIOPIAN CANON | 3 | 3 |

The sub-label is kept, not discarded. "red text · earliest gospel · Mark's aside" is RED TEXT with "earliest gospel · Mark's aside" intact, because that annotation is often the most interesting thing on the card.

THE ARGUMENT is the catch-all, and it earns its place: the charges, the controls, the concessions, the demoted cards. Those genuinely are not source types. If a better home exists for any of them, the report is where to see them all at once.

**If this grouping is right,** `family_of` moves into `build.py` and writes a `family` field beside `tier`. The Reading Room could then colour and filter by it. Until then, `canvas.js` and `tier-families.py` each carry a copy of the table and have to be kept in step — that duplication is a reason to adopt it, not a reason to like it.

---

## What was checked

A browser harness drives the real page in a real viewport: 39 assertions covering layout, snapping, frames, string, search, the share link, the reader, and a 390px phone. It found four genuine bugs, all fixed:

- **Column spacing was 2px out on every card.** `document.fonts.ready` resolved before the Google Fonts stylesheet had registered any face, so it promised nothing, and every card measured 2px taller than it ended up. The gate now waits for the sheet and then asks for the three faces by name, with a 3s fallback and a late-arrival reflow.
- **String could not be tied by dragging a pin.** A captured pointer retargets every event to the capturing element, so the drop target has to be found by coordinate, not by `event.target`.
- **Cards leaned twice.** `--tilt` inherits, so `.pincard` was rotating on top of `.node`.
- **Frames were invisible and ungrabbable** behind the cards. They now draw above, outline-only, with no fill and no pointer events, so they bound the evidence without covering it.

Two more were my test being wrong rather than the page: the question-card offset and framed cards are both meant to sit outside the tidied columns.

**The door, the tray and the thread** have a second harness of their own: 64 assertions, in a fresh browser profile per scenario so saved desks cannot leak between them. It covers the door's link, placement and hiding; arrival, including arriving twice; carrying from the tray, from a case row and out of the reader, and letting go off the desk; landing under the pointer; verse, case and go-deeper cards with their strings; one undo removing a card and its string; the case hub and LAY OUT ITS SOURCES; verse search; the share link carrying the new cards; a stale verse in an old link being dropped rather than drawn blank; phone and tablet widths; and zero console errors. The original 39 still pass. It found two genuine problems, both fixed:

- **The sources in an open case were out of reach.** A long finding pushed them below the window, so the most useful part of the tray needed scrolling before it could be used. The finding is now clamped to five lines with a toggle.
- **A case could be laid out on top of cards already down.** Laying out a question that had arrived beside another case put its columns wherever that left them. Every layout now checks that the space is clear, and moves somewhere clear when it isn't.

**Sharing, prepared desks and search** have two more: 25 assertions on shared links (your own desk survives opening, editing and reloading one; keep, decline, back, a link pasted into an open tab, the Back button, a broken link) and 24 on the prepared Essene desk and the tray search (every card, frame and string arrives; no two cards or sections overlap; the short link and the whole-layout link; an unknown desk name; sections in reading order; jumping to a section and to a card; filtering every tray; Enter and Escape). **Editing a laid-out desk** has its own harness: 38 assertions. It covers moving a long-titled section by its name (with its contents and nothing else), renaming by double-click with Enter and Esc, tying with the live target and pin snap, refusing duplicate and empty-desk ties, hover, selecting and deleting string by key and by its x, undo and redo through all of it, redo surviving a click on a card, group moves by box-select, naming a new frame, and present mode keeping it all locked. It caught a real bug: on a section with a long name, the title bar was nearly all editable text, so it could not be grabbed to move the section. **Desk files** (21 assertions) save a desk, clear the browser completely, and open the file back with every card, string and section; they also cover keeping it, refusing non-desk files, and dropping a file onto the desk. **The ? panel** has 16. **Present mode** has its own harness: 44 assertions. They cover starting and ending, every key and button, the glide, the spotlight on cards, frames and string, the dots, clicking a section title and a card mid-show, that nothing can be dragged, deleted, undone or typed into, the view restored on exit, present links, the tray buttons, desks with no frames or nothing on them, a 1024×700 window, and that the caption and bar sit clear of the lit board on every slide. That last check exists because the first version let a two-line subtitle sit on the header cards. Building the debate desk also turned up a bug from the first round, now fixed: frame titles were cut short, because the title box was sized in characters without its letter-spacing.

**Episode boards** were checked three times. First, the research: a separate pass per episode that read the whole transcript and opened every page it cites. Second, `site/tests/desk/check-episode.py`, which confirms every quoted phrase sits in one transcript paragraph with the right timestamp, every verse is in the KJV, every card source exists, and every outside quote is on its page. It downloads the pages to check. Then I read every verdict by hand. That pass changed eight checks: a Josephus sentence the repo's own card flags as unreliable, two numbers from a page nobody had opened, a "not in the Transjordan" that was unfair to the hosts (Epiphanius does put related groups there), a fact-check marked as holding that also carried a speculative reading, two small dates, and an ambiguous "Thomas". Third, the build re-resolves every moment, verse and card on the boards. The `episodes` suite (69 assertions) covers all five boards: every card shown, none overlapping, moments stamped as pointers, the readers and their links, search by what was said, keeping a board, and an invented moment in a shared link being dropped. It caught one real bug: a card id containing a quotation mark broke the Desk's lookups.

The reference detector was checked against every scripture-shaped string in the cards' prose. It links every KJV reference, including cross-chapter ranges (`John 7:53-8:11`), half-verses (`6:51b`), same-book continuations (`Matthew 9:13; 12:7`) and your abbreviations (`1 Cor`, `Psalm`), and it correctly refuses `Didache 1:3`, `1 Enoch 48:3` and `4 Maccabees 8:9`.

---

## Open questions for you

1. **Does this belong on the site at all,** or is it a side door that dilutes "pull a card, read the answer"? It costs one nav link to find out and one line to remove.
2. **The reader pane is duplicated.** `canvas.js` carries its own copy so `app.js` stays untouched. If the desk stays, the two should become one shared module, and that is a change to your file.
3. **Episode boards fact-check someone else's show.** The Jesus Way is Aaron Abke and James Benefico's podcast, not ours. The boards are careful and fair, and they credit what holds, but publishing corrections to their episodes is a public act. Before these are linked anywhere, decide whether they go live at all, whether to tell Aaron and James first (they might want to answer, or use them), and whether the SAY IT CAREFULLY sections are worded as you would want them read.
4. **Mobile.** Phones now read a desk as a list (see above), with the real desk one tap away. The Reading Room's OPEN ON THE DESK tab is still hidden on phones; it could be shown now that the desk reads well there. Your call.
5. **Prepared desks are in the repo now** (`site/data/desks/`), validated by the build like cards. Is that the right home, and who gets to add one? A desk is an argument with the stamps attached, so it probably wants the same review a card gets.
6. **The door on your case file.** Is OPEN ON THE DESK the right word and the right spot? It sits on the folder-tab row, right-aligned. If you'd rather it lived in `app.js` with the rest of the case view, `desk-door.js` folds in as about six lines.
7. **`desk.json` in your build.** It is written from `site/desk_links.py`, a separate module, so `build.py` only grew an import and six lines. If you'd rather the verse index lived in `data.json`, say so. And if the desk doesn't stay, deleting those lines and the module is the whole removal.

**Links copied on `localhost` only work on that machine.** They work for anyone once the desk is served from nazareneway.com, and so does `nazareneway.com/canvas.html#desk=essenes-sacrifice-meat`.

**Not built, on purpose: asking Claude.** A question box on the desk, with answers drawn only from held sources and drawn on the desk as UNCHECKED cards that are visibly not sources. It needs a small server to keep an API key private (a Cloudflare Worker, like the one in front of jesusactuallysaid.com), and it is your README's phase 3, so it waits for you.
