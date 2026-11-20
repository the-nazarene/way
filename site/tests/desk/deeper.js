/* GO DEEPER in the Reading Room: every file on every card opens in the
   reader on the site (not on GitHub), rendered and labelled, with the repo one
   link away; a #/<slug>/read/<n> link opens it directly; closing returns to
   the card; a link to a section of the same page scrolls instead of leaving. */
const puppeteer = require('puppeteer-core');
const { CHROME, BASE } = require('./env');
const fail = [];
const ok = (name, cond, extra) => {
  const l = name + (extra != null ? ' :: ' + extra : '');
  if (!cond) fail.push(l);
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
  const state = () => p.evaluate(() => {
    const body = document.querySelector('#readerBody .research');
    return {
      open: !document.getElementById('reader').hidden,
      wide: document.getElementById('reader').classList.contains('reader-wide'),
      title: document.getElementById('readerTitle').textContent,
      stamp: (document.querySelector('#readerStatus .lib-stamp') || {}).textContent || '',
      chars: body ? body.textContent.length : 0,
      rendered: body ? body.querySelectorAll('p, li, h2, h3, table').length : 0,
      repo: (document.querySelector('#readerFoot a') || {}).href || '',
      hash: location.hash
    };
  });

  ok('the card explains how to read it', await p.$eval('.howread', e => e.textContent.length > 50));

  for (const card of data.cards) {
    await p.goto(BASE + 'index.html#/' + card.slug, { waitUntil: 'load' });
    await sleep(400);
    const links = await p.$$eval('#goDeeper a', a => a.map(x => x.getAttribute('href')));
    ok(`${card.slug}: every go-deeper link stays on the site`, links.length === card.goDeeper.length && links.every(h => h.startsWith('#/')), links.join(' '));
    for (let i = 0; i < card.goDeeper.length; i++) {
      const g = card.goDeeper[i];
      await p.$$eval('#goDeeper a', (a, i) => a[i].click(), i);
      let s;
      for (let t = 0; t < 40; t++) { await sleep(100); s = await state(); if (s.chars) break; }
      const label = `${card.slug}: ${g.path}`;
      ok(label + ' opens in the reader, wide', s.open && s.wide && s.title === g.title, s.title);
      ok(label + ' is rendered, not raw', s.chars > 200 && s.rendered > 2, s.chars + ' chars, ' + s.rendered + ' blocks');
      ok(label + ' is labelled', /OUR RESEARCH|HELD TEXT|FULL CARD/.test(s.stamp), s.stamp);
      ok(label + ' links to the repo', s.repo === g.url, s.repo);
      ok(label + ' has its own address', s.hash === `#/${card.slug}/read/${i}`, s.hash);
      await p.click('#readerClose'); await sleep(100);
      ok(label + ' closes back to the card', (await state()).hash === '#/' + card.slug);
    }
  }

  // A shared link opens the file directly.
  const t = data.cards.find(c => c.slug === 'jesus-and-the-torah');
  const i = t.goDeeper.findIndex(g => g.path.endsWith('old-testament-through-jesus-lens.md'));
  await p.goto(BASE + 'index.html#/jesus-and-the-torah/read/' + i, { waitUntil: 'load' });
  let s;
  for (let k = 0; k < 40; k++) { await sleep(100); s = await state(); if (s.chars) break; }
  ok('a shared #/…/read/n link opens the file', s.open && s.title === t.goDeeper[i].title && s.chars > 200, s.title);

  // A link to a section of the same page scrolls the reader and keeps the address.
  const inPage = await p.$('#readerBody .research a[href^="#"]');
  if (inPage) {
    const before = await p.$eval('#reader', e => e.scrollTop);
    await inPage.click(); await sleep(700);
    const after = await state();
    ok('a section link stays in the reader', after.open && after.hash === '#/jesus-and-the-torah/read/' + i, after.hash);
    ok('a section link scrolls to the section', (await p.$eval('#reader', e => e.scrollTop)) !== before);
  }

  // Sources still open in the normal (narrow) reader afterwards.
  await p.goto(BASE + 'index.html#/jesus-and-the-torah/0', { waitUntil: 'load' });
  await sleep(500);
  ok('a source after a research file opens narrow again', !(await state()).wide);

  ok('no page errors', errs.length === 0, errs.join(' | '));
  await browser.close();
  console.log(fail.length ? fail.length + ' failed' : 'all passed');
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR ' + e.stack); process.exit(2); });
