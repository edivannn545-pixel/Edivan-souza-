// Roteiro e tempos de cada palavra. *palavra* = palavra enfatizada.
// Com voz (voz.ts preenchido e com o mesmo número de palavras), usa os tempos reais.
// Sem voz, estima pelo tamanho das palavras — bom para rascunho, nunca para o render final.
import { VOZ } from './voz.ts';

export const FPS = 30;
export const F = 1 / FPS;

// Roteiro: "El Niño: a banheira do Pacífico" (narração gravada pelo próprio autor, igual a este texto).
export const LINES = [
  'Imagine o oceano *Pacífico* como uma imensa *banheira*.',
  'Normalmente, os *ventos* empurram a água *quente* pela superfície, levando-a para o outro lado do oceano.',
  'Perto da costa do *Peru*, a água *fria* que vem do fundo sobe até a superfície.',
  'Ela traz *nutrientes* e ajuda a manter muitos *peixes* naquela região.',
  'Mas, quando os ventos *enfraquecem*, esse equilíbrio pode *mudar*.',
  'A água quente se *desloca* e o oceano já não funciona do mesmo jeito.',
  'Com menos água fria subindo, os peixes podem *desaparecer* de algumas áreas,',
  'e a vida de quem depende da *pesca* também pode ser afetada.',
  'A mudança não fica só no *mar*.',
  'O calor e a umidade alteram o caminho das *chuvas*.',
  'Em alguns lugares, pode chover mais e causar *enchentes*.',
  'Em outros, a *seca* pode se prolongar, os rios baixar e o calor *aumentar*.',
  'Enquanto certas áreas da *América* do Sul enfrentam chuvas fortes,',
  'regiões como a *Indonésia* e a *Austrália* podem passar por períodos mais secos, com maior risco de *incêndios*.',
  'No *Brasil*, os efeitos podem variar de uma região para outra:',
  'você pode ver mais *chuva* em alguns lugares e falta de *água* em outros.',
  'Por isso, *cientistas* acompanham as temperaturas do oceano e os *ventos*.',
  'O vídeo mostra uma *previsão* e um *alerta*, mas o impacto depende de onde você mora e de como o fenômeno se desenvolve.',
  'Então, quando o *El Niño* chega, a pergunta não é apenas o que acontece no oceano.',
  'É também: na sua cidade, você vai enfrentar *seca*, *enchente* ou *calorão*?',
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
