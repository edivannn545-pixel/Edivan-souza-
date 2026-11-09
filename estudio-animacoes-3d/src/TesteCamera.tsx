import { AbsoluteFill } from 'remotion';
import { CAM } from './camera';
import { Castelo, Escritorio, Estacao } from './cenarios';
import { Character, faceAt, Pose, REST } from './Character';
import { Montagem } from './Film';
import { BalaoPensamento, Lampada } from './objetos';
import { NOVOS } from './personagens';
import { Cam } from './sets';
import { seg } from './anim';
import type { Shot, ShotProps } from './shots';

// Teste dos movimentos de câmera no estilo dos vídeos (10 s, sem voz): chegada rápida + pouso, desce da placa,
// recua rápido, dissolução longa. Render: npx remotion render src/index.ts TesteCamera out/teste-camera.mp4
const P = (o: Partial<Pose>): Pose => ({ ...REST, ...o });
const LEO = NOVOS.leo.look;

const A = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Estacao t={t} />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.desce(t0, t1, [-3.2, 3.0, -4.8], [0, 1.5, -0.4], 1.1, { distPlaca: 2.6, dist: 4.4 })} />
    <Character pose={P({ x: 0, z: -0.4 })} face={faceAt(t, [{ at: 0, f: 'curious' }, { at: 1.4, f: 'starstruck' }], 1)} look={LEO} />
  </>
);
const B = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Estacao t={t} liga={seg(t, t0 + 0.4, t0 + 1)} />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0, 1.55, -0.4], { dist: 3.2, de: 'cima' })} />
    <Character pose={P({ x: 0, z: -0.4, lsz: 0.5, rsz: 0.5 })} face={faceAt(t, [{ at: 0, f: 'starstruck' }, { at: t0 + 0.6, f: 'shocked', o: ['sweat'] }], 2)} look={LEO} />
  </>
);
const C = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Estacao t={t} neon cidade="TÓQUIO" destino="SÃO PAULO" liga={1} />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0, 1.7, -1.4], { dist: 6.6, de: 'outroLado' })} />
    <Character pose={P({ x: 0, z: -0.4 })} face={faceAt(t, [{ at: 0, f: 'amazed' }], 3)} look={LEO} />
  </>
);
const D = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Escritorio t={t} cargo="CARGO: NÃO FAZER NADA" />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0, 1.35, -0.3], { dist: 4.2, de: 'longe' })} />
    <Character pose={P({ x: 0, z: -0.3 })} face={faceAt(t, [{ at: 0, f: 'neutral' }, { at: t0 + 0.6, f: 'smug' }], 4)} look={LEO} />
    <Lampada t={t} at={t0 + 0.6} position={[0, 2.95, -0.3]} />
  </>
);
const E = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Escritorio t={t} cargo="CARGO: NÃO FAZER NADA" />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [1.6, 1.75, -0.9], { dist: 2.6, de: 'baixo', yaw: -0.2 })} />
    <Character pose={P({ x: 1.6, z: -0.9, ry: -0.25, rsz: 1.3, rel: 0.5 })} face={faceAt(t, [{ at: 0, f: 'laugh' }], 5)} look={NOVOS.moraes.look} />
    <Character pose={P({ x: 0, z: -0.3, ry: 0.4 })} face={faceAt(t, [{ at: 0, f: 'smug' }], 6)} look={LEO} />
  </>
);
const F = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Castelo t={t} />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.recuaRapido(t0, t1, [2.0, 1.45, 0.4], [0.4, 2.4, -2.2], { de: 1.8, para: 9.5 })} />
    <Character pose={P({ x: 0, z: 0.2 })} face={faceAt(t, [{ at: 0, f: 'confident' }], 7)} look={NOVOS.valdo.look} />
  </>
);
const G = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Castelo t={t} />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.pousa(t0, t1, [0, 1.5, 0.2], { dist: 4.0, de: 'lado' })} />
    <Character pose={P({ x: 0, z: 0.2, rsx: 1.1, rel: 1.6 })} face={faceAt(t, [{ at: 0, f: 'confident' }, { at: t0 + 0.5, f: 'thinking' }], 8)} look={NOVOS.valdo.look} />
    <BalaoPensamento t={t} at={t0 + 0.5} texto="?" position={[0.9, 3.0, 0.3]} />
  </>
);

export const TESTE_FIM = 10.4;
const TOMADAS: Shot[] = [
  { from: 0, name: 'desce da placa', C: A },
  { from: 2.3, name: 'pousa de cima', C: B },
  { from: 3.5, name: 'pousa aberto (neon)', C: C },
  { from: 4.7, name: 'pousa de longe', C: D },
  { from: 6.0, name: 'pousa de baixo', C: E },
  { from: 7.2, name: 'recua rápido', C: F },
  { from: 8.6, name: 'pousa de lado', C: G },
];

export const TesteCamera = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Montagem shots={TOMADAS} end={TESTE_FIM} />
  </AbsoluteFill>
);
