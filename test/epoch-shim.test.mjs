/* The engine's epochDays.js is the one file with an npm dependency; the browser
   bundle replaces it with a plain civil-day difference. This checks the shim
   against the real hebcal, so the substitution stays honest.

   Note: hebcal's HDate(Date) reads the Date in LOCAL time, so these tests build
   local-midnight dates. Feeding it Date.UTC(...) shifts a day in any timezone
   behind UTC — an off-by-one that would quietly corrupt every position. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import hebcal from 'hebcal';

const { HDate } = hebcal;
const EPOCH_ABS = new HDate(3, 'Nisan', 4938).abs();
const EPOCH_UTC = Date.UTC(1178, 2, 30);
const shim = (y, m, d) => Math.round((Date.UTC(y, m, d) - EPOCH_UTC) / 86400000);

test('3 Nisan 4938 is 1178-03-30, and it was a Thursday', () => {
  const greg = new HDate(3, 'Nisan', 4938).greg();
  assert.equal(greg.getFullYear(), 1178);
  assert.equal(greg.getMonth(), 2);
  assert.equal(greg.getDate(), 30);
  // the Rambam calls the epoch ליל חמישי — the night that opens the fifth day
  assert.equal(greg.getDay(), 4, 'expected a Thursday');
  assert.equal(EPOCH_ABS, 719163 + Math.floor(EPOCH_UTC / 86400000), 'anchor is the Rata Die of that day');
});

test('the shim matches hebcal across 900 years', () => {
  for (let y = 1178; y <= 2078; y += 7) {
    for (const [m, d] of [[0, 1], [2, 30], [6, 15], [11, 31]]) {
      assert.equal(shim(y, m, d), new HDate(new Date(y, m, d)).abs() - EPOCH_ABS, `${y}-${m + 1}-${d}`);
    }
  }
});

test('and on the day the live API was checked against', () => {
  assert.equal(shim(2026, 8, 4), 309884);
  assert.equal(new HDate(new Date(2026, 8, 4)).abs() - EPOCH_ABS, 309884);
});
