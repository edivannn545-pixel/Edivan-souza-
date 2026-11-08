// Prévias em baixa resolução para revisar o filme sem renderizar o vídeo inteiro.
//   node tools/stills.mjs                 um quadro em cada palavra enfatizada (*palavra*)
//   node tools/stills.mjs 120,340,610     quadros específicos
//   node tools/stills.mjs palavras 0.35   escolhe a escala (padrão 0.25 = 270x480)
// Saída: out/stills/fNNNNN.jpg — abra as imagens para conferir.
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { abrirNavegador } from './navegador.mjs';

const root = path.resolve(import.meta.dirname, '..');
const arg = process.argv[2] ?? 'palavras';
const scale = Number(process.argv[3] ?? 0.25);
const { WORDS, FPS } = await import(pathToFileURL(path.join(root, 'src', 'timeline.ts')).href);
const frames = arg === 'palavras' ? WORDS.filter((w) => w.stressed).map((w) => Math.round((w.t0 + 0.25) * FPS)) : arg.split(',').map(Number);

const outDir = path.join(root, 'out', 'stills');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const inputProps = { legendas: false, voz: false, musica: false };
const serveUrl = await bundle({ entryPoint: path.join(root, 'src', 'index.ts') });
const probe = await selectComposition({ serveUrl, id: 'Filme', inputProps, browserExecutable: process.env.CHROME_PATH || null });
const { browser, browserExecutable, chromiumOptions } = await abrirNavegador(serveUrl, probe);
const composition = await selectComposition({ serveUrl, id: 'Filme', puppeteerInstance: browser, browserExecutable, chromiumOptions, inputProps });
for (const f of frames) {
  const out = path.join(outDir, `f${String(f).padStart(5, '0')}.jpg`);
  await renderStill({ composition, serveUrl, frame: f, output: out, scale, imageFormat: 'jpeg', jpegQuality: 75, puppeteerInstance: browser, browserExecutable, chromiumOptions, inputProps });
  console.log(path.relative(root, out));
}
await browser.close({ silent: true });
