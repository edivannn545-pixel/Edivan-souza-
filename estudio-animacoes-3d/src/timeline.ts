// Roteiro e tempos de cada palavra. *palavra* = palavra enfatizada.
// Com voz (voz.ts preenchido e com o mesmo número de palavras), usa os tempos reais.
// Sem voz, estima pelo tamanho das palavras — bom para rascunho, nunca para o render final.
import { VOZ } from './voz.ts';

export const FPS = 30;
export const F = 1 / FPS;

// Roteiro: "A batata na França de 1780" (narração gravada pelo próprio autor, igual a este texto).
export const LINES = [
  'Você vive na *França* por volta de *mil* setecentos e oitenta.',
  'A comida começa a *faltar*, e muita gente passa *fome*.',
  'Mesmo assim, há *batatas* sobrando nos campos.',
  'O problema é que quase *ninguém* quer comê-las.',
  'Você ouve que elas fazem *mal* e que podem até causar *doenças*.',
  'Um homem tenta convencer a população de que a batata é *nutritiva*, mas ninguém *acredita*.',
  'Então ele procura o *rei* e recebe uma *missão*:',
  'fazer o povo *aceitar* aquele alimento.',
  'Com o apoio da *corte*, ele consegue um *terreno* e organiza uma *plantação*.',
  'Durante o dia, *guardas* protegem as batatas como se fossem um *tesouro*.',
  'Ao ver tanta *vigilância*, você começa a pensar que aquele alimento deve ter muito *valor*.',
  'À *noite*, os guardas deixam o campo menos protegido, e as pessoas entram para *pegar* algumas batatas.',
  'A estratégia dá *certo*:',
  'você leva batatas para *casa*, planta mais e começa a *comê-las*.',
  'Aos poucos, aquilo que muita gente *rejeitava* vira parte da *mesa* francesa.',
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
