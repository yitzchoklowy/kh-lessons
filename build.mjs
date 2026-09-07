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

// a plain index so dist/ is browsable on its own
const pages = [
  ['kh12-sun-mean.html', 'KH 12:1 · The sun’s mean motion', 'One rate, one table of blocks.'],
  ['kh12-govah.html', 'KH 12:2 · The sun’s far point', 'The govah, and how slowly it drifts.'],
  ['kh14-1.html', 'י"ד:א · שני מהלכים אמצעיים', 'שני הגלגלים, ושני האמצעים.'],
  ['kh14-2.html', 'י"ד:א–ב · מהלך אמצע הירח', 'ביום אחד, בעשרה ובמאה ובאלף, ובשנה סדורה.'],
  ['kh14-sun.html', 'KH 14:5–6 · The sun’s nudge', 'The nine bands as a ring of the year, and why they are what they are.'],
  ['galgalim.html', 'KH 14–16 · The four galgalim', 'The moon model built up one chapter at a time.'],
  ['calculator.html', 'KH 11–17 · The whole calculation', 'All 26 steps for ליל ל׳ of any month.'],
];
fs.writeFileSync(R('dist/index.html'), `<!doctype html>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kiddush HaChodesh — lessons</title>
<style>
  body{margin:0;background:#0a0c11;color:#e7e9f0;font:16px/1.6 system-ui,sans-serif}
  @media (prefers-color-scheme:light){body{background:#e7e9ee;color:#0f1218}}
  main{max-width:44rem;margin:0 auto;padding:3rem 1.2rem}
  h1{font-size:1.8rem;margin:0 0 .3rem}
  p.lede{opacity:.65;margin:0 0 2rem}
  a.card{display:block;text-decoration:none;color:inherit;border:1px solid #2a3039;
         border-radius:10px;padding:1rem 1.2rem;margin-bottom:.7rem}
  @media (prefers-color-scheme:light){a.card{border-color:#d1d5de;background:#fbfbfd}}
  a.card:hover{border-color:#d8b264}
  a.card b{display:block;font-size:1.05rem}
  a.card span{opacity:.6;font-size:.92rem}
</style>
<main>
  <h1>Kiddush HaChodesh — lessons</h1>
  <p class="lede">One halacha at a time, computed by the project's own engine.</p>
  ${pages.map(([f, t, d]) => `<a class="card" href="${f}"><b>${t}</b><span>${d}</span></a>`).join('\n  ')}
</main>
`);
console.log(`\n${built} pages + index → dist/`);
