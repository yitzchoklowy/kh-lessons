/* Chapter 17, pinned to the Mishneh Torah as alhatorah prints it.
   Text pulled 2026-09-09 from
   https://dbserver.alhatorah.org/read/mg/v1/json/Rambam/Zemanim/Kiddush HaChodesh/17 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONSTANTS as C } from '../src/engine/constants.js';
import { normalizeDegrees as N } from '../src/engine/dmsUtils.js';
import { zodiacPosition } from '../src/engine/zodiac.js';
import * as M from '../src/engine/moonCalculations.js';
import * as S from '../src/engine/sunCalculations.js';
import * as V from '../src/engine/visibilityCalculations.js';

const dm = (d, m = 0) => d + m / 60;
const show = (x) => {
  const s = x < 0 ? '−' : '';
  x = Math.abs(x);
  const d = Math.floor(x + 1e-9), mi = Math.round((x - d) * 60);
  return s + (mi === 60 ? `${d + 1}°0′` : `${d}°${mi}′`);
};

test('KH 17:5 — שינוי מראה האורך, twelve mazalos as printed', () => {
  const printed = [['טלה', 59], ['שור', 60], ['תאומים', 58], ['סרטן', 52], ['אריה', 43],
                   ['בתולה', 37], ['מאזנים', 34], ['עקרב', 34], ['קשת', 36], ['גדי', 44],
                   ['דלי', 53], ['דגים', 58]];
  assert.equal(C.PARALLAX_LON_BY_MAZAL.length, 12);
  printed.forEach(([heb, chalakim], i) => {
    assert.equal(C.PARALLAX_LON_BY_MAZAL[i].hebrew, heb);
    assert.equal(C.PARALLAX_LON_BY_MAZAL[i].chalakim, chalakim, `${heb}`);
  });
});

test('KH 17:8 — שינוי מראה הרוחב, twelve mazalos as printed', () => {
  const printed = [['טלה', 9], ['שור', 10], ['תאומים', 16], ['סרטן', 27], ['אריה', 38],
                   ['בתולה', 44], ['מאזנים', 46], ['עקרב', 45], ['קשת', 44], ['גדי', 36],
                   ['דלי', 27], ['דגים', 12]];
  assert.equal(C.PARALLAX_LAT_BY_MAZAL.length, 12);
  printed.forEach(([heb, chalakim], i) => {
    assert.equal(C.PARALLAX_LAT_BY_MAZAL[i].hebrew, heb);
    assert.equal(C.PARALLAX_LAT_BY_MAZAL[i].chalakim, chalakim, `${heb}`);
  });
});

test('KH 17:10 — his fifteen bands, mirrored, closing the circle exactly once', () => {
  const B = C.MOON_CIRCLE_FRACTIONS;
  assert.equal(B.length, 30, 'fifteen bands, each stated twice');
  assert.equal(B[0].from, 0);
  assert.equal(B[B.length - 1].to, 360, 'and it closes');
  for (let i = 1; i < B.length; i++) {
    assert.equal(B[i].from, B[i - 1].to, `gap or overlap at ${B[i].from}°`);
  }
  // the second half repeats the first, band for band — "או מתחילת מזל מאזנים"
  for (let i = 0; i < 15; i++) {
    assert.equal(B[i + 15].from, B[i].from + 180, `mirror ${i} starts wrong`);
    assert.equal(B[i + 15].fraction, B[i].fraction, `mirror ${i} takes a different part`);
    assert.equal(B[i + 15].phrase, B[i].phrase);
  }
  // and the one band where nothing is taken — "אין כאן נליזת מעגל"
  const zero = B.filter((b) => b.fraction === 0);
  assert.equal(zero.length, 2);
  assert.equal(zero[0].from, 85, '25° תאומים');
  assert.equal(zero[0].to, 95, 'to 5° סרטן');
});

test('KH 17:12 — his six pairs of setting-time, mirrored about the solstice line', () => {
  const T = C.SETTING_TIME_BY_MAZAL;
  assert.equal(T.length, 12);
  // דגים/טלה, דלי/שור, גדי/תאומים, קשת/סרטן, עקרב/אריה, מאזנים/בתולה
  for (let i = 0; i < 6; i++) {
    assert.equal(T[i].operation, T[11 - i].operation, `${T[i].hebrew}/${T[11 - i].hebrew} disagree`);
    assert.equal(T[i].fraction, T[11 - i].fraction, `${T[i].hebrew}/${T[11 - i].hebrew} disagree`);
  }
  const want = [['טלה', 'add', 1 / 6], ['שור', 'add', 1 / 5], ['תאומים', 'add', 1 / 6],
                ['סרטן', 'none', 0], ['אריה', 'subtract', 1 / 5], ['בתולה', 'subtract', 1 / 3]];
  want.forEach(([heb, op, fr], i) => {
    assert.equal(T[i].hebrew, heb);
    assert.equal(T[i].operation, op, heb);
    assert.ok(Math.abs(T[i].fraction - fr) < 1e-12, heb);
  });
});

test('KH 17:17–21 — the five קצין, each asking one degree less of the אורך', () => {
  const K = C.KITZEI_HAREIYAH_TABLE;
  assert.equal(K.length, 5);
  K.forEach((r, i) => {
    assert.equal(r.kashtFromExclusive, 9 + i, `row ${i}`);
    assert.equal(r.kashtUpTo, 10 + i, `row ${i}`);
    assert.equal(r.orechMin, 13 - i, `row ${i}`);
  });
  // and his two outer rules stand outside the table
  assert.equal(C.EARLY_EXIT_THRESHOLDS.capricornGemini.invisibleMax, 9);
  assert.equal(C.EARLY_EXIT_THRESHOLDS.capricornGemini.visibleMin, 15);
  assert.equal(C.EARLY_EXIT_THRESHOLDS.cancerSagittarius.invisibleMax, 10);
  assert.equal(C.EARLY_EXIT_THRESHOLDS.cancerSagittarius.visibleMin, 24);
});

/* His own night — ליל ערב שבת, 2 Iyar, 29 days from the עיקר.
   Carried the way he carries it: "אין מדקדקין בשניות" (17:13), every stage
   rounded to a whole minute before the next takes it. Every figure of his
   17:13–14 and his verdict of 17:22 come out exactly. */
test('KH 17:13–14, 17:22 — his worked night, to the minute', () => {
  const day = 29;
  const min = (x) => Math.round(x * 60) / 60;

  const sunMean = S.calculateSunMeanLongitude(day);
  const apogee = S.calculateSunApogee(day);
  const sunMaslul = S.calculateSunMaslul(sunMean.result, apogee.result);
  const sunTrue = S.calculateSunTrueLongitude(sunMean.result, sunMaslul.result,
    S.lookupMaslulCorrection(sunMaslul.result).result).result;

  const moonMean = M.calculateMoonMeanLongitude(day);
  const moonSight = N(moonMean.result + M.calculateSeasonCorrection(sunTrue).result);
  const nachon = M.calculateMaslulHanachon(M.calculateMoonMaslul(day).result,
    M.calculateDoubleElongation(moonSight, sunMean.result).result);
  const asked = Math.floor(nachon.result <= 180 ? nachon.result : 360 - nachon.result);
  const amiti = M.calculateMoonTrueLongitude(moonSight, nachon.result,
    M.lookupMoonMaslulCorrection(asked).result, 'subtract').result;
  const rochav1 = min(M.calculateMoonLatitude(amiti, M.calculateNodePosition(day).result).result);

  const orech1 = min(V.calculateElongation(amiti, sunTrue).result);
  const orech2 = min(V.calculateOrechSheni(orech1, amiti).result);
  const rochav2 = min(V.calculateRochavSheni(rochav1, amiti).result);
  const s3 = V.calculateOrechShlishi(orech2, rochav2, amiti);
  const maagal = min(s3.maagalMagnitude);
  const orech3 = min(s3.result);
  const orech4 = min(V.calculateOrechRevii(orech3, amiti).result);
  const gov = min(V.calculateMnatGovahHaMedinah(rochav1).result);
  const keshet = min(V.calculateKeshetHaReiyah(orech4, gov, rochav1).result);

  const exact = (got, want, what) =>
    assert.ok(Math.abs(got - want) < 1e-9, `${what}: ${show(got)} against his ${show(want)}`);

  exact(min(sunTrue), dm(37, 9), 'מקום השמש האמיתי · ז״ט במזל שור');
  exact(min(amiti), dm(48, 36), 'מקום הירח האמיתי · י״ח ל״ו במזל שור');
  assert.equal(zodiacPosition(amiti).hebrew, 'שור');
  exact(Math.abs(rochav1), dm(3, 53), 'רוחב ראשון · גנ״ג');
  assert.ok(rochav1 < 0, 'ברוח דרום');
  exact(orech1, dm(11, 27), 'אורך ראשון · י״א כ״ז');
  exact(orech2, dm(10, 27), 'אורך שני · יכ״ז');
  exact(Math.abs(rochav2), dm(4, 3), 'רוחב שני · ד״ג');
  exact(maagal, dm(1, 1), 'מעגל הירח · מעלה אחת וחלק אחד');
  assert.equal(s3.maagalPhrase, 'רביעיתו', 'ראוי ליקח מן הרוחב השני רביעיתו');
  exact(orech3, dm(11, 28), 'אורך שלישי · י״א כ״ח');
  exact(orech4, dm(13, 46), 'אורך רביעי · י״ג מ״ו');
  exact(gov, dm(2, 35), 'מנת גובה המדינה');
  exact(keshet, dm(11, 11), 'קשת הראייה · י״א י״א');

  // 17:22 — קשת יתר על י״א, אורך ראשון יתר על י״א → ודאי ייראה, by 17:19
  const verdict = V.determineVisibility({ orechRishon: orech1, keshetHaReiyah: keshet, moonTrueLon: amiti });
  assert.equal(verdict.result, true, 'ייודע שודאי ייראה בליל זה');
  assert.match(verdict.path, /17:19/, 'by the third of his קצין');
});

/* The engine crashes rather than answering when a קשת lands in (9,14] but
   matches no row — its else-branch reads `row.kashtUpTo` without the guard its
   if-branch has. No page can reach it (every chapter-17 page rounds the קשת to
   a minute and the five rows cover (9,14] exactly), but nothing should ever
   hand it a figure that is not a number. */
test('determineVisibility is only ever handed real numbers', () => {
  assert.throws(() => V.determineVisibility({
    orechRishon: 11.45, keshetHaReiyah: NaN, moonTrueLon: 48.6,
  }), TypeError, 'engine gap — see src/engine/README.md');
});
