# Roadmap — KH 6 to 19, one page per concept

Chapters 1–5 (the court, the witnesses, the procedure) are out of scope.
What follows is one page per *thing the Rambam does*, not per numbered halacha.
Each page names the halachos it covers and follows [CLAUDE.md](CLAUDE.md).

**Done: 28 of 56.** Table lessons are now generated from a spec in `src/lessons/`
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

| # | page | halachos | status |
|---|---|---|---|
| 17 | Why the true reckoning at all, and where he allows himself a near-enough | 11:1–6 | |
| 18 | חלוקת הגלגל — 360°, twelve of thirty, and which degree of the mazal | 11:7–9 | **done** |
| 19 | דרכי חישוב — gathering each kind with its kind, and the borrow that needs a whole round | 11:10–12 | |
| 20 | כללי מהלכי הכוכבים — אמצע המהלך against המהלך האמיתי | 11:13–15 | |
| 21 | שנת העיקר — the night the count opens from | 11:16 | |
| 22 | ירושלים — the place every one of these calculations is built on | 11:17 | |

Chapter 11 comes out six pages rather than three. The headings are his own
divisions: עיקרי החשבונות (ז–ט), דרכי חישוב (י–יב), כללי מהלכי הכוכבים (יג–טו), and
כללי חשבונותיו (טז) — and יז, which the old plan dropped, is the one halacha the
whole of chapter 17 leans on.

## The sun — KH 12–13 ▸

| # | page | halachos | chart | status |
|---|---|---|---|---|
| 23 | The sun's mean motion, and its blocks | 12:1 | `SUN_MEAN_PERIOD_BLOCKS` | **done** |
| 24 | The govah, and how slowly it drifts | 12:2 | `SUN_APOGEE_PERIOD_BLOCKS` | **done** |
| 25 | The maslul — distance from the govah | 13:1–3 | — |
| 26 | The correction table, and interpolating inside it | 13:4, 13:7–8 | `SUN_MASLUL_CORRECTIONS` |
| 27 | Add or take off: אמצעי → אמיתי | 13:2, 13:5–6 | — |
| 28 | His worked example | 13:9–11 | — |

## The moon — KH 14–16

| # | page | halachos | chart | status |
|---|---|---|---|---|
| 29 | The two means | 14:1–4 | two block tables | **done** |
| 30 | The sun's nudge | 14:5–6 | the nine bands | **done** |
| 31 | מרחק כפול — the double distance | 15:1–2 | — | **done** |
| 32 | The adjustment, and המסלול הנכון | 15:3 | `DOUBLE_ELONGATION_ADJUSTMENTS` | **done** |
| 33 | The moon's correction table, and מקום הירח האמיתי | 15:4–7 | `MOON_MASLUL_CORRECTIONS` | **done** |
| 34 | His worked example | 15:8–9 | — | **done** |
| 35 | The tilted path: ראש and זנב | 16:1 | — | **done** |
| 36 | The rosh's motion, and 360 − the mean | 16:2–5 | `NODE_PERIOD_BLOCKS` | **done** |
| 37 | The zanav opposite, and which side | 16:6–8 | — | **done** |
| 38 | רוחב הירח, and the מסלול it is read from | 16:9–10 | — | **done** |
| 39 | The latitude table, and the part for the אחדים | 16:11–12 | `MOON_LATITUDE_TABLE` | **done** |
| 40 | Bringing a larger מסלול inside the ninety | 16:13–18 | — | **done**  **done** |
| 41 | His worked example | 16:19 | — | **done**  **done** |
Chapter 16 came out seven pages rather than five: ט״ז:ט–י defines the width
and ט״ז:י״א–י״ב gives the table it is read from, and the folding of
ט״ז:י״ג–י״ח is a halacha of its own with three worked examples in it.

## Can it be seen — KH 17

| # | page | halachos | chart | status |
|---|---|---|---|---|
| 42 | אורך ראשון, and the two early exits | 17:1–4 | `EARLY_EXIT_THRESHOLDS` | **done** |
| 43 | You are on the surface: parallax in longitude | 17:5–6 | `PARALLAX_LON_BY_MAZAL` | **done** |
| 44 | The same, sideways | 17:7–9 | `PARALLAX_LAT_BY_MAZAL` | **done** |
| 45 | מעגל הירח | 17:10–11 | `MOON_CIRCLE_FRACTIONS` | **done** |
| 46 | ארוכי וקצרי שקיעה, מנת גובה המדינה, קשת הראיה | 17:12 | `SETTING_TIME_BY_MAZAL` | **done** |
| 47 | His worked example — the arc | 17:13–14 | — | **done** |
| 48 | קיצי הראיה | 17:15–21 | `KITZEI_HAREIYAH_TABLE` | **done** |
| 49 | His worked example — the verdict, and his closing | 17:22–24 | — | **done** |

Rows 46 and 47 fell out one against the plan: 17:12 is a single halacha holding
two doings, and splitting a halacha across two pages breaks §7 the other way,
so the setting-time correction and מנת גובה המדינה share the page that reaches
the קשת. The worked example got the page that freed up.

## The court and the calculation — KH 18 ▸

| # | page | halachos |
|---|---|---|
| 50 | Why a sighting is never certain: season, thickness, latitude | 18:1–4 |
| 51 | Why a month is never left without a sighting | 18:5–11 |
| 52 | East and west — who else could have seen it | 18:12–16 |

## Checking the witnesses — KH 19

| # | page | halachos | chart | status |
|---|---|---|---|---|
| 53 | The equator against the mazalos | 19:1–6 | — | **done** |
| 54 | The inclination table | 19:7–9 | `KH19.INCLINATION_TABLE` | **done** |
| 55 | The moon's distance from the line | 19:10–11 | — | **done** |
| 56 | Which way it is seen, and how high | 19:12–16 | — | **done** |

The inclination table is not in the vendored engine — upstream stops where the
sighting stops, and chapter 19 is past it. It lives in `src/lib/kh19-local.js`,
bundled with the engine the way `pipeline-local.js` is, and
`test/kh19.test.mjs` pins every row of it and all three of his worked sums.

## Order of work

1. **KH 11 → 13**, then **15 → 17**: the engine already carries every table, so
   these can be built to the standard chapter 14 now sets.
2. **KH 18**: mostly reasoning. (KH 19 is built; its table is in
   `src/lib/kh19-local.js`.)
3. **KH 6 → 10**: last, because they need the fixed-calendar arithmetic written
   and checked before a single page can be honest about a number.
