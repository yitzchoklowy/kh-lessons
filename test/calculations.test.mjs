import { test } from 'node:test';
import assert from 'node:assert/strict';
import { E, atDay } from './helpers.mjs';

const { CONSTANTS: C, dmsToDecimal: D } = E;

test('the epoch lands on the Rambam\'s own day count', () => {
  assert.equal(atDay(0).daysFromEpoch, 0);
  // 2026-09-04 is 309,884 days after 3 Nisan 4938 — checked against the live API
  assert.equal(E.runPipeline(new Date(Date.UTC(2026, 8, 4))).daysFromEpoch, 309884);
});

test('the block ledger reproduces the engine over 400,000 days', () => {
  const BLOCKS = [['k', 10000], ['j', 1000], ['i', 100], ['h', 10]];
  const total = (step, tbl, daily) => {
    const I = step.inputs, T = C[tbl];
    let t = I[I.startPosition ? 'startPosition' : 'maslulStart'].value;
    const shed = () => { while (t >= 360) t -= Math.floor(t / 360) * 360; };
    for (const [k, size] of BLOCKS) { const n = I[k].value; if (n) { t += n * D(T['p' + size]); shed(); } }
    if (I.d.value) { t += I.d.value * D(daily); shed(); }
    return t;
  };
  let worst = 0;
  for (let n = 0; n <= 400000; n += 97) {
    for (const [step, tbl, daily] of [
      [E.calculateMoonMeanLongitude(n), 'MOON_MEAN_PERIOD_BLOCKS', C.MOON.MEAN_MOTION_PER_DAY],
      [E.calculateMoonMaslul(n), 'MOON_MASLUL_PERIOD_BLOCKS', C.MOON.MASLUL_MEAN_MOTION]]) {
      worst = Math.max(worst, Math.abs(total(step, tbl, daily) - step.result));
    }
  }
  assert.ok(worst < 1e-9, `worst ledger disagreement ${worst}°`);
});

test('every step renders its working, and none fails its self-check', () => {
  const seen = new Set();
  for (let d = 0; d < 400; d++) {
    const c = atDay(309000 + d);
    c._dateLong = 'x'; c._elapsed = 'y'; c._blocksPhrase = 'z'; c._eveningLong = 'w';
    for (const st of c.steps) {
      seen.add(st.id);
      const rows = E.khWorking(st, c);
      assert.ok(rows && rows.length, `${st.id} produced no working on day ${309000 + d}`);
    }
  }
  assert.equal(seen.size, 26, 'expected all 26 astronomical steps');
});

test('ליל ל׳ always lands just past the conjunction', () => {
  const M = E.khWorking.molad;
  const start = M.indexNear(309884);
  let min = 999, max = -999, visible = 0, months = 0;
  for (let i = start; i < start + 120; i++) {
    const c = atDay(M.lilShloshim(i));
    let e = c.moon.elongation; if (e > 180) e -= 360;
    min = Math.min(min, e); max = Math.max(max, e);
    if (c.moon.isVisible) visible++;
    months++;
  }
  assert.ok(min > 0, `a ליל ל׳ fell before the conjunction (${min}°)`);
  assert.ok(max < 30, `a ליל ל׳ fell too late (${max}°)`);
  assert.ok(visible > 10 && visible < months - 10, `verdicts should split, got ${visible}/${months}`);
});

test('the sunset curve the KH 14:5 bands approximate', () => {
  const RAD = Math.PI / 180, EPS = 23.5, PHI = 32;
  const perHour = (13 + 10 / 60 + 35 / 3600) / 24;
  const sunset = (lam) => {
    const dec = Math.asin(Math.sin(EPS * RAD) * Math.sin(lam * RAD)) / RAD;
    return 12 + Math.acos(Math.max(-1, Math.min(1, -Math.tan(PHI * RAD) * Math.tan(dec * RAD)))) / RAD / 15;
  };
  const band = (lam) => (C.SEASON_CORRECTIONS.find((b) => lam >= b.sunFrom && lam < b.sunTo) || {}).adjustment ?? 0;
  let worst = 0, sum = 0, n = 0;
  for (let lam = 0; lam < 360; lam++) {
    const d = Math.abs((sunset(lam) - 18) * perHour - band(lam));
    worst = Math.max(worst, d); sum += d; n++;
  }
  // the figures quoted on the KH 14:5–6 page
  assert.ok(Math.abs(sum / n * 60 - 4.8) < 0.2, `mean gap ${(sum / n * 60).toFixed(1)}′`);
  assert.ok(Math.abs(worst * 60 - 14.2) < 0.2, `worst gap ${(worst * 60).toFixed(1)}′`);
});
