/* The Desk's door in the Reading Room: an "open on the desk" tab beside the
   case file's folder tab. It follows the hash, so it always points at the case
   being read, and the desk lays that case out when it opens.

   Self-contained so app.js stays untouched. It is one script tag in
   index.html; delete the tag and the door is gone. */

(function () {
  'use strict';

  var tab = document.getElementById('folderTab');
  if (!tab || !tab.parentNode) return;

  var css = document.createElement('style');
  css.textContent =
    '.desk-tabrow { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; }' +
    '.desk-tabrow .folder-tab { align-self: flex-end; }' +
    '.desk-door { font-family: var(--type); font-size: 12px; letter-spacing: 1px; padding: 6px 14px; margin-bottom: 4px;' +
    ' background: var(--drawer-dark); color: var(--text-light); border: 1px solid var(--board-border);' +
    ' text-decoration: none; white-space: nowrap; }' +
    '.desk-door:hover, .desk-door:focus { background: var(--pad); color: var(--ink); }' +
    '.desk-door[hidden] { display: none; }' +
    /* The desk sends phones back here, so the door would only lead to that. */
    '@media (max-width: 820px) { .desk-door { display: none; } }';
  document.head.appendChild(css);

  var row = document.createElement('div');
  row.className = 'desk-tabrow';
  tab.parentNode.insertBefore(row, tab);
  row.appendChild(tab);

  var door = document.createElement('a');
  door.className = 'desk-door';
  door.textContent = 'OPEN ON THE DESK →';
  door.title = 'Lay this case file out on the desk: pull it apart, bring in more, tie your own string.';
  door.hidden = true;
  row.appendChild(door);

  function sync() {
    var m = /^#\/([a-z0-9-]+)(?:\/(\d+))?/.exec(location.hash);
    if (!m || m[1] === 'o') { door.hidden = true; return; }
    door.href = 'canvas.html#pull=' + m[1] + (m[2] ? '&open=' + m[2] : '');
    door.hidden = false;
  }

  window.addEventListener('hashchange', sync);
  sync();
})();
