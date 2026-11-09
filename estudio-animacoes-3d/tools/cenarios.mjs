// Renderiza um quadro de cada cenário do estúdio: out/cenarios/NN.png (a folha é montada depois).
//   node tools/cenarios.mjs [de] [ate]   (padrão: todos)
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import { abrirNavegador } from './navegador.mjs';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'out', 'cenarios');
fs.mkdirSync(outDir, { recursive: true });
const de = Number(process.argv[2] ?? 0);
const ate = Number(process.argv[3] ?? 48);
const serveUrl = await bundle({ entryPoint: path.join(root, 'src', 'index.ts') });
const probe = await selectComposition({ serveUrl, id: 'Cenario', inputProps: { i: 0 }, browserExecutable: process.env.CHROME_PATH || null });
const { browser, browserExecutable, chromiumOptions } = await abrirNavegador(serveUrl, probe);
for (let i = de; i < ate; i++) {
  const inputProps = { i };
  const composition = await selectComposition({ serveUrl, id: 'Cenario', inputProps, puppeteerInstance: browser, browserExecutable, chromiumOptions });
  const out = path.join(outDir, `${String(i).padStart(2, '0')}.png`);
  await renderStill({ composition, serveUrl, frame: 0, output: out, inputProps, puppeteerInstance: browser, browserExecutable, chromiumOptions });
  console.log(path.relative(root, out));
}
await browser.close({ silent: true });
