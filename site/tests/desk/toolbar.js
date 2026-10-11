/* The toolbar: one tidy row of what is used often, a MORE menu for the
   rest, and an empty desk that starts in one click. */
const puppeteer = require('puppeteer-core');
const { CHROME, URL, OUT } = require('./env');
const pass = [], fail = [];
const ok = (name, cond, extra) => { const l = name + (extra != null ? ' :: ' + extra : ''); (cond ? pass : fail).push(l); console.log((cond ? 'live ok  ' : 'live XX  ') + l); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const MINE = { v: 1, vp: [0, 0, 1], it: [['n', 'A note on my own desk.', 100, 120, 240], ['n', 'And another.', 500, 120, 240]], ln: [['n:1', 'n:2']] };

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    defaultViewport: { width: 1500, height: 950 }, args: ['--no-sandbox', '--disable-gpu'] });
  const errs = [];
  const fresh = async (w, h, hash, seed) => {
    const p = await (await browser.createBrowserContext()).newPage();
    if (w) await p.setViewport({ width: w, height: h });
    p.on('pageerror', e => errs.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    if (seed) await p.evaluateOnNewDocument(d => {
      if (sessionStorage.getItem('seeded')) return;
      localStorage.setItem('way.desk.v1', JSON.stringify(d)); sessionStorage.setItem('seeded', '1');
    }, seed);
    await p.goto(URL + (hash || ''), { waitUntil: 'load' });
    await p.waitForSelector('.tray-case');
    await sleep(900);
    return p;
  };
  const hint = p => p.evaluate(() => document.getElementById('dhint').textContent);
  const menuOpen = p => p.evaluate(() => !document.getElementById('moreMenu').hidden);
  const visible = p => p.evaluate(() => [].filter.call(document.querySelectorAll('.desk-tools button'), b => b.offsetParent !== null).map(b => b.textContent.trim()));
  const nodes = p => p.evaluate(() => document.querySelectorAll('.nodes .node').length);

  /* ---------- one row, at every desk width ---------- */
  for (const [w, h] of [[1500, 950], [1280, 800], [1024, 700]]) {
    const p = await fresh(w, h, '#desk=essenes-sacrifice-meat');
    const rail = await p.evaluate(() => {
      const bs = [].filter.call(document.querySelectorAll('.desk-tools > .tool-group > .tool, .desk-tools .more > .tool'), b => b.offsetParent !== null);
      const tops = bs.map(b => Math.round(b.getBoundingClientRect().top));
      const r = document.querySelector('.desk-tools').getBoundingClientRect();
      return { rows: new Set(tops).size, h: Math.round(r.height), over: document.documentElement.scrollWidth - innerWidth };
    });
    ok(w + 'px: the toolbar is one row', rail.rows === 1 && rail.h <= 40 && rail.over <= 0, JSON.stringify(rail));
    if (w === 1500) {
      ok('it shows what is used often, and only that', JSON.stringify(await visible(p)) === JSON.stringify(['+ FRAME', '+ NOTE', 'TIDY', 'FIT', 'SNAP', 'STRING', '▶ PRESENT', 'SHARE', 'SAVE FILE', '⋯ MORE']), JSON.stringify(await visible(p)));
      await p.screenshot({ path: OUT + '/t01-toolbar.png', clip: { x: 0, y: 0, width: 1500, height: 480 } });
    }
    await p.close();
  }

  /* ---------- the MORE menu ---------- */
  const p = await fresh(null, null, '', MINE);
  ok('the menu starts closed', !(await menuOpen(p)) && await p.evaluate(() => document.getElementById('btnMore').getAttribute('aria-expanded')) === 'false');
  await p.click('#btnMore'); await sleep(150);
  const m = await p.evaluate(() => {
    const r = document.getElementById('moreMenu').getBoundingClientRect();
    return { items: [].map.call(document.querySelectorAll('#moreMenu button'), b => b.textContent.replace(/\s+/g, ' ').trim()),
      focus: document.activeElement.id, exp: document.getElementById('btnMore').getAttribute('aria-expanded'),
      inView: r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight };
  });
  ok('MORE opens OPEN FILE, COPY JSON and CLEAR THE DESK', m.items.length === 3 && /^OPEN FILE/.test(m.items[0]) && m.items[1] === 'COPY JSON' && m.items[2] === 'CLEAR THE DESK', JSON.stringify(m.items));
  ok('it opens on screen, with focus on its first item', m.inView && m.focus === 'btnOpenFile' && m.exp === 'true', JSON.stringify(m));
  await p.screenshot({ path: OUT + '/t02-more.png', clip: { x: 700, y: 0, width: 800, height: 520 } });
  /* A screenshot takes focus from the page; open the menu afresh for the keys. */
  await p.click('#btnMore'); await sleep(100); await p.click('#btnMore'); await sleep(150);
  await p.keyboard.press('ArrowDown'); await sleep(50);
  ok('arrow keys move through it', await p.evaluate(() => document.activeElement.id) === 'btnJson');
  await p.keyboard.press('ArrowUp'); await p.keyboard.press('ArrowUp'); await sleep(50);
  ok('and wrap round', await p.evaluate(() => document.activeElement.id) === 'btnClear');
  await p.keyboard.press('Escape'); await sleep(100);
  ok('Esc closes it and puts focus back on MORE', !(await menuOpen(p)) && await p.evaluate(() => document.activeElement.id) === 'btnMore');
  ok('and Esc there did not drop anything else', (await nodes(p)) === 2);
  await p.click('#btnMore'); await sleep(100);
  await p.mouse.click(60, 700); await sleep(100);
  ok('a click elsewhere closes it', !(await menuOpen(p)));
  await p.click('#btnMore'); await sleep(100);
  await p.click('#btnMore'); await sleep(100);
  ok('MORE again closes it', !(await menuOpen(p)));

  await p.click('#btnMore'); await sleep(100);
  await p.click('#btnJson'); await sleep(250);
  ok('COPY JSON copies and closes the menu', /Desk JSON copied/.test(await hint(p)) && !(await menuOpen(p)), await hint(p));

  await p.click('#btnMore'); await sleep(100);
  const [chooser] = await Promise.all([p.waitForFileChooser({ timeout: 3000 }).catch(() => null), p.click('#btnOpenFile')]);
  ok('OPEN FILE asks for a file and closes the menu', !!chooser && !(await menuOpen(p)));
  if (chooser) await chooser.cancel();

  let asked = '';
  p.once('dialog', d => { asked = d.message(); d.accept(); });
  await p.click('#btnMore'); await sleep(100);
  await p.click('#btnClear'); await sleep(300);
  ok('CLEAR THE DESK asks first, then clears', /Clear the desk\?/.test(asked) && (await nodes(p)) === 0, asked);
  await p.keyboard.down('Control'); await p.keyboard.press('z'); await p.keyboard.up('Control'); await sleep(200);
  ok('Ctrl-Z brings it all back', (await nodes(p)) === 2);
  p.once('dialog', d => d.dismiss());
  await p.click('#btnMore'); await sleep(100);
  await p.click('#btnClear'); await sleep(300);
  ok('saying no to CLEAR keeps the desk', (await nodes(p)) === 2);

  await p.click('#btnShare'); await sleep(250);
  ok('SHARE copies the desk link', /^Desk link copied/.test(await hint(p)) && /COPIED|SHARE/.test(await p.evaluate(() => document.getElementById('btnShare').textContent)), await hint(p));

  await p.click('#btnMore'); await sleep(100);
  await p.keyboard.press('p'); await sleep(900);
  ok('P with the menu open starts the show and closes the menu', !(await menuOpen(p)) && await p.evaluate(() => document.body.classList.contains('presenting')));
  await p.keyboard.press('Escape'); await sleep(500);
  ok('ending the show leaves the menu closed', !(await menuOpen(p)) && await p.evaluate(() => !document.body.classList.contains('presenting')));

  /* The search box's suggestions drop over the toolbar; leaving the box must
     take them away at once, or they eat a click meant for PRESENT. */
  await p.click('#dq'); await p.keyboard.type('what'); await sleep(250);
  const sug = await p.evaluate(() => {
    const open = !document.getElementById('dsuggest').hidden;
    document.getElementById('dq').blur();
    return { open, after: !document.getElementById('dsuggest').hidden };
  });
  ok('search suggestions go the moment the box loses focus', sug.open && !sug.after, JSON.stringify(sug));

  /* ---------- the empty desk starts in one click ---------- */
  const e = await fresh();
  const start = await e.evaluate(() => {
    const s = document.getElementById('emptyStart');
    return { shown: !s.hidden && s.offsetParent !== null, desks: [].map.call(document.querySelectorAll('#emptyDesks button'), b => b.getAttribute('data-desk')),
      more: (document.querySelector('#emptyDesks p') || {}).textContent || '', total: document.querySelectorAll('#trayDesks .tray-desk').length };
  });
  ok('an empty desk offers prepared desks to start from', start.shown && start.desks.length === Math.min(3, start.total) && start.desks.every(Boolean), JSON.stringify(start));
  ok('and says how many more are in the trays', start.total <= 3 || new RegExp('^' + (start.total - 3) + ' more').test(start.more), start.more);
  await e.screenshot({ path: OUT + '/t03-empty.png' });
  const fit = await e.evaluate(() => { const r = document.getElementById('emptyStart').getBoundingClientRect(), s = document.getElementById('surface').getBoundingClientRect(); return r.top >= s.top && r.bottom <= s.bottom; });
  ok('the start fits inside the desk', fit);
  await e.click('#btnStartNote'); await sleep(300);
  ok('+ START WITH A NOTE puts a note down and the empty-desk card goes', (await nodes(e)) === 1 && await e.evaluate(() => document.getElementById('emptyDesk').hidden));
  await e.evaluate(() => document.activeElement.blur());
  await e.keyboard.down('Control'); await e.keyboard.press('z'); await e.keyboard.up('Control'); await sleep(250);
  ok('Ctrl-Z takes the note back off', (await nodes(e)) === 0 && await e.evaluate(() => !document.getElementById('emptyDesk').hidden));
  await e.click('#emptyDesks button'); await sleep(1200);
  ok('one click on a prepared desk opens it', (await e.evaluate(() => location.hash)) === '#desk=' + start.desks[0] && (await nodes(e)) > 10, await e.evaluate(() => location.hash));

  /* ---------- phones ---------- */
  const ph = await fresh(390, 844, '#desk=essenes-sacrifice-meat');
  await ph.click('#btnPhoneDesk'); await sleep(400);
  ok('on a phone desk, MORE, SHARE and SAVE FILE step aside for FIT and PRESENT', await ph.evaluate(() => ['btnMore', 'btnShare', 'btnSaveFile'].every(id => document.getElementById(id).offsetParent === null) && document.getElementById('btnPresent').offsetParent !== null));

  ok('no console errors', errs.length === 0, errs.join(' | '));
  console.log('\nPASS (' + pass.length + ')' + (fail.length ? '  FAIL (' + fail.length + ')' : ''));
  console.log(fail.length ? 'FAILURES: ' + fail.length : 'all green');
  await browser.close();
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
