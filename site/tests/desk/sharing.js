/* Opening a shared desk link must never overwrite the reader's own desk. */
const puppeteer = require('puppeteer-core');
const { CHROME, BASE, URL, OUT } = require('./env');
const pass = [], fail = [];
const ok = (name, cond, extra) => (cond ? pass : fail).push(name + (extra != null ? ' :: ' + extra : ''));
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
    await sleep(900);
  };
  const stored = p => p.evaluate(() => localStorage.getItem('way.desk.v1'));
  const ids = p => p.evaluate(() => [].slice.call(document.querySelectorAll('.nodes .node')).map(n => n.getAttribute('data-id')).sort().join(','));
  const bar = p => p.evaluate(() => !document.getElementById('sharedBar').hidden);

  /* My own desk: one case. */
  const me = await page();
  await open(me);
  await me.evaluate(() => [].slice.call(document.querySelectorAll('.tray-case')).filter(x => /Did Jesus oppose the sacrifice/.test(x.textContent))[0].click());
  await sleep(200);
  await me.click('.tray-lay');
  await sleep(1500);
  const mine = await stored(me);
  const mineIds = await ids(me);
  ok('my own desk is saved', !!mine && JSON.parse(mine).it.length === 24, mine && JSON.parse(mine).it.length);
  ok('no shared bar on my own desk', !(await bar(me)));

  /* Someone else's desk: a different case, as a link. */
  const other = JSON.stringify({ v: 1, vp: [40, 40, 0.6], it: [['q', 'resurrection', 300, 0, 270], ['n', 'from Matt', 0, 0, 230]], ln: [] });
  const link = '#b=' + encodeURIComponent(other);
  const them = await page();
  await open(them, link);
  ok('a shared link shows the shared desk', await ids(them) === 'n:1,q:resurrection', await ids(them));
  ok('the shared bar says so', await bar(them));
  ok('opening it left my desk untouched', await stored(them) === mine);
  await them.screenshot({ path: OUT + '/s01-shared-bar.png' });

  /* Working on the shared desk does not leak into mine. */
  await them.click('#btnNote');
  await sleep(300);
  await them.keyboard.type('my reply');
  await sleep(200);
  ok('editing the shared desk works', (await ids(them)).split(',').length === 3);
  ok('and still does not touch my desk', await stored(them) === mine);
  await them.reload({ waitUntil: 'load' });
  await them.waitForSelector('.tray-case'); await sleep(900);
  ok('a reload reopens the shared desk, not mine', await ids(them) === 'n:1,q:resurrection' && await bar(them), await ids(them));
  ok('my desk survived the reload too', await stored(them) === mine);

  /* Back to my desk. */
  await them.click('#btnBackMine');
  await sleep(600);
  ok('back to my desk shows my desk', await ids(them) === mineIds);
  ok('the bar goes away', !(await bar(them)));
  ok('the shared link leaves the address bar', await them.evaluate(() => location.hash === ''));
  await them.reload({ waitUntil: 'load' });
  await them.waitForSelector('.tray-case'); await sleep(900);
  ok('and stays my desk after a reload', await ids(them) === mineIds && !(await bar(them)));

  /* Keep, but say no at the confirm: nothing changes. */
  await open(them, link);
  them.once('dialog', d => d.dismiss());
  await them.click('#btnKeepShared');
  await sleep(300);
  /* A reload re-saves my desk with its current zoom, so compare the desk, not the viewport. */
  const sameDesk = (a, b) => { const x = JSON.parse(a), y = JSON.parse(b); return JSON.stringify([x.it, x.ln]) === JSON.stringify([y.it, y.ln]); };
  ok('declining keep changes nothing', sameDesk(await stored(them), mine) && await bar(them));

  /* Keep, and say yes. */
  let asked = '';
  them.once('dialog', d => { asked = d.message(); d.accept(); });
  await them.click('#btnKeepShared');
  await sleep(400);
  ok('keep asks before replacing a non-empty desk', /replaces your current desk \(24 things/.test(asked), asked);
  const kept = await stored(them);
  ok('kept desk is now saved as mine', kept && JSON.parse(kept).it.length === 2 && JSON.parse(kept).it.some(x => x[0] === 'q' && x[1] === 'resurrection'));
  ok('bar gone and link cleared after keeping', !(await bar(them)) && await them.evaluate(() => location.hash === ''));
  await them.click('#btnNote'); await sleep(300);
  ok('a kept desk saves as you work', JSON.parse(await stored(them)).it.length === 3);

  /* A link pasted into an open tab (hash change only) also opens as shared. */
  const before = await stored(them);
  await them.evaluate(l => { location.hash = l.slice(1); }, link);
  await sleep(800);
  ok('pasting a link into an open desk opens it as shared', await ids(them) === 'n:1,q:resurrection' && await bar(them));
  ok('without touching the desk that was open', await stored(them) === before);
  await them.goBack();
  await sleep(800);
  ok('the Back button returns to my desk', !(await bar(them)) && JSON.parse(await stored(them)).it.length === 3 && (await ids(them)).split(',').length === 3, await ids(them));

  /* With an empty own desk, keep does not ask. */
  const ctx2 = await browser.createBrowserContext();
  const fresh = await ctx2.newPage();
  fresh.on('pageerror', e => errs.push('pageerror: ' + e.message));
  let prompted = false;
  fresh.on('dialog', d => { prompted = true; d.accept(); });
  await open(fresh, link);
  await fresh.click('#btnKeepShared');
  await sleep(300);
  ok('an empty desk keeps without asking', !prompted && JSON.parse(await stored(fresh)).it.length === 2);

  /* A broken link falls back to my own desk without losing it. */
  await open(me, '#b=%7Bnot-json');
  ok('a broken link shows my own desk', await ids(me) === mineIds || (await ids(me)).length > 0);
  ok('and no shared bar', !(await bar(me)));

  ok('no console errors', errs.length === 0, errs.join(' | '));
  console.log('\nPASS (' + pass.length + ')');
  pass.forEach(p => console.log('  ok  ' + p));
  if (fail.length) { console.log('\nFAIL (' + fail.length + ')'); fail.forEach(f => console.log('  XX  ' + f)); }
  console.log('\n' + (fail.length ? 'FAILURES: ' + fail.length : 'all green'));
  await browser.close();
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.log(pass.join('\n')); console.log(fail.join('\n')); console.error('HARNESS ERROR', e); process.exit(2); });
