// Run: node --test site/search/test/*.test.mjs
// The answers dashboard: the key gate, and the numbers it reads, against a real
// SQLite database (node:sqlite) standing in for D1.
import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { stats, handleDashboard } from '../src/dashboard.js';
import { answer } from '../src/answer.js';

// The few D1 calls the Worker makes, over node:sqlite.
function d1() {
  const db = new DatabaseSync(':memory:');
  const stmt = (sql, args = []) => ({
    bind: (...a) => stmt(sql, a),
    first: async () => db.prepare(sql).get(...args) ?? null,
    all: async () => ({ results: db.prepare(sql).all(...args) }),
    run: async () => {
      const r = db.prepare(sql).run(...args);
      return { meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
    },
  });
  return { prepare: (sql) => stmt(sql), batch: async (list) => Promise.all(list.map((s) => s.run())), raw: db };
}

const env = (db) => ({ TEXT: db, DASH_TOKEN: 'k3y-for-tests', ANSWER_MONTHLY_USD: '10' });
const get = (path, cookie) => new Request(`https://search.nazareneway.com${path}`, { headers: cookie ? { Cookie: cookie } : {} });
const route = (req, e) => handleDashboard(req, e, new URL(req.url));

test('the gate: no token, wrong key, no cookie -> 404; the right key -> a cookie and a clean address', async () => {
  const db = d1();
  assert.equal((await route(get('/dashboard?key=anything'), { TEXT: db })).status, 404);   // DASH_TOKEN unset
  const e = env(db);
  assert.equal((await route(get('/dashboard?key=wrong'), e)).status, 404);
  assert.equal((await route(get('/dashboard'), e)).status, 404);
  assert.equal((await route(get('/dashboard/stats'), e)).status, 404);
  assert.equal((await route(get('/dashboard', 'way_dash=wrong'), e)).status, 404);

  const r = await route(get('/dashboard?key=k3y-for-tests'), e);
  assert.equal(r.status, 302);
  assert.equal(r.headers.get('Location'), '/dashboard');
  const cookie = r.headers.get('Set-Cookie');
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Strict/);
  assert.match(cookie, /Path=\/dashboard/);

  const page = await route(get('/dashboard', 'way_dash=k3y-for-tests'), e);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Answers dashboard/);
  assert.equal((await route(get('/dashboard/stats', 'way_dash=k3y-for-tests'), e)).status, 200);
});

test('the numbers: budget, what readers got, gaps, drafts, approve and strike', async () => {
  const db = d1();
  const e = env(db);
  const now = new Date('2026-11-20T15:00:00Z');
  // A few questions through the real answer step, with the parts that would
  // reach Cloudflare or Anthropic stood in.
  const pack = { card: [{ title: 'C', header: 'H', file: 'questions/c.md', line: 1, url: 'u', text: 'x', score: 0.7 }], source: [], research: [], talk: [] };
  const fake = { ...e, AI: { run: async () => ({ data: [[1, 0, 0]] }) } };   // no ANTHROPIC_API_KEY: a fallback
  await answer(fake, 'Do I have to tithe?', { search: async () => pack, now });
  await answer(fake, 'do i have to tithe', { search: async () => pack, now });
  await answer(fake, 'What is the Holy Spirit?', { search: async () => pack, now });

  // A written answer and a day's spending, as the answer step leaves them.
  db.raw.exec(`INSERT INTO answers (created, question, norm, status, asked, answer, passages, cost)
    VALUES ('2026-11-20T14:00:00Z', 'How should I pray?', 'how should i pray', 'draft', 3, '{"mode":"written","answer":{"short_answer":"Simply."}}', '[]', 0.031)`);
  db.raw.exec(`INSERT INTO answer_log (created, question, norm, mode, settled, answer_id, cost)
    VALUES ('2026-11-20T14:00:00Z', 'How should I pray?', 'how should i pray', 'written', 1, 1, 0.031),
           ('2026-11-19T10:00:00Z', 'What did Jesus look like?', 'what did jesus look like', 'written', 0, NULL, 0.029),
           ('2026-11-19T11:00:00Z', 'Is hell real?', 'is hell real', 'fallback', 1, NULL, 0)`);
  db.raw.exec(`UPDATE answer_log SET reason = 'today''s share of the answer budget is spent' WHERE question = 'Is hell real?'`);
  db.raw.exec(`INSERT INTO answer_spend (day, usd, calls) VALUES ('2026-11-20', 0.25, 8), ('2026-11-19', 0.15, 5), ('2026-10-31', 2, 60)`);

  const s = await stats(db, e, now);
  assert.equal(s.budget.today, 0.25);
  assert.ok(Math.abs(s.budget.month - 0.4) < 1e-9);                 // October's $2 not counted
  assert.ok(Math.abs(s.budget.projected - (0.4 / 20) * 30) < 1e-9);
  assert.ok(Math.abs(s.budget.daily - 10 / 30) < 1e-9);
  assert.deepEqual(s.counts, { written: 2, bank: 0, fallback: 3, over_budget: 1 });
  assert.equal(s.days.length, 30);
  assert.equal(s.days.at(-1).day, '2026-11-20');
  assert.equal(s.days.at(-1).usd, 0.25);
  assert.equal(s.days.at(-1).fallback, 3);
  assert.equal(s.top[0].n, 2);                                        // the tithe question, asked two ways
  assert.match(s.top[0].question, /tithe/i);
  assert.ok(s.gaps.some((g) => /look like/.test(g.question)));       // "not settled" is a gap
  assert.ok(s.gaps.some((g) => /tithe/i.test(g.question)));          // a fallback is a gap
  assert.ok(!s.gaps.some((g) => /hell/.test(g.question)));           // running out of money is not
  assert.ok(Math.abs(s.avgCost - 0.03) < 1e-9);
  assert.equal(s.drafts.length, 1);
  assert.equal(s.recent[0].question, 'What is the Holy Spirit?');   // newest first

  const c = 'way_dash=k3y-for-tests';
  const one = await route(get('/dashboard/answer/1', c), e);
  assert.equal((await one.json()).answer.answer.short_answer, 'Simply.');
  const post = (id, body) => route(new Request(`https://search.nazareneway.com/dashboard/answer/${id}`, { method: 'POST', headers: { Cookie: c, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), e);
  assert.equal((await post(1, { status: 'nonsense' })).status, 400);
  assert.equal((await post(99, { status: 'approved' })).status, 404);
  assert.equal((await post(1, { status: 'approved' })).status, 200);
  const after = await stats(db, e, now);
  assert.equal(after.drafts.length, 0);
  assert.deepEqual(after.reviewed, { approved: 1 });
});
