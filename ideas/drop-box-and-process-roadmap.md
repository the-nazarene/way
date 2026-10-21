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

## Matt's idea (2026-10-21): the drop box's front door on the website

Keep Phase 1's Google Drive folder, and give it a front door on the website: a `#/drop` page in the Reading Room with a **Google Form** embedded, plus a "Contribute" link in the top bar. No code on our side. The form saves uploads into Drive and every response into a Sheet, which `/process-roadmap` reads as its log.

It's for the group, who mostly have Google accounts, so one form with the upload question is fine. A form with a file upload question makes everyone sign in, and that gives us their email for **Contributed by:** without asking.

**The form** (title "Contribute to The Way"):

| # | Question | Type | Required |
|---|---|---|---|
| 1 | What are you sending? | Multiple choice: A source · A suggestion · A correction · Other | Yes |
| 2 | Link | Short answer ("YouTube, article, or book page") | No |
| 3 | File | File upload (PDF, document, image; up to 10 files, 100 MB each) | No |
| 4 | Your message | Paragraph ("What is it, and why does it matter? For a correction, say which card or file.") | Yes |

Settings: **Collect email addresses** on; Responses → **Link to Sheets**. The upload folder Google creates can be moved into the Naz Dogs Drop Box, or become it. Corrections go straight onto `AUDIT-LIST.md` as Needs audit.

**Made by hand, about 3 minutes.** Claude can't do it through the API: Google's Forms API can't create file upload questions, and Matt's Google connection is the Nature Backs Workspace account, which shouldn't own a group form. Best owner: Rex's account, next to the Drive folder.

**To do**
1. Rex (or Matt) creates the form from the table and shares its link.
2. Claude builds the `#/drop` page with the form embedded, adds "Contribute" to the top bar, and opens a PR (about 15 minutes).

This replaces Phase 2 for the group. The Worker-and-R2 page only matters if we ever want strangers to send files without a Google account.

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
