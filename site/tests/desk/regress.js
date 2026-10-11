/* Drive the Desk in a real viewport and assert the behaviour Rex asked for. */
const puppeteer = require('puppeteer-core');
const { CHROME, BASE, URL, OUT } = require('./env');
const pass = [], fail = [];
const ok = (name, cond, extra) => { const l = name + (extra ? ' :: ' + extra : ''); (cond ? pass : fail).push(l); console.log((cond ? 'live ok  ' : 'live XX  ') + l); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    defaultViewport: { width: 1500, height: 950 },
    args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none'], protocolTimeout: 90000
  });
  const page = await browser.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));

  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.waitForSelector('.tray-case');
  await sleep(300);

  const boot = await page.evaluate(() => ({
    fams: document.querySelectorAll('.fam').length,
    cases: document.querySelectorAll('#trayCases .tray-case').length,
    empty: !document.getElementById('emptyDesk').hidden,
    innerW: innerWidth,
    surfaceW: Math.round(document.getElementById('surface').getBoundingClientRect().width)
  }));
  ok('viewport is real', boot.innerW > 1000, 'innerWidth=' + boot.innerW);
  ok('surface is wide', boot.surfaceW > 900, 'surface=' + boot.surfaceW);
  ok('13 families built', boot.fams === 13, 'got ' + boot.fams);
  ok('14 cases in tray', boot.cases === 14, 'got ' + boot.cases);
  ok('empty state shows', boot.empty === true);

  // ---- pull a whole case ----
  await page.evaluate(() => {
    [].slice.call(document.querySelectorAll('.tray-case'))
      .filter(x => /296\.1/.test(x.textContent))[0].click();
  });
  await sleep(200);
  /* A tray row now opens the case for browsing; laying it out is one more click. */
  await page.click('.tray-lay');
  await sleep(500);
  await page.screenshot({ path: OUT + '/shot-01-case.png' });

  const afterPull = await page.evaluate(() => {
    const ns = [].slice.call(document.querySelectorAll('.nodes .node'));
    const cols = {};
    ns.forEach(n => { const l = n.style.left; cols[l] = (cols[l] || 0) + 1; });
    return {
      nodes: ns.length,
      strings: document.querySelectorAll('#links .string-line').length,
      stamps: document.querySelectorAll('.nodes .stamp').length,
      hud: document.getElementById('hudCounts').textContent,
      distinctX: Object.keys(cols).length,
      zoom: document.getElementById('hudZoom').textContent,
      empty: !document.getElementById('emptyDesk').hidden,
      transform: document.getElementById('world').style.transform
    };
  });
  ok('19 nodes placed', afterPull.nodes === 19, 'got ' + afterPull.nodes);
  ok('18 strings tied', afterPull.strings === 18, 'got ' + afterPull.strings);
  ok('every source stamped', afterPull.stamps === 18, 'got ' + afterPull.stamps);
  ok('laid out in columns', afterPull.distinctX >= 3 && afterPull.distinctX <= 4, 'distinct x=' + afterPull.distinctX);
  ok('empty state hidden', afterPull.empty === false);
  ok('fit changed the zoom', afterPull.zoom !== '100%', 'zoom=' + afterPull.zoom);
  ok('world is transformed', /scale/.test(afterPull.transform), afterPull.transform);

  // gaps inside one column should equal the board gap of 22
  /* Gaps between consecutive flowed cards in a column. Question cards are
     excluded (they sit above the columns at a deliberate 60px offset) and so
     are cards inside a frame, which TIDY leaves exactly where they are. */
  const measureGaps = () => page.evaluate(() => {
    const frames = [].slice.call(document.querySelectorAll('.frame')).map(f => ({
      x: parseFloat(f.style.left), y: parseFloat(f.style.top),
      w: parseFloat(f.style.width), h: parseFloat(f.style.height)
    }));
    const inFrame = n => frames.some(f => {
      const cx = n.x + 125, cy = n.y + n.h / 2;
      return cx >= f.x && cx <= f.x + f.w && cy >= f.y && cy <= f.y + f.h;
    });
    const ns = [].slice.call(document.querySelectorAll('.nodes .node'))
      .map(n => ({ id: n.getAttribute('data-id'), x: parseFloat(n.style.left), y: parseFloat(n.style.top), h: n.offsetHeight }))
      .filter(n => n.id.indexOf('q:') !== 0)
      .filter(n => !inFrame(n));
    const byX = {};
    ns.forEach(n => { (byX[n.x] = byX[n.x] || []).push(n); });
    const out = [], detail = [];
    Object.keys(byX).forEach(x => {
      const col = byX[x].sort((a, b) => a.y - b.y);
      if (col.length < 2) return;
      detail.push(x + ': ' + col.map(c => c.id + '@' + c.y + 'h' + c.h).join(' , '));
      for (let i = 1; i < col.length; i++) out.push(Math.round(col[i].y - (col[i - 1].y + col[i - 1].h)));
    });
    return { gaps: out, detail: detail };
  });
  const g1 = await measureGaps();
  ok('column gaps are all 22px', g1.gaps.length > 0 && g1.gaps.every(g => g === 22),
    'gaps=' + JSON.stringify(g1.gaps) + (g1.gaps.every(g => g === 22) ? '' : '\n      ' + g1.detail.join('\n      ')));

  // ---- snapping: drop a card just under another, slightly off ----
  const snap = await page.evaluate(() => {
    const ns = [].slice.call(document.querySelectorAll('.nodes .node'));
    const a = ns.filter(n => n.getAttribute('data-id') === 's:essene-nazarene-origins:0')[0];
    const b = ns.filter(n => n.getAttribute('data-id') === 's:essene-nazarene-origins:15')[0];
    if (!a || !b) return null;
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    return {
      ax: parseFloat(a.style.left), ay: parseFloat(a.style.top), ah: a.offsetHeight,
      grabX: rb.left + rb.width / 2, grabY: rb.top + 14,
      dropScreenX: ra.left + ra.width / 2 + 5,
      dropScreenY: ra.bottom + 26
    };
  });
  ok('found two cards to snap', !!snap);
  const yBeforeDrag = await page.evaluate(() =>
    parseFloat(document.querySelector('[data-id="s:essene-nazarene-origins:15"]').style.top));
  if (snap) {
    await page.mouse.move(snap.grabX, snap.grabY);
    await page.mouse.down();
    await page.mouse.move(snap.dropScreenX, snap.dropScreenY - 60, { steps: 8 });
    await page.mouse.move(snap.dropScreenX, snap.dropScreenY, { steps: 8 });
    const guides = await page.evaluate(() => document.querySelectorAll('#guides .guide-line').length);
    await page.screenshot({ path: OUT + '/shot-02-snapping.png' });
    await page.mouse.up();
    await sleep(200);
    const res = await page.evaluate(() => {
      const b = document.querySelector('[data-id="s:essene-nazarene-origins:15"]');
      const a = document.querySelector('[data-id="s:essene-nazarene-origins:0"]');
      return {
        bx: parseFloat(b.style.left), by: parseFloat(b.style.top),
        ax: parseFloat(a.style.left), ay: parseFloat(a.style.top), ah: a.offsetHeight,
        guidesCleared: document.querySelectorAll('#guides .guide-line').length
      };
    });
    ok('guides drew while dragging', guides >= 1, 'guides=' + guides);
    ok('guides cleared on drop', res.guidesCleared === 0);
    ok('snapped to the same left edge', res.bx === res.ax, 'b.x=' + res.bx + ' a.x=' + res.ax);
    ok('snapped to the 22px stack gap', res.by === res.ay + res.ah + 22,
      'b.y=' + res.by + ' expected=' + (res.ay + res.ah + 22));
  }

  // ---- undo puts the card back exactly where it was ----
  await page.evaluate(() => document.getElementById('surface').focus());
  await page.keyboard.down('Control'); await page.keyboard.press('KeyZ'); await page.keyboard.up('Control');
  await sleep(250);
  const undone = await page.evaluate(() =>
    parseFloat(document.querySelector('[data-id="s:essene-nazarene-origins:15"]').style.top));
  ok('ctrl-z restored the exact position', undone === yBeforeDrag, 'after undo=' + undone + ' before drag=' + yBeforeDrag);

  // ---- a frame carries its contents ----
  await page.click('#btnFrame');
  await sleep(300);
  const frameInfo = await page.evaluate(() => {
    const f = document.querySelector('.frame');
    return f ? { id: f.getAttribute('data-id'), x: parseFloat(f.style.left), y: parseFloat(f.style.top), w: parseFloat(f.style.width) } : null;
  });
  ok('frame added', !!frameInfo);

  // drag a card into the frame
  const intoFrame = await page.evaluate(() => {
    const f = document.querySelector('.frame');
    const n = document.querySelector('[data-id="s:essene-nazarene-origins:4"]');
    const rf = f.getBoundingClientRect(), rn = n.getBoundingClientRect();
    return { gx: rn.left + rn.width / 2, gy: rn.top + 16, tx: rf.left + rf.width / 2, ty: rf.top + rf.height / 2 };
  });
  await page.mouse.move(intoFrame.gx, intoFrame.gy);
  await page.mouse.down();
  await page.mouse.move(intoFrame.tx, intoFrame.ty, { steps: 12 });
  await page.mouse.up();
  await sleep(250);
  const membership = await page.evaluate(() => {
    const txt = document.querySelector('.frame .frame-count').textContent;
    const n = document.querySelector('[data-id="s:essene-nazarene-origins:4"]');
    return { count: txt, cardX: parseFloat(n.style.left), cardY: parseFloat(n.style.top) };
  });
  ok('frame counts the card dropped inside it', /1 in/.test(membership.count), 'count="' + membership.count + '"');
  await page.screenshot({ path: OUT + '/shot-03-frame.png' });

  // drag the frame by its title bar; the card inside must come along
  const bar = await page.evaluate(() => {
    const b = document.querySelector('.frame .frame-title');
    const r = b.getBoundingClientRect();
    const f = document.querySelector('.frame');
    return { x: r.left + r.width - 14, y: r.top + r.height / 2, fx: parseFloat(f.style.left), fy: parseFloat(f.style.top) };
  });
  await page.mouse.move(bar.x, bar.y);
  await page.mouse.down();
  await page.mouse.move(bar.x + 90, bar.y + 70, { steps: 10 });
  await page.mouse.up();
  await sleep(250);
  const carried = await page.evaluate(() => {
    const f = document.querySelector('.frame');
    const n = document.querySelector('[data-id="s:essene-nazarene-origins:4"]');
    return { fx: parseFloat(f.style.left), fy: parseFloat(f.style.top), cx: parseFloat(n.style.left), cy: parseFloat(n.style.top) };
  });
  const dFrame = [carried.fx - bar.fx, carried.fy - bar.fy];
  const dCard = [carried.cx - membership.cardX, carried.cy - membership.cardY];
  ok('frame moved when dragged by its title', Math.abs(dFrame[0]) > 20 && Math.abs(dFrame[1]) > 20, 'delta=' + JSON.stringify(dFrame));
  ok('the card inside moved with the frame', dCard[0] === dFrame[0] && dCard[1] === dFrame[1],
    'frame=' + JSON.stringify(dFrame) + ' card=' + JSON.stringify(dCard));

  // ---- note ----
  await page.click('#btnNote');
  await sleep(250);
  ok('note added', await page.evaluate(() => !!document.querySelector('.notepad textarea')));

  // ---- tidy + fit ----
  await page.click('#btnTidy');
  await sleep(400);
  await page.screenshot({ path: OUT + '/shot-04-tidy.png' });
  const g2 = await measureGaps();
  /* Cards inside a frame are deliberately left where they are, so they are not
     part of the tidied columns. */
  const colCount = await page.evaluate(() => {
    const frames = [].slice.call(document.querySelectorAll('.frame')).map(f => ({
      x: parseFloat(f.style.left), y: parseFloat(f.style.top),
      w: parseFloat(f.style.width), h: parseFloat(f.style.height)
    }));
    const xs = {};
    [].slice.call(document.querySelectorAll('.nodes .node'))
      .filter(n => n.getAttribute('data-id').indexOf('s:') === 0)
      .filter(n => {
        const x = parseFloat(n.style.left), y = parseFloat(n.style.top);
        const cx = x + n.offsetWidth / 2, cy = y + n.offsetHeight / 2;
        return !frames.some(f => cx >= f.x && cx <= f.x + f.w && cy >= f.y && cy <= f.y + f.h);
      })
      .forEach(n => { xs[n.style.left] = 1; });
    return Object.keys(xs).length;
  });
  ok('tidy made 3 columns', colCount === 3, 'cols=' + colCount);
  ok('tidy gaps all 22px', g2.gaps.every(g => g === 22),
    'gaps=' + JSON.stringify(g2.gaps) + (g2.gaps.every(g => g === 22) ? '' : '\n      ' + g2.detail.join('\n      ')));

  // ---- string by dragging a pin head ----
  const before = await page.evaluate(() => document.querySelectorAll('#links .string-line').length);
  const pinDrag = await page.evaluate(() => {
    const a = document.querySelector('[data-id="s:essene-nazarene-origins:2"]');
    const b = document.querySelector('[data-id="s:essene-nazarene-origins:3"]');
    if (!a || !b) return null;
    const pa = a.querySelector('.pin').getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    return { fx: pa.left + pa.width / 2, fy: pa.top + pa.height / 2, tx: rb.left + rb.width / 2, ty: rb.top + rb.height / 2 };
  });
  if (pinDrag) {
    await page.mouse.move(pinDrag.fx, pinDrag.fy);
    await page.mouse.down();
    await page.mouse.move((pinDrag.fx + pinDrag.tx) / 2, (pinDrag.fy + pinDrag.ty) / 2, { steps: 6 });
    await page.mouse.move(pinDrag.tx, pinDrag.ty, { steps: 6 });
    await page.mouse.up();
    await sleep(200);
    const after = await page.evaluate(() => document.querySelectorAll('#links .string-line').length);
    ok('dragging a pin tied a new string', after === before + 1, before + ' -> ' + after);
  }

  // ---- search retrieves held sources ----
  await page.evaluate(() => { document.getElementById('dq').value = ''; });
  await page.type('#dq', 'children of light');
  await sleep(350);
  const sugg = await page.evaluate(() => {
    const ul = document.getElementById('dsuggest');
    return { hidden: ul.hidden, n: ul.children.length, first: ul.children[0] ? ul.children[0].textContent : '' };
  });
  ok('search suggests held sources', !sugg.hidden && sugg.n > 0, 'n=' + sugg.n + ' first=' + sugg.first);
  await page.screenshot({ path: OUT + '/shot-05-search.png' });
  await page.keyboard.press('Enter');
  await sleep(500);
  const searched = await page.evaluate(() => document.getElementById('dhint').textContent);
  ok('search pins and says nothing was generated', /Nothing was generated|already on the desk|all on the desk/.test(searched), searched.slice(0, 90));

  // ---- share link round trip ----
  const encoded = await page.evaluate(() => {
    const btn = document.getElementById('btnJson');
    btn.click();
    return null;
  });
  const boardJson = await page.evaluate(() => {
    // read the same encoding the share button uses, without the clipboard
    return localStorage.getItem('way.desk.v1');
  });
  ok('desk saved to storage', !!boardJson && boardJson.length > 50, 'len=' + (boardJson || '').length);

  const page2 = await browser.newPage();
  const errs2 = [];
  page2.on('pageerror', e => errs2.push(e.message));
  await page2.goto(URL + '#b=' + encodeURIComponent(boardJson), { waitUntil: 'networkidle0' });
  await sleep(600);
  const restored = await page2.evaluate(() => ({
    nodes: document.querySelectorAll('.nodes .node').length,
    strings: document.querySelectorAll('#links .string-line').length,
    frames: document.querySelectorAll('.frame').length
  }));
  const original = await page.evaluate(() => ({
    nodes: document.querySelectorAll('.nodes .node').length,
    strings: document.querySelectorAll('#links .string-line').length,
    frames: document.querySelectorAll('.frame').length
  }));
  ok('share link rebuilt the same desk',
    restored.nodes === original.nodes && restored.strings === original.strings && restored.frames === original.frames,
    JSON.stringify(restored) + ' vs ' + JSON.stringify(original));
  await page2.screenshot({ path: OUT + '/shot-06-shared.png' });
  ok('no errors on the shared page', errs2.length === 0, errs2.join(' | '));

  // ---- reader opens on a click ----
  await page.bringToFront();  // background tabs do not paint, so screenshots there stall
  const clicked = await page.evaluate(() => {
    const n = document.querySelector('[data-id="s:essene-nazarene-origins:0"] .pincard');
    const r = n.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height - 10 };
  });
  await page.mouse.click(clicked.x, clicked.y);
  await sleep(350);
  const reader = await page.evaluate(() => ({
    open: !document.getElementById('reader').hidden,
    title: document.getElementById('readerTitle').textContent,
    tier: document.getElementById('readerTier').textContent,
    stamp: (document.querySelector('#readerStatus .stamp') || {}).textContent || '',
    body: document.getElementById('readerBody').textContent.slice(0, 70),
    marks: document.querySelectorAll('#readerBody mark').length
  }));
  ok('a click opens the reader', reader.open === true);
  ok('reader shows the real text', reader.body.length > 30, reader.body);
  ok('reader keeps the stamp', /HELD|NOT YET/.test(reader.stamp), 'stamp=' + reader.stamp);
  ok('reader highlights the cited phrase', reader.marks >= 1, 'marks=' + reader.marks);
  await page.screenshot({ path: OUT + '/shot-07-reader.png' });
  await page.keyboard.press('Escape');
  await sleep(200);

  // ---- mobile width ----
  const mob = await browser.newPage();
  await mob.setViewport({ width: 390, height: 844 });
  await mob.goto(URL, { waitUntil: 'networkidle0' });
  /* The list is drawn once the desk's data arrives, which over a real
     network can take longer than a fixed pause; wait for it, up to 5s. */
  await mob.waitForFunction(() => !document.getElementById('phoneList').hidden, { timeout: 5000 }).catch(() => {});
  await sleep(200);
  const listFirst = await mob.evaluate(() => !document.getElementById('phoneList').hidden &&
    getComputedStyle(document.querySelector('.desk')).display === 'none');
  ok('narrow screens open on the list', listFirst);
  await mob.click('#btnPhoneDesk');
  await sleep(400);
  const mobile = await mob.evaluate(() => ({
    noticeShown: getComputedStyle(document.querySelector('.desk-narrow')).display !== 'none',
    bodyOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
    scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth
  }));
  ok('the desk on a narrow screen gets the touch notice', mobile.noticeShown === true);
  ok('no horizontal page scroll at 390px', mobile.bodyOverflow === true, mobile.scrollW + ' vs ' + mobile.innerW);
  await mob.screenshot({ path: OUT + '/shot-08-mobile.png' });

  ok('no console errors anywhere', errs.length === 0, errs.join(' | '));

  console.log('\nPASS (' + pass.length + ')');
  pass.forEach(p => console.log('  ok  ' + p));
  if (fail.length) {
    console.log('\nFAIL (' + fail.length + ')');
    fail.forEach(f => console.log('  XX  ' + f));
  }
  console.log('\n' + (fail.length ? 'FAILURES: ' + fail.length : 'all green'));
  await browser.close();
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
