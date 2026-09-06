/* Turn the vendored ES-module engine into one classic script the pages can use.
 *
 * The engine is served (and vendored here) as ES modules with a single bare
 * dependency: the `hebcal` npm package, imported only by epochDays.js to count
 * days from the Rambam's epoch. That count is just an integer civil-day
 * difference, so we drop hebcal entirely and supply the shim below — verified
 * against the project's live /api/calculate (see test/engine-matches-api.mjs).
 */
import fs from 'node:fs';
import path from 'node:path';

const ORDER = [
  'constants.js', 'dmsUtils.js', 'zodiac.js', 'periodBlocks.js',
  'sunCalculations.js', 'moonCalculations.js', 'visibilityCalculations.js',
];

const SHIM = `
// ── shim: stands in for engine/epochDays.js, without the hebcal dependency ──
// The Rambam's epoch, 3 Nisan 4938 AM, is 1178-03-30 in the proleptic
// Gregorian calendar; daysFromEpoch is a plain integer civil-day count.
var MOLAD_INTERVAL_DAYS = 29 + 12 / 24 + 793 / (24 * 1080);
function HDate(d) { this._d = d instanceof Date ? d : new Date(d); }
var EPOCH_UTC = Date.UTC(1178, 2, 30);
function daysFromEpoch(x) {
  var d = x instanceof HDate ? x._d : x;
  return Math.round((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - EPOCH_UTC) / 86400000);
}
`;

function strip(src) {
  return src
    .replace(/^import\s+[\s\S]*?from\s+'[^']+';\s*$/gm, '')   // drop imports
    .replace(/^export\s*\{[^}]*\};\s*$/gm, '')                // drop re-exports
    .replace(/^export\s+(?=(const|let|var|function|class)\b)/gm, '');
}

export function bundleEngine(engineDir) {
  const out = [
    '/* Rambam Kiddush HaChodesh engine — MIT, github.com/rayistern/kidushhachodesh',
    '   Vendored verbatim from https://shluchimexchange.ai/kh/engine/ ,',
    '   with epochDays.js replaced by the hebcal-free shim below.',
    '   Regenerate with: npm run build */',
    SHIM,
  ];
  for (const name of ORDER) {
    out.push(`\n// ══════════ engine/${name} ══════════\n`);
    out.push(strip(fs.readFileSync(path.join(engineDir, name), 'utf8')));
  }
  return out.join('\n');
}

const invokedDirectly = process.argv[1]
  && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`;
if (invokedDirectly) {
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.slice(1)), '..');
  const js = bundleEngine(path.join(root, 'src/engine'));
  fs.mkdirSync(path.join(root, 'build'), { recursive: true });
  fs.writeFileSync(path.join(root, 'build/engine-bundle.js'), js);
  console.log('build/engine-bundle.js', js.length, 'bytes');
}
