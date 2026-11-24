// The written-answer test: real questions through /answer, rendered as a
// reader would see them, with whether each passed its checks and what it cost.
//
//   ASK_TOKEN=… node site/search/golden/answers.mjs http://localhost:8787 > ANSWERS.md
//
// Each answer is a real model call (about 3 to 4 cents) and is kept in the
// answer bank as a draft. Questions are spaced for the 5-a-minute limit.

const base = (process.argv[2] || 'http://localhost:8787').replace(/\/$/, '');
const token = process.env.ASK_TOKEN;
if (!token) { console.error('Set ASK_TOKEN.'); process.exit(1); }

const QUESTIONS = [
  // the prototype's ten (Nov 24)
  'Does God need blood to forgive?',
  'Did Jesus oppose the sacrifice system?',
  'Did Jesus claim to be God?',
  'Is the rapture biblical?',
  'What did Jesus tell us to do?',
  'Do I have to tithe?',
  'What is the Holy Spirit?',
  'Is baptism necessary for salvation?',
  'What did Jesus look like?',
  "If Jesus isn't God, why did Thomas call him my Lord and my God?",
  // ten from the search test set (questions.json)
  'Is salvation by faith or by works?',
  'Is hell eternal torment?',
  'Why do you reject Paul?',
  'Was Jesus vegetarian?',
  'Is the Gospel of Thomas real scripture?',
  'What is the kingdom of God?',
  'What did Jesus say about divorce?',
  'How should I pray?',
  'Should Christians love their enemies?',
  'What did Jesus say about money and the rich?',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const quote = (w) => `> ${w.text || w.quote}  \n> — ${w.ref ? `[${w.ref} (KJV)](${w.url})` : `[${w.title} · ${w.header}](${w.url})`}`;

function render(q, res, ms) {
  const out = [`## ${q}`, ''];
  const a = res.answer;
  const status = res.mode === 'fallback' ? `**FALLBACK**: ${res.reason}${res.problems ? ` (${res.problems.join('; ')})` : ''}` : `**${res.mode}**`;
  out.push(`${status} · $${(res.cost || 0).toFixed(4)} · ${(ms / 1000).toFixed(0)}s${res.warnings && res.warnings.length ? ` · flags: ${res.warnings.join('; ')}` : ''}`, '');
  if (res.card) out.push(`**The card for this:** [${res.card.title}](${res.card.url})`, '');
  if (a) {
    out.push(`*${res.label}*`, '');
    if (a.answerable === false) {
      out.push("**The library doesn't settle this yet.**", '', a.short_answer, '');
      if (a.not_settled) out.push(a.not_settled, '');
      if (a.background) out.push(`*${res.backgroundLabel}* ${a.background}`, '');
    } else {
      out.push(`**${a.short_answer}**`, '');
      for (const w of a.jesus_words || []) out.push(quote(w), '');
      out.push(`**The usual reading:** ${a.mainstream}`, '', `**What the library finds:** ${a.library_view}`, '');
      for (const w of a.supporting || []) out.push(quote(w), '');
      if (a.against && (a.against.text || a.against.quote)) out.push('**The strongest verse the other way:**', '', quote(a.against), '', a.against.note || '', '');
      else if (a.against && a.against.note) out.push(`**The other side:** ${a.against.note}`, '');
      if (a.not_settled) out.push(`**Not settled:** ${a.not_settled}`, '');
    }
  }
  if (res.talks && res.talks.length) out.push(`**Hear it discussed** (pointers, not proof): ${res.talks.map((t) => `[${t.title}](${t.url})`).join(' · ')}`, '');
  return out.join('\n');
}

const rows = [];
const parts = [];
for (const q of QUESTIONS) {
  const t = Date.now();
  let res;
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch(`${base}/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Ask-Token': token }, body: JSON.stringify({ q }) });
    if (r.status === 429) { await sleep(61000); continue; }
    res = await r.json();
    break;
  }
  const ms = Date.now() - t;
  rows.push(`| ${q} | ${res.mode}${res.mode === 'fallback' ? ` (${res.reason})` : ''} | ${res.card ? 'yes' : ''} | $${(res.cost || 0).toFixed(4)} |`);
  parts.push(render(q, res, ms));
  console.error(`${res.mode.padEnd(8)} $${(res.cost || 0).toFixed(4)}  ${q}`);
  await sleep(Math.max(0, 13000 - ms));
}
const total = QUESTIONS.length;
console.log(['# Written answers: test run', '', `Against ${base}, ${new Date().toISOString().slice(0, 10)}.`, '',
  '| Question | Result | Card first | Cost |', '|---|---|---|---|', ...rows, '', ...parts].join('\n'));
