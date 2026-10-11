/* Episode boards: moments from a transcript, outside sources, and checks.
   Runs over every prepared desk named jesus-way-*, whatever episodes exist. */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { CHROME, URL, OUT } = require('./env');
const pass = [], fail = [];
const ok = (name, cond, extra) => { const l = name + (extra != null ? ' :: ' + extra : ''); (cond ? pass : fail).push(l); console.log((cond ? 'live ok  ' : 'live XX  ') + l); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const INDEX = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'dist', 'desk.json'), 'utf8'));
const BOARDS = INDEX.desks.filter(d => /^jesus-way-/.test(d.slug));

(async () => {
  ok('there is at least one episode board', BOARDS.length > 0, BOARDS.map(b => b.slug).join(', '));
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    defaultViewport: { width: 1500, height: 950 }, args: ['--no-sandbox', '--disable-gpu'] });
  const errs = [];
  const page = async hash => {
    const p = await (await browser.createBrowserContext()).newPage();
    p.on('pageerror', e => errs.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(URL + hash, { waitUntil: 'load' });
    await p.waitForSelector('.tray-case');
    await sleep(1200);
    return p;
  };

  for (const board of BOARDS) {
    const tag = board.slug;
    const p = await page('#desk=' + board.slug);
    const want = board.desk.it.filter(x => x[0] !== 'f').length;
    const got = await p.evaluate(() => document.querySelectorAll('.nodes .node').length);
    ok(`${tag}: every card the build kept is on the board`, got === want, `${got} of ${want}`);

    const cards = await p.evaluate(() => {
      const box = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
      return {
        moments: [].slice.call(document.querySelectorAll('.pincard.moment')).map(b => ({
          tier: b.querySelector('.tier').textContent, stamp: b.querySelector('.stamp').textContent,
          held: !!b.querySelector('.stamp.held') })),
        outside: [].slice.call(document.querySelectorAll('.pincard.outside')).map(b => b.querySelector('.stamp').textContent),
        checks: [].slice.call(document.querySelectorAll('.notepad.verdict')).length,
        nodes: [].slice.call(document.querySelectorAll('.nodes .node')).map(n => box(n))
      };
    });
    const nMoments = board.desk.it.filter(x => x[0] === 'm').length;
    ok(`${tag}: each moment shows its episode and time`, cards.moments.length === nMoments &&
      cards.moments.every(m => /JESUS WAY \d+ · \d+:\d\d/.test(m.tier)), cards.moments[0] && cards.moments[0].tier);
    ok(`${tag}: moments are stamped pointer, never held`, cards.moments.every(m => m.stamp === 'POINTER · NOT PROOF' && !m.held));
    ok(`${tag}: outside sources say checked by hand`, cards.outside.every(s => s === 'OUTSIDE · CHECKED BY HAND'));
    ok(`${tag}: every claim has a coloured check`, cards.checks === nMoments, `${cards.checks} checks, ${nMoments} moments`);

    let overlaps = 0;
    for (let i = 0; i < cards.nodes.length; i++) for (let j = i + 1; j < cards.nodes.length; j++) {
      const a = cards.nodes[i], b = cards.nodes[j];
      if (a.l < b.r - 2 && b.l < a.r - 2 && a.t < b.b - 2 && b.t < a.b - 2) overlaps++;
    }
    ok(`${tag}: no two cards overlap`, overlaps === 0, overlaps + ' overlapping pairs');

    const strings = board.desk.ln;
    const momentIds = new Set(board.desk.it.filter(x => x[0] === 'm').map(x => `m:${x[1]}|${x[2]}`));
    ok(`${tag}: every moment is tied to its check`, [...momentIds].every(id => strings.some(l => l[0] === id || l[1] === id)));

    /* Open a moment: the paragraph in context, the words marked, a link to the time. */
    /* Go to the first section, as a reader would, so its cards are on screen. */
    await p.evaluate(() => { const r = document.querySelector('#trayHere .here-row'); if (r) r.click(); });
    await sleep(700);
    await (await p.$('.pincard.moment')).click();
    await sleep(400);
    const reader = await p.evaluate(() => {
      const watch = [].slice.call(document.querySelectorAll('#readerFoot a')).filter(a => /Watch/.test(a.textContent))[0];
      return { open: !document.getElementById('reader').hidden,
        mark: (document.querySelector('#readerBody mark') || {}).textContent || '',
        watch: watch ? watch.href : '', note: document.getElementById('readerNote').textContent,
        stamp: (document.querySelector('#readerStatus .stamp') || {}).textContent };
    });
    const first = board.desk.it.filter(x => x[0] === 'm')[0];
    ok(`${tag}: a moment opens with the words marked in context`, reader.mark.toLowerCase().replace(/’/g, "'") === first[2].toLowerCase(), reader.mark.slice(0, 50));
    ok(`${tag}: and a link to watch that moment`, /youtu/.test(reader.watch) && /[?&]t=\d+/.test(reader.watch), reader.watch);
    ok(`${tag}: the reader says captions are not proof`, /not that it is so/.test(reader.note) && reader.stamp === 'POINTER · NOT PROOF');
    if (board === BOARDS[0]) await p.screenshot({ path: OUT + '/e01-moment.png' });
    await p.keyboard.press('Escape'); await sleep(250);

    if (cards.outside.length) {
      await (await p.$('.pincard.outside')).click();
      await sleep(350);
      const w = await p.evaluate(() => ({ link: ((document.querySelector('#readerFoot a') || {}).href) || '',
        quote: (document.querySelector('#readerBody .snippet') || {}).textContent || '' }));
      const firstW = board.desk.it.filter(x => x[0] === 'w')[0];
      ok(`${tag}: an outside source opens to its quote and its page`, w.link === firstW[1] && w.quote.indexOf(firstW[3]) >= 0, w.link);
      await p.keyboard.press('Escape'); await sleep(200);
    }

    /* Search finds a moment by its words. */
    const word = first[2].split(/\s+/).filter(x => x.length > 5)[0] || first[2].split(/\s+/)[0];
    await p.click('#tq', { clickCount: 3 }); await p.keyboard.type(word); await sleep(500);
    const found = await p.evaluate(() => [].slice.call(document.querySelectorAll('#trayHere .here-row')).filter(r => r.offsetParent && /MOMENT/.test(r.textContent)).length);
    ok(`${tag}: tray search finds moments by what was said`, found > 0, word);

    /* Keeping the board keeps every moment and outside source. */
    p.on('dialog', d => d.accept());
    await p.evaluate(() => { const b = [].slice.call(document.querySelectorAll('button')).filter(x => /KEEP THIS AS MY DESK/.test(x.textContent))[0]; b.click(); });
    await sleep(500);
    await p.goto(URL, { waitUntil: 'load' }); await p.waitForSelector('.tray-case'); await sleep(900);
    const kept = await p.evaluate(() => ({ m: document.querySelectorAll('.pincard.moment').length, w: document.querySelectorAll('.pincard.outside').length,
      v: document.querySelectorAll('.notepad.verdict').length }));
    ok(`${tag}: kept as my desk, moments, sources and checks all come back`, kept.m === nMoments && kept.w === cards.outside.length && kept.v === cards.checks, JSON.stringify(kept));
    await p.close();
  }

  /* A moment the build cannot vouch for is dropped from a shared link, not shown. */
  const good = BOARDS[0].desk.it.filter(x => x[0] === 'm')[0];
  const bogus = { v: 1, vp: [0, 0, 1], it: [good.slice(0, 3).concat([0, 0, 250]), ['m', good[1], 'words nobody ever said on the show', 300, 0, 250],
    ['w', 'http://insecure.example.com', 'x', 'y', 600, 0, 250], ['w', 'https://example.com/', 'An example page', 'Example Domain', 900, 0, 250]], ln: [] };
  const q = await page('#b=' + encodeURIComponent(JSON.stringify(bogus)));
  const shared = await q.evaluate(() => ({ m: document.querySelectorAll('.pincard.moment').length, w: document.querySelectorAll('.pincard.outside').length }));
  ok('a shared link keeps a real moment and drops an invented one', shared.m === 1, JSON.stringify(shared));
  ok('an outside source must be https', shared.w === 1);
  await q.close();

  ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  await browser.close();
  console.log(`\n${pass.length} passed, ${fail.length} failed`);
  if (fail.length) { console.log('FAILED:\n  ' + fail.join('\n  ')); process.exitCode = 1; }
})().catch(e => { console.error('TEST ERROR', e); process.exit(2); });
