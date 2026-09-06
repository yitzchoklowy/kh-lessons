# Vendored engine

These files are copied **verbatim** from the Kiddush HaChodesh project's live
engine at <https://shluchimexchange.ai/kh/engine/>, MIT licensed, source at
<https://github.com/rayistern/kidushhachodesh>.

Do not edit them. They are the authority for every number this repo displays.
`tools/bundle-engine.mjs` concatenates them into one classic script and swaps
`epochDays.js` — the only file with an npm dependency (`hebcal`) — for a small
shim, because the day count it provides is a plain integer civil-day difference
from 1178-03-30.

To refresh from upstream:

    curl -s https://www.shluchimexchange.ai/kh/engine/index.json
    # then re-download each listed file into this directory

and run `LIVE=1 npm test`, which checks the bundle still agrees with the live
`/api/calculate` step for step.

`fc-*.js` are the fixed-calendar (KH 6–10) modules. They still need hebcal, so
nothing in this repo uses them yet; they are kept for reference.
