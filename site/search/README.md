# Search service: search.nazareneway.com

The whole repo, searchable by meaning and by its exact words, for people who don't have a clone. Proposal and costs: `site/PROPOSAL-SEMANTIC-SEARCH.md`.

One Cloudflare Worker, two doors, and a third behind a hidden link (written answers, below):

| Door | Address | Used by |
| --- | --- | --- |
| Search box | `GET /search?q=…&group=all\|card\|source\|research\|talk&limit=5` | The Reading Room (`site/src/app.js`, the "whole library" panel under the drawer) |
| MCP connector | `POST /mcp`, one tool: `search_the_way` | Anyone who adds `https://search.nazareneway.com/mcp` as a connector in Claude or ChatGPT |

Both return passages with their file, line, source header and link (talks link to the second of the video), grouped by kind, in this order: **cards**; **sources** (the Tier 1 and 2 texts in `VERIFIED-SOURCES.md`, the only ones we quote); **research** (our notes, audits and contributed work: ours, not a source); and **talks** (pointers, not proof). Each kind is its own query, so the transcripts can't crowd the texts out. Nothing is generated.

A file counts as a source when `VERIFIED-SOURCES.md` lists it (or its folder) under Tier 1 or 2. Adding a text there moves it into Sources at the next full sync of those groups: `python scripts/vectorize-sync.py --all --group source --group research`.

## Verse references

A query that names a verse ("John 14:28", "1 Thess 4:17", "Amos 5:21-25", or a bare "Psalm 23") gets that verse back first in Sources, word for word from the held KJV (`christianity/Incoming/kjv/`), labelled `"match": "reference"` and linked to its lines on GitHub. The search by meaning then runs on the query plus the verse's words, so the cards and talks about that verse come back too. A search by meaning alone can't do this: a bare reference embeds as a few numbers and lands near nothing in particular (39% of references found before, 100% after; `golden/BASELINE.md`).

`src/kjv.js` reads the reference (book names and common abbreviations, numbered books, ranges, up to three references per query, 30 verses at most) and fetches the book's file from `raw.githubusercontent.com`, cached by Cloudflare for a day and parsed once per Worker instance. Why not bundle the KJV into the Worker, or look it up in Vectorize? Bundling adds 4 MB and a build step to keep in step with the repo; Vectorize stores chunks of up to a few dozen verses with a cut-down text, not single verses. The KJV doesn't change, so a cached fetch is the cheapest correct copy. If GitHub can't be reached, the search answers without the verse rather than failing.

## Exact words: the keyword index

A search by meaning reads "I will have mercy, and not sacrifice" as *a passage about mercy and sacrifice* and returns the talks and notes that discuss it, often ahead of the verse (2 of 12 pasted verses found). So every search also runs on the words themselves: the same passages sit, as plain text, in a D1 database (`the-way-text`) with an FTS5 full-text index (words as written, not stemmed). The Worker asks it twice, once for the whole query as an exact phrase and once for its meaningful words, then merges those lists with Vectorize's for each group by reciprocal rank fusion (each passage scores 1/(60 + rank) in each list it appears in), so a passage near the top of two lists rises above one only one search liked (12 of 12 found).

The details that keep it cheap and keep the cards right:

- **Common words are left to the search by meaning.** The Worker looks up how many passages hold each word (`passages_vocab`) and drops any in more than 10,000 ("not", "jesus"), then keeps the rarest until they cover 20,000 passages between them. Inside the phrase every word still counts.
- **A pasted passage wins.** When four or more words are found exactly as typed, the phrase list counts double, so those passages come before anything found by meaning alone.
- **Cards use the phrase, not single words.** The 14 cards are found by meaning; single shared words only reordered them for the worse (card first fell from 89% to 75% in the test set), so for cards only an exact phrase counts.
- **Safe input.** Every term is quoted, so nothing typed acts as an FTS operator; a verse reference is taken out of the query first. A passage found by its words returns the 2,000 characters around the match. If D1 fails, the search answers by meaning alone.

- **Setting it up (once; safe to repeat):** `python scripts/vectorize-sync.py --setup-text` creates the database and its schema (a `passages` table keyed by the same chunk ids as the vectors, an FTS5 index over title, heading and text, and triggers that keep them in step).
- **Filling it without re-embedding:** `python scripts/vectorize-sync.py --all --only text` (about 76,000 passages, 100 MB of text, roughly 10 minutes). After that the Action keeps both indexes current; `--only vectors` or `--only text` updates just one.
- **Cost:** none beyond Workers Paid, which includes 25 billion D1 rows read, 50 million rows written and 5 GB of storage a month ([D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)). Measured: a search reads 5,000 to 50,000 rows (about 150 ms, run alongside Vectorize), so 20,000 searches a month is about a billion rows, 4% of what's included. The database is about 270 MB. A full refill writes a few hundred thousand rows.

## Written answers

`POST /answer {"q": "…"}` writes a short answer from the library (`src/answer.js`). It is open to everyone while `ANSWERS_PUBLIC` is `"1"` (`wrangler.toml`). Set to `"0"`, only a request carrying the `X-Ask-Token` header equal to the `ASK_TOKEN` secret gets one; the Reading Room sends it when the site was opened as `nazareneway.com/?ask=<token>` (kept for the tab, taken out of the address bar).

How an answer is made, and why it can't misquote:

- **Passages:** the hybrid search for the question (two closest cards, six held sources, two of our research notes) plus a second search for *the strongest case against* it (six more sources). Talks never reach the model; up to three are listed under the answer as *Hear it discussed (pointers, not proof)*.
- **Model:** Claude Sonnet 5.5 (`claude-sonnet-5-5`), through the Messages API with one tool, `answer`, whose fields are the answer's shape: Jesus's words, the usual Christian reading, what the library finds (with `[n]` citations), supporting passages, the strongest passage the other way, what isn't settled. The model refuses a forced `tool_choice`, so the tool is offered and asked for.
- **Scripture is pasted, never typed.** The model names a verse (`Mark 2:5`, up to six verses); `kjv.js` pastes the King James text and its link. Any other quotation (Thomas, the Scrolls, a church father) must be an exact span of a passage it was given (case, spacing, curly quotes and verse markers aside). Prose fields may hold no quotation marks at all.
- **Checks, then fallback.** A verse the KJV doesn't have, a quotation that isn't word for word, Jesus's words or the other side quoted from a card or our notes, a citation to a passage it wasn't given, quotation marks in prose, or an answer over 260 words: the written answer is not shown, and the reader gets the closest card (when its score is 0.55 or more; tuned on the test set) and the passages instead. A failed *supporting* passage is only left out; no passage on the other side, first person, or a long answer are flagged for review.
- **Thin library:** when the passages don't answer the question, the answer says so, may add two or three sentences of general background (labelled *General background, not from our library*, with no quotations or verse references allowed), and links to a card request.
- **Card first:** when the model says the closest card answers the question, the card is shown above the answer.

**The answer bank.** Every written answer is kept in `the-way-text` (table `answers`: question, its normalised form, the answer, the passages, cost, the question's embedding, status `draft`, `approved` or `struck`). The same question asked again gets the same draft back, free. A question whose embedding is within 0.90 cosine of an approved one gets that answer, marked *checked by a person* (paraphrases score 0.88 to 0.96; different questions on the same subject reach 0.86, so 0.90 errs toward paying for a fresh answer). `python scripts/answer-review.py` prints the last week's drafts, most-asked first, numbered; `--approve 3,5 --strike 4` marks them; `--spend` shows the cost by day.

**Cost and limits.** About 3 cents an answer (10,000 tokens in, 1,000 out, at $2 and $10 a million). `ANSWER_MONTHLY_USD` (default 10) is spread by day, so about 33 cents (roughly ten answers) a day; `answer_spend` counts it from the API's own token counts, and over budget the reader gets the card and passages, never an error. The Anthropic key belongs to The Way's own workspace, whose spend limit is the hard ceiling. On top of the search limit, `/answer` allows 5 questions a minute per address (`ASK_LIMITER`). The tables are created by the Worker on first use.

**Trying it locally:** put `ANTHROPIC_API_KEY=…` and `ASK_TOKEN=…` in `site/search/.dev.vars` (git-ignored), run `wrangler dev --remote`, then `ASK_TOKEN=… node site/search/golden/answers.mjs http://localhost:8787` runs twenty questions and prints them as a reader sees them (`golden/ANSWERS.md` holds the last run). Answers made this way are real calls and land in the bank as drafts.

## The answers dashboard (Matt and Rex)

`https://search.nazareneway.com/dashboard?key=<DASH_TOKEN>` (`src/dashboard.js`). The key is swapped for a cookie scoped to `/dashboard` (a year, HttpOnly, SameSite=Strict) and taken out of the address bar, so bookmark the page after opening the link once; each phone or browser opens the link once. With no `DASH_TOKEN` set, or the wrong key, the page is a 404. To cut everyone off, set a new `DASH_TOKEN` and share the new link.

It shows the budget (today against the daily share, the month against the cap, and the month-end at the current pace), what readers got this month (a written answer, one from the bank, the card and passages, or over budget), questions per day for 30 days with the money spent, the most-asked questions, the gaps (questions that got the card and passages for a reason other than money, or an answer that says the library doesn't settle it: candidates for new cards), the drafts to review, and the most recent questions. Any written answer opens as the site shows it, with **Approve** and **Strike** (the same as `answer-review.py --approve / --strike`).

**What is logged, and what isn't.** Every question asked of `/answer` is kept in `answer_log`: the question's text, when, what the reader got, and the answer it points to. No address, browser, or anything else about the person is stored. Questions are public-facing text people type into a public site, but they can still be personal, so the log is read only through the key-protected dashboard and the review script.

## The test set

`golden/questions.json` holds 66 questions as a Christian might type them, each with the verse or card a good search returns in its top five. `node site/search/golden/run.mjs <url>` scores the search at `<url>` (default `http://localhost:8787`, so `wrangler dev`), and `golden/BASELINE.md` keeps the results over time. Run it before and after any change to how the search ranks things.

## How it fits together

- **Index:** Cloudflare Vectorize index `the-way` (1,024 dims, cosine, filterable by `group`: `card`, `source`, `research`, `talk`), on Matt's Cloudflare account; and the D1 database `the-way-text` (binding `TEXT`) for exact words.
- **Embeddings:** Workers AI `@cf/baai/bge-m3`, for the passages and for each question.
- **Filling it:** `scripts/vectorize-sync.py`, using the same chunking and skip rules as `scripts/semantic-search.py`, minus `site/` and `ideas/`.
- **Keeping it current:** `.github/workflows/search-index.yml` runs on every push to `main` that touches Markdown and embeds everything changed since the last run that succeeded, so a failed run is caught up by the next one. It needs the repo secret `CLOUDFLARE_SEARCH_TOKEN`. Running the workflow by hand does the same catch-up; tick **full** to re-embed everything.
- **Limits:** 30 requests a minute per address (the `LIMITER` binding); `/answer` also 5 a minute (`ASK_LIMITER`).

## Working on it

```bash
node --test site/search/test/*.test.mjs        # unit tests, no account needed

cd site/search
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_SEARCH_TOKEN npx wrangler@4 deploy

python scripts/vectorize-sync.py --all --dry-run   # what would be indexed
```

The token needs Workers Scripts, Workers Routes and DNS (nazareneway.com), Workers AI, Vectorize and D1, all edit. `wrangler.toml` pins the account id: without it wrangler can deploy to another account on the same login.
