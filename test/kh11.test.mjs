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
  + '\n' + include(read('src/partials/numerals.js'))
  + '\n' + include(read('src/partials/kh11.js'))
  + '\nreturn { readPlace, hisOrdinal, mazalRows, gem, ARC, ROUND, PER,'
  + ' hebrewWordsToNumber, numText, loupeBands,'
  + ' slabHome, SP, SLAB, ringSource, cellSource, pieceChain, CX11, CY11,'
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

/* His numbers are glossed from his own words, so a page cannot gloss one
   wrongly. Every spelled number in י״א:ז–ט, and the ones the rest of the
   chapter will want. */
test('his numbers, read out of his words', () => {
  const N = K.hebrewWordsToNumber;
  assert.equal(N('שלש מאות ושישים'), 360, 'הגלגל מוחלק בשלש מאות ושישים מעלות');
  assert.equal(N('שלשים'), 30, 'כל מזל ומזל שלשים מעלות');
  assert.equal(N('שישים'), 60, 'וכל מעלה ומעלה שישים חלקים');
  assert.equal(N('שבעים'), 70, 'בשבעים מעלות');
  assert.equal(N('ארבעים'), 40, 'וארבעים שניות');
  assert.equal(N('אחת עשרה'), 11, 'בחצי מעלת אחת עשרה');
  assert.equal(N('שלש מאות ועשרים'), 320, 'בשלש מאות ועשרים מעלות');
  assert.equal(N('עשרים'), 20, 'בעשרים מעלה בו');
  assert.equal(N('עשר'), 10, 'עשר מעלות');
  assert.equal(N('עשר ומחצה'), 10.5, 'עשר מעלות ומחצה');
});

test('and the numbers the rest of chapter eleven gives', () => {
  const N = K.hebrewWordsToNumber;
  assert.equal(N('מאתים תשע וחמישים'), 259, 'י״א:י״ב — רנ״ט');
  assert.equal(N('שמונה ושלשים ותשע מאות וארבעת אלפים'), 4938, 'ליצירה');
  assert.equal(N('תשע ושמונים וארבע מאות ואלף'), 1489, 'לשטרות');
  assert.equal(N('תשע ומאה ואלף'), 1109, 'לחורבן');
  assert.equal(N('מאתים ושישים'), 260, 'המחזור');
  assert.equal(N('שבע עשרה'), 17, 'שנת שבע עשרה');
});

test('a phrase it does not know gets no figure rather than a guessed one', () => {
  assert.equal(K.hebrewWordsToNumber('מקומו בגלגל'), null);
  assert.equal(K.hebrewWordsToNumber(''), null);
  assert.equal(K.numText(null), '');
  assert.equal(K.numText(10.5), '10½');
  assert.equal(K.numText(360), '360');
});

test('the ladder opens each band out of one cell of the band above', () => {
  const p = K.readPlace(70 + 30 / 60 + 40 / 3600);
  const bands = K.loupeBands(p);
  assert.equal(bands.length, 4, 'מזל, מעלה, חלק, שניה');
  assert.equal(bands[0].n, K.ARC, 'a mazal holds thirty degrees');
  assert.equal(bands[0].hit, 10, 'the eleventh degree is the eleventh cell along');
  assert.equal(bands[1].n, K.PER, 'a degree holds sixty parts');
  assert.equal(bands[1].hit, 30, 'ושלשים חלקים');
  assert.equal(bands[2].n, K.PER, 'a part holds sixty seconds');
  assert.equal(bands[2].hit, 39, 'וארבעים שניות — exactly on the mark, so the fortieth, by his count in י״א:ט');
  assert.equal(bands[3].n, K.PER, 'a second holds sixty thirds');
  bands.forEach((b) => assert.ok(b.hit >= 0 && b.hit < b.n, b.key + ': the cell is inside the band'));
});

/* The lifted pieces: each one stands clear of the next and inside the drawing,
   and reads with its nought on the right, the way the count runs. */
test('each lifted piece stands clear of the next, inside the drawing, nought on the right', () => {
  let prevBottom = -Infinity;
  for (let j = 0; j < 4; j++) {
    const s = K.slabHome(j);
    const a0 = s.mid - s.span / 2, a1 = s.mid + s.span / 2;
    const right = K.SP(s, s.r1, a0), left = K.SP(s, s.r1, a1);
    const top = K.SP(s, s.r1, s.mid)[1], bottom = K.SP(s, s.r0 - 12, a0)[1] + 6;
    assert.ok(right[0] > left[0], 'wedge ' + j + ': its nought is on the right');
    assert.ok(left[0] >= 0 && right[0] <= 620, 'wedge ' + j + ': inside the drawing across');
    assert.ok(top > prevBottom, 'wedge ' + j + ': clear of the one above it');
    assert.ok(bottom <= 640, 'wedge ' + j + ': inside the drawing down');
    prevBottom = bottom;
  }
});

test("the first piece starts as the mazal's own sector of the ring", () => {
  const p = K.readPlace(70 + 30 / 60 + 40 / 3600);
  const s = K.ringSource(p);
  assert.ok(Math.abs(s.ax - K.CX11) < 1e-9 && Math.abs(s.ay - K.CY11) < 1e-9, 'it hangs from the earth');
  assert.equal(s.mid, 75, 'the middle of תאומים');
  assert.equal(s.span, K.ARC, 'thirty degrees wide');
});

test('each later piece starts as its own cell of the wedge above it', () => {
  const p = K.readPlace(70 + 30 / 60 + 40 / 3600);
  const chain = K.pieceChain(p), H = K.slabHome(0), s = K.cellSource(H, chain[0]);
  const cw = H.span / chain[0].n;
  assert.ok(Math.abs(s.span - cw) < 1e-9, 'one cell wide');
  assert.ok(Math.abs(s.mid - (H.mid - H.span / 2 + (chain[0].hit + 0.5) * cw)) < 1e-9, 'the eleventh cell');
  assert.ok(Math.abs(s.ax - H.ax) < 1e-6 && Math.abs(s.ay - H.ay) < 1e-6, 'cut from the same wedge');
});

test('every rung is named by his count, and the lit cell is the one named', () => {
  const at0 = K.pieceChain(K.readPlace(0));
  assert.deepEqual(at0.map((b) => b.name), ['מזל טלה', 'מעלה א׳', 'חלק א׳', 'שניה א׳'],
    'at ראש טלה, the first of everything');
  at0.forEach((b) => assert.equal(b.hit, 0, b.key + ': the first cell is lit'));

  const his = K.pieceChain(K.readPlace(70 + 30 / 60 + 40 / 3600));
  assert.deepEqual(his.map((b) => b.name), ['מזל תאומים', 'מעלה י״א', 'חלק ל״א', 'שניה מ׳'],
    'בחצי מעלת אחת עשרה — and by the same count, the thirty-first חלק');
  assert.deepEqual(his.map((b) => b.hit), [10, 30, 39, 0], 'each lit cell is the one its name says');
});
