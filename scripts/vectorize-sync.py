#!/usr/bin/env python3
"""
Vectorize Sync — keep the hosted search index (search.nazareneway.com) in
step with the repo.

The local index (`semantic-search.py`, Gemini + ChromaDB) is for people
working in a clone. This script feeds the public one: the same files, the
same chunks, embedded with Workers AI `bge-m3` and stored in Cloudflare
Vectorize, where the search Worker in `site/search/` reads them.

Run:
  python scripts/vectorize-sync.py --setup               # create the index (once)
  python scripts/vectorize-sync.py --all                 # embed every file
  python scripts/vectorize-sync.py --since <git-sha>     # only what changed since <sha>
  python scripts/vectorize-sync.py --all --dry-run       # count chunks, send nothing

Needs CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_SEARCH_TOKEN (Workers AI + Vectorize
edit) in the env. The GitHub Action in `.github/workflows/search-index.yml` runs
`--since` on every push to main, so nobody runs this by hand after the first build.

Chunking, provenance, and what gets skipped all come from semantic-search.py,
so the two indexes always cut the repo the same way.
"""

import argparse
import importlib.util
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location("semantic_search", HERE / "semantic-search.py")
ss = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(ss)

REPO_ROOT = ss.REPO_ROOT
INDEX_NAME = "the-way"
MODEL = "@cf/baai/bge-m3"
DIMENSIONS = 1024
EMBED_BATCH = 50
SITE = "https://nazareneway.com"
GITHUB_BLOB = "https://github.com/the-nazarene/way/blob/main"

# Not part of the public library: the site's own source and docs, and Rex's
# idea notes. Everything else semantic-search.py indexes, this indexes too.
EXTRA_SKIP_ROOT = {"site", "ideas"}

METADATA_MAX_BYTES = 9500   # Vectorize allows 10 KiB of metadata per vector
TEXT_MAX_CHARS = 2000
DELETE_BATCH = 100          # Vectorize refuses more than 100 ids per delete

ACCOUNT = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
TOKEN = os.environ.get("CLOUDFLARE_SEARCH_TOKEN", "")
API = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}"

YT_RE = re.compile(r"(?:youtube\.com/watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})")
STAMP_RE = re.compile(r"\*\*\[(?:(\d+):)?(\d{1,2}):(\d{2})\]\*\*")
H1_RE = re.compile(r"^#\s+(.+?)\s*$", re.M)
SPEAKERS_RE = re.compile(r"^\*\*Speakers?:\*\*\s*(.+?)\s*$", re.M)
CARD_SLUGS = {p.stem for p in (REPO_ROOT / "site" / "data" / "cards").glob("*.json")}


# ── What goes in ────────────────────────────────────────────────────────────

def in_scope(rel_path):
    return rel_path.split("/")[0] not in EXTRA_SKIP_ROOT


def group_of(rel_path):
    if rel_path.startswith("podcast-archive/"):
        return "talk"
    if rel_path.startswith("questions/") and Path(rel_path).stem in CARD_SLUGS:
        return "card"
    return "library"


def chunks_for(rel_path, text):
    """Chunks of one file, each with the metadata the Worker returns."""
    group = group_of(rel_path)
    title_m = H1_RE.search(text)
    title = title_m.group(1).strip() if title_m else Path(rel_path).stem
    source = ss.extract_provenance(text)
    speakers_m = SPEAKERS_RE.search(text[:3000])
    video_m = YT_RE.search(text[:5000]) if group == "talk" else None

    out = []
    for c in ss.chunk_markdown(text, REPO_ROOT / rel_path):
        meta = {
            "group": group,
            "file": rel_path,
            "line": c["start_line"],
            "title": title,
            "header": c["header"],
            "source": source,
            "text": c["text"][:TEXT_MAX_CHARS],
        }
        if speakers_m:
            meta["speakers"] = speakers_m.group(1)[:200]
        meta["url"] = link_for(rel_path, group, c, video_m)
        while len(json.dumps(meta).encode("utf-8")) > METADATA_MAX_BYTES:
            meta["text"] = meta["text"][: int(len(meta["text"]) * 0.8)]
        out.append({"id": c["id"], "text": c["text"], "metadata": meta})
    return out


def link_for(rel_path, group, chunk, video_m):
    """Where a result sends the reader: the second of the video for a talk,
    the card on the site for a card, the line on GitHub for everything else."""
    if group == "talk" and video_m:
        url = f"https://www.youtube.com/watch?v={video_m.group(1)}"
        stamp = STAMP_RE.search(chunk["text"])
        if stamp:
            h, m, s = (int(x) if x else 0 for x in stamp.groups())
            url += f"&t={h * 3600 + m * 60 + s}"
        return url
    if group == "card":
        return f"{SITE}/#/{Path(rel_path).stem}"
    return f"{GITHUB_BLOB}/{rel_path}#L{chunk['start_line']}"


def all_files():
    files, _ = ss.collect_files()
    return [ss.rel(f) for f in files if in_scope(ss.rel(f))]


def changed_since(sha):
    """(paths to (re)embed, chunk ids to delete) for everything that changed
    since <sha>. Old ids come from chunking the file as it was at <sha>, so the
    script needs no state of its own: git is the record of what's indexed."""
    diff = subprocess.run(
        ["git", "diff", "--name-status", "-M", sha, "HEAD", "--", "*.md"],
        cwd=REPO_ROOT, capture_output=True, text=True, check=True,
    ).stdout
    current = set(all_files())
    to_embed, old_paths = set(), set()
    for line in diff.splitlines():
        fields = line.split("\t")
        status, paths = fields[0], fields[1:]
        if status.startswith("R"):
            old_paths.add(paths[0])
            to_embed.add(paths[1])
        elif status.startswith("D"):
            old_paths.add(paths[0])
        else:
            old_paths.add(paths[0])
            to_embed.add(paths[0])
    to_embed &= current

    stale = set()
    for p in old_paths:
        old = subprocess.run(["git", "show", f"{sha}:{p}"], cwd=REPO_ROOT, capture_output=True)
        if old.returncode == 0:
            stale |= {c["id"] for c in ss.chunk_markdown(old.stdout.decode("utf-8", "replace"), REPO_ROOT / p)}
    return sorted(to_embed), stale


# ── Cloudflare ──────────────────────────────────────────────────────────────

def call(method, path, body=None, ndjson=False, tries=5):
    data = None
    headers = {"Authorization": f"Bearer {TOKEN}"}
    if body is not None:
        if ndjson:
            data = "\n".join(json.dumps(r) for r in body).encode("utf-8")
            headers["Content-Type"] = "application/x-ndjson"
        else:
            data = json.dumps(body).encode("utf-8")
            headers["Content-Type"] = "application/json"
    for attempt in range(tries):
        req = urllib.request.Request(API + path, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")[:500]
            if e.code in (429, 500, 502, 503, 504) and attempt < tries - 1:
                time.sleep(2 ** attempt)
                continue
            sys.exit(f"Cloudflare {method} {path} → {e.code}: {detail}")
        except urllib.error.URLError:
            if attempt < tries - 1:
                time.sleep(2 ** attempt)
                continue
            raise


def embed(texts):
    res = call("POST", f"/ai/run/{MODEL}", {"text": texts})["result"]
    vectors = res.get("data") or res.get("response")
    if not vectors or len(vectors) != len(texts):
        sys.exit(f"Unexpected embedding response: {str(res)[:300]}")
    return vectors


def setup():
    call("POST", "/vectorize/v2/indexes",
         {"name": INDEX_NAME, "config": {"dimensions": DIMENSIONS, "metric": "cosine"}})
    # Filters only see vectors inserted after their metadata index exists,
    # so this has to happen before the first upload.
    call("POST", f"/vectorize/v2/indexes/{INDEX_NAME}/metadata_index/create",
         {"propertyName": "group", "indexType": "string"})
    print(f"Created Vectorize index '{INDEX_NAME}' ({DIMENSIONS} dims, cosine) with a 'group' filter.")


def delete_ids(ids):
    ids = sorted(ids)
    for i in range(0, len(ids), DELETE_BATCH):
        call("POST", f"/vectorize/v2/indexes/{INDEX_NAME}/delete_by_ids", {"ids": ids[i:i + DELETE_BATCH]})
    if ids:
        print(f"  Removed {len(ids)} stale chunks")


def upload(chunks):
    started = time.time()
    for i in range(0, len(chunks), EMBED_BATCH):
        batch = chunks[i:i + EMBED_BATCH]
        vectors = embed([c["text"] for c in batch])
        call("POST", f"/vectorize/v2/indexes/{INDEX_NAME}/upsert",
             [{"id": c["id"], "values": v, "metadata": c["metadata"]} for c, v in zip(batch, vectors)],
             ndjson=True)
        done = i + len(batch)
        if done % 2000 < EMBED_BATCH or done == len(chunks):
            print(f"  {done}/{len(chunks)} chunks ({time.time() - started:.0f}s)")


# ── Main ────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(description="Sync the repo into the hosted search index.")
    mode = ap.add_mutually_exclusive_group(required=True)
    mode.add_argument("--setup", action="store_true", help="create the Vectorize index (once)")
    mode.add_argument("--all", action="store_true", help="embed every file")
    mode.add_argument("--since", metavar="SHA", help="embed only files changed since SHA")
    ap.add_argument("--dry-run", action="store_true", help="count, send nothing")
    args = ap.parse_args()

    if not args.dry_run and not (ACCOUNT and TOKEN):
        sys.exit("Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_SEARCH_TOKEN.")
    if args.setup:
        return setup()

    if args.all:
        paths, stale = all_files(), set()
    else:
        paths, stale = changed_since(args.since)

    chunks = []
    for p in paths:
        chunks += chunks_for(p, (REPO_ROOT / p).read_text(encoding="utf-8", errors="replace"))
    stale -= {c["id"] for c in chunks}   # unchanged chunks are overwritten, not deleted

    groups = {}
    for c in chunks:
        groups[c["metadata"]["group"]] = groups.get(c["metadata"]["group"], 0) + 1
    print(f"{len(paths)} files → {len(chunks)} chunks {groups}; {len(stale)} stale")
    if args.dry_run:
        return
    delete_ids(stale)
    upload(chunks)
    print("Done.")


if __name__ == "__main__":
    main()
