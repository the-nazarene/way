/* The toolbar as Matt simplified it: five buttons on the rail (+ ADD TO THE
   DESK, + NOTE, PRESENT, SHARE, MORE), everything else under MORE, an empty
   desk that asks one question, and a phone desk that keeps only what a phone
   can use. */
const puppeteer = require('puppeteer-core');
const { CHROME, URL, OUT } = require('./env');
const pass = [], fail = [];
const ok = (name, cond, extra) => { const l = name + (extra != null ? ' :: ' + extra : ''); (cond ? pass : fail).push(l); console.log((cond ? 'live ok  ' : 'live XX  ') + l); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const MINE = { v: 1, vp: [0, 0, 1], it: [['n', 'A note on my own desk.', 100, 120, 240], ['n', 'And another.', 500, 120, 240]], ln: [['n:1', 'n:2']] };
const RAIL = ['+ ADD TO THE DESK', '+ NOTE', '▶ PRESENT', 'SHARE', '⋯ MORE'];
const MENU = ['btnFrame', 'btnTidy', 'btnFit', 'btnSnap', 'btnString', 'btnSaveFile', 'btnOpenFile', 'btnJson', 'btnClear'];

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    defaultViewport: { width: 1500, height: 950 }, args: ['--no-sandbox', '--disable-gpu'] });
  const errs = [];
  const fresh = async (w, h, hash, seed, touch) => {
    const p = await (await browser.createBrowserContext()).newPage();
    if (w) await p.setViewport({ width: w, height: h, isMobile: !!touch, hasTouch: !!touch });
    p.on('pageerror', e => errs.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    /* Seeded before the page runs: the desk saves itself on the way out. */
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
  const visible = p => p.evaluate(() => [].filter.call(document.querySelectorAll('.desk-tools > .tool-group > .tool, .desk-tools .more > .tool'), b => b.offsetParent !== null).map(b => b.textContent.trim()));
  const nodes = p => p.evaluate(() => document.querySelectorAll('.nodes .node').length);
  const ctrl = async (p, k) => { await p.keyboard.down('Control'); await p.keyboard.press(k); await p.keyboard.up('Control'); await sleep(250); };

  /* ---------- the rail: five buttons, one row, at every desk width ---------- */
  for (const [w, h] of [[1500, 950], [1280, 800], [1024, 700]]) {
    const p = await fresh(w, h, '', MINE);
    const rail = await p.evaluate(() => {
      const bs = [].filter.call(document.querySelectorAll('.desk-tools > .tool-group > .tool, .desk-tools .more > .tool'), b => b.offsetParent !== null);
      const r = document.querySelector('.desk-tools').getBoundingClientRect();
      return { rows: new Set(bs.map(b => Math.round(b.getBoundingClientRect().top))).size, h: Math.round(r.height), over: document.documentElement.scrollWidth - innerWidth };
    });
    ok(w + 'px: the rail is one row', rail.rows === 1 && rail.h <= 40 && rail.over <= 0, JSON.stringify(rail));
    if (w === 1500) {
      ok('the rail holds the five everyday buttons, and only those', JSON.stringify(await visible(p)) === JSON.stringify(RAIL), JSON.stringify(await visible(p)));
      await p.screenshot({ path: OUT + '/t01-toolbar.png', clip: { x: 0, y: 0, width: 1500, height: 480 } });
    }
    await p.close();
  }

  /* ---------- + ADD TO THE DESK opens and closes the trays ---------- */
  const p = await fresh(null, null, '', MINE);
  const trayShown = () => p.evaluate(() => document.getElementById('tray').offsetWidth > 100);
  ok('on my own desk the trays start closed', !(await trayShown()) && await p.evaluate(() => document.getElementById('btnAdd').getAttribute('aria-expanded')) === 'false');
  await p.click('#btnAdd'); await sleep(350);
  ok('+ ADD TO THE DESK opens them', await trayShown() && await p.evaluate(() => document.getElementById('btnAdd').getAttribute('aria-expanded')) === 'true');
  await p.click('#btnAdd'); await sleep(350);
  ok('and closes them again', !(await trayShown()));

  /* ---------- the MORE menu ---------- */
  ok('the menu starts closed', !(await menuOpen(p)) && await p.evaluate(() => document.getElementById('btnMore').getAttribute('aria-expanded')) === 'false');
  await p.click('#btnMore'); await sleep(150);
  const m = await p.evaluate(() => {
    const r = document.getElementById('moreMenu').getBoundingClientRect();
    return { ids: [].map.call(document.querySelectorAll('#moreMenu button'), b => b.id), focus: document.activeElement.id,
      exp: document.getElementById('btnMore').getAttribute('aria-expanded'), inView: r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight };
  });
  ok('MORE holds sections, tidy, fit, snap, string, the files and clear', JSON.stringify(m.ids) === JSON.stringify(MENU), JSON.stringify(m.ids));
  ok('it opens on screen, with focus on its first item', m.inView && m.focus === MENU[0] && m.exp === 'true', JSON.stringify(m));
  await p.screenshot({ path: OUT + '/t02-more.png', clip: { x: 700, y: 0, width: 800, height: 640 } });
  /* A screenshot takes focus from the page; open the menu afresh for the keys. */
  await p.click('#btnMore'); await sleep(100); await p.click('#btnMore'); await sleep(150);
  await p.keyboard.press('ArrowDown'); await sleep(50);
  ok('arrow keys move through it', await p.evaluate(() => document.activeElement.id) === MENU[1]);
  await p.keyboard.press('ArrowUp'); await p.keyboard.press('ArrowUp'); await sleep(50);
  ok('and wrap round', await p.evaluate(() => document.activeElement.id) === MENU[MENU.length - 1]);
  await p.keyboard.press('Escape'); await sleep(100);
  ok('Esc closes it and puts focus back on MORE', !(await menuOpen(p)) && await p.evaluate(() => document.activeElement.id) === 'btnMore');
  ok('and Esc there did not drop anything else', (await nodes(p)) === 2);
  await p.click('#btnMore'); await sleep(100);
  await p.mouse.click(700, 700); await sleep(100);
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
  await p.evaluate(() => document.getElementById('surface').focus());
  await ctrl(p, 'z');
  ok('Ctrl-Z brings it all back', (await nodes(p)) === 2);
  p.once('dialog', d => d.dismiss());
  await p.click('#btnMore'); await sleep(100);
  await p.click('#btnClear'); await sleep(300);
  ok('saying no to CLEAR keeps the desk', (await nodes(p)) === 2);

  await p.click('#btnShare'); await sleep(250);
  ok('SHARE copies the desk link', /^Desk link copied/.test(await hint(p)), await hint(p));

  await p.click('#btnMore'); await sleep(100);
  await p.keyboard.press('p'); await sleep(900);
  ok('P with the menu open starts the show and closes the menu', !(await menuOpen(p)) && await p.evaluate(() => document.body.classList.contains('presenting')));
  await p.keyboard.press('Escape'); await sleep(500);
  ok('ending the show leaves the menu closed', !(await menuOpen(p)) && await p.evaluate(() => !document.body.classList.contains('presenting')));

  /* The search box's suggestions drop over the rail; leaving the box must take
     them away at once, or they eat a click meant for a button under them. */
  await p.click('#dq'); await p.keyboard.type('what'); await sleep(250);
  const sug = await p.evaluate(() => {
    const open = !document.getElementById('dsuggest').hidden;
    document.getElementById('dq').blur();
    return { open, after: !document.getElementById('dsuggest').hidden };
  });
  ok('search suggestions go the moment the box loses focus', sug.open && !sug.after, JSON.stringify(sug));

  /* ---------- the empty desk asks one question ---------- */
  const e = await fresh();
  const start = await e.evaluate(() => ({
    q: (document.querySelector('.empty-q') || {}).textContent,
    chrome: ['.desk-form', '.desk-tools', '.tray'].map(s => getComputedStyle(document.querySelector(s)).display),
    boards: [].map.call(document.querySelectorAll('#emptyDesks button'), b => b.getAttribute('data-desk')),
    cases: document.querySelectorAll('#emptyCases .tray-case').length,
    note: document.getElementById('btnStartNote').offsetParent !== null
  }));
  const listed = await e.evaluate(() => fetch('desk.json').then(r => r.json()).then(d => d.desks.filter(x => x.listed !== false).map(x => x.slug)));
  ok('an empty desk asks "What goes on the desk?", with no search bar, tools or trays', start.q === 'What goes on the desk?' && start.chrome.every(d => d === 'none'), JSON.stringify(start));
  ok('it offers every listed board, and no unlisted one', JSON.stringify(start.boards) === JSON.stringify(listed), JSON.stringify(start.boards));
  ok('it offers every case file, and a blank start', start.cases === 14 && start.note, start.cases);
  await e.screenshot({ path: OUT + '/t03-empty.png' });
  await e.click('#btnStartNote'); await sleep(300);
  ok('+ START WITH A NOTE puts a note down, and the tools appear', (await nodes(e)) === 1 && await e.evaluate(() => document.getElementById('emptyDesk').hidden && document.querySelector('.desk-tools').offsetParent !== null));
  await e.evaluate(() => document.activeElement.blur());
  await ctrl(e, 'z');
  ok('Ctrl-Z takes the note back off, and the question returns', (await nodes(e)) === 0 && await e.evaluate(() => !document.getElementById('emptyDesk').hidden));
  const caseSlug = await e.evaluate(() => document.querySelector('#emptyCases .tray-case').getAttribute('data-empty-case'));
  await e.click('#emptyCases .tray-case'); await sleep(900);
  const laid = await e.evaluate(s => fetch('data.json').then(r => r.json()).then(d => d.cards.filter(c => c.slug === s)[0].sources.length), caseSlug);
  ok('one click on a case file lays the whole case out', (await nodes(e)) === laid + 1, (await nodes(e)) + ' for ' + laid);
  await e.close();
  const e2 = await fresh();
  await e2.click('#emptyDesks button'); await sleep(1500);
  ok('one click on a board opens it as a walk-through', (await e2.evaluate(() => location.hash)) === '#desk=' + listed[0] && await e2.evaluate(() => document.body.classList.contains('reading')), await e2.evaluate(() => location.hash));

  /* ---------- a phone's desk keeps what a phone can use ---------- */
  const ph = await fresh(390, 844, '#desk=essenes-sacrifice-meat', null, true);
  await ph.click('#btnPhoneDesk'); await sleep(500);
  const pr = await visible(ph);
  ok('on a phone desk the rail is PRESENT, SHARE and MORE (no + ADD, the trays never show there)', JSON.stringify(pr) === JSON.stringify(['▶ PRESENT', 'SHARE', '⋯ MORE']), JSON.stringify(pr));
  await ph.click('#btnMore'); await sleep(150);
  const pm = await ph.evaluate(() => [].filter.call(document.querySelectorAll('#moreMenu button'), b => b.offsetParent !== null).map(b => b.id));
  ok('and MORE there holds FIT and the files, not the editing tools', pm.indexOf('btnFit') >= 0 && ['btnFrame', 'btnTidy', 'btnSnap', 'btnString'].every(id => pm.indexOf(id) < 0), JSON.stringify(pm));
  const mr = await ph.evaluate(() => { const r = document.getElementById('moreMenu').getBoundingClientRect(); return { l: r.left, r: r.right, vw: innerWidth }; });
  ok('the menu fits on the phone', mr.l >= 0 && mr.r <= mr.vw, JSON.stringify(mr));
  await ph.screenshot({ path: OUT + '/t04-phone-more.png' });
  await ph.click('#btnFit'); await sleep(400);
  ok('FIT works from there', !(await menuOpen(ph)));
  ok('no sideways scroll on the phone desk', await ph.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 1));

  ok('no console errors', errs.length === 0, errs.join(' | '));
  console.log('\nPASS (' + pass.length + ')' + (fail.length ? '  FAIL (' + fail.length + ')' : ''));
  console.log(fail.length ? 'FAILURES: ' + fail.length : 'all green');
  await browser.close();
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
