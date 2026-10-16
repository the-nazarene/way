# podcast-archive

Raw working transcripts and synthesized research notes from two sources:

- **`the-jesus-way/`** — The Jesus Way podcast (Aaron Abke & James Benefico). 65 episodes, ~13 MB. Documented in detail below.
- **`kameron-waters/`** — Kameron Waters (Christspiracy filmmaker, The Way Skool). 7 videos from his own channel, plus `guest-appearances/` — twelve long-form interviews and debates on other people's shows (~22 hours, ~257,000 words), added 2026-10-16 so the repo knows what he has already argued in public.
- **`dr-tabor/`** — Dr. James Tabor's "Paul" YouTube playlist: 77 videos synthesized into structured notes (summary, key teachings, scripture citations, scholars cited, quotable moments, plus the full raw transcript per file). See **`dr-tabor/00-overview.md`** for its thematic index and project notes.

The rest of this file documents the **The Jesus Way** archive.

---

## What This Is

The Jesus Way is the podcast where Aaron Abke and James Benefico do deep dives on what Jesus actually taught, what got distorted, and what the evidence actually says. These transcripts are the raw episode content — what was actually said, not edited summaries.

**These are working transcripts, not polished episodes.** Treat them as:
- Research material — quotes, source mining, primary speakers' words
- Reference for synthesizing future content
- Background context for the more polished material in `christianity/`, `jesus-site-reference/`, etc.

**Do NOT treat them as:**
- Authoritative on every factual claim (verify against primary sources before citing publicly)
- Publication-ready content
- Speaker-corrected (these are likely Whisper-style auto-transcripts, with all the errors that come with that)

---

## Episode List

Episodes are numbered. The numbering reflects production order (some early episodes have one-digit prefixes; later ones have three).

| # | Title | Approx. Size |
|---|---|---|
| 01 | Seeing God Through Yeshua's Eyes | 121 KB |
| 02 | The Moses Scroll | 175 KB |
| 03 | Love God, Love People | 130 KB |
| 04 | Manifesting the Kingdom | 129 KB |
| 05 | The Truth About Resurrection | 103 KB |
| 06 | Secrets of the Moses Scroll | 159 KB |
| 07 | The Two Ways | 135 KB |
| 08 | How to Pray Like Jesus | 110 KB |
| 09 | The Nazarenes: The Forgotten Sect of Yeshua | 158 KB |
| 010 | Essene Origins — Dr. James Tabor | 100 KB |
| 11 | Christian NDEs — Saved by Works | 181 KB |
| 12 | Bible Scholar Left Christianity | 144 KB |
| 13 | Essene Gospel of Peace | 143 KB |
| 14 | Jesus and War | 108 KB |
| 15 | Yeshua's True Mission — Dr. Tabor | 98 KB |
| 016 | The Cult of Saturn | 133 KB |
| 017 | What Is Christ Consciousness | 123 KB |
| 018 | Does God Need Blood to Forgive | 90 KB |
| 019 | The Jesus Diet | 123 KB |
| 020 | The Jesus Diet — Spirituality Meets Health & Fitness | 96 KB |
| 021 | Jesus Diet — Live Q&A | 126 KB |
| 022 | The Jesus Way Axioms | 122 KB |
| 023 | Exposing Paul, False Prophet | 179 KB |
| 024 | New Studies Prove the Jesus Diet Works | 69 KB |
| 025 | Paul Derangement Syndrome | 105 KB |
| 026 | Responding to John Davis | 156 KB |
| 027 | The Lost Mary — Rediscovering Mother of Jesus | 117 KB |
| 028 | NDE Researcher — Life Reviews Disprove Blood Atonement | 93 KB |
| 029 | Demonic Possession — Dr. Marzinsky | 131 KB |
| 030 | Lucifer vs. Ahriman | 113 KB |
| 031 | Mind of Christ | 98 KB |
| 032 | Overcoming Meth and Demons — Boston2Percent | 74 KB |
| 033 | Refuting the Rapture | 144 KB |
| 034 | Did Jesus Claim to Be God? Debunking the Trinity | 148 KB |
| 035 | Secrets of Swedenborg — Curtis Childs | 138 KB |
| 036 | Powerful Spiritual Practice Removed | 143 KB |
| 037 | 23 Patterns Demonic Attacks | 125 KB |
| 038 | 12-Strand DNA | 108 KB |
| 039 | Demonic Spirituality, Global Elites | 135 KB |
| 040 | Art of Loving Relationship | 94 KB |
| 041 | Shadow Work — Xavier Dagba | 107 KB |
| 042 | Spiritual Benefits of Fat Loss | 91 KB |
| 043 | Minister of Wellness — Church of Satan | 103 KB |
| 044 | Three Forgotten Nazarene Practices | 126 KB |
| 045 | Three Temples Unlock Christ Consciousness | 165 KB *(captions disabled at source; transcribed locally with Whisper, 2026-10-08)* |
| 046 | James Rejected Paul — Scriptural Proof | 183 KB |
| 047 | Jesus Died Because of Sins | 93 KB |
| 048 | What Really Happened at Resurrection | 172 KB |
| 049 | Top 10 Heresies of the Jesus Way | 166 KB |
| 050 | Debunking Wes Huff Hell Theology | 66 KB |
| 051 | Was Jesus Jacked? Fitness & Self-Mastery | 86 KB |
| 052 | How Jesus Healed — Scalar Energy | 51 KB |
| 053 | Gregg Braden on the Essene Origins of Christianity | 104 KB |
| 054 | Eastern Orthodox and the Search for Original Christianity | 109 KB |
| 055 | The Man Who Rescues Children from Witch Doctors | 101 KB |
| 056 | "Paul's Theology Is GOD'S Theology" — Responding to Angela Scafidi | 126 KB |
| 057 | How Eating Animals Lowers Your Consciousness — Will Tuttle | 115 KB |
| 058 | Ex-Hebrew Israelite Exposes the Bible's Dangerous Ideology — Malaki Macabee | 137 KB |
| 059 | The Hidden Water Codes Jesus Used — Veda Austin | 117 KB |
| 060 | Kam Waters Charged With Felony for Saving Dogs From Torture | 82 KB |
| 061 | Jesus Revealed the Secret to Changing Your Reality — David Bayer | 133 KB |
| 062 | Is Kundalini Awakening the Holy Spirit Yeshua Foretold? — Chris Sartain | 107 KB |
| 063 | 9 Problems With Paul That Christian Apologists Can't Answer | 41 KB |
| 064 | How Spiritual Warfare Actually Works — Darius J Wright | 105 KB |
| 065 | Why Christians Hate Jesus' Real Salvation Teachings — Minister of Wellness | 120 KB |

**Other files in `the-jesus-way/`:**
- `00-overview.md` — Notes on the podcast as a whole
- `TRANSCRIPT-STATUS.md` — Tracking which episodes have been transcribed
- `transcript-datasets.json` — Metadata for the transcription pipeline

---

## How These Were Generated

Every transcript was re-pulled on 2026-10-08 **with timestamps** by `scripts/pull-transcripts.py` (in this repo; see `scripts/README.md`). Each paragraph opens with `**[mm:ss]**`, so a line can be cited as `046 @ 41:12` and checked against the audio; the YouTube link in each file's transcript note plus `&t=<seconds>` jumps straight to it. Captions carry no speaker labels; `>>` appears only where YouTube marks a change of speaker. Episode 045 (captions disabled at source) was transcribed locally with Whisper and is labeled as such.

Before that, episodes were transcribed via `_pull_transcripts.py` (kept in mr-pronoia). Quality varies — speaker attribution, technical terms, names, and Hebrew/Aramaic/Greek transliterations may be inaccurate. When using a quote, listen to the original audio to verify.

---

## Use Cases

- **Mining for quotes** for the polished Christianity content
- **Source attribution** — most episodes cite primary research (Tabor, the Moses Scroll, Eisenman, etc.). The transcripts preserve those citations.
- **Cross-checking claims** in the polished `christianity/` content against where they originated in podcast discussion
- **Future podcast episodes** — themes that came up but weren't fully developed are visible here

---

## Use Caution With

- **Specific factual claims** — verify before publishing externally
- **Direct quotes from named guests** — confirm with the source
- **Anything controversial** — these are conversations, not vetted publications
- **Sharing widely** — these are working research material; the polished versions in `christianity/` and `jesus-site-reference/` are the publication-quality outputs

---

*The podcast is the laboratory. The polished docs in `christianity/` and `jesus-site-reference/` are the published findings.*
