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

  function nodeEl(id) { return $('nodes').querySelector('[data-id="' + id + '"]') || $('frames').querySelector('[data-id="' + id + '"]'); }

  function boxOf(it) {
    var e = nodeEl(it.id);
    if (it.t === 'frame') return { x: it.x, y: it.y, w: it.w, h: it.h };
    /* offsetWidth/Height are in world units: a CSS transform on an ancestor
       does not change them, which is exactly what the snapping needs. */
    return { x: it.x, y: it.y, w: e ? e.offsetWidth : (it.w || SRC_W), h: e ? e.offsetHeight : 120 };
  }

  function pushUndo() {
    undoStack.push(JSON.stringify({ it: items, ln: links }));
    if (undoStack.length > 40) undoStack.shift();
  }

  function undo() {
    if (!undoStack.length) return;
    var s = JSON.parse(undoStack.pop());
    items = s.it; links = s.ln; sel = {};
    renderAll(); save();
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
      undoStack.pop();
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
    if (!it) { undoStack.pop(); return; }
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

  function buildNoteNode(it) {
    var n = el('div', 'node');
    n.setAttribute('data-id', it.id);
    n.style.setProperty('--tilt', '1.2deg');
    n.appendChild(tools(it));
    var p = el('div', 'notepad');
    p.appendChild(el('div', 'eyebrow', 'MY NOTE'));
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

  function buildFrame(it) {
    var f = el('div', 'frame');
    f.setAttribute('data-id', it.id);
    f.style.setProperty('--fc', FRAME_COLORS[it.ci || 0]);

    var bar = el('div', 'frame-title');
    var inp = el('input');
    inp.value = it.title;
    inp.setAttribute('aria-label', 'Frame title');
    inp.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
    inp.addEventListener('input', function () {
      it.title = inp.value;
      inp.style.width = Math.max(4, inp.value.length + 1) + 'ch';
      save();
    });
    inp.style.width = Math.max(4, it.title.length + 1) + 'ch';
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
      else if (it.t === 'note') e = buildNoteNode(it);
      else if (it.t === 'frame') e = buildFrame(it);
      if (!e) continue;
      (it.t === 'frame' ? frames : nodes).appendChild(e);
      position(it);
    }
    renderSelection();
    renderTrayPlaced();
    drawLinks();
    updateCounts();
    $('emptyDesk').hidden = items.length > 0;
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
    var svg = $('links');
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    for (var i = 0; i < links.length; i++) {
      var a = itemById(links[i].a), b = itemById(links[i].b);
      if (!a || !b) continue;
      var pa = pinPoint(a), pb = pinPoint(b);
      var sa = srcOf(a), sb = srcOf(b);
      var isOther = (sa && sa.side === 'other') || (sb && sb.side === 'other');

      var hit = svgEl('line');
      hit.setAttribute('class', 'string-hit');
      hit.setAttribute('x1', pa.x); hit.setAttribute('y1', pa.y);
      hit.setAttribute('x2', pb.x); hit.setAttribute('y2', pb.y);
      hit.setAttribute('vector-effect', 'non-scaling-stroke');
      (function (idx) {
        hit.addEventListener('click', function (e) {
          e.stopPropagation();
          pushUndo();
          links.splice(idx, 1);
          drawLinks(); updateCounts(); save();
          hint('String cut. Ctrl-Z puts it back.');
        });
      })(i);
      svg.appendChild(hit);

      var line = svgEl('line');
      line.setAttribute('class', 'string-line' + (isOther ? ' other' : ''));
      line.setAttribute('x1', pa.x); line.setAttribute('y1', pa.y);
      line.setAttribute('x2', pb.x); line.setAttribute('y2', pb.y);
      line.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(line);
    }
    if (tempLine) svg.appendChild(tempLine);
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

    var pan = null, marq = null, drag = null, frameDrag = null, resize = null, string = null;
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

      if (string && !string.click) {
        var holder = nodeAtPoint(e.clientX, e.clientY);
        var tied = false;
        if (holder) {
          var other = holder.getAttribute('data-id');
          if (other !== string.id && !linkExists(string.id, other)) { tieString(string.id, other); tied = true; }
        }
        string = null; tempLine = null;
        surface.classList.remove('is-stringing');
        drawLinks();
        hint(tied ? 'String tied. Click a string to cut it.' : 'No source under there, so no string was tied.');
        return;
      }

      if (resize) { resize = null; save(); return; }

      if (frameDrag) {
        var moved = frameDrag.moved;
        frameDrag = null;
        if (moved) { drawLinks(); save(); } else undoStack.pop();
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
          undoStack.pop();
          /* a click, not a drag: open the source */
          var it = itemById(leadId);
          if (it && it.t === 'src') { var s = srcOf(it); if (s) openReader(s, cardBySlug(it.c), it.id); }
          else if (it && it.t === 'q') openCaseReader(it.c, it.id);
          else if (it && it.t === 'v') openVerseReader(it.k, it.id);
          else if (it && it.t === 'd') openDocReader(it.k, it.id);
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
      if (e.code === 'Space' && !isTyping(e)) { spaceDown = true; $('surface').classList.add('is-spacing'); e.preventDefault(); }
      if (isTyping(e)) return;
      if ((e.key === 'Delete' || e.key === 'Backspace')) { removeSelection(); e.preventDefault(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { undo(); e.preventDefault(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        sel = {};
        for (var i = 0; i < items.length; i++) if (items[i].t !== 'frame') sel[items[i].id] = true;
        renderSelection(); e.preventDefault();
      }
      if (e.key === 'Escape') {
        if (!$('reader').hidden) closeReader();
        else { sel = {}; renderSelection(); }
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

  function isTyping(e) {
    var t = e.target;
    return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');
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
    if (!b) return;
    var r = $('surface').getBoundingClientRect();
    var pad = 56;
    var sx = (r.width - pad * 2) / Math.max(1, b.x2 - b.x1);
    var sy = (r.height - pad * 2) / Math.max(1, b.y2 - b.y1);
    tf.scale = clamp(Math.min(sx, sy), MIN_Z, 1.15);
    tf.x = (r.width - (b.x2 - b.x1) * tf.scale) / 2 - b.x1 * tf.scale;
    tf.y = (r.height - (b.y2 - b.y1) * tf.scale) / 2 - b.y1 * tf.scale;
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
    var cases = $('trayCases');
    cases.innerHTML = '';
    var ordered = DATA.cards.slice().sort(function (a, b) { return a.call < b.call ? -1 : 1; });
    for (var i = 0; i < ordered.length; i++) {
      (function (card) {
        var li = el('li');
        var btn = el('button', 'tray-case');
        btn.type = 'button';
        btn.setAttribute('data-slug', card.slug);
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

  function renderTrayPlaced() {
    var btns = document.querySelectorAll('[data-src-id], [data-item-id]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('is-placed', has(btns[i].getAttribute('data-src-id') || btns[i].getAttribute('data-item-id')));
    }
  }

  /* ================= a case file, open in the tray =================
     The Reading Room's case file, small enough to read beside the desk. Every
     piece of it can be dragged out; a source pinned from here ties back to
     its question if the question is already down. */

  function openTrayCase(slug) {
    var card = cardBySlug(slug);
    if (!card) return;
    $('trayCasesSection').hidden = true;
    $('trayFamiliesSection').hidden = true;
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
  }

  function closeTrayCase() {
    $('trayOpen').hidden = true;
    $('trayOpen').innerHTML = '';
    $('trayCasesSection').hidden = false;
    $('trayFamiliesSection').hidden = false;
    $('tray').scrollTop = 0;
  }

  function pinSource(row) {
    var c = viewCenter();
    var spot = freeSpot(Math.round(c.x), Math.round(c.y), SRC_W, 150);
    pushUndo();
    var it = addSource(row.slug, row.i, spot.x, spot.y);
    if (!it) { hint('That one is already on the desk.'); undoStack.pop(); return; }
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
    if (!added.length) { undoStack.pop(); hint('Those are all on the desk already.'); return; }
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
      else if (o.t === 'note') it.push(['n', o.text || '', o.x, o.y, o.w]);
      else if (o.t === 'frame') it.push(['f', o.title || '', o.x, o.y, o.w, o.h, o.ci || 0]);
    }
    var ln = [];
    for (var j = 0; j < links.length; j++) ln.push([links[j].a, links[j].b]);
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
      else if (a[0] === 'n') items.push({ id: 'n:' + (seq++), t: 'note', text: a[1], x: a[2], y: a[3], w: a[4] || NOTE_W });
      else if (a[0] === 'f') items.push({ id: 'f:' + (seq++), t: 'frame', title: a[1], x: a[2], y: a[3], w: a[4] || FRAME_W, h: a[5] || FRAME_H, ci: a[6] || 0 });
    }
    /* Links are rewritten against the ids that actually landed, so a stale
       note or frame id in an old link cannot resurrect a missing card. */
    var live = {};
    for (var k = 0; k < items.length; k++) live[items[k].id] = true;
    for (var l = 0; l < (s.ln || []).length; l++) {
      if (live[s.ln[l][0]] && live[s.ln[l][1]]) links.push({ a: s.ln[l][0], b: s.ln[l][1] });
    }
    if (s.vp) { tf.x = s.vp[0]; tf.y = s.vp[1]; tf.scale = clamp(s.vp[2] || 1, MIN_Z, MAX_Z); }
  }

  function save() {
    try { localStorage.setItem(STORE, encode()); } catch (err) { /* private window, blocked storage: the desk still works */ }
  }

  function load() {
    var h = /[#&]b=([^&]+)/.exec(location.hash);
    if (h) {
      try { decode(decodeURIComponent(h[1])); return true; } catch (err) { hint('That desk link could not be read. Starting empty.'); }
    }
    try {
      var s = localStorage.getItem(STORE);
      if (s) { decode(s); return true; }
    } catch (err2) { /* no storage; start empty */ }
    return false;
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
    b.title = (ctx.tray && p.kind === 'case') ? 'Open this case file here. Drag it onto the desk to lay it out.' :
      'Click to put it on the desk beside this card, tied by string. Or drag it where you want it.';
    if (inline) b.textContent = label;
    else {
      b.appendChild(el('span', 'chip-mark', p.kind === 'v' ? '§' : p.kind === 'd' ? '¶' : p.kind === 'case' ? '▣' : '•'));
      b.appendChild(el('span', 'chip-label', label));
    }
    b.addEventListener('click', function () {
      if (Date.now() - carryEndedAt < 400) return;
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
      if (e.button !== 0) return;
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
    var base = location.origin + location.pathname.replace(/canvas\.html$/, 'index.html');
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
      var inp = nodeEl(f.id).querySelector('input');
      if (inp) { inp.focus(); inp.select(); }
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
      copyText(base + '#b=' + encodeURIComponent(encode()), this);
      hint('Desk link copied. It rebuilds this exact layout for anyone who opens it. No account, nothing stored on a server.');
    });

    $('btnJson').addEventListener('click', function () {
      copyText(encode(), this);
      hint('Desk JSON copied.');
    });

    $('btnClear').addEventListener('click', function () {
      if (!items.length) return;
      if (!window.confirm('Clear the desk? Ctrl-Z will still bring it back this session.')) return;
      pushUndo();
      items = []; links = []; sel = {};
      renderAll(); save();
      hint('Desk cleared.');
    });

    $('trayCollapse').addEventListener('click', function () {
      var t = $('tray');
      var collapsed = t.classList.toggle('is-collapsed');
      this.setAttribute('aria-label', collapsed ? 'Expand the trays' : 'Collapse the trays');
      setTimeout(drawLinks, 220);
    });

    $('readerClose').addEventListener('click', closeReader);
    $('readerBackdrop').addEventListener('click', closeReader);

    var input = $('dq');
    input.addEventListener('input', function () { showSuggest(input.value); });
    input.addEventListener('blur', function () { setTimeout(function () { $('dsuggest').hidden = true; }, 150); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Escape') $('dsuggest').hidden = true; });
    $('deskSearch').addEventListener('submit', submitSearch);

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
    watchLateFonts();
    var restored = load();
    applyTransform();
    renderAll();
    if (restored && items.length) {
      hint('Your desk from last time. ' + items.length + ' things on it.');
      fit();
    } else {
      hint('Searches the held sources only. Nothing on this desk is generated.');
    }
    arrive();
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
