---
name: nazbrain
description: Save research into the repo's inbox/ folder and push it, so it gets processed into the research later. Two kinds of input. A conversation worth keeping becomes a Markdown note on what it found. Documents someone hands over (PDF, Word, text, slides, spreadsheets, web pages, photos of pages) get converted to Markdown on the spot, with who they came from. Use when someone types /nazbrain, or says "save this to the brain", "save this to the inbox", "add these files", "process these documents", "send this to the Naz Dogs".
---

# /nazbrain: save it to the inbox

Anyone working in this repo in Claude Code can hand you two kinds of thing:

- **A conversation worth keeping.** Write up what it found as a note (section A).
- **Documents.** PDFs, Word files, text, slides, spreadsheets, web pages, photos of book pages. Convert each to Markdown right there and save it (section B).

Both go into `inbox/` at the repo root, get committed and get pushed (section C). Someone processes the inbox into the research later (`inbox/README.md`, `PROCESSING-ROADMAP.md`).

If they ran `/nazbrain` with files attached or file paths named, it's B. With nothing attached, it's A. If they did both, do both. If you can't tell, ask.

**Why an inbox and not the research files:** the research only takes what has been checked against sources. A new note or document hasn't been checked yet. The inbox holds it, clearly labelled, until someone does. **The repo is public**, so everything in the inbox is public too. That's why the labels matter, and why copyrighted books don't go in whole (B3).

## Who is saving it

Everything needs the contributor's real name: it becomes the `**Contributed by:**` line. If the person hasn't said who they are in this conversation, ask once: "What name should go on this?" Don't guess it from a git username or an email address. For documents, also ask where each one came from, if they haven't said: who wrote it, where they got it. Thirty seconds now saves an hour later, and sometimes the trail can't be recovered at all (`CONTRIBUTING.md`).

## A. A conversation

Write from the conversation itself. Keep what the thread actually found, not a transcript of it. If the person says what to focus on ("just the part about Acts 15"), save only that.

File name: `YYYY-MM-DD-<first-name>-<topic-in-a-few-words>.md`, lowercase, hyphens, today's date. Example: `2026-11-18-rex-ebionites-and-the-sabbath.md`.

```markdown
# <Topic, in plain words>

**Contributed by:** <Name>, <YYYY-MM-DD>
**From:** A conversation with Claude (<Claude Code / claude.ai / desktop app>)
**Status:** Unprocessed. Conversation notes, not yet checked against sources.

## What we were looking into
One or two sentences: the question that started the thread.

## What we found
Each finding as its own bullet, with the source it rests on, said exactly:
- the finding, then the source (work, section, translator if it was named).
- Mark which ones were quoted from a file in the repo (give the path) and which came from memory, the web, or someone's say-so. Memory and say-so get **(unchecked)**.

## Open questions
What the thread raised but didn't settle.

## Sources mentioned
Books, videos, links, people. Include URLs and timestamps where the conversation had them.

## Where it might fit
Optional: which repo files or question cards this could add to, if it's clear. Suggestions only.
```

One note per save. If the thread covered two unrelated things, ask whether they want two notes.

## B. Documents

### B1. Check it isn't already here

Before converting, search the repo for the title and author (and run `python scripts/processing-status.py --check <url>` for any links). If it's already held, say where and skip it. The person may still want a note on why it matters (section A).

### B2. Convert to Markdown

Convert each document faithfully: the full text, in order, with its headings, chapter and page or section numbers, footnotes, and tables as Markdown tables. Don't summarize and don't tidy the wording. A converted text gets quoted later, so it has to say exactly what the original says.

- **PDF:** read it with the Read tool (20 pages a call for long ones), or a local tool if there is one (`pdftotext`, Python's `pymupdf`). A scan with no text layer: read the page images, and say in the header that the text was read from scans.
- **Word, slides, spreadsheets:** `pandoc` if installed, otherwise Python (`python-docx`, `python-pptx`, `openpyxl`). Old `.doc` files: ask them to save as `.docx` or PDF.
- **Web pages:** fetch the page and keep the main text. Record the URL and today's date.
- **Photos of pages:** transcribe them. Mark anything you can't read as `[illegible]` rather than guessing.
- **Audio and video:** don't. Ask them for the link, which goes through the transcript pipeline instead (`PROCESSING-ROADMAP.md`).

Then **spot-check**: compare three passages from the start, middle and end against the original, and check the page or chapter count matches. Note in the header that you did.

File name: `YYYY-MM-DD-<first-name>-<short-title>.md`, as in A. One Markdown file per document.

Header, the repo's standard source block (`CONTRIBUTING.md`):

```markdown
# <Title of the work>

**Attribution:** <Author, and what's known about the attribution>
**Translation:** <Translator, edition, publisher, year, if it's a translation>
**Source:** <Where this copy came from: URL, book edition, "PDF from <person>">
**Contributed by:** <Name>, <YYYY-MM-DD>
**Rights:** <Public domain / the contributor's own work / shared with permission / in copyright: notes only>
**Status:** Unprocessed. Converted from <format> by Claude on <date>; spot-checked against the original at <three places>. Not yet checked against other sources.
**Note:** <What it is and why the person thinks it matters, in their words if they gave any>
```

### B3. Public or not?

The repo is public. Decide for each document before saving:

- **Can go in full:** public-domain texts (author died long ago, or a pre-1929 edition), the contributor's own work, and anything the rights-holder has said can be shared. Save the full conversion to `inbox/`.
- **In copyright and not theirs** (books, paywalled papers, other people's courses): **don't push the full text.** Save to `inbox/` a note on it instead: the full header, the table of contents, a summary of each chapter, the key claims with page numbers, and short quotes only (a sentence or two each). Then tell the person to drop the original file in the NazBrain Google Drive folder, so Rex can hold it privately: https://drive.google.com/drive/folders/1Sy3GTWLM2kpX6zLLdJyXovxd6JpDWHig
- **Not sure:** treat it as in copyright, and say so in the header.

**Nothing private** either way: no phone numbers, emails or anything shared in confidence.

## Rules for everything saved

- **Don't make anything sound more checked than it was.** If a source wasn't opened, say so. The repo has already caught wrong citations this way (`questions/CITATION-NOTES.md`).
- **Describe sources, don't judge them.** Contributors read what ends up in the repo.
- Never put anything anywhere but `inbox/`, and never edit research files from this skill.

## C. Save and push

1. `git pull --rebase --autostash` first (the autostash keeps any unsaved work safe), so the push doesn't collide with someone else's.
2. Write the file(s) to `inbox/`.
3. Commit **only those files**, with a message like `nazbrain: <topic or titles> (<Name>)`. Leave any other changes in the working tree alone.
4. Push. If the session works on its own branch (Claude Code on the web and phone does), push that branch and open a pull request into `main` titled the same as the commit.
5. If the push is refused (no write access, no network), say so plainly and leave the files committed locally. Rex can add them as a collaborator on `the-nazarene/way`.

## Tell them

A few lines: what was saved and under what file names, that it's pushed (or the pull request link), anything kept out of the repo for copyright and where the original should go, and how many findings are marked unchecked. Nothing else needs doing on their end.
