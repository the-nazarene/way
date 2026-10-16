/* Builds site/data/desks/sacrifice-and-flesh-the-case.json — the board we send out.

   Same resolution as naz-sect-debate-prep, different audience. The prep board is an
   internal audit and names who said what wrong on which recording. This one is the
   case itself, laid out to be read by the person arguing it.

   The difference is editorial, not evidential: every source card, verse and note here
   also appears on the prep board or is drawn from the same verified material. What is
   dropped is the attribution of errors to particular speakers and recordings. Claims
   that do not survive a lexicon are still here — stated as facts about the claims,
   which is the useful form, rather than as a charge sheet.

   Lay out, measure every card in real Chrome, lay out again with the real heights. */
const puppeteer = require('puppeteer-core');
const { CHROME, URL } = require('./env');
const fs = require('fs');
const OUT = require('path').join(__dirname, '..', '..', 'data', 'desks', 'sacrifice-and-flesh-the-case.json');

const E = 'essene-nazarene-origins', SC = 'sacrifice-culture-vegetarian-jesus',
      JT = 'jesus-and-the-torah', MC = 'method-and-criteria',
      TH = 'the-gospel-of-thomas', PL = 'pauls-legitimacy';
const W = 250, GAP = 22, GAPX = 26, PAD = 26, FRAME_GAP = 90, ROW_GAP = 130;

const S = (c, i) => ({ k: 's', c, i, id: `s:${c}:${i}` });
const Q = c => ({ k: 'q', c, id: `q:${c}`, w: 270 });
const V = key => ({ k: 'v', key, id: `v:${key}` });
const D = path => ({ k: 'd', path, id: `d:${path}` });
const N = (name, text, w) => ({ k: 'n', name, text, w: w || W });

const notes = {

  res: N('res', 'WHAT WE HAVE BEEN LOOKING INTO\n\n' +
    'Whether the historical Jesus belonged to a Nazarene group that rejected animal ' +
    'sacrifice and did not eat flesh.\n\n' +
    'It turns out to be two separate questions, and noticing that changes everything. ' +
    'The sentence people argue about attaches the practice to THE GROUP, not to Jesus:\n\n' +
    'ONE — did that group reject sacrifice and abstain from flesh?\n' +
    'TWO — was he part of it?\n\n' +
    'The first is where almost all the evidence is. The second is where almost all the ' +
    'argument is. Held apart, they are two findings. Run together, every weakness in the ' +
    'second looks like a hole in the first — which is how this gets lost.\n\n' +
    'So the sections below are questions, not positions.', 560),

  how: N('how', 'HOW THIS IS PUT TOGETHER\n\n' +
    'One section per question. Inside each: the primary texts, then the common ' +
    'counterpoints on that same question, sitting right next to the evidence they bear ' +
    'on rather than collected into a separate pile.\n\n' +
    'That is deliberate. Nobody reads a case for and then a case against. You read a ' +
    'question and you want everything on it in one place.\n\n' +
    'Any card with a stamp is a real source, checked against a text actually held in the ' +
    'library — the build refuses to publish a citation it cannot find in a file. Cards ' +
    'marked NOTE · NOT A SOURCE are ours: commentary, not evidence.\n\n' +
    'Press → to walk it. Click any card to read the whole source. Drag anything out, add ' +
    'your own, tie your own string — it is your desk once you open it.', 540),

  /* section-internal counterpoint headers */

  cp2: N('cp2', 'COMMON COUNTERPOINTS ON THIS QUESTION\n\n' +
    'The strongest things said against the anti-sacrifice reading. They belong here, ' +
    'beside the evidence, because this is the question they are about.'),

  cp3: N('cp3', 'COMMON COUNTERPOINTS ON THIS QUESTION\n\n' +
    'Two serious ones, and the second is the better of them.\n\n' +
    'THE DAMASCUS DOCUMENT LEGISLATES EATING LOCUSTS AND FISH — CD 12:11-15. Locusts ' +
    'thrown alive into fire or boiling water, fish cut open to drain the blood. ' +
    'Substantially accurate, and CD 12 is not among the Dead Sea Scrolls excerpts the ' +
    'library holds, so it cannot currently be checked here. Worth getting.\n\n' +
    'Which is the reason to argue the NAZARENE MOVEMENT rather than the Essene menu. ' +
    'That is the narrower claim and it is the one the evidence in this section actually ' +
    'supports.\n\n' +
    'ALSO: the witnesses here are late. Epiphanius is fourth century, Ancyra is 314. ' +
    'True — and the answer is in the note beside them: late witnesses who were trying to ' +
    'discredit the group are stronger evidence than early friendly ones.'),

  netser: N('netser', 'WHERE THE NAME ITSELF MAY COME FROM — Isaiah 11.\n\n' +
    'Isaiah 11:1 (KJV) — "And there shall come forth a rod out of the stem of Jesse, and ' +
    'a BRANCH shall grow out of his roots." The Hebrew word for that branch is NETSER — ' +
    'the same three consonants as Nazarene.\n\n' +
    'Matthew 2:23 says he settled in Nazareth "that it might be fulfilled which was ' +
    'spoken by the prophets, He shall be called a Nazarene" — and no Old Testament verse ' +
    'says those words. The branch of Isaiah 11:1 is the oldest and most widely held ' +
    'explanation of what Matthew is pointing at; Jerome read it that way in the fourth ' +
    'century.\n\n' +
    'And look what else lives in that same chapter: "with righteousness shall he judge ' +
    'THE POOR" (11:4 — the ebionim\'s own self-designation), and the holy mountain where ' +
    '"they shall not hurt nor destroy" (11:9). One chapter carrying the movement\'s name, ' +
    'its self-designation, and its vision of the kingdom.\n\n' +
    'Stated that way it holds. Two cautions: 11:9\'s "destroy" is NOT the Hebrew word for ' +
    'ritual slaughter (different root — the real verbal link is to Genesis 6:11, "the ' +
    'earth was corrupt"), and Isaiah 25:6 puts a feast of fat things on the same mountain ' +
    '— see WHAT IS STILL OPEN.', 540),

  cp4: N('cp4', 'COMMON COUNTERPOINTS ON THIS QUESTION\n\n' +
    'THE NAME. Nazareth existed; archaeology settles that. And the later group spelled ' +
    'itself differently. So "Nazarene" as a sect name rather than a hometown is ' +
    'contested, and we do not need to win it — the sect designation in Acts 24:5 is in ' +
    'the text either way.\n\n' +
    'THE VOCABULARY. "Spirit of truth" and "children of light" show a shared religious ' +
    'dialect, not membership. Agreed. That is why this section claims a stream.\n\n' +
    'THE FATHERS CUT BOTH WAYS. Jerome and Epiphanius say the group of THEIR day was not ' +
    'the one Paul collected for. A real point, and the honest reply is that we use their ' +
    'reportage, not their verdicts.\n\n' +
    'HE ATE WITH SINNERS AND DRANK WINE. Also true, and it is why a membership card is ' +
    'the wrong thing to claim.'),

  cp6: N('cp6', 'COMMON COUNTERPOINTS ON THIS QUESTION\n\n' +
    'This question has the strongest counter-texts of any on the board, and all four are ' +
    'laid out here rather than hidden. Two of them had no answer in this library until ' +
    'this month.'),

  concede: N('concede', 'THREE THINGS TO KNOW BEFORE READING ANYTHING ELSE\n\n' +
    '1. NO ANCIENT TEXT CALLS JESUS AN ESSENE. True. The word "Essene" never appears in ' +
    'the Dead Sea Scrolls either — the people who wrote the scrolls did not call ' +
    'themselves that. So nobody on any side of this can produce a sentence that puts him ' +
    'in, or keeps him out. What the texts DO show is the gospels and the scrolls using ' +
    'the same unusual language ("sons of light," "spirit of truth"), quoting the same ' +
    'proof text, and practicing the same wilderness immersion. He came out of that ' +
    'world. Whether he carried its membership card, no text says.\n\n' +
    '2. LUKE SAYS THE RISEN JESUS ATE FISH, AND THE VERSE IS REAL. It is in every early ' +
    'manuscript. The live question is not whether the verse exists — it is what the fish ' +
    'in the gospels are doing. Four arguments on that, in the FISH section.\n\n' +
    '3. NO SCHOLAR SAYS "THE ESSENES BECAME THE EBIONITES" AS SETTLED FACT. And this ' +
    'research does not need them to. The claim that carries the weight is simpler: the ' +
    'movement led by Jesus\'s own brother rejected sacrifice and abstained from flesh — ' +
    'and the people who recorded that were its enemies.\n\n' +
    'The sentence that survives any pressure: "Nobody can say this definitively, and we ' +
    'are not saying it definitively — we are saying the evidence converges."', 540),

  fish0: N('fish0', 'THE FISH — WHERE THE REAL ARGUMENT IS\n\n' +
    'This gets treated as the knockout and it is not. But winning it requires separating ' +
    'two questions that keep getting merged:\n\n' +
    'IS THE TEXT THERE? Yes. Luke 24:42-43 is in P75, Sinaiticus and Vaticanus. Only the ' +
    'honeycomb is a variant. Arguing that the verse is "textually unstable" has been tried ' +
    'against someone holding a critical apparatus and it does not survive — every ' +
    'manuscript has the fish, and none has honeycomb alone.\n\n' +
    'DOES IT MEAN WHAT THEY SAY IT MEANS? That is open, and there are four real arguments ' +
    'on it. None of them needs the manuscript to be shaky.\n\n' +
    'So: grant the manuscript, take the meaning. That is a much stronger position than ' +
    'contesting both — and it is the one the evidence actually supports.', 540),

  fish1: N('fish1', '1. JESUS\'S OWN RECAP NAMES ONLY THE LOAVES.\n\n' +
    'Mark 8:19-21 — he walks the disciples back through both feeding miracles and asks ' +
    '"Do ye not yet understand?" about the LOAVES. The fish are absent from his own ' +
    'interpretation of his own miracle.\n\n' +
    'Mark 6:52 says the same thing from the narrator: "they considered not the miracle of ' +
    'the loaves."\n\n' +
    'This is the strongest of the four, because it is the text\'s own gloss rather than ' +
    'ours. It is already on the sacrifice card and in the library.'),

  fish2: N('fish2', '2. THE CALL NARRATIVE HAS NO MIRACULOUS CATCH.\n\n' +
    'Mark and Matthew both call the fishermen with no miracle at all. Luke 5 alone adds ' +
    'the filled nets.\n\n' +
    'That matters for the John 21 version too: if the miraculous catch is a Lukan and ' +
    'Johannine development rather than part of the earliest telling, "he commanded the ' +
    'catch" is an argument about a later layer, not about the historical figure.\n\n' +
    'State it as a redaction observation, which is defensible, not as "it never happened."'),

  fish3: N('fish3', '3. THE GREEK WORDS ARE NOT ALL THE SAME WORD.\n\n' +
    'John\'s feeding and John 21 use opsarion and prosphagion — the ordinary words for ' +
    'the relish or side eaten with bread — rather than ichthys.\n\n' +
    'Handle this one carefully. A lexicon gives opsarion as "fish" plainly enough, and ' +
    'this argument has been answered on camera by someone simply holding one up. It is ' +
    'genuine texture and a footnote. It is not a headline, and leading with it invites ' +
    'the lexicon.\n\n' +
    'The same caution applies to the ichthys acronym: it post-dates the gospels, so it ' +
    'cannot be a wink planted inside the text.'),

  fish4: N('fish4', '4. THE OLD SYRIAC AT LUKE 21:34.\n\n' +
    '"Beware that your hearts do not become heavy with the EATING OF FLESH, with the ' +
    'intoxication of wine, and with the anxiety of the world" — against the Greek, which ' +
    'has a word meaning surfeiting or hangover (KJV: "surfeiting, and drunkenness").\n\n' +
    'The most interesting of the four, and the most often fumbled. Two things to get ' +
    'right: it is the OLD SYRIAC (Curetonian, and reportedly the Sinaitic too), not the ' +
    'Peshitta — the library currently says Peshitta and that should be corrected. And it ' +
    'is Luke 21:34, which is easy to misspeak; that slip has been used, in public, to ' +
    'dismiss the whole point without engaging the manuscript.\n\n' +
    'Burkitt\'s 1904 edition is public domain. Worth holding before this is argued again.'),

  stream: N('stream', 'THE SHAPE OF THE CLAIM: he came out of this world.\n\n' +
    'Not "he was a card-carrying member of group X" — no text supports that, and he ate ' +
    'with sinners and drank wine, which no sectarian rulebook allows.\n\n' +
    'What the texts support is an inheritance: a shared vocabulary found nowhere in the ' +
    'Hebrew Bible, a shared proof text, a shared wilderness-and-immersion pattern. These ' +
    'characteristics run through several groups across two centuries — scrolls community, ' +
    'Baptist movement, Jesus movement, Ebionites — and that continuity is itself the ' +
    'finding. One tradition, several names.'),

  red: N('red', 'THIS HALF IS RED TEXT ABOUT JESUS HIMSELF.\n\n' +
    'He threw Hosea 6:6 at the men running the cult — twice. He stopped the Temple ' +
    'traffic quoting the one chapter where God denies commanding burnt offerings. And the ' +
    'next verse says that is the moment they decided to kill him:\n\n' +
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

  divorce: N('divorce', 'THE STRONGEST SINGLE MOVE\n\n' +
    'Matthew 19:8 — "Moses because of the hardness of your hearts suffered you to put ' +
    'away your wives: but from the beginning it was not so."\n\n' +
    'Jesus, in the red text, identifies a standing Torah permission as a CONCESSION to ' +
    'hardness of heart, and appeals past it to the beginning. That is the whole ' +
    'hermeneutic, in his own mouth, applied by him to a different question.\n\n' +
    'It answers "Genesis 9:3 permits meat" without denying that it permits meat. ' +
    'Permission is not endorsement — and he is the one who says so.\n\n' +
    'It is also the canonical twin of Clementine Recognitions 1.36, whose chapter title ' +
    'is literally "Allowance of Sacrifice for a Time." The same logic in the red text and ' +
    'in the movement that claimed succession from him.\n\n' +
    'It has been put to a credentialed critic in public, at length, and went unanswered.', 540),

  recog: N('recog', 'Recognitions 1.36 is titled "Allowance of Sacrifice for a Time."\n\n' +
    'The Jewish-Christian text says the sacrifices were a temporary concession to a ' +
    'people who had learned the habit in Egypt — not a divine requirement.\n\n' +
    'Pair it with Matthew 19:8 and the argument is no longer ours. It belongs to the red ' +
    'text and to the earliest movement that claimed him.'),

  /* ---- counterpoints, distributed into their questions ---- */

  opp0: N('opp0', 'WHAT A PREPARED OPPONENT ACTUALLY SAYS\n\n' +
    'These are not hypothetical. Every one was argued by a named critic — two apologists ' +
    'and a PhD who brought a Greek New Testament — across about ten hours of recorded ' +
    'debate on exactly this question.\n\n' +
    'Several are not answered anywhere in the library yet. Those are marked OPEN, because ' +
    'pretending otherwise is how you get surprised on a recording.', 540),

  opp1: N('opp1', 'ACTS 10 — "rise, kill and eat", and the author tells it TWICE (ch. 10 ' +
    'and again in 11).\n\n' +
    'The most-used text against this position, and it is not on the card at all.\n\n' +
    'Acts 10:13-14 (KJV) — "And there came a voice to him, Rise, Peter; kill, and eat. ' +
    'But Peter said, Not so, Lord; for I have never eaten any thing that is common or ' +
    'unclean."\n\n' +
    'The defensible line is the vision\'s own stated meaning — Gentile inclusion (10:28, ' +
    '10:34-35) — which most critics grant outright.\n\n' +
    'Stay off the lexical route. Reading "a voice" as something other than God does not ' +
    'hold, because Peter answers "Not so, LORD" in the very next breath. The vision\'s ' +
    'own interpretation is the strong ground here.'),

  opp2: N('opp2', 'GENESIS 8:20-21 — God smells Noah\'s burnt offering and calls it good.\n\n' +
    '"The sacrificial system of Israel was founded upon that sacrifice."\n\n' +
    'God\'s explicit approval of animal sacrifice at the narrative reset. Harder than ' +
    'Leviticus, because it is approval rather than legislation. OPEN — nothing on the ' +
    'card answers it.\n\n' +
    'The best available answer is in the NEW GROUND section: the Clementine reading makes ' +
    'bloodshed the CAUSE of the flood, which reframes the whole scene before the ' +
    'objection is even raised.'),

  opp3: N('opp3', 'GENESIS 9:3 IS THE NOAHIC COVENANT — the one we live under. The Adamic ' +
    'one ended.\n\n' +
    'Genesis 9:3 (KJV) — "Every moving thing that liveth shall be meat for you; even as ' +
    'the green herb have I given you all things."\n\n' +
    'A clean structural answer to Genesis 1:29 that does not deny 1:29 — it dates it.\n\n' +
    'TWO ANSWERS, and they work together: Matthew 19:8 (permission is not endorsement, ' +
    'in his own mouth), and the Genesis Apocryphon in the NEW GROUND section, where the ' +
    'same grant appears with no flesh permission at all.'),

  opp4: N('opp4', 'DEUTERONOMY 14:3-5, and "there are 635 laws in Torah and not one says ' +
    'you may not eat meat."\n\n' +
    'Deuteronomy 14:4-5 (KJV) — "These are the beasts which ye shall eat: the ox, the ' +
    'sheep, and the goat, the hart, and the roebuck, and the fallow deer..."\n\n' +
    'True, and it does not touch claim A as properly stated. The claim is about a SECT\'S ' +
    'practice and a prophetic critique of the cult, not about a Torah prohibition. ' +
    'Agreeing here costs nothing at all.'),

  opp5: N('opp5', 'THE DAMASCUS DOCUMENT LEGISLATES EATING LOCUSTS AND FISH — CD 12:11-15.\n\n' +
    '"Locusts thrown alive into fire or boiling water; fish cut open alive to drain the ' +
    'blood. These do not seem like animal liberationists."\n\n' +
    'The most damaging TECHNICAL argument on the other side, and substantially accurate. ' +
    'CD 12 is not among the Dead Sea Scrolls excerpts the library holds, so it cannot ' +
    'currently be checked.\n\n' +
    'Until it is held: argue the Nazarene movement, not the Essene menu. That is the ' +
    'narrower claim and it is the one the evidence supports.'),

  opp6: N('opp6', 'JOHN 21 — he COMMANDED the catch.\n\n' +
    'Not merely "he ate fish." He performed a miracle to fill the net, then cooked it. ' +
    'And the sharpest form anyone has given it:\n\n' +
    '"Pythagoras let the fish go but Jesus didn\'t. That\'s the point of the story — I\'m ' +
    'not Pythagoras, I\'m Jesus, we eat fish."\n\n' +
    'A separate and sharper argument than Luke 24. Prepare it separately. OPEN.'),

  opp7: N('opp7', 'THE HARDEST QUESTIONS HERE ARE NOT ABOUT TEXTS, THEY ARE ABOUT METHOD:\n\n' +
    '"We can\'t get behind the text. All we\'ve got is the text."\n\n' +
    'JOHN 14:26 — Jesus in the red text promises the Spirit so the apostles would not ' +
    'merely remember his words but UNDERSTAND them. So the apostolic interpretation is ' +
    'authorised by Jesus himself, and red-letters-only is unbiblical on its own terms. ' +
    'This is the best unanswered objection on the whole question.\n\n' +
    'THE LXX RULE — the gospel writers quote the Greek. Both halves of the Temple ' +
    'quotation are verbatim LXX, and the phrase is spelaion leston, "cave of bandits," ' +
    'identical across three gospels. This answers a whole family of Hebrew-lexical ' +
    'arguments at one stroke.\n\n' +
    'Both OPEN. Both will come up.', 540),

  opp8: N('opp8', 'WHY THE FATHERS, BUT NOT MARK 16?\n\n' +
    '"Your Hebrew Gospel argument depends heavily on the church fathers. Why are the ' +
    'fathers who mention the longer ending of Mark 16 not authoritative, but when they ' +
    'mention a Hebrew Matthew, they are?"\n\n' +
    'The criterion of embarrassment does not answer this. Embarrassment vouches for a ' +
    'hostile witness reporting content against his own interest; it says nothing about ' +
    'whether the father correctly IDENTIFIED a text — which is the actual question. And ' +
    'Mark 16 is attested by the same fathers.\n\n' +
    'OPEN, and the library has nothing on it anywhere. This is the one to think about ' +
    'before the next recording.'),

  /* ---- where it is weakest ---- */

  weak0: N('weak0', 'WHAT IS STILL OPEN\n\n' +
    'The honest list of what this research has not solved. It is here on purpose and near ' +
    'the end on purpose.\n\n' +
    'Every one of these is a place where the texts genuinely push back, and writing them ' +
    'down is what makes the rest of the board trustworthy. If a section has no open ' +
    'questions, nobody checked it hard enough.\n\n' +
    'Six, and the first was found this month.', 540),

  hole5: N('hole5', '★ THE WORST ONE — Isaiah 25:6.\n\n' +
    '"And in this mountain shall the LORD of hosts make unto all people a feast of fat ' +
    'things... of fat things full of marrow, of wines on the lees well refined."\n\n' +
    'THE SAME HOLY MOUNTAIN as Isaiah 11:9 ("they shall not hurt nor destroy") and ' +
    'Isaiah 56:7 ("my holy mountain... house of prayer"). Fourteen chapters later. Same ' +
    'prophet.\n\n' +
    'An eschatological MEAT-AND-WINE BANQUET sitting underneath the entire peaceable-' +
    'kingdom architecture. It has been raised in public exactly once, in one interrupted ' +
    'sentence — and it landed anyway.\n\n' +
    'If you build on Isaiah 11, own Isaiah 25 first. It is not in the library in any form ' +
    'yet.', 540),

  hole1: N('hole1', 'ACTS 21:23-26 — James tells Paul to pay for four men\'s Temple ' +
    'offerings, and Paul does it.\n\n' +
    'The highest-threat text, because it is the James household itself participating in ' +
    'the sacrificial system.\n\n' +
    'Worth knowing: in three hours of public argument on exactly this question, nobody ' +
    'raised it — the much cheaper Acts 3:1 came up instead. It is listed here because an ' +
    'honest map includes it, not because anyone has pressed it yet.'),

  hole2: N('hole2', 'ISAIAH 56:7, FIRST HALF — "their burnt offerings and their ' +
    'sacrifices shall be accepted upon mine altar."\n\n' +
    'We quote the second half. The first half is pro-sacrifice, in the same verse.\n\n' +
    'The interpolation reading of that clause has no named scholar behind it, so it ' +
    'will not survive being asked for a source.\n\n' +
    'There IS a real interpolation argument, on a different text: PSALM 51:18-19, where ' +
    'the sacrifice coda reverses the two verses before it and is long recognised as a ' +
    'post-exilic addition. That one is in the library, it is defensible, and it makes the ' +
    'same point. Reach for it instead.'),

  hole3: N('hole3', 'THOMAS 14 and Q 10:8 / LUKE 10:8 — "eat such things as are set ' +
    'before you."\n\n' +
    'Jesus instructing his own itinerants not to be fussy about food, in two top-tier ' +
    'sources.\n\n' +
    'Also Q 7:34 — "a gluttonous man, and a winebibber."\n\n' +
    'The upgrade on that one is textual rather than rhetorical: Luke 7:33 names BREAD ' +
    '("neither eating bread nor drinking wine"), so the bare "eating and drinking" of ' +
    '7:34 takes bread and wine as its antecedents. And Proverbs 23:20 pairs "winebibbers" ' +
    'with "riotous eaters of flesh" — the slur is a stock proverbial formula, not a menu.'),

  hole4: N('hole4', 'THE JAMES-HOUSEHOLD INFERENCE.\n\n' +
    'Hegesippus on James\'s diet comes through Eusebius, is late, and is hagiography. ' +
    'As one critic put it: "this idea that James was a vegetarian is in, like, two ' +
    'obscure sources."\n\n' +
    'Two things not to do. Do not inflate the count — it is one source via one ' +
    'transmitter. And do not extend it to the household ("so Mary raised him that way"): ' +
    'the Hegesippus clause is a matched pair that includes wine, and Q 7:34 has Jesus a ' +
    'winebibber. The inference breaks on its own sentence.\n\n' +
    'A Nazirite vow does not forbid meat either — a DSS specialist volunteered that ' +
    'unprompted. The chain-of-custody argument is the answer here, and it is on the card.'),

  luke2: N('luke2', 'LUKE 2:24 — the holy family brings two turtledoves to the Temple.\n\n' +
    '"Were Jesus\'s parents, who apparently were part of the Essene group of some sort, ' +
    'wrong for bringing these doves to the temple?"\n\n' +
    'Harder than Acts 21, because it is his own parents, in the infancy narrative, with ' +
    'no plausible distance. Not in the library in any form.'),

  precise: N('precise', 'THREE PLACES WHERE PRECISION MATTERS MOST\n\n' +
    'Each of these has a strong form and a loose form, and the loose form is refutable ' +
    'by anyone with a lexicon open. The strong form makes the same point and holds.\n\n' +
    'ISAIAH 11:9. The strong form is the link to Genesis 6:11, "the earth was corrupt" — ' +
    'same Hebrew word, shachath, genuinely. The loose form reads it as the word for ' +
    'ritual slaughter, which is a different root (shachat, final tet). Keep the Genesis ' +
    'link; it is real and it is enough.\n\n' +
    'THE TEMPLE ACTION. The strong form is JOHN 2:15, which drives out the sheep and the ' +
    'oxen. The synoptics say he overthrew "the seats of them that sold doves" — they do ' +
    'not have him free an animal. Say John 2:15 and stop. The night-before look around ' +
    'the Temple is fine: that is Mark 11:11.\n\n' +
    'GENESIS 9:3. The strong form is the Genesis Apocryphon in the NEW GROUND section — ' +
    'a manuscript, not an etymology. Do not argue over what "every moving thing" means; ' +
    'Genesis 9:2 already lists beast, fowl and fish, so the scope question is settled ' +
    'against you one verse earlier.', 540),

  /* ---- new ground ---- */

  new0: N('new0', '★★ NEW GROUND — found this month\n\n' +
    'Three agents read about twenty-two hours of recorded argument on this question ' +
    'against the whole library, asking one thing: is there anything STRONGER than what ' +
    'we currently lead with?\n\n' +
    'Honest answer: nothing beats the Clementine block for claim A, and nothing is ' +
    'stronger for claim B. But six things are stronger at specific pressure points — and ' +
    'two of the six were already sitting in this library, held verbatim, never used.', 540),

  newA: N('newA', '★ 1. THE GENESIS APOCRYPHON (1QapGen XI)\n\n' +
    'Noah\'s post-flood grant, in a pre-Christian Hebrew and Aramaic manuscript:\n\n' +
    '"Do not fear, Noah... I give all of it to you and to your sons to eat the green ' +
    'things and the grass of the earth, but you shall not eat any blood."\n\n' +
    'NO FLESH PERMISSION.\n\n' +
    'This is the same moment as Genesis 9:3 — the single most-used counter-text on this ' +
    'question, and a hole with no answer. A Dead Sea Scrolls specialist read it aloud, ' +
    'called it "quite remarkable", and said he had never read it with this in mind.\n\n' +
    'Not held yet. Cave 1, not Cave 4. Use it as a PARALLEL TRADITION — it is rewritten ' +
    'Bible, not a Genesis manuscript, so it is not a textual variant and must not be ' +
    'called one.', 540),

  newB: N('newB', '★ 2. IRENAEUS, AGAINST HERESIES — Book 5, ch. 33, §§3-4\n\n' +
    '"...it is right that when the creation is restored, all the animals should obey and ' +
    'be in subjection to man and revert to the food originally given by God... that is, ' +
    'the productions of the earth."\n\n' +
    'A hostile orthodox father, around 180, who CONDEMNS the Ebionites elsewhere — ' +
    'reading Isaiah 11 the same way we do.\n\n' +
    'That is the hostile-witness structure this whole case rests on, aimed at the Eden-' +
    'to-Kingdom frame. And it answers the question that sits upstream of everything: ' +
    'whether Eden was ever a vision of non-violence at all.\n\n' +
    'Not held — and the translation is PUBLIC DOMAIN, so this one costs nothing to add.', 540),

  newC: N('newC', '★ 3. ALREADY IN THE LIBRARY, NEVER USED\n' +
    '1 Enoch 7:5 + Clementine Homilies 8.16-8.17.\n\n' +
    'The card quotes Homilies 8.15 and stops. It never says what 8.15 is: the chapter is ' +
    'titled "The Giants", and the NEXT chapter is titled "Cannibalism."\n\n' +
    '8.16 — "it was not a long step to the consumption of flesh like their own, having ' +
    'first tasted it in other forms."\n' +
    '8.17 — "by the shedding of much blood, the pure air being defiled" — the flood as a ' +
    'purgation of bloodshed.\n' +
    '1 Enoch 7:5 — the giants "began to sin against birds, and beasts, and reptiles, and ' +
    'fish, and to devour one another\'s flesh, and drink the blood."\n\n' +
    'Together these answer Genesis 9:3, Genesis 8:20-21, and the "nobody is innocent, ' +
    'there is no death-free meal" objection — because 8.15 makes NECESSITY the hinge and ' +
    '8.16 makes the objection INTENTIONAL killing.\n\n' +
    'Both Tier 1. Both verified verbatim. The library has been quoting the conclusion and ' +
    'dropping the premise.', 540),

  newD: N('newD', '4. EZEKIEL 20:25-26 — a canonical warrant for the concession reading\n\n' +
    '"Wherefore I gave them also statutes that were not good, and judgments whereby they ' +
    'should not live" — and the next verse illustrates it with an OFFERING practice.\n\n' +
    'Better than Matthew 19:8 on subject matter: the not-good statute concerns offerings, ' +
    'not divorce. Prophetic, canonical, and it pre-empts the philosophical objection ' +
    '("God cannot command what is immoral") from inside the canon.\n\n' +
    'Held in the library\'s KJV. Absent from every card.\n\n' +
    'Concede first: the mainstream reading of v.26 is judicial abandonment to Molech ' +
    'practice. The narrow form is enough — the canon itself says God can give statutes ' +
    'that are not good, and the example it reaches for is an offering.'),

  newE: N('newE', '5. JEREMIAH 7:21 — the clause we keep leaving out\n\n' +
    'The card quotes 7:22. Read 7:21 first:\n\n' +
    '"Put your burnt offerings unto your sacrifices, AND EAT FLESH."\n\n' +
    'The sarcastic permission names eating the flesh, not just the altar. It welds the ' +
    'diet half to the sacrifice half inside the verse the case already leads with — in ' +
    'the received Hebrew text, with no appeal to a versional variant.\n\n' +
    'This matters beyond the one verse. Reaching for an unheld Syriac or Peshitta reading ' +
    'when the plain text already carries the point is how these exchanges get lost.'),

  newF: N('newF', '6. TWO SMALLER UPGRADES\n\n' +
    'LEVITICUS 5:11-13 — a bloodless flour sin offering, with atonement explicitly ' +
    'granted, INSIDE the priestly source. A DSS specialist calls it "quite the anomaly."\n\n' +
    'Limit: it is a concession for the poor, so it shows the blood requirement is not ' +
    'absolute — not that it was never commanded. Note how neatly it pairs with the ' +
    'ebionim self-designation.\n\n' +
    '"BE YE GOOD MONEY-CHANGERS" — a saying attributed to Jesus, held verbatim three ' +
    'times in the Clementine Homilies, commissioning discrimination between true and ' +
    'false scripture. It is the best available answer to "you are just discarding what ' +
    'you do not like" and to John 14:26. Prefer Homilies 18.20, which sits outside the ' +
    'section the editors flag.'),

  /* ---- closing ---- */

  close: N('close', 'THE SENTENCE THAT HOLDS EVERY WORD\n\n' +
    'The movement that claimed succession from Jesus through his brother James rejected ' +
    'sacrifice and abstained from flesh — and we know it from the people who were trying ' +
    'to discredit it.\n\n' +
    'That sentence is defensible all night. Everything stronger than it is a liability.', 540),

  acq: N('acq', 'WHAT WOULD MOST STRENGTHEN THIS RESEARCH NEXT\n\n' +
    '1. A LEXICON (LSJ, BDB — both public domain). Four of the recurring errors on this ' +
    'question are lexical; one lexicon ends all of them permanently.\n' +
    '2. A critical apparatus. Having one at the table is what has decided the sharpest ' +
    'public exchange on this question so far.\n' +
    '3. IRENAEUS 5.33 — public domain, free, and it closes the Eden question.\n' +
    '4. THE GENESIS APOCRYPHON column — closes Genesis 9:3.\n' +
    '5. CD 12:11-15 — the locust and fish rules, currently uncheckable.\n' +
    '6. Panarion 18 / 29 / 30 in usable excerpts, and Jerome on Galatians 2:10.\n\n' +
    'Numbers 3 and 4 are the two that change arguments rather than close gaps.'),

  prov: N('prov', 'ABOUT THIS BOARD\n\n' +
    'Built from the question cards in this library. Every source card was checked against ' +
    'a text actually held here by the build, which refuses to publish a citation it ' +
    'cannot find. Cards marked NOTE · NOT A SOURCE are commentary, not evidence.\n\n' +
    'Quotations from recorded conversations are described, not quoted as sources: auto-captions ' +
    'carry no speaker labels, so attribution is inferred and has to be checked against ' +
    'the audio before anyone repeats it.\n\n' +
    'Nothing here is generated. Search retrieves; it never writes.\n\n' +
    'Found a wrong citation? The link in the footer files it. Those get fixed on the ' +
    'cards, never on the board.', 540)
};

const header = { items: [notes.res, notes.how, Q(E), Q(SC)] };

const rows = [
  [
    { title: 'WHERE TO START', ci: 0,
      cols: [[notes.concede], [notes.stream, S(E, 8), S(E, 9)]] }
  ],
  [
    { title: '1 · DID HE OPPOSE THE SACRIFICES?', ci: 2,
      cols: [[S(SC, 0), S(SC, 1), S(SC, 2), S(SC, 6)],
             [S(SC, 3), S(SC, 4), S(SC, 5), S(SC, 8)],
             [notes.red, S(JT, 7), S(JT, 3)],
             [V('Isaiah 1:11-17'), V('Amos 5:21-25'), V('Micah 6:6-8')],
             [notes.cp2, V('Psalms 51:16-17'), S(JT, 9)]] }
  ],
  [
    { title: '2 · WHAT ABOUT THE FISH?', ci: 3,
      cols: [[notes.fish0, notes.fish3],
             [notes.fish1, V('Mark 8:19-21'), notes.fish4],
             [notes.fish2, V('Luke 24:42'), V('Luke 21:34')],
             [notes.opp6, S(SC, 10), S(SC, 11)]] },
    { title: '3 · DID THE MOVEMENT AFTER HIM ABSTAIN FROM FLESH?', ci: 1,
      cols: [[S(SC, 17), S(SC, 14), S(SC, 15), S(SC, 21)],
             [S(SC, 18), S(SC, 19), S(SC, 20), S(SC, 22)],
             [S(SC, 16), S(E, 13), S(E, 14), notes.after],
             [notes.cp3, S(E, 17)]] }
  ],
  [
    { title: '4 · WHERE DID HIS MOVEMENT COME FROM?', ci: 0,
      cols: [[S(E, 16), S(E, 0), S(E, 1), S(E, 2)],
             [S(E, 3), S(E, 4), S(E, 5), S(E, 6)],
             [S(E, 7), S(TH, 2), S(PL, 7), S(E, 11)],
             [notes.netser],
             [notes.cp4, S(E, 10)]] },
    { title: '★ 5 · WAS SACRIFICE EVER COMMANDED AT ALL?', ci: 2,
      cols: [[notes.divorce], [notes.recog, S(SC, 12), S(SC, 18)],
             [notes.newD, notes.newE, notes.newF]] }
  ],
  [
    { title: '6 · EDEN, THE FLOOD, AND WHAT CHANGED AFTER', ci: 3,
      cols: [[notes.cp6, notes.opp3],
             [notes.opp2, notes.opp4, S(PL, 4)],
             [notes.opp1, notes.precise],
             [notes.newA, notes.newB],
             [notes.newC, notes.new0]] }
  ],
  [
    { title: '7 · HOW DO YOU READ A LIBRARY THAT ARGUES WITH ITSELF?', ci: 1,
      cols: [[notes.opp7, S(MC, 3)], [notes.opp8, notes.hole2, V('Isaiah 56:7')]] },
    { title: '8 · WHAT IS STILL OPEN', ci: 2,
      cols: [[notes.weak0, notes.hole5],
             [notes.hole1, notes.hole4],
             [notes.hole3, notes.luke2, S(JT, 10)]] }
  ],
  [
    { title: '9 · WHAT WE WOULD STILL LIKE TO GET HOLD OF', ci: 3,
      cols: [[notes.acq, notes.close]] },
    { title: 'GO DEEPER', ci: 0,
      cols: [[D('questions/nazarene-sect-sacrifice-and-diet.md'),
              D('christianity/the-nazarenes.md'),
              D('christianity/prophetic-tradition-against-sacrifice.md'),
              D('christianity/biblical-case-for-vegetarian-jesus.md')],
             [D('christianity/james-the-just-key-to-understanding-jesus.md'),
              D('christianity/clementine-literature-nazarene-writings.md'),
              D('questions/method-and-criteria.md'),
              D('questions/CITATION-NOTES.md')],
             [notes.prov]] }
  ]
];

const strings = [
  ['res', 'how'], ['res', `q:${E}`], ['res', `q:${SC}`], ['how', 'concede'],

  ['concede', 'fish0'], ['fish0', 'fish1'], ['fish0', 'fish2'],
  ['fish0', 'fish3'], ['fish0', 'fish4'],
  ['fish1', 'v:Mark 8:19-21'], ['fish4', 'v:Luke 21:34'],
  ['fish0', 'v:Luke 24:42'], [`s:${SC}:10`, 'fish0'],

  [`q:${SC}`, `s:${SC}:0`], [`s:${SC}:0`, `s:${SC}:1`], [`s:${SC}:1`, `s:${SC}:2`],
  [`s:${SC}:3`, `s:${SC}:4`], [`s:${SC}:4`, 'red'],
  [`s:${SC}:5`, 'v:Amos 5:21-25'], [`s:${SC}:2`, 'v:Isaiah 1:11-17'],
  [`s:${SC}:6`, 'v:Micah 6:6-8'], [`s:${SC}:6`, `s:${JT}:7`],
  [`s:${SC}:0`, 'red'], [`s:${JT}:3`, `s:${SC}:1`],

  [`s:${SC}:17`, `s:${SC}:14`], [`s:${SC}:14`, `s:${SC}:15`],
  [`s:${SC}:18`, `s:${SC}:19`], [`s:${SC}:19`, `s:${SC}:20`],
  [`s:${SC}:22`, 'after'], [`s:${SC}:16`, `s:${E}:13`],

  [`q:${E}`, `s:${E}:16`], [`s:${E}:0`, `s:${E}:1`], [`s:${E}:1`, `s:${E}:2`],
  [`s:${E}:3`, `s:${E}:4`], [`s:${E}:5`, `s:${E}:6`],
  [`s:${E}:7`, `s:${TH}:2`], [`s:${TH}:2`, `s:${PL}:7`],
  ['stream', `s:${E}:8`], [`s:${E}:8`, `s:${E}:9`],

  ['divorce', 'recog'], ['divorce', 'opp3'], ['divorce', `s:${SC}:12`],
  ['recog', `s:${SC}:18`],

  ['cp6', 'opp3'], ['opp3', 'newA'], ['opp2', 'newC'],
  ['opp4', `s:${PL}:4`], ['opp6', `s:${SC}:10`], ['opp7', `s:${MC}:3`],
  ['opp1', 'precise'], ['cp2', 'v:Psalms 51:16-17'], ['cp2', `s:${JT}:9`],
  ['cp3', `s:${E}:17`], ['cp4', `s:${E}:10`],
  ['netser', `s:${E}:8`], ['netser', 'hole5'], ['netser', `s:${E}:3`],

  ['weak0', 'hole5'], ['hole2', 'v:Isaiah 56:7'],
  ['hole3', `s:${JT}:10`], ['hole4', `s:${E}:7`],
  ['precise', 'newA'],

  ['new0', 'newA'], ['new0', 'newB'], ['new0', 'newC'],
  ['newC', `s:${SC}:19`], ['newC', `s:${SC}:18`],
  ['newD', 'divorce'], ['newE', `s:${SC}:5`], ['newF', 'hole3'],

  ['close', 'res'], ['close', 'd:questions/nazarene-sect-sacrifice-and-diet.md'],
  ['acq', 'newB'], ['acq', 'newA'],
  ['precise', 'd:questions/CITATION-NOTES.md'],
  ['opp8', 'd:questions/method-and-criteria.md']
];

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
  const d2 = layout(H);
  const m2 = await measure(d2);
  let drift = 0;
  Object.keys(m2.out).forEach(id => {
    const r = m2.out[id];
    const k = r.text != null ? 'n:' + Object.values(notes).find(n => n.text === r.text).name : id;
    if (H[k] !== r.h) drift++;
  });
  const file = {
    slug: 'sacrifice-and-flesh-the-case',
    title: 'Jesus, sacrifice and flesh — what we have gathered',
    subtitle: 'Nine questions, the primary texts under each, and the common counterpoints sitting beside the evidence they bear on. Plus what is still open, and what we would like to get hold of next.',
    by: 'Rex & Matt',
    listed: false,
    desk: d2
  };
  fs.mkdirSync(require('path').dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(file, null, 1) + '\n', 'utf8');
  console.log(JSON.stringify({ items: d2.it.length, rendered: Object.keys(m2.out).length, strings: d2.ln.length, drawn: m2.strings, heightDrift: drift }));
  await browser.close();
})().catch(e => { console.error('GEN ERROR', e); process.exit(2); });
