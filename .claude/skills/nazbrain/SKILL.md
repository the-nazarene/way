---
name: nazbrain
description: Save what the current conversation found as a Markdown note in the repo's inbox/ folder, with who it came from, and push it, so it gets processed into the research later. Use when someone types /nazbrain, or says "save this to the brain", "save this to the inbox", "send this to the Naz Dogs".
---

# /nazbrain: save this thread to the inbox

Someone has had a conversation worth keeping. Write it up as one Markdown note in `inbox/` at the repo root, commit it, and push it. Someone processes the inbox into the research later (`inbox/README.md`, `PROCESSING-ROADMAP.md`).

**Why an inbox and not the research files:** the research only takes what has been checked against sources. A conversation's findings haven't been checked yet. The inbox holds them, clearly labelled, until someone does. The repo is public, so the note is too: that's why the labels matter.

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
- **Short quotes only** from copyrighted books; cite the rest. The repo is public.
- **Nothing private.** No phone numbers, emails, or anything someone said in confidence.
- One note per save. If the thread covered two unrelated things, ask whether they want two notes.

## 3. Save and push it

1. `git pull --rebase --autostash` first (the autostash keeps any unsaved work safe), so the push doesn't collide with someone else's.
2. Write the note to `inbox/<file name>`.
3. Commit **only that file**, with a message like `nazbrain: <topic> (<Name>)`. Leave any other changes in the working tree alone.
4. Push. If the session works on its own branch (Claude Code on the web and phone does), push that branch and open a pull request into `main` titled the same as the commit.
5. If the push is refused (no write access, no network), say so plainly and leave the note committed locally. Rex can add them as a collaborator on `the-nazarene/way`.

Never put a note anywhere but `inbox/`, and never edit research files from this skill.

## 4. Tell them

One or two lines: the file name, that it's pushed (or the pull request link), and how many findings are marked unchecked. Nothing else needs doing on their end.
