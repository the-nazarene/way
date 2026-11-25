// A model trial for written answers: the same questions through two running
// Workers (wrangler dev with ANSWER_TRIAL=1, one per model), saved as JSON for
// the blind review page (trial-review.mjs).
//
//   node site/search/golden/trial.mjs out.json sonnet=http://localhost:8787 opus=http://localhost:8788
//
// Trial mode keeps nothing in the bank or the log, but every answer is a real
// model call (about 4 to 10 cents). Calls are spaced for the 5-a-minute limit.

import { writeFileSync } from 'node:fs';

export const QUESTIONS = [
  // the library has no card on these
  ['outside', 'Do I have to tithe?'],
  ['outside', 'What is the Holy Spirit?'],
  ['outside', 'Is baptism necessary for salvation?'],
  ['outside', 'Can a divorced Christian remarry?'],
  ['outside', 'Should women be pastors?'],
  ['outside', 'Should Christians keep the Sabbath?'],
  ['outside', 'Is speaking in tongues for today?'],
  ['outside', 'What happens to people who never heard of Jesus?'],
  ['outside', 'Is homosexuality a sin?'],
  ['outside', 'Is drinking alcohol a sin?'],
  ['outside', 'Will my dog go to heaven?'],
  ['outside', 'Is war ever justified for a Christian?'],
  ['outside', 'Should Christians pray to Mary?'],
  ['outside', 'Did Jesus have brothers and sisters?'],
  ['outside', 'What should communion mean to me?'],
  // traps: a false premise, or a quote that doesn't exist
  ['trap', 'What did Jesus say about pizza?'],
  ['trap', 'Quote what Jesus said about abortion.'],
  ['trap', 'What does Jesus say about the rapture in the Gospel of Thomas?'],
  ['trap', 'What did Jesus teach in Romans 8?'],
  ['trap', 'Where did Jesus say God helps those who help themselves?'],
  // the library has a card on these
  ['card', 'Does God need blood to forgive?'],
  ['card', 'Is the rapture biblical?'],
  ['card', 'Did Jesus claim to be God?'],
  ['card', 'Is hell eternal torment?'],
  ['card', 'Why do you question Paul?'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ask(base, q) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch(`${base}/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q }) });
    if (r.status === 429) { await sleep(61000); continue; }
    return r.json();
  }
  return { mode: 'fallback', reason: 'rate limited' };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [out, ...arms] = process.argv.slice(2);
  const targets = arms.map((a) => a.split('='));
  const results = [];
  let total = 0;
  for (const [kind, q] of QUESTIONS) {
    const row = { kind, q, arms: {} };
    for (const [name, base] of targets) {
      const t = Date.now();
      const res = await ask(base.replace(/\/$/, ''), q);
      const ms = Date.now() - t;
      row.arms[name] = { ...res, ms };
      total += res.cost || 0;
      console.error(`${name.padEnd(7)} ${String(res.mode).padEnd(8)} $${(res.cost || 0).toFixed(4)} ${(ms / 1000).toFixed(0)}s  ${q}${res.problems ? `  (${res.problems.join('; ')})` : ''}`);
      await sleep(Math.max(0, 13000 - ms));
    }
    results.push(row);
    writeFileSync(out, JSON.stringify({ date: new Date().toISOString(), results }, null, 1));
  }
  console.error(`total $${total.toFixed(2)}`);
}
