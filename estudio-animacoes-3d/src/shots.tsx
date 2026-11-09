import { JSX } from 'react';
import { lerp, seg, track, V3 } from './anim';
import { CAM, Efeito } from './camera';
import { Avenida, Escritorio, Parque, Pista } from './cenarios';
import { Character, faceAt, Pose, REST } from './Character';
import {
  BotaoInscreva, Cama, Cerebro, CicloDiaNoite, Contador, Cronometro, DEITADO, Despertador, IconeCoracao, IconeFoto, IconeOlho, Jaula, Onibus, Palco,
  PlacaSalta, PontoOnibus, RelogioGrande, Tarefa, XVermelho, Zzz,
} from './historia';
import { BalaoPensamento, BarraProgresso, Caneca, JanelaPersiana, Monitor } from './objetos';
import { NOVOS } from './personagens';
import { Calendar, Clipboard, Comic, dropY, Puff, Sparkles } from './props';
import { Cam } from './sets';
import { W } from './timeline';

// ============================================================================
// "O TEMPO VOA" — tomadas (ver STORYBOARD.md). Narração do usuário (public/voz.mp3), tempos reais em voz.ts.
// Câmera no estilo dos vídeos: CAM.pousa (chega rápido e para de frente), CAM.desce, CAM.recuaRapido.
// ============================================================================

export type ShotProps = { t: number; t0: number; t1: number };
export type Shot = { from: number; name: string; C: (p: ShotProps) => JSX.Element; corte?: boolean };

export const SFX: { at: number; file: string; vol: number }[] = [];

export const EFEITOS: Efeito[] = [
  { tipo: 'velocidade', at: W(0, 'quarenta') },
  { tipo: 'velocidade', at: W(6, 'seis') },
  { tipo: 'flash', at: W(12, 'armadilha') },
  { tipo: 'velocidade', at: W(18, 'alarmes') },
];

const P = (o: Partial<Pose> = {}): Pose => ({ ...REST, ...o });
const LEO = NOVOS.leo.look;
const LEO_POS: V3 = [0, 1.35, -0.3]; // alvo da câmera no Léo atrás da mesa do escritório
const DIGITA = (t: number) => ({ lsx: 1.15 + 0.08 * Math.sin(t * 22), rsx: 1.15 + 0.08 * Math.sin(t * 22 + 2), lel: 0.35, rel: 0.35, hp: 0.12 });

// Hora do relógio de parede ao longo do vídeo: voa durante as falas de "tempo passando".
const horaVoa = (t: number) => 9 + 0.67 * seg(t, W(0, 'olha'), W(0, 'quarenta')) + 1.5 * seg(t, W(9, 'voce'), W(9, 'ate'));

// 1. "Você olha o *relógio*... e perdeu *quarenta* minutos" — mostra o relógio voando e DESCE até o Léo.
const S01 = ({ t, t0, t1 }: ShotProps) => {
  const q = W(0, 'quarenta');
  return (
    <>
      <Escritorio t={t} hora={horaVoa(t)} />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.desce(t0, t1, [0.6, 3.3, -3.05], LEO_POS, W(0, 'perdeu'), { distPlaca: 1.6, dist: 4.2 })} />
      <Character pose={track(t, P({ z: -0.3, hp: -0.25 }), [{ at: q, v: { hp: 0.05, lsz: 0.9, rsz: 0.9, lel: 0.8, rel: 0.8 } }])} face={faceAt(t, [{ at: t0, f: 'lookUp' }, { at: q, f: 'shocked', o: ['sweat'] }], 1)} look={LEO} />
      <PlacaSalta t={t} at={q} texto="-40 MIN" bg="#e02a2a" fg="#ffffff" w={1.05} h={0.42} position={[0.62, 2.62, -0.3]} />
    </>
  );
};

// 2. "A *reunião* começou." — sala: chefe batendo o pé, colegas esperando, cadeira vazia.
const S02 = ({ t, t0, t1 }: ShotProps) => {
  const r = W(1, 'reuniao');
  return (
    <>
      <Escritorio t={t} hora={9.7} />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [-0.1, 1.4, -1.3], { dist: 5.4, de: 'lado' })} />
      <Character pose={track(t, P({ x: -0.2, z: -1.6, rsx: 1.1, rel: 1.5, hp: 0.15 }), [{ at: r, v: { ltap: 0.6 } }])} face={faceAt(t, [{ at: t0, f: 'annoyed', o: ['vein'] }], 2)} look={NOVOS.moraes.look} />
      <Character pose={P({ x: -1.5, z: -1.1, ry: 0.4 })} face={faceAt(t, [{ at: t0, f: 'bored' }], 3)} look={NOVOS.tati.look} />
      <Character pose={P({ x: 1.2, z: -1.1, ry: -0.4 })} face={faceAt(t, [{ at: t0, f: 'sleepy' }], 4)} look={NOVOS.arlindo.look} />
    </>
  );
};

// 3. "O *ônibus* já passou." — rua: o ônibus vai embora, o Léo chega correndo no ponto.
const S03 = ({ t, t0, t1 }: ShotProps) => {
  const pa = W(2, 'passou');
  const corre = seg(t, t0, pa);
  const x = lerp(-2.4, -0.9, corre);
  return (
    <>
      <Avenida t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [-0.8, 1.5, 0.2], { dist: 6.4, de: 'longe' })} />
      <PontoOnibus position={[-3.3, 0, 0.1]} />
      <Onibus x={lerp(1.0, 8, seg(t, t0, t1 + 0.6, (k) => k * k))} z={-2.6} />
      <Character pose={track(t, P({ x, z: 0.2, ry: 1.1, walk: (x + 2.4) / 0.24, stride: corre < 1 ? 1 : 0, lean: 0.2, z: 0.7 }), [{ at: pa, v: { lsz: 2.4, rsz: 2.4, lel: 0.3, rel: 0.3, lean: 0 } }])} face={faceAt(t, [{ at: t0, f: 'panic', o: ['sweat'] }, { at: pa, f: 'frustrated', o: ['sweat3'] }], 5)} look={LEO} />
      <Puff t={t} at={t0 + 0.3} position={[3.5, 0.3, 1.6]} color="#c8c0b0" />
    </>
  );
};

// 4. "E você jurava que tinha acabado de *sentar*." — no escritório, confuso; o balão lembra "acabei de sentar".
const S04 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Escritorio t={t} hora={horaVoa(t)} />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0, 1.6, -0.3], { dist: 3.8, de: 'perto' })} />
    <Character pose={track(t, P({ z: -0.3 }), [{ at: W(3, 'jurava'), v: { rsx: 1.1, rel: 1.6, hy: 0.25 } }, { at: W(3, 'sentar'), v: { squash: 0.35, rsx: 0, rel: 0.15 } }])} face={faceAt(t, [{ at: t0, f: 'confused' }, { at: W(3, 'sentar'), f: 'unsure', o: ['sweat'] }], 6)} look={LEO} />
    <BalaoPensamento t={t} at={W(3, 'jurava')} texto={'ACABEI DE\nSENTAR!'} hold={9} size={0.85} position={[0.72, 2.95, -0.2]} />
  </>
);

// 5. "Normalmente, uma hora no *relógio*" — palco: relógio grande andando no ritmo normal.
const S05 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Palco cor="#2f5f7a" />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [-0.2, 1.9, 0], { dist: 6.2, de: 'cima' })} />
    <RelogioGrande minutos={(t - t0) * 2} horas={10} tamanho={1.4} position={[0.4, 2.1, -0.6]} />
    <Character pose={P({ x: -1.0, z: 1.0, ry: 0.3, hy: 0.3, hp: -0.2 })} face={faceAt(t, [{ at: t0, f: 'curious' }, { at: W(4, 'relogio'), f: 'smile' }], 7)} look={LEO} />
  </>
);

// 6. "continua tendo *sessenta* minutos." — o contador chega em 60 na palavra.
const S06 = ({ t, t0, t1 }: ShotProps) => {
  const s = W(4, 'sessenta');
  return (
    <>
      <Palco cor="#2f5f7a" />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [-0.25, 2.0, 0], { dist: 6.0, de: 'lado' })} />
      <RelogioGrande minutos={60 * seg(t, t0, s)} horas={10 + seg(t, t0, s)} tamanho={1.2} position={[0, 2.8, -1.2]} />
      <Contador t={t} from={t0} at={s} para={60} sufixo=" MIN" position={[0.45, 1.15, 0.2]} scale={0.85} />
      <Character pose={P({ x: -1.15, z: 1.3, ry: 0.4 })} face={faceAt(t, [{ at: t0, f: 'content' }], 8)} look={LEO} />
    </>
  );
};

// 7. "Mas, na sua percepção, ela *encolhe* para *dez*." — o relógio encolhe e o contador desce para 10.
const S07 = ({ t, t0, t1 }: ShotProps) => {
  const enc = W(5, 'encolhe'), dez = W(5, 'dez');
  const tam = lerp(1.2, 0.5, seg(t, enc - 0.2, dez));
  return (
    <>
      <Palco cor="#5a3f8a" />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [-0.25, 2.0, 0], { dist: 6.0, de: 'longe' })} />
      <RelogioGrande minutos={(t - t0) * 9} horas={11} tamanho={tam} position={[0, 2.8, -1.2]} />
      <Contador t={t} from={W(5, 'ela')} at={dez} de={60} para={10} sufixo=" MIN" cor="#5ce07a" position={[0.45, 1.15, 0.2]} scale={0.85} />
      <Character pose={track(t, P({ x: -1.15, z: 1.3, ry: 0.4 }), [{ at: dez, v: { lsz: 0.8, rsz: 0.8, lel: 0.7, rel: 0.7 } }])} face={faceAt(t, [{ at: t0, f: 'thinking' }, { at: dez, f: 'amazed' }], 9)} look={LEO} />
    </>
  );
};

// 8. "Isso é *seis* vezes mais rápido." — IMPACTO: placa ×6 + linhas de velocidade, relógio girando rápido.
const S08 = ({ t, t0, t1 }: ShotProps) => {
  const s = W(6, 'seis');
  return (
    <>
      <Palco cor="#c8572b" />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.impacto(t0, s, t1, [0, 1.9, 0], { de: 6.4, para: 4.4, giro: 0.08 })} />
      <RelogioGrande minutos={(t - t0) * 60} horas={(t - t0) * 5} tamanho={1.0} position={[0, 3.1, -1.4]} />
      <PlacaSalta t={t} at={s} texto="×6" w={1.1} h={0.8} position={[0.42, 2.2, 0.5]} />
      <Character pose={track(t, P({ x: -0.8, z: 0.5, ry: 0.25 }), [{ at: s, v: { lsz: 2.4, rsz: 2.4, lel: 0.3, rel: 0.3 } }])} face={faceAt(t, [{ at: t0, f: 'surprised' }, { at: s, f: 'starstruck' }], 10)} look={LEO} />
    </>
  );
};

// 9. "Seu *cérebro* não mede o tempo como um *cronômetro*." — travelling do cérebro até o cronômetro, que leva um X.
const S09 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Palco cor="#2f7a6a" />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.lateral(t0, W(7, 'cronometro'), [-1.1, 2.0, 0], [1.2, 1.9, 0], { dist: 4.6 })} />
    <Cerebro position={[-1.1, 2.0, 0]} scale={1.15} />
    <Cronometro t={t} position={[1.2, 1.9, 0]} scale={1.2} />
    <XVermelho t={t} at={W(7, 'cronometro')} position={[1.2, 1.9, 0.3]} />
  </>
);

// 10. "*Atenção*, *emoção* e *memória* mudam sua estimativa." — ícones saltam em cima do cérebro, cada um na sua palavra.
const S10 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Palco cor="#2f7a6a" />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0, 2.4, 0], { dist: 6.2, de: 'baixo' })} />
    <Cerebro position={[0, 1.7, 0]} scale={1.1} />
    <IconeOlho t={t} at={W(8, 'atencao')} position={[-1.35, 3.0, 0.2]} />
    <IconeCoracao t={t} at={W(8, 'emocao')} position={[0, 3.45, 0.2]} />
    <IconeFoto t={t} at={W(8, 'memoria')} position={[1.35, 3.0, 0.2]} />
    <Sparkles t={t} from={W(8, 'estimativa')} n={8} radius={1.2} center={[0, 2.2, 0.4]} />
  </>
);

// 11. "Quando está *concentrado*," — Léo digitando, focado; o relógio atrás começa a voar.
const S11 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Escritorio t={t} hora={horaVoa(t)} />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0.2, 1.5, -0.3], { dist: 4.6, de: 'lado', yaw: 0.25 })} />
    <Monitor position={[-0.45, 0.8, 0.6]} rotation={[0, Math.PI - 0.5, 0]} />
    <Character pose={P({ z: -0.3, ry: -0.35, ...DIGITA(t) })} face={faceAt(t, [{ at: t0, f: 'thinking' }, { at: W(9, 'concentrado'), f: 'deadpan' }], 11)} look={LEO} />
  </>
);

// 12. "você pode deixar de notar os minutos..." — insert: o relógio de parede girando sem parar.
const S12 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Escritorio t={t} hora={horaVoa(t)} />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0.6, 3.25, -3.05], { dist: 1.9, de: 'perto' })} />
  </>
);

// 13. "até olhar para *cima*." — câmera baixa: o Léo levanta a cabeça e leva um susto.
const S13 = ({ t, t0, t1 }: ShotProps) => {
  const c = W(9, 'cima');
  return (
    <>
      <Escritorio t={t} hora={horaVoa(t)} />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0, 1.55, -0.3], { dist: 3.8, de: 'baixo', pitch: -0.18 })} />
      <Character pose={track(t, P({ z: -0.3, ...DIGITA(t0) }), [{ at: c, v: { hp: -0.45, lsx: 0.3, rsx: 0.3, lel: 0.2, rel: 0.2 } }])} face={faceAt(t, [{ at: t0, f: 'deadpan' }, { at: c, f: 'lookUp' }], 12)} look={LEO} />
    </>
  );
};

// 14. "Que *horas* são?" — confuso, balão "?".
const S14 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Escritorio t={t} hora={horaVoa(t)} />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0, 1.65, -0.3], { dist: 3.4, de: 'outroLado' })} />
    <Character pose={P({ z: -0.3, hr: 0.18, rsx: 1.1, rel: 1.6 })} face={faceAt(t, [{ at: t0, f: 'confused', o: ['sweat'] }], 13)} look={LEO} />
    <BalaoPensamento t={t} at={W(10, 'horas')} texto="?" position={[0.95, 2.85, -0.2]} />
  </>
);

// 15. "Você não *sabe*." — encolhe os ombros.
const S15 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Escritorio t={t} hora={horaVoa(t)} />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, LEO_POS, { dist: 4.6, de: 'longe' })} />
    <Character pose={track(t, P({ z: -0.3 }), [{ at: W(11, 'sabe'), v: { lsz: 1.2, rsz: 1.2, lel: 1.2, rel: 1.2, squash: 0.15, hr: 0.15 } }])} face={faceAt(t, [{ at: t0, f: 'unsure' }, { at: W(11, 'sabe'), f: 'deadpan' }], 14)} look={LEO} />
  </>
);

// 16. "Uma tarefa simples vira uma *armadilha*." — a tarefa de 5 minutos e PUM: a jaula cai.
const S16 = ({ t, t0, t1 }: ShotProps) => {
  const a = W(12, 'armadilha');
  return (
    <>
      <Palco cor="#b8862f" />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0.3, 1.6, 0], { dist: 6.4, de: 'lado' })} />
      <Tarefa position={[1.3, 0, -0.2]} rotation={[0, -0.4, 0]} />
      <Character pose={track(t, P({ x: -0.3, z: 0.2, ry: 0.5, hy: 0.4 }), [{ at: a, v: { lsz: 2.2, rsz: 2.2, lel: 0.4, rel: 0.4, squash: 0.2, hy: 0 } }])} face={faceAt(t, [{ at: t0, f: 'confident' }, { at: a, f: 'shocked', o: ['sweat3'] }], 15)} look={LEO} />
      <Jaula y={dropY(t, a, 5, 0)} position={[-0.3, 0, 0.2]} />
      <Comic t={t} at={a} text="TUM!" position={[0.9, 3.0, 0.4]} size={0.4} />
      <Puff t={t} at={a} position={[-0.3, 0.1, 0.4]} n={8} />
    </>
  );
};

// 17. "Você perde *compromissos*," — o calendário vira as folhas até "PERDEU!".
const S17 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Palco cor="#7a3a5a" />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0.2, 1.7, 0], { dist: 5.6, de: 'cima' })} />
    <Calendar t={t} from={t0} at={W(13, 'esquece')} pages={['REUNIÃO', 'DENTISTA', 'ANIVER.', 'PROVA', 'PERDEU!']} position={[0.95, 1.6, 0]} rotation={[0, -0.25, 0]} scale={1.0} />
    <Character pose={P({ x: -0.9, z: 0.3, ry: 0.4, rsx: 1.1, rel: 1.6 })} face={faceAt(t, [{ at: t0, f: 'worried', o: ['sweat'] }], 16)} look={LEO} />
  </>
);

// 18. "*esquece* pausas" — a Tati oferece um café; o Léo nem vê, continua digitando.
const S18 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Escritorio t={t} hora={13} />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0.5, 1.4, -0.2], { dist: 4.8, de: 'outroLado' })} />
    <Monitor position={[-0.45, 0.8, 0.6]} rotation={[0, Math.PI - 0.5, 0]} />
    <Character pose={P({ z: -0.3, ry: -0.35, ...DIGITA(t) })} face={faceAt(t, [{ at: t0, f: 'deadpan' }], 17)} look={LEO} />
    <Character pose={P({ x: 1.3, z: 0.1, ry: -0.9, rsx: 1.2, rel: 0.6 })} face={faceAt(t, [{ at: t0, f: 'happy' }, { at: W(13, 'pausas'), f: 'annoyed' }], 18)} look={NOVOS.tati.look} />
    <Caneca position={[0.92, 1.12, 0.35]} cor="#c8352f" />
  </>
);

// 19. "e *calcula* mal quanto *falta* para chegar." — andando na rua, achando que está "quase lá" (barra em 30%).
const S19 = ({ t, t0, t1 }: ShotProps) => {
  const x = lerp(-1.5, 0.6, seg(t, t0, t1, (k) => k));
  return (
    <>
      <Parque />
      <Cam t={t} t0={t0} t1={t1} keys={[[t, [x * 0.7 + 0.6, 2.0, 5.6], [x * 0.8 + 0.3, 1.7, 0.2], 34]]} />
      <Character pose={P({ x, z: 0.2, ry: 1.2, walk: (x + 1.5) / 0.24, stride: 1 })} face={faceAt(t, [{ at: t0, f: 'confident' }], 19)} look={LEO} />
      <BalaoPensamento t={t} at={W(13, 'calcula')} texto={'QUASE\nLÁ!'} hold={9} size={0.95} position={[x + 0.8, 2.9, 0.2]} />
      <BarraProgresso t={t} from={W(13, 'calcula')} at={W(13, 'falta')} valor={0.3} cor="#ff8a2a" position={[x * 0.8, 3.75, -0.2]} scale={0.7} />
    </>
  );
};

// 20. "Mas o relógio *biológico* não acelera junto." — disco de dia/noite girando devagar ao lado de um relógio que voa.
const S20 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Palco cor="#24324f" noite />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0.2, 2.0, 0], { dist: 6.2, de: 'cima' })} />
    <CicloDiaNoite giro={(t - t0) * 0.08} position={[-0.5, 2.3, -0.3]} />
    <RelogioGrande minutos={(t - t0) * 120} horas={(t - t0) * 10} tamanho={0.5} position={[1.0, 3.75, -0.6]} />
    <Character pose={P({ x: 1.0, z: 0.8, ry: -0.3, hy: -0.4, hp: -0.25 })} face={faceAt(t, [{ at: t0, f: 'curious' }, { at: W(14, 'biologico'), f: 'thinking' }], 20)} look={LEO} />
  </>
);

// 21. "Seu ciclo diário continua perto de *vinte* e quatro horas..." — uma volta do disco; o contador chega a 24 H.
const S21 = ({ t, t0, t1 }: ShotProps) => {
  const q = W(15, 'quatro');
  return (
    <>
      <Palco cor="#24324f" noite />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0, 2.1, 0], { dist: 6.0, de: 'lado' })} />
      <CicloDiaNoite giro={Math.PI * 2 * seg(t, t0, q)} position={[0, 2.8, -0.6]} />
      <Contador t={t} from={t0} at={q} para={24} sufixo=" H" position={[0, 1.1, 0.4]} />
    </>
  );
};

// 22. "e seu corpo ainda precisa *dormir*." — quarto à noite: deitado na cama, Zzz.
const S22 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Palco cor="#1e2a4a" noite />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0, 0.9, -0.2], { dist: 4.6, de: 'cima', pitch: 0.55 })} />
    <JanelaPersiana noite position={[1.6, 2.2, -2.2]} />
    <Cama position={[0, 0, 0]} />
    <group position={[0, 0.62, 1.05]} rotation={DEITADO}>
      <Character pose={P({ lsz: 0.25, rsz: 0.25 })} face={faceAt(t, [{ at: t0, f: 'tired' }, { at: W(15, 'dormir'), f: 'sleepy' }], 21)} look={LEO} />
    </group>
    {t > W(15, 'dormir') - 0.2 && <Zzz t={t} position={[0.4, 1.2, -0.9]} />}
  </>
);

// 23. "Aí vem o *custo*:" — placa salta.
const S23 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Palco cor="#7a2a2a" />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0.2, 1.8, 0], { dist: 5.4, de: 'longe' })} />
    <PlacaSalta t={t} at={W(16, 'custo')} texto="O CUSTO" bg="#ffd23a" w={1.9} h={0.7} position={[0.6, 2.75, 0]} />
    <Character pose={P({ x: -0.3, z: 0.4, rsx: 1.1, rel: 1.6 })} face={faceAt(t, [{ at: t0, f: 'worried' }, { at: W(16, 'custo'), f: 'nervous', o: ['sweat'] }], 22)} look={LEO} />
  </>
);

// 24. "você sente que o dia mal *começou*," — manhã: espreguiça feliz, janela de dia.
const S24 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Escritorio t={t} hora={9} />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0.6, 1.8, -0.8], { dist: 5.0, de: 'lado' })} />
    <Character pose={track(t, P({ z: -0.3 }), [{ at: W(16, 'comecou'), v: { lsz: 2.6, rsz: 2.6, lel: 0.2, rel: 0.2, hp: -0.15 } }])} face={faceAt(t, [{ at: t0, f: 'happy' }, { at: W(16, 'comecou'), f: 'closedSmile' }], 23)} look={LEO} />
  </>
);

// 25. "enquanto a *noite* já chegou." — mesmo lugar: a janela vira noite e o escritório esfria; susto.
const S25 = ({ t, t0, t1 }: ShotProps) => {
  const n = W(16, 'noite');
  const noite = t >= n - 0.1;
  return (
    <>
      <Escritorio t={t} hora={noite ? 21 : 9.2} noite={noite} clima={noite ? 'frio' : 'dia'} />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [-0.5, 2.0, -1.4], { dist: 5.2, de: 'perto' })} />
      <Character pose={track(t, P({ z: -0.3, lsz: 2.6, rsz: 2.6, lel: 0.2, rel: 0.2 }), [{ at: n, v: { lsz: 0.4, rsz: 0.4, lsx: 1.1, rsx: 1.1, lel: 1.7, rel: 1.7 } }])} face={faceAt(t, [{ at: t0, f: 'closedSmile' }, { at: n, f: 'terrified', o: ['sweat3'] }], 24)} look={LEO} />
    </>
  );
};

// 26. "Será que dá para *confiar* na própria rotina?" — prancheta da rotina na mão, desconfiado.
const S26 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Palco cor="#3a5a8a" />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0, 1.7, 0], { dist: 4.8, de: 'outroLado' })} />
    <Character pose={P({ x: -0.2, z: 0.3, rsx: 1.05, rel: 1.1, hp: 0.25 })} face={faceAt(t, [{ at: t0, f: 'suspicious' }, { at: W(17, 'confiar'), f: 'unsure' }], 25)} look={LEO} right={<Clipboard text={'ROTINA\n✓\n✗\n?'} position={[0, -0.12, 0.05]} rotation={[1.1, 0, 0]} />} />
    <BalaoPensamento t={t} at={W(17, 'confiar')} texto="?" position={[0.8, 2.95, 0.3]} />
  </>
);

// 27. "Você viveria *correndo* atrás do tempo..." — o relógio rola pela rua e o Léo corre atrás.
const S27 = ({ t, t0, t1 }: ShotProps) => {
  const k = seg(t, t0, t1, (x) => x);
  const xr = lerp(0.2, 4.2, k);
  const xl = lerp(-2.6, 1.4, k);
  return (
    <>
      <Pista />
      <Cam t={t} t0={t0} t1={t1} keys={[[t, [xl + 1.6, 2.0, 7.2], [xl + 1.4, 1.5, 0.3], 34]]} />
      <RelogioGrande minutos={(t - t0) * 30} horas={(t - t0) * 3} tamanho={0.95} position={[xr, 0.95, 0.3]} rotation={[0, 0, -(xr - 0.2) / 0.95]} />
      <Character pose={P({ x: xl, z: 0.3, ry: Math.PI / 2 - 0.3, walk: (xl + 2.6) / 0.2, stride: 1, lean: 0.3, lsx: 0.9, rsx: -0.5, lel: 1.2, rel: 1.2 })} face={faceAt(t, [{ at: t0, f: 'panic', o: ['sweat3'] }], 26)} look={LEO} />
    </>
  );
};

// 28. "ou colocaria *alarmes* para tudo?" — a mesa cheia de despertadores tocando ao mesmo tempo.
const POS_ALARMES: V3[] = [[-0.75, 0.79, 0.75], [-0.35, 0.79, 0.9], [0.35, 0.79, 0.85], [0.75, 0.79, 0.7], [-1.3, 0, 0.6], [1.3, 0, 0.5], [-1.0, 0, -0.9], [1.1, 0, -0.9], [0, 0.79, 1.05]];
const S28 = ({ t, t0, t1 }: ShotProps) => {
  const a = W(18, 'alarmes');
  return (
    <>
      <Escritorio t={t} hora={horaVoa(t)} />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0, 1.3, 0.1], { dist: 5.0, de: 'longe' })} />
      <Character pose={track(t, P({ z: -0.3 }), [{ at: a, v: { lsx: 0.7, rsx: 0.7, lsz: 1.2, rsz: 1.2, lel: 2.0, rel: 2.0, squash: 0.2 } }])} face={faceAt(t, [{ at: t0, f: 'curious' }, { at: a, f: 'panic', o: ['stress'] }], 27)} look={LEO} />
      {POS_ALARMES.map((p, i) => (
        <Despertador key={i} t={t} toca={a + i * 0.05} semente={i} cor={['#c8352f', '#2f6fb3', '#3aa14a', '#f2b632'][i % 4]} position={p} rotation={[0, (i % 3) * 0.3 - 0.3, 0]} />
      ))}
    </>
  );
};

// 29. "Se *inscreva* e escolha o próximo poder." — aperta o botão; no fim, a câmera fecha no relógio (volta ao começo).
const S29 = ({ t, t0, t1 }: ShotProps) => {
  const ins = W(19, 'inscreva'), pod = W(19, 'proximo');
  const aperta = seg(t, ins - 0.15, ins) * (1 - seg(t, ins + 0.25, ins + 0.45));
  const abre = CAM.pousa(t0, pod, [0.2, 1.6, 0.2], { dist: 5.0, de: 'cima' });
  const fecha = CAM.pousa(pod, t1, [0, 3.0, -1.4], { dist: 1.6, de: 'longe' });
  return (
    <>
      <Palco cor="#2f5f7a" />
      <Cam t={t} t0={t0} t1={t1} keys={t < pod ? abre : [abre[2], fecha[1], fecha[2]]} />
      <RelogioGrande minutos={(t - t0) * 8} horas={9} tamanho={0.8} position={[0, 3.0, -1.4]} />
      <BotaoInscreva aperta={aperta} inscrito={t > ins + 0.3} position={[0.7, 0, 0.8]} />
      <Character pose={track(t, P({ x: -0.6, z: 0.6, ry: 0.5 }), [{ at: ins, v: { rsx: 1.0, rsz: 0.1, rel: 0.2, lean: 0.25 }, lead: 0 }, { at: ins + 0.5, v: { rsx: 0, rel: 0.15, lean: 0, lsz: 2.3, lel: 0.3 } }])} face={faceAt(t, [{ at: t0, f: 'grin' }, { at: ins + 0.4, f: 'bigSmile', o: ['sparkle'] }], 28)} look={LEO} />
      <Sparkles t={t} from={ins + 0.3} n={10} radius={1.1} center={[0.6, 1.0, 0.9]} />
    </>
  );
};

export const SHOTS: Shot[] = [
  { from: 0, name: '01 relogio', C: S01 },
  { from: W(1, 0), name: '02 reuniao', C: S02 },
  { from: W(2, 0), name: '03 onibus', C: S03 },
  { from: W(3, 0), name: '04 sentar', C: S04 },
  { from: W(4, 0), name: '05 uma hora', C: S05 },
  { from: W(4, 'continua'), name: '06 sessenta', C: S06 },
  { from: W(5, 0), name: '07 encolhe', C: S07 },
  { from: W(6, 0), name: '08 seis', C: S08, corte: true },
  { from: W(7, 0), name: '09 cerebro', C: S09 },
  { from: W(8, 0), name: '10 atencao', C: S10 },
  { from: W(9, 0), name: '11 concentrado', C: S11 },
  { from: W(9, 'voce'), name: '12 minutos', C: S12 },
  { from: W(9, 'ate'), name: '13 cima', C: S13 },
  { from: W(10, 0), name: '14 horas', C: S14 },
  { from: W(11, 0), name: '15 sabe', C: S15 },
  { from: W(12, 0), name: '16 armadilha', C: S16 },
  { from: W(13, 0), name: '17 compromissos', C: S17 },
  { from: W(13, 'esquece'), name: '18 pausas', C: S18 },
  { from: W(13, 5), name: '19 falta', C: S19 },
  { from: W(14, 0), name: '20 biologico', C: S20 },
  { from: W(15, 0), name: '21 vinte e quatro', C: S21 },
  { from: W(15, 'corpo') - 0.3, name: '22 dormir', C: S22 },
  { from: W(16, 0), name: '23 custo', C: S23 },
  { from: W(16, 'voce'), name: '24 dia', C: S24 },
  { from: W(16, 'enquanto'), name: '25 noite', C: S25 },
  { from: W(17, 0), name: '26 rotina', C: S26 },
  { from: W(18, 0), name: '27 correndo', C: S27 },
  { from: W(18, 'ou'), name: '28 alarmes', C: S28 },
  { from: W(19, 0), name: '29 inscreva', C: S29 },
];
