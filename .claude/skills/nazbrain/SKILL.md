---
name: nazbrain
description: Save what the current conversation found into NazBrain (the shared Google Drive folder), as a Markdown note with who it came from, so it gets processed into the repo later. Use when someone types /nazbrain, or says "save this to the brain", "drop this in the drop box", "send this to the Naz Dogs".
---

# /nazbrain: save this thread to the drop box

Someone has had a conversation worth keeping. Write it up as one Markdown note and put it in **NazBrain**, the shared Google Drive folder the group drops material into: https://drive.google.com/drive/folders/1Sy3GTWLM2kpX6zLLdJyXovxd6JpDWHig (folder ID `1Sy3GTWLM2kpX6zLLdJyXovxd6JpDWHig`). It gets processed into the repo later (`PROCESSING-ROADMAP.md`, and `ideas/drop-box-and-process-roadmap.md` for the plan).

**Why the drop box and not the repo:** the repo is public, and it only takes research that has been checked against sources. A conversation's findings haven't been checked yet. The drop box is private, and nothing in it changes the research until someone processes it.

## 1. Who is saving it

The note needs the contributor's real name (it becomes the `**Contributed by:**` line when the note is processed). If the person hasn't said who they are in this conversation, ask once: "What name should go on this?" Don't guess it from a git username or an email address.

## 2. Write the note

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

Rules for the note:
- **Don't make a claim sound more checked than it was.** If the conversation didn't open the source, say so. The repo has already caught wrong citations this way (`questions/CITATION-NOTES.md`).
- **Describe sources, don't judge them.** Contributors read what ends up in the repo.
- **Short quotes only** from copyrighted books; cite the rest.
- One note per save. If the thread covered two unrelated things, ask whether they want two notes.

## 3. Put it in the drop box

Try these in order and use the first that works:

1. **The Google Drive connector.** If the Google Drive `create_file` tool is available, upload the note with `parentId` `1Sy3GTWLM2kpX6zLLdJyXovxd6JpDWHig`, `contentMimeType` `text/markdown`, the note as `textContent`, and `disableConversionToGoogleType: true` so it stays a Markdown file. If the tool says the connector isn't connected, tell the person to run `/mcp` and connect Google Drive (one time), then try again.
2. **A synced Drive folder on this computer.** If Google Drive for Desktop is installed and NazBrain is in their Drive, it's an ordinary folder named `NazBrain` (on Windows usually under `G:\My Drive\`; on a Mac under `~/Library/CloudStorage/GoogleDrive-*/My Drive/`). Write the note straight into it.
3. **Neither works:** save the note in the repo's root `Incoming/nazbrain/` folder (git-ignored, so it stays on this computer and never goes public), and tell the person: "Saved to `<full path>`. Drag it into NazBrain on Google Drive: https://drive.google.com/drive/folders/1Sy3GTWLM2kpX6zLLdJyXovxd6JpDWHig"

Never commit the note to the repo, and never push it.

## 4. Tell them

One or two lines: the file name, where it went, and how many findings are marked unchecked. Nothing else needs doing on their end.
