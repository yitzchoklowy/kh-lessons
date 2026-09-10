/* Chapter 19, pinned to the Mishneh Torah as alhatorah prints it.
   Text pulled 2026-09-10 from
   https://dbserver.alhatorah.org/read/mg/v1/json/Rambam/Zemanim/Kiddush HaChodesh/19

   His one table lives in src/lib/kh19-local.js, because the vendored engine
   stops where the sighting stops and chapter 19 is past it. Everything below
   checks that file against his printed words, and against the three sums he
   works himself. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundleEngine } from '../tools/bundle-engine.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const K = new Function(
  bundleEngine(path.join(root, 'src/engine'))
  + '\n' + read('src/lib/kh19-local.js')
  + '\n' + read('src/partials/kh15.js')
  + '\n' + read('src/partials/kh19.js')
  + '\nreturn { KH19, calculateInclination, calculateEquatorDistance, chapter19At, chapter19Live,'
  + ' inclinationRows, bearingOf, CONSTANTS, normalizeDegrees, zodiacPosition };')();

const { KH19: T, CONSTANTS: C } = K;
const near = (got, want, tol, what) =>
  assert.ok(Math.abs(got - want) <= tol, `${what}: ${got} against his ${want}`);

test('KH 19:7 — his nine inclinations, as printed', () => {
  const printed = [[10, 4], [20, 8], [30, 11.5], [40, 15], [50, 18],
                   [60, 20], [70, 22], [80, 23], [90, 23.5]];
  const his = K.inclinationRows();
  assert.equal(his.length, 9, 'ten degrees to ninety, by tens');
  printed.forEach(([degrees, inclination], i) => {
    assert.equal(his[i].degrees, degrees, `row ${i}`);
    assert.equal(his[i].inclination, inclination, `${degrees}°`);
  });
  // "ורוב הנטייה לא תהיה יתר על שלש ועשרים מעלות וחצי בקירוב" — י״ט:ד, י״ט:ו
  assert.equal(his[his.length - 1].inclination, 23.5, 'and no further than that');
  for (let i = 1; i < his.length; i++) {
    assert.ok(his[i].inclination > his[i - 1].inclination, `not growing at ${his[i].degrees}°`);
  }
});

test('KH 19:8 — his own two, taken between the rows', () => {
  // "כיצד, חמש מעלות, נטייתם שתי מעלות"
  near(K.calculateInclination(5).result, 2, 1e-9, 'חמש מעלות');
  // "ואם היה מנין המעלות שלש ועשרים, נטייתם תשע מעלות" — he rounds to the degree
  near(Math.round(K.calculateInclination(23).result), 9, 0, 'שלש ועשרים');
});

test('KH 19:3, 19:9 — the two crossings, and every degree brought inside ninety', () => {
  // "הנקודה האחת ראש מזל טלה, והנקודה השניה שכנגדה ראש מזל מאזנים"
  assert.deepEqual(T.CROSSINGS, [0, 180]);
  for (const lon of T.CROSSINGS) {
    assert.equal(K.calculateInclination(lon).result, 0, `${lon}° stands on the line`);
  }
  // "ונמצאו שישה מזלות נוטות לצפון... ושישה נוטות לדרום"
  for (let lon = 1; lon < 180; lon += 7) {
    assert.equal(K.calculateInclination(lon).direction, 'north', `${lon}°`);
  }
  for (let lon = 181; lon < 360; lon += 7) {
    assert.equal(K.calculateInclination(lon).direction, 'south', `${lon}°`);
  }
  // his three foldings of י״ט:ט, which are the foldings of רוחב הירח again
  for (const [lon, mirror] of [[150, 30], [200, 20], [300, 60]]) {
    near(K.calculateInclination(lon).result, K.calculateInclination(mirror).result, 1e-9,
      `${lon}° folded to ${mirror}°`);
  }
  // ראש סרטן and ראש גדי, the two furthest — י״ט:ד
  near(K.calculateInclination(90).result, 23.5, 1e-9, 'ראש סרטן');
  near(K.calculateInclination(270).result, 23.5, 1e-9, 'ראש גדי');
  assert.equal(K.calculateInclination(270).direction, 'south', 'ראש גדי, to the south');
});

test('KH 19:10 — gathered when one way, taken one from the other when two', () => {
  // both north: gathered
  let d = K.calculateEquatorDistance(18, true, 4, true);
  assert.equal(d.result, 22);
  assert.equal(d.direction, 'north');
  // two ways: the smaller from the greater, and it lies to the side of the greater
  d = K.calculateEquatorDistance(18, true, 4, false);
  assert.equal(d.result, 14);
  assert.equal(d.direction, 'north');
  d = K.calculateEquatorDistance(4, true, 18, false);
  assert.equal(d.result, 14);
  assert.equal(d.direction, 'south');
});

test('KH 19:11 — his own night, 2 Iyar', () => {
  const v = K.chapter19At(29);
  // "שמעלת הירח היתה תשע עשרה ממזל שור"
  assert.equal(v.mazal.hebrew, 'שור');
  assert.equal(v.mazal.ordinalDegree, 19, 'תשע עשרה ממזל שור');
  // "נטייתה בצפון כמו שמונה עשרה מעלות"
  assert.equal(v.inclDeg, 18, 'נטיית המעלה');
  assert.equal(v.inclNorth, true, 'בצפון');
  // "ורוחב הירח היה בדרום כמו ארבע מעלות"
  assert.equal(v.rochavDeg, 4, 'רוחב הירח');
  assert.equal(v.rochavNorth, false, 'בדרום');
  // "תגרע המעט מן הרב, יישאר ארבע עשרה מעלות... לרוח צפון"
  assert.equal(v.distDeg, 14, 'מרחק הירח מעל הקו השוה');
  assert.equal(v.distNorth, true, 'לרוח צפון');
});

test('KH 19:12–14 — which way it is seen, by his three cases', () => {
  assert.equal(K.bearingOf(0, true).id, 'even');
  assert.equal(K.bearingOf(2, true).id, 'even', 'קרוב ממנו בשתים שלש מעלות');
  assert.equal(K.bearingOf(3, false).id, 'even');
  assert.equal(K.bearingOf(14, true).id, 'north');
  assert.equal(K.bearingOf(14, false).id, 'south');
  // the notch turns the other way from the side it leans to — י״ג, י״ד
  assert.equal(K.bearingOf(14, true).notch, 'south');
  assert.equal(K.bearingOf(14, false).notch, 'north');
  assert.equal(K.bearingOf(1, true).notch, 'east');
});

test('the moon can be moved between his nights, and the engine still stands behind it', () => {
  // on a whole day the moment is the day's own figure
  for (const d of [29, 300000]) {
    const whole = K.chapter19At(d), live = K.chapter19Live(d);
    assert.equal(live.amiti, whole.amiti, `day ${d}`);
    assert.equal(live.inclDeg, whole.inclDeg, `day ${d} נטייה`);
    assert.equal(live.distDeg, whole.distDeg, `day ${d} מרחק`);
  }
  // between them the moon goes the short way round, a little at a time
  let prev = K.chapter19Live(300000);
  for (let f = 0.05; f <= 1.0001; f += 0.05) {
    const live = K.chapter19Live(300000 + f);
    const step = Math.abs(((live.amiti - prev.amiti + 540) % 360) - 180);
    assert.ok(step < 2, `the moon jumped ${step}° in a twentieth of a day`);
    // and its lean is his table's, for the degree it is in at that moment
    near(live.incl, K.calculateInclination(live.amiti).result, 1e-9, `lean at ${f.toFixed(2)}`);
    assert.ok(live.incl <= 23.5 + 1e-9, 'never past three and twenty and a half');
    prev = live;
  }
});

test('no chapter-19 page or partial types a figure of his into itself', () => {
  const files = ['src/partials/kh19.js', 'src/pages/kh19-1.html', 'src/pages/kh19-7.html',
                 'src/pages/kh19-10.html', 'src/pages/kh19-12.html'];
  for (const f of files) {
    const src = read(f);
    // his own quoted worked figures are declared in a HIS block and set beside
    // the engine's; a typed degree figure in the drawing is the bug
    assert.ok(!/\d+°\s*\d+[′']/.test(src), `${f} contains a typed DMS value`);
  }
});
