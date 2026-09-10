/* KH 19 — the one table this repo holds itself.
 *
 * The vendored engine reckons the sighting: it stops where chapter 17 stops.
 * Chapter 19 is not part of that reckoning — he says so himself, "ואין אני
 * מדקדק בו, לפי שאינו מועיל בראייה כלל" — so upstream carries nothing for it,
 * and his table of נטיית המזלות (י״ט:ז) has nowhere else to live.
 *
 * It lives here rather than in src/engine, because src/engine is copied
 * verbatim from upstream and must stay that way. This file is bundled with it
 * — the same way src/lib/pipeline-local.js is — so a page reads these figures
 * at render time and never types one. test/kh19.test.mjs pins every row of it
 * against the words of the Mishneh Torah, and pins his three worked examples.
 */
var KH19 = {
  /* [R] י״ט:ז — "ואלו הן השיעורין של נטייות לפי מניין המעלות של מזלות,
     וההתחלה מתחילת מזל טלה". Nine rows, ten degrees to ninety. The nought row
     is not his: ראש טלה sits on the line, which is י״ט:ג and י״ט:ה, and the
     table is entered from it. */
  INCLINATION_TABLE: [
    { degrees: 0,  inclination: 0,    source: 'implied' },   // ראש טלה, על הקו השוה
    { degrees: 10, inclination: 4 },                         // ארבע מעלות
    { degrees: 20, inclination: 8 },                         // שמונה מעלות
    { degrees: 30, inclination: 11.5 },                      // אחת עשרה מעלות ומחצה
    { degrees: 40, inclination: 15 },                        // חמש עשרה מעלות
    { degrees: 50, inclination: 18 },                        // שמונה עשרה מעלות
    { degrees: 60, inclination: 20 },                        // עשרים מעלות
    { degrees: 70, inclination: 22 },                        // שתים ועשרים מעלות
    { degrees: 80, inclination: 23 },                        // שלש ועשרים מעלות
    { degrees: 90, inclination: 23.5 },                      // שלש ועשרים מעלות וחצי מעלה
  ],

  /* [R] י״ט:ג — the two places where his two circles meet: ראש טלה and, over
     against it, ראש מאזנים. Six mazalos lean north of the line and six south. */
  CROSSINGS: [0, 180],
};

/* [R] י״ט:ז–ט — the נטייה of any degree of the mazalos.
   Brought inside the ninety by his own three rules of י״ט:ט, which are the
   rules of רוחב הירח over again — "כדרך שהודענוך ברוחב הירח" — and read off
   the table with the part taken for the אחדים, י״ט:ח. North from ראש טלה to
   the end of בתולה, south from ראש מאזנים to the end of דגים, י״ט:ג. */
function calculateInclination(lon) {
  var x = normalizeDegrees(lon);
  var quarter = Math.min(3, Math.floor(x / 90));
  var eff = quarter === 0 ? x : quarter === 1 ? 180 - x : quarter === 2 ? x - 180 : 360 - x;

  var T = KH19.INCLINATION_TABLE, lo = 0, hi = 1;
  for (var i = 0; i < T.length - 1; i++) {
    if (eff >= T[i].degrees && eff <= T[i + 1].degrees) { lo = i; hi = i + 1; break; }
  }
  var span = T[hi].degrees - T[lo].degrees;
  var part = span ? (eff - T[lo].degrees) / span : 0;
  var value = T[lo].inclination + part * (T[hi].inclination - T[lo].inclination);
  var north = x < 180;

  return {
    id: 'inclination',
    regime: 'astronomical',
    name: 'Inclination of the degree',
    hebrewName: 'נטיית המעלה',
    rambamRef: 'KH 19:7-9',
    source: part === 0 ? 'rambam' : 'interpolated',
    sourceNote: 'His table of KH 19:7, entered by the rules of KH 19:9 and with the '
      + 'part taken between two rows as KH 19:8 directs.',
    inputs: {
      lon: { value: x, label: 'מעלת המזלות', unit: '°' },
      quarter: { value: quarter, label: 'רביע הגלגל' },
      eff: { value: eff, label: 'המנין שבידך', unit: '°' },
      lo: { value: T[lo].degrees, label: 'מכאן', unit: '°' },
      hi: { value: T[hi].degrees, label: 'עד כאן', unit: '°' },
    },
    formula: 'inclination table lookup(fold to 0-90) with the part for the units',
    result: value,
    direction: north ? 'north' : 'south',
    hebrewDirection: north ? 'צפון' : 'דרום',
    formatted: formatDms(value),
    unit: 'degrees',
  };
}

/* [R] י״ט:י — how far the moon stands from the line: its degree's נטייה and its
   own רוחב, gathered when both are one way and taken one from the other when
   they are not, and the answer lies to the side of the greater of them. */
function calculateEquatorDistance(inclination, inclNorth, rochav, rochavNorth) {
  var same = inclNorth === rochavNorth;
  var a = Math.abs(inclination), b = Math.abs(rochav);
  var value = same ? a + b : Math.abs(a - b);
  var north = same ? inclNorth : (a >= b ? inclNorth : rochavNorth);
  return {
    id: 'equatorDistance',
    regime: 'astronomical',
    name: 'Distance from the equator',
    hebrewName: 'מרחק הירח מעל הקו השוה',
    rambamRef: 'KH 19:10',
    source: 'rambam',
    sourceNote: 'Both one way — gathered; the two ways — the smaller from the greater, '
      + 'and the remainder lies to the side of the greater. KH 19:10.',
    inputs: {
      inclination: { value: a, label: 'נטיית המעלה', unit: '°' },
      inclNorth: { value: inclNorth, label: 'ולאי זו רוח' },
      rochav: { value: b, label: 'רוחב הירח', unit: '°' },
      rochavNorth: { value: rochavNorth, label: 'ולאי זו רוח' },
      same: { value: same, label: 'ברוח אחת' },
    },
    formula: same ? 'inclination + rochav' : '|inclination − rochav|',
    result: value,
    direction: north ? 'north' : 'south',
    hebrewDirection: north ? 'צפון' : 'דרום',
    formatted: formatDms(value),
    unit: 'degrees',
  };
}
