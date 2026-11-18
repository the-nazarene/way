#!/usr/bin/env python3
"""
Semantic Search — find content by meaning across The Way research collection.

Embeds every markdown file in the repo via Gemini Embedding and stores the
vectors in a local ChromaDB. Search by concept, not keyword:

    "what did Jesus say about the kingdom being within?"

...finds relevant passages across christianity/, gnosticism/, questions/,
podcast-archive/, and the rest.

Run:
  python scripts/semantic-search.py --rebuild            # Build/update index
  python scripts/semantic-search.py "your query"         # Search (top 5)
  python scripts/semantic-search.py "query" --top-k 10   # More results
  python scripts/semantic-search.py "query" --full       # Print whole chunks
  python scripts/semantic-search.py --stats              # Index size breakdown

Requires: pip install google-genai chromadb   +   GOOGLE_API_KEY in the env.
The index lives in .vector-db/ — a local build artifact, not committed.
"""

import os
import sys
import json
import argparse
import hashlib
import subprocess
import time
import re
from collections import Counter
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
VECTOR_DB_DIR = REPO_ROOT / ".vector-db"
METADATA_FILE = VECTOR_DB_DIR / "file_metadata.json"

GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")

# Directories to SKIP — everything else in the repo gets indexed, including
# christianity/, gnosticism/, extended-library/, jesus-site-reference/,
# podcast-archive/, questions/ and the root-level *.md orientation docs.
SKIP_DIRS = {
    ".git", ".claude", ".vector-db", ".venv",
    "node_modules", "__pycache__", "scripts",
}

# Skipped only at the repo ROOT. `/Incoming/` is gitignored local-only staging
# ("stays on Rex's laptop, never pushed/made public") — a rebuild uploads every
# indexed file to Google's embedding API, so it must never be walked. The
# tracked christianity/Incoming, dead-sea-scrolls/Incoming and
# gnosticism/Incoming primary-text folders are deliberately NOT affected.
# `inbox/` holds /nazbrain conversation notes that nobody has checked yet;
# they join the index once they're processed into the research files.
SKIP_ROOT_DIRS = {"Incoming", "inbox"}

# File patterns to skip anywhere in the path
SKIP_PATTERNS = [".DS_Store", ".pdf", ".html", ".png", ".jpg", ".jpeg", ".gif", ".svg"]

# Spanish mirrors of the jesusactuallysaid.com pages — indexing them would
# return duplicate hits for every English result.
SKIP_SUFFIXES = (".es.md",)

# Gemini Embedding settings
EMBED_MODEL = "gemini-embedding-001"
EMBED_DIMENSIONS = 768
BATCH_SIZE = 100          # docs per API call
RATE_LIMIT_PAUSE = 0.5    # seconds between batches
DELETE_BATCH = 5000       # ids per Chroma delete call
GET_PAGE = 5000           # rows per Chroma paged get
CHECKPOINT_EVERY = 10     # save file metadata every N batches

COLLECTION_NAME = "the-way"


# ── Chunking ────────────────────────────────────────────────────────────────

MIN_CHUNK_CHARS = 20       # discard slivers shorter than this
MAX_CHUNK_CHARS = 2000     # hard ceiling per embedded chunk, no overlap


def split_block(block, first_line, max_chunk_chars):
    """Split one block of text into <= max_chunk_chars pieces on line
    boundaries, yielding (piece_text, piece_start_line).

    This repo's podcast transcripts run 100-700 KB per file with few headers,
    so sections are SPLIT rather than truncated — truncating at 2000 chars
    (the upstream mr-pronoia behavior) silently dropped ~65% of the corpus.
    """
    lines = block.splitlines()
    buf, buf_len, buf_line = [], 0, first_line
    line_no = first_line

    for line in lines:
        # A single line longer than the ceiling gets hard-wrapped on
        # whitespace so no content is lost.
        if len(line) > max_chunk_chars:
            if buf:
                yield "\n".join(buf), buf_line
                buf, buf_len = [], 0
            words = line.split(" ")
            piece = ""
            for w in words:
                if piece and len(piece) + 1 + len(w) > max_chunk_chars:
                    yield piece, line_no
                    piece = w
                else:
                    piece = f"{piece} {w}" if piece else w
            if piece:
                buf, buf_len, buf_line = [piece], len(piece), line_no
            line_no += 1
            continue

        if buf and buf_len + 1 + len(line) > max_chunk_chars:
            yield "\n".join(buf), buf_line
            buf, buf_len, buf_line = [line], len(line), line_no
        else:
            buf.append(line)
            buf_len += len(line) + (1 if buf_len else 0)
            if len(buf) == 1:
                buf_line = line_no
        line_no += 1

    if buf:
        yield "\n".join(buf), buf_line


# Provenance keys recognized in a file's top-of-document metadata block,
# in priority order — the citation line is built from the first few found.
PROVENANCE_KEYS = [
    "Attribution", "Author", "Translation", "Translator", "Original Language",
    "Estimated Date", "Date", "Source", "Sources", "Type", "Status",
    # Who brought the material into the collection. Distinct from
    # Attribution/Author (who wrote the ancient text) — this is the
    # contributor, so credit and accountability travel with the passage.
    "Contributed by", "Added by",
]
PROV_LINE_RE = re.compile(r'^\*\*([A-Za-z][A-Za-z ]{0,24}):\*\*\s*(.+?)\s*$')
# Three provenance conventions are in use across the repo. Besides the bold
# `**Translation:** ...` block, the Nag Hammadi primary texts put the same
# information in a leading blockquote: `> Translation: Marvin Meyer, ...`.
# Matching only recognized keys keeps this from firing on ordinary prose.
PROV_QUOTE_RE = re.compile(r'^>\s*([A-Za-z][A-Za-z ]{0,24}):\s*(.+?)\s*$')
# Many research files instead close with an italic bibliography line:
#   *Sources: Hummel, The Rise and Fall of Dispensationalism (Eerdmans, 2023); ...*
PROV_TAIL_RE = re.compile(r'^\*Sources?:\s*(.+?)\*?\s*$')
NO_PROVENANCE = "(no source header — unverified provenance)"
PROV_MAX_CHARS = 300


def extract_provenance(text):
    """Pull the top-of-file metadata block into a single citation string.

    Research and primary-text files in this repo open with lines like
    `**Translation:** Rev. Peter Peterson (Ante-Nicene Fathers Vol 8, 1886)`.
    Carrying that into every chunk's metadata means a search result arrives
    with its own citation attached, instead of the citation living somewhere
    the reader has to go look for. Files with no such block are labelled
    explicitly, so missing provenance is visible rather than silent.
    """
    found = {}
    # Scan only the preamble: stop at the first H2/H3 or the first horizontal
    # rule, which is where the body reliably begins in this repo's files.
    for raw in text.splitlines()[:40]:
        line = raw.strip()
        if line.startswith(("## ", "### ")) or line == "---":
            break
        m = PROV_LINE_RE.match(line) or PROV_QUOTE_RE.match(line)
        if m:
            key, val = m.group(1).strip(), m.group(2).strip()
            if key in PROVENANCE_KEYS and key not in found:
                found[key] = val

    parts = [f"{k}: {found[k]}" for k in PROVENANCE_KEYS if k in found]

    # Fall back to (or supplement with) a closing italic bibliography line.
    if not parts:
        for raw in reversed(text.splitlines()[-25:]):
            m = PROV_TAIL_RE.match(raw.strip())
            if m:
                parts.append(f"Sources: {m.group(1).strip().rstrip('*')}")
                break

    if not parts:
        return NO_PROVENANCE

    citation = " · ".join(parts)
    if len(citation) > PROV_MAX_CHARS:
        citation = citation[:PROV_MAX_CHARS - 1].rstrip() + "…"
    return citation


def chunk_markdown(text, file_path, max_chunk_chars=MAX_CHUNK_CHARS):
    """Split markdown by H1/H2/H3 headers into semantic chunks.
    Sections longer than max_chunk_chars are split into sequential parts.
    Files without headers are chunked purely by size."""

    chunks = []

    def emit(block, header, first_line):
        block = block.strip("\n")
        if not block.strip() or len(block.strip()) <= MIN_CHUNK_CHARS:
            return
        pieces = list(split_block(block, first_line, max_chunk_chars))
        multi = len(pieces) > 1
        for n, (piece, line_no) in enumerate(pieces):
            if not piece.strip() or len(piece.strip()) <= MIN_CHUNK_CHARS:
                continue
            chunks.append({
                "text": piece.strip(),
                "header": f"{header} (part {n + 1}/{len(pieces)})" if multi else header,
                "start_line": line_no,
            })

    header_pattern = re.compile(r'^(#{1,3})\s+(.+)$', re.MULTILINE)
    matches = list(header_pattern.finditer(text))

    if matches:
        # Content before the first header (if any)
        if matches[0].start() > 0:
            emit(text[:matches[0].start()], "(intro)", 1)

        # Each header section, in document order
        for i, match in enumerate(matches):
            start = match.start()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            start_line = text[:start].count('\n') + 1
            emit(text[start:end], match.group(2).strip(), start_line)
    else:
        emit(text, "(full file)" if len(text) <= max_chunk_chars else "(chunk)", 1)

    # Tag each chunk with file info + a stable, per-file chunk index so that
    # chunk IDs are deterministic across runs (makes rebuilds idempotent and
    # an interrupted rebuild safely resumable).
    rel_path = rel(file_path)
    for idx, chunk in enumerate(chunks):
        chunk["file"] = rel_path
        chunk["id"] = chunk_id(rel_path, chunk["start_line"], chunk["header"], idx)

    return chunks


def chunk_id(rel_path, start_line, header, idx):
    """Deterministic MD5 id for a chunk."""
    return hashlib.md5(
        f"{rel_path}:{start_line}:{header}:{idx}".encode("utf-8")
    ).hexdigest()


# ── Embedding / DB ──────────────────────────────────────────────────────────

def get_embeddings(texts):
    """Embed a batch of texts via Gemini Embedding."""
    from google import genai

    client = genai.Client(api_key=GOOGLE_API_KEY)
    result = client.models.embed_content(
        model=EMBED_MODEL,
        contents=texts,
        config={"output_dimensionality": EMBED_DIMENSIONS},
    )
    return [e.values for e in result.embeddings]


def get_collection():
    """Get or create the ChromaDB collection."""
    import chromadb

    db = chromadb.PersistentClient(path=str(VECTOR_DB_DIR))
    return db.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


# ── Index ───────────────────────────────────────────────────────────────────

def rel(path):
    """Repo-relative path, forward slashes (stable across OSes)."""
    return Path(path).resolve().relative_to(REPO_ROOT).as_posix()


def should_skip(path):
    """Check if a file should be skipped on name/extension grounds."""
    name = path.name
    if name.endswith(SKIP_SUFFIXES):
        return True
    path_str = str(path)
    return any(p in path_str for p in SKIP_PATTERNS)


def git_ignored(paths):
    """Return the subset of paths that git ignores.

    A rebuild uploads the text of every indexed file to Google's embedding
    API, so "don't publish this" and "don't index this" need to be the same
    switch. Honouring .gitignore makes it one: if git won't push a file, we
    won't send it either. That lets anyone keep an in-copyright book inside
    their own clone — gitignored, readable by Obsidian and by an AI assistant
    locally — with no risk of it leaving the machine.

    One `git check-ignore --stdin` call for the whole list. If git is missing
    or errors, returns an empty set and the SKIP_DIRS/SKIP_ROOT_DIRS lists
    remain the backstop.
    """
    if not paths:
        return set()
    rels = [p.resolve().relative_to(REPO_ROOT).as_posix() for p in paths]
    try:
        # NUL-separated in and out (-z). On Windows, text-mode stdin would
        # translate "\n" to "\r\n", and git would take the stray "\r" as part
        # of the filename — then quote the result, so nothing ever matched.
        # NUL separators avoid newline translation and git's path quoting.
        proc = subprocess.run(
            ["git", "check-ignore", "--stdin", "-z"],
            input="\0".join(rels).encode("utf-8"),
            cwd=str(REPO_ROOT),
            capture_output=True, timeout=60,
        )
    except (OSError, subprocess.SubprocessError):
        print("  Note: git unavailable — cannot honour .gitignore while indexing")
        return set()
    # Exit 0 = some ignored, 1 = none ignored. Anything else is a real failure.
    if proc.returncode not in (0, 1):
        print("  Note: git check-ignore failed — proceeding without .gitignore filtering")
        return set()
    out = proc.stdout.decode("utf-8", errors="replace")
    return {part for part in out.split("\0") if part.strip()}


def collect_files():
    """Walk the repo and collect all .md files, skipping blacklisted dirs
    and anything .gitignore excludes."""
    candidates = []
    skipped_es = 0
    for f in REPO_ROOT.rglob("*.md"):
        parts = f.relative_to(REPO_ROOT).parts
        if any(part in SKIP_DIRS for part in parts):
            continue
        if len(parts) > 1 and parts[0] in SKIP_ROOT_DIRS:
            continue
        if f.name.endswith(SKIP_SUFFIXES):
            skipped_es += 1
            continue
        if should_skip(f):
            continue
        if not f.is_file():
            continue
        candidates.append(f)

    ignored = git_ignored(candidates)
    files = [f for f in candidates
             if f.resolve().relative_to(REPO_ROOT).as_posix() not in ignored]
    if ignored:
        print(f"  Skipped {len(ignored)} gitignored file(s) — local-only, never sent to the API")
    return sorted(files), skipped_es


def load_metadata():
    """Load file-hash tracking for incremental rebuilds."""
    if METADATA_FILE.exists():
        try:
            return json.loads(METADATA_FILE.read_text(encoding="utf-8"))
        except (ValueError, OSError):
            print("  Warning: file_metadata.json unreadable — treating index as empty")
    return {}


def save_metadata(meta):
    """Save file-hash tracking."""
    METADATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    METADATA_FILE.write_text(json.dumps(meta, indent=2, sort_keys=True), encoding="utf-8")


def file_hash(path):
    """Content hash for change detection."""
    return hashlib.md5(path.read_bytes()).hexdigest()


def delete_file_chunks(collection, rel_paths):
    """Remove every stored chunk belonging to the given repo-relative paths."""
    ids_to_remove = []
    for rp in rel_paths:
        try:
            try:
                # Ask for ids only when the installed chromadb allows it.
                results = collection.get(where={"file": rp}, include=[])
            except Exception:
                results = collection.get(where={"file": rp})
            if results and results.get("ids"):
                ids_to_remove.extend(results["ids"])
        except Exception as e:
            print(f"  Warning: could not list existing chunks for {rp}: {e}")

    for i in range(0, len(ids_to_remove), DELETE_BATCH):
        collection.delete(ids=ids_to_remove[i:i + DELETE_BATCH])

    return len(ids_to_remove)


def embed_with_retry(texts, label):
    """Embed one batch, backing off on rate limits. Returns None on failure."""
    for attempt in range(5):
        try:
            return get_embeddings(texts)
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                delay_match = re.search(
                    r'retry.*?(\d+(?:\.\d+)?)s', err_str, re.IGNORECASE
                )
                wait = float(delay_match.group(1)) + 1 if delay_match else (2 ** attempt) * 5
                print(f"  Rate limited, waiting {wait:.0f}s (attempt {attempt + 1}/5)...")
                time.sleep(wait)
            else:
                print(f"  Embedding error: {e}")
                if attempt < 4:
                    time.sleep(2)
    print(f"  Giving up on {label}")
    return None


def rebuild_index():
    """Build or incrementally update the vector index."""
    if not GOOGLE_API_KEY:
        print("ERROR: GOOGLE_API_KEY not set")
        sys.exit(1)

    VECTOR_DB_DIR.mkdir(parents=True, exist_ok=True)
    collection = get_collection()
    meta = load_metadata()

    all_files, skipped_es = collect_files()
    current_paths = {rel(f) for f in all_files}
    total_bytes = sum(f.stat().st_size for f in all_files)
    print(f"Scanned repo: {len(all_files)} markdown files "
          f"({total_bytes / 1_048_576:.1f} MB)"
          + (f", skipped {skipped_es} *.es.md mirrors" if skipped_es else ""))

    # Determine what changed
    new_files, changed_files = [], []
    unchanged = 0
    hashes = {}
    for f in all_files:
        rp = rel(f)
        h = file_hash(f)
        hashes[rp] = h
        if rp not in meta:
            new_files.append(f)
        elif meta[rp] != h:
            changed_files.append(f)
        else:
            unchanged += 1

    deleted = sorted(set(meta.keys()) - current_paths)
    to_process = new_files + changed_files

    print(f"  New: {len(new_files)}  Changed: {len(changed_files)}  "
          f"Unchanged: {unchanged}  Deleted: {len(deleted)}")

    # Clear stale chunks: deleted files, plus everything we're about to
    # re-embed (covers shrunk files and partially-embedded resumes).
    stale_targets = list(deleted) + [rel(f) for f in to_process]
    if stale_targets:
        removed = delete_file_chunks(collection, stale_targets)
        if removed:
            print(f"  Removed {removed} stale chunks")

    for rp in deleted:
        del meta[rp]

    if not to_process:
        print("Index is up to date — nothing to do.")
        save_metadata(meta)
        print(f"Index has {collection.count()} total chunks.")
        return

    # Chunk everything that needs embedding
    print(f"Chunking {len(to_process)} files...")
    all_chunks = []
    for n, f in enumerate(to_process, 1):
        try:
            text = f.read_text(encoding="utf-8", errors="replace")
            chunks = chunk_markdown(text, f)
            if chunks:
                # Attach the file's citation to every chunk from it, so a
                # search hit can never come back without its provenance.
                provenance = extract_provenance(text)
                for c in chunks:
                    c["source"] = provenance
                all_chunks.extend(chunks)
            else:
                # Empty/trivial file: nothing to embed, but record the hash so
                # it doesn't show up as "new" on every subsequent run.
                meta[rel(f)] = hashes[rel(f)]
        except Exception as e:
            print(f"  Warning: skipping {f.name}: {e}")
            # Don't record a hash for a file we failed to read — retry next run.
            hashes.pop(rel(f), None)
        if n % 25 == 0 or n == len(to_process):
            print(f"  Chunked {n}/{len(to_process)} files "
                  f"→ {len(all_chunks)} chunks so far")

    if not all_chunks:
        print("Nothing to embed.")
        save_metadata(meta)
        return

    total_batches = (len(all_chunks) + BATCH_SIZE - 1) // BATCH_SIZE
    print(f"{len(all_chunks)} chunks to embed in {total_batches} batches "
          f"of up to {BATCH_SIZE}")

    # Per-file chunk counters so a file's hash is only recorded once every
    # one of its chunks has landed in the DB.
    pending = Counter(c["file"] for c in all_chunks)

    started = time.time()
    total_embedded = 0
    failed_batches = 0

    for bi in range(total_batches):
        i = bi * BATCH_SIZE
        batch = all_chunks[i:i + BATCH_SIZE]
        texts = [c["text"] for c in batch]

        embeddings = embed_with_retry(texts, f"batch {bi + 1}/{total_batches}")

        if embeddings is None:
            failed_batches += 1
            for c in batch:
                # Mark the owning file as incomplete so it is retried next run.
                pending[c["file"]] += 1_000_000
            continue

        collection.upsert(
            ids=[c["id"] for c in batch],
            embeddings=embeddings,
            documents=texts,
            metadatas=[{
                "file": c["file"],
                "header": c["header"],
                "start_line": c["start_line"],
                "source": c.get("source", NO_PROVENANCE),
            } for c in batch],
        )

        total_embedded += len(batch)
        for c in batch:
            pending[c["file"]] -= 1
            if pending[c["file"]] == 0 and c["file"] in hashes:
                meta[c["file"]] = hashes[c["file"]]

        elapsed = time.time() - started
        rate = total_embedded / elapsed if elapsed > 0 else 0
        remaining = (len(all_chunks) - total_embedded) / rate if rate > 0 else 0
        pct = min(100, int(total_embedded / len(all_chunks) * 100))
        print(f"  Batch {bi + 1}/{total_batches} — "
              f"{total_embedded}/{len(all_chunks)} chunks ({pct}%), "
              f"~{remaining / 60:.1f} min left")

        # Checkpoint so an interrupted rebuild resumes where it left off.
        if (bi + 1) % CHECKPOINT_EVERY == 0:
            save_metadata(meta)

        if bi + 1 < total_batches:
            time.sleep(RATE_LIMIT_PAUSE)

    save_metadata(meta)

    print(f"\nDone in {(time.time() - started) / 60:.1f} min. "
          f"Index has {collection.count()} total chunks.")
    if failed_batches:
        print(f"WARNING: {failed_batches} batch(es) failed. "
              f"Re-run --rebuild to retry the affected files.")


# ── Stats ───────────────────────────────────────────────────────────────────

def show_stats():
    """Print collection size and per-top-level-folder chunk counts."""
    if not VECTOR_DB_DIR.exists():
        print("No index found. Run with --rebuild first.")
        sys.exit(1)

    collection = get_collection()
    total = collection.count()

    print(f"\n{'─' * 60}")
    print(f"  Collection: {COLLECTION_NAME}")
    print(f"  Location:   {VECTOR_DB_DIR}")
    print(f"  Chunks:     {total}")
    print(f"{'─' * 60}\n")

    if total == 0:
        print("  Index is empty. Run with --rebuild first.\n")
        return

    folder_chunks = Counter()
    folder_files = {}
    offset = 0
    while offset < total:
        page = collection.get(
            limit=GET_PAGE, offset=offset, include=["metadatas"]
        )
        metas = page.get("metadatas") or []
        if not metas:
            break
        for m in metas:
            rp = (m or {}).get("file", "(unknown)")
            folder = rp.split("/")[0] if "/" in rp else "(root)"
            folder_chunks[folder] += 1
            folder_files.setdefault(folder, set()).add(rp)
        offset += len(metas)

    width = max((len(f) for f in folder_chunks), default=10)
    print(f"  {'folder'.ljust(width)}   chunks    files")
    print(f"  {'-' * width}   ------    -----")
    for folder, count in sorted(folder_chunks.items(), key=lambda kv: -kv[1]):
        print(f"  {folder.ljust(width)}   {count:6d}   {len(folder_files[folder]):6d}")
    print(f"  {'-' * width}   ------    -----")
    print(f"  {'TOTAL'.ljust(width)}   {sum(folder_chunks.values()):6d}   "
          f"{sum(len(v) for v in folder_files.values()):6d}")

    meta = load_metadata()
    print(f"\n  Tracked files in file_metadata.json: {len(meta)}\n")


# ── Search ──────────────────────────────────────────────────────────────────

def search(query, top_k=5, full=False):
    """Search the index by meaning."""
    if not GOOGLE_API_KEY:
        print("ERROR: GOOGLE_API_KEY not set")
        sys.exit(1)

    if not VECTOR_DB_DIR.exists():
        print("No index found. Run with --rebuild first.")
        sys.exit(1)

    collection = get_collection()
    if collection.count() == 0:
        print("Index is empty. Run with --rebuild first.")
        sys.exit(1)

    query_embedding = get_embeddings([query])[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
    )

    if not results["ids"][0]:
        print("No results found.")
        return

    print(f"\n{'─' * 60}")
    print(f"  Search: \"{query}\"  (top {top_k})")
    print(f"{'─' * 60}\n")

    for i, (doc, meta, dist) in enumerate(zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    )):
        score = 1 - dist
        file_path = meta["file"]
        header = meta["header"]
        start_line = meta.get("start_line", "?")

        source = meta.get("source") or NO_PROVENANCE

        print(f"  {i + 1}. [{score:.3f}]  {file_path}:{start_line}")
        print(f"     Section: {header}")
        print(f"     Source:  {source}")

        if full:
            print()
            for line in doc.splitlines():
                print(f"     {line}")
            print(f"     {'·' * 50}")
        else:
            excerpt = " ".join(doc.split())
            if len(excerpt) > 200:
                excerpt = excerpt[:200] + "..."
            print(f"     {excerpt}")
        print()


# ── CLI ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Semantic search for The Way research collection",
        usage="%(prog)s [--rebuild | --stats | query] [--top-k N] [--full]",
    )
    parser.add_argument("query", nargs="?", help="Search query")
    parser.add_argument("--rebuild", action="store_true",
                        help="Build or incrementally update the vector index")
    parser.add_argument("--stats", action="store_true",
                        help="Print index size and per-folder chunk counts")
    parser.add_argument("--top-k", type=int, default=5,
                        help="Number of results to return (default: 5)")
    parser.add_argument("--full", action="store_true",
                        help="Print the whole matched chunk, not a 200-char excerpt")

    args = parser.parse_args()

    if args.rebuild:
        rebuild_index()
    elif args.stats:
        show_stats()
    elif args.query:
        search(args.query, top_k=args.top_k, full=args.full)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
