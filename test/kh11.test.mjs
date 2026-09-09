/* Chapter 11, pinned to the Mishneh Torah as alhatorah prints it.
   Text pulled 2026-09-09 from
   https://dbserver.alhatorah.org/read/mg/v1/json/Rambam/Zemanim/Kiddush HaChodesh/11
   (mirrored locally at I:\PDF Library\_managed\alhatorah). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundleEngine } from '../tools/bundle-engine.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

/* Partials are inlined by the build; resolve the same way here so the test runs
   the code a page actually runs. */
const include = (html, depth = 0) => {
  if (depth > 4) throw new Error('include nested too deep');
  return html.replace(/<!--@include\s+([\w./-]+)\s*-->/g,
    (_, rel) => include(read(path.join('src', rel)), depth + 1));
};

const K = new Function(
  bundleEngine(path.join(root, 'src/engine'))
  + '\n' + include(read('src/partials/kh11.js'))
  + '\nreturn { readPlace, hisOrdinal, mazalRows, gem, ARC, ROUND, PER,'
  + ' CONSTANTS, formatDms, dmsToDecimal, zodiacPosition };')();

const { CONSTANTS: C, formatDms: F, dmsToDecimal: D } = K;
const dms = (d, m = 0, s = 0) => d + m / 60 + s / 3600;

test('KH 11:7 — how the circle is divided', () => {
  assert.equal(K.ROUND, 360, 'הגלגל מוחלק בשלש מאות ושישים מעלות');
  assert.equal(K.ARC, 30, 'כל מזל ומזל שלשים מעלות');
  assert.equal(K.PER, 60, 'וכל מעלה ומעלה שישים חלקים');
  assert.equal(K.ROUND / K.ARC, 12, 'twelve mazalos fill the round');
});

test('KH 11:9 — the order of the mazalos, as he lists them', () => {
  const printed = ['טלה', 'שור', 'תאומים', 'סרטן', 'אריה', 'בתולה',
                   'מאזנים', 'עקרב', 'קשת', 'גדי', 'דלי', 'דגים'];
  assert.deepEqual(C.CONSTELLATIONS.slice(0, 12), printed, 'וסדר המזלות כך הוא');

  const rows = K.mazalRows();
  assert.equal(rows.length, 12, 'every one he lists, none dropped, none added');
  rows.forEach((r, i) => {
    assert.equal(r.name, printed[i], `row ${i} is ${printed[i]}`);
    assert.equal(r.from, i * K.ARC, `${printed[i]} opens at ${i * K.ARC}°`);
    assert.equal(r.to, (i + 1) * K.ARC, `${printed[i]} closes at ${(i + 1) * K.ARC}°`);
  });
});

test('KH 11:8 — seventy degrees, thirty minutes, forty seconds', () => {
  const p = K.readPlace(dms(70, 30, 40));
  assert.equal(p.mazal, 'תאומים', 'תדע שכוכב זה הוא במזל תאומים');
  assert.equal(p.passed, 2, 'מזל טלה שלשים מעלות, ומזל שור שלשים');
  assert.ok(Math.abs(p.into - dms(10, 30, 40)) < 1e-9,
    `נשאר עשר מעלות ומחצה... וארבעים שניות — got ${F(p.into)}`);
  assert.equal(p.ordinal, 11, 'בחצי מעלת אחת עשרה ממזל זה');
});

test('KH 11:9 — three hundred and twenty degrees', () => {
  const p = K.readPlace(D({ degrees: 320 }));
  assert.equal(p.mazal, 'דלי', 'תדע שכוכב זה במזל דלי');
  assert.equal(p.passed, 10, 'ten whole mazalos before it');
  assert.equal(p.into, 20, 'twenty degrees into the sign');
  assert.equal(p.ordinal, 20, 'בעשרים מעלה בו');
});

/* The one place the vendored engine and the printed halacha part company. It is
   left standing here so a refresh from upstream that fixes it fires this test
   rather than silently changing what a page prints. */
test('the engine\'s own ordinal, and where his differs', () => {
  assert.equal(K.zodiacPosition(dms(70, 30, 40)).ordinalDegree, 11,
    'part-way through a degree: engine and halacha agree');
  assert.equal(K.zodiacPosition(320).ordinalDegree, 21,
    'exactly on a degree: the engine returns the next one up');
  assert.equal(K.hisOrdinal(20), 20, 'and י״א:ט says בעשרים מעלה בו');
  assert.equal(K.hisOrdinal(0), 1, 'the head of a mazal is its first degree');
  assert.equal(K.hisOrdinal(10.5), 11, 'everywhere else, the degree it is inside');
});

test('every reading rebuilds the place it came from', () => {
  for (let deg = 0; deg < 360; deg += 0.5) {
    const p = K.readPlace(deg);
    assert.ok(Math.abs(p.passed * K.ARC + p.into - p.lon) < 1e-9,
      `${F(deg)}: ${p.passed} × ${K.ARC}° + ${F(p.into)} ≠ ${F(p.lon)}`);
    assert.ok(p.into >= 0 && p.into < K.ARC, `${F(deg)}: remainder inside one mazal`);
    assert.ok(p.ordinal >= 1 && p.ordinal <= K.ARC, `${F(deg)}: degree ${p.ordinal} inside the mazal`);
  }
});

test('Hebrew numerals, for the degree he names in words', () => {
  assert.equal(K.gem(1), 'א׳');
  assert.equal(K.gem(11), 'י״א');
  assert.equal(K.gem(15), 'ט״ו');
  assert.equal(K.gem(16), 'ט״ז');
  assert.equal(K.gem(20), 'כ׳');
  assert.equal(K.gem(30), 'ל׳');
});
