/* Source links in the Reading Room: on every card, every underlined word in
   the finding opens the held source behind it, with the cited phrase
   highlighted, and the reader's switch turns them off and back on. */
const puppeteer = require('puppeteer-core');
const { CHROME, BASE } = require('./env');
const fail = [];
let passed = 0;
const ok = (name, cond, extra) => {
  const l = name + (extra != null ? ' :: ' + extra : '');
  if (cond) passed++; else fail.push(l);
  console.log((cond ? '  ok  ' : '  XX  ') + l);
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    defaultViewport: { width: 1400, height: 900 }, args: ['--no-sandbox', '--disable-gpu'] });
  const p = await (await browser.createBrowserContext()).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await p.goto(BASE + 'index.html#/', { waitUntil: 'load' });
  await sleep(800);
  const data = await p.evaluate(() => fetch('data.json').then(r => r.json()));

  for (const card of data.cards) {
    await p.goto(BASE + 'index.html#/' + card.slug, { waitUntil: 'load' });
    await sleep(500);
    const n = await p.$$eval('#finding .finding-link', a => a.length);
    ok(`${card.slug}: ${card.findingLinks.length} links underlined`, n === card.findingLinks.length && n > 0, n);
    const text = await p.$eval('#finding', e => e.textContent);
    ok(`${card.slug}: finding text unchanged by the links`, text === card.finding);

    const norm = t => t.toLowerCase().replace(/’/g, "'").replace(/[^a-z0-9 ]/g, '').replace(/ +/g, ' ').trim();
    for (let i = 0; i < n; i++) {
      // Underlines appear in reading order; find which link this one is.
      const words = await p.$$eval('#finding .finding-link', (a, i) => a[i].textContent, i);
      const link = card.findingLinks.find(l => l.words === words);
      ok(`${card.slug}: underline ${i + 1} is a declared link`, !!link, words);
      if (!link) continue;
      for (let k = 0; k < link.src.length; k++) {
        const src = card.sources[link.src[k]];
        await p.$$eval('#finding .finding-link', (a, i) => a[i].click(), i);
        await sleep(150);
        for (let step = 0; step < k; step++) {
          await p.evaluate(() => { const b = document.querySelectorAll('.reader-pager .copy'); b[b.length - 1].click(); });
          await sleep(100);
        }
        const r = await p.evaluate(() => ({
          open: !document.getElementById('reader').hidden,
          title: document.getElementById('readerTitle').textContent,
          mark: (document.querySelector('#readerBody mark') || {}).textContent || '',
          pager: (document.querySelector('.reader-pager span') || {}).textContent || ''
        }));
        const label = `${card.slug}: "${link.words}" → ${src.title || src.ref}`;
        ok(label + ' opens', r.open && r.title === (src.title || src.ref), r.title);
        ok(label + ' highlights the cited phrase', !src.phrase || norm(r.mark) === norm(src.phrase), r.mark);
        if (link.src.length > 1) ok(label + ' pager', r.pager === `${k + 1} of ${link.src.length}`, r.pager);
        await p.click('#readerClose');
        await sleep(80);
      }
    }
  }

  // The reader's switch: off removes every underline, on brings them back.
  await p.goto(BASE + 'index.html#/hell-afterlife', { waitUntil: 'load' });
  await sleep(500);
  await p.click('#linkSwitch'); await sleep(150);
  ok('switch off: no underlines', await p.$$eval('#finding .finding-link', a => a.length) === 0);
  await p.reload({ waitUntil: 'load' }); await sleep(500);
  ok('switch off survives a reload', await p.$$eval('#finding .finding-link', a => a.length) === 0);
  await p.click('#linkSwitch'); await sleep(150);
  ok('switch back on: underlines return', await p.$$eval('#finding .finding-link', a => a.length) > 0);

  ok('no page errors', errs.length === 0, errs.join(' | '));
  await browser.close();
  console.log(`${passed} checks passed${fail.length ? ', ' + fail.length + ' failed' : ''}`);
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR ' + e.stack); process.exit(2); });
