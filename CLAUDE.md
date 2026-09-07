# House rules for this repo

These are binding on every page added here. They exist because the subject is a
halachic calculation: a page that is merely pretty, or that quietly rounds, is
worse than no page.

## 1. Every chart the Rambam gives is reproduced as a chart

Wherever the Rambam hands you a table — the motion blocks of KH 12:1–2, 14:1–3
and 16:2, the correction tables of KH 13:4 and 15:6, the bands of KH 14:5, the
mazal tables of KH 17:5–12, the קיצי הראיה of KH 17:16–21 — the page must show
that table **as a static chart, laid out the way he lays it out**:

- every row he lists, none dropped, none added;
- in his order, starting where he starts;
- at his precision, in degrees-minutes-seconds;
- labelled with his own phrasing where he gives one (`sourcePhrase` in the
  constants), and his chapter-and-halacha reference.

A chart may not be replaced by prose, by a graph, or by "the engine looks it
up". A graph may sit *beside* the chart to show its shape — the wheel of bands,
the sunset curve — but never instead of it.

## 2. Every chart must be traceable

Beside each row, the page shows what **this** calculation does with it: which
rows the current day count draws on, how many times each is taken, what each
contributes, and the running total that falls out. A reader must be able to put
a finger on a row and see it land in the answer.

Where the Rambam interpolates between rows (KH 13:7–8), show both bracketing
rows and the proportional part, not just the result.

## 3. Chart values are read, never retyped

Every figure in every chart comes from `CONSTANTS` in the vendored engine at
render time. No DMS literal may be typed into a page or partial. If a chart
needs a value the engine does not expose, add it to the engine bundle's surface
— do not transcribe it.

`test/rambam-tables.test.mjs` pins the engine's tables against the values as
printed in the Mishneh Torah. If a refresh from upstream changes a number, that
test fires before any page ships.

## 4. Every page is something you do, not something you watch

A page is not finished when it explains a calculation. It is finished when a
reader can **work that calculation themselves**, piece by piece, and be told
whether they got it right.

Use the shared drill (`src/partials/practice.js`). Its rules:

- **One piece at a time.** Steps unlock in order, so nothing is asked before the
  thing it rests on has been settled.
- **A fresh case each time.** "Another day" picks a new day count, so the answers
  cannot be memorised — the reader has to actually use the table.
- **Answers come from the engine at check time**, never stored in the page. A
  drill cannot drift from the lesson above it.
- **Being wrong teaches.** Say the right answer, how far off they were, and what
  the figure means. "Show me" gives a hint first, the answer second.
- **The reader's own units.** Degrees, minutes and seconds — the way the Rambam
  writes them — not decimals.

## 5. The engine is the authority

Any arithmetic a page performs itself must be checked against the engine at
runtime and must **hide itself rather than display a figure the engine would not
stand behind**. See `traceBlockChart` and the ledger in `src/lib/working.js`.

## 6. His words, not yours

Use the Rambam's own terms, in Hebrew. Gloss a term once, in three or four
words, and never again. Illustrate instead of explaining: a drawn thing needs no
paragraph under it.

**Never write about what the page is not doing.** No "chapter 14 stops here",
no "this is not yet where you would point", no "the next chapter will…". The
reader is on this page; tell them what is on it.

Anything not the Rambam's own carries a short label — `not his` — and a figure.
Not a paragraph.

Cut every sentence that survives its own deletion.

## 7. One halacha per page

A page that needs an earlier result links the page that derives it. One line.

## 8. A circle shows how far it has come

Any circle a body travels is drawn once, in one colour: **light for the whole
round, dark for the part already swept**, with a small arrowhead at the leading
end. Never a second circle, and never a separate dashed arc inside — the angle
is read off the circle itself. This holds for every galgal on every page, the
small ones as much as the large.

And every such circle can be **taken hold of and turned**. What the reader is
really moving is the day count, so the other galgalim come round with it at
their own rates — which is the thing to feel. Let go and it settles on a whole
day, because he counts whole days.

## 9. Every chart gets the same transport

Step by day, and **watch one day / one month / one year**. Same control, same
place, every page.

---

Build with `npm run build`, check with `npm test`, and `LIVE=1 npm test` before
shipping anything that touches the engine.
