// Roteiro e tempos de cada palavra. *palavra* = palavra enfatizada.
// Com voz (voz.ts preenchido e com o mesmo número de palavras), usa os tempos reais.
// Sem voz, estima pelo tamanho das palavras — bom para rascunho, nunca para o render final.
import { VOZ } from './voz.ts';

export const FPS = 30;
export const F = 1 / FPS;

// Roteiro: E se você vivesse em Marte?
export const LINES = [
  "E se você vivesse em *Marte?*",
  "A doutora Yara *construiu* um *foguete.*",
  "E *adivinha* quem vai ser o *primeiro* a morar lá?",
  "*Você!*",
  "Você *abre* a porta e *pula.*",
  "*Uau!*",
  "Você vai *3* vezes mais *alto* do que na Terra.",
  "Marte tem só *1* *terço* da *gravidade* da Terra.",
  "Mas *não* tire o *capacete.*",
  "O *ar* é fino e quase todo é *gás* carbônico.",
  "À *noite,* a temperatura cai para *80* graus *negativos.*",
  "Lá, um *dia* dura *24* horas e *37* minutos.",
  "Mais um *ano,* quase *dois* anos da Terra.",
  "E o *pôr* do sol em Marte?",
  "É *azul.*",
  "Você *liga* para casa.",
  "Mas a sua *mensagem* leva até *20* minutos para chegar.",
  "E aí, você *compraria* uma *passagem* para Marte?",
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
