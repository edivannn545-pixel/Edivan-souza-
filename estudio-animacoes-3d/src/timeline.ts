// Roteiro e tempos de cada palavra. *palavra* = palavra enfatizada.
// Com voz (voz.ts preenchido e com o mesmo número de palavras), usa os tempos reais.
// Sem voz, estima pelo tamanho das palavras — bom para rascunho, nunca para o render final.
import { VOZ } from './voz.ts';

export const FPS = 30;
export const F = 1 / FPS;

// Roteiro: "O cargo de não fazer nada" (narração gravada pelo próprio autor, igual a este texto).
export const LINES = [
  'No *Japão*, você descobre que pode ser muito difícil *demitir* um funcionário.',
  'Então a empresa encontra uma solução *estranha*:',
  'cria um cargo em que sua única tarefa é *não* fazer *nada*.',
  'Você chega ao *escritório*, senta à mesa e *espera*.',
  'Não recebe *serviço*, não participa das *decisões*',
  'e ninguém parece precisar da sua *ajuda*.',
  'O *relógio* continua andando… tic-tac, tic-tac… e o dia *não* passa.',
  'No começo, talvez você até ache que conseguiu o emprego *perfeito*.',
  'Mas os dias viram *meses*.',
  'Os meses viram *anos*.',
  'Enquanto os outros *trabalham*, você continua no mesmo *lugar*, sem uma tarefa de verdade.',
  'Quando percebe, já está há *oito* anos sem fazer nada.',
  'E então você entende que ficar sem trabalhar também pode *pesar*.',
  'Você se sente *inútil*, *isolado* e *preso* naquele escritório.',
  'Até que, um dia, coloca um pedido de *demissão* sobre a mesa.',
  'Porque receber para não fazer nada pode parecer um *sonho*…',
  'até você perceber que passou anos sem saber para que está *ali*.',
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
