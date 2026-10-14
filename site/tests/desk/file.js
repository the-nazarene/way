/* Desk files: save a desk as a file, wipe the browser, get it back. */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { CHROME, URL, tool, workbench, layCase, browseCase } = require('./env');
const pass = [], fail = [];
const ok = (name, cond, extra) => { const l = name + (extra != null ? ' :: ' + extra : ''); (cond ? pass : fail).push(l); console.log((cond ? 'live ok  ' : 'live XX  ') + l); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const DL = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-files-'));
const files = () => fs.readdirSync(DL).filter(f => f.endsWith('.json'));
const waitFile = async (n, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 5000)) { if (files().length >= n) return true; await sleep(100); } return false; };

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
    defaultViewport: { width: 1500, height: 950 }, args: ['--no-sandbox', '--disable-gpu'] });
  const cdp = await browser.target().createCDPSession();
  await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: DL, eventsEnabled: true });
  const errs = [];
  const p = await browser.newPage();
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const open = async hash => {
    await p.goto(URL + (hash || ''), { waitUntil: 'load' });
    await p.waitForSelector('.tray-case');
    await p.waitForFunction(() => document.getElementById('hudCounts').textContent.length > 0);
    await sleep(1000);
    if (/desk=/.test(hash || '')) await workbench(p);   // prepared boards open as a walk-through
  };
  const nodes = () => p.evaluate(() => document.querySelectorAll('.nodes .node').length);
  const hint = () => p.evaluate(() => document.getElementById('dhint').textContent);
  const bar = () => p.evaluate(() => ({ shown: !document.getElementById('sharedBar').hidden, eyebrow: document.getElementById('sharedEyebrow').textContent }));
  const stored = () => p.evaluate(() => { const s = localStorage.getItem('way.desk.v1'); return s ? JSON.parse(s).it.length : 0; });

  /* ---------- saving ---------- */
  await open();
  await p.evaluate(() => localStorage.clear());
  await open();
  /* An empty desk shows no tools; Ctrl-S still answers. */
  await p.keyboard.down('Control'); await p.keyboard.press('s'); await p.keyboard.up('Control'); await sleep(500);
  ok('an empty desk has nothing to save, and says so', files().length === 0 && /nothing to save/.test(await hint()));

  await open('#desk=essenes-sacrifice-meat');
  ok('SAVE FILE and OPEN FILE are one click away under MORE', await p.evaluate(() => {
    const vis = id => document.getElementById(id).offsetParent !== null;
    if (vis('btnSaveFile') || vis('btnOpenFile')) return false;
    document.getElementById('btnMore').click();
    const shown = vis('btnSaveFile') && vis('btnOpenFile');
    document.getElementById('btnMore').click();
    return shown;
  }));
  await tool(p, '#btnSaveFile');
  const got = await waitFile(1);
  const saved = got ? files()[0] : null;
  ok('SAVE FILE downloads the desk', got, saved);
  ok('named after the desk and the date', /^essenes-sacrifice-meat-\d{4}-\d{2}-\d{2}\.json$/.test(saved || ''), saved);
  const body = JSON.parse(fs.readFileSync(path.join(DL, saved), 'utf8'));
  ok('the file says what it is, when, and holds the whole desk', body.format === 'nazarene-way-desk' && body.version === 1 && /^\d{4}-/.test(body.saved) &&
    body.title === 'Jesus, the Essenes, sacrifice and meat' && body.desk.it.length === 65 && body.desk.ln.length === 27, JSON.stringify({ t: body.title, it: body.desk.it.length, ln: body.desk.ln.length }));
  ok('and tells you where it went', /Saved as essenes-sacrifice-meat-/.test(await hint()));
  /* Headless Chrome blocks a second automatic download from one page, so
     check what the page did rather than counting files. */
  await p.evaluate(() => { document.getElementById('dhint').textContent = ''; });
  await p.keyboard.down('Control'); await p.keyboard.press('s'); await p.keyboard.up('Control');
  await sleep(300);
  ok('Ctrl-S saves too', /Saved as essenes-sacrifice-meat-/.test(await hint()), await hint());

  /* ---------- the point: wipe the browser, the desk survives ---------- */
  await p.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await open();
  ok('after clearing the browser, the desk is gone from it', (await nodes()) === 0 && (await stored()) === 0);
  /* The picker is looked up fresh each time: a reload replaces it. */
  const upload = async f => (await p.$('#fileOpen')).uploadFile(f);
  await upload(path.join(DL, saved));
  await sleep(1200);
  const b1 = await bar();
  ok('OPEN FILE brings the whole desk back', (await nodes()) === 58 && await p.evaluate(() => document.querySelectorAll('#links .string-line').length) === 27 &&
    await p.evaluate(() => document.querySelectorAll('.frame').length) === 7);
  ok('it opens as a desk from a file, named', b1.shown && /^A DESK FROM A FILE · JESUS, THE ESSENES/.test(b1.eyebrow), b1.eyebrow);
  ok('and opening it did not write over the browser\'s desk', (await stored()) === 0);
  await p.click('#btnKeepShared'); await sleep(400);
  ok('KEEP THIS AS MY DESK makes it yours again', (await stored()) === 65 && !(await bar()).shown);
  await open();
  ok('and it is there after a reload', (await nodes()) === 58 && !(await bar()).shown);

  /* ---------- opening never overwrites your own desk ---------- */
  const own = await stored();
  await upload(path.join(DL, saved)); await sleep(1000);
  await p.click('#btnBackMine'); await sleep(500);
  ok('BACK TO MY DESK returns to yours, untouched', (await stored()) === own && (await nodes()) === 58);

  /* ---------- other files ---------- */
  const raw = path.join(DL, 'copied-layout.json');
  fs.writeFileSync(raw, JSON.stringify({ v: 1, it: [['q', 'resurrection', 0, 0, 270], ['n', 'hello', 320, 0, 230]], ln: [] }));
  await upload(raw); await sleep(900);
  ok('a bare COPY JSON layout opens too', (await nodes()) === 2 && /A DESK FROM A FILE · COPIED-LAYOUT/.test((await bar()).eyebrow), (await bar()).eyebrow);
  await p.click('#btnShare'); await sleep(200);
  ok('SHARE on a file desk copies the whole layout, not a short name', /^Desk link copied/.test(await hint()), await hint());
  await p.click('#btnBackMine'); await sleep(400);

  const junk = path.join(DL, 'notes.json');
  fs.writeFileSync(junk, '{ "shopping": ["eggs"] }');
  await upload(junk); await sleep(600);
  ok('a JSON file that is not a desk is refused, clearly', /not a desk file/.test(await hint()) && !(await bar()).shown && (await nodes()) === 58, await hint());
  const txt = path.join(DL, 'broken.json');
  fs.writeFileSync(txt, 'this is not json');
  await upload(txt); await sleep(600);
  ok('a broken file is refused, clearly', /not a desk file/.test(await hint()) && (await nodes()) === 58, await hint());

  /* ---------- dropping a file on the desk ---------- */
  const dropText = fs.readFileSync(path.join(DL, saved), 'utf8');
  await p.evaluate(text => {
    const dt = new DataTransfer();
    dt.items.add(new File([text], 'dropped-desk.json', { type: 'application/json' }));
    const s = document.getElementById('surface');
    s.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true }));
    s.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
  }, dropText);
  await sleep(900);
  ok('dropping a desk file onto the desk opens it', (await bar()).shown && (await nodes()) === 58 && /JESUS, THE ESSENES/.test((await bar()).eyebrow), (await bar()).eyebrow);
  await p.click('#btnBackMine'); await sleep(300);

  /* ---------- a saved file from a file keeps its name ---------- */
  await upload(raw); await sleep(800);
  await tool(p, '#btnSaveFile'); await sleep(300);
  ok('saving a desk opened from a file keeps that file\'s name', /Saved as copied-layout-\d{4}-\d{2}-\d{2}\.json/.test(await hint()), await hint());

  ok('no console errors', errs.length === 0, errs.join(' | '));
  console.log('\nPASS (' + pass.length + ')' + (fail.length ? '  FAIL (' + fail.length + ')' : ''));
  console.log(fail.length ? 'FAILURES: ' + fail.length : 'all green');
  await browser.close();
  fs.rmSync(DL, { recursive: true, force: true });
  process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
