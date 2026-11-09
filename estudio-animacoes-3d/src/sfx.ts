// Efeitos sonoros (biblioteca em public/sfx, gerada por `python3 tools/sfx.py`).
// Regra do estúdio: todo vídeo tem efeitos sonoros — passos quando alguém anda, tic-tac em relógios,
// queda/impacto quando algo cai, vento em lugar aberto, chuva quando chove, etc. — sempre abaixo da voz.
//
// Uso em shots.tsx:  export const SFX: Som[] = [...passos(W(3,0), W(3,'senta')), som('tum', W(12,'pesar')), ...ambiente('vento', 0, W(2,0))];

export type Som = { at: number; file: string; vol: number; dur?: number; loop?: boolean; fade?: number };

// Volumes padrão (a voz fica em 1.0).
export const VOL = { impacto: 0.55, passo: 0.35, tic: 0.3, pop: 0.3, ambiente: 0.16 };

export type Curto = 'passo1' | 'passo2' | 'tic' | 'tac' | 'queda' | 'tum' | 'pop' | 'whoosh' | 'splash' | 'moeda' | 'carimbo' | 'ding' | 'ronco';
export type Ambiente = 'vento' | 'chuva' | 'passaros' | 'mar' | 'cidade' | 'escritorio' | 'grilos';

// Um som curto num instante (ex.: som('queda', W(5,'cai'))).
export const som = (file: Curto, at: number, vol = VOL.impacto): Som => ({ at, file: `${file}.wav`, vol });

// Passos de quem anda entre `de` e `ate` (alternando os dois pés). `cada` = segundos entre passos (~0,4 andando).
export const passos = (de: number, ate: number, cada = 0.4, vol = VOL.passo): Som[] => {
  const out: Som[] = [];
  for (let t = de + 0.05, i = 0; t < ate - 0.05; t += cada, i++) out.push(som(i % 2 ? 'passo2' : 'passo1', t, vol * (0.9 + 0.1 * (i % 3))));
  return out;
};

// Tic-tac de relógio entre `de` e `ate` (um toque por segundo, alternando tic/tac).
export const tictac = (de: number, ate: number, cada = 0.5, vol = VOL.tic): Som[] => {
  const out: Som[] = [];
  for (let t = de, i = 0; t < ate; t += cada, i++) out.push(som(i % 2 ? 'tac' : 'tic', t, vol));
  return out;
};

// Som de ambiente em loop (vento, chuva, pássaros, mar, cidade, escritório) cobrindo [de, ate].
export const ambiente = (file: Ambiente, de: number, ate: number, vol = VOL.ambiente, fade = 0.4): Som[] =>
  ate - de > 0.2 ? [{ at: de, file: `${file}.wav`, vol, dur: ate - de, loop: true, fade }] : [];
