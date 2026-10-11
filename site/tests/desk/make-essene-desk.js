/* Builds site/data/desks/essenes-sacrifice-meat.json: lay out, measure every card in
   real Chrome, lay out again with the real heights. */
const puppeteer = require('puppeteer-core');
const { CHROME, URL } = require('./env');
const fs = require('fs');
const OUT = require('path').join(__dirname, '..', '..', 'data', 'desks', 'essenes-sacrifice-meat.json');

const E = 'essene-nazarene-origins', SC = 'sacrifice-culture-vegetarian-jesus', JT = 'jesus-and-the-torah';
const W = 250, GAP = 22, GAPX = 26, PAD = 26, FRAME_GAP = 90, ROW_GAP = 130;

/* ---- the content ---- */
const S = (c, i) => ({ k: 's', c, i, id: `s:${c}:${i}` });
const Q = c => ({ k: 'q', c, id: `q:${c}`, w: 270 });
const V = key => ({ k: 'v', key, id: `v:${key}` });
const D = path => ({ k: 'd', path, id: `d:${path}` });
let nn = 0;
const N = (name, text, w) => ({ k: 'n', name, text, w: w || W });

const notes = {
  res: N('res', 'THE RESOLUTION\n\nJesus belonged to an Essene group that rejected animal sacrifice and did not eat meat.', 540),
  hold: N('hold', 'HOW WE HOLD IT: three claims, and they are not equally strong.\n\n' +
    '1. SACRIFICE. Our strongest ground, and it is red text about Jesus himself: Hosea quoted twice, the Temple action, Mark 12:33-34.\n\n' +
    '2. MEAT. Strong for the movement after him: Paul concedes vegetable-only believers in Rome by 57, then James, Matthew, the Clementines, Ancyra, every witness hostile or disinterested. For the Essenes themselves there is one ancient witness, Jerome (393), and he credits Josephus, who doesn\'t say it. Argue the Nazarene movement, not the Essene menu.\n\n' +
    '3. BELONGING. Strong as a stream, weak as a membership card. Claim the stream.\n\n' +
    'The sentence that holds every word: the movement that claimed succession from Jesus through his brother James rejected sacrifice and abstained from flesh, and we know it from the people who were trying to discredit it.', 540),
  stream: N('stream', 'A vocabulary found nowhere in the Hebrew Bible ("spirit of truth", "children of light") runs all through the gospels. Same proof text, same wilderness, same immersion. That is the stream.\n\nDon\'t claim a membership card: he ate with sinners and drank wine, and reform movements criticize their parent hardest.'),
  red: N('red', 'This half is red text about Jesus himself. He threw Hosea 6:6 at the men running the cult, twice. He stopped the Temple traffic quoting the one chapter where God denies commanding burnt offerings, and Mark 11:18 says that is when they sought to destroy him.'),
  after: N('after', 'From Paul in 57 to a church council in 314, every witness here was hostile or disinterested, which is why it holds. Councils legislate against what is happening.\n\nConcede the asymmetry out loud: this is evidence about the movement, not about what was on Jesus\'s plate.'),
  pete: N('pete', 'DR. PETE (Orthodox), Kam\'s video 04: "He kept Passover, so he ate the lamb."\n\nNo gospel narrates him eating lamb. All three Synoptics narrate bread and wine at the sacrificial meal.'),
  fish: N('fish', '"He ate broiled fish. Q calls him a glutton."\n\nThat lands on belonging, not on the movement\'s practice. A movement\'s rule and its founder\'s table are different records, and the gospels were never a diet log.'),
  davis: N('davis', 'JOHN DAVIS, episode 026 (17:20, 21:22): the only writings saying Jesus was vegetarian "came out of the Theosophical Society", and until Blavatsky he was "never linked with the Essenes."\n\nConcede the modern books (Ouseley 1898-1901, Szekely). Then the dates: Theosophy is 1875. Romans 14:2 is c. 57, Hegesippus c. 170, Clement c. 200, Ancyra 314. A vegetarian Christian church existed by 1809, and Bahrdt wrote an Essene, anti-sacrifice Jesus in the 1780s. ANSWERED: brief D, on the sacrifice card.'),
  dns1: N('dns1', '✗ "Qumran was anti-sacrifice."\nThe Temple Scroll prescribes it and 4QMMT is about doing it correctly. Boycott, not abolition.'),
  dns2: N('dns2', '✗ "Porphyry says the Essenes abstained from all animal food."\nHe doesn\'t; that line is not in his text. Nor do Philo, Josephus or Pliny. Only Jerome says it (the card beside), crediting Josephus, who doesn\'t.'),
  dns3: N('dns3', '✗ Josephus on the Essenes not sacrificing (Antiquities 18.1.5).\nThe sentence turns on a disputed negative.'),
  dns4: N('dns4', '✗ The Essene Gospel of Peace as an ancient text.\nIt is Szekely\'s, a twentieth-century book.'),
  dns5: N('dns5', '✗ "I have no desire to eat the flesh of this Passover" as Jesus\'s words.\nIt is Epiphanius quoting the Ebionites\' version of Luke 22:15: evidence of the movement, not of Jesus.')
};

const header = { items: [notes.res, notes.hold, Q(E), Q(SC)] };
const rows = [
  [
    { title: '1 · WHERE HE CAME FROM', ci: 0, cols: [[S(E, 16), S(E, 3), S(E, 4), S(E, 6)], [S(E, 8), S(E, 0), S(E, 1), S(E, 2)], [notes.stream]] },
    { title: '2 · HE OPPOSED THE SACRIFICES', ci: 2, cols: [[S(SC, 2), S(SC, 0), S(SC, 1), S(SC, 6)], [S(SC, 4), S(SC, 5), S(SC, 8), notes.red]] },
    { title: 'THE PROPHETS HE STOOD IN', ci: 1, cols: [[V('Isaiah 1:11-17'), V('Amos 5:21-25')], [V('Psalms 51:16-17'), V('Micah 6:6-8')]] }
  ],
  [
    { title: '3 · THE MOVEMENT AFTER HIM: NO ALTAR, NO MEAT', ci: 3, cols: [[S(SC, 17), S(SC, 14), S(SC, 21), S(SC, 15)], [S(SC, 18), S(SC, 19), S(SC, 20), S(JT, 15)], [S(SC, 22), S(SC, 16), S(E, 13), S(E, 15), notes.after]] },
    { title: 'WHAT THEY WILL SAY · AND THE ANSWER', ci: 0, cols: [[S(SC, 11), notes.pete, S(SC, 10), notes.fish], [S(SC, 9), S(SC, 12), S(E, 9), S(JT, 11)], [notes.davis, S(E, 10)]] },
    { title: 'DO NOT SAY', ci: 2, cols: [[notes.dns1, notes.dns2, notes.dns3, notes.dns4, notes.dns5], [S(E, 17)]] },
    { title: 'GO DEEPER', ci: 1, cols: [[D('questions/nazarene-sect-sacrifice-and-diet.md'), D('christianity/the-nazarenes.md'),
      D('christianity/prophetic-tradition-against-sacrifice.md'), D('christianity/james-the-just-key-to-understanding-jesus.md')]] }
  ]
];

/* Strings that tell the story, by note name or item id. */
const strings = [
  ['hold', `q:${E}`], ['hold', `q:${SC}`], ['res', 'hold'],
  [`q:${E}`, `s:${E}:3`], [`s:${E}:3`, `s:${E}:4`], [`s:${E}:0`, `s:${E}:1`], [`q:${E}`, `s:${E}:8`],
  [`s:${E}:8`, `s:${SC}:16`],
  [`q:${SC}`, `s:${SC}:2`], [`s:${SC}:2`, `s:${SC}:0`], [`s:${SC}:2`, `s:${SC}:1`], [`s:${SC}:4`, `s:${SC}:5`],
  [`s:${SC}:6`, 'v:Micah 6:6-8'], [`s:${SC}:5`, 'v:Isaiah 1:11-17'],
  [`s:${SC}:14`, `s:${SC}:15`], [`s:${JT}:15`, `s:${SC}:16`], [`s:${SC}:14`, `s:${E}:13`],
  [`s:${SC}:11`, 'pete'], [`s:${SC}:10`, 'fish'], ['davis', `s:${SC}:14`], ['dns1', `s:${E}:10`],
  ['d:questions/nazarene-sect-sacrifice-and-diet.md', 'hold'],
  [`s:${E}:16`, `q:${E}`], ['dns2', `s:${E}:17`], ['davis', `s:${SC}:17`], [`s:${SC}:18`, `s:${SC}:19`], [`s:${SC}:22`, 'after']
];

/* ---- layout ---- */
function layout(H) {
  const h = it => H[keyOf(it)] || 150;
  const it = [], pos = {};
  const place = (x, y, item) => { pos[keyOf(item)] = { x, y, item }; };
  /* header */
  let x = 0;
  const hy = 0;
  header.items.forEach(item => { place(x, hy, item); x += (item.w || W) + 40; });
  let y = Math.max.apply(null, header.items.map(i => h(i))) + ROW_GAP;
  const frames = [];
  rows.forEach(row => {
    let fx = 0, rowH = 0;
    row.forEach(f => {
      const top = y + PAD;
      let cx = fx + PAD, tallest = 0;
      f.cols.forEach(col => {
        let cy = top;
        const cw = Math.max.apply(null, col.map(i => i.w || W));
        col.forEach(item => { place(cx, cy, item); cy += h(item) + GAP; });
        tallest = Math.max(tallest, cy - GAP - top);
        cx += cw + GAPX;
      });
      const fw = cx - GAPX + PAD - fx, fh = tallest + PAD * 2;
      frames.push({ title: f.title, x: fx, y, w: fw, h: fh, ci: f.ci });
      rowH = Math.max(rowH, fh);
      fx += fw + FRAME_GAP;
    });
    y += rowH + ROW_GAP + 20;
  });
  /* Encode in desk order: frames first (numbered f:1..), then cards and notes. */
  let seq = 1;
  const idOf = {};
  frames.forEach(f => { it.push(['f', f.title, f.x, f.y, f.w, f.h, f.ci]); seq++; });
  Object.keys(pos).forEach(k => {
    const { x, y, item } = pos[k];
    if (item.k === 's') it.push(['s', item.c, item.i, x, y, W]);
    else if (item.k === 'q') it.push(['q', item.c, x, y, item.w]);
    else if (item.k === 'v') it.push(['v', item.key, x, y, W]);
    else if (item.k === 'd') it.push(['d', item.path, x, y, W]);
    else if (item.k === 'n') { it.push(['n', item.text, x, y, item.w]); idOf[item.name] = 'n:' + seq; seq++; }
  });
  const ln = strings.map(([a, b]) => [idOf[a] || a, idOf[b] || b]);
  return { v: 1, vp: [40, 40, 0.4], it, ln };
}
const keyOf = item => item.k === 'n' ? 'n:' + item.name : item.id;

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', defaultViewport: { width: 1600, height: 1000 }, args: ['--no-sandbox'] });
  const measure = async desk => {
    const p = await (await browser.createBrowserContext()).newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL + '#b=' + encodeURIComponent(JSON.stringify(desk)), { waitUntil: 'load' });
    await p.waitForSelector('.tray-case'); await new Promise(r => setTimeout(r, 1500));
    const m = await p.evaluate(() => {
      const out = {};
      [].slice.call(document.querySelectorAll('.nodes .node')).forEach(n => {
        const ta = n.querySelector('textarea');
        out[n.getAttribute('data-id')] = { h: n.offsetHeight, text: ta ? ta.value : null };
      });
      return { out, strings: document.querySelectorAll('#links .string-line').length };
    });
    if (errs.length) throw new Error(errs.join(' | '));
    return m;
  };
  /* Pass 1 with guesses; map note ids back to names by their text. */
  const d1 = layout({});
  const m1 = await measure(d1);
  const H = {};
  Object.keys(m1.out).forEach(id => {
    const r = m1.out[id];
    if (r.text != null) { const n = Object.values(notes).find(n => n.text === r.text); if (n) H['n:' + n.name] = r.h; }
    else H[id] = r.h;
  });
  const missing = d1.it.length - Object.keys(m1.out).length;
  const d2 = layout(H);
  const m2 = await measure(d2);
  /* Check: every height the same as measured, so the gaps are exact. */
  let drift = 0;
  Object.keys(m2.out).forEach(id => { const r = m2.out[id]; const k = r.text != null ? 'n:' + Object.values(notes).find(n => n.text === r.text).name : id; if (H[k] !== r.h) drift++; });
  const file = {
    slug: 'essenes-sacrifice-meat',
    title: 'Jesus, the Essenes, sacrifice and meat',
    subtitle: 'The strongest honest case, the counter-arguments it has to answer, and where our own side overreaches.',
    by: 'Rex & Matt',
    formerly: ['essene-debate'],
    desk: d2
  };
  fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(file, null, 1) + '\n', 'utf8');
  console.log(JSON.stringify({ items: d2.it.length, rendered: Object.keys(m2.out).length, missingPass1: missing, strings: d2.ln.length, drawn: m2.strings, heightDrift: drift }));
  await browser.close();
})().catch(e => { console.error('GEN ERROR', e); process.exit(2); });
