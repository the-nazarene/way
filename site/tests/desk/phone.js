/* Phones: the desk read as a list. Sections in reading order, every card
   tappable to read, strings as "tied to", and the real desk one tap away. */
const puppeteer = require('puppeteer-core');
const { CHROME, URL, OUT, tool, workbench, layCase, browseCase } = require('./env');
const pass = [], fail = [];
const ok = (name, cond, extra) => { const l = name + (extra != null ? ' :: ' + extra : ''); (cond ? pass : fail).push(l); console.log((cond ? 'live ok  ' : 'live XX  ') + l); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const PHONE = { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    defaultViewport: { width: 1500, height: 950 }, args: ['--no-sandbox', '--disable-gpu'] });
  const errs = [];
  const page = async (hash, view) => {
    const p = await (await browser.createBrowserContext()).newPage();
    await p.setViewport(view || PHONE);
    p.on('pageerror', e => errs.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(URL + (hash || ''), { waitUntil: 'load' });
    await p.waitForSelector('.tray-case');
    await sleep(1200);
    return p;
  };
  const state = p => p.evaluate(() => ({
    list: !document.getElementById('phoneList').hidden,
    desk: getComputedStyle(document.querySelector('.desk')).display !== 'none',
    tools: getComputedStyle(document.querySelector('.desk-tools')).display !== 'none',
    over: document.documentElement.scrollWidth - innerWidth,
    reader: !document.getElementById('reader').hidden
  }));
  /* Tap the middle of an element, the way a finger would. */
  const tap = async (p, sel, i) => {
    const pt = await p.evaluate((s, n) => {
      const e = document.querySelectorAll(s)[n || 0];
      if (!e) return null;
      e.scrollIntoView({ block: 'center' });
      const r = e.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 30) };
    }, sel, i || 0);
    if (!pt) return false;
    await p.touchscreen.tap(pt.x, pt.y);
    await sleep(350);
    return true;
  };

  /* ---------- a prepared desk on a phone ---------- */
  const p = await page('#desk=essenes-sacrifice-meat');
  let s = await state(p);
  ok('a phone opens a prepared desk as a list, not the surface', s.list && !s.desk && !s.tools, JSON.stringify(s));
  ok('no sideways scroll at 390px', s.over <= 1, s.over);
  const shape = await p.evaluate(() => {
    return {
      title: document.getElementById('phoneTitle').textContent,
      eyebrow: document.getElementById('phoneEyebrow').textContent,
      secs: [].slice.call(document.querySelectorAll('.phone-sec-title')).map(h => h.textContent),
      toc: document.querySelectorAll('#phoneToc button').length,
      cards: [].slice.call(document.querySelectorAll('.phone-item')).map(r => r.getAttribute('data-phone-id')),
      ties: document.querySelectorAll('.phone-ties button').length,
      notesReadOnly: document.querySelectorAll('#phoneBody textarea').length === 0 && document.querySelectorAll('#phoneBody .note-text').length > 0,
      toolsGone: document.querySelectorAll('#phoneBody .node-tools').length === 0,
      fitsWidth: [].slice.call(document.querySelectorAll('.phone-item')).every(r => r.getBoundingClientRect().right <= innerWidth + 1)
    };
  });
  ok('it is titled as the prepared desk', /JESUS, THE ESSENES/i.test(shape.title) && shape.eyebrow === 'A PREPARED DESK', shape.eyebrow + ' / ' + shape.title);
  ok('every section is listed, in reading order, with a jump list', shape.secs.length === 7 && /WHERE HE CAME FROM/.test(shape.secs[0]) && /GO DEEPER/.test(shape.secs[6]) && shape.toc === 7,
    shape.secs.join(' | '));
  const want = await p.evaluate(() => {
    /* What the desk itself holds: every card and note, from the built desk data. */
    return fetch('desk.json').then(r => r.json()).then(L => {
      const d = L.desks.filter(x => x.slug === 'essenes-sacrifice-meat')[0];
      return d.desk.it.filter(x => x[0] !== 'f').length;
    });
  });
  ok('every card and note on the desk appears exactly once', shape.cards.length === want && new Set(shape.cards).size === shape.cards.length, shape.cards.length + ' of ' + want);
  ok('notes read as text, and nothing can be removed', shape.notesReadOnly && shape.toolsGone);
  ok('strings show as "tied to" links', shape.ties >= 20, shape.ties);
  ok('every card fits the width', shape.fitsWidth);
  await p.screenshot({ path: OUT + '/ph01-list.png' });
  await p.screenshot({ path: OUT + '/ph02-list-full.png', fullPage: true });

  /* Tap a source: the reader opens and fits the phone. */
  await tap(p, '.phone-item .pincard');
  s = await state(p);
  const rd = await p.evaluate(() => {
    const r = document.getElementById('reader').getBoundingClientRect();
    return { title: document.getElementById('readerTitle').textContent, fits: r.left >= -1 && r.right <= innerWidth + 1 };
  });
  ok('tapping a card opens it to read', s.reader && rd.title.length > 0, rd.title);
  ok('the reader fits the phone', rd.fits);
  await p.screenshot({ path: OUT + '/ph03-reader.png' });
  /* Following the thread on a phone opens the next thing; it never pins. */
  const before = await p.evaluate(() => document.querySelectorAll('.phone-item').length);
  const chips = await p.evaluate(() => document.querySelectorAll('#reader .chip').length);
  if (chips) {
    const t1 = rd.title;
    await tap(p, '#reader .chip');
    const t2 = await p.evaluate(() => document.getElementById('readerTitle').textContent);
    const after = await p.evaluate(() => document.querySelectorAll('.phone-item').length);
    ok('a thread link in the reader opens the next thing, and pins nothing', t2 && t2 !== t1 && after === before && !(await state(p)).desk, t1 + ' -> ' + t2);
  } else ok('a thread link in the reader opens the next thing, and pins nothing', false, 'no chips in that reader');
  await p.click('#readerClose'); await sleep(250);
  ok('closing the reader goes back to the list', !(await state(p)).reader && (await state(p)).list);

  /* "Tied to" takes you to the other card. */
  const tieTo = await p.evaluate(() => {
    const b = document.querySelector('.phone-ties button');
    return b.textContent;
  });
  await tap(p, '.phone-ties button');
  await sleep(300);
  const landed = await p.evaluate(() => {
    const f = document.querySelector('.phone-item.is-found');
    if (!f) return null;
    const r = f.getBoundingClientRect();
    return { top: r.top, inView: r.top >= -2 && r.top < innerHeight };
  });
  ok('a "tied to" link scrolls to that card and marks it', landed && landed.inView, tieTo + ' ' + JSON.stringify(landed));

  /* The jump list goes to a section. */
  await p.evaluate(() => window.scrollTo(0, 0));
  const lastSec = await p.evaluate(() => document.querySelectorAll('#phoneToc button').length - 1);
  await tap(p, '#phoneToc button', lastSec);
  const secTop = await p.evaluate(() => document.querySelectorAll('.phone-sec-title')[6].getBoundingClientRect().top);
  ok('the jump list takes you to a section', secTop >= -2 && secTop < 120, secTop);

  /* The real desk, one tap away, and back. */
  await p.evaluate(() => window.scrollTo(0, 0));
  await tap(p, '#btnPhoneDesk');
  await sleep(500);
  s = await state(p);
  const surf = await p.evaluate(() => ({ nodes: document.querySelectorAll('.nodes .node').length,
    notice: getComputedStyle(document.querySelector('.desk-narrow')).display !== 'none',
    visible: document.querySelector('.nodes .node') && (function () {
      const r = document.getElementById('surface').getBoundingClientRect(); return r.height > 200; })() }));
  ok('OPEN AS A DESK shows the real surface with everything on it', !s.list && s.desk && surf.nodes === want && surf.visible, JSON.stringify(surf));
  ok('with the touch hint and a way back', surf.notice);
  ok('still no sideways scroll', s.over <= 1, s.over);
  await p.screenshot({ path: OUT + '/ph04-desk.png' });
  await tap(p, '#btnPhoneList');
  s = await state(p);
  ok('BACK TO THE LIST returns to the list', s.list && !s.desk);

  /* Present on a phone, then Esc back to the list. */
  await tap(p, '#btnPhonePresent');
  await sleep(1200);
  const pres = await p.evaluate(() => ({ on: document.body.classList.contains('presenting'),
    caption: document.getElementById('presTitle') ? document.getElementById('presTitle').textContent : document.getElementById('presCaption').textContent,
    listHidden: document.getElementById('phoneList').hidden }));
  ok('▶ PRESENT walks the desk on a phone', pres.on && pres.listHidden, JSON.stringify(pres).slice(0, 120));
  await p.screenshot({ path: OUT + '/ph05-present.png' });
  await p.keyboard.press('Escape'); await sleep(600);
  s = await state(p);
  ok('ending it comes back to the list', s.list && !(await p.evaluate(() => document.body.classList.contains('presenting'))));
  await p.close();

  /* ---------- an episode board ---------- */
  const e = await page('#desk=jesus-way-066');
  const ep = await e.evaluate(() => ({
    list: !document.getElementById('phoneList').hidden,
    moments: document.querySelectorAll('#phoneBody .pincard.moment').length,
    outside: document.querySelectorAll('#phoneBody .pincard.outside').length,
    checks: document.querySelectorAll('#phoneBody .notepad.verdict').length,
    over: document.documentElement.scrollWidth - innerWidth
  }));
  ok('an episode board lists its moments, outside sources and checks', ep.list && ep.moments > 0 && ep.checks > 0, JSON.stringify(ep));
  ok('no sideways scroll on an episode board', ep.over <= 1, ep.over);
  await tap(e, '#phoneBody .pincard.moment');
  const mr = await e.evaluate(() => ({ open: !document.getElementById('reader').hidden, tier: document.getElementById('readerTier').textContent }));
  ok('tapping a moment opens what was said', mr.open, JSON.stringify(mr));
  await e.screenshot({ path: OUT + '/ph06-episode.png' });
  await e.close();

  /* ---------- an empty desk on a phone ---------- */
  const n = await page('');
  const empty = await n.evaluate(() => ({ list: !document.getElementById('phoneList').hidden,
    text: document.getElementById('phoneBody').textContent,
    desks: document.querySelectorAll('.phone-empty .tool').length }));
  /* Only listed boards are offered (the episode boards are unlisted for now). */
  const listed = await n.evaluate(() => fetch('desk.json').then(r => r.json()).then(d => d.desks.filter(x => x.listed !== false).length));
  ok('an empty desk offers the listed prepared desks', empty.list && /Nothing on your desk yet/.test(empty.text) && empty.desks === listed && listed >= 1, JSON.stringify(empty).slice(0, 120));
  await tap(n, '.phone-empty .tool');
  await sleep(800);
  const opened = await n.evaluate(() => ({ hash: location.hash, cards: document.querySelectorAll('.phone-item').length }));
  ok('tapping one opens it as a list', /^#desk=/.test(opened.hash) && opened.cards > 10, JSON.stringify(opened));
  await n.close();

  /* ---------- wide screens are untouched ---------- */
  const w = await page('#desk=essenes-sacrifice-meat', { width: 1500, height: 950 });
  s = await state(w);
  const isReading = () => w.evaluate(() => document.body.classList.contains('reading'));
  ok('a wide screen gets the desk (a prepared board as its walk-through), never the list', !s.list && s.desk && await isReading(), JSON.stringify(s));
  /* A window narrowed (or a tablet turned) to phone width switches to the list,
     and widening brings the walk-through back. */
  await w.setViewport({ width: 600, height: 900 }); await sleep(500);
  const narrowed = Object.assign(await state(w), { reading: await isReading() });
  await w.setViewport({ width: 1500, height: 950 }); await sleep(900);
  const widened = Object.assign(await state(w), { reading: await isReading() });
  const nodes = await w.evaluate(() => document.querySelectorAll('.nodes .node').length);
  ok('narrowing a window switches to the list, widening switches back', narrowed.list && !narrowed.desk && !narrowed.reading && !widened.list && widened.desk && widened.reading && nodes > 40,
    JSON.stringify({ narrowed, widened, nodes }));
  /* From the workbench, the same round trip comes back to the workbench. */
  await workbench(w);
  await w.setViewport({ width: 600, height: 900 }); await sleep(500);
  await w.setViewport({ width: 1500, height: 950 }); await sleep(900);
  const back = Object.assign(await state(w), { reading: await isReading() });
  ok('and a workbench narrowed and widened stays a workbench', !back.list && back.tools && !back.reading, JSON.stringify(back));
  await w.close();

  ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  await browser.close();
  console.log('\n' + pass.length + ' passed, ' + fail.length + ' failed');
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
