// The Way search service: search.nazareneway.com
//
// One index, two doors. GET /search serves the Reading Room's search box;
// POST /mcp serves the same search as an MCP tool that people add to their
// own Claude or ChatGPT. Both return passages and their sources, never a
// generated answer. Two indexes over the same passages, both filled by
// scripts/vectorize-sync.py: Vectorize finds them by meaning, and a D1
// full-text index finds them by their exact words. Each group's two lists
// are merged by reciprocal rank fusion.

import { findReferences, lookupVerses, stripReferences } from './kjv.js';

const MODEL = '@cf/baai/bge-m3';
const GROUPS = ['card', 'source', 'research', 'talk'];
const MAX_QUERY = 300;
const MAX_LIMIT = 10;
const PER_FILE = { card: 1, source: 2, research: 2, talk: 2 };
const TEXT_MAX = 2000;    // characters of a passage returned, as in the vector index
const RRF_K = 60;         // reciprocal rank fusion: 1 / (60 + rank), the usual constant
const MAX_TERMS = 12;
// Words too common to help a keyword search. "not" stays: "mercy, and not
// sacrifice" turns on it.
const STOP = new Set(('a an and are as at be but by did do does for from had has have he her his how i if in ' +
  'into is it its me my of on or our she so than that the their them then there these they this to us was we ' +
  'were what when where which who why will with would you your ye thee thou unto shall hath').split(' '));
const ALLOWED_ORIGINS = [
  'https://nazareneway.com',
  'https://www.nazareneway.com',
  'https://the-nazarene.github.io',
  'https://nazarene-desk.pages.dev',
];
const POINTER_NOTE = 'Talks are auto-captioned transcripts: pointers, not proof. Check the video and a primary text before quoting.';

export async function search(env, query, { group = 'all', limit = 5 } = {}) {
  const q = String(query || '').trim().slice(0, MAX_QUERY);
  if (!q) return { query: '', card: [], source: [], research: [], talk: [] };
  limit = Math.max(1, Math.min(MAX_LIMIT, Number(limit) || 5));
  const groups = group === 'all' ? GROUPS : GROUPS.filter((g) => g === group);

  // A verse reference is answered from the KJV itself, first in Sources. The
  // search by meaning then runs on the verse's words as well as the query's,
  // so "John 14:28" finds the cards and talks about "my Father is greater
  // than I" instead of whatever a bare number happens to sit near.
  let verses = [];
  const refs = findReferences(q);
  if (refs.length) {
    try { verses = await lookupVerses(refs); } catch (err) { console.error(err); }
  }
  const words = verses.map((v) => v.text.replace(/\*\*\d+:\d+\*\*\s*/g, '')).join(' ');
  const asked = words ? `${q}\n${words}` : q;

  const emb = await env.AI.run(MODEL, { text: [asked.slice(0, 2000)] });
  const vector = (emb.data || emb.response)[0];
  const topK = Math.min(50, limit * 4);

  // One query per group, so the transcript passages can't crowd the texts and
  // cards out of a single ranked list, and so a reader always sees which kind
  // of thing a passage is: an ancient text, a card, our own notes, or a talk.
  // The keyword search runs on the query's own words, minus any reference.
  const [lists, hits] = await Promise.all([
    Promise.all(groups.map((g) =>
      env.VECTORIZE.query(vector, { topK, filter: { group: g }, returnValues: false, returnMetadata: 'all' }))),
    textSearch(env, refs.length ? stripReferences(q) : q, topK),
  ]);

  const out = { query: q, card: [], source: [], research: [], talk: [] };
  if (groups.includes('source')) out.source = verses.slice(0, limit);
  groups.forEach((g, i) => {
    if (out[g].length >= limit) return;
    const byMeaning = (lists[i].matches || []).map((m) => ({ id: m.id, score: m.score, ...(m.metadata || {}) }));
    const seen = {};
    // The 14 cards are found by meaning (every card question in the test set
    // already lands in the top five); single words shared with a question only
    // reorder them for the worse, so for cards only an exact phrase counts.
    const byWords = g === 'card' ? [] : hits.words[g] || [];
    for (const r of fuse(byMeaning, byWords, hits.phrase[g] || [], hits.phraseWeight)) {
      seen[r.file] = (seen[r.file] || 0) + 1;
      if (seen[r.file] > PER_FILE[g]) continue;
      out[g].push({
        score: r.score === undefined ? null : Math.round(r.score * 1000) / 1000,
        title: r.title,
        header: r.header,
        file: r.file,
        line: r.line,
        source: r.source,
        speakers: r.speakers,
        url: r.url,
        text: r.text,
      });
      if (out[g].length >= limit) break;
    }
  });
  return out;
}

// ── Keyword search (D1 full-text) ───────────────────────────────────────────

// What someone typed, as FTS5 terms: the whole thing as one phrase (3 to 20
// words), so a pasted verse comes back word for word, and each meaningful word
// on its own. Every term is quoted, so nothing typed can act as an FTS operator.
export function ftsTerms(q) {
  const words = (String(q || '').toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).slice(0, 40);
  const terms = [...new Set(words.filter((w) => w.length > 1 && !STOP.has(w)))].slice(0, MAX_TERMS);
  const phrase = words.length >= 3 && words.length <= 20 && terms.length ? `"${words.join(' ')}"` : null;
  return { words, phrase, terms };
}

// A word in more passages than this ("not", "jesus") says little about which
// passage is wanted and makes the search read every one of them, so it is left
// to the search by meaning; inside a phrase it still counts. The words kept
// may cover this many passages between them, rarest first.
const COMMON = 10000;
const WORD_BUDGET = 20000;

const VOCAB_SQL = (n) => `SELECT term, doc FROM passages_vocab WHERE term IN (${Array(n).fill('?').join(',')})`;

// The best `topK` passages per group for one FTS5 query, ranked by bm25 once
// across the library (title and heading count double) rather than once per group.
const TEXT_SQL = `SELECT * FROM (
  SELECT p.id, p.grp, p.file, p.line, p.title, p.header, p.source, p.speakers, p.url, p.text,
         ROW_NUMBER() OVER (PARTITION BY p.grp ORDER BY m.r) AS n
  FROM (SELECT rowid, bm25(passages_fts, 2.0, 2.0, 1.0) AS r FROM passages_fts WHERE passages_fts MATCH ?1) m
  JOIN passages p ON p.rowid = m.rowid)
WHERE n <= ?2 ORDER BY grp, n`;

// Two ranked lists per group: passages holding the exact phrase, and passages
// holding the rarer words. Empty lists if there is nothing to look for or the
// text index is missing or failing, so search by meaning still answers.
async function textSearch(env, q, topK) {
  const none = { phrase: {}, words: {} };
  const { words, phrase, terms } = ftsTerms(q);
  if ((!phrase && !terms.length) || !env.TEXT) return none;
  try {
    let kept = [];
    if (terms.length) {
      const { results = [] } = await env.TEXT.prepare(VOCAB_SQL(terms.length)).bind(...terms).all();
      let budget = WORD_BUDGET;
      for (const { term, doc } of results.filter((r) => r.doc <= COMMON).sort((a, b) => a.doc - b.doc)) {
        if (doc > budget) break;
        budget -= doc;
        kept.push(`"${term}"`);
      }
    }
    const queries = [phrase, kept.join(' OR ') || null];
    if (!queries.some(Boolean)) return none;
    const res = await env.TEXT.batch(queries.filter(Boolean).map((m) => env.TEXT.prepare(TEXT_SQL).bind(m, topK)));
    const lists = queries.map((m) => (m ? res.shift().results || [] : []));
    const byGroup = (rows) => rows.reduce((acc, row) => {
      (acc[row.grp] = acc[row.grp] || []).push({ ...row, text: windowAround(row.text || '', words) });
      return acc;
    }, {});
    return { phrase: byGroup(lists[0]), words: byGroup(lists[1]), phraseWeight: words.length >= 4 ? 2 : 1 };
  } catch (err) {
    console.error(err);
    return none;
  }
}

// A passage can run past the 2,000 characters returned. Cut the window so the
// words that matched are inside it, starting at the line they're on.
export function windowAround(text, words) {
  if (text.length <= TEXT_MAX) return text;
  const lower = text.toLowerCase();
  const phrase = words.length >= 3 ? lower.search(new RegExp(words.map(escapeRe).join('[^\\p{L}\\p{N}]+'), 'u')) : -1;
  let at = phrase;
  if (at < 0) {
    for (const w of words.filter((x) => x.length > 3 && !STOP.has(x))) {
      const i = lower.indexOf(w);
      if (i >= 0 && (at < 0 || i < at)) at = i;
    }
  }
  if (at < TEXT_MAX - 400) return text.slice(0, TEXT_MAX);
  const nl = text.lastIndexOf('\n', at);
  const start = nl >= 0 && nl >= at - 600 ? nl + 1 : Math.max(0, at - 300);
  return text.slice(start, start + TEXT_MAX);
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Reciprocal rank fusion of the meaning list, the word list and the phrase
// list: each passage scores 1/(K + rank) for every list it's in, so one near
// the top of two lists rises above one that only one search liked. Four or
// more words found exactly as typed means someone pasted a passage, so the
// phrase list counts double: the passages holding it come before anything
// found by meaning alone. A passage found by its words keeps that window of text.
export function fuse(byMeaning, byWords, byPhrase = [], phraseWeight = 1, k = RRF_K) {
  const all = new Map();
  const add = (list, isWords, w = 1) => list.forEach((r, i) => {
    const e = all.get(r.id) || { r, s: 0 };
    e.s += w / (k + i + 1);
    if (isWords) e.r = { ...e.r, text: r.text };
    all.set(r.id, e);
  });
  add(byMeaning, false);
  add(byWords, true);
  add(byPhrase, true, phraseWeight);
  return [...all.values()].sort((a, b) => b.s - a.s).map((e) => e.r);
}

// ── MCP (streamable HTTP, stateless, JSON responses) ───────────────────────

const TOOL = {
  name: 'search_the_way',
  title: 'Search The Way library',
  description:
    'Search The Way (nazareneway.com), a shared research library on the historical Jesus, the Nazarenes, ' +
    'Ebionites and Essenes, Paul, and early Christianity, by meaning. It holds primary texts (the KJV, the ' +
    'Gospel of Thomas, Dead Sea Scrolls, early church writings), 14 question cards, and over 1,000 transcribed ' +
    'talks by Dr. James Tabor, Scott (Nazarene Way), The Jesus Way, David the Nazarene and others. Returns ' +
    'passages with their file, source and link (talks link to the exact second of the video). Cite what you use ' +
    'by its link. Talk transcripts are pointers, not proof.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'A question or topic, in plain words.' },
      group: {
        type: 'string',
        enum: ['all', 'card', 'source', 'research', 'talk'],
        description: 'card = the question cards; source = the primary texts we hold and may quote (VERIFIED-SOURCES.md, Tiers 1-2); research = our own notes, audits and contributed work, never a source; talk = transcribed talks. Default all.',
      },
      limit: { type: 'integer', minimum: 1, maximum: MAX_LIMIT, description: 'Passages per group. Default 5.' },
    },
    required: ['query'],
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
};

const LABELS = {
  card: 'QUESTION CARDS',
  source: 'SOURCES (primary texts we hold; quote these)',
  research: 'OUR RESEARCH (notes and contributed work; not a source)',
  talk: 'TALKS (pointers, not proof)',
};

export function formatForModel(res) {
  const parts = [`Results for: ${res.query}`];
  for (const g of GROUPS) {
    if (!res[g].length) continue;
    parts.push(`\n## ${LABELS[g]}`);
    res[g].forEach((r, i) => {
      const who = r.speakers ? `\nSpeakers: ${r.speakers}` : '';
      parts.push(`\n[${g}-${i + 1}] ${r.title} · ${r.header}\nLink: ${r.url}\nFile: ${r.file}:${r.line}\nSource: ${r.source}${who}\n\n${r.text}`);
    });
  }
  if (res.talk.length) parts.push(`\n${POINTER_NOTE}`);
  return parts.join('\n');
}

async function handleRpc(env, msg) {
  const { id, method, params = {} } = msg;
  const ok = (result) => ({ jsonrpc: '2.0', id, result });
  const fail = (code, message) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

  if (id === undefined) return null; // a notification: nothing to answer
  switch (method) {
    case 'initialize':
      return ok({
        protocolVersion: params.protocolVersion || '2025-06-18',
        capabilities: { tools: {} },
        serverInfo: { name: 'the-way-search', version: '1.0.0' },
        instructions: 'Use search_the_way to find passages in The Way library. Quote only what a result contains, cite its link, and quote primary texts only from SOURCES results. Research results and talk transcripts are pointers to check, not sources.',
      });
    case 'ping':
      return ok({});
    case 'tools/list':
      return ok({ tools: [TOOL] });
    case 'tools/call': {
      if (params.name !== TOOL.name) return fail(-32602, `Unknown tool: ${params.name}`);
      const a = params.arguments || {};
      if (!a.query || typeof a.query !== 'string') {
        return ok({ isError: true, content: [{ type: 'text', text: 'query is required' }] });
      }
      const res = await search(env, a.query, { group: a.group || 'all', limit: a.limit });
      return ok({ content: [{ type: 'text', text: formatForModel(res) }], structuredContent: res });
    }
    default:
      return fail(-32601, `Method not found: ${method}`);
  }
}

// ── HTTP ────────────────────────────────────────────────────────────────────

function cors(req) {
  const origin = req.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return allowed ? {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Mcp-Session-Id, Mcp-Protocol-Version',
    Vary: 'Origin',
  } : { Vary: 'Origin' };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const h = cors(req);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });

    if (url.pathname === '/' && req.method === 'GET') {
      return json({
        service: 'The Way search',
        search: '/search?q=your+question&group=all|card|source|research|talk&limit=5',
        mcp: '/mcp (add this address as a connector in Claude or ChatGPT)',
        note: POINTER_NOTE,
      }, 200, h);
    }

    const isSearch = url.pathname === '/search' && req.method === 'GET';
    const isMcp = url.pathname === '/mcp';
    if (!isSearch && !isMcp) return json({ error: 'not found' }, 404, h);
    if (isMcp && req.method !== 'POST') return json({ error: 'POST JSON-RPC to /mcp' }, 405, { ...h, Allow: 'POST' });

    const ip = req.headers.get('CF-Connecting-IP') || 'unknown';
    const { success } = await env.LIMITER.limit({ key: ip });
    if (!success) return json({ error: 'Too many searches. Try again in a minute.' }, 429, { ...h, 'Retry-After': '60' });

    try {
      if (isSearch) {
        const res = await search(env, url.searchParams.get('q'), {
          group: url.searchParams.get('group') || 'all',
          limit: url.searchParams.get('limit'),
        });
        return json(res, 200, { ...h, 'Cache-Control': 'public, max-age=300' });
      }
      let body;
      try { body = await req.json(); } catch { return json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, 400, h); }
      if (Array.isArray(body)) {
        const replies = (await Promise.all(body.map((m) => handleRpc(env, m)))).filter(Boolean);
        return replies.length ? json(replies, 200, h) : new Response(null, { status: 202, headers: h });
      }
      const reply = await handleRpc(env, body);
      return reply ? json(reply, 200, h) : new Response(null, { status: 202, headers: h });
    } catch (err) {
      console.error(err);
      return json({ error: 'Search is unavailable right now.' }, 500, h);
    }
  },
};
