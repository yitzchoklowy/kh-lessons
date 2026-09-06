/* Checks the vendored engine still agrees with the project's live API.
   Hits the network, so it only runs with LIVE=1:  LIVE=1 npm test  */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { E } from './helpers.mjs';

const DATES = ['2026-09-04', '2026-04-07', '2026-01-01', '2027-03-19',
               '1178-04-01', '2000-02-29', '2026-12-31', '2026-03-19'];

test('the vendored engine matches /api/calculate', { skip: !process.env.LIVE }, async () => {
  for (const d of DATES) {
    const [y, m, day] = d.split('-').map(Number);
    const mine = E.runPipeline(new Date(Date.UTC(y, m - 1, day)));
    const ref = await (await fetch(`https://www.shluchimexchange.ai/kh/api/calculate?date=${d}`)).json();

    assert.equal(mine.daysFromEpoch, ref.daysFromEpoch, `${d}: day count`);
    const refSteps = new Map(ref.steps.map((s) => [s.id, s]));
    for (const s of mine.steps) {
      const r = refSteps.get(s.id);
      assert.ok(r, `${d}: engine has no step ${s.id}`);
      if (typeof s.result === 'number' && typeof r.result === 'number') {
        assert.ok(Math.abs(s.result - r.result) < 1e-9, `${d} ${s.id}: ${s.result} vs ${r.result}`);
      } else {
        assert.deepEqual(s.result, r.result, `${d} ${s.id}`);
      }
      if (s.formatted && r.formatted) assert.equal(s.formatted, r.formatted, `${d} ${s.id}: formatting`);
    }
  }
});
