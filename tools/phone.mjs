/* Render a built page at a true phone viewport.
   Headless Chrome clamps its own viewport at 512px wide, so --window-size lies;
   an iframe of fixed width is the only honest way to see 390. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const page = process.argv[2] || 'index.html';
const width = Number(process.argv[3]) || 390;
const out = path.join(root, 'build', 'phone.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `<!doctype html><html><meta charset="utf-8"><style>
  body { margin:0; background:#333 }
  iframe { width:${width}px; height:2400px; border:0; background:#000 }
</style><iframe src="../dist/${page}"></iframe>`);
console.log(`file:///${out.replace(/\/g, '/')}   (${page} at ${width}px)`);
