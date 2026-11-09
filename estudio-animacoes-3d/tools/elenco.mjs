// Renderiza a folha com todo o elenco disponível: out/elenco.png
//   node tools/elenco.mjs
// Outra folha (ex.: os personagens de um vídeo): node tools/elenco.mjs PersonagensMina out/personagens-mina.png
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import { abrirNavegador } from './navegador.mjs';

const root = path.resolve(import.meta.dirname, '..');
const id = process.argv[2] ?? 'Elenco';
const out = path.resolve(root, process.argv[3] ?? path.join('out', 'elenco.png'));
fs.mkdirSync(path.dirname(out), { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, 'src', 'index.ts') });
const probe = await selectComposition({ serveUrl, id, browserExecutable: process.env.CHROME_PATH || null });
const { browser, browserExecutable, chromiumOptions } = await abrirNavegador(serveUrl, probe);
const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser, browserExecutable, chromiumOptions });
await renderStill({ composition, serveUrl, frame: 0, output: out, puppeteerInstance: browser, browserExecutable, chromiumOptions });
await browser.close({ silent: true });
console.log(path.relative(root, out));
