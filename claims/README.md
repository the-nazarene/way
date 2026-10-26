# Claims

One list of every claim we have checked about what a source says, so each claim is checked once.

When someone sends us research, or one of our own files cites a passage, the citation goes here. Each entry has an ID, the passage, what was claimed, and what the held text actually says. A contributor's sheet, a card and a podcast note that all cite Irenaeus 1.26.2 share one entry. That entry's **Raised by:** line lists all of them.

**Before checking a claim, look here first:**

```
python scripts/claims.py find Irenaeus 1.26
python scripts/claims.py find "apostate from the law"
```

If there's an entry, use it. If not, check the claim against the held text, add an entry, and run `check`.

---

## What an entry looks like

```markdown
### C1 · Irenaeus, Against Heresies 1.26.2
**Claim:** The Ebionites use only Matthew's Gospel and reject Paul as "an apostate from the law".
**Result:** Matches
**Held text:** `christianity/Incoming/irenaeus-against-heresies-full-text.md` (Roberts and Rambaut, ANF 1)
**Text says:**
> They use the Gospel according to Matthew only, and repudiate the Apostle Paul, maintaining that he was an apostate from the law.
**Note:** Optional. Anything a reader needs, said plainly.
**Raised by:** Christian Florez's sheet (line 540); AUDIT-LIST A8
**Checked:** 2026-10-26, Claude (`audits/2026-10-26-fathers-added-checks.md`); person check: not yet
```

- **The heading** is the ID and the passage: the work and its section number, as the held edition numbers it. Use the next free ID from `python scripts/claims.py next`. IDs never change and are never reused.
- **Claim** is what was said about the passage, in the words of whoever raised it where they quoted it.
- **Result** is one of:

| Result | Meaning |
|---|---|
| Matches | The held text says it, in these words or a fair paraphrase |
| Matches, other translation | Same sense; the wording differs because a different translator was quoted |
| Matches, other section number | The words are there, but the held edition numbers the section differently |
| Reads differently | The held text says something narrower, broader, or different. The **Note** says how |
| Can't check | We hold the work, but not this passage in full (e.g. NPNF prints only a summary) |
| Not held | We don't hold the work. The claim stays at reference level until we do |

- **Text says** is the held text's own words, one or more lines starting `>`. Copy them exactly. `…` marks words left out. Footnote markers like `[830]` can be kept or left out.
- **Raised by** is everyone who made the claim: contributors, our own files (`path:line`), audit items.
- **Checked** is the date, who checked, and whether a person has confirmed it. Change `person check: not yet` to the person's name and date once they have read the passage themselves.

## Rules

1. **Only claims that a source can settle go here.** "Irenaeus says the Ebionites reject Paul" goes here. "The Ebionites were right about Paul" does not: that is a reading, and readings stay in the notes and cards.
2. **Describe, don't judge.** The result says what the text says. It doesn't say whether the person who raised the claim was careful, or what they meant.
3. **A "Reads differently" about our own research also goes on `AUDIT-LIST.md`.** The research file isn't changed until a person has checked, as with any audit item.
4. **`python scripts/claims.py check` must pass.** It confirms every line under **Text says:** really appears in the held file, so a quotation can't drift from its source. It runs on GitHub on every push that touches `claims/` or the held texts.

## Files

One file per work (or per author, for short works). `not-yet-held.md` holds claims about works we don't have yet. When one of those works is added, its entries move to that work's file and get checked.

`python scripts/claims.py stats` counts the entries by result.
