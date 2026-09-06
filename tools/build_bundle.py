import re, io, os

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'engine')

ORDER = ['constants.js', 'dmsUtils.js', 'zodiac.js', 'periodBlocks.js',
         'sunCalculations.js', 'moonCalculations.js', 'visibilityCalculations.js']

SHIM = """
// ── shim: replaces engine/epochDays.js (drops the hebcal dependency) ──
// daysFromEpoch is an integer civil-day count; the Rambam's epoch,
// 3 Nisan 4938 AM, is 1178-03-30 in the proleptic Gregorian calendar.
// Verified against the live /api/calculate output.
var MOLAD_INTERVAL_DAYS = 29 + 12 / 24 + 793 / (24 * 1080);
function HDate(d) { this._d = d instanceof Date ? d : new Date(d); }
var EPOCH_UTC = Date.UTC(1178, 2, 30);
function daysFromEpoch(x) {
  var d = x instanceof HDate ? x._d : x;
  return Math.round((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - EPOCH_UTC) / 86400000);
}
"""

def strip(path):
    src = io.open(path, encoding='utf-8').read()
    # drop import lines (single- and multi-line)
    src = re.sub(r"^import\s+[\s\S]*?from\s+'[^']+';\s*$", '', src, flags=re.M)
    # drop bare re-export statements
    src = re.sub(r"^export\s*\{[^}]*\};\s*$", '', src, flags=re.M)
    # turn `export const` / `export function` into plain declarations
    src = re.sub(r"^export\s+(?=(const|let|var|function|class)\b)", '', src, flags=re.M)
    return src

out = ['/* Rambam Kiddush HaChodesh engine — MIT, github.com/rayistern/kidushhachodesh',
       '   Bundled verbatim from https://shluchimexchange.ai/kh/engine/ ,',
       '   with epochDays.js swapped for the hebcal-free shim below. */',
       SHIM]
for name in ORDER:
    out.append('\n// ══════════ engine/%s ══════════\n' % name)
    out.append(strip(os.path.join(SRC, name)))

io.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'engine-bundle.js'), 'w',
        encoding='utf-8', newline='\n').write('\n'.join(out))
print('wrote engine-bundle.js')
