# The search test set: results so far

66 questions as a Christian might type them (`questions.json`), run with `node site/search/golden/run.mjs <url>`. A question passes when the verse it asks about is in the top five Sources, or the card that answers it is in the top five Cards.

## Baseline: the live service before verse references (2026-11-24)

Run against https://search.nazareneway.com (bge-m3 + Vectorize only).

| Question type | Verse in top 5 Sources | Card in top 5 Cards | Card first |
|---|---|---|---|
| ref (18), e.g. "John 14:28", "1 Thess 4:17" | 39% (7/18) | - | - |
| phrase (12), e.g. "I will have mercy, and not sacrifice" | 17% (2/12) | - | - |
| card (28), two per card in a reader's words | - | 100% (28/28) | 89% (25/28) |
| offcard (8) | 50% (2/4 with a verse) | - | - |

What it shows: the cards are found; the verses mostly aren't. A reference like "Matthew 9:13" returned Matthew 13 and four other translations; a quoted phrase usually returned a podcast transcript or a commentary that uses the words, not the verse.

The four unscored questions land on: tithe → Torah card; Holy Spirit → Essene origins card; what Jesus looked like → resurrection card; baptism → blood atonement card. None of them has a card; these are candidates.

## After verse references (this PR, run on `wrangler dev --remote`, 2026-11-24)

| Question type | Verse in top 5 Sources | Card in top 5 Cards | Card first |
|---|---|---|---|
| ref (18) | **100% (18/18)** | - | - |
| phrase (12) | 17% (2/12) | - | - |
| card (28) | - | 100% (28/28) | 89% (25/28) |
| offcard (8) | 50% (2/4) | - | - |

References are fixed. Exact phrases are the next step: keyword search (D1 full-text) fused with the search by meaning.
