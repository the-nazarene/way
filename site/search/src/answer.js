// Written answers: POST /answer (behind ASK_TOKEN while it is tried out).
//
// The search finds the passages; Claude writes a short answer from them and
// nothing else. The model never types scripture: it names a verse ("Mark 2:5")
// and the King James text is pasted in here from the held file. Any other
// quotation (Thomas, the Scrolls, a church father) must be an exact span of a
// passage it was given. Talks never reach the model; they are listed as links.
// Every check below either passes or the reader gets the closest card and the
// passages instead, so a bad answer is never shown, only a plainer one.
//
// Every answer is kept in D1 (`answers`). Matt or Rex approve or strike them
// with scripts/answer-review.py; a question close enough to an approved one
// gets that answer back, free, marked as checked by a person. Spending is
// counted per day in `answer_spend` against a monthly budget spread by day.
// Every question asked is also logged in `answer_log` (the question, when, and
// what the reader got; no address or browser), which the dashboard reads.
//
// The model also reads the library's lens (lens.js): its method and its
// conclusions. Where the passages don't fully answer, it may think the question
// through that lens from its own knowledge, in a separate `lens` section that
// names the lens point behind every claim and is labelled as not a settled
// position. Quotes and verses stay under the same checks as everywhere else.

import { findReferences, lookupVerses } from './kjv.js';
import { LENS, LENS_IDS, LENS_POINTS } from './lens.js';

const MODEL = 'claude-sonnet-5-5';  // overridden by env.ANSWER_MODEL
const EMBED = '@cf/baai/bge-m3';
const API = 'https://api.anthropic.com/v1/messages';
// USD per token, [input, output], list prices.
const PRICES = {
  'claude-sonnet-5-5': [2 / 1e6, 10 / 1e6],
  'claude-opus-5-5': [4 / 1e6, 20 / 1e6],
};
const RESERVE = 0.05;               // the most one answer is expected to cost; kept free before calling
const LENS_WORDS = 150;             // the lens section's length past which the answer is not shown
const MONTHLY_USD = 10;             // overridden by env.ANSWER_MONTHLY_USD
const CARD_SCORE = 0.55;            // closest card shown first in a fallback at or above this (golden set)
const BANK_MATCH = 0.9;             // cosine to an approved question; paraphrases score 0.88-0.96, near misses up to 0.86
const MAX_VERSES = 6;               // one reference pastes at most this many verses
const SOFT_WORDS = 160;             // prose length asked for
const HARD_WORDS = 260;             // prose length past which the answer is not shown
const MAX_QUESTION = 300;

export const LABEL_DRAFT = 'Drafted from our sources by AI, not yet checked by a person.';
export const LABEL_CHECKED = 'Drafted from our sources by AI and checked by a person.';
export const LABEL_BACKGROUND = 'General background, not from our library.';
export const LABEL_LENS = "The library's method applied, not a settled position.";

const SYSTEM = `You write short answers for nazareneway.com, a library on what Jesus actually taught, read mostly by Christians who know their Bibles. The main answer comes ONLY from the numbered passages given: no outside knowledge there for any claim about what a text says, what Jesus said, or what happened. Your own knowledge is welcome in one place, the lens section (below). Tone: warm, direct, respectful; recovering, not debunking; never preachy or sarcastic. Never write in the first person (no I, me, my, we, our); say the library.

Rules:
- Scripture is never typed by you. For any Bible verse give only its reference in a ref field (e.g. Mark 2:5 or John 14:28-29, at most ${MAX_VERSES} verses); the site pastes the King James text itself. Cards often paraphrase verses in modern English: use the reference, not their wording.
- Any other quotation (Gospel of Thomas, Dead Sea Scrolls, church fathers, a card) goes in a quote field as an EXACT, contiguous span copied from one passage, with that passage's number.
- Prose fields must contain NO quotation marks at all.
- Lead with Jesus's own words when the passages contain them. Supporting passages are other evidence; never repeat a verse already given as Jesus's words.
- State the mainstream Christian reading fairly, in a sentence or two, before the library's view.
- Always give the strongest passage on the other side: a Bible verse by reference, or an exact quote from a held source passage. Never a line from a card or from our research.
- Cite passages in prose as [n].
- Cards are the library's checked positions; prefer them. Set card_match true only if the closest card [1] directly answers this question. Our-research passages are the team's notes, not sources: never quote them as evidence of what Jesus said.
- If the passages don't actually answer the question, set answerable=false and say in one or two sentences what the library does and doesn't hold.
- The lens section: when the passages don't fully answer the question (always when answerable=false, and when they cover only part of it), think the question through the library's lens, given after these rules, using your own knowledge of scripture, history and scholarship. Write it in lens.text, two to five sentences, as the library would reason, and tag every sentence with the lens point it applies, like [L3] or [L11]. Name the verses it leans on in lens.verses by reference only (the site pastes the KJV). In lens.text: no quotation marks, no verse numbers (put verses in lens.verses), no invented specifics (no dates, figures, names of scholars or claims of consensus you are not sure of), and no claim that the library has settled it. Be fair to the mainstream reading. Leave lens empty when the passages answer the question fully.
- Keep it short: under ${SOFT_WORDS} words of prose in total, not counting the lens section.

The library's lens:
${LENS}`;

const ITEM = {
  type: 'object',
  properties: {
    ref: { type: 'string', description: 'Bible reference; the site pastes the KJV text' },
    passage: { type: 'integer' },
    quote: { type: 'string', description: 'Only for non-Bible text: an exact span of the passage' },
  },
};

const TOOL = {
  name: 'answer',
  description: 'Return the structured answer.',
  input_schema: {
    type: 'object',
    properties: {
      answerable: { type: 'boolean' },
      card_match: { type: 'boolean', description: 'True only if the closest card [1] directly answers this question.' },
      short_answer: { type: 'string', description: 'One or two sentences. No quotation marks.' },
      jesus_words: { type: 'array', items: ITEM },
      mainstream: { type: 'string', description: 'The mainstream Christian reading, fairly. No quotation marks.' },
      library_view: { type: 'string', description: 'What the library concludes and why, with [n] citations. No quotation marks.' },
      supporting: { type: 'array', items: ITEM },
      against: { type: 'object', properties: { ...ITEM.properties, note: { type: 'string' } }, required: ['note'] },
      not_settled: { type: 'string', description: 'Where the library does not settle it, or empty. No quotation marks.' },
      lens: {
        type: 'object',
        description: "Only when the passages don't fully answer: the question thought through the library's lens. Omit otherwise.",
        properties: {
          text: { type: 'string', description: 'Two to five sentences, each tagged with its lens point like [L11]. No quotation marks, no verse numbers.' },
          verses: { type: 'array', items: { type: 'object', properties: { ref: { type: 'string' } }, required: ['ref'] }, description: 'Verses the reasoning leans on, by reference only.' },
        },
        required: ['text'],
      },
    },
    required: ['answerable', 'card_match', 'short_answer', 'jesus_words', 'mainstream', 'library_view', 'supporting', 'against', 'not_settled'],
  },
};

// ── Checking what the model returned ────────────────────────────────────────

// For comparing a quotation with a passage: verse markers, markup, curly
// quotes, case and spacing don't count.
export function norm(s) {
  return String(s || '')
    .replace(/\*\*\d+:\d+\*\*/g, ' ')
    .replace(/[*_]/g, '')
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}

const QUOTE_MARKS = /["“”]/;
const VERSE_NUMBER = /\b\d{1,3}\s*:\s*\d{1,3}\b/;
const FIRST_PERSON = /\b(I|I'm|I've|I'd|me|myself)\b/;
const PROSE = ['short_answer', 'mainstream', 'library_view', 'not_settled'];
// The books in which Jesus speaks: Jesus's words must be a verse from one.
const JESUS_BOOKS = /^(Matthew|Mark|Luke|John|Acts|Revelation) /;
const LENS_TAG = /\[(L\d+)\]/g;

const words = (s) => (String(s || '').match(/\S+/g) || []).length;

// One reference, as the model wrote it, to the KJV verses it names.
async function pasteVerses(ref, lookup) {
  const found = findReferences(String(ref || ''));
  if (found.length !== 1 || found[0].whole) return null;
  const r = found[0];
  if (r.to - r.from + 1 > MAX_VERSES) return null;
  const [hit] = await lookup([r]);
  if (!hit) return null;
  return {
    ref: hit.header.replace(/ \(KJV\)$/, ''),
    url: hit.url,
    text: hit.text.split('\n').map((l) => l.replace(/^\*\*\d+:\d+\*\*\s*/, '')).join(' '),
  };
}

// Checks the model's answer against the passages it was given, pastes in the
// verses, and returns { answer, problems, warnings }. Any problem means the
// written answer is not shown. `lookup` is lookupVerses, or a stand-in in tests.
export async function check(raw, passages, lookup = lookupVerses) {
  const problems = [];
  const warnings = [];
  const ans = { ...raw };
  const byId = new Map(passages.map((p) => [p.n, p]));
  const asItem = (x) => (typeof x === 'string' ? { ref: x } : x || {});
  ans.jesus_words = (Array.isArray(ans.jesus_words) ? ans.jesus_words : []).map(asItem);
  ans.supporting = (Array.isArray(ans.supporting) ? ans.supporting : []).map(asItem);
  ans.against = typeof ans.against === 'string' ? { ref: ans.against, note: '' } : ans.against || null;

  // A failed verse or quotation sinks the answer when it is Jesus's words or
  // the other side; a failed supporting one is only left out (and flagged).
  async function resolve(item, role) {
    const fail = (msg) => { (role === 'supporting' ? warnings : problems).push(`${role}: ${msg}`); return null; };
    if (item.ref) {
      const v = await pasteVerses(item.ref, lookup);
      if (!v) return fail(`verse reference not found in the held KJV: ${item.ref}`);
      if (role === "Jesus's words" && !JESUS_BOOKS.test(v.ref)) return fail(`not from a book where Jesus speaks: ${v.ref}`);
      return { ...v, ...(item.note !== undefined ? { note: item.note } : {}) };
    }
    const p = byId.get(Number(item.passage));
    if (!p || !item.quote) return fail('a quotation without its passage');
    if (!norm(p.text).includes(norm(item.quote))) return fail(`not word for word from [${p.n}]: ${String(item.quote).slice(0, 80)}`);
    if (role !== 'supporting' && p.kind !== 'source') return fail(`quoted from a ${p.kind} passage [${p.n}], not a held source`);
    if (p.kind === 'research') return fail(`quoted from our research [${p.n}], which is not a source`);
    return { quote: item.quote, passage: p.n, title: p.title, header: p.header, url: p.url, ...(item.note !== undefined ? { note: item.note } : {}) };
  }

  const jw = [];
  for (const it of ans.jesus_words) jw.push(await resolve(it, "Jesus's words"));
  const sup = [];
  for (const it of ans.supporting) sup.push(await resolve(it, 'supporting'));
  ans.jesus_words = jw.filter(Boolean);
  // A verse already shown as Jesus's words isn't shown twice.
  const shown = new Set(ans.jesus_words.map((w) => w.ref).filter(Boolean));
  ans.supporting = sup.filter((w) => w && !(w.ref && shown.has(w.ref)));
  // The other side is a verse or a held text. When none was given, its note
  // still shows, flagged for the weekly review.
  if (ans.answerable && ans.against && (ans.against.ref || ans.against.quote)) ans.against = (await resolve(ans.against, 'against')) || ans.against;
  else if (ans.answerable) warnings.push('no passage on the other side');

  for (const f of PROSE) {
    if (QUOTE_MARKS.test(ans[f] || '')) problems.push(`quotation marks in ${f}`);
    if (FIRST_PERSON.test(ans[f] || '')) warnings.push(`first person in ${f}`);
  }
  if (ans.against && QUOTE_MARKS.test(ans.against.note || '')) problems.push('quotation marks in the note on the other side');
  for (const m of String(ans.library_view || '').matchAll(/\[(\d+)\]/g)) {
    if (!byId.has(Number(m[1]))) problems.push(`cites [${m[1]}], which it was not given`);
  }
  if (ans.background) {
    if (ans.answerable) delete ans.background;   // background is only for a question the library can't answer
    else if (QUOTE_MARKS.test(ans.background) || VERSE_NUMBER.test(ans.background) || findReferences(ans.background).length) {
      problems.push('background quotes or cites a text');
    }
  }
  if (ans.lens && typeof ans.lens === 'string') ans.lens = { text: ans.lens };
  if (ans.lens && !String(ans.lens.text || '').trim()) delete ans.lens;
  if (ans.lens) {
    const t = String(ans.lens.text);
    if (QUOTE_MARKS.test(t)) problems.push('quotation marks in the lens section');
    if (VERSE_NUMBER.test(t.replace(LENS_TAG, ''))) problems.push('a verse number in the lens section');
    const tags = [...t.matchAll(LENS_TAG)].map((m) => m[1]);
    if (!tags.length) problems.push('the lens section names no lens point');
    for (const id of tags) if (!LENS_IDS.includes(id)) problems.push(`the lens section names ${id}, which does not exist`);
    if (/\[\d+\]/.test(t)) warnings.push('a passage number in the lens section');
    if (words(t) > LENS_WORDS) problems.push(`lens section too long (${words(t)} words)`);
    const verses = [];
    for (const v of Array.isArray(ans.lens.verses) ? ans.lens.verses : []) {
      const pasted = await pasteVerses(typeof v === 'string' ? v : v && v.ref, lookup);
      if (pasted) verses.push(pasted);
      else warnings.push(`lens verse not found in the held KJV: ${typeof v === 'string' ? v : v && v.ref}`);
    }
    ans.lens = { text: t, verses, points: Object.fromEntries(tags.filter((id) => LENS_POINTS[id]).map((id) => [id, LENS_POINTS[id]])) };
  }
  const n = PROSE.reduce((t, f) => t + words(ans[f]), 0) + words(ans.against && ans.against.note);
  if (n > HARD_WORDS) problems.push(`too long (${n} words)`);
  else if (n > SOFT_WORDS + 40) warnings.push(`long (${n} words)`);
  return { answer: ans, problems, warnings };
}

// ── Budget ──────────────────────────────────────────────────────────────────

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS answers (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     created TEXT NOT NULL,
     question TEXT NOT NULL,
     norm TEXT NOT NULL,
     status TEXT NOT NULL DEFAULT 'draft',
     asked INTEGER NOT NULL DEFAULT 1,
     answer TEXT NOT NULL,
     passages TEXT NOT NULL,
     cost REAL NOT NULL DEFAULT 0,
     embedding TEXT,
     reviewed TEXT)`,
  'CREATE INDEX IF NOT EXISTS answers_norm ON answers (norm)',
  'CREATE INDEX IF NOT EXISTS answers_status ON answers (status)',
  'CREATE TABLE IF NOT EXISTS answer_spend (day TEXT PRIMARY KEY, usd REAL NOT NULL DEFAULT 0, calls INTEGER NOT NULL DEFAULT 0)',
  `CREATE TABLE IF NOT EXISTS answer_log (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     created TEXT NOT NULL,
     question TEXT NOT NULL,
     norm TEXT NOT NULL,
     mode TEXT NOT NULL,
     reason TEXT,
     settled INTEGER NOT NULL DEFAULT 1,
     answer_id INTEGER,
     cost REAL NOT NULL DEFAULT 0)`,
  'CREATE INDEX IF NOT EXISTS answer_log_created ON answer_log (created)',
];
const ready = new WeakSet();   // per database binding, once per isolate

export async function ensureTables(db) {
  if (ready.has(db)) return;
  await db.batch(SCHEMA.map((s) => db.prepare(s)));
  ready.add(db);
}

export function budgets(env) {
  const monthly = Number(env.ANSWER_MONTHLY_USD) || MONTHLY_USD;
  return { monthly, daily: monthly / 30 };
}

// Whether one more answer fits today's share and the month's budget.
export async function canSpend(db, env, now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  const { monthly, daily } = budgets(env);
  const today = await db.prepare('SELECT usd FROM answer_spend WHERE day = ?').bind(day).first();
  const month = await db.prepare('SELECT SUM(usd) AS usd FROM answer_spend WHERE day LIKE ?').bind(`${day.slice(0, 7)}%`).first();
  const t = (today && today.usd) || 0;
  const m = (month && month.usd) || 0;
  return t + RESERVE <= daily && m + RESERVE <= monthly;
}

async function spend(db, usd, now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  await db.prepare(`INSERT INTO answer_spend (day, usd, calls) VALUES (?, ?, 1)
    ON CONFLICT(day) DO UPDATE SET usd = usd + excluded.usd, calls = calls + 1`).bind(day, usd).run();
}

export const modelOf = (env) => (env && PRICES[env.ANSWER_MODEL] ? env.ANSWER_MODEL : MODEL);
export function costOf(usage, model = MODEL) {
  const [i, o] = PRICES[model] || PRICES[MODEL];
  return (usage.input_tokens || 0) * i + (usage.output_tokens || 0) * o;
}

// ── The answer bank ─────────────────────────────────────────────────────────

export function normQuestion(q) {
  return String(q || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

export function cosine(a, b) {
  let d = 0, x = 0, y = 0;
  for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; x += a[i] * a[i]; y += b[i] * b[i]; }
  return x && y ? d / Math.sqrt(x * y) : 0;
}

// An approved answer to a question that means the same, or this exact question
// asked before (a draft is served again rather than paid for twice).
async function fromBank(db, normed, vector) {
  const same = await db.prepare(
    "SELECT id, status, answer, passages FROM answers WHERE norm = ? AND status != 'struck' ORDER BY status = 'approved' DESC, id DESC LIMIT 1",
  ).bind(normed).first();
  if (same) return same;
  const { results = [] } = await db.prepare("SELECT id, status, answer, passages, embedding FROM answers WHERE status = 'approved' AND embedding IS NOT NULL").all();
  let best = null;
  for (const r of results) {
    const s = cosine(vector, JSON.parse(r.embedding));
    if (s >= BANK_MATCH && (!best || s > best.s)) best = { ...r, s };
  }
  return best;
}

// ── Building the answer ─────────────────────────────────────────────────────

// The numbered passages the model sees: the closest two cards, the held
// sources for the question and for the case against it, two of our research
// notes. Talks are kept apart as links.
export function packFor(r1, r2) {
  const passages = [];
  const seen = new Set();
  const add = (item, kind) => {
    const key = `${item.file}:${item.line}`;
    if (seen.has(key)) return;
    seen.add(key);
    passages.push({ n: passages.length + 1, kind, title: item.title, header: item.header, file: item.file, line: item.line, url: item.url, text: item.text || '' });
  };
  r1.card.slice(0, 2).forEach((c) => add(c, 'card'));
  r1.source.slice(0, 6).forEach((s) => add(s, 'source'));
  (r2.source || []).slice(0, 6).forEach((s) => add(s, 'source'));
  r1.research.slice(0, 2).forEach((s) => add(s, 'research'));
  const talks = [];
  const titles = new Set();
  for (const t of r1.talk) {
    if (titles.has(t.title)) continue;
    titles.add(t.title);
    talks.push({ title: t.title, url: t.url, speakers: t.speakers || '' });
    if (talks.length >= 3) break;
  }
  return { passages, talks, topCard: r1.card[0] || null };
}

const KIND = { card: 'card (written and checked by a person)', source: 'source (held primary text)', research: 'our research (not a source)' };

function prompt(q, passages) {
  const body = passages.map((p) => `[${p.n}] (${KIND[p.kind]}) ${p.title} — ${p.header} — ${p.file}:${p.line}\n${p.text}`).join('\n\n');
  return `Passages:\n\n${body}\n\nQuestion: ${q}\n\nReply only by calling the answer tool.`;
}

async function callModel(env, q, passages) {
  const model = modelOf(env);
  const r = await fetch(API, {
    method: 'POST',
    headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    // This model refuses a forced tool_choice, so the tool is offered and asked for.
    body: JSON.stringify({ model, max_tokens: 2000, system: SYSTEM, tools: [TOOL], messages: [{ role: 'user', content: prompt(q, passages) }] }),
    signal: AbortSignal.timeout(60000),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const msg = await r.json();
  const use = (msg.content || []).find((b) => b.type === 'tool_use');
  return { raw: use ? use.input : null, cost: costOf(msg.usage || {}, model), model };
}

const cardOf = (c) => (c ? { title: c.title, url: c.url, file: c.file } : null);
const publicPassages = (passages) => passages.map(({ n, kind, title, header, url }) => ({ n, kind, title, header, url }));

// What the reader gets when there is no written answer: the closest card, if
// it is close, and the passages themselves.
function fallback(reason, pack) {
  const top = pack.topCard;
  return {
    mode: 'fallback',
    reason,
    card: top && top.score >= CARD_SCORE ? cardOf(top) : null,
    passages: publicPassages(pack.passages.filter((p) => p.kind !== 'research')).slice(0, 8),
    talks: pack.talks,
  };
}

// The whole step, logged. A failed log write never costs the reader an answer.
export async function answer(env, question, opts = {}) {
  const res = await compose(env, question, opts);
  const q = String(question || '').trim().slice(0, MAX_QUESTION);
  if (q && env.TEXT && env.ANSWER_TRIAL !== '1') {
    const settled = !(res.answer && res.answer.answerable === false);
    try {
      await env.TEXT.prepare(
        'INSERT INTO answer_log (created, question, norm, mode, reason, settled, answer_id, cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ).bind((opts.now || new Date()).toISOString(), q, normQuestion(q), res.mode, res.reason || null, settled ? 1 : 0, res.id || null, res.cost || 0).run();
    } catch (err) {
      console.error(err);
    }
  }
  return res;
}

// `search` is index.js's search (passed in, not imported, to keep the two
// modules from importing each other).
async function compose(env, question, { search, lookup = lookupVerses, now = new Date() } = {}) {
  const q = String(question || '').trim().slice(0, MAX_QUESTION);
  if (!q) return { mode: 'fallback', reason: 'empty question', card: null, passages: [], talks: [] };
  const db = env.TEXT;
  await ensureTables(db);

  const normed = normQuestion(q);
  const emb = await env.AI.run(EMBED, { text: [q] });
  const vector = (emb.data || emb.response)[0];
  // A trial (wrangler dev --var ANSWER_TRIAL:1) skips the bank and the daily
  // share, and keeps nothing, so two models can be run on the same questions.
  const trial = env.ANSWER_TRIAL === '1';
  const banked = trial ? null : await fromBank(db, normed, vector);
  if (banked) {
    await db.prepare('UPDATE answers SET asked = asked + 1 WHERE id = ?').bind(banked.id).run();
    const kept = JSON.parse(banked.answer);
    return { ...kept, mode: 'bank', id: banked.id, checked: banked.status === 'approved', label: banked.status === 'approved' ? LABEL_CHECKED : LABEL_DRAFT, cost: 0 };
  }

  const [r1, r2] = await Promise.all([
    search(env, q, { limit: 6 }),
    search(env, `the strongest case against: ${q}`, { group: 'source', limit: 6 }),
  ]);
  const pack = packFor(r1, r2);
  if (!pack.passages.length) return fallback('nothing in the library is close enough', pack);
  if (!env.ANTHROPIC_API_KEY) return fallback('written answers are switched off', pack);
  if (!trial && !(await canSpend(db, env, now))) return fallback("today's share of the answer budget is spent", pack);

  let raw, cost, model;
  try {
    ({ raw, cost, model } = await callModel(env, q, pack.passages));
  } catch (err) {
    console.error(err);
    return fallback('the answer service is unavailable', pack);
  }
  await spend(db, cost, now);
  if (!raw) return fallback('no structured answer came back', pack);

  const { answer: ans, problems, warnings } = await check(raw, pack.passages, lookup);
  if (problems.length) {
    console.log(JSON.stringify({ answer_rejected: q, problems, against: raw.against }));
    return { ...fallback('the written answer failed its checks', pack), problems, cost };
  }
  const out = {
    mode: 'written',
    checked: false,
    label: LABEL_DRAFT,
    backgroundLabel: LABEL_BACKGROUND,
    lensLabel: LABEL_LENS,
    card: ans.card_match && pack.topCard ? cardOf(pack.topCard) : null,
    answer: ans,
    passages: publicPassages(pack.passages),
    talks: pack.talks,
    warnings,
  };
  if (trial) return { ...out, model, cost };
  const { meta } = await db.prepare(
    'INSERT INTO answers (created, question, norm, answer, passages, cost, embedding) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).bind(now.toISOString(), q, normed, JSON.stringify(out), JSON.stringify(pack.passages.map(({ text, ...p }) => p)), cost, JSON.stringify(vector)).run();
  return { ...out, id: meta && meta.last_row_id, cost };
}
