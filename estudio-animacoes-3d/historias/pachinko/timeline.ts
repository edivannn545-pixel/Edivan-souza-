// Roteiro e tempos de cada palavra. *palavra* = palavra enfatizada.
// Com voz (voz.ts preenchido e com o mesmo número de palavras), usa os tempos reais.
// Sem voz, estima pelo tamanho das palavras — bom para rascunho, nunca para o render final.
import { VOZ } from './voz.ts';

export const FPS = 30;
export const F = 1 / FPS;

// Roteiro: "O truque do pachinko" (narração gravada pelo próprio autor, igual a este texto).
export const LINES = [
  'No *Japão*, você ouve dizer que jogos de azar são *proibidos*.',
  'Mesmo assim, ao caminhar por uma rua iluminada por letreiros de *neon*,',
  'você encontra uma casa de *pachinko* aberta dia e noite.',
  'Curioso, você *entra*.',
  'Lá dentro, vê fileiras de *máquinas*, luzes piscando e bolinhas caindo sem parar.',
  'Você começa a jogar e, quando *ganha*, recebe um *balde* cheio delas.',
  'Mas, ao sair, você *não* troca as bolinhas por dinheiro.',
  'Primeiro, entrega tudo e escolhe um *prêmio*:',
  'pode ser um *chocolate*, um *xampu* ou um *brinquedo* pequeno.',
  'Então você percebe uma pequena *loja* ali perto.',
  'Na *janela*, alguém compra justamente aquele prêmio.',
  'Você entrega o objeto e recebe *dinheiro* em troca.',
  'A casa de pachinko diz que oferece *apenas* o jogo.',
  'A loja afirma que só compra *prêmios*.',
  'E, quando a *polícia* aparece, você vê que, no papel, tudo parece *separado*.',
  'Você olha para a janelinha e entende o *truque*:',
  'o dinheiro está ali, mas cada etapa acontece em um lugar *diferente*.',
  'No registro, você só *jogou*, ganhou um *prêmio* e o *vendeu*.',
  'No papel, *ninguém* apostou em nada.',
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
