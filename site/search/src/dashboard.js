// The answers dashboard: GET /dashboard, for Matt and Rex.
//
// One private link, /dashboard?key=<DASH_TOKEN>. The key is swapped for a
// cookie scoped to /dashboard and taken out of the address bar, so the link can
// be bookmarked without the key showing. Without DASH_TOKEN set, or with the
// wrong key, the page doesn't exist (404), like /answer before launch.
//
// It reads what the answer step keeps in D1: `answer_spend` (money per day),
// `answer_log` (every question asked and what the reader got) and `answers`
// (the written answers, with their review status). Approve and Strike here do
// what scripts/answer-review.py --approve / --strike do.

import { budgets, ensureTables } from './answer.js';

const COOKIE = 'way_dash';
const DAYS = 30;

function sameKey(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function cookieKey(req) {
  const m = /(?:^|;\s*)way_dash=([^;]+)/.exec(req.headers.get('Cookie') || '');
  return m ? decodeURIComponent(m[1]) : null;
}

export function authorized(req, env) {
  return Boolean(env.DASH_TOKEN) && sameKey(cookieKey(req), env.DASH_TOKEN);
}

const notFound = () => new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

// ── The numbers ─────────────────────────────────────────────────────────────

const day = (d) => d.toISOString().slice(0, 10);

export async function stats(db, env, now = new Date()) {
  await ensureTables(db);
  const today = day(now);
  const month = today.slice(0, 7);
  const since = day(new Date(now.getTime() - (DAYS - 1) * 864e5));
  const { monthly, daily } = budgets(env);
  const one = (sql, ...args) => db.prepare(sql).bind(...args).first();
  const all = async (sql, ...args) => (await db.prepare(sql).bind(...args).all()).results || [];

  const spentToday = ((await one('SELECT usd FROM answer_spend WHERE day = ?', today)) || {}).usd || 0;
  const spentMonth = ((await one('SELECT SUM(usd) AS usd FROM answer_spend WHERE day LIKE ?', `${month}%`)) || {}).usd || 0;
  const dayOfMonth = now.getUTCDate();
  const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();

  // What readers got, this month: a written answer, one from the bank, or the
  // card and passages (over budget counted on its own).
  const kinds = await all(
    `SELECT CASE WHEN mode = 'fallback' AND reason LIKE '%budget%' THEN 'over_budget' ELSE mode END AS kind, COUNT(*) AS n
     FROM answer_log WHERE created >= ? GROUP BY kind`, `${month}-01`);
  const counts = { written: 0, bank: 0, fallback: 0, over_budget: 0 };
  for (const k of kinds) counts[k.kind] = k.n;

  const perDay = await all(
    `SELECT substr(created, 1, 10) AS day,
       SUM(mode = 'written') AS written, SUM(mode = 'bank') AS bank, SUM(mode = 'fallback') AS fallback
     FROM answer_log WHERE created >= ? GROUP BY day ORDER BY day`, since);
  const spendPerDay = await all('SELECT day, usd FROM answer_spend WHERE day >= ? ORDER BY day', since);
  const days = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = day(new Date(now.getTime() - i * 864e5));
    const p = perDay.find((r) => r.day === d) || {};
    const s = spendPerDay.find((r) => r.day === d) || {};
    days.push({ day: d, written: p.written || 0, bank: p.bank || 0, fallback: p.fallback || 0, usd: s.usd || 0 });
  }

  const avg = await one("SELECT COUNT(*) AS n, AVG(cost) AS usd FROM answer_log WHERE mode = 'written' AND cost > 0");
  const top = await all(
    `SELECT norm, MAX(question) AS question, COUNT(*) AS n, MAX(created) AS last
     FROM answer_log WHERE created >= ? GROUP BY norm ORDER BY n DESC, last DESC LIMIT 15`, since);
  const recent = await all('SELECT created, question, mode, reason, settled, answer_id FROM answer_log ORDER BY created DESC, id DESC LIMIT 25');
  // Questions the library couldn't answer well: the card and passages for a
  // reason other than money, or a written "the library doesn't settle this".
  const gaps = await all(
    `SELECT norm, MAX(question) AS question, COUNT(*) AS n, MAX(created) AS last
     FROM answer_log
     WHERE created >= ? AND ((mode = 'fallback' AND (reason IS NULL OR reason NOT LIKE '%budget%')) OR settled = 0)
     GROUP BY norm ORDER BY n DESC, last DESC LIMIT 15`, since);
  const drafts = await all(
    "SELECT id, created, question, asked, cost FROM answers WHERE status = 'draft' ORDER BY asked DESC, id DESC LIMIT 50");
  const reviewed = await all(
    "SELECT status, COUNT(*) AS n FROM answers WHERE status != 'draft' GROUP BY status");

  return {
    now: now.toISOString(),
    budget: {
      monthly, daily, today: spentToday, month: spentMonth,
      projected: dayOfMonth ? (spentMonth / dayOfMonth) * daysInMonth : 0,
      daysInMonth, dayOfMonth,
    },
    counts,
    days,
    avgCost: (avg && avg.usd) || 0,
    writtenAllTime: (avg && avg.n) || 0,
    top, recent, gaps, drafts,
    reviewed: Object.fromEntries(reviewed.map((r) => [r.status, r.n])),
  };
}

async function oneAnswer(db, id) {
  await ensureTables(db);
  const r = await db.prepare('SELECT id, created, question, status, asked, cost, answer, reviewed FROM answers WHERE id = ?').bind(id).first();
  if (!r) return null;
  return { ...r, answer: JSON.parse(r.answer) };
}

async function review(db, id, status) {
  await ensureTables(db);
  const r = await db.prepare("UPDATE answers SET status = ?, reviewed = datetime('now') WHERE id = ?").bind(status, id).run();
  return Boolean(r && r.meta && r.meta.changes);
}

// ── Routes ──────────────────────────────────────────────────────────────────

export async function handleDashboard(req, env, url) {
  if (!env.DASH_TOKEN) return notFound();

  // The link: swap the key for a cookie and drop it from the address.
  const key = url.searchParams.get('key');
  if (url.pathname === '/dashboard' && key !== null) {
    if (!sameKey(key, env.DASH_TOKEN)) return notFound();
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/dashboard',
        'Set-Cookie': `${COOKIE}=${encodeURIComponent(env.DASH_TOKEN)}; Path=/dashboard; Max-Age=31536000; HttpOnly; Secure; SameSite=Strict`,
        'Cache-Control': 'no-store',
      },
    });
  }
  if (!authorized(req, env)) return notFound();

  const db = env.TEXT;
  if (url.pathname === '/dashboard' && req.method === 'GET') {
    return new Response(PAGE, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'Referrer-Policy': 'no-referrer' } });
  }
  if (url.pathname === '/dashboard/stats' && req.method === 'GET') return json(await stats(db, env));
  const m = /^\/dashboard\/answer\/(\d+)$/.exec(url.pathname);
  if (m && req.method === 'GET') {
    const a = await oneAnswer(db, Number(m[1]));
    return a ? json(a) : notFound();
  }
  if (m && req.method === 'POST') {
    let body;
    try { body = await req.json(); } catch { return json({ error: 'POST {"status": "approved" | "struck" | "draft"}' }, 400); }
    const status = body && body.status;
    if (!['approved', 'struck', 'draft'].includes(status)) return json({ error: 'status must be approved, struck or draft' }, 400);
    return (await review(db, Number(m[1]), status)) ? json({ ok: true, id: Number(m[1]), status }) : notFound();
  }
  return notFound();
}

// ── The page ────────────────────────────────────────────────────────────────
// One file, no build: the site's Street look, readable on a phone.

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>The Way · Answers dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo+Narrow:wght@500;700&family=Inter:wght@400;500;700&display=swap">
<style>
  :root { --head: 'Anton', Impact, sans-serif; --type: 'Archivo Narrow', 'Arial Narrow', sans-serif; --mono: 'Inter', 'Helvetica Neue', Arial, sans-serif; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #fff; color: #000; font-family: var(--mono); font-size: 15px; line-height: 1.45; }
  a { color: #000; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 24px; border-bottom: 3px solid #000; }
  .brand { font-family: var(--head); font-size: 26px; text-transform: uppercase; text-decoration: none; }
  .brand b { font-weight: 400; display: inline-block; background: #000; color: #fff; padding: 0 8px 2px; transform: rotate(-2deg); }
  .updated { font-family: var(--type); font-weight: 700; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; }
  main { max-width: 1180px; margin: 0 auto; padding: 22px 24px 60px; display: grid; grid-template-columns: repeat(12, 1fr); gap: 18px; }
  .panel { grid-column: span 12; border: 4px solid #000; background: #fff; padding: 14px 16px 16px; min-width: 0; }
  .half { grid-column: span 6; }
  h2 { margin: -14px -16px 12px; padding: 6px 16px 8px; background: #000; color: #fff; font-family: var(--head); font-weight: 400; font-size: 20px; letter-spacing: .02em; text-transform: uppercase; }
  .eyebrow { font-family: var(--type); font-weight: 700; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; }
  .big { font-family: var(--head); font-size: 44px; line-height: 1; }
  .money { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .bar { height: 18px; border: 3px solid #000; margin: 8px 0 4px; position: relative; background: #fff; }
  .bar span { position: absolute; inset: 0 auto 0 0; background: #000; }
  .bar i { position: absolute; top: -3px; bottom: -3px; border-left: 3px dashed #000; }
  .note { color: #444; font-size: 13px; }
  .tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .tile { border: 3px solid #000; padding: 10px 12px; }
  .tile .big { font-size: 36px; }
  svg { display: block; width: 100%; height: auto; }
  .legend { display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px; margin-top: 6px; }
  .key { display: inline-block; width: 12px; height: 12px; border: 2px solid #000; vertical-align: -1px; margin-right: 5px; }
  ol, ul { margin: 0; padding-left: 0; list-style: none; }
  li.row { display: flex; gap: 10px; align-items: baseline; padding: 7px 0; border-top: 2px dashed #000; }
  li.row:first-child { border-top: 0; }
  .n { font-family: var(--head); font-size: 18px; min-width: 2.2em; text-align: right; }
  .q { flex: 1; min-width: 0; overflow-wrap: anywhere; }
  .when { font-family: var(--type); font-weight: 700; font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: #444; white-space: nowrap; }
  .tag { font-family: var(--type); font-weight: 700; font-size: 11px; letter-spacing: .1em; text-transform: uppercase; border: 2px solid #000; padding: 0 5px; white-space: nowrap; }
  .tag.written { background: #000; color: #fff; }
  .tag.fallback, .tag.over_budget { border-style: dashed; }
  button { font: inherit; cursor: pointer; }
  .open { background: none; border: 0; padding: 0; text-align: left; text-decoration: underline; text-underline-offset: 3px; color: #000; }
  .btn { font-family: var(--head); font-size: 15px; text-transform: uppercase; letter-spacing: .02em; border: 3px solid #000; background: #fff; color: #000; padding: 6px 14px; min-height: 40px; }
  .btn.approve { background: #000; color: #fff; }
  .btn:hover { background: #333; color: #fff; }
  .empty { color: #444; font-style: italic; }
  dialog { width: min(760px, calc(100% - 24px)); max-height: calc(100% - 40px); border: 4px solid #000; padding: 0; }
  dialog::backdrop { background: rgba(0,0,0,.45); }
  .dlg-head { position: sticky; top: 0; background: #fff; border-bottom: 3px solid #000; padding: 10px 14px; display: flex; gap: 10px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
  .dlg-body { padding: 14px 16px 20px; }
  .ans-label { font-family: var(--type); font-weight: 700; font-size: 12px; letter-spacing: .14em; text-transform: uppercase; margin: 0 0 6px; }
  .ans-short { font-family: var(--head); font-size: 22px; line-height: 1.1; text-transform: uppercase; margin: 6px 0 12px; }
  .ans-quote { margin: 10px 0; padding: 8px 12px; border-left: 6px solid #000; background: #f2f2f2; }
  .ans-quote p { margin: 0 0 4px; }
  .ans-quote cite { font-style: normal; font-size: 13px; }
  .ans-background { border: 3px dashed #000; padding: 8px 12px; margin: 10px 0; }
  .warn { border: 3px solid #000; padding: 6px 10px; margin-bottom: 10px; font-size: 13px; }
  @media (max-width: 820px) {
    header { padding: 10px 14px; }
    .brand { font-size: 20px; }
    main { padding: 14px 12px 40px; gap: 14px; }
    .half { grid-column: span 12; }
    .money { grid-template-columns: 1fr; gap: 10px; }
    .tiles { grid-template-columns: repeat(2, 1fr); }
    .big { font-size: 36px; }
    li.row { flex-wrap: wrap; }
    .row .when { width: 100%; padding-left: calc(2.2em + 10px); }
  }
</style>
</head>
<body>
<header>
  <a class="brand" href="https://nazareneway.com/">The Way <b>Answers</b></a>
  <span class="updated" id="updated">loading…</span>
</header>
<main>
  <section class="panel"><h2>The budget</h2><div class="money" id="money"></div></section>
  <section class="panel"><h2>What readers got this month</h2><div class="tiles" id="tiles"></div></section>
  <section class="panel"><h2>Questions per day · last 30 days</h2><div id="chart"></div>
    <div class="legend"><span><i class="key" style="background:#000"></i>written</span><span><i class="key" style="background:#888"></i>from the bank (free)</span><span><i class="key" style="background:#fff"></i>card + passages</span><span><i class="key" style="border-style:dashed"></i>money spent (line)</span></div></section>
  <section class="panel half"><h2>Most asked · 30 days</h2><ol id="top"></ol></section>
  <section class="panel half"><h2>Gaps · candidate cards</h2><p class="note">Questions that got the card and passages instead of an answer, or an answer that says the library doesn't settle it.</p><ol id="gaps"></ol></section>
  <section class="panel"><h2>To review</h2><p class="note">Written answers not yet checked. Approve: served free to anyone who asks the same thing, marked "checked by a person". Strike: never shown again.</p><ol id="drafts"></ol></section>
  <section class="panel"><h2>Most recent</h2><ol id="recent"></ol></section>
</main>
<dialog id="dlg"><div class="dlg-head"><span class="eyebrow" id="dlgStatus"></span><span><button class="btn approve" id="dlgApprove">Approve</button> <button class="btn" id="dlgStrike">Strike</button> <button class="btn" id="dlgClose" aria-label="Close">×</button></span></div><div class="dlg-body" id="dlgBody"></div></dialog>
<script>
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var usd = function (n) { return '$' + (n || 0).toFixed(2); };
  var when = function (iso) { var d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); };
  var KIND = { written: 'written', bank: 'from the bank', fallback: 'card + passages', over_budget: 'over budget' };

  function money(b) {
    var box = $('money'); box.innerHTML = '';
    [['Today', b.today, b.daily, 'of ' + usd(b.daily) + ' a day'],
     ['This month', b.month, b.monthly, 'of ' + usd(b.monthly) + ' a month'],
     ['Month-end at this pace', b.projected, b.monthly, 'day ' + b.dayOfMonth + ' of ' + b.daysInMonth]].forEach(function (r) {
      var d = el('div');
      d.appendChild(el('div', 'eyebrow', r[0]));
      d.appendChild(el('div', 'big', usd(r[1])));
      var bar = el('div', 'bar'), fill = el('span');
      fill.style.width = Math.min(100, (r[1] / r[2]) * 100).toFixed(1) + '%';
      bar.appendChild(fill); d.appendChild(bar);
      d.appendChild(el('div', 'note', r[3] + (r[1] >= r[2] ? ' · cap reached: readers get the card and passages' : '')));
      box.appendChild(d);
    });
  }

  function tiles(c, avg, n) {
    var box = $('tiles'); box.innerHTML = '';
    [['written', c.written], ['bank', c.bank], ['fallback', c.fallback], ['over_budget', c.over_budget]].forEach(function (t) {
      var d = el('div', 'tile');
      d.appendChild(el('div', 'eyebrow', KIND[t[0]]));
      d.appendChild(el('div', 'big', String(t[1] || 0)));
      box.appendChild(d);
    });
    var d = el('div', 'tile'); d.style.gridColumn = '1 / -1';
    d.appendChild(el('div', 'eyebrow', 'Average cost of a written answer'));
    d.appendChild(el('div', 'big', n ? '$' + avg.toFixed(3) : '-'));
    d.appendChild(el('div', 'note', n ? n + ' written so far' : 'none yet'));
    box.appendChild(d);
  }

  function chart(days) {
    var W = 720, H = 200, P = 26, bw = (W - P) / days.length;
    var max = Math.max(4, Math.max.apply(null, days.map(function (d) { return d.written + d.bank + d.fallback; })));
    var maxUsd = Math.max(0.05, Math.max.apply(null, days.map(function (d) { return d.usd; })));
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + (H + 22));
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Questions per day for the last 30 days');
    function add(tag, attrs) { var e = document.createElementNS(ns, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; }
    add('line', { x1: P, y1: H, x2: W, y2: H, stroke: '#000', 'stroke-width': 2 });
    var t = add('text', { x: 0, y: 12, 'font-size': 11, 'font-family': 'Inter, sans-serif' }); t.textContent = max;
    var pts = [];
    days.forEach(function (d, i) {
      var x = P + i * bw + 2, w = Math.max(2, bw - 4), y = H;
      [['written', '#000'], ['bank', '#888'], ['fallback', '#fff']].forEach(function (k) {
        var h = (d[k[0]] / max) * (H - 16);
        if (!h) return;
        y -= h;
        var r = add('rect', { x: x, y: y, width: w, height: h, fill: k[1], stroke: '#000', 'stroke-width': 1.5 });
        var tt = document.createElementNS(ns, 'title'); tt.textContent = d.day + ': ' + d[k[0]] + ' ' + KIND[k[0]]; r.appendChild(tt);
      });
      pts.push((x + w / 2).toFixed(1) + ',' + (H - (d.usd / maxUsd) * (H - 16)).toFixed(1));
      var last = i === days.length - 1;
      if (i % 5 === 0 || last) { var lb = add('text', { x: last ? x + w : x, y: H + 16, 'font-size': 11, 'font-family': 'Inter, sans-serif', 'text-anchor': last ? 'end' : 'start' }); lb.textContent = d.day.slice(5); }
    });
    add('polyline', { points: pts.join(' '), fill: 'none', stroke: '#000', 'stroke-width': 2, 'stroke-dasharray': '5 4' });
    $('chart').innerHTML = ''; $('chart').appendChild(svg);
  }

  function rows(id, items, render, empty) {
    var box = $(id); box.innerHTML = '';
    if (!items.length) { box.appendChild(el('li', 'empty', empty)); return; }
    items.forEach(function (it) { var li = el('li', 'row'); render(li, it); box.appendChild(li); });
  }

  function opener(text, id) {
    if (!id) return el('span', 'q', text);
    var b = el('button', 'open q', text);
    b.addEventListener('click', function () { openAnswer(id); });
    return b;
  }

  // ── reading one answer, as the site shows it ──
  function cited(text) { return el('p', null, String(text || '')); }
  function quoted(item) {
    var bq = el('blockquote', 'ans-quote');
    bq.appendChild(el('p', null, item.text || item.quote || ''));
    var c = el('cite'), a = el('a', null, item.ref ? item.ref + ' (KJV)' : (item.title || '') + ' · ' + (item.header || ''));
    a.href = item.url || '#'; a.target = '_blank'; a.rel = 'noopener';
    c.appendChild(document.createTextNode('— ')); c.appendChild(a); bq.appendChild(c);
    return bq;
  }
  function labelled(label, text) { var p = cited(text); p.insertBefore(el('b', null, label + ' '), p.firstChild); return p; }

  function render(box, res) {
    var a = res.answer || {};
    if (res.warnings && res.warnings.length) box.appendChild(el('div', 'warn', 'Flags: ' + res.warnings.join(' · ')));
    if (res.card) { var cp = el('p'); cp.appendChild(el('b', null, 'The card for this: ')); cp.appendChild(document.createTextNode(res.card.title)); box.appendChild(cp); }
    box.appendChild(el('p', 'ans-label', res.label || ''));
    if (a.answerable === false) {
      box.appendChild(el('p', 'ans-short', 'The library doesn’t settle this yet.'));
      box.appendChild(cited(a.short_answer));
      if (a.not_settled) box.appendChild(cited(a.not_settled));
      if (a.background) { var bg = el('div', 'ans-background'); bg.appendChild(el('p', 'ans-label', res.backgroundLabel || 'General background, not from our library.')); bg.appendChild(cited(a.background)); box.appendChild(bg); }
      return;
    }
    box.appendChild(el('p', 'ans-short', a.short_answer || ''));
    (a.jesus_words || []).forEach(function (w) { box.appendChild(quoted(w)); });
    if (a.mainstream) box.appendChild(labelled('The usual reading:', a.mainstream));
    if (a.library_view) box.appendChild(labelled('What the library finds:', a.library_view));
    (a.supporting || []).forEach(function (w) { box.appendChild(quoted(w)); });
    if (a.against && (a.against.text || a.against.quote)) { box.appendChild(el('p')).appendChild(el('b', null, 'The strongest verse the other way:')); box.appendChild(quoted(a.against)); if (a.against.note) box.appendChild(cited(a.against.note)); }
    else if (a.against && a.against.note) box.appendChild(labelled('The other side:', a.against.note));
    if (a.not_settled) box.appendChild(labelled('Not settled:', a.not_settled));
    if (a.background) { var bg2 = el('div', 'ans-background'); bg2.appendChild(el('p', 'ans-label', res.backgroundLabel || 'General background, not from our library.')); bg2.appendChild(cited(a.background)); box.appendChild(bg2); }
  }

  var current = null;
  function openAnswer(id) {
    fetch('/dashboard/answer/' + id, { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (a) {
      current = a;
      var body = $('dlgBody'); body.innerHTML = '';
      body.appendChild(el('p', 'eyebrow', 'Asked ' + a.asked + '× · ' + when(a.created) + ' · ' + '$' + (a.cost || 0).toFixed(3)));
      body.appendChild(el('h3', 'ans-short', a.question));
      render(body, a.answer);
      $('dlgStatus').textContent = a.status === 'draft' ? 'Not yet checked' : a.status;
      $('dlg').showModal();
    });
  }
  function mark(status) {
    if (!current) return;
    fetch('/dashboard/answer/' + current.id, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: status }) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); $('dlg').close(); load(); })
      .catch(function () { $('dlgStatus').textContent = 'Could not save. Try again.'; });
  }
  $('dlgApprove').addEventListener('click', function () { mark('approved'); });
  $('dlgStrike').addEventListener('click', function () { mark('struck'); });
  $('dlgClose').addEventListener('click', function () { $('dlg').close(); });

  function load() {
    fetch('/dashboard/stats', { credentials: 'same-origin' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (s) {
      $('updated').textContent = 'updated ' + when(s.now);
      money(s.budget);
      tiles(s.counts, s.avgCost, s.writtenAllTime);
      chart(s.days);
      rows('top', s.top, function (li, r) { li.appendChild(el('span', 'n', r.n + '×')); li.appendChild(el('span', 'q', r.question)); li.appendChild(el('span', 'when', when(r.last))); }, 'No questions yet.');
      rows('gaps', s.gaps, function (li, r) { li.appendChild(el('span', 'n', r.n + '×')); li.appendChild(el('span', 'q', r.question)); li.appendChild(el('span', 'when', when(r.last))); }, 'No gaps yet.');
      rows('drafts', s.drafts, function (li, r) { li.appendChild(el('span', 'n', r.asked + '×')); li.appendChild(opener(r.question, r.id)); li.appendChild(el('span', 'when', when(r.created))); }, 'Nothing to review. Every written answer has been checked.');
      rows('recent', s.recent, function (li, r) {
        var kind = r.mode === 'fallback' && /budget/.test(r.reason || '') ? 'over_budget' : r.mode;
        li.appendChild(el('span', 'tag ' + kind, KIND[kind] || kind));
        li.appendChild(opener(r.question, r.answer_id));
        li.appendChild(el('span', 'when', when(r.created)));
      }, 'No questions yet.');
    }).catch(function () { $('updated').textContent = 'could not load the numbers'; });
  }
  load();
})();
</script>
</body>
</html>`;
