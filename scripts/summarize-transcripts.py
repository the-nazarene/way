#!/usr/bin/env python3
"""Write the synthesized notes above each timed transcript, with Claude Haiku 5.5 on the Batch API.

Input: archive files made by pull-transcripts.py (a header block, then `## Full Transcript`
with `**[mm:ss]**` paragraphs). Output: the same file with Summary / Key Teachings / Scripture
Citations / Historical Sources & Scholars Cited / Quotable Moments / Misconceptions Addressed /
Connection to the Repo's Questions / Books & Resources Mentioned inserted between the header
and the transcript, the template the dr-tabor and the-jesus-way archives already use.

Quote check: every line under Quotable Moments must carry a `[mm:ss]` and its quoted words must
appear in the transcript within a few minutes of that stamp. Lines that fail are dropped and
listed in the run log; captions are pointers, not proof, and a quote that cannot be found in
them is worse than no quote.

Usage (needs ANTHROPIC_API_KEY, and ANTHROPIC_WORKSPACE_ID for an org-scoped key):
  summarize-transcripts.py submit FILES...     # send one batch, remember it in --state
  summarize-transcripts.py status              # how far along the batch is
  summarize-transcripts.py collect             # write finished summaries into the files
Options: --state FILE (default: .summarize-batch.json beside the first file), --speaker TEXT
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

import anthropic
from anthropic.types.message_create_params import MessageCreateParamsNonStreaming
from anthropic.types.messages.batch_create_params import Request

MODEL = "claude-haiku-5-5"
MARKER = "## Full Transcript"
STAMP = re.compile(r"\*\*\[(\d+):(\d{2})(?::(\d{2}))?\]\*\*")
SECTIONS = [
    "Summary", "Key Teachings", "Scripture Citations", "Historical Sources & Scholars Cited",
    "Quotable Moments", "Misconceptions Addressed", "Connection to the Repo's Questions",
    "Books & Resources Mentioned",
]

# A fixed vocabulary, deliberately independent of the question cards (which may be rewritten):
# map topics to cards in one small file, never by retagging hundreds of transcripts.
TOPICS = [
    "paul", "james", "ebionites-nazarenes", "essenes-dead-sea-scrolls", "john-the-baptist", "mary",
    "jesus-family", "resurrection", "afterlife-hell", "torah", "sacrifice", "diet", "nonviolence",
    "kingdom", "christology", "virgin-birth", "apocalyptic", "gospels-canon", "archaeology",
    "last-week-crucifixion",
]
CACHE = Path(__file__).resolve().parent / ".caption-cache"

SYSTEM = """You write research notes on YouTube talks for "The Way", a public research repository asking what Jesus of Nazareth actually taught and what happened to his first followers (James, the Jerusalem community, the Nazarenes and Ebionites) versus the Christianity that grew from Paul. Readers are a small study group who will check every claim.

You get one talk's auto-generated caption transcript, broken into paragraphs that each start with a **[mm:ss]** timestamp. Captions have no speaker labels and garble names (e.g. "Hesip" for Hegesippus); fix obvious name garbles in your prose, never inside quotations.

You may also get the video's YouTube description; use it only to identify who is speaking (host, guest) and the occasion.

Begin your answer with exactly two lines:
TOPICS: one to five tags, comma-separated, chosen ONLY from this list, for what the talk substantially discusses (not passing mentions): """ + ", ".join(TOPICS) + """
SPEAKERS: who speaks, as "Name (role)" separated by semicolons, e.g. "James Tabor (presenter); Derek Lambert (host)". Use names from the description or the talk; if a host or guest is unnamed write "unnamed host".

Then write these sections in this order, each as a level-2 markdown heading, separated by `---` lines:

## Summary
Two or three solid paragraphs: the question the talk asks, the speaker's answer and its main evidence, and how it ends. Attribute positions to the speaker ("Tabor argues..."), never state them as settled fact.

## Key Teachings
Three to eight `###` subsections, one per distinct argument, each a paragraph or a short list. Concrete: name the texts, sources, dates and reasoning the speaker actually gives.

## Scripture Citations
A table | Verse | Context/Teaching |. Only passages the speaker cites or clearly discusses. Write every reference in standard form with the full book name: "Romans 14:1", "Romans 14:1-3", "1 Corinthians 15", "Genesis 1:29". When the speaker gives no verse, give the chapter if it is clear, otherwise the book alone; put any description in the second column, never in the Verse column.

## Historical Sources & Scholars Cited
A table | Source | Reference | Context |. Ancient writers, texts, archaeology, modern scholars and books the speaker names. If there are none, write "None named."

## Quotable Moments
Three to six lines, each exactly in this form:
- **[mm:ss]** "exact words from the transcript" — one-line note on why it matters
The words between the quotation marks must be copied character-for-character from one passage of the transcript (you may cut the start or end, never the middle), and the timestamp must be the stamp of the paragraph they appear in. Pick moments where the speaker states a position crisply. If a passage is clearly another speaker (a host or guest), say so in the note.

## Misconceptions Addressed
Bullets: the popular belief the speaker challenges, and his correction. Write "None addressed directly." if there are none.

## Connection to the Repo's Questions
Bullets tying the talk to the repo's recurring questions where it genuinely bears on them: what Jesus taught vs. what Paul taught; James and the Jerusalem community; the Nazarenes/Ebionites/Essenes; Torah, sacrifice, diet and nonviolence; the Kingdom on earth; resurrection, afterlife and hell; who Jesus thought he was; how the gospels and canon were formed. Skip any that do not apply.

## Books & Resources Mentioned
Bullets of books, courses, sites, or other videos the speaker points to. "None mentioned." if none.

Rules: use only what is in this transcript; add no outside facts, dates or quotations. If the talk is mostly a guest or host speaking, say who carries it in the Summary. Plain markdown, no preamble, no closing remarks: the TOPICS line, the SPEAKERS line, then "## Summary"."""


def stamp_seconds(m: re.Match) -> int:
    a, b, c = m.group(1), m.group(2), m.group(3)
    return int(a) * 3600 + int(b) * 60 + int(c) if c else int(a) * 60 + int(b)


def split_file(text: str) -> tuple[str, str]:
    head, _, rest = text.partition(MARKER)
    head = re.sub(r"\n-{3,}\s*$", "", head.rstrip()).rstrip()
    return head, MARKER + rest


def strip_old_notes(head: str) -> str:
    """Drop any earlier generated sections so a rerun replaces rather than stacks."""
    cut = head.find("\n## Summary")
    head = head[:cut] if cut != -1 else head
    return re.sub(r"(\n-{3,}\s*)+$", "", head.rstrip()).rstrip()


USE_LINE = ("**Use:** auto-captioned transcript with machine-written notes. Quotable Moments were checked "
            "against the captions, not the audio; attribute positions by paraphrase and verify in the video "
            "before quoting. See `questions/CITATION-NOTES.md`.")


def build_head(head: str, speakers: str, topics: list[str], published: str | None) -> str:
    """Header lines in a fixed order, replacing any from an earlier run."""
    drop = r"\*\*(Speakers?|Topics|Published|Use):\*\*" if speakers else r"\*\*(Speakers|Topics|Published|Use):\*\*"
    lines = [l for l in head.splitlines() if not re.match(drop, l.strip())]
    title, rest = lines[0], [l.rstrip() for l in lines[1:] if l.strip()]
    extra = []
    if speakers: extra.append(f"**Speakers:** {speakers}")
    if published: extra.append(f"**Published:** {published}")
    extra.append(f"**Topics:** {', '.join(topics) if topics else 'none tagged'}")
    extra.append(USE_LINE)
    body = [l if l.endswith("  ") else l + "  " for l in extra[:1] + rest + extra[1:]]
    body[-1] = body[-1].rstrip()
    return title + "\n\n" + "\n".join(body)


def parse_preamble(text: str) -> tuple[list[str], str, str]:
    topics, speakers = [], ""
    pre, sep, body = text.partition("## Summary")
    for line in pre.splitlines():
        if line.upper().startswith("TOPICS:"):
            topics = [t.strip().lower() for t in line.split(":", 1)[1].split(",")]
        elif line.upper().startswith("SPEAKERS:"):
            speakers = line.split(":", 1)[1].strip()
    return [t for t in topics if t in TOPICS], speakers, (sep + body).strip()


def load_dates(path: Path | None) -> dict[str, str]:
    out = {}
    if path and path.exists():
        for line in path.read_text().split("\n"):
            p = line.split()
            if len(p) == 2 and re.fullmatch(r"\d{8}", p[1]):
                d = p[1]; out[p[0]] = f"{d[:4]}-{d[4:6]}-{d[6:]}"
    return out


def words(s: str) -> list[str]:
    s = s.lower().replace("’", "'").replace("‘", "'")
    return re.findall(r"[a-z0-9']+", s)


def transcript_windows(transcript: str) -> list[tuple[int, list[str]]]:
    out, marks = [], list(STAMP.finditer(transcript))
    for i, m in enumerate(marks):
        end = marks[i + 1].start() if i + 1 < len(marks) else len(transcript)
        out.append((stamp_seconds(m), words(transcript[m.end():end])))
    return out


def quote_found(quote: str, secs: int, windows: list[tuple[int, list[str]]], slack: int = 240) -> bool:
    q = words(quote)
    if len(q) < 4:
        return False
    near: list[str] = []
    for t, w in windows:
        if abs(t - secs) <= slack:
            near.extend(w)
    hay = " " + " ".join(near) + " "
    # allow the model to have trimmed an ellipsis out of the middle: every piece must be present
    pieces = [p for p in re.split(r"\.\.\.|…", quote) if len(words(p)) >= 3] or [quote]
    return all(" " + " ".join(words(p)) + " " in hay for p in pieces)


def check_quotes(body: str, transcript: str) -> tuple[str, list[str]]:
    windows = transcript_windows(transcript)
    dropped, lines, in_q = [], [], False
    line_re = re.compile(r'^- \*\*\[(\d+):(\d{2})(?::(\d{2}))?\]\*\*\s*"(.+?)"')
    for line in body.splitlines():
        if line.startswith("## "):
            in_q = line.strip() == "## Quotable Moments"
        if in_q and line.startswith("- "):
            m = line_re.match(line)
            if not m or not quote_found(m.group(4), stamp_seconds(m), windows):
                dropped.append(line)
                continue
        lines.append(line)
    return "\n".join(lines), dropped


def client() -> anthropic.Anthropic:
    headers = {}
    if os.environ.get("ANTHROPIC_WORKSPACE_ID"):
        headers["anthropic-workspace-id"] = os.environ["ANTHROPIC_WORKSPACE_ID"]
    return anthropic.Anthropic(default_headers=headers)


def submit(files: list[Path], state: Path, max_tokens: int = 16000) -> None:
    reqs, ids = [], {}
    for i, f in enumerate(files):
        text = f.read_text(encoding="utf-8")
        head, transcript = split_file(text)
        head = strip_old_notes(head)
        if not STAMP.search(transcript):
            print(f"skip (no timed transcript): {f.name}", file=sys.stderr)
            continue
        title = head.splitlines()[0].lstrip("# ").strip()
        desc = ""
        m = re.search(r"watch\?v=([A-Za-z0-9_-]{11})", head)
        if m and (CACHE / f"{m.group(1)}.apify.json").exists():
            raw = json.loads((CACHE / f"{m.group(1)}.apify.json").read_text())
            raw = raw[0] if isinstance(raw, list) and raw else raw
            if isinstance(raw, dict) and raw.get("description"):
                desc = f"YouTube description:\n{raw['description'][:3000]}\n\n"
        cid = f"t{i:04d}"
        ids[cid] = str(f)
        reqs.append(Request(custom_id=cid, params=MessageCreateParamsNonStreaming(
            model=MODEL,
            max_tokens=max_tokens,
            system=SYSTEM,
            messages=[{"role": "user", "content": f"Talk title: {title}\n\n{desc}{head}\n\n{transcript}"}],
        )))
    batch = client().messages.batches.create(requests=reqs)
    state.write_text(json.dumps({"batch_id": batch.id, "files": ids}, indent=1))
    print(f"batch {batch.id}: {len(reqs)} requests; state in {state}")


def status(state: Path) -> None:
    s = json.loads(state.read_text())
    b = client().messages.batches.retrieve(s["batch_id"])
    c = b.request_counts
    print(f"{b.processing_status}: {c.succeeded} done, {c.processing} processing, {c.errored} errored, {c.expired} expired")


def collect(state: Path, dates: dict[str, str]) -> int:
    s = json.loads(state.read_text())
    cl = client()
    b = cl.messages.batches.retrieve(s["batch_id"])
    if b.processing_status != "ended":
        print(f"not finished yet ({b.processing_status})"); return 1
    written, failed, all_dropped, tin, tout = 0, [], [], 0, 0
    for r in cl.messages.batches.results(s["batch_id"]):
        path = Path(s["files"][r.custom_id])
        if r.result.type != "succeeded":
            failed.append((path.name, r.result.type)); continue
        msg = r.result.message
        tin += msg.usage.input_tokens; tout += msg.usage.output_tokens
        if msg.stop_reason != "end_turn":
            failed.append((path.name, f"stop_reason={msg.stop_reason}")); continue
        topics, speakers, body = parse_preamble("".join(b.text for b in msg.content if b.type == "text"))
        if not body.startswith("## Summary"):
            failed.append((path.name, "unexpected format")); continue
        head, transcript = split_file(path.read_text(encoding="utf-8"))
        body, dropped = check_quotes(body, transcript)
        all_dropped += [(path.name, d) for d in dropped]
        vid = re.search(r"watch\?v=([A-Za-z0-9_-]{11})", head)
        head = build_head(strip_old_notes(head), speakers, topics, dates.get(vid.group(1)) if vid else None)
        path.write_text(f"{head}\n\n---\n\n{body}\n\n---\n\n{transcript.rstrip()}\n", encoding="utf-8")
        written += 1
    log = state.with_suffix(".log")
    with log.open("w") as fh:
        fh.write(f"written {written}, failed {len(failed)}, quotes dropped {len(all_dropped)}\n")
        fh.write(f"tokens in {tin:,} out {tout:,}\n\n")
        for n, why in failed: fh.write(f"FAILED {n}: {why}\n")
        for n, d in all_dropped: fh.write(f"DROPPED QUOTE {n}: {d}\n")
    print(f"written {written}, failed {len(failed)}, quotes dropped {len(all_dropped)}; tokens in {tin:,} out {tout:,}; log {log}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("cmd", choices=["submit", "status", "collect"])
    ap.add_argument("files", nargs="*", type=Path)
    ap.add_argument("--state", type=Path)
    ap.add_argument("--max-tokens", type=int, default=16000, help="raise for very long talks that stop at max_tokens")
    ap.add_argument("--dates", type=Path, help='file of "<youtube id> <YYYYMMDD>" lines (yt-dlp --print)')
    a = ap.parse_args()
    state = a.state or ((a.files[0].parent if a.files else Path.cwd()) / ".summarize-batch.json")
    if a.cmd == "submit":
        if not a.files: ap.error("submit needs files")
        submit(a.files, state, a.max_tokens)
    elif a.cmd == "status":
        status(state)
    else:
        return collect(state, load_dates(a.dates))
    return 0


if __name__ == "__main__":
    sys.exit(main())
