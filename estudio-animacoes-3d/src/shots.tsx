import { JSX } from 'react';
import { easeInOut, lerp, seg, track, V3 } from './anim';
import { CAM, Efeito } from './camera';
import { Character, faceAt, Pose, REST } from './Character';
import { AveEstado, CHEFE, Corte, Monte, Entrada, Gaiola, Gas, KAIO, maoDireita, MINEIRO, Notas, Picareta, TIAO, TONHAO, Tunel } from './historia';
import { Comic, Puff, Sparkles } from './props';
import { Cam } from './sets';
import { F, W } from './timeline';

// ============================================================================
// "O PASSARINHO DA MINA" — tomadas (ver STORYBOARD.md).
// Receitas de câmera em src/camera.ts. Tudo ancorado em palavras com W(linha, 'palavra').
// ============================================================================

export type ShotProps = { t: number; t0: number; t1: number };
export type Shot = { from: number; name: string; C: (p: ShotProps) => JSX.Element; corte?: boolean };

export const SFX: { at: number; file: string; vol: number }[] = [];

// Estouros de linhas de velocidade e clarões nas viradas da história.
export const EFEITOS: Efeito[] = [
  { tipo: 'velocidade', at: W(3, 'paciencia') },
  { tipo: 'velocidade', at: W(8, 'aviso') },
  { tipo: 'flash', at: W(9, 'sairem'), cor: '#ffffff' },
];

const P = (o: Partial<Pose> = {}): Pose => ({ ...REST, ...o });
const SEGURA = { rsz: 0.2, rsx: 1.3, rel: 0.9 }; // mão na altura da cintura, na frente // braço direito segurando a gaiola na frente
const ganchoDe = (p: Pose): V3 => {
  const m = maoDireita(p);
  return [m[0], m[1] - 0.04, m[2]];
};
const centroGaiola = (topo: V3): V3 => [topo[0], topo[1] - 0.38, topo[2]];

// Golpe de picareta em ciclo (função pura de t). Devolve a pose dos braços e o instante do último golpe.
const cava = (t: number, fase: number, ritmo = 1.4) => {
  const c = (((t * ritmo + fase) % 1) + 1) % 1;
  const sobe = seg(c, 0, 0.7, easeInOut);
  const desce = seg(c, 0.7, 0.85, (x) => x * x);
  const k = sobe * (1 - desce);
  const golpe = (Math.floor(t * ritmo + fase - 0.85) + 0.85 - fase) / ritmo;
  return { arms: { rsx: lerp(0.7, 2.8, k), lsx: lerp(0.6, 2.6, k), rel: -0.3, lel: -0.4, rsz: 0.05, lsz: 0.25, lean: lerp(0.25, -0.05, k), hp: lerp(0.15, -0.1, k) }, golpe };
};

// Mineiro cavando a parede da direita (x ≈ 2.4).
// Cava um monte de pedras na frente dele (rosto virado para a câmera).
const Cavador = ({ t, x, z, ry = -0.55, fase, look, face, seed }: { t: number; x: number; z: number; ry?: number; fase: number; look: typeof TONHAO; face: ReturnType<typeof faceAt>; seed: number }) => {
  const { arms, golpe } = cava(t, fase);
  const m: V3 = [x + Math.sin(ry) * 0.85, 0, z + Math.cos(ry) * 0.85];
  return (
    <>
      <Character pose={P({ x, z, ry, ...arms })} face={face} look={look} right={<Picareta />} />
      <Monte position={m} seed={seed} />
      <Puff t={t} at={golpe} position={[m[0], 0.35, m[2]]} color="#d9a06a" n={5} size={0.22} key={seed} />
    </>
  );
};

// ---------- Tomadas ----------

// A. "Você trabalha numa *mina*…" — GANCHO: colado na gaiola e recua até mostrar você no túnel.
const voceA = P({ x: -0.6, ry: 0.3, ...SEGURA });
const topoA = ganchoDe(voceA);
const A = ({ t, t0, t1 }: ShotProps) => {
  const face = faceAt(t, [{ at: t0, f: 'content' }, { at: W(0, 'mina'), f: 'happy' }], 1);
  return (
    <>
      <Tunel t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.revela(t0, t1, centroGaiola(topoA), [-0.35, 1.25, 0], { de: 0.55, para: 3.8, yaw: 0.35, pitch: -0.05, ate: W(0, 'mina') + 0.4 })} />
      <Character pose={voceA} face={face} look={MINEIRO} />
      <Gaiola topo={topoA} ave={{ canta: 0.5 + 0.5 * Math.sin(t * 9) }} balanco={0.04 * Math.sin(t * 2)} />
      <Cavador t={t} x={1.5} z={-3.6} fase={0.1} look={TONHAO} face={faceAt(t, [{ at: t0, f: 'tired' }], 2)} seed={1} />
      <Cavador t={t} x={1.5} z={-6.1} fase={0.55} look={TIAO} face={faceAt(t, [{ at: t0, f: 'tired' }], 3)} seed={2} />
    </>
  );
};

// B. "…todos passam o dia *cavando*." — travelling lateral pelos mineiros que cavam.
const B = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Tunel t={t} />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.lateral(t0, t1, [1.3, 1.3, -3.4], [1.3, 1.25, -6.3], { dist: 4.2, yaw: -0.3, pitch: -0.06, fov: 36 })} />
    <Cavador t={t} x={1.5} z={-3.6} fase={0.1} look={TONHAO} face={faceAt(t, [{ at: t0, f: 'tired' }, { at: W(0, 'cavando'), f: 'frustrated' }], 4)} seed={3} />
    <Cavador t={t} x={1.5} z={-6.1} fase={0.55} look={TIAO} face={faceAt(t, [{ at: t0, f: 'tired' }], 5)} seed={4} />
    <Cavador t={t} x={1.5} z={-8.0} fase={0.3} look={KAIO} face={faceAt(t, [{ at: t0, f: 'bored' }], 6)} seed={5} />
  </>
);

// C. "Mas, enquanto os outros *suam* no túnel," — câmera baixa empurrando no Tonhão suando.
const C = ({ t, t0, t1 }: ShotProps) => {
  const face = faceAt(t, [{ at: t0, f: 'tired', o: ['sweat'] }, { at: W(1, 'suam'), f: 'tired', o: ['sweat3', 'stress'] }], 7);
  return (
    <>
      <Tunel t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.empurra(t0, t1, [1.4, 1.45, -3.6], { de: 3.6, para: 2.6, yaw: -0.45, pitch: -0.1, fov: 34 })} />
      <Cavador t={t} x={1.4} z={-3.6} fase={0.1} look={TONHAO} face={face} seed={6} />
    </>
  );
};

// D. "você anda de um lado para o outro…" — você atravessa o túnel; a câmera acompanha de lado.
const passeio = (t: number) => {
  const a = W(2, 'voce'), b = W(2, 'outro');
  const ida = seg(t, a, b - 0.25, (x) => x);
  const volta = seg(t, b + 0.15, W(3, 0), (x) => x);
  const x = -1.6 + 2.6 * ida - 1.2 * volta;
  const dist = 2.6 * ida + 1.2 * volta;
  const vira = seg(t, b - 0.25, b + 0.15);
  const ry = lerp(1.05, -1.05, vira); // 3/4: anda de lado sem dar as costas para a câmera
  return P({ x, z: -0.6, ry, walk: dist / 0.24, stride: vira > 0 && vira < 1 ? 0.3 : 1, ...SEGURA });
};
const D = ({ t, t0, t1 }: ShotProps) => {
  const p = passeio(t);
  const face = faceAt(t, [{ at: t0, f: 'happy' }, { at: W(2, 'outro'), f: 'content' }], 8);
  return (
    <>
      <Tunel t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={[[t, [p.x * 0.6 + 0.2, 1.5, 4.0], [p.x * 0.85, 1.1, -0.6], 34]]} />
      <Character pose={p} face={face} look={MINEIRO} />
      <Gaiola topo={ganchoDe(p)} ave={{ canta: 0.3 }} balanco={0.12 * Math.sin(p.walk * Math.PI)} />
      <Cavador t={t} x={1.5} z={-3.6} fase={0.1} look={TONHAO} face={faceAt(t, [{ at: t0, f: 'tired' }], 9)} seed={7} />
    </>
  );
};

// E. "…com uma *gaiola* na mão," — insert: aproximação na gaiola balançando.
const voceE = P({ x: -0.3, z: -0.6, ry: -0.2, ...SEGURA });
const topoE = ganchoDe(voceE);
const E = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Tunel t={t} />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.empurra(t0, t1, centroGaiola(topoE), { de: 1.5, para: 1.0, yaw: -0.5, pitch: 0.08, fov: 34 })} />
    <Character pose={voceE} face={faceAt(t, [{ at: t0, f: 'content' }], 10)} look={MINEIRO} />
    <Gaiola topo={topoE} ave={{ canta: 0.2 }} balanco={0.08 * Math.sin(t * 3.2)} />
  </>
);

// F. "assobiando para um *passarinho*." — órbita: você assobia, o passarinho canta de volta.
const voceF = P({ x: -0.4, z: -0.6, ry: -0.35, hy: -0.3, hp: 0.05, ...SEGURA, rsx: 1.35, rel: 0.95 });
const topoF = ganchoDe(voceF);
const F_ = ({ t, t0, t1 }: ShotProps) => {
  const face = faceAt(t, [{ at: t0, f: 'content' }, { at: W(2, 'passarinho'), f: 'closedSmile', o: ['blush'] }], 11);
  const ave: AveEstado = { canta: t > W(2, 'passarinho') - 0.2 ? 0.5 + 0.5 * Math.sin(t * 12) : 0.15, ry: 0.6 };
  return (
    <>
      <Tunel t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.orbita(t0, t1, [-0.55, 1.15, -0.4], { dist: 2.9, yaw0: -0.5, yaw1: 0.35, pitch: 0.02 })} />
      <Character pose={voceF} face={face} look={MINEIRO} />
      <Gaiola topo={topoF} ave={ave} />
      <Notas t={t} position={[-0.75, 1.65, -0.2]} />
      <Notas t={t + 0.5} position={[topoF[0], topoF[1] - 0.15, topoF[2] + 0.1]} forca={t > W(2, 'passarinho') - 0.2 ? 1 : 0} size={0.12} />
    </>
  );
};

// O chefe fica no fundo do túnel; você mais na frente.
const chefeBase = P({ x: 1.0, z: -3.0, ry: -0.35 });
const voceG = P({ x: -0.6, z: -0.2, ry: 0.2, hy: 0.2, ...SEGURA, rsx: 1.35, rel: 0.95 });

// G. "O *chefe* vê aquilo" — travelling lateral de você até o chefe que aparece no fundo.
const G_ = ({ t, t0, t1 }: ShotProps) => {
  const chefe = track(t, chefeBase, [{ at: W(3, 'aquilo'), v: { hp: 0.12, lean: 0.08 } }]);
  return (
    <>
      <Tunel t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.lateral(t0, t1, [-0.6, 1.3, -0.2], [0.9, 1.55, -3.0], { dist: 4.6, dist1: 3.6, yaw: 0.15, pitch: -0.05 })} />
      <Character pose={voceG} face={faceAt(t, [{ at: t0, f: 'content' }], 12)} look={MINEIRO} />
      <Gaiola topo={ganchoDe(voceG)} ave={{ canta: 0.5 + 0.5 * Math.sin(t * 12) }} />
      <Notas t={t} position={[-0.6, 1.75, 0.1]} />
      <Character pose={chefe} face={faceAt(t, [{ at: t0, f: 'suspicious' }, { at: W(3, 'aquilo'), f: 'annoyed' }], 13)} look={CHEFE} />
    </>
  );
};

// H. "e perde a *paciência*." — IMPACTO: tranco rápido no rosto do chefe + linhas de velocidade + giro.
const H = ({ t, t0, t1 }: ShotProps) => {
  const pac = W(3, 'paciencia');
  const chefe = track(t, P({ ...chefeBase, hp: 0.05 }), [{ at: pac, v: { lsz: 0.5, rsz: 0.5, lel: -1.4, rel: -1.4, lsx: 0.6, rsx: 0.6, squash: 0.15, hp: -0.08 } }]);
  return (
    <>
      <Tunel t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.impacto(t0, pac, t1, [1.0, 1.4, -3.0], { de: 4.2, para: 2.3, yaw: -0.3, pitch: -0.1, giro: 0.16, alvo1: [1.0, 1.65, -3.0] })} />
      <Character pose={chefe} face={faceAt(t, [{ at: t0, f: 'annoyed' }, { at: pac, f: 'furious', o: ['vein'] }], 14)} look={CHEFE} />
      <Comic t={t} at={pac} text="GRRR!" position={[0.95, 2.45, -2.8]} size={0.26} fill="#ff5a3a" hold={0.9} />
    </>
  );
};

// I. "Para ele, você não está fazendo *nada*." — por cima do ombro do chefe, que aponta para você.
const I = ({ t, t0, t1 }: ShotProps) => {
  const voce = W(4, 'voce'), nada = W(4, 'nada');
  const chefe = track(t, P({ ...chefeBase, ry: -0.45 }), [{ at: voce, v: { rsx: 1.45, rsz: 0.15, rel: -0.05, lean: 0.1 } }]);
  const vc = track(t, P({ ...voceG, ry: Math.PI - 0.55, hy: 0.1 }), [{ at: nada, v: { hy: 0.3, hr: 0.18, lsz: 0.7, lel: -0.8 } }]);
  return (
    <>
      <Tunel t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.empurra(t0, t1, [-0.4, 1.35, -0.3], { de: 6.0, para: 5.2, yaw: Math.PI - 0.72, pitch: 0.1, fov: 30 })} />
      <Character pose={chefe} face={faceAt(t, [{ at: t0, f: 'furious' }], 15)} look={CHEFE} />
      <Character pose={vc} face={faceAt(t, [{ at: t0, f: 'content' }, { at: nada, f: 'confused' }], 16)} look={MINEIRO} />
      <Gaiola topo={ganchoDe(vc)} ave={{ canta: 0.1 }} />
    </>
  );
};

// J. "Só que o *pássaro* está ali por um *motivo*." — close extremo do passarinho, aproximação lenta.
const voceJ = P({ x: -0.5, z: -0.4, ry: 0.15, ...SEGURA, rsx: 1.4, rel: 0.95 });
const topoJ = ganchoDe(voceJ);
const J = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Tunel t={t} />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.empurra(t0, t1, [topoJ[0], topoJ[1] - 0.4, topoJ[2]], { de: 1.2, para: 0.7, yaw: 0.25, pitch: 0.05, fov: 34 })} />
    <Character pose={voceJ} face={faceAt(t, [{ at: t0, f: 'content' }], 17)} look={MINEIRO} />
    <Gaiola topo={topoJ} ave={{ canta: t > W(5, 'motivo') ? 0.4 + 0.4 * Math.sin(t * 10) : 0.1, ry: 0.2 }} />
    <Sparkles t={t} from={W(5, 'motivo')} n={7} radius={0.3} center={[topoJ[0], topoJ[1] - 0.35, topoJ[2] + 0.05]} size={0.07} />
  </>
);

// K. "Ele percebe o *perigo* antes dos homens." — CORTE da mina (diagrama): o gás vaza da rocha;
// o passarinho (à esquerda) sente primeiro; os homens (à direita) continuam cavando.
const K = ({ t, t0, t1 }: ShotProps) => {
  const per = W(6, 'perigo');
  const mal = seg(t, W(6, 'antes'), W(6, 'homens'));
  const voce = P({ x: -1.7, z: -0.9, ry: 0.5, ...SEGURA, rsx: 1.35, rel: 0.9 });
  return (
    <>
      <Corte t={t} clima={t < per ? 'mina' : 'perigo'} lamp={t < per ? 1 : 0.7} />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.empurra(t0, t1, [0, 1.5, -1], { de: 9.5, para: 8.4, pitch: 0.06, fov: 38 })} />
      <Character pose={voce} face={faceAt(t, [{ at: t0, f: 'content' }, { at: W(6, 'antes'), f: 'curious' }], 18)} look={MINEIRO} />
      <Gaiola topo={ganchoDe(voce)} ave={{ mal, canta: 0.2 * (1 - mal) }} escala={1.3} />
      <Character pose={P({ x: 0.9, z: -0.9, ry: Math.PI / 2 + 0.3, ...cava(t, 0.2).arms })} face={faceAt(t, [{ at: t0, f: 'tired' }], 19)} look={TONHAO} right={<Picareta />} />
      <Character pose={P({ x: 1.9, z: -1.1, ry: Math.PI / 2 + 0.3, ...cava(t, 0.6).arms })} face={faceAt(t, [{ at: t0, f: 'tired' }], 20)} look={TIAO} right={<Picareta />} />
      <Gas t={t} from={per - 0.3} center={[3.0, 1.4, -1.2]} area={[1.4, 1.8, 1.0]} n={26} avanca={0} />
      <Gas t={t} from={per + 0.4} center={[0.6, 1.6, -1.2]} area={[3.4, 1.4, 1.0]} n={22} avanca={0} />
    </>
  );
};

// L. "Quando começa a passar *mal*" — luz azul de perigo; o passarinho murcha; câmera empurra com giro leve.
const voceL = P({ x: -0.5, z: -0.4, ry: 0.15, ...SEGURA, rsx: 1.4, rel: 0.95, hp: 0.2 });
const topoL = ganchoDe(voceL);
const L = ({ t, t0, t1 }: ShotProps) => {
  const mal = seg(t, t0, W(7, 'mal'));
  return (
    <>
      <Tunel t={t} clima="perigo" lamp={0.75} perigo />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.empurra(t0, t1, [topoL[0], topoL[1] - 0.38, topoL[2]], { de: 1.6, para: 1.05, yaw: 0.3, pitch: 0.1, fov: 34, giro: 0.08 })} />
      <Character pose={voceL} face={faceAt(t, [{ at: t0, f: 'curious' }, { at: W(7, 'mal'), f: 'worried' }], 21)} look={MINEIRO} />
      <Gaiola topo={topoL} ave={{ mal, canta: 0.2 * (1 - mal) }} />
      <Gas t={t} from={t0 - 1} center={[0.6, 1.2, -4]} area={[4, 1.6, 4]} n={20} avanca={0.5} />
    </>
  );
};

// M. "e para de *cantar*," — QUEDA: o passarinho cai do poleiro e a câmera tomba junto.
const M = ({ t, t0, t1 }: ShotProps) => {
  const cantar = W(7, 'cantar');
  const caido = seg(t, cantar - 6 * F, cantar, (x) => x * x);
  const c = centroGaiola(topoL);
  return (
    <>
      <Tunel t={t} clima="perigo" lamp={0.6} perigo />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.queda(t0, cantar - 0.1, t1, [c[0], c[1] + 0.05, c[2]], [c[0], c[1] - 0.15, c[2]], { dist: 1.0, dist1: 0.75, yaw: 0.3, pitch: 0.12, giro: 0.2 })} />
      <Character pose={voceL} face={faceAt(t, [{ at: t0, f: 'worried' }, { at: cantar, f: 'shocked' }], 22)} look={MINEIRO} />
      <Gaiola topo={topoL} ave={{ mal: 1, caido, olho: 1 - caido }} />
      <Notas t={t} position={[topoL[0] + 0.1, topoL[1] - 0.2, topoL[2] + 0.1]} forca={1 - seg(t, t0, cantar - 0.2)} size={0.1} />
      <Gas t={t} from={t0 - 2} center={[0.6, 1.2, -3]} area={[4, 1.6, 4]} n={20} avanca={0.5} />
    </>
  );
};

// N. "você entende o *aviso*:" — IMPACTO no seu rosto + linhas de velocidade.
const N = ({ t, t0, t1 }: ShotProps) => {
  const av = W(8, 'aviso');
  const vc = track(t, P({ ...voceL, hp: 0.15 }), [{ at: av, v: { hp: -0.12, lean: -0.12, lsz: 0.9, lel: -0.6 } }]);
  return (
    <>
      <Tunel t={t} clima="perigo" lamp={0.55} perigo />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.impacto(t0, av, t1, [-0.5, 1.5, -0.4], { de: 3.6, para: 2.0, yaw: 0.15, pitch: -0.05, giro: -0.12, alvo1: [-0.5, 1.62, -0.4] })} />
      <Character pose={vc} face={faceAt(t, [{ at: t0, f: 'worried' }, { at: av, f: 'shocked', o: ['sweat'] }], 23)} look={MINEIRO} />
      <Gaiola topo={ganchoDe(vc)} ave={{ mal: 1, caido: 1, olho: 0 }} />
      <Comic t={t} at={av} text="!" position={[-0.1, 2.35, -0.3]} size={0.3} fill="#ff4a3a" hold={1.2} />
    </>
  );
};

// O. "há *gás* no túnel." — o túnel fica VERDE, as lamparinas apagam, o gás vem na direção da câmera; câmera recua.
const O = ({ t, t0, t1 }: ShotProps) => {
  const gas = W(8, 'gas');
  const lamp = 1 - 0.85 * seg(t, gas, t1);
  return (
    <>
      <Tunel t={t} clima={t < gas - 3 * F ? 'perigo' : 'gas'} lamp={lamp} perigo />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.recua(t0, t1, [0.3, 1.4, -8], { de: 7, para: 10, pitch: 0.04, fov: 36 })} />
      <Gas t={t} from={gas - 0.6} center={[0, 1.2, -11]} area={[4.2, 2.2, 8]} n={50} avanca={2.4} />
      <Character pose={P({ x: 1.5, z: -9.5, ry: 0.3, lean: 0.3, hp: 0.3, rsx: 1.1, rel: 1.6 })} face={faceAt(t, [{ at: t0, f: 'sick' }], 24)} look={KAIO} />
      <Character pose={P({ x: -1.2, z: -11.5, ry: -0.2, lean: 0.35, hp: 0.25, lsx: 0.8, lel: -1.6 })} face={faceAt(t, [{ at: t0, f: 'dizzy' }], 25)} look={TIAO} />
    </>
  );
};

// P1. "Então *manda* todos…" — você grita com os braços para cima; câmera baixa.
const P1 = ({ t, t0, t1 }: ShotProps) => {
  const manda = W(9, 'manda');
  const vc = track(t, P({ x: -0.3, z: -0.4, ry: 0.1 }), [{ at: manda, v: { lsz: 2.6, rsz: 2.4, lel: 0.3, rel: 0.3, hp: -0.15 } }]);
  return (
    <>
      <Tunel t={t} clima="gas" lamp={0.2} perigo />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.empurra(t0, t1, [-0.3, 1.45, -0.4], { de: 4.4, para: 3.4, pitch: -0.18, fov: 36 })} />
      <Character pose={vc} face={faceAt(t, [{ at: t0, f: 'shocked' }, { at: manda, f: 'panic', o: ['sweat3'] }], 26)} look={MINEIRO} />
      <Comic t={t} at={manda} text="SAIAM!" position={[-0.3, 2.55, -0.2]} size={0.42} fill="#ffd23a" hold={0.8} />
      <Gas t={t} from={t0 - 2} center={[0.4, 1.3, -5]} area={[4.4, 2.0, 6]} n={30} avanca={1.5} />
    </>
  );
};

// P2. "…*saírem* depressa." — lá fora, de dia: os mineiros saem correndo da boca da mina.
const corredor = (t: number, t0: number, x: number, atraso: number) => {
  const d = Math.max(0, t - t0 - atraso) * 4.2;
  return P({ x, z: -2.6 + d, ry: 0, walk: d / 0.24, stride: 1, lean: 0.25, lsx: 0.9, rsx: -0.5, lel: -1.2, rel: -1.2 });
};
const P2 = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Entrada />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.recua(t0, t1 + 0.8, [0, 1.6, -1.5], { de: 7.5, para: 9.5, pitch: 0.06, fov: 34 })} />
    <Character pose={corredor(t, t0, -0.7, 0)} face={faceAt(t, [{ at: t0, f: 'panic', o: ['sweat'] }], 27)} look={TONHAO} />
    <Character pose={corredor(t, t0, 0.7, 0.15)} face={faceAt(t, [{ at: t0, f: 'scared' }], 28)} look={TIAO} />
    <Character pose={corredor(t, t0, 0, 0.32)} face={faceAt(t, [{ at: t0, f: 'terrified' }], 29)} look={KAIO} />
    <Puff t={t} at={t0 + 0.25} position={[-0.6, 0.15, -1.2]} n={6} />
    <Puff t={t} at={t0 + 0.45} position={[0.6, 0.15, -1.0]} n={6} />
    <Gas t={t} from={t0} center={[0, 1.4, -2.2]} area={[2.4, 1.6, 0.6]} n={14} avanca={0.8} />
  </>
);

// Q. "Naquele instante, o chefe *percebe*…" — o chefe sai tossindo e se dá conta; câmera empurra no rosto.
const Q = ({ t, t0, t1 }: ShotProps) => {
  const per = W(10, 'percebe');
  const chefe = track(t, P({ x: 0.2, z: -0.6, ry: 0.15, lean: 0.25, hp: 0.25, rsx: 1.1, rel: 1.7 }), [{ at: per, v: { lean: 0, hp: -0.05, rsx: 0.1, rel: 0.15, hy: -0.35 } }]);
  return (
    <>
      <Entrada />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.empurra(t0, t1, [0.2, 1.5, -0.6], { de: 4.8, para: 3.0, yaw: -0.2, pitch: -0.05 })} />
      <Character pose={chefe} face={faceAt(t, [{ at: t0, f: 'sick', o: ['sweat'] }, { at: per, f: 'amazed' }], 30)} look={CHEFE} />
      <Gas t={t} from={t0 - 1} center={[0, 1.6, -2.4]} area={[2.2, 1.6, 0.5]} n={12} avanca={0} />
    </>
  );
};

// R. "…que você não era *preguiçoso*." — você sai com a gaiola; o chefe olha e fica sem graça (dois personagens).
const R = ({ t, t0, t1 }: ShotProps) => {
  const pr = W(10, 'preguicoso');
  const d = Math.min(1.6, Math.max(0, t - t0) * 1.6);
  const vc = P({ x: -0.9, z: -2.4 + d, ry: 0.15, walk: d / 0.24, stride: d < 1.6 ? 1 : 0, ...SEGURA });
  const chefe = track(t, P({ x: 0.75, z: 0.2, ry: -0.9, hy: -0.2 }), [{ at: pr, v: { hp: 0.2, hr: 0.1, lsz: 0.05, rsz: 0.05 } }]);
  return (
    <>
      <Entrada />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.lateral(t0, t1, [-0.6, 1.3, -1.0], [0, 1.35, -0.4], { dist: 4.6, yaw: 0.25, pitch: 0.02 })} />
      <Character pose={vc} face={faceAt(t, [{ at: t0, f: 'tired' }, { at: pr, f: 'confident' }], 31)} look={MINEIRO} />
      <Gaiola topo={ganchoDe(vc)} ave={{ mal: 0.6, olho: 0.6 }} balanco={0.08 * Math.sin(vc.walk * Math.PI)} />
      <Character pose={chefe} face={faceAt(t, [{ at: t0, f: 'amazed' }, { at: pr, f: 'worried', o: ['blush'] }], 32)} look={CHEFE} />
    </>
  );
};

// S. "Enquanto todos *cavavam*," — corte da mina (de volta ao laranja): todos cavam, você vigia a gaiola.
const S = ({ t, t0, t1 }: ShotProps) => {
  const voce = P({ x: -1.7, z: -0.9, ry: 0.5, ...SEGURA, rsx: 1.35, rel: 0.9 });
  return (
    <>
      <Corte t={t} />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.lateral(t0, t1, [1.0, 1.5, -1], [-0.6, 1.4, -1], { dist: 8.0, pitch: 0.06, fov: 38 })} />
      <Character pose={voce} face={faceAt(t, [{ at: t0, f: 'confident' }], 33)} look={MINEIRO} />
      <Gaiola topo={ganchoDe(voce)} ave={{ canta: 0.5 + 0.5 * Math.sin(t * 11) }} escala={1.3} />
      <Character pose={P({ x: 0.0, z: -0.9, ry: Math.PI / 2 + 0.3, ...cava(t, 0.2).arms })} face={faceAt(t, [{ at: t0, f: 'tired' }], 34)} look={KAIO} right={<Picareta />} />
      <Character pose={P({ x: 1.1, z: -0.9, ry: Math.PI / 2 + 0.3, ...cava(t, 0.5).arms })} face={faceAt(t, [{ at: t0, f: 'tired' }], 35)} look={TONHAO} right={<Picareta />} />
      <Character pose={P({ x: 2.2, z: -1.1, ry: Math.PI / 2 + 0.3, ...cava(t, 0.8).arms })} face={faceAt(t, [{ at: t0, f: 'tired' }], 36)} look={TIAO} right={<Picareta />} />
    </>
  );
};

// T. "você *protegia* a equipe." — lá fora: a equipe toda em volta de você; órbita de herói + brilhos.
const T = ({ t, t0, t1 }: ShotProps) => {
  const pro = W(11, 'protegia');
  const vc = track(t, P({ x: 0, z: 0.4, ...SEGURA }), [{ at: pro, v: { rsx: 2.0, rel: 0.4, rsz: 0.1, hp: -0.1 } }]);
  const topo = ganchoDe(vc);
  return (
    <>
      <Entrada />
      <Cam t={t} t0={t0} t1={t1} keys={CAM.orbita(t0, t1, [0, 1.35, 0.2], { dist: 5.2, yaw0: 0.45, yaw1: -0.2, pitch: -0.08 })} />
      <Character pose={vc} face={faceAt(t, [{ at: t0, f: 'smile' }, { at: pro, f: 'bigSmile' }], 37)} look={MINEIRO} />
      <Gaiola topo={topo} ave={{ canta: 0.3 + 0.3 * Math.sin(t * 9), mal: 0.2 }} />
      <Character pose={P({ x: -1.1, z: -0.4, ry: 0.35, hy: 0.25 })} face={faceAt(t, [{ at: t0, f: 'smile' }, { at: pro, f: 'amazed' }], 38)} look={TONHAO} />
      <Character pose={P({ x: 1.1, z: -0.3, ry: -0.35, hy: -0.25 })} face={faceAt(t, [{ at: t0, f: 'smile' }, { at: pro, f: 'happy' }], 39)} look={TIAO} />
      <Character pose={P({ x: 0.5, z: -1.4, ry: -0.1 })} face={faceAt(t, [{ at: t0, f: 'happy' }], 40)} look={KAIO} />
      <Sparkles t={t} from={pro} n={10} radius={1.0} center={[0, 1.6, 0.5]} />
    </>
  );
};

// U. "E aquele pequeno *passarinho*" — close do passarinho recuperado, cantando ao sol.
const voceU = P({ x: 0, z: 0.4, ...SEGURA, rsx: 1.5, rel: 1.0 });
const topoU = ganchoDe(voceU);
const U = ({ t, t0, t1 }: ShotProps) => (
  <>
    <Entrada />
    <Cam t={t} t0={t0} t1={t1} keys={CAM.empurra(t0, t1, [topoU[0], topoU[1] - 0.38, topoU[2]], { de: 1.6, para: 1.0, yaw: -0.3, pitch: 0.05, fov: 34 })} />
    <Character pose={voceU} face={faceAt(t, [{ at: t0, f: 'bigSmile' }], 41)} look={MINEIRO} />
    <Gaiola topo={topoU} ave={{ canta: 0.5 + 0.5 * Math.sin(t * 12) }} />
    <Notas t={t} position={[topoU[0] + 0.05, topoU[1] - 0.2, topoU[2] + 0.1]} size={0.1} />
  </>
);

// V. "podia salvar a vida de *cada* mineiro." — todos comemoram; no fim a câmera volta colada na gaiola (loop).
const V = ({ t, t0, t1 }: ShotProps) => {
  const sal = W(12, 'salvar'), cada = W(12, 'cada');
  const vivas = { lsz: 2.5, rsz: 2.5, lel: 0.3, rel: 0.3 };
  const vc = P({ x: 0, z: 0.4, ...SEGURA, rsx: 1.5, rel: 1.0 });
  const topo = ganchoDe(vc);
  const cg = centroGaiola(topo);
  const fim = W(12, 'mineiro');
  const abre = CAM.recua(t0, fim, [0, 1.4, -0.2], { de: 5.5, para: 7.0, pitch: 0.05 });
  const fecha = CAM.empurra(fim, t1, cg, { de: 6.6, para: 0.55, yaw: 0.35, pitch: -0.05, fov: 40 });
  const keys = [abre[0], abre[1], fecha[1]]; // termina colado na gaiola, como o primeiro plano (loop)
  return (
    <>
      <Entrada />
      <Cam t={t} t0={t0} t1={t1} keys={keys} />
      <Character pose={vc} face={faceAt(t, [{ at: t0, f: 'bigSmile' }], 42)} look={MINEIRO} />
      <Gaiola topo={topo} ave={{ canta: 0.5 + 0.5 * Math.sin(t * 12) }} />
      <Character pose={track(t, P({ x: -1.1, z: -0.4, ry: 0.3 }), [{ at: sal, v: vivas }])} face={faceAt(t, [{ at: t0, f: 'smile' }, { at: sal, f: 'laugh' }], 43)} look={TONHAO} />
      <Character pose={track(t, P({ x: 1.1, z: -0.3, ry: -0.3 }), [{ at: sal, v: vivas }])} face={faceAt(t, [{ at: t0, f: 'smile' }, { at: sal, f: 'bigSmile' }], 44)} look={TIAO} />
      <Character pose={track(t, P({ x: 0.5, z: -1.4, ry: -0.1 }), [{ at: cada, v: vivas }])} face={faceAt(t, [{ at: t0, f: 'happy' }, { at: cada, f: 'laugh' }], 45)} look={KAIO} />
      <Character pose={track(t, P({ x: -0.6, z: -1.6, ry: 0.2 }), [{ at: cada, v: { rsz: 1.2, rel: -1.4, rsx: 0.6 } }])} face={faceAt(t, [{ at: t0, f: 'content' }, { at: cada, f: 'happy', o: ['blush'] }], 46)} look={CHEFE} />
      <Sparkles t={t} from={cada} n={12} radius={1.6} center={[0, 1.8, -0.4]} />
    </>
  );
};

export const SHOTS: Shot[] = [
  { from: 0, name: 'A gancho gaiola', C: A },
  { from: W(0, 'todos'), name: 'B cavando', C: B },
  { from: W(1, 0), name: 'C suam', C: C },
  { from: W(2, 0), name: 'D anda', C: D },
  { from: W(2, 'com'), name: 'E gaiola', C: E },
  { from: W(2, 'assobiando'), name: 'F assobia', C: F_ },
  { from: W(3, 0), name: 'G chefe ve', C: G_ },
  { from: W(3, 'perde'), name: 'H paciencia', C: H, corte: true },
  { from: W(4, 0), name: 'I nada', C: I },
  { from: W(5, 0), name: 'J motivo', C: J },
  { from: W(6, 0), name: 'K corte perigo', C: K },
  { from: W(7, 0), name: 'L passa mal', C: L },
  { from: W(7, 'e'), name: 'M para de cantar', C: M },
  { from: W(8, 0), name: 'N aviso', C: N, corte: true },
  { from: W(8, 'ha'), name: 'O gas', C: O },
  { from: W(9, 0), name: 'P1 manda', C: P1 },
  { from: W(9, 'sairem'), name: 'P2 saem', C: P2, corte: true },
  { from: W(10, 0), name: 'Q chefe percebe', C: Q },
  { from: W(10, 'voce'), name: 'R preguicoso', C: R },
  { from: W(11, 0), name: 'S cavavam', C: S },
  { from: W(11, 'voce'), name: 'T protegia', C: T },
  { from: W(12, 0), name: 'U passarinho', C: U },
  { from: W(12, 'podia'), name: 'V cada mineiro', C: V },
];
