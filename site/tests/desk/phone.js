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

  /* ---------- PRESENT on a phone walks the list, a section at a time ---------- */
  const walk = () => p.evaluate(() => ({
    on: document.body.classList.contains('phone-walk'), presenting: document.body.classList.contains('presenting'),
    at: document.getElementById('phoneWalkAt').textContent,
    shown: [].filter.call(document.querySelectorAll('#phoneBody .phone-sec'), x => x.offsetParent !== null).map(x => x.getAttribute('data-slide')),
    total: document.querySelectorAll('#phoneBody .phone-sec').length,
    prev: document.getElementById('phoneWalkPrev').disabled, next: document.getElementById('phoneWalkNext').disabled,
    bar: (() => { const r = document.getElementById('phoneWalkBar').getBoundingClientRect(); return r.bottom <= innerHeight + 1 && r.top > innerHeight / 2; })(),
    over: document.documentElement.scrollWidth - innerWidth }));
  await tap(p, '#btnPhonePresent'); await sleep(500);
  let wk = await walk();
  ok('▶ PRESENT on a phone walks the list, one section at a time (not the whole board shrunk)', wk.on && !wk.presenting && wk.shown.length === 1 && /^1 \/ \d+ · /.test(wk.at) && wk.bar, JSON.stringify(wk));
  ok('at the start, ‹ is off and › is on', wk.prev && !wk.next);
  await p.screenshot({ path: OUT + '/ph05-walk.png' });
  await tap(p, '#phoneWalkNext'); await sleep(250);
  await tap(p, '#phoneWalkNext'); await sleep(250);
  wk = await walk();
  ok('› moves on a section, and back to the top of it', /^3 \/ /.test(wk.at) && wk.shown.length === 1 && await p.evaluate(() => scrollY) === 0, wk.at);
  await tap(p, '#phoneWalkPrev'); await sleep(250);
  ok('‹ moves back', /^2 \/ /.test((await walk()).at));
  /* A card in the walk opens to read, and closing it keeps the walk. */
  await tap(p, '#phoneBody .phone-sec.is-walk .pincard'); await sleep(400);
  ok('a card tapped mid-walk opens to read', await p.evaluate(() => !document.getElementById('reader').hidden));
  await tap(p, '#readerClose'); await sleep(300);
  ok('closing it keeps the walk where it was', /^2 \/ /.test((await walk()).at) && (await walk()).on);
  /* A sideways swipe turns the page, and is never taken as the browser's "back". */
  const url0 = p.url();
  const cdp = await p.target().createCDPSession();
  const swipe = async (x0, x1) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: 420 }] });
    for (let k = 1; k <= 5; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * k / 5, y: 420 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(350);
  };
  await swipe(320, 80);
  ok('swiping left goes to the next section', /^3 \/ /.test((await walk()).at), (await walk()).at);
  await swipe(110, 340);
  ok('swiping right goes back, and stays on the page', p.url() === url0 && /^2 \/ /.test((await walk()).at), p.url());
  for (let k = 0; k < 12; k++) { if ((await walk()).next) break; await tap(p, '#phoneWalkNext'); await sleep(120); }
  wk = await walk();
  ok('at the end, › is off', wk.next && !wk.prev && new RegExp('^' + wk.total + ' / ').test(wk.at), wk.at);
  ok('no sideways scroll while walking', wk.over <= 1);
  await tap(p, '#phoneWalkExit'); await sleep(400);
  wk = await walk();
  s = await state(p);
  ok('THE LIST goes back to the whole list', !wk.on && wk.shown.length === wk.total && s.list);
  await tap(p, '#btnPhonePresent'); await sleep(400);
  await p.keyboard.press('Escape'); await sleep(300);
  ok('Esc ends the walk too', !(await walk()).on);
  await p.keyboard.press('p'); await sleep(400);
  ok('the P key on a phone (a keyboard case, a tablet) walks the list too', (await walk()).on && !(await walk()).presenting);
  await p.keyboard.press('Escape'); await sleep(300);
  await p.close();

  /* A present link opens a phone's walk on that section. */
  const pl = await page('#desk=essenes-sacrifice-meat&present=3');
  const plw = await pl.evaluate(() => ({ on: document.body.classList.contains('phone-walk'), presenting: document.body.classList.contains('presenting'),
    shown: [].filter.call(document.querySelectorAll('#phoneBody .phone-sec'), x => x.offsetParent !== null).map(x => x.getAttribute('data-slide')) }));
  ok('a present link (&present=3) opens the walk on section 3', plw.on && !plw.presenting && JSON.stringify(plw.shown) === '["3"]', JSON.stringify(plw));
  await pl.close();

  /* ---------- sizes for a finger ---------- */
  const f = await page('#desk=essenes-sacrifice-meat');
  const sizes = await f.evaluate(() => {
    const toc = [].slice.call(document.querySelectorAll('#phoneToc button'));
    const ties = [].slice.call(document.querySelectorAll('#phoneBody .phone-ties button'));
    const small = [].slice.call(document.querySelectorAll('#phoneBody .phone-item *')).filter(e => e.offsetParent && [].some.call(e.childNodes, n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 11);
    return { tocRows: new Set(toc.map(b => Math.round(b.getBoundingClientRect().top))).size, tocMinH: Math.min.apply(null, toc.map(b => b.getBoundingClientRect().height)),
      tieMinH: Math.min.apply(null, ties.map(b => b.getBoundingClientRect().height)), small: small.map(e => e.className + ' ' + getComputedStyle(e).fontSize).slice(0, 5),
      pins: [].filter.call(document.querySelectorAll('#phoneBody .pin'), e => e.offsetParent).length, over: document.documentElement.scrollWidth - innerWidth };
  });
  ok('the section buttons are one row that scrolls sideways, each at least 40px tall', sizes.tocRows === 1 && sizes.tocMinH >= 40 && sizes.over <= 1, JSON.stringify(sizes));
  ok('TIED TO buttons are at least 40px tall', sizes.tieMinH >= 40, sizes.tieMinH);
  ok('no text on the cards under 11px', sizes.small.length === 0, JSON.stringify(sizes.small));
  ok('the pin heads, which do nothing on a phone, are not shown', sizes.pins === 0);
  await tap(f, '#phoneBody .pincard'); await sleep(400);
  const cb = await f.evaluate(() => { const r = document.getElementById('readerClose').getBoundingClientRect(); return [r.width, r.height]; });
  ok('the reader close button is at least 44px', cb[0] >= 44 && cb[1] >= 44, JSON.stringify(cb));
  await f.close();

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
