/* Shared settings for the Desk's browser tests. Nothing here needs editing on
   a normal machine: Chrome is found where it is usually installed, and both
   it and the address of the site under test can be overridden.

     CHROME_PATH   the Chrome or Chromium executable
     DESK_URL      where the built site is served (default http://localhost:8778/)
     DESK_SHOTS    where screenshots go (default: a folder in the OS temp dir) */

const fs = require('fs');
const os = require('os');
const path = require('path');

const CANDIDATES = {
  win32: [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe')
  ],
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium'
  ],
  linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser']
};

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const hit = (CANDIDATES[process.platform] || []).find(p => p && fs.existsSync(p));
  if (!hit) throw new Error('Chrome not found. Set CHROME_PATH to your Chrome or Chromium executable.');
  return hit;
}

const BASE = (process.env.DESK_URL || 'http://localhost:8778/').replace(/\/?$/, '/');
const OUT = process.env.DESK_SHOTS || path.join(os.tmpdir(), 'desk-test-shots');
fs.mkdirSync(OUT, { recursive: true });

/* Clicks a desk tool wherever it lives: on the rail, or under ⋯ MORE (opened
   first when it is closed). */
async function tool(p, sel) {
  const inMenu = await p.evaluate(s => { const e = document.querySelector(s); return !!(e && e.closest('#moreMenu')) && document.getElementById('moreMenu').hidden; }, sel);
  if (inMenu) { await p.click('#btnMore'); await new Promise(r => setTimeout(r, 120)); }
  await p.click(sel);
}

/* A prepared board opens as a walk-through; this steps through to the
   workbench (OPEN THE WORKBENCH), as a reader would, when that is where it is. */
async function workbench(p) {
  if (await p.evaluate(() => document.body.classList.contains('reading'))) {
    await p.click('#presWork');
    await new Promise(r => setTimeout(r, 500));
  }
}

/* Lays a whole case out, the way a reader now would: on an empty desk the case
   files are offered on the desk itself (the trays stay hidden until something is
   on it); otherwise open the case in the trays and LAY OUT THE WHOLE CASE. */
async function layCase(p, re) {
  const src = re.source;
  const empty = await p.evaluate(() => document.body.classList.contains('is-empty'));
  if (empty) {
    await p.evaluate(s => [].slice.call(document.querySelectorAll('#emptyCases .tray-case')).filter(x => new RegExp(s).test(x.textContent))[0].click(), src);
  } else {
    await p.evaluate(s => [].slice.call(document.querySelectorAll('#trayCases .tray-case')).filter(x => new RegExp(s).test(x.textContent))[0].click(), src);
    await p.waitForSelector('.tray-lay', { visible: true, timeout: 3000 });
    await p.click('.tray-lay');
  }
  await new Promise(r => setTimeout(r, 1500));
}

/* Opens a case for browsing in the trays (not laying it out). On an empty desk
   that needs something on it first, as for a reader: a note. */
async function browseCase(p, re) {
  if (await p.evaluate(() => document.body.classList.contains('is-empty'))) {
    await p.click('#btnStartNote'); await new Promise(r => setTimeout(r, 200));
    await p.evaluate(() => document.activeElement.blur());
  }
  await p.evaluate(s => [].slice.call(document.querySelectorAll('#trayCases .tray-case')).filter(x => new RegExp(s).test(x.textContent))[0].click(), re.source);
  await new Promise(r => setTimeout(r, 300));
}

module.exports = { CHROME: findChrome(), BASE, URL: BASE + 'canvas.html', OUT, tool, workbench, layCase, browseCase };
