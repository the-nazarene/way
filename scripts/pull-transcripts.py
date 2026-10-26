#!/usr/bin/env python3
"""Pull (or re-pull) YouTube auto-captions for the podcast archive, WITH timestamps.

Why timestamps: a transcript line you can cite as `046 @ 41:12` is a pointer
someone can check against the audio in ten seconds. A bare paragraph is not.
Two fabricated quotations entered this repo by being lifted from an untimed
caption with quotation marks added; timed captions make that mistake visible.

What it does, per archive file:
  1. finds the YouTube ID (a `youtube.com/watch?v=` link in the header, or an
     explicit map passed with --map)
  2. fetches the English captions as timed segments — from Apify when
     APIFY_TOKEN is set (no rate limits, a fraction of a cent per video), else
     from yt-dlp (free, but YouTube throttles after a few videos)
  3. rewrites everything from `## Full Transcript` down as timestamped
     paragraphs, leaving the synthesized header above it untouched

Usage:
  python scripts/pull-transcripts.py podcast-archive/kameron-waters/01-*.md      # one file
  python scripts/pull-transcripts.py podcast-archive/the-jesus-way/*.md          # a folder
  python scripts/pull-transcripts.py --map ids.json podcast-archive/*/*.md       # with an id map
  python scripts/pull-transcripts.py --only-missing ...                          # skip files already timestamped

Options:
  --map FILE        JSON of {"<file path>": "<youtube id>"} for files whose header has no link
  --source apify|yt-dlp|auto   default auto: Apify if APIFY_TOKEN is set, else yt-dlp
  --lang CODE       caption language for the Apify path (default en; Kam's Costa Rica video is es)
  --sleep N         seconds between yt-dlp requests (default 12; YouTube 429s if you hurry)
  --only-missing    skip files whose transcript already carries timestamps
  --min-events N    fewest caption lines to accept (default 20; lower it for a short)
  --dry-run         fetch and convert, print a sample, write nothing
  --cache DIR       where to keep the raw caption files (default: scripts/.caption-cache, git-ignored)

Captions are pointers, not proof. Nothing here is a source; verify in the
primary text before quoting. YouTube auto-captions carry no speaker labels;
the `>>` marker appears only where YouTube itself inserts one.
"""
from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import os
import re
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
MARKER = "## Full Transcript"
ID_RE = re.compile(r"(?:youtube\.com/watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})")
SENTENCE_END = re.compile(r"[.!?][\"')\]]?$")
PARA_SECONDS = 40        # start a new paragraph at the first sentence end after this many seconds
PARA_MAX_SECONDS = 90    # ...or unconditionally after this many (captions without punctuation)
APIFY_ACTOR = "johnvc~YoutubeTranscripts"   # returns timed snippets; no daily cap on a paid token
# (starvibe~youtube-video-transcript also works but caps free use at 50 videos/day)


def mmss(ms: int) -> str:
    s = ms // 1000
    h, rem = divmod(s, 3600)
    m, sec = divmod(rem, 60)
    return f"{h}:{m:02d}:{sec:02d}" if h else f"{m:02d}:{sec:02d}"


# ---------------------------------------------------------------- fetchers --

def fetch_ytdlp(yt_id: str, cache: Path, sleep: float) -> list[tuple[int, str]] | None:
    out = cache / f"{yt_id}.en.json3"
    if not (out.exists() and out.stat().st_size > 0):
        cmd = [
            "yt-dlp", "--skip-download", "--write-auto-sub", "--sub-lang", "en",
            "--sub-format", "json3", "--no-warnings", "-o", str(cache / "%(id)s"),
            f"https://www.youtube.com/watch?v={yt_id}",
        ]
        got = False
        for attempt in range(3):
            r = subprocess.run(cmd, capture_output=True, text=True)
            if out.exists() and out.stat().st_size > 0:
                got = True
                break
            err = (r.stderr or r.stdout)[-300:].replace("\n", " ")
            if "429" in err or "Too Many Requests" in err:
                wait = 120 * (attempt + 1)
                print(f"    rate-limited; sleeping {wait}s", file=sys.stderr)
                time.sleep(wait)
                continue
            print(f"    yt-dlp: {err}", file=sys.stderr)
            return None
        time.sleep(sleep)
        if not got:
            return None
    d = json.loads(out.read_text(encoding="utf-8"))
    evs = []
    for e in d.get("events", []):
        segs = e.get("segs")
        if not segs:
            continue
        text = "".join(s.get("utf8", "") for s in segs)
        text = re.sub(r"\s+", " ", html.unescape(text).replace("\n", " ")).strip()
        if text:
            evs.append((int(e.get("tStartMs", 0)), text))
    return evs


def fetch_apify(yt_id: str, cache: Path, token: str, lang: str = "en") -> list[tuple[int, str]] | None:
    out = cache / f"{yt_id}.{lang}.apify.json" if lang != "en" else cache / f"{yt_id}.apify.json"
    if not (out.exists() and out.stat().st_size > 0):
        url = (f"https://api.apify.com/v2/acts/{APIFY_ACTOR}/run-sync-get-dataset-items"
               f"?token={token}&timeout=180")
        body = json.dumps({"youtube_url": f"https://www.youtube.com/watch?v={yt_id}", "languages": [lang]}).encode()
        req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=240) as resp:
                raw = resp.read()
        except Exception as ex:  # noqa: BLE001
            print(f"    apify: {ex}", file=sys.stderr)
            return None
        out.write_bytes(raw)
    try:
        items = json.loads(out.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        out.unlink(missing_ok=True)
        return None
    if not items or not isinstance(items, list):
        return None
    item = items[0]
    # johnvc: item["timestamped"] = [{text,start,duration}]; starvibe: item["transcript"] = [{text,start,end}]
    segs = item.get("timestamped") or item.get("transcript") or []
    if not segs:
        msg = item.get("error") or item.get("message") or "no transcript field"
        print(f"    apify: {msg}", file=sys.stderr)
        out.unlink(missing_ok=True)
        return None
    evs = []
    for s in segs:
        text = re.sub(r"\s+", " ", html.unescape(str(s.get("text", ""))).replace("\n", " ")).strip()
        if text:
            evs.append((int(float(s.get("start", 0)) * 1000), text))
    return evs


# --------------------------------------------------------------- formatting --

def to_paragraphs(evs: list[tuple[int, str]]) -> str:
    paras: list[str] = []
    buf: list[str] = []
    start = None
    for ms, text in evs:
        if start is None:
            start = ms
        # a speaker-change marker from YouTube gets its own paragraph break
        if text.startswith(">>") and buf:
            paras.append(f"**[{mmss(start)}]** " + " ".join(buf))
            buf, start = [], ms
        buf.append(text)
        elapsed = (ms - start) / 1000
        if (elapsed >= PARA_SECONDS and SENTENCE_END.search(text)) or elapsed >= PARA_MAX_SECONDS:
            paras.append(f"**[{mmss(start)}]** " + " ".join(buf))
            buf, start = [], None
    if buf:
        paras.append(f"**[{mmss(start or 0)}]** " + " ".join(buf))
    return "\n\n".join(paras)


def header_note(yt_id: str, label: str) -> str:
    today = dt.date.today().isoformat()
    return (
        f"*Auto-generated YouTube captions, pulled {today} with timestamps "
        f"([source](https://www.youtube.com/watch?v={yt_id})). "
        f"Cite a moment as `{label} @ mm:ss`; the link plus `&t=` seconds jumps straight to it. "
        f"Captions carry no speaker labels (`>>` appears only where YouTube marks a change) "
        f"and are **pointers, not proof** — verify in the primary text before quoting.*"
    )


def label_for(path: Path) -> str:
    """`046` for a Jesus Way episode, `tabor-66`, `kam-04`."""
    stem = path.stem
    num = re.match(r"(\d+)", stem)
    n = num.group(1) if num else stem
    folder = path.parent.name
    if folder == "the-jesus-way":
        return n
    if folder == "dr-tabor":
        return f"tabor-{n}"
    if folder == "kameron-waters":
        return f"kam-{n}"
    return f"{folder}-{n}"


def rewrite(path: Path, yt_id: str, body_transcript: str) -> None:
    text = path.read_text(encoding="utf-8")
    if MARKER in text:
        head = text.split(MARKER, 1)[0].rstrip()
        head = re.sub(r"\n-{3,}\s*$", "", head).rstrip()
    else:
        head = text.rstrip()
    new = f"{head}\n\n---\n\n{MARKER}\n\n{header_note(yt_id, label_for(path))}\n\n{body_transcript}\n"
    path.write_text(new, encoding="utf-8")


# -------------------------------------------------------------------- main --

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("files", nargs="+")
    ap.add_argument("--map", type=Path)
    ap.add_argument("--source", choices=["apify", "yt-dlp", "auto"], default="auto")
    ap.add_argument("--lang", default="en", help="caption language code (Apify path); e.g. es for Kam's Costa Rica video")
    ap.add_argument("--sleep", type=float, default=12)
    ap.add_argument("--only-missing", action="store_true")
    ap.add_argument("--min-events", type=int, default=20, help="fewest caption lines to accept (lower it for a short)")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--cache", type=Path, default=REPO / "scripts" / ".caption-cache")
    a = ap.parse_args()
    a.cache.mkdir(parents=True, exist_ok=True)

    token = os.environ.get("APIFY_TOKEN", "")
    source = a.source
    if source == "auto":
        source = "apify" if token else "yt-dlp"
    if source == "apify" and not token:
        print("APIFY_TOKEN is not set; use --source yt-dlp", file=sys.stderr)
        return 2
    print(f"caption source: {source}", file=sys.stderr)

    idmap: dict[str, str] = {}
    if a.map:
        raw = json.loads(a.map.read_text())
        idmap = {str(Path(k).resolve()): v for k, v in raw.items() if v}

    ok, skipped, failed = 0, [], []
    for i, f in enumerate(a.files):
        path = Path(f).resolve()
        if not path.exists() or re.match(r"(00-|readme|transcript-status|status\.)", path.name, re.I):
            continue
        text = path.read_text(encoding="utf-8")
        if a.only_missing and "**[0" in text.split(MARKER, 1)[-1][:600]:
            skipped.append(path.name)
            continue
        m = ID_RE.search(text)
        yt_id = m.group(1) if m else idmap.get(str(path))
        if not yt_id:
            failed.append((path.name, "no YouTube id"))
            print(f"[{i+1}/{len(a.files)}] {path.name}: no YouTube id", file=sys.stderr)
            continue
        print(f"[{i+1}/{len(a.files)}] {path.name}  ({yt_id})", file=sys.stderr)
        if source == "apify":
            evs = fetch_apify(yt_id, a.cache, token, a.lang)
            if evs is None:
                # a cached yt-dlp pull is just as good
                evs = fetch_ytdlp(yt_id, a.cache, 0) if (a.cache / f"{yt_id}.en.json3").exists() else None
        else:
            evs = fetch_ytdlp(yt_id, a.cache, a.sleep)
        if not evs:
            failed.append((path.name, "no captions"))
            continue
        if len(evs) < a.min_events:
            failed.append((path.name, f"only {len(evs)} caption events (use --min-events for a short)"))
            continue
        body = to_paragraphs(evs)
        if a.dry_run:
            print(body[:1200] + "\n...\n", file=sys.stderr)
        else:
            rewrite(path, yt_id, body)
        ok += 1

    print(f"\n{ok} rewritten, {len(skipped)} skipped, {len(failed)} failed", file=sys.stderr)
    for name, why in failed:
        print(f"  FAILED {name}: {why}", file=sys.stderr)
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
