// Roteiro e tempos de cada palavra. *palavra* = palavra enfatizada.
// Com voz (voz.ts preenchido e com o mesmo número de palavras), usa os tempos reais.
// Sem voz, estima pelo tamanho das palavras — bom para rascunho, nunca para o render final.
import { VOZ } from './voz.ts';

export const FPS = 30;
export const F = 1 / FPS;

// Roteiro: "Superpoder: o tempo voa" — texto do usuário; narração gerada no ElevenLabs (public/voz.mp3).
export const LINES = [
  'Você olha o *relógio*... e perdeu *quarenta* minutos sem perceber.',
  'A *reunião* começou.',
  'O *ônibus* já passou.',
  'E você jurava que tinha acabado de *sentar*.',
  'Normalmente, uma hora no relógio continua tendo *sessenta* minutos.',
  'Mas, na sua percepção, ela encolhe para *dez*.',
  'Isso é *seis* vezes mais rápido.',
  'Seu *cérebro* não mede o tempo como um *cronômetro*.',
  'Atenção, *emoção* e memória mudam sua estimativa.',
  'Quando está *concentrado*, você pode deixar de notar os minutos... até olhar para *cima*.',
  'Que *horas* são?',
  'Você não *sabe*.',
  'Uma tarefa simples vira uma *armadilha*.',
  'Você perde *compromissos*, esquece pausas e calcula mal quanto falta para chegar.',
  'Mas o relógio *biológico* não acelera junto.',
  'Seu ciclo diário continua perto de *vinte* e quatro horas... e seu corpo ainda precisa *dormir*.',
  'Aí vem o *custo*: você sente que o dia mal começou, enquanto a *noite* já chegou.',
  'Será que dá para *confiar* na própria rotina?',
  'Você viveria *correndo* atrás do tempo... ou colocaria *alarmes* para tudo?',
  'Se *inscreva* e escolha o próximo poder.',
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
