// Abre o navegador de render com WebGL funcionando em qualquer máquina.
// Tenta a placa de vídeo ('angle'); se não houver (nuvem, servidor), troca sozinho para 'swangle' (software).
// REMOTION_GL força um modo; CHROME_PATH aponta para um Chrome instalado.
import { openBrowser, renderStill } from '@remotion/renderer';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const browserExecutable = process.env.CHROME_PATH || null;

// Renderiza um quadro de teste minúsculo para saber se o WebGL deste modo funciona.
const testa = async (browser, gl, serveUrl, composition) => {
  const tmp = path.join(os.tmpdir(), `teste-gl-${process.pid}.png`);
  try {
    await renderStill({ composition, serveUrl, frame: 0, output: tmp, scale: 0.1, puppeteerInstance: browser, browserExecutable, chromiumOptions: { gl } });
    return true;
  } catch {
    return false;
  } finally {
    fs.rmSync(tmp, { force: true });
  }
};

export async function abrirNavegador(serveUrl, composition) {
  const modos = process.env.REMOTION_GL ? [process.env.REMOTION_GL] : ['angle', 'swangle'];
  for (const gl of modos) {
    const chromiumOptions = { gl };
    const browser = await openBrowser('chrome', { browserExecutable, chromiumOptions });
    if (modos.length === 1 || (await testa(browser, gl, serveUrl, composition))) {
      if (gl !== 'angle') console.log(`(sem placa de vídeo: usando WebGL por software "${gl}". Para o render final: REMOTION_GL=${gl})`);
      return { browser, browserExecutable, chromiumOptions };
    }
    await browser.close({ silent: true });
  }
  throw new Error('WebGL não funcionou nem com a placa de vídeo nem por software.');
}
