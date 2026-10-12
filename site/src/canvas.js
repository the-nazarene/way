/* The Desk — the case board, unbounded. Static client, no server, no AI.

   Loads the same data.json that the Reading Room loads, flattens every source
   on every card into one tray of pinnable evidence, and lets a reader lay it
   out on an infinite surface: drag, snap, group into frames, tie string.

   Two rules this file keeps, deliberately:

     1. Nothing on this desk is generated. The search box RETRIEVES sources
        that build.py already verified; it never writes a new one. A card that
        arrives on the desk carries the stamp it was built with, unchanged.
     2. Source families are DERIVED from each source's tier string by
        familyOf() below, never hand-assigned. A new card files itself.

   The thread. Every verse reference written in a card's prose, every case it
   points to and every go-deeper file is a link, and a link can come onto the
   desk as its own card: dragged out, or clicked, in which case it lands beside
   the card it came from with string tied between them. The path a reader
   takes stays on the board. Verse cards obey rule 1 like everything else:
   desk.json only lists a reference build.py found in the held KJV. */

(function () {
  'use strict';

  var DATA = null;
  var LINKS = { names: {}, verses: {}, docs: {} };   // desk.json; empty if it fails to load
  var fuse = null;
  var items = [];            // every thing on the desk, in paint order
  var links = [];            // {a: id, b: id}
  var sel = {};              // id -> true
  var flat = [];             // every source on every card, flattened for search
  var seq = 1;               // id counter for notes and frames
  var undoStack = [];
  var redoStack = [];
  var heldRedo = null;       // redo history parked while a press might still turn out to be a click
  var selLink = null;        // the selected string, as "a|b"
  var editingTitle = null;   // the frame whose title is being renamed
  var lastBarClick = null;   // {id, t}: two quick clicks on a section's name rename it
  var snapOn = true;
  var stringMode = false;
  var readerOrigin = null;   // the desk card whose reader is open, so its thread ties back to it

  var SRC_W = 250, Q_W = 270, NOTE_W = 230, FRAME_W = 380, FRAME_H = 280;
  var GAP = 22;              // the gap between pins on his case board, reused here
  var COL = 296;             // column pitch for TIDY
  var TOL = 8;               // snap tolerance, in screen pixels
  var MIN_Z = 0.25, MAX_Z = 2.5;
  var STORE = 'way.desk.v1';
  var FRAME_COLORS = ['var(--frame-1)', 'var(--frame-2)', 'var(--frame-3)', 'var(--frame-4)'];

  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  var svgEl = function (tag) { return document.createElementNS('http://www.w3.org/2000/svg', tag); };
  var clamp = function (v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); };

  /* ================= source families =================
     One pure function from a tier string to a family. The order matters:
     "red text · John" is red text, not John, so red text is tested first. */

  var FAMILIES = [
    { key: 'red',    label: 'RED TEXT',          sw: '#a11a1a', rank: 1,  re: /^red text/ },
    { key: 'thomas', label: 'THOMAS',            sw: '#2e5e34', rank: 2,  re: /^thomas/ },
    { key: 'john',   label: 'JOHN',              sw: '#1f4e79', rank: 3,  re: /^john\b/ },
    { key: 'dss',    label: 'DEAD SEA SCROLLS',  sw: '#6b7a8f', rank: 4,  re: /^dead sea scrolls/ },
    { key: 'early',  label: 'EARLY CHURCH',      sw: '#2e5e34', rank: 5,  re: /^(early church|clementine|didache|patristic|jewish-christian tradition)/ },
    { key: 'jerus',  label: 'JERUSALEM CHURCH',  sw: '#4a7a52', rank: 6,  re: /^(jerusalem|the succession|the successors|the family\b|the apostles\b|the forwarding address)/ },
    { key: 'ethio',  label: 'ETHIOPIAN CANON',   sw: '#8f7a6b', rank: 7,  re: /^ethiopian/ },
    { key: 'heb',    label: 'HEBREW BIBLE',      sw: '#7a7f6b', rank: 8,  re: /^(prophets|torah)/ },
    { key: 'paul',   label: 'PAUL',              sw: '#1f4e79', rank: 9,  re: /^(paul|what paul|disputed authorship)/ },
    { key: 'acts',   label: 'ACTS',              sw: '#2f5f8a', rank: 10, re: /^acts/ },
    { key: 'mss',    label: 'THE MANUSCRIPTS',   sw: '#b8700e', rank: 11, re: /^(the seams|kjv prints it|the manuscripts|the dating debate)/ },
    { key: 'schol',  label: 'SCHOLARSHIP',       sw: '#7a6b8f', rank: 12, re: /^scholarship/ },
    { key: 'arg',    label: 'THE ARGUMENT',      sw: '#55555c', rank: 13, re: null }
  ];

  function familyOf(tier) {
    var t = (tier || '').toLowerCase();
    for (var i = 0; i < FAMILIES.length; i++) {
      if (FAMILIES[i].re && FAMILIES[i].re.test(t)) return FAMILIES[i];
    }
    return FAMILIES[FAMILIES.length - 1];
  }

  /* His own tier colouring, reused verbatim so a card looks the same here. */
  function tierClass(tier) {
    tier = (tier || '').toLowerCase();
    if (tier.indexOf('red text') === 0) return 'red';
    if (tier.indexOf('early church') === 0 || tier.indexOf('jerusalem') === 0 || tier.indexOf('thomas') === 0) return 'green';
    if (tier.indexOf('paul') === 0 || tier.indexOf('what paul') === 0 || tier.indexOf('acts') === 0) return 'blue';
    return '';
  }

  /* ================= the viewport ================= */

  var tf = { x: 60, y: 60, scale: 1 };
  var rafPending = false;

  function applyTransform() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      $('world').style.transform = 'translate3d(' + tf.x + 'px,' + tf.y + 'px,0) scale(' + tf.scale + ')';
      $('hudZoom').textContent = Math.round(tf.scale * 100) + '%';
    });
  }

  function toWorld(clientX, clientY) {
    var r = $('surface').getBoundingClientRect();
    return { x: (clientX - r.left - tf.x) / tf.scale, y: (clientY - r.top - tf.y) / tf.scale };
  }

  function zoomAt(clientX, clientY, factor) {
    var r = $('surface').getBoundingClientRect();
    var sx = clientX - r.left, sy = clientY - r.top;
    var next = clamp(tf.scale * factor, MIN_Z, MAX_Z);
    var k = next / tf.scale;
    tf.x = sx - k * (sx - tf.x);
    tf.y = sy - k * (sy - tf.y);
    tf.scale = next;
    applyTransform();
    drawLinks();
  }

  /* ================= the model ================= */

  function itemById(id) {
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
    return null;
  }

  function srcOf(it) {
    if (it.t !== 'src') return null;
    var card = cardBySlug(it.c);
    return card && card.sources[it.i] ? card.sources[it.i] : null;
  }

  function cardBySlug(slug) {
    for (var i = 0; i < DATA.cards.length; i++) if (DATA.cards[i].slug === slug) return DATA.cards[i];
    return null;
  }

  /* Ids can hold anything a speaker said, quotes included, so they are escaped. */
  function idSel(id) {
    var s = window.CSS && CSS.escape ? CSS.escape(id) : String(id).replace(/["\\]/g, '\\$&');
    return '[data-id="' + s + '"]';
  }
  function nodeEl(id) { return $('nodes').querySelector(idSel(id)) || $('frames').querySelector(idSel(id)); }

  function boxOf(it) {
    var e = nodeEl(it.id);
    if (it.t === 'frame') return { x: it.x, y: it.y, w: it.w, h: it.h };
    /* offsetWidth/Height are in world units: a CSS transform on an ancestor
       does not change them, which is exactly what the snapping needs. */
    return { x: it.x, y: it.y, w: e ? e.offsetWidth : (it.w || SRC_W), h: e ? e.offsetHeight : 120 };
  }

  function snapshot() { return JSON.stringify({ it: items, ln: links }); }

  /* Every change records the desk before it. A new change ends the redo
     history, but only once it is real: a press that turns out to be a click
     calls cancelUndo() and the redo history comes back untouched. */
  function pushUndo() {
    undoStack.push(snapshot());
    if (undoStack.length > 60) undoStack.shift();
    heldRedo = redoStack;
    redoStack = [];
  }

  function cancelUndo() {
    undoStack.pop();
    if (heldRedo) redoStack = heldRedo;
    heldRedo = null;
  }

  function restore(json) {
    var s = JSON.parse(json);
    items = s.it; links = s.ln; sel = {}; selLink = null;
    renderAll(); save();
  }

  function undo() {
    if (!undoStack.length) { hint('Nothing to undo.'); return; }
    redoStack.push(snapshot());
    restore(undoStack.pop());
    hint('Undone. Ctrl-Y puts it back.');
  }

  function redo() {
    if (!redoStack.length) { hint('Nothing to redo.'); return; }
    undoStack.push(snapshot());
    restore(redoStack.pop());
    hint('Redone.');
  }

  /* ================= adding things ================= */

  function has(id) { return !!itemById(id); }

  function addSource(slug, idx, x, y) {
    var id = 's:' + slug + ':' + idx;
    if (has(id)) { flash(id); return null; }
    var it = { id: id, t: 'src', c: slug, i: idx, x: x, y: y, w: SRC_W };
    items.push(it);
    return it;
  }

  function addQuestion(slug, x, y) {
    var id = 'q:' + slug;
    if (has(id)) { flash(id); return null; }
    var it = { id: id, t: 'q', c: slug, x: x, y: y, w: Q_W };
    items.push(it);
    return it;
  }

  function addNote(x, y, text) {
    var it = { id: 'n:' + (seq++), t: 'note', x: x, y: y, w: NOTE_W, text: text || '' };
    items.push(it);
    return it;
  }

  function addFrame(x, y, title) {
    var it = { id: 'f:' + (seq++), t: 'frame', x: x, y: y, w: FRAME_W, h: FRAME_H,
               title: title || 'UNTITLED', ci: items.filter(function (i) { return i.t === 'frame'; }).length % FRAME_COLORS.length };
    items.push(it);
    return it;
  }

  /* A verse the cards cite, as its own card. Only a key the build resolved
     against the held KJV exists in LINKS.verses, so nothing else can land. */
  function addVerse(key, x, y) {
    var id = 'v:' + key;
    if (has(id) || !LINKS.verses[key]) return null;
    var it = { id: id, t: 'v', k: key, x: x, y: y, w: SRC_W };
    items.push(it);
    return it;
  }

  /* A go-deeper file: the repo's own research notes, never stamped as a source. */
  function addDoc(path, x, y) {
    var id = 'd:' + path;
    if (has(id) || !LINKS.docs[path]) return null;
    var it = { id: id, t: 'd', k: path, x: x, y: y, w: SRC_W };
    items.push(it);
    return it;
  }

  function flash(id) {
    var e = nodeEl(id);
    if (!e) return;
    e.classList.add('is-selected');
    sel = {}; sel[id] = true;
    bringIntoView(itemById(id));
    renderSelection();
  }

  /* Find a spot near (x,y) that does not overlap anything already down. */
  function freeSpot(x, y, w, h) {
    var tries = 0;
    var cx = x, cy = y;
    while (tries < 220) {
      var clash = false;
      for (var i = 0; i < items.length; i++) {
        if (items[i].t === 'frame') continue;
        var b = boxOf(items[i]);
        if (cx < b.x + b.w + 8 && cx + w + 8 > b.x && cy < b.y + b.h + 8 && cy + h + 8 > b.y) { clash = true; break; }
      }
      if (!clash) return { x: cx, y: cy };
      cy += h + GAP;
      tries++;
      if (tries % 7 === 0) { cx += w + GAP + 12; cy = y; }
    }
    return { x: cx, y: cy };
  }

  function viewCenter() {
    var r = $('surface').getBoundingClientRect();
    return toWorld(r.left + r.width / 2, r.top + r.height / 3);
  }

  /* ================= pulling a whole case ================= */

  /* Where a new block of cards lands: below whatever is already down, so
     pulling a second case never drops it on top of the first. */
  function landingSpot() {
    var b = bounds();
    if (!b) {
      var c = viewCenter();
      return { x: Math.round(c.x - COL * 1.5), y: Math.round(c.y - 120) };
    }
    return { x: Math.round(b.x1), y: Math.round(b.y2 + 80) };
  }

  /* A note's textarea carries an inline height from its last width, so it has
     to be re-grown before anything measures it. */
  function remeasure(it) {
    if (it.t !== 'note') return;
    var e = nodeEl(it.id);
    var ta = e && e.querySelector('textarea');
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }

  /* Flow already-rendered items down one column at their real measured
     heights, at the board's own gap. Returns the next free y. */
  function flowColumn(list, x, y) {
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      it.x = x; it.y = y;
      position(it);
      remeasure(it);
      var e = nodeEl(it.id);
      y += (e ? e.offsetHeight : 140) + GAP;
    }
    return y;
  }

  /* A column's spacing is only as good as the heights it measured, and a card
     can still change height a frame later: a webfont lands, a textarea
     re-wraps. So every flow runs once now and once more after the browser has
     settled. The pass is idempotent, so running it twice costs nothing and
     makes the gaps exact. */
  var lastPlan = null, lastPlanAt = 0;

  function runPlan(plan) {
    for (var i = 0; i < plan.length; i++) flowColumn(plan[i].list, plan[i].x, plan[i].y);
  }

  function flowAndSettle(plan, after) {
    lastPlan = plan; lastPlanAt = Date.now();
    runPlan(plan);
    requestAnimationFrame(function () {
      runPlan(plan);
      drawLinks(); updateCounts(); save();
      if (after) after();
    });
  }

  /* Last line of defence: if a face arrives after the gate gave up, the cards
     that just landed get their spacing redone. Only ever within a few seconds
     of a flow, and never once the reader has started moving things, so this
     cannot tug a card out from under a drag. */
  function watchLateFonts() {
    if (!document.fonts || !document.fonts.addEventListener) return;
    document.fonts.addEventListener('loadingdone', function () {
      if (!lastPlan || Date.now() - lastPlanAt > 8000) return;
      runPlan(lastPlan);
      drawLinks(); updateCounts(); save();
    });
  }

  /* Is the block a case would fill, with its top-left at `at`, free of every
     card that is not already part of this case? Heights are not known before
     render, so each new card is reckoned at a generous 150. */
  function caseRoomAt(card, at) {
    var per = { for: 0, other: 0, against: 0 };
    for (var i = 0; i < card.sources.length; i++) {
      if (has('s:' + card.slug + ':' + i)) continue;
      var side = card.sources[i].side || 'for';
      per[per[side] != null ? side : 'other']++;
    }
    var tall = Math.max(per.for, per.other, per.against);
    if (!tall && has('q:' + card.slug)) return true;
    var x1 = at.x - 10, y1 = at.y - 10, x2 = at.x + COL * 3, y2 = at.y + 200 + tall * 150;
    for (var k = 0; k < items.length; k++) {
      var it = items[k];
      if (it.t === 'frame' || it.c === card.slug) continue;
      var b = boxOf(it);
      if (b.x < x2 && b.x + b.w > x1 && b.y < y2 && b.y + b.h > y1) return false;
    }
    return true;
  }

  /* Lays a case out as the case board does. `at` is the top-left of the block
     (default: below everything already down). If the question card is already
     on the desk, the case lays out under it instead, and any of its sources
     already down stay where the reader put them and are just tied back. */
  function pullCase(slug, at, after) {
    var card = cardBySlug(slug);
    if (!card) return;
    pushUndo();
    var qid = 'q:' + slug;
    var q = itemById(qid);
    var linksBefore = links.length;
    var moved = false;
    if (q) at = { x: q.x - COL, y: q.y };
    else at = at || landingSpot();
    /* The block must not land on cards already down. If its spot is taken it
       goes below everything instead, and a question already down moves with
       it, its strings stretching to follow. */
    if (!caseRoomAt(card, at)) {
      at = landingSpot();
      moved = true;
      if (q) { q.x = at.x + COL; q.y = at.y; }
    }
    if (!q) addQuestion(slug, at.x + COL, at.y);
    var cols = { for: [], other: [], against: [] };
    var added = 0;

    for (var i = 0; i < card.sources.length; i++) {
      var side = card.sources[i].side || 'for';
      if (!cols[side]) side = 'other';
      var sid = 's:' + slug + ':' + i;
      var it = itemById(sid);
      if (!it) { it = addSource(slug, i, at.x, at.y); cols[side].push(it); added++; }
      if (!linkExists(qid, sid)) links.push({ a: qid, b: sid });
    }

    if (q && !added && links.length === linksBefore) {
      cancelUndo();
      flash(qid);
      hint('Every source from ' + card.call + ' is already on the desk.');
      if (after) after();
      return;
    }

    /* Render first, so every card has a real height to flow against. */
    renderAll();
    var qe = nodeEl(qid);
    var top = at.y + (qe ? qe.offsetHeight + 60 : 140);
    hint(added + ' source' + (added === 1 ? '' : 's') + ' pinned from ' + card.call +
      (moved ? ', laid out below the desk because the space was taken' : '') +
      '. The string ties each one back to the question. Click any card to follow its thread.');
    flowAndSettle([
      { list: cols.for, x: at.x, y: top },
      { list: cols.other, x: at.x + COL, y: top },
      { list: cols.against, x: at.x + COL * 2, y: top }
    ], function () { fit(); if (after) after(); });
  }

  /* ================= the thread =================
     A link becomes a card. Clicked, it lands beside the card it came from with
     string between them; dropped, it lands where it was dropped and still ties
     back. Either way one undo takes it off again. */

  function addThing(p, x, y) {
    if (p.kind === 'src') return addSource(p.slug, p.i, x, y);
    if (p.kind === 'v') return addVerse(p.key, x, y);
    if (p.kind === 'd') return addDoc(p.path, x, y);
    if (p.kind === 'case') return addQuestion(p.slug, x, y);
    return null;
  }

  function thingId(p) {
    if (p.kind === 'src') return 's:' + p.slug + ':' + p.i;
    if (p.kind === 'v') return 'v:' + p.key;
    if (p.kind === 'd') return 'd:' + p.path;
    if (p.kind === 'case') return 'q:' + p.slug;
    return null;
  }

  function thingLabel(p) {
    if (p.kind === 'src') { var c = cardBySlug(p.slug), s = c && c.sources[p.i]; return s ? (s.title || s.ref) : 'source'; }
    if (p.kind === 'v') return p.key;
    if (p.kind === 'd') return LINKS.docs[p.path] ? LINKS.docs[p.path].title : p.path;
    if (p.kind === 'case') { var cc = cardBySlug(p.slug); return cc ? cc.question : 'case'; }
    return '';
  }

  /* origin: the id of the card this came from, to tie string to (or null).
     at: a world point to drop at, or null to land beside the origin. */
  function spawn(p, origin, at) {
    var id = thingId(p);
    if (!id) return;
    if (origin && !itemById(origin)) origin = null;
    var existing = itemById(id);
    if (existing) {
      if (origin && origin !== id && !linkExists(origin, id)) {
        pushUndo();
        links.push({ a: origin, b: id });
        drawLinks(); updateCounts(); save();
        hint(thingLabel(p) + ' was already on the desk, so the string was tied to it there.');
      } else hint(thingLabel(p) + ' is already on the desk.');
      flash(id);
      return;
    }
    pushUndo();
    var spot;
    if (at) spot = { x: Math.round(at.x - 28), y: Math.round(at.y - 16) };
    else if (origin) {
      var ob = boxOf(itemById(origin));
      spot = freeSpot(Math.round(ob.x + ob.w + 70), Math.round(ob.y), SRC_W, 150);
    } else {
      var c = viewCenter();
      spot = freeSpot(Math.round(c.x), Math.round(c.y), SRC_W, 150);
    }
    var it = addThing(p, spot.x, spot.y);
    if (!it) { cancelUndo(); return; }
    if (origin && origin !== id) links.push({ a: origin, b: id });
    renderAll();
    /* A dropped card locks to its neighbours the same way a dragged one does. */
    sel = {}; sel[id] = true;
    if (at) {
      var s = snapDelta(it, it.x, it.y);
      it.x += Math.round(s.dx); it.y += Math.round(s.dy);
      position(it);
    }
    renderSelection(); drawLinks(); updateCounts(); save();
    if (!at) ensureVisible(it);
    hint(thingLabel(p) + (origin ? ' is on the desk, tied to the card it came from.' : ' is on the desk.') + ' Ctrl-Z takes it off.');
  }

  /* Pans just enough to show a card, without re-zooming the reader's view. */
  function ensureVisible(it) {
    var r = $('surface').getBoundingClientRect();
    var b = boxOf(it), m = 40;
    var sx = b.x * tf.scale + tf.x, sy = b.y * tf.scale + tf.y;
    var sw = b.w * tf.scale, sh = b.h * tf.scale;
    var dx = 0, dy = 0;
    if (sx + sw > r.width - m) dx = (r.width - m) - (sx + sw);
    if (sx + dx < m) dx = m - sx;
    if (sy + sh > r.height - m) dy = (r.height - m) - (sy + sh);
    if (sy + dy < m) dy = m - sy;
    if (dx || dy) { tf.x += dx; tf.y += dy; applyTransform(); drawLinks(); }
  }

  /* ================= rendering ================= */

  function stampFor(src) {
    var s = el('span', 'stamp ' + (src.status === 'held' ? 'held' : 'not-held'),
      src.statusText || (src.status === 'held' ? 'HELD' : 'NOT YET HELD'));
    s.style.setProperty('--stamp-tilt', ((Math.random() * 8) - 4).toFixed(1) + 'deg');
    return s;
  }

  function tools(it) {
    var w = el('div', 'node-tools');
    var d = el('button', null, '×');
    d.type = 'button';
    d.title = 'Take it off the desk';
    d.setAttribute('aria-label', 'Remove from the desk');
    d.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    d.addEventListener('click', function (e) { e.stopPropagation(); remove(it.id); });
    w.appendChild(d);
    return w;
  }

  function buildSrcNode(it) {
    var src = srcOf(it);
    var card = cardBySlug(it.c);
    if (!src) return null;
    var n = el('div', 'node');
    n.setAttribute('data-id', it.id);
    n.style.setProperty('--tilt', (((it.i % 2) ? -1 : 1) * (0.4 + (it.i % 3) * 0.2)).toFixed(2) + 'deg');
    n.appendChild(tools(it));

    var b = el('button', 'pincard' + (src.side === 'against' ? ' against' : ''));
    b.type = 'button';
    var pin = el('span', 'pin' + (src.side === 'against' ? ' red' : ''));
    pin.title = 'Drag to tie string to another source';
    b.appendChild(pin);
    b.appendChild(el('div', 'tier ' + tierClass(src.tier), (src.tier || '').toUpperCase()));
    b.appendChild(el('div', 'ptitle', src.title || src.ref));
    var quote = src.phrase ? '“' + src.phrase + '”' : (src.note || '').split('. ')[0];
    b.appendChild(el('div', 'pquote', quote));
    var foot = el('div', 'pfoot');
    foot.appendChild(el('span', 'open', card ? card.call : 'open →'));
    foot.appendChild(stampFor(src));
    b.appendChild(foot);
    n.appendChild(b);
    return n;
  }

  function buildQNode(it) {
    var card = cardBySlug(it.c);
    if (!card) return null;
    var n = el('div', 'node');
    n.setAttribute('data-id', it.id);
    n.appendChild(tools(it));
    var q = el('div', 'qcard');
    q.appendChild(el('span', 'pin red'));
    q.appendChild(el('div', 'eyebrow', card.call + ' · ' + card.drawer));
    q.appendChild(el('div', 'qtext', card.question));
    n.appendChild(q);
    return n;
  }

  /* A verse card wears the pincard face and the stamp the build earned: the
     text was found in the held KJV, or the card would not exist. */
  function buildVerseNode(it) {
    var v = LINKS.verses[it.k];
    if (!v) return null;
    var n = el('div', 'node');
    n.setAttribute('data-id', it.id);
    n.style.setProperty('--tilt', '-0.6deg');
    n.appendChild(tools(it));
    var b = el('button', 'pincard verse');
    b.type = 'button';
    var pin = el('span', 'pin');
    pin.title = 'Drag to tie string to another card';
    b.appendChild(pin);
    b.appendChild(el('div', 'tier', 'SCRIPTURE · ' + v.book.toUpperCase()));
    b.appendChild(el('div', 'ptitle', v.label));
    var text = v.verses.map(function (x) { return x.text; }).join(' ');
    b.appendChild(el('div', 'pquote', text.length > 150 ? text.slice(0, 147).replace(/\s+\S*$/, '') + '…' : text));
    var foot = el('div', 'pfoot');
    foot.appendChild(el('span', 'open', 'KJV'));
    foot.appendChild(stampFor({ status: 'held', statusText: 'HELD · KJV' }));
    b.appendChild(foot);
    n.appendChild(b);
    return n;
  }

  /* A go-deeper file is the repo's own research, so it is drawn as an index
     card from the case file, never as a pinned source, and it gets no stamp. */
  function buildDocNode(it) {
    var d = LINKS.docs[it.k];
    if (!d) return null;
    var n = el('div', 'node');
    n.setAttribute('data-id', it.id);
    n.style.setProperty('--tilt', '0.5deg');
    n.appendChild(tools(it));
    var b = el('button', 'doccard');
    b.type = 'button';
    var pin = el('span', 'pin');
    pin.title = 'Drag to tie string to another card';
    b.appendChild(pin);
    b.appendChild(el('div', 'eyebrow', 'GO DEEPER · OUR NOTES IN THE REPO'));
    b.appendChild(el('div', 'ptitle', d.title));
    b.appendChild(el('div', 'dpath', d.path));
    n.appendChild(b);
    return n;
  }

  /* A moment in a podcast or video: what was said and when, from the
     auto-captions the build checked the words against. It is a pointer for
     finding the moment, never a source, and its stamp says so. */
  function episodeNo(key) { var m = /(\d+)$/.exec(key || ''); return m ? m[1] : key; }

  function pointerStamp(text) {
    var s = el('span', 'stamp pointer', text);
    s.style.setProperty('--stamp-tilt', ((Math.random() * 6) - 3).toFixed(1) + 'deg');
    return s;
  }

  function buildMomentNode(it) {
    var m = LINKS.moments && LINKS.moments[it.k];
    if (!m) return null;
    var n = el('div', 'node');
    n.setAttribute('data-id', it.id);
    n.style.setProperty('--tilt', '-0.4deg');
    n.appendChild(tools(it));
    var b = el('button', 'pincard moment');
    b.type = 'button';
    var pin = el('span', 'pin');
    pin.title = 'Drag to tie string to another card';
    b.appendChild(pin);
    b.appendChild(el('div', 'tier', m.show + ' ' + episodeNo(m.key) + ' · ' + m.ts));
    b.appendChild(el('div', 'ptitle', it.sp ? it.sp + ' said' : 'Said in the episode'));
    b.appendChild(el('div', 'pquote', '“' + m.phrase + '”'));
    var foot = el('div', 'pfoot');
    foot.appendChild(el('span', 'open', '▶ the moment'));
    foot.appendChild(pointerStamp('POINTER · NOT PROOF'));
    b.appendChild(foot);
    n.appendChild(b);
    return n;
  }

  /* A page outside the repo that a check relied on: its exact words and a
     link. The build cannot fetch it, so it is never stamped HELD. */
  function urlHost(url) { var m = /^https?:\/\/([^\/]+)/.exec(url || ''); return m ? m[1].replace(/^www\./, '') : ''; }

  function buildWebNode(it) {
    var n = el('div', 'node');
    n.setAttribute('data-id', it.id);
    n.style.setProperty('--tilt', '0.4deg');
    n.appendChild(tools(it));
    var b = el('button', 'pincard outside');
    b.type = 'button';
    var pin = el('span', 'pin');
    pin.title = 'Drag to tie string to another card';
    b.appendChild(pin);
    b.appendChild(el('div', 'tier', 'OUTSIDE SOURCE · ' + urlHost(it.url).toUpperCase()));
    b.appendChild(el('div', 'ptitle', it.title));
    b.appendChild(el('div', 'pquote', '“' + it.quote + '”'));
    var foot = el('div', 'pfoot');
    foot.appendChild(el('span', 'open', 'open the page →'));
    foot.appendChild(pointerStamp('OUTSIDE · CHECKED BY HAND'));
    b.appendChild(foot);
    n.appendChild(b);
    return n;
  }

  /* A note whose first line is a verdict (✓ HOLDS, ~ NARROWER, ✗ DOESN'T HOLD,
     ? OPEN, ◇ INTERPRETATION, • EXPERIENCE) wears that verdict's colour. */
  var VERDICTS = [['HOLDS', 'holds'], ['NARROWER', 'narrower'], ["DOESN'T HOLD", 'fails'], ['OPEN', 'open'],
                  ['INTERPRETATION', 'reading'], ['EXPERIENCE', 'experience']];

  function verdictOf(text) {
    var first = (text || '').split('\n')[0].replace(/^[^A-Z]+/, '');
    for (var i = 0; i < VERDICTS.length; i++) if (first.indexOf(VERDICTS[i][0]) === 0) return VERDICTS[i][1];
    return null;
  }

  function buildNoteNode(it) {
    var n = el('div', 'node');
    n.setAttribute('data-id', it.id);
    n.style.setProperty('--tilt', '1.2deg');
    n.appendChild(tools(it));
    var verdict = verdictOf(it.text);
    var p = el('div', 'notepad' + (verdict ? ' verdict verdict-' + verdict : ''));
    p.appendChild(el('div', 'eyebrow', verdict ? 'CHECK · NOT A SOURCE' : 'NOTE · NOT A SOURCE'));
    var ta = el('textarea');
    ta.value = it.text || '';
    ta.rows = 3;
    ta.placeholder = 'Your own words. Never stamped, never confused with a source.';
    ta.setAttribute('aria-label', 'Note text');
    ta.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    ta.addEventListener('input', function () {
      it.text = ta.value;
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
      save();
    });
    p.appendChild(ta);
    n.appendChild(p);
    setTimeout(function () { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }, 0);
    return n;
  }

  /* A title's width in ch plus its 2px letter-spacing, or the end gets cut. */
  function sizeTitle(inp) {
    var n = Math.max(4, inp.value.length + 1);
    inp.style.width = 'calc(' + n + 'ch + ' + (n * 2) + 'px)';
  }

  function startRename(it) {
    var e = nodeEl(it.id), inp = e && e.querySelector('.frame-title input');
    if (!inp) return;
    editingTitle = it.id;
    inp.setAttribute('data-was', inp.value);
    inp.readOnly = false;
    inp.classList.add('is-editing');
    inp.focus(); inp.select();
    hint('Type the section name. Enter keeps it, Esc puts the old one back.');
  }

  function endRename(it, inp) {
    if (inp.readOnly) return;
    inp.readOnly = true;
    inp.classList.remove('is-editing');
    editingTitle = null;
    if (!inp.value.trim()) { inp.value = inp.getAttribute('data-was') || 'UNTITLED'; it.title = inp.value; sizeTitle(inp); }
    save(); renderHere();
  }

  function buildFrame(it) {
    var f = el('div', 'frame');
    f.setAttribute('data-id', it.id);
    f.style.setProperty('--fc', FRAME_COLORS[it.ci || 0]);

    var bar = el('div', 'frame-title');
    var inp = el('input');
    inp.value = it.title;
    inp.readOnly = true;
    inp.tabIndex = -1;
    inp.setAttribute('aria-label', 'Frame title. Double-click to rename.');
    bar.title = 'Drag to move the section with everything in it. Double-click the name to rename it.';
    /* Only while renaming does the title take the pointer; otherwise the
       whole bar is a handle for moving the section. */
    inp.addEventListener('pointerdown', function (e) { if (!inp.readOnly) e.stopPropagation(); });
    inp.addEventListener('input', function () {
      it.title = inp.value;
      sizeTitle(inp);
      save();
      renderHere();
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); inp.blur(); }
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); inp.value = inp.getAttribute('data-was') || ''; it.title = inp.value; sizeTitle(inp); inp.blur(); }
    });
    inp.addEventListener('blur', function () { endRename(it, inp); });
    sizeTitle(inp);
    bar.appendChild(inp);
    var cnt = el('span', 'frame-count', '');
    bar.appendChild(cnt);
    var del = el('button', 'frame-del', '×');
    del.type = 'button';
    del.title = 'Remove the frame, keep the cards';
    del.setAttribute('aria-label', 'Remove the frame');
    del.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    del.addEventListener('click', function (e) { e.stopPropagation(); remove(it.id); });
    bar.appendChild(del);
    f.appendChild(bar);

    f.appendChild(el('div', 'frame-body'));
    var grip = el('div', 'frame-grip');
    grip.title = 'Resize';
    f.appendChild(grip);
    return f;
  }

  function position(it) {
    var e = nodeEl(it.id);
    if (!e) return;
    e.style.left = it.x + 'px';
    e.style.top = it.y + 'px';
    if (it.t === 'frame') { e.style.width = it.w + 'px'; e.style.height = it.h + 'px'; }
    else e.style.width = it.w + 'px';
  }

  function renderAll() {
    var nodes = $('nodes'), frames = $('frames');
    nodes.innerHTML = ''; frames.innerHTML = '';
    for (var i = 0; i < items.length; i++) {
      var it = items[i], e = null;
      if (it.t === 'src') e = buildSrcNode(it);
      else if (it.t === 'q') e = buildQNode(it);
      else if (it.t === 'v') e = buildVerseNode(it);
      else if (it.t === 'd') e = buildDocNode(it);
      else if (it.t === 'm') e = buildMomentNode(it);
      else if (it.t === 'w') e = buildWebNode(it);
      else if (it.t === 'note') e = buildNoteNode(it);
      else if (it.t === 'frame') e = buildFrame(it);
      if (!e) continue;
      (it.t === 'frame' ? frames : nodes).appendChild(e);
      position(it);
    }
    renderSelection();
    renderTrayPlaced();
    renderHere();
    if (presenting) { applySpotlight(); setNotesReadOnly(true); }
    drawLinks();
    updateCounts();
    $('emptyDesk').hidden = items.length > 0;
    document.body.classList.toggle('is-empty', items.length === 0);
    applyTrayDefault();
    applyPhone();
  }

  function renderSelection() {
    var all = $('nodes').children, i;
    for (i = 0; i < all.length; i++) all[i].classList.toggle('is-selected', !!sel[all[i].getAttribute('data-id')]);
    var fr = $('frames').children;
    for (i = 0; i < fr.length; i++) fr[i].classList.toggle('is-selected', !!sel[fr[i].getAttribute('data-id')]);
  }

  function updateCounts() {
    var n = 0, held = 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i].t === 'frame') continue;
      n++;
      var s = srcOf(items[i]);
      if ((s && s.status === 'held') || items[i].t === 'v') held++;
    }
    var frames = items.filter(function (x) { return x.t === 'frame'; }).length;
    $('hudCounts').textContent = n + ' on the desk · ' + held + ' held in the repo · ' +
      links.length + ' string' + (links.length === 1 ? '' : 's') + ' · ' + frames + ' frame' + (frames === 1 ? '' : 's');
    for (var k = 0; k < items.length; k++) {
      if (items[k].t !== 'frame') continue;
      var e = nodeEl(items[k].id);
      if (!e) continue;
      var c = e.querySelector('.frame-count');
      if (c) { var m = membersOf(items[k]).length; c.textContent = m ? m + ' in' : ''; }
    }
  }

  function remove(id) {
    pushUndo();
    items = items.filter(function (x) { return x.id !== id; });
    links = links.filter(function (l) { return l.a !== id && l.b !== id; });
    delete sel[id];
    renderAll(); save();
  }

  function removeSelection() {
    var ids = Object.keys(sel);
    if (!ids.length) return;
    pushUndo();
    items = items.filter(function (x) { return !sel[x.id]; });
    links = links.filter(function (l) { return !sel[l.a] && !sel[l.b]; });
    sel = {};
    renderAll(); save();
  }

  /* ================= string ================= */

  function pinPoint(it) {
    var b = boxOf(it);
    if (it.t === 'frame') return { x: b.x + b.w / 2, y: b.y };
    return { x: b.x + b.w / 2, y: b.y - 1 };
  }

  function drawLinks() {
    var svg = $('links'), top = $('linkWords');
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    while (top.firstChild) top.removeChild(top.firstChild);
    for (var i = 0; i < links.length; i++) {
      var a = itemById(links[i].a), b = itemById(links[i].b);
      if (!a || !b) continue;
      var pa = pinPoint(a), pb = pinPoint(b);
      var sa = srcOf(a), sb = srcOf(b);
      var isOther = (sa && sa.side === 'other') || (sb && sb.side === 'other');
      var dim = presFocus && !(presFocus[a.id] || presFocus[b.id]);

      var key = linkKey(links[i]);
      var picked = selLink === key;

      var hit = svgEl('line');
      hit.setAttribute('class', 'string-hit');
      hit.setAttribute('data-link', key);
      hit.setAttribute('x1', pa.x); hit.setAttribute('y1', pa.y);
      hit.setAttribute('x2', pb.x); hit.setAttribute('y2', pb.y);
      hit.setAttribute('vector-effect', 'non-scaling-stroke');
      (function (k) {
        /* A click selects the string; Delete or its x takes it off. Nothing is cut by a stray click. */
        hit.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
        hit.addEventListener('click', function (e) {
          e.stopPropagation();
          if (presenting) return;
          selectLink(selLink === k ? null : k);
        });
        hit.addEventListener('dblclick', function (e) { e.stopPropagation(); editWords(k); });
      })(key);
      svg.appendChild(hit);

      var line = svgEl('line');
      line.setAttribute('class', 'string-line' + (isOther ? ' other' : '') + (dim ? ' dim' : '') + (picked ? ' is-picked' : ''));
      line.setAttribute('x1', pa.x); line.setAttribute('y1', pa.y);
      line.setAttribute('x2', pb.x); line.setAttribute('y2', pb.y);
      line.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(line);

      var mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2, half = 0;
      if (links[i].words && wordsEdit !== key)
        half = stringWords(key, links[i].words, mx, my, (isOther ? ' other' : '') + (dim ? ' dim' : '') + (picked ? ' is-picked' : ''));
      if (picked && !presenting) {
        var gap = 16 / tf.scale;
        top.appendChild(cutButton(key, mx + (half ? half + gap : gap), my));
        if (wordsEdit !== key) top.appendChild(wordsButton(key, mx - (half ? half + gap : gap), my));
      }
    }
    if (tempLine) svg.appendChild(tempLine);
  }

  /* ================= words on string =================
     A string can say why it is there: "answers", "quotes", "same words".
     The words sit at its middle, above the cards, at the desk's own scale. */

  var WORDS_MAX = 40;
  var wordsEdit = null;      // the string whose words are being written
  var wordsWidth = {};       // measured text widths, so a redraw does not re-measure

  function linkByKey(key) {
    for (var i = 0; i < links.length; i++) if (linkKey(links[i]) === key) return links[i];
    return null;
  }

  function cleanWords(w) { return typeof w === 'string' ? w.replace(/\s+/g, ' ').trim().slice(0, WORDS_MAX) : ''; }

  /* Draws one string's words; returns half their width, in desk units. */
  function stringWords(key, text, x, y, cls) {
    var g = svgEl('g');
    g.setAttribute('class', 'string-words' + cls);
    g.setAttribute('data-link', key);
    g.setAttribute('transform', 'translate(' + x + ',' + y + ')');
    var r = svgEl('rect'), t = svgEl('text');
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('dy', '0.35em');
    t.textContent = text;
    g.appendChild(r); g.appendChild(t);
    $('linkWords').appendChild(g);
    var w = wordsWidth[text];
    if (!w) {
      w = t.getComputedTextLength ? t.getComputedTextLength() : 0;
      if (w) wordsWidth[text] = w; else w = text.length * 7.2;   // hidden desk (a phone's list): estimate
    }
    r.setAttribute('x', -w / 2 - 7); r.setAttribute('y', -11);
    r.setAttribute('width', w + 14); r.setAttribute('height', 22);
    r.setAttribute('rx', 2);
    g.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    g.addEventListener('click', function (e) {
      e.stopPropagation();
      if (presenting) return;
      selectLink(selLink === key ? null : key);
    });
    g.addEventListener('dblclick', function (e) { e.stopPropagation(); editWords(key); });
    return w / 2 + 7;
  }

  /* The Aa beside a selected string's x: write or change its words. */
  function wordsButton(key, x, y) {
    var g = svgEl('g');
    g.setAttribute('class', 'string-words-btn');
    g.setAttribute('transform', 'translate(' + x + ',' + y + ') scale(' + (1 / tf.scale) + ')');
    var c = svgEl('circle');
    c.setAttribute('r', '11');
    g.appendChild(c);
    var t = svgEl('text');
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('dy', '0.35em');
    t.textContent = 'Aa';
    g.appendChild(t);
    var label = svgEl('title');
    label.textContent = 'Write words on this string';
    g.appendChild(label);
    g.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    g.addEventListener('click', function (e) { e.stopPropagation(); editWords(key); });
    return g;
  }

  function editWords(key) {
    var l = linkByKey(key);
    if (!l || presenting || wordsEdit) return;
    var a = itemById(l.a), b = itemById(l.b);
    if (!a || !b) return;
    var pa = pinPoint(a), pb = pinPoint(b);
    wordsEdit = key;
    selLink = key; sel = {}; renderSelection();
    drawLinks();
    var inp = el('input', 'string-words-edit');
    inp.type = 'text';
    inp.maxLength = WORDS_MAX;
    inp.value = l.words || '';
    inp.placeholder = 'answers, quotes, same words…';
    inp.setAttribute('list', 'stringWordsList');
    inp.setAttribute('aria-label', 'Words on this string');
    inp.style.left = ((pa.x + pb.x) / 2) + 'px';
    inp.style.top = ((pa.y + pb.y) / 2) + 'px';
    inp.style.transform = 'translate(-50%, -50%) scale(' + (1 / tf.scale) + ')';
    $('world').appendChild(inp);
    var done = false;
    function finish(keep) {
      if (done) return;
      done = true;
      document.removeEventListener('pointerdown', away, true);
      var v = cleanWords(inp.value);
      if (inp.parentNode) inp.parentNode.removeChild(inp);
      wordsEdit = null;
      if (keep && v !== (l.words || '') && links.indexOf(l) >= 0) {
        pushUndo();
        if (v) l.words = v; else delete l.words;
        save();
        hint(v ? 'The string says “' + v + '”. Ctrl-Z takes it back.' : 'Words taken off the string.');
      }
      drawLinks();
      $('surface').focus({ preventScroll: true });
    }
    inp.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); finish(true); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false); }
    });
    inp.addEventListener('blur', function () { finish(true); });
    /* A press on the desk does not move the focus (the desk keeps it for its
       keys), so a click away is caught here: it keeps what was written. */
    var away = function (e) {
      if (e.target === inp) return;
      document.removeEventListener('pointerdown', away, true);
      finish(true);
    };
    document.addEventListener('pointerdown', away, true);
    inp.focus(); inp.select();
    hint('Write what this string means. Enter keeps it, Esc leaves it as it was. Empty takes the words off.');
  }

  function linkKey(l) { return l.a + '|' + l.b; }

  function selectLink(key) {
    selLink = key;
    if (key) { sel = {}; renderSelection(); }
    drawLinks();
    if (key) hint('String selected. Aa or a double-click writes words on it. Delete, or the x, takes it off. Esc lets go.');
  }

  function cutLink(key) {
    var at = -1;
    for (var i = 0; i < links.length; i++) if (linkKey(links[i]) === key) at = i;
    if (at < 0) return;
    pushUndo();
    links.splice(at, 1);
    selLink = null;
    drawLinks(); updateCounts(); save();
    hint('String taken off. Ctrl-Z puts it back.');
  }

  /* The x at the middle of a selected string, the same size at any zoom. */
  function cutButton(key, x, y) {
    var g = svgEl('g');
    g.setAttribute('class', 'string-cut');
    g.setAttribute('transform', 'translate(' + x + ',' + y + ') scale(' + (1 / tf.scale) + ')');
    var c = svgEl('circle');
    c.setAttribute('r', '11');
    g.appendChild(c);
    var t = svgEl('path');
    t.setAttribute('d', 'M-4,-4 L4,4 M4,-4 L-4,4');
    g.appendChild(t);
    var label = svgEl('title');
    label.textContent = 'Take this string off';
    g.appendChild(label);
    g.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    g.addEventListener('click', function (e) { e.stopPropagation(); cutLink(key); });
    return g;
  }

  var tempLine = null;

  function linkExists(a, b) {
    for (var i = 0; i < links.length; i++) {
      if ((links[i].a === a && links[i].b === b) || (links[i].a === b && links[i].b === a)) return true;
    }
    return false;
  }

  function tieString(a, b) {
    if (a === b || linkExists(a, b)) return;
    pushUndo();
    links.push({ a: a, b: b });
    drawLinks(); updateCounts(); save();
  }

  /* ================= snapping ================= */

  function snapDelta(lead, nx, ny) {
    var out = { dx: 0, dy: 0, gx: null, gy: null };
    if (!snapOn) return out;
    var lb = boxOf(lead);
    var w = lb.w, h = lb.h;
    var tol = TOL / tf.scale;
    var bestX = null, bestY = null;

    var mx = [nx, nx + w / 2, nx + w];
    var my = [ny, ny + h / 2, ny + h];

    /* Stack spacing beats a merely-nearby edge, because "set one under the
       other and it locks" is the behaviour people expect from a board. */
    var BONUS = 6;
    function score(d, isStack) { return Math.abs(d) - (isStack ? BONUS : 0); }

    for (var i = 0; i < items.length; i++) {
      var o = items[i];
      if (sel[o.id] || o.t === 'frame') continue;
      var ob = boxOf(o);
      var tx = [ob.x, ob.x + ob.w / 2, ob.x + ob.w];
      var ty = [ob.y, ob.y + ob.h / 2, ob.y + ob.h];
      var a, b, d, s;

      for (a = 0; a < 3; a++) for (b = 0; b < 3; b++) {
        d = tx[b] - mx[a]; s = score(d, false);
        if (Math.abs(d) <= tol && (!bestX || s < bestX.s)) bestX = { d: d, at: tx[b], s: s };
        d = ty[b] - my[a]; s = score(d, false);
        if (Math.abs(d) <= tol && (!bestY || s < bestY.s)) bestY = { d: d, at: ty[b], s: s };
      }

      /* Sitting one card directly above or below another locks it to the same
         22px gap the case board uses, so a column reads clean. */
      var overlapX = nx < ob.x + ob.w && nx + w > ob.x;
      if (overlapX) {
        d = (ob.y + ob.h + GAP) - ny; s = score(d, true);
        if (Math.abs(d) <= tol * 1.6 && (!bestY || s < bestY.s)) bestY = { d: d, at: null, s: s };
        d = (ob.y - GAP - h) - ny; s = score(d, true);
        if (Math.abs(d) <= tol * 1.6 && (!bestY || s < bestY.s)) bestY = { d: d, at: null, s: s };
      }
      var overlapY = ny < ob.y + ob.h && ny + h > ob.y;
      if (overlapY) {
        d = (ob.x + ob.w + GAP) - nx; s = score(d, true);
        if (Math.abs(d) <= tol * 1.6 && (!bestX || s < bestX.s)) bestX = { d: d, at: null, s: s };
        d = (ob.x - GAP - w) - nx; s = score(d, true);
        if (Math.abs(d) <= tol * 1.6 && (!bestX || s < bestX.s)) bestX = { d: d, at: null, s: s };
      }
    }

    if (bestX) { out.dx = bestX.d; out.gx = bestX.at; }
    if (bestY) { out.dy = bestY.d; out.gy = bestY.at; }
    return out;
  }

  function drawGuides(gx, gy) {
    var svg = $('guides');
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var r = $('surface').getBoundingClientRect();
    var a = toWorld(r.left, r.top), b = toWorld(r.right, r.bottom);
    if (gx != null) {
      var v = svgEl('line');
      v.setAttribute('class', 'guide-line');
      v.setAttribute('x1', gx); v.setAttribute('y1', a.y); v.setAttribute('x2', gx); v.setAttribute('y2', b.y);
      v.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(v);
    }
    if (gy != null) {
      var hl = svgEl('line');
      hl.setAttribute('class', 'guide-line');
      hl.setAttribute('x1', a.x); hl.setAttribute('y1', gy); hl.setAttribute('x2', b.x); hl.setAttribute('y2', gy);
      hl.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(hl);
    }
  }

  function clearGuides() {
    var svg = $('guides');
    while (svg.firstChild) svg.removeChild(svg.firstChild);
  }

  /* ================= frames ================= */

  function membersOf(frame) {
    var out = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.t === 'frame') continue;
      var b = boxOf(it);
      var cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      if (cx >= frame.x && cx <= frame.x + frame.w && cy >= frame.y && cy <= frame.y + frame.h) out.push(it);
    }
    return out;
  }

  /* ================= interaction ================= */

  var spaceDown = false;

  function wireSurface() {
    var surface = $('surface');

    surface.addEventListener('wheel', function (e) {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else {
        tf.x -= e.deltaX;
        tf.y -= e.deltaY;
        applyTransform();
      }
    }, { passive: false });

    var pan = null, marq = null, drag = null, frameDrag = null, resize = null, string = null, presPress = null;
    var touches = {}, pinch = null;

    function nodeFromEvent(e) {
      var t = e.target;
      while (t && t !== surface) {
        if (t.classList && (t.classList.contains('node') || t.classList.contains('frame'))) return t;
        t = t.parentNode;
      }
      return null;
    }

    /* While a pointer is captured, every event retargets to the capturing
       element, so a drop target has to be found by coordinate, not by target. */
    function nodeAtPoint(x, y) {
      var t = document.elementFromPoint(x, y);
      while (t && t !== document.body) {
        if (t.classList && t.classList.contains('node')) return t;
        t = t.parentNode;
      }
      return null;
    }

    surface.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') {
        touches[e.pointerId] = { x: e.clientX, y: e.clientY };
        var keys = Object.keys(touches);
        if (keys.length === 2) {
          var a = touches[keys[0]], b = touches[keys[1]];
          pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
          drag = null; marq = null; pan = null;
          return;
        }
      }

      var holder = nodeFromEvent(e);

      /* Presenting: a card or a section title is clicked, never dragged; the
         background pans. Nothing on the desk can move by accident. */
      if (presenting) {
        if (holder) presPress = { holder: holder, x: e.clientX, y: e.clientY };
        else {
          surface.setPointerCapture(e.pointerId);
          pan = { lx: e.clientX, ly: e.clientY };
          surface.classList.add('is-panning');
        }
        e.preventDefault();
        return;
      }

      var isPin = e.target.classList && e.target.classList.contains('pin');
      var isGrip = e.target.classList && e.target.classList.contains('frame-grip');
      var isBar = !!(e.target.closest && e.target.closest('.frame-title'));

      /* string from a pin head */
      if (holder && isPin && !isBar) {
        var id = holder.getAttribute('data-id');
        surface.setPointerCapture(e.pointerId);
        string = { id: id, from: pinPoint(itemById(id)) };
        tempLine = svgEl('line');
        tempLine.setAttribute('class', 'string-line hot');
        tempLine.setAttribute('vector-effect', 'non-scaling-stroke');
        drawLinks();
        surface.classList.add('is-stringing');
        e.preventDefault();
        return;
      }

      /* frame resize */
      if (holder && isGrip) {
        var fid = holder.getAttribute('data-id');
        var fit = itemById(fid);
        surface.setPointerCapture(e.pointerId);
        pushUndo();
        resize = { it: fit, w: fit.w, h: fit.h, sx: e.clientX, sy: e.clientY };
        e.preventDefault();
        return;
      }

      /* frame move by its title bar, carrying whatever is inside */
      if (holder && isBar) {
        var bid = holder.getAttribute('data-id');
        var bit = itemById(bid);
        surface.setPointerCapture(e.pointerId);
        pushUndo();
        var mem = membersOf(bit);
        frameDrag = {
          it: bit, ox: bit.x, oy: bit.y, sx: e.clientX, sy: e.clientY, moved: false,
          mem: mem.map(function (m) { return { it: m, ox: m.x, oy: m.y }; })
        };
        sel = {}; sel[bid] = true; renderSelection();
        e.preventDefault();
        return;
      }

      /* a card */
      if (holder && holder.classList.contains('node')) {
        var nid = holder.getAttribute('data-id');
        if (stringMode) {
          if (!string) {
            string = { id: nid, from: pinPoint(itemById(nid)), click: true };
            holder.classList.add('is-linking');
            hint('Now click the other source to tie the string.');
          }
          e.preventDefault();
          return;
        }
        if (selLink) { selLink = null; drawLinks(); }
        if (!sel[nid] && !e.shiftKey) { sel = {}; sel[nid] = true; }
        else if (e.shiftKey) { if (sel[nid]) delete sel[nid]; else sel[nid] = true; }
        renderSelection();

        var lead = itemById(nid);
        var origins = [];
        for (var k in sel) if (sel[k] && itemById(k)) origins.push({ it: itemById(k), ox: itemById(k).x, oy: itemById(k).y });
        surface.setPointerCapture(e.pointerId);
        pushUndo();
        lastPlan = null;
        drag = { lead: lead, origins: origins, sx: e.clientX, sy: e.clientY, moved: false, el: holder };
        holder.classList.add('is-dragging');
        e.preventDefault();
        return;
      }

      /* background: pan on middle, on space, or on touch; otherwise marquee */
      var wantPan = e.button === 1 || spaceDown || e.pointerType === 'touch';
      surface.setPointerCapture(e.pointerId);
      if (wantPan) {
        pan = { lx: e.clientX, ly: e.clientY };
        surface.classList.add('is-panning');
      } else if (e.button === 0) {
        marq = { ax: e.clientX, ay: e.clientY, bx: e.clientX, by: e.clientY, add: e.shiftKey };
      }
      e.preventDefault();
    });

    surface.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch' && touches[e.pointerId]) touches[e.pointerId] = { x: e.clientX, y: e.clientY };

      if (pinch) {
        var keys = Object.keys(touches);
        if (keys.length >= 2) {
          var a = touches[keys[0]], b = touches[keys[1]];
          var d = Math.hypot(a.x - b.x, a.y - b.y);
          if (pinch.d > 0) zoomAt(pinch.cx, pinch.cy, d / pinch.d);
          pinch.d = d; pinch.cx = (a.x + b.x) / 2; pinch.cy = (a.y + b.y) / 2;
        }
        return;
      }

      if (pan) {
        tf.x += e.clientX - pan.lx;
        tf.y += e.clientY - pan.ly;
        pan.lx = e.clientX; pan.ly = e.clientY;
        applyTransform();
        return;
      }

      if (string && !string.click) {
        var p = toWorld(e.clientX, e.clientY);
        var over = nodeAtPoint(e.clientX, e.clientY);
        var oid = over && over.getAttribute('data-id');
        if (oid === string.id) { over = null; oid = null; }
        if (string.target && string.target !== over) string.target.classList.remove('is-target');
        string.target = over;
        if (over) {
          over.classList.add('is-target');
          var tp = pinPoint(itemById(oid));
          p = { x: tp.x, y: tp.y };
        }
        tempLine.setAttribute('x1', string.from.x); tempLine.setAttribute('y1', string.from.y);
        tempLine.setAttribute('x2', p.x); tempLine.setAttribute('y2', p.y);
        return;
      }

      if (resize) {
        resize.it.w = Math.max(140, Math.round(resize.w + (e.clientX - resize.sx) / tf.scale));
        resize.it.h = Math.max(110, Math.round(resize.h + (e.clientY - resize.sy) / tf.scale));
        position(resize.it);
        updateCounts();
        return;
      }

      if (frameDrag) {
        var fdx = (e.clientX - frameDrag.sx) / tf.scale;
        var fdy = (e.clientY - frameDrag.sy) / tf.scale;
        if (Math.abs(fdx) + Math.abs(fdy) > 2) frameDrag.moved = true;
        frameDrag.it.x = Math.round(frameDrag.ox + fdx);
        frameDrag.it.y = Math.round(frameDrag.oy + fdy);
        position(frameDrag.it);
        for (var m = 0; m < frameDrag.mem.length; m++) {
          var mm = frameDrag.mem[m];
          mm.it.x = Math.round(mm.ox + fdx);
          mm.it.y = Math.round(mm.oy + fdy);
          position(mm.it);
        }
        drawLinks();
        return;
      }

      if (drag) {
        var dx = (e.clientX - drag.sx) / tf.scale;
        var dy = (e.clientY - drag.sy) / tf.scale;
        if (Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) > 4) drag.moved = true;

        var leadOrigin = null;
        for (var i = 0; i < drag.origins.length; i++) if (drag.origins[i].it === drag.lead) leadOrigin = drag.origins[i];
        var nx = Math.round(leadOrigin.ox + dx), ny = Math.round(leadOrigin.oy + dy);
        var s = drag.moved ? snapDelta(drag.lead, nx, ny) : { dx: 0, dy: 0, gx: null, gy: null };

        for (var j = 0; j < drag.origins.length; j++) {
          var o = drag.origins[j];
          o.it.x = Math.round(o.ox + dx + s.dx);
          o.it.y = Math.round(o.oy + dy + s.dy);
          position(o.it);
        }
        if (drag.moved) drawGuides(s.gx, s.gy);
        drawLinks();
        return;
      }

      if (marq) {
        marq.bx = e.clientX; marq.by = e.clientY;
        var r = surface.getBoundingClientRect();
        var box = $('marquee');
        box.hidden = false;
        box.style.left = (Math.min(marq.ax, marq.bx) - r.left) + 'px';
        box.style.top = (Math.min(marq.ay, marq.by) - r.top) + 'px';
        box.style.width = Math.abs(marq.bx - marq.ax) + 'px';
        box.style.height = Math.abs(marq.by - marq.ay) + 'px';
      }
    });

    function endPointer(e) {
      if (e.pointerType === 'touch') { delete touches[e.pointerId]; if (Object.keys(touches).length < 2) pinch = null; }

      if (presPress) {
        var pp = presPress;
        presPress = null;
        if (Math.abs(e.clientX - pp.x) + Math.abs(e.clientY - pp.y) < 6) {
          var pid = pp.holder.getAttribute('data-id'), pit = itemById(pid);
          if (pit && pit.t === 'frame') goSlide(slideIndexOf(pid));
          else openItem(pit);
        }
        return;
      }

      if (string && !string.click) {
        var holder = nodeAtPoint(e.clientX, e.clientY);
        var tied = false;
        if (holder) {
          var other = holder.getAttribute('data-id');
          if (other !== string.id && !linkExists(string.id, other)) { tieString(string.id, other); tied = true; }
        }
        if (string.target) string.target.classList.remove('is-target');
        var already = holder && holder.getAttribute('data-id') !== string.id && !tied;
        string = null; tempLine = null;
        surface.classList.remove('is-stringing');
        drawLinks();
        hint(tied ? 'String tied. Click a string to select it; Delete takes it off.' :
          already ? 'Those two are already tied.' : 'Let go on a card to tie the string. Nothing was tied.');
        return;
      }

      if (resize) { resize = null; save(); return; }

      if (frameDrag) {
        var moved = frameDrag.moved, fid = frameDrag.it.id;
        frameDrag = null;
        if (moved) { drawLinks(); save(); lastBarClick = null; }
        else {
          cancelUndo();
          /* Two clicks on the same name in quick succession rename it. The
             browser's own dblclick never reaches the bar, because the press
             captured the pointer for a possible drag. */
          var now = Date.now();
          if (lastBarClick && lastBarClick.id === fid && now - lastBarClick.t < 450) { lastBarClick = null; startRename(itemById(fid)); }
          else lastBarClick = { id: fid, t: now };
        }
        return;
      }

      if (drag) {
        clearGuides();
        drag.el.classList.remove('is-dragging');
        var wasMoved = drag.moved;
        var leadId = drag.lead.id;
        drag = null;
        if (wasMoved) { updateCounts(); save(); }
        else {
          cancelUndo();
          /* a click, not a drag: open the source */
          openItem(itemById(leadId));
        }
        return;
      }

      if (marq) {
        var box2 = $('marquee');
        box2.hidden = true;
        var x1 = Math.min(marq.ax, marq.bx), x2 = Math.max(marq.ax, marq.bx);
        var y1 = Math.min(marq.ay, marq.by), y2 = Math.max(marq.ay, marq.by);
        var isClick = (x2 - x1) < 4 && (y2 - y1) < 4;
        if (!marq.add) sel = {};
        if (selLink) { selLink = null; drawLinks(); }
        if (!isClick) {
          /* Hit test in screen space, which is correct at any zoom and needs
             no stored heights. */
          var nodes = $('nodes').children;
          for (var i = 0; i < nodes.length; i++) {
            var r2 = nodes[i].getBoundingClientRect();
            if (r2.left < x2 && r2.right > x1 && r2.top < y2 && r2.bottom > y1) sel[nodes[i].getAttribute('data-id')] = true;
          }
        }
        marq = null;
        renderSelection();
      }

      if (pan) { pan = null; surface.classList.remove('is-panning'); }
    }

    surface.addEventListener('pointerup', endPointer);

    /* A double-click arrives at the surface (the press captured the pointer),
       so find the section name under it by position. Two quick presses are
       also caught in endPointer; renaming twice is harmless. */
    surface.addEventListener('dblclick', function (e) {
      if (presenting) return;
      var t = document.elementFromPoint(e.clientX, e.clientY);
      var bar = t && t.closest && t.closest('.frame-title');
      var fr = bar && bar.parentNode;
      if (!fr || !fr.getAttribute) return;
      var it = itemById(fr.getAttribute('data-id'));
      if (it && it.t === 'frame' && editingTitle !== it.id) { lastBarClick = null; startRename(it); }
    });
    surface.addEventListener('pointercancel', endPointer);

    /* click-to-link, the touch-friendly path */
    surface.addEventListener('click', function (e) {
      if (!stringMode || !string || !string.click) return;
      var t = e.target, holder = null;
      while (t && t !== surface) { if (t.classList && t.classList.contains('node')) { holder = t; break; } t = t.parentNode; }
      if (holder) {
        var other = holder.getAttribute('data-id');
        if (other !== string.id) { tieString(string.id, other); hint('String tied.'); }
      }
      var prev = $('nodes').querySelector('.is-linking');
      if (prev) prev.classList.remove('is-linking');
      string = null;
    });

    document.addEventListener('keydown', function (e) {
      if (presentKey(e)) return;
      if (!$('helpPanel').hidden && e.key === 'Escape') { toggleHelp(false); e.preventDefault(); return; }
      /* Not while presenting: the show's bar carries its own keys. */
      if (e.key === '?' && !presenting && !isTyping(e) && !e.ctrlKey && !e.metaKey) { toggleHelp(); e.preventDefault(); return; }
      if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); saveFile(); return; }
      if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'o' || e.key === 'O')) { e.preventDefault(); $('fileOpen').value = ''; $('fileOpen').click(); return; }
      if (!isTyping(e) && (e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey && !e.altKey) { startPresent(0, true); e.preventDefault(); return; }
      if (e.code === 'Space' && !isTyping(e)) { spaceDown = true; $('surface').classList.add('is-spacing'); e.preventDefault(); }
      if (isTyping(e)) return;
      if ((e.key === 'Delete' || e.key === 'Backspace')) {
        if (selLink) cutLink(selLink); else removeSelection();
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { if (e.shiftKey) redo(); else undo(); e.preventDefault(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { redo(); e.preventDefault(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        sel = {};
        for (var i = 0; i < items.length; i++) if (items[i].t !== 'frame') sel[items[i].id] = true;
        renderSelection(); e.preventDefault();
      }
      if (e.key === 'Escape') {
        if (!$('reader').hidden) closeReader();
        else { sel = {}; renderSelection(); if (selLink) { selLink = null; drawLinks(); } }
      }
      var step = e.shiftKey ? 10 : 1;
      var moved = false;
      if (e.key === 'ArrowLeft') { nudge(-step, 0); moved = true; }
      if (e.key === 'ArrowRight') { nudge(step, 0); moved = true; }
      if (e.key === 'ArrowUp') { nudge(0, -step); moved = true; }
      if (e.key === 'ArrowDown') { nudge(0, step); moved = true; }
      if (moved) e.preventDefault();
    });

    document.addEventListener('keyup', function (e) {
      if (e.code === 'Space') { spaceDown = false; $('surface').classList.remove('is-spacing'); }
    });
  }

  /* A click on a card opens its reader; a note is read where it sits. */
  function openItem(it) {
    if (!it) return;
    if (it.t === 'src') { var s = srcOf(it); if (s) openReader(s, cardBySlug(it.c), it.id); }
    else if (it.t === 'q') openCaseReader(it.c, it.id);
    else if (it.t === 'v') openVerseReader(it.k, it.id);
    else if (it.t === 'd') openDocReader(it.k, it.id);
    else if (it.t === 'm') openMomentReader(it);
    else if (it.t === 'w') openWebReader(it);
  }

  /* A read-only field (a frame title not being renamed, a note while
     presenting) is not somewhere the reader is typing. */
  function isTyping(e) {
    var t = e.target;
    return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') && !t.readOnly;
  }

  function nudge(dx, dy) {
    var ids = Object.keys(sel);
    if (!ids.length) return;
    for (var i = 0; i < ids.length; i++) {
      var it = itemById(ids[i]);
      if (!it) continue;
      it.x += dx; it.y += dy;
      position(it);
    }
    drawLinks(); save();
  }

  function bringIntoView(it) {
    if (!it) return;
    var r = $('surface').getBoundingClientRect();
    var b = boxOf(it);
    tf.x = r.width / 2 - (b.x + b.w / 2) * tf.scale;
    tf.y = r.height / 2 - (b.y + b.h / 2) * tf.scale;
    applyTransform(); drawLinks();
  }

  /* ================= fit and tidy ================= */

  function bounds() {
    if (!items.length) return null;
    var x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    for (var i = 0; i < items.length; i++) {
      var b = boxOf(items[i]);
      x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y);
      x2 = Math.max(x2, b.x + b.w); y2 = Math.max(y2, b.y + b.h);
    }
    return { x1: x1, y1: y1, x2: x2, y2: y2 };
  }

  function fit() {
    var b = bounds();
    if (b) fitBox(b);
  }

  /* The view that fits box b inside the surface, less the padding on each
     side, no larger than maxScale. */
  function fitTarget(b, pad, maxScale, minScale) {
    pad = pad || { t: 56, r: 56, b: 56, l: 56 };
    var r = $('surface').getBoundingClientRect();
    var w = Math.max(1, r.width - pad.l - pad.r), h = Math.max(1, r.height - pad.t - pad.b);
    var bw = Math.max(1, b.x2 - b.x1), bh = Math.max(1, b.y2 - b.y1);
    var s = clamp(Math.min(w / bw, h / bh), minScale || MIN_Z, maxScale || 1.15);
    return { scale: s, x: pad.l + (w - bw * s) / 2 - b.x1 * s, y: pad.t + (h - bh * s) / 2 - b.y1 * s };
  }

  function fitBox(b) {
    var t = fitTarget(b);
    tf.x = t.x; tf.y = t.y; tf.scale = t.scale;
    applyTransform(); drawLinks();
  }

  /* TIDY puts the loose cards back into the case-file arrangement: the
     questions across the top, then FOR, THE OTHER STACK and AGAINST in
     columns, at the same 22px gap the board uses. */
  function tidy() {
    pushUndo();
    var framed = {};
    for (var f = 0; f < items.length; f++) {
      if (items[f].t !== 'frame') continue;
      var mem = membersOf(items[f]);
      for (var m = 0; m < mem.length; m++) framed[mem[m].id] = true;
    }
    var b = bounds();
    var ox = b ? Math.round(b.x1) : 60, oy = b ? Math.round(b.y1) : 60;
    var loose = items.filter(function (it) { return it.t !== 'frame' && !framed[it.id]; });
    var cols = { for: [], other: [], against: [] };
    var qx = ox, qh = 0, i;

    for (i = 0; i < loose.length; i++) {
      if (loose[i].t !== 'q') continue;
      loose[i].x = qx; loose[i].y = oy;
      position(loose[i]);
      var qe = nodeEl(loose[i].id);
      if (qe) qh = Math.max(qh, qe.offsetHeight);
      qx += Q_W + GAP;
    }
    for (i = 0; i < loose.length; i++) {
      var it = loose[i];
      if (it.t === 'q') continue;
      var s = srcOf(it);
      var side = s ? (s.side || 'for') : 'other';
      if (!cols[side]) side = 'other';
      it.w = it.t === 'note' ? NOTE_W : SRC_W;
      cols[side].push(it);
    }
    var top = oy + (qh ? qh + 60 : 150);
    hint('Tidied into the case-file arrangement. Framed cards were left where they are.');
    flowAndSettle([
      { list: cols.for, x: ox, y: top },
      { list: cols.other, x: ox + COL, y: top },
      { list: cols.against, x: ox + COL * 2, y: top }
    ], fit);
  }

  /* ================= the trays ================= */

  function renderTray() {
    renderPrepared();
    var cases = $('trayCases');
    cases.innerHTML = '';
    var ordered = DATA.cards.slice().sort(function (a, b) { return a.call < b.call ? -1 : 1; });
    for (var i = 0; i < ordered.length; i++) {
      (function (card) {
        var li = el('li');
        var btn = el('button', 'tray-case');
        btn.type = 'button';
        btn.setAttribute('data-slug', card.slug);
        btn.setAttribute('data-search', searchText([card.call, card.drawer, card.question, card.subtitle].concat(card.aliases || [])));
        btn.title = 'Open it here to browse. Drag it onto the desk to lay out the whole case.';
        btn.appendChild(el('small', null, card.call + ' · ' + card.sources.length + ' sources'));
        btn.appendChild(el('span', null, card.question));
        btn.addEventListener('click', function () {
          if (Date.now() - carryEndedAt < 400) return;
          openTrayCase(card.slug);
        });
        carriable(btn, { kind: 'case', slug: card.slug }, {});
        li.appendChild(btn);
        cases.appendChild(li);
      })(ordered[i]);
    }

    var byFam = {};
    for (var k = 0; k < flat.length; k++) {
      var fam = flat[k].fam;
      if (!byFam[fam.key]) byFam[fam.key] = { fam: fam, rows: [] };
      byFam[fam.key].rows.push(flat[k]);
    }
    var fams = Object.keys(byFam).map(function (key) { return byFam[key]; })
      .sort(function (a, b) { return a.fam.rank - b.fam.rank; });

    var wrap = $('trayFamilies');
    wrap.innerHTML = '';
    for (var g = 0; g < fams.length; g++) {
      (function (group) {
        var li = el('li', 'fam');
        var head = el('button', 'fam-head');
        head.type = 'button';
        head.setAttribute('aria-expanded', 'false');
        var sw = el('span', 'fam-swatch');
        sw.style.background = group.fam.sw;
        head.appendChild(sw);
        head.appendChild(el('span', 'fam-label', group.fam.label));
        head.appendChild(el('span', 'fam-n', String(group.rows.length)));
        head.appendChild(el('span', 'fam-caret', '›'));
        head.addEventListener('click', function () {
          var open = li.classList.toggle('is-open');
          head.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        li.appendChild(head);

        var ul = el('ul', 'fam-list');
        for (var r = 0; r < group.rows.length; r++) {
          (function (row) {
            var li2 = el('li');
            var b = el('button', 'fam-src side-' + (row.src.side || 'for'));
            b.type = 'button';
            b.setAttribute('data-src-id', 's:' + row.slug + ':' + row.i);
            b.setAttribute('data-search', searchText([row.title, row.tier, row.phrase, row.card.call, row.question]));
            b.appendChild(el('span', 'fs-tier', (row.src.tier || '').toUpperCase()));
            b.appendChild(el('span', 'fs-title', row.src.title || row.src.ref));
            b.title = 'Pin to the desk, or drag it where you want it — ' + row.card.call;
            b.addEventListener('click', function () {
              if (Date.now() - carryEndedAt < 400) return;
              pinSource(row);
            });
            carriable(b, { kind: 'src', slug: row.slug, i: row.i }, {});
            li2.appendChild(b);
            ul.appendChild(li2);
          })(group.rows[r]);
        }
        li.appendChild(ul);
        wrap.appendChild(li);
      })(fams[g]);
    }
    renderTrayPlaced();
  }

  /* Prepared desks: whole arguments laid out and kept in the repo
     (site/data/desks/). Opening one is the same as opening a shared link. */
  /* A desk marked listed: false in its file (the episode boards, for now) is left
     off the tray and the empty-desk offer, but its #desk=slug link still opens it. */
  function listedDesks() {
    return (LINKS.desks || []).filter(function (d) { return d.listed !== false; });
  }

  function renderPrepared() {
    var all = listedDesks();
    var ul = $('trayDesks');
    ul.innerHTML = '';
    $('trayDesksSection').hidden = !all.length;
    all.forEach(function (d) {
      var li = el('li');
      var b = el('button', 'tray-case tray-desk');
      b.type = 'button';
      b.setAttribute('data-desk', d.slug);
      b.setAttribute('data-search', searchText([d.title, d.subtitle, d.by]));
      b.appendChild(el('small', null, 'PREPARED · ' + d.desk.it.filter(function (x) { return x[0] !== 'f'; }).length + ' on the desk'));
      b.appendChild(el('span', null, d.title));
      b.title = d.subtitle;
      b.addEventListener('click', function () {
        if (location.hash === '#desk=' + d.slug) { if (presenting) exitPresent(); openShared({ json: JSON.stringify(d.desk), prepared: d }); presentFromHash(); }
        else location.hash = 'desk=' + d.slug;
      });
      li.appendChild(b);
      var pres = el('button', 'tray-present', '▶ PRESENT IT');
      pres.type = 'button';
      pres.title = 'Open this desk and walk it section by section, full screen';
      pres.addEventListener('click', function () {
        toggleFull(true);
        if (viewingShared && sharedMeta && sharedMeta.slug === d.slug) startPresent(0, false);
        else location.hash = 'desk=' + d.slug + '&present';
      });
      li.appendChild(pres);
      ul.appendChild(li);
    });
    renderEmptyStart();
  }

  /* An empty desk asks one question. The answers: a board already laid out,
     a case file (the whole case lays itself out), or a blank desk. */
  function renderEmptyStart() {
    var all = listedDesks(), box = $('emptyDesks');
    box.innerHTML = '';
    all.forEach(function (d) {
      var b = el('button', 'tool');
      b.type = 'button';
      b.setAttribute('data-desk', d.slug);
      b.appendChild(el('small', null, 'PREPARED · ' + d.desk.it.filter(function (x) { return x[0] !== 'f'; }).length + ' on the desk'));
      b.appendChild(document.createTextNode(d.title));
      b.title = d.subtitle || d.title;
      b.addEventListener('click', function () { location.hash = 'desk=' + d.slug; });
      box.appendChild(b);
    });
    if (!all.length) box.appendChild(el('p', 'small', 'None in this build yet.'));
    var cases = $('emptyCases');
    cases.innerHTML = '';
    var ordered = DATA.cards.slice().sort(function (a, b) { return a.call < b.call ? -1 : 1; });
    ordered.forEach(function (card) {
      var li = el('li');
      var btn = el('button', 'tray-case');
      btn.type = 'button';
      btn.setAttribute('data-empty-case', card.slug);
      btn.title = 'Lay the whole case out on the desk';
      btn.appendChild(el('small', null, card.call + ' · ' + card.sources.length + ' sources'));
      btn.appendChild(el('span', null, card.question));
      btn.addEventListener('click', function () {
        pullCase(card.slug);
        hint('Laid out ' + card.call + ': ' + card.sources.length + ' sources, for and against. Click any card to read it.');
      });
      li.appendChild(btn);
      cases.appendChild(li);
    });
  }

  /* The trays start closed on your own desk and open on a prepared one, where
     ON THIS DESK is the way around. Once you open or close them yourself, that
     holds. */
  var trayUserSet = false;
  function showTray(on) {
    $('tray').classList.toggle('is-collapsed', !on);
    $('btnAdd').setAttribute('aria-expanded', on ? 'true' : 'false');
    $('btnAdd').classList.toggle('is-on', on);
    setTimeout(drawLinks, 220);
  }
  function applyTrayDefault() {
    if (trayUserSet) return;
    showTray(!!viewingShared);
  }

  function renderTrayPlaced() {
    var btns = document.querySelectorAll('[data-src-id], [data-item-id]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('is-placed', has(btns[i].getAttribute('data-src-id') || btns[i].getAttribute('data-item-id')));
    }
  }

  /* ================= searching the trays and the desk =================
     One box filters everything in the trays, and lists what on the desk
     matches. With nothing typed, the desk list is its sections (frames), so a
     big board can be walked one section at a time. */

  function searchText(parts) {
    return parts.filter(function (x) { return !!x; }).join(' ').toLowerCase().replace(/[’‘]/g, "'");
  }

  function trayQuery() { return ($('tq').value || '').toLowerCase().replace(/[’‘]/g, "'").trim(); }

  function matches(text, q) {
    if (!q) return true;
    var words = q.split(/\s+/);
    for (var i = 0; i < words.length; i++) if (text.indexOf(words[i]) < 0) return false;
    return true;
  }

  function itemText(it) {
    if (it.t === 'src') { var s = srcOf(it); return s ? searchText([s.title || s.ref, s.tier, s.phrase, s.note]) : ''; }
    if (it.t === 'q') { var c = cardBySlug(it.c); return c ? searchText([c.call, c.drawer, c.question]) : ''; }
    if (it.t === 'v') { var v = LINKS.verses[it.k]; return v ? searchText([v.label, v.verses.map(function (x) { return x.text; }).join(' ')]) : ''; }
    if (it.t === 'd') { var d = LINKS.docs[it.k]; return d ? searchText([d.title, d.path]) : ''; }
    if (it.t === 'm') { var m = LINKS.moments && LINKS.moments[it.k]; return m ? searchText([m.phrase, m.label, it.sp, m.para && m.para.text]) : ''; }
    if (it.t === 'w') return searchText([it.title, it.quote, it.url]);
    if (it.t === 'note') return searchText([it.text]);
    if (it.t === 'frame') return searchText([it.title]);
    return '';
  }

  function itemLabel(it) {
    if (it.t === 'src') { var s = srcOf(it); return s ? (s.title || s.ref) : ''; }
    if (it.t === 'q') { var c = cardBySlug(it.c); return c ? c.question : ''; }
    if (it.t === 'v') return it.k;
    if (it.t === 'd') return LINKS.docs[it.k] ? LINKS.docs[it.k].title : it.k;
    if (it.t === 'm') { var mm = LINKS.moments && LINKS.moments[it.k]; return mm ? mm.label + ' · “' + mm.phrase + '”' : ''; }
    if (it.t === 'w') return it.title;
    if (it.t === 'note') { var t = (it.text || '').replace(/\s+/g, ' ').trim(); return t.length > 70 ? t.slice(0, 67) + '…' : t || '(empty note)'; }
    return it.title || 'UNTITLED';
  }

  var KIND = { src: 'SOURCE', q: 'QUESTION', v: 'VERSE', d: 'GO DEEPER', note: 'NOTE', frame: 'SECTION', m: 'MOMENT', w: 'OUTSIDE SOURCE' };

  function renderHere() {
    var q = trayQuery(), ul = $('trayHere');
    ul.innerHTML = '';
    var frames = items.filter(function (x) { return x.t === 'frame'; })
      .sort(readingOrder);
    var rows = frames.filter(function (f) { return matches(itemText(f), q); });
    if (q) {
      var hits = items.filter(function (x) { return x.t !== 'frame' && matches(itemText(x), q); });
      rows = rows.concat(hits.slice(0, 14));
    }
    rows.forEach(function (it) {
      var li = el('li');
      var b = el('button', 'here-row here-' + it.t);
      b.type = 'button';
      var kind = KIND[it.t] || '';
      if (it.t === 'frame') kind += ' · ' + membersOf(it).length + ' in it';
      b.appendChild(el('small', null, kind));
      b.appendChild(el('span', null, itemLabel(it)));
      b.title = 'Go to it on the desk';
      b.addEventListener('click', function () { focusOn(it); });
      li.appendChild(b);
      if (it.t === 'frame') {
        var play = el('button', 'here-play', '▶');
        play.type = 'button';
        play.title = 'Present from this section';
        play.setAttribute('aria-label', 'Present from ' + (it.title || 'this section'));
        play.addEventListener('click', function () { startPresent(slideIndexOf(it.id), true); });
        li.appendChild(play);
        li.className = 'has-play';
      }
      ul.appendChild(li);
    });
    $('trayHereNote').textContent = q ? 'On the desk now. Click one to go to it.' : 'The sections on this desk. Click one to go there.';
    $('trayHereSection').hidden = !rows.length;
    return rows.length;
  }

  /* Takes the view to a thing on the desk: a section fills the view, a card
     comes to the centre at a readable size, and either is briefly marked. */
  function focusOn(it) {
    if (!itemById(it.id)) return;
    if (it.t === 'frame') fitBox({ x1: it.x - 30, y1: it.y - 50, x2: it.x + it.w + 30, y2: it.y + it.h + 30 });
    else {
      var r = $('surface').getBoundingClientRect(), b = boxOf(it);
      tf.scale = clamp(Math.max(tf.scale, 0.9), MIN_Z, 1.15);
      tf.x = r.width / 2 - (b.x + b.w / 2) * tf.scale;
      tf.y = r.height / 2 - (b.y + b.h / 2) * tf.scale;
      applyTransform(); drawLinks();
    }
    sel = {}; sel[it.id] = true;
    renderSelection();
    var e = nodeEl(it.id);
    if (e) {
      e.classList.remove('is-found');
      void e.offsetWidth;
      e.classList.add('is-found');
      setTimeout(function () { e.classList.remove('is-found'); }, 1600);
    }
    hint((it.t === 'frame' ? 'Section: ' : '') + itemLabel(it));
  }

  function hostOf(row) { return row.parentNode && row.parentNode.tagName === 'LI' ? row.parentNode : row; }

  function shown(row) {
    var h = hostOf(row);
    return !h.hidden && !(h.closest && h.closest('.fam[hidden]'));
  }

  function filterTray() {
    var q = trayQuery();
    var listMode = $('trayOpen').hidden;
    var rows = $('tray').querySelectorAll('[data-search]');
    for (var i = 0; i < rows.length; i++) hostOf(rows[i]).hidden = !matches(rows[i].getAttribute('data-search'), q);
    /* A family opens when it holds a match, and closes again when the search is cleared. */
    var fams = $('trayFamilies').children;
    for (var f = 0; f < fams.length; f++) {
      var hits = fams[f].querySelectorAll('.fam-list > li:not([hidden])').length;
      fams[f].hidden = !!q && !hits;
      if (q && hits) { fams[f].classList.add('is-open'); fams[f].setAttribute('data-auto-open', '1'); }
      else if (!q && fams[f].getAttribute('data-auto-open')) { fams[f].classList.remove('is-open'); fams[f].removeAttribute('data-auto-open'); }
    }
    var any = 0;
    var section = function (id, listId, base) {
      var all = $(listId).querySelectorAll('[data-search]'), vis = 0;
      for (var k = 0; k < all.length; k++) if (shown(all[k])) vis++;
      $(id).hidden = !listMode || !base || !all.length || (!!q && !vis);
      if (!$(id).hidden) any += vis;
    };
    section('trayDesksSection', 'trayDesks', (LINKS.desks || []).length);
    section('trayCasesSection', 'trayCases', true);
    section('trayFamiliesSection', 'trayFamilies', true);
    if (!listMode) {
      var open = $('trayOpen').querySelectorAll('[data-search]');
      for (var o = 0; o < open.length; o++) if (shown(open[o])) any++;
    }
    var here = renderHere();
    $('trayNone').hidden = !q || any > 0 || here > 0;
  }

  /* ================= present mode =================
     A desk shown one section at a time: an overview of the whole board, then
     every frame in reading order. The camera glides between sections, the
     section on screen stays lit and the rest of the board dims, and nothing
     can be moved by accident. Arrow keys, space and page keys move; a card
     can still be clicked to read it. */

  var presenting = null;     // { slides, i, before, full, anim, idle }
  var presFocus = null;      // id -> true for the section on screen, null for the overview
  var PRES_PAD = { t: 70, r: 64, b: 96, l: 64 };     // minimums; the caption and bar are measured per slide

  /* Rows first, then left to right; frames whose tops are within a card's
     height of each other count as one row. */
  /* ================= phones: the desk as a list =================
     A phone gets the desk as a list it can scroll: the sections in reading
     order, every card tappable to read, every string shown as "tied to".
     Nothing is lost; OPEN AS A DESK gives the real surface. */

  var PHONE = window.matchMedia ? window.matchMedia('(max-width: 820px)') : null;
  var phoneDesk = false;     // a phone reader asked for the real desk

  function isPhone() { return !!(PHONE && PHONE.matches); }
  function phoneReading() { return isPhone() && !phoneDesk && !presenting; }

  function applyPhone() {
    var on = phoneReading();
    if (!on && phoneWalk != null) endPhoneWalk();
    document.body.classList.toggle('phone-reading', on);
    document.body.classList.toggle('phone-desk', isPhone() && phoneDesk);
    $('phoneList').hidden = !on;
    if (on) renderPhone();
  }

  /* Cards in a section stand in columns: down each column, then the next. */
  function columnOrder(a, b) { return Math.abs(a.x - b.x) < 60 ? a.y - b.y : a.x - b.x; }

  function phoneSel(id) {
    var s = window.CSS && CSS.escape ? CSS.escape(id) : String(id).replace(/["\\]/g, '\\$&');
    return '[data-phone-id="' + s + '"]';
  }

  /* The thread a reader follows on a phone opens in place; nothing is pinned. */
  function openThing(p) {
    if (p.kind === 'src') { var c = cardBySlug(p.slug); if (c && c.sources[p.i]) openReader(c.sources[p.i], c, null); }
    else if (p.kind === 'v') openVerseReader(p.key, null);
    else if (p.kind === 'd') openDocReader(p.path, null);
    else if (p.kind === 'case') openCaseReader(p.slug, null);
  }

  function phoneCard(it) {
    var build = { src: buildSrcNode, q: buildQNode, v: buildVerseNode, d: buildDocNode,
                  m: buildMomentNode, w: buildWebNode, note: buildNoteNode }[it.t];
    var n = build && build(it);
    if (!n) return null;
    n.removeAttribute('data-id');
    var tl = n.querySelector('.node-tools');
    if (tl) tl.parentNode.removeChild(tl);
    var ta = n.querySelector('textarea');
    if (ta) ta.parentNode.replaceChild(el('p', 'note-text', it.text || ''), ta);
    else n.addEventListener('click', function (e) { if (e.target.closest('a')) return; e.preventDefault(); openItem(it); });
    var row = el('div', 'phone-item');
    row.setAttribute('data-phone-id', it.id);
    row.appendChild(n);
    var tied = [];
    links.forEach(function (l) {
      var o = l.a === it.id ? l.b : (l.b === it.id ? l.a : null);
      var oi = o && itemById(o);
      if (oi && oi.t !== 'frame') tied.push({ it: oi, words: l.words || '' });
    });
    if (tied.length) {
      var w = el('div', 'phone-ties');
      w.appendChild(el('span', 'eyebrow', 'TIED TO'));
      tied.forEach(function (t) {
        var o = t.it, b = el('button');
        b.type = 'button';
        if (t.words) b.appendChild(el('em', 'tie-words', t.words));
        b.appendChild(document.createTextNode(itemLabel(o)));
        b.addEventListener('click', function () { phoneGo(o.id); });
        w.appendChild(b);
      });
      row.appendChild(w);
    }
    return row;
  }

  function phoneGo(id) {
    var r = $('phoneBody').querySelector(phoneSel(id));
    if (!r) return;
    r.scrollIntoView({ block: 'start' });
    r.classList.remove('is-found');
    void r.offsetWidth;
    r.classList.add('is-found');
    setTimeout(function () { r.classList.remove('is-found'); }, 1600);
  }

  function renderPhone() {
    $('phoneEyebrow').textContent = !viewingShared ? 'THE DESK' : !sharedMeta ? 'A SHARED DESK' :
      sharedMeta.file ? 'A DESK FROM A FILE' : 'A PREPARED DESK';
    $('phoneTitle').textContent = viewingShared ? (sharedMeta ? sharedMeta.title : 'Someone’s desk, from a link') : 'Your desk';
    $('phoneSub').textContent = viewingShared && sharedMeta ? (sharedMeta.subtitle || '') : '';
    var body = $('phoneBody'), toc = $('phoneToc');
    body.innerHTML = ''; toc.innerHTML = '';
    $('btnPhonePresent').hidden = !items.length;
    if (!items.length) {
      var e = el('div', 'phone-empty');
      e.appendChild(el('p', null, 'Nothing on your desk yet. Open one of the prepared desks:'));
      listedDesks().forEach(function (d) {
        var b = el('button', 'tool', d.title);
        b.type = 'button';
        b.addEventListener('click', function () { location.hash = 'desk=' + d.slug; });
        e.appendChild(b);
      });
      e.appendChild(el('p', null, 'Or OPEN AS A DESK to start your own.'));
      body.appendChild(e);
      return;
    }
    /* Each card belongs to the first section it sits in; the rest are loose:
       those above the first section open the list, any others close it. */
    var frames = items.filter(function (x) { return x.t === 'frame'; }).sort(readingOrder);
    var placed = {}, groups = [];
    frames.forEach(function (f) {
      var m = membersOf(f).filter(function (x) { return !placed[x.id]; });
      m.forEach(function (x) { placed[x.id] = true; });
      groups.push({ frame: f, title: f.title || 'UNTITLED', items: m.sort(columnOrder) });
    });
    var loose = items.filter(function (x) { return x.t !== 'frame' && !placed[x.id]; });
    var top = frames.length ? frames[0].y : Infinity;
    var head = loose.filter(function (x) { return x.y < top; }).sort(columnOrder);
    var rest = loose.filter(function (x) { return x.y >= top; }).sort(readingOrder);
    if (head.length) groups.unshift({ frame: null, title: '', items: head });
    if (rest.length) groups.push({ frame: null, title: 'ELSEWHERE ON THE DESK', items: rest });
    groups.forEach(function (g, gi) {
      var sec = el('section', 'phone-sec');
      sec.id = 'phone-sec-' + gi;
      /* Present mode counts the overview as slide 0 and each frame from 1. */
      sec.setAttribute('data-slide', g.frame ? frames.indexOf(g.frame) + 1 : 0);
      sec.setAttribute('data-title', g.title || (sharedMeta ? sharedMeta.title : 'Your desk'));
      if (g.frame) sec.style.setProperty('--fc', FRAME_COLORS[g.frame.ci || 0]);
      if (g.title) {
        sec.appendChild(el('h2', 'phone-sec-title', g.title));
        var tb = el('button', null, g.title);
        tb.type = 'button';
        if (g.frame) tb.style.setProperty('--fc', FRAME_COLORS[g.frame.ci || 0]);
        tb.addEventListener('click', function () { sec.scrollIntoView({ block: 'start' }); });
        toc.appendChild(tb);
      }
      g.items.forEach(function (it) { var r = phoneCard(it); if (r) sec.appendChild(r); });
      body.appendChild(sec);
    });
    if (phoneWalk != null) showWalk(phoneWalk, true);
  }

  /* ================= phones: walking the sections =================
     PRESENT on a phone does not shrink the whole board into the screen; it
     walks the list one section at a time, cards at reading size. ‹ › or a
     sideways swipe move; THE LIST goes back to scrolling. */

  var phoneWalk = null;      // the section index being shown, or null

  function walkSecs() { return [].slice.call($('phoneBody').querySelectorAll('.phone-sec')); }

  function startPhoneWalk(slide) {
    var secs = walkSecs();
    if (!secs.length) return;
    /* A present slide number maps to the section showing that frame. */
    var at = 0;
    for (var i = 0; i < secs.length; i++) if (+secs[i].getAttribute('data-slide') === slide && slide > 0) { at = i; break; }
    closeReader();
    document.body.classList.add('phone-walk');
    $('phoneWalkBar').hidden = false;
    showWalk(at);
  }

  function showWalk(i, quiet) {
    var secs = walkSecs();
    if (!secs.length) { endPhoneWalk(); return; }
    phoneWalk = clamp(i, 0, secs.length - 1);
    secs.forEach(function (s, k) { s.classList.toggle('is-walk', k === phoneWalk); });
    $('phoneWalkAt').textContent = (phoneWalk + 1) + ' / ' + secs.length + ' · ' + secs[phoneWalk].getAttribute('data-title');
    $('phoneWalkPrev').disabled = phoneWalk === 0;
    $('phoneWalkNext').disabled = phoneWalk === secs.length - 1;
    if (!quiet) window.scrollTo(0, 0);
  }

  function endPhoneWalk() {
    var at = phoneWalk;
    phoneWalk = null;
    document.body.classList.remove('phone-walk');
    $('phoneWalkBar').hidden = true;
    walkSecs().forEach(function (s) { s.classList.remove('is-walk'); });
    var sec = walkSecs()[at || 0];
    if (sec && at) sec.scrollIntoView({ block: 'start' }); else window.scrollTo(0, 0);
  }

  function wirePhone() {
    $('btnPhoneDesk').addEventListener('click', function () {
      phoneDesk = true;
      applyPhone();
      requestAnimationFrame(function () {
        fit(); drawLinks();
        document.querySelector('.desk-tools').scrollIntoView({ block: 'start' });
      });
    });
    $('btnPhoneList').addEventListener('click', function () {
      phoneDesk = false;
      closeReader();
      applyPhone();
      window.scrollTo(0, 0);
    });
    $('btnPhonePresent').addEventListener('click', function () { startPhoneWalk(0); });
    $('phoneWalkPrev').addEventListener('click', function () { showWalk(phoneWalk - 1); });
    $('phoneWalkNext').addEventListener('click', function () { showWalk(phoneWalk + 1); });
    $('phoneWalkExit').addEventListener('click', function () { endPhoneWalk(); });
    /* A sideways swipe turns the page; an upward or downward one still scrolls. */
    var sw = null;
    $('phoneBody').addEventListener('touchstart', function (e) {
      sw = phoneWalk != null && e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    }, { passive: true });
    $('phoneBody').addEventListener('touchend', function (e) {
      if (!sw || phoneWalk == null) return;
      var t = e.changedTouches[0], dx = t.clientX - sw.x, dy = t.clientY - sw.y;
      sw = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > 2 * Math.abs(dy)) showWalk(phoneWalk + (dx < 0 ? 1 : -1));
    }, { passive: true });
    document.addEventListener('keydown', function (e) {
      if (phoneWalk == null || isTyping(e) || !$('reader').hidden) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { showWalk(phoneWalk + 1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { showWalk(phoneWalk - 1); e.preventDefault(); }
      else if (e.key === 'Escape') { endPhoneWalk(); e.preventDefault(); }
    });
    if (!PHONE) return;
    var wasReading = false;   // a walk-through put away when the window went narrow
    var changed = function () {
      /* A prepared board's walk-through is for wide screens; a window turned
         or narrowed to phone width gets the list, and the walk-through comes
         back when it widens again. */
      if (isPhone() && presenting && presenting.reading) { wasReading = true; exitPresent(); }
      var was = document.body.classList.contains('phone-reading');
      applyPhone();
      if (!isPhone() && wasReading && !phoneDesk && viewingShared && items.length) { wasReading = false; presentFromHash(); return; }
      if (was && !phoneReading() && items.length) requestAnimationFrame(function () { fit(); drawLinks(); });
    };
    if (PHONE.addEventListener) PHONE.addEventListener('change', changed);
    else if (PHONE.addListener) PHONE.addListener(changed);
  }

  function readingOrder(a, b) { return Math.abs(a.y - b.y) < 120 ? a.x - b.x : a.y - b.y; }

  function presentSlides() {
    var frames = items.filter(function (x) { return x.t === 'frame'; }).sort(readingOrder);
    return [{ kind: 'overview' }].concat(frames.map(function (f) { return { kind: 'frame', id: f.id }; }));
  }

  function slideIndexOf(frameId) {
    var s = presentSlides();
    for (var i = 0; i < s.length; i++) if (s[i].id === frameId) return i;
    return 0;
  }

  /* ⋯ MORE holds what is used rarely: opening a file, the JSON, clearing. */
  function toggleMore(open) {
    var m = $('moreMenu'), on = open == null ? m.hidden : open;
    m.hidden = !on;
    $('btnMore').setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) m.querySelector('button').focus();
  }
  function closeMore() { if (!$('moreMenu').hidden) toggleMore(false); }

  /* reading: the walk-through a prepared board opens in, under the header and
     inside the frame. Full screen from there is the ordinary show. */
  function startPresent(at, full, reading) {
    if (!items.length) { hint('There is nothing on the desk to present yet.'); return; }
    /* On a phone's list, every way in (the button, the P key, a link) walks
       the list instead of shrinking the board into the screen. */
    if (phoneReading()) { startPhoneWalk(at || 0); return; }
    closeMore();
    if (presenting) { goSlide(at || 0); return; }
    closeReader();
    toggleHelp(false);
    var slides = presentSlides();
    presenting = { slides: slides, i: 0, before: { x: tf.x, y: tf.y, scale: tf.scale }, full: false, anim: 0, idle: 0, reading: !!reading };
    sel = {}; renderSelection();
    document.body.classList.add('presenting');
    document.body.classList.toggle('reading', !!reading);
    $('presWork').hidden = !reading;
    $('presExit').hidden = !!reading;
    $('presKeys').textContent = reading ? '← → move · click a card to read it' : '← → move · click a card to read it · Esc ends';
    applyPhone();
    setNotesReadOnly(true);
    buildDots();
    $('presCaption').hidden = false;
    $('presBar').hidden = false;
    wakeBar();
    if (full) toggleFull(true);
    /* The surface has just changed size; fit once the browser has laid it out. */
    requestAnimationFrame(function () { requestAnimationFrame(function () { goSlide(clamp(at || 0, 0, slides.length - 1), true); }); });    /* The caption is measured to keep the board clear of it; measure again once the
       faces have arrived, or a title set in the fallback font sits on the cards. */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (presenting) goSlide(presenting.i, true); });
    setTimeout(function () { if (presenting) goSlide(presenting.i, true); }, 900);
  }

  function exitPresent() {
    var P = presenting;
    if (!P) return;
    presenting = null; presFocus = null;
    cancelAnimationFrame(P.anim);
    clearTimeout(P.idle);
    document.body.classList.remove('presenting', 'pres-idle', 'reading');
    applyPhone();
    $('presCaption').hidden = true;
    $('presBar').hidden = true;
    setNotesReadOnly(false);
    applySpotlight();
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () { /* already out */ });
    if (/[#&]present/.test(location.hash)) {
      var h = location.hash.replace(/&?present(=\d+)?/, '').replace(/^#&/, '#');
      history.replaceState(null, '', location.pathname + location.search + (h === '#' ? '' : h));
    }
    requestAnimationFrame(function () {
      tf.x = P.before.x; tf.y = P.before.y; tf.scale = P.before.scale;
      applyTransform(); drawLinks();
    });
    hint(P.reading ? 'The workbench. Move anything, add sources from the trays, tie your own string. KEEP THIS AS MY DESK saves it as yours.' :
      'Presentation ended. Press P, or the PRESENT button, to start again.');
  }

  function goSlide(i, instant) {
    var P = presenting;
    if (!P) return;
    i = clamp(i, 0, P.slides.length - 1);
    P.i = i;
    var s = P.slides[i], box, f = s.kind === 'frame' ? itemById(s.id) : null;
    if (f) {
      presFocus = {};
      presFocus[f.id] = true;
      membersOf(f).forEach(function (m) { presFocus[m.id] = true; });
      box = { x1: f.x - 24, y1: f.y - 36, x2: f.x + f.w + 24, y2: f.y + f.h + 24 };
      $('presEyebrow').textContent = (P.reading && sharedMeta ? sharedMeta.title.toUpperCase() + ' · ' : '') + 'SECTION ' + i + ' OF ' + (P.slides.length - 1);
      $('presTitle').textContent = f.title || 'UNTITLED';
      $('presSub').textContent = membersOf(f).length + ' on the board in this section';
    } else {
      presFocus = null;
      box = bounds();
      $('presEyebrow').textContent = P.slides.length > 1 ? 'OVERVIEW · ' + (P.slides.length - 1) + ' SECTIONS' : 'OVERVIEW';
      $('presTitle').textContent = sharedMeta ? sharedMeta.title : 'This desk';
      $('presSub').textContent = P.slides.length > 1 ? (sharedMeta ? sharedMeta.subtitle : 'Press → to walk it section by section.') :
        'Frames become slides: put + FRAME around a group of cards and each one becomes a section here.';
    }
    /* The board fits between the caption and the bar, measured each slide,
       so a long title or a two-line subtitle never sits on the cards. */
    var sr = $('surface').getBoundingClientRect();
    var cap = $('presCaption').getBoundingClientRect(), bar = $('presBar').getBoundingClientRect();
    var pad = { t: Math.max(PRES_PAD.t, cap.bottom - sr.top + 26), r: PRES_PAD.r, l: PRES_PAD.l,
                b: Math.max(PRES_PAD.b, sr.bottom - bar.top + 22) };
    /* Reading in the frame, the whole-board map may need to go smaller than the
       desk's zoom floor; it is a map, not a page to read. */
    if (box) animateTo(fitTarget(box, pad, 1.8, P.reading && !f ? 0.1 : MIN_Z), instant ? 0 : 700);
    applySpotlight(); drawLinks();
    var dots = $('presDots').children;
    for (var d = 0; d < dots.length; d++) {
      dots[d].classList.toggle('is-on', d === i);
      dots[d].setAttribute('aria-selected', d === i ? 'true' : 'false');
    }
    $('presPrev').disabled = i === 0;
    $('presNext').disabled = i === P.slides.length - 1;
  }

  /* The camera glides: centre and zoom are interpolated, the zoom on a log
     scale, so a move between distant sections reads as one smooth motion. */
  function animateTo(t, ms) {
    var P = presenting;
    cancelAnimationFrame(P ? P.anim : 0);
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var set = function (x, y, s) { tf.x = x; tf.y = y; tf.scale = s; $('world').style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) scale(' + s + ')'; };
    if (!ms || reduce) { set(t.x, t.y, t.scale); drawLinks(); return; }
    var r = $('surface').getBoundingClientRect(), cx = r.width / 2, cy = r.height / 2;
    var a = { s: tf.scale, wx: (cx - tf.x) / tf.scale, wy: (cy - tf.y) / tf.scale };
    var b = { s: t.scale, wx: (cx - t.x) / t.scale, wy: (cy - t.y) / t.scale };
    var t0 = performance.now();
    var step = function (now) {
      var k = Math.min(1, (now - t0) / ms);
      var e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      var s = Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * e);
      var wx = a.wx + (b.wx - a.wx) * e, wy = a.wy + (b.wy - a.wy) * e;
      set(cx - wx * s, cy - wy * s, s);
      if (k < 1 && presenting) presenting.anim = requestAnimationFrame(step);
      else { set(t.x, t.y, t.scale); drawLinks(); }
    };
    if (P) P.anim = requestAnimationFrame(step);
  }

  function applySpotlight() {
    var ns = $('nodes').children, fr = $('frames').children, i;
    for (i = 0; i < ns.length; i++) ns[i].classList.toggle('pres-dim', !!presFocus && !presFocus[ns[i].getAttribute('data-id')]);
    for (i = 0; i < fr.length; i++) fr[i].classList.toggle('pres-dim', !!presFocus && !presFocus[fr[i].getAttribute('data-id')]);
  }

  function setNotesReadOnly(on) {
    var tas = $('nodes').querySelectorAll('textarea');
    for (var i = 0; i < tas.length; i++) tas[i].readOnly = on;
  }

  function buildDots() {
    var wrap = $('presDots');
    wrap.innerHTML = '';
    presenting.slides.forEach(function (s, i) {
      var b = el('button', 'pres-dot' + (s.kind === 'overview' ? ' is-overview' : ''));
      b.type = 'button';
      b.setAttribute('role', 'tab');
      var f = s.kind === 'frame' ? itemById(s.id) : null;
      b.title = f ? i + ' · ' + f.title : 'Overview';
      b.setAttribute('aria-label', b.title);
      b.addEventListener('click', function () { this.blur(); closeReader(); goSlide(i); });
      wrap.appendChild(b);
    });
  }

  /* Full screen is the browser's to grant, and only on a click or a key. */
  function toggleFull(on) {
    var want = on == null ? !document.fullscreenElement : on;
    if (want && !document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(function () { /* refused: the window still fills */ });
    } else if (!want && document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(function () { /* already out */ });
    }
  }

  /* The bar fades when the pointer rests, like a slideshow, and comes back on any movement. */
  function wakeBar(e) {
    var P = presenting;
    if (!P) return;
    document.body.classList.remove('pres-idle');
    clearTimeout(P.idle);
    if (e && e.target && e.target.closest && e.target.closest('.pres-bar')) return;
    P.idle = setTimeout(function () { if (presenting) document.body.classList.add('pres-idle'); }, 2600);
  }

  function presentLink() {
    var base = location.origin + location.pathname;
    var at = presenting ? presenting.i : 0;
    if (viewingShared && sharedMeta && sharedMeta.slug && deskSig() === sharedSig) return base + '#desk=' + sharedMeta.slug + '&present=' + at;
    return base + '#b=' + encodeURIComponent(encode()) + '&present=' + at;
  }

  /* Keys while presenting. Returns true when the key was the presentation's. */
  function presentKey(e) {
    if (!presenting) return false;
    var k = e.key, last = presenting.slides.length - 1;
    if (k === 'Escape') { if (!$('reader').hidden) closeReader(); else exitPresent(); }
    else if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey)) { closeReader(); goSlide(presenting.i + 1); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey)) { closeReader(); goSlide(presenting.i - 1); }
    else if (k === 'Home' || k === 'o' || k === 'O') { closeReader(); goSlide(0); }
    else if (k === 'End') { closeReader(); goSlide(last); }
    else if (/^[0-9]$/.test(k)) { closeReader(); goSlide(+k); }
    else if (k === 'f' || k === 'F') toggleFull();
    /* Nothing on a presented desk is deleted, undone or nudged by accident. */
    else if (k === 'Delete' || k === 'Backspace' || ((e.ctrlKey || e.metaKey) && /^[az]$/i.test(k))) { /* swallowed */ }
    else return false;
    e.preventDefault();
    return true;
  }

  function wirePresent() {
    $('btnPresent').addEventListener('click', function () { this.blur(); startPresent(0, true); });
    $('presPrev').addEventListener('click', function () { this.blur(); closeReader(); goSlide(presenting.i - 1); });
    $('presNext').addEventListener('click', function () { this.blur(); closeReader(); goSlide(presenting.i + 1); });
    $('presOverview').addEventListener('click', function () { this.blur(); closeReader(); goSlide(0); });
    $('presFull').addEventListener('click', function () { this.blur(); toggleFull(); });
    $('presExit').addEventListener('click', function () { this.blur(); exitPresent(); });
    $('presWork').addEventListener('click', function () { this.blur(); exitPresent(); });
    $('presLink').addEventListener('click', function () { copyText(presentLink(), this); this.blur(); });
    /* The bar and caption are not the desk: no panning starts on them. */
    ['presBar', 'presCaption'].forEach(function (id) {
      $(id).addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    });
    document.addEventListener('mousemove', wakeBar);
    document.addEventListener('fullscreenchange', function () {
      if (!presenting) return;
      if (document.fullscreenElement) presenting.full = true;
      else if (presenting.full && presenting.reading) presenting.full = false;   // back to reading in the frame
      else if (presenting.full) { exitPresent(); return; }   // Esc in full screen ends the show, as in any slideshow
      goSlide(presenting.i, true);
    });
    window.addEventListener('resize', function () { if (presenting) goSlide(presenting.i, true); });
  }

  /* canvas.html#desk=<slug>&present[=n] opens straight into the show. */
  function presentFromHash() {
    var m = /[#&]present(?:=(\d+))?(?:&|$)/.exec(location.hash);
    if (m && phoneReading()) { startPhoneWalk(m[1] ? +m[1] : 0); return; }
    if (m) { startPresent(m[1] ? +m[1] : 0, false); return; }
    /* A prepared board opens as a walk-through, not as a workbench. */
    if (viewingShared && sharedMeta && sharedMeta.slug && !isPhone() && items.length) startPresent(presentSlides().length > 1 ? 1 : 0, false, true);
  }

  /* ================= a case file, open in the tray =================
     The Reading Room's case file, small enough to read beside the desk. Every
     piece of it can be dragged out; a source pinned from here ties back to
     its question if the question is already down. */

  function openTrayCase(slug) {
    var card = cardBySlug(slug);
    if (!card) return;
    trayUserSet = true;
    showTray(true);
    $('trayCasesSection').hidden = true;
    $('trayFamiliesSection').hidden = true;
    $('trayDesksSection').hidden = true;
    var w = $('trayOpen');
    w.innerHTML = '';
    w.hidden = false;
    var qid = 'q:' + slug;
    var ctx = { tray: true, origin: function () { return itemById(qid) ? qid : null; } };

    var back = el('button', 'tray-back', '‹ ALL CASE FILES');
    back.type = 'button';
    back.addEventListener('click', closeTrayCase);
    w.appendChild(back);

    var head = el('button', 'tray-qcard');
    head.type = 'button';
    head.title = 'Drag onto the desk to lay out the whole case';
    head.appendChild(el('span', 'pin red'));
    head.appendChild(el('div', 'eyebrow', card.call + ' · ' + card.drawer));
    head.appendChild(el('div', 'qtext', card.question));
    carriable(head, { kind: 'case', slug: slug }, {});
    w.appendChild(head);

    var lay = el('button', 'tool tray-lay', 'LAY OUT THE WHOLE CASE');
    lay.type = 'button';
    lay.addEventListener('click', function () { pullCase(slug); });
    w.appendChild(lay);

    /* The finding is clamped to a few lines so the sources below it are in
       reach without scrolling; one click reads the rest. */
    w.appendChild(el('div', 'eyebrow', 'THE FINDING'));
    var f = el('p', 'tray-finding is-clamped');
    f.appendChild(linkify(card.finding, ctx));
    w.appendChild(f);
    var more = el('button', 'tray-more', 'read the whole finding');
    more.type = 'button';
    more.addEventListener('click', function () {
      var clamped = f.classList.toggle('is-clamped');
      more.textContent = clamped ? 'read the whole finding' : 'less';
    });
    w.appendChild(more);

    var labels = card.boardLabels || {};
    var sides = [['for', labels.for || 'FOR'], ['other', labels.other || 'THE OTHER STACK'], ['against', labels.against || 'AGAINST']];
    sides.forEach(function (sd) {
      var rows = [];
      card.sources.forEach(function (s, i) { if ((s.side || 'for') === sd[0]) rows.push(i); });
      if (!rows.length) return;
      w.appendChild(el('div', 'eyebrow tray-side', sd[1] + ' · ' + rows.length));
      var ul = el('ul', 'tray-pins');
      rows.forEach(function (i) {
        var s = card.sources[i];
        var p = { kind: 'src', slug: slug, i: i };
        var li = el('li');
        var b = el('button', 'fam-src side-' + sd[0]);
        b.type = 'button';
        b.setAttribute('data-item-id', thingId(p));
        b.setAttribute('data-search', searchText([s.title || s.ref, s.tier, s.phrase, s.note]));
        b.title = 'Click to pin it, or drag it where you want it';
        b.appendChild(el('span', 'fs-tier', (s.tier || '').toUpperCase()));
        b.appendChild(el('span', 'fs-title', s.title || s.ref));
        b.appendChild(el('span', 'fs-stamp ' + (s.status === 'held' ? 'held' : 'not-held'), s.status === 'held' ? 'HELD' : 'NOT YET HELD'));
        b.addEventListener('click', function () {
          if (Date.now() - carryEndedAt < 400) return;
          spawn(p, ctx.origin(), null);
        });
        carriable(b, p, ctx);
        li.appendChild(b);
        ul.appendChild(li);
      });
      w.appendChild(ul);
    });

    var trayGroup = function (label, chips) {
      if (!chips.length) return;
      w.appendChild(el('div', 'eyebrow tray-side', label));
      var row = el('div', 'chips');
      chips.forEach(function (c) { row.appendChild(c); });
      w.appendChild(row);
    };
    trayGroup('VERSES THIS CASE CITES', versesOf(slug).map(function (k) { return chip({ kind: 'v', key: k }, k, ctx); }));
    trayGroup('NEXT IN THE DRAWER', compact((card.next || []).map(function (s) { return caseChip(s, ctx); })));
    trayGroup('GO DEEPER · in the repo', compact((card.goDeeper || []).map(function (g) { return docChip(g.path, ctx); })));

    $('tray').scrollTop = 0;
    renderTrayPlaced();
    filterTray();
  }

  function closeTrayCase() {
    $('trayOpen').hidden = true;
    $('trayOpen').innerHTML = '';
    $('trayCasesSection').hidden = false;
    $('trayFamiliesSection').hidden = false;
    $('trayDesksSection').hidden = !(LINKS.desks || []).length;
    $('tray').scrollTop = 0;
    filterTray();
  }

  function pinSource(row) {
    var c = viewCenter();
    var spot = freeSpot(Math.round(c.x), Math.round(c.y), SRC_W, 150);
    pushUndo();
    var it = addSource(row.slug, row.i, spot.x, spot.y);
    if (!it) { hint('That one is already on the desk.'); cancelUndo(); return; }
    renderAll(); save();
    hint('Pinned ' + (row.src.title || row.src.ref) + ' from ' + row.card.call + '.');
  }

  /* ================= search: retrieve, never generate ================= */

  function buildFlat() {
    flat = [];
    for (var c = 0; c < DATA.cards.length; c++) {
      var card = DATA.cards[c];
      for (var i = 0; i < card.sources.length; i++) {
        var src = card.sources[i];
        flat.push({
          slug: card.slug, i: i, card: card, src: src,
          fam: familyOf(src.tier),
          title: src.title || src.ref || '',
          phrase: src.phrase || '',
          tier: src.tier || '',
          note: src.note || '',
          question: card.question
        });
      }
    }
    fuse = new Fuse(flat, {
      keys: [
        { name: 'title', weight: 0.34 },
        { name: 'phrase', weight: 0.26 },
        { name: 'tier', weight: 0.14 },
        { name: 'question', weight: 0.14 },
        { name: 'note', weight: 0.12 }
      ],
      threshold: 0.45, ignoreLocation: true, includeScore: true, minMatchCharLength: 3
    });
  }

  function searchSources(q) {
    if (!q.trim()) return [];
    return fuse.search(q, { limit: 8 }).map(function (r) { return r.item; });
  }

  /* Prose references are matched by their written capitals; a typed search
     is not, so "hosea 6:6" is read as "Hosea 6:6". */
  function heldRefs(q) {
    var typed = q.replace(/(^|\s)([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); });
    return refRuns(typed).filter(function (r) { return !!r.key; }).map(function (r) { return r.key; });
  }

  function showSuggest(q) {
    var ul = $('dsuggest'), input = $('dq');
    var res = searchSources(q);
    ul.innerHTML = '';
    var keys = heldRefs(q);
    for (var k = 0; k < keys.length; k++) {
      (function (key) {
        var li = el('li');
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        li.appendChild(document.createTextNode(key));
        li.appendChild(el('small', null, 'SCRIPTURE · KJV · HELD · cited on ' + LINKS.verses[key].mentioned.length + ' case file' +
          (LINKS.verses[key].mentioned.length === 1 ? '' : 's')));
        li.addEventListener('mousedown', function (e) { e.preventDefault(); spawn({ kind: 'v', key: key }, null, null); ul.hidden = true; });
        ul.appendChild(li);
      })(keys[k]);
    }
    if (!res.length && !keys.length) { ul.hidden = true; input.setAttribute('aria-expanded', 'false'); return; }
    for (var i = 0; i < res.length; i++) {
      (function (row, first) {
        var li = el('li');
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', first ? 'true' : 'false');
        li.appendChild(document.createTextNode(row.title));
        li.appendChild(el('small', null, (row.tier || '').toUpperCase() + ' · ' + row.card.call +
          ' · ' + (row.src.statusText || '')));
        li.addEventListener('mousedown', function (e) { e.preventDefault(); pinSource(row); ul.hidden = true; });
        ul.appendChild(li);
      })(res[i], i === 0);
    }
    ul.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  function submitSearch(e) {
    e.preventDefault();
    $('dsuggest').hidden = true;
    var q = $('dq').value;
    if (!q.trim()) return;
    /* A typed reference the cards cite comes onto the desk as its verse card. */
    var keys = heldRefs(q);
    if (keys.length) {
      for (var k = 0; k < keys.length; k++) spawn({ kind: 'v', key: keys[k] }, null, null);
      return;
    }
    var res = searchSources(q);
    if (!res.length) {
      hint('Nothing held matches that. The desk only lays out sources the build already verified, so a gap here is a real gap: ' +
        'ask for a card in the repo and it goes on the research list.');
      return;
    }
    pushUndo();
    var at = landingSpot();
    var added = [], skipped = 0;
    for (var i = 0; i < res.length && added.length < 6; i++) {
      var it = addSource(res[i].slug, res[i].i, at.x, at.y);
      if (it) added.push(it); else skipped++;
    }
    if (!added.length) { cancelUndo(); hint('Those are all on the desk already.'); return; }
    renderAll();
    hint('Pinned ' + added.length + ' held source' + (added.length === 1 ? '' : 's') + ' for “' + q + '”' +
      (skipped ? ', skipped ' + skipped + ' already down' : '') + '. Nothing was generated.');
    flowAndSettle([{ list: added, x: at.x, y: at.y }], fit);
  }

  function hint(t) { $('dhint').textContent = t; }

  /* ================= persistence ================= */

  function encode() {
    var it = [];
    for (var i = 0; i < items.length; i++) {
      var o = items[i];
      if (o.t === 'src') it.push(['s', o.c, o.i, o.x, o.y, o.w]);
      else if (o.t === 'q') it.push(['q', o.c, o.x, o.y, o.w]);
      else if (o.t === 'v') it.push(['v', o.k, o.x, o.y, o.w]);
      else if (o.t === 'd') it.push(['d', o.k, o.x, o.y, o.w]);
      else if (o.t === 'm') { var mk = o.k.split('|'); it.push(['m', mk[0], mk.slice(1).join('|'), o.x, o.y, o.w, o.sp || '']); }
      else if (o.t === 'w') it.push(['w', o.url, o.title, o.quote, o.x, o.y, o.w]);
      else if (o.t === 'note') it.push(['n', o.text || '', o.x, o.y, o.w]);
      else if (o.t === 'frame') it.push(['f', o.title || '', o.x, o.y, o.w, o.h, o.ci || 0]);
    }
    var ln = [];
    for (var j = 0; j < links.length; j++) ln.push(links[j].words ? [links[j].a, links[j].b, links[j].words] : [links[j].a, links[j].b]);
    return JSON.stringify({ v: 1, vp: [Math.round(tf.x), Math.round(tf.y), +tf.scale.toFixed(3)], it: it, ln: ln });
  }

  function decode(json) {
    var s = JSON.parse(json);
    items = []; links = []; seq = 1;
    for (var i = 0; i < (s.it || []).length; i++) {
      var a = s.it[i];
      if (a[0] === 's') items.push({ id: 's:' + a[1] + ':' + a[2], t: 'src', c: a[1], i: a[2], x: a[3], y: a[4], w: a[5] || SRC_W });
      else if (a[0] === 'q') items.push({ id: 'q:' + a[1], t: 'q', c: a[1], x: a[2], y: a[3], w: a[4] || Q_W });
      /* A verse or file the current build no longer holds is dropped, not drawn blank. */
      else if (a[0] === 'v' && LINKS.verses[a[1]]) items.push({ id: 'v:' + a[1], t: 'v', k: a[1], x: a[2], y: a[3], w: a[4] || SRC_W });
      else if (a[0] === 'd' && LINKS.docs[a[1]]) items.push({ id: 'd:' + a[1], t: 'd', k: a[1], x: a[2], y: a[3], w: a[4] || SRC_W });
      /* A moment the build could not find in its transcript is dropped, like a stale verse. */
      else if (a[0] === 'm' && LINKS.moments && LINKS.moments[a[1] + '|' + a[2]])
        items.push({ id: 'm:' + a[1] + '|' + a[2], t: 'm', k: a[1] + '|' + a[2], sp: a[6] || '', x: a[3], y: a[4], w: a[5] || SRC_W });
      else if (a[0] === 'w' && /^https:\/\//.test(a[1] || '') && a[2] && a[3])
        items.push({ id: 'w:' + a[1] + '|' + a[3], t: 'w', url: a[1], title: a[2], quote: a[3], x: a[4], y: a[5], w: a[6] || SRC_W });
      else if (a[0] === 'n') items.push({ id: 'n:' + (seq++), t: 'note', text: a[1], x: a[2], y: a[3], w: a[4] || NOTE_W });
      else if (a[0] === 'f') items.push({ id: 'f:' + (seq++), t: 'frame', title: a[1], x: a[2], y: a[3], w: a[4] || FRAME_W, h: a[5] || FRAME_H, ci: a[6] || 0 });
    }
    /* Links are rewritten against the ids that actually landed, so a stale
       note or frame id in an old link cannot resurrect a missing card. */
    var live = {};
    for (var k = 0; k < items.length; k++) live[items[k].id] = true;
    for (var l = 0; l < (s.ln || []).length; l++) {
      if (!live[s.ln[l][0]] || !live[s.ln[l][1]]) continue;
      var lw = cleanWords(s.ln[l][2]);
      links.push(lw ? { a: s.ln[l][0], b: s.ln[l][1], words: lw } : { a: s.ln[l][0], b: s.ln[l][1] });
    }
    if (s.vp) { tf.x = s.vp[0]; tf.y = s.vp[1]; tf.scale = clamp(s.vp[2] || 1, MIN_Z, MAX_Z); }
  }

  /* A desk opened from someone's link is a separate view, never written over
     the reader's own saved desk. It stays in the address bar, so a reload
     reopens it, until they keep it or go back to their own. */
  var viewingShared = false;
  var sharedMeta = null;     // the prepared desk on screen, if it is one
  var sharedSig = null;      // its layout as opened, to tell whether it has been changed

  function save() {
    if (viewingShared) return;
    try { localStorage.setItem(STORE, encode()); } catch (err) { /* private window, blocked storage: the desk still works */ }
  }

  /* The desk's layout without the viewport: what "changed" means. */
  function deskSig() {
    var s = JSON.parse(encode());
    return JSON.stringify([s.it, s.ln]);
  }

  function preparedBySlug(slug) {
    var all = LINKS.desks || [];
    for (var i = 0; i < all.length; i++) if (all[i].slug === slug) return all[i];
    /* A renamed desk keeps answering to its old links. */
    for (var j = 0; j < all.length; j++) if ((all[j].formerly || []).indexOf(slug) >= 0) return all[j];
    return null;
  }

  /* What the address bar asks for: a prepared desk by name (#desk=slug), or a
     whole desk packed into the link (#b=...). */
  function sharedInHash() {
    var p = /[#&]desk=([a-z0-9-]+)/.exec(location.hash);
    if (p) {
      var d = preparedBySlug(p[1]);
      return d ? { json: JSON.stringify(d.desk), prepared: d } : { missing: p[1] };
    }
    var h = /[#&]b=([^&]+)/.exec(location.hash);
    if (!h) return null;
    try { return { json: decodeURIComponent(h[1]) }; } catch (err) { return { bad: true }; }
  }

  function readOwn() {
    try {
      var s = localStorage.getItem(STORE);
      if (s) { decode(s); return true; }
    } catch (err) { /* no storage, or an unreadable desk; start empty */ }
    items = []; links = [];
    return false;
  }

  function ownCount() {
    try { var s = JSON.parse(localStorage.getItem(STORE) || 'null'); return s && s.it ? s.it.length : 0; } catch (err) { return 0; }
  }

  function sharedHint(s) {
    if (s.missing) return 'There is no prepared desk called “' + s.missing + '” in this build. Showing your own desk.';
    return 'That desk link could not be read. Showing your own desk.';
  }

  function load() {
    var s = sharedInHash();
    if (s && s.json) {
      try {
        decode(s.json);
        viewingShared = true; sharedMeta = s.prepared || null;
        return true;
      } catch (err) { /* unreadable: fall through to the reader's own desk */ }
    }
    return readOwn();
  }

  function renderShared() {
    $('sharedBar').hidden = !viewingShared;
    var n = ownCount();
    $('btnBackMine').textContent = 'BACK TO MY DESK' + (n ? ' (' + n + ')' : '');
    if (!viewingShared) return;
    $('sharedEyebrow').textContent = !sharedMeta ? 'A SHARED DESK' :
      (sharedMeta.file ? 'A DESK FROM A FILE · ' : 'A PREPARED DESK · ') + sharedMeta.title.toUpperCase();
    $('sharedText').textContent = (sharedMeta ? sharedMeta.subtitle + ' ' : 'Someone’s layout, opened from a link. ') +
      'Your own desk is safe and untouched. Changes here are not saved unless you keep it.';
  }

  function leaveShared() {
    viewingShared = false;
    sharedMeta = null; sharedSig = null;
    history.replaceState(null, '', location.pathname + location.search);
    undoStack = [];
    sel = {};
  }

  function openShared(s) {
    if (phoneWalk != null) endPhoneWalk();   // a walk belongs to the board it started on
    try { decode(s.json); } catch (err) { hint('That desk link could not be read.'); return; }
    viewingShared = true;
    sharedMeta = s.prepared || null;
    undoStack = []; sel = {};
    closeReader();
    renderAll(); fit(); renderShared();
    sharedSig = deskSig();
    hint((sharedMeta ? sharedMeta.title : 'A shared desk') + ': ' + items.length + ' things on it. Click any card to read it. Your own desk is untouched.');
    if (phoneReading()) window.scrollTo(0, 0);
  }

  function backToMine() {
    leaveShared();
    closeReader();
    tf = { x: 60, y: 60, scale: 1 };
    readOwn();
    applyTransform(); renderAll(); renderShared();
    if (items.length) fit();
    hint(items.length ? 'Back to your desk. ' + items.length + ' things on it.' : 'Back to your desk, which is empty.');
  }

  function keepShared() {
    var n = ownCount();
    if (n && !window.confirm('Keep this shared desk as your own? It replaces your current desk (' + n + ' things on it).')) return;
    leaveShared();
    save();
    renderShared();
    hint('This desk is yours now, and it saves as you work.');
  }

  /* ================= help =================
     The controls, one press away: the ? button under the desk, or the ? key.
     It is a panel, not a modal: the desk stays usable behind it, and a click
     anywhere else, Esc, or ? again closes it. */

  function toggleHelp(on) {
    var p = $('helpPanel'), want = on == null ? p.hidden : on;
    if (want === !p.hidden) return;
    p.hidden = !want;
    $('btnHelp').setAttribute('aria-expanded', want ? 'true' : 'false');
    $('btnHelp').classList.toggle('is-on', want);
    if (want) $('helpClose').focus();
    else if (p.contains(document.activeElement)) $('btnHelp').focus();
  }

  function wireHelp() {
    /* A Mac's key is Command, not Control. */
    if (/Mac|iPhone|iPad/.test(navigator.platform || '')) {
      var mods = document.querySelectorAll('[data-mod]');
      for (var i = 0; i < mods.length; i++) mods[i].textContent = '⌘';
    }
    $('btnHelp').addEventListener('click', function () { toggleHelp(); });
    $('helpClose').addEventListener('click', function () { toggleHelp(false); });
    document.addEventListener('pointerdown', function (e) {
      if ($('helpPanel').hidden) return;
      if ($('helpPanel').contains(e.target) || $('btnHelp').contains(e.target)) return;
      toggleHelp(false);
    }, true);
  }

  /* ================= desk files =================
     A desk saved as a file the reader keeps: in Downloads, a cloud folder, an
     email to themselves. Clearing the browser cannot touch it, and it opens
     on any computer. Opening one never overwrites the reader's own desk: it
     arrives in the shared view, with KEEP THIS AS MY DESK. */

  var DESK_FILE = 'nazarene-way-desk';

  function deskFileName() {
    var base = sharedMeta && sharedMeta.slug ? sharedMeta.slug :
      sharedMeta && sharedMeta.fileName ? sharedMeta.fileName.replace(/\.json$/i, '').replace(/-\d{4}-\d{2}-\d{2}( \(\d+\))?$/, '') : 'my-desk';
    var d = new Date(), two = function (n) { return (n < 10 ? '0' : '') + n; };
    return base + '-' + d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate()) + '.json';
  }

  function saveFile() {
    if (!items.length) { hint('The desk is empty, so there is nothing to save yet.'); return; }
    var body = { format: DESK_FILE, version: 1, saved: new Date().toISOString(),
                 title: sharedMeta ? sharedMeta.title : 'My desk', desk: JSON.parse(encode()) };
    var url = window.URL.createObjectURL(new Blob([JSON.stringify(body, null, 1)], { type: 'application/json' }));
    var a = document.createElement('a');
    a.href = url;
    a.download = deskFileName();
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { window.URL.revokeObjectURL(url); document.body.removeChild(a); }, 1000);
    hint('Saved as ' + a.download + ', usually in your Downloads. Keep it anywhere; OPEN FILE brings it back on any computer.');
  }

  /* A saved desk file, or the bare layout COPY JSON gives, both open. */
  function openDeskFile(text, name) {
    var data;
    try { data = JSON.parse(text); } catch (err) { hint(name + ' is not a desk file. Desk files are the .json files SAVE FILE makes.'); return; }
    var wrapped = data && data.format === DESK_FILE;
    var desk = wrapped ? data.desk : data;
    if (!desk || Object.prototype.toString.call(desk.it) !== '[object Array]') { hint(name + ' is not a desk file: there is no desk in it.'); return; }
    if (presenting) exitPresent();
    var title = wrapped && data.title && data.title !== 'My desk' ? data.title : name.replace(/\.json$/i, '');
    openShared({ json: JSON.stringify(desk), prepared: {
      file: true, fileName: name, title: title,
      subtitle: 'Opened from ' + name + (wrapped && data.saved ? ', saved ' + String(data.saved).slice(0, 10) : '') + '.'
    } });
  }

  function readDeskFile(file) {
    if (!file) return;
    var r = new FileReader();
    r.onload = function () { openDeskFile(String(r.result), file.name); };
    r.onerror = function () { hint('That file could not be read.'); };
    r.readAsText(file);
  }

  function wireFiles() {
    $('btnSaveFile').addEventListener('click', function () { this.blur(); saveFile(); });
    $('btnOpenFile').addEventListener('click', function () { closeMore(); $('fileOpen').value = ''; $('fileOpen').click(); });
    $('fileOpen').addEventListener('change', function () { readDeskFile(this.files && this.files[0]); });
    /* A desk file dropped anywhere on the desk opens too. */
    var surface = $('surface');
    var hasFiles = function (e) { return e.dataTransfer && [].slice.call(e.dataTransfer.types || []).indexOf('Files') >= 0; };
    surface.addEventListener('dragover', function (e) {
      if (!hasFiles(e) || presenting) return;
      e.preventDefault();
      surface.classList.add('is-drop');
    });
    surface.addEventListener('dragleave', function () { surface.classList.remove('is-drop'); });
    surface.addEventListener('drop', function (e) {
      if (!hasFiles(e) || presenting) return;
      e.preventDefault();
      surface.classList.remove('is-drop');
      readDeskFile(e.dataTransfer.files[0]);
    });
  }

  function copyText(text, btn) {
    var label = btn.textContent;
    var done = function () { btn.textContent = 'COPIED'; setTimeout(function () { btn.textContent = label; }, 1400); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else { fallbackCopy(text); done(); }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) { /* the text is still selected */ }
    document.body.removeChild(ta);
  }

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  /* ================= references in prose =================
     The same grammar as site/desk_links.py, which is the authority: a
     reference becomes a link only when the key computed here is one the build
     resolved against the held KJV. Anything else stays plain text. */

  var refHead = null, refMore = null;

  function buildRefPattern() {
    var names = Object.keys(LINKS.names).sort(function (a, b) { return b.length - a.length; });
    if (!names.length) return;
    var span = '(\\d+):(\\d+)[a-c]?(?:\\s*[-\\u2013]\\s*(?:(\\d+):)?(\\d+)[a-c]?)?';
    refHead = new RegExp('(^|[^A-Za-z0-9])(' + names.map(escapeRe).join('|') + ')\\.?\\s+' + span, 'g');
    refMore = new RegExp('^\\s*;\\s*' + span);
  }

  function refKey(book, c1, v1, c2, v2) {
    if (c2 == null) c2 = c1;
    if (v2 == null) v2 = v1;
    if (c2 < c1 || (c2 === c1 && v2 < v1)) return null;
    if (c2 === c1 && v2 === v1) return book + ' ' + c1 + ':' + v1;
    if (c2 === c1) return book + ' ' + c1 + ':' + v1 + '-' + v2;
    return book + ' ' + c1 + ':' + v1 + '-' + c2 + ':' + v2;
  }

  /* Splits text into runs: {text} for prose, {text, key} for a held verse. */
  function refRuns(text) {
    text = text || '';
    if (!refHead) return [{ text: text }];
    var out = [], pos = 0, m;
    var push = function (s, e, key) {
      if (s > pos) out.push({ text: text.slice(pos, s) });
      out.push(key && LINKS.verses[key] ? { text: text.slice(s, e), key: key } : { text: text.slice(s, e) });
      pos = e;
    };
    refHead.lastIndex = 0;
    while ((m = refHead.exec(text))) {
      var book = LINKS.names[m[2]];
      var start = m.index + m[1].length, end = refHead.lastIndex;
      push(start, end, refKey(book, +m[3], +m[4], m[5] ? +m[5] : null, m[6] ? +m[6] : null));
      for (;;) {
        var n = refMore.exec(text.slice(end));
        if (!n) break;
        var lead = n[0].length - n[0].replace(/^\s*;\s*/, '').length;
        push(end + lead, end + n[0].length, refKey(book, +n[1], +n[2], n[3] ? +n[3] : null, n[4] ? +n[4] : null));
        end += n[0].length;
      }
      refHead.lastIndex = end;
    }
    if (pos < text.length) out.push({ text: text.slice(pos) });
    return out;
  }

  /* Prose with every held verse turned into a chip. */
  function linkify(text, ctx) {
    var frag = document.createDocumentFragment();
    var runs = refRuns(text);
    for (var i = 0; i < runs.length; i++) {
      if (runs[i].key) frag.appendChild(chip({ kind: 'v', key: runs[i].key }, runs[i].text, ctx, true));
      else frag.appendChild(document.createTextNode(runs[i].text));
    }
    return frag;
  }

  /* ================= chips: a link that can become a card =================
     ctx.origin() names the card to tie string back to, ctx.tray says the chip
     lives in the tray (where clicking a case browses it rather than pinning
     it), and ctx.onLift runs as a drag begins (the reader gets out of the way). */

  var carryEndedAt = 0;

  function chip(p, label, ctx, inline) {
    var b = el('button', 'chip chip-' + p.kind + (inline ? ' inline' : ''));
    b.type = 'button';
    if (p.kind !== 'case') b.setAttribute('data-item-id', thingId(p));
    if (!inline) b.setAttribute('data-search', searchText([label]));
    b.title = (ctx.tray && p.kind === 'case') ? 'Open this case file here. Drag it onto the desk to lay it out.' :
      'Click to put it on the desk beside this card, tied by string. Or drag it where you want it.';
    if (inline) b.textContent = label;
    else {
      b.appendChild(el('span', 'chip-mark', p.kind === 'v' ? '§' : p.kind === 'd' ? '¶' : p.kind === 'case' ? '▣' : '•'));
      b.appendChild(el('span', 'chip-label', label));
    }
    b.addEventListener('click', function () {
      if (Date.now() - carryEndedAt < 400) return;
      if (phoneReading()) { openThing(p); return; }
      if (ctx.tray && p.kind === 'case') { openTrayCase(p.slug); return; }
      var origin = ctx.origin ? ctx.origin() : null;
      if (ctx.onLift) ctx.onLift();
      spawn(p, origin, null);
    });
    carriable(b, p, ctx);
    return b;
  }

  /* ================= carrying: from a tray or a reader onto the desk =================
     Pointer-driven rather than HTML5 drag-and-drop, so it also works with a
     pen and with a finger: carriable things take touch-action pan-y, so a
     vertical swipe still scrolls the tray and a sideways one carries. */

  function overSurface(x, y) {
    var t = document.elementFromPoint(x, y);
    return !!(t && $('surface').contains(t));
  }

  function carriable(node, p, ctx) {
    node.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || phoneReading()) return;
      var c = { x: e.clientX, y: e.clientY, id: e.pointerId, started: false, ghost: null, origin: null };
      var move = function (ev) {
        if (ev.pointerId !== c.id) return;
        if (!c.started) {
          if (Math.abs(ev.clientX - c.x) + Math.abs(ev.clientY - c.y) < 6) return;
          c.started = true;
          c.origin = ctx.origin ? ctx.origin() : null;
          if (ctx.onLift) ctx.onLift();
          c.ghost = el('div', 'carry-ghost carry-' + p.kind);
          c.ghost.appendChild(el('small', null, p.kind === 'case' ? 'THE WHOLE CASE' : p.kind === 'v' ? 'SCRIPTURE · KJV' :
            p.kind === 'd' ? 'GO DEEPER' : 'SOURCE'));
          c.ghost.appendChild(el('span', null, thingLabel(p)));
          document.body.appendChild(c.ghost);
          document.body.classList.add('is-carrying');
        }
        c.ghost.style.transform = 'translate(' + (ev.clientX + 14) + 'px,' + (ev.clientY + 12) + 'px)';
        $('surface').classList.toggle('is-drop', overSurface(ev.clientX, ev.clientY));
        ev.preventDefault();
      };
      var up = function (ev) {
        if (ev.pointerId !== c.id) return;
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        document.removeEventListener('pointercancel', up);
        if (!c.started) return;
        carryEndedAt = Date.now();
        document.body.removeChild(c.ghost);
        document.body.classList.remove('is-carrying');
        $('surface').classList.remove('is-drop');
        if (ev.type === 'pointerup' && overSurface(ev.clientX, ev.clientY)) dropOnDesk(p, c.origin, ev.clientX, ev.clientY);
        else hint('Let go off the desk, so nothing was pinned.');
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
      document.addEventListener('pointercancel', up);
    });
  }

  function dropOnDesk(p, origin, x, y) {
    var w = toWorld(x, y);
    if (p.kind === 'case') {
      /* A whole case, with its question card under the pointer. */
      var qid = 'q:' + p.slug;
      pullCase(p.slug, { x: Math.round(w.x - COL - Q_W / 2), y: Math.round(w.y - 20) }, function () {
        if (origin && origin !== qid && itemById(origin) && !linkExists(origin, qid)) {
          links.push({ a: origin, b: qid });
          drawLinks(); updateCounts(); save();
        }
      });
      return;
    }
    spawn(p, origin, w);
  }

  /* ================= the reader =================
     Same markup, same classes and the same behaviour as the Reading Room's
     reader pane. Kept local so app.js is untouched; if this mode is adopted,
     the two should become one shared module. On the desk it also carries the
     thread: the verses, cases and files a card points to. */

  function highlight(text, phrase) {
    if (!phrase) return document.createTextNode(text);
    var frag = document.createDocumentFragment();
    var re = new RegExp(escapeRe(phrase).replace(/'/g, "['’]"), 'i');
    var m = re.exec(text);
    if (!m) { frag.appendChild(document.createTextNode(text)); return frag; }
    frag.appendChild(document.createTextNode(text.slice(0, m.index)));
    frag.appendChild(el('mark', null, m[0]));
    frag.appendChild(document.createTextNode(text.slice(m.index + m[0].length)));
    return frag;
  }

  function roomLink(card, idx) {
    var base = location.origin + location.pathname.replace(/canvas(\.html)?$/, 'index.html');
    return base + '#/' + card.slug + (idx != null ? '/' + idx : '');
  }

  function readerCtx() {
    return { origin: function () { return readerOrigin; }, onLift: closeReader };
  }

  function resetReader(origin, tier, title) {
    readerOrigin = origin || null;
    $('readerTier').textContent = tier;
    $('readerTitle').textContent = title;
    $('readerStatus').innerHTML = '';
    $('readerBody').innerHTML = '';
    $('readerNote').innerHTML = '';
    $('readerFoot').innerHTML = '';
    var th = $('readerThread');
    th.innerHTML = '';
    th.hidden = true;
  }

  function showReader() {
    $('readerBackdrop').hidden = false;
    $('reader').hidden = false;
    $('reader').scrollTop = 0;
    $('readerClose').focus();
  }

  /* One labelled row of chips in the reader's thread, skipped when empty. */
  function threadGroup(label, chips) {
    if (!chips.length) return;
    var th = $('readerThread');
    if (th.hidden) {
      th.hidden = false;
      th.appendChild(el('div', 'thread-head', 'FOLLOW THE THREAD · click to pin it beside this card, or drag it out'));
    }
    var g = el('div', 'thread-group');
    g.appendChild(el('div', 'eyebrow', label));
    var row = el('div', 'chips');
    for (var i = 0; i < chips.length; i++) row.appendChild(chips[i]);
    g.appendChild(row);
    th.appendChild(g);
  }

  function caseChip(slug, ctx) {
    var c = cardBySlug(slug);
    return c ? chip({ kind: 'case', slug: slug }, c.call + ' · ' + c.question, ctx) : null;
  }

  function sourceChip(slug, i, ctx) {
    var c = cardBySlug(slug), s = c && c.sources[i];
    return s ? chip({ kind: 'src', slug: slug, i: i }, (s.title || s.ref) + ' · ' + c.call, ctx) : null;
  }

  function docChip(path, ctx) {
    var d = LINKS.docs[path];
    return d ? chip({ kind: 'd', path: path }, d.title, ctx) : null;
  }

  function versesOf(slug) {
    var out = [];
    for (var k in LINKS.verses) if (LINKS.verses[k].mentioned.indexOf(slug) >= 0) out.push(k);
    return out;
  }

  function compact(list) { return list.filter(function (x) { return !!x; }); }

  function passageBlock(label, before, verses, after, phrase) {
    var d = el('div', 'passage');
    d.appendChild(el('div', 'plabel', label + ' (KJV) · in context'));
    var addVerse = function (v, dim, hl) {
      var s = el('span', dim ? 'v dim' : 'v');
      s.appendChild(el('span', 'vn', v.n));
      s.appendChild(hl ? highlight(v.text, phrase) : document.createTextNode(v.text));
      d.appendChild(s);
    };
    (before || []).forEach(function (v) { addVerse(v, true, false); });
    verses.forEach(function (v) { addVerse(v, false, true); });
    (after || []).forEach(function (v) { addVerse(v, true, false); });
    return d;
  }

  function openReader(src, card, origin) {
    resetReader(origin, (src.tier || '').toUpperCase(), src.title || src.ref);
    var st = $('readerStatus');
    st.appendChild(stampFor(src));
    if (src.edition) st.appendChild(el('span', null, src.edition));
    if (src.status === 'held' && src.passages && src.passages.length) st.appendChild(el('span', null, 'King James Version, public domain'));

    var body = $('readerBody');
    if (src.passages && src.passages.length) {
      for (var p = 0; p < src.passages.length; p++) {
        var pas = src.passages[p];
        body.appendChild(passageBlock(pas.label, pas.before, pas.verses, pas.after, src.phrase));
      }
    } else if (src.snippet) {
      var sn = el('div', 'snippet');
      sn.appendChild(highlight(src.snippet, src.phrase));
      body.appendChild(sn);
      body.appendChild(el('div', 'plabel', 'From the held file; the phrase above is what to grep for.'));
    } else {
      body.appendChild(el('div', 'plabel', 'Not in the collection yet. The words stay out of quotation marks until the text is held; the link below goes to a public-domain edition.'));
    }

    /* The note is where a card argues, so its verse references are live. */
    var ctx = readerCtx();
    $('readerNote').appendChild(linkify(src.note || '', ctx));
    if (card) threadGroup('ITS CASE FILE', compact([caseChip(card.slug, ctx)]));

    var foot = $('readerFoot');
    if (card) {
      var idx = card.sources.indexOf(src);
      var rl = el('a', null, 'See it in its case file: ' + card.question + ' →');
      rl.href = roomLink(card, idx);
      rl.target = '_blank'; rl.rel = 'noopener';
      foot.appendChild(rl);
    }
    if (src.open || src.link) {
      var a = el('a', null, src.open ? 'Open the file in the repo →' : 'Open a public-domain edition →');
      a.href = src.open || src.link; a.target = '_blank'; a.rel = 'noopener';
      foot.appendChild(a);
    }
    if (src.phrase) {
      var g = el('div');
      g.appendChild(document.createTextNode('Cite the distinctive phrase, not the line number: '));
      g.appendChild(el('code', null, src.phrase));
      foot.appendChild(g);
    }
    var row = el('div', 'copy-row');
    var c1 = el('button', 'copy', 'copy citation');
    c1.type = 'button';
    c1.addEventListener('click', function () {
      var ref = src.title || src.ref;
      var where = src.passages && src.passages.length ? ref + ', KJV' : (src.edition ? ref + ' (' + src.edition + ')' : ref);
      var quote = src.phrase ? '“' + src.phrase + '” — ' : '';
      copyText(quote + where + ' · ' + (card ? roomLink(card, card.sources.indexOf(src)) : ''), c1);
    });
    row.appendChild(c1);
    foot.appendChild(row);
    showReader();
  }

  /* A question card opens its case as a hub: the finding with its verses
     live, and every way out of it. */
  function openCaseReader(slug, origin) {
    var card = cardBySlug(slug);
    if (!card) return;
    resetReader(origin, card.call + ' · ' + card.drawer, card.question);
    var held = card.sources.filter(function (s) { return s.status === 'held'; }).length;
    var st = $('readerStatus');
    if (card.subtitle) st.appendChild(el('span', null, card.subtitle));
    st.appendChild(el('span', null, card.sources.length + ' sources · ' + held + ' held in the repo'));

    var ctx = readerCtx();
    var body = $('readerBody');
    body.appendChild(el('div', 'eyebrow', 'THE FINDING'));
    var f = el('p', 'case-finding');
    f.appendChild(linkify(card.finding, ctx));
    body.appendChild(f);
    if (card.oneLiners && card.oneLiners.length) {
      body.appendChild(el('div', 'eyebrow', 'WHERE THE CASE STANDS'));
      var ul = el('ul', 'case-lines');
      card.oneLiners.forEach(function (t) { var li = el('li'); li.appendChild(linkify(t, ctx)); ul.appendChild(li); });
      body.appendChild(ul);
    }

    var lay = el('button', 'tool lay-out', 'LAY OUT ITS SOURCES');
    lay.type = 'button';
    lay.title = 'Pin every source on this case file under the question, for and against';
    lay.addEventListener('click', function () { closeReader(); pullCase(slug); });
    $('readerNote').appendChild(lay);

    threadGroup('VERSES THIS CASE CITES', versesOf(slug).map(function (k) {
      return chip({ kind: 'v', key: k }, k, ctx);
    }));
    threadGroup('NEXT IN THE DRAWER', compact((card.next || []).map(function (s) { return caseChip(s, ctx); })));
    threadGroup('GO DEEPER · in the repo', compact((card.goDeeper || []).map(function (g) { return docChip(g.path, ctx); })));

    var foot = $('readerFoot');
    var rl = el('a', null, 'Read it in the Reading Room →');
    rl.href = roomLink(card); rl.target = '_blank'; rl.rel = 'noopener';
    foot.appendChild(rl);
    var cl = el('a', null, 'The full card, with every objection, in the repo →');
    cl.href = card.cardUrl; cl.target = '_blank'; cl.rel = 'noopener';
    foot.appendChild(cl);
    showReader();
  }

  function openVerseReader(key, origin) {
    var v = LINKS.verses[key];
    if (!v) return;
    resetReader(origin, 'SCRIPTURE · ' + v.book.toUpperCase(), v.label);
    var st = $('readerStatus');
    st.appendChild(stampFor({ status: 'held', statusText: 'HELD · KJV' }));
    st.appendChild(el('span', null, 'King James Version, public domain'));

    var body = $('readerBody');
    body.appendChild(passageBlock(v.label, v.before, v.verses, v.after, null));
    if (v.truncated) body.appendChild(el('div', 'plabel', 'The first ' + v.verses.length + ' verses of the range are shown. The rest are in the held file.'));
    $('readerNote').textContent = 'A verse the case files cite in their own words. The build found it in the held KJV, which is the only reason it can be on the desk.';

    var ctx = readerCtx();
    threadGroup('PINNED AS A SOURCE ON', compact(v.cited.map(function (ci) { return sourceChip(ci[0], ci[1], ctx); })));
    threadGroup('CITED IN THE PROSE OF', compact(v.mentioned.map(function (s) { return caseChip(s, ctx); })));

    var foot = $('readerFoot');
    var a = el('a', null, 'Open the file in the repo →');
    a.href = (DATA.repo || '') + v.file; a.target = '_blank'; a.rel = 'noopener';
    foot.appendChild(a);
    var row = el('div', 'copy-row');
    var c1 = el('button', 'copy', 'copy citation');
    c1.type = 'button';
    c1.addEventListener('click', function () { copyText(v.label + ', KJV', c1); });
    row.appendChild(c1);
    foot.appendChild(row);
    showReader();
  }

  function openMomentReader(it) {
    var m = LINKS.moments && LINKS.moments[it.k];
    if (!m) return;
    resetReader(it.id, m.show + ' ' + episodeNo(m.key) + ' · ' + m.ts, m.episode);
    var st = $('readerStatus');
    st.appendChild(pointerStamp('POINTER · NOT PROOF'));
    st.appendChild(el('span', null, (it.sp ? it.sp + ', ' : '') + 'from the auto-captions'));
    var body = $('readerBody');
    var d = el('div', 'passage');
    d.appendChild(el('div', 'plabel', m.label + ' · in context'));
    [[m.before, true], [m.para, false], [m.after, true]].forEach(function (pair) {
      if (!pair[0]) return;
      var s = el('span', pair[1] ? 'v dim' : 'v');
      s.appendChild(el('span', 'vn', pair[0].n));
      s.appendChild(pair[1] ? document.createTextNode(pair[0].text) : highlight(pair[0].text, m.phrase));
      d.appendChild(s);
    });
    body.appendChild(d);
    $('readerNote').textContent = 'Auto-generated captions: the words are the speaker\'s, the spelling is the transcriber\'s. A moment shows what was said, not that it is so; the check beside it on the board says what the sources say.';
    var foot = $('readerFoot');
    if (m.video) {
      var a = el('a', null, 'Watch this moment →');
      a.href = m.video; a.target = '_blank'; a.rel = 'noopener';
      foot.appendChild(a);
    }
    if (m.open) {
      var t = el('a', null, 'The whole transcript in the repo →');
      t.href = m.open; t.target = '_blank'; t.rel = 'noopener';
      foot.appendChild(t);
    }
    var row = el('div', 'copy-row');
    var c1 = el('button', 'copy', 'copy this moment');
    c1.type = 'button';
    c1.addEventListener('click', function () { copyText('“' + m.phrase + '” (' + m.label + ')' + (m.video ? ' ' + m.video : ''), c1); });
    row.appendChild(c1);
    foot.appendChild(row);
    showReader();
  }

  function openWebReader(it) {
    resetReader(it.id, 'OUTSIDE SOURCE · ' + urlHost(it.url).toUpperCase(), it.title);
    $('readerStatus').appendChild(pointerStamp('OUTSIDE · CHECKED BY HAND'));
    $('readerStatus').appendChild(el('span', null, 'Not held in the repo'));
    var sn = el('div', 'snippet');
    sn.textContent = '“' + it.quote + '”';
    $('readerBody').appendChild(sn);
    $('readerBody').appendChild(el('div', 'plabel', 'Quoted from the page when the board was made. Pages change; open it to check.'));
    var a = el('a', null, 'Open the page →');
    a.href = it.url; a.target = '_blank'; a.rel = 'noopener';
    $('readerFoot').appendChild(a);
    showReader();
  }

  function openDocReader(path, origin) {
    var d = LINKS.docs[path];
    if (!d) return;
    resetReader(origin, 'GO DEEPER · OUR NOTES IN THE REPO', d.title);
    $('readerStatus').appendChild(el('span', null, 'The collection’s own research, not a primary source, so it carries no stamp.'));
    $('readerBody').appendChild(el('div', 'plabel', d.path));
    threadGroup('LISTED TO GO DEEPER ON', compact(d.cards.map(function (s) { return caseChip(s, readerCtx()); })));
    var a = el('a', null, 'Read it in the repo →');
    a.href = d.url; a.target = '_blank'; a.rel = 'noopener';
    $('readerFoot').appendChild(a);
    showReader();
  }

  function closeReader() {
    $('reader').hidden = true;
    $('readerBackdrop').hidden = true;
    readerOrigin = null;
  }

  /* ================= wiring ================= */

  function wireTools() {
    $('btnFrame').addEventListener('click', function () {
      pushUndo();
      /* Beside the work rather than on top of it, so a new frame always opens
         empty and visible instead of landing over a pile of cards. */
      var b = bounds(), at;
      if (b) at = { x: Math.round(b.x2 + 70), y: Math.round(b.y1) };
      else { var c = viewCenter(); at = { x: Math.round(c.x - FRAME_W / 2), y: Math.round(c.y - FRAME_H / 2) }; }
      var f = addFrame(at.x, at.y);
      renderAll(); save(); fit();
      startRename(f);
      hint('Frame added. Anything you drag inside belongs to it, and dragging the title bar carries the contents.');
    });

    $('btnNote').addEventListener('click', function () {
      pushUndo();
      var c = viewCenter();
      var spot = freeSpot(Math.round(c.x), Math.round(c.y), NOTE_W, 90);
      var n = addNote(spot.x, spot.y, '');
      renderAll(); save();
      var ta = nodeEl(n.id).querySelector('textarea');
      if (ta) ta.focus();
    });

    $('btnTidy').addEventListener('click', tidy);
    $('btnFit').addEventListener('click', fit);
    $('btnZoomIn').addEventListener('click', function () { var r = $('surface').getBoundingClientRect(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1.2); });
    $('btnZoomOut').addEventListener('click', function () { var r = $('surface').getBoundingClientRect(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1 / 1.2); });

    $('btnSnap').addEventListener('click', function () {
      snapOn = !snapOn;
      this.classList.toggle('is-on', snapOn);
      this.setAttribute('aria-pressed', snapOn ? 'true' : 'false');
      hint(snapOn ? 'Snap on: edges line up and stacked cards lock to the board’s own 22px gap.' : 'Snap off: cards go exactly where you drop them.');
    });

    $('btnString').addEventListener('click', function () {
      stringMode = !stringMode;
      this.classList.toggle('is-on', stringMode);
      this.setAttribute('aria-pressed', stringMode ? 'true' : 'false');
      hint(stringMode ? 'String mode: click one source, then another, to tie them. Click a string to cut it.' :
        'String mode off. You can still drag from any pin head to tie string.');
    });

    $('btnShare').addEventListener('click', function () {
      var base = location.origin + location.pathname;
      /* An unchanged prepared desk has a short name; anything else travels whole. */
      if (viewingShared && sharedMeta && sharedMeta.slug && deskSig() === sharedSig) {
        copyText(base + '#desk=' + sharedMeta.slug, this);
        hint('Link to the prepared desk “' + sharedMeta.title + '” copied. Anyone who opens it walks the same argument.');
        return;
      }
      copyText(base + '#b=' + encodeURIComponent(encode()), this);
      hint('Desk link copied. It rebuilds this exact layout for anyone who opens it. No account, nothing stored on a server.');
    });

    $('btnJson').addEventListener('click', function () {
      closeMore();
      copyText(encode(), $('btnMore'));
      hint('Desk JSON copied.');
    });

    $('btnMore').addEventListener('click', function () { toggleMore(); });
    /* Choosing from MORE closes it, as a menu does; SNAP and STRING MODE are
       switches, so they leave it open to show ON or OFF. */
    $('moreMenu').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b && !b.classList.contains('toggle')) closeMore();
    });
    $('moreMenu').addEventListener('keydown', function (e) {
      var b = [].slice.call(this.querySelectorAll('button')), at = b.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { b[(at + 1) % b.length].focus(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { b[(at - 1 + b.length) % b.length].focus(); e.preventDefault(); }
      else if (e.key === 'Escape') { closeMore(); $('btnMore').focus(); e.preventDefault(); e.stopPropagation(); }
      else if (e.key === 'Tab') closeMore();
    });
    document.addEventListener('pointerdown', function (e) {
      if (!$('moreMenu').hidden && !e.target.closest('.more')) closeMore();
    });
    $('btnStartNote').addEventListener('click', function () { $('btnNote').click(); });
    /* The start buttons sit on the surface; a press on them is not the start of a box-select. */
    $('emptyInner').addEventListener('pointerdown', function (e) { e.stopPropagation(); });

    $('btnClear').addEventListener('click', function () {
      closeMore();
      if (!items.length) { hint('The desk is already empty.'); return; }
      if (!window.confirm('Clear the desk? Ctrl-Z will still bring it back this session.')) return;
      pushUndo();
      items = []; links = []; sel = {};
      renderAll(); save();
      hint('Desk cleared.');
    });

    $('btnAdd').addEventListener('click', function () {
      trayUserSet = true;
      var open = $('tray').classList.contains('is-collapsed');
      showTray(open);
      if (open) hint('The trays: open a case file to browse it, click a source to pin it, or drag anything onto the desk.');
    });
    $('trayCollapse').addEventListener('click', function () {
      trayUserSet = true;
      showTray(false);
    });

    $('readerClose').addEventListener('click', closeReader);
    $('readerBackdrop').addEventListener('click', closeReader);

    var input = $('dq');
    input.addEventListener('input', function () { showSuggest(input.value); });
    /* Suggestions act on mousedown and keep the focus, so the list can go the
       moment the box loses it; left up, it covered the toolbar and took a
       click meant for PRESENT. */
    input.addEventListener('blur', function () { $('dsuggest').hidden = true; input.setAttribute('aria-expanded', 'false'); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Escape') $('dsuggest').hidden = true; });
    $('deskSearch').addEventListener('submit', submitSearch);

    var tq = $('tq');
    tq.addEventListener('input', filterTray);
    tq.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { tq.value = ''; filterTray(); }
      /* Enter takes the first match: a place on the desk first, then the trays. */
      if (e.key === 'Enter') {
        e.preventDefault();
        var first = $('tray').querySelector('.here-row');
        if (!first) {
          var all = $('tray').querySelectorAll('[data-search]');
          for (var i = 0; i < all.length && !first; i++) if (shown(all[i]) && all[i].offsetParent) first = all[i];
        }
        if (first) first.click();
      }
    });

    $('btnKeepShared').addEventListener('click', keepShared);
    $('btnBackMine').addEventListener('click', backToMine);

    window.addEventListener('resize', function () { drawLinks(); });
    window.addEventListener('beforeunload', save);
  }

  /* ================= boot ================= */

  function boot(d) {
    DATA = d;
    buildFlat();
    renderTray();
    wireSurface();
    wireTools();
    wirePresent();
    wireFiles();
    wireHelp();
    wirePhone();
    watchLateFonts();
    var asked = sharedInHash();
    var restored = load();
    applyTransform();
    renderAll();
    renderShared();
    if (viewingShared) {
      sharedSig = deskSig();
      hint((sharedMeta ? sharedMeta.title : 'A shared desk') + ': ' + items.length + ' things on it. Click any card to read it. Your own desk is untouched.');
      fit();
    } else if (asked) {
      hint(sharedHint(asked));
      if (items.length) fit();
    } else if (restored && items.length) {
      hint('Your desk from last time. ' + items.length + ' things on it.');
      fit();
    } else {
      hint('Searches the held sources only. Nothing on this desk is generated.');
    }
    arrive();
    presentFromHash();
    /* A link pasted into this tab's address bar changes only the hash. */
    window.addEventListener('hashchange', function () {
      var s = sharedInHash();
      if (s && s.json) {
        if (presenting) exitPresent();
        openShared(s);
        presentFromHash();
      }
      else if (s) hint(sharedHint(s));
      else if (viewingShared) backToMine();
      else arrive();
    });
  }

  /* The Reading Room's door: canvas.html#pull=<case>[&open=<source index>]
     lays the case out (under whatever is already on the desk, which is kept),
     opens it in the tray, and opens the source the reader was looking at. The
     hash is cleared afterwards so a reload does not pull it a second time. */
  function arrive() {
    var m = /[#&]pull=([a-z0-9-]+)(?:&open=(\d+))?/.exec(location.hash);
    if (!m) return;
    history.replaceState(null, '', location.pathname + location.search);
    var card = cardBySlug(m[1]);
    if (!card) { hint('That case file is not in this build, so nothing was pulled.'); return; }
    openTrayCase(card.slug);
    var open = m[2] != null && card.sources[+m[2]] ? +m[2] : null;
    pullCase(card.slug, null, function () {
      if (open == null) return;
      var id = 's:' + card.slug + ':' + open;
      flash(id);
      openReader(card.sources[open], card, id);
    });
  }

  /* Every layout decision here measures real card heights, and the typewriter
     faces change those heights by a couple of pixels a card. So nothing lays
     out until the faces have actually landed.

     document.fonts.ready on its own is not enough: if the Google Fonts
     stylesheet has not been parsed yet, no face is pending, so it resolves
     immediately and promises nothing. Wait for the sheet first, then ask for
     the three faces by name, and give up after three seconds so a blocked
     network can never leave the desk empty. */
  function whenFontsReady(fn) {
    var done = false;
    var once = function () { if (!done) { done = true; fn(); } };
    setTimeout(once, 3000);
    if (!document.fonts || !document.fonts.load) { once(); return; }

    var afterSheet = function () {
      Promise.all([
        document.fonts.load('400 14px "Courier Prime"'),
        document.fonts.load('700 14px "Courier Prime"'),
        document.fonts.load('400 14px "Special Elite"')
      ]).then(function () { return document.fonts.ready; }).then(once, once);
    };

    var link = document.querySelector('link[rel="stylesheet"][href*="fonts.googleapis.com"]');
    if (!link || link.sheet) afterSheet();
    else {
      link.addEventListener('load', afterSheet);
      link.addEventListener('error', once);
    }
  }

  /* desk.json is the link index. The desk works without it, with no verse or
     go-deeper cards, so a failure there never costs the reader the desk. */
  var linksReady = fetch('desk.json').then(function (r) { return r.ok ? r.json() : null; })
    .then(function (l) { if (l && l.verses) LINKS = l; buildRefPattern(); }, function () { /* no links; still a desk */ });

  fetch('data.json').then(function (r) { return r.json(); }).then(function (d) {
    linksReady.then(function () { whenFontsReady(function () { boot(d); }); });
  }).catch(function (err) {
    $('hudCounts').textContent = 'The card data failed to load. ' + err;
  });
})();
