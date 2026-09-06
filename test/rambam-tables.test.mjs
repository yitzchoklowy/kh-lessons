/* Pins the engine's tables to the Mishneh Torah as printed.
   Values transcribed from Sefaria, Mishneh Torah, Sanctification of the New
   Month — so a refresh from upstream that changes a figure fails here first. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { E } from './helpers.mjs';

const { CONSTANTS: C, dmsToDecimal: D, formatDms: F } = E;
const dms = (d, m, s) => d + m / 60 + s / 3600;
const same = (got, want, what) =>
  assert.ok(Math.abs(got - want) < 1e-9, `${what}: engine ${F(got)} vs printed ${F(want)}`);

test('KH 14:1–2 — the moon\'s mean motion, as printed', () => {
  same(D(C.MOON.MEAN_MOTION_PER_DAY), dms(13, 10, 35), 'one day');
  same(D(C.MOON_MEAN_PERIOD_BLOCKS.p10), dms(131, 45, 50), 'ten days');
  same(D(C.MOON_MEAN_PERIOD_BLOCKS.p100), dms(237, 38, 23), 'one hundred days');
  same(D(C.MOON_MEAN_PERIOD_BLOCKS.p1000), dms(216, 23, 50), 'one thousand days');
  same(D(C.MOON_MEAN_PERIOD_BLOCKS.p10000), dms(3, 58, 20), 'ten thousand days');
  same(D(C.MOON_MEAN_PERIOD_BLOCKS.p29), dms(22, 6, 56), 'twenty-nine days');
});

test('KH 14:3–4 — the mean within its path, as printed', () => {
  same(D(C.MOON.MASLUL_MEAN_MOTION), dms(13, 3, 54), 'one day');
  same(D(C.MOON_MASLUL_PERIOD_BLOCKS.p10), dms(130, 39, 0), 'ten days');
  same(D(C.MOON_MASLUL_PERIOD_BLOCKS.p100), dms(226, 29, 53), 'one hundred days');
  same(D(C.MOON_MASLUL_PERIOD_BLOCKS.p1000), dms(104, 58, 50), 'one thousand days');
  same(D(C.MOON_MASLUL_PERIOD_BLOCKS.p354), dms(305, 0, 13), 'a regular year');
});

test('KH 14:4 — the positions at the epoch, as printed', () => {
  // "1 degree, 14 minutes and 43 seconds, in the constellation of Taurus"
  same(D(C.MOON.START_POSITION), dms(1, 14, 43), 'moon mean at epoch');
  assert.equal(C.MOON.START_CONSTELLATION, 1, 'Taurus is the second constellation');
  same(D(C.MOON.MASLUL_START), dms(84, 28, 42), 'maslul at epoch');
});

test('KH 14:5 — nine stored bands covering the circle exactly once', () => {
  const B = [...C.SEASON_CORRECTIONS].sort((a, b) => a.sunFrom - b.sunFrom);
  assert.equal(B.length, 9);
  assert.equal(B[0].sunFrom, 0, 'the table starts at 0°');
  assert.equal(B[B.length - 1].sunTo, 360, 'and closes the circle');
  for (let i = 1; i < B.length; i++) {
    assert.equal(B[i].sunFrom, B[i - 1].sunTo, `gap or overlap at ${B[i].sunFrom}°`);
  }
  // the adjustments the Rambam names: nothing, a quarter degree, a half
  for (const b of B) assert.ok([0, 0.25, 0.5, -0.25, -0.5].includes(b.adjustment), `odd band ${b.adjustment}`);
  // and symmetric about the equinox line. The bands are half-open [from, to),
  // so a boundary degree belongs to the band above it while its mirror belongs
  // to the band below — sample band interiors, not the joins.
  const at = (lam) => B.find((b) => lam >= b.sunFrom && lam < b.sunTo).adjustment;
  for (let i = 0; i < 180; i++) {
    const lam = i + 0.5;
    // sum, not negate: -0 !== 0 under strict equality, and the zero bands negate to -0
    assert.equal(at(lam) + at(360 - lam), 0, `not symmetric at ${lam}°`);
  }
});

test('no page or partial types a DMS figure into a chart', async () => {
  // charts must read CONSTANTS; a literal like 131° 45′ 50″ in chart code is the bug
  // this rule exists to prevent (see CLAUDE.md §3)
  const fs = await import('node:fs');
  for (const f of ['src/partials/chart-blocks.js', 'src/partials/chart-bands.js']) {
    const src = fs.default.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
    assert.ok(!/\d+°\s*\d+[′']/.test(src), `${f} contains a typed DMS value`);
  }
});
