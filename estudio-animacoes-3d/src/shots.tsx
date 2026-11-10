import { JSX } from 'react';
import { track } from './anim';
import { Character, faceAt, Pose, REST, VOCE } from './Character';
import { Calendar, Comic, LedCounter, MoneyStack, Sparkles } from './props';
import { Cam, Stage, Street } from './sets';
import { W } from './timeline';

// ============================================================================
// TOMADAS DO FILME. Este arquivo é reescrito a cada vídeo a partir do storyboard.
// Cada tomada começa na primeira palavra da frase (ou numa palavra no meio dela),
// e tudo dentro dela é ancorado em palavras com W(linha, 'palavra').
// O exemplo abaixo usa o roteiro de exemplo de timeline.ts.
// ============================================================================

export type ShotProps = { t: number; t0: number; t1: number };
export type Shot = { from: number; name: string; C: (p: ShotProps) => JSX.Element };

// Efeitos sonoros opcionais: arquivos em public/sfx/. Ex.: { at: W(1, 'quinhentos'), file: 'ding.mp3', vol: 0.8 }
export const SFX: { at: number; file: string; vol: number }[] = [];

const P = (o: Partial<Pose> = {}): Pose => ({ ...REST, ...o });

// 1. "Imagine que você *abre* uma padaria."
const S01 = ({ t, t0, t1 }: ShotProps) => {
  const abre = W(0, 'abre');
  const pose = track(t, P({ x: -0.3, ry: 0.2, hy: 0.15 }), [{ at: abre, v: { lsz: 1.25, rsz: 1.25, lel: 0.35, rel: 0.35, hp: -0.08 } }]);
  const face = faceAt(t, [{ at: t0, f: 'smile' }, { at: abre, f: 'bigSmile' }], 1);
  return (
    <>
      <Street placa="PADARIA" />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.4, 2.6, 9.0], [0, 2.4, -3], 32], [abre, [0.1, 1.6, 4.8], [-0.2, 1.35, 0], 32], [t1, [0.3, 1.55, 4.3], [-0.2, 1.35, 0], 32]]} />
      <Character pose={pose} face={face} />
      <Comic t={t} at={abre} text="ABERTO!" position={[0.1, 2.6, 0.3]} size={0.3} />
    </>
  );
};

// 2. "Todo dia, você vende *quinhentos* pães."
const S02 = ({ t, t0, t1 }: ShotProps) => {
  const q = W(1, 'quinhentos');
  const pose = track(t, P({ x: -0.6, ry: 0.35, hy: 0.4 }), [{ at: q, v: { lsz: 1.6, lel: -0.3, lsx: 0.4, hy: 0.55 } }]);
  const face = faceAt(t, [{ at: t0, f: 'curious' }, { at: q, f: 'confident' }], 2);
  return (
    <>
      <Street placa="PADARIA" />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [1.6, 1.6, 5.0], [0.3, 1.5, 0], 32], [t1, [1.1, 1.7, 4.4], [0.35, 1.55, 0], 32]]} />
      <Character pose={pose} face={face} />
      <LedCounter t={t} from={t0} at={q} value={500} position={[0.75, 1.75, 0]} scale={0.55} />
    </>
  );
};

// 3. "Em um *ano*, isso dá"
const S03 = ({ t, t0, t1 }: ShotProps) => {
  const ano = W(2, 'ano');
  const pose = track(t, P({ x: -0.5, ry: 0.4, hy: 0.45, hp: -0.1 }), [{ at: ano, v: { lsz: 0.9, rsz: 0.9, lel: 0.6, rel: 0.6, squash: 0.15 } }]);
  const face = faceAt(t, [{ at: t0, f: 'thinking' }, { at: ano, f: 'surprised' }], 3);
  return (
    <>
      <Street placa="PADARIA" />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [-0.5, 1.5, 5.0], [0.3, 1.5, 0], 32], [t1, [-0.1, 1.55, 4.6], [0.35, 1.5, 0], 32]]} />
      <Calendar t={t} from={t0} at={ano} position={[0.75, 1.3, 0]} rotation={[0, -0.2, 0]} scale={0.8} />
      <Character pose={pose} face={face} />
    </>
  );
};

// 4. "mais de *cento* e oitenta mil!" — palco liso; o contador rola desde "mais" e pousa em "cento"
const S04 = ({ t, t0, t1 }: ShotProps) => {
  const c = W(2, 'cento');
  const pose = track(t, P({ x: -0.6, z: 0.6, ry: 0.45, hy: 0.3 }), [{ at: c, v: { rsz: 2.5, lsz: 2.5, rel: 0.3, lel: 0.3, hp: -0.15 } }]);
  const face = faceAt(t, [{ at: t0, f: 'amazed' }, { at: c, f: 'starstruck', o: ['sparkle'] }], 4);
  return (
    <>
      <Stage color="#2a5466" />
      <Cam t={t} t0={t0} t1={t1} keys={[[t0, [0.7, 1.7, 5.0], [-0.05, 1.4, 0], 32], [t1, [-0.4, 1.6, 5.1], [-0.05, 1.45, 0], 32]]} />
      <LedCounter t={t} from={t0} at={c} value={180000} suffix="+" position={[0.35, 2.4, -0.3]} scale={0.6} />
      <MoneyStack n={9} symbol="R$" position={[0.4, 0.3, 0]} />
      <Character pose={pose} face={face} look={VOCE} />
      <Sparkles t={t} from={c} n={9} radius={0.9} center={[-0.4, 1.6, 0.6]} />
    </>
  );
};

export const SHOTS: Shot[] = [
  { from: 0, name: '01 abre', C: S01 },
  { from: W(1, 0), name: '02 quinhentos', C: S02 },
  { from: W(2, 0), name: '03 ano', C: S03 },
  { from: W(2, 'mais'), name: '04 cento', C: S04 },
];
