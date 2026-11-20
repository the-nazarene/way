/* Three things a first-time user hit on the Desk:
   - a card dropped from the trays says where it landed (it pulses);
   - Ctrl-Z undoes the desk even right after typing in the tray's search;
   - PRESENT on a desk with no sections walks it card by card, and the next
     arrow pulses until it is used. */
const puppeteer = require('puppeteer-core');
const { CHROME, URL } = require('./env');
const fail = [];
const ok = (name, cond, extra) => {
  const l = name + (extra != null ? ' :: ' + extra : '');
  if (!cond) fail.push(l);
  console.log((cond ? '  ok  ' : '  XX  ') + l);
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    defaultViewport: { width: 1400, height: 900 }, args: ['--no-sandbox', '--disable-gpu'] });
  const p = await (await browser.createBrowserContext()).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await p.goto(URL, { waitUntil: 'load' });
  await p.waitForSelector('.tray-case');
  await sleep(700);
  const ids = () => p.$$eval('.nodes .node', n => n.map(x => x.getAttribute('data-id')));
  const pos = id => p.evaluate(id => { const n = document.querySelector('.nodes .node[data-id="' + id + '"]'); return n ? n.style.left + ',' + n.style.top : null; }, id);
  const undo = async () => { await p.keyboard.down('Control'); await p.keyboard.press('z'); await p.keyboard.up('Control'); await sleep(250); };

  // Something on the desk, then the trays open and a search typed.
  await p.evaluate(() => document.getElementById('btnStartNote').click()); await sleep(200);
  await p.evaluate(() => document.activeElement.blur());
  await p.evaluate(() => document.getElementById('btnAdd').click()); await sleep(400);
  await p.click('#tq'); await p.keyboard.type('Thomas 28'); await sleep(700);
  const from = await p.evaluate(() => {
    const li = [...document.querySelectorAll('#tray li')].filter(l => l.offsetParent && /Gospel of Thomas 28/.test(l.textContent) && !l.querySelector('li'))[0];
    if (!li) return null;
    li.scrollIntoView({ block: 'center' });
    const r = li.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 18) };
  });
  ok('the tray search finds Gospel of Thomas 28', !!from);
  const to = await p.evaluate(() => { const r = document.getElementById('surface').getBoundingClientRect(); return { x: r.left + r.width * 0.6, y: r.top + r.height * 0.55 }; });
  const before = await ids();
  await p.mouse.move(from.x, from.y); await p.mouse.down();
  await p.mouse.move(from.x + 30, from.y + 4, { steps: 4 }); await p.mouse.move(to.x, to.y, { steps: 14 });
  await p.mouse.up(); await sleep(150);
  const after = await ids();
  const added = after.filter(x => !before.includes(x))[0];
  ok('dropping it puts it on the desk', !!added, added);
  ok('the card that landed pulses', await p.evaluate(id => document.querySelector('.nodes .node[data-id="' + id + '"]').classList.contains('is-landed'), added));
  ok('the keyboard is handed back to the desk', await p.evaluate(() => document.activeElement.id !== 'tq'));

  await undo();
  ok('Ctrl-Z right after the drop takes it off', !(await ids()).includes(added));
  await p.keyboard.down('Control'); await p.keyboard.press('y'); await p.keyboard.up('Control'); await sleep(250);
  ok('Ctrl-Y puts it back', (await ids()).includes(added));

  // Type in the search again, then move a card on the desk: Ctrl-Z moves it back.
  await p.click('#tq'); await p.keyboard.type(' x'); await sleep(300);
  const start = await pos(added);
  const c = await p.evaluate(id => { const r = document.querySelector('.nodes .node[data-id="' + id + '"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 14 }; }, added);
  await p.mouse.move(c.x, c.y); await p.mouse.down(); await p.mouse.move(c.x + 120, c.y + 60, { steps: 10 }); await p.mouse.up(); await sleep(200);
  const moved = await pos(added);
  ok('the card moved', moved !== start, start + ' → ' + moved);
  await undo();
  ok('Ctrl-Z after typing in the search moves it back', (await pos(added)) === start, await pos(added));

  // PRESENT with no sections walks the desk card by card.
  await p.evaluate(() => document.getElementById('btnPresent').click()); await sleep(900);
  const pres = () => p.evaluate(() => ({ eyebrow: document.getElementById('presEyebrow').textContent,
    next: !document.getElementById('presNext').disabled, hint: document.getElementById('presNext').classList.contains('is-hint') }));
  let s = await pres();
  ok('with no sections, the next arrow works', s.next, s.eyebrow);
  ok('and pulses to say so', s.hint);
  await p.keyboard.press('ArrowRight'); await sleep(900);
  s = await pres();
  ok('→ goes to the first card', /^CARD 1 OF \d+/.test(s.eyebrow), s.eyebrow);
  ok('the pulse stops once used', !s.hint);
  await p.evaluate(() => document.getElementById('presNext').click()); await sleep(900);
  ok('the next button goes on', /^CARD 2 OF/.test((await pres()).eyebrow), (await pres()).eyebrow);
  await p.keyboard.press('ArrowLeft'); await sleep(900);
  ok('← goes back', /^CARD 1 OF/.test((await pres()).eyebrow));
  await p.keyboard.press('Escape'); await sleep(400);

  ok('no page errors', errs.length === 0, errs.join(' | '));
  await browser.close();
  console.log(fail.length ? fail.length + ' failed' : 'all passed');
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR ' + e.stack); process.exit(2); });
