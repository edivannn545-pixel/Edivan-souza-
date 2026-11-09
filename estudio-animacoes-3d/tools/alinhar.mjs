// Plano B quando a transcrição do ElevenLabs não está disponível: estima o tempo de cada palavra
// a partir das PAUSAS do próprio áudio (ffmpeg silencedetect) e grava src/voz.ts.
//   node tools/alinhar.mjs [public/voz.mp3]
// Como funciona: cada pausa do áudio é casada (em ordem) com um fim de frase ou vírgula do roteiro;
// dentro de cada trecho as palavras são distribuídas pelo número de sílabas.
// Fica bom para cortes e gestos (erro típico < 0,15 s). Quando a transcrição voltar, use tools/palavras.mjs.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const file = process.argv[2] ?? path.join(root, 'public', 'voz.mp3');

const r = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-af', 'silencedetect=noise=-35dB:d=0.12', '-f', 'null', '-'], { encoding: 'utf8' });
const out = r.stderr ?? '';
const dur = Number(/Duration: (\d+):(\d+):([\d.]+)/.exec(out)?.slice(1).reduce((a, x, i) => a + Number(x) * [3600, 60, 1][i], 0) ?? 0);
const starts = [...out.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]));
const ends = [...out.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
let pausas = starts.map((s, i) => [s, ends[i] ?? dur]);
// Duas pausas quase coladas (respiração no meio do silêncio) contam como uma só.
pausas = pausas.reduce((acc, p) => {
  const prev = acc[acc.length - 1];
  if (prev && p[0] - prev[1] < 0.15) prev[1] = p[1];
  else acc.push([...p]);
  return acc;
}, []);
// Silêncio no começo / fim do arquivo não é pausa entre frases.
const t0 = pausas.length && pausas[0][0] < 0.05 ? pausas.shift()[1] : 0;
const tEnd = pausas.length && pausas[pausas.length - 1][1] >= dur - 0.05 ? pausas.pop()[0] : dur;

const { LINES } = await import(pathToFileURL(path.join(root, 'src', 'timeline.ts')).href);
const words = [];
LINES.forEach((l, li) => l.split(' ').forEach((w, i, arr) => words.push({ w: w.replace(/\*/g, ''), fimFrase: i === arr.length - 1, virgula: /[,:;.!?…"]$/.test(w) && i < arr.length - 1 })));
const silabas = (w) => Math.max(1, (w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[aeiouy]+/g) ?? []).length);
const peso = words.map((x) => silabas(x.w));
const total = peso.reduce((a, b) => a + b, 0);

// Candidatos a pausa: depois de cada palavra que termina frase ou tem pontuação. Tempo esperado pela proporção de sílabas.
const cands = [];
let acc = 0;
words.forEach((x, i) => {
  acc += peso[i];
  if ((x.fimFrase || x.virgula) && i < words.length - 1) cands.push({ i, exp: t0 + ((tEnd - t0) * acc) / total, frase: x.fimFrase });
});

// Casamento em ordem: para cada pausa, escolhe entre os próximos candidatos o que cai mais perto,
// reestimando a velocidade da fala a partir da última pausa casada. Pular um fim de frase custa caro.
const cortes = []; // [índice da última palavra do trecho, início da pausa, fim da pausa]
let ci = 0, ancT = t0, ancW = -1;
const silAte = (i) => peso.slice(0, i + 1).reduce((x, y) => x + y, 0);
for (let p = 0; p < pausas.length && ci < cands.length; p++) {
  const [ps, pe] = pausas[p];
  const ritmo = (tEnd - ancT - (pausas.length - p) * 0.3) / (total - silAte(ancW));
  let best = -1, custo = Infinity, pulo = 0;
  for (let k = ci; k < Math.min(cands.length, ci + 5); k++) {
    const exp = ancT + (silAte(cands[k].i) - silAte(ancW)) * ritmo;
    const c = Math.abs(ps - exp) + pulo;
    if (c < custo) { custo = c; best = k; }
    pulo += cands[k].frase ? 1.2 : 0.25;
  }
  cortes.push([cands[best].i, ps, pe]);
  ancT = pe; ancW = cands[best].i; ci = best + 1;
}

// Distribui as palavras de cada trecho pelo número de sílabas.
const VOZ = [];
let a = t0, wi = 0;
for (const [last, ps, pe] of [...cortes, [words.length - 1, tEnd, tEnd]]) {
  const idx = [];
  for (; wi <= last; wi++) idx.push(wi);
  const soma = idx.reduce((s, i) => s + peso[i], 0);
  let t = a;
  for (const i of idx) {
    const d = ((ps - a) * peso[i]) / soma;
    VOZ.push([t, t + d * 0.92, words[i].w]);
    t += d;
  }
  a = pe;
}

const ts = `// Gerado por tools/alinhar.mjs (tempos ESTIMADOS pelas pausas de ${path.basename(file)}).\n// Para tempos exatos, transcreva no ElevenLabs e rode tools/palavras.mjs.\nexport const VOZ: [number, number][] = [\n${VOZ.map(([x, y, w]) => `  [${x.toFixed(3)}, ${y.toFixed(3)}], // ${w}`).join('\n')}\n];\n`;
fs.writeFileSync(path.join(root, 'src', 'voz.ts'), ts);
console.log(`ok: ${VOZ.length} palavras, ${pausas.length} pausas casadas em ${cortes.length} pontos (de ${cands.length} possíveis).`);
for (const [i, ps] of cortes) console.log(`  pausa em ${ps.toFixed(2)}s depois de "${words[i].w}"`);
