// Run: node --test site/search/test/*.test.mjs
// The answer step's checks, budget and bank, against stand-ins: no Anthropic
// call, no Cloudflare account. The KJV is read from the repo's own files.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { check, norm, canSpend, costOf, normQuestion, cosine, packFor, answer } from '../src/answer.js';
import worker from '../src/index.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

// lookupVerses, reading the held KJV from disk instead of GitHub.
async function lookup(refs) {
  return refs.map((r) => {
    const lines = readFileSync(join(root, r.file), 'utf8').split('\n');
    const got = [];
    for (let v = r.from; v <= r.to; v++) {
      const i = lines.findIndex((l) => l.startsWith(`**${r.chapter}:${v}**`));
      if (i < 0) break;
      got.push({ line: i + 1, text: lines[i] });
    }
    if (!got.length) return null;
    const span = got.length > 1 ? `${r.chapter}:${r.from}-${r.from + got.length - 1}` : `${r.chapter}:${r.from}`;
    return { header: `${r.book} ${span} (KJV)`, url: `https://x/${r.file}#L${got[0].line}`, text: got.map((g) => g.text).join('\n') };
  }).filter(Boolean);
}

const passages = [
  { n: 1, kind: 'card', title: 'Card', header: 'H', url: 'u1', text: 'The cross did not open a door that Mark 2 shows already open.' },
  { n: 2, kind: 'source', title: 'Thomas', header: 'Saying 14', url: 'u2', text: '**14** Jesus said to them, If you fast, you will give rise to sin for yourselves.' },
  { n: 3, kind: 'research', title: 'Notes', header: 'H', url: 'u3', text: 'Our own notes say something.' },
];

const good = () => ({
  answerable: true,
  card_match: true,
  short_answer: 'No. Jesus forgives directly.',
  jesus_words: [{ ref: 'Mark 2:5' }, 'Matthew 6:14-15'],
  mainstream: 'Most Christians read the cross as the price of forgiveness.',
  library_view: 'The card holds that Jesus forgave before the cross [1].',
  supporting: [{ passage: 1, quote: 'the cross did not open a door' }],
  against: { ref: 'Hebrews 9:22', note: 'The strongest text on the other side.' },
  not_settled: '',
});

test('verses are pasted from the KJV, not typed by the model', async () => {
  const { answer: a, problems } = await check(good(), passages, lookup);
  assert.deepEqual(problems, []);
  assert.equal(a.jesus_words[0].ref, 'Mark 2:5');
  assert.match(a.jesus_words[0].text, /^When Jesus saw their faith, he said unto the sick of the palsy, Son, thy sins be forgiven thee\.$/);
  assert.equal(a.jesus_words[1].ref, 'Matthew 6:14-15');           // a bare string is a reference
  assert.match(a.against.text, /without shedding of blood is no remission/);
  assert.equal(a.against.note, 'The strongest text on the other side.');
});

test('a reference the KJV does not have, or a whole chapter, fails', async () => {
  for (const ref of ['Mark 99:1', 'Psalm 23', 'John 3:1-20']) {
    const raw = { ...good(), jesus_words: [{ ref }] };
    const { problems } = await check(raw, passages, lookup);
    assert.ok(problems.some((p) => /verse reference not found/.test(p)), ref);
  }
});

test('a quotation must be word for word from its passage', async () => {
  let raw = { ...good(), against: { passage: 2, quote: 'if you fast you will sin', note: 'x' } };
  const { problems } = await check(raw, passages, lookup);
  assert.ok(problems.some((p) => /not word for word/.test(p)));
  // a supporting one that fails is left out and flagged, not fatal
  raw = { ...good(), supporting: [{ passage: 1, quote: 'the cross opened no door' }, 'Matthew 5:43-48'] };
  const res = await check(raw, passages, lookup);
  assert.deepEqual(res.problems, []);
  assert.ok(res.warnings.some((w) => /not word for word/.test(w)));
  assert.deepEqual(res.answer.supporting.map((w) => w.ref), ['Matthew 5:43-48']);
  assert.ok(norm('“If you fast,”  you **14:2** WILL').includes('"if you fast," you will'));
});

test("Jesus's words and the other side come from held sources, not cards or notes", async () => {
  let { problems } = await check({ ...good(), jesus_words: [{ passage: 1, quote: 'the cross did not open a door' }] }, passages, lookup);
  assert.ok(problems.some((p) => /card passage/.test(p)));
  ({ problems } = await check({ ...good(), against: { passage: 3, quote: 'Our own notes say something', note: 'x' } }, passages, lookup));
  assert.ok(problems.some((p) => /research passage/.test(p)));
  const noOther = await check({ ...good(), against: { note: 'The library holds no text against this.' } }, passages, lookup);
  assert.deepEqual(noOther.problems, []);
  assert.ok(noOther.warnings.includes('no passage on the other side'));
  ({ problems } = await check({ ...good(), jesus_words: [{ passage: 2, quote: 'If you fast, you will give rise to sin' }] }, passages, lookup));
  assert.deepEqual(problems, []);                                    // Thomas is a held source
});

test('prose carries no quotation marks; background carries no texts', async () => {
  let { problems } = await check({ ...good(), library_view: 'He said "go and learn" [1].' }, passages, lookup);
  assert.ok(problems.some((p) => /quotation marks/.test(p)));
  const thin = { ...good(), answerable: false, against: { note: '' }, background: 'Christians speak of the Spirit as present at Pentecost.' };
  ({ problems } = await check(thin, passages, lookup));
  assert.deepEqual(problems, []);
  ({ problems } = await check({ ...thin, background: 'Acts 2:4 says they were filled.' }, passages, lookup));
  assert.ok(problems.some((p) => /background/.test(p)));
  ({ problems } = await check({ ...thin, background: 'Christians call it the "Comforter".' }, passages, lookup));
  assert.ok(problems.some((p) => /background/.test(p)));
});

test("Jesus's words are from a book where he speaks; supporting quotes are never our research", async () => {
  let { problems } = await check({ ...good(), jesus_words: [{ ref: 'Romans 3:23' }] }, passages, lookup);
  assert.ok(problems.some((p) => /where Jesus speaks/.test(p)));
  ({ problems } = await check({ ...good(), jesus_words: [{ ref: '1 John 4:8' }] }, passages, lookup));
  assert.ok(problems.some((p) => /where Jesus speaks/.test(p)));
  const { answer: a, warnings } = await check({ ...good(), supporting: [{ passage: 3, quote: 'Our own notes say something' }] }, passages, lookup);
  assert.deepEqual(a.supporting, []);
  assert.ok(warnings.some((w) => /our research/.test(w)));
});

test('the lens section: tagged, unquoted, verses pasted', async () => {
  const thin = { ...good(), answerable: false, against: { note: '' } };
  const lens = { text: 'Jesus ranked the Law by its weightier matters [L15], so a tithe is kept without neglecting mercy [L1].', verses: [{ ref: 'Matthew 23:23' }, { ref: 'Nowhere 9:9' }] };
  let { answer: a, problems, warnings } = await check({ ...thin, lens }, passages, lookup);
  assert.deepEqual(problems, []);
  assert.equal(a.lens.verses.length, 1);
  assert.match(a.lens.verses[0].text, /tithe of mint/);
  assert.ok(warnings.some((w) => /Nowhere/.test(w)));
  ({ problems } = await check({ ...thin, lens: { text: 'He said "pay tithes" [L15].' } }, passages, lookup));
  assert.ok(problems.some((p) => /quotation marks in the lens/.test(p)));
  ({ problems } = await check({ ...thin, lens: { text: 'Matthew 23:23 settles it [L15].' } }, passages, lookup));
  assert.ok(problems.some((p) => /verse number in the lens/.test(p)));
  ({ problems } = await check({ ...thin, lens: { text: 'Mercy outranks ritual.' } }, passages, lookup));
  assert.ok(problems.some((p) => /names no lens point/.test(p)));
  ({ problems } = await check({ ...thin, lens: { text: 'Mercy outranks ritual [L99].' } }, passages, lookup));
  assert.ok(problems.some((p) => /L99/.test(p)));
  ({ answer: a, problems } = await check({ ...good(), lens: { text: '  ' } }, passages, lookup));
  assert.deepEqual(problems, []);
  assert.equal(a.lens, undefined);
});

test('citations, length and first person', async () => {
  let { problems, warnings } = await check({ ...good(), library_view: 'See [9].' }, passages, lookup);
  assert.ok(problems.some((p) => /\[9\]/.test(p)));
  ({ problems } = await check({ ...good(), library_view: 'word '.repeat(300) }, passages, lookup));
  assert.ok(problems.some((p) => /too long/.test(p)));
  ({ problems, warnings } = await check({ ...good(), short_answer: 'I think not.' }, passages, lookup));
  assert.deepEqual(problems, []);
  assert.ok(warnings.some((w) => /first person/.test(w)));
});

// A D1 stand-in that knows only the statements the budget runs.
function spendDb(today, month) {
  return {
    prepare: (sql) => ({
      bind: () => ({
        first: async () => (/WHERE day = \?/.test(sql) ? (today == null ? null : { usd: today }) : { usd: month }),
      }),
    }),
  };
}

test('the budget: a day share of the month, and the month itself', async () => {
  const env = { ANSWER_MONTHLY_USD: '10' };
  assert.equal(await canSpend(spendDb(null, 0), env), true);
  assert.equal(await canSpend(spendDb(0.25, 3), env), true);          // 0.25 + 0.05 <= 0.333
  assert.equal(await canSpend(spendDb(0.3, 3), env), false);          // today's share is spent
  assert.equal(await canSpend(spendDb(0, 9.97), env), false);         // the month is spent
  assert.equal(Math.round(costOf({ input_tokens: 10000, output_tokens: 1000 }) * 1000) / 1000, 0.03);
});

test('the bank: question normalising and closeness', () => {
  assert.equal(normQuestion('  Does GOD need blood to forgive?? '), 'does god need blood to forgive');
  assert.equal(cosine([1, 0], [1, 0]), 1);
  assert.equal(cosine([1, 0], [0, 1]), 0);
});

test('the pack: talks never go to the model, and repeat talks show once', () => {
  const item = (file, line, title = file) => ({ file, line, title, header: 'H', url: `u/${file}`, text: 't' });
  const r1 = {
    card: [item('c1', 1), item('c2', 1), item('c3', 1)],
    source: [item('s1', 1), item('s1', 1)],
    research: [item('r1', 1)],
    talk: [item('t1', 1, 'Ep 1'), item('t1', 9, 'Ep 1'), item('t2', 1, 'Ep 2')],
  };
  const { passages: p, talks } = packFor(r1, { source: [item('s2', 1)] });
  assert.deepEqual(p.map((x) => x.kind), ['card', 'card', 'source', 'source', 'research']);
  assert.deepEqual(p.map((x) => x.n), [1, 2, 3, 4, 5]);
  assert.deepEqual(talks.map((t) => t.title), ['Ep 1', 'Ep 2']);
});

test('/answer does not exist without the token', async () => {
  const env = { ASK_TOKEN: 'secret', LIMITER: { limit: async () => ({ success: true }) } };
  const ask = (headers) => worker.fetch(new Request('https://s/answer', { method: 'POST', headers, body: '{"q":"x"}' }), env);
  assert.equal((await ask({})).status, 404);
  assert.equal((await ask({ 'X-Ask-Token': 'wrong' })).status, 404);
  assert.equal((await worker.fetch(new Request('https://s/answer', { method: 'POST', body: '{}' }), {})).status, 404);
});

test('over budget, the reader gets the card and passages, and nothing is spent', async () => {
  const runs = [];
  const db = {
    batch: async () => [],
    prepare: (sql) => ({
      bind: () => ({
        first: async () => (/answer_spend/.test(sql) ? { usd: 0.33 } : null),
        run: async () => { runs.push(sql); return { meta: {} }; },
      }),
      all: async () => ({ results: [] }),
    }),
  };
  const res = { card: [{ file: 'questions/x.md', line: 1, title: 'Card', header: 'H', url: '#/x', text: 't', score: 0.6 }], source: [], research: [], talk: [] };
  const env = { TEXT: db, ANTHROPIC_API_KEY: 'k', AI: { run: async () => ({ data: [[1, 0]] }) } };
  const out = await answer(env, 'Does God need blood?', { search: async () => res });
  assert.equal(out.mode, 'fallback');
  assert.match(out.reason, /budget/);
  assert.equal(out.card.url, '#/x');
  assert.equal(runs.filter((s) => /answer_spend/.test(s)).length, 0);
});
