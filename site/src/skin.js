/* The look switch. Two skins over the same page: "street" (street.css, the
   default) and "room" (the Reading Room, styles.css alone). The button lives
   on the Desk only; the front door is always Street (?skin=room opens the
   Reading Room front door for one visit). The Desk's choice is remembered in
   this browser under its own key, so it never changes the front door.
   ?skin=room or ?skin=street in a Desk URL picks one for a shared link. The
   attribute itself is set by the one-line script in each page's <head>,
   before the page paints, so there is no flash; this file only wires the
   button, and sets the tab icon to match on either page. */

(function () {
  'use strict';

  var KEY = 'way-desk-skin';
  var root = document.documentElement;
  var btn = document.getElementById('skinSwitch');

  function label() {
    var street = root.getAttribute('data-skin') === 'street';
    if (btn) btn.textContent = street ? 'Look: Street' : 'Look: Reading Room';
    if (btn) btn.title = 'Switch to ' + (street ? 'the Reading Room' : 'Street') + '. Same cards, same sources, a different look.';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', street ? '#ffffff' : '#141416');
    var icon = document.querySelector('link[rel="icon"]');
    if (icon) icon.setAttribute('href', street ? 'favicon.svg' : 'favicon-room.svg');
    var touch = document.querySelector('link[rel="apple-touch-icon"]');
    if (touch) touch.setAttribute('href', street ? 'apple-touch-icon.png' : 'apple-touch-icon-room.png');
  }

  if (btn) btn.addEventListener('click', function () {
    var next = root.getAttribute('data-skin') === 'street' ? 'room' : 'street';
    root.setAttribute('data-skin', next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
    label();
    window.dispatchEvent(new Event('resize'));  // the case file redraws its string
  });

  label();
})();
