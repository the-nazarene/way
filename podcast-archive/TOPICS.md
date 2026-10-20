# Topic tags for archive notes

Machine-written notes in `podcast-archive/` (made with `scripts/summarize-transcripts.py`) carry a `**Topics:**` line in the header, using only the tags below. The list is fixed on purpose: the question cards may be rewritten, renamed or split, and the tags shouldn't have to change with them. When the cards change, edit the mapping table here, not hundreds of transcript files.

Find every talk on a topic: `grep -rl "Topics:.*resurrection" podcast-archive/`

## The tags

| Tag | Covers |
|---|---|
| `paul` | Paul's letters, life, gospel, and his relation to Jesus and Jerusalem |
| `james` | James the brother of Jesus and the Jerusalem community |
| `ebionites-nazarenes` | The Ebionites, the Nazarenes, Jewish-Christian groups after 70 |
| `essenes-dead-sea-scrolls` | Qumran, the Scrolls, the Essenes |
| `john-the-baptist` | John, his movement, baptism |
| `mary` | Mary the mother of Jesus, Mary Magdalene |
| `jesus-family` | Jesus's brothers and sisters, the Desposyni, the "Jesus dynasty" |
| `resurrection` | Easter, the tomb, the earliest resurrection testimony |
| `afterlife-hell` | Death, afterlife, heaven and hell |
| `torah` | The Law, its observance, Sabbath, purity |
| `sacrifice` | Temple sacrifice and its rejection |
| `diet` | Vegetarianism, food laws |
| `nonviolence` | Peacemaking, the sword, enemies |
| `kingdom` | The Kingdom of God, on earth or within |
| `christology` | Who Jesus was taken to be: Messiah, prophet, divine |
| `virgin-birth` | The birth stories, Jesus's father |
| `apocalyptic` | End-times expectation, prophecy, its failure |
| `gospels-canon` | How the gospels and the canon were written and formed, Q, Thomas, interpolations |
| `archaeology` | Sites, tombs, ossuaries, digs |
| `last-week-crucifixion` | Jesus's final week, arrest, trial and death |

## Which card each tag feeds (edit when the cards change)

| Tag | Card in `questions/` |
|---|---|
| `paul` | `pauls-legitimacy.md` |
| `james`, `ebionites-nazarenes`, `essenes-dead-sea-scrolls`, `john-the-baptist` | `essene-nazarene-origins.md` |
| `torah` | `jesus-and-the-torah.md` |
| `sacrifice`, `diet` | `sacrifice-culture-vegetarian-jesus.md`, `nazarene-sect-sacrifice-and-diet.md` |
| `resurrection` | `resurrection.md` |
| `afterlife-hell` | `hell-afterlife.md` |
| `apocalyptic` | `rapture-end-times.md` |
| `kingdom`, `nonviolence` | `two-ways-kingdom-within.md` |
| `christology`, `virgin-birth` | `trinity-deity-of-jesus.md` |
| `gospels-canon` | `method-and-criteria.md`, `how-we-read-john.md`, `the-gospel-of-thomas.md` |
| `mary`, `jesus-family`, `archaeology`, `last-week-crucifixion` | no card yet |

Tagging is by the model, from the transcript: a tag means the talk substantially discusses the topic. `gospels-canon` is applied generously; treat it as a weaker signal than the others.
