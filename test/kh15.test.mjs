/* Chapter 15, pinned to the Mishneh Torah as alhatorah prints it.
   Text pulled 2026-09-07 from
   https://dbserver.alhatorah.org/read/mg/v1/json/Rambam/Zemanim/Kiddush HaChodesh/15
   (mirrored locally at I:\PDF Library\_managed\alhatorah). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONSTANTS as C } from '../src/engine/constants.js';
import { formatDms as F, normalizeDegrees as N } from '../src/engine/dmsUtils.js';
import { zodiacPosition } from '../src/engine/zodiac.js';

const dms = (d, m = 0, s = 0) => d + m / 60 + s / 3600;
const near = (got, want, tol, what) =>
  assert.ok(Math.abs(got - want) <= tol, `${what}: ${F(got)} against his ${F(want)}`);

test('KH 15:3 — the nine additions he gives, and their bounds', () => {
  const his = C.DOUBLE_ELONGATION_ADJUSTMENTS.filter((r) => r.source !== 'approximated');
  assert.equal(his.length, 10, 'ten rows: no addition, then one degree up to nine');
  assert.equal(his[0].minElongation, 0);
  assert.equal(his[0].maxElongation, 5, '"חמש מעלות או קרוב לחמש" — nothing added');
  assert.equal(his[his.length - 1].maxElongation, 63, 'and closes at sixty-three');
  // "משש מעלות עד אחת עשרה … מעלה אחת", and so on up by one degree a row
  his.forEach((r, i) => assert.equal(r.adjustment, i, `row ${i} should add ${i}°`));
  // his bands run on without a gap: each starts the degree after the last ended
  for (let i = 1; i < his.length; i++) {
    assert.equal(his[i].minElongation, his[i - 1].maxElongation + 1,
      `gap or overlap at ${his[i].minElongation}°`);
  }
});

test('KH 15:6 — the moon\'s מנות, as printed', () => {
  const T = C.MOON_MASLUL_CORRECTIONS;
  assert.equal(T.length, 19, 'nought, then his eighteen rows from ten to a hundred and eighty');
  const printed = [
    [10, dms(0, 50)], [20, dms(1, 38)], [30, dms(2, 24)], [40, dms(3, 6)],
    [50, dms(3, 44)], [60, dms(4, 16)], [70, dms(4, 41)], [80, dms(5, 0)],
    [90, dms(5, 5)], [100, dms(5, 8)], [110, dms(4, 59)], [120, dms(4, 40)],
    [130, dms(4, 11)], [140, dms(3, 33)], [150, dms(2, 48)], [160, dms(1, 56)],
    [170, dms(0, 59)], [180, 0],
  ];
  for (const [maslul, want] of printed) {
    const row = T.find((r) => r.maslul === maslul);
    assert.ok(row, `no row for ${maslul}°`);
    near(row.correction, want, 1e-9, `${maslul}°`);
  }
  // his crest sits at a hundred, not at ninety the way the sun's does
  const peak = T.reduce((a, b) => (b.correction > a.correction ? b : a));
  assert.equal(peak.maslul, 100);
  const sunPeak = C.SUN_MASLUL_CORRECTIONS.reduce((a, b) => (b.correction > a.correction ? b : a));
  assert.equal(sunPeak.maslul, 90);
});

test('KH 15:8–9 — his own night, twenty-nine days from the עיקר', async () => {
  const M = await import('../src/engine/moonCalculations.js');
  const S = await import('../src/engine/sunCalculations.js');
  const day = 29;

  const sunMean = S.calculateSunMeanLongitude(day);
  const apogee = S.calculateSunApogee(day);
  const sunMaslul = S.calculateSunMaslul(sunMean.result, apogee.result);
  const sunCorr = S.lookupMaslulCorrection(sunMaslul.result);
  const sunTrue = S.calculateSunTrueLongitude(sunMean.result, sunMaslul.result, sunCorr.result);

  const moonMean = M.calculateMoonMeanLongitude(day);
  const season = M.calculateSeasonCorrection(sunTrue.result);
  const moonSight = N(moonMean.result + season.result);
  const maslul = M.calculateMoonMaslul(day);
  const kaful = M.calculateDoubleElongation(moonSight, sunMean.result);
  const nachon = M.calculateMaslulHanachon(maslul.result, kaful.result);

  // "ואין מקפידין על החלקים במסלול" — he enters the table with whole degrees
  const asked = Math.floor(nachon.result);
  const mnat = M.lookupMoonMaslulCorrection(asked);
  const amiti = M.calculateMoonTrueLongitude(moonSight, nachon.result, mnat.result, 'subtract');

  const SEC = 1 / 3600;
  near(sunMean.result, dms(35, 38, 33), SEC, 'אמצע השמש · ל״ה ל״ח ל״ג');
  near(moonSight, dms(53, 36, 39), 2 * SEC, 'אמצע הירח לשעת הראייה · נ״ג ל״ו ל״ט');
  near(maslul.result, dms(103, 21, 46), 3 * SEC, 'אמצע המסלול · ק״ג כ״א מ״ו');
  near(N(moonSight - sunMean.result), dms(17, 58, 6), 2 * SEC, 'המרחק');
  near(kaful.result, dms(35, 56, 12), 3 * SEC, 'מרחק הכפול · ל״ה נ״ו י״ב');
  assert.equal(nachon.inputs.adjustment.value, 5, 'תוסיף על אמצע המסלול חמש מעלות');
  assert.equal(asked, 108, 'המסלול הנכון מאה ושמונה');
  near(mnat.result, dms(5, 1), 15 * SEC, 'מנתו · חמש מעלות וחלק אחד');
  near(amiti.result, dms(48, 35, 39), 15 * SEC, 'מקום הירח האמיתי · מ״ח ל״ו');
  assert.equal(zodiacPosition(amiti.result).hebrew, 'שור', 'במזל שור');
});
