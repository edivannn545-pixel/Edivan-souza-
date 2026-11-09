// Narração com ElevenLabs + tempo de cada palavra, em um passo.
// Precisa da variável de ambiente ELEVENLABS_API_KEY (ou de um arquivo .env com ELEVENLABS_API_KEY=...).
//
//   node tools/voz.mjs --listar [pt]          lista vozes da conta (filtra por idioma/sotaque se passar um termo)
//   node tools/voz.mjs --voz <voice_id>       gera public/voz.mp3 e src/voz.ts a partir de LINES (timeline.ts)
//   opções: --modelo eleven_multilingual_v2 (padrão) | --velocidade 1.1 | --estabilidade 0.4
//
// Os tempos vêm do alinhamento por caractere que a própria API devolve (endpoint with-timestamps),
// então não precisa transcrever o áudio depois.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const envFile = path.join(root, '.env');
if (!process.env.ELEVENLABS_API_KEY && fs.existsSync(envFile)) {
  for (const l of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = l.match(/^\s*ELEVENLABS_API_KEY\s*=\s*(.+?)\s*$/);
    if (m) process.env.ELEVENLABS_API_KEY = m[1].replace(/^["']|["']$/g, '');
  }
}
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error('Falta ELEVENLABS_API_KEY. Crie a chave em elevenlabs.io (Perfil > API Keys) e coloque no arquivo .env do projeto: ELEVENLABS_API_KEY=sua_chave');
  process.exit(2);
}

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const API = 'https://api.elevenlabs.io/v1';
const headers = { 'xi-api-key': KEY, 'Content-Type': 'application/json' };

if (args.includes('--listar')) {
  const termo = (opt('--listar', '') || '').toLowerCase();
  const r = await fetch(`${API}/voices`, { headers });
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${await r.text()}`);
  const { voices } = await r.json();
  for (const v of voices) {
    const info = `${v.name} | ${Object.values(v.labels ?? {}).join(', ')}`;
    if (!termo || info.toLowerCase().includes(termo)) console.log(`${v.voice_id}  ${info}`);
  }
  process.exit(0);
}

const voiceId = opt('--voz');
if (!voiceId) {
  console.error('Passe --voz <voice_id> (veja as opções com: node tools/voz.mjs --listar)');
  process.exit(2);
}

// Texto = roteiro sem os asteriscos de ênfase.
const { LINES } = await import(pathToFileURL(path.join(root, 'src', 'timeline.ts')).href);
const words = LINES.join(' ').replace(/\*/g, '').split(/\s+/).filter(Boolean);
const text = LINES.map((l) => l.replace(/\*/g, '')).join(' ');

const body = {
  text,
  model_id: opt('--modelo', 'eleven_multilingual_v2'),
  voice_settings: { stability: Number(opt('--estabilidade', 0.4)), similarity_boost: 0.8, style: 0.3, speed: Number(opt('--velocidade', 1.05)) },
};
const r = await fetch(`${API}/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, { method: 'POST', headers, body: JSON.stringify(body) });
if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${await r.text()}`);
const data = await r.json();
fs.mkdirSync(path.join(root, 'public'), { recursive: true });
fs.writeFileSync(path.join(root, 'public', 'voz.mp3'), Buffer.from(data.audio_base64, 'base64'));

// Junta os caracteres em palavras (separadas por espaço) e pega início/fim de cada uma.
const al = data.alignment ?? data.normalized_alignment;
const spans = [];
let cur = null;
al.characters.forEach((ch, i) => {
  if (/\s/.test(ch)) {
    if (cur) spans.push(cur);
    cur = null;
  } else if (!cur) cur = [al.character_start_times_seconds[i], al.character_end_times_seconds[i]];
  else cur[1] = al.character_end_times_seconds[i];
});
if (cur) spans.push(cur);

if (spans.length !== words.length) {
  console.error(`Atenção: o áudio tem ${spans.length} palavras e o roteiro ${words.length}. Confira hífens/números escritos com espaço.`);
}
const n = Math.min(spans.length, words.length);
const linhas = spans.slice(0, n).map(([a, b], i) => `  [${a.toFixed(3)}, ${b.toFixed(3)}], // ${words[i]}`);
const ts = `// Gerado por tools/voz.mjs (ElevenLabs, voz ${voiceId}). Tempos (início, fim) de cada palavra de LINES.\nexport const VOZ: [number, number][] = [\n${linhas.join('\n')}\n];\n`;
fs.writeFileSync(path.join(root, 'src', 'voz.ts'), ts);
console.log(`ok: public/voz.mp3 (${spans.length ? spans[spans.length - 1][1].toFixed(1) : 0}s) e src/voz.ts (${n} palavras)`);
