import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { minify } from 'html-minifier-terser';
import less from 'less';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(projectRoot, 'dist');
const assetsDirectory = path.join(outputDirectory, 'assets');

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(assetsDirectory, { recursive: true });

const lessSource = await readFile(path.join(projectRoot, 'less/mpgen.less'), 'utf8');
const { css } = await less.render(lessSource, {
  filename: path.join(projectRoot, 'less/mpgen.less'),
  compress: true
});
await writeFile(path.join(assetsDirectory, 'app.min.css'), css);

await build({
  entryPoints: [path.join(projectRoot, 'src/app.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  legalComments: 'none',
  outfile: path.join(assetsDirectory, 'app.min.js')
});

await cp(
  path.join(projectRoot, 'node_modules/jszip/dist/jszip.min.js'),
  path.join(assetsDirectory, 'jszip.min.js')
);
await cp(
  path.join(projectRoot, 'node_modules/xlsx-populate/browser/xlsx-populate.min.js'),
  path.join(assetsDirectory, 'xlsx-populate.min.js')
);

for (const directory of ['data', 'images', 'templates']) {
  await cp(path.join(projectRoot, directory), path.join(outputDirectory, directory), {
    recursive: true
  });
}

let html = await readFile(path.join(projectRoot, 'index.html'), 'utf8');
for (const [source, replacement] of [
  ['href="mpgen.css"', 'href="assets/app.min.css"'],
  [
    'src="https://cdn.jsdelivr.net/npm/jszip@3/dist/jszip.min.js"',
    'src="assets/jszip.min.js"'
  ],
  [
    'src="https://cdn.jsdelivr.net/npm/xlsx-populate@1.21.0/browser/xlsx-populate.min.js"',
    'src="assets/xlsx-populate.min.js"'
  ],
  [
    '<script src="src/app.js" type="module"></script>',
    '<script defer src="assets/app.min.js"></script>'
  ]
]) {
  html = replaceExactlyOnce(html, source, replacement);
}

const minifiedHtml = await minify(html, {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  useShortDoctype: true
});
await writeFile(path.join(outputDirectory, 'index.html'), minifiedHtml);

console.log(`Production site built in ${path.relative(projectRoot, outputDirectory)}/`);

function replaceExactlyOnce(input, source, replacement) {
  const firstIndex = input.indexOf(source);
  if (firstIndex === -1 || input.indexOf(source, firstIndex + source.length) !== -1) {
    throw new Error(`Expected exactly one occurrence of "${source}" in index.html`);
  }
  return input.slice(0, firstIndex) + replacement + input.slice(firstIndex + source.length);
}
