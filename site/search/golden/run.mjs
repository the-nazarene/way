// The search test set: does the right card or verse come back in the top five?
//
//   node site/search/golden/run.mjs                                  # local `wrangler dev` (port 8787)
//   node site/search/golden/run.mjs https://search.nazareneway.com   # the live service
//   node site/search/golden/run.mjs <url> --out results.json         # keep every result
//
// Scoring, per question type (questions.json says which is which):
//   ref, phrase, offcard with a verse: the verse itself is among the top five
//     Sources (same KJV file, and the passage contains its **c:v** marker).
//   card: the card is among the top five Cards (and, reported apart, first).
//   offcard with no verse: not scored; the first card is recorded so a person
//     can see what a stranger's question lands on.
// Requests are spaced to stay under the service's 30-a-minute limit.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const outAt = args.indexOf('--out');
const outFile = outAt >= 0 ? args.splice(outAt, 2)[1] : null;
const base = (args[0] || 'http://localhost:8787').replace(/\/$/, '');
const GAP_MS = base.includes('localhost') ? 0 : 2200;
// The live service turns away clients that look like bots.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

const { questions } = JSON.parse(readFileSync(join(here, 'questions.json'), 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ask(q) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch(`${base}/search?q=${encodeURIComponent(q)}&group=all&limit=5`, { headers: { 'User-Agent': UA } });
    if (r.status === 429) { await sleep(61000); continue; }
    if (!r.ok) throw new Error(`${r.status} for "${q}"`);
    return r.json();
  }
  throw new Error(`still rate-limited on "${q}"`);
}

function score(item, res) {
  const row = { q: item.q, type: item.type, topCard: res.card[0]?.file || null };
  if (item.verse) {
    const mark = `**${item.verse}**`;
    row.verse = res.source.some((s) => s.file === item.source && (s.text || '').includes(mark));
  }
  if (item.card) {
    const want = `questions/${item.card}.md`;
    row.card5 = res.card.some((c) => c.file === want);
    row.card1 = res.card[0]?.file === want;
  }
  return row;
}

const rows = [];
for (const item of questions) {
  const res = await ask(item.q);
  const row = score(item, res);
  rows.push({ ...row, results: outFile ? res : undefined });
  const marks = [row.verse === undefined ? '' : row.verse ? 'verse ✓' : 'verse ✗',
    row.card5 === undefined ? '' : row.card5 ? (row.card1 ? 'card ✓ first' : 'card ✓') : 'card ✗']
    .filter(Boolean).join('  ');
  console.log(`${item.type.padEnd(7)} ${marks.padEnd(22)} ${item.q}`);
  await sleep(GAP_MS);
}

const pct = (n, d) => (d ? `${Math.round((100 * n) / d)}% (${n}/${d})` : '-');
const lines = ['', `Results against ${base}, ${new Date().toISOString().slice(0, 10)}`, '',
  '| Question type | Verse in top 5 Sources | Card in top 5 Cards | Card first |', '|---|---|---|---|'];
for (const t of ['ref', 'phrase', 'card', 'offcard']) {
  const of = rows.filter((r) => r.type === t);
  const v = of.filter((r) => r.verse !== undefined);
  const c = of.filter((r) => r.card5 !== undefined);
  lines.push(`| ${t} (${of.length}) | ${pct(v.filter((r) => r.verse).length, v.length)} | ${pct(c.filter((r) => r.card5).length, c.length)} | ${pct(c.filter((r) => r.card1).length, c.length)} |`);
}
const unscored = rows.filter((r) => r.type === 'offcard' && r.verse === undefined);
if (unscored.length) {
  lines.push('', 'Not scored (no card or verse expected); the first card each one lands on:');
  for (const r of unscored) lines.push(`- ${r.q} → ${r.topCard || 'no card'}`);
}
console.log(lines.join('\n'));
if (outFile) writeFileSync(outFile, JSON.stringify(rows, null, 1));
