/* The look switch. Two skins: "street" (street.css, the default) and "room"
   (the Reading Room, styles.css alone). The front door is always Street
   (?skin=room opens the Reading Room front door for one visit) and has no
   button. On the Desk the page around the square is always Street; the
   button in the square's corner changes only the square, by setting
   data-surface on <html>. That choice is remembered in this browser, and
   ?skin=room or ?skin=street in a Desk URL picks one for a shared link. The
   attributes themselves are set by the one-line script in each page's
   <head>, before the page paints, so there is no flash; this file wires the
   button and sets the front door's tab icon to match its look. */

(function () {
  'use strict';

  var KEY = 'way-desk-skin';
  var root = document.documentElement;
  var btn = document.getElementById('skinSwitch');

  if (!btn) {
    var street = root.getAttribute('data-skin') === 'street';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', street ? '#ffffff' : '#141416');
    var icon = document.querySelector('link[rel="icon"]');
    if (icon) icon.setAttribute('href', street ? 'favicon.svg' : 'favicon-room.svg');
    var touch = document.querySelector('link[rel="apple-touch-icon"]');
    if (touch) touch.setAttribute('href', street ? 'apple-touch-icon.png' : 'apple-touch-icon-room.png');
    return;
  }

  function label() {
    var street = root.getAttribute('data-surface') !== 'room';
    btn.textContent = street ? 'Desk: Street' : 'Desk: Reading Room';
    btn.title = 'Switch the desk to ' + (street ? 'the Reading Room' : 'Street') + '. Same cards, same sources, a different surface.';
  }

  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-surface') === 'room' ? 'street' : 'room';
    root.setAttribute('data-surface', next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
    label();
    window.dispatchEvent(new Event('resize'));  // the board redraws its string
  });

  label();
})();
