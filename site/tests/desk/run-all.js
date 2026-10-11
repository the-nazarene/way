/* npm test: build the site, serve it, run every Desk suite, summarize.

     node run-all.js              all suites
     node run-all.js present      only the named suites
     DESK_URL=http://...          test a site already being served (no build, no server) */

const { spawnSync, spawn } = require('child_process');
const path = require('path');
const { serve } = require('./serve');

const SUITES = [
  ['regress', 'the original desk: layout, snapping, frames, string, search, share link, reader, phone width'],
  ['features', 'the Reading Room door, the tray, dragging out, the thread'],
  ['sharing', 'shared links never overwrite your own desk'],
  ['search', 'prepared desks, short links, tray search, going to a section'],
  ['present', 'present mode'],
  ['edit', 'editing a laid-out desk: sections, renaming, tying and cutting string, undo and redo'],
  ['file', 'desk files: save, wipe the browser, open it back'],
  ['help', 'the ? panel of controls'],
  ['episodes', 'episode boards: transcript moments, outside sources, checks'],
  ['phone', 'phones: the desk as a list, the reader, and the real desk one tap away'],
  ['words', 'words on string: writing, saving, sharing, presenting, phones']
];

const ROOT = path.join(__dirname, '..', '..', '..');

function build() {
  for (const py of ['python', 'python3', 'py']) {
    const r = spawnSync(py, [path.join('site', 'build.py')], { cwd: ROOT, encoding: 'utf8' });
    if (r.error) continue;
    process.stdout.write(r.stdout);
    if (r.status !== 0) { process.stderr.write(r.stderr); throw new Error('site/build.py failed (that is the citation check doing its job; fix the card, not the test)'); }
    return;
  }
  throw new Error('Python not found; site/build.py needs Python 3.');
}

function run(name) {
  return new Promise(resolve => {
    const t0 = Date.now();
    const child = spawn(process.execPath, [path.join(__dirname, name + '.js')], { env: process.env });
    let out = '';
    child.stdout.on('data', d => { out += d; });
    child.stderr.on('data', d => { out += d; });
    child.on('close', code => {
      const lines = out.split(/\r?\n/);
      const passed = new Set(lines.filter(l => /^(  ok|live ok)  /.test(l)).map(l => l.replace(/^(  ok|live ok)  /, ''))).size;
      const failed = lines.filter(l => /^(  XX|live XX)  /.test(l)).map(l => l.replace(/^(  XX|live XX)  /, ''));
      const crashed = lines.filter(l => /HARNESS ERROR/.test(l));
      resolve({ name, code, passed, failed: [...new Set(failed)], crashed, secs: Math.round((Date.now() - t0) / 1000) });
    });
  });
}

(async () => {
  const only = process.argv.slice(2);
  const chosen = SUITES.filter(([n]) => !only.length || only.includes(n));
  let server = null;
  if (!process.env.DESK_URL) {
    build();
    const port = 8778;
    server = await serve(port).catch(e => { throw new Error(`port ${port} is busy (${e.code}); stop what is using it or set DESK_URL`); });
    process.env.DESK_URL = `http://localhost:${port}/`;
    console.log(`serving site/dist at ${process.env.DESK_URL}\n`);
  }
  const results = [];
  for (const [name, about] of chosen) {
    process.stdout.write(`${name.padEnd(9)} ${about} ... `);
    const r = await run(name);
    results.push(r);
    console.log(r.code === 0 ? `${r.passed} passed (${r.secs}s)` : `FAILED (${r.secs}s)`);
    r.failed.forEach(f => console.log('    XX ' + f));
    r.crashed.forEach(c => console.log('    ' + c));
  }
  if (server) server.close();
  const total = results.reduce((a, r) => a + r.passed, 0);
  const bad = results.filter(r => r.code !== 0);
  console.log(`\n${bad.length ? 'FAILED: ' + bad.map(r => r.name).join(', ') : 'all green'} · ${total} checks passed`);
  process.exit(bad.length ? 1 : 0);
})().catch(e => { console.error(e.message); process.exit(2); });
