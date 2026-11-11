// Roteiro e tempos de cada palavra. *palavra* = palavra enfatizada.
// Com voz (voz.ts preenchido e com o mesmo número de palavras), usa os tempos reais.
// Sem voz, estima pelo tamanho das palavras — bom para rascunho, nunca para o render final.
import { VOZ } from './voz.ts';

export const FPS = 30;
export const F = 1 / FPS;

// Roteiro: What if you traveled at the speed of light?
export const LINES = [
  "What if you traveled at the speed of *light?*",
  "Dr. Teo just finished the *fastest* ship in the *world.*",
  "And *guess* who he picked to fly it?",
  "*You.*",
  "*Light* travels *300,000* kilometers per second.",
  "In *one* second, you could circle the *Earth* more than *seven* times.",
  "You would reach the *Moon* in just over *one* second.",
  "And the *Sun* in *eight* minutes.",
  "But here's where it gets *weird.*",
  "The *faster* you go, the *slower* time passes for you.",
  "On the *ship,* the trip lasted just a few *minutes.*",
  "On *Earth,* *years* went by.",
  "You come back *home,* and Dr. Teo has *white* *hair.*",
  "You traveled to the *future,* and there's *no* ticket *back.*",
];

export type Word = { text: string; key: string; stressed: boolean; t0: number; t1: number; line: number; i: number };

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

const build = (): Word[] => {
  const out: Word[] = [];
  let t = 0.2;
  let n = 0;
  const real = VOZ.length > 0 && VOZ.length === LINES.join(' ').split(' ').length;
  LINES.forEach((line, li) => {
    line.split(' ').forEach((raw, i) => {
      const stressed = raw.includes('*');
      const text = raw.replace(/\*/g, '');
      if (real) {
        const [t0, t1] = VOZ[n++];
        out.push({ text, key: norm(text), stressed, t0, t1, line: li, i });
        return;
      }
      const d = 0.05 + 0.05 * norm(text).length + (stressed ? 0.06 : 0);
      out.push({ text, key: norm(text), stressed, t0: t, t1: t + d, line: li, i });
      t += d + (/[,]$/.test(text) ? 0.14 : 0);
    });
    t += 0.3;
  });
  return out;
};

export const WORDS = build();
// +2,6 s depois da última palavra: tempo da tela final (COMENTA AÍ / INSCREVA-SE).
export const END = WORDS[WORDS.length - 1].t1 + 1.2;

// Tempo de início de uma palavra: W(linha, índice) ou W(linha, 'texto').
export const W = (line: number, w: number | string = 0): number => {
  const ws = WORDS.filter((x) => x.line === line);
  const hit = typeof w === 'number' ? ws[w] : ws.find((x) => x.key.startsWith(norm(w)));
  if (!hit) throw new Error(`Palavra não encontrada: ${line} ${w}`);
  return hit.t0;
};
