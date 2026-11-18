/* Builds site/data/desks/what-did-john-the-baptist-eat.json: "What did John the Baptist eat?"

   Written for a stranger (CONTRIBUTING.md, "Write for a stranger"): the question and the
   texts carry it, both readings are laid out without teams, and the public debate where it
   came up (guest appearance 13 in the archive, 3:07 to 3:15) sits at the end as further
   listening, with no speakers named.

   Every stamped card is a held source or a KJV verse; the debate moments are
   pointers, not proof; quotations inside notes are copied from held files, named
   with their path. Same method as make-kam-desk.js: lay out, measure every card
   in a real browser, lay out again with the real heights. */
const puppeteer = require('puppeteer-core');
const { CHROME, URL } = require('./env');
const fs = require('fs');
const SLUG = 'what-did-john-the-baptist-eat';
const OUT = require('path').join(__dirname, '..', '..', 'data', 'desks', SLUG + '.json');

const SC = 'sacrifice-culture-vegetarian-jesus';
const DEBATE = 'kam-guest-13';
const W = 250, GAP = 22, GAPX = 26, PAD = 26, FRAME_GAP = 90, ROW_GAP = 130;

const S = (c, i) => ({ k: 's', c, i, id: `s:${c}:${i}` });
const Q = c => ({ k: 'q', c, id: `q:${c}`, w: 270 });
const V = key => ({ k: 'v', key, id: `v:${key}` });
const D = path => ({ k: 'd', path, id: `d:${path}` });
const N = (name, text, w) => ({ k: 'n', name, text, w: w || W });
const M = (phrase, speaker) => ({ k: 'm', key: DEBATE, phrase, speaker, id: `m:${DEBATE}|${phrase}` });
const X = (url, title, quote) => ({ k: 'w', url, title, quote, id: `w:${url}|${quote}` });

const DAMASCUS = X('https://www.essene.com/History%26Essenes/cd.htm',
  'Damascus Document XII 11-15, "Of food" (translator not named on the page)',
  'As for the various kinds of locust, these are to be put in fire or water while they are still alive');

const notes = {

  res: N('res', 'WHAT DID JOHN THE BAPTIST EAT?\n\n' +
    'The gospels say locusts and wild honey (Matthew 3:4, Mark 1:6), and every ancient ' +
    'manuscript of them we know of agrees.\n\n' +
    'But one early Jewish-Christian gospel, quoted around 375 by Epiphanius, who opposed ' +
    'the group that used it, said wild honey "which tasted of manna, like a cake made ' +
    'with oil", and no locusts. In Greek the two words are one letter apart: AKRIS, ' +
    'locust, and ENKRIS, cake.\n\n' +
    'The locust reading has the earlier and wider evidence. The honey-cake reading is ' +
    'old and deliberate, built on the Greek Bible\'s words for manna, so it is not a ' +
    'modern invention. And one detail softens the whole dispute: Epiphanius, who ' +
    'defended the locusts, also said John ate no meat.', 560),

  how: N('how', 'HOW TO READ THIS BOARD\n\n' +
    'Stamped cards are real sources: KJV verses, and sources on the case files, checked ' +
    'by the build against texts the library holds.\n\n' +
    'Notes are ours. Where a note quotes a text, it gives the file the words were copied ' +
    'from, so anyone can check them.\n\n' +
    'The moment cards at the end are from a public debate where this question came up, ' +
    'with a ▶ link to the second each line was said. They are pointers, not proof.\n\n' +
    'Press → to walk it section by section.', 540),

  /* 1 · locusts */

  l0: N('l0', 'THE CASE FOR LOCUSTS\n\n' +
    'It is the reading of every gospel text we hold, it was lawful food, a Jewish ' +
    'community of the same era wrote rules for eating it, and the early writers we hold ' +
    'who mention John\'s food all read it.\n\n' +
    'The strongest single point: Mark, the gospel most scholars date earliest, says ' +
    'locusts, and the honey-cake reading survives only in a hostile quotation from the ' +
    'fourth century.'),

  greek: N('greek', 'THE GREEK\n\n' +
    'Matthew 3:4 (Westcott-Hort): "η δε τροφη ην αυτου ακριδες και μελι αγριον", his food ' +
    'was locusts and wild honey.\n\n' +
    'Mark 1:6: "και εσθων ακριδας και μελι αγριον", and eating locusts and wild honey.\n\n' +
    '(christianity/Incoming/greek-nt-westcott-hort/01-matthew.md, 02-mark.md)\n\n' +
    'We know of no Greek manuscript of either gospel that reads cake here. Confirming ' +
    'that properly needs a critical apparatus, which the library does not hold yet.'),

  lawful: N('lawful', 'LAWFUL FOOD\n\n' +
    'Leviticus 11:22 names four kinds of locust as clean, the one class of insect the ' +
    'Law allows. A Torah-keeping Jew in the wilderness could eat them.'),

  qumran: N('qumran', 'A COMMUNITY OF JOHN\'S ERA ATE THEM\n\n' +
    'The Damascus Document, a rule book of the movement behind the Dead Sea Scrolls, ' +
    'sets out how locusts are to be killed, and in the same passage how fish are to be ' +
    'bled. It shows a strict Jewish community near John\'s world treating locusts as ' +
    'food. It does not tell us what John himself ate.\n\n' +
    'Not held: the page beside this is outside the library and names no translator. ' +
    'A named translation is on the list in section 5.'),

  fathers: N('fathers', 'THE EARLY WRITERS WE HOLD SAY LOCUSTS\n\n' +
    'Justin Martyr, about 155: John was "eating nothing but locusts and wild honey" ' +
    '(Dialogue with Trypho 88; christianity/Incoming/justin-martyr-dialogue-with-trypho-full-text.md).\n\n' +
    'Jerome, around 400: John "had for his meat locusts and wild honey" (Letter 107, to ' +
    'Laeta), and "his diet of locusts and wild honey" was designed "to encourage virtue ' +
    'and continence" (Letter 125, to Rusticus; christianity/Incoming/jerome-letters-full-text.md).'),

  notmeat: N('notmeat', 'A TWIST: EPIPHANIUS DID NOT COUNT LOCUSTS AS MEAT\n\n' +
    'Panarion 30,19,3: "\'not eating nor drinking\' means that John took no share of meat ' +
    'or wine, but partook only of locusts and honey — and plainly of water too."\n\n' +
    '(christianity/Incoming/epiphanius-panarion-book-1-full-text.md, 30,19,3)\n\n' +
    'So the man who defends the locusts against the honey-cake gospel also says John ' +
    'ate no meat. On his reading, locusts and a fleshless John are not in conflict.', 270),

  /* 2 · the cake */

  k0: N('k0', 'THE CASE FOR THE HONEY CAKE\n\n' +
    'The gospel Epiphanius says the Ebionites used, a Jewish-Christian movement, had John ' +
    'living on wild honey that tasted of manna: the bread from heaven Israel ate in the ' +
    'wilderness. The gospels\' own words about John\'s food fit that picture: ' +
    'Nazirite-style abstinence from the womb, "neither eating bread nor drinking wine". ' +
    'And early tradition remembered James, the brother of Jesus, as eating no flesh.\n\n' +
    'Its weakness is that we have the verse only from its opponent, in one quotation, ' +
    'with no manuscript of the gospel itself.'),

  pan: N('pan', 'THE VERSE ITSELF\n\n' +
    'Panarion 30,13,4b-c (trans. Craig Wescoe): "And John had clothing made from ' +
    'camel\'s hair, and a belt of leather round his loins. And his food, it says, was ' +
    'wild honey, which tasted of manna, like a cake made with oil".\n\n' +
    '30,13,5: "so that, no doubt, they may turn the word of truth into a lie and make ' +
    'it a cake in honey instead of locusts."\n\n' +
    'The Greek, checked against Holl\'s edition, has ἐγκρίς (cake) "instead of" ' +
    'ἀκρίδων (locusts).\n\n' +
    '(christianity/Incoming/epiphanius-panarion-book-1-full-text.md; ' +
    'audits/2026-10-20-panarion-quotations.md, row 38)', 270),

  manna: N('manna', 'NOT A RANDOM WORD: IT IS THE MANNA WORD\n\n' +
    'The Septuagint, the Greek Bible, describes manna with this word. Brenton\'s ' +
    'translation renders it "wafer" both times:\n\n' +
    'Exodus 16:31: "the taste of it as a wafer with honey."\n' +
    'Numbers 11:8: "the sweetness of it was as the taste [of] wafer made with oil."\n\n' +
    '(christianity/Incoming/septuagint-brenton/02-exodus.md, 04-numbers.md)\n\n' +
    'The honey-cake verse joins the two: honey, manna, a cake made with oil. Whoever ' +
    'wrote it knew the Greek Bible and was making John the man who lived on wilderness ' +
    'bread. We hold Brenton\'s English, not the Greek of the Septuagint, so the word ' +
    'itself is checked through the claims file (claims/bible-greek-hebrew.md), not here.', 270),

  kings: N('kings', 'CAKES AND HONEY FOR A PROPHET\n\n' +
    'The Greek Bible\'s 3 Kingdoms 12:24i (Brenton): "And the woman arose, and took in ' +
    'her hand bread, and two cakes, and grapes, and a pot of honey, for Achia".\n\n' +
    '(christianity/Incoming/septuagint-brenton/11-1-kings.md)\n\n' +
    'Food brought to a prophet: bread, cakes and honey. The Hebrew of the same story ' +
    '(KJV 1 Kings 14:3, beside this) has loaves, cracknels and a cruse of honey.'),

  nazirite: N('nazirite', 'WHAT ELSE THE GOSPELS SAY ABOUT HIS FOOD\n\n' +
    'Luke 1:15: he "shall drink neither wine nor strong drink", the language of the ' +
    'Nazirite vow (Numbers 6:3), from birth.\n\n' +
    'Luke 7:33: he "came neither eating bread nor drinking wine". Matthew 11:18: ' +
    '"neither eating nor drinking".\n\n' +
    'These describe abstinence, not a menu. They fit a John who did not eat what ' +
    'others ate. They do not settle which wilderness food he did eat.'),

  james: N('james', 'A PARALLEL: JAMES\n\n' +
    'Hegesippus says James, the brother of Jesus, was holy from his mother\'s womb, ' +
    'drank no wine and ate no flesh. A fleshless John in the honey-cake gospel sits ' +
    'beside a fleshless James in Hegesippus: the same picture of holiness. The source ' +
    'card is beside this.'),

  /* 3 · carob */

  carob: N('carob', 'WHAT ABOUT CAROB?\n\n' +
    'Carob pods are sometimes put forward as what John\'s "locusts" really were.\n\n' +
    'What holds: carob pods are a real wilderness food, and the gospels name them. The ' +
    '"husks that the swine did eat" in Luke 15:16 are κερατια, carob pods, in the ' +
    'Greek (Westcott-Hort: "εκ των κερατιων"). Carob is still called "locust bean" and ' +
    '"St John\'s bread" in English.\n\n' +
    'What doesn\'t hold yet: no ancient text we hold says John ate carob. The names ' +
    'connect the carob to John; they do not show who first connected them, or when. ' +
    'Finding that source is on the list in section 5.\n\n' +
    'Different from the honey cake: the cake is a reading in an ancient gospel; the ' +
    'carob is an interpretation of the word locust.', 270),

  /* 4 · how to weigh it */

  h0: N('h0', 'IN ONE SENTENCE\n\n' +
    '"Our earliest gospel says John ate locusts. A gospel used by the Ebionites, a ' +
    'Jewish-Christian movement, quoted by Epiphanius, said honey that tasted of manna, ' +
    'using the Greek Bible\'s own word for it. So a fleshless John is an old reading, ' +
    'not a modern invention. Which reading came first is contested."', 540),

  over1: N('over1', 'PUSHING THE HONEY-CAKE READING TOO FAR\n\n' +
    '"We know for certain it was not insects." No text we hold supports certainty.\n\n' +
    '"The church fathers kept a honey-cake tradition." The early writers we hold say ' +
    'locusts; the cake is one gospel, quoted once, by its opponent.\n\n' +
    '"It was carob." A later interpretation, not an ancient reading, until an early ' +
    'source turns up.'),

  over2: N('over2', 'PUSHING THE LOCUST READING TOO FAR\n\n' +
    '"Epiphanius proves they changed it." He assumes it. He writes as their opponent, ' +
    'and the one-letter pun shows only that the two readings met in Greek.\n\n' +
    '"Locusts make John a meat-eater." Epiphanius himself says John ate no meat and ' +
    'still ate locusts (30,19,3). And the Damascus Document gives locusts a rule of ' +
    'their own, next to the rule for fish.'),

  direction: N('direction', 'WHICH CAME FIRST? THE HONEST STATE OF IT\n\n' +
    'A pun that only works in Greek tells you the difference arose in Greek. It does ' +
    'not tell you which word came first.\n\n' +
    'FOR LOCUSTS FIRST: Mark is usually dated earliest; every gospel manuscript we know ' +
    'of reads locusts; the Ebionite gospel looks to most scholars like a later Greek ' +
    'text that draws on the canonical ones.\n\n' +
    'FOR THE CAKE FIRST: some scholars argue that the Hebrew gospel kept by ' +
    'Jewish-Christian groups was early, so its readings could be older than the Greek ' +
    'gospels. How the Ebionite gospel relates to that Hebrew gospel is itself disputed ' +
    '(James R. Edwards has written on both).\n\n' +
    'That is a question about the whole Hebrew gospel, not this one verse. The verse ' +
    'cannot settle it by itself.'),

  /* 5 · open */

  acq: N('acq', 'WHAT WE WOULD LIKE TO GET HOLD OF\n\n' +
    '1. THE DAMASCUS DOCUMENT in a named public-domain translation (Schechter 1910), so ' +
    'the locust rule can be held, not just pointed at.\n\n' +
    '2. A CRITICAL APPARATUS for Matthew 3:4 and Mark 1:6, to state exactly what the ' +
    'manuscripts read.\n\n' +
    '3. THE FIRST SOURCE THAT TIES CAROB TO JOHN, with its date.\n\n' +
    '4. ISIDORE OF PELUSIUM, reported to have read John\'s akrides as the tips of plants ' +
    'rather than insects. Unchecked: we have not seen the text.\n\n' +
    '5. THE SLAVONIC JOSEPHUS on John, reported to describe a Baptist who ate no flesh. ' +
    'A late and disputed text; worth holding so it can be described exactly.\n\n' +
    '6. JAMES R. EDWARDS, The Hebrew Gospel and the Development of the Synoptic ' +
    'Tradition (2009), the main scholarship for an early Hebrew gospel. In copyright: ' +
    'notes and short quotes only.'),

  close: N('close', 'WHERE THIS GOES NEXT\n\n' +
    'This board is the groundwork for a section on the sacrifice question card: the ' +
    'objection "John ate locusts", the variant stated exactly, and the honest limit. ' +
    'The card changes only after the sources here have been checked.'),

  /* 6 · further listening */

  listen: N('listen', 'FURTHER LISTENING\n\n' +
    'This question came up in a public debate on whether Jesus rejected animal ' +
    'sacrifice (YouTube, October 2026), from 3:07:34. The cards beside this jump to the ' +
    'second each line was said.\n\n' +
    'They are auto-captions with no speaker labels: pointers to the conversation, not ' +
    'evidence. The sections above say what the texts show.')
};

const header = { items: [notes.res, notes.how, Q(SC)] };

const rows = [
  [
    { title: '1 · THE CASE FOR LOCUSTS', ci: 1,
      cols: [[notes.l0, V('Mark 1:6'), V('Matthew 3:4')],
             [notes.greek, notes.lawful, V('Leviticus 11:22')],
             [notes.qumran, DAMASCUS],
             [notes.fathers, notes.notmeat]] },
    { title: '2 · THE CASE FOR THE HONEY CAKE', ci: 2,
      cols: [[notes.k0, notes.pan],
             [notes.manna, V('Exodus 16:31'), V('Numbers 11:8')],
             [notes.kings, V('1 Kings 14:3'), notes.nazirite],
             [V('Luke 1:15'), V('Luke 7:33'), V('Matthew 11:18'), notes.james, S(SC, 14)]] }
  ],
  [
    { title: '3 · WHAT ABOUT CAROB?', ci: 3,
      cols: [[notes.carob], [V('Luke 15:16')]] },
    { title: '4 · HOW TO WEIGH IT', ci: 0,
      cols: [[notes.h0, notes.direction], [notes.over1, notes.over2]] }
  ],
  [
    { title: '5 · STILL OPEN', ci: 2,
      cols: [[notes.acq], [notes.close]] },
    { title: 'GO DEEPER', ci: 1,
      cols: [[D('christianity/hebrew-gospel-of-matthew.md'),
              D('questions/nazarene-sect-sacrifice-and-diet.md'),
              D('christianity/biblical-case-for-vegetarian-jesus.md'),
              D('christianity/james-the-just-key-to-understanding-jesus.md')]] }
  ],
  [
    { title: '6 · FURTHER LISTENING', ci: 3,
      cols: [[notes.listen],
             [M('Then what about the the locust and the honeycomb?'),
              M('making cakes something in Greek into locust something in Greek')],
             [M('So, when you when you look at the pun, it can cut both ways.'),
              M('The Gospels say that John ate locusts')],
             [M('I believe the Greek is earlier than the Hebrew')]] }
  ]
];

const mid = p => `m:${DEBATE}|${p}`;
const strings = [
  ['res', 'how'], ['res', `q:${SC}`], ['res', 'l0'], ['res', 'k0'],

  ['l0', 'v:Mark 1:6'], ['v:Mark 1:6', 'v:Matthew 3:4'], ['l0', 'greek'],
  ['lawful', 'v:Leviticus 11:22'], ['qumran', `w:${DAMASCUS.url}|${DAMASCUS.quote}`],
  ['fathers', 'notmeat'],

  ['k0', 'pan'], ['pan', 'manna'], ['manna', 'v:Exodus 16:31'], ['manna', 'v:Numbers 11:8'],
  ['kings', 'v:1 Kings 14:3'], ['k0', 'nazirite'], ['nazirite', 'v:Luke 1:15'],
  ['nazirite', 'v:Luke 7:33'], ['v:Luke 7:33', 'v:Matthew 11:18'],
  ['james', `s:${SC}:14`], ['k0', 'james'], ['manna', 'kings'],

  ['carob', 'v:Luke 15:16'],

  ['notmeat', 'over2'], ['pan', 'over2'], ['carob', 'over1'],
  ['h0', 'direction'], ['direction', 'acq'], ['carob', 'acq'], ['qumran', 'acq'],
  ['close', 'res'], ['close', 'd:questions/nazarene-sect-sacrifice-and-diet.md'],
  ['k0', 'd:christianity/hebrew-gospel-of-matthew.md'],

  ['listen', mid('Then what about the the locust and the honeycomb?')],
  [mid('making cakes something in Greek into locust something in Greek'), 'pan'],
  [mid('I believe the Greek is earlier than the Hebrew'), 'direction']
];

const keyOf = item => item.k === 'n' ? 'n:' + item.name : item.id;

function layout(H) {
  const h = it => H[keyOf(it)] || 150;
  const it = [], pos = {};
  const place = (x, y, item) => { pos[keyOf(item)] = { x, y, item }; };
  let x = 0;
  header.items.forEach(item => { place(x, 0, item); x += (item.w || W) + 40; });
  let y = Math.max.apply(null, header.items.map(i => h(i))) + ROW_GAP;
  const frames = [];
  rows.forEach(row => {
    let fx = 0, rowH = 0;
    row.forEach(f => {
      const top = y + PAD;
      let cx = fx + PAD, tallest = 0;
      f.cols.forEach(col => {
        let cy = top;
        const cw = Math.max.apply(null, col.map(i => i.w || W));
        col.forEach(item => { place(cx, cy, item); cy += h(item) + GAP; });
        tallest = Math.max(tallest, cy - GAP - top);
        cx += cw + GAPX;
      });
      const fw = cx - GAPX + PAD - fx, fh = tallest + PAD * 2;
      frames.push({ title: f.title, x: fx, y, w: fw, h: fh, ci: f.ci });
      rowH = Math.max(rowH, fh);
      fx += fw + FRAME_GAP;
    });
    y += rowH + ROW_GAP + 20;
  });
  let seq = 1;
  const idOf = {};
  frames.forEach(f => { it.push(['f', f.title, f.x, f.y, f.w, f.h, f.ci]); seq++; });
  Object.keys(pos).forEach(k => {
    const { x, y, item } = pos[k];
    if (item.k === 's') it.push(['s', item.c, item.i, x, y, W]);
    else if (item.k === 'q') it.push(['q', item.c, x, y, item.w]);
    else if (item.k === 'v') it.push(['v', item.key, x, y, W]);
    else if (item.k === 'd') it.push(['d', item.path, x, y, W]);
    else if (item.k === 'm') it.push(item.speaker ? ['m', item.key, item.phrase, x, y, W, item.speaker] : ['m', item.key, item.phrase, x, y, W]);
    else if (item.k === 'w') it.push(['w', item.url, item.title, item.quote, x, y, W]);
    else if (item.k === 'n') { it.push(['n', item.text, x, y, item.w]); idOf[item.name] = 'n:' + seq; seq++; }
  });
  const ln = strings.map(([a, b, words]) => {
    const pair = [idOf[a] || a, idOf[b] || b];
    return words ? pair.concat([words]) : pair;
  });
  return { v: 1, vp: [40, 40, 0.3], it, ln };
}

const FILE = d => ({
  slug: SLUG,
  title: 'What did John the Baptist eat?',
  subtitle: 'Locusts, say Matthew and Mark. Honey that tasted of manna, says a Jewish-Christian gospel quoted by Epiphanius. The texts behind each reading, which came first, and what is still open.',
  by: 'Rex',
  listed: false,
  desk: d
});

(async () => {
  // The page reads prepared desks from desk.json, so moments and outside pages only
  // render once the build has seen this file: write a first draft, then build, then measure.
  const draft = layout({});
  fs.writeFileSync(OUT, JSON.stringify(FILE(draft), null, 1) + '\n', 'utf8');
  if (process.argv.includes('--draft-only')) { console.log('draft written'); return; }
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', defaultViewport: { width: 1600, height: 1000 }, args: ['--no-sandbox'] });
  const measure = async () => {
    const p = await (await browser.createBrowserContext()).newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL + '#desk=' + SLUG, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 2500));
    const m = await p.evaluate(() => {
      const out = {};
      [].slice.call(document.querySelectorAll('.nodes .node')).forEach(n => {
        const ta = n.querySelector('textarea');
        out[n.getAttribute('data-id')] = { h: n.offsetHeight, text: ta ? ta.value : null, raw: n.innerText.slice(0, 600) };
      });
      return { out, strings: document.querySelectorAll('#links .string-line').length };
    });
    if (errs.length) throw new Error(errs.join(' | '));
    return m;
  };
  const m1 = await measure();
  const H = {};
  Object.keys(m1.out).forEach(id => {
    const r = m1.out[id];
    const n = Object.values(notes).find(n => r.text != null ? n.text === r.text : false);
    if (n) H['n:' + n.name] = r.h; else H[id] = r.h;
  });
  console.log(JSON.stringify({ rendered: Object.keys(m1.out).length, strings: m1.strings }));
  fs.writeFileSync(OUT, JSON.stringify(FILE(layout(H)), null, 1) + '\n', 'utf8');
  fs.writeFileSync(require('path').join(require('os').tmpdir(), 'locust-measure.json'), JSON.stringify(m1, null, 1));
  await browser.close();
})().catch(e => { console.error('GEN ERROR', e); process.exit(2); });
