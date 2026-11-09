// Roteiro e tempos de cada palavra. *palavra* = palavra enfatizada.
// Com voz (voz.ts preenchido e com o mesmo número de palavras), usa os tempos reais.
// Sem voz, estima pelo tamanho das palavras — bom para rascunho, nunca para o render final.
import { VOZ } from './voz.ts';

export const FPS = 30;
export const F = 1 / FPS;

// Roteiro: "O passarinho da mina" — texto e narração do usuário (public/voz.mp3).
export const LINES = [
  'Você trabalha numa *mina* onde todos passam o dia *cavando*.',
  'Mas, enquanto os outros *suam* no túnel,',
  'você anda de um lado para o outro com uma *gaiola* na mão, assobiando para um *passarinho*.',
  'O *chefe* vê aquilo e perde a *paciência*.',
  'Para ele, você não está fazendo *nada*.',
  'Só que o *pássaro* está ali por um *motivo*.',
  'Ele percebe o *perigo* antes dos homens.',
  'Quando começa a passar *mal* e para de *cantar*,',
  'você entende o aviso: há *gás* no túnel.',
  'Então manda todos *saírem* depressa.',
  'Naquele instante, o chefe percebe que você não era *preguiçoso*.',
  'Enquanto todos cavavam, você *protegia* a equipe.',
  'E aquele pequeno *passarinho* podia salvar a vida de *cada* mineiro.',
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
export const END = WORDS[WORDS.length - 1].t1 + 1.1;

// Tempo de início de uma palavra: W(linha, índice) ou W(linha, 'texto').
export const W = (line: number, w: number | string = 0): number => {
  const ws = WORDS.filter((x) => x.line === line);
  const hit = typeof w === 'number' ? ws[w] : ws.find((x) => x.key.startsWith(norm(w)));
  if (!hit) throw new Error(`Palavra não encontrada: ${line} ${w}`);
  return hit.t0;
};
