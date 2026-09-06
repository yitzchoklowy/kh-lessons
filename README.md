# Kiddush HaChodesh — lessons

Interactive pages for the Rambam's lunar calculation, **one halacha at a time**.
Every number on every page is computed in the browser by the project's own
engine — nothing is fetched at runtime, so a built page works offline.

    npm run dev        # build, then serve on http://localhost:8123
    npm run build      # write dist/
    npm test           # the arithmetic checks
    LIVE=1 npm test    # also check the vendored engine against the live API

## The pages

| page | halacha | what it does |
|---|---|---|
| `kh14-means.html` | KH 14:1–4 | Two circles turning; the two means, with a running-total ledger of every degree added and every whole circle thrown away. |
| `kh14-sun.html` | KH 14:5–6 | The nine seasonal bands drawn as a ring of the year, with the sunset clock that explains why they are what they are. |
| `galgalim.html` | KH 14–16 | The four galgalim, built up one chapter at a time. |
| `calculator.html` | KH 11–17 | All 26 astronomical steps for ליל ל׳ of any month. |

## How it fits together

```
src/engine/     the project's engine, vendored verbatim (MIT) — never edit
src/lib/        pipeline-local.js  the 26-step chain, minus the hebcal-bound fixed calendar
                working.js         turns each step's inputs into a worked ledger
src/partials/   zodiac.js          mazal names, symbols, constellation line figures
                bodies.svg         the earth, sun and moon glyphs
src/pages/      one HTML file per lesson, with placeholders:
                  <!--ENGINE-->                  engine + pipeline
                  <!--WORKING-->                 the ledger
                  <!--@include partials/x-->     any shared partial
build.mjs       inlines all of it into dist/<page>.html + an index
```

Add a lesson by dropping an HTML file into `src/pages/`; the build picks it up
and lists it if you add a row to the `pages` array in `build.mjs`.

## The rules this repo keeps

- **The engine is the authority.** Every ledger recomputes its own total and
  refuses to render if it disagrees with the engine, rather than showing a
  number the engine would not stand behind.
- **Nothing invented.** Where a page shows something the Rambam does not
  compute — the sunset curve on the KH 14:5 page, the sight line on the KH 14:1
  page — it says so on the page, with the size of the divergence.
- **One halacha per page.** Anything that needs an earlier chapter (the sun, in
  KH 14:5) says where it came from.
- **Every chart gets the same transport:** step by day, and *watch one day /
  one month / one year*.

## Provenance

The calculation engine is by the Kiddush HaChodesh project —
<https://github.com/rayistern/kidushhachodesh>, MIT, live at
<https://shluchimexchange.ai/kh>. It is vendored under `src/engine/`; see the
README there for how to refresh it.

Teaching content (the colour scheme for the galgalim, the naming, the 24° 23′
against 11° 12′) comes from Rabbi Zajac's classes on KH 14–16, hosted with
permission. **Credit Rabbi Zajac and link [Chabad.org](https://www.chabad.org)
when quoting from them.** Chapter quotations are the Rambam via Sefaria.

MIT.
