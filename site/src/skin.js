/* The look switch. Two skins over the same page: "street" (street.css, the
   default) and "room" (the Reading Room, styles.css alone). The choice is
   remembered in this browser. ?skin=room or ?skin=street in the URL picks one
   for a shared link. The attribute itself is set by the one-line script in
   index.html's <head>, before the page paints, so there is no flash; this
   file only wires the button. */

(function () {
  'use strict';

  var KEY = 'way-skin';
  var root = document.documentElement;
  var btn = document.getElementById('skinSwitch');
  if (!btn) return;

  function label() {
    var street = root.getAttribute('data-skin') === 'street';
    btn.textContent = street ? 'Look: Street' : 'Look: Reading Room';
    btn.title = 'Switch to ' + (street ? 'the Reading Room' : 'Street') + '. Same cards, same sources, a different look.';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', street ? '#ffffff' : '#141416');
  }

  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-skin') === 'street' ? 'room' : 'street';
    root.setAttribute('data-skin', next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
    label();
    window.dispatchEvent(new Event('resize'));  // the case file redraws its string
  });

  label();
})();
