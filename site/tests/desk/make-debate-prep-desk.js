/* Builds site/data/desks/naz-sect-debate-prep.json — the internal prep board for the
   resolution "the historical Jesus belonged to a Nazarene sect that rejected sacrifice
   and flesh consumption".

   Lay out, measure every card in real Chrome, lay out again with the real heights.
   Same two-pass method as make-essene-desk.js.

   Internal: this board is "listed": false. It opens by link only.
   Nothing here is generated: every card is a build-verified source, a KJV verse, a
   repo file, or a note the Desk stamps NOTE · NOT A SOURCE. */
const puppeteer = require('puppeteer-core');
const { CHROME, URL } = require('./env');
const fs = require('fs');
const OUT = require('path').join(__dirname, '..', '..', 'data', 'desks', 'naz-sect-debate-prep.json');

const E = 'essene-nazarene-origins', SC = 'sacrifice-culture-vegetarian-jesus',
      JT = 'jesus-and-the-torah', MC = 'method-and-criteria',
      TH = 'the-gospel-of-thomas', PL = 'pauls-legitimacy';
const W = 250, GAP = 22, GAPX = 26, PAD = 26, FRAME_GAP = 90, ROW_GAP = 130;

const S = (c, i) => ({ k: 's', c, i, id: `s:${c}:${i}` });
const Q = c => ({ k: 'q', c, id: `q:${c}`, w: 270 });
const V = key => ({ k: 'v', key, id: `v:${key}` });
const D = path => ({ k: 'd', path, id: `d:${path}` });
const N = (name, text, w) => ({ k: 'n', name, text, w: w || W });

/* ------------------------------------------------------------------ content */

const notes = {

  res: N('res', 'THE RESOLUTION\n\n' +
    '"The historical Jesus belonged to a Nazarene sect that rejected sacrifice and flesh consumption."\n\n' +
    'Read the sentence carefully. The relative clause attaches to THE SECT, not to Jesus. ' +
    'It is not one claim, it is two, and they are not equally strong. Keep them apart all night ' +
    'and you can lose B without losing A.', 560),

  split: N('split', 'CLAIM A — the sect rejected sacrifice and abstained from flesh.\n' +
    'CLAIM B — Jesus belonged to that sect.\n\n' +
    'A is where the evidence is. B is where the fight will be.\n\n' +
    'If you merge them, every hit on B reads as a hit on A. Say out loud, early: ' +
    '"These are two claims. Let me give you the evidence for each separately."', 560),

  concede: N('concede', 'CONCEDE THESE IN THE FIRST TWO MINUTES\n\n' +
    '1. No ancient source says "Jesus was an Essene." Not one. The word essene does not ' +
    'even occur in the Dead Sea Scrolls.\n\n' +
    '2. Luke 24:42-43 says the risen Jesus ate fish. Textually secure — P75, Sinaiticus, ' +
    'Vaticanus. Only the honeycomb is a variant. Do NOT call the verse unstable.\n\n' +
    '3. The Essene/Ebionite identification is not a scholarly consensus and we are not ' +
    'claiming it definitively.\n\n' +
    'Conceding these costs nothing and buys the room. Refusing to concede them is how ' +
    'this argument has actually been lost on camera.', 540),

  stream: N('stream', 'CLAIM IT AS A STREAM, NOT A MEMBERSHIP CARD.\n\n' +
    'A vocabulary found nowhere in the Hebrew Bible — "spirit of truth", "children of ' +
    'light" — runs all through the gospels. Same proof text, same wilderness, same ' +
    'immersion.\n\n' +
    'That is a stream. It is not a membership roll, and you do not need one: he ate with ' +
    'sinners and drank wine, and reform movements criticise their parent hardest.'),

  red: N('red', 'THIS HALF IS RED TEXT ABOUT JESUS HIMSELF.\n\n' +
    'He threw Hosea 6:6 at the men running the cult — twice. He stopped the Temple traffic ' +
    'quoting the one chapter where God denies commanding burnt offerings. And the next ' +
    'verse says that is the moment they decided to kill him:\n\n' +
    'Mark 11:18 (KJV) — "And the scribes and chief priests heard it, and sought how they ' +
    'might destroy him."\n\n' +
    'Nothing else on this board is this strong. Lead here.'),

  after: N('after', 'WHY THIS SECTION HOLDS: every witness in it was hostile or ' +
    'disinterested.\n\n' +
    'Paul concedes vegetable-only believers in Rome by 57 CE — against his own argument. ' +
    'Epiphanius is trying to discredit them. A church council legislates against what is ' +
    'actually happening.\n\n' +
    'Nobody in this list wanted the conclusion. That is what makes it evidence.\n\n' +
    'Concede the asymmetry out loud: this is evidence about THE MOVEMENT, not about what ' +
    'was on Jesus\'s plate.'),

  /* ---- the strongest single move ---- */

  divorce: N('divorce', 'THE STRONGEST SINGLE MOVE ON THIS BOARD\n\n' +
    'Matthew 19:8 — "Moses because of the hardness of your hearts suffered you to put away ' +
    'your wives: but from the beginning it was not so."\n\n' +
    'Jesus, in the red text, identifies a standing Torah permission as a CONCESSION to ' +
    'hardness of heart, and appeals past it to the beginning. That is the whole ' +
    'hermeneutic, in his own mouth, applied by him to a different question.\n\n' +
    'It answers "Genesis 9:3 permits meat" without denying that it permits meat. Permission ' +
    'is not endorsement — and he is the one who says so.\n\n' +
    'It is also the canonical twin of Recognitions 1.36, whose chapter title is literally ' +
    '"Allowance of Sacrifice for a Time". The card calls that our biggest unexploited ' +
    'asset; this gives it a gospel parallel.\n\n' +
    'Kam used this against Rev. Tony Jones (@ 145:40) and against the carnivore (@ 51:04). ' +
    'Jones never answered it. Neither did Hicks.', 540),

  recog: N('recog', 'Recognitions 1.36 is titled "Allowance of Sacrifice for a Time."\n\n' +
    'The Jewish-Christian text says the sacrifices were a temporary concession to a people ' +
    'who had learned the habit in Egypt — not a divine requirement.\n\n' +
    'Pair it with Matthew 19:8 and you have the same logic in the red text and in the ' +
    'movement that claimed succession from him.'),

  /* ---- what they will say: Huff and Boyce ---- */

  huff1: N('huff1', 'BOYCE WILL SAY: "The church fathers you cite condemn you."\n' +
    '(Huff/Boyce debate @ 126:00, 131:46, 134:15)\n\n' +
    'Jerome and Epiphanius explicitly say the Ebionites OF THEIR DAY are not the group ' +
    'Paul collected for in Galatians 2:10. So the witnesses we use for continuity are ' +
    'testifying against continuity.\n\n' +
    'This is sharper than the usual "they were heretics" version, and the card does not ' +
    'yet answer this form. Answer: their verdict is theological; their REPORTAGE is what ' +
    'we use, and hostile reportage is the strongest kind. Epiphanius had no motive to ' +
    'invent an anti-sacrifice sect.'),

  huff2: N('huff2', 'HUFF WILL SAY: "Your ebion chain is a back-translation, and an ' +
    'argument from silence."\n(@ 103:53, 104:17, 105:49)\n\n' +
    '"None of the Greek passages use ebionim as poor — I\'m seeing ptochos. There is no ' +
    'Hebrew Matthew. We have no manuscripts of Matthew other than Greek."\n\n' +
    'OPEN. The repo has no lexical heading on this and essene-nazarene-origins §1 never ' +
    'addresses the Hebrew-to-Greek step. Do not improvise it.'),

  huff3: N('huff3', 'HUFF WILL SAY: "There was sacrifice at Qumran — read Liane Feldman ' +
    'at NYU."\n(@ 128:15)\n\n' +
    'The ARCHAEOLOGICAL form of the objection. Our cards answer only the TEXTUAL form ' +
    '(Temple Scroll, 4QMMT). Feldman appears nowhere in the repo.\n\n' +
    'Safe answer tonight: concede we are arguing from the texts, and that the ' +
    'archaeology is contested. Do not pretend to have read her.'),

  huff4: N('huff4', 'HUFF WILL SAY: "Jesus taught in Greek, and Hebrew was functionally ' +
    'a dead liturgical language."\n(@ 106:32, 111:40; cites Stanley Porter 1993, Peter J. ' +
    'Williams)\n\n' +
    'Matthew 5 alliterates in Greek and jumbles when back-translated; Galilee was a koine ' +
    'trade region; John 12:20-22 has Greeks approaching Philip.\n\n' +
    'OPEN. The repo has nothing on the language of Jesus\'s teaching, and this undercuts ' +
    'the whole Hebrew-substratum move at the root.'),

  huff5: N('huff5', 'HUFF WILL SAY: "All Jews did ritual ablution. Mikvaot are everywhere."\n' +
    '(@ 127:45)\n\n' +
    'One line, and it broke Abke\'s exclusivity claim 28 minutes after he made it. The ' +
    'immersion distinctive is not unique; the CLUSTER is what is unusual.\n\n' +
    'Say density and cluster. Never say "only" or "nowhere else".'),

  huff6: N('huff6', 'THE STRATEGIC PROBLEM, not an objection.\n' +
    '(@ 52:21, 70:04, 70:34)\n\n' +
    'Huff and Boyce BOTH pre-emptively disowned faith-alone ticket-punching: "that\'s ' +
    'mega-church stuff, post-1960s; Rome doesn\'t teach it, Orthodoxy doesn\'t, Anglicans ' +
    'don\'t, Lutherans don\'t."\n\n' +
    'Several of our strongest cards are built to attack a position neither opponent holds. ' +
    'Against a liturgical opponent, the blood-atonement card swings at air. Know that ' +
    'before you lead with it.'),

  paraclete: N('paraclete', 'BOYCE WILL SAY: "John 14:26 licenses the non-red letters."\n' +
    '(@ 61:16-63:52)\n\n' +
    'Jesus — in the red text — promises the Paraclete so the apostles would not merely ' +
    'remember his words but UNDERSTAND them. So the apostolic interpretation is authorised ' +
    'by Jesus himself, and red-letters-only is unbiblical on its own terms.\n\n' +
    'The best unanswered methodological objection in ten hours of debate. Zero hits for ' +
    'John 14:26 anywhere in questions/. Expect it. Have something.'),

  /* ---- what they will say: Tony Jones ---- */

  jones1: N('jones1', 'JONES WILL SAY: Acts 10 — "rise, kill and eat" — and he will point ' +
    'out the author tells it TWICE.\n("Was Jesus Actually a Vegan?" @ 28:36, 30:01, 34:51)\n\n' +
    '"How many times does that author put the same story in twice?"\n\n' +
    'This is his most-used text and it is NOWHERE on our card. Kam\'s answer — "it says a ' +
    'voice, not God" — fails on Acts 10:14, where Peter answers "Not so, LORD." Jones ' +
    'pressed exactly that and Kam would not answer yes or no.\n\n' +
    'The defensible line: the vision\'s own stated meaning is Gentile inclusion (10:28, ' +
    '10:34-35), which Jones CONCEDED @ 33:18. Take the concession; do not fight the ' +
    'lexicon.\n\n' +
    'Acts 10:13-14 (KJV) — "And there came a voice to him, Rise, Peter; kill, and eat. ' +
    'But Peter said, Not so, Lord; for I have never eaten any thing that is common or ' +
    'unclean."'),

  jones2: N('jones2', 'JONES WILL SAY: Genesis 8:20-21 — God smells Noah\'s burnt offering ' +
    'and calls it good.\n(@ 42:50)\n\n' +
    '"The sacrificial system of Israel was founded upon that sacrifice."\n\n' +
    'God\'s explicit approval of animal sacrifice at the narrative reset. Not on our card ' +
    'in any form. Harder than Leviticus, because it is approval rather than legislation.'),

  jones3: N('jones3', 'JONES WILL SAY: Genesis 9:3 is the NOAHIC covenant — the one we ' +
    'live under. The Adamic one ended.\n(@ 47:48)\n\n' +
    'A clean structural answer to Genesis 1:29 that Kam never dismantled. It does not ' +
    'deny 1:29; it dates it.\n\n' +
    'Genesis 9:3 (KJV) — "Every moving thing that liveth shall be meat for you; even as ' +
    'the green herb have I given you all things."\n\n' +
    'THE ANSWER IS MATTHEW 19:8 (see the starred frame). Jesus treats a standing Mosaic ' +
    'permission as a concession and appeals past it to the beginning. That is exactly the ' +
    'move this objection needs, in his own voice.'),

  jones4: N('jones4', 'JONES WILL SAY: Deuteronomy 14:3-5 — and "there are 635 laws in ' +
    'Torah and not one says you may not eat meat."\n(@ 48:30, 153:44)\n\n' +
    'Deuteronomy 14:4-5 (KJV) — "These are the beasts which ye shall eat: the ox, the ' +
    'sheep, and the goat, the hart, and the roebuck, and the fallow deer..."\n\n' +
    'True, and it does not touch claim A as properly stated. Our claim is about a SECT\'S ' +
    'practice and a prophetic critique of the cult, not about a Torah prohibition. ' +
    'Agreeing here costs nothing.'),

  jones5: N('jones5', 'JONES WILL SAY: the Damascus Document legislates eating locusts ' +
    'and fish. CD 12:11-15.\n(@ 59:20)\n\n' +
    '"Locusts thrown alive into fire or boiling water; fish cut open alive to drain the ' +
    'blood. These do not seem like animal liberationists."\n\n' +
    'His most damaging TECHNICAL argument, substantially accurate — and CD 12 is NOT in ' +
    'our Dead Sea Scrolls selection. We cannot currently check it. Acquire it before ' +
    'anyone argues the Essene menu again.'),

  jones6: N('jones6', 'JONES WILL SAY: John 21 — Jesus COMMANDED the catch.\n(@ 69:06, ' +
    '103:34, 104:40)\n\n' +
    'Not merely "he ate fish" but "he performed a miracle to fill the net, then cooked ' +
    'it." Asked three times. Kam called it "a great question" and never answered.\n\n' +
    'And his closer, which is the best line either opponent produced all night:\n' +
    '"Pythagoras let the fish go but Jesus didn\'t. That\'s the point of the story — I\'m ' +
    'not Pythagoras, I\'m Jesus, we eat fish."\n\n' +
    'Distinct from Luke 24 and sharper. Prepare it separately.'),

  jones7: N('jones7', 'JONES WILL SAY: "We can\'t get behind the text. All we\'ve got is ' +
    'the text."\n(@ 98:00) — "the first thing they teach you in seminary."\n\n' +
    'And: "Conversion does not give you hermeneutical authority over the Bible." (@ 123:42)\n\n' +
    'This frame pre-defeats most reconstruction arguments before they start. Plus the ' +
    'credential move (@ 10:53, 151:50): "I don\'t want to pull rank but I\'ve got a PhD."\n\n' +
    'No counter-frame exists anywhere in the repo.'),

  jones8: N('jones8', 'JONES WILL SAY: the gospel writers used the LXX, not the Hebrew.\n' +
    '(@ 164:55)\n\n' +
    'Both halves of the Temple quotation are verbatim LXX; the Greek is spelaion leston, ' +
    '"cave of bandits", identical in Mark, Matthew and Luke; and Jeremiah 7:9, two verses ' +
    'earlier, already has thieves and murderers in the ordinary human sense.\n\n' +
    'This single move answers a whole FAMILY of our Hebrew-lexical arguments at once — ' +
    'paritz, shachat, thuo. Total gap on the card.'),

  jones9: N('jones9', 'JONES ALSO RUNS: the gnosticism frame (@ 56:28 and eight more ' +
    'times), the argument from silence as a named category (@ 21:43), and ' +
    '"the early-church debate was about eidolothyta — meat sacrificed to Roman gods — ' +
    'not about meat" (@ 19:53).\n\n' +
    'Note for your own confidence: he argued the idol-meat thesis for ten minutes and ' +
    'never once cited 1 Corinthians 8:8 or 10:25, the chapters that contain it. He is ' +
    'beatable on his own ground. He is not beatable on the apparatus.'),

  /* ---- the holes ---- */

  hole5: N('hole5', 'HOLE 5 — NEW, AND THE WORST ONE. Isaiah 25:6.\n\n' +
    '"And in this mountain shall the LORD of hosts make unto all people a feast of fat ' +
    'things... of fat things full of marrow, of wines on the lees well refined."\n\n' +
    'THE SAME HOLY MOUNTAIN as Isaiah 11:9 ("they shall not hurt nor destroy") and ' +
    'Isaiah 56:7 ("my holy mountain... house of prayer"). Fourteen chapters later. Same ' +
    'prophet.\n\n' +
    'An eschatological MEAT-AND-WINE BANQUET sitting underneath the entire peaceable-' +
    'kingdom architecture. Jones raised it in one interrupted sentence (@ 120:22), was cut ' +
    'off with "whoa whoa friend", and took the point anyway.\n\n' +
    'It appears nowhere in this repo in any form. If you build on Isaiah 11, you must own ' +
    'Isaiah 25 first.', 540),

  hole1: N('hole1', 'HOLE 1 — Acts 21:23-26. James tells Paul to pay for four men\'s ' +
    'Temple offerings, and Paul does it.\n\n' +
    'Our single highest-threat text, because it is the James household itself ' +
    'participating in the sacrificial system.\n\n' +
    'Worth knowing: in three hours Jones NEVER RAISED IT. He used the cheaper Acts 3:1 ' +
    '(the disciples going up to the Temple at the hour of prayer) and said he had spent ' +
    'the week researching James. Our worst problem is apparently not in the standard ' +
    'opponent\'s kit. Do not volunteer it.'),

  hole2: N('hole2', 'HOLE 2 — Isaiah 56:7, first half: "their burnt offerings and their ' +
    'sacrifices shall be accepted upon mine altar."\n\n' +
    'We quote the second half. The first half is pro-sacrifice, in the same verse.\n\n' +
    'DO NOT say the clause is "a known interpolation". No scholar is named and there is no ' +
    'source. Kam said exactly that on camera (@ 123:08) and got away with it only because ' +
    'Jones never read the first half aloud.'),

  hole3: N('hole3', 'HOLE 3 — Thomas 14 and Q 10:8 / Luke 10:8: "eat such things as are ' +
    'set before you."\n\n' +
    'Jesus instructing his own itinerants not to be fussy about food, in two of our own ' +
    'top-tier sources.\n\n' +
    'Neither side mentioned the Gospel of Thomas ONCE in 41,000 words. Source #2 in our ' +
    'hierarchy, absent from the biggest debate on the question. That cuts both ways: ' +
    'nobody has used Thomas 12 against us either.'),

  hole4: N('hole4', 'HOLE 4 — the James-household inference.\n\n' +
    'Hegesippus on James\'s diet comes through Eusebius, is late, and is hagiography. ' +
    'Jones: "this idea that James the Just was a vegetarian is in, like, two obscure ' +
    'sources" (@ 39:33).\n\n' +
    'The answer he never got is the chain-of-custody paragraph on the card. It was ' +
    'available and was not said.'),

  luke2: N('luke2', 'HOLE 6 — Luke 2:24. The holy family brings two turtledoves to the ' +
    'Temple.\n(Huff/Boyce debate, trailer @ 00:28 — so it is almost certainly in part 2)\n\n' +
    '"Was Jesus\'s parents, who apparently were part of the Essene group of some sort, ' +
    'wrong for bringing these doves to the temple?"\n\n' +
    'HARDER THAN ACTS 21, because it is his own parents, in the infancy narrative, with ' +
    'no plausible distance. Zero hits for Luke 2:24 in questions/.'),

  /* ---- do not say ---- */

  dns0: N('dns0', 'FIVE OF THE ITEMS IN THIS FRAME WERE SAID ON CAMERA BY OUR OWN SIDE.\n\n' +
    'Two were destroyed on the recording. Three survived only because the opponent did ' +
    'not know them.\n\n' +
    'This list is not hygiene. It is a record of how this argument loses in public. ' +
    'Every line below is checkable by a hostile viewer in under a minute.'),

  dns1: N('dns1', 'X "Qumran was anti-sacrifice."\n' +
    'The Temple Scroll prescribes it and 4QMMT is about doing it CORRECTLY. Boycott of a ' +
    'corrupt priesthood, not abolition of sacrifice.'),

  dns2: N('dns2', 'X "Porphyry says the Essenes abstained from all animal food."\n' +
    'He does not; the line is not in his text. Nor do Philo, Josephus or Pliny say it. ' +
    'Only Jerome (393) does — and he credits Josephus, who does not.'),

  dns3: N('dns3', 'X "Isaiah 11:9\'s destroy is the word for ritual slaughter."\n' +
    'FALSE. Isaiah 11:9 is shachath (ruin). Ritual slaughter is shachat, final tet. ' +
    'Different roots, identical only in loose transliteration.\n\n' +
    'Deleted from the repo as false on 2026-10-06 — and then said on THREE separate ' +
    'recordings anyway. Huff reads Hebrew. A lexicon ends this in ten seconds.'),

  dns4: N('dns4', 'X "Luke 24:42 is textually unstable."\n' +
    'DESTROYED ON CAMERA. Jones produced a Greek New Testament and read the apparatus: ' +
    'every manuscript has fish; NONE has honeycomb alone. Only the honeycomb is a variant. ' +
    'Then: "commentaries are not manuscripts."\n\n' +
    'Concede the verse. It costs almost nothing and defending it costs the room.'),

  dns5: N('dns5', 'X The 153 fish / Pythagoras argument.\n' +
    'DESTROYED ON CAMERA, in three moves: no evidence any Galilean knew Pythagorean ' +
    'literature; the ICHTHYS acrostic post-dates the gospels; and "Pythagoras let the fish ' +
    'go but Jesus didn\'t."\n\n' +
    'Retire it completely.'),

  dns6: N('dns6', 'X Hosea\'s "not" is lo, which means "never, not a comparison."\n' +
    'The parallel line in Hosea 6:6b uses the comparative min. Said FOUR times on one ' +
    'recording and survived only by luck.\n\n' +
    'The verse is strong without this. Quote it and stop.'),

  dns7: N('dns7', 'X "The Nazarene sect was before Christ" — Epiphanius.\n' +
    'FABRICATED. No section number, no Panarion in this repo; traced to an auto-caption ' +
    'of podcast episode 026. It has since appeared on a SLIDE, in quotation marks, in a ' +
    'public debate.\n\n' +
    'Related: Panarion 18 (Nasaraeans) and Panarion 29 (Nazoraeans) are different ' +
    'entries. Four of our files conflate them and use the same passage to prove opposite ' +
    'things.'),

  dns8: N('dns8', 'X "I have no desire to eat the flesh of this Passover" as Jesus\'s words.\n' +
    'It is Epiphanius quoting the EBIONITES\' version of Luke 22:15, presented by him as ' +
    'their alteration — a negated wordplay on the Greek. Evidence of what that movement ' +
    'believed. Not evidence of what Jesus said.'),

  dns9: N('dns9', 'X Three lexical errors added to the list this month:\n\n' +
    'ethnos does NOT mean "herds and flocks" (it means nation; flock is poimne).\n\n' +
    '"Humane" is not the root of "human" — they are doublets of the same Latin word.\n\n' +
    'The hiphil IS the causative stem; saying it "doesn\'t necessarily mean caused" ' +
    'inverts it.\n\n' +
    'Four of our recurring errors are lexical. A public-domain lexicon would end all of ' +
    'them permanently.'),

  dns10: N('dns10', 'X Any Dr. Tabor quotation taken from a transcript, podcast or course.\n' +
    'All Tabor material in this repo is auto-caption. Attribute his POSITIONS by ' +
    'paraphrase from his published books. Never put quotation marks around him.\n\n' +
    'X The Essene Gospel of Peace as an ancient text. It is Szekely, twentieth century.'),

  /* ---- bank their concessions ---- */

  bank: N('bank', 'BANK THESE. A credentialed opponent said them on the record.\n\n' +
    'Rev. Tony Jones, PhD, @ 121:26:\n' +
    '"We have no idea if the early Christians before the temple came down still ' +
    'participated in Jewish animal sacrifice. We don\'t know. I think a lot of us think ' +
    'they probably didn\'t, which is good."\n\n' +
    'Jones @ 122:20: agreement that essentially every animal eaten in that world, in Rome ' +
    'or Israel, was ritually slaughtered first.\n\n' +
    'The first concedes that the sacrifice half of claim A is OPEN — from the opposition. ' +
    'The second collapses the distance between "sacrifice" and "meat" in antiquity, which ' +
    'is the hinge of the whole argument.\n\n' +
    'Neither was captured in the moment. Capture them.', 540),

  bank2: N('bank2', 'ALSO BANKABLE:\n\n' +
    'Boyce volunteered his own fringe status to de-weaponise the word "fringe" — and he ' +
    'holds a HEBREW-MATTHEW position himself. An overlap our side never exploited.\n\n' +
    'Ray Hicks (carnivore) conceded: humans are not carnivores, meat is not necessary, ' +
    'Eden was plant-prescribed, Eden is the ideal, "I\'m a hypocrite", "I definitely have ' +
    'moral inconsistencies."\n\n' +
    'And then did not move. Which is its own lesson: winning the exegesis is not what ' +
    'moves anyone.'),

  /* ---- unused assets ---- */

  unused0: N('unused0', 'WE HOLD ALL OF THIS AND NOBODY USED ANY OF IT.\n\n' +
    'In a three-hour debate Jones said "I never hear you quote the Didache" — and then ' +
    'got the Didache BACKWARDS, claiming it permits food offered to idols.\n\n' +
    'Didache 6:3, in our own Tier 1 file: "keep strictly away from what is offered to ' +
    'idols, for that implies worshiping dead gods."\n\n' +
    'The biggest unexploited rebuttal in ten hours, sitting in a file we already hold.'),

  unused1: N('unused1', 'The Clementines were never mentioned ONCE in ten hours.\n\n' +
    'Kam said "Peter clearly ate only plants and I can give you multiple instances" ' +
    '(@ 37:04) and then gave none — while Homilies 12.6 sits in this repo, verbatim: ' +
    '"I use only bread and olives, and rarely pot-herbs."\n\n' +
    'And Recognitions 1.39 is titled "Baptism Instituted in Place of Sacrifices" — ' +
    'exactly the argument he made from nothing at @ 107:50.'),

  unused2: N('unused2', 'Romans 14:2 — "another, who is weak, eateth herbs."\n\n' +
    'Paul, c. 57 CE, conceding the existence of vegetable-only believers AGAINST his own ' +
    'argument, in a debate about whether early Christian vegetarians existed.\n\n' +
    'Unused. It is the best single witness for claim A and it is thirty years earlier ' +
    'than anything else in the stack.'),

  unused3: N('unused3', 'Eusebius, Demonstratio Evangelica 1.10, read on air by Abke ' +
    '(@ 102:37): "he did not enjoin sacrifices or require them... nor did he lay down any ' +
    'other of the various precepts of Moses except the spiritual laws."\n\n' +
    'The repo holds DE 3.5 only. 1.10 is STRONGER for this card and is not held. Get it.'),

  /* ---- closing ---- */

  close: N('close', 'THE SENTENCE THAT HOLDS EVERY WORD\n\n' +
    'The movement that claimed succession from Jesus through his brother James rejected ' +
    'sacrifice and abstained from flesh — and we know it from the people who were trying ' +
    'to discredit it.\n\n' +
    'That sentence is defensible all night. Everything stronger than it is a liability.', 540),

  acq: N('acq', 'WHAT WOULD MOST CHANGE THE NEXT DEBATE, in order:\n\n' +
    '1. A LEXICON (LSJ 1940, BDB — both public domain). Four of our recurring errors are ' +
    'lexical and this ends all of them.\n2. A critical apparatus. It is the physical object ' +
    'that won the central exchange.\n3. CD 12:11-15 — the locust and fish rules.\n' +
    '4. Panarion 18 / 29 / 30 in usable excerpts.\n5. Jerome, Commentary on Galatians on ' +
    '2:10 — the one place our side had a source the opponent admitted he had not read.\n' +
    '6. 4Q171, the Psalms Pesher.\n\n' +
    'Full list and reasoning: questions/MINING-2026-10-debates.md §7.'),

  /* ---- found 2026-10-16 in Kam's twelve guest appearances ---- */

  new0: N('new0', 'STRONGER ARGUMENTS, FOUND 2026-10-16\n\n' +
    'Three agents read all twelve of Kam\'s guest appearances — about 22 hours — against ' +
    'this card and the mining report, asked one question: is anything here STRONGER than ' +
    'what we lead with?\n\n' +
    'Honest headline: nothing beats the Recognitions block for claim A, and nothing in 22 ' +
    'hours is stronger for claim B. But SIX things are stronger at specific pressure ' +
    'points, and two of those points currently have no answer at all.\n\n' +
    'Two of the six are already in this repo, held verbatim, used nowhere.', 540),

  newA: N('newA', '★ 1. THE GENESIS APOCRYPHON (1QapGen XI)\n' +
    'Tabor reads it aloud on air — kam-guest-08 @ 42:41:\n\n' +
    '"Do not fear, Noah... I give all of it to you and to your sons to eat the green ' +
    'things and the grass of the earth, but you shall not eat any blood."\n\n' +
    'A pre-Christian Hebrew/Aramaic manuscript whose version of Noah\'s post-flood grant ' +
    'has NO FLESH PERMISSION.\n\n' +
    'This answers Genesis 9:3 — the single most-used counter-text in every one of these ' +
    'debates, and a hole with no answer on the card. Tabor called it "quite remarkable" ' +
    'and volunteered that he had "never read it with this in mind."\n\n' +
    'NOT HELD. Zero hits in the repo. Cave 1, not Cave 4 — Tabor corrected Kam on that ' +
    'live. Highest-value acquisition from the twelve.', 540),

  newB: N('newB', '★ 2. IRENAEUS, AGAINST HERESIES 5.33.3-4\n' +
    '(kam-guest-06 @ 64:46, read on air by the host)\n\n' +
    '"...it is right that when the creation is restored, all the animals should obey and ' +
    'be in subjection to man and revert to the food originally given by God... that is, ' +
    'the productions of the earth."\n\n' +
    'A hostile orthodox father, c. 180, who CONDEMNS the Ebionites elsewhere — reading ' +
    'Isaiah 11 exactly the way we do. That is the hostile-witness structure this card says ' +
    'is its strongest form, applied to the Eden-to-Kingdom frame the mining report called ' +
    '"upstream of everything."\n\n' +
    'NOT HELD, zero hits — and the ANF translation is PUBLIC DOMAIN, so this one is free ' +
    'to add today. Cite it as Book 5, ch. 33, §§3-4; Kam gives the numbers wrongly three ' +
    'times and the host catches it on air.', 540),

  newC: N('newC', '★ 3. WE ALREADY HOLD THIS AND HAVE NEVER USED IT\n' +
    '1 Enoch 7:5 + Clementine Homilies 8.16-8.17.\n\n' +
    'The card quotes Hom. 8.15 and stops. It never says what chapter 8.15 is: it is ' +
    'titled "The Giants", and the NEXT chapter is titled "Cannibalism". The Clementine ' +
    'argument IS the Enochic argument, and the card quotes the conclusion while dropping ' +
    'the premise.\n\n' +
    'Hom. 8.16 — "it was not a long step to the consumption of flesh like their own, ' +
    'having first tasted it in other forms."\n' +
    'Hom. 8.17 — "by the shedding of much blood, the pure air being defiled" — the flood ' +
    'as a purgation of bloodshed.\n\n' +
    'Together they answer Genesis 9:3, Genesis 8:20-21 AND the no-death-free-meal flank — ' +
    'three of the mining report\'s new holes — because 8.15 makes NECESSITY the hinge and ' +
    '8.16 makes the objection INTENTIONAL killing.\n\n' +
    'Both Tier 1. Both verified verbatim this session. Zero hits for Enoch or the Watchers ' +
    'anywhere in questions/.', 540),

  newD: N('newD', '4. EZEKIEL 20:25-26 — a canonical warrant for the concession theory\n\n' +
    '"Wherefore I gave them also statutes that were not good, and judgments whereby they ' +
    'should not live" — and v. 26 illustrates it with an OFFERING practice.\n\n' +
    'Better than Matthew 19:8 on subject matter: the not-good statute is about offerings, ' +
    'not divorce. Prophetic, canonical, and it pre-empts the classical-theism objection ' +
    '("God cannot command what is immoral") from inside the canon instead of from ' +
    'philosophy.\n\n' +
    'Held in our KJV. Present in only one research file; absent from every card.\n\n' +
    'Concede first: the mainstream reading of v.26 is judicial abandonment to Molech ' +
    'practice. The narrow form is all you need — the canon itself says God can give ' +
    'statutes that are not good, and the example it reaches for is an offering.'),

  newE: N('newE', '5. JEREMIAH 7:21 — the clause we have been leaving out\n\n' +
    'The card quotes 7:22. Read 7:21 first:\n\n' +
    '"Put your burnt offerings unto your sacrifices, AND EAT FLESH."\n\n' +
    'The sarcastic permission names eating the flesh, not just the altar. It welds the ' +
    'diet half to the sacrifice half inside the verse the card already leads with, in the ' +
    'Masoretic text, with no appeal to a versional variant.\n\n' +
    'Kam reached for an unverifiable Syriac Peshitta reading of 7:22 instead ' +
    '(kam-guest-01 @ 128:09). He did not need it. Reaching for an unheld variant when the ' +
    'received text already carries the point is exactly how the Luke 24:42 exchange was ' +
    'lost.'),

  newF: N('newF', '6. TWO SMALLER UPGRADES\n\n' +
    'LEVITICUS 5:11-13 — a bloodless flour sin offering, with atonement explicitly ' +
    'granted, INSIDE the priestly source. Tabor calls it "quite the anomaly." Zero hits ' +
    'in the repo. Limit: it is a concession for the poor, so it proves the blood ' +
    'requirement is not absolute — not that it was never commanded.\n\n' +
    'LUKE 7:33 NAMES BREAD — so the "eating and drinking" of Q 7:34 takes bread and wine ' +
    'as its antecedents. This upgrades HOLE 3 from a rhetorical answer ("a quotation of ' +
    'an insult, not a menu") to a textual one, and it is Tabor\'s own argument, made twice. ' +
    'Caveat: it concedes the wine outright, which is what broke HOLE 4.\n\n' +
    'Also: Proverbs 23:20 — "riotous eaters of flesh" — gives the Q 7:34 slur a primary ' +
    'text. The pairing flesh-eater + wine-drinker is proverbial, so the critics reached ' +
    'for a stock formula.'),

  newG: N('newG', 'THE HARD NEWS, AND IT IS IMPORTANT\n\n' +
    '1. THE ISAIAH 11:9 ERROR ORIGINATES WITH TABOR. He states on air (kam-guest-08 @ ' +
    '11:53, 28:36) that "destroy" is shachat, slaughter — and Kam says Tabor gave him ' +
    'that in the Christspiracy interview. So the repo\'s banned lexical error came from ' +
    'our own best scholar.\n\n' +
    'The ban holds anyway: anyone with a lexicon refutes it and Huff reads Hebrew. But do ' +
    'not expect Tabor to supply cover, and do not cite him for it. The honest version is ' +
    'available — Genesis 6:11\'s "corrupt" IS shachath, so the Isaiah 11:9 / Genesis 6:11 ' +
    'verbal link is real. It is the shechitah link that is false.\n\n' +
    '2. THE ISAIAH 56:7 "INTERPOLATION" LOOKS LIKE A TRANSFERRED ARGUMENT. Kam now ' +
    'attributes it to Tabor by name (kam-guest-07 @ 51:34) — but in the recording where ' +
    'Tabor is actually present, Tabor makes that argument about PSALM 51:18-19, not ' +
    'Isaiah 56.\n\n' +
    'And the legitimate Psalm 51 version is ALREADY IN THIS REPO, on the blood-atonement ' +
    'card, verified against our KJV. One edit removes a fabricated citation, replaces it ' +
    'with a defensible one, and explains where the fabrication came from. Cleanest fix ' +
    'available.', 540),

  newH: N('newH', 'TABOR\'S OWN LIMITS — adopt these as house phrasing\n' +
    '(kam-guest-08, the joint appearance)\n\n' +
    '@ 24:59, 36:32, 58:07 — the defensible frame is "TRAJECTORY", "TENDENCY", "THREAD", ' +
    '"A MOVEMENT" — not one named sect with continuous identity. The characteristics "move ' +
    'through three, four, and five groups — that\'s the point." He never says the ' +
    'Nasaraeans ARE the Nazarenes.\n\n' +
    '@ 50:11 — unprompted: A NAZIRITE VOW DOES NOT FORBID MEAT. This independently ' +
    'confirms our own HOLE 4 caveat.\n\n' +
    '@ 17:01 — he volunteers that Isaiah 66:2 does not actually use ebionim, right after ' +
    'building on it. A scholar refusing to over-read his own proof text, on camera. Copy ' +
    'that behaviour.\n\n' +
    '@ 61:23 — he DECLINES the pro-vegetarian reading of Romans 14. Paul "seems to be ' +
    'taking the side of the weak brothers," but "it doesn\'t necessarily mean he\'s on ' +
    'their side."\n\n' +
    '@ 31:04 — his endorsement of the Clementines is HEDGED: "all sorts of earlier things ' +
    'in it." That is not "Recognitions 1.27-71 is first-century."', 540),

  newI: N('newI', 'THE BEST UNANSWERED OBJECTION IN THE TWELVE\n' +
    'kam-guest-09 @ 88:46, from a Greek Orthodox theologian:\n\n' +
    '"Epistemologically, your Hebrew Gospel argument has heavy dependence on the church ' +
    'fathers. Why would the fathers who mention the longer ending of Mark 16 not be ' +
    'authoritative, but when they mention the Gospel of Matthew, it is?"\n\n' +
    'Kam answered with the criterion of embarrassment, which is a category error: ' +
    'embarrassment vouches for a hostile witness reporting content against his own ' +
    'interest. It says nothing about whether the father correctly IDENTIFIED the text — ' +
    'which is the actual question. And Mark 16 is attested by the same fathers.\n\n' +
    'He then cited an unpublished private document and ran out of time.\n\n' +
    'THE REPO HAS NO ANSWER TO THIS ANYWHERE. Expect it from any trained opponent.', 540),

  newJ: N('newJ', 'THREE THINGS TO STOP SAYING, ADDED THIS MONTH\n\n' +
    'X GENESIS 9:3\'s "every moving thing" = remes = "BUGS".\n' +
    'Refuted by our own KJV twice over: Gen 9:2 already enumerates beast, fowl and fish ' +
    'and says "into your hand are they delivered"; and Psalm 104:25 uses the same word of ' +
    'SEA CREATURES. Currently load-bearing, said on at least three recordings, and ' +
    'unchallenged. The Genesis Apocryphon makes it completely unnecessary.\n\n' +
    'X "DOMINION" = yarad, "to lower oneself in service".\n' +
    'Genesis 1:26 is the regular qal of radah, "to rule." Kam explicitly denies radah is ' +
    'the root. This is the shachath error again, in the load-bearing verse of the whole ' +
    'Genesis argument. The stewardship point stands without the etymology.\n\n' +
    'X THE GENESIS APOCRYPHON AS "AN EARLIER READING BY DEFAULT" (kam-guest-10 @ 26:03).\n' +
    'It is rewritten Bible, not a Genesis manuscript — so it is not a textual witness to ' +
    'Gen 9:3 at all. Use it as a PARALLEL TRADITION, which is strong, not as a variant, ' +
    'which is false in kind.', 540),

  newK: N('newK', 'IN THE DISTRIBUTED FILM — so discipline alone cannot fix these\n\n' +
    '"Josephus tells you that John the Baptist lived only stems, roots, and fruits" ' +
    '(kam-guest-12 @ 30:00, and in the narration).\n' +
    'JOSEPHUS SAYS NOTHING ABOUT JOHN\'S DIET. "Stems, roots and fruits" is Josephus on ' +
    'BANNUS, his own desert teacher (Life 2.11) — a different person. An opponent with ' +
    'Josephus open ends the segment.\n\n' +
    '"When Epiphanius talked to one of the Nazarenes personally, the Nazarene said: ' +
    '\'Because Jesus taught us to be vegetarians\'" (kam-guest-12 @ 32:27, in quotation ' +
    'marks, in the film).\n' +
    'NO SUCH INTERVIEW EXISTS IN THE PANARION. This has the exact profile of the ' +
    'fabrications already catalogued — a quotation mark acquired around a paraphrase. ' +
    'Treat as suspected fabrication and verify before it is repeated.\n\n' +
    'The 153-fish / Pythagoras block is also in the film, after being destroyed on camera. ' +
    'The repo should hold a written correction for all three.', 540),

  verses: N('verses', 'WHY SIX VERSES ON THIS BOARD ARE QUOTED IN NOTES INSTEAD OF ' +
    'SHOWN AS VERSE CARDS\n\n' +
    'The Desk can only lay out a verse that some card\'s prose already points at — that ' +
    'is how the build guarantees a verse card is real. These six are not referenced by ' +
    'any card yet:\n\n' +
    'Isaiah 25:6 · Matthew 19:8 · Acts 10:13-15 · Genesis 9:3 · Deuteronomy 14:3-5 · ' +
    'Mark 11:18\n\n' +
    'All six are in the held KJV and were checked there by hand. Each is quoted in the ' +
    'note beside its argument.\n\n' +
    'To promote them to real verse cards — with the reader pane and the HELD stamp — each ' +
    'needs one line of prose on a card. That is a content change to public pages, so it ' +
    'is Matt\'s and Rex\'s call, not something this board should do quietly.\n\n' +
    'Worth doing. Four of the six are the counter-texts our own audit says the sacrifice ' +
    'card is missing.', 540),

  provenance: N('provenance', 'ABOUT THIS BOARD\n\n' +
    'Internal prep. Not listed in the Reading Room; it opens by link only.\n\n' +
    'Every timestamp above points at a real recording. The five debates are written up in ' +
    'questions/MINING-2026-10-debates.md; the twelve Kam guest appearances are in ' +
    'podcast-archive/kameron-waters/guest-appearances/.\n\n' +
    'TRANSCRIPT QUOTES ARE POINTERS, NOT PROOF. Captions have no speaker labels, so every ' +
    'attribution here is inferred and some are marked uncertain in the report. Check the ' +
    'audio before repeating any of it on a recording of your own.\n\n' +
    'The source cards on this board are the opposite: each one was verified against a text ' +
    'held in this repo by site/build.py, which refuses to publish a citation it cannot ' +
    'find.', 540)
};

const header = { items: [notes.res, notes.split, Q(E), Q(SC)] };

const rows = [
  [
    { title: '1 · HOW TO HOLD IT', ci: 0,
      cols: [[notes.concede], [notes.stream, S(E, 8), S(E, 9)]] },
    { title: '2 · CLAIM A · NO ALTAR (RED TEXT)', ci: 2,
      cols: [[S(SC, 0), S(SC, 1), S(SC, 2), S(SC, 6)],
             [S(SC, 3), S(SC, 4), S(SC, 5), S(SC, 8)],
             [notes.red, S(JT, 7), S(JT, 3)]] },
    { title: 'THE PROPHETS HE STOOD IN', ci: 1,
      cols: [[V('Isaiah 1:11-17'), V('Amos 5:21-25')],
             [V('Psalms 51:16-17'), V('Micah 6:6-8')]] }
  ],
  [
    { title: '3 · CLAIM A · NO FLESH (THE MOVEMENT AFTER HIM)', ci: 3,
      cols: [[S(SC, 17), S(SC, 14), S(SC, 15), S(SC, 21)],
             [S(SC, 18), S(SC, 19), S(SC, 20), S(SC, 22)],
             [S(SC, 16), S(E, 13), S(E, 14), notes.after]] },
    { title: '4 · CLAIM B · THE STREAM, NOT A MEMBERSHIP CARD', ci: 0,
      cols: [[S(E, 16), S(E, 0), S(E, 1), S(E, 2)],
             [S(E, 3), S(E, 4), S(E, 5), S(E, 6)],
             [S(E, 7), S(TH, 2), S(PL, 7), S(E, 11)]] },
    { title: '★ THE STRONGEST SINGLE MOVE', ci: 2,
      cols: [[notes.divorce], [notes.recog, S(SC, 12), S(SC, 18)]] }
  ],
  [
    { title: 'HUFF & BOYCE WILL SAY', ci: 1,
      cols: [[notes.huff1, notes.huff2, notes.huff3],
             [notes.huff4, notes.huff5, notes.huff6],
             [notes.paraclete, S(MC, 3), S(E, 10)]] },
    { title: 'REV. TONY JONES WILL SAY (he had the apparatus)', ci: 3,
      cols: [[notes.jones1, notes.jones2],
             [notes.jones3, notes.jones4],
             [notes.jones5, notes.jones6, notes.jones7],
             [notes.jones8, notes.jones9, S(PL, 4)]] }
  ],
  [
    { title: 'THE HOLES · 5 IS NEW AND IS THE WORST', ci: 2,
      cols: [[notes.hole5, notes.verses],
             [notes.hole1, notes.hole2, V('Isaiah 56:7')],
             [notes.hole3, notes.hole4, notes.luke2],
             [S(SC, 10), S(SC, 11), S(JT, 9), S(JT, 10)]] },
    { title: 'DO NOT SAY', ci: 0,
      cols: [[notes.dns0, notes.dns1, notes.dns2],
             [notes.dns3, notes.dns4, notes.dns5],
             [notes.dns6, notes.dns7, notes.dns8],
             [notes.dns9, notes.dns10, S(E, 17)]] }
  ],
  [
    { title: '★★ STRONGER ARGUMENTS · FOUND IN KAM\'S 12 APPEARANCES, 2026-10-16', ci: 2,
      cols: [[notes.new0, notes.newD],
             [notes.newA, notes.newE],
             [notes.newB, notes.newF],
             [notes.newC, notes.newH]] },
    { title: 'AND THE HARD NEWS FROM THE SAME 22 HOURS', ci: 0,
      cols: [[notes.newG], [notes.newI, notes.newJ], [notes.newK]] }
  ],
  [
    { title: 'BANK THEIR CONCESSIONS', ci: 3,
      cols: [[notes.bank], [notes.bank2]] },
    { title: 'WE HOLD THESE · NOBODY USED THEM', ci: 1,
      cols: [[notes.unused0, S(SC, 7)],
             [notes.unused1, S(JT, 14)],
             [notes.unused2, notes.unused3]] },
    { title: 'CLOSE WITH THIS', ci: 2,
      cols: [[notes.close, notes.acq]] },
    { title: 'GO DEEPER', ci: 0,
      cols: [[D('questions/nazarene-sect-sacrifice-and-diet.md'),
              D('questions/CITATION-NOTES.md'),
              D('questions/method-and-criteria.md'),
              D('christianity/the-nazarenes.md')],
             [D('christianity/prophetic-tradition-against-sacrifice.md'),
              D('christianity/james-the-just-key-to-understanding-jesus.md'),
              D('christianity/biblical-case-for-vegetarian-jesus.md'),
              D('christianity/clementine-literature-nazarene-writings.md')],
             [notes.provenance]] }
  ]
];

/* Strings that carry the argument. */
const strings = [
  ['res', 'split'], ['split', 'concede'],
  ['split', `q:${E}`], ['split', `q:${SC}`],

  /* claim A, no altar */
  [`q:${SC}`, `s:${SC}:0`], [`s:${SC}:0`, `s:${SC}:1`], [`s:${SC}:1`, `s:${SC}:2`],
  [`s:${SC}:3`, `s:${SC}:4`], [`s:${SC}:4`, 'red'],
  [`s:${SC}:5`, 'v:Amos 5:21-25'], [`s:${SC}:2`, 'v:Isaiah 1:11-17'],
  [`s:${SC}:6`, 'v:Micah 6:6-8'], [`s:${SC}:6`, `s:${JT}:7`],
  [`s:${SC}:0`, 'red'], [`s:${JT}:3`, `s:${SC}:1`],

  /* claim A, no flesh */
  [`s:${SC}:17`, `s:${SC}:14`], [`s:${SC}:14`, `s:${SC}:15`],
  [`s:${SC}:18`, `s:${SC}:19`], [`s:${SC}:19`, `s:${SC}:20`],
  [`s:${SC}:22`, 'after'], [`s:${SC}:16`, `s:${E}:13`],

  /* claim B */
  [`q:${E}`, `s:${E}:16`], [`s:${E}:0`, `s:${E}:1`], [`s:${E}:1`, `s:${E}:2`],
  [`s:${E}:3`, `s:${E}:4`], [`s:${E}:5`, `s:${E}:6`],
  [`s:${E}:7`, `s:${TH}:2`], [`s:${TH}:2`, `s:${PL}:7`],
  ['stream', `s:${E}:8`], [`s:${E}:8`, `s:${E}:9`],

  /* the strongest move */
  ['divorce', 'recog'], ['divorce', 'jones3'], ['divorce', `s:${SC}:12`],
  ['recog', `s:${SC}:18`],

  /* objections to their texts */
  ['jones4', `s:${PL}:4`],
  ['jones6', `s:${SC}:10`], ['jones8', `s:${SC}:4`],
  ['paraclete', `s:${MC}:3`], ['huff1', `s:${E}:13`], ['huff5', `s:${E}:10`],

  /* holes */
  ['hole5', 'verses'], ['hole2', 'v:Isaiah 56:7'],
  ['hole3', `s:${JT}:10`], ['hole3', `s:${JT}:9`],
  ['hole4', `s:${E}:7`], ['hole1', `s:${JT}:9`],
  [`s:${SC}:11`, 'dns8'], [`s:${SC}:10`, 'dns4'],

  /* do not say */
  ['dns0', 'dns3'], ['dns1', `s:${E}:10`], ['dns2', `s:${E}:17`],
  ['dns7', `s:${E}:13`],

  /* assets */
  ['unused0', `s:${SC}:7`], ['unused1', `s:${SC}:20`], ['unused2', `s:${SC}:17`],
  ['unused1', `s:${JT}:14`],

  /* the new finds */
  ['new0', 'newA'], ['new0', 'newB'], ['new0', 'newC'],
  ['newA', 'jones3'], ['newC', `s:${SC}:19`], ['newC', `s:${SC}:18`],
  ['newD', 'divorce'], ['newE', `s:${SC}:5`], ['newF', 'hole3'],
  ['newG', 'dns3'], ['newG', 'hole2'], ['newH', 'concede'],
  ['newI', 'paraclete'], ['newJ', 'jones3'], ['newK', 'dns5'],
  ['newH', 'dns10'],

  /* close */
  ['close', 'bank'], ['close', 'd:questions/nazarene-sect-sacrifice-and-diet.md'],
  ['acq', 'd:questions/CITATION-NOTES.md'],
  ['dns0', 'd:questions/CITATION-NOTES.md'],
  ['paraclete', 'd:questions/method-and-criteria.md']
];

/* ------------------------------------------------------------------- layout */
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
    else if (item.k === 'n') { it.push(['n', item.text, x, y, item.w]); idOf[item.name] = 'n:' + seq; seq++; }
  });
  const ln = strings.map(([a, b]) => [idOf[a] || a, idOf[b] || b]);
  return { v: 1, vp: [40, 40, 0.3], it, ln };
}
const keyOf = item => item.k === 'n' ? 'n:' + item.name : item.id;

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', defaultViewport: { width: 1600, height: 1000 }, args: ['--no-sandbox'] });
  const measure = async desk => {
    const p = await (await browser.createBrowserContext()).newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL + '#b=' + encodeURIComponent(JSON.stringify(desk)), { waitUntil: 'load' });
    await p.waitForSelector('.tray-case'); await new Promise(r => setTimeout(r, 2000));
    const m = await p.evaluate(() => {
      const out = {};
      [].slice.call(document.querySelectorAll('.nodes .node')).forEach(n => {
        const ta = n.querySelector('textarea');
        out[n.getAttribute('data-id')] = { h: n.offsetHeight, text: ta ? ta.value : null };
      });
      return { out, strings: document.querySelectorAll('#links .string-line').length };
    });
    if (errs.length) throw new Error(errs.join(' | '));
    return m;
  };
  const d1 = layout({});
  const m1 = await measure(d1);
  /* Name anything the Desk could not resolve, rather than leaving it to a count. */
  {
    const expect = [];
    d1.it.forEach(e => {
      if (e[0] === 's') expect.push(`s:${e[1]}:${e[2]}`);
      else if (e[0] === 'q') expect.push(`q:${e[1]}`);
      else if (e[0] === 'v') expect.push(`v:${e[1]}`);
      else if (e[0] === 'd') expect.push(`d:${e[1]}`);
    });
    const got = Object.keys(m1.out);
    const gone = expect.filter(id => got.indexOf(id) < 0);
    if (gone.length) console.error('UNRESOLVED (' + gone.length + '):\n  ' + gone.join('\n  '));
  }
  const H = {};
  Object.keys(m1.out).forEach(id => {
    const r = m1.out[id];
    if (r.text != null) { const n = Object.values(notes).find(n => n.text === r.text); if (n) H['n:' + n.name] = r.h; }
    else H[id] = r.h;
  });
  const missing = d1.it.length - Object.keys(m1.out).length;
  const d2 = layout(H);
  const m2 = await measure(d2);
  let drift = 0;
  Object.keys(m2.out).forEach(id => {
    const r = m2.out[id];
    const k = r.text != null ? 'n:' + Object.values(notes).find(n => n.text === r.text).name : id;
    if (H[k] !== r.h) drift++;
  });
  const file = {
    slug: 'naz-sect-debate-prep',
    title: 'The Nazarene sect, sacrifice and flesh — prep board',
    subtitle: 'Internal. How to hold the resolution, what Huff, Boyce and Jones actually said, the six holes, and the do-not-say list.',
    by: 'Rex & Matt',
    listed: false,
    desk: d2
  };
  fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(file, null, 1) + '\n', 'utf8');
  console.log(JSON.stringify({ items: d2.it.length, rendered: Object.keys(m2.out).length, missingPass1: missing, strings: d2.ln.length, drawn: m2.strings, heightDrift: drift }));
  await browser.close();
})().catch(e => { console.error('GEN ERROR', e); process.exit(2); });
