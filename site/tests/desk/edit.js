/* Editing a laid-out desk: moving sections, renaming them, tying, selecting
   and deleting string, undo and redo, group moves. Run on the Essene desk. */
const puppeteer = require('puppeteer-core');
const { CHROME, URL } = require('./env');
const pass = [], fail = [];
const ok = (name, cond, extra) => { const l = name + (extra != null ? ' :: ' + extra : ''); (cond ? pass : fail).push(l); console.log((cond ? 'live ok  ' : 'live XX  ') + l); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SC = 'sacrifice-culture-vegetarian-jesus', E = 'essene-nazarene-origins';

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    defaultViewport: { width: 1500, height: 950 }, args: ['--no-sandbox', '--disable-gpu'] });
  const errs = [];
  const p = await (await browser.createBrowserContext()).newPage();
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL + '#desk=essenes-sacrifice-meat', { waitUntil: 'load' });
  await p.waitForSelector('.tray-case');
  await sleep(1300);

  const goTo = async name => {
    await p.evaluate(n => [].slice.call(document.querySelectorAll('#trayHere .here-row')).filter(x => x.textContent.indexOf(n) >= 0)[0].click(), name);
    await sleep(400);
  };
  const frameOf = name => p.evaluate(n => {
    const f = [].slice.call(document.querySelectorAll('.frame')).filter(x => x.querySelector('input').value.indexOf(n) >= 0)[0];
    const bar = f.querySelector('.frame-title').getBoundingClientRect(), inp = f.querySelector('input').getBoundingClientRect();
    return { id: f.getAttribute('data-id'), x: parseFloat(f.style.left), y: parseFloat(f.style.top),
      grab: { x: inp.left + Math.min(40, inp.width / 2), y: bar.top + bar.height / 2 } };
  }, name);
  const pos = id => p.evaluate(i => { const n = document.querySelector('.nodes [data-id="' + i + '"]'); return { x: parseFloat(n.style.left), y: parseFloat(n.style.top) }; }, id);
  const count = () => p.evaluate(() => document.querySelectorAll('#links .string-line').length);
  const hint = () => p.evaluate(() => document.getElementById('dhint').textContent);
  const key = async (k, mods) => { for (const m of mods || []) await p.keyboard.down(m); await p.keyboard.press(k); for (const m of (mods || []).reverse()) await p.keyboard.up(m); await sleep(250); };

  /* ---------- moving a whole section ---------- */
  await goTo('WHERE HE CAME FROM');
  const f0 = await frameOf('WHERE HE CAME FROM');
  const inside0 = await pos(`s:${E}:16`), outside0 = await pos(`s:${SC}:2`);
  await p.mouse.move(f0.grab.x, f0.grab.y);
  await p.mouse.down();
  await p.mouse.move(f0.grab.x + 140, f0.grab.y + 60, { steps: 10 });
  await p.mouse.up();
  await sleep(300);
  const f1 = await frameOf('WHERE HE CAME FROM');
  const inside1 = await pos(`s:${E}:16`), outside1 = await pos(`s:${SC}:2`);
  const df = [f1.x - f0.x, f1.y - f0.y], dc = [inside1.x - inside0.x, inside1.y - inside0.y];
  ok('dragging a section by its name moves the section', Math.abs(df[0]) > 50 && Math.abs(df[1]) > 20, JSON.stringify(df));
  ok('everything inside comes with it, exactly', dc[0] === df[0] && dc[1] === df[1], JSON.stringify({ df, dc }));
  ok('cards outside the section stay put', outside1.x === outside0.x && outside1.y === outside0.y);
  ok('grabbing the name does not start editing it', await p.evaluate(() => document.activeElement.tagName !== 'INPUT'));
  await key('z', ['Control']);
  const back = await frameOf('WHERE HE CAME FROM');
  ok('one Ctrl-Z puts the whole section back', back.x === f0.x && back.y === f0.y);
  await key('y', ['Control']);
  const again = await frameOf('WHERE HE CAME FROM');
  ok('Ctrl-Y redoes the move', again.x === f1.x && again.y === f1.y, JSON.stringify([again.x, f1.x]));
  await key('z', ['Control']);

  /* ---------- renaming ---------- */
  await goTo('DO NOT SAY');
  const r0 = await frameOf('DO NOT SAY');
  await p.mouse.click(r0.grab.x, r0.grab.y, { clickCount: 2 });
  await sleep(250);
  ok('double-clicking the name opens it for renaming', await p.evaluate(() => { const a = document.activeElement; return a.tagName === 'INPUT' && !a.readOnly && a.classList.contains('is-editing'); }));
  await p.keyboard.down('Control'); await p.keyboard.press('a'); await p.keyboard.up('Control');
  await p.keyboard.type('NEVER SAY THESE');
  await key('Enter');
  const renamed = await p.evaluate(() => [].slice.call(document.querySelectorAll('.frame input')).map(i => i.value));
  ok('Enter keeps the new name', renamed.indexOf('NEVER SAY THESE') >= 0 && await p.evaluate(() => document.activeElement.tagName !== 'INPUT'));
  ok('the section list follows the rename', await p.evaluate(() => /NEVER SAY THESE/.test(document.getElementById('trayHere').textContent)));
  const r1 = await frameOf('NEVER SAY THESE');
  ok('renaming does not move the section', r1.x === r0.x && r1.y === r0.y);
  await p.mouse.click(r1.grab.x, r1.grab.y, { clickCount: 2 });
  await sleep(200);
  await p.keyboard.type('XYZ');
  await key('Escape');
  ok('Esc puts the old name back', await p.evaluate(() => [].slice.call(document.querySelectorAll('.frame input')).some(i => i.value === 'NEVER SAY THESE')));
  ok('and Esc does not also clear anything else', await p.evaluate(() => document.querySelectorAll('.frame').length) === 7);

  /* ---------- tying string ---------- */
  await goTo('HE OPPOSED THE SACRIFICES');
  const before = await count();
  const pin = await p.evaluate(i => { const r = document.querySelector('.nodes [data-id="' + i + '"] .pin').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, `s:${SC}:8`);
  const target = await p.evaluate(i => { const r = document.querySelector('.nodes [data-id="' + i + '"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, `s:${SC}:1`);
  ok('a card shows its connector on hover', await (async () => {
    await p.mouse.move(target.x, target.y); await sleep(200);
    return p.evaluate(i => getComputedStyle(document.querySelector('.nodes [data-id="' + i + '"] .pin')).boxShadow !== 'none', `s:${SC}:1`);
  })());
  await p.mouse.move(pin.x, pin.y);
  await p.mouse.down();
  await p.mouse.move((pin.x + target.x) / 2, (pin.y + target.y) / 2, { steps: 5 });
  await p.mouse.move(target.x, target.y, { steps: 6 });
  const mid = await p.evaluate(i => {
    const t = document.querySelector('.nodes .is-target');
    const line = document.querySelector('#links .string-line.hot');
    const pinR = document.querySelector('.nodes [data-id="' + i + '"] .pin').getBoundingClientRect();
    const end = line && line.getBoundingClientRect();
    return { target: t && t.getAttribute('data-id'), snapped: !!end && Math.abs(Math.min(end.top, end.bottom) - (pinR.top + pinR.height / 2)) < 12 };
  }, `s:${SC}:1`);
  ok('while tying, the card under the pointer lights up', mid.target === `s:${SC}:1`, mid.target);
  ok('and the string snaps to its pin', mid.snapped);
  await p.mouse.up();
  await sleep(250);
  ok('letting go ties the string', (await count()) === before + 1 && /String tied/.test(await hint()));
  ok('the highlight goes when the tie is made', await p.evaluate(() => !document.querySelector('.nodes .is-target')));
  await p.mouse.move(pin.x, pin.y); await p.mouse.down(); await p.mouse.move(target.x, target.y, { steps: 6 }); await p.mouse.up(); await sleep(200);
  ok('tying the same two again says so and adds nothing', (await count()) === before + 1 && /already tied/.test(await hint()), await hint());
  const empty = await p.evaluate(() => { const s = document.getElementById('surface').getBoundingClientRect(); return { x: s.right - 30, y: s.bottom - 30 }; });
  await p.mouse.move(pin.x, pin.y); await p.mouse.down(); await p.mouse.move(empty.x, empty.y, { steps: 6 }); await p.mouse.up(); await sleep(200);
  ok('letting go on empty desk ties nothing', (await count()) === before + 1 && /Nothing was tied/.test(await hint()), await hint());

  /* ---------- selecting and deleting string ---------- */
  /* String runs under the cards so it never hides their text; pick one whose
     middle is visible, the way a person would click it. */
  const k = await p.evaluate(() => {
    const s = document.getElementById('surface').getBoundingClientRect();
    const hits = [].slice.call(document.querySelectorAll('#links .string-hit'));
    for (const h of hits) {
      const r = h.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (x < s.left + 20 || x > s.right - 20 || y < s.top + 20 || y > s.bottom - 20) continue;
      if (document.elementFromPoint(x, y) === h) return h.getAttribute('data-link');
    }
    return null;
  });
  ok('a string with a visible middle is on screen', !!k, k);
  const hitAt = () => p.evaluate(kk => { const l = document.querySelector('#links .string-hit[data-link="' + kk + '"]'); const r = l.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, k);
  const h = await hitAt();
  await p.mouse.move(h.x, h.y); await sleep(150);
  ok('hovering a string thickens it', await p.evaluate(kk => parseFloat(getComputedStyle(document.querySelector('#links .string-hit[data-link="' + kk + '"]').nextSibling).strokeWidth) >= 4, k));
  const n0 = await count();
  await p.mouse.click(h.x, h.y); await sleep(200);
  const picked = await p.evaluate(() => ({ picked: document.querySelectorAll('#links .string-line.is-picked').length, x: document.querySelectorAll('#links .string-cut').length }));
  ok('clicking a string selects it, and cuts nothing', picked.picked === 1 && picked.x === 1 && (await count()) === n0, JSON.stringify(picked));
  await key('Escape');
  ok('Esc lets go of it', await p.evaluate(() => !document.querySelector('#links .string-line.is-picked')));
  await p.mouse.click(h.x, h.y); await sleep(150);
  await key('Delete');
  ok('Delete takes the selected string off', (await count()) === n0 - 1);
  ok('and only the string: no card went with it', await p.evaluate(() => document.querySelectorAll('.nodes .node').length) === 58);
  await key('z', ['Control']);
  ok('Ctrl-Z puts it back', (await count()) === n0);
  await key('z', ['Control', 'Shift']);
  ok('Ctrl-Shift-Z takes it off again', (await count()) === n0 - 1);
  await key('z', ['Control']);
  const h2 = await hitAt();
  await p.mouse.click(h2.x, h2.y); await sleep(150);
  const x = await p.evaluate(() => { const r = document.querySelector('#links .string-cut').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; });
  ok('the x on a selected string is a usable size', x.w >= 18 && x.w <= 30, x.w);
  await p.mouse.click(x.x, x.y); await sleep(200);
  ok('clicking the x takes the string off', (await count()) === n0 - 1);
  await key('z', ['Control']);
  const h3 = await hitAt();
  await p.mouse.click(h3.x, h3.y); await sleep(150);
  /* A spot with nothing under it: no card, no string, no section name. */
  const bare = await p.evaluate(() => {
    const s = document.getElementById('surface').getBoundingClientRect();
    for (let y = s.top + 40; y < s.bottom - 40; y += 23) for (let x = s.left + 40; x < s.right - 40; x += 23) {
      const t = document.elementFromPoint(x, y);
      if (t && (t.id === 'surface' || t.id === 'world' || t.classList.contains('frame-body'))) return { x, y, on: t.id || t.className };
    }
    return null;
  });
  await p.mouse.click(bare.x, bare.y); await sleep(150);
  ok('clicking the empty desk lets go of a string', await p.evaluate(() => !document.querySelector('#links .string-line.is-picked')));

  /* ---------- reading a card does not cost the redo ---------- */
  await p.mouse.click(h3.x, h3.y); await sleep(100);
  await key('Delete');
  await key('z', ['Control']);
  const card = await p.evaluate(i => { const r = document.querySelector('.nodes [data-id="' + i + '"] .pincard').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.bottom - 8 }; }, `s:${SC}:4`);
  await p.mouse.click(card.x, card.y); await sleep(300);
  await key('Escape');
  await key('y', ['Control']);
  ok('clicking a card to read it keeps the redo history', (await count()) === n0 - 1);
  await key('z', ['Control']);

  /* ---------- group moves ---------- */
  const ids = [`s:${SC}:2`, `s:${SC}:0`, `s:${SC}:1`];
  const g0 = await Promise.all(ids.map(pos));
  const box = await p.evaluate(list => {
    const rs = list.map(i => document.querySelector('.nodes [data-id="' + i + '"]').getBoundingClientRect());
    return { x1: Math.min(...rs.map(r => r.left)) - 12, y1: Math.min(...rs.map(r => r.top)) - 12, x2: Math.max(...rs.map(r => r.right)) + 4, y2: Math.max(...rs.map(r => r.bottom)) + 4 };
  }, ids);
  await p.mouse.move(box.x1, box.y1); await p.mouse.down(); await p.mouse.move(box.x2, box.y2, { steps: 8 }); await p.mouse.up(); await sleep(200);
  ok('box-selecting picks up the cards', await p.evaluate(list => list.every(i => document.querySelector('.nodes [data-id="' + i + '"]').classList.contains('is-selected')), ids));
  const grab = await p.evaluate(i => { const r = document.querySelector('.nodes [data-id="' + i + '"] .pincard').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.bottom - 10 }; }, ids[0]);
  await p.mouse.move(grab.x, grab.y); await p.mouse.down(); await p.mouse.move(grab.x + 70, grab.y + 260, { steps: 10 }); await p.mouse.up(); await sleep(200);
  const g1 = await Promise.all(ids.map(pos));
  const deltas = g1.map((q, i) => [q.x - g0[i].x, q.y - g0[i].y]);
  ok('dragging one of them moves the whole group together', deltas.every(d => d[0] === deltas[0][0] && d[1] === deltas[0][1]) && Math.abs(deltas[0][1]) > 100, JSON.stringify(deltas));
  await key('z', ['Control']);
  const g2 = await Promise.all(ids.map(pos));
  ok('one Ctrl-Z puts the group back', g2.every((q, i) => q.x === g0[i].x && q.y === g0[i].y));

  /* ---------- a new section names itself on the spot ---------- */
  await p.click('#btnFrame'); await sleep(300);
  ok('+ FRAME opens the new section\'s name for typing', await p.evaluate(() => { const a = document.activeElement; return a.tagName === 'INPUT' && a.classList.contains('is-editing'); }));
  await p.keyboard.type('MY SECTION'); await key('Enter');
  ok('and Enter names it', await p.evaluate(() => [].slice.call(document.querySelectorAll('.frame input')).some(i => i.value === 'MY SECTION')));

  /* ---------- presenting still locks it ---------- */
  await p.click('#btnPresent'); await sleep(900);
  await p.keyboard.press('2'); await sleep(900);
  const hp = await hitAt();
  await p.mouse.click(hp.x, hp.y); await sleep(200);
  ok('while presenting, a string cannot be selected or cut', await p.evaluate(() => !document.querySelector('#links .string-line.is-picked') && !document.querySelector('#links .string-cut')));
  await key('Escape');

  ok('no console errors', errs.length === 0, errs.join(' | '));
  console.log('\nPASS (' + pass.length + ')' + (fail.length ? '  FAIL (' + fail.length + ')' : ''));
  console.log(fail.length ? 'FAILURES: ' + fail.length : 'all green');
  await browser.close();
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
