/* Chapter 16, pinned to the Mishneh Torah as alhatorah prints it.
   Text pulled 2026-09-07 from
   https://dbserver.alhatorah.org/read/mg/v1/json/Rambam/Zemanim/Kiddush HaChodesh/16
   (mirrored locally at I:\PDF Library\_managed\alhatorah). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundleEngine } from '../tools/bundle-engine.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

/* The chapter-15 and chapter-16 partials, loaded the way a page loads them:
   one classic script scope over the engine bundle. Everything they do to the
   page's drawing is inside functions this file never calls. */
const K = new Function(
  bundleEngine(path.join(root, 'src/engine'))
  + '\n' + read('src/partials/kh15.js')
  + '\n' + read('src/partials/kh16.js')
  + '\nreturn { chapter15At, chapter16At, tiltAt, foldMaslul, rochavBracket, hisLatRows, waveRows,'
  + ' FOLD_RULES, CONSTANTS, formatDms, normalizeDegrees, dmsToDecimal, zodiacPosition,'
  + ' calculateNodePosition, calculateMoonLatitude, epochRoshLon, roshRoundDays, dayForRosh };')();

const { CONSTANTS: C, formatDms: F, dmsToDecimal: D } = K;
const dms = (d, m = 0, s = 0) => d + m / 60 + s / 3600;
const same = (got, want, what) =>
  assert.ok(Math.abs(got - want) < 1e-9, `${what}: engine ${F(got)} vs printed ${F(want)}`);
const near = (got, want, tol, what) =>
  assert.ok(Math.abs(got - want) <= tol, `${what}: ${F(got)} against his ${F(want)}`);

test('KH 16:2 — the rosh\'s motion, as printed', () => {
  same(D(C.NODE.DAILY_MOTION), dms(0, 3, 11), 'one day');
  same(D(C.NODE_PERIOD_BLOCKS.p10), dms(0, 31, 47), 'ten days');
  same(D(C.NODE_PERIOD_BLOCKS.p100), dms(5, 17, 43), 'a hundred days · הי״ז מ״ג');
  same(D(C.NODE_PERIOD_BLOCKS.p1000), dms(52, 57, 10), 'a thousand days · נ״ב נז״י');
  same(D(C.NODE_PERIOD_BLOCKS.p10000), dms(169, 31, 40), 'ten thousand days · קס״ט לא״מ');
  same(D(C.NODE_PERIOD_BLOCKS.p29), dms(1, 32, 9), 'twenty-nine days · אלב״ט');
  same(D(C.NODE_PERIOD_BLOCKS.p354), dms(18, 44, 42), 'a regular year · י״ח מ״ד מ״ב');
  same(D(C.NODE.START_POSITION), dms(180, 57, 28), 'the rosh at the epoch · ק״פ נ״ז כ״ח');
});

test('KH 16:4–5 — his own night, twenty-nine days from the עיקר', () => {
  const step = K.calculateNodePosition(29);
  const SEC = 1 / 3600;
  // his rows are rounded to the second, so his figures and the sum of the rows
  // part by a few seconds — and the page prints the gap rather than hiding it
  near(step.inputs.emtzaRosh.value, dms(182, 29, 37), 5 * SEC, 'אמצע הראש · קפ״ב כ״ט ל״ז');
  near(step.result, dms(177, 30, 23), 5 * SEC, 'מקום הראש · קע״ז לכ״ג');
  const z = K.zodiacPosition(step.result);
  assert.equal(z.hebrew, 'בתולה', 'במזל בתולה');
  assert.equal(z.ordinalDegree, 28, 'בשבע ועשרים מעלות ושלשים חלקים — the twenty-eighth degree');
});

test('KH 16:6 — the zanav is half a circle from the rosh, always', () => {
  for (const day of [0, 29, 1000, 300000]) {
    const v = K.chapter16At(day);
    same(K.normalizeDegrees(v.zanav - v.rosh), 180, `day ${day}`);
    const zr = K.zodiacPosition(v.rosh), zz = K.zodiacPosition(v.zanav);
    assert.equal(zz.index, (zr.index + 6) % 12, 'במזל שביעי ממנו');
    assert.equal(zz.ordinalDegree, zr.ordinalDegree, 'בכמו מנין המעלות בשוה');
  }
});

test('KH 16:9, 16:11 — his nine latitudes, as printed, and nothing past five', () => {
  const rows = K.hisLatRows();
  assert.equal(rows.length, 9, 'ten degrees to ninety, by tens');
  const printed = [
    [10, dms(0, 52)], [20, dms(1, 43)], [30, dms(2, 30)], [40, dms(3, 13)],
    [50, dms(3, 50)], [60, dms(4, 20)], [70, dms(4, 42)], [80, dms(4, 55)],
    [90, dms(5, 0)],
  ];
  for (const [distance, want] of printed) {
    const row = rows.find((r) => r.distance === distance);
    assert.ok(row, `no row for ${distance}°`);
    same(row.latitude, want, `${distance}°`);
  }
  // "לעולם לא יהיה רוחב הירח יתר על חמש מעלות" — and it grows the whole way there
  for (let i = 1; i < rows.length; i++) {
    assert.ok(rows[i].latitude > rows[i - 1].latitude, `not growing at ${rows[i].distance}°`);
  }
  assert.equal(rows[rows.length - 1].latitude, 5, 'five degrees at ninety, and no further');
});

test('KH 16:10 — north up to a hundred and eighty, south past it', () => {
  for (let d = 280000; d < 280400; d += 7) {
    const v = K.chapter16At(d);
    const m = K.normalizeDegrees(v.maslul);
    if (v.rochav < 1 / 3600) continue;
    assert.equal(v.north, m < 180, `מסלול ${F(m)} should be ${m < 180 ? 'צפוני' : 'דרומי'}`);
  }
});

test('KH 16:12 — his own interpolation: fifty-three degrees', () => {
  const T = C.MOON_LATITUDE_TABLE, b = K.rochavBracket(53);
  same(b.gap, dms(0, 30), 'היתר בין שתי המנות · שלשים חלקים');
  same(b.perDeg, dms(0, 3), 'שלשה חלקים לכל מעלה');
  same(T[b.lo].latitude + b.part * b.gap, dms(3, 59), 'מנת שלש וחמישים · ג׳ נ״ט');
});

test('KH 16:13–18 — his three foldings, and the מנות they reach', () => {
  const T = C.MOON_LATITUDE_TABLE;
  const his = [[150, 30, dms(2, 30)], [200, 20, dms(1, 43)], [300, 60, dms(4, 20)]];
  for (const [maslul, left, want] of his) {
    const f = K.foldMaslul(maslul);
    assert.equal(f.eff, left, `${maslul}° should leave ${left}°`);
    const row = T.find((r) => r.distance === left);
    same(row.latitude, want, `מנת ${maslul}°`);
  }
  // and the fold is the engine's own lookup angle, at every degree of the circle
  for (let m = 0; m <= 360; m += 1) {
    const eff = K.foldMaslul(m).eff;
    assert.ok(eff >= 0 && eff <= 90, `${m}° folded to ${eff}°`);
  }
});

test('KH 16:19 — his own night: the width, and which side', () => {
  const v = K.chapter16At(29);
  // his מקום הירח here is מח״מ, four minutes past the מ״ח ל״ו of KH 15:9
  near(v.rosh, dms(177, 30), 30 / 3600, 'מקום הראש · קעז״ל');
  near(v.maslul, dms(231, 10), 5 / 60, 'מסלול הרוחב · רלא״י');
  near(v.rochav, dms(3, 53), 1 / 60, 'רוחב הירח · שלש מעלות ושלשה וחמישים חלקים');
  assert.equal(v.north, false, 'והוא דרומי, שהרי המסלול יתר על מאה ושמונים');
});

test('the fold agrees with the engine, day after day', () => {
  for (let d = 300000; d < 300300; d += 3) {
    const v = K.chapter16At(d);
    same(K.foldMaslul(v.maslul).eff, v.eff, `day ${d}`);
  }
});

test('the side view is his table, not a curve fitted to it', () => {
  const T = C.MOON_LATITUDE_TABLE, pts = K.waveRows();
  assert.equal(pts.length, 37, 'every tenth degree of the circle');
  for (const p of pts) {
    const eff = K.foldMaslul(p.d).eff;
    const row = T.find((r) => Math.abs(r.distance - eff) < 1e-9);
    assert.ok(row, `${p.d}° lands off his rows`);
    same(Math.abs(p.lat), row.latitude, `${p.d}°`);
    // the ראש and the זנב are on the line itself; every other point has a side
    if (row.latitude > 0) assert.equal(p.lat < 0, p.d > 180, `${p.d}° on the wrong side`);
  }
});

test('the drawing moves between his days, and the engine still stands behind it', () => {
  // on a whole day it is the day's own figure, to the second
  for (const d of [29, 300000]) {
    const whole = K.chapter16At(d), live = K.tiltAt(d);
    same(live.maslul, whole.maslul, `day ${d} מסלול`);
    same(live.rochav, whole.rochav, `day ${d} רוחב`);
  }
  // and in between it moves the short way round, without ever jumping a circle
  let prev = K.tiltAt(300000);
  for (let f = 0.05; f <= 1.0001; f += 0.05) {
    const live = K.tiltAt(300000 + f);
    const step = Math.abs(((live.maslul - prev.maslul + 540) % 360) - 180);
    assert.ok(step < 2, `the moon jumped ${F(step)} in a twentieth of a day`);
    assert.ok(live.rochav <= 5 + 1e-9, `רוחב ran past five degrees: ${F(live.rochav)}`);
    prev = live;
  }
  // the in-between width is the engine's own, for the in-between places
  const mid = K.tiltAt(300000.5);
  const lat = K.calculateMoonLatitude(mid.amiti, mid.rosh);
  same(mid.rochav, Math.abs(lat.result), 'the width at half a day');
});

test('the two points travel, and their round comes out of his own daily motion', () => {
  // ט״ז:ג — the place at the epoch is 360 less the אמצע he gives in ט״ז:ב
  same(K.epochRoshLon(), K.normalizeDegrees(360 - D(C.NODE.START_POSITION)), 'the ראש at the עיקר');
  // and it gives ground, backwards, at his three חלקים and eleven שניות a day
  const start = K.chapter16At(0).rosh, later = K.chapter16At(100).rosh;
  near(K.normalizeDegrees(start - later), 100 * D(C.NODE.DAILY_MOTION), 1 / 60,
    'a hundred days of backing away');
  const round = K.roshRoundDays();
  assert.equal(round, Math.round(360 / D(C.NODE.DAILY_MOTION)), 'the whole round, by his own rate');
  assert.ok(round > 6700 && round < 6900, `a round of ${round} days is not eighteen and a half years`);
  // half a round later the two points have changed places
  const half = K.chapter16At(Math.round(round / 2));
  near(K.normalizeDegrees(half.rosh - K.chapter16At(0).zanav), 0, 1, 'the ראש stands where the זנב stood');
});

test('the drawing turns at his own rates, and not at some rate of its own', () => {
  /* Over a long enough run the true motions average to the mean ones he
     publishes. What is left over is his own tables' rounding — the ten- and
     hundred- and thousand-day blocks do not imply exactly the same daily rate —
     so a second of arc a day is the whole of the disagreement. */
  const N = 20000, from = 300000, step = (a, b) => ((b - a + 540) % 360) - 180;
  let rosh = 0, moon = 0, maslul = 0, sun = 0, a = K.chapter16At(from);
  for (let d = from; d < from + N; d++) {
    const b = K.chapter16At(d + 1);
    rosh += step(a.rosh, b.rosh);
    moon += step(a.amiti, b.amiti);
    maslul += step(a.maslul, b.maslul);
    sun += step(a.sunTrue, b.sunTrue);
    a = b;
  }
  const SEC = 1 / 3600;
  assert.ok(rosh < 0, 'the ראש must go backwards through the mazalos');
  near(Math.abs(rosh / N), D(C.NODE.DAILY_MOTION), SEC, 'the ראש · ט״ז:ב');
  near(moon / N, D(C.MOON.MEAN_MOTION_PER_DAY), SEC, 'the moon · י״ד:א');
  near(sun / N, D(C.SUN.MEAN_MOTION_PER_DAY), SEC, 'the sun · י״ב:א');
  // and מסלול הרוחב grows by both, since the ראש comes to meet the moon
  near(maslul / N, D(C.MOON.MEAN_MOTION_PER_DAY) + D(C.NODE.DAILY_MOTION), SEC,
    'מסלול הרוחב · י״ד:א with ט״ז:ב');
});

test('taking hold of the ראש moves the day count, at his rate', () => {
  const rate = D(C.NODE.DAILY_MOTION);
  const now = K.chapter16At(29).rosh;
  // ask it to stand thirty degrees further back: that is thirty degrees of his
  // own daily motion, which is a great many days
  const want = K.normalizeDegrees(now - 30);
  const day = K.dayForRosh(29, want);
  assert.ok(Math.abs(day - (29 + 30 / rate)) < 12, `${day} days is not thirty degrees of the ראש`);
  near(K.chapter16At(day).rosh, want, rate, 'and it lands within a day of where it was put');
  // asking for where it already stands leaves the day where it is
  assert.equal(K.dayForRosh(29, now), 29, 'no movement, no day');
  // and every place on his circle can be asked for
  for (let lon = 0; lon < 360; lon += 37) {
    const d = K.dayForRosh(4000, lon);
    near(K.chapter16At(d).rosh, lon, rate, `asking the ראש for ${lon}°`);
  }
});

test('no chapter-16 page or partial types a DMS figure into a chart', () => {
  const files = ['src/partials/kh16.js', 'src/pages/kh16-1.html', 'src/pages/kh16-2.html',
                 'src/pages/kh16-6.html', 'src/pages/kh16-9.html', 'src/pages/kh16-11.html',
                 'src/pages/kh16-13.html',
                 'src/pages/kh16-19.html'];
  for (const f of files) {
    // his own quoted worked figures are declared as numbers in a HIS block and
    // shown beside the engine's; a typed DMS string in the drawing is the bug
    assert.ok(!/\d+°\s*\d+[′']/.test(read(f)), `${f} contains a typed DMS value`);
  }
});
