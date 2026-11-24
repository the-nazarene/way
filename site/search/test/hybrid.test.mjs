// Run: node --test site/search/test/*.test.mjs
// The keyword half of the search: the FTS5 terms built from what someone
// typed, the fusion with the search by meaning, and the window of text
// returned around a match. D1 is a stand-in here, so no account is needed.
import test from 'node:test';
import assert from 'node:assert/strict';
import { search, ftsTerms, fuse, windowAround } from '../src/index.js';

test('a pasted verse is searched as a phrase and as its words', () => {
  const t = ftsTerms('I will have mercy, and not sacrifice');
  assert.equal(t.phrase, '"i will have mercy and not sacrifice"');
  assert.deepEqual(t.terms, ['mercy', 'not', 'sacrifice']);
});

test('nothing typed can act as an FTS operator', () => {
  const t = ftsTerms('NEAR(jesus) AND "paul" OR -law* col:x^');
  assert.match(t.phrase, /^"[\p{L}\p{N} ]+"$/u);                 // letters and spaces inside one pair of quotes
  assert.ok(t.terms.every((x) => /^[\p{L}\p{N}]+$/u.test(x)), t.terms.join(' '));
});

test('stopwords alone ask the text index nothing', () => {
  assert.deepEqual(ftsTerms('what is the'), { words: ['what', 'is', 'the'], phrase: null, terms: [] });
  assert.equal(ftsTerms('   ').terms.length, 0);
});

test('two short words are terms, not a phrase', () => {
  const t = ftsTerms('Ebionites vegetarian');
  assert.equal(t.phrase, null);
  assert.deepEqual(t.terms, ['ebionites', 'vegetarian']);
});

test('fusion lifts a passage both searches found, and keeps the matched text', () => {
  const meaning = [{ id: 'a', file: 'a.md', score: 0.9, text: 'A' }, { id: 'b', file: 'b.md', score: 0.8, text: 'B' }];
  const words = [{ id: 'b', file: 'b.md', text: 'B, around the match' }, { id: 'c', file: 'c.md', text: 'C' }];
  const out = fuse(meaning, words);
  assert.deepEqual(out.map((r) => r.id), ['b', 'a', 'c']);
  assert.equal(out[0].text, 'B, around the match');
  assert.equal(out[0].score, 0.8);         // the meaning score is kept
  assert.equal(out[2].score, undefined);   // found by words alone
});

test('a pasted passage (phrase counted double) outranks the search by meaning', () => {
  const meaning = [1, 2, 3, 4, 5].map((n) => ({ id: `m${n}`, file: `m${n}.md` }));
  const verse = { id: 'v', file: 'kjv/40-matthew.md', text: '**9:13** I will have mercy' };
  const others = [{ id: 'x', file: 'x.md' }, { id: 'y', file: 'y.md' }];
  const words = [{ id: 'w1' }, { id: 'w2' }];
  const once = fuse(meaning, words, [...others, verse]);
  const twice = fuse(meaning, words, [...others, verse], 2);
  assert.ok(!once.slice(0, 3).some((r) => r.id === 'v'));
  assert.deepEqual(twice.slice(0, 3).map((r) => r.id), ['x', 'y', 'v']);
});

test('a long passage is cut so the matched phrase is inside the window', () => {
  const text = 'x'.repeat(2400) + '\n**9:13** I will have mercy, and not sacrifice\n' + 'y'.repeat(500);
  const w = windowAround(text, ['i', 'will', 'have', 'mercy', 'and', 'not', 'sacrifice']);
  assert.ok(w.includes('**9:13** I will have mercy'), w.slice(0, 80));
  assert.ok(w.length <= 2000);
  assert.equal(windowAround('short', ['x']), 'short');
});

// D1 stand-in: passages_vocab answers with `docs`; the ranked query answers
// with `rows` (each row carries its grp, as the real query does).
function env({ docs = {}, rows = [] } = {}) {
  const calls = { vocab: [], match: [] };
  const stmt = (sql, args = []) => ({
    sql,
    args,
    bind: (...a) => stmt(sql, a),
    all: async () => {
      calls.vocab.push(a2s(args));
      return { results: args.filter((t) => t in docs).map((term) => ({ term, doc: docs[term] })) };
    },
  });
  const a2s = (a) => a.join(',');
  return {
    calls,
    AI: { run: async () => ({ data: [[0.1, 0.2]] }) },
    VECTORIZE: {
      query: async (v, opts) => ({ matches: [
        { id: `${opts.filter.group}-m`, score: 0.7, metadata: { group: opts.filter.group, file: `${opts.filter.group}-m.md`, line: 1, title: 'M', header: 'H', source: 'S', url: 'u', text: 'meaning' } },
      ] }),
    },
    TEXT: {
      prepare: (sql) => stmt(sql),
      batch: async (stmts) => {
        calls.match.push(...stmts.map((s) => s.args[0]));
        return stmts.map(() => ({ results: rows }));
      },
    },
    LIMITER: { limit: async () => ({ success: true }) },
  };
}

const VERSE = { id: 'kjv', grp: 'source', file: 'christianity/Incoming/kjv/40-matthew.md', line: 9, title: 'Matthew', header: 'Chapter 9', source: 'KJV', url: 'k', text: '**9:13** I will have mercy, and not sacrifice' };

test('search leaves out the commonest words and fuses the hits into their group', async () => {
  const e = env({ docs: { mercy: 2992, not: 56243, sacrifice: 5909 }, rows: [VERSE] });
  const res = await search(e, 'I will have mercy, and not sacrifice', { limit: 5 });
  assert.deepEqual(e.calls.match, ['"i will have mercy and not sacrifice"', '"mercy" OR "sacrifice"']);
  assert.ok(res.source.some((r) => r.text.includes('**9:13**')));
  assert.equal(res.source.find((r) => r.file.includes('kjv')).score, null);
  assert.equal(res.card.length, 1);   // the keyword row belongs to Sources only
});

test('a word in no passage is not searched for', async () => {
  const e = env({ docs: { ebionites: 1996 } });
  await search(e, 'Ebionites zzyzx', { limit: 5 });
  assert.deepEqual(e.calls.match, ['"ebionites"']);
});

test('a broken text index still leaves the search by meaning', async () => {
  const e = env();
  e.TEXT.prepare = () => { throw new Error('D1 down'); };
  const res = await search(e, 'did Jesus eat meat', { limit: 5 });
  assert.equal(res.card.length, 1);
});
