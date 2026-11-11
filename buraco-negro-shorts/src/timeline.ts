// Roteiro e tempos de cada palavra. *palavra* = palavra enfatizada.
// Com voz (voz.ts preenchido e com o mesmo número de palavras), usa os tempos reais.
// Sem voz, estima pelo tamanho das palavras — bom para rascunho, nunca para o render final.
import { VOZ } from './voz.ts';

export const FPS = 30;
export const F = 1 / FPS;

// Roteiro: What If You Fell Into a Black Hole?
export const LINES = [
  "If you fell into a *black* *hole*, your body would be *stretched* like a *noodle*.",
  "And scientists actually have a *name* for it.",
  "Let's say you're *floating* in space, and you get too *close*.",
  "At first, *nothing* feels wrong.",
  "But a black hole's *gravity* is so strong that *nothing* can escape it.",
  "Not *you*. Not even *light*.",
  "As you fall, gravity pulls on your *feet* much harder than your *head*.",
  "You start to *stretch*. *Longer*. *Thinner*.",
  "Scientists call it *spaghettification*.",
  "But here's where it gets *weird*.",
  "Your *friend* is watching from a *spaceship* far away.",
  "To them, you *never* actually fall in.",
  "You *slow* down. You *freeze* at the edge.",
  "And your image slowly fades into *red*, until it *disappears*.",
  "For you, though, time feels completely *normal*.",
  "You keep *falling*.",
  "You cross the *event* *horizon*, the point of *no* *return*.",
  "From here, there is *no* way *back*.",
  "Every *direction* now points to one place, the *center*.",
  "Now, if you picked a *giant* black hole, like the one at the center of our *galaxy*, things would be different.",
  "Its edge is so *big* that you could cross it without feeling a *thing*.",
  "At least, at *first*.",
  "But eventually, you reach the *center*.",
  "The *singularity*.",
  "A place where our *laws* of physics simply *break* down.",
  "What happens there? *Nobody* *knows*.",
  "Not even the *smartest* scientists on *Earth*.",
  "So, here's the *question*.",
  "If you could *jump* into a black hole and finally learn the *answer*,",
  "but never come *back*, would you *do* it?",
  "*Comment* below.",
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
export const END = WORDS[WORDS.length - 1].t1 + 2.6;

// Tempo de início de uma palavra: W(linha, índice) ou W(linha, 'texto').
export const W = (line: number, w: number | string = 0): number => {
  const ws = WORDS.filter((x) => x.line === line);
  const hit = typeof w === 'number' ? ws[w] : ws.find((x) => x.key.startsWith(norm(w)));
  if (!hit) throw new Error(`Palavra não encontrada: ${line} ${w}`);
  return hit.t0;
};
