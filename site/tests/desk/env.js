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

module.exports = { CHROME: findChrome(), BASE, URL: BASE + 'canvas.html', OUT };
