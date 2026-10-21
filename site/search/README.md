# Search service: search.nazareneway.com

The whole repo, searchable by meaning, for people who don't have a clone. Proposal and costs: `site/PROPOSAL-SEMANTIC-SEARCH.md`.

One Cloudflare Worker, two doors:

| Door | Address | Used by |
| --- | --- | --- |
| Search box | `GET /search?q=…&group=all\|card\|library\|talk&limit=5` | The Reading Room (`site/src/app.js`, the "whole library" panel under the drawer) |
| MCP connector | `POST /mcp`, one tool: `search_the_way` | Anyone who adds `https://search.nazareneway.com/mcp` as a connector in Claude or ChatGPT |

Both return passages with their file, line, source header and link (talks link to the second of the video), grouped as cards, texts and research, and talks. Nothing is generated.

## How it fits together

- **Index:** Cloudflare Vectorize index `the-way` (1,024 dims, cosine, filterable by `group`), on Matt's Cloudflare account.
- **Embeddings:** Workers AI `@cf/baai/bge-m3`, for the passages and for each question.
- **Filling it:** `scripts/vectorize-sync.py`, using the same chunking and skip rules as `scripts/semantic-search.py`, minus `site/` and `ideas/`.
- **Keeping it current:** `.github/workflows/search-index.yml` runs `--since <previous commit>` on every push to `main` that touches Markdown. It needs the repo secret `CLOUDFLARE_SEARCH_TOKEN`. Running the workflow by hand re-embeds everything.
- **Limits:** 30 requests a minute per address (the `LIMITER` binding).

## Working on it

```bash
node --test site/search/test/*.test.mjs        # unit tests, no account needed

cd site/search
CLOUDFLARE_API_TOKEN=$CLOUDFLARE_SEARCH_TOKEN npx wrangler@4 deploy

python scripts/vectorize-sync.py --all --dry-run   # what would be indexed
```

The token needs Workers Scripts, Workers Routes and DNS (nazareneway.com), Workers AI and Vectorize, all edit. `wrangler.toml` pins the account id: without it wrangler can deploy to another account on the same login.
