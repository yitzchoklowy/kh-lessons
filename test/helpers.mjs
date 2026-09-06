/* Load the built engine the same way a page does: one classic script scope. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundleEngine } from '../tools/bundle-engine.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = bundleEngine(path.join(root, 'src/engine'))
  + '\n' + fs.readFileSync(path.join(root, 'src/lib/pipeline-local.js'), 'utf8')
  + '\n' + fs.readFileSync(path.join(root, 'src/lib/working.js'), 'utf8')
  + '\nreturn { runPipeline, khWorking, CONSTANTS, formatDms, dmsToDecimal, normalizeDegrees,'
  + ' calculateMoonMeanLongitude, calculateMoonMaslul, calculateSeasonCorrection };';

export const E = new Function(src)();
export const EPOCH_MS = Date.UTC(1178, 2, 30);
export const atDay = (n) => E.runPipeline(new Date(EPOCH_MS + n * 86400000));
