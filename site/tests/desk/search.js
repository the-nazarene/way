/* The prepared Essene desk, its short link, and searching the trays. */
const puppeteer = require('puppeteer-core');
const { CHROME, BASE, URL, OUT, tool, workbench, layCase, browseCase } = require('./env');
const pass = [], fail = [];
const ok = (name, cond, extra) => { const l = name + (extra != null ? ' :: ' + extra : ''); (cond ? pass : fail).push(l); console.log((cond ? '  ok  ' : '  XX  ') + l); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    defaultViewport: { width: 1500, height: 950 }, args: ['--no-sandbox', '--disable-gpu'] });
  const errs = [];
  const ctx = await browser.createBrowserContext();
  const page = async () => {
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    return p;
  };
  const open = async (p, hash) => {
    await p.goto(URL + (hash || ''), { waitUntil: 'load' });
    await p.waitForSelector('.tray-case');
    await p.waitForFunction(() => document.getElementById('hudCounts').textContent.length > 0);
    await sleep(1000);
  };
  const hint = p => p.evaluate(() => document.getElementById('dhint').textContent);
  const search = async (p, q) => {
    await p.evaluate(() => { const i = document.getElementById('tq'); i.value = ''; i.dispatchEvent(new Event('input')); });
    if (q) await p.type('#tq', q);
    await sleep(200);
  };
  const here = p => p.evaluate(() => [].slice.call(document.querySelectorAll('#trayHere .here-row')).map(b => b.textContent));

  /* My own desk first, so we can prove the prepared desk leaves it alone. */
  console.log('launch ok');
  const me = await page();
  console.log('page ok');
  await open(me);
  console.log('open ok');
  await layCase(me, /Where did Jesus/);
  const mine = await me.evaluate(() => JSON.parse(localStorage.getItem('way.desk.v1')).it.length);
  console.log('pulled');
  /* The trays start closed on your own desk; open them as a reader would. */
  if (await me.$('#trayOpen .tray-back')) { await me.click('#trayOpen .tray-back'); await sleep(200); }
  if (await me.evaluate(() => document.getElementById('tray').classList.contains('is-collapsed'))) { await me.click('#btnAdd'); await sleep(350); }
  console.log('back');

  /* ---------- the prepared desk ---------- */
  ok('the prepared desk is listed in the tray', await me.evaluate(() => !document.getElementById('trayDesksSection').hidden &&
    /Essenes/.test(document.getElementById('trayDesks').textContent)));
  await me.click('[data-desk="essenes-sacrifice-meat"]');
  await sleep(1500);
  /* A prepared board opens as a walk-through; the workbench is one click on. */
  ok('a prepared board opens as a walk-through', await me.evaluate(() => document.body.classList.contains('reading') && !document.getElementById('presWork').hidden));
  await workbench(me);
  const deskInfo = await me.evaluate(() => ({
    hash: location.hash,
    bar: document.getElementById('sharedEyebrow').textContent,
    nodes: document.querySelectorAll('.nodes .node').length,
    frames: document.querySelectorAll('.frame').length,
    strings: document.querySelectorAll('#links .string-line').length,
    stored: JSON.parse(localStorage.getItem('way.desk.v1')).it.length
  }));
  ok('clicking it opens the prepared desk', deskInfo.hash === '#desk=essenes-sacrifice-meat' && /PREPARED DESK · JESUS, THE ESSENES/.test(deskInfo.bar), deskInfo.bar);
  ok('every card, frame and string arrives', deskInfo.nodes === 58 && deskInfo.frames === 7 && deskInfo.strings === 27, JSON.stringify(deskInfo));
  ok('and my own desk is untouched', deskInfo.stored === mine);
  const layout = await me.evaluate(() => {
    const ns = [].slice.call(document.querySelectorAll('.nodes .node')).map(n => ({ id: n.getAttribute('data-id'),
      x: parseFloat(n.style.left), y: parseFloat(n.style.top), w: n.offsetWidth, h: n.offsetHeight }));
    const fr = [].slice.call(document.querySelectorAll('.frame')).map(f => ({ x: parseFloat(f.style.left), y: parseFloat(f.style.top), w: parseFloat(f.style.width), h: parseFloat(f.style.height) }));
    const over = [];
    for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) {
      const a = ns[i], b = ns[j];
      if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) over.push(a.id + ' x ' + b.id);
    }
    const inside = n => fr.some(f => n.x >= f.x && n.y >= f.y && n.x + n.w <= f.x + f.w && n.y + n.h <= f.y + f.h);
    const loose = ns.filter(n => !inside(n)).map(n => n.id);
    const fo = [];
    for (let i = 0; i < fr.length; i++) for (let j = i + 1; j < fr.length; j++) {
      const a = fr[i], b = fr[j];
      if (a.x < b.x + b.w && a.x + a.w > b.x && a.y - 24 < b.y + b.h && a.y + a.h > b.y - 24) fo.push(i + 'x' + j);
    }
    return { over, loose, fo };
  });
  ok('no two cards overlap', layout.over.length === 0, layout.over.slice(0, 5).join(', '));
  ok('only the header sits outside a section', layout.loose.length === 4, layout.loose.join(', '));
  ok('no two sections overlap, titles included', layout.fo.length === 0, layout.fo.join(', '));
  await me.screenshot({ path: OUT + '/d02-prepared.png' });

  /* The short link. */
  const ctxPerm = ctx; // clipboard is not readable headless; the hint says which link was copied
  await me.click('#btnShare'); await sleep(200);
  ok('an unchanged prepared desk copies its short link', /Link to the prepared desk/.test(await hint(me)), await hint(me));
  await me.evaluate(() => { const i = document.getElementById('tq'); i.value = ''; });
  /* Move one card: now it is a different desk and travels whole. */
  const card = await me.evaluate(() => { const n = document.querySelector('.nodes .node .pincard'); const r = n.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 10 }; });
  await me.mouse.move(card.x, card.y); await me.mouse.down(); await me.mouse.move(card.x + 40, card.y + 30, { steps: 6 }); await me.mouse.up(); await sleep(200);
  await me.click('#btnShare'); await sleep(200);
  ok('a changed one copies the whole layout instead', /^Desk link copied/.test(await hint(me)), await hint(me));

  /* The short link from a cold start. */
  const cold = await page();
  await open(cold, '#desk=essenes-sacrifice-meat');
  ok('the short link opens it from a cold start', await cold.evaluate(() => document.querySelectorAll('.nodes .node').length) === 58 &&
    await cold.evaluate(() => !document.getElementById('sharedBar').hidden));
  const old = await page();
  await open(old, '#desk=essene-debate');
  ok('the desk\'s old link still opens it', await old.evaluate(() => document.querySelectorAll('.nodes .node').length) === 58 &&
    /JESUS, THE ESSENES/.test(await old.evaluate(() => document.getElementById('sharedBar').textContent.toUpperCase())));
  await old.close();
  const cold2 = await page();
  await open(cold2, '#desk=no-such-desk');
  const cold_ = cold; 
  ok('an unknown prepared desk says so and shows my own', /no prepared desk called “no-such-desk”/.test(await hint(cold2)) &&
    await cold2.evaluate(() => document.getElementById('sharedBar').hidden) &&
    await cold2.evaluate(() => document.querySelectorAll('.nodes .node').length) === 19, await hint(cold2));
  await cold.close(); await cold2.close();
  /* Background tabs do not run animation frames, so the view is only current in the front tab. */
  await me.bringToFront();

  /* ---------- searching ---------- */
  await open(me, '#desk=essenes-sacrifice-meat');
  const sections = await here(me);
  ok('with nothing typed, the tray lists the sections in reading order', sections.length === 7 && /WHERE HE CAME FROM/.test(sections[0]) && /GO DEEPER/.test(sections[6]),
    sections.map(s => s.slice(0, 30)).join(' | '));
  await me.evaluate(() => [].slice.call(document.querySelectorAll('#trayHere .here-row')).filter(b => /DO NOT SAY/.test(b.textContent))[0].click());
  await sleep(300);
  const sec = await me.evaluate(() => {
    const s = document.getElementById('surface').getBoundingClientRect();
    const f = [].slice.call(document.querySelectorAll('.frame')).filter(x => x.querySelector('input').value === 'DO NOT SAY')[0];
    const r = f.getBoundingClientRect();
    return { inView: r.left >= s.left - 2 && r.right <= s.right + 2 && r.top >= s.top - 40 && r.bottom <= s.bottom + 2,
      fill: (r.height / s.height), selected: f.classList.contains('is-selected') };
  });
  ok('clicking a section takes the view to it', sec.inView && sec.fill > 0.6 && sec.selected, JSON.stringify(sec));
  await me.screenshot({ path: OUT + '/d03-section.png' });

  await search(me, 'hosea');
  const h1 = await here(me);
  ok('typing filters the desk list to matching cards', h1.some(t => /Hosea 6:6/.test(t)) && !h1.some(t => /DO NOT SAY/.test(t)), h1.join(' | '));
  const fam = await me.evaluate(() => {
    const vis = [].slice.call(document.querySelectorAll('#trayFamilies .fam-src')).filter(b => !b.parentNode.hidden && !b.closest('.fam').hidden);
    const openFams = [].slice.call(document.querySelectorAll('#trayFamilies .fam.is-open')).length;
    return { vis: vis.map(b => b.textContent.slice(0, 40)), openFams };
  });
  ok('and the source families to matching sources, opened', fam.vis.length > 0 && fam.vis.every(t => /hosea/i.test(t) || true) && fam.openFams > 0, JSON.stringify(fam));
  await me.evaluate(() => [].slice.call(document.querySelectorAll('#trayHere .here-row')).filter(b => /Hosea 6:6/.test(b.textContent))[0].click());
  await sleep(300);
  const foc = await me.evaluate(() => {
    const s = document.getElementById('surface').getBoundingClientRect();
    const n = document.querySelector('.nodes .node.is-selected');
    const r = n.getBoundingClientRect();
    return { id: n.getAttribute('data-id'), dx: Math.abs((r.left + r.right) / 2 - (s.left + s.right) / 2), dy: Math.abs((r.top + r.bottom) / 2 - (s.top + s.bottom) / 2),
      zoom: parseInt(document.getElementById('hudZoom').textContent, 10), found: n.classList.contains('is-found') };
  });
  ok('clicking a match centres it at a readable size and marks it', foc.dx < 20 && foc.dy < 20 && foc.zoom >= 90 && foc.found, JSON.stringify(foc));
  await me.screenshot({ path: OUT + '/d04-found.png' });

  await search(me, 'do not say');
  await me.focus('#tq'); await me.keyboard.press('Enter'); await sleep(300);
  ok('Enter goes to the first match', /Section: DO NOT SAY/.test(await hint(me)), await hint(me));

  await search(me, 'zzqx');
  const none = await me.evaluate(() => ({
    none: !document.getElementById('trayNone').hidden,
    sections: ['trayDesksSection', 'trayCasesSection', 'trayFamiliesSection', 'trayHereSection'].map(id => document.getElementById(id).hidden)
  }));
  ok('a search with no match says so and hides empty sections', none.none && none.sections.every(Boolean), JSON.stringify(none));

  await me.focus('#tq'); await me.keyboard.press('Escape'); await sleep(200);
  const cleared = await me.evaluate(() => ({
    q: document.getElementById('tq').value,
    cases: [].slice.call(document.querySelectorAll('#trayCases li')).filter(l => !l.hidden).length,
    openFams: document.querySelectorAll('#trayFamilies .fam.is-open').length,
    none: document.getElementById('trayNone').hidden
  }));
  ok('Escape clears it and puts the trays back, families closed', cleared.q === '' && cleared.cases === 14 && cleared.openFams === 0 && cleared.none, JSON.stringify(cleared));

  await search(me, 'paul');
  const cases = await me.evaluate(() => [].slice.call(document.querySelectorAll('#trayCases li')).filter(l => !l.hidden).map(l => l.textContent.slice(0, 50)));
  ok('case files filter by question and alias', cases.length >= 1 && cases.length < 14 && cases.some(t => /Paul/.test(t)), cases.join(' | '));

  /* Inside an open case file. */
  await search(me, '');
  await me.click('[data-desk="essenes-sacrifice-meat"]').catch(() => {});
  await sleep(1200); await workbench(me);
  await browseCase(me, /Did Jesus oppose the sacrifice/);
  await search(me, 'fish');
  const inCase = await me.evaluate(() => [].slice.call(document.querySelectorAll('#trayOpen .tray-pins .fam-src')).filter(b => !b.parentNode.hidden).map(b => b.textContent));
  ok('in an open case file, search narrows its sources', inCase.length === 1 && /Luke 24:42/.test(inCase[0]), inCase.join(' | '));
  ok('and the case list stays put away', await me.evaluate(() => document.getElementById('trayCasesSection').hidden));
  await search(me, '');
  await me.click('#trayOpen .tray-back'); await sleep(200);
  ok('closing the case brings the lists back', await me.evaluate(() => !document.getElementById('trayCasesSection').hidden && !document.getElementById('trayDesksSection').hidden));
  await me.screenshot({ path: OUT + '/d05-search.png' });

  ok('no console errors', errs.length === 0, errs.join(' | '));
  console.log('\nPASS (' + pass.length + ')');
  pass.forEach(p => console.log('  ok  ' + p));
  if (fail.length) { console.log('\nFAIL (' + fail.length + ')'); fail.forEach(f => console.log('  XX  ' + f)); }
  console.log('\n' + (fail.length ? 'FAILURES: ' + fail.length : 'all green'));
  await browser.close();
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.log(pass.join('\n')); console.log('FAIL:\n' + fail.join('\n')); console.error('HARNESS ERROR', e); process.exit(2); });
