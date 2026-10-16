/* The ? panel: the controls, one press away, out of the way otherwise. */
const puppeteer = require('puppeteer-core');
const { CHROME, URL, OUT, tool, workbench, layCase, browseCase } = require('./env');
const pass = [], fail = [];
const ok = (name, cond, extra) => { const l = name + (extra != null ? ' :: ' + extra : ''); (cond ? pass : fail).push(l); console.log((cond ? 'live ok  ' : 'live XX  ') + l); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    defaultViewport: { width: 1500, height: 950 }, args: ['--no-sandbox', '--disable-gpu'] });
  const errs = [];
  const page = async (w, h) => {
    const p = await (await browser.createBrowserContext()).newPage();
    if (w) await p.setViewport({ width: w, height: h });
    p.on('pageerror', e => errs.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(URL + '#desk=essenes-sacrifice-meat', { waitUntil: 'load' });
    await p.waitForSelector('.tray-case');
    await sleep(1100);
    await workbench(p);   // a prepared board opens as a walk-through
    return p;
  };
  const shown = p => p.evaluate(() => !document.getElementById('helpPanel').hidden);

  const p = await page();
  ok('the ? button sits with the zoom controls', await p.evaluate(() => {
    const b = document.getElementById('btnHelp'); return b.offsetParent !== null && b.closest('.hud-right') !== null && b.textContent === '?';
  }));
  ok('the panel starts closed', !(await shown(p)));
  await p.click('#btnHelp'); await sleep(200);
  const panel = await p.evaluate(() => {
    const e = document.getElementById('helpPanel'), r = e.getBoundingClientRect();
    return { text: e.textContent, inView: r.top >= 0 && r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
      focus: document.activeElement.id, expanded: document.getElementById('btnHelp').getAttribute('aria-expanded') };
  });
  ok('clicking ? opens the controls, on screen', (await shown(p)) && panel.inView && panel.expanded === 'true');
  ok('it covers panning, zooming and the basics', ['Pan', 'Zoom', 'Space', 'middle mouse button', 'scroll', 'FIT', 'Tie', 'Untie', 'Rename'.toLowerCase()].every(w => panel.text.toLowerCase().indexOf(w.toLowerCase()) >= 0), panel.text.slice(0, 80));
  ok('focus moves into the panel', panel.focus === 'helpClose');
  await p.screenshot({ path: OUT + '/h01-help.png' });
  await p.keyboard.press('Escape'); await sleep(150);
  ok('Esc closes it and puts focus back on ?', !(await shown(p)) && await p.evaluate(() => document.activeElement.id) === 'btnHelp');
  await p.evaluate(() => document.getElementById('surface').focus());
  await p.keyboard.type('?'); await sleep(150);
  ok('pressing ? opens it', await shown(p));
  await p.keyboard.type('?'); await sleep(150);
  ok('pressing ? again closes it', !(await shown(p)));
  await p.click('#btnHelp'); await sleep(150);
  await p.click('#helpClose'); await sleep(150);
  ok('the × closes it', !(await shown(p)));
  await p.click('#btnHelp'); await sleep(150);
  const desk = await p.evaluate(() => { const s = document.getElementById('surface').getBoundingClientRect(); return { x: s.left + 60, y: s.top + 60 }; });
  await p.mouse.click(desk.x, desk.y); await sleep(150);
  ok('a click anywhere else closes it', !(await shown(p)));
  await p.click('#btnHelp'); await sleep(150);
  await p.mouse.click(desk.x, desk.y + 20); await sleep(150);
  await p.click('#btnHelp'); await sleep(150);
  const inside = await p.evaluate(() => { const r = document.querySelector('#helpPanel dl').getBoundingClientRect(); return { x: r.left + 10, y: r.top + 5 }; });
  await p.mouse.click(inside.x, inside.y); await sleep(150);
  ok('a click inside the panel leaves it open', await shown(p));
  await p.keyboard.press('Escape'); await sleep(100);

  await p.click('#dq'); await p.keyboard.type('what?'); await sleep(200);
  ok('typing ? in the search box does not open it', !(await shown(p)));
  await p.evaluate(() => { document.getElementById('dq').value = ''; document.getElementById('dq').blur(); });

  await p.click('#btnPresent'); await sleep(900);
  await p.keyboard.type('?'); await sleep(200);
  ok('while presenting, ? does not cover the show', !(await shown(p)) && await p.evaluate(() => document.body.classList.contains('presenting')));
  await p.keyboard.press('Escape'); await sleep(400);

  /* Small screens */
  const t = await page(1024, 700);
  await t.click('#btnHelp'); await sleep(200);
  ok('at 1024×700 the panel fits on screen', await t.evaluate(() => { const r = document.getElementById('helpPanel').getBoundingClientRect(); return r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; }));
  const m = await page(390, 844);
  await m.click('#btnPhoneDesk'); await sleep(400);
  await m.click('#btnHelp'); await sleep(200);
  const mob = await m.evaluate(() => { const r = document.getElementById('helpPanel').getBoundingClientRect(); return { fits: r.left >= 0 && r.right <= innerWidth, scroll: document.documentElement.scrollWidth - innerWidth }; });
  ok('on a phone it fits the width with no sideways scroll', mob.fits && mob.scroll <= 1, JSON.stringify(mob));
  await m.screenshot({ path: OUT + '/h02-help-phone.png' });

  ok('no console errors', errs.length === 0, errs.join(' | '));
  console.log('\nPASS (' + pass.length + ')' + (fail.length ? '  FAIL (' + fail.length + ')' : ''));
  console.log(fail.length ? 'FAILURES: ' + fail.length : 'all green');
  await browser.close();
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
