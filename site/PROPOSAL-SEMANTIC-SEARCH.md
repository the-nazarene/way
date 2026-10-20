# Proposal: search the whole library by meaning

2026-10-20 · Matt, with Claude · for Matt's and Rex's decision.

One search service on nazareneway.com, with two doors: a search box on the site for everyone, and a connector group members add to their own Claude or ChatGPT. Both search the whole repo by meaning (the texts, the cards, and every transcribed talk) and both return real passages with their source attached, never a generated answer. It costs about $5 a month, flat, at any traffic we're likely to see.

This is the "smarter drawer" phase 2 in `site/README.md`, widened from cards only to the whole library.

## Why

The repo now holds over 1,200 files: the primary texts, the 14 cards, and about 1,000 talks from Dr. Tabor, Scott, The Jesus Way, David and others. The group has never had all of that in one place, and nobody can remember who said what where. "Where did Tabor talk about James as successor?" or "Has anyone here covered the Clementines?" should take seconds and land on the exact minute.

Today that only works for someone running `scripts/semantic-search.py` on their own computer with Python and a Google key. Matt built that index on 2026-10-20 (41,883 passages, 11 minutes, about $2), and the results are good: a search for "Paul never met Jesus and contradicts him" returns The Jesus Way's Paul episode, Scott's "St. Paul killed James", and the site's Paul-vs-the-Twelve page. This proposal puts the same search in front of everyone else.

## How it works

1. **Ahead of time:** every passage in the repo is turned into an embedding (a list of numbers that captures its meaning) and stored in Cloudflare Vectorize, a hosted index.
2. **When someone searches:** a small Cloudflare Worker turns their question into numbers with the same model, asks Vectorize for the closest passages, and returns them with file, line, source header, and contributor.
3. **The site shows them in three groups**, so transcripts never crowd out or pass for sources:
   - **Cards**: the existing drawer matches, first, as today.
   - **From the library**: primary texts and research files, with their translator or source line.
   - **From the talks, pointers, not proof**: transcript passages, each with a ▶ link to that second of the video, stamped the way the Desk stamps moments.
4. **The connector** is the same Worker answering as an MCP server with one tool, `search_the_way`. A group member adds `nazareneway.com/mcp` to Claude (or ChatGPT) once, then just asks. Their own AI does the reading and writing on their own subscription; our side only does the lookup.

The split into groups matters. Talks are 76% of the index, so in a single ranked list they push the primary texts down. Searching the three groups separately fixes that.

## Keeping it current

A GitHub Action runs on every merge to `main`. It finds the Markdown files that changed, chunks them with the same rules as `semantic-search.py`, embeds the new passages, and removes the old ones. Nobody rebuilds by hand: when 400 talks are merged, they are searchable that day. The same exclusions apply as today, including the git-ignored root `Incoming/`, which never leaves anyone's laptop.

## Cost

Checked against Cloudflare's pricing pages on 2026-10-20. The model is `bge-m3` on Workers AI (1,024 dimensions, and it handles Spanish for the Spanish pages later).

| Item | What it is | Cost |
| --- | --- | --- |
| Workers Paid plan | Needed because the index is bigger than the free plan holds (5 million stored dimensions; ours is about 43 million) | $5 a month minimum |
| Storing the index | 41,883 passages × 1,024 dimensions | About 2¢ a month above the plan's included 10 million |
| Searching | Cloudflare bills (stored passages + searches) × dimensions; 50 million a month are included | 10,000 searches a month: about 3¢. 100,000: about $1. A million: about $10 |
| Turning each question into numbers | About 20 words per search, at $0.012 per million tokens | Effectively nothing: a million searches is about 25¢ |
| First build | Embedding the whole repo once with `bge-m3` (about 13.5 million tokens) | Under $1, one time |

So: **about $5 a month** up to roughly 100,000 searches a month, and about $15 at a million. Searches are almost free; the cost is renting the shelf the index sits on. The thing that would cost per visitor, an AI writing an answer to every search at 1 to 5¢ each, is exactly what this does not do.

If the account already runs other Workers on the paid plan, the extra is pennies.

## Safeguards

- **Rate limit:** a handful of searches per minute from one address, enforced in the Worker, so a bot can't run up the bill.
- **No generated answers.** The site and the connector return passages and their sources only, per the site's rule. Any summarizing happens in a member's own AI, on their account, from passages that carry their citations.
- **Provenance travels with every passage.** The indexer attaches each file's source header and `Contributed by:` line to each chunk, as `semantic-search.py` already does, so nothing comes back without where it came from.
- **Transcripts are labelled as pointers** everywhere they appear, in both doors.
- **Read-only.** The search service can't change anything in the repo or on the site.

## What it does not do

- **It doesn't answer questions.** It finds where the answer is. Phase 3 in `site/README.md` (grounded answers, stamped UNCHECKED) stays a separate decision.
- **It doesn't make a transcript a source.** A talk hit sends you to the minute; what goes on a card still has to be checked against a held text.
- **It doesn't replace the local script.** `semantic-search.py` stays for anyone working in the repo directly.

## Decisions

- [ ] **Matt:** use your Cloudflare account (it runs nazareneway.com) and move it to the $5 Workers Paid plan
- [ ] **Matt:** host the Worker on nazareneway.com, under `/api/search` and `/mcp` (beside `/api/desk` if the secret-links proposal goes ahead: one Worker can serve both)
- [ ] **Rex:** where the search results sit on the site (the drawer, a page of their own, or both) and how they look
- [ ] **Rex and Matt:** whether the connector is open to anyone or only to people given the address
- [ ] **Matt:** ask the group what they'd actually use before the connector is built (the site search box doesn't depend on it)

Nothing is built until these are settled.

## Sources

- [Cloudflare Vectorize pricing](https://developers.cloudflare.com/vectorize/platform/pricing/): free plan 30 million queried and 5 million stored dimensions; paid plan 50 million and 10 million included, then $0.01 per million queried and $0.05 per 100 million stored; queried = (stored vectors + queries) × dimensions
- [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/): `bge-m3` at $0.012 per million input tokens; 10,000 free neurons a day
- [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/): $5 a month paid minimum; 10 million requests a month included
