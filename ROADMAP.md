# Roadmap — KH 6 to 19, one page per concept

Chapters 1–5 (the court, the witnesses, the procedure) are out of scope.
What follows is one page per *thing the Rambam does*, not per numbered halacha.
Each page names the halachos it covers and follows [CLAUDE.md](CLAUDE.md).

**Done: 23 of 52.** Table lessons are now generated from a spec in `src/lessons/`
through `src/shell.html` + `src/lib/lesson.js`, so a page is a description of
which halachos, which table and which drill — not a bespoke file.

Legend: `▸` ready to build now · `⚙` needs engine work first · `✎` needs a table
the engine does not carry.

## The fixed calendar — KH 6–10 ⚙

These need the fixed-calendar arithmetic — pure integer work on days, hours and
chalakim. `hebcal` is now a dev dependency and `test/epoch-shim.test.mjs` checks
against it, so this is not blocked on a package; it is blocked on *writing* the
arithmetic. And it should be written rather than imported: for these chapters the
arithmetic **is** the lesson, so calling `HDate` would be importing the answer.
Write it, and pin it to hebcal in the tests.

| # | page | halachos |
|---|---|---|
| 1 | The chelek, and the mean molad interval — 29d 12h 793p | 6:1–3 |
| 2 | Stepping the molad: 1-12-793, and how remainders are added | 6:4–9 |
| 3 | BaHaRaD — where the count starts | 6:8 |
| 4 | The nineteen-year machzor and its seven leap years | 6:10–13 |
| 5 | Any molad, from the cycle | 6:14–15 |
| 6 | לא אד״ו ראש | 7:1 |
| 7 | מולד זקן — the conjunction after noon | 7:2–3 |
| 8 | ג״ט ר״ד and בט״ו תקפ״ט | 7:4–6 |
| 9 | Why the dehiyot exist: mean against true | 7:7–8 |
| 10 | Why months alternate full and lacking | 8:1–4 |
| 11 | The fixed order of the months; Marcheshvan and Kislev | 8:5–6 |
| 12 | The three year-types: חסרה, כסדרה, שלמה | 8:7–10 |
| 13 | Shmuel's year, and the tekufah interval | 9:1–3 |
| 14 | Finding a tekufah from the cycle | 9:4–8 |
| 15 | Rav Adda's year — 91-7-519-31 | 10:1–5 |
| 16 | Which reckoning was used, and that both are approximations | 10:6–7 |

## The frame — KH 11 ▸

| # | page | halachos |
|---|---|---|
| 17 | Why the true reckoning, and where the count starts | 11:1–4, 11:16 |
| 18 | The circle of mazalos: 360°, and the ordinal degree | 11:7–9 |
| 19 | Reading a position off the circle | 11:10–15 |

## The sun — KH 12–13 ▸

| # | page | halachos | chart | status |
|---|---|---|---|---|
| 20 | The sun's mean motion, and its blocks | 12:1 | `SUN_MEAN_PERIOD_BLOCKS` | **done** |
| 21 | The govah, and how slowly it drifts | 12:2 | `SUN_APOGEE_PERIOD_BLOCKS` | **done** |
| 22 | The maslul — distance from the govah | 13:1–3 | — |
| 23 | The correction table, and interpolating inside it | 13:4, 13:7–8 | `SUN_MASLUL_CORRECTIONS` |
| 24 | Add or take off: אמצעי → אמיתי | 13:2, 13:5–6 | — |
| 25 | His worked example | 13:9–11 | — |

## The moon — KH 14–16

| # | page | halachos | chart | status |
|---|---|---|---|---|
| 26 | The two means | 14:1–4 | two block tables | **done** |
| 27 | The sun's nudge | 14:5–6 | the nine bands | **done** |
| 28 | מרחק כפול — the double distance | 15:1–2 | — | **done** |
| 29 | The adjustment, and המסלול הנכון | 15:3 | `DOUBLE_ELONGATION_ADJUSTMENTS` | **done** |
| 30 | The moon's correction table, and מקום הירח האמיתי | 15:4–7 | `MOON_MASLUL_CORRECTIONS` | **done** |
| 31 | His worked example | 15:8–9 | — | **done** |
| 32 | The tilted path: ראש and זנב | 16:1 | — | **done** |
| 33 | The rosh's motion, and 360 − the mean | 16:2–5 | `NODE_PERIOD_BLOCKS` | **done** |
| 34 | The zanav opposite, and which side | 16:6–8 | — | **done** |
| 35 | רוחב הירח, and the מסלול it is read from | 16:9–10 | — | **done** |
| 36 | The latitude table, and the part for the אחדים | 16:11–12 | `MOON_LATITUDE_TABLE` | **done** |
| 37 | Bringing a larger מסלול inside the ninety | 16:13–18 | — | **done**  **done** |
| 38 | His worked example | 16:19 | — | **done**  **done** |
Chapter 16 came out seven pages rather than five: ט״ז:ט–י defines the width
and ט״ז:י״א–י״ב gives the table it is read from, and the folding of
ט״ז:י״ג–י״ח is a halacha of its own with three worked examples in it.

## Can it be seen — KH 17

| # | page | halachos | chart | status |
|---|---|---|---|---|
| 39 | אורך ראשון, and the two early exits | 17:1–4 | `EARLY_EXIT_THRESHOLDS` | **done** |
| 40 | You are on the surface: parallax in longitude | 17:5–6 | `PARALLAX_LON_BY_MAZAL` | **done** |
| 41 | The same, sideways | 17:7–9 | `PARALLAX_LAT_BY_MAZAL` | **done** |
| 42 | מעגל הירח | 17:10–11 | `MOON_CIRCLE_FRACTIONS` | **done** |
| 43 | ארוכי וקצרי שקיעה, מנת גובה המדינה, קשת הראיה | 17:12 | `SETTING_TIME_BY_MAZAL` | **done** |
| 44 | His worked example — the arc | 17:13–14 | — | **done** |
| 45 | קיצי הראיה | 17:15–21 | `KITZEI_HAREIYAH_TABLE` | **done** |
| 46 | His worked example — the verdict, and his closing | 17:22–24 | — | **done** |

Rows 43 and 44 fell out one against the plan: 17:12 is a single halacha holding
two doings, and splitting a halacha across two pages breaks §7 the other way,
so the setting-time correction and מנת גובה המדינה share the page that reaches
the קשת. The worked example got the page that freed up.

## The court and the calculation — KH 18 ▸

| # | page | halachos |
|---|---|---|
| 47 | Why a sighting is never certain: season, thickness, latitude | 18:1–4 |
| 48 | Why a month is never left without a sighting | 18:5–11 |
| 49 | East and west — who else could have seen it | 18:12–16 |

## Checking the witnesses — KH 19 ▸ ✎

| # | page | halachos | chart |
|---|---|---|---|
| 50 | The equator against the mazalos | 19:1–6 | — |
| 51 | The inclination table | 19:7–9 | ✎ **not in the engine** — needs adding |
| 52 | Which way the crescent points, and how high | 19:10–16 | — |

## Order of work

1. **KH 11 → 13**, then **15 → 17**: the engine already carries every table, so
   these can be built to the standard chapter 14 now sets.
2. **KH 18 → 19**: mostly reasoning; 19 needs its inclination table added to the
   engine surface first.
3. **KH 6 → 10**: last, because they need the fixed-calendar arithmetic written
   and checked before a single page can be honest about a number.
