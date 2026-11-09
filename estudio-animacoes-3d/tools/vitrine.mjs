// Fotografa cada cenário com personagens e a folha de objetos: out/vitrine/*.jpg e out/objetos.png
//   node tools/vitrine.mjs [escala=0.5]   (precisa do ffmpeg para montar a folha de objetos)
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import { abrirNavegador } from './navegador.mjs';

const root = path.resolve(import.meta.dirname, '..');
const scale = Number(process.argv[2] ?? 0.5);
const cenas = ['escritorio', 'escritorioFrio', 'estacao', 'estacaoNeon', 'nave', 'naveGas', 'espaco', 'castelo'];
const dir = path.join(root, 'out', 'vitrine');
fs.mkdirSync(dir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, 'src', 'index.ts') });
const probe = await selectComposition({ serveUrl, id: 'Vitrine', inputProps: { cena: cenas[0] } });
const { browser, browserExecutable, chromiumOptions } = await abrirNavegador(serveUrl, probe);
for (const cena of cenas) {
  const composition = await selectComposition({ serveUrl, id: 'Vitrine', inputProps: { cena }, puppeteerInstance: browser, browserExecutable, chromiumOptions });
  const out = path.join(dir, `${cena}.jpg`);
  await renderStill({ composition, serveUrl, frame: 0, output: out, scale, imageFormat: 'jpeg', jpegQuality: 85, inputProps: { cena }, puppeteerInstance: browser, browserExecutable, chromiumOptions });
  console.log(path.relative(root, out));
}
const odir = path.join(root, 'out', 'objetos');
fs.mkdirSync(odir, { recursive: true });
for (let i = 0; i < 22; i++) {
  const composition = await selectComposition({ serveUrl, id: 'Objeto', inputProps: { i }, puppeteerInstance: browser, browserExecutable, chromiumOptions });
  await renderStill({ composition, serveUrl, frame: 0, output: path.join(odir, `o${String(i).padStart(2, '0')}.png`), inputProps: { i }, puppeteerInstance: browser, browserExecutable, chromiumOptions });
}
// Folha com todos os objetos (6 por linha)
const { execFileSync } = await import('node:child_process');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-pattern_type', 'glob', '-i', path.join(odir, 'o*.png'), '-vf', 'tile=6x4:padding=10:color=0xecebe6', '-frames:v', '1', path.join(root, 'out', 'objetos.png')]);
console.log('out/objetos.png');
await browser.close({ silent: true });
