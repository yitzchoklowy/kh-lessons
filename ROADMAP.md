# Roadmap — KH 6 to 19, one page per concept

Chapters 1–5 (the court, the witnesses, the procedure) are out of scope.
What follows is one page per *thing the Rambam does*, not per numbered halacha.
Each page names the halachos it covers and follows [CLAUDE.md](CLAUDE.md).

**Done: 4 of 50.** Table lessons are now generated from a spec in `src/lessons/`
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
| 28 | מרחק כפול — the double distance | 15:1–2 | — | ▸ |
| 29 | The adjustment, and המסלול הנכון | 15:3 | `DOUBLE_ELONGATION_ADJUSTMENTS` | ▸ |
| 30 | The moon's correction table | 15:4–6 | `MOON_MASLUL_CORRECTIONS` | ▸ |
| 31 | His worked example | 15:7–9 | — | ▸ |
| 32 | The tilted path: ראש and זנב | 16:1 | — | ▸ |
| 33 | The rosh's motion, and 360 − the mean | 16:2–5 | `NODE_PERIOD_BLOCKS` | ▸ |
| 34 | The zanav opposite, and distance from the rosh | 16:6–8 | — | ▸ |
| 35 | The latitude table | 16:9–11 | `MOON_LATITUDE_TABLE` | ▸ |
| 36 | His worked example | 16:12–19 | — | ▸ |

## Can it be seen — KH 17 ▸

| # | page | halachos | chart |
|---|---|---|---|
| 37 | אורך ראשון, and the two early exits | 17:1–4 | `EARLY_EXIT_THRESHOLDS` |
| 38 | You are on the surface: parallax in longitude | 17:5–6 | `PARALLAX_LON_BY_MAZAL` |
| 39 | The same, sideways | 17:7–9 | `PARALLAX_LAT_BY_MAZAL` |
| 40 | מעגל הירח | 17:10–11 | `MOON_CIRCLE_FRACTIONS` |
| 41 | How steeply the mazal sets | 17:12 | `SETTING_TIME_BY_MAZAL` |
| 42 | מנת גובה המדינה | 17:12–14 | — |
| 43 | קשת הראיה, and קיצי הראיה | 17:15–21 | `KITZEI_HAREIYAH_TABLE` |
| 44 | His worked example, 2 Iyar | 17:22–24 | — |

## The court and the calculation — KH 18 ▸

| # | page | halachos |
|---|---|---|
| 45 | Why a sighting is never certain: season, thickness, latitude | 18:1–4 |
| 46 | Why a month is never left without a sighting | 18:5–11 |
| 47 | East and west — who else could have seen it | 18:12–16 |

## Checking the witnesses — KH 19 ▸ ✎

| # | page | halachos | chart |
|---|---|---|---|
| 48 | The equator against the mazalos | 19:1–6 | — |
| 49 | The inclination table | 19:7–9 | ✎ **not in the engine** — needs adding |
| 50 | Which way the crescent points, and how high | 19:10–16 | — |

## Order of work

1. **KH 11 → 13**, then **15 → 17**: the engine already carries every table, so
   these can be built to the standard chapter 14 now sets.
2. **KH 18 → 19**: mostly reasoning; 19 needs its inclination table added to the
   engine surface first.
3. **KH 6 → 10**: last, because they need the fixed-calendar arithmetic written
   and checked before a single page can be honest about a number.
