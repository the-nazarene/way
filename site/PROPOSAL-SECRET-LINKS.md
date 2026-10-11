# Proposal: secret links for saving desks

2026-10-10 · Rex · for Matt's decision. Also kept as a shared document, for comments.

Every saved desk gets its own private link instead of an account: no logins, no passwords, nothing lost when someone clears their browser, and it opens on any device. It fits inside Cloudflare's free plan. Because it would live on nazareneway.com, it needs Matt's OK.

## Why

Today a desk lives in one of two places, and both are fragile. Browser storage is wiped the moment someone clears their cookies and site data. A share link survives, but only if they kept it, and it is long enough to break in some messaging apps.

SAVE FILE (on the `desk-prototype` branch since 2026-10-10) is the stopgap: a desk downloads as a small file the person owns, and OPEN FILE brings it back on any computer. It works, but people have to remember to save, and the file doesn't follow them between devices. Secret links fix both without asking anyone to make an account.

## How it works

The link is the key, the same model Excalidraw uses for its shared drawings.

1. Someone presses **SAVE** on the Desk. Their browser makes a random key and encrypts the desk with it.
2. The encrypted desk goes to a small Cloudflare Worker, which stores it under a random id. The Worker never sees the key.
3. They get two links. The **edit link** holds the id, the key and a write token; the **view link** holds only the id and the key.
4. The key sits after the `#` in each link, and browsers never send that part to a server. Only someone holding a link can read the desk.
5. Opening a link, on any device, fetches the encrypted desk and decrypts it in the browser.
6. Saving again from an edit link updates the same desk, so the link people already have keeps working.

They bookmark the edit link, email it to themselves, or keep it in notes. Clearing the browser changes nothing.

## What lives where

| Piece | Where it lives | Who can read it |
| --- | --- | --- |
| The desk itself, encrypted | Cloudflare storage, under a random id | Nobody without a link, Cloudflare and us included |
| The key (AES-GCM, random per desk) | After the `#` in each link | Whoever holds a link |
| The write token | In the edit link only | Whoever holds the edit link |
| A list of every desk, or who saved what | Nowhere: there is no such list | Nobody |
| The Desk page and the cards | GitHub Pages, as today | Everyone, as today |

## Cost and limits

It costs nothing at our scale. The tight limit is saves, not storage.

| Free-plan allowance | Amount | What it means for us |
| --- | --- | --- |
| Worker requests | 100,000 a day | Every open and every save, combined |
| Storage reads | 100,000 a day | Opening saved desks |
| Storage writes | 1,000 a day | Saves. Save on the button, never automatically |
| Storage | 1 GB | The Essene desk is about 11 KB, so roughly 90,000 desks that size |

Limits reset daily at 00:00 UTC ([KV pricing](https://developers.cloudflare.com/kv/platform/pricing/), [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)). If saves ever pass 1,000 a day, the paid plan has a $5 a month minimum.

## Safeguards

A write endpoint on the open web will be poked at, so the Worker refuses more than it accepts.

- **Size cap:** a desk over 512 KB is refused. The Essene desk is 11 KB.
- **Rate limit:** a handful of saves per minute from one address, enforced in the Worker.
- **No listing:** the Worker answers only for an id it is given. Nobody can browse saved desks.
- **Unguessable links:** a 128-bit random id and a 128-bit key, so a link cannot be found by trying.
- **Only the edit link can change a desk.** Its write token is checked on every save, so the view link is safe to post publicly.
- **The cards stay verified.** A saved desk holds card references, not card text, so every source on it still comes from the build and keeps its stamp. Nothing on a desk can claim a source the repo doesn't hold.

## What it does not do

- **No "all my desks" page.** Each desk is its own link. A list across devices needs an identity: passwordless sign-in (passkeys or an emailed link) is the later step, only once people ask for it.
- **A lost edit link can't be recovered.** We hold no key, which is the point. SAVE FILE stays as the backup.
- **No live co-editing.** Two people can open the same edit link, but the last save wins. Real-time collaboration is a bigger build, and this doesn't preclude it.

## Decisions for Matt

- [ ] Host it on nazareneway.com: a Worker under a path such as `/api/desk`, beside the GitHub Pages site
- [ ] Use your Cloudflare account, which already runs the DNS for the domain
- [ ] Keep saved desks forever, or delete ones unopened for a year
- [ ] Rex and Claude build it on `desk-prototype`, with tests, for your review in PR #9 before anything goes live

Nothing is built until these are settled. Today's SAVE FILE needs no server and no decision.

## Sources

- [Cloudflare Workers KV pricing](https://developers.cloudflare.com/kv/platform/pricing/): the free-plan read, write and storage allowances, and the daily reset
- [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/): 100,000 requests a day on the free plan; the $5 a month paid minimum
- [Excalidraw, "End-to-End Encryption in the Browser"](https://plus.excalidraw.com/blog/end-to-end-encryption): the key after the `#` is never sent to the server; AES-GCM with a random key
