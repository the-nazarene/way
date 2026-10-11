/* A small static server for site/dist, so the tests need nothing but Node.
   Run on its own to look at the built site: node serve.js  (port 8778) */

const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', '..', 'dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };

function serve(port) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.normalize(path.join(DIST, p));
    if (!file.startsWith(DIST)) { res.writeHead(403); res.end(); return; }
    fs.readFile(file, (err, body) => {
      if (err) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(body);
    });
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => resolve(server));
  });
}

module.exports = { serve, DIST };

if (require.main === module) {
  const port = +(process.env.PORT || 8778);
  serve(port).then(() => console.log(`serving ${DIST} at http://localhost:${port}/canvas.html`));
}
