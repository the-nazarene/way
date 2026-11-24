#!/usr/bin/env python3
"""The weekly answer review: what people asked, and the drafts they got.

Every written answer from search.nazareneway.com/answer is kept as a draft in
the D1 database `the-way-text` (table `answers`). This prints the last week's
drafts as a short Markdown packet, most-asked first, numbered by their id, so
Matt or Rex can reply with numbers. Approved answers are served again, free and
marked "checked by a person", to anyone asking the same thing; struck ones are
never served again.

  python scripts/answer-review.py                     # the packet: last 7 days of drafts
  python scripts/answer-review.py --days 14 > packet.md
  python scripts/answer-review.py --approve 3,5 --strike 4
  python scripts/answer-review.py --spend             # what answers have cost, by day

Needs CLOUDFLARE_SEARCH_TOKEN (D1 edit) in the env, as scripts/vectorize-sync.py
does; CLOUDFLARE_ACCOUNT_ID defaults to the account in site/search/wrangler.toml.
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.request

ACCOUNT = os.environ.get("CLOUDFLARE_ACCOUNT_ID") or "a7dc5999bd87dca2db4de77a5ac27e66"
TOKEN = os.environ.get("CLOUDFLARE_SEARCH_TOKEN", "")
DB = "bfab9f6f-bfce-4328-b0dc-dcb1fdd2da8c"  # the-way-text, as in site/search/wrangler.toml
URL = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/d1/database/{DB}/query"


def query(sql, params=()):
    body = json.dumps({"sql": sql, "params": list(params)}).encode("utf-8")
    req = urllib.request.Request(URL, data=body, method="POST",
                                 headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())["result"][0]["results"]
    except urllib.error.HTTPError as e:
        sys.exit(f"D1 → {e.code}: {e.read().decode('utf-8', 'replace')[:300]}")


def quote_line(item):
    if not item:
        return ""
    if item.get("ref"):
        return f"> {item.get('text', '')} — {item['ref']} (KJV)"
    return f"> {item.get('quote', '')} — {item.get('title', '')}"


def packet(days):
    rows = query(
        "SELECT id, created, question, asked, cost, answer FROM answers "
        "WHERE status = 'draft' AND created >= datetime('now', ?) ORDER BY asked DESC, id",
        (f"-{days} days",),
    )
    if not rows:
        print(f"No drafts in the last {days} days.")
        return
    total = sum(r["cost"] or 0 for r in rows)
    print(f"# Answers to review: last {days} days\n")
    print(f"{len(rows)} drafts, ${total:.2f} spent writing them. Reply with the numbers: "
          "approve 3, 5 · strike 4. Approved answers are served again, marked checked by a person.\n")
    for r in rows:
        out = json.loads(r["answer"])
        a = out.get("answer") or {}
        asked = f" · asked {r['asked']}×" if r["asked"] > 1 else ""
        print(f"## {r['id']}. {r['question']}{asked}\n")
        if out.get("card"):
            print(f"Card shown first: {out['card']['title']}\n")
        if a.get("answerable") is False:
            print(f"**Not settled in the library.** {a.get('short_answer', '')}\n")
            if a.get("background"):
                print(f"*General background:* {a['background']}\n")
        else:
            print(f"**{a.get('short_answer', '')}**\n")
            for w in a.get("jesus_words", []):
                print(quote_line(w) + "\n")
            print(f"*The usual reading:* {a.get('mainstream', '')}\n")
            print(f"*What the library finds:* {a.get('library_view', '')}\n")
            if a.get("against"):
                print("*The other way:*\n")
                print(quote_line(a["against"]) + "\n")
                if a["against"].get("note"):
                    print(a["against"]["note"] + "\n")
            if a.get("not_settled"):
                print(f"*Not settled:* {a['not_settled']}\n")
        if out.get("warnings"):
            print(f"(flags: {'; '.join(out['warnings'])})\n")


def ids(s):
    return [int(x) for x in s.replace(" ", "").split(",") if x]


def mark(status, numbers):
    for n in numbers:
        query("UPDATE answers SET status = ?, reviewed = datetime('now') WHERE id = ?", (status, n))
    print(f"{status}: {', '.join(map(str, numbers))}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--days", type=int, default=7)
    ap.add_argument("--approve", type=ids, default=[])
    ap.add_argument("--strike", type=ids, default=[])
    ap.add_argument("--spend", action="store_true", help="what written answers have cost, by day")
    args = ap.parse_args()
    if not TOKEN:
        sys.exit("Set CLOUDFLARE_SEARCH_TOKEN.")
    if args.spend:
        for r in query("SELECT day, usd, calls FROM answer_spend ORDER BY day DESC LIMIT 31"):
            print(f"{r['day']}  ${r['usd']:.3f}  {r['calls']} answers")
        return
    if args.approve:
        mark("approved", args.approve)
    if args.strike:
        mark("struck", args.strike)
    if not (args.approve or args.strike):
        packet(args.days)


if __name__ == "__main__":
    main()
