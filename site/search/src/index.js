// The Way search service: search.nazareneway.com
//
// One index, two doors. GET /search serves the Reading Room's search box;
// POST /mcp serves the same search as an MCP tool that people add to their
// own Claude or ChatGPT. Both return passages and their sources, never a
// generated answer. The index is filled by scripts/vectorize-sync.py.

const MODEL = '@cf/baai/bge-m3';
const GROUPS = ['card', 'library', 'talk'];
const MAX_QUERY = 300;
const MAX_LIMIT = 10;
const PER_FILE = { card: 1, library: 2, talk: 2 };
const ALLOWED_ORIGINS = [
  'https://nazareneway.com',
  'https://www.nazareneway.com',
  'https://the-nazarene.github.io',
  'https://nazarene-desk.pages.dev',
];
const POINTER_NOTE = 'Talks are auto-captioned transcripts: pointers, not proof. Check the video and a primary text before quoting.';

export async function search(env, query, { group = 'all', limit = 5 } = {}) {
  const q = String(query || '').trim().slice(0, MAX_QUERY);
  if (!q) return { query: '', card: [], library: [], talk: [] };
  limit = Math.max(1, Math.min(MAX_LIMIT, Number(limit) || 5));
  const groups = group === 'all' ? GROUPS : GROUPS.filter((g) => g === group);

  const emb = await env.AI.run(MODEL, { text: [q] });
  const vector = (emb.data || emb.response)[0];

  // One query per group, so the 34,000 transcript passages can't crowd the
  // texts and cards out of a single ranked list.
  const lists = await Promise.all(groups.map((g) =>
    env.VECTORIZE.query(vector, {
      topK: Math.min(50, limit * 4),
      filter: { group: g },
      returnValues: false,
      returnMetadata: 'all',
    })));

  const out = { query: q, card: [], library: [], talk: [] };
  groups.forEach((g, i) => {
    const seen = {};
    for (const m of lists[i].matches || []) {
      const md = m.metadata || {};
      seen[md.file] = (seen[md.file] || 0) + 1;
      if (seen[md.file] > PER_FILE[g]) continue;
      out[g].push({
        score: Math.round(m.score * 1000) / 1000,
        title: md.title,
        header: md.header,
        file: md.file,
        line: md.line,
        source: md.source,
        speakers: md.speakers,
        url: md.url,
        text: md.text,
      });
      if (out[g].length >= limit) break;
    }
  });
  return out;
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
        enum: ['all', 'card', 'library', 'talk'],
        description: 'card = the question cards; library = primary texts and research files; talk = transcribed talks. Default all.',
      },
      limit: { type: 'integer', minimum: 1, maximum: MAX_LIMIT, description: 'Passages per group. Default 5.' },
    },
    required: ['query'],
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
};

const LABELS = { card: 'QUESTION CARDS', library: 'LIBRARY (texts and research)', talk: 'TALKS (pointers, not proof)' };

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
        instructions: 'Use search_the_way to find passages in The Way library. Quote only what a result contains, cite its link, and treat talk transcripts as pointers to check, not as sources.',
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
        search: '/search?q=your+question&group=all|card|library|talk&limit=5',
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
