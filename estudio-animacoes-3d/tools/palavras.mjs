// Converte a transcrição com tempo por palavra (ElevenLabs speech-to-text) em src/voz.ts.
//   node tools/palavras.mjs public/palavras.json
// Aceita: uma lista de palavras, ou um objeto com `words` (ou `transcripts[0].words`).
// Cada palavra precisa de texto (`text` ou `word`) e de `start`/`end` em segundos.
// Tags de voz como [excited] e espaços são ignorados. As palavras são casadas em ordem com o roteiro (LINES).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const file = process.argv[2] ?? path.join(root, 'public', 'palavras.json');
const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
const list = Array.isArray(raw) ? raw : raw.words ?? raw.transcripts?.[0]?.words ?? [];
const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

const falado = list
  .filter((w) => (w.type ?? 'word') === 'word')
  .map((w) => ({ key: norm(w.text ?? w.word), start: Number(w.start ?? w.start_time), end: Number(w.end ?? w.end_time) }))
  .filter((w) => w.key && !/^\[/.test(w.key) && Number.isFinite(w.start));
// Remove tags que o normalizador deixou passar (ex.: "excited" vindo de "[excited]").
const tags = new Set(list.filter((w) => /^\s*\[.*\]\s*$/.test(String(w.text ?? w.word))).map((w) => norm(w.text ?? w.word)));
const palavras = falado.filter((w) => !tags.has(w.key));

const { LINES } = await import(pathToFileURL(path.join(root, 'src', 'timeline.ts')).href);
const roteiro = LINES.join(' ').replace(/\*/g, '').split(/\s+/).filter(Boolean);

// Casamento em ordem: procura a próxima palavra falada igual (até 3 à frente); se não achar, usa o tempo da anterior.
const out = [];
let j = 0;
let faltas = 0;
for (const w of roteiro) {
  const k = norm(w);
  let hit = -1;
  for (let d = 0; d < 4 && j + d < palavras.length; d++) {
    const p = palavras[j + d].key;
    if (p === k || p.startsWith(k) || k.startsWith(p)) {
      hit = j + d;
      break;
    }
  }
  if (hit >= 0) {
    out.push([palavras[hit].start, palavras[hit].end, w]);
    j = hit + 1;
  } else {
    faltas++;
    const prev = out[out.length - 1];
    const t = prev ? prev[1] : palavras[j]?.start ?? 0;
    out.push([t, t + 0.2, w]);
  }
}

const ts = `// Gerado por tools/palavras.mjs a partir de ${path.basename(file)}. Tempos (início, fim) de cada palavra de LINES.\nexport const VOZ: [number, number][] = [\n${out.map(([a, b, w]) => `  [${a.toFixed(3)}, ${b.toFixed(3)}], // ${w}`).join('\n')}\n];\n`;
fs.writeFileSync(path.join(root, 'src', 'voz.ts'), ts);
console.log(`ok: src/voz.ts com ${out.length} palavras (${palavras.length} na transcrição).`);
if (faltas) console.log(`Atenção: ${faltas} palavra(s) do roteiro não foram achadas no áudio e receberam tempo aproximado. Deixe o roteiro igual ao que foi falado.`);
