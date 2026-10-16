/* Present mode: the Essene desk walked section by section. */
const puppeteer = require('puppeteer-core');
const { CHROME, BASE, URL, OUT, tool, workbench, layCase, browseCase } = require('./env');
const pass = [], fail = [];
const ok = (name, cond, extra) => { const l = name + (extra != null ? ' :: ' + extra : ''); (cond ? pass : fail).push(l); console.log((cond ? 'live ok  ' : 'live XX  ') + l); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    defaultViewport: { width: 1500, height: 900 }, args: ['--no-sandbox', '--disable-gpu'] });
  const errs = [];
  const fresh = async () => {
    const p = await (await browser.createBrowserContext()).newPage();
    p.on('pageerror', e => errs.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    return p;
  };
  const open = async (p, hash) => {
    await p.goto(URL + (hash || ''), { waitUntil: 'load' });
    await p.waitForSelector('.tray-case');
    await p.waitForFunction(() => document.getElementById('hudCounts').textContent.length > 0);
    await sleep(1100);
    /* A prepared board opens as a walk-through (checked below); these tests
       start from the workbench. */
    if (/desk=/.test(hash || '') && !/present/.test(hash || '')) await workbench(p);
  };
  const state = p => p.evaluate(() => ({
    presenting: document.body.classList.contains('presenting'),
    eyebrow: document.getElementById('presEyebrow').textContent,
    title: document.getElementById('presTitle').textContent,
    dots: document.querySelectorAll('#presDots .pres-dot').length,
    on: [].slice.call(document.querySelectorAll('#presDots .pres-dot')).findIndex(d => d.classList.contains('is-on')),
    prevDisabled: document.getElementById('presPrev').disabled,
    nextDisabled: document.getElementById('presNext').disabled
  }));
  /* The frame on screen, as a share of the stage, and whether only it is lit. */
  const lit = (p, title) => p.evaluate(t => {
    const s = document.getElementById('surface').getBoundingClientRect();
    const f = [].slice.call(document.querySelectorAll('.frame')).filter(x => x.querySelector('input').value === t)[0];
    const r = f.getBoundingClientRect();
    const nodes = [].slice.call(document.querySelectorAll('.nodes .node'));
    const inside = n => { const b = n.getBoundingClientRect(); const cx = (b.left + b.right) / 2, cy = (b.top + b.bottom) / 2; return cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom; };
    return {
      inView: r.left >= s.left - 2 && r.right <= s.right + 2 && r.top >= s.top - 2 && r.bottom <= s.bottom + 2,
      fill: Math.max(r.width / s.width, r.height / s.height),
      litInside: nodes.filter(inside).every(n => !n.classList.contains('pres-dim')),
      dimOutside: nodes.filter(n => !inside(n)).every(n => n.classList.contains('pres-dim')),
      frameDimmed: f.classList.contains('pres-dim'),
      otherFramesDim: [].slice.call(document.querySelectorAll('.frame')).filter(x => x !== f).every(x => x.classList.contains('pres-dim'))
    };
  }, title);

  /* ---------- a prepared board opens as a walk-through ---------- */
  const rd = await fresh();
  await rd.goto(URL + '#desk=essenes-sacrifice-meat', { waitUntil: 'load' });
  await rd.waitForSelector('.tray-case'); await sleep(1600);
  const r0 = await rd.evaluate(() => ({ reading: document.body.classList.contains('reading'), work: !document.getElementById('presWork').hidden,
    exit: !document.getElementById('presExit').hidden, eyebrow: document.getElementById('presEyebrow').textContent,
    tools: document.querySelector('.desk-tools').offsetParent !== null }));
  ok('a prepared board opens as a walk-through on section 1, with no workbench chrome', r0.reading && r0.work && !r0.exit && /JESUS, THE ESSENES.*SECTION 1 OF 7/.test(r0.eyebrow) && !r0.tools, JSON.stringify(r0));
  await rd.click('#presWork'); await sleep(500);
  const r1 = await rd.evaluate(() => ({ reading: document.body.classList.contains('reading'), presenting: document.body.classList.contains('presenting'),
    bar: !document.getElementById('sharedBar').hidden, tools: document.querySelector('.desk-tools').offsetParent !== null }));
  ok('OPEN THE WORKBENCH ends the walk and shows the tools and the KEEP bar', !r1.reading && !r1.presenting && r1.bar && r1.tools, JSON.stringify(r1));
  await rd.close();

  /* ---------- start ---------- */
  const p = await fresh();
  await open(p, '#desk=essenes-sacrifice-meat');
  const before = await p.evaluate(() => document.getElementById('world').style.transform);
  ok('the PRESENT button is on the toolbar', await p.evaluate(() => !!document.getElementById('btnPresent') && document.getElementById('btnPresent').offsetParent !== null));
  await p.click('#btnPresent');
  await sleep(900);
  const s0 = await state(p);
  ok('PRESENT starts the show on the overview', s0.presenting && /^OVERVIEW · 7 SECTIONS/.test(s0.eyebrow) && /Essenes/.test(s0.title), JSON.stringify(s0));
  ok('one dot for the overview and one per section', s0.dots === 8 && s0.on === 0, s0.dots);
  const stage = await p.evaluate(() => {
    const s = document.getElementById('surface').getBoundingClientRect();
    const hidden = ['.top', '.desk-form', '.desk-tools', '.tray', '.hud', '.foot', '.shared-bar'].every(q => { const e = document.querySelector(q); return !e || getComputedStyle(e).display === 'none'; });
    return { w: s.width, h: s.height, x: s.left, y: s.top, iw: innerWidth, ih: innerHeight, hidden };
  });
  ok('the desk fills the screen and everything else steps aside', stage.hidden && Math.abs(stage.w - stage.iw) < 2 && Math.abs(stage.h - stage.ih) < 2 && stage.x === 0 && stage.y === 0, JSON.stringify(stage));
  ok('on the overview nothing is dimmed', await p.evaluate(() => document.querySelectorAll('.pres-dim').length === 0));
  ok('Back is disabled on the first slide', s0.prevDisabled && !s0.nextDisabled);
  await p.screenshot({ path: OUT + '/p01-overview.png' });

  /* ---------- forward ---------- */
  await p.keyboard.press('ArrowRight');
  await sleep(150);
  const mid = await p.evaluate(() => document.getElementById('world').style.transform);
  await sleep(900);
  const s1 = await state(p);
  const end = await p.evaluate(() => document.getElementById('world').style.transform);
  ok('→ goes to section 1', /^SECTION 1 OF 7/.test(s1.eyebrow) && /WHERE HE CAME FROM/.test(s1.title) && s1.on === 1, JSON.stringify(s1));
  ok('the camera glides there rather than cutting', mid !== end, mid + ' -> ' + end);
  const l1 = await lit(p, '1 · WHERE HE CAME FROM');
  ok('the section fills the stage', l1.inView && l1.fill > 0.55, JSON.stringify(l1));
  ok('its cards stay lit and the rest of the board dims', l1.litInside && l1.dimOutside && !l1.frameDimmed && l1.otherFramesDim, JSON.stringify(l1));
  const strings = await p.evaluate(() => ({ all: document.querySelectorAll('#links .string-line').length, dim: document.querySelectorAll('#links .string-line.dim').length }));
  ok('string not touching the section dims too', strings.dim > 0 && strings.dim < strings.all, JSON.stringify(strings));
  await p.screenshot({ path: OUT + '/p02-section1.png' });

  for (const k of ['Space', 'PageDown']) { await p.keyboard.press(k); await sleep(850); }
  const s3 = await state(p);
  ok('space and Page Down move forward too', /^SECTION 3 OF 7/.test(s3.eyebrow), s3.eyebrow);
  await p.keyboard.press('ArrowLeft'); await sleep(850);
  ok('← goes back', /^SECTION 2 OF 7/.test((await state(p)).eyebrow));
  await p.keyboard.press('End'); await sleep(850);
  const sEnd = await state(p);
  ok('End goes to the last section', /^SECTION 7 OF 7/.test(sEnd.eyebrow) && /GO DEEPER/.test(sEnd.title) && sEnd.nextDisabled, JSON.stringify(sEnd));
  await p.keyboard.press('ArrowRight'); await sleep(400);
  ok('→ on the last slide stays put', /^SECTION 7 OF 7/.test((await state(p)).eyebrow));
  await p.keyboard.press('3'); await sleep(850);
  ok('a number key jumps to that section', /^SECTION 3 OF 7/.test((await state(p)).eyebrow));
  await p.keyboard.press('Home'); await sleep(850);
  ok('Home returns to the overview', /^OVERVIEW/.test((await state(p)).eyebrow));

  /* ---------- the caption and bar never cover the board ---------- */
  const clear = await p.evaluate(async () => {
    const out = [];
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const n = document.querySelectorAll('#presDots .pres-dot').length;
    for (let i = 0; i < n; i++) {
      document.querySelectorAll('#presDots .pres-dot')[i].click();
      await sleep(900);
      const cap = document.getElementById('presCaption').getBoundingClientRect();
      const bar = document.getElementById('presBar').getBoundingClientRect();
      const lit = [].slice.call(document.querySelectorAll('.nodes .node:not(.pres-dim), .frame:not(.pres-dim) .frame-title'))
        .map(e => e.getBoundingClientRect()).filter(r => r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth);
      const hitsCap = lit.filter(r => r.top < cap.bottom && r.left < cap.right && r.right > cap.left).length;
      const hitsBar = lit.filter(r => r.bottom > bar.top && r.left < bar.right && r.right > bar.left).length;
      if (hitsCap || hitsBar) out.push(i + ':cap' + hitsCap + ',bar' + hitsBar);
    }
    return out;
  });
  ok('on every slide the caption and bar sit clear of the lit board', clear.length === 0, clear.join(' '));
  await p.evaluate(() => document.querySelectorAll('#presDots .pres-dot')[0].click());
  await sleep(900);

  /* ---------- the bar ---------- */
  await p.mouse.move(700, 450);
  await p.evaluate(() => document.querySelectorAll('#presDots .pres-dot')[6].click());
  await sleep(850);
  ok('clicking a dot jumps to it', /^SECTION 6 OF 7/.test((await state(p)).eyebrow) && /DO NOT SAY/.test((await state(p)).title));
  await p.click('#presPrev'); await sleep(850);
  ok('the ‹ button goes back', /^SECTION 5 OF 7/.test((await state(p)).eyebrow));
  await p.click('#presNext'); await sleep(850);
  ok('the › button goes forward', /^SECTION 6 OF 7/.test((await state(p)).eyebrow));
  await p.click('#presOverview'); await sleep(850);
  ok('OVERVIEW returns to the whole board', /^OVERVIEW/.test((await state(p)).eyebrow));
  await p.mouse.move(720, 470);
  await sleep(3000);
  ok('the bar fades when the pointer rests', await p.evaluate(() => document.body.classList.contains('pres-idle') && getComputedStyle(document.getElementById('presBar')).opacity === '0'));
  await p.mouse.move(760, 480);
  await sleep(100);
  ok('and comes back when it moves', await p.evaluate(() => !document.body.classList.contains('pres-idle')));

  /* ---------- clicking a section title from the overview ---------- */
  const bar = await p.evaluate(() => {
    const f = [].slice.call(document.querySelectorAll('.frame')).filter(x => /MOVEMENT AFTER HIM/.test(x.querySelector('input').value))[0];
    const r = f.querySelector('.frame-title').getBoundingClientRect(); return { x: r.left + 20, y: r.top + r.height / 2 };
  });
  await p.mouse.click(bar.x, bar.y); await sleep(900);
  ok('clicking a section title on the overview goes to it', /^SECTION 4 OF 7/.test((await state(p)).eyebrow), (await state(p)).eyebrow);

  /* ---------- reading a card mid-show ---------- */
  const card = await p.evaluate(() => {
    const n = [].slice.call(document.querySelectorAll('.nodes .node:not(.pres-dim) .pincard'))[0];
    const r = n.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, id: n.parentNode.getAttribute('data-id'),
      left: n.parentNode.style.left, top: n.parentNode.style.top };
  });
  await p.mouse.click(card.x, card.y); await sleep(400);
  ok('clicking a card opens its reader over the show', await p.evaluate(() => !document.getElementById('reader').hidden));
  await p.screenshot({ path: OUT + '/p03-reader.png' });
  await p.keyboard.press('Escape'); await sleep(300);
  const afterEsc = await state(p);
  ok('Esc closes the reader and the show goes on', afterEsc.presenting && await p.evaluate(() => document.getElementById('reader').hidden), JSON.stringify(afterEsc));
  await p.mouse.click(card.x, card.y); await sleep(400);
  await p.keyboard.press('ArrowRight'); await sleep(900);
  ok('→ with a reader open closes it and moves on', /^SECTION 5 OF 7/.test((await state(p)).eyebrow) && await p.evaluate(() => document.getElementById('reader').hidden));

  /* ---------- a card can be moved during the show, and taken back ---------- */
  await p.keyboard.press('ArrowLeft'); await sleep(900);
  const c2 = await p.evaluate(id => { const n = document.querySelector('.nodes [data-id="' + id + '"]'); const r = n.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, card.id);
  await p.mouse.move(c2.x, c2.y); await p.mouse.down(); await p.mouse.move(c2.x + 160, c2.y + 90, { steps: 8 }); await p.mouse.up(); await sleep(300);
  const moved = await p.evaluate(id => { const n = document.querySelector('.nodes [data-id="' + id + '"]'); return [n.style.left, n.style.top]; }, card.id);
  ok('a card can be dragged while presenting', moved[0] !== card.left || moved[1] !== card.top, JSON.stringify([card.left, card.top, moved]));
  ok('a drag opens nothing and the show keeps running', (await state(p)).presenting && await p.evaluate(() => document.getElementById('reader').hidden));
  /* and Ctrl-Z takes it back without leaving the show */
  await p.keyboard.down('Control'); await p.keyboard.press('KeyZ'); await p.keyboard.up('Control'); await sleep(500);
  const back = await p.evaluate(id => { const n = document.querySelector('.nodes [data-id="' + id + '"]'); return [n.style.left, n.style.top]; }, card.id);
  ok('Ctrl-Z puts a presented card back', back[0] === card.left && back[1] === card.top, JSON.stringify([card.left, card.top, back]));
  ok('undoing did not end the show', (await state(p)).presenting);
  const n0 = await p.evaluate(() => document.querySelectorAll('.nodes .node').length);
  await p.evaluate(() => { const n = document.querySelector('.nodes .node'); n.classList.add('is-selected'); });
  await p.keyboard.press('Delete');
  await p.keyboard.down('Control'); await p.keyboard.press('KeyZ'); await p.keyboard.up('Control');
  await sleep(200);
  ok('Delete does nothing while presenting', await p.evaluate(() => document.querySelectorAll('.nodes .node').length) === n0);
  ok('notes cannot be typed into while presenting', await p.evaluate(() => [].slice.call(document.querySelectorAll('.notepad textarea')).every(t => t.readOnly)));

  /* ---------- exit ---------- */
  await p.keyboard.press('Escape'); await sleep(500);
  const ex = await p.evaluate(() => ({
    presenting: document.body.classList.contains('presenting'),
    tools: getComputedStyle(document.querySelector('.desk-tools')).display !== 'none',
    dim: document.querySelectorAll('.pres-dim, .string-line.dim').length,
    bar: document.getElementById('presBar').hidden,
    notes: [].slice.call(document.querySelectorAll('.notepad textarea')).every(t => !t.readOnly),
    transform: document.getElementById('world').style.transform
  }));
  ok('Esc ends the show and brings the desk back', !ex.presenting && ex.tools && ex.bar && ex.dim === 0, JSON.stringify(ex));
  /* Notes stay read-only on the workbench too: a focused textarea swallows
     Ctrl-Z, Delete and the arrows for the whole desk, so a note is opened
     deliberately with two clicks instead of being editable by default. */
  ok('notes are still read-only after the show, and open on two clicks', !ex.notes, JSON.stringify({ notes: ex.notes }));
  ok('and the view is where it was before', ex.transform === before, ex.transform + ' vs ' + before);

  /* ---------- shortcut and the tray ---------- */
  await p.evaluate(() => document.getElementById('surface').focus());
  await p.keyboard.press('p'); await sleep(900);
  ok('P starts the show', (await state(p)).presenting);
  await p.keyboard.press('Escape'); await sleep(400);
  await p.evaluate(() => [].slice.call(document.querySelectorAll('#trayHere li.has-play')).filter(li => /DO NOT SAY/.test(li.textContent))[0].querySelector('.here-play').click());
  await sleep(1000);
  ok('▶ beside a section presents from that section', /DO NOT SAY/.test((await state(p)).title), (await state(p)).title);
  await p.click('#presExit'); await sleep(400);
  ok('EXIT ends the show', !(await state(p)).presenting);

  /* ---------- links ---------- */
  const q = await fresh();
  await open(q, '#desk=essenes-sacrifice-meat&present=3');
  await sleep(600);
  const sq = await state(q);
  ok('a present link opens straight into that slide', sq.presenting && /^SECTION 3 OF 7/.test(sq.eyebrow), JSON.stringify(sq));
  await q.keyboard.press('Escape'); await sleep(500);
  ok('ending it leaves the desk link in the address bar, without present', await q.evaluate(() => location.hash) === '#desk=essenes-sacrifice-meat', await q.evaluate(() => location.hash));
  await q.evaluate(() => [].slice.call(document.querySelectorAll('.tray-present'))[0].click());
  await sleep(1300);
  ok('▶ PRESENT IT on a prepared desk starts its show', (await state(q)).presenting);
  await q.keyboard.press('Escape'); await sleep(400);

  /* ---------- a desk with no sections ---------- */
  const r = await fresh();
  await open(r);
  await layCase(r, /Does God need blood/);
  await r.click('#btnPresent'); await sleep(900);
  const sr = await state(r);
  ok('a desk with no frames presents its overview and says how to make sections', sr.presenting && sr.dots === 1 &&
    /\+ FRAME/.test(await r.evaluate(() => document.getElementById('presSub').textContent)), JSON.stringify(sr));
  await r.keyboard.press('Escape'); await sleep(300);
  const empty = await fresh();
  await open(empty);
  /* An empty desk shows no tools; the P key is still there. */
  await empty.evaluate(() => document.getElementById('surface').focus()); await empty.keyboard.press('p'); await sleep(300);
  ok('an empty desk does not start a show', !(await state(empty)).presenting && /nothing on the desk/.test(await empty.evaluate(() => document.getElementById('dhint').textContent)));

  /* ---------- a small window ---------- */
  const t = await fresh();
  await t.setViewport({ width: 1024, height: 700 });
  await open(t, '#desk=essenes-sacrifice-meat&present=2');
  await sleep(500);
  const tl = await lit(t, '2 · HE OPPOSED THE SACRIFICES');
  const tb = await t.evaluate(() => { const b = document.getElementById('presBar').getBoundingClientRect(); return b.right <= innerWidth && b.left >= 0; });
  ok('at 1024×700 the section still fits and the bar stays on screen', tl.inView && tb, JSON.stringify(tl));
  await t.screenshot({ path: OUT + '/p04-small.png' });

  ok('no console errors', errs.length === 0, errs.join(' | '));
  console.log('\nPASS (' + pass.length + ')' + (fail.length ? '  FAIL (' + fail.length + ')' : ''));
  console.log(fail.length ? 'FAILURES: ' + fail.length : 'all green');
  await browser.close();
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
