/* Words on string: a string can say what it means ("answers", "quotes"),
   and the words travel with the desk: saved, shared, presented, on phones. */
const puppeteer = require('puppeteer-core');
const { CHROME, URL, OUT, tool, workbench, layCase, browseCase } = require('./env');
const pass = [], fail = [];
const ok = (name, cond, extra) => { const l = name + (extra != null ? ' :: ' + extra : ''); (cond ? pass : fail).push(l); console.log((cond ? 'live ok  ' : 'live XX  ') + l); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const DESK = {
  v: 1, vp: [0, 0, 1],
  it: [['n', 'They will say the Essenes still sent gifts to the Temple.', 100, 120, 240],
       ['n', 'Josephus says they sent them, but sacrificed apart.', 620, 320, 240],
       ['n', 'A third note, tied with plain string.', 100, 560, 240]],
  ln: [['n:1', 'n:2', 'answers'], ['n:2', 'n:3']]
};

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    defaultViewport: { width: 1500, height: 950 }, args: ['--no-sandbox', '--disable-gpu'] });
  const errs = [];
  const fresh = async (w, h, hash) => {
    const p = await (await browser.createBrowserContext()).newPage();
    if (w) await p.setViewport({ width: w, height: h });
    p.on('pageerror', e => errs.push('pageerror: ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(URL + (hash || ''), { waitUntil: 'load' });
    await p.waitForSelector('.tray-case');
    await sleep(900);
    return p;
  };
  const stored = p => p.evaluate(() => JSON.parse(localStorage.getItem('way.desk.v1') || '{}'));
  const words = p => p.evaluate(() => [].map.call(document.querySelectorAll('#linkWords .string-words text'), t => t.textContent));
  const hint = p => p.evaluate(() => document.getElementById('dhint').textContent);
  const key = async (p, k, mods) => {
    for (const m of mods || []) await p.keyboard.down(m);
    await p.keyboard.press(k);
    for (const m of (mods || []).slice().reverse()) await p.keyboard.up(m);
    await sleep(180);
  };
  const midOf = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, l: r.left, r: r.right }; }, sel);

  /* ---------- an own desk, saved in the browser ---------- */
  /* Seeded before the page runs: the desk saves itself on the way out, so
     writing storage into an open page would be overwritten by the reload. */
  const p = await (await browser.createBrowserContext()).newPage();
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.evaluateOnNewDocument(d => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.setItem('way.desk.v1', JSON.stringify(d)); sessionStorage.setItem('seeded', '1');
  }, DESK);
  await p.goto(URL, { waitUntil: 'load' }); await p.waitForSelector('.tray-case'); await sleep(900);
  await tool(p, '#btnFit'); await sleep(500);
  ok('a desk opens with its words on the string', JSON.stringify(await words(p)) === '["answers"]', JSON.stringify(await words(p)));
  ok('a string saved without words still opens, plainly', await p.evaluate(() => document.querySelectorAll('#links .string-line').length) === 2);
  const lab = await midOf(p, '#linkWords .string-words');
  ok('the words sit on top: nothing covers them', await p.evaluate(q => { const t = document.elementFromPoint(q.x, q.y); return !!(t && t.closest && t.closest('.string-words')); }, lab));
  const line = await p.evaluate(() => { const l = document.querySelector('#links .string-line'); const r = l.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  ok('they sit at the middle of their string', Math.abs(lab.x - line.x) < 3 && Math.abs(lab.y - line.y) < 3, JSON.stringify([lab, line]));
  await p.screenshot({ path: OUT + '/w01-words.png' });

  /* Click the words: the string is selected, with Aa and x either side. */
  await p.mouse.click(lab.x, lab.y); await sleep(200);
  ok('clicking the words selects their string', await p.evaluate(() => document.querySelectorAll('#links .string-line.is-picked').length === 1 && document.querySelectorAll('#linkWords .string-words.is-picked').length === 1));
  const aa = await midOf(p, '#linkWords .string-words-btn'), cx = await midOf(p, '#linkWords .string-cut');
  const lab2 = await midOf(p, '#linkWords .string-words');
  ok('Aa and the x sit either side of the words, not on them', aa && cx && aa.r <= lab2.l && cx.l >= lab2.r, JSON.stringify([aa, lab2, cx]));
  ok('the hint says how to write words', /Aa or a double-click writes words/.test(await hint(p)), await hint(p));
  await p.screenshot({ path: OUT + '/w02-picked.png' });

  /* Aa opens the editor with the old words selected. */
  await p.mouse.click(aa.x, aa.y); await sleep(200);
  const ed = await p.evaluate(() => { const i = document.activeElement; return { cls: i.className, val: i.value, list: i.getAttribute('list'), opts: document.querySelectorAll('#' + i.getAttribute('list') + ' option').length, selected: i.selectionEnd - i.selectionStart }; });
  ok('Aa opens a box with the words in it, ready to type over', ed.cls === 'string-words-edit' && ed.val === 'answers' && ed.selected === 7, JSON.stringify(ed));
  ok('the box offers common words to pick from', ed.opts >= 5, ed.opts);
  ok('while writing, the old words are not drawn under the box', (await words(p)).length === 0);
  await p.keyboard.type('quotes'); await key(p, 'Enter');
  ok('Enter keeps the new words', JSON.stringify(await words(p)) === '["quotes"]' && !(await p.$('.string-words-edit')));
  ok('and they are saved with the desk', JSON.stringify((await stored(p)).ln) === JSON.stringify([['n:1', 'n:2', 'quotes'], ['n:2', 'n:3']]), JSON.stringify((await stored(p)).ln));
  ok('the hint names them and says Ctrl-Z takes them back', /quotes/.test(await hint(p)) && /Ctrl-Z/.test(await hint(p)));
  ok('typing in the box did not set off desk keys', await p.evaluate(() => !document.body.classList.contains('presenting')) && (await p.evaluate(() => document.querySelectorAll('.nodes .node').length)) === 3);

  await key(p, 'z', ['Control']);
  ok('Ctrl-Z puts the old words back', JSON.stringify(await words(p)) === '["answers"]');
  await key(p, 'y', ['Control']);
  ok('Ctrl-Y brings the new ones again', JSON.stringify(await words(p)) === '["quotes"]');

  /* Double-click the plain string to write on it. */
  const plain = await p.evaluate(() => { const l = document.querySelectorAll('#links .string-hit')[1]; const r = l.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, k: l.getAttribute('data-link') }; });
  ok('the plain string has a free middle to click', await p.evaluate(q => document.elementFromPoint(q.x, q.y) === document.querySelectorAll('#links .string-hit')[1], plain));
  await p.mouse.click(plain.x, plain.y, { clickCount: 2 }); await sleep(250);
  ok('double-clicking a string opens the box', await p.evaluate(() => document.activeElement.className === 'string-words-edit' && document.activeElement.value === ''));
  const box = await midOf(p, '.string-words-edit');
  ok('the box opens where the string is', Math.abs(box.x - plain.x) < 4 && Math.abs(box.y - plain.y) < 4, JSON.stringify([box, plain]));
  await p.keyboard.type('   comes    from  '); await key(p, 'Escape');
  ok('Esc leaves the string as it was', (await words(p)).length === 1 && (await stored(p)).ln[1].length === 2);
  ok('Esc in the box does not also drop the selection', await p.evaluate(() => document.querySelectorAll('#links .string-line.is-picked').length === 1));
  await p.mouse.click(plain.x, plain.y, { clickCount: 2 }); await sleep(250);
  await p.keyboard.type('   comes    from  '); await key(p, 'Enter');
  ok('extra spaces are tidied', JSON.stringify((await stored(p)).ln[1]) === JSON.stringify(['n:2', 'n:3', 'comes from']), JSON.stringify((await stored(p)).ln[1]));
  await p.mouse.click(plain.x, plain.y, { clickCount: 2 }); await sleep(250);
  await p.keyboard.type('x'.repeat(60)); await key(p, 'Enter');
  ok('words stop at 40 letters', (await stored(p)).ln[1][2].length === 40, (await stored(p)).ln[1][2].length);
  const pl = await midOf(p, '#linkWords .string-words[data-link="' + plain.k + '"]');
  await p.mouse.click(pl.x, pl.y, { clickCount: 2 }); await sleep(250);
  await p.keyboard.down('Control'); await p.keyboard.press('a'); await p.keyboard.up('Control');
  await p.keyboard.press('Backspace'); await key(p, 'Enter');
  ok('emptying the box takes the words off', (await stored(p)).ln[1].length === 2 && (await words(p)).length === 1);
  ok('and Ctrl-A in the box selected text, not every card', await p.evaluate(() => !document.querySelector('.nodes .node.is-selected')));
  await p.mouse.click(plain.x, plain.y, { clickCount: 2 }); await sleep(250);
  await p.keyboard.type('supports');
  await p.mouse.click(60, 400); await sleep(250);
  ok('clicking away keeps what was written', JSON.stringify((await stored(p)).ln[1]) === JSON.stringify(['n:2', 'n:3', 'supports']));

  /* Zoomed out, the box is still a readable size. */
  for (let i = 0; i < 3; i++) await p.click('#btnZoomOut').catch(() => {});
  await sleep(300);
  const pk = await midOf(p, '#linkWords .string-words[data-link="' + plain.k + '"]');
  await p.mouse.click(pk.x, pk.y, { clickCount: 2 }); await sleep(250);
  const zb = await midOf(p, '.string-words-edit');
  ok('zoomed out, the box stays a readable size', zb && zb.w >= 200 && zb.w <= 240, zb && zb.w);
  await key(p, 'Escape');

  await p.reload({ waitUntil: 'load' }); await p.waitForSelector('.tray-case'); await sleep(900);
  ok('a reload keeps the words', JSON.stringify((await words(p)).sort()) === '["quotes","supports"]', JSON.stringify(await words(p)));

  /* Cutting a string takes its words with it. */
  await tool(p, '#btnFit'); await sleep(400);
  const q = await midOf(p, '#linkWords .string-words');
  await p.mouse.click(q.x, q.y); await sleep(150);
  await key(p, 'Delete');
  ok('Delete on a string with words takes both off', (await words(p)).length === 1 && (await stored(p)).ln.length === 1);
  await key(p, 'z', ['Control']);
  ok('Ctrl-Z brings back the string and its words', (await words(p)).length === 2);

  /* ---------- a shared link carries the words ---------- */
  const link = URL + '#b=' + encodeURIComponent(JSON.stringify(await stored(p)));
  const s = await fresh(null, null, link.slice(URL.length));
  ok('a desk link carries its words', JSON.stringify((await words(s)).sort()) === '["quotes","supports"]', JSON.stringify(await words(s)));
  ok('and opening it does not touch my own desk', await s.evaluate(() => localStorage.getItem('way.desk.v1')) === null);

  /* ---------- presenting ---------- */
  await s.click('#btnPresent'); await sleep(1200);
  ok('words show while presenting', (await words(s)).length === 2 && await s.evaluate(() => [].every.call(document.querySelectorAll('#linkWords .string-words'), g => getComputedStyle(g).display !== 'none')));
  const sp = await midOf(s, '#linkWords .string-words');
  await s.mouse.click(sp.x, sp.y, { clickCount: 2 }); await sleep(250);
  ok('while presenting, words cannot be selected or changed', await s.evaluate(() => !document.querySelector('.string-words-edit') && !document.querySelector('#linkWords .is-picked')));
  ok('and a double-click does not highlight them as text', await s.evaluate(() => String(getSelection()) === ''), await s.evaluate(() => String(getSelection())));
  await s.screenshot({ path: OUT + '/w03-present.png' });
  await key(s, 'Escape'); await sleep(400);

  /* ---------- a phone shows the words in its list ---------- */
  const m = await fresh(390, 844, link.slice(URL.length));
  const ties = await m.evaluate(() => [].map.call(document.querySelectorAll('#phoneBody .phone-ties .tie-words'), e => e.textContent));
  ok('on a phone, TIED TO shows the words', ties.filter(t => t === 'quotes').length === 2 && ties.filter(t => t === 'supports').length === 2, JSON.stringify(ties));
  await m.screenshot({ path: OUT + '/w04-phone.png', fullPage: true });
  ok('no sideways scroll on the phone', await m.evaluate(() => document.documentElement.scrollWidth - innerWidth <= 1));

  /* ---------- older links, odd data ---------- */
  const odd = { v: 1, it: DESK.it, ln: [['n:1', 'n:2', 42], ['n:2', 'n:3', '  ']] };
  const o = await fresh(null, null, '#b=' + encodeURIComponent(JSON.stringify(odd)));
  ok('words that are not words are ignored, the strings kept', (await words(o)).length === 0 && await o.evaluate(() => document.querySelectorAll('#links .string-line').length) === 2);

  ok('no console errors', errs.length === 0, errs.join(' | '));
  console.log('\nPASS (' + pass.length + ')' + (fail.length ? '  FAIL (' + fail.length + ')' : ''));
  console.log(fail.length ? 'FAILURES: ' + fail.length : 'all green');
  await browser.close();
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
