# Drop box and `/process-roadmap` skill (plan, not built)

2026-10-21 · Rex · saved to build later. Roadmap P2 item 13.

A place where the Naz Dogs can drag and drop files for us (Markdown, PDFs, Word, Excel, audio, anything), and a skill that takes what they drop, logs it in `PROCESSING-ROADMAP.md`, and processes it. The skill grows over time: later it also checks the channels we follow for new uploads.

## Decision so far

**Start with a shared Google Drive folder.** Rex will have Claude check it now and then. A private upload page on nazareneway.com waits until we actually need one.

Why not a page on the site first: the Reading Room is static files on GitHub Pages, so it can't have a private page or take uploads. It would need a login gate, a small server piece and private storage. The repo is out too, because it's public and some drops will be copyrighted books.

## Phase 1: Google Drive drop box (no code)

- One folder, **Naz Dogs Drop Box**, shared as Editor with each person's Google account.
- Drive records who uploaded each file, so we get the `**Contributed by:**` name without asking.
- Optional: one subfolder per person, and a pinned `README` asking people to add a short note file if there's context ("from Dr. X's lecture", "chapter 3 is the important part").
- Claude reads it through the Google Drive connector (one-time sign-in). Downloads go to the git-ignored root `/Incoming/`, as the processing rules already say.

**To do when we pick this up**
1. Rex creates the folder and shares it with the group.
2. Tell Claude the folder name; sign in to the Google Drive connector.
3. Add the drop box to "How Rex and Matt use this" in `PROCESSING-ROADMAP.md`.
4. Write the draft skill (below).

## Phase 2, later: a private page on nazareneway.com

Only if the Drive folder stops being enough.

- **Cloudflare Access** in front of `nazareneway.com/drop`, with a list of allowed emails. People type their email and get a one-time code; no passwords.
- A drag-and-drop page that sends files to a small **Worker**, which stores them in a private **R2** bucket with the uploader's email and an optional note.
- A script pulls new files from the bucket into `/Incoming/`.
- Needs the domain's DNS on Cloudflare, and Matt's OK since it lives on nazareneway.com (same as `site/PROPOSAL-SECRET-LINKS.md`). Roughly a day of work.

The skill doesn't change between phases: both feed the same inbox step.

## The skill: `/process-roadmap` (draft name)

To live at `.claude/skills/process-roadmap/SKILL.md`. Each run:

1. **Pull new drops** from the inbox into `/Incoming/<date>-<contributor>/`, and keep a record of what's been pulled so nothing is processed twice.
2. **Check for duplicates** with `python scripts/processing-status.py --check`.
3. **Log every item** in the `PROCESSING-ROADMAP.md` inventory, with the contributor and the date.
4. **Convert everything to Markdown.** Copyrighted books are converted but kept out of the public repo (`CONTRIBUTING.md`).
5. **Check the channels we follow** for anything new since the last run, and log new uploads: Dr. Tabor's YouTube, The Jesus Way, Scott's Nazarene Way, David The Nazarene. The list grows as we add sources.
6. **Add next steps to Next Up**, put judgment calls in Decisions Waiting, and run `python scripts/processing-status.py` to refresh the status table.

Later, the `schedule` skill can run it on a timer (weekly, say), so the inbox is cleared and the channels checked without anyone asking.

## Open questions

- Who's on the share list for the Drive folder?
- Per-person subfolders, or one flat folder?
- How often should the skill run on its own, if at all?
