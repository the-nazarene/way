// Verse references: "John 14:28", "1 Thess 4:17", "Amos 5:21-25", "Psalm 23".
//
// A search by meaning can't find a verse by its number: "Matthew 9:13" embeds
// as a few tokens that look like nothing in particular. So a reference is
// read here and answered from the held KJV itself
// (christianity/Incoming/kjv/, one verse per line as "**c:v** text"), word for
// word, before the search by meaning runs. The book file is fetched from the
// repo on GitHub and kept in Cloudflare's cache for a day; the KJV doesn't
// change, and this keeps the Worker free of a 4 MB bundle and of a build step.

const RAW = 'https://raw.githubusercontent.com/the-nazarene/way/main';
const BLOB = 'https://github.com/the-nazarene/way/blob/main';
const DIR = 'christianity/Incoming/kjv';
const MAX_VERSES = 30;   // a range or a whole chapter is cut here
const MAX_REFS = 3;      // references read from one query
export const KJV_SOURCE = 'King James Version (1611; 1769 Oxford text, Project Gutenberg #10). Public domain. Quoted word for word from the held file.';

// [file, name as cited, the other ways people write it]. Numbered books are
// listed once, without the number; NUMBERED says which files go with 1, 2, 3.
// Two-letter forms that are also English words ("is", "am") are left out.
const BOOKS = [
  ['01-genesis', 'Genesis', 'gen', 'gn'], ['02-exodus', 'Exodus', 'exod', 'exo'],
  ['03-leviticus', 'Leviticus', 'lev', 'lv'], ['04-numbers', 'Numbers', 'num', 'nm'],
  ['05-deuteronomy', 'Deuteronomy', 'deut', 'dt'], ['06-joshua', 'Joshua', 'josh'],
  ['07-judges', 'Judges', 'judg', 'jdg'], ['08-ruth', 'Ruth', 'rth'],
  ['15-ezra', 'Ezra', 'ezr'], ['16-nehemiah', 'Nehemiah', 'neh'], ['17-esther', 'Esther', 'esth', 'est'],
  ['18-job', 'Job', 'jb'], ['19-psalms', 'Psalms', 'psalm', 'ps', 'psa', 'pss'],
  ['20-proverbs', 'Proverbs', 'proverb', 'prov', 'prv'], ['21-ecclesiastes', 'Ecclesiastes', 'eccl', 'ecc', 'qoh'],
  ['22-song-of-solomon', 'Song of Solomon', 'song of songs', 'song', 'sos', 'canticles'],
  ['23-isaiah', 'Isaiah', 'isa'], ['24-jeremiah', 'Jeremiah', 'jer'], ['25-lamentations', 'Lamentations', 'lam'],
  ['26-ezekiel', 'Ezekiel', 'ezek', 'ezk'], ['27-daniel', 'Daniel', 'dan', 'dn'], ['28-hosea', 'Hosea', 'hos'],
  ['29-joel', 'Joel', 'jl'], ['30-amos', 'Amos'], ['31-obadiah', 'Obadiah', 'obad'], ['32-jonah', 'Jonah', 'jon'],
  ['33-micah', 'Micah', 'mic'], ['34-nahum', 'Nahum', 'nah'], ['35-habakkuk', 'Habakkuk', 'hab'],
  ['36-zephaniah', 'Zephaniah', 'zeph'], ['37-haggai', 'Haggai', 'hag'], ['38-zechariah', 'Zechariah', 'zech'],
  ['39-malachi', 'Malachi', 'mal'], ['40-matthew', 'Matthew', 'matt', 'mat', 'mt'], ['41-mark', 'Mark', 'mk', 'mrk'],
  ['42-luke', 'Luke', 'lk', 'luk'], ['43-john', 'John', 'jn', 'jhn', 'joh'], ['44-acts', 'Acts'],
  ['45-romans', 'Romans', 'rom', 'rm'], ['48-galatians', 'Galatians', 'gal'], ['49-ephesians', 'Ephesians', 'eph'],
  ['50-philippians', 'Philippians', 'phil', 'php'], ['51-colossians', 'Colossians', 'col'],
  ['56-titus', 'Titus', 'tit'], ['57-philemon', 'Philemon', 'philem', 'phlm'], ['58-hebrews', 'Hebrews', 'heb'],
  ['59-james', 'James', 'jas', 'jm'], ['65-jude', 'Jude', 'jud'], ['66-revelation', 'Revelation', 'revelations', 'rev', 'rv'],
  // numbered: the file is chosen by the number in front
  ['samuel', 'Samuel', 'sam'], ['kings', 'Kings', 'kgs'], ['chronicles', 'Chronicles', 'chron', 'chr'],
  ['corinthians', 'Corinthians', 'cor'], ['thessalonians', 'Thessalonians', 'thess', 'thes'],
  ['timothy', 'Timothy', 'tim'], ['peter', 'Peter', 'pet', 'pt'],
];
const NUMBERED = {
  samuel: ['09-1-samuel', '10-2-samuel'], kings: ['11-1-kings', '12-2-kings'],
  chronicles: ['13-1-chronicles', '14-2-chronicles'], corinthians: ['46-1-corinthians', '47-2-corinthians'],
  thessalonians: ['52-1-thessalonians', '53-2-thessalonians'], timothy: ['54-1-timothy', '55-2-timothy'],
  peter: ['60-1-peter', '61-2-peter'], john: ['62-1-john', '63-2-john', '64-3-john'],
};
const ORDINAL = { 1: 1, 2: 2, 3: 3, i: 1, ii: 2, iii: 3, '1st': 1, '2nd': 2, '3rd': 3, first: 1, second: 2, third: 3 };

const BY_NAME = {};
for (const [file, name, ...rest] of BOOKS) for (const n of [name.toLowerCase(), ...rest]) BY_NAME[n] = { file, name };
const NAMES = Object.keys(BY_NAME).sort((a, b) => b.length - a.length).map((n) => n.replace(/ /g, '\\s+'));
const REF_RE = new RegExp(
  `\\b(?:(1st|2nd|3rd|first|second|third|iii|ii|i|1|2|3)\\s*)?(${NAMES.join('|')})\\.?\\s*(\\d{1,3})` +
  '(?:\\s*:\\s*(\\d{1,3})(?:\\s*[-–]\\s*(\\d{1,3}))?)?\\b', 'gi');

// The query with its references taken out, for the keyword search: "John 14:28"
// should not send it looking for every passage that says "John".
export function stripReferences(query) {
  return String(query || '').replace(REF_RE, ' ').replace(/\s+/g, ' ').trim();
}

// The references in a query, in the order written. A bare chapter ("Psalm 23")
// counts only when it is the whole query, so "Mark 3 times" stays a sentence.
export function findReferences(query) {
  const q = String(query || '');
  const whole = q.trim().replace(/[?.!]+$/, '');
  const out = [];
  for (const m of q.matchAll(REF_RE)) {
    const [text, num, rawName, ch, v1, v2] = m;
    const key = rawName.toLowerCase().replace(/\s+/g, ' ');
    const book = BY_NAME[key];
    let file = book.file;
    let name = book.name;
    const n = num ? ORDINAL[num.toLowerCase()] : 0;
    const group = NUMBERED[file] || (file === '43-john' && n ? NUMBERED.john : null);
    if (group) {
      if (!n || !group[n - 1]) continue;              // "Corinthians 13" or "3 Peter": not a book
      file = group[n - 1];
      name = `${n} ${name}`;
    } else if (n) {
      continue;                                       // "2 Matthew": not a book
    }
    if (!v1 && text.trim() !== whole) continue;
    const from = v1 ? Number(v1) : 1;
    const to = v2 ? Math.max(from, Number(v2)) : v1 ? from : from + MAX_VERSES - 1;
    out.push({ file: `${DIR}/${file}.md`, book: name, chapter: Number(ch), from, to: Math.min(to, from + MAX_VERSES - 1), whole: !v1 });
    if (out.length >= MAX_REFS) break;
  }
  return out;
}

// One parsed book per file, for as long as this Worker instance lives.
const books = new Map();

async function loadBook(file) {
  if (books.has(file)) return books.get(file);
  const r = await fetch(`${RAW}/${file}`, { cf: { cacheTtl: 86400, cacheEverything: true } });
  if (!r.ok) throw new Error(`KJV ${file}: ${r.status}`);
  const lines = (await r.text()).split('\n');
  const verses = new Map();
  const title = (lines.find((l) => l.startsWith('# ')) || '').slice(2).trim();
  lines.forEach((l, i) => {
    const m = /^\*\*(\d+):(\d+)\*\*/.exec(l);
    if (m) verses.set(`${m[1]}:${m[2]}`, { line: i + 1, text: l });
  });
  const book = { title, verses };
  if (books.size >= 8) books.delete(books.keys().next().value);
  books.set(file, book);
  return book;
}

// Each reference as a Sources result: the verses word for word, linked to
// their lines on GitHub. A reference to a verse the KJV doesn't have is dropped.
export async function lookupVerses(refs) {
  const out = [];
  for (const ref of refs) {
    const book = await loadBook(ref.file);
    const got = [];
    for (let v = ref.from; v <= ref.to; v++) {
      const hit = book.verses.get(`${ref.chapter}:${v}`);
      if (!hit) break;
      got.push(hit);
    }
    if (!got.length) continue;
    const last = got[got.length - 1];
    const span = ref.whole ? `${ref.chapter}` : got.length > 1 ? `${ref.chapter}:${ref.from}-${ref.from + got.length - 1}` : `${ref.chapter}:${ref.from}`;
    out.push({
      score: 1,
      match: 'reference',
      title: book.title,
      header: `${ref.book} ${span} (KJV)`,
      file: ref.file,
      line: got[0].line,
      source: KJV_SOURCE,
      url: `${BLOB}/${ref.file}#L${got[0].line}${got.length > 1 ? `-L${last.line}` : ''}`,
      text: got.map((g) => g.text).join('\n'),
    });
  }
  return out;
}
