/* Build every lesson page into a single self-contained file in dist/.
 *
 * Each page in src/pages is plain HTML with three kinds of placeholder:
 *   <!--ENGINE-->                    the vendored engine + the local pipeline
 *   <!--WORKING-->                   the worked-arithmetic ledger
 *   <!--@include partials/x.js-->    any shared partial, inlined as-is
 *
 * Nothing is fetched at runtime, so a built page works offline and can be
 * opened straight from the filesystem.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundleEngine } from './tools/bundle-engine.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const R = (...p) => path.join(root, ...p);
const read = (p) => fs.readFileSync(R(p), 'utf8');

const engine = bundleEngine(R('src/engine'));
fs.mkdirSync(R('build'), { recursive: true });
fs.writeFileSync(R('build/engine-bundle.js'), engine);

const ENGINE_BLOCK = '<script>\n' + engine + '\n' + read('src/lib/pipeline-local.js') + '\n</script>';
const WORKING_BLOCK = '<script>\n' + read('src/lib/working.js') + '\n</script>';

/* Every page is a fragment — title, style, body — so give it a real document.
   Without the viewport meta a phone lays it out at desktop width. */
const DOC = (body) => `<!doctype html>
<html lang="he">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${body}`;

function include(html, depth = 0) {
  if (depth > 4) throw new Error('include nested too deep');
  return html.replace(/<!--@include\s+([\w./-]+)\s*-->/g, (_, rel) => {
    const body = read(path.join('src', rel));
    return include(body, depth + 1);
  });
}

fs.rmSync(R('dist'), { recursive: true, force: true });
fs.mkdirSync(R('dist'), { recursive: true });

let built = 0;

// lessons: a spec file dropped into src/lessons becomes a page via the shared shell
const shell = read('src/shell.html');
for (const file of fs.readdirSync(R('src/lessons')).filter((f) => f.endsWith('.js'))) {
  const spec = read(path.join('src/lessons', file));
  const title = (spec.match(/title:\s*"([^"]+)"/) || [, file])[1];
  let html = shell.replace('__TITLE__', title).replace('<!--@spec-->', () => spec);
  html = include(html);
  html = html.replace('<!--ENGINE-->', () => ENGINE_BLOCK).replace('<!--WORKING-->', () => WORKING_BLOCK);
  const left = html.match(/<!--(?:@include|@spec|ENGINE|WORKING)[^>]*-->/);
  if (left) throw new Error(`${file}: placeholder left unfilled — ${left[0]}`);
  const out = file.replace(/\.js$/, '.html');
  fs.writeFileSync(R('dist', out), DOC(html));
  console.log(String(out).padEnd(22), (html.length / 1024).toFixed(0) + ' KB');
  built++;
}

for (const file of fs.readdirSync(R('src/pages')).filter((f) => f.endsWith('.html'))) {
  let html = read(path.join('src/pages', file));
  html = include(html);
  html = html.replace('<!--ENGINE-->', () => ENGINE_BLOCK).replace('<!--WORKING-->', () => WORKING_BLOCK);

  const left = html.match(/<!--(?:@include|ENGINE|WORKING)[^>]*-->/);
  if (left) throw new Error(`${file}: placeholder left unfilled — ${left[0]}`);

  fs.writeFileSync(R('dist', file), DOC(html));
  console.log(String(file).padEnd(22), (html.length / 1024).toFixed(0) + ' KB');
  built++;
}

const NL = String.fromCharCode(10);
const JOINSEP = NL + '  ';

// a plain index so dist/ is browsable on its own
const pages = [
  ['kh14-1.html', 'י״ד:א', 'שני מהלכים אמצעיים'],
  ['kh14-2.html', 'י״ד:א–ב', 'מהלך אמצע הירח'],
  ['kh14-3.html', 'י״ד:ג–ד', 'מהלך אמצע המסלול'],
  ['kh14-sun.html', 'י״ד:ה–ו', 'אמצע הירח לשעת הראייה'],
  ['kh12-sun-mean.html', 'י״ב:א', 'מהלך אמצע השמש'],
  ['kh12-govah.html', 'י״ב:ב', 'גובה השמש'],
  ['galgalim.html', 'י״ד–ט״ז', 'ארבעת גלגלי הירח'],
  ['calculator.html', 'י״א–י״ז', 'כל החשבון'],
];
fs.writeFileSync(R('dist/index.html'), `<!doctype html>
<html lang="he">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>רמב״ם · הלכות קידוש החודש</title>
<style>
  :root { --bg:#e7e9ee; --card:#fbfbfd; --ink:#0f1218; --muted:#555c6b; --line:#d1d5de; --brass:#8a6a1f; }
  @media (prefers-color-scheme:dark) { :root:not([data-theme="light"]) {
    --bg:#0a0c11; --card:#13161d; --ink:#e7e9f0; --muted:#99a0b0; --line:#242a34; --brass:#d8b264; } }
  :root[data-theme="dark"] { --bg:#0a0c11; --card:#13161d; --ink:#e7e9f0; --muted:#99a0b0;
    --line:#242a34; --brass:#d8b264; }
  body { margin:0; background:var(--bg); color:var(--ink); direction:rtl;
         font:16px/1.7 'Frank Ruhl Libre','David',Georgia,serif; }
  main { max-width:40rem; margin:0 auto; padding:3rem 1.2rem 4rem; }
  h1 { font-size:1.9rem; margin:0 0 2rem; font-weight:700; }
  a.card { display:flex; align-items:baseline; gap:.8rem; text-decoration:none; color:inherit;
           border:1px solid var(--line); background:var(--card); border-radius:10px;
           padding:.85rem 1.1rem; margin-bottom:.6rem; }
  a.card:hover { border-color:var(--brass); }
  a.card b { font-size:1.15rem; font-weight:500; }
  a.card span { color:var(--muted); font-size:.9rem; margin-inline-start:auto;
                font-family:'IBM Plex Mono',monospace; direction:ltr; }
</style>
<main>
  <h1>רמב״ם · הלכות קידוש החודש</h1>
  ${pages.map(([f, mark, name]) => `<a class="card" href="${f}"><b>${name}</b><span>${mark}</span></a>`).join(JOINSEP)}
</main>
`);
console.log(NL + `${built} pages + index → dist/`);
