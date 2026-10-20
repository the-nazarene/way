// Run: node --test site/search/test/*.test.mjs
// Exercises the Worker against stand-ins for Workers AI, Vectorize and the
// rate limiter, so it needs no Cloudflare account.
import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { search, formatForModel } from '../src/index.js';

function match(group, file, score, extra = {}) {
  return {
    id: `${file}:${score}`,
    score,
    metadata: { group, file, line: 10, title: `T ${file}`, header: 'H', source: 'S', url: `https://x/${file}`, text: `text of ${file}`, ...extra },
  };
}

function env({ allow = true } = {}) {
  const calls = { ai: [], vec: [] };
  return {
    calls,
    AI: { run: async (model, input) => { calls.ai.push({ model, input }); return { shape: [1, 1024], data: [[0.1, 0.2]] }; } },
    VECTORIZE: {
      query: async (vector, opts) => {
        calls.vec.push(opts);
        const g = opts.filter.group;
        return { matches: [match(g, 'a.md', 0.9), match(g, 'a.md', 0.89), match(g, 'a.md', 0.88), match(g, 'b.md', 0.8)] };
      },
    },
    LIMITER: { limit: async () => ({ success: allow }) },
  };
}

const req = (path, init = {}) => new Request(`https://search.nazareneway.com${path}`, init);

test('search queries each group separately and caps passages per file', async () => {
  const e = env();
  const res = await search(e, '  did Jesus eat meat  ', { limit: 5 });
  assert.equal(res.query, 'did Jesus eat meat');
  assert.deepEqual(e.calls.vec.map((o) => o.filter.group), ['card', 'library', 'talk']);
  assert.equal(e.calls.ai[0].model, '@cf/baai/bge-m3');
  assert.deepEqual(res.card.map((r) => r.file), ['a.md', 'b.md']);           // one per card
  assert.deepEqual(res.talk.map((r) => r.file), ['a.md', 'a.md', 'b.md']);   // two per talk
});

test('search with one group only asks for that group', async () => {
  const e = env();
  const res = await search(e, 'James', { group: 'talk', limit: 1 });
  assert.equal(e.calls.vec.length, 1);
  assert.equal(res.talk.length, 1);
  assert.equal(res.library.length, 0);
});

test('empty query costs nothing', async () => {
  const e = env();
  const res = await search(e, '   ');
  assert.equal(e.calls.ai.length, 0);
  assert.equal(res.card.length + res.library.length + res.talk.length, 0);
});

test('GET /search returns JSON with CORS for the site', async () => {
  const r = await worker.fetch(req('/search?q=resurrection', { headers: { Origin: 'https://nazareneway.com' } }), env());
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('Access-Control-Allow-Origin'), 'https://nazareneway.com');
  const body = await r.json();
  assert.ok(body.card.length && body.library.length && body.talk.length);
});

test('other origins get no CORS header', async () => {
  const r = await worker.fetch(req('/search?q=x', { headers: { Origin: 'https://evil.example' } }), env());
  assert.equal(r.headers.get('Access-Control-Allow-Origin'), null);
});

test('rate limit returns 429', async () => {
  const r = await worker.fetch(req('/search?q=x'), env({ allow: false }));
  assert.equal(r.status, 429);
});

test('unknown path is 404', async () => {
  const r = await worker.fetch(req('/admin'), env());
  assert.equal(r.status, 404);
});

const rpc = (body) => req('/mcp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('MCP initialize, list, call', async () => {
  const e = env();
  let r = await worker.fetch(rpc({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18' } }), e);
  let body = await r.json();
  assert.equal(body.result.serverInfo.name, 'the-way-search');
  assert.ok(body.result.capabilities.tools);

  r = await worker.fetch(rpc({ jsonrpc: '2.0', method: 'notifications/initialized' }), e);
  assert.equal(r.status, 202);

  r = await worker.fetch(rpc({ jsonrpc: '2.0', id: 2, method: 'tools/list' }), e);
  body = await r.json();
  assert.equal(body.result.tools[0].name, 'search_the_way');

  r = await worker.fetch(rpc({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'search_the_way', arguments: { query: 'James' } } }), e);
  body = await r.json();
  const text = body.result.content[0].text;
  assert.match(text, /QUESTION CARDS/);
  assert.match(text, /TALKS \(pointers, not proof\)/);
  assert.match(text, /Link: https:\/\/x\/a\.md/);
  assert.ok(body.result.structuredContent.talk.length);
});

test('MCP errors: unknown method, missing query, bad JSON, GET', async () => {
  const e = env();
  let body = await (await worker.fetch(rpc({ jsonrpc: '2.0', id: 1, method: 'resources/list' }), e)).json();
  assert.equal(body.error.code, -32601);
  body = await (await worker.fetch(rpc({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'search_the_way', arguments: {} } }), e)).json();
  assert.equal(body.result.isError, true);
  const bad = await worker.fetch(req('/mcp', { method: 'POST', body: '{nope' }), e);
  assert.equal(bad.status, 400);
  const get = await worker.fetch(req('/mcp'), e);
  assert.equal(get.status, 405);
});

test('formatForModel leaves out empty groups and the pointer note when there are no talks', () => {
  const text = formatForModel({ query: 'q', card: [], library: [{ title: 'L', header: 'h', url: 'u', file: 'f', line: 1, source: 's', text: 't' }], talk: [] });
  assert.doesNotMatch(text, /QUESTION CARDS/);
  assert.doesNotMatch(text, /pointers, not proof\. Check/);
  assert.match(text, /LIBRARY/);
});
