/* Features 1-3: the Reading Room door, browsing and dragging from the tray,
   and the thread (links that become cards). Real Chrome, real viewport. */
const puppeteer = require('puppeteer-core');
const { CHROME, BASE, URL, OUT } = require('./env');
const pass = [], fail = [];
const ok = (name, cond, extra) => (cond ? pass : fail).push(name + (extra != null ? ' :: ' + extra : ''));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const CASE = 'sacrifice-culture-vegetarian-jesus';

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    defaultViewport: { width: 1500, height: 950 }, args: ['--no-sandbox', '--disable-gpu'] });
  const errs = [];
  const fresh = async () => {
    const ctx = await browser.createBrowserContext();
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    return p;
  };
  const desk = async (p, hash) => {
    await p.goto(BASE + 'canvas.html' + (hash || ''), { waitUntil: 'load' });
    await p.waitForSelector('.tray-case');
    await p.waitForFunction(() => /desk|Searches|sources pinned|already/.test(document.getElementById('dhint').textContent));
    await sleep(700);
  };
  const state = p => p.evaluate(() => JSON.parse(localStorage.getItem('way.desk.v1') || '{"it":[],"ln":[]}'));
  const ids = p => p.evaluate(() => [].slice.call(document.querySelectorAll('.nodes .node')).map(n => n.getAttribute('data-id')));
  const tied = (st, a, b) => st.ln.some(l => (l[0] === a && l[1] === b) || (l[0] === b && l[1] === a));
  const center = (p, sel) => p.evaluate(s => {
    const e = document.querySelector(s); if (!e) return null;
    e.scrollIntoView({ block: 'center' });
    const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 18) };
  }, sel);
  const carry = async (p, from, to, shot) => {
    await p.mouse.move(from.x, from.y);
    await p.mouse.down();
    await p.mouse.move(from.x + 30, from.y + 4, { steps: 4 });
    await p.mouse.move(to.x, to.y, { steps: 14 });
    if (shot) await p.screenshot({ path: OUT + '/' + shot });
    const mid = await p.evaluate(() => ({ ghost: !!document.querySelector('.carry-ghost'), drop: document.getElementById('surface').classList.contains('is-drop') }));
    await p.mouse.up();
    await sleep(500);
    return mid;
  };
  const surfacePoint = (p, fx, fy) => p.evaluate((fx, fy) => {
    const r = document.getElementById('surface').getBoundingClientRect();
    return { x: Math.round(r.left + r.width * fx), y: Math.round(r.top + r.height * fy) };
  }, fx, fy);
  /* Pairs where a card of case `slug` overlaps any card not of that case, in world units. */
  const overlaps = (p, slug) => p.evaluate(slug => {
    const ns = [].slice.call(document.querySelectorAll('.nodes .node')).map(n => ({ id: n.getAttribute('data-id'),
      x: parseFloat(n.style.left), y: parseFloat(n.style.top), w: n.offsetWidth, h: n.offsetHeight }));
    const mine = n => n.id === 'q:' + slug || n.id.indexOf('s:' + slug + ':') === 0;
    const out = [];
    ns.filter(mine).forEach(a => ns.filter(b => !mine(b)).forEach(b => {
      if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) out.push(a.id + ' x ' + b.id);
    }));
    return out;
  }, slug);
  const nodeRect = (p, id) => p.evaluate(id => {
    const e = document.querySelector('.nodes [data-id="' + id + '"]'); if (!e) return null;
    const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom };
  }, id);

  /* ---------- 1. the Reading Room door ---------- */
  const room = await fresh();
  await room.goto(BASE + 'index.html#/' + CASE, { waitUntil: 'load' });
  await room.waitForSelector('.desk-door:not([hidden])');
  await sleep(500);
  const door = await room.evaluate(() => {
    const d = document.querySelector('.desk-door'), t = document.getElementById('folderTab');
    const rd = d.getBoundingClientRect(), rt = t.getBoundingClientRect();
    return { href: d.getAttribute('href'), dB: rd.bottom, tB: rt.bottom, dL: rd.left, tR: rt.right,
      tab: t.textContent, overflow: document.documentElement.scrollWidth > innerWidth + 1 };
  });
  ok('door points at this case', door.href === 'canvas.html#pull=' + CASE, door.href);
  ok('door sits on the folder tab row', Math.abs(door.dB - door.tB) <= 6 && door.dL > door.tR, JSON.stringify(door));
  ok('folder tab still renders its case', /CASE .*SACRIFICE/.test(door.tab), door.tab);
  ok('door adds no horizontal scroll', !door.overflow);
  await room.screenshot({ path: OUT + '/f01-room-door.png' });
  await room.goto(BASE + 'index.html#/' + CASE + '/2', { waitUntil: 'load' });
  await sleep(500);
  ok('door carries the open source', await room.evaluate(() => document.querySelector('.desk-door').getAttribute('href')) === 'canvas.html#pull=' + CASE + '&open=2');
  await room.goto(BASE + 'index.html', { waitUntil: 'load' });
  await sleep(500);
  ok('door hidden on the home page', await room.evaluate(() => document.querySelector('.desk-door').hidden));

  /* ---------- arriving through the door ---------- */
  const a = await fresh();
  await desk(a, '#pull=' + CASE + '&open=2');
  await sleep(600);
  const arr = await a.evaluate(c => {
    const card = null;
    return {
      hash: location.hash,
      q: !!document.querySelector('.nodes [data-id="q:' + c + '"]'),
      nodes: document.querySelectorAll('.nodes .node').length,
      strings: document.querySelectorAll('#links .string-line').length,
      trayOpen: !document.getElementById('trayOpen').hidden,
      trayQ: (document.querySelector('#trayOpen .qtext') || {}).textContent,
      trayPins: document.querySelectorAll('#trayOpen .tray-pins .fam-src').length,
      placed: document.querySelectorAll('#trayOpen .tray-pins .fam-src.is-placed').length,
      reader: !document.getElementById('reader').hidden,
      readerTitle: document.getElementById('readerTitle').textContent
    };
  }, CASE);
  const caseInfo = await a.evaluate(c => fetch('data.json').then(r => r.json()).then(d => {
    const card = d.cards.filter(x => x.slug === c)[0];
    return { n: card.sources.length, title2: card.sources[2].title || card.sources[2].ref, question: card.question };
  }), CASE);
  ok('arrival laid out the whole case', arr.q && arr.nodes === caseInfo.n + 1, arr.nodes + ' nodes for ' + caseInfo.n + ' sources');
  ok('arrival tied every source to the question', arr.strings === caseInfo.n, arr.strings);
  ok('arrival cleared the hash', arr.hash === '', arr.hash);
  ok('arrival opened the case in the tray', arr.trayOpen && arr.trayQ === caseInfo.question, arr.trayQ);
  ok('tray lists every source on the case', arr.trayPins === caseInfo.n, arr.trayPins);
  ok('tray marks them all as on the desk', arr.placed === caseInfo.n, arr.placed);
  ok('arrival opened the source being read', arr.reader && arr.readerTitle === caseInfo.title2, arr.readerTitle);
  await a.screenshot({ path: OUT + '/f02-arrival.png' });
  await a.keyboard.press('Escape');
  await sleep(200);

  /* A second arrival for a case already down lays nothing twice. */
  await a.goto(BASE + 'canvas.html#pull=' + CASE, { waitUntil: 'load' });
  await a.waitForSelector('.tray-case');
  await sleep(1500);
  ok('arriving again duplicates nothing', (await ids(a)).length === caseInfo.n + 1, (await ids(a)).length);

  /* ---------- 2. browse and drag from the tray ---------- */
  const t = await fresh();
  await desk(t);
  const BA = 'blood-atonement-and-salvation';
  await t.evaluate(() => [].slice.call(document.querySelectorAll('.tray-case')).filter(x => /Does God need blood/.test(x.textContent))[0].click());
  await sleep(300);
  const tv = await t.evaluate(() => ({
    open: !document.getElementById('trayOpen').hidden,
    listHidden: document.getElementById('trayCasesSection').hidden,
    finding: !!document.querySelector('#trayOpen .tray-finding'),
    verseChips: document.querySelectorAll('#trayOpen .chips .chip-v').length,
    clamped: document.querySelector('#trayOpen .tray-finding').classList.contains('is-clamped'),
    firstPinVisible: document.querySelector('#trayOpen .tray-pins .fam-src').getBoundingClientRect().bottom <= innerHeight,
    nodes: document.querySelectorAll('.nodes .node').length
  }));
  ok('clicking a case opens it in the tray, not on the desk', tv.open && tv.listHidden && tv.nodes === 0, JSON.stringify(tv));
  ok('tray lists the verses the case cites', tv.finding && tv.verseChips > 0, 'verse chips=' + tv.verseChips);
  ok('the finding is clamped so the sources are in reach', tv.clamped && tv.firstPinVisible);
  await t.screenshot({ path: OUT + '/f03-tray-case.png' });

  const from = await center(t, '#trayOpen .tray-pins .fam-src');
  const drop = await surfacePoint(t, 0.45, 0.4);
  const mid = await carry(t, from, drop, 'f04-carrying.png');
  ok('a ghost follows the pointer while carrying', mid.ghost);
  ok('the desk shows it is a drop target', mid.drop);
  const s0 = 's:' + BA + ':0';
  const r0 = await nodeRect(t, s0);
  ok('dragging a tray source pins it', !!r0);
  ok('it lands under the pointer', r0 && drop.x >= r0.l - 4 && drop.x <= r0.r && drop.y >= r0.t - 4 && drop.y <= r0.b, JSON.stringify({ drop, r0 }));
  ok('ghost removed after the drop', await t.evaluate(() => !document.querySelector('.carry-ghost') && !document.body.classList.contains('is-carrying')));
  ok('the tray marks it as placed', await t.evaluate(id => document.querySelector('#trayOpen [data-item-id="' + id + '"]').classList.contains('is-placed'), s0));
  const before0 = await t.evaluate(id => { const e = document.querySelector('.nodes [data-id="' + id + '"]'); return [e.style.left, e.style.top]; }, s0);

  const fromHead = await center(t, '#trayOpen .tray-qcard');
  const drop2 = await surfacePoint(t, 0.5, 0.15);
  await carry(t, fromHead, drop2);
  await sleep(600);
  const st2 = await state(t);
  const baInfo = await t.evaluate(c => fetch('data.json').then(r => r.json()).then(d => d.cards.filter(x => x.slug === c)[0].sources.length), BA);
  const ids2 = await ids(t);
  ok('dragging the case head lays out the whole case', ids2.length === baInfo + 1 && ids2.indexOf('q:' + BA) >= 0, ids2.length + ' for ' + baInfo);
  ok('the source already down was tied, not moved', tied(st2, 'q:' + BA, s0) &&
    JSON.stringify(await t.evaluate(id => { const e = document.querySelector('.nodes [data-id="' + id + '"]'); return [e.style.left, e.style.top]; }, s0)) === JSON.stringify(before0));
  ok('every source tied to the question', st2.ln.length === baInfo, st2.ln.length);

  /* A source clicked in the tray of a case whose question is down ties to it. */
  await t.click('#trayOpen .tray-back');
  await sleep(200);
  ok('back returns to the case list', await t.evaluate(() => !document.getElementById('trayCasesSection').hidden && document.getElementById('trayOpen').hidden));

  /* Drag a case row from the list. */
  const rowSel = '.tray-case';
  const rowPt = await t.evaluate(() => {
    const b = [].slice.call(document.querySelectorAll('#trayCasesSection .tray-case')).filter(x => /Who were the Nazarenes|Nazarene/.test(x.textContent))[0] ||
      document.querySelectorAll('#trayCasesSection .tray-case')[3];
    b.scrollIntoView({ block: 'center' });
    const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 14, text: b.textContent };
  });
  const before3 = (await ids(t)).length;
  await carry(t, rowPt, await surfacePoint(t, 0.7, 0.7));
  await sleep(600);
  ok('dragging a case row onto the desk lays it out', (await ids(t)).length > before3 + 1, before3 + ' -> ' + (await ids(t)).length + ' (' + rowPt.text.slice(0, 40) + ')');

  /* Drop a case straight onto the middle of cards already down. */
  const freeRow = await t.evaluate(() => {
    const rows = [].slice.call(document.querySelectorAll('.tray-case'));
    for (const b of rows) {
      const slug = b.getAttribute('data-slug');
      if (slug && !document.querySelector('.nodes [data-id="q:' + slug + '"]')) { b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 14, slug }; }
    }
    return null;
  });
  const busy = await t.evaluate(id => { const e = document.querySelector('.nodes [data-id="' + id + '"]'); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, s0);
  await carry(t, freeRow, busy);
  await sleep(700);
  const ov2 = await overlaps(t, freeRow.slug);
  ok('a case dropped onto occupied space overlaps nothing', (await ids(t)).indexOf('q:' + freeRow.slug) >= 0 && ov2.length === 0, ov2.slice(0, 4).join(', '));
  ok('and says where it went', /below the desk/.test(await t.evaluate(() => document.getElementById('dhint').textContent)));

  /* Off-desk drop pins nothing. */
  const famHead = await center(t, '.fam-head');
  await t.click('.fam-head');
  await sleep(150);
  const famSrc = await t.evaluate(() => { const b = [].slice.call(document.querySelectorAll('.fam.is-open .fam-src')).filter(x => !x.classList.contains('is-placed'))[0]; b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 10, id: b.getAttribute('data-src-id') }; });
  const n4 = (await ids(t)).length;
  await carry(t, famSrc, { x: famSrc.x, y: 30 });
  ok('letting go off the desk pins nothing', (await ids(t)).length === n4 && /off the desk/.test(await t.evaluate(() => document.getElementById('dhint').textContent)));
  await carry(t, famSrc, await surfacePoint(t, 0.3, 0.85));
  ok('a family source can be carried onto the desk', (await ids(t)).indexOf(famSrc.id) >= 0, famSrc.id);

  /* ---------- 3. the thread ---------- */
  const r = await fresh();
  await desk(r, '#pull=' + CASE);
  await r.keyboard.press('Escape');
  await sleep(300);
  /* Find a source whose note has a held verse in it. */
  const srcIds = (await ids(r)).filter(x => x.indexOf('s:') === 0);
  let origin = null, chipKey = null;
  for (const id of srcIds) {
    const pt = await r.evaluate(id => { const e = document.querySelector('.nodes [data-id="' + id + '"] .pincard'); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.bottom - 8 }; }, id);
    await r.mouse.click(pt.x, pt.y);
    await sleep(250);
    const c = await r.evaluate(() => { const ch = document.querySelector('#readerNote .chip.inline'); return ch ? ch.textContent : null; });
    if (c) { origin = id; chipKey = c; break; }
    await r.keyboard.press('Escape');
    await sleep(120);
  }
  ok('a source note carries a live verse', !!origin, origin + ' / ' + chipKey);
  await r.screenshot({ path: OUT + '/f05-reader-note-chips.png' });
  const keyOf = await r.evaluate(() => document.querySelector('#readerNote .chip.inline').getAttribute('data-item-id'));
  ok('the reader offers its case file in the thread', await r.evaluate(() => /ITS CASE FILE/.test(document.getElementById('readerThread').textContent)));
  await r.click('#readerNote .chip.inline');
  await sleep(500);
  const st3 = await state(r);
  ok('clicking a verse closes the reader', await r.evaluate(() => document.getElementById('reader').hidden));
  ok('the verse lands on the desk', (await ids(r)).indexOf(keyOf) >= 0, keyOf);
  ok('tied by string to the card it came from', tied(st3, origin, keyOf), origin + ' <-> ' + keyOf);
  const vr = await nodeRect(r, keyOf), or = await nodeRect(r, origin);
  ok('it lands beside its origin, not on top of it', vr && or && (vr.l >= or.r || vr.t >= or.b || vr.r <= or.l), JSON.stringify({ vr, or }));
  ok('the verse card is stamped HELD · KJV', await r.evaluate(id => /HELD · KJV/.test(document.querySelector('.nodes [data-id="' + id + '"] .stamp').textContent), keyOf));
  await r.screenshot({ path: OUT + '/f06-verse-on-desk.png' });

  /* Undo takes card and string off together. */
  const nBefore = (await ids(r)).length;
  await r.evaluate(() => document.getElementById('surface').focus());
  await r.keyboard.down('Control'); await r.keyboard.press('KeyZ'); await r.keyboard.up('Control');
  await sleep(300);
  const stU = await state(r);
  ok('one undo removes the verse and its string', (await ids(r)).length === nBefore - 1 && !tied(stU, origin, keyOf));
  /* put it back by clicking again, to keep exploring from it */
  const pt2 = await r.evaluate(id => { const e = document.querySelector('.nodes [data-id="' + id + '"] .pincard'); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.bottom - 8 }; }, origin);
  await r.mouse.click(pt2.x, pt2.y); await sleep(250);
  await r.click('#readerNote .chip.inline'); await sleep(400);

  /* The verse card's own reader: passage in context and its backlinks. */
  const vpt = await r.evaluate(id => { const e = document.querySelector('.nodes [data-id="' + id + '"] .pincard'); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.bottom - 8 }; }, keyOf);
  await r.mouse.click(vpt.x, vpt.y);
  await sleep(300);
  const vread = await r.evaluate(() => ({
    title: document.getElementById('readerTitle').textContent,
    verses: document.querySelectorAll('#readerBody .v:not(.dim)').length,
    ctx: document.querySelectorAll('#readerBody .v.dim').length,
    thread: document.getElementById('readerThread').textContent
  }));
  ok('verse reader shows the verse', vread.verses >= 1 && keyOf === 'v:' + vread.title, vread.title);
  ok('verse reader shows its context', vread.ctx >= 1, vread.ctx);
  ok('verse reader lists where the cases cite it', /CITED IN THE PROSE OF/.test(vread.thread));
  await r.screenshot({ path: OUT + '/f07-verse-reader.png' });
  await r.keyboard.press('Escape'); await sleep(150);

  /* The question card as a hub. FIT first, as a reader would, so the card is in view. */
  await r.click('#btnFit'); await sleep(300);
  const qpt = await r.evaluate(c => { const e = document.querySelector('.nodes [data-id="q:' + c + '"] .qcard'); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.bottom - 8 }; }, CASE);
  await r.mouse.click(qpt.x, qpt.y);
  await sleep(300);
  const hub = await r.evaluate(() => ({
    title: document.getElementById('readerTitle').textContent,
    finding: !!document.querySelector('#readerBody .case-finding'),
    groups: [].slice.call(document.querySelectorAll('#readerThread .thread-group .eyebrow')).map(e => e.textContent),
    nextChips: document.querySelectorAll('#readerThread .chip-case').length,
    docChips: document.querySelectorAll('#readerThread .chip-d').length,
    lay: !!document.querySelector('#readerNote .lay-out')
  }));
  ok('question card opens the case hub', hub.title === caseInfo.question && hub.finding && hub.lay, hub.title);
  ok('hub offers verses, next cases and go-deeper', hub.groups.length === 3 && hub.nextChips > 0 && hub.docChips > 0, JSON.stringify(hub.groups));
  await r.screenshot({ path: OUT + '/f08-case-hub.png' });

  /* Drag a go-deeper chip out of the reader onto the desk. */
  const docPt = await center(r, '#readerThread .chip-d');
  const docId = await r.evaluate(() => document.querySelector('#readerThread .chip-d').getAttribute('data-item-id'));
  const docDrop = await surfacePoint(r, 0.2, 0.25);
  const dmid = await carry(r, docPt, docDrop);
  ok('lifting a chip gets the reader out of the way', dmid.drop && await r.evaluate(() => document.getElementById('reader').hidden));
  const st4 = await state(r);
  ok('the go-deeper card lands where dropped', !!(await nodeRect(r, docId)), docId);
  ok('and ties back to the question it came from', tied(st4, 'q:' + CASE, docId));
  ok('a go-deeper card carries no stamp', await r.evaluate(id => !document.querySelector('.nodes [data-id="' + id + '"] .stamp'), docId));

  /* Click a next-case chip: its question lands beside the hub, tied; then lay it out from its own hub. */
  await r.mouse.click(qpt.x, qpt.y); await sleep(300);
  const nextSlug = await r.evaluate(() => { const c = document.querySelector('#readerThread .chip-case'); return c; }) && await r.evaluate(() => {
    const groups = [].slice.call(document.querySelectorAll('#readerThread .thread-group'));
    const g = groups.filter(x => /NEXT IN THE DRAWER/.test(x.textContent))[0];
    return g.querySelector('.chip-case .chip-label').textContent;
  });
  const before5 = (await ids(r)).length;
  await r.evaluate(() => {
    const groups = [].slice.call(document.querySelectorAll('#readerThread .thread-group'));
    groups.filter(x => /NEXT IN THE DRAWER/.test(x.textContent))[0].querySelector('.chip-case').click();
  });
  await sleep(400);
  const newQ = (await ids(r)).filter(x => x.indexOf('q:') === 0 && x !== 'q:' + CASE)[0];
  const st5 = await state(r);
  ok('a next-case chip puts that question on the desk', (await ids(r)).length === before5 + 1 && !!newQ, nextSlug);
  ok('tied to the case it came from', tied(st5, 'q:' + CASE, newQ));
  const nq = await r.evaluate(id => { const e = document.querySelector('.nodes [data-id="' + id + '"] .qcard'); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.bottom - 8 }; }, newQ);
  await r.mouse.click(nq.x, nq.y); await sleep(300);
  await r.click('#readerNote .lay-out');
  await sleep(1200);
  const st6 = await state(r);
  const nextN = await r.evaluate(s => fetch('data.json').then(x => x.json()).then(d => d.cards.filter(c => c.slug === s)[0].sources.length), newQ.slice(2));
  const laid = st6.it.filter(x => x[0] === 's' && x[1] === newQ.slice(2)).length;
  ok('LAY OUT ITS SOURCES pulls the case under its question', laid === nextN, laid + ' of ' + nextN);
  const qy = st6.it.filter(x => x[0] === 'q' && x[1] === newQ.slice(2))[0];
  const minSrcY = Math.min.apply(null, st6.it.filter(x => x[0] === 's' && x[1] === newQ.slice(2)).map(x => x[4]));
  ok('laid out below the question, not elsewhere', minSrcY > qy[3], 'q.y=' + qy[3] + ' first source y=' + minSrcY);
  const ov1 = await overlaps(r, newQ.slice(2));
  ok('the laid-out case overlaps nothing already down', ov1.length === 0, ov1.slice(0, 4).join(', '));
  await r.screenshot({ path: OUT + '/f09-trail.png' });

  /* Search for a verse. */
  await r.evaluate(() => { document.getElementById('dq').value = ''; });
  await r.type('#dq', 'micah 6:8');
  await sleep(300);
  const sug = await r.evaluate(() => (document.querySelector('#dsuggest li') || {}).textContent || '');
  ok('typing a cited verse suggests the verse card', /^Micah 6:8/.test(sug), sug);
  await r.keyboard.press('Enter');
  await sleep(400);
  ok('Enter pins the verse card', (await ids(r)).indexOf('v:Micah 6:8') >= 0);

  /* Share link carries verse and go-deeper cards and their strings. */
  const enc = JSON.stringify(await state(r));
  const sh = await fresh();
  await desk(sh, '#b=' + encodeURIComponent(enc));
  const a1 = await ids(r), a2 = await ids(sh);
  const s1 = await r.evaluate(() => document.querySelectorAll('#links .string-line').length);
  const s2 = await sh.evaluate(() => document.querySelectorAll('#links .string-line').length);
  ok('share link rebuilds verse and go-deeper cards', a1.length === a2.length && a2.some(x => x.indexOf('v:') === 0) && a2.some(x => x.indexOf('d:') === 0), a1.length + ' vs ' + a2.length);
  ok('and every string', s1 === s2, s1 + ' vs ' + s2);

  /* A desk saved with a verse the build no longer holds drops it quietly. */
  const bogus = JSON.stringify({ v: 1, it: [['v', 'Hosea 99:1', 0, 0, 250], ['q', CASE, 300, 0, 270]], ln: [['v:Hosea 99:1', 'q:' + CASE]] });
  const bg = await fresh();
  await desk(bg, '#b=' + encodeURIComponent(bogus));
  ok('a stale verse is dropped, not drawn blank', JSON.stringify(await ids(bg)) === JSON.stringify(['q:' + CASE]) &&
    await bg.evaluate(() => document.querySelectorAll('#links .string-line').length) === 0);

  /* Phones: the door stays out of the way, and the open tray does not overflow. */
  const ph = await fresh();
  await ph.setViewport({ width: 390, height: 844 });
  await ph.goto(BASE + 'index.html#/' + CASE, { waitUntil: 'load' });
  await sleep(800);
  const phone = await ph.evaluate(() => ({ door: getComputedStyle(document.querySelector('.desk-door')).display,
    over: document.documentElement.scrollWidth - innerWidth }));
  ok('phones do not get the door', phone.door === 'none', phone.door);
  ok('Reading Room has no sideways scroll at 390px', phone.over <= 1, phone.over);
  await ph.goto(BASE + 'canvas.html#pull=' + CASE, { waitUntil: 'load' });
  await ph.waitForSelector('.tray-case');
  await sleep(1800);
  ok('desk with a case open in the tray has no sideways scroll at 390px', await ph.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1);
  await ph.screenshot({ path: OUT + '/f10-phone.png' });
  const tab = await fresh();
  await tab.setViewport({ width: 1024, height: 768 });
  await desk(tab, '#pull=' + CASE);
  await sleep(500);
  ok('tablet width: tray case view fits', await tab.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1);
  await tab.screenshot({ path: OUT + '/f11-tablet.png' });

  ok('no console errors anywhere', errs.length === 0, errs.join(' | '));

  console.log('\nPASS (' + pass.length + ')');
  pass.forEach(p => console.log('  ok  ' + p));
  if (fail.length) { console.log('\nFAIL (' + fail.length + ')'); fail.forEach(f => console.log('  XX  ' + f)); }
  console.log('\n' + (fail.length ? 'FAILURES: ' + fail.length : 'all green'));
  await browser.close();
  process.exit(fail.length ? 1 : 0);
})().catch(e => {
  console.log('PASS so far'); pass.forEach(p => console.log('  ok  ' + p));
  fail.forEach(f => console.log('  XX  ' + f));
  console.error('HARNESS ERROR', e); process.exit(2);
});
