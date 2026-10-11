# Episode breakdowns

Each `<n>.json` here breaks one podcast episode into topics and checked claims. `site/tests/desk/make-episode-desks.js` turns it into a prepared desk (`site/data/desks/jesus-way-<n>.json`), and the build verifies it again. The full steps are in `site/DESK-DEVELOPERS.md` under "Make an episode board".

The checks are research, not verdicts on the hosts. The aim is that someone who watched the episode can go one level deeper: what was said, at what second, what the texts actually say, and where to read more.

## The prompt

Give this to your Claude, with the episode number and file filled in. It is the prompt the first five boards were made with.

---

You are researching ONE podcast episode for a fact-checked "episode board" on The Way's Desk. Accuracy is the whole point: a wrong citation here gets screenshotted. Work carefully and slowly.

EPISODE FILE (read the whole transcript, start to finish): `podcast-archive/the-jesus-way/<file>.md`

Read first: `CLAUDE.md` (source hierarchy; tone: collaborative, not debunking, not preachy), `VERIFIED-SOURCES.md`, the cards in `site/data/cards/*.json` (a card source is referenced as `{"card": slug, "source": index}`, its 0-based position in `sources`), and the held texts in `christianity/Incoming/` (the KJV is in `kjv/`, one verse per line as `**C:V**`).

1. Identify the episode's 3 to 6 main TOPICS (regions on the board).
2. Under each, pick the 2 to 5 most important CLAIMS actually made: scripture, history, scholarship, science, or a clear theological position. About 12 to 20 in all.
3. CHECK EACH ONE YOURSELF. Do not take the transcript's word.
   - Scripture: open the KJV file and confirm the verse says what is claimed. Refs as `Book C:V` or `Book C:V-V` with the KJV book name (`Psalms`, `1 Corinthians`).
   - Everything else: search the web and OPEN the pages. Prefer primary texts, encyclopedias of record, university, scholarly, peer-reviewed or official sources. Never use thenazareneway.com or essenenazarene.com as evidence. The Essene Gospel of Peace (Szekely, 1930s) and the Gospel of the Holy Twelve (Ouseley, 1898-1901) are modern books, not ancient texts. Transcripts and YouTube are pointers, not proof.
   - For every web source, copy a SHORT exact quote (under 25 words) from the page text you fetched. If no page supports a point, say so; don't fill the gap.
   - Use repo card sources where one fits. Respect the warnings on the cards (for example, the card on Josephus, Antiquities 18.1.5).
   - Be fair to the other side: where critics or apologists have a standard answer, give it.
4. VERDICT, honestly and charitably: `HOLDS`, `NARROWER` (give the true narrower version), `DOESN'T HOLD` (say what is actually so), `OPEN` (scholars genuinely disagree), `INTERPRETATION` (a reading, not a fact; give the text and the mainstream reading), `EXPERIENCE` (testimony; labeled, not checked).
5. Add 2 to 5 QUESTIONS a viewer could explore, and CORRECTIONS (things said that shouldn't be repeated as stated).

THE QUOTE RULE: `phrase` is copied EXACTLY, character for character, from ONE transcript paragraph (auto-caption typos and all), 6 to 16 words. `ts` is that paragraph's timestamp label. Confirm every phrase with a search before you finish.

Write `site/data/episodes/<n>.json`:

```json
{
 "episode": "066", "title": "...", "guests": ["..."], "date": "YYYY-MM-DD",
 "summary": "2 to 3 neutral sentences: what the episode argues",
 "topics": [
  {"title": "SHORT REGION TITLE IN CAPS", "lead": "one sentence",
   "claims": [
    {"phrase": "...", "ts": "mm:ss", "speaker": "Aaron | James | <guest> | unclear",
     "claim": "the claim in plain words, neutral",
     "kind": "scripture | history | scholarship | science | theology | experience",
     "verdict": "HOLDS | NARROWER | DOESN'T HOLD | OPEN | INTERPRETATION | EXPERIENCE",
     "check": "2 to 4 sentences: what the evidence actually says",
     "verses": ["Matthew 5:17"],
     "repo": [{"card": "sacrifice-culture-vegetarian-jesus", "source": 2}],
     "sources": [{"title": "...", "url": "https://...", "quote": "exact short quote"}]
    }]
  }],
 "questions": ["..."],
 "corrections": ["..."]
}
```

Then run `python site/tests/desk/check-episode.py site/data/episodes/<n>.json` and fix every FAIL.

---

## What a person still has to do

The script checks that every quote, verse, timestamp and page is real. It cannot check that a verdict is right. Read every ✗ and ~ with the sources open before building the board.
