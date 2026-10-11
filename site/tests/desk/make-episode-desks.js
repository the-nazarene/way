/* Builds a prepared desk for each checked episode breakdown:
     site/data/episodes/<n>.json  ->  site/data/desks/jesus-way-<n>.json

   node make-episode-desks.js            every breakdown
   node make-episode-desks.js 066 065    only these

   Run check-episode.py on a breakdown first. Each board: a header that says
   what the episode argues and how to read the board; one section per topic,
   each claim a row of moment -> check -> evidence tied by string; then
   corrections, questions, and the case files it touches. Laid out with
   guessed heights, built, measured in a real browser, laid out again. */

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { CHROME } = require('./env');
const { serve } = require('./serve');

const ROOT = path.join(__dirname, '..', '..', '..');
const EPS = path.join(ROOT, 'site', 'data', 'episodes');
const DESKS = path.join(ROOT, 'site', 'data', 'desks');
const W = 250, CHECK = 320, GAP = 22, GAPX = 30, PAD = 26, ROWGAP = 40, FRAME_GAP = 90, ROW_GAP = 130;
const SYM = { 'HOLDS': '✓', 'NARROWER': '~', "DOESN'T HOLD": '✗', 'OPEN': '?', 'INTERPRETATION': '◇', 'EXPERIENCE': '•' };
const ORDER = ['HOLDS', 'NARROWER', "DOESN'T HOLD", 'OPEN', 'INTERPRETATION', 'EXPERIENCE'];

function build() {
  for (const py of ['python', 'python3', 'py']) {
    const r = spawnSync(py, [path.join('site', 'build.py')], { cwd: ROOT, encoding: 'utf8' });
    if (r.error) continue;
    if (r.status !== 0) throw new Error(r.stdout + r.stderr);
    return r.stdout;
  }
  throw new Error('Python not found');
}

/* ---- one board's plan, before any coordinates ---- */
function plan(ep) {
  const notes = [];
  const N = (text, w) => { const n = { k: 'n', text, w: w || CHECK }; notes.push(n); return n; };
  const counts = {};
  ep.topics.forEach(t => t.claims.forEach(c => { counts[c.verdict] = (counts[c.verdict] || 0) + 1; }));
  const total = ep.topics.reduce((a, t) => a + t.claims.length, 0);
  const tally = ORDER.filter(v => counts[v]).map(v => `${SYM[v]} ${v.toLowerCase()}: ${counts[v]}`).join('\n');
  const head = N(`JESUS WAY ${ep.episode} · ${ep.title}\n\n` +
    (ep.guests && ep.guests.length ? `With ${ep.guests.join(', ')}. ` : '') + `From The Jesus Way, Aaron Abke and James Benefico's podcast. Posted ${ep.date}.\n\n` +
    `${ep.summary}\n\nHOW TO READ THIS BOARD: each grey card is a moment from the episode, with its time; ▶ opens the video there. ` +
    `Beside it is the check, and beside that the evidence, tied by string. Click any card to read it.`, 600);
  const legend = N(`THE CHECKS ON THIS BOARD\n\n${total} claims from the episode, each checked against the texts and sources.\n\n${tally}\n\n` +
    `✓ holds as said · ~ true in a narrower form · ✗ the sources say otherwise · ? scholars are divided · ◇ a reading of the text, not a fact to check · • a story, labeled, not checked.`, 340);

  const seen = new Set(), cases = [];
  const topics = ep.topics.map(t => ({
    title: t.title,
    rows: t.claims.map(c => {
      const moment = { k: 'm', key: ep.episode, phrase: c.phrase, sp: c.speaker && c.speaker !== 'unclear' ? c.speaker : '', id: `m:${ep.episode}|${c.phrase}` };
      const check = N(`${SYM[c.verdict]} ${c.verdict}\n\n${c.claim}\n\n${c.check}`);
      const evidence = [], ties = [];
      const add = it => { ties.push(it.id); if (!seen.has(it.id)) { seen.add(it.id); evidence.push(it); } };
      (c.verses || []).forEach(v => add({ k: 'v', key: v, id: `v:${v}` }));
      (c.repo || []).forEach(r => {
        add({ k: 's', c: r.card, i: r.source, id: `s:${r.card}:${r.source}` });
        if (cases.indexOf(r.card) < 0) cases.push(r.card);
      });
      (c.sources || []).forEach(s => add({ k: 'w', url: s.url, title: s.title, quote: s.quote, id: `w:${s.url}|${s.quote}` }));
      return { moment, check, evidence, ties };
    })
  }));
  const fixes = (ep.corrections || []).map(x => N(`SAY IT CAREFULLY\n\n${x}`));
  const asks = (ep.questions || []).map(x => N(`QUESTION TO EXPLORE\n\n${x}`));
  return { notes, head, legend, topics, fixes, asks, cases, total, counts };
}

const keyOf = it => it.k === 'n' ? 'n:' + it.text : it.id;

/* ---- coordinates from a plan and measured heights ---- */
function layout(ep, P, H) {
  const h = it => H[keyOf(it)] || (it.k === 'n' ? 180 : 140);
  const placed = [], frames = [];
  const put = (it, x, y) => placed.push({ it, x, y });
  put(P.head, 0, 0);
  put(P.legend, 600 + 40, 0);
  let y = Math.max(h(P.head), h(P.legend)) + ROW_GAP;

  /* Topic sections, two to a row. */
  const EX = PAD + W + GAPX + CHECK + GAPX;
  const fw = EX + W + GAP + W + PAD;
  for (let i = 0; i < P.topics.length; i += 2) {
    let rowH = 0;
    P.topics.slice(i, i + 2).forEach((t, j) => {
      const fx = j * (fw + FRAME_GAP);
      let cy = y + PAD;
      t.rows.forEach(r => {
        put(r.moment, fx + PAD, cy);
        put(r.check, fx + PAD + W + GAPX, cy);
        /* Evidence in two columns, each card going to the shorter one. */
        const col = [cy, cy];
        r.evidence.forEach(e => {
          const c = col[0] <= col[1] ? 0 : 1;
          put(e, fx + EX + c * (W + GAP), col[c]); col[c] += h(e) + GAP;
        });
        const ev = r.evidence.length ? Math.max(col[0], col[1]) - cy - GAP : 0;
        cy += Math.max(h(r.moment), h(r.check), ev) + ROWGAP;
      });
      const fh = cy - ROWGAP + PAD - y;
      frames.push({ title: t.title, x: fx, y, w: fw, h: fh, ci: frames.length % 4 });
      rowH = Math.max(rowH, fh);
    });
    y += rowH + ROW_GAP;
  }

  /* The closing row: say it carefully, questions, the case files it touches. */
  const tail = [['SAY IT CAREFULLY', P.fixes, 2], ['QUESTIONS TO EXPLORE', P.asks, 1],
    ['THE CASE FILES THIS TOUCHES', P.cases.map(c => ({ k: 'q', c, id: `q:${c}`, w: 270 })), 3]].filter(x => x[1].length);
  let fx = 0;
  tail.forEach(([title, list, ci]) => {
    let cy = y + PAD, cw = 0;
    list.forEach(it => { put(it, fx + PAD, cy); cy += h(it) + GAP; cw = Math.max(cw, it.w || W); });
    frames.push({ title, x: fx, y, w: PAD * 2 + cw, h: cy - GAP + PAD - y, ci });
    fx += PAD * 2 + cw + FRAME_GAP;
  });

  /* Encode in desk order: frames first, then everything else; notes and
     frames share one counter, exactly as the Desk numbers them. */
  let seq = 1;
  const it = [], idOf = {};
  frames.forEach(f => { it.push(['f', f.title, f.x, f.y, f.w, f.h, f.ci]); seq++; });
  placed.forEach(({ it: x, x: px, y: py }) => {
    if (x.k === 'n') { it.push(['n', x.text, px, py, x.w]); idOf[keyOf(x)] = 'n:' + seq; seq++; }
    else if (x.k === 'm') it.push(['m', x.key, x.phrase, px, py, W, x.sp]);
    else if (x.k === 'v') it.push(['v', x.key, px, py, W]);
    else if (x.k === 's') it.push(['s', x.c, x.i, px, py, W]);
    else if (x.k === 'w') it.push(['w', x.url, x.title, x.quote, px, py, W]);
    else if (x.k === 'q') it.push(['q', x.c, px, py, 270]);
  });
  const ln = [];
  P.topics.forEach(t => t.rows.forEach(r => {
    const cid = idOf[keyOf(r.check)];
    ln.push([r.moment.id, cid]);
    r.ties.forEach(e => ln.push([cid, e]));
  }));
  return { v: 1, vp: [40, 40, 0.4], it, ln };
}

function writeDesk(ep, P, desk) {
  const counts = ORDER.filter(v => P.counts[v]).map(v => `${SYM[v]} ${P.counts[v]}`).join('  ');
  const file = {
    slug: `jesus-way-${ep.episode}`,
    title: `Jesus Way ${ep.episode}: ${ep.title}`,
    subtitle: `Episode board: ${P.total} claims from the episode, each checked against the sources (${counts}).`,
    by: 'Rex & Matt',
    desk
  };
  fs.writeFileSync(path.join(DESKS, file.slug + '.json'), JSON.stringify(file, null, 1) + '\n', 'utf8');
  return file.slug;
}

(async () => {
  const only = process.argv.slice(2);
  const eps = fs.readdirSync(EPS).filter(f => /^\d+\.json$/.test(f)).map(f => JSON.parse(fs.readFileSync(path.join(EPS, f), 'utf8')))
    .filter(e => !only.length || only.includes(e.episode));
  const plans = eps.map(e => [e, plan(e)]);
  plans.forEach(([e, P]) => writeDesk(e, P, layout(e, P, {})));
  build();
  const server = await serve(8779);
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', defaultViewport: { width: 1600, height: 1000 }, args: ['--no-sandbox'] });
  for (const [e, P] of plans) {
    const slug = `jesus-way-${e.episode}`;
    const p = await (await browser.createBrowserContext()).newPage();
    const errs = []; p.on('pageerror', x => errs.push(x.message));
    await p.goto('http://localhost:8779/canvas.html#desk=' + slug, { waitUntil: 'load' });
    await p.waitForSelector('.tray-case'); await new Promise(r => setTimeout(r, 1600));
    const m = await p.evaluate(() => {
      const out = {};
      [].slice.call(document.querySelectorAll('.nodes .node')).forEach(n => {
        const ta = n.querySelector('textarea');
        out[ta ? 'n:' + ta.value : n.getAttribute('data-id')] = n.offsetHeight;
      });
      return out;
    });
    const desk = layout(e, P, m);
    writeDesk(e, P, desk);
    const placedCards = desk.it.filter(x => x[0] !== 'f').length;
    console.log(`${slug}: ${placedCards} on the board, ${Object.keys(m).length} rendered, ${desk.ln.length} strings${errs.length ? ', ERRORS ' + errs.join(' | ') : ''}`);
    await p.close();
  }
  await browser.close();
  server.close();
  const out = build();
  const warn = out.split('\n').filter(l => /desks\/jesus-way/.test(l));
  if (warn.length) { console.log('build warnings:\n' + warn.join('\n')); process.exitCode = 1; }
})().catch(e => { console.error('GEN ERROR', e); process.exit(2); });
