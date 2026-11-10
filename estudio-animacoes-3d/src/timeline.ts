// Roteiro e tempos de cada palavra. *palavra* = palavra enfatizada.
// Com voz (voz.ts preenchido e com o mesmo número de palavras), usa os tempos reais.
// Sem voz, estima pelo tamanho das palavras — bom para rascunho, nunca para o render final.
import { VOZ } from './voz.ts';

export const FPS = 30;
export const F = 1 / FPS;

// Episódio de exemplo — fórmula "E se...?" (gancho → pergunta → ciência → poder → "só que" → dilema → moral → volta ao início → pergunta final).
export const LINES = [
  'Você cai do *skate*, bate a canela na calçada,',
  'e quem *quebra* é a calçada.',
  'E se seus *ossos* fossem de *aço*?',
  'Seu osso já aguenta mais aperto que *concreto*.',
  'Mas o aço pesa quase *quatro* vezes mais.',
  'Seu esqueleto tinha uns *dez* quilos.',
  'Agora? *Quarenta*.',
  'O Bruno, seu rival, chuta sua *canela*.',
  'Quem sai pulando num pé só é *ele*.',
  'Só que seu corpo ganhou *trinta* quilos.',
  'Na balança da escola: *noventa*.',
  'E corpo pesado não *boia*.',
  'Sábado, *piscina* do clube.',
  'A Lara, sua melhor amiga, tem *câimbra* no fundo.',
  'O Bruno grita: pula, *herói*!',
  'Mas se você pular, você *afunda*.',
  'Ficar na borda, ou pular *mesmo* assim?',
  'Você *pula*.',
  'Afunda feito *pedra*, e anda pelo *fundo*.',
  'Segura a Lara e *empurra* ela pra cima.',
  'Ela respira. Você sai pela *escada*, a pé.',
  'Às vezes, quem afunda é quem *levanta* os outros.',
  'Dias depois, você cai do skate de novo, e *ri*.',
  'E você, o que faria com ossos de *aço*?',
  'Comenta aí e se *inscreve*!',
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
