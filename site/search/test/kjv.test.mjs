// Run: node --test site/search/test/*.test.mjs
// Verse references, read from the query and answered from the held KJV. The
// book files are served from a stand-in for GitHub, built from the real files.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { findReferences, lookupVerses } from '../src/kjv.js';
import { search } from '../src/index.js';

const REPO = fileURLToPath(new URL('../../../', import.meta.url));
const fetched = [];
globalThis.fetch = async (url) => {
  fetched.push(String(url));
  const path = String(url).split('/main/')[1];
  try {
    return new Response(readFileSync(REPO + path, 'utf8'));
  } catch {
    return new Response('not found', { status: 404 });
  }
};

const refOf = (q) => findReferences(q).map((r) => `${r.file.split('/').pop()} ${r.chapter}:${r.from}-${r.to}`);

test('reads references the way people write them', () => {
  assert.deepEqual(refOf('John 14:28'), ['43-john.md 14:28-28']);
  assert.deepEqual(refOf('what does matt 5:17-19 mean?'), ['40-matthew.md 5:17-19']);
  assert.deepEqual(refOf('1 Thess 4:17'), ['52-1-thessalonians.md 4:17-17']);
  assert.deepEqual(refOf('First Corinthians 15:3'), ['46-1-corinthians.md 15:3-3']);
  assert.deepEqual(refOf('I John 4:8'), ['62-1-john.md 4:8-8']);
  assert.deepEqual(refOf('Jn 10:30 and Mark 10:18'), ['43-john.md 10:30-30', '41-mark.md 10:18-18']);
  assert.deepEqual(refOf('Song of Solomon 2:4'), ['22-song-of-solomon.md 2:4-4']);
  assert.deepEqual(refOf('Amos 5:21–25'), ['30-amos.md 5:21-25']);
});

test('a bare chapter counts only when it is the whole query', () => {
  assert.deepEqual(refOf('Psalm 23'), ['19-psalms.md 23:1-30']);
  assert.deepEqual(refOf('Psalm 23?'), ['19-psalms.md 23:1-30']);
  assert.deepEqual(refOf('did Jesus mark 3 people'), []);
});

test('leaves sentences and impossible books alone', () => {
  assert.deepEqual(refOf('I will have mercy, and not sacrifice'), []);
  assert.deepEqual(refOf('what did James teach'), []);
  assert.deepEqual(refOf('it is 3:16 now'), []);
  assert.deepEqual(refOf('Corinthians 13:4'), []);   // which one?
  assert.deepEqual(refOf('2 Matthew 1:1'), []);
});

test('answers a reference word for word from the held KJV', async () => {
  const [v] = await lookupVerses(findReferences('Matthew 9:13'));
  assert.equal(v.header, 'Matthew 9:13 (KJV)');
  assert.equal(v.file, 'christianity/Incoming/kjv/40-matthew.md');
  assert.match(v.text, /^\*\*9:13\*\* But go ye and learn what that meaneth, I will have mercy, and not sacrifice/);
  const line = readFileSync(REPO + v.file, 'utf8').split('\n')[v.line - 1];
  assert.equal(line, v.text);                       // the line number points at it
  assert.match(v.url, /40-matthew\.md#L\d+$/);
});

test('a range comes back as one passage, a chapter stops at its last verse', async () => {
  const [r] = await lookupVerses(findReferences('Amos 5:21-25'));
  assert.equal(r.header, 'Amos 5:21-25 (KJV)');
  assert.equal(r.text.split('\n').length, 5);
  assert.match(r.url, /#L\d+-L\d+$/);
  const [p] = await lookupVerses(findReferences('Psalm 23'));
  assert.equal(p.header, 'Psalms 23 (KJV)');
  assert.equal(p.text.split('\n').length, 6);
});

test('a verse the KJV does not have is dropped, not invented', async () => {
  assert.deepEqual(await lookupVerses(findReferences('John 99:1')), []);
});

test('each book is fetched once per Worker instance', async () => {
  fetched.length = 0;
  await lookupVerses(findReferences('Hosea 6:6'));
  await lookupVerses(findReferences('Hosea 6:7'));
  assert.equal(fetched.filter((u) => u.endsWith('28-hosea.md')).length, 1);
});

function env() {
  const calls = { ai: [] };
  return {
    calls,
    AI: { run: async (model, input) => { calls.ai.push(input); return { data: [[0.1]] }; } },
    VECTORIZE: {
      query: async (vector, opts) => ({
        matches: [{ score: 0.5, metadata: { group: opts.filter.group, file: `${opts.filter.group}.md`, line: 1, title: 'T', header: 'H', source: 'S', url: 'u', text: 't' } }],
      }),
    },
  };
}

test('search puts the verse first in Sources and searches on its words', async () => {
  const e = env();
  const res = await search(e, 'John 14:28', { limit: 5 });
  assert.equal(res.source[0].header, 'John 14:28 (KJV)');
  assert.equal(res.source[0].match, 'reference');
  assert.equal(res.source[1].file, 'source.md');    // the search by meaning fills the rest
  assert.match(e.calls.ai[0].text[0], /my Father is greater than I/);
  assert.equal(res.card.length, 1);
});

test('a query with no reference searches exactly as before', async () => {
  const e = env();
  const res = await search(e, 'did Jesus eat meat', { limit: 5 });
  assert.equal(e.calls.ai[0].text[0], 'did Jesus eat meat');
  assert.equal(res.source[0].file, 'source.md');
});

test('if GitHub is down, the search still answers', async () => {
  const real = globalThis.fetch;
  globalThis.fetch = async () => new Response('', { status: 503 });
  const quiet = console.error;
  console.error = () => {};
  try {
    const res = await search(env(), 'Hebrews 9:22', { limit: 5 });
    assert.equal(res.source[0].file, 'source.md');
  } finally {
    globalThis.fetch = real;
    console.error = quiet;
  }
});
