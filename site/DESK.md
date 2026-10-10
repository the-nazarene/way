# The Desk — a second mode for the Reading Room

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
   - `COPY DESK LINK` and open it in a new tab.
5. Then ask the open questions at the bottom of this file, and write their answers into this file so the next session starts from them.
6. When they are done, `git checkout main` to put the repo back where it was.

Keep the two rules below in any change you make, and do not merge this branch into `main` without its owner's say-so.

---

## What changed in files you wrote

Additive only, and each one comes out cleanly.

| File | Change |
|---|---|
| `site/build.py` | four filenames added to the list copied into `dist/`; one import; six lines at the end of `main()` that write `dist/desk.json` and print a summary |
| `site/src/index.html` | one `<a href="canvas.html">the desk</a>` in the existing nav; one `<script src="desk-door.js">` after `app.js` |

Nothing else of yours is touched. `app.js` and `styles.css` are unmodified, and none of your citation checks change: the build still fails on exactly what it failed on before. `desk.json` never fails the build. A verse reference in a card's prose that the KJV file does not contain just gets no desk card, and is listed in the build output so the prose can be checked. Today there are none.

**New files:** `site/src/canvas.html`, `site/src/canvas.css`, `site/src/canvas.js`, `site/src/desk-door.js`, `site/desk_links.py`, `site/tier-families.py`, and this file.

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
- **Frames.** A titled box. Anything inside belongs to it, membership is spatial and never stored, and dragging the title bar carries the contents. Nothing to keep in sync and nothing to corrupt.
- **String.** Drag from any pin head to another card to tie it. Click a string to cut it.
- **Notes.** Your own words, on the legal pad, visibly not a source and never stamped.
- **Tidy.** Puts everything loose back into the case-file arrangement. Framed cards stay where they are.
- **Keep it.** The desk saves to this browser and COPY DESK LINK gives a URL that rebuilds it exactly, for anyone. No account, no server, nothing stored anywhere but the link.
- **Click a card** to open the same reader pane, with the same verse text, the same highlighted phrase, the same stamp, and a link back to its case file. On the desk, the reader also carries the card's thread.
- Undo with Ctrl-Z, delete with Delete, select all with Ctrl-A.

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

The reference detector was checked against every scripture-shaped string in the cards' prose. It links every KJV reference, including cross-chapter ranges (`John 7:53-8:11`), half-verses (`6:51b`), same-book continuations (`Matthew 9:13; 12:7`) and your abbreviations (`1 Cor`, `Psalm`), and it correctly refuses `Didache 1:3`, `1 Enoch 48:3` and `4 Maccabees 8:9`.

---

## Open questions for you

1. **Does this belong on the site at all,** or is it a side door that dilutes "pull a card, read the answer"? It costs one nav link to find out and one line to remove.
2. **The reader pane is duplicated.** `canvas.js` carries its own copy so `app.js` stays untouched. If the desk stays, the two should become one shared module, and that is a change to your file.
3. **Mobile.** The desk tells a phone to use the Reading Room instead. That seems right for an infinite canvas, but it is a judgment call.
4. **Should a desk be shareable into the repo** as a saved layout, the way a card is? The share link already encodes one completely, so a `desks/` folder of JSON would need no new machinery.
5. **The door on your case file.** Is OPEN ON THE DESK the right word and the right spot? It sits on the folder-tab row, right-aligned. If you'd rather it lived in `app.js` with the rest of the case view, `desk-door.js` folds in as about six lines.
6. **`desk.json` in your build.** It is written from `site/desk_links.py`, a separate module, so `build.py` only grew an import and six lines. If you'd rather the verse index lived in `data.json`, say so. And if the desk doesn't stay, deleting those lines and the module is the whole removal.

**Not built, on purpose: asking Claude.** A question box on the desk, with answers drawn only from held sources and drawn on the desk as UNCHECKED cards that are visibly not sources. It needs a small server to keep an API key private (a Cloudflare Worker, like the one in front of jesusactuallysaid.com), and it is your README's phase 3, so it waits for you.
