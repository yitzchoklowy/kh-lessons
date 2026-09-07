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
  + '\nreturn { chapter15At, chapter16At, foldMaslul, rochavBracket, hisLatRows, waveRows,'
  + ' FOLD_RULES, CONSTANTS, formatDms, normalizeDegrees, dmsToDecimal, zodiacPosition,'
  + ' calculateNodePosition };')();

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
